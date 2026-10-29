import { ShieldAlert, Tv } from "lucide-react";
import type { DeviceLinkRequest } from "../lib/api-device-link";
import { spellDeviceCode } from "../lib/device-link-code";
import { m } from "../paraglide/messages.js";

type Props = {
  request: DeviceLinkRequest;
  account: string | null;
  working: boolean;
  onApprove: () => void;
  onDeny: () => void;
};

export function DeviceLinkConfirm({ request, account, working, onApprove, onDeny }: Props) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-fg/10 text-fg">
          <Tv className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="text-sm text-fg">
          {m.device_link_request({
            device: request.deviceName,
            account: account ?? m.device_link_this_account(),
          })}
        </p>
      </div>
      <p className="rounded-xl border border-border bg-app py-4 text-center font-mono text-3xl font-semibold tracking-[0.25em] text-fg">
        <span aria-hidden="true">{request.userCode}</span>
        <span className="sr-only">{spellDeviceCode(request.userCode)}</span>
      </p>
      <p className="flex gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-fg">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
        {m.device_link_warning()}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <button
          type="button"
          onClick={onApprove}
          disabled={working}
          className="h-11 rounded-lg sm:flex-1 bg-fg text-sm font-medium text-app disabled:opacity-60"
        >
          {m.device_link_confirm()}
        </button>
        <button
          type="button"
          onClick={onDeny}
          disabled={working}
          className="h-11 rounded-lg sm:flex-1 border border-border-strong text-sm font-medium text-fg disabled:opacity-60"
        >
          {m.device_link_refuse()}
        </button>
      </div>
    </div>
  );
}
