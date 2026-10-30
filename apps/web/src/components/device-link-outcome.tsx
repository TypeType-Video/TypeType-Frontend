import { Link } from "@tanstack/react-router";
import { CircleCheck, CircleX, TriangleAlert } from "lucide-react";
import type { DeviceLinkProblem } from "../lib/device-link-errors";
import { m } from "../paraglide/messages.js";

type Props =
  | { outcome: "approved" }
  | { outcome: "denied" }
  | { outcome: "problem"; problem: DeviceLinkProblem };

const PROBLEM_MESSAGES: Record<DeviceLinkProblem, () => string> = {
  not_found: m.device_link_not_found,
  locked: m.device_link_locked,
  disabled: m.device_link_disabled,
  already_used: m.device_link_already_used,
  failed: m.device_link_error,
};

export function DeviceLinkOutcome(props: Props) {
  if (props.outcome === "approved") {
    return (
      <div className="flex flex-col items-center gap-3 py-2 text-center" role="status">
        <CircleCheck className="h-12 w-12 text-green-500" aria-hidden="true" />
        <p className="text-lg font-semibold text-fg">{m.device_link_connected_title()}</p>
        <p className="text-sm text-fg-muted">{m.device_link_connected()}</p>
      </div>
    );
  }
  if (props.outcome === "denied") {
    return (
      <div className="flex flex-col items-center gap-3 py-2 text-center" role="status">
        <CircleX className="h-12 w-12 text-fg-muted" aria-hidden="true" />
        <p className="text-lg font-semibold text-fg">{m.device_link_refused_title()}</p>
        <p className="text-sm text-fg-muted">{m.device_link_refused()}</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-3 py-2 text-center" role="alert">
      <TriangleAlert className="h-12 w-12 text-amber-500" aria-hidden="true" />
      <p className="text-sm text-fg-muted">{PROBLEM_MESSAGES[props.problem]()}</p>
      {props.problem !== "disabled" && (
        <Link
          to="/link"
          search={{ code: undefined }}
          className="text-sm text-fg-muted underline underline-offset-2 hover:text-fg"
        >
          {m.device_link_try_another()}
        </Link>
      )}
    </div>
  );
}
