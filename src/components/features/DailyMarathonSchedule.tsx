import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  Flame, 
  Zap, 
  Sparkles, 
  ShieldCheck, 
  HeartPulse, 
  Tv, 
  Swords, 
  Wallet, 
  ChevronRight, 
  CheckCircle2, 
  TrendingUp, 
  Trophy, 
  Video, 
  Coffee, 
  Activity,
  AlertTriangle
} from 'lucide-react';
import { soundEngine } from '../../utils/audio';
import { PlayerStats, GamePhase, CareerHealthState } from '../../types/game';

export type ScheduleBlockId = 
  | 'MORNING_INTEL' 
  | 'LADDER_GRIND' 
  | 'MIDDAY_PHYSIO' 
  | 'TEAM_SCRIMS' 
  | 'TOURNAMENT_STAGE' 
  | 'NIGHT_STREAM' 
  | 'NIGHT_AUDIT';

export interface DailyBlockConfig {
  id: ScheduleBlockId;
  timeRange: string;
  name: string;
  shortName: string;
  desc: string;
  buffLabel: string;
  themeColor: string;
  borderColor: string;
  bgGradient: string;
  textColor: string;
  icon: React.ElementType;
  targetPath: 'WEALTH' | 'GOAT' | 'DYNASTY' | 'HEALTH';
  pathBadge: string;
  recommendedActionLabel: string;
}

export const DAILY_SCHEDULE_BLOCKS: DailyBlockConfig[] = [
  {
    id: 'MORNING_INTEL',
    timeRange: '08:00 - 10:00',
    name: '晨间情报与录像复盘',
    shortName: '情报复盘',
    desc: '研讨跨赛区经典名局视野差，审阅外设赞助与转会行情',
    buffLabel: '战术洞察点积累 +35% · 外设谈判成功率 +20%',
    themeColor: 'indigo',
    borderColor: 'border-indigo-500/40',
    bgGradient: 'from-indigo-950/60 via-slate-900 to-slate-950',
    textColor: 'text-indigo-300',
    icon: Video,
    targetPath: 'GOAT',
    pathBadge: '🧠 战术洞察',
    recommendedActionLabel: '执行逐帧复盘'
  },
  {
    id: 'LADDER_GRIND',
    timeRange: '10:00 - 13:00',
    name: '高强排位冲分与极速死斗',
    shortName: '排位死斗',
    desc: '单排冲击万分天梯排位 (10,000 LP)，毫秒金身反杀宿敌',
    buffLabel: '排位胜场 LP 提振 +25% · 连胜积分翻倍',
    themeColor: 'cyan',
    borderColor: 'border-cyan-500/40',
    bgGradient: 'from-cyan-950/60 via-slate-900 to-slate-950',
    textColor: 'text-cyan-300',
    icon: Swords,
    targetPath: 'GOAT',
    pathBadge: '⚡ 个人登顶',
    recommendedActionLabel: '极限微操死斗'
  },
  {
    id: 'MIDDAY_PHYSIO',
    timeRange: '13:00 - 14:30',
    name: '午间身心康复与理疗排酸',
    shortName: '队医理疗',
    desc: '队医专项理疗排空积劳，特调咖啡快速拉满专注度',
    buffLabel: '手腕积劳 (Strain) 排空速度 +60% · 阻断职业病 RSI',
    themeColor: 'rose',
    borderColor: 'border-rose-500/40',
    bgGradient: 'from-rose-950/60 via-slate-900 to-slate-950',
    textColor: 'text-rose-300',
    icon: HeartPulse,
    targetPath: 'HEALTH',
    pathBadge: '🩺 身体护甲',
    recommendedActionLabel: '呼叫理疗诊所'
  },
  {
    id: 'TEAM_SCRIMS',
    timeRange: '14:30 - 18:00',
    name: '豪门战队训练赛与BP推演',
    shortName: '训练赛演练',
    desc: '与国际顶尖豪门打 BO3 训练赛，推演版本阵容体系',
    buffLabel: '战队化学反应评分 +15 · 团队契合度飙升',
    themeColor: 'teal',
    borderColor: 'border-teal-500/40',
    bgGradient: 'from-teal-950/60 via-slate-900 to-slate-950',
    textColor: 'text-teal-300',
    icon: Activity,
    targetPath: 'DYNASTY',
    pathBadge: '🛡️ 王朝协同',
    recommendedActionLabel: '战术理论推演'
  },
  {
    id: 'TOURNAMENT_STAGE',
    timeRange: '18:00 - 21:00',
    name: '职业大赛正赛与巅峰对决',
    shortName: '联赛正赛',
    desc: '征战赛区联赛与全球总决赛，全网弹幕聚焦争夺世界冠军',
    buffLabel: '冠军奖金 +40% · 本场 MVP 获得概率翻倍',
    themeColor: 'yellow',
    borderColor: 'border-yellow-500/40',
    bgGradient: 'from-amber-950/60 via-slate-900 to-slate-950',
    textColor: 'text-yellow-300',
    icon: Trophy,
    targetPath: 'DYNASTY',
    pathBadge: '🏆 赛场荣光',
    recommendedActionLabel: '征战正赛舞台'
  },
  {
    id: 'NIGHT_STREAM',
    timeRange: '21:00 - 02:00',
    name: '深夜商业直播与财富收割',
    shortName: '商业直播',
    desc: '开启全网教学排位直播，收割百万弹幕打赏与战袍销售',
    buffLabel: '粉丝订阅增长速度翻倍 · 直播打赏分成 +30%',
    themeColor: 'purple',
    borderColor: 'border-purple-500/40',
    bgGradient: 'from-purple-950/60 via-slate-900 to-slate-950',
    textColor: 'text-purple-300',
    icon: Tv,
    targetPath: 'WEALTH',
    pathBadge: '💰 财富吸金',
    recommendedActionLabel: '开启高能直播'
  },
  {
    id: 'NIGHT_AUDIT',
    timeRange: '02:00 - 08:00',
    name: 'CFO财务审计与深度休眠',
    shortName: '金库审计',
    desc: '审阅俱乐部薪资帽与金库现金流，全队进入深度休眠',
    buffLabel: '审计追回企业赞助返点 +$15,000 · 精力专注 100% 重置',
    themeColor: 'emerald',
    borderColor: 'border-emerald-500/40',
    bgGradient: 'from-emerald-950/60 via-slate-900 to-slate-950',
    textColor: 'text-emerald-300',
    icon: Wallet,
    targetPath: 'WEALTH',
    pathBadge: '📈 资本扩张',
    recommendedActionLabel: '执行金库审计'
  }
];

