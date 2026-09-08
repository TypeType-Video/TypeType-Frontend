export const COMMUNITY_ANNOUNCEMENT_KEY = "typetype-announcement-lemmy-1";
export const LEMMY_COMMUNITY_URL = "https://lemmy.zip/c/TypeType";

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
