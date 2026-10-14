import React, { useState, useMemo } from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  Crosshair, 
  Flame, 
  Shield, 
  Swords, 
  Eye, 
  TrendingUp, 
  Sparkles, 
  Users, 
  Zap, 
  SlidersHorizontal,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { GlobalTeamPowerRanking, PlayerStats, DynastyState, GamePhase } from '../../types/game';
import { soundEngine } from '../../utils/audio';

export interface TeamTacticalClusters {
  mechanics: number;      // 微操压制 (Mechanics)
  macro: number;          // 兵线大局观 (Macro)
  teamfight: number;      // 团战配合 (Teamfight)
  vision: number;         // 视野控图 (Vision)
  adaptability: number;   // 战术韧性 (Adaptability)
}

/**
 * Calculates or retrieves balanced tactical cluster ratings for a global ranking team.
 */
export function getTeamTacticalClusters(team: GlobalTeamPowerRanking): TeamTacticalClusters {
  // Preset tactical archetypes for top global powerhouses
  const archetypeMap: Record<string, TeamTacticalClusters> = {
    t1: { mechanics: 97, macro: 99, teamfight: 98, vision: 96, adaptability: 99 },
    blg: { mechanics: 98, macro: 93, teamfight: 97, vision: 91, adaptability: 94 },
    gen: { mechanics: 95, macro: 99, teamfight: 94, vision: 98, adaptability: 93 },
    tes: { mechanics: 97, macro: 91, teamfight: 93, vision: 89, adaptability: 90 },
    jdg: { mechanics: 94, macro: 94, teamfight: 97, vision: 93, adaptability: 92 },
    hle: { mechanics: 96, macro: 92, teamfight: 95, vision: 91, adaptability: 91 },
    wbg: { mechanics: 93, macro: 92, teamfight: 95, vision: 90, adaptability: 95 },
    g2: { mechanics: 92, macro: 94, teamfight: 91, vision: 90, adaptability: 97 },
    lng: { mechanics: 93, macro: 93, teamfight: 93, vision: 92, adaptability: 90 },
    dk: { mechanics: 95, macro: 89, teamfight: 92, vision: 88, adaptability: 88 },
    nip: { mechanics: 91, macro: 88, teamfight: 90, vision: 87, adaptability: 89 },
    fnc: { mechanics: 90, macro: 89, teamfight: 91, vision: 88, adaptability: 90 },
    fly: { mechanics: 89, macro: 89, teamfight: 90, vision: 87, adaptability: 91 },
    tl: { mechanics: 88, macro: 90, teamfight: 88, vision: 89, adaptability: 89 },
    kt: { mechanics: 92, macro: 87, teamfight: 91, vision: 87, adaptability: 92 },
    fpx: { mechanics: 89, macro: 86, teamfight: 89, vision: 86, adaptability: 87 },
    al: { mechanics: 88, macro: 87, teamfight: 88, vision: 85, adaptability: 88 },
    bds: { mechanics: 86, macro: 87, teamfight: 87, vision: 86, adaptability: 86 },
    c9: { mechanics: 88, macro: 85, teamfight: 87, vision: 85, adaptability: 86 },
    mfx: { mechanics: 85, macro: 85, teamfight: 86, vision: 84, adaptability: 85 }
  };

  if (archetypeMap[team.teamId]) {
    return archetypeMap[team.teamId];
  }

  // Fallback calculation derived from team metrics and roster
  const rosterAvg = team.roster && team.roster.length > 0
    ? team.roster.reduce((sum, r) => sum + r.rating, 0) / team.roster.length
    : team.powerRating;

  const mechanics = Math.min(99, Math.max(65, Math.round(rosterAvg * 0.98)));
  const macro = Math.min(99, Math.max(65, Math.round(team.consistencyScore * 0.95 + 4)));
  const teamfight = Math.min(99, Math.max(65, Math.round(team.powerRating * 0.7 + (team.winRate * 0.3))));
  const vision = Math.min(99, Math.max(65, Math.round(team.consistencyScore * 0.9 + 5)));
  const adaptability = Math.min(99, Math.max(65, Math.round(team.powerRating * 0.93)));

  return { mechanics, macro, teamfight, vision, adaptability };
}

/**
 * Calculates user team's current tactical stats
 */
