export function defaultLandingPath(value: string): string | null {
  switch (value) {
    case "subscriptions":
      return "/subscriptions";
    case "history":
      return "/history";
    case "playlists":
      return "/playlists";
    case "watch-later":
      return "/watch-later";
    case "favorites":
      return "/favorites";
    default:
      return null;
  }
}
