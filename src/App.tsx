/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import { MobileStatusBar } from './components/MobileStatusBar';
import { MobileBottomNav } from './components/MobileBottomNav';
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
import { Champion, GamePhase } from './types/game';

export default function App() {
  const {
    currentPhase,
    changePhase,
    playerStats,
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
    recordReflexWin,
    consumeEnergyDrink,
    reviewTacticalTheory,
    triggerPromoSeries,
    advancePromoSeries,
    unlockPlayerTrait
  } = useGameState();

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
            onOpenMilestones={() => setTrophyModalState({ isOpen: true, tab: 'milestones' })}
          />
        </div>

        {/* Scrollable Game Body (ONLY this container scrolls) */}
        <main className="flex-1 overflow-y-auto overscroll-contain px-2 sm:px-4 py-2">
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
            />
          )}
        </main>

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
          onApplyDelta={applyStatsDelta}
          onAddLog={addSoloLog}
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
        />
      </div>
    </div>
  );
}
