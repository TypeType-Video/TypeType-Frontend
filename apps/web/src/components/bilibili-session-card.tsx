import { useState } from "react";
import type { useBiliBiliSession } from "../hooks/use-bilibili-session";
import { m } from "../paraglide/messages.js";

type SessionHook = ReturnType<typeof useBiliBiliSession>;

export function BiliBiliSessionCard({ session }: { session: SessionHook }) {
  const [showQr, setShowQr] = useState(false);
  const status = session.status.data;
  const isConnected = status?.status === "connected";
  const isReconnect = status?.status === "needs_reconnect";
  const expiresAt = status?.expiresAt ?? 0;
  const daysLeft = expiresAt > 0 ? Math.ceil((expiresAt - Date.now()) / 86400000) : 0;

  const handleConnect = () => {
    setShowQr(true);
    session.startQr();
  };
  const handleDisconnect = () => {
    session.disconnect.mutate();
    setShowQr(false);
  };
  const handleCloseQr = () => {
    session.cancelQr();
    setShowQr(false);
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">BiliBili</p>
          {isConnected && daysLeft > 7 && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              {m.ui_bilibili_session_connected()} · {daysLeft}d
            </p>
          )}
          {isConnected && daysLeft > 0 && daysLeft <= 7 && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              {m.ui_bilibili_session_connected()} · {daysLeft}d ·{" "}
              <a href="/bilibili-session" className="underline">
                {m.ui_bilibili_session_reconnect()}
              </a>
            </p>
          )}
          {isReconnect && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              {m.ui_bilibili_session_needs_reconnect()}
            </p>
          )}
          {!isConnected && !isReconnect && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {m.ui_bilibili_session_not_connected()}
            </p>
          )}
        </div>
        {isConnected ? (
          <button
            type="button"
            onClick={handleDisconnect}
            disabled={session.disconnect.isPending}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950"
          >
            {m.ui_bilibili_session_disconnect()}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleConnect}
            disabled={session.qrPhase === "generating"}
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {session.qrPhase === "generating"
              ? m.ui_bilibili_session_loading()
              : isReconnect
                ? m.ui_bilibili_session_reconnect()
                : m.ui_bilibili_session_connect()}
          </button>
        )}
      </div>
      {showQr && (
        <div className="mt-4 rounded-md border border-zinc-200 bg-zinc-50 p-4 text-center dark:border-zinc-600 dark:bg-zinc-800">
          {session.qrPhase === "waiting" && session.qrUrl && (
            <>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(session.qrUrl)}`}
                alt=""
                width={200}
                height={200}
                className="mx-auto rounded-md bg-white p-2"
              />
              <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
                {m.ui_bilibili_session_scan_qr()}
              </p>
              {session.qrPhase === "scanned" && (
                <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {m.ui_bilibili_session_scanned()}
                </p>
              )}
              <button
                type="button"
                onClick={handleCloseQr}
                className="mt-3 text-xs text-zinc-500 hover:underline dark:text-zinc-400"
              >
                {m.ui_bilibili_session_cancel()}
              </button>
            </>
          )}
          {session.qrPhase === "confirmed" && (
            <p className="py-8 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              {m.ui_bilibili_session_connected_toast()}
            </p>
          )}
          {session.qrPhase === "expired" && (
            <>
              <p className="py-4 text-sm text-amber-600 dark:text-amber-400">
                {m.ui_bilibili_session_qr_expired()}
              </p>
              <button
                type="button"
                onClick={session.startQr}
                className="text-sm font-medium text-zinc-900 underline dark:text-zinc-100"
              >
                {m.ui_bilibili_session_try_again()}
              </button>
            </>
          )}
          {session.qrPhase === "error" && (
            <>
              <p className="py-4 text-sm text-red-600 dark:text-red-400">{session.qrError}</p>
              <button
                type="button"
                onClick={session.startQr}
                className="text-sm font-medium text-zinc-900 underline dark:text-zinc-100"
              >
                {m.ui_bilibili_session_retry()}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
