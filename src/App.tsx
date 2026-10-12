/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import { MobileStatusBar } from './components/MobileStatusBar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { LeftNavRail } from './components/LeftNavRail';
import { CommandDeck } from './components/CommandDeck';
import { ActionsHub } from './components/ActionsHub';
import { BudgetReviewModal } from './components/phase3/BudgetReviewModal';
import { PhaseOneAmateur } from './components/phase1/PhaseOneAmateur';
import { PhaseTwoStage } from './components/phase2/PhaseTwoStage';
import { PhaseThreeDynasty } from './components/phase3/PhaseThreeDynasty';
import { TrophyModal } from './components/TrophyModal';
import { ScoutOfferModal } from './components/ScoutOfferModal';
import { VictoryModal } from './components/VictoryModal';
import { LuaStudioModal } from './components/LuaStudioModal';
import { ReflexDuelModal } from './components/ReflexDuelModal';
import { MatchStatsModal } from './components/MatchStatsModal';
import { PatchNotesModal } from './components/PatchNotesModal';
import { SocialFeedDrawer } from './components/SocialFeedDrawer';
import { RetirementModal } from './components/RetirementModal';
import { PhaseLockModal } from './components/PhaseLockModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { ScoutGachaModal } from './components/features/ScoutGachaModal';
import { ProLifeSimModal } from './components/features/ProLifeSimModal';
import { TacticalArenaModal } from './components/features/TacticalArenaModal';
import { SynergyNetworkModal } from './components/features/SynergyNetworkModal';
import { HardwareRigModal } from './components/features/HardwareRigModal';
import { CareerMilestoneModal } from './components/CareerMilestoneModal';
import { RecoveryRoomModal } from './components/phase1/RecoveryRoomModal';
import { PlayerAgencyModal } from './components/phase1/PlayerAgencyModal';
import { PhysiotherapistModal } from './components/phase1/PhysiotherapistModal';
import { PrestigeHallModal } from './components/features/PrestigeHallModal';
import { WorldTourModal } from './components/features/WorldTourModal';
import { EsportsCalendarModal } from './components/features/EsportsCalendarModal';
import { GlobalPowerRankingsModal } from './components/features/GlobalPowerRankingsModal';
import { CommunityRelationsModal } from './components/features/CommunityRelationsModal';
import { MvpCelebrationModal } from './components/common/MvpCelebrationModal';
import { LegacyLoreModal } from './components/features/LegacyLoreModal';
import { MatchVodLibraryModal } from './components/features/MatchVodLibraryModal';
import { INITIAL_MATCH_VOD_ARCHIVE } from './data/matchVodData';
import { Champion, GamePhase, PostMatchMvpRecord, LegacyStatBoost, MatchVodEntry } from './types/game';

