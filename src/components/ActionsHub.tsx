import React from 'react';
import { 
  Film, 
  Video, 
  Cpu, 
  ShoppingBag, 
  Briefcase, 
  HeartPulse, 
  Radio, 
  BookOpen, 
  Sparkles, 
  X, 
  ChevronDown, 
  Zap, 
  AlertCircle,
  ExternalLink,
  Bed,
  Users
} from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { PlayerStats, GamePhase } from '../types/game';
import { DailyMarathonSchedule, ScheduleBlockId } from './features/DailyMarathonSchedule';

export interface ActionsHubProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhase: GamePhase;
  stats: PlayerStats;
  onWatchReplays?: () => void;
  onOpenVodLibrary?: () => void;
  onOpenHardware?: () => void;
  onOpenGacha?: () => void;
  onOpenAgency?: () => void;
  onOpenPhysio?: () => void;
  onOpenRecoveryRoom?: () => void;
  onStream?: () => void;
  onReviewTacticalTheory?: () => void;
  onOpenSocialFeed?: () => void;
  onOpenCommunityRelations?: () => void;
  onReflexDuel?: () => void;
  onOpenBudgetReview?: () => void;
  onOpenLeaderboard?: () => void;
}

export const ActionsHub: React.FC<ActionsHubProps> = ({
  isOpen,
  onClose,
  currentPhase,
  stats,
  onWatchReplays,
  onOpenVodLibrary,
  onOpenHardware,
  onOpenGacha,
  onOpenAgency,
  onOpenPhysio,
  onOpenRecoveryRoom,
  onStream,
  onReviewTacticalTheory,
  onOpenSocialFeed,
  onOpenCommunityRelations,
  onReflexDuel,
  onOpenBudgetReview,
  onOpenLeaderboard
}) => {
  if (!isOpen) return null;

  const energy = stats.energy ?? 100;
  const focus = stats.focus ?? 100;
  const canWatchReplay = energy >= 15 && focus >= 15;
  const canStream = energy >= 20 && focus >= 20;

  const handleExecuteScheduleAction = (blockId: ScheduleBlockId) => {
    soundEngine.playClick();
    switch (blockId) {
      case 'MORNING_INTEL':
        if (onWatchReplays) onWatchReplays();
        else if (onOpenVodLibrary) onOpenVodLibrary();
        break;
      case 'LADDER_GRIND':
        if (onReflexDuel) onReflexDuel();
        break;
      case 'MIDDAY_PHYSIO':
        if (onOpenPhysio) onOpenPhysio();
        else if (onOpenRecoveryRoom) onOpenRecoveryRoom();
        break;
      case 'TEAM_SCRIMS':
        if (onReviewTacticalTheory) onReviewTacticalTheory();
        break;
      case 'TOURNAMENT_STAGE':
        if (onOpenVodLibrary) onOpenVodLibrary();
        break;
      case 'NIGHT_STREAM':
        if (onStream) onStream();
        break;
      case 'NIGHT_AUDIT':
        if (onOpenBudgetReview) onOpenBudgetReview();
        break;
    }
  };

  return (
    <div className="absolute inset-0 z-35 flex flex-col justify-end bg-slate-950/70 backdrop-blur-sm transition-all duration-300 animate-fadeIn">
      {/* Click-away backdrop scrim */}
      <div 
        className="flex-1 cursor-pointer" 
        onClick={() => {
          soundEngine.playClick();
          onClose();
        }} 
      />

      {/* Slide-Up Chamfered Sheet Container */}
      <div className="w-full max-h-[72vh] flex flex-col bg-slate-950/96 border-t-2 border-x border-cyan-500/50 rounded-t-3xl shadow-[0_-12px_45px_rgba(0,0,0,0.9),0_0_25px_rgba(6,182,212,0.2)] overflow-hidden transition-transform animate-slideUp">
        
        {/* Top Drag Handle & Title Bar */}
        <div className="px-4 pt-3 pb-2.5 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-tech font-bold text-slate-100 tracking-wide">
                  次级战术行动舱 · ACTIONS HUB
                </h3>
                <span className="px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/30 text-[9px] font-tech text-cyan-300">
                  {currentPhase === 1 ? '天梯次席' : currentPhase === 2 ? '赛前备战' : '豪门运营'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                即时执行次席运营、录像复盘与专属经纪，无需跳出生涯主视口
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition cursor-pointer"
            title="收起次级行动舱"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Tasks Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-3 custom-scrollbar">
          
          {/* 20-Hour Marathon Daily Schedule & Tri-Goal Hub (全天候职业作息与三大追求中枢) */}
          <DailyMarathonSchedule
            stats={stats}
            currentPhase={currentPhase}
            onExecuteBlockAction={handleExecuteScheduleAction}
            onOpenPhysio={onOpenPhysio}
            onOpenBudgetReview={onOpenBudgetReview}
            onOpenLeaderboard={onOpenLeaderboard}
          />

          {/* SECTION 1: 录像复盘与对局解析 (Review Replays) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-tech font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Film className="w-3 h-3" />
                战术复盘与对局解析 · REPLAYS
              </span>
              <span className="text-[9px] text-slate-500 font-tech">
                精力 ≥15 可复盘
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Task 1A: 快速切片复盘 (Direct Execution) */}
              <div
                onClick={() => {
                  if (!canWatchReplay) return;
                  soundEngine.playClick();
                  onWatchReplays?.();
                }}
                className={`p-2.5 rounded-xl border transition-all select-none flex flex-col justify-between ${
                  canWatchReplay
                    ? 'bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border-indigo-500/40 hover:border-indigo-400 hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] cursor-pointer group active:scale-[0.98]'
                    : 'bg-slate-900/40 border-slate-800/60 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 group-hover:scale-110 transition-transform">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-tech font-bold text-slate-200 group-hover:text-indigo-200">
                        快速切片复盘
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                        逐帧研读世界赛绕后团战视野差
                      </div>
                    </div>
                  </div>
                  <span className={`text-[9px] font-tech px-1.5 py-0.5 rounded border shrink-0 ${
                    canWatchReplay
                      ? 'bg-indigo-950 text-indigo-300 border-indigo-500/30'
                      : 'bg-rose-950 text-rose-300 border-rose-500/30'
                  }`}>
                    {canWatchReplay ? '⚡ 即时执行' : '精力不足'}
                  </span>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[9px] font-tech text-slate-400">
                  <span className="text-emerald-400 font-bold">+2 微操 · +3 心态</span>
                  <span>消耗: 15精力 / 12专注</span>
                </div>
              </div>

              {/* Task 1B: 名局战术录像库 (Modal Trigger) */}
              <div
                onClick={() => {
                  soundEngine.playClick();
                  onOpenVodLibrary?.();
                  onClose();
                }}
                className="p-2.5 rounded-xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 hover:border-indigo-400/60 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all cursor-pointer group active:scale-[0.98] flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 group-hover:scale-110 transition-transform">
                      <Film className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-tech font-bold text-slate-200 group-hover:text-indigo-200 flex items-center gap-1">
                        战术录像归档库
                        <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                        跨赛区百场经典名局与团战决策
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-tech px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                    深度研讨
                  </span>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[9px] font-tech text-slate-400">
                  <span className="text-indigo-300">积累战术洞察点 (Insight)</span>
                  <span className="text-slate-500">详情检索 →</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: 装备工坊与电竞市场 (Check Market) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-tech font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag className="w-3 h-3" />
                电竞外设与转会市场 · MARKET
              </span>
              <span className="text-[9px] text-slate-500 font-tech">
                金币: ${stats.money.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Task 2A: 硬件装备工坊 (Hardware Rig) */}
              <div
                onClick={() => {
                  soundEngine.playClick();
                  onOpenHardware?.();
                  onClose();
                }}
                className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 border border-cyan-500/30 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all cursor-pointer group active:scale-[0.98] flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 group-hover:scale-110 transition-transform">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-tech font-bold text-slate-200 group-hover:text-cyan-200 flex items-center gap-1">
                        神装外设商城
                        <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                        采购电竞鼠标、机械键盘、电竞椅
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-tech px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 shrink-0">
                    外设硬件
                  </span>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[9px] font-tech text-slate-400">
                  <span className="text-cyan-400">永久微操 & 心态增益</span>
                  <span className="text-slate-500">前往选购 →</span>
                </div>
              </div>

              {/* Task 2B: 球探转会与签约抽卡 (Scout Gacha / Transfer Market) */}
              <div
                onClick={() => {
                  soundEngine.playClick();
                  onOpenGacha?.();
                  onClose();
                }}
                className="p-2.5 rounded-xl bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950 border border-amber-500/30 hover:border-amber-400 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all cursor-pointer group active:scale-[0.98] flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 group-hover:scale-110 transition-transform">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-tech font-bold text-slate-200 group-hover:text-amber-200 flex items-center gap-1">
                        球探转会盲盒
                        <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                        抽调潜力路人王与传奇外援合同
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-tech px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30 shrink-0">
                    转会球探
                  </span>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[9px] font-tech text-slate-400">
                  <span className="text-amber-400">极品SSR选手加盟</span>
                  <span className="text-slate-500">签约试训 →</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: 商业经纪与公关运营 (Call Agent & Social) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-tech font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3 h-3" />
                经纪代言与公关网络 · AGENCY
              </span>
              <span className="text-[9px] text-slate-500 font-tech">
                声望: {stats.fame}点
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Task 3A: 联络选手经纪人 (Call Agent) */}
              <div
                onClick={() => {
                  soundEngine.playClick();
                  onOpenAgency?.();
                  onClose();
                }}
                className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 hover:border-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all cursor-pointer group active:scale-[0.98] flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 group-hover:scale-110 transition-transform">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-tech font-bold text-slate-200 group-hover:text-emerald-200 flex items-center gap-1">
                        联络专属经纪人
                        <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                        赞助商商业代言洽谈与新人招募
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-tech px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 shrink-0">
                    商业运作
                  </span>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[9px] font-tech text-slate-400">
                  <span className="text-emerald-400">解锁被动薪资提成</span>
                  <span className="text-slate-500">呼叫经纪公司 →</span>
                </div>
              </div>

              {/* Task 3B: 粉丝社区与公关舆论 (Social Feed / Community) */}
              <div
                onClick={() => {
                  soundEngine.playClick();
                  if (currentPhase === 3) {
                    onOpenCommunityRelations?.();
                  } else {
                    onOpenSocialFeed?.();
                  }
                  onClose();
                }}
                className="p-2.5 rounded-xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 hover:border-emerald-400/60 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all cursor-pointer group active:scale-[0.98] flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 group-hover:scale-110 transition-transform">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-tech font-bold text-slate-200 group-hover:text-emerald-200 flex items-center gap-1">
                        社区公关与粉丝团
                        <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                        赛后舆论风向调控与粉丝应援团
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-tech px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                    热搜互动
                  </span>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[9px] font-tech text-slate-400">
                  <span className="text-emerald-300">防范网络节奏红温</span>
                  <span className="text-slate-500">查看热搜 →</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: 医疗理疗与高分直播 (Health & Streaming) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-tech font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <HeartPulse className="w-3 h-3" />
                理疗康复与试训运营 · OPERATIONS
              </span>
              <span className="text-[9px] text-slate-500 font-tech">
                肌肉劳损负荷: {stats.careerHealth?.strain ?? 0}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Task 4A: 特约理疗医师 (Physio) */}
              <div
                onClick={() => {
                  soundEngine.playClick();
                  onOpenPhysio?.();
                  onClose();
                }}
                className="p-2.5 rounded-xl bg-gradient-to-br from-rose-950/30 via-slate-900 to-slate-950 border border-rose-500/30 hover:border-rose-400 hover:shadow-[0_0_15px_rgba(244,63,94,0.2)] transition-all cursor-pointer group active:scale-[0.98] flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 group-hover:scale-110 transition-transform">
                      <HeartPulse className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-tech font-bold text-slate-200 group-hover:text-rose-200 flex items-center gap-1">
                        特约理疗医师会诊
                        <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                        排查腱鞘劳损 RSI，放松肌肉张力
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-tech px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/30 shrink-0">
                    伤病预防
                  </span>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[9px] font-tech text-slate-400">
                  <span className="text-rose-400">恢复手速上限与微操</span>
                  <span className="text-slate-500">前往理疗室 →</span>
                </div>
              </div>

              {/* Task 4B: 开启深夜试训直播 (Bootcamp Stream - Direct Execution) */}
              <div
                onClick={() => {
                  if (!canStream) return;
                  soundEngine.playClick();
                  onStream?.();
                }}
                className={`p-2.5 rounded-xl border transition-all select-none flex flex-col justify-between ${
                  canStream
                    ? 'bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border-purple-500/30 hover:border-purple-400 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] cursor-pointer group active:scale-[0.98]'
                    : 'bg-slate-900/40 border-slate-800/60 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 group-hover:scale-110 transition-transform">
                      <Radio className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-tech font-bold text-slate-200 group-hover:text-purple-200">
                        深夜试训直播
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                        开启高分对局直播，聚拢水友关注
                      </div>
                    </div>
                  </div>
                  <span className={`text-[9px] font-tech px-1.5 py-0.5 rounded border shrink-0 ${
                    canStream
                      ? 'bg-purple-950 text-purple-300 border-purple-500/30'
                      : 'bg-rose-950 text-rose-300 border-rose-500/30'
                  }`}>
                    {canStream ? '⚡ 即时开播' : '精力不足'}
                  </span>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[9px] font-tech text-slate-400">
                  <span className="text-purple-400 font-bold">获取打赏与关注流</span>
                  <span>消耗: 20精力/专注</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Quick Collapse Strip */}
        <div className="p-2 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs font-tech shrink-0">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] px-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>主舞台就绪 · 点击背景或下方按钮随时收起</span>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 text-[10px] font-tech font-bold transition flex items-center gap-1 cursor-pointer border border-slate-700/80"
          >
            <ChevronDown className="w-3.5 h-3.5" />
            <span>收起行动舱</span>
          </button>
        </div>

      </div>
    </div>
  );
};
