import { m } from "../paraglide/messages.js";
import type { AuthRole, AuthUser } from "../types/auth";

export type AdminFilter = "all" | AuthRole | "suspended";

export const ADMIN_FILTERS: AdminFilter[] = ["all", "admin", "moderator", "user", "suspended"];

export function adminFilterLabel(filter: AdminFilter): string {
  if (filter === "all") return m.admin_users_filter_all();
  if (filter === "admin") return m.admin_users_filter_admins();
  if (filter === "moderator") return m.admin_users_filter_moderators();
  if (filter === "suspended") return m.admin_users_filter_suspended();
  return m.admin_users_filter_users();
}

export function adminRoleLabel(role: AuthRole): string {
  if (role === "admin") return m.admin_users_role_admin();
  if (role === "moderator") return m.admin_users_role_moderator();
  return m.admin_users_role_user();
}

export function isAdminFilter(value: string): value is AdminFilter {
  return (
    value === "all" ||
    value === "admin" ||
    value === "moderator" ||
    value === "user" ||
    value === "suspended"
  );
}

export function matchesAdminFilter(user: AuthUser, filter: AdminFilter): boolean {
  if (filter === "all") return true;
  if (filter === "suspended") return user.suspended;
  return user.role === filter;
}

export function formatCreatedAt(value: number | string, locale: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
