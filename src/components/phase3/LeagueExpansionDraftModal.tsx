import React, { useState, useMemo } from 'react';
import { 
  Shield, 
  Sparkles, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Award, 
  DollarSign, 
  ChevronRight, 
  Flame, 
  Info, 
  Zap, 
  Check, 
  RotateCcw,
  Target,
  Trophy,
  History,
  X
} from 'lucide-react';
import { 
  DynastyState, 
  ProPlayer, 
  SoloQueueProdigy, 
  PlayerPlaystyle 
} from '../../types/game';
import { 
  generateAnnualProdigyPool, 
  convertProdigyToProPlayer,
  EXPANSION_FRANCHISE_NAMES 
} from '../../data/expansionDraftData';
import { soundEngine } from '../../utils/audio';
import { PLAYSTYLE_CONFIG } from './PhaseThreeDynasty';

interface LeagueExpansionDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  dynasty: DynastyState;
  onUpdateDynasty: React.Dispatch<React.SetStateAction<DynastyState>>;
}

export const LeagueExpansionDraftModal: React.FC<LeagueExpansionDraftModalProps> = ({
  isOpen,
  onClose,
  dynasty,
  onUpdateDynasty
}) => {
  // Step in the draft flow: 1: Protect Core 3 -> 2: Draft Solo Queue Prodigy -> 3: Summary / Celebration
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedProtectedIds, setSelectedProtectedIds] = useState<string[]>(() => {
    // Default protect the top 3 rated players in roster
    const sorted = [...dynasty.roster].sort((a, b) => (b.mechanics + b.macro) - (a.mechanics + a.macro));
    return sorted.slice(0, 3).map(p => p.id);
  });
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [selectedProdigy, setSelectedProdigy] = useState<SoloQueueProdigy | null>(null);
  const [draftedProdigyResult, setDraftedProdigyResult] = useState<SoloQueueProdigy | null>(null);
  const [replaceTargetPlayerId, setReplaceTargetPlayerId] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'draft' | 'history'>('draft');

  const currentYear = dynasty.expansionDraftState?.currentYear || 2026;
  const expansionTeamName = dynasty.expansionDraftState?.expansionFranchiseName || EXPANSION_FRANCHISE_NAMES[0];

  // Annual prodigy pool for current competitive year
  const prodigiesPool = useMemo(() => {
    return generateAnnualProdigyPool(currentYear);
  }, [currentYear]);

  // Filtered prodigies
  const filteredProdigies = useMemo(() => {
    if (selectedRoleFilter === 'ALL') return prodigiesPool;
    return prodigiesPool.filter(p => p.role === selectedRoleFilter);
  }, [prodigiesPool, selectedRoleFilter]);

  if (!isOpen) return null;

  // Toggle protection on a player
  const handleToggleProtect = (playerId: string) => {
    soundEngine.playClick();
    setSelectedProtectedIds(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, playerId];
    });
  };

  // Confirm protection step
  const handleConfirmProtections = () => {
    if (selectedProtectedIds.length !== 3) return;
    soundEngine.playDraftLock();
    setStep(2);
  };

  // Draft a solo queue prodigy
  const handleDraftProdigy = (prodigy: SoloQueueProdigy) => {
    soundEngine.playDraftLock();
    setSelectedProdigy(prodigy);
  };

  // Finalize drafting
  const handleFinalizeDraft = () => {
    if (!selectedProdigy) return;

    soundEngine.playSuccess();
    const newPlayer = convertProdigyToProPlayer(selectedProdigy);
    const protectedPlayers = dynasty.roster.filter(p => selectedProtectedIds.includes(p.id));
    const subsidy = 60000;
    const fanHypeBonus = 5000;

    let updatedRoster: ProPlayer[];
    let poachedPlayerName: string | undefined;

    // Check if replacing an unprotected player or expanding roster
    if (replaceTargetPlayerId) {
      const replaced = dynasty.roster.find(p => p.id === replaceTargetPlayerId);
      poachedPlayerName = replaced?.name;
      updatedRoster = dynasty.roster.map(p => p.id === replaceTargetPlayerId ? newPlayer : p);
    } else {
      updatedRoster = [...dynasty.roster, newPlayer];
    }

    const historyEntry = {
      id: `draft-hist-${Date.now()}`,
      year: currentYear,
      seasonLabel: `S${currentYear - 2012} 扩军选秀`,
      expansionFranchiseName: expansionTeamName,
      protectedPlayerIds: selectedProtectedIds,
      protectedPlayerNames: protectedPlayers.map(p => p.name),
      draftedProdigy: selectedProdigy,
      poachedPlayerNotice: poachedPlayerName ? `老队员 ${poachedPlayerName} 离队腾出主力席位` : '扩军名单直通主力轮换大名单',
      expansionSubsidyGained: subsidy,
      hypeBonusGained: fanHypeBonus,
      date: new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric' })
    };

    onUpdateDynasty(prev => {
      const nextYear = currentYear + 1;
      const nextExpansionTeam = EXPANSION_FRANCHISE_NAMES[(nextYear - 2026) % EXPANSION_FRANCHISE_NAMES.length];

      return {
        ...prev,
        budget: prev.budget + subsidy,
        fanHype: prev.fanHype + fanHypeBonus,
        roster: updatedRoster,
        expansionDraftState: {
          currentYear: nextYear,
          lastDraftedYear: currentYear,
          expansionFranchiseName: nextExpansionTeam,
          isDraftAvailable: false,
          history: [historyEntry, ...(prev.expansionDraftState?.history || [])]
        }
      };
    });

    setDraftedProdigyResult(selectedProdigy);
    setStep(3);
  };

  const unprotectedPlayers = dynasty.roster.filter(p => !selectedProtectedIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 select-none animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-950 border-2 border-amber-500/50 rounded-2xl sm:rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col max-h-[92vh] overflow-hidden text-slate-100 font-sans">
        
        {/* Top Header */}
        <div className="p-3 sm:p-4 bg-gradient-to-r from-amber-950/70 via-slate-900 to-cyan-950/70 border-b border-amber-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 p-0.5 shadow-md flex items-center justify-center shrink-0">
              <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center text-amber-300">
                <Target className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-tech font-extrabold text-white text-sm sm:text-base tracking-wide">
                  年度联赛扩军选秀与保护大会
                </h3>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-code font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {currentYear} 赛季
                </span>
              </div>
              <p className="text-[10px] text-amber-300/80 font-sans">
                联盟新军加盟 · 豁免保护3名基石核心 · 淘金天梯绝活哥神童
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveSubTab(activeSubTab === 'draft' ? 'history' : 'draft');
              }}
              className={`p-1.5 rounded-lg border text-[10px] font-tech font-bold cursor-pointer transition flex items-center gap-1 ${
                activeSubTab === 'history'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
              title="选秀历史档案"
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">选秀史</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Switch: Draft Flow vs History */}
        {activeSubTab === 'history' ? (
          <div className="p-3 sm:p-4 flex-1 overflow-y-auto space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-tech font-bold text-white flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-amber-400" />
                历届扩军选秀与淘宝签约档案
              </h4>
              <span className="text-[10px] font-code text-slate-400">
                共 {dynasty.expansionDraftState?.history?.length || 0} 届选秀记录
              </span>
            </div>

            {(!dynasty.expansionDraftState?.history || dynasty.expansionDraftState.history.length === 0) ? (
              <div className="p-8 text-center space-y-2 rounded-2xl bg-slate-900/50 border border-slate-800">
                <Target className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
                <p className="text-xs text-slate-400 font-sans">
                  暂无历届扩军选秀档案。完成当前 {currentYear} 赛季扩军选秀后将在此永久铭刻！
                </p>
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveSubTab('draft');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-tech font-bold text-xs cursor-pointer shadow-md inline-block"
                >
                  立即开启当前选秀 →
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {dynasty.expansionDraftState.history.map(item => (
                  <div key={item.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-tech font-bold text-amber-400">{item.seasonLabel}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                          扩军新军: {item.expansionFranchiseName}
                        </span>
                      </div>
                      <span className="text-[9px] font-code text-slate-500">{item.date}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                      <div>
                        <span className="text-slate-400 block mb-0.5">🛡️ 保护三核心:</span>
                        <span className="font-tech text-white font-bold">{item.protectedPlayerNames.join('、')}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">🎯 签约天梯新秀:</span>
                        <span className="font-tech text-cyan-300 font-bold">
                          {item.draftedProdigy.name} ({item.draftedProdigy.role}) · {item.draftedProdigy.alias}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[9px] font-code text-emerald-400">
                      <span>💰 扩军发展金: +${item.expansionSubsidyGained.toLocaleString()}</span>
                      <span className="text-amber-400">🔥 粉丝狂热: +{item.hypeBonusGained}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Step Progress Stepper Bar */}
            <div className="p-2 sm:p-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-1 text-[10px] font-tech font-bold shrink-0">
              <div className={`flex-1 py-1 px-2 rounded-lg text-center flex items-center justify-center gap-1 transition ${
                step === 1 ? 'bg-amber-500 text-slate-950 shadow-sm' : step > 1 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-950 text-slate-500'
              }`}>
                {step > 1 ? <Check className="w-3 h-3" /> : <span>1</span>}
                <span>① 核心保护 (3人)</span>
              </div>

              <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />

              <div className={`flex-1 py-1 px-2 rounded-lg text-center flex items-center justify-center gap-1 transition ${
                step === 2 ? 'bg-amber-500 text-slate-950 shadow-sm' : step > 2 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-950 text-slate-500'
              }`}>
                {step > 2 ? <Check className="w-3 h-3" /> : <span>2</span>}
                <span>② 选拔天梯神童</span>
              </div>

              <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />

              <div className={`flex-1 py-1 px-2 rounded-lg text-center flex items-center justify-center gap-1 transition ${
                step === 3 ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-slate-950 text-slate-500'
              }`}>
                <span>③ 补强通报</span>
              </div>
            </div>

            {/* Step 1: Designate 3 Core Protections */}
            {step === 1 && (
              <div className="p-3 sm:p-4 flex-1 overflow-y-auto space-y-3">
                {/* Strategic Notice Box */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/50 via-slate-900 to-slate-900 border border-amber-500/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-tech font-bold text-amber-400">
                      <Shield className="w-4 h-4 text-amber-400" />
                      <span>第一阶段 · 确定 3 名绝对建队核心</span>
                    </div>
                    <span className="text-xs font-code font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      已保护: {selectedProtectedIds.length} / 3
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
                    新加盟扩军战队 <span className="text-cyan-300 font-bold">[{expansionTeamName}]</span> 正虎视眈眈！请为你阵容中的 <span className="text-amber-400 font-bold">3 位非卖品核心</span> 加戴免选秀保护护盾。受保护队员不可被动摇，未保护队员将作为筹码换取联盟 <span className="text-emerald-400 font-bold">$60,000</span> 扩军扶持金并开启顶级新星特权选秀！
                  </p>
                </div>

                {/* Player Roster Cards with Protect Toggles */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-tech text-slate-400 px-1">
                    <span>点击选手卡片指定豁免保护（必须选满3人）</span>
                    <span className="text-amber-400 font-code font-bold">
                      {3 - selectedProtectedIds.length === 0 ? '✓ 名额已满' : `还需选 ${3 - selectedProtectedIds.length} 人`}
                    </span>
                  </div>

                  {dynasty.roster.map(player => {
                    const isProtected = selectedProtectedIds.includes(player.id);
                    const canSelect = isProtected || selectedProtectedIds.length < 3;
                    const psConf = player.playstyle ? PLAYSTYLE_CONFIG[player.playstyle] : PLAYSTYLE_CONFIG['Aggressive'];

                    return (
                      <div
                        key={player.id}
                        onClick={() => handleToggleProtect(player.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex items-center justify-between gap-2.5 ${
                          isProtected
                            ? 'bg-gradient-to-r from-amber-950/60 to-slate-900 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700 opacity-80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {/* Avatar & Shield Status Indicator */}
                          <div className="relative">
                            <span className="text-2xl block">{player.avatar}</span>
                            {isProtected && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
                                <Shield className="w-2.5 h-2.5 fill-current" />
                              </div>
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-tech font-bold text-white">{player.name}</span>
                              <span className="px-1 py-0.2 rounded text-[9px] font-code font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                                {player.role}
                              </span>
                              <span className={`px-1.5 py-0.2 rounded text-[8px] font-tech font-bold border flex items-center gap-0.5 ${psConf.badgeBg} ${psConf.badgeText} ${psConf.badgeBorder}`}>
                                <span>{psConf.icon}</span>
                                <span>{psConf.label}</span>
                              </span>
                            </div>

                            <div className="text-[10px] text-slate-400 font-sans mt-0.5 flex items-center gap-2">
                              <span>微操: <b className="text-cyan-400 font-code">{player.mechanics}</b></span>
                              <span>大局: <b className="text-purple-400 font-code">{player.macro}</b></span>
                              <span>士气: <b className="text-emerald-400 font-code">{player.morale}%</b></span>
                            </div>
                          </div>
                        </div>

                        {/* Right Toggle Badge */}
                        <div className="shrink-0 text-right">
                          {isProtected ? (
                            <span className="px-2 py-1 rounded-lg bg-amber-500 text-slate-950 text-[10px] font-tech font-black shadow-sm flex items-center gap-1">
                              <Shield className="w-3 h-3 fill-current" />
                              <span>已保护 🛡️</span>
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-lg bg-slate-950 text-slate-400 border border-slate-800 text-[10px] font-tech hover:text-amber-300 transition flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-500/70" />
                              <span>暴露在池</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Action Button for Step 1 */}
                <div className="pt-2">
                  <button
                    disabled={selectedProtectedIds.length !== 3}
                    onClick={handleConfirmProtections}
                    className={`w-full py-3 rounded-xl font-tech font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer shadow-lg chamfer-btn ${
                      selectedProtectedIds.length === 3
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 hover:brightness-110 shadow-amber-500/25 active:scale-98'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    }`}
                  >
                    <span>{selectedProtectedIds.length === 3 ? '锁定 3 人核心名单 · 进入路人王选秀池' : `请先选满 3 名核心 (目前 ${selectedProtectedIds.length}/3)`}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Draft Solo Queue Prodigy */}
            {step === 2 && (
              <div className="p-3 sm:p-4 flex-1 overflow-y-auto space-y-3">
                {/* Header Brief & Back button */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        setStep(1);
                      }}
                      className="text-[10px] font-tech text-slate-400 hover:text-amber-400 flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>← 返回调整保护</span>
                    </button>
                    <span className="text-slate-600">|</span>
                    <span className="text-xs font-tech font-bold text-amber-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      第二阶段 · 天梯绝活哥淘金池
                    </span>
                  </div>

                  <span className="text-[10px] font-tech text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    可免费挑选 1 名直签入队
                  </span>
                </div>

                {/* Position Filter Chips */}
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                  {['ALL', 'TOP', 'JUG', 'MID', 'ADC', 'SUP'].map(pos => (
                    <button
                      key={pos}
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedRoleFilter(pos);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-tech font-bold cursor-pointer transition shrink-0 border ${
                        selectedRoleFilter === pos
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {pos === 'ALL' ? '全部位置' : pos}
                    </button>
                  ))}
                </div>

                {/* Prodigies Candidate Cards */}
                <div className="space-y-2.5">
                  {filteredProdigies.map(prodigy => {
                    const isSelected = selectedProdigy?.id === prodigy.id;
                    const psConf = PLAYSTYLE_CONFIG[prodigy.playstyle];

                    return (
                      <div
                        key={prodigy.id}
                        onClick={() => handleDraftProdigy(prodigy)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer relative overflow-hidden space-y-2 ${
                          isSelected
                            ? 'bg-gradient-to-r from-amber-950/70 via-slate-900 to-indigo-950/70 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-400'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {/* Top Info Bar */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{prodigy.avatar}</span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-tech font-bold text-white text-xs sm:text-sm">
                                  {prodigy.name}
                                </h4>
                                <span className="text-[9px] px-1 py-0.2 rounded bg-purple-950 text-purple-300 font-bold border border-purple-800">
                                  {prodigy.role}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded font-black bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-code">
                                  {prodigy.potential} 级潜力
                                </span>
                              </div>
                              <span className="text-[10px] text-amber-400 font-tech block mt-0.5">
                                {prodigy.alias} · {prodigy.country} ({prodigy.age}岁)
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[9px] text-slate-400 font-code block">天梯排位</span>
                            <span className="text-[10px] text-cyan-300 font-tech font-bold">
                              {prodigy.soloQueueRank}
                            </span>
                          </div>
                        </div>

                        {/* Core Stats and Signature Champion */}
                        <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                          <div>
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-slate-400">微操评分</span>
                              <span className="font-code font-bold text-cyan-400">{prodigy.mechanics} / 99</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${(prodigy.mechanics / 99) * 100}%` }} />
                            </div>

                            <div className="flex items-center justify-between mt-1 mb-0.5">
                              <span className="text-slate-400">大局战术</span>
                              <span className="font-code font-bold text-purple-400">{prodigy.macro} / 99</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-purple-400 rounded-full" style={{ width: `${(prodigy.macro / 99) * 100}%` }} />
                            </div>
                          </div>

                          <div className="flex flex-col justify-between border-l border-slate-800 pl-2">
                            <div>
                              <span className="text-slate-400 block text-[9px]">招牌绝活英雄:</span>
                              <span className="text-amber-300 font-tech font-bold block">{prodigy.signatureChampion}</span>
                              <span className="text-slate-500 text-[8px] font-sans">{prodigy.signatureChampionRole}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <span className={`text-[8px] px-1 py-0.2 rounded border ${psConf.badgeBg} ${psConf.badgeText} ${psConf.badgeBorder}`}>
                                {psConf.icon} {psConf.label}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Special Rookie Trait */}
                        <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-1.5 text-[9px]">
                          <Zap className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-tech font-bold text-amber-300">专属新秀特质【{prodigy.specialTrait.name}】: </span>
                            <span className="text-slate-300">{prodigy.specialTrait.buffLabel}</span>
                          </div>
                        </div>

                        {/* Scout Intel Quote */}
                        <p className="text-[9px] text-slate-400 italic bg-slate-950/40 p-1.5 rounded-lg border border-slate-800/60 font-sans">
                          {prodigy.scoutingIntel}
                        </p>

                        {/* Selection Signifier Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDraftProdigy(prodigy);
                          }}
                          className={`w-full py-1.5 rounded-xl text-[10px] font-tech font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
                              <span>已锁定此新星 · 查看入队补强配置</span>
                            </>
                          ) : (
                            <>
                              <Target className="w-3.5 h-3.5 text-amber-400" />
                              <span>选择此新秀</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* If Prodigy Selected: Roster Integration & Confirmation Panel */}
                {selectedProdigy && (
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-indigo-950/80 border-2 border-amber-400 shadow-xl space-y-2.5 animate-slide-up">
                    <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                      <div className="flex items-center gap-1.5 text-xs font-tech font-extrabold text-amber-300">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span>确认签约：{selectedProdigy.name} ({selectedProdigy.role})</span>
                      </div>
                      <span className="text-[10px] font-code text-emerald-400 font-bold">
                        年薪仅 ${selectedProdigy.contractSalary.toLocaleString()}/周 (性价比新秀约)
                      </span>
                    </div>

                    {/* Roster Slot Management: Expand Roster or Replace an Unprotected Veteran */}
                    <div className="space-y-1.5 text-[10px]">
                      <span className="text-slate-300 font-tech block">
                        大名单席位配置：
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        <button
                          onClick={() => {
                            soundEngine.playClick();
                            setReplaceTargetPlayerId(null);
                          }}
                          className={`p-2 rounded-xl text-left border transition cursor-pointer ${
                            replaceTargetPlayerId === null
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <span className="font-bold block font-tech">直接入队 (扩充阵容轮换)</span>
                          <span className="text-[9px] text-slate-400">保留所有现有选手，作为超级轮换核心</span>
                        </button>

                        {unprotectedPlayers.length > 0 && (
                          <div className="space-y-1">
                            {unprotectedPlayers.map(unprot => (
                              <button
                                key={unprot.id}
                                onClick={() => {
                                  soundEngine.playClick();
                                  setReplaceTargetPlayerId(unprot.id);
                                }}
                                className={`w-full p-2 rounded-xl text-left border transition cursor-pointer ${
                                  replaceTargetPlayerId === unprot.id
                                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                                }`}
                              >
                                <span className="font-bold block font-tech">替换暴露队员: {unprot.name}</span>
                                <span className="text-[9px] text-slate-400">让出主力位置给新秀神童</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Final Draft Button */}
                    <button
                      onClick={handleFinalizeDraft}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-tech font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/30 hover:brightness-110 active:scale-98 transition"
                    >
                      <CheckCircle2 className="w-4 h-4 fill-current" />
                      <span>正式签署扩军选秀协议 · 签约 {selectedProdigy.name}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Celebration & Summary Report */}
            {step === 3 && draftedProdigyResult && (
              <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4 text-center">
                {/* Trophy & Confetti Header */}
                <div className="space-y-1.5 animate-bounce-subtle">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 p-1 shadow-[0_0_30px_rgba(245,158,11,0.5)]">
                    <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-3xl">
                      🎉
                    </div>
                  </div>
                  <h3 className="text-lg font-tech font-black text-amber-300">
                    扩军选秀与保护大会圆满落幕！
                  </h3>
                  <p className="text-xs text-slate-300 font-sans max-w-sm mx-auto">
                    联盟扩军洗牌完成！你不仅保全了战队王朝绝对根基，更成功淘宝签约未来十年的赛场基石！
                  </p>
                </div>

                {/* News Flash Card */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/40 text-left space-y-2.5 shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[10px] font-code font-bold text-amber-400 uppercase">
                      【电竞快讯 · 官方通报】
                    </span>
                    <span className="text-[9px] font-code text-slate-400">
                      {currentYear} 赛季扩军选秀特别号外
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-slate-400 text-[10px] block mb-0.5">🛡️ 核心豁免免拆名单:</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {dynasty.roster.filter(p => selectedProtectedIds.includes(p.id)).map(p => (
                          <span key={p.id} className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-tech font-bold text-[10px]">
                            {p.name} ({p.role})
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-950/50 to-indigo-950/50 border border-cyan-500/40 flex items-center gap-3">
                      <span className="text-3xl">{draftedProdigyResult.avatar}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-tech font-bold text-white text-sm">{draftedProdigyResult.name}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-black font-code">
                            {draftedProdigyResult.potential} 级状元新秀
                          </span>
                        </div>
                        <p className="text-[10px] text-cyan-300 font-tech mt-0.5">
                          {draftedProdigyResult.alias} · 专属特质【{draftedProdigyResult.specialTrait.name}】已激活
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center text-xs font-code">
                      <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                        <span className="text-[9px] text-emerald-400 block font-tech">联盟扩军发展金入账</span>
                        <span className="text-sm font-bold text-emerald-300">+$60,000</span>
                      </div>
                      <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/30">
                        <span className="text-[9px] text-amber-400 block font-tech">全球粉丝狂热度激增</span>
                        <span className="text-sm font-bold text-amber-300">+5,000 HYPE</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Close Button */}
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onClose();
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-tech font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/25 active:scale-98 transition"
                >
                  <Check className="w-4 h-4" />
                  <span>完成扩军并返回俱乐部大厅</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
