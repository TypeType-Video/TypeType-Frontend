import { ChevronRight } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { siBilibili, siNiconico, siYoutube } from "simple-icons";
import { useInterfaceLocale } from "../hooks/use-interface-locale";
import { getSourceShareTarget, type ShareProvider } from "../lib/share-link";
import { m } from "../paraglide/messages.js";
import { ServiceIcon } from "./service-icon";

type Props = {
  anchorEl: HTMLElement | null;
  sourceUrl: string;
  typetypeUrl: string;
  title: string;
  onShare: (url: string, title: string) => void;
  onClose: () => void;
};

const MARGIN = 8;

const PROVIDER_ICONS: Record<ShareProvider, { path: string; color: string }> = {
  youtube: { path: siYoutube.path, color: "#FF0000" },
  nicovideo: { path: siNiconico.path, color: "#aaaaaa" },
  bilibili: { path: siBilibili.path, color: "#00A1D6" },
};

function ShareOption({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="menuitem"
      className="group flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm text-fg transition-colors hover:bg-surface-strong focus-visible:bg-surface-strong focus-visible:outline-none"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-strong transition-colors group-hover:bg-surface-soft">
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate font-medium">{label}</span>
      <ChevronRight className="h-4 w-4 shrink-0 text-fg-soft transition-transform group-hover:translate-x-0.5 group-hover:text-fg-muted" />
    </button>
  );
}

export function ShareSheet({ anchorEl, sourceUrl, typetypeUrl, title, onShare, onClose }: Props) {
  const { locale } = useInterfaceLocale();
  const source = getSourceShareTarget(sourceUrl);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({ visibility: "hidden" });
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const anchorElRef = useRef(anchorEl);
  anchorElRef.current = anchorEl;

  useLayoutEffect(() => {
    if (!anchorEl || !panelRef.current) return;
    const anchor = anchorEl.getBoundingClientRect();
    const panel = panelRef.current.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    let left = anchor.right - panel.width;
    left = Math.max(MARGIN, Math.min(left, vw - panel.width - MARGIN));
    const spaceBelow = vh - anchor.bottom - MARGIN;
    const spaceAbove = anchor.top - MARGIN;
    let top =
      spaceBelow >= panel.height || spaceBelow >= spaceAbove
        ? anchor.bottom + MARGIN
        : anchor.top - panel.height - MARGIN;
    top = Math.max(MARGIN, Math.min(top, vh - panel.height - MARGIN));
    setPanelStyle({ position: "fixed", top, left, visibility: "visible" });
  }, [anchorEl]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
    }
    function onMouseDown(event: MouseEvent) {
      const target = event.target as Node;
      const outsidePanel = panelRef.current && !panelRef.current.contains(target);
      const outsideAnchor = !anchorElRef.current?.contains(target);
      if (outsidePanel && outsideAnchor) onCloseRef.current();
    }
    function onScroll() {
      onCloseRef.current();
    }
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return createPortal(
    <div
      ref={panelRef}
      role="menu"
      aria-orientation="vertical"
      aria-label={m.watch_share({}, { locale })}
      style={panelStyle}
      className="fixed z-50 w-64 overflow-hidden rounded-lg border border-border-strong bg-surface p-1 shadow-2xl [animation:dropdown-fade-in_0.15s_ease-out]"
    >
      <div className="flex flex-col">
        <ShareOption
          icon={<img src="/logo.svg" alt="" className="h-5 w-5" />}
          label={m.watch_share_typetype_link({}, { locale })}
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
            onClick={() => {
              onClose();
              onShare(source.url, title);
            }}
          />
        )}
      </div>
    </div>,
    document.body,
  );
}
