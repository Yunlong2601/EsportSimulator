import React, { useState } from 'react';
import { PlayerStats, SoloQueueEvent, DailyChallenge, LoginStreakState } from '../../types/game';
import { SOLO_QUEUE_EVENTS } from '../../data/soloQueueEvents';
import { DailyChallengesCard } from '../DailyChallengesCard';
import { DailyLoginStreakCard } from '../DailyLoginStreakCard';
import { 
  Gamepad2, 
  Brain, 
  Heart, 
  Battery, 
  Tv, 
  Coffee, 
  ShoppingBag, 
  TrendingUp, 
  Activity, 
  Flame, 
  Radio, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  MessageSquare,
  Trophy,
  Gift,
  Maximize2,
  X,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { soundEngine } from '../../utils/audio';

interface PhaseOneProps {
  stats: PlayerStats;
  logs: { id: string; timestamp: string; message: string; type: 'win' | 'loss' | 'event' | 'gear' }[];
  dailyChallenges: DailyChallenge[];
  onClaimChallenge: (id: string) => void;
  loginStreak: LoginStreakState;
  onClaimLoginStreak: () => void;
  onEquipSkin: (skinId: string) => void;
  onApplyDelta: (delta: {
    lp?: number;
    mechanics?: number;
    mental?: number;
    energy?: number;
    money?: number;
    fame?: number;
    isWin?: boolean;
    isLoss?: boolean;
  }) => void;
  onAddLog: (message: string, type: 'win' | 'loss' | 'event' | 'gear') => void;
  onWatchReplays: () => void;
  onStream: () => void;
  onRest: () => void;
  onProceedToPro: () => void;
  onStartReflexDuel: () => void;
  onOpenSocialFeed: () => void;
  onOpenHardware: () => void;
  onOpenLeaderboard: () => void;
}

export const PhaseOneAmateur: React.FC<PhaseOneProps> = ({
  stats,
  logs,
  dailyChallenges,
  onClaimChallenge,
  loginStreak,
  onClaimLoginStreak,
  onEquipSkin,
  onApplyDelta,
  onAddLog,
  onWatchReplays,
  onStream,
  onRest,
  onProceedToPro,
  onStartReflexDuel,
  onOpenSocialFeed,
  onOpenHardware,
  onOpenLeaderboard
}) => {
  const [activeEvent, setActiveEvent] = useState<SoloQueueEvent | null>(null);

  // Expand / Collapse accordions state (default collapsed to eliminate scroll chore)
  const [isStreakExpanded, setIsStreakExpanded] = useState<boolean>(false);
  const [isChallengesExpanded, setIsChallengesExpanded] = useState<boolean>(false);
  const [isLogsExpanded, setIsLogsExpanded] = useState<boolean>(false);

  // Pop-up overlay modals state
  const [showStreakModal, setShowStreakModal] = useState<boolean>(false);
  const [showChallengesModal, setShowChallengesModal] = useState<boolean>(false);
  const [showLogsModal, setShowLogsModal] = useState<boolean>(false);

  const completedChallengesCount = dailyChallenges.filter(c => c.claimed).length;
  const latestLog = logs[0];

  // Trigger a Solo Queue Match or Event
  const startRankedMatch = () => {
    if (stats.energy < 20) {
      onAddLog('⚠️ 疲劳警告！你的体力透支，无法保持高强度单排专注。请先休息或睡眠补充精力。', 'event');
      return;
    }

    soundEngine.playClick();

    // 60% chance of random scenario encounter, 40% chance of direct simulated match
    if (Math.random() > 0.35) {
      const randomEvent = SOLO_QUEUE_EVENTS[Math.floor(Math.random() * SOLO_QUEUE_EVENTS.length)];
      setActiveEvent(randomEvent);
    } else {
      const winProbability = 0.45 + (stats.mechanics / 250) + (stats.mental / 350);
      const isWin = Math.random() < winProbability;
      const lpChange = isWin ? Math.floor(22 + Math.random() * 8) : -Math.floor(16 + Math.random() * 6);

      onApplyDelta({
        lp: lpChange,
        energy: -20,
        mechanics: isWin ? 1 : 1,
        mental: isWin ? 3 : -5,
        fame: isWin ? 2 : 0,
        isWin,
        isLoss: !isWin
      });

      if (isWin) {
        onAddLog(`🏆 排位大胜！28分钟对局节奏掌控，豪取 MVP (+${lpChange} LP)。`, 'win');
      } else {
        onAddLog(`💀 排位惜败！关键远古龙团失利，遗憾告负 (${lpChange} LP)。`, 'loss');
      }
    }
  };

  const handleResolveEvent = (choiceIndex: number) => {
    if (!activeEvent) return;
    const choice = activeEvent.options[choiceIndex];
    const outcome = choice.execute(stats);

    soundEngine.playClick();
    if (outcome.success) {
      soundEngine.playVictory();
    }

    onApplyDelta({
      lp: outcome.lpDelta,
      mechanics: outcome.mechanicsDelta,
      mental: outcome.mentalDelta,
      fame: outcome.fameDelta,
      money: outcome.moneyDelta,
      energy: -20,
      isWin: outcome.success,
      isLoss: !outcome.success
    });

    onAddLog(outcome.log, outcome.success ? 'win' : 'loss');
    setActiveEvent(null);
  };

  const lpProgressToPro = Math.min(100, Math.floor((stats.lp / 1000) * 100));

  return (
    <div className="space-y-3 pb-6">
      {/* 1. Header Rank Progression & Compact Quick Actions */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30 border border-slate-800 shadow-lg space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-tech font-bold uppercase tracking-wider text-cyan-400">
                第一阶段 · 业余排位冲刺
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                目标: 1,000 LP
              </span>
            </div>
            <h3 className="font-tech font-extrabold text-base text-white mt-0.5">
              从出租屋单排到职业战队球探发掘
            </h3>
          </div>

          {stats.lp >= 1000 && (
            <button
              onClick={() => {
                soundEngine.playVictory();
                onProceedToPro();
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-tech font-extrabold text-xs shadow-lg shadow-amber-500/30 animate-pulse cursor-pointer shrink-0"
            >
              👑 签约职业合同 →
            </button>
          )}
        </div>

        {/* 1,000 LP Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] font-code">
            <span className="text-slate-400">冲刺职业联赛门槛 (1,000 LP 王者):</span>
            <span className="text-cyan-300 font-bold">{stats.lp} / 1000 LP ({lpProgressToPro}%)</span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/80">
            <div
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-amber-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${lpProgressToPro}%` }}
            />
          </div>
        </div>

        {/* Status Bar Ticker */}
        <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] font-code flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>实时天梯: 🔥 连胜 {stats.winStreak} 场</span>
          </div>
          <div className="text-slate-300 text-[10px]">
            中单 (MID) · <span className="text-cyan-300 font-bold">{stats.wins}胜 {stats.losses}负</span>
          </div>
        </div>
      </div>

      {/* 2. Core Playable Loop: Primary Action Button & Training */}
      {activeEvent ? (
        /* Event Encounter Card */
        <div className="p-4 rounded-xl bg-slate-900 border-2 border-cyan-500/60 shadow-xl space-y-3 chamfer-card animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-[10px] font-tech font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              {activeEvent.contextTag}
            </span>
            <span className="text-[10px] text-slate-400 font-tech">排位突发遭遇事件</span>
          </div>

          <h4 className="font-tech font-bold text-white text-base leading-snug">
            {activeEvent.title}
          </h4>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            {activeEvent.scenario}
          </p>

          <div className="space-y-2 pt-1">
            <div className="text-[10px] font-tech font-bold text-slate-400 uppercase tracking-wider">
              抉择你的战术应对：
            </div>
            {activeEvent.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleResolveEvent(idx)}
                className="w-full text-left p-3 rounded-xl border border-slate-700 hover:border-cyan-400 bg-slate-800/90 active:bg-slate-800 transition cursor-pointer"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-tech font-bold text-white text-xs">
                    {opt.label}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase font-tech ${
                      opt.risk === 'High'
                        ? 'bg-rose-500/20 text-rose-300'
                        : opt.risk === 'Medium'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {opt.risk === 'High' ? '极高风险' : opt.risk === 'Medium' ? '中等风险' : '低风险'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {opt.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Primary Thumb Actions (Mobile-First 4 Big Buttons) */
        <div className="space-y-2">
          {/* Main Action Button: Ranked Match */}
          <button
            onClick={startRankedMatch}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 active:scale-98 text-slate-950 font-tech font-extrabold text-base tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 cursor-pointer transition chamfer-btn hover:brightness-110"
          >
            <Gamepad2 className="w-5 h-5 fill-current" />
            <span>开启单双排冲分 (-20 体力)</span>
          </button>

          {/* Secondary Actions in 3-Button Grid */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={onWatchReplays}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 active:bg-slate-800 flex flex-col items-center justify-center text-center cursor-pointer transition hover:border-cyan-500/50"
            >
              <TrendingUp className="w-4 h-4 text-cyan-400 mb-1" />
              <span className="text-[11px] font-tech font-bold text-white leading-none">对战复盘</span>
              <span className="text-[9px] text-slate-400 font-sans mt-0.5">-15 体力</span>
            </button>

            <button
              onClick={onStream}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 active:bg-slate-800 flex flex-col items-center justify-center text-center cursor-pointer transition hover:border-purple-500/50"
            >
              <Tv className="w-4 h-4 text-purple-400 mb-1" />
              <span className="text-[11px] font-tech font-bold text-white leading-none">直播集训</span>
              <span className="text-[9px] text-slate-400 font-sans mt-0.5">+战备金 / 知名度</span>
            </button>

            <button
              onClick={onRest}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 active:bg-slate-800 flex flex-col items-center justify-center text-center cursor-pointer transition hover:border-emerald-500/50"
            >
              <Coffee className="w-4 h-4 text-emerald-400 mb-1" />
              <span className="text-[11px] font-tech font-bold text-white leading-none">休整睡眠</span>
              <span className="text-[9px] text-slate-400 font-sans mt-0.5">+45 体力</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Compact Collapsible Modules with Expand/Collapse & Pop-up Overlay Buttons */}
      <div className="space-y-2 pt-1">
        {/* Module A: 7-Day Login Streak System */}
        <div className="rounded-xl bg-slate-900/90 border border-amber-500/30 overflow-hidden shadow-sm transition">
          <div className="px-3 py-2 flex items-center justify-between text-xs font-tech bg-slate-900/80">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400 fill-current" />
              <span className="font-bold text-white">7日签到</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-code font-bold">
                第 {loginStreak.currentStreak}/7 天
              </span>
              {loginStreak.canClaimToday ? (
                <span className="text-[10px] text-emerald-400 font-bold animate-pulse">
                  🎁 今日待领
                </span>
              ) : (
                <span className="text-[10px] text-slate-500">
                  ✓ 今日已领
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {loginStreak.canClaimToday && !isStreakExpanded && (
                <button
                  onClick={onClaimLoginStreak}
                  className="px-2 py-0.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-tech font-bold text-[10px] transition cursor-pointer shadow-sm"
                >
                  一键领奖
                </button>
              )}
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowStreakModal(true);
                }}
                className="p-1 rounded text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition cursor-pointer"
                title="打开7日签到全屏浮层"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setIsStreakExpanded(!isStreakExpanded);
                }}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center gap-0.5 text-[10px]"
                title={isStreakExpanded ? '折叠' : '展开'}
              >
                {isStreakExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isStreakExpanded && (
            <div className="p-3 pt-0 border-t border-slate-800/80 animate-fadeIn">
              <DailyLoginStreakCard
                loginStreak={loginStreak}
                onClaim={onClaimLoginStreak}
                onEquipSkin={onEquipSkin}
              />
            </div>
          )}
        </div>

        {/* Module B: Daily Challenges Card */}
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-sm transition">
          <div className="px-3 py-2 flex items-center justify-between text-xs font-tech bg-slate-900/80">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white">每日排位目标</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-code font-bold">
                {completedChallengesCount}/{dailyChallenges.length} 已达成
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowChallengesModal(true);
                }}
                className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition cursor-pointer"
                title="打开每日目标排位浮层"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setIsChallengesExpanded(!isChallengesExpanded);
                }}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center gap-0.5 text-[10px]"
                title={isChallengesExpanded ? '折叠' : '展开'}
              >
                {isChallengesExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isChallengesExpanded && (
            <div className="p-3 pt-0 border-t border-slate-800/80 animate-fadeIn">
              <DailyChallengesCard
                challenges={dailyChallenges}
                onClaim={onClaimChallenge}
              />
            </div>
          )}
        </div>

        {/* Module C: Career Match Logs */}
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-sm transition">
          <div className="px-3 py-2 flex items-center justify-between text-xs font-tech bg-slate-900/80">
            <div className="flex items-center gap-2 overflow-hidden">
              <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-bold text-white shrink-0">排位战报</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-code shrink-0">
                {logs.length} 条
              </span>
              {latestLog && !isLogsExpanded && (
                <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                  {latestLog.message}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowLogsModal(true);
                }}
                className="p-1 rounded text-slate-400 hover:text-emerald-300 hover:bg-slate-800 transition cursor-pointer"
                title="打开历史日志全屏浮层"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setIsLogsExpanded(!isLogsExpanded);
                }}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center gap-0.5 text-[10px]"
                title={isLogsExpanded ? '折叠' : '展开'}
              >
                {isLogsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isLogsExpanded && (
            <div className="p-2.5 pt-0 border-t border-slate-800/80 space-y-1.5 max-h-48 overflow-y-auto font-sans text-[11px] animate-fadeIn">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-2 rounded-lg border text-[11px] leading-snug ${
                    log.type === 'win'
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                      : log.type === 'loss'
                      ? 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                      : log.type === 'gear'
                      ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex justify-between text-[9px] text-slate-400 font-code mb-0.5">
                    <span>{log.timestamp}</span>
                    <span className="uppercase font-semibold">
                      {log.type === 'win' ? '胜利' : log.type === 'loss' ? '战败' : log.type === 'gear' ? '外设' : '事件'}
                    </span>
                  </div>
                  <div>{log.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* POP-UP OVERLAY MODALS (Accessible via the Maximize buttons) */}
      {/* ========================================================================= */}

      {/* Streak Pop-up Overlay Modal */}
      {showStreakModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-slate-950 border border-amber-500/40 rounded-2xl p-4 shadow-2xl space-y-3 relative">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400 fill-current" />
                <h3 className="font-tech font-bold text-amber-300 text-sm">
                  每日连续签到 · 专属浮层
                </h3>
              </div>
              <button
                onClick={() => setShowStreakModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <DailyLoginStreakCard
              loginStreak={loginStreak}
              onClaim={onClaimLoginStreak}
              onEquipSkin={onEquipSkin}
            />
          </div>
        </div>
      )}

      {/* Challenges Pop-up Overlay Modal */}
      {showChallengesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-slate-950 border border-cyan-500/40 rounded-2xl p-4 shadow-2xl space-y-3 relative">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-cyan-400" />
                <h3 className="font-tech font-bold text-cyan-300 text-sm">
                  每日排位目标挑战 · 专属浮层
                </h3>
              </div>
              <button
                onClick={() => setShowChallengesModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <DailyChallengesCard
              challenges={dailyChallenges}
              onClaim={onClaimChallenge}
            />
          </div>
        </div>
      )}

      {/* Logs Pop-up Overlay Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md max-h-[85vh] flex flex-col bg-slate-950 border border-slate-700 rounded-2xl p-4 shadow-2xl space-y-3 relative">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <h3 className="font-tech font-bold text-white text-sm">
                  排位生涯历史战报 ({logs.length}条)
                </h3>
              </div>
              <button
                onClick={() => setShowLogsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-2.5 rounded-xl border text-xs leading-snug ${
                    log.type === 'win'
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                      : log.type === 'loss'
                      ? 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                      : log.type === 'gear'
                      ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex justify-between text-[10px] text-slate-400 font-code mb-1">
                    <span>{log.timestamp}</span>
                    <span className="uppercase font-semibold">
                      {log.type === 'win' ? '胜利' : log.type === 'loss' ? '战败' : log.type === 'gear' ? '外设' : '事件'}
                    </span>
                  </div>
                  <div>{log.message}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
