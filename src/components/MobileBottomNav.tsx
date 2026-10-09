import React from 'react';
import { GamePhase } from '../types/game';
import { Gamepad2, Swords, Building2, Trophy, Lock } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface MobileBottomNavProps {
  currentPhase: GamePhase;
  unlockedPhases: Record<GamePhase, boolean>;
  onPhaseChange: (phase: GamePhase) => void;
  onLockedTabClick: (phase: GamePhase) => void;
  onOpenTrophies: () => void;
  trophyCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentPhase,
  unlockedPhases,
  onPhaseChange,
  onLockedTabClick,
  onOpenTrophies,
  trophyCount
}) => {
  const tabs = [
    {
      phase: 1 as GamePhase,
      label: '业余排位',
      sub: '冲刺千分',
      icon: Gamepad2,
      color: 'text-cyan-400',
      activeBg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
    },
    {
      phase: 2 as GamePhase,
      label: '职业赛场',
      sub: 'BP博弈',
      icon: Swords,
      color: 'text-indigo-400',
      activeBg: 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
    },
    {
      phase: 3 as GamePhase,
      label: '传奇豪门',
      sub: '战队经营',
      icon: Building2,
      color: 'text-amber-400',
      activeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-300'
    }
  ];

  return (
    <nav className="sticky bottom-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-1.5 select-none shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
      <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentPhase === tab.phase;
          const isUnlocked = unlockedPhases[tab.phase];

          return (
            <button
              key={tab.phase}
              onClick={() => {
                soundEngine.playClick();
                if (isUnlocked) {
                  onPhaseChange(tab.phase);
                } else {
                  onLockedTabClick(tab.phase);
                }
              }}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-150 border cursor-pointer relative ${
                isActive
                  ? `${tab.activeBg} font-bold shadow-sm`
                  : isUnlocked
                  ? 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                  : 'border-transparent text-slate-600 hover:text-slate-500 bg-slate-950/40'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 mb-0.5 ${isActive ? tab.color : isUnlocked ? 'text-slate-400' : 'text-slate-600'}`} />
                {!isUnlocked && (
                  <span className="absolute -top-1 -right-2 p-0.5 rounded-full bg-slate-900 text-amber-400 border border-slate-800">
                    <Lock className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
              <span className="text-[11px] font-tech leading-none">{tab.label}</span>
              <span className="text-[9px] text-slate-500 font-sans leading-tight">
                {isUnlocked ? tab.sub : '未解锁 🔒'}
              </span>
            </button>
          );
        })}

        {/* Trophies Cabinet Tab */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenTrophies();
          }}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-150 border border-transparent text-slate-400 hover:text-amber-300 hover:bg-slate-900/50 cursor-pointer relative"
        >
          <div className="relative">
            <Trophy className="w-4 h-4 mb-0.5 text-amber-400" />
            {trophyCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full text-[8px] font-bold bg-amber-500 text-slate-950 font-tech">
                {trophyCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-tech leading-none text-amber-200/90 font-bold">荣誉展柜</span>
          <span className="text-[9px] text-slate-400 font-sans leading-tight">奖杯·称号·榜单</span>
        </button>
      </div>
    </nav>
  );
};