export function getUserTeamTacticalClusters(
  playerStats?: PlayerStats,
  dynastyState?: DynastyState,
  currentPhase: GamePhase = 2
): TeamTacticalClusters {
  if (currentPhase === 3 && dynastyState && dynastyState.roster.length > 0) {
    const avgMech = Math.round(
      dynastyState.roster.reduce((sum, p) => sum + p.mechanics, 0) / dynastyState.roster.length
    );
    const avgMacro = Math.round(
      dynastyState.roster.reduce((sum, p) => sum + p.macro, 0) / dynastyState.roster.length
    );
    const avgTf = Math.round((avgMech + avgMacro) / 2 + (dynastyState.reputation > 50 ? 3 : 0));
    const vision = Math.min(99, Math.max(60, Math.round(avgMacro * 0.95 + 4)));
    const adaptability = Math.min(99, Math.max(60, Math.round((avgMech * 0.4) + (avgMacro * 0.6) + 2)));

    return {
      mechanics: Math.min(99, Math.max(50, avgMech)),
      macro: Math.min(99, Math.max(50, avgMacro)),
      teamfight: Math.min(99, Math.max(50, avgTf)),
      vision,
      adaptability
    };
  }

  // Phase 1 or 2 player stats
  const mech = playerStats ? playerStats.mechanics : 75;
  const mac = playerStats ? (playerStats.tacticalInsight ?? Math.round((playerStats.mechanics * 0.7) + (playerStats.mental * 0.3))) : 70;
  const mental = playerStats ? playerStats.mental : 70;
  const tf = Math.round((mech * 0.55) + (mental * 0.45));
  const vis = Math.round(mac * 0.85 + 10);
  const adapt = Math.round((mech + mental) / 2);

  return {
    mechanics: Math.min(99, Math.max(50, mech)),
    macro: Math.min(99, Math.max(50, mac)),
    teamfight: Math.min(99, Math.max(50, tf)),
    vision: Math.min(99, Math.max(50, vis)),
    adaptability: Math.min(99, Math.max(50, adapt))
  };
}

// Global baseline average of top 20 teams
const GLOBAL_LEAGUE_AVERAGE: TeamTacticalClusters = {
  mechanics: 91,
  macro: 90,
  teamfight: 91,
  vision: 89,
  adaptability: 90
};

interface ScoutIntelHeatmapProps {
  team: GlobalTeamPowerRanking;
  playerStats?: PlayerStats;
  dynastyState?: DynastyState;
  currentPhase?: GamePhase;
  allTeams?: GlobalTeamPowerRanking[];
  isScouted?: boolean;
  onScoutTeam?: () => void;
  compact?: boolean;
}

