import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/use-auth";
import { fetchBiliBiliSessionStatus } from "../lib/api-bilibili-session";
import { m } from "../paraglide/messages.js";

export function BiliBiliSessionBanner({ sourceUrl }: { sourceUrl: string }) {
  const { authReady, isAuthed } = useAuth();
  const isBiliBili = sourceUrl.includes("bilibili.com") || sourceUrl.includes("b23.tv");
  const shouldQuery = authReady && isAuthed && isBiliBili;
  const { data: status } = useQuery({
    queryKey: ["bilibili-session"],
    queryFn: fetchBiliBiliSessionStatus,
    enabled: shouldQuery,
    staleTime: 5 * 60 * 1000,
  });
  if (!shouldQuery || !status || status.status === "connected") return null;
  return (
    <div className="mb-3 flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      <span>{m.ui_bilibili_session_not_connected()}</span>
      <a href="/bilibili-session" className="font-medium underline">
        {m.ui_bilibili_session_connect()}
      </a>
    </div>
  );
}
