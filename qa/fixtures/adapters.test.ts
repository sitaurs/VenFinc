import { describe, expect, it } from "vitest";
import { FakeDatabase, FakeObjectStore, FakeVision, FakeWhatsApp } from "./adapters";
describe("offline CI adapter fixtures (not live integration evidence)", () => {
  it('scoped database fixtures remain exact and never claim an actual RLS proof', async () => {
    const database = new FakeDatabase();
    database.seedFixture('owner-a', 'wallet-a', '9007199254740993');
    database.seedFixture('owner-b', 'wallet-b', '10000');
    expect(await database.readScoped('owner-a', 'wallet-a')).toEqual({ id: 'wallet-a', amountMinor: '9007199254740993' });
    await expect(database.readScoped('owner-b', 'wallet-a')).rejects.toThrow('NOT_FOUND');
    await expect(database.readScoped('owner-a', 'wallet-b')).rejects.toThrow('NOT_FOUND');
    expect(database.actualRlsVerified).toBe(false);
    database.available = false;
    await expect(database.readScoped('owner-a', 'wallet-a')).rejects.toThrow('UNAVAILABLE');
  });
  it("synthetic storage hides both unknown and another owner’s objects", async () => {
    const store = new FakeObjectStore();
    const bytes = new Uint8Array([1, 2]);
    await store.put("owner-a", "proof-a", bytes);
    bytes[0] = 99;
    expect(await store.get("owner-a", "proof-a")).toEqual(
      new Uint8Array([1, 2]),
    );
    await expect(store.get("owner-b", "proof-a")).rejects.toThrow("NOT_FOUND");
    await expect(store.get("owner-b", "missing")).rejects.toThrow("NOT_FOUND");
    await expect(store.put("owner-b", "proof-a", bytes)).rejects.toThrow(
      "NOT_FOUND",
    );
    store.available = false;
    await expect(store.get("owner-a", "proof-a")).rejects.toThrow(
      "UNAVAILABLE",
    );
  });
  it("vision fixtures are provisional and provider failure never invents a result", async () => {
    const vision = new FakeVision();
    expect((await vision.extract(new Uint8Array([1]))).status).toBe(
      "NEEDS_REVIEW",
    );
    expect((await vision.extract(new Uint8Array())).amountMinor).toBeNull();
    expect(vision.actualProviderVerified).toBe(false);
    vision.available = false;
    await expect(vision.extract(new Uint8Array([1]))).rejects.toThrow(
      "UNAVAILABLE",
    );
  });
  it("device ownership is checked, and STOP remains effective during an outage", async () => {
    const wa = new FakeWhatsApp();
    wa.registerFixture("owner-a", "device-a");
    wa.registerFixture("owner-b", "device-b");
    await expect(wa.command("owner-a", "device-b", "status")).rejects.toThrow(
      "NOT_FOUND",
    );
    wa.available = false;
    expect(await wa.command("owner-a", "device-a", "stop")).toEqual({
      stopped: true,
    });
    wa.available = true;
    expect(await wa.command("owner-a", "device-a", "status")).toEqual({
      stopped: true,
    });
    expect(await wa.command("owner-b", "device-b", "status")).toEqual({
      stopped: false,
    });
  });
});
