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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
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
            ? '🏆 SUMMONER’S CUP CHAMPION'
            : type === 'regional_champ'
            ? '⭐ WORLDS QUALIFIED'
            : '🌟 PRO STATUS UNLOCKED'}
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
              <Sparkles className="w-4 h-4" /> DYNASTY LEGACY SECURED
            </div>
            <p className="text-xs text-slate-300">
              Your name is forever carved into the base of the Summoner’s Cup alongside Faker, Rookie, and ShowMaker. All stadium fans chant your team name!
            </p>
          </div>
        )}

        <button
          onClick={() => {
            soundEngine.playClick();
            onContinue();
          }}
          className="w-full py-3.5 px-6 rounded-xl font-bold font-tech tracking-wide uppercase transition-all duration-200 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/30 active:scale-98 cursor-pointer"
        >
          <span>Continue Journey</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
