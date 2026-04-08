import { useState } from "react";
import AdminShell from "../ui/AdminShell";
import AdminCard from "../ui/AdminCard";
import { useAdminTuning, useSaveAdminTuning } from "../hooks/useAdminTuning";

export default function AdminTuningPage() {
  const tuning = useAdminTuning();
  const save = useSaveAdminTuning();
  const [local, setLocal] = useState<any>(null);

  if (tuning.isLoading) return <AdminShell><div>Loading...</div></AdminShell>;
  if (tuning.isError || !tuning.data) return <AdminShell><div>Error loading tuning.</div></AdminShell>;

  const data = local || tuning.data.data;

  return (
    <AdminShell>
      <AdminCard title="Live Tuning" subtitle="Tap, economy ve loot çarpanlarını canlı güncelle">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            Base Reward
            <input
              className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3"
              type="number"
              value={data.tap.baseReward}
              onChange={(e) =>
                setLocal({
                  ...data,
                  tap: { ...data.tap, baseReward: Number(e.target.value) },
                })
              }
            />
          </label>

          <label className="text-sm">
            Crit Chance
            <input
              className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3"
              type="number"
              step="0.001"
              value={data.tap.critChance}
              onChange={(e) =>
                setLocal({
                  ...data,
                  tap: { ...data.tap, critChance: Number(e.target.value) },
                })
              }
            />
          </label>

          <label className="text-sm">
            Shop Price Multiplier
            <input
              className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3"
              type="number"
              step="0.05"
              value={data.economy.shopPriceMultiplier}
              onChange={(e) =>
                setLocal({
                  ...data,
                  economy: { ...data.economy, shopPriceMultiplier: Number(e.target.value) },
                })
              }
            />
          </label>

          <label className="text-sm">
            Jackpot Chance
            <input
              className="mt-1 w-full rounded-xl bg-white/5 px-3 py-3"
              type="number"
              step="0.0001"
              value={data.loot.jackpotChance}
              onChange={(e) =>
                setLocal({
                  ...data,
                  loot: { ...data.loot, jackpotChance: Number(e.target.value) },
                })
              }
            />
          </label>
        </div>

        <button
          onClick={() => save.mutate(data)}
          className="mt-4 rounded-[18px] bg-gradient-to-r from-[#46D7FF] to-[#8F6BFF] px-5 py-4 font-semibold text-[#050816]"
        >
          {save.isPending ? "Saving..." : "Save Live Tuning"}
        </button>
      </AdminCard>
    </AdminShell>
  );
}
