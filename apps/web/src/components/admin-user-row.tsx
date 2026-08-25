import { MoreHorizontal } from "lucide-react";
import { adminRoleLabel } from "../lib/admin-console";
import { m } from "../paraglide/messages.js";
import type { AuthRole, AuthUser } from "../types/auth";
import { AdminUserAvatar } from "./admin-user-avatar";

type AdminUserRowProps = {
  user: AuthUser;
  createdAtLabel: string;
  onSelect: (id: string) => void;
};

function roleClass(role: AuthRole): string {
  if (role === "admin") return "bg-sky-500";
  if (role === "moderator") return "bg-amber-500";
  return "bg-zinc-400 dark:bg-zinc-500";
}

export function AdminUserRow({ user, createdAtLabel, onSelect }: AdminUserRowProps) {
  const displayName = user.name.trim().length > 0 ? user.name : user.email;
  const statusLabel = user.suspended ? m.admin_users_filter_suspended() : m.admin_users_active();
  const roleLabel = adminRoleLabel(user.role);
  const statusClass = user.suspended ? "bg-danger" : "bg-emerald-500";

  return (
    <tr className="transition-colors hover:bg-surface/35">
      <td className="min-w-0 px-3 py-3 sm:px-4">
        <button
          type="button"
          onClick={() => onSelect(user.id)}
          className="flex w-full min-w-0 items-center gap-3 text-left"
        >
          <AdminUserAvatar user={user} className="h-9 w-9 shrink-0" />
          <span className="min-w-0">
            <span className="block truncate font-medium text-fg">{displayName}</span>
            <span className="block truncate text-xs text-fg-muted">{user.email}</span>
            <span className="mt-1 flex items-center gap-3 text-[11px] capitalize text-fg-soft sm:hidden">
              <span className="flex items-center gap-1.5">
                <span className={`size-1.5 rounded-full ${roleClass(user.role)}`} />
                {roleLabel}
              </span>
              <span className="flex items-center gap-1.5">
                <span className={`size-1.5 rounded-full ${statusClass}`} />
                {statusLabel}
              </span>
            </span>
          </span>
        </button>
      </td>
      <td className="hidden px-3 py-3 sm:table-cell">
        <span className="flex items-center gap-2 capitalize text-fg-muted">
          <span className={`size-1.5 rounded-full ${roleClass(user.role)}`} />
          {roleLabel}
        </span>
      </td>
      <td className="hidden px-3 py-3 md:table-cell">
        <span className="flex items-center gap-2 text-fg-muted">
          <span className={`size-1.5 rounded-full ${statusClass}`} />
          {statusLabel}
        </span>
      </td>
      <td className="hidden px-3 py-3 text-fg-muted lg:table-cell">{createdAtLabel}</td>
      <td className="px-2 py-3 text-right">
        <button
          type="button"
          onClick={() => onSelect(user.id)}
          aria-label={`${m.admin_users_manage()} ${displayName}`}
          title={`${m.admin_users_manage()} ${displayName}`}
          className="grid size-8 place-items-center rounded-full text-fg-muted transition-colors hover:bg-surface-strong hover:text-fg"
        >
          <MoreHorizontal className="size-4" aria-hidden="true" />
        </button>
      </td>
    </tr>
  );
}
