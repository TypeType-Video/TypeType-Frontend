import { expect, test } from "bun:test";
import {
  canRenderWatchStream,
  canRequestWatchStream,
  isWatchStreamPending,
  shouldLoadFullWatchStream,
  shouldLoadSabrBootstrap,
} from "../src/lib/watch-stream-loading";

test("loads the full stream in parallel with bootstrap", () => {
  expect(shouldLoadFullWatchStream(true)).toBe(true);
});

test("loads non-YouTube streams without waiting for SABR bootstrap", () => {
  expect(shouldLoadFullWatchStream(true)).toBe(true);
});

test("keeps all stream requests disabled until watch access is ready", () => {
  expect(shouldLoadFullWatchStream(false)).toBe(false);
});

test("skips the SABR bootstrap when the navigation preview is a live stream", () => {
  expect(shouldLoadSabrBootstrap(true, true)).toBe(false);
});

test("keeps the SABR bootstrap for videos without a confirmed live preview", () => {
  expect(shouldLoadSabrBootstrap(true, false)).toBe(true);
});

test("keeps the SABR bootstrap disabled until watch access is ready", () => {
  expect(shouldLoadSabrBootstrap(false, false)).toBe(false);
});

test("keeps the loading screen while React Query holds the previous stream", () => {
  expect(isWatchStreamPending(false, false, true)).toBe(true);
});

test("does not keep loading once the current stream is ready", () => {
  expect(isWatchStreamPending(false, false, false)).toBe(false);
});

const signedInLoading = {
  authReady: true,
  isAuthed: true,
  instancePending: true,
  settingsReady: false,
};

test("requests the stream as soon as auth is ready, before instance and settings", () => {
  expect(canRequestWatchStream(signedInLoading)).toBe(true);
  expect(canRequestWatchStream({ ...signedInLoading, authReady: false })).toBe(false);
});

test("renders the player only once instance and account settings are ready", () => {
  expect(canRenderWatchStream(signedInLoading)).toBe(false);
  expect(canRenderWatchStream({ ...signedInLoading, instancePending: false })).toBe(false);
  expect(
    canRenderWatchStream({ ...signedInLoading, instancePending: false, settingsReady: true }),
  ).toBe(true);
  expect(
    canRenderWatchStream({ ...signedInLoading, isAuthed: false, instancePending: false }),
  ).toBe(true);
});
