import React, { useState } from 'react';
import { Swords, Zap, Skull, Shield, AlertOctagon, X, Trophy, MessageSquare, Radio } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

interface TacticalArenaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDelta?: (delta: any) => void;
  onAddLog?: (msg: string, type: 'win' | 'loss' | 'gear' | 'event') => void;
}

export const TacticalArenaModal: React.FC<TacticalArenaModalProps> = ({
  isOpen,
  onClose,
  onApplyDelta,
  onAddLog
}) => {
  const [matchTime, setMatchTime] = useState<string>("32:15");
  const [baronHp, setBaronHp] = useState<number>(1450);
  const baronMaxHp = 12000;
  const smiteThreshold = 1200;
  const [tacticalPoints, setTacticalPoints] = useState<number>(2);
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [clutchResult, setClutchResult] = useState<{ isClutch: boolean; message: string; tag: string } | null>(null);

  const options = [
    {
      id: 1,
      title: "【中单孤勇者进场】",
      tag: "极危 // 刺客决断",
      success_rate: 72,
      cost_tp: 2,
      reward: "敌方双C位瞬间暴毙，打出 0换3 直取中路高地！",
      risk: "进场被敌方辅助秒控蒸发，全线溃败遭一波推平。"
    },
    {
      id: 2,
      title: "【拼惩戒稳拿大龙】",
      tag: "稳健 // 野区博弈",
      success_rate: 55,
      cost_tp: 1,
      reward: "打野精准惩戒收割大龙！带三路超级兵稳健推进。",
      risk: "拼惩戒失手被敌方抢龙，沦为被动守家劣势。"
    },
    {
      id: 3,
      title: "【教练紧急战术暂停】",
      tag: "暂停令 // 仅剩1次",
      success_rate: 100,
      cost_tp: 0,
      reward: "战术沟通完毕！全员操作精度提升 15%，打赢决胜团！",
      risk: "消耗本场唯一战术暂停锦囊。"
    }
  ];

  const handleExecute = (opt: typeof options[0]) => {
    if (tacticalPoints < opt.cost_tp) return;
    soundEngine.playClick();
    setIsResolving(true);
    setTacticalPoints(prev => prev - opt.cost_tp);

    setTimeout(() => {
      const roll = Math.random() * 100;
      const isClutch = roll <= opt.success_rate;

      if (isClutch) {
        soundEngine.playVictory();
        setBaronHp(0);
        if (onApplyDelta) {
          onApplyDelta({ lp: 45, mental: 10, fame: 15, isWin: true });
        }
        if (onAddLog) {
          onAddLog(`🔥 决胜时刻纳什男爵大捷: ${opt.reward} (+45 LP, +15 声望)`, 'win');
        }
      } else {
        soundEngine.playDefeat();
        if (onApplyDelta) {
          onApplyDelta({ lp: -20, mental: -8, isLoss: true });
        }
        if (onAddLog) {
          onAddLog(`💀 决胜时刻战术失误: ${opt.risk} (-20 LP)`, 'loss');
        }
      }

      setClutchResult({
        isClutch,
        message: isClutch ? opt.reward : opt.risk,
        tag: opt.title
      });
      setIsResolving(false);
    }, 700);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-[#0a0e17] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.2)] overflow-hidden text-slate-100">
        
        {/* Top Header */}
        <div className="p-3.5 border-b border-cyan-500/20 bg-[#0f131c] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400">
              <Swords className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black font-tech text-[#00f0ff]">决胜时刻 · 战术决策终端</h3>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-bold font-mono">
                  {matchTime} // BO5 决胜局
                </span>
              </div>
              <p className="text-[10px] text-slate-400">教练战术点 (Tactical Points): <span className="text-amber-400 font-bold font-code">{tacticalPoints} TP</span></p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
          {/* Baron Pit HP Hud */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#0f131c] to-[#0a0e17] border border-red-500/40 shadow-[0_0_20px_rgba(255,59,92,0.15)]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-black font-tech text-red-400 flex items-center gap-1.5">
                <Skull className="w-4 h-4" /> 纳什男爵生死战 (BARON PIT DECIDER)
              </span>
              <span className="font-mono text-xs font-bold text-slate-200">
                {baronHp.toLocaleString()} / {baronMaxHp.toLocaleString()} HP
              </span>
            </div>

            {/* HP Bar */}
            <div className="relative w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-red-500 transition-all duration-300"
                style={{ width: `${Math.max(0, (baronHp / baronMaxHp) * 100)}%` }}
              />
              {/* Smite Threshold Marker at 10% */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_8px_#00f0ff]"
                style={{ left: `${(smiteThreshold / baronMaxHp) * 100}%` }}
                title="拼惩戒绝杀线 (1,200 HP)"
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span className="text-cyan-400 font-bold">▲ 斩杀惩戒线: {smiteThreshold} HP</span>
              <span>蓝色方胜率 82% vs 红色方 76%</span>
            </div>
          </div>

          {/* Live Casters Commentary Ticker */}
          <div className="p-3 rounded-xl bg-[#0f131c] border border-cyan-500/20 flex items-start gap-2.5">
            <div className="w-6 h-6 rounded bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-cyan-300 block">🎙 官方总决赛解说席 · 米勒 & 娃娃:</span>
              <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                “这一波大龙坑必须做决断了！敌方中野已经包抄过来，是孤勇者中单进场秒C，还是打野稳健拼惩戒？全看教练组这一瞬间的指挥发令！”
              </p>
            </div>
          </div>

          {/* Clutch Result Banner */}
          {clutchResult && (
            <div className={`p-3.5 rounded-xl border animate-fade-in ${
              clutchResult.isClutch
                ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                : 'bg-red-950/40 border-red-500 text-red-200'
            }`}>
              <div className="flex items-center gap-2 font-black font-tech text-sm mb-1">
                {clutchResult.isClutch ? <Trophy className="w-4 h-4 text-[#ffd700]" /> : <Skull className="w-4 h-4 text-red-400" />}
                <span>{clutchResult.isClutch ? '🔥 奇迹绝杀 · CLUTCH OUTPLAY!' : '💀 战术受挫 · CRITICAL DEFEAT'}</span>
              </div>
              <p className="text-xs leading-relaxed">{clutchResult.message}</p>
            </div>
          )}

          {/* 3 Tactical Directive Cards */}
          <div>
            <span className="text-xs font-bold text-slate-300 block mb-2">教练战术指令牌池:</span>
            <div className="space-y-2">
              {options.map(opt => {
                const canAfford = tacticalPoints >= opt.cost_tp;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleExecute(opt)}
                    disabled={!canAfford || isResolving}
                    className={`w-full p-3 rounded-xl border text-left transition-all relative ${
                      canAfford
                        ? 'bg-[#0f131c] border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 cursor-pointer'
                        : 'bg-slate-950/60 border-slate-900 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-tech">{opt.title}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 font-mono">
                          {opt.tag}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black font-code text-emerald-400">成功率 {opt.success_rate}%</span>
                        <span className="text-[10px] text-amber-400 font-mono block">消耗 {opt.cost_tp} TP</span>
                      </div>
                    </div>
                    <div className="mt-1.5 text-[11px] text-slate-400 leading-tight">
                      <span className="text-emerald-400/80">成功: </span>{opt.reward}
                    </div>
                    <div className="text-[10px] text-red-400/80 leading-tight mt-0.5">
                      <span>风险: </span>{opt.risk}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
