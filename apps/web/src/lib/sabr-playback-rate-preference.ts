const MIN_PLAYBACK_RATE = 0.25;
const MAX_PLAYBACK_RATE = 16;

function isValidPlaybackRate(rate: number): boolean {
  return Number.isFinite(rate) && rate >= MIN_PLAYBACK_RATE && rate <= MAX_PLAYBACK_RATE;
}

export class SabrPlaybackRatePreference {
  private preferredRate: number | null = null;

  initialize(video: HTMLVideoElement): void {
    if (this.preferredRate === null && isValidPlaybackRate(video.playbackRate)) {
      this.preferredRate = video.playbackRate;
    }
  }

  capture(video: HTMLVideoElement, transient: boolean): void {
    if (!transient && isValidPlaybackRate(video.playbackRate)) {
      this.preferredRate = video.playbackRate;
    }
  }

  apply(video: HTMLVideoElement, transient: boolean): void {
    if (transient || this.preferredRate === null) return;
    video.defaultPlaybackRate = this.preferredRate;
    video.playbackRate = this.preferredRate;
  }
}
