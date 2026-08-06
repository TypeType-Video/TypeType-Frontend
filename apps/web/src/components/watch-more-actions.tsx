import { useRef, useState } from "react";
import { useBlocked } from "../hooks/use-blocked";
import { useBlockedFilter } from "../hooks/use-blocked-filter";
import { useWatchLaterPlaylist } from "../hooks/use-watch-later-playlist";
import { goto } from "../lib/route-redirect";
import { watchLaterResultLabel } from "../lib/watch-later-labels";
import { toWatchLaterPayload } from "../lib/watch-later-mappers";
import type { VideoStream } from "../types/stream";
import { VideoBlockActionsDropdown } from "./video-block-actions-dropdown";
import { MoreIcon } from "./watch-icons";

type Props = {
  stream: VideoStream;
  isAuthed: boolean;
  onSaved: (label: string) => void;
  className: string;
};

export function WatchMoreActions({ stream, isAuthed, onSaved, className }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuAnchorRef = useRef<HTMLButtonElement>(null);
  const watchLater = useWatchLaterPlaylist();
  const { addChannel, removeChannel, addVideo, removeVideo } = useBlocked();
  const { findBlockedChannel, findBlockedVideo } = useBlockedFilter();
  const blockedChannel = findBlockedChannel({
    url: stream.channelUrl,
    name: stream.channelName,
  });
  const blockedVideo = findBlockedVideo(stream);
  const channelBlocked = blockedChannel !== undefined;
  const videoBlocked = blockedVideo !== undefined;

  function ensureAuth(): boolean {
    if (isAuthed) return true;
    goto("/");
    return false;
  }

  function toggleVideoBlock() {
    if (!ensureAuth()) return;
    if (videoBlocked) {
      removeVideo.mutate(blockedVideo?.url ?? stream.id);
      onSaved("Video unblocked");
      return;
    }
    addVideo.mutate({ url: stream.id, global: false });
    onSaved("Video blocked");
  }

  function toggleChannelBlock() {
    if (!stream.channelUrl || !ensureAuth()) return;
    if (channelBlocked) {
      removeChannel.mutate(blockedChannel?.url ?? stream.channelUrl);
      onSaved("Channel unblocked");
      return;
    }
    addChannel.mutate({
      url: stream.channelUrl,
      name: stream.channelName,
      thumbnailUrl: stream.channelAvatar,
      global: false,
    });
    onSaved(`Channel blocked: ${stream.channelName}`);
  }

  async function toggleWatchLater() {
    if (!ensureAuth()) return;
    try {
      const saved = await watchLater.toggle(toWatchLaterPayload(stream));
      onSaved(watchLaterResultLabel(saved));
    } catch {
      onSaved("Could not update Watch later");
    }
  }

  return (
    <>
      <button
        ref={menuAnchorRef}
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        className={className}
      >
        <MoreIcon />
        More
      </button>
      {menuOpen && (
        <VideoBlockActionsDropdown
          anchorEl={menuAnchorRef.current}
          onClose={() => setMenuOpen(false)}
          onToggleWatchLater={() => void toggleWatchLater()}
          onToggleVideoBlock={toggleVideoBlock}
          onToggleChannelBlock={stream.channelUrl ? toggleChannelBlock : undefined}
          watchLaterSaved={watchLater.isInWatchLater(stream.id)}
          watchLaterPending={watchLater.isPending}
          videoBlocked={videoBlocked}
          channelBlocked={channelBlocked}
        />
      )}
    </>
  );
}
