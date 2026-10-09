import React from 'react';
import { GamePhase } from '../types/game';
import { Volume2, VolumeX, Trophy, RotateCcw, Flame, Monitor, Gamepad2, Building2 } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface HeaderProps {
  currentPhase: GamePhase;
  onPhaseChange: (phase: GamePhase) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenTrophies: () => void;
  trophyCount: number;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPhase,
  onPhaseChange,
  soundEnabled,
  onToggleSound,
  onOpenTrophies,
  trophyCount,
  onReset
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo and Tagline */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 via-blue-600 to-amber-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl font-tech tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-300 to-amber-400">
                  ESPORTS LEGACY
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-tech uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ROAD TO WORLDS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans hidden sm:block">
                From Bedroom Solo Queue to the Summoner’s Cup
              </p>
            </div>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-lg border transition cursor-pointer ${
                soundEnabled
                  ? 'bg-slate-800 border-slate-700 text-cyan-400'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
              title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onOpenTrophies}
              className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 transition cursor-pointer flex items-center gap-1 text-xs font-tech font-bold"
            >
              <Trophy className="w-4 h-4" />
              <span>{trophyCount}</span>
            </button>
          </div>
        </div>

        {/* Phase Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800 w-full sm:w-auto overflow-x-auto justify-center">
          <button
            onClick={() => onPhaseChange(1)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-tech font-bold transition-all cursor-pointer whitespace-nowrap ${
              currentPhase === 1
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Phase 1: Amateur Grind</span>
          </button>

          <button
            onClick={() => onPhaseChange(2)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-tech font-bold transition-all cursor-pointer whitespace-nowrap ${
              currentPhase === 2
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Phase 2: The Stage</span>
          </button>

          <button
            onClick={() => onPhaseChange(3)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-tech font-bold transition-all cursor-pointer whitespace-nowrap ${
              currentPhase === 3
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Phase 3: The Dynasty</span>
          </button>
        </div>

        {/* Desktop Utility Controls */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={onOpenTrophies}
            className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 transition cursor-pointer flex items-center gap-1.5 text-xs font-tech font-bold"
            title="View Trophies"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Trophies ({trophyCount}/4)</span>
          </button>

          <button
            onClick={onToggleSound}
            className={`p-2 rounded-lg border transition cursor-pointer ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-cyan-400 hover:bg-slate-700'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
            }`}
            title={soundEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={onReset}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 transition cursor-pointer"
            title="Reset Career"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
