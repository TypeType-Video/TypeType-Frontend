import { useAllowedChannels } from "../hooks/use-allowed-channels";
import { useAuth } from "../hooks/use-auth";
import { normalizeChannelUrl } from "../lib/channel-url";
import { m } from "../paraglide/messages.js";

type Props = {
  url: string;
  name?: string | null;
  thumbnailUrl?: string | null;
  compact?: boolean;
};

export function AllowChannelButton({ url, name, thumbnailUrl, compact = false }: Props) {
  const { authReady, isAuthed } = useAuth();
  const { canGlobalBlock } = useAuth();
  const { query, add } = useAllowedChannels();
  if (!authReady || !isAuthed || !canGlobalBlock) return null;
  const normalizedUrl = normalizeChannelUrl(url);
  const allowed = (query.data ?? []).some(
    (item) => normalizeChannelUrl(item.url) === normalizedUrl || item.name === name,
  );
  return (
    <button
      type="button"
      disabled={allowed || add.isPending}
      onClick={() => add.mutate({ url, name, thumbnailUrl, global: true })}
      className={
        compact
          ? "rounded-md border border-border px-3 py-1 text-xs text-fg-soft transition-colors hover:text-fg disabled:cursor-not-allowed disabled:opacity-60"
          : "rounded-md bg-surface-strong px-4 py-1.5 text-sm font-medium text-fg transition-colors hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-60"
      }
    >
      {allowed ? m.ui_allowed() : add.isPending ? m.ui_adding() : m.ui_allow_channel()}
    </button>
  );
}
