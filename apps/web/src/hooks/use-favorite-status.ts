import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { addFavorite, fetchFavoriteStatus, removeFavorite } from "../lib/api-collections";
import { useAuth } from "./use-auth";

const FAVORITES_KEY = ["favorites"] as const;

export function useFavoriteStatus(videoUrl: string) {
  const { authReady, isAuthed } = useAuth();
  const queryClient = useQueryClient();
  const [intent, setIntent] = useState<boolean | null>(null);
  const queryKey = [...FAVORITES_KEY, videoUrl] as const;
  const query = useQuery({
    queryKey,
    queryFn: () => fetchFavoriteStatus(videoUrl),
    enabled: authReady && isAuthed,
  });
  const isFavorite = intent ?? query.data ?? false;

  async function add(): Promise<void> {
    if (isFavorite) return;
    setIntent(true);
    try {
      await addFavorite(videoUrl);
      queryClient.setQueryData<boolean>(queryKey, true);
      await queryClient.invalidateQueries({
        queryKey: FAVORITES_KEY,
        exact: true,
        refetchType: "none",
      });
    } catch (error) {
      setIntent(null);
      throw error;
    }
    setIntent(null);
  }

  async function remove(): Promise<void> {
    setIntent(false);
    try {
      await removeFavorite(videoUrl);
      queryClient.setQueryData<boolean>(queryKey, false);
      await queryClient.invalidateQueries({
        queryKey: FAVORITES_KEY,
        exact: true,
        refetchType: "none",
      });
    } catch (error) {
      setIntent(null);
      throw error;
    }
    setIntent(null);
  }

  return {
    isFavorite,
    add,
    remove,
    isPending: (authReady && isAuthed && query.isPending) || intent !== null,
  };
}
