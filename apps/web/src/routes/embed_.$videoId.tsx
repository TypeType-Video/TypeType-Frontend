import { createFileRoute } from "@tanstack/react-router";
import { EmbedError } from "../components/embed-error";
import { EmbedGuestRequired } from "../components/embed-guest-required";
import { EmbedLoading } from "../components/embed-loading";
import { EmbedPlayerShell } from "../components/embed-player-shell";
import { useAuth } from "../hooks/use-auth";
import { useInstance } from "../hooks/use-instance";
import { usePlaybackMode } from "../hooks/use-playback-mode";
import { useSettings } from "../hooks/use-settings";
import {
  isMemberOnlyApiError,
  isStreamUnavailableError,
  MEMBER_ONLY_MESSAGE,
  useSabrBootstrap,
  useStream,
} from "../hooks/use-stream";
import { FAMILY_LIST_BLOCKED_MESSAGE, isChannelNotAllowedError } from "../lib/allow-list-error";
import { ApiError } from "../lib/api";
import { isYoutubeSessionReconnectError } from "../lib/api-youtube-session";
import { parseStartTime } from "../lib/parse-start-time";
import { selectProgressiveWatchStream } from "../lib/progressive-watch-stream";
import { toPublicWatchParam, toWatchSourceUrl } from "../lib/watch-url";

type EmbedSearch = {
  t?: string | number;
  start?: string | number;
  time_continue?: string | number;
  autoplay?: number;
};

function EmbedPage() {
  const { videoId } = Route.useParams();
  const { t, start, time_continue, autoplay } = Route.useSearch();
  const sourceUrl = toWatchSourceUrl(videoId);
  const watchUrl = `/watch?v=${encodeURIComponent(toPublicWatchParam(sourceUrl))}`;
  const {
    data: instance,
    isPending: instancePending,
    isError: instanceError,
    refetch: retryInstance,
  } = useInstance();
  const { authReady, isAuthed } = useAuth();
  const { settings, settingsReady } = useSettings();
  const { playbackMode } = usePlaybackMode();
  const guestAllowed = instance?.guestAllowed ?? false;
  const useAuthenticatedStream =
    isAuthed && (settings.accessMode === "allow_list" || instance?.guestAllowed === false);
  const streamEnabled = (guestAllowed || isAuthed) && authReady && (!isAuthed || settingsReady);
  const streamQuery = useStream(sourceUrl, useAuthenticatedStream, streamEnabled, playbackMode);
  const bootstrap = useSabrBootstrap(
    sourceUrl,
    useAuthenticatedStream,
    streamEnabled,
    playbackMode,
  );
  const publicParam = toPublicWatchParam(sourceUrl);
  const activeStream = selectProgressiveWatchStream(
    streamQuery.isPlaceholderData ? undefined : streamQuery.data,
    playbackMode === "sabr" ? bootstrap.data : undefined,
    publicParam,
    [],
  );
  const startTime = parseStartTime(t ?? start ?? time_continue) * 1000;
  const shouldAutoplay = autoplay === 1;

  if (instancePending) return <EmbedLoading />;

  if (instanceError || !instance)
    return <EmbedError message="Could not load player." onRetry={() => void retryInstance()} />;

  if (!guestAllowed && !isAuthed) return <EmbedGuestRequired watchUrl={watchUrl} />;

  const pending = streamQuery.isLoading || bootstrap.isLoading;
  if (!activeStream && (!streamEnabled || pending)) return <EmbedLoading />;

  if (!activeStream) {
    const activeError = streamQuery.error ?? bootstrap.error;
    const genericExtractorError =
      activeError instanceof ApiError &&
      activeError.status === 422 &&
      activeError.message ===
        "Error occurs when fetching the page. Try increase the loading timeout in Settings.";
    const isMemberOnlyError = isMemberOnlyApiError(activeError) || genericExtractorError;
    const needsYoutubeSession = isYoutubeSessionReconnectError(activeError);
    const familyListBlocked = isChannelNotAllowedError(activeError);
    const message = isMemberOnlyError
      ? MEMBER_ONLY_MESSAGE
      : familyListBlocked
        ? FAMILY_LIST_BLOCKED_MESSAGE
        : needsYoutubeSession
          ? "Connect YouTube to load this browser-only video."
          : activeError instanceof ApiError &&
              (activeError.status === 400 || activeError.status === 422)
            ? activeError.message
            : isStreamUnavailableError(activeError)
              ? "This video is currently unavailable"
              : "Failed to load stream.";
    return (
      <EmbedError
        message={message}
        onRetry={
          needsYoutubeSession || familyListBlocked
            ? undefined
            : () => {
                void streamQuery.refetch();
                void bootstrap.refetch();
              }
        }
      />
    );
  }

  if (activeStream.requiresMembership) {
    return <EmbedError message={MEMBER_ONLY_MESSAGE} />;
  }

  return (
    <EmbedPlayerShell
      stream={activeStream}
      sourceUrl={sourceUrl}
      startTime={startTime}
      autoplay={shouldAutoplay}
      isAuthed={isAuthed}
    />
  );
}

export const Route = createFileRoute("/embed_/$videoId")({
  validateSearch: (search: Record<string, unknown>): EmbedSearch => ({
    t: typeof search.t === "string" || typeof search.t === "number" ? search.t : undefined,
    start:
      typeof search.start === "string" || typeof search.start === "number"
        ? search.start
        : undefined,
    time_continue:
      typeof search.time_continue === "string" || typeof search.time_continue === "number"
        ? search.time_continue
        : undefined,
    autoplay: typeof search.autoplay === "number" ? search.autoplay : undefined,
  }),
  component: EmbedPage,
});
