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
  FileText,
  Network,
  Home,
  Crosshair
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
  onOpenTactical?: () => void;
  onOpenSynergy?: () => void;
  onOpenLifeSim?: () => void;
}

const ROLES: ('TOP' | 'JUG' | 'MID' | 'ADC' | 'SUP')[] = ['TOP', 'JUG', 'MID', 'ADC', 'SUP'];

const ROLE_NAMES: Record<string, string> = {
  TOP: '上单',
  JUG: '打野',
  MID: '中单',
  ADC: '射手',
  SUP: '辅助'
};

const ROUND_NAMES: Record<string, string> = {
  'Quarterfinals': '八强淘汰赛',
  'Semifinals': '半决赛决战',
  'Grand Finals': '赛区总决赛'
};

export const PhaseTwoStage: React.FC<PhaseTwoProps> = ({
  playerMoney,
  onWinRegional,
  onAdvanceToDynasty,
  onOpenPatchNotes,
  onOpenMatchStats,
  onEarnPrizeMoney,
  onTriggerRetirement,
  isDynastyUnlocked,
  onOpenTactical,
  onOpenSynergy,
  onOpenLifeSim
}) => {
  const [tournamentRound, setTournamentRound] = useState<'Quarterfinals' | 'Semifinals' | 'Grand Finals'>('Quarterfinals');
  const [matchScore, setMatchScore] = useState<{ playerWins: number; enemyWins: number }>({ playerWins: 0, enemyWins: 0 });

  const opponentName = 
    tournamentRound === 'Grand Finals' ? 'Gen.G / T1 王朝' :
    tournamentRound === 'Semifinals' ? 'BLG 狂潮蛟龙' : 'Cloud9 战队';

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
  const [isRetirementExpanded, setIsRetirementExpanded] = useState<boolean>(false);
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
      synergyRating: playerWinPct > 60 ? 'BP巨大优势 (+15% 战力增幅)' : playerWinPct > 45 ? '版本均势阵容' : '面临敌方阵容严重克制'
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
        text: '解说员：“欢迎来到职业联赛首发对局！现场万名观众沸腾欢呼！”',
        type: 'caster'
      },
      {
        id: '2',
        minute: 4,
        text: `下路3级Gank：你方打野极限闪现配合击杀，斩获第一滴血！`,
        type: 'kill'
      },
      {
        id: '3',
        minute: 14,
        text: '峡谷先锋争夺战：河道爆发 5v5 惨烈团战！',
        type: 'teamfight'
      }
    ];

    setSimulationLogs(initialLogs);

    setTimeout(() => {
      setClutchPrompt({
        minute: 24,
        title: '24分钟 纳什男爵生死龙坑对峙',
        description: `大龙血量仅剩 4,000 HP！敌方五人带着远见改造眼穿过河道逼近！队长请立刻决断战术！`,
        options: [
          { label: '【转火集火】反打秒杀敌方核心C位', risk: 'Medium', winBonus: 15 },
          { label: '【拼惩戒】五人全力集火大龙搏命秒龙', risk: 'High', winBonus: 10 },
          { label: '【拉扯防守】卡住河道隘口持续Poke消耗', risk: 'Low', winBonus: 5 }
        ]
      });
    }, 1800);
  };

  const handleResolveClutch = (choice: { label: string; winBonus: number }) => {
    soundEngine.playClick();
    setClutchPrompt(null);

    const totalWinPct = draftScores.playerWinPct + choice.winBonus;
    const won = Math.random() * 100 < totalWinPct;
    const midPick = draftState.playerPicks[2]?.name || '你方中单';

    const finalLogs: MatchSimulationLog[] = [
      {
        id: '4',
        minute: 26,
        text: `队长指挥指令：“${choice.label}”！${midPick} 在关键时刻完成绝杀！`,
        type: 'clutch'
      },
      won ? {
        id: '5',
        minute: 31,
        text: '团灭 ACE！敌方全员阵亡！中路高地水晶瞬间瓦解！',
        type: 'teamfight'
      } : {
        id: '5',
        minute: 31,
        text: '敌方携带大龙Buff绝地反攻，逼近你方水晶枢纽！',
        type: 'teamfight'
      },
      {
        id: '6',
        minute: 32,
        text: won ? '【全场胜利】敌方水晶枢纽爆裂！恭喜获胜！' : '【战局失利】我方水晶告破，遗憾落败。',
        type: won ? 'kill' : 'caster'
      }
    ];

    setSimulationLogs(prev => [...prev, ...finalLogs]);
    setMatchResult(won ? 'WIN' : 'LOSS');

    if (won) {
      soundEngine.playVictory();
      onEarnPrizeMoney(40000, '赛区单局胜场奖金');

      const nextWins = matchScore.playerWins + 1;
      if (nextWins >= 2) {
        onEarnPrizeMoney(120000, `${ROUND_NAMES[tournamentRound]}系列赛晋级大奖`);
        if (tournamentRound === 'Grand Finals') {
          onWinRegional();
        } else if (tournamentRound === 'Quarterfinals') {
          setTournamentRound('Semifinals');
        } else if (tournamentRound === 'Semifinals') {
          setTournamentRound('Grand Finals');
        }
        setMatchScore({ playerWins: 0, enemyWins: 0 });
      } else {
        setMatchScore(prev => ({ ...prev, playerWins: nextWins }));
      }
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
              季后赛 BO3
            </span>
            <span className="text-[11px] font-tech text-amber-400 font-bold">{ROUND_NAMES[tournamentRound]}</span>
          </div>
          <div className="text-xs font-tech font-bold text-white mt-0.5">
            我方战队 vs <span className="text-rose-400">{opponentName}</span>
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
            title="世界赛 14.20 补丁公告"
          >
            <Flame className="w-3 h-3 text-amber-400" />
            <span>补丁</span>
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
          {isDynastyUnlocked ? '王朝经营 →' : playerMoney >= 1000000 ? '👑 退役创队 ($100万)' : '🔒 资本创队 ($100万)'}
        </button>
      </div>

      {/* Pro Features Quick Hub (基地日常 / 战队羁绊 / 战术终端) */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => {
            soundEngine.playClick();
            if (onOpenLifeSim) onOpenLifeSim();
          }}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-left transition flex items-center gap-2 cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Home className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-tech font-bold text-white truncate">基地日常</div>
            <div className="text-[9px] text-slate-400 truncate">CCTV监控 / 疗愈</div>
          </div>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            if (onOpenSynergy) onOpenSynergy();
          }}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-left transition flex items-center gap-2 cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
            <Network className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-tech font-bold text-white truncate">战队羁绊</div>
            <div className="text-[9px] text-slate-400 truncate">默契共鸣网络</div>
          </div>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            if (onOpenTactical) onOpenTactical();
          }}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-left transition flex items-center gap-2 cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Crosshair className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-tech font-bold text-white truncate">战术终端</div>
            <div className="text-[9px] text-slate-400 truncate">大龙惩戒决断</div>
          </div>
        </button>
      </div>

      {/* Road to $1,000,000 Retirement Progress Bar (Collapsible Accordion) */}
      <div className="rounded-xl bg-slate-900 border border-amber-500/30 overflow-hidden">
        <div 
          onClick={() => {
            soundEngine.playClick();
            setIsRetirementExpanded(!isRetirementExpanded);
          }}
          className="p-2.5 px-3 flex items-center justify-between text-xs font-tech cursor-pointer hover:bg-slate-850 transition"
        >
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <span>👑</span> 退役创队基金:
            </span>
            <span className="text-emerald-400 font-code font-bold">
              ${playerMoney.toLocaleString()} / $1,000,000
            </span>
            <span className="text-[10px] text-slate-400 font-code">
              ({Math.min(100, Math.floor((playerMoney / 1000000) * 100))}%)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {playerMoney >= 1000000 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTriggerRetirement();
                }}
                className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-tech font-extrabold text-[10px] animate-pulse"
              >
                退役买队 →
              </button>
            )}
            <span className="text-slate-400 text-[10px]">
              {isRetirementExpanded ? '折叠 ▴' : '详情 ▾'}
            </span>
          </div>
        </div>

        {isRetirementExpanded && (
          <div className="p-3 pt-0 border-t border-slate-800 space-y-2 animate-fadeIn">
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 mt-2">
              <div
                className="bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (playerMoney / 1000000) * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-sans">
              <span>赢得淘汰赛获取百万巨奖，累积100万美元可退役买下职业俱乐部</span>
              {playerMoney < 1000000 && (
                <span>距目标还需 ${(1000000 - playerMoney).toLocaleString()}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {!isSimulating ? (
        /* PORTRAIT DRAFTING BOARD */
        <div className="space-y-2.5">
          {/* Win Probability Bar */}
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-[11px] font-tech font-bold mb-1">
              <span className="text-cyan-400">蓝方胜率: {draftScores.playerWinPct}%</span>
              <span className="text-rose-400">红方胜率: {draftScores.enemyWinPct}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
              <div className="bg-cyan-500 h-full transition-all duration-300" style={{ width: `${draftScores.playerWinPct}%` }} />
              <div className="bg-rose-500 h-full transition-all duration-300" style={{ width: `${draftScores.enemyWinPct}%` }} />
            </div>
            <div className="text-[10px] text-slate-400 font-sans mt-1 text-center">
              阵容评估: <span className="text-amber-300 font-semibold">{draftScores.synergyRating}</span>
            </div>
          </div>

          {/* Enemy Picks Compact Row */}
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] font-tech font-bold text-rose-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>{opponentName} (红方对手)</span>
              <span className="text-slate-500 font-sans">对手选人名单</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {ROLES.map((role, idx) => {
                const pick = draftState.enemyPicks[idx];
                return (
                  <div key={role} className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center flex flex-col items-center">
                    <span className="text-base">{pick ? pick.icon : '❓'}</span>
                    <span className="text-[9px] font-tech text-rose-400 font-bold">{ROLE_NAMES[role]}</span>
                    <span className="text-[9px] text-white truncate w-full font-sans">{pick ? pick.name.split(',')[0] : '...'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Your Team Picks Interactive Row */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-[10px] font-tech font-bold text-cyan-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>我方战队 (蓝方队长执教)</span>
              <button onClick={handleAutoDraft} className="text-[10px] text-slate-400 hover:text-white cursor-pointer underline">
                一键自动填选
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
                    <span className="text-[9px] font-tech text-cyan-400 font-bold">{ROLE_NAMES[role]}</span>
                    <span className="text-[9px] text-white truncate w-full font-sans">{pick ? pick.name.split(',')[0] : '点击选择'}</span>
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
                {ROLE_NAMES[role]}
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
            <span>{isDraftComplete ? '启动赛场对战模拟' : '请先完成五路英雄BP锁定'}</span>
          </button>
        </div>
      ) : (
        /* LIVE BROADCAST SCREEN */
        <div className="p-3.5 rounded-xl bg-slate-900 border border-indigo-500/50 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-tech font-bold text-white uppercase">赛事实况直播信号</span>
            </div>
            <span className="text-[10px] font-code text-cyan-400">45.8万 实时在线人气</span>
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
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-tech font-bold text-amber-400 uppercase flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> 队长赛场决策点 ({clutchPrompt.minute}分钟)
                </div>
                {onOpenTactical && (
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onOpenTactical();
                    }}
                    className="text-[9px] font-code text-cyan-300 underline hover:text-cyan-200 cursor-pointer"
                  >
                    调用战术终端 →
                  </button>
                )}
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
                    <span className="text-[10px] text-amber-400 font-code font-bold">胜率加成 +{opt.winBonus}%</span>
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
                <span>查看赛后伤害数据与 MVP 评定</span>
              </button>

              <button
                onClick={resetDraftForNextGame}
                className="w-full py-3 rounded-xl font-tech font-bold text-xs uppercase bg-slate-800 active:bg-slate-700 text-white border border-slate-700 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> 开启系列赛下一局 BP 对决
              </button>
              <button
                onClick={onAdvanceToDynasty}
                className="w-full py-3 rounded-xl font-tech font-bold text-xs uppercase bg-amber-400 active:bg-amber-300 text-slate-950 cursor-pointer shadow-md"
              >
                进入战队管理王朝经营 (第三阶段) →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
