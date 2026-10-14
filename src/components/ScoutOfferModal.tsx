import React from 'react';
import { Mail, CheckCircle, ArrowRight, ShieldAlert } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface ScoutOfferModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const ScoutOfferModal: React.FC<ScoutOfferModalProps> = ({
  isOpen,
  onAccept,
  onDecline
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div className="relative max-w-lg w-full bg-slate-900 border-2 border-cyan-500/50 rounded-2xl p-6 sm:p-8 shadow-[0_0_60px_rgba(6,182,212,0.25)] text-left chamfer-card">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Mail className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider font-tech text-cyan-400 font-bold">
              职业电竞俱乐部 · 官方星探试训函
            </div>
            <h3 className="text-2xl font-bold font-tech text-white">
              正式签约邀约：一队首发中单兼赛场指挥队长
            </h3>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-cyan-500/20 rounded-xl p-4 mb-5 text-sm text-slate-300 font-sans space-y-3">
          <p className="leading-relaxed">
            <span className="text-cyan-400 font-semibold font-tech">“致 天才选手：</span> 我们战队总教练组与大数据分析分部一直在全程追踪你在峡谷千分王者的冲榜历程。你的极限反应手速和大局观决策是世界顶级的。”
          </p>
          <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/40 space-y-1 text-xs">
            <div className="flex items-center justify-between text-slate-200">
              <span className="text-slate-400">战队位置:</span>
              <span className="font-semibold text-white">一队首发中单 / 核心指挥</span>
            </div>
            <div className="flex items-center justify-between text-slate-200">
              <span className="text-slate-400">首发薪酬待遇:</span>
              <span className="font-semibold text-emerald-400">$15,000 / 月 + 独栋基地食宿全包</span>
            </div>
            <div className="flex items-center justify-between text-slate-200">
              <span className="text-slate-400">赛季目标:</span>
              <span className="font-semibold text-amber-400">杀入赛区总决赛并争夺世界赛门票</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 italic">
            *签署合同后将立即解锁第二阶段：登台指挥选边BP（Ban/Pick）并带领队伍在聚光灯下征战职业联赛。
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              soundEngine.playClick();
              onAccept();
            }}
            className="flex-1 py-3 px-5 rounded-xl font-bold font-tech text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 cursor-pointer active:scale-98"
          >
            <span>签署职业合约 · 晋升职业赛场</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onDecline();
            }}
            className="py-3 px-4 rounded-xl font-tech text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 transition cursor-pointer text-sm"
          >
            暂缓考虑（继续单排冲分）
          </button>
        </div>
      </div>
    </div>
  );
};
