import { useState } from "react";
import { deleteSubscriptionGroup, updateGroupMemberships } from "../lib/api-subscription-groups";
import {
  clearMembershipChanges,
  filterGroupChannels,
  selectGroupResults,
} from "../lib/subscription-group-selection";
import { m } from "../paraglide/messages.js";
import type { GroupedSubscription, SubscriptionGroup } from "../types/subscription-groups";
import { useGroupSelection } from "./use-group-selection";
import { useGroupActions } from "./use-subscription-groups";

type State = {
  actions: ReturnType<typeof useGroupActions>;
  activeFilter: string;
  activeGroup: SubscriptionGroup | undefined;
  excluded: boolean;
  query: string;
  chosen: GroupedSubscription[];
  validSelected: Set<string>;
  visible: GroupedSubscription[];
  hiddenCount: number;
  filterName: string;
  disabled: boolean;
  editing: string | null;
  drafts: ReadonlyMap<string, ReadonlySet<string>>;
  onlySelected: boolean;
  confirmationProps: { title: string; description: string; confirmLabel: string } | null;
  setExcluded: (value: boolean) => void;
  setQuery: (value: string) => void;
  selectResults: () => void;
  setOnlySelected: (value: boolean) => void;
  setDraft: (url: string, ids: Set<string>) => void;
  setConfirmation: (value: SubscriptionGroup | "clear" | null) => void;
  changeFilter: (value: string) => void;
  toggle: (url: string) => void;
  clearSelection: () => void;
  bulk: (groupId: string, action: "add" | "remove") => Promise<void>;
  confirm: () => Promise<void>;
};

export function useGroupManager(
  groups: SubscriptionGroup[],
  channels: GroupedSubscription[],
  canEdit: boolean,
): State {
  const actions = useGroupActions(canEdit);
  const [filter, setFilter] = useState("all");
  const [excluded, setExcluded] = useState(false);
  const [query, setQuery] = useState("");
  const selection = useGroupSelection(channels);
  const [onlySelected, setOnlySelected] = useState(false);
  const [confirmation, setConfirmation] = useState<SubscriptionGroup | "clear" | null>(null);
  const { chosen, selected: validSelected, drafts, setDraft } = selection;
  const activeGroup = groups.find((group) => group.id === filter);
  const activeFilter = activeGroup || filter === "ungrouped" ? filter : "all";
  const visible = filterGroupChannels(
    channels,
    activeFilter,
    excluded,
    query,
    validSelected,
    onlySelected,
  );
  const hiddenCount =
    chosen.length - visible.filter((channel) => validSelected.has(channel.channelUrl)).length;
  const filterName =
    activeGroup?.name ??
    (activeFilter === "ungrouped" ? m.groups_preview_ungrouped() : m.sg_all_channels());
  const editing = chosen.length === 1 ? chosen[0].channelUrl : null;
  const disabled = actions.busy || !canEdit;

  function toggle(url: string): void {
    actions.clearError();
    selection.toggle(url);
  }
  function changeFilter(value: string): void {
    actions.clearError();
    setFilter(value);
    setExcluded(false);
    setOnlySelected(false);
  }
  function clearSelection(): void {
    actions.clearError();
    selection.select(new Set());
    setOnlySelected(false);
  }
  async function bulk(groupId: string, action: "add" | "remove"): Promise<void> {
    const channelUrls = chosen
      .filter((channel) => channel.groupIds.includes(groupId) === (action === "remove"))
      .map((channel) => channel.channelUrl);
    const name = groups.find((group) => group.id === groupId)?.name ?? "";
    const message =
      action === "add"
        ? channelUrls.length === 1
          ? m.sg_added_one({ group: name })
          : m.sg_added({ count: channelUrls.length, group: name })
        : channelUrls.length === 1
          ? m.sg_removed_one({ group: name })
          : m.sg_removed({ count: channelUrls.length, group: name });
    if (
      await actions.run(() => updateGroupMemberships([{ groupId, channelUrls, action }]), message)
    )
      clearSelection();
  }
  async function confirm(): Promise<void> {
    const pending = confirmation;
    setConfirmation(null);
    if (pending === "clear") {
      if (
        await actions.run(
          () => updateGroupMemberships(clearMembershipChanges(chosen)),
          m.sg_memberships_cleared(),
        )
      )
        clearSelection();
    } else if (pending) {
      if (
        (await actions.run(
          () => deleteSubscriptionGroup(pending.id),
          m.sg_group_deleted({ group: pending.name }),
        )) &&
        activeFilter === pending.id
      )
        changeFilter("all");
    }
  }

  const confirmationProps = confirmation
    ? {
        title:
          confirmation === "clear"
            ? m.sg_remove_all()
            : m.sg_delete_named({ group: confirmation.name }),
        description:
          confirmation === "clear"
            ? chosen.length === 1
              ? m.sg_clear_one_confirmation()
              : m.sg_clear_confirmation({ count: chosen.length })
            : confirmation.channelCount === 1
              ? m.sg_delete_one_confirmation()
              : m.sg_delete_confirmation({ count: confirmation.channelCount }),
        confirmLabel: confirmation === "clear" ? m.sg_remove_all() : m.sg_delete_group(),
      }
    : null;
  return {
    actions,
    activeFilter,
    activeGroup,
    excluded,
    query,
    chosen,
    validSelected,
    visible,
    hiddenCount,
    filterName,
    disabled,
    editing,
    drafts,
    onlySelected,
    confirmationProps,
    setExcluded,
    setQuery,
    selectResults: () =>
      selection.select(
        selectGroupResults(
          validSelected,
          visible.map((channel) => channel.channelUrl),
        ),
      ),
    setOnlySelected,
    setDraft,
    setConfirmation,
    changeFilter,
    toggle,
    clearSelection,
    bulk,
    confirm,
  };
}
