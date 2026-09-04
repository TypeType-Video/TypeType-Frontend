import { expect, test } from "bun:test";
import { getSourceShareTarget } from "../src/lib/share-link";

test("returns the canonical YouTube source link", () => {
  expect(getSourceShareTarget("youtube.com/shorts/AbCdEfGhI_1?si=share")).toEqual({
    provider: "youtube",
    label: "YouTube",
    url: "https://youtube.com/shorts/AbCdEfGhI_1?si=share",
  });
});

test("returns canonical BiliBili and NicoNico source links", () => {
  expect(getSourceShareTarget("BV1UbX3B2EZQ?p=3")).toEqual({
    provider: "bilibili",
    label: "BiliBili",
    url: "https://www.bilibili.com/video/BV1UbX3B2EZQ?p=3",
  });
  expect(getSourceShareTarget("sm46525483")).toEqual({
    provider: "nicovideo",
    label: "NicoNico",
    url: "https://www.nicovideo.jp/watch/sm46525483",
  });
});

test("does not offer a provider option for unsupported URLs", () => {
  expect(getSourceShareTarget("https://example.com/video")).toBeNull();
});
