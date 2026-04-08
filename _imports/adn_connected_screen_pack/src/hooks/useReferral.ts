import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import type { ReferralResponse } from "../types";

export function useReferral() {
  return useQuery({
    queryKey: ["referral"],
    queryFn: () => apiFetch<ReferralResponse>("/referral"),
  });
}
