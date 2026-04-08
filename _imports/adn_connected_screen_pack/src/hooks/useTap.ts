import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import type { TapDto } from "../types";

export function useTap() {
  return useMutation({
    mutationFn: () => apiFetch<TapDto>("/game/tap", { method: "POST" }),
  });
}
