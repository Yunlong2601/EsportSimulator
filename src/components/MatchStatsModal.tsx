import React from 'react';
import { Trophy, Award, BarChart3, X, Zap, Swords, Shield } from 'lucide-react';
import { Champion } from '../types/game';

interface MatchStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerPicks: (Champion | null)[];
  enemyPicks: (Champion | null)[];
  isWin: boolean;
}

export const MatchStatsModal: React.FC<MatchStatsModalProps> = ({
  isOpen,
  onClose,
  playerPicks,
  enemyPicks,
  isWin
}) => {
  if (!isOpen) return null;

  // Generate realistic stats based on picks
  const blueStats = [
    { role: 'TOP', name: playerPicks[0]?.name.split(',')[0] || 'Top', kda: isWin ? '4/2/8' : '2/5/3', dmg: 24500, maxDmg: 38000 },
    { role: 'JUG', name: playerPicks[1]?.name.split(',')[0] || 'Jungle', kda: isWin ? '6/1/11' : '3/4/5', dmg: 18200, maxDmg: 38000 },
    { role: 'MID', name: (playerPicks[2]?.name.split(',')[0] || 'Mid') + ' (You)', kda: isWin ? '12/1/7' : '7/4/4', dmg: 37800, maxDmg: 38000, isMvp: isWin },
    { role: 'ADC', name: playerPicks[3]?.name.split(',')[0] || 'ADC', kda: isWin ? '9/2/6' : '4/6/4', dmg: 31200, maxDmg: 38000 },
    { role: 'SUP', name: playerPicks[4]?.name.split(',')[0] || 'Support', kda: isWin ? '1/2/18' : '0/7/6', dmg: 9400, maxDmg: 38000 }
  ];

  const redStats = [
    { role: 'TOP', name: enemyPicks[0]?.name.split(',')[0] || 'Top', kda: isWin ? '2/6/2' : '6/2/5', dmg: 19800, maxDmg: 38000 },
    { role: 'JUG', name: enemyPicks[1]?.name.split(',')[0] || 'Jungle', kda: isWin ? '3/7/4' : '5/3/9', dmg: 16500, maxDmg: 38000 },
    { role: 'MID', name: enemyPicks[2]?.name.split(',')[0] || 'Mid', kda: isWin ? '2/7/3' : '9/3/6', dmg: 28900, maxDmg: 38000, isMvp: !isWin },
    { role: 'ADC', name: enemyPicks[3]?.name.split(',')[0] || 'ADC', kda: isWin ? '4/6/2' : '7/3/8', dmg: 27400, maxDmg: 38000 },
    { role: 'SUP', name: enemyPicks[4]?.name.split(',')[0] || 'Support', kda: isWin ? '1/8/5' : '1/3/14', dmg: 8100, maxDmg: 38000 }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative max-w-lg w-full bg-slate-900 border border-slate-700 rounded-2xl flex flex-col max-h-[85vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-tech font-bold text-white text-base">
                Post-Match Damage Charts & KDA
              </h3>
              <p className="text-[10px] text-slate-400">Match Duration: 31:42 • Patch 14.20</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MVP Banner */}
        <div className="px-4 py-2.5 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent border-b border-amber-500/30 flex items-center justify-between text-xs font-tech">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-white">MATCH MVP:</span>
            <span className="text-amber-300 font-extrabold">{isWin ? 'Prodigy (You)' : 'Enemy Mid Carry'}</span>
          </div>
          <span className="font-code font-bold text-amber-400 text-xs px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/40">
            9.8 Rating ★
          </span>
        </div>

        {/* Teams Breakdown */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Blue Side */}
          <div className="space-y-2">
            <div className="text-[11px] font-tech font-bold text-cyan-400 uppercase flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Blue Team {isWin ? '(VICTORY)' : '(DEFEAT)'}
            </div>
            {blueStats.map((p, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-tech">
                    <span className="text-[10px] font-bold text-cyan-400">{p.role}</span>
                    <span className="font-bold text-white">{p.name}</span>
                    {p.isMvp && <span className="text-[9px] px-1 rounded bg-amber-500 text-slate-950 font-bold">MVP</span>}
                  </div>
                  <div className="font-code text-slate-300 font-semibold">{p.kda}</div>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-code">
                  <div className="flex-1 bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-500 h-full rounded-full"
                      style={{ width: `${(p.dmg / 38000) * 100}%` }}
                    />
                  </div>
                  <span className="w-12 text-right">{p.dmg.toLocaleString()} DMG</span>
                </div>
              </div>
            ))}
          </div>

          {/* Red Side */}
          <div className="space-y-2">
            <div className="text-[11px] font-tech font-bold text-rose-400 uppercase flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5" /> Red Team {!isWin ? '(VICTORY)' : '(DEFEAT)'}
            </div>
            {redStats.map((p, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-tech">
                    <span className="text-[10px] font-bold text-rose-400">{p.role}</span>
                    <span className="font-bold text-white">{p.name}</span>
                    {p.isMvp && <span className="text-[9px] px-1 rounded bg-amber-500 text-slate-950 font-bold">MVP</span>}
                  </div>
                  <div className="font-code text-slate-300 font-semibold">{p.kda}</div>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-code">
                  <div className="flex-1 bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full"
                      style={{ width: `${(p.dmg / 38000) * 100}%` }}
                    />
                  </div>
                  <span className="w-12 text-right">{p.dmg.toLocaleString()} DMG</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-tech font-bold text-xs uppercase cursor-pointer"
          >
            Close Match Summary
          </button>
        </div>
      </div>
    </div>
  );
};
