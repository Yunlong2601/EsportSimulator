import { useState, useEffect, useMemo } from 'react';
import { GamePhase, PlayerStats, RankTier, DraftState, Champion, DynastyState, MatchSimulationLog, DailyChallenge, LoginStreakState, ProGearSkin, CareerMilestone, PromoSeriesState, ConsumableItem, LegacyStatBoost, CareerJournalEntry } from '../types/game';
import { GEAR_CATALOG } from '../data/gear';
import { INITIAL_ROSTER, INITIAL_FACILITIES, SPONSORS_CATALOG } from '../data/dynastyData';
import { CHAMPIONS_DATABASE } from '../data/champions';
import { INITIAL_DAILY_CHALLENGES } from '../data/dailyChallenges';
import { STREAK_DAYS_CONFIG } from '../data/loginStreakData';
import { INITIAL_CAREER_MILESTONES } from '../data/careerMilestones';
import { 
  INITIAL_CAREER_JOURNAL_ENTRIES, 
  createTitleNewspaperClipping, 
  createAgentNewspaperClipping, 
  createTrophyNewspaperClipping 
} from '../data/careerJournalData';
import { soundEngine } from '../utils/audio';
import { RECOVERY_ROOM_CATEGORIES, getTotalRestStats, getRecoveryRoomBonuses } from '../data/recoveryRoomData';
import {
  PLAYER_AGENTS_CONFIG,
  AGENCY_SPONSORSHIPS_CONFIG,
  AGENCY_RECRUITS_CONFIG,
  DEFAULT_PLAYER_AGENCY,
  calculateAgencyActionIncome,
  getAgentById
} from '../data/playerAgencyData';
import { NegotiationTactic, RecruitNegotiationRecord } from '../types/game';
import {
  DEFAULT_CAREER_HEALTH,
  PHYSIO_TREATMENTS,
  evaluateRsiRisk,
  getMaxMechanicsForSeverity
} from '../data/careerHealthData';
import {
  DEFAULT_STREAM_CHANNEL,
  STREAMING_MILESTONES,
  calculateStreamOutcome,
  getEmoteById,
  getNextMilestone
} from '../data/streamingMilestonesData';
import {
  DEFAULT_PLAYER_RIVALRY,
  generateRivalryClashNarrative,
  evaluateTensionStage
} from '../data/rivalryData';
import {
  PrestigeState,
  WorldTourState,
  LegacyPassive,
  RunModifier,
  CareerEnding,
  EsportsCalendarState
} from '../types/game';
import {
  DEFAULT_PRESTIGE_STATE,
  LEGACY_PASSIVES_CATALOG,
  RUN_MODIFIERS_CATALOG,
  CAREER_ENDINGS_CATALOG,
  calculatePrestigeYield,
  evaluateRunEndings,
  getDifficultyMultiplier
} from '../data/prestigeData';
import {
  DEFAULT_WORLD_TOUR_STATE,
  WORLD_TOUR_MERCH_CATALOG,
  generateFloorOpponent,
  simulateWorldTourMatch
} from '../data/worldTourData';
import {
  DEFAULT_ESPORTS_CALENDAR_STATE,
  advanceEsportsCalendar,
  calculateCompoundModifiers,
  getSplitForWeek,
  getPatchForWeek,
  evaluateChampionMeta
} from '../data/esportsEventData';
import {
  DEFAULT_COMMUNITY_RELATIONS,
  CONFIDENCE_TIERS_CONFIG,
  generatePostMatchMvp,
  COMMUNITY_CAMPAIGNS
} from '../data/communityRelationsData';
import { INITIAL_PERIPHERAL_SPONSORSHIP_STATE } from '../data/peripheralSponsorshipData';
import { DEFAULT_EXPANSION_DRAFT_STATE } from '../data/expansionDraftData';
import { DEFAULT_COACHING_STAFF_STATE } from '../data/coachingStaffData';
import { calculateInfrastructureStats } from '../data/infrastructureData';
import { calculateTeamDynamicsState, initializeUnitsForPreset, TACTICAL_PRESETS } from '../data/teamDynamicsData';

const STORAGE_KEY = 'esports_legacy_save_v1';
const PRESTIGE_STORAGE_KEY = 'esports_prestige_save_v1';
const WORLD_TOUR_STORAGE_KEY = 'esports_world_tour_save_v1';
const CALENDAR_STORAGE_KEY = 'esports_calendar_save_v1';
const JOURNAL_STORAGE_KEY = 'esports_career_journal_clippings';

export function calculateRankTier(lp: number): RankTier {
  if (lp >= 1000) return 'Challenger';
  if (lp >= 950) return 'Grandmaster';
  if (lp >= 850) return 'Master';
  if (lp >= 700) return 'Diamond';
  if (lp >= 550) return 'Emerald';
  if (lp >= 400) return 'Platinum';
  if (lp >= 300) return 'Gold';
  if (lp >= 200) return 'Silver';
  if (lp >= 100) return 'Bronze';
  return 'Iron';
}

export const PROMO_TIER_CONFIG: Record<RankTier, {
  nextTier: RankTier;
  thresholdLp: number;
  format: 'BO3' | 'BO5';
  requiredWins: number;
  requiredConsecutiveWins: number;
}> = {
  Iron: { nextTier: 'Bronze', thresholdLp: 100, format: 'BO3', requiredWins: 2, requiredConsecutiveWins: 2 },
  Bronze: { nextTier: 'Silver', thresholdLp: 200, format: 'BO3', requiredWins: 2, requiredConsecutiveWins: 2 },
  Silver: { nextTier: 'Gold', thresholdLp: 300, format: 'BO3', requiredWins: 2, requiredConsecutiveWins: 2 },
  Gold: { nextTier: 'Platinum', thresholdLp: 400, format: 'BO3', requiredWins: 2, requiredConsecutiveWins: 2 },
  Platinum: { nextTier: 'Emerald', thresholdLp: 550, format: 'BO3', requiredWins: 2, requiredConsecutiveWins: 2 },
  Emerald: { nextTier: 'Diamond', thresholdLp: 700, format: 'BO3', requiredWins: 2, requiredConsecutiveWins: 2 },
  Diamond: { nextTier: 'Master', thresholdLp: 850, format: 'BO5', requiredWins: 3, requiredConsecutiveWins: 3 },
  Master: { nextTier: 'Grandmaster', thresholdLp: 950, format: 'BO5', requiredWins: 3, requiredConsecutiveWins: 3 },
  Grandmaster: { nextTier: 'Challenger', thresholdLp: 1000, format: 'BO5', requiredWins: 3, requiredConsecutiveWins: 3 },
  Challenger: { nextTier: 'Challenger', thresholdLp: 9999, format: 'BO5', requiredWins: 3, requiredConsecutiveWins: 3 }
};

const DEFAULT_PLAYER_STATS: PlayerStats = {
  lp: 340, // Starts in Gold
  rankTier: 'Gold',
  mechanics: 54,
  mental: 68,
  energy: 85,
  focus: 90,
  money: 180,
  lifetimeEarnings: 2400,
  fame: 15,
  winStreak: 2,
  totalGames: 28,
  wins: 18,
  losses: 10,
  ownedGear: [],
  traits: ['lane_bully', 'ice_veins'],
  energyDrinks: 2,
  scoutAttention: 35,
  promoSeries: null,
  recoveryRoom: {
    soundproofing: 0,
    bedding: 0,
    atmosphere: 0
  },
  agency: DEFAULT_PLAYER_AGENCY,
  careerHealth: DEFAULT_CAREER_HEALTH,
  streamChannel: DEFAULT_STREAM_CHANNEL,
  rivalry: DEFAULT_PLAYER_RIVALRY,
  confidence: {
    level: 0,
    score: 50,
    matchesLeft: 0,
    currentStreak: 0,
    totalMvpCount: 0,
    lastMvpCard: null
  },
  tacticalInsight: 45
};

const DEFAULT_DYNASTY: DynastyState = {
  budget: 185000,
  weeklyExpenses: 53200,
  fanHype: 8400,
  worldRanking: 14,
  reputation: 65,
  roster: INITIAL_ROSTER,
  activeSponsors: [SPONSORS_CATALOG[0]],
  facilities: INITIAL_FACILITIES,
  worldsProgress: {
    round: 'Quarterfinals',
    matchesWon: 0,
    matchesLost: 0
  },
  communityRelations: DEFAULT_COMMUNITY_RELATIONS,
  peripheralSponsorships: INITIAL_PERIPHERAL_SPONSORSHIP_STATE,
  salaryCapRules: {
    softCap: 70000, // 软工资帽 $70,000/周
    hardCap: 95000, // 硬工资帽 $95,000/周
    weeklyBudgetCap: 80000, // 战队周度最高运营预算帽 $80,000/周
    luxuryTaxRate: 1.5, // 超帽150%惩罚性重税
    agencyFeeRate: 0.10, // 10% 经纪人佣金
    luxuryTaxPaidTotal: 0,
    consecutiveOverCapWeeks: 0,
    financialMoralePenalty: 0
  },
  contractBuyoutHistory: [
    {
      id: 'init-contract-1',
      playerName: 'Vortex',
      role: 'TOP',
      baseBuyout: 120000,
      agencyCommission: 12000,
      totalPaid: 132000,
      annualSalary: 8500,
      type: 'SIGNING',
      timestamp: '赛季初',
      agencyName: '星域先锋互娱 (Starfield Vanguard)'
    },
    {
      id: 'init-contract-2',
      playerName: '宿命先锋 (你)',
      role: 'MID',
      baseBuyout: 280000,
      agencyCommission: 28000,
      totalPaid: 308000,
      annualSalary: 15000,
      type: 'SIGNING',
      timestamp: '赛季初',
      agencyName: '传奇盛典经纪公司 (Apex Legacy Agency)'
    }
  ],
  expansionDraftState: DEFAULT_EXPANSION_DRAFT_STATE,
  coachingStaff: DEFAULT_COACHING_STAFF_STATE,
  infrastructureStats: calculateInfrastructureStats(INITIAL_FACILITIES),
  teamDynamics: calculateTeamDynamicsState(
    TACTICAL_PRESETS[0].id,
    initializeUnitsForPreset(TACTICAL_PRESETS[0].id, INITIAL_ROSTER),
    INITIAL_ROSTER
  )
};

