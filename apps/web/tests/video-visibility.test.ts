import { describe, expect, test } from "bun:test";
import { filterMembersOnlyContent, isMembersOnlyContentHidden } from "../src/lib/video-visibility";

const publicVideo = { id: "public", requiresMembership: false };
const membersOnlyVideo = { id: "members", requiresMembership: true };

describe("members-only content visibility", () => {
  test("keeps every video when the setting is disabled", () => {
    expect(filterMembersOnlyContent([publicVideo, membersOnlyVideo], false)).toEqual([
      publicVideo,
      membersOnlyVideo,
    ]);
  });

  test("removes members-only videos when the setting is enabled", () => {
    expect(filterMembersOnlyContent([publicVideo, membersOnlyVideo], true)).toEqual([publicVideo]);
    expect(isMembersOnlyContentHidden(membersOnlyVideo, true)).toBe(true);
    expect(isMembersOnlyContentHidden(publicVideo, true)).toBe(false);
  });
});
