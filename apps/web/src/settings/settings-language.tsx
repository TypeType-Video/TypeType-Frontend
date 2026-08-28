import { InterfaceLanguagePicker } from "../components/interface-language-picker";
import { ToggleSwitch } from "../components/toggle-switch";
import { useSettings } from "../hooks/use-settings";
import { m } from "../paraglide/messages.js";
import { LanguageDropdown } from "./language-dropdown";

const SECTION_LABEL = "text-xs font-medium text-fg-soft uppercase tracking-wider px-1";
const GROUP = "divide-y divide-border border-y border-border";
const ROW = "flex min-w-0 items-center justify-between gap-4 py-4";

export function SettingsLanguage() {
  const { settings, update } = useSettings();

  return (
    <section className="flex flex-col gap-3">
      <p className={SECTION_LABEL}>{m.settings_language_section()}</p>
      <div className={GROUP}>
        <div className={ROW}>
          <div className="min-w-0 flex flex-col gap-1">
            <span className="text-sm text-fg">{m.settings_ui_language_label()}</span>
            <span className="text-xs text-fg-soft">{m.settings_ui_language_description()}</span>
          </div>
          <InterfaceLanguagePicker />
        </div>
        {settings.defaultService === 0 && (
          <div className={ROW}>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-fg">{m.settings_subtitle_default_label()}</span>
              <span className="text-xs text-fg-soft">
                {m.settings_subtitle_default_description()}
              </span>
            </div>
            <ToggleSwitch
              checked={settings.subtitlesEnabled}
              className="ml-6"
              onClick={() => update.mutate({ subtitlesEnabled: !settings.subtitlesEnabled })}
            />
          </div>
        )}
        {settings.defaultService === 0 && (
          <div className={ROW}>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-fg">{m.settings_subtitle_language_label()}</span>
              <span className="text-xs text-fg-soft">
                {m.settings_subtitle_language_description()}
              </span>
            </div>
            <LanguageDropdown
              value={settings.defaultSubtitleLanguage}
              onChange={(v) => update.mutate({ defaultSubtitleLanguage: v })}
            />
          </div>
        )}
        {settings.defaultService === 0 && (
          <div className={ROW}>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-fg">{m.settings_audio_language_label()}</span>
              <span className="text-xs text-fg-soft">
                {settings.preferOriginalLanguage
                  ? m.settings_audio_language_ignored()
                  : m.settings_audio_language_description()}
              </span>
            </div>
            <LanguageDropdown
              value={settings.defaultAudioLanguage}
              onChange={(v) => update.mutate({ defaultAudioLanguage: v })}
              disabled={settings.preferOriginalLanguage}
            />
          </div>
        )}
        {settings.defaultService === 0 && (
          <div className={ROW}>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-fg">{m.settings_original_audio_label()}</span>
              <span className="text-xs text-fg-soft">
                {m.settings_original_audio_description()}
              </span>
            </div>
            <ToggleSwitch
              checked={settings.preferOriginalLanguage}
              className="ml-6"
              onClick={() =>
                update.mutate({ preferOriginalLanguage: !settings.preferOriginalLanguage })
              }
            />
          </div>
        )}
      </div>
    </section>
  );
}
