export type SponsorBlockBarRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export function sponsorBlockBarPosition(
  playerRect: SponsorBlockBarRect,
  trackRect: SponsorBlockBarRect,
  height: number,
) {
  return {
    top: trackRect.top - playerRect.top + (trackRect.height - height) / 2,
    left: trackRect.left - playerRect.left,
    width: trackRect.width,
  };
}
