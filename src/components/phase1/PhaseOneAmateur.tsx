import React, { useState } from 'react';
import { PlayerStats, SoloQueueEvent, DailyChallenge } from '../../types/game';
import { SOLO_QUEUE_EVENTS } from '../../data/soloQueueEvents';
import { GEAR_CATALOG } from '../../data/gear';
import { DailyChallengesCard } from '../DailyChallengesCard';
import { 
  Gamepad2, 
  Brain, 
  Heart, 
  Battery, 
  DollarSign, 
  Sparkles, 
  Tv, 
  Coffee, 
  ShoppingBag, 
  TrendingUp, 
  Activity,
  Flame,
  UserCheck,
  Radio,
  ChevronDown,
  ChevronUp,
  X,
  Zap,
  MessageSquare
} from 'lucide-react';
import { soundEngine } from '../../utils/audio';

interface PhaseOneProps {
  stats: PlayerStats;
  logs: { id: string; timestamp: string; message: string; type: 'win' | 'loss' | 'event' | 'gear' }[];
  dailyChallenges: DailyChallenge[];
  onClaimChallenge: (id: string) => void;
  onApplyDelta: (delta: {
    lp?: number;
    mechanics?: number;
    mental?: number;
    energy?: number;
    money?: number;
    fame?: number;
    isWin?: boolean;
    isLoss?: boolean;
  }) => void;
  onAddLog: (message: string, type: 'win' | 'loss' | 'event' | 'gear') => void;
  onWatchReplays: () => void;
  onStream: () => void;
  onRest: () => void;
  onBuyGear: (item: typeof GEAR_CATALOG[0]) => void;
  onProceedToPro: () => void;
  onStartReflexDuel: () => void;
  onOpenSocialFeed: () => void;
}

