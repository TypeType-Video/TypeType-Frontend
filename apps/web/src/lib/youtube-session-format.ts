import { m } from "../paraglide/messages.js";
import type { YoutubeSessionStatus } from "./api-youtube-session";

export function youtubeSessionStatusLabel(status: YoutubeSessionStatus | undefined): string {
  if (status === "connected") return m.ui_connected();
  if (status === "needs_reconnect") return m.ui_reconnect_needed();
  return m.ui_not_connected();
}

export function youtubeSessionStatusDescription(status: YoutubeSessionStatus | undefined): string {
  if (status === "connected") return m.ui_typetype_can_use_this_session();
  if (status === "needs_reconnect") return m.ui_youtube_rejected_stored_session();
  return m.ui_no_youtube_session_connected();
}

export function formatSessionTime(value: number | undefined): string {
  if (!value) return m.ui_never();
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}
