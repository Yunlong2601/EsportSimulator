import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Flame,
  Award,
  Zap,
  Shield,
  TrendingUp,
  ChevronRight,
  Info,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  HelpCircle,
  Clock,
  RotateCcw,
  Target,
  Swords,
  Crown,
  Eye,
  Check
} from 'lucide-react';
import { 
  DynastyState, 
  MetaChampionEntry, 
  ChampionTierRank 
} from '../../types/game';
import { 
  getMetaConfigForWeek, 
  calculateDraftedMetaSynergyBonus,
  PATCH_TIER_CONFIGS 
} from '../../data/championTierListData';
import { soundEngine } from '../../utils/audio';

interface ChampionTierListSectionProps {
  dynasty: DynastyState;
  onUpdateDynasty: React.Dispatch<React.SetStateAction<DynastyState>>;
  seasonWeek?: number;
}

const TIER_BADGES: Record<ChampionTierRank, { label: string; bg: string; text: string; border: string; glow: string }> = {
  OP: {
    label: 'OP 级 · 版本霸权 (T0)',
    bg: 'bg-rose-500/20',
    text: 'text-rose-300',
    border: 'border-rose-500/50',
    glow: 'rgba(244,63,94,0.3)'
  },
  S: {
    label: 'S 级 · 核心强势 (T1)',
    bg: 'bg-amber-500/20',
    text: 'text-amber-300',
    border: 'border-amber-500/50',
    glow: 'rgba(245,158,11,0.3)'
  },
  A: {
    label: 'A 级 · 战术特解 (T2)',
    bg: 'bg-cyan-500/20',
    text: 'text-cyan-300',
    border: 'border-cyan-500/50',
    glow: 'rgba(6,182,212,0.3)'
  },
  B: {
    label: 'B 级 · 阵型常规 (T3)',
    bg: 'bg-slate-800',
    text: 'text-slate-400',
    border: 'border-slate-700',
    glow: 'transparent'
  }
};

const ROLE_LABELS: Record<string, string> = {
  TOP: '上单',
  JUG: '打野',
  MID: '中单',
  ADC: '射手',
  SUP: '辅助'
};

