import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef } from "react";
import { StreamError } from "../components/stream-error";
import { WatchPageSkeleton } from "../components/watch-page-skeleton";
import { WatchStreamError } from "../components/watch-stream-error";
import { useAuth } from "../hooks/use-auth";
import { useDocumentTitle } from "../hooks/use-document-title";
import { useHistory } from "../hooks/use-history";
import { useInstance } from "../hooks/use-instance";
import { useProgress } from "../hooks/use-progress";
import { useSettings } from "../hooks/use-settings";
import { useSabrBootstrap, useStream } from "../hooks/use-stream";
import { selectProgressiveWatchStream } from "../lib/progressive-watch-stream";
import { proxyImage } from "../lib/proxy";
import { videoAvailabilityCopy } from "../lib/video-availability";
import { resolveWatchStartTime } from "../lib/watch-resume";
import { toPublicWatchParam, toWatchSourceUrl, youtubeThumbnailUrl } from "../lib/watch-url";
import { useWatchNavigationStore } from "../stores/watch-navigation-store";

const WatchLayout = lazy(() =>
  import("../components/watch-layout").then((module) => ({ default: module.WatchLayout })),
);

function WatchPage() {
  const { v, list, shuffle } = Route.useSearch();
  const navigate = useNavigate({ from: "/watch" });
  const sourceUrl = toWatchSourceUrl(v);
  const publicParam = toPublicWatchParam(sourceUrl);
  const { authReady, isAuthed } = useAuth();
  const { data: instance, isPending: instancePending } = useInstance();
  const { settings, settingsReady } = useSettings();
  const navigationSnapshot = useWatchNavigationStore((state) => state.snapshot);
  const useAuthenticatedStream =
    isAuthed && (settings.accessMode === "allow_list" || instance?.guestAllowed === false);
  const streamEnabled = authReady && !instancePending && (!isAuthed || settingsReady);
  const streamQuery = useStream(sourceUrl, useAuthenticatedStream, streamEnabled);
  const bootstrap = useSabrBootstrap(sourceUrl, useAuthenticatedStream, streamEnabled);
  const { add } = useHistory();
  const progressFetch = useProgress(sourceUrl);
  const previewMatches =
    navigationSnapshot && toPublicWatchParam(navigationSnapshot.stream.id) === publicParam;
  const previewStream = previewMatches ? navigationSnapshot.stream : undefined;
  const previewRelated = previewMatches ? navigationSnapshot.relatedStreams : [];
  const availabilityPoster = proxyImage(
    previewStream?.rawThumbnail ?? youtubeThumbnailUrl(publicParam) ?? "",
  );
  const activeStream = selectProgressiveWatchStream(
    streamQuery.isPlaceholderData ? undefined : streamQuery.data,
    bootstrap.data,
    publicParam,
    previewRelated,
  );
  useDocumentTitle(activeStream?.title ?? previewStream?.title);
  const loadingPage = (
    <WatchPageSkeleton
      stream={previewStream}
      relatedStreams={previewRelated}
      videoUrl={sourceUrl}
      showComments={!settings.hideComments}
    />
  );

  const addToHistoryRef = useRef(add.mutate);
  addToHistoryRef.current = add.mutate;
  const historyAddedForRef = useRef<string | null>(null);
  const resumePending = isAuthed && progressFetch.isPending;

  useEffect(() => {
    if (v.trim() && publicParam !== v.trim()) {
      navigate({ search: (prev) => ({ ...prev, v: publicParam }), replace: true });
    }
  }, [navigate, publicParam, v]);

  useEffect(() => {
    if (!activeStream || resumePending) return;
    if (historyAddedForRef.current === activeStream.id) return;
    const historyPositionMs =
      progressFetch.data?.position ?? (activeStream.startPosition ?? 0) * 1000;
    const progress = Math.max(0, Math.round(historyPositionMs / 1000));
    historyAddedForRef.current = activeStream.id;
    addToHistoryRef.current({
      url: activeStream.id,
      title: activeStream.title,
      thumbnail: activeStream.rawThumbnail,
      channelName: activeStream.channelName,
      channelUrl: activeStream.channelUrl ?? "",
      channelAvatar: activeStream.rawChannelAvatar,
      duration: activeStream.duration,
      publishedAt: activeStream.publishedAt,
      viewCount: activeStream.views,
      progress,
    });
  }, [activeStream, progressFetch.data?.position, resumePending]);

  const pending = streamQuery.isLoading || bootstrap.isLoading;
  if (resumePending) return loadingPage;
  if (!activeStream && (!streamEnabled || pending)) return loadingPage;

  if (!activeStream) {
    const activeError = streamQuery.error ?? bootstrap.error;
    return (
      <WatchStreamError
        error={activeError}
        publicParam={publicParam}
        list={list}
        shuffle={shuffle}
        poster={availabilityPoster}
        onRetry={() => {
          void streamQuery.refetch();
          void bootstrap.refetch();
        }}
      />
    );
  }

  if (activeStream.requiresMembership) {
    return (
      <StreamError
        message={videoAvailabilityCopy("members_only").message}
        availability="members_only"
        poster={activeStream.thumbnail}
      />
    );
  }

  const startTime =
    resolveWatchStartTime({
      authenticated: isAuthed,
      progressPending: progressFetch.isPending,
      savedPositionMs: progressFetch.data?.position,
      serverPositionSeconds: activeStream.startPosition,
      durationSeconds: activeStream.duration,
    }) ?? 0;
  const navigating = toPublicWatchParam(activeStream.id) !== publicParam;

  return (
    <Suspense
      fallback={
        <WatchPageSkeleton
          stream={activeStream}
          relatedStreams={activeStream.related}
          videoUrl={sourceUrl}
          showComments={!settings.hideComments}
        />
      }
    >
      <WatchLayout
        key={activeStream.id}
        stream={activeStream}
        startTime={startTime}
        currentParam={publicParam}
        navigating={navigating}
        list={list}
        shuffle={shuffle}
      />
    </Suspense>
  );
}

export const Route = createFileRoute("/watch")({
  validateSearch: (search: Record<string, unknown>) => ({
    v: typeof search.v === "string" ? search.v.trim() : "",
    ...(typeof search.list === "string" && search.list ? { list: search.list } : {}),
    ...(typeof search.shuffle === "string" && search.shuffle ? { shuffle: search.shuffle } : {}),
  }),
  component: WatchPage,
});
