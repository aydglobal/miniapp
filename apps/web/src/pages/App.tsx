import { useEffect, useMemo, useState, useRef, type MouseEvent } from 'react';
import type {
  ActiveBoost,
  AirdropDashboard,
  BoostCatalogItem,
  ChestVault,
  ClaimResult,
  ClanOverview,
  DailyClaimResult,
  DailyState,
  MissionBoard,
  MissionItem,
  PlayerProfile,
  PrestigeStatus,
  ReferralOverview,
  ShopView,
  TapResult
} from '../../../../packages/shared/src/index';
import lionImage from '../assets/lion-clean.png';
import tokenImage from '../assets/adn-token-clean.png';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { AppIcon, type AppIconName } from '../components/AppIcon';
import ComboDisplay from '../components/ComboDisplay';
import LevelUpOverlay from '../components/LevelUpOverlay';
import { getSmartAction, identity, resolvePhase } from '../content/identity';
import { useAuth } from '../hooks/useAuth';
import { useComboEngine } from '../hooks/useComboEngine';
import { useFeedbackLayer } from '../hooks/useFeedbackLayer';
import { getJSON, postJSON } from '../lib/api';
import { gameBus } from '../lib/gameBus';
import {
  addBurstWithLimit,
  buildStreakHistory,
  shouldShowLevelUp
} from '../lib/gameEngagement';
import { playHaptic } from '../lib/haptics';
import { playSoftClick, playSuccessTone, playUpgradeTone } from '../lib/sfx';
import { bootTelegramUI } from '../lib/telegram';
import OnboardingOverlay from '../components/OnboardingOverlay';
import ChestRevealSequence from '../components/ChestRevealSequence';
import { ScreenTransition, TapMotionButton, MotionCard, ChestRevealMotion } from '../components/MotionPack';
import FeedbackSettingsCard from '../components/FeedbackSettingsCard';
import AdnOpeningScreen from '../components/AdnOpeningScreen';
import { BottomNavPro } from '../components/ui/BottomNavPro';
import { calcEmpireStats } from '../hooks/useEmpireEngine';
import { useMissionEngine } from '../game/missions/useMissionEngine';
import MissionDrawerMobile from '../components/missions/MissionDrawerMobile';

type TabKey = 'mine' | 'boosts' | 'tasks' | 'wallet' | 'social' | 'settings';

type LeaderboardEntry = {
  id: string;
  displayName: string;
  username?: string | null;
  coins: number;
  level: number;
};

type LinkBundle = {
  miniAppUrl: string;
  botStartAppUrl: string;
  referralCode: string;
};

type LiveEvent = {
  key: string;
  title: string;
  isEnabled: boolean;
  startsAt: string | null;
  endsAt: string | null;
  modifiers: Record<string, number>;
};

type OnboardingState = {
  introSeen: boolean;
  firstTapDone: boolean;
  firstUpgradeDone: boolean;
  firstMissionDone: boolean;
  referralSeen: boolean;
};

type DailyResponse = DailyState & { success: boolean };
type MissionResponse = MissionBoard & { success: boolean };
type ShopResponse = ShopView & { success: boolean };
type ReferralResponse = ReferralOverview & { success: boolean };
type ClanResponse = ClanOverview & { success: boolean };
type ChestResponse = ChestVault & { success: boolean };
type PrestigeResponse = PrestigeStatus & { success: boolean };
type OnboardingResponse = { success: boolean; state: OnboardingState };

type RewardBurst = {
  id: number;
  label: string;
  x: number;
  y: number;
  tone: 'gold' | 'cyan' | 'pink' | 'violet';
};

type Ripple = {
  id: number;
  x: number;
  y: number;
};

type ImpactState = 'tap' | 'claim' | 'upgrade' | 'reboot' | null;

type ActionCard = {
  title: string;
  body: string;
  cta: string;
  targetTab: TabKey;
};

const TABS: Array<{ key: TabKey; label: string; icon: AppIconName }> = [
  { key: 'mine', label: 'Tap', icon: 'tap' },
  { key: 'boosts', label: 'Market', icon: 'boost' },
  { key: 'tasks', label: 'Kazan', icon: 'ticket' },
  { key: 'wallet', label: 'Cüzdan', icon: 'wallet' },
  { key: 'social', label: 'Sosyal', icon: 'referral' },
  { key: 'settings', label: 'Ayar', icon: 'spark' }
];

const CORE_PARTICLES = [
  { id: 1, top: '12%', left: '14%', delay: '0s' },
  { id: 2, top: '18%', left: '74%', delay: '1.2s' },
  { id: 3, top: '54%', left: '16%', delay: '0.8s' },
  { id: 4, top: '68%', left: '80%', delay: '1.7s' },
  { id: 5, top: '30%', left: '50%', delay: '2.2s' }
] as const;

// EnergyBar görsel durumu
type EnergyBarVariant = 'normal' | 'full' | 'danger';

function getEnergyVariant(percent: number): EnergyBarVariant {
  if (percent >= 100) return 'full';
  if (percent < 20) return 'danger';
  return 'normal';
}

function isStreakHighlighted(streak: number): boolean {
  return streak >= 7;
}

function isStreakMilestone(streak: number): boolean {
  return streak > 0 && streak % 7 === 0;
}

