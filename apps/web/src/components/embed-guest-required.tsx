type EmbedGuestRequiredProps = {
  watchUrl: string;
};

export function EmbedGuestRequired({ watchUrl }: EmbedGuestRequiredProps) {
  return (
    <div className="w-full h-full bg-black flex flex-col items-center justify-center gap-5 px-4">
      <img src="/error-cat.gif" width="140" height="140" alt="" className="rounded-2xl" />
      <div className="flex flex-col items-center gap-1.5">
        <p className="text-white text-base font-semibold tracking-tight">Embed unavailable</p>
        <p className="text-fg-muted text-sm max-w-xs text-center">
          This instance does not allow guest access, which is required for embedded playback.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2 rounded-full bg-white hover:bg-fg text-app text-sm font-medium transition-colors cursor-pointer"
        >
          Go to video
        </a>
      </div>
    </div>
  );
}
