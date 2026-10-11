import React, { useState } from 'react';
import { PlayerStats, SoloQueueEvent, DailyChallenge, LoginStreakState, PrestigeState, EsportsCalendarState } from '../../types/game';
import { SOLO_QUEUE_EVENTS } from '../../data/soloQueueEvents';
import { getSplitForWeek, getPatchForWeek, calculateCompoundModifiers } from '../../data/esportsEventData';
import { DailyChallengesCard } from '../DailyChallengesCard';
import { DailyLoginStreakCard } from '../DailyLoginStreakCard';
import { 
  Gamepad2, 
  Brain, 
  Heart, 
  Battery, 
  Tv, 
  Coffee, 
  ShoppingBag, 
  TrendingUp, 
  Activity, 
  Flame, 
  Radio, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  MessageSquare,
  Trophy,
  Gift,
  Maximize2,
  X,
  CheckCircle2,
  Clock,
  Moon,
  BedDouble,
  Sparkles,
  Briefcase,
  Handshake,
  Stethoscope,
  RotateCcw,
  Calendar,
  ChevronRight,
  Film
} from 'lucide-react';
import { soundEngine } from '../../utils/audio';

import { TextMatchSimulationModal } from './TextMatchSimulationModal';
import { PromoSeriesManager } from './PromoSeriesManager';
import { RecoveryRoomModal } from './RecoveryRoomModal';
import { PlayerAgencyModal } from './PlayerAgencyModal';
import { PhysiotherapistModal } from './PhysiotherapistModal';
import { StreamingMilestonesTracker } from './StreamingMilestonesTracker';
import { SoloQueueRivalryCard } from './SoloQueueRivalryCard';
import { LegacyTalentTreeModal } from './LegacyTalentTreeModal';
import { getTotalRestStats, getRecoveryRoomBonuses } from '../../data/recoveryRoomData';
import { getAgentById, calculateAgencyActionIncome } from '../../data/playerAgencyData';
import { PLAYER_TRAITS_DATABASE } from '../../data/matchSimulationNarratives';
import { LEGACY_PASSIVES_CATALOG } from '../../data/prestigeData';

interface PhaseOneProps {
  stats: PlayerStats;
  logs: { id: string; timestamp: string; message: string; type: 'win' | 'loss' | 'event' | 'gear' }[];
  dailyChallenges: DailyChallenge[];
  onClaimChallenge: (id: string) => void;
  loginStreak: LoginStreakState;
  onClaimLoginStreak: () => void;
  onEquipSkin: (skinId: string) => void;
  onApplyDelta: (delta: {
    lp?: number;
    mechanics?: number;
    mental?: number;
    energy?: number;
    focus?: number;
    money?: number;
    fame?: number;
    isWin?: boolean;
    isLoss?: boolean;
  }) => void;
  onAddLog: (message: string, type: 'win' | 'loss' | 'event' | 'gear') => void;
  onWatchReplays: () => void;
  onStream: () => void;
  onRest: () => void;
  onCoffee?: () => void;
  onProceedToPro: () => void;
  onStartReflexDuel: () => void;
  onOpenSocialFeed: () => void;
  onOpenHardware: () => void;
  onOpenLeaderboard: () => void;
  onConsumeEnergyDrink?: () => void;
  onReviewTacticalTheory?: () => void;
  onAdvancePromoSeries?: (isWin: boolean) => void;
  onTriggerPromoSeries?: (targetTier?: any, format?: 'BO3' | 'BO5') => void;
  onForfeitPromoSeries?: () => void;
  onUpgradeRecoveryRoom?: (category: 'soundproofing' | 'bedding' | 'atmosphere') => { success: boolean; message: string };
  onOpenRecoveryRoom?: () => void;
  onOpenAgency?: () => void;
  onHireAgent?: (agentId: string) => { success: boolean; message: string };
  onFireAgent?: () => void;
  onSignSponsor?: (sponsorId: string) => { success: boolean; message: string };
  onSignRecruit?: (
    recruitId: string,
    tactic: any,
    negotiatedCommission: number,
    negotiatedBonus: number,
    outcome: any,
    summary: string
  ) => { success: boolean; message: string };
  onOpenPhysio?: () => void;
  onTreatCareerHealth?: (treatmentId: string) => { success: boolean; message: string };
  onClaimStreamMilestone?: (milestoneId: string) => { success: boolean; message: string };
  onEquipFanEmote?: (emoteId: string | null) => { success: boolean; message: string };
  onToggleRivalSnipeQueue?: () => void;
  prestigeState: PrestigeState;
  onUnlockPassive: (passiveId: string) => { success: boolean; message: string };
  onOpenPrestigeHall?: () => void;
  calendarState?: EsportsCalendarState;
  onOpenCalendar?: () => void;
  onOpenVodLibrary?: () => void;
}

