import React from 'react';
import { PlayerStats, RankTier } from '../types/game';
import { 
  Battery, 
  Heart, 
  DollarSign, 
  Volume2, 
  VolumeX, 
  Wifi, 
  Sparkles, 
  RotateCcw,
  Smartphone,
  Maximize2,
  FileCode
} from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface MobileStatusBarProps {
  stats: PlayerStats;
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
}

export const MobileStatusBar: React.FC<MobileStatusBarProps> = ({
  stats,
  soundEnabled,
  onToggleSound,
  onReset,
  isPhoneFrame,
  onToggleFrame,
  onOpenLua,
  onOpenLeaderboard,
  onOpenGacha,
  onOpenLifeSim,
  onOpenTactical,
  onOpenSynergy,
  onOpenHardware
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

  return (
    <div className="bg-[#0a0e17]/95 backdrop-blur-md border-b border-cyan-500/20 px-2.5 py-1.5 sticky top-0 z-40 select-none">
      {/* Top Phone Clock & Device Controls */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 font-tech pb-1 border-b border-slate-800/80 mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="font-code font-bold text-slate-200">09:41</span>
          <span className="text-[10px] text-[#00f0ff] font-semibold">TapTap 极速直连</span>
        </div>
        
        {/* Device frame switch & actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenLeaderboard}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-tech text-[#ffd700] bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 cursor-pointer shadow-sm"
            title="查看全球百强榜"
          >
            <span>🏆</span>
            <span className="font-bold">百强榜</span>
          </button>

          <button
            onClick={onOpenLua}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-tech text-[#00f0ff] bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 cursor-pointer"
            title="查看与运行 Lua 引擎脚本"
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

      {/* Portrait Quick Stats Bar */}
      <div className="flex items-center justify-between gap-1.5 text-xs">
        {/* Rank & LP Pill */}
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[11px] font-tech font-bold ${rankColors[stats.rankTier] || rankColors.Gold}`}>
          <span>🏆</span>
          <span>{rankNamesCn[stats.rankTier] || stats.rankTier}</span>
          <span className="font-code text-cyan-300 text-[10px]">{stats.lp} 胜点</span>
        </div>

        {/* Resources in compact pill row */}
        <div className="flex items-center gap-1 text-[11px] font-tech">
          {/* Energy */}
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#0f131c] border border-slate-800" title="精力体能">
            <Battery className="w-3 h-3 text-amber-400" />
            <span className="font-code text-amber-300 font-bold">{stats.energy}%</span>
          </div>

          {/* Mental */}
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#0f131c] border border-slate-800" title="抗压心态">
            <Heart className="w-3 h-3 text-rose-400" />
            <span className="font-code text-rose-300 font-bold">{stats.mental}%</span>
          </div>

          {/* Money */}
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#0f131c] border border-slate-800" title="职业总奖金与资金">
            <span className="text-emerald-400 font-bold font-code">$</span>
            <span className="font-code text-emerald-300 font-bold">{stats.money.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 5 Features Quick Access Mini-Bar */}
      <div className="mt-1.5 pt-1 border-t border-slate-900/80 grid grid-cols-5 gap-1 text-[10px] font-tech">
        <button
          onClick={onOpenGacha}
          className="py-0.5 px-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-[#ffd700] border border-amber-500/30 text-center truncate cursor-pointer"
        >
          ✦ 星探抽卡
        </button>
        <button
          onClick={onOpenLifeSim}
          className="py-0.5 px-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-center truncate cursor-pointer"
        >
          🛋 基地生活
        </button>
        <button
          onClick={onOpenTactical}
          className="py-0.5 px-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-center truncate cursor-pointer"
        >
          ⚔ 决胜终端
        </button>
        <button
          onClick={onOpenSynergy}
          className="py-0.5 px-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-center truncate cursor-pointer"
        >
          ⚡ 选手羁绊
        </button>
        <button
          onClick={onOpenHardware}
          className="py-0.5 px-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-[#00f0ff] border border-cyan-500/30 text-center truncate cursor-pointer"
        >
          ⚙ 神装外设
        </button>
      </div>
    </div>
  );
};
