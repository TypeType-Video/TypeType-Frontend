import { afterEach, describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import {
  DEFAULT_YOUTUBE_BUFFER_SECONDS,
  isYoutubeBufferSeconds,
  youtubeBufferConfig,
} from "../src/lib/youtube-buffer";
import { useYoutubeBufferStore } from "../src/stores/youtube-buffer-store";

const STORAGE_KEY = "typetype-youtube-buffer";

afterEach(() => {
  useYoutubeBufferStore.setState({ seconds: DEFAULT_YOUTUBE_BUFFER_SECONDS });
  localStorage.removeItem(STORAGE_KEY);
});

describe("YouTube buffer preference", () => {
  it("starts at 30 seconds without an existing preference", () => {
    expect(DEFAULT_YOUTUBE_BUFFER_SECONDS).toBe(30);
    expect(useYoutubeBufferStore.getInitialState().seconds).toBe(30);
    expect(youtubeBufferConfig(DEFAULT_YOUTUBE_BUFFER_SECONDS)).toEqual({ bufferGoalMs: 30_000 });
  });

  it("preserves all existing supported preferences instead of forcing the new default", async () => {
    for (const seconds of [10, 30, 60, 120]) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: { seconds }, version: 0 }));
      await useYoutubeBufferStore.persist.rehydrate();
      expect(useYoutubeBufferStore.getState().seconds).toBe(seconds);
    }
  });

  it("accepts only the four supported choices", () => {
    for (const seconds of [10, 30, 60, 120]) expect(isYoutubeBufferSeconds(seconds)).toBe(true);
    for (const value of [0, -1, 8, 15, 121, "30", null, undefined, {}, Number.NaN]) {
      expect(isYoutubeBufferSeconds(value)).toBe(false);
    }
  });

  it("saves only the preference in browser storage and restores it", async () => {
    useYoutubeBufferStore.getState().setSeconds(120);
    const saved = localStorage.getItem(STORAGE_KEY);
    expect(JSON.parse(saved ?? "null")).toEqual({ state: { seconds: 120 }, version: 0 });
    useYoutubeBufferStore.setState({ seconds: DEFAULT_YOUTUBE_BUFFER_SECONDS });
    localStorage.setItem(STORAGE_KEY, saved ?? "");
    await useYoutubeBufferStore.persist.rehydrate();
    expect(useYoutubeBufferStore.getState().seconds).toBe(120);
  });

  it("falls back to 30 seconds for invalid saved values", async () => {
    for (const state of [{ seconds: 999 }, { seconds: "60" }, {}, null]) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, version: 0 }));
      await useYoutubeBufferStore.persist.rehydrate();
      expect(useYoutubeBufferStore.getState().seconds).toBe(30);
    }
  });

  it("does not replace the default when stored JSON is corrupted", async () => {
    localStorage.setItem(STORAGE_KEY, "invalid-json");
    await useYoutubeBufferStore.persist.rehydrate();
    expect(useYoutubeBufferStore.getState().seconds).toBe(30);
  });

  it("passes the chosen VOD target and leaves live defaults to the player", () => {
    expect(youtubeBufferConfig(10)).toEqual({ bufferGoalMs: 10_000 });
    expect(youtubeBufferConfig(30, false)).toEqual({ bufferGoalMs: 30_000 });
    expect(youtubeBufferConfig(60, false)).toEqual({ bufferGoalMs: 60_000 });
    expect(youtubeBufferConfig(120, false)).toEqual({ bufferGoalMs: 120_000 });
    expect(youtubeBufferConfig(120, true)).toEqual({});
    expect(youtubeBufferConfig(60, true)).toEqual({});
    expect(youtubeBufferConfig(DEFAULT_YOUTUBE_BUFFER_SECONDS, true)).toEqual({});
  });

  it("reads the preference when creating an engine, without restarting it on changes", () => {
    const source = readFileSync(
      new URL("../src/components/sabr-mse-player.tsx", import.meta.url),
      "utf8",
    );
    expect(source).toContain(
      "...youtubeBufferConfig(useYoutubeBufferStore.getState().seconds, initialConfig.isLive)",
    );
    expect(source).not.toContain("useYoutubeBufferStore((");
    const ui = readFileSync(
      new URL("../src/settings/settings-youtube-buffer.tsx", import.meta.url),
      "utf8",
    );
    expect(ui).not.toContain("useSettings");
    expect(ui).not.toContain("mutate");
  });
});