interface DailyMarathonScheduleProps {
  stats: PlayerStats;
  currentPhase: GamePhase;
  onExecuteBlockAction: (blockId: ScheduleBlockId) => void;
  onOpenPhysio?: () => void;
  onOpenBudgetReview?: () => void;
  onOpenLeaderboard?: () => void;
}

export const DailyMarathonSchedule: React.FC<DailyMarathonScheduleProps> = ({
  stats,
  currentPhase,
  onExecuteBlockAction,
  onOpenPhysio,
  onOpenBudgetReview,
  onOpenLeaderboard
}) => {
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number>(1); // Default to LADDER_GRIND
  const [completedBlocksCount, setCompletedBlocksCount] = useState<number>(0);

  const currentBlock = DAILY_SCHEDULE_BLOCKS[currentBlockIndex];
  const IconComponent = currentBlock.icon;

  const health = stats.careerHealth || {
    strain: 15,
    hasRSI: false,
    rsiSeverity: 'none',
    maxMechanics: 100,
    consecutiveGrinds: 0,
    treatmentsCount: 0
  };

  const isStrainHigh = health.strain >= 65 || health.hasRSI;

  const handleAdvanceBlock = () => {
    soundEngine.playClick();
    setCurrentBlockIndex(prev => (prev + 1) % DAILY_SCHEDULE_BLOCKS.length);
    setCompletedBlocksCount(prev => prev + 1);
  };

  return (
    <div className="space-y-2.5 bg-slate-950/90 border border-cyan-500/30 rounded-2xl p-3 shadow-[0_4px_20px_rgba(0,0,0,0.8)] relative overflow-hidden chamfer-card">
      
      {/* Header bar: Marathon Schedule Hub */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
            <Clock className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-tech font-extrabold text-slate-100 tracking-wide">
                20小时全天候职业作息中枢 · MARATHON SCHEDULE
              </span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-500/30 text-[9px] font-tech text-cyan-300">
                时段 {currentBlockIndex + 1}/{DAILY_SCHEDULE_BLOCKS.length}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">
              深度经营作息表：按日程行动享专有时段效率倍率提振
            </p>
          </div>
        </div>

        {/* Advance Block Button */}
        <button
          onClick={handleAdvanceBlock}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-tech font-bold border border-slate-700/80 transition flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
          title="推进至下一个职业日程时段"
        >
          <span>推进时段</span>
          <ChevronRight className="w-3 h-3 text-cyan-400" />
        </button>
      </div>

      {/* Timeline Steps Indicator */}
      <div className="grid grid-cols-7 gap-1 pt-1">
        {DAILY_SCHEDULE_BLOCKS.map((block, idx) => {
          const isActive = idx === currentBlockIndex;
          const isPast = idx < currentBlockIndex;
          return (
            <button
              key={block.id}
              onClick={() => {
                soundEngine.playClick();
                setCurrentBlockIndex(idx);
              }}
              className={`py-1 px-0.5 rounded text-center transition-all cursor-pointer border ${
                isActive
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)] font-bold'
                  : isPast
                    ? 'bg-slate-900/60 border-slate-800 text-slate-500'
                    : 'bg-slate-900/40 border-slate-800/60 text-slate-400 hover:bg-slate-850'
              }`}
            >
              <div className="text-[8px] font-tech font-bold truncate leading-tight">
                {block.shortName}
              </div>
              <div className="text-[7px] text-slate-500 font-tech leading-tight mt-0.5 truncate">
                {block.timeRange.split(' - ')[0]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Schedule Block Card */}
      <div className={`p-3 rounded-xl bg-gradient-to-br ${currentBlock.bgGradient} border ${currentBlock.borderColor} space-y-2 relative overflow-hidden`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl bg-slate-950/80 border border-slate-700 ${currentBlock.textColor}`}>
              <IconComponent className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-tech font-bold text-slate-100">
                  {currentBlock.name}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-slate-950 text-[9px] font-tech text-slate-300 border border-slate-800">
                  {currentBlock.timeRange}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-slate-900 text-[8.5px] font-tech text-amber-300 border border-amber-500/30">
                  {currentBlock.pathBadge}
                </span>
              </div>
              <p className="text-[10px] text-slate-300 font-sans mt-0.5 leading-relaxed">
                {currentBlock.desc}
              </p>
            </div>
          </div>
        </div>

        {/* Buff Tag */}
        <div className="px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-[10px] font-tech">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <Zap className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>时段契合加成: {currentBlock.buffLabel}</span>
          </div>
          <span className="text-[9px] text-slate-400 font-sans">⚡ +25% 效率</span>
        </div>

        {/* Action Trigger */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-[9.5px] font-tech text-slate-400">
            已完成作息轮次: <span className="text-cyan-300 font-bold">{completedBlocksCount}</span> 次
          </div>

          <button
            onClick={() => {
              onExecuteBlockAction(currentBlock.id);
            }}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 active:scale-95 text-slate-950 text-xs font-tech font-bold transition flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.3)]"
          >
            <span>{currentBlock.recommendedActionLabel}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Strict Health Warning Strip (If Strain is High) */}
      {isStrainHigh && (
        <div className="px-3 py-2 rounded-xl bg-rose-950/50 border border-rose-500/50 flex items-center justify-between text-xs animate-pulse">
          <div className="flex items-center gap-2 text-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <div className="text-[10.5px]">
              <span className="font-bold">⚠️ 严苛疲劳警告：</span>
              手部积劳负荷达 <strong className="text-rose-300">{health.strain}%</strong>
              {health.hasRSI && ` · 已确诊【${health.rsiSeverity}】腱鞘炎(上限${health.maxMechanics})`}！
            </div>
          </div>

          {onOpenPhysio && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenPhysio();
              }}
              className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 text-[10px] font-tech font-bold transition shrink-0 cursor-pointer shadow-sm"
            >
              即刻理疗 →
            </button>
          )}
        </div>
      )}

      {/* Tri-Goal Quick Metrics Footer */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80 text-[10px] font-tech">
        {/* Wealth */}
        <div 
          onClick={onOpenBudgetReview}
          className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/40 cursor-pointer transition flex items-center justify-between"
          title="查看金库资产与富豪榜"
        >
          <div className="flex items-center gap-1 text-slate-400">
            <Wallet className="w-3 h-3 text-amber-400" />
            <span>财富榜</span>
          </div>
          <span className="font-bold text-amber-300 font-code">
            ${(stats.money / 1000).toFixed(0)}k
          </span>
        </div>

        {/* Solo GOAT */}
        <div 
          onClick={onOpenLeaderboard}
          className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 cursor-pointer transition flex items-center justify-between"
          title="查看全服天梯 GOAT 胜点"
        >
          <div className="flex items-center gap-1 text-slate-400">
            <Trophy className="w-3 h-3 text-cyan-400" />
            <span>GOAT胜点</span>
          </div>
          <span className="font-bold text-cyan-300 font-code">
            {stats.lp} LP
          </span>
        </div>

        {/* Dynasty */}
        <div 
          className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between"
          title="手部健康度"
        >
          <div className="flex items-center gap-1 text-slate-400">
            <HeartPulse className="w-3 h-3 text-rose-400" />
            <span>肌肉积劳</span>
          </div>
          <span className={`font-bold font-code ${health.strain > 60 ? 'text-rose-400' : 'text-emerald-300'}`}>
            {health.strain}%
          </span>
        </div>
      </div>

    </div>
  );
};
