import { expect, test } from "bun:test";
import { shouldLoadFullWatchStream } from "../src/lib/watch-stream-loading";

test("waits for YouTube bootstrap before loading the full stream", () => {
  expect(
    shouldLoadFullWatchStream("https://www.youtube.com/watch?v=video", true, {
      isSuccess: false,
      isError: false,
    }),
  ).toBe(false);
  expect(
    shouldLoadFullWatchStream("https://www.youtube.com/watch?v=video", true, {
      isSuccess: true,
      isError: false,
    }),
  ).toBe(true);
});

test("loads non-YouTube streams without waiting for SABR bootstrap", () => {
  expect(
    shouldLoadFullWatchStream("https://www.nicovideo.jp/watch/sm9", true, {
      isSuccess: false,
      isError: false,
    }),
  ).toBe(true);
});

test("keeps all stream requests disabled until watch access is ready", () => {
  expect(
    shouldLoadFullWatchStream("https://www.youtube.com/watch?v=video", false, {
      isSuccess: true,
      isError: false,
    }),
  ).toBe(false);
});