export const ChampionTierListSection: React.FC<ChampionTierListSectionProps> = ({
  dynasty,
  onUpdateDynasty,
  seasonWeek = 5
}) => {
  const [selectedRole, setSelectedRole] = useState<'ALL' | 'TOP' | 'JUG' | 'MID' | 'ADC' | 'SUP'>('ALL');
  const [selectedChamp, setSelectedChamp] = useState<MetaChampionEntry | null>(null);
  const [activePatchVersion, setActivePatchVersion] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Active meta tier configuration for the week
  const metaConfig = useMemo(() => {
    if (activePatchVersion) {
      return PATCH_TIER_CONFIGS.find(p => p.version === activePatchVersion) || getMetaConfigForWeek(seasonWeek);
    }
    return getMetaConfigForWeek(seasonWeek);
  }, [seasonWeek, activePatchVersion]);

  // Drafted meta champions (role -> championId)
  const draftedChampions = dynasty.draftedMetaChampions || {};

  // Calculate synergy bonus from drafted meta champions
  const metaSynergy = useMemo(() => {
    return calculateDraftedMetaSynergyBonus(draftedChampions, seasonWeek);
  }, [draftedChampions, seasonWeek]);

  // Filter champions
  const filteredChampions = useMemo(() => {
    let list = metaConfig.champions;
    if (selectedRole !== 'ALL') {
      list = list.filter(c => c.role === selectedRole);
    }
    return list;
  }, [metaConfig, selectedRole]);

  // Group by tier
  const tierGroups = useMemo(() => {
    const groups: Record<ChampionTierRank, MetaChampionEntry[]> = {
      OP: [],
      S: [],
      A: [],
      B: []
    };
    filteredChampions.forEach(c => {
      if (groups[c.tier]) {
        groups[c.tier].push(c);
      }
    });
    return groups;
  }, [filteredChampions]);

  // Toggle draft / lock champion for player role
  const handleToggleDraftChampion = (champ: MetaChampionEntry) => {
    soundEngine.playLevelUp();
    const currentDrafted = { ...draftedChampions };
    const isCurrentlyDrafted = currentDrafted[champ.role] === champ.id;

    if (isCurrentlyDrafted) {
      delete currentDrafted[champ.role];
      setActionFeedback(`已取消首发 ${ROLE_LABELS[champ.role]} 对【${champ.name}】的版本锁定。`);
    } else {
      currentDrafted[champ.role] = champ.id;
      setActionFeedback(`已指派首发 ${ROLE_LABELS[champ.role]} 演练【${champ.name}】！激活 ${champ.synergyBuffLabel}！`);
    }

    onUpdateDynasty(prev => ({
      ...prev,
      draftedMetaChampions: currentDrafted,
      championTierList: {
        currentPatch: metaConfig.version,
        seasonWeek,
        lastUpdatedWeek: seasonWeek,
        metaOverview: metaConfig.headline,
        synergySynergyMultipliers: {
          OP: 0.10,
          S: 0.07,
          A: 0.04,
          B: 0
        },
        draftedChampions: currentDrafted
      }
    }));

    setTimeout(() => setActionFeedback(null), 3500);
  };

  // One-click optimize BP draft with top OP/S champions
  const handleAutoOptimizeDraft = () => {
    soundEngine.playBaronSteal();
    const optimalDraft: Record<string, string> = {};
    const roles = ['TOP', 'JUG', 'MID', 'ADC', 'SUP'] as const;

    roles.forEach(r => {
      const best = metaConfig.champions
        .filter(c => c.role === r)
        .sort((a, b) => b.synergyBonus - a.synergyBonus)[0];
      if (best) {
        optimalDraft[r] = best.id;
      }
    });

    onUpdateDynasty(prev => ({
      ...prev,
      draftedMetaChampions: optimalDraft,
      championTierList: {
        currentPatch: metaConfig.version,
        seasonWeek,
        lastUpdatedWeek: seasonWeek,
        metaOverview: metaConfig.headline,
        synergySynergyMultipliers: {
          OP: 0.10,
          S: 0.07,
          A: 0.04,
          B: 0
        },
        draftedChampions: optimalDraft
      }
    }));

    setActionFeedback(`⚡【教练组一键BP锁死】已为首发五虎锁死当前 ${metaConfig.version} 版本全位置顶级 T0/T1 英雄！获得极限羁绊加成！`);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  return (
    <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-indigo-500/50 shadow-xl space-y-3 font-sans select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] shrink-0">
            <Flame className="w-5 h-5 animate-pulse text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-tech font-extrabold text-white text-xs sm:text-sm tracking-wide">
                教练组 · 赛区版本英雄梯队榜 (Champion Tier List)
              </h3>
              <span className="text-[9px] px-2 py-0.5 rounded font-black font-code bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                v{metaConfig.version} 补丁
              </span>
            </div>
            <p className="text-[10px] text-slate-300 font-sans mt-0.5">
              由主教练与战术智囊团实时研判 · 每数周版本动态更替 · 锁定版本之子激活额外战术羁绊
            </p>
          </div>
        </div>

        <button
          onClick={handleAutoOptimizeDraft}
          className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:brightness-110 text-slate-950 font-tech font-black text-[10px] cursor-pointer shadow-md flex items-center gap-1 shrink-0 active:scale-95 transition"
          title="教练组一键锁定当前版本全位置最高胜率强势英雄"
        >
          <Zap className="w-3.5 h-3.5 text-slate-950 fill-current" />
          <span>一键最优BP</span>
        </button>
      </div>

      {/* Meta Rotation Banner */}
      <div className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-purple-950/70 border border-indigo-500/40 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-xl shrink-0">📜</span>
          <div>
            <div className="flex items-center gap-1.5 font-tech font-bold text-indigo-300">
              <span>{metaConfig.themeTitle}</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">
                {metaConfig.badge}
              </span>
            </div>
            <p className="text-[10px] text-slate-300 font-sans mt-0.5">
              {metaConfig.themeDescription}
            </p>
          </div>
        </div>

        {/* Patch Switcher buttons */}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {PATCH_TIER_CONFIGS.map(p => (
            <button
              key={p.version}
              onClick={() => {
                soundEngine.playClick();
                setActivePatchVersion(p.version);
              }}
              className={`px-1.5 py-0.5 rounded text-[9px] font-code font-bold cursor-pointer transition ${
                metaConfig.version === p.version
                  ? 'bg-amber-400 text-slate-950 font-extrabold shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title={`切换至 ${p.version} 版本研判梯队`}
            >
              v{p.version}
            </button>
          ))}
        </div>
      </div>

      {/* Drafted Meta Synergy Summary Card */}
      <div className="p-3 rounded-xl bg-slate-950/90 border border-amber-500/40 shadow-md space-y-2">
        <div className="flex items-center justify-between text-xs font-tech">
          <div className="flex items-center gap-1.5 text-white font-bold">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>当前首发五虎 BP 核心锁定与协同增益:</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-code">
            <span className="text-slate-400">已装配</span>
            <strong className="text-amber-400 font-bold">{metaSynergy.draftedMetaCount} / 5</strong>
            <span className="text-slate-400">位版本之子</span>
          </div>
        </div>

        {/* 5-Role Draft Slots */}
        <div className="grid grid-cols-5 gap-1.5">
          {(['TOP', 'JUG', 'MID', 'ADC', 'SUP'] as const).map(role => {
            const champId = draftedChampions[role];
            const champ = metaConfig.champions.find(c => c.id === champId);

            return (
              <div
                key={role}
                onClick={() => {
                  if (champ) {
                    setSelectedChamp(champ);
                  }
                }}
                className={`p-2 rounded-xl border text-center transition cursor-pointer relative flex flex-col items-center justify-between min-h-[70px] ${
                  champ
                    ? champ.tier === 'OP'
                      ? 'bg-gradient-to-b from-rose-950/60 to-slate-900 border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                      : 'bg-gradient-to-b from-amber-950/60 to-slate-900 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : 'bg-slate-950 border-dashed border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="text-[9px] font-code text-slate-400 font-bold">
                  {ROLE_LABELS[role]}
                </div>
                {champ ? (
                  <>
                    <span className="text-xl my-0.5">{champ.avatar}</span>
                    <div className="w-full">
                      <div className="text-[10px] font-tech font-bold text-white truncate">{champ.name}</div>
                      <div className="text-[8px] font-code font-bold text-amber-400">+{Math.round(champ.synergyBonus * 100)}% 羁绊</div>
                    </div>
                  </>
                ) : (
                  <div className="py-2 text-[9px] text-slate-500 font-tech">
                    待锁定 ❓
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Active Synergy Buff Banner */}
        <div className="flex items-center justify-between text-[10px] font-tech pt-1 border-t border-slate-800/80">
          <div className="text-slate-300 flex items-center gap-1 truncate mr-2">
            <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="truncate">{metaSynergy.bonusSummary}</span>
          </div>
          <div className="text-right shrink-0">
            <span className="text-amber-400 font-code font-black text-xs">
              +{Math.round(metaSynergy.totalSynergyBonus * 100)}% 阵容胜率
            </span>
          </div>
        </div>
      </div>

      {/* Action Feedback Flash Notice */}
      {actionFeedback && (
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/90 to-slate-900 border border-emerald-500 text-xs font-tech text-emerald-200 animate-slide-up flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Role Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
        {[
          { id: 'ALL', label: '全部分路' },
          { id: 'TOP', label: '上路 (TOP)' },
          { id: 'JUG', label: '打野 (JUG)' },
          { id: 'MID', label: '中路 (MID)' },
          { id: 'ADC', label: '射手 (ADC)' },
          { id: 'SUP', label: '辅助 (SUP)' }
        ].map(r => (
          <button
            key={r.id}
            onClick={() => {
              soundEngine.playClick();
              setSelectedRole(r.id as any);
            }}
            className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-tech font-bold whitespace-nowrap cursor-pointer transition ${
              selectedRole === r.id
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Champion Tiers List */}
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {(['OP', 'S', 'A'] as const).map(tierKey => {
          const champs = tierGroups[tierKey];
          if (champs.length === 0) return null;
          const badge = TIER_BADGES[tierKey];

          return (
            <div key={tierKey} className="space-y-1.5">
              {/* Tier Header */}
              <div className="flex items-center justify-between px-1">
                <span className={`text-[10px] font-tech font-black px-2 py-0.5 rounded border ${badge.bg} ${badge.text} ${badge.border}`}>
                  {badge.label}
                </span>
                <span className="text-[9px] text-slate-400 font-tech">
                  契合装配赋予 +{tierKey === 'OP' ? '10%' : tierKey === 'S' ? '7%' : '4%'} 战术羁绊
                </span>
              </div>

              {/* Champions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {champs.map(champ => {
                  const isDrafted = draftedChampions[champ.role] === champ.id;
                  const isSelected = selectedChamp?.id === champ.id;

                  return (
                    <div
                      key={champ.id}
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedChamp(champ);
                      }}
                      className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                        isDrafted
                          ? 'bg-gradient-to-r from-amber-950/50 via-slate-900 to-indigo-950/50 border-amber-400/90 shadow-md ring-1 ring-amber-400/40'
                          : isSelected
                          ? 'bg-slate-850 border-indigo-400/80 shadow'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{champ.avatar}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h5 className="font-tech font-bold text-white text-xs">{champ.name}</h5>
                            <span className="text-[9px] text-slate-400 font-sans">({champ.title})</span>
                            <span className="px-1 py-0.2 rounded text-[8px] font-code bg-slate-800 text-cyan-300 border border-slate-700">
                              {ROLE_LABELS[champ.role]}
                            </span>
                            {champ.isHotMeta && (
                              <span className="text-[8px] px-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                                顶流🔥
                              </span>
                            )}
                          </div>
                          <div className="text-[9px] text-slate-400 font-sans mt-0.5">
                            胜率: <span className="text-emerald-400 font-code font-bold">{champ.winRate}%</span> • Ban率: <span className="text-rose-400 font-code">{champ.banRate}%</span> • 选率: <span className="text-cyan-400 font-code">{champ.pickRate}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right space-y-1 shrink-0">
                        <div className="text-[9px] font-code font-bold text-amber-400">
                          +{Math.round(champ.synergyBonus * 100)}% 羁绊
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleDraftChampion(champ);
                          }}
                          className={`px-2 py-1 rounded-lg text-[9px] font-tech font-bold cursor-pointer transition flex items-center gap-1 ${
                            isDrafted
                              ? 'bg-amber-500 text-slate-950 shadow-sm'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                          }`}
                        >
                          {isDrafted ? (
                            <>
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                              <span>已锁定BP</span>
                            </>
                          ) : (
                            <span>锁定演练</span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Champion Coaching Deep-Dive Card */}
      {selectedChamp && (
        <div className="p-3 rounded-xl bg-slate-950 border border-indigo-500/50 space-y-2 animate-fadeIn text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedChamp.avatar}</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-tech font-extrabold text-white text-sm">
                    {selectedChamp.name} · {selectedChamp.title}
                  </h4>
                  <span className={`px-1.5 py-0.2 rounded text-[8px] font-black font-code ${TIER_BADGES[selectedChamp.tier].bg} ${TIER_BADGES[selectedChamp.tier].text} border ${TIER_BADGES[selectedChamp.tier].border}`}>
                    {selectedChamp.tier} 梯队
                  </span>
                  <span className="text-[9px] text-amber-300 font-tech">
                    {selectedChamp.metaRoleTag}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                  分路: {ROLE_LABELS[selectedChamp.role]} • 对应版本: v{selectedChamp.patchVersion}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedChamp(null)}
              className="text-slate-400 hover:text-white p-1 text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Coaching Analysis */}
          <div className="space-y-1.5 text-[11px] font-sans">
            <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-200 leading-relaxed italic">
              "{selectedChamp.coachingVerdict}"
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/30">
                <span className="text-indigo-300 font-tech font-bold block">战术协同光环:</span>
                <span className="text-white mt-0.5 block">{selectedChamp.synergyBuffLabel}</span>
              </div>
              <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-500/30">
                <span className="text-rose-300 font-tech font-bold block">克制对手目标:</span>
                <span className="text-white mt-0.5 block">{selectedChamp.counterMatchups.join('、')}</span>
              </div>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">
              {draftedChampions[selectedChamp.role] === selectedChamp.id 
                ? '✅ 已作为首发核心英雄列入当前战术名单' 
                : '💡 点击右侧按钮将其列入首发五虎核心BP名单'}
            </span>
            <button
              onClick={() => handleToggleDraftChampion(selectedChamp)}
              className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold cursor-pointer transition ${
                draftedChampions[selectedChamp.role] === selectedChamp.id
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow'
              }`}
            >
              {draftedChampions[selectedChamp.role] === selectedChamp.id ? '卸除当前BP锁定' : '立即锁定该英雄'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
