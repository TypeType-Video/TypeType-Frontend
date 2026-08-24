import { FAMILY_LIST_BLOCKED_MESSAGE } from "../lib/allow-list-error";
import { parseGeoRestriction } from "../lib/geo-restriction";
import { isMemberOnlyMessage } from "../lib/member-only";
import { type VideoAvailability, videoAvailabilityCopy } from "../lib/video-availability";
import { FlagIcon } from "./flag-icon";
import { VideoAvailabilityPoster } from "./video-availability-poster";

export const PLAYBACK_FAILED_MESSAGE =
  "This video could not be played. The stream may be unavailable or unsupported.";

type EmbedErrorProps = {
  message: string;
  onRetry?: () => void;
  heading?: string;
  image?: string;
  availability?: VideoAvailability;
  poster?: string;
  watchUrl?: string;
};

export function EmbedError({
  message,
  onRetry,
  heading,
  image,
  availability,
  poster,
  watchUrl,
}: EmbedErrorProps) {
  const availabilityCopy = availability ? videoAvailabilityCopy(availability, message) : null;
  const displayedMessage = availabilityCopy?.message ?? message;
  const countryCode = parseGeoRestriction(displayedMessage);
  const isMemberOnly = availability === "members_only" || isMemberOnlyMessage(displayedMessage);
  const familyListBlocked = message === FAMILY_LIST_BLOCKED_MESSAGE;
  const playbackFailed = message === PLAYBACK_FAILED_MESSAGE;
  const imageSrc =
    image ??
    (playbackFailed
      ? "/sad-sigh.gif"
      : familyListBlocked
        ? "/family-list-blocked.gif"
        : isMemberOnly
          ? "/member-only-source.gif"
          : "/error-cat.gif");
  const headingText =
    heading ??
    availabilityCopy?.heading ??
    (playbackFailed ? "Playback failed" : "Couldn't load this video");

  return (
    <div className="w-full h-full bg-black flex flex-col items-center justify-center gap-5 px-4">
      {availability ? (
        <VideoAvailabilityPoster
          availability={availability}
          message={message}
          poster={poster}
          compact
        />
      ) : (
        <>
          <img
            src={imageSrc}
            width={familyListBlocked ? "120" : "140"}
            height={familyListBlocked ? "120" : "140"}
            alt=""
            className="rounded-2xl"
          />
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-white text-base font-semibold tracking-tight">{headingText}</p>
            <div className="flex items-center gap-2">
              {countryCode && (
                <FlagIcon code={countryCode} className="w-5 h-4 rounded-sm shrink-0" />
              )}
              <p className="text-fg-muted text-sm max-w-xs text-center">{displayedMessage}</p>
            </div>
          </div>
        </>
      )}
      <div className="flex flex-wrap justify-center gap-3">
        {onRetry && !availability && (
          <button
            type="button"
            onClick={onRetry}
            className="cursor-pointer rounded-md bg-white px-5 py-2 text-sm font-medium text-app transition-colors hover:bg-fg"
          >
            Retry
          </button>
        )}
        {watchUrl && (
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer rounded-md bg-white px-5 py-2 text-sm font-medium text-app transition-colors hover:bg-fg"
          >
            Connect YouTube on TypeType
          </a>
        )}
      </div>
    </div>
  );
}
