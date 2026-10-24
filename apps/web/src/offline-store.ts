import Dexie, { type Table } from "dexie";
import {
  financePostSchema,
  idempotencyKeySchema,
  type FinancePost,
} from "@venfinance/contracts";

const DATABASE_NAME = "venfinance-private-offline-v1";
const KEY_CHECK = "venfinance-offline-vault-check-v1";
const KEY_ITERATIONS = 310_000;
const DRAFT_TTL_DAYS = 30;

export type OfflineDraftStatus = "local_draft" | "syncing" | "synced" | "conflict";
export type OfflineSnapshotKind = "wallets" | "categories" | "profile";

type OfflineSetting = {
  ownerId: string;
  deviceId: string;
  salt: string;
  checkIv: string;
  checkCiphertext: string;
  createdAt: string;
};

type OfflineDevice = { id: "primary"; deviceId: string; lastOwnerId?: string };

type OfflineDraftRow = {
  ownerId: string;
  deviceId: string;
  id: string;
  status: OfflineDraftStatus;
  createdAt: string;
  expiresAt: string;
  iv: string;
  ciphertext: string;
  version: 1;
};

type OfflineSnapshotRow = {
  ownerId: string;
  deviceId: string;
  kind: OfflineSnapshotKind;
  savedAt: string;
  iv: string;
  ciphertext: string;
  version: 1;
};

type EncryptedDraft = {
  command: FinancePost;
  syncedEventId?: string;
};

export type LocalFinanceDraft = {
  id: string;
  status: OfflineDraftStatus;
  createdAt: string;
  expiresAt: string;
  expired: boolean;
  command: FinancePost;
  syncedEventId?: string;
};

export type OfflineVaultStatus = "unsupported" | "uninitialized" | "locked" | "unlocked";

class FinanceOfflineDatabase extends Dexie {
  settings!: Table<OfflineSetting, [string, string]>;
  devices!: Table<OfflineDevice, string>;
  drafts!: Table<OfflineDraftRow, [string, string, string]>;
  snapshots!: Table<OfflineSnapshotRow, [string, string, string]>;

  constructor() {
    super(DATABASE_NAME);
    this.version(1).stores({
      settings: "&[ownerId+deviceId]",
      devices: "&id",
      drafts: "&[ownerId+deviceId+id],[ownerId+deviceId],[ownerId+deviceId+status]",
      snapshots: "&[ownerId+deviceId+kind]",
    });
  }
}

const database = new FinanceOfflineDatabase();
let activeOwnerId: string | null = null;
let activeDeviceId: string | null = null;
let activeKey: CryptoKey | null = null;

function notifyStateChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("venfinance:offline-vault-change"));
  }
}

function supported() {
  return typeof indexedDB !== "undefined" && typeof crypto !== "undefined" && Boolean(crypto.subtle);
}

function base64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function associatedData(ownerId: string, deviceId: string, record: string) {
  return new TextEncoder().encode(`${DATABASE_NAME}\u0000${ownerId}\u0000${deviceId}\u0000${record}\u0000v1`);
}

function requireOwner(ownerId: string) {
  if (!activeOwnerId || activeOwnerId !== ownerId || !activeDeviceId || !activeKey) {
    throw new Error("Buka kunci draf offline untuk akun ini terlebih dahulu.");
  }
  return { deviceId: activeDeviceId, key: activeKey };
}

async function deviceId() {
  const existing = await database.devices.get("primary");
  if (existing) return existing.deviceId;
  const created = { id: "primary" as const, deviceId: crypto.randomUUID() };
  try {
    await database.devices.add(created);
    return created.deviceId;
  } catch {
    const raced = await database.devices.get("primary");
    if (!raced) throw new Error("Perangkat lokal belum dapat disiapkan.");
    return raced.deviceId;
  }
}

async function deriveKey(passphrase: string, salt: Uint8Array) {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: KEY_ITERATIONS, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function encrypt(ownerId: string, device: string, key: CryptoKey, record: string, value: unknown) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(value));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: associatedData(ownerId, device, record) as BufferSource },
    key,
    plaintext,
  );
  return { iv: base64Url(iv), ciphertext: base64Url(new Uint8Array(ciphertext)) };
}

