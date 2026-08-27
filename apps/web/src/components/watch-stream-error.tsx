import { isStreamUnavailableError } from "../hooks/use-stream";
import { familyListBlockedMessage, isChannelNotAllowedError } from "../lib/allow-list-error";
import { ApiError } from "../lib/api";
import { isYoutubeSessionActionError } from "../lib/api-youtube-session";
import { resolveVideoAvailability, videoAvailabilityCopy } from "../lib/video-availability";
import { youtubeSessionReturnToForWatch } from "../lib/youtube-session-route";
import { m } from "../paraglide/messages.js";
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
  const needsYoutubeSession = isYoutubeSessionActionError(error);
  const familyListBlocked = isChannelNotAllowedError(error);
  const youtubeSessionReturnTo = needsYoutubeSession
    ? youtubeSessionReturnToForWatch(publicParam, list, shuffle)
    : undefined;
  const message = availability
    ? videoAvailabilityCopy(availability, error instanceof Error ? error.message : undefined)
        .message
    : familyListBlocked
      ? familyListBlockedMessage()
      : needsYoutubeSession
        ? m.ui_connect_youtube_to_access_this_video()
        : isStreamUnavailableError(error)
          ? m.ui_this_video_is_currently_unavailable()
          : m.ui_failed_to_load_stream();

  return (
    <StreamError
      message={message}
      familyListBlocked={familyListBlocked}
      availability={availability ?? undefined}
      poster={poster}
      onRetry={availability || needsYoutubeSession || familyListBlocked ? undefined : onRetry}
      youtubeSessionReturnTo={youtubeSessionReturnTo}
    />
  );
}
