import React, { useState, useEffect, useRef } from 'react';
import { PlayerStats, RankTier, GamePhase, ConsumableItem, PrestigeState, WorldTourState, EsportsCalendarState } from '../types/game';
import { QuickShopModal } from './QuickShopModal';
import { 
  Battery, 
  Heart, 
  Volume2, 
  VolumeX, 
  RotateCcw,
  FileCode,
  Zap,
  ShoppingBag,
  MessageSquare,
  Lock,
  Sparkles,
  Home,
  Crosshair,
  Network,
  Flame,
  Trophy,
  Building2,
  Swords,
  Gamepad2,
  Brain,
  Coffee,
  Moon,
  X,
  Store,
  Briefcase,
  Stethoscope,
  Activity,
  Globe,
  Calendar,
  BookOpen,
  Film,
  Newspaper,
  Settings,
  Sliders,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface MobileStatusBarProps {
  stats: PlayerStats;
  currentPhase: GamePhase;
  isDynastyUnlocked: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onReset: () => void;
  isPhoneFrame: boolean;
  onToggleFrame: () => void;
  onOpenLua: () => void;
  onOpenLeaderboard: () => void;
  onOpenGacha: () => void;
  onOpenLifeSim: () => void;
  onOpenTactical: () => void;
  onOpenSynergy: () => void;
  onOpenHardware: () => void;
  onOpenSocialFeed?: () => void;
  onOpenReflexDuel?: () => void;
  onOpenPatchNotes?: () => void;
  onOpenTrophies?: () => void;
  activeTitle?: string | null;
  onOpenMilestones?: () => void;
  onOpenCareerJournal?: () => void;
  onRest?: () => void;
  onCoffee?: () => void;
  onBuyConsumable?: (item: ConsumableItem, immediateUse: boolean) => { success: boolean; message: string };
  onOpenRecoveryRoom?: () => void;
  onOpenAgency?: () => void;
  onOpenPhysio?: () => void;
  prestigeState?: PrestigeState;
  worldTourState?: WorldTourState;
  calendarState?: EsportsCalendarState;
  onOpenPrestigeHall?: () => void;
  onOpenWorldTour?: () => void;
  onOpenCalendar?: () => void;
  onOpenPowerRankings?: () => void;
  onOpenCommunityRelations?: () => void;
  onOpenLegacyLore?: () => void;
  onOpenVodLibrary?: () => void;
}

export const MobileStatusBar: React.FC<MobileStatusBarProps> = ({
  stats,
  currentPhase,
  isDynastyUnlocked,
  soundEnabled,
  onToggleSound,
  onReset,
  isPhoneFrame,
  onToggleFrame,
  onOpenLegacyLore,
  onOpenVodLibrary,
  onOpenLua,
  onOpenLeaderboard,
  onOpenGacha,
  onOpenLifeSim,
  onOpenTactical,
  onOpenSynergy,
  onOpenHardware,
  onOpenSocialFeed,
  onOpenReflexDuel,
  onOpenPatchNotes,
  onOpenTrophies,
  activeTitle,
  onOpenMilestones,
  onRest,
  onCoffee,
  onBuyConsumable,
  onOpenRecoveryRoom,
  onOpenAgency,
  onOpenPhysio,
  prestigeState,
  worldTourState,
  calendarState,
  onOpenPrestigeHall,
  onOpenWorldTour,
  onOpenCalendar,
  onOpenPowerRankings,
  onOpenCommunityRelations,
  onOpenCareerJournal
}) => {
  const [showRecoveryModal, setShowRecoveryModal] = useState<boolean>(false);
  const [showQuickShopModal, setShowQuickShopModal] = useState<boolean>(false);
  const [showSystemModal, setShowSystemModal] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Fatigue / Focus Fluid Draining Tracking & Subtle Responsive Animation
  const currentFocus = Math.min(100, Math.max(0, stats.focus ?? 100));
  const [ghostFocus, setGhostFocus] = useState<number>(currentFocus);
  const [isDraining, setIsDraining] = useState<boolean>(false);
  const [drainDelta, setDrainDelta] = useState<number | null>(null);
  const prevFocusRef = useRef<number>(currentFocus);

  useEffect(() => {
    const prev = prevFocusRef.current;
    if (currentFocus < prev) {
      // High-intensity activity drained focus: trigger fluid responsive drain animation
      const delta = prev - currentFocus;
      setDrainDelta(delta);
      setIsDraining(true);

      // Primary active bar reduces immediately with smooth cubic-bezier easing.
      // Delayed ghost trail lingers for 300ms, then glides down smoothly over 700ms.
      const ghostTimer = setTimeout(() => {
        setGhostFocus(currentFocus);
      }, 300);

      const drainTimer = setTimeout(() => {
        setIsDraining(false);
        setDrainDelta(null);
      }, 1200);

      prevFocusRef.current = currentFocus;
      return () => {
        clearTimeout(ghostTimer);
        clearTimeout(drainTimer);
      };
    } else {
      // Restored or initialized: sync bars smoothly
      setGhostFocus(currentFocus);
      prevFocusRef.current = currentFocus;
    }
  }, [currentFocus]);

  const rankNamesCn: Record<RankTier, string> = {
    Iron: '坚韧黑铁',
    Bronze: '英勇黄铜',
    Silver: '不屈白银',
    Gold: '荣耀黄金',
    Platinum: '华贵铂金',
    Emerald: '流光翡翠',
    Diamond: '璀璨钻石',
    Master: '超凡大师',
    Grandmaster: '傲世宗师',
    Challenger: '最强王者'
  };

  const rankColors: Record<RankTier, string> = {
    Iron: 'text-stone-400 border-stone-700 bg-stone-900',
    Bronze: 'text-amber-700 border-amber-800 bg-amber-950/40',
    Silver: 'text-slate-300 border-slate-600 bg-slate-900',
    Gold: 'text-amber-400 border-amber-500 bg-amber-950/40',
    Platinum: 'text-teal-400 border-teal-500 bg-teal-950/40',
    Emerald: 'text-emerald-400 border-emerald-500 bg-emerald-950/40',
    Diamond: 'text-sky-400 border-sky-500 bg-sky-950/40',
    Master: 'text-purple-400 border-purple-500 bg-purple-950/40',
    Grandmaster: 'text-rose-400 border-rose-500 bg-red-950/40',
    Challenger: 'text-amber-300 border-amber-400 bg-amber-950/60 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
  };

  // Phase Title & Badge
  const phaseMeta = {
    1: {
      name: '第一阶段 · 网吧少年',
      role: '天梯千分冲榜中',
      icon: Gamepad2,
      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/40'
    },
    2: {
      name: '第二阶段 · 职业赛场',
      role: '登台指挥BP队长',
      icon: Swords,
      color: 'text-indigo-400 border-indigo-500/30 bg-indigo-950/40'
    },
    3: {
      name: '第三阶段 · 传奇豪门',
      role: '俱乐部董事长 / GM',
      icon: Building2,
      color: 'text-amber-400 border-amber-500/30 bg-amber-950/40'
    }
  }[currentPhase] || {
    name: '电竞生涯',
    role: '选手',
    icon: Gamepad2,
    color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/40'
  };

  const PhaseIcon = phaseMeta.icon;

  return (
    <div className="bg-[#0a0e17]/95 backdrop-blur-md border-b border-cyan-500/20 px-3 py-2 sticky top-0 z-40 select-none shadow-md">
      {/* 2. Identity & Resource HUD */}
      <div className="flex items-center justify-between gap-1.5 text-xs">
        {/* Role & Stage Badge + Active Title */}
        <div className="flex items-center gap-1.5 overflow-hidden">
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[11px] font-tech font-bold shrink-0 ${phaseMeta.color}`}>
            <PhaseIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{phaseMeta.role}</span>
          </div>

          {activeTitle && (
            <button
              onClick={() => onOpenMilestones && onOpenMilestones()}
              className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-amber-500/25 to-rose-500/25 border border-amber-400/50 text-amber-300 text-[10px] font-tech font-extrabold flex items-center gap-1 shrink-0 shadow-[0_0_8px_rgba(251,191,36,0.25)] hover:border-amber-300 transition cursor-pointer"
              title="已佩戴至尊称号 (点击管理)"
            >
              <span>👑</span>
              <span className="truncate max-w-[85px]">{activeTitle}</span>
            </button>
          )}

          {/* Quick Season & Week Badge */}
          {calendarState && (
            <button
              onClick={() => onOpenCalendar && onOpenCalendar()}
              className="px-2 py-0.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[10px] font-tech font-bold flex items-center gap-1 shrink-0 hover:border-emerald-400 transition cursor-pointer"
              title="职业赛历与赛季版本 (点击查看26周大事件)"
            >
              <Calendar className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
              <span>W{calendarState.currentWeek}</span>
            </button>
          )}

          {/* Quick Prestige Tag (if 2nd gen+) */}
          {(prestigeState?.generation ?? 1) > 1 && (
            <button
              onClick={() => onOpenPrestigeHall && onOpenPrestigeHall()}
              className="px-2 py-0.5 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[10px] font-tech font-bold flex items-center gap-1 shrink-0 hover:border-amber-400 transition cursor-pointer"
              title="名宿声望 (点击进入轮回转生殿堂)"
            >
              <span>🌀</span>
              <span>第{prestigeState?.generation}世</span>
            </button>
          )}
        </div>

        {/* Resources Row */}
        <div className="flex items-center gap-1 text-[11px] font-tech">
          {/* Rank & LP Pill (For Phase 1 & 2) */}
          {currentPhase <= 2 && (
            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-tech font-bold ${rankColors[stats.rankTier] || rankColors.Gold}`}>
              <span>{rankNamesCn[stats.rankTier] || stats.rankTier}</span>
              <span className="font-code text-cyan-300">{stats.lp}点</span>
            </div>
          )}

          {/* Energy */}
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#0f131c] border border-slate-800" title="体力精力">
            <Battery className="w-3 h-3 text-amber-400" />
            <span className="font-code text-amber-300 font-bold">{stats.energy}%</span>
          </div>

          {/* Focus / 专注度 & 疲劳监控 */}
          <button
            onClick={() => setShowRecoveryModal(true)}
            className={`relative flex items-center gap-1 px-1.5 py-0.5 rounded border transition-all duration-300 ease-out cursor-pointer group select-none ${
              isDraining
                ? 'border-rose-400/90 ring-1 ring-rose-400/60 bg-rose-950/60 text-rose-300 animate-drain-glow'
                : currentFocus < 25
                ? 'bg-rose-950/70 border-rose-500/80 text-rose-300 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                : currentFocus < 50
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                : 'bg-[#0f131c] border-cyan-500/40 text-cyan-300 hover:border-cyan-400'
            }`}
            title="专注度 / 疲劳度监控 (点击开启休整与特调咖啡抉择面板)"
          >
            {drainDelta !== null && drainDelta > 0 && (
              <span className="absolute -top-2.5 -right-1 px-1 py-0.2 rounded-full bg-rose-600 text-white font-code text-[8px] font-extrabold shadow-[0_0_6px_rgba(244,63,94,0.8)] animate-bounce pointer-events-none z-10">
                -{drainDelta}%
              </span>
            )}

            <Brain className={`w-3 h-3 shrink-0 transition-transform duration-300 ${isDraining ? 'scale-125 text-rose-400 rotate-12' : currentFocus < 25 ? 'text-rose-400' : 'text-cyan-400'}`} />
            <span className="font-tech text-[10px] hidden xs:inline">专注</span>
            <span className={`font-code font-bold transition-colors duration-300 ${isDraining ? 'text-rose-300' : ''}`}>
              {currentFocus}%
            </span>

            <div className="w-8 xs:w-11 sm:w-14 h-1.5 rounded-full bg-slate-950 border border-slate-700/60 overflow-hidden relative shadow-inner shrink-0">
              <div
                className="absolute inset-y-0 left-0 bg-rose-400/40 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${ghostFocus}%` }}
              />
              <div
                className={`relative h-full rounded-full transition-all duration-500 ${
                  currentFocus < 25
                    ? 'bg-gradient-to-r from-red-600 to-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]'
                    : currentFocus < 50
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_6px_rgba(245,158,11,0.5)]'
                    : 'bg-gradient-to-r from-cyan-500 to-teal-400 shadow-[0_0_6px_rgba(6,182,212,0.5)]'
                }`}
                style={{ width: `${currentFocus}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-bar-shimmer pointer-events-none" />
              </div>
            </div>
          </button>

          {/* Mental */}
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#0f131c] border border-slate-800" title="抗压心态">
            <Heart className="w-3 h-3 text-rose-400" />
            <span className="font-code text-rose-300 font-bold">{stats.mental}%</span>
          </div>

          {/* Money */}
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#0f131c] border border-slate-800" title="生涯资金">
            <span className="text-emerald-400 font-bold font-code">$</span>
            <span className="font-code text-emerald-300 font-bold">{stats.money.toLocaleString()}</span>
          </div>

          {/* Quick Shop */}
          <button
            onClick={() => setShowQuickShopModal(true)}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-gradient-to-r from-emerald-950/70 to-teal-950/70 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 hover:text-emerald-200 transition cursor-pointer text-[10px] font-tech font-bold shadow-[0_0_8px_rgba(16,185,129,0.2)]"
            title="战备便利店 · 选购高能能量弹与咖啡即时秒回疲劳"
          >
            <Store className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="hidden xs:inline">补给站</span>
          </button>

          {/* Career Health */}
          <button
            onClick={() => {
              if (onOpenPhysio) onOpenPhysio();
              else setShowRecoveryModal(true);
            }}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded border transition cursor-pointer text-[10px] font-tech font-bold ${
              stats.careerHealth?.hasRSI
                ? 'bg-rose-950/80 border-rose-500/80 text-rose-300 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                : (stats.careerHealth?.strain || 0) > 60
                ? 'bg-amber-950/50 border-amber-500/50 text-amber-300'
                : 'bg-[#0f131c] border-teal-500/40 text-teal-300 hover:border-teal-400'
            }`}
            title="手腕肌腱负荷与职业健康 (点击前往理疗诊所)"
          >
            <Stethoscope className={`w-3 h-3 shrink-0 ${stats.careerHealth?.hasRSI ? 'text-rose-400' : 'text-teal-400'}`} />
            <span className="hidden xs:inline">肌腱</span>
            <span className="font-code">
              {stats.careerHealth?.hasRSI ? `RSI(${stats.careerHealth.maxMechanics}限)` : `${stats.careerHealth?.strain || 0}%`}
            </span>
          </button>

          {/* UNIFIED SYSTEM HUB BUTTON (⚙️ 系统中枢) */}
          <button
            onClick={() => setShowSystemModal(true)}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gradient-to-r from-slate-900 to-cyan-950/90 hover:from-slate-800 hover:to-cyan-900 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 hover:text-white transition cursor-pointer text-[10px] font-tech font-bold shadow-[0_0_10px_rgba(6,182,212,0.25)] ml-1"
            title="系统设置与全局中枢 (赛历、巡回赛、全球战力榜、音效与存档管理)"
          >
            <Settings className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xs:inline">系统</span>
          </button>
        </div>
      </div>

      {/* RSI Acute Flare-up Danger Banner */}
      {stats.careerHealth?.hasRSI && (
        <div className="mt-1.5 px-2 py-1 rounded-lg bg-rose-950/90 border border-rose-500/70 flex items-center justify-between text-[10px] font-tech text-rose-200 animate-pulse shadow-md">
          <div className="flex items-center gap-1.5 truncate">
            <Activity className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="font-bold truncate">
              🚨 腱鞘炎(RSI)受损发作：微操上限被锁死在 {stats.careerHealth.maxMechanics} 点！
            </span>
          </div>
          {onOpenPhysio && (
            <button
              onClick={onOpenPhysio}
              className="px-2 py-0.5 rounded bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-extrabold cursor-pointer transition text-[9px] shadow shrink-0 ml-1.5 flex items-center gap-0.5"
              title="前往运动康复理疗诊所施治"
            >
              <Stethoscope className="w-2.5 h-2.5" />
              <span>立即理疗</span>
            </button>
          )}
        </div>
      )}

      {/* Low Focus / Fatigue Emergency Alert Banner */}
      {(stats.focus ?? 100) < 30 && (
        <div className="mt-1.5 px-2 py-1 rounded-lg bg-rose-950/80 border border-rose-500/60 flex items-center justify-between text-[10px] font-tech text-rose-300 animate-pulse">
          <div className="flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="font-bold">⚠️ 专注涣散 (严重疲劳)! 操作迟钝易掉分</span>
          </div>
          <div className="flex items-center gap-1 font-bold">
            <button
              onClick={() => setShowQuickShopModal(true)}
              className="px-2 py-0.5 rounded bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white cursor-pointer transition text-[9px] shadow flex items-center gap-1"
              title="战备应急便利店 · 即刻选购能量弹秒回疲劳"
            >
              <Store className="w-2.5 h-2.5" />
              <span>🛒 应急速购</span>
            </button>
            {onCoffee && (
              <button
                onClick={onCoffee}
                className="px-2 py-0.5 rounded bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white cursor-pointer transition text-[9px] shadow"
                title="特调咖啡 ($20 快速拉满)"
              >
                ☕ 浓缩咖啡
              </button>
            )}
            {onRest && (
              <button
                onClick={onRest}
                className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer transition text-[9px] shadow"
                title="深度休整 (免费睡眠恢复)"
              >
                💤 深度休整
              </button>
            )}
          </div>
        </div>
      )}

      {/* Strategic Recovery Choice Modal: Rest vs Coffee */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0f131c] border-2 border-cyan-500/60 rounded-2xl max-w-sm w-full p-4 shadow-[0_0_25px_rgba(0,240,255,0.25)] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-cyan-400" />
                <h3 className="font-tech font-bold text-white text-base">选手状态调优 · 恢复抉择</h3>
              </div>
              <button
                onClick={() => setShowRecoveryModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current State Indicator */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-tech">当前竞技专注度 / 疲劳监控</div>
                  <div className="text-xs font-bold text-white mt-0.5 font-tech">
                    {currentFocus >= 70 ? (
                      <span className="text-emerald-400">🟢 巅峰专注 · 反应敏锐 (+10%胜率加成)</span>
                    ) : currentFocus >= 30 ? (
                      <span className="text-amber-300">🟡 状态平稳 · 消耗中</span>
                    ) : (
                      <span className="text-rose-400 animate-pulse">🔴 严重疲劳 · 专注力涣散 (失误率剧增)</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-cyan-300 font-bold font-code">{currentFocus}%</div>
                  <div className="text-[9px] text-slate-500">剩余专注</div>
                </div>
              </div>

              {/* Fluid Dual-Layer Progress Bar in Modal */}
              <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-700/60 overflow-hidden relative shadow-inner">
                <div
                  className="absolute inset-y-0 left-0 bg-rose-400/40 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${ghostFocus}%` }}
                />
                <div
                  className={`relative h-full rounded-full transition-all duration-500 ${
                    currentFocus < 25
                      ? 'bg-gradient-to-r from-red-600 to-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                      : currentFocus < 50
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                      : 'bg-gradient-to-r from-cyan-500 to-teal-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]'
                  }`}
                  style={{ width: `${currentFocus}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-bar-shimmer pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Recovery Choices */}
            <div className="space-y-2.5">
              {/* Option 1: Rest */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-indigo-500/40 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5 font-tech">
                        <span>深度休整 (Rest)</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                          免费
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">8小时深度睡眠与电竞营养餐，全面重置身心</div>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-indigo-300 font-code flex items-center gap-2">
                  <span>✨ 专注 +50%</span>
                  <span>⚡ 体力 +45%</span>
                  <span>❤️ 心态 +18%</span>
                </div>
                <button
                  onClick={() => {
                    if (onRest) onRest();
                    setShowRecoveryModal(false);
                  }}
                  className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-tech font-bold text-xs shadow transition cursor-pointer"
                >
                  💤 立即就寝休整 (Rest)
                </button>
              </div>

              {/* Option 2: Coffee */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-slate-900 to-amber-950/40 border border-amber-500/40 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300">
                      <Coffee className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5 font-tech">
                        <span>现磨特调咖啡 (Coffee)</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-500/30">
                          {(stats.energyDrinks || 0) > 0 ? `免费 (余${stats.energyDrinks}罐)` : '$20'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">高能双倍浓缩冰美式，零等待立刻重新开排！</div>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-amber-300 font-code flex items-center gap-2">
                  <span>☕ 专注 +50%</span>
                  <span>⚡ 精力 +25%</span>
                  <span>🔥 瞬时爆发</span>
                </div>
                <button
                  onClick={() => {
                    if (onCoffee) onCoffee();
                    setShowRecoveryModal(false);
                  }}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 active:scale-98 text-white font-tech font-bold text-xs shadow transition cursor-pointer"
                >
                  ☕ 畅饮冰美式 (Coffee)
                </button>
              </div>

              {/* Option 3: Quick Shop / 战备应急便利店 */}
              <button
                onClick={() => {
                  setShowRecoveryModal(false);
                  setShowQuickShopModal(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-950/80 to-teal-950/80 hover:from-emerald-900/90 hover:to-teal-900/90 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 font-tech font-bold text-xs flex items-center justify-between transition cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.2)] active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Store className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span>战备应急便利店 (Quick Shop)</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-900 text-emerald-300 border border-emerald-400/40">
                        秒回疲劳
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                      选购能量弹、薄荷糖与全能补给箱，紧急拉满状态
                    </div>
                  </div>
                </div>
                <span className="text-emerald-400 font-code text-[11px] font-extrabold shrink-0 ml-1">
                  进店选购 &gt;
                </span>
              </button>

              {/* Option 4: Recovery Room / 睡眠康复空间 */}
              {onOpenRecoveryRoom && (
                <button
                  onClick={() => {
                    setShowRecoveryModal(false);
                    onOpenRecoveryRoom();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-950/80 to-purple-950/80 hover:from-indigo-900/90 hover:to-purple-900/90 border border-indigo-500/50 hover:border-indigo-400 text-indigo-200 font-tech font-bold text-xs flex items-center justify-between transition cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.2)] active:scale-98"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span>睡眠康复空间 (Recovery Room)</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-900 text-indigo-300 border border-indigo-400/40">
                          环境升级
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                        升级隔音与高奢寝具，成倍提高休整恢复倍率
                      </div>
                    </div>
                  </div>
                  <span className="text-indigo-400 font-code text-[11px] font-extrabold shrink-0 ml-1">
                    改造升级 &gt;
                  </span>
                </button>
              )}

              {/* Option 5: Player Agency / 选手经纪人事务所 */}
              {onOpenAgency && (
                <button
                  onClick={() => {
                    setShowRecoveryModal(false);
                    onOpenAgency();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-950/80 to-orange-950/80 hover:from-amber-900/90 hover:to-orange-900/90 border border-amber-500/50 hover:border-amber-400 text-amber-200 font-tech font-bold text-xs flex items-center justify-between transition cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.2)] active:scale-98"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span>选手经纪公司 (Player Agency)</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-amber-900 text-amber-300 border border-amber-400/40">
                          商业代言
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                        聘用专属经纪人，知名度被动分红与商业代言谈判
                      </div>
                    </div>
                  </div>
                  <span className="text-amber-400 font-code text-[11px] font-extrabold shrink-0 ml-1">
                    签约洽谈 &gt;
                  </span>
                </button>
              )}

              {/* Option 6: Career Health & Physiotherapy / 电竞运动康复与理疗诊所 */}
              {onOpenPhysio && (
                <button
                  onClick={() => {
                    setShowRecoveryModal(false);
                    onOpenPhysio();
                  }}
                  className={`w-full py-2.5 px-3 rounded-xl border flex items-center justify-between transition cursor-pointer active:scale-98 ${
                    stats.careerHealth?.hasRSI
                      ? 'bg-gradient-to-r from-rose-950/90 to-red-950/90 hover:from-rose-900 hover:to-red-900 border-rose-500/60 hover:border-rose-400 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse'
                      : 'bg-gradient-to-r from-teal-950/80 to-emerald-950/80 hover:from-teal-900/90 hover:to-emerald-900/90 border-teal-500/50 hover:border-teal-400 text-teal-200 shadow-[0_0_15px_rgba(20,184,166,0.2)]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded-lg ${stats.careerHealth?.hasRSI ? 'bg-rose-500/20 text-rose-400' : 'bg-teal-500/20 text-teal-400'}`}>
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="font-tech font-bold text-xs">运动康复理疗诊所 (Career Health)</span>
                        <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                          stats.careerHealth?.hasRSI
                            ? 'bg-rose-900 text-rose-200 border border-rose-500/40 animate-pulse'
                            : 'bg-teal-900 text-teal-300 border border-teal-400/40'
                        }`}>
                          {stats.careerHealth?.hasRSI ? '急需救治' : '肌腱养护'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                        肌内效贴扎、超声波与深层冲击波理疗，根除腱鞘炎并突破操作锁死上限
                      </div>
                    </div>
                  </div>
                  <span className={`font-code text-[11px] font-extrabold shrink-0 ml-1 ${stats.careerHealth?.hasRSI ? 'text-rose-300' : 'text-teal-400'}`}>
                    专科门诊 &gt;
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Shop Modal: Consumables & Instant Fatigue Refill */}
      <QuickShopModal
        isOpen={showQuickShopModal}
        onClose={() => setShowQuickShopModal(false)}
        playerMoney={stats.money}
        currentFocus={stats.focus ?? 100}
        currentEnergy={stats.energy}
        energyDrinksCount={stats.energyDrinks || 0}
        onBuyConsumable={onBuyConsumable}
        onRest={onRest}
        onOpenRecoveryRoom={onOpenRecoveryRoom}
      />

      {/* Unified System Hub & Macro Settings Modal (全局中枢与系统设置) */}
      {showSystemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0f131c] border-2 border-cyan-500/60 rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col shadow-[0_0_35px_rgba(0,240,255,0.25)]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-tech font-bold text-white text-sm">系统设置与全局中枢</h3>
                  <p className="text-[10px] text-slate-400 font-tech">统一管理音效、界面与宏观辅助系统</p>
                </div>
              </div>
              <button
                onClick={() => setShowSystemModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-3.5 overflow-y-auto space-y-3.5 text-xs">
              {/* Group 1: 基础体验与视口设置 */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-tech font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                  <Sliders className="w-3 h-3" />
                  <span>游戏控制与显示设置</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {/* Sound Toggle */}
                  <button
                    onClick={onToggleSound}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-left cursor-pointer transition flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                      <div>
                        <div className="font-tech font-bold text-white text-[11px]">游戏音效</div>
                        <div className="text-[9px] text-slate-400">{soundEnabled ? '已开启' : '已静音'}</div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-tech font-bold px-1.5 py-0.5 rounded ${soundEnabled ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                      {soundEnabled ? 'ON' : 'OFF'}
                    </span>
                  </button>

                  {/* Phone Frame Toggle */}
                  {onToggleFrame && (
                    <button
                      onClick={onToggleFrame}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-left cursor-pointer transition flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Gamepad2 className="w-4 h-4 text-indigo-400" />
                        <div>
                          <div className="font-tech font-bold text-white text-[11px]">手机框体</div>
                          <div className="text-[9px] text-slate-400">{isPhoneFrame ? '真机框体' : '全宽视口'}</div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-tech font-bold px-1.5 py-0.5 rounded ${isPhoneFrame ? 'bg-indigo-950 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>
                        {isPhoneFrame ? '框体' : '全屏'}
                      </span>
                    </button>
                  )}

                  {/* TapTap Maker Lua Studio */}
                  {onOpenLua && (
                    <button
                      onClick={() => {
                        setShowSystemModal(false);
                        onOpenLua();
                      }}
                      className="col-span-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-left cursor-pointer transition flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-cyan-400" />
                        <div>
                          <div className="font-tech font-bold text-white text-[11px]">TapTap Maker Lua 开发者代码工坊</div>
                          <div className="text-[9px] text-slate-400">查看导出原生 2D Lua 状态机与控制脚本</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-tech font-bold text-cyan-400">打开 &gt;</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Group 2: 全局宏观与生涯扩展系统 */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-tech font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  <span>全局宏观与进阶系统</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {/* Esports Calendar */}
                  {onOpenCalendar && (
                    <button
                      onClick={() => {
                        setShowSystemModal(false);
                        onOpenCalendar();
                      }}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-left cursor-pointer transition"
                    >
                      <div className="flex items-center gap-1.5 text-emerald-400 font-tech font-bold text-[11px]">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>职业赛历时钟</span>
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5">
                        第 {calendarState?.currentWeek || 1} 周 · v{calendarState?.currentPatchVersion || '14.19'}
                      </div>
                    </button>
                  )}

                  {/* Prestige Hall */}
                  {onOpenPrestigeHall && (
                    <button
                      onClick={() => {
                        setShowSystemModal(false);
                        onOpenPrestigeHall();
                      }}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-left cursor-pointer transition"
                    >
                      <div className="flex items-center gap-1.5 text-amber-300 font-tech font-bold text-[11px]">
                        <span>🌀</span>
                        <span>名宿声望殿堂</span>
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5">
                        第 {prestigeState?.generation || 1} 世 · {prestigeState?.prestigePoints || 0} 点声望
                      </div>
                    </button>
                  )}

                  {/* World Tour */}
                  {onOpenWorldTour && (
                    <button
                      onClick={() => {
                        setShowSystemModal(false);
                        onOpenWorldTour();
                      }}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-left cursor-pointer transition"
                    >
                      <div className="flex items-center gap-1.5 text-cyan-300 font-tech font-bold text-[11px]">
                        <Globe className="w-3.5 h-3.5" />
                        <span>无尽世界巡回赛</span>
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5">
                        已通关第 {worldTourState?.currentFloor || 1} 层
                      </div>
                    </button>
                  )}

                  {/* Global Power Rankings */}
                  {onOpenPowerRankings && (
                    <button
                      onClick={() => {
                        setShowSystemModal(false);
                        onOpenPowerRankings();
                      }}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-orange-500/40 text-left cursor-pointer transition"
                    >
                      <div className="flex items-center gap-1.5 text-orange-300 font-tech font-bold text-[11px]">
                        <Trophy className="w-3.5 h-3.5" />
                        <span>全球战队战力榜</span>
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5">
                        查看 TOP20 强队与战术刺探
                      </div>
                    </button>
                  )}

                  {/* Community Relations */}
                  {onOpenCommunityRelations && (
                    <button
                      onClick={() => {
                        setShowSystemModal(false);
                        onOpenCommunityRelations();
                      }}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-pink-500/40 text-left cursor-pointer transition"
                    >
                      <div className="flex items-center gap-1.5 text-pink-300 font-tech font-bold text-[11px]">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>社区公关与直播</span>
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5">
                        粉丝营销与弹幕互动
                      </div>
                    </button>
                  )}

                  {/* Match VOD Library */}
                  {onOpenVodLibrary && (
                    <button
                      onClick={() => {
                        setShowSystemModal(false);
                        onOpenVodLibrary();
                      }}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-left cursor-pointer transition"
                    >
                      <div className="flex items-center gap-1.5 text-cyan-300 font-tech font-bold text-[11px]">
                        <Film className="w-3.5 h-3.5" />
                        <span>赛事录像复盘库</span>
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5">
                        战术沙盘拆解与高光复盘
                      </div>
                    </button>
                  )}

                  {/* Career Journal */}
                  {onOpenCareerJournal && (
                    <button
                      onClick={() => {
                        setShowSystemModal(false);
                        onOpenCareerJournal();
                      }}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-left cursor-pointer transition"
                    >
                      <div className="flex items-center gap-1.5 text-amber-200 font-tech font-bold text-[11px]">
                        <Newspaper className="w-3.5 h-3.5" />
                        <span>生涯纪事号外剪报</span>
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5">
                        权威电竞媒体专访与大事件
                      </div>
                    </button>
                  )}

                  {/* Legacy Lore */}
                  {onOpenLegacyLore && (
                    <button
                      onClick={() => {
                        setShowSystemModal(false);
                        onOpenLegacyLore();
                      }}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-left cursor-pointer transition"
                    >
                      <div className="flex items-center gap-1.5 text-amber-300 font-tech font-bold text-[11px]">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>名人堂编年史</span>
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5">
                        历代名宿传奇与经典战役
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Group 3: 存档与重置管理 */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full py-2 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-950/70 border border-rose-500/40 hover:border-rose-400 text-rose-300 font-tech font-bold text-[11px] flex items-center justify-between cursor-pointer transition"
                >
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                    <span>重置当前生涯进度 (回到网吧少年)</span>
                  </div>
                  <span className="text-[10px] text-rose-400 font-code">&gt;</span>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-800 text-center">
              <button
                onClick={() => setShowSystemModal(false)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-tech font-bold text-xs cursor-pointer transition"
              >
                返回游戏
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Double Confirmation Modal for Career Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0f131c] border-2 border-rose-500/70 rounded-2xl max-w-sm w-full p-4 shadow-[0_0_30px_rgba(244,63,94,0.3)] space-y-3">
            <div className="flex items-center gap-2 text-rose-400 pb-2 border-b border-rose-900/50">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <h4 className="font-tech font-bold text-white text-sm">确认重置生涯进度？</h4>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              此操作将清除您当前的所有比赛战绩、资金储备与已解锁阶段，重新从第一阶段【网吧少年】开始。操作无法撤销！
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-tech font-bold text-xs cursor-pointer transition"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setShowResetConfirm(false);
                  setShowSystemModal(false);
                  onReset();
                }}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-tech font-extrabold text-xs cursor-pointer transition shadow-md shadow-rose-900/50"
              >
                确认重置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
