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
}

export interface ProofRepository {
  findOwned(proofId: string, ownerId: string): Promise<ProofRecord | null>;
  /** Must be owner-scoped and idempotent: true means this proof is now stored. */
  markStored(proofId: string, ownerId: string, storedAt: string): Promise<boolean>;
}

export type ProofStoragePolicy = {
  maxFileBytes: number;
};

export type ProofUploadResult =
  | { ok: true; state: "stored" | "already_stored" }
  | { ok: false; reason: "not_found" | "expired" | "invalid" | "forbidden" | "conflict" | "unavailable" };

export type ProofReadResult =
  | { ok: true; contentType: ProofContentType; sizeBytes: number; body: ReadableStream<Uint8Array> }
  | { ok: false; reason: "not_found" | "expired" | "unavailable" };

const SHA256_HEX = /^[a-f0-9]{64}$/;
const TOKEN_HEX_LENGTH = 64;
const CONTENT_TYPES = new Set<ProofContentType>(["image/jpeg", "image/png", "image/webp"]);

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

async function finalizeStoredProof(
  repository: ProofRepository,
  proof: ProofRecord,
  ownerId: string,
  now: Date,
): Promise<ProofUploadResult> {
  try {
    if (!(await repository.markStored(proof.id, ownerId, now.toISOString()))) {
      return { ok: false, reason: "unavailable" };
    }
    return { ok: true, state: proof.uploadState === "stored" ? "already_stored" : "stored" };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}

export async function storeOwnedProofUpload(input: {
  actorId: string;
  proofId: string;
  uploadToken: string;
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
  if (!isProofContentType(proof.contentType) || !SHA256_HEX.test(proof.sha256)) {
    return { ok: false, reason: "invalid" };
  }
  if (input.uploadToken.length !== 43 || !/^[A-Za-z0-9_-]+$/.test(input.uploadToken)) {
    return { ok: false, reason: "forbidden" };
  }
  const tokenHash = await sha256Hex(new TextEncoder().encode(input.uploadToken));
  if (!constantTimeHexEqual(tokenHash, proof.uploadTokenHash)) return { ok: false, reason: "forbidden" };
  if (
    !Number.isSafeInteger(proof.sizeBytes) ||
    proof.sizeBytes <= 0 ||
    !Number.isSafeInteger(input.policy.maxFileBytes) ||
    input.policy.maxFileBytes <= 0 ||
    proof.sizeBytes > input.policy.maxFileBytes
  ) {
    return { ok: false, reason: "invalid" };
  }

  try {
    if (proof.uploadState === "stored") {
      const existing = await input.bucket.head(proof.objectKey);
      if (!objectMatchesIntent(existing, proof)) return { ok: false, reason: "conflict" };
      return finalizeStoredProof(input.repository, proof, input.actorId, now);
    }
    if (proof.uploadState !== "pending") return { ok: false, reason: "invalid" };

    const bytes = await readBoundedBody(input.body, input.policy.maxFileBytes, proof.sizeBytes);
    if (!bytes || !liveIntent(proof, input.now ?? new Date())) return { ok: false, reason: "invalid" };
    if (sniffProofContentType(bytes) !== proof.contentType) return { ok: false, reason: "invalid" };
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
      return finalizeStoredProof(input.repository, proof, input.actorId, now);
    }
    if (result.key !== proof.objectKey || result.size !== proof.sizeBytes) {
      return { ok: false, reason: "unavailable" };
    }
    return finalizeStoredProof(input.repository, proof, input.actorId, now);
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
