import { useMemo, useState } from "react";
import { useAdminUsers } from "../hooks/use-admin-users";
import { useInterfaceLocale } from "../hooks/use-interface-locale";
import { type AdminFilter, matchesAdminFilter } from "../lib/admin-console";
import { m } from "../paraglide/messages.js";
import { AdminUserDetailPanel } from "./admin-user-detail-panel";
import { AdminUserGrid } from "./admin-user-grid";
import { AdminUserToolbar } from "./admin-user-toolbar";
import { AdminUsersPagination } from "./admin-users-pagination";
import { ResetTokenModal } from "./reset-token-modal";

const PAGE_SIZE = 50;

type Props = {
  enabled: boolean;
  onToast: (message: string) => void;
};

export function AdminUsersSection({ enabled, onToast }: Props) {
  const { locale } = useInterfaceLocale();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<AdminFilter>("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [resetTokenData, setResetTokenData] = useState<{ email: string; token: string } | null>(
    null,
  );
  const { query, role, suspend, resetToken } = useAdminUsers(enabled, page, PAGE_SIZE);

  const users = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = query.data?.page ?? page;
  const pageStart = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const pageEnd = total === 0 ? 0 : Math.min(currentPage * PAGE_SIZE, total);
  const searchTerm = search.trim().toLowerCase();
  const busy = role.isPending || suspend.isPending || resetToken.isPending;

  const filtered = useMemo(
    () =>
      users
        .filter((user) => {
          if (!matchesAdminFilter(user, filter)) return false;
          if (!searchTerm) return true;
          const haystack = `${user.name} ${user.email} ${user.id}`.toLowerCase();
          return haystack.includes(searchTerm);
        })
        .sort((a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt))),
    [users, filter, searchTerm],
  );

  const selectedUser = users.find((user) => user.id === selectedUserId) ?? null;

  return (
    <>
      <AdminUserToolbar
        search={search}
        filter={filter}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onFilterChange={(value) => {
          setFilter(value);
          setPage(1);
        }}
      />
      {query.isPending && (
        <section className="rounded-md border border-border p-10 text-center text-sm text-fg-muted">
          {m.admin_users_loading()}
        </section>
      )}
      {query.isError && (
        <section className="rounded-md border border-danger/50 p-10 text-center text-sm text-danger-strong">
          {m.admin_users_load_error()}
        </section>
      )}
      {!query.isPending && !query.isError && filtered.length === 0 && (
        <section className="rounded-md border border-border p-10 text-center text-sm text-fg-muted">
          {m.admin_users_empty()}
        </section>
      )}
      {!query.isPending && !query.isError && filtered.length > 0 && (
        <section className="space-y-4">
          <AdminUserGrid users={filtered} locale={locale} onSelectUser={setSelectedUserId} />
          <AdminUsersPagination
            page={currentPage}
            totalPages={totalPages}
            total={total}
            pageStart={pageStart}
            pageEnd={pageEnd}
            pending={query.isPending}
            onPrev={() => setPage((value) => Math.max(1, value - 1))}
            onNext={() => setPage((value) => Math.min(totalPages, value + 1))}
          />
        </section>
      )}
      {selectedUser && (
        <AdminUserDetailPanel
          user={selectedUser}
          busy={busy}
          onClose={() => setSelectedUserId(null)}
          onMessage={onToast}
          onRole={(id, nextRole) => {
            role.mutate(
              { id, role: nextRole },
              {
                onSuccess: () => onToast(m.admin_users_role_updated()),
                onError: () => onToast(m.admin_users_update_failed()),
              },
            );
          }}
          onSuspend={(id, suspendedFlag) => {
            suspend.mutate(
              { id, suspended: !suspendedFlag },
              {
                onSuccess: () => onToast(m.admin_users_suspend_updated()),
                onError: () => onToast(m.admin_users_update_failed()),
              },
            );
          }}
          onReset={(id, email) => {
            resetToken.mutate(id, {
              onSuccess: (result) => {
                setSelectedUserId(null);
                setResetTokenData({ email, token: result.resetToken });
              },
              onError: () => onToast(m.admin_users_reset_failed()),
            });
          }}
        />
      )}
      {resetTokenData && (
        <ResetTokenModal
          email={resetTokenData.email}
          token={resetTokenData.token}
          onClose={() => setResetTokenData(null)}
          onCopied={() => onToast(m.admin_users_token_copied())}
        />
      )}
    </>
  );
}
