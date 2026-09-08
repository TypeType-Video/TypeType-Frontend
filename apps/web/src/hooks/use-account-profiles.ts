import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAccountProfile,
  deleteAccountProfile,
  fetchAccountProfiles,
  renameAccountProfile,
  setDefaultAccountProfile,
} from "../lib/api-profiles";
import { switchProfileSession } from "../lib/auth-session";
import { useAuth } from "./use-auth";

const ACCOUNT_PROFILES_KEY = ["account-profiles"];

export function useAccountProfiles() {
  const queryClient = useQueryClient();
  const { authReady, isAuthed, isGuest, me } = useAuth();
  const enabled = authReady && isAuthed && !isGuest && me != null;
  const query = useQuery({
    queryKey: [...ACCOUNT_PROFILES_KEY, me?.id ?? null],
    queryFn: fetchAccountProfiles,
    enabled,
    staleTime: 15_000,
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ACCOUNT_PROFILES_KEY });
  const create = useMutation({ mutationFn: createAccountProfile, onSuccess: invalidate });
  const rename = useMutation({
    mutationFn: ({ profileId, name }: { profileId: string; name: string }) =>
      renameAccountProfile(profileId, name),
    onSuccess: invalidate,
  });
  const setDefault = useMutation({ mutationFn: setDefaultAccountProfile, onSuccess: invalidate });
  const remove = useMutation({ mutationFn: deleteAccountProfile, onSuccess: invalidate });
  const switchProfile = useMutation({
    mutationFn: switchProfileSession,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["notifications"] });
      queryClient.removeQueries({ queryKey: ["notifications-unread-count"] });
      invalidate();
    },
  });

  return { query, create, rename, setDefault, remove, switchProfile };
}
