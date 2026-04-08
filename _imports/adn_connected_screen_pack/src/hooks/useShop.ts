import { useMutation, useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import type { ShopDto } from "../types";
import { queryClient } from "../lib/queryClient";

export function useShop() {
  return useQuery({
    queryKey: ["shop"],
    queryFn: () => apiFetch<ShopDto>("/shop"),
  });
}

export function usePurchaseShopItem() {
  return useMutation({
    mutationFn: (itemId: string) =>
      apiFetch<{ success: boolean; message?: string }>(`/shop/purchase`, {
        method: "POST",
        body: JSON.stringify({ itemId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
