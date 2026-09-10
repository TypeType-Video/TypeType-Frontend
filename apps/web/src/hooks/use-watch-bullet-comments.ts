import { detectProvider, supportsBulletComments } from "../lib/provider";
import { useBulletComments } from "./use-bullet-comments";

export function useWatchBulletComments(videoUrl: string, hideComments: boolean) {
  const isNicoNico = detectProvider(videoUrl) === "nicovideo";
  const canLoadBulletComments = supportsBulletComments(videoUrl);
  const { data: bulletComments } = useBulletComments(
    videoUrl,
    canLoadBulletComments && !hideComments,
  );

  return { isNicoNico, canLoadBulletComments, bulletComments };
}
