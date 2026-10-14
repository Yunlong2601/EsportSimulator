import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Award, 
  Medal, 
  Crown, 
  X, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  Star, 
  Shield, 
  Zap, 
  Flame, 
  Check, 
  Search, 
  Globe2, 
  ArrowUpRight,
  Target
} from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { CareerMilestone, MilestoneCategory } from '../types/game';
import { BASE_LEGENDS, GENERATED_TOP100, LeaderboardEntry } from './LeaderboardModal';

export type TrophyModalTab = 'trophies' | 'milestones' | 'leaderboard';

interface TrophyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: TrophyModalTab;
  trophies: {
    challengerUnlocked: boolean;
    regionalChampion: boolean;
    worldsSummonerCup: boolean;
    mvpTrophy: boolean;
  };
  milestones?: CareerMilestone[];
  activeTitle?: string | null;
  onClaimMilestone?: (id: string) => void;
  onEquipTitle?: (title: string | null) => void;
  playerEarnings?: number;
  playerCups?: number;
  playerTier?: string;
  playerName?: string;
  onOpenCareerJournal?: () => void;
}

export const TrophyModal: React.FC<TrophyModalProps> = ({ 
  isOpen, 
  onClose, 
  initialTab = 'trophies',
  trophies,
  milestones = [],
  activeTitle = null,
  onClaimMilestone,
  onEquipTitle,
  playerEarnings = 0,
  playerCups = 0,
  playerTier = 'Gold',
  playerName = '宿命先锋',
  onOpenCareerJournal
}) => {
  const [currentTab, setCurrentTab] = useState<TrophyModalTab>(initialTab);

  // Sync initial tab if changed when opened
  React.useEffect(() => {
    if (isOpen) {
      setCurrentTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Tab 2: Milestones filter state
  const [selectedCategory, setSelectedCategory] = useState<MilestoneCategory>('ALL');

  // Tab 3: Leaderboard filter state
  const [regionFilter, setRegionFilter] = useState<'ALL' | 'LPL' | 'LCK' | 'LEC'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  // Trophies data
  const trophyList = [
    {
      id: 'challenger',
      title: '最强王者巅峰徽记 (1,000 LP)',
      subtitle: '晋升全服前 0.01% 顶尖天梯王者，正式收到职业豪门试训邀约。',
      icon: Medal,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/30',
      unlocked: trophies.challengerUnlocked
    },
    {
      id: 'regional',
      title: '赛区联赛总冠军银龙旗帜',
      subtitle: '横扫赛区季后赛强敌，以赛区头号种子身份晋级全球总决赛。',
      icon: Award,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10 border-indigo-500/30',
      unlocked: trophies.regionalChampion
    },
    {
      id: 'worlds',
      title: '世界赛总冠军 · 召唤师奖杯',
      subtitle: '在首尔总决赛万众瞩目下鏖战BO5夺冠，金色的雨漫天飞舞，捧起电竞至高荣耀！',
      icon: Trophy,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/30',
      unlocked: trophies.worldsSummonerCup
    },
    {
      id: 'mvp',
      title: '全球总决赛 FMVP 冠军戒指',
      subtitle: '凭借大赛关键局决胜团战的神级统治力，当选世界赛总决赛最有价值选手！',
      icon: Crown,
      color: 'text-yellow-300',
      bgColor: 'bg-yellow-500/10 border-yellow-500/30',
      unlocked: trophies.mvpTrophy
    }
  ];

  const unlockedTrophiesCount = Object.values(trophies).filter(Boolean).length;
  const unlockedMilestonesCount = milestones.filter(m => m.unlocked).length;
  const unclaimedMilestonesCount = milestones.filter(m => m.unlocked && !m.claimed).length;

  const activeMilestone = milestones.find(m => m.title === activeTitle);

  const filteredMilestones = milestones.filter(m => {
    if (selectedCategory === 'ALL') return true;
    return m.category === selectedCategory;
  });

  // Leaderboard data
  const fullLeaderboard = useMemo(() => {
    const rawList = [...BASE_LEGENDS, ...GENERATED_TOP100];
    const playerEntry: LeaderboardEntry = {
      rank: 999,
      name: `${playerName} (你)`,
      region: 'GLOBAL',
      team: '我的战队',
      earnings: playerEarnings,
      cups: playerCups,
      msi: 0,
      status: playerCups > 0 ? "新科S赛世界总冠军" : "正在追逐召唤师之杯的传奇",
      tier: (playerTier.toUpperCase() === 'CHALLENGER' ? 'CHALLENGER' : 'GRANDMASTER') as any,
      isPlayer: true
    };

    const combined = [...rawList, playerEntry].sort((a, b) => {
      if (b.cups !== a.cups) return b.cups - a.cups;
      return b.earnings - a.earnings;
    });

    return combined.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
  }, [playerEarnings, playerCups, playerName, playerTier]);

  const filteredLeaderboard = useMemo(() => {
    return fullLeaderboard.filter(item => {
      const matchRegion = regionFilter === 'ALL' || item.region === regionFilter || item.isPlayer;
      const matchSearch = searchQuery.trim() === '' || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.team.toLowerCase().includes(searchQuery.toLowerCase());
      return matchRegion && matchSearch;
    });
  }, [fullLeaderboard, regionFilter, searchQuery]);

  const playerRankEntry = fullLeaderboard.find(x => x.isPlayer);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none font-sans text-slate-100">
      <div className="relative max-w-2xl w-full max-h-[92vh] flex flex-col bg-slate-950 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-900/85 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-tech text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-200 to-cyan-300 tracking-wide">
                  荣誉展柜 · 殿堂荣誉中心
                </h3>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  HALL OF FAME
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                赛事冠军奖杯 · 生涯专属称号殿堂 · 全球百强传奇榜
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

        {/* 3 Unified Tabs Navigation */}
        <div className="px-4 sm:px-6 py-2 bg-slate-900/90 border-b border-slate-800/80 flex items-center gap-2 flex-shrink-0">
          {/* Tab 1: 赛事奖杯 */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setCurrentTab('trophies');
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-tech font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
              currentTab === 'trophies'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(251,191,36,0.2)]'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>赛事奖杯</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-code bg-slate-800 text-slate-300">
              {unlockedTrophiesCount}/4
            </span>
          </button>

          {/* Tab 2: 称号殿堂 */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setCurrentTab('milestones');
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-tech font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border relative ${
              currentTab === 'milestones'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Award className="w-4 h-4 text-rose-400" />
            <span>称号殿堂</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-code bg-slate-800 text-slate-300">
              {unlockedMilestonesCount}/{milestones.length}
            </span>
            {unclaimedMilestonesCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute top-1 right-1" />
            )}
          </button>

          {/* Tab 3: 百强天梯榜 */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setCurrentTab('leaderboard');
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-tech font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
              currentTab === 'leaderboard'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Crown className="w-4 h-4 text-cyan-400" />
            <span>百强天梯榜</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-code bg-slate-800 text-slate-300">
              TOP 100
            </span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 overscroll-contain">
          
          {/* ========================================================================= */}
          {/* TAB 1: 赛事奖杯陈列室 */}
          {/* ========================================================================= */}
          {currentTab === 'trophies' && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-amber-300 font-tech">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>已收藏至尊赛事荣誉: {unlockedTrophiesCount} / 4 座</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  捧起召唤师杯将永久载入全服史册
                </span>
              </div>

              <div className="space-y-3">
                {trophyList.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all flex items-start gap-4 ${
                        item.unlocked
                          ? `${item.bgColor} shadow-lg shadow-black/40`
                          : 'bg-slate-900/40 border-slate-800 opacity-60'
                      }`}
                    >
                      <div
                        className={`p-3 rounded-xl border shrink-0 ${
                          item.unlocked
                            ? `${item.bgColor} ${item.color} shadow-sm`
                            : 'bg-slate-800 border-slate-700 text-slate-500'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-white font-tech text-sm sm:text-base">
                            {item.title}
                          </h4>
                          {item.unlocked ? (
                            <span className="flex items-center gap-1 text-xs text-emerald-400 font-tech font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> 已解锁
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-slate-500 font-tech">
                              <Lock className="w-3.5 h-3.5" /> 未获得
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">{item.subtitle}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: 生涯里程碑 · 专属称号殿堂 */}
          {/* ========================================================================= */}
          {currentTab === 'milestones' && (
            <div className="space-y-3.5 animate-fadeIn">
              {/* Retro Newspaper Career Journal Banner */}
              <div className="p-3 rounded-xl bg-[#f7f2e5] border-2 border-stone-800 text-stone-900 shadow-md flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-stone-800 text-[#f7f2e5] flex items-center justify-center font-serif text-base shrink-0">
                    📰
                  </div>
                  <div>
                    <div className="text-xs font-serif font-black flex items-center gap-1.5">
                      <span>《全球电竞纪事周报》生涯快报号外专刊</span>
                      <span className="px-1.5 py-0.2 rounded bg-red-700 text-white font-sans text-[9px] font-bold">
                        号外发行
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-600 font-serif">
                      各大主流电竞媒体为您头版报道每一场夺冠、签约经纪人与宿怨清算剪报！
                    </div>
                  </div>
                </div>
                {onOpenCareerJournal && (
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onOpenCareerJournal();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-[#fdfbf7] text-xs font-serif font-bold transition flex items-center gap-1 shrink-0 ml-2 cursor-pointer shadow-xs"
                  >
                    <span>阅读头版剪报</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-amber-300" />
                  </button>
                )}
              </div>

              {/* Current Active Title Banner */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-rose-950/30 border border-amber-500/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                      <Flame className="w-4 h-4 fill-current animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] text-slate-400">已佩戴至尊称号:</span>
                        {activeMilestone ? (
                          <span className="px-2 py-0.5 rounded font-tech font-extrabold text-xs text-amber-300 bg-amber-500/20 border border-amber-400/50">
                            👑 {activeMilestone.title} ({activeMilestone.titleEn})
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 italic">未佩戴任何称号</span>
                        )}
                      </div>
                      {activeMilestone && (
                        <p className="text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1 font-sans">
                          <Sparkles className="w-3 h-3" />
                          实装属性加成: {activeMilestone.titleBonusDesc}
                        </p>
                      )}
                    </div>
                  </div>

                  {activeMilestone && onEquipTitle && (
                    <button
                      onClick={() => onEquipTitle(null)}
                      className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer self-start sm:self-auto shrink-0"
                    >
                      卸下称号
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
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
                        ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Milestones List */}
              <div className="space-y-3">
                {filteredMilestones.map(milestone => {
                  const isEquipped = activeTitle === milestone.title;
                  const currentVal = milestone.currentValue || 0;
                  const targetVal = milestone.targetValue;
                  const progressRatio = Math.min(100, Math.round((currentVal / targetVal) * 100));

                  return (
                    <div
                      key={milestone.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isEquipped
                          ? 'border-amber-400/80 bg-slate-900/95 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                          : milestone.unlocked
                          ? 'border-cyan-500/40 bg-slate-900/80'
                          : 'border-slate-800/80 bg-slate-950/60 opacity-80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-sm sm:text-base font-tech text-white">
                              {milestone.title}
                            </span>
                            <span className="text-xs font-tech text-slate-400">
                              [{milestone.titleEn}]
                            </span>
                            {getRarityBadge(milestone.rarity)}
                            {isEquipped && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-400 text-slate-950 font-tech flex items-center gap-1">
                                <Check className="w-3 h-3" /> 已佩戴
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            {milestone.description}
                          </p>
                        </div>
                      </div>

                      {/* Requirement & Live Progress Bar */}
                      <div className="mt-2.5 p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1">
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

                      {/* Buff description */}
                      <div className="mt-2 text-[11px] text-amber-300/90 flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1.5 rounded-md border border-amber-500/20">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>佩戴实装加成：{milestone.titleBonusDesc}</span>
                      </div>

                      {/* Rewards & Action buttons */}
                      <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="text-slate-400">里程碑奖励:</span>
                          {milestone.rewardLp && (
                            <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-tech font-bold">
                              +{milestone.rewardLp} LP
                            </span>
                          )}
                          {milestone.rewardMoney && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-tech font-bold">
                              +${milestone.rewardMoney.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {milestone.unlocked ? (
                            <>
                              {!milestone.claimed && onClaimMilestone ? (
                                <button
                                  onClick={() => onClaimMilestone(milestone.id)}
                                  className="px-2.5 py-1 rounded bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm cursor-pointer animate-pulse"
                                >
                                  <Trophy className="w-3 h-3" />
                                  领取奖励
                                </button>
                              ) : (
                                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                  <Check className="w-3 h-3 text-emerald-500" /> 已领
                                </span>
                              )}

                              {isEquipped && onEquipTitle ? (
                                <button
                                  onClick={() => onEquipTitle(null)}
                                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition cursor-pointer"
                                >
                                  卸下
                                </button>
                              ) : onEquipTitle ? (
                                <button
                                  onClick={() => onEquipTitle(milestone.title)}
                                  className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                                >
                                  👑 佩戴称号
                                </button>
                              ) : null}
                            </>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-500 text-[11px] border border-slate-800 flex items-center gap-1">
                              <Lock className="w-3 h-3 text-slate-600" /> 尚未达成
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

          {/* ========================================================================= */}
          {/* TAB 3: 全球百强传奇天梯榜 */}
          {/* ========================================================================= */}
          {currentTab === 'leaderboard' && (
            <div className="space-y-3.5 animate-fadeIn">
              {/* Player Current Standings Banner */}
              {playerRankEntry && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-amber-950/40 border border-cyan-500/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-tech font-extrabold text-base">
                      #{playerRankEntry.rank}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-tech font-bold text-white text-sm">{playerName} (你)</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-cyan-500/20 text-cyan-300 font-code font-bold">
                          {playerTier}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        生涯总奖金: <span className="text-emerald-400 font-bold">${playerEarnings.toLocaleString()}</span> · 
                        总决赛冠军杯: <span className="text-amber-400 font-bold">{playerCups} 座</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-cyan-400 font-tech font-bold">我的排名</span>
                </div>
              )}

              {/* Search & Region Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  {(['ALL', 'LPL', 'LCK', 'LEC'] as const).map(reg => (
                    <button
                      key={reg}
                      onClick={() => {
                        soundEngine.playClick();
                        setRegionFilter(reg);
                      }}
                      className={`px-2.5 py-1 rounded-lg font-tech font-bold transition cursor-pointer text-xs ${
                        regionFilter === reg
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      {reg === 'ALL' ? '全球' : reg}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索选手或战队..."
                    className="pl-8 pr-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-full sm:w-44 font-sans"
                  />
                </div>
              </div>

              {/* Leaderboard Table List */}
              <div className="space-y-2">
                {filteredLeaderboard.slice(0, 50).map(entry => (
                  <div
                    key={entry.rank}
                    className={`p-3 rounded-xl border flex items-center justify-between transition ${
                      entry.isPlayer
                        ? 'bg-cyan-950/40 border-cyan-500/60 shadow-md'
                        : entry.rank === 1
                        ? 'bg-amber-950/30 border-amber-500/50'
                        : entry.rank <= 3
                        ? 'bg-slate-900/90 border-slate-700'
                        : 'bg-slate-900/60 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-7 text-center font-tech font-extrabold text-sm ${
                        entry.rank === 1 ? 'text-amber-400 text-base' :
                        entry.rank === 2 ? 'text-slate-300' :
                        entry.rank === 3 ? 'text-amber-600' : 'text-slate-500'
                      }`}>
                        #{entry.rank}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-tech font-bold text-white text-xs sm:text-sm truncate">
                            {entry.name}
                          </span>
                          <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-tech">
                            {entry.team}
                          </span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-slate-950 text-cyan-300 font-tech">
                            {entry.region}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-sans truncate mt-0.5">
                          {entry.status}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-tech font-bold text-emerald-400 text-xs">
                        ${entry.earnings.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-amber-400 font-tech flex items-center justify-end gap-1">
                        <Trophy className="w-3 h-3" />
                        <span>{entry.cups} 座S赛冠</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-2.5 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400 flex-shrink-0">
          <span>荣誉数据实时联动天梯赛事成就</span>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-medium cursor-pointer"
          >
            关闭展柜
          </button>
        </div>
      </div>
    </div>
  );
};
