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

const { startPortabilityImport } = await import("../src/lib/api-portability");
const { useAuthStore } = await import("../src/stores/auth-store");

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  useAuthStore.getState().setSignedOut();
});

test("portability imports send the selected source format", async () => {
  useAuthStore.getState().setToken("test-token");
  globalThis.fetch = mock(async () =>
    Response.json({
      id: "job-id",
      kind: "import",
      state: "queued",
      createdAt: 1,
      updatedAt: 1,
      requestId: null,
      preview: null,
      result: null,
      progress: null,
      errorCode: null,
      errorMessage: null,
    }),
  );

  await startPortabilityImport(new File(["backup"], "takeout.zip"), "youtube-takeout");

  const [url, request] = (globalThis.fetch as ReturnType<typeof mock>).mock.calls[0] as [
    string,
    RequestInit,
  ];
  expect(url).toBe("/api/portability/imports?format=youtube-takeout");
  expect(request.method).toBe("POST");
  expect(request.body).toBeInstanceOf(FormData);
  expect((request.body as FormData).get("file")).toBeInstanceOf(File);
});
