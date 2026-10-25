export type WatchAccessState = {
  authReady: boolean;
  isAuthed: boolean;
  instancePending: boolean;
  settingsReady: boolean;
};

export function canRequestWatchStream(access: WatchAccessState): boolean {
  return access.authReady;
}

export function canRenderWatchStream(access: WatchAccessState): boolean {
  return access.authReady && !access.instancePending && (!access.isAuthed || access.settingsReady);
}

export function shouldLoadFullWatchStream(streamEnabled: boolean): boolean {
  return streamEnabled;
}

export function shouldLoadSabrBootstrap(streamEnabled: boolean, previewIsLive: boolean): boolean {
  return streamEnabled && !previewIsLive;
}

export function isWatchStreamPending(
  streamLoading: boolean,
  bootstrapLoading: boolean,
  placeholderData: boolean,
): boolean {
  return streamLoading || bootstrapLoading || placeholderData;
}
