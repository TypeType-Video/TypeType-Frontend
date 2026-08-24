import { useSettings } from "../hooks/use-settings";
import { ToggleSwitch } from "./toggle-switch";

export function AutoplayToggle() {
  const { settings, update } = useSettings();

  return (
    <div className="flex items-center justify-between border-b border-border pb-3 pt-3">
      <span className="text-sm text-fg-muted">Autoplay</span>
      <ToggleSwitch
        checked={settings.autoplay}
        ariaLabel="Autoplay"
        onClick={() => update.mutate({ autoplay: !settings.autoplay })}
      />
    </div>
  );
}
