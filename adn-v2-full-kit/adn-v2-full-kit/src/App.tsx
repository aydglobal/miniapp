import React, { useEffect, useMemo, useState } from "react";
import AppShell from "./components/layout/AppShell";
import BottomNav from "./components/layout/BottomNav";
import Button from "./components/ui/Button";
import Card from "./components/ui/Card";
import ProgressBar from "./components/ui/ProgressBar";
import StatCard from "./components/ui/StatCard";
import TapCore from "./components/ui/TapCore";
import RbrtPanel from "./components/ui/RbrtPanel";
import EventBanner from "./components/ui/EventBanner";
import MissionCard from "./components/ui/MissionCard";
import MarketCard from "./components/ui/MarketCard";
import BoostCard from "./components/ui/BoostCard";
import { formatNumber } from "./lib/format";

type Tab = "home" | "tasks" | "market" | "boost" | "profile";

export default function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [coins, setCoins] = useState(500);
  const [energy, setEnergy] = useState(100);
  const [combo, setCombo] = useState(1);
  const [tapPower, setTapPower] = useState(1);
  const [passive, setPassive] = useState(2);
  const [rbrt, setRbrt] = useState(0);
  const [floatingGain, setFloatingGain] = useState<number | null>(null);

  const incomePerTap = useMemo(() => tapPower * combo * (1 + rbrt * 0.2), [tapPower, combo, rbrt]);

  useEffect(() => {
    const i = setInterval(() => {
      setCoins((v) => v + passive * (1 + rbrt * 0.15));
      setEnergy((v) => Math.min(100, v + 1.5));
      setCombo((v) => Math.max(1, +(v - 0.02).toFixed(2)));
    }, 1000);
    return () => clearInterval(i);
  }, [passive, rbrt]);

  const onTap = () => {
    if (energy < 2) return;
    const gain = Number(incomePerTap.toFixed(1));
    setCoins((v) => v + gain);
    setEnergy((v) => Math.max(0, v - 2));
    setCombo((v) => Math.min(5, +(v + 0.08).toFixed(2)));
    setFloatingGain(gain);
    setTimeout(() => setFloatingGain(null), 550);
  };

  const upgradeTapCost = 120 + tapPower * 75;
  const upgradePassiveCost = 200 + passive * 120;
  const rbrtGain = Math.floor(Math.sqrt(coins / 1000));
  const rbrtProgress = Math.min(100, (coins / 1000) * 100);
  const rbrtReady = rbrtGain >= 1;

  const doRbrt = () => {
    if (!rbrtReady) return;
    setRbrt((v) => v + rbrtGain);
    setCoins(350);
    setEnergy(100);
    setCombo(1);
    setTapPower(1);
    setPassive(2);
  };

  return (
    <AppShell
      title="ADN Arena v2"
      subtitle="Dark. Neon. Premium. Oyun hissi maksimum."
    >
      <div className="space-y-4 pb-24">
        <EventBanner
          title="Cache Rush"
          subtitle="Boosted rewards, premium visuals, stronger urgency."
          timeLeft="02:14:39"
        />

        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <Card strong className="p-5 md:p-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard label="Balance" value={`${formatNumber(coins)} ADN`} help="Current reserve" rightBadge={`x${combo.toFixed(2)}`} />
              <StatCard label="Tap Income" value={`${incomePerTap.toFixed(1)}`} help="Per tap" rightBadge={`${energy.toFixed(0)} Energy`} />
              <StatCard label="RBRT Power" value={`+${rbrt}`} help="Permanent gain" rightBadge={rbrtReady ? "Ready" : "Charging"} />
            </div>
          </Card>

          <RbrtPanel gain={rbrtGain} ready={rbrtReady} progress={rbrtProgress} onReboot={doRbrt} />
        </div>

        <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
          <Card className="p-6">
            <div className="flex flex-col items-center justify-center">
              <div className="adn-label mb-4">Tap Core</div>
              <TapCore onTap={onTap} floatingGain={floatingGain} />
              <div className="mt-5 w-full max-w-sm">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted">Energy</span>
                  <span className="font-medium text-text">{energy.toFixed(0)} / 100</span>
                </div>
                <ProgressBar value={energy} variant="primary" />
              </div>
            </div>
          </Card>

          <div className="grid gap-4">
            <Card className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="adn-label">Upgrades</div>
                  <div className="mt-2 text-xl font-bold" style={{ color: "#e8f4ff" }}>Build Your Income Engine</div>
                  <p className="mt-1 text-sm" style={{ color: "#8ba8cc" }}>Yükseltmeleri kontrollü ve premium hisle sun.</p>
                </div>
                <div className="adn-badge adn-badge-gold">Growth</div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Card className="p-4">
                  <div className="adn-label">Tap Power</div>
                  <div className="mt-2 text-2xl font-bold" style={{ color: "#e8f4ff" }}>{tapPower}</div>
                  <div className="mt-1 text-sm" style={{ color: "#8ba8cc" }}>Her tık gelirini artırır.</div>
                  <Button
                    variant="primary"
                    className="mt-4 w-full"
                    disabled={coins < upgradeTapCost}
                    onClick={() => {
                      if (coins < upgradeTapCost) return;
                      setCoins((v) => v - upgradeTapCost);
                      setTapPower((v) => v + 1);
                    }}
                  >
                    Upgrade · {formatNumber(upgradeTapCost)}
                  </Button>
                </Card>

                <Card className="p-4">
                  <div className="adn-label">Passive Income</div>
                  <div className="mt-2 text-2xl font-bold" style={{ color: "#e8f4ff" }}>{passive.toFixed(1)}/s</div>
                  <div className="mt-1 text-sm" style={{ color: "#8ba8cc" }}>Arka planda ADN üretir.</div>
                  <Button
                    variant="gold"
                    className="mt-4 w-full"
                    disabled={coins < upgradePassiveCost}
                    onClick={() => {
                      if (coins < upgradePassiveCost) return;
                      setCoins((v) => v - upgradePassiveCost);
                      setPassive((v) => +(v + 0.8).toFixed(1));
                    }}
                  >
                    Boost · {formatNumber(upgradePassiveCost)}
                  </Button>
                </Card>
              </div>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <MissionCard
                reward="240 ADN"
                title="Tap 120 Times"
                description="Complete your core action cycle."
                progress={72}
                maxProgress={120}
                status="inProgress"
              />
              <MissionCard
                reward="Premium Chest"
                title="Claim Event Reward"
                description="Join the live event and take your bonus."
                progress={100}
                maxProgress={100}
                status="claimable"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <MarketCard category="Mining" title="Core Extractor" level={2} currentValue="+6/s" nextValue="+9/s" cost="1.4K ADN" />
          <BoostCard name="2x Production" duration="2h" maxLevel={5} active remaining="01:18:11" />
          <Card className="p-5">
            <div className="adn-label">System Status</div>
            <div className="mt-2 text-xl font-bold" style={{ color: "#e8f4ff" }}>Dark. Neon. Premium.</div>
            <p className="mt-1 text-sm" style={{ color: "#8ba8cc" }}>
              Derin uzay zemini, neon glow, güven veren kontrast.
            </p>
            <div className="mt-4 grid gap-2">
              <div className="adn-badge adn-badge-active">Theme Stable</div>
              <div className="adn-badge adn-badge-gold">Reward Highlight</div>
              <div className="adn-badge adn-badge-rbrt">RBRT Ready State</div>
            </div>
          </Card>
        </div>
      </div>

      <BottomNav active={tab} onChange={setTab} />
    </AppShell>
  );
}