export function useGameState() {
  const [currentPhase, setCurrentPhase] = useState<GamePhase>(1);
  const [playerStats, setPlayerStats] = useState<PlayerStats>(DEFAULT_PLAYER_STATS);
  const [dynastyState, setDynastyState] = useState<DynastyState>(DEFAULT_DYNASTY);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  // Phase 1 Logs
  const [soloQueueLogs, setSoloQueueLogs] = useState<{ id: string; timestamp: string; message: string; type: 'win' | 'loss' | 'event' | 'gear' }[]>([
    {
      id: 'init-1',
      timestamp: '19:42',
      message: 'Started solo queue grind from your bedroom setup. Eyes set on Challenger 1,000 LP.',
      type: 'event'
    },
    {
      id: 'init-2',
      timestamp: '20:15',
      message: 'Won ranked game on Ahri (9/1/7). +24 LP gained. Current rank: Gold II.',
      type: 'win'
    }
  ]);

  // Scouting modal triggered when 1000 LP reached
  const [showScoutOfferModal, setShowScoutOfferModal] = useState<boolean>(false);
  const [showVictoryModal, setShowVictoryModal] = useState<{
    isOpen: boolean;
    title: string;
    subtitle: string;
    type: 'pro_scout' | 'regional_champ' | 'worlds_champ';
  }>({
    isOpen: false,
    title: '',
    subtitle: '',
    type: 'pro_scout'
  });

  // Trophies collection
  const [trophies, setTrophies] = useState<{
    challengerUnlocked: boolean;
    regionalChampion: boolean;
    worldsSummonerCup: boolean;
    mvpTrophy: boolean;
  }>({
    challengerUnlocked: false,
    regionalChampion: false,
    worldsSummonerCup: false,
    mvpTrophy: false
  });

  // Daily Challenges state
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>(INITIAL_DAILY_CHALLENGES);

  // Daily Login Streak state (7-day retention loop with unique Pro-Gear skins)
  const [loginStreak, setLoginStreak] = useState<LoginStreakState>(() => {
    return {
      currentStreak: 1,
      lastClaimDate: '',
      canClaimToday: true,
      unlockedSkins: [],
      equippedSkinId: undefined
    };
  });

  // Career Milestones & Unique Titles State
  const [milestones, setMilestones] = useState<CareerMilestone[]>(INITIAL_CAREER_MILESTONES);
  const [activeTitle, setActiveTitle] = useState<string | null>(null);

  // Career Journal Retro Newspaper Clippings (各大权威电竞媒体号外剪报)
  const [careerJournal, setCareerJournal] = useState<CareerJournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem(JOURNAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_CAREER_JOURNAL_ENTRIES;
  });

  const addCareerJournalEntry = (entry: CareerJournalEntry) => {
    setCareerJournal(prev => {
      if (prev.some(e => e.headline === entry.headline)) return prev;
      const updated = [entry, ...prev];
      try {
        localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Prestige & New Game+ State (多周目声望轮回与永久肉鸽传承)
  const [prestigeState, setPrestigeState] = useState<PrestigeState>(() => {
    try {
      const saved = localStorage.getItem(PRESTIGE_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_PRESTIGE_STATE;
  });

  // Infinite World Tour State (百层无尽世界巡回赛)
  const [worldTourState, setWorldTourState] = useState<WorldTourState>(() => {
    try {
      const saved = localStorage.getItem(WORLD_TOUR_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_WORLD_TOUR_STATE;
  });

  // Esports Event Engine & Calendar State (26周真实职业赛历时钟)
  const [calendarState, setCalendarState] = useState<EsportsCalendarState>(() => {
    try {
      const saved = localStorage.getItem(CALENDAR_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_ESPORTS_CALENDAR_STATE;
  });

  // Sync Prestige to local storage
  useEffect(() => {
    try {
      localStorage.setItem(PRESTIGE_STORAGE_KEY, JSON.stringify(prestigeState));
    } catch {}
  }, [prestigeState]);

  // Sync World Tour to local storage
  useEffect(() => {
    try {
      localStorage.setItem(WORLD_TOUR_STORAGE_KEY, JSON.stringify(worldTourState));
    } catch {}
  }, [worldTourState]);

  // Sync Calendar to local storage
  useEffect(() => {
    try {
      localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(calendarState));
    } catch {}
  }, [calendarState]);

  // Load saved state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.currentPhase) setCurrentPhase(parsed.currentPhase);
        if (parsed.playerStats) setPlayerStats(parsed.playerStats);
        if (parsed.dynastyState) setDynastyState(parsed.dynastyState);
        if (parsed.trophies) setTrophies(parsed.trophies);
        if (parsed.dailyChallenges) setDailyChallenges(parsed.dailyChallenges);
        if (parsed.loginStreak) {
          const today = new Date().toISOString().slice(0, 10);
          const alreadyClaimedToday = parsed.loginStreak.lastClaimDate === today;
          setLoginStreak({
            ...parsed.loginStreak,
            canClaimToday: !alreadyClaimedToday
          });
        }
        if (typeof parsed.soundEnabled === 'boolean') {
          setSoundEnabled(parsed.soundEnabled);
          soundEngine.enabled = parsed.soundEnabled;
        }
        if (parsed.activeTitle) {
          setActiveTitle(parsed.activeTitle);
        }
        if (parsed.milestones && Array.isArray(parsed.milestones)) {
          // Merge with initial data in case new milestones exist
          setMilestones(prev => {
            const savedMap = new Map<string, { unlocked: boolean; claimed: boolean }>(
              parsed.milestones.map((m: any) => [m.id, { unlocked: m.unlocked, claimed: m.claimed }])
            );
            return prev.map(m => {
              const s = savedMap.get(m.id);
              return s ? { ...m, unlocked: s.unlocked, claimed: s.claimed } : m;
            });
          });
        }
      }
    } catch {
      // Ignore parse error
    }
  }, []);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          currentPhase,
          playerStats,
          dynastyState,
          trophies,
          dailyChallenges,
          loginStreak,
          soundEnabled,
          activeTitle,
          milestones: milestones.map(m => ({ id: m.id, unlocked: m.unlocked, claimed: m.claimed }))
        })
      );
    } catch {
      // Storage quota or private browsing
    }
  }, [currentPhase, playerStats, dynastyState, trophies, dailyChallenges, loginStreak, soundEnabled, activeTitle, milestones]);

  // Real-time evaluation of statistical thresholds across career
  useEffect(() => {
    const gearCount = (playerStats.ownedGear?.length || 0) + (loginStreak.unlockedSkins?.length || 0);
    const worldsWon = trophies.worldsSummonerCup ? 1 : 0;
    const reflexWins = playerStats.reflexWins || 0;

    let hasNewlyUnlocked = false;

    setMilestones(prev => {
      const updated = prev.map(m => {
        let currentVal = 0;
        switch (m.statKey) {
          case 'lp':
            currentVal = playerStats.lp;
            break;
          case 'wins':
            currentVal = playerStats.wins;
            break;
          case 'winStreak':
            currentVal = playerStats.winStreak;
            break;
          case 'mechanics':
            currentVal = playerStats.mechanics;
            break;
          case 'mental':
            currentVal = playerStats.mental;
            break;
          case 'money':
            currentVal = playerStats.money;
            break;
          case 'reflexWins':
            currentVal = reflexWins;
            break;
          case 'worldsWon':
            currentVal = worldsWon;
            break;
          case 'gearCount':
            currentVal = gearCount;
            break;
          case 'reputation':
            currentVal = dynastyState.reputation;
            break;
          default:
            currentVal = 0;
        }

        const shouldUnlock = currentVal >= m.targetValue;
        if (!m.unlocked && shouldUnlock) {
          hasNewlyUnlocked = true;
          // 自动印发生涯快报头版剪报 (Title Milestone Newspaper Clipping)
          const newClipping = createTitleNewspaperClipping({
            title: m.title,
            titleEn: m.titleEn,
            rarity: m.rarity,
            titleBonus: m.titleBonusDesc,
            statRequirement: m.statRequirementText
          });
          setCareerJournal(prevJ => {
            if (prevJ.some(e => e.headline === newClipping.headline)) return prevJ;
            const updated = [newClipping, ...prevJ];
            try {
              localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(updated));
            } catch {}
            return updated;
          });
        }

        return {
          ...m,
          currentValue: currentVal,
          unlocked: m.unlocked || shouldUnlock
        };
      });

      return updated;
    });

    if (hasNewlyUnlocked && soundEnabled) {
      soundEngine.playLevelUp();
    }
  }, [playerStats, dynastyState.reputation, trophies.worldsSummonerCup, loginStreak.unlockedSkins.length, soundEnabled]);

  // Claim Milestone Reward
  const claimMilestone = (milestoneId: string) => {
    const target = milestones.find(m => m.id === milestoneId);
    if (!target || !target.unlocked || target.claimed) return;

    soundEngine.playCoin();
    soundEngine.playVictory();

    setPlayerStats(prev => ({
      ...prev,
      lp: target.rewardLp ? prev.lp + target.rewardLp : prev.lp,
      rankTier: target.rewardLp ? calculateRankTier(prev.lp + target.rewardLp) : prev.rankTier,
      money: target.rewardMoney ? prev.money + target.rewardMoney : prev.money,
      fame: target.rewardFame ? Math.min(100, prev.fame + target.rewardFame) : prev.fame
    }));

    setMilestones(prev =>
      prev.map(m => (m.id === milestoneId ? { ...m, claimed: true } : m))
    );

    // Auto-equip if no title is active yet
    if (!activeTitle) {
      setActiveTitle(target.title);
      setPlayerStats(prev => ({ ...prev, activeTitle: target.title }));
    }
  };

  // Equip or Unequip Unique Title
  const equipTitle = (title: string | null) => {
    soundEngine.playClick();
    setActiveTitle(title);
    setPlayerStats(prev => ({ ...prev, activeTitle: title }));
  };

  // Record a reflex duel win
  const recordReflexWin = () => {
    setPlayerStats(prev => ({
      ...prev,
      reflexWins: (prev.reflexWins || 0) + 1
    }));
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEngine.enabled = next;
    if (next) soundEngine.playClick();
  };

  // Claim Daily Login Streak reward
  const claimDailyLoginStreak = () => {
    if (!loginStreak.canClaimToday) return;

    const streakIdx = (loginStreak.currentStreak - 1) % 7;
    const dayConfig = STREAK_DAYS_CONFIG[streakIdx];

    soundEngine.playCoin();
    soundEngine.playVictory();

    const today = new Date().toISOString().slice(0, 10);
    const newUnlocked = [...loginStreak.unlockedSkins];
    let equipped = loginStreak.equippedSkinId;

    if (dayConfig.proGearSkin && !newUnlocked.some(s => s.id === dayConfig.proGearSkin!.id)) {
      newUnlocked.push(dayConfig.proGearSkin);
      if (!equipped) equipped = dayConfig.proGearSkin.id;
    }

    setLoginStreak({
      currentStreak: loginStreak.currentStreak >= 7 ? 1 : loginStreak.currentStreak + 1,
      lastClaimDate: today,
      canClaimToday: false,
      unlockedSkins: newUnlocked,
      equippedSkinId: equipped
    });

    // Grant rewards
    applyStatsDelta({
      lp: dayConfig.rewardLp,
      money: dayConfig.rewardCash,
      mechanics: dayConfig.proGearSkin ? dayConfig.proGearSkin.mechanicsBonus : 0,
      mental: dayConfig.proGearSkin ? dayConfig.proGearSkin.mentalBonus : 0
    });

    addSoloLog(
      `🔥 DAY ${dayConfig.day} LOGIN STREAK CLAIMED: +${dayConfig.rewardLp} Bonus LP & +$${dayConfig.rewardCash}!${
        dayConfig.proGearSkin ? ` 🌟 UNLOCKED PRO-GEAR SKIN: [${dayConfig.proGearSkin.name}]!` : ''
      }`,
      'win'
    );
  };

  const equipProGearSkin = (skinId: string) => {
    soundEngine.playClick();
    setLoginStreak(prev => ({ ...prev, equippedSkinId: skinId }));
  };

  // Helper to increment daily challenge progress
  const trackChallengeProgress = (type: DailyChallenge['type'], delta: number = 1) => {
    setDailyChallenges(prev =>
      prev.map(ch => {
        if (ch.type === type && !ch.claimed) {
          const nextVal = Math.min(ch.target, ch.current + delta);
          return { ...ch, current: nextVal };
        }
        return ch;
      })
    );
  };

  // Claim reward for a completed daily challenge
  const claimDailyChallenge = (challengeId: string) => {
    const targetChallenge = dailyChallenges.find(c => c.id === challengeId);
    if (!targetChallenge || targetChallenge.current < targetChallenge.target || targetChallenge.claimed) {
      return;
    }

    soundEngine.playCoin();
    soundEngine.playVictory();

    // Mark as claimed
    setDailyChallenges(prev =>
      prev.map(c => c.id === challengeId ? { ...c, claimed: true } : c)
    );

    // Grant rewards
    applyStatsDelta({
      lp: targetChallenge.rewardLp,
      money: targetChallenge.rewardMoney,
      fame: targetChallenge.rewardFame
    });

    addSoloLog(
      `🎁 DAILY CHALLENGE COMPLETED: [${targetChallenge.title}]! Claimed +${targetChallenge.rewardLp} Bonus LP${targetChallenge.rewardMoney ? ` & +$${targetChallenge.rewardMoney}` : ''}!`,
      'win'
    );
  };

  // Switch phase manually
  const changePhase = (phase: GamePhase) => {
    soundEngine.playClick();
    setCurrentPhase(phase);
  };

  // --- PHASE 1 ACTIONS ---
  const applyStatsDelta = (delta: {
    lp?: number;
    mechanics?: number;
    mental?: number;
    energy?: number;
    focus?: number;
    money?: number;
    fame?: number;
    isWin?: boolean;
    isLoss?: boolean;
    isRivalClash?: boolean;
  }) => {
    setPlayerStats((prev) => {
      const compound = calculateCompoundModifiers(calendarState.currentWeek);
      let effectiveLpDelta = delta.lp || 0;
      if (delta.isWin && effectiveLpDelta > 0) {
        effectiveLpDelta = Math.round(effectiveLpDelta * compound.lpMult);
        if (prestigeState.unlockedPassives.includes('passive_ladder_smurf')) {
          effectiveLpDelta = Math.round(effectiveLpDelta * 1.25);
        }
      }
      let effectiveFocusDelta = delta.focus || 0;
      if (effectiveFocusDelta < 0) {
        effectiveFocusDelta = Math.round(effectiveFocusDelta * compound.focusDrainMult);
        if (prestigeState.unlockedPassives.includes('passive_fatigue_metabolism')) {
          effectiveFocusDelta = Math.round(effectiveFocusDelta * 0.65);
        }
      }

      let nextLp = Math.max(0, prev.lp + effectiveLpDelta);
      const currentTier = prev.rankTier;
      const config = PROMO_TIER_CONFIG[currentTier];
      let nextRankTier = currentTier;

      // Promo Series Locking:
      if (prev.promoSeries && prev.promoSeries.active) {
        // While inside a promo series, keep tier locked until series is won
        nextRankTier = currentTier;
      } else if (config && currentTier !== 'Challenger' && nextLp >= config.thresholdLp) {
        // Player reached boundary for promotion: cap LP at threshold and trigger promo series!
        nextLp = config.thresholdLp;
        nextRankTier = currentTier;
        setTimeout(() => {
          triggerPromoSeries(config.nextTier, config.format);
        }, 120);
      } else {
        nextRankTier = calculateRankTier(nextLp);
      }

      const prevTier = prev.rankTier;

      if (nextRankTier !== prevTier && nextLp > prev.lp) {
        soundEngine.playRankUp();
      }

      // Check Challenger milestone (1,000 LP)
      if (nextLp >= 1000 && !trophies.challengerUnlocked) {
        setTrophies(t => ({ ...t, challengerUnlocked: true }));
        setShowScoutOfferModal(true);
      }

      let winStreak = prev.winStreak;
      let wins = prev.wins;
      let losses = prev.losses;

      if (delta.isWin) {
        winStreak += 1;
        wins += 1;
        soundEngine.playVictory();
        trackChallengeProgress('WIN_GAMES', 1);
        if (winStreak >= 2) {
          trackChallengeProgress('WIN_STREAK', 1);
        }
      } else if (delta.isLoss) {
        winStreak = 0;
        losses += 1;
        soundEngine.playDefeat();
      }

      let agencyPassiveMoney = 0;
      let agencyNext = prev.agency || DEFAULT_PLAYER_AGENCY;
      if ((delta.isWin || delta.isLoss) && agencyNext.hiredAgentId) {
        const agencyCalc = calculateAgencyActionIncome(agencyNext, prev.fame);
        agencyPassiveMoney = agencyCalc.passiveCash;
        if (agencyPassiveMoney > 0) {
          agencyNext = {
            ...agencyNext,
            totalEarnedFromAgency: (agencyNext.totalEarnedFromAgency || 0) + agencyPassiveMoney
          };
        }
      }

      let streamChannelNext = prev.streamChannel || DEFAULT_STREAM_CHANNEL;
      const activePerks = streamChannelNext.activePerkIds || [];
      if (delta.isWin) {
        let extraWinSubs = 0;
        let extraWinCash = 0;
        if (activePerks.includes('perk_mental_resonance')) {
          extraWinSubs += 180;
        }
        if (activePerks.includes('perk_galaxy_gravity')) {
          extraWinSubs += 450;
          extraWinCash += 100;
        }
        if (extraWinSubs > 0 || extraWinCash > 0) {
          streamChannelNext = {
            ...streamChannelNext,
            subscribers: streamChannelNext.subscribers + extraWinSubs
          };
          if (extraWinCash > 0) {
            agencyPassiveMoney += extraWinCash;
          }
        }
      }

      let careerHealthNext = prev.careerHealth || DEFAULT_CAREER_HEALTH;
      if (delta.isWin || delta.isLoss) {
        let addedStrain = 14 + (prev.energy < 30 || (prev.focus ?? 100) < 30 ? 8 : 0);
        // 赛历环境词条手腕负荷倍率 (例如 MSI 国际高压 / 世界赛负荷加重)
        if (compound.strainMult !== 1.0) {
          addedStrain = Math.round(addedStrain * compound.strainMult);
        }
        // 永久传承天赋: 钛合金手腕 (劳损累积降低 50%)
        if (prestigeState.unlockedPassives.includes('passive_titanium_wrist')) {
          addedStrain = Math.round(addedStrain * 0.5);
        }
        // 肉鸽挑战词条: 手疾旧患 (劳损累积增加 80%)
        if (prestigeState.activeModifiers.includes('mod_wrist_injury')) {
          addedStrain = Math.round(addedStrain * 1.8);
        }
        const evalResult = evaluateRsiRisk(careerHealthNext, addedStrain, prev.energy, prev.focus ?? 100);
        careerHealthNext = evalResult.nextHealth;
        if (evalResult.rsiTriggered && evalResult.message) {
          addSoloLog(evalResult.message, 'loss');
          soundEngine.playDefeat();
        }
      }

      let rivalryNext = prev.rivalry || DEFAULT_PLAYER_RIVALRY;
      let rivalBonusFame = 0;
      let rivalBonusMoney = 0;

      if (delta.isWin || delta.isLoss) {
        const isClash = delta.isRivalClash ?? (rivalryNext.snipeQueueActive || Math.random() < 0.28);
        if (isClash) {
          const narrative = generateRivalryClashNarrative(!!delta.isWin, rivalryNext);
          const nextPlayerWins = rivalryNext.playerWins + (delta.isWin ? 1 : 0);
          const nextRivalWins = rivalryNext.rivalWins + (delta.isLoss ? 1 : 0);
          const nextTension = Math.min(100, Math.max(0, rivalryNext.tension + narrative.tensionDelta));
          const nextStage = evaluateTensionStage(nextTension);
          rivalBonusFame = narrative.bonusFameDelta;
          rivalBonusMoney = narrative.bonusMoneyDelta;

          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const newClashLog = {
            id: 'clash_' + Date.now(),
            timestamp: timeStr,
            outcome: (delta.isWin ? 'player_win' : 'rival_win') as 'player_win' | 'rival_win',
            scoreSnapshot: `${nextPlayerWins} - ${nextRivalWins}`,
            tensionAfter: nextTension,
            flavorText: narrative.flavorText,
            rivalQuote: narrative.rivalQuote,
            rivalAction: narrative.rivalAction
          };

          rivalryNext = {
            ...rivalryNext,
            playerWins: nextPlayerWins,
            rivalWins: nextRivalWins,
            tension: nextTension,
            tensionStage: nextStage,
            lastClashOutcome: delta.isWin ? 'win' : 'loss',
            rivalStatusQuote: narrative.rivalQuote,
            snipeQueueActive: false,
            clashHistory: [newClashLog, ...(rivalryNext.clashHistory || []).slice(0, 15)]
          };

          addSoloLog(narrative.flavorText, delta.isWin ? 'win' : 'loss');
        }
      }

      let maxAllowedMech = (careerHealthNext.maxMechanics || 100) + (activePerks.includes('perk_galaxy_gravity') ? 5 : 0);
      if (prestigeState.unlockedPassives.includes('passive_deep_champ_pool')) {
        maxAllowedMech += 10;
      }
      const targetMechanics = prev.mechanics + (delta.mechanics || 0);
      const clampedMechanics = Math.min(maxAllowedMech, Math.max(10, Math.min(targetMechanics, maxAllowedMech)));

      return {
        ...prev,
        lp: nextLp,
        rankTier: nextRankTier,
        mechanics: clampedMechanics,
        mental: Math.min(100, Math.max(5, prev.mental + (delta.mental || 0))),
        energy: Math.min(100, Math.max(0, prev.energy + (delta.energy || 0))),
        focus: Math.min(100, Math.max(0, (prev.focus ?? 100) + effectiveFocusDelta)),
        money: Math.max(0, prev.money + (delta.money || 0) + agencyPassiveMoney + rivalBonusMoney),
        lifetimeEarnings: ((delta.money || 0) + agencyPassiveMoney + rivalBonusMoney > 0)
          ? (prev.lifetimeEarnings || prev.money) + (delta.money || 0) + agencyPassiveMoney + rivalBonusMoney
          : (prev.lifetimeEarnings || prev.money),
        fame: Math.min(100, Math.max(0, prev.fame + (delta.fame || 0) + rivalBonusFame)),
        winStreak,
        wins,
        losses,
        totalGames: prev.totalGames + ((delta.isWin || delta.isLoss) ? 1 : 0),
        agency: agencyNext,
        careerHealth: careerHealthNext,
        streamChannel: streamChannelNext,
        rivalry: rivalryNext
      };
    });

    if (delta.isWin || delta.isLoss) {
      advanceCalendarDays(2, delta.isWin ? 'win' : 'loss');
    }
  };

  const addSoloLog = (message: string, type: 'win' | 'loss' | 'event' | 'gear') => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setSoloQueueLogs(prev => [
      {
        id: 'log-' + Date.now() + Math.random(),
        timestamp: timeStr,
        message,
        type
      },
      ...prev.slice(0, 30)
    ]);
  };

  // 推进赛历时钟 (单排排位+2天，录像复盘+1天，直播+1天，深度休整+1天)
  const advanceCalendarDays = (days: number, matchOutcome?: 'win' | 'loss') => {
    setCalendarState(prev => {
      const next = { ...prev };
      if (matchOutcome === 'win') {
        next.splitMatchesPlayed += 1;
        next.splitWins += 1;
      } else if (matchOutcome === 'loss') {
        next.splitMatchesPlayed += 1;
        next.splitLosses += 1;
      }
      const res = advanceEsportsCalendar(next, days, playerStats.lp);
      if (res.logs && res.logs.length > 0) {
        res.logs.forEach(l => {
          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setSoloQueueLogs(logsPrev => [
            { id: 'log-' + Date.now() + Math.random(), timestamp: timeStr, message: l, type: 'event' },
            ...logsPrev.slice(0, 30)
          ]);
        });
      }
      return res.nextState;
    });
  };

  const watchProReplays = () => {
    if (playerStats.energy < 15 || (playerStats.focus ?? 100) < 15) {
      addSoloLog('⚠️ 专注力涣散且精疲力竭！无法深度解析选手战术细节。请先【休整(Rest)】或饮用【咖啡(Coffee)】恢复！', 'event');
      return;
    }
    soundEngine.playClick();
    applyStatsDelta({
      energy: -15,
      focus: -12,
      mechanics: 2,
      mental: 3,
      fame: 1
    });
    advanceCalendarDays(1);
    trackChallengeProgress('VOD_REVIEWS', 1);
    addSoloLog('📺 逐帧复盘 S 赛总决赛第一视角：领悟致命魅惑卡视野绕后技巧！(微操+2, 心态+3, 赛历时间推进1天)', 'event');
  };

  const streamBootcamp = () => {
    if (playerStats.energy < 20 || (playerStats.focus ?? 100) < 20) {
      addSoloLog('⚠️ 双眼布满血丝，专注度与体力不足！高强度直播与观众互动极易红温破防，请先【休整(Rest)】或饮用【咖啡(Coffee)】！', 'event');
      return;
    }
    soundEngine.playCoin();

    const channel = playerStats.streamChannel || DEFAULT_STREAM_CHANNEL;
    const activePerks = channel.activePerkIds || [];
    const streamCalc = calculateStreamOutcome(channel.subscribers, playerStats.fame, activePerks);

    const agencyCalc = calculateAgencyActionIncome(playerStats.agency, playerStats.fame);
    const agentMultiplier = agencyCalc.agent ? (1 + agencyCalc.bonusRate) : 1;
    const baseDonation = (Math.floor(65 + Math.random() * 85 + playerStats.fame * 1.6) + streamCalc.bonusDonation + streamCalc.rocketBonus) * streamCalc.donationMultiplier;
    const donation = Math.floor(baseDonation * agentMultiplier) + agencyCalc.passiveCash;
    const fameGain = Math.floor(2 + Math.random() * 4);

    const newSubscribers = channel.subscribers + streamCalc.subsGain;
    const newPeakViewers = Math.max(channel.peakViewers, streamCalc.peakViewers);
    const newTotalStreams = channel.totalStreams + 1;

    // Detect passed milestones
    const newlyPassedMilestones = STREAMING_MILESTONES.filter(
      m => channel.subscribers < m.subscriberReq && newSubscribers >= m.subscriberReq
    );

    setPlayerStats(prev => ({
      ...prev,
      streamChannel: {
        ...(prev.streamChannel || DEFAULT_STREAM_CHANNEL),
        subscribers: newSubscribers,
        peakViewers: newPeakViewers,
        totalStreams: newTotalStreams
      }
    }));

    applyStatsDelta({
      energy: streamCalc.fatigueCostModifier.energy,
      focus: streamCalc.fatigueCostModifier.focus,
      money: donation,
      fame: fameGain,
      mental: streamCalc.mentalOutcomeBonus
    });

    advanceCalendarDays(1);
    trackChallengeProgress('STREAMS', 1);

    const equippedEmote = getEmoteById(channel.equippedEmoteId);
    const emoteTag = equippedEmote ? ` [弹幕勋章: ${equippedEmote.emoji} ${equippedEmote.name}]` : '';
    const rocketTag = streamCalc.rocketBonus > 0 ? ' 🚀 触发榜一大哥超能火箭空投(+$320)！' : '';

    if (agencyCalc.agent) {
      addSoloLog(`🔴 经纪人【${agencyCalc.agent.name}】助阵直播！新增订阅 +${streamCalc.subsGain}人 (总订阅: ${newSubscribers.toLocaleString()})，打赏与商务分成 +$${donation}${rocketTag}，知名度 +${fameGain}！${emoteTag}`, 'win');
    } else {
      addSoloLog(`🔴 高能直播4小时圆满收工！新增订阅 +${streamCalc.subsGain}人 (总订阅: ${newSubscribers.toLocaleString()})，人气峰值 ${(newPeakViewers / 1000).toFixed(1)}k，打赏 +$${donation}${rocketTag}，名气 +${fameGain}！${emoteTag}`, 'gear');
    }

    if (newlyPassedMilestones.length > 0) {
      soundEngine.playVictory();
      for (const m of newlyPassedMilestones) {
        addSoloLog(`🎉【直播里程碑达成】订阅突破 ${m.subscriberReq.toLocaleString()} 大关！解锁频道特权【${m.perk.name}】与粉丝专属表情【${m.emote.name} ${m.emote.emoji}】！请前往里程碑追踪面板领取！`, 'win');
      }
    }
  };

  const restAndSleep = () => {
    soundEngine.playClick();
    let { energy, focus, mental, bonuses } = getTotalRestStats(playerStats.recoveryRoom);
    if (prestigeState.unlockedPassives.includes('passive_infinite_battery')) {
      energy = Math.round(energy * 1.5);
      focus = Math.round(focus * 1.5);
      mental = Math.round(mental * 1.25);
    }
    applyStatsDelta({
      energy,
      focus,
      mental
    });
    advanceCalendarDays(1);

    const currentHealth = playerStats.careerHealth || DEFAULT_CAREER_HEALTH;
    const strainRelief = 35 + Math.floor(bonuses.energyBonus * 0.8);
    const newStrain = Math.max(0, currentHealth.strain - strainRelief);
    setPlayerStats(prev => ({
      ...prev,
      careerHealth: {
        ...(prev.careerHealth || DEFAULT_CAREER_HEALTH),
        strain: newStrain,
        consecutiveGrinds: 0
      }
    }));

    if (bonuses.energyBonus > 0 || bonuses.focusBonus > 0 || bonuses.mentalBonus > 0) {
      addSoloLog(
        `💤 深度休整 (Recovery Room)：在升级后的睡眠康复舱中深度睡眠8小时！恢复 精力+${energy} (含环境加成+${bonuses.energyBonus})、专注度+${focus}% (含加成+${bonuses.focusBonus}%)、心态+${mental} (含加成+${bonuses.mentalBonus})！身心疲劳光速排空！`,
        'event'
      );
    } else {
      addSoloLog(
        '💤 深度休整 (Rest)：深度睡眠8小时与高蛋白电竞营养餐！精力+45，专注度+50%，心态+18，全面解除疲劳！(提示：在康复休整室升级隔音工程与高奢寝具可成倍提升疲劳恢复效率)',
        'event'
      );
    }

    if (currentHealth.hasRSI) {
      addSoloLog(
        `⚠️ 深度睡眠休整排空了大部分手部酸胀，但确诊的【${currentHealth.rsiSeverity}腱鞘炎(RSI)】韧带病灶仍未愈合，当前操作上限仍被限制在 ${currentHealth.maxMechanics} 点！需前往【电竞理疗中心】接受专业医生微创康复！`,
        'event'
      );
    }
  };

  const upgradeRecoveryRoom = (category: 'soundproofing' | 'bedding' | 'atmosphere'): { success: boolean; message: string } => {
    const currentRoom = playerStats.recoveryRoom || { soundproofing: 0, bedding: 0, atmosphere: 0 };
    const currentLevel = currentRoom[category] ?? 0;
    const catData = RECOVERY_ROOM_CATEGORIES.find(c => c.id === category);
    if (!catData) return { success: false, message: '未找到对应睡眠环境分类' };

    const nextLevelData = catData.levels[currentLevel + 1];
    if (!nextLevelData) {
      return { success: false, message: `【${catData.title}】已达到最高顶奢标准，无可再升级！` };
    }

    if (playerStats.money < nextLevelData.cost) {
      soundEngine.playClick();
      addSoloLog(`❌ 资金不足：升级【${nextLevelData.name}】需要 $${nextLevelData.cost}，当前仅有 $${playerStats.money}。`, 'event');
      return { success: false, message: `资金不足，需 $${nextLevelData.cost}` };
    }

    soundEngine.playCoin();
    const newRoom = {
      soundproofing: currentRoom.soundproofing ?? 0,
      bedding: currentRoom.bedding ?? 0,
      atmosphere: currentRoom.atmosphere ?? 0,
      [category]: currentLevel + 1
    };

    setPlayerStats(prev => ({
      ...prev,
      money: prev.money - nextLevelData.cost,
      recoveryRoom: newRoom
    }));

    const newTotals = getTotalRestStats(newRoom);
    const successMsg = `🛏️ 康复休整室升级！安装【${nextLevelData.name}】(-$${nextLevelData.cost})！单次休整睡眠恢复提升为：+${newTotals.energy} 精力 / +${newTotals.focus}% 专注 / +${newTotals.mental} 心态！`;
    addSoloLog(successMsg, 'gear');
    return { success: true, message: successMsg };
  };

  // --- PLAYER AGENCY (经纪人事务所系统) ---
  const hirePlayerAgent = (agentId: string): { success: boolean; message: string } => {
    const agent = PLAYER_AGENTS_CONFIG.find(a => a.id === agentId);
    if (!agent) return { success: false, message: '未找到指定经纪人' };

    if (playerStats.fame < agent.fameReq) {
      soundEngine.playClick();
      addSoloLog(`❌ 签约被拒：【${agent.name}】要求知名度达到 ${agent.fameReq}，当前仅为 ${playerStats.fame}。`, 'event');
      return { success: false, message: `知名度不足，需达到 ${agent.fameReq}` };
    }

    if (playerStats.money < agent.cost) {
      soundEngine.playClick();
      addSoloLog(`❌ 资金不足：签约【${agent.name}】需预付金/佣金 $${agent.cost}，当前仅有 $${playerStats.money}。`, 'event');
      return { success: false, message: `资金不足，需 $${agent.cost}` };
    }

    soundEngine.playCoin();
    soundEngine.playVictory();

    setPlayerStats(prev => ({
      ...prev,
      money: prev.money - agent.cost,
      agency: {
        hiredAgentId: agent.id,
        signedSponsors: prev.agency?.signedSponsors || [],
        accumulatedPassiveIncome: prev.agency?.accumulatedPassiveIncome || 0,
        totalEarnedFromAgency: prev.agency?.totalEarnedFromAgency || 0
      }
    }));

    const msg = `🤝【经纪约签订】正式签约【${agent.name}】(${agent.title})！专属商业特权【${agent.perkName}】生效：知名度被动收益提升，商业赞助与直播溢价 +${Math.round(agent.sponsorshipBonusRate * 100)}%！`;
    addSoloLog(msg, 'win');

    // 自动印发生涯快报：签约经纪人号外特刊
    const agentClipping = createAgentNewspaperClipping({
      agentName: agent.name,
      agentTitle: agent.title,
      tier: agent.tier,
      perkDescription: agent.perkDescription,
      agencyCost: agent.cost
    });
    addCareerJournalEntry(agentClipping);

    return { success: true, message: msg };
  };

  const firePlayerAgent = () => {
    soundEngine.playClick();
    setPlayerStats(prev => ({
      ...prev,
      agency: {
        ...(prev.agency || DEFAULT_PLAYER_AGENCY),
        hiredAgentId: null
      }
    }));
    addSoloLog('📋 已解除当前专属经纪约，恢复自由选手身份。', 'event');
  };

  const signAgencySponsorship = (sponsorId: string): { success: boolean; message: string } => {
    const sponsor = AGENCY_SPONSORSHIPS_CONFIG.find(s => s.id === sponsorId);
    if (!sponsor) return { success: false, message: '未找到指定赞助方案' };

    const currentAgency = playerStats.agency || DEFAULT_PLAYER_AGENCY;
    if (!currentAgency.hiredAgentId) {
      return { success: false, message: '需先聘用职业经纪人才能谈判签署商业赞助' };
    }

    if ((currentAgency.signedSponsors || []).includes(sponsorId)) {
      return { success: false, message: '该商业代言合约已在执行中' };
    }

    if (playerStats.fame < sponsor.fameReq) {
      return { success: false, message: `知名度不足，需达到 ${sponsor.fameReq}` };
    }

    const agent = getAgentById(currentAgency.hiredAgentId);
    const bonusRate = agent ? agent.sponsorshipBonusRate : 0;
    const finalSigningBonus = Math.floor(sponsor.signingBonus * (1 + bonusRate));

    soundEngine.playCoin();
    soundEngine.playVictory();

    setPlayerStats(prev => ({
      ...prev,
      money: prev.money + finalSigningBonus,
      fame: Math.min(100, prev.fame + 3),
      agency: {
        ...(prev.agency || DEFAULT_PLAYER_AGENCY),
        signedSponsors: [...(prev.agency?.signedSponsors || []), sponsorId],
        totalEarnedFromAgency: (prev.agency?.totalEarnedFromAgency || 0) + finalSigningBonus
      }
    }));

    const msg = `🎉【商业代言达成】经纪人成功促成【${sponsor.brand}】代言！获得签字费 +$${finalSigningBonus} (含经纪人议价加成 +${Math.round(bonusRate * 100)}%)！知名度 +3！`;
    addSoloLog(msg, 'win');
    return { success: true, message: msg };
  };

  const claimAgencyIncome = (): { success: boolean; message: string } => {
    const accrued = playerStats.agency?.accumulatedPassiveIncome || 0;
    if (accrued <= 0) return { success: false, message: '暂无待领取的经纪商业分红' };

    soundEngine.playCoin();
    setPlayerStats(prev => ({
      ...prev,
      money: prev.money + accrued,
      agency: {
        ...(prev.agency || DEFAULT_PLAYER_AGENCY),
        accumulatedPassiveIncome: 0,
        totalEarnedFromAgency: (prev.agency?.totalEarnedFromAgency || 0) + accrued
      }
    }));
    addSoloLog(`💰【商务收益结算】成功提取累积经纪商业被动分红 +$${accrued}！`, 'win');
    return { success: true, message: `成功提取 +$${accrued}` };
  };

  const signAgencyRecruit = (
    recruitId: string,
    tactic: NegotiationTactic,
    negotiatedCommission: number,
    negotiatedBonus: number,
    outcome: 'legendary' | 'success' | 'compromise',
    summary: string
  ): { success: boolean; message: string } => {
    const recruit = AGENCY_RECRUITS_CONFIG.find(r => r.id === recruitId);
    if (!recruit) return { success: false, message: '未找到指定新秀选手' };

    const currentAgency = playerStats.agency || DEFAULT_PLAYER_AGENCY;
    if (!currentAgency.hiredAgentId) {
      return { success: false, message: '需先聘用职业经纪人才能代表事务所签约新秀' };
    }

    if ((currentAgency.signedRecruits || []).includes(recruitId)) {
      return { success: false, message: '该新星已在旗下签约代理大名单中' };
    }

    if (playerStats.fame < recruit.fameReq) {
      return { success: false, message: `事务所知名度不足，需达到 ${recruit.fameReq} Fame` };
    }

    // Commission earned immediately upon brokering the contract signing
    const earnedCommission = Math.floor(negotiatedBonus * negotiatedCommission);
    const fameGained = outcome === 'legendary' ? 4 : outcome === 'success' ? 3 : 2;

    const newRecord: RecruitNegotiationRecord = {
      id: `neg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      recruitId,
      recruitName: recruit.name,
      tactic,
      baseCommission: recruit.baseCommissionRate,
      finalCommission: negotiatedCommission,
      baseSigningBonus: recruit.baseSigningBonus,
      finalSigningBonus: negotiatedBonus,
      outcome,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      summary
    };

    soundEngine.playCoin();
    soundEngine.playVictory();

    setPlayerStats(prev => ({
      ...prev,
      money: prev.money + earnedCommission,
      fame: Math.min(100, prev.fame + fameGained),
      agency: {
        ...(prev.agency || DEFAULT_PLAYER_AGENCY),
        signedRecruits: [...(prev.agency?.signedRecruits || []), recruitId],
        negotiationHistory: [newRecord, ...(prev.agency?.negotiationHistory || [])],
        totalEarnedFromAgency: (prev.agency?.totalEarnedFromAgency || 0) + earnedCommission
      }
    }));

    const msg = `🤝【新秀经纪代理达成】签约新星【${recruit.name}】！收取首期经纪佣金 +$${earnedCommission} (${(negotiatedCommission * 100).toFixed(1)}%)！知名度 +${fameGained}！`;
    addSoloLog(msg, 'win');
    return { success: true, message: msg };
  };

  const treatCareerHealth = (treatmentId: string): { success: boolean; message: string } => {
    const treatment = PHYSIO_TREATMENTS.find(t => t.id === treatmentId);
    if (!treatment) return { success: false, message: '未找到指定理疗项目' };

    if (playerStats.money < treatment.cost) {
      soundEngine.playClick();
      const msg = `❌ 资金不足：接受【${treatment.name}】需要支付 $${treatment.cost}，当前仅有 $${playerStats.money}。`;
      addSoloLog(msg, 'event');
      return { success: false, message: msg };
    }

    soundEngine.playCoin();
    soundEngine.playVictory();

    const oldSeverity = playerStats.careerHealth?.rsiSeverity || 'none';
    const hadRsi = playerStats.careerHealth?.hasRSI || false;
    let cured = false;

    setPlayerStats(prev => {
      const curHealth = prev.careerHealth || DEFAULT_CAREER_HEALTH;
      const newStrain = Math.max(0, curHealth.strain - treatment.strainRelief);
      const canCure = curHealth.hasRSI && treatment.curesSeverity.includes(curHealth.rsiSeverity);
      cured = canCure;

      const nextSeverity = canCure ? 'none' : curHealth.rsiSeverity;
      const nextHasRsi = !canCure && curHealth.hasRSI;
      const nextMaxMechanics = canCure ? 100 : curHealth.maxMechanics;
      const isPerk = treatment.id === 'physio_team_doctor_contract' ? true : curHealth.physioPerkActive;

      return {
        ...prev,
        money: prev.money - treatment.cost,
        mental: Math.min(100, prev.mental + 15),
        mechanics: canCure ? Math.min(100, Math.max(prev.mechanics, 75)) : Math.min(nextMaxMechanics, prev.mechanics),
        careerHealth: {
          ...curHealth,
          strain: newStrain,
          hasRSI: nextHasRsi,
          rsiSeverity: nextSeverity,
          maxMechanics: nextMaxMechanics,
          treatmentsCount: curHealth.treatmentsCount + 1,
          physioPerkActive: isPerk
        }
      };
    });

    const successMsg = hadRsi && cured
      ? `🩺 【康复奇迹】接受【${treatment.name}】(-$${treatment.cost})！成功治愈【${oldSeverity}】腱鞘炎(RSI)，受创肌腱彻底修复，最大操作上限恢复至 100 巅峰！`
      : `🩺 【理疗康复】接受【${treatment.name}】(-$${treatment.cost})！手腕累积劳损负荷降低 ${treatment.strainRelief}%，肌群松解神经释压，心态+15！`;

    addSoloLog(successMsg, 'win');
    return { success: true, message: successMsg };
  };

  const claimStreamMilestone = (milestoneId: string): { success: boolean; message: string } => {
    const milestone = STREAMING_MILESTONES.find(m => m.id === milestoneId);
    if (!milestone) return { success: false, message: '未找到指定直播里程碑' };

    const channel = playerStats.streamChannel || DEFAULT_STREAM_CHANNEL;
    if (channel.subscribers < milestone.subscriberReq) {
      soundEngine.playClick();
      return {
        success: false,
        message: `尚未达成订阅目标：需 ${milestone.subscriberReq.toLocaleString()} 订阅，当前为 ${channel.subscribers.toLocaleString()}`
      };
    }

    if ((channel.unlockedMilestones || []).includes(milestoneId)) {
      return { success: false, message: '该里程碑奖励与特权已领取' };
    }

    soundEngine.playCoin();
    soundEngine.playVictory();

    const newUnlockedMilestones = [...(channel.unlockedMilestones || []), milestoneId];
    const newActivePerkIds = Array.from(new Set([...(channel.activePerkIds || []), milestone.perk.id]));
    const newUnlockedEmoteIds = Array.from(new Set([...(channel.unlockedEmoteIds || []), milestone.emote.id]));
    const newEquipped = channel.equippedEmoteId || milestone.emote.id;

    setPlayerStats(prev => ({
      ...prev,
      money: prev.money + milestone.rewardMoney,
      fame: Math.min(100, prev.fame + milestone.rewardFame),
      streamChannel: {
        ...(prev.streamChannel || DEFAULT_STREAM_CHANNEL),
        unlockedMilestones: newUnlockedMilestones,
        activePerkIds: newActivePerkIds,
        unlockedEmoteIds: newUnlockedEmoteIds,
        equippedEmoteId: newEquipped
      }
    }));

    const msg = `🎁【已领取直播里程碑】突破 ${milestone.subscriberReq.toLocaleString()} 订阅！获得奖金 +$${milestone.rewardMoney}、知名度 +${milestone.rewardFame}！永久激活特权【${milestone.perk.name}】并获得专属粉丝表情【${milestone.emote.emoji} ${milestone.emote.name}】！`;
    addSoloLog(msg, 'win');
    return { success: true, message: msg };
  };

  const equipFanEmote = (emoteId: string | null): { success: boolean; message: string } => {
    soundEngine.playClick();
    const emote = getEmoteById(emoteId);
    setPlayerStats(prev => ({
      ...prev,
      streamChannel: {
        ...(prev.streamChannel || DEFAULT_STREAM_CHANNEL),
        equippedEmoteId: emoteId
      }
    }));
    const msg = emote
      ? `✨ 已佩戴专属粉丝表情勋章【${emote.emoji} ${emote.name} (${emote.code})】！将在开播与弹幕互动中展示！`
      : '已卸下专属粉丝表情勋章。';
    addSoloLog(msg, 'event');
    return { success: true, message: msg };
  };

  const toggleRivalSnipeQueue = () => {
    soundEngine.playClick();
    setPlayerStats(prev => {
      const curRival = prev.rivalry || DEFAULT_PLAYER_RIVALRY;
      const nextActive = !curRival.snipeQueueActive;
      const msg = nextActive
        ? `🎯【宿敌狙击雷达启动】已锁定天梯高分队列！下一场排位赛将 100% 狭路相逢宿敌【${curRival.rivalName} (${curRival.rivalHandle})】！火药味瞬间拉满！`
        : `🎯 已关闭宿敌狙击雷达，重回常规天梯随机匹配池。`;
      addSoloLog(msg, nextActive ? 'event' : 'gear');
      return {
        ...prev,
        rivalry: {
          ...curRival,
          snipeQueueActive: nextActive
        }
      };
    });
  };

  // Strategic Choice: Coffee (Instant +50% Focus, +25% Energy)
  const drinkCoffee = () => {
    if ((playerStats.energyDrinks || 0) > 0) {
      soundEngine.playCoin();
      setPlayerStats(prev => ({
        ...prev,
        energyDrinks: Math.max(0, (prev.energyDrinks || 1) - 1),
        energy: Math.min(100, prev.energy + 25),
        focus: Math.min(100, (prev.focus ?? 100) + 50),
        mental: Math.min(100, prev.mental + 8)
      }));
      addSoloLog('☕ 开启背包备战冰美式！高浓度咖啡因注入，专注度 +50%，精力 +25%！疲劳感一扫而空，立刻重返战场！', 'win');
      return;
    }

    if (playerStats.money < 20) {
      addSoloLog('❌ 资金不足以购买特调咖啡（需 $20）。请选择免费的【深度休整 (Rest)】入睡！', 'event');
      return;
    }

    soundEngine.playCoin();
    applyStatsDelta({
      money: -20,
      energy: 25,
      focus: 50,
      mental: 6
    });
    addSoloLog('☕ 电竞馆自费 $20 现磨双倍浓缩冰美式 (Coffee)！高能咖啡因爆发，专注度 +50%，精力 +25%！手感火热立刻重返冲榜！', 'gear');
  };

  const consumeEnergyDrink = drinkCoffee;

  // Quick Shop Consumables Purchase & Instant Fatigue Refill
  const buyConsumable = (item: ConsumableItem, immediateUse: boolean = true): { success: boolean; message: string } => {
    if (playerStats.money < item.cost) {
      soundEngine.playClick();
      addSoloLog(`❌ 资金不足：购买【${item.name}】需要 $${item.cost}，当前仅有 $${playerStats.money}。`, 'event');
      return { success: false, message: `资金不足，需 $${item.cost}` };
    }

    soundEngine.playCoin();
    if (immediateUse) {
      applyStatsDelta({
        money: -item.cost,
        focus: item.focusRestore,
        energy: item.energyRestore,
        mental: item.mentalRestore
      });
      addSoloLog(`🛒【战备应急速购】花费 $${item.cost} 饮用【${item.name}】！专注度 +${item.focusRestore}%，精力 +${item.energyRestore}%，高强度疲劳瞬间扫除！`, 'win');
      return { success: true, message: `已使用【${item.name}】，专注度 +${item.focusRestore}%！` };
    } else {
      setPlayerStats(prev => ({
        ...prev,
        money: prev.money - item.cost,
        energyDrinks: (prev.energyDrinks || 0) + 1
      }));
      addSoloLog(`🛒【战备速购】花费 $${item.cost} 选购【${item.name}】存入战备背包（随身备用咖啡/能量饮存量: ${(playerStats.energyDrinks || 0) + 1} 罐）！`, 'gear');
      return { success: true, message: `已将【${item.name}】存入随身战备背包！` };
    }
  };

  // Zero-energy Tactical Theory Review
  const reviewTacticalTheory = () => {
    soundEngine.playClick();
    applyStatsDelta({
      mechanics: 1,
      mental: 4,
      fame: 1
    });
    trackChallengeProgress('VOD_REVIEWS', 1);
    addSoloLog('📖 零体力消耗 · 战术理论研讨：研读世界赛 14.20 兵线慢推与四包二越塔教案 (+1 微操, +4 心态)', 'event');
  };

  // Promotion Series State Machine
  const triggerPromoSeries = (targetTier?: RankTier, overrideFormat?: 'BO3' | 'BO5') => {
    soundEngine.playRankUp();
    const currentTier = playerStats.rankTier;
    const config = PROMO_TIER_CONFIG[currentTier];
    const finalTarget = targetTier || config?.nextTier || 'Platinum';
    const isApex = finalTarget === 'Master' || finalTarget === 'Grandmaster' || finalTarget === 'Challenger';
    const format = overrideFormat || config?.format || (isApex ? 'BO5' : 'BO3');
    const maxGames = format === 'BO5' ? 5 : 3;
    const requiredWins = format === 'BO5' ? 3 : 2;

    const newPromo: PromoSeriesState = {
      targetTier: finalTarget,
      currentTier,
      wins: 0,
      losses: 0,
      consecutiveWins: 0,
      requiredWins,
      requiredConsecutiveWins: requiredWins,
      maxGames,
      history: [],
      active: true,
      format
    };
    setPlayerStats(prev => ({
      ...prev,
      promoSeries: newPromo
    }));
    addSoloLog(`⚔️ 触发【${finalTarget} 段位生死晋级赛】！赛制: ${format} (需斩获 ${requiredWins} 局胜利或 ${requiredWins} 连胜)，全网焦点瞩目！`, 'win');
  };

  const advancePromoSeries = (isWin: boolean) => {
    setPlayerStats(prev => {
      if (!prev.promoSeries) return prev;
      const promo = { ...prev.promoSeries };
      const newHistory = [...promo.history, isWin ? ('WIN' as const) : ('LOSS' as const)];
      const newWins = promo.wins + (isWin ? 1 : 0);
      const newLosses = promo.losses + (isWin ? 0 : 1);
      const newConsecutive = isWin ? ((promo.consecutiveWins || 0) + 1) : 0;
      const scoreText = `${newWins}-${newLosses}`;

      // Check win condition: either hit required consecutive wins (e.g. 2-0) or required total wins (e.g. 2-1 or 3-1)
      const isWon = newConsecutive >= (promo.requiredConsecutiveWins || promo.requiredWins) || newWins >= promo.requiredWins;
      const isLost = !isWon && (newLosses > promo.maxGames - promo.requiredWins || newHistory.length >= promo.maxGames);

      if (isWon) {
        soundEngine.playVictory();
        addSoloLog(`🏆 晋级成功！比分【${scoreText}】达成！完美斩获 ${promo.format || `BO${promo.maxGames}`} 生死晋级赛，荣耀晋升【${promo.targetTier}】！`, 'win');
        return {
          ...prev,
          rankTier: promo.targetTier,
          promoSeries: null,
          fame: Math.min(100, prev.fame + 15),
          scoutAttention: Math.min(100, (prev.scoutAttention || 0) + 25),
          lp: prev.lp + 25,
          winStreak: prev.winStreak + 1
        };
      } else if (isLost) {
        soundEngine.playDefeat();
        addSoloLog(`💀 晋级赛遗憾惜败 (终局比分【${scoreText}】)。未能在 ${promo.format || `BO${promo.maxGames}`} 晋级赛中突围，积分回退 20 LP，吸取经验调整心态！`, 'loss');
        return {
          ...prev,
          promoSeries: null,
          lp: Math.max(0, prev.lp - 20),
          winStreak: 0
        };
      } else {
        soundEngine.playClick();
        addSoloLog(`⚔️ 晋级赛第 ${newHistory.length} 局战罢：${isWin ? '获胜！' : '惜败。'} 当前比分【${scoreText}】${newConsecutive > 0 ? ` (🔥 ${newConsecutive} 连胜中)` : ''}！`, isWin ? 'win' : 'loss');
        return {
          ...prev,
          promoSeries: {
            ...promo,
            wins: newWins,
            losses: newLosses,
            consecutiveWins: newConsecutive,
            history: newHistory
          }
        };
      }
    });
  };

  const forfeitPromoSeries = () => {
    soundEngine.playDefeat();
    setPlayerStats(prev => {
      if (!prev.promoSeries) return prev;
      addSoloLog(`⚠️ 主动放弃晋级赛：重置系列赛，扣除 20 LP。`, 'loss');
      return {
        ...prev,
        promoSeries: null,
        lp: Math.max(0, prev.lp - 20)
      };
    });
  };

  const unlockPlayerTrait = (traitId: string) => {
    setPlayerStats(prev => {
      const current = prev.traits || [];
      if (current.includes(traitId)) return prev;
      soundEngine.playVictory();
      return {
        ...prev,
        traits: [...current, traitId]
      };
    });
  };

  const buyGear = (item: typeof GEAR_CATALOG[0]) => {
    if (playerStats.money < item.cost) {
      addSoloLog(`❌ Insufficient funds to buy ${item.name} ($${item.cost} required).`, 'event');
      return;
    }
    if (playerStats.ownedGear.includes(item.id)) {
      addSoloLog(`Already own ${item.name}.`, 'event');
      return;
    }
    soundEngine.playCoin();
    setPlayerStats(prev => ({
      ...prev,
      money: prev.money - item.cost,
      mechanics: Math.min(100, prev.mechanics + item.mechanicsBonus),
      mental: Math.min(100, prev.mental + item.mentalBonus),
      ownedGear: [...prev.ownedGear, item.id]
    }));
    addSoloLog(`🛒 Purchased [${item.name}]! +${item.mechanicsBonus} Mechanics, +${item.mentalBonus} Mental.`, 'gear');
  };

  // Advance from Phase 1 to Phase 2 via Scout Contract
  const acceptScoutOffer = () => {
    setShowScoutOfferModal(false);
    setShowVictoryModal({
      isOpen: true,
      title: 'SIGNED TO PRO ACADEMY!',
      subtitle: 'You are now starting shotcaller on the Arena Stage. Welcome to the Draft & Tactics Era.',
      type: 'pro_scout'
    });
    setCurrentPhase(2);
    soundEngine.playVictory();

    // 自动印发生涯快报：签约职业青训转会头版
    addCareerJournalEntry({
      id: `scout_pro_${Date.now()}`,
      headline: '【特大号外】一纸职业合约！路人王宿命先锋正式签约LPL职业豪门青训战队！',
      subheadline: '艾欧尼亚千分路人王正式进军职业赛场，战术BP博弈与赛区总冠军征途全面启航！',
      date: `${new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })} · 签约头条`,
      category: 'TRANSFER',
      categoryLabel: '【转会风云】',
      newspaperName: '《全球电竞纪事周报》',
      issueNo: `第 ${Math.floor(Math.random() * 200 + 400)} 期 · 头版特大`,
      editionTag: '头版头条',
      articleBody: '电竞转会期最轰动的悬念终于揭晓！此前在单排天梯掀起滔天巨浪的神秘天才路人王“宿命先锋”，在拒绝多家娱乐公会的重金诱惑后，今日正式与职业电竞俱乐部完成试训签约！俱乐部官方发布公告称，该选手将作为核心主力出战接下来的赛区联赛。无数翘首以盼的粉丝涌入官博送上祝福，期待这位新星在职业聚光灯下掀起新的风暴。',
      keyQuote: '“从今天起，我不只是为了排位分而战，而是为了战队的荣誉与那座最高的奖杯而战。” —— 签约发布会选手感言',
      reporter: '前线驻队记者 · 陆子航',
      stampText: '★ 签约坐实 ★',
      statImpact: '晋升职业选手 · 解锁阶段二职业赛场BP玩法',
      importance: 'BREAKING',
      photoCaption: '签约定妆照：身着红白相间职业战队队服的少年，目光如炬凝视镜头。',
      timestamp: Date.now()
    });
  };

  // Phase 2 to Phase 3 promotion
  const winRegionalChampionship = () => {
    setTrophies(t => ({ ...t, regionalChampion: true }));
    setShowVictoryModal({
      isOpen: true,
      title: 'REGIONAL CHAMPIONS!',
      subtitle: 'You lifted the Regional Trophy and secured the #1 Seed for the World Championship!',
      type: 'regional_champ'
    });
    soundEngine.playVictory();

    // 自动印发生涯快报：赛区联赛总冠军特刊
    addCareerJournalEntry(createTrophyNewspaperClipping({
      trophyName: '赛区联赛总冠军银龙杯',
      seasonName: '夏季赛总决赛',
      flavorDetail: '以摧枯拉朽之势零封宿敌强队，以赛区头号种子身份强势进军全球总决赛！'
    }));
  };

  const winWorldsChampionship = () => {
    setTrophies(t => ({ ...t, worldsSummonerCup: true, mvpTrophy: true }));
    setShowVictoryModal({
      isOpen: true,
      title: 'WORLD CHAMPIONS OF LEAGUE!',
      subtitle: 'The Summoner’s Cup is yours! You have built the greatest esports dynasty in history.',
      type: 'worlds_champ'
    });
    soundEngine.playVictory();

    // 自动印发生涯快报：世界赛召唤师之杯全球头版
    addCareerJournalEntry(createTrophyNewspaperClipping({
      trophyName: '世界赛总冠军 · 召唤师奖杯',
      seasonName: '全球总决赛',
      flavorDetail: '在首尔总决赛决胜局第38分钟大龙坑前，完成世界赛历史上最不可思议的绝杀翻盘！金色的雨落满巨蛋！'
    }));

    // 开启年度休赛期扩军选秀资格并加冕全球冠军
    setDynastyState(prev => ({
      ...prev,
      worldChampionshipsWon: (prev.worldChampionshipsWon || 0) + 1,
      expansionDraftState: prev.expansionDraftState ? {
        ...prev.expansionDraftState,
        isDraftAvailable: true
      } : DEFAULT_EXPANSION_DRAFT_STATE
    }));
  };

  // --- PRESTIGE & NEW GAME+ & WORLD TOUR SYSTEMS ---

  const triggerPrestigeRebirth = (chosenEndingId?: string): { success: boolean; prestigeGained: number; newGeneration: number } => {
    soundEngine.playVictory();
    const wonWorlds = trophies.worldsSummonerCup;
    const wonRegional = trophies.regionalChampion;
    const reachedChallenger = trophies.challengerUnlocked || playerStats.lp >= 1000;

    const newEndings = evaluateRunEndings({
      wonWorlds,
      wonRegional,
      mechanics: playerStats.mechanics,
      fame: playerStats.fame,
      money: playerStats.money,
      subscribers: playerStats.streamChannel?.subscribers || 0,
      generation: prestigeState.generation,
      lifetimePrestige: prestigeState.lifetimePrestigePoints
    });

    if (chosenEndingId && !newEndings.includes(chosenEndingId)) {
      newEndings.push(chosenEndingId);
    }

    const yieldResult = calculatePrestigeYield(
      wonWorlds,
      wonRegional,
      reachedChallenger,
      playerStats.money,
      playerStats.fame,
      prestigeState.activeModifiers,
      prestigeState.generation
    );

    const nextGen = prestigeState.generation + 1;
    const nextMultiplier = getDifficultyMultiplier(nextGen);
    const mergedEndings = Array.from(new Set([...prestigeState.unlockedEndingIds, ...newEndings]));

    setPrestigeState(prev => ({
      ...prev,
      generation: nextGen,
      prestigePoints: prev.prestigePoints + yieldResult.total,
      lifetimePrestigePoints: prev.lifetimePrestigePoints + yieldResult.total,
      difficultyMultiplier: nextMultiplier,
      unlockedEndingIds: mergedEndings,
      totalRunsCompleted: prev.totalRunsCompleted + 1
    }));

    // Calculate inherited starting stats based on unlocked passives
    const inheritedPassives = prestigeState.unlockedPassives;
    const startingMoney = 180 + (inheritedPassives.includes('passive_seed_venture_fund') ? 200000 : 0);
    const startingFame = 15 + (inheritedPassives.includes('passive_fame_inheritance') ? 20 : 0);
    const startingMechanics = 54 + (inheritedPassives.includes('passive_muscle_memory') ? 15 : 0);
    const startingMental = 68 + (inheritedPassives.includes('passive_tactical_precognition') ? 12 : 0);

    // Reset player career to fresh generation with inherited perks
    setPlayerStats({
      ...DEFAULT_PLAYER_STATS,
      money: startingMoney,
      fame: startingFame,
      mechanics: startingMechanics,
      mental: startingMental
    });

    setDynastyState(DEFAULT_DYNASTY);

    setTrophies({
      challengerUnlocked: false,
      regionalChampion: false,
      worldsSummonerCup: false,
      mvpTrophy: false
    });

    setCurrentPhase(1);

    const rebirthLog = `🌀【轮回转生 · 第 ${nextGen} 周目启程】结算斩获 +${yieldResult.total} 名宿声望！当前难度倍率: x${nextMultiplier.toFixed(2)}！永久传承天赋生效中，再铸王朝巅峰！`;
    addSoloLog(rebirthLog, 'win');

    return {
      success: true,
      prestigeGained: yieldResult.total,
      newGeneration: nextGen
    };
  };

  const unlockLegacyPassive = (passiveId: string): { success: boolean; message: string } => {
    const passive = LEGACY_PASSIVES_CATALOG.find(p => p.id === passiveId);
    if (!passive) return { success: false, message: '未找到指定传承天赋' };
    if (prestigeState.unlockedPassives.includes(passiveId)) {
      return { success: false, message: '该天赋已解锁' };
    }
    if (prestigeState.prestigePoints < passive.cost) {
      soundEngine.playClick();
      return { success: false, message: `声望点数不足，需 ${passive.cost} 点` };
    }

    soundEngine.playCoin();
    soundEngine.playLevelUp();

    setPrestigeState(prev => ({
      ...prev,
      prestigePoints: prev.prestigePoints - passive.cost,
      unlockedPassives: [...prev.unlockedPassives, passiveId]
    }));

    const msg = `⚡【点亮永久传承天赋】解锁【${passive.name}】(${passive.bonusSummary})！永久强化生效！`;
    addSoloLog(msg, 'win');
    return { success: true, message: msg };
  };

  const toggleRunModifier = (modifierId: string) => {
    soundEngine.playClick();
    setPrestigeState(prev => {
      const active = prev.activeModifiers || [];
      const isAlreadyActive = active.includes(modifierId);
      const nextActive = isAlreadyActive
        ? active.filter(id => id !== modifierId)
        : [...active, modifierId];
      return {
        ...prev,
        activeModifiers: nextActive
      };
    });
  };

  const battleWorldTourFloor = (): { isWin: boolean; floor: number; score: string; battleLogs: string[]; prestigeReward: number } => {
    const opp = generateFloorOpponent(worldTourState.currentFloor);
    const rosterPowerAvg = dynastyState.roster.reduce((acc, p) => acc + (p.mechanics + p.macro) / 2, 0) / (dynastyState.roster.length || 1);
    const teamPower = Math.round(rosterPowerAvg > 0 ? rosterPowerAvg : (playerStats.mechanics + playerStats.mental) / 2);

    const result = simulateWorldTourMatch(teamPower, opp, prestigeState.unlockedPassives);

    const tokensAwarded = result.isWin ? (opp.isBoss ? 10 : 3) : 1;

    if (result.isWin) {
      soundEngine.playVictory();
      setWorldTourState(prev => ({
        ...prev,
        currentFloor: prev.currentFloor + 1,
        highestFloorCleared: Math.max(prev.highestFloorCleared, prev.currentFloor),
        totalTourTrophies: prev.totalTourTrophies + 1,
        seasonRank: Math.max(1, prev.seasonRank - 15),
        prestigeTokens: (prev.prestigeTokens ?? 35) + tokensAwarded
      }));

      setPrestigeState(prev => ({
        ...prev,
        prestigePoints: prev.prestigePoints + result.prestigeReward,
        lifetimePrestigePoints: prev.lifetimePrestigePoints + result.prestigeReward
      }));

      addSoloLog(`🌍【世界巡回赛大捷】以 ${result.score} 击溃 [${opp.region}] ${opp.teamName}！通关第 ${opp.floor} 层！(+${result.prestigeReward} 声望, +${tokensAwarded} 名宿巡回代币)`, 'win');
    } else {
      soundEngine.playDefeat();
      setWorldTourState(prev => ({
        ...prev,
        prestigeTokens: (prev.prestigeTokens ?? 35) + tokensAwarded
      }));
      if (result.prestigeReward > 0) {
        setPrestigeState(prev => ({
          ...prev,
          prestigePoints: prev.prestigePoints + result.prestigeReward,
          lifetimePrestigePoints: prev.lifetimePrestigePoints + result.prestigeReward
        }));
      }
      addSoloLog(`💀【世界巡回赛惜败】以 ${result.score} 不敌 [${opp.region}] ${opp.teamName} (第 ${opp.floor} 层，虽败犹荣获得 +${tokensAwarded} 名宿巡回代币)。`, 'loss');
    }

    return {
      isWin: result.isWin,
      floor: opp.floor,
      score: result.score,
      battleLogs: result.battleLogs,
      prestigeReward: result.prestigeReward
    };
  };

  const buyWorldTourMerchItem = (itemId: string): { success: boolean; message: string } => {
    const item = WORLD_TOUR_MERCH_CATALOG.find(i => i.id === itemId);
    if (!item) return { success: false, message: '未找到指定外观方案' };

    const currentTokens = worldTourState.prestigeTokens ?? 0;
    const unlocked = worldTourState.unlockedMerchCosmetics || [];

    if (unlocked.includes(itemId)) {
      return { success: false, message: '已拥有该专属巡回赛外观升级' };
    }

    if (currentTokens < item.costTokens) {
      return { success: false, message: `名宿代币不足！需要 ${item.costTokens} 枚，当前拥有 ${currentTokens} 枚` };
    }

    soundEngine.playCoin();
    soundEngine.playVictory();

    setWorldTourState(prev => {
      const newUnlocked = [...(prev.unlockedMerchCosmetics || []), itemId];
      return {
        ...prev,
        prestigeTokens: (prev.prestigeTokens ?? 0) - item.costTokens,
        unlockedMerchCosmetics: newUnlocked,
        equippedStadiumTheme: item.category === 'STADIUM' ? item.id : prev.equippedStadiumTheme,
        equippedJerseyPattern: item.category === 'JERSEY' ? item.id : prev.equippedJerseyPattern,
        equippedBanner: item.category === 'BANNER' ? item.id : prev.equippedBanner
      };
    });

    const msg = `🛍️【巡回商城兑换成功】消耗 ${item.costTokens} 枚名宿代币成功兑换【${item.name}】(${item.badge})！已自动为您装配！`;
    addSoloLog(msg, 'win');
    return { success: true, message: msg };
  };

  const equipWorldTourMerchItem = (itemId: string): { success: boolean; message: string } => {
    const item = WORLD_TOUR_MERCH_CATALOG.find(i => i.id === itemId);
    if (!item) return { success: false, message: '未找到指定外观' };

    const unlocked = worldTourState.unlockedMerchCosmetics || [];
    if (!unlocked.includes(itemId)) {
      return { success: false, message: '尚未解锁该外观' };
    }

    soundEngine.playClick();
    setWorldTourState(prev => ({
      ...prev,
      equippedStadiumTheme: item.category === 'STADIUM' ? item.id : prev.equippedStadiumTheme,
      equippedJerseyPattern: item.category === 'JERSEY' ? item.id : prev.equippedJerseyPattern,
      equippedBanner: item.category === 'BANNER' ? item.id : prev.equippedBanner
    }));

    return { success: true, message: `已成功佩戴装配【${item.name}】！` };
  };

  const executeCommunityCampaign = (campaignId: string): boolean => {
    const campaign = COMMUNITY_CAMPAIGNS.find(c => c.id === campaignId);
    if (!campaign) return false;

    // Check funds & energy
    const currentBudget = currentPhase === 3 ? dynastyState.budget : playerStats.money;
    if (currentBudget < campaign.cost) {
      alert(`资金不足！举办【${campaign.title}】需要 $${campaign.cost.toLocaleString()}`);
      return false;
    }
    if ((playerStats.energy ?? 100) < campaign.energyCost) {
      alert(`精力不足！需要 ${campaign.energyCost} 点精力，请先休息。`);
      return false;
    }

    soundEngine.playCoin();

    // Deduct funds and energy
    if (currentPhase === 3) {
      setDynastyState(prev => {
        const prevComm = prev.communityRelations || DEFAULT_COMMUNITY_RELATIONS;
        const newFanbase = prevComm.fanbaseCount + campaign.fanbaseGain;
        const newMultiplier = Number((prevComm.fanbaseMultiplier + campaign.multiplierGain).toFixed(2));
        return {
          ...prev,
          budget: prev.budget - campaign.cost,
          fanHype: prev.fanHype + campaign.fanbaseGain,
          communityRelations: {
            ...prevComm,
            fanbaseCount: newFanbase,
            fanbaseMultiplier: newMultiplier,
            totalCampaignsRun: prevComm.totalCampaignsRun + 1,
            activeCooldowns: {
              ...prevComm.activeCooldowns,
              [campaignId]: campaign.cooldownDays
            },
            recentActivities: [
              {
                campaignId,
                title: campaign.title,
                fanbaseGain: campaign.fanbaseGain,
                multiplierNow: newMultiplier,
                timestamp: '刚刚'
              },
              ...(prevComm.recentActivities || []).slice(0, 9)
            ]
          }
        };
      });
      setPlayerStats(prev => ({
        ...prev,
        energy: Math.max(0, (prev.energy ?? 100) - campaign.energyCost)
      }));
    } else {
      setPlayerStats(prev => ({
        ...prev,
        money: prev.money - campaign.cost,
        energy: Math.max(0, (prev.energy ?? 100) - campaign.energyCost)
      }));
      setDynastyState(prev => {
        const prevComm = prev.communityRelations || DEFAULT_COMMUNITY_RELATIONS;
        const newFanbase = prevComm.fanbaseCount + campaign.fanbaseGain;
        const newMultiplier = Number((prevComm.fanbaseMultiplier + campaign.multiplierGain).toFixed(2));
        return {
          ...prev,
          communityRelations: {
            ...prevComm,
            fanbaseCount: newFanbase,
            fanbaseMultiplier: newMultiplier,
            totalCampaignsRun: prevComm.totalCampaignsRun + 1,
            activeCooldowns: {
              ...prevComm.activeCooldowns,
              [campaignId]: campaign.cooldownDays
            },
            recentActivities: [
              {
                campaignId,
                title: campaign.title,
                fanbaseGain: campaign.fanbaseGain,
                multiplierNow: newMultiplier,
                timestamp: '刚刚'
              },
              ...(prevComm.recentActivities || []).slice(0, 9)
            ]
          }
        };
      });
    }

    const currentMult = dynastyState.communityRelations?.fanbaseMultiplier || 1.0;
    const nextMult = (currentMult + campaign.multiplierGain).toFixed(2);
    addSoloLog(`📢【社区公关大获全胜】成功举办【${campaign.title}】！新增 +${campaign.fanbaseGain.toLocaleString()} 粉丝，商业赞助乘数升至 ${nextMult}x！`, 'win');
    return true;
  };

  const sendCustomDanmaku = (text: string) => {
    soundEngine.playClick();
    addSoloLog(`💬【发射全屏赛事弹幕】"${text}"，直播间气氛沸腾！`, 'event');
  };

  const awardLegacyMvpBoost = (boost: LegacyStatBoost) => {
    soundEngine.playLevelUp();
    setPlayerStats(prev => {
      const prevTracker = prev.legacyBoosts || {
        permanentMechanics: 0,
        permanentMental: 0,
        permanentFame: 0,
        totalMvpsAwarded: 0
      };

      const newTracker = {
        totalMvpsAwarded: prevTracker.totalMvpsAwarded + 1,
        permanentMechanics: prevTracker.permanentMechanics + (boost.stat === 'mechanics' ? boost.amount : 0),
        permanentMental: prevTracker.permanentMental + (boost.stat === 'mental' ? boost.amount : 0),
        permanentFame: prevTracker.permanentFame + (boost.stat === 'fame' ? boost.amount : 0)
      };

      return {
        ...prev,
        mechanics: Math.min(100, prev.mechanics + (boost.stat === 'mechanics' ? boost.amount : 0)),
        mental: Math.min(100, prev.mental + (boost.stat === 'mental' ? boost.amount : 0)),
        fame: Math.min(100, prev.fame + (boost.stat === 'fame' ? boost.amount : 0)),
        legacyBoosts: newTracker
      };
    });

    addSoloLog(`🌟【赛后 MVP 荣誉加冕】天神下凡 Carry 获赠永久传承属性：${boost.statNameCn} +${boost.amount}！`, 'win');
  };

  const resetCareer = () => {
    if (window.confirm('Reset all career progress back to Solo Queue beginner?')) {
      localStorage.removeItem(STORAGE_KEY);
      setPlayerStats(DEFAULT_PLAYER_STATS);
      setDynastyState(DEFAULT_DYNASTY);
      setTrophies({
        challengerUnlocked: false,
        regionalChampion: false,
        worldsSummonerCup: false,
        mvpTrophy: false
      });
      setCurrentPhase(1);
    }
  };

  return {
    currentPhase,
    setCurrentPhase,
    changePhase,
    playerStats,
    setPlayerStats,
    dynastyState,
    setDynastyState,
    soundEnabled,
    toggleSound,
    soloQueueLogs,
    addSoloLog,
    applyStatsDelta,
    watchProReplays,
    streamBootcamp,
    restAndSleep,
    buyGear,
    showScoutOfferModal,
    setShowScoutOfferModal,
    acceptScoutOffer,
    showVictoryModal,
    setShowVictoryModal,
    trophies,
    dailyChallenges,
    claimDailyChallenge,
    trackChallengeProgress,
    loginStreak,
    claimDailyLoginStreak,
    equipProGearSkin,
    winRegionalChampionship,
    winWorldsChampionship,
    resetCareer,
    milestones,
    activeTitle,
    claimMilestone,
    equipTitle,
    careerJournal,
    addCareerJournalEntry,
    recordReflexWin,
    consumeEnergyDrink,
    drinkCoffee,
    buyConsumable,
    reviewTacticalTheory,
    triggerPromoSeries,
    advancePromoSeries,
    forfeitPromoSeries,
    unlockPlayerTrait,
    upgradeRecoveryRoom,
    hirePlayerAgent,
    firePlayerAgent,
    signAgencySponsorship,
    claimAgencyIncome,
    signAgencyRecruit,
    treatCareerHealth,
    claimStreamMilestone,
    equipFanEmote,
    toggleRivalSnipeQueue,
    prestigeState,
    worldTourState,
    calendarState,
    advanceCalendarDays,
    triggerPrestigeRebirth,
    unlockLegacyPassive,
    toggleRunModifier,
    battleWorldTourFloor,
    buyWorldTourMerchItem,
    equipWorldTourMerchItem,
    executeCommunityCampaign,
    sendCustomDanmaku,
    awardLegacyMvpBoost
  };
}
