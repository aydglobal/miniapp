import { useFeedbackLayer } from "../frontend/feedback/useFeedbackLayer";
import { gameBus } from "../frontend/lib/gameBus";

export default function AppIntegrationExample() {
  useFeedbackLayer();

  async function onTap() {
    gameBus.emit("tap");
    const response = await Promise.resolve({ isCrit: Math.random() < 0.05 });
    if (response.isCrit) {
      gameBus.emit("crit");
    }
  }

  async function onLevelUp() {
    gameBus.emit("level_up");
  }

  async function onChestOpen() {
    gameBus.emit("chest_open", { rarity: "legendary", jackpot: false });
  }

  return null;
}
