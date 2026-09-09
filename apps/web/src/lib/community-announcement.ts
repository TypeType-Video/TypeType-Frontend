export const COMMUNITY_ANNOUNCEMENT_KEY = "typetype-announcement-lemmy-1";
export const LEMMY_COMMUNITY_URL = "https://blorp.lemmy.zip/home/c/TypeType@lemmy.zip";
export const LEMMY_ANNOUNCEMENT_URL =
  "https://blorp.lemmy.zip/home/posts/https%3A%2F%2Flemmy.zip%2Fpost%2F71134875";

let dismissedInSession = false;

export function isCommunityAnnouncementDismissed(): boolean {
  if (dismissedInSession) return true;
  try {
    return localStorage.getItem(COMMUNITY_ANNOUNCEMENT_KEY) === "dismissed";
  } catch {
    return false;
  }
}

export function dismissCommunityAnnouncement(): void {
  dismissedInSession = true;
  try {
    localStorage.setItem(COMMUNITY_ANNOUNCEMENT_KEY, "dismissed");
  } catch {
    // Keep dismissal for this session when browser storage is unavailable.
  }
}
