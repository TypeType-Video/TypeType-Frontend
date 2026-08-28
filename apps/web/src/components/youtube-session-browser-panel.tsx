import type { YoutubeRemoteInput, YoutubeRemotePhase } from "../hooks/use-youtube-remote-browser";
import { youtubeRemotePhaseLabel } from "../lib/youtube-remote-phase";
import { m } from "../paraglide/messages.js";
import { YoutubeIcon } from "./youtube-icon";
import { YoutubeRemoteBrowser } from "./youtube-remote-browser";

type Props = {
  browserOpen: boolean;
  authReady: boolean;
  isAuthed: boolean;
  enabled: boolean;
  loaded: boolean;
  pending: boolean;
  connected: boolean;
  returnTo?: string;
  frameUrl: string | null;
  phase: YoutubeRemotePhase;
  error: string | null;
  onStart: () => void;
  onCancel: () => void;
  onInput: (input: YoutubeRemoteInput) => void;
};

export function YoutubeSessionBrowserPanel({
  browserOpen,
  authReady,
  isAuthed,
  enabled,
  loaded,
  pending,
  connected,
  returnTo,
  frameUrl,
  phase,
  error,
  onStart,
  onCancel,
  onInput,
}: Props) {
  if (browserOpen) {
    return (
      <div className="flex flex-col gap-3">
        <YoutubeRemoteBrowser frameUrl={frameUrl} phase={phase} error={error} onInput={onInput} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-fg-soft text-xs">
            {m.ui_phase()} {youtubeRemotePhaseLabel(phase)}.{" "}
            {m.ui_click_the_browser_area_before_typing()}
          </p>
          <button
            type="button"
            onClick={onCancel}
            className="h-10 border border-border-strong px-4 text-fg-muted text-sm transition-colors hover:border-danger hover:text-danger"
          >
            {m.ui_cancel_sign_in()}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl border-border border-l-2 pl-5">
      <p className="text-fg text-sm leading-6">
        {m.ui_use_a_secondary_youtube_account_the_remote_browser_is_temporary_and_c()}
      </p>
      <button
        type="button"
        disabled={!authReady || !isAuthed || !enabled || pending}
        onClick={onStart}
        className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 border border-white bg-white px-5 font-medium text-black text-sm transition-colors hover:bg-fg disabled:opacity-50 sm:w-auto"
      >
        <YoutubeIcon className="h-4 w-4 text-[#ff0000]" />
        <span>
          {!loaded
            ? m.ui_checking_availability()
            : pending
              ? m.ui_opening()
              : m.ui_connect_with_youtube()}
        </span>
      </button>
      {loaded && !enabled && (
        <p className="mt-3 text-danger-strong text-xs">
          {m.ui_remote_youtube_login_is_disabled_on_this_instance()}
        </p>
      )}
      {connected && returnTo && (
        <a
          href={returnTo}
          className="mt-3 inline-flex h-11 w-full items-center justify-center border border-border-strong px-5 text-fg text-sm transition-colors hover:border-fg sm:ml-3 sm:w-auto"
        >
          {m.ui_retry_video()}
        </a>
      )}
    </div>
  );
}
