import React, { useState } from 'react';
import { Network, Zap, Shield, Flame, X, ArrowUpRight, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

interface SynergyNetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerMoney: number;
  onApplyDelta?: (delta: any) => void;
}

export const SynergyNetworkModal: React.FC<SynergyNetworkModalProps> = ({
  isOpen,
  onClose,
  playerMoney,
  onApplyDelta
}) => {
  const [overchargePct, setOverchargePct] = useState<number>(94.2);
  const [pairs, setPairs] = useState([
    { code: "TOP x JNG", title: "上野互信", lv: 4, max_lv: 5, effect: "越塔配合 +20% 击杀斩获", cost: 1500 },
    { code: "JNG x MID", title: "黄金中野代练组合", lv: 5, max_lv: 5, is_max: true, effect: "控峡谷先锋速度 +35%", cost: 2500 },
    { code: "MID x BOT", title: "双核驱动", lv: 3, max_lv: 5, effect: "后期团战容错率 +15%", cost: 1200 },
    { code: "BOT x SUP", title: "默契下路组合", lv: 4, max_lv: 5, effect: "对线击杀率 +22% / 视野压制 +30%", cost: 1800 }
  ]);

  const [resonances, setResonances] = useState([
    { id: 1, name: "凤凰涅槃", equipped: true, desc: "落后 5000 经济时，防守反击伤害 +25%" },
    { id: 2, name: "快节奏血腥对线", equipped: true, desc: "前 10 分钟首条小龙控龙率 +40%" },
    { id: 3, name: "世界冠军底蕴", equipped: false, locked: true, desc: "需捧起召唤师杯解锁: 全员终结技冷却 -20%" }
  ]);

  const [upgradeMsg, setUpgradeMsg] = useState<string | null>(null);

  const handleUpgradePair = (code: string) => {
    soundEngine.playLevelUp();
    setPairs(prev => prev.map(p => {
      if (p.code === code && p.lv < p.max_lv) {
        const nextLv = p.lv + 1;
        return {
          ...p,
          lv: nextLv,
          is_max: nextLv >= p.max_lv
        };
      }
      return p;
    }));
    setOverchargePct(prev => Math.min(100, +(prev + 1.5).toFixed(1)));
    setUpgradeMsg(`羁绊【${code}】默契等级提升！全队神经同调率上升！`);
    setTimeout(() => setUpgradeMsg(null), 3000);
  };

  const handleToggleResonance = (id: number) => {
    soundEngine.playClick();
    setResonances(prev => prev.map(r => {
      if (r.id === id && !r.locked) {
        return { ...r, equipped: !r.equipped };
      }
      return r;
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-[#0a0e17] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.2)] overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-3.5 border-b border-cyan-500/20 bg-[#0f131c] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
              <Network className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black font-tech text-[#00f0ff]">战队羁绊 · 选手默契神经拓扑网络</h3>
              <p className="text-[10px] text-slate-400">超频同调率: <span className="text-cyan-400 font-bold font-code">{overchargePct}%</span> | 全队终结伤害: <span className="text-emerald-400 font-bold">+18.4%</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Constellation Canvas View */}
        <div className="p-4 bg-[#0a0e17] border-b border-slate-800 relative overflow-hidden flex flex-col items-center justify-center">
          <div className="w-full max-w-xs relative py-2">
            {/* SVG Connecting Topology Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 300 120">
              <line x1="60" y1="30" x2="150" y2="30" stroke="#00f0ff" strokeWidth="2" strokeDasharray="4 2" opacity="0.6" />
              <line x1="150" y1="30" x2="240" y2="30" stroke="#00f0ff" strokeWidth="2" strokeDasharray="4 2" opacity="0.6" />
              <line x1="150" y1="30" x2="100" y2="90" stroke="#ffd700" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />
              <line x1="150" y1="30" x2="200" y2="90" stroke="#ffd700" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />
              <line x1="100" y1="90" x2="200" y2="90" stroke="#00e676" strokeWidth="2" strokeDasharray="4 2" opacity="0.7" />
            </svg>

            {/* Nodes */}
            <div className="flex justify-between items-center mb-8 relative z-10 px-2">
              <div className="px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-400 text-center shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                <span className="text-[10px] text-cyan-300 font-bold block">TOP 上单</span>
                <span className="text-[9px] text-slate-400 font-mono">稳如磐石</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-400 text-center shadow-[0_0_10px_rgba(255,215,0,0.3)] scale-110">
                <span className="text-[10px] text-amber-300 font-bold block">MID 中单</span>
                <span className="text-[9px] text-slate-300 font-mono">绝对掌控</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-indigo-950/80 border border-indigo-400 text-center shadow-[0_0_10px_rgba(99,102,241,0.3)]">
                <span className="text-[10px] text-indigo-300 font-bold block">JNG 打野</span>
                <span className="text-[9px] text-slate-400 font-mono">野区引擎</span>
              </div>
            </div>

            <div className="flex justify-around items-center relative z-10 px-6">
              <div className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-400 text-center shadow-[0_0_10px_rgba(0,230,118,0.3)]">
                <span className="text-[10px] text-emerald-300 font-bold block">BOT 绝杀ADC</span>
                <span className="text-[9px] text-slate-400 font-mono">终局输出</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-purple-950/80 border border-purple-400 text-center shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                <span className="text-[10px] text-purple-300 font-bold block">SUP 辅助</span>
                <span className="text-[9px] text-slate-400 font-mono">全局视野</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
          {upgradeMsg && (
            <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs">
              {upgradeMsg}
            </div>
          )}

          {/* 4 Duo Synergy Cards */}
          <div>
            <span className="text-xs font-bold text-slate-300 block mb-2">核心双人组默契羁绊 (DUO SYNERGY):</span>
            <div className="space-y-2">
              {pairs.map(pair => (
                <div
                  key={pair.code}
                  className="p-2.5 rounded-xl bg-[#0f131c] border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white font-tech">{pair.title}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 font-mono">
                        {pair.code}
                      </span>
                      {pair.is_max ? (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-[#ffd700] border border-amber-500/40 font-bold">
                          MAX 极境
                        </span>
                      ) : (
                        <span className="text-[9px] text-slate-400 font-mono">LV.{pair.lv} / {pair.max_lv}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{pair.effect}</p>
                  </div>

                  {!pair.is_max && (
                    <button
                      onClick={() => handleUpgradePair(pair.code)}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-[#00f0ff] border border-cyan-500/50 text-[11px] font-bold font-tech shrink-0 chamfer-btn cursor-pointer"
                    >
                      升级羁绊
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tactical Resonance Slots */}
          <div>
            <span className="text-xs font-bold text-slate-300 block mb-2">战队共鸣圣物插槽 (RESONANCE SLOTS):</span>
            <div className="space-y-2">
              {resonances.map(res => (
                <div
                  key={res.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 ${
                    res.locked
                      ? 'bg-slate-950/40 border-slate-900 opacity-60'
                      : res.equipped
                      ? 'bg-amber-950/20 border-amber-500/40'
                      : 'bg-[#0f131c] border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      res.locked ? 'bg-slate-800 text-slate-600' : res.equipped ? 'bg-amber-500/20 text-[#ffd700]' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {res.locked ? <Lock className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{res.name}</span>
                        {res.equipped && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            已共鸣
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{res.desc}</p>
                    </div>
                  </div>

                  {!res.locked && (
                    <button
                      onClick={() => handleToggleResonance(res.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-tech shrink-0 chamfer-btn ${
                        res.equipped
                          ? 'bg-slate-800 text-slate-300'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {res.equipped ? '卸下' : '装备共鸣'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
