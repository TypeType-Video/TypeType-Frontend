import { createFileRoute } from "@tanstack/react-router";
import { EmbedError } from "../components/embed-error";
import { EmbedGuestRequired } from "../components/embed-guest-required";
import { EmbedLoading } from "../components/embed-loading";
import { EmbedPlayerShell } from "../components/embed-player-shell";
import { useAuth } from "../hooks/use-auth";
import { useInstance } from "../hooks/use-instance";
import { usePlaybackMode } from "../hooks/use-playback-mode";
import { useSettings } from "../hooks/use-settings";
import { MEMBER_ONLY_MESSAGE, useSabrBootstrap, useStream } from "../hooks/use-stream";
import { ApiError } from "../lib/api";
import { selectProgressiveWatchStream } from "../lib/progressive-watch-stream";
import { toPublicWatchParam, toWatchSourceUrl } from "../lib/watch-url";

type EmbedSearch = {
  t?: string | number;
  autoplay?: number;
};

function parseStartTime(raw?: string | number): number {
  if (raw == null) return 0;
  if (typeof raw === "number") return Math.max(0, raw);
  const trimmed = raw.trim();
  if (!trimmed) return 0;
  const num = Number(trimmed);
  if (Number.isFinite(num)) return Math.max(0, num);
  const match = trimmed.match(/^(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+)s?)?$/);
  if (!match) return 0;
  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  return hours * 3600 + minutes * 60 + seconds;
}

function EmbedPage() {
  const { videoId } = Route.useParams();
  const { t, autoplay } = Route.useSearch();
  const sourceUrl = toWatchSourceUrl(videoId);
  const watchUrl = `/watch?v=${encodeURIComponent(toPublicWatchParam(sourceUrl))}`;
  const { data: instance, isPending: instancePending } = useInstance();
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
  const startTime = parseStartTime(t) * 1000;
  const shouldAutoplay = autoplay === 1;

  if (instancePending || !instance) return <EmbedLoading />;

  if (!guestAllowed && !isAuthed) return <EmbedGuestRequired watchUrl={watchUrl} />;

  const pending = streamQuery.isLoading || bootstrap.isLoading;
  if (!activeStream && (!streamEnabled || pending)) return <EmbedLoading />;

  if (!activeStream) {
    const activeError = streamQuery.error ?? bootstrap.error;
    if (
      activeError instanceof ApiError &&
      (activeError.status === 401 || activeError.status === 403)
    ) {
      return <EmbedGuestRequired watchUrl={watchUrl} />;
    }
    const message =
      activeError instanceof ApiError && (activeError.status === 400 || activeError.status === 422)
        ? activeError.message
        : "Failed to load video.";
    return <EmbedError message={message} />;
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
    autoplay: typeof search.autoplay === "number" ? search.autoplay : undefined,
  }),
  component: EmbedPage,
});
