import { Link, useRouter } from "@tanstack/react-router";
import { useAuth } from "../hooks/use-auth";
import { familyListBlockedMessage } from "../lib/allow-list-error";
import { parseGeoRestriction } from "../lib/geo-restriction";
import { isMemberOnlyMessage } from "../lib/member-only";
import { type VideoAvailability, videoAvailabilityCopy } from "../lib/video-availability";
import { m } from "../paraglide/messages.js";
import { FlagIcon } from "./flag-icon";
import { VideoAvailabilityPoster } from "./video-availability-poster";
import { YoutubeIcon } from "./youtube-icon";

type Props = {
  message: string;
  onRetry?: () => void;
  youtubeSessionReturnTo?: string;
  familyListBlocked?: boolean;
  availability?: VideoAvailability;
  poster?: string;
};

export function StreamError({
  message,
  onRetry,
  youtubeSessionReturnTo,
  familyListBlocked: familyListBlockedOverride,
  availability,
  poster,
}: Props) {
  const router = useRouter();
  const { canGlobalBlock } = useAuth();
  const availabilityCopy = availability ? videoAvailabilityCopy(availability, message) : null;
  const displayedMessage = availabilityCopy?.message ?? message;
  const countryCode = parseGeoRestriction(displayedMessage);
  const isMemberOnly = availability === "members_only" || isMemberOnlyMessage(displayedMessage);
  const familyListBlocked = familyListBlockedOverride ?? message === familyListBlockedMessage();
  const imageSrc = familyListBlocked
    ? "/family-list-blocked.gif"
    : isMemberOnly
      ? "/member-only-source.gif"
      : "/error-cat.gif";

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-5 bg-app px-4">
      {availability ? (
        <VideoAvailabilityPoster availability={availability} message={message} poster={poster} />
      ) : (
        <>
          <img
            src={imageSrc}
            width="220"
            height={familyListBlocked ? "181" : "220"}
            alt=""
            className="rounded-2xl"
          />
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-base font-semibold tracking-tight text-white">
              {m.ui_couldn_t_load_this_video()}
            </p>
            <div className="flex items-center gap-2">
              {countryCode && (
                <FlagIcon code={countryCode} className="h-4 w-5 shrink-0 rounded-sm" />
              )}
              <p className="max-w-xs text-center text-sm text-fg-muted">{displayedMessage}</p>
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
            {m.ui_retry()}
          </button>
        )}
        {youtubeSessionReturnTo && (
          <Link
            to="/youtube-session"
            search={{ returnTo: youtubeSessionReturnTo }}
            className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-white px-5 py-2 text-sm font-medium text-app transition-colors hover:bg-fg"
          >
            <YoutubeIcon className="h-4 w-4 text-[#ff0000]" />
            <span>{m.ui_connect_with_youtube()}</span>
          </Link>
        )}
        {familyListBlocked && canGlobalBlock && (
          <Link
            to="/admin-console"
            search={{ section: "allow-list" }}
            className="cursor-pointer rounded-md bg-white px-5 py-2 text-sm font-medium text-app transition-colors hover:bg-fg"
          >
            {m.ui_open_allow_list()}
          </Link>
        )}
        <button
          type="button"
          onClick={() => router.history.back()}
          className="cursor-pointer rounded-md bg-surface-strong px-5 py-2 text-sm font-medium text-fg transition-colors hover:bg-surface-soft"
        >
          {m.not_found_back()}
        </button>
      </div>
    </div>
  );
}
