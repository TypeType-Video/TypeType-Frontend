import { createFileRoute } from "@tanstack/react-router";
import { AuthCard } from "../components/auth-card";
import { DeviceLinkCodeForm } from "../components/device-link-code-form";
import { DeviceLinkConfirm } from "../components/device-link-confirm";
import { DeviceLinkOutcome } from "../components/device-link-outcome";
import { DeviceLinkSignIn } from "../components/device-link-sign-in";
import { useAuth } from "../hooks/use-auth";
import { useDeviceLink } from "../hooks/use-device-link";
import { normalizeDeviceCode } from "../lib/device-link-code";
import { m } from "../paraglide/messages.js";

function DeviceLinkBody({ code }: { code: string | undefined }) {
  const { authReady, isAuthed, isGuest, publicUsername } = useAuth();
  const signedIn = authReady && isAuthed && !isGuest;
  const normalized = code ? normalizeDeviceCode(code) : null;
  const link = useDeviceLink(normalized, signedIn && code !== undefined);

  if (!authReady) return <p className="text-sm text-fg-muted">{m.device_link_checking()}</p>;
  if (!signedIn) return <DeviceLinkSignIn code={normalized} />;
  if (code === undefined) return <DeviceLinkCodeForm />;
  const { state } = link;
  switch (state.kind) {
    case "checking":
      return (
        <p className="text-sm text-fg-muted" role="status">
          {m.device_link_checking()}
        </p>
      );
    case "ready":
      return (
        <DeviceLinkConfirm
          request={state.request}
          account={publicUsername}
          working={state.working}
          onApprove={link.approve}
          onDeny={link.deny}
        />
      );
    case "approved":
    case "denied":
      return <DeviceLinkOutcome outcome={state.kind} />;
    case "problem":
      return <DeviceLinkOutcome outcome="problem" problem={state.problem} />;
  }
}

function DeviceLinkPage() {
  const { code } = Route.useSearch();
  return (
    <div className="flex w-full items-center justify-center px-4 py-8">
      <AuthCard title={m.device_link_title()} subtitle={m.device_link_subtitle()}>
        <DeviceLinkBody code={code} />
      </AuthCard>
    </div>
  );
}

export const Route = createFileRoute("/link")({
  validateSearch: (search: Record<string, unknown>) => ({
    code: typeof search.code === "string" ? search.code : undefined,
  }),
  component: DeviceLinkPage,
});
