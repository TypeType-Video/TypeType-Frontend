import { useEffect, useState } from "react";
import { secondsFromSliderPercent } from "../lib/sabr-player-seek";
import { requestSabrSeek } from "../lib/sabr-vidstack-bridge";
import { TimeSlider, useMediaRemote, useMediaState } from "../lib/vidstack";

type Props = {
  seeking?: boolean;
  video?: HTMLVideoElement | null;
};

export function AudioTimeSlider({ seeking = false, video = null }: Props) {
  const [seekTarget, setSeekTarget] = useState<number | null>(null);
  const remote = useMediaRemote();
  const mediaDuration = useMediaState("duration");
  useEffect(() => {
    if (!seeking) setSeekTarget(null);
  }, [seeking]);
  const style = seekTarget === null ? undefined : { "--typetype-seek-target": `${seekTarget}%` };

  return (
    <TimeSlider.Root
      className="typetype-audio-time-slider"
      style={style}
      aria-busy={seeking}
      data-seeking={seeking ? "true" : undefined}
      onDragEnd={(percent) => {
        setSeekTarget(percent);
        const seconds = secondsFromSliderPercent(video?.duration ?? mediaDuration, percent);
        if (seconds === null) return;
        if (video && requestSabrSeek(video, seconds)) return;
        remote.seek(seconds);
      }}
    >
      <TimeSlider.Track className="typetype-audio-time-slider-track">
        <TimeSlider.Progress className="typetype-audio-time-slider-progress" />
        <TimeSlider.TrackFill className="typetype-audio-time-slider-fill" />
      </TimeSlider.Track>
      <TimeSlider.Thumb className="typetype-audio-time-slider-thumb" />
    </TimeSlider.Root>
  );
}
