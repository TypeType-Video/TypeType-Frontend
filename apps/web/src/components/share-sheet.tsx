import { useEffect } from "react";
import { siBilibili, siNiconico, siYoutube } from "simple-icons";
import { useInterfaceLocale } from "../hooks/use-interface-locale";
import { getSourceShareTarget, type ShareProvider } from "../lib/share-link";
import { m } from "../paraglide/messages.js";
import { ServiceIcon } from "./service-icon";
import { ShareIcon } from "./watch-icons";

type Props = {
  sourceUrl: string;
  typetypeUrl: string;
  title: string;
  onShare: (url: string, title: string) => void;
  onClose: () => void;
};

const PROVIDER_ICONS: Record<ShareProvider, { path: string; color: string }> = {
  youtube: { path: siYoutube.path, color: "#FF0000" },
  nicovideo: { path: siNiconico.path, color: "#aaaaaa" },
  bilibili: { path: siBilibili.path, color: "#00A1D6" },
};

function ShareOption({
  icon,
  label,
  url,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  url: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-surface-strong"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-strong">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-fg">{label}</span>
        <span className="block truncate text-xs text-fg-muted">{url}</span>
      </span>
    </button>
  );
}

export function ShareSheet({ sourceUrl, typetypeUrl, title, onShare, onClose }: Props) {
  const { locale } = useInterfaceLocale();
  const source = getSourceShareTarget(sourceUrl);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label={m.admin_users_close({}, { locale })}
        onClick={onClose}
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
      />
      <section className="absolute inset-x-3 bottom-3 mx-auto w-auto max-w-md rounded-xl border border-border-strong bg-app p-3 shadow-2xl md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:w-[min(28rem,calc(100vw-2rem))] md:-translate-x-1/2 md:-translate-y-1/2">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-fg">{m.watch_share({}, { locale })}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-xs text-fg-muted hover:bg-surface-strong hover:text-fg"
          >
            {m.admin_users_close({}, { locale })}
          </button>
        </div>
        <div className="flex flex-col gap-1">
          <ShareOption
            icon={<ShareIcon />}
            label={m.watch_share_typetype_link({}, { locale })}
            url={typetypeUrl}
            onClick={() => {
              onClose();
              onShare(typetypeUrl, title);
            }}
          />
          {source && (
            <ShareOption
              icon={
                <ServiceIcon
                  path={PROVIDER_ICONS[source.provider].path}
                  color={PROVIDER_ICONS[source.provider].color}
                  label={source.label}
                />
              }
              label={m.watch_share_source_link({ provider: source.label }, { locale })}
              url={source.url}
              onClick={() => {
                onClose();
                onShare(source.url, title);
              }}
            />
          )}
        </div>
      </section>
    </div>
  );
}
