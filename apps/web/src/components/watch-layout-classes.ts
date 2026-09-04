export type WatchLayoutClasses = ReturnType<typeof getWatchLayoutClasses>;

export function getWatchLayoutClasses(cinemaMode: boolean, hasSecondaryContent: boolean) {
  const anim = "[animation:page-fade-in_0.2s_ease-out]";
  const standardLayout = hasSecondaryContent
    ? "pt-2 sm:pt-3 lg:flex-row lg:items-stretch"
    : "pt-2 sm:pt-3 lg:items-center";
  return {
    containerClass: `watch-layout-container flex flex-col gap-6 ${
      cinemaMode ? "" : standardLayout
    } ${anim}`,
    playerWrapClass: cinemaMode
      ? "watch-player-wrap overflow-hidden bg-black"
      : `watch-player-wrap min-w-0 flex flex-col gap-4 ${
          hasSecondaryContent ? "flex-[2] max-w-[133.333vh]" : "mx-auto w-full max-w-[1600px]"
        }`,
    playerBoxClass: cinemaMode
      ? "watch-player-box relative mx-auto aspect-video w-[min(100%,calc((100svh-4.5rem)*16/9))]"
      : "watch-player-box watch-sticky-player relative overflow-hidden rounded-lg",
    playerClassName: cinemaMode
      ? "watch-player-surface w-full h-full dark [--video-aspect-ratio:16/9]"
      : "watch-player-surface",
    mediaClassName: cinemaMode ? "object-cover" : undefined,
  };
}
