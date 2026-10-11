import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  Brain, 
  Sparkles, 
  CheckCircle2, 
  RotateCcw, 
  Clock, 
  Target, 
  ShieldAlert, 
  Users, 
  Activity,
  Flame,
  Award,
  TrendingUp,
  X,
  Play
} from 'lucide-react';
import { DynastyState } from '../../types/game';
import { soundEngine } from '../../utils/audio';

interface DailyTacticalDrillModalProps {
  isOpen: boolean;
  onClose: () => void;
  dynasty: DynastyState;
  onUpdateDynasty: React.Dispatch<React.SetStateAction<DynastyState>>;
  onAddLog?: (msg: string, type: 'win' | 'loss' | 'event' | 'gear') => void;
}

type DrillStep = 'INTRO' | 'PREPARE' | 'ACTIVE' | 'FEEDBACK' | 'RESULT';

interface CognitiveRound {
  id: number;
  promptText: string;
  targetKey: 'RED' | 'BLUE' | 'GREEN';
  targetColor: string;
  targetLabel: string;
  distractorText?: string;
  tacticalScenario: string;
}

const COGNITIVE_ROUNDS: CognitiveRound[] = [
  {
    id: 1,
    promptText: '敏捷视野点亮信号 (Ward Detection)',
    targetKey: 'BLUE',
    targetColor: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-cyan-300',
    targetLabel: '中路河道排眼 (扫清视野盲区)',
    tacticalScenario: '敌方打野动向不明，下路河道眼位即将消失！0.5秒内锁定真眼落点！'
  },
  {
    id: 2,
    promptText: '越塔警报反蹲决策 (Dive Response)',
    targetKey: 'RED',
    targetColor: 'bg-rose-500 hover:bg-rose-400 text-white border-rose-300',
    targetLabel: '全军传送协防 (防反打斩断包夹)',
    tacticalScenario: '敌方四人聚集上路准备越塔！必须在技能亮起刹那启动反蹲协防！'
  },
  {
    id: 3,
    promptText: '大龙坑视野突袭秒表 (Baron Smite Pacing)',
    targetKey: 'GREEN',
    targetColor: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-300',
    targetLabel: '极限惩戒拼惩 (1200血秒下惩戒)',
    tacticalScenario: '大龙血量瞬间跌入惩戒斩杀线！捕捉瞬间毫秒空隙完成击杀！'
  }
];

