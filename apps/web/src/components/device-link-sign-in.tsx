import { deviceLinkPath } from "../lib/device-link-code";
import { m } from "../paraglide/messages.js";

export function DeviceLinkSignIn({ code }: { code: string | null }) {
  const redirect = code ? deviceLinkPath(code) : "/link";
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-fg-muted">{m.device_link_sign_in_hint()}</p>
      <a
        href={`/login?redirect=${encodeURIComponent(redirect)}`}
        className="flex h-11 items-center justify-center rounded-lg bg-fg text-sm font-medium text-app"
      >
        {m.device_link_sign_in()}
      </a>
    </div>
  );
}
