import { isStreamUnavailableError } from "../hooks/use-stream";
import { FAMILY_LIST_BLOCKED_MESSAGE, isChannelNotAllowedError } from "../lib/allow-list-error";
import { ApiError } from "../lib/api";
import { isYoutubeSessionReconnectError } from "../lib/api-youtube-session";
import { resolveVideoAvailability, videoAvailabilityCopy } from "../lib/video-availability";
import { youtubeSessionReturnToForWatch } from "../lib/youtube-session-route";
import { StreamError } from "./stream-error";

type Props = {
  error: unknown;
  publicParam: string;
  list?: string;
  shuffle?: string;
  poster?: string;
  onRetry: () => void;
};

export function WatchStreamError({ error, publicParam, list, shuffle, poster, onRetry }: Props) {
  const genericExtractorError =
    error instanceof ApiError &&
    error.status === 422 &&
    error.message ===
      "Error occurs when fetching the page. Try increase the loading timeout in Settings.";
  const availability = genericExtractorError ? "members_only" : resolveVideoAvailability(error);
  const needsYoutubeSession = isYoutubeSessionReconnectError(error);
  const familyListBlocked = isChannelNotAllowedError(error);
  const youtubeSessionReturnTo = needsYoutubeSession
    ? youtubeSessionReturnToForWatch(publicParam, list, shuffle)
    : undefined;
  const message = availability
    ? error instanceof Error
      ? error.message
      : videoAvailabilityCopy(availability).message
    : familyListBlocked
      ? FAMILY_LIST_BLOCKED_MESSAGE
      : needsYoutubeSession
        ? "Connect YouTube to load this browser-only video."
        : error instanceof ApiError && (error.status === 400 || error.status === 422)
          ? error.message
          : isStreamUnavailableError(error)
            ? "This video is currently unavailable"
            : "Failed to load stream.";

  return (
    <StreamError
      message={message}
      availability={availability ?? undefined}
      poster={poster}
      onRetry={availability || needsYoutubeSession || familyListBlocked ? undefined : onRetry}
      youtubeSessionReturnTo={youtubeSessionReturnTo}
    />
  );
}
