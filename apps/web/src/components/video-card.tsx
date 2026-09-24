import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { memo, useCallback, useEffect, useRef } from "react";
import { useClientLocale } from "../hooks/use-client-locale";
import { useDeArrowBranding } from "../hooks/use-dearrow";
import { streamQueryOptions } from "../hooks/use-stream";
import { useVideoCardPreview } from "../hooks/use-video-card-preview";
import { formatDuration, formatPublishedDate, formatViews } from "../lib/format";
import { detectProvider } from "../lib/provider";
import { isVideoWatched } from "../lib/watch-progress";
import { watchListSearch } from "../lib/watch-url";
import { useAuthStore } from "../stores/auth-store";
import { useWatchNavigationStore } from "../stores/watch-navigation-store";
import type { VideoStream } from "../types/stream";
import { ChannelAvatar } from "./channel-avatar";
import { ChannelRouteLink } from "./channel-route-link";
import { VideoCardFeedbackMenu } from "./video-card-feedback-menu";
import { VideoMembershipBadge } from "./video-membership-badge";
import { VideoPreview } from "./video-preview";
import { VideoProgressBar } from "./video-progress-bar";
import { VideoStatusBadge } from "./video-status-badge";
import { VerifiedBadgeIcon } from "./watch-icons";
import { WatchedBadge } from "./watched-badge";

const LIVE_STREAM_PREFETCH_DELAY_MS = 200;

type Props = {
  stream: VideoStream;
  onOpen?: () => void;
  onImpression?: () => void;
  listId?: string;
  relatedStreams?: VideoStream[];
  progressMs?: number;
};

