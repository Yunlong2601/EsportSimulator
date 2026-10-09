import React from 'react';
import { Trophy, Award, Medal, Crown, X, CheckCircle2, Lock } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface TrophyModalProps {
  isOpen: boolean;
  onClose: () => void;
  trophies: {
    challengerUnlocked: boolean;
    regionalChampion: boolean;
    worldsSummonerCup: boolean;
    mvpTrophy: boolean;
  };
}

export const TrophyModal: React.FC<TrophyModalProps> = ({ isOpen, onClose, trophies }) => {
  if (!isOpen) return null;

  const trophyList = [
    {
      id: 'challenger',
      title: 'Challenger Crest (1,000 LP)',
      subtitle: 'Achieved top 0.01% ranking in Solo Queue and scouted into the professional scene.',
      icon: Medal,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/30',
      unlocked: trophies.challengerUnlocked
    },
    {
      id: 'regional',
      title: 'Regional Championship Banner',
      subtitle: 'Dominated the regional split playoffs and qualified for Worlds as #1 seed.',
      icon: Award,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10 border-indigo-500/30',
      unlocked: trophies.regionalChampion
    },
    {
      id: 'worlds',
      title: 'The Summoner’s Cup',
      subtitle: 'Victorious in the World Championship Grand Finals before 50,000 roaring arena fans.',
      icon: Trophy,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/30',
      unlocked: trophies.worldsSummonerCup
    },
    {
      id: 'mvp',
      title: 'Worlds Finals MVP Ring',
      subtitle: 'Awarded to the indisputable best player on the global tournament stage.',
      icon: Crown,
      color: 'text-yellow-300',
      bgColor: 'bg-yellow-500/10 border-yellow-500/30',
      unlocked: trophies.mvpTrophy
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative max-w-lg w-full bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h3 className="text-xl font-bold font-tech text-white">Trophy Cabinet & Accolades</h3>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          {trophyList.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all flex items-start gap-4 ${
                  item.unlocked
                    ? `${item.bgColor} shadow-lg`
                    : 'bg-slate-800/40 border-slate-800 opacity-60'
                }`}
              >
                <div
                  className={`p-3 rounded-lg border ${
                    item.unlocked
                      ? `${item.bgColor} ${item.color}`
                      : 'bg-slate-800 border-slate-700 text-slate-500'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-white font-tech text-sm sm:text-base">
                      {item.title}
                    </h4>
                    {item.unlocked ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Unlocked
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <Lock className="w-3.5 h-3.5" /> Locked
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
