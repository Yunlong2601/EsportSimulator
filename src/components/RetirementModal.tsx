import React from 'react';
import { Building2, DollarSign, Award, Trophy, ArrowRight, Sparkles, Crown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../utils/audio';

interface RetirementModalProps {
  isOpen: boolean;
  money: number;
  onRetireAndBuyOrg: () => void;
  onStayPlaying: () => void;
}

export const RetirementModal: React.FC<RetirementModalProps> = ({
  isOpen,
  money,
  onRetireAndBuyOrg,
  onStayPlaying
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in select-none">
      <div className="relative max-w-md w-full bg-slate-900 border-2 border-amber-500/70 rounded-2xl p-6 shadow-[0_0_60px_rgba(245,158,11,0.3)] text-center chamfer-card">
        {/* Glow halo */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-28 h-28 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="inline-flex p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mb-3 animate-bounce">
          <Crown className="w-12 h-12" />
        </div>

        <div className="inline-block px-3 py-1 mb-2 rounded-full text-[10px] font-bold font-tech uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
          💰 达成 $1,000,000 职业生涯资本里程碑！
        </div>

        <h3 className="text-2xl sm:text-3xl font-extrabold font-tech text-white mb-2 leading-tight">
          退役挂靴 · 全资收购俱乐部开创王朝
        </h3>

        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-4 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-left font-sans">
          作为战队指挥队长，你在职业赛场披荆斩棘，通过赛事奖金、薪水与代言签约积累了 <span className="text-emerald-400 font-bold font-code">${money.toLocaleString()}</span> 巨额财富。
          <br /><br />
          当前顶级联赛豪门席位估值标价为 <span className="text-amber-400 font-bold font-code">$1,000,000</span>。你可以卸下战袍挂靴退役，转型为 <span className="text-white font-bold font-tech">俱乐部幕后老板兼总经理 (GM)</span>，招募世界顶尖五人阵容，向世界赛召唤师奖杯发起终极冲击！
        </p>

        <div className="space-y-2">
          <button
            onClick={() => {
              soundEngine.playCoin();
              soundEngine.playVictory();
              confetti({
                particleCount: 50,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#f59e0b', '#38bdf8', '#10b981']
              });
              onRetireAndBuyOrg();
            }}
            className="w-full py-4 px-5 rounded-xl font-bold font-tech text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 cursor-pointer active:scale-98"
          >
            <Building2 className="w-5 h-5 fill-current" />
            <span>支付 $1,000,000 收购俱乐部并退役 →</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onStayPlaying();
            }}
            className="w-full py-2.5 px-4 rounded-xl font-tech text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700 transition cursor-pointer text-xs"
          >
            暂不退役，继续留在赛场征战
          </button>
        </div>
      </div>
    </div>
  );
};
