import React, { useState } from 'react';
import { 
  Crosshair, 
  Search, 
  ShieldAlert, 
  Sparkles, 
  UserCheck, 
  Zap, 
  Brain, 
  Flame, 
  CheckCircle2, 
  X, 
  AlertTriangle, 
  BarChart3, 
  Eye, 
  ChevronRight, 
  Trophy, 
  DollarSign,
  Briefcase
} from 'lucide-react';
import { 
  DynastyState, 
  OpponentScoutingReport, 
  Coach 
} from '../../types/game';
import { OpponentTeam } from '../../data/dynastyData';
import { 
  generateOpponentScoutingReport, 
  SCOUTING_ANALYSIS_COST,
  OPPONENT_DRAFT_PRESETS 
} from '../../data/opponentScoutingData';
import { AVAILABLE_COACHES, SPECIALIZATION_CONFIG } from '../../data/coachingStaffData';
import { soundEngine } from '../../utils/audio';

interface OpponentScoutingReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dynasty: DynastyState;
  onUpdateDynasty: React.Dispatch<React.SetStateAction<DynastyState>>;
  targetOpponent: OpponentTeam;
}

export const OpponentScoutingReportModal: React.FC<OpponentScoutingReportModalProps> = ({
  isOpen,
  onClose,
  dynasty,
  onUpdateDynasty,
  targetOpponent
}) => {
  const existingReport = dynasty.opponentScoutingReports?.[targetOpponent.id];
  
  // Available hired coaches
  const hiredCoachesList: Coach[] = Object.values(dynasty.coachingStaff?.hiredCoaches || {}).filter((c): c is Coach => Boolean(c));
  
  // Fallback default coach if none hired yet
  const defaultCoach: Coach = hiredCoachesList[0] || AVAILABLE_COACHES[0];
  const [selectedCoachId, setSelectedCoachId] = useState<string>(defaultCoach.id);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedCoach = hiredCoachesList.find(c => c.id === selectedCoachId) || defaultCoach;
  const canAfford = dynasty.budget >= SCOUTING_ANALYSIS_COST;

  // Execute coach assignment & deep-dive analysis
  const handleAssignCoachAnalysis = () => {
    if (!canAfford) {
      soundEngine.playDefeat();
      setActionNotice('⚠️ 俱乐部预算不足 $5,000，无法划拨战术沙盘侦察专项经费！');
      return;
    }

    soundEngine.playDraftLock();

    const report = generateOpponentScoutingReport(targetOpponent, selectedCoach);

    onUpdateDynasty(prev => ({
      ...prev,
      budget: prev.budget - SCOUTING_ANALYSIS_COST,
      fanHype: prev.fanHype + 1200,
      opponentScoutingReports: {
        ...(prev.opponentScoutingReports || {}),
        [targetOpponent.id]: report
      }
    }));

    soundEngine.playLevelUp();
    setActionNotice(`🎉【战术侦察完成】教练【${selectedCoach.name}】已成功解析 ${targetOpponent.name} 的 BP 倾向与阵型软肋！`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const report = existingReport;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none overflow-y-auto animate-fade-in font-sans">
      <div className="relative max-w-lg w-full bg-[#0a0f1d] border-2 border-cyan-500/60 rounded-3xl p-4 sm:p-6 shadow-[0_0_60px_rgba(6,182,212,0.25)] my-auto space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5 shadow-md shrink-0">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-cyan-300 text-lg">
                <span>{targetOpponent.logo}</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-tech font-extrabold text-white text-sm sm:text-base tracking-wide">
                  {targetOpponent.name} · 战术侦察研判报告
                </h3>
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold font-code border ${
                  report 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {report ? '已完成深度研判 ✓' : '待指派教练 ❓'}
                </span>
              </div>
              <p className="text-[10px] text-cyan-300/80 font-tech">
                {targetOpponent.region} • 战力评分: {targetOpponent.overallPower} OVR
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice feedback */}
        {actionNotice && (
          <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-400 text-xs font-tech text-cyan-200 animate-slide-up flex items-center gap-2 shadow-md">
            <Sparkles className="w-4 h-4 text-cyan-300 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* --- VIEW 1: REPORT COMPLETED --- */}
        {report ? (
          <div className="space-y-3.5">
            {/* Coach Attribution Banner */}
            <div className="p-2.5 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-slate-900 border border-cyan-500/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{report.assignedCoachAvatar}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[10px]">主讲分析教练:</span>
                    <span className="font-tech font-bold text-white">{report.assignedCoachName}</span>
                    <span className="text-[8px] px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-tech">
                      {SPECIALIZATION_CONFIG[report.assignedCoachSpecialization]?.label || '战术教练'}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-code">完成时间: {report.scoutedAt}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[9px] text-slate-400 block font-tech">克制胜率加成</span>
                <span className="text-xs font-black font-code text-emerald-300">
                  +{Math.round(report.draftTendency.counterWinRateBonus * 100)}% BO5优势
                </span>
              </div>
            </div>

            {/* Core Draft Tendency Showcase */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border-2 border-indigo-500/50 space-y-2.5 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Crosshair className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-[10px] text-slate-400 font-tech block uppercase">核心阵容构建倾向 (Draft Tendency)</span>
                    <h4 className="font-tech font-extrabold text-amber-300 text-xs sm:text-sm">
                      {report.draftTendency.compStyleLabel}
                    </h4>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black font-tech text-[10px]">
                  {report.draftTendency.styleTag}
                </span>
              </div>

              <p className="text-[10px] text-slate-300 font-sans leading-relaxed bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                {report.draftTendency.description}
              </p>

              {/* Tendency Ratings Meter (Engage vs Scaling vs Aggression) */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-tech font-bold text-slate-400 block">
                  大数据战术倾向指数 (Tactical Index Comparison):
                </span>

                <div className="space-y-1.5 text-[9px] font-tech">
                  <div>
                    <div className="flex items-center justify-between text-slate-300 mb-0.5">
                      <span>强开决战偏好 (Heavy Engage Tendency)</span>
                      <span className="font-code font-bold text-amber-400">{report.draftTendency.engageRating}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${report.draftTendency.engageRating}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-slate-300 mb-0.5">
                      <span>大后期大核发育偏好 (Late-Game Scaling)</span>
                      <span className="font-code font-bold text-cyan-400">{report.draftTendency.scalingRating}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${report.draftTendency.scalingRating}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-slate-300 mb-0.5">
                      <span>前期越塔压迫侵略性 (Early Snowball Aggression)</span>
                      <span className="font-code font-bold text-rose-400">{report.draftTendency.earlyAggressionRating}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-400 rounded-full" style={{ width: `${report.draftTendency.earlyAggressionRating}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pick & Ban Preferences */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-[10px] font-tech font-bold text-slate-300 block uppercase">
                BP 选人倾向大数据 (Draft Priorities & Bans)
              </span>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-cyan-400 font-tech font-bold block">一抢首选目标 (First-Picks):</span>
                  {report.draftTendency.firstPickPriorities.map((hero, i) => (
                    <div key={i} className="text-white font-sans truncate">
                      • {hero}
                    </div>
                  ))}
                </div>

                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-rose-400 font-tech font-bold block">核心必 Ban 目标 (Permabans):</span>
                  {report.draftTendency.permaBanTargets.map((hero, i) => (
                    <div key={i} className="text-slate-300 font-sans truncate">
                      • {hero}
                    </div>
                  ))}
                </div>
              </div>

              {/* Comfort picks */}
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-[10px]">
                <span className="text-amber-400 font-tech font-bold block">招牌绝活英雄池 (Comfort Picks):</span>
                <div className="space-y-1">
                  {report.draftTendency.comfortPicks.map((cp, i) => (
                    <div key={i} className="flex items-center justify-between text-[9px] border-b border-slate-800/80 pb-0.5 last:border-none">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1 py-0.2 rounded bg-purple-950 text-purple-300 font-code font-bold">{cp.role}</span>
                        <span className="text-white font-bold">{cp.champion}</span>
                      </div>
                      <span className="text-slate-400 truncate max-w-[170px] text-right">{cp.mastery}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tactical Weakness & Recommended Counter Strategy */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border-2 border-emerald-500/60 space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-400 font-tech font-bold text-xs">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                <span>教练沙盘推演 · 弱点突破口与克制解法</span>
              </div>

              <div className="space-y-1.5 text-[10px]">
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-rose-400 font-bold block font-tech mb-0.5">⚠️ 敌方致命战术软肋:</span>
                  <p className="text-slate-300 font-sans leading-relaxed">{report.draftTendency.draftWeakness}</p>
                </div>

                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-emerald-400 font-bold block font-tech mb-0.5">🎯 推荐破解战术方案:</span>
                  <p className="text-slate-300 font-sans leading-relaxed">{report.draftTendency.counterStrategy}</p>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-300 font-tech font-bold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>实战加成: {report.draftTendency.tacticalCounterBuff}</span>
              </div>
            </div>

            {/* Re-Analyze Button */}
            <button
              onClick={() => {
                soundEngine.playClick();
                handleAssignCoachAnalysis();
              }}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-tech font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700 transition"
            >
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span>重新指派教练更新研判 ($5,000)</span>
            </button>
          </div>
        ) : (
          /* --- VIEW 2: ASSIGN COACH TO SCOUT --- */
          <div className="space-y-3.5">
            {/* Briefing Box */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/50 via-slate-900 to-slate-900 border border-amber-500/40 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-tech font-bold text-amber-400">
                <Search className="w-4 h-4 text-amber-400" />
                <span>赛前深度战术侦察研判 (Pre-Match Tactical Scout)</span>
              </div>
              <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
                指派俱乐部专精教练调取 <span className="text-white font-bold">{targetOpponent.name}</span> 的前 50 场实战录像与训练赛大数据，彻底破解其 <span className="text-amber-400 font-bold">BP 倾向 (强开团 vs 后期大核拖发育)</span>、一抢必选目标与致命阵容漏洞，为下场巅峰对决锁定 <span className="text-emerald-400 font-bold">最高 +15% 战术胜率</span>！
              </p>
            </div>

            {/* Organization Budget Notice */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-400 text-[10px] font-tech">金库当前可用预算:</span>
                <span className="font-code font-bold text-emerald-300">${dynasty.budget.toLocaleString()}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-tech">研判专项经费: </span>
                <span className="font-code font-bold text-amber-300">${SCOUTING_ANALYSIS_COST.toLocaleString()}</span>
              </div>
            </div>

            {/* Select Coach to Assign */}
            <div className="space-y-2">
              <span className="text-xs font-tech font-bold text-slate-300 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                选择执笔研判专精教练 (Assign Lead Coach):
              </span>

              <div className="space-y-1.5">
                {(hiredCoachesList.length > 0 ? hiredCoachesList : [defaultCoach]).map(coach => {
                  const isSelected = selectedCoach.id === coach.id;
                  const specConf = SPECIALIZATION_CONFIG[coach.specialization];

                  return (
                    <div
                      key={coach.id}
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedCoachId(coach.id);
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                        isSelected
                          ? 'bg-gradient-to-r from-cyan-950/70 via-slate-900 to-indigo-950/70 border-cyan-400 shadow-md ring-1 ring-cyan-400'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{coach.avatar}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-tech font-bold text-white text-xs">{coach.name}</span>
                            <span className={`text-[8px] px-1.5 py-0.2 rounded font-bold font-tech border ${specConf.badgeBg} ${specConf.badgeBorder} ${specConf.badgeText}`}>
                              {specConf.icon} {specConf.label}
                            </span>
                            <span className="text-[8px] px-1 rounded bg-slate-800 text-slate-400 font-code">
                              {coach.tier}
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-400 font-sans block mt-0.5 line-clamp-1">
                            "{coach.philosophy}"
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        {isSelected ? (
                          <span className="px-2 py-0.8 rounded-lg bg-cyan-500 text-slate-950 text-[10px] font-tech font-black shadow-sm flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 fill-current" />
                            <span>主讲指派</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-tech hover:text-cyan-300">
                            选择此教练
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Execute Button */}
            <div className="pt-2">
              <button
                disabled={!canAfford}
                onClick={handleAssignCoachAnalysis}
                className={`w-full py-3 rounded-xl font-tech font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer shadow-lg chamfer-btn ${
                  !canAfford
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 text-slate-950 hover:brightness-110 shadow-cyan-500/25 active:scale-98'
                }`}
              >
                <Crosshair className="w-4 h-4" />
                <span>
                  {!canAfford 
                    ? '俱乐部预算不足 $5,000' 
                    : `划拨 $5,000 · 由【${selectedCoach.name}】启动深度战术研判`}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
