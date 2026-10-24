/** Deterministic CI fixtures only. These do not prove Neon RLS or provider parity. */
export class FakeFailure extends Error {
  constructor(readonly code: "NOT_FOUND" | "UNAVAILABLE" | "FORBIDDEN") {
    super(code);
  }
}
export class FakeDatabase {
  readonly actualRlsVerified = false;
  available = true;
  #rows = new Map<string, { owner: string; amountMinor: string }>();
  seedFixture(owner: string, id: string, amountMinor: string) {
    this.#rows.set(id, { owner, amountMinor });
  }
  async readScoped(owner: string, id: string) {
    if (!this.available) throw new FakeFailure('UNAVAILABLE');
    const row = this.#rows.get(id);
    if (!row || row.owner !== owner) throw new FakeFailure('NOT_FOUND');
    return { id, amountMinor: row.amountMinor };
  }
}
export class FakeObjectStore {
  #objects = new Map<string, { owner: string; value: Uint8Array }>();
  available = true;
  async put(owner: string, objectId: string, bytes: Uint8Array) {
    if (!this.available) throw new FakeFailure("UNAVAILABLE");
    const existing = this.#objects.get(objectId);
    if (existing && existing.owner !== owner)
      throw new FakeFailure("NOT_FOUND");
    this.#objects.set(objectId, { owner, value: bytes.slice() });
  }
  async get(owner: string, objectId: string) {
    if (!this.available) throw new FakeFailure("UNAVAILABLE");
    const object = this.#objects.get(objectId);
    if (!object || object.owner !== owner) throw new FakeFailure("NOT_FOUND");
    return object.value.slice();
  }
}
export class FakeVision {
  readonly actualProviderVerified = false;
  available = true;
  async extract(bytes: Uint8Array) {
    if (!this.available) throw new FakeFailure("UNAVAILABLE");
    if (!bytes.byteLength)
      return {
        status: "NEEDS_REVIEW" as const,
        amountMinor: null,
        reason: "empty-fixture",
      };
    return {
      status: "NEEDS_REVIEW" as const,
      amountMinor: "9000",
      reason: "synthetic-fixture-never-auto-post",
    };
  }
}
export class FakeWhatsApp {
  available = true;
  #devices = new Map<string, { owner: string; stopped: boolean }>();
  readonly actualProviderVerified = false;
  registerFixture(owner: string, deviceId: string) {
    this.#devices.set(deviceId, { owner, stopped: false });
  }
  async command(owner: string, deviceId: string, action: "stop" | "status") {
    const device = this.#devices.get(deviceId);
    if (!device || device.owner !== owner) throw new FakeFailure("NOT_FOUND");
    if (action === "stop") {
      device.stopped = true;
      return { stopped: true };
    }
    if (!this.available) throw new FakeFailure("UNAVAILABLE");
    return { stopped: device.stopped };
  }
}
