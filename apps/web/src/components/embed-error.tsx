type EmbedErrorProps = {
  message: string;
};

export function EmbedError({ message }: EmbedErrorProps) {
  return (
    <div className="w-full h-full bg-black flex items-center justify-center px-4">
      <div className="flex max-w-sm flex-col items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-6 text-center">
        <p className="text-sm text-zinc-400">{message}</p>
      </div>
    </div>
  );
}
