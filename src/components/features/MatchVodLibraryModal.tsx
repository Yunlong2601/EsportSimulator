import React, { useState } from 'react';
import { 
  Film, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  Brain, 
  Swords, 
  Trophy, 
  Clock, 
  ChevronRight, 
  X, 
  Flame,
  Award,
  Eye,
  FastForward,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MatchVodEntry, VodTeamfightMoment, PlayerStats } from '../../types/game';
import { soundEngine } from '../../utils/audio';

interface MatchVodLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  vodArchive: MatchVodEntry[];
  stats: PlayerStats;
  onApplyVodReviewReward: (vodId: string, insightGain: number, mechBonus: number, macroBonus: number) => void;
}

export const MatchVodLibraryModal: React.FC<MatchVodLibraryModalProps> = ({
  isOpen,
  onClose,
  vodArchive,
  stats,
  onApplyVodReviewReward
}) => {
  const [selectedVod, setSelectedVod] = useState<MatchVodEntry | null>(vodArchive[0] || null);
  const [activeMomentIndex, setActiveMomentIndex] = useState<number>(0);
  const [isPlayingAnimation, setIsPlayingAnimation] = useState<boolean>(false);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);
  const [completedMomentsInSession, setCompletedMomentsInSession] = useState<Set<string>>(new Set());
  const [justAwardedBonus, setJustAwardedBonus] = useState<{
    insight: number;
    mech: number;
    macro: number;
    title: string;
  } | null>(null);

  if (!isOpen) return null;

  const currentVod = selectedVod || vodArchive[0];
  const currentMoment: VodTeamfightMoment | undefined = currentVod?.teamfightMoments[activeMomentIndex];

  // Handle Play Animated Summary Review
  const handlePlayMoment = (index: number) => {
    soundEngine.playClick();
    setActiveMomentIndex(index);
    setIsPlayingAnimation(true);
    setPlaybackProgress(0);

    // Simulated animated scrubbing progress (3.5 seconds)
    const interval = setInterval(() => {
      setPlaybackProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsPlayingAnimation(false);
          soundEngine.playLevelUp();

          // Mark moment as reviewed in this session
          const moment = currentVod?.teamfightMoments[index];
          if (moment) {
            setCompletedMomentsInSession(prevSet => new Set(prevSet).add(moment.id));
          }
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  // Complete VOD Review & Gain Tactical Insight
  const handleClaimReviewInsight = () => {
    if (!currentVod) return;
    soundEngine.playVictory();

    const totalInsight = currentVod.teamfightMoments.reduce((acc, m) => acc + m.insightBonus, 0);
    const totalMech = currentVod.teamfightMoments.reduce((acc, m) => acc + (m.xpBonusMech || 0), 0);
    const totalMacro = currentVod.teamfightMoments.reduce((acc, m) => acc + (m.xpBonusMacro || 0), 0);

    onApplyVodReviewReward(currentVod.id, totalInsight, totalMech, totalMacro);

    setJustAwardedBonus({
      insight: totalInsight,
      mech: totalMech,
      macro: totalMacro,
      title: currentVod.matchTitle
    });

    setTimeout(() => {
      setJustAwardedBonus(null);
    }, 4500);
  };

  const isCurrentVodReviewed = currentVod?.reviewed;
  const currentInsightValue = stats.tacticalInsight ?? 45;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none overflow-y-auto">
      <div className="relative max-w-4xl w-full bg-slate-950 border-2 border-cyan-500/60 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] my-auto flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 shadow-sm">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-tech font-bold text-white text-base">
                  赛事录像与高光复盘库 (Match VOD Library)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-code font-bold border border-cyan-500/40">
                  Tactical Review
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                观看过往硬仗动态战术沙盘，拆解致胜团战决策，永久获取「战术洞察」属性加成！
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Insight Stat Bar Banner */}
        <div className="p-2.5 sm:px-4 bg-gradient-to-r from-slate-950 via-cyan-950/40 to-slate-950 border-b border-cyan-500/30 flex items-center justify-between text-xs font-tech">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-slate-300">当前战术洞察值 (Tactical Insight):</span>
            <span className="text-sm font-code font-black text-cyan-300">
              {currentInsightValue} / 100
            </span>
            <span className="text-[10px] text-cyan-400/80 hidden sm:inline">
              (影响关键团战决断胜率 +{Math.round(currentInsightValue * 0.15)}%，对线预判直觉增强)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-code text-slate-400">已收录比赛录像:</span>
            <span className="text-xs font-code font-bold text-amber-300">
              {vodArchive.filter(v => v.reviewed).length} / {vodArchive.length} 盘已深度研读
            </span>
          </div>
        </div>

        {/* Award Notification Toast */}
        <AnimatePresence>
          {justAwardedBonus && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-3 bg-gradient-to-r from-emerald-950/90 via-slate-900 to-cyan-950/90 border-b border-emerald-500/60 text-emerald-300 text-xs font-tech flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  恭喜完成《{justAwardedBonus.title}》深度战术复盘！获得 <strong className="text-white font-code">+{justAwardedBonus.insight} 战术洞察</strong>、
                  <strong className="text-cyan-300 font-code">+{justAwardedBonus.mech} 微操</strong>、
                  <strong className="text-purple-300 font-code">+{justAwardedBonus.macro} 大局观</strong> 永久加成！
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 uppercase font-code">Insight Unlocked ✓</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content 2-Column Split */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0">
          
          {/* Left Column: VOD Archive List (4 cols) */}
          <div className="md:col-span-4 border-r border-slate-800/80 bg-slate-950/80 overflow-y-auto p-2.5 sm:p-3 space-y-2">
            <div className="text-[11px] font-tech font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between pb-1">
              <span>经典赛事录像盘库</span>
              <span className="text-slate-500 font-code">VODS ({vodArchive.length})</span>
            </div>

            {vodArchive.map((vod) => {
              const isSelected = selectedVod?.id === vod.id;
              const isReviewed = vod.reviewed;

              return (
                <div
                  key={vod.id}
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedVod(vod);
                    setActiveMomentIndex(0);
                    setIsPlayingAnimation(false);
                    setPlaybackProgress(0);
                  }}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition relative overflow-hidden ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-400 shadow-md ring-1 ring-cyan-500/50'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
                  }`}
                >
                  {/* Top Match Tag & Badge */}
                  <div className="flex items-center justify-between text-[9px] font-tech mb-1">
                    <span className="px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 border border-slate-800">
                      {vod.stageEra}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded font-bold uppercase ${
                      vod.result === 'VICTORY'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {vod.result === 'VICTORY' ? '胜利 VICTORY' : '惜败 DEFEAT'}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="text-xs font-tech font-bold text-white line-clamp-1 mb-1">
                    {vod.matchTitle}
                  </h4>

                  {/* Player & Role Stats */}
                  <div className="flex items-center justify-between text-[10px] font-code text-slate-400">
                    <div className="flex items-center gap-1">
                      <span className="text-cyan-300 font-tech font-bold">{vod.playerChamp}</span>
                      <span>({vod.playerRole})</span>
                    </div>
                    <span className="text-slate-300 font-semibold">{vod.kda}</span>
                  </div>

                  {/* Bottom Insight Badge */}
                  <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-800/60 text-[9px]">
                    <div className="flex items-center gap-1 text-cyan-400 font-tech">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>可领 +{vod.insightAwarded} 洞察</span>
                    </div>
                    {isReviewed ? (
                      <span className="text-emerald-400 font-tech font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" /> 已复盘
                      </span>
                    ) : (
                      <span className="text-amber-400 font-tech font-semibold flex items-center gap-0.5">
                        <Eye className="w-2.5 h-2.5" /> 待深度研读
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Animated Teamfight VOD Player & Decision Breakdown (8 cols) */}
          <div className="md:col-span-8 flex flex-col bg-slate-950 overflow-y-auto p-3 sm:p-4 space-y-3">
            
            {/* 1. Animated Tactical Video Stage Screen */}
            <div className="relative rounded-2xl bg-slate-950 border-2 border-cyan-500/40 h-56 sm:h-64 overflow-hidden shadow-inner flex flex-col justify-between">
              
              {/* Tactical Minimap Background Grid */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px]" />
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <line x1="0" y1="200" x2="400" y2="0" stroke="#00f0ff" strokeWidth="1" strokeDasharray="4 4" />
                  <circle cx="200" cy="110" r="38" stroke="#f59e0b" strokeWidth="1" fill="none" strokeDasharray="3 3" />
                </svg>
              </div>

              {/* VOD Top Overlay Bar */}
              <div className="relative z-10 p-2.5 bg-slate-950/80 backdrop-blur-sm border-b border-slate-800 flex items-center justify-between text-xs font-tech">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 text-[10px]">
                    <Film className="w-2.5 h-2.5 text-cyan-400" />
                    <span>REC VOD REPLAY</span>
                  </span>
                  <span className="text-white font-bold truncate max-w-[220px]">
                    {currentVod.matchTitle}
                  </span>
                </div>
                <div className="text-[10px] font-code text-slate-400 flex items-center gap-2">
                  <span>时长: {currentVod.duration}</span>
                  <span className="text-amber-400 font-bold">MVP: {currentVod.mvpPlayer}</span>
                </div>
              </div>

              {/* Center Animated Dynamic Teamfight Stage */}
              <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 text-center">
                
                {isPlayingAnimation ? (
                  /* During Playback Animation */
                  <div className="space-y-3 animate-pulse">
                    <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                      <Swords className="w-7 h-7 text-cyan-300" />
                    </div>
                    <div>
                      <div className="text-sm font-tech font-black text-cyan-300 tracking-wide">
                        正在推演战术沙盘：{currentMoment?.title}
                      </div>
                      <div className="text-[11px] text-slate-300 font-sans mt-0.5">
                        地形侦测: {currentMoment?.location} • 核心英雄: {currentMoment?.keyHero}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Idle / Completed State */
                  <div className="space-y-2 max-w-md">
                    <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 shadow-lg">
                      <Play className="w-8 h-8 ml-0.5" />
                    </div>
                    <h4 className="text-sm sm:text-base font-tech font-extrabold text-white">
                      第 {currentMoment?.minute} 分钟 · {currentMoment?.title}
                    </h4>
                    <p className="text-[11px] text-slate-300 font-sans leading-relaxed line-clamp-2">
                      {currentMoment?.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Scrubber & Progress Bar */}
              <div className="relative z-10 p-2.5 bg-slate-950/80 backdrop-blur-sm border-t border-slate-800 flex items-center justify-between gap-3 text-xs">
                <button
                  onClick={() => handlePlayMoment(activeMomentIndex)}
                  disabled={isPlayingAnimation}
                  className={`px-3 py-1.5 rounded-lg font-tech font-bold text-xs flex items-center gap-1.5 cursor-pointer transition shadow ${
                    isPlayingAnimation
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isPlayingAnimation ? '战术推演中...' : '推演该关键团战'}</span>
                </button>

                {/* Progress bar */}
                <div className="flex-1">
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700/80">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-amber-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${playbackProgress}%` }}
                    />
                  </div>
                </div>

                <span className="text-[10px] font-code text-cyan-300 font-bold shrink-0">
                  {playbackProgress}% 完成
                </span>
              </div>
            </div>

            {/* 2. Key Teamfight Moments Selector Tabs */}
            <div className="space-y-2">
              <div className="text-[11px] font-tech font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>关键团战节点分解 (Key Teamfights)</span>
                <span className="text-cyan-400 font-code">
                  共 {currentVod.teamfightMoments.length} 处胜负决胜手
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {currentVod.teamfightMoments.map((moment, idx) => {
                  const isActive = activeMomentIndex === idx;
                  const isDone = completedMomentsInSession.has(moment.id) || currentVod.reviewed;

                  return (
                    <button
                      key={moment.id}
                      onClick={() => {
                        soundEngine.playClick();
                        setActiveMomentIndex(idx);
                        setPlaybackProgress(isDone ? 100 : 0);
                        setIsPlayingAnimation(false);
                      }}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between gap-1.5 ${
                        isActive
                          ? 'bg-slate-900 border-cyan-400 shadow-md ring-1 ring-cyan-500/50'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-tech">
                        <span className="text-cyan-300 font-bold">第 {moment.minute} 分钟</span>
                        {isDone ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> 已推演
                          </span>
                        ) : (
                          <span className="text-slate-500">待推演</span>
                        )}
                      </div>

                      <div className="text-xs font-tech font-bold text-white truncate">
                        {moment.title}
                      </div>

                      <div className="text-[9px] text-amber-300 font-code flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>+{moment.insightBonus} 洞察</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Deep Tactical Insight Analysis Card */}
            {currentMoment && (
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-tech font-bold text-white flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-cyan-400" />
                    <span>教练组复盘笔记：{currentMoment.keyAction}</span>
                  </span>
                  <span className="text-[10px] font-code px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {currentMoment.location}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  {currentMoment.description}
                </p>

                {/* Stat Reward Badges for this moment */}
                <div className="flex items-center gap-2 pt-1 text-[10px] font-tech">
                  <span className="text-slate-400">研读沉淀收益:</span>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-code font-bold">
                    +{currentMoment.insightBonus} 战术洞察
                  </span>
                  {currentMoment.xpBonusMech ? (
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 font-code font-bold">
                      +{currentMoment.xpBonusMech} 微操经验
                    </span>
                  ) : null}
                  {currentMoment.xpBonusMacro ? (
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-code font-bold">
                      +{currentMoment.xpBonusMacro} 大局观经验
                    </span>
                  ) : null}
                </div>
              </div>
            )}

            {/* 4. Complete Review Claim Button */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <div className="text-[11px] text-slate-400 font-sans">
                完成本场对局所有团战复盘后，可一键将战术洞察与经验加成注入选手属性库！
              </div>

              <button
                onClick={handleClaimReviewInsight}
                disabled={isCurrentVodReviewed}
                className={`px-4 py-2 rounded-xl font-tech font-bold text-xs flex items-center gap-1.5 cursor-pointer transition shadow-lg ${
                  isCurrentVodReviewed
                    ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black shadow-amber-500/20'
                }`}
              >
                <Award className="w-4 h-4 text-slate-950" />
                <span>
                  {isCurrentVodReviewed ? '本局已完成复盘研读 ✓' : `领取全部战术洞察 (+${currentVod.insightAwarded} 洞察)`}
                </span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
