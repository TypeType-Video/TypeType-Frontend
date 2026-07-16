import { expect, test } from "bun:test";
import { resolveEmbedAccess } from "../src/lib/embed-access";

test("uses anonymous public access inside an allowed iframe", () => {
  expect(
    resolveEmbedAccess({
      framed: true,
      guestAllowed: true,
      authReady: false,
      isAuthed: true,
      isGuest: false,
      settingsReady: false,
    }),
  ).toEqual({
    accountAuthenticated: false,
    sessionEnabled: false,
    streamEnabled: true,
  });
});

test("blocks anonymous iframe access when guest mode is disabled", () => {
  expect(
    resolveEmbedAccess({
      framed: true,
      guestAllowed: false,
      authReady: true,
      isAuthed: true,
      isGuest: false,
      settingsReady: true,
    }),
  ).toEqual({
    accountAuthenticated: false,
    sessionEnabled: false,
    streamEnabled: false,
  });
});

test("does not treat a guest session as an account", () => {
  expect(
    resolveEmbedAccess({
      framed: false,
      guestAllowed: false,
      authReady: true,
      isAuthed: true,
      isGuest: true,
      settingsReady: true,
    }),
  ).toEqual({
    accountAuthenticated: false,
    sessionEnabled: false,
    streamEnabled: false,
  });
});

test("waits for guest settings before loading a direct embed", () => {
  const input = {
    framed: false,
    guestAllowed: true,
    authReady: true,
    isAuthed: true,
    isGuest: true,
  };

  expect(resolveEmbedAccess({ ...input, settingsReady: false }).streamEnabled).toBe(false);
  expect(resolveEmbedAccess({ ...input, settingsReady: true })).toEqual({
    accountAuthenticated: false,
    sessionEnabled: true,
    streamEnabled: true,
  });
});

test("allows a signed-in account when guest mode is disabled", () => {
  expect(
    resolveEmbedAccess({
      framed: false,
      guestAllowed: false,
      authReady: true,
      isAuthed: true,
      isGuest: false,
      settingsReady: true,
    }),
  ).toEqual({
    accountAuthenticated: true,
    sessionEnabled: true,
    streamEnabled: true,
  });
});
