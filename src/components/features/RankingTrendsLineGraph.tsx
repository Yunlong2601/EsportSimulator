import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  HelpCircle,
  BarChart2,
  Calendar,
  Layers,
  Flame,
  Info
} from 'lucide-react';
import { GlobalTeamPowerRanking, WeeklyRankPoint } from '../../types/game';
import { getTeamRankTrends } from '../../data/globalPowerRankingsData';
import { soundEngine } from '../../utils/audio';

interface RankingTrendsLineGraphProps {
  team: GlobalTeamPowerRanking;
  compact?: boolean;
}

export const RankingTrendsLineGraph: React.FC<RankingTrendsLineGraphProps> = ({
  team,
  compact = false
}) => {
  const trends: WeeklyRankPoint[] = getTeamRankTrends(team);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(trends.length - 1);
  const [metricMode, setMetricMode] = useState<'RANK' | 'PWR'>('RANK');

  if (!trends || trends.length < 2) return null;

  // Calculate 5-week net trajectory (Week 1 to Week 5)
  const firstRank = trends[0].rank;
  const currentRank = trends[trends.length - 1].rank;
  const rankDelta = firstRank - currentRank; // positive = climbed ranks (e.g. #4 to #1 is +3)

  const firstPwr = trends[0].powerRating;
  const currentPwr = trends[trends.length - 1].powerRating;
  const pwrDelta = Math.round((currentPwr - firstPwr) * 10) / 10;

  // SVG Dimension & Coordinate setup
  const svgWidth = compact ? 260 : 480;
  const svgHeight = compact ? 90 : 160;
  const paddingX = compact ? 28 : 45;
  const paddingTop = compact ? 18 : 25;
  const paddingBottom = compact ? 22 : 32;

  const innerWidth = svgWidth - paddingX * 2;
  const innerHeight = svgHeight - paddingTop - paddingBottom;

  // For RANK metric: Inverted Y-axis! (Rank 1 at TOP, higher rank numbers at BOTTOM)
  // Determine min & max ranks for scale
  const allRanks = trends.map(t => t.rank);
  const minRank = Math.min(...allRanks);
  const maxRank = Math.max(...allRanks);
  // Ensure at least a range of 3 to avoid flat single line distortion
  const displayMinRank = Math.max(1, minRank - 1);
  const displayMaxRank = Math.max(displayMinRank + 3, maxRank + 1);

  // For PWR metric: Normal Y-axis (higher PWR at TOP)
  const allPwrs = trends.map(t => t.powerRating);
  const minPwr = Math.min(...allPwrs);
  const maxPwr = Math.max(...allPwrs);
  const displayMinPwr = Math.max(80, Math.floor(minPwr - 0.5));
  const displayMaxPwr = Math.min(100, Math.ceil(maxPwr + 0.5));

  // Compute (x, y) coordinates for each point
  const points = trends.map((pt, i) => {
    const x = paddingX + (i / (trends.length - 1)) * innerWidth;
    let y = 0;

    if (metricMode === 'RANK') {
      // Inverted: displayMinRank (e.g. 1) -> y = paddingTop
      const fraction = (pt.rank - displayMinRank) / (displayMaxRank - displayMinRank);
      y = paddingTop + fraction * innerHeight;
    } else {
      // Normal: displayMaxPwr -> y = paddingTop, displayMinPwr -> y = paddingTop + innerHeight
      const fraction = (displayMaxPwr - pt.powerRating) / (displayMaxPwr - displayMinPwr);
      y = paddingTop + fraction * innerHeight;
    }

    return { x, y, pt, i };
  });

  // SVG Path generation (smooth cubic bezier curve or crisp polyline)
  const pathD = points.reduce((acc, curr, index) => {
    if (index === 0) return `M ${curr.x} ${curr.y}`;
    const prev = points[index - 1];
    // Gentle cubic bezier control points
    const cpX1 = prev.x + (curr.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (curr.x - prev.x) / 2;
    const cpY2 = curr.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
  }, '');

  // Fill area under path
  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingBottom} L ${points[0].x} ${svgHeight - paddingBottom} Z`;

  // Color theme based on trajectory
  const isRising = rankDelta > 0;
  const isFalling = rankDelta < 0;
  const isFlat = rankDelta === 0;

  const strokeColor = isRising ? '#00f0ff' : isFalling ? '#fb7185' : '#a78bfa';
  const glowColor = isRising ? 'rgba(0, 240, 255, 0.4)' : isFalling ? 'rgba(251, 113, 133, 0.4)' : 'rgba(167, 139, 250, 0.4)';
  const gradStopStart = isRising ? 'rgba(0, 240, 255, 0.25)' : isFalling ? 'rgba(251, 113, 133, 0.25)' : 'rgba(167, 139, 250, 0.25)';

  const selectedPoint = points[selectedWeekIndex] || points[points.length - 1];

  // Week-over-week delta for selected point
  let selectedDelta = 0;
  if (selectedWeekIndex > 0) {
    selectedDelta = trends[selectedWeekIndex - 1].rank - selectedPoint.pt.rank;
  }

  return (
    <div className="rounded-xl bg-slate-950/90 border border-cyan-500/30 overflow-hidden shadow-inner">
      {/* Top Header / Mode Switcher */}
      <div className="p-3 border-b border-slate-800/80 bg-gradient-to-r from-slate-950 via-[#0a0e17] to-slate-950 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-tech font-bold text-white tracking-wide">
                近 5 周战力走势分析 (Ranking Trends)
              </span>
              {isRising && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-tech font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-0.5">
                  <TrendingUp className="w-2.5 h-2.5 text-cyan-400" />
                  ▲ 跃升 {rankDelta} 名
                </span>
              )}
              {isFalling && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-tech font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-0.5">
                  <TrendingDown className="w-2.5 h-2.5 text-rose-400" />
                  ▼ 下滑 {Math.abs(rankDelta)} 名
                </span>
              )}
              {isFlat && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-tech font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-0.5">
                  <Minus className="w-2.5 h-2.5 text-purple-400" />
                  — 维持原位
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-sans">
              全赛区五周动态排名折线 · 点击节点洞悉阶段胜率与战术复盘
            </p>
          </div>
        </div>

        {/* Metric Toggle */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-900 rounded-lg border border-slate-800 text-[10px] font-tech">
          <button
            onClick={() => {
              soundEngine.playClick();
              setMetricMode('RANK');
            }}
            className={`px-2 py-0.5 rounded cursor-pointer transition ${
              metricMode === 'RANK'
                ? 'bg-cyan-500/25 text-cyan-300 font-bold border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            全球排位 (#)
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              setMetricMode('PWR');
            }}
            className={`px-2 py-0.5 rounded cursor-pointer transition ${
              metricMode === 'PWR'
                ? 'bg-amber-500/25 text-amber-300 font-bold border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            战力指数 (PWR)
          </button>
        </div>
      </div>

      {/* Interactive Line Graph SVG Canvas */}
      <div className="relative p-2 sm:p-3 flex justify-center bg-radial from-slate-900/40 to-slate-950">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto max-h-[170px] overflow-visible select-none"
        >
          <defs>
            <linearGradient id={`trendGrad-${team.teamId}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.8" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="1" />
            </linearGradient>

            <linearGradient id={`areaGrad-${team.teamId}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={gradStopStart} />
              <stop offset="100%" stopColor="rgba(0, 0, 0, 0.0)" />
            </linearGradient>

            <filter id={`neonGlow-${team.teamId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={glowColor} floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Horizontal Background Gridlines */}
          {[0, 0.33, 0.66, 1].map((ratio, idx) => {
            const y = paddingTop + ratio * innerHeight;
            let label = '';
            if (metricMode === 'RANK') {
              const r = Math.round(displayMinRank + ratio * (displayMaxRank - displayMinRank));
              label = `#${r}`;
            } else {
              const p = Math.round((displayMaxPwr - ratio * (displayMaxPwr - displayMinPwr)) * 10) / 10;
              label = `${p}`;
            }

            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="#334155"
                  strokeWidth="0.75"
                  strokeDasharray="3 3"
                  strokeOpacity="0.4"
                />
                <text
                  x={paddingX - 6}
                  y={y + 3}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill={`url(#areaGrad-${team.teamId})`} />

          {/* The Trend Line */}
          <path
            d={pathD}
            fill="none"
            stroke={`url(#trendGrad-${team.teamId})`}
            strokeWidth={compact ? '2' : '2.5'}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#neonGlow-${team.teamId})`}
          />

          {/* Vertical Guides & Clickable Data Points */}
          {points.map((p) => {
            const isSelected = p.i === selectedWeekIndex;
            const isLatest = p.i === points.length - 1;

            return (
              <g
                key={p.i}
                className="cursor-pointer"
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedWeekIndex(p.i);
                }}
              >
                {/* Vertical Dotted Guide on Selection */}
                {isSelected && (
                  <line
                    x1={p.x}
                    y1={paddingTop}
                    x2={p.x}
                    y2={svgHeight - paddingBottom}
                    stroke={strokeColor}
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    strokeOpacity="0.6"
                  />
                )}

                {/* X-Axis Week Label */}
                <text
                  x={p.x}
                  y={svgHeight - paddingBottom + 14}
                  textAnchor="middle"
                  fill={isSelected ? '#00f0ff' : '#94a3b8'}
                  fontSize={isSelected ? '9' : '8'}
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  fontFamily="monospace"
                >
                  {p.pt.weekShort}
                </text>

                {/* Outer Ring / Glow for selected or latest */}
                {isSelected && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={compact ? '6' : '8'}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="1.5"
                    strokeOpacity="0.8"
                    className="animate-pulse"
                  />
                )}

                {/* Data Dot */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isSelected ? 4.5 : isLatest ? 4 : 3}
                  fill={isSelected ? '#ffffff' : strokeColor}
                  stroke="#0a0e17"
                  strokeWidth="1.5"
                />

                {/* Value Badge above Node */}
                <text
                  x={p.x}
                  y={p.y - 7}
                  textAnchor="middle"
                  fill={isSelected ? '#ffffff' : '#e2e8f0'}
                  fontSize={isSelected ? '9' : '8'}
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {metricMode === 'RANK' ? `#${p.pt.rank}` : p.pt.powerRating}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Week Scouting Intel Drawer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/60 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-1 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="font-tech font-bold text-white flex items-center gap-1">
              <Calendar className="w-3 h-3 text-cyan-400" />
              <span>{selectedPoint.pt.week}</span>
            </span>

            <span className="px-1.5 py-0.2 rounded font-code font-black text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              全球第 {selectedPoint.pt.rank} 名
            </span>

            {selectedWeekIndex > 0 && (
              <span className={`text-[10px] font-code font-bold ${
                selectedDelta > 0 ? 'text-emerald-400' : selectedDelta < 0 ? 'text-rose-400' : 'text-slate-400'
              }`}>
                {selectedDelta > 0 ? `▲ 上升 ${selectedDelta} 名` : selectedDelta < 0 ? `▼ 下降 ${Math.abs(selectedDelta)} 名` : '— 排名持平'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 font-code text-[10px]">
            <span className="text-slate-400">战力: <strong className="text-amber-400">{selectedPoint.pt.powerRating}</strong></span>
            {selectedPoint.pt.record && (
              <span className="text-slate-400">周战绩: <strong className="text-emerald-400">{selectedPoint.pt.record}</strong></span>
            )}
          </div>
        </div>

        {/* Scouting Narrative Note */}
        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-sans leading-relaxed flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-slate-400 font-bold">【阶段态势速记】：</span>
            <span>{selectedPoint.pt.scoutingNote || '战队状态进入关键调整期，需持续追踪。'}</span>
          </div>
        </div>

        {/* Global 5-Week Scouting Verdict Recommendation */}
        <div className="pt-0.5 text-[10px] text-slate-400 font-sans flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-amber-400">💡 球探研判：</span>
            <span>
              {isRising
                ? `该队近5周整体处于强劲上升通道（#${firstRank} ➔ #${currentRank}，战力+${pwrDelta}），士气正盛，正赛交锋需重点拆解其开局体系！`
                : isFalling
                ? `该队近5周处于战术阵痛期（#${firstRank} ➔ #${currentRank}），失误率有所增加，若进行训练赛交手是夺取胜势的绝佳窗口！`
                : `该队近5周表现恒定无大起大落（稳定在第 ${currentRank} 名上下），具备极高战术容错率与老牌豪门稳定性。`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
