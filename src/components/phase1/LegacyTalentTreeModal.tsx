import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  TrendingUp,
  BatteryCharging,
  Swords,
  CheckCircle2,
  Lock,
  X,
  Crown,
  Shield,
  Coffee,
  HeartPulse,
  Brain,
  Rocket
} from 'lucide-react';
import { soundEngine } from '../../utils/audio';
import { LegacyPassive, PrestigeState } from '../../types/game';
import { LEGACY_PASSIVES_CATALOG } from '../../data/prestigeData';

interface LegacyTalentTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  prestigeState: PrestigeState;
  onUnlockPassive: (passiveId: string) => { success: boolean; message: string };
  onOpenPrestigeHall?: () => void;
}

export type TalentCategoryFilter = 'all' | 'stat_multipliers' | 'fatigue_recovery' | 'solo_queue_buffs';

export const LegacyTalentTreeModal: React.FC<LegacyTalentTreeModalProps> = ({
  isOpen,
  onClose,
  prestigeState,
  onUnlockPassive,
  onOpenPrestigeHall
}) => {
  const [filter, setFilter] = useState<TalentCategoryFilter>('all');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Categorize passives into user's three prioritized buckets:
  // 1. Stat Multipliers
  // 2. Faster Fatigue Recovery
  // 3. Specialized Solo Queue Buffs
  const getTalentCategory = (p: LegacyPassive): 'stat_multipliers' | 'fatigue_recovery' | 'solo_queue_buffs' => {
    if (['passive_muscle_memory', 'passive_deep_champ_pool', 'passive_phoenix_rebirth'].includes(p.id)) {
      return 'stat_multipliers';
    }
    if (['passive_infinite_battery', 'passive_fatigue_metabolism', 'passive_titanium_wrist'].includes(p.id)) {
      return 'fatigue_recovery';
    }
    return 'solo_queue_buffs';
  };

  const filteredPassives = LEGACY_PASSIVES_CATALOG.filter(p => {
    if (filter === 'all') return true;
    return getTalentCategory(p) === filter;
  });

  const handleUnlock = (p: LegacyPassive) => {
    const res = onUnlockPassive(p.id);
    setFeedbackMsg(res.message);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const unlockedCount = prestigeState.unlockedPassives.length;
  const totalCount = LEGACY_PASSIVES_CATALOG.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative max-w-2xl w-full max-h-[92vh] flex flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/60 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.3)] text-left overflow-hidden chamfer-card">
        
        {/* Glow Header */}
        <div className="p-4 sm:p-5 border-b border-amber-500/20 bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold font-tech text-white tracking-wide">
                  永久传承天赋树 (Legacy Talent Tree)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-code bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {unlockedCount}/{totalCount} 已激活
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                消耗前世周目结算累积的【名宿声望点数】，永久强化各项属性倍率、疲劳恢复与单排专属战力！
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prestige Balance & Quick Summary Banner */}
        <div className="bg-slate-950/80 px-4 py-2.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-tech text-slate-400">可用名宿声望:</span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-code font-extrabold text-amber-300 text-sm">
                {prestigeState.prestigePoints.toLocaleString()} P
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-code">
              (第 {prestigeState.generation} 周目 · 难度 x{prestigeState.difficultyMultiplier.toFixed(2)})
            </span>
          </div>

          {onOpenPrestigeHall && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenPrestigeHall();
              }}
              className="text-xs font-tech text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>查看周目转生与结局图鉴 →</span>
            </button>
          )}
        </div>

        {/* 3 Categories Filter Bar */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1 shrink-0 overflow-x-auto text-xs font-tech font-bold">
          <button
            onClick={() => { soundEngine.playClick(); setFilter('all'); }}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              filter === 'all'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>全部天赋 ({totalCount})</span>
          </button>
          <button
            onClick={() => { soundEngine.playClick(); setFilter('stat_multipliers'); }}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              filter === 'stat_multipliers'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>属性倍率 (Stat Multipliers)</span>
          </button>
          <button
            onClick={() => { soundEngine.playClick(); setFilter('fatigue_recovery'); }}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              filter === 'fatigue_recovery'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            <span>极速恢复 (Fatigue Recovery)</span>
          </button>
          <button
            onClick={() => { soundEngine.playClick(); setFilter('solo_queue_buffs'); }}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              filter === 'solo_queue_buffs'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Swords className="w-3.5 h-3.5 text-rose-400" />
            <span>单排专属增益 (Solo Queue Buffs)</span>
          </button>
        </div>

        {/* Feedback message banner */}
        {feedbackMsg && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-tech flex items-center gap-2 animate-fade-in shrink-0">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Talents Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
          {filteredPassives.map(passive => {
            const isUnlocked = prestigeState.unlockedPassives.includes(passive.id);
            const canAfford = prestigeState.prestigePoints >= passive.cost;
            const category = getTalentCategory(passive);

            return (
              <div
                key={passive.id}
                className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isUnlocked
                    ? 'bg-slate-900/90 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                    : canAfford
                    ? 'bg-slate-900/70 border-amber-500/40 hover:border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                    : 'bg-slate-950/60 border-slate-800 opacity-75'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`text-2xl p-2.5 rounded-xl border shrink-0 ${
                    isUnlocked ? 'bg-emerald-950/40 border-emerald-500/40' : 'bg-slate-800/80 border-slate-700'
                  }`}>
                    {passive.icon}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white font-tech text-sm">{passive.name}</span>
                      <span className={`text-[10px] px-2 py-0.2 rounded font-tech font-bold ${
                        category === 'stat_multipliers'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                          : category === 'fatigue_recovery'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : 'bg-indigo-950 text-indigo-300 border border-indigo-500/40'
                      }`}>
                        {category === 'stat_multipliers' ? '属性倍率' : category === 'fatigue_recovery' ? '极速恢复' : '单排专属'}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                        Tier {passive.tier}
                      </span>
                      {isUnlocked && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" /> 已永久生效
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans">{passive.description}</p>
                    <p className="text-[11px] text-amber-300 font-mono mt-1 font-bold">
                      ✦ 核心实机效果: {passive.bonusSummary}
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-auto shrink-0 flex items-center justify-end">
                  {isUnlocked ? (
                    <span className="text-emerald-400 font-bold font-tech text-xs px-3.5 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center gap-1 shadow">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 已永久传承
                    </span>
                  ) : (
                    <button
                      onClick={() => handleUnlock(passive)}
                      disabled={!canAfford}
                      className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold font-tech transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        canAfford
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>永久点亮 ({passive.cost} P)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Current Active Buffs Summary Ticker */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] font-tech text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5 truncate">
            <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">
              已激活传承: {prestigeState.unlockedPassives.length > 0
                ? prestigeState.unlockedPassives.map(id => LEGACY_PASSIVES_CATALOG.find(p => p.id === id)?.name).filter(Boolean).join(' · ')
                : '暂未点亮任何传承天赋'}
            </span>
          </div>
          <span className="text-amber-400 shrink-0 ml-2 font-bold font-code">
            {prestigeState.unlockedPassives.length}/{totalCount} 项
          </span>
        </div>

      </div>
    </div>
  );
};
