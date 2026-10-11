import React, { useState, useMemo } from 'react';
import { DynastyState, ProPlayer, FacilityUpgrade, SponsorDeal, PlayerPlaystyle } from '../../types/game';
import { SCOUTING_POOL, SPONSORS_CATALOG, WORLDS_OPPONENTS, OpponentTeam } from '../../data/dynastyData';
import { soundEngine } from '../../utils/audio';
import { LiveMatchDanmaku } from '../common/LiveMatchDanmaku';
import { 
  Building2, 
  DollarSign, 
  Users, 
  Globe2, 
  Trophy, 
  Sparkles, 
  Zap, 
  Flame, 
  CheckCircle2, 
  Crown,
  Home,
  Network,
  RotateCcw,
  Globe,
  Radio,
  Share2,
  TrendingUp,
  Activity,
  Layers,
  Shield,
  Swords,
  ChevronRight,
  Info,
  Dumbbell,
  Handshake,
  Brain,
  Clock,
  Scale,
  Briefcase,
  Target,
  Tent,
  Crosshair,
  Search
} from 'lucide-react';
import { DynastyTrainingCampModal } from './DynastyTrainingCampModal';
import { SponsorshipManagerModal } from './SponsorshipManagerModal';
import { DailyTacticalDrillModal } from './DailyTacticalDrillModal';
import { ScrimSimulatorModal } from './ScrimSimulatorModal';
import { ContractBuyoutModal } from './ContractBuyoutModal';
import { TrophyHallShowcase } from './TrophyHallShowcase';
import { LeagueExpansionDraftModal } from './LeagueExpansionDraftModal';
import { TrainingCampTabView } from './TrainingCampTabView';
import { CoachingStaffSection } from './CoachingStaffSection';
import { getCoachingStaffPassiveBonuses } from '../../data/coachingStaffData';
import { OpponentScoutingReportModal } from './OpponentScoutingReportModal';
import { InfrastructureTabView } from './InfrastructureTabView';
import { TeamDynamicsSection } from './TeamDynamicsSection';

interface PhaseThreeProps {
  dynasty: DynastyState;
  onUpdateDynasty: React.Dispatch<React.SetStateAction<DynastyState>>;
  onWinWorlds: () => void;
  onOpenGacha?: () => void;
  onOpenLifeSim?: () => void;
  onOpenSynergy?: () => void;
  onOpenLeaderboard?: () => void;
  onOpenWorldTour?: () => void;
  onOpenPrestige?: () => void;
  onOpenPowerRankings?: () => void;
  onOpenCommunityRelations?: () => void;
}

export const PLAYSTYLE_CONFIG: Record<PlayerPlaystyle, {
  label: string;
  enLabel: string;
  icon: string;
  neonColor: string;
  neonGlow: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  description: string;
  tacticalBuff: string;
}> = {
  'Aggressive': {
    label: '激进强攻',
    enLabel: 'Aggressive',
    icon: '⚔️',
    neonColor: '#F59E0B',
    neonGlow: 'rgba(245, 158, 11, 0.4)',
    badgeBg: 'bg-amber-500/20',
    badgeBorder: 'border-amber-400/60',
    badgeText: 'text-amber-300',
    description: '极致对线单杀压制，前期越塔强杀配合与入侵野区窒息节奏。',
    tacticalBuff: '前期对线压制率 +18% · 越塔先手胜率 +15%'
  },
  'Macro-Oriented': {
    label: '大局观运营',
    enLabel: 'Macro-Oriented',
    icon: '🧠',
    neonColor: '#00F0FF',
    neonGlow: 'rgba(0, 240, 255, 0.4)',
    badgeBg: 'bg-cyan-500/20',
    badgeBorder: 'border-cyan-400/60',
    badgeText: 'text-cyan-300',
    description: '掌控兵线真空与视野暗区，滴水不漏的大龙坑防守拉扯与四一分推。',
    tacticalBuff: '中立资源控图率 +16% · 远古龙男爵争夺胜率 +14%'
  },
  'Clutch': {
    label: '绝境大心脏',
    enLabel: 'Clutch',
    icon: '⚡',
    neonColor: '#D946EF',
    neonGlow: 'rgba(217, 70, 239, 0.4)',
    badgeBg: 'bg-fuchsia-500/20',
    badgeBorder: 'border-fuchsia-400/60',
    badgeText: 'text-fuchsia-300',
    description: '落后大逆风从容不迫，敏锐捕捉0.1秒闪现开团良机，绝境神仙翻盘。',
    tacticalBuff: '逆风绝境反击胜率 +20% · 终结决战伤害 +15%'
  },
  'Defensive': {
    label: '铁壁防守',
    enLabel: 'Defensive',
    icon: '🛡️',
    neonColor: '#10B981',
    neonGlow: 'rgba(16, 185, 129, 0.4)',
    badgeBg: 'bg-emerald-500/20',
    badgeBorder: 'border-emerald-400/60',
    badgeText: 'text-emerald-300',
    description: '稳固塔下兵线防守，无死角反蹲护航双C发育，将胜局拖至六神装大后期。',
    tacticalBuff: '防越塔反杀成功率 +18% · 防御塔防守韧性 +25%'
  }
};

// Tactical formation 2D visual layout coordinates (relative to 320x170 viewBox)
const FORMATION_POSITIONS: Record<string, { x: number; y: number; label: string }> = {
  TOP: { x: 55, y: 40, label: '上单' },
  JUG: { x: 105, y: 125, label: '打野' },
  MID: { x: 160, y: 65, label: '中单' },
  ADC: { x: 225, y: 125, label: '射手' },
  SUP: { x: 270, y: 70, label: '辅助' }
};

