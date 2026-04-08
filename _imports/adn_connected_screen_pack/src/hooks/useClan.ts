import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import type { ClanResponse } from "../types";

export function useClan() {
  return useQuery({
    queryKey: ["clan"],
    queryFn: () => apiFetch<ClanResponse>("/clan"),
  });
}
