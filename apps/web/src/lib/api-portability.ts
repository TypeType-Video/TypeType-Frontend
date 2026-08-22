import { ApiError } from "./api";
import { authed } from "./authed";
import { API_BASE } from "./env";

export type PortabilityDirection = "import" | "export";
export type PortabilityFidelity = "complete" | "partial";
export type PortabilityJobState =
  | "queued"
  | "analyzing"
  | "ready"
  | "applying"
  | "encoding"
  | "completed"
  | "failed"
  | "cancelled";
export type PortabilityCategory =
  | "subscriptions"
  | "subscriptionGroups"
  | "history"
  | "playlists"
  | "watchLater"
  | "favorites"
  | "progress"
  | "searchHistory"
  | "savedPlaylists"
  | "settings"
  | "contentFilters";

export type PortabilityFormatDescriptor = {
  format: string;
  adapterVersion: number;
  capabilities: {
    category: PortabilityCategory;
    directions: PortabilityDirection[];
    fidelity: PortabilityFidelity;
  }[];
  defaultExtension: string;
  contentType: string;
};

export type PortabilityIssue = {
  category: PortabilityCategory | null;
  code: string;
  message: string;
  count: number;
};

export type PortabilityPreview = {
  detection: {
    format: string;
    formatVersion: string | null;
    adapterVersion: number;
    confidence: number;
    evidence: string;
  };
  counts: Partial<Record<PortabilityCategory, number>>;
  duplicates: number;
  issues: PortabilityIssue[];
};

export type PortabilityJob = {
  id: string;
  kind: PortabilityDirection;
  state: PortabilityJobState;
  createdAt: number;
  updatedAt: number;
  preview: PortabilityPreview | null;
  result: Partial<Record<PortabilityCategory, number>> | null;
  progress: {
    phase: "analyzing" | "collecting" | "applying" | "encoding";
    unit: "records" | "categories" | "bytes";
    processed: number;
    total: number | null;
  } | null;
  errorCode: string | null;
};

async function portabilityResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const candidate = payload as { error?: string; code?: string } | null;
    throw new ApiError(
      candidate?.error ?? response.statusText ?? "Portability request failed",
      response.status,
      candidate?.code ?? null,
    );
  }
  return payload as T;
}

export async function getPortabilityFormats(): Promise<PortabilityFormatDescriptor[]> {
  return portabilityResponse(await authed(`${API_BASE}/portability/formats`));
}

export async function startPortabilityImport(file: File): Promise<PortabilityJob> {
  const body = new FormData();
  body.append("file", file);
  return portabilityResponse(
    await authed(`${API_BASE}/portability/imports`, { method: "POST", body }),
  );
}

export async function applyPortabilityImport(
  id: string,
  categories: PortabilityCategory[],
  duplicatePolicy: "skip" | "replace",
): Promise<PortabilityJob> {
  return portabilityResponse(
    await authed(`${API_BASE}/portability/jobs/${id}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categories, duplicatePolicy }),
    }),
  );
}

export async function startPortabilityExport(
  format: string,
  categories: PortabilityCategory[],
): Promise<PortabilityJob> {
  return portabilityResponse(
    await authed(`${API_BASE}/portability/exports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format, categories }),
    }),
  );
}

export async function getPortabilityJob(id: string): Promise<PortabilityJob> {
  return portabilityResponse(await authed(`${API_BASE}/portability/jobs/${id}`));
}

export async function cancelPortabilityJob(id: string): Promise<PortabilityJob> {
  return portabilityResponse(
    await authed(`${API_BASE}/portability/jobs/${id}/cancel`, { method: "POST" }),
  );
}

export async function deletePortabilityJob(id: string): Promise<void> {
  const response = await authed(`${API_BASE}/portability/jobs/${id}`, { method: "DELETE" });
  if (!response.ok) throw new ApiError(response.statusText, response.status);
}

function artifactName(response: Response): string {
  const disposition = response.headers.get("Content-Disposition") ?? "";
  return disposition.match(/filename="?([^";]+)"?/i)?.[1] ?? "typetype-export";
}

export async function downloadPortabilityArtifact(id: string): Promise<void> {
  const response = await authed(`${API_BASE}/portability/jobs/${id}/artifact`);
  if (!response.ok) await portabilityResponse(response);
  const url = URL.createObjectURL(await response.blob());
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = artifactName(response);
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
