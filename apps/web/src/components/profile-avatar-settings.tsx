import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useAuth } from "../hooks/use-auth";
import { useAvatar } from "../hooks/use-avatar";
import { getOpenMojiUrl } from "../lib/openmoji";
import { OPENMOJI_CATALOG } from "../lib/openmoji-catalog";
import { m } from "../paraglide/messages.js";
import { CustomAvatarUpload } from "./custom-avatar-upload";
import { Toast } from "./toast";

const SCROLL_STEP = 220;

function normalizeTerm(value: string): string {
  return value.trim().toLowerCase();
}

export function ProfileAvatarSettings() {
  const { me } = useAuth();
  const { emoji, clear } = useAvatar();
  const listRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const busy = emoji.isPending || clear.isPending;
  const selectedCode = me?.avatarType === "emoji" ? me.avatarCode : null;

  const filtered = useMemo(() => {
    const term = normalizeTerm(search);
    if (term.length === 0) return OPENMOJI_CATALOG;
    return OPENMOJI_CATALOG.filter((item) => item.label.includes(term) || item.code.includes(term));
  }, [search]);

  function scroll(direction: "left" | "right") {
    const next = direction === "right" ? SCROLL_STEP : -SCROLL_STEP;
    listRef.current?.scrollBy({ left: next, behavior: "smooth" });
  }

  if (!me || me.id.startsWith("guest:")) return null;

  return (
    <section data-interface-copy className="border-b border-border py-6 sm:py-8">
      <h2 className="text-base font-semibold text-fg">{m.avatar_title()}</h2>
      <div className="min-w-0 max-w-3xl">
        <CustomAvatarUpload onMessage={setToast} />
        <div className="flex min-w-0 flex-col gap-3 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-fg">
              {m.avatar_emoji_source()}{" "}
              <a
                href="https://openmoji.org"
                target="_blank"
                rel="noreferrer"
                className="text-fg-muted underline underline-offset-2 hover:text-fg"
              >
                OpenMoji
              </a>
            </p>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={m.avatar_search()}
              aria-label={m.avatar_search()}
              className="h-9 min-w-0 w-full rounded-sm border border-border-strong bg-app px-2.5 text-xs text-fg sm:w-48"
            />
          </div>
          <div className="grid min-w-0 grid-cols-[2rem_minmax(0,1fr)_2rem] items-center gap-2 border-y border-border py-3">
            <ScrollButton direction="left" disabled={busy} onClick={() => scroll("left")} />
            <div
              ref={listRef}
              className="min-w-0 overflow-x-auto"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <div className="flex gap-2 py-1">
                {filtered.map((item) => {
                  const selected = selectedCode === item.code;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      disabled={busy}
                      title={`${item.label} (${item.code})`}
                      onClick={() =>
                        emoji.mutate(item.code, {
                          onSuccess: () => setToast(m.avatar_updated()),
                          onError: () => setToast(m.avatar_update_failed()),
                        })
                      }
                      className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-sm border p-1.5 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 ${
                        selected
                          ? "border-fg-soft bg-fg/10"
                          : "border-border-strong hover:border-fg-soft"
                      }`}
                    >
                      <img src={getOpenMojiUrl(item.code)} alt={item.label} className="h-7 w-7" />
                    </button>
                  );
                })}
              </div>
            </div>
            <ScrollButton direction="right" disabled={busy} onClick={() => scroll("right")} />
          </div>
        </div>
        <div className="flex justify-stretch sm:justify-end">
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              clear.mutate(undefined, {
                onSuccess: () => setToast(m.avatar_updated()),
                onError: () => setToast(m.avatar_clear_failed()),
              })
            }
            className="h-9 w-full rounded-sm border border-border-strong px-3 text-xs text-fg transition-colors hover:border-fg-soft disabled:opacity-50 sm:w-auto"
          >
            {m.avatar_clear()}
          </button>
        </div>
      </div>
      <Toast message={toast} />
    </section>
  );
}

function ScrollButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  const right = direction === "right";
  const Icon = right ? ChevronRight : ChevronLeft;
  return (
    <button
      type="button"
      aria-label={right ? m.avatar_scroll_right() : m.avatar_scroll_left()}
      disabled={disabled}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-sm border border-border-strong text-fg-muted transition-colors hover:border-fg-soft hover:text-fg disabled:opacity-50"
    >
      <Icon className="size-4" aria-hidden="true" />
    </button>
  );
}