function VideoCardComponent({
  stream,
  onOpen,
  onImpression,
  listId,
  relatedStreams,
  progressMs = 0,
}: Props) {
  const locale = useClientLocale();
  const rootRef = useRef<HTMLElement | null>(null);
  const queryClient = useQueryClient();
  const livePrefetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setNavigation = useWatchNavigationStore((state) => state.setNavigation);
  const preview = useVideoCardPreview(stream);
  const { title, thumbnail } = useDeArrowBranding(
    stream.id,
    stream.title,
    stream.thumbnail,
    stream.duration,
  );
  const publishedText = formatPublishedDate(stream.publishedAt, undefined, locale);
  const progressSeconds = Math.max(0, progressMs / 1_000);
  const watched = !stream.isLive && isVideoWatched(progressSeconds, stream.duration);
  const watchSearch = watchListSearch(stream.id, listId);
  const prefetchableLive =
    stream.isLive === true &&
    stream.requiresMembership !== true &&
    detectProvider(stream.id) === "youtube";
  const prefetchLiveStream = useCallback(() => {
    if (!prefetchableLive) return;
    void queryClient.prefetchQuery(
      streamQueryOptions(stream.id, Boolean(useAuthStore.getState().token), true, true),
    );
  }, [prefetchableLive, queryClient, stream.id]);
  const scheduleLivePrefetch = useCallback(() => {
    if (!prefetchableLive || livePrefetchTimer.current !== null) return;
    livePrefetchTimer.current = setTimeout(() => {
      livePrefetchTimer.current = null;
      prefetchLiveStream();
    }, LIVE_STREAM_PREFETCH_DELAY_MS);
  }, [prefetchLiveStream, prefetchableLive]);
  const clearLivePrefetch = useCallback(() => {
    if (livePrefetchTimer.current === null) return;
    clearTimeout(livePrefetchTimer.current);
    livePrefetchTimer.current = null;
  }, []);

  useEffect(() => clearLivePrefetch, [clearLivePrefetch]);
  const handleOpen = useCallback(() => {
    clearLivePrefetch();
    prefetchLiveStream();
    setNavigation(stream, relatedStreams);
    onOpen?.();
  }, [clearLivePrefetch, onOpen, prefetchLiveStream, relatedStreams, setNavigation, stream]);

  useEffect(() => {
    if (!onImpression || typeof IntersectionObserver === "undefined") return;
    const element = rootRef.current;
    if (!element) return;
    let seen = false;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (seen || !entry.isIntersecting || entry.intersectionRatio < 0.6) continue;
          seen = true;
          onImpression();
          observer.disconnect();
        }
      },
      { threshold: [0.6] },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [onImpression]);

  return (
    <article
      ref={rootRef}
      className="group flex flex-col gap-2"
      onMouseEnter={preview.onMouseEnter}
      onMouseLeave={preview.onMouseLeave}
    >
      <Link
        to="/watch"
        search={watchSearch}
        preload="intent"
        className="block"
        onPointerEnter={scheduleLivePrefetch}
        onPointerLeave={clearLivePrefetch}
        onFocus={prefetchLiveStream}
        onMouseDown={handleOpen}
        onTouchStart={handleOpen}
        onClick={handleOpen}
      >
        <div className="relative aspect-video overflow-hidden rounded-xl bg-surface-strong sm:rounded-lg">
          <div
            className={`absolute inset-0 transition-opacity ${watched ? "grayscale opacity-60" : ""}`}
          >
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
              decoding="async"
            />
            <VideoPreview stream={preview.previewStream} show={preview.showPreview} />
          </div>
          {preview.memberOnly && (
            <span className="absolute left-2 top-2">
              <VideoMembershipBadge />
            </span>
          )}
          {(stream.isLive || stream.isPostLive) && (
            <span className="absolute bottom-1.5 left-1.5">
              <VideoStatusBadge stream={stream} />
            </span>
          )}
          {watched && (
            <span className="absolute right-2 top-2">
              <WatchedBadge />
            </span>
          )}
          {!stream.isLive && stream.duration > 0 && (
            <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs px-1 rounded">
              {formatDuration(stream.duration)}
            </span>
          )}
          {!stream.isLive && (
            <VideoProgressBar progress={progressSeconds} duration={stream.duration} />
          )}
        </div>
      </Link>
      <div className="flex gap-2 px-1 sm:px-0">
        {stream.channelUrl ? (
          <ChannelRouteLink url={stream.channelUrl} className="flex-shrink-0 mt-0.5">
            <ChannelAvatar
              src={stream.channelAvatar}
              name={stream.channelName}
              className="w-8 h-8"
            />
          </ChannelRouteLink>
        ) : (
          <ChannelAvatar src={stream.channelAvatar} name={stream.channelName} className="w-8 h-8" />
        )}
        <div className="flex flex-col gap-0.5 min-w-0">
          <Link
            to="/watch"
            search={watchSearch}
            preload="intent"
            className="text-sm font-medium text-fg line-clamp-2 leading-snug hover:text-fg-strong"
            onPointerEnter={scheduleLivePrefetch}
            onPointerLeave={clearLivePrefetch}
            onFocus={prefetchLiveStream}
            onMouseDown={handleOpen}
            onTouchStart={handleOpen}
            onClick={handleOpen}
          >
            {title}
          </Link>
          {stream.channelUrl ? (
            <ChannelRouteLink
              url={stream.channelUrl}
              className="text-xs text-fg-muted hover:text-fg transition-colors w-fit flex items-center gap-1"
            >
              {stream.channelName}
              {stream.uploaderVerified && <VerifiedBadgeIcon />}
            </ChannelRouteLink>
          ) : (
            <p className="text-xs text-fg-muted flex items-center gap-1">
              {stream.channelName}
              {stream.uploaderVerified && <VerifiedBadgeIcon />}
            </p>
          )}
          <p className="text-xs text-fg-soft">
            {formatViews(stream.views)}
            {publishedText && ` · ${publishedText}`}
          </p>
        </div>
        <VideoCardFeedbackMenu stream={stream} />
      </div>
    </article>
  );
}

export const VideoCard = memo(VideoCardComponent);
