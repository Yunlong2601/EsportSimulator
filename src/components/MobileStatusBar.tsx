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
  Newspaper
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
              title="已佩戴专属至尊称号 (点击管理)"
            >
              <span>👑</span>
              <span className="truncate max-w-[90px]">{activeTitle}</span>
            </button>
          )}

          {/* Prestige Generation / 声望殿堂入口 */}
          <button
            onClick={() => onOpenPrestigeHall && onOpenPrestigeHall()}
            className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-tech font-extrabold flex items-center gap-1 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.2)] hover:border-amber-400 transition cursor-pointer"
            title="名宿声望殿堂 (点击进入轮回转生、天赋树加点与词条挑战)"
          >
            <span>🌀</span>
            <span className="hidden xs:inline">第</span><span>{prestigeState?.generation || 1}</span><span className="hidden xs:inline">世</span>
            <span className="font-code text-amber-400">{prestigeState?.prestigePoints || 0}P</span>
          </button>

          {/* World Tour / 无尽世界巡回赛入口 */}
          <button
            onClick={() => onOpenWorldTour && onOpenWorldTour()}
            className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-tech font-extrabold flex items-center gap-1 shrink-0 shadow-[0_0_8px_rgba(6,182,212,0.2)] hover:border-cyan-400 transition cursor-pointer"
            title="无尽世界巡回赛 (跨赛区百层天梯挑战)"
          >
            <Globe className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
            <span>{worldTourState?.currentFloor || 1}层</span>
          </button>

          {/* Esports Calendar / 真实职业赛历时钟入口 */}
          <button
            onClick={() => onOpenCalendar && onOpenCalendar()}
            className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-tech font-extrabold flex items-center gap-1 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.2)] hover:border-emerald-400 transition cursor-pointer"
            title="真实职业赛历与大事件引擎 (点击查看26周赛程、版本补丁与环境词条)"
          >
            <Calendar className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
            <span>W{calendarState?.currentWeek || 1}</span>
            <span className="text-[9px] text-emerald-400/80">v{calendarState?.currentPatchVersion || '14.19'}</span>
          </button>

          {/* Global Power Rankings / 全球战队实力榜入口 */}
          <button
            onClick={() => onOpenPowerRankings && onOpenPowerRankings()}
            className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-tech font-extrabold flex items-center gap-1 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.2)] hover:border-amber-400 transition cursor-pointer"
            title="全球战队战力榜 (查看TOP20全球战队实力排位、战术破绽刺探与引援转会雷达)"
          >
            <Trophy className="w-2.5 h-2.5 text-amber-400 shrink-0" />
            <span>TOP20战力</span>
          </button>

          {/* Community Relations / 社区公关与直播弹幕入口 */}
          <button
            onClick={() => onOpenCommunityRelations && onOpenCommunityRelations()}
            className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-500/40 text-pink-300 text-[10px] font-tech font-extrabold flex items-center gap-1 shrink-0 shadow-[0_0_8px_rgba(244,114,182,0.2)] hover:border-pink-400 transition cursor-pointer"
            title="社区公关与直播弹幕 (营销活动、粉丝运营、提升赞助商倍率与观赛互动)"
          >
            <MessageSquare className="w-2.5 h-2.5 text-pink-400 shrink-0" />
            <span>社区公关</span>
          </button>

          {/* Match VOD Library / 录像复盘库入口 */}
          {onOpenVodLibrary && (
            <button
              onClick={onOpenVodLibrary}
              className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-tech font-extrabold flex items-center gap-1 shrink-0 shadow-[0_0_8px_rgba(6,182,212,0.2)] hover:border-cyan-400 transition cursor-pointer"
              title="赛事录像与团战高光复盘库 (动态战术沙盘、团战决策拆解与战术洞察加成)"
            >
              <Film className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
              <span>录像复盘</span>
            </button>
          )}

          {/* Legacy Lore / 电竞编年史入口 */}
          {onOpenLegacyLore && (
            <button
              onClick={onOpenLegacyLore}
              className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-tech font-extrabold flex items-center gap-1 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.2)] hover:border-amber-400 transition cursor-pointer"
              title="电竞名人堂历史宿怨与战局编年史 (查看历代名宿里程碑与经典决战)"
            >
              <BookOpen className="w-2.5 h-2.5 text-amber-400 shrink-0" />
              <span>名人堂编年史</span>
            </button>
          )}

          {/* Career Journal / 复古号外剪报入口 */}
          {onOpenCareerJournal && (
            <button
              onClick={onOpenCareerJournal}
              className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-stone-800 to-amber-950/70 border border-amber-600/40 text-amber-200 text-[10px] font-tech font-extrabold flex items-center gap-1 shrink-0 shadow-[0_0_8px_rgba(217,119,6,0.2)] hover:border-amber-400 transition cursor-pointer"
              title="生涯纪事周报 (查看各大权威电竞媒体号外剪报与历史大事件)"
            >
              <Newspaper className="w-2.5 h-2.5 text-amber-400 shrink-0" />
              <span>纪事报</span>
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

          {/* Focus / 专注度 & 疲劳监控 (带高能消耗流体过渡与重影消退动画) */}
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
            title="专注度 / 疲劳度监控 (点击开启休整 Rest 与特调咖啡 Coffee 抉择面板)"
          >
            {/* Transient Floating Drain Delta Indicator */}
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

            {/* Fluid Dual-Layer Fatigue/Focus Progress Bar (Visible on mobile & desktop) */}
            <div className="w-8 xs:w-11 sm:w-14 h-1.5 rounded-full bg-slate-950 border border-slate-700/60 overflow-hidden relative shadow-inner shrink-0">
              {/* Delayed Ghost Trail Bar (Visualizes the exact chunk depleted in rose/amber) */}
              <div
                className="absolute inset-y-0 left-0 bg-rose-400/40 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${ghostFocus}%` }}
              />

              {/* Primary Active Fill with smooth fluid cubic-bezier transition */}
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
                {/* Subtle moving light shimmer */}
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

          {/* Quick Shop / 战备应急便利店 */}
          <button
            onClick={() => setShowQuickShopModal(true)}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-gradient-to-r from-emerald-950/70 to-teal-950/70 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 hover:text-emerald-200 transition cursor-pointer text-[10px] font-tech font-bold shadow-[0_0_8px_rgba(16,185,129,0.2)]"
            title="战备便利店 (Quick Shop) · 选购高能能量弹与特调咖啡即时秒回疲劳"
          >
            <Store className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="hidden xs:inline">补给站</span>
          </button>

          {/* Career Health / 手腕肌腱负荷与RSI理疗监控 */}
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
            title="手腕肌腱负荷与职业健康 (点击前往电竞康复理疗诊所)"
          >
            <Stethoscope className={`w-3 h-3 shrink-0 ${stats.careerHealth?.hasRSI ? 'text-rose-400' : 'text-teal-400'}`} />
            <span className="hidden xs:inline">肌腱</span>
            <span className="font-code">
              {stats.careerHealth?.hasRSI ? `RSI(${stats.careerHealth.maxMechanics}限)` : `${stats.careerHealth?.strain || 0}%`}
            </span>
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
              title="战备应急便利店 (Quick Shop) · 即刻选购能量弹秒回疲劳"
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

      {/* 3. Game Logic Best Practice: Contextual Sub-Nav Quickdock */}
      <div className="mt-1.5 pt-1 border-t border-slate-900/80 grid grid-cols-4 gap-1.5 text-[10px] font-tech">
        {/* PHASE 1 CONTEXT: Solo Queue & Amateur Career Tools */}
        {currentPhase === 1 && (
          <>
            <button
              onClick={onOpenHardware}
              className="py-1 px-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-[#00f0ff] border border-cyan-500/30 text-center truncate cursor-pointer transition flex items-center justify-center gap-1"
              title="极客神装外设工坊与超频调校"
            >
              <ShoppingBag className="w-3 h-3 text-cyan-400" />
              <span>神装外设</span>
            </button>

            <button
              onClick={() => onOpenReflexDuel && onOpenReflexDuel()}
              className="py-1 px-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-center truncate cursor-pointer transition flex items-center justify-center gap-1"
              title="1v1 极限微操反应对决"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>1v1微操</span>
            </button>

            <button
              onClick={() => onOpenSocialFeed && onOpenSocialFeed()}
              className="py-1 px-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-center truncate cursor-pointer transition flex items-center justify-center gap-1"
              title="电竞玩家社区动态圈"
            >
              <MessageSquare className="w-3 h-3 text-indigo-400" />
              <span>社区动态</span>
            </button>

            <button
              onClick={onOpenGacha}
              className="py-1 px-1 rounded bg-slate-900/60 text-slate-500 border border-slate-800 hover:border-amber-500/40 text-center truncate cursor-pointer transition flex items-center justify-center gap-1"
              title="全球星探 · SSS 神将抽卡 (仅传奇豪门阶段解锁)"
            >
              <Lock className="w-3 h-3 text-amber-500/70" />
              <span>星探(豪门)</span>
            </button>
          </>
        )}

        {/* PHASE 2 CONTEXT: Stage Match Day & Captain Tools */}
        {currentPhase === 2 && (
          <>
            <button
              onClick={onOpenTactical}
              className="py-1 px-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-center truncate cursor-pointer transition flex items-center justify-center gap-1"
              title="决胜时刻 · 战术决策终端 (大龙生死拼惩戒、教练暂停)"
            >
              <Crosshair className="w-3 h-3 text-red-400" />
              <span>决胜战术</span>
            </button>

            <button
              onClick={onOpenSynergy}
              className="py-1 px-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-center truncate cursor-pointer transition flex items-center justify-center gap-1"
              title="战队羁绊 · 选手默契网络"
            >
              <Network className="w-3 h-3 text-indigo-400" />
              <span>战队羁绊</span>
            </button>

            <button
              onClick={onOpenLifeSim}
              className="py-1 px-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-center truncate cursor-pointer transition flex items-center justify-center gap-1"
              title="基地生活模拟 · 赛后复盘与理疗"
            >
              <Home className="w-3 h-3 text-emerald-400" />
              <span>基地复盘</span>
            </button>

            <button
              onClick={() => onOpenPatchNotes && onOpenPatchNotes()}
              className="py-1 px-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-[#ffd700] border border-amber-500/30 text-center truncate cursor-pointer transition flex items-center justify-center gap-1"
              title="官方赛事版本更新改动"
            >
              <Flame className="w-3 h-3 text-amber-400" />
              <span>版本补丁</span>
            </button>
          </>
        )}

        {/* PHASE 3 CONTEXT: Organization Tycoon & Worlds Quest Tools */}
        {currentPhase === 3 && (
          <>
            <button
              onClick={onOpenGacha}
              className="py-1 px-1 rounded bg-amber-500/15 hover:bg-amber-500/25 text-[#ffd700] border border-amber-400/50 text-center truncate cursor-pointer transition flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(255,215,0,0.2)]"
              title="全球星探 · S14 极光限定 pool (招募 SSS 级 VORTEX)"
            >
              <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
              <span className="font-bold">星探抽卡</span>
            </button>

            <button
              onClick={onOpenLifeSim}
              className="py-1 px-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-center truncate cursor-pointer transition flex items-center justify-center gap-1"
              title="俱乐部基地运营管理与生活调度"
            >
              <Home className="w-3 h-3 text-emerald-400" />
              <span>基地生活</span>
            </button>

            <button
              onClick={onOpenSynergy}
              className="py-1 px-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-[#00f0ff] border border-cyan-500/30 text-center truncate cursor-pointer transition flex items-center justify-center gap-1"
              title="全队选手同调共鸣网络"
            >
              <Network className="w-3 h-3 text-cyan-400" />
              <span>战队羁绊</span>
            </button>

            <button
              onClick={() => onOpenTrophies && onOpenTrophies()}
              className="py-1 px-1 rounded bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-center truncate cursor-pointer transition flex items-center justify-center gap-1"
              title="召唤师奖杯与冠军荣誉展厅"
            >
              <Trophy className="w-3 h-3 text-yellow-400" />
              <span>荣誉展厅</span>
            </button>
          </>
        )}
      </div>

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
    </div>
  );
};
