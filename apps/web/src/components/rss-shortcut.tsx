import { Link } from "@tanstack/react-router";
import { Rss } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { useInstance } from "../hooks/use-instance";
import { m } from "../paraglide/messages.js";

type Props = {
  channelUrl?: string;
};

export function RssShortcut({ channelUrl }: Props) {
  const { isAuthed, isGuest } = useAuth();
  const instance = useInstance();
  if (!isAuthed || isGuest || instance.data?.rss.enabled !== true) return null;

  return (
    <Link
      to="/settings"
      search={{ section: "rss", ...(channelUrl ? { rssChannel: channelUrl } : {}), compose: true }}
      aria-label={
        channelUrl ? m.ui_create_rss_feed_for_this_channel() : m.ui_create_subscription_rss_feed()
      }
      title={
        channelUrl ? m.ui_create_rss_feed_for_this_channel() : m.ui_create_subscription_rss_feed()
      }
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-fg-soft transition-colors hover:bg-surface-strong hover:text-fg"
    >
      <Rss size={15} />
    </Link>
  );
}
