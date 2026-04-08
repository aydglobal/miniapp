import TapArena from "../components/TapArena";
import ChestRevealModal from "../components/ChestRevealModal";
import PrestigePanel from "../components/PrestigePanel";
import ClanWarCard from "../components/ClanWarCard";
import EventBanner from "../components/EventBanner";

export default function GameIntensityExample() {
  return (
    <div className="min-h-screen bg-black p-4 space-y-4">
      <EventBanner title="Lucky Chest Night" subtitle="Higher jackpot chance for 6 hours." countdown="05:12:09" />
      <TapArena />
      <PrestigePanel canPrestige={true} estimatedCore={7} estimatedPower={4} />
      <ClanWarCard clanName="ADN Nebula" rank={8} score={152300} nextRankGap={9400} />
      <ChestRevealModal open={false} onClose={() => {}} />
    </div>
  );
}
