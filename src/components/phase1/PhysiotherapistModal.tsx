import React, { useState } from 'react';
import {
  Activity,
  HeartPulse,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Stethoscope,
  Sparkles,
  DollarSign,
  X,
  Zap,
  Info,
  Flame,
  Moon,
  ChevronRight
} from 'lucide-react';
import { PlayerStats, PhysioTreatment } from '../../types/game';
import {
  PHYSIO_TREATMENTS,
  DEFAULT_CAREER_HEALTH,
  getRsiSeverityTitle,
  getMaxMechanicsForSeverity
} from '../../data/careerHealthData';
import { soundEngine } from '../../utils/audio';

interface PhysiotherapistModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  onTreat: (treatmentId: string) => { success: boolean; message: string };
  onOpenRecoveryRoom?: () => void;
  injuryPreventionLevel?: number; // R&D Lab Injury Prevention & Recovery Level (0 - 5)
}

export const PhysiotherapistModal: React.FC<PhysiotherapistModalProps> = ({
  isOpen,
  onClose,
  stats,
  onTreat,
  onOpenRecoveryRoom,
  injuryPreventionLevel = 0
}) => {
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const health = stats.careerHealth || DEFAULT_CAREER_HEALTH;
  const strain = health.strain;
  const hasRsi = health.hasRSI;
  const severity = health.rsiSeverity;
  const maxMechanics = health.maxMechanics || 100;

  const handleTreat = (treatment: PhysioTreatment) => {
    soundEngine.playClick();
    const result = onTreat(treatment.id);
    if (result.success) {
      setFeedback({ message: result.message, type: 'success' });
    } else {
      setFeedback({ message: result.message, type: 'error' });
    }
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  const getStrainBarColor = (val: number) => {
    if (val < 40) return 'from-emerald-500 to-teal-400';
    if (val < 75) return 'from-amber-500 to-orange-400';
    return 'from-rose-600 via-red-500 to-pink-500 animate-pulse';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-teal-500/30 shadow-[0_0_50px_rgba(20,184,166,0.15)] overflow-hidden">
        
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-teal-500/20 bg-slate-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/40 text-teal-400 shadow-sm">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-tech font-extrabold text-base text-white tracking-wide">
                  职业健康与运动康复诊所
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-code font-bold bg-teal-500/10 text-teal-300 border border-teal-500/30">
                  CAREER HEALTH
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                手腕腱鞘炎 (RSI) 专科理疗 · 突破操作锁死上限
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs font-code font-bold text-emerald-400 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>${stats.money}</span>
            </div>
            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`px-4 py-2 text-xs font-sans font-semibold flex items-center gap-2 transition-all shrink-0 ${
              feedback.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-b border-emerald-500/40'
                : 'bg-rose-950/90 text-rose-200 border-b border-rose-500/40'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Main Content Body */}
        <div className="p-4 space-y-3.5 overflow-y-auto custom-scrollbar flex-1">
          
          {/* Health Diagnostics Board */}
          <div className={`p-3.5 rounded-xl border transition-all ${
            hasRsi
              ? 'bg-gradient-to-r from-rose-950/40 via-red-950/30 to-slate-900 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
              : strain >= 70
              ? 'bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-slate-900 border-amber-500/40'
              : 'bg-gradient-to-r from-teal-950/30 via-slate-900 to-slate-900 border-teal-500/30'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HeartPulse className={`w-4 h-4 ${hasRsi ? 'text-rose-400 animate-pulse' : 'text-teal-400'}`} />
                <span className="font-tech font-bold text-white text-xs">
                  手腕及肌腱生物力学监测诊断
                </span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold font-tech ${
                hasRsi
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                  : strain >= 70
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {getRsiSeverityTitle(severity)}
              </span>
            </div>

            {/* Strain Progress Bar */}
            <div className="space-y-1 mb-3">
              <div className="flex items-center justify-between text-[11px] font-sans">
                <span className="text-slate-300 flex items-center gap-1 font-medium">
                  <span>手部积劳与肌腱负荷 (Tendon Strain):</span>
                  <span className={`font-code font-bold ${strain > 75 ? 'text-rose-400' : 'text-teal-300'}`}>
                    {strain}%
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 font-code">
                  {strain >= 80 ? '极高伤病风险' : strain >= 50 ? '中度酸胀积累' : '健康稳定'}
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${getStrainBarColor(strain)}`}
                  style={{ width: `${strain}%` }}
                />
              </div>
            </div>

            {/* Grid Stats: Current Mechanics vs Max Mechanics Cap */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">当前微操数值</div>
                <div className="text-base font-code font-black text-cyan-400 mt-0.5">
                  {stats.mechanics}
                  <span className="text-[10px] font-sans font-normal text-slate-500 ml-1">
                    / {maxMechanics}
                  </span>
                </div>
              </div>

              <div className={`p-2 rounded-lg border ${
                hasRsi
                  ? 'bg-rose-950/50 border-rose-500/50'
                  : 'bg-slate-950/70 border-slate-800'
              }`}>
                <div className="text-[10px] text-slate-400 font-sans">最大操作上限</div>
                <div className={`text-base font-code font-black mt-0.5 ${
                  hasRsi ? 'text-rose-300 line-through' : 'text-emerald-400'
                }`}>
                  {maxMechanics}
                  <span className="text-[10px] font-sans font-normal text-slate-400 ml-1">
                    {hasRsi ? '(已锁死)' : '(满额100)'}
                  </span>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-sans">连续磨练局数</div>
                <div className="text-base font-code font-black text-amber-400 mt-0.5">
                  {health.consecutiveGrinds}
                  <span className="text-[10px] font-sans font-normal text-slate-500 ml-1">场无休</span>
                </div>
              </div>
            </div>

            {/* Buff / Passive Armor Badge */}
            <div className="space-y-1.5 mt-2.5">
              {health.physioPerkActive && (
                <div className="px-2.5 py-1.5 rounded-lg bg-teal-950/60 border border-teal-500/30 flex items-center gap-2 text-xs text-teal-300">
                  <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>
                    已激活【骨骼装甲】常驻特权：对局及训练产生的腱鞘劳损累积降低 50%！
                  </span>
                </div>
              )}
              {injuryPreventionLevel > 0 && (
                <div className="px-2.5 py-1.5 rounded-lg bg-indigo-950/70 border border-indigo-500/40 flex items-center justify-between text-xs text-indigo-300">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      科研实验室【伤病预防与康复医学】Lv.{injuryPreventionLevel}：手腕肌腱负荷 -{Math.min(50, injuryPreventionLevel * 10)}% · 理疗费用与康复周期 -{Math.min(50, injuryPreventionLevel * 10)}%！
                    </span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-900 font-code text-indigo-200 border border-indigo-700">
                    R&D Lv.{injuryPreventionLevel}/5
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* RSI Warning Callout (If Afflicted) */}
          {hasRsi && (
            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-100">【职业伤病预警：腱鞘炎/腕管综合征发作】</span>
                <p className="text-[11px] text-rose-300/90 mt-0.5 leading-relaxed">
                  因长期连续单排高频微操且未充分休整，手腕肌腱严重水肿！您的最大操作上限被强制限制在 <b>{maxMechanics} 点</b>（正常为 100）。普通睡眠仅能排解乳酸，<strong>必须由理疗师施治才能清除炎症、恢复 100 点微操上限</strong>！
                </p>
              </div>
            </div>
          )}

          {/* Treatments Roster */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-tech font-bold text-white text-xs uppercase tracking-wide flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-teal-400" />
                <span>专业理疗康复方案</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-sans">
                累计接受治疗: {health.treatmentsCount} 次
              </span>
            </div>

            <div className="space-y-2">
              {PHYSIO_TREATMENTS.map((treatment) => {
                const discountRate = Math.min(0.50, injuryPreventionLevel * 0.10);
                const effectiveCost = Math.round(treatment.cost * (1 - discountRate));
                const canAfford = stats.money >= effectiveCost;
                const canCureCurrentRsi = hasRsi && treatment.curesSeverity.includes(severity);
                const isPerkPurchased = treatment.id === 'physio_team_doctor_contract' && health.physioPerkActive;

                return (
                  <div
                    key={treatment.id}
                    className={`p-3 rounded-xl border transition-all ${
                      canCureCurrentRsi
                        ? 'bg-gradient-to-r from-teal-950/40 via-slate-900 to-slate-900 border-teal-500/50 shadow-md'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 overflow-hidden">
                        <div className="text-2xl p-2 rounded-xl bg-slate-950 border border-slate-800 shrink-0 select-none">
                          {treatment.icon}
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="font-tech font-bold text-white text-xs truncate">
                              {treatment.name}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-sans font-medium bg-slate-800 text-slate-300">
                              {treatment.title}
                            </span>
                            {canCureCurrentRsi && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 animate-pulse">
                                可彻底根治当前伤病
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-sans mt-0.5 line-clamp-2">
                            {treatment.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px]">
                            <span className="text-teal-400 font-medium">
                              负荷缓解: -{treatment.strainRelief}%
                            </span>
                            <span className="text-slate-500">·</span>
                            <span className="text-cyan-400 font-medium">
                              恢复微操上限至: {treatment.restoresMaxMechanics}
                            </span>
                            {treatment.perkDescription && (
                              <>
                                <span className="text-slate-500">·</span>
                                <span className="text-amber-400 font-medium truncate">
                                  {treatment.perkDescription}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <button
                          onClick={() => handleTreat(treatment)}
                          disabled={!canAfford || isPerkPurchased}
                          className={`px-3 py-2 rounded-xl font-tech font-bold text-xs flex items-center gap-1 transition cursor-pointer active:scale-98 shadow-sm ${
                            isPerkPurchased
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                              : canAfford
                              ? canCureCurrentRsi
                                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 shadow-teal-500/20 font-extrabold'
                                : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-teal-500/50'
                              : 'bg-slate-800/50 text-slate-500 border border-slate-800 cursor-not-allowed'
                          }`}
                        >
                          {isPerkPurchased ? (
                            <span>已聘请顾问</span>
                          ) : (
                            <div className="flex flex-col items-end">
                              <div className="flex items-center gap-1">
                                <span>${effectiveCost}</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </div>
                              {discountRate > 0 && (
                                <span className="text-[9px] text-amber-300 font-code font-normal line-through">
                                  ${treatment.cost} (-{Math.round(discountRate * 100)}%)
                                </span>
                              )}
                            </div>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Doctor Ergonomics Advice Box */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 space-y-1 font-sans">
            <div className="flex items-center gap-1.5 text-slate-300 font-bold">
              <Info className="w-3.5 h-3.5 text-teal-400" />
              <span>队医理疗与防护科普：</span>
            </div>
            <p>
              1. 连续排位而不休整（连续场次 &gt; 4）时，每次击键和拉枪都会加倍累积腱鞘负荷。
            </p>
            <p>
              2. 负荷达 60%~85% 时有极大概率触发<b>腱鞘炎 (RSI)</b>，微操上限将被锁死在 85、70 或 55 点。
            </p>
            <p>
              3. 每次免费<b>【深度休整 (Rest)】</b>可消解 35% 负荷；但确诊 RSI 后，必须由理疗师处理才能重铸 100 点上限！
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400">
            {hasRsi ? (
              <span className="text-rose-400 font-bold">⚠️ 腱鞘劳损中，建议优先完成理疗以恢复实力！</span>
            ) : (
              <span>手部状态良好，注意劳逸结合避免诱发 RSI。</span>
            )}
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-tech font-bold text-xs transition cursor-pointer"
          >
            完成诊疗
          </button>
        </div>

      </div>
    </div>
  );
};
