import React from 'react';
import { 
  Moon, 
  Coffee, 
  Swords, 
  Brain, 
  Sparkles, 
  ChevronUp,
  Radio,
  Crosshair,
  Wallet,
  HeartPulse
} from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { PlayerStats, GamePhase } from '../types/game';

interface CommandDeckProps {
  stats: PlayerStats;
  currentPhase: GamePhase;
  onRest: () => void;
  onCoffee: () => void;
  onReflexDuel: () => void;
  onStream?: () => void;
  onScout?: () => void;
  onBudgetReview?: () => void;
  onOpenPhysio?: () => void;
  isActionsHubOpen?: boolean;
  onToggleActionsHub?: () => void;
}

export const CommandDeck: React.FC<CommandDeckProps> = ({
  stats,
  currentPhase,
  onRest,
  onCoffee,
  onReflexDuel,
  onStream,
  onScout,
  onBudgetReview,
  onOpenPhysio,
  isActionsHubOpen = false,
  onToggleActionsHub
}) => {
  const focus = stats.focus ?? 100;
  const energy = stats.energy ?? 100;
  const health = stats.careerHealth || { strain: 0, hasRSI: false, rsiSeverity: 'none', maxMechanics: 100 };
  const isHighStrain = health.strain >= 60 || health.hasRSI;
  const isFatigued = focus < 30 || energy < 25 || isHighStrain;
  const isOptimal = focus >= 75 && energy >= 70 && health.strain < 35 && !health.hasRSI;

  // Adapt labels & icons per Phase (including dynamic 4th action)
  const getPhaseConfig = () => {
    switch (currentPhase) {
      case 2:
        return {
          restLabel: '休整',
          restFullLabel: '赛前休整',
          restDesc: '清空赛前压力，恢复精力与专注',
          coffeeLabel: '咖啡',
          coffeeFullLabel: '战术咖啡',
          coffeeDesc: '快速充能，备战高强度BP博弈',
          duelLabel: '微操',
          duelFullLabel: '极限微操',
          duelDesc: '毫秒级闪现金身反杀，夺取赛前胜势',
          // 4th Dynamic Action: Scout in Phase 2
          action4Id: 'scout',
          action4Label: '侦察',
          action4FullLabel: '战术侦察',
          action4Desc: '全球战队实力榜与选手隐秘情报数据库',
          action4Icon: Crosshair,
          action4Handler: onScout,
          action4Style: 'bg-teal-950/70 hover:bg-teal-900/80 border-teal-500/40 text-teal-200 hover:border-teal-400 shadow-[0_0_12px_rgba(20,184,166,0.2)]',
          action4IconColor: 'text-teal-400',
          tag: '职业赛备战台'
        };
      case 3:
        return {
          restLabel: '休整',
          restFullLabel: '全队疗愈',
          restDesc: '基地理疗舱全员充能，恢复状态',
          coffeeLabel: '能量',
          coffeeFullLabel: '能量补给',
          coffeeDesc: '全员特调补给，激发王朝协同',
          duelLabel: '演习',
          duelFullLabel: '巅峰演习',
          duelDesc: '世界赛总决赛1v1死斗演习',
          // 4th Dynamic Action: Budget Review in Phase 3
          action4Id: 'budget',
          action4Label: '审阅',
          action4FullLabel: '预算审阅',
          action4Desc: '审阅俱乐部薪资帽、赞助商现金流与金库财务状况',
          action4Icon: Wallet,
          action4Handler: onBudgetReview,
          action4Style: 'bg-amber-950/70 hover:bg-amber-900/80 border-amber-500/40 text-amber-200 hover:border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
          action4IconColor: 'text-amber-400',
          tag: '豪门战术舱'
        };
      case 1:
      default:
        return {
          restLabel: '休整',
          restFullLabel: '深度休整',
          restDesc: '深度睡眠，恢复专注度+50%与精力',
          coffeeLabel: '咖啡',
          coffeeFullLabel: '特调咖啡',
          coffeeDesc: '消耗少许金币或库存，瞬间拉满专注',
          duelLabel: '死斗',
          duelFullLabel: '1v1死斗',
          duelDesc: '毫秒级金身闪现对决，豪取LP与声望',
          // 4th Dynamic Action: Stream in Phase 1
          action4Id: 'stream',
          action4Label: '直播',
          action4FullLabel: '直播冲分',
          action4Desc: '开启天梯教学直播，收割粉丝弹幕与丰厚打赏',
          action4Icon: Radio,
          action4Handler: onStream,
          action4Style: 'bg-purple-950/70 hover:bg-purple-900/80 border-purple-500/40 text-purple-200 hover:border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.2)]',
          action4IconColor: 'text-purple-400',
          tag: '天梯指令台'
        };
    }
  };

  const config = getPhaseConfig();
  const Action4Icon = config.action4Icon;

  return (
    <div className="absolute bottom-1.5 left-13 sm:left-14 right-1 sm:right-2 z-20 pointer-events-none select-none">
      <div className="max-w-md mx-auto pointer-events-auto flex flex-col items-center">
        
        {/* Slide-Up Pull Tab: Actions Hub (次级战术行动舱触发抽屉拉手) */}
        {onToggleActionsHub && (
          <button
            onClick={() => {
              soundEngine.playClick();
              onToggleActionsHub();
            }}
            className={`px-3 py-0.5 -mb-0.5 rounded-t-lg border-t border-x text-[9px] font-tech font-bold transition-all flex items-center gap-1.5 cursor-pointer group active:scale-95 shadow-md ${
              isActionsHubOpen
                ? 'bg-cyan-950/95 border-cyan-400 text-cyan-200 shadow-[0_-4px_15px_rgba(6,182,212,0.3)]'
                : 'bg-slate-950/95 border-cyan-500/40 text-cyan-300 hover:text-cyan-100 hover:bg-slate-900 shadow-[0_-3px_12px_rgba(6,182,212,0.15)]'
            }`}
            title="展开次级战术行动舱：复盘录像、装备市场、联络经纪人"
          >
            <Sparkles className="w-2.5 h-2.5 text-cyan-400 group-hover:rotate-45 transition-transform" />
            <span className="tracking-tight">次级行动舱 · ACTIONS</span>
            <ChevronUp className={`w-3 h-3 text-cyan-400 transition-transform duration-300 ${isActionsHubOpen ? 'rotate-180' : ''}`} />
          </button>
        )}

        {/* Floating Chamfered Control Strip */}
        <div className="w-full p-1.5 sm:p-2 bg-slate-950/92 border border-cyan-500/40 shadow-[0_4px_25px_rgba(0,0,0,0.85),0_0_18px_rgba(6,182,212,0.18)] backdrop-blur-md chamfer-card flex items-center justify-between gap-1 sm:gap-1.5 transition-all">
          
          {/* Left Status Chip: Quick Fatigue, Focus & Hand Strain Tracker */}
          <div 
            onClick={() => {
              if (isHighStrain && onOpenPhysio) {
                soundEngine.playClick();
                onOpenPhysio();
              }
            }}
            className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-lg border shrink-0 transition-colors ${
              isHighStrain && onOpenPhysio ? 'cursor-pointer hover:brightness-125' : ''
            } ${
              isHighStrain
                ? 'bg-rose-950/90 border-rose-500/70 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                : isFatigued 
                  ? 'bg-amber-950/80 border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
                  : isOptimal
                    ? 'bg-emerald-950/60 border-emerald-500/40'
                    : 'bg-slate-900/90 border-slate-800'
            }`}
            title={`当前专注度: ${focus}% | 剩余精力: ${energy}% | 手部积劳: ${health.strain}%${health.hasRSI ? ` (确诊${health.rsiSeverity}腱鞘炎)` : ''}${isHighStrain && onOpenPhysio ? ' - 点击前往理疗' : ''}`}
          >
            <div className="relative flex items-center justify-center">
              {isHighStrain ? (
                <HeartPulse className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-rose-400 animate-pulse" />
              ) : (
                <Brain className={`w-3 sm:w-3.5 h-3 sm:h-3.5 ${
                  isFatigued 
                    ? 'text-amber-400 animate-pulse' 
                    : isOptimal 
                      ? 'text-emerald-400' 
                      : 'text-cyan-400'
                }`} />
              )}
              {(isFatigued || isHighStrain) && (
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              )}
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-[7.5px] sm:text-[8px] font-tech text-slate-400 uppercase leading-none">
                  {isHighStrain ? '积劳' : '专注'}
                </span>
                <span className={`text-[9px] sm:text-[10px] font-code font-extrabold leading-none ${
                  isHighStrain
                    ? 'text-rose-400'
                    : isFatigued 
                      ? 'text-amber-400' 
                      : isOptimal 
                        ? 'text-emerald-300' 
                        : 'text-cyan-300'
                }`}>
                  {isHighStrain ? `${health.strain}%` : `${focus}%`}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  isHighStrain
                    ? 'bg-rose-500'
                    : isFatigued 
                      ? 'bg-amber-500' 
                      : isOptimal 
                        ? 'bg-emerald-400' 
                        : 'bg-cyan-400'
                }`} />
                <span className="text-[7px] sm:text-[7.5px] text-slate-400 font-tech leading-none">
                  {health.hasRSI ? '⚠️ RSI' : isHighStrain ? '劳损高' : isFatigued ? '疲劳' : isOptimal ? '巅峰' : '稳定'}
                </span>
              </div>
            </div>
          </div>

          {/* Action 1: Rest (休整) */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onRest();
            }}
            className="flex-1 min-w-0 py-1.5 px-1 sm:px-1.5 rounded-lg bg-indigo-950/70 hover:bg-indigo-900/80 active:scale-95 border border-indigo-500/40 text-indigo-200 text-[9.5px] sm:text-[10px] font-tech font-bold transition flex items-center justify-center gap-0.5 sm:gap-1 cursor-pointer shadow-sm hover:border-indigo-400 chamfer-btn group"
            title={config.restDesc}
          >
            <Moon className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-indigo-400 group-hover:scale-110 transition-transform shrink-0" />
            <span className="truncate tracking-tight font-tech hidden xs:inline">
              {config.restFullLabel}
            </span>
            <span className="truncate tracking-tight font-tech xs:hidden">
              {config.restLabel}
            </span>
          </button>

          {/* Action 2: Coffee (咖啡) */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onCoffee();
            }}
            className="flex-1 min-w-0 py-1.5 px-1 sm:px-1.5 rounded-lg bg-amber-950/70 hover:bg-amber-900/80 active:scale-95 border border-amber-500/40 text-amber-200 text-[9.5px] sm:text-[10px] font-tech font-bold transition flex items-center justify-center gap-0.5 sm:gap-1 cursor-pointer shadow-sm hover:border-amber-400 chamfer-btn group"
            title={config.coffeeDesc}
          >
            <Coffee className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
            <span className="truncate tracking-tight font-tech hidden xs:inline">
              {config.coffeeFullLabel}
            </span>
            <span className="truncate tracking-tight font-tech xs:hidden">
              {config.coffeeLabel}
            </span>
          </button>

          {/* Action 3: Reflex Duel (极速死斗) */}
          <button
            onClick={() => {
              soundEngine.playBaronSteal();
              onReflexDuel();
            }}
            className="flex-1 min-w-0 py-1.5 px-1 sm:px-1.5 rounded-lg bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:brightness-110 active:scale-95 text-slate-950 text-[9.5px] sm:text-[10px] font-tech font-extrabold transition flex items-center justify-center gap-0.5 sm:gap-1 cursor-pointer shadow-[0_0_14px_rgba(6,182,212,0.45)] chamfer-btn group"
            title={config.duelDesc}
          >
            <Swords className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-current group-hover:rotate-12 transition-transform shrink-0" />
            <span className="truncate tracking-tight font-tech hidden xs:inline">
              {config.duelFullLabel}
            </span>
            <span className="truncate tracking-tight font-tech xs:hidden">
              {config.duelLabel}
            </span>
          </button>

          {/* Action 4: Phase-Specific Dynamic Action (Stream in P1, Scout in P2, Budget Review in P3) */}
          <button
            onClick={() => {
              if (currentPhase === 1) {
                soundEngine.playCoin();
              } else if (currentPhase === 2) {
                soundEngine.playClick();
              } else {
                soundEngine.playCoin();
              }
              config.action4Handler?.();
            }}
            className={`flex-1 min-w-0 py-1.5 px-1 sm:px-1.5 rounded-lg active:scale-95 border text-[9.5px] sm:text-[10px] font-tech font-bold transition flex items-center justify-center gap-0.5 sm:gap-1 cursor-pointer chamfer-btn group shadow-sm ${config.action4Style}`}
            title={config.action4Desc}
          >
            <div className="relative flex items-center justify-center shrink-0">
              <Action4Icon className={`w-3 sm:w-3.5 h-3 sm:h-3.5 ${config.action4IconColor} group-hover:scale-110 transition-transform`} />
              {currentPhase === 1 && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              )}
            </div>
            <span className="truncate tracking-tight font-tech hidden xs:inline">
              {config.action4FullLabel}
            </span>
            <span className="truncate tracking-tight font-tech xs:hidden">
              {config.action4Label}
            </span>
          </button>

          {/* Quick Drawer Toggle Button on Deck */}
          {onToggleActionsHub && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onToggleActionsHub();
              }}
              className={`p-1.5 rounded-lg border transition-all flex items-center justify-center cursor-pointer shrink-0 chamfer-btn group ${
                isActionsHubOpen
                  ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'bg-slate-900/90 hover:bg-slate-800 border-cyan-500/30 text-cyan-400 hover:text-cyan-200'
              }`}
              title="展开/收起次级战术行动舱"
            >
              <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5 group-hover:rotate-45 transition-transform" />
            </button>
          )}

        </div>
      </div>
    </div>
  );
};
