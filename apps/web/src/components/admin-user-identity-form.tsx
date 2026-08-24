import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { updateAdminIdentity } from "../lib/api-account-identity";
import type { AuthUser } from "../types/auth";

type Props = {
  user: AuthUser;
  disabled: boolean;
  onMessage: (message: string) => void;
};

export function AdminUserIdentityForm({ user, disabled, onMessage }: Props) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState(user.email);
  const [name, setName] = useState(user.name);
  const update = useMutation({
    mutationFn: () => updateAdminIdentity(user.id, { email: email.trim(), name: name.trim() }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  useEffect(() => {
    setEmail(user.email);
    setName(user.name);
  }, [user]);

  const dirty =
    email.trim().toLowerCase() !== user.email.toLowerCase() || name.trim() !== user.name;
  return (
    <div className="mt-5 flex flex-col gap-4 border-t border-border pt-5">
      <label className="text-xs font-medium text-fg-muted">
        Display name
        <input
          value={name}
          aria-label="Display name"
          onChange={(event) => setName(event.target.value)}
          className="mt-1.5 h-10 w-full rounded-md border border-border-strong bg-app px-3 text-sm text-fg outline-none transition-colors focus:border-accent"
        />
      </label>
      <label className="text-xs font-medium text-fg-muted">
        Email
        <input
          type="email"
          value={email}
          aria-label="Email address"
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1.5 h-10 w-full rounded-md border border-border-strong bg-app px-3 text-sm text-fg outline-none transition-colors focus:border-accent"
        />
      </label>
      <button
        type="button"
        disabled={disabled || update.isPending || !dirty}
        onClick={() =>
          update.mutate(undefined, {
            onSuccess: () => onMessage("User identity updated"),
            onError: (error) => onMessage(error instanceof Error ? error.message : "Update failed"),
          })
        }
        className="h-10 rounded-md bg-accent text-xs font-medium text-white transition-colors hover:brightness-95 disabled:opacity-50"
      >
        Save identity
      </button>
    </div>
  );
}
