import { useMutation, useQuery } from "@tanstack/react-query";
import { adminFetch } from "../lib/adminApi";
import { queryClient } from "../lib/queryClient";

export function useAdminCampaigns() {
  return useQuery({
    queryKey: ["admin", "campaigns"],
    queryFn: () => adminFetch<any>("/admin/campaigns"),
  });
}

export function useTriggerAdminCampaign() {
  return useMutation({
    mutationFn: (key: string) => adminFetch<any>(`/admin/campaigns/${key}/trigger`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "campaigns"] }),
  });
}
