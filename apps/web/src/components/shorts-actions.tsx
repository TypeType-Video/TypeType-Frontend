import { Clock3, MessageCircle, Share2, Star } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { useFavoriteStatus } from "../hooks/use-favorite-status";
import { useShareUrl } from "../hooks/use-share-url";
import { useWatchLaterPlaylist } from "../hooks/use-watch-later-playlist";
import { shortsRouteKey, toPublicShortsUrl } from "../lib/shorts-route";
import { toWatchLaterPayload } from "../lib/watch-later-mappers";
import type { VideoStream } from "../types/stream";
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

  function handleShare() {
    void share(toPublicShortsUrl(stream.id, window.location.origin));
  }

  return (
    <div className={`pointer-events-auto flex flex-col items-center gap-3 ${className ?? ""}`}>
      <ShortsActionButton
        icon={Star}
        label="Favorite"
        stateLabel={favorited ? "Saved" : "Save"}
        active={favorited}
        disabled={favoritesPending}
        compact={compact}
        onClick={() => void toggleFavorite()}
      />
      <ShortsActionButton
        icon={Clock3}
        label="Watch later"
        stateLabel={savedForLater ? "Saved" : "Watch Later"}
        active={savedForLater}
        disabled={watchLater.isPending}
        compact={compact}
        onClick={() => void toggleWatchLater()}
      />
      {showComments && (
        <ShortsActionButton
          icon={MessageCircle}
          label="Comments"
          compact={compact}
          onClick={onOpenComments}
        />
      )}
      <ShortsActionButton
        icon={Share2}
        label="Share"
        stateLabel={copied ? "Copied" : "Link"}
        compact={compact}
        onClick={handleShare}
      />
    </div>
  );
}
