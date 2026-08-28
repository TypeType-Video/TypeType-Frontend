import { m } from "../paraglide/messages.js";
import { SettingsWatchToggles } from "./settings-content-toggles";
import { SettingsSponsorBlockPreferences } from "./settings-sponsorblock-preferences";

const SECTION_LABEL = "text-xs font-medium text-fg-soft uppercase tracking-wider px-1";
const GROUP = "divide-y divide-border border-y border-border";

export function SettingsVideoPreferences() {
  return (
    <section className="flex flex-col gap-3">
      <p className={SECTION_LABEL}>{m.ui_content_controls()}</p>
      <div className={GROUP}>
        <SettingsSponsorBlockPreferences />
        <SettingsWatchToggles />
      </div>
    </section>
  );
}
