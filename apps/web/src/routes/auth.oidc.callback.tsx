import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AuthCard } from "../components/auth-card";
import { oidcCallbackSession } from "../lib/auth-session";
import { oidcCallbackUrl, safeReturnTo } from "../lib/oidc-redirect";
import { m } from "../paraglide/messages.js";

function OidcCallbackPage() {
  const { code, state, error: providerError } = Route.useSearch();
  const [failed, setFailed] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (providerError || !code || !state) {
      setFailed(true);
      return;
    }
    oidcCallbackSession({ code, state, redirectUri: oidcCallbackUrl() })
      .then((returnTo) => window.location.assign(safeReturnTo(returnTo)))
      .catch(() => setFailed(true));
  }, [code, state, providerError]);

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <AuthCard title={m.ui_signing_in()} subtitle={m.ui_completing_sign_in_with_your_provider()}>
        {failed ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-fg-muted">{m.ui_sign_in_could_not_be_completed()}</p>
            <a
              href="/login"
              className="h-10 rounded-lg bg-fg text-app text-sm font-medium flex items-center justify-center"
            >
              {m.ui_back_to_sign_in()}
            </a>
          </div>
        ) : (
          <p className="text-sm text-fg-soft">{m.ui_please_wait()}</p>
        )}
      </AuthCard>
    </div>
  );
}

export const Route = createFileRoute("/auth/oidc/callback")({
  validateSearch: (search: Record<string, unknown>) => ({
    code: typeof search.code === "string" ? search.code : undefined,
    state: typeof search.state === "string" ? search.state : undefined,
    error: typeof search.error === "string" ? search.error : undefined,
  }),
  component: OidcCallbackPage,
});