export default function App() {
  const {
    currentPhase,
    changePhase,
    playerStats,
    dynastyState,
    setDynastyState,
    soundEnabled,
    toggleSound,
    calendarState,
    advanceCalendarDays,
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
    triggerPrestigeRebirth,
    unlockLegacyPassive,
    toggleRunModifier,
    battleWorldTourFloor,
    buyWorldTourMerchItem,
    equipWorldTourMerchItem,
    executeCommunityCampaign,
    sendCustomDanmaku
  } = useGameState();

  const [showCareerMilestoneModal, setShowCareerMilestoneModal] = useState<boolean>(false);
  const [careerMilestoneInitialTab, setCareerMilestoneInitialTab] = useState<'milestones' | 'journal'>('milestones');

  const handleOpenCareerMilestones = (tab: 'milestones' | 'journal' = 'milestones') => {
    setCareerMilestoneInitialTab(tab);
    setShowCareerMilestoneModal(true);
  };

  const [showRecoveryRoomModal, setShowRecoveryRoomModal] = useState<boolean>(false);
  const [showAgencyModal, setShowAgencyModal] = useState<boolean>(false);
  const [showPhysioModal, setShowPhysioModal] = useState<boolean>(false);
  const [showPrestigeModal, setShowPrestigeModal] = useState<boolean>(false);
  const [showWorldTourModal, setShowWorldTourModal] = useState<boolean>(false);
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);
  const [showPowerRankingsModal, setShowPowerRankingsModal] = useState<boolean>(false);
  const [showCommunityRelationsModal, setShowCommunityRelationsModal] = useState<boolean>(false);
  const [showMvpModal, setShowMvpModal] = useState<boolean>(false);
  const [showLegacyLoreModal, setShowLegacyLoreModal] = useState<boolean>(false);
  const [showVodLibraryModal, setShowVodLibraryModal] = useState<boolean>(false);
  const [isActionsHubOpen, setIsActionsHubOpen] = useState<boolean>(false);
  const [showBudgetReviewModal, setShowBudgetReviewModal] = useState<boolean>(false);
  const [vodArchive, setVodArchive] = useState<MatchVodEntry[]>(() => {
    try {
      const saved = localStorage.getItem('esports_match_vods');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_MATCH_VOD_ARCHIVE;
  });

  const handleApplyVodReviewReward = (vodId: string, insightGain: number, mechBonus: number, macroBonus: number) => {
    // 1. Update VOD archive state and save to local storage
    setVodArchive(prevList => {
      const updated = prevList.map(v => v.id === vodId ? { ...v, reviewed: true, reviewedAt: new Date().toLocaleTimeString() } : v);
      try {
        localStorage.setItem('esports_match_vods', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // 2. Apply tactical insight, mechanics, and mental bonuses to playerStats
    applyStatsDelta({
      mechanics: mechBonus,
      mental: macroBonus
    });

    // 3. Update tacticalInsight in playerStats
    if (playerStats) {
      playerStats.tacticalInsight = Math.min(100, (playerStats.tacticalInsight ?? 45) + insightGain);
    }
  };

  const [currentMvpRecord, setCurrentMvpRecord] = useState<PostMatchMvpRecord | null>(null);
  const [trophyModalState, setTrophyModalState] = useState<{
    isOpen: boolean;
    tab: 'trophies' | 'milestones' | 'leaderboard';
  }>({
    isOpen: false,
    tab: 'trophies'
  });
  const [showLuaModal, setShowLuaModal] = useState<boolean>(false);
  const [showReflexDuel, setShowReflexDuel] = useState<boolean>(false);
  const [showPatchNotes, setShowPatchNotes] = useState<boolean>(false);
  const [showSocialFeed, setShowSocialFeed] = useState<boolean>(false);
  const [showRetirementModal, setShowRetirementModal] = useState<boolean>(false);
  const [showGachaModal, setShowGachaModal] = useState<boolean>(false);
  const [showLifeSimModal, setShowLifeSimModal] = useState<boolean>(false);
  const [showTacticalModal, setShowTacticalModal] = useState<boolean>(false);
  const [showSynergyModal, setShowSynergyModal] = useState<boolean>(false);
  const [showHardwareModal, setShowHardwareModal] = useState<boolean>(false);
  const [lockModalState, setLockModalState] = useState<{ isOpen: boolean; phase: GamePhase }>({
    isOpen: false,
    phase: 2
  });

  // Progression Gating: Phase 2 requires Challenger (1,000 LP). Phase 3 requires $1,000,000 to Retire & Buy Team!
  const [unlockedPhases, setUnlockedPhases] = useState<Record<GamePhase, boolean>>(() => {
    try {
      const saved = localStorage.getItem('esports_unlocked_phases');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { 1: true, 2: false, 3: false };
  });

  useEffect(() => {
    try {
      localStorage.setItem('esports_unlocked_phases', JSON.stringify(unlockedPhases));
    } catch {}
  }, [unlockedPhases]);

  // If challenger trophy unlocked, automatically unlock Phase 2
  useEffect(() => {
    if (trophies.challengerUnlocked && !unlockedPhases[2]) {
      setUnlockedPhases(prev => ({ ...prev, 2: true }));
    }
  }, [trophies.challengerUnlocked, unlockedPhases]);

  const [matchStatsData, setMatchStatsData] = useState<{
    isOpen: boolean;
    playerPicks: (Champion | null)[];
    enemyPicks: (Champion | null)[];
    isWin: boolean;
  }>({
    isOpen: false,
    playerPicks: [],
    enemyPicks: [],
    isWin: true
  });

  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);

  const trophyCount = [
    trophies.challengerUnlocked,
    trophies.regionalChampion,
    trophies.worldsSummonerCup,
    trophies.mvpTrophy
  ].filter(Boolean).length;

  const handleReflexSuccess = (reactionMs: number) => {
    recordReflexWin();
    applyStatsDelta({
      lp: 32,
      mechanics: 4,
      mental: 6,
      fame: 8,
      money: 45,
      isWin: true
    });
    trackChallengeProgress('REFLEX_DUELS', 1);
    addSoloLog(`⚡ 极限微操 ${reactionMs}ms 瞬间金身闪现反杀！(+32 LP, +4 微操, 残局大师进度+1)`, 'win');

    if (reactionMs <= 280) {
      addCareerJournalEntry({
        id: `reflex_god_${Date.now()}`,
        headline: `【毫秒神迹】极限微操 ${reactionMs}ms！宿命先锋1v1死斗对决秒开金身反杀！`,
        subheadline: '人类神经反射天花板！艾欧尼亚高分局爆发神级反杀，录像被各大俱乐部教练组反复切片研读！',
        date: `${new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })} · 微操特报`,
        category: 'RIVAL_DUEL',
        categoryLabel: '【神级微操】',
        newspaperName: '《召唤师竞技报 · 战术内参》',
        issueNo: `第 ${Math.floor(Math.random() * 200 + 600)} 期 · 惊世快讯`,
        editionTag: '号外头条',
        articleBody: `昨夜在极速1v1微操死斗中，选手宿命先锋在千钧一发之际以 ${reactionMs} 毫秒的非人类极限反射神经闪现躲避致命控制，并在0.1秒内反向交出金身规避第二段爆发伤害，随即反手秒杀敌方核心！国际电竞数据机构直呼“这是近三年来监测到的最恐怖单挑微操案例之一”。`,
        keyQuote: `“在这个距离内，凡人只能看到黑屏，而他看到了逆风翻盘的生机。”`,
        reporter: '电竞赛事特约数据分析师 · 顾晓林',
        stampText: '★ 毫秒极限 ★',
        statImpact: '微操+4 / 心态+6 / 声名远播',
        importance: 'BREAKING',
        photoCaption: `数据回放定格：敌方致命控制技能距离英雄模型仅差 2 像素的生死瞬间。`,
        timestamp: Date.now()
      });
    }
  };

  const handleReflexFailure = (reason: string) => {
    applyStatsDelta({
      lp: -16,
      mental: -5,
      isLoss: true
    });
    addSoloLog(`💀 1v1 微操对决失利: ${reason} (-16 LP)`, 'loss');
  };

  const handleEarnPrizeMoney = (amount: number, reason: string) => {
    applyStatsDelta({ money: amount });
    addSoloLog(`💰 比赛奖金: +$${amount.toLocaleString()} 来自 ${reason}！`, 'gear');

    // Check if player reached $1,000,000 retirement goal
    if (playerStats.money + amount >= 1000000 && !unlockedPhases[3]) {
      setShowRetirementModal(true);
    }
  };

  const handleRetireAndBuyOrg = () => {
    setShowRetirementModal(false);
    setUnlockedPhases(prev => ({ ...prev, 3: true }));
    // Deduct $1,000,000 buyout and seed org operating treasury
    applyStatsDelta({ money: -1000000 });
    setDynastyState(prev => ({ ...prev, budget: Math.max(250000, prev.budget) }));
    changePhase(3);
    setShowVictoryModal({
      isOpen: true,
      title: 'FRANCHISE OWNER & GM!',
      subtitle: '退役挂靴！你以队长身份正式退役，并斥资100万美元买下属于自己的全球电竞俱乐部！',
      type: 'pro_scout'
    });
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 scanlines flex items-center justify-center p-0 md:p-3">
      {/* Mobile Device Frame Container */}
      <div
        className={`w-full h-full transition-all duration-300 flex flex-col bg-slate-950 border-slate-800 shadow-2xl relative overflow-hidden ${
          isPhoneFrame
            ? 'md:max-w-[430px] md:h-[94vh] md:max-h-[890px] md:rounded-[36px] md:border-[8px] md:border-slate-800/90 md:shadow-[0_0_50px_rgba(0,0,0,0.8)]'
            : 'md:max-w-4xl md:h-[96vh] md:rounded-2xl md:border md:border-slate-800/80'
        }`}
      >
        {/* Dynamic Island / Speaker Notch (only visible in phone frame mode on desktop) */}
        {isPhoneFrame && (
          <div className="hidden md:flex justify-center pt-2 pb-1 bg-slate-950 select-none flex-shrink-0">
            <div className="w-24 h-4 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800 mr-2" />
              <div className="w-6 h-1 rounded-full bg-slate-800" />
            </div>
          </div>
        )}

        {/* Fixed Mobile Top Status Bar & Quick Stats (NEVER scrolls away) */}
        <div className="flex-shrink-0 z-30">
          <MobileStatusBar
            stats={playerStats}
            currentPhase={currentPhase}
            isDynastyUnlocked={Boolean(unlockedPhases[3])}
            soundEnabled={soundEnabled}
            onToggleSound={toggleSound}
            onReset={() => {
              setUnlockedPhases({ 1: true, 2: false, 3: false });
              localStorage.removeItem('esports_unlocked_phases');
              resetCareer();
            }}
            isPhoneFrame={isPhoneFrame}
            onToggleFrame={() => setIsPhoneFrame(!isPhoneFrame)}
            onOpenLua={() => setShowLuaModal(true)}
            onOpenLeaderboard={() => setTrophyModalState({ isOpen: true, tab: 'leaderboard' })}
            onOpenGacha={() => setShowGachaModal(true)}
            onOpenLifeSim={() => setShowLifeSimModal(true)}
            onOpenTactical={() => setShowTacticalModal(true)}
            onOpenSynergy={() => setShowSynergyModal(true)}
            onOpenHardware={() => setShowHardwareModal(true)}
            onOpenSocialFeed={() => setShowSocialFeed(true)}
            onOpenReflexDuel={() => setShowReflexDuel(true)}
            onOpenPatchNotes={() => setShowPatchNotes(true)}
            onOpenTrophies={() => setTrophyModalState({ isOpen: true, tab: 'trophies' })}
            activeTitle={activeTitle}
            onOpenMilestones={() => handleOpenCareerMilestones('milestones')}
            onOpenCareerJournal={() => handleOpenCareerMilestones('journal')}
            onRest={restAndSleep}
            onCoffee={drinkCoffee}
            onBuyConsumable={buyConsumable}
            onOpenRecoveryRoom={() => setShowRecoveryRoomModal(true)}
            onOpenAgency={() => setShowAgencyModal(true)}
            onOpenPhysio={() => setShowPhysioModal(true)}
            prestigeState={prestigeState}
            worldTourState={worldTourState}
            calendarState={calendarState}
            onOpenPrestigeHall={() => setShowPrestigeModal(true)}
            onOpenWorldTour={() => setShowWorldTourModal(true)}
            onOpenCalendar={() => setShowCalendarModal(true)}
            onOpenPowerRankings={() => setShowPowerRankingsModal(true)}
            onOpenCommunityRelations={() => setShowCommunityRelationsModal(true)}
            onOpenLegacyLore={() => setShowLegacyLoreModal(true)}
            onOpenVodLibrary={() => setShowVodLibraryModal(true)}
          />
        </div>

        {/* L-Shape Layout Body: LeftNavRail + Scrollable Main Content */}
        <div className="flex-1 flex flex-row overflow-hidden relative">
          {/* L-Shape Left Rail: Global macro & high-frequency tools */}
          <LeftNavRail
            onOpenWorldTour={() => setShowWorldTourModal(true)}
            onOpenCalendar={() => setShowCalendarModal(true)}
            onOpenPowerRankings={() => setShowPowerRankingsModal(true)}
            onOpenVodLibrary={() => setShowVodLibraryModal(true)}
            onOpenPrestigeHall={() => setShowPrestigeModal(true)}
            onOpenCommunityRelations={() => setShowCommunityRelationsModal(true)}
            worldTourState={worldTourState}
            calendarState={calendarState}
            prestigeState={prestigeState}
          />

          {/* Scrollable Game Body: Unified Hub Phase View Container */}
          <main className="flex-1 overflow-y-auto overscroll-contain px-2 sm:px-3 py-2 pb-16 relative flex flex-col">
            {/* Unified Hub Navigation Header: Career Phase Context & Sub-heading */}
            <div className="mb-2.5 flex items-center justify-between px-1.5 py-1 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full animate-pulse bg-cyan-400" />
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-tech text-slate-400 uppercase tracking-wider">
                    电竞生涯中枢 · PHASE {currentPhase}
                  </span>
                  <span className="text-[11px] font-tech font-bold text-slate-200">
                    {currentPhase === 1 && '「业余天梯与排位冲刺」'}
                    {currentPhase === 2 && '「职业联赛与BP战术博弈」'}
                    {currentPhase === 3 && '「传奇电竞王朝与俱乐部经营」'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[9px] font-tech text-slate-400">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700/60 text-slate-300">
                  {currentPhase === 1 ? '目标: 登顶千分王者' : currentPhase === 2 ? '目标: 捧起银龙杯' : '目标: 召唤师全球总冠军'}
                </span>
              </div>
            </div>

            <div className="flex-1 flex flex-col">
            {currentPhase === 1 && (
              <PhaseOneAmateur
                stats={playerStats}
                logs={soloQueueLogs}
                dailyChallenges={dailyChallenges}
                onClaimChallenge={claimDailyChallenge}
                loginStreak={loginStreak}
                onClaimLoginStreak={claimDailyLoginStreak}
                onEquipSkin={equipProGearSkin}
                onApplyDelta={applyStatsDelta}
                onAddLog={addSoloLog}
                onWatchReplays={watchProReplays}
                onStream={streamBootcamp}
                onRest={restAndSleep}
                onCoffee={drinkCoffee}
                onProceedToPro={() => {
                  setUnlockedPhases(prev => ({ ...prev, 2: true }));
                  setShowScoutOfferModal(true);
                }}
                onStartReflexDuel={() => setShowReflexDuel(true)}
                onOpenSocialFeed={() => setShowSocialFeed(true)}
                onOpenHardware={() => setShowHardwareModal(true)}
                onOpenLeaderboard={() => setTrophyModalState({ isOpen: true, tab: 'leaderboard' })}
                onConsumeEnergyDrink={consumeEnergyDrink}
                onReviewTacticalTheory={reviewTacticalTheory}
                onAdvancePromoSeries={advancePromoSeries}
                onTriggerPromoSeries={triggerPromoSeries}
                onForfeitPromoSeries={forfeitPromoSeries}
                onUpgradeRecoveryRoom={upgradeRecoveryRoom}
                onOpenRecoveryRoom={() => setShowRecoveryRoomModal(true)}
                onOpenAgency={() => setShowAgencyModal(true)}
                onHireAgent={hirePlayerAgent}
                onFireAgent={firePlayerAgent}
                onSignSponsor={signAgencySponsorship}
                onSignRecruit={signAgencyRecruit}
                onOpenPhysio={() => setShowPhysioModal(true)}
                onTreatCareerHealth={treatCareerHealth}
                onClaimStreamMilestone={claimStreamMilestone}
                onEquipFanEmote={equipFanEmote}
                onToggleRivalSnipeQueue={toggleRivalSnipeQueue}
                prestigeState={prestigeState}
                onUnlockPassive={unlockLegacyPassive}
                onOpenPrestigeHall={() => setShowPrestigeModal(true)}
                calendarState={calendarState}
                onOpenCalendar={() => setShowCalendarModal(true)}
                onOpenVodLibrary={() => setShowVodLibraryModal(true)}
              />
            )}

            {currentPhase === 2 && (
              <PhaseTwoStage
                playerMoney={playerStats.money}
                onWinRegional={winRegionalChampionship}
                onAdvanceToDynasty={() => {
                  if (unlockedPhases[3]) {
                    changePhase(3);
                  } else if (playerStats.money >= 1000000) {
                    setShowRetirementModal(true);
                  } else {
                    setLockModalState({ isOpen: true, phase: 3 });
                  }
                }}
                onOpenPatchNotes={() => setShowPatchNotes(true)}
                onOpenMatchStats={(playerPicks, enemyPicks, isWin) =>
                  setMatchStatsData({ isOpen: true, playerPicks, enemyPicks, isWin })
                }
                onEarnPrizeMoney={handleEarnPrizeMoney}
                onTriggerRetirement={() => setShowRetirementModal(true)}
                isDynastyUnlocked={unlockedPhases[3]}
                onOpenTactical={() => setShowTacticalModal(true)}
                onOpenSynergy={() => setShowSynergyModal(true)}
                onOpenLifeSim={() => setShowLifeSimModal(true)}
                calendarState={calendarState}
                playerStats={playerStats}
                onApplyDelta={applyStatsDelta}
                onAddLog={addSoloLog}
                onApplyLpMultiplier={(bonus) => {
                  if (playerStats) {
                    playerStats.lpMultiplierBonus = bonus;
                  }
                }}
                onAddJournalEntry={addCareerJournalEntry}
              />
            )}

            {currentPhase === 3 && (
              <PhaseThreeDynasty
                dynasty={dynastyState}
                onUpdateDynasty={setDynastyState}
                onWinWorlds={winWorldsChampionship}
                onOpenGacha={() => setShowGachaModal(true)}
                onOpenLifeSim={() => setShowLifeSimModal(true)}
                onOpenSynergy={() => setShowSynergyModal(true)}
                onOpenLeaderboard={() => setTrophyModalState({ isOpen: true, tab: 'leaderboard' })}
                onOpenWorldTour={() => setShowWorldTourModal(true)}
                onOpenPrestige={() => setShowPrestigeModal(true)}
                onOpenPowerRankings={() => setShowPowerRankingsModal(true)}
                onOpenCommunityRelations={() => setShowCommunityRelationsModal(true)}
                calendarState={calendarState}
              />
            )}
            </div>
          </main>

          {/* Floating Chamfered Command Deck (常驻底部切角战术主控台) */}
          <CommandDeck
            stats={playerStats}
            currentPhase={currentPhase}
            onRest={restAndSleep}
            onCoffee={drinkCoffee}
            onReflexDuel={() => setShowReflexDuel(true)}
            onStream={streamBootcamp}
            onScout={() => setShowPowerRankingsModal(true)}
            onBudgetReview={() => setShowBudgetReviewModal(true)}
            onOpenPhysio={() => setShowPhysioModal(true)}
            isActionsHubOpen={isActionsHubOpen}
            onToggleActionsHub={() => setIsActionsHubOpen(prev => !prev)}
          />

          {/* Actions Hub (次级战术行动舱：从主控台抽屉滑出) */}
          <ActionsHub
            isOpen={isActionsHubOpen}
            onClose={() => setIsActionsHubOpen(false)}
            currentPhase={currentPhase}
            stats={playerStats}
            onWatchReplays={watchProReplays}
            onOpenVodLibrary={() => setShowVodLibraryModal(true)}
            onOpenHardware={() => setShowHardwareModal(true)}
            onOpenGacha={() => setShowGachaModal(true)}
            onOpenAgency={() => setShowAgencyModal(true)}
            onOpenPhysio={() => setShowPhysioModal(true)}
            onOpenRecoveryRoom={() => setShowRecoveryRoomModal(true)}
            onStream={streamBootcamp}
            onReviewTacticalTheory={reviewTacticalTheory}
            onOpenSocialFeed={() => setShowSocialFeed(true)}
            onOpenCommunityRelations={() => setShowCommunityRelationsModal(true)}
            onReflexDuel={() => setShowReflexDuel(true)}
            onOpenBudgetReview={() => setShowBudgetReviewModal(true)}
            onOpenLeaderboard={() => setTrophyModalState({ isOpen: true, tab: 'leaderboard' })}
          />
        </div>

        {/* Fixed Mobile Bottom Navigation Bar (NEVER scrolls away) */}
        <div className="flex-shrink-0 z-30">
          <MobileBottomNav
            currentPhase={currentPhase}
            unlockedPhases={unlockedPhases}
            onPhaseChange={changePhase}
            onLockedTabClick={(phase) => setLockModalState({ isOpen: true, phase })}
            onOpenTrophies={() => setTrophyModalState({ isOpen: true, tab: 'trophies' })}
            trophyCount={trophyCount}
          />
        </div>

        {/* Unified 3-in-1 Honors Showcase (荣誉展柜: 奖杯·称号·百强榜) */}
        <TrophyModal
          isOpen={trophyModalState.isOpen}
          onClose={() => setTrophyModalState(prev => ({ ...prev, isOpen: false }))}
          initialTab={trophyModalState.tab}
          trophies={trophies}
          milestones={milestones}
          activeTitle={activeTitle}
          onClaimMilestone={claimMilestone}
          onEquipTitle={equipTitle}
          playerEarnings={playerStats.money}
          playerCups={trophies.worldsSummonerCup ? 1 : 0}
          playerTier={playerStats.rankTier}
          onOpenCareerJournal={() => {
            setTrophyModalState(prev => ({ ...prev, isOpen: false }));
            handleOpenCareerMilestones('journal');
          }}
        />

        {/* Career Milestone & Retro Newspaper Journal Modal (专属称号殿堂 & 权威纪事号外剪报) */}
        <CareerMilestoneModal
          isOpen={showCareerMilestoneModal}
          onClose={() => setShowCareerMilestoneModal(false)}
          milestones={milestones}
          activeTitle={activeTitle}
          onClaimMilestone={claimMilestone}
          onEquipTitle={equipTitle}
          journalEntries={careerJournal}
          onAddJournalEntry={addCareerJournalEntry}
          initialTab={careerMilestoneInitialTab}
          playerStats={playerStats}
        />

        {/* Modals & Drawers */}
        <ScoutOfferModal
          isOpen={showScoutOfferModal}
          onAccept={() => {
            setUnlockedPhases(prev => ({ ...prev, 2: true }));
            acceptScoutOffer();
          }}
          onDecline={() => setShowScoutOfferModal(false)}
        />

        <RetirementModal
          isOpen={showRetirementModal}
          money={playerStats.money}
          lifetimeEarnings={playerStats.lifetimeEarnings || Math.max(1000000, playerStats.money)}
          trophies={trophies}
          stats={playerStats}
          onRetireAndBuyOrg={handleRetireAndBuyOrg}
          onStayPlaying={() => setShowRetirementModal(false)}
        />

        <PhaseLockModal
          isOpen={lockModalState.isOpen}
          onClose={() => setLockModalState(prev => ({ ...prev, isOpen: false }))}
          lockedPhase={lockModalState.phase}
          currentLp={playerStats.lp}
          currentMoney={playerStats.money}
        />

        <LuaStudioModal
          isOpen={showLuaModal}
          onClose={() => setShowLuaModal(false)}
        />

        <ReflexDuelModal
          isOpen={showReflexDuel}
          onClose={() => setShowReflexDuel(false)}
          onSuccess={handleReflexSuccess}
          onFailure={handleReflexFailure}
        />

        <PatchNotesModal
          isOpen={showPatchNotes}
          onClose={() => setShowPatchNotes(false)}
        />

        <MatchStatsModal
          isOpen={matchStatsData.isOpen}
          onClose={() => setMatchStatsData(prev => ({ ...prev, isOpen: false }))}
          playerPicks={matchStatsData.playerPicks}
          enemyPicks={matchStatsData.enemyPicks}
          isWin={matchStatsData.isWin}
          playerStats={playerStats}
          rivalry={playerStats.rivalry}
          onOpenMvpCelebration={() => {
            setShowMvpModal(true);
          }}
        />

        <SocialFeedDrawer
          isOpen={showSocialFeed}
          onClose={() => setShowSocialFeed(false)}
        />

        <ScoutGachaModal
          isOpen={showGachaModal}
          onClose={() => setShowGachaModal(false)}
          playerMoney={playerStats.money}
          isDynastyUnlocked={Boolean(unlockedPhases[3])}
          onAddLog={addSoloLog}
          onSignPlayerToRoster={(newPlayer) => {
            setDynastyState(prev => ({
              ...prev,
              roster: [...prev.roster, newPlayer]
            }));
            addSoloLog(`🌟 豪门签约: ${newPlayer.name} 已正式入驻俱乐部大名单！`, 'win');
          }}
        />

        <ProLifeSimModal
          isOpen={showLifeSimModal}
          onClose={() => setShowLifeSimModal(false)}
          playerMoney={playerStats.money}
          onApplyDelta={applyStatsDelta}
          onAddLog={addSoloLog}
        />

        <TacticalArenaModal
          isOpen={showTacticalModal}
          onClose={() => setShowTacticalModal(false)}
          playerStats={playerStats}
          onApplyDelta={applyStatsDelta}
          onAddLog={addSoloLog}
          onApplyDraftAdvantage={(bonus) => {
            if (playerStats) {
              playerStats.draftAdvantage = bonus;
            }
          }}
        />

        <SynergyNetworkModal
          isOpen={showSynergyModal}
          onClose={() => setShowSynergyModal(false)}
          playerMoney={playerStats.money}
          onApplyDelta={applyStatsDelta}
        />

        <HardwareRigModal
          isOpen={showHardwareModal}
          onClose={() => setShowHardwareModal(false)}
          playerMoney={playerStats.money}
          onApplyDelta={applyStatsDelta}
        />

        <VictoryModal
          isOpen={showVictoryModal.isOpen}
          title={showVictoryModal.title}
          subtitle={showVictoryModal.subtitle}
          type={showVictoryModal.type}
          onContinue={() => {
            setShowVictoryModal(prev => ({ ...prev, isOpen: false }));
            if (showVictoryModal.type === 'pro_scout') {
              changePhase(2);
            } else if (showVictoryModal.type === 'regional_champ') {
              if (unlockedPhases[3]) changePhase(3);
            }
          }}
          onOpenPrestigeRebirth={() => {
            setShowVictoryModal(prev => ({ ...prev, isOpen: false }));
            setShowPrestigeModal(true);
          }}
          onOpenWorldTour={() => {
            setShowVictoryModal(prev => ({ ...prev, isOpen: false }));
            setShowWorldTourModal(true);
          }}
        />

        {/* Global Prestige Hall (名宿声望殿堂 · 轮回与传承) */}
        <PrestigeHallModal
          isOpen={showPrestigeModal}
          onClose={() => setShowPrestigeModal(false)}
          prestigeState={prestigeState}
          playerStats={playerStats}
          wonWorlds={trophies.worldsSummonerCup}
          wonRegional={trophies.regionalChampion}
          onRebirth={(endingId) => {
            triggerPrestigeRebirth(endingId);
            setUnlockedPhases({ 1: true, 2: false, 3: false });
          }}
          onUnlockPassive={unlockLegacyPassive}
          onToggleModifier={toggleRunModifier}
          onOpenWorldTour={() => {
            setShowPrestigeModal(false);
            setShowWorldTourModal(true);
          }}
        />

        {/* Global World Tour (无尽世界巡回赛 · 百层挑战天梯) */}
        <WorldTourModal
          isOpen={showWorldTourModal}
          onClose={() => setShowWorldTourModal(false)}
          worldTourState={worldTourState}
          prestigeState={prestigeState}
          dynastyState={dynastyState}
          playerStats={playerStats}
          onBattle={battleWorldTourFloor}
          onOpenPrestigeHall={() => {
            setShowWorldTourModal(false);
            setShowPrestigeModal(true);
          }}
          onBuyMerchItem={buyWorldTourMerchItem}
          onEquipMerchItem={equipWorldTourMerchItem}
        />

        {/* Global Recovery Room Modal */}
        <RecoveryRoomModal
          isOpen={showRecoveryRoomModal}
          onClose={() => setShowRecoveryRoomModal(false)}
          stats={playerStats}
          onRest={restAndSleep}
          onUpgrade={upgradeRecoveryRoom}
        />

        {/* Global Player Agency Modal */}
        <PlayerAgencyModal
          isOpen={showAgencyModal}
          onClose={() => setShowAgencyModal(false)}
          stats={playerStats}
          onHireAgent={hirePlayerAgent}
          onFireAgent={firePlayerAgent}
          onSignSponsor={signAgencySponsorship}
          onSignRecruit={signAgencyRecruit}
        />

        {/* Global Physiotherapist Career Health Clinic Modal */}
        <PhysiotherapistModal
          isOpen={showPhysioModal}
          onClose={() => setShowPhysioModal(false)}
          stats={playerStats}
          onTreat={treatCareerHealth}
          onOpenRecoveryRoom={() => setShowRecoveryRoomModal(true)}
        />

        {/* Global Esports Calendar Modal */}
        <EsportsCalendarModal
          isOpen={showCalendarModal}
          onClose={() => setShowCalendarModal(false)}
          calendarState={calendarState}
          playerLp={playerStats.lp}
        />

        {/* Global Pro Power Rankings Modal (全球战队实力榜 TOP20) */}
        <GlobalPowerRankingsModal
          isOpen={showPowerRankingsModal}
          onClose={() => setShowPowerRankingsModal(false)}
          currentPhase={currentPhase}
          playerStats={playerStats}
          dynastyState={dynastyState}
          onScoutTeam={(teamId) => {
            addSoloLog(`🔍【刺探敌情】深入调研分析了全球战队 [${teamId}] 的战术风格与首发短板！`, 'event');
            return true;
          }}
          onDeepScoutPlayer={(player, team) => {
            const scoutCost = 20000;
            if (currentPhase === 3) {
              if (dynastyState.budget >= scoutCost) {
                setDynastyState(prev => ({ ...prev, budget: prev.budget - scoutCost }));
                addSoloLog(`🔍【绝密球探调研】划拨 $${scoutCost.toLocaleString()} 专项研判资金，全面破译 [${team.teamName}] 明星选手 ${player.name} (${player.role}) 隐秘潜能数据！`, 'event');
                return true;
              }
              return false;
            } else {
              if (playerStats.money >= scoutCost) {
                applyStatsDelta({ money: -scoutCost });
                addSoloLog(`🔍【绝密球探调研】支付 ¥${scoutCost.toLocaleString()} 专属情报费，全面破译 [${team.teamName}] 明星选手 ${player.name} (${player.role}) 隐秘潜能数据！`, 'event');
                return true;
              }
              return false;
            }
          }}
          onTradePlayer={(target) => {
            if (currentPhase === 3 && dynastyState.budget >= target.buyoutCost) {
              setDynastyState(prev => ({
                ...prev,
                budget: prev.budget - target.buyoutCost,
                roster: [...prev.roster, {
                  id: `traded-${target.id}-${Date.now()}`,
                  name: target.name,
                  role: target.role,
                  country: '中国',
                  age: 20,
                  mechanics: target.rating,
                  macro: target.rating - 2,
                  morale: 95,
                  salary: target.salaryPerSeason || Math.round(target.buyoutCost * 0.08),
                  marketValue: target.buyoutCost,
                  avatar: '🌟',
                  playstyle: 'Aggressive'
                }]
              }));
              addSoloLog(`✍️【豪门重磅转会】以 $${target.buyoutCost.toLocaleString()} 转会费成功引援 [${target.team}] 明星选手 ${target.name} (${target.role})！`, 'win');
            } else {
              addSoloLog(`⚠️ 俱乐部金库资金不足，无法支付买断费 $${target.buyoutCost.toLocaleString()}`, 'loss');
            }
          }}
        />

        {/* Match MVP Celebration Modal with Framer Motion Highlight */}
        <MvpCelebrationModal
          isOpen={showMvpModal}
          onClose={() => setShowMvpModal(false)}
          mvpRecord={currentMvpRecord || playerStats.confidence?.lastMvpCard}
          onClaimLegacyBoost={(boost) => {
            applyStatsDelta({
              [boost.stat]: boost.amount
            });
            addSoloLog(`🌟【荣耀传承】成功斩获本场 MVP！永久获得 +${boost.amount} ${boost.statNameCn} 属性传承加成！`, 'win');
          }}
        />

        {/* Global Legacy Lore Modal (电竞历史宿怨与战局编年史) */}
        <LegacyLoreModal
          isOpen={showLegacyLoreModal}
          onClose={() => setShowLegacyLoreModal(false)}
          prestigeState={prestigeState}
        />

        {/* Community Relations & Live Match Danmaku Modal (社区公关运营、粉丝倍率与直播弹幕) */}
        <CommunityRelationsModal
          isOpen={showCommunityRelationsModal}
          onClose={() => setShowCommunityRelationsModal(false)}
          communityState={dynastyState.communityRelations || {
            fanbaseCount: 15000,
            fanbaseMultiplier: 1.0,
            totalCampaignsRun: 0,
            activeCooldowns: {},
            recentActivities: []
          }}
          playerMoney={playerStats.money}
          playerEnergy={playerStats.energy ?? 100}
          dynastyBudget={dynastyState.budget}
          currentPhase={currentPhase}
          onExecuteCampaign={executeCommunityCampaign}
          onSendCustomDanmaku={sendCustomDanmaku}
        />

        {/* Match VOD Library Modal (经典赛事录像与高光复盘库 · 战术洞察) */}
        <MatchVodLibraryModal
          isOpen={showVodLibraryModal}
          onClose={() => setShowVodLibraryModal(false)}
          vodArchive={vodArchive}
          stats={playerStats}
          onApplyVodReviewReward={handleApplyVodReviewReward}
        />

        {/* Phase 3 Dynasty Budget & Financial Review Modal (豪门金库与预算审阅 · CFO报告) */}
        <BudgetReviewModal
          isOpen={showBudgetReviewModal}
          onClose={() => setShowBudgetReviewModal(false)}
          dynasty={dynastyState}
          onUpdateDynasty={setDynastyState}
          playerPersonalMoney={playerStats.money}
          onInjectPersonalCapital={(amount) => {
            applyStatsDelta({ money: -amount });
          }}
          onOpenSponsorships={() => setShowCommunityRelationsModal(true)}
          onAddLog={addSoloLog}
        />
      </div>
    </div>
  );
}
