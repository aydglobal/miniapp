import { useMutation, useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import { queryClient } from "../lib/queryClient";
import type { ChestResponse, OpenChestResponse } from "../types";

export function useChests() {
  return useQuery({
    queryKey: ["chests"],
    queryFn: () => apiFetch<ChestResponse>("/chests"),
  });
}

export function useOpenChest() {
  return useMutation({
    mutationFn: (chestId: string) =>
      apiFetch<OpenChestResponse>(`/chests/${chestId}/open`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chests"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
