import { useEffect, useState } from "react";
import { secondsFromMediaSliderPercent } from "../lib/sabr-player-seek";
import { requestSabrSeek } from "../lib/sabr-vidstack-bridge";
import { TimeSlider } from "../lib/vidstack";
import { m } from "../paraglide/messages.js";

type Props = {
  seeking?: boolean;
  thumbnails?: string;
  video: HTMLVideoElement | null;
};

export function SabrTimeSlider({ seeking = false, thumbnails, video }: Props) {
  const [seekTarget, setSeekTarget] = useState<number | null>(null);
  useEffect(() => {
    if (!seeking) setSeekTarget(null);
  }, [seeking]);
  const style = seekTarget === null ? undefined : { "--typetype-seek-target": `${seekTarget}%` };

  return (
    <TimeSlider.Root
      className="vds-time-slider vds-slider"
      style={style}
      aria-label={m.ui_seek()}
      aria-busy={seeking}
      data-seeking={seeking ? "true" : undefined}
      onDragEnd={(percent) => {
        setSeekTarget(percent);
        const seconds = video ? secondsFromMediaSliderPercent(video, percent) : null;
        if (video && seconds !== null) requestSabrSeek(video, seconds);
      }}
    >
      <TimeSlider.Track className="vds-slider-track" />
      <TimeSlider.TrackFill className="vds-slider-track-fill vds-slider-track" />
      <TimeSlider.Progress className="vds-slider-progress vds-slider-track" />
      <TimeSlider.Thumb className="vds-slider-thumb" />
      <TimeSlider.Preview className="vds-slider-preview">
        {thumbnails && (
          <TimeSlider.Thumbnail.Root
            src={thumbnails}
            className="vds-slider-thumbnail vds-thumbnail"
          >
            <TimeSlider.Thumbnail.Img />
          </TimeSlider.Thumbnail.Root>
        )}
        <TimeSlider.Value className="vds-slider-value" />
      </TimeSlider.Preview>
    </TimeSlider.Root>
  );
}
