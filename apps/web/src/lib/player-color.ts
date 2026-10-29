export const PLAYER_COLORS = [
  "default",
  "white",
  "red",
  "pink",
  "purple",
  "blue",
  "green",
  "orange",
] as const;

export type PlayerColor = (typeof PLAYER_COLORS)[number];

const SWATCHES: Record<Exclude<PlayerColor, "default">, string> = {
  white: "#f5f5f5",
  red: "#ff174d",
  pink: "#ff4fa3",
  purple: "#a970ff",
  blue: "#3b9eff",
  green: "#2fd17a",
  orange: "#ff8a1f",
};

export function isPlayerColor(value: unknown): value is PlayerColor {
  return typeof value === "string" && (PLAYER_COLORS as readonly string[]).includes(value);
}

export function playerColorValue(color: PlayerColor): string | null {
  return color === "default" ? null : SWATCHES[color];
}

export function applyPlayerColor(color: PlayerColor): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const value = playerColorValue(color);
  if (value === null) {
    delete root.dataset.playerColor;
    root.style.removeProperty("--typetype-player-brand");
    return;
  }
  root.dataset.playerColor = color;
  root.style.setProperty("--typetype-player-brand", value);
}
