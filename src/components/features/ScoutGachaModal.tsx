import React, { useState } from 'react';
import { Sparkles, X, Zap, Shield, Flame, Award, ChevronRight, RefreshCw, Trophy } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

interface ScoutGachaModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerMoney: number;
  onAddLog?: (msg: string, type: 'win' | 'loss' | 'gear' | 'event') => void;
}

interface PulledCard {
  tier: 'SSS' | 'SSR' | 'SR' | 'R';
  name: string;
  role: string;
  ovr: number;
  apm: number;
  highlight?: boolean;
}

export const ScoutGachaModal: React.FC<ScoutGachaModalProps> = ({
  isOpen,
  onClose,
  playerMoney,
  onAddLog
}) => {
  const [pityCount, setPityCount] = useState<number>(3);
  const [pullResults, setPullResults] = useState<PulledCard[]>([]);
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [showResultsOverlay, setShowResultsOverlay] = useState<boolean>(false);

  // Featured SSS player
  const featured = {
    id: "GENESIS-01",
    name: "VORTEX",
    title: "神级中单 // 天空领主",
    role: "MID",
    ovr: 99,
    tier: "SSS",
    apm: 480,
    stats: { micro: 99, teamfight: 98, macro: 96, mental: 94 },
    passives: "【神之领域】关键龙坑团战输出提升 35%，逆风翻盘率 +28%",
    signatures: ["阿兹尔 (Azir)", "妖姬 (LeBlanc)", "塞拉斯 (Sylas)"]
  };

  const handlePull = (times: 1 | 10) => {
    soundEngine.playClick();
    setIsPulling(true);

    setTimeout(() => {
      const results: PulledCard[] = [];
      let nextPity = pityCount;

      for (let i = 0; i < times; i++) {
        const roll = Math.random();
        if (roll <= 0.025 || nextPity <= 1) {
          results.push({
            tier: 'SSS',
            name: 'VORTEX (神级中单)',
            role: 'MID',
            ovr: 99,
            apm: 480,
            highlight: true
          });
          nextPity = 10;
        } else if (roll <= 0.12) {
          results.push({
            tier: 'SSR',
            name: 'Hyper (绝活ADC)',
            role: 'ADC',
            ovr: 95,
            apm: 440,
            highlight: true
          });
          nextPity = Math.max(0, nextPity - 1);
        } else if (roll <= 0.355) {
          results.push({
            tier: 'SR',
            name: 'Zephyr (破晓打野)',
            role: 'JNG',
            ovr: 88,
            apm: 390
          });
          nextPity = Math.max(0, nextPity - 1);
        } else {
          results.push({
            tier: 'R',
            name: 'Rookie (二队青训练习生)',
            role: 'MID',
            ovr: 78,
            apm: 320
          });
          nextPity = Math.max(0, nextPity - 1);
        }
      }

      setPityCount(nextPity);
      setPullResults(results);
      setIsPulling(false);
      setShowResultsOverlay(true);
      soundEngine.playVictory();

      if (onAddLog) {
        onAddLog(`🌟 极光星探招募: 获得了 ${results.map(r => r.name).slice(0, 2).join(', ')} 等 ${times} 名选手！`, 'gear');
      }
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-[#0a0e17] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.2)] overflow-hidden text-slate-100">
        
        {/* Top Header */}
        <div className="p-3.5 border-b border-cyan-500/20 bg-[#0f131c] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-[#00f0ff]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black font-tech text-[#00f0ff]">全球星探 · SSS 神级选手招募</h3>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-[#ffd700] border border-amber-500/30 font-bold">
                  S14 极光限定
                </span>
              </div>
              <p className="text-[10px] text-slate-400">距离保底必得 SSS 选手仅剩: <span className="text-amber-400 font-bold font-code">{pityCount} 次</span></p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
          {/* Featured Player Hero Banner */}
          <div className="relative p-4 rounded-xl bg-gradient-to-b from-[#0f131c] to-[#0a0e17] border border-cyan-500/40 shadow-[0_0_25px_rgba(0,240,255,0.15)] overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-8 -bottom-8 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-start justify-between relative z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-gradient-to-r from-amber-500 to-amber-700 text-slate-950 text-xs font-black font-tech tracking-wider shadow">
                    {featured.tier} 传说
                  </span>
                  <span className="text-[11px] font-bold text-cyan-400 font-mono">
                    {featured.role} 核心位
                  </span>
                </div>
                <h2 className="text-xl font-black font-tech text-white tracking-wide mt-1">
                  {featured.name}
                </h2>
                <p className="text-xs text-slate-400 font-sans">{featured.title}</p>
              </div>

              {/* OVR Badge */}
              <div className="text-center p-2 rounded-xl bg-cyan-500/10 border border-cyan-400/40 shadow-inner">
                <span className="text-[9px] text-slate-400 font-bold block uppercase">总评 OVR</span>
                <span className="text-2xl font-black text-[#00f0ff] font-tech leading-none">
                  {featured.ovr}
                </span>
                <span className="text-[9px] text-amber-400 font-mono block mt-0.5">APM {featured.apm}</span>
              </div>
            </div>

            {/* 4-Stat Grid */}
            <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-800/80">
              <div className="p-2 rounded-lg bg-[#0a0e17] border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">微操极限</span>
                <span className="text-sm font-bold text-cyan-300 font-code">{featured.stats.micro}</span>
              </div>
              <div className="p-2 rounded-lg bg-[#0a0e17] border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">团战输出</span>
                <span className="text-sm font-bold text-amber-300 font-code">{featured.stats.teamfight}</span>
              </div>
              <div className="p-2 rounded-lg bg-[#0a0e17] border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">大局视野</span>
                <span className="text-sm font-bold text-indigo-300 font-code">{featured.stats.macro}</span>
              </div>
              <div className="p-2 rounded-lg bg-[#0a0e17] border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">抗压抗崩</span>
                <span className="text-sm font-bold text-emerald-300 font-code">{featured.stats.mental}</span>
              </div>
            </div>

            {/* Signature Champions */}
            <div className="mt-3">
              <span className="text-[11px] text-slate-400 font-bold block mb-1">招牌绝活英雄池:</span>
              <div className="flex flex-wrap gap-1.5">
                {featured.signatures.map(hero => (
                  <span
                    key={hero}
                    className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[#00f0ff] text-[10px] font-sans font-medium"
                  >
                    ✦ {hero}
                  </span>
                ))}
              </div>
            </div>

            {/* Passive Power */}
            <div className="mt-2.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200">
              <span className="font-bold text-[#ffd700]">被动觉醒:</span> {featured.passives}
            </div>
          </div>

          {/* Probabilities Info */}
          <div className="p-2.5 rounded-xl bg-[#0f131c] border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>招募概率: SSS 2.5% | SSR 12% | SR 35.5% | R 50%</span>
            <span className="text-cyan-400 font-bold">10连保底必出 SR+</span>
          </div>
        </div>

        {/* Bottom Recruitment Action Bar with Chamfered Buttons */}
        <div className="p-3 border-t border-cyan-500/20 bg-[#0f131c] grid grid-cols-2 gap-2">
          <button
            onClick={() => handlePull(1)}
            disabled={isPulling}
            className="py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold font-tech flex flex-col items-center justify-center transition-all chamfer-btn cursor-pointer"
          >
            <span>单次星探招募</span>
            <span className="text-[10px] text-cyan-400 font-code font-normal">180 钻石 / 试炼点</span>
          </button>

          <button
            onClick={() => handlePull(10)}
            disabled={isPulling}
            className="py-2.5 px-3 rounded-lg bg-gradient-to-r from-cyan-500/30 via-cyan-400/20 to-amber-500/30 hover:from-cyan-500/40 hover:to-amber-500/40 text-white border border-cyan-400/60 text-xs font-black font-tech flex flex-col items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all chamfer-btn cursor-pointer"
          >
            <span className="text-[#00f0ff] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> 绝杀十连招募
            </span>
            <span className="text-[10px] text-[#ffd700] font-code font-normal">1,800 钻石 (必出神将)</span>
          </button>
        </div>

        {/* Gacha Result Modal Overlay */}
        {showResultsOverlay && (
          <div className="absolute inset-0 z-20 bg-black/95 p-4 flex flex-col justify-between animate-fade-in">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
              <h4 className="text-sm font-black font-tech text-[#00f0ff] flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#ffd700]" /> 星探招募签约结果报告
              </h4>
              <button
                onClick={() => setShowResultsOverlay(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 my-auto py-2 max-h-[70vh] overflow-y-auto">
              {pullResults.map((card, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center ${
                    card.tier === 'SSS'
                      ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_20px_rgba(255,215,0,0.4)]'
                      : card.tier === 'SSR'
                      ? 'bg-indigo-950/40 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                      : card.tier === 'SR'
                      ? 'bg-cyan-950/40 border-cyan-500/50'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-black font-tech mb-1 ${
                    card.tier === 'SSS' ? 'bg-amber-500 text-slate-950' :
                    card.tier === 'SSR' ? 'bg-indigo-500 text-white' :
                    card.tier === 'SR' ? 'bg-cyan-500 text-slate-950' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {card.tier}
                  </span>
                  <span className="text-xs font-bold text-white truncate max-w-full">{card.name}</span>
                  <span className="text-[10px] text-cyan-400 font-mono mt-0.5">OVR {card.ovr}</span>
                  <span className="text-[9px] text-slate-400 font-mono">APM {card.apm}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowResultsOverlay(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs font-tech chamfer-btn shadow-[0_0_15px_rgba(0,240,255,0.4)]"
            >
              完成入队签约
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
