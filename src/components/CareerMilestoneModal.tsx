import React, { useState } from 'react';
import { 
  X, 
  Award, 
  Sparkles, 
  Check, 
  Lock, 
  Trophy, 
  Zap, 
  Shield, 
  Flame, 
  Target, 
  Star, 
  ChevronRight,
  Newspaper
} from 'lucide-react';
import { CareerMilestone, MilestoneCategory, CareerJournalEntry } from '../types/game';
import { soundEngine } from '../utils/audio';
import { CareerJournalView } from './CareerJournalView';
import { INITIAL_CAREER_JOURNAL_ENTRIES } from '../data/careerJournalData';

export type CareerMilestoneModalTab = 'milestones' | 'journal';

interface CareerMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestones: CareerMilestone[];
  activeTitle: string | null;
  onClaimMilestone: (id: string) => void;
  onEquipTitle: (title: string | null) => void;
  journalEntries?: CareerJournalEntry[];
  onAddJournalEntry?: (entry: CareerJournalEntry) => void;
  initialTab?: CareerMilestoneModalTab;
  playerStats?: any;
}

export const CareerMilestoneModal: React.FC<CareerMilestoneModalProps> = ({
  isOpen,
  onClose,
  milestones,
  activeTitle,
  onClaimMilestone,
  onEquipTitle,
  journalEntries = INITIAL_CAREER_JOURNAL_ENTRIES,
  onAddJournalEntry,
  initialTab = 'milestones',
  playerStats
}) => {
  const [activeMainTab, setActiveMainTab] = useState<CareerMilestoneModalTab>(initialTab);
  const [selectedCategory, setSelectedCategory] = useState<MilestoneCategory>('ALL');

  React.useEffect(() => {
    if (isOpen) {
      setActiveMainTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const totalUnlocked = milestones.filter(m => m.unlocked).length;
  const totalCount = milestones.length;
  const progressPercent = Math.round((totalUnlocked / totalCount) * 100);
  const unclaimedCount = milestones.filter(m => m.unlocked && !m.claimed).length;

  const filteredMilestones = milestones.filter(m => {
    if (selectedCategory === 'ALL') return true;
    return m.category === selectedCategory;
  });

  const activeMilestone = milestones.find(m => m.title === activeTitle);

  const getRarityBadge = (rarity: CareerMilestone['rarity']) => {
    switch (rarity) {
      case 'MYTHIC':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-tech bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-rose-400" />
            神话限定
          </span>
        );
      case 'LEGENDARY':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-tech bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400" />
            传奇至尊
          </span>
        );
      case 'EPIC':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-tech bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
            <Shield className="w-3 h-3 text-purple-400" />
            史诗卓越
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-tech bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyan-400" />
            精锐突破
          </span>
        );
    }
  };

  const getCardBorder = (milestone: CareerMilestone) => {
    if (milestone.title === activeTitle) {
      return 'border-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.25)] bg-slate-900/95';
    }
    if (milestone.unlocked) {
      return 'border-cyan-500/40 bg-slate-900/80 hover:border-cyan-400/70';
    }
    return 'border-slate-800/80 bg-slate-950/60 opacity-80';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-950 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative font-sans text-slate-100">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-900/90 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              {activeMainTab === 'journal' ? (
                <Newspaper className="w-5 h-5 text-white" />
              ) : (
                <Award className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-tech text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-200 to-cyan-300 tracking-wide">
                  {activeMainTab === 'journal' ? '生涯快报 · 复古纪事周报' : '生涯里程碑 · 称号殿堂'}
                </h2>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {activeMainTab === 'journal' ? 'RETRO CHRONICLE' : 'MILESTONES'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                {activeMainTab === 'journal'
                  ? '权威报社追踪采写：头版报道每一场夺冠、签约经纪人与宿怨清算重大人生时刻'
                  : '突破电竞各项历史统计极值，佩戴专属称号享有实机属性特权'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Primary Tabs: 称号殿堂 vs. 生涯纪事报 */}
        <div className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-slate-900/90 border-b border-slate-800 flex-shrink-0">
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveMainTab('milestones');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-tech font-bold transition flex items-center justify-center gap-2 cursor-pointer border ${
              activeMainTab === 'milestones'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(251,191,36,0.2)]'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>荣誉称号殿堂</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-code">
              {totalUnlocked}/{totalCount}
            </span>
            {unclaimedCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveMainTab('journal');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-serif font-bold transition flex items-center justify-center gap-2 cursor-pointer border relative ${
              activeMainTab === 'journal'
                ? 'bg-[#f7f2e5] text-stone-950 border-stone-400 shadow-md'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Newspaper className="w-4 h-4 text-amber-500" />
            <span>生涯纪事报 · 复古号外</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeMainTab === 'journal' ? 'bg-stone-800 text-[#fdfbf7]' : 'bg-slate-800 text-slate-300'
            }`}>
              {journalEntries.length} 篇
            </span>
          </button>
        </div>

        {/* Tab 1: Retro Newspaper Career Journal View */}
        {activeMainTab === 'journal' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 overscroll-contain bg-[#eae3cf]">
            <CareerJournalView
              entries={journalEntries}
              onAddEntry={onAddJournalEntry}
              playerStats={playerStats}
            />
          </div>
        )}

        {/* Tab 2: Honorary Titles and Milestones View */}
        {activeMainTab === 'milestones' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Quick-switch banner to Career Journal */}
            <div className="px-4 sm:px-6 py-2 bg-gradient-to-r from-amber-950/40 via-stone-900 to-amber-950/40 border-b border-amber-500/20 flex items-center justify-between text-xs flex-shrink-0">
              <div className="flex items-center gap-2 text-amber-300">
                <Newspaper className="w-3.5 h-3.5 text-amber-400" />
                <span>各大主流电竞媒体已为您发行 <strong>{journalEntries.length}</strong> 篇复古报纸剪报号外！</span>
              </div>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setActiveMainTab('journal');
                }}
                className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-serif font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <span>阅读头版剪报</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Current Active Title Banner */}
            <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-amber-950/30 via-slate-900 to-cyan-950/30 border-b border-slate-800/80 flex-shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Flame className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">当前佩戴称号:</span>
                      {activeMilestone ? (
                        <span className="px-2.5 py-0.5 rounded-md font-tech font-extrabold text-sm tracking-wider text-amber-300 bg-amber-500/20 border border-amber-400/50 shadow-[0_0_12px_rgba(251,191,36,0.3)]">
                          👑 {activeMilestone.title} ({activeMilestone.titleEn})
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 italic">
                          未佩戴称号 (可点击下方已解锁称号进行佩戴)
                        </span>
                      )}
                    </div>
                    {activeMilestone && (
                      <p className="text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        实机特权加成: {activeMilestone.titleBonusDesc}
                      </p>
                    )}
                  </div>
                </div>

                {activeMilestone && (
                  <button
                    onClick={() => onEquipTitle(null)}
                    className="self-start sm:self-auto text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                  >
                    卸下称号
                  </button>
                )}
              </div>
            </div>

            {/* Overall Completion Progress Bar & Category Tabs */}
            <div className="px-4 sm:px-6 py-2.5 bg-slate-900/60 border-b border-slate-800/80 flex-shrink-0 space-y-2.5">
              {/* Progress metric */}
              <div className="flex items-center justify-between text-xs font-tech">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">总收集进度:</span>
                  <span className="text-amber-400 font-bold">{totalUnlocked} / {totalCount}</span>
                  <span className="text-slate-500">({progressPercent}%)</span>
                </div>
                {unclaimedCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                    🎁 尚有 {unclaimedCount} 个里程碑奖励待领取
                  </span>
                )}
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-amber-400 to-rose-500 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Category Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 text-xs">
                {[
                  { id: 'ALL' as MilestoneCategory, label: '全部称号' },
                  { id: 'SOLO_QUEUE' as MilestoneCategory, label: '业余天梯' },
                  { id: 'CLUTCH_COMBAT' as MilestoneCategory, label: '极限微操' },
                  { id: 'STAGE_PRO' as MilestoneCategory, label: '职业赛场' },
                  { id: 'DYNASTY_TYCOON' as MilestoneCategory, label: '传奇豪门' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedCategory(tab.id);
                    }}
                    className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition cursor-pointer text-xs ${
                      selectedCategory === tab.id
                        ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Milestone List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 overscroll-contain">
              {filteredMilestones.map(milestone => {
                const isEquipped = activeTitle === milestone.title;
                const currentVal = milestone.currentValue || 0;
                const targetVal = milestone.targetValue;
                const progressRatio = Math.min(100, Math.round((currentVal / targetVal) * 100));

                return (
                  <div
                    key={milestone.id}
                    className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-200 relative ${getCardBorder(milestone)}`}
                  >
                    {/* Top Row: Title, En Subtitle, Rarity, and Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-base font-tech text-white tracking-wide">
                            {milestone.title}
                          </span>
                          <span className="text-xs font-tech text-slate-400 font-medium">
                            [{milestone.titleEn}]
                          </span>
                          {getRarityBadge(milestone.rarity)}
                          {isEquipped && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 font-tech flex items-center gap-1 shadow-sm">
                              <Check className="w-3 h-3" />
                              已佩戴
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {milestone.description}
                        </p>
                      </div>
                    </div>

                    {/* Requirement & Live Progress Bar */}
                    <div className="mt-3 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Target className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{milestone.statRequirementText}</span>
                        </div>
                        <span className={`font-tech font-bold ${milestone.unlocked ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {milestone.unlocked ? '已达成 100%' : `${currentVal} / ${targetVal} (${progressRatio}%)`}
                        </span>
                      </div>

                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            milestone.unlocked
                              ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                              : 'bg-gradient-to-r from-cyan-600 to-blue-500'
                          }`}
                          style={{ width: `${progressRatio}%` }}
                        />
                      </div>
                    </div>

                    {/* In-Game Title Buff */}
                    <div className="mt-2 text-[11px] text-amber-300/90 flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1.5 rounded-md border border-amber-500/20">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span>佩戴实装加成：{milestone.titleBonusDesc}</span>
                    </div>

                    {/* Bottom Row: Rewards & Action Buttons */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                      {/* Rewards preview */}
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-slate-400">里程碑奖励:</span>
                        {milestone.rewardLp && (
                          <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-tech font-bold">
                            +{milestone.rewardLp} LP
                          </span>
                        )}
                        {milestone.rewardMoney && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-tech font-bold">
                            +${milestone.rewardMoney.toLocaleString()}
                          </span>
                        )}
                        {milestone.rewardFame && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-tech font-bold">
                            +{milestone.rewardFame} 声望
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {milestone.unlocked ? (
                          <>
                            {!milestone.claimed ? (
                              <button
                                onClick={() => onClaimMilestone(milestone.id)}
                                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-500/20 transition cursor-pointer animate-pulse"
                              >
                                <Trophy className="w-3.5 h-3.5" />
                                领取奖励
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-500" />
                                已领奖励
                              </span>
                            )}

                            {isEquipped ? (
                              <button
                                onClick={() => onEquipTitle(null)}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition cursor-pointer"
                              >
                                卸下
                              </button>
                            ) : (
                              <button
                                onClick={() => onEquipTitle(milestone.title)}
                                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                              >
                                <CrownIcon className="w-3.5 h-3.5" />
                                佩戴称号
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="px-2.5 py-1 rounded bg-slate-900 text-slate-500 text-[11px] border border-slate-800 flex items-center gap-1">
                            <Lock className="w-3 h-3 text-slate-600" />
                            尚未达成
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400 flex-shrink-0">
          <span>
            {activeMainTab === 'journal'
              ? '复古报纸剪报将随生涯重大事件自动加印并永久珍藏'
              : '称号特权将在天梯、赛场BP与豪门经营中全程生效'}
          </span>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-medium"
          >
            返回
          </button>
        </div>
      </div>
    </div>
  );
};

function CrownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
    </svg>
  );
}
