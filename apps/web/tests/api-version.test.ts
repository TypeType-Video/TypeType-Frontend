import { describe, expect, test } from "bun:test";

Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
  },
});

const { parseComponentVersion } = await import("../src/lib/api-version");

describe("parseComponentVersion", () => {
  test("accepts a complete version response", () => {
    expect(
      parseComponentVersion({
        service: "server",
        version: "1.2.4-dev.1",
        revision: "0123456789abcdef",
        shortRevision: "0123456789ab",
        buildTime: "2026-07-28T10:00:00Z",
      }),
    ).toEqual({
      service: "server",
      version: "1.2.4-dev.1",
      revision: "0123456789abcdef",
      shortRevision: "0123456789ab",
      buildTime: "2026-07-28T10:00:00Z",
    });
  });

  test("rejects missing and mistyped fields", () => {
    expect(parseComponentVersion(null)).toBeNull();
    expect(parseComponentVersion({ service: "server" })).toBeNull();
    expect(
      parseComponentVersion({
        service: "server",
        version: 124,
        revision: "0123456789abcdef",
        shortRevision: "0123456789ab",
        buildTime: "2026-07-28T10:00:00Z",
      }),
    ).toBeNull();
  });
});
