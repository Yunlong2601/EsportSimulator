import React, { useState } from 'react';
import { 
  Swords, 
  Zap, 
  Skull, 
  Shield, 
  AlertOctagon, 
  X, 
  Trophy, 
  MessageSquare, 
  Radio,
  Target,
  Sparkles,
  CheckCircle2,
  Lock,
  ChevronRight,
  RotateCcw,
  Flame,
  Award,
  Layers,
  Calendar,
  TrendingUp,
  BarChart2,
  RefreshCw
} from 'lucide-react';
import { soundEngine } from '../../utils/audio';
import { TacticalBpPuzzle, TacticalBpSlot, DraftAdvantageBonus, PlayerStats, MetaDraftStrategyModifier, MetaTier } from '../../types/game';
import { TACTICAL_BP_DRILL_PUZZLES, CANDIDATE_BP_CHAMPIONS } from '../../data/tacticalBpDrillData';
import { 
  getWeeklyMetaTrend, 
  getChampionMetaTier, 
  calculateMetaDraftAdvantage, 
  WEEKLY_META_PATCH_CONFIGS 
} from '../../data/tacticalMetaTrendData';

import { GLOBAL_POWER_RANKINGS_TEAMS } from '../../data/globalPowerRankingsData';
import { Bot, Lightbulb, Compass, Filter, AlertTriangle } from 'lucide-react';

interface TacticalArenaModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerStats?: PlayerStats;
  onApplyDelta?: (delta: any) => void;
  onAddLog?: (msg: string, type: 'win' | 'loss' | 'gear' | 'event') => void;
  onApplyDraftAdvantage?: (bonus: DraftAdvantageBonus) => void;
}

