import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import type { LeaderboardResponse } from "../types";

export function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard", "global"],
    queryFn: () => apiFetch<LeaderboardResponse>("/leaderboard/global"),
  });
}
