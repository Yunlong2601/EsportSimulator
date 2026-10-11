import React, { useState } from 'react';
import { 
  Tent, 
  Dumbbell, 
  DollarSign, 
  Clock, 
  Sparkles, 
  Zap, 
  Brain, 
  Flame, 
  MapPin, 
  CheckCircle2, 
  ChevronRight, 
  Users, 
  Trophy, 
  ShieldAlert, 
  Calendar,
  Compass,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { DynastyState, ProPlayer } from '../../types/game';
import { 
  BOOTCAMP_LOCATIONS, 
  BootcampLocation, 
  REMOTE_BOOTCAMP_COST 
} from '../../data/remoteBootcampData';
import { soundEngine } from '../../utils/audio';

interface TrainingCampTabViewProps {
  dynasty: DynastyState;
  onUpdateDynasty: React.Dispatch<React.SetStateAction<DynastyState>>;
  onGoToWorlds?: () => void;
}

export const TrainingCampTabView: React.FC<TrainingCampTabViewProps> = ({
  dynasty,
  onUpdateDynasty,
  onGoToWorlds
}) => {
  const [selectedLocationId, setSelectedLocationId] = useState<string>(BOOTCAMP_LOCATIONS[0].id);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const selectedLocation = BOOTCAMP_LOCATIONS.find(loc => loc.id === selectedLocationId) || BOOTCAMP_LOCATIONS[0];
  const canAfford = dynasty.budget >= REMOTE_BOOTCAMP_COST;
  const startingRoster = dynasty.roster.slice(0, 5); // Five starting players
  const activeBootcamp = dynasty.remoteBootcamp;

  // Handle spending $50,000 to deploy starting roster to the selected remote location
  const handleDeployBootcamp = (location: BootcampLocation) => {
    if (!canAfford) {
      soundEngine.playDefeat();
      setActionNotice('⚠️ 俱乐部金库预算不足 $50,000，无法支付异地封闭特训开销！');
      return;
    }

    soundEngine.playLevelUp();

    const timestamp = new Date().toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const participatingNames = startingRoster.map(p => p.name);

    onUpdateDynasty(prev => {
      // Apply the 7-day boost to all starting roster members
      const updatedRoster = prev.roster.map((player, idx) => {
        if (idx < 5) {
          return {
            ...player,
            mechanics: Math.min(100, player.mechanics + location.mechanicsBonus),
            macro: Math.min(100, player.macro + location.macroBonus),
            morale: Math.min(100, player.morale + location.moraleBonus),
            trainingBoost: {
              stat: 'mechanics' as const,
              boostAmount: location.mechanicsBonus,
              daysRemaining: 7
            }
          };
        }
        return player;
      });

      const newHistoryEntry = {
        id: `bootcamp-hist-${Date.now()}`,
        locationName: location.name,
        destination: location.destination,
        completedAt: timestamp,
        boostSummary: location.tacticalBuffDescription
      };

      return {
        ...prev,
        budget: prev.budget - REMOTE_BOOTCAMP_COST,
        fanHype: prev.fanHype + 3500, // fans love seeing intense bootcamp photos
        roster: updatedRoster,
        remoteBootcamp: {
          isActive: true,
          locationId: location.id,
          locationName: location.name,
          locationEmoji: location.emoji,
          destination: location.destination,
          startedAt: timestamp,
          daysRemaining: 7,
          cost: REMOTE_BOOTCAMP_COST,
          boostTitle: location.tagline,
          mechanicsBonus: location.mechanicsBonus,
          macroBonus: location.macroBonus,
          moraleBonus: location.moraleBonus,
          tournamentWinRateBonus: location.tournamentWinRateBonus,
          participatingPlayerNames: participatingNames,
          history: [newHistoryEntry, ...(prev.remoteBootcamp?.history || [])]
        }
      };
    });

    setActionNotice(`🎉【启程成功】首发五虎已进驻 [${location.name}]！全队已激活 7 天封闭特训巅峰增益，大赛胜率暴增！`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  return (
    <div className="space-y-3.5 animate-fade-in font-sans">
      {/* 1. Header Banner & Budget Overview */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-indigo-950/70 border-2 border-amber-500/50 shadow-xl space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 p-0.5 shadow-md shrink-0">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-amber-300">
                <Tent className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-tech font-extrabold text-white text-sm sm:text-base tracking-wide">
                  首发五虎 · 异地封闭集训营 (Remote Bootcamp)
                </h3>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-code font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  7 DAYS INTENSE
                </span>
              </div>
              <p className="text-[10px] text-slate-300 mt-0.5">
                划拨 $50,000 战队预算将首发阵容派往异地隐世基地，为下一场世界重大锦标赛铸造巅峰战力！
              </p>
            </div>
          </div>
        </div>

        {/* Club Budget & Cost Counter */}
        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block font-tech">金库当前可用预算</span>
              <span className="font-black font-code text-emerald-300 text-sm">
                ${dynasty.budget.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between border-l border-slate-800 pl-2">
            <div>
              <span className="text-[10px] text-slate-400 block font-tech">集训期标准开销</span>
              <span className="font-bold font-code text-amber-300 text-sm">
                ${REMOTE_BOOTCAMP_COST.toLocaleString()} / 周期 (7天)
              </span>
            </div>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
              canAfford
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}>
              {canAfford ? '预算充沛 ✓' : '金库不足 ✗'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Notice feedback */}
      {actionNotice && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/80 to-indigo-950/80 border border-amber-400 text-xs font-tech text-amber-200 animate-slide-up flex items-center gap-2 shadow-lg">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* 2. Active Bootcamp Live Status Card (if currently underway) */}
      {activeBootcamp?.isActive && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/70 border-2 border-emerald-400/80 shadow-[0_0_30px_rgba(16,185,129,0.2)] space-y-2.5">
          <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{activeBootcamp.locationEmoji}</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-tech font-extrabold text-white text-xs sm:text-sm">
                    {activeBootcamp.locationName}
                  </h4>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500 text-slate-950 font-code animate-pulse">
                    正在异地特训中 (LIVE)
                  </span>
                </div>
                <span className="text-[10px] text-emerald-300 font-tech">
                  {activeBootcamp.destination} · 启动时间: {activeBootcamp.startedAt}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9px] text-slate-400 font-code block">特训期倒计时</span>
              <span className="text-sm font-black font-code text-emerald-300">
                {activeBootcamp.daysRemaining} 天剩余
              </span>
            </div>
          </div>

          {/* Tactical Tournament Buff Showcase */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[9px] text-slate-400 block font-tech">全员微操提升</span>
              <span className="font-code font-bold text-cyan-400 text-sm">+{activeBootcamp.mechanicsBonus} 微操</span>
            </div>
            <div className="p-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[9px] text-slate-400 block font-tech">全员大局运营</span>
              <span className="font-code font-bold text-purple-400 text-sm">+{activeBootcamp.macroBonus} 大局</span>
            </div>
            <div className="p-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[9px] text-slate-400 block font-tech">绝境士气强化</span>
              <span className="font-code font-bold text-amber-400 text-sm">+{activeBootcamp.moraleBonus} 士气</span>
            </div>
            <div className="p-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[9px] text-slate-400 block font-tech">下场大赛胜率</span>
              <span className="font-code font-bold text-emerald-300 text-sm">+{Math.round(activeBootcamp.tournamentWinRateBonus * 100)}% 胜率</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-300 font-tech">
              👥 受训首发名单: <b className="text-white">{activeBootcamp.participatingPlayerNames.join('、')}</b>
            </span>

            {onGoToWorlds && (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onGoToWorlds();
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-tech font-extrabold text-[10px] cursor-pointer shadow-md transition flex items-center gap-1 shrink-0"
              >
                <Trophy className="w-3 h-3" />
                <span>直奔世界赛战场测试成果 →</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Starting Roster Deployment Roster Preview */}
      <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-cyan-400" />
            <h4 className="font-tech font-bold text-white text-xs">
              首发五虎受训名单 (Starting Roster Candidates)
            </h4>
          </div>
          <span className="text-[10px] text-cyan-300 font-code">
            5 位首发全员入营
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {startingRoster.map(player => (
            <div 
              key={player.id}
              className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-center flex flex-col items-center justify-between gap-1"
            >
              <span className="text-2xl">{player.avatar}</span>
              <div className="w-full">
                <span className="font-tech font-bold text-white text-[11px] block truncate">{player.name}</span>
                <span className="px-1 py-0.2 rounded text-[8px] font-code font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 inline-block">
                  {player.role}
                </span>
              </div>
              <div className="w-full pt-1 border-t border-slate-800/80 text-[8px] font-code text-slate-400">
                <div className="text-cyan-400">{player.mechanics} 微操</div>
                <div className="text-purple-400">{player.macro} 大局</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Remote Location Selection Cards (四大异地集训秘境) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-tech font-bold text-slate-300 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            挑选封闭特训营目的地 (Select Bootcamp Destination)
          </span>
          <span className="text-[10px] text-amber-400 font-code">
            4 处世界级集训圣地
          </span>
        </div>

        <div className="space-y-2.5">
          {BOOTCAMP_LOCATIONS.map(location => {
            const isSelected = selectedLocationId === location.id;

            return (
              <div
                key={location.id}
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedLocationId(location.id);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden space-y-2.5 ${
                  isSelected
                    ? `bg-gradient-to-r ${location.bannerBg} ${location.borderColor} shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-400`
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 opacity-90'
                }`}
              >
                {/* Location Top Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl">{location.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-tech font-extrabold text-white text-xs sm:text-sm">
                          {location.name}
                        </h4>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-950 text-slate-300 border border-slate-700 font-tech">
                          {location.country}
                        </span>
                      </div>
                      <span className={`text-[10px] font-tech ${location.accentColor} font-bold block mt-0.5`}>
                        {location.destination} · {location.altitudeAndClimate}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[9px] text-slate-400 block font-tech">全员入营费</span>
                    <span className="text-xs font-bold font-code text-amber-300">
                      ${REMOTE_BOOTCAMP_COST.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Tagline & Description */}
                <p className="text-[10px] text-slate-300 font-sans leading-relaxed bg-slate-950/50 p-2 rounded-xl border border-slate-800/80">
                  {location.description}
                </p>

                {/* Tactical Buff Notification */}
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="font-tech font-bold text-amber-300">大赛专属加成: </span>
                    <span className="text-slate-200">{location.tacticalBuffDescription}</span>
                  </div>
                  <span className="text-xs font-black font-code text-emerald-400 shrink-0">
                    +{Math.round(location.tournamentWinRateBonus * 100)}% 胜率
                  </span>
                </div>

                {/* 7-Day Day-by-Day Training Regime Schedule */}
                <div className="space-y-1 pt-1 border-t border-slate-800/60">
                  <span className="text-[9px] font-tech text-slate-400 block">7天日度封闭特训日程表:</span>
                  <div className="grid grid-cols-2 gap-1.5 text-[9px]">
                    {location.schedule.map((item, i) => (
                      <div key={i} className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
                        <span className="text-amber-400 font-code font-bold block">{item.dayLabel} · {item.phase}</span>
                        <span className="text-slate-400 text-[8px] line-clamp-1">{item.itinerary}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deploy Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeployBootcamp(location);
                  }}
                  disabled={!canAfford}
                  className={`w-full py-2.5 rounded-xl text-xs font-tech font-extrabold uppercase tracking-wide transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md ${
                    !canAfford
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : isSelected
                      ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 hover:brightness-110 shadow-amber-500/25 active:scale-98'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <Tent className="w-3.5 h-3.5" />
                  <span>
                    {!canAfford 
                      ? '金库预算不足 $50,000' 
                      : `支付 $50,000 启程前往【${location.name}】进行 7 天特训`}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Bootcamp Travel & Tournament Archive */}
      {dynasty.remoteBootcamp?.history && dynasty.remoteBootcamp.history.length > 0 && (
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="text-xs font-tech font-bold text-white flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              历届异地集训出征志 (Bootcamp Travel Logs)
            </span>
            <span className="text-[10px] font-code text-slate-500">
              共 {dynasty.remoteBootcamp.history.length} 次特训记录
            </span>
          </div>

          <div className="space-y-1.5">
            {dynasty.remoteBootcamp.history.map(item => (
              <div key={item.id} className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-[10px]">
                <div>
                  <span className="font-tech text-amber-300 font-bold block">{item.locationName}</span>
                  <span className="text-slate-400 text-[9px]">{item.destination} • {item.completedAt}</span>
                </div>
                <span className="text-emerald-400 font-tech text-[9px]">
                  {item.boostSummary.split('·')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
