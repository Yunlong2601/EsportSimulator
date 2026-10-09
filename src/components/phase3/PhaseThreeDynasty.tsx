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
  Crown
} from 'lucide-react';

interface PhaseThreeProps {
  dynasty: DynastyState;
  onUpdateDynasty: React.Dispatch<React.SetStateAction<DynastyState>>;
  onWinWorlds: () => void;
}

export const PhaseThreeDynasty: React.FC<PhaseThreeProps> = ({
  dynasty,
  onUpdateDynasty,
  onWinWorlds
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
      alert(`Insufficient funds ($${fac.cost.toLocaleString()} required).`);
      return;
    }
    if (fac.tier >= fac.maxTier) {
      alert('Facility already at maximum tier!');
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
      alert(`Transfer buyout costs $${player.marketValue.toLocaleString()}!`);
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
      `🏆 WORLDS GRAND FINALS: YOUR DYNASTY VS ${selectedOpponent.name.toUpperCase()}!`,
      `Opening Ceremony concludes. 60,000 screaming fans fill the stadium in Seoul.`,
      `Game 1 underway...`
    ]);

    let tWins = 0;
    let oWins = 0;

    const interval = setInterval(() => {
      const winChance = 0.5 + ((teamPower - selectedOpponent.overallPower) * 0.04);
      const wonGame = Math.random() < winChance;

      if (wonGame) {
        tWins++;
        soundEngine.playVictory();
        setWorldsMatchLog(prev => [...prev, `🔥 GAME WON! Outstanding teamfight victory! Series: ${tWins} - ${oWins}`]);
      } else {
        oWins++;
        soundEngine.playDefeat();
        setWorldsMatchLog(prev => [...prev, `💀 GAME LOST! ${selectedOpponent.name} secured the Nexus. Series: ${tWins} - ${oWins}`]);
      }

      setSeriesScore({ teamWins: tWins, opponentWins: oWins });

      if (tWins >= 3) {
        clearInterval(interval);
        setIsSimulatingFinals(false);
        setWorldsMatchLog(prev => [
          ...prev,
          `👑 3-WIN CHAMPIONS! THE SUMMONER'S CUP HAS BEEN HOISTED! WORLD CHAMPIONSHIP SECURED!`
        ]);
        onWinWorlds();
      } else if (oWins >= 3) {
        clearInterval(interval);
        setIsSimulatingFinals(false);
        setWorldsMatchLog(prev => [
          ...prev,
          `💔 3-Loss Defeat. ${selectedOpponent.name} take the title. Train and rebuild for next season!`
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
            <DollarSign className="w-3 h-3 text-emerald-400" /> Treasury
          </span>
          <div className="text-base font-extrabold font-code text-emerald-300">
            ${dynasty.budget.toLocaleString()}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-tech text-slate-400 uppercase flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-400" /> Fan Hype
          </span>
          <div className="text-base font-extrabold font-code text-amber-300">
            {dynasty.fanHype.toLocaleString()}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-tech text-slate-400 uppercase flex items-center gap-1">
            <Globe2 className="w-3 h-3 text-cyan-400" /> World Rank
          </span>
          <div className="text-base font-extrabold font-code text-cyan-300">
            #{dynasty.worldRanking} Global
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-tech text-slate-400 uppercase flex items-center gap-1">
            <Zap className="w-3 h-3 text-purple-400" /> Roster Power
          </span>
          <div className="text-base font-extrabold font-code text-purple-300">
            {teamPower} OVR
          </div>
        </div>
      </div>

      {/* Horizontal Sub-Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {[
          { id: 'roster', label: 'Roster', icon: Users },
          { id: 'facilities', label: 'HQ', icon: Building2 },
          { id: 'sponsors', label: 'Sponsors', icon: DollarSign },
          { id: 'scout', label: 'Scouting', icon: Sparkles },
          { id: 'worlds', label: 'Worlds 🏆', icon: Trophy }
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
                    {player.country} • Salary: ${player.salary.toLocaleString()}/wk
                  </div>
                </div>
              </div>

              <div className="text-right text-[10px] font-code">
                <div className="text-cyan-400 font-bold">{player.mechanics} APM</div>
                <div className="text-emerald-400 font-semibold">{player.morale}% Morale</div>
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
                  T{fac.tier}/{fac.maxTier}
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
                {fac.tier >= fac.maxTier ? 'Maxed Out' : `Upgrade for $${fac.cost.toLocaleString()}`}
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
                    <div className="text-emerald-400 font-bold">+${sp.weeklyPayout.toLocaleString()}/wk</div>
                    <div className="text-amber-300">+${sp.signingBonus.toLocaleString()} bonus</div>
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
                  {isSigned ? 'Contract Active ✓' : 'Sign Deal'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. SCOUTING TAB */}
      {activeTab === 'scout' && (
        <div className="space-y-2">
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
                    {player.country} • {player.mechanics} Mechanics
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSignPlayer(player)}
                className="py-1.5 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-tech font-bold text-[10px] uppercase cursor-pointer"
              >
                Sign ${player.marketValue.toLocaleString()}
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
              <Crown className="w-3.5 h-3.5" /> Worlds Finals Bo5
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
                  <span className="text-[9px] font-code font-bold text-amber-400">{opp.overallPower} OVR</span>
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
            <span>{isSimulatingFinals ? 'Simulating Best-of-5...' : `Fight ${selectedOpponent.name}`}</span>
          </button>
        </div>
      )}
    </div>
  );
};
