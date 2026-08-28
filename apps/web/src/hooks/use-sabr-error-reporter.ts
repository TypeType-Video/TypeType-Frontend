import { type RefObject, useCallback } from "react";
import { recordClientEvent } from "../lib/client-debug-log";
import { useLatestValue } from "./use-latest-value";

export function useSabrErrorReporter(
  errorReportedRef: RefObject<boolean>,
  onError: (recoveryPositionMs?: number) => void,
) {
  const latestOnError = useLatestValue(onError);
  return useCallback(
    (error: unknown, recoveryPositionMs?: number) => {
      if (errorReportedRef.current) return;
      errorReportedRef.current = true;
      const message = error instanceof Error ? error.message : String(error);
      recordClientEvent("player.sabr_engine_error", { error: message, recoveryPositionMs });
      latestOnError()(recoveryPositionMs);
    },
    [errorReportedRef, latestOnError],
  );
}
