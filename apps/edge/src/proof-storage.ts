export type ProofContentType = "image/jpeg" | "image/png" | "image/webp";

export type ProofUploadState = "pending" | "stored" | "expired" | "deleted";

export type ProofRecord = {
  id: string;
  ownerId: string;
  objectKey: string;
  contentType: string;
  sizeBytes: number;
  sha256: string;
  uploadTokenHash: string;
  uploadExpiresAt: string;
  expiresAt: string;
  uploadState: ProofUploadState;
  createdAt: string;
  storedAt: string | null;
};

export type R2ProofObject = {
  key: string;
  size: number;
  httpEtag: string;
  customMetadata?: Record<string, string>;
  body?: ReadableStream<Uint8Array>;
  writeHttpMetadata?: (headers: Headers) => void;
};

export type R2ProofPutOptions = {
  onlyIf: { etagDoesNotMatch: "*" };
  httpMetadata: { contentType: ProofContentType; cacheControl: "private, no-store" };
  customMetadata: { proofId: string; sha256: string };
  sha256: ArrayBuffer;
};

export interface R2ProofBucket {
  put(key: string, value: ArrayBuffer, options: R2ProofPutOptions): Promise<R2ProofObject | null>;
  head(key: string): Promise<R2ProofObject | null>;
  get(key: string): Promise<R2ProofObject | null>;
  delete(key: string): Promise<void>;
}

export interface ProofRepository {
  findOwned(proofId: string, ownerId: string): Promise<ProofRecord | null>;
  /** Must be owner-scoped and idempotent: true means this proof is now stored. */
  markStored(proofId: string, ownerId: string): Promise<boolean>;
  /** Must be owner-scoped and idempotent; keeps a tombstone for owner-visible audit history. */
  markDeleted(proofId: string, ownerId: string): Promise<boolean>;
}

export type ProofStoragePolicy = {
  maxFileBytes: number;
};

export function proofRetentionDays(value: string | undefined): number | null {
  if (!value || !/^[1-9]\d{0,4}$/.test(value)) return null;
  const days = Number(value);
  return Number.isSafeInteger(days) && days <= 36_500 ? days : null;
}

export function proofStorageAvailable(config: {
  enabled?: string | undefined;
  cleanupReady?: string | undefined;
  retentionDays?: string | undefined;
  bucket?: R2ProofBucket | undefined;
}): boolean {
  return config.enabled === "1" && config.cleanupReady === "1" &&
    proofRetentionDays(config.retentionDays) !== null && Boolean(config.bucket);
}

export type ProofUploadResult =
  | { ok: true; state: "uploaded" | "already_uploaded" }
  | { ok: false; reason: "not_found" | "expired" | "invalid" | "forbidden" | "conflict" | "unavailable" };

export type ProofCompletionResult =
  | { ok: true; state: "stored" | "already_stored" }
  | { ok: false; reason: "not_found" | "expired" | "invalid" | "conflict" | "unavailable" };

export type ProofDeleteResult =
  | { ok: true; state: "deleted" | "already_deleted" }
  | { ok: false; reason: "not_found" | "unavailable" };

export type ProofReadResult =
  | { ok: true; contentType: ProofContentType; sizeBytes: number; body: ReadableStream<Uint8Array> }
  | { ok: false; reason: "not_found" | "expired" | "unavailable" };

