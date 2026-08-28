import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CollectionPageHeader } from "../components/collection-page-header";
import { PlaylistGrid } from "../components/playlist-grid";
import { PlaylistSortMenu } from "../components/playlist-sort-menu";
import { VideoGridSkeleton } from "../components/video-grid-skeleton";
import { useBlockedFilter } from "../hooks/use-blocked-filter";
import { useFavoriteStreams } from "../hooks/use-favorite-streams";
import { useFavoritesPlaylist } from "../hooks/use-favorites-playlist";
import { randomShuffleSeed, shuffleByKey } from "../lib/playlist-shuffle";
import { type PlaylistSortMode, sortPlaylistVideos } from "../lib/playlist-sort";
import { markWatchAutoplayIntent } from "../lib/watch-autoplay-intent";
import { toPublicWatchParam } from "../lib/watch-url";
import { m } from "../paraglide/messages.js";

const FAVORITES_BATCH_SIZE = 12;

function FavoritesPage() {
  const navigate = useNavigate();
  const [limit, setLimit] = useState(FAVORITES_BATCH_SIZE);
  const [sortMode, setSortMode] = useState<PlaylistSortMode>("added-new");
  const { videos, playlistVideos, count, isLoading } = useFavoriteStreams();
  const favorites = useFavoritesPlaylist();
  const { filter } = useBlockedFilter();
  const visibleVideos = useMemo(() => filter(videos), [filter, videos]);
  const visibleIds = useMemo(
    () => new Set(visibleVideos.map((video) => video.id)),
    [visibleVideos],
  );
  const visiblePlaylistVideos = useMemo(
    () => sortPlaylistVideos(playlistVideos, sortMode).filter((video) => visibleIds.has(video.url)),
    [playlistVideos, sortMode, visibleIds],
  );
  const displayedPlaylistVideos = visiblePlaylistVideos.slice(0, limit);
  const canLoadMore = displayedPlaylistVideos.length < visiblePlaylistVideos.length;

  function playVideo(videoUrl: string | undefined, shuffle?: string) {
    if (!videoUrl) return;
    markWatchAutoplayIntent();
    navigate({
      to: "/watch",
      search: { v: toPublicWatchParam(videoUrl), ...(shuffle ? { shuffle } : {}) },
    });
  }

  return (
    <div className="flex flex-col gap-6 pt-2 sm:pt-4 [animation:page-fade-in_0.2s_ease-out]">
      <CollectionPageHeader
        title={m.portability_category_favorites()}
        count={count}
        loading={isLoading}
        canPlay={visiblePlaylistVideos.length > 0}
        onPlayAll={() => playVideo(visiblePlaylistVideos[0]?.url)}
        onShuffle={() => {
          const seed = randomShuffleSeed();
          const shuffled = shuffleByKey(visiblePlaylistVideos, seed);
          const first = shuffled[0];
          playVideo(first?.url, seed);
        }}
      />
      {!isLoading && videos.length > 0 && (
        <PlaylistSortMenu value={sortMode} onChange={setSortMode} />
      )}
      {isLoading ? (
        <VideoGridSkeleton idPrefix="favorites" />
      ) : videos.length === 0 ? (
        <p className="py-24 text-center text-sm text-fg-muted">{m.ui_no_favorites_yet()}</p>
      ) : (
        <>
          <PlaylistGrid
            videos={displayedPlaylistVideos}
            reorderable={false}
            listId=""
            onRemove={(video) => void favorites.remove(video.url)}
            onReorder={() => undefined}
          />
          {canLoadMore && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setLimit((current) => current + FAVORITES_BATCH_SIZE)}
                className="rounded-lg bg-surface-strong px-4 py-2 text-sm text-fg transition-colors hover:bg-surface-soft"
              >
                {m.ui_load_more()}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export const Route = createFileRoute("/favorites")({ component: FavoritesPage });
