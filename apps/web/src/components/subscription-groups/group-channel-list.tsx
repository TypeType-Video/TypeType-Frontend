import { useState } from "react";
import { m } from "../../paraglide/messages.js";
import type { GroupedSubscription, SubscriptionGroup } from "../../types/subscription-groups";
import { GroupChannelRow } from "./group-channel-row";

type Props = {
  channels: GroupedSubscription[];
  groups: SubscriptionGroup[];
  selected: ReadonlySet<string>;
  editing: string | null;
  drafts: ReadonlyMap<string, ReadonlySet<string>>;
  busy: boolean;
  onToggle: (url: string) => void;
  onDraft: (url: string, ids: Set<string>) => void;
  onCancel: () => void;
  onSave: (channel: GroupedSubscription, ids: Set<string>) => Promise<boolean>;
};

export function GroupChannelList(props: Props): React.JSX.Element {
  const [limit, setLimit] = useState(50);
  if (props.channels.length === 0)
    return (
      <div className="border border-border bg-surface px-5 py-16 text-center">
        <p className="text-sm font-medium">{m.sg_no_channel_match()}</p>
        <p className="mt-2 text-xs text-fg-muted">{m.sg_change_filters()}</p>
      </div>
    );
  return (
    <>
      <ul className="border border-border" aria-label={m.sg_channels()}>
        {props.channels.slice(0, limit).map((channel) => (
          <GroupChannelRow
            key={channel.channelUrl}
            channel={channel}
            groups={props.groups}
            selected={props.selected.has(channel.channelUrl)}
            editing={props.editing === channel.channelUrl}
            draft={props.drafts.get(channel.channelUrl)}
            busy={props.busy}
            disabled={props.busy}
            onSelect={() => props.onToggle(channel.channelUrl)}
            onDraft={(ids) => props.onDraft(channel.channelUrl, ids)}
            onCancel={props.onCancel}
            onSave={(ids) => props.onSave(channel, ids)}
          />
        ))}
      </ul>
      {props.channels.length > limit && (
        <button
          type="button"
          onClick={() => setLimit(limit + 50)}
          className="sg-button mx-auto"
          disabled={props.busy}
        >
          {m.sg_load_more({ shown: limit, total: props.channels.length })}
        </button>
      )}
    </>
  );
}
