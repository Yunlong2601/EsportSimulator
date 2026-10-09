import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface VictoryModalProps {
  isOpen: boolean;
  title: string;
  subtitle: string;
  type: 'pro_scout' | 'regional_champ' | 'worlds_champ';
  onContinue: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  title,
  subtitle,
  type,
  onContinue
}) => {
  useEffect(() => {
    if (isOpen) {
      soundEngine.playVictory();
      
      // Fire confetti bursts
      const duration = 2.5 * 1000;
      const end = Date.now() + duration;

      const colors = ['#f59e0b', '#38bdf8', '#818cf8', '#ffffff'];

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative max-w-lg w-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/60 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.35)] text-center chamfer-card">
        {/* Glow halo */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-28 h-28 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="inline-flex p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-4 animate-bounce">
          {type === 'worlds_champ' ? (
            <Trophy className="w-14 h-14" />
          ) : type === 'regional_champ' ? (
            <Award className="w-14 h-14" />
          ) : (
            <ShieldCheck className="w-14 h-14" />
          )}
        </div>

        <div className="inline-block px-3 py-1 mb-2 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 font-tech">
          {type === 'worlds_champ'
            ? '🏆 荣登世界之巅 · 捧起召唤师奖杯'
            : type === 'regional_champ'
            ? '⭐ 赛区总冠军 · 头号种子锁定世界赛'
            : '🌟 职业选手资格解锁 · 登台首发'}
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 font-tech">
          {title}
        </h2>

        <p className="text-slate-300 text-sm sm:text-base mb-6 leading-relaxed">
          {subtitle}
        </p>

        {type === 'worlds_champ' && (
          <div className="bg-slate-800/80 rounded-xl p-4 mb-6 border border-amber-500/30 text-left">
            <div className="flex items-center gap-2 text-amber-400 font-bold font-tech mb-1">
              <Sparkles className="w-4 h-4" /> 永恒传奇不朽丰碑已铸就
            </div>
            <p className="text-xs text-slate-300">
              你的名字将与 Faker、Rookie、Scout 等传奇巨星并列镌刻在召唤师奖杯基座之上！万千电竞粉丝为你欢呼呐喊！
            </p>
          </div>
        )}

        <button
          onClick={() => {
            soundEngine.playClick();
            onContinue();
          }}
          className="w-full py-4 px-6 rounded-xl font-bold font-tech text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer active:scale-98"
        >
          <span>继续荣耀征途</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
