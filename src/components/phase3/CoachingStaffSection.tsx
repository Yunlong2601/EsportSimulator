import React, { useState } from 'react';
import { 
  Users, 
  Award, 
  Zap, 
  Brain, 
  Shield, 
  DollarSign, 
  UserCheck, 
  UserPlus, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle, 
  TrendingUp, 
  Flame, 
  ChevronRight,
  X,
  History,
  Briefcase,
  HelpCircle,
  Crosshair,
  Search,
  Eye
} from 'lucide-react';
import { 
  DynastyState, 
  Coach, 
  CoachSpecialization, 
  CoachingStaffState 
} from '../../types/game';
import { 
  AVAILABLE_COACHES, 
  SPECIALIZATION_CONFIG, 
  getCoachingStaffPassiveBonuses, 
  calculateWeeklyStaffSalaries 
} from '../../data/coachingStaffData';
import { soundEngine } from '../../utils/audio';

interface CoachingStaffSectionProps {
  dynasty: DynastyState;
  onUpdateDynasty: React.Dispatch<React.SetStateAction<DynastyState>>;
  onOpenScoutingReport?: () => void;
}

export const CoachingStaffSection: React.FC<CoachingStaffSectionProps> = ({
  dynasty,
  onUpdateDynasty,
  onOpenScoutingReport
}) => {
  const [selectedFilter, setSelectedFilter] = useState<CoachSpecialization | 'ALL'>('ALL');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const coachingStaff = dynasty.coachingStaff;
  const hiredCoaches = coachingStaff?.hiredCoaches || {};
  const passiveBonuses = getCoachingStaffPassiveBonuses(coachingStaff);
  const weeklySalaries = calculateWeeklyStaffSalaries(coachingStaff);

  const startingRoster = dynasty.roster.slice(0, 5);

  const filteredCoaches = selectedFilter === 'ALL'
    ? AVAILABLE_COACHES
    : AVAILABLE_COACHES.filter(c => c.specialization === selectedFilter);

  // Hire a specialized coach
  const handleHireCoach = (coach: Coach) => {
    if (dynasty.budget < coach.hiringCost) {
      soundEngine.playDefeat();
      setActionNotice(`⚠️ 俱乐部金库预算不足 $${coach.hiringCost.toLocaleString()}，无法签署聘约！`);
      return;
    }

    soundEngine.playLevelUp();

    const timestamp = new Date().toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const spec = coach.specialization;
    const oldCoach = hiredCoaches[spec];

    const historyEntry = {
      id: `coach-hire-${Date.now()}`,
      coachName: coach.name,
      action: 'HIRED' as const,
      specialization: spec,
      timestamp
    };

    onUpdateDynasty(prev => {
      const currentStaff = prev.coachingStaff || { hiredCoaches: {}, totalHiringSpent: 0, history: [] };
      return {
        ...prev,
        budget: prev.budget - coach.hiringCost,
        weeklyExpenses: prev.weeklyExpenses + coach.weeklySalary - (oldCoach?.weeklySalary || 0),
        fanHype: prev.fanHype + 2500, // fan hype increases when hiring coaches
        coachingStaff: {
          ...currentStaff,
          totalHiringSpent: currentStaff.totalHiringSpent + coach.hiringCost,
          hiredCoaches: {
            ...currentStaff.hiredCoaches,
            [spec]: {
              ...coach,
              hiredAt: timestamp
            }
          },
          history: [historyEntry, ...(currentStaff.history || [])]
        }
      };
    });

    setActionNotice(`🎉【签约成功】${coach.name} 已正式出任【${SPECIALIZATION_CONFIG[spec].label}】！首发阵容即刻获得被动增益！`);
    setTimeout(() => setActionNotice(null), 4500);
  };

  // Dismiss a coach
  const handleDismissCoach = (spec: CoachSpecialization) => {
    const target = hiredCoaches[spec];
    if (!target) return;

    soundEngine.playClick();
    const timestamp = new Date().toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    const historyEntry = {
      id: `coach-rel-${Date.now()}`,
      coachName: target.name,
      action: 'RELEASED' as const,
      specialization: spec,
      timestamp
    };

    onUpdateDynasty(prev => {
      const currentStaff = prev.coachingStaff || { hiredCoaches: {}, totalHiringSpent: 0, history: [] };
      return {
        ...prev,
        weeklyExpenses: Math.max(0, prev.weeklyExpenses - target.weeklySalary),
        coachingStaff: {
          ...currentStaff,
          hiredCoaches: {
            ...currentStaff.hiredCoaches,
            [spec]: null
          },
          history: [historyEntry, ...(currentStaff.history || [])]
        }
      };
    });

    setActionNotice(`已解除 ${target.name} 的教练职务，对应被动光环已卸除。`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const specializations: CoachSpecialization[] = ['Strategic', 'Mental', 'Mechanical'];

  return (
    <div className="space-y-3.5 animate-fade-in font-sans">
      {/* 1. Header Banner & Passive Aura Aggregator Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-cyan-950/70 border-2 border-indigo-500/50 shadow-xl space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-400 to-cyan-500 p-0.5 shadow-md shrink-0">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-cyan-300">
                <Briefcase className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-tech font-extrabold text-white text-sm sm:text-base tracking-wide">
                  战队教练智囊团 (Coaching Staff)
                </h3>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-code font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  PASSIVE AURA
                </span>
              </div>
              <p className="text-[10px] text-slate-300 mt-0.5">
                聘用战术大局、竞技心理与微操技术专精教练，为首发阵容全员注入强效常驻被动属性！
              </p>
            </div>
          </div>
        </div>

        {/* Financial & Staff Metrics Bar */}
        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block font-tech">金库当前可用预算</span>
              <span className="font-black font-code text-emerald-300 text-sm">
                ${dynasty.budget.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between border-l border-slate-800 pl-2">
            <div>
              <span className="text-[10px] text-slate-400 block font-tech">教练团薪资支出</span>
              <span className="font-bold font-code text-amber-300 text-sm">
                ${weeklySalaries.toLocaleString()} / 周
              </span>
            </div>
            <span className="text-[9px] font-tech text-cyan-300 font-bold bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">
              已聘 {Object.values(hiredCoaches).filter(Boolean).length} / 3 位
            </span>
          </div>
        </div>

        {/* Passive Stat Bonuses Aura Banner */}
        <div className="p-2.5 rounded-xl bg-slate-950/90 border border-indigo-500/30 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-tech font-bold">
            <span className="text-white flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              当前赋予首发五虎的常驻被动光环:
            </span>
            <span className="text-amber-400 text-[10px]">生效中 ✓</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <span className="text-[9px] text-slate-400 block font-tech">微操技术被动</span>
              <span className="font-code font-bold text-amber-400 text-sm">
                +{passiveBonuses.mechanics} 微操
              </span>
            </div>

            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
              <span className="text-[9px] text-slate-400 block font-tech">战术大局被动</span>
              <span className="font-code font-bold text-cyan-400 text-sm">
                +{passiveBonuses.macro} 大局
              </span>
            </div>

            <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30">
              <span className="text-[9px] text-slate-400 block font-tech">心理士气被动</span>
              <span className="font-code font-bold text-rose-400 text-sm">
                +{passiveBonuses.morale} 士气
              </span>
            </div>
          </div>

          {passiveBonuses.tacticalNotes.length > 0 && (
            <div className="pt-1 border-t border-slate-800/80 space-y-0.5">
              {passiveBonuses.tacticalNotes.map((note, idx) => (
                <div key={idx} className="text-[9px] text-slate-300 font-sans flex items-center gap-1 truncate">
                  <span className="text-amber-400">⚡</span>
                  <span className="truncate">{note}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Notice feedback */}
      {actionNotice && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-950/80 to-slate-900 border border-cyan-400 text-xs font-tech text-cyan-200 animate-slide-up flex items-center gap-2 shadow-lg">
          <Sparkles className="w-4 h-4 text-cyan-300 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Opponent Tactical Scouting Hub Banner */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-indigo-950/70 border border-cyan-500/50 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0">
            <Crosshair className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-tech font-bold text-white text-xs">
                对手深度战术侦察沙盘 (Scouting Report)
              </h4>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                BP倾向透视
              </span>
            </div>
            <p className="text-[10px] text-slate-300 font-sans mt-0.5">
              委派教练组针对世界赛宿敌展开沙盘推演，揭秘其偏好（强开团/后期大核）与阵型软肋！
            </p>
          </div>
        </div>

        {onOpenScoutingReport && (
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenScoutingReport();
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-tech font-extrabold text-[10px] transition cursor-pointer shadow-md shrink-0 flex items-center gap-1 active:scale-95 ml-2"
          >
            <Search className="w-3.5 h-3.5" />
            <span>开启侦察 →</span>
          </button>
        )}
      </div>

      {/* 2. Active Three Coaching Staff Slots */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-tech font-bold text-white flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            三驾马车 · 在岗专精教练席位 (Staff Roster)
          </span>
          <span className="text-[10px] text-slate-400 font-sans">
            三大方向专精教练各限聘 1 人
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {specializations.map(spec => {
            const conf = SPECIALIZATION_CONFIG[spec];
            const coach = hiredCoaches[spec];

            if (coach) {
              return (
                <div 
                  key={spec}
                  className="p-3 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-indigo-500/50 shadow-md relative overflow-hidden flex flex-col justify-between gap-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{coach.avatar}</span>
                      <div>
                        <div className="flex items-center gap-1">
                          <h4 className="font-tech font-bold text-white text-xs">{coach.name}</h4>
                          <span className={`text-[8px] px-1 py-0.2 rounded font-black font-code ${
                            coach.tier === 'LEGENDARY' 
                              ? 'bg-amber-500 text-slate-950' 
                              : coach.tier === 'ELITE' 
                              ? 'bg-purple-950 text-purple-300 border border-purple-800' 
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {coach.tier}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-tech block truncate">{coach.title}</span>
                      </div>
                    </div>

                    <span className={`text-[8px] px-1.5 py-0.5 rounded border font-tech font-bold ${conf.badgeBg} ${conf.badgeBorder} ${conf.badgeText}`}>
                      {conf.icon} {conf.label}
                    </span>
                  </div>

                  <p className="text-[9px] text-slate-300 font-sans line-clamp-2 italic bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
                    "{coach.philosophy}"
                  </p>

                  <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[9px] font-code text-cyan-300">
                    <div className="font-bold">被动: +{coach.passiveBonuses.mechanics} 微操 · +{coach.passiveBonuses.macro} 大局 · +{coach.passiveBonuses.morale} 士气</div>
                    <div className="text-[8px] text-slate-400 mt-0.5">周薪支出: ${coach.weeklySalary.toLocaleString()}</div>
                  </div>

                  <button
                    onClick={() => handleDismissCoach(spec)}
                    className="w-full py-1 rounded-lg bg-slate-800/80 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 border border-slate-700 hover:border-rose-800 text-[9px] font-tech font-bold transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    <span>解约或换帅</span>
                  </button>
                </div>
              );
            }

            // Empty Slot
            return (
              <div 
                key={spec}
                onClick={() => setSelectedFilter(spec)}
                className="p-3 rounded-2xl bg-slate-950/60 border-2 border-dashed border-slate-800 hover:border-indigo-500/50 transition cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 min-h-[140px] group"
              >
                <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-cyan-400 group-hover:border-cyan-500/40 transition">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <span className={`text-xs font-tech font-bold ${conf.accentColor} block`}>
                    {conf.icon} {conf.label} (虚位以待)
                  </span>
                  <span className="text-[9px] text-slate-500 font-sans block mt-0.5">
                    点击筛选招募此类专精教练
                  </span>
                </div>
                <span className="text-[9px] font-code text-indigo-400 group-hover:underline">
                  去聘用专精教练 →
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Starting Roster Impact Preview Window */}
      <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-cyan-400" />
            <h4 className="font-tech font-bold text-white text-xs">
              首发阵容当前享受的教练智囊团增益 (Starting Roster Impact)
            </h4>
          </div>
          <span className="text-[10px] text-amber-400 font-code font-bold">
            常驻被动实装
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {startingRoster.map(player => {
            const effectiveMech = Math.min(100, player.mechanics + passiveBonuses.mechanics);
            const effectiveMacro = Math.min(100, player.macro + passiveBonuses.macro);

            return (
              <div 
                key={player.id}
                className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-center flex flex-col items-center justify-between gap-1"
              >
                <span className="text-2xl">{player.avatar}</span>
                <div className="w-full">
                  <span className="font-tech font-bold text-white text-[11px] block truncate">{player.name}</span>
                  <span className="px-1 py-0.2 rounded text-[8px] font-code font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 inline-block">
                    {player.role}
                  </span>
                </div>
                <div className="w-full pt-1 border-t border-slate-800/80 text-[8px] font-code">
                  <div className="text-amber-400 font-bold">
                    {effectiveMech} 微操
                    {passiveBonuses.mechanics > 0 && <span className="text-emerald-400 text-[7px] ml-0.5">(+{passiveBonuses.mechanics})</span>}
                  </div>
                  <div className="text-cyan-400 font-bold">
                    {effectiveMacro} 大局
                    {passiveBonuses.macro > 0 && <span className="text-emerald-400 text-[7px] ml-0.5">(+{passiveBonuses.macro})</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Available Coaches Market (教练招募市场) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-tech font-bold text-white flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            全球顶尖名帅候选池 (Available Coaches Market)
          </span>
          <span className="text-[10px] text-slate-400 font-sans">
            共 {AVAILABLE_COACHES.length} 位知名教练
          </span>
        </div>

        {/* Specialization Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          <button
            onClick={() => {
              soundEngine.playClick();
              setSelectedFilter('ALL');
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-tech font-bold cursor-pointer transition shrink-0 border ${
              selectedFilter === 'ALL'
                ? 'bg-indigo-500 text-white border-indigo-400 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            全部专精 ({AVAILABLE_COACHES.length})
          </button>

          {specializations.map(spec => {
            const conf = SPECIALIZATION_CONFIG[spec];
            const isSelected = selectedFilter === spec;
            const count = AVAILABLE_COACHES.filter(c => c.specialization === spec).length;

            return (
              <button
                key={spec}
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedFilter(spec);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-tech font-bold cursor-pointer transition shrink-0 border flex items-center gap-1 ${
                  isSelected
                    ? `${conf.badgeBg} ${conf.badgeText} ${conf.badgeBorder} shadow-sm font-extrabold`
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{conf.icon}</span>
                <span>{conf.label}</span>
                <span className="text-[8px] font-code opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Coach Cards List */}
        <div className="space-y-2.5">
          {filteredCoaches.map(coach => {
            const conf = SPECIALIZATION_CONFIG[coach.specialization];
            const isHired = hiredCoaches[coach.specialization]?.id === coach.id;
            const hasOtherInSlot = Boolean(hiredCoaches[coach.specialization] && !isHired);
            const canAfford = dynasty.budget >= coach.hiringCost;

            return (
              <div
                key={coach.id}
                className={`p-3 rounded-2xl border transition-all relative overflow-hidden space-y-2 ${
                  isHired
                    ? 'bg-gradient-to-r from-indigo-950/70 via-slate-900 to-cyan-950/70 border-cyan-400 shadow-lg ring-1 ring-cyan-400'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Top Coach Info Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl">{coach.avatar}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-tech font-bold text-white text-xs sm:text-sm">
                          {coach.name}
                        </h4>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-slate-950 text-slate-300 border border-slate-700 font-tech">
                          {coach.country} · {coach.age}岁
                        </span>
                        <span className={`text-[8px] px-1.5 py-0.2 rounded font-black font-code ${
                          coach.tier === 'LEGENDARY' 
                            ? 'bg-amber-500 text-slate-950' 
                            : coach.tier === 'ELITE' 
                            ? 'bg-purple-950 text-purple-300 border border-purple-800' 
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {coach.tier}
                        </span>
                      </div>
                      <span className="text-[10px] text-cyan-300 font-tech block mt-0.5">
                        {coach.title}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[9px] text-slate-400 font-tech block">签约聘用金</span>
                    <span className="text-xs font-bold font-code text-amber-300">
                      ${coach.hiringCost.toLocaleString()}
                    </span>
                    <span className="text-[8px] text-slate-400 font-code block">
                      周薪: ${coach.weeklySalary.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Coaching Philosophy */}
                <p className="text-[10px] text-slate-300 font-sans leading-relaxed bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
                  {coach.philosophy}
                </p>

                {/* Passive Buff Badges */}
                <div className="p-2 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-2 text-[10px]">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-tech font-bold text-slate-400">常驻被动:</span>
                    {coach.passiveBonuses.mechanics > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-code font-bold">
                        +{coach.passiveBonuses.mechanics} 微操
                      </span>
                    )}
                    {coach.passiveBonuses.macro > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-code font-bold">
                        +{coach.passiveBonuses.macro} 大局
                      </span>
                    )}
                    {coach.passiveBonuses.morale > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-code font-bold">
                        +{coach.passiveBonuses.morale} 士气
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-300 font-sans truncate max-w-[140px] text-right">
                    {coach.passiveBonuses.tacticalNote}
                  </span>
                </div>

                {/* Action Button */}
                <div className="pt-0.5">
                  {isHired ? (
                    <div className="w-full py-2 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-800 font-tech font-bold text-xs flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>正在执教中 (当前在岗)</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleHireCoach(coach)}
                      disabled={!canAfford}
                      className={`w-full py-2.5 rounded-xl text-xs font-tech font-extrabold uppercase tracking-wide transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md ${
                        !canAfford
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                          : 'bg-gradient-to-r from-indigo-500 via-cyan-500 to-teal-400 hover:from-indigo-400 hover:to-teal-300 text-slate-950 shadow-indigo-500/25 active:scale-98'
                      }`}
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>
                        {!canAfford 
                          ? '金库预算不足 $' + coach.hiringCost.toLocaleString()
                          : hasOtherInSlot
                          ? `签署聘约 (将替换现任${conf.label}) · 划拨 $${coach.hiringCost.toLocaleString()}`
                          : `签署聘约 · 划拨 $${coach.hiringCost.toLocaleString()} 预算`}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
