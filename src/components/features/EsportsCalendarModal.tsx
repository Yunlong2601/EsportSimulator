import React, { useState } from 'react';
import {
  Calendar,
  Zap,
  Flame,
  Trophy,
  ShieldAlert,
  ArrowRight,
  X,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Activity,
  Layers,
  Award,
  Clock
} from 'lucide-react';
import { EsportsCalendarState } from '../../types/game';
import {
  SPLIT_DEFINITIONS,
  PATCH_META_CATALOG,
  GLOBAL_EVENT_MODIFIERS,
  getSplitForWeek,
  getPatchForWeek,
  calculateCompoundModifiers
} from '../../data/esportsEventData';

interface EsportsCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  calendarState: EsportsCalendarState;
  playerLp: number;
}

type TabType = 'schedule' | 'patch_meta' | 'modifiers' | 'logs';

export const EsportsCalendarModal: React.FC<EsportsCalendarModalProps> = ({
  isOpen,
  onClose,
  calendarState,
  playerLp
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('schedule');

  if (!isOpen) return null;

  const currentSplit = getSplitForWeek(calendarState.currentWeek);
  const currentPatch = getPatchForWeek(calendarState.currentWeek);
  const compound = calculateCompoundModifiers(calendarState.currentWeek);

  // Overall season completion percentage (26 weeks)
  const seasonProgressPct = Math.min(100, Math.round((calendarState.currentWeek / 26) * 100));

  const splitList = Object.values(SPLIT_DEFINITIONS);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">职业电竞赛历与事件引擎</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {calendarState.seasonYear} 赛季
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span>{currentSplit.name}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">第 {calendarState.currentWeek} 周 / 26周</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">第 {calendarState.currentDay} 天</span>
                <span aria-hidden="true">·</span>
                <span className="text-amber-400 font-medium">版本 {currentPatch.version}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Summary Banner */}
        <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-slate-400">年度赛季进度</div>
              <div className="text-sm font-bold text-white font-mono tabular-nums">{seasonProgressPct}%</div>
            </div>
            <div className="h-6 w-px bg-slate-700" />
            <div>
              <div className="text-slate-400">当前赛段战绩</div>
              <div className="text-sm font-bold text-emerald-400 font-mono tabular-nums">
                {calendarState.splitWins}胜 - {calendarState.splitLosses}负
                <span className="text-slate-400 text-xs ml-1 font-normal">
                  ({calendarState.splitMatchesPlayed > 0 ? Math.round((calendarState.splitWins / calendarState.splitMatchesPlayed) * 100) : 0}% 胜率)
                </span>
              </div>
            </div>
            <div className="h-6 w-px bg-slate-700" />
            <div>
              <div className="text-slate-400">当前排位 LP</div>
              <div className="text-sm font-bold text-amber-400 font-mono tabular-nums">{playerLp} LP</div>
            </div>
          </div>

          {/* Qualification Badges */}
          <div className="flex items-center gap-2">
            <div className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 border ${
              calendarState.msiQualified
                ? 'bg-amber-950/40 text-amber-300 border-amber-600/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              <Trophy className="w-3.5 h-3.5" />
              <span>MSI 资格: {calendarState.msiQualified ? '已锁定' : '争夺中'}</span>
            </div>
            <div className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 border ${
              calendarState.worldsQualified
                ? 'bg-sky-950/40 text-sky-300 border-sky-600/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              <Award className="w-3.5 h-3.5" />
              <span>世界赛资格: {calendarState.worldsQualified ? '已锁定' : '未入围'}</span>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'schedule'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            📅 全年赛程 (26周)
          </button>
          <button
            onClick={() => setActiveTab('patch_meta')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'patch_meta'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            ⚔️ 版本英雄榜 (Patch {currentPatch.version})
          </button>
          <button
            onClick={() => setActiveTab('modifiers')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'modifiers'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            ⚡ 环境加成 (LP x{compound.lpMult.toFixed(2)})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'logs'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            📜 赛历大事记
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                真实电竞职业赛年历时 26 周。玩家通过单排比赛（推进2天）、录像复盘（推进1天）、高能直播（推进1天）及深度休整（推进1天）推进自然时间。
              </div>

              {/* Splits List */}
              <div className="space-y-3">
                {splitList.map((s) => {
                  const isCurrent = calendarState.currentSplit === s.id;
                  const isPast = calendarState.currentWeek > s.endWeek;
                  const isFuture = calendarState.currentWeek < s.startWeek;

                  return (
                    <div
                      key={s.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-slate-800/90 border-amber-500/60 shadow-lg shadow-amber-950/20'
                          : isPast
                          ? 'bg-slate-950/40 border-slate-800/80 opacity-70'
                          : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{s.icon}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-white text-sm">{s.name}</h3>
                              <span className="text-xs text-slate-400">({s.nameEn})</span>
                              {isCurrent && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-slate-950">
                                  进行中
                                </span>
                              )}
                              {isPast && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                                  已收官
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-amber-300/90 mt-0.5">{s.banner}</div>
                          </div>
                        </div>

                        <div className="text-right text-xs">
                          <div className="font-mono text-slate-300 font-semibold">
                            第 {s.startWeek} - {s.endWeek} 周
                          </div>
                          <div className="text-slate-500 mt-0.5">
                            共 {(s.endWeek - s.startWeek + 1) * 7} 天
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                        {s.description}
                      </div>

                      <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/50">
                        <div className="flex items-center gap-1.5 text-amber-400/90">
                          <Sparkles className="w-3.5 h-3.5 shrink-0" />
                          <span>准入目标：{s.qualificationTarget}</span>
                        </div>
                        {isCurrent && (
                          <div className="font-mono text-xs text-slate-300">
                            已进行至本赛段第 {calendarState.currentWeek - s.startWeek + 1} 周
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: PATCH META TIERS */}
          {activeTab === 'patch_meta' && (
            <div className="space-y-4">
              {/* Current Active Patch Card */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-amber-500/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                      LIVE PATCH
                    </span>
                    <h3 className="font-bold text-white text-base">Patch {currentPatch.version}</h3>
                  </div>
                  <span className="text-xs text-slate-400">
                    实装周期: 第 {currentPatch.version === '14.19' ? '1-6' : currentPatch.version === '14.21' ? '7-13' : '14-24'} 周
                  </span>
                </div>
                <div className="text-sm font-semibold text-amber-300 mt-2">{currentPatch.headline}</div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{currentPatch.description}</p>
              </div>

              {/* Meta Champion Tiers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* T0 / S+ */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-red-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-red-400 flex items-center gap-1">
                      <Flame className="w-4 h-4 text-red-500" /> T0 破荒强核 (S+)
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">+8 微操</span>
                  </div>
                  <div className="space-y-1.5">
                    {currentPatch.tierSPlusChamps.map((c) => (
                      <div key={c} className="text-xs p-2 rounded bg-slate-800/70 border border-slate-700 text-white font-medium">
                        {c}
                      </div>
                    ))}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-2">
                    高光操作与绝境翻盘概率大幅提升，排位天梯绝对版本红利。
                  </div>
                </div>

                {/* T1 / S */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-amber-400" /> T1 强势主流 (S)
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">+5 微操</span>
                  </div>
                  <div className="space-y-1.5">
                    {currentPatch.tierSChamps.map((c) => (
                      <div key={c} className="text-xs p-2 rounded bg-slate-800/70 border border-slate-700 text-white font-medium">
                        {c}
                      </div>
                    ))}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-2">
                    赛场稳健基石，对线压制力与团战伤害收益显著。
                  </div>
                </div>

                {/* Nerfed / B */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                      <ShieldAlert className="w-4 h-4 text-slate-400" /> T3 削弱边缘 (B)
                    </span>
                    <span className="text-[11px] font-mono text-red-400 font-bold">-4 微操</span>
                  </div>
                  <div className="space-y-1.5">
                    {currentPatch.nerfedChamps.length > 0 ? (
                      currentPatch.nerfedChamps.map((c) => (
                        <div key={c} className="text-xs p-2 rounded bg-slate-800/50 border border-slate-700 text-slate-400">
                          {c}
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-500 p-2">无重大削弱英雄</div>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-2">
                    数值被削弱，逆版本冲分将面临更大的对线与团战考验。
                  </div>
                </div>
              </div>

              {/* Upcoming Patches Roadmap */}
              <div className="pt-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">全年补丁版本迭代路线</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {PATCH_META_CATALOG.map((p) => {
                    const isLive = p.version === currentPatch.version;
                    return (
                      <div
                        key={p.version}
                        className={`p-3 rounded-lg border ${
                          isLive
                            ? 'bg-amber-950/20 border-amber-500/50 text-white'
                            : 'bg-slate-950/40 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>Patch {p.version}</span>
                          {isLive && <span className="text-[10px] text-amber-400">当前实装</span>}
                        </div>
                        <div className="text-slate-300 font-medium mt-1">{p.headline}</div>
                        <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">{p.description}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ACTIVE MODIFIERS */}
          {activeTab === 'modifiers' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                赛历大事件在赛季不同阶段注入多周长效环境词条，全面影响全服排位胜场收益、选手手腕劳损累积与专注消耗速度。
              </div>

              {/* Compound Multipliers HUD */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                <div>
                  <div className="text-xs text-slate-400">胜场 LP 结算收益倍率</div>
                  <div className="text-xl font-bold font-mono tabular-nums text-amber-400 mt-0.5">
                    x{compound.lpMult.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {compound.lpMult > 1 ? `额外 +${Math.round((compound.lpMult - 1) * 100)}% 胜场积分` : '标准收益'}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400">手腕 RSI 劳损增长倍率</div>
                  <div className={`text-xl font-bold font-mono tabular-nums mt-0.5 ${
                    compound.strainMult > 1 ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    x{compound.strainMult.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {compound.strainMult > 1 ? '高压赛事，劳损加速' : '休赛期，伤病减轻'}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400">专注度消耗倍率</div>
                  <div className="text-xl font-bold font-mono tabular-nums text-sky-400 mt-0.5">
                    x{compound.focusDrainMult.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {compound.focusDrainMult > 1 ? '高强度博弈，快速疲劳' : '平和节奏'}
                  </div>
                </div>
              </div>

              {/* Event Cards */}
              <div className="space-y-3">
                {GLOBAL_EVENT_MODIFIERS.map((mod) => {
                  const isActive = calendarState.currentWeek >= mod.startWeek && calendarState.currentWeek <= mod.endWeek;

                  return (
                    <div
                      key={mod.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isActive
                          ? 'bg-slate-800/90 border-amber-500/60 shadow-lg'
                          : 'bg-slate-950/40 border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{mod.icon}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-white text-sm">{mod.name}</h4>
                              {isActive ? (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950">
                                  生效中
                                </span>
                              ) : (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                                  第 {mod.startWeek}-{mod.endWeek} 周
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-300 mt-0.5">{mod.description}</div>
                          </div>
                        </div>

                        <div className="text-right text-xs">
                          <span className="text-amber-400 font-bold font-mono">LP x{mod.lpGainMultiplier.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="mt-2.5 text-xs text-slate-400 italic bg-slate-950/30 p-2 rounded border border-slate-800/50">
                        "{mod.flavorNarrative}"
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: CALENDAR LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 mb-2">
                记录本赛季所有版本更新、赛段跃迁、资格解锁与重大赛历事件：
              </div>

              <div className="space-y-2">
                {calendarState.calendarHistoryLog && calendarState.calendarHistoryLog.length > 0 ? (
                  calendarState.calendarHistoryLog.map((log, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-800/50 border border-slate-800 text-xs text-slate-200 flex items-start gap-2.5 leading-relaxed"
                    >
                      <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{log}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs">暂无赛历历史记录</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <span>完成排位、复盘、直播与休整将自动推进赛历</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
          >
            返回主界面
          </button>
        </div>
      </div>
    </div>
  );
};
