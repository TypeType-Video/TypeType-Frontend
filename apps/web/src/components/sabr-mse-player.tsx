import { TypeTypeMsePlayer, type TypeTypeMseQuality } from "@typetype/mse";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLatestValue } from "../hooks/use-latest-value";
import { useSabrErrorReporter } from "../hooks/use-sabr-error-reporter";
import { useSabrModeSwitch } from "../hooks/use-sabr-mode-switch";
import { useSabrQualitySwitch } from "../hooks/use-sabr-quality-switch";
import { toAbsoluteApiUrl } from "../lib/env";
import { guardAutoplay, SabrAutoplayAttempt, SabrAutoplayDeadline } from "../lib/sabr-autoplay";
import { SabrPlaybackRatePreference } from "../lib/sabr-playback-rate-preference";
import { isAbortError } from "../lib/sabr-playback-retry";
import { cancelPendingSabrSeek, positionMs, runSabrSeek } from "../lib/sabr-player-seek";
import { registerSabrVidstackControls } from "../lib/sabr-vidstack-bridge";
import { useAuthStore } from "../stores/auth-store";
import type { SabrMsePlayerProps } from "./sabr-mse-player-types";
export function SabrMsePlayer({
  config,
  playbackRatePreference,
  video,
  startTime,
  autoplay,
  initialVolume,
  initialMuted,
  settingsReady,
  onVolumeChange,
  onError,
  onSeekStateChange,
  onSeekReady,
  onPositionReaderChange,
}: SabrMsePlayerProps) {
  const token = useAuthStore((state) => state.token);
  const headersRef = useRef(new Headers());
  if (token) headersRef.current.set("authorization", `Bearer ${token}`);
  else headersRef.current.delete("authorization");
  const engineRef = useRef<TypeTypeMsePlayer | null>(null);
  const qualityRef = useRef<TypeTypeMseQuality | null>(null);
  const pendingPlayRef = useRef(false);
  const seekingRef = useRef(false);
  const errorReportedRef = useRef(false);
  const attachedVideoRef = useRef(false);
  const fallbackPlaybackRateRef = useRef(new SabrPlaybackRatePreference());
  const playbackRate = playbackRatePreference ?? fallbackPlaybackRateRef.current;
  const [engineReady, setEngineReady] = useState(false);
  const latestConfig = useLatestValue(config);
  const latestStartTime = useLatestValue(startTime);
  const latestHandlers = useLatestValue({
    autoplay,
    onSeekStateChange,
    onSeekReady,
    onPositionReaderChange,
    onVolumeChange,
  });
  const reportError = useSabrErrorReporter(errorReportedRef, onError);
  const latestEngineHandlers = useCallback(() => {
    const handlers = latestHandlers();
    return {
      onError: reportError,
      onSeekStateChange: handlers.onSeekStateChange,
    };
  }, [latestHandlers, reportError]);
  const setQualityTransitioning = useCallback(
    (transitioning: boolean) => latestHandlers().onSeekStateChange(transitioning),
    [latestHandlers],
  );
  useSabrQualitySwitch(
    config,
    engineReady,
    engineRef,
    qualityRef,
    seekingRef,
    setQualityTransitioning,
  );
  useSabrModeSwitch(config.audioOnly === true, engineRef, seekingRef, latestEngineHandlers);
  useEffect(() => {
    if (!video || !settingsReady) return;
    video.volume = Math.min(1, Math.max(0, initialVolume));
    video.muted = initialMuted;
  }, [initialMuted, initialVolume, settingsReady, video]);
  useEffect(() => {
    if (!video) return;
    errorReportedRef.current = false;
    const replacingVideo = attachedVideoRef.current;
    attachedVideoRef.current = true;
    const autoplayAttempt = new SabrAutoplayAttempt();
    const initialConfig = latestConfig();
    const engine = new TypeTypeMsePlayer(video, {
      endpoint: toAbsoluteApiUrl(""),
      videoId: config.videoId,
      videoItag: initialConfig.videoItag,
      audioItag: initialConfig.audioItag,
      audioTrackId: initialConfig.audioTrackId,
      audioOnly: initialConfig.audioOnly,
      isLive: initialConfig.isLive,
      startTimeMs: Math.max(0, Math.round(latestStartTime())),
      headers: headersRef.current,
    });
    engineRef.current = engine;
    qualityRef.current = {
      videoItag: initialConfig.videoItag,
      audioItag: initialConfig.audioItag,
      audioTrackId: initialConfig.audioTrackId,
    };
    const offError = engine.on("error", (event) => {
      if (event.type === "error") reportError(event.error, event.recoveryPositionMs);
    });
    const volumeChange = () => {
      if (engine.isApplyingTransientMediaState()) return;
      latestHandlers().onVolumeChange?.(video.volume, video.muted);
    };
    let playbackRateSettled = false;
    const playbackRateChange = () => {
      playbackRate.capture(video, !playbackRateSettled || engine.isApplyingTransientMediaState());
    };
    const settlePlaybackRate = () => {
      if (engine.isApplyingTransientMediaState()) return;
      playbackRate.apply(video, false);
      playbackRateSettled = true;
    };
    const playEngine = () => engine.play().then(settlePlaybackRate);
    playbackRate.initialize(video);
    video.addEventListener("volumechange", volumeChange);
    video.addEventListener("ratechange", playbackRateChange);
    let engineLoaded = false;
    const autoplayDeadline = new SabrAutoplayDeadline(() => {
      if (!autoplayAttempt.expire()) return;
      pendingPlayRef.current = false;
      video.autoplay = false;
      engine.pause();
    });
    const unguardAutoplay = guardAutoplay(video, autoplayAttempt, () => engine.pause());
    const startAutoplay = () => {
      if (!engineLoaded || video.readyState < 3) return;
      if (!latestHandlers().autoplay && !pendingPlayRef.current) return;
      if (!autoplayAttempt.begin()) return;
      autoplayDeadline.arm();
      void playEngine()
        .then(() => {
          autoplayDeadline.clear();
          if (!autoplayAttempt.resolve()) engine.pause();
        })
        .catch((error: unknown) => {
          autoplayDeadline.clear();
          if (!autoplayAttempt.reject(error)) {
            pendingPlayRef.current = false;
            video.autoplay = false;
          }
        });
    };
    video.addEventListener("canplay", startAutoplay);
    const autoplayTimer = window.setInterval(startAutoplay, 250);
    const unregisterControls = registerSabrVidstackControls(video, {
      play: () => {
        pendingPlayRef.current = true;
        video.autoplay = true;
        if (!engineLoaded) return Promise.resolve();
        return playEngine();
      },
      pause: (userInitiated = false) => {
        if (!userInitiated && pendingPlayRef.current && !autoplayAttempt.isConfirmed) return;
        pendingPlayRef.current = false;
        autoplayAttempt.resolve();
        video.autoplay = false;
        return engine.pause();
      },
      seek: (seconds) => {
        const targetMs = Math.max(0, Math.round(seconds * 1000));
        runSabrSeek(engine, targetMs, seekingRef, reportError, latestHandlers().onSeekStateChange);
      },
      isTransitioning: () => seekingRef.current,
      isApplyingTransientMediaState: () => engine.isApplyingTransientMediaState(),
    });
    void engine
      .load()
      .then(() => {
        engineLoaded = true;
        setEngineReady(true);
        if (!replacingVideo) settlePlaybackRate();
        startAutoplay();
      })
      .catch((error: unknown) => {
        if (!isAbortError(error)) reportError(error);
      });
    latestHandlers().onSeekReady((seconds) => {
      const targetMs = Math.max(0, Math.round(seconds * 1000));
      runSabrSeek(engine, targetMs, seekingRef, reportError, latestHandlers().onSeekStateChange);
    });
    latestHandlers().onPositionReaderChange(() => positionMs(video));
    return () => {
      offError();
      unguardAutoplay();
      unregisterControls();
      video.removeEventListener("volumechange", volumeChange);
      video.removeEventListener("ratechange", playbackRateChange);
      video.removeEventListener("canplay", startAutoplay);
      window.clearInterval(autoplayTimer);
      autoplayDeadline.clear();
      engine.destroy();
      engineRef.current = null;
      setEngineReady(false);
      pendingPlayRef.current = false;
      autoplayAttempt.reset();
      cancelPendingSabrSeek(seekingRef);
      seekingRef.current = false;
      latestHandlers().onSeekStateChange(false);
      video.autoplay = false;
      latestHandlers().onPositionReaderChange(null);
    };
  }, [
    config.videoId,
    latestConfig,
    latestHandlers,
    latestStartTime,
    playbackRate,
    reportError,
    video,
  ]);
  return null;
}
