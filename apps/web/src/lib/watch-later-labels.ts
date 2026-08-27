import { m } from "../paraglide/messages.js";

export function watchLaterActionLabel(saved: boolean): string {
  return saved ? m.watch_remove_later() : m.watch_save_later();
}

export function watchLaterResultLabel(saved: boolean): string {
  return saved ? m.watch_saved_later() : m.watch_removed_later();
}
