import { expect, test } from "bun:test";
import { toDirectWatchUrl } from "../src/lib/direct-watch-url";

test("a bare NicoNico video ID opens the video", () => {
  expect(toDirectWatchUrl("sm22314266")).toBe("https://www.nicovideo.jp/watch/sm22314266");
  expect(toDirectWatchUrl(" SO12345 ")).toBe("https://www.nicovideo.jp/watch/so12345");
});

test("ordinary searches that only look like IDs stay searches", () => {
  expect(toDirectWatchUrl("sm")).toBeNull();
  expect(toDirectWatchUrl("small talk")).toBeNull();
  expect(toDirectWatchUrl("sm22314266 review")).toBeNull();
});

test("supported links still open directly", () => {
  expect(toDirectWatchUrl("https://www.nicovideo.jp/watch/sm9")).toBe(
    "https://www.nicovideo.jp/watch/sm9",
  );
  expect(toDirectWatchUrl("example.com/watch")).toBeNull();
});
