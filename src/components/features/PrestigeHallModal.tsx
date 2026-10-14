import React, { useState } from 'react';
import {
  RotateCcw,
  Sparkles,
  Zap,
  Shield,
  Briefcase,
  Heart,
  Crown,
  Scroll,
  Flame,
  CheckCircle2,
  Lock,
  ChevronRight,
  TrendingUp,
  X,
  Award,
  AlertTriangle
} from 'lucide-react';
import { soundEngine } from '../../utils/audio';
import {
  PrestigeState,
  LegacyPassive,
  RunModifier,
  CareerEnding,
  PlayerStats
} from '../../types/game';
import {
  LEGACY_PASSIVES_CATALOG,
  RUN_MODIFIERS_CATALOG,
  CAREER_ENDINGS_CATALOG,
  calculatePrestigeYield,
  getDifficultyMultiplier
} from '../../data/prestigeData';

interface PrestigeHallModalProps {
  isOpen: boolean;
  onClose: () => void;
  prestigeState: PrestigeState;
  playerStats: PlayerStats;
  wonWorlds: boolean;
  wonRegional: boolean;
  onRebirth: (endingId?: string) => void;
  onUnlockPassive: (passiveId: string) => { success: boolean; message: string };
  onToggleModifier: (modId: string) => void;
  onOpenWorldTour?: () => void;
}

