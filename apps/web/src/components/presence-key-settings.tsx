import { useEffect, useState } from "react";
import {
  createPresenceKey,
  fetchPresenceKeys,
  type PresenceKey,
  revokePresenceKey,
} from "../lib/api-presence";
import { m } from "../paraglide/messages.js";

type Props = {
  enabled: boolean;
  onMessage: (message: string) => void;
};

export function PresenceKeySettings({ enabled, onMessage }: Props) {
  const [keys, setKeys] = useState<PresenceKey[]>([]);
  const [name, setName] = useState("");
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    fetchPresenceKeys()
      .then((loaded) => {
        if (active) setKeys(loaded);
      })
      .catch(() => onMessage(m.presence_load_failed()));
    return () => {
      active = false;
    };
  }, [enabled, onMessage]);

  if (!enabled) return null;

  const create = async () => {
    const keyName = name.trim();
    if (!keyName || pending) return;
    setPending(true);
    try {
      const created = await createPresenceKey(keyName);
      setKeys((current) => [...current, created.key]);
      setCreatedToken(created.token);
      setName("");
      onMessage(m.presence_created());
    } catch {
      onMessage(m.presence_create_failed());
    } finally {
      setPending(false);
    }
  };

  const revoke = async (id: string) => {
    try {
      await revokePresenceKey(id);
      setKeys((current) => current.filter((key) => key.id !== id));
    } catch {
      onMessage(m.presence_revoke_failed());
    }
  };

  return (
    <section data-interface-copy className="border-b border-border py-6 sm:py-8">
      <header className="mb-5">
        <h2 className="text-base font-semibold text-fg">{m.presence_title()}</h2>
        <p className="mt-1 text-sm text-fg-muted">{m.presence_description()}</p>
      </header>

      <div className="min-w-0 max-w-2xl">
        {createdToken && (
          <div className="mb-5 border border-border-strong p-3">
            <p className="text-xs font-medium text-fg">{m.presence_token_once()}</p>
            <p className="mt-2 break-all font-mono text-xs text-fg">{createdToken}</p>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(createdToken);
                onMessage(m.presence_copied());
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

        <ul className="mt-5 flex flex-col gap-2">
          {keys.map((key) => (
            <li
              key={key.id}
              className="flex min-w-0 flex-col gap-2 border-b border-border pb-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-fg">{key.name}</p>
                <p className="truncate text-xs text-fg-soft">{key.tokenPrefix}</p>
              </div>
              <button
                type="button"
                onClick={() => void revoke(key.id)}
                className="h-8 rounded-sm border border-border-strong px-3 text-xs text-fg transition-colors hover:border-danger-strong"
              >
                {m.presence_revoke()}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
