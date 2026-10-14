import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Award,
  Crown,
  Sparkles,
  Lock,
  CheckCircle2,
  Zap,
  Flame,
  Shield,
  Eye,
  RotateCw,
  X,
  ChevronRight,
  TrendingUp,
  Diamond
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ChampionshipRing, DynastyState } from '../../types/game';
import { CHAMPIONSHIP_RINGS_CONFIG, getDefaultUnlockedRings } from '../../data/championshipRingsData';
import { soundEngine } from '../../utils/audio';

export interface TrophyHallShowcaseProps {
  dynasty: DynastyState;
  onUpdateDynasty?: (updated: DynastyState) => void;
  onClose?: () => void;
}

export const TrophyHallShowcase: React.FC<TrophyHallShowcaseProps> = ({
  dynasty,
  onUpdateDynasty,
  onClose
}) => {
  const championshipsWon = dynasty.worldChampionshipsWon ?? 1;
  const unlockedRingIds = dynasty.unlockedRings ?? getDefaultUnlockedRings(championshipsWon);
  const equippedRingId = dynasty.equippedRingId ?? (unlockedRingIds[0] || 'ring_s10_origin');

  const [inspectingRing, setInspectingRing] = useState<ChampionshipRing | null>(null);
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const equippedRing = CHAMPIONSHIP_RINGS_CONFIG.find(r => r.id === equippedRingId) || CHAMPIONSHIP_RINGS_CONFIG[0];

  const handleEquipRing = (ring: ChampionshipRing, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundEngine.playLevelUp();
    if (onUpdateDynasty) {
      onUpdateDynasty({
        ...dynasty,
        equippedRingId: ring.id
      });
    }
    showToast(`👑 已成功佩戴加冕【${ring.name}】！战队获得全额荣誉光环加成。`);
  };

  const handleSimulateCrowning = () => {
    soundEngine.playVictory();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Find next locked ring to unlock
    const nextLocked = CHAMPIONSHIP_RINGS_CONFIG.find(r => !unlockedRingIds.includes(r.id));
    const newUnlocked = nextLocked 
      ? [...unlockedRingIds, nextLocked.id]
      : CHAMPIONSHIP_RINGS_CONFIG.map(r => r.id);

    const newWon = Math.min(CHAMPIONSHIP_RINGS_CONFIG.length, (dynasty.worldChampionshipsWon ?? 1) + 1);

    if (onUpdateDynasty) {
      onUpdateDynasty({
        ...dynasty,
        worldChampionshipsWon: newWon,
        unlockedRings: newUnlocked,
        equippedRingId: nextLocked ? nextLocked.id : equippedRingId
      });
    }

    if (nextLocked) {
      setInspectingRing(nextLocked);
      showToast(`🏆 全球总决赛夺冠加冕！恭喜解锁至尊冠军戒指【${nextLocked.name}】！`);
    } else {
      showToast(`🏆 巅峰大满贯巡礼！战队全套 6 枚历史至尊冠军戒指已全部加冕登顶！`);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-amber-500/90 text-slate-950 font-bold font-tech shadow-[0_0_30px_rgba(245,158,11,0.6)] flex items-center gap-2 text-xs"
          >
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hall Hero Header */}
      <div className="relative rounded-2xl bg-gradient-to-br from-slate-950 via-[#0a0f1d] to-[#120a1f] border-2 border-amber-500/40 p-4 sm:p-5 overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.15)]">
        {/* Ambient Glow & Holographic Grid */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/10 to-purple-600/10 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center text-amber-400">
                  <Crown className="w-5 h-5 animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-tech font-extrabold text-white text-base sm:text-lg tracking-wide flex items-center gap-1.5">
                    3D 荣誉殿堂 · 世界赛至尊冠军戒展
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 uppercase tracking-widest shadow-sm">
                    Trophy Hall 3D
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  展示俱乐部征战历届全球总决赛解锁的传奇钻戒。3D立体的精雕戒身、传世铭文与专属战队王朝加成。
                </p>
              </div>
            </div>

            {/* Quick Stat Tags */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-tech">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>总冠军戒指: <strong className="font-code text-white">{unlockedRingIds.length}</strong> / {CHAMPIONSHIP_RINGS_CONFIG.length}</span>
              </span>

              <span className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 flex items-center gap-1.5">
                <Diamond className="w-3.5 h-3.5 text-cyan-400" />
                <span>主战展示戒: <strong className="text-white">{equippedRing.name}</strong></span>
              </span>

              <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/40 text-purple-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                <span>王朝决胜加成: <strong className="text-emerald-400 font-code">+{equippedRing.statsBuff.clutchRateBonus}%</strong> 逆风胜率</span>
              </span>
            </div>
          </div>

          {/* Action Button: Simulate Crowning Ceremony */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={handleSimulateCrowning}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-tech font-extrabold text-xs shadow-[0_0_25px_rgba(245,158,11,0.4)] flex items-center justify-center gap-1.5 transition transform active:scale-95 cursor-pointer"
            >
              <Crown className="w-4 h-4 text-slate-950" />
              <span>加冕夺冠新戒指 (Crowning Ceremony)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3D Showcase Grid with Framer Motion 3D Perspective */}
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
        style={{ perspective: 1200 }}
      >
        {CHAMPIONSHIP_RINGS_CONFIG.map((ring, idx) => {
          const isUnlocked = unlockedRingIds.includes(ring.id);
          const isEquipped = equippedRingId === ring.id;

          return (
            <motion.div
              key={ring.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              whileHover={isUnlocked ? {
                scale: 1.04,
                rotateY: 10,
                rotateX: -6,
                z: 30,
                transition: { type: 'spring', stiffness: 260, damping: 20 }
              } : { scale: 1.01 }}
              onClick={() => {
                soundEngine.playClick();
                setInspectingRing(ring);
              }}
              className={`relative rounded-2xl p-4 transition-all cursor-pointer flex flex-col justify-between overflow-hidden group select-none border-2 ${
                isUnlocked
                  ? isEquipped
                    ? 'bg-gradient-to-b from-[#141b2d] to-[#0b101c] border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.3)]'
                    : 'bg-gradient-to-b from-[#0f1422] to-[#090d17] border-slate-700/80 hover:border-cyan-400/80 hover:shadow-[0_0_30px_rgba(0,240,255,0.25)]'
                  : 'bg-slate-950/80 border-slate-800/60 opacity-60 grayscale-[40%]'
              }`}
              style={{
                transformStyle: 'preserve-3d',
                boxShadow: isUnlocked ? ring.ring3dStyle.shadowGlow : 'none'
              }}
            >
              {/* Top Card Bar: Season & Rarity Badge */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black font-code bg-slate-900 border border-slate-700 text-amber-300">
                    {ring.season}
                  </span>
                  <span className="text-[10px] text-slate-400 font-code font-bold">
                    {ring.year} 荣耀
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {isEquipped && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-slate-950 flex items-center gap-1 shadow-sm">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      当前佩戴
                    </span>
                  )}
                  <span 
                    className="text-[9px] font-tech font-black px-1.5 py-0.5 rounded uppercase"
                    style={{
                      backgroundColor: `${ring.primaryColor}20`,
                      color: ring.primaryColor,
                      border: `1px solid ${ring.primaryColor}50`
                    }}
                  >
                    {ring.rarity}
                  </span>
                </div>
              </div>

              {/* 3D Ring Display Pedestal with Floating Animation */}
              <div className="my-5 py-4 flex flex-col items-center justify-center relative">
                {/* 3D Circular Light Platform */}
                <div 
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center relative transition-transform duration-500 group-hover:scale-110"
                  style={{
                    background: isUnlocked ? ring.ring3dStyle.gemGradient : 'radial-gradient(circle, #334155 0%, #0f172a 100%)',
                    boxShadow: isUnlocked ? ring.ring3dStyle.shadowGlow : 'none'
                  }}
                >
                  {/* Outer Bezel Halo Ring */}
                  <motion.div 
                    animate={isUnlocked ? { rotate: 360 } : {}}
                    transition={{ repeat: Infinity, duration: 16, ease: 'linear' }}
                    className={`absolute inset-0 rounded-full border-2 border-dashed ${
                      isUnlocked ? 'border-white/50' : 'border-slate-600/40'
                    }`}
                  />

                  {/* Gemstone Center Icon */}
                  <div className="relative z-10 text-3xl sm:text-4xl filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.6)] group-hover:scale-125 transition-transform duration-300">
                    {isUnlocked ? ring.ring3dStyle.gemEmoji : '🔒'}
                  </div>

                  {/* Sparkling Ambient Stars */}
                  {isUnlocked && (
                    <>
                      <div className="absolute top-1 right-2 text-[10px] animate-ping">✨</div>
                      <div className="absolute bottom-2 left-1 text-[10px] animate-pulse">💎</div>
                    </>
                  )}
                </div>

                {/* Pedestal Reflection Ellipse */}
                <div 
                  className="w-28 h-5 rounded-full mt-2 filter blur-[2px] opacity-75"
                  style={{
                    background: isUnlocked
                      ? `radial-gradient(ellipse, ${ring.primaryColor} 0%, transparent 80%)`
                      : 'radial-gradient(ellipse, #475569 0%, transparent 80%)'
                  }}
                />
              </div>

              {/* Ring Meta & Title */}
              <div className="space-y-1.5 relative z-10">
                <div className="flex items-baseline justify-between">
                  <h4 className="font-tech font-black text-white text-sm group-hover:text-amber-300 transition-colors">
                    {ring.name}
                  </h4>
                </div>
                <p className="text-[10px] text-amber-200/90 font-sans italic">
                  “{ring.title}”
                </p>

                {/* Material Spec */}
                <p className="text-[10px] text-slate-400 font-mono truncate">
                  {ring.material}
                </p>

                {/* Ring Buff Snapshot */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 flex items-center gap-1 font-tech">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    <span>逆风团战: <strong className="text-emerald-400 font-code font-bold">+{ring.statsBuff.clutchRateBonus}%</strong></span>
                  </span>

                  <span className="text-slate-400 flex items-center gap-1 font-tech">
                    <Award className="w-3 h-3 text-amber-400" />
                    <span>粉丝倍率: <strong className="text-amber-400 font-code font-bold">+{ring.statsBuff.fanAppealBonus}%</strong></span>
                  </span>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-2 flex items-center gap-2">
                  {isUnlocked ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectingRing(ring);
                        }}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-tech font-bold text-[10px] flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <Eye className="w-3 h-3 text-cyan-400" />
                        <span>3D 鉴赏 (Inspect)</span>
                      </button>

                      {!isEquipped && (
                        <button
                          onClick={(e) => handleEquipRing(ring, e)}
                          className="py-1.5 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-tech font-bold text-[10px] flex items-center justify-center gap-1 transition cursor-pointer"
                        >
                          <Crown className="w-3 h-3 text-amber-400" />
                          <span>佩戴</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="w-full py-1.5 px-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 font-tech text-[10px] flex items-center justify-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>赢得总决赛以加冕解锁</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ======================================================================= */}
      {/* 3D INTERACTIVE RING INSPECTION MODAL */}
      {/* ======================================================================= */}
      <AnimatePresence>
        {inspectingRing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md select-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0c101c] border-2 border-amber-500/60 rounded-3xl p-5 sm:p-6 shadow-[0_0_80px_rgba(245,158,11,0.35)] overflow-hidden text-slate-100 space-y-4"
              style={{ perspective: 1000 }}
            >
              {/* Close Button */}
              <button
                onClick={() => setInspectingRing(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer z-20"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Inspection Header */}
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-sm">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-tech font-extrabold text-white text-base sm:text-lg">
                      {inspectingRing.name}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded font-black font-code bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {inspectingRing.season} · {inspectingRing.rarity}
                    </span>
                  </div>
                  <p className="text-xs text-amber-200/80 font-sans italic">
                    “{inspectingRing.title}”
                  </p>
                </div>
              </div>

              {/* Central 3D Interactive Ring Sandbox */}
              <div className="relative py-6 rounded-2xl bg-gradient-to-b from-slate-950 to-[#070b14] border border-slate-800 flex flex-col items-center justify-center overflow-hidden">
                {/* Ambient Radial Spotlight */}
                <div 
                  className="absolute inset-0 opacity-40 blur-2xl"
                  style={{
                    background: `radial-gradient(circle, ${inspectingRing.primaryColor} 0%, transparent 70%)`
                  }}
                />

                {/* Rotating 3D Ring Object */}
                <motion.div
                  animate={{
                    rotateY: isRotating ? [0, 360] : rotationAngle,
                    rotateX: [-5, 8, -5],
                    y: [-4, 6, -4]
                  }}
                  transition={{
                    rotateY: isRotating ? { repeat: Infinity, duration: 12, ease: 'linear' } : { duration: 0.3 },
                    rotateX: { repeat: Infinity, duration: 6, ease: 'easeInOut' },
                    y: { repeat: Infinity, duration: 4, ease: 'easeInOut' }
                  }}
                  className="w-36 h-36 sm:w-44 sm:h-44 rounded-full flex items-center justify-center relative cursor-grab active:cursor-grabbing"
                  style={{
                    transformStyle: 'preserve-3d',
                    background: inspectingRing.ring3dStyle.gemGradient,
                    boxShadow: inspectingRing.ring3dStyle.shadowGlow
                  }}
                  onClick={() => setIsRotating(!isRotating)}
                >
                  {/* Ring Dual Bezel */}
                  <div className="absolute inset-2 rounded-full border-4 border-amber-300/40 border-dashed" />
                  
                  {/* Central Gem Icon */}
                  <div className="relative z-10 text-5xl sm:text-6xl filter drop-shadow-[0_15px_20px_rgba(0,0,0,0.8)]">
                    {inspectingRing.ring3dStyle.gemEmoji}
                  </div>
                </motion.div>

                {/* Bottom Lighting Pedestal */}
                <div 
                  className="w-48 h-6 rounded-full mt-4 filter blur-sm"
                  style={{
                    background: `radial-gradient(ellipse, ${inspectingRing.primaryColor} 0%, transparent 80%)`
                  }}
                />

                {/* 3D Interaction Control Tips */}
                <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-400 font-tech">
                  <button
                    onClick={() => setIsRotating(!isRotating)}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 cursor-pointer"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>{isRotating ? '暂停 360° 自转' : '恢复自转'}</span>
                  </button>
                  <span>•</span>
                  <span>悬停或点击戒指感受 3D 浮雕光泽</span>
                </div>
              </div>

              {/* Ring Detailed Dossier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
                {/* Material & Engraving */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="text-[10px] text-amber-400 font-bold font-tech uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>铸造材质与传世铭文</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono">
                    <strong className="text-white">锻造材质:</strong> {inspectingRing.material}
                  </p>
                  <p className="text-[11px] text-amber-200 font-mono">
                    <strong className="text-white">戒内微雕:</strong> {inspectingRing.engraving}
                  </p>
                </div>

                {/* Dynasty Buffs */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="text-[10px] text-emerald-400 font-bold font-tech uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>至尊王朝羁绊光环 ({inspectingRing.statsBuff.title})</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">逆风决胜团战胜率:</span>
                      <span className="text-emerald-400 font-code font-bold">+{inspectingRing.statsBuff.clutchRateBonus}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">粉丝商业号召力倍率:</span>
                      <span className="text-amber-400 font-code font-bold">+{inspectingRing.statsBuff.fanAppealBonus}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">战队士气韧性护甲:</span>
                      <span className="text-cyan-400 font-code font-bold">+{inspectingRing.statsBuff.moraleRetention}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ring Lore Story */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-300 font-sans leading-relaxed">
                <span className="text-amber-400 font-bold">【传奇战役铭刻】: </span>
                {inspectingRing.lore}
              </div>

              {/* Modal Bottom Actions */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => setInspectingRing(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-tech font-bold text-xs transition cursor-pointer"
                >
                  返回戒殿
                </button>

                {unlockedRingIds.includes(inspectingRing.id) && (
                  <button
                    onClick={() => {
                      handleEquipRing(inspectingRing);
                      setInspectingRing(null);
                    }}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-tech font-extrabold text-xs shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Crown className="w-4 h-4 text-slate-950" />
                    <span>佩戴该戒指至王朝王座</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrophyHallShowcase;
