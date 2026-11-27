import { useRef, useState } from "react";
import { useAuth } from "../hooks/use-auth";
import { twitchVideoStream } from "../lib/twitch-saved-video";
import { m } from "../paraglide/messages.js";
import type { TwitchVideo } from "../types/twitch";
import { PlaylistAddDropdown } from "./playlist-add-dropdown";
import { Toast } from "./toast";
import { MoreIcon } from "./watch-icons";

export function TwitchVideoCardMenu({ video }: { video: TwitchVideo }) {
  const { isAuthed } = useAuth();
  const menuRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function saved(label: string) {
    setToast(label);
    setTimeout(() => setToast(null), 2000);
  }

  if (!isAuthed) return null;
  return (
    <>
      <button
        ref={menuRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex-shrink-0 rounded-md p-1 text-fg-muted transition-colors hover:bg-surface-strong hover:text-fg"
        aria-label={m.watch_video_options()}
        aria-expanded={open}
      >
        <MoreIcon />
      </button>
      {open && (
        <PlaylistAddDropdown
          stream={twitchVideoStream(video)}
          anchorEl={menuRef.current}
          onClose={() => setOpen(false)}
          onSaved={saved}
        />
      )}
      <Toast message={toast} />
    </>
  );
}
