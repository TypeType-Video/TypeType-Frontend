import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelPortabilityJob,
  deletePortabilityJob,
  getPortabilityJob,
  type PortabilityJob,
} from "../lib/api-portability";

const TERMINAL_STATES = new Set(["ready", "completed", "failed", "cancelled"]);

export function usePortabilityJob(id: string | null) {
  const queryClient = useQueryClient();
  const key = ["portability-job", id] as const;
  const query = useQuery({
    queryKey: key,
    queryFn: () => getPortabilityJob(id as string),
    enabled: id !== null,
    refetchInterval: (current) =>
      current.state.data && TERMINAL_STATES.has(current.state.data.state) ? false : 1_000,
  });
  const cancel = useMutation({
    mutationFn: () => cancelPortabilityJob(id as string),
    onSuccess: (job) => queryClient.setQueryData<PortabilityJob>(key, job),
  });
  const remove = useMutation({
    mutationFn: () => deletePortabilityJob(id as string),
    onSuccess: () => queryClient.removeQueries({ queryKey: key }),
  });
  return { ...query, cancel, remove };
}
