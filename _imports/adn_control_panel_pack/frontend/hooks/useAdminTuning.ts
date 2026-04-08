import { useMutation, useQuery } from "@tanstack/react-query";
import { adminFetch } from "../lib/adminApi";
import { queryClient } from "../lib/queryClient";

export function useAdminTuning() {
  return useQuery({
    queryKey: ["admin", "tuning"],
    queryFn: () => adminFetch<any>("/admin/tuning"),
  });
}

export function useSaveAdminTuning() {
  return useMutation({
    mutationFn: (payload: any) =>
      adminFetch<any>("/admin/tuning", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tuning"] });
    },
  });
}
