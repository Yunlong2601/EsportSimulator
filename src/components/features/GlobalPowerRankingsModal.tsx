import React, { useState, useMemo } from 'react';
import { 
  X, 
  Globe2, 
  Trophy, 
  Flame, 
  Shield, 
  Search, 
  Swords, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  DollarSign, 
  Eye, 
  Sparkles, 
  CheckCircle2, 
  Crosshair, 
  Users, 
  ArrowUpRight,
  UserPlus
} from 'lucide-react';
import { GlobalTeamPowerRanking, TradeTargetPlayer, GamePhase, PlayerStats, DynastyState, TeamRosterMember } from '../../types/game';
import { GLOBAL_POWER_RANKINGS_TEAMS, generateHiddenPotential, getTeamRankTrends } from '../../data/globalPowerRankingsData';
import { soundEngine } from '../../utils/audio';
import { ScoutReportModal } from './ScoutReportModal';
import { RankingTrendsLineGraph } from './RankingTrendsLineGraph';
import { ScoutIntelHeatmap, getTeamTacticalClusters } from './ScoutIntelHeatmap';

interface GlobalPowerRankingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhase: GamePhase;
  playerStats?: PlayerStats;
  dynastyState?: DynastyState;
  onScoutTeam?: (teamId: string) => boolean;
  onDeepScoutPlayer?: (player: TeamRosterMember, team: GlobalTeamPowerRanking) => boolean;
  onTradePlayer?: (target: TradeTargetPlayer) => void;
  onScrimMatch?: (team: GlobalTeamPowerRanking) => void;
}

