import { Check, Loader2, Pencil, Plus, Save, Star, Trash2, X } from "lucide-react";
import { type FormEvent, type ReactNode, useState } from "react";
import { useAccountProfiles } from "../hooks/use-account-profiles";
import { m } from "../paraglide/messages.js";
import type { AccountProfile } from "../types/auth";
import { ProfileAvatar } from "./profile-avatar";

type Props = { onClose: () => void };

export function NavbarProfileSwitcher({ onClose }: Props) {
  const { query, create, rename, setDefault, remove, switchProfile } = useAccountProfiles();
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState(false);
  const profiles = query.data?.profiles ?? [];
  const busy =
    create.isPending ||
    rename.isPending ||
    setDefault.isPending ||
    remove.isPending ||
    switchProfile.isPending;

  async function createProfile(event: FormEvent) {
    event.preventDefault();
    const name = newName.trim();
    if (!name || busy) return;
    setError(false);
    try {
      await create.mutateAsync(name);
      setNewName("");
    } catch {
      setError(true);
    }
  }

  async function saveRename(profileId: string) {
    const name = editing?.name.trim() ?? "";
    if (!name || busy) return;
    setError(false);
    try {
      await rename.mutateAsync({ profileId, name });
      setEditing(null);
    } catch {
      setError(true);
    }
  }

  async function switchTo(profile: AccountProfile) {
    if (profile.isActive || busy) return;
    setError(false);
    try {
      await switchProfile.mutateAsync(profile.id);
      onClose();
    } catch {
      setError(true);
    }
  }

  async function makeDefault(profileId: string) {
    if (busy) return;
    setError(false);
    try {
      await setDefault.mutateAsync(profileId);
    } catch {
      setError(true);
    }
  }

  async function deleteProfile(profile: AccountProfile) {
    if (busy || profile.isActive || !globalThis.confirm(m.profile_delete_confirm())) return;
    setError(false);
    try {
      await remove.mutateAsync(profile.id);
    } catch {
      setError(true);
    }
  }

  return (
    <section className="border-b border-border px-3 py-3" aria-label={m.profile_switcher()}>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
          {m.profile_switcher()}
        </p>
        {query.isFetching && (
          <Loader2 size={14} className="animate-spin text-fg-soft" aria-label={m.ui_loading()} />
        )}
      </div>
      <div className="space-y-1">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className="flex items-center gap-1 rounded-md hover:bg-surface-strong"
          >
            {editing?.id === profile.id ? (
              <input
                value={editing.name}
                onChange={(event) => setEditing({ id: profile.id, name: event.target.value })}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void saveRename(profile.id);
                  if (event.key === "Escape") setEditing(null);
                }}
                className="min-w-0 flex-1 rounded border border-border-strong bg-surface px-2 py-1.5 text-sm text-fg outline-none focus:ring-2 focus:ring-border-strong"
                maxLength={40}
                aria-label={m.profile_name_label()}
              />
            ) : (
              <button
                type="button"
                onClick={() => void switchTo(profile)}
                disabled={busy}
                className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 py-1.5 text-left text-sm text-fg disabled:cursor-wait"
                aria-current={profile.isActive ? "page" : undefined}
              >
                <ProfileAvatar me={profile} className="h-6 w-6 shrink-0" plain />
                <span className="min-w-0 flex-1 truncate">{profile.name}</span>
                {profile.isActive && (
                  <Check
                    size={15}
                    className="shrink-0 text-success"
                    aria-label={m.profile_active()}
                  />
                )}
              </button>
            )}
            {editing?.id === profile.id ? (
              <>
                <IconButton
                  label={m.profile_save_name()}
                  onClick={() => void saveRename(profile.id)}
                >
                  <Save size={14} />
                </IconButton>
                <IconButton label={m.ui_cancel()} onClick={() => setEditing(null)}>
                  <X size={14} />
                </IconButton>
              </>
            ) : (
              <>
                <IconButton
                  label={m.profile_set_default()}
                  onClick={() => void makeDefault(profile.id)}
                  active={profile.isDefault}
                >
                  <Star size={14} fill={profile.isDefault ? "currentColor" : "none"} />
                </IconButton>
                <IconButton
                  label={m.profile_rename()}
                  onClick={() => setEditing({ id: profile.id, name: profile.name })}
                >
                  <Pencil size={14} />
                </IconButton>
                {!profile.isActive && (
                  <IconButton
                    label={m.profile_delete()}
                    onClick={() => void deleteProfile(profile)}
                  >
                    <Trash2 size={14} />
                  </IconButton>
                )}
              </>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={createProfile} className="mt-2 flex items-center gap-1">
        <input
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          className="min-w-0 flex-1 rounded border border-border bg-surface px-2 py-1.5 text-xs text-fg outline-none focus:border-border-strong"
          placeholder={m.profile_name_placeholder()}
          maxLength={40}
          aria-label={m.profile_name_label()}
        />
        <IconButton type="submit" label={m.profile_add()} disabled={!newName.trim() || busy}>
          <Plus size={15} />
        </IconButton>
      </form>
      {error && <p className="mt-2 text-xs text-danger">{m.profile_action_failed()}</p>}
    </section>
  );
}

function IconButton({
  label,
  active = false,
  disabled = false,
  type = "button",
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded text-fg-soft hover:bg-surface hover:text-fg disabled:cursor-not-allowed disabled:opacity-50 ${active ? "text-warning" : ""}`}
    >
      {children}
    </button>
  );
}
