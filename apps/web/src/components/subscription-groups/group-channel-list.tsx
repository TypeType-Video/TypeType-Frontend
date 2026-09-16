import { useState } from "react";
import { useGroupPagination } from "../../hooks/use-group-pagination";
import { m } from "../../paraglide/messages.js";
import type { GroupedSubscription, SubscriptionGroup } from "../../types/subscription-groups";
import { GroupChannelRow } from "./group-channel-row";
import { GroupPagination } from "./group-pagination";

type Props = {
  channels: GroupedSubscription[];
  label: string;
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
  const [anchor, setAnchor] = useState<string | null>(null);
  const pagination = useGroupPagination({
    total: props.channels.length,
    rowRem: 3.5,
    fallbackSize: 10,
    reservedRem: props.editing ? 4.5 : 0,
    anchor: props.channels.findIndex((channel) => channel.channelUrl === (anchor ?? props.editing)),
  });
  return (
    <div className="flex min-h-0 flex-1 flex-col border border-border bg-surface">
      <div ref={pagination.viewport} className="min-h-0 flex-1">
        {props.channels.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm font-medium">{m.sg_no_channel_match()}</p>
            <p className="mt-2 text-xs text-fg-muted">{m.sg_change_filters()}</p>
          </div>
        ) : (
          <ul aria-label={m.sg_channels()}>
            {props.channels.slice(pagination.start, pagination.end).map((channel) => (
              <GroupChannelRow
                key={channel.channelUrl}
                channel={channel}
                groups={props.groups}
                selected={props.selected.has(channel.channelUrl)}
                editing={props.editing === channel.channelUrl}
                draft={props.drafts.get(channel.channelUrl)}
                busy={props.busy}
                disabled={props.busy}
                onSelect={() => {
                  setAnchor(channel.channelUrl);
                  props.onToggle(channel.channelUrl);
                }}
                onDraft={(ids) => props.onDraft(channel.channelUrl, ids)}
                onCancel={props.onCancel}
                onSave={(ids) => props.onSave(channel, ids)}
              />
            ))}
          </ul>
        )}
      </div>
      <GroupPagination
        {...pagination}
        label={props.label}
        total={props.channels.length}
        disabled={props.busy}
      />
    </div>
  );
}
