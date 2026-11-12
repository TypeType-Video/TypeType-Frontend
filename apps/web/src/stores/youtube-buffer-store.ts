import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  DEFAULT_YOUTUBE_BUFFER_SECONDS,
  isYoutubeBufferSeconds,
  type YoutubeBufferSeconds,
} from "../lib/youtube-buffer";

type YoutubeBufferStore = {
  seconds: YoutubeBufferSeconds;
  setSeconds: (seconds: YoutubeBufferSeconds) => void;
};

export const useYoutubeBufferStore = create<YoutubeBufferStore>()(
  persist(
    (set) => ({
      seconds: DEFAULT_YOUTUBE_BUFFER_SECONDS,
      setSeconds: (seconds) => {
        if (isYoutubeBufferSeconds(seconds)) set({ seconds });
      },
    }),
    {
      name: "typetype-youtube-buffer",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ seconds: state.seconds }),
      merge: (persisted, current) => {
        const stored =
          persisted !== null && typeof persisted === "object" && "seconds" in persisted
            ? persisted.seconds
            : undefined;
        return {
          ...current,
          seconds: isYoutubeBufferSeconds(stored) ? stored : DEFAULT_YOUTUBE_BUFFER_SECONDS,
        };
      },
    },
  ),
);
