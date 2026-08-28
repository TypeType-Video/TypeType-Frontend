import { useState } from "react";
import { useInterfaceLocale } from "../hooks/use-interface-locale";
import { startOidc } from "../lib/api-oidc";
import { oidcCallbackUrl } from "../lib/oidc-redirect";
import { m } from "../paraglide/messages.js";
import { ProviderBrandIcon } from "./provider-brand-icon";

type Props = {
  providerName: string | null;
  returnTo?: string;
};

export function OidcSignInButton({ providerName, returnTo }: Props) {
  const { locale } = useInterfaceLocale();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function start() {
    setPending(true);
    setFailed(false);
    try {
      const { authorizationUrl } = await startOidc(oidcCallbackUrl(), returnTo);
      window.location.assign(authorizationUrl);
    } catch {
      setFailed(true);
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={start}
        disabled={pending}
        className="flex h-10 items-center justify-center gap-2 rounded-lg border border-border-strong bg-surface-strong text-sm font-medium text-fg transition-colors hover:bg-surface-soft disabled:opacity-60"
      >
        {pending ? (
          m.login_oidc_redirecting({}, { locale })
        ) : (
          <>
            <ProviderBrandIcon providerName={providerName} />
            <span>
              {m.login_oidc_continue({}, { locale })} {providerName ?? "SSO"}
            </span>
          </>
        )}
      </button>
      {failed && <p className="text-xs text-danger">{m.login_oidc_failed({}, { locale })}</p>}
    </div>
  );
}
