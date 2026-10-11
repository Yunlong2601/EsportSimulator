import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Sparkles } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

export interface DanmakuItem {
  id: string;
  text: string;
  color: string;
  lane: number;
  speed: number; // Animation duration in seconds (e.g. 5s - 8s)
  isCustom?: boolean;
}

const DEFAULT_FLAVOR_STRINGS = [
  '666',
  'This play is insane!',
  'Report Top Diff',
  '777777777',
  '卧槽！这波操作太离谱了！',
  '这就是通天代！一人抬着四个人往前走！',
  '建议严查！这反应绝对开了天眼！',
  '大龙坑团战！给爷杀！',
  '全体起立！！！',
  '金色的雨准备就绪！',
  '这局谁是MVP不用我多说了吧！',
  '大心脏拉满！极限丝血反杀！',
  '下饭？这叫米其林三星操作！',
  '心疼对线选手一秒钟，直接红温了',
  '兄弟们把公屏打在保护上！',
  '满屏的66666666666',
  '直接把对面看傻了！',
  '通天代实锤！这一票投给MVP！'
];

const DANMAKU_COLORS = [
  '#FCD34D', // Gold VIP
  '#38BDF8', // Electric Cyan
  '#F472B6', // Neon Pink
  '#34D399', // Emerald Green
  '#A78BFA', // Violet
  '#F87171', // Coral Red
  '#FFFFFF'  // Crisp White
];

interface LiveMatchDanmakuProps {
  active?: boolean;
  extraStrings?: string[];
  maxLanes?: number;
  className?: string;
  showInput?: boolean;
  onSendDanmaku?: (text: string) => void;
}

export const LiveMatchDanmaku: React.FC<LiveMatchDanmakuProps> = ({
  active = true,
  extraStrings = [],
  maxLanes = 3,
  className = '',
  showInput = false,
  onSendDanmaku
}) => {
  const [danmakuQueue, setDanmakuQueue] = useState<DanmakuItem[]>([]);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [inputText, setInputText] = useState<string>('');
  const lastLaneRef = useRef<number>(0);

  const allStrings = [...DEFAULT_FLAVOR_STRINGS, ...extraStrings];

  useEffect(() => {
    if (!active || !isEnabled) return;

    // Spawn initial barrage
    const spawnInitial = () => {
      const initialItems: DanmakuItem[] = [];
      for (let i = 0; i < 3; i++) {
        const text = allStrings[Math.floor(Math.random() * allStrings.length)];
        const lane = i % maxLanes;
        initialItems.push({
          id: `init-${i}-${Date.now()}`,
          text,
          color: DANMAKU_COLORS[Math.floor(Math.random() * DANMAKU_COLORS.length)],
          lane,
          speed: 6.5 + Math.random() * 2
        });
      }
      setDanmakuQueue(initialItems);
    };

    spawnInitial();

    const interval = setInterval(() => {
      const text = allStrings[Math.floor(Math.random() * allStrings.length)];
      // Alternate lanes to avoid overlaps
      const lane = (lastLaneRef.current + 1) % maxLanes;
      lastLaneRef.current = lane;

      const newItem: DanmakuItem = {
        id: `danmaku-${Date.now()}-${Math.random()}`,
        text,
        color: DANMAKU_COLORS[Math.floor(Math.random() * DANMAKU_COLORS.length)],
        lane,
        speed: 6 + Math.random() * 2.5
      };

      setDanmakuQueue(prev => [...prev.slice(-20), newItem]);
    }, 1200);

    return () => clearInterval(interval);
  }, [active, isEnabled, maxLanes]);

  const handleSendCustom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    soundEngine.playClick();
    const customItem: DanmakuItem = {
      id: `custom-${Date.now()}`,
      text: `★ 观众VIP: ${inputText.trim()}`,
      color: '#FBBF24',
      lane: Math.floor(Math.random() * maxLanes),
      speed: 6,
      isCustom: true
    };

    setDanmakuQueue(prev => [...prev, customItem]);
    if (onSendDanmaku) {
      onSendDanmaku(inputText.trim());
    }
    setInputText('');
  };

  return (
    <div className={`relative w-full overflow-hidden pointer-events-none select-none ${className}`}>
      {/* Floating Danmaku Canvas Layer */}
      {isEnabled && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
          {danmakuQueue.map(item => (
            <div
              key={item.id}
              className={`absolute whitespace-nowrap font-bold text-xs pointer-events-none animate-danmaku ${
                item.isCustom
                  ? 'px-2 py-0.5 rounded-full bg-amber-500/30 border border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.6)] z-30'
                  : 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]'
              }`}
              style={{
                top: `${(item.lane / maxLanes) * 75 + 10}%`,
                color: item.isCustom ? '#FCD34D' : item.color,
                animationDuration: `${item.speed}s`
              }}
            >
              {item.text}
            </div>
          ))}
        </div>
      )}

      {/* Floating Toggle & Quick Sender Controls */}
      <div className="relative z-30 pointer-events-auto flex items-center justify-between gap-2 p-1.5 bg-slate-950/60 backdrop-blur-sm border-t border-slate-800/60 text-[11px] font-tech">
        <button
          type="button"
          onClick={() => setIsEnabled(!isEnabled)}
          className={`px-2 py-0.5 rounded-md border text-[10px] font-bold cursor-pointer transition flex items-center gap-1 ${
            isEnabled
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              : 'bg-slate-900 text-slate-500 border-slate-800'
          }`}
          title="切换赛事直播弹幕"
        >
          <MessageSquare className="w-3 h-3" />
          <span>{isEnabled ? '弹幕: 开' : '弹幕: 关'}</span>
        </button>

        {showInput ? (
          <form onSubmit={handleSendCustom} className="flex-1 flex gap-1.5 max-w-xs">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="发条弹幕互动 (如: 666, 通天代)..."
              className="flex-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-white text-[10px] focus:outline-none focus:border-cyan-400"
              maxLength={25}
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-bold text-[10px] disabled:opacity-40 cursor-pointer flex items-center gap-0.5"
            >
              <Send className="w-2.5 h-2.5" />
              <span>发射</span>
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>实时直播弹幕已连接</span>
          </div>
        )}
      </div>
    </div>
  );
};
