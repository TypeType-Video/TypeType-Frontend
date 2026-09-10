export const COMMUNITY_ANNOUNCEMENT_KEY = "typetype-announcement-lemmy-2";
export const LEMMY_COMMUNITY_URL = "https://blorp.lemmy.zip/home/c/TypeType@lemmy.zip";
export const LEMMY_ANNOUNCEMENT_URL =
  "https://blorp.lemmy.zip/home/posts/https%3A%2F%2Flemmy.zip%2Fpost%2F71134875";

type AnnouncementStorage = Pick<Storage, "getItem" | "setItem">;

function getAnnouncementStorage(): AnnouncementStorage | undefined {
  try {
    return localStorage;
  } catch {
    return undefined;
  }
}

export function isCommunityAnnouncementDismissed(
  storage: AnnouncementStorage | undefined = getAnnouncementStorage(),
): boolean {
  try {
    return storage?.getItem(COMMUNITY_ANNOUNCEMENT_KEY) === "dismissed";
  } catch {
    return false;
  }
}

export function rememberCommunityAnnouncementDismissal(
  storage: AnnouncementStorage | undefined = getAnnouncementStorage(),
): void {
  try {
    storage?.setItem(COMMUNITY_ANNOUNCEMENT_KEY, "dismissed");
  } catch {
    // A storage failure leaves the announcement visible on the next visit.
  }
}
