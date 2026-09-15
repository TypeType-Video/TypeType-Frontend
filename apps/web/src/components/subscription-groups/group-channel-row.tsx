import { useId, useRef } from "react";
import { proxyImage } from "../../lib/proxy";
import { m } from "../../paraglide/messages.js";
import type { GroupedSubscription, SubscriptionGroup } from "../../types/subscription-groups";
import { ChannelAvatar } from "../channel-avatar";
import { ChannelRouteLink } from "../channel-route-link";
import { ChannelGroupEditor } from "./channel-group-editor";

type Props = {
  channel: GroupedSubscription;
  groups: SubscriptionGroup[];
  selected: boolean;
  editing: boolean;
  draft: ReadonlySet<string> | undefined;
  disabled: boolean;
  busy: boolean;
  onSelect: () => void;
  onDraft: (ids: Set<string>) => void;
  onCancel: () => void;
  onSave: (ids: Set<string>) => Promise<boolean>;
};

export function GroupChannelRow(props: Props): React.JSX.Element {
  const { channel, groups, editing } = props;
  const selectionId = useId();
  const checkbox = useRef<HTMLInputElement>(null);
  const memberships = groups.filter((group) => channel.groupIds.includes(group.id));
  function cancel(): void {
    props.onCancel();
    checkbox.current?.focus();
  }
  return (
    <li
      data-selected={props.selected}
      className={`relative border-b border-border px-4 py-3 last:border-b-0 ${props.selected ? "bg-surface-strong" : "bg-surface hover:bg-surface-strong/50"}`}
    >
      <label
        htmlFor={selectionId}
        className={`absolute inset-0 ${props.disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span className="sr-only">{m.ui_select_named_channel({ name: channel.name })}</span>
      </label>
      <div className="pointer-events-none relative flex items-center gap-3">
        <input
          ref={checkbox}
          id={selectionId}
          type="checkbox"
          checked={props.selected}
          disabled={props.disabled}
          onChange={props.onSelect}
          aria-label={m.ui_select_named_channel({ name: channel.name })}
          className="pointer-events-auto h-4 w-4 shrink-0 cursor-pointer accent-accent disabled:cursor-not-allowed"
        />
        <ChannelAvatar
          src={proxyImage(channel.avatarUrl)}
          name={channel.name}
          className="h-9 w-9 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <ChannelRouteLink
            url={channel.channelUrl}
            className="pointer-events-auto w-fit max-w-full truncate text-sm font-medium hover:underline"
          >
            {channel.name}
          </ChannelRouteLink>
          <p className="truncate text-xs text-fg-muted">
            {channel.channelUrl.replace(/^https?:\/\/(www\.)?/, "")}
          </p>
        </div>
        {editing ? (
          <ChannelGroupEditor
            channel={channel}
            groups={groups}
            desired={props.draft ?? new Set(channel.groupIds)}
            onChange={props.onDraft}
            busy={props.busy}
            onCancel={cancel}
            onSave={async (ids) => {
              if (await props.onSave(ids)) cancel();
            }}
          />
        ) : (
          <div className="flex max-w-[50%] flex-wrap items-center justify-end gap-1.5 py-1 text-xs">
            {memberships.length > 0 ? (
              memberships.map((group) => (
                <span key={group.id} className="sg-chip max-w-36 truncate" title={group.name}>
                  {group.name}
                </span>
              ))
            ) : (
              <span className="sg-chip border-dashed">{m.sg_add_groups()}</span>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
