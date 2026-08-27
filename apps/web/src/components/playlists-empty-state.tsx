import { m } from "../paraglide/messages.js";
export function PlaylistsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-32 text-center">
      <p className="text-fg-muted text-sm">{m.ui_no_playlists_yet()}</p>
      <p className="text-fg-soft text-xs">{m.ui_use_the_new_playlist_button_to_get_started()}</p>
    </div>
  );
}
