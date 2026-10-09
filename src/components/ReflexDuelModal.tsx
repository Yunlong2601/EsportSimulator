import React, { useState, useEffect, useRef } from 'react';
import { Zap, AlertTriangle, CheckCircle2, XCircle, Sparkles, X } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface ReflexDuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (reactionMs: number) => void;
  onFailure: (reason: string) => void;
}

export const ReflexDuelModal: React.FC<ReflexDuelModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onFailure
}) => {
  const [gameState, setGameState] = useState<'WAITING' | 'READY' | 'TRIGGERED' | 'SUCCESS' | 'FAILED'>('WAITING');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [opponentName] = useState<string>("敌方千分王者绝活中单");
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setGameState('WAITING');
      setReactionTime(null);

      // Random delay between 1.5s and 3.5s before the flash reflex prompt appears
      const delay = 1500 + Math.random() * 2000;
      timerRef.current = setTimeout(() => {
        setGameState('TRIGGERED');
        startTimeRef.current = Date.now();
        soundEngine.playBaronSteal();
      }, delay);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTapReaction = () => {
    if (gameState === 'WAITING') {
      // Too early! Pre-fired flash
      if (timerRef.current) clearTimeout(timerRef.current);
      setGameState('FAILED');
      soundEngine.playDefeat();
      onFailure("闪现交早了！预判失误直接撞到敌方技能弹道上。");
    } else if (gameState === 'TRIGGERED') {
      const elapsed = Date.now() - startTimeRef.current;
      setReactionTime(elapsed);
      if (elapsed <= 550) {
        setGameState('SUCCESS');
        soundEngine.playVictory();
        onSuccess(elapsed);
      } else {
        setGameState('FAILED');
        soundEngine.playDefeat();
        onFailure(`反应稍慢 (${elapsed}毫秒)。敌方大招率先命中。`);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in select-none">
      <div className="relative max-w-sm w-full bg-slate-900 border-2 border-cyan-500/60 rounded-2xl p-5 shadow-2xl text-center chamfer-card overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-tech font-bold text-amber-400">
            <Zap className="w-4 h-4" /> 1v1 极限微操反应对决
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Duel Center Arena */}
        <div className="py-6 space-y-4">
          <div className="text-xs text-slate-400 font-sans">
            对决选手: <span className="text-white font-bold">{opponentName}</span>
          </div>

          {gameState === 'WAITING' && (
            <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-3xl animate-pulse">🎯</div>
              <div className="text-sm font-tech font-bold text-slate-300">
                凝神屏息 · 等待敌方起手前摇...
              </div>
              <p className="text-[10px] text-slate-500">
                请勿抢按！当按键变为高亮青色时，立即点击触发闪现反杀！
              </p>
            </div>
          )}

          {gameState === 'TRIGGERED' && (
            <div className="p-6 rounded-xl bg-cyan-500 text-slate-950 font-tech font-extrabold text-lg shadow-[0_0_40px_rgba(6,182,212,0.8)] animate-pulse">
              ⚡ 敌方已出手！立即闪现反杀！！ ⚡
            </div>
          )}

          {gameState === 'SUCCESS' && (
            <div className="p-6 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400" />
              <div className="font-tech font-bold text-base">神级反应！零帧起手极限反杀！</div>
              <div className="font-code text-xs">极限反应用时: {reactionTime} 毫秒</div>
              <p className="text-[11px] text-slate-300 mt-1">
                贴脸瞬间闪现规避致命控制，反手光速连招秒杀对手，达成名场面高光！
              </p>
            </div>
          )}

          {gameState === 'FAILED' && (
            <div className="p-6 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-300 space-y-2">
              <XCircle className="w-10 h-10 mx-auto text-rose-400" />
              <div className="font-tech font-bold text-base">对决操作失误</div>
              <p className="text-[11px] text-slate-300">
                {reactionTime ? `反应稍慢 (${reactionTime}毫秒)，被控死未能按出闪现。` : "过早抢按，交出空闪！"}
              </p>
            </div>
          )}
        </div>

        {/* Big Tap Reaction Pad */}
        <div className="pt-2">
          {gameState === 'WAITING' || gameState === 'TRIGGERED' ? (
            <button
              onClick={handleTapReaction}
              className={`w-full py-5 rounded-xl font-tech font-extrabold text-base uppercase tracking-wider transition cursor-pointer active:scale-95 shadow-lg ${
                gameState === 'TRIGGERED'
                  ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-cyan-400/50'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              {gameState === 'TRIGGERED' ? '立即闪现躲避！！' : '屏息凝神蓄力中...'}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-tech font-bold text-xs uppercase cursor-pointer"
            >
              确定并继续
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
