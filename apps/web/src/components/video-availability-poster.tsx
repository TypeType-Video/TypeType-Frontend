import type { VideoAvailability } from "../lib/video-availability";
import { videoAvailabilityCopy } from "../lib/video-availability";
import { VideoAvailabilityIcon } from "./video-availability-icon";

type Props = {
  availability: VideoAvailability;
  message: string;
  poster?: string;
  compact?: boolean;
};

export function VideoAvailabilityPoster({ availability, message, poster, compact = false }: Props) {
  const copy = videoAvailabilityCopy(availability, message);
  const frameClass = compact ? "h-full w-full" : "aspect-video w-[min(92vw,960px)] rounded-lg";

  return (
    <div
      data-video-availability={availability}
      className={`relative overflow-hidden bg-black ${frameClass}`}
    >
      {poster && (
        <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}
      <div className="absolute inset-0 bg-black/70" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-5 text-center">
        <VideoAvailabilityIcon availability={availability} compact={compact} />
        <div className="flex max-w-md flex-col items-center gap-1.5">
          <p className="text-base font-semibold text-white">{copy.heading}</p>
          <p className="text-sm text-white/75">{copy.message}</p>
        </div>
      </div>
    </div>
  );
}
