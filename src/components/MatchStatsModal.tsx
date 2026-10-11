import React, { useState } from 'react';
import { 
  Trophy, 
  Award, 
  BarChart3, 
  X, 
  Zap, 
  Swords, 
  Shield, 
  Flame, 
  Sparkles, 
  Skull, 
  Target, 
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import { Champion, PlayerStats, PlayerRivalryState } from '../types/game';
import { soundEngine } from '../utils/audio';

interface MatchStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerPicks: (Champion | null)[];
  enemyPicks: (Champion | null)[];
  isWin: boolean;
  playerStats?: PlayerStats;
  rivalry?: PlayerRivalryState;
  onOpenMvpCelebration?: () => void;
}

const ROLE_NAMES: Record<string, string> = {
  TOP: '上单',
  JUG: '打野',
  MID: '中单',
  ADC: '射手',
  SUP: '辅助'
};

export const MatchStatsModal: React.FC<MatchStatsModalProps> = ({
  isOpen,
  onClose,
  playerPicks,
  enemyPicks,
  isWin,
  playerStats,
  rivalry,
  onOpenMvpCelebration
}) => {
  if (!isOpen) return null;

  const currentRivalry = rivalry || playerStats?.rivalry;
  const primaryNemesis = currentRivalry?.trackedOpponents?.find(o => o.isNemesis) || {
    name: currentRivalry?.rivalName || '顾寒舟',
    handle: currentRivalry?.rivalHandle || 'ColdBlade',
    avatar: currentRivalry?.rivalAvatar || '🥷',
    signatureChamp: currentRivalry?.signatureChamp || '影流之主 (劫)',
    encountersCount: 3,
    playerWins: currentRivalry?.playerWins || 2,
    rivalWins: currentRivalry?.rivalWins || 1,
    bountyLp: 15
  };

  const nemesisBonusLp = primaryNemesis.bountyLp || 15;
  const baseLp = isWin ? 22 : -16;
  const totalLpAwarded = isWin ? baseLp + nemesisBonusLp : baseLp;

  // Generate realistic stats based on picks
  const blueStats = [
    { role: 'TOP', name: playerPicks[0]?.name.split(',')[0] || '上单', kda: isWin ? '4/2/8' : '2/5/3', dmg: 24500, maxDmg: 38000 },
    { role: 'JUG', name: playerPicks[1]?.name.split(',')[0] || '打野', kda: isWin ? '6/1/11' : '3/4/5', dmg: 18200, maxDmg: 38000 },
    { role: 'MID', name: (playerPicks[2]?.name.split(',')[0] || '中单') + ' (你)', kda: isWin ? '12/1/7' : '7/4/4', dmg: 37800, maxDmg: 38000, isMvp: isWin },
    { role: 'ADC', name: playerPicks[3]?.name.split(',')[0] || '射手', kda: isWin ? '9/2/6' : '4/6/4', dmg: 31200, maxDmg: 38000 },
    { role: 'SUP', name: playerPicks[4]?.name.split(',')[0] || '辅助', kda: isWin ? '1/2/18' : '0/7/6', dmg: 9400, maxDmg: 38000 }
  ];

  // Opposing Red Side: Mark the Nemesis in the Mid lane (or matching role)
  const redStats = [
    { role: 'TOP', name: enemyPicks[0]?.name.split(',')[0] || '上单', kda: isWin ? '2/6/2' : '6/2/5', dmg: 19800, maxDmg: 38000 },
    { role: 'JUG', name: enemyPicks[1]?.name.split(',')[0] || '打野', kda: isWin ? '3/7/4' : '5/3/9', dmg: 16500, maxDmg: 38000 },
    { 
      role: 'MID', 
      name: `${primaryNemesis.name} (${primaryNemesis.handle})`, 
      kda: isWin ? '2/7/3' : '9/3/6', 
      dmg: 28900, 
      maxDmg: 38000, 
      isMvp: !isWin,
      isNemesis: true, // SPECIAL NEMESIS FLAG
      avatar: primaryNemesis.avatar,
      encounters: primaryNemesis.encountersCount,
      headToHead: `${primaryNemesis.playerWins}胜 - ${primaryNemesis.rivalWins}负`
    },
    { role: 'ADC', name: enemyPicks[3]?.name.split(',')[0] || '射手', kda: isWin ? '4/6/2' : '7/3/8', dmg: 27400, maxDmg: 38000 },
    { role: 'SUP', name: enemyPicks[4]?.name.split(',')[0] || '辅助', kda: isWin ? '1/8/5' : '1/3/14', dmg: 8100, maxDmg: 38000 }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/88 backdrop-blur-md animate-fade-in select-none">
      <div className="relative max-w-lg w-full bg-slate-900 border border-slate-700 rounded-2xl flex flex-col max-h-[88vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-tech font-bold text-white text-base">
                赛后战损伤害图表与 KDA 战报
              </h3>
              <p className="text-[10px] text-slate-400">官方赛事服 14.20 版本 • 天梯高分巅峰对局</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* NEMESIS DEFEAT BOUNTY BANNER (Awarding bonus LP for defeating Nemesis) */}
        {isWin && (
          <div className="px-3.5 py-2.5 bg-gradient-to-r from-rose-950/80 via-red-900/60 to-slate-900 border-b border-rose-500/50 flex items-center justify-between text-xs animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-rose-600 text-white shadow-md shadow-rose-600/40 animate-pulse">
                <Skull className="w-4 h-4" />
              </span>
              <div>
                <div className="flex items-center gap-1.5 font-tech font-extrabold text-white">
                  <span>🔥 宿敌斩落！终结一生之敌【{primaryNemesis.name}】</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-code bg-rose-500/30 text-rose-300 border border-rose-500/50">
                    NEMESIS DOWN
                  </span>
                </div>
                <p className="text-[10px] text-rose-200/90 font-sans mt-0.5">
                  成功猎杀天梯常客宿敌，已全额派发 <span className="text-amber-300 font-bold font-code">+{nemesisBonusLp} LP</span> 专属高额悬赏！
                </p>
              </div>
            </div>

            <div className="text-right pl-2 shrink-0">
              <span className="text-[9px] font-tech text-rose-300 block">宿敌赏金加成</span>
              <span className="text-sm font-black font-code text-amber-300">
                +{nemesisBonusLp} LP
              </span>
            </div>
          </div>
        )}

        {/* MVP Banner with Option to Open Framer Motion MVP Highlight Pop-up */}
        <div className="px-3.5 py-2 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent border-b border-amber-500/30 flex items-center justify-between text-xs font-tech">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-white">本场对局 MVP 选手:</span>
            <span className="text-amber-300 font-extrabold">{isWin ? '宿命先锋 (你)' : `${primaryNemesis.name}`}</span>
          </div>

          {onOpenMvpCelebration ? (
            <button
              onClick={() => {
                soundEngine.playVictory();
                onOpenMvpCelebration();
              }}
              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:scale-102 active:scale-98 text-slate-950 font-bold font-tech text-[10px] shadow-sm flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-slate-950" />
              <span>MVP Highlight 高光典礼 →</span>
            </button>
          ) : (
            <span className="font-code font-bold text-amber-400 text-xs px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/40">
              9.9 卓越评分 ★
            </span>
          )}
        </div>

        {/* Teams Breakdown */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5">
          {/* Blue Side */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-tech font-bold text-cyan-400 uppercase flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> 蓝方战队 {isWin ? '(胜方 VICTORY)' : '(败方 DEFEAT)'}
              </span>
              {isWin && (
                <span className="text-[10px] text-emerald-400 font-code font-bold">
                  总结算: +{totalLpAwarded} LP (含宿敌赏金 +{nemesisBonusLp})
                </span>
              )}
            </div>

            {blueStats.map((p, i) => (
              <div key={i} className={`p-2.5 rounded-xl border text-xs space-y-1 transition ${p.isMvp ? 'bg-cyan-950/30 border-cyan-500/50 shadow-sm' : 'bg-slate-950/60 border-slate-800'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-tech">
                    <span className="text-[10px] font-bold text-cyan-400">{ROLE_NAMES[p.role]}</span>
                    <span className="font-bold text-white">{p.name}</span>
                    {p.isMvp && (
                      <span className="text-[8px] px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-extrabold shadow-sm">
                        MVP
                      </span>
                    )}
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
                  <span className="w-16 text-right font-code">{p.dmg.toLocaleString()} 伤害</span>
                </div>
              </div>
            ))}
          </div>

          {/* Red Side (With Nemesis Status Icon & Badge) */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-tech font-bold text-rose-400 uppercase flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Swords className="w-3.5 h-3.5" /> 红方对手 {!isWin ? '(胜方 VICTORY)' : '(败方 DEFEAT)'}
              </span>
              <span className="text-[10px] text-rose-300 font-tech">
                侦测到 1 名天梯高频宿敌 (Nemesis)
              </span>
            </div>

            {redStats.map((p, i) => (
              <div 
                key={i} 
                className={`p-2.5 rounded-xl border text-xs space-y-1 transition ${
                  p.isNemesis 
                    ? 'bg-gradient-to-r from-rose-950/40 to-slate-950/80 border-rose-500/70 shadow-[0_0_15px_rgba(244,63,94,0.25)] ring-1 ring-rose-500/40' 
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-tech">
                    <span className="text-[10px] font-bold text-rose-400">{ROLE_NAMES[p.role]}</span>
                    
                    {/* SPECIAL NEMESIS STATUS ICON & BADGE */}
                    {p.isNemesis ? (
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-white flex items-center gap-1">
                          <span>{p.avatar}</span>
                          <span>{p.name}</span>
                        </span>
                        
                        {/* Nemesis Status Icon Pill */}
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[8px] font-tech font-black bg-rose-600 text-white uppercase shadow-sm border border-rose-400/60 animate-pulse">
                          <Skull className="w-2.5 h-2.5" />
                          <span>NEMESIS 宿敌</span>
                        </span>

                        <span className="text-[8px] font-code text-rose-300/80 hidden xs:inline">
                          (撞车 {p.encounters} 次 · {p.headToHead})
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold text-white">{p.name}</span>
                    )}

                    {p.isMvp && (
                      <span className="text-[8px] px-1 rounded bg-amber-500 text-slate-950 font-bold">
                        MVP
                      </span>
                    )}
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
                  <span className="w-16 text-right font-code">{p.dmg.toLocaleString()} 伤害</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Close & Action Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/90 flex items-center gap-2">
          {onOpenMvpCelebration && isWin && (
            <button
              onClick={() => {
                soundEngine.playVictory();
                onOpenMvpCelebration();
              }}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-tech font-extrabold text-xs uppercase flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>MVP Highlight 高光典礼</span>
            </button>
          )}

          <button
            onClick={onClose}
            className={`py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-tech font-bold text-xs uppercase cursor-pointer ${onOpenMvpCelebration && isWin ? 'px-4' : 'w-full'}`}
          >
            返回对局主控台
          </button>
        </div>
      </div>
    </div>
  );
};
