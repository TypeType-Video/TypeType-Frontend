import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { resolveShortsRouteTarget, shortsRouteKey } from "../lib/shorts-route";
import type { VideoStream } from "../types/stream";

type Params = {
  targetUrl: string | undefined;
  shorts: VideoStream[];
  index: number;
  moveTo: (target: number) => void;
  activeId: string;
  onActiveChange: () => void;
};

export function useShortsRouteSync({
  targetUrl,
  shorts,
  index,
  moveTo,
  activeId,
  onActiveChange,
}: Params) {
  const navigate = useNavigate({ from: "/shorts" });
  const syncedTargetRef = useRef<string | null>(null);
  const routeMovePendingRef = useRef<string | null>(null);
  const onActiveChangeRef = useRef(onActiveChange);
  onActiveChangeRef.current = onActiveChange;

  useEffect(() => {
    const target = resolveShortsRouteTarget(targetUrl);
    if (!target) return;
    if (syncedTargetRef.current === target.publicParam) return;
    const targetIndex = shorts.findIndex(
      (short) => shortsRouteKey(short.id) === target.publicParam,
    );
    if (targetIndex < 0) return;
    syncedTargetRef.current = target.publicParam;
    routeMovePendingRef.current = target.publicParam;
    if (targetIndex !== index) moveTo(targetIndex);
  }, [targetUrl, shorts, index, moveTo]);

  useEffect(() => {
    if (targetUrl) return;
    syncedTargetRef.current = null;
    routeMovePendingRef.current = null;
  }, [targetUrl]);

  useEffect(() => {
    const active = shorts[index];
    if (!active) return;
    const activeParam = shortsRouteKey(active.id);
    const pendingTarget = routeMovePendingRef.current;
    if (pendingTarget && pendingTarget !== activeParam) return;
    routeMovePendingRef.current = null;
    const targetParam = resolveShortsRouteTarget(targetUrl)?.publicParam;
    if (targetParam === activeParam) return;
    void navigate({ search: { v: activeParam }, replace: true });
  }, [shorts, index, navigate, targetUrl]);

  useEffect(() => {
    if (!activeId) return;
    onActiveChangeRef.current();
  }, [activeId]);
}
