import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Inbox,
  Layers,
  Plus,
  RotateCcw,
  Search,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useInterfaceLocale } from "../hooks/use-interface-locale";
import { m } from "../paraglide/messages.js";
import type { Locale } from "../paraglide/runtime.js";
import { ChannelAvatar } from "./channel-avatar";

type PreviewGroup = {
  id: string;
  name: string;
};

type PreviewChannel = {
  id: string;
  name: string;
  handle: string;
  groupIds: string[];
};

type Bucket = "all" | "ungrouped" | string;
type Phase = "summary" | "organize" | "done";
type MenuAction = "add" | "remove";

function initialPhase(): Phase {
  const value = new URLSearchParams(window.location.search).get("phase");
  return value === "organize" || value === "done" ? value : "summary";
}

const INITIAL_GROUPS: PreviewGroup[] = [
  { id: "tech", name: "Tech" },
  { id: "video", name: "Video" },
  { id: "music", name: "Music" },
];

const INITIAL_CHANNELS: PreviewChannel[] = [
  { id: "lemnos", name: "Lemnos Life", handle: "@lemnoslife", groupIds: ["tech"] },
  { id: "mental", name: "Mental Outfit", handle: "@mentaloutfit", groupIds: ["tech", "video"] },
  { id: "jack", name: "Jack Rhysider", handle: "@jackrhysider", groupIds: ["tech"] },
  { id: "network", name: "Network Chuck", handle: "@networkchuck", groupIds: [] },
  { id: "fireship", name: "Fireship", handle: "@fireship", groupIds: ["tech", "video"] },
  { id: "veritas", name: "Veritasium", handle: "@veritasium", groupIds: ["video"] },
  { id: "smarter", name: "Smarter Every Day", handle: "@smartereveryday", groupIds: [] },
  { id: "behoops", name: "Behoops", handle: "@behoops", groupIds: ["video"] },
  { id: "redshirts", name: "Red Shirts", handle: "@redshirts", groupIds: [] },
  { id: "annie", name: "Annie Bramley", handle: "@anniebramley", groupIds: ["music"] },
  { id: "kexp", name: "KEXP", handle: "@kexp", groupIds: ["music"] },
  { id: "npr", name: "NPR Music", handle: "@nprmusic", groupIds: [] },
  { id: "dorian", name: "Dorian Me", handle: "@dorianme", groupIds: [] },
  { id: "arcade", name: "Arcade Sound", handle: "@arcadesound", groupIds: [] },
  { id: "cooking", name: "Cooking Comically", handle: "@cookingcomically", groupIds: [] },
];