export const PrestigeHallModal: React.FC<PrestigeHallModalProps> = ({
  isOpen,
  onClose,
  prestigeState,
  playerStats,
  wonWorlds,
  wonRegional,
  onRebirth,
  onUnlockPassive,
  onToggleModifier,
  onOpenWorldTour
}) => {
  const [activeTab, setActiveTab] = useState<'rebirth' | 'passives' | 'modifiers' | 'endings'>('rebirth');
  const [selectedBranch, setSelectedBranch] = useState<'all' | 'mechanics' | 'tactics' | 'commercial' | 'longevity'>('all');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentYield = calculatePrestigeYield(
    wonWorlds,
    wonRegional,
    playerStats.lp >= 1000,
    playerStats.money,
    playerStats.fame,
    prestigeState.activeModifiers,
    prestigeState.generation
  );

  const nextGen = prestigeState.generation + 1;
  const nextMultiplier = getDifficultyMultiplier(nextGen);

  const filteredPassives = selectedBranch === 'all'
    ? LEGACY_PASSIVES_CATALOG
    : LEGACY_PASSIVES_CATALOG.filter(p => p.branch === selectedBranch);

  const handleBuyPassive = (p: LegacyPassive) => {
    const res = onUnlockPassive(p.id);
    setFeedbackMsg(res.message);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleConfirmRebirth = () => {
    if (window.confirm(`确定要进入第 ${nextGen} 周目轮回吗？\n当前周目将结算 +${currentYield.total} 点声望，保留全部已解锁的永久天赋，以更高难度与强化属性重开全新职业生涯！`)) {
      onRebirth();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative max-w-2xl w-full max-h-[92vh] flex flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/60 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.25)] text-left overflow-hidden chamfer-card">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-amber-500/20 bg-gradient-to-r from-amber-950/40 via-slate-900 to-purple-950/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <RotateCcw className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold font-tech text-white tracking-wide">
                  名宿声望殿堂 · 轮回与传承
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-code bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  第 {prestigeState.generation} 周目 (x{prestigeState.difficultyMultiplier.toFixed(2)})
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                永恒声望点数: <span className="text-amber-400 font-bold font-code text-sm">{prestigeState.prestigePoints.toLocaleString()}</span> | 历史累计: <span className="text-slate-300 font-code">{prestigeState.lifetimePrestigePoints.toLocaleString()}</span>
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1 shrink-0 overflow-x-auto text-xs font-tech font-bold">
          <button
            onClick={() => { soundEngine.playClick(); setActiveTab('rebirth'); }}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'rebirth'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>轮回转生 (NG+)</span>
          </button>
          <button
            onClick={() => { soundEngine.playClick(); setActiveTab('passives'); }}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'passives'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>永久天赋树 ({prestigeState.unlockedPassives.length}/{LEGACY_PASSIVES_CATALOG.length})</span>
          </button>
          <button
            onClick={() => { soundEngine.playClick(); setActiveTab('modifiers'); }}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'modifiers'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>肉鸽挑战词条 ({prestigeState.activeModifiers.length})</span>
          </button>
          <button
            onClick={() => { soundEngine.playClick(); setActiveTab('endings'); }}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'endings'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Scroll className="w-3.5 h-3.5" />
            <span>结局图鉴 ({prestigeState.unlockedEndingIds.length}/{CAREER_ENDINGS_CATALOG.length})</span>
          </button>
        </div>

        {/* Feedback message banner */}
        {feedbackMsg && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-tech flex items-center gap-2 animate-fade-in shrink-0">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* TAB 1: 轮回转生 (New Game+) */}
          {activeTab === 'rebirth' && (
            <div className="space-y-4">
              <div className="bg-slate-900/90 rounded-xl p-4 border border-amber-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-tech">当前生涯代数</span>
                  <span className="text-xs text-amber-400 font-bold font-code">
                    第 {prestigeState.generation} 周目 → 即将进入 第 {nextGen} 周目
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-400 font-tech">下周目难度倍率</span>
                  <span className="text-xs text-rose-400 font-bold font-code">
                    x{nextMultiplier.toFixed(2)} (对手更强，但产出大幅提升)
                  </span>
                </div>

                <div className="h-px bg-slate-800 my-3" />

                <h4 className="text-xs font-bold text-slate-300 font-tech mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  本次轮回预计结算收获:
                </h4>
                <div className="space-y-1.5 bg-slate-950/70 p-3 rounded-lg border border-slate-800 text-xs font-code">
                  {currentYield.breakdown.map((item, idx) => (
                    <div key={idx} className="text-slate-300 flex items-center justify-between">
                      <span>{item}</span>
                    </div>
                  ))}
                  <div className="pt-2 mt-2 border-t border-slate-800 flex items-center justify-between font-bold text-amber-400 text-sm">
                    <span>总计入账声望:</span>
                    <span>+{currentYield.total} 名宿声望</span>
                  </div>
                </div>
              </div>

              {/* 传承保留清单 */}
              <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="font-bold text-slate-200 font-tech flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  转生轮回继承法则:
                </div>
                <ul className="space-y-1 text-[11px] text-slate-400 list-disc list-inside">
                  <li><strong className="text-emerald-400">保留:</strong> 所有已点亮的永久肉鸽天赋、结局图鉴、世界巡回赛天梯记录、名宿声望余额。</li>
                  <li><strong className="text-cyan-400">重开:</strong> 单排天梯从海选黄金段位起跑，享受前世天赋初始微操、资金、心态与知名度巨额加成！</li>
                  <li><strong className="text-amber-400">挑战:</strong> 对手在BP选人、微操与关键团战决策上将受到周目难度加权，体验真正的大师博弈！</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={handleConfirmRebirth}
                  className="flex-1 py-3 px-4 rounded-xl font-bold font-tech text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer active:scale-98"
                >
                  <RotateCcw className="w-5 h-5 fill-current" />
                  <span>立即轮回转生 · 开启第 {nextGen} 周目 (+{currentYield.total} 声望)</span>
                </button>

                {onOpenWorldTour && (
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onOpenWorldTour();
                    }}
                    className="py-3 px-4 rounded-xl font-bold font-tech text-cyan-300 bg-cyan-950/60 border border-cyan-500/50 hover:bg-cyan-900/60 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>征战百层世界巡回赛 →</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: 永久天赋树 (Legacy Passives) */}
          {activeTab === 'passives' && (
            <div className="space-y-3">
              {/* Branch Filter Buttons */}
              <div className="flex flex-wrap gap-1 text-[11px] font-tech font-bold">
                {[
                  { id: 'all', label: '全部' },
                  { id: 'mechanics', label: '⚡ 微操神经' },
                  { id: 'tactics', label: '🧠 战术战役' },
                  { id: 'commercial', label: '💼 商业帝国' },
                  { id: 'longevity', label: '🛡️ 职业长青' }
                ].map(b => (
                  <button
                    key={b.id}
                    onClick={() => { soundEngine.playClick(); setSelectedBranch(b.id as any); }}
                    className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                      selectedBranch === b.id
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {filteredPassives.map(passive => {
                  const isUnlocked = prestigeState.unlockedPassives.includes(passive.id);
                  const canAfford = prestigeState.prestigePoints >= passive.cost;

                  return (
                    <div
                      key={passive.id}
                      className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        isUnlocked
                          ? 'bg-slate-900/90 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                          : canAfford
                          ? 'bg-slate-900/70 border-amber-500/40 hover:border-amber-400'
                          : 'bg-slate-950/60 border-slate-800 opacity-75'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl p-2 rounded-xl bg-slate-800/80 border border-slate-700 shrink-0">
                          {passive.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white font-tech text-sm">{passive.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                              Tier {passive.tier}
                            </span>
                            {isUnlocked && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold flex items-center gap-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5" /> 已生效
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 mt-0.5">{passive.description}</p>
                          <p className="text-[11px] text-amber-300 font-mono mt-1">
                            ✦ 核心收益: {passive.bonusSummary}
                          </p>
                        </div>
                      </div>

                      <div className="w-full sm:w-auto shrink-0 flex items-center justify-end">
                        {isUnlocked ? (
                          <span className="text-emerald-400 font-bold font-tech text-xs px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40">
                            永久传承
                          </span>
                        ) : (
                          <button
                            onClick={() => handleBuyPassive(passive)}
                            disabled={!canAfford}
                            className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold font-tech transition cursor-pointer flex items-center justify-center gap-1.5 ${
                              canAfford
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95'
                                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                            }`}
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>点亮 ({passive.cost} 声望)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: 肉鸽挑战词条 (Run Modifiers) */}
          {activeTab === 'modifiers' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200">
                <span className="font-bold">⚡ 局内修罗挑战模式：</span>
                开启高难肉鸽词条将显著提升本局难度（如手部旧患、恶劣单排、资本寒冬等），但每次周目结算时将提供最高 <strong className="text-amber-400">+100% 以上</strong> 的名宿声望收益加权！
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {RUN_MODIFIERS_CATALOG.map(mod => {
                  const isActive = prestigeState.activeModifiers.includes(mod.id);

                  return (
                    <div
                      key={mod.id}
                      onClick={() => onToggleModifier(mod.id)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                        isActive
                          ? 'bg-rose-950/30 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl p-2 rounded-xl bg-slate-800 border border-slate-700 shrink-0">
                          {mod.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white font-tech text-sm">{mod.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                              难度: {'★'.repeat(mod.difficultyRating)}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                              +{Math.round(mod.scoreMultiplier * 100)}% 声望
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1">{mod.description}</p>
                          <p className="text-[11px] text-slate-500 italic mt-0.5">{mod.flavor}</p>
                        </div>
                      </div>

                      <div className="shrink-0 pt-1">
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={() => {}}
                          className="w-5 h-5 rounded border-slate-700 text-rose-600 focus:ring-0 cursor-pointer pointer-events-none"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: 职业结局图鉴 (Career Endings) */}
          {activeTab === 'endings' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
                <span className="text-slate-200 font-bold">多元职业生涯分支：</span>
                每一次从青训到世界之巅的抉择，都会在退役时刻结出不同的传奇果实。收集全部 6 大传奇结局，铸就电竞不朽神话！
              </div>

              <div className="grid grid-cols-1 gap-3">
                {CAREER_ENDINGS_CATALOG.map(ending => {
                  const isUnlocked = prestigeState.unlockedEndingIds.includes(ending.id);

                  return (
                    <div
                      key={ending.id}
                      className={`p-4 rounded-xl border transition ${
                        isUnlocked
                          ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/50 shadow-md'
                          : 'bg-slate-950/70 border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-white font-tech">{ending.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-code font-bold">
                            {ending.badge}
                          </span>
                        </div>
                        {isUnlocked ? (
                          <span className="text-xs text-emerald-400 font-bold font-tech flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 已达成
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 font-tech flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5" /> 待解锁
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed mb-2 font-sans">
                        {ending.lore}
                      </p>

                      <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono">
                        达成条件: <span className="text-amber-300">{ending.conditionsSummary}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
