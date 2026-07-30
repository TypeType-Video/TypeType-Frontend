import type { SponsorBlockSegmentItem } from "../types/api";

type SponsorBlockPlaybackState = {
  audioOnly: boolean;
  autoSkip: boolean;
  autoSkipSegments?: SponsorBlockSegmentItem[];
};

export function shouldRunSponsorBlockAutoSkip(state: SponsorBlockPlaybackState): boolean {
  return state.autoSkip && Boolean(state.autoSkipSegments);
}
