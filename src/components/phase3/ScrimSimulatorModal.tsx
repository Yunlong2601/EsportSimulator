import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  ShieldAlert, 
  CheckCircle2, 
  Swords, 
  Trophy, 
  AlertTriangle, 
  Sparkles, 
  Users, 
  ArrowRight, 
  TrendingUp,
  X,
  Dumbbell,
  BarChart2,
  FileText,
  Activity
} from 'lucide-react';
import { DynastyState } from '../../types/game';
import { GLOBAL_POWER_RANKINGS_TEAMS } from '../../data/globalPowerRankingsData';
import { soundEngine } from '../../utils/audio';

interface ScrimSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  dynasty: DynastyState;
  onUpdateDynasty: React.Dispatch<React.SetStateAction<DynastyState>>;
  onOpenTrainingCamp?: () => void;
  onAddLog?: (msg: string, type: 'win' | 'loss' | 'event' | 'gear') => void;
}

export const ScrimSimulatorModal: React.FC<ScrimSimulatorModalProps> = ({
  isOpen,
  onClose,
  dynasty,
  onUpdateDynasty,
  onOpenTrainingCamp,
  onAddLog
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>('t1');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Top tier opponent teams from Global Power Rankings
  const topTeams = GLOBAL_POWER_RANKINGS_TEAMS.slice(0, 10);
  const selectedTeam = topTeams.find(t => t.teamId === selectedTeamId) || topTeams[0];

  const scrimReports = dynasty.scrimReports || [];
  const activeReport = scrimReports.find(r => r.id === activeReportId) || scrimReports[0];

  const scrimFee = 15000;
  const canAfford = dynasty.budget >= scrimFee;

  // Schedule a 3-hour practice scrim session against the selected top tier team
  const handleScheduleScrim = () => {
    if (!canAfford || isSimulating) return;
    soundEngine.playClick();
    setIsSimulating(true);

    setTimeout(() => {
      // Simulate outcome
      const userRating = Math.round(
        dynasty.roster.reduce((a, b) => a + (b.mechanics + b.macro) / 2, 0) / (dynasty.roster.length || 1)
      );
      const enemyRating = selectedTeam.powerRating;
      const winProb = Math.max(0.15, Math.min(0.85, 0.5 + (userRating - enemyRating) * 0.03));
      
      const teamWon = Math.random() < winProb;
      const score = teamWon ? '2 - 1' : '1 - 2';

      // Generate coordination score
      const coordinationScore = Math.max(50, Math.min(96, Math.round(userRating - (teamWon ? 2 : 12) + (Math.random() * 8 - 4))));

      // Specific teamfight weaknesses based on enemy playstyle
      const weaknesses = [
        {
          weakness: '大龙坑进场拉扯与双C站位脱节',
          category: 'macro' as const,
          analysis: `在面对 ${selectedTeam.teamName} 的高压推线与野区包夹时，队伍在20-25分钟大龙团战视野争夺中沟通脱节，辅助开团瞬间双C距离过远，被对手切割包夹。`,
          actionItem: '大局观兵线与视野运营研讨 (Macro)',
          stat: 'macro' as const
        },
        {
          weakness: '逆风防守反击与越塔止损迟钝',
          category: 'morale' as const,
          analysis: `在前15分钟遭遇 ${selectedTeam.shortName} 强势野辅联动越塔时，中野未能在第一时间形成协防换线，导致团队士气受挫出现急躁冒进送头现象。`,
          actionItem: '心理韧性与逆风抗压心理疏导 (Morale)',
          stat: 'morale' as const
        },
        {
          weakness: '关键C位技能躲避与第一波爆发爆发预判失误',
          category: 'mechanics' as const,
          analysis: `正面 5v5 团战交火中，主C选手未能及时闪现规避对手核心开团大招，导致首波技能真空期被融化。急需强化反应闪现预判与极限微操。`,
          actionItem: '极限微操与对线压制淬炼 (Mechanics)',
          stat: 'mechanics' as const
        }
      ];

      const selectedWeakness = weaknesses[Math.floor(Math.random() * weaknesses.length)];

      const newReport = {
        id: `scrim-${Date.now()}`,
        targetTeamId: selectedTeam.teamId,
        targetTeamName: selectedTeam.teamName,
        targetTeamLogo: selectedTeam.logoEmoji,
        scheduledAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        durationHours: 3,
        score,
        teamfightCoordinationScore: coordinationScore,
        primaryWeakness: selectedWeakness.weakness,
        weaknessCategory: selectedWeakness.category,
        detailedWeaknessAnalysis: selectedWeakness.analysis,
        trainingCampActionItem: selectedWeakness.actionItem,
        recommendedStatToTrain: selectedWeakness.stat,
        addressedInTrainingCamp: false
      };

      onUpdateDynasty(prev => ({
        ...prev,
        budget: prev.budget - scrimFee,
        scrimReports: [newReport, ...(prev.scrimReports || []).slice(0, 9)]
      }));

      setActiveReportId(newReport.id);
      setIsSimulating(false);

      if (teamWon) {
        soundEngine.playVictory();
      } else {
        soundEngine.playDefeat();
      }

      if (onAddLog) {
        onAddLog(`⚔️【训练赛热身完毕】与全球豪门 [${selectedTeam.teamName}] 完成 3 小时高强度训练赛 (${score})！已生成团战协同漏洞深度报告！`, teamWon ? 'win' : 'event');
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-[#0b0f19] border-2 border-indigo-500/50 rounded-2xl shadow-[0_0_60px_rgba(99,102,241,0.25)] overflow-hidden text-slate-100">
        
        {/* Top Header */}
        <div className="p-3 sm:p-4 border-b border-indigo-500/20 bg-[#101424] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center text-indigo-400 shadow-sm">
              <Swords className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black font-tech text-indigo-300">
                  顶级豪门训练赛模拟终端 (Scrim Simulator)
                </h3>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold font-mono">
                  3小时高压对抗
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans">
                邀约全球战力榜顶级强队约战 · 诊断团战协同短板 · 针对性直通「王朝特训营」补强
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Opponent Selection Strip */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-tech">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                挑选训练赛约战强队 (全球实力榜 Top 10)
              </span>
              <span className="text-slate-400">
                约战组织费: <span className="text-emerald-400 font-code font-bold">${scrimFee.toLocaleString()}</span>
              </span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {topTeams.map(team => (
                <button
                  key={team.teamId}
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedTeamId(team.teamId);
                  }}
                  className={`p-2.5 rounded-xl border text-left min-w-[130px] transition cursor-pointer shrink-0 ${
                    selectedTeamId === team.teamId
                      ? 'bg-indigo-500/20 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">{team.logoEmoji}</span>
                    <span className="text-[10px] font-code font-bold text-amber-400">
                      #{team.rank}
                    </span>
                  </div>
                  <div className="text-xs font-bold font-tech mt-1 truncate">
                    {team.shortName}
                  </div>
                  <div className="text-[10px] font-code text-cyan-300">
                    PWR {team.powerRating}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Team Profile & Schedule Button */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedTeam.logoEmoji}</span>
                <span className="text-sm font-black font-tech text-white">{selectedTeam.teamName}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-code font-bold">
                  {selectedTeam.region} · 胜率 {selectedTeam.winRate}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                <span className="text-indigo-300">战术风格: </span>{selectedTeam.playstyle}
              </p>
            </div>

            <button
              disabled={!canAfford || isSimulating}
              onClick={handleScheduleScrim}
              className={`py-2.5 px-5 rounded-xl font-tech font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
                isSimulating
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : canAfford
                    ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 shadow-md shadow-indigo-500/20 active:scale-98'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{isSimulating ? '3小时对抗模拟中...' : `预约 3小时 训练赛 ($${scrimFee.toLocaleString()})`}</span>
            </button>
          </div>

          {/* Scrim Weakness Reports Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-tech">
              <span className="text-white font-bold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                历史约战团战协同诊断报告 ({scrimReports.length} 份)
              </span>
              <span className="text-[10px] text-slate-400">
                点击查看薄弱环节并一键直达特训
              </span>
            </div>

            {scrimReports.length === 0 ? (
              <div className="p-8 rounded-xl bg-slate-950/60 border border-slate-900 text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-xl bg-slate-900 flex items-center justify-center text-slate-600">
                  <BarChart2 className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-slate-400 font-tech">
                  暂无训练赛复盘报告
                </div>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  点击上方按钮与 TOP10 顶级战队预约 3 小时高强度训练赛，系统将深度扫描战队协同短板！
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Active Detailed Report */}
                {activeReport && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border-2 border-indigo-500/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{activeReport.targetTeamLogo}</span>
                        <span className="text-xs font-bold font-tech text-white">
                          对阵 {activeReport.targetTeamName} 训练复盘
                        </span>
                        <span className="text-[10px] font-code px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                          比分 {activeReport.score}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">协同评分</span>
                        <span className={`text-xs font-black font-code ${
                          activeReport.teamfightCoordinationScore >= 80 ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {activeReport.teamfightCoordinationScore} / 100
                        </span>
                      </div>
                    </div>

                    {/* Identified Weakness Box */}
                    <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300 font-tech">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                        <span>核心团战协同暴露短板: {activeReport.primaryWeakness}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                        {activeReport.detailedWeaknessAnalysis}
                      </p>
                    </div>

                    {/* Action Item & Jump to Training Camp */}
                    <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Dumbbell className="w-4 h-4 text-cyan-400" />
                        <div>
                          <div className="text-[11px] font-bold text-white font-tech">
                            特训营建议补强项: {activeReport.trainingCampActionItem}
                          </div>
                          <span className="text-[10px] text-cyan-300 font-sans">
                            针对性演练可显著修复此漏洞，防止大赛关键团被爆破
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          onClose();
                          if (onOpenTrainingCamp) {
                            onOpenTrainingCamp();
                          }
                        }}
                        className="py-1.5 px-3 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-tech font-black text-xs flex items-center gap-1 transition cursor-pointer shrink-0 shadow-sm"
                      >
                        <span>前往特训营加练</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* History list selector */}
                {scrimReports.length > 1 && (
                  <div className="space-y-1 pt-1">
                    <div className="text-[10px] text-slate-400 font-tech uppercase">
                      查看更早的训练赛复盘 ({scrimReports.length} 局记录)
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {scrimReports.map(rep => (
                        <button
                          key={rep.id}
                          onClick={() => {
                            soundEngine.playClick();
                            setActiveReportId(rep.id);
                          }}
                          className={`p-2 rounded-lg border text-left text-xs font-tech transition cursor-pointer truncate flex items-center justify-between ${
                            activeReport?.id === rep.id
                              ? 'bg-indigo-500/20 border-indigo-500 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span className="truncate">{rep.targetTeamLogo} {rep.targetTeamName}</span>
                          <span className="text-[10px] font-code text-cyan-400 shrink-0 ml-1">{rep.score}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
