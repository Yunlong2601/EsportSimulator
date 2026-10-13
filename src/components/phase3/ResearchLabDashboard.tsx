import React, { useState } from 'react';
import { 
  FlaskConical, 
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
  Search,
  Check,
  Eye,
  Flame,
  Radio,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { DynastyState, PlayerStats } from '../../types/game';
import { 
  RDResearchCategory, 
  RD_CATEGORIES_META, 
  ALL_RD_RESEARCH_NODES, 
  RDResearchNode, 
  RDResearchNodeLevel,
  getNodeCumulativeBenefits
} from '../../data/researchLabData';
import { INITIAL_MERCH_SHOP_STATE } from '../../data/merchData';
import { soundEngine } from '../../utils/audio';

export interface ResearchLabDashboardProps {
  dynasty: DynastyState;
  onUpdateDynasty: React.Dispatch<React.SetStateAction<DynastyState>>;
  rdPoints?: number;
  setRdPoints?: React.Dispatch<React.SetStateAction<number>>;
  onPurchaseInjuryUpgrade?: (cost?: number, points?: number) => { success: boolean; message: string };
  playerStats?: PlayerStats;
  onOpenPhysio?: () => void;
  onAddLog?: (message: string, type: 'win' | 'loss' | 'event' | 'gear') => void;
  initialCategory?: RDResearchCategory;
}

export const ResearchLabDashboard: React.FC<ResearchLabDashboardProps> = ({
  dynasty,
  onUpdateDynasty,
  rdPoints,
  setRdPoints,
  onPurchaseInjuryUpgrade,
  playerStats,
  onOpenPhysio,
  onAddLog,
  initialCategory = 'HUMAN_PERFORMANCE'
}) => {
  const [selectedCategory, setSelectedCategory] = useState<RDResearchCategory | 'ALL'>(initialCategory);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('injury_prevention');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Resources
  const availableRdPoints = rdPoints !== undefined ? rdPoints : (dynasty.techPoints ?? 120);
  const clubFunds = dynasty.budget;

  // Get current upgrade level of any node
  const getNodeLevel = (nodeId: string): number => {
    return dynasty.merchShop?.rdUpgrades?.[nodeId] || 0;
  };

  // Filtered nodes
  const filteredNodes = ALL_RD_RESEARCH_NODES.filter(node => {
    const matchesCategory = selectedCategory === 'ALL' || node.category === selectedCategory;
    const matchesSearch = searchQuery.trim() === '' || 
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate stats for top HUD
  const totalResearchedTiers = ALL_RD_RESEARCH_NODES.reduce((acc, node) => acc + getNodeLevel(node.id), 0);
  const totalMaxTiers = ALL_RD_RESEARCH_NODES.reduce((acc, node) => acc + node.maxLevel, 0);
  const injuryLevel = getNodeLevel('injury_prevention');
  const currentStrainReduction = Math.min(50, injuryLevel * 10);

  // Handler to invest points into any upgrade tree's next tier
  const handleInvestPoints = (nodeId: string, amount: number) => {
    soundEngine.playClick();
    const currentInvested = dynasty.merchShop?.rdInvestedPoints?.[nodeId] || 0;
    const currentLevel = getNodeLevel(nodeId);
    const node = ALL_RD_RESEARCH_NODES.find(n => n.id === nodeId);
    if (!node || currentLevel >= node.maxLevel) return;

    const nextTierInfo = node.levels[currentLevel];
    if (!nextTierInfo) return;

    const targetPoints = nextTierInfo.techPointCost;
    const needed = Math.max(0, targetPoints - currentInvested);
    if (needed <= 0) {
      setFeedbackNotice(`【${node.name}】下一阶科研点数已 100% 满额注资就绪！`);
      return;
    }

    const actualInvest = Math.min(amount, availableRdPoints, needed);
    if (actualInvest <= 0) {
      soundEngine.playDefeat();
      setFeedbackNotice(`❌ 可用 R&D 科研点数不足，当前仅有 ${availableRdPoints} 点`);
      return;
    }

    const newAvailable = Math.max(0, availableRdPoints - actualInvest);
    if (setRdPoints) {
      setRdPoints(newAvailable);
    }

    const newInvested = currentInvested + actualInvest;
    const updatedDynasty: DynastyState = {
      ...dynasty,
      techPoints: newAvailable,
      merchShop: {
        ...(dynasty.merchShop || INITIAL_MERCH_SHOP_STATE),
        rdInvestedPoints: {
          ...(dynasty.merchShop?.rdInvestedPoints || {}),
          [nodeId]: newInvested
        }
      }
    };

    onUpdateDynasty(updatedDynasty);
    soundEngine.playLevelUp();

    const pct = Math.round((newInvested / targetPoints) * 100);
    const msg = `⚡ 成功为「${node.name}」注入 ${actualInvest} 点科研点数！下一阶点数投资进度：${pct}% (${newInvested}/${targetPoints} 点)`;
    setFeedbackNotice(msg);
    if (onAddLog) onAddLog(msg, 'event');
  };

  // Upgrade Handler
  const handleUpgradeNode = (node: RDResearchNode) => {
    soundEngine.playClick();
    const currentLevel = getNodeLevel(node.id);

    if (currentLevel >= node.maxLevel) {
      setFeedbackNotice(`【${node.name}】已达顶级科研巅峰，无需继续研发！`);
      return;
    }

    const nextTier = currentLevel + 1;
    const nextTierInfo = node.levels[nextTier - 1];
    if (!nextTierInfo) return;

    const costFunds = nextTierInfo.cost;
    const currentInvested = dynasty.merchShop?.rdInvestedPoints?.[node.id] || 0;
    const remainingPointsNeeded = Math.max(0, nextTierInfo.techPointCost - currentInvested);

    // Validation
    if (clubFunds < costFunds) {
      soundEngine.playDefeat();
      setFeedbackNotice(`❌ 俱乐部金库资金不足：需要 $${costFunds.toLocaleString()}，当前仅有 $${Math.round(clubFunds).toLocaleString()} (尚缺 $${Math.round(costFunds - clubFunds).toLocaleString()})`);
      return;
    }

    if (availableRdPoints < remainingPointsNeeded) {
      soundEngine.playDefeat();
      setFeedbackNotice(`❌ R&D 科研点数不足：尚需 ${remainingPointsNeeded} 点，当前仅有 ${availableRdPoints} 点 (尚缺 ${remainingPointsNeeded - availableRdPoints} 点)`);
      return;
    }

    // Special case for 'injury_prevention': use onPurchaseInjuryUpgrade if provided
    if (node.id === 'injury_prevention' && onPurchaseInjuryUpgrade) {
      const result = onPurchaseInjuryUpgrade(costFunds, remainingPointsNeeded);
      setFeedbackNotice(result.message);
      if (result.success) {
        if (onAddLog) onAddLog(result.message, 'win');
      } else {
        soundEngine.playDefeat();
      }
      return;
    }

    // Generic upgrade handler for other nodes
    const newRdPoints = Math.max(0, availableRdPoints - remainingPointsNeeded);
    if (setRdPoints) {
      setRdPoints(newRdPoints);
    }

    const updatedDynasty: DynastyState = {
      ...dynasty,
      budget: Math.max(0, dynasty.budget - costFunds),
      techPoints: newRdPoints,
      merchShop: {
        ...(dynasty.merchShop || INITIAL_MERCH_SHOP_STATE),
        rdUpgrades: {
          ...(dynasty.merchShop?.rdUpgrades || {}),
          [node.id]: nextTier
        },
        rdInvestedPoints: {
          ...(dynasty.merchShop?.rdInvestedPoints || {}),
          [node.id]: 0
        }
      }
    };

    onUpdateDynasty(updatedDynasty);
    soundEngine.playLevelUp();
    soundEngine.playVictory();

    const successMsg = `🔬【科研实验室突破】「${node.name}」成功晋升至 Tier ${nextTier}！获得特权：${nextTierInfo.perkBadge}（${nextTierInfo.bonusDisplay}）`;
    setFeedbackNotice(successMsg);
    if (onAddLog) {
      onAddLog(successMsg, 'win');
    }
  };

  const selectedNode = ALL_RD_RESEARCH_NODES.find(n => n.id === selectedNodeId) || ALL_RD_RESEARCH_NODES[0];
  const selectedNodeCurrentLevel = getNodeLevel(selectedNode.id);
  const isSelectedNodeMaxed = selectedNodeCurrentLevel >= selectedNode.maxLevel;
  const selectedNodeNextLevelInfo = !isSelectedNodeMaxed ? selectedNode.levels[selectedNodeCurrentLevel] : null;

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* 1. TOP STATS HUD CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 shrink-0">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between shadow-inner">
          <div>
            <span className="text-[10px] text-slate-400 block font-tech">俱乐部资金储备</span>
            <span className="text-base font-code font-black text-emerald-400 tracking-tight">
              ${clubFunds.toLocaleString()}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between shadow-inner">
          <div>
            <span className="text-[10px] text-slate-400 block font-tech">R&D 科研技术点</span>
            <span className="text-base font-code font-black text-cyan-400 tracking-tight flex items-center gap-1">
              <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400" />
              {availableRdPoints} 点
            </span>
          </div>
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <FlaskConical className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between shadow-inner">
          <div>
            <span className="text-[10px] text-slate-400 block font-tech">实验室攻克阶位</span>
            <span className="text-base font-code font-black text-purple-400 tracking-tight">
              {totalResearchedTiers} <span className="text-xs text-slate-500 font-sans">/ {totalMaxTiers}</span>
            </span>
          </div>
          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between shadow-inner">
          <div>
            <span className="text-[10px] text-slate-400 block font-tech">伤病防线免伤率</span>
            <span className="text-base font-code font-black text-rose-400 tracking-tight flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-rose-400" />
              -{currentStrainReduction}%
            </span>
          </div>
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <HeartPulse className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 2. CATEGORY SWITCHER TABS & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80 shrink-0">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
          <button
            onClick={() => {
              soundEngine.playClick();
              setSelectedCategory('ALL');
            }}
            className={`px-3 py-1.5 rounded-xl font-tech font-bold text-xs whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'ALL'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>全领域概览 (ALL)</span>
          </button>

          {(Object.keys(RD_CATEGORIES_META) as RDResearchCategory[]).map(catKey => {
            const meta = RD_CATEGORIES_META[catKey];
            const isSelected = selectedCategory === catKey;
            return (
              <button
                key={catKey}
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedCategory(catKey);
                }}
                className={`px-3.5 py-1.5 rounded-xl font-tech font-bold text-xs whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? `${meta.themeColor.bg} ${meta.themeColor.border} border ${meta.themeColor.accent} ${meta.themeColor.glow}`
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
                }`}
              >
                <span>{meta.icon}</span>
                <span>{meta.name}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative shrink-0 sm:w-56">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜索科研项目/加成..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackNotice && (
        <div className="px-4 py-2.5 bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-rose-500/40 rounded-xl flex items-center justify-between text-xs animate-fadeIn shrink-0">
          <span className="text-slate-200 font-tech font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin-slow shrink-0" />
            {feedbackNotice}
          </span>
          <button
            onClick={() => setFeedbackNotice(null)}
            className="text-slate-400 hover:text-white p-1 cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. MAIN WORKSPACE: TWO-COLUMN LAYOUT (Grid of Cards + Right Detail Inspection Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
        
        {/* Left Column: Research Nodes List / Cards (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col space-y-3 overflow-y-auto overscroll-contain pr-1 custom-scrollbar">
          {filteredNodes.map(node => {
            const currentLevel = getNodeLevel(node.id);
            const isMaxed = currentLevel >= node.maxLevel;
            const nextLevel = currentLevel + 1;
            const nextLevelInfo = !isMaxed ? node.levels[nextLevel - 1] : null;
            const isSelected = selectedNodeId === node.id;
            const catMeta = RD_CATEGORIES_META[node.category];

            // Points investment tracking toward next tier
            const nodeInvestedPoints = dynasty.merchShop?.rdInvestedPoints?.[node.id] || 0;
            const reqNodePoints = nextLevelInfo?.techPointCost || 0;
            const effectiveNodePoints = nodeInvestedPoints > 0 ? nodeInvestedPoints : Math.min(availableRdPoints, reqNodePoints);
            const pointsInvestedPercent = isMaxed ? 100 : reqNodePoints > 0 ? Math.min(100, Math.round((effectiveNodePoints / reqNodePoints) * 100)) : 100;
            const remainingPointsNeeded = Math.max(0, reqNodePoints - nodeInvestedPoints);

            const canAfford = nextLevelInfo 
              ? (clubFunds >= nextLevelInfo.cost && (nodeInvestedPoints >= reqNodePoints || availableRdPoints >= remainingPointsNeeded)) 
              : false;

            return (
              <div
                key={node.id}
                onClick={() => {
                  setSelectedNodeId(node.id);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? `${catMeta.themeColor.bg} ${catMeta.themeColor.border} ring-1 ring-cyan-500/40 shadow-lg`
                    : 'bg-slate-900/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
              >
                {/* Header & Badges */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl shrink-0 shadow-inner">
                      {node.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-tech font-extrabold text-white text-sm">
                          {node.name}
                        </h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-code font-bold border ${catMeta.themeColor.badge}`}>
                          {catMeta.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans mt-0.5 line-clamp-1">
                        {node.englishName}
                      </p>
                    </div>
                  </div>

                  {/* Level Pill */}
                  <div className="text-right shrink-0">
                    <span className={`text-xs font-code font-black px-2.5 py-1 rounded-xl border ${
                      isMaxed 
                        ? 'bg-purple-950/60 border-purple-500/50 text-purple-300'
                        : currentLevel > 0
                        ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}>
                      {isMaxed ? '⭐ Lv.MAX' : `Tier ${currentLevel} / ${node.maxLevel}`}
                    </span>
                  </div>
                </div>

                {/* Overall Tier Progression Bar */}
                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-tech text-slate-400">
                    <span>科技树总阶位完成度</span>
                    <span className="font-code">{Math.round((currentLevel / node.maxLevel) * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isMaxed
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                          : 'bg-gradient-to-r from-cyan-500 to-indigo-500'
                      }`}
                      style={{ width: `${(currentLevel / node.maxLevel) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Visual Progress Bar: Percentage of Points Invested Toward Next Tier */}
                {!isMaxed && nextLevelInfo && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-tech">
                      <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                        下一阶点数投资进度 (Tier {nextLevel})
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`font-code font-black text-xs px-2 py-0.5 rounded-full border ${
                          pointsInvestedPercent >= 100 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                            : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        }`}>
                          {pointsInvestedPercent}%
                        </span>
                        {pointsInvestedPercent >= 100 && (
                          <span className="text-[10px] text-emerald-400 font-bold hidden sm:inline">
                            ✓ 点数已满足
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Glowing Progress Bar Track */}
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5 relative shadow-inner">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          pointsInvestedPercent >= 100
                            ? 'bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                            : 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500'
                        }`}
                        style={{ width: `${pointsInvestedPercent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-code text-slate-400">
                      <span>已注资/就绪: <strong className="text-cyan-300">{effectiveNodePoints}</strong> / {reqNodePoints} 点</span>
                      <div className="flex items-center gap-1">
                        {remainingPointsNeeded > 0 && (
                          <span className="text-rose-400">差 {remainingPointsNeeded} 点</span>
                        )}
                        {/* Quick Point Injection Buttons */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInvestPoints(node.id, 5);
                          }}
                          disabled={availableRdPoints < 5 || remainingPointsNeeded <= 0}
                          className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-[10px] text-cyan-300 border border-slate-700 transition cursor-pointer"
                          title="为该科技注入 5 点"
                        >
                          +5点
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInvestPoints(node.id, remainingPointsNeeded);
                          }}
                          disabled={availableRdPoints < 1 || remainingPointsNeeded <= 0}
                          className="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 disabled:opacity-30 text-[10px] text-cyan-200 border border-cyan-500/40 transition cursor-pointer"
                          title="一键注满该科技所需点数"
                        >
                          注满
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Next Tier Perks or Max Status */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  {isMaxed ? (
                    <div className="flex items-center gap-1.5 text-xs text-purple-300 font-tech">
                      <Award className="w-4 h-4 text-purple-400" />
                      <span>已解锁终极科技巅峰：{node.levels[node.maxLevel - 1]?.perkBadge}</span>
                    </div>
                  ) : nextLevelInfo ? (
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300 font-tech font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span>下阶解锁：{nextLevelInfo.perkBadge}</span>
                      </div>
                      <p className="text-[11px] text-emerald-400 font-code">
                        {nextLevelInfo.bonusDisplay}
                      </p>
                    </div>
                  ) : null}

                  {/* Inline Action Button */}
                  {!isMaxed && nextLevelInfo && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpgradeNode(node);
                      }}
                      className={`px-3.5 py-1.5 rounded-xl font-tech font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                        canAfford
                          ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/30 active:scale-95'
                          : 'bg-slate-950 text-slate-500 border border-slate-800 hover:text-slate-400'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>
                        研发 · ${nextLevelInfo.cost.toLocaleString()} + {remainingPointsNeeded > 0 ? `${remainingPointsNeeded}点` : '点数已满'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredNodes.length === 0 && (
            <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-2">
              <FlaskConical className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-tech text-slate-400">未找到匹配的科研项目</p>
              <button
                onClick={() => {
                  setSelectedCategory('ALL');
                  setSearchQuery('');
                }}
                className="text-xs text-cyan-400 hover:underline font-tech"
              >
                重置筛选条件
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Deep Node Inspector & Full Tier Tree Visualizer (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col bg-slate-900/80 border border-slate-800 rounded-2xl p-4 overflow-y-auto overscroll-contain custom-scrollbar space-y-4">
          <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-900/40 to-slate-950 border border-indigo-500/30 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                {selectedNode.icon}
              </div>
              <div>
                <h3 className="font-tech font-black text-white text-base">
                  {selectedNode.name}
                </h3>
                <span className="text-xs text-slate-400 font-sans block">
                  {selectedNode.englishName}
                </span>
              </div>
            </div>
            <span className="text-xs font-code font-bold text-cyan-400 px-2.5 py-1 rounded-xl bg-cyan-950/60 border border-cyan-500/30">
              Tier {selectedNodeCurrentLevel} / {selectedNode.maxLevel}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            {selectedNode.description}
          </p>

          {/* Points Investment Progress Bar for Selected Node */}
          {!isSelectedNodeMaxed && selectedNodeNextLevelInfo && (() => {
            const selectedNodeInvested = dynasty.merchShop?.rdInvestedPoints?.[selectedNode.id] || 0;
            const selectedNodeReqPoints = selectedNodeNextLevelInfo.techPointCost;
            const selectedNodeEffectivePoints = selectedNodeInvested > 0 ? selectedNodeInvested : Math.min(availableRdPoints, selectedNodeReqPoints);
            const selectedNodePointsPercent = selectedNodeReqPoints > 0 ? Math.min(100, Math.round((selectedNodeEffectivePoints / selectedNodeReqPoints) * 100)) : 100;
            const selectedNodeRemainingPoints = Math.max(0, selectedNodeReqPoints - selectedNodeInvested);

            return (
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-cyan-500/30 space-y-2.5 shadow-lg">
                <div className="flex items-center justify-between text-xs font-tech">
                  <span className="text-cyan-300 font-extrabold flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                    下一阶点数投资推进 (Tier {selectedNodeCurrentLevel + 1})
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`font-code font-black text-xs px-2 py-0.5 rounded-full border ${
                      selectedNodePointsPercent >= 100
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    }`}>
                      {selectedNodePointsPercent}%
                    </span>
                    {selectedNodePointsPercent >= 100 && (
                      <span className="text-[10px] text-emerald-400 font-bold">
                        ✓ 满足点数门槛
                      </span>
                    )}
                  </div>
                </div>

                {/* The Visual Progress Bar */}
                <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5 relative shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                    style={{ width: `${selectedNodePointsPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-code text-slate-400">
                  <span>已注入/就绪: <strong className="text-cyan-300">{selectedNodeEffectivePoints}</strong> / {selectedNodeReqPoints} 点</span>
                  <span className={selectedNodePointsPercent >= 100 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {selectedNodePointsPercent >= 100 ? '✓ 点数已满额' : `尚缺 ${selectedNodeRemainingPoints} 点`}
                  </span>
                </div>

                {/* Quick Planning Investment Action Buttons */}
                <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-slate-900">
                  <span className="text-[10px] text-slate-500 font-sans">
                    提前规划投入
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleInvestPoints(selectedNode.id, 5)}
                      disabled={availableRdPoints < 5 || selectedNodeRemainingPoints <= 0}
                      className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-cyan-300 font-code font-bold text-[11px] border border-cyan-500/30 transition cursor-pointer"
                    >
                      +5 点
                    </button>
                    <button
                      onClick={() => handleInvestPoints(selectedNode.id, 10)}
                      disabled={availableRdPoints < 10 || selectedNodeRemainingPoints <= 0}
                      className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-cyan-300 font-code font-bold text-[11px] border border-cyan-500/30 transition cursor-pointer"
                    >
                      +10 点
                    </button>
                    <button
                      onClick={() => handleInvestPoints(selectedNode.id, selectedNodeRemainingPoints)}
                      disabled={availableRdPoints < 1 || selectedNodeRemainingPoints <= 0}
                      className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-tech font-bold text-[11px] transition cursor-pointer shadow-sm shadow-cyan-600/30"
                    >
                      注满 ({selectedNodeRemainingPoints}点)
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Action Upgrade Hero Button for Selected Node */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex flex-col gap-2.5 shadow-inner">
            <div className="flex items-center justify-between text-xs font-tech">
              <span className="text-slate-400">研发注资决策</span>
              {isSelectedNodeMaxed ? (
                <span className="text-purple-400 font-bold">已达上限 (Lv.MAX)</span>
              ) : selectedNodeNextLevelInfo ? (
                <span className="text-slate-300">
                  晋升 Tier {selectedNodeCurrentLevel + 1}
                </span>
              ) : null}
            </div>

            {isSelectedNodeMaxed ? (
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300 text-xs font-tech font-bold text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>该科研项目已全面封顶，终极属性已生效！</span>
              </div>
            ) : selectedNodeNextLevelInfo ? (() => {
              const selectedNodeInvested = dynasty.merchShop?.rdInvestedPoints?.[selectedNode.id] || 0;
              const remainingPointsNeeded = Math.max(0, selectedNodeNextLevelInfo.techPointCost - selectedNodeInvested);
              const canAffordNode = clubFunds >= selectedNodeNextLevelInfo.cost && (selectedNodeInvested >= selectedNodeNextLevelInfo.techPointCost || availableRdPoints >= remainingPointsNeeded);

              return (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs font-code">
                    <div className={`p-2 rounded-lg border ${
                      clubFunds >= selectedNodeNextLevelInfo.cost
                        ? 'bg-slate-950 border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                    }`}>
                      <span className="text-[10px] text-slate-500 block font-tech">金库资金</span>
                      ${selectedNodeNextLevelInfo.cost.toLocaleString()}
                    </div>
                    <div className={`p-2 rounded-lg border ${
                      selectedNodeInvested >= selectedNodeNextLevelInfo.techPointCost || availableRdPoints >= remainingPointsNeeded
                        ? 'bg-slate-950 border-cyan-500/30 text-cyan-400'
                        : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                    }`}>
                      <span className="text-[10px] text-slate-500 block font-tech">R&D 科研点</span>
                      {remainingPointsNeeded > 0 ? `尚需 ${remainingPointsNeeded} 点` : '点数已满额'}
                    </div>
                  </div>

                  <button
                    onClick={() => handleUpgradeNode(selectedNode)}
                    disabled={!canAffordNode}
                    className={`w-full py-3 rounded-xl font-tech font-extrabold text-xs uppercase transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                      canAffordNode
                        ? 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white shadow-cyan-600/30'
                        : 'bg-slate-950 text-slate-500 border border-slate-800 cursor-not-allowed opacity-75'
                    }`}
                  >
                    <FlaskConical className="w-4 h-4" />
                    <span>
                      {clubFunds < selectedNodeNextLevelInfo.cost
                        ? `资金不足 (差 $${(selectedNodeNextLevelInfo.cost - clubFunds).toLocaleString()})`
                        : availableRdPoints < remainingPointsNeeded
                        ? `科研点不足 (差 ${remainingPointsNeeded - availableRdPoints}点)`
                        : `立即启动科研升级 · Tier ${selectedNodeCurrentLevel + 1}`}
                    </span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })() : null}
          </div>

          {/* Full Tier Tree Timeline */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-tech font-bold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>全阶位研发演化路径图 (TIER PROGRESSION)</span>
            </h4>

            <div className="space-y-2">
              {selectedNode.levels.map((tierInfo) => {
                const isUnlocked = selectedNodeCurrentLevel >= tierInfo.level;
                const isCurrent = selectedNodeCurrentLevel === tierInfo.level;
                const isNext = selectedNodeCurrentLevel + 1 === tierInfo.level;
                const cumBenefit = getNodeCumulativeBenefits(selectedNode.id, tierInfo.level);

                const selectedNodeInvested = dynasty.merchShop?.rdInvestedPoints?.[selectedNode.id] || 0;
                const effectivePts = selectedNodeInvested > 0 ? selectedNodeInvested : Math.min(availableRdPoints, tierInfo.techPointCost);
                const pct = isUnlocked ? 100 : isNext ? Math.min(100, Math.round((effectivePts / tierInfo.techPointCost) * 100)) : 0;
                const remPoints = Math.max(0, tierInfo.techPointCost - selectedNodeInvested);

                return (
                  <div
                    key={tierInfo.level}
                    className={`p-3 rounded-xl border text-xs transition-all relative group ${
                      isCurrent
                        ? 'bg-gradient-to-r from-cyan-950/50 to-indigo-950/50 border-cyan-500/60 shadow-md ring-1 ring-cyan-500/30'
                        : isUnlocked
                        ? 'bg-slate-950/70 border-emerald-500/30 text-slate-300'
                        : isNext
                        ? 'bg-slate-950/90 border-slate-700 text-slate-400'
                        : 'bg-slate-950/40 border-slate-800/60 text-slate-600 opacity-60'
                    }`}
                  >
                    {/* Floating Hover Tooltip: Cumulative Stat Benefits & Road to Worlds Impact */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-[104%] mb-2 w-72 sm:w-80 p-3 rounded-2xl bg-slate-950/95 border border-cyan-500/60 shadow-[0_15px_35px_rgba(0,0,0,0.85)] backdrop-blur-xl z-50 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto text-left space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-[10px] font-code font-bold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                          Tier {tierInfo.level} 累计增益
                        </span>
                        <span className="text-[10px] text-amber-300 font-tech font-bold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                          <Award className="w-3 h-3 text-amber-400" />
                          耐力评级 {cumBenefit.bo5EnduranceRating} 级
                        </span>
                      </div>

                      <div className="text-[11px] font-tech font-bold text-amber-300 flex items-center gap-1 bg-amber-950/30 px-2 py-1 rounded-lg border border-amber-500/20">
                        <span>🏆 {cumBenefit.stageBadge}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 text-[10px] font-code bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                        <div>
                          <span className="text-slate-400 block text-[9px] font-tech">累计属性收益</span>
                          <span className="text-emerald-400 font-bold">{tierInfo.bonusDisplay}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] font-tech">累计研发投入</span>
                          <span className="text-cyan-300 font-bold">${cumBenefit.cumulativeCost.toLocaleString()} + {cumBenefit.cumulativeTechPoints}点</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-300 leading-relaxed font-sans border-t border-slate-800 pt-1.5 space-y-0.5">
                        <span className="text-cyan-300 font-tech font-bold block">出征全球总决赛影响：</span>
                        <p className="line-clamp-3 text-slate-300/90">{cumBenefit.roadToWorldsDetailedImpact}</p>
                        <span className="text-amber-300/90 font-code font-bold block pt-0.5">⚡ {cumBenefit.clutchAdvantageText}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-code text-[10px] font-bold ${
                          isUnlocked
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : isNext
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                            : 'bg-slate-800 text-slate-500'
                        }`}>
                          {isUnlocked ? '✓' : tierInfo.level}
                        </span>
                        <span className={`font-tech font-bold ${
                          isUnlocked ? 'text-white' : isNext ? 'text-slate-200' : 'text-slate-500'
                        }`}>
                          Tier {tierInfo.level} · {tierInfo.title}
                        </span>
                      </div>

                      <span className="text-[10px] px-2 py-0.5 rounded-full font-code font-bold bg-slate-900 border border-slate-800 text-slate-300">
                        {tierInfo.perkBadge}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-1 font-sans leading-relaxed">
                      {tierInfo.detail}
                    </p>

                    {/* Road to Worlds Stage Tag */}
                    <div className="mt-1.5 flex items-center gap-2 text-[10px] font-tech">
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-code">
                        🏆 {cumBenefit.stageBadge}
                      </span>
                      <span className="text-slate-400 hidden sm:inline truncate">
                        {cumBenefit.clutchAdvantageText}
                      </span>
                    </div>

                    {/* Progress Bar for all tiers */}
                    <div className="mt-2 p-1.5 rounded-lg bg-slate-900/90 border border-cyan-500/30 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-tech text-cyan-300">
                        <span className="flex items-center gap-1 font-bold">
                          <Zap className="w-3 h-3 text-cyan-400" /> 点数投资推进
                        </span>
                        <span className="font-code font-bold">{pct}% ({isUnlocked ? `${tierInfo.techPointCost}/${tierInfo.techPointCost}` : isNext ? `${effectivePts}/${tierInfo.techPointCost}` : `0/${tierInfo.techPointCost}`}点)</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div 
                          className={`h-full transition-all duration-300 rounded-full ${
                            isUnlocked
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                              : isNext
                              ? 'bg-gradient-to-r from-cyan-400 to-emerald-400'
                              : 'bg-slate-800'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      {/* Quick inject for next tier */}
                      {isNext && remPoints > 0 && (
                        <div className="flex items-center justify-end gap-1 pt-1 border-t border-slate-800/80">
                          <button
                            onClick={() => handleInvestPoints(selectedNode.id, 5)}
                            disabled={availableRdPoints < 5}
                            className="px-1.5 py-0.5 rounded bg-slate-950 hover:bg-slate-800 disabled:opacity-30 text-[9px] text-cyan-300 border border-cyan-500/30 transition cursor-pointer"
                          >
                            +5点
                          </button>
                          <button
                            onClick={() => handleInvestPoints(selectedNode.id, remPoints)}
                            disabled={availableRdPoints < 1}
                            className="px-2 py-0.5 rounded bg-cyan-700 hover:bg-cyan-600 disabled:opacity-30 text-[9px] text-white font-tech font-bold transition cursor-pointer"
                          >
                            注满
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-code">
                      <span className="text-emerald-400 font-bold">{tierInfo.bonusDisplay}</span>
                      {!isUnlocked && (
                        <span className="text-slate-500">
                          ${tierInfo.cost.toLocaleString()} + {tierInfo.techPointCost}点
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
