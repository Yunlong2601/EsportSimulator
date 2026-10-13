import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Shirt, 
  Sparkles, 
  Flame, 
  TrendingUp, 
  Zap, 
  DollarSign, 
  Award, 
  BarChart3, 
  Clock, 
  Lock, 
  CheckCircle2, 
  ArrowUpRight, 
  Percent, 
  Users, 
  Plus, 
  Layers, 
  AlertCircle,
  HelpCircle,
  Tag,
  Star,
  Package,
  Cpu,
  FlaskConical,
  Wrench,
  Check,
  ChevronRight,
  Calculator,
  Sliders,
  Info,
  ShieldCheck,
  Activity,
  ArrowRight
} from 'lucide-react';
import { 
  DynastyState, 
  MerchShopState, 
  MerchItem, 
  MerchSalesWeekReport,
  EsportsCalendarState
} from '../../types/game';
import { 
  INITIAL_MERCH_SHOP_STATE, 
  PRICE_TIERS,
  MERCH_RD_UPGRADES,
  RDUpgradeDef
} from '../../data/merchData';
import { 
  calculatePlayerPopularityScore, 
  calculateTournamentSuccessFactor, 
  calculateWeeklyPassiveMerchRevenue, 
  triggerFlashSaleDrop, 
  settleWeeklyMerchSales,
  calculateRDMultipliers,
  investInMerchRD,
  estimateUpgradeImpact
} from '../../utils/merchSalesManager';
import { JerseyCustomizer } from './JerseyCustomizer';
import { soundEngine } from '../../utils/audio';

interface ApparelAndMerchTabViewProps {
  dynasty: DynastyState;
  onUpdateDynasty: React.Dispatch<React.SetStateAction<DynastyState>>;
  calendarState?: EsportsCalendarState;
}

