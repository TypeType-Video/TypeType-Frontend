import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Film } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { useBlockedFilter } from "../hooks/use-blocked-filter";
import { useSettings } from "../hooks/use-settings";
import { fetchHomeRecommendations } from "../lib/api-recommendations";
import { formatDuration } from "../lib/format";
import { mapVideoItem } from "../lib/mappers";
import { watchListSearch } from "../lib/watch-url";
import { m } from "../paraglide/messages.js";

export function SearchPanelVideos({ service, onClose }: { service: number; onClose: () => void }) {
  const { isAuthed, authReady } = useAuth();
  const { settings } = useSettings();
  const { filter, ready } = useBlockedFilter();
  const query = useQuery({
    queryKey: ["search-panel-videos", service],
    queryFn: () => fetchHomeRecommendations(service, 6, undefined, "quick"),
    enabled: authReady && isAuthed && !settings.hideHomeRecommendations,
    staleTime: 90_000,
    gcTime: 120_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
  if (settings.hideHomeRecommendations) return null;
  const streams = ready ? filter((query.data?.items ?? []).map(mapVideoItem)).slice(0, 3) : [];
  return (
    <section
      aria-label={m.ui_recommended()}
      className="min-w-0 border-t border-border pt-3 md:border-l md:border-t-0 md:pl-4 md:pt-0"
    >
      <h3 className="mb-3 px-2 text-xs font-medium text-fg-soft">{m.ui_recommended()}</h3>
      {query.isLoading ? (
        <p role="status" className="px-2 py-4 text-xs text-fg-soft">
          {m.ui_loading()}
        </p>
      ) : query.isError ? (
        <button
          type="button"
          onClick={() => void query.refetch()}
          className="rounded px-2 py-4 text-sm text-fg-muted hover:bg-surface-strong"
        >
          {m.ui_retry()}
        </button>
      ) : streams.length === 0 ? (
        <p className="px-2 py-4 text-xs text-fg-soft">{m.search_panel_no_videos()}</p>
      ) : (
        streams.map((stream) => (
          <Link
            key={stream.id}
            to="/watch"
            search={watchListSearch(stream.id)}
            onClick={onClose}
            preload={false}
            className="flex min-w-0 items-center gap-3 rounded-md p-2 hover:bg-surface-strong focus-visible:outline focus-visible:outline-fg-soft"
          >
            <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded bg-surface-strong">
              <Film
                size={20}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-fg-soft"
                aria-hidden="true"
              />
              {stream.thumbnail && (
                <img
                  src={stream.thumbnail}
                  alt=""
                  loading="lazy"
                  className="relative h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.visibility = "hidden";
                  }}
                />
              )}
              {stream.duration > 0 && (
                <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 text-[10px] text-white">
                  {formatDuration(stream.duration)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="line-clamp-2 break-words text-xs font-medium text-fg">{stream.title}</p>
              <p className="mt-1 truncate text-[11px] text-fg-soft">{stream.channelName}</p>
            </div>
          </Link>
        ))
      )}
    </section>
  );
}
