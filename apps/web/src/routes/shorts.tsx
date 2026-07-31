import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { ShortsPlayerShell } from "../components/shorts-player-shell";
import { useSettings } from "../hooks/use-settings";
import { goto } from "../lib/route-redirect";
import { resolveShortsRouteTarget } from "../lib/shorts-route";

function ShortsPage() {
  const { v } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { settings } = useSettings();
  const publicParam = resolveShortsRouteTarget(v)?.publicParam;

  useEffect(() => {
    if (!publicParam || publicParam === v) return;
    void navigate({ search: { v: publicParam }, replace: true });
  }, [navigate, publicParam, v]);

  if (settings.hideShorts) {
    return (
      <div className="flex min-h-[45vh] items-center justify-center px-4">
        <div className="flex max-w-sm flex-col items-center gap-3 px-5 py-6 text-center">
          <h1 className="text-base font-semibold text-fg">Shorts are hidden</h1>
          <p className="text-sm text-fg-soft">You can re-enable Shorts from video preferences.</p>
          <button
            type="button"
            onClick={() => goto("/settings")}
            className="mt-1 h-9 rounded-lg bg-fg px-4 text-sm font-medium text-app transition-opacity hover:opacity-90"
          >
            Open settings
          </button>
        </div>
      </div>
    );
  }
  return <ShortsPlayerShell targetUrl={v} />;
}

export const Route = createFileRoute("/shorts")({
  validateSearch: (search: Record<string, unknown>) => ({
    v: typeof search.v === "string" ? search.v.trim() : undefined,
  }),
  component: ShortsPage,
});