export const PhaseOneAmateur: React.FC<PhaseOneProps> = ({
  stats,
  logs,
  dailyChallenges,
  onClaimChallenge,
  onApplyDelta,
  onAddLog,
  onWatchReplays,
  onStream,
  onRest,
  onBuyGear,
  onProceedToPro,
  onStartReflexDuel,
  onOpenSocialFeed
}) => {
  const [activeEvent, setActiveEvent] = useState<SoloQueueEvent | null>(null);
  const [showGearShop, setShowGearShop] = useState(false);
  const [showLogsDrawer, setShowLogsDrawer] = useState(false);

  // Trigger a Solo Queue Match or Event
  const startRankedMatch = () => {
    if (stats.energy < 20) {
      onAddLog('⚠️ Exhaustion warning! You are too tired to play Solo Queue. Rest or sleep first.', 'event');
      return;
    }

    soundEngine.playClick();

    // 60% chance of random scenario encounter, 40% chance of direct simulated match
    if (Math.random() > 0.35) {
      const randomEvent = SOLO_QUEUE_EVENTS[Math.floor(Math.random() * SOLO_QUEUE_EVENTS.length)];
      setActiveEvent(randomEvent);
    } else {
      const winProbability = 0.45 + (stats.mechanics / 250) + (stats.mental / 350);
      const isWin = Math.random() < winProbability;
      const lpChange = isWin ? Math.floor(22 + Math.random() * 8) : -Math.floor(16 + Math.random() * 6);

      onApplyDelta({
        lp: lpChange,
        energy: -20,
        mechanics: isWin ? 1 : 1,
        mental: isWin ? 3 : -5,
        fame: isWin ? 2 : 0,
        isWin,
        isLoss: !isWin
      });

      if (isWin) {
        onAddLog(`🏆 Ranked Victory! Clean 28m carry performance (+${lpChange} LP).`, 'win');
      } else {
        onAddLog(`💀 Ranked Defeat. Lost late objective teamfight (${lpChange} LP).`, 'loss');
      }
    }
  };

  const handleResolveEvent = (choiceIndex: number) => {
    if (!activeEvent) return;
    const choice = activeEvent.options[choiceIndex];
    const outcome = choice.execute(stats);

    onApplyDelta({
      lp: outcome.lpDelta,
      energy: -20,
      mechanics: outcome.mechanicsDelta,
      mental: outcome.mentalDelta,
      money: outcome.moneyDelta,
      fame: outcome.fameDelta,
      isWin: outcome.success,
      isLoss: !outcome.success
    });

    onAddLog(outcome.log, outcome.success ? 'win' : 'loss');
    setActiveEvent(null);
  };

  return (
    <div className="p-3 sm:p-4 space-y-3.5 pb-20 select-none animate-fade-in max-w-md mx-auto">
      {/* Challenger Milestone Banner (If 1,000+ LP achieved) */}
      {stats.lp >= 1000 && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-cyan-500/20 border-2 border-amber-400/80 shadow-lg flex flex-col gap-2.5 animate-bounce-subtle">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500 text-slate-950 font-bold shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-tech font-bold text-amber-300 text-sm">
                CHALLENGER 1,000 LP REACHED!
              </div>
              <p className="text-[11px] text-slate-300">
                Pro scouts are sending academy contracts. Ready to play on stage?
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onProceedToPro();
            }}
            className="w-full py-2.5 px-4 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-tech font-bold text-xs tracking-wider transition shadow cursor-pointer text-center"
          >
            Sign Pro Contract & Go to Stage →
          </button>
        </div>
      )}

      {/* Bedroom Battle Station Card */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎮</span>
            <div>
              <h3 className="font-tech font-bold text-white text-sm">Bedroom Setup</h3>
              <p className="text-[10px] text-slate-400">High MMR Solo Queue • 144 FPS</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                soundEngine.playClick();
                onStartReflexDuel();
              }}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-[11px] font-tech font-bold text-cyan-300 border border-cyan-500/30 cursor-pointer"
              title="1v1 Reflex Duel Outplay"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>1v1 Duel</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenSocialFeed();
              }}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-[11px] font-tech font-bold text-indigo-300 border border-indigo-500/30 cursor-pointer"
              title="Community Social Feed"
            >
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span>Feed</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                setShowGearShop(true);
              }}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-tech font-semibold text-amber-300 border border-slate-700 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Gear</span>
            </button>
          </div>
        </div>

        {/* Status Bar Ticker */}
        <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] font-code space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Radio className="w-3 h-3 animate-pulse" /> LIVE LOBBY:
            </span>
            <span className="text-cyan-400">Streak: 🔥 {stats.winStreak}</span>
          </div>
          <div className="text-slate-300 text-[10px] leading-tight">
            Role: <span className="text-amber-400 font-semibold">Mid Lane</span> • Target: <span className="text-cyan-300 font-semibold">1,000 LP Challenger</span>
          </div>
        </div>
      </div>

      {/* ACTIVE ENCOUNTER OR PROMPT */}
      {activeEvent ? (
        /* Event Encounter Card */
        <div className="p-4 rounded-xl bg-slate-900 border-2 border-cyan-500/60 shadow-xl space-y-3 chamfer-card animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded text-[10px] font-tech font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              {activeEvent.contextTag}
            </span>
            <span className="text-[10px] text-slate-400 font-tech">Solo Q Encounter</span>
          </div>

          <h4 className="font-tech font-bold text-white text-base leading-snug">
            {activeEvent.title}
          </h4>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            {activeEvent.scenario}
          </p>

          <div className="space-y-2 pt-1">
            <div className="text-[10px] font-tech font-bold text-slate-400 uppercase tracking-wider">
              Choose Your Action:
            </div>
            {activeEvent.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleResolveEvent(idx)}
                className="w-full text-left p-3 rounded-xl border border-slate-700 hover:border-cyan-400 bg-slate-800/90 active:bg-slate-800 transition cursor-pointer"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-tech font-bold text-white text-xs">
                    {opt.label}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase font-tech ${
                      opt.risk === 'High'
                        ? 'bg-rose-500/20 text-rose-300'
                        : opt.risk === 'Medium'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {opt.risk}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {opt.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Primary Thumb Actions (Mobile-First 4 Big Buttons) */
        <div className="space-y-2">
          {/* 1. Main Action Button: Ranked Match */}
          <button
            onClick={startRankedMatch}
            className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 active:scale-98 text-slate-950 font-tech font-extrabold text-base tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 cursor-pointer transition chamfer-btn"
          >
            <Gamepad2 className="w-5 h-5 fill-current" />
            <span>PLAY RANKED MATCH (-20 Energy)</span>
          </button>

          {/* Secondary Actions in 3-Button Grid */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={onWatchReplays}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 active:bg-slate-800 flex flex-col items-center justify-center text-center cursor-pointer transition hover:border-cyan-500/50"
            >
              <TrendingUp className="w-4 h-4 text-cyan-400 mb-1" />
              <span className="text-[11px] font-tech font-bold text-white leading-none">VOD Review</span>
              <span className="text-[9px] text-slate-400 font-sans mt-0.5">-15 Energy</span>
            </button>

            <button
              onClick={onStream}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 active:bg-slate-800 flex flex-col items-center justify-center text-center cursor-pointer transition hover:border-purple-500/50"
            >
              <Tv className="w-4 h-4 text-purple-400 mb-1" />
              <span className="text-[11px] font-tech font-bold text-white leading-none">Twitch Stream</span>
              <span className="text-[9px] text-slate-400 font-sans mt-0.5">+$$ / Fame</span>
            </button>

            <button
              onClick={onRest}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 active:bg-slate-800 flex flex-col items-center justify-center text-center cursor-pointer transition hover:border-emerald-500/50"
            >
              <Coffee className="w-4 h-4 text-emerald-400 mb-1" />
              <span className="text-[11px] font-tech font-bold text-white leading-none">Sleep & Eat</span>
              <span className="text-[9px] text-slate-400 font-sans mt-0.5">+45 Energy</span>
            </button>
          </div>
        </div>
      )}

      {/* Daily Challenges Card */}
      <DailyChallengesCard
        challenges={dailyChallenges}
        onClaim={onClaimChallenge}
      />

      {/* Live Solo Queue Activity Drawer / Logs */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden">
        <button
          onClick={() => setShowLogsDrawer(!showLogsDrawer)}
          className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-tech font-bold text-slate-300 hover:text-white cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Career Match Logs ({logs.length})</span>
          </div>
          {showLogsDrawer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showLogsDrawer && (
          <div className="p-2.5 pt-0 space-y-1.5 max-h-48 overflow-y-auto font-sans text-[11px]">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`p-2 rounded-lg border text-[11px] leading-snug ${
                  log.type === 'win'
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                    : log.type === 'loss'
                    ? 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                    : log.type === 'gear'
                    ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex justify-between text-[9px] text-slate-400 font-code mb-0.5">
                  <span>{log.timestamp}</span>
                  <span className="uppercase font-semibold">{log.type}</span>
                </div>
                <div>{log.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GEAR SHOP BOTTOM SHEET / MODAL */}
      {showGearShop && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full sm:max-w-md bg-slate-900 border-t sm:border border-slate-700 rounded-t-2xl sm:rounded-2xl p-4 max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <h4 className="font-tech font-bold text-white text-base">Pro Hardware Store</h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-tech text-emerald-400 font-bold">${stats.money}</span>
                <button
                  onClick={() => setShowGearShop(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 py-3 pr-1">
              {GEAR_CATALOG.map((gear) => {
                const owned = stats.ownedGear.includes(gear.id);
                const canAfford = stats.money >= gear.cost;

                return (
                  <div
                    key={gear.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                      owned
                        ? 'bg-slate-950/40 border-slate-800 opacity-60'
                        : 'bg-slate-800/80 border-slate-700'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-base">{gear.icon}</span>
                        <span className="font-tech font-bold text-white text-xs truncate">{gear.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">{gear.description}</p>
                      <div className="flex items-center gap-2 mt-1 text-[9px] font-tech font-bold">
                        <span className="text-cyan-400">+{gear.mechanicsBonus} APM</span>
                        <span className="text-rose-400">+{gear.mentalBonus} Mental</span>
                      </div>
                    </div>

                    <button
                      disabled={owned || !canAfford}
                      onClick={() => onBuyGear(gear)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-tech font-bold uppercase shrink-0 transition cursor-pointer ${
                        owned
                          ? 'bg-slate-800 text-slate-500 cursor-default'
                          : canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {owned ? 'Owned ✓' : canAfford ? `$${gear.cost}` : `$${gear.cost}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
