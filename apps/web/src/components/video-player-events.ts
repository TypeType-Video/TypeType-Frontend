import { useEffect, useRef } from "react";
import { recordClientEvent } from "../lib/client-debug-log";
import { DashTransientErrorGuard, dashErrorCode } from "../lib/dash-transient-error-guard";
import { MediaProviderLifecycle } from "../lib/media-provider-lifecycle";
import { mediaSrcDetails } from "../lib/player-src-debug";
import type { Provider } from "../lib/provider";
import type { MediaErrorDetail, MediaSrc } from "../lib/vidstack";
import { onProviderChange } from "./video-player-core";

type Args = {
  src: MediaSrc;
  sourceProvider?: Provider;
  onError?: (positionMs?: number) => void;
  onEnded?: () => void;
};

export function useVideoPlayerEvents({ src, sourceProvider, onError, onEnded }: Args) {
  const providerLifecycle = useRef(new MediaProviderLifecycle());
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const srcRef = useRef(src);
  srcRef.current = src;
  const dashErrorGuard = useRef<DashTransientErrorGuard | null>(null);
  dashErrorGuard.current ??= new DashTransientErrorGuard(() => {
    recordClientEvent("player.dash_transient_error_stalled", mediaSrcDetails(srcRef.current));
    onErrorRef.current?.();
  });

  useEffect(() => {
    recordClientEvent("player.src", mediaSrcDetails(src));
    dashErrorGuard.current?.reset();
  }, [src]);

  useEffect(
    () => () => {
      providerLifecycle.current.dispose();
      dashErrorGuard.current?.reset();
    },
    [],
  );

  function handleProviderChange(provider: Parameters<typeof onProviderChange>[0]) {
    recordClientEvent("player.provider_change", { present: provider !== null });
    providerLifecycle.current.replace(provider);
    dashErrorGuard.current?.reset();
    onProviderChange(provider, sourceProvider, () => dashErrorGuard.current?.recordProgress());
  }

  function handleError(detail?: MediaErrorDetail) {
    if (dashErrorGuard.current?.absorb(detail)) {
      recordClientEvent("player.dash_transient_error", { code: dashErrorCode(detail) });
      return;
    }
    recordClientEvent("player.error", mediaSrcDetails(src));
    onError?.();
  }

  function handleEnded() {
    recordClientEvent("player.ended");
    onEnded?.();
  }

  return { handleProviderChange, handleError, handleEnded };
}
