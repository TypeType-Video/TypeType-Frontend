import { isYoutubeSessionActionError } from "../lib/api-youtube-session";
import { selectProgressiveWatchStream } from "../lib/progressive-watch-stream";
import { detectProvider } from "../lib/provider";
import { toPublicWatchParam } from "../lib/watch-url";
import { m } from "../paraglide/messages.js";
import type { VideoStream } from "../types/stream";
import { isMemberOnlyApiError, useSabrBootstrap, useStream } from "./use-stream";

type Params = {
  shorts: VideoStream[];
  index: number;
  useAuthenticatedStream: boolean;
  enabled: boolean;
};

export function useShortsActiveStream({ shorts, index, useAuthenticatedStream, enabled }: Params) {
  const active = shorts[index];
  const activeId = active?.id ?? "";
  const youtube = detectProvider(activeId) === "youtube";
  const streamQuery = useStream(activeId, useAuthenticatedStream, enabled);
  const bootstrapQuery = useSabrBootstrap(activeId, useAuthenticatedStream, enabled && youtube);
  const stream = selectProgressiveWatchStream(
    streamQuery.isPlaceholderData ? undefined : streamQuery.data,
    youtube ? bootstrapQuery.data : undefined,
    toPublicWatchParam(activeId),
    [],
  );
  const current = stream ?? active;
  const pending =
    Boolean(active) &&
    (!enabled ||
      (youtube
        ? !stream && (streamQuery.isFetching || bootstrapQuery.isFetching)
        : !stream && streamQuery.isFetching));
  const failed = youtube
    ? !stream && streamQuery.isError && bootstrapQuery.isError
    : streamQuery.isError;
  const error = streamQuery.error ?? bootstrapQuery.error;
  const errorMessage = m.ui_this_short_stopped_playing();
  const isMemberOnlyShort = isMemberOnlyApiError(error);
  const needsYoutubeSession = isYoutubeSessionActionError(error);

  return {
    active,
    activeId,
    stream,
    streamLoading: pending,
    streamError: failed,
    retry: () => {
      void streamQuery.refetch();
      if (youtube) void bootstrapQuery.refetch();
    },
    current,
    errorMessage,
    isMemberOnlyShort,
    needsYoutubeSession,
  };
}
