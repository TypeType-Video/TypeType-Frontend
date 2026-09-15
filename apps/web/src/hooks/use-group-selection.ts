import { useState } from "react";
import type { GroupedSubscription } from "../types/subscription-groups";

type Selection = {
  urls: ReadonlySet<string>;
  drafts: ReadonlyMap<string, ReadonlySet<string>>;
};

function selectUrls(current: Selection, urls: ReadonlySet<string>): Selection {
  return {
    urls,
    drafts: new Map([...current.drafts].filter(([url]) => urls.has(url))),
  };
}

export function useGroupSelection(channels: GroupedSubscription[]): {
  chosen: GroupedSubscription[];
  selected: Set<string>;
  drafts: Selection["drafts"];
  select: (urls: Set<string>) => void;
  toggle: (url: string) => void;
  setDraft: (url: string, ids: Set<string>) => void;
} {
  const [state, setState] = useState<Selection>({ urls: new Set(), drafts: new Map() });
  const chosen = channels.filter((channel) => state.urls.has(channel.channelUrl));
  return {
    chosen,
    selected: new Set(chosen.map((channel) => channel.channelUrl)),
    drafts: state.drafts,
    select: (urls) => setState((current) => selectUrls(current, urls)),
    toggle: (url) => {
      setState((current) => {
        const urls = new Set(current.urls);
        if (urls.has(url)) urls.delete(url);
        else urls.add(url);
        return selectUrls(current, urls);
      });
    },
    setDraft: (url, ids) => {
      setState((current) =>
        current.urls.has(url)
          ? { ...current, drafts: new Map(current.drafts).set(url, ids) }
          : current,
      );
    },
  };
}
