import type { SearchFilterGroup, SearchFilterOption, SearchFiltersResponse } from "../types/api";

const LABELS: Record<string, string> = {
  sortby: "Sort by",
  upload_date: "Upload date",
  sort_relevance: "Relevance",
  sort_rating: "Rating",
  sort_view: "View count",
  past_hour: "Past hour",
  past_day: "Today",
  past_week: "This week",
  past_month: "This month",
  past_year: "This year",
  short_video: "Short",
  long_video: "Long",
  Ccommons: "Creative Commons",
  Hdr: "HDR",
  "3d": "3D",
  "4k": "4K",
};

export function searchFilterLabel(raw: string): string {
  const afterColon = raw.includes(":") ? raw.slice(raw.indexOf(":") + 1) : raw;
  const value = afterColon.trim();
  if (LABELS[value]) return LABELS[value];
  return value
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function searchFilterGroups(filters: SearchFiltersResponse): SearchFilterGroup[] {
  if (filters.filterGroups && filters.filterGroups.length > 0) return filters.filterGroups;
  if (filters.sortFilters.length === 0) return [];
  const hasDefault = filters.sortFilters.some((option) => option.isDefault);
  return [
    {
      key: "legacy-sort",
      label: "Sort by",
      multiSelect: false,
      options: filters.sortFilters.map((option, index) => ({
        ...option,
        isDefault: option.isDefault ?? (!hasDefault && index === 0),
      })),
    },
  ];
}

export function sanitizeSearchFilters(
  groups: readonly SearchFilterGroup[],
  selected: readonly string[],
): string[] {
  const requested = new Set(selected);
  return groups.flatMap((group) => {
    const matches = group.options.filter(
      (option) => requested.has(option.value) && !option.isDefault,
    );
    return (group.multiSelect ? matches : matches.slice(0, 1)).map((option) => option.value);
  });
}

export function toggleSearchFilter(
  groups: readonly SearchFilterGroup[],
  selected: readonly string[],
  groupKey: string,
  option: SearchFilterOption,
): string[] {
  const group = groups.find((candidate) => candidate.key === groupKey);
  if (!group) return sanitizeSearchFilters(groups, selected);
  const groupValues = new Set(group.options.map((candidate) => candidate.value));
  const next = selected.filter((value) => !groupValues.has(value));
  if (group.multiSelect) {
    next.push(...selected.filter((value) => groupValues.has(value) && value !== option.value));
  }
  if (!option.isDefault && !selected.includes(option.value)) next.push(option.value);
  return sanitizeSearchFilters(groups, next);
}

export function activeSearchFilterOptions(
  groups: readonly SearchFilterGroup[],
  selected: readonly string[],
): SearchFilterOption[] {
  const values = new Set(sanitizeSearchFilters(groups, selected));
  return groups.flatMap((group) => group.options.filter((option) => values.has(option.value)));
}
