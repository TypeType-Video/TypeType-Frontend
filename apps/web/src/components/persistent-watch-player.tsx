import { lazy, Suspense } from "react";
import { usePersistentWatchPlayerStore } from "../hooks/use-persistent-watch-player";

const PersistentWatchPlayerHost = lazy(() =>
  import("./persistent-watch-player-host").then((module) => ({
    default: module.PersistentWatchPlayerHost,
  })),
);

export function PersistentWatchPlayer() {
  const hasEntry = usePersistentWatchPlayerStore((state) => state.entry !== null);

  if (!hasEntry) return null;

  return (
    <Suspense fallback={null}>
      <PersistentWatchPlayerHost />
    </Suspense>
  );
}
