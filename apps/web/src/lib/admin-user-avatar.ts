import type { AuthUser } from "../types/auth";
import { toApiUrl } from "./env";
import { getOpenMojiUrl, pickOpenMojiCode } from "./openmoji";

export function getAdminUserAvatarUrl(user: AuthUser): string {
  if (user.avatarType === "emoji" && user.avatarCode) {
    return getOpenMojiUrl(user.avatarCode);
  }
  if (user.avatarUrl) return toApiUrl(user.avatarUrl);
  return getOpenMojiUrl(pickOpenMojiCode(user.id));
}