export const DailyTacticalDrillModal: React.FC<DailyTacticalDrillModalProps> = ({
  isOpen,
  onClose,
  dynasty,
  onUpdateDynasty,
  onAddLog
}) => {
  const [step, setStep] = useState<DrillStep>('INTRO');
  const [currentRoundIdx, setCurrentRoundIdx] = useState<number>(0);
  const [roundReactionTimes, setRoundReactionTimes] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [delayCountdown, setDelayCountdown] = useState<number>(3);
  const [shuffledOptions, setShuffledOptions] = useState<('RED' | 'BLUE' | 'GREEN')[]>(['RED', 'BLUE', 'GREEN']);
  const [isFailedClick, setIsFailedClick] = useState<boolean>(false);
  const [drillCompletedRecently, setDrillCompletedRecently] = useState<boolean>(false);

  const activeDrillState = dynasty.dailyTacticalDrill;
  const isBuffAlreadyActive = activeDrillState?.isBuffActive;

  useEffect(() => {
    if (isOpen) {
      setStep('INTRO');
      setCurrentRoundIdx(0);
      setRoundReactionTimes([]);
      setIsFailedClick(false);
      setDrillCompletedRecently(false);
    }
  }, [isOpen]);

  const activeRound = COGNITIVE_ROUNDS[currentRoundIdx];

  // Start prepare countdown before active reaction trigger
  const handleStartDrill = () => {
    soundEngine.playClick();
    setStep('PREPARE');
    setDelayCountdown(3);
    setRoundReactionTimes([]);
    setCurrentRoundIdx(0);

    const timer = setInterval(() => {
      setDelayCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          triggerActiveRound(0);
          return 0;
        }
        soundEngine.playClick();
        return prev - 1;
      });
    }, 800);
  };

  const triggerActiveRound = (roundIdx: number) => {
    setCurrentRoundIdx(roundIdx);
    // Shuffle options so buttons aren't always in the same order
    const options: ('RED' | 'BLUE' | 'GREEN')[] = ['RED', 'BLUE', 'GREEN'];
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    setShuffledOptions(options);

    // Random jitter delay between 600ms and 1500ms before user can react
    const jitter = Math.floor(Math.random() * 900) + 600;
    setTimeout(() => {
      setStep('ACTIVE');
      setStartTime(Date.now());
      soundEngine.playLevelUp();
    }, jitter);
  };

  const handleOptionClick = (chosenKey: 'RED' | 'BLUE' | 'GREEN') => {
    if (step !== 'ACTIVE') return;
    const elapsed = Date.now() - startTime;

    if (chosenKey === activeRound.targetKey) {
      soundEngine.playVictory();
      const updatedTimes = [...roundReactionTimes, elapsed];
      setRoundReactionTimes(updatedTimes);

      if (currentRoundIdx + 1 < COGNITIVE_ROUNDS.length) {
        setStep('FEEDBACK');
        setTimeout(() => {
          triggerActiveRound(currentRoundIdx + 1);
        }, 900);
      } else {
        // Complete all rounds!
        finishDrill(updatedTimes);
      }
    } else {
      // Penalty miss
      soundEngine.playDefeat();
      setIsFailedClick(true);
      setTimeout(() => setIsFailedClick(false), 800);
      const updatedTimes = [...roundReactionTimes, elapsed + 400]; // 400ms penalty
      setRoundReactionTimes(updatedTimes);

      if (currentRoundIdx + 1 < COGNITIVE_ROUNDS.length) {
        setStep('FEEDBACK');
        setTimeout(() => {
          triggerActiveRound(currentRoundIdx + 1);
        }, 900);
      } else {
        finishDrill(updatedTimes);
      }
    }
  };

  const finishDrill = (times: number[]) => {
    const avgTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    setStep('RESULT');
    setDrillCompletedRecently(true);

    // Apply +5% Macro buff to all roster members for the next match day
    onUpdateDynasty(prev => {
      const updatedRoster = prev.roster.map(player => {
        const currentMacro = player.macro || 88;
        const buffAmount = Math.max(1, Math.round(currentMacro * 0.05)); // +5%
        return {
          ...player,
          macro: Math.min(100, currentMacro + buffAmount),
          trainingBoost: {
            stat: 'macro' as const,
            boostAmount: buffAmount,
            daysRemaining: 1 // next match day
          }
        };
      });

      return {
        ...prev,
        roster: updatedRoster,
        dailyTacticalDrill: {
          lastCompletedDate: new Date().toLocaleDateString('zh-CN'),
          isBuffActive: true,
          macroBuffPercent: 5,
          bestReactionTimeMs: avgTime,
          completedCount: (prev.dailyTacticalDrill?.completedCount || 0) + 1
        }
      };
    });

    if (onAddLog) {
      onAddLog(`⚡【每日战术特训完成】平均脑力反应时 ${avgTime}ms！首发全员已激活「+5% 大局观运营增益」(持续至下个比赛日)！`, 'win');
    }
  };

  if (!isOpen) return null;

  const avgReactionTime = roundReactionTimes.length > 0 
    ? Math.round(roundReactionTimes.reduce((a, b) => a + b, 0) / roundReactionTimes.length)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg flex flex-col bg-[#0b0f19] border-2 border-amber-500/50 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-amber-500/20 bg-[#101422] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-sm">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black font-tech text-amber-300">
                  每日战术脑力特训 (Daily Tactical Drill)
                </h3>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold font-mono">
                  Phase 3
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans">
                短平快认知反应测验 · 达标即刻点亮全员「+5% 大局观 Macro 专属比赛日增益」
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Buff Banner Status */}
        <div className="p-2.5 px-4 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border-b border-amber-500/20 flex items-center justify-between text-xs font-tech">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-slate-300">首发阵容战术 Buff 状态:</span>
            {isBuffAlreadyActive || drillCompletedRecently ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1 font-code">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>+5% Macro 大局观增益已激活 (生效中)</span>
              </span>
            ) : (
              <span className="text-amber-400 font-code font-bold">
                今日未演练 · 建议赛前快速完成测试激活
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4">

          {/* STEP 1: INTRO */}
          {step === 'INTRO' && (
            <div className="space-y-4 text-center py-2">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                <Zap className="w-8 h-8 animate-pulse" />
              </div>

              <div>
                <h4 className="text-base font-black text-white font-tech">
                  职业战术认知反应压制 (Cognitive Reaction Test)
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                  共计 <span className="text-amber-300 font-bold">3 轮</span> 战术场景快问快答。当目标指令与战术信号亮起时，在极短毫秒内准确敲击对应决策，淬炼选手的赛场宏观敏锐度！
                </p>
              </div>

              {/* Roster members buff preview */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-left">
                <div className="text-[10px] text-slate-400 font-tech uppercase mb-1.5 flex items-center justify-between">
                  <span>首发阵容收益队员 ({dynasty.roster.length}人受惠)</span>
                  <span className="text-emerald-400 font-code font-bold">+5% Macro 大局观</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {dynasty.roster.map(player => (
                    <span 
                      key={player.id} 
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1"
                    >
                      <span>{player.avatar}</span>
                      <span className="font-bold">{player.name}</span>
                      <span className="text-cyan-400 font-code">({player.role})</span>
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={handleStartDrill}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-tech font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>立即开始 30 秒每日认知反应特训</span>
              </button>
            </div>
          )}

          {/* STEP 2: PREPARE (COUNTDOWN) */}
          {step === 'PREPARE' && (
            <div className="py-12 text-center space-y-4">
              <span className="text-xs font-tech text-amber-400 tracking-widest uppercase">
                准备屏息集中注意力 · 保持手指在屏幕上方
              </span>
              <div className="text-6xl font-black font-code text-white animate-bounce">
                {delayCountdown > 0 ? delayCountdown : 'READY!'}
              </div>
              <p className="text-xs text-slate-400">
                第 1 轮 即将展开：观察战术需求，指令出现瞬间精准点击！
              </p>
            </div>
          )}

          {/* STEP 3: ACTIVE & FEEDBACK */}
          {(step === 'ACTIVE' || step === 'FEEDBACK') && activeRound && (
            <div className="space-y-4 py-2">
              {/* Progress counter */}
              <div className="flex items-center justify-between text-xs font-tech">
                <span className="text-slate-400">
                  当前轮次: <span className="text-amber-400 font-bold">{currentRoundIdx + 1} / 3</span>
                </span>
                <span className="text-cyan-400 font-code">
                  {roundReactionTimes.length > 0 ? `上一轮反应: ${roundReactionTimes[roundReactionTimes.length - 1]}ms` : '等待击发'}
                </span>
              </div>

              {/* Tactical Situation Box */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-cyan-500/40 text-center space-y-2 relative overflow-hidden">
                <div className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                  ⚠️ 突发局势 · {activeRound.promptText}
                </div>
                <div className="text-base font-black text-white font-sans">
                  {activeRound.tacticalScenario}
                </div>
                <div className="inline-block mt-1 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-xs font-bold font-tech animate-pulse">
                  🎯 目标指令: {activeRound.targetLabel}
                </div>
              </div>

              {/* Shuffled Action Buttons */}
              <div className="space-y-2">
                <div className="text-[10px] text-slate-400 text-center font-tech uppercase">
                  请极速轻触正确应对决策 (秒差即战局胜负)
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {shuffledOptions.map(optKey => {
                    const isTarget = optKey === activeRound.targetKey;
                    let label = isTarget 
                      ? activeRound.targetLabel 
                      : optKey === 'RED' 
                        ? '无脑开团硬冲 (脱节冒进)' 
                        : optKey === 'BLUE' 
                          ? '原地犹豫回城 (错失主动)' 
                          : '单带拆塔放弃龙坑 (丢掉龙魂)';
                    
                    let bgClasses = optKey === 'RED'
                      ? 'border-rose-500/40 bg-rose-950/30 hover:bg-rose-900/50 text-rose-200'
                      : optKey === 'BLUE'
                        ? 'border-cyan-500/40 bg-cyan-950/30 hover:bg-cyan-900/50 text-cyan-200'
                        : 'border-emerald-500/40 bg-emerald-950/30 hover:bg-emerald-900/50 text-emerald-200';

                    return (
                      <button
                        key={optKey}
                        onClick={() => handleOptionClick(optKey)}
                        disabled={step === 'FEEDBACK'}
                        className={`w-full p-3 rounded-xl border text-left font-tech font-bold text-xs transition cursor-pointer flex items-center justify-between ${bgClasses} active:scale-98`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-current animate-ping" />
                          <span>{label}</span>
                        </div>
                        <span className="text-[10px] opacity-75 font-mono">
                          {isTarget ? '【战术最优解】' : '【误判险棋】'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {step === 'FEEDBACK' && (
                <div className="text-center text-xs font-bold font-tech text-emerald-400 animate-pulse">
                  ✅ 识别正确！正在进入下一轮临场推演...
                </div>
              )}
            </div>
          )}

          {/* STEP 4: RESULT */}
          {step === 'RESULT' && (
            <div className="space-y-4 text-center py-2">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-base font-black text-white font-tech">
                  特训考核圆满完成！
                </h4>
                <p className="text-xs text-emerald-400 font-mono mt-0.5">
                  综合认知反应时: <span className="text-base font-black font-code">{avgReactionTime} ms</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-emerald-950/40 border border-emerald-500/40 text-left space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5 font-tech">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    已激活战队宏观被动 (Passive Buff)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-code font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    +5% Macro Buff
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  俱乐部全部 5 名主力选手的大局观 (Macro) 属性已提升 +5%，战术兵线运营与转线团战执行力全面强化，效果持续至下一场正式比赛！
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-tech font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-md"
              >
                确认并返回战队基地
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
