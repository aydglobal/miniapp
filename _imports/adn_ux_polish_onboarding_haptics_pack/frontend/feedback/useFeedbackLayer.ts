import { useEffect } from "react";
import { gameBus } from "../lib/gameBus";
import { playHaptic } from "../haptics/haptics";
import { playSfx } from "../audio/audioEngine";

export function useFeedbackLayer() {
  useEffect(() => {
    const offTap = gameBus.on("tap", () => {
      playHaptic("light");
      playSfx("tap");
    });

    const offCrit = gameBus.on("crit", () => {
      playHaptic("medium");
      playSfx("crit");
    });

    const offLevel = gameBus.on("level_up", () => {
      playHaptic("success");
      playSfx("level_up");
    });

    const offChest = gameBus.on("chest_open", (payload: any) => {
      playHaptic(payload?.rarity === "legendary" || payload?.rarity === "mythic" ? "heavy" : "medium");
      playSfx(payload?.jackpot ? "jackpot" : payload?.rarity === "legendary" || payload?.rarity === "mythic" ? "legendary" : "chest_open");
    });

    const offError = gameBus.on("error", () => {
      playHaptic("warning");
      playSfx("error");
    });

    return () => {
      offTap();
      offCrit();
      offLevel();
      offChest();
      offError();
    };
  }, []);
}
