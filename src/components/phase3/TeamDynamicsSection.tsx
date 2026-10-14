import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Sparkles, 
  Zap, 
  Shield, 
  Flame, 
  ArrowRightLeft, 
  Crosshair, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  ChevronRight, 
  RotateCcw, 
  Wand2, 
  Layers, 
  HelpCircle, 
  Info,
  Award,
  Link as LinkIcon,
  Check,
  X
} from 'lucide-react';
import { DynastyState, ProPlayer, TacticalUnitConfig, PlayerPairChemistry } from '../../types/game';
import { 
  TACTICAL_PRESETS, 
  TacticalPresetDef,
  calculatePairChemistry, 
  calculateTeamDynamicsState, 
  initializeUnitsForPreset, 
  findOptimalUnitConfiguration 
} from '../../data/teamDynamicsData';
import { soundEngine } from '../../utils/audio';

interface TeamDynamicsSectionProps {
  dynasty: DynastyState;
  onUpdateDynasty: React.Dispatch<React.SetStateAction<DynastyState>>;
  isModal?: boolean;
  onClose?: () => void;
}

export const TeamDynamicsSection: React.FC<TeamDynamicsSectionProps> = ({
  dynasty,
  onUpdateDynasty,
  isModal = false,
  onClose
}) => {
  const starters = useMemo(() => dynasty.roster.slice(0, 5), [dynasty.roster]);
  const playerMap = useMemo(() => new Map(starters.map(p => [p.id, p])), [starters]);

  // Current active preset
  const [activePresetId, setActivePresetId] = useState<string>(
    dynasty.teamDynamics?.currentPresetId || TACTICAL_PRESETS[0].id
  );

  // Units state
  const [units, setUnits] = useState<TacticalUnitConfig[]>(() => {
    if (dynasty.teamDynamics?.units && dynasty.teamDynamics.units.length > 0) {
      return dynasty.teamDynamics.units;
    }
    return initializeUnitsForPreset(activePresetId, starters);
  });

  // Selected player for move/swap
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedChemistryPair, setSelectedChemistryPair] = useState<PlayerPairChemistry | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Calculate current dynamics state
  const dynamicsState = useMemo(() => {
    return calculateTeamDynamicsState(activePresetId, units, starters);
  }, [activePresetId, units, starters]);

  // Sync to parent dynasty state whenever units or preset changes
  const saveDynamics = (newUnits: TacticalUnitConfig[], presetId: string) => {
    const newState = calculateTeamDynamicsState(presetId, newUnits, starters);
    onUpdateDynasty(prev => ({
      ...prev,
      teamDynamics: newState
    }));
  };

  // Switch preset
  const handleSelectPreset = (presetDef: TacticalPresetDef) => {
    soundEngine.playClick();
    setActivePresetId(presetDef.id);
    const newUnits = initializeUnitsForPreset(presetDef.id, starters);
    setUnits(newUnits);
    setSelectedPlayerId(null);
    saveDynamics(newUnits, presetDef.id);
    setActionFeedback(`已切换至战术阵型：【${presetDef.name}】！`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  // Move or Swap selected player into a unit
  const handleSlotClick = (targetUnitId: string, targetPlayerId?: string) => {
    if (!selectedPlayerId) {
      if (targetPlayerId) {
        soundEngine.playClick();
        setSelectedPlayerId(targetPlayerId);
      }
      return;
    }

    // If clicking the same player, deselect
    if (selectedPlayerId === targetPlayerId) {
      soundEngine.playClick();
      setSelectedPlayerId(null);
      return;
    }

    soundEngine.playDraftLock();

    // Perform move or swap
    const newUnits = units.map(unit => {
      let newPlayerIds = [...unit.assignedPlayerIds];

      // Remove selected player from its current unit
      if (newPlayerIds.includes(selectedPlayerId)) {
        newPlayerIds = newPlayerIds.filter(id => id !== selectedPlayerId);
        // If there was a target player in the destination, swap it back here
        if (targetPlayerId && unit.id !== targetUnitId) {
          newPlayerIds.push(targetPlayerId);
        }
      }

      // Add selected player to target unit
      if (unit.id === targetUnitId) {
        if (targetPlayerId) {
          // Replace target player with selected player
          newPlayerIds = newPlayerIds.map(id => id === targetPlayerId ? selectedPlayerId : id);
        } else {
          // Append to unit
          if (!newPlayerIds.includes(selectedPlayerId)) {
            newPlayerIds.push(selectedPlayerId);
          }
        }
      }

      return {
        ...unit,
        assignedPlayerIds: newPlayerIds
      };
    });

    setUnits(newUnits);
    setSelectedPlayerId(null);
    saveDynamics(newUnits, activePresetId);

    const movedPlayer = playerMap.get(selectedPlayerId);
    const targetUnit = units.find(u => u.id === targetUnitId);
    setActionFeedback(`已将选手【${movedPlayer?.name || ''}】编入【${targetUnit?.name || ''}】！`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  // Auto-Optimize Button: Math search for maximum synergy score
  const handleAutoOptimize = () => {
    soundEngine.playLevelUp();
    const { optimalUnits, maxScore } = findOptimalUnitConfiguration(activePresetId, units, starters);
    setUnits(optimalUnits);
    setSelectedPlayerId(null);
    saveDynamics(optimalUnits, activePresetId);

    setActionFeedback(
      `⚡【战术羁绊最优化完成】战队协同评分已跃升至巅峰 ${maxScore} 分（${maxScore >= 92 ? 'SSS 级 · 天衣无缝' : 'SS 级 · 默契拉满'}）！`
    );
    setTimeout(() => setActionFeedback(null), 4500);
  };

  // Reset to default mapping
  const handleReset = () => {
    soundEngine.playClick();
    const defaultUnits = initializeUnitsForPreset(activePresetId, starters);
    setUnits(defaultUnits);
    setSelectedPlayerId(null);
    saveDynamics(defaultUnits, activePresetId);
    setActionFeedback('已重置回该阵型的标准职业角色分配。');
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const containerContent = (
    <div className="space-y-3 font-sans select-none text-slate-100">
      
      {/* 1. TOP TEAM SYNERGY SCORE DASHBOARD */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-cyan-950/60 to-slate-950 border-2 border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.2)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/30 shrink-0">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-cyan-300">
                <Users className="w-6 h-6 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-tech font-extrabold text-white text-sm sm:text-base tracking-wide">
                  战队协同动态编制 · 队员化学反应 (Team Dynamics)
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-tech font-black border ${
                  dynamicsState.synergyGrade === 'SSS'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 border-amber-400 shadow-md animate-pulse'
                    : dynamicsState.synergyGrade === 'SS'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                }`}>
                  {dynamicsState.synergyGrade} 级 · {dynamicsState.synergyTitle}
                </span>
              </div>
              <p className="text-[10px] text-slate-300 font-sans mt-0.5">
                调整作战小队编组，释放特定的二人羁绊与组间协同，最大化全队战术协同得分！
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleAutoOptimize}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-tech font-extrabold text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
              title="根据当前选手特点算力推演，一键调优编制至最高羁绊得分"
            >
              <Wand2 className="w-4 h-4" />
              <span>一键推演最大化羁绊</span>
            </button>

            <button
              onClick={handleReset}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              title="重置默认分配"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {isModal && onClose && (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onClose();
                }}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Big Synergy Gauge & Buff Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Gauge card */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/30 flex items-center justify-between">
            <div>
              <span className="text-[9px] text-slate-400 block font-tech uppercase">当前全队协同得分</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black font-code text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                  {dynamicsState.totalSynergyScore}
                </span>
                <span className="text-xs text-slate-500 font-code">/ 100 分</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-slate-400 block font-tech">小队化学共鸣</span>
              <span className="text-xs font-code font-bold text-amber-400">
                {dynamicsState.pairChemistries.length} 组连携
              </span>
            </div>
          </div>

          {/* Tactical Buff Card */}
          <div className="sm:col-span-2 p-3 rounded-xl bg-slate-950/80 border border-indigo-500/30 flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block font-tech uppercase">实战激活战术加成效果</span>
              <p className="text-[11px] font-tech text-white font-bold leading-relaxed mt-0.5">
                {dynamicsState.synergyBuffSummary}
              </p>
            </div>
          </div>
        </div>

        {/* Notice Feedback Toast */}
        {actionFeedback && (
          <div className="p-2.5 rounded-xl bg-cyan-950/90 border border-cyan-400 text-xs font-tech text-cyan-200 animate-slide-up flex items-center gap-2 shadow-md">
            <Sparkles className="w-4 h-4 text-cyan-300 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}
      </div>

      {/* 2. TACTICAL PRESETS SELECTOR */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1 text-xs font-tech">
          <span className="text-slate-400 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            选择战术作战编制预设 (Tactical Formation Presets):
          </span>
          <span className="text-[10px] text-slate-500">
            支持一键套用职业体系编制
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          {TACTICAL_PRESETS.map(preset => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-tech">
                  <span className="font-bold truncate">{preset.name.split('·')[0]}</span>
                  <span className="text-[8px] font-code text-amber-300 shrink-0">{preset.badge.split(' ')[0]}</span>
                </div>
                <div className="text-[9px] text-slate-400 truncate mt-0.5 font-sans">
                  {preset.tagline.slice(0, 16)}...
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. INTERACTIVE UNITS AND CHEMISTRY CONNECTIONS */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1 text-xs font-tech">
          <span className="text-white font-bold flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5 text-amber-400" />
            作战小队编制席位 (点击选手头像后点击目标槽位进行移动/对调):
          </span>
          {selectedPlayerId && (
            <span className="text-[10px] text-amber-400 animate-pulse font-bold">
              已选中【{playerMap.get(selectedPlayerId)?.name}】，请点击目标小队槽位完成编配 👆
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {units.map(unit => {
            const playersInUnit = unit.assignedPlayerIds
              .map(id => playerMap.get(id))
              .filter((p): p is ProPlayer => Boolean(p));

            return (
              <div
                key={unit.id}
                onClick={() => {
                  if (selectedPlayerId && !playersInUnit.some(p => p.id === selectedPlayerId)) {
                    handleSlotClick(unit.id);
                  }
                }}
                className={`p-3.5 rounded-2xl border transition relative flex flex-col justify-between space-y-3 ${unit.colorScheme.bg} ${unit.colorScheme.border} shadow-lg`}
              >
                {/* Unit Header */}
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-tech font-extrabold text-white text-xs sm:text-sm">
                          {unit.name}
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-300 font-sans block mt-0.5">
                        战术聚焦点: <span className="font-tech font-bold text-amber-300">{unit.focusLabel}</span>
                      </span>
                    </div>

                    <span className={`text-[9px] font-code font-bold px-1.5 py-0.5 rounded ${unit.colorScheme.bg} ${unit.colorScheme.text} border ${unit.colorScheme.border}`}>
                      推荐: {unit.recommendedRoles.join(' / ')}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 font-sans mt-2 leading-relaxed">
                    {unit.description}
                  </p>
                </div>

                {/* Assigned Players in this Unit */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-tech">
                    <span>当前编制选手 ({playersInUnit.length} 人):</span>
                    <span>点击选手可调动</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {playersInUnit.map(player => {
                      const isSelected = selectedPlayerId === player.id;
                      return (
                        <div
                          key={player.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSlotClick(unit.id, player.id);
                          }}
                          className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-between gap-1 ${
                            isSelected
                              ? 'bg-amber-500/30 border-amber-400 ring-2 ring-amber-400/50 shadow-md scale-105'
                              : 'bg-slate-900/90 border-slate-700 hover:border-slate-500'
                          }`}
                        >
                          <span className="text-xl select-none">{player.avatar}</span>
                          <div className="font-tech font-bold text-white text-xs truncate max-w-full">
                            {player.name}
                          </div>
                          <div className="flex items-center gap-1 text-[9px] font-code">
                            <span className="text-cyan-300 font-bold">{player.role}</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-amber-300">{player.playstyle || '风格'}</span>
                          </div>
                          <div className="text-[8px] text-emerald-400 font-code font-bold">
                            {player.mechanics} 操作 · {player.morale}% 士气
                          </div>
                        </div>
                      );
                    })}

                    {/* Empty placeholder slot to invite dragging or clicking */}
                    {playersInUnit.length < 2 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSlotClick(unit.id);
                        }}
                        className={`p-2.5 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition ${
                          selectedPlayerId
                            ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 animate-pulse'
                            : 'border-slate-800 bg-slate-950/40 text-slate-600 hover:border-slate-700'
                        }`}
                      >
                        <ArrowRightLeft className="w-5 h-5 mb-1 opacity-70" />
                        <span className="text-[10px] font-tech font-bold">
                          {selectedPlayerId ? '点击移入此槽位' : '空闲战术位'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Intra-Unit Chemistry Pair Link Preview */}
                {playersInUnit.length >= 2 && (() => {
                  const chem = calculatePairChemistry(playersInUnit[0], playersInUnit[1], unit);
                  return (
                    <div 
                      onClick={() => setSelectedChemistryPair(chem)}
                      className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/40 hover:border-amber-400 cursor-pointer transition space-y-1 shadow-sm"
                      title="点击查阅两位选手化学反应深度解析"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-tech font-bold text-amber-300 flex items-center gap-1">
                          <LinkIcon className="w-3 h-3 text-amber-400" />
                          <span>{chem.comboTitle}</span>
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-code font-bold">
                          {chem.chemistryScore}分 ({chem.chemistryGrade})
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-300 font-sans truncate">
                        ⚡ {chem.synergyBuff}
                      </p>
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. CHEMISTRY PAIR DETAIL MODAL / POPUP */}
      {selectedChemistryPair && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-indigo-950/70 border-2 border-amber-500/60 shadow-xl space-y-2 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h4 className="font-tech font-bold text-white text-xs sm:text-sm">
                  {playerMap.get(selectedChemistryPair.player1Id)?.name} ⚡ {playerMap.get(selectedChemistryPair.player2Id)?.name} · 战术化学反应报告
                </h4>
                <span className="text-[10px] text-amber-300 font-tech">
                  默契评级: {selectedChemistryPair.chemistryScore} 分 ({selectedChemistryPair.chemistryGrade} 级)
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedChemistryPair(null)}
              className="p-1 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[10px] text-slate-200 font-sans leading-relaxed bg-slate-950/80 p-2 rounded-xl border border-slate-800">
            {selectedChemistryPair.analysis}
          </p>

          <div className="flex items-center justify-between text-[10px] font-tech pt-1">
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              羁绊战术光环: {selectedChemistryPair.synergyBuff}
            </span>
            <span className="text-slate-400 text-[9px]">
              {selectedChemistryPair.isComplementary ? '✨ 风格完美互补' : '常规连携'}
            </span>
          </div>
        </div>
      )}

    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none overflow-y-auto animate-fade-in font-sans">
        <div className="relative max-w-4xl w-full bg-[#0a0f1d] border-2 border-cyan-500/60 rounded-3xl p-4 sm:p-6 shadow-[0_0_60px_rgba(6,182,212,0.25)] my-auto max-h-[92vh] overflow-y-auto">
          {containerContent}
        </div>
      </div>
    );
  }

  return containerContent;
};
