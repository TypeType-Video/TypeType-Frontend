import { KeyRound, ShieldBan, ShieldCheck, X } from "lucide-react";
import { useEffect } from "react";
import { adminRoleLabel } from "../lib/admin-console";
import { m } from "../paraglide/messages.js";
import type { AuthRole, AuthUser } from "../types/auth";
import { AdminUserAvatar } from "./admin-user-avatar";
import { AdminUserIdentityForm } from "./admin-user-identity-form";

type AdminUserDetailPanelProps = {
  user: AuthUser;
  busy: boolean;
  onClose: () => void;
  onRole: (id: string, role: AuthRole) => void;
  onSuspend: (id: string, suspended: boolean) => void;
  onReset: (id: string, email: string) => void;
  onMessage: (message: string) => void;
};

const ROLE_OPTIONS: AuthRole[] = ["user", "moderator", "admin"];

export function AdminUserDetailPanel({
  user,
  busy,
  onClose,
  onRole,
  onSuspend,
  onReset,
  onMessage,
}: AdminUserDetailPanelProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80]"
      role="dialog"
      aria-modal="true"
      aria-label={m.admin_users_details()}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={m.admin_users_close_details()}
        className="absolute inset-0 bg-black/35 backdrop-blur-[1px]"
      />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md origin-right flex-col border-l border-border bg-app shadow-2xl [animation:admin-panel-slide-in_0.22s_cubic-bezier(0.22,1,0.36,1)]">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="font-semibold text-fg">{m.admin_users_details()}</h3>
            <p className="mt-0.5 text-xs text-fg-muted">{m.admin_users_details_description()}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={m.admin_users_close_details()}
            title={m.admin_users_close()}
            className="grid size-9 place-items-center rounded-full text-fg-muted transition-colors hover:bg-surface-strong hover:text-fg"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <div className="flex items-center gap-3">
            <AdminUserAvatar user={user} className="h-11 w-11" />
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-fg">{user.name || user.email}</p>
              <p className="truncate text-xs text-fg-muted">{user.email}</p>
            </div>
          </div>
          <p className="mt-2 break-all text-[11px] text-fg-soft">{user.id}</p>
          <AdminUserIdentityForm user={user} disabled={busy} onMessage={onMessage} />

          <section className="mt-6 border-t border-border pt-5">
            <label className="text-xs font-medium text-fg-muted">
              {m.admin_users_column_role()}
              <select
                value={user.role}
                disabled={busy}
                onChange={(event) => onRole(user.id, event.target.value as AuthRole)}
                className="mt-1.5 h-10 w-full rounded-md border border-border-strong bg-app px-3 text-sm capitalize text-fg outline-none transition-colors focus:border-accent disabled:opacity-50"
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {adminRoleLabel(role)}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className="mt-6 border-t border-border pt-5">
            <h4 className="text-xs font-medium text-fg-muted">{m.admin_users_account_access()}</h4>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => onSuspend(user.id, user.suspended)}
                className={`flex h-10 items-center justify-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors disabled:opacity-50 ${
                  user.suspended
                    ? "border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-300"
                    : "border-danger/40 text-danger-strong hover:bg-danger/10"
                }`}
              >
                {user.suspended ? (
                  <ShieldCheck className="size-4" />
                ) : (
                  <ShieldBan className="size-4" />
                )}
                {user.suspended ? m.admin_users_unsuspend() : m.admin_users_suspend()}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => onReset(user.id, user.email)}
                className="flex h-10 items-center justify-center gap-2 rounded-md border border-border-strong text-xs font-medium text-fg transition-colors hover:bg-surface disabled:opacity-50"
              >
                <KeyRound className="size-4" />
                {m.admin_users_reset_token()}
              </button>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
