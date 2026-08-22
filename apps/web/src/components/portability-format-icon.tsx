import { Archive, Rss } from "lucide-react";
import { siInvidious, siLibretube, siNewpipe, siPiped, siYoutube } from "simple-icons";

type Props = {
  format: string;
  className?: string;
};

const BRAND_PATHS: Record<string, string> = {
  invidious: siInvidious.path,
  libretube: siLibretube.path,
  newpipe: siNewpipe.path,
  piped: siPiped.path,
  "youtube-takeout": siYoutube.path,
};

const OFFICIAL_ASSETS: Record<string, string> = {
  flow: "/portability-formats/flow.png",
  grayjay: "/portability-formats/grayjay.png",
  materialious: "/portability-formats/materialious.png",
  skytube: "/portability-formats/skytube.png",
  viewtube: "/portability-formats/viewtube.png",
  "youtube-local": "/portability-formats/youtube-local.ico",
};

export function PortabilityFormatIcon({ format, className = "h-5 w-5" }: Props) {
  const asset =
    format === "typetype"
      ? "/logo.svg"
      : format === "pipepipe"
        ? "/pipepipe-logo.png"
        : OFFICIAL_ASSETS[format];
  if (asset) {
    return <img src={asset} alt="" className={`${className} object-contain`} />;
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
  return <Archive aria-hidden="true" className={className} />;
}
