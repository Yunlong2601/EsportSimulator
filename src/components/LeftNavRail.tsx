import React, { useState } from 'react';
import { 
  Globe, 
  Calendar, 
  Zap, 
  Film, 
  Crown, 
  Megaphone,
  ChevronRight
} from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { WorldTourState, EsportsCalendarState, PrestigeState } from '../types/game';

interface LeftNavRailProps {
  onOpenWorldTour?: () => void;
  onOpenCalendar?: () => void;
  onOpenPowerRankings?: () => void;
  onOpenVodLibrary?: () => void;
  onOpenPrestigeHall?: () => void;
  onOpenCommunityRelations?: () => void;
  worldTourState?: WorldTourState;
  calendarState?: EsportsCalendarState;
  prestigeState?: PrestigeState;
}

export const LeftNavRail: React.FC<LeftNavRailProps> = ({
  onOpenWorldTour,
  onOpenCalendar,
  onOpenPowerRankings,
  onOpenVodLibrary,
  onOpenPrestigeHall,
  onOpenCommunityRelations,
  worldTourState,
  calendarState,
  prestigeState
}) => {
  const [activeHoverItem, setActiveHoverItem] = useState<string | null>(null);

  const navItems = [
    {
      id: 'world_tour',
      label: '巡回赛',
      fullLabel: '百层世界巡回赛',
      badge: worldTourState ? `F.${worldTourState.currentFloor}` : '100F',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      icon: Globe,
      color: 'text-cyan-400 group-hover:text-cyan-300',
      activeBorder: 'border-cyan-500/40 bg-cyan-950/30',
      onClick: onOpenWorldTour
    },
    {
      id: 'calendar',
      label: '赛历',
      fullLabel: '赛季赛历时钟',
      badge: calendarState ? `W${calendarState.currentWeek}` : 'W1',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      icon: Calendar,
      color: 'text-purple-400 group-hover:text-purple-300',
      activeBorder: 'border-purple-500/40 bg-purple-950/30',
      onClick: onOpenCalendar
    },
    {
      id: 'power_rankings',
      label: '天梯榜',
      fullLabel: '全球战力天梯榜',
      badge: 'TOP',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: Zap,
      color: 'text-amber-400 group-hover:text-amber-300',
      activeBorder: 'border-amber-500/40 bg-amber-950/30',
      onClick: onOpenPowerRankings
    },
    {
      id: 'vod_library',
      label: '录像库',
      fullLabel: '名局战术录像库',
      badge: 'VOD',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      icon: Film,
      color: 'text-indigo-400 group-hover:text-indigo-300',
      activeBorder: 'border-indigo-500/40 bg-indigo-950/30',
      onClick: onOpenVodLibrary
    },
    {
      id: 'prestige_hall',
      label: '声望殿',
      fullLabel: '传奇声望名人堂',
      badge: prestigeState ? `G${prestigeState.generation}` : 'G1',
      badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      icon: Crown,
      color: 'text-yellow-400 group-hover:text-yellow-300',
      activeBorder: 'border-yellow-500/40 bg-yellow-950/30',
      onClick: onOpenPrestigeHall
    },
    {
      id: 'community_relations',
      label: '公关群',
      fullLabel: '社区公关与粉丝团',
      badge: 'HOT',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      icon: Megaphone,
      color: 'text-rose-400 group-hover:text-rose-300',
      activeBorder: 'border-rose-500/40 bg-rose-950/30',
      onClick: onOpenCommunityRelations
    }
  ];

  return (
    <aside 
      className="w-13 sm:w-14 shrink-0 bg-slate-950/90 border-r border-slate-800/80 flex flex-col items-center py-2 px-1 select-none backdrop-blur-md z-20 transition-all duration-200"
      aria-label="宏观战术导航轨"
    >
      {/* Top Brand Tag */}
      <div className="mb-2 text-center">
        <span className="text-[8px] font-tech font-bold text-slate-500 tracking-tighter uppercase block leading-none">
          SYSTEM
        </span>
        <div className="w-3 h-0.5 bg-cyan-500/50 rounded-full mx-auto mt-0.5" />
      </div>

      {/* Action Items List */}
      <div className="flex-1 flex flex-col items-center gap-1.5 w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <div 
              key={item.id} 
              className="relative w-full flex flex-col items-center"
              onMouseEnter={() => setActiveHoverItem(item.id)}
              onMouseLeave={() => setActiveHoverItem(null)}
            >
              <button
                onClick={() => {
                  soundEngine.playClick();
                  if (item.onClick) item.onClick();
                }}
                className={`w-full py-1.5 px-0.5 rounded-xl border border-slate-800/70 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900 flex flex-col items-center justify-center gap-0.5 transition active:scale-95 cursor-pointer group relative`}
                title={item.fullLabel}
              >
                <div className="relative">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${item.color}`} />
                  {/* Micro Badge Dot/Text */}
                  <span className={`absolute -top-1.5 -right-2 px-0.8 py-0.2 rounded-full text-[7px] font-tech font-extrabold border leading-none scale-75 origin-top-left ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>
                <span className="text-[8px] font-tech font-bold text-slate-300 tracking-tight leading-tight group-hover:text-white transition">
                  {item.label}
                </span>
              </button>

              {/* Floating Tooltip for wide screens / hover */}
              {activeHoverItem === item.id && (
                <div className="hidden sm:flex absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 px-2 py-1 bg-slate-900/95 border border-slate-700/80 rounded-lg shadow-xl backdrop-blur-md whitespace-nowrap items-center gap-1.5 pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                  <span className="text-[10px] font-tech font-bold text-white">
                    {item.fullLabel}
                  </span>
                  <ChevronRight className="w-3 h-3 text-cyan-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Rail Accent */}
      <div className="pt-2 text-center opacity-60">
        <span className="text-[7px] font-tech text-slate-600 block">
          L-RAIL
        </span>
      </div>
    </aside>
  );
};
