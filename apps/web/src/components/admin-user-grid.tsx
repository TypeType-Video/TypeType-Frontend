import { formatCreatedAt } from "../lib/admin-console";
import type { AuthUser } from "../types/auth";
import { AdminUserRow } from "./admin-user-row";

type AdminUserGridProps = {
  users: AuthUser[];
  selectedUserId: string | null;
  onSelectUser: (id: string) => void;
};

export function AdminUserGrid({ users, selectedUserId, onSelectUser }: AdminUserGridProps) {
  return (
    <div className="divide-y divide-border border-y border-border">
      {users.map((user) => (
        <AdminUserRow
          key={user.id}
          user={user}
          selected={selectedUserId === user.id}
          createdAtLabel={formatCreatedAt(user.createdAt)}
          onSelect={(id) => onSelectUser(id)}
        />
      ))}
    </div>
  );
}
