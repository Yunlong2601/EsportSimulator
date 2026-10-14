import React from 'react';
import { 
  FileText, 
  Sparkles, 
  ShieldAlert, 
  Zap, 
  Brain, 
  Flame, 
  CheckCircle2, 
  TrendingUp, 
  X,
  Target,
  Award,
  DollarSign
} from 'lucide-react';
import { TeamRosterMember, HiddenPotentialStats } from '../../types/game';
import { soundEngine } from '../../utils/audio';

interface ScoutReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: TeamRosterMember | null;
  teamName: string;
  teamLogo?: string;
  onInitiateTransfer?: (player: TeamRosterMember) => void;
}

export const ScoutReportModal: React.FC<ScoutReportModalProps> = ({
  isOpen,
  onClose,
  player,
  teamName,
  teamLogo,
  onInitiateTransfer
}) => {
  if (!isOpen || !player) return null;

  const hidden = player.hiddenPotential || {
    clutchFactor: Math.min(99, Math.round(player.rating * 0.95 + 4)),
    growthCap: Math.min(99, Math.max(90, Math.round(player.rating + 5))),
    tiltResistance: Math.min(99, Math.round(player.rating * 0.92 + 6)),
    championMasteryBonus: Math.min(99, Math.round(player.rating * 0.9 + 8)),
    scoutVerdict: `该选手在大赛关键团战决策极其果断，其成长极限达到 ${Math.min(99, Math.round(player.rating + 5))} 分以上，是构建冠军王朝的基石级战力！`
  };

  const getTierBadge = (rating: number) => {
    if (rating >= 95) return { label: 'SSS 级基石', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/50' };
    if (rating >= 90) return { label: 'SS 级明星', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' };
    return { label: 'S 级主力', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/50' };
  };

  const tier = getTierBadge(hidden.growthCap);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md select-none overflow-y-auto animate-fade-in">
      <div className="relative max-w-md w-full bg-[#0b0f19] border-2 border-cyan-500/70 rounded-2xl p-5 shadow-[0_0_50px_rgba(6,182,212,0.3)] my-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-tech font-extrabold text-white text-base">
                  绝密球探档案 · 潜能评估报告
                </h3>
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-tech font-bold border ${tier.bg}`}>
                  {tier.label}
                </span>
              </div>
              <p className="text-[10px] text-cyan-300 font-sans">
                全球战力情报中心 • 专属深度研判报告 (Deep Scout)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Player Profile Card */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-900/60 to-slate-950 border border-cyan-500/40 flex items-center justify-center text-2xl shadow-inner">
              {teamLogo || '🛡️'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold font-tech text-white">
                  {player.name}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-code bg-slate-800 text-cyan-400 border border-slate-700">
                  {player.role}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-sans block">
                效力战队: <span className="text-slate-200 font-bold">{teamName}</span>
              </span>
              <span className="text-[10px] text-amber-300 font-sans">
                招牌招式: {player.signatureHero}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9px] font-tech text-slate-400 uppercase block">公开实力评分</span>
            <div className="text-2xl font-black font-code text-cyan-300">
              {player.rating} <span className="text-xs text-slate-400 font-normal">OVR</span>
            </div>
          </div>
        </div>

        {/* Unlocked Hidden Potential Stats Radar Grid */}
        <div className="space-y-2">
          <div className="text-xs font-tech font-extrabold text-cyan-400 uppercase flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> 隐秘潜能数据 (Hidden Potential)
            </span>
            <span className="text-[10px] text-emerald-400 font-code font-bold">已破译解密 100%</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Clutch Factor */}
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-tech">
                <span className="text-slate-300 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-rose-400" /> 关键团决胜手
                </span>
                <span className="text-amber-300 font-code font-bold">{hidden.clutchFactor}</span>
              </div>
              <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                  style={{ width: `${hidden.clutchFactor}%` }}
                />
              </div>
              <p className="text-[9px] text-slate-400">大心脏绝境翻盘概率</p>
            </div>

            {/* Growth Cap */}
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-tech">
                <span className="text-slate-300 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-cyan-400" /> 极限成长天花板
                </span>
                <span className="text-cyan-300 font-code font-bold">{hidden.growthCap}</span>
              </div>
              <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                  style={{ width: `${(hidden.growthCap / 100) * 100}%` }}
                />
              </div>
              <p className="text-[9px] text-slate-400">理论最高属性上限</p>
            </div>

            {/* Tilt Resistance */}
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-tech">
                <span className="text-slate-300 flex items-center gap-1">
                  <Brain className="w-3 h-3 text-purple-400" /> 抗压心态抗崩指数
                </span>
                <span className="text-purple-300 font-code font-bold">{hidden.tiltResistance}</span>
              </div>
              <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                  style={{ width: `${hidden.tiltResistance}%` }}
                />
              </div>
              <p className="text-[9px] text-slate-400">连败逆风状态保持</p>
            </div>

            {/* Champion Mastery Bonus */}
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-tech">
                <span className="text-slate-300 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-400" /> 英雄绝活池深度
                </span>
                <span className="text-emerald-300 font-code font-bold">{hidden.championMasteryBonus}</span>
              </div>
              <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                  style={{ width: `${hidden.championMasteryBonus}%` }}
                />
              </div>
              <p className="text-[9px] text-slate-400">BP阶段战术针对耐受性</p>
            </div>
          </div>
        </div>

        {/* Scout Director Verdict */}
        <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/40 text-xs space-y-1">
          <span className="text-[10px] font-tech font-bold text-cyan-300 uppercase flex items-center gap-1">
            <Award className="w-3.5 h-3.5" /> 首席球探总结与建议:
          </span>
          <p className="text-[11px] text-cyan-100/90 leading-relaxed font-sans">
            {hidden.scoutVerdict}
          </p>
        </div>

        {/* Transfer/Buyout Information */}
        {player.buyoutCost && (
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-tech">
            <span className="text-slate-400">预估违约买断金 (Buyout):</span>
            <span className="font-code font-bold text-emerald-400 text-sm">
              ¥{(player.buyoutCost / 10000).toFixed(0)}万
            </span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center gap-2 pt-1">
          {player.isTradeTarget && onInitiateTransfer && (
            <button
              onClick={() => {
                soundEngine.playCoin();
                onInitiateTransfer(player);
                onClose();
              }}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-tech font-extrabold text-xs uppercase flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              <DollarSign className="w-4 h-4" />
              <span>发起转会报价商谈</span>
            </button>
          )}

          <button
            onClick={onClose}
            className={`py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-tech font-bold text-xs uppercase cursor-pointer ${
              player.isTradeTarget && onInitiateTransfer ? 'px-4' : 'w-full'
            }`}
          >
            关闭档案
          </button>
        </div>
      </div>
    </div>
  );
};