export const PhaseThreeDynasty: React.FC<PhaseThreeProps> = ({
  dynasty,
  onUpdateDynasty,
  onWinWorlds,
  onOpenGacha,
  onOpenLifeSim,
  onOpenSynergy,
  onOpenLeaderboard,
  onOpenWorldTour,
  onOpenPrestige,
  onOpenPowerRankings,
  onOpenCommunityRelations
}) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'coaching' | 'infrastructure' | 'facilities' | 'sponsors' | 'scout' | 'training_camp' | 'trophy_hall' | 'worlds'>('roster');
  const [selectedOpponent, setSelectedOpponent] = useState<OpponentTeam>(WORLDS_OPPONENTS[0]);
  const [worldsMatchLog, setWorldsMatchLog] = useState<string[]>([]);
  const [isSimulatingFinals, setIsSimulatingFinals] = useState<boolean>(false);
  const [seriesScore, setSeriesScore] = useState<{ teamWins: number; opponentWins: number }>({ teamWins: 0, opponentWins: 0 });
  const [selectedPlaystyleFilter, setSelectedPlaystyleFilter] = useState<PlayerPlaystyle | 'ALL'>('ALL');
  const [focusedPlayerId, setFocusedPlayerId] = useState<string | null>(null);
  const [isTrainingCampOpen, setIsTrainingCampOpen] = useState<boolean>(false);
  const [isSponsorshipManagerOpen, setIsSponsorshipManagerOpen] = useState<boolean>(false);
  const [isDailyDrillOpen, setIsDailyDrillOpen] = useState<boolean>(false);
  const [isScrimSimOpen, setIsScrimSimOpen] = useState<boolean>(false);
  const [isContractBuyoutOpen, setIsContractBuyoutOpen] = useState<boolean>(false);
  const [targetBuyoutPlayer, setTargetBuyoutPlayer] = useState<ProPlayer | null>(null);
  const [isExpansionDraftOpen, setIsExpansionDraftOpen] = useState<boolean>(false);
  const [isScoutReportModalOpen, setIsScoutReportModalOpen] = useState<boolean>(false);
  const [scoutingTargetOpponent, setScoutingTargetOpponent] = useState<OpponentTeam>(WORLDS_OPPONENTS[0]);
  const [isTeamDynamicsModalOpen, setIsTeamDynamicsModalOpen] = useState<boolean>(false);
  const [rosterViewMode, setRosterViewMode] = useState<'dynamics' | 'network'>('dynamics');

  const handleApplyTrainingBoost = (
    playerId: string,
    stat: 'mechanics' | 'macro' | 'morale',
    amount: number,
    cost: number
  ) => {
    if (dynasty.budget < cost) return false;
    onUpdateDynasty(prev => ({
      ...prev,
      budget: prev.budget - cost,
      roster: prev.roster.map(p => {
        if (p.id !== playerId) return p;
        const currentVal = p[stat] || 85;
        return {
          ...p,
          [stat]: Math.min(100, currentVal + amount),
          trainingBoost: {
            stat,
            boostAmount: amount,
            daysRemaining: 7
          }
        };
      }),
      trainingCampHistory: [
        ...(prev.trainingCampHistory || []),
        {
          playerId,
          playerName: prev.roster.find(p => p.id === playerId)?.name || '选手',
          stat,
          boostAmount: amount,
          daysRemaining: 7,
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        }
      ]
    }));
    return true;
  };

  const handleQuickTrainMorale = (player: ProPlayer, e: React.MouseEvent) => {
    e.stopPropagation();
    const quickCost = 5000;
    if (dynasty.budget < quickCost) {
      soundEngine.playDefeat();
      return;
    }
    if (player.morale >= 100) {
      soundEngine.playClick();
      return;
    }
    soundEngine.playLevelUp();
    const recoveryBonusRate = (dynasty.infrastructureStats?.totalRecoverySpeedMultiplier || 0) / 100;
    const moraleGain = Math.max(5, Math.round(5 * (1 + recoveryBonusRate)));
    onUpdateDynasty(prev => ({
      ...prev,
      budget: prev.budget - quickCost,
      roster: prev.roster.map(p => {
        if (p.id !== player.id) return p;
        return {
          ...p,
          morale: Math.min(100, p.morale + moraleGain)
        };
      })
    }));
  };

  // Fanbase multiplier from community relations
  const fanbaseMultiplier = dynasty.communityRelations?.fanbaseMultiplier || 1.0;

  const coachingBonuses = useMemo(() => {
    return getCoachingStaffPassiveBonuses(dynasty.coachingStaff);
  }, [dynasty.coachingStaff]);

  const teamPower = Math.round(
    dynasty.roster.reduce((acc, p, idx) => {
      // Passive coaching bonuses apply to the starting roster (top 5 players)
      const bonusMech = idx < 5 ? coachingBonuses.mechanics : 0;
      const bonusMac = idx < 5 ? coachingBonuses.macro : 0;
      const effectiveMech = Math.min(100, p.mechanics + bonusMech);
      const effectiveMac = Math.min(100, p.macro + bonusMac);
      return acc + (effectiveMech * 0.5 + effectiveMac * 0.5);
    }, 0) / (dynasty.roster.length || 1)
  );

  // Synergy & Playstyle Calculations
  const synergyData = useMemo(() => {
    const playstyleCounts: Record<PlayerPlaystyle, ProPlayer[]> = {
      'Aggressive': [],
      'Macro-Oriented': [],
      'Clutch': [],
      'Defensive': []
    };

    dynasty.roster.forEach(player => {
      const ps: PlayerPlaystyle = player.playstyle || 'Aggressive';
      if (playstyleCounts[ps]) {
        playstyleCounts[ps].push(player);
      }
    });

    // Generate neon connecting lines between all pairs with matching playstyle
    const neonLines: {
      id: string;
      player1: ProPlayer;
      player2: ProPlayer;
      playstyle: PlayerPlaystyle;
      p1Pos: { x: number; y: number };
      p2Pos: { x: number; y: number };
      neonColor: string;
      neonGlow: string;
      active: boolean;
    }[] = [];

    let totalBonds = 0;

    (Object.keys(playstyleCounts) as PlayerPlaystyle[]).forEach(ps => {
      const group = playstyleCounts[ps];
      if (group.length >= 2) {
        for (let i = 0; i < group.length; i++) {
          for (let j = i + 1; j < group.length; j++) {
            totalBonds++;
            const p1 = group[i];
            const p2 = group[j];
            const p1Pos = FORMATION_POSITIONS[p1.role] || { x: 50, y: 50 };
            const p2Pos = FORMATION_POSITIONS[p2.role] || { x: 250, y: 100 };
            const conf = PLAYSTYLE_CONFIG[ps];

            const matchesFilter = selectedPlaystyleFilter === 'ALL' || selectedPlaystyleFilter === ps;
            const matchesFocus = !focusedPlayerId || p1.id === focusedPlayerId || p2.id === focusedPlayerId;

            neonLines.push({
              id: `line-${p1.id}-${p2.id}`,
              player1: p1,
              player2: p2,
              playstyle: ps,
              p1Pos,
              p2Pos,
              neonColor: conf.neonColor,
              neonGlow: conf.neonGlow,
              active: matchesFilter && matchesFocus
            });
          }
        }
      }
    });

    // Team Cohesion Metric (团队战术默契凝聚力评分)
    const avgMorale = dynasty.roster.reduce((acc, p) => acc + (p.morale || 80), 0) / (dynasty.roster.length || 1);
    const cohesionRaw = Math.min(100, Math.round(52 + totalBonds * 11 + (avgMorale - 70) * 0.4));
    const cohesionScore = Math.max(50, cohesionRaw);

    let cohesionGrade = 'S';
    let cohesionTitle = '战术协同 · 默契渐生';
    let cohesionBuff = '+10% 团战协同胜率 · +6% 赛前士气护盾';

    if (cohesionScore >= 92) {
      cohesionGrade = 'SSS';
      cohesionTitle = '神级合璧 · 天衣无缝';
      cohesionBuff = '+22% 团战决胜协同 · +18% 逆风绝境大翻盘概率';
    } else if (cohesionScore >= 82) {
      cohesionGrade = 'SS';
      cohesionTitle = '心领神会 · 步调一致';
      cohesionBuff = '+16% 团战决胜协同 · +12% 资源控图效率';
    }

    return {
      playstyleCounts,
      neonLines,
      totalBonds,
      cohesionScore,
      cohesionGrade,
      cohesionTitle,
      cohesionBuff
    };
  }, [dynasty.roster, selectedPlaystyleFilter, focusedPlayerId]);

  const handleUpgradeFacility = (fac: FacilityUpgrade) => {
    if (dynasty.budget < fac.cost) {
      alert(`资金不足（需要 $${fac.cost.toLocaleString()}）。`);
      return;
    }
    if (fac.tier >= fac.maxTier) {
      alert('该基地设施已达顶级！');
      return;
    }

    soundEngine.playCoin();
    onUpdateDynasty(prev => ({
      ...prev,
      budget: prev.budget - fac.cost,
      fanHype: prev.fanHype + 2500,
      facilities: prev.facilities.map(f => f.id === fac.id ? { ...f, tier: f.tier + 1, cost: Math.round(f.cost * 1.5) } : f)
    }));
  };

  const handleSignSponsor = (sponsor: SponsorDeal) => {
    soundEngine.playCoin();
    const finalBonus = Math.round(sponsor.signingBonus * fanbaseMultiplier);
    onUpdateDynasty(prev => ({
      ...prev,
      budget: prev.budget + finalBonus,
      fanHype: prev.fanHype + Math.round(1500 * fanbaseMultiplier),
      activeSponsors: [...prev.activeSponsors, { ...sponsor, active: true }]
    }));
  };

  const handleSignPlayer = (player: ProPlayer) => {
    const salaryCap = dynasty.salaryCapRules || {
      softCap: 70000,
      hardCap: 95000,
      luxuryTaxRate: 1.5,
      agencyFeeRate: 0.10,
      luxuryTaxPaidTotal: 0
    };

    const baseBuyout = player.marketValue || 200000;
    const agencyCommission = Math.round(baseBuyout * (salaryCap.agencyFeeRate || 0.10));
    const totalCost = baseBuyout + agencyCommission;

    const currentWeeklyPayroll = dynasty.roster.reduce((acc, p) => acc + (p.salary || 10000), 0);
    const existingRolePlayer = dynasty.roster.find(p => p.role === player.role);
    const projectedPayroll = currentWeeklyPayroll - (existingRolePlayer?.salary || 0) + (player.salary || 12000);

    if (projectedPayroll > salaryCap.hardCap) {
      soundEngine.playDefeat();
      alert(`⚠️ 签约被联盟劳资委员会否决！\n该选手周薪为 $${(player.salary || 12000).toLocaleString()}，签约后全队总薪酬将达 $${projectedPayroll.toLocaleString()}，突破硬工资帽上限 ($${salaryCap.hardCap.toLocaleString()})！请先解约选手或调整薪资空间。`);
      return;
    }

    if (dynasty.budget < totalCost) {
      soundEngine.playDefeat();
      alert(`⚠️ 资金不足！\n签约买断需付: 基准转会费 $${baseBuyout.toLocaleString()} + 10% 经纪公司佣金 $${agencyCommission.toLocaleString()} = 总计 $${totalCost.toLocaleString()}！当前俱乐部金库仅有 $${dynasty.budget.toLocaleString()}。`);
      return;
    }

    soundEngine.playCoin();
    onUpdateDynasty(prev => {
      const newRoster = prev.roster.map(p => p.role === player.role ? {
        ...player,
        agencyName: player.agencyName || '极速电竞体育经纪 (Apex Sports)',
        contractYears: player.contractYears || 2,
        buyoutClause: player.buyoutClause || player.marketValue
      } : p);

      const historyLog = {
        id: `buyout-scout-${Date.now()}`,
        playerName: player.name,
        role: player.role,
        baseBuyout,
        agencyCommission,
        totalPaid: totalCost,
        annualSalary: player.salary || 12000,
        type: 'SIGNING' as const,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        agencyName: player.agencyName || '星耀文娱经纪集团 (Star Agency)'
      };

      return {
        ...prev,
        budget: prev.budget - totalCost,
        roster: newRoster,
        fanHype: prev.fanHype + 4500,
        contractBuyoutHistory: [historyLog, ...(prev.contractBuyoutHistory || [])]
      };
    });
  };

  const startWorldsFinalsSeries = () => {
    soundEngine.playBaronSteal();
    setIsSimulatingFinals(true);
    setSeriesScore({ teamWins: 0, opponentWins: 0 });
    const bootcampBonus = dynasty.remoteBootcamp?.isActive ? (dynasty.remoteBootcamp.tournamentWinRateBonus || 0.16) : 0;
    const scoutingReport = dynasty.opponentScoutingReports?.[selectedOpponent.id];
    const scoutingBonus = scoutingReport ? (scoutingReport.draftTendency?.counterWinRateBonus || 0.12) : 0;
    const dynamicsScore = dynasty.teamDynamics?.totalSynergyScore ?? synergyData.cohesionScore;
    const dynamicsBonus = dynamicsScore >= 90 ? 0.08 : dynamicsScore >= 80 ? 0.04 : 0;

    const initialLogs = [
      `🏆 全球总决赛 BO5 巅峰决战打响：你所打造的电竞豪门 VS ${selectedOpponent.name.toUpperCase()}！`,
      `开幕式全息巨龙掠过场馆，首尔主场6万名热血观众齐声高呼战队口号！`
    ];
    if (dynasty.remoteBootcamp?.isActive) {
      initialLogs.push(`⛺ 【异地封闭特训加成】首发五虎在 [${dynasty.remoteBootcamp.locationName}] 的 7 天极限封闭集训全面爆发！世界赛决胜胜率获得 +${Math.round(bootcampBonus * 100)}% 巨额战术加成！`);
    }
    const hiredCoachList = Object.values(dynasty.coachingStaff?.hiredCoaches || {}).filter(Boolean);
    if (hiredCoachList.length > 0) {
      initialLogs.push(`👔 【教练智囊团出征】在岗名帅 (${hiredCoachList.map(c => c!.name).join('、')}) 针对 ${selectedOpponent.name} 完成临场BP战术封锁与心理动员！常驻被动属性全面实装！`);
    }
    if (scoutingReport) {
      initialLogs.push(`🔬 【战术沙盘深度侦察实装】分析教练 [${scoutingReport.assignedCoachName}] 成功预判 ${selectedOpponent.name} 的BP倾向 (${scoutingReport.draftTendency.compStyleLabel})！全队直击软肋【${scoutingReport.draftTendency.draftWeakness}】，决胜胜率获得 +${Math.round(scoutingBonus * 100)}% 针对性加成！`);
    }
    if (dynasty.teamDynamics && dynasty.teamDynamics.totalSynergyScore >= 80) {
      initialLogs.push(`👥 【作战小队战术协同生效】${dynasty.teamDynamics.synergyGrade} 级阵型编制 (${dynasty.teamDynamics.synergyTitle})！团队协同评分 ${dynasty.teamDynamics.totalSynergyScore}/100，赋予 +${Math.round(dynamicsBonus * 100)}% 团战协同胜率！`);
    }
    initialLogs.push(`第一小局比赛正式拉开序幕...`);
    setWorldsMatchLog(initialLogs);

    let tWins = 0;
    let oWins = 0;

    const interval = setInterval(() => {
      const bootcampBonus = dynasty.remoteBootcamp?.isActive ? (dynasty.remoteBootcamp.tournamentWinRateBonus || 0.16) : 0;
      const scoutingReport = dynasty.opponentScoutingReports?.[selectedOpponent.id];
      const scoutingBonus = scoutingReport ? (scoutingReport.draftTendency?.counterWinRateBonus || 0.12) : 0;
      const dynamicsScore = dynasty.teamDynamics?.totalSynergyScore ?? synergyData.cohesionScore;
      const dynamicsBonus = dynamicsScore >= 90 ? 0.08 : dynamicsScore >= 80 ? 0.04 : 0;
      const winChance = Math.min(0.95, 0.5 + ((teamPower - selectedOpponent.overallPower) * 0.04) + (synergyData.cohesionScore >= 80 ? 0.05 : 0) + bootcampBonus + scoutingBonus + dynamicsBonus);
      const wonGame = Math.random() < winChance;

      if (wonGame) {
        tWins++;
        soundEngine.playVictory();
        const winDetail = dynasty.teamDynamics && dynasty.teamDynamics.totalSynergyScore >= 85 && Math.random() < 0.35
          ? `👥 【小队化学反应爆发】${dynasty.teamDynamics.synergyTitle}！作战小队打出天衣无缝的进场撕扯与毁灭秒杀！`
          : scoutingReport && Math.random() < 0.45
          ? `🎯 【战术克制破局】洞悉 ${selectedOpponent.name} 的 ${scoutingReport.draftTendency.styleTag} 阵容死穴，抓准【${scoutingReport.draftTendency.draftWeakness}】打出零换五完美灭队！`
          : dynasty.remoteBootcamp?.isActive
          ? `🔥 拿下胜局！[${dynasty.remoteBootcamp.locationName}] 7天高强度集训淬炼出的无死角视野拉扯与团战秒杀彻底碾碎对手！`
          : '🔥 恭喜拿下胜局！完美的战术羁绊团战大招配合！';
        setWorldsMatchLog(prev => [...prev, `${winDetail} 系列赛大比分: ${tWins} - ${oWins}`]);
      } else {
        oWins++;
        soundEngine.playDefeat();
        setWorldsMatchLog(prev => [...prev, `💀 遗憾惜败一局！${selectedOpponent.name} 破掉我方主堡。大比分: ${tWins} - ${oWins}`]);
      }

      setSeriesScore({ teamWins: tWins, opponentWins: oWins });

      if (tWins >= 3) {
        clearInterval(interval);
        setIsSimulatingFinals(false);
        setWorldsMatchLog(prev => [
          ...prev,
          `👑 3比${oWins} 斩获世界冠军！金色的雨漫天飞舞！全体起立！你们捧起了属于传奇的召唤师奖杯！`
        ]);
        onWinWorlds();
      } else if (oWins >= 3) {
        clearInterval(interval);
        setIsSimulatingFinals(false);
        setWorldsMatchLog(prev => [
          ...prev,
          `💔 最终总决赛以 ${tWins}比3 遗憾居亚。${selectedOpponent.name} 登顶世界赛。调整战队羁绊与阵容休赛期卷土重来！`
        ]);
      }
    }, 1200);
  };

  return (
    <div className="p-3 sm:p-4 space-y-3 pb-20 select-none animate-fade-in max-w-md mx-auto font-sans">
      {/* Top Tycoon Metric Bar (Includes Fanbase Multiplier from Community Relations) */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-tech text-slate-400 uppercase flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-emerald-400" /> 俱乐部金库
          </span>
          <div className="text-base font-extrabold font-code text-emerald-300">
            ${dynasty.budget.toLocaleString()}
          </div>
        </div>

        <button
          onClick={() => {
            soundEngine.playClick();
            if (onOpenCommunityRelations) onOpenCommunityRelations();
          }}
          className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/30 hover:border-amber-400 text-left transition cursor-pointer group"
          title="点击打开社区公关管理面板"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-tech text-slate-400 uppercase flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" /> 粉丝经济乘数
            </span>
            <span className="text-[9px] font-tech px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold group-hover:scale-105 transition">
              {fanbaseMultiplier.toFixed(2)}x 商业加持
            </span>
          </div>
          <div className="text-base font-extrabold font-code text-amber-300 flex items-center justify-between">
            <span>{dynasty.fanHype.toLocaleString()} 狂热度</span>
            <span className="text-[10px] text-amber-400/80 font-tech">公关运营 →</span>
          </div>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            if (onOpenPowerRankings) onOpenPowerRankings();
          }}
          className="p-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 hover:border-cyan-400 text-left transition cursor-pointer group"
          title="点击查看全球战力百强榜"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-tech text-slate-400 uppercase flex items-center gap-1">
              <Globe2 className="w-3 h-3 text-cyan-400" /> 全球战队实力榜
            </span>
            <span className="text-[9px] text-cyan-400 font-code font-bold">TOP 20 →</span>
          </div>
          <div className="text-base font-extrabold font-code text-cyan-300">
            世界第 #{dynasty.worldRanking} 名
          </div>
        </button>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-tech text-slate-400 uppercase flex items-center gap-1">
              <Zap className="w-3 h-3 text-purple-400" /> 阵容战力 · 默契
            </span>
            <span className="text-[9px] font-tech font-bold text-amber-400">
              {synergyData.cohesionGrade} 级凝聚
            </span>
          </div>
          <div className="text-base font-extrabold font-code text-purple-300 flex items-center justify-between">
            <span>{teamPower} OVR</span>
            <span className="text-xs text-amber-300 font-bold">({synergyData.cohesionScore}分默契)</span>
          </div>
        </div>
      </div>

      {/* Feature Fast Triggers Hub */}
      <div className="grid grid-cols-4 gap-1.5">
        <button
          onClick={() => {
            soundEngine.playClick();
            if (onOpenCommunityRelations) onOpenCommunityRelations();
          }}
          className="p-2 rounded-xl bg-gradient-to-b from-amber-950/40 to-slate-900 border border-amber-500/40 hover:border-amber-400 text-center transition cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5 mx-auto text-amber-400 mb-0.5" />
          <span className="text-[10px] font-tech font-bold text-white block">社区公关</span>
          <span className="text-[8px] text-amber-300">粉丝直播弹幕</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            if (onOpenLifeSim) onOpenLifeSim();
          }}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-center transition cursor-pointer"
        >
          <Home className="w-3.5 h-3.5 mx-auto text-emerald-400 mb-0.5" />
          <span className="text-[10px] font-tech font-bold text-white block">基地日常</span>
          <span className="text-[8px] text-slate-400">生活模拟</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            setIsTeamDynamicsModalOpen(true);
          }}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-center transition cursor-pointer"
        >
          <Network className="w-3.5 h-3.5 mx-auto text-cyan-400 mb-0.5" />
          <span className="text-[10px] font-tech font-bold text-white block">战队羁绊</span>
          <span className="text-[8px] text-cyan-300">小队编制调配</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            if (onOpenLeaderboard) onOpenLeaderboard();
          }}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 text-center transition cursor-pointer"
        >
          <Trophy className="w-3.5 h-3.5 mx-auto text-purple-400 mb-0.5" />
          <span className="text-[10px] font-tech font-bold text-white block">全球百强</span>
          <span className="text-[8px] text-slate-400">豪门奖金榜</span>
        </button>
      </div>

      {/* Long-term Progression Hub: 无尽世界巡回赛 & 名宿殿堂 & 王朝特训营 */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => {
            soundEngine.playClick();
            if (onOpenWorldTour) onOpenWorldTour();
          }}
          className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-950/60 to-slate-900 border border-cyan-500/40 hover:border-cyan-400 text-left transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-xs font-bold font-tech text-white">百层巡回赛</span>
          </div>
          <span className="text-[9px] text-cyan-300 mt-1">挑战四大赛区</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            if (onOpenPrestige) onOpenPrestige();
          }}
          className="p-2.5 rounded-xl bg-gradient-to-r from-amber-950/60 to-slate-900 border border-amber-500/40 hover:border-amber-400 text-left transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-xs font-bold font-tech text-white">名宿声望殿</span>
          </div>
          <span className="text-[9px] text-amber-300 mt-1">转生轮回传承</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            setActiveTab('training_camp');
          }}
          className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-950/70 to-slate-900 border border-indigo-500/50 hover:border-indigo-400 text-left transition cursor-pointer flex flex-col justify-between shadow-sm"
        >
          <div className="flex items-center gap-1.5">
            <Tent className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-xs font-bold font-tech text-white">王朝特训营</span>
          </div>
          <span className="text-[9px] text-indigo-300 mt-1">
            {dynasty.remoteBootcamp?.isActive ? '⛺ 7天封闭特训中' : '$5万 异地封闭营'}
          </span>
        </button>
      </div>

      {/* Phase 3 Tactical Operations: 每日战术特训 & 豪门训练赛模拟器 */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            soundEngine.playClick();
            setIsDailyDrillOpen(true);
          }}
          className="p-2.5 rounded-xl bg-gradient-to-r from-amber-950/50 to-slate-900 border border-amber-500/50 hover:border-amber-400 text-left transition cursor-pointer group shadow-sm flex items-center justify-between"
        >
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-bold font-tech text-white">每日战术特训</span>
              {dynasty.dailyTacticalDrill?.isBuffActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </div>
            <span className="text-[9px] text-amber-300 font-sans block">
              {dynasty.dailyTacticalDrill?.isBuffActive 
                ? '已激活全员 +5% Macro 增益' 
                : '30秒反应测验 · 赢取+5% Macro'}
            </span>
          </div>
          <span className="text-[10px] text-amber-400 font-code font-bold group-hover:translate-x-0.5 transition">
            练 →
          </span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            setIsScrimSimOpen(true);
          }}
          className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-950/50 to-slate-900 border border-indigo-500/50 hover:border-indigo-400 text-left transition cursor-pointer group shadow-sm flex items-center justify-between"
        >
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-bold font-tech text-white">豪门训练赛模拟</span>
            </div>
            <span className="text-[9px] text-indigo-300 font-sans block">
              约战TOP10 · 诊断团战弱点
            </span>
          </div>
          <span className="text-[10px] text-indigo-400 font-code font-bold group-hover:translate-x-0.5 transition">
            约战 →
          </span>
        </button>
      </div>

      {/* 3D Trophy Hall Ring Showcase Teaser Banner */}
      <div 
        onClick={() => {
          soundEngine.playClick();
          setActiveTab('trophy_hall');
        }}
        className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-purple-950/60 border-2 border-amber-500/50 hover:border-amber-400 cursor-pointer transition shadow-[0_0_30px_rgba(245,158,11,0.2)] flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 p-0.5 shadow-[0_0_15px_rgba(245,158,11,0.5)] group-hover:scale-105 transition shrink-0">
            <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center text-amber-300">
              <Crown className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-tech font-extrabold text-white text-xs sm:text-sm tracking-wide">
                3D 荣誉戒殿 · 世界赛至尊钻戒展
              </h4>
              <span className="text-[9px] px-1.5 py-0.2 rounded font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 font-code">
                {dynasty.unlockedRings?.length ?? 1} / 6 枚加冕
              </span>
            </div>
            <p className="text-[10px] text-slate-300 font-sans">
              3D 悬浮透视陈列 · 镌刻五虎阵容名单与传世铭文 · 赋予全队大心脏加成
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-tech font-bold text-amber-400 group-hover:translate-x-1 transition shrink-0">
          <span>进入戒殿</span>
          <span>→</span>
        </div>
      </div>

      {/* Annual League Expansion Draft Event Banner (年度联赛扩军选秀与保护大会) */}
      <div 
        onClick={() => {
          soundEngine.playClick();
          setIsExpansionDraftOpen(true);
        }}
        className="p-3 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-amber-950/70 border-2 border-cyan-500/50 hover:border-cyan-400 cursor-pointer transition shadow-[0_0_30px_rgba(6,182,212,0.2)] flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.5)] group-hover:scale-105 transition shrink-0">
            <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center text-cyan-300">
              <Target className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-tech font-extrabold text-white text-xs sm:text-sm tracking-wide">
                年度联赛扩军选秀 · 核心阵容保护与淘金
              </h4>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-black font-code border ${
                dynasty.expansionDraftState?.isDraftAvailable ?? true
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {dynasty.expansionDraftState?.isDraftAvailable ?? true ? '选秀已开放 🔥' : `${dynasty.expansionDraftState?.currentYear || 2026} 赛季`}
              </span>
            </div>
            <p className="text-[10px] text-slate-300 font-sans">
              锁定3名绝对建队核心 · 签约天梯1700分路人王/绝活哥弥补战术断层 · 获$60,000扶持金
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-tech font-bold text-cyan-400 group-hover:translate-x-1 transition shrink-0">
          <span>进入选秀</span>
          <span>→</span>
        </div>
      </div>

      {/* Horizontal Sub-Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {[
          { id: 'roster', label: '首发阵容 & 战术羁绊', icon: Users },
          { id: 'coaching', label: '教练组 👔', icon: Briefcase },
          { id: 'training_camp', label: '集训营 ⛺', icon: Tent },
          { id: 'infrastructure', label: '基地基建 🏗️', icon: Building2 },
          { id: 'sponsors', label: '商业赞助 (粉丝倍率)', icon: DollarSign },
          { id: 'scout', label: '全球星探', icon: Sparkles },
          { id: 'trophy_hall', label: '3D荣誉戒殿 💍', icon: Crown },
          { id: 'worlds', label: '全球总决赛 🏆', icon: Trophy }
        ].map(tab => {
          const Icon = tab.icon;
          const isCurrentTab = activeTab === tab.id || (tab.id === 'infrastructure' && activeTab === 'facilities');
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundEngine.playClick();
                setActiveTab(tab.id as typeof activeTab);
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-tech font-bold uppercase cursor-pointer transition whitespace-nowrap flex items-center justify-center gap-1 ${
                isCurrentTab
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-slate-900 text-slate-400'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. ROSTER TAB WITH EMBEDDED SYNERGY VISUALIZER */}
      {activeTab === 'roster' && (
        <div className="space-y-3">
          {/* Sub-view Switch: Team Dynamics (作战小队协同编制) vs Playstyle Network (风格羁绊全景网) */}
          <div className="p-1.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-tech text-slate-400 pl-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>战队协同与队员默契系统:</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setRosterViewMode('dynamics');
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-tech font-bold cursor-pointer transition flex items-center gap-1 ${
                  rosterViewMode === 'dynamics'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Crosshair className="w-3 h-3" />
                <span>作战小队编制 (Team Dynamics)</span>
              </button>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setRosterViewMode('network');
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-tech font-bold cursor-pointer transition flex items-center gap-1 ${
                  rosterViewMode === 'network'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Network className="w-3 h-3" />
                <span>风格连携网 (Playstyle Network)</span>
              </button>
            </div>
          </div>

          {rosterViewMode === 'dynamics' ? (
            <TeamDynamicsSection
              dynasty={dynasty}
              onUpdateDynasty={onUpdateDynasty}
            />
          ) : (
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-cyan-500/40 shadow-2xl relative overflow-hidden space-y-2.5">
            {/* Header: Cohesion Metric & Grade */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                  <Network className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-tech font-extrabold text-white text-xs tracking-wide">
                      战队协同网络 · 风格羁绊连携
                    </h4>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-tech font-black bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-sm">
                      {synergyData.cohesionGrade} 级
                    </span>
                  </div>
                  <p className="text-[10px] text-cyan-300 font-tech">
                    {synergyData.cohesionTitle} · 凝聚力评分: <span className="font-code font-bold text-white">{synergyData.cohesionScore}</span> / 100
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[9px] font-code text-slate-400 block">共鸣羁绊链</span>
                <span className="text-xs font-code font-black text-amber-400">
                  {synergyData.totalBonds} 组连携
                </span>
              </div>
            </div>

            {/* Tactical Buff Notification */}
            <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2 text-[10px] text-slate-300">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-tech leading-snug">{synergyData.cohesionBuff}</span>
            </div>

            {/* Quick Franchise Protection Bar for Annual Expansion Draft */}
            <div className="p-2 rounded-xl bg-slate-950/80 border border-cyan-500/30 flex items-center justify-between gap-2 text-[10px]">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  联赛扩军保护: <b className="text-amber-400 font-code font-bold">3名核心免拆保护权</b>
                </span>
              </div>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setIsExpansionDraftOpen(true);
                }}
                className="px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-tech font-bold text-[9px] cursor-pointer transition flex items-center gap-1"
              >
                <span>进入扩军选秀</span>
                <span>→</span>
              </button>
            </div>

            {/* Quick Coaching Staff Passive Aura Bar */}
            <div className="p-2 rounded-xl bg-slate-950/80 border border-indigo-500/30 flex items-center justify-between gap-2 text-[10px]">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Briefcase className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>
                  教练智囊团光环: {coachingBonuses.mechanics > 0 || coachingBonuses.macro > 0 || coachingBonuses.morale > 0 ? (
                    <span className="font-code font-bold text-cyan-300">
                      +{coachingBonuses.mechanics}微操 · +{coachingBonuses.macro}大局 · +{coachingBonuses.morale}士气
                    </span>
                  ) : (
                    <span className="text-slate-500">尚未聘用专精教练</span>
                  )}
                </span>
              </div>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setActiveTab('coaching');
                }}
                className="px-2 py-0.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 font-tech font-bold text-[9px] cursor-pointer transition flex items-center gap-1"
              >
                <span>配置教练组</span>
                <span>→</span>
              </button>
            </div>

            {/* Playstyle Trait Selector Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedPlaystyleFilter('ALL');
                  setFocusedPlayerId(null);
                }}
                className={`px-2 py-0.5 rounded-full text-[9px] font-tech font-bold cursor-pointer transition shrink-0 border ${
                  selectedPlaystyleFilter === 'ALL'
                    ? 'bg-white text-slate-950 border-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-600'
                }`}
              >
                全部风格 ({dynasty.roster.length}人)
              </button>

              {(Object.keys(PLAYSTYLE_CONFIG) as PlayerPlaystyle[]).map(ps => {
                const conf = PLAYSTYLE_CONFIG[ps];
                const count = synergyData.playstyleCounts[ps].length;
                const isSelected = selectedPlaystyleFilter === ps;

                return (
                  <button
                    key={ps}
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedPlaystyleFilter(isSelected ? 'ALL' : ps);
                      setFocusedPlayerId(null);
                    }}
                    className={`px-2 py-0.5 rounded-full text-[9px] font-tech font-bold cursor-pointer transition shrink-0 border flex items-center gap-1 ${
                      isSelected
                        ? `${conf.badgeBg} ${conf.badgeText} ${conf.badgeBorder} shadow-[0_0_8px_${conf.neonGlow}]`
                        : count >= 2
                        ? 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-500'
                        : 'bg-slate-950/40 text-slate-500 border-slate-800'
                    }`}
                  >
                    <span>{conf.icon}</span>
                    <span>{conf.label}</span>
                    <span className="px-1 rounded-full bg-slate-900 text-[8px] font-code">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Interactive Tactical Formation Canvas with Neon Connecting Lines */}
            <div className="relative w-full h-44 bg-slate-950/90 rounded-xl border border-slate-800 overflow-hidden select-none">
              {/* Summoner's Rift Map Tactical Grid Lines */}
              <div className="absolute inset-0 opacity-15 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  {/* Diagonal River & Lane hints */}
                  <line x1="0" y1="170" x2="320" y2="0" stroke="#00f0ff" strokeWidth="1" strokeDasharray="3 3" />
                  <circle cx="160" cy="85" r="30" stroke="#ffd700" strokeWidth="0.8" fill="none" strokeDasharray="2 2" />
                </svg>
              </div>

              {/* Connecting Neon Lines SVG Layer */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 320 170" preserveAspectRatio="none">
                <defs>
                  {/* Neon Glow Filters */}
                  <filter id="neon-glow-amber" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#F59E0B" floodOpacity="0.9" />
                  </filter>
                  <filter id="neon-glow-cyan" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#00F0FF" floodOpacity="0.9" />
                  </filter>
                  <filter id="neon-glow-fuchsia" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#D946EF" floodOpacity="0.9" />
                  </filter>
                  <filter id="neon-glow-emerald" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#10B981" floodOpacity="0.9" />
                  </filter>
                </defs>

                {synergyData.neonLines.map(line => {
                  const filterId = line.playstyle === 'Aggressive' 
                    ? 'url(#neon-glow-amber)'
                    : line.playstyle === 'Macro-Oriented'
                    ? 'url(#neon-glow-cyan)'
                    : line.playstyle === 'Clutch'
                    ? 'url(#neon-glow-fuchsia)'
                    : 'url(#neon-glow-emerald)';

                  return (
                    <g key={line.id}>
                      {/* Outer Neon Glow Beam */}
                      <line
                        x1={line.p1Pos.x}
                        y1={line.p1Pos.y}
                        x2={line.p2Pos.x}
                        y2={line.p2Pos.y}
                        stroke={line.neonColor}
                        strokeWidth={line.active ? 4 : 1.5}
                        strokeOpacity={line.active ? 0.35 : 0.08}
                        filter={line.active ? filterId : undefined}
                      />
                      {/* Inner High-Intensity Laser Line */}
                      <line
                        x1={line.p1Pos.x}
                        y1={line.p1Pos.y}
                        x2={line.p2Pos.x}
                        y2={line.p2Pos.y}
                        stroke={line.neonColor}
                        strokeWidth={line.active ? 2 : 1}
                        strokeOpacity={line.active ? 0.95 : 0.2}
                        strokeDasharray={line.active ? "6 3" : "3 3"}
                        className={line.active ? "animate-pulse" : ""}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Tactical Nodes: 5 Players placed on formation coordinates */}
              {dynasty.roster.map(player => {
                const pos = FORMATION_POSITIONS[player.role] || { x: 50, y: 50, label: player.role };
                const ps: PlayerPlaystyle = player.playstyle || 'Aggressive';
                const conf = PLAYSTYLE_CONFIG[ps];
                const isFocused = focusedPlayerId === player.id;
                const isMatchingFilter = selectedPlaystyleFilter === 'ALL' || selectedPlaystyleFilter === ps;

                // Percent coordinates for HTML absolute placement
                const leftPct = (pos.x / 320) * 100;
                const topPct = (pos.y / 170) * 100;

                return (
                  <div
                    key={player.id}
                    onClick={() => {
                      soundEngine.playClick();
                      setFocusedPlayerId(isFocused ? null : player.id);
                      setSelectedPlaystyleFilter(ps);
                    }}
                    style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer transition-all duration-200 group flex flex-col items-center ${
                      isMatchingFilter ? 'opacity-100 scale-100' : 'opacity-40 scale-95'
                    }`}
                  >
                    {/* Node Avatar Circle with Neon Ring */}
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition shadow-lg relative ${
                        isFocused
                          ? 'ring-2 ring-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.7)]'
                          : `ring-2 ring-[${conf.neonColor}]`
                      }`}
                      style={{
                        backgroundColor: '#090d16',
                        borderColor: conf.neonColor,
                        boxShadow: `0 0 10px ${conf.neonGlow}`
                      }}
                    >
                      <span className="text-base select-none">{player.avatar}</span>
                      {/* Position Tag on Top Edge */}
                      <span className="absolute -top-1.5 -right-1 px-1 rounded text-[7px] font-code font-bold bg-slate-900 border border-slate-700 text-slate-200">
                        {pos.label}
                      </span>
                    </div>

                    {/* Compact Label */}
                    <div className="mt-0.5 text-center whitespace-nowrap">
                      <div className="text-[9px] font-tech font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
                        {player.name}
                      </div>
                      <div 
                        className="text-[8px] font-tech font-semibold flex items-center justify-center gap-0.5"
                        style={{ color: conf.neonColor }}
                      >
                        <span>{conf.icon}</span>
                        <span>{conf.label}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Synergy Detail Card */}
            {selectedPlaystyleFilter !== 'ALL' && (
              <div 
                className="p-2.5 rounded-xl border space-y-1 text-xs animate-fadeIn"
                style={{
                  backgroundColor: 'rgba(10, 14, 23, 0.9)',
                  borderColor: PLAYSTYLE_CONFIG[selectedPlaystyleFilter].neonColor
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-tech font-bold text-white flex items-center gap-1.5">
                    <span>{PLAYSTYLE_CONFIG[selectedPlaystyleFilter].icon}</span>
                    <span>{PLAYSTYLE_CONFIG[selectedPlaystyleFilter].label} ({selectedPlaystyleFilter})</span>
                    <span className="text-[10px] text-slate-400">
                      • 共 {synergyData.playstyleCounts[selectedPlaystyleFilter].length} 人联动
                    </span>
                  </span>
                  <span 
                    className="text-[10px] font-code font-bold"
                    style={{ color: PLAYSTYLE_CONFIG[selectedPlaystyleFilter].neonColor }}
                  >
                    已激活霓虹羁绊
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 font-sans leading-relaxed">
                  {PLAYSTYLE_CONFIG[selectedPlaystyleFilter].description}
                </p>
                <div className="text-[10px] font-tech text-amber-300 pt-0.5 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>战术增益: {PLAYSTYLE_CONFIG[selectedPlaystyleFilter].tacticalBuff}</span>
                </div>
              </div>
            )}
          </div>
        )}

          {/* Salary Cap Status Bar & Contract Buyout Protocol Banner */}
          {(() => {
            const salaryCap = dynasty.salaryCapRules || {
              softCap: 70000,
              hardCap: 95000,
              luxuryTaxRate: 1.5,
              agencyFeeRate: 0.10,
              luxuryTaxPaidTotal: 0
            };
            const currentWeeklyPayroll = dynasty.roster.reduce((acc, p) => acc + (p.salary || 10000), 0);
            const isOverSoftCap = currentWeeklyPayroll > salaryCap.softCap;
            const isOverHardCap = currentWeeklyPayroll >= salaryCap.hardCap;
            const excessPayroll = Math.max(0, currentWeeklyPayroll - salaryCap.softCap);
            const currentWeeklyLuxuryTax = Math.round(excessPayroll * salaryCap.luxuryTaxRate);

            return (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border border-amber-500/40 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                      <Scale className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-tech font-bold text-white text-xs">
                          劳资协议工资帽监控 (Salary Cap)
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[8px] font-tech font-bold border ${
                          isOverHardCap
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : isOverSoftCap
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        }`}>
                          {isOverHardCap ? '🚨 突破硬帽' : isOverSoftCap ? '⚠️ 征奢侈税' : '✅ 预算健康'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-300 font-tech">
                        全队周薪: <strong className="text-cyan-300 font-code">${currentWeeklyPayroll.toLocaleString()}</strong> / 软帽 ${salaryCap.softCap.toLocaleString()} · 硬帽 ${salaryCap.hardCap.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      setIsContractBuyoutOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-tech font-extrabold text-[10px] cursor-pointer shadow transition shrink-0 flex items-center gap-1"
                  >
                    <Briefcase className="w-3 h-3" />
                    <span>薪资与买断</span>
                  </button>
                </div>

                {/* Visual bar */}
                <div className="space-y-1">
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isOverHardCap ? 'bg-rose-500' : isOverSoftCap ? 'bg-amber-500' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.min(100, Math.round((currentWeeklyPayroll / salaryCap.hardCap) * 100))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[8px] text-slate-400 font-tech">
                    <span>转会代扣 10% 经纪佣金</span>
                    {isOverSoftCap && (
                      <span className="text-amber-300">
                        每周代扣奢侈税: +${currentWeeklyLuxuryTax.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Roster Cards List */}
          <div className="space-y-2">
            {dynasty.roster.map(player => {
              const ps: PlayerPlaystyle = player.playstyle || 'Aggressive';
              const conf = PLAYSTYLE_CONFIG[ps];
              const matchingTeammates = dynasty.roster.filter(p => p.id !== player.id && (p.playstyle || 'Aggressive') === ps);

              return (
                <div 
                  key={player.id} 
                  className={`p-2.5 rounded-xl bg-slate-900 border transition flex items-center justify-between gap-2.5 ${
                    focusedPlayerId === player.id 
                      ? 'border-amber-400/80 shadow-md bg-slate-850'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{player.avatar}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-tech font-bold text-white">{player.name}</span>
                        <span className="px-1 py-0.2 rounded text-[9px] font-code font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                          {player.role}
                        </span>
                        {/* Playstyle Trait Badge */}
                        <span 
                          className={`px-1.5 py-0.2 rounded text-[8px] font-tech font-bold border flex items-center gap-0.5 ${conf.badgeBg} ${conf.badgeText} ${conf.badgeBorder}`}
                        >
                          <span>{conf.icon}</span>
                          <span>{conf.label}</span>
                        </span>

                        {/* Active Timed Training Boost Badge */}
                        {player.trainingBoost && player.trainingBoost.daysRemaining > 0 && (
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-tech font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-0.5">
                            <span>🏋️</span>
                            <span>+{player.trainingBoost.boostAmount} {player.trainingBoost.stat === 'mechanics' ? '微操' : player.trainingBoost.stat === 'macro' ? '大局' : '士气'} ({player.trainingBoost.daysRemaining}天)</span>
                          </span>
                        )}

                        {/* Active Passive Coaching Staff Bonus Badge */}
                        {(coachingBonuses.mechanics > 0 || coachingBonuses.macro > 0 || coachingBonuses.morale > 0) && (
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-tech font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-0.5" title="受战队教练智囊团常驻被动光环庇佑">
                            <span>👔</span>
                            <span>+{coachingBonuses.mechanics}微操 · +{coachingBonuses.macro}大局</span>
                          </span>
                        )}

                        {/* Active Permanent Infrastructure Gaming House Buff Badge */}
                        {(dynasty.infrastructureStats?.totalPermanentMoraleBonus ?? 0) > 0 && (
                          <span 
                            className="px-1.5 py-0.2 rounded text-[8px] font-tech font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-0.5" 
                            title={`受豪门基地基础设施 (${dynasty.infrastructureStats?.facilityGradeLabel}) 庇佑：永久士气底限 +${dynasty.infrastructureStats?.totalPermanentMoraleBonus}%，疲劳恢复速率 +${dynasty.infrastructureStats?.totalRecoverySpeedMultiplier}%`}
                          >
                            <span>🏗️</span>
                            <span>+{dynasty.infrastructureStats?.totalPermanentMoraleBonus}%基建士气</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                        {matchingTeammates.length > 0 ? (
                          <span className="text-cyan-400 font-tech">
                            ⚡ 与 {matchingTeammates.map(m => m.name).join('、')} 形成羁绊 (+{matchingTeammates.length * 6} 默契)
                          </span>
                        ) : (
                          <span className="text-slate-500 font-tech">单兵作战风格 (未连携)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-[10px] font-code shrink-0 flex items-center gap-1.5">
                    <div>
                      <div className="text-cyan-400 font-bold">
                        {player.mechanics + coachingBonuses.mechanics} 操作
                        {coachingBonuses.mechanics > 0 && <span className="text-[8px] text-emerald-400 font-bold ml-0.5">(+{coachingBonuses.mechanics})</span>}
                      </div>
                      <div className="text-emerald-400 font-semibold">
                        {Math.min(100, player.morale + coachingBonuses.morale)}% 士气
                      </div>
                    </div>
                    {/* Small Quick Train Button (一键速训提升士气) */}
                    <button
                      onClick={(e) => handleQuickTrainMorale(player, e)}
                      disabled={dynasty.budget < 5000 || player.morale >= 100}
                      className={`px-2 py-1 rounded-lg text-[9px] font-tech font-bold cursor-pointer transition flex items-center gap-0.5 border ${
                        player.morale >= 100
                          ? 'bg-slate-800/60 text-slate-500 border-slate-700 cursor-default'
                          : dynasty.budget < 5000
                          ? 'bg-slate-900 text-slate-500 border-slate-800 cursor-not-allowed'
                          : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40 hover:border-emerald-400 shadow-sm'
                      }`}
                      title={player.morale >= 100 ? '士气已达100%满值' : '一键速训: 消耗 $5,000 注入 +5% 士气'}
                    >
                      <Flame className="w-2.5 h-2.5 text-emerald-400" />
                      <span>速训</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        soundEngine.playClick();
                        setTargetBuyoutPlayer(player);
                        setIsContractBuyoutOpen(true);
                      }}
                      className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[9px] font-tech font-bold cursor-pointer transition flex items-center gap-0.5"
                      title={`查阅 ${player.name} 劳资合同、所属经纪公司与买断条款`}
                    >
                      <Briefcase className="w-2.5 h-2.5" />
                      <span>合同</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        soundEngine.playClick();
                        setIsTrainingCampOpen(true);
                      }}
                      className="px-2 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-[9px] font-tech font-bold cursor-pointer transition flex items-center gap-0.5"
                      title="打开王朝封闭特训营 (7天定向微操/大局观增益)"
                    >
                      <Dumbbell className="w-2.5 h-2.5" />
                      <span>特训营</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. INFRASTRUCTURE & GAMING HOUSE TAB (万兆光纤、人体工学座舱、星级私厨与永久士气/恢复倍率) */}
      {(activeTab === 'infrastructure' || activeTab === 'facilities') && (
        <InfrastructureTabView
          dynasty={dynasty}
          onUpdateDynasty={onUpdateDynasty}
          onGoToRoster={() => setActiveTab('roster')}
        />
      )}

      {/* 3. SPONSORS TAB WITH FANBASE MULTIPLIER BOOST */}
      {activeTab === 'sponsors' && (
        <div className="space-y-2.5">
          {/* Fanbase Multiplier Banner */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border border-amber-500/40 flex items-center justify-between">
            <div>
              <div className="text-xs font-tech font-bold text-amber-400 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                社区公关 · 粉丝经济赞助乘数: {fanbaseMultiplier.toFixed(2)}x
              </div>
              <div className="text-[10px] text-slate-300 mt-0.5">
                所有签约金与每周赞助金均已享受 {(fanbaseMultiplier).toFixed(2)}x 社区公关加成！
              </div>
            </div>
            {onOpenCommunityRelations && (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onOpenCommunityRelations();
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-tech font-bold text-[10px] shrink-0 cursor-pointer shadow-md"
              >
                公关运营 →
              </button>
            )}
          </div>

          {/* Peripheral Brand Sponsorship Manager Hub (外设品牌商业谈判：机械键鼠、电竞座驾、功能饮品、竞技耳机) */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-950 via-amber-950/40 to-slate-950 border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                  <Handshake className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-tech font-extrabold text-white text-xs tracking-wide">
                      外设品牌赞助商务签约 (Sponsorship Manager)
                    </h4>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      粉丝里程碑分成
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-300 font-sans block mt-0.5">
                    与雷蛇、傲风、红牛等外设品牌谈判对赌条款，锁定每月被动流水与专属战术特权！
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setIsSponsorshipManagerOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-tech font-extrabold text-[10px] transition cursor-pointer shadow-md shadow-amber-500/25 shrink-0 flex items-center gap-1 active:scale-95"
                title="开启外设商务谈判桌"
              >
                <span>谈判签约</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Status Bar for Peripheral Slots */}
            <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="text-base">⌨️</span>
                <div className="truncate">
                  <span className="text-slate-400 text-[9px] block">机械键鼠</span>
                  <span className={`font-bold truncate ${dynasty.peripheralSponsorships?.signedBrands?.KEYBOARD ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {dynasty.peripheralSponsorships?.signedBrands?.KEYBOARD?.brandName || '待签约'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-base">🪑</span>
                <div className="truncate">
                  <span className="text-slate-400 text-[9px] block">电竞座驾</span>
                  <span className={`font-bold truncate ${dynasty.peripheralSponsorships?.signedBrands?.CHAIR ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {dynasty.peripheralSponsorships?.signedBrands?.CHAIR?.brandName || '待签约'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-base">⚡</span>
                <div className="truncate">
                  <span className="text-slate-400 text-[9px] block">功能饮品</span>
                  <span className={`font-bold truncate ${dynasty.peripheralSponsorships?.signedBrands?.ENERGY_DRINK ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {dynasty.peripheralSponsorships?.signedBrands?.ENERGY_DRINK?.brandName || '待签约'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-base">🎧</span>
                <div className="truncate">
                  <span className="text-slate-400 text-[9px] block">竞技耳机</span>
                  <span className={`font-bold truncate ${dynasty.peripheralSponsorships?.signedBrands?.HEADSET ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {dynasty.peripheralSponsorships?.signedBrands?.HEADSET?.brandName || '待签约'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {SPONSORS_CATALOG.map(sp => {
            const isSigned = dynasty.activeSponsors.some(s => s.id === sp.id);
            const boostedPayout = Math.round(sp.weeklyPayout * fanbaseMultiplier);
            const boostedBonus = Math.round(sp.signingBonus * fanbaseMultiplier);

            return (
              <div key={sp.id} className={`p-3 rounded-xl border space-y-2 ${isSigned ? 'bg-slate-900/40 border-emerald-500/40' : 'bg-slate-900 border-slate-800'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{sp.logo}</span>
                    <div>
                      <h5 className="font-tech font-bold text-white text-xs">{sp.name}</h5>
                      <span className="text-[9px] text-slate-400">{sp.brand}</span>
                    </div>
                  </div>
                  <div className="text-right text-[10px] font-code">
                    <div className="text-emerald-400 font-bold">
                      +${boostedPayout.toLocaleString()}/周
                    </div>
                    <div className="text-amber-300">
                      +${boostedBonus.toLocaleString()} 签约金
                    </div>
                  </div>
                </div>

                <button
                  disabled={isSigned}
                  onClick={() => handleSignSponsor(sp)}
                  className={`w-full py-2 rounded-lg text-[10px] font-tech font-bold uppercase transition cursor-pointer ${
                    isSigned
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 cursor-default'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  }`}
                >
                  {isSigned ? '赞助合约生效中 ✓' : `签署商业赞助 (含 ${fanbaseMultiplier.toFixed(2)}x 粉丝加成)`}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. SCOUTING TAB */}
      {activeTab === 'scout' && (
        <div className="space-y-2.5">
          {onOpenGacha && (
            <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-amber-950/40 border border-cyan-500/40 flex items-center justify-between">
              <div>
                <div className="text-xs font-tech font-bold text-[#00f0ff] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> 全球星探 · S14 极光限定池
                </div>
                <div className="text-[10px] text-slate-400">
                  招募 SSS 级神级中单 VORTEX (99 OVR 满级神之领域)
                </div>
              </div>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onOpenGacha();
                }}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 text-[10px] font-tech font-extrabold cursor-pointer hover:brightness-110 shrink-0"
              >
                前往抽卡招募 →
              </button>
            </div>
          )}

          {/* League Expansion Draft Spotlight in Scout Tab */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-indigo-950/60 border border-amber-500/40 flex items-center justify-between">
            <div>
              <div className="text-xs font-tech font-bold text-amber-400 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span>年度联赛扩军选秀 · 路人王淘宝淘金</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-code font-bold">
                  {dynasty.expansionDraftState?.currentYear || 2026} 赛季
                </span>
              </div>
              <div className="text-[10px] text-slate-300 mt-0.5">
                保护3名核心基石，选秀签约1名韩服千分/峡谷巅峰神童新秀入队！
              </div>
            </div>
            <button
              onClick={() => {
                soundEngine.playClick();
                setIsExpansionDraftOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-[10px] font-tech font-extrabold cursor-pointer hover:brightness-110 shrink-0 shadow-md flex items-center gap-1"
            >
              <span>开启选秀</span>
              <span>→</span>
            </button>
          </div>

          {SCOUTING_POOL.map(player => (
            <div key={player.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{player.avatar}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-tech font-bold text-white text-xs">{player.name}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-purple-950 text-purple-300 font-bold">{player.role}</span>
                    {player.playstyle && (
                      <span className="text-[8px] px-1 rounded bg-slate-800 text-amber-300 font-tech">
                        {PLAYSTYLE_CONFIG[player.playstyle]?.label || player.playstyle}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans">
                    {player.country} • {player.mechanics} 操作评分
                  </div>
                </div>
              </div>

              <div className="text-right space-y-1 shrink-0">
                <div className="text-[9px] font-code text-slate-400">
                  原俱乐部: ${player.marketValue.toLocaleString()}
                  <span className="text-amber-300 block">+10% 经纪佣金: ${Math.round(player.marketValue * 0.10).toLocaleString()}</span>
                </div>
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setTargetBuyoutPlayer(player);
                    setIsContractBuyoutOpen(true);
                  }}
                  className="py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-tech font-extrabold text-[10px] uppercase cursor-pointer shadow flex items-center gap-1"
                >
                  <Briefcase className="w-3 h-3" />
                  <span>核算买断 ${(Math.round(player.marketValue * 1.10)).toLocaleString()}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* COACHING STAFF TAB (专精教练智囊团与首发被动增益) */}
      {activeTab === 'coaching' && (
        <CoachingStaffSection
          dynasty={dynasty}
          onUpdateDynasty={onUpdateDynasty}
          onOpenScoutingReport={() => {
            setScoutingTargetOpponent(selectedOpponent);
            setIsScoutReportModalOpen(true);
          }}
        />
      )}

      {/* TRAINING CAMP TAB (7-DAY REMOTE BOOTCAMP & TOURNAMENT PERFORMANCE BOOST) */}
      {activeTab === 'training_camp' && (
        <TrainingCampTabView
          dynasty={dynasty}
          onUpdateDynasty={onUpdateDynasty}
          onGoToWorlds={() => setActiveTab('worlds')}
        />
      )}

      {/* 5. WORLDS GRAND FINALS TAB (WITH LIVE MATCH DANMAKU STREAM) */}
      {activeTab === 'worlds' && (
        <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-tech font-bold uppercase text-amber-400 flex items-center gap-1">
              <Crown className="w-3.5 h-3.5" /> 世界赛总决赛 BO5 巅峰对决
            </span>
            <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1 rounded-lg border border-amber-500/30 text-xs font-code font-bold">
              <span className="text-cyan-400">{seriesScore.teamWins}</span>
              <span className="text-slate-500">-</span>
              <span className="text-rose-400">{seriesScore.opponentWins}</span>
            </div>
          </div>

          {/* Active Remote Bootcamp Major Tournament Buff Banner */}
          {dynasty.remoteBootcamp?.isActive && (
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-amber-950/70 border border-emerald-400/70 flex items-center justify-between text-xs animate-pulse">
              <div className="flex items-center gap-2">
                <span className="text-xl">{dynasty.remoteBootcamp.locationEmoji}</span>
                <div>
                  <div className="flex items-center gap-1.5 font-tech font-bold text-emerald-300">
                    <span>异地封闭集训成果生效中</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-code font-black">
                      +{Math.round(dynasty.remoteBootcamp.tournamentWinRateBonus * 100)}% 决胜胜率
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-300 font-sans">
                    {dynasty.remoteBootcamp.locationName} · 全员注入 +{dynasty.remoteBootcamp.mechanicsBonus} 微操 / +{dynasty.remoteBootcamp.macroBonus} 大局观！
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setActiveTab('training_camp');
                }}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 font-tech font-bold shrink-0 ml-1 cursor-pointer"
              >
                特训营 →
              </button>
            </div>
          )}

          {/* Select Opponent */}
          <div className="grid grid-cols-2 gap-1.5">
            {WORLDS_OPPONENTS.map(opp => (
              <button
                key={opp.id}
                disabled={isSimulatingFinals}
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedOpponent(opp);
                }}
                className={`p-2 rounded-lg border text-left cursor-pointer transition ${
                  selectedOpponent.id === opp.id
                    ? 'bg-amber-950/40 border-amber-400 shadow-sm'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span>{opp.logo}</span>
                  <span className="text-[9px] font-code font-bold text-amber-400">{opp.overallPower} 战力</span>
                </div>
                <div className="text-[11px] font-tech font-bold text-white truncate">{opp.name}</div>
              </button>
            ))}
          </div>

          {/* Opponent Scouting Report & Draft Tendency Intelligence Card */}
          {(() => {
            const currentScoutingReport = dynasty.opponentScoutingReports?.[selectedOpponent.id];
            return (
              <div className={`p-3 rounded-2xl border transition ${
                currentScoutingReport 
                  ? 'bg-gradient-to-r from-cyan-950/70 via-slate-900 to-indigo-950/70 border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                  : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm border shrink-0 ${
                      currentScoutingReport 
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      <Crosshair className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-tech font-bold text-white text-xs">
                          {selectedOpponent.name} · 战术侦察研判
                        </h5>
                        <span className={`text-[8px] px-1.5 py-0.2 rounded font-bold font-code border ${
                          currentScoutingReport 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          {currentScoutingReport ? 'BP倾向已洞悉 ✓' : '待指派教练研判 ❓'}
                        </span>
                      </div>
                      {currentScoutingReport ? (
                        <p className="text-[10px] text-cyan-300 font-sans mt-0.5">
                          核心风格: <span className="font-tech font-bold text-amber-300">{currentScoutingReport.draftTendency.compStyleLabel}</span> ({currentScoutingReport.draftTendency.styleTag}) • 主讲教练: {currentScoutingReport.assignedCoachName}
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                          指派教练进行深度沙盘研判，揭秘其阵容偏好（强开团/后期大核）与阵型软肋！
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      setScoutingTargetOpponent(selectedOpponent);
                      setIsScoutReportModalOpen(true);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl font-tech font-bold text-[10px] transition cursor-pointer flex items-center gap-1 shrink-0 ml-2 ${
                      currentScoutingReport
                        ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 shadow-md font-extrabold'
                    }`}
                  >
                    <Search className="w-3 h-3" />
                    <span>{currentScoutingReport ? '查阅战术沙盘' : '指派教练研判 ($5,000)'}</span>
                  </button>
                </div>

                {currentScoutingReport && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[9px] font-sans">
                    <div className="text-slate-300 truncate mr-2">
                      🛡️ <span className="text-slate-400">阵容软肋:</span> {currentScoutingReport.draftTendency.draftWeakness}
                    </div>
                    <span className="text-emerald-400 font-code font-bold shrink-0">
                      +{Math.round(currentScoutingReport.draftTendency.counterWinRateBonus * 100)}% 决胜胜率
                    </span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Live Match Danmaku Chat Simulation Layer */}
          <div className="relative rounded-xl border border-indigo-500/40 bg-slate-950/80 overflow-hidden">
            <div className="px-3 py-1.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-[10px] font-tech">
              <div className="flex items-center gap-1.5 text-cyan-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold">全球总决赛官方赛事直播间 · 实时弹幕</span>
              </div>
              <span className="text-slate-400 font-code">在线人气: 6,842,000</span>
            </div>

            <LiveMatchDanmaku
              active={true}
              showInput={true}
              maxLanes={3}
              className="h-20"
              extraStrings={[
                '666',
                'This play is insane!',
                'Report Top Diff',
                '全体起立！！！',
                '金色的雨准备就绪！',
                '通天代实锤！',
                '这大招配合太离谱了！',
                '77777777777',
                '这就是世界第一战队的默契！'
              ]}
            />
          </div>

          {/* Match Logs Feed */}
          {worldsMatchLog.length > 0 && (
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1 max-h-36 overflow-y-auto text-[10px] font-sans">
              {worldsMatchLog.map((log, i) => (
                <div key={i} className="text-slate-200">{log}</div>
              ))}
            </div>
          )}

          {/* Big Finals Button */}
          <button
            disabled={isSimulatingFinals}
            onClick={startWorldsFinalsSeries}
            className={`w-full py-3 rounded-xl font-tech font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-lg chamfer-btn ${
              isSimulatingFinals
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-amber-500/25 active:scale-98'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>{isSimulatingFinals ? '正在模拟 BO5 决战进程...' : `迎战 ${selectedOpponent.name} (争夺召唤师杯)`}</span>
          </button>
        </div>
      )}

      {/* 6. TROPHY HALL TAB (3D WORLD CHAMPIONSHIP RINGS SHOWCASE) */}
      {activeTab === 'trophy_hall' && (
        <TrophyHallShowcase
          dynasty={dynasty}
          onUpdateDynasty={onUpdateDynasty}
        />
      )}

      {/* Dynasty Training Camp Modal */}
      <DynastyTrainingCampModal
        isOpen={isTrainingCampOpen}
        onClose={() => setIsTrainingCampOpen(false)}
        dynasty={dynasty}
        onApplyTrainingBoost={handleApplyTrainingBoost}
      />

      {/* Peripheral Sponsorship Manager Modal (外设品牌谈判签约与月度流水结算) */}
      <SponsorshipManagerModal
        isOpen={isSponsorshipManagerOpen}
        onClose={() => setIsSponsorshipManagerOpen(false)}
        dynasty={dynasty}
        onUpdateDynasty={onUpdateDynasty}
      />

      {/* Daily Tactical Drill Modal (Phase 3 每日战术特训 · 认知反应测验与全员Macro增益) */}
      <DailyTacticalDrillModal
        isOpen={isDailyDrillOpen}
        onClose={() => setIsDailyDrillOpen(false)}
        dynasty={dynasty}
        onUpdateDynasty={onUpdateDynasty}
      />

      {/* Scrim Simulator Modal (Phase 3 豪门训练赛模拟器 · 3小时对抗与团战协同漏洞报告) */}
      <ScrimSimulatorModal
        isOpen={isScrimSimOpen}
        onClose={() => setIsScrimSimOpen(false)}
        dynasty={dynasty}
        onUpdateDynasty={onUpdateDynasty}
        onOpenTrainingCamp={() => setIsTrainingCampOpen(true)}
      />

      {/* Contract Buyout & Agency Commission Modal (Phase 3 薪资帽合规、10%经纪佣金与转会审计) */}
      <ContractBuyoutModal
        isOpen={isContractBuyoutOpen}
        onClose={() => {
          setIsContractBuyoutOpen(false);
          setTargetBuyoutPlayer(null);
        }}
        dynasty={dynasty}
        onUpdateDynasty={onUpdateDynasty}
        targetPlayer={targetBuyoutPlayer}
        onOpenScoutTab={() => setActiveTab('scout')}
      />

      {/* League Expansion Draft Modal (Phase 3 年度联赛扩军选秀 · 3名核心保护与路人王淘金) */}
      <LeagueExpansionDraftModal
        isOpen={isExpansionDraftOpen}
        onClose={() => setIsExpansionDraftOpen(false)}
        dynasty={dynasty}
        onUpdateDynasty={onUpdateDynasty}
      />

      {/* Opponent Scouting Report Modal (Phase 3 战术沙盘深度研判 · 对手BP倾向/软肋/克制加成) */}
      <OpponentScoutingReportModal
        isOpen={isScoutReportModalOpen}
        onClose={() => setIsScoutReportModalOpen(false)}
        dynasty={dynasty}
        onUpdateDynasty={onUpdateDynasty}
        targetOpponent={scoutingTargetOpponent || selectedOpponent}
      />

      {/* Team Dynamics Modal (Phase 3 战队战术动态协同编制 · 作战小队化学反应与羁绊调配) */}
      {isTeamDynamicsModalOpen && (
        <TeamDynamicsSection
          dynasty={dynasty}
          onUpdateDynasty={onUpdateDynasty}
          isModal={true}
          onClose={() => setIsTeamDynamicsModalOpen(false)}
        />
      )}
    </div>
  );
};
