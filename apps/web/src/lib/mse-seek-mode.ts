import type { PlayerSeekMode } from "@typetype/mse";

const STORAGE_KEY = "typetype:mse-seek-mode";

export type MseSeekModeOption = "default" | "preroll" | "native";

export function getMseSeekModePreference(): MseSeekModeOption {
  if (typeof window === "undefined" || !window.localStorage) return "default";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "native" || stored === "preroll") return stored;
  return "default";
}

export function setMseSeekModePreference(mode: MseSeekModeOption): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  if (mode === "default") {
    window.localStorage.removeItem(STORAGE_KEY);
  } else {
    window.localStorage.setItem(STORAGE_KEY, mode);
  }
}

export function getEffectiveMseSeekMode(): PlayerSeekMode {
  const pref = getMseSeekModePreference();
  if (pref === "native" || pref === "preroll") return pref;

  const envMode = import.meta.env.VITE_PLAYER_MSE_SEEK_MODE;
  if (envMode === "native" || envMode === "preroll") return envMode;

  return "preroll";
}
