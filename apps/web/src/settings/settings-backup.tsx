import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Upload } from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { Toast } from "../components/toast";
import {
  downloadTypeTypeBackup,
  restoreTypeType,
  type TypeTypeBackupCategory,
} from "../lib/api-restore";
import { goto } from "../lib/route-redirect";
import { m } from "../paraglide/messages.js";

const SECTION_LABEL = "px-1 text-xs font-medium uppercase tracking-wider text-fg-soft";
function backupCategories(): { value: TypeTypeBackupCategory; label: string }[] {
  return [
    { value: "subscriptions", label: m.portability_category_subscriptions() },
    { value: "history", label: m.portability_category_history() },
    { value: "playlists", label: m.portability_category_playlists() },
    { value: "watchLater", label: m.portability_category_watch_later() },
    { value: "favorites", label: m.portability_category_favorites() },
    { value: "progress", label: m.portability_category_progress() },
    { value: "searchHistory", label: m.portability_category_search_history() },
    { value: "savedPlaylists", label: m.portability_category_saved_playlists() },
    { value: "settings", label: m.portability_category_settings() },
    { value: "contentFilters", label: m.portability_category_content_filters() },
  ];
}

export function SettingsBackup() {
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [selectedCategories, setSelectedCategories] = useState<TypeTypeBackupCategory[]>(
    backupCategories().map((item) => item.value),
  );
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const exportBackup = useMutation({
    mutationFn: () => downloadTypeTypeBackup(selectedCategories),
    onSuccess: () => setToast(m.ui_export_completed()),
    onError: () => setToast(m.portability_export_failed()),
  });
  const importBackup = useMutation({
    mutationFn: restoreTypeType,
    onSuccess: (summary) => {
      const count = Object.values(summary.restored).reduce((total, value) => total + value, 0);
      setToast(m.ui_backup_restored({ count }));
      void queryClient.invalidateQueries();
    },
    onError: () => setToast(m.ui_restore_failed()),
  });

  function toggleCategory(category: TypeTypeBackupCategory) {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    );
  }

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) importBackup.mutate(file);
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-3">
        <p className={SECTION_LABEL}>{m.ui_typetype_backup()}</p>
        <div className="border-y border-border">
          <div className="grid grid-cols-1 gap-x-4 gap-y-2 border-b border-border py-4 sm:grid-cols-2">
            {backupCategories().map((category) => (
              <label
                key={category.value}
                className="flex cursor-pointer items-center gap-2 text-sm text-fg-muted"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.value)}
                  onChange={() => toggleCategory(category.value)}
                  className="h-4 w-4 accent-fg"
                />
                {category.label}
              </label>
            ))}
          </div>
          <div className="flex flex-col gap-2 py-4 sm:flex-row">
            <button
              type="button"
              disabled={selectedCategories.length === 0 || exportBackup.isPending}
              onClick={() => exportBackup.mutate()}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-sm bg-fg px-3 text-xs font-medium text-app transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Download size={15} />
              {m.ui_export_selected()}
            </button>
            <button
              type="button"
              disabled={importBackup.isPending}
              onClick={() => fileInput.current?.click()}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-sm border border-border-strong px-3 text-xs text-fg transition-colors hover:border-fg-soft disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Upload size={15} />
              {m.ui_restore_backup()}
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={selectFile}
            />
          </div>
          <p className="border-t border-border py-3 text-xs text-fg-soft">
            {m.ui_restoring_replaces_the_categories_included_in_the_backup()}
          </p>
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <p className={SECTION_LABEL}>{m.data_portability_title()}</p>
        <div className="flex min-w-0 flex-col items-start gap-3 border-y border-border py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-fg">{m.ui_move_data_between_supported_apps()}</span>
            <span className="text-xs text-fg-soft">
              {m.ui_preview_imports_or_create_a_compatible_export()}
            </span>
          </div>
          <button
            type="button"
            onClick={() => goto("/import")}
            className="h-9 w-full rounded-sm border border-border-strong px-3 text-xs text-fg-muted transition-colors hover:border-fg-soft hover:text-fg sm:w-auto"
          >
            {m.ui_open_data_transfer()}
          </button>
        </div>
      </section>
      <Toast message={toast} />
    </div>
  );
}
