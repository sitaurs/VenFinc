import { describe, expect, it, vi } from "vitest";
import { callDataApi, DataApiFailure } from "./database";

const env = {
  NEON_DATA_API_URL:
    "https://ep-fixture.apirest.c-6.us-east-2.aws.neon.tech/neondb/rest/v1",
};

describe("Neon Data API transport boundary", () => {
  it("allows only fixed RPCs on the configured Neon HTTPS origin", async () => {
    const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(String(input)).toBe(`${env.NEON_DATA_API_URL}/rpc/list_wallets`);
      expect(init?.method).toBe("POST");
      expect(init?.redirect).toBe("error");
      const headers = new Headers(init?.headers);
      expect(headers.get("Accept-Profile")).toBe("public");
      expect(headers.get("Content-Profile")).toBe("public");
      expect(headers.get("Authorization")).toBe("Bearer signed-provider-jwt");
      return new Response(JSON.stringify([{ wallet_id: "7b9be51e-0607-4c60-8315-e57ae8f61aba", balance_minor: "9007199254740993" }]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });
    const result = await callDataApi<Array<{ balance_minor: string }>>(
      env,
      "signed-provider-jwt",
      { kind: "rpc", name: "list_wallets" },
      fetcher as typeof fetch,
    );
    expect(result[0]?.balance_minor).toBe("9007199254740993");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("rejects user-controlled hosts and invalid URL paths before network access", async () => {
    const fetcher = vi.fn();
    await expect(callDataApi(
      { NEON_DATA_API_URL: "https://attacker.invalid/neondb/rest/v1" },
      "token",
      { kind: "rpc", name: "list_wallets" },
      fetcher as typeof fetch,
    )).rejects.toMatchObject({ code: "not_configured" });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("maps database conflicts to a safe domain error without exposing SQL text", async () => {
    const canary = "PRIVATE_SQL_CANARY";
    const fetcher = vi.fn(async () => new Response(JSON.stringify({
      code: "23505",
      message: `IDEMPOTENCY_KEY_REUSED ${canary}`,
    }), { status: 409 }));
    try {
      await callDataApi(env, "signed-provider-jwt", {
        kind: "rpc",
        name: "post_finance_event",
        body: {},
      }, fetcher as typeof fetch);
      throw new Error("expected database failure");
    } catch (error) {
      expect(error).toBeInstanceOf(DataApiFailure);
      expect(error).toMatchObject({ code: "conflict", status: 409 });
      expect(String(error)).not.toContain(canary);
    }
  });

  it("never follows provider redirects and treats network failure as unavailable", async () => {
    const fetcher = vi.fn(async () => { throw new Error("PRIVATE_NETWORK_CANARY"); });
    await expect(callDataApi(env, "signed-provider-jwt", {
      kind: "rpc",
      name: "list_wallets",
    }, fetcher as typeof fetch)).rejects.toMatchObject({ code: "unavailable", status: 503 });
  });
});