export const ScoutIntelHeatmap: React.FC<ScoutIntelHeatmapProps> = ({
  team,
  playerStats,
  dynastyState,
  currentPhase = 2,
  allTeams = [],
  isScouted = false,
  onScoutTeam,
  compact = false
}) => {
  // Comparison modes:
  // 'SELF' = vs Player's Own Team (我方战队)
  // 'LEAGUE' = vs League Average (全球TOP20基准均值)
  // 'RIVAL' = vs Selected Rival Team (指定宿敌豪门)
  const [compareMode, setCompareMode] = useState<'SELF' | 'LEAGUE' | 'RIVAL'>('SELF');
  const [selectedRivalId, setSelectedRivalId] = useState<string>('t1');
  const [hoveredClusterKey, setHoveredClusterKey] = useState<string | null>(null);

  // Compute cluster numbers
  const targetClusters = useMemo(() => getTeamTacticalClusters(team), [team]);
  const userClusters = useMemo(() => getUserTeamTacticalClusters(playerStats, dynastyState, currentPhase), [playerStats, dynastyState, currentPhase]);
  
  const rivalTeam = useMemo(() => {
    return allTeams.find(t => t.teamId === selectedRivalId) || allTeams[0] || team;
  }, [allTeams, selectedRivalId, team]);

  const rivalClusters = useMemo(() => {
    return getTeamTacticalClusters(rivalTeam);
  }, [rivalTeam]);

  // Active comparative benchmark
  const comparisonData = useMemo(() => {
    if (compareMode === 'SELF') {
      return {
        label: currentPhase === 3 ? '我方王朝豪门战队' : '你方俱乐部',
        clusters: userClusters,
        color: '#10b981', // emerald
        strokeColor: '#34d399'
      };
    }
    if (compareMode === 'LEAGUE') {
      return {
        label: '全球赛区均值基线',
        clusters: GLOBAL_LEAGUE_AVERAGE,
        color: '#38bdf8', // sky blue
        strokeColor: '#0ea5e9'
      };
    }
    return {
      label: `${rivalTeam.shortName} (${rivalTeam.region})`,
      clusters: rivalClusters,
      color: '#ec4899', // pink/rose
      strokeColor: '#f43f5e'
    };
  }, [compareMode, currentPhase, dynastyState, userClusters, rivalTeam, rivalClusters]);

  // Format Radar data for Recharts
  const radarChartData = useMemo(() => {
    const dimensions = [
      { key: 'mechanics', name: '微操对线', fullMark: 100 },
      { key: 'macro', name: '兵线大局', fullMark: 100 },
      { key: 'teamfight', name: '团战集火', fullMark: 100 },
      { key: 'vision', name: '视野控图', fullMark: 100 },
      { key: 'adaptability', name: '战术韧性', fullMark: 100 }
    ];

    return dimensions.map(d => {
      const k = d.key as keyof TeamTacticalClusters;
      return {
        dimension: d.name,
        key: d.key,
        targetValue: targetClusters[k],
        compareValue: comparisonData.clusters[k],
        fullMark: d.fullMark
      };
    });
  }, [targetClusters, comparisonData]);

  // Heatmap Color Staging helper
  const getHeatmapColorClass = (score: number) => {
    if (score >= 96) return 'bg-rose-500/25 border-rose-500/60 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]'; // Tier S+ Hotspot
    if (score >= 92) return 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.2)]'; // Tier S
    if (score >= 88) return 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'; // Tier A+
    if (score >= 80) return 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'; // Tier A
    return 'bg-slate-800 border-slate-700 text-slate-300';
  };

  const getHeatmapTag = (score: number) => {
    if (score >= 96) return 'S+ 统治';
    if (score >= 92) return 'S 巅峰';
    if (score >= 88) return 'A+ 强项';
    if (score >= 80) return 'A 均衡';
    return 'B 突破口';
  };

  // Delta insight evaluation
  const clusterDeltas = useMemo(() => {
    const diffs = {
      mechanics: targetClusters.mechanics - comparisonData.clusters.mechanics,
      macro: targetClusters.macro - comparisonData.clusters.macro,
      teamfight: targetClusters.teamfight - comparisonData.clusters.teamfight,
      vision: targetClusters.vision - comparisonData.clusters.vision,
      adaptability: targetClusters.adaptability - comparisonData.clusters.adaptability
    };

    // Find biggest advantage and biggest weakness
    const sorted = Object.entries(diffs).sort((a, b) => b[1] - a[1]);
    const maxAdvantage = sorted[0];
    const maxWeakness = sorted[sorted.length - 1];

    const labelMap: Record<string, string> = {
      mechanics: '微操对线',
      macro: '兵线大局',
      teamfight: '团战集火',
      vision: '视野控图',
      adaptability: '战术韧性'
    };

    return {
      diffs,
      advantage: { name: labelMap[maxAdvantage[0]], diff: maxAdvantage[1] },
      weakness: { name: labelMap[maxWeakness[0]], diff: maxWeakness[1] }
    };
  }, [targetClusters, comparisonData]);

  return (
    <div className="rounded-xl bg-[#080d16] border border-cyan-500/30 p-3 sm:p-4 space-y-3.5 select-none shadow-md">
      
      {/* Component Title & Comparative Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/20 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-400 shadow-sm">
            <Crosshair className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs sm:text-sm font-black font-tech text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-[#00f0ff] to-amber-300">
                战术情报热力雷达 (Scout Intel Heatmap)
              </h4>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold font-mono">
                Recharts Radar
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans">
              五维实力聚类透视 · 微操/大局/团战对标 · 探寻破阵反制先机
            </p>
          </div>
        </div>

        {/* Comparison Target Switcher Pills */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => {
              soundEngine.playClick();
              setCompareMode('SELF');
            }}
            className={`px-2 py-0.5 rounded text-[10px] font-tech font-bold transition cursor-pointer ${
              compareMode === 'SELF'
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            VS 我方战队
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setCompareMode('LEAGUE');
            }}
            className={`px-2 py-0.5 rounded text-[10px] font-tech font-bold transition cursor-pointer ${
              compareMode === 'LEAGUE'
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            VS 全球均值
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setCompareMode('RIVAL');
            }}
            className={`px-2 py-0.5 rounded text-[10px] font-tech font-bold transition cursor-pointer ${
              compareMode === 'RIVAL'
                ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            VS 豪门宿敌
          </button>
        </div>
      </div>

      {/* When RIVAL mode is active, show rival selection dropdown */}
      {compareMode === 'RIVAL' && allTeams.length > 0 && (
        <div className="p-2 rounded-lg bg-slate-950/90 border border-rose-500/30 flex items-center justify-between text-xs font-tech animate-fade-in">
          <span className="text-slate-300 flex items-center gap-1.5">
            <Swords className="w-3.5 h-3.5 text-rose-400" />
            <span>选择对比标杆宿敌:</span>
          </span>
          <select
            value={selectedRivalId}
            onChange={(e) => {
              soundEngine.playClick();
              setSelectedRivalId(e.target.value);
            }}
            className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-rose-300 text-xs font-tech font-bold outline-none cursor-pointer"
          >
            {allTeams.map(t => (
              <option key={t.teamId} value={t.teamId} disabled={t.teamId === team.teamId}>
                #{t.rank} {t.teamName} ({t.region}) - PWR {t.powerRating}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Main Grid: Radar Chart on Left / Center + Heatmap Cluster Matrix on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        
        {/* Radar Chart (Recharts) */}
        <div className="md:col-span-7 h-56 sm:h-64 relative bg-[#060a12] rounded-xl border border-slate-800/80 p-1 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarChartData}>
              <PolarGrid stroke="#1e293b" strokeDasharray="3 3" />
              <PolarAngleAxis 
                dataKey="dimension" 
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} 
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[50, 100]} 
                tick={{ fill: '#475569', fontSize: 9 }} 
                stroke="#1e293b"
              />
              
              {/* Target Team Radar (Cyan / Amber Gold) */}
              <Radar
                name={`${team.shortName} (目标战队)`}
                dataKey="targetValue"
                stroke="#00f0ff"
                fill="#00f0ff"
                fillOpacity={0.4}
                strokeWidth={2}
              />

              {/* Comparative Benchmark Radar */}
              <Radar
                name={comparisonData.label}
                dataKey="compareValue"
                stroke={comparisonData.strokeColor}
                fill={comparisonData.color}
                fillOpacity={0.25}
                strokeWidth={2}
                strokeDasharray="4 2"
              />

              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const diff = data.targetValue - data.compareValue;
                    return (
                      <div className="p-2 rounded-lg bg-slate-950/95 border border-cyan-500/60 shadow-xl text-xs space-y-1 font-tech">
                        <div className="font-bold text-cyan-300 flex items-center gap-1">
                          <Crosshair className="w-3 h-3" />
                          <span>{data.dimension} 实力对比</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-slate-300">
                          <span className="text-[#00f0ff] font-bold">{team.shortName}:</span>
                          <span className="font-mono font-black">{data.targetValue} 分</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-slate-300">
                          <span style={{ color: comparisonData.strokeColor }} className="font-bold">
                            {comparisonData.label}:
                          </span>
                          <span className="font-mono font-black">{data.compareValue} 分</span>
                        </div>
                        <div className="pt-1 border-t border-slate-800 text-[10px] flex items-center justify-between">
                          <span className="text-slate-400">差值净胜:</span>
                          <span className={`font-mono font-bold ${
                            diff > 0 ? 'text-cyan-400' : diff < 0 ? 'text-rose-400' : 'text-slate-400'
                          }`}>
                            {diff > 0 ? `+${diff}` : diff} 分
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }}
                iconSize={8}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Heatmap Strength Cluster Matrix */}
        <div className="md:col-span-5 space-y-2">
          <div className="text-[11px] font-tech font-bold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1 text-cyan-400">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              实力聚类热力评分 (Strength Clusters)
            </span>
            <span className="text-[9px] text-slate-400 font-mono">满分 100</span>
          </div>

          <div className="space-y-1.5">
            {[
              {
                key: 'mechanics',
                title: '微操对线 (Mechanics)',
                desc: '个人操作上限、压制力与击杀爆发',
                score: targetClusters.mechanics,
                comp: comparisonData.clusters.mechanics
              },
              {
                key: 'macro',
                title: '兵线大局 (Macro)',
                desc: '兵线运营转线、分推调配与控龙纪律',
                score: targetClusters.macro,
                comp: comparisonData.clusters.macro
              },
              {
                key: 'teamfight',
                title: '团战集火 (Teamfight)',
                desc: '5v5集火协同、阵型撕扯与绝境翻盘',
                score: targetClusters.teamfight,
                comp: comparisonData.clusters.teamfight
              },
              {
                key: 'vision',
                title: '视野控图 (Vision)',
                desc: '战争迷雾点亮、龙坑排眼与野区反隐',
                score: targetClusters.vision,
                comp: comparisonData.clusters.vision
              },
              {
                key: 'adaptability',
                title: '战术韧性 (Adaptability)',
                desc: 'BP应变阵容深度、逆风翻盘心理韧度',
                score: targetClusters.adaptability,
                comp: comparisonData.clusters.adaptability
              }
            ].map(item => {
              const diff = item.score - item.comp;
              return (
                <div
                  key={item.key}
                  onMouseEnter={() => setHoveredClusterKey(item.key)}
                  onMouseLeave={() => setHoveredClusterKey(null)}
                  className={`p-2 rounded-lg border transition-all ${getHeatmapColorClass(item.score)} ${
                    hoveredClusterKey === item.key ? 'scale-[1.01]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-tech font-bold flex items-center gap-1.5">
                      <span>{item.title}</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-black/40 border border-white/10 font-mono font-bold">
                        {getHeatmapTag(item.score)}
                      </span>
                    </span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-sm font-black">{item.score}</span>
                      <span className={`text-[10px] font-bold ${
                        diff > 0 ? 'text-cyan-300' : diff < 0 ? 'text-rose-400' : 'text-slate-400'
                      }`}>
                        ({diff > 0 ? `+${diff}` : diff})
                      </span>
                    </div>
                  </div>
                  <div className="text-[9px] text-slate-300/80 font-sans mt-0.5 truncate">
                    {item.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Comparative Scouting Tactical Deduction Dossier */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-slate-950 via-[#0a101d] to-slate-950 border border-cyan-500/25 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-tech font-bold text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>智能对比侦察简报 (Comparative Scouting Deduction)</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            基准: {comparisonData.label}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-sans">
          {/* Opponent Key Strength */}
          <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-200">
            <div className="font-bold flex items-center gap-1 text-rose-300 text-xs font-tech">
              <AlertTriangle className="w-3 h-3" />
              <span>敌方绝对优势聚类</span>
            </div>
            <p className="mt-1 leading-relaxed text-[10px] text-slate-300">
              【{clusterDeltas.advantage.name}】高出对比基准 <strong className="text-rose-400 font-mono">+{clusterDeltas.advantage.diff} 分</strong>。
              面对该队切忌盲目硬拼其强项，需通过针对性 BP 封锁其核心招牌英雄！
            </p>
          </div>

          {/* Opponent Critical Weakness / Exploit Window */}
          <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-200">
            <div className="font-bold flex items-center gap-1 text-emerald-300 text-xs font-tech">
              <CheckCircle2 className="w-3 h-3" />
              <span>克制突破窗口 (战术破绽)</span>
            </div>
            <p className="mt-1 leading-relaxed text-[10px] text-slate-300">
              【{clusterDeltas.weakness.name}】相对最弱 (差值 <strong className="text-emerald-400 font-mono">{clusterDeltas.weakness.diff} 分</strong>)。
              建议在实战中集结战术兵力撕扯其{clusterDeltas.weakness.name}盲区，扩大雪球优势！
            </p>
          </div>
        </div>

        {/* Tactical Scout Boost Notice */}
        {!isScouted && onScoutTeam && (
          <div className="pt-1 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">
              未解锁胜率加成？点击右侧解锁对该队伍的深度刺探分析。
            </span>
            <button
              onClick={() => {
                soundEngine.playLevelUp();
                onScoutTeam();
              }}
              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-[10px] font-tech font-extrabold cursor-pointer transition shadow hover:scale-102 flex items-center gap-1"
            >
              <Eye className="w-3 h-3" />
              <span>刺探该战队核心破绽 (+8% 胜率)</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
