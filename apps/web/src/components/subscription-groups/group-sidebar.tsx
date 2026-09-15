import { Inbox, Users } from "lucide-react";
import { m } from "../../paraglide/messages.js";
import type { SubscriptionGroup } from "../../types/subscription-groups";
import { GroupNameForm } from "./group-name-form";
import { GroupSidebarItem } from "./group-sidebar-item";

type Props = {
  groups: SubscriptionGroup[];
  total: number;
  ungrouped: number;
  filter: string;
  disabled: boolean;
  onFilter: (value: string) => void;
  onCreate: (name: string) => Promise<boolean>;
  onRename: (id: string, name: string) => Promise<boolean>;
  onCancelRename: () => void;
  onDelete: (group: SubscriptionGroup) => void;
};

export function GroupSidebar(props: Props): React.JSX.Element {
  return (
    <aside className="self-start border border-border bg-surface p-3 lg:sticky lg:top-20">
      <h2 className="mb-3 px-1 text-sm font-semibold">{m.sg_groups()}</h2>
      <GroupNameForm busy={props.disabled} onSave={props.onCreate} />
      <nav
        aria-label={m.sg_group_filters()}
        className="mt-4 flex max-h-[65vh] flex-col gap-1 overflow-y-auto"
      >
        {[
          { id: "all", name: m.sg_all_channels(), count: props.total, icon: Users },
          {
            id: "ungrouped",
            name: m.groups_preview_ungrouped(),
            count: props.ungrouped,
            icon: Inbox,
          },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={props.disabled}
            onClick={() => props.onFilter(item.id)}
            aria-current={props.filter === item.id ? "true" : undefined}
            className={`flex items-center gap-2 border px-3 py-2.5 text-left text-sm disabled:opacity-50 ${props.filter === item.id ? "border-fg bg-surface-strong/50" : "border-transparent hover:bg-surface-strong"}`}
          >
            <item.icon size={14} />
            <span className="flex-1">{item.name}</span>
            <span className="text-xs text-fg-muted tabular-nums">{item.count}</span>
          </button>
        ))}
        <div className="my-2 border-t border-border" />
        {props.groups.map((group) => (
          <GroupSidebarItem
            key={group.id}
            group={group}
            active={props.filter === group.id}
            disabled={props.disabled}
            onSelect={() => props.onFilter(group.id)}
            onRename={(name) => props.onRename(group.id, name)}
            onCancelRename={props.onCancelRename}
            onDelete={() => props.onDelete(group)}
          />
        ))}
        {props.groups.length === 0 && (
          <p className="px-3 py-3 text-xs leading-relaxed text-fg-muted">{m.sg_no_groups()}</p>
        )}
      </nav>
    </aside>
  );
}
