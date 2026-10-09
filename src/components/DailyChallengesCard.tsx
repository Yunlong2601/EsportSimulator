import React from 'react';
import { DailyChallenge } from '../types/game';
import { Calendar, CheckCircle2, Clock, Gift, Sparkles, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../utils/audio';

interface DailyChallengesCardProps {
  challenges: DailyChallenge[];
  onClaim: (id: string) => void;
}

export const DailyChallengesCard: React.FC<DailyChallengesCardProps> = ({
  challenges,
  onClaim
}) => {
  const completedCount = challenges.filter(c => c.claimed).length;

  const handleClaimReward = (id: string) => {
    soundEngine.playCoin();
    // Fire mini confetti burst
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#f59e0b', '#38bdf8', '#10b981']
    });
    onClaim(id);
  };

  return (
    <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-3 chamfer-card select-none">
      {/* Header with Title and Reset Timer */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Gift className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-tech font-bold text-white text-xs sm:text-sm">
                每日排位目标
              </h4>
              <span className="text-[9px] px-1.5 py-0.2 rounded font-code font-bold bg-amber-950 text-amber-300 border border-amber-800">
                {completedCount}/{challenges.length} 已完成
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans">
              今日完成目标获取额外胜点 LP 与战备金奖励
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-code text-slate-400 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
          <Clock className="w-3 h-3 text-cyan-400" />
          <span>次日 00:00 重置</span>
        </div>
      </div>

      {/* Challenges List */}
      <div className="space-y-2">
        {challenges.map((ch) => {
          const isComplete = ch.current >= ch.target;
          const progressPct = Math.min(100, Math.round((ch.current / ch.target) * 100));

          return (
            <div
              key={ch.id}
              className={`p-2.5 rounded-xl border transition flex flex-col justify-between gap-2 ${
                ch.claimed
                  ? 'bg-slate-950/40 border-slate-800 opacity-60'
                  : isComplete
                  ? 'bg-amber-950/20 border-amber-500/50 shadow-sm'
                  : 'bg-slate-950/70 border-slate-800/90'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <span className="text-xl shrink-0 mt-0.5">{ch.icon}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h5 className="font-tech font-bold text-white text-xs">
                        {ch.title}
                      </h5>
                      <span className="text-[9px] font-code font-bold text-amber-300 px-1 rounded bg-slate-900 border border-slate-800">
                        +{ch.rewardLp} LP
                      </span>
                      {ch.rewardMoney && (
                        <span className="text-[9px] font-code font-bold text-emerald-400">
                          +${ch.rewardMoney}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans leading-tight mt-0.5">
                      {ch.description}
                    </p>
                  </div>
                </div>

                {/* Claim / Status Action Button */}
                <div className="shrink-0">
                  {ch.claimed ? (
                    <span className="flex items-center gap-1 text-[10px] font-tech font-bold text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded-lg border border-emerald-800/50">
                      <CheckCircle2 className="w-3 h-3" /> 已领取
                    </span>
                  ) : isComplete ? (
                    <button
                      onClick={() => handleClaimReward(ch.id)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-tech font-bold uppercase bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 cursor-pointer shadow-md shadow-amber-500/30 animate-pulse active:scale-95 transition"
                    >
                      领取 +{ch.rewardLp} LP
                    </button>
                  ) : (
                    <span className="text-[10px] font-code text-slate-400 px-2 py-1 rounded bg-slate-900 border border-slate-800 font-semibold">
                      {ch.current} / {ch.target}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              {!ch.claimed && (
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden flex items-center">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isComplete ? 'bg-amber-400' : 'bg-cyan-500'
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
