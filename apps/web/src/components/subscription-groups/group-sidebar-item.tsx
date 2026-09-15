import { MoreHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { m } from "../../paraglide/messages.js";
import type { SubscriptionGroup } from "../../types/subscription-groups";
import { GroupNameForm } from "./group-name-form";

type Props = {
  group: SubscriptionGroup;
  active: boolean;
  disabled: boolean;
  onSelect: () => void;
  onRename: (name: string) => Promise<boolean>;
  onCancelRename: () => void;
  onDelete: () => void;
};

export function GroupSidebarItem({
  group,
  active,
  disabled,
  onSelect,
  onRename,
  onCancelRename,
  onDelete,
}: Props): React.JSX.Element {
  const [renaming, setRenaming] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const actionButton = useRef<HTMLButtonElement>(null);
  const wasRenaming = useRef(false);
  useEffect(() => {
    if (wasRenaming.current && !renaming) actionButton.current?.focus();
    wasRenaming.current = renaming;
  }, [renaming]);
  if (renaming)
    return (
      <GroupNameForm
        initialName={group.name}
        busy={disabled}
        onCancel={() => {
          setRenaming(false);
          onCancelRename();
        }}
        onSave={async (name) => {
          const saved = await onRename(name);
          if (saved) setRenaming(false);
          return saved;
        }}
      />
    );
  return (
    <div
      className={`relative flex items-center border ${active ? "border-fg bg-surface-strong/50" : "border-transparent"}`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={onSelect}
        aria-current={active ? "true" : undefined}
        className="flex min-w-0 flex-1 items-center justify-between gap-2 px-3 py-2.5 text-left text-sm text-fg hover:bg-surface-strong disabled:opacity-50"
      >
        <span className="truncate" title={group.name}>
          {group.name}
        </span>
        <span className="text-xs text-fg-muted tabular-nums">{group.channelCount}</span>
      </button>
      <button
        ref={actionButton}
        type="button"
        disabled={disabled}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-expanded={menuOpen}
        aria-label={m.sg_group_actions({ group: group.name })}
        className="sg-button mr-1 w-7 border-0 px-0"
      >
        <MoreHorizontal size={16} />
      </button>
      {menuOpen && (
        <fieldset
          aria-label={m.sg_group_actions({ group: group.name })}
          className="absolute top-full right-0 z-30 flex min-w-40 flex-col border border-border-strong bg-surface p-1"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setMenuOpen(false);
              actionButton.current?.focus();
            }
          }}
        >
          <button
            type="button"
            disabled={disabled}
            className="sg-menu-item"
            onClick={() => {
              setMenuOpen(false);
              setRenaming(true);
            }}
          >
            {m.sg_rename_group()}
          </button>
          <button
            type="button"
            disabled={disabled}
            className="sg-menu-item text-danger"
            onClick={() => {
              setMenuOpen(false);
              onDelete();
            }}
          >
            {m.sg_delete_group()}
          </button>
        </fieldset>
      )}
    </div>
  );
}
