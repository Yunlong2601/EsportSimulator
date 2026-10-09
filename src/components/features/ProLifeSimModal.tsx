import React, { useState } from 'react';
import { Video, Heart, AlertTriangle, Coffee, Activity, ShieldCheck, Zap, X, CheckCircle, MessageSquare } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

interface ProLifeSimModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerMoney: number;
  onApplyDelta?: (delta: any) => void;
  onAddLog?: (msg: string, type: 'win' | 'loss' | 'gear' | 'event') => void;
}

export const ProLifeSimModal: React.FC<ProLifeSimModalProps> = ({
  isOpen,
  onClose,
  playerMoney,
  onApplyDelta,
  onAddLog
}) => {
  const [comfortPct, setComfortPct] = useState<number>(92);
  const [teamStressPct, setTeamStressPct] = useState<number>(24);
  const [dailyCommandsLeft, setDailyCommandsLeft] = useState<number>(3);
  const [selectedCam, setSelectedCam] = useState<string>('CAM_01');
  const [eventResolved, setEventResolved] = useState<boolean>(false);
  const [eventFeedback, setEventFeedback] = useState<string | null>(null);

  const cctvRooms = [
    {
      id: "CAM_01",
      name: "主训练室 (Scrim Lab)",
      status: "高频实战对抗中",
      buff: "对战复盘效率 +20%",
      temp: "21.5°C",
      color: "border-cyan-500/50 text-[#00f0ff]",
      feed: "五名首发选手正与世界前四强队进行高强度BO5训练赛，打野刚刚完成了一次精彩的二级抓中！"
    },
    {
      id: "CAM_02",
      name: "心理疗愈室 (Mental Lounge)",
      status: "精油香薰静息中",
      buff: "全员心率稳定 68bpm",
      temp: "23.0°C",
      color: "border-emerald-500/50 text-emerald-400",
      feed: "心理理疗师正为选手佩戴脑波监测仪，进行深呼吸与赛前抗压压力释放指导。"
    },
    {
      id: "CAM_03",
      name: "星级夜宵厨房 (Kitchen)",
      status: "营养热量补给充足",
      buff: "卡路里超量恢复 +30%",
      temp: "24.2°C",
      color: "border-amber-500/50 text-amber-400",
      feed: "特聘营养大厨正在准备高蛋白赛后热餐与复合维生素特饮，全天体能储备充足。"
    }
  ];

  const handleResolveEvent = (choice: 'A' | 'B') => {
    soundEngine.playClick();
    if (choice === 'A') {
      if (playerMoney < 1000) {
        setEventFeedback('俱乐部流动资金不足 ¥1,000！');
        return;
      }
      if (onApplyDelta) {
        onApplyDelta({ money: -1000, mental: 8 });
      }
      setTeamStressPct(prev => Math.max(0, prev - 15));
      setComfortPct(prev => Math.min(100, prev + 5));
      setEventResolved(true);
      setEventFeedback('教练组一对一疏导完毕！中单选手心态回复平稳，战队压力大幅下降 15%！');
      soundEngine.playVictory();
      if (onAddLog) onAddLog('🛋️ 基地教练一对一心理疏导: 中单心态回稳，战队压力下降 15%！', 'event');
    } else {
      if (onApplyDelta) {
        onApplyDelta({ mechanics: 2, mental: -3 });
      }
      setTeamStressPct(prev => Math.min(100, prev + 5));
      setEventResolved(true);
      setEventFeedback('中单选手排位怒拿五杀虐泉反杀！操作APM提升2，但心态略微浮躁。');
      soundEngine.playLevelUp();
      if (onAddLog) onAddLog('⚡ 逆风硬刚击破演员: 选手操作手感爆发 (+2 APM)！', 'event');
    }
  };

  const handleDispatchAction = (actionName: string, stressDelta: number, comfortDelta: number) => {
    if (dailyCommandsLeft <= 0) return;
    soundEngine.playClick();
    setDailyCommandsLeft(prev => prev - 1);
    setTeamStressPct(prev => Math.max(0, Math.min(100, prev + stressDelta)));
    setComfortPct(prev => Math.max(0, Math.min(100, prev + comfortDelta)));
    setEventFeedback(`已执行督导令: 【${actionName}】！`);
    setTimeout(() => setEventFeedback(null), 3000);
  };

  if (!isOpen) return null;

  const currentCamData = cctvRooms.find(r => r.id === selectedCam) || cctvRooms[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-[#0a0e17] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.2)] overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-3.5 border-b border-cyan-500/20 bg-[#0f131c] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black font-tech text-[#00f0ff]">基地日常 · 电竞生活俱乐部模拟</h3>
              <p className="text-[10px] text-slate-400">上海静安区顶层基地 LV.4 // 每日教练督导令: <span className="text-amber-400 font-bold">{dailyCommandsLeft} 次</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Telemetry Status Bar */}
        <div className="p-3 bg-[#0f131c] border-b border-slate-800/80 grid grid-cols-2 gap-3">
          <div className="p-2 rounded-lg bg-[#0a0e17] border border-slate-800">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Heart className="w-3 h-3 text-emerald-400" /> 基地环境舒适度
              </span>
              <span className="font-bold text-emerald-400 font-code">{comfortPct}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${comfortPct}%` }} />
            </div>
          </div>

          <div className="p-2 rounded-lg bg-[#0a0e17] border border-slate-800">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-red-400" /> 战队综合压力值
              </span>
              <span className="font-bold text-red-400 font-code">{teamStressPct}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${teamStressPct}%` }} />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
          {/* CCTV 3-Tile Monitoring Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> 全天候 CCTV 监控终端
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">LIVE 实时回传</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {cctvRooms.map(room => (
                <button
                  key={room.id}
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedCam(room.id);
                  }}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    selectedCam === room.id
                      ? `${room.color} bg-slate-900/90 shadow-md`
                      : 'border-slate-800 bg-[#0f131c] text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-[10px] font-mono font-bold flex items-center justify-between">
                    <span>{room.id}</span>
                    <span className="text-[9px] text-slate-500">{room.temp}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-200 truncate mt-1">{room.name}</div>
                  <div className="text-[9px] text-slate-500 truncate mt-0.5">{room.status}</div>
                </button>
              ))}
            </div>

            {/* Selected Camera Feed Monitor */}
            <div className="mt-2.5 p-3 rounded-xl bg-[#0f131c] border border-cyan-500/20">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-bold text-[#00f0ff] font-tech">{currentCamData.name} · 监视画面</span>
                <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono">
                  增益: {currentCamData.buff}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{currentCamData.feed}</p>
            </div>
          </div>

          {/* Random Encounter / Tilt Event Box */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-red-950/30 to-[#0f131c] border border-red-500/30">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <h4 className="text-xs font-black font-tech text-red-400">突发事件 · TapTap 奇遇</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              中单选手在国服高分排位遭遇嘴臭演员恶语相向，操作键盘噼啪作响，心态略微波动！
            </p>

            {!eventResolved ? (
              <div className="mt-3 grid grid-cols-1 gap-2">
                <button
                  onClick={() => handleResolveEvent('A')}
                  className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left transition-all hover:border-cyan-500/50 cursor-pointer"
                >
                  <div className="text-xs font-bold text-cyan-300">【选项 A】开启静音模式，教练一对一心理疏导</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">消耗资金: ¥1,000 | 效果: 战队压力 -15%, 心态平稳</div>
                </button>
                <button
                  onClick={() => handleResolveEvent('B')}
                  className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left transition-all hover:border-amber-500/50 cursor-pointer"
                >
                  <div className="text-xs font-bold text-amber-300">【选项 B】逆风硬刚激发斗志：无视挑衅虐泉反杀！</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">无金钱消耗 | 效果: 选手微操手感 APM +2, 压力 +5%</div>
                </button>
              </div>
            ) : (
              <div className="mt-2.5 py-1.5 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>突发事件已由教练组处置完毕。</span>
              </div>
            )}
          </div>

          {eventFeedback && (
            <div className="p-2.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs">
              {eventFeedback}
            </div>
          )}

          {/* 3 Action Dispatch Cards */}
          <div>
            <span className="text-xs font-bold text-slate-300 block mb-2">主教练督导动作派遣:</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleDispatchAction('全员温泉水疗', -12, 10)}
                disabled={dailyCommandsLeft <= 0}
                className="p-2 rounded-xl bg-[#0f131c] border border-slate-800 hover:border-cyan-500/40 text-center transition-all disabled:opacity-50 chamfer-btn cursor-pointer"
              >
                <Coffee className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                <span className="text-[11px] font-bold text-slate-200 block">全员温泉水疗</span>
                <span className="text-[9px] text-emerald-400">压力 -12%</span>
              </button>

              <button
                onClick={() => handleDispatchAction('战术密室集训', 6, 8)}
                disabled={dailyCommandsLeft <= 0}
                className="p-2 rounded-xl bg-[#0f131c] border border-slate-800 hover:border-amber-500/40 text-center transition-all disabled:opacity-50 chamfer-btn cursor-pointer"
              >
                <Zap className="w-4 h-4 text-[#ffd700] mx-auto mb-1" />
                <span className="text-[11px] font-bold text-slate-200 block">战术密室集训</span>
                <span className="text-[9px] text-amber-400">舒适 +8%</span>
              </button>

              <button
                onClick={() => handleDispatchAction('星级深夜加餐', -8, 6)}
                disabled={dailyCommandsLeft <= 0}
                className="p-2 rounded-xl bg-[#0f131c] border border-slate-800 hover:border-emerald-500/40 text-center transition-all disabled:opacity-50 chamfer-btn cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <span className="text-[11px] font-bold text-slate-200 block">星级深夜加餐</span>
                <span className="text-[9px] text-emerald-400">体能全满</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