export default function App() {
  const { token, user: authUser, setUser, loading, error, isTelegramAvailable } = useAuth();
  const user = authUser as PlayerProfile | null;
  const [showOpening, setShowOpening] = useState(true);
  const [missionDrawerOpen, setMissionDrawerOpen] = useState(false);

  useFeedbackLayer();

  const { comboCount, comboMultiplier, isActive: isComboActive, registerTap } = useComboEngine();

  // Mission Engine V2
  const missionStats = {
    taps: user?.totalTaps ?? 0,
    coinsEarned: user?.coins ?? 0,
    comboBest: comboCount,
    criticalHits: 0,
    upgradesBought: 0,
    chestsOpened: 0,
    idleCollected: 0,
    premiumSpent: 0,
    prestigeCount: (user as any)?.prestigePower ?? 0,
    referrals: 0,
  };
  const { activeDaily, completedCount, claimedCount, claimMission: claimMissionV2 } = useMissionEngine({
    level: user?.level ?? 1,
    prestige: (user as any)?.prestigePower ?? 0,
    vipLevel: 0,
    eventActive: false,
    stats: missionStats,
  });
  const [levelUpOverlay, setLevelUpOverlay] = useState<{ level: number; visible: boolean }>({ level: 1, visible: false });
  const tapThrottleRef = useRef<number>(0);

  const [activeTab, setActiveTab] = useState<TabKey>('mine');
  const [dashboard, setDashboard] = useState<AirdropDashboard | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [links, setLinks] = useState<LinkBundle | null>(null);
  const [daily, setDaily] = useState<DailyState | null>(null);
  const [missionBoard, setMissionBoard] = useState<MissionBoard | null>(null);
  const [shop, setShop] = useState<ShopView | null>(null);
  const [referral, setReferral] = useState<ReferralOverview | null>(null);
  const [clans, setClans] = useState<ClanOverview | null>(null);
  const [chestVault, setChestVault] = useState<ChestVault | null>(null);
  const [prestige, setPrestige] = useState<PrestigeStatus | null>(null);
  const [boosts, setBoosts] = useState<BoostCatalogItem[]>([]);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [onboarding, setOnboarding] = useState<OnboardingState | null>(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [clanName, setClanName] = useState('');
  const [clanSlug, setClanSlug] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);
  const [rewardBursts, setRewardBursts] = useState<RewardBurst[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [impactState, setImpactState] = useState<ImpactState>(null);
  const [highlightedCard, setHighlightedCard] = useState<string | null>(null);
  const [highlightedMission, setHighlightedMission] = useState<string | null>(null);
  const [rebootFx, setRebootFx] = useState(false);
  const [rebootReveal, setRebootReveal] = useState('');
  const [now, setNow] = useState(Date.now());
  const nowRef = useRef(Date.now());
  const [feedIndex, setFeedIndex] = useState(0);
  const [onboardingStep, setOnboardingStep] = useState<
    'welcome' | 'tap_once' | 'open_shop' | 'buy_upgrade' | 'open_missions' | 'open_referral' | 'finish'
  >('finish');
  const [chestReveal, setChestReveal] = useState<{
    rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
    jackpot?: boolean;
    rewards: { adn: number; shards: number; boostMinutes: number };
  } | null>(null);

  useEffect(() => {
    bootTelegramUI();
  }, []);

  useEffect(() => {
    const handler = (data: { level: number }) => {
      setLevelUpOverlay({ level: data.level, visible: true });
    };
    const unsubscribe = gameBus.on('level_up', handler);
    return unsubscribe;
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      nowRef.current = Date.now();
      setNow(Date.now());
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  const refreshAll = async () => {
    if (!token) return;

    const results = await Promise.allSettled([
      getJSON<PlayerProfile>('/api/me', token),
      getJSON<AirdropDashboard>('/api/game/airdrop', token),
      getJSON<LeaderboardEntry[]>('/api/game/leaderboard', token),
      getJSON<LinkBundle>('/api/links/miniapp', token),
      getJSON<DailyResponse>('/api/daily', token),
      getJSON<MissionResponse>('/api/missions', token),
      getJSON<ShopResponse>('/api/shop', token),
      getJSON<ReferralResponse>('/api/referral', token),
      getJSON<ClanResponse>('/api/clans', token),
      getJSON<ChestResponse>('/api/chests', token),
      getJSON<PrestigeResponse>('/api/prestige', token),
      getJSON<BoostCatalogItem[]>('/api/boosts', token),
      getJSON<LiveEvent[]>('/api/game/live-events', token),
      getJSON<OnboardingResponse>('/api/onboarding', token)
    ]);

    if (results[0].status === 'fulfilled') setUser(results[0].value);
    if (results[1].status === 'fulfilled') setDashboard(results[1].value);
    if (results[2].status === 'fulfilled') setLeaderboard(results[2].value);
    if (results[3].status === 'fulfilled') setLinks(results[3].value);
    if (results[4].status === 'fulfilled') setDaily(results[4].value);
    if (results[5].status === 'fulfilled') setMissionBoard(results[5].value);
    if (results[6].status === 'fulfilled') setShop(results[6].value);
    if (results[7].status === 'fulfilled') setReferral(results[7].value);
    if (results[8].status === 'fulfilled') setClans(results[8].value);
    if (results[9].status === 'fulfilled') setChestVault(results[9].value);
    if (results[10].status === 'fulfilled') setPrestige(results[10].value);
    if (results[11].status === 'fulfilled') setBoosts(results[11].value);
    if (results[12].status === 'fulfilled') setLiveEvents(results[12].value);
    if (results[13].status === 'fulfilled') {
      const state = results[13].value.state;
      setOnboarding(state);
      if (state && !state.introSeen) setOnboardingStep('welcome');
      else if (state && !state.firstTapDone) setOnboardingStep('tap_once');
      else if (state && !state.firstUpgradeDone) setOnboardingStep('open_shop');
      else if (state && !state.firstMissionDone) setOnboardingStep('open_missions');
      else if (state && !state.referralSeen) setOnboardingStep('open_referral');
      else setOnboardingStep('finish');
    }
  };

  useEffect(() => {
    if (!token) return;

    setBooting(true);
    refreshAll()
      .catch((loadError) => setStatusMessage(extractMessage(loadError, 'Veriler yuklenemedi.')))
      .finally(() => setBooting(false));
  }, [token]);

  useEffect(() => {
    if (!statusMessage) return;
    const timeout = window.setTimeout(() => setStatusMessage(''), 3800);
    return () => window.clearTimeout(timeout);
  }, [statusMessage]);

  const phase = useMemo(() => resolvePhase(user?.level ?? 1), [user?.level]);
  const energyPercent = user && user.maxEnergy > 0 ? Math.min(100, (user.energy / user.maxEnergy) * 100) : 0;
  const energyVariant = getEnergyVariant(energyPercent);
  const claimPercent = dashboard ? Math.min(100, (dashboard.summary.totalPoints / Math.max(dashboard.summary.minimumPoints, 1)) * 100) : 0;
  const topEvent = liveEvents[0] || null;
  const userRank = useMemo(() => {
    if (!leaderboard.length) return 1;
    const index = leaderboard.findIndex((entry) => entry.id === user?.id);
    return index >= 0 ? index + 1 : leaderboard.length + 1;
  }, [leaderboard, user?.id]);

  const claimableMission = missionBoard?.missions.find((mission) => mission.status === 'completed' && !mission.rewardClaimedAt) || null;
  const activeMission = claimableMission || missionBoard?.missions.find((mission) => mission.progress > 0 && mission.status !== 'claimed') || missionBoard?.missions[0] || null;
  const claimableAirdropTask =
    dashboard?.tasks.find((task) => task.completed && !task.claimed) ||
    dashboard?.tasks.find((task) => !task.claimed) ||
    null;
  const onboardingOpen = onboarding ? Object.values(onboarding).some((value) => !value) : false;
  const activeBoosts = user?.boosts || [];

  const feedItems = useMemo(
    () =>
      buildFeedItems({
        user,
        topEvent,
        daily,
        dashboard,
        activeMission,
        claimableMission,
        chestVault,
        activeBoosts,
        referral,
        userRank,
        now
      }),
    // now intentionally excluded — feed rotates via its own interval, not every second
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, topEvent, daily, dashboard, activeMission, claimableMission, chestVault, activeBoosts, referral, userRank]
  );

  useEffect(() => {
    if (feedItems.length <= 1) return;
    const timer = window.setInterval(() => {
      setFeedIndex((current) => (current + 1) % feedItems.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [feedItems.length]);

  const actionCard = useMemo(
    () =>
      resolveActionCard({
        smartAction: getSmartAction({
          readyChests: chestVault?.readyCount || 0,
          canClaimDaily: daily?.canClaim || false,
          canPrestige: prestige?.canPrestige || false,
          onboardingOpen,
          activeOffer: referral?.activeOffer,
          nextFeature: user?.nextFeatureUnlock?.feature_name || null
        }),
        topEvent,
        claimReady: dashboard?.summary.claimable || false,
        claimableMissionCount: missionBoard?.missions.filter((mission) => mission.status === 'completed' && !mission.rewardClaimedAt).length || 0,
        readyChests: chestVault?.readyCount || 0
      }),
    [chestVault?.readyCount, daily?.canClaim, prestige?.canPrestige, onboardingOpen, referral?.activeOffer, user?.nextFeatureUnlock?.feature_name, topEvent, dashboard?.summary.claimable, missionBoard?.missions]
  );

  const shellClassName = buildShellClassNames({
    impactState,
    hasBoosts: activeBoosts.length > 0,
    isDanger: isDangerWindow(topEvent, now)
  });

  function triggerImpact(nextState: ImpactState) {
    setImpactState(nextState);
    window.clearTimeout((triggerImpact as { timeout?: number }).timeout);
    (triggerImpact as { timeout?: number }).timeout = window.setTimeout(() => setImpactState(null), 280);
  }

  function pushBurst(label: string, x: number, y: number, tone: RewardBurst['tone'] = 'gold') {
    const id = Date.now() + Math.random();
    setRewardBursts((current) => addBurstWithLimit(current, { id, label, x, y, tone }));
    window.setTimeout(() => {
      setRewardBursts((current) => current.filter((item) => item.id !== id));
    }, 1000);
  }

  function pushRipple(x: number, y: number) {
    const id = Date.now() + Math.random();
    setRipples((current) => [...current, { id, x, y }]);
    window.setTimeout(() => {
      setRipples((current) => current.filter((item) => item.id !== id));
    }, 650);
  }

  function highlightCard(cardKey: string) {
    setHighlightedCard(cardKey);
    window.setTimeout(() => setHighlightedCard((current) => (current === cardKey ? null : current)), 900);
  }

  function highlightMission(missionId: string) {
    setHighlightedMission(missionId);
    window.setTimeout(() => setHighlightedMission((current) => (current === missionId ? null : current)), 900);
  }

  function navigateToTab(tab: TabKey) {
    playSoftClick();
    playHaptic('light');
    setActiveTab(tab);
  }

  async function copyText(value: string, message: string) {
    await navigator.clipboard.writeText(value);
    setStatusMessage(message);
  }

  async function handleOnboardingNext() {
    const stepOrder = ['welcome', 'tap_once', 'open_shop', 'buy_upgrade', 'open_missions', 'open_referral', 'finish'] as const;
    const stepToApiMap: Record<string, string> = {
      welcome: 'introSeen',
      tap_once: 'firstTapDone',
      open_shop: 'firstUpgradeDone',
      buy_upgrade: 'firstUpgradeDone',
      open_missions: 'firstMissionDone',
      open_referral: 'referralSeen'
    };
    const apiStep = stepToApiMap[onboardingStep];
    if (apiStep && token) {
      postJSON('/api/onboarding/step', { step: apiStep }, token).catch(() => null);
    }
    const idx = stepOrder.indexOf(onboardingStep as typeof stepOrder[number]);
    setOnboardingStep(stepOrder[Math.min(idx + 1, stepOrder.length - 1)]);
  }

  async function handleTap(event: MouseEvent<HTMLButtonElement>) {
    if (!token || !user || user.energy <= 0) return;

    // Throttle: 250ms — hızlı tap'lerde race condition önle
    const now = Date.now();
    if (now - tapThrottleRef.current < 250) return;
    tapThrottleRef.current = now;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX ? event.clientX - rect.left : rect.width / 2;
    const y = event.clientY ? event.clientY - rect.top : rect.height / 2;

    const baseGain = Math.max(1, user.tapPower);
    const isCrit = Math.random() < 0.05;

    pushBurst(`+${fmt(baseGain)}`, x, y, 'gold');
    if (isCrit) pushBurst(`CRIT!`, x, y - 30, 'pink');

    triggerImpact('tap');
    playSoftClick();
    playHaptic('light');
    registerTap();

    // Optimistic update — coin sadece artar, hiç düşmez
    const prevEnergy = user.energy;
    const prevCoins = user.coins;
    setUser((prev: any) => prev ? {
      ...prev,
      coins: prev.coins + baseGain,
      energy: Math.max(0, prev.energy - 1),
    } : prev);

    try {
      const result = await postJSON<TapResult>('/api/game/tap', { taps: 1, clientNonce: user.tapNonce ?? 0 }, token);
      // API sonucu — coin hiçbir zaman düşmesin, sadece yükselebilir
      setUser((prev: any) => prev ? {
        ...prev,
        coins: Math.max(prev.coins, result.coins),
        energy: result.energy,
        maxEnergy: result.energyMax ?? prev.maxEnergy,
        level: result.level,
        tapNonce: result.tapNonce ?? prev.tapNonce,
      } : prev);
      if (shouldShowLevelUp(user.level ?? 1, result.level)) {
        gameBus.emit('level_up', { level: result.level });
      }
    } catch {
      // API hata verdi — optimistic update'i geri al
      setUser((prev: any) => prev ? {
        ...prev,
        coins: prevCoins,
        energy: prevEnergy,
      } : prev);
    }
  }

  async function handleDailyClaim() {
    if (!token || busyKey) return;
    setBusyKey('daily');
    try {
      const result = await postJSON<DailyClaimResult>('/api/daily/claim', {}, token);
      playSuccessTone();
      playHaptic('success');
      triggerImpact('claim');
      setStatusMessage(`Gunluk odul alindi. +${fmt(result.reward)} ADN, seri ${result.streak}. gun.`);
      await refreshAll();
    } catch (claimError) {
      setStatusMessage(extractMessage(claimError, 'Gunluk odul alinamadi.'));
    } finally {
      setBusyKey(null);
    }
  }

  async function handleMissionClaim(mission: MissionItem) {
    if (!token || busyKey) return;
    setBusyKey(`mission:${mission.id}`);
    try {
      const result = await postJSON<{ success: boolean; claimed: number; xp: number; coins: number }>(
        `/api/missions/claim/${mission.id}`,
        {},
        token
      );
      playSuccessTone();
      playHaptic('success');
      triggerImpact('claim');
      highlightMission(mission.id);
      setStatusMessage(`Odul alindi. +${fmt(result.claimed)} ADN, +${fmt(result.xp)} XP.`);
      await Promise.allSettled([refreshAll(), postJSON('/api/onboarding/step', { step: 'firstMissionDone' }, token)]);
    } catch (missionError) {
      setStatusMessage(extractMessage(missionError, 'Gorev odulu alinamadi.'));
    } finally {
      setBusyKey(null);
    }
  }

  async function handleAirdropTask(code: string) {
    if (!token || busyKey) return;
    setBusyKey(`airdrop:${code}`);
    try {
      await postJSON<AirdropDashboard>('/api/game/airdrop/task', { code }, token);
      playSuccessTone();
      playHaptic('success');
      triggerImpact('claim');
      setStatusMessage('Operasyon gorevi tamamlandi. Airdrop ilerlemesi guncellendi.');
      await refreshAll();
    } catch (taskError) {
      setStatusMessage(extractMessage(taskError, 'Airdrop gorevi guncellenemedi.'));
    } finally {
      setBusyKey(null);
    }
  }

  async function handleShop(cardKey: string, mode: 'purchase' | 'upgrade') {
    if (!token || busyKey) return;
    setBusyKey(`${mode}:${cardKey}`);
    try {
      const endpoint = mode === 'purchase' ? '/api/shop/purchase' : '/api/shop/upgrade';
      const result = await postJSON<{ success: boolean; deltaHourly: number; price: number }>(endpoint, { cardKey }, token);
      playUpgradeTone();
      playHaptic('medium');
      triggerImpact('upgrade');
      highlightCard(cardKey);
      setStatusMessage(`Modul guclendi. +${fmt(result.deltaHourly)} saatlik ADN.`);
      gameBus.emit('upgrade', { cardKey });
      await Promise.allSettled([refreshAll(), postJSON('/api/onboarding/step', { step: 'firstUpgradeDone' }, token)]);
    } catch (shopError) {
      setStatusMessage(extractMessage(shopError, 'Modul yukseltilmedi.'));
    } finally {
      setBusyKey(null);
    }
  }

  async function handleBoostPurchase(type: BoostCatalogItem['key'], source: 'buy' | 'free') {
    if (!token || busyKey) return;
    setBusyKey(`boost:${type}:${source}`);
    try {
      await postJSON(source === 'buy' ? '/api/boosts/buy' : '/api/boosts/daily-claim', { type }, token);
      playUpgradeTone();
      playHaptic('medium');
      setStatusMessage(source === 'buy' ? 'Boost aktif edildi.' : 'Ucretsiz boost alindi.');
      await refreshAll();
    } catch (boostError) {
      setStatusMessage(extractMessage(boostError, 'Boost aktif edilemedi.'));
    } finally {
      setBusyKey(null);
    }
  }

  async function handleClaimSubmit() {
    if (!token || !walletAddress || busyKey) return;
    setBusyKey('claim');
    try {
      const result = await postJSON<ClaimResult>('/api/game/airdrop/claim', { walletAddress }, token);
      playSuccessTone();
      playHaptic('success');
      triggerImpact('claim');
      setStatusMessage(result.message);
      await refreshAll();
    } catch (claimError) {
      setStatusMessage(extractMessage(claimError, 'Cekim talebi olusturulamadi.'));
    } finally {
      setBusyKey(null);
    }
  }

  async function handleCreateClan() {
    if (!token || !clanName || busyKey) return;
    setBusyKey('clan:create');
    try {
      await postJSON('/api/clans/create', { name: clanName, description: 'ADN Arena icinden olusturuldu.' }, token);
      playSuccessTone();
      playHaptic('success');
      setClanName('');
      setStatusMessage('Yeni syndicate olusturuldu.');
      await refreshAll();
    } catch (clanError) {
      setStatusMessage(extractMessage(clanError, 'Syndicate olusturulamadi.'));
    } finally {
      setBusyKey(null);
    }
  }

  async function handleJoinClan() {
    if (!token || !clanSlug || busyKey) return;
    setBusyKey('clan:join');
    try {
      await postJSON('/api/clans/join', { slug: clanSlug }, token);
      playSuccessTone();
      playHaptic('success');
      setClanSlug('');
      setStatusMessage('Syndicate baglantisi kuruldu.');
      await refreshAll();
    } catch (clanError) {
      setStatusMessage(extractMessage(clanError, 'Syndicate baglantisi kurulamadi.'));
    } finally {
      setBusyKey(null);
    }
  }

  async function handleOpenChest(chestId: string) {
    if (!token || busyKey) return;
    setBusyKey(`chest:${chestId}`);
    try {
      const result = await postJSON<{
        success: boolean;
        reward: { rewardCoins: number; rarity: string; shards: number; boostMinutes: number };
        rarity: string;
        shards: number;
        boostMinutes: number;
      }>(`/api/chests/open/${chestId}`, {}, token);
      playSuccessTone();
      playHaptic('success');
      triggerImpact('claim');
      const rarity = (result.reward?.rarity || result.rarity || 'common') as 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
      gameBus.emit('chest_open', { rarity });
      // ChestRevealSequence modal'ı göster
      setChestReveal({
        rarity,
        rewards: {
          adn: result.reward?.rewardCoins || 0,
          shards: result.reward?.shards || result.shards || 0,
          boostMinutes: result.reward?.boostMinutes || result.boostMinutes || 0
        }
      });
      await refreshAll();
    } catch (chestError) {
      setStatusMessage(extractMessage(chestError, 'Cache acilamadi.'));
    } finally {
      setBusyKey(null);
    }
  }

  async function handlePrestige() {
    if (!token || !prestige || busyKey) return;
    setBusyKey('prestige');
    setRebootFx(true);
    try {
      const previousPower = prestige.prestigePower;
      const result = await postJSON<PrestigeResponse>('/api/prestige/activate', {}, token);
      playSuccessTone();
      playHaptic('heavy');
      triggerImpact('reboot');
      setRebootReveal(`+${Math.max(1, result.prestigePower - previousPower)}x POWER`);
      setStatusMessage('Reboot tamamlandi. Kalici guc katmani yukseldi.');
      await refreshAll();
    } catch (prestigeError) {
      setStatusMessage(extractMessage(prestigeError, 'Reboot su an hazir degil.'));
    } finally {
      window.setTimeout(() => setRebootFx(false), 900);
      window.setTimeout(() => setRebootReveal(''), 2200);
      setBusyKey(null);
    }
  }

  if (showOpening) {
    return (
      <AdnOpeningScreen
        onEnter={() => setShowOpening(false)}
        balance={user?.coins ?? 0}
        level={user?.level ?? 1}
        combo={comboCount}
        dailyRewardAmount={daily?.nextReward ?? 0}
        dailyRewardProgress={daily?.canClaim ? 100 : ((daily?.streakDay ?? 0) / 7) * 100}
        nextUnlockTitle={activeDaily[0]?.title ?? "Vault Tier I"}
        nextUnlockRemaining={Math.max(0, (activeDaily[0]?.target ?? 4) - (activeDaily[0]?.progress ?? 0))}
        onOpenLitepaper={() => window.open("https://adntoken.io/litepaper", "_blank")}
        onClaimDaily={() => { setShowOpening(false); setActiveTab("tasks"); }}
      />
    );
  }

  if (error && !token && !user) {
    if (import.meta.env.DEV) {
      return <OfflinePreviewScreen message={error} />;
    }

    return <FallbackScreen message={error.includes('Preview')
      ? error
      : `${error} Uygulama onizlemesi acilabilsin diye API adresini ve preview modunu kontrol et.`} />;
  }

  if (booting && !dashboard) {
    return <LoadingScreen />;
  }

  if (!token || !user) {
    return <LoadingScreen label={isTelegramAvailable ? 'Oturum kuruluyor' : 'Preview oturumu hazirlaniyor'} />;
  }

  if (!dashboard) {
    return <FallbackScreen message="Oyun verisi alinamadi. Lutfen tekrar dene." />;
  }

  const currentFeed = feedItems[feedIndex % Math.max(1, feedItems.length)] || 'Akis stabil. Bir sonraki hamle icin tap core hazir.';
  const isMineTab = activeTab === 'mine';
  const shellClassNameWithFocus = `${shellClassName}${isMineTab ? ' is-mine-focus' : ''}`;
  const heroSection = (
    <section className={`game-hero${isMineTab ? ' is-compact' : ''}`}>
      <div className="game-hero__intro">
        <div className="game-hero__headline">
          <span className="game-eyebrow">Canli operasyon kati</span>
          <h2 className="game-hero__title">Akisi kur, ADN'yi buyut.</h2>
          <p className="game-hero__subtitle">{phase.theme} {phase.tone}</p>

          <div className={`game-ticker${isDangerWindow(topEvent, now) ? ' is-danger' : ''}`}>
            <span className="game-ticker__dot" />
            <span>{currentFeed}</span>
          </div>

          <div className="game-signal-card game-signal-card--gold game-hero__action">
            <div className="game-signal-card__label">{identity.home.smartActionTitle}</div>
            <div className="game-signal-card__value">{actionCard.title}</div>
            <div className="game-signal-card__note">{actionCard.body}</div>
            <button className="game-button" onClick={() => navigateToTab(actionCard.targetTab)}>
              {actionCard.cta}
            </button>
          </div>
        </div>

        <div className="game-signal-grid">
          <SignalCard
            tone="cyan"
            label="Aktif event"
            value={topEvent ? topEvent.title : 'Sakin mod'}
            note={topEvent ? formatEventWindow(topEvent, now) : 'Yeni event geldiginde burada pulse acilir.'}
          />
          <SignalCard
            tone="pink"
            label="Claim durumu"
            value={dashboard.summary.claimable ? 'Hazir' : `${Math.round(claimPercent)}%`}
            note={
              dashboard.summary.claimable
                ? 'Cekim acik. Reboot ya da claim ekranina gec.'
                : `${Math.max(0, dashboard.summary.minimumPoints - dashboard.summary.totalPoints)} ADN daha gerekiyor.`
            }
          />
          <SignalCard
            tone="gold"
            label="Syndicate hizi"
            value={clans?.myClan ? clans.myClan.name : 'Baglanti bekliyor'}
            note={clans?.myClan ? `${clans.myClan.memberCount} uye, toplam ${fmt(clans.myClan.totalScore)} skor.` : 'Bir syndicate kurarak sosyal bonusu ac.'}
          />
        </div>
      </div>

      <div className="game-hero__stats">
        <HeroStat icon="coin" label="Toplam ADN" value={<AnimatedNumber value={user.coins} />} note="Tap, market ve gorevler bu havuzdan beslenir." tone="gold" />
        <HeroStat icon="chart" label="Saatlik uretim" value={<><AnimatedNumber value={user.passiveIncomePerHour} compact />/s</>} note="Market ve boost hamleleri dogrudan bu hizi artirir." tone="cyan" />
        <HeroStat icon="wallet" label="Claim bar" value={`${Math.round(claimPercent)}%`} note={dashboard.summary.claimable ? 'Claim kilidi acildi.' : 'Airdrop ilerlemesi yukseliyor.'} tone="pink" />
      </div>
    </section>
  );

  return (
    <div className={shellClassNameWithFocus}>
      <div className="game-frame">
        {statusMessage ? (
          <div className="game-status-banner">
            <AppIcon name="spark" size={16} />
            <span>{statusMessage}</span>
          </div>
        ) : null}

        <header className="game-header adn-header-slim">
          <div className="game-brand">
            <span className="brand-mark brand-mark--sm">
              <img src={tokenImage} alt="ADN Token" className="brand-mark__image" />
            </span>
            <div className="game-brand__copy">
              <h1 className="game-brand__title">ADN Arena</h1>
              <span className="game-eyebrow">Lv {user.level}</span>
            </div>
          </div>

          {/* Coin sayacı büyük ve merkezi */}
          <div className="adn-coin-counter">
            <span className="adn-coin-counter__icon">💎</span>
            <strong className="adn-coin-counter__value"><AnimatedNumber value={user.coins} /></strong>
            <span className="adn-coin-counter__label">ADN</span>
          </div>

          <div className="adn-header-chips">
            <span className="adn-chip">#{userRank}</span>
            <span className={`adn-chip${isStreakHighlighted(daily?.streakDay || user.dailyStreak || 0) ? ' adn-chip--fire' : ''}`}>
              🔥{daily?.streakDay || user.dailyStreak || 0}g
            </span>
            {activeBoosts.length > 0 && <span className="adn-chip adn-chip--cyan">⚡{activeBoosts.length}x</span>}
          </div>
        </header>

        {/* XP Bar — sadece mine tab'ında */}
        {isMineTab ? <XpBar xp={user.xp ?? user.coins} level={user.level} /> : null}

        {/* Balance Strip — sadece mine tab'ında */}
        {isMineTab ? (
        <div className="adn-balance-strip">
          <div className="adn-balance-strip__item adn-balance-strip__item--gold">
            <span className="adn-balance-strip__label">ADN</span>
            <strong className="adn-balance-strip__value"><AnimatedNumber value={user.coins} /></strong>
          </div>
          <div className="adn-balance-strip__divider" />
          <div className="adn-balance-strip__item">
            <span className="adn-balance-strip__label">Saatlik</span>
            <strong className="adn-balance-strip__value"><AnimatedNumber value={user.passiveIncomePerHour} compact />/s</strong>
          </div>
          <div className="adn-balance-strip__divider" />
          <div className="adn-balance-strip__item">
            <span className="adn-balance-strip__label">Enerji</span>
            <strong className="adn-balance-strip__value">{fmt(user.energy)}/{fmt(user.maxEnergy)}</strong>
          </div>
          {activeBoosts.length > 0 && (
            <>
              <div className="adn-balance-strip__divider" />
              <div className="adn-balance-strip__item adn-balance-strip__item--cyan">
                <span className="adn-balance-strip__label">Boost</span>
                <strong className="adn-balance-strip__value">{activeBoosts.length} aktif</strong>
              </div>
            </>
          )}
        </div>
        ) : null}

        <main key={activeTab} className="game-screen">
          <ScreenTransition screenKey={activeTab}>
          {activeTab === 'mine' ? (
            <MineSection
              user={user}
              dashboard={dashboard}
              daily={daily}
              chestVault={chestVault}
              prestige={prestige}
              rewardBursts={rewardBursts}
              ripples={ripples}
              energyPercent={energyPercent}
              energyVariant={energyVariant}
              comboCount={comboCount}
              comboMultiplier={comboMultiplier}
              isComboActive={isComboActive}
              busyKey={busyKey}
              now={now}
              onTap={handleTap}
            />
          ) : null}

          {isMineTab ? null : <SystemTicker items={feedItems.slice(0, 4)} />}

          {activeTab === 'boosts' ? (
            <BoostsSection
              user={user}
              boosts={boosts}
              shop={shop}
              busyKey={busyKey}
              highlightedCard={highlightedCard}
              now={now}
              onBoost={handleBoostPurchase}
              onShop={handleShop}
            />
          ) : null}

          {activeTab === 'tasks' ? (
            <TasksSection
              daily={daily}
              user={user}
              airdropTasks={dashboard.tasks}
              missionBoard={missionBoard}
              busyKey={busyKey}
              highlightedMission={highlightedMission}
              onDailyClaim={handleDailyClaim}
              onAirdropTask={handleAirdropTask}
              onMissionClaim={handleMissionClaim}
              onOpenMissions={() => setMissionDrawerOpen(true)}
            />
          ) : null}

          {activeTab === 'wallet' ? (
            <WalletSection
              dashboard={dashboard}
              prestige={prestige}
              chestVault={chestVault}
              walletAddress={walletAddress}
              setWalletAddress={setWalletAddress}
              busyKey={busyKey}
              rebootFx={rebootFx}
              rebootReveal={rebootReveal}
              onClaimSubmit={handleClaimSubmit}
              onOpenChest={handleOpenChest}
              onPrestige={handlePrestige}
            />
          ) : null}

          {activeTab === 'social' ? (
            <SocialSection
              currentUserId={user.id}
              referral={referral}
              clans={clans}
              leaderboard={leaderboard}
              links={links}
              clanName={clanName}
              clanSlug={clanSlug}
              setClanName={setClanName}
              setClanSlug={setClanSlug}
              busyKey={busyKey}
              now={now}
              onCopy={copyText}
              onCreateClan={handleCreateClan}
              onJoinClan={handleJoinClan}
            />
          ) : null}

          {activeTab === 'settings' ? (
            <div className="game-section">
              <div className="game-section__head">
                <h2 className="game-section__title">Ayarlar</h2>
              </div>
              <FeedbackSettingsCard />
            </div>
          ) : null}
          </ScreenTransition>
        </main>

        <BottomNavPro
          active={activeTab}
          onChange={(key) => navigateToTab(key as TabKey)}
          items={TABS.map((tab) => {
            // Görev tab'ında tamamlanabilir görev sayısı badge
            const pendingMissions = tab.key === 'tasks'
              ? (missionBoard?.missions.filter(m => m.status === 'completed' && !m.rewardClaimedAt).length || 0)
                + (daily?.canClaim ? 1 : 0)
              : 0;
            return {
              key: tab.key,
              label: tab.label,
              icon: <AppIcon name={tab.icon} size={22} />,
              badge: pendingMissions > 0,
              badgeCount: pendingMissions > 0 ? pendingMissions : undefined
            };
          })}
        />

        {rebootFx ? <div className="game-reboot-overlay" /> : null}
        {rebootReveal ? <div className="game-reboot-reveal">{rebootReveal}</div> : null}
        <LevelUpOverlay
          level={levelUpOverlay.level}
          visible={levelUpOverlay.visible}
          onDone={() => setLevelUpOverlay((prev) => ({ ...prev, visible: false }))}
        />

        <div className="adn-footer-sig">
          ADN TOKEN © 2026
          {' · '}
          <button
            className="adn-footer-sig__link"
            onClick={() => { window.history.pushState({}, '', '/terms'); window.dispatchEvent(new PopStateEvent('popstate')); }}
          >
            Koşullar & SSS
          </button>
        </div>
      </div>
      <OnboardingOverlay step={onboardingStep} onNext={handleOnboardingNext} />
      <MissionDrawerMobile
        open={missionDrawerOpen}
        missions={activeDaily}
        onClose={() => setMissionDrawerOpen(false)}
        onClaim={(missionId) => {
          claimMissionV2(missionId);
          setMissionDrawerOpen(false);
        }}
      />
      {chestReveal ? (
        <ChestRevealMotion
          open={Boolean(chestReveal)}
          rarity={chestReveal.rarity}
          jackpot={chestReveal.jackpot}
          rewards={chestReveal.rewards}
          onDone={() => setChestReveal(null)}
        />
      ) : null}
    </div>
  );
}

function LoadingScreen({ label = 'ADN Arena yukleniyor' }: { label?: string }) {
  return (
    <div className="game-loading" style={{ flexDirection: 'column' }}>
      <div className="game-loading__backdrop">
        <span className="game-loading__orb game-loading__orb--gold" />
        <span className="game-loading__orb game-loading__orb--cyan" />
        <span className="game-loading__orb game-loading__orb--violet" />
        <span className="game-loading__grid" />
        <span className="game-loading__beam" />
        <span className="game-loading__particle game-loading__particle--1" />
        <span className="game-loading__particle game-loading__particle--2" />
        <span className="game-loading__particle game-loading__particle--3" />
        <span className="game-loading__particle game-loading__particle--4" />
      </div>

      <div className="game-loading__scene">
        <div className="game-loading__copy">
          <div className="game-loading__eyebrow">ADN ARENA LIVE OPS</div>
          <h1 className="game-loading__title">Arena aciliyor</h1>
          <p className="game-loading__subtitle">
            Lion sahaya iniyor, tap core senkronize oluyor ve oyun oturumu hazirlaniyor.
          </p>

          <div className="game-loading__status-card">
            <div className="game-loading__status-top">
              <span className="game-loading__status-label">Canli durum</span>
              <span className="game-loading__status-chip">SYNC</span>
            </div>
            <div className="game-loading__label">{label}</div>
            <div className="game-loading__progress">
              <div className="game-loading__progress-bar" />
            </div>
            <div className="game-loading__ticks">
              <span>Telegram baglanti kontrolu</span>
              <span>Profil ve tap cekirdegi</span>
              <span>Canli gorev katmani</span>
            </div>
          </div>
        </div>

        <div className="game-loading__visual">
          <div className="game-loading__visual-ring game-loading__visual-ring--outer" />
          <div className="game-loading__visual-ring game-loading__visual-ring--inner" />
          <div className="game-loading__core">
            <div className="game-loading__pulse" />
            <div className="game-loading__token-wrap">
              <img src={tokenImage} alt="ADN Token" className="game-loading__token" />
            </div>
            <img src={lionImage} alt="ADN Lion" className="game-loading__lion" />
            <div className="game-loading__shadow" />
          </div>
        </div>
      </div>

      <div className="adn-footer-sig">ADN TOKEN © 2026</div>
    </div>
  );
}

function FallbackScreen({ message }: { message: string }) {
  return (
    <div className="game-fallback">
      <div>
        <img src={tokenImage} alt="ADN Token" className="brand-mark brand-mark--md brand-mark__image" />
        <p>{message}</p>
      </div>
    </div>
  );
}

function OfflinePreviewScreen({ message }: { message: string }) {
  return (
    <div className="game-fallback">
      <div style={{ maxWidth: 720, textAlign: 'left' }}>
        <img src={tokenImage} alt="ADN Token" className="brand-mark brand-mark--md brand-mark__image" />
        <h2 style={{ marginTop: 18, marginBottom: 12 }}>Local preview acildi</h2>
        <p style={{ marginBottom: 14 }}>
          API veya veritabani baglantisi su anda cevap vermedigi icin uygulama guvenli onizleme modunda acildi.
        </p>
        <p style={{ marginBottom: 18, opacity: 0.8 }}>
          Teknik ayrinti: {message}
        </p>
        <div style={{ display: 'grid', gap: 12, marginBottom: 18 }}>
          <div className="game-panel">
            <h3 className="game-panel__title">Calisan kisim</h3>
            <p className="game-panel__description">
              Frontend ayaga kalkti, Vite preview calisiyor ve bu repo icindeki guncel ekranlari duzenlemeye devam edebiliriz.
            </p>
          </div>
          <div className="game-panel">
            <h3 className="game-panel__title">Bloke eden kisim</h3>
            <p className="game-panel__description">
              Preview auth sonrasi API istekleri veritabani tarafinda TLS / baglanti sorunu yasadigi icin canli veri yuklenemiyor.
            </p>
          </div>
        </div>
        <div className="game-actions">
          <button className="game-button" onClick={() => window.location.reload()}>
            Tekrar dene
          </button>
          <a className="game-button game-button--soft" href="/lite-paper">
            Lite paper ac
          </a>
        </div>
      </div>
    </div>
  );
}

function formatCompact(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    notation: 'compact',
    maximumFractionDigits: value >= 1000 ? 1 : 0
  }).format(value);
}

function fmt(value: number) {
  return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(value);
}

function formatCountdown(input: string | number | null, now: number) {
  if (!input) return 'Pasif';
  const end = typeof input === 'number' ? input : new Date(input).getTime();
  const diff = Math.max(0, end - now);
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  if (hours > 0) return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function extractMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message || fallback;
  if (typeof error === 'string') return error || fallback;
  return fallback;
}

function buildTapMessage(result: TapResult) {
  if (result.chest?.dropped) {
    return `${result.chest.tier.toUpperCase()} cache dustu. +${fmt(result.addedCoins)} ADN.`;
  }

  if (result.criticalHit) {
    return `Kritik tap! +${fmt(result.addedCoins)} ADN kazandin.`;
  }

  return `Tap onaylandi. +${fmt(result.addedCoins)} ADN akisa eklendi.`;
}

function buildFeedItems(params: {
  user: PlayerProfile | null;
  topEvent: LiveEvent | null;
  daily: DailyState | null;
  dashboard: AirdropDashboard | null;
  activeMission: MissionItem | null;
  claimableMission: MissionItem | null;
  chestVault: ChestVault | null;
  activeBoosts: ActiveBoost[];
  referral: ReferralOverview | null;
  userRank: number;
  now: number;
}) {
  const items: string[] = [];

  if (!params.user) {
    return ['Baglanti kuruluyor. ADN Arena veri akisina baglaniyor.'];
  }

  if (params.topEvent) {
    items.push(`${params.topEvent.title} aktif. ${formatEventWindow(params.topEvent, params.now)}`);
  }
  if (params.dashboard?.summary.claimable) {
    items.push('Claim kilidi acik. Wallet sekmesinden talep verebilirsin.');
  }
  if (params.claimableMission) {
    items.push(`${params.claimableMission.title} odulu alinmayi bekliyor.`);
  }
  if (params.daily?.canClaim) {
    items.push(`Gunluk seri hazir. ${params.daily.streakDay}. gunu kacirma.`);
  }
  if (params.chestVault?.readyCount) {
    items.push(`${params.chestVault.readyCount} cache acilmayi bekliyor.`);
  }
  if (params.activeBoosts.length) {
    items.push(`${labelForBoost(params.activeBoosts[0].type)} aktif. Ritmi yuksek tut.`);
  }
  if (params.referral?.totals.active) {
    items.push(`${params.referral.totals.active} aktif davet hattin uretime bagli.`);
  }

  items.push(`Su an #${params.userRank} siradasin. Biraz daha ritimle ust bloklara cikabilirsin.`);
  items.push(`${params.user.displayName} icin tap core stabil. Enerji ${Math.round((params.user.energy / Math.max(1, params.user.maxEnergy)) * 100)}%.`);

  return items;
}

function resolveActionCard(params: {
  smartAction: { title: string; body: string };
  topEvent: LiveEvent | null;
  claimReady: boolean;
  claimableMissionCount: number;
  readyChests: number;
}): ActionCard {
  if (params.claimReady) {
    return {
      title: 'Claim hazir',
      body: 'Cekim kilidi acildi. Wallet ekraninda talebi gonder.',
      cta: 'Claim ekranina git',
      targetTab: 'wallet'
    };
  }

  if (params.claimableMissionCount > 0) {
    return {
      title: 'Odul topla',
      body: `${params.claimableMissionCount} gorev odulu alinmayi bekliyor.`,
      cta: 'Gorevleri ac',
      targetTab: 'tasks'
    };
  }

  if (params.readyChests > 0) {
    return {
      title: 'Cache ac',
      body: `${params.readyChests} hazir cache buyuk sıcrama sansi veriyor.`,
      cta: 'Vault ekranina git',
      targetTab: 'wallet'
    };
  }

  if (params.topEvent) {
    return {
      title: params.topEvent.title,
      body: 'Canli event bonusu aktif. Tap ve boost ritmini hizlandir.',
      cta: 'Tap corea don',
      targetTab: 'mine'
    };
  }

  if (params.smartAction.title.toLowerCase().includes('teklif')) {
    return { ...params.smartAction, cta: 'Ag ekranina git', targetTab: 'social' };
  }

  return { ...params.smartAction, cta: 'Simdi oyna', targetTab: 'mine' };
}

function formatEventWindow(event: LiveEvent, now: number) {
  if (!event.endsAt) return 'Sure bilgisi bekleniyor.';
  const countdown = formatCountdown(event.endsAt, now);
  return isDangerWindow(event, now) ? `Son saatte: ${countdown}` : `Kalan sure ${countdown}`;
}

function isDangerWindow(event: LiveEvent | null, now: number) {
  if (!event?.endsAt) return false;
  return new Date(event.endsAt).getTime() - now <= 60 * 60 * 1000;
}

function buildShellClassNames(params: { impactState: ImpactState; hasBoosts: boolean; isDanger: boolean }) {
  return [
    'game-shell',
    params.hasBoosts ? 'is-boosted' : '',
    params.isDanger ? 'is-danger' : '',
    params.impactState ? `is-impact-${params.impactState}` : ''
  ]
    .filter(Boolean)
    .join(' ');
}

function labelForBoost(type: ActiveBoost['type'] | BoostCatalogItem['key']) {
  if (type === 'tap_x2') return '2x Tap';
  if (type === 'energy_cap') return 'Enerji Core';
  return 'Regen Surge';
}

function normalizeCategory(category: string) {
  const value = category.toLowerCase();
  if (value.includes('min')) return 'mining';
  if (value.includes('comm')) return 'community';
  if (value.includes('exch')) return 'exchange';
  return 'special';
}

function HeaderStat({ icon, label, value }: { icon: AppIconName; label: string; value: string }) {
  return (
    <div className="game-header-stat">
      <span className="game-header-stat__icon">
        <AppIcon name={icon} size={16} />
      </span>
      <div>
        <span className="game-header-stat__label">{label}</span>
        <strong className="game-header-stat__value">{value}</strong>
      </div>
    </div>
  );
}

// XP eşikleri — levelTable'dan basitleştirilmiş
const XP_THRESHOLDS: Record<number, number> = {
  1: 80, 2: 120, 3: 180, 4: 260, 5: 360, 6: 500, 7: 680, 8: 860,
  9: 1100, 10: 1380, 11: 1720, 12: 2100, 13: 2550, 14: 3000, 15: 3400,
};

function getXpProgress(xp: number, level: number) {
  // Mevcut level için kümülatif XP eşiği
  let cumulative = 0;
  for (let l = 1; l < level; l++) {
    cumulative += XP_THRESHOLDS[l] ?? 500;
  }
  const currentLevelXp = xp - cumulative;
  const needed = XP_THRESHOLDS[level] ?? 500;
  return { current: Math.max(0, currentLevelXp), needed, percent: Math.min(100, Math.max(0, (currentLevelXp / needed) * 100)) };
}

function XpBar({ xp, level }: { xp: number; level: number }) {
  const { current, needed, percent } = getXpProgress(xp, level);
  return (
    <div className="adn-xp-bar">
      <div className="adn-xp-bar__track">
        <div className="adn-xp-bar__fill" style={{ width: `${percent}%` }} />
      </div>
      <div className="adn-xp-bar__labels">
        <span className="adn-xp-bar__lv">Lv {level}</span>
        <span className="adn-xp-bar__val">{current.toLocaleString()} / {needed.toLocaleString()} XP</span>
        <span className="adn-xp-bar__lv">Lv {level + 1}</span>
      </div>
    </div>
  );
}

function SignalCard({
  tone,
  label,
  value,
  note
}: {
  tone: 'gold' | 'cyan' | 'pink';
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className={`game-signal-card game-signal-card--${tone}`}>
      <div className="game-signal-card__label">{label}</div>
      <div className="game-signal-card__value">{value}</div>
      <div className="game-signal-card__note">{note}</div>
    </div>
  );
}

function HeroStat({
  icon,
  label,
  value,
  note,
  tone
}: {
  icon: AppIconName;
  label: string;
  value: React.ReactNode;
  note: string;
  tone: 'gold' | 'cyan' | 'pink';
}) {
  return (
    <div className={`game-hero-stat game-hero-stat--${tone}`}>
      <span className="game-hero-stat__icon">
        <AppIcon name={icon} size={18} />
      </span>
      <div className="game-hero-stat__label">{label}</div>
      <div className="game-hero-stat__value">{value}</div>
      <div className="game-hero-stat__note">{note}</div>
    </div>
  );
}

function SystemTicker({ items }: { items: string[] }) {
  if (!items.length) return null;

  return (
    <section className="game-system-ticker">
      <div className="game-system-ticker__badge">
        <AppIcon name="bell" size={14} />
        <span>System</span>
      </div>
      <div className="game-system-ticker__items">
        {items.map((item, index) => (
          <div key={`${item}-${index}`} className="game-system-ticker__item">
            <span>{item}</span>
            {index < items.length - 1 ? <span className="game-system-ticker__sep">•</span> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function ProgressBar({
  value,
  max,
  variant = 'cyan',
  label,
  ready = false
}: {
  value: number;
  max: number;
  variant?: 'cyan' | 'gold' | 'violet' | 'danger' | 'success';
  label?: React.ReactNode;
  ready?: boolean;
}) {
  const percent = Math.min(100, Math.max(0, (value / Math.max(1, max)) * 100));

  return (
    <div className={`game-progress${ready ? ' is-ready' : ''}`}>
      <div className={`game-progress__fill game-progress__fill--${variant}`} style={{ width: `${percent}%` }} />
      {label ? <div className="game-progress__overlay">{label}</div> : null}
    </div>
  );
}

function MineSection({
  user,
  dashboard,
  daily,
  chestVault,
  prestige,
  rewardBursts,
  ripples,
  energyPercent,
  energyVariant,
  comboCount,
  comboMultiplier,
  isComboActive,
  busyKey,
  now,
  onTap
}: {
  user: PlayerProfile;
  dashboard: AirdropDashboard;
  daily: DailyState | null;
  chestVault: ChestVault | null;
  prestige: PrestigeStatus | null;
  rewardBursts: RewardBurst[];
  ripples: Ripple[];
  energyPercent: number;
  energyVariant: EnergyBarVariant;
  comboCount: number;
  comboMultiplier: number;
  isComboActive: boolean;
  busyKey: string | null;
  now: number;
  onTap: (event: MouseEvent<HTMLButtonElement>) => Promise<void>;
}) {
  const isReady = energyPercent >= 100;
  const streakHistory = buildStreakHistory(daily?.streakDay || user.dailyStreak || 0);

  return (
    <>
      <section className="adn-mine-core">
        {/* Combo göstergesi */}
        {isComboActive && (
          <div className="adn-combo-badge">
            <span>COMBO</span>
            <strong>x{comboMultiplier.toFixed(1)}</strong>
          </div>
        )}

        {/* Aslan + Tap butonu — büyük ve merkezi */}
        <div className="adn-tap-stage">
          <div className={`adn-tap-halo${energyVariant === 'danger' ? ' adn-tap-halo--danger' : ''}${isReady ? ' adn-tap-halo--ready' : ''}`} />
          <TapMotionButton
            type="button"
            className="adn-tap-btn"
            onClick={onTap}
            disabled={user.energy <= 0}
            energy={user.energy}
            busy={false}
          >
            <img src={lionImage} alt="ADN Lion" className="adn-tap-lion" />
            <div className="adn-tap-overlay">
              <span className="adn-tap-label">TAP</span>
            </div>
            {rewardBursts.map((item) => (
              <span
                key={item.id}
                className={`game-tapper__float game-tapper__float--${item.tone}`}
                style={{ left: item.x, top: item.y }}
              >
                {item.label}
              </span>
            ))}
          </TapMotionButton>
        </div>

        {/* Enerji barı — büyük ve belirgin */}
        <div className="adn-energy-block">
          <div className="adn-energy-block__header">
            <span className="adn-energy-block__label">⚡ ENERJİ</span>
            <span className="adn-energy-block__value">
              <strong>{fmt(user.energy)}</strong>
              <span>/{fmt(user.maxEnergy)}</span>
              <span className="adn-energy-block__pct">{Math.round(energyPercent)}%</span>
            </span>
          </div>
          <div className={`adn-energy-bar adn-energy-bar--${energyVariant}`}>
            <div className="adn-energy-bar__fill" style={{ width: `${energyPercent}%` }} />
            {isReady && <div className="adn-energy-bar__ready-glow" />}
          </div>
          <div className="adn-energy-block__footer">
            <span>+{fmt(Math.round(user.tapPower * (user.tapMultiplier || 1)))} / tap</span>
            <span>{isReady ? '🟢 Hazır' : 'Yenileniyor...'}</span>
          </div>
        </div>

        {/* Hızlı stat çipleri */}
        <div className="adn-stat-chips">
          <div className="adn-stat-chip adn-stat-chip--gold">
            <span>💰</span>
            <div>
              <div className="adn-stat-chip__label">Saatlik</div>
              <div className="adn-stat-chip__val"><AnimatedNumber value={user.passiveIncomePerHour} compact />/s</div>
            </div>
          </div>
          <div className="adn-stat-chip adn-stat-chip--cyan">
            <span>🎯</span>
            <div>
              <div className="adn-stat-chip__label">Tap Gücü</div>
              <div className="adn-stat-chip__val">+{fmt(user.tapPower)}</div>
            </div>
          </div>
          <div className="adn-stat-chip">
            <span>📦</span>
            <div>
              <div className="adn-stat-chip__label">Cache</div>
              <div className="adn-stat-chip__val">{chestVault?.readyCount || 0} hazır</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function BoostsSection({
  user,
  boosts,
  shop,
  busyKey,
  highlightedCard,
  now,
  onBoost,
  onShop
}: {
  user: PlayerProfile;
  boosts: BoostCatalogItem[];
  shop: ShopView | null;
  busyKey: string | null;
  highlightedCard: string | null;
  now: number;
  onBoost: (type: BoostCatalogItem['key'], source: 'buy' | 'free') => Promise<void>;
  onShop: (cardKey: string, mode: 'purchase' | 'upgrade') => Promise<void>;
}) {
  const sortedCards = [...(shop?.cards || [])]
    .sort((left, right) => Number(right.unlocked) - Number(left.unlocked))
    .slice(0, 8);

  return (
    <>
      <section className="game-section">
        <div className="game-section__head">
          <div>
            <span className="game-eyebrow">Boost Floor</span>
            <h3 className="game-section__title">Anlik guc patlamasi</h3>
            <p className="game-section__description">Aktif boostlar tum arayuze enerji verir, market ise altyapiyi buyutur.</p>
          </div>
          <span className="game-pill is-success">{user.boosts?.length ? `${user.boosts.length} aktif` : 'Hazir'}</span>
        </div>

        <div className="game-active-boosts">
          {(user.boosts || []).length ? (
            user.boosts?.map((boost) => (
              <div key={`${boost.type}-${boost.expiresAt}`} className="game-active-boost game-active-boost--on">
                <div className="game-task-card__top">
                  <strong>{labelForBoost(boost.type)}</strong>
                  <span className="game-pill is-info">Lv {boost.level}</span>
                </div>
                <div className="game-active-boost__time">{formatCountdown(boost.expiresAt, now)}</div>
                <div className="game-note">Aktif boost suresi biterken yumusak countdown calisir.</div>
              </div>
            ))
          ) : (
            <div className="game-empty">Aktif boost yok. Asagidaki kartlardan birini calistir.</div>
          )}
        </div>

        <div className="game-grid game-grid--triple">
          {boosts.map((boost) => {
            const active = user.boosts?.find((item) => item.type === boost.key) || null;
            const isVip = boost.key === 'vip_weekly';
            const isEvent = boost.key === 'event_pass';
            const badge = (boost as any).badge as string | undefined;
            return (
              <div key={boost.key} className={`game-panel game-boost-card${active ? ' game-boost-card--active' : ''}${isVip ? ' game-boost-card--vip' : ''}${isEvent ? ' game-boost-card--event' : ''}`}>
                <div className="game-task-card__top">
                  <strong>{boost.name}</strong>
                  {badge ? (
                    <span className={`game-pill ${badge === 'VIP' ? 'is-vip' : badge === 'LIMITED' ? 'is-danger' : badge === 'HOT' ? 'is-hot' : 'is-info'}`}>{badge}</span>
                  ) : (
                    <span className="game-pill">{labelForBoost(boost.key)}</span>
                  )}
                </div>
                {(boost as any).description ? (
                  <div className="game-note" style={{ marginBottom: 4 }}>{(boost as any).description}</div>
                ) : (
                  <div className="game-metric-card__value">{boost.value}</div>
                )}
                <div className="game-note">{boost.durationHours < 1 ? `${Math.round(boost.durationHours * 60)} dk` : `${boost.durationHours} saat`} etki.</div>
                <div className="game-actions">
                  <button className={`game-button${isVip ? ' game-button--vip' : ''}`} disabled={Boolean(busyKey)} onClick={() => onBoost(boost.key, 'buy')}>
                    {busyKey === `boost:${boost.key}:buy` ? 'Isleniyor...' : `${fmt(boost.price)} ADN`}
                  </button>
                  {boost.freeClaimCooldownHours ? (
                    <button className="game-button game-button--soft" disabled={Boolean(busyKey)} onClick={() => onBoost(boost.key, 'free')}>
                      Ucretsiz al
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="game-section">
        <div className="game-section__head">
          <div>
            <span className="game-eyebrow">Market</span>
            <h3 className="game-section__title">Modul katmani</h3>
            <p className="game-section__description">Kategori aksanlariyla hangi kartin nasil guclendirdigi ilk bakista okunur.</p>
          </div>
        </div>

        <div className="game-grid game-grid--tasks">
          {sortedCards.map((card) => {
            const category = normalizeCategory(card.category);
            const actionMode = card.level > 0 ? 'upgrade' : 'purchase';
            return (
              <MotionCard key={card.id} className={`game-market-card game-market-card--${category}${highlightedCard === card.id ? ' is-highlighted' : ''}${!card.unlocked ? ' is-locked' : ''}`} active={highlightedCard === card.id}>
                <div className="game-task-card__top">
                  <span className="game-pill">{card.category}</span>
                  <strong>Lv {card.level}</strong>
                </div>
                <h3>{card.name}</h3>
                <p>{card.secondaryEffect}</p>
                <div className="game-market-card__meta">
                  <MetricInline label="Mevcut" value={`${fmt(card.currentHourly)}/s`} />
                  <MetricInline label="Sonraki" value={card.nextTier ? `+${fmt(card.nextTier.deltaHourly)}/s` : 'Maksimum'} />
                  <MetricInline label="Fiyat" value={card.nextTier ? fmt(card.nextTier.costADN) : '-'} />
                </div>
                <button
                  className="game-button"
                  disabled={!card.unlocked || !card.nextTier || Boolean(busyKey)}
                  onClick={() => onShop(card.id, actionMode)}
                >
                  {!card.unlocked ? `Lv ${card.unlockLevel} gerekli` : busyKey === `${actionMode}:${card.id}` ? 'Isleniyor...' : card.level > 0 ? 'LEVEL UP' : 'Satin al'}
                </button>
              </MotionCard>
            );
          })}
        </div>
      </section>
    </>
  );
}

function TasksSection({
  daily,
  user,
  airdropTasks,
  missionBoard,
  busyKey,
  highlightedMission,
  onDailyClaim,
  onAirdropTask,
  onMissionClaim,
  onOpenMissions
}: {
  daily: DailyState | null;
  user: PlayerProfile;
  airdropTasks: AirdropDashboard['tasks'];
  missionBoard: MissionBoard | null;
  busyKey: string | null;
  highlightedMission: string | null;
  onDailyClaim: () => Promise<void>;
  onAirdropTask: (code: string) => Promise<void>;
  onMissionClaim: (mission: MissionItem) => Promise<void>;
  onOpenMissions?: () => void;
}) {
  const [taskTab, setTaskTab] = React.useState<'missions' | 'social' | 'airdrop'>('missions');

  const SOCIAL_TASKS = [
    { id: 'tg_channel', icon: '✈️', title: 'Telegram kanalına katıl', reward: 500, url: 'https://t.me/adntoken', code: 'join_telegram' },
    { id: 'tg_bot', icon: '🤖', title: 'Telegram botu başlat', reward: 300, url: 'https://t.me/adntoken_bot', code: 'start_bot' },
    { id: 'twitter', icon: '𝕏', title: 'X hesabını takip et', reward: 400, url: 'https://x.com/adntoken', code: 'follow_x' },
    { id: 'youtube', icon: '▶️', title: 'YouTube kanalına abone ol', reward: 350, url: 'https://youtube.com/@adntoken', code: 'sub_youtube' },
    { id: 'instagram', icon: '📸', title: 'Instagram\'ı takip et', reward: 300, url: 'https://instagram.com/adntoken', code: 'follow_instagram' },
  ];

  return (
    <section className="game-section" style={{ padding: '14px 12px' }}>
      {/* Başlık */}
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontFamily: 'var(--adn-title-font)', fontSize: 'clamp(1.1rem, 4vw, 1.4rem)', color: 'var(--adn-text)' }}>
          Kazan
        </h2>
      </div>

      {/* Kategori Tab'ları */}
      <div className="adn-task-tabs">
        {([
          { key: 'missions', label: 'Görevler', icon: '✅' },
          { key: 'social', label: 'Sosyal', icon: '🌐' },
          { key: 'airdrop', label: 'Airdrop', icon: '🪂' },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            className={`adn-task-tab${taskTab === tab.key ? ' adn-task-tab--active' : ''}`}
            onClick={() => setTaskTab(tab.key)}
          >
            <span className="adn-task-tab__icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Görevler Tab */}
      {taskTab === 'missions' && (
        <div className="adn-task-list">
          {/* Günlük ödül */}
          <div className={`adn-task-row${daily?.canClaim ? ' adn-task-row--claimable' : ''}`}>
            <div className="adn-task-row__icon">🎁</div>
            <div className="adn-task-row__body">
              <div className="adn-task-row__title">Günlük Ödül</div>
              <div className="adn-task-row__reward">⭐ {fmt(daily?.nextReward || 0)} ADN</div>
            </div>
            <button
              className={`adn-task-btn${daily?.canClaim ? ' adn-task-btn--go' : ' adn-task-btn--done'}`}
              disabled={!daily?.canClaim || Boolean(busyKey)}
              onClick={onDailyClaim}
            >
              {busyKey === 'daily' ? '...' : daily?.canClaim ? 'AL' : '✓'}
            </button>
          </div>

          {/* Mission board */}
          {(missionBoard?.missions || []).map((mission) => {
            const isClaimable = mission.status === 'completed' && !mission.rewardClaimedAt;
            const isDone = Boolean(mission.rewardClaimedAt);
            return (
              <div key={mission.id} className={`adn-task-row${isClaimable ? ' adn-task-row--claimable' : ''}${isDone ? ' adn-task-row--done' : ''}`}>
                <div className="adn-task-row__icon">🎯</div>
                <div className="adn-task-row__body">
                  <div className="adn-task-row__title">{mission.title}</div>
                  <div className="adn-task-row__reward">⭐ {fmt(mission.rewardCoins)} ADN</div>
                  {!isDone && (
                    <div className="adn-task-row__progress">
                      <div className="adn-task-row__progress-bar" style={{ width: `${Math.min(100, (mission.progress / mission.targetValue) * 100)}%` }} />
                    </div>
                  )}
                </div>
                <button
                  className={`adn-task-btn${isDone ? ' adn-task-btn--done' : isClaimable ? ' adn-task-btn--go' : ' adn-task-btn--locked'}`}
                  disabled={!isClaimable || Boolean(busyKey)}
                  onClick={() => onMissionClaim(mission)}
                >
                  {isDone ? '✓' : isClaimable ? 'AL' : `${mission.progress}/${mission.targetValue}`}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Sosyal Tab */}
      {taskTab === 'social' && (
        <div className="adn-task-list">
          {SOCIAL_TASKS.map((task) => {
            const claimed = airdropTasks.find((t) => t.code === task.code)?.claimed;
            return (
              <div key={task.id} className={`adn-task-row${claimed ? ' adn-task-row--done' : ''}`}>
                <div className="adn-task-row__icon" style={{ fontSize: 28 }}>{task.icon}</div>
                <div className="adn-task-row__body">
                  <div className="adn-task-row__title">{task.title}</div>
                  <div className="adn-task-row__reward">⭐ {fmt(task.reward)} ADN</div>
                </div>
                <button
                  className={`adn-task-btn${claimed ? ' adn-task-btn--done' : ' adn-task-btn--go'}`}
                  onClick={() => {
                    if (!claimed) {
                      window.open(task.url, '_blank');
                      onAirdropTask(task.code);
                    }
                  }}
                >
                  {claimed ? '✓' : 'GİT'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Airdrop Tab */}
      {taskTab === 'airdrop' && (
        <div className="adn-task-list">
          {airdropTasks.map((task) => (
            <div key={task.id} className={`adn-task-row${task.claimed ? ' adn-task-row--done' : task.completed ? ' adn-task-row--claimable' : ''}`}>
              <div className="adn-task-row__icon">🪂</div>
              <div className="adn-task-row__body">
                <div className="adn-task-row__title">{task.title}</div>
                <div className="adn-task-row__reward">⭐ {fmt(task.rewardPoints)} ADN</div>
              </div>
              <button
                className={`adn-task-btn${task.claimed ? ' adn-task-btn--done' : task.completed ? ' adn-task-btn--go' : ' adn-task-btn--locked'}`}
                disabled={task.claimed || !task.completed || Boolean(busyKey)}
                onClick={() => onAirdropTask(task.code)}
              >
                {task.claimed ? '✓' : task.completed ? 'AL' : 'KİLİTLİ'}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function DailyCard({
  tone,
  icon,
  title,
  value,
  note,
  history
}: {
  tone: 'gold' | 'cyan' | 'pink';
  icon: AppIconName;
  title: string;
  value: string;
  note: string;
  history?: boolean[];
}) {
  return (
    <div className={`game-daily-card game-daily-card--${tone}`}>
      <span className="game-daily-card__icon">
        <AppIcon name={icon} size={18} />
      </span>
      <div className="game-daily-card__title">{title}</div>
      <div className="game-daily-card__time">{value}</div>
      {history?.length ? (
        <div className="game-streak-history" aria-label="Son 7 gunluk seri">
          {history.map((completed, index) => (
            <span key={index} className={`game-streak-history__dot${completed ? ' is-complete' : ''}`} />
          ))}
        </div>
      ) : null}
      <div className="game-note">{note}</div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  note
}: {
  icon: AppIconName;
  label: string;
  value: React.ReactNode;
  note: string;
}) {
  return (
    <div className="game-metric-card">
      <span className="game-metric-card__icon">
        <AppIcon name={icon} size={18} />
      </span>
      <div className="game-metric-card__label">{label}</div>
      <div className="game-metric-card__value">{value}</div>
      <div className="game-metric-card__note">{note}</div>
    </div>
  );
}

function MetricInline({ label, value }: { label: string; value: string }) {
  return (
    <div className="game-market-card__stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function AirdropTaskCard({
  task,
  busy,
  onClaim
}: {
  task: AirdropDashboard['tasks'][number];
  busy: boolean;
  onClaim: () => Promise<void>;
}) {
  const status = task.claimed ? 'completed' : task.completed ? 'claimable' : 'active';

  return (
    <div className={`game-task-card${status === 'claimable' ? ' is-claimable' : ''}${status === 'completed' ? ' is-completed' : ''}`}>
      <div className="game-task-card__top">
        <span className="game-task-card__reward">+{fmt(task.rewardPoints)} ADN</span>
        <span className={`game-pill${status === 'completed' ? ' is-success' : status === 'claimable' ? ' is-info' : ''}`}>
          {status === 'completed' ? 'Tamamlandi' : status === 'claimable' ? 'Odul hazir' : 'Acik'}
        </span>
      </div>
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <button className="game-button" disabled={busy || !task.completed || task.claimed} onClick={onClaim}>
        {task.claimed ? 'Tamamlandi' : busy ? 'Isleniyor...' : task.completed ? 'Odulu al' : 'Goreve git'}
      </button>
    </div>
  );
}

function MissionCard({
  mission,
  highlighted,
  busy,
  onClaim
}: {
  mission: MissionItem;
  highlighted: boolean;
  busy: boolean;
  onClaim: () => Promise<void>;
}) {
  const isClaimable = mission.status === 'completed' && !mission.rewardClaimedAt;
  const isCompleted = Boolean(mission.rewardClaimedAt);

  return (
    <div className={`game-task-card${isClaimable ? ' is-claimable' : ''}${isCompleted ? ' is-completed' : ''}${highlighted ? ' is-highlighted' : ''}`}>
      <div className="game-task-card__top">
        <span className="game-task-card__reward">+{fmt(mission.rewardCoins)} ADN</span>
        <span className={`game-pill${isCompleted ? ' is-success' : isClaimable ? ' is-info' : ''}`}>
          {isCompleted ? 'Alindi' : isClaimable ? 'CLAIM NOW' : mission.status}
        </span>
      </div>
      <h3>{mission.title}</h3>
      <p>{mission.description}</p>
      <ProgressBar value={mission.progress} max={mission.targetValue} variant={isClaimable ? 'success' : 'violet'} />
      <div className="game-note">{fmt(mission.progress)} / {fmt(mission.targetValue)} ilerleme</div>
      <button className="game-button" disabled={!isClaimable || busy} onClick={onClaim}>
        {isCompleted ? 'Tamamlandi' : busy ? 'Isleniyor...' : isClaimable ? 'Odulu al' : 'Ilerliyor'}
      </button>
    </div>
  );
}

function WalletSection({
  dashboard,
  prestige,
  chestVault,
  walletAddress,
  setWalletAddress,
  busyKey,
  rebootFx,
  rebootReveal,
  onClaimSubmit,
  onOpenChest,
  onPrestige
}: {
  dashboard: AirdropDashboard;
  prestige: PrestigeStatus | null;
  chestVault: ChestVault | null;
  walletAddress: string;
  setWalletAddress: (value: string) => void;
  busyKey: string | null;
  rebootFx: boolean;
  rebootReveal: string;
  onClaimSubmit: () => Promise<void>;
  onOpenChest: (chestId: string) => Promise<void>;
  onPrestige: () => Promise<void>;
}) {
  return (
    <>
      <section className="game-section">
        <div className="game-section__head">
          <div>
            <span className="game-eyebrow">Meta Layer</span>
            <h3 className="game-section__title">RBRT / Reboot System</h3>
            <p className="game-section__description">Buyuk oduller burada patlar: claim, chest ve prestige ayni eksende toplandi.</p>
          </div>
        </div>

        <div className="game-grid game-grid--double">
          <div className="game-panel">
            <h3 className="game-panel__title">Claim cikisi</h3>
            <p className="game-panel__description">Cekim baraji acildiginda claim paneli otomatik daha guclu state'e gecer.</p>
            <ProgressBar value={dashboard.summary.totalPoints} max={dashboard.summary.minimumPoints} variant={dashboard.summary.claimable ? 'success' : 'gold'} ready={dashboard.summary.claimable} />
            <div className="game-info-panel__rows">
              <div className="game-info-panel__row">
                <span>Toplam ADN</span>
                <strong>{fmt(dashboard.summary.totalPoints)}</strong>
              </div>
              <div className="game-info-panel__row">
                <span>Minimum esik</span>
                <strong>{fmt(dashboard.summary.minimumPoints)}</strong>
              </div>
              <div className="game-info-panel__row">
                <span>Tahmini token</span>
                <strong>{fmt(dashboard.summary.estimatedTokens)} ADN</strong>
              </div>
            </div>
            <label className="game-label">
              Cuzdan adresi
              <input className="game-input" value={walletAddress} onChange={(event) => setWalletAddress(event.target.value)} placeholder="0x... veya wallet adresi" />
            </label>
            <button className="game-button" disabled={!dashboard.summary.claimable || !walletAddress || Boolean(busyKey)} onClick={onClaimSubmit}>
              {busyKey === 'claim' ? 'Gonderiliyor...' : dashboard.summary.claimable ? 'Claim talebini gonder' : 'Claim kilitli'}
            </button>
          </div>

          <div className={`game-panel game-reboot-panel${prestige?.canPrestige ? ' is-ready' : ''}${rebootFx ? ' is-firing' : ''}`}>
            <div className="game-task-card__top">
              <h3 className="game-panel__title">Reboot Reactor</h3>
              <span className={`game-pill${prestige?.canPrestige ? ' is-info' : ''}`}>{prestige?.canPrestige ? 'Hazir' : 'Biriktir'}</span>
            </div>
            <div className="game-reboot-panel__power">+{fmt(prestige?.estimatedPower || 0)} POWER</div>
            <p className="game-panel__description">Reset gibi degil, yeniden dogus hissi veren meta odakli bir prestige anı.</p>
            <div className="game-grid game-grid--triple">
              <MetricInline label="Lifetime ADN" value={fmt(prestige?.totalLifetimeEarned || 0)} />
              <MetricInline label="RBRT Cores" value={fmt(prestige?.estimatedCore || 0)} />
              <MetricInline label="Mevcut power" value={fmt(prestige?.prestigePower || 0)} />
            </div>
            <button className="game-button game-button--danger" disabled={!prestige?.canPrestige || Boolean(busyKey)} onClick={onPrestige}>
              {busyKey === 'prestige' ? 'Yukleniyor...' : 'Reboot baslat'}
            </button>
            {rebootReveal ? <div className="game-reboot-panel__reveal">{rebootReveal}</div> : null}
          </div>
        </div>
      </section>

      <section className="game-section">
        <div className="game-section__head">
          <div>
            <span className="game-eyebrow">Vault</span>
            <h3 className="game-section__title">Cache acilisi</h3>
            <p className="game-section__description">Hazir chest'ler claim hissini buyuten ikinci dopamin halkasi olur.</p>
          </div>
        </div>

        <div className="game-grid game-grid--tasks">
          {(chestVault?.items || []).map((item) => (
            <div key={item.id} className={`game-task-card${item.status === 'ready' ? ' is-claimable' : ''}`}>
              <div className="game-task-card__top">
                <span className="game-task-card__reward">{item.rarity.toUpperCase()}</span>
                <span className={`game-pill${item.status === 'ready' ? ' is-info' : ''}`}>{item.status}</span>
              </div>
              <h3>{item.source}</h3>
              <p>{fmt(item.rewardCoins)} ADN, {item.shards} shard, {item.boostMinutes} dk boost.</p>
              <button className="game-button" disabled={item.status !== 'ready' || Boolean(busyKey)} onClick={() => onOpenChest(item.id)}>
                {busyKey === `chest:${item.id}` ? 'Aciliyor...' : item.status === 'ready' ? 'Cache ac' : 'Hazir degil'}
              </button>
            </div>
          ))}
          {!chestVault?.items?.length ? <div className="game-empty">Vault su an bos. Tap core uzerinden yeni chest kovalayabilirsin.</div> : null}
        </div>
      </section>
    </>
  );
}

function SocialSection({
  currentUserId,
  referral,
  clans,
  leaderboard,
  links,
  clanName,
  clanSlug,
  setClanName,
  setClanSlug,
  busyKey,
  now,
  onCopy,
  onCreateClan,
  onJoinClan
}: {
  currentUserId: string;
  referral: ReferralOverview | null;
  clans: ClanOverview | null;
  leaderboard: LeaderboardEntry[];
  links: LinkBundle | null;
  clanName: string;
  clanSlug: string;
  setClanName: (value: string) => void;
  setClanSlug: (value: string) => void;
  busyKey: string | null;
  now: number;
  onCopy: (value: string, message: string) => Promise<void>;
  onCreateClan: () => Promise<void>;
  onJoinClan: () => Promise<void>;
}) {
  const [copiedMessage, setCopiedMessage] = useState('');

  async function handleCopy(value: string, message: string) {
    await onCopy(value, message);
    setCopiedMessage('Kopyalandi!');
    window.setTimeout(() => setCopiedMessage(''), 2000);
  }

  return (
    <>
      <section className="game-section">
        <div className="game-section__head">
          <div>
            <span className="game-eyebrow">Identity</span>
            <h3 className="game-section__title">Profile & Social Layer</h3>
            <p className="game-section__description">Mini leaderboard ve sistem mesajlariyla ekranda online bir enerji kurulur.</p>
          </div>
          <span className="game-pill is-info">{formatCountdown(topOfHour(now), now)} sonra sifirlanir</span>
        </div>

        <div className="game-grid game-grid--double">
          <div className="game-panel">
            <h3 className="game-panel__title">Davet motoru</h3>
            <p className="game-panel__description">FOMO ve growth katmani burada beslenir.</p>
            <div className="game-link-box">{referral?.link || links?.botStartAppUrl || '-'}</div>
            <div className="game-link-box">{links?.referralCode || 'REFERRAL-YOK'}</div>
            <div className="game-actions">
              <button className="game-button-gold game-button--full" onClick={() => handleCopy(referral?.link || links?.botStartAppUrl || '', 'Davet linki kopyalandi.')}>
                Linki kopyala
              </button>
              <button className="game-button game-button--soft" onClick={() => handleCopy(links?.miniAppUrl || '', 'Mini app linki kopyalandi.')}>
                Mini app
              </button>
              <button className="game-button game-button--soft" onClick={() => handleCopy(links?.referralCode || '', 'Referral kodu kopyalandi.')}>
                Referral kodu
              </button>
            </div>
            {copiedMessage ? <div className="game-note">{copiedMessage}</div> : null}
            <div className="game-grid game-grid--triple">
              <MetricInline label="Toplam" value={fmt(referral?.totals.total || 0)} />
              <MetricInline label="Aktif" value={fmt(referral?.totals.active || 0)} />
              <MetricInline label="Reward" value={fmt(referral?.totals.eligibleRewardBalance || 0)} />
            </div>
          </div>

          <div className="game-panel">
            <h3 className="game-panel__title">Syndicate kontrolu</h3>
            <p className="game-panel__description">{clans?.myClan ? `${clans.myClan.name} baglantisi aktif.` : 'Kendi ekibini kur veya var olan bir agin parcası ol.'}</p>
            <div className="game-form">
              <label className="game-label">
                Yeni ekip adi
                <input className="game-input" value={clanName} onChange={(event) => setClanName(event.target.value)} placeholder="Yeni syndicate" />
              </label>
              <button className="game-button" disabled={!clanName || Boolean(busyKey)} onClick={onCreateClan}>
                {busyKey === 'clan:create' ? 'Olusuyor...' : 'Syndicate kur'}
              </button>
              <label className="game-label">
                Katilmak icin slug
                <input className="game-input" value={clanSlug} onChange={(event) => setClanSlug(event.target.value)} placeholder="slug gir" />
              </label>
              <button className="game-button game-button--soft" disabled={!clanSlug || Boolean(busyKey)} onClick={onJoinClan}>
                {busyKey === 'clan:join' ? 'Baglaniyor...' : 'Syndicate katil'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="game-section">
        <div className="game-section__head">
          <div>
            <span className="game-eyebrow">Canli siralama</span>
            <h3 className="game-section__title">Mini leaderboard</h3>
            <p className="game-section__description">Siralama hareketi ve online his ana oyunu daha sosyal hale getirir.</p>
          </div>
        </div>

        <div className="game-list">
          {leaderboard.slice(0, 8).map((entry, index) => (
            <div
              key={entry.id}
              className={`game-leaderboard-row${index === 0 ? ' game-leaderboard-row--gold' : ''}${index === 1 ? ' game-leaderboard-row--silver' : ''}${index === 2 ? ' game-leaderboard-row--bronze' : ''}${entry.id === currentUserId ? ' game-leaderboard-row--self' : ''}`}
            >
              <div className="game-leaderboard-row__rank">#{index + 1}</div>
              <div className="game-leaderboard-row__body">
                <strong>{entry.displayName}</strong>
                <span>@{entry.username || 'adn'}</span>
              </div>
              <div className="game-leaderboard-row__value">{formatCompact(entry.coins)}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function formatPercentValue(value: number) {
  return `${Math.round(value > 1 ? value : value * 100)}%`;
}

function topOfHour(now: number) {
  const next = new Date(now);
  next.setMinutes(59, 59, 999);
  return next.getTime();
}
