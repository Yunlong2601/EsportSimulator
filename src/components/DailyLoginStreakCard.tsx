import React, { useState } from 'react';
import { LoginStreakState, ProGearSkin } from '../types/game';
import { STREAK_DAYS_CONFIG } from '../data/loginStreakData';
import { Flame, CheckCircle2, Sparkles, Gift, Clock, ShieldCheck, ChevronRight, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../utils/audio';

interface DailyLoginStreakCardProps {
  loginStreak: LoginStreakState;
  onClaim: () => void;
  onEquipSkin: (skinId: string) => void;
}

export const DailyLoginStreakCard: React.FC<DailyLoginStreakCardProps> = ({
  loginStreak,
  onClaim,
  onEquipSkin
}) => {
  const [showSkinsWardrobe, setShowSkinsWardrobe] = useState<boolean>(false);
  const activeDayIndex = (loginStreak.currentStreak - 1) % 7;
  const currentConfig = STREAK_DAYS_CONFIG[activeDayIndex];

  const handleClaim = () => {
    confetti({
      particleCount: 35,
      spread: 65,
      origin: { y: 0.75 },
      colors: ['#f59e0b', '#38bdf8', '#ef4444', '#10b981']
    });
    onClaim();
  };

  const equippedSkin = loginStreak.unlockedSkins.find(s => s.id === loginStreak.equippedSkinId);

  return (
    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 border border-amber-500/30 shadow-md space-y-3 chamfer-card select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Flame className="w-4 h-4 fill-current text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-tech font-bold text-white text-xs sm:text-sm">
                Daily Login Streak
              </h4>
              <span className="text-[9px] px-1.5 py-0.2 rounded font-code font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                🔥 Day {loginStreak.currentStreak}/7
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans">
              Log in consecutively for bonus LP & exclusive Pro-Gear skins
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowSkinsWardrobe(true)}
          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-tech font-bold border border-slate-700 cursor-pointer flex items-center gap-1"
        >
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Skins ({loginStreak.unlockedSkins.length})</span>
        </button>
      </div>

      {/* 7-Day Flame Track (Horizontal compact row) */}
      <div className="grid grid-cols-7 gap-1">
        {STREAK_DAYS_CONFIG.map((dayItem, idx) => {
          const isPassed = idx < activeDayIndex;
          const isToday = idx === activeDayIndex;
          const hasSkin = !!dayItem.proGearSkin;

          return (
            <div
              key={dayItem.day}
              className={`p-1 rounded-lg text-center flex flex-col items-center justify-between transition-all border ${
                isPassed
                  ? 'bg-slate-950/70 border-emerald-500/30 text-emerald-400'
                  : isToday
                  ? 'bg-amber-950/40 border-amber-400 shadow-sm shadow-amber-500/20 text-white'
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-500'
              }`}
            >
              <div className="text-[9px] font-tech font-bold">
                {isPassed ? <CheckCircle2 className="w-3 h-3 mx-auto text-emerald-400" /> : `D${dayItem.day}`}
              </div>

              <div className="my-1 text-sm">
                {hasSkin ? dayItem.proGearSkin!.icon : '⚡'}
              </div>

              <div className="text-[8px] font-code font-bold text-amber-400 truncate w-full">
                +{dayItem.rewardLp}
              </div>
            </div>
          );
        })}
      </div>

      {/* Today's Reward Banner & Claim Action */}
      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90 flex items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-tech font-bold text-white">
            <span>Today's Gift:</span>
            <span className="text-cyan-400">+{currentConfig.rewardLp} LP</span>
            <span className="text-emerald-400">+${currentConfig.rewardCash}</span>
          </div>
          {currentConfig.proGearSkin ? (
            <div className="text-[10px] text-amber-300 font-sans flex items-center gap-1 mt-0.5 font-semibold">
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate">Includes: {currentConfig.proGearSkin.name}</span>
            </div>
          ) : (
            <div className="text-[9px] text-slate-400 font-sans">
              Keep the streak alive to unlock Day 7 Legendary Mouse!
            </div>
          )}
        </div>

        <button
          disabled={!loginStreak.canClaimToday}
          onClick={handleClaim}
          className={`px-3.5 py-2 rounded-xl text-xs font-tech font-extrabold uppercase transition shrink-0 cursor-pointer ${
            loginStreak.canClaimToday
              ? 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-md shadow-amber-500/30 animate-pulse active:scale-95'
              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
          }`}
        >
          {loginStreak.canClaimToday ? `CLAIM DAY ${currentConfig.day}` : 'CLAIMED ✓'}
        </button>
      </div>

      {/* Equipped Skin Pill */}
      {equippedSkin && (
        <div className="px-2.5 py-1.5 rounded-lg bg-slate-950/60 border border-amber-500/20 flex items-center justify-between text-[10px] font-tech">
          <div className="flex items-center gap-1.5">
            <span>{equippedSkin.icon}</span>
            <span className="text-slate-300">Equipped Pro-Gear:</span>
            <span className="text-amber-300 font-bold truncate">{equippedSkin.name}</span>
          </div>
          <span className="text-cyan-400 font-code font-bold">
            +{equippedSkin.mechanicsBonus} APM / +{equippedSkin.mentalBonus} Mental
          </span>
        </div>
      )}

      {/* Pro-Gear Skins Wardrobe Modal */}
      {showSkinsWardrobe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-sm w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="font-tech font-bold text-white text-sm">Pro-Gear Skins Wardrobe</h4>
              </div>
              <button
                onClick={() => setShowSkinsWardrobe(false)}
                className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {loginStreak.unlockedSkins.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-950 text-center text-xs text-slate-400 space-y-1">
                  <div>🔒 No Pro-Gear skins unlocked yet.</div>
                  <p className="text-[10px] text-slate-500">
                    Reach Day 3, Day 5, and Day 7 on your Login Streak to claim exclusive skins!
                  </p>
                </div>
              ) : (
                loginStreak.unlockedSkins.map((skin) => {
                  const isEquipped = loginStreak.equippedSkinId === skin.id;

                  return (
                    <div
                      key={skin.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 ${
                        isEquipped
                          ? 'bg-amber-950/30 border-amber-400'
                          : 'bg-slate-950/70 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-2xl">{skin.icon}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-tech font-bold text-white truncate">
                              {skin.name}
                            </span>
                            <span className="text-[8px] font-code px-1 rounded bg-slate-900 text-amber-400 border border-slate-700">
                              {skin.rarity}
                            </span>
                          </div>
                          <div className="text-[9px] text-cyan-400 font-code font-semibold">
                            +{skin.mechanicsBonus} Mechanics • +{skin.mentalBonus} Mental
                          </div>
                        </div>
                      </div>

                      <button
                        disabled={isEquipped}
                        onClick={() => onEquipSkin(skin.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-tech font-bold uppercase cursor-pointer shrink-0 ${
                          isEquipped
                            ? 'bg-amber-400 text-slate-950 cursor-default'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        {isEquipped ? 'Active' : 'Equip'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={() => setShowSkinsWardrobe(false)}
              className="w-full py-2 rounded-xl bg-slate-800 text-white font-tech font-bold text-xs uppercase cursor-pointer"
            >
              Close Wardrobe
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
