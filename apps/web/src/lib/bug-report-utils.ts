import { m } from "../paraglide/messages.js";
import type { BugReportCategory, BugReportStatus } from "../types/bug-report";

export function statusOptions(): { value: BugReportStatus; label: string }[] {
  return [
    { value: "new", label: m.ui_bug_status_new() },
    { value: "triaged", label: m.ui_bug_status_triaged() },
    { value: "in_progress", label: m.ui_bug_status_in_progress() },
    { value: "fixed", label: m.ui_bug_status_fixed() },
    { value: "closed", label: m.ui_bug_status_closed() },
  ];
}

export function categoryOptions(): { value: BugReportCategory; label: string }[] {
  return [
    { value: "player", label: m.ui_bug_category_player() },
    { value: "audio_language", label: m.ui_bug_category_audio_language() },
    { value: "subtitles", label: m.ui_bug_category_subtitles() },
    { value: "ui", label: m.ui_bug_category_interface() },
    { value: "functionality", label: m.ui_bug_category_functionality() },
  ];
}

export function bugReportStatusLabel(status: BugReportStatus): string {
  return statusOptions().find((option) => option.value === status)?.label ?? m.ui_status();
}

export function bugReportCategoryLabel(category: BugReportCategory): string {
  return categoryOptions().find((option) => option.value === category)?.label ?? m.ui_category();
}

export function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString();
}
