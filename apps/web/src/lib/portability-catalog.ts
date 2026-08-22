import type { PortabilityCategory } from "./api-portability";

export const PORTABILITY_CATEGORIES: {
  value: PortabilityCategory;
  label: string;
  detail: string;
}[] = [
  { value: "subscriptions", label: "Subscriptions", detail: "Channels you follow" },
  { value: "subscriptionGroups", label: "Subscription groups", detail: "Named channel groups" },
  { value: "history", label: "Watch history", detail: "Previously watched videos" },
  { value: "playlists", label: "Playlists", detail: "Local playlists and their videos" },
  { value: "watchLater", label: "Watch later", detail: "Videos saved for later" },
  { value: "favorites", label: "Favorites", detail: "Favorited videos" },
  { value: "progress", label: "Playback progress", detail: "Saved video positions" },
  { value: "searchHistory", label: "Search history", detail: "Recent searches" },
  { value: "savedPlaylists", label: "Saved playlists", detail: "Remote playlists you follow" },
  { value: "settings", label: "Settings", detail: "Portable preferences" },
  { value: "contentFilters", label: "Content filters", detail: "Blocked content rules" },
];

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
  return PORTABILITY_CATEGORIES.find((item) => item.value === category)?.label ?? category;
}
