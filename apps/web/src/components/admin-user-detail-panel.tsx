import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import type { AuthRole, AuthUser } from "../types/auth";
import { AdminUserAvatar } from "./admin-user-avatar";
import { AdminUserIdentityForm } from "./admin-user-identity-form";

type AdminUserDetailPanelProps = {
  user: AuthUser;
  busy: boolean;
  onRole: (id: string, role: AuthRole) => void;
  onSuspend: (id: string, suspended: boolean) => void;
  onReset: (id: string, email: string) => void;
  onMessage: (message: string) => void;
};

const ROLE_OPTIONS: AuthRole[] = ["user", "moderator", "admin"];

function roleClass(active: boolean): string {
  if (active) return "border-accent text-fg";
  return "border-transparent text-fg-muted hover:text-fg";
}

export function AdminUserDetailPanel({
  user,
  busy,
  onRole,
  onSuspend,
  onReset,
  onMessage,
}: AdminUserDetailPanelProps) {
  const [actionsOpen, setActionsOpen] = useState(false);
  const suspendClass = user.suspended
    ? "text-emerald-600 dark:text-emerald-300"
    : "text-danger-strong";

  return (
    <aside className="order-first h-fit border-y border-border py-5 [animation:admin-panel-slide-in_0.22s_cubic-bezier(0.22,1,0.36,1)] xl:order-none xl:sticky xl:top-16 xl:border-y-0 xl:border-l xl:py-0 xl:pl-6">
      <p className="mb-3 text-[11px] font-medium uppercase text-fg-soft">Selected user</p>
      <div className="flex items-center gap-3">
        <AdminUserAvatar user={user} className="h-11 w-11" />
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-fg">{user.name || user.email}</p>
          <p className="truncate text-xs text-fg-muted">{user.email}</p>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-fg-soft break-all">{user.id}</p>
      <AdminUserIdentityForm user={user} disabled={busy} onMessage={onMessage} />

      <div className="mt-4 grid grid-cols-3 border-y border-border py-1">
        {ROLE_OPTIONS.map((role) => (
          <button
            key={`${user.id}-${role}`}
            type="button"
            aria-pressed={user.role === role}
            disabled={busy || user.role === role}
            onClick={() => onRole(user.id, role)}
            className={`h-9 border-b-2 text-[11px] uppercase tracking-wide transition-colors disabled:cursor-default ${roleClass(
              user.role === role,
            )}`}
          >
            {role}
          </button>
        ))}
      </div>

      <div className="mt-3 relative">
        <button
          type="button"
          aria-expanded={actionsOpen}
          onClick={() => setActionsOpen((open) => !open)}
          aria-label="User actions"
          title="User actions"
          className="ml-auto grid size-9 place-items-center rounded-full text-fg transition-colors hover:bg-surface-strong"
        >
          <MoreHorizontal className="size-4" aria-hidden="true" />
        </button>

        {actionsOpen && (
          <div className="absolute right-0 z-20 mt-2 w-52 rounded-sm border border-border-strong bg-app p-2 shadow-2xl [animation:admin-actions-pop_0.18s_cubic-bezier(0.22,1,0.36,1)]">
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                onSuspend(user.id, user.suspended);
                setActionsOpen(false);
              }}
              className={`mb-1 h-8 w-full rounded-sm px-2.5 text-left text-xs font-medium transition-colors hover:bg-surface disabled:opacity-50 ${suspendClass}`}
            >
              {user.suspended ? "Unsuspend" : "Suspend"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                onReset(user.id, user.email);
                setActionsOpen(false);
              }}
              className="h-8 w-full rounded-sm px-2.5 text-left text-xs font-medium text-fg transition-colors hover:bg-surface disabled:opacity-50"
            >
              Reset token
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
