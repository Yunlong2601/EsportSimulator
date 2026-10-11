import React, { useState } from 'react';
import {
  ShoppingBag,
  Sparkles,
  Shield,
  Shirt,
  Flag,
  Check,
  CheckCircle2,
  X,
  AlertCircle,
  Coins,
  Palette,
  Eye,
  Crown,
  Zap,
  Flame,
  Award,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WorldTourState, MerchCosmeticCategory, WorldTourMerchItem } from '../../types/game';
import { WORLD_TOUR_MERCH_CATALOG, getMerchItemById } from '../../data/worldTourData';
import { soundEngine } from '../../utils/audio';

export interface WorldTourMerchShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  worldTourState: WorldTourState;
  onBuyItem: (itemId: string) => { success: boolean; message: string };
  onEquipItem: (itemId: string) => { success: boolean; message: string };
}

export const WorldTourMerchShopModal: React.FC<WorldTourMerchShopModalProps> = ({
  isOpen,
  onClose,
  worldTourState,
  onBuyItem,
  onEquipItem
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MerchCosmeticCategory | 'ALL'>('ALL');
  const [previewItemId, setPreviewItemId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; ok: boolean } | null>(null);

  if (!isOpen) return null;

  const userTokens = worldTourState.prestigeTokens ?? 0;
  const unlockedIds = worldTourState.unlockedMerchCosmetics || [];
  const equippedStadiumId = worldTourState.equippedStadiumTheme || 'stadium_neon_cyber';
  const equippedJerseyId = worldTourState.equippedJerseyPattern || 'jersey_gold_dragon';
  const equippedBannerId = worldTourState.equippedBanner || 'banner_cyber_valkyrie';

  const equippedStadium = getMerchItemById(equippedStadiumId) || WORLD_TOUR_MERCH_CATALOG[0];
  const equippedJersey = getMerchItemById(equippedJerseyId) || WORLD_TOUR_MERCH_CATALOG[4];
  const equippedBanner = getMerchItemById(equippedBannerId) || WORLD_TOUR_MERCH_CATALOG[8];

  const filteredItems = WORLD_TOUR_MERCH_CATALOG.filter(item => {
    if (selectedCategory === 'ALL') return true;
    return item.category === selectedCategory;
  });

  const previewItem = previewItemId ? getMerchItemById(previewItemId) : null;

  const showToast = (text: string, ok: boolean) => {
    setToastMessage({ text, ok });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleBuy = (item: WorldTourMerchItem) => {
    soundEngine.playClick();
    if (userTokens < item.costTokens) {
      showToast(`名宿代币不足！兑换需要 ${item.costTokens} 枚，当前拥有 ${userTokens} 枚`, false);
      return;
    }

    const res = onBuyItem(item.id);
    showToast(res.message, res.success);

    if (res.success) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: [item.themeColor, '#38bdf8', '#f59e0b', '#10b981']
      });
    }
  };

  const handleEquip = (item: WorldTourMerchItem) => {
    soundEngine.playClick();
    const res = onEquipItem(item.id);
    showToast(res.message, res.success);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative max-w-4xl w-full max-h-[92vh] flex flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.25)] text-left overflow-hidden chamfer-card">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-amber-500/20 bg-gradient-to-r from-amber-950/40 via-slate-900 to-cyan-950/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <ShoppingBag className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold font-tech text-white tracking-wide">
                  世界巡回赛专属周边概念商城
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-code bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  WORLD TOUR MERCH
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                消耗巡回赛战役结算获得的稀有【名宿代币】，兑换并装配主场场馆主题与粉丝应援战袍！
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Prestige Tokens Wallet Display */}
            <div className="px-3.5 py-1.5 rounded-xl bg-amber-950/60 border border-amber-500/50 flex items-center gap-2 shadow-inner">
              <Coins className="w-4 h-4 text-amber-400 animate-bounce" />
              <div className="text-right">
                <span className="text-[10px] font-tech text-amber-300/80 block leading-none">名宿巡回代币</span>
                <span className="text-base font-extrabold font-code text-amber-300 leading-tight">
                  {userTokens.toLocaleString()} <span className="text-xs text-amber-400/70 font-normal">枚</span>
                </span>
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
        </div>

        {/* Feedback Alert Toast */}
        {toastMessage && (
          <div
            className={`mx-4 mt-3 p-2.5 rounded-xl text-xs font-tech font-bold flex items-center gap-2 border ${
              toastMessage.ok
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-lg shadow-emerald-950/40'
                : 'bg-rose-950/80 border-rose-500/50 text-rose-300 shadow-lg shadow-rose-950/40'
            } animate-fade-in`}
          >
            {toastMessage.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span className="truncate">{toastMessage.text}</span>
          </div>
        )}

        {/* Live Stage Showcase Bar (Currently Equipped Cosmetics) */}
        <div className="mx-4 mt-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
          {/* Active Stadium */}
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-cyan-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                {equippedStadium.icon}
              </span>
              <div>
                <span className="text-[10px] font-tech text-cyan-400 block font-bold">主场场馆主题 (STADIUM)</span>
                <span className="text-xs font-extrabold font-tech text-white">{equippedStadium.name}</span>
                <span className="text-[9px] text-slate-400 block truncate max-w-[150px]">{equippedStadium.visualPreview.stadiumBanner}</span>
              </div>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 font-code shrink-0">
              生效中
            </span>
          </div>

          {/* Active Jersey */}
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                {equippedJersey.icon}
              </span>
              <div>
                <span className="text-[10px] font-tech text-amber-400 block font-bold">战队应援战袍 (JERSEY)</span>
                <span className="text-xs font-extrabold font-tech text-white">{equippedJersey.name}</span>
                <span className="text-[9px] text-slate-400 block truncate max-w-[150px]">{equippedJersey.visualPreview.jerseyPatternStyle}</span>
              </div>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 font-code shrink-0">
              生效中
            </span>
          </div>

          {/* Active Banner */}
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-purple-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                {equippedBanner.icon}
              </span>
              <div>
                <span className="text-[10px] font-tech text-purple-400 block font-bold">全息殿堂战旗 (BANNER)</span>
                <span className="text-xs font-extrabold font-tech text-white">{equippedBanner.name}</span>
                <span className="text-[9px] text-slate-400 block truncate max-w-[150px]">{equippedBanner.badge}</span>
              </div>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40 font-code shrink-0">
              生效中
            </span>
          </div>
        </div>

        {/* Category Filters Bar */}
        <div className="px-4 pt-3 flex gap-2 border-b border-slate-800 bg-slate-900/60 shrink-0 overflow-x-auto">
          <button
            onClick={() => {
              soundEngine.playClick();
              setSelectedCategory('ALL');
            }}
            className={`pb-2.5 px-3.5 text-xs font-tech font-bold flex items-center gap-1.5 border-b-2 transition cursor-pointer shrink-0 ${
              selectedCategory === 'ALL'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>全部定制周边 ({WORLD_TOUR_MERCH_CATALOG.length})</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setSelectedCategory('STADIUM');
            }}
            className={`pb-2.5 px-3.5 text-xs font-tech font-bold flex items-center gap-1.5 border-b-2 transition cursor-pointer shrink-0 ${
              selectedCategory === 'STADIUM'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>主场场馆主题 (STADIUM · 4)</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setSelectedCategory('JERSEY');
            }}
            className={`pb-2.5 px-3.5 text-xs font-tech font-bold flex items-center gap-1.5 border-b-2 transition cursor-pointer shrink-0 ${
              selectedCategory === 'JERSEY'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shirt className="w-3.5 h-3.5 text-amber-400" />
            <span>粉丝战队战袍 (JERSEY · 4)</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setSelectedCategory('BANNER');
            }}
            className={`pb-2.5 px-3.5 text-xs font-tech font-bold flex items-center gap-1.5 border-b-2 transition cursor-pointer shrink-0 ${
              selectedCategory === 'BANNER'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flag className="w-3.5 h-3.5 text-purple-400" />
            <span>全息殿堂战旗 (BANNER · 2)</span>
          </button>
        </div>

        {/* Shop Items Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredItems.map(item => {
              const isUnlocked = unlockedIds.includes(item.id);
              const isEquipped =
                (item.category === 'STADIUM' && worldTourState.equippedStadiumTheme === item.id) ||
                (item.category === 'JERSEY' && worldTourState.equippedJerseyPattern === item.id) ||
                (item.category === 'BANNER' && worldTourState.equippedBanner === item.id);
              const canAfford = userTokens >= item.costTokens;

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl p-4 border transition-all flex flex-col justify-between relative overflow-hidden ${
                    isEquipped
                      ? 'bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950 border-amber-500/80 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/50'
                      : isUnlocked
                      ? 'bg-slate-900/90 border-slate-700 hover:border-slate-600'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700/80'
                  }`}
                >
                  {/* Atmospheric ambient glow */}
                  <div
                    className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-20"
                    style={{ backgroundColor: item.themeColor }}
                  />

                  <div>
                    {/* Top row: Category, Badge & Price */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-[10px] font-bold font-code px-2 py-0.5 rounded-full border"
                          style={{
                            color: item.themeColor,
                            borderColor: `${item.themeColor}55`,
                            backgroundColor: `${item.themeColor}15`
                          }}
                        >
                          {item.category === 'STADIUM' ? '场馆主题' : item.category === 'JERSEY' ? '战队战袍' : '殿堂战旗'}
                        </span>
                        <span className="text-[10px] font-tech text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">
                          {item.badge}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-right">
                        {isUnlocked ? (
                          <span className="text-xs font-bold font-tech text-emerald-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> 已拥有
                          </span>
                        ) : (
                          <div className="flex items-center gap-1 font-tech">
                            <Coins className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-sm font-extrabold font-code text-amber-300">
                              {item.costTokens}
                            </span>
                            <span className="text-[10px] text-slate-400">代币</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Main title & icon */}
                    <div className="flex items-start gap-3">
                      <span className="text-3xl p-2 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                        {item.icon}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-extrabold font-tech text-white">
                            {item.name}
                          </h3>
                          <span className="text-[11px] font-code text-slate-500">
                            {item.nameEn}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Visualizer Spec Box */}
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-1.5 text-xs font-tech">
                      <div className="flex items-center gap-1.5 text-cyan-300">
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-bold">外观渲染特征:</span>
                        <span className="text-slate-300 font-sans truncate">
                          {item.visualPreview.stadiumBanner || item.visualPreview.jerseyPatternStyle}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-300 pt-1 border-t border-slate-800/70">
                        <Zap className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-bold">限定战力特权:</span>
                        <span className="text-slate-300 font-sans">{item.perkEffect}</span>
                      </div>
                    </div>

                    {/* Lore Flavor */}
                    <p className="text-[11px] text-slate-500 font-sans italic mt-2 line-clamp-2">
                      “{item.lore}”
                    </p>
                  </div>

                  {/* Actions Row */}
                  <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        setPreviewItemId(previewItemId === item.id ? null : item.id);
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-tech text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{previewItemId === item.id ? '收起详情' : '全景视角'}</span>
                    </button>

                    {isEquipped ? (
                      <div className="px-4 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-tech font-bold flex items-center gap-1.5 shadow">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>已装配使用中</span>
                      </div>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => handleEquip(item)}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-tech font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/20 active:scale-98"
                      >
                        <span>立即佩戴装配</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuy(item)}
                        disabled={!canAfford}
                        className={`px-4 py-1.5 rounded-lg text-xs font-tech font-bold transition flex items-center gap-1.5 cursor-pointer shadow ${
                          canAfford
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold active:scale-98 shadow-amber-500/25'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        }`}
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>
                          {canAfford ? `兑换解锁 (${item.costTokens} 代币)` : `代币不足 (需 ${item.costTokens})`}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Expanded Visual Preview Modal Card */}
                  {previewItemId === item.id && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-700 space-y-2 animate-fade-in text-xs font-tech">
                      <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1.5">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <Palette className="w-3.5 h-3.5" style={{ color: item.themeColor }} />
                          全景渲染视界预览
                        </span>
                        <span className="text-[10px] font-code" style={{ color: item.themeColor }}>
                          COLOR: {item.themeColor}
                        </span>
                      </div>
                      <div
                        className="p-3 rounded-lg border text-center space-y-1 transition-all"
                        style={{
                          backgroundColor: `${item.themeColor}10`,
                          borderColor: `${item.themeColor}40`
                        }}
                      >
                        <div className="text-3xl animate-bounce">{item.icon}</div>
                        <div className="font-bold text-sm text-white">{item.name}</div>
                        <div className="text-[11px] text-slate-300 font-sans">
                          {item.visualPreview.stadiumBanner || item.visualPreview.jerseyPatternStyle}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs font-tech text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>提示：通关世界巡回赛更深层数可获得海量名宿代币，百层通关可集齐全部限定周边！</span>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition cursor-pointer"
          >
            返回世界巡回天梯
          </button>
        </div>

      </div>
    </div>
  );
};

export default WorldTourMerchShopModal;
