import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Sparkles, 
  Zap, 
  Flame, 
  Star, 
  Award, 
  TrendingUp, 
  ShieldAlert, 
  X,
  CheckCircle2,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../../utils/audio';
import { PostMatchMvpRecord, LegacyStatBoost } from '../../types/game';

interface MvpCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  mvpRecord?: PostMatchMvpRecord | null;
  onClaimLegacyBoost?: (boost: LegacyStatBoost) => void;
}

export const MvpCelebrationModal: React.FC<MvpCelebrationModalProps> = ({
  isOpen,
  onClose,
  mvpRecord,
  onClaimLegacyBoost
}) => {
  const [boostClaimed, setBoostClaimed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setBoostClaimed(false);
      soundEngine.playBaronSteal();
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#FBBF24', '#FDE68A', '#E11D48']
        });
      } catch {
        // Safe confetti fallback
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Default record fallback if none passed
  const record: PostMatchMvpRecord = mvpRecord || {
    matchType: 'SOLO_QUEUE',
    champName: '暗裔剑魔 (Aatrox)',
    isWin: true,
    isMvp: true,
    isSvp: false,
    score: 9.9,
    kda: '12 / 1 / 7',
    damageShare: '36.8%',
    killParticipation: '78.5%',
    headline: '天神下凡 · 孤胆斩破千军',
    casterQuote: '“他在大龙坑前以一敌四斩获四杀！这就是统治峡谷的绝对核心Carry！”',
    danmaku: '66666！！！这操作简直是教科书级别天神下凡！',
    legacyBoostAwarded: {
      stat: 'mechanics',
      amount: 1,
      statNameCn: '极限微操',
      reason: '关键Carry神勇表现'
    }
  };

  const legacyBoost = record.legacyBoostAwarded || {
    stat: 'mechanics',
    amount: 1,
    statNameCn: '极限微操',
    reason: '关键局极致Carry表现'
  };

  const handleClaim = () => {
    soundEngine.playVictory();
    setBoostClaimed(true);
    if (onClaimLegacyBoost) {
      onClaimLegacyBoost(legacyBoost);
    }
    try {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#F59E0B', '#FBBF24', '#10B981', '#06B6D4']
      });
    } catch {
      // Confetti fallback
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md select-none overflow-y-auto">
        {/* Background Ambient Radial Glow */}
        <div className="absolute inset-0 bg-radial from-amber-500/15 via-transparent to-transparent pointer-events-none" />

        <motion.div
          initial={{ scale: 0.75, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 260 }}
          className="relative max-w-sm sm:max-w-md w-full bg-[#0a0e17] border-2 border-amber-400/80 rounded-3xl p-5 sm:p-6 shadow-[0_0_60px_rgba(245,158,11,0.4)] my-auto space-y-4 overflow-hidden"
        >
          {/* Star-burst Legacy Rotating Rays */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-80 pointer-events-none opacity-30">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 24, ease: 'linear' }}
              className="w-full h-full"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0deg, rgba(245, 158, 11, 0.4) 20deg, transparent 40deg, rgba(245, 158, 11, 0.4) 60deg, transparent 80deg, rgba(245, 158, 11, 0.4) 100deg, transparent 120deg, rgba(245, 158, 11, 0.4) 140deg, transparent 160deg, rgba(245, 158, 11, 0.4) 180deg, transparent 200deg, rgba(245, 158, 11, 0.4) 220deg, transparent 240deg, rgba(245, 158, 11, 0.4) 260deg, transparent 280deg, rgba(245, 158, 11, 0.4) 300deg, transparent 320deg, rgba(245, 158, 11, 0.4) 340deg, transparent 360deg)'
              }}
            />
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer z-20"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Top MVP Crown Title */}
          <div className="text-center relative z-10 pt-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.6)] mb-2"
            >
              <Trophy className="w-8 h-8" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <div className="flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                <span className="text-xs font-tech font-extrabold tracking-widest text-amber-300 uppercase">
                  MATCH MVP HIGHLIGHT
                </span>
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              </div>
              <h2 className="text-2xl font-black font-tech text-white tracking-wide mt-1">
                全场最佳 · 巅峰高光
              </h2>
              <p className="text-xs text-amber-200/90 font-medium mt-0.5">
                {record.headline}
              </p>
            </motion.div>
          </div>

          {/* Card with Gold Shimmer Border */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="relative rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 p-4 border border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.2)] overflow-hidden"
          >
            {/* Shimmer sweep light */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-amber-300/10 to-transparent skew-x-12 pointer-events-none"
            />

            {/* Champion & Rating Row */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-xl shadow-inner">
                  ⚔️
                </div>
                <div>
                  <span className="text-sm font-bold font-tech text-white block">
                    {record.champName}
                  </span>
                  <span className="text-[10px] text-amber-400 font-tech">
                    宿命先锋 · 第一王牌
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-tech text-slate-400 uppercase block">官方评分</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black font-code text-amber-300">
                    {record.score.toFixed(1)}
                  </span>
                  <span className="text-xs text-amber-400 font-bold">/ 10.0</span>
                </div>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 py-3 text-center">
              <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[9px] font-tech text-slate-400 block">对局战绩 (KDA)</span>
                <span className="text-xs font-black font-code text-emerald-400">
                  {record.kda}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[9px] font-tech text-slate-400 block">伤害占比</span>
                <span className="text-xs font-black font-code text-amber-300">
                  {record.damageShare}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[9px] font-tech text-slate-400 block">击杀参团率</span>
                <span className="text-xs font-black font-code text-cyan-300">
                  {record.killParticipation}
                </span>
              </div>
            </div>

            {/* Caster Commentary */}
            <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-[11px] text-amber-100/90 font-sans italic leading-relaxed">
              {record.casterQuote}
            </div>
          </motion.div>

          {/* Permanent Legacy Stat Boost Reward Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45 }}
            className={`p-3.5 rounded-2xl border transition ${
              boostClaimed 
                ? 'bg-emerald-950/40 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                : 'bg-gradient-to-r from-amber-950/40 via-yellow-950/30 to-slate-900 border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-xl ${boostClaimed ? 'bg-emerald-500 text-slate-950' : 'bg-amber-400 text-slate-950'}`}>
                  {boostClaimed ? <CheckCircle2 className="w-4 h-4" /> : <Star className="w-4 h-4 fill-slate-950" />}
                </div>
                <div>
                  <span className="text-xs font-bold font-tech text-white flex items-center gap-1">
                    <span>荣耀传承奖励 (Legacy Boost)</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-code bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      永久常驻
                    </span>
                  </span>
                  <p className="text-[10px] text-slate-300 mt-0.5">
                    极佳 Carry 表现奖赏：<span className="text-amber-300 font-bold">+{legacyBoost.amount} {legacyBoost.statNameCn}</span> 永久属性！
                  </p>
                </div>
              </div>

              {!boostClaimed ? (
                <button
                  onClick={handleClaim}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-tech font-extrabold text-xs shadow-md shadow-amber-400/30 active:scale-95 transition cursor-pointer shrink-0"
                >
                  领取加成
                </button>
              ) : (
                <span className="text-xs font-bold font-tech text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 已注入
                </span>
              )}
            </div>
          </motion.div>

          {/* Action Footer */}
          <div className="pt-1">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-white font-tech font-bold text-xs uppercase transition cursor-pointer"
            >
              收下荣耀 · 继续征程
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
