import { useQuery } from "@tanstack/react-query";
import { fetchVersionInfo } from "../lib/api-version";

const VERSION_INFO_KEY = ["version-info"];

export function useVersionInfo() {
  return useQuery({
    queryKey: VERSION_INFO_KEY,
    queryFn: fetchVersionInfo,
    staleTime: 60_000,
  });
}
