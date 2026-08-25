import { useEffect, useState } from "react";

export function usePersistedPortabilityJob(
  storageKey: string,
): [string | null, (jobId: string | null) => void] {
  const [jobId, setJobId] = useState<string | null>(() =>
    typeof window === "undefined" ? null : window.localStorage.getItem(storageKey),
  );

  useEffect(() => {
    if (jobId) window.localStorage.setItem(storageKey, jobId);
    else window.localStorage.removeItem(storageKey);
  }, [jobId, storageKey]);

  return [jobId, setJobId];
}
