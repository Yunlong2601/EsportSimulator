import React, { useState } from 'react';
import {
  Swords,
  Flame,
  Target,
  Crosshair,
  Quote,
  History,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Crown,
  Sparkles,
  Zap
} from 'lucide-react';
import { PlayerStats, RivalryClashLog } from '../../types/game';
import { getTensionStageTitle } from '../../data/rivalryData';
import { soundEngine } from '../../utils/audio';

interface SoloQueueRivalryCardProps {
  stats: PlayerStats;
  onToggleSnipeQueue: () => void;
  onStartMatch: () => void;
}

export const SoloQueueRivalryCard: React.FC<SoloQueueRivalryCardProps> = ({
  stats,
  onToggleSnipeQueue,
  onStartMatch
}) => {
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [isCardExpanded, setIsCardExpanded] = useState<boolean>(true);

  const rivalry = stats.rivalry;
  if (!rivalry) return null;

  const stageMeta = getTensionStageTitle(rivalry.tensionStage);
  const totalClashes = rivalry.playerWins + rivalry.rivalWins;
  const playerWinRate = totalClashes > 0 ? Math.round((rivalry.playerWins / totalClashes) * 100) : 50;
  const latestClash = rivalry.clashHistory && rivalry.clashHistory.length > 0 ? rivalry.clashHistory[0] : null;

  return (
    <>
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/25 border border-rose-500/30 shadow-lg overflow-hidden transition-all">
        {/* Header */}
        <div className="p-3 bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950/40 border-b border-rose-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-600 to-red-800 flex items-center justify-center text-white shadow-md shadow-rose-600/30 border border-rose-400/40">
              <Swords className="w-4 h-4 text-rose-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-tech font-extrabold text-sm text-white tracking-wide">
                  天梯宿命宿敌 · 对垒追踪
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-code font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  RIVALRY
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans">
                锁定峡谷高分段宿怨缠斗与胜负恩怨记录
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                soundEngine.playClick();
                setShowHistoryModal(true);
              }}
              className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white font-tech font-bold text-[10px] border border-slate-700/80 flex items-center gap-1 transition cursor-pointer"
              title="查看宿敌交锋档案"
            >
              <History className="w-3 h-3 text-rose-400" />
              <span>交锋录 ({rivalry.clashHistory?.length || 0})</span>
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                setIsCardExpanded(!isCardExpanded);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title={isCardExpanded ? '折叠' : '展开'}
            >
              {isCardExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {isCardExpanded && (
          <div className="p-3 space-y-3">
            {/* Rival Profile Showcase */}
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-slate-800 to-rose-900 border border-rose-500/50 flex items-center justify-center text-2xl shadow-inner">
                    {rivalry.rivalAvatar}
                  </div>
                  <div className="absolute -bottom-1 -right-1 px-1 rounded text-[8px] font-code font-bold bg-rose-600 text-white shadow-sm">
                    MID
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-tech font-bold text-white text-sm">
                      {rivalry.rivalName}
                    </span>
                    <span className="text-[10px] text-rose-400 font-code font-bold">
                      ({rivalry.rivalHandle})
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 font-sans">
                      招牌: {rivalry.signatureChamp}
                    </span>
                  </div>
                  <div className="text-[10px] text-amber-300/90 font-sans mt-0.5 flex items-center gap-1">
                    <span>👑 {rivalry.rivalTitle}</span>
                  </div>
                </div>
              </div>

              {/* Head-to-Head Scoreboard */}
              <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-around sm:justify-end gap-3 text-center shrink-0">
                <div>
                  <div className="text-[9px] text-slate-400 uppercase">你的胜场</div>
                  <div className="text-base font-extrabold text-emerald-400 font-code">
                    {rivalry.playerWins}
                  </div>
                </div>
                <div className="text-xs font-bold text-slate-500 font-code">:</div>
                <div>
                  <div className="text-[9px] text-slate-400 uppercase">顾寒舟胜场</div>
                  <div className="text-base font-extrabold text-rose-400 font-code">
                    {rivalry.rivalWins}
                  </div>
                </div>
                <div className="border-l border-slate-800 pl-2 text-left">
                  <div className="text-[9px] text-slate-400">对位胜率</div>
                  <div className="text-xs font-bold text-cyan-300 font-code">
                    {playerWinRate}%
                  </div>
                </div>
              </div>
            </div>

            {/* Tension Level Gauge (火药味进度) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <div className="flex items-center gap-1">
                  <span className="text-slate-400 font-tech font-medium">宿怨火药味 (Tension):</span>
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: stageMeta.flameIconCount }).map((_, i) => (
                      <Flame key={i} className="w-3 h-3 fill-amber-400 animate-pulse" />
                    ))}
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${stageMeta.badgeClass}`}>
                  {stageMeta.title} ({rivalry.tension}%)
                </span>
              </div>

              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div
                  className="bg-gradient-to-r from-orange-500 via-rose-500 to-red-600 h-full rounded-full transition-all duration-500 shadow-sm shadow-rose-500/50"
                  style={{ width: `${Math.min(100, Math.max(5, rivalry.tension))}%` }}
                />
              </div>
            </div>

            {/* Rival Status Quote */}
            <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-sans flex items-start gap-2">
              <Quote className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 flex-1">
                <div className="text-[9px] text-slate-400 font-tech">宿敌近期动态 / 峡谷公屏喊话:</div>
                <div className="text-slate-200 italic font-medium leading-relaxed">
                  {rivalry.rivalStatusQuote}
                </div>
              </div>
            </div>

            {/* Latest Clash Snapshot Summary */}
            {latestClash && (
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[10px] space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1 text-slate-300 font-tech font-bold">
                    <Zap className="w-3 h-3 text-amber-400" />
                    上一轮撞车对决 · 战报回顾
                  </span>
                  <span className="font-code text-[9px]">{latestClash.timestamp}</span>
                </div>
                <p className="text-slate-300 font-sans leading-relaxed">
                  {latestClash.flavorText}
                </p>
                <div className="text-[9px] text-slate-400 font-sans flex items-center gap-1.5 pt-0.5">
                  <span className="text-rose-300 font-medium">赛后反应:</span>
                  <span>{latestClash.rivalAction}</span>
                </div>
              </div>
            )}

            {/* Interactive Control Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
              {/* Snipe Queue Toggle Button */}
              <button
                onClick={onToggleSnipeQueue}
                className={`p-2.5 rounded-xl font-tech font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md ${
                  rivalry.snipeQueueActive
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white border border-rose-400/60 animate-pulse shadow-rose-600/30'
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700'
                }`}
                title="开启后下一场排位 100% 狭路相逢宿敌"
              >
                <Crosshair className={`w-3.5 h-3.5 ${rivalry.snipeQueueActive ? 'animate-spin' : 'text-rose-400'}`} />
                <span>
                  {rivalry.snipeQueueActive ? '🎯 宿敌狙击雷达已开启 (必撞车)' : '🎯 开启宿敌排位狙击'}
                </span>
              </button>

              {/* Direct Clash Match Button */}
              <button
                onClick={() => {
                  soundEngine.playClick();
                  if (!rivalry.snipeQueueActive) {
                    onToggleSnipeQueue();
                  }
                  onStartMatch();
                }}
                className="p-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 active:scale-98 text-white font-tech font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30 cursor-pointer transition"
                title="立即发起排位对局与宿敌正面交锋"
              >
                <Swords className="w-3.5 h-3.5 text-white" />
                <span>⚔️ 发起宿命对决 (排位交锋)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Clash History Full Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950/50 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-300">
                  <Swords className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-tech font-bold text-white text-sm">
                    天梯宿怨 · 历史交锋风云录
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    与【顾寒舟 (ColdBlade)】历次狭路相逢完整战报
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Score & Tension Header */}
            <div className="p-3 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between text-xs font-code">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">交锋总战绩:</span>
                <span className="text-emerald-400 font-bold">{rivalry.playerWins} 胜</span>
                <span className="text-slate-600">/</span>
                <span className="text-rose-400 font-bold">{rivalry.rivalWins} 负</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">当前阶段:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${stageMeta.badgeClass}`}>
                  {stageMeta.title}
                </span>
              </div>
            </div>

            {/* Scrollable Logs */}
            <div className="p-3 overflow-y-auto space-y-2.5 flex-1">
              {(!rivalry.clashHistory || rivalry.clashHistory.length === 0) ? (
                <div className="p-8 text-center text-slate-400 text-xs font-sans">
                  暂无更多交锋记录。前往排位赛撞车顾寒舟，开创你的天梯宿命！
                </div>
              ) : (
                rivalry.clashHistory.map((clash, index) => {
                  const isPlayerWin = clash.outcome === 'player_win';
                  return (
                    <div
                      key={clash.id || index}
                      className={`p-3 rounded-xl border text-xs space-y-1.5 transition ${
                        isPlayerWin
                          ? 'bg-slate-950/70 border-emerald-500/30'
                          : 'bg-slate-950/70 border-rose-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-code font-bold ${
                              isPlayerWin
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            }`}
                          >
                            {isPlayerWin ? '🏆 玩家力克顾寒舟' : '💀 顾寒舟斩获对局'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-code">
                            比分: {clash.scoreSnapshot}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-code">
                          {clash.timestamp}
                        </span>
                      </div>

                      <p className="text-slate-200 font-sans leading-relaxed text-[11px]">
                        {clash.flavorText}
                      </p>

                      <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800/80 text-[10px] space-y-0.5">
                        <div className="text-rose-300 font-mono italic">
                          {clash.rivalQuote}
                        </div>
                        <div className="text-slate-400 font-sans">
                          {clash.rivalAction}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-tech font-bold text-xs cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
