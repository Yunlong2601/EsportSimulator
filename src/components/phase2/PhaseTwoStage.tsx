import React, { useState, useEffect } from 'react';
import { Champion, DraftState, MatchSimulationLog } from '../../types/game';
import { CHAMPIONS_DATABASE } from '../../data/champions';
import { soundEngine } from '../../utils/audio';
import { 
  Shield, 
  Swords, 
  Flame, 
  Users, 
  Play, 
  Trophy, 
  RefreshCw,
  Zap,
  ArrowRight,
  BarChart3,
  FileText
} from 'lucide-react';

interface PhaseTwoProps {
  playerMoney: number;
  onWinRegional: () => void;
  onAdvanceToDynasty: () => void;
  onOpenPatchNotes: () => void;
  onOpenMatchStats: (playerPicks: (Champion | null)[], enemyPicks: (Champion | null)[], isWin: boolean) => void;
  onEarnPrizeMoney: (amount: number, reason: string) => void;
  onTriggerRetirement: () => void;
  isDynastyUnlocked: boolean;
}

const ROLES: ('TOP' | 'JUG' | 'MID' | 'ADC' | 'SUP')[] = ['TOP', 'JUG', 'MID', 'ADC', 'SUP'];

export const PhaseTwoStage: React.FC<PhaseTwoProps> = ({
  playerMoney,
  onWinRegional,
  onAdvanceToDynasty,
  onOpenPatchNotes,
  onOpenMatchStats,
  onEarnPrizeMoney,
  onTriggerRetirement,
  isDynastyUnlocked
}) => {
  const [tournamentRound, setTournamentRound] = useState<'Quarterfinals' | 'Semifinals' | 'Grand Finals'>('Quarterfinals');
  const [matchScore, setMatchScore] = useState<{ playerWins: number; enemyWins: number }>({ playerWins: 0, enemyWins: 0 });

  const opponentName = 
    tournamentRound === 'Grand Finals' ? 'Gen.G / T1' :
    tournamentRound === 'Semifinals' ? 'Bilibili' : 'Cloud9';

  const [draftState, setDraftState] = useState<DraftState>({
    stage: 'PICK_1',
    currentTurn: 'PLAYER',
    playerPicks: [null, null, null, null, null],
    enemyPicks: [null, null, null, null, null],
    playerBans: [],
    enemyBans: [],
    selectedRoleIndex: 0
  });

  const [activeRoleFilter, setActiveRoleFilter] = useState<'TOP' | 'JUG' | 'MID' | 'ADC' | 'SUP'>('TOP');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationLogs, setSimulationLogs] = useState<MatchSimulationLog[]>([]);
  const [matchResult, setMatchResult] = useState<'WIN' | 'LOSS' | null>(null);
  const [clutchPrompt, setClutchPrompt] = useState<{
    minute: number;
    title: string;
    description: string;
    options: { label: string; risk: string; winBonus: number }[];
  } | null>(null);

  useEffect(() => {
    setActiveRoleFilter(ROLES[draftState.selectedRoleIndex] || 'TOP');
  }, [draftState.selectedRoleIndex]);

  const calculateDraftScores = () => {
    let playerScore = 50;
    let enemyScore = 50;

    draftState.playerPicks.forEach((p, idx) => {
      if (!p) return;
      playerScore += (p.power - 85) * 1.2;
      const enemy = draftState.enemyPicks[idx];
      if (enemy) {
        if (p.counters.includes(enemy.id)) playerScore += 7;
        if (p.counteredBy.includes(enemy.id)) playerScore -= 7;
      }
    });

    draftState.enemyPicks.forEach((e, idx) => {
      if (!e) return;
      enemyScore += (e.power - 85) * 1.2;
      const player = draftState.playerPicks[idx];
      if (player) {
        if (e.counters.includes(player.id)) enemyScore += 7;
        if (e.counteredBy.includes(player.id)) enemyScore -= 7;
      }
    });

    const total = playerScore + enemyScore;
    const playerWinPct = Math.min(88, Math.max(15, Math.round((playerScore / total) * 100)));
    return {
      playerWinPct,
      enemyWinPct: 100 - playerWinPct,
      synergyRating: playerWinPct > 60 ? 'Dominant Draft Gap (+15% Dmg)' : playerWinPct > 45 ? 'Balanced Meta Composition' : 'Vulnerable into Enemy Comp'
    };
  };

  const draftScores = calculateDraftScores();

  const handlePickChampion = (champ: Champion) => {
    soundEngine.playDraftLock();

    const isTaken = 
      draftState.playerPicks.some(p => p?.id === champ.id) ||
      draftState.enemyPicks.some(e => e?.id === champ.id);
    if (isTaken) return;

    const nextPlayerPicks = [...draftState.playerPicks];
    nextPlayerPicks[draftState.selectedRoleIndex] = champ;

    const nextEnemyPicks = [...draftState.enemyPicks];
    const enemyRole = ROLES[draftState.selectedRoleIndex];
    const availableChamps = CHAMPIONS_DATABASE.filter(c => 
      c.role === enemyRole &&
      c.id !== champ.id &&
      !nextEnemyPicks.some(e => e?.id === c.id)
    );

    const counterPick = availableChamps.find(c => c.counters.includes(champ.id));
    const enemyChoice = counterPick || availableChamps[0] || CHAMPIONS_DATABASE[0];
    nextEnemyPicks[draftState.selectedRoleIndex] = enemyChoice;

    const nextRoleIndex = nextPlayerPicks.findIndex(p => p === null);

    setDraftState(prev => ({
      ...prev,
      playerPicks: nextPlayerPicks,
      enemyPicks: nextEnemyPicks,
      selectedRoleIndex: nextRoleIndex === -1 ? 0 : nextRoleIndex
    }));
  };

  const handleAutoDraft = () => {
    soundEngine.playDraftLock();
    const nextPlayer = [...draftState.playerPicks];
    const nextEnemy = [...draftState.enemyPicks];

    ROLES.forEach((role, idx) => {
      if (!nextPlayer[idx]) {
        const pool = CHAMPIONS_DATABASE.filter(c => c.role === role && !nextPlayer.some(p => p?.id === c.id));
        nextPlayer[idx] = pool[0];
      }
      if (!nextEnemy[idx]) {
        const pool = CHAMPIONS_DATABASE.filter(c => c.role === role && !nextEnemy.some(e => e?.id === c.id) && c.id !== nextPlayer[idx]?.id);
        nextEnemy[idx] = pool[0];
      }
    });

    setDraftState(prev => ({
      ...prev,
      playerPicks: nextPlayer,
      enemyPicks: nextEnemy
    }));
  };

  const isDraftComplete = draftState.playerPicks.every(p => p !== null) && draftState.enemyPicks.every(e => e !== null);

  const startMatchSimulation = () => {
    soundEngine.playBaronSteal();
    setIsSimulating(true);
    setSimulationLogs([]);
    setMatchResult(null);
    setClutchPrompt(null);

    const initialLogs: MatchSimulationLog[] = [
      {
        id: '1',
        minute: 1,
        text: 'Casters: "Welcome to Game 1 of the Regional Playoffs! Crowd is roaring!"',
        type: 'caster'
      },
      {
        id: '2',
        minute: 4,
        text: `Level 3 Bot gank: Your Jungler secures FIRST BLOOD!`,
        type: 'kill'
      },
      {
        id: '3',
        minute: 14,
        text: 'Herald contest: 5v5 river teamfight erupts!',
        type: 'teamfight'
      }
    ];

    setSimulationLogs(initialLogs);

    setTimeout(() => {
      setClutchPrompt({
        minute: 24,
        title: '24m Baron Standoff',
        description: `Baron at 4k HP! Enemy is approaching through river brush. Call the play!`,
        options: [
          { label: 'Turn & Burst Enemy Carry', risk: 'Medium', winBonus: 15 },
          { label: 'Smite-Rush Baron 50/50', risk: 'High', winBonus: 10 },
          { label: 'Zone & Kite Back to River', risk: 'Low', winBonus: 5 }
        ]
      });
    }, 1800);
  };

  const handleResolveClutch = (choice: { label: string; winBonus: number }) => {
    soundEngine.playClick();
    setClutchPrompt(null);

    const totalWinPct = draftScores.playerWinPct + choice.winBonus;
    const won = Math.random() * 100 < totalWinPct;
    const midPick = draftState.playerPicks[2]?.name || 'Your Mid';

    const finalLogs: MatchSimulationLog[] = [
      {
        id: '4',
        minute: 26,
        text: `Shotcall: "${choice.label}"! ${midPick} delivers in the clutch!`,
        type: 'clutch'
      },
      won ? {
        id: '5',
        minute: 31,
        text: 'ACE! 5 enemies down! Base gates destroyed!',
        type: 'teamfight'
      } : {
        id: '5',
        minute: 31,
        text: 'Enemy counter-attacks with Baron buff into your base!',
        type: 'teamfight'
      },
      {
        id: '6',
        minute: 32,
        text: won ? 'VICTORY! The Nexus explodes!' : 'DEFEAT. Nexus falls in 32 minutes.',
        type: won ? 'kill' : 'caster'
      }
    ];

    setSimulationLogs(prev => [...prev, ...finalLogs]);
    setMatchResult(won ? 'WIN' : 'LOSS');

    if (won) {
      soundEngine.playVictory();
      onEarnPrizeMoney(40000, 'Stadium Match Win Prize Purse');

      setMatchScore(prev => {
        const nextWins = prev.playerWins + 1;
        if (nextWins >= 2) {
          onEarnPrizeMoney(120000, `${tournamentRound} Playoff Series Purse`);
          if (tournamentRound === 'Grand Finals') {
            onWinRegional();
          } else if (tournamentRound === 'Quarterfinals') {
            setTournamentRound('Semifinals');
          } else if (tournamentRound === 'Semifinals') {
            setTournamentRound('Grand Finals');
          }
          return { playerWins: 0, enemyWins: 0 };
        }
        return { ...prev, playerWins: nextWins };
      });
    } else {
      soundEngine.playDefeat();
      setMatchScore(prev => ({ ...prev, enemyWins: prev.enemyWins + 1 }));
    }
  };

  const resetDraftForNextGame = () => {
    soundEngine.playClick();
    setIsSimulating(false);
    setMatchResult(null);
    setDraftState({
      stage: 'PICK_1',
      currentTurn: 'PLAYER',
      playerPicks: [null, null, null, null, null],
      enemyPicks: [null, null, null, null, null],
      playerBans: [],
      enemyBans: [],
      selectedRoleIndex: 0
    });
  };

  return (
    <div className="p-3 sm:p-4 space-y-3 pb-20 select-none animate-fade-in max-w-md mx-auto">
      {/* Tournament Stage Header */}
      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded text-[9px] font-tech font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Regional Bo3
            </span>
            <span className="text-[11px] font-tech text-amber-400 font-bold">{tournamentRound}</span>
          </div>
          <div className="text-xs font-tech font-bold text-white mt-0.5">
            You vs <span className="text-rose-400">{opponentName}</span>
          </div>
        </div>

        {/* Series Score & Patch Button */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-xs font-code font-bold">
            <span className="text-cyan-400">{matchScore.playerWins}</span>
            <span className="text-slate-500">-</span>
            <span className="text-rose-400">{matchScore.enemyWins}</span>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenPatchNotes();
            }}
            className="px-2 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 text-[10px] font-tech font-bold border border-indigo-500/30 cursor-pointer flex items-center gap-1"
            title="Worlds Patch 14.20 Notes"
          >
            <Flame className="w-3 h-3 text-amber-400" />
            <span>Patch</span>
          </button>
        </div>

        <button
          onClick={() => {
            if (isDynastyUnlocked || playerMoney >= 1000000) {
              onTriggerRetirement();
            } else {
              onAdvanceToDynasty();
            }
          }}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-tech font-bold border cursor-pointer transition ${
            isDynastyUnlocked
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : playerMoney >= 1000000
              ? 'bg-amber-400 text-slate-950 font-extrabold animate-pulse'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          {isDynastyUnlocked ? 'Dynasty →' : playerMoney >= 1000000 ? '👑 Retire & Buy Org' : '🔒 Buy Org ($1M)'}
        </button>
      </div>

      {/* Road to $1,000,000 Retirement Progress Bar */}
      <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/30 space-y-2">
        <div className="flex items-center justify-between text-xs font-tech">
          <span className="text-amber-400 font-bold flex items-center gap-1.5">
            <span>👑</span> Road to $1,000,000 Retirement
          </span>
          <span className="text-emerald-400 font-code font-bold">
            ${playerMoney.toLocaleString()} / $1,000,000
          </span>
        </div>
        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (playerMoney / 1000000) * 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-sans">
          <span>Earn prize money from match wins</span>
          {playerMoney >= 1000000 ? (
            <button
              onClick={onTriggerRetirement}
              className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-tech font-bold cursor-pointer animate-bounce"
            >
              Ready to Retire & Buy Team! →
            </button>
          ) : (
            <span>Need ${(1000000 - playerMoney).toLocaleString()} more</span>
          )}
        </div>
      </div>

      {!isSimulating ? (
        /* PORTRAIT DRAFTING BOARD */
        <div className="space-y-2.5">
          {/* Win Probability Bar */}
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-[11px] font-tech font-bold mb-1">
              <span className="text-cyan-400">Blue Draft: {draftScores.playerWinPct}%</span>
              <span className="text-rose-400">Red Draft: {draftScores.enemyWinPct}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
              <div className="bg-cyan-500 h-full transition-all duration-300" style={{ width: `${draftScores.playerWinPct}%` }} />
              <div className="bg-rose-500 h-full transition-all duration-300" style={{ width: `${draftScores.enemyWinPct}%` }} />
            </div>
          </div>

          {/* Enemy Picks Compact Row */}
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] font-tech font-bold text-rose-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>{opponentName} (Red Side)</span>
              <span className="text-slate-500 font-sans">Opponent Roster</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {ROLES.map((role, idx) => {
                const pick = draftState.enemyPicks[idx];
                return (
                  <div key={role} className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center flex flex-col items-center">
                    <span className="text-base">{pick ? pick.icon : '❓'}</span>
                    <span className="text-[9px] font-tech text-rose-400 font-bold uppercase">{role}</span>
                    <span className="text-[9px] text-white truncate w-full font-sans">{pick ? pick.name.split(',')[0] : '...'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Your Team Picks Interactive Row */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-[10px] font-tech font-bold text-cyan-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Your Team (Blue Side)</span>
              <button onClick={handleAutoDraft} className="text-[10px] text-slate-400 hover:text-white cursor-pointer underline">
                Auto-Fill
              </button>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {ROLES.map((role, idx) => {
                const pick = draftState.playerPicks[idx];
                const isSelected = draftState.selectedRoleIndex === idx;

                return (
                  <button
                    key={role}
                    onClick={() => setDraftState(prev => ({ ...prev, selectedRoleIndex: idx }))}
                    className={`p-1.5 rounded-lg text-center flex flex-col items-center transition border cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-400 shadow-sm'
                        : pick
                        ? 'bg-slate-950/80 border-slate-800'
                        : 'bg-slate-950/40 border-dashed border-slate-800 hover:border-cyan-500'
                    }`}
                  >
                    <span className="text-base">{pick ? pick.icon : '➕'}</span>
                    <span className="text-[9px] font-tech text-cyan-400 font-bold uppercase">{role}</span>
                    <span className="text-[9px] text-white truncate w-full font-sans">{pick ? pick.name.split(',')[0] : 'Pick'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
            {ROLES.map(role => (
              <button
                key={role}
                onClick={() => {
                  soundEngine.playClick();
                  setActiveRoleFilter(role);
                }}
                className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-tech font-bold uppercase cursor-pointer transition ${
                  activeRoleFilter === role
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-900 text-slate-400'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {/* Champion Selection Grid */}
          <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
            {CHAMPIONS_DATABASE.filter(c => c.role === activeRoleFilter).map(champ => {
              const isTaken = 
                draftState.playerPicks.some(p => p?.id === champ.id) ||
                draftState.enemyPicks.some(e => e?.id === champ.id);

              return (
                <button
                  key={champ.id}
                  disabled={isTaken}
                  onClick={() => handlePickChampion(champ)}
                  className={`p-2 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition ${
                    isTaken
                      ? 'bg-slate-950/40 border-slate-800 opacity-40 cursor-not-allowed'
                      : 'bg-slate-900 border-slate-700 active:border-cyan-400 active:bg-slate-800'
                  }`}
                >
                  <span className="text-xl shrink-0">{champ.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-tech font-bold text-white truncate">{champ.name.split(',')[0]}</span>
                      <span className="text-[9px] font-code text-amber-400 font-bold">{champ.tier}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 truncate block">{champ.archetype}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Big Thumb Button: Start Match */}
          <button
            disabled={!isDraftComplete}
            onClick={startMatchSimulation}
            className={`w-full py-3.5 px-4 rounded-xl font-tech font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition cursor-pointer shadow-lg chamfer-btn ${
              isDraftComplete
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-emerald-500/25 active:scale-98'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isDraftComplete ? 'START STADIUM MATCH' : 'Complete 5-Man Draft First'}</span>
          </button>
        </div>
      ) : (
        /* LIVE BROADCAST SCREEN */
        <div className="p-3.5 rounded-xl bg-slate-900 border border-indigo-500/50 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-tech font-bold text-white uppercase">Live Broadcast Feed</span>
            </div>
            <span className="text-[10px] font-code text-cyan-400">450k Viewers</span>
          </div>

          {/* Caster logs feed */}
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {simulationLogs.map((log) => (
              <div
                key={log.id}
                className={`p-2.5 rounded-lg border text-xs leading-snug ${
                  log.type === 'kill'
                    ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-200'
                    : log.type === 'clutch'
                    ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                    : log.type === 'teamfight'
                    ? 'bg-purple-950/30 border-purple-500/40 text-purple-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300'
                }`}
              >
                <span className="font-code font-bold text-amber-400 text-[10px] mr-1.5">[{log.minute}:00]</span>
                {log.text}
              </div>
            ))}
          </div>

          {/* In-Game Clutch Shotcall Choices */}
          {clutchPrompt && (
            <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/60 space-y-2 animate-fade-in">
              <div className="text-[10px] font-tech font-bold text-amber-400 uppercase flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> Captain Shotcall Decision ({clutchPrompt.minute}m)
              </div>
              <p className="text-xs text-white font-medium">{clutchPrompt.description}</p>
              <div className="space-y-1.5 pt-1">
                {clutchPrompt.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleResolveClutch(opt)}
                    className="w-full p-2.5 rounded-lg border border-slate-700 bg-slate-900 active:bg-slate-800 text-left cursor-pointer transition flex items-center justify-between"
                  >
                    <span className="text-xs font-tech font-bold text-white">{opt.label}</span>
                    <span className="text-[10px] text-amber-400 font-code font-bold">+{opt.winBonus}%</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Post-Match Actions */}
          {matchResult && (
            <div className="pt-2 space-y-2">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onOpenMatchStats(draftState.playerPicks, draftState.enemyPicks, matchResult === 'WIN');
                }}
                className="w-full py-2.5 rounded-xl font-tech font-bold text-xs uppercase bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>View Post-Match Damage Charts & MVP</span>
              </button>

              <button
                onClick={resetDraftForNextGame}
                className="w-full py-3 rounded-xl font-tech font-bold text-xs uppercase bg-slate-800 active:bg-slate-700 text-white border border-slate-700 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Draft Next Match in Series
              </button>
              <button
                onClick={onAdvanceToDynasty}
                className="w-full py-3 rounded-xl font-tech font-bold text-xs uppercase bg-amber-400 active:bg-amber-300 text-slate-950 cursor-pointer shadow-md"
              >
                Manage Org Dynasty (Phase 3) →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
