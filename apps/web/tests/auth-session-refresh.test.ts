import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

if (!("localStorage" in globalThis)) {
  Object.defineProperty(globalThis, "localStorage", {
    value: {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    },
  });
}

const { authed } = await import("../src/lib/authed");
const { bootstrapSession } = await import("../src/lib/auth-session");
const { useAuthStore } = await import("../src/stores/auth-store");

const originalFetch = globalThis.fetch;
const me = {
  id: "user-1",
  role: "USER" as const,
  publicUsername: "tester",
  bio: null,
  avatarUrl: null,
  avatarType: null,
  avatarCode: null,
};

function jsonResponse(status: number, body: object): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  useAuthStore.getState().setSession("stale-token", me);
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  useAuthStore.getState().setSignedOut();
});

describe("session refresh failures", () => {
  test("keeps the cached session when bootstrap refresh is temporarily unavailable", async () => {
    globalThis.fetch = mock(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/auth/me")) return jsonResponse(401, { error: "Unauthorized" });
      if (url.endsWith("/auth/refresh")) {
        return jsonResponse(503, { error: "Temporarily unavailable" });
      }
      throw new Error(`Unexpected request: ${url}`);
    });

    await bootstrapSession();

    expect(useAuthStore.getState()).toMatchObject({
      token: "stale-token",
      me,
      status: "authenticated",
    });
  });

  test("preserves the session and propagates a temporary refresh error", async () => {
    globalThis.fetch = mock(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/settings") return new Response(null, { status: 401 });
      if (url.endsWith("/auth/refresh")) {
        return jsonResponse(503, { error: "Temporarily unavailable" });
      }
      throw new Error(`Unexpected request: ${url}`);
    });

    await expect(authed("/api/settings")).rejects.toEqual(expect.objectContaining({ status: 503 }));
    expect(useAuthStore.getState()).toMatchObject({
      token: "stale-token",
      me,
      status: "authenticated",
    });
  });

  test("preserves the session when the refresh request loses connectivity", async () => {
    globalThis.fetch = mock(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/settings") return new Response(null, { status: 401 });
      if (url.endsWith("/auth/refresh")) throw new Error("Connection lost");
      throw new Error(`Unexpected request: ${url}`);
    });

    await expect(authed("/api/settings")).rejects.toEqual(
      expect.objectContaining({ message: "Connection lost" }),
    );
    expect(useAuthStore.getState()).toMatchObject({
      token: "stale-token",
      me,
      status: "authenticated",
    });
  });

  test("keeps the refreshed session when the retried request loses connectivity", async () => {
    let settingsRequests = 0;
    globalThis.fetch = mock(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/settings") {
        settingsRequests += 1;
        if (settingsRequests === 1) return new Response(null, { status: 401 });
        throw new Error("Connection lost after refresh");
      }
      if (url.endsWith("/auth/refresh")) {
        return jsonResponse(200, { accessToken: "fresh-token" });
      }
      if (url.endsWith("/auth/me")) return jsonResponse(200, me);
      throw new Error(`Unexpected request: ${url}`);
    });

    await expect(authed("/api/settings")).rejects.toEqual(
      expect.objectContaining({ message: "Connection lost after refresh" }),
    );
    expect(useAuthStore.getState()).toMatchObject({
      token: "fresh-token",
      me,
      status: "authenticated",
    });
  });

  test("signs out only when the refresh session is rejected", async () => {
    globalThis.fetch = mock(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/settings") return new Response(null, { status: 401 });
      if (url.endsWith("/auth/refresh")) return jsonResponse(401, { error: "Unauthorized" });
      throw new Error(`Unexpected request: ${url}`);
    });

    await expect(authed("/api/settings")).rejects.toEqual(
      expect.objectContaining({ status: 401, message: "Session expired" }),
    );
    expect(useAuthStore.getState()).toMatchObject({
      token: null,
      me: null,
      status: "signed_out",
    });
  });
});
