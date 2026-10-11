import React, { useState } from 'react';
import { 
  Dumbbell, 
  Sparkles, 
  Zap, 
  Brain, 
  Flame, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  X,
  Users,
  TrendingUp,
  Award,
  ChevronRight
} from 'lucide-react';
import { DynastyState, ProPlayer } from '../../types/game';
import { soundEngine } from '../../utils/audio';

interface DynastyTrainingCampModalProps {
  isOpen: boolean;
  onClose: () => void;
  dynasty: DynastyState;
  onApplyTrainingBoost: (
    playerId: string,
    stat: 'mechanics' | 'macro' | 'morale',
    amount: number,
    cost: number
  ) => boolean;
}

export const DynastyTrainingCampModal: React.FC<DynastyTrainingCampModalProps> = ({
  isOpen,
  onClose,
  dynasty,
  onApplyTrainingBoost
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(
    dynasty.roster[0]?.id || ''
  );
  const [selectedProgram, setSelectedProgram] = useState<'mechanics' | 'macro' | 'morale'>('mechanics');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedPlayer = dynasty.roster.find(p => p.id === selectedPlayerId) || dynasty.roster[0];
  const trainingCost = 50000;
  const canAfford = dynasty.budget >= trainingCost;

  const programs = [
    {
      id: 'mechanics' as const,
      name: '极限微操与对线压制淬炼',
      statLabel: '个人微操 (Mechanics)',
      boost: '+6 微操',
      duration: '7 天持续增益',
      icon: Zap,
      color: 'text-amber-400',
      border: 'border-amber-500/40',
      bg: 'bg-amber-500/10',
      desc: '安排1对1刺客特训教官，高强度死斗复盘补刀与技能闪现预判。'
    },
    {
      id: 'macro' as const,
      name: '大局观兵线与视野运营研讨',
      statLabel: '大局运营 (Macro)',
      boost: '+6 大局观',
      duration: '7 天持续增益',
      icon: Brain,
      color: 'text-cyan-400',
      border: 'border-cyan-500/40',
      bg: 'bg-cyan-500/10',
      desc: '组织顶级分析师团队沙盘推演，精准把控纳什男爵大龙坑拉扯与四一分推节奏。'
    },
    {
      id: 'morale' as const,
      name: '绝境大心脏心态与士气集训',
      statLabel: '士气心态 (Morale)',
      boost: '+6 心态士气',
      duration: '7 天持续增益',
      icon: Flame,
      color: 'text-rose-400',
      border: 'border-rose-500/40',
      bg: 'bg-rose-500/10',
      desc: '由金牌心理督导全程介入，逆境抗压抗挫能力翻倍，绝境开团坚决果断。'
    }
  ];

  const handleStartTraining = () => {
    if (!selectedPlayer) return;
    if (!canAfford) {
      soundEngine.playDefeat();
      setActionNotice('⚠️ 俱乐部金库预算不足 $50,000，无法发起封闭式特训！');
      return;
    }

    const success = onApplyTrainingBoost(selectedPlayer.id, selectedProgram, 6, trainingCost);
    if (success) {
      soundEngine.playLevelUp();
      setActionNotice(`🎉【特训启动成功】已为 ${selectedPlayer.name} (${selectedPlayer.role}) 注入 7 天专项增益！`);
      setTimeout(() => setActionNotice(null), 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/88 backdrop-blur-md select-none overflow-y-auto animate-fade-in font-sans">
      <div className="relative max-w-lg w-full bg-[#0a0f1d] border-2 border-indigo-500/60 rounded-3xl p-4 sm:p-6 shadow-[0_0_60px_rgba(99,102,241,0.25)] my-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-500/20 border border-indigo-500/40 text-indigo-400">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-tech font-extrabold text-white text-base">
                  王朝封闭特训营 (Dynasty Training Camp)
                </h3>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-code bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  7 DAYS BOOST
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                划拨教练专项预算 • 赛前定向增强选手巅峰状态
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Club Budget Status */}
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-tech text-slate-300">俱乐部金库可用预算:</span>
            <span className="text-sm font-black font-code text-emerald-300">
              ${dynasty.budget.toLocaleString()}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-tech text-slate-400 block">特训期投入预算</span>
            <span className="text-xs font-bold font-code text-amber-300">
              ${trainingCost.toLocaleString()} / 周期 (7天)
            </span>
          </div>
        </div>

        {/* Notice feedback */}
        {actionNotice && (
          <div className="p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-500/50 text-xs font-tech text-indigo-200 animate-fadeIn">
            {actionNotice}
          </div>
        )}

        {/* Step 1: Select Roster Member */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-tech font-bold text-slate-400 uppercase flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            1. 选择特训受训首发队员 (Roster Selection)
          </span>

          <div className="grid grid-cols-5 gap-1.5">
            {dynasty.roster.map(player => {
              const isSelected = player.id === selectedPlayer?.id;
              const hasBoost = player.trainingBoost && player.trainingBoost.daysRemaining > 0;
              return (
                <button
                  key={player.id}
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedPlayerId(player.id);
                  }}
                  className={`p-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-between relative ${
                    isSelected
                      ? 'bg-indigo-600/25 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)] ring-1 ring-indigo-400'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {hasBoost && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
                  )}
                  <span className="text-[9px] font-tech font-bold text-indigo-400">
                    {player.role}
                  </span>
                  <div className="text-sm my-0.5">{player.avatar || '⚡'}</div>
                  <span className="text-[11px] font-bold text-white truncate max-w-full">
                    {player.name}
                  </span>
                  <span className="text-[9px] font-code text-slate-400">
                    {Math.round((player.mechanics + player.macro) / 2)} OVR
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Player Current Attributes & Active Timed Boosts */}
        {selectedPlayer && (
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-tech">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span>{selectedPlayer.name} ({selectedPlayer.role})</span>
                <span className="text-[9px] text-slate-400 font-normal">当前基础能力值</span>
              </span>

              {selectedPlayer.trainingBoost && selectedPlayer.trainingBoost.daysRemaining > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-tech font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  已生效 +{selectedPlayer.trainingBoost.boostAmount} ({selectedPlayer.trainingBoost.daysRemaining}天剩余)
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 font-sans">
                  暂无封闭特训增益
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[9px] text-slate-400 block font-tech">个人微操</span>
                <span className="font-code font-bold text-amber-300">{selectedPlayer.mechanics}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[9px] text-slate-400 block font-tech">大局观运营</span>
                <span className="font-code font-bold text-cyan-300">{selectedPlayer.macro}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[9px] text-slate-400 block font-tech">团队士气</span>
                <span className="font-code font-bold text-rose-300">{selectedPlayer.morale}</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Choose Coaching Program */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-tech font-bold text-slate-400 uppercase flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            2. 选定教练专项教研教案 (Coaching Program)
          </span>

          <div className="space-y-2">
            {programs.map(prog => {
              const isSelected = selectedProgram === prog.id;
              const Icon = prog.icon;
              return (
                <div
                  key={prog.id}
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedProgram(prog.id);
                  }}
                  className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? `${prog.bg} ${prog.border} ring-1 ring-indigo-400 shadow-md`
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl bg-slate-900 border border-slate-800 ${prog.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-tech text-white">
                          {prog.name}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-code font-bold ${prog.color} bg-slate-900 border border-slate-800`}>
                          {prog.boost}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-sans leading-tight">
                        {prog.desc}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-code font-bold text-indigo-300 block">
                      {prog.duration}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      消耗 $50,000
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Confirmation Action */}
        <div className="pt-1">
          <button
            onClick={handleStartTraining}
            disabled={!canAfford}
            className={`w-full py-3 rounded-2xl font-tech font-extrabold text-xs uppercase flex items-center justify-center gap-2 transition cursor-pointer shadow-lg ${
              canAfford
                ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-400 hover:to-purple-400 text-white shadow-indigo-500/25 active:scale-98'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>
              划拨 $50,000 预算 · 启动 {selectedPlayer?.name} 7天定向特训
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
