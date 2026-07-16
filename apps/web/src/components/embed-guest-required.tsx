type EmbedGuestRequiredProps = {
  watchUrl: string;
};

export function EmbedGuestRequired({ watchUrl }: EmbedGuestRequiredProps) {
  return (
    <div className="w-full h-full bg-black flex items-center justify-center px-4">
      <div className="flex max-w-sm flex-col items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-6 text-center">
        <h1 className="text-base font-semibold text-white">Embed unavailable</h1>
        <p className="text-sm text-zinc-400">
          This instance does not allow guest access, which is required for embedded playback.
        </p>
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex h-9 items-center rounded-lg bg-white px-4 text-sm font-medium text-black transition-opacity hover:opacity-90"
        >
          Go to video
        </a>
      </div>
    </div>
  );
}
