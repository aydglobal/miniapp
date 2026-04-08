import { useMutation, useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import { queryClient } from "../lib/queryClient";
import type { PrestigeSummaryResponse } from "../types";

export function usePrestigeSummary() {
  return useQuery({
    queryKey: ["prestige", "summary"],
    queryFn: () => apiFetch<PrestigeSummaryResponse>("/prestige/summary"),
  });
}

export function useActivatePrestige() {
  return useMutation({
    mutationFn: () =>
      apiFetch<{ success: boolean; message?: string }>("/prestige/activate", {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["prestige", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["shop"] });
    },
  });
}
