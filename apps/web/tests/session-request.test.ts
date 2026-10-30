import { afterEach, beforeEach, expect, mock, test } from "bun:test";

if (!("localStorage" in globalThis)) {
  Object.defineProperty(globalThis, "localStorage", {
    value: {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    },
  });
}

const { fetchSearch } = await import("../src/lib/api-discovery");
const { useAuthStore } = await import("../src/stores/auth-store");

const originalFetch = globalThis.fetch;
const page = { items: [], nextpage: null };
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

function serveSearch() {
  const searchAuths: (string | null)[] = [];
  globalThis.fetch = mock(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.endsWith("/auth/refresh")) return jsonResponse(200, { accessToken: "fresh-token" });
    if (url.endsWith("/auth/me")) return jsonResponse(200, me);
    if (url.includes("/search?")) {
      const auth = new Headers(init?.headers).get("Authorization");
      searchAuths.push(auth);
      return auth === "Bearer stale-token"
        ? jsonResponse(401, { error: "Invalid token" })
        : jsonResponse(200, page);
    }
    throw new Error(`Unexpected request: ${url}`);
  }) as unknown as typeof fetch;
  return searchAuths;
}

beforeEach(() => {
  useAuthStore.getState().setSignedOut();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  useAuthStore.getState().setSignedOut();
});

test("a public request refreshes an expired session and retries once", async () => {
  useAuthStore.getState().setSession("stale-token", me);
  const searchAuths = serveSearch();

  await expect(fetchSearch("cats", 0)).resolves.toMatchObject(page);

  expect(searchAuths).toEqual(["Bearer stale-token", "Bearer fresh-token"]);
  expect(useAuthStore.getState().token).toBe("fresh-token");
});

test("a public request without a session sends no token", async () => {
  const searchAuths = serveSearch();

  await expect(fetchSearch("cats", 0)).resolves.toMatchObject(page);

  expect(searchAuths).toEqual([null]);
});
