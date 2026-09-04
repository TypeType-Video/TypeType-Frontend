import { Clock3, MessageCircle, Share2, Star } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../hooks/use-auth";
import { useFavoriteStatus } from "../hooks/use-favorite-status";
import { useShareUrl } from "../hooks/use-share-url";
import { useWatchLaterPlaylist } from "../hooks/use-watch-later-playlist";
import { shortsRouteKey, toPublicShortsUrl } from "../lib/shorts-route";
import { toWatchLaterPayload } from "../lib/watch-later-mappers";
import { m } from "../paraglide/messages.js";
import type { VideoStream } from "../types/stream";
import { ShareSheet } from "./share-sheet";
import { ShortsActionButton } from "./shorts-action-button";

type Props = {
  stream: VideoStream;
  onOpenComments: () => void;
  className?: string;
  compact?: boolean;
  showComments?: boolean;
};

export function ShortsActions({
  stream,
  onOpenComments,
  className,
  compact,
  showComments = true,
}: Props) {
  const { isAuthed } = useAuth();
  const { copied, share } = useShareUrl();
  const [shareOpen, setShareOpen] = useState(false);
  const {
    add: addFavorite,
    remove: removeFavorite,
    isFavorite: favorited,
    isPending: favoritesPending,
  } = useFavoriteStatus(stream.id);
  const watchLater = useWatchLaterPlaylist();

  const savedForLater = watchLater.isInWatchLater(stream.id);

  function requireAuth(): boolean {
    if (isAuthed) return true;
    const redirect = `/shorts?v=${encodeURIComponent(shortsRouteKey(stream.id))}`;
    window.location.assign(`/login?redirect=${encodeURIComponent(redirect)}`);
    return false;
  }

  async function toggleFavorite() {
    if (!requireAuth()) return;
    if (favorited) {
      await removeFavorite();
      return;
    }
    await addFavorite();
  }

  async function toggleWatchLater() {
    if (!requireAuth()) return;
    await watchLater.toggle(toWatchLaterPayload(stream));
  }

  return (
    <div className={`pointer-events-auto flex flex-col items-center gap-3 ${className ?? ""}`}>
      <ShortsActionButton
        icon={Star}
        label={m.watch_favorite()}
        stateLabel={favorited ? m.watch_saved_favorites() : m.watch_save()}
        active={favorited}
        disabled={favoritesPending}
        compact={compact}
        onClick={() => void toggleFavorite()}
      />
      <ShortsActionButton
        icon={Clock3}
        label={m.portability_category_watch_later()}
        stateLabel={savedForLater ? m.watch_saved_later() : m.watch_save()}
        active={savedForLater}
        disabled={watchLater.isPending}
        compact={compact}
        onClick={() => void toggleWatchLater()}
      />
      {showComments && (
        <ShortsActionButton
          icon={MessageCircle}
          label={m.watch_comments()}
          compact={compact}
          onClick={onOpenComments}
        />
      )}
      <ShortsActionButton
        icon={Share2}
        label={m.watch_share()}
        stateLabel={copied ? m.ui_copied() : m.ui_link()}
        compact={compact}
        onClick={() => setShareOpen(true)}
      />
      {shareOpen && (
        <ShareSheet
          sourceUrl={stream.id}
          typetypeUrl={toPublicShortsUrl(stream.id, window.location.origin)}
          title={stream.title}
          onShare={(url, title) => void share(url, title)}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}