async function decrypt<T>(ownerId: string, device: string, key: CryptoKey, record: string, iv: string, ciphertext: string): Promise<T> {
  const cleartext = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: fromBase64Url(iv) as BufferSource,
      additionalData: associatedData(ownerId, device, record) as BufferSource,
    },
    key,
    fromBase64Url(ciphertext) as BufferSource,
  );
  return JSON.parse(new TextDecoder().decode(cleartext)) as T;
}

export function setOfflineOwner(ownerId: string) {
  if (!ownerId || ownerId.length > 255) throw new Error("Identitas akun lokal tidak valid.");
  if (activeOwnerId !== ownerId) {
    activeOwnerId = ownerId;
    activeDeviceId = null;
    activeKey = null;
    notifyStateChange();
  }
}

export async function getOfflineUnlockOwner(): Promise<string | null> {
  if (!supported()) return null;
  const row = await database.devices.get("primary");
  if (!row?.lastOwnerId || row.lastOwnerId.length > 255) return null;
  const setting = await database.settings.get([row.lastOwnerId, row.deviceId]);
  return setting ? row.lastOwnerId : null;
}

export function lockOfflineVault() {
  activeKey = null;
  activeDeviceId = null;
  activeOwnerId = null;
  notifyStateChange();
}

export function isOfflineVaultUnlocked(ownerId: string) {
  return activeOwnerId === ownerId && activeKey !== null && activeDeviceId !== null;
}

export async function getOfflineVaultStatus(ownerId: string): Promise<OfflineVaultStatus> {
  if (!supported()) return "unsupported";
  if (isOfflineVaultUnlocked(ownerId)) return "unlocked";
  const currentDeviceId = await deviceId();
  const setting = await database.settings.get([ownerId, currentDeviceId]);
  return setting ? "locked" : "uninitialized";
}

export async function initializeOfflineVault(ownerId: string, passphrase: string) {
  if (!supported()) throw new Error("Peramban ini tidak mendukung penyimpanan offline terenkripsi.");
  if (!/^(?=.{12,128}$).+/u.test(passphrase)) {
    throw new Error("Gunakan frasa sandi khusus perangkat dengan panjang 12–128 karakter.");
  }
  if (activeOwnerId !== ownerId) throw new Error("Sesi akun tidak cocok dengan ruang offline.");
  const currentDeviceId = await deviceId();
  const existing = await database.settings.get([ownerId, currentDeviceId]);
  if (existing) throw new Error("Kunci offline perangkat ini sudah dibuat. Buka kuncinya untuk melanjutkan.");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(passphrase, salt);
  const check = await encrypt(ownerId, currentDeviceId, key, "vault-check", KEY_CHECK);
  await database.settings.add({
    ownerId,
    deviceId: currentDeviceId,
    salt: base64Url(salt),
    checkIv: check.iv,
    checkCiphertext: check.ciphertext,
    createdAt: new Date().toISOString(),
  });
  activeDeviceId = currentDeviceId;
  activeKey = key;
  await database.devices.put({ id: "primary", deviceId: currentDeviceId, lastOwnerId: ownerId });
  notifyStateChange();
}

export async function unlockOfflineVault(ownerId: string, passphrase: string) {
  if (!supported()) throw new Error("Peramban ini tidak mendukung penyimpanan offline terenkripsi.");
  if (activeOwnerId !== ownerId) throw new Error("Sesi akun tidak cocok dengan ruang offline.");
  const currentDeviceId = await deviceId();
  const setting = await database.settings.get([ownerId, currentDeviceId]);
  if (!setting) throw new Error("Kunci offline perangkat ini belum dibuat.");
  try {
    const key = await deriveKey(passphrase, fromBase64Url(setting.salt));
    const check = await decrypt<string>(ownerId, currentDeviceId, key, "vault-check", setting.checkIv, setting.checkCiphertext);
    if (check !== KEY_CHECK) throw new Error("invalid key");
    activeDeviceId = currentDeviceId;
    activeKey = key;
    await database.devices.put({ id: "primary", deviceId: currentDeviceId, lastOwnerId: ownerId });
    notifyStateChange();
  } catch {
    throw new Error("Frasa sandi tidak cocok atau ruang offline rusak.");
  }
}

