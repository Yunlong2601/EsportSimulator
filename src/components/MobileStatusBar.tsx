import React from 'react';
import { PlayerStats, RankTier, GamePhase } from '../types/game';
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
  Gamepad2
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
}

export const MobileStatusBar: React.FC<MobileStatusBarProps> = ({
  stats,
  currentPhase,
  isDynastyUnlocked,
  soundEnabled,
  onToggleSound,
  onReset,
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
  onOpenMilestones
}) => {
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
      {/* 1. Global Utility Header Bar */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 font-tech pb-1.5 border-b border-slate-800/80 mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="font-code font-bold text-slate-200">09:41</span>
          <span className="text-[10px] text-[#00f0ff] font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
            TapTap 极速直连
          </span>
        </div>
        
        {/* Global Action Tools */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenLua}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-tech text-[#00f0ff] bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 cursor-pointer transition active:scale-95"
            title="查看与运行 TapTap Make Lua 引擎脚本"
          >
            <FileCode className="w-3 h-3 text-cyan-400" />
            <span>Lua 脚本</span>
          </button>

          <button
            onClick={onToggleSound}
            className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-900 cursor-pointer transition"
            title={soundEnabled ? '静音' : '开启音效'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-600" />}
          </button>

          <button
            onClick={onReset}
            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-900 cursor-pointer transition"
            title="重置生涯"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

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
        </div>
      </div>

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
    </div>
  );
};
