import { useCallback, useEffect, useRef, useState } from "react";
import {
  approveDeviceLink,
  type DeviceLinkRequest,
  denyDeviceLink,
  lookupDeviceLink,
} from "../lib/api-device-link";
import { type DeviceLinkProblem, deviceLinkProblem } from "../lib/device-link-errors";

export type DeviceLinkState =
  | { kind: "checking" }
  | { kind: "ready"; request: DeviceLinkRequest; working: boolean }
  | { kind: "approved" }
  | { kind: "denied" }
  | { kind: "problem"; problem: DeviceLinkProblem };

export function useDeviceLink(code: string | null, enabled: boolean) {
  const [state, setState] = useState<DeviceLinkState>({ kind: "checking" });
  const lookedUp = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (!code) {
      setState({ kind: "problem", problem: "not_found" });
      return;
    }
    if (lookedUp.current === code) return;
    lookedUp.current = code;
    setState({ kind: "checking" });
    lookupDeviceLink(code)
      .then((request) => setState({ kind: "ready", request, working: false }))
      .catch((error: unknown) => setState({ kind: "problem", problem: deviceLinkProblem(error) }));
  }, [code, enabled]);

  const decide = useCallback(
    async (approve: boolean) => {
      if (state.kind !== "ready" || state.working) return;
      setState({ ...state, working: true });
      try {
        if (approve) await approveDeviceLink(state.request.userCode);
        else await denyDeviceLink(state.request.userCode);
        setState({ kind: approve ? "approved" : "denied" });
      } catch (error) {
        setState({ kind: "problem", problem: deviceLinkProblem(error) });
      }
    },
    [state],
  );

  return { state, approve: () => decide(true), deny: () => decide(false) };
}
