import { useMutation, useQuery } from "@tanstack/react-query";
import { adminFetch } from "../lib/adminApi";
import { queryClient } from "../lib/queryClient";

export function useAdminEvents() {
  return useQuery({
    queryKey: ["admin", "events"],
    queryFn: () => adminFetch<any>("/admin/events"),
  });
}

export function useStartAdminEvent() {
  return useMutation({
    mutationFn: (key: string) => adminFetch<any>(`/admin/events/${key}/start`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "events"] }),
  });
}

export function useStopAdminEvent() {
  return useMutation({
    mutationFn: (key: string) => adminFetch<any>(`/admin/events/${key}/stop`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "events"] }),
  });
}
