import { createFileRoute } from "@tanstack/react-router";
import { m } from "../paraglide/messages.js";

function PrivacyPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 pt-12">
      <div className="px-1">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-soft">
          {m.settings_privacy_label()}
        </p>
        <h1 className="mt-2 font-mono text-2xl font-semibold tracking-tight text-fg">
          {m.ui_manage_stored_data()}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-fg-muted">
          {m.ui_clear_stored_watch_history_search_history_subscriptions_and_playback()}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface/40 p-5">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-soft">
          {m.ui_stored_data()}
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-fg-muted">
          <li>{m.ui_watch_history()}</li>
          <li>{m.ui_search_history()}</li>
          <li>{m.ui_subscriptions_3()}</li>
          <li>{m.ui_playback_progress()}</li>
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-surface/40 p-5">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-soft">
          {m.ui_controls()}
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-fg-muted">
          <li>{m.ui_clear_watch_history_in_settings()}</li>
          <li>{m.ui_clear_search_history_in_settings()}</li>
          <li>{m.ui_unsubscribe_from_all_channels_in_settings()}</li>
        </ul>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/privacy")({ component: PrivacyPage });
