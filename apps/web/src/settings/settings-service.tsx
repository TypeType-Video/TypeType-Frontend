import { siBilibili, siNiconico, siYoutube } from "simple-icons";
import { ServiceIcon } from "../components/service-icon";
import { useSettings } from "../hooks/use-settings";
import { m } from "../paraglide/messages.js";
import type { ServiceId } from "../types/user";

type ServiceOption = {
  id: ServiceId;
  label: string;
  path: string;
  color: string;
};

const SERVICES: ServiceOption[] = [
  { id: 0, label: "YouTube", path: siYoutube.path, color: "#FF0000" },
  { id: 6, label: "NicoNico", path: siNiconico.path, color: "#aaaaaa" },
  { id: 5, label: "BiliBili", path: siBilibili.path, color: "#00A1D6" },
];

const SECTION_LABEL = "text-xs font-medium text-fg-soft uppercase tracking-wider px-1";
const GROUP = "divide-y divide-border border-y border-border";

function RadioDot({ selected }: { selected: boolean }) {
  return (
    <span
      className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors ${
        selected ? "border-fg bg-fg" : "border-border-strong"
      }`}
    >
      {selected && <span className="w-2 h-2 rounded-full bg-surface" />}
    </span>
  );
}

export function SettingsService() {
  const { settings, update } = useSettings();

  return (
    <section className="flex flex-col gap-3">
      <p className={SECTION_LABEL}>{m.ui_default_service()}</p>
      <div className={GROUP}>
        {SERVICES.map((svc) => (
          <button
            key={svc.id}
            type="button"
            onClick={() => update.mutate({ defaultService: svc.id })}
            className={`flex w-full items-center gap-3 py-3.5 text-left transition-colors ${
              settings.defaultService === svc.id ? "text-fg" : "text-fg-muted hover:text-fg"
            }`}
          >
            <ServiceIcon path={svc.path} color={svc.color} label={svc.label} />
            <span className="flex-1 text-sm text-fg">{svc.label}</span>
            <RadioDot selected={settings.defaultService === svc.id} />
          </button>
        ))}
      </div>
    </section>
  );
}
