import type { YoutubeRemotePhase } from "../hooks/use-youtube-remote-browser";
import { m } from "../paraglide/messages.js";

export function youtubeRemotePhaseLabel(phase: YoutubeRemotePhase): string {
  if (phase === "connecting") return m.ui_remote_phase_connecting();
  if (phase === "opening") return m.ui_remote_phase_opening();
  if (phase === "awaiting_login") return m.ui_remote_phase_awaiting_login();
  if (phase === "capturing_session") return m.ui_remote_phase_capturing_session();
  if (phase === "connected") return m.ui_remote_phase_connected();
  if (phase === "closed") return m.ui_remote_phase_closed();
  if (phase === "error") return m.ui_remote_phase_error();
  return m.ui_remote_phase_idle();
}
