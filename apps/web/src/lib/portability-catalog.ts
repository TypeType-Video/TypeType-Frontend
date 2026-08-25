import { m } from "../paraglide/messages.js";
import type { PortabilityCategory } from "./api-portability";

export function portabilityCategories(): {
  value: PortabilityCategory;
  label: string;
  detail: string;
}[] {
  return [
    {
      value: "subscriptions",
      label: m.portability_category_subscriptions(),
      detail: m.portability_category_subscriptions_detail(),
    },
    {
      value: "subscriptionGroups",
      label: m.portability_category_subscription_groups(),
      detail: m.portability_category_subscription_groups_detail(),
    },
    {
      value: "history",
      label: m.portability_category_history(),
      detail: m.portability_category_history_detail(),
    },
    {
      value: "playlists",
      label: m.portability_category_playlists(),
      detail: m.portability_category_playlists_detail(),
    },
    {
      value: "watchLater",
      label: m.portability_category_watch_later(),
      detail: m.portability_category_watch_later_detail(),
    },
    {
      value: "favorites",
      label: m.portability_category_favorites(),
      detail: m.portability_category_favorites_detail(),
    },
    {
      value: "progress",
      label: m.portability_category_progress(),
      detail: m.portability_category_progress_detail(),
    },
    {
      value: "searchHistory",
      label: m.portability_category_search_history(),
      detail: m.portability_category_search_history_detail(),
    },
    {
      value: "savedPlaylists",
      label: m.portability_category_saved_playlists(),
      detail: m.portability_category_saved_playlists_detail(),
    },
    {
      value: "settings",
      label: m.portability_category_settings(),
      detail: m.portability_category_settings_detail(),
    },
    {
      value: "contentFilters",
      label: m.portability_category_content_filters(),
      detail: m.portability_category_content_filters_detail(),
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

export function categoryLabel(category: PortabilityCategory): string {
  return portabilityCategories().find((item) => item.value === category)?.label ?? category;
}
