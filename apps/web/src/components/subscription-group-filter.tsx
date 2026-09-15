import { useSubscriptionGroups } from "../hooks/use-subscription-groups";
import { m } from "../paraglide/messages.js";

type Props = { value: string; onChange: (value: string) => void };

export function SubscriptionGroupFilter({ value, onChange }: Props): React.JSX.Element {
  const query = useSubscriptionGroups();
  const groups = [...(query.data ?? [])].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <select
      aria-label={m.sg_feed_filter()}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 max-w-64 border border-border-strong bg-app px-3 text-sm text-fg focus-visible:outline-2 focus-visible:outline-accent"
    >
      <option value="all">{m.sg_all_subscriptions()}</option>
      <option value="ungrouped">{m.groups_preview_ungrouped()}</option>
      {groups.map((group) => (
        <option key={group.id} value={group.id}>
          {group.name}
        </option>
      ))}
      {value !== "all" && value !== "ungrouped" && !groups.some((group) => group.id === value) && (
        <option value={value}>{m.sg_groups()}</option>
      )}
    </select>
  );
}
