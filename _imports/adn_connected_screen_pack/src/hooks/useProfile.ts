import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import type { ProfileDto } from "../types";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => apiFetch<ProfileDto>("/profile"),
  });
}
