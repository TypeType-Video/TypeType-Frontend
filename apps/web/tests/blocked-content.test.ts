import { describe, expect, test } from "bun:test";
import {
  createBlockedContentMatcher,
  normalizeBlockedContentUrl,
} from "../src/lib/blocked-content";

describe("blocked content matching", () => {
  test("treats equivalent YouTube video URLs as the same video", () => {
    const matcher = createBlockedContentMatcher(
      [],
      [{ url: "https://www.youtube.com/watch?v=AbC_123-xyZ" }],
      [],
    );

    expect(matcher.isVideoExplicitlyBlocked({ id: "https://youtu.be/AbC_123-xyZ?t=12" })).toBe(
      true,
    );
    expect(
      matcher.isVideoExplicitlyBlocked({ url: "https://m.youtube.com/shorts/AbC_123-xyZ" }),
    ).toBe(true);
  });

  test("normalizes YouTube channel hosts and ignores URL decorations", () => {
    expect(normalizeBlockedContentUrl("http://www.youtube.com/@Example/?view=0#top")).toBe(
      "youtube.com/@Example",
    );
  });

  test("matches blocked channels by canonical URL or normalized name", () => {
    const matcher = createBlockedContentMatcher(
      [{ url: "https://www.youtube.com/@Example", name: "Ｔｅｓｔ Channel" }],
      [],
      [],
    );

    expect(matcher.isChannelBlocked({ url: "https://m.youtube.com/@Example/" })).toBe(true);
    expect(matcher.isChannelBlocked({ name: "test channel" })).toBe(true);
  });

  test("removes blocked videos, channels, and keywords from ordered candidates", () => {
    const matcher = createBlockedContentMatcher(
      [{ url: "https://youtube.com/@blocked", name: "Blocked" }],
      [{ url: "https://youtube.com/watch?v=blocked-video" }],
      ["spoiler"],
    );
    const candidates = [
      { id: "https://youtube.com/watch?v=blocked-video", title: "One" },
      {
        id: "https://youtube.com/watch?v=blocked-channel",
        title: "Two",
        channelUrl: "https://www.youtube.com/@blocked",
      },
      { id: "https://youtube.com/watch?v=blocked-title", title: "A spoiler inside" },
      { id: "https://youtube.com/watch?v=visible", title: "Visible" },
    ];

    expect(matcher.filterVideos(candidates).map((item) => item.title)).toEqual(["Visible"]);
  });
});
