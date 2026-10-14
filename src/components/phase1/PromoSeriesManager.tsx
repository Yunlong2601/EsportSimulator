import React, { useState } from 'react';
import { PlayerStats, RankTier, PromoSeriesState } from '../../types/game';
import { 
  Trophy, 
  Swords, 
  Flame, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Zap, 
  ChevronRight, 
  ShieldAlert, 
  RotateCcw,
  Sparkles,
  Crown
} from 'lucide-react';
import { PROMO_TIER_CONFIG } from '../../hooks/useGameState';

interface PromoSeriesManagerProps {
  stats: PlayerStats;
  onStartPromoMatch: () => void;
  onTriggerPromoSeries?: (targetTier?: RankTier, format?: 'BO3' | 'BO5') => void;
  onForfeitPromoSeries?: () => void;
}

export const PromoSeriesManager: React.FC<PromoSeriesManagerProps> = ({
  stats,
  onStartPromoMatch,
  onTriggerPromoSeries,
  onForfeitPromoSeries
}) => {
  const [showForfeitConfirm, setShowForfeitConfirm] = useState<boolean>(false);
  const [selectedFormat, setSelectedFormat] = useState<'BO3' | 'BO5'>('BO3');

  const rankNamesCn: Record<RankTier, string> = {
    Iron: '坚韧黑铁',
    Bronze: '英勇黄铜',
    Silver: '不屈白银',
    Gold: '荣耀黄金',
    Platinum: '华贵铂金',
    Emerald: '流光翡翠',
    Diamond: '璀璨钻石',
    Master: '超凡大师',
    Grandmaster: '傲世宗师',
    Challenger: '最强王者'
  };

  const promo = stats.promoSeries;
  const isPromoActive = Boolean(promo && promo.active);
  const currentTier = stats.rankTier;
  const config = PROMO_TIER_CONFIG[currentTier];
  const targetTier = promo?.targetTier || config?.nextTier || 'Platinum';
  const format = promo?.format || (targetTier === 'Master' || targetTier === 'Grandmaster' || targetTier === 'Challenger' ? 'BO5' : 'BO3');
  const maxGames = promo?.maxGames || (format === 'BO5' ? 5 : 3);
  const requiredWins = promo?.requiredWins || (format === 'BO5' ? 3 : 2);
  const wins = promo?.wins || 0;
  const losses = promo?.losses || 0;
  const consecutiveWins = promo?.consecutiveWins || 0;
  const scoreTrackerStr = `${wins}-${losses}`;

  // Series status calculation
  const isMatchPoint = isPromoActive && wins === requiredWins - 1;
  const isEliminationPoint = isPromoActive && losses === maxGames - requiredWins;

  return (
    <div className="rounded-2xl border bg-slate-950/90 shadow-xl overflow-hidden transition-all duration-300 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
      {/* Header bar */}
      <div className="px-3.5 py-2.5 bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-900/60 border-b border-amber-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Trophy className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-tech font-extrabold text-xs text-white uppercase tracking-wider">
                段位生死晋级赛管理器 (Promo Series Manager)
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-code font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40">
                {format}
              </span>
            </div>
            <div className="text-[10px] text-amber-300/80 font-tech">
              {isPromoActive ? (
                <span>
                  当前正在冲刺: <span className="text-white font-bold">{rankNamesCn[currentTier]}</span> ➔ <span className="text-amber-300 font-extrabold">{rankNamesCn[targetTier]}</span>
                </span>
              ) : (
                <span>
                  天梯晋级席位争夺: 目标 <span className="text-amber-300 font-bold">{rankNamesCn[targetTier]}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right badge */}
        {isPromoActive ? (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-tech font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse flex items-center gap-1">
            <Flame className="w-3 h-3 text-emerald-400" />
            <span>进行中</span>
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-tech font-bold bg-slate-800 text-slate-300 border border-slate-700">
            冲榜备战
          </span>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-3.5 space-y-3">
        {isPromoActive ? (
          <>
            {/* Visual Indicator: Huge Score Tracker (e.g. 2-0 / 1-0 / 1-1) */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-slate-900/90 via-slate-900 to-slate-950 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Score Tracker Display */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center justify-center bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 shadow-inner">
                  <div className="text-[9px] font-tech text-slate-400 uppercase tracking-widest">
                    系列赛比分 (SCORE)
                  </div>
                  <div className="flex items-center gap-1.5 font-code font-black text-2xl sm:text-3xl tracking-wider">
                    <span className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
                      {wins}
                    </span>
                    <span className="text-slate-600">:</span>
                    <span className="text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]">
                      {losses}
                    </span>
                  </div>
                  <div className="text-[10px] font-code font-bold text-cyan-300 bg-cyan-950/60 px-1.5 rounded mt-0.5 border border-cyan-500/30">
                    比分: {scoreTrackerStr}
                  </div>
                </div>

                {/* Series Status & Rule */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-tech font-bold text-white">
                      {rankNamesCn[targetTier]} 生死战
                    </span>
                    <span className="text-[10px] font-code text-amber-300 bg-amber-950/60 px-1.5 rounded border border-amber-500/30">
                      需赢下 {requiredWins} 局 / 斩获连续击破
                    </span>
                  </div>

                  <div className="text-[11px] font-tech text-slate-300">
                    {isMatchPoint ? (
                      <span className="text-amber-300 font-extrabold flex items-center gap-1 animate-pulse">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        🔥 赛点决胜局！下一局获胜即可荣登【{rankNamesCn[targetTier]}】！
                      </span>
                    ) : isEliminationPoint ? (
                      <span className="text-rose-400 font-extrabold flex items-center gap-1 animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        ⚠️ 绝境生死战！退无可退，必须拿下本局！
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        连胜战绩: <span className="text-emerald-400 font-bold">{consecutiveWins} 连胜</span> (目标: {requiredWins} 胜或 2 连胜绝杀)
                      </span>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-400">
                    晋级奖赏: 荣登【{rankNamesCn[targetTier]}】、知名度 +15、球探关注度 +25%、+25 LP
                  </div>
                </div>
              </div>

              {/* Game Matchup Visual Nodes (Interactive Slot Tracker) */}
              <div className="flex items-center gap-1.5 self-center sm:self-auto">
                {Array.from({ length: maxGames }).map((_, i) => {
                  const outcome = promo?.history[i];
                  const isCurrentGame = i === (promo?.history.length || 0);

                  return (
                    <div
                      key={i}
                      className={`relative flex flex-col items-center justify-center w-12 h-14 rounded-xl border transition-all duration-300 ${
                        outcome === 'WIN'
                          ? 'bg-emerald-950/50 border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.3)] text-emerald-300'
                          : outcome === 'LOSS'
                          ? 'bg-rose-950/50 border-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.2)] text-rose-300'
                          : isCurrentGame
                          ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] text-amber-300 animate-pulse scale-105'
                          : 'bg-slate-900/60 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="text-[9px] font-code font-bold uppercase">
                        第{i + 1}局
                      </div>

                      <div className="my-0.5">
                        {outcome === 'WIN' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : outcome === 'LOSS' ? (
                          <XCircle className="w-4 h-4 text-rose-400" />
                        ) : isCurrentGame ? (
                          <Swords className="w-4 h-4 text-amber-400 animate-bounce" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-700 inline-block" />
                        )}
                      </div>

                      <div className="text-[9px] font-tech font-extrabold">
                        {outcome === 'WIN'
                          ? '胜 (W)'
                          : outcome === 'LOSS'
                          ? '负 (L)'
                          : isCurrentGame
                          ? '开战'
                          : '待定'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions Bar inside Active Promo */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={onStartPromoMatch}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-tech font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer active:scale-98 transition"
              >
                <Swords className="w-4 h-4 text-slate-950" />
                <span>立即进入【晋级赛生死局】(第 {(promo?.history.length || 0) + 1} 局)</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowForfeitConfirm(true)}
                className="w-full sm:w-auto py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-rose-300 text-xs font-tech font-bold cursor-pointer transition flex items-center justify-center gap-1"
                title="放弃本轮晋级赛 (-20 LP 退出)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>放弃本轮晋级</span>
              </button>
            </div>

            {/* Forfeit Confirm Modal */}
            {showForfeitConfirm && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/60 text-xs text-rose-200 space-y-2 animate-fadeIn">
                <div className="flex items-center gap-1.5 font-bold font-tech text-rose-300">
                  <AlertTriangle className="w-4 h-4" />
                  <span>确定要放弃当前晋级赛吗？</span>
                </div>
                <p className="text-[11px] text-rose-300/80">
                  主动退出将重置本次晋级赛进度（当前比分 {scoreTrackerStr} 将作废），并扣除 20 LP 回退至 90 LP。
                </p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setShowForfeitConfirm(false)}
                    className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-[11px] font-tech font-bold hover:bg-slate-700 cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => {
                      setShowForfeitConfirm(false);
                      if (onForfeitPromoSeries) onForfeitPromoSeries();
                    }}
                    className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-tech font-bold cursor-pointer"
                  >
                    确认放弃并扣除 20 LP
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* INACTIVE: Promotional Roadmap & Practice Trigger */
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-tech font-bold text-white">
                    当前段位: <span className="text-amber-400 font-extrabold">{rankNamesCn[currentTier]}</span>
                  </span>
                  <span className="text-slate-500">➔</span>
                  <span className="text-xs font-tech font-bold text-cyan-300">
                    晋级目标: <span className="font-extrabold">{rankNamesCn[targetTier]}</span>
                  </span>
                </div>

                <div className="text-[11px] font-code text-slate-400 flex items-center gap-1.5">
                  <span>晋级门槛:</span>
                  <span className="text-cyan-300 font-bold">{stats.lp} LP</span>
                  <span>/</span>
                  <span className="text-amber-300 font-bold">{config?.thresholdLp || 400} LP</span>
                  <span className="text-slate-500">
                    ({Math.max(0, (config?.thresholdLp || 400) - stats.lp)} LP 触发 {config?.format || 'BO3'} 生死晋级赛)
                  </span>
                </div>

                <div className="text-[10px] text-slate-400">
                  晋级规则: 积攒满额胜点时自动触发，BO3 需赢下 2 局 (2-0 绝杀或 2-1)；大师/宗师/王者触发 BO5 决战 (需 3 胜)！
                </div>
              </div>

              {/* Direct Promotion Test / Launch CTA */}
              <div className="flex flex-col sm:flex-row items-center gap-1.5 w-full sm:w-auto">
                <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
                  <button
                    onClick={() => setSelectedFormat('BO3')}
                    className={`px-2 py-1 text-[10px] font-tech font-bold rounded cursor-pointer transition ${
                      selectedFormat === 'BO3'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    BO3 (2胜)
                  </button>
                  <button
                    onClick={() => setSelectedFormat('BO5')}
                    className={`px-2 py-1 text-[10px] font-tech font-bold rounded cursor-pointer transition ${
                      selectedFormat === 'BO5'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    BO5 (3胜)
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (onTriggerPromoSeries) {
                      onTriggerPromoSeries(targetTier, selectedFormat);
                    }
                  }}
                  className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-tech font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
                  title="立即发起生死晋级赛测试，体验 BO3 / BO5 进度追踪"
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>发起【{rankNamesCn[targetTier]} {selectedFormat}】晋级生死赛</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
