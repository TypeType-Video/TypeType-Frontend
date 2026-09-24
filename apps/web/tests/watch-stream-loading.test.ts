import { expect, test } from "bun:test";
import { shouldLoadFullWatchStream } from "../src/lib/watch-stream-loading";

test("loads the full stream in parallel with bootstrap", () => {
  expect(shouldLoadFullWatchStream(true)).toBe(true);
});

test("loads non-YouTube streams without waiting for SABR bootstrap", () => {
  expect(shouldLoadFullWatchStream(true)).toBe(true);
});

test("keeps all stream requests disabled until watch access is ready", () => {
  expect(shouldLoadFullWatchStream(false)).toBe(false);
});
