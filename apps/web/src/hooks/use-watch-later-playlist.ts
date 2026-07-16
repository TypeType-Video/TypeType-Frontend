import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { addWatchLater, fetchWatchLater, removeWatchLater } from "../lib/api-collections";
import type { WatchLaterPayload } from "../lib/watch-later-mappers";
import { useAuth } from "./use-auth";

const KEY = ["watch-later"];

type Intent = { url: string; adding: boolean };

export function useWatchLaterPlaylist() {
  const { authReady, isAuthed } = useAuth();
  const intentRef = useRef<Intent | null>(null);
  const [intent, setIntent] = useState<Intent | null>(null);
  const query = useQuery({
    queryKey: KEY,
    queryFn: fetchWatchLater,
    enabled: authReady && isAuthed,
  });

  function isInWatchLater(videoUrl: string): boolean {
    if (intentRef.current?.url === videoUrl) return intentRef.current.adding;
    return query.data?.some((item) => item.url === videoUrl) ?? false;
  }

  function applyIntent(value: Intent | null) {
    intentRef.current = value;
    setIntent(value);
  }

  async function add(payload: WatchLaterPayload): Promise<void> {
    if (isInWatchLater(payload.url)) return;
    applyIntent({ url: payload.url, adding: true });
    try {
      await addWatchLater(payload);
      await query.refetch();
    } catch (e) {
      applyIntent(null);
      throw e;
    }
    applyIntent(null);
  }

  async function remove(videoUrl: string): Promise<void> {
    applyIntent({ url: videoUrl, adding: false });
    try {
      await removeWatchLater(videoUrl);
      await query.refetch();
    } catch (e) {
      applyIntent(null);
      throw e;
    }
    applyIntent(null);
  }

  async function toggle(payload: WatchLaterPayload): Promise<boolean> {
    if (isInWatchLater(payload.url)) {
      await remove(payload.url);
      return false;
    }
    await add(payload);
    return true;
  }

  return {
    isInWatchLater,
    add,
    remove,
    toggle,
    isPending: query.isLoading || intent !== null,
  };
}
