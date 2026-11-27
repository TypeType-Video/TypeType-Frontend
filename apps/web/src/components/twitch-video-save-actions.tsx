import { useRef, useState } from "react";
import { useAuth } from "../hooks/use-auth";
import { useFavoriteStatus } from "../hooks/use-favorite-status";
import { twitchVideoStream } from "../lib/twitch-saved-video";
import { m } from "../paraglide/messages.js";
import type { TwitchVideo } from "../types/twitch";
import { PlaylistAddDropdown } from "./playlist-add-dropdown";
import { Toast } from "./toast";
import { WatchActionButton } from "./watch-action-button";
import { ListPlusIcon, StarIcon } from "./watch-icons";

export function TwitchVideoSaveActions({ video }: { video: TwitchVideo }) {
  const stream = twitchVideoStream(video);
  const { isAuthed } = useAuth();
  const favorite = useFavoriteStatus(stream.id);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const saveRef = useRef<HTMLButtonElement>(null);

  function saved(label: string) {
    setToast(label);
    setTimeout(() => setToast(null), 2000);
  }

  async function toggleFavorite() {
    if (favorite.isFavorite) {
      await favorite.remove();
      saved(m.watch_removed_favorites());
    } else {
      await favorite.add();
      saved(m.watch_saved_favorites());
    }
  }

  if (!isAuthed) return null;
  return (
    <div className="flex items-center gap-1">
      <Toast message={toast} />
      <WatchActionButton
        onClick={() => void toggleFavorite()}
        disabled={favorite.isPending}
        pressed={favorite.isFavorite}
        active={favorite.isFavorite}
      >
        <StarIcon filled={favorite.isFavorite} />
        <span className="typetype-adaptive-label">
          {favorite.isFavorite ? m.watch_favorited() : m.watch_favorite()}
        </span>
      </WatchActionButton>
      <WatchActionButton
        buttonRef={saveRef}
        onClick={() => setPlaylistOpen((open) => !open)}
        pressed={playlistOpen}
        active={playlistOpen}
      >
        <ListPlusIcon />
        <span className="typetype-adaptive-label">{m.watch_save()}</span>
      </WatchActionButton>
      {playlistOpen && (
        <PlaylistAddDropdown
          stream={stream}
          anchorEl={saveRef.current}
          onClose={() => setPlaylistOpen(false)}
          onSaved={saved}
        />
      )}
    </div>
  );
}
