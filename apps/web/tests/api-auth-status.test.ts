import { afterEach, expect, mock, test } from "bun:test";

if (!("localStorage" in globalThis)) {
  Object.defineProperty(globalThis, "localStorage", {
    value: {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    },
  });
}

const { fetchRegisterStatus } = await import("../src/lib/api-auth-status");

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("registration status bypasses browser caches", async () => {
  globalThis.fetch = mock(async () =>
    Response.json({ allowRegistration: false, bootstrapAvailable: false }),
  );

  await fetchRegisterStatus();

  expect(globalThis.fetch).toHaveBeenCalledWith("/api/auth/register/status", {
    cache: "no-store",
  });
});
