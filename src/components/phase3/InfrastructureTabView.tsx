import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Wifi, 
  Sparkles, 
  Zap, 
  Shield, 
  Heart, 
  CheckCircle2, 
  ChevronRight, 
  TrendingUp, 
  Flame, 
  Star, 
  Coffee, 
  Moon, 
  RotateCcw, 
  Info, 
  Award, 
  DollarSign, 
  Activity,
  ArrowUpRight,
  Layers,
  Check
} from 'lucide-react';
import { DynastyState, FacilityUpgrade } from '../../types/game';
import { 
  GAMING_HOUSE_FACILITY_DEFS, 
  GamingHouseFacilityDef,
  calculateInfrastructureStats, 
  syncInfrastructureFacilities 
} from '../../data/infrastructureData';
import { soundEngine } from '../../utils/audio';

interface InfrastructureTabViewProps {
  dynasty: DynastyState;
  onUpdateDynasty: React.Dispatch<React.SetStateAction<DynastyState>>;
  onGoToRoster?: () => void;
}

export const InfrastructureTabView: React.FC<InfrastructureTabViewProps> = ({
  dynasty,
  onUpdateDynasty,
  onGoToRoster
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [inspectedFeedback, setInspectedFeedback] = useState<string | null>(null);
  const [upgradedFacilityId, setUpgradedFacilityId] = useState<string | null>(null);

  // Synchronize facilities to guarantee all 6 gaming house modules exist
  const currentFacilities = useMemo(() => {
    return syncInfrastructureFacilities(dynasty.facilities);
  }, [dynasty.facilities]);

  const stats = useMemo(() => {
    return calculateInfrastructureStats(currentFacilities);
  }, [currentFacilities]);

  // Daily Facility Routine & Morale/Recovery Boost
  const handleInspectGamingHouse = () => {
    soundEngine.playLevelUp();

    // Permanently or instantly rejuvenate roster morale based on infrastructure
    const moraleBoost = Math.max(5, Math.round(stats.totalPermanentMoraleBonus / 2));

    onUpdateDynasty(prev => {
      const refreshedRoster = prev.roster.map(player => ({
        ...player,
        morale: Math.min(100, Math.max(75, player.morale + moraleBoost))
      }));

      return {
        ...prev,
        roster: refreshedRoster,
        fanHype: prev.fanHype + 1500,
        infrastructureStats: {
          ...stats,
          lastFacilityInspection: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        }
      };
    });

    setInspectedFeedback(
      `🎉【全员巡查与身心休整完成】依托 ${stats.facilityGradeLabel} 的顶奢配置，首发阵容全员注入 +${moraleBoost}% 士气，疲劳已彻底清空！`
    );
    setTimeout(() => setInspectedFeedback(null), 4500);
  };

  // Upgrade a specific facility
  const handleUpgrade = (def: GamingHouseFacilityDef) => {
    const facility = currentFacilities.find(f => f.id === def.id);
    const currentTier = facility ? facility.tier : 0;

    if (currentTier >= def.maxTier) {
      soundEngine.playDefeat();
      return;
    }

    const upgradeCost = def.costs[currentTier];

    if (dynasty.budget < upgradeCost) {
      soundEngine.playDefeat();
      setInspectedFeedback(
        `⚠️ 俱乐部预算不足！升级【${def.name}】至等级 ${currentTier + 1} 需 $${upgradeCost.toLocaleString()}，当前仅有 $${dynasty.budget.toLocaleString()}。`
      );
      setTimeout(() => setInspectedFeedback(null), 4000);
      return;
    }

    soundEngine.playLevelUp();
    setUpgradedFacilityId(def.id);
    setTimeout(() => setUpgradedFacilityId(null), 2500);

    const nextTier = currentTier + 1;
    const addedMorale = def.moraleBonusPerTier[nextTier - 1] - (currentTier > 0 ? def.moraleBonusPerTier[currentTier - 1] : 0);

    // Apply upgrade to dynasty
    onUpdateDynasty(prev => {
      const currentList = syncInfrastructureFacilities(prev.facilities);
      const updatedFacilities = currentList.map(f => {
        if (f.id === def.id) {
          const nextCost = nextTier >= def.maxTier ? 0 : def.costs[nextTier];
          const newMorale = def.moraleBonusPerTier[nextTier - 1];
          const newRecovery = def.recoveryBonusPerTier[nextTier - 1];
          return {
            ...f,
            tier: nextTier,
            cost: nextCost,
            permanentMoraleBonus: newMorale,
            recoverySpeedMultiplier: newRecovery,
            effectLabel: `+${newMorale}% 永久士气 • +${newRecovery}% 恢复速率`,
            description: def.tierDescriptions[nextTier - 1],
            tierPerkName: def.tierTitles[nextTier - 1],
            tierPerkDescription: def.tierKeyFeatures[nextTier - 1]
          };
        }
        return f;
      });

      // Permanently increase each roster player's base morale
      const updatedRoster = prev.roster.map(player => ({
        ...player,
        morale: Math.min(100, player.morale + addedMorale)
      }));

      const newStats = calculateInfrastructureStats(updatedFacilities);

      return {
        ...prev,
        budget: prev.budget - upgradeCost,
        fanHype: prev.fanHype + Math.round(upgradeCost * 0.08),
        reputation: Math.min(100, (prev.reputation || 70) + 2),
        facilities: updatedFacilities,
        roster: updatedRoster,
        infrastructureStats: newStats
      };
    });

    setInspectedFeedback(
      `🏛️【基地基建升级成功】${def.name} 提升至 LV.${nextTier}【${def.tierTitles[nextTier - 1]}】！全员永久士气底限提升 +${addedMorale}%，恢复速率达 +${def.recoveryBonusPerTier[nextTier - 1]}%！`
    );
    setTimeout(() => setInspectedFeedback(null), 4500);
  };

  const filteredDefs = selectedCategory === 'ALL'
    ? GAMING_HOUSE_FACILITY_DEFS
    : GAMING_HOUSE_FACILITY_DEFS.filter(d => d.category === selectedCategory);

  const totalSpent = useMemo(() => {
    let spent = 0;
    currentFacilities.forEach(f => {
      const def = GAMING_HOUSE_FACILITY_DEFS.find(d => d.id === f.id);
      if (def && f.tier > 0) {
        for (let i = 0; i < f.tier; i++) {
          spent += def.costs[i] || 0;
        }
      }
    });
    return spent;
  }, [currentFacilities]);

  return (
    <div className="space-y-3 font-sans select-none animate-fade-in text-slate-100">
      
      {/* 1. GAMING HOUSE MASTER INFRASTRUCTURE OVERVIEW BANNER */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950/60 to-slate-950 border-2 border-indigo-500/50 shadow-[0_0_40px_rgba(99,102,241,0.2)] space-y-3 relative overflow-hidden">
        {/* Subtle background circuit watermark */}
        <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
          <Building2 className="w-48 h-48 text-indigo-400" />
        </div>

        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 relative z-10 border-b border-indigo-500/20 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/30 shrink-0">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-indigo-300">
                <Building2 className="w-6 h-6 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-tech font-extrabold text-white text-sm sm:text-base tracking-wide">
                  俱乐部基建设施中心 (Infrastructure Hub)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-[10px] font-tech font-black flex items-center gap-0.5 shadow-sm">
                  {Array.from({ length: stats.gamingHouseStars }).map((_, i) => (
                    <Star key={i} className="w-2.5 h-2.5 fill-slate-950" />
                  ))}
                  <span className="ml-0.5">{stats.gamingHouseStars}星级基地</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-300 font-sans mt-0.5">
                {stats.facilityGradeLabel} • 累计基建投资: <span className="text-amber-300 font-code font-bold">${totalSpent.toLocaleString()}</span>
              </p>
            </div>
          </div>

          {/* Quick Routine Action Button */}
          <button
            onClick={handleInspectGamingHouse}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:to-pink-400 text-white font-tech font-bold text-xs shadow-lg shadow-indigo-500/25 transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shrink-0"
            title="巡视基地各功能舱，全面激发全员精力与士气"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
            <span>全员能量巡查与休整</span>
          </button>
        </div>

        {/* Big Dual-Metric Counters */}
        <div className="grid grid-cols-2 gap-2 relative z-10">
          {/* Metric 1: Permanent Morale Boost */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block font-tech uppercase">全员永久士气加成底限</span>
                <span className="text-sm sm:text-base font-extrabold font-code text-emerald-400">
                  +{stats.totalPermanentMoraleBonus}% 常驻士气
                </span>
              </div>
            </div>
            <span className="text-[9px] text-emerald-400/80 font-tech font-bold hidden sm:inline">
              锁定心态巅峰 ✓
            </span>
          </div>

          {/* Metric 2: Permanent Recovery Speed */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-cyan-500/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block font-tech uppercase">赛后疲劳光速恢复速率</span>
                <span className="text-sm sm:text-base font-extrabold font-code text-cyan-400">
                  +{stats.totalRecoverySpeedMultiplier}% 恢复倍率
                </span>
              </div>
            </div>
            <span className="text-[9px] text-cyan-400/80 font-tech font-bold hidden sm:inline">
              拒绝对局疲态 ✓
            </span>
          </div>
        </div>

        {/* Live Feedback Toast Banner */}
        {inspectedFeedback && (
          <div className="p-2.5 rounded-xl bg-indigo-950/90 border border-cyan-400 text-xs font-tech text-cyan-200 animate-slide-up flex items-center gap-2 shadow-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{inspectedFeedback}</span>
          </div>
        )}
      </div>

      {/* 2. CATEGORY PILL FILTER */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
        {[
          { id: 'ALL', label: '全部基建 (6大核心舱)', icon: Layers },
          { id: 'INTERNET', label: '万兆专线光纤 ⚡', icon: Wifi },
          { id: 'ERGONOMICS', label: '人体工学座舱 🪑', icon: Shield },
          { id: 'KITCHEN', label: '星级营养私厨 🍳', icon: Coffee },
          { id: 'PHYSIO', label: '康复冷冻水疗 💆', icon: Activity },
          { id: 'SLEEP', label: '降噪睡眠太空舱 🛌', icon: Moon },
          { id: 'LOUNGE', label: '休娱社交会馆 ☕', icon: Sparkles }
        ].map(cat => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                soundEngine.playClick();
                setSelectedCategory(cat.id);
              }}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-tech font-bold cursor-pointer transition whitespace-nowrap flex items-center gap-1 border ${
                isSelected
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-indigo-400 shadow-md font-extrabold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. GAMING HOUSE FACILITIES DETAILED CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredDefs.map(def => {
          const facility = currentFacilities.find(f => f.id === def.id);
          const currentTier = facility ? facility.tier : 0;
          const isMaxed = currentTier >= def.maxTier;
          const nextTier = currentTier + 1;
          const nextCost = isMaxed ? 0 : def.costs[currentTier];
          const canAfford = dynasty.budget >= nextCost;
          const isJustUpgraded = upgradedFacilityId === def.id;

          const currentMorale = currentTier > 0 ? def.moraleBonusPerTier[currentTier - 1] : 0;
          const currentRecovery = currentTier > 0 ? def.recoveryBonusPerTier[currentTier - 1] : 0;

          const nextMoraleDiff = isMaxed ? 0 : def.moraleBonusPerTier[nextTier - 1] - currentMorale;
          const nextRecoveryDiff = isMaxed ? 0 : def.recoveryBonusPerTier[nextTier - 1] - currentRecovery;

          return (
            <div
              key={def.id}
              className={`p-3.5 rounded-2xl border transition relative overflow-hidden flex flex-col justify-between space-y-3 ${
                isJustUpgraded
                  ? 'bg-indigo-950/80 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)] scale-[1.01]'
                  : currentTier > 0
                  ? 'bg-slate-900/90 border-indigo-500/30 hover:border-indigo-500/60 shadow-lg'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-2.5">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-slate-950 border border-indigo-500/40 flex items-center justify-center text-xl shadow-md shrink-0">
                      <span>{def.icon}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-tech font-bold text-white text-xs sm:text-sm">
                          {def.name}
                        </h4>
                        <span className={`px-1.5 py-0.2 rounded text-[8px] font-code font-bold border ${
                          isMaxed
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : currentTier > 0
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {isMaxed ? '顶级神装 MAX' : `LV.${currentTier} / ${def.maxTier}`}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-sans block">
                        {def.englishName}
                      </span>
                    </div>
                  </div>

                  {/* Level Segments Visual Meter */}
                  <div className="flex items-center gap-1 shrink-0 pt-1">
                    {Array.from({ length: def.maxTier }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2.5 h-1.5 rounded-sm transition ${
                          i < currentTier
                            ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 shadow-sm'
                            : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Current Stage Badge & Narrative */}
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-tech">当前配置阶段:</span>
                    <span className="font-tech font-bold text-cyan-300">
                      {currentTier > 0 ? def.tierTitles[currentTier - 1] : '待配置初级设施'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 font-sans leading-relaxed">
                    {currentTier > 0 ? def.tierDescriptions[currentTier - 1] : def.tagline}
                  </p>
                </div>

                {/* Permanent Morale & Recovery Stat Chips */}
                <div className="grid grid-cols-2 gap-1.5 text-[10px] font-tech">
                  <div className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Heart className="w-3 h-3 text-emerald-400" />
                      永久士气
                    </span>
                    <span className="font-code font-bold text-emerald-300">
                      +{currentMorale}%
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-cyan-400" />
                      恢复速率
                    </span>
                    <span className="font-code font-bold text-cyan-300">
                      +{currentRecovery}%
                    </span>
                  </div>
                </div>

                {/* Next Tier Upgrade Preview */}
                {!isMaxed && (
                  <div className="p-2 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-[9px] space-y-0.5">
                    <div className="flex items-center justify-between font-tech text-indigo-300">
                      <span className="flex items-center gap-1 font-bold">
                        <ArrowUpRight className="w-3 h-3 text-amber-400" />
                        下一阶升格预览: {def.tierTitles[nextTier - 1]}
                      </span>
                      <span className="text-emerald-400 font-code font-bold">
                        +{nextMoraleDiff}% 士气 • +{nextRecoveryDiff}% 恢复
                      </span>
                    </div>
                    <p className="text-slate-400 font-sans truncate">
                      ✨ {def.tierKeyFeatures[nextTier - 1]}
                    </p>
                  </div>
                )}
              </div>

              {/* Upgrade Button */}
              <button
                disabled={isMaxed || !canAfford}
                onClick={() => handleUpgrade(def)}
                className={`w-full py-2.5 px-3 rounded-xl font-tech font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md mt-2 ${
                  isMaxed
                    ? 'bg-slate-800 text-slate-500 cursor-default border border-slate-700'
                    : canAfford
                    ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/20 active:scale-98 font-extrabold'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                {isMaxed ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>已达顶级神装 (Fully Upgraded)</span>
                  </>
                ) : (
                  <>
                    <Building2 className="w-3.5 h-3.5" />
                    <span>
                      升至 LV.{nextTier} · 消耗 ${nextCost.toLocaleString()}
                    </span>
                    {!canAfford && <span className="text-[9px] text-rose-400 ml-1">(资金不足)</span>}
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* 4. ROSTER STATUS DIRECT IMPACT PREVIEW FOOTER */}
      <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-tech">
          <div className="flex items-center gap-1.5 text-white font-bold">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>首发五虎当前状态与基建加成受惠情况:</span>
          </div>
          {onGoToRoster && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onGoToRoster();
              }}
              className="text-[10px] text-cyan-400 hover:text-cyan-300 font-tech font-bold cursor-pointer"
            >
              查看首发阵容大名单 →
            </button>
          )}
        </div>

        <div className="grid grid-cols-5 gap-1.5 text-center text-[10px]">
          {dynasty.roster.slice(0, 5).map(player => (
            <div key={player.id} className="p-2 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-base select-none block">{player.avatar}</span>
              <div className="font-tech font-bold text-white truncate text-[11px]">{player.name}</div>
              <div className="text-emerald-400 font-code font-bold text-[10px]">
                {player.morale}% 士气
              </div>
              <div className="text-[8px] text-slate-400 font-tech">
                {player.role} • 巅峰护航
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
