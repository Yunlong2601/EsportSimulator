import React, { useState } from 'react';
import {
  Briefcase,
  UserCheck,
  Award,
  Sparkles,
  TrendingUp,
  DollarSign,
  X,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Star,
  Zap,
  Building2,
  ArrowRight,
  Handshake,
  BadgePercent,
  Swords,
  Flame,
  Scale,
  Users,
  ChevronRight,
  AlertTriangle,
  RotateCcw,
  History,
  Check,
  Info
} from 'lucide-react';
import {
  PlayerStats,
  NegotiationTactic,
  AgencyRecruit,
  RecruitNegotiationRecord
} from '../../types/game';
import {
  PLAYER_AGENTS_CONFIG,
  AGENCY_SPONSORSHIPS_CONFIG,
  AGENCY_RECRUITS_CONFIG,
  calculateAgencyActionIncome,
  getAgentById,
  simulateRecruitNegotiation,
  NegotiationResult
} from '../../data/playerAgencyData';
import { soundEngine } from '../../utils/audio';

export interface PlayerAgencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  onHireAgent: (agentId: string) => { success: boolean; message: string };
  onFireAgent: () => void;
  onSignSponsor: (sponsorId: string) => { success: boolean; message: string };
  onSignRecruit?: (
    recruitId: string,
    tactic: NegotiationTactic,
    negotiatedCommission: number,
    negotiatedBonus: number,
    outcome: 'legendary' | 'success' | 'compromise',
    summary: string
  ) => { success: boolean; message: string };
}

