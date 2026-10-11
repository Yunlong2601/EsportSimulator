import React, { useState } from 'react';
import {
  Globe,
  Swords,
  Trophy,
  Crown,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  X,
  Flame,
  CheckCircle2,
  Award,
  Zap,
  ChevronRight,
  ShoppingBag,
  Shirt,
  Shield,
  Palette,
  Coins
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../../utils/audio';
import { WorldTourState, PrestigeState, DynastyState, PlayerStats } from '../../types/game';
import { generateFloorOpponent, simulateWorldTourMatch, getMerchItemById } from '../../data/worldTourData';
import { WorldTourMerchShopModal } from './WorldTourMerchShopModal';

interface WorldTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  worldTourState: WorldTourState;
  prestigeState: PrestigeState;
  dynastyState: DynastyState;
  playerStats: PlayerStats;
  onBattle: () => { isWin: boolean; floor: number; score: string; battleLogs: string[]; prestigeReward: number };
  onOpenPrestigeHall?: () => void;
  onBuyMerchItem?: (itemId: string) => { success: boolean; message: string };
  onEquipMerchItem?: (itemId: string) => { success: boolean; message: string };
}

export const WorldTourModal: React.FC<WorldTourModalProps> = ({
  isOpen,
  onClose,
  worldTourState,
  prestigeState,
  dynastyState,
  playerStats,
  onBattle,
  onOpenPrestigeHall,
  onBuyMerchItem,
  onEquipMerchItem
}) => {
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [battleLogs, setBattleLogs] = useState<string[]>([]);
  const [lastResult, setLastResult] = useState<{ isWin: boolean; score: string; reward: number } | null>(null);
  const [isMerchShopOpen, setIsMerchShopOpen] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentOpponent = generateFloorOpponent(worldTourState.currentFloor);

  // Equipped Cosmetics Details
  const equippedStadium = getMerchItemById(worldTourState.equippedStadiumTheme || 'stadium_neon_cyber') || {
    id: 'stadium_neon_cyber',
    name: '霓虹赛博夜域',
    nameEn: 'Neon Cyber Arena',
    themeColor: '#06b6d4',
    icon: '🏟️',
    visualPreview: { stadiumBanner: '🌌 赛博激光投影矩阵 · 全息中央四面屏' },
    perkEffect: '⚡ 主场全员战意激昂：首发士气 +5，声望收益 +5%'
  };

  const equippedJersey = getMerchItemById(worldTourState.equippedJerseyPattern || 'jersey_gold_dragon') || {
    id: 'jersey_gold_dragon',
    name: '鎏金腾龙战袍',
    nameEn: 'Auric Dragon Embroidered',
    icon: '🥋',
    themeColor: '#eab308',
    visualPreview: { jerseyPatternStyle: '暗黑底色 · 鎏金盘龙金丝刺绣 · 祥云立领' },
    perkEffect: '👕 粉丝周边狂热：应援周边销量 +20%'
  };

  // Player team power calculation
  const rosterPowerAvg = dynastyState.roster.reduce((acc, p) => acc + (p.mechanics + p.macro) / 2, 0) / (dynastyState.roster.length || 1);
  const teamPower = Math.round(rosterPowerAvg > 0 ? rosterPowerAvg : (playerStats.mechanics + playerStats.mental) / 2);

  const handleFight = () => {
    setIsSimulating(true);
    setBattleLogs([
      `⚡ 世界巡回赛战鼓擂动：向 [${currentOpponent.region}] ${currentOpponent.teamName} 发起跨国跨区征服战！`,
      `双方进入召唤师峡谷，首发王牌 ${currentOpponent.captain} 率队出击...`
    ]);
    setLastResult(null);

    setTimeout(() => {
      const res = onBattle();
      setBattleLogs(res.battleLogs);
      setLastResult({ isWin: res.isWin, score: res.score, reward: res.prestigeReward });
      setIsSimulating(false);

      if (res.isWin) {
        confetti({
          particleCount: 45,
          spread: 65,
          origin: { y: 0.6 },
          colors: [equippedStadium.themeColor || '#38bdf8', '#f59e0b', '#10b981']
        });
      }
    }, 1200);
  };

  // Milestone boss floors
  const milestoneFloors = [5, 10, 20, 35, 50, 70, 85, 100];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
        <div className="relative max-w-2xl w-full max-h-[92vh] flex flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-cyan-500/60 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] text-left overflow-hidden chamfer-card">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-blue-950/30 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
                <Globe className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-extrabold font-tech text-white tracking-wide">
                    无尽世界巡回赛 · 百层挑战天梯
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-code bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    第 {worldTourState.currentFloor} / 100 层
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-sans">
                  赛季世界排名: <span className="text-amber-400 font-bold font-code">#{worldTourState.seasonRank}</span> | 历史通关最高: <span className="text-emerald-400 font-bold font-code">第 {worldTourState.highestFloorCleared} 层</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Merch Shop Access Button */}
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setIsMerchShopOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/10 border border-amber-500/50 hover:border-amber-400 text-amber-300 hover:text-white transition flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-950/30 group active:scale-98"
                title="打开世界巡回赛专属周边概念商城"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform animate-pulse" />
                <div className="text-left font-tech">
                  <span className="text-[10px] text-amber-300/80 block leading-none font-bold">巡回周边商城</span>
                  <span className="text-xs font-extrabold font-code text-amber-300 leading-tight">
                    {(worldTourState.prestigeTokens ?? 0).toLocaleString()} <span className="text-[9px] text-amber-400/70 font-normal">代币</span>
                  </span>
                </div>
              </button>

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
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">

            {/* Current Floor Target Card with Dynamic Stadium Theme Styling */}
            <div
              className="rounded-2xl p-4 sm:p-5 border shadow-lg relative overflow-hidden transition-colors"
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.92)',
                borderColor: `${equippedStadium.themeColor || '#06b6d4'}55`
              }}
            >
              {/* Dynamic Theme Background Accent glow */}
              <div
                className="absolute top-0 right-0 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-25"
                style={{ backgroundColor: equippedStadium.themeColor || '#06b6d4' }}
              />

              {/* Active Stadium Theme & Fan Jersey Badge Strip */}
              <div className="mb-3.5 p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2 text-xs font-tech">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-base">{equippedStadium.icon}</span>
                  <span className="text-slate-400">主场主题:</span>
                  <span className="font-bold text-white truncate" style={{ color: equippedStadium.themeColor }}>
                    {equippedStadium.name}
                  </span>
                  <span className="text-slate-600 hidden sm:inline">|</span>
                  <span className="text-base hidden sm:inline">{equippedJersey.icon}</span>
                  <span className="text-slate-400 hidden sm:inline">战队战袍:</span>
                  <span className="font-bold text-amber-300 truncate hidden sm:inline">
                    {equippedJersey.name}
                  </span>
                </div>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setIsMerchShopOpen(true);
                  }}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5 cursor-pointer shrink-0"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>定制主场与战袍 →</span>
                </button>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-tech px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                    {currentOpponent.region} 赛区劲旅
                  </span>
                  {currentOpponent.isBoss && (
                    <span className="text-[10px] font-bold font-tech px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                      🏆 殿堂BOSS战
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs font-code">
                  <span className="text-slate-400">
                    声望: <strong className="text-amber-400">+{currentOpponent.rewardPrestige}</strong>
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-400">
                    巡回代币: <strong className="text-amber-300">+{currentOpponent.isBoss ? 10 : 3} 🌟</strong>
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold font-tech text-white mb-1">
                    {currentOpponent.teamName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="text-lg">{currentOpponent.captainAvatar}</span>
                    <span className="font-bold text-cyan-300">{currentOpponent.captain}</span>
                    <span className="text-slate-500 font-mono">({currentOpponent.bossTitle})</span>
                  </div>
                </div>

                {/* Combat Power Comparison */}
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs shrink-0 min-w-[200px]">
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>我方战力</span>
                    <span className="text-emerald-400 font-bold font-code">{teamPower} 点</span>
                  </div>
                  <div className="flex justify-between text-slate-400 mb-2">
                    <span>对手战力</span>
                    <span className="text-rose-400 font-bold font-code">{currentOpponent.combatPower} 点</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full transition-all"
                      style={{ width: `${Math.min(100, (teamPower / (teamPower + currentOpponent.combatPower)) * 100)}%` }}
                    />
                    <div
                      className="bg-rose-500 h-full transition-all"
                      style={{ width: `${Math.min(100, (currentOpponent.combatPower / (teamPower + currentOpponent.combatPower)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Special Gimmick & Active Theme Perk */}
              <div className="mt-3.5 pt-3 border-t border-slate-800/80 space-y-2">
                <div className="flex items-start gap-2 text-xs text-amber-200/90 bg-amber-950/20 p-2.5 rounded-lg border border-amber-500/20">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300">特殊战场机制: </span>
                    {currentOpponent.specialGimmick}
                  </div>
                </div>

                {/* Active Stadium Perk indicator */}
                <div className="flex items-center gap-2 text-xs text-cyan-200/90 bg-cyan-950/20 p-2 rounded-lg border border-cyan-500/20">
                  <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <div className="truncate">
                    <span className="font-bold text-cyan-300">主场光环特权: </span>
                    {equippedStadium.perkEffect}
                  </div>
                </div>
              </div>

              {/* Battle Action */}
              <div className="mt-4">
                <button
                  onClick={handleFight}
                  disabled={isSimulating}
                  className="w-full py-3.5 px-5 rounded-xl font-bold font-tech text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 cursor-pointer active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Swords className="w-5 h-5" />
                  <span>
                    {isSimulating ? '正在全球信号转播激烈激战...' : `向第 ${worldTourState.currentFloor} 层发起跨赛区决战 (${currentOpponent.isBoss ? 'BO5' : 'BO3'})`}
                  </span>
                </button>
              </div>
            </div>

            {/* Battle Logs Section */}
            {battleLogs.length > 0 && (
              <div className="bg-slate-950/90 rounded-xl p-4 border border-cyan-500/30 text-xs font-mono space-y-1.5 animate-fade-in">
                <div className="flex items-center justify-between font-tech font-bold text-cyan-400 mb-2 border-b border-slate-800 pb-1.5">
                  <span>实机战况速报</span>
                  {lastResult && (
                    <span className={`px-2 py-0.5 rounded text-[11px] ${lastResult.isWin ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'}`}>
                      {lastResult.isWin ? `🎉 大捷胜利 (${lastResult.score}) +${lastResult.reward} 声望` : `💔 告负惜败 (${lastResult.score})`}
                    </span>
                  )}
                </div>
                {battleLogs.map((log, idx) => (
                  <div key={idx} className="text-slate-300 leading-relaxed">
                    {log}
                  </div>
                ))}
              </div>
            )}

            {/* Milestone Boss Floors Ladder */}
            <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-tech font-bold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-400" />
                  百层世界巡回赛 · 殿堂BOSS里程碑
                </span>
                <span className="text-[10px] text-slate-500 font-mono">击破获得海量名宿代币与绝版勋章</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {milestoneFloors.map(floor => {
                  const isCleared = worldTourState.highestFloorCleared >= floor;
                  const isCurrent = worldTourState.currentFloor === floor;

                  return (
                    <div
                      key={floor}
                      className={`p-2.5 rounded-lg border text-center transition ${
                        isCleared
                          ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                          : isCurrent
                          ? 'bg-cyan-950/50 border-cyan-500/70 text-cyan-200 animate-pulse'
                          : 'bg-slate-950/60 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="text-[10px] font-mono">第 {floor} 层</div>
                      <div className="text-xs font-bold font-tech mt-0.5 truncate">
                        {floor === 5 ? 'FNC 近卫军' :
                         floor === 10 ? 'TL 银河战舰' :
                         floor === 20 ? 'G2 杂技狂欢' :
                         floor === 35 ? 'WBG 剑仙Shy' :
                         floor === 50 ? 'Gen.G 王朝' :
                         floor === 70 ? '2018 IG 极境' :
                         floor === 85 ? 'T1 魔王五星' : '神殿创世队'}
                      </div>
                      <div className="text-[9px] mt-1">
                        {isCleared ? '✓ 已通关' : isCurrent ? '⚔️ 正在挑战' : '🔒 未解锁'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-tech">
              {/* Quick link to Merch Shop */}
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between">
                <span className="text-amber-200">
                  拥有 <b className="text-amber-400 font-code font-bold">{(worldTourState.prestigeTokens ?? 0)}</b> 枚代币，可兑换定制场馆与战袍！
                </span>
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setIsMerchShopOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-bold shrink-0 ml-2 cursor-pointer"
                >
                  进入周边商城 →
                </button>
              </div>

              {/* Quick link to Prestige Hall */}
              {onOpenPrestigeHall && (
                <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between">
                  <span className="text-cyan-200">
                    在名宿殿堂点亮【永久肉鸽传承天赋】以拔高队伍战力！
                  </span>
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onOpenPrestigeHall();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 font-bold shrink-0 ml-2 cursor-pointer"
                  >
                    前往声望殿堂 →
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* World Tour Merch Shop Modal */}
      <WorldTourMerchShopModal
        isOpen={isMerchShopOpen}
        onClose={() => setIsMerchShopOpen(false)}
        worldTourState={worldTourState}
        onBuyItem={onBuyMerchItem || (() => ({ success: false, message: '商城功能未就绪' }))}
        onEquipItem={onEquipMerchItem || (() => ({ success: false, message: '装配功能未就绪' }))}
      />
    </>
  );
};
