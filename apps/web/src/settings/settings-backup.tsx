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

const SECTION_LABEL = "px-1 text-xs font-medium uppercase tracking-wider text-fg-soft";
const CATEGORIES: { value: TypeTypeBackupCategory; label: string }[] = [
  { value: "subscriptions", label: "Subscriptions" },
  { value: "history", label: "Watch history" },
  { value: "playlists", label: "Playlists" },
  { value: "watchLater", label: "Watch later" },
  { value: "favorites", label: "Favorites" },
  { value: "progress", label: "Playback progress" },
  { value: "searchHistory", label: "Search history" },
  { value: "savedPlaylists", label: "Saved playlists" },
  { value: "settings", label: "Settings" },
  { value: "contentFilters", label: "Content filters" },
];

function message(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function SettingsBackup() {
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<TypeTypeBackupCategory[]>(
    CATEGORIES.map((item) => item.value),
  );
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const exportBackup = useMutation({
    mutationFn: () => downloadTypeTypeBackup(categories),
    onSuccess: () => setToast("Export completed"),
    onError: (error) => setToast(message(error, "Export failed")),
  });
  const importBackup = useMutation({
    mutationFn: restoreTypeType,
    onSuccess: (summary) => {
      const count = Object.values(summary.restored).reduce((total, value) => total + value, 0);
      setToast(`Backup restored: ${count} items`);
      void queryClient.invalidateQueries();
    },
    onError: (error) => setToast(message(error, "Restore failed")),
  });

  function toggleCategory(category: TypeTypeBackupCategory) {
    setCategories((current) =>
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
        <p className={SECTION_LABEL}>TypeType backup</p>
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="grid grid-cols-1 gap-x-4 gap-y-2 border-b border-border px-4 py-4 sm:grid-cols-2">
            {CATEGORIES.map((category) => (
              <label
                key={category.value}
                className="flex cursor-pointer items-center gap-2 text-sm text-fg-muted"
              >
                <input
                  type="checkbox"
                  checked={categories.includes(category.value)}
                  onChange={() => toggleCategory(category.value)}
                  className="h-4 w-4 accent-fg"
                />
                {category.label}
              </label>
            ))}
          </div>
          <div className="flex flex-col gap-2 px-4 py-4 sm:flex-row">
            <button
              type="button"
              disabled={categories.length === 0 || exportBackup.isPending}
              onClick={() => exportBackup.mutate()}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-fg px-3 text-xs font-medium text-app transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Download size={15} />
              Export selected
            </button>
            <button
              type="button"
              disabled={importBackup.isPending}
              onClick={() => fileInput.current?.click()}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border-strong bg-surface-strong px-3 text-xs text-fg transition-colors hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Upload size={15} />
              Restore backup
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={selectFile}
            />
          </div>
          <p className="border-t border-border px-4 py-3 text-xs text-fg-soft">
            Restoring replaces the categories included in the backup.
          </p>
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <p className={SECTION_LABEL}>Data portability</p>
        <div className="flex flex-col items-start gap-3 rounded-xl border border-border bg-surface px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-fg">Move data between supported apps</span>
            <span className="text-xs text-fg-soft">
              Preview imports or create a compatible export.
            </span>
          </div>
          <button
            type="button"
            onClick={() => goto("/import")}
            className="h-9 w-full rounded-md bg-surface-strong px-3 text-xs text-fg-muted transition-colors hover:text-fg sm:w-auto"
          >
            Open data transfer
          </button>
        </div>
      </section>
      <Toast message={toast} />
    </div>
  );
}
