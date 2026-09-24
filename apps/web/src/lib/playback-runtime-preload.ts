import { detectProvider } from "./provider";

const runtimes = new Map<string, Promise<unknown>>();

export function preloadPlaybackRuntime(sourceUrl: string): Promise<unknown> {
  const cacheKey = detectProvider(sourceUrl) ?? "default";
  const existing = runtimes.get(cacheKey);
  if (existing) return existing;

  const tasks: Promise<unknown>[] = [import("../components/watch-layout")];
  if (cacheKey === "youtube") tasks.push(import("hls.js"));
  if (cacheKey === "bilibili") tasks.push(import("dashjs"));

  const runtime = Promise.all(tasks);
  runtimes.set(cacheKey, runtime);
  return runtime;
}
