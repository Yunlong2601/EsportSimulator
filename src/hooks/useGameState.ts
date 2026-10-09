import { useState, useEffect } from 'react';
import { GamePhase, PlayerStats, RankTier, DraftState, Champion, DynastyState, MatchSimulationLog, DailyChallenge, LoginStreakState, ProGearSkin } from '../types/game';
import { GEAR_CATALOG } from '../data/gear';
import { INITIAL_ROSTER, INITIAL_FACILITIES, SPONSORS_CATALOG } from '../data/dynastyData';
import { CHAMPIONS_DATABASE } from '../data/champions';
import { INITIAL_DAILY_CHALLENGES } from '../data/dailyChallenges';
import { STREAK_DAYS_CONFIG } from '../data/loginStreakData';
import { soundEngine } from '../utils/audio';

const STORAGE_KEY = 'esports_legacy_save_v1';

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

const DEFAULT_PLAYER_STATS: PlayerStats = {
  lp: 340, // Starts in Gold
  rankTier: 'Gold',
  mechanics: 54,
  mental: 68,
  energy: 85,
  money: 180,
  fame: 15,
  winStreak: 2,
  totalGames: 28,
  wins: 18,
  losses: 10,
  ownedGear: []
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
  }
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
          soundEnabled
        })
      );
    } catch {
      // Storage quota or private browsing
    }
  }, [currentPhase, playerStats, dynastyState, trophies, dailyChallenges, loginStreak, soundEnabled]);

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
    money?: number;
    fame?: number;
    isWin?: boolean;
    isLoss?: boolean;
  }) => {
    setPlayerStats((prev) => {
      const nextLp = Math.max(0, prev.lp + (delta.lp || 0));
      const nextRankTier = calculateRankTier(nextLp);
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

      return {
        ...prev,
        lp: nextLp,
        rankTier: nextRankTier,
        mechanics: Math.min(100, Math.max(10, prev.mechanics + (delta.mechanics || 0))),
        mental: Math.min(100, Math.max(5, prev.mental + (delta.mental || 0))),
        energy: Math.min(100, Math.max(0, prev.energy + (delta.energy || 0))),
        money: Math.max(0, prev.money + (delta.money || 0)),
        fame: Math.min(100, Math.max(0, prev.fame + (delta.fame || 0))),
        winStreak,
        wins,
        losses,
        totalGames: prev.totalGames + ((delta.isWin || delta.isLoss) ? 1 : 0)
      };
    });
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

  const watchProReplays = () => {
    if (playerStats.energy < 15) {
      addSoloLog('⚠️ Too exhausted to study replays. Eat or take a nap first!', 'event');
      return;
    }
    soundEngine.playClick();
    applyStatsDelta({
      energy: -15,
      mechanics: 2,
      mental: 3,
      fame: 1
    });
    trackChallengeProgress('VOD_REVIEWS', 1);
    addSoloLog('Analyzed 3 VODs of Worlds finals. Discovered optimal flash-charm pathing. (+2 Mechanics, +3 Mental)', 'event');
  };

  const streamBootcamp = () => {
    if (playerStats.energy < 20) {
      addSoloLog('⚠️ Your eyes are bloodshot. You cannot stream while exhausted!', 'event');
      return;
    }
    soundEngine.playCoin();
    const donation = Math.floor(60 + Math.random() * 80 + playerStats.fame * 1.5);
    const fameGain = Math.floor(2 + Math.random() * 4);
    applyStatsDelta({
      energy: -20,
      money: donation,
      fame: fameGain,
      mental: Math.random() > 0.3 ? 2 : -4
    });
    trackChallengeProgress('STREAMS', 1);
    addSoloLog(`🔴 4-hour Twitch stream concluded! Chat hit 2.4k viewers. Earned $${donation} in subs and bit cheers!`, 'gear');
  };

  const restAndSleep = () => {
    soundEngine.playClick();
    applyStatsDelta({
      energy: 45,
      mental: 18
    });
    addSoloLog('💤 9 hours of deep sleep & good nutrition. Energy and mental fully restored!', 'event');
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
    resetCareer
  };
}
