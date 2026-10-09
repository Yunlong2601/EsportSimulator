import React, { useState } from 'react';
import { DynastyState, ProPlayer, FacilityUpgrade, SponsorDeal } from '../../types/game';
import { SCOUTING_POOL, SPONSORS_CATALOG, WORLDS_OPPONENTS, OpponentTeam } from '../../data/dynastyData';
import { soundEngine } from '../../utils/audio';
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
  Compass
} from 'lucide-react';

interface PhaseThreeProps {
  dynasty: DynastyState;
  onUpdateDynasty: React.Dispatch<React.SetStateAction<DynastyState>>;
  onWinWorlds: () => void;
  onOpenGacha?: () => void;
  onOpenLifeSim?: () => void;
  onOpenSynergy?: () => void;
  onOpenLeaderboard?: () => void;
}

export const PhaseThreeDynasty: React.FC<PhaseThreeProps> = ({
  dynasty,
  onUpdateDynasty,
  onWinWorlds,
  onOpenGacha,
  onOpenLifeSim,
  onOpenSynergy,
  onOpenLeaderboard
}) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'facilities' | 'sponsors' | 'scout' | 'worlds'>('roster');
  const [selectedOpponent, setSelectedOpponent] = useState<OpponentTeam>(WORLDS_OPPONENTS[0]);
  const [worldsMatchLog, setWorldsMatchLog] = useState<string[]>([]);
  const [isSimulatingFinals, setIsSimulatingFinals] = useState<boolean>(false);
  const [seriesScore, setSeriesScore] = useState<{ teamWins: number; opponentWins: number }>({ teamWins: 0, opponentWins: 0 });

  const teamPower = Math.round(
    dynasty.roster.reduce((acc, p) => acc + (p.mechanics * 0.5 + p.macro * 0.5), 0) / dynasty.roster.length
  );

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
    onUpdateDynasty(prev => ({
      ...prev,
      budget: prev.budget + sponsor.signingBonus,
      fanHype: prev.fanHype + 1500,
      activeSponsors: [...prev.activeSponsors, { ...sponsor, active: true }]
    }));
  };

  const handleSignPlayer = (player: ProPlayer) => {
    if (dynasty.budget < player.marketValue) {
      alert(`转会费不足！签约需要 $${player.marketValue.toLocaleString()}！`);
      return;
    }
    soundEngine.playCoin();
    onUpdateDynasty(prev => {
      const newRoster = prev.roster.map(p => p.role === player.role ? player : p);
      return {
        ...prev,
        budget: prev.budget - player.marketValue,
        roster: newRoster,
        fanHype: prev.fanHype + 4000
      };
    });
  };

  const startWorldsFinalsSeries = () => {
    soundEngine.playBaronSteal();
    setIsSimulatingFinals(true);
    setSeriesScore({ teamWins: 0, opponentWins: 0 });
    setWorldsMatchLog([
      `🏆 全球总决赛 BO5 决战打响：你所打造的电竞豪门 VS ${selectedOpponent.name.toUpperCase()}！`,
      `开幕式巨龙翱翔落幕，首尔主场6万名热血观众齐声呐喊！`,
      `第一小局比赛正式拉开序幕...`
    ]);

    let tWins = 0;
    let oWins = 0;

    const interval = setInterval(() => {
      const winChance = 0.5 + ((teamPower - selectedOpponent.overallPower) * 0.04);
      const wonGame = Math.random() < winChance;

      if (wonGame) {
        tWins++;
        soundEngine.playVictory();
        setWorldsMatchLog(prev => [...prev, `🔥 恭喜拿下胜局！完美的团战大招配合！系列赛大比分: ${tWins} - ${oWins}`]);
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
          `👑 3比${oWins} 斩获世界冠军！全场金色的雨漫天飞舞！你们捧起了属于传奇的召唤师奖杯！`
        ]);
        onWinWorlds();
      } else if (oWins >= 3) {
        clearInterval(interval);
        setIsSimulatingFinals(false);
        setWorldsMatchLog(prev => [
          ...prev,
          `💔 最终总决赛以 ${tWins}比3 遗憾居亚。${selectedOpponent.name} 登顶世界赛。调整阵容休赛期卷土重来！`
        ]);
      }
    }, 1200);
  };

  return (
    <div className="p-3 sm:p-4 space-y-3 pb-20 select-none animate-fade-in max-w-md mx-auto">
      {/* Top Tycoon Metric Bar */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-tech text-slate-400 uppercase flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-emerald-400" /> 俱乐部金库
          </span>
          <div className="text-base font-extrabold font-code text-emerald-300">
            ${dynasty.budget.toLocaleString()}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-tech text-slate-400 uppercase flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-400" /> 粉丝狂热度
          </span>
          <div className="text-base font-extrabold font-code text-amber-300">
            {dynasty.fanHype.toLocaleString()}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-tech text-slate-400 uppercase flex items-center gap-1">
            <Globe2 className="w-3 h-3 text-cyan-400" /> 全球战队排名
          </span>
          <div className="text-base font-extrabold font-code text-cyan-300">
            世界第 #{dynasty.worldRanking} 名
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-tech text-slate-400 uppercase flex items-center gap-1">
            <Zap className="w-3 h-3 text-purple-400" /> 阵容综合战力
          </span>
          <div className="text-base font-extrabold font-code text-purple-300">
            {teamPower} OVR 综合分
          </div>
        </div>
      </div>

      {/* Feature Fast Triggers: 基地日常 / 战队羁绊 / 全球百强 */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => {
            soundEngine.playClick();
            if (onOpenLifeSim) onOpenLifeSim();
          }}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-center transition cursor-pointer"
        >
          <Home className="w-4 h-4 mx-auto text-emerald-400 mb-0.5" />
          <span className="text-[10px] font-tech font-bold text-white block">基地日常</span>
          <span className="text-[8px] text-slate-400">生活模拟</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            if (onOpenSynergy) onOpenSynergy();
          }}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-center transition cursor-pointer"
        >
          <Network className="w-4 h-4 mx-auto text-cyan-400 mb-0.5" />
          <span className="text-[10px] font-tech font-bold text-white block">战队羁绊</span>
          <span className="text-[8px] text-slate-400">默契网络</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            if (onOpenLeaderboard) onOpenLeaderboard();
          }}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-center transition cursor-pointer"
        >
          <Trophy className="w-4 h-4 mx-auto text-amber-400 mb-0.5" />
          <span className="text-[10px] font-tech font-bold text-white block">全球百强</span>
          <span className="text-[8px] text-slate-400">奖金奖杯榜</span>
        </button>
      </div>

      {/* Horizontal Sub-Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {[
          { id: 'roster', label: '首发名单', icon: Users },
          { id: 'facilities', label: '基地建设', icon: Building2 },
          { id: 'sponsors', label: '商业赞助', icon: DollarSign },
          { id: 'scout', label: '全球星探', icon: Sparkles },
          { id: 'worlds', label: '全球总决赛 🏆', icon: Trophy }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundEngine.playClick();
                setActiveTab(tab.id as typeof activeTab);
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-tech font-bold uppercase cursor-pointer transition whitespace-nowrap flex items-center justify-center gap-1 ${
                activeTab === tab.id
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

      {/* 1. ROSTER TAB */}
      {activeTab === 'roster' && (
        <div className="space-y-2">
          {dynasty.roster.map(player => (
            <div key={player.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xl">{player.avatar}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-tech font-bold text-white">{player.name}</span>
                    <span className="px-1 py-0.2 rounded text-[9px] font-code font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {player.role}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans">
                    {player.country} • 周薪: ${player.salary.toLocaleString()}/周
                  </div>
                </div>
              </div>

              <div className="text-right text-[10px] font-code">
                <div className="text-cyan-400 font-bold">{player.mechanics} 操作</div>
                <div className="text-emerald-400 font-semibold">{player.morale}% 士气</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. FACILITIES TAB */}
      {activeTab === 'facilities' && (
        <div className="space-y-2">
          {dynasty.facilities.map(fac => (
            <div key={fac.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{fac.icon}</span>
                  <div>
                    <h5 className="font-tech font-bold text-white text-xs">{fac.name}</h5>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-tech">
                      <CheckCircle2 className="w-3 h-3" /> {fac.effectLabel}
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-tech font-bold px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                  等级 {fac.tier}/{fac.maxTier}
                </span>
              </div>

              <button
                disabled={fac.tier >= fac.maxTier || dynasty.budget < fac.cost}
                onClick={() => handleUpgradeFacility(fac)}
                className={`w-full py-2 rounded-lg text-[10px] font-tech font-bold uppercase transition cursor-pointer ${
                  fac.tier >= fac.maxTier
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : dynasty.budget >= fac.cost
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {fac.tier >= fac.maxTier ? '已升至顶级' : `升级消耗 $${fac.cost.toLocaleString()}`}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 3. SPONSORS TAB */}
      {activeTab === 'sponsors' && (
        <div className="space-y-2">
          {SPONSORS_CATALOG.map(sp => {
            const isSigned = dynasty.activeSponsors.some(s => s.id === sp.id);

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
                    <div className="text-emerald-400 font-bold">+${sp.weeklyPayout.toLocaleString()}/周</div>
                    <div className="text-amber-300">+${sp.signingBonus.toLocaleString()} 签约金</div>
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
                  {isSigned ? '赞助合约生效中 ✓' : '签署商业赞助'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. SCOUTING TAB */}
      {activeTab === 'scout' && (
        <div className="space-y-2.5">
          {/* Scout Gacha Banner integration */}
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

          {SCOUTING_POOL.map(player => (
            <div key={player.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{player.avatar}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-tech font-bold text-white text-xs">{player.name}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-purple-950 text-purple-300 font-bold">{player.role}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans">
                    {player.country} • {player.mechanics} 操作评分
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSignPlayer(player)}
                className="py-1.5 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-tech font-bold text-[10px] uppercase cursor-pointer"
              >
                转会买断 ${player.marketValue.toLocaleString()}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 5. WORLDS GRAND FINALS TAB */}
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

          {/* Logs */}
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
    </div>
  );
};
