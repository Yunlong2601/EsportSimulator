import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Crown, 
  Sparkles, 
  Flame, 
  Zap, 
  Swords, 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  Star, 
  Award, 
  Activity,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../../utils/audio';
import { PostMatchMvpRecord, LegacyStatBoost, PlayerStats } from '../../types/game';

interface MatchMvpCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  mvpRecord: PostMatchMvpRecord | null;
  champName?: string;
  champAvatar?: string;
  roleName?: string;
  playerStats?: PlayerStats;
  onClaimLegacyBoost?: (boost: LegacyStatBoost) => void;
}

export const MatchMvpCelebrationModal: React.FC<MatchMvpCelebrationModalProps> = ({
  isOpen,
  onClose,
  mvpRecord,
  champName = '阿狸 · 九尾妖狐',
  champAvatar = '🦊',
  roleName = '中单',
  playerStats,
  onClaimLegacyBoost
}) => {
  const [claimed, setClaimed] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setClaimed(false);
      soundEngine.playVictory();
      soundEngine.playLevelUp();

      // Launch dazzling gold and electric blue starburst confetti
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#F59E0B', '#FCD34D', '#00F0FF', '#FFFFFF', '#D946EF']
      });

      const timeout = setTimeout(() => {
        confetti({
          particleCount: 40,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#F59E0B', '#FCD34D', '#00F0FF']
        });
        confetti({
          particleCount: 40,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#F59E0B', '#FCD34D', '#00F0FF']
        });
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!isOpen || !mvpRecord) return null;

  const legacyBoost = mvpRecord.legacyBoostAwarded;
  const currentStatVal = legacyBoost 
    ? (playerStats ? playerStats[legacyBoost.stat] || 85 : 85)
    : 85;
  const nextStatVal = legacyBoost ? currentStatVal + legacyBoost.amount : currentStatVal;
  const totalMvpsCount = (playerStats?.legacyBoosts?.totalMvpsAwarded || 0) + (claimed ? 1 : 0);

  const handleClaim = () => {
    soundEngine.playCoin();
    soundEngine.playLevelUp();
    setClaimed(true);
    if (legacyBoost && onClaimLegacyBoost) {
      onClaimLegacyBoost(legacyBoost);
    }
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md select-none overflow-y-auto">
        {/* ======================================================================= */}
        {/* 1. BACKGROUND 'LEGACY' STAR-BURST EFFECT */}
        {/* ======================================================================= */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          {/* Rotating Multi-Ray Sunburst Wheel */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
            className="w-[600px] h-[600px] sm:w-[850px] sm:h-[850px] opacity-25"
            style={{
              background: `repeating-conic-gradient(
                from 0deg,
                rgba(245, 158, 11, 0.45) 0deg 15deg,
                transparent 15deg 30deg,
                rgba(0, 240, 255, 0.35) 30deg 45deg,
                transparent 45deg 60deg
              )`
            }}
          />

          {/* Central Pulsating Golden Core Glow */}
          <motion.div
            animate={{ 
              scale: [1, 1.25, 1],
              opacity: [0.35, 0.65, 0.35]
            }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-amber-500/30 via-yellow-400/20 to-cyan-500/20 blur-3xl"
          />

          {/* Floating Starburst Sparks */}
          {[
            { top: '20%', left: '15%', delay: 0 },
            { top: '25%', right: '18%', delay: 0.3 },
            { bottom: '25%', left: '20%', delay: 0.6 },
            { bottom: '20%', right: '15%', delay: 0.9 },
            { top: '10%', left: '50%', delay: 1.2 }
          ].map((s, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1.4, 0],
                opacity: [0, 0.9, 0],
                rotate: [0, 90, 180]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2.2, 
                delay: s.delay,
                ease: 'easeInOut' 
              }}
              style={{ position: 'absolute', top: s.top, left: s.left, right: s.right, bottom: s.bottom }}
              className="text-amber-300 text-xl filter drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]"
            >
              ✦
            </motion.div>
          ))}
        </div>

        {/* ======================================================================= */}
        {/* 2. FRAMER MOTION MVP CARD WITH GOLD-SHIMMER BORDER */}
        {/* ======================================================================= */}
        <motion.div
          initial={{ scale: 0.75, y: 35, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.8, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="relative max-w-md w-full rounded-2xl p-[2.5px] shadow-[0_0_50px_rgba(245,158,11,0.45)] chamfer-card my-auto z-10"
          style={{
            // Animated Gold-Shimmer Border travelling gradient
            backgroundImage: `linear-gradient(90deg, #d97706, #fbbf24, #fef08a, #00f0ff, #fbbf24, #d97706)`,
            backgroundSize: '250% 100%'
          }}
        >
          {/* Inner Card Container */}
          <div className="bg-[#090d16] rounded-2xl p-4 sm:p-5 text-center relative overflow-hidden space-y-3.5 border border-slate-800/90">
            {/* Top Light Sweep Reflection Effect */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
              className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/8 to-transparent pointer-events-none transform -skew-x-25"
            />

            {/* Header: MVP Crown & Star Badge */}
            <div className="relative pt-1">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.15, stiffness: 350, damping: 15 }}
                className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-amber-400/25 via-yellow-500/15 to-slate-900 border border-amber-400/60 text-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.5)] mb-2"
              >
                <Crown className="w-9 h-9 animate-pulse" />
              </motion.div>

              <div className="flex items-center justify-center gap-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-tech font-extrabold uppercase tracking-widest bg-gradient-to-r from-amber-500/30 via-yellow-400/30 to-amber-500/30 text-amber-300 border border-amber-400/60 shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300 animate-spin" />
                  <span>MATCH MVP 全场最有价值选手</span>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black font-tech text-white tracking-wide mt-1.5">
                {mvpRecord.headline}
              </h2>
            </div>

            {/* Champion & Rating Banner */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-left">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-slate-950 border border-amber-400/50 flex items-center justify-center text-2xl shadow-md shrink-0">
                  {champAvatar}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-tech font-bold text-white text-sm">{champName}</span>
                    <span className="px-1 py-0.2 rounded text-[8px] font-code font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {roleName}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                    掌控全场击杀节奏 · 统治级 Carry
                  </div>
                </div>
              </div>

              {/* MVP Score */}
              <div className="text-right pl-2">
                <div className="text-[9px] font-tech text-slate-400">综合战力评定</div>
                <div className="text-xl font-black font-code text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
                  ★ {mvpRecord.score.toFixed(1)} 分
                </div>
              </div>
            </div>

            {/* Performance Stats Quad Grid */}
            <div className="grid grid-cols-4 gap-1.5 text-center">
              <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[9px] font-tech text-slate-400 block">战局 KDA</span>
                <span className="text-xs font-black font-code text-amber-300 block mt-0.5 truncate">
                  {mvpRecord.kda}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[9px] font-tech text-slate-400 block">伤害占比</span>
                <span className="text-xs font-black font-code text-rose-400 block mt-0.5">
                  {mvpRecord.damageShare}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[9px] font-tech text-slate-400 block">击杀贡献率</span>
                <span className="text-xs font-black font-code text-cyan-400 block mt-0.5">
                  {mvpRecord.killParticipation}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[9px] font-tech text-slate-400 block">对局胜负</span>
                <span className="text-xs font-black font-tech text-emerald-400 block mt-0.5">
                  {mvpRecord.isWin ? 'VICTORY 胜' : 'DEFEAT 败'}
                </span>
              </div>
            </div>

            {/* Official Caster Quote & Danmaku Stream Bubble */}
            {mvpRecord.casterQuote && (
              <div className="p-2.5 rounded-xl bg-cyan-950/25 border border-cyan-500/30 text-left space-y-1">
                <div className="text-[10px] text-cyan-300 font-sans italic leading-relaxed">
                  🎙️ {mvpRecord.casterQuote}
                </div>
                {mvpRecord.danmaku && (
                  <div className="text-[9px] text-amber-300/90 font-code pt-0.5 border-t border-cyan-500/20 truncate">
                    💬 {mvpRecord.danmaku}
                  </div>
                )}
              </div>
            )}

            {/* ======================================================================= */}
            {/* 3. PERMANENT 'LEGACY' STAT BOOST AWARD PANEL */}
            {/* ======================================================================= */}
            {legacyBoost ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.35, type: 'spring', damping: 20 }}
                className="p-3 rounded-xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/40 border-2 border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.3)] text-left relative overflow-hidden"
              >
                {/* Background Starburst Stamp */}
                <div className="absolute -right-2 -bottom-3 text-5xl opacity-15 pointer-events-none text-amber-400">
                  ★
                </div>

                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-tech font-black text-amber-300">
                    <Star className="w-4 h-4 text-amber-400 fill-current animate-spin" />
                    <span>👑 获得永久传承属性 (Legacy Stat Boost)！</span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-tech font-extrabold bg-amber-500 text-slate-950 uppercase shadow-sm">
                    永久生效
                  </span>
                </div>

                <p className="text-[10px] text-slate-300 font-sans leading-snug mb-2">
                  因打出天神下凡级卓越统治表现：<span className="text-amber-300 font-tech font-bold">{legacyBoost.reason}</span>！
                </p>

                {/* Stat Boost Comparison Bar */}
                <div className="p-2 rounded-lg bg-slate-950/90 border border-amber-500/50 flex items-center justify-between text-xs font-tech">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{legacyBoost.statNameCn}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-code font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      +{legacyBoost.amount} 点
                    </span>
                  </div>

                  <div className="font-code font-bold flex items-center gap-1.5">
                    <span className="text-slate-400">{currentStatVal}</span>
                    <ArrowRight className="w-3 h-3 text-amber-400" />
                    <span className="text-emerald-400 text-sm font-black">{nextStatVal}</span>
                    <span className="text-[9px] text-emerald-400 font-sans">↑ UP</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[9px] text-slate-400 font-tech mt-1.5">
                  <span>传承印记：无惧轮回，永久镌刻至选手基因</span>
                  <span className="text-amber-400 font-code">已斩获 {totalMvpsCount} 次传承</span>
                </div>
              </motion.div>
            ) : (
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 font-tech flex items-center justify-between">
                <span>选手特质「自信心」保持火热状态</span>
                <span className="text-emerald-400 font-bold">手感巅峰 ✓</span>
              </div>
            )}

            {/* CTA Button */}
            <div className="pt-1">
              <button
                onClick={handleClaim}
                className="w-full py-3 px-4 rounded-xl font-tech font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 cursor-pointer active:scale-98 chamfer-btn"
              >
                <Trophy className="w-4 h-4 fill-current shrink-0" />
                <span>
                  {legacyBoost 
                    ? `领取 MVP 传承属性 (+${legacyBoost.amount}) 并完成结算 →`
                    : '领取 MVP 荣耀并确认战报 →'}
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
