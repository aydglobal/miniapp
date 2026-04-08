import { useMutation, useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import { queryClient } from "../lib/queryClient";
import type { MissionsResponse } from "../types";

export function useMissions() {
  return useQuery({
    queryKey: ["missions"],
    queryFn: () => apiFetch<MissionsResponse>("/missions"),
  });
}

export function useClaimMission() {
  return useMutation({
    mutationFn: (missionId: string) =>
      apiFetch<{ success: boolean; message?: string }>(`/missions/${missionId}/claim`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["missions"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
