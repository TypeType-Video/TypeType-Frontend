import type { SettingsItem } from "../types/user";

type SettingsPatch = Partial<SettingsItem>;
type SendSettings = (settings: SettingsItem) => Promise<SettingsItem>;
type ApplySettings = (settings: SettingsItem) => void;

type PendingWrite = {
  patch: SettingsPatch;
};

/** Serializes full-state settings writes while preserving later optimistic patches. */
export class SettingsWriteQueue {
  private confirmed: SettingsItem | null = null;
  private nextId = 0;
  private pending = new Map<number, PendingWrite>();
  private tail: Promise<void> = Promise.resolve();

  stage(patch: SettingsPatch, base: SettingsItem): number {
    if (this.pending.size === 0) this.confirmed = { ...base };
    const id = this.nextId++;
    this.pending.set(id, { patch });
    return id;
  }

  execute(
    id: number,
    send: SendSettings,
    fallback: () => SettingsItem,
    apply: ApplySettings,
  ): Promise<SettingsItem> {
    const run = this.tail
      .catch(() => undefined)
      .then(async () => {
        const pending = this.pending.get(id);
        if (!pending) throw new Error("Settings write was not staged");

        const base = this.confirmed ?? fallback();
        const next = { ...base, ...pending.patch };
        try {
          const saved = await send(next);
          this.confirmed = saved;
          return saved;
        } finally {
          this.pending.delete(id);
          apply(this.snapshot(fallback));
        }
      });
    this.tail = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  snapshot(fallback: () => SettingsItem): SettingsItem {
    let current = this.confirmed ?? fallback();
    for (const { patch } of this.pending.values()) current = { ...current, ...patch };
    return current;
  }
}
