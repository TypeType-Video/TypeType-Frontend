import type { AuthUser } from "../types/auth";
import { AdminUserAvatar } from "./admin-user-avatar";

type AdminUserRowProps = {
  user: AuthUser;
  selected: boolean;
  createdAtLabel: string;
  onSelect: (id: string) => void;
};

function roleClass(role: AuthUser["role"]): string {
  if (role === "admin") return "bg-sky-500";
  if (role === "moderator") return "bg-amber-500";
  return "bg-fg-soft";
}

export function AdminUserRow({ user, selected, createdAtLabel, onSelect }: AdminUserRowProps) {
  const displayName = user.name.trim().length > 0 ? user.name : user.email;

  return (
    <button
      type="button"
      aria-label={`Select ${displayName}`}
      aria-pressed={selected}
      onClick={() => onSelect(user.id)}
      className={`w-full border-l-2 px-3 py-3 text-left transition-colors ${
        selected ? "border-accent bg-accent/5" : "border-transparent hover:bg-surface/50"
      }`}
    >
      <div className="flex items-center gap-3">
        <AdminUserAvatar user={user} className="h-9 w-9" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-fg">{displayName}</p>
          <p className="truncate text-xs text-fg-muted">{user.email}</p>
        </div>
        <div className="hidden shrink-0 items-center gap-4 text-xs text-fg-muted sm:flex">
          <span className="flex items-center gap-1.5 capitalize">
            <span className={`size-1.5 rounded-full ${roleClass(user.role)}`} aria-hidden="true" />
            {user.role}
          </span>
          <span>{createdAtLabel}</span>
          {user.suspended && (
            <span className="flex items-center gap-1.5 text-danger-strong">
              <span className="size-1.5 rounded-full bg-danger" aria-hidden="true" />
              suspended
            </span>
          )}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-3 pl-12 text-[11px] text-fg-soft sm:hidden">
        <span className="flex items-center gap-1.5 capitalize">
          <span className={`size-1.5 rounded-full ${roleClass(user.role)}`} aria-hidden="true" />
          {user.role}
        </span>
        <span>{createdAtLabel}</span>
        {user.suspended && (
          <span className="flex items-center gap-1.5 text-danger-strong">
            <span className="size-1.5 rounded-full bg-danger" aria-hidden="true" />
            suspended
          </span>
        )}
      </div>
    </button>
  );
}
