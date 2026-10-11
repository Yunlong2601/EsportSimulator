import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, 
  Users, 
  Share2, 
  Flame, 
  Tv, 
  Sparkles, 
  DollarSign, 
  Radio, 
  Film, 
  Home, 
  Truck, 
  ShoppingBag, 
  Send, 
  Zap, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  MessageSquare,
  Award,
  SlidersHorizontal,
  Flag,
  Shield,
  Lock,
  Smile,
  HeartHandshake,
  Heart,
  TrendingDown,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { CommunityCampaign, CommunityRelationsState, GamePhase, DynastyState, PlayerStats, ProPlayer } from '../../types/game';
import { COMMUNITY_CAMPAIGNS, LIVE_MATCH_DANMAKU_POOL, FANBASE_MILESTONES } from '../../data/communityRelationsData';
import { soundEngine } from '../../utils/audio';

interface FloatingDanmaku {
  id: string;
  text: string;
  color: string;
  lane: number;
  speed: number; // Duration in seconds
  isCustom?: boolean;
}

interface CommunityRelationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityState: CommunityRelationsState;
  playerMoney: number;
  playerEnergy: number;
  dynastyBudget?: number;
  currentPhase: GamePhase;
  onExecuteCampaign: (campaignId: string) => boolean;
  onSendCustomDanmaku?: (text: string) => void;
  dynastyState?: DynastyState;
  playerStats?: PlayerStats;
  onUpdateDynasty?: React.Dispatch<React.SetStateAction<DynastyState>>;
  onAddLog?: (msg: string, type: 'win' | 'loss' | 'event' | 'gear') => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  social_memes: <Flame className="w-4 h-4 text-amber-400" />,
  social_lottery: <Sparkles className="w-4 h-4 text-purple-400" />,
  social_docuseries: <Film className="w-4 h-4 text-cyan-400" />,
  meetup_house_day: <Home className="w-4 h-4 text-emerald-400" />,
  meetup_city_tour: <Truck className="w-4 h-4 text-blue-400" />,
  meetup_lan_party: <Users className="w-4 h-4 text-indigo-400" />,
  stream_merch_drop: <ShoppingBag className="w-4 h-4 text-pink-400" />,
  stream_collab_show: <Radio className="w-4 h-4 text-orange-400" />,
  stream_mega_festival: <Tv className="w-4 h-4 text-yellow-400" />
};

