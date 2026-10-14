import React, { useState } from 'react';
import { ConsumableItem } from '../types/game';
import { CONSUMABLES_CATALOG } from '../data/consumables';
import { 
  Store, 
  X, 
  Zap, 
  Coffee, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Package, 
  BatteryCharging,
  DollarSign,
  Moon
} from 'lucide-react';

interface QuickShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerMoney: number;
  currentFocus: number;
  currentEnergy: number;
  energyDrinksCount: number;
  onBuyConsumable?: (item: ConsumableItem, immediateUse: boolean) => { success: boolean; message: string };
  onRest?: () => void;
  onOpenRecoveryRoom?: () => void;
}

export const QuickShopModal: React.FC<QuickShopModalProps> = ({
  isOpen,
  onClose,
  playerMoney,
  currentFocus,
  currentEnergy,
  energyDrinksCount,
  onBuyConsumable,
  onRest,
  onOpenRecoveryRoom
}) => {
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [hoveredItem, setHoveredItem] = useState<ConsumableItem | null>(null);

  if (!isOpen) return null;

  const handlePurchase = (item: ConsumableItem, immediate: boolean) => {
    if (playerMoney < item.cost) {
      setFeedback({
        message: `资金不足！购买【${item.name}】需要 $${item.cost}，当前资金仅有 $${playerMoney}`,
        type: 'error'
      });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    if (onBuyConsumable) {
      const res = onBuyConsumable(item, immediate);
      setFeedback({
        message: res.message,
        type: res.success ? 'success' : 'error'
      });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  // Projected focus on hover
  const projectedFocus = hoveredItem 
    ? Math.min(100, currentFocus + hoveredItem.focusRestore) 
    : currentFocus;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0f131c] border-2 border-emerald-500/60 rounded-2xl max-w-lg w-full p-4 sm:p-5 shadow-[0_0_35px_rgba(16,185,129,0.3)] space-y-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-tech font-extrabold text-white text-base tracking-wide">
                  战备应急便利店 · Quick Shop
                </h3>
                <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-[9px] font-tech font-bold uppercase">
                  即买即用
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-tech mt-0.5">
                高强度排位与长时间直播冲榜应急专供 · 极速补满专注与疲劳条
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Real-time Status & Vault Banner */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 shrink-0">
          <div className="flex items-center justify-between text-xs font-tech">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-emerald-400 font-code font-bold">
                <DollarSign className="w-3.5 h-3.5" />
                <span>生涯资金: ${playerMoney.toLocaleString()}</span>
              </div>
              <div className="text-slate-400 text-[11px] flex items-center gap-1 font-tech">
                <Package className="w-3 h-3 text-cyan-400" />
                <span>战备背包库存: <b className="text-cyan-300 font-code">{energyDrinksCount}</b> 罐</span>
              </div>
            </div>
            <div className="text-[11px] text-right">
              <span className="text-slate-400 font-tech">当前专注度: </span>
              <span className={`font-code font-bold ${currentFocus < 30 ? 'text-rose-400 animate-pulse' : 'text-cyan-300'}`}>
                {currentFocus}%
              </span>
              {hoveredItem && projectedFocus > currentFocus && (
                <span className="text-emerald-400 font-code font-bold ml-1.5">
                  → {projectedFocus}% (+{hoveredItem.focusRestore}%)
                </span>
              )}
            </div>
          </div>

          {/* Dual Interactive Bar */}
          <div className="space-y-1">
            <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-700/60 overflow-hidden relative shadow-inner">
              {/* Projected preview fill */}
              {hoveredItem && (
                <div
                  className="absolute inset-y-0 left-0 bg-emerald-400/40 rounded-full transition-all duration-300"
                  style={{ width: `${projectedFocus}%` }}
                />
              )}
              {/* Current active focus */}
              <div
                className={`relative h-full rounded-full transition-all duration-500 ${
                  currentFocus < 25
                    ? 'bg-gradient-to-r from-red-600 to-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                    : currentFocus < 50
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                    : 'bg-gradient-to-r from-cyan-500 to-teal-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]'
                }`}
                style={{ width: `${currentFocus}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-bar-shimmer pointer-events-none" />
              </div>
            </div>

            {/* In a pinch alert */}
            {currentFocus < 30 && (
              <div className="flex items-center gap-1.5 text-[10px] text-rose-300 font-tech font-bold animate-pulse">
                <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
                <span>⚠️ 告急时刻：专注涣散！极易在单排或直播中操作变形大幅掉分，建议选购能量弹瞬间拉满！</span>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Toast Feedback */}
        {feedback && (
          <div className={`p-2.5 rounded-xl border text-xs font-tech font-bold flex items-center gap-2 animate-fadeIn ${
            feedback.type === 'success' 
              ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300' 
              : 'bg-rose-950/80 border-rose-500/60 text-rose-300'
          }`}>
            {feedback.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Consumables Catalog List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 font-tech">
          {CONSUMABLES_CATALOG.map(item => {
            const canAfford = playerMoney >= item.cost;
            return (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredItem(item)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`p-3 rounded-xl border transition-all duration-200 relative group ${
                  item.category === 'shot'
                    ? 'bg-gradient-to-r from-cyan-950/30 to-slate-900 border-cyan-500/40 hover:border-cyan-400'
                    : item.category === 'coffee'
                    ? 'bg-gradient-to-r from-amber-950/30 to-slate-900 border-amber-500/40 hover:border-amber-400'
                    : item.category === 'package'
                    ? 'bg-gradient-to-r from-yellow-950/30 to-slate-900 border-yellow-500/40 hover:border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.1)]'
                    : 'bg-slate-900/60 border-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  {/* Left: Icon & Info */}
                  <div className="flex items-start gap-2.5">
                    <div className={`p-2.5 rounded-xl text-lg shrink-0 ${
                      item.category === 'shot' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' :
                      item.category === 'coffee' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      item.category === 'package' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      <span>{item.icon}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-white text-xs">{item.name}</span>
                        <span className="text-[10px] text-slate-400 font-code">({item.nameEn})</span>
                        {item.tag && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                            {item.tag}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-300 leading-tight">
                        {item.desc}
                      </p>

                      {/* Attribute Restoration Badges */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-[10px] font-code">
                        <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-bold">
                          ✨ 专注 +{item.focusRestore}%
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/30 text-amber-300 font-bold">
                          ⚡ 精力 +{item.energyRestore}%
                        </span>
                        {item.mentalRestore > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-500/30 text-rose-300 font-bold">
                            ❤️ 心态 +{item.mentalRestore}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Cost & Actions */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0 pl-1">
                    <div className="text-right">
                      <span className="text-sm font-code font-extrabold text-emerald-400">
                        ${item.cost}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 w-24">
                      {/* Instant Use Button */}
                      <button
                        onClick={() => handlePurchase(item, true)}
                        disabled={!canAfford}
                        className={`w-full py-1.5 px-2 rounded-lg text-[10px] font-bold shadow transition cursor-pointer flex items-center justify-center gap-1 ${
                          canAfford
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        }`}
                        title={canAfford ? '即刻饮用秒回疲劳' : '资金不足'}
                      >
                        <Zap className="w-3 h-3 shrink-0" />
                        <span>{canAfford ? '立即使用' : '资金不足'}</span>
                      </button>

                      {/* Buy to Inventory Button */}
                      <button
                        onClick={() => handlePurchase(item, false)}
                        disabled={!canAfford}
                        className="w-full py-0.5 px-1 rounded text-[9px] bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                        title="存入背包，单排或直播红温时备用"
                      >
                        <Package className="w-2.5 h-2.5 shrink-0" />
                        <span>存入背包</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer: Free Rest Alternative Callout & Recovery Room */}
        <div className="pt-2.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-tech text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <Moon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>疲劳恢复方案：</span>
          </div>
          <div className="flex items-center gap-2">
            {onOpenRecoveryRoom && (
              <button
                onClick={() => {
                  onClose();
                  onOpenRecoveryRoom();
                }}
                className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-indigo-500/40 font-bold transition cursor-pointer text-[10px] flex items-center gap-1 active:scale-98"
                title="升级隔音与高奢寝具环境，提升休整恢复倍率"
              >
                <span>🛏️ 睡眠康复空间 (升级环境)</span>
              </button>
            )}
            {onRest && (
              <button
                onClick={() => {
                  onRest();
                  onClose();
                }}
                className="px-2 py-1 rounded bg-indigo-600/80 hover:bg-indigo-500 text-white font-bold transition cursor-pointer text-[10px] flex items-center gap-1 active:scale-98"
              >
                <span>💤 深度休整睡眠</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
