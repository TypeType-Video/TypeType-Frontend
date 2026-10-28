import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { isPlayerColor, type PlayerColor } from "../lib/player-color";

type PlayerColorStore = {
  color: PlayerColor;
  setColor: (color: PlayerColor) => void;
};

export const usePlayerColorStore = create<PlayerColorStore>()(
  persist(
    (set) => ({
      color: "default",
      setColor: (color) => set({ color }),
    }),
    {
      name: "typetype-player-color",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ color: state.color }),
      merge: (persisted, current) => {
        const stored = (persisted as { color?: unknown } | undefined)?.color;
        return { ...current, color: isPlayerColor(stored) ? stored : current.color };
      },
    },
  ),
);
