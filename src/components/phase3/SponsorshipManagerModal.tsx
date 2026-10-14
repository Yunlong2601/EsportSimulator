import React, { useState } from 'react';
import { 
  Building2, 
  DollarSign, 
  Users, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  X, 
  TrendingUp, 
  Award, 
  Lock, 
  Shield, 
  Zap, 
  Layers, 
  RotateCcw, 
  ChevronRight, 
  SlidersHorizontal,
  Handshake,
  AlertTriangle,
  Gift,
  HelpCircle,
  FileText
} from 'lucide-react';
import { 
  DynastyState, 
  PeripheralCategory, 
  PeripheralSponsorBrand, 
  PeripheralSponsorshipState 
} from '../../types/game';
import { 
  FANBASE_REVENUE_MILESTONES, 
  PERIPHERAL_BRANDS_CATALOG,
  INITIAL_PERIPHERAL_SPONSORSHIP_STATE,
  FanbaseMilestoneTier 
} from '../../data/peripheralSponsorshipData';
import { soundEngine } from '../../utils/audio';

interface SponsorshipManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  dynasty: DynastyState;
  onUpdateDynasty: React.Dispatch<React.SetStateAction<DynastyState>>;
  onAddLog?: (message: string, type: 'win' | 'loss' | 'event' | 'gear') => void;
}

