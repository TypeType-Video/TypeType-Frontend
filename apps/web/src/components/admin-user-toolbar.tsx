import { Search } from "lucide-react";
import type { ChangeEvent } from "react";
import {
  ADMIN_FILTERS,
  type AdminFilter,
  adminFilterLabel,
  isAdminFilter,
} from "../lib/admin-console";
import { m } from "../paraglide/messages.js";

type AdminUserToolbarProps = {
  search: string;
  filter: AdminFilter;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: AdminFilter) => void;
};

export function AdminUserToolbar({
  search,
  filter,
  onSearchChange,
  onFilterChange,
}: AdminUserToolbarProps) {
  function handleFilter(event: ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value;
    if (!isAdminFilter(next)) return;
    onFilterChange(next);
  }

  return (
    <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <label className="relative block w-full sm:max-w-sm">
        <span className="sr-only">{m.admin_users_search()}</span>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-soft"
          aria-hidden="true"
        />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={m.admin_users_search_placeholder()}
          className="h-10 w-full rounded-md border border-border-strong bg-app pl-9 pr-3 text-sm text-fg outline-none transition-colors placeholder:text-fg-soft focus:border-accent"
        />
      </label>
      <label className="w-full sm:w-40">
        <span className="mb-1.5 block text-xs font-medium text-fg-muted">
          {m.admin_users_filter()}
        </span>
        <select
          value={filter}
          onChange={handleFilter}
          className="h-10 w-full rounded-md border border-border-strong bg-app px-3 text-sm text-fg outline-none transition-colors focus:border-accent"
        >
          {ADMIN_FILTERS.map((item) => (
            <option key={item} value={item}>
              {adminFilterLabel(item)}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}
