import { m } from "../paraglide/messages.js";
import type { Locale } from "../paraglide/runtime.js";
import type { PortabilityCategory } from "./api-portability";

export function portabilityCategories(locale: Locale = "en"): {
  value: PortabilityCategory;
  label: string;
  detail: string;
}[] {
  return [
    {
      value: "subscriptions",
      label: m.portability_category_subscriptions({}, { locale }),
      detail: m.portability_category_subscriptions_detail({}, { locale }),
    },
    {
      value: "subscriptionGroups",
      label: m.portability_category_subscription_groups({}, { locale }),
      detail: m.portability_category_subscription_groups_detail({}, { locale }),
    },
    {
      value: "history",
      label: m.portability_category_history({}, { locale }),
      detail: m.portability_category_history_detail({}, { locale }),
    },
    {
      value: "playlists",
      label: m.portability_category_playlists({}, { locale }),
      detail: m.portability_category_playlists_detail({}, { locale }),
    },
    {
      value: "watchLater",
      label: m.portability_category_watch_later({}, { locale }),
      detail: m.portability_category_watch_later_detail({}, { locale }),
    },
    {
      value: "favorites",
      label: m.portability_category_favorites({}, { locale }),
      detail: m.portability_category_favorites_detail({}, { locale }),
    },
    {
      value: "progress",
      label: m.portability_category_progress({}, { locale }),
      detail: m.portability_category_progress_detail({}, { locale }),
    },
    {
      value: "searchHistory",
      label: m.portability_category_search_history({}, { locale }),
      detail: m.portability_category_search_history_detail({}, { locale }),
    },
    {
      value: "savedPlaylists",
      label: m.portability_category_saved_playlists({}, { locale }),
      detail: m.portability_category_saved_playlists_detail({}, { locale }),
    },
    {
      value: "settings",
      label: m.portability_category_settings({}, { locale }),
      detail: m.portability_category_settings_detail({}, { locale }),
    },
    {
      value: "contentFilters",
      label: m.portability_category_content_filters({}, { locale }),
      detail: m.portability_category_content_filters_detail({}, { locale }),
    },
  ];
}

export const FORMAT_NAMES: Record<string, string> = {
  typetype: "TypeType",
  pipepipe: "PipePipe",
  newpipe: "NewPipe",
  invidious: "Invidious",
  piped: "Piped",
  libretube: "LibreTube",
  viewtube: "ViewTube",
  materialious: "Materialious",
  "youtube-local": "youtube-local",
  flow: "Flow",
  skytube: "SkyTube",
  grayjay: "Grayjay",
  "youtube-takeout": "YouTube Takeout",
  opml: "OPML",
};

export function categoryLabel(category: PortabilityCategory, locale: Locale = "en"): string {
  return portabilityCategories(locale).find((item) => item.value === category)?.label ?? category;
}
