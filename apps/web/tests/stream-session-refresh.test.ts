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

const { fetchStream } = await import("../src/lib/api-stream");
const { useAuthStore } = await import("../src/stores/auth-store");

const originalFetch = globalThis.fetch;
const videoUrl = "https://www.bilibili.com/video/BV1pJAMzpE6K";
const stream = { title: "Video", audioStreams: [], videoOnlyStreams: [] };
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

function bearer(init?: RequestInit): string | null {
  return new Headers(init?.headers).get("Authorization");
}

function serve(streamAnswer: (auth: string | null) => Response, refreshStatus = 200) {
  const streamAuths: (string | null)[] = [];
  globalThis.fetch = mock(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.endsWith("/auth/refresh")) {
      return refreshStatus === 200
        ? jsonResponse(200, { accessToken: "fresh-token" })
        : jsonResponse(refreshStatus, { error: "Unauthorized" });
    }
    if (url.endsWith("/auth/me")) return jsonResponse(200, me);
    if (url.includes("/streams")) {
      streamAuths.push(bearer(init));
      return streamAnswer(bearer(init));
    }
    throw new Error(`Unexpected request: ${url}`);
  }) as unknown as typeof fetch;
  return streamAuths;
}

const expiredTokenRejected = (auth: string | null) =>
  auth === "Bearer stale-token"
    ? jsonResponse(401, { error: "Unauthorized" })
    : jsonResponse(200, stream);

beforeEach(() => {
  useAuthStore.getState().setSession("stale-token", me);
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  useAuthStore.getState().setSignedOut();
});

test("refreshes an expired session before loading an authenticated stream", async () => {
  const streamAuths = serve(expiredTokenRejected);

  await expect(fetchStream(videoUrl, "authenticated_first")).resolves.toMatchObject(stream);

  expect(streamAuths).toEqual(["Bearer stale-token", "Bearer fresh-token"]);
  expect(useAuthStore.getState().token).toBe("fresh-token");
});

test("refreshes an expired session when the anonymous stream needs an account", async () => {
  const streamAuths = serve((auth) =>
    auth === null ? jsonResponse(403, { error: "Sign in required" }) : expiredTokenRejected(auth),
  );

  await expect(fetchStream(videoUrl, "anonymous_first")).resolves.toMatchObject(stream);

  expect(streamAuths).toEqual([null, "Bearer stale-token", "Bearer fresh-token"]);
});

test("signs out when the session can no longer be refreshed", async () => {
  const streamAuths = serve(expiredTokenRejected, 401);

  await expect(fetchStream(videoUrl, "authenticated_first")).rejects.toMatchObject({ status: 401 });

  expect(streamAuths).toEqual(["Bearer stale-token"]);
  expect(useAuthStore.getState().token).toBeNull();
});
