import { useCompactPlayer } from "../hooks/use-compact-player";
import { shouldRunSponsorBlockAutoSkip } from "../lib/sponsorblock-playback-tools";
import type { SponsorBlockSegmentItem } from "../types/api";
import { PlayerHotkeys } from "./player-hotkeys";
import { SponsorBlockSkipper } from "./player-internals";
import { PlayerPlayPauseIndicator } from "./player-play-pause-indicator";
import { SponsorBlockBar } from "./sponsorblock-bar";
import { SponsorBlockCurrentSegment } from "./sponsorblock-current-segment";
import { SponsorBlockSkipNotice } from "./sponsorblock-skip-notice";

type Props = {
  canSeek: boolean;
  audioOnly: boolean;
  sabrVideo: HTMLVideoElement | null;
  segments?: SponsorBlockSegmentItem[];
  autoSkipSegments?: SponsorBlockSegmentItem[];
  manualSkipSegments?: SponsorBlockSegmentItem[];
  autoSkip: boolean;
  mutedSkip: boolean;
  showCurrent: boolean;
};

export function VideoPlayerPlaybackTools(props: Props) {
  const compact = useCompactPlayer();
  return (
    <>
      {!compact && <PlayerHotkeys canSeek={props.canSeek} sabrVideo={props.sabrVideo} />}
      {!compact && !props.audioOnly && <PlayerPlayPauseIndicator />}
      {shouldRunSponsorBlockAutoSkip(props) && props.autoSkipSegments && (
        <SponsorBlockSkipper
          segments={props.autoSkipSegments}
          muteInsteadOfSkip={props.mutedSkip}
        />
      )}
      {!compact && props.segments && <SponsorBlockBar segments={props.segments} />}
      {!compact && props.segments && <SponsorBlockSkipNotice />}
      {!compact && props.showCurrent && props.segments && (
        <SponsorBlockCurrentSegment
          segments={props.segments}
          autoSkipSegments={props.autoSkipSegments}
          manualSkipSegments={props.manualSkipSegments}
          muteInsteadOfSkip={props.mutedSkip}
        />
      )}
    </>
  );
}
