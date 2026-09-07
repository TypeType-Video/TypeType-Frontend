type AttachmentState = {
  video: object | null;
  videoId: string | null;
  positionMs: number;
};

export function resolveSabrStartTimeMs(
  state: AttachmentState,
  video: object,
  videoId: string,
  configuredStartTimeMs: number,
): number {
  const replacingSameVideo =
    state.video !== null && state.video !== video && state.videoId === videoId;
  const startTimeMs = replacingSameVideo ? state.positionMs : configuredStartTimeMs;
  return Number.isFinite(startTimeMs) ? Math.max(0, Math.round(startTimeMs)) : 0;
}

export class SabrVideoHandoff {
  private state: AttachmentState = { video: null, videoId: null, positionMs: 0 };

  attach(
    video: object,
    videoId: string,
    configuredStartTimeMs: number,
  ): { startTimeMs: number; replacingVideo: boolean } {
    const replacingVideo =
      this.state.video !== null && this.state.video !== video && this.state.videoId === videoId;
    const startTimeMs = resolveSabrStartTimeMs(this.state, video, videoId, configuredStartTimeMs);
    this.state = { video, videoId, positionMs: startTimeMs };
    return { startTimeMs, replacingVideo };
  }

  capture(video: object, videoId: string, positionMs: number): void {
    if (this.state.video !== video || this.state.videoId !== videoId) return;
    if (Number.isFinite(positionMs) && positionMs > 0) this.state.positionMs = positionMs;
  }
}
