import React, { useState } from 'react';
import {
  Tv,
  Users,
  Flame,
  Sparkles,
  Gift,
  CheckCircle2,
  Lock,
  Smile,
  ShieldCheck,
  ChevronRight,
  Rocket,
  Crown,
  Radio,
  X,
  Zap,
  TrendingUp,
  Award
} from 'lucide-react';
import { PlayerStats, StreamingMilestone, FanEmote, ChannelPerk } from '../../types/game';
import {
  STREAMING_MILESTONES,
  DEFAULT_STREAM_CHANNEL,
  getNextMilestone,
  getEmoteById,
  getClaimableMilestones
} from '../../data/streamingMilestonesData';
import { soundEngine } from '../../utils/audio';

interface StreamingMilestonesTrackerProps {
  stats: PlayerStats;
  onClaimMilestone: (milestoneId: string) => { success: boolean; message: string };
  onEquipEmote: (emoteId: string | null) => { success: boolean; message: string };
  onStream?: () => void;
}

export const StreamingMilestonesTracker: React.FC<StreamingMilestonesTrackerProps> = ({
  stats,
  onClaimMilestone,
  onEquipEmote,
  onStream
}) => {
  const [showEmoteModal, setShowEmoteModal] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const channel = stats.streamChannel || DEFAULT_STREAM_CHANNEL;
  const currentSubs = channel.subscribers;
  const unlockedMilestones = new Set(channel.unlockedMilestones || []);
  const activePerks = new Set(channel.activePerkIds || []);
  const unlockedEmotes = new Set(channel.unlockedEmoteIds || []);
  const equippedEmote = getEmoteById(channel.equippedEmoteId);

  const nextMilestone = getNextMilestone(currentSubs);
  const claimableList = getClaimableMilestones(channel);

  // Calculate progress percent to next milestone
  let progressPercent = 100;
  let prevSubReq = 0;
  if (nextMilestone) {
    const idx = STREAMING_MILESTONES.indexOf(nextMilestone);
    prevSubReq = idx > 0 ? STREAMING_MILESTONES[idx - 1].subscriberReq : 0;
    const range = nextMilestone.subscriberReq - prevSubReq;
    const currentDiff = Math.max(0, currentSubs - prevSubReq);
    progressPercent = Math.min(100, Math.max(0, Math.floor((currentDiff / range) * 100)));
  }

  const handleClaim = (milestoneId: string) => {
    soundEngine.playClick();
    const result = onClaimMilestone(milestoneId);
    if (result.success) {
      setFeedback({ message: result.message, type: 'success' });
    } else {
      setFeedback({ message: result.message, type: 'error' });
    }
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  const handleEquip = (emoteId: string) => {
    soundEngine.playClick();
    const newTarget = channel.equippedEmoteId === emoteId ? null : emoteId;
    const result = onEquipEmote(newTarget);
    if (result.success) {
      setFeedback({ message: result.message, type: 'success' });
    }
    setTimeout(() => {
      setFeedback(null);
    }, 3500);
  };

  const getRarityBadge = (rarity: FanEmote['rarity']) => {
    switch (rarity) {
      case 'legendary':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'epic':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      default:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    }
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/30 border border-purple-500/30 p-3 sm:p-4 shadow-lg space-y-3">
      
      {/* Header & Live Stream Channel Status Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-purple-500/20 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 shrink-0">
            <Tv className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-tech font-extrabold text-white text-xs tracking-wide">
                直播订阅里程碑与粉丝特权
              </span>
              <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded font-code font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                <Radio className="w-2.5 h-2.5 text-purple-400 animate-pulse" />
                <span>CHANNEL PERKS</span>
              </span>
              {claimableList.length > 0 && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-code font-extrabold animate-pulse">
                  {claimableList.length}项可领取
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">
              开播集训积累粉丝订阅，解锁专属频道特权与独家粉丝表情包
            </p>
          </div>
        </div>

        {/* Header Quick Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              soundEngine.playClick();
              setShowEmoteModal(true);
            }}
            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-white border border-slate-700 font-tech font-bold text-[10px] transition cursor-pointer flex items-center gap-1 shadow-sm"
            title="查看全部粉丝表情库与已激活特权"
          >
            <Smile className="w-3 h-3 text-purple-400" />
            <span className="hidden xs:inline">表情与特权库</span>
            <span className="xs:hidden">表情库</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`px-3 py-1.5 rounded-lg text-[11px] font-sans font-semibold flex items-center gap-1.5 transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-500/40'
              : 'bg-rose-950/80 text-rose-200 border border-rose-500/40'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Channel Stats Overview Ribbon */}
      <div className="grid grid-cols-4 gap-1.5 text-center">
        <div className="p-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="text-[9px] text-slate-400 font-sans flex items-center justify-center gap-0.5">
            <Users className="w-2.5 h-2.5 text-purple-400" />
            <span>粉丝订阅</span>
          </div>
          <div className="text-xs sm:text-sm font-code font-black text-purple-300 mt-0.5">
            {currentSubs.toLocaleString()}
          </div>
        </div>

        <div className="p-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="text-[9px] text-slate-400 font-sans flex items-center justify-center gap-0.5">
            <Flame className="w-2.5 h-2.5 text-amber-400" />
            <span>历史人气峰值</span>
          </div>
          <div className="text-xs sm:text-sm font-code font-black text-amber-300 mt-0.5">
            {(channel.peakViewers / 1000).toFixed(1)}k
          </div>
        </div>

        <div className="p-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="text-[9px] text-slate-400 font-sans flex items-center justify-center gap-0.5">
            <Tv className="w-2.5 h-2.5 text-cyan-400" />
            <span>累计开播</span>
          </div>
          <div className="text-xs sm:text-sm font-code font-black text-cyan-300 mt-0.5">
            {channel.totalStreams} 场
          </div>
        </div>

        <div className="p-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="text-[9px] text-slate-400 font-sans flex items-center justify-center gap-0.5">
            <Smile className="w-2.5 h-2.5 text-emerald-400" />
            <span>已佩戴勋章</span>
          </div>
          <div className="text-xs font-code font-bold text-white mt-0.5 truncate px-1">
            {equippedEmote ? (
              <span className="text-emerald-300">
                {equippedEmote.emoji} {equippedEmote.name}
              </span>
            ) : (
              <span className="text-slate-500 font-normal">暂无</span>
            )}
          </div>
        </div>
      </div>

      {/* Next Milestone Progress Bar */}
      {nextMilestone ? (
        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-purple-500/20 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-sans">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-300 font-medium">下阶段里程碑:</span>
              <span className="font-tech font-bold text-white">
                {nextMilestone.title}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-300 border border-purple-500/30">
                {nextMilestone.badge}
              </span>
            </div>
            <span className="text-[10px] font-code text-purple-400 font-bold">
              {currentSubs.toLocaleString()} / {nextMilestone.subscriberReq.toLocaleString()} ({progressPercent}%)
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400 transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[9px] text-slate-400 font-sans">
            <span>距离达成还需 +{(nextMilestone.subscriberReq - currentSubs).toLocaleString()} 订阅</span>
            <span>解锁特权: {nextMilestone.perk.name} 与专属表情 {nextMilestone.emote.emoji}</span>
          </div>
        </div>
      ) : (
        <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between text-[11px] font-sans text-amber-200">
          <div className="flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="font-bold">恭喜！已达成全网最高 150,000 传奇名人堂终极里程碑！</span>
          </div>
          <span className="font-code text-amber-300 font-bold">MAX LEVEL</span>
        </div>
      )}

      {/* Streaming Milestones Timeline & Cards */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <h4 className="font-tech font-bold text-white text-xs uppercase tracking-wide flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-purple-400" />
            <span>订阅里程碑序列 (Milestones Tracker)</span>
          </h4>
          <span className="text-[10px] text-slate-400 font-sans">
            已激活特权: {channel.unlockedMilestones.length} / {STREAMING_MILESTONES.length}
          </span>
        </div>

        <div className="space-y-2">
          {STREAMING_MILESTONES.map((m, idx) => {
            const isReached = currentSubs >= m.subscriberReq;
            const isClaimed = unlockedMilestones.has(m.id);
            const isEquipped = channel.equippedEmoteId === m.emote.id;

            return (
              <div
                key={m.id}
                className={`p-2.5 sm:p-3 rounded-xl border transition-all ${
                  isClaimed
                    ? 'bg-slate-900/90 border-slate-800'
                    : isReached
                    ? 'bg-gradient-to-r from-purple-950/60 via-slate-900 to-amber-950/40 border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.2)] animate-pulse'
                    : 'bg-slate-950/60 border-slate-800/80 opacity-80'
                }`}
              >
                <div className="flex items-start justify-between gap-2.5">
                  {/* Left Icon & Info */}
                  <div className="flex items-start gap-2.5 overflow-hidden">
                    <div className={`p-2 rounded-xl border text-xl shrink-0 select-none flex items-center justify-center w-10 h-10 ${
                      isClaimed
                        ? 'bg-purple-950/60 border-purple-500/40 text-purple-300'
                        : isReached
                        ? 'bg-amber-950/60 border-amber-500/50 text-amber-300 animate-bounce'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}>
                      {m.emote.emoji}
                    </div>

                    <div className="truncate">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-tech font-bold text-white text-xs truncate">
                          {m.title}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-code font-bold ${
                          isClaimed
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : isReached
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {m.subscriberReq.toLocaleString()} 订阅
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded border font-sans ${getRarityBadge(m.emote.rarity)}`}>
                          {m.emote.rarity === 'legendary' ? '传说表情' : m.emote.rarity === 'epic' ? '史诗表情' : '稀有表情'}
                        </span>
                      </div>

                      {/* Perk description */}
                      <div className="text-[10px] text-purple-300 font-sans mt-0.5 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-purple-400 shrink-0" />
                        <span className="font-bold">{m.perk.name}:</span>
                        <span className="text-slate-300 truncate">{m.perk.bonusSummary}</span>
                      </div>

                      {/* Emote Info & Lore */}
                      <div className="text-[10px] text-slate-400 font-sans mt-0.5 flex items-center gap-1.5 truncate">
                        <span className="text-amber-400 font-code font-bold">
                          {m.emote.code}
                        </span>
                        <span>·</span>
                        <span className="truncate">{m.emote.description}</span>
                        <span>·</span>
                        <span className="text-emerald-400 font-code">
                          +${m.rewardMoney} / +{m.rewardFame}名气
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Action Button */}
                  <div className="shrink-0 text-right space-y-1">
                    {isClaimed ? (
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>特权已常驻</span>
                        </span>
                        <button
                          onClick={() => handleEquip(m.emote.id)}
                          className={`px-2 py-0.8 rounded-lg text-[9px] font-tech font-bold transition cursor-pointer active:scale-98 ${
                            isEquipped
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
                          }`}
                        >
                          {isEquipped ? '已佩戴勋章' : '佩戴此表情'}
                        </button>
                      </div>
                    ) : isReached ? (
                      <button
                        onClick={() => handleClaim(m.id)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 active:scale-98 text-white font-tech font-extrabold text-xs transition cursor-pointer flex items-center gap-1 shadow-lg shadow-purple-500/30 animate-pulse"
                      >
                        <Gift className="w-3.5 h-3.5" />
                        <span>领取特权</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-tech px-2 py-1 rounded-lg bg-slate-900 border border-slate-800">
                        <Lock className="w-3 h-3 text-slate-600" />
                        <span>未达成</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fan Emotes Locker & Perks Detail Modal */}
      {showEmoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-purple-500/40 shadow-[0_0_50px_rgba(168,85,247,0.2)] overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-4 py-3 border-b border-purple-500/20 bg-slate-900/90 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400">
                  <Smile className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-tech font-extrabold text-white text-sm">
                    粉丝表情弹幕库与频道常驻特权
                  </h3>
                  <p className="text-[10px] text-slate-400 font-sans">
                    管理已解锁的专属表情勋章，查看生效中的增益特权
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowEmoteModal(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scroll Body */}
            <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              {/* Emotes Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-tech font-bold text-xs text-white uppercase flex items-center gap-1">
                    <Smile className="w-3 h-3 text-purple-400" />
                    <span>专属粉丝表情包 (Fan Emotes)</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-sans">
                    已解锁 {channel.unlockedEmoteIds.length} / {STREAMING_MILESTONES.length}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {STREAMING_MILESTONES.map((m) => {
                    const isUnlocked = unlockedEmotes.has(m.emote.id);
                    const isEquipped = channel.equippedEmoteId === m.emote.id;

                    return (
                      <div
                        key={m.emote.id}
                        className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                          isEquipped
                            ? 'bg-purple-950/60 border-purple-500 shadow-md ring-1 ring-purple-500/50'
                            : isUnlocked
                            ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                            : 'bg-slate-950/70 border-slate-900 opacity-60'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl">{m.emote.emoji}</span>
                            <span className={`text-[8px] px-1 py-0.2 rounded font-sans border ${getRarityBadge(m.emote.rarity)}`}>
                              {m.emote.rarity}
                            </span>
                          </div>
                          <div className="font-tech font-bold text-white text-[11px] mt-1 truncate">
                            {m.emote.name}
                          </div>
                          <div className="text-[9px] font-code text-purple-300 font-bold truncate">
                            {m.emote.code}
                          </div>
                          <p className="text-[9px] text-slate-400 font-sans mt-0.5 line-clamp-2">
                            {m.emote.description}
                          </p>
                        </div>

                        <div className="mt-2 pt-1 border-t border-slate-800">
                          {isUnlocked ? (
                            <button
                              onClick={() => handleEquip(m.emote.id)}
                              className={`w-full py-1 rounded-lg text-[9px] font-tech font-bold transition cursor-pointer active:scale-98 ${
                                isEquipped
                                  ? 'bg-purple-600 text-white shadow-sm'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                              }`}
                            >
                              {isEquipped ? '当前佩戴中' : '佩戴勋章'}
                            </button>
                          ) : (
                            <div className="text-center text-[9px] text-slate-500 font-sans flex items-center justify-center gap-0.5 py-0.5">
                              <Lock className="w-2.5 h-2.5" />
                              <span>{m.subscriberReq.toLocaleString()} 订阅解锁</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Perks List */}
              <div className="space-y-2">
                <span className="font-tech font-bold text-xs text-white uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-purple-400" />
                  <span>已激活频道特权矩阵 (Active Channel Perks)</span>
                </span>

                <div className="space-y-1.5">
                  {STREAMING_MILESTONES.map((m) => {
                    const isUnlocked = activePerks.has(m.perk.id);

                    return (
                      <div
                        key={m.perk.id}
                        className={`p-2 rounded-xl border flex items-center justify-between text-xs ${
                          isUnlocked
                            ? 'bg-slate-900/90 border-purple-500/30 text-slate-200'
                            : 'bg-slate-950/40 border-slate-900 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-base">{m.perk.icon}</span>
                          <div className="truncate">
                            <div className="flex items-center gap-1.5">
                              <span className="font-tech font-bold text-[11px] text-white">
                                {m.perk.name}
                              </span>
                              <span className="text-[9px] text-purple-300">
                                ({m.perk.title})
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {m.perk.effectDescription}
                            </div>
                          </div>
                        </div>

                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 ml-2 ${
                          isUnlocked
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-900 text-slate-500 border border-slate-800'
                        }`}>
                          {isUnlocked ? '常驻生效' : '未解锁'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-400 font-sans">
                每次开播集训均可增长数百至上千订阅
              </span>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowEmoteModal(false);
                }}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-tech font-bold text-xs transition cursor-pointer"
              >
                关闭
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
