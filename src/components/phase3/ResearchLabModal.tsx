import React, { useState } from 'react';
import { 
  FlaskConical, 
  X, 
  Sparkles, 
  ShieldCheck, 
  HeartPulse, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  Zap, 
  Layers, 
  Info, 
  DollarSign,
  TrendingDown,
  Shield,
  Stethoscope,
  Clock,
  Lock,
  ChevronRight,
  Award,
  Cpu,
  Brain,
  Building2,
  Sliders,
  Check
} from 'lucide-react';
import { DynastyState, PlayerStats } from '../../types/game';
import { MERCH_RD_UPGRADES, RDUpgradeDef } from '../../data/merchData';
import { investInMerchRD } from '../../utils/merchSalesManager';
import { soundEngine } from '../../utils/audio';
import { ResearchLabDashboard } from './ResearchLabDashboard';
import { 
  RDResearchCategory, 
  INJURY_PREVENTION_CUMULATIVE_BENEFITS, 
  TierCumulativeBenefitInfo,
  getNodeCumulativeBenefits
} from '../../data/researchLabData';

export interface ResearchLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  dynasty: DynastyState;
  onUpdateDynasty: React.Dispatch<React.SetStateAction<DynastyState>>;
  rdPoints?: number;
  setRdPoints?: React.Dispatch<React.SetStateAction<number>>;
  onPurchaseInjuryUpgrade?: (cost?: number, points?: number) => { success: boolean; message: string };
  playerStats?: PlayerStats;
  onOpenPhysio?: () => void;
  onAddLog?: (message: string, type: 'win' | 'loss' | 'event' | 'gear') => void;
}

