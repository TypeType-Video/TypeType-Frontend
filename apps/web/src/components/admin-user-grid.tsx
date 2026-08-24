import { formatCreatedAt } from "../lib/admin-console";
import type { AuthUser } from "../types/auth";
import { AdminUserRow } from "./admin-user-row";

type AdminUserGridProps = {
  users: AuthUser[];
  onSelectUser: (id: string) => void;
};

export function AdminUserGrid({ users, onSelectUser }: AdminUserGridProps) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-app">
      <table className="w-full table-fixed text-left text-sm">
        <thead className="border-b border-border bg-surface/45 text-xs font-medium text-fg-muted">
          <tr>
            <th scope="col" className="w-auto px-3 py-3 sm:px-4">
              User
            </th>
            <th scope="col" className="hidden w-28 px-3 py-3 sm:table-cell">
              Role
            </th>
            <th scope="col" className="hidden w-28 px-3 py-3 md:table-cell">
              Status
            </th>
            <th scope="col" className="hidden w-32 px-3 py-3 lg:table-cell">
              Joined
            </th>
            <th scope="col" className="w-12 px-2 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((user) => (
            <AdminUserRow
              key={user.id}
              user={user}
              createdAtLabel={formatCreatedAt(user.createdAt)}
              onSelect={onSelectUser}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