export function SubscriptionGroupsPreview() {
  const { locale } = useInterfaceLocale();
  const [phase, setPhase] = useState<Phase>(initialPhase);
  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [channels, setChannels] = useState(INITIAL_CHANNELS);
  const [bucket, setBucket] = useState<Bucket>("ungrouped");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupFormOpen, setGroupFormOpen] = useState(false);
  const [menuAction, setMenuAction] = useState<MenuAction | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const groupNameById = useMemo(
    () => new Map(groups.map((group) => [group.id, group.name])),
    [groups],
  );
  const visibleChannels = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return channels
      .filter((channel) => {
        const matchesBucket =
          bucket === "all" ||
          (bucket === "ungrouped"
            ? channel.groupIds.length === 0
            : channel.groupIds.includes(bucket));
        const matchesQuery =
          normalizedQuery.length === 0 ||
          channel.name.toLocaleLowerCase().includes(normalizedQuery) ||
          channel.handle.toLocaleLowerCase().includes(normalizedQuery);
        return matchesBucket && matchesQuery;
      })
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [bucket, channels, query]);

  const ungroupedCount = channels.filter((channel) => channel.groupIds.length === 0).length;
  const groupedCount = channels.length - ungroupedCount;
  const coverage = channels.length === 0 ? 0 : Math.round((groupedCount / channels.length) * 100);

  function toggleChannel(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function setVisibleSelected(checked: boolean) {
    setSelected(checked ? new Set(visibleChannels.map((channel) => channel.id)) : new Set());
  }

  function updateMemberships(groupId: string, action: MenuAction) {
    if (selected.size === 0) return;
    setChannels((current) =>
      current.map((channel) => {
        if (!selected.has(channel.id)) return channel;
        const groupIds =
          action === "add"
            ? channel.groupIds.includes(groupId)
              ? channel.groupIds
              : [...channel.groupIds, groupId].sort()
            : channel.groupIds.filter((id) => id !== groupId);
        return { ...channel, groupIds };
      }),
    );
    const groupNameValue = groupNameById.get(groupId) ?? "group";
    setToast(
      action === "add"
        ? m.groups_preview_added({ count: selected.size, group: groupNameValue }, { locale })
        : m.groups_preview_removed({ count: selected.size, group: groupNameValue }, { locale }),
    );
    setSelected(new Set());
    setMenuAction(null);
    if (action === "add") setBucket(groupId);
  }

  function removeMembership(channelId: string, groupId: string) {
    setChannels((current) =>
      current.map((channel) =>
        channel.id === channelId
          ? { ...channel, groupIds: channel.groupIds.filter((id) => id !== groupId) }
          : channel,
      ),
    );
    setToast(
      m.groups_preview_group_removed(
        { group: groupNameById.get(groupId) ?? m.groups_preview_groups({}, { locale }) },
        { locale },
      ),
    );
  }

  function createGroup() {
    const name = groupName.trim();
    if (name.length === 0) return;
    const id = `${name.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    setGroups((current) => [...current, { id, name }]);
    setBucket(id);
    setGroupName("");
    setGroupFormOpen(false);
    setToast(m.groups_preview_group_created({ group: name }, { locale }));
  }

  function resetPreview() {
    setPhase("summary");
    setGroups(INITIAL_GROUPS);
    setChannels(INITIAL_CHANNELS);
    setBucket("ungrouped");
    setSelected(new Set());
    setQuery("");
    setGroupName("");
    setGroupFormOpen(false);
    setMenuAction(null);
    setToast(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("phase");
    window.history.replaceState(null, "", url);
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 pt-5 pb-8 [animation:page-fade-in_0.2s_ease-out] sm:pt-8">
      <header className="flex flex-col gap-4 px-1 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[11px] tracking-[0.22em] text-fg-soft uppercase">
              {m.groups_preview_data_transfer({}, { locale })}
            </p>
            <span className="border border-border px-1.5 py-0.5 text-[10px] tracking-wide text-fg-muted uppercase">
              {m.groups_preview_mock({}, { locale })}
            </span>
          </div>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-fg sm:text-2xl">
            {m.groups_preview_title({}, { locale })}
          </h1>
        </div>
        <StepBar phase={phase} locale={locale} />
      </header>

      {phase === "summary" && (
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
          <div className="flex flex-col gap-4 border border-border bg-surface p-5">
            <div className="flex min-w-0 items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-fg">
                  {m.groups_preview_import_complete({}, { locale })}
                </p>
                <p className="mt-1 text-sm text-fg-muted">
                  {m.groups_preview_import_summary(
                    { channels: channels.length, playlists: 4, history: 32, groups: 3 },
                    { locale },
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={resetPreview}
                title={m.groups_preview_reset({}, { locale })}
                className="flex h-9 w-9 shrink-0 items-center justify-center border border-border text-fg-muted transition-colors hover:text-fg"
              >
                <RotateCcw size={15} aria-hidden="true" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric
                icon={<Users size={16} />}
                value={channels.length}
                label={m.groups_preview_channels({}, { locale })}
              />
              <Metric
                icon={<Layers size={16} />}
                value={groups.length}
                label={m.groups_preview_groups_label({}, { locale })}
              />
              <Metric
                icon={<Inbox size={16} />}
                value={ungroupedCount}
                label={m.groups_preview_ungrouped({}, { locale })}
              />
              <Metric
                icon={<Check size={16} />}
                value={`${coverage}%`}
                label={m.groups_preview_coverage({}, { locale })}
              />
            </div>
            <div className="h-2 overflow-hidden bg-surface-soft">
              <div className="h-full bg-accent" style={{ width: `${coverage}%` }} />
            </div>
            <div className="mt-1 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setPhase("organize")}
                className="inline-flex h-9 items-center justify-center gap-2 bg-fg px-4 text-xs font-medium text-app transition-colors hover:bg-fg-strong"
              >
                {m.groups_preview_organize({}, { locale })}{" "}
                <ArrowRight size={15} aria-hidden="true" />
              </button>
              <Link
                to="/subscriptions"
                className="inline-flex h-9 items-center justify-center border border-border px-4 text-xs text-fg-muted transition-colors hover:text-fg"
              >
                {m.groups_preview_view_subscriptions({}, { locale })}
              </Link>
            </div>
          </div>
          <div className="border border-border bg-surface p-5">
            <p className="text-xs tracking-[0.18em] text-fg-soft uppercase">
              {m.groups_preview_restored_groups({}, { locale })}
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {groups.map((group) => {
                const members = channels.filter((channel) => channel.groupIds.includes(group.id));
                return (
                  <div key={group.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-fg">{group.name}</p>
                      <p className="text-xs text-fg-muted">
                        {members.length === 1
                          ? m.groups_preview_channel_count({ count: members.length }, { locale })
                          : m.groups_preview_channel_count_plural(
                              { count: members.length },
                              { locale },
                            )}
                      </p>
                    </div>
                    <div className="flex -space-x-2">
                      {members.slice(0, 3).map((member) => (
                        <ChannelAvatar
                          key={member.id}
                          src=""
                          name={member.name}
                          className="h-7 w-7"
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {phase === "organize" && (
        <section className="grid gap-4 lg:grid-cols-[248px_minmax(0,1fr)]">
          <aside className="flex flex-col gap-4 border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs tracking-[0.18em] text-fg-soft uppercase">
                {m.groups_preview_groups_label({}, { locale })}
              </p>
              <button
                type="button"
                onClick={() => setGroupFormOpen((open) => !open)}
                title={
                  groupFormOpen
                    ? m.groups_preview_close_new_group({}, { locale })
                    : m.groups_preview_create_group({}, { locale })
                }
                className="flex h-8 w-8 items-center justify-center border border-border text-fg-muted transition-colors hover:text-fg"
              >
                {groupFormOpen ? <X size={14} /> : <Plus size={15} />}
              </button>
            </div>
            {groupFormOpen && (
              <form
                className="flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  createGroup();
                }}
              >
                <input
                  value={groupName}
                  onChange={(event) => setGroupName(event.target.value)}
                  placeholder={m.groups_preview_group_name({}, { locale })}
                  className="h-9 min-w-0 flex-1 border border-border bg-app px-2 text-sm text-fg outline-none placeholder:text-fg-soft focus:border-fg-soft"
                />
                <button
                  type="submit"
                  disabled={groupName.trim().length === 0}
                  className="h-9 w-9 shrink-0 bg-fg text-app transition-colors hover:bg-fg-strong disabled:opacity-40"
                  title={m.groups_preview_create_group({}, { locale })}
                >
                  <Check size={15} className="mx-auto" />
                </button>
              </form>
            )}
            <BucketButton
              active={bucket === "ungrouped"}
              count={ungroupedCount}
              onClick={() => setBucket("ungrouped")}
              icon={<Inbox size={14} />}
            >
              {m.groups_preview_ungrouped({}, { locale })}
            </BucketButton>
            <div className="flex flex-col gap-1">
              {groups.map((group) => (
                <BucketButton
                  key={group.id}
                  active={bucket === group.id}
                  count={channels.filter((channel) => channel.groupIds.includes(group.id)).length}
                  onClick={() => setBucket(group.id)}
                >
                  {group.name}
                </BucketButton>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setBucket("all")}
              className={`h-9 border px-3 text-left text-xs transition-colors ${
                bucket === "all"
                  ? "border-fg text-fg"
                  : "border-transparent text-fg-muted hover:text-fg"
              }`}
            >
              {m.groups_preview_all_channels({ count: channels.length }, { locale })}
            </button>
          </aside>

          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-col gap-3 border border-border bg-surface p-3 sm:flex-row sm:items-center">
              <label className="flex h-9 min-w-0 flex-1 items-center gap-2 border border-border bg-app px-2">
                <Search size={14} className="shrink-0 text-fg-soft" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={m.groups_preview_search({}, { locale })}
                  className="min-w-0 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-fg-soft"
                />
              </label>
              <button
                type="button"
                onClick={() => setVisibleSelected(selected.size !== visibleChannels.length)}
                className="h-9 border border-border px-3 text-xs text-fg-muted transition-colors hover:text-fg"
              >
                {selected.size === visibleChannels.length && visibleChannels.length > 0
                  ? m.groups_preview_clear_page({}, { locale })
                  : m.groups_preview_select_visible({}, { locale })}
              </button>
              <button
                type="button"
                onClick={() => setPhase("done")}
                className="h-9 bg-fg px-3 text-xs font-medium text-app transition-colors hover:bg-fg-strong"
              >
                {m.groups_preview_finish({}, { locale })}
              </button>
            </div>

            <div className="overflow-hidden border border-border">
              {visibleChannels.map((channel, index) => {
                const isSelected = selected.has(channel.id);
                return (
                  <div
                    key={channel.id}
                    className={`flex min-w-0 flex-col gap-2 border-border px-3 py-3 transition-colors sm:flex-row sm:items-center ${
                      index === 0 ? "" : "border-t"
                    } ${isSelected ? "bg-surface-strong" : "bg-surface hover:bg-surface/70"}`}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleChannel(channel.id)}
                        aria-label={`${m.groups_preview_select_channel({}, { locale })} ${channel.name}`}
                        className="h-6 w-6 shrink-0 accent-blue-400 sm:h-4 sm:w-4"
                      />
                      <ChannelAvatar src="" name={channel.name} className="h-9 w-9" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-fg">{channel.name}</p>
                        <p className="truncate text-xs text-fg-soft">{channel.handle}</p>
                      </div>
                    </div>
                    <div className="flex min-w-0 flex-wrap gap-1 sm:max-w-[45%] sm:justify-end">
                      {channel.groupIds.length === 0 ? (
                        <span className="border border-border-strong px-2 py-1 text-[11px] text-fg-muted">
                          {m.groups_preview_no_group({}, { locale })}
                        </span>
                      ) : (
                        channel.groupIds.map((groupId) => (
                          <span
                            key={groupId}
                            className="inline-flex items-center gap-1 border border-border-strong px-2 py-1 text-[11px] text-fg-muted"
                          >
                            <span className="max-w-24 truncate">{groupNameById.get(groupId)}</span>
                            <button
                              type="button"
                              onClick={() => removeMembership(channel.id, groupId)}
                              title={m.groups_preview_remove_from_specific_group(
                                { group: groupNameById.get(groupId) ?? "" },
                                { locale },
                              )}
                              className="text-fg-soft transition-colors hover:text-danger"
                            >
                              <X size={11} aria-hidden="true" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
              {visibleChannels.length === 0 && (
                <div className="bg-surface px-4 py-8 text-center text-sm text-fg-muted">
                  {m.groups_preview_no_match({}, { locale })}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {phase === "done" && (
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex min-w-0 flex-col gap-4">
            <div className="border border-border bg-surface p-5">
              <p className="text-sm font-medium text-fg">
                {m.groups_preview_organization_updated({}, { locale })}
              </p>
              <div className="mt-4 h-2 overflow-hidden bg-surface-soft">
                <div className="h-full bg-accent" style={{ width: `${coverage}%` }} />
              </div>
              <p className="mt-2 text-xs text-fg-muted">
                {m.groups_preview_coverage_line(
                  { grouped: groupedCount, total: channels.length, coverage },
                  { locale },
                )}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {groups.map((group) => {
                const members = channels.filter((channel) => channel.groupIds.includes(group.id));
                return (
                  <div key={group.id} className="border border-border p-3">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm text-fg">{group.name}</p>
                      <span className="text-xs text-fg-muted">{members.length}</span>
                    </div>
                    <div className="mt-3 flex flex-col gap-2">
                      {members.slice(0, 3).map((member) => (
                        <div key={member.id} className="flex min-w-0 items-center gap-2">
                          <ChannelAvatar src="" name={member.name} className="h-6 w-6" />
                          <span className="truncate text-xs text-fg-muted">{member.name}</span>
                        </div>
                      ))}
                      {members.length > 3 && (
                        <p className="text-[11px] text-fg-soft">
                          {m.groups_preview_more({ count: members.length - 3 }, { locale })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col justify-between gap-4 border border-border bg-surface p-5">
            <div>
              <Metric
                icon={<Inbox size={16} />}
                value={ungroupedCount}
                label={m.groups_preview_ungrouped({}, { locale })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Link
                to="/subscriptions"
                className="inline-flex h-9 items-center justify-center bg-fg px-4 text-xs font-medium text-app transition-colors hover:bg-fg-strong"
              >
                {m.groups_preview_open_subscriptions({}, { locale })}
              </Link>
              <button
                type="button"
                onClick={() => setPhase("organize")}
                className="h-9 border border-border text-xs text-fg-muted transition-colors hover:text-fg"
              >
                {m.groups_preview_keep_organizing({}, { locale })}
              </button>
            </div>
          </div>
        </section>
      )}

      {phase === "organize" && selected.size > 0 && (
        <div className="sticky bottom-4 flex flex-col gap-3 border border-border-strong bg-surface-strong p-3 shadow-lg sm:flex-row sm:items-center">
          <p className="text-sm text-fg">
            {m.groups_preview_selected({ count: selected.size }, { locale })}
          </p>
          <div className="flex flex-wrap gap-2 sm:ml-auto">
            <GroupMenu
              action="add"
              groups={groups}
              open={menuAction === "add"}
              locale={locale}
              onToggle={() => setMenuAction(menuAction === "add" ? null : "add")}
              onPick={(groupId) => updateMemberships(groupId, "add")}
            />
            <GroupMenu
              action="remove"
              groups={groups}
              open={menuAction === "remove"}
              locale={locale}
              onToggle={() => setMenuAction(menuAction === "remove" ? null : "remove")}
              onPick={(groupId) => updateMemberships(groupId, "remove")}
            />
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="inline-flex h-9 items-center gap-2 border border-border px-3 text-xs text-fg-muted transition-colors hover:text-fg"
            >
              <X size={14} /> {m.groups_preview_clear({}, { locale })}
            </button>
          </div>
        </div>
      )}

      {toast && (
        <button
          type="button"
          onClick={() => setToast(null)}
          className="fixed right-4 bottom-20 border border-border-strong bg-surface-strong px-4 py-2 text-left text-xs text-fg shadow-lg sm:bottom-6"
        >
          {toast}
        </button>
      )}
    </div>
  );
}

function StepBar({ phase, locale }: { phase: Phase; locale: Locale }) {
  const steps = [
    m.groups_preview_import({}, { locale }),
    m.groups_preview_groups({}, { locale }),
    m.groups_preview_done({}, { locale }),
  ];
  const activeIndex = phase === "summary" ? 0 : phase === "organize" ? 1 : 2;
  return (
    <ol className="flex items-center gap-2 text-[11px] text-fg-soft">
      {steps.map((step, index) => (
        <li key={step} className="flex items-center gap-2">
          <span
            className={`flex h-6 w-6 items-center justify-center border ${
              index <= activeIndex ? "border-fg text-fg" : "border-border text-fg-soft"
            }`}
          >
            {index < activeIndex ? <Check size={12} /> : index + 1}
          </span>
          <span className={index <= activeIndex ? "text-fg-muted" : ""}>{step}</span>
          {index < steps.length - 1 && <span className="h-px w-5 bg-border-strong" />}
        </li>
      ))}
    </ol>
  );
}

function Metric({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
}) {
  return (
    <div className="border-l border-border pl-3">
      <div className="flex items-center gap-2 text-fg-soft">
        {icon}
        <span className="text-[11px] tracking-wide uppercase">{label}</span>
      </div>
      <p className="mt-2 text-lg font-semibold text-fg">{value}</p>
    </div>
  );
}

function BucketButton({
  active,
  count,
  icon,
  onClick,
  children,
}: {
  active: boolean;
  count: number;
  icon?: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex h-9 items-center gap-2 border px-3 text-left text-xs transition-colors ${
        active
          ? "border-fg bg-surface-strong text-fg"
          : "border-transparent text-fg-muted hover:text-fg"
      }`}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <span>{count}</span>
    </button>
  );
}