export const ApparelAndMerchTabView: React.FC<ApparelAndMerchTabViewProps> = ({
  dynasty,
  onUpdateDynasty,
  calendarState
}) => {
  const [subTab, setSubTab] = useState<'sales_analytics' | 'jersey_studio' | 'rd_lab' | 'merch_catalog'>('sales_analytics');
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const [isFlashDropActive, setIsFlashDropActive] = useState(false);
  const [rdCategoryFilter, setRdCategoryFilter] = useState<'all' | 'fabric_tech' | 'print_quality' | 'ergonomic_cut' | 'smart_chip' | 'injury_prevention'>('all');
  const [hoveredFormulaPart, setHoveredFormulaPart] = useState<string | null>(null);
  const [showSimSandbox, setShowSimSandbox] = useState(false);

  const currentWeek = calendarState?.currentWeek || 5;

  // Initialize merch shop state if not yet present
  const merchShop: MerchShopState = dynasty.merchShop || INITIAL_MERCH_SHOP_STATE;
  const rdData = useMemo(() => calculateRDMultipliers(merchShop.rdUpgrades), [merchShop.rdUpgrades]);

  // Initial simulation levels set to max tiers
  const [simLevels, setSimLevels] = useState<Record<string, number>>({
    fabric_tech: 5,
    print_quality: 5,
    ergonomic_cut: 4,
    smart_chip: 4
  });

  const simulatedRdData = useMemo(() => {
    return calculateRDMultipliers(simLevels);
  }, [simLevels]);

  const simulatedRevenueEstimate = useMemo(() => {
    const simDynasty: DynastyState = {
      ...dynasty,
      merchShop: {
        ...merchShop,
        rdUpgrades: simLevels
      }
    };
    return calculateWeeklyPassiveMerchRevenue(simDynasty, currentWeek);
  }, [dynasty, merchShop, simLevels, currentWeek]);

  const startingRoster = (dynasty.roster || []).slice(0, 5);
  const popularityData = useMemo(() => calculatePlayerPopularityScore(startingRoster), [startingRoster]);
  const tournamentData = useMemo(() => calculateTournamentSuccessFactor(dynasty), [dynasty]);

  const fanbaseCount = dynasty.communityRelations?.fanbaseCount || 150000;
  const fanbaseMultiplier = dynasty.communityRelations?.fanbaseMultiplier || 1.25;

  // Live weekly passive estimation
  const currentWeekPassiveEstimate = useMemo(() => {
    return calculateWeeklyPassiveMerchRevenue(dynasty, currentWeek);
  }, [dynasty, currentWeek]);

  // Total sales history stats
  const history = merchShop.salesHistory || [];
  const totalPassiveSalesTotal = history.reduce((sum, h) => sum + h.passiveRevenue, 0);
  const totalFlashSalesTotal = history.reduce((sum, h) => sum + h.flashSaleRevenue, 0);

  // Maximum revenue value for bar scaling
  const maxBarRevenue = useMemo(() => {
    const maxVal = Math.max(...history.map(h => h.totalWeeklyRevenue), currentWeekPassiveEstimate.totalWeeklyRevenue, 200000);
    return maxVal;
  }, [history, currentWeekPassiveEstimate]);

  // Handle Trigger Flash Sale Drop
  const handleLaunchFlashSale = () => {
    soundEngine.playLevelUp();
    setIsFlashDropActive(true);

    const { updatedDynasty, spikeResult } = triggerFlashSaleDrop(dynasty);
    onUpdateDynasty(updatedDynasty);

    setFeedbackNotice(spikeResult.message);
    setTimeout(() => {
      setIsFlashDropActive(false);
    }, 3000);
  };

  // Handle Manual Passive Settlement
  const handleSettlePassiveNow = () => {
    soundEngine.playLevelUp();
    const { updatedDynasty, report } = settleWeeklyMerchSales(dynasty, currentWeek);
    onUpdateDynasty(updatedDynasty);
    setFeedbackNotice(`💰 第${report.week}周周边被动销售流水结算完毕！已将利润 $${report.netProfit.toLocaleString()} 注入俱乐部金库！`);
  };

  // Upgrade catalog item tier
  const handleUpgradeItem = (item: MerchItem) => {
    const upgradeCost = item.retailPrice * 12;
    if (dynasty.budget < upgradeCost) {
      soundEngine.playDefeat();
      setFeedbackNotice(`⚠️ 金库预算不足 $${upgradeCost.toLocaleString()}，无法完成产线升级！`);
      return;
    }

    soundEngine.playLevelUp();
    const updatedCatalog = (merchShop.catalog || []).map(catItem => {
      if (catItem.id === item.id) {
        return {
          ...catItem,
          tierLevel: catItem.tierLevel + 1,
          baseWeeklySales: Math.round(catItem.baseWeeklySales * 1.35)
        };
      }
      return catItem;
    });

    onUpdateDynasty(prev => ({
      ...prev,
      budget: prev.budget - upgradeCost,
      merchShop: {
        ...(prev.merchShop || INITIAL_MERCH_SHOP_STATE),
        catalog: updatedCatalog
      }
    }));

    setFeedbackNotice(`✨ 成功将 [${item.name}] 产线升级至 Lv.${item.tierLevel + 1}！周产能与粉丝购买转化率提升 35%！`);
  };

  return (
    <div className="space-y-4">
      {/* Action feedback toast */}
      {feedbackNotice && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/90 via-slate-900 to-indigo-950/90 border border-amber-500/50 text-amber-200 text-xs font-tech font-bold flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{feedbackNotice}</span>
          </div>
          <button
            onClick={() => setFeedbackNotice(null)}
            className="text-slate-400 hover:text-white px-2 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner KPI Summary */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-indigo-500/30 p-3 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-52 h-52 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-pink-500 flex items-center justify-center text-slate-950 shadow-lg shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-tech font-black text-lg sm:text-xl text-white">
                  战队官方周边商城 & 定制战袍工坊
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-code font-bold">
                  Apparel & Merch
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                定制赛季首发战袍 · 粉丝经济被动变现 · 限时限量空投狂欢 · 赛事锦标与人气明星商业赋能
              </p>
            </div>
          </div>

          {/* Quick Launch Flash Sale Button */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={handleLaunchFlashSale}
              disabled={isFlashDropActive}
              className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl font-tech font-extrabold text-xs uppercase cursor-pointer transition shadow-lg flex items-center justify-center gap-2 active:scale-95 ${
                isFlashDropActive
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-gradient-to-r from-rose-500 via-amber-500 to-yellow-400 hover:from-rose-400 hover:to-yellow-300 text-slate-950 shadow-rose-500/25'
              }`}
            >
              <Flame className="w-4 h-4 text-slate-950" />
              <span>{isFlashDropActive ? '🔥 限量抢购风暴中...' : '🔥 开启限时战袍空投 (Flash Drop)'}</span>
            </button>
          </div>
        </div>

        {/* Core Financial Drivers KPI Cards (Including R&D Tech Multiplier) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-4 pt-3 border-t border-slate-800/80">
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-tech flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-emerald-400" />
              周边历史总营业额
            </span>
            <div className="font-code font-black text-sm sm:text-base text-emerald-400 mt-0.5">
              ${(merchShop.totalLifetimeMerchRevenue || 0).toLocaleString()}
            </div>
            <span className="text-[9px] text-slate-300 font-sans">
              累积售出 {(merchShop.totalJerseysSold || 0).toLocaleString()} 件战袍
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-tech flex items-center gap-1">
              <Users className="w-3 h-3 text-cyan-400" />
              粉丝基础与公关乘数
            </span>
            <div className="font-code font-black text-sm sm:text-base text-cyan-300 mt-0.5">
              x{fanbaseMultiplier.toFixed(2)} 倍率
            </div>
            <span className="text-[9px] text-slate-300 font-sans">
              活跃铁粉 {(fanbaseCount).toLocaleString()} 人
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-tech flex items-center gap-1">
              <Award className="w-3 h-3 text-amber-400" />
              大赛夺冠商业加成
            </span>
            <div className="font-code font-black text-sm sm:text-base text-amber-300 mt-0.5">
              +{(Math.round((tournamentData.multiplier - 1) * 100))}% 销量溢价
            </div>
            <span className="text-[9px] text-slate-300 font-sans truncate block" title={tournamentData.reason}>
              {tournamentData.reason}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-tech flex items-center gap-1">
              <Star className="w-3 h-3 text-pink-400" />
              当家明星选手吸金力
            </span>
            <div className="font-code font-black text-sm sm:text-base text-pink-300 mt-0.5">
              +{Math.round((popularityData.signatureMultiplier - 1) * 100)}% 签名号召
            </div>
            <span className="text-[9px] text-slate-300 font-sans truncate block">
              {popularityData.starPlayer ? `${popularityData.starPlayer.name} (${popularityData.starPlayer.role})` : '全队平均'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-purple-500/30 bg-purple-950/10">
            <span className="text-[10px] text-purple-300 font-tech flex items-center gap-1">
              <FlaskConical className="w-3 h-3 text-purple-400" />
              研发实验室溢价倍率
            </span>
            <div className="font-code font-black text-sm sm:text-base text-purple-300 mt-0.5">
              x{rdData.jerseyRevenueMultiplier.toFixed(2)} 全线增幅
            </div>
            <span className="text-[9px] text-slate-300 font-sans truncate block">
              面料Lv.{rdData.fabricLevel} · 烫印Lv.{rdData.printLevel}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation Switcher */}
      <div className="flex items-center gap-1.5 sm:gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto">
        {[
          { id: 'sales_analytics', label: '📊 营收走势 (被动周流水 VS 空投爆单)', icon: BarChart3 },
          { id: 'jersey_studio', label: '👕 战袍定制工坊 (Jersey Customizer)', icon: Shirt },
          { id: 'rd_lab', label: '🧪 战袍研发实验室 (R&D Lab)', icon: FlaskConical },
          { id: 'merch_catalog', label: '🛍️ 周边产品货架与产线升级', icon: Package }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundEngine.playClick();
                setSubTab(tab.id as typeof subTab);
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-tech font-bold transition cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. SALES ANALYTICS & PASSIVE VS FLASH SALE VISUALIZER */}
      {/* ---------------------------------------------------- */}
      {subTab === 'sales_analytics' && (
        <div className="space-y-4">
          {/* Main Visual Display Card: Passive Sales vs Flash Sale Spikes */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-tech font-bold text-sm text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  营收对比全景: 常态被动销售 VS 限时空投爆单峰值 (Passive vs Flash Spikes)
                </h3>
                <p className="text-[10px] text-slate-400 font-sans">
                  青色柱体为每周俱乐部常态被动粉丝流水；金色/橙红尖峰为限时空投活动的瞬时爆发收益
                </p>
              </div>

              {/* Legend & Settle Button */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-[10px] font-tech">
                  <span className="flex items-center gap-1 text-cyan-300">
                    <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 inline-block" />
                    常态周销售
                  </span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-rose-500 to-amber-400 inline-block" />
                    限时空投爆单
                  </span>
                </div>

                <button
                  onClick={handleSettlePassiveNow}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-tech font-bold transition cursor-pointer flex items-center gap-1 active:scale-95"
                >
                  <DollarSign className="w-3 h-3" />
                  <span>立即结算本周流水</span>
                </button>
              </div>
            </div>

            {/* Visual Bar Graph */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-4">
              <div className="h-48 flex items-end gap-3 sm:gap-6 pt-6 pb-2 px-2 border-b border-slate-800 relative">
                {/* Reference Grid lines */}
                <div className="absolute inset-x-0 top-6 border-b border-slate-900 border-dashed pointer-events-none" />
                <div className="absolute inset-x-0 top-24 border-b border-slate-900 border-dashed pointer-events-none" />

                {history.map((report, idx) => {
                  const passivePct = Math.round((report.passiveRevenue / maxBarRevenue) * 100);
                  const flashPct = Math.round((report.flashSaleRevenue / maxBarRevenue) * 100);
                  const hasFlash = report.flashSaleRevenue > 0;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                      {/* Tooltip Hover Breakdown */}
                      <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition duration-150 pointer-events-none z-20 w-44 p-2 rounded-xl bg-slate-900 border border-slate-700 shadow-xl text-[9px] font-sans">
                        <div className="font-tech font-bold text-white mb-1 border-b border-slate-800 pb-0.5">
                          第 {report.week} 周营收报告
                        </div>
                        <div className="text-cyan-300 flex justify-between">
                          <span>被动流水:</span>
                          <span className="font-code font-bold">${report.passiveRevenue.toLocaleString()}</span>
                        </div>
                        {hasFlash && (
                          <div className="text-amber-400 flex justify-between">
                            <span>空投爆单:</span>
                            <span className="font-code font-bold">+${report.flashSaleRevenue.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="text-white font-bold flex justify-between pt-1 border-t border-slate-800 mt-1">
                          <span>总营收:</span>
                          <span className="font-code text-emerald-400">${report.totalWeeklyRevenue.toLocaleString()}</span>
                        </div>
                        <div className="text-slate-400 text-[8px] mt-0.5 truncate">
                          畅销: {report.topSellingItem}
                        </div>
                      </div>

                      {/* Stacked Bars or Double Bars */}
                      <div className="w-full max-w-[40px] flex items-end justify-center gap-1 h-full">
                        {/* Passive Sales Bar */}
                        <div
                          style={{ height: `${Math.max(8, passivePct)}%` }}
                          className="w-1/2 rounded-t-sm bg-gradient-to-t from-cyan-900 to-cyan-500 shadow-cyan-500/20 group-hover:brightness-125 transition-all"
                        />
                        {/* Flash Sale Bar (if any) */}
                        <div
                          style={{ height: `${Math.max(4, flashPct)}%` }}
                          className={`w-1/2 rounded-t-sm transition-all ${
                            hasFlash
                              ? 'bg-gradient-to-t from-rose-600 via-amber-500 to-yellow-400 shadow-lg shadow-amber-500/30 group-hover:brightness-125 animate-pulse'
                              : 'bg-slate-900'
                          }`}
                        />
                      </div>

                      {/* Week Label */}
                      <span className="text-[10px] font-tech text-slate-400 mt-2 block">
                        W{report.week}
                      </span>
                    </div>
                  );
                })}

                {/* Projected Current Week Bar */}
                <div className="flex-1 flex flex-col items-center h-full justify-end group relative border-l border-indigo-900/40 pl-2">
                  <div className="absolute top-1 right-2 text-[8px] font-tech text-amber-300 bg-amber-950/80 px-1 rounded">
                    本周实时估算
                  </div>
                  <div className="w-full max-w-[40px] flex items-end justify-center gap-1 h-full opacity-80">
                    <div
                      style={{ height: `${Math.max(8, Math.round((currentWeekPassiveEstimate.passiveRevenue / maxBarRevenue) * 100))}%` }}
                      className="w-1/2 rounded-t-sm bg-cyan-500/70 border-t border-cyan-300 border-dashed"
                    />
                    <div
                      style={{ height: '0%' }}
                      className="w-1/2 rounded-t-sm bg-slate-900"
                    />
                  </div>
                  <span className="text-[10px] font-tech text-amber-300 font-bold mt-2 block">
                    W{currentWeek} (预)
                  </span>
                </div>
              </div>

              {/* Total Aggregate Comparisons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block font-tech">累计常态周常流水</span>
                    <span className="font-code font-bold text-cyan-300 text-sm">
                      ${totalPassiveSalesTotal.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[10px] text-cyan-400/80 font-code">
                    {Math.round((totalPassiveSalesTotal / (totalPassiveSalesTotal + totalFlashSalesTotal || 1)) * 100)}% 占比
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-amber-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block font-tech">累计限时空投爆单收益</span>
                    <span className="font-code font-bold text-amber-400 text-sm">
                      ${totalFlashSalesTotal.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-400/80 font-code">
                    {Math.round((totalFlashSalesTotal / (totalPassiveSalesTotal + totalFlashSalesTotal || 1)) * 100)}% 占比
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block font-tech">本周预估入库纯利润</span>
                    <span className="font-code font-bold text-emerald-400 text-sm">
                      +${currentWeekPassiveEstimate.netProfit.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-sans">
                    毛利率 ~{Math.round((currentWeekPassiveEstimate.netProfit / currentWeekPassiveEstimate.totalWeeklyRevenue) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Weekly Sales Report Ledger Table */}
            <div className="space-y-2">
              <span className="text-xs font-tech font-bold text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                历史销售结算明细 (Sales History Ledger)
              </span>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-[10px] font-sans">
                  <thead className="bg-slate-950 text-slate-400 font-tech uppercase border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">周次</th>
                      <th className="py-2 px-3">被动件数 / 流水</th>
                      <th className="py-2 px-3">空投件数 / 流水</th>
                      <th className="py-2 px-3">总收入 (净利润)</th>
                      <th className="py-2 px-3">公关/战绩加成</th>
                      <th className="py-2 px-3">热销单品</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-slate-900/60 font-code">
                    {history.slice(-5).reverse().map((r, i) => (
                      <tr key={i} className="hover:bg-slate-850/50">
                        <td className="py-2 px-3 font-tech font-bold text-white">第 {r.week} 周</td>
                        <td className="py-2 px-3 text-cyan-300">
                          {r.passiveSalesUnits.toLocaleString()} 件 · ${r.passiveRevenue.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-amber-400">
                          {r.flashSaleUnits > 0 ? `${r.flashSaleUnits.toLocaleString()} 件 · $${r.flashSaleRevenue.toLocaleString()}` : '-'}
                        </td>
                        <td className="py-2 px-3 text-emerald-400 font-bold">
                          ${r.totalWeeklyRevenue.toLocaleString()} <span className="text-slate-400 font-normal">(${r.netProfit.toLocaleString()})</span>
                        </td>
                        <td className="py-2 px-3 text-slate-300">
                          x{r.fanbaseMultiplier.toFixed(2)} / x{r.tournamentBonusMultiplier.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-slate-300 truncate max-w-[120px] font-sans">
                          {r.topSellingItem}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. JERSEY STUDIO (GRAPHICAL CUSTOMIZER) */}
      {/* ---------------------------------------------------- */}
      {subTab === 'jersey_studio' && (
        <JerseyCustomizer
          dynasty={dynasty}
          onUpdateDynasty={onUpdateDynasty}
          onSavedNotice={(msg) => setFeedbackNotice(msg)}
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. R&D LAB (FABRIC TECH & PRINT QUALITY RESEARCH LAB) */}
      {/* ---------------------------------------------------- */}
      {subTab === 'rd_lab' && (
        <div className="space-y-4 animate-fade-in">
          {/* Lab Overview Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 border border-purple-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-md">
                  <FlaskConical className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-tech font-bold text-base text-white flex items-center gap-2">
                    战袍前沿研发实验室 (Apparel R&D Lab)
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-code font-bold">
                      综合战袍营收倍率: x{rdData.jerseyRevenueMultiplier.toFixed(2)}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    注资「面料工学」与「立体微晶印花」5阶技术树，永久提升所有战袍周常被动流水与限时空投溢价。
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800 flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-tech">俱乐部可用金库</span>
                  <span className="font-code font-black text-sm text-emerald-400">
                    ${Math.round(dynasty.budget).toLocaleString()}
                  </span>
                </div>
                <div className="h-6 w-px bg-slate-800" />
                <div className="text-right">
                  <span className="text-[10px] text-cyan-400 block font-tech">科研科技点数</span>
                  <span className="font-code font-black text-sm text-cyan-300 flex items-center justify-end gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
                    {dynasty.techPoints ?? 50} <span className="text-[10px] font-sans font-normal text-slate-400">pts</span>
                  </span>
                </div>
                <div className="h-6 w-px bg-slate-800" />
                <div className="text-right">
                  <span className="text-[10px] text-purple-400 block font-tech">累计战袍溢价</span>
                  <span className="font-code font-bold text-xs text-purple-300">
                    +{Math.round((rdData.jerseyRevenueMultiplier - 1) * 100)}% 流水
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowSimSandbox(!showSimSandbox)}
                className={`px-3 py-2 rounded-xl text-xs font-tech font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                  showSimSandbox
                    ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-500/20'
                    : 'bg-slate-900 hover:bg-slate-850 text-purple-300 border-purple-500/30'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>{showSimSandbox ? '收起沙盘' : '沙盘模拟'}</span>
              </button>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* REAL-TIME INTERACTIVE BREAKDOWN WITH LIVE FORMULA HUD */}
          {/* ---------------------------------------------------- */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-tech font-bold text-white uppercase tracking-wider">
                  实时营收公式分解与动态反馈 (Live Revenue Formula HUD)
                </span>
              </div>
              <span className="text-[10px] font-sans text-slate-400">
                公式每项均与科研阶梯实时联动 · 战袍基准收益自动叠加计算
              </span>
            </div>

            {/* Visual Formula Display */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2.5">
              <div className="text-[11px] text-slate-400 font-tech flex items-center justify-between">
                <span>战袍综合商业倍率实时计算公式：</span>
                <span className="text-purple-300 font-code font-bold">
                  当前结果 = x{rdData.jerseyRevenueMultiplier.toFixed(2)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 font-code text-xs">
                {/* Base Multiplier */}
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-bold" title="出厂基准乘数">
                  1.00 (基准)
                </span>
                <span className="text-slate-500 font-bold">+</span>

                {/* Fabric Term */}
                <button
                  onClick={() => setRdCategoryFilter('fabric_tech')}
                  onMouseEnter={() => setHoveredFormulaPart('fabric_tech')}
                  onMouseLeave={() => setHoveredFormulaPart(null)}
                  className={`px-2.5 py-1 rounded-lg border font-bold transition cursor-pointer flex items-center gap-1 ${
                    rdData.fabricLevel > 0
                      ? 'bg-purple-950/60 border-purple-500/50 text-purple-300 hover:bg-purple-900/50 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-500'
                  }`}
                  title="点击聚焦面料工学"
                >
                  <span>🧵 面料工学:</span>
                  <span className="text-emerald-400">+{Math.round(rdData.fabricBonus * 100)}%</span>
                  <span className="text-[9px] text-purple-400 font-normal">(Lv.{rdData.fabricLevel}/5)</span>
                </button>
                <span className="text-slate-500 font-bold">+</span>

                {/* Print Quality Term */}
                <button
                  onClick={() => setRdCategoryFilter('print_quality')}
                  onMouseEnter={() => setHoveredFormulaPart('print_quality')}
                  onMouseLeave={() => setHoveredFormulaPart(null)}
                  className={`px-2.5 py-1 rounded-lg border font-bold transition cursor-pointer flex items-center gap-1 ${
                    rdData.printLevel > 0
                      ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-300 hover:bg-indigo-900/50 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-500'
                  }`}
                  title="点击聚焦立体印花"
                >
                  <span>🖨️ 立体印花:</span>
                  <span className="text-emerald-400">+{Math.round(rdData.printBonus * 100)}%</span>
                  <span className="text-[9px] text-indigo-400 font-normal">(Lv.{rdData.printLevel}/5)</span>
                </button>
                <span className="text-slate-500 font-bold">+</span>

                {/* Ergonomic Cut Term */}
                <button
                  onClick={() => setRdCategoryFilter('ergonomic_cut')}
                  onMouseEnter={() => setHoveredFormulaPart('ergonomic_cut')}
                  onMouseLeave={() => setHoveredFormulaPart(null)}
                  className={`px-2.5 py-1 rounded-lg border font-bold transition cursor-pointer flex items-center gap-1 ${
                    rdData.cutLevel > 0
                      ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/50 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-500'
                  }`}
                  title="点击聚焦版型剪裁"
                >
                  <span>✂️ 版型剪裁:</span>
                  <span className="text-emerald-400">+{Math.round(rdData.cutBonus * 100)}%</span>
                  <span className="text-[9px] text-cyan-400 font-normal">(Lv.{rdData.cutLevel}/4)</span>
                </button>
                <span className="text-slate-500 font-bold">+</span>

                {/* Smart Chip Term */}
                <button
                  onClick={() => setRdCategoryFilter('smart_chip')}
                  onMouseEnter={() => setHoveredFormulaPart('smart_chip')}
                  onMouseLeave={() => setHoveredFormulaPart(null)}
                  className={`px-2.5 py-1 rounded-lg border font-bold transition cursor-pointer flex items-center gap-1 ${
                    rdData.smartLevel > 0
                      ? 'bg-amber-950/60 border-amber-500/50 text-amber-300 hover:bg-amber-900/50 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-500'
                  }`}
                  title="点击聚焦智能芯片"
                >
                  <span>📲 NFC芯片:</span>
                  <span className="text-emerald-400">+{Math.round(rdData.smartBonus * 100)}%</span>
                  <span className="text-[9px] text-amber-400 font-normal">(Lv.{rdData.smartLevel}/4)</span>
                </button>
                <span className="text-slate-500 font-bold">+</span>

                {/* Injury Prevention Term */}
                <button
                  onClick={() => setRdCategoryFilter('injury_prevention')}
                  className={`px-2.5 py-1 rounded-lg border font-bold transition cursor-pointer flex items-center gap-1 ${
                    (rdData.injuryLevel || 0) > 0
                      ? 'bg-rose-950/60 border-rose-500/50 text-rose-300 hover:bg-rose-900/50 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-500'
                  }`}
                  title="点击聚焦伤病预防与康复医学"
                >
                  <span>🩺 康复医学:</span>
                  <span className="text-rose-400">负荷-{rdData.strainReductionPercent || 0}%</span>
                  <span className="text-[9px] text-rose-400 font-normal">(Lv.{rdData.injuryLevel || 0}/5)</span>
                </button>

                <span className="text-purple-400 font-bold text-sm mx-1">=</span>
                <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold shadow-md">
                  x{rdData.jerseyRevenueMultiplier.toFixed(2)} 总倍率
                </span>
              </div>
            </div>

            {/* 3 Live KPI Projection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 font-tech flex items-center gap-1">
                  <Shirt className="w-3 h-3 text-purple-400" />
                  战袍每周被动流水预期
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="font-code font-bold text-base text-white">
                    ${Math.round(currentWeekPassiveEstimate.passiveRevenue * 0.45).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-code font-bold">
                    含科研溢价 +{Math.round((rdData.jerseyRevenueMultiplier - 1) * 100)}%
                  </span>
                </div>
                <span className="text-[9px] text-slate-500 block font-sans">
                  基于战队粉丝基数与首发人气自动推演
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 font-tech flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  单次限时空投抢购爆单预估
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="font-code font-bold text-base text-amber-300">
                    ${Math.round(140000 * rdData.jerseyRevenueMultiplier).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-amber-400 font-code font-bold">
                    尖端工艺溢价
                  </span>
                </div>
                <span className="text-[9px] text-slate-500 block font-sans">
                  空投抢购会瞬时转化率享受全面料与印花加成
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 font-tech flex items-center gap-1">
                  <Flame className="w-3 h-3 text-rose-400" />
                  研发提振粉丝狂热度
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="font-code font-bold text-base text-rose-300">
                    {merchShop.currentHypeLevel || 80} / 100
                  </span>
                  <span className="text-[10px] text-rose-400 font-code font-bold">
                    研发注资持续赋能
                  </span>
                </div>
                <span className="text-[9px] text-slate-500 block font-sans">
                  每次科研突破召开全球发布会注入巨额 Hype
                </span>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* DIMINISHING RETURNS & HYPE MECHANISM EXPLANATION */}
          {/* ---------------------------------------------------- */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-purple-950/40 border border-indigo-500/20 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-tech font-bold text-white flex items-center gap-2">
                  <span>科研投资注资机制：边际效益递减与狂热效应 (Diminishing Returns & Hype Boost)</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-code">
                    高阶解锁专属特权
                  </span>
                </div>
                <p className="text-slate-300 font-sans leading-relaxed text-[11px]">
                  T1~T3 为基础高性价比技术，带来快速商业回本；T4~T5 为顶级工程突破，研发费用逐步递增（边际资本产出比放缓），但会解锁战袍质变级【专属核心特权】（如全季节无淡季销售、至尊冠军巡礼通道、量子夜光防伪爆单潮），并直接奖励最高 +15 点战队粉丝狂热度！
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-tech">已激活特权:</span>
              <span className="font-code font-bold text-xs text-purple-300">
                {rdData.activePerks.length} 项前沿黑科技
              </span>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* ACTIVE PERKS SHOWCASE POOL */}
          {/* ---------------------------------------------------- */}
          {rdData.activePerks.length > 0 && (
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-tech font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  已激活战袍专属工艺特权池 (Active Technology Perks)
                </span>
                <span className="text-[10px] text-slate-400 font-sans">
                  所有出厂战袍均自动享有以下工艺增益
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {rdData.activePerks.map((perk, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-slate-900/90 border border-purple-500/30 flex items-start gap-2 shadow-sm"
                  >
                    <span className="text-base shrink-0 p-1 bg-slate-950 rounded-lg border border-slate-800">
                      {perk.badge.split(' ')[0]}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-tech font-bold text-xs text-white truncate">
                          {perk.perkName}
                        </span>
                        <span className="text-[8px] font-code text-purple-400">
                          Lv.{perk.level}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-sans line-clamp-1">
                        {perk.perkDetail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* SANDBOX FORMULA SIMULATOR (IF TOGGLED) */}
          {/* ---------------------------------------------------- */}
          {showSimSandbox && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/40 shadow-xl space-y-4 animate-scale-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-purple-400" />
                  <h4 className="font-tech font-bold text-sm text-white">
                    🧪 战袍研发效果沙盘模拟器 (R&D Sandbox Simulator)
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSimLevels({ fabric_tech: 5, print_quality: 5, ergonomic_cut: 4, smart_chip: 4 })}
                    className="text-[10px] px-2 py-1 rounded-lg bg-purple-950/60 text-purple-300 border border-purple-500/30 hover:bg-purple-900/60 cursor-pointer font-tech font-bold"
                  >
                    拉满巅峰 (All Max)
                  </button>
                  <button
                    onClick={() => setSimLevels({
                      fabric_tech: (merchShop.rdUpgrades?.fabric_tech || 1),
                      print_quality: (merchShop.rdUpgrades?.print_quality || 1),
                      ergonomic_cut: (merchShop.rdUpgrades?.ergonomic_cut || 0),
                      smart_chip: (merchShop.rdUpgrades?.smart_chip || 0)
                    })}
                    className="text-[10px] px-2 py-1 rounded-lg bg-slate-850 text-slate-400 border border-slate-700 hover:text-white cursor-pointer font-tech"
                  >
                    同步现状
                  </button>
                </div>
              </div>

              {/* Sliders for all 4 techs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {MERCH_RD_UPGRADES.map(u => {
                  const currentSimLvl = simLevels[u.id] || 0;
                  return (
                    <div key={u.id} className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs font-tech">
                        <span className="text-white font-bold flex items-center gap-1.5">
                          <span>{u.icon}</span>
                          <span className="truncate">{u.categoryName}</span>
                        </span>
                        <span className="font-code text-purple-400 font-bold">
                          Lv.{currentSimLvl} / {u.maxLevel}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={u.maxLevel}
                        value={currentSimLvl}
                        onChange={(e) => setSimLevels({ ...simLevels, [u.id]: parseInt(e.target.value, 10) })}
                        className="w-full accent-purple-500 cursor-pointer"
                      />
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-sans">
                        <span>{currentSimLvl === 0 ? '未解锁' : u.levels[currentSimLvl - 1]?.title || ''}</span>
                        <span className="text-emerald-400 font-code font-bold">
                          +{Math.round((u.levels[currentSimLvl - 1]?.bonusMultiplier || 0) * 100)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Simulation Result Comparison */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-tech">模拟研发达产后总战袍流水倍率</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-code font-black text-lg text-purple-300">
                      x{simulatedRdData.jerseyRevenueMultiplier.toFixed(2)}
                    </span>
                    <span className="text-xs text-emerald-400 font-code font-bold">
                      (相比当前增幅 +{Math.round((simulatedRdData.jerseyRevenueMultiplier - rdData.jerseyRevenueMultiplier) * 100)}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-tech">模拟周被动流水</span>
                    <span className="font-code font-bold text-xs text-white">
                      ${Math.round(simulatedRevenueEstimate.passiveRevenue * 0.45).toLocaleString()}/周
                    </span>
                  </div>
                  <div className="h-6 w-px bg-slate-800" />
                  <div className="text-right">
                    <span className="text-[10px] text-amber-400 block font-tech">模拟空投单次爆单</span>
                    <span className="font-code font-bold text-xs text-amber-300">
                      ${Math.round(140000 * simulatedRdData.jerseyRevenueMultiplier).toLocaleString()}/次
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* CATEGORY FILTER TABS */}
          {/* ---------------------------------------------------- */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setRdCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-tech font-bold whitespace-nowrap transition cursor-pointer border ${
                rdCategoryFilter === 'all'
                  ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
              }`}
            >
              全部技术树 (5项)
            </button>
            <button
              onClick={() => setRdCategoryFilter('fabric_tech')}
              className={`px-3 py-1.5 rounded-xl text-xs font-tech font-bold whitespace-nowrap transition cursor-pointer border flex items-center gap-1.5 ${
                rdCategoryFilter === 'fabric_tech'
                  ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
              }`}
            >
              <span>🧵 面料工学 (5阶)</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-950 text-purple-300">
                Lv.{(merchShop.rdUpgrades || {}).fabric_tech || 0}/5
              </span>
            </button>
            <button
              onClick={() => setRdCategoryFilter('print_quality')}
              className={`px-3 py-1.5 rounded-xl text-xs font-tech font-bold whitespace-nowrap transition cursor-pointer border flex items-center gap-1.5 ${
                rdCategoryFilter === 'print_quality'
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
              }`}
            >
              <span>🖨️ 立体印花 (5阶)</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-950 text-indigo-300">
                Lv.{(merchShop.rdUpgrades || {}).print_quality || 0}/5
              </span>
            </button>
            <button
              onClick={() => setRdCategoryFilter('ergonomic_cut')}
              className={`px-3 py-1.5 rounded-xl text-xs font-tech font-bold whitespace-nowrap transition cursor-pointer border flex items-center gap-1.5 ${
                rdCategoryFilter === 'ergonomic_cut'
                  ? 'bg-cyan-600 text-white border-cyan-400 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
              }`}
            >
              <span>✂️ 版型剪裁 (4阶)</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-950 text-cyan-300">
                Lv.{(merchShop.rdUpgrades || {}).ergonomic_cut || 0}/4
              </span>
            </button>
            <button
              onClick={() => setRdCategoryFilter('smart_chip')}
              className={`px-3 py-1.5 rounded-xl text-xs font-tech font-bold whitespace-nowrap transition cursor-pointer border flex items-center gap-1.5 ${
                rdCategoryFilter === 'smart_chip'
                  ? 'bg-amber-600 text-white border-amber-400 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
              }`}
            >
              <span>📲 NFC智能 (4阶)</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-950 text-amber-300">
                Lv.{(merchShop.rdUpgrades || {}).smart_chip || 0}/4
              </span>
            </button>
            <button
              onClick={() => setRdCategoryFilter('injury_prevention')}
              className={`px-3 py-1.5 rounded-xl text-xs font-tech font-bold whitespace-nowrap transition cursor-pointer border flex items-center gap-1.5 ${
                rdCategoryFilter === 'injury_prevention'
                  ? 'bg-rose-600 text-white border-rose-400 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
              }`}
            >
              <span>🩺 伤病防护 (5阶)</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-950 text-rose-300">
                Lv.{(merchShop.rdUpgrades || {}).injury_prevention || 0}/5
              </span>
            </button>
          </div>

          {/* ---------------------------------------------------- */}
          {/* R&D UPGRADES INTERACTIVE TECH TREE GRID */}
          {/* ---------------------------------------------------- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MERCH_RD_UPGRADES
              .filter(upgrade => rdCategoryFilter === 'all' || rdCategoryFilter === upgrade.id)
              .map(upgrade => {
                const currentLevel = (merchShop.rdUpgrades || {})[upgrade.id] || 0;
                const isMaxed = currentLevel >= upgrade.maxLevel;
                const nextLevel = currentLevel + 1;
                const nextLevelInfo = !isMaxed ? upgrade.levels[nextLevel - 1] : null;
                const cost = nextLevelInfo?.cost || Math.round(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
                const techPointCost = nextLevelInfo?.techPointCost || 0;
                const availableTechPoints = dynasty.techPoints ?? 50;
                const canAffordPoints = techPointCost === 0 || availableTechPoints >= techPointCost;
                const canAfford = dynasty.budget >= cost && canAffordPoints && !isMaxed;
                const shortage = cost - dynasty.budget;
                const pointShortage = techPointCost - availableTechPoints;

                const currentLevelInfo = currentLevel > 0 ? upgrade.levels[currentLevel - 1] : null;

                // Live dynamic formula feedback calculation
                const impact = estimateUpgradeImpact(dynasty, upgrade.id);

                const handleInvest = () => {
                  if (dynasty.budget < cost) {
                    soundEngine.playDefeat();
                    setFeedbackNotice(`⚠️ 金库资金不足 $${cost.toLocaleString()}（还差 $${Math.round(shortage).toLocaleString()}），无法注资研发！`);
                    return;
                  }
                  if (techPointCost > 0 && availableTechPoints < techPointCost) {
                    soundEngine.playDefeat();
                    setFeedbackNotice(`⚠️ 俱乐部科研科技点数不足！需要 ${techPointCost} 科技点，当前仅有 ${availableTechPoints} 点（尚缺 ${pointShortage} 点）。可通过录像复盘、战术推演或日程结算获取！`);
                    return;
                  }
                  soundEngine.playLevelUp();
                  const { success, message, updatedDynasty } = investInMerchRD(dynasty, upgrade.id, cost);
                  if (success) {
                    onUpdateDynasty(updatedDynasty);
                    setFeedbackNotice(message);
                  } else {
                    setFeedbackNotice(message);
                  }
                };

                return (
                  <div 
                    key={upgrade.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 shadow-xl flex flex-col justify-between space-y-4 ${
                      isMaxed
                        ? 'bg-gradient-to-b from-slate-900/90 via-purple-950/20 to-slate-950 border-purple-500/50 shadow-purple-500/10'
                        : currentLevel > 0
                        ? 'bg-slate-950/90 border-slate-800 hover:border-indigo-500/50'
                        : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-3.5">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl p-2.5 rounded-xl bg-slate-900 border border-slate-800 shadow-inner">
                            {upgrade.icon}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-tech font-bold text-sm text-white">{upgrade.name}</h4>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[9px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                                {upgrade.categoryName}
                              </span>
                              <span className="text-[11px] font-code text-purple-400 font-bold">
                                等级: {currentLevel} / {upgrade.maxLevel} {isMaxed && '⭐ (顶尖巅峰)'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Upgrade multiplier badge */}
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-tech">当前技术加成</span>
                          <span className="font-code font-bold text-xs text-emerald-400">
                            +{Math.round((currentLevelInfo?.bonusMultiplier || 0) * 100)}% 战袍流水
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        {upgrade.description}
                      </p>

                      {/* ---------------------------------------------------- */}
                      {/* 5-TIER PROGRESSIVE NODE STEPPER */}
                      {/* ---------------------------------------------------- */}
                      <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-tech">
                          <span className="flex items-center gap-1">
                            <Layers className="w-3 h-3 text-purple-400" />
                            {upgrade.maxLevel} 阶技术成熟度链条
                          </span>
                          <span className="text-purple-300 font-code font-bold">
                            {Math.round((currentLevel / upgrade.maxLevel) * 100)}% 完成
                          </span>
                        </div>

                        {/* Stepper Chain Nodes */}
                        <div className="grid grid-cols-5 gap-1.5">
                          {upgrade.levels.map((lvl) => {
                            const isUnlocked = currentLevel >= lvl.level;
                            const isNext = currentLevel + 1 === lvl.level;
                            return (
                              <div
                                key={lvl.level}
                                className={`p-1.5 rounded-lg border text-center transition flex flex-col justify-between ${
                                  isUnlocked
                                    ? 'bg-purple-950/60 border-purple-500/60 text-purple-200 shadow-sm'
                                    : isNext
                                    ? 'bg-indigo-950/50 border-indigo-500/70 text-indigo-200 animate-pulse'
                                    : 'bg-slate-950/60 border-slate-900 text-slate-400 opacity-60'
                                }`}
                                title={`${lvl.title}: ${lvl.detail}`}
                              >
                                <div className="text-[9px] font-code font-bold flex items-center justify-center gap-0.5">
                                  {isUnlocked ? (
                                    <Check className="w-2.5 h-2.5 text-purple-400" />
                                  ) : isNext ? (
                                    <span className="text-indigo-400 font-bold">目标</span>
                                  ) : (
                                    `T${lvl.level}`
                                  )}
                                </div>
                                <div className="text-[8px] font-sans truncate mt-0.5" title={lvl.title}>
                                  {lvl.title.split(' ')[0]}
                                </div>
                                <div className="text-[8px] font-code text-emerald-400 font-bold">
                                  +{Math.round(lvl.bonusMultiplier * 100)}%
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Current Active Spec & Next Target Breakdown */}
                      <div className="space-y-2">
                        {currentLevelInfo && (
                          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-purple-500/30 space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-purple-300 font-tech font-bold flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-purple-400" />
                                当前工艺: {currentLevelInfo.title}
                              </span>
                              <span className="text-emerald-400 font-code font-bold text-xs">
                                {currentLevelInfo.bonusDisplay}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-sans">
                              <span className="px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 font-tech border border-purple-800">
                                {currentLevelInfo.perkBadge}
                              </span>
                              <span>{currentLevelInfo.perkDetail}</span>
                            </div>
                          </div>
                        )}

                        {!isMaxed && nextLevelInfo && (
                          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-indigo-500/30 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-indigo-300 font-tech font-bold flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                下一阶突破: {nextLevelInfo.title}
                              </span>
                              <span className="text-emerald-400 font-code font-bold text-xs">
                                {nextLevelInfo.bonusDisplay}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-sans">
                              <span className="px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 font-tech border border-indigo-800">
                                {nextLevelInfo.perkBadge}
                              </span>
                              <span className="text-amber-300 font-bold">{nextLevelInfo.perkName}</span>
                              <span className="truncate">{nextLevelInfo.perkDetail}</span>
                            </div>

                            {/* Live Formula Feedback on Next Upgrade ROI */}
                            <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px]">
                              <div>
                                <span className="text-slate-400 block font-tech">预计周增收</span>
                                <span className="font-code font-bold text-emerald-400">
                                  +${impact.deltaWeeklyPassive.toLocaleString()}/周
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-tech">预计空投增量</span>
                                <span className="font-code font-bold text-amber-300">
                                  +${impact.deltaFlashDrop.toLocaleString()}/次
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-tech">预计回本周期</span>
                                <span className="font-code font-bold text-cyan-300">
                                  约 {impact.paybackWeeks} 周
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-tech">狂热度奖励</span>
                                <span className="font-code font-bold text-rose-400">
                                  +{nextLevelInfo.hypeReward} Hype
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Invest Button */}
                    <div className="pt-2">
                      {isMaxed ? (
                        <div className="p-3 rounded-xl bg-gradient-to-r from-purple-950/50 to-indigo-950/50 border border-purple-500/40 text-center text-xs font-tech font-bold text-purple-200 flex items-center justify-center gap-2 shadow-inner">
                          <CheckCircle2 className="w-4 h-4 text-purple-400" />
                          <span>已达世界最高电竞科研巅峰 (Apex Max Tier)</span>
                        </div>
                      ) : (
                        <button
                          onClick={handleInvest}
                          disabled={!canAfford}
                          className={`w-full py-3 px-4 rounded-xl text-xs font-tech font-extrabold uppercase transition cursor-pointer flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                            canAfford
                              ? upgrade.id === 'injury_prevention'
                                ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-rose-600/30'
                                : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white shadow-purple-600/30'
                              : 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                          }`}
                        >
                          <FlaskConical className="w-4 h-4" />
                          <span>
                            {canAfford ? (
                              `注资研发至 Lv.${nextLevel} · $${cost.toLocaleString()}${techPointCost > 0 ? ` + ${techPointCost} 科技点` : ''} (+${nextLevelInfo?.hypeReward || 5} Hype)`
                            ) : dynasty.budget < cost ? (
                              `金库资金不足 · 需 $${cost.toLocaleString()} (尚缺 $${Math.round(shortage).toLocaleString()})`
                            ) : (
                              `科技点数不足 · 需 ${techPointCost} 科技点 (尚缺 ${pointShortage} 点)`
                            )}
                          </span>
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}


      {/* ---------------------------------------------------- */}
      {/* 4. MERCH CATALOG & PRODUCTION UPGRADE */}
      {/* ---------------------------------------------------- */}
      {subTab === 'merch_catalog' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-tech font-bold text-white flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-amber-400" />
              官方周边全系商品货架 (Merch Catalog & Production Lines)
            </span>
            <span className="text-[10px] text-slate-400 font-sans">
              升级产线工艺可大幅提高单品周销量上限
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(merchShop.catalog || []).map(item => {
              const upgradeCost = item.retailPrice * 12;
              const canAffordUpgrade = dynasty.budget >= upgradeCost;

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition flex flex-col justify-between gap-3 ${
                    item.unlocked
                      ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800 hover:border-indigo-500/40 shadow-md'
                      : 'bg-slate-950/80 border-slate-800/60 opacity-60'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{item.icon}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-tech font-bold text-white text-xs">{item.name}</h4>
                            {item.unlocked && (
                              <span className="text-[8px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-code font-bold">
                                Lv.{item.tierLevel}
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] text-slate-400 font-tech">
                            {item.category} · 成本 ${item.unitCost}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-code font-black text-amber-300 text-sm">
                          ${item.retailPrice}
                        </span>
                        <span className="text-[8px] text-slate-400 block font-tech">零售定价</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-300 font-sans leading-relaxed bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                      {item.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[9px] font-code p-2 rounded-xl bg-slate-950 border border-slate-850">
                      <div>
                        <span className="text-slate-400 block">基础周产能</span>
                        <span className="text-white font-bold">{item.baseWeeklySales} 件 / 周</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block">累计总创收</span>
                        <span className="text-emerald-400 font-bold">${item.totalRevenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {!item.unlocked ? (
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[9px] text-slate-400 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>解锁门槛: {item.unlockRequirement}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleUpgradeItem(item)}
                        disabled={!canAffordUpgrade}
                        className={`w-full py-2 rounded-xl text-[10px] font-tech font-extrabold uppercase transition cursor-pointer flex items-center justify-center gap-1 shadow ${
                          canAffordUpgrade
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25 active:scale-95'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <ArrowUpRight className="w-3 h-3" />
                        <span>
                          升级工艺产线 (+35% 产能) · ${upgradeCost.toLocaleString()}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
