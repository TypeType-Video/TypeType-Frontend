import { getAdminUserAvatarUrl } from "../lib/admin-user-avatar";
import type { AuthUser } from "../types/auth";

type AdminUserAvatarProps = {
  user: AuthUser;
  className: string;
};

export function AdminUserAvatar({ user, className }: AdminUserAvatarProps) {
  const avatarUrl = getAdminUserAvatarUrl(user);

  return (
    <div
      className={`${className} overflow-hidden rounded-xl border border-border-strong bg-surface-strong`}
    >
      <img
        src={avatarUrl}
        alt={user.name || user.email}
        className="h-full w-full object-cover"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
