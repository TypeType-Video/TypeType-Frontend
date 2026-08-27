import { m } from "../paraglide/messages.js";
import { PlaylistActions } from "./playlist-actions";

type Props = {
  title: string;
  count: number;
  loading: boolean;
  canPlay: boolean;
  onPlayAll: () => void;
  onShuffle: () => void;
};

export function CollectionPageHeader({
  title,
  count,
  loading,
  canPlay,
  onPlayAll,
  onShuffle,
}: Props) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-lg font-semibold text-fg">{title}</h1>
        <p className="text-xs text-fg-soft">
          {loading
            ? m.ui_loading_videos()
            : count === 1
              ? m.ui_video_count({ count })
              : m.ui_videos_count({ count })}
        </p>
      </div>
      {canPlay && <PlaylistActions onPlayAll={onPlayAll} onShuffle={onShuffle} />}
    </header>
  );
}
