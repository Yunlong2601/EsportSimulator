import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Trophy, 
  Swords, 
  Crown, 
  Lock, 
  CheckCircle2, 
  Clock, 
  X,
  Flame,
  Award,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { HISTORIC_LEGACY_LORE } from '../../data/legacyLoreData';
import { PrestigeState, LegacyLoreEntry } from '../../types/game';
import { soundEngine } from '../../utils/audio';

interface LegacyLoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  prestigeState?: PrestigeState;
}

export const LegacyLoreModal: React.FC<LegacyLoreModalProps> = ({
  isOpen,
  onClose,
  prestigeState
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'RIVALRY' | 'DYNASTY_CLASH' | 'MIRACLE_COMEBACK' | 'HISTORIC_MATCH'>('ALL');
  const [selectedLoreId, setSelectedLoreId] = useState<string>(HISTORIC_LEGACY_LORE[0].id);

  if (!isOpen) return null;

  const currentGeneration = prestigeState?.generation || 1;
  const lifetimePoints = prestigeState?.lifetimePrestigePoints || 0;

  // Determine unlock status based on prestige generation
  const loreList = HISTORIC_LEGACY_LORE.map(lore => {
    const isUnlocked = currentGeneration >= lore.prestigeMilestoneReq || lore.unlocked;
    return {
      ...lore,
      unlocked: isUnlocked
    };
  });

  const filteredList = selectedCategory === 'ALL' 
    ? loreList 
    : loreList.filter(l => l.category === selectedCategory);

  const selectedLore = loreList.find(l => l.id === selectedLoreId) || loreList[0];

  const categories = [
    { id: 'ALL' as const, label: '全部传奇典籍' },
    { id: 'RIVALRY' as const, label: '宿敌不灭恩怨' },
    { id: 'DYNASTY_CLASH' as const, label: '豪门世纪交锋' },
    { id: 'MIRACLE_COMEBACK' as const, label: '绝境逆转奇迹' },
    { id: 'HISTORIC_MATCH' as const, label: '巅峰决战编年史' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md select-none overflow-y-auto animate-fade-in font-sans">
      <div className="relative max-w-2xl w-full bg-[#0a0e19] border-2 border-amber-500/60 rounded-3xl p-4 sm:p-6 shadow-[0_0_70px_rgba(245,158,11,0.25)] my-auto space-y-4 max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-br from-amber-500/25 to-yellow-600/20 border border-amber-500/40 text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-tech font-extrabold text-white text-base">
                  电竞名人堂 · 历史宿怨与战局编年史 (Legacy Lore)
                </h3>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-tech font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  第 {currentGeneration} 代名宿
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                声望里程碑解锁 • 记录前世今生职业电竞赛场史诗瞬间
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

        {/* Prestige Status Banner */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/40 via-yellow-950/20 to-slate-900 border border-amber-500/30 flex items-center justify-between text-xs font-tech">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300">当前周目声望代数:</span>
            <span className="font-black font-code text-amber-300">
              GEN #{currentGeneration}
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              (累计声望点: {lifetimePoints.toLocaleString()})
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>已收录解锁 {loreList.filter(l => l.unlocked).length} / {loreList.length} 篇史册</span>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                soundEngine.playClick();
                setSelectedCategory(cat.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-tech font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Main Body: Master-Detail Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 flex-1 overflow-hidden min-h-[360px]">
          {/* Left Column: Lore Entry List */}
          <div className="sm:col-span-5 space-y-2 overflow-y-auto pr-1 max-h-[380px]">
            {filteredList.map(item => {
              const isSelected = item.id === selectedLore.id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedLoreId(item.id);
                  }}
                  className={`p-3 rounded-2xl border transition cursor-pointer space-y-1 relative ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-400 ring-1 ring-amber-400/80 shadow-md'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-tech font-bold text-amber-400">
                      {item.seasonEra}
                    </span>
                    {item.unlocked ? (
                      <span className="text-[9px] font-code text-emerald-400 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" /> 已解锁
                      </span>
                    ) : (
                      <span className="text-[9px] font-tech text-rose-400 font-bold flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" /> 需代数 {item.prestigeMilestoneReq}
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-bold text-white font-tech truncate">
                    {item.title}
                  </div>

                  <div className="text-[10px] text-slate-400 font-sans truncate">
                    {item.teams} · {item.scoreline}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Detailed Lore Chronicler View */}
          <div className="sm:col-span-7 bg-slate-950/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between overflow-y-auto max-h-[380px] space-y-3">
            {selectedLore.unlocked ? (
              <>
                <div className="space-y-3">
                  <div className="border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{selectedLore.badgeIcon}</span>
                      <div>
                        <h4 className="text-base font-black font-tech text-white leading-tight">
                          {selectedLore.title}
                        </h4>
                        <span className="text-[11px] font-tech text-amber-300">
                          {selectedLore.seasonEra}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs mt-2 font-tech">
                      <span className="text-slate-300">
                        对阵双方: <strong className="text-white">{selectedLore.teams}</strong>
                      </span>
                      <span className="text-amber-400 font-code font-bold">
                        大比分: {selectedLore.scoreline}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 mt-1 font-tech">
                      全场关键先生: <span className="text-cyan-300 font-bold">{selectedLore.mvpPlayer}</span>
                    </div>
                  </div>

                  {/* Chronicle Narrative */}
                  <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-100/90 font-serif leading-relaxed italic">
                    {selectedLore.chronicleLog}
                  </div>

                  {/* Historical Significance */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-tech font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      电竞历史战术意义与评价
                    </span>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed">
                      {selectedLore.historicalSignificance}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-tech text-slate-400">
                  <span>档案分类: {selectedLore.category}</span>
                  <span className="text-emerald-400 font-code">✓ 名人堂历史档案永久归档</span>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-lg">
                  <Lock className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold font-tech text-white">
                    该段电竞历史秘档处于封存状态
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    需要完成转生轮回达到【第 {selectedLore.prestigeMilestoneReq} 代名宿】或累积声望方可查阅此篇史诗篇章。
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-tech text-amber-300">
                  当前进度: 代数 GEN #{currentGeneration} / 所需 GEN #{selectedLore.prestigeMilestoneReq}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-1">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-white font-tech font-bold text-xs uppercase cursor-pointer"
          >
            合上史册 · 返回主界面
          </button>
        </div>
      </div>
    </div>
  );
};
