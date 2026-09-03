import { expect, test } from "bun:test";
import {
  toPublicWatchParam,
  toWatchSourceUrl,
  watchServiceId,
  youtubeThumbnailUrl,
} from "../src/lib/watch-url";

test("builds a YouTube thumbnail URL from watch values", () => {
  expect(youtubeThumbnailUrl("Z05XGDSTe7U")).toBe("https://i.ytimg.com/vi/Z05XGDSTe7U/hq720.jpg");
  expect(youtubeThumbnailUrl("https://www.youtube.com/watch?v=Z05XGDSTe7U")).toBe(
    "https://i.ytimg.com/vi/Z05XGDSTe7U/hq720.jpg",
  );
  expect(youtubeThumbnailUrl("https://youtu.be/RjdGmIUbYIQ?is=zpKL5N9GylwAIBHO")).toBe(
    "https://i.ytimg.com/vi/RjdGmIUbYIQ/hq720.jpg",
  );
  expect(youtubeThumbnailUrl("sm46525483")).toBeNull();
});

test("normalizes a YouTube short URL while ignoring share parameters", () => {
  const sourceUrl = "https://youtu.be/RjdGmIUbYIQ?is=zpKL5N9GylwAIBHO";
  expect(toPublicWatchParam(sourceUrl)).toBe("RjdGmIUbYIQ");
  expect(toWatchSourceUrl(sourceUrl)).toBe(sourceUrl);
});

test("shortens and expands NicoNico watch URLs", () => {
  expect(toPublicWatchParam("https://www.nicovideo.jp/watch/sm46525483")).toBe("sm46525483");
  expect(toWatchSourceUrl("sm46525483")).toBe("https://www.nicovideo.jp/watch/sm46525483");
});

test("shortens and expands BiliBili watch URLs", () => {
  expect(toPublicWatchParam("https://www.bilibili.com/video/BV1UbX3B2EZQ?p=1")).toBe(
    "BV1UbX3B2EZQ",
  );
  expect(toPublicWatchParam("https://www.bilibili.com/video/BV1UbX3B2EZQ?p=3")).toBe(
    "BV1UbX3B2EZQ?p=3",
  );
  expect(toWatchSourceUrl("BV1UbX3B2EZQ?p=3")).toBe(
    "https://www.bilibili.com/video/BV1UbX3B2EZQ?p=3",
  );
});

test("keeps recommendation fallback on the watched provider", () => {
  expect(watchServiceId("Z05XGDSTe7U", 2)).toBe(0);
  expect(watchServiceId("sm46525483", 0)).toBe(1);
  expect(watchServiceId("BV1UbX3B2EZQ?p=3", 0)).toBe(2);
  expect(watchServiceId("https://example.com/video", 1)).toBe(1);
});
