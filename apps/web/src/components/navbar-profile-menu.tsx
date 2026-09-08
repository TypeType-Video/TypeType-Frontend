import { Link } from "@tanstack/react-router";
import { ChevronDown, LogOut, Settings, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAccountProfiles } from "../hooks/use-account-profiles";
import { getStoredAdminSection } from "../lib/admin-console-section";
import { getStoredSettingsSection } from "../lib/settings-section";
import { m } from "../paraglide/messages.js";
import type { AuthMe } from "../types/auth";
import { NavbarProfileSwitcher } from "./navbar-profile-switcher";
import { ProfileAvatar } from "./profile-avatar";

type Props = {
  me: AuthMe;
  isAdmin: boolean;
  isMobile: boolean;
  onSignOut: () => Promise<void>;
};

const MENU_ID = "navbar-profile-menu";

export function NavbarProfileMenu({ me, isAdmin, isMobile, onSignOut }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { query: profilesQuery } = useAccountProfiles();

  useEffect(() => {
    if (!open) return;
    function closeOnPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function closeOnKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    window.addEventListener("pointerdown", closeOnPointerDown);
    window.addEventListener("keydown", closeOnKeyDown);
    return () => {
      window.removeEventListener("pointerdown", closeOnPointerDown);
      window.removeEventListener("keydown", closeOnKeyDown);
    };
  }, [open]);

  function close() {
    setOpen(false);
  }

  async function handleSignOut() {
    close();
    await onSignOut();
  }

  const activeProfileName = profilesQuery.data?.profiles.find((profile) => profile.isActive)?.name;
  const profileName = activeProfileName || me.publicUsername?.trim() || "Profile";
  const menuClass = isMobile
    ? "fixed right-2 top-16 z-50 w-[min(18rem,calc(100vw-1rem))]"
    : "absolute right-0 top-full z-50 mt-2 w-64";

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={m.nav_open_menu()}
        aria-controls={MENU_ID}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-9 items-center gap-1 rounded-full p-0.5 text-fg transition-colors hover:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-strong"
      >
        <ProfileAvatar me={me} className="h-8 w-8" plain />
        <ChevronDown
          size={15}
          aria-hidden="true"
          className={`mr-1 text-fg-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          id={MENU_ID}
          role="menu"
          aria-label={m.profile_title()}
          className={`${menuClass} overflow-hidden rounded-xl border border-border-strong bg-surface shadow-2xl`}
        >
          <div className="border-b border-border px-3 py-3">
            <p className="truncate text-sm font-semibold text-fg">{profileName}</p>
            <p className="truncate text-xs text-fg-muted">{me.id}</p>
          </div>
          <NavbarProfileSwitcher onClose={close} />
          <div className="p-1.5">
            <Link
              to="/profile"
              role="menuitem"
              onClick={close}
              className="flex h-9 items-center gap-2 rounded-md px-2.5 text-sm text-fg transition-colors hover:bg-surface-strong"
            >
              <UserRound size={16} aria-hidden="true" />
              <span>{m.profile_title()}</span>
            </Link>
            <Link
              to="/settings"
              search={{ section: getStoredSettingsSection() }}
              role="menuitem"
              onClick={close}
              className="flex h-9 items-center gap-2 rounded-md px-2.5 text-sm text-fg transition-colors hover:bg-surface-strong"
            >
              <Settings size={16} aria-hidden="true" />
              <span>{m.nav_settings()}</span>
            </Link>
            {isAdmin && (
              <Link
                to="/admin-console"
                search={{ section: getStoredAdminSection() }}
                role="menuitem"
                onClick={close}
                className="flex h-9 items-center gap-2 rounded-md px-2.5 text-sm text-fg transition-colors hover:bg-surface-strong"
              >
                <ShieldCheck size={16} aria-hidden="true" />
                <span>{m.nav_admin()}</span>
              </Link>
            )}
            <button
              type="button"
              role="menuitem"
              onClick={() => void handleSignOut()}
              className="flex h-9 w-full items-center gap-2 rounded-md px-2.5 text-left text-sm text-fg transition-colors hover:bg-surface-strong"
            >
              <LogOut size={16} aria-hidden="true" />
              <span>{m.nav_sign_out()}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
