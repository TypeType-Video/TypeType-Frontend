import { Archive, Rss, Smartphone } from "lucide-react";
import { siInvidious, siLibretube, siNewpipe, siPiped, siYoutube } from "simple-icons";

type Props = {
  format: string;
  className?: string;
};

const BRAND_PATHS: Record<string, string> = {
  invidious: siInvidious.path,
  libretube: siLibretube.path,
  materialious: siInvidious.path,
  newpipe: siNewpipe.path,
  piped: siPiped.path,
  "youtube-local": siYoutube.path,
  "youtube-takeout": siYoutube.path,
};

export function PortabilityFormatIcon({ format, className = "h-5 w-5" }: Props) {
  if (format === "typetype" || format === "pipepipe") {
    return (
      <img
        src={format === "typetype" ? "/logo.svg" : "/pipepipe-logo.png"}
        alt=""
        className={`${className} object-contain`}
      />
    );
  }
  const path = BRAND_PATHS[format];
  if (path) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
        <path d={path} />
      </svg>
    );
  }
  if (format === "opml") return <Rss aria-hidden="true" className={className} />;
  if (["flow", "grayjay", "skytube"].includes(format)) {
    return <Smartphone aria-hidden="true" className={className} />;
  }
  return <Archive aria-hidden="true" className={className} />;
}
