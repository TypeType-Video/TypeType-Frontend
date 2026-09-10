import { describe, expect, test } from "bun:test";
import {
  COMMUNITY_ANNOUNCEMENT_KEY,
  isCommunityAnnouncementDismissed,
  rememberCommunityAnnouncementDismissal,
} from "../src/lib/community-announcement";

describe("community announcement persistence", () => {
  test("starts visible when the current announcement has no dismissal", () => {
    expect(
      isCommunityAnnouncementDismissed({
        getItem: () => null,
        setItem: () => undefined,
      }),
    ).toBe(false);
  });

  test("persists the explicit acknowledgement choice", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };

    expect(isCommunityAnnouncementDismissed(storage)).toBe(false);
    rememberCommunityAnnouncementDismissal(storage);

    expect(values.get(COMMUNITY_ANNOUNCEMENT_KEY)).toBe("dismissed");
    expect(isCommunityAnnouncementDismissed(storage)).toBe(true);
  });

  test("does not turn a storage failure into a permanent dismissal", () => {
    const storage = {
      getItem: () => {
        throw new Error("storage unavailable");
      },
      setItem: () => {
        throw new Error("storage unavailable");
      },
    };

    expect(isCommunityAnnouncementDismissed(storage)).toBe(false);
    expect(() => rememberCommunityAnnouncementDismissal(storage)).not.toThrow();
  });
});
