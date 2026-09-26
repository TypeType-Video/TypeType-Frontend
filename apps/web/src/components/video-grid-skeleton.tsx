import { useSettings } from "../hooks/use-settings";
import { videoGridClassName } from "../lib/layout-preferences";
import { VideoCardSkeleton } from "./video-card-skeleton";

const DEFAULT_COUNT = 12;

type Props = {
  count?: number;
  idPrefix?: string;
};

export function VideoGridSkeleton({ count = DEFAULT_COUNT, idPrefix = "video-grid" }: Props) {
  const { settings } = useSettings();
  const keys = Array.from({ length: count }, (_, index) => `${idPrefix}-${index}`);
  return (
    <div className={videoGridClassName(settings.videoGridColumns)}>
      {keys.map((key) => (
        <VideoCardSkeleton key={key} />
      ))}
    </div>
  );
}
