import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "../hooks/use-auth";
import { useInstance } from "../hooks/use-instance";
import { useSettings } from "../hooks/use-settings";
import {
  getStoredSettingsSection,
  isSettingsSection,
  rememberSettingsSection,
  type SettingsSection,
} from "../lib/settings-section";
import { SettingsAbout } from "../settings/settings-about";
import { SettingsBackup } from "../settings/settings-backup";
import { SettingsBlocked } from "../settings/settings-blocked";
import { SettingsLandingPage } from "../settings/settings-landing-page";
import { SettingsLanguage } from "../settings/settings-language";
import { SettingsNav } from "../settings/settings-nav";
import { SettingsPlayback } from "../settings/settings-playback";
import { SettingsPrivacy } from "../settings/settings-privacy";
import { SettingsRss } from "../settings/settings-rss";
import { SettingsService } from "../settings/settings-service";
import { SettingsVideoPreferences } from "../settings/settings-video-preferences";

type Item = {
  key: SettingsSection;
  label: string;
};

type SettingsSearch = {
  section: SettingsSection;
  rssChannel?: string;
  compose?: boolean;
};

const BASE_ITEMS: Item[] = [
  { key: "playback", label: "Playback" },
  { key: "video", label: "Video" },
  { key: "home", label: "Interface" },
  { key: "service", label: "Service" },
  { key: "import", label: "Import" },
  { key: "privacy", label: "Privacy" },
  { key: "blocked", label: "Blocked" },
  { key: "about", label: "About" },
];

function settingsItems(showLanguage: boolean, showRss: boolean): Item[] {
  const items = showLanguage
    ? [
        BASE_ITEMS[0],
        BASE_ITEMS[1],
        BASE_ITEMS[2],
        { key: "language", label: "Language" } as Item,
        ...BASE_ITEMS.slice(3),
      ]
    : [...BASE_ITEMS];
  if (showRss) items.splice(items.length - 1, 0, { key: "rss", label: "RSS" });
  return items;
}

function SettingsPage() {
  const { settings } = useSettings();
  const { authReady, isAuthed, isGuest } = useAuth();
  const instance = useInstance();
  const { section, rssChannel, compose } = Route.useSearch();
  const navigate = useNavigate({ from: "/settings" });
  const showRss = instance.data?.rss.enabled === true && isAuthed && !isGuest;
  const items = settingsItems(settings.defaultService === 0, showRss);
  const pendingRssDecision = section === "rss" && (!authReady || instance.isPending);
  const activeSection = pendingRssDecision
    ? "rss"
    : items.some((item) => item.key === section)
      ? section
      : items[0].key;

  useEffect(() => {
    if (section === activeSection) return;
    navigate({ search: { section: activeSection }, replace: true });
  }, [activeSection, navigate, section]);

  useEffect(() => {
    rememberSettingsSection(activeSection);
  }, [activeSection]);

  return (
    <div className="flex flex-col gap-5 [animation:page-fade-in_0.2s_ease-out]">
      <h1 className="text-lg font-semibold text-fg">Settings</h1>
      <SettingsNav
        items={items}
        active={activeSection}
        onSelect={(next) => navigate({ search: { section: next } })}
      />
      {activeSection === "playback" && <SettingsPlayback />}
      {activeSection === "video" && <SettingsVideoPreferences />}
      {activeSection === "home" && <SettingsLandingPage />}
      {activeSection === "language" && settings.defaultService === 0 && <SettingsLanguage />}
      {activeSection === "service" && <SettingsService />}
      {activeSection === "import" && <SettingsBackup />}
      {activeSection === "privacy" && <SettingsPrivacy />}
      {activeSection === "blocked" && <SettingsBlocked />}
      {activeSection === "rss" && showRss && (
        <SettingsRss initialChannel={rssChannel ?? null} openComposer={compose === true} />
      )}
      {activeSection === "rss" && pendingRssDecision && (
        <div className="rounded-lg border border-border bg-surface px-4 py-5 text-sm text-fg-muted">
          Loading RSS settings...
        </div>
      )}
      {activeSection === "about" && <SettingsAbout />}
    </div>
  );
}

export const Route = createFileRoute("/settings")({
  validateSearch: (search: Record<string, unknown>): SettingsSearch => {
    const result: SettingsSearch = {
      section: isSettingsSection(search.section) ? search.section : getStoredSettingsSection(),
    };
    if (typeof search.rssChannel === "string") result.rssChannel = search.rssChannel;
    if (search.compose === true || search.compose === "true") result.compose = true;
    return result;
  },
  component: SettingsPage,
});
