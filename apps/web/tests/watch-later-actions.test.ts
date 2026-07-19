import { describe, expect, test } from "bun:test";
import { watchLaterActionLabel, watchLaterResultLabel } from "../src/lib/watch-later-labels";
import { toWatchLaterPayload } from "../src/lib/watch-later-mappers";
import type { VideoStream } from "../src/types/stream";

function stream(overrides: Partial<VideoStream> = {}): VideoStream {
  return {
    id: "https://www.youtube.com/watch?v=video-id",
    title: "Video title",
    thumbnail: "/api/proxy?url=thumbnail",
    rawThumbnail: "https://images.example/thumbnail.jpg",
    rawChannelAvatar: "https://images.example/avatar.jpg",
    channelName: "Channel",
    channelUrl: "https://www.youtube.com/@channel",
    channelAvatar: "/api/proxy?url=avatar",
    views: 123,
    duration: 456,
    publishedAt: 789,
    ...overrides,
  };
}

describe("Watch Later actions", () => {
  test("uses the canonical stream metadata when saving a video", () => {
    expect(toWatchLaterPayload(stream())).toEqual({
      url: "https://www.youtube.com/watch?v=video-id",
      title: "Video title",
      thumbnail: "https://images.example/thumbnail.jpg",
      duration: 456,
      channelName: "Channel",
      channelUrl: "https://www.youtube.com/@channel",
      channelAvatar: "https://images.example/avatar.jpg",
      viewCount: 123,
      publishedAt: 789,
    });
  });

  test("falls back to rendered images when raw URLs are unavailable", () => {
    const payload = toWatchLaterPayload(stream({ rawThumbnail: "", rawChannelAvatar: "" }));

    expect(payload.thumbnail).toBe("/api/proxy?url=thumbnail");
    expect(payload.channelAvatar).toBe("/api/proxy?url=avatar");
  });

  test("describes both toggle states consistently", () => {
    expect(watchLaterActionLabel(false)).toBe("Save to Watch later");
    expect(watchLaterActionLabel(true)).toBe("Remove from Watch later");
    expect(watchLaterResultLabel(true)).toBe("Saved to Watch later");
    expect(watchLaterResultLabel(false)).toBe("Removed from Watch later");
  });
});
