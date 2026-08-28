import { formatCreatedAt } from "../lib/admin-console";
import { m } from "../paraglide/messages.js";
import type { AuthUser } from "../types/auth";
import { AdminUserRow } from "./admin-user-row";

type AdminUserGridProps = {
  users: AuthUser[];
  locale: string;
  onSelectUser: (id: string) => void;
};

export function AdminUserGrid({ users, locale, onSelectUser }: AdminUserGridProps) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-app">
      <table className="w-full table-fixed text-left text-sm">
        <thead className="border-b border-border bg-surface/45 text-xs font-medium text-fg-muted">
          <tr>
            <th scope="col" className="w-auto px-3 py-3 sm:px-4">
              {m.admin_users_column_user()}
            </th>
            <th scope="col" className="hidden w-28 px-3 py-3 sm:table-cell">
              {m.admin_users_column_role()}
            </th>
            <th scope="col" className="hidden w-28 px-3 py-3 md:table-cell">
              {m.admin_users_column_status()}
            </th>
            <th scope="col" className="hidden w-32 px-3 py-3 lg:table-cell">
              {m.admin_users_column_joined()}
            </th>
            <th scope="col" className="w-12 px-2 py-3">
              <span className="sr-only">{m.admin_users_column_actions()}</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((user) => (
            <AdminUserRow
              key={user.id}
              user={user}
              createdAtLabel={formatCreatedAt(user.createdAt, locale)}
              onSelect={onSelectUser}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
