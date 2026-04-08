import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "../lib/adminApi";

export function useAdminAnalytics() {
  return useQuery({
    queryKey: ["admin", "analytics", "summary"],
    queryFn: () => adminFetch<any>("/admin/analytics/summary"),
  });
}
