import { Plus, X } from "lucide-react";
import { type FormEvent, type MouseEvent, useState } from "react";
import { ChannelAvatar } from "../components/channel-avatar";
import { useBlocked } from "../hooks/use-blocked";
import type { BlockedItem } from "../types/user";

const SECTION_LABEL = "text-xs font-medium text-fg-soft uppercase tracking-wider px-1";

type ChannelBubbleProps = {
  item: BlockedItem;
  onClick: () => void;
  onRemove: (event: MouseEvent<HTMLButtonElement>) => void;
};

function ChannelBubble({ item, onClick, onRemove }: ChannelBubbleProps) {
  const label = item.name ?? item.url;
  return (
    <div className="relative group">
      <button
        type="button"
        onClick={onClick}
        title={label}
        className="block rounded-full focus:outline-none focus:ring-2 focus:ring-border-strong"
      >
        <ChannelAvatar
          src={item.thumbnailUrl ?? ""}
          name={label}
          className="w-12 h-12 opacity-80 group-hover:opacity-100 transition-opacity"
        />
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Unblock ${label}`}
        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-surface-strong hover:bg-danger border border-border-strong text-fg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X size={9} strokeWidth={3} />
      </button>
    </div>
  );
}

type ModalProps = {
  item: BlockedItem;
  onUnblock: () => void;
  onClose: () => void;
};

function BlockedChannelModal({ item, onUnblock, onClose }: ModalProps) {
  const label = item.name ?? item.url;
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <div className="relative flex w-64 flex-col items-center gap-4 rounded-md border border-border bg-surface p-6">
        <ChannelAvatar src={item.thumbnailUrl ?? ""} name={label} className="w-16 h-16" />
        <p className="text-sm text-fg font-medium text-center break-all">{label}</p>
        <div className="flex gap-2 w-full">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-9 rounded-lg text-xs text-fg-muted hover:text-fg hover:bg-surface-strong transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onUnblock}
            className="flex-1 h-9 rounded-lg text-xs text-danger hover:text-danger-strong hover:bg-surface-strong transition-colors"
          >
            Unblock
          </button>
        </div>
      </div>
    </div>
  );
}

export function SettingsBlocked() {
  const { channels, videos, keywords, addKeyword, removeChannel, removeKeyword, removeVideo } =
    useBlocked();
  const [selected, setSelected] = useState<BlockedItem | null>(null);
  const [keyword, setKeyword] = useState("");

  const channelList = channels.data ?? [];
  const videoList = videos.data ?? [];
  const keywordList = keywords.data ?? [];

  function submitKeyword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = keyword.trim();
    if (!value) return;
    addKeyword.mutate(value, { onSuccess: () => setKeyword("") });
  }

  return (
    <>
      <section className="flex flex-col gap-3">
        <p className={SECTION_LABEL}>Blocked keywords</p>
        <div className="overflow-hidden rounded-md border border-border bg-surface">
          <form
            onSubmit={submitKeyword}
            className="flex items-center gap-2 border-b border-border px-4 py-3"
          >
            <input
              type="text"
              value={keyword}
              maxLength={100}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Keyword"
              aria-label="Keyword to block"
              className="h-9 min-w-0 flex-1 rounded-md border border-border-strong bg-app px-3 text-sm text-fg outline-none placeholder:text-fg-soft focus:border-fg-soft"
            />
            <button
              type="submit"
              disabled={!keyword.trim() || addKeyword.isPending}
              aria-label="Add blocked keyword"
              title="Add blocked keyword"
              className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-fg text-app transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={16} />
            </button>
          </form>
          {keywordList.length === 0 ? (
            <p className="px-4 py-3 text-xs text-fg-soft">No blocked keywords</p>
          ) : (
            <div className="divide-y divide-border">
              {keywordList.map((item) => (
                <div key={item.keyword} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="min-w-0 flex-1 truncate text-xs text-fg-muted">
                    {item.keyword}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeKeyword.mutate(item.keyword)}
                    aria-label={`Unblock ${item.keyword}`}
                    title={`Unblock ${item.keyword}`}
                    className="flex-shrink-0 rounded p-1 text-fg-soft transition-colors hover:bg-surface-strong hover:text-fg"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      {channelList.length > 0 && (
        <section className="flex flex-col gap-3">
          <p className={SECTION_LABEL}>Blocked channels</p>
          <div className="flex flex-wrap gap-3 px-1">
            {channelList.map((item) => (
              <ChannelBubble
                key={item.url}
                item={item}
                onClick={() => setSelected(item)}
                onRemove={(event) => {
                  event.stopPropagation();
                  removeChannel.mutate(item.url);
                }}
              />
            ))}
          </div>
        </section>
      )}
      {videoList.length > 0 && (
        <section className="flex flex-col gap-3">
          <p className={SECTION_LABEL}>Blocked videos</p>
          <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-surface">
            {videoList.map((item) => (
              <div key={item.url} className="flex items-center gap-3 px-4 py-2.5">
                <span className="text-xs text-fg-muted truncate flex-1 min-w-0">{item.url}</span>
                <button
                  type="button"
                  onClick={() => removeVideo.mutate(item.url)}
                  aria-label={`Unblock ${item.url}`}
                  className="flex-shrink-0 text-fg-soft hover:text-fg transition-colors p-1 rounded hover:bg-surface-strong"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
      {selected !== null && (
        <BlockedChannelModal
          item={selected}
          onUnblock={() => {
            removeChannel.mutate(selected.url);
            setSelected(null);
          }}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
