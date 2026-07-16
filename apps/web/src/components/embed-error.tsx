import { FAMILY_LIST_BLOCKED_MESSAGE } from "../lib/allow-list-error";
import { parseGeoRestriction } from "../lib/geo-restriction";
import { isMemberOnlyMessage } from "../lib/member-only";
import { FlagIcon } from "./flag-icon";

type EmbedErrorProps = {
  message: string;
  onRetry?: () => void;
};

export function EmbedError({ message, onRetry }: EmbedErrorProps) {
  const countryCode = parseGeoRestriction(message);
  const isMemberOnly = isMemberOnlyMessage(message);
  const familyListBlocked = message === FAMILY_LIST_BLOCKED_MESSAGE;
  const imageSrc = familyListBlocked
    ? "/family-list-blocked.gif"
    : isMemberOnly
      ? "/member-only-source.gif"
      : "/error-cat.gif";

  return (
    <div className="w-full h-full bg-black flex flex-col items-center justify-center gap-5 px-4">
      <img
        src={imageSrc}
        width={familyListBlocked ? "120" : "140"}
        height={familyListBlocked ? "120" : "140"}
        alt=""
        className="rounded-2xl"
      />
      <div className="flex flex-col items-center gap-1.5">
        <p className="text-white text-base font-semibold tracking-tight">
          Couldn't load this video
        </p>
        <div className="flex items-center gap-2">
          {countryCode && <FlagIcon code={countryCode} className="w-5 h-4 rounded-sm shrink-0" />}
          <p className="text-fg-muted text-sm max-w-xs text-center">{message}</p>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-5 py-2 rounded-full bg-white hover:bg-fg text-app text-sm font-medium transition-colors cursor-pointer"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
