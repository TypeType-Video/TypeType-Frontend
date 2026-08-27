import type { YoutubeTakeoutImportJob } from "../lib/api-youtube-import";
import { m } from "../paraglide/messages.js";

export function importPhaseLabel(phase: string): string {
  if (phase === "analyzing") return m.ui_import_phase_analyzing();
  if (phase === "collecting") return m.ui_import_phase_collecting();
  if (phase === "applying") return m.ui_import_phase_applying();
  if (phase === "encoding") return m.ui_import_phase_encoding();
  return m.ui_import_phase_in_progress();
}

export function applyJobFeedback(job: YoutubeTakeoutImportJob): {
  toast: string;
  inlineError: string | null;
} {
  if (job.status === "completed")
    return { toast: m.portability_import_completed(), inlineError: null };
  if (job.status === "running" || job.status === "pending") {
    return { toast: m.ui_import_started_keep_window_open(), inlineError: null };
  }
  return {
    toast: m.portability_import_failed(),
    inlineError: m.portability_import_failed(),
  };
}
