import { useSettings } from "../hooks/use-settings";
import { m } from "../paraglide/messages.js";
import { SettingsDiscoveryToggles } from "./settings-content-toggles";
import { ROW, ToggleSwitch } from "./settings-toggle-switch";

function landingOptions() {
  return [
    { value: "home", label: m.nav_home() },
    { value: "subscriptions", label: m.portability_category_subscriptions() },
    { value: "history", label: m.nav_history() },
    { value: "playlists", label: m.nav_playlists() },
    { value: "watch-later", label: m.portability_category_watch_later() },
    { value: "favorites", label: m.portability_category_favorites() },
  ];
}

export function SettingsLandingPage() {
  const { settings, update } = useSettings();

  return (
    <section className="flex flex-col gap-3">
      <p className="px-1 text-xs font-medium text-fg-soft uppercase tracking-wider">
        {m.ui_startup()}
      </p>
      <div className="flex min-w-0 flex-col items-start gap-3 border-y border-border py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-fg">{m.ui_default_landing_page()}</span>
          <span className="text-xs text-fg-soft">
            {m.ui_the_page_typetype_opens_on_when_you_launch_it()}
          </span>
        </div>
        <select
          aria-label={m.ui_default_landing_page()}
          value={settings.defaultLandingPage}
          onChange={(event) => update.mutate({ defaultLandingPage: event.target.value })}
          className="h-9 w-full rounded-sm border border-border-strong bg-app px-2.5 text-sm text-fg sm:w-48"
        >
          {landingOptions().map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <p className="px-1 pt-2 text-xs font-medium text-fg-soft uppercase tracking-wider">
        {m.ui_notifications()}
      </p>
      <div className="border-y border-border">
        <div className={ROW}>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-fg">{m.ui_notification_popups()}</span>
            <span className="text-xs text-fg-soft">
              {m.ui_show_a_popup_when_a_subscribed_channel_publishes_a_video()}
            </span>
          </div>
          <ToggleSwitch
            checked={settings.notificationPopupsEnabled}
            onClick={() =>
              update.mutate({ notificationPopupsEnabled: !settings.notificationPopupsEnabled })
            }
          />
        </div>
      </div>
      <div className="divide-y divide-border border-y border-border">
        <SettingsDiscoveryToggles />
      </div>
    </section>
  );
}
