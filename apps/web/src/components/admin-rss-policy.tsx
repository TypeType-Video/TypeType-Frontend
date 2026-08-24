import { useMemo } from "react";
import type { AdminSettings } from "../types/admin";
import { ToggleSwitch } from "./toggle-switch";

type Props = {
  value: AdminSettings;
  saved: AdminSettings;
  pending: boolean;
  onChange: (value: AdminSettings) => void;
  onSave: () => void;
};

const NUMBER_FIELDS = [
  ["rssMaxFeedsPerUser", "Feeds per account", 1, 100],
  ["rssMaxItems", "Items per feed", 1, 200],
  ["rssMinimumPollMinutes", "Minimum poll (minutes)", 1, 1440],
  ["rssRateLimitPerMinute", "Requests per minute", 1, 600],
] as const;

export function AdminRssPolicy({ value, saved, pending, onChange, onSave }: Props) {
  const changed = useMemo(() => JSON.stringify(value) !== JSON.stringify(saved), [saved, value]);
  const validUrl = !value.rssEnabled || isPublicHttpUrl(value.rssPublicBaseUrl);
  const validNumbers = NUMBER_FIELDS.every(
    ([key, , min, max]) => Number.isInteger(value[key]) && value[key] >= min && value[key] <= max,
  );

  return (
    <section className="space-y-4 border-y border-border py-4">
      <div className="flex items-center justify-between gap-4 px-1">
        <div>
          <h2 className="text-sm font-semibold text-fg">Instance policy</h2>
          <p className="mt-1 text-xs text-fg-soft">
            Disabling RSS keeps existing feed configuration intact.
          </p>
        </div>
        <ToggleSwitch
          checked={value.rssEnabled}
          ariaLabel="Enable private RSS feeds"
          onClick={() => onChange({ ...value, rssEnabled: !value.rssEnabled })}
        />
      </div>
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-fg-muted">Public instance URL</span>
        <input
          type="url"
          value={value.rssPublicBaseUrl ?? ""}
          placeholder="https://watch.example.com"
          onChange={(event) => onChange({ ...value, rssPublicBaseUrl: event.target.value || null })}
          className="h-10 w-full rounded-md border border-border-strong bg-surface px-3 text-sm text-fg outline-none focus:border-fg-soft"
        />
        {!validUrl && (
          <span className="block text-xs text-danger-strong">
            Enter the public HTTP or HTTPS URL of this instance.
          </span>
        )}
      </label>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {NUMBER_FIELDS.map(([key, label, min, max]) => (
          <label key={key} className="space-y-1.5">
            <span className="text-xs font-medium text-fg-muted">{label}</span>
            <input
              type="number"
              min={min}
              max={max}
              value={value[key]}
              onChange={(event) => {
                const next = event.target.valueAsNumber;
                if (!Number.isNaN(next)) onChange({ ...value, [key]: next });
              }}
              className="h-10 w-full rounded-md border border-border-strong bg-surface px-3 text-sm text-fg outline-none focus:border-fg-soft"
            />
          </label>
        ))}
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          disabled={!changed || !validUrl || !validNumbers || pending}
          onClick={onSave}
          className="h-9 rounded-md bg-fg px-4 text-sm font-medium text-app hover:bg-fg-strong disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? "Saving..." : "Save policy"}
        </button>
      </div>
    </section>
  );
}

function isPublicHttpUrl(value: string | null): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash
    );
  } catch {
    return false;
  }
}
