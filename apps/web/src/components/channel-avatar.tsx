import { UserRound } from "lucide-react";
import { useState } from "react";

type Props = {
  src: string;
  name: string;
  className?: string;
};

function getInitial(name: string): string {
  if (!name) return "?";
  if (name.startsWith("http")) {
    try {
      const segments = new URL(name).pathname.split("/").filter(Boolean);
      const last = segments.pop() ?? "";
      return (last.replace("@", "")[0] ?? "?").toUpperCase();
    } catch {
      return "?";
    }
  }
  return name[0].toUpperCase();
}

export function ChannelAvatar({ src, name, className = "w-8 h-8" }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const failed = failedSrc === src;
  const loaded = loadedSrc === src;

  return (
    <div
      className={`${className} relative flex flex-shrink-0 select-none items-center justify-center overflow-hidden rounded-full border border-border bg-gradient-to-br from-surface-strong to-surface-soft font-semibold text-fg-muted`}
      title={name}
    >
      {name.trim() ? (
        <span className="text-base leading-none">{getInitial(name)}</span>
      ) : (
        <UserRound className="h-1/2 w-1/2" aria-hidden="true" />
      )}
      {src && !failed && (
        <img
          src={src}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoadedSrc(src)}
          onError={() => setFailedSrc(src)}
        />
      )}
    </div>
  );
}
