import React from 'react';
import { Lock, ArrowRight, X, Trophy, DollarSign, ShieldAlert } from 'lucide-react';
import { GamePhase } from '../types/game';
import { soundEngine } from '../utils/audio';

interface PhaseLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  lockedPhase: GamePhase;
  currentLp: number;
  currentMoney: number;
}

export const PhaseLockModal: React.FC<PhaseLockModalProps> = ({
  isOpen,
  onClose,
  lockedPhase,
  currentLp,
  currentMoney
}) => {
  if (!isOpen) return null;

  const isPhase2 = lockedPhase === 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative max-w-sm w-full bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl text-center chamfer-card">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="inline-flex p-3 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 mb-3">
          <Lock className="w-8 h-8" />
        </div>

        <h4 className="font-tech font-extrabold text-white text-lg mb-1">
          {isPhase2 ? '赛场BP队长 · 尚未解锁' : '俱乐部王朝经营 · 尚未解锁'}
        </h4>

        {isPhase2 ? (
          <div className="space-y-3 text-xs text-slate-300 font-sans text-left bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <p>
              要解锁 <span className="text-cyan-400 font-bold font-tech">第二阶段：赛场BP与战队队长</span>，你必须在峡谷单双排中证明统治力，冲上最高段位：
            </p>
            <div className="flex items-center justify-between font-code text-xs p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400">解锁条件:</span>
              <span className="text-amber-400 font-bold">最强王者 1,000 LP</span>
            </div>
            <div className="flex items-center justify-between font-code text-xs p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400">当前胜点:</span>
              <span className="text-cyan-300 font-bold">{currentLp} LP</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div
                className="bg-cyan-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (currentLp / 1000) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 italic">
              *胜点达到1,000 LP时，将立即触发豪门星探邀请函，签约登台担任首发队长！
            </p>
          </div>
        ) : (
          <div className="space-y-3 text-xs text-slate-300 font-sans text-left bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <p>
              要解锁 <span className="text-amber-400 font-bold font-tech">第三阶段：俱乐部王朝时代</span>，你需要在职业赛场积累足够的资本财富，退役并全资收购俱乐部：
            </p>
            <div className="flex items-center justify-between font-code text-xs p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400">解锁条件:</span>
              <span className="text-amber-400 font-bold">$1,000,000 职业生涯战备金</span>
            </div>
            <div className="flex items-center justify-between font-code text-xs p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400">当前累计资金:</span>
              <span className="text-emerald-400 font-bold">${currentMoney.toLocaleString()}</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (currentMoney / 1000000) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 italic">
              *在第二阶段赢下联赛对局与季后赛系列赛，即可斩获数十万赛事奖金冲刺百万目标！
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-tech font-bold text-xs uppercase cursor-pointer"
        >
          明确目标，返回冲分
        </button>
      </div>
    </div>
  );
};
