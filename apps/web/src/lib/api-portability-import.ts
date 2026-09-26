import { authed } from "./authed";
import { API_BASE } from "./env";
import {
  clearPortabilityPreparationProgress,
  setPortabilityPreparationProgress,
} from "./portability-preparation-progress";
import { prepareYoutubeTakeout } from "./prepare-youtube-takeout";
import { clearPreparedTakeout } from "./youtube-takeout-prepared-store";
import { portabilityResponse } from "./api-portability-response";
import type { PortabilityJob } from "./api-portability";

export type PortabilityImportOptions = {
  ownerId?: string;
  preparedFile?: File;
  onPrepared?: (file: File) => void;
  onAccepted?: (job: PortabilityJob) => void;
};

export async function startPortabilityImport(
  file: File,
  format: string,
  options: PortabilityImportOptions = {},
): Promise<PortabilityJob> {
  const ownerId = options.ownerId;
  try {
    if (format === "youtube-takeout") {
      file =
        options.preparedFile ??
        (await prepareYoutubeTakeout(file, {
          ownerId,
          onProgress: (progress) => {
            if (ownerId) setPortabilityPreparationProgress({ ownerId, ...progress });
          },
        }));
      options.onPrepared?.(file);
    }
    if (ownerId) {
      setPortabilityPreparationProgress({
        ownerId,
        phase: "uploading",
        processed: 0,
        total: null,
      });
    }
    const body = new FormData();
    body.append("file", file);
    const job = await portabilityResponse<PortabilityJob>(
      await authed(
        API_BASE + "/portability/imports?format=" + encodeURIComponent(format),
        { method: "POST", body },
      ),
    );
    options.onAccepted?.(job);
    if (ownerId && format === "youtube-takeout") await clearPreparedTakeout(ownerId);
    return job;
  } finally {
    if (ownerId) clearPortabilityPreparationProgress(ownerId);
  }
}
