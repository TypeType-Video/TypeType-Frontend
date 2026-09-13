import { useEffect, useRef, useState } from "react";
import { formatYoutubeRemoteLogs, type YoutubeRemoteLogLine } from "../lib/youtube-remote-messages";
import { m } from "../paraglide/messages.js";

type Props = {
  logs: YoutubeRemoteLogLine[];
};

export function YoutubeRemoteDiagnostics({ logs }: Props) {
  const [copied, setCopied] = useState(false);
  const listRef = useRef<HTMLPreElement>(null);
  const text = formatYoutubeRemoteLogs(logs);

  useEffect(() => {
    const list = listRef.current;
    if (list && text.length > 0) list.scrollTop = list.scrollHeight;
  }, [text]);

  function copy() {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <details className="border border-border" open>
      <summary className="cursor-pointer select-none px-3 py-2 text-fg-muted text-xs">
        {m.ui_remote_diagnostics()} ({logs.length})
      </summary>
      <div className="flex flex-col gap-2 border-border border-t px-3 py-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-fg-soft text-xs">{m.ui_remote_diagnostics_hint()}</p>
          <button
            type="button"
            onClick={copy}
            disabled={logs.length === 0}
            className="inline-flex h-8 shrink-0 items-center border border-border-strong px-3 text-fg-muted text-xs transition-colors hover:border-fg hover:text-fg disabled:opacity-50"
          >
            {copied ? m.ui_diagnostics_copied() : m.ui_copy_diagnostics()}
          </button>
        </div>
        <pre
          ref={listRef}
          className="max-h-64 overflow-auto whitespace-pre-wrap break-all bg-black/40 p-2 font-mono text-[11px] text-fg-muted leading-4"
        >
          {text}
        </pre>
      </div>
    </details>
  );
}
