export type EmbedAccessInput = {
  framed: boolean;
  guestAllowed: boolean;
  authReady: boolean;
  isAuthed: boolean;
  isGuest: boolean;
  settingsReady: boolean;
};

export type EmbedAccess = {
  accountAuthenticated: boolean;
  sessionEnabled: boolean;
  streamEnabled: boolean;
};

export function isEmbeddedFrame(): boolean {
  return typeof window !== "undefined" && window.self !== window.top;
}

export function resolveEmbedAccess(input: EmbedAccessInput): EmbedAccess {
  const accountAuthenticated = !input.framed && input.isAuthed && !input.isGuest;
  const sessionEnabled = !input.framed && input.isAuthed && (!input.isGuest || input.guestAllowed);
  const authReady = input.framed || input.authReady;
  const streamEnabled =
    (input.guestAllowed || accountAuthenticated) &&
    authReady &&
    (!sessionEnabled || input.settingsReady);

  return { accountAuthenticated, sessionEnabled, streamEnabled };
}
