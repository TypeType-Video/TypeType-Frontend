import { useEffect, useState } from "react";
import { Toast } from "../components/toast";
import { useAuth } from "../hooks/use-auth";
import {
  createPresenceKey,
  fetchPresenceKeys,
  type PresenceKey,
  revokePresenceKey,
} from "../lib/api-presence";
import { m } from "../paraglide/messages.js";

const SECTION_LABEL = "text-xs font-medium text-fg-soft uppercase tracking-wider px-1";
const GROUP = "divide-y divide-border border-y border-border";

export function SettingsApi() {
  const { authReady, isAuthed, isGuest } = useAuth();
  const enabled = authReady && isAuthed && !isGuest;
  const [keys, setKeys] = useState<PresenceKey[]>([]);
  const [name, setName] = useState("");
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    fetchPresenceKeys()
      .then((loaded) => {
        if (active) setKeys(loaded);
      })
      .catch(() => setToast(m.presence_load_failed()));
    return () => {
      active = false;
    };
  }, [enabled]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!authReady) {
    return (
      <div className="border-y border-border py-5 text-sm text-fg-muted">{m.ui_loading()}</div>
    );
  }

  if (!enabled) {
    return (
      <div className="border-y border-border py-5 text-sm text-fg-muted">
        {m.api_sign_in_required()}
      </div>
    );
  }

  const create = async () => {
    const keyName = name.trim();
    if (!keyName || pending) return;
    setPending(true);
    try {
      const created = await createPresenceKey(keyName);
      setKeys((current) => [...current, created.key]);
      setCreatedToken(created.token);
      setName("");
      setToast(m.presence_created());
    } catch {
      setToast(m.presence_create_failed());
    } finally {
      setPending(false);
    }
  };

  const revoke = async (id: string) => {
    try {
      await revokePresenceKey(id);
      setKeys((current) => current.filter((key) => key.id !== id));
    } catch {
      setToast(m.presence_revoke_failed());
    }
  };

  return (
    <section data-interface-copy className="flex flex-col gap-3">
      <p className={SECTION_LABEL}>{m.presence_title()}</p>
      {createdToken && (
        <div className="border border-border-strong p-3">
          <p className="text-xs font-medium text-fg">{m.presence_token_once()}</p>
          <p className="mt-2 break-all font-mono text-xs text-fg">{createdToken}</p>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(createdToken);
              setToast(m.presence_copied());
            }}
            className="mt-3 h-8 rounded-sm border border-border-strong px-3 text-xs text-fg transition-colors hover:border-fg-soft"
          >
            {m.presence_copy()}
          </button>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <label className="flex flex-col gap-1.5 text-xs text-fg-muted">
          {m.presence_name_label()}
          <input
            value={name}
            maxLength={50}
            onChange={(event) => setName(event.target.value)}
            placeholder={m.presence_name_placeholder()}
            className="h-10 min-w-0 w-full rounded-sm border border-border-strong bg-app px-3 text-sm text-fg"
          />
        </label>
        <button
          type="button"
          disabled={!name.trim() || pending}
          onClick={() => void create()}
          className="h-10 rounded-sm border border-transparent bg-fg px-4 text-xs font-medium text-app disabled:border-border disabled:bg-transparent disabled:text-fg-soft"
        >
          {m.presence_create()}
        </button>
      </div>
      <div className={GROUP}>
        {keys.length === 0 ? (
          <div className="py-4 text-sm text-fg-muted">{m.presence_empty()}</div>
        ) : (
          keys.map((key) => (
            <div
              key={key.id}
              className="flex min-w-0 items-center justify-between gap-4 px-1 py-3.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-fg">{key.name}</p>
                <p className="truncate text-xs text-fg-soft">{key.tokenPrefix}</p>
              </div>
              <button
                type="button"
                onClick={() => void revoke(key.id)}
                className="typetype-adaptive-control ml-0 shrink-0 text-xs text-danger transition-colors hover:text-danger-strong"
              >
                {m.presence_revoke()}
              </button>
            </div>
          ))
        )}
      </div>
      <Toast message={toast} />
    </section>
  );
}