export const CommunityRelationsModal: React.FC<CommunityRelationsModalProps> = ({
  isOpen,
  onClose,
  communityState,
  playerMoney,
  playerEnergy,
  dynastyBudget,
  currentPhase,
  onExecuteCampaign,
  onSendCustomDanmaku,
  dynastyState,
  playerStats,
  onUpdateDynasty,
  onAddLog
}) => {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'milestones' | 'team_dynamics' | 'danmaku_room' | 'history'>('campaigns');
  const [selectedBannerPreview, setSelectedBannerPreview] = useState<string | null>(null);
  const [copiedEmoteNotice, setCopiedEmoteNotice] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'SOCIAL' | 'MEETUP' | 'STREAM'>('ALL');
  const [pepTalkNotice, setPepTalkNotice] = useState<string | null>(null);

  // Active Starter Roster
  const activeRoster: ProPlayer[] = useMemo(() => {
    if (dynastyState?.roster && dynastyState.roster.length > 0) {
      return dynastyState.roster;
    }
    return [
      { id: 'roster-top', name: 'Bin二代 (陈选手)', role: 'TOP', age: 19, country: '中国', mechanics: 94, macro: 90, morale: 92, salary: 50000, marketValue: 200000, avatar: '⚔️', playstyle: 'Aggressive' },
      { id: 'roster-jug', name: '小龙包 (高选手)', role: 'JUG', age: 20, country: '中国', mechanics: 91, macro: 89, morale: 88, salary: 45000, marketValue: 180000, avatar: '🐉', playstyle: 'Clutch' },
      { id: 'roster-mid', name: '宿命先锋 (队长)', role: 'MID', age: 18, country: '中国', mechanics: playerStats?.mechanics || 95, macro: 94, morale: 96, salary: 80000, marketValue: 400000, avatar: '👑', playstyle: 'Aggressive' },
      { id: 'roster-adc', name: '走A新秀 (赵选手)', role: 'ADC', age: 19, country: '中国', mechanics: 93, macro: 88, morale: 86, salary: 50000, marketValue: 220000, avatar: '🏹', playstyle: 'Macro-Oriented' },
      { id: 'roster-sup', name: '绝活泰坦 (刘选手)', role: 'SUP', age: 21, country: '中国', mechanics: 89, macro: 92, morale: 90, salary: 40000, marketValue: 160000, avatar: '🛡️', playstyle: 'Defensive' }
    ];
  }, [dynastyState?.roster, playerStats?.mechanics]);

  // Team Dynamics: Average Synergy & Morale Metrics based on Recent Match History
  const teamDynamics = useMemo(() => {
    const totalMorale = activeRoster.reduce((sum, p) => sum + (p.morale || 85), 0);
    const avgMorale = Math.round(totalMorale / activeRoster.length);

    // Synergy Score calculation based on role coverage, playstyles and fanbase hype
    const rolesPresent = new Set(activeRoster.map(p => p.role)).size;
    const baseSynergy = 72;
    const roleBonus = rolesPresent >= 5 ? 14 : rolesPresent * 2.5;
    const fanbaseSynergyBoost = Math.min(8, Math.round((communityState.fanbaseMultiplier - 1.0) * 8));
    const rawSynergy = Math.min(100, Math.round(baseSynergy + roleBonus + (avgMorale - 75) * 0.25 + fanbaseSynergyBoost));
    const avgSynergy = Math.max(55, rawSynergy);

    // Recent 5 match results track
    const recentMatches = [
      { id: 'm1', opponent: 'KT 战队', isWin: true, score: '2-0', moraleShift: '+4%', moraleLevel: 82, note: '揭幕战双C稳健运营拿下开门红' },
      { id: 'm2', opponent: 'JDG 豪门', isWin: true, score: '2-1', moraleShift: '+5%', moraleLevel: 87, note: '决胜局翻盘极大振奋了队员争冠信心' },
      { id: 'm3', opponent: 'GEN 劲旅', isWin: false, score: '1-2', moraleShift: '-3%', moraleLevel: 84, note: '虽惜败强敌但暴露出前期换线沟通瑕疵' },
      { id: 'm4', opponent: 'BLG 蛟龙', isWin: true, score: '2-0', moraleShift: '+6%', moraleLevel: 90, note: '针对性BP完克对手，全员打出极高执行力' },
      { id: 'm5', opponent: 'T1 王朝', isWin: true, score: '2-1', moraleShift: '+7%', moraleLevel: 94, note: '大龙坑极限反打斩落榜首，士气狂飙登顶！' }
    ];

    const winsCount = recentMatches.filter(m => m.isWin).length;
    const isRising = winsCount >= 4;
    const isFalling = winsCount <= 2;

    let synergyGrade = 'S+';
    let synergyDescription = '心领神会 · 步调一致';
    if (avgSynergy >= 92) {
      synergyGrade = 'SSS';
      synergyDescription = '绝境合璧 · 天衣无缝';
    } else if (avgSynergy >= 82) {
      synergyGrade = 'S+';
      synergyDescription = '战术共振 · 默契拉满';
    } else if (avgSynergy >= 72) {
      synergyGrade = 'S';
      synergyDescription = '配合融洽 · 战力扎实';
    } else {
      synergyGrade = 'A';
      synergyDescription = '磨合蓄势 · 仍有提升空间';
    }

    return {
      avgSynergy,
      avgMorale,
      synergyGrade,
      synergyDescription,
      recentMatches,
      winsCount,
      isRising,
      isFalling
    };
  }, [activeRoster, communityState.fanbaseMultiplier]);

  const handlePepTalk = () => {
    soundEngine.playLevelUp();
    if (onUpdateDynasty) {
      onUpdateDynasty(prev => ({
        ...prev,
        roster: prev.roster.map(p => ({
          ...p,
          morale: Math.min(100, (p.morale || 85) + 5)
        }))
      }));
    }
    if (onAddLog) {
      onAddLog('🗣️【更衣室动员会】深度沟通战术战犯与心态疏导！全队士气提振 +5%，团队默契值大幅强化！', 'event');
    }
    setPepTalkNotice('✓ 更衣室动员圆满完成！全队士气与协同默契 +5% 提振生效！');
    setTimeout(() => setPepTalkNotice(null), 3500);
  };
  
  // Danmaku live stream states
  const [danmakuList, setDanmakuList] = useState<FloatingDanmaku[]>([]);
  const [customDanmakuInput, setCustomDanmakuInput] = useState<string>('');
  const [danmakuEnabled, setDanmakuEnabled] = useState<boolean>(true);
  const [danmakuDensity, setDanmakuDensity] = useState<'normal' | 'dense'>('normal');
  const [simulatedMatchEvent, setSimulatedMatchEvent] = useState<string>('🔥 蓝方打野抢下纳什男爵！大龙buff直接平推中路高地！');
  const [viewerCount, setViewerCount] = useState<number>(3824000);

  // Floating danmaku timer
  useEffect(() => {
    if (!isOpen || activeTab !== 'danmaku_room' || !danmakuEnabled) return;

    const intervalTime = danmakuDensity === 'dense' ? 900 : 1800;
    const interval = setInterval(() => {
      const preset = LIVE_MATCH_DANMAKU_POOL[Math.floor(Math.random() * LIVE_MATCH_DANMAKU_POOL.length)];
      const newDanmaku: FloatingDanmaku = {
        id: `danmaku-${Date.now()}-${Math.random()}`,
        text: preset.text,
        color: preset.color,
        lane: Math.floor(Math.random() * 4), // 4 vertical tracks
        speed: Math.floor(Math.random() * 3) + 6 // 6 - 8s duration
      };

      setDanmakuList(prev => [...prev.slice(-25), newDanmaku]);
      setViewerCount(prev => prev + Math.floor(Math.random() * 1200) - 400);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isOpen, activeTab, danmakuEnabled, danmakuDensity]);

  // Periodic match headline updates
  useEffect(() => {
    if (!isOpen || activeTab !== 'danmaku_room') return;

    const events = [
      '🔥 蓝方打野抢下纳什男爵！大龙buff直接平推中路高地！',
      '⚡ 队长中单刺客天秀1v3反杀！拿下三杀完成绝境翻盘！',
      '👑 团灭！ACE！蓝方团战完美配合打出0换5！',
      '⚔️ 红方双人组对线击杀！第一滴血爆发！',
      '🛡️ 队长极限金身规避毁灭性大招，队友及时赶到收割！'
    ];

    const eventInterval = setInterval(() => {
      const ev = events[Math.floor(Math.random() * events.length)];
      setSimulatedMatchEvent(ev);
    }, 7000);

    return () => clearInterval(eventInterval);
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const availableMoney = currentPhase === 3 && dynastyBudget !== undefined ? dynastyBudget : playerMoney;

  const handleLaunch = (campaign: CommunityCampaign) => {
    const cd = communityState.activeCooldowns[campaign.id] || 0;
    if (cd > 0) {
      alert(`活动【${campaign.title}】仍在策划筹备中，剩余 ${cd} 天冷却！`);
      return;
    }

    if (availableMoney < campaign.cost) {
      alert(`运营预算不足！需要 $${campaign.cost.toLocaleString()}，当前仅有 $${availableMoney.toLocaleString()}！`);
      return;
    }

    if (playerEnergy < campaign.energyCost) {
      alert(`精力不足！需要消耗 ${campaign.energyCost} 点精力，当前仅剩 ${playerEnergy} 点！`);
      return;
    }

    soundEngine.playLevelUp();
    onExecuteCampaign(campaign.id);
  };

  const handleSendDanmaku = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDanmakuInput.trim()) return;

    soundEngine.playClick();
    const custom: FloatingDanmaku = {
      id: `custom-${Date.now()}`,
      text: `★ 队长VIP: ${customDanmakuInput.trim()}`,
      color: '#F59E0B',
      lane: Math.floor(Math.random() * 4),
      speed: 6.5,
      isCustom: true
    };

    setDanmakuList(prev => [...prev, custom]);
    if (onSendCustomDanmaku) {
      onSendCustomDanmaku(customDanmakuInput.trim());
    }
    setCustomDanmakuInput('');
  };

  const filteredCampaigns = COMMUNITY_CAMPAIGNS.filter(c => {
    if (selectedFilter === 'ALL') return true;
    return c.type === selectedFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative max-w-lg w-full bg-slate-900 border border-slate-700/80 rounded-2xl flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-tech font-bold text-white text-base">
                  社区公关与粉丝运营
                </h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  Fanbase CRM
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                策划病毒营销与破圈直播，倍数提振王朝赞助商周薪收益
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Metric Bar */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950/60 border-b border-slate-800 text-center">
          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-tech flex items-center justify-center gap-1">
              <Users className="w-3 h-3 text-cyan-400" /> 全网粉丝基数
            </span>
            <div className="text-sm font-extrabold font-code text-cyan-300">
              {communityState.fanbaseCount.toLocaleString()} 人
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/80 border border-amber-500/30 bg-amber-500/5">
            <span className="text-[10px] text-amber-300 font-tech flex items-center justify-center gap-1">
              <TrendingUp className="w-3 h-3 text-amber-400" /> 赞助收益倍率
            </span>
            <div className="text-sm font-extrabold font-code text-amber-400">
              ★ {communityState.fanbaseMultiplier.toFixed(2)}x ★
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-tech flex items-center justify-center gap-1">
              <DollarSign className="w-3 h-3 text-emerald-400" /> 赞助溢价加成
            </span>
            <div className="text-sm font-extrabold font-code text-emerald-300">
              +{Math.round((communityState.fanbaseMultiplier - 1.0) * 100)}%
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-3 pt-2 gap-2 text-xs font-tech font-bold">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`pb-2 px-2.5 flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'campaigns'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>粉丝公关企划 ({COMMUNITY_CAMPAIGNS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('milestones')}
            className={`pb-2 px-2.5 flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'milestones'
                ? 'border-yellow-400 text-yellow-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flag className="w-3.5 h-3.5 text-yellow-400" />
            <span>粉丝里程碑战旗 ({FANBASE_MILESTONES.filter(m => communityState.fanbaseCount >= m.threshold).length}/{FANBASE_MILESTONES.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('danmaku_room')}
            className={`pb-2 px-2.5 flex items-center gap-1.5 border-b-2 transition cursor-pointer relative ${
              activeTab === 'danmaku_room'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tv className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>赛事直播弹幕观赛</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping absolute top-1 right-0" />
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2 px-2.5 flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'history'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>公关履历 ({communityState.recentActivities.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
          {/* TAB 1: CAMPAIGNS */}
          {activeTab === 'campaigns' && (
            <div className="space-y-3">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-tech font-bold">
                {[
                  { id: 'ALL', label: '全部企划' },
                  { id: 'SOCIAL', label: '📱 社交媒体营销' },
                  { id: 'MEETUP', label: '🤝 线下见面会' },
                  { id: 'STREAM', label: '🎙️ 破圈直播狂欢' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFilter(f.id as any)}
                    className={`px-2.5 py-1 rounded-lg border transition whitespace-nowrap cursor-pointer ${
                      selectedFilter === f.id
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Campaign Cards List */}
              <div className="space-y-2.5">
                {filteredCampaigns.map(camp => {
                  const cooldown = communityState.activeCooldowns[camp.id] || 0;
                  const isCooling = cooldown > 0;
                  const canAfford = availableMoney >= camp.cost;
                  const hasEnergy = playerEnergy >= camp.energyCost;

                  return (
                    <div
                      key={camp.id}
                      className={`p-3 rounded-xl border transition flex flex-col justify-between gap-2.5 ${
                        isCooling
                          ? 'bg-slate-950/40 border-slate-800/60 opacity-80'
                          : 'bg-slate-950/80 border-slate-800 hover:border-amber-500/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                            {CATEGORY_ICONS[camp.id] || <Sparkles className="w-4 h-4 text-amber-400" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white font-tech">
                                {camp.title}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                {camp.categoryName}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                              {camp.description}
                            </p>
                          </div>
                        </div>

                        {/* Cooldown badge */}
                        {isCooling ? (
                          <span className="text-[10px] font-code px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-amber-500/30 flex items-center gap-1 whitespace-nowrap">
                            <Clock className="w-3 h-3" /> {cooldown}天冷却
                          </span>
                        ) : (
                          <span className="text-[10px] font-code px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 whitespace-nowrap">
                            <CheckCircle2 className="w-3 h-3" /> 可策划
                          </span>
                        )}
                      </div>

                      {/* Gains and Costs */}
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/80">
                        <div className="flex items-center gap-3 font-code">
                          <span className="text-cyan-300 font-bold flex items-center gap-0.5">
                            <Users className="w-3 h-3 text-cyan-400" /> +{camp.fanbaseGain.toLocaleString()}
                          </span>
                          <span className="text-amber-400 font-bold flex items-center gap-0.5">
                            <TrendingUp className="w-3 h-3 text-amber-400" /> +{camp.multiplierGain.toFixed(2)}x
                          </span>
                          <span className="text-slate-400 flex items-center gap-0.5">
                            <Zap className="w-3 h-3 text-purple-400" /> -{camp.energyCost}精力
                          </span>
                        </div>

                        <button
                          onClick={() => handleLaunch(camp)}
                          disabled={isCooling || !canAfford || !hasEnergy}
                          className={`px-3 py-1.5 rounded-lg font-tech font-bold text-xs flex items-center gap-1 cursor-pointer transition ${
                            isCooling || !canAfford || !hasEnergy
                              ? 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                              : 'bg-amber-500 hover:bg-amber-400 active:bg-amber-300 text-slate-950 shadow-md'
                          }`}
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>${camp.cost.toLocaleString()} 举办</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: FANBASE MILESTONES (粉丝阶梯里程碑战旗与专属聊天表情) */}
          {activeTab === 'milestones' && (
            <div className="space-y-3">
              {/* Notification Banner */}
              {copiedEmoteNotice && (
                <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-tech font-bold flex items-center justify-between animate-fadeIn">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{copiedEmoteNotice}</span>
                  </div>
                  <button onClick={() => setCopiedEmoteNotice(null)} className="text-emerald-400 hover:text-white cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Progress Summary Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/40 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      <Flag className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-tech font-bold text-white">粉丝里程碑战旗与赛事特权</h4>
                      <p className="text-[10px] text-slate-400 font-sans">
                        全网粉丝数量突破指定阈值即可永久解锁定制「战队战旗」与「直播间专属表情」！
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-code text-slate-400 block">当前粉丝基数</span>
                    <span className="text-sm font-code font-black text-amber-300">
                      {communityState.fanbaseCount.toLocaleString()} 人
                    </span>
                  </div>
                </div>

                {/* Milestones Progress Ladder */}
                <div className="space-y-3 pt-2">
                  {FANBASE_MILESTONES.map((m, idx) => {
                    const isUnlocked = communityState.fanbaseCount >= m.threshold;
                    const progressPercent = Math.min(100, Math.round((communityState.fanbaseCount / m.threshold) * 100));

                    return (
                      <div
                        key={m.id}
                        className={`p-3 rounded-xl border transition relative overflow-hidden ${
                          isUnlocked
                            ? 'bg-slate-900/90 border-amber-500/50 shadow-md'
                            : 'bg-slate-950/70 border-slate-800/80 opacity-75'
                        }`}
                      >
                        {/* Milestone Header */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl shrink-0">{m.bannerSkin.icon}</span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-tech font-bold text-white">{m.title}</span>
                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-code font-bold uppercase ${
                                  m.bannerSkin.tier === 'LEGENDARY'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : m.bannerSkin.tier === 'EPIC'
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                }`}>
                                  {m.bannerSkin.tier}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-code mt-0.5">
                                粉丝门槛: {m.threshold.toLocaleString()} 人 • {m.perkDescription}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            {isUnlocked ? (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-tech font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shadow-sm">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                <span>已解锁</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-tech font-bold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" />
                                <span>进度 {progressPercent}%</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Banner & Emote Showcase Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/80">
                          {/* Banner Skin Card */}
                          <div className={`p-2.5 rounded-xl border bg-gradient-to-r ${m.bannerSkin.gradientBg} ${m.bannerSkin.borderColor} shadow-inner flex items-center justify-between`}>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{m.bannerSkin.icon}</span>
                              <div>
                                <div className={`text-[11px] font-tech font-black ${m.bannerSkin.textColor}`}>
                                  {m.bannerSkin.name}
                                </div>
                                <div className="text-[9px] text-slate-300/90 font-sans line-clamp-1">
                                  {m.bannerSkin.description}
                                </div>
                              </div>
                            </div>
                            <span className="text-[9px] font-tech font-bold px-1.5 py-0.5 rounded bg-black/40 text-white shrink-0 border border-white/20">
                              战队战旗
                            </span>
                          </div>

                          {/* Chat Emote Card */}
                          <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xl p-1 rounded-lg bg-slate-900 border border-slate-800">
                                {m.specialEmote.emoji}
                              </span>
                              <div>
                                <div className="text-[11px] font-tech font-bold text-white flex items-center gap-1">
                                  <span>{m.specialEmote.label}</span>
                                  <span className="text-[9px] font-code text-cyan-400 font-normal">
                                    {m.specialEmote.code}
                                  </span>
                                </div>
                                <div className="text-[9px] text-slate-400 font-sans">
                                  弹幕观赛专属表情 • {m.specialEmote.rarity.toUpperCase()}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                soundEngine.playClick();
                                setCopiedEmoteNotice(`已复制专属表情 "${m.specialEmote.emoji} ${m.specialEmote.label}" 到弹幕栏！`);
                                setCustomDanmakuInput(prev => `${prev} ${m.specialEmote.emoji} ${m.specialEmote.label}`);
                                setTimeout(() => setCopiedEmoteNotice(null), 3000);
                              }}
                              disabled={!isUnlocked}
                              className={`px-2 py-1 rounded-lg text-[9px] font-tech font-bold cursor-pointer transition flex items-center gap-0.5 border ${
                                isUnlocked
                                  ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-cyan-500/40 hover:border-cyan-400'
                                  : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                              }`}
                            >
                              <Smile className="w-2.5 h-2.5" />
                              <span>{isUnlocked ? '使用表情' : '未解锁'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar for Locked */}
                        {!isUnlocked && (
                          <div className="mt-2 pt-1">
                            <div className="flex justify-between text-[9px] font-code text-slate-400 mb-0.5">
                              <span>达成进度</span>
                              <span>{communityState.fanbaseCount.toLocaleString()} / {m.threshold.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="bg-gradient-to-r from-cyan-500 to-amber-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE MATCH DANMAKU ROOM */}
          {activeTab === 'danmaku_room' && (
            <div className="space-y-3">
              {/* Broadcast Screen Player with real animated danmaku */}
              <div className="relative rounded-2xl bg-slate-950 border border-slate-700/80 h-64 sm:h-72 overflow-hidden shadow-inner flex flex-col justify-between">
                {/* Stage Atmosphere Lighting */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-cyan-950/20 pointer-events-none" />

                {/* Live Match Top Status */}
                <div className="relative z-10 p-2.5 bg-slate-950/80 backdrop-blur-sm border-b border-slate-800/80 flex items-center justify-between text-xs font-tech">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold border border-red-500/40 text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      LIVE 直播中
                    </span>
                    <span className="text-white font-bold">2026 全球总决赛 BO5 焦点对决</span>
                  </div>
                  <div className="text-[11px] font-code text-slate-400 flex items-center gap-1">
                    <Users className="w-3 h-3 text-cyan-400" />
                    <span>{(viewerCount / 10000).toFixed(1)}万 人气热度</span>
                  </div>
                </div>

                {/* Center Animated Danmaku Canvas */}
                <div className="relative flex-1 overflow-hidden pointer-events-none">
                  {/* Floating Danmaku Items across 4 lanes */}
                  {danmakuEnabled &&
                    danmakuList.map((d) => (
                      <div
                        key={d.id}
                        className={`absolute whitespace-nowrap font-bold text-xs pointer-events-none animate-danmaku ${
                          d.isCustom
                            ? 'px-2 py-0.5 rounded-full bg-amber-500/30 border border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.6)] z-20'
                            : 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]'
                        }`}
                        style={{
                          top: `${d.lane * 22 + 8}%`,
                          color: d.isCustom ? '#FCD34D' : d.color,
                          animationDuration: `${d.speed}s`
                        }}
                      >
                        {d.text}
                      </div>
                    ))}

                  {/* Stadium Arena Central Display */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center text-2xl shadow-lg mb-2">
                      🏆
                    </div>
                    <div className="text-sm font-extrabold text-white font-tech tracking-wide drop-shadow-md">
                      召唤师奖杯至尊决战舞台
                    </div>
                    <div className="text-[11px] text-amber-300 font-medium font-code mt-1 max-w-xs drop-shadow">
                      {simulatedMatchEvent}
                    </div>
                  </div>
                </div>

                {/* Bottom Danmaku Settings Bar */}
                <div className="relative z-10 p-2 bg-slate-950/80 backdrop-blur-sm border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDanmakuEnabled(!danmakuEnabled)}
                      className={`px-2 py-0.5 rounded border transition cursor-pointer font-tech ${
                        danmakuEnabled
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}
                    >
                      {danmakuEnabled ? '弹幕: 开启' : '弹幕: 关闭'}
                    </button>

                    <button
                      onClick={() => setDanmakuDensity(danmakuDensity === 'normal' ? 'dense' : 'normal')}
                      className={`px-2 py-0.5 rounded border transition cursor-pointer font-tech ${
                        danmakuDensity === 'dense'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      {danmakuDensity === 'dense' ? '密度: 狂欢' : '密度: 清爽'}
                    </button>
                  </div>

                  <span className="text-[10px] text-slate-400">
                    粉丝倍率当前加成: ★ {communityState.fanbaseMultiplier.toFixed(2)}x
                  </span>
                </div>
              </div>

              {/* Interactive Danmaku Sender Form */}
              <form onSubmit={handleSendDanmaku} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={customDanmakuInput}
                    onChange={(e) => setCustomDanmakuInput(e.target.value)}
                    placeholder="输入专属应援弹幕 (例如：给队长磕一个！全体起立！)..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-tech"
                    maxLength={30}
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] text-slate-500 font-code">
                    {customDanmakuInput.length}/30
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={!customDanmakuInput.trim()}
                  className={`px-4 py-2.5 rounded-xl font-tech font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                    customDanmakuInput.trim()
                      ? 'bg-amber-500 hover:bg-amber-400 active:bg-amber-300 text-slate-950 shadow-md'
                      : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>发弹幕</span>
                </button>
              </form>

              {/* Danmaku Preset Quick Tags */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-tech">快捷应援梗词:</span>
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  {[
                    '7777777777777',
                    '卧槽！这走位也能扭开的？？？',
                    '这就是通天代！一人抬着四个走！',
                    '建议严查！这操作绝对开了天眼！',
                    '金色的雨准备就绪！全体起立！！！',
                    '推塔推基地！我们要捧杯了！'
                  ].map((phrase, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCustomDanmakuInput(phrase)}
                      className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300 hover:border-amber-500/40 hover:text-amber-300 transition cursor-pointer"
                    >
                      {phrase}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-2">
              {communityState.recentActivities.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs font-tech">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                  <span>暂无近期举办的公关运营记录。快去策划首场病毒营销或线下见面会吧！</span>
                </div>
              ) : (
                communityState.recentActivities.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-white font-tech">{item.title}</div>
                      <div className="text-[10px] text-slate-400 font-code">{item.timestamp}</div>
                    </div>
                    <div className="text-right font-code">
                      <div className="text-cyan-300 font-bold">+{item.fanbaseGain.toLocaleString()} 粉丝</div>
                      <div className="text-[10px] text-amber-400">倍率: {item.multiplierNow.toFixed(2)}x</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
