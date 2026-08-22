import { useSettings } from "../hooks/use-settings";
import { SettingsDiscoveryToggles } from "./settings-content-toggles";
import { ROW, ToggleSwitch } from "./settings-toggle-switch";

const LANDING_OPTIONS = [
  { value: "home", label: "Home" },
  { value: "subscriptions", label: "Subscriptions" },
  { value: "history", label: "History" },
  { value: "playlists", label: "Playlists" },
  { value: "watch-later", label: "Watch later" },
  { value: "favorites", label: "Favorites" },
];

export function SettingsLandingPage() {
  const { settings, update } = useSettings();

  return (
    <section className="flex flex-col gap-3">
      <p className="px-1 text-xs font-medium text-fg-soft uppercase tracking-wider">Startup</p>
      <div className="flex flex-col items-start gap-3 rounded-xl border border-border bg-surface px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-fg">Default landing page</span>
          <span className="text-xs text-fg-soft">
            The page TypeType opens on when you launch it.
          </span>
        </div>
        <select
          aria-label="Default landing page"
          value={settings.defaultLandingPage}
          onChange={(event) => update.mutate({ defaultLandingPage: event.target.value })}
          className="h-9 w-full rounded-md border border-border-strong bg-surface px-2.5 text-sm text-fg sm:w-48"
        >
          {LANDING_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <p className="px-1 pt-2 text-xs font-medium text-fg-soft uppercase tracking-wider">
        Notifications
      </p>
      <div className="rounded-xl border border-border bg-surface">
        <div className={ROW}>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-fg">Notification popups</span>
            <span className="text-xs text-fg-soft">
              Show a popup when a subscribed channel publishes a video.
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
      <div className="divide-y divide-border rounded-xl border border-border bg-surface">
        <SettingsDiscoveryToggles />
      </div>
    </section>
  );
}
