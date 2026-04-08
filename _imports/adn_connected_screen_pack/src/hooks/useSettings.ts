import { useMutation, useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import { queryClient } from "../lib/queryClient";
import type { SettingsResponse } from "../types";

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => apiFetch<SettingsResponse>("/settings"),
  });
}

export function useSaveSettings() {
  return useMutation({
    mutationFn: (settings: SettingsResponse["settings"]) =>
      apiFetch<{ success: boolean }>("/settings", {
        method: "POST",
        body: JSON.stringify(settings),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}
