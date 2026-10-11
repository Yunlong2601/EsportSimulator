import React, { useState } from 'react';
import {
  DollarSign,
  ShieldAlert,
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  TrendingUp,
  FileText,
  Users,
  Award,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Info,
  X,
  Scale,
  Percent,
  History
} from 'lucide-react';
import { DynastyState, ProPlayer } from '../../types/game';
import { soundEngine } from '../../utils/audio';

interface ContractBuyoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  dynasty: DynastyState;
  onUpdateDynasty: React.Dispatch<React.SetStateAction<DynastyState>>;
  targetPlayer?: ProPlayer | null; // If opening directly to sign/buyout a specific player
  onOpenScoutTab?: () => void;
}

export const ContractBuyoutModal: React.FC<ContractBuyoutModalProps> = ({
  isOpen,
  onClose,
  dynasty,
  onUpdateDynasty,
  targetPlayer: initialTargetPlayer,
  onOpenScoutTab
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'salary_cap' | 'buyout_calc' | 'history'>('salary_cap');
  const [selectedPlayerForBuyout, setSelectedPlayerForBuyout] = useState<ProPlayer | null>(initialTargetPlayer || null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  // Salary Cap Rules
  const salaryCap = dynasty.salaryCapRules || {
    softCap: 70000,
    hardCap: 95000,
    luxuryTaxRate: 1.5,
    agencyFeeRate: 0.10,
    luxuryTaxPaidTotal: 0
  };

  // Calculate current payroll & salary distribution
  const currentWeeklyPayroll = dynasty.roster.reduce((acc, p) => acc + (p.salary || 10000), 0);
  const isOverSoftCap = currentWeeklyPayroll > salaryCap.softCap;
  const isOverHardCap = currentWeeklyPayroll >= salaryCap.hardCap;
  const excessPayroll = Math.max(0, currentWeeklyPayroll - salaryCap.softCap);
  const currentWeeklyLuxuryTax = Math.round(excessPayroll * salaryCap.luxuryTaxRate);

  // Soft cap usage percentage
  const softCapUsagePct = Math.min(100, Math.round((currentWeeklyPayroll / salaryCap.softCap) * 100));
  const hardCapUsagePct = Math.min(100, Math.round((currentWeeklyPayroll / salaryCap.hardCap) * 100));

  // Handle contract buyout & signing with 10% agency commission
  const handleExecuteBuyout = (player: ProPlayer) => {
    const baseBuyout = player.marketValue || 200000;
    const agencyCommission = Math.round(baseBuyout * (salaryCap.agencyFeeRate || 0.10));
    const totalCost = baseBuyout + agencyCommission;

    // Projected payroll after replacing the player in that role
    const existingRolePlayer = dynasty.roster.find(p => p.role === player.role);
    const projectedPayroll = currentWeeklyPayroll - (existingRolePlayer?.salary || 0) + (player.salary || 12000);

    // Hard cap violation check
    if (projectedPayroll > salaryCap.hardCap) {
      soundEngine.playDefeat();
      alert(`⚠️ 签约被联盟否决！该选手周薪为 $${(player.salary || 12000).toLocaleString()}，签约后全队总薪酬将达 $${projectedPayroll.toLocaleString()}，突破硬工资帽上限 ($${salaryCap.hardCap.toLocaleString()})！请先解约或清理薪资空间。`);
      return;
    }

    if (dynasty.budget < totalCost) {
      soundEngine.playDefeat();
      alert(`⚠️ 俱乐部金库余额不足！转会买断需支付基准买断金 $${baseBuyout.toLocaleString()} + 10% 经纪公司佣金 $${agencyCommission.toLocaleString()} = 总计 $${totalCost.toLocaleString()}！`);
      return;
    }

    soundEngine.playCoin();

    // Deduct total cost and add player
    onUpdateDynasty(prev => {
      const updatedRoster = prev.roster.map(p => p.role === player.role ? {
        ...player,
        agencyName: player.agencyName || '星耀文娱经纪集团 (Star Agency)',
        contractYears: player.contractYears || 2,
        buyoutClause: player.buyoutClause || player.marketValue
      } : p);

      const newHistoryItem = {
        id: `buyout-${Date.now()}`,
        playerName: player.name,
        role: player.role,
        baseBuyout,
        agencyCommission,
        totalPaid: totalCost,
        annualSalary: player.salary || 12000,
        type: 'SIGNING' as const,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        agencyName: player.agencyName || '极速电竞体育经纪 (Apex Sports)'
      };

      return {
        ...prev,
        budget: prev.budget - totalCost,
        roster: updatedRoster,
        fanHype: prev.fanHype + 4500,
        contractBuyoutHistory: [newHistoryItem, ...(prev.contractBuyoutHistory || [])]
      };
    });

    setSuccessNotice(`✅ 成功引援！已向经纪公司支付 10% 佣金 ($${agencyCommission.toLocaleString()})，总计交割 $${totalCost.toLocaleString()}。${player.name} 正式入列大名单！`);
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-3.5 bg-gradient-to-r from-amber-950/70 via-slate-900 to-indigo-950/70 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 shadow-md">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-tech font-extrabold text-white tracking-wide">
                  职业薪酬工资帽 & 转会买断经纪系统
                </h3>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-tech font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  LPL/LCK 劳资协议
                </span>
              </div>
              <p className="text-[10px] text-slate-300 font-tech">
                Salary Cap Compliance & 10% Agency Commission Protocol
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Success Notice */}
        {successNotice && (
          <div className="mx-3 mt-2.5 p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs flex items-center gap-2 font-tech animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Sub-Tab Navigation */}
        <div className="p-2 border-b border-slate-800 bg-slate-950/60 flex items-center gap-1">
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveSubTab('salary_cap');
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-tech font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSubTab === 'salary_cap'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>工资帽与奢侈税</span>
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveSubTab('buyout_calc');
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-tech font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSubTab === 'buyout_calc'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>10% 经纪买断测算</span>
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveSubTab('history');
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-tech font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSubTab === 'history'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>签约存根 ({dynasty.contractBuyoutHistory?.length || 0})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5">
          {/* TAB 1: SALARY CAP OVERVIEW */}
          {activeSubTab === 'salary_cap' && (
            <div className="space-y-3">
              {/* Top Cap Metrics */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="text-[10px] font-tech text-slate-400 flex items-center justify-between">
                    <span>当前全队周薪支出</span>
                    <span className="font-bold text-white">${currentWeeklyPayroll.toLocaleString()}</span>
                  </div>
                  <div className="text-base font-code font-black text-cyan-300">
                    ${currentWeeklyPayroll.toLocaleString()} <span className="text-xs text-slate-400 font-sans font-normal">/ 周</span>
                  </div>
                  <div className="text-[9px] text-slate-400 font-tech">
                    占软工资帽 {softCapUsagePct}% · 占硬工资帽 {hardCapUsagePct}%
                  </div>
                </div>

                <div className={`p-3 rounded-xl border space-y-1 ${
                  isOverHardCap
                    ? 'bg-rose-950/50 border-rose-500/60 text-rose-300'
                    : isOverSoftCap
                    ? 'bg-amber-950/50 border-amber-500/60 text-amber-300'
                    : 'bg-emerald-950/50 border-emerald-500/60 text-emerald-300'
                }`}>
                  <div className="text-[10px] font-tech flex items-center justify-between">
                    <span>合规状态</span>
                    <span className="font-bold">
                      {isOverHardCap ? '🚨 突破硬帽 (违规)' : isOverSoftCap ? '⚠️ 触发奢侈税' : '✅ 预算健康'}
                    </span>
                  </div>
                  <div className="text-base font-code font-black">
                    {isOverSoftCap ? `+$${currentWeeklyLuxuryTax.toLocaleString()}` : '$0'}
                    <span className="text-xs font-sans font-normal opacity-80"> 奢侈税/周</span>
                  </div>
                  <div className="text-[9px] font-tech opacity-90">
                    {isOverSoftCap
                      ? `超出软帽 $${excessPayroll.toLocaleString()}，加征 150% 惩罚性重税`
                      : `薪酬未超标，无需缴纳奢侈税`}
                  </div>
                </div>
              </div>

              {/* Progress Visualizer: Soft Cap vs Hard Cap */}
              <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-tech">
                  <span className="text-white font-bold flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-amber-400" />
                    工资帽警戒线刻度
                  </span>
                  <div className="flex items-center gap-3 text-[10px] font-code">
                    <span className="text-amber-400 font-bold">软帽: ${salaryCap.softCap.toLocaleString()}</span>
                    <span className="text-rose-400 font-bold">硬帽: ${salaryCap.hardCap.toLocaleString()}</span>
                  </div>
                </div>

                {/* Multi-tier Bar */}
                <div className="relative w-full h-3.5 bg-slate-800 rounded-full overflow-hidden">
                  {/* Soft Cap limit line indicator */}
                  <div
                    className="absolute top-0 bottom-0 z-10 w-0.5 bg-amber-400 shadow-[0_0_8px_#f59e0b]"
                    style={{ left: `${Math.round((salaryCap.softCap / salaryCap.hardCap) * 100)}%` }}
                  />
                  {/* Fill Bar */}
                  <div
                    className={`h-full transition-all duration-300 ${
                      isOverHardCap
                        ? 'bg-rose-500'
                        : isOverSoftCap
                        ? 'bg-gradient-to-r from-emerald-500 via-amber-500 to-orange-500'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    }`}
                    style={{ width: `${Math.min(100, Math.round((currentWeeklyPayroll / salaryCap.hardCap) * 100))}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[9px] text-slate-400 font-tech">
                  <span>$0 (起薪)</span>
                  <span className="text-amber-300">🟡 软帽线 (${salaryCap.softCap.toLocaleString()}) 超出征税</span>
                  <span className="text-rose-300">🔴 硬帽顶 (${salaryCap.hardCap.toLocaleString()}) 禁止签约</span>
                </div>
              </div>

              {/* Roster Salary Ledger Breakdown */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-tech font-bold text-white px-1">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    首发选手薪酬总览表
                  </span>
                  <span className="text-[10px] text-slate-400">
                    全队共 {dynasty.roster.length} 名签约选手
                  </span>
                </div>

                <div className="divide-y divide-slate-800/80 rounded-xl bg-slate-950/80 border border-slate-800 overflow-hidden">
                  {dynasty.roster.map(p => {
                    const salaryPct = Math.round(((p.salary || 10000) / currentWeeklyPayroll) * 100);
                    return (
                      <div key={p.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-900/50 transition">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{p.avatar}</span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-tech font-bold text-white">{p.name}</span>
                              <span className="px-1 py-0.2 rounded text-[8px] font-code bg-slate-800 text-cyan-300 border border-slate-700">
                                {p.role}
                              </span>
                              {p.agencyName && (
                                <span className="text-[8px] font-tech text-amber-300/80 bg-amber-950/40 px-1 rounded border border-amber-500/20">
                                  {p.agencyName.split(' ')[0]}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                              合约年限: {p.contractYears || 2} 年 · 违约买断金: ${((p.buyoutClause || p.marketValue || 150000)).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-code font-bold text-emerald-400">
                            ${(p.salary || 10000).toLocaleString()} <span className="text-[9px] text-slate-400 font-sans font-normal">/周</span>
                          </div>
                          <div className="text-[9px] text-slate-400 font-code">
                            占全队 {salaryPct}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Rules Explanation Callout */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1 text-[11px] text-slate-300 font-sans">
                <div className="text-xs font-tech font-bold text-amber-300 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  豪门赛区工资帽规则 (Salary Cap Regulations)
                </div>
                <p className="leading-relaxed">
                  1. <strong className="text-white">软工资帽 (Soft Cap, $70,000/周)</strong>：允许签约顶尖明星选手，但超出部分每周按 150% 征缴奢侈税入联盟青训发展基金。
                </p>
                <p className="leading-relaxed">
                  2. <strong className="text-white">硬工资帽 (Hard Cap, $95,000/周)</strong>：不可逾越的薪资天花板，任何导致周薪总额破硬帽的新转会均会被联盟直接驳回。
                </p>
                <p className="leading-relaxed">
                  3. <strong className="text-white">经纪人佣金 (10% Agency Fee)</strong>：任何转会买断除支付原战队买断费外，强制额外代扣 10% 佣金转交选手所属注册经纪公司。
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: BUYOUT & AGENCY COMMISSION CALCULATOR */}
          {activeSubTab === 'buyout_calc' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/50 via-slate-950 to-indigo-950/50 border border-amber-500/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-tech font-bold text-amber-400 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" /> 10% 转会经纪人佣金测算与买断
                  </div>
                  <p className="text-[10px] text-slate-300 mt-0.5">
                    选择星探球探池或全球战队明星，一键拆解买断成本与合规校验
                  </p>
                </div>
                {onOpenScoutTab && (
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onOpenScoutTab();
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-tech font-bold text-[10px] cursor-pointer shadow"
                  >
                    前往全球星探池 →
                  </button>
                )}
              </div>

              {/* Candidate Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-tech font-bold text-slate-300 block">
                  选择待买断选手目标：
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {[
                    {
                      id: 'scout_1',
                      name: 'Zephyr (清风)',
                      role: 'TOP',
                      marketValue: 250000,
                      salary: 14000,
                      avatar: '🌪️',
                      agencyName: '极速巅峰体育经纪 (Apex Velocity)'
                    },
                    {
                      id: 'scout_2',
                      name: 'ShadowFang (暗影牙)',
                      role: 'JUG',
                      marketValue: 310000,
                      salary: 16500,
                      avatar: '🐺',
                      agencyName: '幽影电竞合伙人 (Shadow Partnership)'
                    },
                    {
                      id: 'scout_3',
                      name: 'Eclipse (日蚀)',
                      role: 'MID',
                      marketValue: 450000,
                      salary: 22000,
                      avatar: '☀️',
                      agencyName: '全球星耀文娱 (Global Star Agency)'
                    },
                    {
                      id: 'scout_4',
                      name: 'HyperGuns (重炮手)',
                      role: 'ADC',
                      marketValue: 320000,
                      salary: 17000,
                      avatar: '🔫',
                      agencyName: '烈焰竞技经纪公司 (Blaze Sports Group)'
                    },
                    {
                      id: 'scout_5',
                      name: 'Sanctuary (圣灵守护)',
                      role: 'SUP',
                      marketValue: 270000,
                      salary: 15000,
                      avatar: '🕊️',
                      agencyName: '神盾智胜体育 (Aegis Esports Mgmt)'
                    }
                  ].map(cand => {
                    const isSelected = selectedPlayerForBuyout?.name === cand.name;
                    return (
                      <button
                        key={cand.id}
                        onClick={() => {
                          soundEngine.playClick();
                          setSelectedPlayerForBuyout({
                            id: cand.id,
                            name: cand.name,
                            role: cand.role as any,
                            country: '中国',
                            age: 19,
                            mechanics: 95,
                            macro: 92,
                            morale: 95,
                            salary: cand.salary,
                            marketValue: cand.marketValue,
                            avatar: cand.avatar,
                            agencyName: cand.agencyName
                          });
                        }}
                        className={`p-2 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-400 text-white shadow-md'
                            : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{cand.avatar}</span>
                          <div>
                            <div className="text-xs font-tech font-bold">{cand.name}</div>
                            <div className="text-[9px] text-cyan-400 font-code">{cand.role} · ${cand.marketValue.toLocaleString()}</div>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Financial Calculation Breakdown Card */}
              {selectedPlayerForBuyout && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/50 space-y-2.5 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{selectedPlayerForBuyout.avatar}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-tech font-extrabold text-white text-sm">{selectedPlayerForBuyout.name}</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-code bg-cyan-950 text-cyan-300 border border-cyan-800">
                            {selectedPlayerForBuyout.role}
                          </span>
                        </div>
                        <span className="text-[10px] text-amber-300 font-tech">
                          所属经纪公司: {selectedPlayerForBuyout.agencyName || '星耀文娱经纪集团'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 font-tech block">预期周薪</span>
                      <span className="text-xs font-code font-bold text-emerald-400">
                        ${(selectedPlayerForBuyout.salary || 12000).toLocaleString()}/周
                      </span>
                    </div>
                  </div>

                  {/* Pricing Breakdown Math Table */}
                  <div className="space-y-1.5 text-xs font-tech">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>1. 转会买断金基准 (Buyout Base)</span>
                      <span className="font-code font-bold text-white">
                        ${(selectedPlayerForBuyout.marketValue || 200000).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-amber-300 bg-amber-950/30 p-1.5 rounded-lg border border-amber-500/30">
                      <span className="flex items-center gap-1">
                        <Percent className="w-3 h-3" />
                        2. 经纪公司服务佣金 (10% Agency Fee)
                      </span>
                      <span className="font-code font-bold text-amber-300">
                        +${Math.round((selectedPlayerForBuyout.marketValue || 200000) * 0.10).toLocaleString()}
                      </span>
                    </div>

                    <div className="border-t border-slate-800 pt-1.5 flex items-center justify-between text-sm">
                      <span className="font-extrabold text-white">签约总交割现款 (Total Buyout)</span>
                      <span className="font-code font-black text-amber-400 text-base">
                        ${Math.round((selectedPlayerForBuyout.marketValue || 200000) * 1.10).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Impact on Payroll and Salary Cap check */}
                  {(() => {
                    const baseBuyout = selectedPlayerForBuyout.marketValue || 200000;
                    const agencyCommission = Math.round(baseBuyout * 0.10);
                    const totalCost = baseBuyout + agencyCommission;
                    const existingRolePlayer = dynasty.roster.find(p => p.role === selectedPlayerForBuyout.role);
                    const projectedPayroll = currentWeeklyPayroll - (existingRolePlayer?.salary || 0) + (selectedPlayerForBuyout.salary || 12000);
                    const exceedsHardCap = projectedPayroll > salaryCap.hardCap;
                    const exceedsSoftCap = projectedPayroll > salaryCap.softCap;
                    const canAfford = dynasty.budget >= totalCost;

                    return (
                      <div className="space-y-2 pt-1 border-t border-slate-800/80">
                        <div className="flex items-center justify-between text-[11px] font-tech">
                          <span className="text-slate-400">薪资帽合规预判：</span>
                          <span className={`font-bold ${exceedsHardCap ? 'text-rose-400' : exceedsSoftCap ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {exceedsHardCap ? '❌ 签约后超硬帽 (禁止)' : exceedsSoftCap ? '⚠️ 签约后触发奢侈税' : '✅ 预算充裕安全'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-sans">
                          <span>签约后新周薪: <strong className="text-white font-code">${projectedPayroll.toLocaleString()}</strong></span>
                          <span>俱乐部金库: <strong className="text-emerald-300 font-code">${dynasty.budget.toLocaleString()}</strong></span>
                        </div>

                        <button
                          disabled={exceedsHardCap || !canAfford}
                          onClick={() => handleExecuteBuyout(selectedPlayerForBuyout)}
                          className={`w-full py-2.5 rounded-xl font-tech font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg ${
                            exceedsHardCap
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                              : !canAfford
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-800 cursor-not-allowed'
                              : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 hover:brightness-110'
                          }`}
                        >
                          <Briefcase className="w-4 h-4" />
                          <span>
                            {exceedsHardCap
                              ? '薪资总额超硬帽 · 签约受阻'
                              : !canAfford
                              ? '金库余额不足以支付买断及佣金'
                              : `确认转会签约 (付清 $${totalCost.toLocaleString()})`}
                          </span>
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CONTRACT BUYOUT & TRANSACTION AUDIT LOG */}
          {activeSubTab === 'history' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-tech font-bold text-white px-1">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  官方转会合同与经纪人佣金存根
                </span>
                <span className="text-[10px] text-slate-400">
                  共计 {dynasty.contractBuyoutHistory?.length || 0} 笔转会审计记录
                </span>
              </div>

              {(!dynasty.contractBuyoutHistory || dynasty.contractBuyoutHistory.length === 0) ? (
                <div className="p-8 text-center rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 text-xs font-tech">
                  暂无转会买断交割记录。完成选手签约后即可生成合法劳资审计单。
                </div>
              ) : (
                <div className="space-y-2">
                  {dynasty.contractBuyoutHistory.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition space-y-1.5 text-xs font-tech"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{item.playerName}</span>
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-code bg-cyan-950 text-cyan-300 border border-cyan-800">
                            {item.role}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[8px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                            {item.type === 'SIGNING' ? '签约加盟' : '合同续约'}
                          </span>
                        </div>
                        <span className="text-[10px] font-code text-slate-400">{item.timestamp}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[10px] font-code pt-1 border-t border-slate-800/80">
                        <div>
                          <span className="text-slate-400 block text-[9px] font-tech">买断底价</span>
                          <span className="text-white">${item.baseBuyout.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-amber-400 block text-[9px] font-tech">10% 经纪佣金</span>
                          <span className="text-amber-300">+${item.agencyCommission.toLocaleString()}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-emerald-400 block text-[9px] font-tech">总计实付</span>
                          <span className="text-emerald-300 font-bold">${item.totalPaid.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-400 font-sans flex items-center justify-between pt-0.5">
                        <span>签约经纪公司：{item.agencyName}</span>
                        <span>约定周薪：${item.annualSalary.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs font-tech">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>当前金库: <strong className="text-emerald-300 font-code font-bold">${dynasty.budget.toLocaleString()}</strong></span>
            <span>•</span>
            <span>全队周薪: <strong className="text-cyan-300 font-code font-bold">${currentWeeklyPayroll.toLocaleString()}</strong></span>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer transition text-xs"
          >
            完成审阅
          </button>
        </div>
      </div>
    </div>
  );
};
