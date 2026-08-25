import { useInterfaceLocale } from "../hooks/use-interface-locale";
import { useSettings } from "../hooks/use-settings";
import { m } from "../paraglide/messages.js";
import { ToggleSwitch } from "./toggle-switch";

export function AutoplayToggle() {
  const { locale } = useInterfaceLocale();
  const { settings, update } = useSettings();
  const label = m.watch_autoplay({}, { locale });

  return (
    <div className="flex items-center justify-between border-b border-border pb-3 pt-3">
      <span className="text-sm text-fg-muted">{label}</span>
      <ToggleSwitch
        checked={settings.autoplay}
        ariaLabel={label}
        onClick={() => update.mutate({ autoplay: !settings.autoplay })}
      />
    </div>
  );
}
