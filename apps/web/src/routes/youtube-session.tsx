import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SessionPlatformNav } from "../components/session-platform-nav";
import { Toast } from "../components/toast";
import { YoutubeDeviceLoginPanel } from "../components/youtube-device-login-panel";
import { YoutubeSessionStatusPanel } from "../components/youtube-session-status-panel";
import { useAuth } from "../hooks/use-auth";
import { useYoutubeSession } from "../hooks/use-youtube-session";
import { sanitizeYoutubeSessionReturnTo } from "../lib/youtube-session-route";
import { m } from "../paraglide/messages.js";

const SIDE_LABEL = "font-mono text-fg-soft text-[11px] uppercase tracking-[0.22em]";

function YoutubeSessionPage() {
  const { authReady, isAuthed } = useAuth();
  const session = useYoutubeSession();
  const [toast, setToast] = useState<string | null>(null);
  const state = session.status.data;
  const canDisconnect =
    authReady && isAuthed && state?.status !== "disconnected" && !session.disconnect.isPending;
  const connected = state?.status === "connected";

  const refetchStatus = session.status.refetch;

  function disconnect() {
    session.disconnect.mutate(undefined, {
      onSuccess: () => setToast(m.ui_youtube_session_disconnected()),
      onError: () => setToast(m.ui_could_not_disconnect_youtube_session()),
    });
  }

  return (
    <div className="flex w-full max-w-none flex-col gap-8 pt-2">
      <div className="flex flex-wrap items-center justify-between gap-4 px-1">
        <Link to="/" className="w-fit text-fg-soft text-xs transition-colors hover:text-fg">
          {m.ui_back_home()}
        </Link>
        <SessionPlatformNav active="youtube" />
      </div>

      <section className="grid min-h-[28rem] gap-10 border-border border-y py-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="flex min-w-0 flex-col justify-center gap-8">
          <p className={SIDE_LABEL}>{m.ui_connect_with_youtube()}</p>

          <div className="flex flex-col gap-3">
            <h1 className="max-w-4xl font-semibold text-3xl text-fg tracking-tight sm:text-5xl sm:leading-tight">
              {m.ui_connect_youtube_inside_typetype()}
            </h1>
          </div>

          <YoutubeDeviceLoginPanel
            connected={connected}
            pending={session.startDevice.isPending}
            onStart={session.startDevice.mutateAsync}
            onCancel={() => session.cancelDevice.mutate()}
            onConnected={() => void refetchStatus()}
          />
        </div>

        <YoutubeSessionStatusPanel
          state={state}
          loading={session.status.isPending}
          canDisconnect={canDisconnect}
          onDisconnect={disconnect}
        />
      </section>

      <Toast message={toast} />
    </div>
  );
}

export const Route = createFileRoute("/youtube-session")({
  validateSearch: (search: Record<string, unknown>) => ({
    returnTo: sanitizeYoutubeSessionReturnTo(search.returnTo),
  }),
  component: YoutubeSessionPage,
});