function GroupMenu({
  action,
  groups,
  open,
  locale,
  onToggle,
  onPick,
}: {
  action: MenuAction;
  groups: PreviewGroup[];
  open: boolean;
  locale: Locale;
  onToggle: () => void;
  onPick: (groupId: string) => void;
}) {
  const disabled = groups.length === 0;
  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={onToggle}
        aria-expanded={open}
        className={`inline-flex h-9 items-center gap-2 px-3 text-xs transition-colors ${
          action === "add"
            ? "bg-fg text-app hover:bg-fg-strong disabled:opacity-40"
            : "border border-border text-fg-muted hover:text-fg disabled:opacity-40"
        }`}
      >
        {action === "add" ? <Plus size={14} /> : <X size={14} />}
        {action === "add"
          ? m.groups_preview_add_to_group({}, { locale })
          : m.groups_preview_remove_from_group({}, { locale })}
        <ChevronDown size={13} />
      </button>
      {open && !disabled && (
        <div className="absolute right-0 bottom-11 z-20 w-52 border border-border-strong bg-surface p-1 shadow-xl">
          {groups.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => onPick(group.id)}
              className="flex h-8 w-full items-center justify-between px-2 text-left text-xs text-fg-muted transition-colors hover:bg-surface-soft hover:text-fg"
            >
              {group.name}
              <Check size={12} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
