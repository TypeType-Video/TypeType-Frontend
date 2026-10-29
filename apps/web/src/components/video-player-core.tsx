import { createDashSettings, createHlsConfig } from "@typetype/mse";
import type * as dashjs from "dashjs";
import type Hls from "hls.js";
import { recordClientEvent } from "../lib/client-debug-log";
import { attachBilibiliSeekBuffer } from "../lib/dash-bilibili-seek-buffer";
import { attachDashPlaybackDiagnostics } from "../lib/dash-playback-diagnostics";
import { notifyDashPlayer, setDashPlayer } from "../lib/dash-player-store";
import { installDashQualityCompat } from "../lib/dash-quality-compat";
import type { Provider } from "../lib/provider";
import type { MediaProviderAdapter } from "../lib/vidstack";
import { isDASHProvider, isHLSProvider, Track, useMediaState } from "../lib/vidstack";
import { useAuthStore } from "../stores/auth-store";

type DashRequestInterceptor = Parameters<dashjs.MediaPlayerClass["addRequestInterceptor"]>[0];

type DashLibraryModule = { default: typeof dashjs };
type DashRuntimeModule = typeof dashjs & { default?: typeof dashjs };
type HlsLibraryModule = { default: typeof Hls; FetchLoader: typeof import("hls.js").FetchLoader };
type HlsRuntimeModule = { default?: typeof Hls };
let dashLibrary: typeof dashjs | null = null;
let dashLibraryPromise: Promise<DashLibraryModule> | null = null;
let hlsLibraryPromise: Promise<HlsLibraryModule> | null = null;
const hlsProviderLibraries = new WeakMap<MediaProviderAdapter, Promise<HlsLibraryModule>>();

const loadDashLibrary = (): Promise<DashLibraryModule> => {
  dashLibraryPromise ??= import("dashjs").then((module) => {
    const library = (module as DashRuntimeModule).default ?? module;
    dashLibrary = library;
    return { default: library };
  });
  return dashLibraryPromise;
};

const loadHlsLibrary = (): Promise<HlsLibraryModule> => {
  hlsLibraryPromise ??= import("hls.js").then((module) => ({
    default: (module as HlsRuntimeModule).default ?? (module as unknown as typeof Hls),
    FetchLoader: module.FetchLoader,
  }));
  return hlsLibraryPromise;
};

const STREAMING_BUFFER_POLICY = {
  steadyBufferMs: 36_000,
  maxBufferMs: 60_000,
  backBufferMs: 20_000,
} as const;

const BILIBILI_BUFFER_POLICY = {
  steadyBufferMs: 6_000,
  maxBufferMs: 8_000,
  backBufferMs: STREAMING_BUFFER_POLICY.backBufferMs,
} as const;

export function buildDashStreamingSettings(sourceProvider?: Provider) {
  const isBilibili = sourceProvider === "bilibili";
  const bufferPolicy = isBilibili ? BILIBILI_BUFFER_POLICY : STREAMING_BUFFER_POLICY;
  const dashSettings = createDashSettings(bufferPolicy);
  return {
    ...dashSettings,
    buffer: {
      ...dashSettings.buffer,
      bufferTimeDefault: isBilibili ? 4 : 24,
      bufferTimeAtTopQuality: isBilibili ? 6 : 36,
      bufferTimeAtTopQualityLongForm: isBilibili ? 8 : 60,
    },
    gaps: {
      enableStallFix: true,
    },
    cmcd: { enabled: false },
  };
}

function configureDashPlayer(
  player: dashjs.MediaPlayerClass,
  library: typeof dashjs,
  sourceProvider?: Provider,
): void {
  installDashQualityCompat(player);
  const onDashUpdate = () => notifyDashPlayer();
  player.on(library.MediaPlayer.events.STREAM_INITIALIZED, onDashUpdate);
  player.on(library.MediaPlayer.events.TRACK_CHANGE_RENDERED, onDashUpdate);
  player.on(library.MediaPlayer.events.QUALITY_CHANGE_RENDERED, onDashUpdate);
  if (sourceProvider === "bilibili") attachDashPlaybackDiagnostics(player, library);
  player.updateSettings({
    streaming: buildDashStreamingSettings(sourceProvider),
  });
  if (sourceProvider === "bilibili") attachBilibiliSeekBuffer(player);
  notifyDashPlayer();
}

export function ChaptersTrack({ src }: { src: string }) {
  const duration = useMediaState("duration");
  if (!Number.isFinite(duration) || duration <= 0) return null;
  return <Track kind="chapters" src={src} default />;
}

export function onProviderChange(
  provider: MediaProviderAdapter | null,
  sourceProvider?: Provider,
  onDashFragmentLoaded?: () => void,
): void {
  if (isHLSProvider(provider)) {
    let providerLibrary = hlsProviderLibraries.get(provider);
    if (!providerLibrary) {
      providerLibrary = loadHlsLibrary().then((library) => {
        provider.config = createHlsConfig({
          FetchLoader: library.FetchLoader,
          policy: STREAMING_BUFFER_POLICY,
        });
        return library;
      });
      hlsProviderLibraries.set(provider, providerLibrary);
    }
    provider.library = () => providerLibrary;
    provider.onInstance((hls) => {
      const events = (hls.constructor as typeof Hls).Events;
      hls.on(events.ERROR, (_, data) => {
        recordClientEvent("player.hls_transport_error", {
          fatal: data.fatal,
          type: data.type,
          details: data.details,
          reason: data.reason,
          responseCode: data.response?.code,
          responseUrl: data.response?.url,
          contextUrl: data.frag?.url ?? data.url,
        });
      });
    });
    return;
  }
  const dashProvider = isDASHProvider(provider);
  if (!dashProvider) {
    if (provider === null) setDashPlayer(null);
    return;
  }
  provider.library = loadDashLibrary;
  provider.onInstance((player) => {
    const addAuthHeader: DashRequestInterceptor = async (request) => {
      const token = useAuthStore.getState().token;
      if (!token) return request;
      request.headers = {
        ...request.headers,
        Authorization: `Bearer ${token}`,
      };
      return request;
    };
    setDashPlayer(player);
    player.addRequestInterceptor(addAuthHeader);
    player.on("fragmentLoadingCompleted", (event: dashjs.FragmentLoadingCompletedEvent) => {
      if (event.response) onDashFragmentLoaded?.();
    });
    if (dashLibrary) configureDashPlayer(player, dashLibrary, sourceProvider);
    else
      void loadDashLibrary().then(({ default: library }) =>
        configureDashPlayer(player, library, sourceProvider),
      );
  });
}
