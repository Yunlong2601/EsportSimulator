import React, { useState } from 'react';
import { Cpu, Zap, Sliders, Shield, Gauge, X, Wrench, Sparkles, AlertTriangle } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

interface HardwareRigModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerMoney: number;
  onApplyDelta?: (delta: any) => void;
}

export const HardwareRigModal: React.FC<HardwareRigModalProps> = ({
  isOpen,
  onClose,
  playerMoney,
  onApplyDelta
}) => {
  const [overclockPct, setOverclockPct] = useState<number>(115);
  const baseApm = 1420;
  const currentApmBoost = Math.floor(baseApm * (overclockPct / 100));
  const fatiguePenalty = overclockPct > 115 ? 15 : 0;

  const [activeSlots, setActiveSlots] = useState({
    mouse: { rarity: "LEGENDARY", name: "CyberViper 8000Hz 无线电竞鼠", bonus: "操作反应 +28, 走砍失误率 -40%", icon: "🖱️" },
    keyboard: { rarity: "EPIC", name: "磁轴客制化 68 键铝坨坨键盘", bonus: "连招爆发速度 +35, APM峰值 +45", icon: "⌨️" },
    monitor: { rarity: "LEGENDARY", name: "540Hz 极速电竞神瞳显示器", bonus: "视野盲区察觉 +25%, 动态残影消退 99.8%", icon: "🖥️" },
    audio: { rarity: "RARE", name: "7.1 战术声学监听耳机", bonus: "敌方Gank预警 +18%, 空间脚步定位 360°", icon: "🎧" }
  });

  const [craftingInv, setCraftingInv] = useState({
    titanium_switches: 84,
    carbon_shells: 12,
    low_latency_chips: 6
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setOverclockPct(val);
  };

  const handleApplyOverclock = () => {
    soundEngine.playLevelUp();
    if (onApplyDelta) {
      onApplyDelta({ mechanics: Math.floor((overclockPct - 100) / 4) });
    }
    setToastMsg(`外设超频模式已锁定至 ${overclockPct}%！APM加成: +${currentApmBoost}`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-[#0a0e17] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.2)] overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-3.5 border-b border-cyan-500/20 bg-[#0f131c] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-[#00f0ff]">
              <Cpu className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black font-tech text-[#00f0ff]">神装外设 · 顶级电竞工坊</h3>
              <p className="text-[10px] text-slate-400">总 APM 加成: <span className="text-[#ffd700] font-bold font-code">+{currentApmBoost}</span> | 延迟: <span className="text-emerald-400 font-bold font-mono">1.2ms</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
          {/* Overclock Controller HUD */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#0f131c] to-[#0a0e17] border border-cyan-500/40 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-cyan-400" /> 外设 RGB 激进超频档位 (OVERCLOCK)
              </span>
              <span className="text-sm font-black text-[#00f0ff] font-tech font-code">
                {overclockPct}%
              </span>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="100"
              max="130"
              step="1"
              value={overclockPct}
              onChange={handleSliderChange}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />

            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>100% (标准稳定)</span>
              <span>115% (超竞速档)</span>
              <span className="text-red-400 font-bold">130% (极限过载)</span>
            </div>

            {/* Fatigue Warning */}
            {fatiguePenalty > 0 && (
              <div className="mt-2.5 py-1 px-2.5 rounded bg-red-500/15 border border-red-500/30 text-red-300 text-[11px] flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>超频档位高过 115%，选手单局体能消耗额外 +15%！</span>
              </div>
            )}

            <button
              onClick={handleApplyOverclock}
              className="mt-3 w-full py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-[#00f0ff] border border-cyan-500/50 text-xs font-black font-tech chamfer-btn transition-all shadow-[0_0_10px_rgba(0,240,255,0.2)] cursor-pointer"
            >
              锁定超频电压与轮询率
            </button>
          </div>

          {toastMsg && (
            <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs">
              {toastMsg}
            </div>
          )}

          {/* 4 Peripheral Slots */}
          <div>
            <span className="text-xs font-bold text-slate-300 block mb-2">已装备顶级电竞外设槽位:</span>
            <div className="space-y-2">
              {Object.entries(activeSlots).map(([slotKey, item]) => {
                const isLegendary = item.rarity === 'LEGENDARY';
                const isEpic = item.rarity === 'EPIC';
                return (
                  <div
                    key={slotKey}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 ${
                      isLegendary
                        ? 'bg-amber-950/20 border-amber-500/40 shadow-[0_0_10px_rgba(255,215,0,0.1)]'
                        : isEpic
                        ? 'bg-purple-950/20 border-purple-500/40'
                        : 'bg-cyan-950/20 border-cyan-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="text-xl shrink-0">{item.icon}</div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">{item.name}</span>
                          <span className={`text-[9px] px-1 py-0.2 rounded font-black font-tech ${
                            isLegendary ? 'bg-amber-500 text-slate-950' :
                            isEpic ? 'bg-purple-500 text-white' : 'bg-cyan-500 text-slate-950'
                          }`}>
                            {item.rarity}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">{item.bonus}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Crafting Inventory Bar */}
          <div className="p-3 rounded-xl bg-[#0f131c] border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-amber-400" /> 特种工坊打造仓储
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">可改装升级</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-[#0a0e17] border border-slate-800">
                <span className="text-[10px] text-slate-400 block">钛合金磁轴</span>
                <span className="text-sm font-bold text-white font-code">{craftingInv.titanium_switches} 颗</span>
              </div>
              <div className="p-2 rounded-lg bg-[#0a0e17] border border-slate-800">
                <span className="text-[10px] text-slate-400 block">碳纤维壳体</span>
                <span className="text-sm font-bold text-white font-code">{craftingInv.carbon_shells} 组</span>
              </div>
              <div className="p-2 rounded-lg bg-[#0a0e17] border border-slate-800">
                <span className="text-[10px] text-slate-400 block">零延迟芯片</span>
                <span className="text-sm font-bold text-cyan-400 font-code">{craftingInv.low_latency_chips} 枚</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
