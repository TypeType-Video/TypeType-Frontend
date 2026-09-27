export function shouldLoadFullWatchStream(streamEnabled: boolean): boolean {
  return streamEnabled;
}

export function shouldLoadSabrBootstrap(streamEnabled: boolean, previewIsLive: boolean): boolean {
  return streamEnabled && !previewIsLive;
}
