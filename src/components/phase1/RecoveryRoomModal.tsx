import React, { useState } from 'react';
import { 
  Moon, 
  VolumeX, 
  BedDouble, 
  Wind, 
  Sparkles, 
  Zap, 
  Brain, 
  CheckCircle2, 
  X, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { PlayerStats, RecoveryRoomEnvironment } from '../../types/game';
import { 
  RECOVERY_ROOM_CATEGORIES, 
  BASE_REST_STATS, 
  getRecoveryRoomBonuses, 
  getTotalRestStats,
  RoomUpgradeCategory
} from '../../data/recoveryRoomData';
import { soundEngine } from '../../utils/audio';

interface RecoveryRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  onRest: () => void;
  onUpgrade: (category: 'soundproofing' | 'bedding' | 'atmosphere') => { success: boolean; message: string };
}

export const RecoveryRoomModal: React.FC<RecoveryRoomModalProps> = ({
  isOpen,
  onClose,
  stats,
  onRest,
  onUpgrade
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'soundproofing' | 'bedding' | 'atmosphere'>('all');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const currentRoom: RecoveryRoomEnvironment = stats.recoveryRoom || {
    soundproofing: 0,
    bedding: 0,
    atmosphere: 0
  };

  const bonuses = getRecoveryRoomBonuses(currentRoom);
  const totalRest = getTotalRestStats(currentRoom);

  const handleUpgradeClick = (catId: 'soundproofing' | 'bedding' | 'atmosphere') => {
    const res = onUpgrade(catId);
    if (res.success) {
      setFeedbackMsg({ text: res.message, type: 'success' });
    } else {
      setFeedbackMsg({ text: res.message, type: 'error' });
    }
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 3500);
  };

  const handleRestClick = () => {
    onRest();
    setFeedbackMsg({
      text: `💤 深度入睡成功！已恢复 +${totalRest.energy} 精力 / +${totalRest.focus}% 专注度 / +${totalRest.mental} 心态！`,
      type: 'success'
    });
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4000);
  };

  const filteredCategories = activeTab === 'all' 
    ? RECOVERY_ROOM_CATEGORIES 
    : RECOVERY_ROOM_CATEGORIES.filter(c => c.id === activeTab);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'VolumeX':
        return <VolumeX className="w-5 h-5 text-indigo-400" />;
      case 'BedDouble':
        return <BedDouble className="w-5 h-5 text-pink-400" />;
      case 'Wind':
        return <Wind className="w-5 h-5 text-emerald-400" />;
      default:
        return <Moon className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col bg-slate-950 border-2 border-indigo-500/50 rounded-2xl shadow-[0_0_40px_rgba(99,102,241,0.25)] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border-b border-indigo-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-900/60 border border-indigo-400/50 flex items-center justify-center shadow-inner">
              <Moon className="w-6 h-6 text-indigo-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-tech font-bold text-white text-base sm:text-lg tracking-wide">
                  康复休整空间 · RECOVERY ROOM
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-500/40 font-code font-bold">
                  睡眠环境升级
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                投资改造声学隔音与高奢寝具，使【深度休整 (Rest)】的疲劳清除率成倍提升
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-emerald-400 font-code text-xs font-bold shadow-sm">
              <DollarSign className="w-3.5 h-3.5" />
              <span>${stats.money}</span>
            </div>
            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="关闭"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {feedbackMsg && (
          <div className={`px-4 py-2 text-xs flex items-center gap-2 font-sans border-b shrink-0 animate-fadeIn ${
            feedbackMsg.type === 'success' 
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200' 
              : 'bg-rose-950/80 border-rose-500/40 text-rose-200'
          }`}>
            <Sparkles className="w-4 h-4 shrink-0 text-amber-300" />
            <span className="flex-1 font-medium">{feedbackMsg.text}</span>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Recovery Overview & Rest Action Card */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span className="font-tech font-bold text-white text-xs sm:text-sm">
                  当前休整单次恢复效果 (Rest Stats)
                </span>
                {bonuses.totalBonusRate > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-code font-bold">
                    + {bonuses.totalBonusRate}% 综合增速
                  </span>
                )}
              </div>

              <div className="sm:hidden flex items-center gap-1.5 text-xs font-code font-bold text-emerald-400">
                <span>可用资金: ${stats.money}</span>
              </div>
            </div>

            {/* Stats Metrics Grid */}
            <div className="grid grid-cols-3 gap-2">
              {/* Focus / Fatigue */}
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-indigo-500/20 text-center space-y-0.5">
                <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <Brain className="w-3 h-3 text-cyan-400" />
                  <span>专注恢复</span>
                </span>
                <div className="font-code font-bold text-cyan-300 text-sm sm:text-base">
                  +{totalRest.focus}%
                </div>
                <div className="text-[9px] text-slate-500">
                  基准50% {bonuses.focusBonus > 0 && <span className="text-emerald-400 font-bold">+{bonuses.focusBonus}%加成</span>}
                </div>
              </div>

              {/* Energy */}
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-amber-500/20 text-center space-y-0.5">
                <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>精力恢复</span>
                </span>
                <div className="font-code font-bold text-amber-300 text-sm sm:text-base">
                  +{totalRest.energy}
                </div>
                <div className="text-[9px] text-slate-500">
                  基准45 {bonuses.energyBonus > 0 && <span className="text-emerald-400 font-bold">+{bonuses.energyBonus}加成</span>}
                </div>
              </div>

              {/* Mental */}
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-purple-500/20 text-center space-y-0.5">
                <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-purple-400" />
                  <span>心态回稳</span>
                </span>
                <div className="font-code font-bold text-purple-300 text-sm sm:text-base">
                  +{totalRest.mental}
                </div>
                <div className="text-[9px] text-slate-500">
                  基准18 {bonuses.mentalBonus > 0 && <span className="text-emerald-400 font-bold">+{bonuses.mentalBonus}加成</span>}
                </div>
              </div>
            </div>

            {/* Instant Rest Button Inside Recovery Room */}
            <button
              onClick={handleRestClick}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 hover:from-indigo-500 hover:to-blue-500 active:scale-98 text-white font-tech font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <Moon className="w-4 h-4 fill-current text-indigo-200" />
              <span>立即享受升级后的深度休整睡眠 (Rest Now)</span>
            </button>
          </div>

          {/* Navigation Filter Tabs */}
          <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-tech">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition shrink-0 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              全部设施 (3)
            </button>
            <button
              onClick={() => setActiveTab('soundproofing')}
              className={`px-3 py-1.5 rounded-lg font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'soundproofing'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>声学隔音</span>
            </button>
            <button
              onClick={() => setActiveTab('bedding')}
              className={`px-3 py-1.5 rounded-lg font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'bedding'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <BedDouble className="w-3.5 h-3.5" />
              <span>高奢寝具</span>
            </button>
            <button
              onClick={() => setActiveTab('atmosphere')}
              className={`px-3 py-1.5 rounded-lg font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'atmosphere'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              <span>微环境与理疗</span>
            </button>
          </div>

          {/* Category Upgrade Cards */}
          <div className="space-y-3.5">
            {filteredCategories.map((cat: RoomUpgradeCategory) => {
              const currentLvl = currentRoom[cat.id] || 0;
              const currentItem = cat.levels[currentLvl] || cat.levels[0];
              const nextItem = cat.levels[currentLvl + 1];
              const isMaxLevel = currentLvl >= cat.levels.length - 1;
              const canAfford = nextItem ? stats.money >= nextItem.cost : false;

              return (
                <div 
                  key={cat.id}
                  className="p-3.5 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 transition shadow-sm space-y-3"
                >
                  {/* Category Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                        {getCategoryIcon(cat.icon)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-tech font-bold text-white text-sm">
                            {cat.title}
                          </h4>
                          <span className="text-[10px] px-2 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30 font-code font-bold">
                            Lv.{currentLvl} / {cat.levels.length - 1} {currentItem.perkBadge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                          {cat.tagline}
                        </p>
                      </div>
                    </div>

                    {/* Level Progress Indicator */}
                    <div className="flex items-center gap-1 shrink-0">
                      {cat.levels.map((lvl) => (
                        <div
                          key={lvl.level}
                          className={`w-2 h-2 rounded-full transition ${
                            lvl.level <= currentLvl 
                              ? 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]' 
                              : 'bg-slate-800'
                          }`}
                          title={`等级 ${lvl.level}: ${lvl.name}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Current Active Setup */}
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="text-[10px] text-slate-500">当前安装设备：</div>
                      <div className="text-white font-medium text-[11px] sm:text-xs">
                        {currentItem.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {currentItem.description}
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-code text-[11px] space-y-0.5 ml-2">
                      <div className="text-cyan-400">+{currentItem.focusBonus}% 专注</div>
                      <div className="text-amber-400">+{currentItem.energyBonus} 精力</div>
                      <div className="text-purple-400">+{currentItem.mentalBonus} 心态</div>
                    </div>
                  </div>

                  {/* Next Upgrade Tier Section */}
                  {!isMaxLevel && nextItem ? (
                    <div className="p-3 rounded-lg bg-gradient-to-r from-indigo-950/40 via-slate-950 to-indigo-950/20 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-500/30 font-code font-bold">
                            下一级目标 Lv.{nextItem.level}
                          </span>
                          <span className="font-tech font-bold text-white text-xs">
                            {nextItem.name}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300 font-sans leading-relaxed">
                          {nextItem.description}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] font-code pt-0.5">
                          <span className="text-cyan-300 font-bold">
                            专注度恢复提升至 +{nextItem.focusBonus}%
                          </span>
                          <span className="text-amber-300 font-bold">
                            精力恢复提升至 +{nextItem.energyBonus}
                          </span>
                          <span className="text-purple-300 font-bold">
                            心态提升至 +{nextItem.mentalBonus}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleUpgradeClick(cat.id)}
                        disabled={!canAfford}
                        className={`w-full sm:w-auto px-4 py-2 rounded-xl font-tech font-bold text-xs transition cursor-pointer shrink-0 flex items-center justify-center gap-1.5 shadow ${
                          canAfford
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-500/20 active:scale-98'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        }`}
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>
                          {canAfford ? `升级安装 ($${nextItem.cost})` : `需 $${nextItem.cost} (缺 $${nextItem.cost - stats.money})`}
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="font-tech font-bold">
                          该设施已完成全部顶配改装（达成殿堂级睡眠标准）
                        </span>
                      </div>
                      <span className="text-[10px] font-code font-bold px-2 py-0.5 rounded bg-emerald-900/60 border border-emerald-400/40">
                        MAX LEVEL
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Educational Note & Lore */}
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-indigo-400 font-tech font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>职业电竞体能科学提示</span>
            </div>
            <p className="leading-relaxed text-slate-400">
              长期高强度天梯排位、复盘与高能直播会产生不可逆的神经疲劳堆积。优质的降噪隔音、释压床垫与高压微氧环境，能缩短睡眠周期中的浅睡阶段，使你在最短时间内彻底重燃竞技手感与巅峰反应！
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0 text-xs">
          <div className="text-[11px] text-slate-500 font-sans">
            提示：随时在主界面点击【深度休整】或严重疲劳时进入本康复室
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-tech font-bold transition cursor-pointer"
          >
            返回训练室
          </button>
        </div>

      </div>
    </div>
  );
};
