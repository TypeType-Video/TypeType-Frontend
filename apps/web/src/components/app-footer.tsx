import { DollarSign } from "lucide-react";
import { siGithub, siReddit } from "simple-icons";
import { ServiceIcon } from "./service-icon";

const COMMUNITY_URL = "https://github.com/TypeType-Video";
const REDDIT_URL = "https://www.reddit.com/r/TypeType/";
const SPONSOR_URL = "https://github.com/sponsors/Priveetee";

export function AppFooter() {
  return (
    <footer className="mt-12 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-border px-3 py-5 text-xs text-fg-soft">
      <a
        href={COMMUNITY_URL}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 text-fg-muted hover:text-fg"
      >
        <ServiceIcon path={siGithub.path} color="currentColor" label="GitHub" />
        Built by the TypeType community
      </a>
      <a
        href={REDDIT_URL}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 text-fg-muted hover:text-fg"
      >
        <ServiceIcon path={siReddit.path} color="currentColor" label="Reddit" />
        Reddit
      </a>
      <a
        href={SPONSOR_URL}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 text-accent hover:text-accent-strong"
      >
        <DollarSign size={13} />
        Support TypeType
      </a>
    </footer>
  );
}