export const PlayerAgencyModal: React.FC<PlayerAgencyModalProps> = ({
  isOpen,
  onClose,
  stats,
  onHireAgent,
  onFireAgent,
  onSignSponsor,
  onSignRecruit
}) => {
  const [activeTab, setActiveTab] = useState<'agents' | 'sponsors' | 'recruits' | 'records'>('recruits');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Negotiation Minigame Sub-States
  const [selectedRecruit, setSelectedRecruit] = useState<AgencyRecruit | null>(null);
  const [chosenTactic, setChosenTactic] = useState<NegotiationTactic>('diplomatic');
  const [negotiationStep, setNegotiationStep] = useState<'picker' | 'resolving' | 'result'>('picker');
  const [activeNegotiationResult, setActiveNegotiationResult] = useState<NegotiationResult | null>(null);
  const [isNegotiatingDrawerOpen, setIsNegotiatingDrawerOpen] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentAgentId = stats.agency?.hiredAgentId;
  const currentAgent = getAgentById(currentAgentId);
  const signedSponsors = stats.agency?.signedSponsors || [];
  const signedRecruits = stats.agency?.signedRecruits || [];
  const negotiationHistory = stats.agency?.negotiationHistory || [];
  const agencySummary = calculateAgencyActionIncome(stats.agency, stats.fame);

  const handleHire = (agentId: string) => {
    soundEngine.playClick();
    const res = onHireAgent(agentId);
    setFeedbackMsg({ text: res.message, ok: res.success });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleFire = () => {
    soundEngine.playClick();
    onFireAgent();
    setFeedbackMsg({ text: '已解约当前经纪人，恢复自由选手身份。', ok: true });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleSignSponsorDeal = (sponsorId: string) => {
    soundEngine.playClick();
    const res = onSignSponsor(sponsorId);
    setFeedbackMsg({ text: res.message, ok: res.success });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Open negotiation minigame for a specific recruit
  const handleOpenNegotiation = (recruit: AgencyRecruit) => {
    soundEngine.playClick();
    setSelectedRecruit(recruit);
    setChosenTactic('diplomatic');
    setNegotiationStep('picker');
    setActiveNegotiationResult(null);
    setIsNegotiatingDrawerOpen(true);
  };

  // Run negotiation calculation with animated drama
  const handleExecuteNegotiation = () => {
    if (!selectedRecruit) return;
    soundEngine.playClick();
    setNegotiationStep('resolving');

    // Simulate outcome calculation
    const outcomeResult = simulateRecruitNegotiation(
      selectedRecruit,
      chosenTactic,
      currentAgent,
      stats.fame
    );

    setTimeout(() => {
      setActiveNegotiationResult(outcomeResult);
      setNegotiationStep('result');
      if (outcomeResult.outcome === 'legendary') {
        soundEngine.playVictory();
      } else {
        soundEngine.playCoin();
      }
    }, 700);
  };

  // Finalize contract deal
  const handleFinalizeSigning = () => {
    if (!selectedRecruit || !activeNegotiationResult) return;
    soundEngine.playClick();

    if (onSignRecruit) {
      const res = onSignRecruit(
        selectedRecruit.id,
        chosenTactic,
        activeNegotiationResult.finalCommissionRate,
        activeNegotiationResult.finalSigningBonus,
        activeNegotiationResult.outcome,
        activeNegotiationResult.summary
      );
      setFeedbackMsg({ text: res.message, ok: res.success });
    } else {
      setFeedbackMsg({
        text: `签约成功！锁定佣金 ${(activeNegotiationResult.finalCommissionRate * 100).toFixed(1)}%，签约金 $${activeNegotiationResult.finalSigningBonus.toLocaleString()}`,
        ok: true
      });
    }

    setIsNegotiatingDrawerOpen(false);
    setSelectedRecruit(null);
    setActiveNegotiationResult(null);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Tactical strategy definition cards for minigame
  const TACTIC_DEFINITIONS: Record<
    NegotiationTactic,
    {
      name: string;
      nameEn: string;
      icon: any;
      color: string;
      borderColor: string;
      bgActive: string;
      tone: string;
      commissionInfluence: string;
      bonusInfluence: string;
      riskLevel: string;
      riskColor: string;
      description: string;
      previewCommissionDelta: number; // For live preview before roll
      previewBonusMultiplier: number;
    }
  > = {
    aggressive: {
      name: '强势施压',
      nameEn: 'Aggressive Leverage',
      icon: Zap,
      color: 'text-amber-400',
      borderColor: 'border-amber-500/60',
      bgActive: 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-500/40',
      tone: '依托豪门资源霸权与顶级媒体曝光通道强硬施压，迫使新人让步。',
      commissionInfluence: '+3.5% ~ +5.0% 佣金抽成',
      bonusInfluence: '-15% ~ -25% 压缩签字金',
      riskLevel: '中高风险 (傲气新星可能抗拒)',
      riskColor: 'text-amber-400',
      description: '适合对待热血务实型新人，或在我方知名度远超对手时一举锁定高昂代理佣金。',
      previewCommissionDelta: 0.04,
      previewBonusMultiplier: 0.85
    },
    diplomatic: {
      name: '外交温和',
      nameEn: 'Diplomatic Partnership',
      icon: Handshake,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/60',
      bgActive: 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/40',
      tone: '描绘长远职业规划、法务庇护与个人品牌保护，寻求诚意共赢合作。',
      commissionInfluence: '稳定 8.0% ~ 10.0% 佣金',
      bonusInfluence: '+15% ~ +25% 争取赞助红利',
      riskLevel: '极低风险 (95%+达成率)',
      riskColor: 'text-emerald-400',
      description: '全面激发新秀好感度与忠诚度，合同推进极其顺利，签约金获得赞助商额外加持。',
      previewCommissionDelta: 0.0,
      previewBonusMultiplier: 1.2
    },
    'cut-throat': {
      name: '绝情博弈',
      nameEn: 'Cut-Throat Hardball',
      icon: Swords,
      color: 'text-rose-400',
      borderColor: 'border-rose-500/60',
      bgActive: 'bg-rose-950/40 border-rose-500 ring-1 ring-rose-500/40',
      tone: '极限心理战与排他独占条款施压，极限榨取机构代理商业利益。',
      commissionInfluence: '+6.0% ~ +10.0% 极高佣金',
      bonusInfluence: '-30% ~ -50% 砍除多余签约金',
      riskLevel: '极高博弈 (若破裂则互有妥协)',
      riskColor: 'text-rose-400',
      description: '将商业利益最大化，逼迫签署高达 16%~20% 佣金的严苛协议；若遇精明对手将陷入胶着。',
      previewCommissionDelta: 0.07,
      previewBonusMultiplier: 0.7
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 shadow-2xl shadow-amber-950/30 overflow-hidden text-slate-100 font-sans">
        
        {/* Header */}
        <div className="p-4 border-b border-amber-500/20 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-tech font-bold text-lg text-white tracking-wide">
                  选手经纪公司与商业事务所
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-code font-bold">
                  AGENCY HUB
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                聘用经纪人、谈判商业代言，并在【新星招募】中博弈签约金与经纪佣金抽成
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Dashboard Banner */}
        <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-tech shrink-0">
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-normal flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> 事务所知名度 (Fame)
            </span>
            <div className="text-base font-extrabold text-amber-300 mt-0.5 font-code">
              {stats.fame} <span className="text-[11px] text-slate-400 font-normal">/ 100</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-normal flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" /> 单场被动分红
            </span>
            <div className="text-base font-extrabold text-emerald-400 mt-0.5 font-code">
              +${agencySummary.passiveCash} <span className="text-[10px] text-slate-400 font-normal">/场</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-normal flex items-center gap-1">
              <Scale className="w-3 h-3 text-cyan-400" /> 谈判议价加成 (Leverage)
            </span>
            <div className="text-base font-extrabold text-cyan-400 mt-0.5 font-code">
              +{Math.round((currentAgent ? currentAgent.contractNegotiationRate : 0) * 100)}%
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-normal flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-amber-400" /> 商务累计总创收
            </span>
            <div className="text-base font-extrabold text-amber-400 mt-0.5 font-code">
              ${stats.agency?.totalEarnedFromAgency || 0}
            </div>
          </div>
        </div>

        {/* Interactive Navigation Tabs */}
        <div className="px-4 pt-3 flex gap-2 border-b border-slate-800/80 bg-slate-900/60 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('recruits')}
            className={`pb-2.5 px-3 text-xs font-tech font-bold flex items-center gap-1.5 border-b-2 transition cursor-pointer shrink-0 ${
              activeTab === 'recruits'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Swords className="w-3.5 h-3.5 text-amber-400" />
            <span>新秀代理谈判 ({signedRecruits.length}/{AGENCY_RECRUITS_CONFIG.length})</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-code font-bold">
              HOT
            </span>
          </button>

          <button
            onClick={() => setActiveTab('agents')}
            className={`pb-2.5 px-3 text-xs font-tech font-bold flex items-center gap-1.5 border-b-2 transition cursor-pointer shrink-0 ${
              activeTab === 'agents'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>经纪人矩阵 ({PLAYER_AGENTS_CONFIG.length})</span>
            {currentAgent && (
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-code">
                签约中
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('sponsors')}
            className={`pb-2.5 px-3 text-xs font-tech font-bold flex items-center gap-1.5 border-b-2 transition cursor-pointer shrink-0 ${
              activeTab === 'sponsors'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Handshake className="w-3.5 h-3.5" />
            <span>商业代言赞助 ({signedSponsors.length}/{AGENCY_SPONSORSHIPS_CONFIG.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('records')}
            className={`pb-2.5 px-3 text-xs font-tech font-bold flex items-center gap-1.5 border-b-2 transition cursor-pointer shrink-0 ${
              activeTab === 'records'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>谈判档案 ({negotiationHistory.length})</span>
          </button>
        </div>

        {/* Feedback Alert Toast */}
        {feedbackMsg && (
          <div
            className={`mx-4 mt-2.5 p-2 rounded-xl text-xs font-tech font-bold flex items-center gap-2 border ${
              feedbackMsg.ok
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
            } animate-in fade-in duration-150`}
          >
            {feedbackMsg.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <X className="w-4 h-4 shrink-0" />}
            <span className="truncate">{feedbackMsg.text}</span>
          </div>
        )}

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          
          {/* TAB 1: NEW RECRUITS NEGOTIATION MINIGAME */}
          {activeTab === 'recruits' && (
            <div className="space-y-3">
              {/* Guidance Info Banner */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-indigo-950/30 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-slate-300">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                    <Swords className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-tech font-bold text-white text-sm">
                      新星经纪签约谈判 (Recruits Agency Negotiation Minigame)
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      选择 <b className="text-amber-400">强势施压 (Aggressive)</b>、<b className="text-emerald-400">外交温和 (Diplomatic)</b> 或 <b className="text-rose-400">绝情博弈 (Cut-Throat)</b> 策略，博弈锁定佣金抽成比例与合同签字金！
                    </p>
                  </div>
                </div>

                {!currentAgent && (
                  <button
                    onClick={() => setActiveTab('agents')}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-tech font-bold text-xs shrink-0 cursor-pointer shadow flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>先聘用经纪人</span>
                  </button>
                )}
              </div>

              {/* Recruits Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {AGENCY_RECRUITS_CONFIG.map((recruit) => {
                  const isSigned = signedRecruits.includes(recruit.id);
                  const hasFame = stats.fame >= recruit.fameReq;
                  const record = negotiationHistory.find(h => h.recruitId === recruit.id);

                  return (
                    <div
                      key={recruit.id}
                      className={`p-3.5 rounded-xl border transition flex flex-col justify-between ${
                        isSigned
                          ? 'bg-emerald-950/20 border-emerald-500/60 ring-1 ring-emerald-500/30'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        {/* Header card */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl p-1.5 rounded-xl bg-slate-950 border border-slate-800">
                              {recruit.avatar}
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-tech font-bold text-white text-sm">
                                  {recruit.name}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 font-code font-bold">
                                  {recruit.role}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 font-tech">
                                  {recruit.age}岁
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                                性格特质: <b className="text-amber-300">{recruit.personality}</b> · 潜力: <b className="text-cyan-400 font-code">{recruit.potential}</b>
                              </span>
                            </div>
                          </div>

                          <div className="text-right font-tech">
                            <span className="text-[11px] text-slate-400 block">基础签字意向</span>
                            <span className="text-sm font-bold text-amber-300 font-code">
                              ${recruit.baseSigningBonus.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Bio */}
                        <p className="text-[11px] text-slate-400 font-sans mt-2 line-clamp-2 leading-relaxed">
                          {recruit.bio}
                        </p>

                        {/* Terms Specs */}
                        <div className="mt-2.5 p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1 text-[10px] font-tech">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">门槛知名度要求:</span>
                            <span className={`font-code font-bold ${hasFame ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {recruit.fameReq} Fame (当前: {stats.fame})
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">标准经纪佣金率:</span>
                            <span className="text-cyan-400 font-code font-bold">
                              {(recruit.baseCommissionRate * 100).toFixed(0)}% (基准比例)
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">操作/大局能力:</span>
                            <span className="text-slate-300 font-code">
                              操作 {recruit.mechanics} / 大局 {recruit.macro}
                            </span>
                          </div>
                        </div>

                        {/* Signed status details if already recruited */}
                        {isSigned && record && (
                          <div className="mt-2 p-2 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-[10px] font-tech text-emerald-300 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>已签约代理 · 锁定佣金率 <b>{(record.finalCommission * 100).toFixed(1)}%</b></span>
                            </div>
                            <span className="font-code font-bold">${record.finalSigningBonus.toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="mt-3">
                        {isSigned ? (
                          <div className="w-full py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-center font-tech font-bold text-xs flex items-center justify-center gap-1.5">
                            <Check className="w-3.5 h-3.5" />
                            <span>该选手已由本所独家代理</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenNegotiation(recruit)}
                            disabled={!currentAgent || !hasFame}
                            className={`w-full py-2 rounded-lg font-tech font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow ${
                              !currentAgent
                                ? 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed'
                                : !hasFame
                                ? 'bg-slate-800 text-rose-400 border border-rose-900/50 cursor-not-allowed'
                                : 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white border border-amber-400/40 active:scale-98'
                            }`}
                          >
                            {!currentAgent ? (
                              <span>需先签约经纪人才能发起谈判</span>
                            ) : !hasFame ? (
                              <span>需 {recruit.fameReq} 知名度才能接触</span>
                            ) : (
                              <>
                                <Swords className="w-3.5 h-3.5" />
                                <span>开启博弈签约谈判 (Negotiate)</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: AGENTS MATRIX */}
          {activeTab === 'agents' && (
            <>
              {currentAgent ? (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/20 border border-amber-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl p-2 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                      {currentAgent.avatar}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-tech font-bold text-white text-sm">{currentAgent.name}</span>
                        <span className="text-[10px] px-2 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                          {currentAgent.title}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-bold">
                          ● 执行中合约
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 font-sans">{currentAgent.bio}</p>
                      <div className="flex flex-wrap gap-2 mt-2 text-[11px] font-tech">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-amber-300">
                          特权: {currentAgent.perkName} ({currentAgent.perkDescription})
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-emerald-400">
                          知名度分红倍率: 每点Fame +${currentAgent.passivePerFame}/场
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300">
                          合同谈判议价力: +{Math.round(currentAgent.contractNegotiationRate * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleFire}
                    className="self-end sm:self-center px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 border border-slate-700 hover:border-rose-500 text-slate-400 hover:text-rose-200 text-xs font-tech font-bold transition cursor-pointer shrink-0"
                  >
                    解除经纪约
                  </button>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-400 font-tech">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-500" />
                    <span>当前为自由独立选手。签约经纪人可立即激活知名度变现与商业赞助谈判！</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {PLAYER_AGENTS_CONFIG.map((agent) => {
                  const isCurrent = currentAgentId === agent.id;
                  const canAfford = stats.money >= agent.cost;
                  const hasFame = stats.fame >= agent.fameReq;

                  return (
                    <div
                      key={agent.id}
                      className={`p-3.5 rounded-xl border transition flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-amber-950/20 border-amber-500/60 ring-1 ring-amber-500/40'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        {/* Top row */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{agent.avatar}</span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-tech font-bold text-white text-xs">{agent.name}</span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-code">
                                  Lv.{agent.tier}
                                </span>
                              </div>
                              <span className="text-[10px] text-amber-400/90 font-sans block">{agent.title}</span>
                            </div>
                          </div>
                          <div className="text-right font-tech">
                            <span className="text-sm font-bold text-amber-300 font-code">${agent.cost}</span>
                            <span className="text-[9px] text-slate-500 block">预付签约金</span>
                          </div>
                        </div>

                        {/* Bio */}
                        <p className="text-[11px] text-slate-400 font-sans mt-2 line-clamp-2 leading-relaxed">
                          {agent.bio}
                        </p>

                        {/* Key Metrics */}
                        <div className="mt-2.5 p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1 text-[10px] font-tech">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">门槛知名度要求:</span>
                            <span className={`font-code font-bold ${hasFame ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {agent.fameReq} Fame (当前: {stats.fame})
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">知名度被动倍率:</span>
                            <span className="text-emerald-400 font-code font-bold">
                              +${agent.passivePerFame} / Fame / 场
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">赞助/直播溢价率:</span>
                            <span className="text-cyan-400 font-code font-bold">
                              +{Math.round(agent.sponsorshipBonusRate * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">谈判议价加成:</span>
                            <span className="text-amber-300 font-code font-bold">
                              +{Math.round(agent.contractNegotiationRate * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-0.5 border-t border-slate-800/80">
                            <span className="text-amber-300 font-bold">特权: {agent.perkName}</span>
                            <span className="text-slate-400 truncate max-w-[150px] text-right">{agent.perkDescription}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action button */}
                      <div className="mt-3">
                        {isCurrent ? (
                          <div className="w-full py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-center font-tech font-bold text-xs flex items-center justify-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>当前专属经纪人 (履约中)</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleHire(agent.id)}
                            disabled={!hasFame || !canAfford}
                            className={`w-full py-2 rounded-lg font-tech font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow ${
                              !hasFame
                                ? 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                                : !canAfford
                                ? 'bg-slate-800 text-rose-400 border border-rose-900/50 cursor-not-allowed'
                                : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white border border-amber-400/40 active:scale-98'
                            }`}
                          >
                            {!hasFame ? (
                              <span>需 {agent.fameReq} 知名度</span>
                            ) : !canAfford ? (
                              <span>资金不足 (需 ${agent.cost})</span>
                            ) : (
                              <>
                                <span>签约聘用 (${agent.cost})</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* TAB 3: COMMERCIAL SPONSORSHIPS */}
          {activeTab === 'sponsors' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 flex items-center justify-between text-xs text-slate-300 font-tech">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>
                    商业代言由签约经纪人深度谈判。签约时即发签字费，并在后续单排与直播中持续产生被动带货提成！
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {AGENCY_SPONSORSHIPS_CONFIG.map((sponsor) => {
                  const isSigned = signedSponsors.includes(sponsor.id);
                  const hasFame = stats.fame >= sponsor.fameReq;
                  const agent = currentAgent;
                  const bonusRate = agent ? agent.sponsorshipBonusRate : 0;
                  const finalBonus = Math.floor(sponsor.signingBonus * (1 + bonusRate));
                  const finalPayoutPerAction = Math.floor(sponsor.basePayout * (1 + bonusRate));

                  return (
                    <div
                      key={sponsor.id}
                      className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSigned
                          ? 'bg-emerald-950/20 border-emerald-500/50'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl p-2 rounded-xl bg-slate-950 border border-slate-800">
                          {sponsor.logo}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-tech font-bold text-white text-xs sm:text-sm">
                              {sponsor.brand}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-code">
                              {sponsor.category}
                            </span>
                            {isSigned && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                                履约生效中
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                            {sponsor.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] font-tech">
                            <span className="text-slate-400">
                              门槛知名度: <b className={hasFame ? 'text-emerald-400' : 'text-rose-400'}>{sponsor.fameReq}</b>
                            </span>
                            <span className="text-amber-300">
                              签约即得签字费: <b className="font-code">${finalBonus}</b>
                              {bonusRate > 0 && <span className="text-emerald-400 ml-0.5">(+{Math.round(bonusRate * 100)}% 经纪人溢价)</span>}
                            </span>
                            <span className="text-emerald-400">
                              单场/直播持续提成: <b className="font-code">+${finalPayoutPerAction}</b>/次
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 self-end sm:self-center">
                        {isSigned ? (
                          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-tech font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>代言履约中</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleSignSponsorDeal(sponsor.id)}
                            disabled={!currentAgent || !hasFame}
                            className={`px-4 py-2 rounded-lg font-tech font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow ${
                              !currentAgent
                                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                                : !hasFame
                                ? 'bg-slate-800 text-rose-400 border border-rose-900/50 cursor-not-allowed'
                                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/40 active:scale-98'
                            }`}
                          >
                            {!currentAgent ? (
                              <span>需先签约经纪人</span>
                            ) : !hasFame ? (
                              <span>需 {sponsor.fameReq} 知名度</span>
                            ) : (
                              <>
                                <span>签署代言合约 (领 ${finalBonus})</span>
                                <Handshake className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: NEGOTIATION ARCHIVES */}
          {activeTab === 'records' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-400 font-tech">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-cyan-400" />
                  <span>记录每一次经纪人与选手的博弈谈判历程、策略抉择与最终落地的佣金条款</span>
                </div>
                <span className="text-cyan-400 font-code font-bold">共 {negotiationHistory.length} 份档案</span>
              </div>

              {negotiationHistory.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-dashed border-slate-800">
                  <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-tech text-slate-400">暂无谈判签约档案</p>
                  <p className="text-xs text-slate-500 mt-1">前往【新秀代理谈判】选项卡开启你的第一场签约博弈</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {negotiationHistory.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-tech font-bold text-white text-sm">{rec.recruitName}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-tech font-bold ${
                              rec.tactic === 'aggressive'
                                ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                                : rec.tactic === 'diplomatic'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                            }`}
                          >
                            战术: {rec.tactic === 'aggressive' ? '强势施压' : rec.tactic === 'diplomatic' ? '外交温和' : '绝情博弈'}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-tech ${
                              rec.outcome === 'legendary'
                                ? 'bg-amber-500/20 text-amber-300'
                                : rec.outcome === 'success'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {rec.outcome === 'legendary' ? '🏆 传奇大捷' : rec.outcome === 'success' ? '✅ 圆满达成' : '⚖️ 势均妥协'}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-1 font-sans">{rec.summary}</p>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between text-right font-tech shrink-0 gap-1">
                        <div className="text-emerald-400 font-code font-bold">
                          佣金: {(rec.finalCommission * 100).toFixed(1)}%
                          <span className="text-[10px] text-slate-500 ml-1">
                            (原{(rec.baseCommission * 100).toFixed(0)}%)
                          </span>
                        </div>
                        <div className="text-amber-300 font-code">
                          签约金: ${rec.finalSigningBonus.toLocaleString()}
                        </div>
                        <div className="text-[9px] text-slate-500 font-code">{rec.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs font-tech text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>提示：战术博弈直接影响事务所长期代理抽成比率与即时收取的经纪首期服务费</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition cursor-pointer"
          >
            关闭事务所
          </button>
        </div>

      </div>

      {/* ========================================================== */}
      {/* NEGOTIATION MINIGAME DRAWER / INTERACTIVE OVERLAY */}
      {/* ========================================================== */}
      {isNegotiatingDrawerOpen && selectedRecruit && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/50 shadow-2xl overflow-hidden text-slate-100 font-sans">
            
            {/* Drawer Header */}
            <div className="p-4 bg-gradient-to-r from-amber-950/60 via-slate-900 to-indigo-950/50 border-b border-amber-500/30 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-1.5 rounded-xl bg-slate-950 border border-slate-800">
                  {selectedRecruit.avatar}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-tech font-bold text-base text-white">
                      新星签约博弈谈判：{selectedRecruit.name}
                    </h3>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 font-code font-bold">
                      {selectedRecruit.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    性格: <b className="text-amber-300">{selectedRecruit.personality}</b> · 意向签约金: <b className="text-amber-400 font-code">${selectedRecruit.baseSigningBonus.toLocaleString()}</b>
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setIsNegotiatingDrawerOpen(false);
                }}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Negotiation Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* STEP 1: PICKING TACTIC */}
              {negotiationStep === 'picker' && (
                <>
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-tech text-slate-300 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-cyan-400" />
                      <span>请制定本次面对面交涉的核心战术。战术直接影响最终佣金率与签字金支出！</span>
                    </div>
                  </div>

                  {/* Tactics 3-way Selection Cards */}
                  <div className="space-y-2.5">
                    {(['aggressive', 'diplomatic', 'cut-throat'] as NegotiationTactic[]).map((tacticKey) => {
                      const tac = TACTIC_DEFINITIONS[tacticKey];
                      const Icon = tac.icon;
                      const isSelected = chosenTactic === tacticKey;

                      // Live preview calculate
                      const previewComm = Math.min(
                        0.22,
                        Math.max(0.06, selectedRecruit.baseCommissionRate + tac.previewCommissionDelta)
                      );
                      const previewBonus = Math.floor(selectedRecruit.baseSigningBonus * tac.previewBonusMultiplier);

                      return (
                        <div
                          key={tacticKey}
                          onClick={() => {
                            soundEngine.playClick();
                            setChosenTactic(tacticKey);
                          }}
                          className={`p-3.5 rounded-xl border transition cursor-pointer ${
                            isSelected
                              ? tac.bgActive
                              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-xl bg-slate-950 border border-slate-800 ${tac.color}`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-tech font-bold text-white text-sm">
                                    {tac.name}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-code font-bold">
                                    ({tac.nameEn})
                                  </span>
                                  {isSelected && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                                      已选中战术
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-300 mt-1 font-sans">
                                  {tac.tone}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-1 font-sans">
                                  {tac.description}
                                </p>

                                {/* Expected impact stats */}
                                <div className="flex flex-wrap items-center gap-2.5 mt-2.5 text-[10px] font-tech">
                                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300 font-bold">
                                    佣金预期: {tac.commissionInfluence}
                                  </span>
                                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-300 font-bold">
                                    签字金预期: {tac.bonusInfluence}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-bold ${tac.riskColor}`}>
                                    风险: {tac.riskLevel}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="shrink-0 text-right font-tech">
                              <span className="text-[10px] text-slate-500 block">战术预估佣金</span>
                              <span className="text-sm font-bold text-emerald-400 font-code">
                                {(previewComm * 100).toFixed(1)}%
                              </span>
                              <span className="text-[10px] text-slate-500 block mt-1">预估签字金</span>
                              <span className="text-xs font-bold text-amber-300 font-code">
                                ${previewBonus.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary Comparison Bar */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-tech space-y-1.5">
                    <div className="flex justify-between text-slate-400">
                      <span>初始意向基准 (Baseline):</span>
                      <span className="text-slate-200 font-code">
                        佣金 {(selectedRecruit.baseCommissionRate * 100).toFixed(0)}% · 意向签字金 ${selectedRecruit.baseSigningBonus.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>当前谈判加成优势 (Leverage):</span>
                      <span className="text-cyan-400 font-code">
                        经纪人加成 +{Math.round((currentAgent?.contractNegotiationRate || 0) * 100)}% · 事务所声望 {stats.fame} Fame
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* STEP 2: RESOLVING / ANIMATION */}
              {negotiationStep === 'resolving' && (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin mx-auto" />
                  <h4 className="font-tech font-bold text-white text-base">
                    正在执行【{TACTIC_DEFINITIONS[chosenTactic].name}】谈判博弈……
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto font-tech">
                    双方代理律师与选手正在仔细核对独家经纪条款与签字金比例……
                  </p>
                </div>
              )}

              {/* STEP 3: OUTCOME RESULT */}
              {negotiationStep === 'result' && activeNegotiationResult && (
                <div className="space-y-3.5 animate-in fade-in duration-200">
                  {/* Outcome Banner */}
                  <div
                    className={`p-4 rounded-xl border flex items-center justify-between ${
                      activeNegotiationResult.outcome === 'legendary'
                        ? 'bg-gradient-to-r from-amber-950/60 via-orange-950/40 to-slate-900 border-amber-500/70 text-amber-300'
                        : activeNegotiationResult.outcome === 'success'
                        ? 'bg-gradient-to-r from-emerald-950/60 via-teal-950/40 to-slate-900 border-emerald-500/70 text-emerald-300'
                        : 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-current">
                        {activeNegotiationResult.outcome === 'legendary' ? (
                          <Award className="w-6 h-6 text-amber-400" />
                        ) : activeNegotiationResult.outcome === 'success' ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        ) : (
                          <Scale className="w-6 h-6 text-cyan-400" />
                        )}
                      </div>
                      <div>
                        <span className="font-tech font-extrabold text-base block text-white">
                          {activeNegotiationResult.outcome === 'legendary'
                            ? '🏆 传奇博弈大捷 (Legendary Agreement)'
                            : activeNegotiationResult.outcome === 'success'
                            ? '✅ 谈判圆满达成 (Contract Agreed)'
                            : '⚖️ 势均力敌妥协 (Compromise Accord)'}
                        </span>
                        <span className="text-xs opacity-90 font-tech">
                          {activeNegotiationResult.summary}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dialogue Ticker */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                    <span className="text-[10px] text-slate-400 font-tech font-bold uppercase tracking-wider block">
                      交涉会谈实录 (Negotiation Transcript)
                    </span>
                    <div className="space-y-2">
                      {activeNegotiationResult.dialogueHistory.map((d, idx) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                            d.role === 'agent'
                              ? 'bg-amber-950/30 border border-amber-500/30 text-amber-200'
                              : d.role === 'recruit'
                              ? 'bg-slate-900 border border-slate-700 text-slate-200'
                              : 'bg-slate-900/60 border border-slate-800 text-cyan-300'
                          }`}
                        >
                          <b className="font-tech font-bold block mb-0.5 text-[11px]">
                            {d.speaker}:
                          </b>
                          <span className="font-sans">{d.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Final Locked Terms Card */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 grid grid-cols-3 gap-2.5 text-center font-tech">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">最终锁定佣金率</span>
                      <span className="text-base font-extrabold text-emerald-400 font-code">
                        {(activeNegotiationResult.finalCommissionRate * 100).toFixed(1)}%
                      </span>
                      <span className="text-[9px] text-slate-500 block">
                        {activeNegotiationResult.commissionDelta >= 0 ? '+' : ''}
                        {(activeNegotiationResult.commissionDelta * 100).toFixed(1)}% 浮动
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">最终确定签字金</span>
                      <span className="text-base font-extrabold text-amber-300 font-code">
                        ${activeNegotiationResult.finalSigningBonus.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-slate-500 block">
                        {activeNegotiationResult.bonusDelta >= 0 ? '+' : ''}
                        ${activeNegotiationResult.bonusDelta.toLocaleString()} 浮动
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">即时佣金收益</span>
                      <span className="text-base font-extrabold text-cyan-400 font-code">
                        +${activeNegotiationResult.agencyEarnedCommission.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-slate-500 block">入账事务所总收益</span>
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Drawer Actions */}
            <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
              {negotiationStep === 'picker' ? (
                <>
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      setIsNegotiatingDrawerOpen(false);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-tech font-bold text-xs cursor-pointer"
                  >
                    取消本次交涉
                  </button>

                  <button
                    onClick={handleExecuteNegotiation}
                    className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-tech font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-600/30 cursor-pointer active:scale-98"
                  >
                    <span>确认战术并开局交涉</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              ) : negotiationStep === 'result' ? (
                <>
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      setNegotiationStep('picker');
                      setActiveNegotiationResult(null);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-tech font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>更换战术重新交涉</span>
                  </button>

                  <button
                    onClick={handleFinalizeSigning}
                    className="px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-tech font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 cursor-pointer active:scale-98"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>正式签约达成并归档 (Sign Deal)</span>
                  </button>
                </>
              ) : (
                <div className="w-full text-center text-xs font-tech text-slate-500">
                  交涉谈判进行中……
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

// Export alias so any references to AgencyModal work seamlessly
export const AgencyModal = PlayerAgencyModal;
