import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";
import { useGroupManager } from "../../hooks/use-group-manager";
import { useGroupMemberships, useSubscriptionGroups } from "../../hooks/use-subscription-groups";
import {
  createSubscriptionGroup,
  renameSubscriptionGroup,
  updateGroupMemberships,
} from "../../lib/api-subscription-groups";
import { channelMembershipChanges } from "../../lib/subscription-group-selection";
import { m } from "../../paraglide/messages.js";
import { GroupChannelList } from "./group-channel-list";
import { GroupConfirmDialog } from "./group-confirm-dialog";
import { GroupSidebar } from "./group-sidebar";
import { GroupToolbar } from "./group-toolbar";
import "../../styles/subscription-groups.css";

export function GroupManager(): React.JSX.Element {
  const groupsQuery = useSubscriptionGroups();
  const channelsQuery = useGroupMemberships();
  const groups = useMemo(
    () => [...(groupsQuery.data ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
    [groupsQuery.data],
  );
  const channels = useMemo(
    () => [...(channelsQuery.data ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
    [channelsQuery.data],
  );
  const {
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
    selectResults,
    setOnlySelected,
    setDraft,
    setConfirmation,
    changeFilter,
    toggle,
    clearSelection,
    bulk,
    confirm,
  } = useGroupManager(groups, channels);
  return (
    <div className="sg-manager mx-auto flex max-w-[1440px] flex-col gap-5 pt-5 pb-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{m.sg_manage_groups()}</h1>
          <p className="mt-1 text-sm text-fg-muted">{m.sg_manager_description()}</p>
        </div>
        <Link to="/subscriptions/channels" className="sg-button">
          <ArrowLeft size={14} />
          {m.sg_back_channels()}
        </Link>
      </header>
      {groupsQuery.isPending || channelsQuery.isPending ? (
        <p role="status" className="py-16 text-center text-sm text-fg-muted">
          {m.sg_loading()}
        </p>
      ) : (groupsQuery.isError && !groupsQuery.data) ||
        (channelsQuery.isError && !channelsQuery.data) ? (
        <div role="alert" className="flex flex-wrap items-center gap-3 border border-border p-5">
          <p className="text-sm">{m.sg_load_error()}</p>
          <button
            type="button"
            className="sg-button"
            onClick={() => {
              void groupsQuery.refetch();
              void channelsQuery.refetch();
            }}
          >
            {m.sg_retry()}
          </button>
        </div>
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
          <GroupSidebar
            groups={groups}
            total={channels.length}
            ungrouped={channels.filter((channel) => channel.groupIds.length === 0).length}
            filter={activeFilter}
            disabled={disabled}
            onFilter={changeFilter}
            onCreate={(name) =>
              actions.run(() => createSubscriptionGroup(name), m.sg_group_created({ group: name }))
            }
            onRename={(id, name) =>
              actions.run(() => renameSubscriptionGroup(id, name), m.sg_group_renamed())
            }
            onDelete={setConfirmation}
            onCancelRename={actions.clearError}
          />
          <div className="flex min-w-0 flex-col gap-3" aria-busy={actions.busy}>
            <GroupToolbar
              key={activeFilter}
              groups={groups}
              defaultTarget={activeGroup?.id ?? ""}
              filterName={filterName}
              isGroup={Boolean(activeGroup)}
              excluded={excluded}
              query={query}
              selectedCount={chosen.length}
              hiddenCount={hiddenCount}
              resultCount={visible.length}
              allSelected={
                visible.length > 0 &&
                visible.every((channel) => validSelected.has(channel.channelUrl))
              }
              onlySelected={onlySelected}
              disabled={disabled}
              busy={actions.busy}
              onQuery={setQuery}
              onExcluded={setExcluded}
              onSelectResults={selectResults}
              onClear={clearSelection}
              onOnlySelected={() => setOnlySelected(!onlySelected)}
              onBulk={bulk}
              onRemoveAll={() => setConfirmation("clear")}
            />
            {actions.error && (
              <p
                role="alert"
                className="border border-danger/40 bg-surface px-4 py-3 text-sm text-danger"
              >
                {actions.error}
              </p>
            )}
            {actions.notice && (
              <p role="status" className="border border-border bg-surface px-4 py-3 text-sm">
                {actions.notice}
              </p>
            )}
            {channels.length === 0 ? (
              <div className="border border-border bg-surface p-10 text-center">
                <p className="text-sm">{m.ui_no_subscriptions_yet_2()}</p>
                <p className="mt-2 text-xs text-fg-muted">{m.sg_empty_subscriptions()}</p>
              </div>
            ) : (
              <GroupChannelList
                key={`${activeFilter}:${excluded}:${query}:${onlySelected}`}
                channels={visible}
                groups={groups}
                selected={validSelected}
                editing={editing}
                drafts={drafts}
                busy={actions.busy}
                onToggle={toggle}
                onDraft={setDraft}
                onCancel={clearSelection}
                onSave={(channel, ids) =>
                  actions.run(
                    () => updateGroupMemberships(channelMembershipChanges(channel, ids)),
                    m.sg_channel_saved({ channel: channel.name }),
                  )
                }
              />
            )}
          </div>
        </div>
      )}
      {confirmationProps && (
        <GroupConfirmDialog
          {...confirmationProps}
          onCancel={() => setConfirmation(null)}
          onConfirm={confirm}
        />
      )}
    </div>
  );
}
