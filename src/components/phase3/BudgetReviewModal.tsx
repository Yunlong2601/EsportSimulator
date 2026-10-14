import React, { useState } from 'react';
import { 
  Building2, 
  DollarSign, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  X, 
  ArrowUpRight, 
  FileText, 
  PieChart, 
  Wallet, 
  HelpCircle,
  Briefcase,
  CheckCircle2
} from 'lucide-react';
import { DynastyState } from '../../types/game';
import { soundEngine } from '../../utils/audio';

interface BudgetReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  dynasty: DynastyState;
  onUpdateDynasty: React.Dispatch<React.SetStateAction<DynastyState>>;
  playerPersonalMoney?: number;
  onInjectPersonalCapital?: (amount: number) => void;
  onOpenSponsorships?: () => void;
  onAddLog?: (message: string, type: 'win' | 'loss' | 'event' | 'gear') => void;
}

export const BudgetReviewModal: React.FC<BudgetReviewModalProps> = ({
  isOpen,
  onClose,
  dynasty,
  onUpdateDynasty,
  playerPersonalMoney = 0,
  onInjectPersonalCapital,
  onOpenSponsorships,
  onAddLog
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SALARY_CAP' | 'BREAKDOWN'>('OVERVIEW');
  const [hasAuditedThisSession, setHasAuditedThisSession] = useState<boolean>(false);

  // 1. Calculate Payroll & Salaries
  const rosterSalaries = dynasty.roster.reduce((sum, p) => sum + (p.salary || 0), 0);
  const facilityUpkeep = (dynasty.facilities?.length || 0) * 1500;
  const coachingUpkeep = 3500;
  const totalWeeklyExpenses = rosterSalaries + facilityUpkeep + coachingUpkeep;

  // 2. Calculate Weekly Inflows
  const sponsorInflow = dynasty.activeSponsors.reduce((sum, s) => sum + (s.weeklyPayout || 0), 0);
  const peripheralInflow = Math.round((dynasty.peripheralSponsorships?.totalMonthlyRevenue || 0) / 4);
  const merchInflow = Math.round(dynasty.fanHype * 12);
  const totalWeeklyInflows = sponsorInflow + peripheralInflow + merchInflow;

  const netWeeklyCashflow = totalWeeklyInflows - totalWeeklyExpenses;

  // 3. Salary Cap Thresholds
  const softCap = 60000;
  const hardCap = 90000;
  const isOverSoftCap = rosterSalaries > softCap;
  const isOverHardCap = rosterSalaries > hardCap;
  const luxuryTaxAmount = isOverSoftCap ? Math.round((rosterSalaries - softCap) * 1.5) : 0;

  // 4. Financial Runway (in weeks)
  const financialRunwayWeeks = netWeeklyCashflow >= 0 
    ? 999 
    : Math.max(0, Math.floor(dynasty.budget / Math.abs(netWeeklyCashflow)));

  // Perform one-click Financial Audit
  const handlePerformAudit = () => {
    if (hasAuditedThisSession) return;
    soundEngine.playCoin();
    const rebateGain = Math.floor(Math.random() * 8000 + 12000); // $12,000 - $20,000
    
    onUpdateDynasty(prev => ({
      ...prev,
      budget: prev.budget + rebateGain
    }));

    setHasAuditedThisSession(true);
    onAddLog?.(`📊【CFO预算审计】深度审计俱乐部账目，剔除无用冗余开销并追回赞助商阶梯返款 +$${rebateGain.toLocaleString()}！`, 'win');
  };

  // Inject Personal Capital into Dynasty Treasury
  const handleInjectFunds = (amount: number) => {
    if (playerPersonalMoney < amount) {
      soundEngine.playDefeat();
      return;
    }
    soundEngine.playCoin();
    onInjectPersonalCapital?.(amount);
    onUpdateDynasty(prev => ({
      ...prev,
      budget: prev.budget + amount
    }));
    onAddLog?.(`💼【个人资本注资】你向俱乐部金库紧急调拨注资 $${amount.toLocaleString()}，强化现金流储备！`, 'gear');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      {/* Click-away scrim */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl max-h-[88vh] bg-slate-950/95 border-2 border-amber-500/50 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col overflow-hidden z-10 chamfer-card">
        
        {/* Header */}
        <div className="px-4 py-3 border-b border-amber-500/30 bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <Wallet className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-tech font-extrabold text-amber-100 tracking-wide">
                  豪门金库与预算审阅 · BUDGET REVIEW
                </h2>
                <span className="px-1.5 py-0.5 rounded bg-amber-900/60 border border-amber-500/40 text-[9px] font-tech text-amber-300">
                  CFO 审计报告
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400 font-sans mt-0.5">
                实时审阅俱乐部薪资帽、赞助商周度现金流与金库稳健度
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-3 pt-2 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`pb-2 px-3 text-xs font-tech font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'OVERVIEW'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            金库总览 (Overview)
          </button>
          <button
            onClick={() => setActiveTab('SALARY_CAP')}
            className={`pb-2 px-3 text-xs font-tech font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'SALARY_CAP'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            薪资帽审计 (Salary Cap)
          </button>
          <button
            onClick={() => setActiveTab('BREAKDOWN')}
            className={`pb-2 px-3 text-xs font-tech font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'BREAKDOWN'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            现金流明细 (Cashflow)
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4 custom-scrollbar">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-3.5">
              
              {/* Primary Gauge Cards */}
              <div className="grid grid-cols-2 gap-3">
                {/* Card 1: Treasury Balance */}
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] font-tech uppercase">
                    <span>俱乐部金库储备</span>
                    <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-tech font-extrabold text-amber-300 mt-1">
                    ${dynasty.budget.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>状态: 资金充沛稳健</span>
                  </div>
                </div>

                {/* Card 2: Net Cashflow */}
                <div className="p-3 rounded-xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] font-tech uppercase">
                    <span>周度净现金流</span>
                    {netWeeklyCashflow >= 0 ? (
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                    )}
                  </div>
                  <div className={`text-xl sm:text-2xl font-tech font-extrabold mt-1 ${
                    netWeeklyCashflow >= 0 ? 'text-emerald-300' : 'text-rose-400'
                  }`}>
                    {netWeeklyCashflow >= 0 ? `+$${netWeeklyCashflow.toLocaleString()}` : `-$${Math.abs(netWeeklyCashflow).toLocaleString()}`}
                    <span className="text-xs font-normal text-slate-400 ml-1">/周</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {netWeeklyCashflow >= 0 
                      ? '持续盈余盈利中' 
                      : `预计还可支撑 ${financialRunwayWeeks} 周`}
                  </div>
                </div>
              </div>

              {/* Roster Quick Snapshot */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-tech font-bold text-slate-200 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    首发阵容周薪占比 ({dynasty.roster.length}人名单)
                  </span>
                  <span className="text-xs font-tech text-amber-300 font-bold">
                    ${rosterSalaries.toLocaleString()} / 周
                  </span>
                </div>

                {/* Progress bar to soft cap */}
                <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800 relative">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverHardCap 
                        ? 'bg-rose-500' 
                        : isOverSoftCap 
                          ? 'bg-amber-500' 
                          : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, (rosterSalaries / hardCap) * 100)}%` }}
                  />
                </div>

                <div className="flex justify-between text-[9px] font-tech text-slate-400">
                  <span>当前支出: ${rosterSalaries.toLocaleString()}</span>
                  <span>软帽线: ${softCap.toLocaleString()}</span>
                  <span>硬帽上限: ${hardCap.toLocaleString()}</span>
                </div>
              </div>

              {/* CFO Interactive Operations */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-950 border border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-tech font-bold text-amber-200 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      CFO 财务审计与冗余开销优化
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      深度审计俱乐部各项账目，追回企业阶梯返点并压缩无效开支
                    </p>
                  </div>

                  <button
                    onClick={handlePerformAudit}
                    disabled={hasAuditedThisSession}
                    className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold transition flex items-center gap-1 cursor-pointer ${
                      hasAuditedThisSession
                        ? 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 shadow-md active:scale-95'
                    }`}
                  >
                    {hasAuditedThisSession ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        已完成本轮审计
                      </>
                    ) : (
                      '执行财务审计'
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {onOpenSponsorships && (
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onOpenSponsorships();
                      onClose();
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/70 border border-cyan-500/40 text-cyan-200 text-xs font-tech font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                    商业引资与赞助商谈判 →
                  </button>
                )}

                {playerPersonalMoney >= 50000 && onInjectPersonalCapital && (
                  <button
                    onClick={() => handleInjectFunds(50000)}
                    className="py-2 px-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-500/40 text-emerald-200 text-xs font-tech font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    title="从个人账户注资 $50,000 进入俱乐部金库"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                    调拨个人注资 $50k
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SALARY CAP */}
          {activeTab === 'SALARY_CAP' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-tech font-bold text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    联盟薪资帽合规审计 (League Salary Cap Rules)
                  </h4>
                  <span className={`text-[10px] font-tech px-2 py-0.5 rounded font-bold ${
                    isOverHardCap
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                      : isOverSoftCap
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {isOverHardCap ? '⚠️ 突破硬帽' : isOverSoftCap ? '⚡ 触发奢侈税' : '✅ 处于安全薪资区间'}
                  </span>
                </div>

                <p className="text-[10.5px] text-slate-400">
                  为维护顶级联赛竞争平衡，全球赛事委员会设立软工资帽 (${softCap.toLocaleString()}) 与硬工资帽 (${hardCap.toLocaleString()})。
                </p>

                {isOverSoftCap && (
                  <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/40 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="text-[10.5px] text-rose-200">
                      <strong>奢侈税警告：</strong> 阵容周薪超额 ${(rosterSalaries - softCap).toLocaleString()}，当前每周需向联盟追加缴纳奢侈税 <span className="font-tech font-bold">${luxuryTaxAmount.toLocaleString()}</span>！建议通过转会或梯队轮换控制开支。
                    </div>
                  </div>
                )}
              </div>

              {/* Roster Salary List */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-tech text-slate-400 uppercase tracking-wider px-1">
                  首发及轮换选手周薪明细
                </div>

                <div className="space-y-1">
                  {dynasty.roster.map(player => (
                    <div 
                      key={player.id}
                      className="px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{player.avatar || '👤'}</span>
                        <div>
                          <div className="font-tech font-bold text-slate-200">
                            {player.name}
                          </div>
                          <div className="text-[9px] text-slate-400 font-tech">
                            位置: {player.role} · 评分: {player.mechanics}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-tech font-bold text-amber-300">
                          ${(player.salary || 0).toLocaleString()} / 周
                        </div>
                        <div className="text-[9px] text-slate-500 font-tech">
                          市值: ${(player.marketValue || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BREAKDOWN */}
          {activeTab === 'BREAKDOWN' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Weekly Inflows */}
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                  <div className="text-xs font-tech font-bold text-emerald-300 flex items-center justify-between">
                    <span>周度固定收入项 (Inflows)</span>
                    <span>+${totalWeeklyInflows.toLocaleString()}</span>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-300 font-sans">
                    <div className="flex justify-between py-1 border-b border-emerald-500/10">
                      <span>商业赞助合同款</span>
                      <span className="font-tech text-emerald-400">+${sponsorInflow.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-emerald-500/10">
                      <span>外设装备品牌分成</span>
                      <span className="font-tech text-emerald-400">+${peripheralInflow.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>周边文创与粉丝门票</span>
                      <span className="font-tech text-emerald-400">+${merchInflow.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Weekly Outflows */}
                <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                  <div className="text-xs font-tech font-bold text-rose-300 flex items-center justify-between">
                    <span>周度固定支出项 (Outflows)</span>
                    <span>-${totalWeeklyExpenses.toLocaleString()}</span>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-300 font-sans">
                    <div className="flex justify-between py-1 border-b border-rose-500/10">
                      <span>选手大名单薪资</span>
                      <span className="font-tech text-rose-400">-${rosterSalaries.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-rose-500/10">
                      <span>基地与理疗设施维护</span>
                      <span className="font-tech text-rose-400">-${facilityUpkeep.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>教练组及后勤津贴</span>
                      <span className="font-tech text-rose-400">-${coachingUpkeep.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Conclusion */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
                💡 <strong>经营建议：</strong> 保持每周净现金流为正数是维持豪门长期繁荣的关键。可通过与更多国际品牌签约赞助代言、提升基地粉丝狂热度 (Fan Hype)，并在转会期合理评估选手性价比来达成最佳资本结构。
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-[11px] font-tech text-slate-400">
          <span>当前俱乐部声望: {dynasty.reputation}点</span>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition cursor-pointer"
          >
            完成审阅
          </button>
        </div>

      </div>
    </div>
  );
};
