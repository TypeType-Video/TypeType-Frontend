import { useState } from "react";
import type { YoutubeRemoteInput, YoutubeRemotePhase } from "../hooks/use-youtube-remote-browser";
import type { YoutubeRemoteLogLine } from "../lib/youtube-remote-messages";
import { youtubeRemotePhaseLabel } from "../lib/youtube-remote-phase";
import { m } from "../paraglide/messages.js";
import { ReportBugModal } from "./report-bug-modal";
import { BugIcon } from "./watch-icons";
import { YoutubeIcon } from "./youtube-icon";
import { YoutubeRemoteBrowser } from "./youtube-remote-browser";
import { YoutubeRemoteDiagnostics } from "./youtube-remote-diagnostics";

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
  logs: YoutubeRemoteLogLine[];
  onStart: () => void;
  onCancel: () => void;
  onInput: (input: YoutubeRemoteInput) => void;
  onLog: (message: string) => void;
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
  logs,
  onStart,
  onCancel,
  onInput,
  onLog,
}: Props) {
  const [reportOpen, setReportOpen] = useState(false);

  if (browserOpen) {
    return (
      <div className="flex flex-col gap-3">
        <YoutubeRemoteBrowser
          frameUrl={frameUrl}
          phase={phase}
          error={error}
          onInput={onInput}
          onLog={onLog}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-fg-soft text-xs">
            {m.ui_phase()} {youtubeRemotePhaseLabel(phase)}.{" "}
            {m.ui_click_the_browser_area_before_typing()}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="inline-flex h-10 items-center gap-2 border border-border-strong px-3 text-fg-muted text-sm transition-colors hover:border-fg hover:text-fg"
            >
              <BugIcon />
              {m.ui_report_a_bug()}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="h-10 border border-border-strong px-4 text-fg-muted text-sm transition-colors hover:border-danger hover:text-danger"
            >
              {m.ui_cancel_sign_in()}
            </button>
          </div>
        </div>
        <YoutubeRemoteDiagnostics logs={logs} />
        {reportOpen && <ReportBugModal onClose={() => setReportOpen(false)} />}
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
      {logs.length > 0 && (
        <div className="mt-5">
          <YoutubeRemoteDiagnostics logs={logs} />
        </div>
      )}
    </div>
  );
}