export const SponsorshipManagerModal: React.FC<SponsorshipManagerModalProps> = ({
  isOpen,
  onClose,
  dynasty,
  onUpdateDynasty,
  onAddLog
}) => {
  if (!isOpen) return null;

  // Active Tab / Category Filter
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'ALL' | PeripheralCategory | 'SIGNED'>('ALL');

  // Negotiation Drawer / Sub-modal State
  const [negotiatingBrand, setNegotiatingBrand] = useState<PeripheralSponsorBrand | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<'CONSERVATIVE' | 'GAMBLE' | 'AGGRESSIVE'>('CONSERVATIVE');
  const [isNegotiating, setIsNegotiating] = useState<boolean>(false);
  const [negotiationResult, setNegotiationResult] = useState<{
    outcome: 'SUCCESS' | 'COMPROMISE' | 'FAILED';
    title: string;
    description: string;
    finalSigningBonus: number;
    finalMonthlyPayout: number;
  } | null>(null);

  // Tab: 'brands' (外设品牌目录) | 'milestones' (粉丝阶梯分成) | 'history' (谈判编年史)
  const [activeMainTab, setActiveMainTab] = useState<'brands' | 'milestones' | 'history'>('brands');

  // Cooldown / monthly claim toast
  const [claimToast, setClaimToast] = useState<string | null>(null);

  // Current Fanbase & Community Fanbase Count
  const currentFanbase = Math.max(
    dynasty.fanHype || 0,
    dynasty.communityRelations?.fanbaseCount || 15000
  );

  // Determine current milestone tier
  const activeMilestoneTier = [...FANBASE_REVENUE_MILESTONES]
    .reverse()
    .find(m => currentFanbase >= m.threshold) || FANBASE_REVENUE_MILESTONES[0];

  const nextMilestoneTier = FANBASE_REVENUE_MILESTONES.find(m => currentFanbase < m.threshold);

  const currentMultiplier = activeMilestoneTier.revenueMultiplier;

  // Peripheral Sponsorship State from Dynasty
  const peripheralState: PeripheralSponsorshipState = dynasty.peripheralSponsorships || INITIAL_PERIPHERAL_SPONSORSHIP_STATE;

  // Calculate current total monthly revenue from signed peripheral brands
  const currentMonthlyRevenue = Object.values(peripheralState.signedBrands).reduce((sum, brand) => {
    return sum + (brand?.activeMonthlyPayout || 0);
  }, 0);

  // Count signed slots
  const signedCount = Object.values(peripheralState.signedBrands).filter(Boolean).length;

  // Strategy definitions for the negotiation minigame
  const STRATEGY_DETAILS = {
    CONSERVATIVE: {
      name: '🛡️ 稳健长约协议 (Conservative)',
      tag: '高确定性 · 保障基础',
      successRate: 98,
      bonusMultiplier: 1.0,
      monthlyMultiplier: 1.0,
      desc: '基准签约金与标准月赞助流水，条款安全可靠，商务代表直接拍板签约。'
    },
    GAMBLE: {
      name: '📈 粉丝对赌条款 (Milestone Gamble)',
      tag: '阶梯分成 · 狂热分红',
      successRate: 85,
      bonusMultiplier: 0.85,
      monthlyMultiplier: 1.35,
      desc: '签约金适度让利 -15%，但激活粉丝对赌条款：每月赞助费额外享受 +35% 阶梯溢价！'
    },
    AGGRESSIVE: {
      name: '⚡ 豪门霸权施压 (Aggressive Leverage)',
      tag: '顶级溢价 · 品牌博弈',
      successRate: Math.min(92, Math.max(60, 95 - dynasty.worldRanking * 3 + Math.round(dynasty.reputation * 0.3))),
      bonusMultiplier: 1.3,
      monthlyMultiplier: 1.25,
      desc: `依托战队世界排名 (#${dynasty.worldRanking}) 与豪门美誉度强硬谈判，全盘索要 +30% 签约金与 +25% 月收入！`
    }
  };

  // Handle Monthly Recurring Revenue Claim
  const handleClaimMonthlyRevenue = () => {
    if (currentMonthlyRevenue <= 0) {
      alert('当前暂未签约任何外设品牌，请先完成商务洽谈签署合同！');
      return;
    }

    soundEngine.playCash();
    const payout = currentMonthlyRevenue;

    onUpdateDynasty(prev => {
      const existing = prev.peripheralSponsorships || INITIAL_PERIPHERAL_SPONSORSHIP_STATE;
      return {
        ...prev,
        budget: prev.budget + payout,
        peripheralSponsorships: {
          ...existing,
          lastClaimTimestamp: Date.now(),
          claimedMonthsCount: (existing.claimedMonthsCount || 0) + 1
        }
      };
    });

    setClaimToast(`💰 成功结算本月外设品牌赞助款 +$${payout.toLocaleString()}！已存入俱乐部金库！`);
    if (onAddLog) {
      onAddLog(`💰【品牌赞助结算】成功领取本月外设品牌联合赞助金 $${payout.toLocaleString()} (含 ${activeMilestoneTier.label} 粉丝加成)！`, 'event');
    }
    setTimeout(() => setClaimToast(null), 3500);
  };

  // Execute negotiation
  const handleStartNegotiation = (brand: PeripheralSponsorBrand) => {
    soundEngine.playClick();
    setNegotiatingBrand(brand);
    setSelectedStrategy('CONSERVATIVE');
    setNegotiationResult(null);
  };

  const handleConfirmNegotiation = () => {
    if (!negotiatingBrand) return;
    soundEngine.playClick();
    setIsNegotiating(true);

    const strat = STRATEGY_DETAILS[selectedStrategy];

    setTimeout(() => {
      const roll = Math.random() * 100;
      let outcome: 'SUCCESS' | 'COMPROMISE' | 'FAILED' = 'SUCCESS';
      let title = '';
      let desc = '';
      let signingRate = strat.bonusMultiplier;
      let monthlyRate = strat.monthlyMultiplier;

      if (roll <= strat.successRate) {
        outcome = 'SUCCESS';
        soundEngine.playVictory();
        if (selectedStrategy === 'AGGRESSIVE') {
          title = '🏆 谈判大获全胜！品牌方全盘接受豪门溢价！';
          desc = `商务代表对你战队的全球商业号召力高度认可，同意支付 +30% 签约金并锁定顶格月赞助！`;
        } else if (selectedStrategy === 'GAMBLE') {
          title = '📈 成功签署对赌协议！解锁狂热粉丝分红！';
          desc = `双方敲定粉丝对赌条款，后续只要粉丝继续增长，每月将获得超额赞助流水！`;
        } else {
          title = '✍️ 签约顺利达成！稳健长约协议生效！';
          desc = `双方代表友好握手，第一笔签约金已即时到账，全套定制外设将于本周送达基地！`;
        }
      } else {
        // Did not hit optimal rate -> compromise
        outcome = 'COMPROMISE';
        soundEngine.playSuccess();
        signingRate = 1.0;
        monthlyRate = 1.05;
        title = '🤝 经过拉锯磋商，双方达成高价值折中协议！';
        desc = `品牌商务总监对个别溢价条款略有犹豫，经过一番推杯换盏的拉锯，最终按基准溢价敲定合作！`;
      }

      // Calculate final financial terms with active Fanbase Multiplier
      const finalSigning = Math.round(negotiatingBrand.baseSigningBonus * currentMultiplier * signingRate);
      const finalMonthly = Math.round(negotiatingBrand.baseMonthlyPayout * currentMultiplier * monthlyRate);

      setNegotiationResult({
        outcome,
        title,
        description: desc,
        finalSigningBonus: finalSigning,
        finalMonthlyPayout: finalMonthly
      });

      setIsNegotiating(false);

      // Save signed brand to DynastyState
      const signedBrandObj: PeripheralSponsorBrand = {
        ...negotiatingBrand,
        status: 'SIGNED',
        signedStrategy: selectedStrategy,
        activeSigningBonus: finalSigning,
        activeMonthlyPayout: finalMonthly,
        signedAt: new Date().toLocaleDateString('zh-CN')
      };

      onUpdateDynasty(prev => {
        const curPeri = prev.peripheralSponsorships || INITIAL_PERIPHERAL_SPONSORSHIP_STATE;
        const newSigned = {
          ...curPeri.signedBrands,
          [negotiatingBrand.category]: signedBrandObj
        };

        const newTotalMonthly = Object.values(newSigned).reduce((sum, b) => sum + (b?.activeMonthlyPayout || 0), 0);

        const newHistory = [
          {
            id: `neg_${Date.now()}`,
            brandId: negotiatingBrand.id,
            brandName: negotiatingBrand.brandName,
            strategy: strat.name,
            outcome,
            finalMonthly,
            finalSigning,
            timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
          },
          ...curPeri.negotiationHistory
        ].slice(0, 20);

        return {
          ...prev,
          budget: prev.budget + finalSigning,
          fanHype: prev.fanHype + Math.round(2000 * currentMultiplier),
          peripheralSponsorships: {
            ...curPeri,
            signedBrands: newSigned,
            totalMonthlyRevenue: newTotalMonthly,
            negotiationHistory: newHistory
          }
        };
      });

      if (onAddLog) {
        onAddLog(`✍️【品牌商务签约】成功与 [${negotiatingBrand.brandName}] 达成合作！获得签约金 $${finalSigning.toLocaleString()}，每月锁定赞助流水 $${finalMonthly.toLocaleString()}！`, 'event');
      }
    }, 1100);
  };

  // Terminate contract
  const handleTerminateContract = (category: PeripheralCategory) => {
    const existing = peripheralState.signedBrands[category];
    if (!existing) return;
    if (!confirm(`确定要提前解约 [${existing.brandName}] 吗？解约后将清空该品类的月赞助流水与特权加成，以便换签其他品牌。`)) {
      return;
    }

    soundEngine.playClick();
    onUpdateDynasty(prev => {
      const curPeri = prev.peripheralSponsorships || INITIAL_PERIPHERAL_SPONSORSHIP_STATE;
      const newSigned = {
        ...curPeri.signedBrands,
        [category]: null
      };
      const newTotalMonthly = Object.values(newSigned).reduce((sum, b) => sum + (b?.activeMonthlyPayout || 0), 0);
      return {
        ...prev,
        peripheralSponsorships: {
          ...curPeri,
          signedBrands: newSigned,
          totalMonthlyRevenue: newTotalMonthly
        }
      };
    });

    if (onAddLog) {
      onAddLog(`📄【商务解约】已与 [${existing.brandName}] 友好提前解约，空出 [${category}] 赞助席位！`, 'event');
    }
  };

  // Filtered brands list
  const filteredBrands = PERIPHERAL_BRANDS_CATALOG.filter(b => {
    if (activeCategoryFilter === 'ALL') return true;
    if (activeCategoryFilter === 'SIGNED') {
      const signed = peripheralState.signedBrands[b.category];
      return signed?.id === b.id;
    }
    return b.category === activeCategoryFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-slate-950 border border-amber-500/40 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden font-sans">
        
        {/* Header Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-tech font-extrabold text-white text-base tracking-wide flex items-center gap-1.5">
                  外设品牌赞助管理中心
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-tech font-bold border border-amber-500/40">
                  PHASE 3 商业帝国
                </span>
              </div>
              <div className="text-[11px] text-slate-300 flex items-center gap-2 mt-0.5 font-sans">
                <span>外设联名赞助</span>
                <span>•</span>
                <span className="text-amber-400 font-code font-bold">
                  {currentFanbase.toLocaleString()} 粉丝基数
                </span>
                <span>•</span>
                <span className="text-emerald-400 font-code font-bold">
                  {activeMilestoneTier.badge} ({activeMilestoneTier.revenueMultiplier.toFixed(2)}x 乘数)
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            title="关闭窗口"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Toast Notification */}
        {claimToast && (
          <div className="bg-emerald-950/90 border-b border-emerald-500/50 p-2 text-center text-xs font-tech font-bold text-emerald-300 flex items-center justify-center gap-1.5 animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{claimToast}</span>
          </div>
        )}

        {/* Financial Overview & Monthly Revenue Claim Bar */}
        <div className="p-3 bg-slate-900/90 border-b border-slate-800 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            
            {/* Metric 1: Monthly Projected Cashflow */}
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-tech text-slate-400 flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-emerald-400" /> 每月被动赞助流水
                </span>
                <div className="text-base font-extrabold font-code text-emerald-300 mt-0.5">
                  ${currentMonthlyRevenue.toLocaleString()}
                  <span className="text-[10px] text-slate-400 font-sans font-normal ml-1">/月</span>
                </div>
              </div>
              <button
                onClick={handleClaimMonthlyRevenue}
                disabled={currentMonthlyRevenue <= 0}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-tech font-extrabold transition cursor-pointer flex items-center gap-1 shadow-sm shrink-0 ${
                  currentMonthlyRevenue > 0
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20 active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
                title="结算本月赞助金并注入金库"
              >
                <Gift className="w-3 h-3" />
                <span>领取本月款项</span>
              </button>
            </div>

            {/* Metric 2: Fanbase Milestone Multiplier */}
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-amber-500/30 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-tech text-slate-400 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" /> 粉丝商业阶梯加成
                </span>
                <span className="text-[9px] font-code px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  {activeMilestoneTier.revenueMultiplier.toFixed(2)}x 激活中
                </span>
              </div>
              <div className="text-xs font-tech font-bold text-amber-300 mt-0.5 flex items-center justify-between">
                <span>{activeMilestoneTier.badge}</span>
                <span className="text-[10px] text-slate-400 font-sans font-normal">
                  {nextMilestoneTier 
                    ? `距离【${nextMilestoneTier.label}】还需 ${(nextMilestoneTier.threshold - currentFanbase).toLocaleString()} 粉丝` 
                    : '已登顶最高阶梯 👑'}
                </span>
              </div>
            </div>

            {/* Metric 3: Active Peripheral Slots */}
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-cyan-500/30 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-tech text-slate-400 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-cyan-400" /> 赞助席位入驻
                </span>
                <span className="text-[10px] font-code font-bold text-cyan-300">
                  {signedCount} / 4 席
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                {(['KEYBOARD', 'CHAIR', 'ENERGY_DRINK', 'HEADSET'] as PeripheralCategory[]).map(cat => {
                  const isSigned = !!peripheralState.signedBrands[cat];
                  const icons: Record<PeripheralCategory, string> = {
                    KEYBOARD: '⌨️',
                    CHAIR: '🪑',
                    ENERGY_DRINK: '⚡',
                    HEADSET: '🎧'
                  };
                  return (
                    <div
                      key={cat}
                      className={`flex-1 py-0.5 rounded text-center text-xs border ${
                        isSigned
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-600'
                      }`}
                      title={`${cat}: ${isSigned ? peripheralState.signedBrands[cat]?.brandName : '空缺'}`}
                    >
                      {icons[cat]}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Main Tab Navigation */}
        <div className="px-3 pt-2 bg-slate-900/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveMainTab('brands');
            }}
            className={`pb-2 px-3 flex items-center gap-1.5 border-b-2 text-xs font-tech font-bold transition cursor-pointer ${
              activeMainTab === 'brands'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>品牌赞助库 (Brand Catalog)</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveMainTab('milestones');
            }}
            className={`pb-2 px-3 flex items-center gap-1.5 border-b-2 text-xs font-tech font-bold transition cursor-pointer ${
              activeMainTab === 'milestones'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>粉丝里程碑阶梯 ({activeMilestoneTier.badge})</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveMainTab('history');
            }}
            className={`pb-2 px-3 flex items-center gap-1.5 border-b-2 text-xs font-tech font-bold transition cursor-pointer ${
              activeMainTab === 'history'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>商务谈判档案 ({peripheralState.negotiationHistory.length})</span>
          </button>
        </div>

        {/* TAB 1: BRANDS CATALOG */}
        {activeMainTab === 'brands' && (
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: 'ALL', label: '全部品类', icon: '🌐' },
                { id: 'KEYBOARD', label: '机械键盘', icon: '⌨️' },
                { id: 'CHAIR', label: '电竞座驾', icon: '🪑' },
                { id: 'ENERGY_DRINK', label: '功能饮品', icon: '⚡' },
                { id: 'HEADSET', label: '竞技耳机', icon: '🎧' },
                { id: 'SIGNED', label: '当前已签约', icon: '✓' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveCategoryFilter(f.id as typeof activeCategoryFilter);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-tech font-bold cursor-pointer transition whitespace-nowrap flex items-center gap-1 ${
                    activeCategoryFilter === f.id
                      ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                  }`}
                >
                  <span>{f.icon}</span>
                  <span>{f.label}</span>
                </button>
              ))}
            </div>

            {/* Brand Catalog Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredBrands.map(brand => {
                const isSignedThisBrand = peripheralState.signedBrands[brand.category]?.id === brand.id;
                const isCategoryOccupied = !!peripheralState.signedBrands[brand.category] && !isSignedThisBrand;
                const isFanbaseLocked = currentFanbase < brand.fanbaseReq;

                // Boosted financial figures with current fanbase milestone multiplier
                const boostedSigning = Math.round(brand.baseSigningBonus * currentMultiplier);
                const boostedMonthly = Math.round(brand.baseMonthlyPayout * currentMultiplier);

                // Tier badge styles
                const tierColor: Record<string, string> = {
                  'SS': 'bg-gradient-to-r from-red-500 to-amber-500 text-white border-amber-300',
                  'S': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                  'A': 'bg-purple-500/20 text-purple-300 border-purple-500/40',
                  'B': 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                };

                return (
                  <div
                    key={brand.id}
                    className={`p-3 rounded-xl border transition flex flex-col justify-between ${
                      isSignedThisBrand
                        ? 'bg-slate-900/90 border-emerald-500/50 shadow-md shadow-emerald-950/30'
                        : isFanbaseLocked
                        ? 'bg-slate-950/60 border-slate-900 opacity-70'
                        : 'bg-slate-900/80 border-slate-800 hover:border-amber-500/40'
                    }`}
                  >
                    <div>
                      {/* Brand Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl p-1.5 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
                            {brand.logo}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-tech font-bold text-white text-xs">
                                {brand.brandName}
                              </h4>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-code font-bold border ${tierColor[brand.tier] || tierColor.B}`}>
                                {brand.tier} 级
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 block font-sans">
                              {brand.categoryNameCn} · {brand.companyName}
                            </span>
                          </div>
                        </div>

                        {/* Fanbase Status Stamp */}
                        {isSignedThisBrand ? (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-tech font-bold shrink-0">
                            履约中 ✓
                          </span>
                        ) : isFanbaseLocked ? (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 font-tech font-bold shrink-0 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            需 {brand.fanbaseReq.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-tech font-bold shrink-0 flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            粉丝达标
                          </span>
                        )}
                      </div>

                      {/* Product Model & Tagline */}
                      <div className="mt-2 p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[10px]">
                        <div className="text-amber-300/90 font-tech font-bold truncate">
                          {brand.productModel}
                        </div>
                        <div className="text-slate-400 text-[9px] truncate">
                          “{brand.tagline}”
                        </div>
                      </div>

                      {/* Brand Perk Buff */}
                      <div className="mt-2 text-[10px] space-y-0.5">
                        <div className="text-purple-300 font-tech font-bold flex items-center gap-1">
                          <Zap className="w-3 h-3 text-purple-400" />
                          <span>{brand.perkName}</span>
                        </div>
                        <div className="text-slate-300 text-[9px] font-sans">
                          {brand.perkBuff}
                        </div>
                      </div>

                      {/* Financial Terms Preview */}
                      <div className="mt-2.5 p-2 rounded-lg bg-slate-950 border border-slate-800 grid grid-cols-2 gap-2 text-center">
                        <div>
                          <span className="text-[9px] text-slate-400 block font-tech">预计签约金</span>
                          <span className="text-xs font-code font-bold text-amber-300">
                            +${boostedSigning.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block font-tech">每月赞助金</span>
                          <span className="text-xs font-code font-bold text-emerald-300">
                            +${boostedMonthly.toLocaleString()}
                            <span className="text-[8px] text-slate-400 font-normal">/月</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-3">
                      {isSignedThisBrand ? (
                        <div className="flex items-center gap-1.5">
                          <div className="flex-1 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-[10px] font-tech font-bold text-center">
                            合约生效中 (签约于 {peripheralState.signedBrands[brand.category]?.signedAt || '本赛季'})
                          </div>
                          <button
                            onClick={() => handleTerminateContract(brand.category)}
                            className="px-2 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-tech transition cursor-pointer shrink-0"
                            title="提前解约此品牌"
                          >
                            解约
                          </button>
                        </div>
                      ) : isFanbaseLocked ? (
                        <button
                          disabled
                          className="w-full py-1.5 rounded-lg bg-slate-950 text-slate-600 border border-slate-900 text-[10px] font-tech font-bold cursor-not-allowed flex items-center justify-center gap-1"
                        >
                          <Lock className="w-3 h-3" />
                          <span>粉丝未达标 (还需 {(brand.fanbaseReq - currentFanbase).toLocaleString()} 粉丝)</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartNegotiation(brand)}
                          className={`w-full py-2 rounded-lg text-[10px] font-tech font-extrabold uppercase transition cursor-pointer flex items-center justify-center gap-1.5 ${
                            isCategoryOccupied
                              ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                              : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-98'
                          }`}
                        >
                          <Handshake className="w-3.5 h-3.5" />
                          <span>{isCategoryOccupied ? '开启置换谈判 (将替代现有品牌)' : '发起商务洽谈 →'}</span>
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TAB 2: FANBASE MILESTONES */}
        {activeMainTab === 'milestones' && (
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            
            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border border-amber-500/40">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-tech font-bold text-white">
                  粉丝规模阶梯与赞助分成机制
                </h4>
              </div>
              <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">
                外设品牌方极度重视战队的受众号召力。战队粉丝基数每突破一个阶段门槛，所有签约的外设品牌签约金与每月赞助费将自动获得永久阶梯加成！
              </p>
            </div>

            {/* Milestones Timeline */}
            <div className="space-y-2">
              {FANBASE_REVENUE_MILESTONES.map((tier, idx) => {
                const isReached = currentFanbase >= tier.threshold;
                const isCurrent = activeMilestoneTier.id === tier.id;

                return (
                  <div
                    key={tier.id}
                    className={`p-3 rounded-xl border transition ${
                      isCurrent
                        ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-950/20'
                        : isReached
                        ? 'bg-slate-900/60 border-emerald-500/30'
                        : 'bg-slate-950 border-slate-900 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{tier.badge.split(' ')[0]}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-tech font-bold text-white text-xs">
                              {tier.label}
                            </h5>
                            <span className="text-[9px] font-code px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                              {tier.revenueMultiplier.toFixed(2)}x 商业乘数
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                                当前所处阶段
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            门槛：{tier.threshold.toLocaleString()} 粉丝 • {tier.bonusPercentLabel}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        {isReached ? (
                          <span className="text-xs font-tech font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 已达成
                          </span>
                        ) : (
                          <span className="text-xs font-tech font-bold text-slate-500">
                            未达成
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 text-[10px] text-slate-300 border-t border-slate-800/80 pt-1.5">
                      {tier.description}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TAB 3: NEGOTIATION HISTORY */}
        {activeMainTab === 'history' && (
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {peripheralState.negotiationHistory.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400 font-tech">暂无外设谈判归档记录</p>
                <p className="text-[10px] text-slate-500">
                  在“品牌赞助库”中发起洽谈，达成签约后将在此记录商业谈判纪要。
                </p>
              </div>
            ) : (
              peripheralState.negotiationHistory.map(record => (
                <div
                  key={record.id}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-tech font-bold text-white">
                        {record.brandName}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        {record.outcome === 'SUCCESS' ? '完美签约 ✓' : '折中达成 ✓'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      策略：{record.strategy} • 时间：{record.timestamp}
                    </div>
                  </div>
                  <div className="text-right font-code text-[10px]">
                    <div className="text-amber-300 font-bold">
                      +${record.finalSigning.toLocaleString()} 签约金
                    </div>
                    <div className="text-emerald-400">
                      +${record.finalMonthly.toLocaleString()}/月
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* NEGOTIATION INTERACTIVE DRAWER / MODAL OVERLAY */}
        {negotiatingBrand && (
          <div className="absolute inset-0 z-20 bg-slate-950/95 backdrop-blur-sm p-4 flex flex-col justify-between animate-fade-in">
            <div className="space-y-3 overflow-y-auto">
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{negotiatingBrand.logo}</span>
                  <div>
                    <h3 className="font-tech font-extrabold text-white text-sm">
                      商务谈判桌：{negotiatingBrand.brandName}
                    </h3>
                    <span className="text-[10px] text-slate-400">
                      {negotiatingBrand.productModel} • 粉丝门槛已核验
                    </span>
                  </div>
                </div>

                {!isNegotiating && !negotiationResult && (
                  <button
                    onClick={() => setNegotiatingBrand(null)}
                    className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Dialogue Bubble */}
              <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/30 flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0 font-bold text-xs">
                  商务总监
                </div>
                <div className="text-xs text-slate-200 leading-relaxed font-sans">
                  “贵战队目前坐拥 <strong className="text-amber-400 font-code font-bold">{currentFanbase.toLocaleString()}</strong> 粉丝与赛区极高关注度。我们愿意提供品牌全矩阵资源赞助。请提出贵方的合作方案策略。”
                </div>
              </div>

              {/* Negotiation Strategy Picker */}
              {!negotiationResult && (
                <div className="space-y-2">
                  <label className="text-[11px] font-tech font-bold text-slate-300 block">
                    选择商务谈判策略与条款方案：
                  </label>

                  {(['CONSERVATIVE', 'GAMBLE', 'AGGRESSIVE'] as ('CONSERVATIVE' | 'GAMBLE' | 'AGGRESSIVE')[]).map(key => {
                    const strat = STRATEGY_DETAILS[key];
                    const isSelected = selectedStrategy === key;

                    return (
                      <div
                        key={key}
                        onClick={() => setSelectedStrategy(key)}
                        className={`p-3 rounded-xl border transition cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 shadow-md shadow-amber-950/20'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={isSelected}
                              onChange={() => setSelectedStrategy(key)}
                              className="accent-amber-500 cursor-pointer"
                            />
                            <span className="font-tech font-bold text-white text-xs">
                              {strat.name}
                            </span>
                          </div>
                          <span className="text-[9px] font-code px-1.5 py-0.5 rounded bg-slate-950 text-amber-300 font-bold border border-slate-800">
                            成功率: {strat.successRate}%
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300 mt-1 pl-5">
                          {strat.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Ongoing Rolling Animation */}
              {isNegotiating && (
                <div className="py-8 text-center space-y-3">
                  <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-tech font-bold text-amber-400 animate-pulse">
                    品牌商务总监正在研判贵方提案，核算预期曝光 ROI...
                  </p>
                </div>
              )}

              {/* Result Card */}
              {negotiationResult && (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/50 space-y-2.5 animate-fade-in">
                  <div className="flex items-center gap-2 text-emerald-400 font-tech font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>{negotiationResult.title}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {negotiationResult.description}
                  </p>
                  
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 grid grid-cols-2 gap-2 text-center">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-tech">签约金到账</span>
                      <span className="text-sm font-code font-bold text-amber-300">
                        +${negotiationResult.finalSigningBonus.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-tech">每月赞助金</span>
                      <span className="text-sm font-code font-bold text-emerald-300">
                        +${negotiationResult.finalMonthlyPayout.toLocaleString()}/月
                      </span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-purple-950/40 border border-purple-500/30 text-[10px] text-purple-300">
                    <span className="font-bold">✨ 已激活品牌专属特权：</span>
                    <span>{negotiatingBrand.perkBuff}</span>
                  </div>
                </div>
              )}

            </div>

            {/* Drawer Bottom Controls */}
            <div className="pt-3 border-t border-slate-800">
              {negotiationResult ? (
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setNegotiatingBrand(null);
                    setNegotiationResult(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-tech font-extrabold text-xs cursor-pointer shadow-lg active:scale-98 transition"
                >
                  签署完成，返回外设赞助大厅 ✓
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    disabled={isNegotiating}
                    onClick={() => setNegotiatingBrand(null)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-tech font-bold text-xs cursor-pointer transition"
                  >
                    暂缓洽谈
                  </button>
                  <button
                    disabled={isNegotiating}
                    onClick={handleConfirmNegotiation}
                    className="flex-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-tech font-extrabold text-xs cursor-pointer shadow-lg active:scale-98 transition flex items-center justify-center gap-1.5"
                  >
                    <Handshake className="w-4 h-4" />
                    <span>敲定提案并签署合同 →</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
