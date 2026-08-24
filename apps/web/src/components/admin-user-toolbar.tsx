import { Search } from "lucide-react";
import type { ChangeEvent } from "react";
import { ADMIN_FILTERS, type AdminFilter, isAdminFilter } from "../lib/admin-console";

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
    <section className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
      <label className="relative block max-w-xl">
        <span className="sr-only">Search users</span>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-soft"
          aria-hidden="true"
        />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search name, email or id"
          className="h-10 w-full rounded-sm border border-border-strong bg-app pl-9 pr-3 text-sm text-fg outline-none transition-colors placeholder:text-fg-soft focus:border-accent"
        />
      </label>
      <label>
        <span className="sr-only">Filter users</span>
        <select
          value={filter}
          onChange={handleFilter}
          className="h-10 w-full rounded-sm border border-border-strong bg-app px-3 text-sm text-fg sm:w-36"
        >
          {ADMIN_FILTERS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}
