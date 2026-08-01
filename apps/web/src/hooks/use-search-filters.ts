import { useQuery } from "@tanstack/react-query";
import { fetchSearchFilters } from "../lib/api-discovery";

export function useSearchFilters(service: number, contentFilter?: string) {
  return useQuery({
    queryKey: ["search-filters", service, contentFilter ?? ""],
    queryFn: () => fetchSearchFilters(service, contentFilter),
    staleTime: 60 * 60 * 1000,
  });
}
