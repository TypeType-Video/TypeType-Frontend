import { describe, expect, test } from "bun:test";
import {
  activeSearchFilterOptions,
  sanitizeSearchFilters,
  searchFilterGroups,
  searchFilterLabel,
  toggleSearchFilter,
} from "../src/lib/search-filter-selection";
import type { SearchFilterGroup } from "../src/types/api";

const groups: SearchFilterGroup[] = [
  {
    key: "sort",
    label: "sortby",
    multiSelect: false,
    options: [
      { value: "relevance", label: "sort_relevance", isDefault: true },
      { value: "views", label: "sort_view" },
      { value: "rating", label: "sort_rating" },
    ],
  },
  {
    key: "features",
    label: "features",
    multiSelect: true,
    options: [
      { value: "hd", label: "HD" },
      { value: "captions", label: "Subtitles" },
    ],
  },
];

function option(groupKey: string, value: string) {
  const match = groups
    .find((group) => group.key === groupKey)
    ?.options.find((candidate) => candidate.value === value);
  if (!match) throw new Error(`Missing ${groupKey} option ${value}`);
  return match;
}

describe("search filter selection", () => {
  test("keeps one exclusive value and multiple feature values", () => {
    expect(sanitizeSearchFilters(groups, ["views", "rating", "hd", "captions"])).toEqual([
      "views",
      "hd",
      "captions",
    ]);
  });

  test("replaces exclusive filters without changing other groups", () => {
    expect(toggleSearchFilter(groups, ["views", "hd"], "sort", option("sort", "rating"))).toEqual([
      "rating",
      "hd",
    ]);
  });

  test("selecting a default removes the group from the URL", () => {
    expect(
      toggleSearchFilter(groups, ["views", "hd"], "sort", option("sort", "relevance")),
    ).toEqual(["hd"]);
  });

  test("toggles multi-select filters independently", () => {
    expect(
      toggleSearchFilter(groups, ["views", "hd"], "features", option("features", "captions")),
    ).toEqual(["views", "hd", "captions"]);
    expect(
      toggleSearchFilter(groups, ["views", "hd"], "features", option("features", "hd")),
    ).toEqual(["views"]);
  });

  test("falls back to the legacy flat filter response", () => {
    expect(
      searchFilterGroups({ contentFilters: [], sortFilters: [{ value: "views", label: "Views" }] }),
    ).toEqual([
      {
        key: "legacy-sort",
        label: "Sort by",
        multiSelect: false,
        options: [{ value: "views", label: "Views", isDefault: true }],
      },
    ]);
  });

  test("returns active options and human labels", () => {
    expect(
      activeSearchFilterOptions(groups, ["views", "hd"]).map((option) => option.value),
    ).toEqual(["views", "hd"]);
    expect(searchFilterLabel("upload_date")).toBe("Upload date");
    expect(searchFilterLabel("sort_view")).toBe("View count");
  });
});
