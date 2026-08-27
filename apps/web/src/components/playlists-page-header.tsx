import { m } from "../paraglide/messages.js";

type Props = {
  selectionMode: boolean;
  selectedCount: number;
  canSelect: boolean;
  onSelect: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onCreate: () => void;
};

export function PlaylistsPageHeader({
  selectionMode,
  selectedCount,
  canSelect,
  onSelect,
  onCancel,
  onDelete,
  onCreate,
}: Props) {
  const base = "rounded-lg px-3 py-2 text-sm transition-colors";
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="font-semibold text-fg text-lg">{m.portability_category_playlists()}</h1>
      <div className="flex items-center gap-2">
        {selectionMode ? (
          <>
            <span className="text-fg-soft text-xs">
              {selectedCount} {m.ui_selected()}
            </span>
            <button type="button" onClick={onCancel} className={`${base} text-fg-muted`}>
              {m.portability_cancel()}
            </button>
            <button
              type="button"
              disabled={selectedCount === 0}
              onClick={onDelete}
              className="rounded-lg bg-danger px-3 py-2 text-sm text-white transition-colors hover:bg-danger disabled:cursor-not-allowed disabled:opacity-40"
            >
              {m.ui_delete_2()}
              {selectedCount})
            </button>
          </>
        ) : (
          <>
            {canSelect && (
              <button
                type="button"
                onClick={onSelect}
                className={`${base} border border-border bg-surface text-fg-muted hover:border-border-strong hover:text-fg`}
              >
                {m.groups_preview_select_channel()}
              </button>
            )}
            <button
              type="button"
              onClick={onCreate}
              className={`${base} border border-border-strong bg-surface-strong text-fg hover:bg-surface-soft`}
            >
              {m.ui_new_playlist()}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
