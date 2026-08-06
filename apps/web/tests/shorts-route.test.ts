import { expect, test } from "bun:test";
import {
  createShortsRouteEntry,
  mergeShortsRouteEntries,
  resolveShortsRouteTarget,
  shortsPathRedirectSearch,
  toPublicShortsUrl,
} from "../src/lib/shorts-route";
import type { VideoStream } from "../src/types/stream";

function stream(id: string, title: string): VideoStream {
  return {
    id,
    title,
    thumbnail: "",
    rawThumbnail: "",
    rawChannelAvatar: "",
    channelName: "Channel",
    channelAvatar: "",
    views: 0,
    duration: 30,
  };
}

test("canonicalizes a YouTube Shorts URL to a public video id", () => {
  expect(resolveShortsRouteTarget("https://youtube.com/shorts/2-J9d2VbA6o")).toEqual({
    publicParam: "2-J9d2VbA6o",
    sourceUrl: "https://www.youtube.com/watch?v=2-J9d2VbA6o",
  });
  expect(toPublicShortsUrl("https://youtube.com/shorts/2-J9d2VbA6o", "https://example.com")).toBe(
    "https://example.com/shorts?v=2-J9d2VbA6o",
  );
});

test("redirects a Shorts path id to canonical route search", () => {
  expect(shortsPathRedirectSearch("2-J9d2VbA6o")).toEqual({ v: "2-J9d2VbA6o" });
  expect(shortsPathRedirectSearch("invalid")).toBeNull();
});

test("keeps direct route entries stable and replaces placeholders with feed metadata", () => {
  const direct = createShortsRouteEntry("2-J9d2VbA6o");
  if (!direct) throw new Error("Expected a direct route entry");
  const matching = stream("https://youtube.com/shorts/2-J9d2VbA6o", "Loaded metadata");
  const next = stream("https://www.youtube.com/watch?v=CGZvS2LjfiQ", "Next");

  expect(mergeShortsRouteEntries([direct], [matching, next])).toEqual([matching, next]);
});

test("rejects unsupported direct route values", () => {
  expect(resolveShortsRouteTarget("not a video")).toBeNull();
  expect(createShortsRouteEntry("https://example.com/video/2-J9d2VbA6o")).toBeNull();
});
