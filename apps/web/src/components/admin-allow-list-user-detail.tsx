import {
  useAdminAllowListMutations,
  useAdminUserAllowList,
} from "../hooks/use-admin-granular-allow-list";
import { m } from "../paraglide/messages.js";
import type { AdminAllowListUser } from "../types/allow-list";
import { AdminAllowListChannelList } from "./admin-allow-list-channel-list";
import { AdminAllowListForm } from "./admin-allow-list-form";
import { AdminAllowListPlaylistList } from "./admin-allow-list-playlist-list";
import { AdminAllowListPlaylistSearch } from "./admin-allow-list-playlist-search";
import { AdminUserAvatar } from "./admin-user-avatar";

type Props = {
  user: AdminAllowListUser;
  instanceRestricted: boolean;
  onToast: (message: string) => void;
};

function accessState(user: AdminAllowListUser, instanceRestricted: boolean) {
  if (user.accessMode === "allow_list") {
    return {
      label: m.ui_user_specific_allow_list(),
      action: instanceRestricted ? m.ui_set_unrestricted_override() : m.ui_unrestrict_user(),
      nextMode: "unrestricted" as const,
      toast: instanceRestricted ? m.ui_unrestricted_override_set() : m.ui_user_unrestricted(),
      active: true,
    };
  }
  if (instanceRestricted && user.adminManagedAccessMode) {
    return {
      label: m.ui_admin_unrestricted_override(),
      action: m.ui_restrict_user(),
      nextMode: "allow_list" as const,
      toast: m.ui_user_restricted(),
      active: true,
    };
  }
  if (instanceRestricted) {
    return {
      label: m.ui_restricted_by_entire_instance(),
      action: m.ui_set_unrestricted_override(),
      nextMode: "unrestricted" as const,
      toast: m.ui_unrestricted_override_set(),
      active: false,
    };
  }
  return {
    label: m.admin_unrestricted_label(),
    action: m.ui_restrict_user(),
    nextMode: "allow_list" as const,
    toast: m.ui_user_restricted(),
    active: false,
  };
}

export function AdminAllowListUserDetail({ user, instanceRestricted, onToast }: Props) {
  const detail = useAdminUserAllowList(user.id);
  const mutations = useAdminAllowListMutations(user.id);
  const data = detail.data;
  const selected = data?.user
    ? {
        ...user,
        ...data.user,
        adminManagedAccessMode: data.user.adminManagedAccessMode ?? user.adminManagedAccessMode,
        avatarUrl: data.user.avatarUrl ?? user.avatarUrl,
        avatarType: data.user.avatarType ?? user.avatarType,
        avatarCode: data.user.avatarCode ?? user.avatarCode,
      }
    : user;
  const state = accessState(selected, instanceRestricted);

  function toggleMode() {
    mutations.userMode.mutate(
      { id: selected.id, accessMode: state.nextMode },
      {
        onSuccess: () => onToast(state.toast),
        onError: () => onToast(m.ui_unable_to_update_user()),
      },
    );
  }

  if (detail.isLoading || !data) {
    return (
      <section className="border-t border-border pt-4 text-sm text-fg-soft">
        {m.ui_loading_user_allow_list()}
      </section>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <section className="border-t border-border pt-4">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <AdminUserAvatar
              user={{
                ...selected,
                role: "user",
                publicUsername: null,
                bio: null,
                avatarUrl: selected.avatarUrl ?? null,
                avatarType: selected.avatarType ?? null,
                avatarCode: selected.avatarCode ?? null,
                suspended: false,
                verified: false,
                createdAt: 0,
              }}
              className="h-10 w-10"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-fg">
                {selected.name || selected.email}
              </p>
              <p className="truncate text-xs text-fg-soft">{selected.email}</p>
              <p className="truncate text-xs text-fg-muted">{state.label}</p>
            </div>
          </div>
          <button
            type="button"
            disabled={mutations.userMode.isPending}
            onClick={toggleMode}
            className={`h-8 border px-3 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              state.active ? "border-fg bg-fg text-app" : "border-border text-fg-soft hover:text-fg"
            }`}
          >
            {state.action}
          </button>
        </div>
      </section>

      <AdminAllowListChannelList
        title={m.ui_inherited_global_channels()}
        channels={data.globalChannels}
      />
      <AdminAllowListPlaylistList
        title={m.ui_inherited_global_playlists()}
        playlists={data.globalPlaylists}
      />

      <AdminAllowListForm
        title={m.ui_add_channel_for_this_user()}
        description={m.ui_search_by_channel_name_or_handle_this_does_not_affect_other_users()}
        trustedUrls={[...data.globalChannels, ...data.userChannels].map((item) => item.url)}
        pending={mutations.addUserChannel.isPending}
        onAdd={(channel) => mutations.addUserChannel.mutate({ id: selected.id, channel })}
      />
      <AdminAllowListChannelList
        title={m.ui_user_channels()}
        channels={data.userChannels}
        onRemove={(url) => mutations.removeUserChannel.mutate({ id: selected.id, url })}
      />

      <AdminAllowListPlaylistSearch
        title={m.ui_add_playlist_for_this_user()}
        description={m.ui_search_playlists_by_name_this_does_not_affect_other_users()}
        addedUrls={[...data.globalPlaylists, ...data.userPlaylists].map((item) => item.url)}
        pending={mutations.addUserPlaylist.isPending}
        onAdd={(playlist) => mutations.addUserPlaylist.mutate({ id: selected.id, playlist })}
      />
      <AdminAllowListPlaylistList
        title={m.ui_user_playlists()}
        playlists={data.userPlaylists}
        onRemove={(url) => mutations.removeUserPlaylist.mutate({ id: selected.id, url })}
      />
    </div>
  );
}
