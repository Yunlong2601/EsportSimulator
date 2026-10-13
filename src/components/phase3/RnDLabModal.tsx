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
  Clock
} from 'lucide-react';
import { DynastyState, PlayerStats } from '../../types/game';
import { MERCH_RD_UPGRADES, RDUpgradeDef } from '../../data/merchData';
import { investInMerchRD, estimateUpgradeImpact } from '../../utils/merchSalesManager';
import { soundEngine } from '../../utils/audio';

interface RnDLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  dynasty: DynastyState;
  onUpdateDynasty: React.Dispatch<React.SetStateAction<DynastyState>>;
  rdPoints?: number;
  onPurchaseInjuryUpgrade?: (cost?: number, points?: number) => { success: boolean; message: string };
  playerStats?: PlayerStats;
  onOpenPhysio?: () => void;
  onAddLog?: (message: string, type: 'win' | 'loss' | 'event' | 'gear') => void;
}

export const RnDLabModal: React.FC<RnDLabModalProps> = ({
  isOpen,
  onClose,
  dynasty,
  onUpdateDynasty,
  rdPoints,
  onPurchaseInjuryUpgrade,
  playerStats,
  onOpenPhysio,
  onAddLog
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'MEDICAL' | 'ALL_TECH'>('MEDICAL');
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const availableTechPoints = rdPoints !== undefined ? rdPoints : (dynasty.techPoints ?? 120);
  const clubBudget = dynasty.budget;

  const injuryDef = MERCH_RD_UPGRADES.find(u => u.id === 'injury_prevention')!;
  const currentInjuryLevel = dynasty.merchShop?.rdUpgrades?.injury_prevention || 0;
  const isMaxed = currentInjuryLevel >= injuryDef.maxLevel;
  const nextLevel = currentInjuryLevel + 1;
  const nextLevelInfo = !isMaxed ? injuryDef.levels[nextLevel - 1] : null;

  const cost = nextLevelInfo?.cost || 0;
  const techPointCost = nextLevelInfo?.techPointCost || 0;
  const canAffordBudget = clubBudget >= cost;
  const canAffordPoints = availableTechPoints >= techPointCost;
  const canAfford = canAffordBudget && canAffordPoints && !isMaxed;

  const currentLevelInfo = currentInjuryLevel > 0 ? injuryDef.levels[currentInjuryLevel - 1] : null;
  const currentStrainReduction = currentLevelInfo?.strainReduction ? Math.round(currentLevelInfo.strainReduction * 100) : 0;
  const currentTherapyReduction = currentLevelInfo?.therapyDurationReduction ? Math.round(currentLevelInfo.therapyDurationReduction * 100) : 0;

  const handleInvestInjury = (upgradeId: 'injury_prevention' | 'fabric_tech' | 'print_quality' | 'ergonomic_cut' | 'smart_chip') => {
    soundEngine.playClick();
    const def = MERCH_RD_UPGRADES.find(u => u.id === upgradeId);
    if (!def) return;

    const curLvl = dynasty.merchShop?.rdUpgrades?.[upgradeId] || 0;
    if (curLvl >= def.maxLevel) {
      setFeedbackNotice(`【${def.name}】已达科技巅峰，无需继续研发！`);
      return;
    }

    const nxtInfo = def.levels[curLvl];
    const reqCost = nxtInfo?.cost || def.baseCost;
    const reqPoints = nxtInfo?.techPointCost || 0;

    if (dynasty.budget < reqCost) {
      soundEngine.playDefeat();
      setFeedbackNotice(`❌ 俱乐部金库资金不足：需要 $${reqCost.toLocaleString()}，当前仅有 $${Math.round(dynasty.budget).toLocaleString()}`);
      return;
    }

    if (reqPoints > 0 && availableTechPoints < reqPoints) {
      soundEngine.playDefeat();
      setFeedbackNotice(`❌ 科研科技点数不足：需要 ${reqPoints} 科技点，当前仅有 ${availableTechPoints} 点（尚缺 ${reqPoints - availableTechPoints} 点）`);
      return;
    }

    if (upgradeId === 'injury_prevention' && onPurchaseInjuryUpgrade) {
      const res = onPurchaseInjuryUpgrade(reqCost, reqPoints);
      setFeedbackNotice(res.message);
      return;
    }

    soundEngine.playLevelUp();
    const { success, message, updatedDynasty } = investInMerchRD(dynasty, upgradeId, reqCost);
    if (success) {
      onUpdateDynasty(updatedDynasty);
      setFeedbackNotice(message);
      if (onAddLog) {
        onAddLog(message, 'win');
      }
    } else {
      setFeedbackNotice(message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div 
        className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-950 border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.2)] overflow-hidden chamfer-card"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-500/20 via-indigo-500/20 to-cyan-500/20 border border-rose-500/30 text-rose-300 shadow-inner">
              <FlaskConical className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-tech font-extrabold text-white tracking-wide flex items-center gap-2">
                  <span>科研实验室 · R&D LAB</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-code font-bold">
                    伤病预防与运动医学工程
                  </span>
                </h3>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                双轨注资体系：消耗俱乐部金库资金与前沿科研点数 (Tech Points)，全面强化选手身体护甲
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Currency Badges */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
              <div className="text-right">
                <span className="text-[9px] text-slate-400 block font-tech">俱乐部金库</span>
                <span className="text-xs font-code font-bold text-emerald-400">
                  ${Math.round(clubBudget).toLocaleString()}
                </span>
              </div>
              <div className="w-px h-6 bg-slate-800" />
              <div className="text-right">
                <span className="text-[9px] text-cyan-400 block font-tech">科研点数 (R&D)</span>
                <span className="text-xs font-code font-bold text-cyan-300 flex items-center justify-end gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
                  {availableTechPoints} pts
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher & Mobile Balance Strip */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-900/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('MEDICAL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-tech font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'MEDICAL'
                  ? 'bg-rose-600 text-white border border-rose-400 shadow-md shadow-rose-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>伤病预防与康复医学 (重点关注)</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-950 text-rose-300">
                Lv.{currentInjuryLevel}/5
              </span>
            </button>

            <button
              onClick={() => setActiveTab('ALL_TECH')}
              className={`px-3 py-1.5 rounded-xl text-xs font-tech font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'ALL_TECH'
                  ? 'bg-indigo-600 text-white border border-indigo-400 shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>全系科研蓝图 ({MERCH_RD_UPGRADES.length}大技术树)</span>
            </button>
          </div>

          {/* Quick Doctor Trigger Button */}
          {onOpenPhysio && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenPhysio();
              }}
              className="px-2.5 py-1 rounded-lg bg-teal-950/80 hover:bg-teal-900/80 text-teal-300 border border-teal-500/40 text-[11px] font-tech font-bold flex items-center gap-1.5 cursor-pointer transition shadow-sm"
              title="即刻前往战队队医理疗诊所"
            >
              <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
              <span>直达康复理疗中心 →</span>
            </button>
          )}
        </div>

        {/* Feedback Alert Notice */}
        {feedbackNotice && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-xl bg-indigo-950/70 border border-indigo-500/40 flex items-center justify-between text-xs text-indigo-200 animate-fadeIn">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{feedbackNotice}</span>
            </div>
            <button 
              onClick={() => setFeedbackNotice(null)}
              className="text-slate-400 hover:text-white text-[11px] cursor-pointer"
            >
              关闭
            </button>
          </div>
        )}

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {activeTab === 'MEDICAL' ? (
            <div className="space-y-5">
              {/* Feature Hero Card: Injury Prevention Node */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-indigo-950/30 border border-rose-500/40 shadow-xl space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl p-3 rounded-2xl bg-slate-950 border border-rose-500/40 shadow-inner shrink-0">
                      🩺
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base sm:text-lg font-tech font-extrabold text-white">
                          伤病预防与康复医学 (Injury Prevention & Recovery)
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-code font-bold">
                          Lv.{currentInjuryLevel} / {injuryDef.maxLevel} {isMaxed && '⭐ 至尊满阶'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
                        {injuryDef.description}
                      </p>
                    </div>
                  </div>

                  {/* Compounding Active Protection HUD */}
                  <div className="grid grid-cols-2 gap-2 sm:w-64 shrink-0">
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-rose-500/30 text-center">
                      <span className="text-[10px] text-slate-400 block font-tech">手腕积劳负荷削减</span>
                      <span className="font-code font-extrabold text-base text-rose-400">
                        -{currentStrainReduction}%
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-teal-500/30 text-center">
                      <span className="text-[10px] text-slate-400 block font-tech">理疗周期/开支减免</span>
                      <span className="font-code font-extrabold text-base text-teal-300">
                        -{currentTherapyReduction}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5-Tier Progressive Stepper Chain */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs font-tech">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-rose-400" />
                      5 阶复合安全特权递进研发路线图
                    </span>
                    <span className="text-rose-300 font-code font-bold">
                      {Math.round((currentInjuryLevel / injuryDef.maxLevel) * 100)}% 科技成熟度
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    {injuryDef.levels.map(lvl => {
                      const isUnlocked = currentInjuryLevel >= lvl.level;
                      const isNext = currentInjuryLevel + 1 === lvl.level;

                      return (
                        <div
                          key={lvl.level}
                          className={`p-3 rounded-xl border flex flex-col justify-between transition relative overflow-hidden ${
                            isUnlocked
                              ? 'bg-rose-950/50 border-rose-500/60 text-rose-200 shadow-sm'
                              : isNext
                              ? 'bg-indigo-950/50 border-indigo-500/70 text-indigo-200 shadow-md animate-pulse ring-1 ring-indigo-500/40'
                              : 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-code font-bold">
                              <span>T{lvl.level} 阶</span>
                              {isUnlocked ? (
                                <span className="text-emerald-400 flex items-center gap-0.5">
                                  <CheckCircle2 className="w-3 h-3 inline" /> 已掌握
                                </span>
                              ) : isNext ? (
                                <span className="text-amber-300 flex items-center gap-0.5">
                                  <Sparkles className="w-3 h-3 inline" /> 待突破
                                </span>
                              ) : (
                                <span className="text-slate-600">未就绪</span>
                              )}
                            </div>

                            <div className="text-xs font-tech font-bold text-white truncate" title={lvl.title}>
                              {lvl.title.split(' ')[0]}
                            </div>

                            <p className="text-[10px] text-slate-300/80 font-sans line-clamp-2 leading-relaxed">
                              {lvl.detail}
                            </p>
                          </div>

                          <div className="pt-2 mt-2 border-t border-slate-800/80 space-y-1">
                            <div className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-rose-300 border border-rose-900 font-tech font-bold truncate">
                              {lvl.perkBadge}
                            </div>
                            <div className="text-[9px] text-emerald-400 font-code font-bold truncate">
                              负荷 -{Math.round((lvl.strainReduction || 0) * 100)}% · 理疗 -{Math.round((lvl.therapyDurationReduction || 0) * 100)}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Next Target / Invest Action Card */}
                <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {!isMaxed && nextLevelInfo ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-tech font-bold text-amber-300">
                          下一阶突破目标：Lv.{nextLevel}「{nextLevelInfo.title}」
                        </span>
                        <span className="text-[10px] px-2 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-code">
                          {nextLevelInfo.perkBadge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-sans">
                        激活效果：<strong className="text-rose-300">{nextLevelInfo.perkName}</strong> - {nextLevelInfo.perkDetail}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] font-code pt-1">
                        <span className="text-slate-400">
                          所需金库资金: <strong className={canAffordBudget ? 'text-emerald-400' : 'text-rose-400'}>${cost.toLocaleString()}</strong>
                        </span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-400">
                          所需科技点数: <strong className={canAffordPoints ? 'text-cyan-400' : 'text-rose-400'}>{techPointCost} 点</strong>
                        </span>
                        <span className="text-slate-500">·</span>
                        <span className="text-amber-400">狂热度奖励: +{nextLevelInfo.hypeReward} Hype</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-purple-300 font-tech font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4 text-purple-400" />
                        <span>已解锁最高阶【纳米神经拟态外骨骼装甲】！</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        手腕积劳累积永久减免 50%，理疗开支减半，终生免疫重度恶性腕管综合征。
                      </p>
                    </div>
                  )}

                  <div className="shrink-0">
                    {isMaxed ? (
                      <div className="px-4 py-2 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-tech font-bold">
                        ⭐ 巅峰已满额
                      </div>
                    ) : (
                      <button
                        onClick={() => handleInvestInjury('injury_prevention')}
                        disabled={!canAfford}
                        className={`px-6 py-3 rounded-xl font-tech font-bold text-xs uppercase transition cursor-pointer flex items-center gap-2 shadow-lg active:scale-95 ${
                          canAfford
                            ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-rose-600/30'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        }`}
                      >
                        <FlaskConical className="w-4 h-4" />
                        <span>
                          {canAfford
                            ? `注资研发 Lv.${nextLevel} · $${cost.toLocaleString()} + ${techPointCost}点`
                            : !canAffordBudget
                            ? `资金不足 (差 $${(cost - clubBudget).toLocaleString()})`
                            : `科技点不足 (差 ${techPointCost - availableTechPoints}点)`}
                        </span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Research Synergy & Marathon 20-Hour Loop Explanation Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-rose-300 font-tech font-bold">
                    <HeartPulse className="w-4 h-4 text-rose-400" />
                    <span>20小时马拉松经营防线</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    全天候高强度排位死斗、训练赛BP与午夜商业直播会大量产出乳酸与肌腱剪切力。本研发节点从源头减少高达 50% 负荷累积，彻底解放长时间模拟收益！
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-teal-300 font-tech font-bold">
                    <Clock className="w-4 h-4 text-teal-400" />
                    <span>理疗周期与开支缩减</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    随着康复医学升级，理疗门诊与康复疗程费用全线享受最高 50% 折扣，手部恢复速度倍增，让选手在关键季后赛与全球总决赛时刻保持 100 巅峰微操！
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-cyan-300 font-tech font-bold">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span>科技点数 (Tech Points) 获取途径</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    每日晨间名局复盘 (+35% 洞察点)、豪门训练赛战术推演、日历赛季周度结算均会持续充盈俱乐部科研点数储备，驱动实验室源源不断实现工程突破。
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* ALL TECH TREE GRID VIEW */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-tech text-slate-400">
                <span>俱乐部全系科研蓝图矩阵 ({MERCH_RD_UPGRADES.length} 项)</span>
                <span>包含面料工程、微晶印花、人体工学、NFC智能及运动医学</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MERCH_RD_UPGRADES.map(upgrade => {
                  const currentLvl = dynasty.merchShop?.rdUpgrades?.[upgrade.id] || 0;
                  const isNodeMaxed = currentLvl >= upgrade.maxLevel;
                  const nxtLvl = currentLvl + 1;
                  const nxtInfo = !isNodeMaxed ? upgrade.levels[nxtLvl - 1] : null;
                  const nodeCost = nxtInfo?.cost || upgrade.baseCost;
                  const nodePoints = nxtInfo?.techPointCost || 0;

                  const canAffordNode = clubBudget >= nodeCost && (nodePoints === 0 || availableTechPoints >= nodePoints) && !isNodeMaxed;

                  return (
                    <div 
                      key={upgrade.id}
                      className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition ${
                        upgrade.id === 'injury_prevention'
                          ? 'bg-gradient-to-br from-rose-950/30 to-slate-900 border-rose-500/40 shadow-sm'
                          : isNodeMaxed
                          ? 'bg-slate-900/90 border-purple-500/40'
                          : 'bg-slate-900/60 border-slate-800'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl p-2 rounded-xl bg-slate-950 border border-slate-800">
                              {upgrade.icon}
                            </span>
                            <div>
                              <h5 className="font-tech font-bold text-sm text-white">
                                {upgrade.name}
                              </h5>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800">
                                  {upgrade.categoryName}
                                </span>
                                <span className="text-[10px] font-code text-cyan-300 font-bold">
                                  Lv.{currentLvl} / {upgrade.maxLevel}
                                </span>
                              </div>
                            </div>
                          </div>

                          <span className="text-[10px] text-emerald-400 font-code font-bold">
                            {currentLvl > 0 ? upgrade.levels[currentLvl - 1]?.bonusDisplay : '未研发'}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 font-sans line-clamp-2">
                          {upgrade.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <div className="text-[10px] font-code text-slate-400">
                          {!isNodeMaxed && nxtInfo ? (
                            <span>
                              需: <strong className="text-white">${nodeCost.toLocaleString()}</strong>
                              {nodePoints > 0 && <strong className="text-cyan-400 ml-1">+{nodePoints}点</strong>}
                            </span>
                          ) : (
                            <span className="text-purple-300">科技巅峰已掌握</span>
                          )}
                        </div>

                        {!isNodeMaxed ? (
                          <button
                            onClick={() => handleInvestInjury(upgrade.id)}
                            disabled={!canAffordNode}
                            className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold cursor-pointer transition flex items-center gap-1 active:scale-95 ${
                              canAffordNode
                                ? upgrade.id === 'injury_prevention'
                                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                            }`}
                          >
                            <span>注资突破</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[10px] font-tech text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> 已封顶
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs font-tech shrink-0">
          <div className="flex items-center gap-3 text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <DollarSign className="w-3.5 h-3.5 inline" />
              金库储备: ${Math.round(clubBudget).toLocaleString()}
            </span>
            <span className="flex items-center gap-1 text-cyan-400">
              <Sparkles className="w-3.5 h-3.5 inline" />
              科技点数: {availableTechPoints} 点
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold transition cursor-pointer"
          >
            返回俱乐部经营
          </button>
        </div>
      </div>
    </div>
  );
};

export { ResearchLabModal } from './ResearchLabModal';