export async function saveLocalDraft(ownerId: string, idempotencyKey: string, value: FinancePost) {
  const { deviceId: currentDeviceId, key } = requireOwner(ownerId);
  const id = idempotencyKeySchema.parse(idempotencyKey);
  const command = financePostSchema.parse(value);
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + DRAFT_TTL_DAYS * 24 * 60 * 60 * 1000);
  const payload: EncryptedDraft = { command };
  const encrypted = await encrypt(ownerId, currentDeviceId, key, `draft:${id}`, payload);
  await database.drafts.put({
    ownerId,
    deviceId: currentDeviceId,
    id,
    status: "local_draft",
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    ...encrypted,
    version: 1,
  });
  return id;
}

export async function listLocalDrafts(ownerId: string): Promise<LocalFinanceDraft[]> {
  const { deviceId: currentDeviceId, key } = requireOwner(ownerId);
  const records = await database.drafts.where("[ownerId+deviceId]").equals([ownerId, currentDeviceId]).toArray();
  const drafts = await Promise.all(records.map(async (row) => {
    const payload = await decrypt<EncryptedDraft>(ownerId, currentDeviceId, key, `draft:${row.id}`, row.iv, row.ciphertext);
    return {
      id: row.id,
      status: row.status,
      createdAt: row.createdAt,
      expiresAt: row.expiresAt,
      expired: Date.parse(row.expiresAt) <= Date.now(),
      command: financePostSchema.parse(payload.command),
      ...(payload.syncedEventId ? { syncedEventId: payload.syncedEventId } : {}),
    } satisfies LocalFinanceDraft;
  }));
  return drafts.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function setLocalDraftStatus(ownerId: string, id: string, status: OfflineDraftStatus) {
  const { deviceId: currentDeviceId } = requireOwner(ownerId);
  await database.drafts.update([ownerId, currentDeviceId, id], { status });
}

export async function recoverInterruptedDrafts(ownerId: string) {
  if (!supported()) return;
  const currentDeviceId = await deviceId();
  await database.drafts
    .where("[ownerId+deviceId+status]")
    .equals([ownerId, currentDeviceId, "syncing"])
    .modify({ status: "local_draft" });
}

export async function markLocalDraftSynced(ownerId: string, id: string, eventId: string) {
  const { deviceId: currentDeviceId, key } = requireOwner(ownerId);
  const row = await database.drafts.get([ownerId, currentDeviceId, id]);
  if (!row) return;
  const payload = await decrypt<EncryptedDraft>(ownerId, currentDeviceId, key, `draft:${row.id}`, row.iv, row.ciphertext);
  const encrypted = await encrypt(ownerId, currentDeviceId, key, `draft:${row.id}`, { ...payload, syncedEventId: eventId });
  await database.drafts.update([ownerId, currentDeviceId, id], { ...encrypted, status: "synced" });
}

export async function deleteLocalDraft(ownerId: string, id: string) {
  const { deviceId: currentDeviceId } = requireOwner(ownerId);
  await database.drafts.delete([ownerId, currentDeviceId, id]);
}

export async function saveOfflineSnapshot(ownerId: string, kind: OfflineSnapshotKind, value: unknown) {
  const { deviceId: currentDeviceId, key } = requireOwner(ownerId);
  const record = `snapshot:${kind}`;
  const encrypted = await encrypt(ownerId, currentDeviceId, key, record, value);
  await database.snapshots.put({
    ownerId,
    deviceId: currentDeviceId,
    kind,
    savedAt: new Date().toISOString(),
    ...encrypted,
    version: 1,
  });
}

export async function readOfflineSnapshot<T>(ownerId: string, kind: OfflineSnapshotKind): Promise<{ value: T; savedAt: string } | null> {
  const { deviceId: currentDeviceId, key } = requireOwner(ownerId);
  const row = await database.snapshots.get([ownerId, currentDeviceId, kind]);
  if (!row) return null;
  return {
    value: await decrypt<T>(ownerId, currentDeviceId, key, `snapshot:${kind}`, row.iv, row.ciphertext),
    savedAt: row.savedAt,
  };
}

export async function deleteOfflineVaultData(ownerId: string) {
  const { deviceId: currentDeviceId } = requireOwner(ownerId);
  await database.transaction("rw", database.settings, database.drafts, database.snapshots, async () => {
    await Promise.all([
      database.settings.delete([ownerId, currentDeviceId]),
      database.drafts.where("[ownerId+deviceId]").equals([ownerId, currentDeviceId]).delete(),
      database.snapshots.where("[ownerId+deviceId]").equals([ownerId, currentDeviceId]).delete(),
    ]);
  });
  lockOfflineVault();
}
