import { useAdminSettings } from "../hooks/use-admin-settings";
import { m } from "../paraglide/messages.js";
import type { AdminSettings } from "../types/admin";
import { AdminSettingsPanel } from "./admin-settings-panel";

type Props = {
  enabled: boolean;
  onToast: (message: string) => void;
};

export function AdminSettingsSection({ enabled, onToast }: Props) {
  const adminSettings = useAdminSettings(enabled);

  function updateSettings(next: AdminSettings) {
    adminSettings.update.mutate(next, {
      onSuccess: () => onToast(m.ui_admin_settings_updated()),
      onError: () => onToast(m.ui_unable_to_update_admin_settings()),
    });
  }

  if (adminSettings.query.isPending) {
    return (
      <section className="rounded-lg border border-border bg-surface/70 p-3 text-sm text-fg-muted">
        {m.ui_loading_admin_settings()}
      </section>
    );
  }

  if (adminSettings.query.isError) {
    return (
      <section className="rounded-lg border border-danger bg-danger/30 p-3 text-sm text-danger-strong">
        {m.ui_unable_to_load_admin_settings_2()}
      </section>
    );
  }

  if (!adminSettings.query.data) return null;

  return (
    <AdminSettingsPanel
      settings={adminSettings.query.data}
      pending={adminSettings.update.isPending}
      onSave={updateSettings}
    />
  );
}