export const GlobalPowerRankingsModal: React.FC<GlobalPowerRankingsModalProps> = ({
  isOpen,
  onClose,
  currentPhase,
  playerStats,
  dynastyState,
  onScoutTeam,
  onDeepScoutPlayer,
  onTradePlayer,
  onScrimMatch
}) => {
  const [selectedRegion, setSelectedRegion] = useState<'ALL' | 'LCK' | 'LPL' | 'LEC' | 'LCS'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'RANK' | 'PWR' | 'WINRATE' | 'CONSISTENCY'>('RANK');
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>('t1');
  const [scoutedTeams, setScoutedTeams] = useState<Record<string, boolean>>({ t1: true });
  const [scrimModalData, setScrimModalData] = useState<{
    team: GlobalTeamPowerRanking;
    isSimulating: boolean;
    result: { isWin: boolean; logs: string[]; winRate: number } | null;
  } | null>(null);
  const [tradeInquiryTarget, setTradeInquiryTarget] = useState<TradeTargetPlayer | null>(null);
  const [tradeNotice, setTradeNotice] = useState<string | null>(null);
  const [deepScoutedPlayers, setDeepScoutedPlayers] = useState<Record<string, boolean>>({});
  const [selectedScoutReport, setSelectedScoutReport] = useState<{
    player: TeamRosterMember;
    teamName: string;
    teamLogo?: string;
  } | null>(null);
  const [deepScoutNotice, setDeepScoutNotice] = useState<string | null>(null);
  const [modalViewTab, setModalViewTab] = useState<'list' | 'heatmap_hub'>('list');
  const [teamVisualMode, setTeamVisualMode] = useState<Record<string, 'heatmap' | 'trend'>>({});
  const [hubSelectedTeamId, setHubSelectedTeamId] = useState<string>('t1');

  const filteredTeams = useMemo(() => {
    let list = [...GLOBAL_POWER_RANKINGS_TEAMS];

    if (selectedRegion !== 'ALL') {
      list = list.filter(t => t.region === selectedRegion);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(t => 
        t.teamName.toLowerCase().includes(q) ||
        t.shortName.toLowerCase().includes(q) ||
        t.playstyle.toLowerCase().includes(q) ||
        t.roster.some(r => r.name.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'PWR') {
      list.sort((a, b) => b.powerRating - a.powerRating);
    } else if (sortBy === 'WINRATE') {
      list.sort((a, b) => b.winRate - a.winRate);
    } else if (sortBy === 'CONSISTENCY') {
      list.sort((a, b) => b.consistencyScore - a.consistencyScore);
    } else {
      list.sort((a, b) => a.rank - b.rank);
    }

    return list;
  }, [selectedRegion, searchQuery, sortBy]);

  if (!isOpen) return null;

  // Handle tactical scout
  const handleScout = (team: GlobalTeamPowerRanking) => {
    soundEngine.playLevelUp();
    setScoutedTeams(prev => ({ ...prev, [team.teamId]: true }));
    if (onScoutTeam) {
      onScoutTeam(team.teamId);
    }
  };

  // Handle scrim simulation
  const handleStartScrim = (team: GlobalTeamPowerRanking) => {
    soundEngine.playDraftLock();
    let userPower = playerStats ? playerStats.mechanics : 85;
    if (currentPhase === 3 && dynastyState && dynastyState.roster.length > 0) {
      const sum = dynastyState.roster.reduce((acc, p) => acc + (p.mechanics + p.macro) / 2, 0);
      userPower = Math.round(sum / dynastyState.roster.length);
    }

    const diff = userPower - team.powerRating;
    const winRate = Math.min(88, Math.max(12, Math.round(50 + diff * 3.2)));
    const isWin = Math.random() * 100 <= winRate;

    const logs = [
      `【训练赛开局】你方战队 (综合战力 ${userPower}) 连线 ${team.region} 赛区顶级豪门【${team.teamName}】(战力 ${team.powerRating})！`,
      `【前15分钟对线】双边打野频频在峡谷先锋与小龙坑交火，胜率概率测算: ${winRate}%！`,
      isWin 
        ? `【大龙终局团灭】你方在28分钟抓住对方 ${team.tacticalWeakness.slice(0, 15)}... 破绽，完成0换4惊天绝杀！`
        : `【惜败复盘】【${team.shortName}】展现出无解的 ${team.playstyle}，后期远古龙团战阵型脱节遗憾惜败。`
    ];

    setScrimModalData({
      team,
      isSimulating: true,
      result: null
    });

    setTimeout(() => {
      if (isWin) soundEngine.playVictory();
      else soundEngine.playDefeat();

      setScrimModalData({
        team,
        isSimulating: false,
        result: { isWin, logs, winRate }
      });

      if (onScrimMatch) onScrimMatch(team);
    }, 1200);
  };

  // Handle trade inquiry
  const handleInitiateTrade = (target: TradeTargetPlayer) => {
    soundEngine.playCoin();
    setTradeInquiryTarget(target);
  };

  const handleConfirmTradeBid = () => {
    if (!tradeInquiryTarget) return;
    soundEngine.playVictory();

    const msg = `🎉【引援意向递交成功】已向 ${tradeInquiryTarget.team} 俱乐部正式送达对【${tradeInquiryTarget.name}】的 $${tradeInquiryTarget.buyoutCost.toLocaleString()} 转会买断意向书！对方管理层正在评估转会窗口细则。`;
    setTradeNotice(msg);
    setTimeout(() => setTradeNotice(null), 4000);

    if (onTradePlayer) {
      onTradePlayer(tradeInquiryTarget);
    }
    setTradeInquiryTarget(null);
  };

  const handleDeepScoutPlayer = (player: TeamRosterMember, team: GlobalTeamPowerRanking) => {
    // If already scouted, open directly!
    if (deepScoutedPlayers[player.name]) {
      soundEngine.playClick();
      const enrichedPlayer = {
        ...player,
        hiddenPotential: player.hiddenPotential || generateHiddenPotential(player.name, player.role, player.rating, team.teamName)
      };
      setSelectedScoutReport({
        player: enrichedPlayer,
        teamName: team.teamName,
        teamLogo: team.logoEmoji
      });
      return;
    }

    const scoutCost = 20000;
    const availableFunds = currentPhase === 3 ? (dynastyState?.budget || 0) : (playerStats?.money || 0);

    if (availableFunds < scoutCost) {
      soundEngine.playDefeat();
      setDeepScoutNotice(`⚠️ 资金不足！深度破译【${player.name}】的绝密潜能需要支付 ¥${scoutCost.toLocaleString()} 情报费。`);
      setTimeout(() => setDeepScoutNotice(null), 3500);
      return;
    }

    const deducted = onDeepScoutPlayer ? onDeepScoutPlayer(player, team) : true;
    if (deducted) {
      soundEngine.playCoin();
      setDeepScoutedPlayers(prev => ({ ...prev, [player.name]: true }));
      const enrichedPlayer = {
        ...player,
        hiddenPotential: player.hiddenPotential || generateHiddenPotential(player.name, player.role, player.rating, team.teamName)
      };
      setSelectedScoutReport({
        player: enrichedPlayer,
        teamName: team.teamName,
        teamLogo: team.logoEmoji
      });
      setDeepScoutNotice(`🔍【深度球探成功】已支付 ¥${scoutCost.toLocaleString()} 成功解锁【${player.name}】隐秘潜能数据！`);
      setTimeout(() => setDeepScoutNotice(null), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-[#0a0e17] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.15)] overflow-hidden text-slate-100">
        
        {/* Top Cyberpunk Neon Header */}
        <div className="relative p-3.5 sm:p-4 border-b border-cyan-500/20 bg-gradient-to-r from-[#0f131c] via-[#0a0e17] to-[#0f131c] shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-cyan-500/20 to-purple-500/20 border border-cyan-400/50 flex items-center justify-center text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                <Globe2 className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black font-tech tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-[#00f0ff] to-[#ffd700]">
                    全球战队实力榜 (GLOBAL POWER RANKINGS)
                  </h2>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-[#ffd700] border border-amber-500/40 font-code font-bold">
                    TOP 20
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                  全赛区实力指数 · 稳定性得分 · 战术破绽刺探 · 引援转会雷达
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main View Mode Selector */}
          <div className="mt-3 flex items-center gap-1.5 border-b border-cyan-500/20 pb-2">
            <button
              onClick={() => {
                soundEngine.playClick();
                setModalViewTab('list');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-tech font-bold cursor-pointer transition flex items-center gap-1.5 border ${
                modalViewTab === 'list'
                  ? 'bg-cyan-500/20 text-[#00f0ff] border-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>全球战力榜单 (Rankings)</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                setModalViewTab('heatmap_hub');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-tech font-bold cursor-pointer transition flex items-center gap-1.5 border ${
                modalViewTab === 'heatmap_hub'
                  ? 'bg-gradient-to-r from-amber-500/25 to-rose-500/25 text-amber-300 border-amber-400/80 shadow-[0_0_10px_rgba(251,191,36,0.2)]'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5 text-amber-400" />
              <span>情报热力雷达矩阵 (Scout Intel Heatmap)</span>
            </button>
          </div>

          {/* Regional Filter & Sort Pills */}
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
              {(['ALL', 'LCK', 'LPL', 'LEC', 'LCS'] as const).map(reg => (
                <button
                  key={reg}
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedRegion(reg);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-tech font-bold uppercase cursor-pointer transition border ${
                    selectedRegion === reg
                      ? 'bg-cyan-500/20 text-[#00f0ff] border-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {reg === 'ALL' ? '🌍 全部赛区' : reg}
                </button>
              ))}
            </div>

            {/* Sort & Search */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-36">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                <input
                  type="text"
                  placeholder="搜索战队/选手..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-7 pr-2 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] text-white focus:border-cyan-400 outline-none"
                />
              </div>

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="px-2 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] font-tech font-bold text-cyan-300 outline-none cursor-pointer"
              >
                <option value="RANK">名次排序</option>
                <option value="PWR">战力指数 (PWR)</option>
                <option value="WINRATE">赛季胜率 (%)</option>
                <option value="CONSISTENCY">稳定性得分</option>
              </select>
            </div>
          </div>
        </div>

        {/* Trade Notice Alert */}
        {tradeNotice && (
          <div className="p-2.5 bg-gradient-to-r from-emerald-950/90 via-slate-900 to-emerald-950/90 border-b border-emerald-500/50 text-emerald-200 text-xs font-tech font-bold flex items-center justify-between animate-fade-in">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{tradeNotice}</span>
            </span>
            <button onClick={() => setTradeNotice(null)} className="text-xs px-1 text-slate-400 hover:text-white cursor-pointer">✕</button>
          </div>
        )}

        {/* Deep Scout Notice Alert */}
        {deepScoutNotice && (
          <div className="p-2.5 bg-gradient-to-r from-cyan-950/90 via-slate-900 to-cyan-950/90 border-b border-cyan-500/50 text-cyan-200 text-xs font-tech font-bold flex items-center justify-between animate-fade-in">
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{deepScoutNotice}</span>
            </span>
            <button onClick={() => setDeepScoutNotice(null)} className="text-xs px-1 text-slate-400 hover:text-white cursor-pointer">✕</button>
          </div>
        )}

        {/* Content View: Rankings List vs Scout Intel Radar Matrix Hub */}
        {modalViewTab === 'heatmap_hub' ? (
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5">
            {/* Focus Team Selector Bar */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-tech font-bold text-cyan-300 flex items-center gap-1">
                  <Crosshair className="w-3.5 h-3.5" /> 侦察核心目标战队:
                </span>
                <select
                  value={hubSelectedTeamId}
                  onChange={(e) => {
                    soundEngine.playClick();
                    setHubSelectedTeamId(e.target.value);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-cyan-500/40 text-cyan-300 text-xs font-tech font-bold outline-none cursor-pointer"
                >
                  {GLOBAL_POWER_RANKINGS_TEAMS.map(t => (
                    <option key={t.teamId} value={t.teamId}>
                      #{t.rank} {t.logoEmoji} {t.teamName} ({t.region}) · PWR {t.powerRating}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-[10px] text-slate-400 font-sans">
                点击下方矩阵任意一行亦可直接置顶切换雷达侦察
              </div>
            </div>

            {/* Radar & Heatmap for selected team */}
            {(() => {
              const currentHubTeam = GLOBAL_POWER_RANKINGS_TEAMS.find(t => t.teamId === hubSelectedTeamId) || GLOBAL_POWER_RANKINGS_TEAMS[0];
              const isHubScouted = !!scoutedTeams[currentHubTeam.teamId];
              return (
                <ScoutIntelHeatmap
                  team={currentHubTeam}
                  playerStats={playerStats}
                  dynastyState={dynastyState}
                  currentPhase={currentPhase}
                  allTeams={GLOBAL_POWER_RANKINGS_TEAMS}
                  isScouted={isHubScouted}
                  onScoutTeam={() => handleScout(currentHubTeam)}
                />
              );
            })()}

            {/* Global Strength Cluster Heatmap Table */}
            <div className="rounded-xl bg-[#080d16] border border-slate-800 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-tech font-bold text-slate-300">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Globe2 className="w-3.5 h-3.5" /> 全球 TOP 豪门实力聚类热力透视图 (Clusters Overview)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">共 {filteredTeams.length} 支战队</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[10px] font-mono border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-tech">
                      <th className="py-1 px-1.5">排名</th>
                      <th className="py-1 px-2">战队</th>
                      <th className="py-1 px-1.5 text-center">赛区</th>
                      <th className="py-1 px-1.5 text-center">微操 (Mech)</th>
                      <th className="py-1 px-1.5 text-center">大局 (Macro)</th>
                      <th className="py-1 px-1.5 text-center">团战 (TF)</th>
                      <th className="py-1 px-1.5 text-center">视野 (Vis)</th>
                      <th className="py-1 px-1.5 text-center">韧性 (Adapt)</th>
                      <th className="py-1 px-1.5 text-right">PWR</th>
                      <th className="py-1 px-1.5 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredTeams.map(t => {
                      const clusters = getTeamTacticalClusters(t);
                      const isSelected = hubSelectedTeamId === t.teamId;

                      const getBadge = (val: number) => {
                        if (val >= 96) return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
                        if (val >= 92) return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                        if (val >= 88) return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
                        return 'bg-slate-800 text-slate-300 border-slate-700';
                      };

                      return (
                        <tr
                          key={t.teamId}
                          onClick={() => {
                            soundEngine.playClick();
                            setHubSelectedTeamId(t.teamId);
                          }}
                          className={`hover:bg-cyan-500/10 cursor-pointer transition ${
                            isSelected ? 'bg-cyan-500/15 font-bold' : ''
                          }`}
                        >
                          <td className="py-1.5 px-1.5 text-cyan-400 font-bold">#{t.rank}</td>
                          <td className="py-1.5 px-2 text-white font-tech flex items-center gap-1 truncate max-w-[120px]">
                            <span>{t.logoEmoji}</span>
                            <span className="truncate">{t.shortName}</span>
                          </td>
                          <td className="py-1.5 px-1.5 text-center text-slate-400 font-tech">{t.region}</td>
                          <td className="py-1.5 px-1.5 text-center">
                            <span className={`px-1 py-0.2 rounded border text-[9px] ${getBadge(clusters.mechanics)}`}>
                              {clusters.mechanics}
                            </span>
                          </td>
                          <td className="py-1.5 px-1.5 text-center">
                            <span className={`px-1 py-0.2 rounded border text-[9px] ${getBadge(clusters.macro)}`}>
                              {clusters.macro}
                            </span>
                          </td>
                          <td className="py-1.5 px-1.5 text-center">
                            <span className={`px-1 py-0.2 rounded border text-[9px] ${getBadge(clusters.teamfight)}`}>
                              {clusters.teamfight}
                            </span>
                          </td>
                          <td className="py-1.5 px-1.5 text-center">
                            <span className={`px-1 py-0.2 rounded border text-[9px] ${getBadge(clusters.vision)}`}>
                              {clusters.vision}
                            </span>
                          </td>
                          <td className="py-1.5 px-1.5 text-center">
                            <span className={`px-1 py-0.2 rounded border text-[9px] ${getBadge(clusters.adaptability)}`}>
                              {clusters.adaptability}
                            </span>
                          </td>
                          <td className="py-1.5 px-1.5 text-right font-black text-amber-300">{t.powerRating}</td>
                          <td className="py-1.5 px-1.5 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                soundEngine.playClick();
                                setHubSelectedTeamId(t.teamId);
                              }}
                              className="px-1.5 py-0.5 rounded text-[9px] font-tech font-bold bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/40 border border-cyan-500/30"
                            >
                              雷达
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        ) : (
          /* Scrollable Teams Roster List */
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
          {filteredTeams.map(team => {
            const isExpanded = expandedTeamId === team.teamId;
            const isScouted = !!scoutedTeams[team.teamId];

            return (
              <div
                key={team.teamId}
                className={`rounded-xl border transition-all ${
                  isExpanded
                    ? 'bg-slate-900/90 border-cyan-500/50 shadow-lg shadow-cyan-950/20'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Team Card Header Row */}
                <div
                  onClick={() => {
                    soundEngine.playClick();
                    setExpandedTeamId(isExpanded ? null : team.teamId);
                  }}
                  className="p-3 flex items-center justify-between cursor-pointer hover:bg-white/5 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Rank Badge */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-tech font-black text-sm shrink-0 border ${
                      team.rank === 1
                        ? 'bg-gradient-to-br from-amber-500 to-yellow-600 text-slate-950 border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                        : team.rank === 2
                        ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-950 border-white'
                        : team.rank === 3
                        ? 'bg-gradient-to-br from-amber-700 to-orange-800 text-white border-amber-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}>
                      #{team.rank}
                    </div>

                    {/* Team Identity */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base">{team.logoEmoji}</span>
                        <span className="text-xs sm:text-sm font-tech font-bold text-white truncate">
                          {team.teamName}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-tech font-bold border ${
                          team.region === 'LCK' ? 'bg-blue-500/15 text-blue-300 border-blue-500/30' :
                          team.region === 'LPL' ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' :
                          team.region === 'LEC' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
                          'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        }`}>
                          {team.region}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-code font-extrabold bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">
                          {team.tier}
                        </span>
                        {/* 5-Week Trend Quick Indicator */}
                        {(() => {
                          const trends = getTeamRankTrends(team);
                          const delta = trends[0].rank - trends[trends.length - 1].rank;
                          return (
                            <span 
                              className={`px-1.5 py-0.2 rounded text-[8px] font-code font-bold flex items-center gap-0.5 ${
                                delta > 0 ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' :
                                delta < 0 ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30' :
                                'bg-slate-800 text-slate-300 border border-slate-700'
                              }`} 
                              title={`近5周走势: W1 #${trends[0].rank} ➔ W5 #${trends[trends.length - 1].rank}`}
                            >
                              {delta > 0 ? `▲5周+${delta}` : delta < 0 ? `▼5周${delta}` : '—5周平'}
                            </span>
                          );
                        })()}
                        {isScouted && (
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-tech bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> 已刺探破绽
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans truncate mt-0.5">
                        {team.playstyle}
                      </div>
                    </div>
                  </div>

                  {/* Right Stats Quick View */}
                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <div className="text-right hidden xs:block">
                      <div className="text-xs font-tech font-bold text-cyan-400">
                        PWR <span className="font-code text-sm font-black">{team.powerRating}</span>
                      </div>
                      <div className="text-[9px] text-slate-400 font-code">
                        {team.wins}胜 {team.losses}负 ({team.winRate}%) · {team.streak}
                      </div>
                    </div>

                    <div className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Tactical Intel & Trade Dossier */}
                {isExpanded && (
                  <div className="p-3 sm:p-4 pt-0 border-t border-slate-800/80 space-y-3 animate-fade-in bg-black/20">
                    
                    {/* Team Metrics Bar */}
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-3">
                      <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                        <div className="text-slate-400">综合战力指数</div>
                        <div className="text-cyan-400 font-code font-black text-sm">{team.powerRating} / 100</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                        <div className="text-slate-400">稳定性与状态分</div>
                        <div className="text-emerald-400 font-code font-black text-sm">{team.consistencyScore} 分 ({team.streak})</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                        <div className="text-slate-400">赛季胜场净胜比</div>
                        <div className="text-amber-300 font-code font-black text-sm">+{team.wins - team.losses} ({team.winRate}%)</div>
                      </div>
                    </div>

                    {/* Visual Analysis View Switcher: Radar Heatmap vs Ranking Trends */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 pt-1">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            soundEngine.playClick();
                            setTeamVisualMode(prev => ({ ...prev, [team.teamId]: 'heatmap' }));
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-tech font-bold cursor-pointer transition flex items-center gap-1.5 border ${
                            (teamVisualMode[team.teamId] || 'heatmap') === 'heatmap'
                              ? 'bg-cyan-500/20 text-[#00f0ff] border-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          <Crosshair className="w-3 h-3 text-cyan-400" />
                          <span>战术情报热力雷达 (Scout Radar)</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            soundEngine.playClick();
                            setTeamVisualMode(prev => ({ ...prev, [team.teamId]: 'trend' }));
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-tech font-bold cursor-pointer transition flex items-center gap-1.5 border ${
                            teamVisualMode[team.teamId] === 'trend'
                              ? 'bg-cyan-500/20 text-[#00f0ff] border-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          <TrendingUp className="w-3 h-3 text-amber-400" />
                          <span>近5周排名走势图 (5-Week Trends)</span>
                        </button>
                      </div>

                      <span className="text-[9px] text-slate-400 font-mono hidden xs:inline">
                        {(teamVisualMode[team.teamId] || 'heatmap') === 'heatmap' ? '微操/大局/团战 聚类' : '名次/PWR 曲线'}
                      </span>
                    </div>

                    {(teamVisualMode[team.teamId] || 'heatmap') === 'heatmap' ? (
                      <ScoutIntelHeatmap
                        team={team}
                        playerStats={playerStats}
                        dynastyState={dynastyState}
                        currentPhase={currentPhase}
                        allTeams={GLOBAL_POWER_RANKINGS_TEAMS}
                        isScouted={isScouted}
                        onScoutTeam={() => handleScout(team)}
                      />
                    ) : (
                      <RankingTrendsLineGraph team={team} />
                    )}

                    {/* 5-Man Star Roster */}
                    <div>
                      <div className="text-[10px] font-tech font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-cyan-400" />
                        首发五虎先发阵容与本命英雄
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                        {team.roster.map(player => (
                          <div key={player.name} className="p-2 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition">
                            <div className="flex items-center justify-between text-[9px]">
                              <span className="font-tech text-cyan-400 font-bold">{player.role}</span>
                              <span className="font-code font-black text-amber-400">{player.rating}</span>
                            </div>
                            <div className="text-xs font-tech font-bold text-white truncate mt-1">
                              {player.name.split(/[,(（]/)[0]}
                            </div>
                            <div className="text-[8px] text-slate-400 truncate mt-0.5">
                              {player.signatureHero}
                            </div>
                            <button
                              onClick={() => handleDeepScoutPlayer(player, team)}
                              className={`mt-1.5 py-1 px-1 rounded-lg text-[9px] font-tech font-bold flex items-center justify-center gap-0.5 transition cursor-pointer ${
                                deepScoutedPlayers[player.name]
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                              }`}
                              title={deepScoutedPlayers[player.name] ? '查看绝密潜能报告' : '深度球探 (¥20,000)'}
                            >
                              <Eye className="w-2.5 h-2.5" />
                              <span>{deepScoutedPlayers[player.name] ? '潜能档案' : '深度球探'}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tactical Scouting Dossier (战术刺探破绽) */}
                    <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-tech font-bold text-amber-400 uppercase flex items-center gap-1">
                          <Crosshair className="w-3.5 h-3.5" /> 战术刺探破绽情报
                        </span>
                        {!isScouted && (
                          <button
                            onClick={() => handleScout(team)}
                            className="px-2 py-0.5 rounded bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-[10px] font-tech font-extrabold cursor-pointer transition shadow hover:scale-102 flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>深度刺探战术 (解锁胜率+8%)</span>
                          </button>
                        )}
                      </div>

                      {isScouted ? (
                        <div className="text-[11px] text-slate-200 leading-relaxed space-y-1 font-sans">
                          <div><strong className="text-rose-400">核心破绽：</strong>{team.tacticalWeakness}</div>
                          <div><strong className="text-emerald-400">克制破阵建议：</strong>{team.counterTip}</div>
                          <div className="text-[9px] text-emerald-400 font-code font-bold pt-0.5">
                            ✓ 已载入战术终端：遭遇该队伍时自动获得 +8% 胜率洞察加成！
                          </div>
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-400 font-sans">
                          🔒 该战队核心体系尚未深度破解。点击上方【深度刺探战术】获取对手对线盲区、克制打法及 +8% 赛场胜率加成！
                        </p>
                      )}
                    </div>

                    {/* Potential Trade Targets (引援转会雷达) */}
                    {team.tradeTargets && team.tradeTargets.length > 0 && (
                      <div>
                        <div className="text-[10px] font-tech font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                          潜在引援转会雷达 (Trade Targets)
                        </div>
                        <div className="space-y-1.5">
                          {team.tradeTargets.map(target => (
                            <div
                              key={target.id}
                              className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-tech font-bold text-white">{target.name}</span>
                                  <span className="px-1 rounded text-[8px] font-tech bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                    {target.role}
                                  </span>
                                  <span className="font-code font-bold text-amber-400 text-xs">
                                    评级: {target.rating}
                                  </span>
                                  <span className="px-1 rounded text-[8px] font-code bg-amber-500/20 text-amber-300">
                                    加盟意愿: {target.willingnessToJoin}%
                                  </span>
                                </div>
                                <p className="text-[9px] text-slate-400 truncate mt-0.5">
                                  {target.description} · 预估买断金: ${target.buyoutCost.toLocaleString()}
                                </p>
                              </div>

                              <button
                                onClick={() => handleInitiateTrade(target)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-tech font-bold cursor-pointer transition shrink-0 flex items-center gap-1"
                              >
                                <UserPlus className="w-3 h-3" />
                                <span>引援问询</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Hub: Scrim Match */}
                    <div className="pt-1 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleStartScrim(team)}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-tech font-black cursor-pointer transition shadow-md flex items-center justify-center gap-1.5"
                      >
                        <Swords className="w-4 h-4 fill-current" />
                        <span>约战跨国战术训练赛 (Simulate Scrim)</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
        )}

        {/* Footer: User Standing Summary */}
        <div className="p-3 border-t border-slate-800 bg-[#0f131c] flex items-center justify-between text-xs font-tech shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold">★ 你方战队定位:</span>
            <span className="text-slate-300">
              {currentPhase === 1 ? '业余天梯新秀 (#21+ 争夺首张职业门票)' :
               currentPhase === 2 ? '赛区季后赛黑马战队 (世界前25候选)' :
               '全球顶级豪门创队俱乐部 (冲击世界之巅)'}
            </span>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer transition text-[11px]"
          >
            返回主界面
          </button>
        </div>

      </div>

      {/* Scrim Simulation Modal Dialog */}
      {scrimModalData && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
          <div className="w-full max-w-md p-4 rounded-2xl bg-slate-900 border border-cyan-500/60 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-tech font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                <Swords className="w-4 h-4" /> 跨国闭门训练赛战况
              </span>
              <span className="text-xs font-tech text-white">vs {scrimModalData.team.shortName}</span>
            </div>

            {scrimModalData.isSimulating ? (
              <div className="py-8 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                <span className="text-xs text-cyan-300 font-tech">双方进入召唤师峡谷，极限拉扯模拟中...</span>
              </div>
            ) : scrimModalData.result && (
              <div className="space-y-2.5">
                <div className={`p-3 rounded-xl border text-center font-tech font-black text-base ${
                  scrimModalData.result.isWin
                    ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300'
                    : 'bg-rose-950/50 border-rose-500 text-rose-300'
                }`}>
                  {scrimModalData.result.isWin ? '🏆 训练赛获胜 (SCRIM VICTORY)' : '💔 训练赛告负 (SCRIM DEFEAT)'}
                  <div className="text-[10px] text-slate-300 font-code font-normal mt-0.5">
                    赛前胜率预期: {scrimModalData.result.winRate}%
                  </div>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {scrimModalData.result.logs.map((log, idx) => (
                    <div key={idx} className="p-2 rounded bg-slate-950 text-[11px] text-slate-300 font-sans leading-relaxed border border-slate-800">
                      {log}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setScrimModalData(null)}
                  className="w-full py-2 rounded-xl bg-cyan-500 text-slate-950 font-tech font-bold text-xs cursor-pointer hover:bg-cyan-400 transition"
                >
                  完成训练赛复盘
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trade Inquiry Confirmation Dialog */}
      {tradeInquiryTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
          <div className="w-full max-w-sm p-4 rounded-2xl bg-slate-900 border border-emerald-500/60 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-tech font-bold text-emerald-400 flex items-center gap-1">
                <UserPlus className="w-4 h-4" /> 正式引援转会问询
              </span>
              <button onClick={() => setTradeInquiryTarget(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-tech font-bold text-white text-sm">{tradeInquiryTarget.name}</span>
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-tech font-bold">
                  {tradeInquiryTarget.role} (评级 {tradeInquiryTarget.rating})
                </span>
              </div>
              <div className="text-slate-400 text-[11px]">所属战队：{tradeInquiryTarget.team}</div>
              <div className="text-emerald-300 font-code font-bold">
                转会买断预估金：${tradeInquiryTarget.buyoutCost.toLocaleString()}
              </div>
              <div className="text-slate-400 font-code">
                预期赛季薪酬：${tradeInquiryTarget.salaryPerSeason.toLocaleString()} / 赛季
              </div>
              <div className="text-amber-400 font-code">
                签约加盟意愿度：{tradeInquiryTarget.willingnessToJoin}%
              </div>
              <p className="text-[10px] text-slate-300 pt-1 font-sans">
                {tradeInquiryTarget.description}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setTradeInquiryTarget(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-tech font-bold cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleConfirmTradeBid}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-tech font-black cursor-pointer shadow hover:scale-102 transition"
              >
                递交转会意向书
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scout Report Dossier Modal */}
      <ScoutReportModal
        isOpen={Boolean(selectedScoutReport)}
        onClose={() => setSelectedScoutReport(null)}
        player={selectedScoutReport?.player || null}
        teamName={selectedScoutReport?.teamName || ''}
        teamLogo={selectedScoutReport?.teamLogo}
        onInitiateTransfer={(p) => {
          if (onTradePlayer) {
            onTradePlayer({
              id: `scouted-${p.name}`,
              name: p.name,
              role: p.role,
              rating: p.rating,
              team: selectedScoutReport?.teamName || '俱乐部',
              buyoutCost: p.buyoutCost || 350000,
              salaryPerSeason: 120000,
              willingnessToJoin: 85,
              status: 'TRANSFER_LISTED',
              description: `深度球探推荐引援候选，成长上限高达 ${p.hiddenPotential?.growthCap || 95} 分！`
            });
          }
        }}
      />

    </div>
  );
};
