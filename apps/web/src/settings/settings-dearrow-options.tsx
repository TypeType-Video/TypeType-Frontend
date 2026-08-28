import { useSettings } from "../hooks/use-settings";
import { m } from "../paraglide/messages.js";
import type { DeArrowThumbnailMode, DeArrowTitleMode, DeArrowTrustMode } from "../types/user";
import { ROW } from "./settings-toggle-switch";

const SELECT =
  "h-9 w-full rounded-md border border-border-strong bg-surface px-2.5 text-sm text-fg sm:w-52";

export function SettingsDeArrowOptions() {
  const { settings, update } = useSettings();
  if (!settings.deArrowEnabled) return null;

  return (
    <>
      <label className={ROW}>
        <span className="flex flex-col gap-1">
          <span className="text-sm text-fg">{m.ui_titles()}</span>
          <span className="text-xs text-fg-soft">
            {m.ui_choose_the_title_shown_for_youtube_videos()}
          </span>
        </span>
        <select
          aria-label={m.ui_dearrow_titles()}
          value={settings.deArrowTitleMode}
          onChange={(event) =>
            update.mutate({ deArrowTitleMode: event.target.value as DeArrowTitleMode })
          }
          className={SELECT}
        >
          <option value="dearrow">{m.ui_community_title()}</option>
          <option value="original">{m.ui_original_title()}</option>
        </select>
      </label>
      <label className={ROW}>
        <span className="flex flex-col gap-1">
          <span className="text-sm text-fg">{m.ui_thumbnails()}</span>
          <span className="text-xs text-fg-soft">
            {m.ui_choose_the_image_shown_for_youtube_videos()}
          </span>
        </span>
        <select
          aria-label={m.ui_dearrow_thumbnails()}
          value={settings.deArrowThumbnailMode}
          onChange={(event) =>
            update.mutate({ deArrowThumbnailMode: event.target.value as DeArrowThumbnailMode })
          }
          className={SELECT}
        >
          <option value="dearrow_or_random">{m.ui_community_then_neutral_frame()}</option>
          <option value="dearrow">{m.ui_community_only()}</option>
          <option value="random">{m.ui_neutral_frame()}</option>
          <option value="original">{m.ui_original_thumbnail()}</option>
        </select>
      </label>
      <label className={ROW}>
        <span className="flex flex-col gap-1">
          <span className="text-sm text-fg">{m.ui_confidence()}</span>
          <span className="text-xs text-fg-soft">
            {m.ui_control_which_community_entries_are_used()}
          </span>
        </span>
        <select
          aria-label={m.ui_dearrow_confidence()}
          value={settings.deArrowTrustMode}
          onChange={(event) =>
            update.mutate({ deArrowTrustMode: event.target.value as DeArrowTrustMode })
          }
          className={SELECT}
        >
          <option value="accepted">{m.ui_accepted_entries()}</option>
          <option value="locked">{m.ui_locked_entries_only()}</option>
        </select>
      </label>
    </>
  );
}
