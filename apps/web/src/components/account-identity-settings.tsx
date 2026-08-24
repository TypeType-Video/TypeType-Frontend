import { useEffect, useState } from "react";
import { useAccountIdentity } from "../hooks/use-account-identity";
import { m } from "../paraglide/messages.js";

type Props = {
  enabled: boolean;
  onMessage: (message: string) => void;
};

export function AccountIdentitySettings({ enabled, onMessage }: Props) {
  const { query, update } = useAccountIdentity(enabled);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!query.data) return;
    setEmail(query.data.email);
    setName(query.data.name);
  }, [query.data]);

  if (!enabled || query.isPending) return null;
  const managed = query.data?.managedByOidc ?? false;
  const dirty =
    email.trim().toLowerCase() !== query.data?.email || name.trim() !== query.data?.name;

  return (
    <section data-interface-copy className="border-b border-border py-6 sm:py-8">
      <header className="mb-5">
        <h2 className="text-base font-semibold text-fg">{m.account_identity_title()}</h2>
        <p className="mt-1 text-sm text-fg-muted">
          {managed ? m.account_identity_managed() : m.account_identity_description()}
        </p>
      </header>
      <div className="grid min-w-0 max-w-2xl gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-xs text-fg-muted">
          {m.account_display_name()}
          <input
            value={name}
            disabled={managed}
            onChange={(event) => setName(event.target.value)}
            className="h-10 min-w-0 w-full rounded-sm border border-border-strong bg-app px-3 text-sm text-fg disabled:opacity-60"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-xs text-fg-muted">
          {m.account_email()}
          <input
            type="email"
            value={email}
            disabled={managed}
            onChange={(event) => setEmail(event.target.value)}
            className="h-10 min-w-0 w-full rounded-sm border border-border-strong bg-app px-3 text-sm text-fg disabled:opacity-60"
          />
        </label>
      </div>
      {!managed && (
        <div className="mt-4 grid min-w-0 max-w-2xl gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <label className="flex flex-1 flex-col gap-1.5 text-xs text-fg-muted">
            {m.account_current_password()}
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-10 min-w-0 w-full rounded-sm border border-border-strong bg-app px-3 text-sm text-fg"
            />
          </label>
          <button
            type="button"
            disabled={!dirty || password.length === 0 || update.isPending}
            onClick={() =>
              update.mutate(
                { email: email.trim(), name: name.trim(), currentPassword: password },
                {
                  onSuccess: () => {
                    setPassword("");
                    onMessage(m.account_saved());
                  },
                  onError: (error) =>
                    onMessage(error instanceof Error ? error.message : m.account_update_failed()),
                },
              )
            }
            className="h-10 w-full rounded-sm border border-transparent bg-fg px-4 text-xs font-medium text-app disabled:border-border disabled:bg-transparent disabled:text-fg-soft sm:w-auto"
          >
            {m.account_save()}
          </button>
        </div>
      )}
    </section>
  );
}
