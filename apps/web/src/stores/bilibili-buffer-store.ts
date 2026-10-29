import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { type BilibiliBufferLevel, isBilibiliBufferLevel } from "../lib/bilibili-buffer";

type BilibiliBufferStore = {
  level: BilibiliBufferLevel;
  setLevel: (level: BilibiliBufferLevel) => void;
};

export const useBilibiliBufferStore = create<BilibiliBufferStore>()(
  persist(
    (set) => ({
      level: "normal",
      setLevel: (level) => set({ level }),
    }),
    {
      name: "typetype-bilibili-buffer",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ level: state.level }),
      merge: (persisted, current) => {
        const stored = (persisted as { level?: unknown } | undefined)?.level;
        return { ...current, level: isBilibiliBufferLevel(stored) ? stored : current.level };
      },
    },
  ),
);
