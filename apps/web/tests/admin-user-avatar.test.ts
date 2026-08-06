import { describe, expect, test } from "bun:test";
import { getAdminUserAvatarUrl } from "../src/lib/admin-user-avatar";
import { getOpenMojiUrl, pickOpenMojiCode } from "../src/lib/openmoji";
import type { AuthUser } from "../src/types/auth";

const user: AuthUser = {
  id: "user-123",
  email: "before@example.com",
  name: "Example",
  role: "user",
  publicUsername: null,
  bio: null,
  avatarUrl: null,
  avatarType: null,
  avatarCode: null,
  suspended: false,
  verified: true,
  accessMode: "unrestricted",
  createdAt: 0,
};

describe("getAdminUserAvatarUrl", () => {
  test("keeps the fallback avatar stable when the email changes", () => {
    const before = getAdminUserAvatarUrl(user);
    const after = getAdminUserAvatarUrl({ ...user, email: "after@example.com" });

    expect(after).toBe(before);
    expect(after).toBe(getOpenMojiUrl(pickOpenMojiCode(user.id)));
  });

  test("preserves configured emoji and custom avatars", () => {
    expect(getAdminUserAvatarUrl({ ...user, avatarType: "emoji", avatarCode: "1F600" })).toBe(
      getOpenMojiUrl("1F600"),
    );
    expect(
      getAdminUserAvatarUrl({ ...user, avatarType: "custom", avatarUrl: "/avatar/custom/user" }),
    ).toBe("/api/avatar/custom/user");
  });
});