export const PhaseOneAmateur: React.FC<PhaseOneProps> = ({
  stats,
  logs,
  dailyChallenges,
  onClaimChallenge,
  loginStreak,
  onClaimLoginStreak,
  onEquipSkin,
  onApplyDelta,
  onAddLog,
  onWatchReplays,
  onStream,
  onRest,
  onCoffee,
  onProceedToPro,
  onStartReflexDuel,
  onOpenSocialFeed,
  onOpenHardware,
  onOpenLeaderboard,
  onConsumeEnergyDrink,
  onReviewTacticalTheory,
  onAdvancePromoSeries,
  onTriggerPromoSeries,
  onForfeitPromoSeries,
  onUpgradeRecoveryRoom,
  onOpenRecoveryRoom,
  onOpenAgency,
  onHireAgent,
  onFireAgent,
  onSignSponsor,
  onSignRecruit,
  onOpenPhysio,
  onTreatCareerHealth,
  onClaimStreamMilestone,
  onEquipFanEmote,
  onToggleRivalSnipeQueue,
  prestigeState,
  onUnlockPassive,
  onOpenPrestigeHall,
  calendarState,
  onOpenCalendar,
  onOpenVodLibrary
}) => {
  const [activeEvent, setActiveEvent] = useState<SoloQueueEvent | null>(null);
  const [showSimModal, setShowSimModal] = useState<boolean>(false);
  const [showTraitsModal, setShowTraitsModal] = useState<boolean>(false);
  const [showFatiguePromptModal, setShowFatiguePromptModal] = useState<boolean>(false);
  const [showRecoveryRoomModal, setShowRecoveryRoomModal] = useState<boolean>(false);
  const [showAgencyModalLocal, setShowAgencyModalLocal] = useState<boolean>(false);
  const [showPhysioModalLocal, setShowPhysioModalLocal] = useState<boolean>(false);
  const [showTalentTreeModal, setShowTalentTreeModal] = useState<boolean>(false);

  const totalRest = getTotalRestStats(stats.recoveryRoom);
  const roomBonuses = getRecoveryRoomBonuses(stats.recoveryRoom);
  const currentAgent = getAgentById(stats.agency?.hiredAgentId);
  const agencySummary = calculateAgencyActionIncome(stats.agency, stats.fame);

  // Expand / Collapse accordions state (default collapsed to eliminate scroll chore)
  const [isStreakExpanded, setIsStreakExpanded] = useState<boolean>(false);
  const [isChallengesExpanded, setIsChallengesExpanded] = useState<boolean>(false);
  const [isLogsExpanded, setIsLogsExpanded] = useState<boolean>(false);

  // Pop-up overlay modals state
  const [showStreakModal, setShowStreakModal] = useState<boolean>(false);
  const [showChallengesModal, setShowChallengesModal] = useState<boolean>(false);
  const [showLogsModal, setShowLogsModal] = useState<boolean>(false);

  const completedChallengesCount = dailyChallenges.filter(c => c.claimed).length;
  const latestLog = logs[0];

  // Trigger a Solo Queue Match or Event
  const startRankedMatch = () => {
    if ((stats.focus ?? 100) < 15 || stats.energy < 20) {
      setShowFatiguePromptModal(true);
      return;
    }

    soundEngine.playClick();

    // In promotion series or standard match: open play-by-play text simulation modal
    setShowSimModal(true);
  };

  const handleMatchComplete = (result: {
    isWin: boolean;
    lpDelta: number;
    mechanicsDelta: number;
    mentalDelta: number;
    fameDelta: number;
    moneyDelta: number;
    logsSummary: string;
    kda: string;
    champName: string;
    isPromoGame?: boolean;
  }) => {
    // High-intensity ranked grind drains 20 energy and 20 focus!
    onApplyDelta({
      lp: result.isPromoGame ? 0 : result.lpDelta,
      energy: -20,
      focus: -20,
      mechanics: result.mechanicsDelta,
      mental: result.mentalDelta,
      fame: result.fameDelta,
      money: result.moneyDelta,
      isWin: result.isWin,
      isLoss: !result.isWin
    });

    if (result.isPromoGame && onAdvancePromoSeries) {
      onAdvancePromoSeries(result.isWin);
    } else {
      // If player reaches promo threshold (e.g., 500 LP for Master or 800 LP for GM), trigger promo
      if (stats.lp + result.lpDelta >= 500 && stats.rankTier === 'Diamond' && !stats.promoSeries && onTriggerPromoSeries) {
        onTriggerPromoSeries('Master');
      } else if (stats.lp + result.lpDelta >= 800 && stats.rankTier === 'Master' && !stats.promoSeries && onTriggerPromoSeries) {
        onTriggerPromoSeries('Grandmaster');
      }
    }

    onAddLog(result.logsSummary, result.isWin ? 'win' : 'loss');

    // 25% chance of encountering an after-match event
    if (Math.random() < 0.25) {
      setTimeout(() => {
        const randomEvent = SOLO_QUEUE_EVENTS[Math.floor(Math.random() * SOLO_QUEUE_EVENTS.length)];
        setActiveEvent(randomEvent);
      }, 500);
    }
  };

  const handleResolveEvent = (choiceIndex: number) => {
    if (!activeEvent) return;
    const choice = activeEvent.options[choiceIndex];
    const outcome = choice.execute(stats);

    soundEngine.playClick();
    if (outcome.success) {
      soundEngine.playVictory();
    }

    onApplyDelta({
      lp: outcome.lpDelta,
      mechanics: outcome.mechanicsDelta,
      mental: outcome.mentalDelta,
      fame: outcome.fameDelta,
      money: outcome.moneyDelta,
      energy: -20,
      isWin: outcome.success,
      isLoss: !outcome.success
    });

    onAddLog(outcome.log, outcome.success ? 'win' : 'loss');
    setActiveEvent(null);
  };

  const lpProgressToPro = Math.min(100, Math.floor((stats.lp / 1000) * 100));

  return (
    <div className="space-y-3 pb-6">
      {/* 1. Header Rank Progression & Compact Quick Actions */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30 border border-slate-800 shadow-lg space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-tech font-bold uppercase tracking-wider text-cyan-400">
                第一阶段 · 业余排位冲刺
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                目标: 1,000 LP
              </span>
            </div>
            <h3 className="font-tech font-extrabold text-base text-white mt-0.5">
              从出租屋单排到职业战队球探发掘
            </h3>
          </div>

          {stats.lp >= 1000 && (
            <button
              onClick={() => {
                soundEngine.playVictory();
                onProceedToPro();
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-tech font-extrabold text-xs shadow-lg shadow-amber-500/30 animate-pulse cursor-pointer shrink-0"
            >
              👑 签约职业合同 →
            </button>
          )}
        </div>

        {/* 1,000 LP Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] font-code">
            <span className="text-slate-400">冲刺职业联赛门槛 (1,000 LP 王者):</span>
            <span className="text-cyan-300 font-bold">{stats.lp} / 1000 LP ({lpProgressToPro}%)</span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/80">
            <div
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-amber-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${lpProgressToPro}%` }}
            />
          </div>
        </div>

        {/* Status Bar Ticker */}
        <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] font-code flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>实时天梯: 🔥 连胜 {stats.winStreak} 场</span>
          </div>
          <div className="text-slate-300 text-[10px]">
            中单 (MID) · <span className="text-cyan-300 font-bold">{stats.wins}胜 {stats.losses}负</span>
          </div>
        </div>

        {/* Esports Calendar & Patch Meta Live Banner */}
        {calendarState && (
          <div 
            onClick={() => onOpenCalendar && onOpenCalendar()}
            className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 transition cursor-pointer flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white truncate">
                    {getSplitForWeek(calendarState.currentWeek).name} · 第 {calendarState.currentWeek} 周
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                    Patch {calendarState.currentPatchVersion}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">
                  {getPatchForWeek(calendarState.currentWeek).headline} · 胜场收益 x{calculateCompoundModifiers(calendarState.currentWeek).lpMult.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-0.5">
                赛历大事件 <ChevronRight className="w-3 h-3 inline" />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* BO3 / BO5 Promo Series Manager (Score Tracker & Progression Engine) */}
      <PromoSeriesManager
        stats={stats}
        onStartPromoMatch={startRankedMatch}
        onTriggerPromoSeries={onTriggerPromoSeries}
        onForfeitPromoSeries={onForfeitPromoSeries}
      />

      {/* Scout Attention Radar & Active Traits Strip */}
      <div className="grid grid-cols-2 gap-2 text-xs font-tech">
        {/* Scout Radar */}
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase">俱乐部球探关注度</div>
            <div className="text-sm font-extrabold text-cyan-300 font-code mt-0.5">
              {stats.scoutAttention || 35}%
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
        </div>

        {/* Focus & Fatigue Management: Rest vs Coffee */}
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between gap-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] text-slate-400 uppercase font-tech">专注度 / 疲劳监控</span>
            </div>
            <span className={`text-xs font-bold font-code ${(stats.focus ?? 100) < 30 ? 'text-rose-400 animate-pulse' : 'text-cyan-300'}`}>
              {stats.focus ?? 100}%
            </span>
          </div>

          <div className="flex items-center gap-1.5 pt-0.5">
            <button
              onClick={onRest}
              className="flex-1 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-[10px] font-tech font-bold cursor-pointer transition flex items-center justify-center gap-1 active:scale-95"
              title="深度休整：免费睡眠，恢复专注度+50%与精力+45%"
            >
              <Moon className="w-3 h-3" />
              <span>休整 (Rest)</span>
            </button>

            <button
              onClick={() => {
                if (onCoffee) onCoffee();
                else if (onConsumeEnergyDrink) onConsumeEnergyDrink();
              }}
              className="flex-1 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-tech font-bold cursor-pointer transition flex items-center justify-center gap-1 active:scale-95"
              title="特调咖啡：花费 $20 或消耗库存，瞬间拉满专注度+50%"
            >
              <Coffee className="w-3 h-3" />
              <span>咖啡 (Coffee)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Core Playable Loop: Primary Action Button & Training */}
      {activeEvent ? (
        /* Event Encounter Card */
        <div className="p-4 rounded-xl bg-slate-900 border-2 border-cyan-500/60 shadow-xl space-y-3 chamfer-card animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-[10px] font-tech font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              {activeEvent.contextTag}
            </span>
            <span className="text-[10px] text-slate-400 font-tech">排位突发遭遇事件</span>
          </div>

          <h4 className="font-tech font-bold text-white text-base leading-snug">
            {activeEvent.title}
          </h4>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            {activeEvent.scenario}
          </p>

          <div className="space-y-2 pt-1">
            <div className="text-[10px] font-tech font-bold text-slate-400 uppercase tracking-wider">
              抉择你的战术应对：
            </div>
            {activeEvent.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleResolveEvent(idx)}
                className="w-full text-left p-3 rounded-xl border border-slate-700 hover:border-cyan-400 bg-slate-800/90 active:bg-slate-800 transition cursor-pointer"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-tech font-bold text-white text-xs">
                    {opt.label}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase font-tech ${
                      opt.risk === 'High'
                        ? 'bg-rose-500/20 text-rose-300'
                        : opt.risk === 'Medium'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {opt.risk === 'High' ? '极高风险' : opt.risk === 'Medium' ? '中等风险' : '低风险'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {opt.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Primary Thumb Actions (Mobile-First 4 Big Buttons) */
        <div className="space-y-2">
          {/* Main Action Button: Ranked Match with Text Broadcast */}
          <button
            onClick={startRankedMatch}
            className={`w-full py-3.5 px-4 rounded-xl active:scale-98 text-slate-950 font-tech font-extrabold text-base tracking-wide flex items-center justify-center gap-2 shadow-lg cursor-pointer transition chamfer-btn hover:brightness-110 ${
              stats.promoSeries && stats.promoSeries.active
                ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 shadow-amber-500/40 text-slate-950 animate-pulse'
                : 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 shadow-cyan-500/30'
            }`}
          >
            <Gamepad2 className="w-5 h-5 fill-current" />
            <span>
              {stats.promoSeries && stats.promoSeries.active
                ? `进行 BO${stats.promoSeries.maxGames} 晋级生死战 (-20专注, -20精力)`
                : '开启文字排位推演 · 逐回合解说 (-20专注, -20精力)'}
            </span>
          </button>

          {/* Secondary Actions in 4-Button Grid */}
          <div className="grid grid-cols-4 gap-1.5">
            <button
              onClick={() => {
                if ((stats.focus ?? 100) < 15 || stats.energy < 20) {
                  setShowFatiguePromptModal(true);
                  return;
                }
                onStream();
              }}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 active:bg-slate-800 flex flex-col items-center justify-center text-center cursor-pointer transition hover:border-purple-500/50"
              title="高能直播：赚取打赏金币与知名度 (-25专注, -20精力)"
            >
              <Tv className="w-4 h-4 text-purple-400 mb-0.5" />
              <span className="text-[10px] font-tech font-bold text-white leading-none">直播集训</span>
              <span className="text-[8px] text-purple-400 font-sans mt-0.5">-25 专注</span>
            </button>

            <button
              onClick={onRest}
              className="p-2 rounded-xl bg-slate-900 border border-indigo-500/30 active:bg-slate-800 flex flex-col items-center justify-center text-center cursor-pointer transition hover:border-indigo-400/60"
              title={`深度休整 (Rest)：睡眠恢复 +${totalRest.focus}%专注与 +${totalRest.energy}精力 (含睡眠环境加成)`}
            >
              <Moon className="w-4 h-4 text-indigo-400 mb-0.5" />
              <span className="text-[10px] font-tech font-bold text-white leading-none">深度休整</span>
              <span className="text-[8px] text-indigo-300 font-sans mt-0.5">
                +{totalRest.focus} 专注{roomBonuses.totalBonusRate > 0 ? ` (+${roomBonuses.totalBonusRate}%)` : ''}
              </span>
            </button>

            <button
              onClick={() => {
                if (onCoffee) onCoffee();
                else if (onConsumeEnergyDrink) onConsumeEnergyDrink();
              }}
              className="p-2 rounded-xl bg-slate-900 border border-amber-500/30 active:bg-slate-800 flex flex-col items-center justify-center text-center cursor-pointer transition hover:border-amber-400/60"
              title="特调咖啡 (Coffee)：花费$20或消耗库存，瞬间拉满 +50%专注！"
            >
              <Coffee className="w-4 h-4 text-amber-400 mb-0.5" />
              <span className="text-[10px] font-tech font-bold text-white leading-none">特调咖啡</span>
              <span className="text-[8px] text-amber-300 font-sans mt-0.5">$20/存量</span>
            </button>

            <button
              onClick={() => onReviewTacticalTheory && onReviewTacticalTheory()}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 active:bg-slate-800 flex flex-col items-center justify-center text-center cursor-pointer transition hover:border-emerald-500/50"
              title="零体力消耗！研读战术教案提升微操与心态"
            >
              <Brain className="w-4 h-4 text-emerald-400 mb-0.5" />
              <span className="text-[10px] font-tech font-bold text-white leading-none">战术教案</span>
              <span className="text-[8px] text-emerald-400 font-sans mt-0.5">0 体力消耗</span>
            </button>
          </div>

          {/* Recovery Room Environment Quick Access Hub */}
          <div className="mt-2 p-2 rounded-xl bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 border border-indigo-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="p-1 rounded-lg bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 shrink-0">
                <BedDouble className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-tech font-bold text-white text-[11px]">睡眠康复室 (Recovery Room)</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-900 text-indigo-300 font-code font-bold">
                    {roomBonuses.totalBonusRate > 0 ? `+${roomBonuses.totalBonusRate}% 恢复加成` : '基础环境'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate font-sans">
                  隔音 Lv.{stats.recoveryRoom?.soundproofing || 0} · 寝具 Lv.{stats.recoveryRoom?.bedding || 0} · 微环境 Lv.{stats.recoveryRoom?.atmosphere || 0} (单次休整恢复: +{totalRest.energy}精力 / +{totalRest.focus}%专注)
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                setShowRecoveryRoomModal(true);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-tech font-bold text-[10px] transition cursor-pointer flex items-center gap-1 shrink-0 ml-2 shadow shadow-indigo-600/20"
              title="升级隔音设施与高奢寝具"
            >
              <span>升级睡眠环境</span>
              <Sparkles className="w-3 h-3 text-amber-300" />
            </button>
          </div>

          {/* Player Agency Commercial Hub (选手经纪事务所) */}
          <div className="mt-2 p-2 rounded-xl bg-gradient-to-r from-slate-950 via-amber-950/30 to-slate-950 border border-amber-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="p-1 rounded-lg bg-amber-950/80 border border-amber-500/30 text-amber-400 shrink-0">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-tech font-bold text-white text-[11px]">经纪事务所 (Player Agency)</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-code font-bold ${
                    currentAgent
                      ? 'bg-amber-900/80 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {currentAgent ? `${currentAgent.name} (Lv.${currentAgent.tier})` : '自由选手 (未签约)'}
                  </span>
                  {agencySummary.passiveCash > 0 && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 font-code font-bold border border-emerald-500/30">
                      +${agencySummary.passiveCash}/场
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 truncate font-sans">
                  知名度: {stats.fame} 🌟 · 代言合约: {(stats.agency?.signedSponsors || []).length}项 · 商务累计收益: ${stats.agency?.totalEarnedFromAgency || 0}
                  {currentAgent ? ` · 赞助溢价 +${Math.round(currentAgent.sponsorshipBonusRate * 100)}%` : ' (聘用经纪人开启知名度被动分红)'}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                if (onOpenAgency) {
                  onOpenAgency();
                } else {
                  setShowAgencyModalLocal(true);
                }
              }}
              className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 active:scale-98 text-white font-tech font-bold text-[10px] transition cursor-pointer flex items-center gap-1 shrink-0 ml-2 shadow shadow-amber-600/20"
              title="聘用经纪人或签署商业赞助代言"
            >
              <span>{currentAgent ? '管理经纪约' : '签约经纪人'}</span>
              <Handshake className="w-3 h-3 text-amber-200" />
            </button>
          </div>

          {/* Career Health & Physiotherapist Hub (职业健康与腱鞘炎理疗中心) */}
          <div className={`mt-2 p-2 rounded-xl border flex items-center justify-between text-xs transition-all ${
            stats.careerHealth?.hasRSI
              ? 'bg-gradient-to-r from-slate-950 via-rose-950/40 to-slate-950 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.15)] animate-pulse'
              : (stats.careerHealth?.strain || 0) >= 60
              ? 'bg-gradient-to-r from-slate-950 via-amber-950/30 to-slate-950 border-amber-500/40'
              : 'bg-gradient-to-r from-slate-950 via-teal-950/30 to-slate-950 border-teal-500/30'
          }`}>
            <div className="flex items-center gap-2 overflow-hidden">
              <div className={`p-1 rounded-lg border shrink-0 ${
                stats.careerHealth?.hasRSI
                  ? 'bg-rose-950/80 border-rose-500/40 text-rose-400 animate-pulse'
                  : 'bg-teal-950/80 border-teal-500/30 text-teal-400'
              }`}>
                <Stethoscope className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-tech font-bold text-white text-[11px]">职业健康与腱鞘负荷 (Career Health)</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-code font-bold ${
                    stats.careerHealth?.hasRSI
                      ? 'bg-rose-900/90 text-rose-200 border border-rose-500/50'
                      : (stats.careerHealth?.strain || 0) >= 60
                      ? 'bg-amber-900/80 text-amber-300 border border-amber-500/40'
                      : 'bg-teal-900/80 text-teal-300 border border-teal-500/30'
                  }`}>
                    {stats.careerHealth?.hasRSI
                      ? `🚨 腱鞘炎锁死上限: ${stats.careerHealth.maxMechanics}/100`
                      : `手腕肌腱负荷: ${stats.careerHealth?.strain || 0}%`}
                  </span>
                  {stats.careerHealth?.physioPerkActive && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-950 text-teal-300 font-code font-bold border border-teal-500/30">
                      护盾-50%
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 truncate font-sans">
                  {stats.careerHealth?.hasRSI ? (
                    <span className="text-rose-300 font-medium">
                      ⚠️ 肌腱水肿致操作受限！微操上限强制封顶为 {stats.careerHealth.maxMechanics} 点，必须由理疗师施治恢复！
                    </span>
                  ) : (
                    <span>
                      连续磨练: {stats.careerHealth?.consecutiveGrinds || 0} 局无休 · 微操上限: {stats.careerHealth?.maxMechanics || 100}/100 (疲劳超负荷将诱发 RSI 锁死微操)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                if (onOpenPhysio) {
                  onOpenPhysio();
                } else {
                  setShowPhysioModalLocal(true);
                }
              }}
              className={`px-2.5 py-1.5 rounded-lg active:scale-98 text-slate-950 font-tech font-bold text-[10px] transition cursor-pointer flex items-center gap-1 shrink-0 ml-2 shadow ${
                stats.careerHealth?.hasRSI
                  ? 'bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-400 hover:to-red-400 text-white shadow-rose-600/30 animate-bounce'
                  : 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 shadow-teal-600/20'
              }`}
              title="前往运动康复理疗诊所"
            >
              <span>{stats.careerHealth?.hasRSI ? '急救理疗' : '理疗康复'}</span>
              <Activity className="w-3 h-3" />
            </button>
          </div>

          {/* Legacy Talent Tree Hub (名宿永久传承天赋树 · 声望加点) */}
          <div className="mt-2 p-2 rounded-xl bg-gradient-to-r from-slate-950 via-amber-950/40 to-slate-950 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="p-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 shrink-0">
                <Zap className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-tech font-bold text-white text-[11px]">名宿传承天赋树 (Legacy Talent Tree)</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-code font-bold border border-amber-500/30">
                    {prestigeState.unlockedPassives.length}/{LEGACY_PASSIVES_CATALOG.length} 已点亮
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-yellow-950 text-yellow-300 font-code font-bold border border-yellow-500/30">
                    声望: {prestigeState.prestigePoints.toLocaleString()} P
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate font-sans">
                  {prestigeState.unlockedPassives.length > 0
                    ? `当前生效: ${prestigeState.unlockedPassives.map(id => LEGACY_PASSIVES_CATALOG.find(p => p.id === id)?.name).filter(Boolean).slice(0, 3).join(' · ')}...`
                    : '花费前世周目声望，永久点亮属性倍率、极速疲劳排空与单排专属增益！'}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                setShowTalentTreeModal(true);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-98 text-slate-950 font-tech font-extrabold text-[10px] transition cursor-pointer flex items-center gap-1 shrink-0 ml-2 shadow shadow-amber-500/25"
              title="打开名宿传承天赋树加点面板"
            >
              <span>加点天赋</span>
              <Sparkles className="w-3 h-3 text-slate-950" />
            </button>
          </div>

          {/* Match VOD Library Hub (经典赛事录像与团战复盘库 · 战术洞察) */}
          <div className="mt-2 p-2 rounded-xl bg-gradient-to-r from-slate-950 via-cyan-950/40 to-slate-950 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="p-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shrink-0">
                <Film className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-tech font-bold text-white text-[11px]">赛事录像与团战复盘库 (Match VODs)</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-code font-bold border border-cyan-500/30">
                    战术洞察: {stats.tacticalInsight ?? 45}/100 🧠
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate font-sans">
                  观看经典决胜局动态战术沙盘，拆解大龙坑与河道关键团战抉择，汲取战术洞察与操作经验！
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                if (onOpenVodLibrary) onOpenVodLibrary();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 active:scale-98 text-slate-950 font-tech font-extrabold text-[10px] transition cursor-pointer flex items-center gap-1 shrink-0 ml-2 shadow shadow-cyan-500/25"
              title="打开赛事录像与高光复盘库"
            >
              <span>研读录像</span>
              <Film className="w-3 h-3 text-slate-950" />
            </button>
          </div>
        </div>
      )}

      {/* Solo Queue Persistent NPC Rivalry Card */}
      <SoloQueueRivalryCard
        stats={stats}
        onToggleSnipeQueue={onToggleRivalSnipeQueue || (() => {})}
        onStartMatch={startRankedMatch}
      />

      {/* Streaming Milestones Tracker & Channel Perks */}
      <StreamingMilestonesTracker
        stats={stats}
        onClaimMilestone={onClaimStreamMilestone || (() => ({ success: false, message: '功能未就绪' }))}
        onEquipEmote={onEquipFanEmote || (() => ({ success: false, message: '功能未就绪' }))}
        onStream={onStream}
      />

      {/* 3. Compact Collapsible Modules with Expand/Collapse & Pop-up Overlay Buttons */}
      <div className="space-y-2 pt-1">
        {/* Module A: 7-Day Login Streak System */}
        <div className="rounded-xl bg-slate-900/90 border border-amber-500/30 overflow-hidden shadow-sm transition">
          <div className="px-3 py-2 flex items-center justify-between text-xs font-tech bg-slate-900/80">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400 fill-current" />
              <span className="font-bold text-white">7日签到</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-code font-bold">
                第 {loginStreak.currentStreak}/7 天
              </span>
              {loginStreak.canClaimToday ? (
                <span className="text-[10px] text-emerald-400 font-bold animate-pulse">
                  🎁 今日待领
                </span>
              ) : (
                <span className="text-[10px] text-slate-500">
                  ✓ 今日已领
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {loginStreak.canClaimToday && !isStreakExpanded && (
                <button
                  onClick={onClaimLoginStreak}
                  className="px-2 py-0.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-tech font-bold text-[10px] transition cursor-pointer shadow-sm"
                >
                  一键领奖
                </button>
              )}
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowStreakModal(true);
                }}
                className="p-1 rounded text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition cursor-pointer"
                title="打开7日签到全屏浮层"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setIsStreakExpanded(!isStreakExpanded);
                }}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center gap-0.5 text-[10px]"
                title={isStreakExpanded ? '折叠' : '展开'}
              >
                {isStreakExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isStreakExpanded && (
            <div className="p-3 pt-0 border-t border-slate-800/80 animate-fadeIn">
              <DailyLoginStreakCard
                loginStreak={loginStreak}
                onClaim={onClaimLoginStreak}
                onEquipSkin={onEquipSkin}
              />
            </div>
          )}
        </div>

        {/* Module B: Daily Challenges Card */}
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-sm transition">
          <div className="px-3 py-2 flex items-center justify-between text-xs font-tech bg-slate-900/80">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white">每日排位目标</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-code font-bold">
                {completedChallengesCount}/{dailyChallenges.length} 已达成
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowChallengesModal(true);
                }}
                className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition cursor-pointer"
                title="打开每日目标排位浮层"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setIsChallengesExpanded(!isChallengesExpanded);
                }}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center gap-0.5 text-[10px]"
                title={isChallengesExpanded ? '折叠' : '展开'}
              >
                {isChallengesExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isChallengesExpanded && (
            <div className="p-3 pt-0 border-t border-slate-800/80 animate-fadeIn">
              <DailyChallengesCard
                challenges={dailyChallenges}
                onClaim={onClaimChallenge}
              />
            </div>
          )}
        </div>

        {/* Module C: Career Match Logs */}
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-sm transition">
          <div className="px-3 py-2 flex items-center justify-between text-xs font-tech bg-slate-900/80">
            <div className="flex items-center gap-2 overflow-hidden">
              <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-bold text-white shrink-0">排位战报</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-code shrink-0">
                {logs.length} 条
              </span>
              {latestLog && !isLogsExpanded && (
                <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                  {latestLog.message}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowLogsModal(true);
                }}
                className="p-1 rounded text-slate-400 hover:text-emerald-300 hover:bg-slate-800 transition cursor-pointer"
                title="打开历史日志全屏浮层"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setIsLogsExpanded(!isLogsExpanded);
                }}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center gap-0.5 text-[10px]"
                title={isLogsExpanded ? '折叠' : '展开'}
              >
                {isLogsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isLogsExpanded && (
            <div className="p-2.5 pt-0 border-t border-slate-800/80 space-y-1.5 max-h-48 overflow-y-auto font-sans text-[11px] animate-fadeIn">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-2 rounded-lg border text-[11px] leading-snug ${
                    log.type === 'win'
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                      : log.type === 'loss'
                      ? 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                      : log.type === 'gear'
                      ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex justify-between text-[9px] text-slate-400 font-code mb-0.5">
                    <span>{log.timestamp}</span>
                    <span className="uppercase font-semibold">
                      {log.type === 'win' ? '胜利' : log.type === 'loss' ? '战败' : log.type === 'gear' ? '外设' : '事件'}
                    </span>
                  </div>
                  <div>{log.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* POP-UP OVERLAY MODALS (Accessible via the Maximize buttons) */}
      {/* ========================================================================= */}

      {/* Streak Pop-up Overlay Modal */}
      {showStreakModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-slate-950 border border-amber-500/40 rounded-2xl p-4 shadow-2xl space-y-3 relative">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400 fill-current" />
                <h3 className="font-tech font-bold text-amber-300 text-sm">
                  每日连续签到 · 专属浮层
                </h3>
              </div>
              <button
                onClick={() => setShowStreakModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <DailyLoginStreakCard
              loginStreak={loginStreak}
              onClaim={onClaimLoginStreak}
              onEquipSkin={onEquipSkin}
            />
          </div>
        </div>
      )}

      {/* Challenges Pop-up Overlay Modal */}
      {showChallengesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-slate-950 border border-cyan-500/40 rounded-2xl p-4 shadow-2xl space-y-3 relative">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-cyan-400" />
                <h3 className="font-tech font-bold text-cyan-300 text-sm">
                  每日排位目标挑战 · 专属浮层
                </h3>
              </div>
              <button
                onClick={() => setShowChallengesModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <DailyChallengesCard
              challenges={dailyChallenges}
              onClaim={onClaimChallenge}
            />
          </div>
        </div>
      )}

      {/* Logs Pop-up Overlay Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md max-h-[85vh] flex flex-col bg-slate-950 border border-slate-700 rounded-2xl p-4 shadow-2xl space-y-3 relative">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <h3 className="font-tech font-bold text-white text-sm">
                  排位生涯历史战报 ({logs.length}条)
                </h3>
              </div>
              <button
                onClick={() => setShowLogsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-2.5 rounded-xl border text-xs leading-snug ${
                    log.type === 'win'
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                      : log.type === 'loss'
                      ? 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                      : log.type === 'gear'
                      ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex justify-between text-[10px] text-slate-400 font-code mb-1">
                    <span>{log.timestamp}</span>
                    <span className="uppercase font-semibold">
                      {log.type === 'win' ? '胜利' : log.type === 'loss' ? '战败' : log.type === 'gear' ? '外设' : '事件'}
                    </span>
                  </div>
                  <div>{log.message}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Text Play-by-Play Match Broadcast Simulation Modal */}
      <TextMatchSimulationModal
        isOpen={showSimModal}
        onClose={() => setShowSimModal(false)}
        stats={stats}
        onMatchComplete={handleMatchComplete}
        isPromoGame={Boolean(stats.promoSeries && stats.promoSeries.active)}
        targetPromoTier={stats.promoSeries?.targetTier}
      />

      {/* Extreme Fatigue & Low Focus Dilemma Modal (Rest vs Coffee) */}
      {showFatiguePromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0f131c] border-2 border-rose-500/80 rounded-2xl max-w-sm w-full p-4 shadow-[0_0_25px_rgba(244,63,94,0.3)] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-rose-400">
                <Brain className="w-5 h-5 animate-pulse" />
                <h3 className="font-tech font-bold text-white text-base">⚠️ 严重疲劳 · 专注力透支</h3>
              </div>
              <button
                onClick={() => setShowFatiguePromptModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-rose-950/30 p-2.5 rounded-lg border border-rose-500/30">
              当前专注度仅剩 <span className="text-rose-400 font-bold font-code">{stats.focus ?? 100}%</span>，双眼酸痛、反应迟钝！继续强行排位冲榜或直播极易严重掉分与心态失衡。请在以下两种方案中做出抉择恢复状态：
            </p>

            <div className="space-y-2 pt-1">
              {/* Choice 1: Rest */}
              <div className="p-3 rounded-xl bg-slate-900 border border-indigo-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-tech font-bold text-white text-xs flex items-center gap-1.5">
                    <span>💤 方案一：深度休整 (Rest)</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-code font-bold">免费</span>
                    {roomBonuses.totalBonusRate > 0 && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/40 font-code font-bold">
                        +{roomBonuses.totalBonusRate}% 康复舱加成
                      </span>
                    )}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  充足8小时深度睡眠与电竞营养餐。恢复专注度(+{totalRest.focus}%)与精力(+{totalRest.energy})，心态稳定(+{totalRest.mental})！
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onRest();
                      setShowFatiguePromptModal(false);
                    }}
                    className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-tech font-bold text-xs transition cursor-pointer shadow"
                  >
                    选择【深度休整 (Rest)】入睡
                  </button>
                  <button
                    onClick={() => {
                      setShowFatiguePromptModal(false);
                      setShowRecoveryRoomModal(true);
                    }}
                    className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-98 text-indigo-300 border border-indigo-500/40 font-tech font-bold text-xs transition cursor-pointer"
                    title="升级隔音与高奢寝具"
                  >
                    🛏️ 升级环境
                  </button>
                </div>
              </div>

              {/* Choice 2: Coffee */}
              <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-tech font-bold text-white text-xs flex items-center gap-1.5">
                    <span>☕ 方案二：特调咖啡 (Coffee)</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-500/30 font-code font-bold">
                      {(stats.energyDrinks || 0) > 0 ? `免费 (余${stats.energyDrinks}罐)` : '$20'}
                    </span>
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  双份浓缩冰美式，高能咖啡因瞬时激活神经突触！极速拉满专注度(+50%)，零等待立刻重新开排冲榜！
                </p>
                <button
                  onClick={() => {
                    if (onCoffee) onCoffee();
                    else if (onConsumeEnergyDrink) onConsumeEnergyDrink();
                    setShowFatiguePromptModal(false);
                  }}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 active:scale-98 text-white font-tech font-bold text-xs transition cursor-pointer shadow"
                >
                  选择【特调咖啡 (Coffee)】提神
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recovery Room Upgrade Modal */}
      <RecoveryRoomModal
        isOpen={showRecoveryRoomModal}
        onClose={() => setShowRecoveryRoomModal(false)}
        stats={stats}
        onRest={onRest}
        onUpgrade={onUpgradeRecoveryRoom || (() => ({ success: false, message: '未连接升级功能' }))}
      />

      {/* Player Agency Commercial Modal */}
      <PlayerAgencyModal
        isOpen={showAgencyModalLocal}
        onClose={() => setShowAgencyModalLocal(false)}
        stats={stats}
        onHireAgent={onHireAgent || (() => ({ success: false, message: '未连接签约功能' }))}
        onFireAgent={onFireAgent || (() => {})}
        onSignSponsor={onSignSponsor || (() => ({ success: false, message: '未连接赞助功能' }))}
        onSignRecruit={onSignRecruit}
      />

      {/* Physiotherapist Career Health Clinic Modal */}
      <PhysiotherapistModal
        isOpen={showPhysioModalLocal}
        onClose={() => setShowPhysioModalLocal(false)}
        stats={stats}
        onTreat={onTreatCareerHealth || (() => ({ success: false, message: '未连接理疗功能' }))}
        onOpenRecoveryRoom={onOpenRecoveryRoom}
      />

      {/* Legacy Talent Tree Modal (永久传承天赋树加点面板) */}
      <LegacyTalentTreeModal
        isOpen={showTalentTreeModal}
        onClose={() => setShowTalentTreeModal(false)}
        prestigeState={prestigeState}
        onUnlockPassive={onUnlockPassive}
        onOpenPrestigeHall={onOpenPrestigeHall}
      />
    </div>
  );
};