export const TacticalArenaModal: React.FC<TacticalArenaModalProps> = ({
  isOpen,
  onClose,
  playerStats,
  onApplyDelta,
  onAddLog,
  onApplyDraftAdvantage
}) => {
  // Navigation tabs: 'weekly_meta' (每周版本风向) | 'tactical_drill' (BP博弈特训) | 'ai_analyst' (AI BP分析师) | 'baron_clutch' (男爵决胜时刻)
  const [activeTab, setActiveTab] = useState<'weekly_meta' | 'baron_clutch' | 'tactical_drill' | 'ai_analyst'>('weekly_meta');
  const [analystOpponentId, setAnalystOpponentId] = useState<string>('t1');
  const [analystRoleFilter, setAnalystRoleFilter] = useState<'ALL' | 'TOP' | 'JUG' | 'MID' | 'ADC' | 'SUP'>('ALL');
  const [adoptedPlanNotice, setAdoptedPlanNotice] = useState<string | null>(null);

  // --- Weekly Meta Trend State ---
  const [metaCycleOffset, setMetaCycleOffset] = useState<number>(0);
  const [metaRoleFilter, setMetaRoleFilter] = useState<'ALL' | 'TOP' | 'JUG' | 'MID' | 'ADC' | 'SUP'>('ALL');
  const [adoptedMetaNotice, setAdoptedMetaNotice] = useState<string | null>(null);

  const competitiveDay = Math.max(1, Math.floor(((playerStats?.totalGames ?? 0) / 2)) + 1);
  const currentMeta = getWeeklyMetaTrend(competitiveDay, metaCycleOffset);

  // --- Baron Pit Decider State ---
  const [matchTime, setMatchTime] = useState<string>("32:15");
  const [baronHp, setBaronHp] = useState<number>(1450);
  const baronMaxHp = 12000;
  const smiteThreshold = 1200;
  const [tacticalPoints, setTacticalPoints] = useState<number>(2);
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [clutchResult, setClutchResult] = useState<{ isClutch: boolean; message: string; tag: string } | null>(null);

  // --- Tactical Drill Minigame State ---
  const [selectedPuzzleIndex, setSelectedPuzzleIndex] = useState<number>(0);
  const [currentSlotIndex, setCurrentSlotIndex] = useState<number>(0);
  // Picked champion for each slot in the active puzzle: e.g. { 0: '泰坦', 1: '霞' }
  const [slotSelections, setSlotSelections] = useState<Record<number, string>>({});
  const [slotFeedback, setSlotFeedback] = useState<Record<number, { isCorrect: boolean; feedbackMsg: string }>>({});
  const [drillCompleted, setDrillCompleted] = useState<boolean>(false);
  const [awardedBonusNotice, setAwardedBonusNotice] = useState<DraftAdvantageBonus | null>(null);

  const activePuzzle = TACTICAL_BP_DRILL_PUZZLES[selectedPuzzleIndex];
  const activeSlot = activePuzzle.slots[currentSlotIndex];

  // Baron clutch options
  const baronOptions = [
    {
      id: 1,
      title: "【中单孤勇者进场】",
      tag: "极危 // 刺客决断",
      success_rate: 72,
      cost_tp: 2,
      reward: "敌方双C位瞬间暴毙，打出 0换3 直取中路高地！",
      risk: "进场被敌方辅助秒控蒸发，全线溃败遭一波推平。"
    },
    {
      id: 2,
      title: "【拼惩戒稳拿大龙】",
      tag: "稳健 // 野区博弈",
      success_rate: 55,
      cost_tp: 1,
      reward: "打野精准惩戒收割大龙！带三路超级兵稳健推进。",
      risk: "拼惩戒失手被敌方抢龙，沦为被动守家劣势。"
    },
    {
      id: 3,
      title: "【教练紧急战术暂停】",
      tag: "暂停令 // 仅剩1次",
      success_rate: 100,
      cost_tp: 0,
      reward: "战术沟通完毕！全员操作精度提升 15%，打赢决胜团！",
      risk: "消耗本场唯一战术暂停锦囊。"
    }
  ];

  const handleExecuteBaron = (opt: typeof baronOptions[0]) => {
    if (tacticalPoints < opt.cost_tp) return;
    soundEngine.playClick();
    setIsResolving(true);
    setTacticalPoints(prev => prev - opt.cost_tp);

    setTimeout(() => {
      const roll = Math.random() * 100;
      const isClutch = roll <= opt.success_rate;

      if (isClutch) {
        soundEngine.playVictory();
        setBaronHp(0);
        if (onApplyDelta) {
          onApplyDelta({ lp: 45, mental: 10, fame: 15, isWin: true });
        }
        if (onAddLog) {
          onAddLog(`🔥 决胜时刻纳什男爵大捷: ${opt.reward} (+45 LP, +15 声望)`, 'win');
        }
      } else {
        soundEngine.playDefeat();
        if (onApplyDelta) {
          onApplyDelta({ lp: -20, mental: -8, isLoss: true });
        }
        if (onAddLog) {
          onAddLog(`💀 决胜时刻战术失误: ${opt.risk} (-20 LP)`, 'loss');
        }
      }

      setClutchResult({
        isClutch,
        message: isClutch ? opt.reward : opt.risk,
        tag: opt.title
      });
      setIsResolving(false);
    }, 700);
  };

  // --- Meta Trend Actions ---
  const handleAdoptMetaStrategy = (strategy: MetaDraftStrategyModifier) => {
    soundEngine.playLevelUp();
    const finalBonusWinRate = Math.max(5, Math.round(strategy.baseSuccessRate * 0.15 + strategy.currentModifier));
    const bonus: DraftAdvantageBonus = {
      level: strategy.currentModifier > 10 ? 3 : 2,
      title: `${strategy.strategyName} (版本T0加成)`,
      bonusWinRate: finalBonusWinRate,
      bonusMechanics: 6,
      bonusMacro: 8,
      matchesRemaining: 1,
      appliedAt: `每周版本风向 (${currentMeta.patchVersion})`
    };

    if (onApplyDraftAdvantage) {
      onApplyDraftAdvantage(bonus);
    }
    if (onAddLog) {
      onAddLog(`🔥【版本战术蓝图采纳】顺应 ${currentMeta.patchVersion} 版本风向，成功部署「${strategy.strategyName}」(+${finalBonusWinRate}% 胜率加成)！`, 'win');
    }
    setAdoptedMetaNotice(`✅ 成功采纳【${strategy.strategyName}】！下一场比赛将享受 +${finalBonusWinRate}% 胜率加成。`);
    setTimeout(() => {
      setAdoptedMetaNotice(null);
    }, 4000);
  };

  const handleSimulatePatchRotation = () => {
    soundEngine.playVictory();
    setMetaCycleOffset(prev => prev + 1);
    setAdoptedMetaNotice(`⚡【版本大更新】联盟推送了最新赛事平衡性补丁！OP 英雄与战术体系胜率已重新轮换！`);
    setTimeout(() => {
      setAdoptedMetaNotice(null);
    }, 4000);
  };

  // Select a champion candidate for the current BP Slot
  const handleSelectCandidate = (champName: string) => {
    if (drillCompleted) return;
    soundEngine.playClick();

    const isMatch = activeSlot.idealAnswers.some(ans => 
      champName.includes(ans) || ans.includes(champName)
    );

    const metaInfo = getChampionMetaTier(champName, currentMeta);
    const metaAddon = metaInfo?.tier === 'OP' 
      ? ' 🔥【T0版本之子】顺应当前版本强势期，战术威力提升！'
      : metaInfo?.tier === 'STRONG'
      ? ' ⚡【T1版本核心】稳健契合环境风向！'
      : '';

    const feedbackMsg = isMatch
      ? `【战略正解】选取 [${champName}] 完美化解敌方「${activeSlot.enemyThreat}」威胁！${metaAddon}`
      : `【博弈偏差】选取 [${champName}] 并非当前轮次最优反制解。提示: ${activeSlot.hint}`;

    const newSelections = { ...slotSelections, [currentSlotIndex]: champName };
    const newFeedback = { 
      ...slotFeedback, 
      [currentSlotIndex]: { isCorrect: isMatch, feedbackMsg } 
    };

    setSlotSelections(newSelections);
    setSlotFeedback(newFeedback);

    if (isMatch) {
      soundEngine.playLevelUp();
    } else {
      soundEngine.playDefeat();
    }

    // Check if all slots in the puzzle are now filled
    const allFilled = activePuzzle.slots.every((_, idx) => newSelections[idx] !== undefined);
    const allCorrect = activePuzzle.slots.every((_, idx) => newFeedback[idx]?.isCorrect === true);

    if (allFilled && allCorrect) {
      // Victory in this tactical drill! Calculate extra weekly meta synergy
      soundEngine.playVictory();
      setDrillCompleted(true);
      const metaAdvantage = calculateMetaDraftAdvantage(activePuzzle.id, currentMeta);
      const finalBonusWinRate = Math.max(5, activePuzzle.rewardAdvantage.bonusWinRate + metaAdvantage.bonusWinRate);
      const finalAdvantage: DraftAdvantageBonus = {
        ...activePuzzle.rewardAdvantage,
        bonusWinRate: finalBonusWinRate,
        title: `${activePuzzle.rewardAdvantage.title} (版本修正: ${metaAdvantage.bonusWinRate >= 0 ? '+' : ''}${metaAdvantage.bonusWinRate}%)`
      };
      setAwardedBonusNotice(finalAdvantage);

      if (onApplyDraftAdvantage) {
        onApplyDraftAdvantage(finalAdvantage);
      }
      if (onApplyDelta) {
        onApplyDelta({
          mechanics: activePuzzle.rewardAdvantage.bonusMechanics,
          mental: activePuzzle.rewardAdvantage.bonusMacro,
          fame: 8
        });
      }
      if (onAddLog) {
        onAddLog(`♟️【BP博弈特训大捷】成功破解《${activePuzzle.title}》！结合 ${currentMeta.patchVersion} 版本风向加持，注入「${finalAdvantage.title}」(+${finalAdvantage.bonusWinRate}% 胜率)！`, 'win');
      }
    } else if (currentSlotIndex < activePuzzle.slots.length - 1) {
      // Advance to next slot automatically after short delay if correct
      if (isMatch) {
        setTimeout(() => {
          setCurrentSlotIndex(prev => prev + 1);
        }, 600);
      }
    }
  };

  // Reset drill puzzle to try again
  const handleResetDrill = () => {
    soundEngine.playClick();
    setSlotSelections({});
    setSlotFeedback({});
    setCurrentSlotIndex(0);
    setDrillCompleted(false);
    setAwardedBonusNotice(null);
  };

  // Switch to another puzzle scenario
  const handleSwitchPuzzle = (idx: number) => {
    soundEngine.playClick();
    setSelectedPuzzleIndex(idx);
    setSlotSelections({});
    setSlotFeedback({});
    setCurrentSlotIndex(0);
    setDrillCompleted(false);
    setAwardedBonusNotice(null);
  };

  if (!isOpen) return null;

  const currentDraftAdvantage = playerStats?.draftAdvantage;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-xl max-h-[94vh] flex flex-col bg-[#0a0e17] border-2 border-cyan-500/50 rounded-2xl shadow-[0_0_60px_rgba(0,240,255,0.25)] overflow-hidden text-slate-100">
        
        {/* Top Header Bar */}
        <div className="p-3 sm:p-4 border-b border-cyan-500/20 bg-[#0f131c] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-sm">
              <Swords className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black font-tech text-[#00f0ff]">
                  战术推演竞技场 (Tactical Arena)
                </h3>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold font-mono">
                  Tactical HQ
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans">
                演练高压大龙坑决断与针对性 BP 封锁战术，为下一场正式比赛赢取压倒性「选人优势」！
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

        {/* Global Draft Advantage & Weekly Meta Status Banner */}
        <div className="p-2.5 px-3 sm:px-4 bg-gradient-to-r from-slate-950 via-cyan-950/40 to-slate-950 border-b border-cyan-500/30 flex flex-wrap items-center justify-between gap-2 text-xs font-tech">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
            <span className="text-slate-300">赛事 BP 选人优势:</span>
            {currentDraftAdvantage && currentDraftAdvantage.matchesRemaining > 0 ? (
              <span className="text-amber-300 font-bold font-code flex items-center gap-1">
                <span>{currentDraftAdvantage.title}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  +{currentDraftAdvantage.bonusWinRate}% 胜率 (剩 {currentDraftAdvantage.matchesRemaining} 场)
                </span>
              </span>
            ) : (
              <span className="text-slate-500 font-code">
                未激活 (可采纳版本蓝图或特训点亮)
              </span>
            )}
          </div>

          {/* Current Weekly Meta Patch Tag */}
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="text-slate-400">当前版本:</span>
            <span className="text-amber-300 font-bold font-mono">
              {currentMeta.patchVersion}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
              第 {currentMeta.cycleDay}/7 竞技日
            </span>
          </div>
        </div>

        {/* Top Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-[#0c1019] px-3 pt-2 gap-1.5 text-xs font-tech font-bold overflow-x-auto">
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('weekly_meta');
            }}
            className={`pb-2 px-3 flex items-center gap-1.5 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'weekly_meta'
                ? 'border-amber-400 text-amber-300 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>每周版本风向 (Weekly Meta Trend)</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
              7天轮换
            </span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('tactical_drill');
            }}
            className={`pb-2 px-3 flex items-center gap-1.5 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'tactical_drill'
                ? 'border-cyan-400 text-cyan-300 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>BP博弈特训小游戏 (Tactical Drill)</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping ml-0.5" />
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('ai_analyst');
            }}
            className={`pb-2 px-3 flex items-center gap-1.5 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'ai_analyst'
                ? 'border-purple-400 text-purple-300 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI BP 分析师 (Drafting Analyst)</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">
              Meta
            </span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('baron_clutch');
            }}
            className={`pb-2 px-3 flex items-center gap-1.5 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'baron_clutch'
                ? 'border-red-400 text-red-300 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Skull className="w-3.5 h-3.5" />
            <span>大龙坑生死战术终端 (Baron Decider)</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">

          {/* Toast / Action Notice */}
          {adoptedMetaNotice && (
            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/90 to-yellow-500/90 text-slate-950 font-tech font-bold text-xs flex items-center justify-between gap-2 shadow-[0_0_25px_rgba(245,158,11,0.5)] animate-fadeIn">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 animate-spin" />
                <span>{adoptedMetaNotice}</span>
              </div>
              <button
                onClick={() => setAdoptedMetaNotice(null)}
                className="p-1 hover:bg-slate-950/20 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ======================================================================= */}
          {/* TAB 0: 每周版本环境风向与OP英雄轮换 (WEEKLY META TREND) */}
          {/* ======================================================================= */}
          {activeTab === 'weekly_meta' && (
            <div className="space-y-3.5">
              {/* Patch Header & 7-Day Cycle Widget */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/50 via-[#111625] to-slate-950 border-2 border-amber-500/50 shadow-xl space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-black font-code bg-amber-500 text-slate-950 shadow-sm">
                        {currentMeta.patchVersion}
                      </span>
                      <h4 className="font-tech font-black text-white text-sm sm:text-base tracking-wide">
                        {currentMeta.patchTheme}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                      {currentMeta.patchDescription}
                    </p>
                  </div>

                  {/* Manual / Simulated Patch Rotation Button */}
                  <button
                    onClick={handleSimulatePatchRotation}
                    className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-amber-500/40 hover:border-amber-400 text-amber-300 font-tech font-bold text-[10px] flex items-center gap-1.5 transition cursor-pointer shrink-0 shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>平衡补丁轮换 (Simulate Rotation)</span>
                  </button>
                </div>

                {/* 7-Day Competitive Cycle Progress Bar */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-tech">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>7天竞技轮换周期:</span>
                      <strong className="text-white font-code">第 {currentMeta.cycleDay} / 7 竞技日</strong>
                    </span>
                    <span className="text-amber-400 font-code font-bold">
                      距离下次环境轮换: {currentMeta.daysRemaining} 天
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                      style={{ width: `${(currentMeta.cycleDay / 7) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Coach Highlight & BP Tactical Tip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200">
                    <strong className="text-amber-400 block font-tech mb-0.5">🔥 版本核心增强 (Patch Highlight):</strong>
                    {currentMeta.metaHighlight}
                  </div>
                  <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-200">
                    <strong className="text-cyan-400 block font-tech mb-0.5">♟️ BP 执教核心建议 (BP Advice):</strong>
                    {currentMeta.bpTacticalTip}
                  </div>
                </div>
              </div>

              {/* OP Champion Tiers List Matrix */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-tech">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-rose-400" />
                    <span className="font-extrabold text-white">本周英雄强度榜 (Tier List Matrix):</span>
                  </div>

                  {/* Role Filters */}
                  <div className="flex items-center gap-1">
                    {(['ALL', 'TOP', 'JUG', 'MID', 'ADC', 'SUP'] as const).map(role => (
                      <button
                        key={role}
                        onClick={() => {
                          soundEngine.playClick();
                          setMetaRoleFilter(role);
                        }}
                        className={`px-2 py-0.5 rounded text-[9px] font-tech font-bold transition cursor-pointer ${
                          metaRoleFilter === role
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        {role === 'ALL' ? '全部' : role}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Champion Tier Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentMeta.champions
                    .filter(c => metaRoleFilter === 'ALL' || c.role === metaRoleFilter)
                    .map(champ => {
                      const isOp = champ.tier === 'OP';
                      const isStrong = champ.tier === 'STRONG';
                      const isWeak = champ.tier === 'WEAK';

                      return (
                        <div
                          key={champ.name}
                          className={`p-2.5 rounded-xl border transition flex items-center justify-between gap-2.5 ${
                            isOp
                              ? 'bg-rose-950/30 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                              : isStrong
                              ? 'bg-amber-950/20 border-amber-500/40'
                              : isWeak
                              ? 'bg-slate-950/60 border-slate-800/80 opacity-70'
                              : 'bg-slate-900/60 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-2xl shrink-0">{champ.icon}</span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-tech font-black text-white text-xs truncate">
                                  {champ.name}
                                </span>
                                <span className={`text-[8px] px-1 rounded font-bold font-mono ${
                                  isOp
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                    : isStrong
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : isWeak
                                    ? 'bg-slate-800 text-slate-400'
                                    : 'bg-cyan-500/20 text-cyan-300'
                                }`}>
                                  {champ.tierLabel}
                                </span>
                                <span className="text-[9px] text-slate-400 font-mono">
                                  {champ.role}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-sans truncate mt-0.5">
                                {champ.keySynergy}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-xs font-code font-bold text-white">
                              胜率 {champ.winRate}%
                            </div>
                            <span className="text-[9px] text-amber-400/90 font-sans block">
                              {champ.draftBuff}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Draft Strategy Influence Section */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-tech">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <span className="font-extrabold text-white">受版本影响的核心战术体系 (Draft Strategies Impact):</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    点击一键采纳实装
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentMeta.strategyModifiers.map(strat => {
                    const isBuffed = strat.status === 'BUFFED';
                    const isNerfed = strat.status === 'NERFED';

                    return (
                      <div
                        key={strat.strategyId}
                        className={`p-3 rounded-2xl border transition flex flex-col justify-between space-y-2 ${
                          isBuffed
                            ? 'bg-gradient-to-br from-emerald-950/40 to-slate-900 border-emerald-500/50 shadow-md'
                            : isNerfed
                            ? 'bg-gradient-to-br from-red-950/30 to-slate-950 border-red-500/40 opacity-80'
                            : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-tech font-black text-white text-xs">
                              {strat.strategyName}
                            </h5>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold font-code ${
                              isBuffed
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                                : isNerfed
                                ? 'bg-red-500/20 text-red-300 border border-red-500/50'
                                : 'bg-slate-800 text-slate-300'
                            }`}>
                              {strat.currentModifier > 0 ? `+${strat.currentModifier}%` : `${strat.currentModifier}%`} 修正
                            </span>
                          </div>

                          <p className="text-[10px] text-slate-300 font-sans leading-tight">
                            {strat.desc}
                          </p>

                          <div className="pt-1 text-[10px] text-slate-400">
                            <span className="text-amber-300 font-tech font-bold">核心人选: </span>
                            {strat.keyChampions.join(' · ')}
                          </div>

                          <div className="p-1.5 rounded-lg bg-black/40 text-[9px] text-slate-300 leading-tight">
                            💬 {strat.tacticalAdvice}
                          </div>
                        </div>

                        <button
                          onClick={() => handleAdoptMetaStrategy(strat)}
                          className={`w-full py-2 px-3 rounded-xl font-tech font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 ${
                            isBuffed
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-md'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>采纳此战术蓝图为下一场优势</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================================= */}
          {/* TAB 1: BP 博弈特训小游戏 (TACTICAL DRILL MINIGAME) */}
          {/* ======================================================================= */}
          {activeTab === 'tactical_drill' && (
            <div className="space-y-3">
              
              {/* Scenario Selector Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs font-tech font-bold">
                {TACTICAL_BP_DRILL_PUZZLES.map((puzzle, idx) => (
                  <button
                    key={puzzle.id}
                    onClick={() => handleSwitchPuzzle(idx)}
                    className={`px-2.5 py-1 rounded-lg border transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                      selectedPuzzleIndex === idx
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>第 {idx + 1} 局:</span>
                    <span>{puzzle.title}</span>
                  </button>
                ))}
              </div>

              {/* Active Scenario Card */}
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-900/90 via-[#0a0e17] to-cyan-950/20 border border-cyan-500/30 shadow-md space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-tech font-bold">
                      敌方战术阵型
                    </span>
                    <span className="text-xs font-tech font-extrabold text-white">
                      {activePuzzle.enemyComposition}
                    </span>
                  </div>
                  <div className="text-[10px] font-code text-amber-300">
                    通关奖励: +{activePuzzle.rewardAdvantage.bonusWinRate}% 选人胜率优势
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-sans leading-relaxed bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                  {activePuzzle.scenario}
                </p>
              </div>

              {/* 3-Step BP Sequence Slots Track */}
              <div className="grid grid-cols-3 gap-2">
                {activePuzzle.slots.map((slot, idx) => {
                  const isCurrent = currentSlotIndex === idx;
                  const selectedChamp = slotSelections[idx];
                  const feedback = slotFeedback[idx];

                  return (
                    <div
                      key={slot.phase}
                      onClick={() => {
                        if (!drillCompleted) {
                          soundEngine.playClick();
                          setCurrentSlotIndex(idx);
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition relative flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-slate-900 border-cyan-400 shadow-md ring-1 ring-cyan-500/50'
                          : selectedChamp
                          ? 'bg-slate-950/90 border-slate-700'
                          : 'bg-slate-950/50 border-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[9px] font-tech mb-1">
                        <span className={`px-1.5 py-0.2 rounded font-bold uppercase ${
                          slot.phase.startsWith('BAN') 
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}>
                          {slot.phaseName}
                        </span>
                        <span className="font-code text-slate-400">({slot.targetRole})</span>
                      </div>

                      <div className="my-1">
                        {selectedChamp ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">
                              {CANDIDATE_BP_CHAMPIONS.find(c => c.name === selectedChamp)?.icon || '🗡️'}
                            </span>
                            <span className="text-xs font-tech font-extrabold text-white">
                              {selectedChamp}
                            </span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-500 font-tech flex items-center gap-1">
                            <span>待布置指令...</span>
                          </div>
                        )}
                      </div>

                      <div className="text-[9px] mt-1 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                        {feedback ? (
                          feedback.isCorrect ? (
                            <span className="text-emerald-400 font-tech font-bold flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" /> 针对成功
                            </span>
                          ) : (
                            <span className="text-red-400 font-tech font-bold">
                              非最优解 ✕
                            </span>
                          )
                        ) : (
                          <span className="text-slate-500 font-tech">待下达决策</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Current Active Slot Coach Briefing & Prompt */}
              {activeSlot && (
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-tech font-bold text-white flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-cyan-400" />
                      <span>当前推演目标：{activeSlot.phaseName} ({activeSlot.targetRole})</span>
                    </span>
                    <span className="text-[10px] text-amber-300 font-tech">
                      敌方威胁: {activeSlot.enemyThreat}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    💡 <strong>教练组战术研判提示：</strong>{activeSlot.hint}
                  </p>

                  {slotFeedback[currentSlotIndex] && (
                    <div className={`p-2 rounded-lg text-xs font-tech ${
                      slotFeedback[currentSlotIndex].isCorrect
                        ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-300'
                        : 'bg-red-950/60 border border-red-500/50 text-red-300'
                    }`}>
                      {slotFeedback[currentSlotIndex].feedbackMsg}
                    </div>
                  )}
                </div>
              )}

              {/* Candidate Champions Decision Deck */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-tech font-bold text-slate-400 mb-1.5">
                  <span>挑选战术执行英雄 (点击下达针对决策):</span>
                  <span className="text-cyan-400 font-code">
                    备选牌池 ({CANDIDATE_BP_CHAMPIONS.length})
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CANDIDATE_BP_CHAMPIONS.map(champ => {
                    const isPickedInCurrentSlot = slotSelections[currentSlotIndex] === champ.name;
                    const metaTier = getChampionMetaTier(champ.name, currentMeta);
                    const isOp = metaTier?.tier === 'OP';
                    const isStrong = metaTier?.tier === 'STRONG';

                    return (
                      <button
                        key={champ.name}
                        onClick={() => handleSelectCandidate(champ.name)}
                        disabled={drillCompleted}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition flex items-start gap-2 ${
                          isPickedInCurrentSlot
                            ? 'bg-cyan-950/80 border-cyan-400 shadow-md ring-1 ring-cyan-500'
                            : isOp
                            ? 'bg-gradient-to-r from-rose-950/40 to-slate-950/80 border-rose-500/50 hover:border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.15)]'
                            : isStrong
                            ? 'bg-gradient-to-r from-amber-950/30 to-slate-950/80 border-amber-500/40 hover:border-amber-400'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                        }`}
                      >
                        <span className="text-xl shrink-0 mt-0.5">{champ.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-tech font-bold text-white truncate flex items-center gap-1">
                              <span>{champ.name}</span>
                              {isOp && (
                                <span className="text-[8px] px-1 py-0.2 rounded font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                  T0
                                </span>
                              )}
                              {isStrong && (
                                <span className="text-[8px] px-1 py-0.2 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                  T1
                                </span>
                              )}
                            </span>
                            <span className="text-[9px] px-1 rounded bg-slate-900 text-slate-400 font-code">
                              {champ.role}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-sans truncate mt-0.5">
                            {champ.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Completion & Reward Banner */}
              {drillCompleted && awardedBonusNotice && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-amber-950/60 border-2 border-emerald-500/60 text-xs font-tech space-y-2 animate-fadeIn shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />
                      <div>
                        <h4 className="text-sm font-tech font-black text-white">
                          🎉 BP 博弈推演全胜 · 获得「{awardedBonusNotice.title}」
                        </h4>
                        <p className="text-[10px] text-emerald-300 font-sans">
                          你成功克制了对手的完整核心战术体系！下一场正式比赛将享受战术降维打击！
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleResetDrill}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-tech font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>再次演练</span>
                    </button>
                  </div>

                  {/* Stat Buff Chips */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-code font-bold">
                      +{awardedBonusNotice.bonusWinRate}% 下场胜率
                    </span>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-code font-bold">
                      +{awardedBonusNotice.bonusMechanics} 微操提升
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-code font-bold">
                      +{awardedBonusNotice.bonusMacro} 大局观提升
                    </span>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ======================================================================= */}
          {/* TAB 2: 男爵决胜时刻 (BARON PIT DECIDER) */}
          {/* ======================================================================= */}
          {activeTab === 'baron_clutch' && (
            <div className="space-y-3.5">
              {/* Baron Pit HP Hud */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#0f131c] to-[#0a0e17] border border-red-500/40 shadow-[0_0_20px_rgba(255,59,92,0.15)]">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-black font-tech text-red-400 flex items-center gap-1.5">
                    <Skull className="w-4 h-4" /> 纳什男爵生死战 (BARON PIT DECIDER)
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-200">
                    {baronHp.toLocaleString()} / {baronMaxHp.toLocaleString()} HP
                  </span>
                </div>

                {/* HP Bar */}
                <div className="relative w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-red-500 transition-all duration-300"
                    style={{ width: `${Math.max(0, (baronHp / baronMaxHp) * 100)}%` }}
                  />
                  {/* Smite Threshold Marker at 10% */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_8px_#00f0ff]"
                    style={{ left: `${(smiteThreshold / baronMaxHp) * 100}%` }}
                    title="拼惩戒绝杀线 (1,200 HP)"
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span className="text-cyan-400 font-bold">▲ 斩杀惩戒线: {smiteThreshold} HP</span>
                  <span>蓝色方胜率 82% vs 红色方 76%</span>
                </div>
              </div>

              {/* Live Casters Commentary Ticker */}
              <div className="p-3 rounded-xl bg-[#0f131c] border border-cyan-500/20 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-cyan-300 block">🎙 官方总决赛解说席 · 米勒 & 娃娃:</span>
                  <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                    “这一波大龙坑必须做决断了！敌方中野已经包抄过来，是孤勇者中单进场秒C，还是打野稳健拼惩戒？全看教练组这一瞬间的指挥发令！”
                  </p>
                </div>
              </div>

              {/* Clutch Result Banner */}
              {clutchResult && (
                <div className={`p-3.5 rounded-xl border animate-fade-in ${
                  clutchResult.isClutch
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                    : 'bg-red-950/40 border-red-500 text-red-200'
                }`}>
                  <div className="flex items-center gap-2 font-black font-tech text-sm mb-1">
                    {clutchResult.isClutch ? <Trophy className="w-4 h-4 text-[#ffd700]" /> : <Skull className="w-4 h-4 text-red-400" />}
                    <span>{clutchResult.isClutch ? '🔥 奇迹绝杀 · CLUTCH OUTPLAY!' : '💀 战术受挫 · CRITICAL DEFEAT'}</span>
                  </div>
                  <p className="text-xs leading-relaxed">{clutchResult.message}</p>
                </div>
              )}

              {/* 3 Tactical Directive Cards */}
              <div>
                <span className="text-xs font-bold text-slate-300 block mb-2">教练战术指令牌池:</span>
                <div className="space-y-2">
                  {baronOptions.map(opt => {
                    const canAfford = tacticalPoints >= opt.cost_tp;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleExecuteBaron(opt)}
                        disabled={!canAfford || isResolving}
                        className={`w-full p-3 rounded-xl border text-left transition-all relative ${
                          canAfford
                            ? 'bg-[#0f131c] border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 cursor-pointer'
                            : 'bg-slate-950/60 border-slate-900 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white font-tech">{opt.title}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 font-mono">
                              {opt.tag}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black font-code text-emerald-400">成功率 {opt.success_rate}%</span>
                            <span className="text-[10px] text-amber-400 font-mono block">消耗 {opt.cost_tp} TP</span>
                          </div>
                        </div>
                        <div className="mt-1.5 text-[11px] text-slate-400 leading-tight">
                          <span className="text-emerald-400/80">成功: </span>{opt.reward}
                        </div>
                        <div className="text-[10px] text-red-400/80 leading-tight mt-0.5">
                          <span>风险: </span>{opt.risk}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================================= */}
          {/* TAB 3: AI BP 分析师 (AI DRAFTING ANALYST) */}
          {/* ======================================================================= */}
          {activeTab === 'ai_analyst' && (() => {
            const opponentTeam = GLOBAL_POWER_RANKINGS_TEAMS.find(t => t.teamId === analystOpponentId) || GLOBAL_POWER_RANKINGS_TEAMS[0];

            // AI draft recommendation models based on opponent historical playstyle
            const banRecommendations = [
              {
                role: 'MID' as const,
                champion: opponentTeam.roster.find(r => r.role === 'MID')?.signatureHero || '阿兹尔 (沙漠皇帝)',
                reason: `封锁 ${opponentTeam.shortName} 中轴团战核心发动机，迫使其放弃习惯的大后期法核防守体系`,
                priority: 'MUST_BAN' as const,
                winRateImpact: '+8.5%'
              },
              {
                role: 'TOP' as const,
                champion: opponentTeam.roster.find(r => r.role === 'TOP')?.signatureHero || '贾克斯 (武器大师)',
                reason: `拆解其擅长的单带分推牵制阵型，防止边路兵线被其滚雪球撕裂`,
                priority: 'RECOMMENDED' as const,
                winRateImpact: '+6.2%'
              },
              {
                role: 'JUG' as const,
                champion: opponentTeam.roster.find(r => r.role === 'JUG')?.signatureHero || '佛耶戈 (破败之王)',
                reason: `斩断野辅双游入侵前哨，保护己方野区红蓝Buff初始资源节奏`,
                priority: 'SITUATIONAL' as const,
                winRateImpact: '+4.8%'
              }
            ];

            const pickRecommendations = [
              {
                role: 'ADC' as const,
                champion: '韦鲁斯 (惩戒之箭)',
                tier: 'S+',
                synergyWithTeam: '前中期穿甲强Poke压线，破防对手防守反击阵型',
                counterTarget: opponentTeam.roster.find(r => r.role === 'ADC')?.signatureHero || '虚空之女',
                confidence: 94
              },
              {
                role: 'SUP' as const,
                champion: '深海泰坦 (诺提勒斯)',
                tier: 'S',
                synergyWithTeam: '强硬稳定先手锁定，精准点杀敌方走位失误单核',
                counterTarget: opponentTeam.roster.find(r => r.role === 'SUP')?.signatureHero || '幻翎',
                confidence: 91
              },
              {
                role: 'MID' as const,
                champion: '阿卡丽 (离群之刺)',
                tier: 'S',
                synergyWithTeam: '针对性刺客后手进场，克制长手控制法核并完成残局收割',
                counterTarget: opponentTeam.roster.find(r => r.role === 'MID')?.signatureHero || '沙皇',
                confidence: 89
              }
            ];

            const filteredBans = analystRoleFilter === 'ALL' 
              ? banRecommendations 
              : banRecommendations.filter(b => b.role === analystRoleFilter);

            const filteredPicks = analystRoleFilter === 'ALL'
              ? pickRecommendations
              : pickRecommendations.filter(p => p.role === analystRoleFilter);

            const handleAdoptPlan = () => {
              soundEngine.playLevelUp();
              setAdoptedPlanNotice(`已采纳针对 [${opponentTeam.shortName}] 的 AI 深度定制 BP 策略！`);
              setTimeout(() => setAdoptedPlanNotice(null), 3500);

              if (onApplyDraftAdvantage) {
                onApplyDraftAdvantage({
                  level: 3,
                  title: `AI 精准针对 ${opponentTeam.shortName} BP策略`,
                  bonusWinRate: 15,
                  bonusMechanics: 4,
                  bonusMacro: 6,
                  matchesRemaining: 1,
                  appliedAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
                });
              }

              if (onAddLog) {
                onAddLog(`🤖【AI BP 分析师】已加载针对 [${opponentTeam.teamName}] 的全套 Ban/Pick 胜率模型！获得下场比赛 +15% 胜率首发优势！`, 'win');
              }
            };

            return (
              <div className="space-y-3">
                {/* Notice Toast */}
                {adoptedPlanNotice && (
                  <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-400 text-purple-200 text-xs font-tech font-bold flex items-center justify-between animate-fade-in shadow-md">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
                      {adoptedPlanNotice}
                    </span>
                    <span className="text-[10px] bg-purple-500/30 px-2 py-0.5 rounded text-purple-300 font-code">
                      +15% 胜率已生效
                    </span>
                  </div>
                )}

                {/* Opponent Team Quick Bar */}
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-400 font-tech uppercase flex items-center justify-between">
                    <span>1. 选择假想敌对战队 (Scouting Database)</span>
                    <span className="text-purple-400 font-mono">当前分析: {opponentTeam.shortName}</span>
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {GLOBAL_POWER_RANKINGS_TEAMS.slice(0, 8).map(team => (
                      <button
                        key={team.teamId}
                        onClick={() => {
                          soundEngine.playClick();
                          setAnalystOpponentId(team.teamId);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-tech font-bold transition cursor-pointer flex items-center gap-1 shrink-0 ${
                          analystOpponentId === team.teamId
                            ? 'bg-purple-500/25 border-purple-400 text-purple-200 shadow-sm'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>{team.logoEmoji}</span>
                        <span>{team.shortName}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Opponent Meta & Playstyle Dossier */}
                <div className="p-3 rounded-xl bg-gradient-to-br from-slate-900 via-purple-950/20 to-slate-950 border border-purple-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-purple-400 animate-pulse" />
                      <span className="text-xs font-tech font-black text-white">
                        {opponentTeam.teamName} 历史打法与版本 Meta 数据
                      </span>
                    </div>
                    <span className="text-[10px] font-code px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      战力 {opponentTeam.powerRating} · {opponentTeam.region}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-snug">
                    <span className="text-purple-400 font-bold">风格画像: </span>{opponentTeam.playstyle}
                  </p>
                  <p className="text-[11px] text-amber-300 leading-snug bg-slate-950/70 p-2 rounded border border-slate-800">
                    <span className="font-bold">破局提示: </span>{opponentTeam.counterTip}
                  </p>
                </div>

                {/* Role Filter Tabs */}
                <div className="flex items-center justify-between text-xs font-tech">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Filter className="w-3 h-3 text-cyan-400" /> 分路针对筛选:
                  </span>
                  <div className="flex gap-1">
                    {(['ALL', 'TOP', 'JUG', 'MID', 'ADC', 'SUP'] as const).map(role => (
                      <button
                        key={role}
                        onClick={() => {
                          soundEngine.playClick();
                          setAnalystRoleFilter(role);
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                          analystRoleFilter === role
                            ? 'bg-purple-500 text-slate-950 font-black'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recommendations Grid: BANS & PICKS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  
                  {/* Recommended BANS */}
                  <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs font-tech font-bold text-rose-300">
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        AI 极高优先级 BAN 位锁定
                      </span>
                      <span className="text-[10px] text-rose-400/80">针对核心</span>
                    </div>

                    <div className="space-y-1.5">
                      {filteredBans.map((ban, i) => (
                        <div key={i} className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="px-1 py-0.2 rounded text-[8px] bg-rose-500/20 text-rose-300 font-mono font-bold">
                                {ban.role}
                              </span>
                              <span className="text-xs font-bold text-white font-tech">{ban.champion}</span>
                            </div>
                            <span className="text-[10px] font-code font-bold text-emerald-400">
                              胜率提升 {ban.winRateImpact}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-tight">
                            {ban.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended PICKS */}
                  <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs font-tech font-bold text-cyan-300">
                      <span className="flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
                        AI 极佳顺位 PICK 克制英雄
                      </span>
                      <span className="text-[10px] text-cyan-400/80">版本强推</span>
                    </div>

                    <div className="space-y-1.5">
                      {filteredPicks.map((pick, i) => (
                        <div key={i} className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="px-1 py-0.2 rounded text-[8px] bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                                {pick.role}
                              </span>
                              <span className="text-xs font-bold text-white font-tech">{pick.champion}</span>
                              <span className="px-1 py-0.2 rounded text-[8px] bg-amber-500/20 text-amber-300 font-code">
                                {pick.tier}
                              </span>
                            </div>
                            <span className="text-[10px] font-code text-cyan-300">
                              契合度 {pick.confidence}%
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-tight">
                            <span className="text-amber-400">克制点: </span>{pick.synergyWithTeam}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Action Bar: Adopt Strategy */}
                <div className="p-3 rounded-xl bg-slate-900 border border-purple-500/40 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold font-tech text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      一键装载该套 AI 针对性 BP 策略
                    </div>
                    <span className="text-[10px] text-slate-400 font-sans">
                      生效于下一场正式排位/赛事，获得 +15% 胜率、+4 微操、+6 大局观选人加成
                    </span>
                  </div>

                  <button
                    onClick={handleAdoptPlan}
                    className="py-2 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-tech font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-md active:scale-98 shrink-0"
                  >
                    采纳并实装 BP 方案
                  </button>
                </div>
              </div>
            );
          })()}

        </div>

      </div>
    </div>
  );
};