export const ResearchLabModal: React.FC<ResearchLabModalProps> = ({
  isOpen,
  onClose,
  dynasty,
  onUpdateDynasty,
  rdPoints,
  setRdPoints,
  onPurchaseInjuryUpgrade,
  playerStats,
  onOpenPhysio,
  onAddLog
}) => {
  if (!isOpen) return null;

  const [modalTab, setModalTab] = useState<'DASHBOARD' | 'INJURY_TREE'>('DASHBOARD');
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const [selectedTierDetail, setSelectedTierDetail] = useState<number | null>(null);
  const [hoveredTier, setHoveredTier] = useState<number | null>(null);

  // Available Resources
  const availableRdPoints = rdPoints !== undefined ? rdPoints : (dynasty.techPoints ?? 120);
  const clubFunds = dynasty.budget;

  // Upgrade Node: 'injury_prevention'
  const injuryDef = MERCH_RD_UPGRADES.find(u => u.id === 'injury_prevention') || {
    id: 'injury_prevention',
    name: '伤病预防与康复医学 (Injury Prevention & Recovery)',
    categoryName: '运动医学与防护',
    icon: '🩺',
    description: '前沿电竞人机工效与运动康复科研。研发微动支撑套件、深层神经松解、生化细胞修复及外骨骼护具，大幅削减高强度20小时经营实训产生的腕管肌腱负荷（Strain），根治恶性腱鞘炎并缩短理疗康复耗程。',
    baseCost: 25000,
    costMultiplier: 2.2,
    multiplierPerLevel: 0.10,
    maxLevel: 5,
    levels: []
  };

  const currentLevel = dynasty.merchShop?.rdUpgrades?.injury_prevention || 0;
  const isMaxTier = currentLevel >= injuryDef.maxLevel;
  const nextTier = currentLevel + 1;
  const nextTierInfo = !isMaxTier ? injuryDef.levels[nextTier - 1] : null;

  // Active tier for inspection (defaults to next target tier, or Tier 5 if maxed)
  const activeTierLevel = selectedTierDetail || (isMaxTier ? 5 : Math.max(1, nextTier));
  const activeCumInfo = INJURY_PREVENTION_CUMULATIVE_BENEFITS[activeTierLevel] || INJURY_PREVENTION_CUMULATIVE_BENEFITS[1];
  const activeTierDef = injuryDef.levels[activeTierLevel - 1];

  // Costs & Points Investment Tracking
  const upgradeCost = nextTierInfo?.cost || (25000 * Math.pow(2.2, currentLevel));
  const upgradeRdPointsCost = nextTierInfo?.techPointCost || (20 * (currentLevel + 1));

  // Current partial points invested into this tree's next tier
  const currentInvestedPoints = dynasty.merchShop?.rdInvestedPoints?.injury_prevention || 0;
  const remainingRdPointsNeeded = Math.max(0, upgradeRdPointsCost - currentInvestedPoints);

  // Percentage of points invested / ready toward the next tier
  const effectivePointsForNextTier = currentInvestedPoints > 0 
    ? currentInvestedPoints 
    : Math.min(availableRdPoints, upgradeRdPointsCost);
  const pointsInvestedPercent = isMaxTier 
    ? 100 
    : Math.min(100, Math.round((effectivePointsForNextTier / upgradeRdPointsCost) * 100));

  const fundsReadyPercent = Math.min(100, Math.round((clubFunds / upgradeCost) * 100));

  const hasEnoughFunds = clubFunds >= upgradeCost;
  const hasEnoughRdPoints = currentInvestedPoints >= upgradeRdPointsCost || availableRdPoints >= remainingRdPointsNeeded;
  const canPurchase = hasEnoughFunds && hasEnoughRdPoints && !isMaxTier;

  // Current active bonuses
  const currentTierInfo = currentLevel > 0 ? injuryDef.levels[currentLevel - 1] : null;
  const currentStrainReductionPct = currentTierInfo?.strainReduction 
    ? Math.round(currentTierInfo.strainReduction * 100) 
    : (currentLevel * 10);
  const currentTherapyReductionPct = currentTierInfo?.therapyDurationReduction 
    ? Math.round(currentTierInfo.therapyDurationReduction * 100) 
    : (currentLevel * 10);

  // Handler to incrementally invest points toward the next tier
  const handleInvestInjuryPoints = (amount: number) => {
    soundEngine.playClick();
    if (isMaxTier) return;
    const targetPoints = upgradeRdPointsCost;
    const needed = Math.max(0, targetPoints - currentInvestedPoints);
    if (needed <= 0) {
      setFeedbackNotice('【伤病预防与康复医学】下一阶科研点数已 100% 满额注资就绪！');
      return;
    }
    const actualInvest = Math.min(amount, availableRdPoints, needed);
    if (actualInvest <= 0) {
      soundEngine.playDefeat();
      setFeedbackNotice(`❌ 可用科研点数不足，当前仅有 ${availableRdPoints} 点`);
      return;
    }

    const newAvailable = Math.max(0, availableRdPoints - actualInvest);
    if (setRdPoints) {
      setRdPoints(newAvailable);
    }

    const newInvested = currentInvestedPoints + actualInvest;
    const updatedDynasty: DynastyState = {
      ...dynasty,
      techPoints: newAvailable,
      merchShop: {
        ...(dynasty.merchShop || {
          jerseyConfig: {} as any,
          catalog: [],
          salesHistory: [],
          totalLifetimeMerchRevenue: 0,
          totalJerseysSold: 0,
          currentHypeLevel: 80,
          lastSettlementWeek: 1
        }),
        rdInvestedPoints: {
          ...(dynasty.merchShop?.rdInvestedPoints || {}),
          injury_prevention: newInvested
        }
      }
    };
    onUpdateDynasty(updatedDynasty);
    soundEngine.playLevelUp();
    const pct = Math.round((newInvested / targetPoints) * 100);
    const msg = `⚡ 成功为「伤病预防与康复医学」注入 ${actualInvest} 点科研点数！下一阶点数投资进度：${pct}% (${newInvested}/${targetPoints} 点)`;
    setFeedbackNotice(msg);
    if (onAddLog) onAddLog(msg, 'event');
  };

  // Handler for upgrading
  const handleUpgrade = () => {
    soundEngine.playClick();

    if (isMaxTier) {
      setFeedbackNotice('【伤病预防与康复医学】已达终极巅峰 (Lv.5 Max)，无需继续升级！');
      return;
    }

    if (!hasEnoughFunds) {
      soundEngine.playDefeat();
      setFeedbackNotice(`❌ 俱乐部金库资金不足：需要 $${upgradeCost.toLocaleString()}，当前仅有 $${Math.round(clubFunds).toLocaleString()}`);
      return;
    }

    if (!hasEnoughRdPoints) {
      soundEngine.playDefeat();
      setFeedbackNotice(`❌ R&D 科研点数不足：尚需 ${remainingRdPointsNeeded} 点，当前仅有 ${availableRdPoints} 点（尚缺 ${remainingRdPointsNeeded - availableRdPoints} 点）`);
      return;
    }

    if (onPurchaseInjuryUpgrade) {
      const result = onPurchaseInjuryUpgrade(upgradeCost, remainingRdPointsNeeded);
      setFeedbackNotice(result.message);
      if (result.success && onAddLog) {
        onAddLog(result.message, 'win');
      }
      return;
    }

    // Fallback: direct mutation
    const { success, message, updatedDynasty } = investInMerchRD(dynasty, 'injury_prevention', upgradeCost);
    if (success) {
      soundEngine.playLevelUp();
      soundEngine.playVictory();
      onUpdateDynasty(updatedDynasty);
      setFeedbackNotice(message);
      if (onAddLog) {
        onAddLog(message, 'win');
      }
    } else {
      soundEngine.playDefeat();
      setFeedbackNotice(message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div 
        className="w-full max-w-5xl h-[92vh] flex flex-col bg-slate-950 border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.2)] overflow-hidden chamfer-card"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-500/20 via-pink-500/20 to-indigo-500/20 border border-rose-500/30 text-rose-300 shadow-inner">
              <FlaskConical className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-tech font-extrabold text-white tracking-wide flex items-center gap-2">
                  <span>科研实验室 · RESEARCH LAB</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-code font-bold">
                    伤病预防与康复医学
                  </span>
                </h3>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                深度人机工效与运动医学科研：消耗俱乐部金库与 R&D 科研点数，构筑钢铁之躯
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Currency Badges */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
              <div className="text-right">
                <span className="text-[9px] text-slate-400 block font-tech">俱乐部金库</span>
                <span className="text-xs font-code font-bold text-emerald-400">
                  ${clubFunds.toLocaleString()}
                </span>
              </div>
              <div className="h-6 w-px bg-slate-800 mx-1" />
              <div className="text-right">
                <span className="text-[9px] text-slate-400 block font-tech">R&D 科研点数</span>
                <span className="text-xs font-code font-bold text-cyan-300 flex items-center gap-0.5 justify-end">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  {availableRdPoints} 点
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              title="关闭实验室"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-4 sm:px-6 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEngine.playClick();
                setModalTab('DASHBOARD');
              }}
              className={`px-3.5 py-1.5 rounded-xl font-tech font-bold text-xs transition cursor-pointer flex items-center gap-2 ${
                modalTab === 'DASHBOARD'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-600/30'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>全域科研中枢 · ALL R&D DASHBOARD</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                setModalTab('INJURY_TREE');
              }}
              className={`px-3.5 py-1.5 rounded-xl font-tech font-bold text-xs transition cursor-pointer flex items-center gap-2 ${
                modalTab === 'INJURY_TREE'
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>伤病预防与康复医学树 · INJURY TREE</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-500 font-tech hidden md:inline">
            {modalTab === 'DASHBOARD' ? '涵盖战术创新、基地基建与人体生理三大领域' : '专注手腕腱鞘炎防线与理疗康复周期深度攻关'}
          </span>
        </div>

        {/* Feedback Alert Toast */}
        {feedbackNotice && (
          <div className="px-4 sm:px-6 py-2 bg-gradient-to-r from-rose-950/80 via-slate-900 to-indigo-950/80 border-b border-rose-500/40 flex items-center justify-between text-xs animate-fadeIn shrink-0">
            <span className="text-rose-200 font-tech font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-rose-400 animate-spin-slow shrink-0" />
              {feedbackNotice}
            </span>
            <button
              onClick={() => setFeedbackNotice(null)}
              className="text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* View 1: Unified Research Lab Dashboard */}
        {modalTab === 'DASHBOARD' && (
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 custom-scrollbar bg-slate-950/50">
            <ResearchLabDashboard
              dynasty={dynasty}
              onUpdateDynasty={onUpdateDynasty}
              rdPoints={availableRdPoints}
              setRdPoints={setRdPoints}
              onPurchaseInjuryUpgrade={onPurchaseInjuryUpgrade}
              playerStats={playerStats}
              onOpenPhysio={onOpenPhysio}
              onAddLog={onAddLog}
            />
          </div>
        )}

        {/* View 2: Deep Injury Prevention & Recovery Tree */}
        {modalTab === 'INJURY_TREE' && (
          <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-5 custom-scrollbar bg-slate-950/50">

            {/* 1. CURRENT TIER STATUS HUD BANNER */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-indigo-950/40 border border-rose-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500/30 to-purple-600/30 border border-rose-500/50 flex items-center justify-center text-rose-300 text-2xl shrink-0 shadow-inner">
                  🩺
                </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-tech font-black text-white text-base">
                    {injuryDef.name}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-code font-bold text-xs">
                    当前阶位：Tier {currentLevel} / {injuryDef.maxLevel}
                  </span>
                  {currentTierInfo?.perkBadge && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-code font-bold text-xs">
                      {currentTierInfo.perkBadge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300/90 leading-relaxed font-sans line-clamp-2">
                  {injuryDef.description}
                </p>
              </div>
            </div>

            {/* Compounding Active Protection Metrics */}
            <div className="grid grid-cols-2 gap-2 sm:w-72 shrink-0">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-rose-500/30 text-center shadow-inner">
                <span className="text-[10px] text-slate-400 block font-tech flex items-center justify-center gap-1">
                  <HeartPulse className="w-3 h-3 text-rose-400" />
                  手腕积劳负荷抑制
                </span>
                <span className="font-code font-black text-lg text-rose-400">
                  -{currentStrainReductionPct}%
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-teal-500/30 text-center shadow-inner">
                <span className="text-[10px] text-slate-400 block font-tech flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3 text-teal-400" />
                  理疗周期与开支减免
                </span>
                <span className="font-code font-black text-lg text-teal-300">
                  -{currentTherapyReductionPct}%
                </span>
              </div>
            </div>
          </div>

          {/* 2. UPGRADE PROGRESSION ROADMAP & POINTS INVESTMENT BAR */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3.5 shadow-lg">
            {/* Top row: Overall 5-Tier roadmap */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-tech">
                <span className="text-slate-300 flex items-center gap-1.5 font-bold">
                  <Layers className="w-4 h-4 text-rose-400" />
                  5 阶运动医学全景演进 (5-Tier Medical Roadmap)
                </span>
                <span className="text-rose-300 font-code font-bold">
                  科技阶位完成度: {Math.round((currentLevel / injuryDef.maxLevel) * 100)}% (Tier {currentLevel} / {injuryDef.maxLevel})
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-indigo-500 transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                  style={{ width: `${(currentLevel / injuryDef.maxLevel) * 100}%` }}
                />
              </div>
            </div>

            {/* Bottom row: Next Tier R&D Points Investment Progress Bar */}
            {!isMaxTier && nextTierInfo ? (
              <div className="p-3 rounded-xl bg-slate-950/70 border border-cyan-500/30 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 font-tech font-extrabold text-white">
                      <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                      下一阶点数投资推进 (Tier {nextTier} 研发点数进度)
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-code font-black border ${
                      pointsInvestedPercent >= 100
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    }`}>
                      {pointsInvestedPercent}%
                    </span>
                    {pointsInvestedPercent >= 100 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-code font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> 点数已就绪
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs font-code">
                    <span className="text-slate-400">
                      已注入/就绪: <strong className="text-cyan-300">{effectivePointsForNextTier}</strong> / {upgradeRdPointsCost} 点
                    </span>
                    {remainingRdPointsNeeded > 0 && (
                      <span className="text-rose-400 text-[11px]">
                        (尚缺 {remainingRdPointsNeeded} 点)
                      </span>
                    )}
                  </div>
                </div>

                {/* The Visual Progress Bar */}
                <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800 p-0.5 overflow-hidden shadow-inner relative">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 transition-all duration-500 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.6)] relative"
                    style={{ width: `${pointsInvestedPercent}%` }}
                  >
                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/40 rounded-full animate-pulse" />
                  </div>
                </div>

                {/* Quick Planning Investment Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-900 text-xs">
                  <span className="text-[11px] text-slate-400 font-sans">
                    💡 规划提示：提前注入科研点数可锁定科技份额，待俱乐部金库资金充裕后即可直接晋升
                  </span>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleInvestInjuryPoints(5)}
                      disabled={availableRdPoints < 5 || remainingRdPointsNeeded <= 0}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-cyan-300 font-code font-bold text-[11px] border border-cyan-500/30 transition cursor-pointer"
                    >
                      +5 点
                    </button>
                    <button
                      onClick={() => handleInvestInjuryPoints(10)}
                      disabled={availableRdPoints < 10 || remainingRdPointsNeeded <= 0}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-cyan-300 font-code font-bold text-[11px] border border-cyan-500/30 transition cursor-pointer"
                    >
                      +10 点
                    </button>
                    <button
                      onClick={() => handleInvestInjuryPoints(remainingRdPointsNeeded)}
                      disabled={availableRdPoints < 1 || remainingRdPointsNeeded <= 0}
                      className="px-3 py-1 rounded-lg bg-cyan-600/80 hover:bg-cyan-500 disabled:opacity-40 text-white font-tech font-bold text-[11px] transition cursor-pointer shadow-sm shadow-cyan-600/30"
                    >
                      一键注满剩余点数 ({remainingRdPointsNeeded}点)
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300 text-xs font-tech font-bold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-400" />
                  已达 5 阶终极巅峰（Tier 5 Nanotech Neural Exosuit）
                </span>
                <span className="font-code text-emerald-400">点数投资完成度 100%</span>
              </div>
            )}
          </div>

          {/* 3. INTERACTIVE 5-TIER UPGRADE CARDS WITH HOVER TOOLTIPS & PROGRESS BARS */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
            {injuryDef.levels.map(tierDef => {
              const isUnlocked = currentLevel >= tierDef.level;
              const isTarget = currentLevel + 1 === tierDef.level;
              const isFuture = tierDef.level > currentLevel + 1;
              const isSelected = activeTierLevel === tierDef.level;
              const cumBenefit = INJURY_PREVENTION_CUMULATIVE_BENEFITS[tierDef.level] || INJURY_PREVENTION_CUMULATIVE_BENEFITS[1];

              // Tier-specific points progress
              const tierInvestedPts = isUnlocked 
                ? tierDef.techPointCost 
                : isTarget 
                ? effectivePointsForNextTier 
                : 0;
              const tierPointsPercent = isUnlocked 
                ? 100 
                : isTarget 
                ? pointsInvestedPercent 
                : 0;

              return (
                <div
                  key={tierDef.level}
                  onClick={() => setSelectedTierDetail(tierDef.level)}
                  onMouseEnter={() => setHoveredTier(tierDef.level)}
                  onMouseLeave={() => setHoveredTier(null)}
                  className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-all cursor-pointer relative group ${
                    isUnlocked
                      ? 'bg-gradient-to-b from-rose-950/40 to-slate-950 border-rose-500/60 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/20'
                      : isTarget
                      ? 'bg-gradient-to-b from-indigo-950/60 to-slate-950 border-indigo-500/80 text-indigo-200 shadow-[0_0_20px_rgba(99,102,241,0.25)] ring-2 ring-indigo-400/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-70 hover:opacity-90'
                  } ${isSelected ? 'ring-2 ring-cyan-400 scale-[1.02] shadow-cyan-500/20' : ''}`}
                >
                  {/* Floating Hover Tooltip: Cumulative Stat Benefits & Road to Worlds Impact */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-[104%] mb-2 w-72 sm:w-80 p-3.5 rounded-2xl bg-slate-950/95 border border-cyan-500/60 shadow-[0_15px_35px_rgba(0,0,0,0.85)] backdrop-blur-xl z-50 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto text-left space-y-2.5">
                    {/* Tooltip Header */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-code font-bold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                          Tier {tierDef.level} 累计雷达
                        </span>
                        <span className="text-[10px] font-tech font-extrabold text-white truncate max-w-[120px]">
                          {tierDef.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-amber-300 font-code font-black flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30 shrink-0">
                        <Award className="w-3 h-3 text-amber-400" />
                        耐力 {cumBenefit.bo5EnduranceRating} 级
                      </span>
                    </div>

                    {/* Road to Worlds Stage Badge */}
                    <div className="text-[11px] font-tech font-bold text-amber-300 flex items-center gap-1.5 bg-amber-950/30 px-2 py-1 rounded-lg border border-amber-500/20">
                      <span>🏆 {cumBenefit.stageBadge}</span>
                    </div>

                    {/* Cumulative Stats Comparison Box */}
                    <div className="grid grid-cols-2 gap-1.5 text-[10px] font-code bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-slate-400 block text-[9px] font-tech">累计手腕负荷抑制</span>
                        <span className="text-rose-400 font-black">-{cumBenefit.cumulativeStrainReduction}%</span>
                        <span className="text-slate-500 text-[8.5px] block">(单阶 -{Math.round((tierDef.strainReduction || 0) * 100)}%)</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] font-tech">累计理疗周期减免</span>
                        <span className="text-teal-300 font-black">-{cumBenefit.cumulativeTherapyReduction}%</span>
                        <span className="text-slate-500 text-[8.5px] block">(单阶 -{Math.round((tierDef.therapyDurationReduction || 0) * 100)}%)</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] font-tech">累计粉丝狂热产出</span>
                        <span className="text-amber-300 font-bold">+{cumBenefit.cumulativeHype} Hype</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] font-tech">累计科研注资总额</span>
                        <span className="text-cyan-300 font-bold">${cumBenefit.cumulativeCost.toLocaleString()} + {cumBenefit.cumulativeTechPoints}点</span>
                      </div>
                    </div>

                    {/* Road to Worlds Narrative */}
                    <div className="text-[10px] text-slate-300 leading-relaxed font-sans border-t border-slate-800/80 pt-2 space-y-1">
                      <div className="font-tech font-bold text-cyan-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        出征全球总决赛影响：
                      </div>
                      <p className="line-clamp-3 text-slate-300/90">
                        {cumBenefit.roadToWorldsDetailedImpact}
                      </p>
                      <div className="text-[9.5px] text-amber-300/90 font-code font-bold pt-0.5">
                        ⚡ {cumBenefit.clutchAdvantageText}
                      </div>
                    </div>

                    <div className="text-[9px] text-slate-400 font-sans text-center pt-1 border-t border-slate-900">
                      💡 点击锁定此阶位完整深度战术解析看板
                    </div>
                  </div>

                  {/* Top Badge & Level Indicator */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-code font-bold">
                      <span className="px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700/60 flex items-center gap-1">
                        <span>Tier {tierDef.level}</span>
                      </span>
                      {isUnlocked ? (
                        <span className="text-emerald-400 flex items-center gap-0.5 text-[10px]">
                          <CheckCircle2 className="w-3.5 h-3.5 inline text-emerald-400" /> 已掌握
                        </span>
                      ) : isTarget ? (
                        <span className="text-amber-300 flex items-center gap-0.5 text-[10px] animate-pulse">
                          <Sparkles className="w-3.5 h-3.5 inline text-amber-300" /> 攻坚目标
                        </span>
                      ) : (
                        <span className="text-slate-600 flex items-center gap-0.5 text-[10px]">
                          <Lock className="w-3 h-3 inline" /> 待解锁
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-tech font-extrabold text-white leading-tight">
                      {tierDef.title}
                    </div>

                    <p className="text-[10px] text-slate-400 font-sans leading-relaxed line-clamp-2">
                      {tierDef.detail}
                    </p>
                  </div>

                  {/* Bottom Stats, Cumulative Badge & Progress Bar */}
                  <div className="pt-2 mt-2 border-t border-slate-800/80 space-y-2">
                    <div className="text-[9.5px] px-2 py-0.5 rounded bg-slate-900/90 text-rose-300 border border-rose-900/60 font-tech font-bold truncate">
                      {tierDef.perkBadge}
                    </div>

                    {/* Cumulative Benefits Callout Badge */}
                    <div className="text-[9.5px] text-cyan-300 bg-cyan-950/40 px-2 py-1 rounded-lg border border-cyan-500/30 font-code font-bold flex items-center justify-between">
                      <span>累计负荷 -{cumBenefit.cumulativeStrainReduction}%</span>
                      <span>理疗 -{cumBenefit.cumulativeTherapyReduction}%</span>
                    </div>

                    {/* Visual Progress Bar for Points Invested Toward Next Tier */}
                    <div className="p-2 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-tech text-cyan-300">
                        <span className="font-bold flex items-center gap-1">
                          <Zap className="w-3 h-3 text-cyan-400" /> 点数投资进度
                        </span>
                        <span className="font-code font-extrabold">{tierPointsPercent}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div 
                          className={`h-full transition-all duration-300 rounded-full ${
                            isUnlocked 
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                              : isTarget 
                              ? 'bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400' 
                              : 'bg-slate-800'
                          }`}
                          style={{ width: `${tierPointsPercent}%` }}
                        />
                      </div>
                      <div className="text-[9px] text-slate-400 font-code flex items-center justify-between">
                        <span>{tierInvestedPts}/{tierDef.techPointCost}点</span>
                        <span className={isUnlocked ? 'text-emerald-400' : isTarget && tierPointsPercent >= 100 ? 'text-emerald-400' : 'text-slate-500'}>
                          {isUnlocked ? '已完成' : isTarget ? (tierPointsPercent >= 100 ? '已满额' : `差${remainingRdPointsNeeded}点`) : '待攻坚'}
                        </span>
                      </div>

                      {/* Quick Point Buttons on Target Tier */}
                      {isTarget && remainingRdPointsNeeded > 0 && (
                        <div className="flex items-center justify-end gap-1 pt-1 border-t border-slate-800/60">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInvestInjuryPoints(5);
                            }}
                            disabled={availableRdPoints < 5}
                            className="px-1.5 py-0.5 rounded bg-slate-950 hover:bg-slate-800 disabled:opacity-30 text-[9px] text-cyan-300 border border-cyan-500/30 transition cursor-pointer"
                          >
                            +5点
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInvestInjuryPoints(remainingRdPointsNeeded);
                            }}
                            disabled={availableRdPoints < 1}
                            className="px-2 py-0.5 rounded bg-cyan-700 hover:bg-cyan-600 disabled:opacity-30 text-[9px] text-white font-tech font-bold transition cursor-pointer"
                          >
                            注满
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Cost Preview & Selection Signifier */}
                    <div className="text-[9.5px] text-slate-400 font-code flex items-center justify-between pt-0.5">
                      <span>${tierDef.cost.toLocaleString()}</span>
                      <span className="text-cyan-300 font-bold">{tierDef.techPointCost}点</span>
                    </div>

                    <div className={`text-[9px] font-tech text-center py-0.5 rounded border transition ${
                      isSelected 
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold' 
                        : 'bg-slate-950 text-slate-500 border-slate-800 group-hover:text-slate-300'
                    }`}>
                      {isSelected ? '✓ 已锁定深度解析' : '🔍 点击查看世界赛战略影响'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 3.5 DEDICATED DESCRIPTIVE INFO PANEL: CUMULATIVE STAT BENEFITS & ROAD TO WORLDS IMPACT */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/40 border border-cyan-500/40 space-y-4 shadow-2xl relative overflow-hidden">
            {/* Background Ambient Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Panel Top Navigation & Tier Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-tech font-black text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  科研阶位深度技术解析 · 通往世界赛战略影响看板
                </span>
              </div>

              {/* Tier Switcher Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
                {[1, 2, 3, 4, 5].map(lvl => {
                  const isLvlUnlocked = currentLevel >= lvl;
                  const isLvlTarget = currentLevel + 1 === lvl;
                  const isLvlActive = activeTierLevel === lvl;

                  return (
                    <button
                      key={lvl}
                      onClick={() => setSelectedTierDetail(lvl)}
                      className={`px-3 py-1 rounded-xl text-xs font-tech font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                        isLvlActive
                          ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-600/30 ring-1 ring-cyan-300'
                          : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      <span>Tier {lvl}</span>
                      {isLvlUnlocked ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : isLvlTarget ? (
                        <Sparkles className="w-3 h-3 text-amber-300" />
                      ) : (
                        <Lock className="w-3 h-3 text-slate-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Tier Header Card */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 via-indigo-500/20 to-purple-500/20 border border-cyan-500/40 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                  {activeTierLevel === 5 ? '👑' : activeTierLevel === 4 ? '⚡' : activeTierLevel === 3 ? '❄️' : activeTierLevel === 2 ? '🌊' : '🌱'}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-tech font-black text-white text-base">
                      Tier {activeTierLevel} · {activeCumInfo.title}
                    </h3>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full font-code font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      {activeCumInfo.stageBadge}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-code font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      耐力指数：{activeCumInfo.bo5EnduranceRating} 级
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    {activeTierDef?.detail}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-right shrink-0">
                <span className={`text-xs font-code font-bold px-3 py-1.5 rounded-xl border inline-block ${
                  currentLevel >= activeTierLevel
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : currentLevel + 1 === activeTierLevel
                    ? 'bg-amber-950/60 border-amber-500/40 text-amber-300 animate-pulse'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}>
                  {currentLevel >= activeTierLevel
                    ? '✓ 该阶位已掌握生效'
                    : currentLevel + 1 === activeTierLevel
                    ? '⚡ 当前下一阶攻坚目标'
                    : '🔒 待攻坚前序阶位'}
                </span>
              </div>
            </div>

            {/* 3 Core Metric & Road to Worlds Panels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 relative z-10">
              
              {/* Card 1: Cumulative Stat Benefits */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-rose-500/30 space-y-3 shadow-inner">
                <div className="flex items-center justify-between border-b border-rose-500/20 pb-2">
                  <span className="text-xs font-tech font-extrabold text-rose-300 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-rose-400" />
                    截至该阶位累计属性总成
                  </span>
                  <span className="text-[10px] font-code text-slate-400">
                    (Cumulative Benefits)
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-400 font-sans">手腕积劳负荷累计抑制:</span>
                    <span className="font-code font-black text-rose-400 text-sm">
                      -{activeCumInfo.cumulativeStrainReduction}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-400 font-sans">理疗康复周期累计缩减:</span>
                    <span className="font-code font-black text-teal-300 text-sm">
                      -{activeCumInfo.cumulativeTherapyReduction}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-400 font-sans">基地理疗门诊账单减免:</span>
                    <span className="font-code font-bold text-emerald-400">
                      享受 {100 - activeCumInfo.cumulativeTherapyReduction}% 折扣
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-400 font-sans">粉丝狂热度累计产出:</span>
                    <span className="font-code font-bold text-amber-300">
                      +{activeCumInfo.cumulativeHype} Hype
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-rose-300/90 font-code font-bold p-2 rounded-lg bg-rose-950/30 border border-rose-500/20">
                  🎯 战力赋能：{activeCumInfo.clutchAdvantageText}
                </div>
              </div>

              {/* Card 2: Road to Worlds Strategic Impact */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/30 space-y-3 shadow-inner md:col-span-1">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                  <span className="text-xs font-tech font-extrabold text-amber-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    出征全球总决赛 (Road to Worlds) 影响
                  </span>
                  <span className="text-[10px] font-code text-amber-400 font-bold">
                    {activeCumInfo.bo5EnduranceRating} 级
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/20 space-y-1">
                    <span className="text-[10px] font-tech font-bold text-amber-400 block">
                      【核心质变突破】
                    </span>
                    <p className="font-tech font-bold text-white text-xs leading-snug">
                      {activeCumInfo.worldsImpactHeadline}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1 text-slate-300 text-[11px] leading-relaxed font-sans">
                    <span className="text-[10px] font-tech font-bold text-cyan-300 block">
                      【高压生死局深度解析】
                    </span>
                    <p>
                      {activeCumInfo.roadToWorldsDetailedImpact}
                    </p>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 font-sans pt-1 border-t border-slate-800">
                  🏆 赛事场景：{activeCumInfo.worldsStageName}
                </div>
              </div>

              {/* Card 3: R&D Investment Planning & Action Dock */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 space-y-3 shadow-inner">
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                  <span className="text-xs font-tech font-extrabold text-cyan-300 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    科研注资台账与推进规划
                  </span>
                  <span className="text-[10px] font-code text-slate-400">
                    (R&D Investment)
                  </span>
                </div>

                <div className="space-y-2 text-xs font-code">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-400 font-sans">累计金库资金投入:</span>
                    <span className="font-black text-emerald-400">
                      ${activeCumInfo.cumulativeCost.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-400 font-sans">累计 R&D 科研点数:</span>
                    <span className="font-black text-cyan-300">
                      {activeCumInfo.cumulativeTechPoints} 点
                    </span>
                  </div>

                  {activeTierDef && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px]">
                      <span className="text-slate-400 font-sans">本阶位研发开支:</span>
                      <span className="text-slate-300">
                        ${activeTierDef.cost.toLocaleString()} + {activeTierDef.techPointCost}点
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress bar within inspector for this tier */}
                <div className="p-2.5 rounded-lg bg-slate-950/90 border border-cyan-500/30 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-tech">
                    <span className="text-cyan-300 font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3 text-cyan-400" /> 该阶位点数推进条
                    </span>
                    <span className="font-code font-bold text-cyan-300">
                      {currentLevel >= activeTierLevel ? '100% (已结项)' : currentLevel + 1 === activeTierLevel ? `${pointsInvestedPercent}%` : '0%'}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-emerald-400 transition-all duration-300 rounded-full"
                      style={{ 
                        width: `${currentLevel >= activeTierLevel ? 100 : currentLevel + 1 === activeTierLevel ? pointsInvestedPercent : 0}%` 
                      }}
                    />
                  </div>
                </div>

                {/* Action CTA */}
                {currentLevel + 1 === activeTierLevel ? (
                  <div className="pt-1">
                    <button
                      onClick={handleUpgrade}
                      disabled={!canPurchase}
                      className={`w-full py-2.5 rounded-xl font-tech font-bold text-xs uppercase transition cursor-pointer flex items-center justify-center gap-2 shadow-md ${
                        canPurchase
                          ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-rose-600/30'
                          : 'bg-slate-950 text-slate-500 border border-slate-800 cursor-not-allowed opacity-75'
                      }`}
                    >
                      <FlaskConical className="w-3.5 h-3.5" />
                      <span>{canPurchase ? `立即启动 Tier ${activeTierLevel} 研发` : '资源未就绪，请参考进度条'}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : currentLevel >= activeTierLevel ? (
                  <div className="text-center py-2 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 font-tech font-bold text-xs flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>该科技阶位已于一线战队全面生效</span>
                  </div>
                ) : (
                  <div className="text-center py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-500 font-tech text-xs">
                    🔒 需先攻克 Tier {activeTierLevel - 1} 科技前置
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* 4. ACTIVE TARGET & UPGRADE PURCHASE ACTION DOCK */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            {!isMaxTier && nextTierInfo ? (
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-tech font-black text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    下一阶研发目标：Tier {nextTier}「{nextTierInfo.title}」
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-code font-bold">
                    {nextTierInfo.perkBadge}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  解锁专属特权：<strong className="text-rose-300">{nextTierInfo.perkName}</strong> - {nextTierInfo.perkDetail}
                </p>

                {/* Detailed Cost Analysis */}
                <div className="flex items-center gap-3 text-xs font-code pt-1 flex-wrap">
                  <span className="text-slate-400">
                    所需资金: <strong className={hasEnoughFunds ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                      ${upgradeCost.toLocaleString()}
                    </strong>
                    {!hasEnoughFunds && (
                      <span className="text-rose-400 text-[10px] ml-1">
                        (尚缺 ${(upgradeCost - clubFunds).toLocaleString()})
                      </span>
                    )}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400">
                    所需 R&D 科研点数: <strong className={hasEnoughRdPoints ? 'text-cyan-300' : 'text-rose-400 font-bold'}>
                      {upgradeRdPointsCost} 点
                    </strong>
                    {!hasEnoughRdPoints && (
                      <span className="text-rose-400 text-[10px] ml-1">
                        (尚缺 {upgradeRdPointsCost - availableRdPoints} 点)
                      </span>
                    )}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-amber-400">
                    粉丝狂热度: +{nextTierInfo.hypeReward || 5} Hype
                  </span>
                </div>

                {/* Visual Dual Progress Meters (Points Investment + Funds) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1.5">
                  <div className="p-2 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-tech">
                      <span className="text-cyan-300 flex items-center gap-1 font-bold">
                        <Zap className="w-3.5 h-3.5 fill-cyan-400" /> R&D 科研点数投资
                      </span>
                      <span className="font-code font-extrabold text-cyan-300">{pointsInvestedPercent}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 transition-all duration-300"
                        style={{ width: `${pointsInvestedPercent}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 font-code flex items-center justify-between">
                      <span>就绪: {effectivePointsForNextTier} / {upgradeRdPointsCost} 点</span>
                      <span className={pointsInvestedPercent >= 100 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                        {pointsInvestedPercent >= 100 ? '✓ 点数已满额' : `差 ${remainingRdPointsNeeded} 点`}
                      </span>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-tech">
                      <span className="text-emerald-300 flex items-center gap-1 font-bold">
                        <DollarSign className="w-3.5 h-3.5" /> 俱乐部金库资金匹配
                      </span>
                      <span className="font-code font-extrabold text-emerald-300">{fundsReadyPercent}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                        style={{ width: `${fundsReadyPercent}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 font-code flex items-center justify-between">
                      <span>金库: ${clubFunds.toLocaleString()} / ${upgradeCost.toLocaleString()}</span>
                      <span className={fundsReadyPercent >= 100 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                        {fundsReadyPercent >= 100 ? '✓ 资金充裕' : `差 $${(upgradeCost - clubFunds).toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-purple-300 font-tech font-bold text-sm">
                  <Award className="w-5 h-5 text-purple-400" />
                  <span>已解锁最高阶【纳米神经拟态外骨骼装甲】！</span>
                </div>
                <p className="text-xs text-slate-400 font-sans">
                  手腕积劳累积永久减免 50% 极限！理疗周期与开支缩短 50%，终生免除重度恶性腱鞘炎！
                </p>
              </div>
            )}

            {/* Action Button */}
            <div className="shrink-0 flex items-center gap-2">
              {isMaxTier ? (
                <div className="px-5 py-3 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-tech font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  <span>⭐ 已达科研巅峰极限</span>
                </div>
              ) : (
                <button
                  onClick={handleUpgrade}
                  disabled={!canPurchase}
                  className={`px-6 py-3.5 rounded-xl font-tech font-extrabold text-xs uppercase transition-all cursor-pointer flex items-center gap-2.5 shadow-lg active:scale-95 ${
                    canPurchase
                      ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-rose-600/30 hover:shadow-rose-600/50'
                      : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed opacity-75'
                  }`}
                >
                  <FlaskConical className="w-4 h-4" />
                  <span>
                    {canPurchase
                      ? `注资研发 Tier ${nextTier} · $${upgradeCost.toLocaleString()} + ${upgradeRdPointsCost}点`
                      : !hasEnoughFunds
                      ? `资金不足 (差 $${(upgradeCost - clubFunds).toLocaleString()})`
                      : `科研点不足 (差 ${upgradeRdPointsCost - availableRdPoints}点)`}
                  </span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* 5. PRACTICAL EXPLANATION & VALUE PROPOSITION FOOTER */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-rose-300 font-tech font-bold">
                <HeartPulse className="w-4 h-4 text-rose-400" />
                <span>20小时马拉松经营防线</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                高强度排位冲分、训练赛对抗与商业直播会持续累积手腕肌腱剪切力（Strain）。本医学研发从源头削减最高 50% 负荷累积，保障选手巅峰微操！
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-teal-300 font-tech font-bold">
                <Clock className="w-4 h-4 text-teal-400" />
                <span>理疗康复周期与开支缩减</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                随着康复医学升级，理疗门诊与康复疗程开支享受最高 50% 折扣，手部恢复速度倍增，让选手在季后赛关键战役中保持 100 专注精力！
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-cyan-300 font-tech font-bold">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>R&D 科研点数获取渠道</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                每日晨间名局复盘、豪门训练赛战术研判、教练团队加成与日历赛季周度结算均会持续充盈科研点数储备，驱动实验室工程突破。
              </p>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};