const SHA256_HEX = /^[a-f0-9]{64}$/;
const TOKEN_HEX_LENGTH = 64;
const CONTENT_TYPES = new Set<ProofContentType>(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_EDGE = 12_000;
const MAX_IMAGE_PIXELS = 40_000_000;

export function createProofObjectKey(): string {
  return `proofs/${crypto.randomUUID()}/${crypto.randomUUID()}`;
}

export async function createProofUploadCapability(): Promise<{ token: string; tokenHash: string }> {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  const token = btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
  return { token, tokenHash: await sha256Hex(new TextEncoder().encode(token)) };
}

export async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const ownedBytes = new Uint8Array(bytes.byteLength);
  ownedBytes.set(bytes);
  const digest = await crypto.subtle.digest("SHA-256", ownedBytes.buffer);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function constantTimeHexEqual(left: string, right: string): boolean {
  if (left.length !== TOKEN_HEX_LENGTH || right.length !== TOKEN_HEX_LENGTH) return false;
  let difference = 0;
  for (let index = 0; index < TOKEN_HEX_LENGTH; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

function isProofContentType(value: string): value is ProofContentType {
  return CONTENT_TYPES.has(value as ProofContentType);
}

export function sniffProofContentType(bytes: Uint8Array): ProofContentType | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

type ImageDimensions = { width: number; height: number };

function readPngDimensions(bytes: Uint8Array): ImageDimensions | null {
  if (bytes.length < 33) return null;
  let offset = 8;
  let dimensions: ImageDimensions | null = null;
  let ended = false;
  while (offset + 12 <= bytes.length) {
    const chunkLength = bytes[offset]! * 0x1000000 + (bytes[offset + 1]! << 16) +
      (bytes[offset + 2]! << 8) + bytes[offset + 3]!;
    if (chunkLength > bytes.length - offset - 12) return null;
    const chunkType = String.fromCharCode(...bytes.subarray(offset + 4, offset + 8));
    if (chunkType === "IHDR") {
      if (offset !== 8 || chunkLength !== 13 || dimensions) return null;
      const width = bytes[offset + 8]! * 0x1000000 + (bytes[offset + 9]! << 16) +
        (bytes[offset + 10]! << 8) + bytes[offset + 11]!;
      const height = bytes[offset + 12]! * 0x1000000 + (bytes[offset + 13]! << 16) +
        (bytes[offset + 14]! << 8) + bytes[offset + 15]!;
      dimensions = { width, height };
    }
    // PNG text and EXIF chunks can carry personal metadata. The browser upload
    // path re-encodes images without metadata; reject bypass clients that keep it.
    if (["eXIf", "tEXt", "zTXt", "iTXt"].includes(chunkType)) return null;
    offset += chunkLength + 12;
    if (chunkType === "IEND") {
      ended = true;
      break;
    }
  }
  return ended && offset === bytes.length ? dimensions : null;
}

function readJpegDimensions(bytes: Uint8Array): ImageDimensions | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  const startOfFrame = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  let offset = 2;
  let dimensions: ImageDimensions | null = null;
  while (offset < bytes.length) {
    if (bytes[offset] !== 0xff) return null;
    while (bytes[offset] === 0xff) offset += 1;
    const marker = bytes[offset++];
    if (marker === undefined || marker === 0x00) return null;
    if (marker === 0xd9 || marker === 0xda) return dimensions;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset + 2 > bytes.length) return null;
    const segmentLength = (bytes[offset]! << 8) | bytes[offset + 1]!;
    if (segmentLength < 2 || segmentLength > bytes.length - offset) return null;
    if ([0xe1, 0xed, 0xfe].includes(marker)) return null;
    if (startOfFrame.has(marker)) {
      if (segmentLength < 7) return null;
      const height = (bytes[offset + 3]! << 8) | bytes[offset + 4]!;
      const width = (bytes[offset + 5]! << 8) | bytes[offset + 6]!;
      dimensions = { width, height };
    }
    offset += segmentLength;
  }
  return null;
}

function readWebpDimensions(bytes: Uint8Array): ImageDimensions | null {
  if (bytes.length < 20 || String.fromCharCode(...bytes.subarray(0, 4)) !== "RIFF" ||
      String.fromCharCode(...bytes.subarray(8, 12)) !== "WEBP") return null;
  const riffSize = bytes[4]! + (bytes[5]! << 8) + (bytes[6]! << 16) + bytes[7]! * 0x1000000;
  if (riffSize !== bytes.length - 8) return null;
  let offset = 12;
  let dimensions: ImageDimensions | null = null;
  let hasImagePayload = false;
  while (offset + 8 <= bytes.length) {
    const chunkType = String.fromCharCode(...bytes.subarray(offset, offset + 4));
    const chunkLength = bytes[offset + 4]! + (bytes[offset + 5]! << 8) +
      (bytes[offset + 6]! << 16) + bytes[offset + 7]! * 0x1000000;
    const dataStart = offset + 8;
    if (chunkLength > bytes.length - dataStart) return null;
    if (chunkType === "EXIF" || chunkType === "XMP ") return null;
    if (chunkType === "ANIM" || chunkType === "ANMF") return null;
    if (chunkType === "VP8X") {
      if (chunkLength < 10 || (bytes[dataStart]! & 0x02) !== 0) return null;
      const width = 1 + bytes[dataStart + 4]! + (bytes[dataStart + 5]! << 8) + (bytes[dataStart + 6]! << 16);
      const height = 1 + bytes[dataStart + 7]! + (bytes[dataStart + 8]! << 8) + (bytes[dataStart + 9]! << 16);
      dimensions = { width, height };
    } else if (chunkType === "VP8 ") {
      if (chunkLength < 10 || bytes[dataStart + 3] !== 0x9d || bytes[dataStart + 4] !== 0x01 || bytes[dataStart + 5] !== 0x2a) return null;
      const width = ((bytes[dataStart + 6]! | (bytes[dataStart + 7]! << 8)) & 0x3fff);
      const height = ((bytes[dataStart + 8]! | (bytes[dataStart + 9]! << 8)) & 0x3fff);
      dimensions ??= { width, height };
      hasImagePayload = true;
    } else if (chunkType === "VP8L") {
      if (chunkLength < 5 || bytes[dataStart] !== 0x2f) return null;
      const width = 1 + bytes[dataStart + 1]! + ((bytes[dataStart + 2]! & 0x3f) << 8);
      const height = 1 + ((bytes[dataStart + 2]! >> 6) | (bytes[dataStart + 3]! << 2) | ((bytes[dataStart + 4]! & 0x0f) << 10));
      dimensions ??= { width, height };
      hasImagePayload = true;
    }
    offset = dataStart + chunkLength + (chunkLength % 2);
  }
  return offset === bytes.length && hasImagePayload ? dimensions : null;
}

export function validProofImage(bytes: Uint8Array, contentType: ProofContentType): boolean {
  const dimensions = contentType === "image/png" ? readPngDimensions(bytes)
    : contentType === "image/jpeg" ? readJpegDimensions(bytes)
      : readWebpDimensions(bytes);
  return Boolean(
    dimensions &&
    dimensions.width > 0 && dimensions.height > 0 &&
    dimensions.width <= MAX_IMAGE_EDGE && dimensions.height <= MAX_IMAGE_EDGE &&
    dimensions.width * dimensions.height <= MAX_IMAGE_PIXELS,
  );
}

async function readBoundedBody(
  body: ReadableStream<Uint8Array> | null,
  maxBytes: number,
  expectedBytes: number,
): Promise<Uint8Array | null> {
  if (!body) return null;
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      size += result.value.byteLength;
      if (size > maxBytes || size > expectedBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(result.value);
    }
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
  if (size !== expectedBytes) return null;
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

function objectMatchesIntent(object: R2ProofObject | null, proof: ProofRecord): boolean {
  return Boolean(
    object &&
    object.key === proof.objectKey &&
    object.size === proof.sizeBytes &&
    object.customMetadata?.proofId === proof.id &&
    object.customMetadata.sha256 === proof.sha256,
  );
}

function liveIntent(proof: ProofRecord, now: Date): boolean {
  const expiry = Date.parse(proof.uploadExpiresAt);
  return Number.isFinite(expiry) && expiry > now.getTime();
}

function proofIntentValid(proof: ProofRecord, policy: ProofStoragePolicy): boolean {
  return Boolean(
    isProofContentType(proof.contentType) &&
    SHA256_HEX.test(proof.sha256) &&
    Number.isSafeInteger(proof.sizeBytes) &&
    proof.sizeBytes > 0 &&
    Number.isSafeInteger(policy.maxFileBytes) &&
    policy.maxFileBytes > 0 &&
    proof.sizeBytes <= policy.maxFileBytes,
  );
}

function validCapability(token: string): boolean {
  return token.length === 43 && /^[A-Za-z0-9_-]+$/.test(token);
}

export async function uploadOwnedProofContent(input: {
  actorId: string;
  proofId: string;
  uploadToken: string;
  declaredContentType: string;
  body: ReadableStream<Uint8Array> | null;
  policy: ProofStoragePolicy;
  repository: ProofRepository;
  bucket: R2ProofBucket | null;
  now?: Date;
}): Promise<ProofUploadResult> {
  let proof: ProofRecord | null;
  try {
    proof = await input.repository.findOwned(input.proofId, input.actorId);
  } catch {
    return { ok: false, reason: "unavailable" };
  }
  if (!proof || proof.ownerId !== input.actorId) return { ok: false, reason: "not_found" };
  if (!input.bucket) return { ok: false, reason: "unavailable" };

  const now = input.now ?? new Date();
  if (!liveIntent(proof, now)) return { ok: false, reason: "expired" };
  if (!proofIntentValid(proof, input.policy) || input.declaredContentType !== proof.contentType) {
    return { ok: false, reason: "invalid" };
  }
  if (!validCapability(input.uploadToken)) return { ok: false, reason: "forbidden" };
  const tokenHash = await sha256Hex(new TextEncoder().encode(input.uploadToken));
  if (!constantTimeHexEqual(tokenHash, proof.uploadTokenHash)) return { ok: false, reason: "forbidden" };

  try {
    if (proof.uploadState === "stored") {
      const existing = await input.bucket.head(proof.objectKey);
      if (!objectMatchesIntent(existing, proof)) return { ok: false, reason: "conflict" };
      return { ok: true, state: "already_uploaded" };
    }
    if (proof.uploadState !== "pending") return { ok: false, reason: "invalid" };

    const bytes = await readBoundedBody(input.body, input.policy.maxFileBytes, proof.sizeBytes);
    if (!bytes || !liveIntent(proof, input.now ?? new Date())) return { ok: false, reason: "invalid" };
    if (sniffProofContentType(bytes) !== proof.contentType || !validProofImage(bytes, proof.contentType)) {
      return { ok: false, reason: "invalid" };
    }
    const contentHash = await sha256Hex(bytes);
    if (!constantTimeHexEqual(contentHash, proof.sha256)) return { ok: false, reason: "invalid" };

    const ownedBytes = new Uint8Array(bytes.byteLength);
    ownedBytes.set(bytes);
    const checksum = new Uint8Array(await crypto.subtle.digest("SHA-256", ownedBytes.buffer));
    const result = await input.bucket.put(proof.objectKey, ownedBytes.buffer, {
      onlyIf: { etagDoesNotMatch: "*" },
      httpMetadata: { contentType: proof.contentType, cacheControl: "private, no-store" },
      customMetadata: { proofId: proof.id, sha256: contentHash },
      sha256: checksum.buffer,
    });

    if (result === null) {
      const existing = await input.bucket.head(proof.objectKey);
      if (!objectMatchesIntent(existing, proof)) return { ok: false, reason: "conflict" };
      return { ok: true, state: "already_uploaded" };
    }
    if (result.key !== proof.objectKey || result.size !== proof.sizeBytes) {
      return { ok: false, reason: "unavailable" };
    }
    // A delete may tombstone this proof while the R2 write is in flight. Re-read
    // the owner-scoped record after the put so a late upload cannot leave an
    // object behind after the delete path has already cleaned up.
    const current = await input.repository.findOwned(input.proofId, input.actorId);
    if (!current || current.uploadState === "deleted" || current.ownerId !== input.actorId) {
      await input.bucket.delete(proof.objectKey);
      return { ok: false, reason: "not_found" };
    }
    if (current.uploadState === "pending" && !liveIntent(current, input.now ?? new Date())) {
      await input.bucket.delete(proof.objectKey);
      return { ok: false, reason: "expired" };
    }
    if (current.uploadState === "stored") return { ok: true, state: "already_uploaded" };
    return { ok: true, state: "uploaded" };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}

export async function completeOwnedProofUpload(input: {
  actorId: string;
  proofId: string;
  policy: ProofStoragePolicy;
  repository: ProofRepository;
  bucket: R2ProofBucket | null;
  now?: Date;
}): Promise<ProofCompletionResult> {
  let proof: ProofRecord | null;
  try {
    proof = await input.repository.findOwned(input.proofId, input.actorId);
  } catch {
    return { ok: false, reason: "unavailable" };
  }
  if (!proof || proof.ownerId !== input.actorId) return { ok: false, reason: "not_found" };
  if (!input.bucket) return { ok: false, reason: "unavailable" };
  if (!proofIntentValid(proof, input.policy)) return { ok: false, reason: "invalid" };

  const now = input.now ?? new Date();
  if (proof.uploadState === "deleted") return { ok: false, reason: "not_found" };
  const expiresAt = Date.parse(proof.expiresAt);
  if (!Number.isFinite(expiresAt) || expiresAt <= now.getTime()) return { ok: false, reason: "expired" };
  if (proof.uploadState === "stored") {
    try {
      const existing = await input.bucket.head(proof.objectKey);
      return objectMatchesIntent(existing, proof)
        ? { ok: true, state: "already_stored" }
        : { ok: false, reason: "conflict" };
    } catch {
      return { ok: false, reason: "unavailable" };
    }
  }
  if (!liveIntent(proof, now)) return { ok: false, reason: "expired" };

  try {
    const object = await input.bucket.get(proof.objectKey);
    if (!objectMatchesIntent(object, proof) || !object?.body) {
      return { ok: false, reason: object ? "conflict" : "invalid" };
    }
    const bytes = await readBoundedBody(object.body, input.policy.maxFileBytes, proof.sizeBytes);
    if (!bytes || sniffProofContentType(bytes) !== proof.contentType || !validProofImage(bytes, proof.contentType)) {
      return { ok: false, reason: "invalid" };
    }
    const contentHash = await sha256Hex(bytes);
    if (!constantTimeHexEqual(contentHash, proof.sha256)) return { ok: false, reason: "invalid" };
    if (!liveIntent(proof, input.now ?? new Date())) return { ok: false, reason: "expired" };
    if (!(await input.repository.markStored(proof.id, input.actorId))) {
      return { ok: false, reason: "unavailable" };
    }
    return { ok: true, state: "stored" };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}

export async function deleteOwnedProof(input: {
  actorId: string;
  proofId: string;
  repository: ProofRepository;
  bucket: R2ProofBucket | null;
  now?: Date;
}): Promise<ProofDeleteResult> {
  let proof: ProofRecord | null;
  try {
    proof = await input.repository.findOwned(input.proofId, input.actorId);
  } catch {
    return { ok: false, reason: "unavailable" };
  }
  if (!proof || proof.ownerId !== input.actorId) return { ok: false, reason: "not_found" };
  if (!input.bucket) return { ok: false, reason: "unavailable" };
  try {
    if (proof.uploadState !== "deleted" && !(await input.repository.markDeleted(proof.id, input.actorId))) {
      return { ok: false, reason: "unavailable" };
    }
    // Tombstone first, then delete. If R2 is temporarily unavailable, a retry
    // sees the tombstone and repeats this idempotent physical delete.
    await input.bucket.delete(proof.objectKey);
    return { ok: true, state: proof.uploadState === "deleted" ? "already_deleted" : "deleted" };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}

export async function readOwnedProof(input: {
  actorId: string;
  proofId: string;
  repository: ProofRepository;
  bucket: R2ProofBucket | null;
  now?: Date;
}): Promise<ProofReadResult> {
  let proof: ProofRecord | null;
  try {
    proof = await input.repository.findOwned(input.proofId, input.actorId);
  } catch {
    return { ok: false, reason: "unavailable" };
  }
  if (!proof || proof.ownerId !== input.actorId || proof.uploadState !== "stored") {
    return { ok: false, reason: "not_found" };
  }
  if (!input.bucket) return { ok: false, reason: "unavailable" };
  const expiresAt = Date.parse(proof.expiresAt);
  if (!Number.isFinite(expiresAt) || expiresAt <= (input.now ?? new Date()).getTime()) {
    return { ok: false, reason: "expired" };
  }
  if (!isProofContentType(proof.contentType) || !SHA256_HEX.test(proof.sha256)) {
    return { ok: false, reason: "unavailable" };
  }
  try {
    const object = await input.bucket.get(proof.objectKey);
    if (
      !objectMatchesIntent(object, proof) ||
      !object?.body ||
      object.customMetadata?.sha256 !== proof.sha256
    ) {
      return { ok: false, reason: "unavailable" };
    }
    return { ok: true, contentType: proof.contentType, sizeBytes: proof.sizeBytes, body: object.body };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}
