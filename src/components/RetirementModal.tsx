import React from 'react';
import { 
  Building2, 
  DollarSign, 
  Award, 
  Trophy, 
  ArrowRight, 
  Sparkles, 
  Crown, 
  Shield, 
  Swords, 
  Flame, 
  CheckCircle2, 
  Star, 
  TrendingUp, 
  Medal,
  Activity,
  Zap,
  Globe2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { soundEngine } from '../utils/audio';
import { PlayerStats } from '../types/game';

interface RetirementModalProps {
  isOpen: boolean;
  money: number;
  lifetimeEarnings?: number;
  trophies?: {
    challengerUnlocked: boolean;
    regionalChampion: boolean;
    worldsSummonerCup: boolean;
    mvpTrophy: boolean;
  };
  stats?: PlayerStats;
  onRetireAndBuyOrg: () => void;
  onStayPlaying: () => void;
}

export const RetirementModal: React.FC<RetirementModalProps> = ({
  isOpen,
  money,
  lifetimeEarnings,
  trophies = {
    challengerUnlocked: true,
    regionalChampion: true,
    worldsSummonerCup: false,
    mvpTrophy: true
  },
  stats,
  onRetireAndBuyOrg,
  onStayPlaying
}) => {
  if (!isOpen) return null;

  // Total Lifetime Cumulative Earnings (Guaranteed at least $1,000,000 upon reaching retirement threshold)
  const totalLifetimeCash = Math.max(1000000, lifetimeEarnings || money);

  // Trophy list & count
  const trophyList = [
    {
      id: 'challenger',
      name: '最强王者加冕神话印记',
      nameEn: 'Challenger Peak Crest',
      desc: '天梯突破 1,000 LP 傲视全服巅峰',
      icon: '👑',
      unlocked: Boolean(trophies.challengerUnlocked)
    },
    {
      id: 'regional',
      name: '职业联赛冠军银龙杯',
      nameEn: 'Regional Championship',
      desc: '职业定级赛横扫全场夺得联赛冠军',
      icon: '🥇',
      unlocked: Boolean(trophies.regionalChampion)
    },
    {
      id: 'worlds',
      name: '全球总决赛召唤师杯',
      nameEn: 'Worlds Summoner Cup',
      desc: '世界赛最高荣耀，全场金色的雨',
      icon: '🏆',
      unlocked: Boolean(trophies.worldsSummonerCup)
    },
    {
      id: 'mvp',
      name: '赛季最佳常规赛 MVP 水晶',
      nameEn: 'Regular Season MVP',
      desc: '关键先生独步天下，全场最佳核心',
      icon: '🌟',
      unlocked: Boolean(trophies.mvpTrophy)
    }
  ];

  const unlockedTrophyCount = trophyList.filter(t => t.unlocked).length;

  // Career match stats
  const totalGames = Math.max(1, stats?.totalGames || 35);
  const wins = stats?.wins || 28;
  const losses = stats?.losses || (totalGames - wins);
  const winRate = Math.min(100, Math.max(0, Math.round((wins / totalGames) * 100)));
  const peakMechanics = Math.min(100, stats?.mechanics || 92);
  const peakMental = Math.min(100, stats?.mental || 88);
  const avgSkill = Math.round((peakMechanics + peakMental) / 2);
  const fame = Math.min(100, stats?.fame || 85);

  // ============================================================================
  // 'GREATEST PLAYER OF ALL TIME' (GOAT) RATING INDEX FORMULA
  // ============================================================================
  // Base 60 pts
  // + Trophies: up to 24 pts (6 pts per trophy)
  // + Peak Skill: up to 10 pts
  // + Win Rate: up to 8 pts
  // + Lifetime Earnings: up to 5 pts
  // + Fame & MVP: up to 3 pts
  const rawGoatScore = 60.0 
    + (unlockedTrophyCount * 6.2)
    + ((avgSkill - 70) * 0.28)
    + ((winRate - 50) * 0.16)
    + Math.min(5, (totalLifetimeCash / 1000000) * 4.2)
    + ((fame - 50) * 0.05);

  const goatIndex = Math.min(99.9, Math.max(72.0, Math.round(rawGoatScore * 10) / 10));

  // GOAT Historic Tier Title & Lore
  let goatTier = {
    grade: 'SSS',
    title: '👑 神之领域 · 殿堂级历史第一人 (Immortal GOAT)',
    badgeBg: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950',
    glowColor: 'rgba(245, 158, 11, 0.6)',
    quote: '出道即巅峰，大满贯功成身退！你的战袍已被永久悬挂于召唤师峡谷名人堂穹顶，世间无人可出其右！'
  };

  if (goatIndex < 80.0) {
    goatTier = {
      grade: 'A+',
      title: '🛡️ 功勋老将 · 坚毅老队长 (Veteran Hall of Famer)',
      badgeBg: 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950',
      glowColor: 'rgba(16, 185, 129, 0.5)',
      quote: '百战不殆的坚毅领袖，带领队伍突破重围积累百万身价，功成名就转型豪门战队老板！'
    };
  } else if (goatIndex < 90.0) {
    goatTier = {
      grade: 'S',
      title: '⚔️ 超级巨星 · 赛区定海神针 (Superstar Legend)',
      badgeBg: 'bg-gradient-to-r from-purple-400 to-indigo-500 text-white',
      glowColor: 'rgba(168, 85, 247, 0.5)',
      quote: '赛区最锐利的矛与最坚固的盾，关键战局中屡屡力挽狂澜，带着无数喝彩优雅谢幕！'
    };
  } else if (goatIndex < 96.0) {
    goatTier = {
      grade: 'SS',
      title: '🌟 时代图腾 · 黄金一代队长 (Generational Icon)',
      badgeBg: 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950',
      glowColor: 'rgba(6, 182, 212, 0.5)',
      quote: '统治了一个黄金时代的电竞王者，万千玩家的青春图腾，传奇职业生涯在此刻圆满升华！'
    };
  }

  // Four Pillar Ratings
  const pillarRatings = [
    {
      label: '大赛统治力',
      val: Math.min(100, Math.round(75 + unlockedTrophyCount * 6.2)),
      color: 'text-amber-400',
      barColor: 'bg-amber-400',
      icon: Trophy
    },
    {
      label: '巅峰个人硬实力',
      val: avgSkill,
      color: 'text-cyan-400',
      barColor: 'bg-cyan-400',
      icon: Zap
    },
    {
      label: '历史胜率统治',
      val: winRate,
      color: 'text-emerald-400',
      barColor: 'bg-emerald-400',
      icon: TrendingUp
    },
    {
      label: '商业身价与知名度',
      val: Math.min(100, Math.round(85 + (totalLifetimeCash / 1000000) * 12)),
      color: 'text-fuchsia-400',
      barColor: 'bg-fuchsia-400',
      icon: DollarSign
    }
  ];

  // Career Development Progression Data across player's stages
  const careerProgressionTimeline = [
    {
      stage: '路人王崛起',
      milestone: '国服登顶',
      mechanics: Math.max(45, Math.round(peakMechanics * 0.55)),
      macro: Math.max(35, Math.round(peakMental * 0.42)),
      fame: 15
    },
    {
      stage: '青训试训',
      milestone: '签约俱乐部',
      mechanics: Math.max(58, Math.round(peakMechanics * 0.70)),
      macro: Math.max(50, Math.round(peakMental * 0.60)),
      fame: 32
    },
    {
      stage: '次级联赛',
      milestone: 'LDL皇帝',
      mechanics: Math.max(70, Math.round(peakMechanics * 0.82)),
      macro: Math.max(65, Math.round(peakMental * 0.75)),
      fame: 52
    },
    {
      stage: 'LPL首秀',
      milestone: '最佳新秀',
      mechanics: Math.max(80, Math.round(peakMechanics * 0.90)),
      macro: Math.max(76, Math.round(peakMental * 0.85)),
      fame: 74
    },
    {
      stage: '巅峰捧杯',
      milestone: '全球总决赛FMVP',
      mechanics: peakMechanics,
      macro: peakMental,
      fame: Math.max(90, fame)
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/92 backdrop-blur-md animate-fade-in select-none overflow-y-auto">
      <div className="relative max-w-lg w-full bg-[#0a0e17] border-2 border-amber-500/80 rounded-2xl p-4 sm:p-6 shadow-[0_0_80px_rgba(245,158,11,0.35)] chamfer-card my-auto space-y-4">
        {/* Ambient Top Glow Halo */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-44 h-44 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* 1. Header & Golden Hall of Fame Badge */}
        <div className="text-center relative">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-b from-amber-500/25 to-slate-900 border border-amber-500/50 text-amber-300 mb-2 shadow-[0_0_24px_rgba(245,158,11,0.4)] animate-bounce">
            <Crown className="w-10 h-10" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-tech font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm block mx-auto">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>职业生涯荣誉挂靴 · 殿堂级退役典礼</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black font-tech text-white mt-1.5 tracking-wide">
            退役封神 · 全资入主豪门开创王朝
          </h3>
          <p className="text-[11px] text-slate-400 font-sans mt-0.5">
            以职业战队队长身份功成身退，正式转型为俱乐部控股老板兼总经理 (GM)
          </p>
        </div>

        {/* ======================================================================= */}
        {/* 2. 'GREATEST PLAYER OF ALL TIME' (GOAT) RATING INDEX HERO CARD */}
        {/* ======================================================================= */}
        <div 
          className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-950 to-amber-950/40 border-2 border-amber-500/70 shadow-xl relative overflow-hidden"
          style={{ boxShadow: `0 0 30px ${goatTier.glowColor}` }}
        >
          {/* Subtle Background Watermark */}
          <div className="absolute right-2 -bottom-4 opacity-10 pointer-events-none text-7xl font-black font-tech text-amber-400 select-none">
            GOAT
          </div>

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span className="text-[10px] font-tech font-extrabold uppercase tracking-wider text-amber-300">
                GOAT 历史第一人历史评级指数
              </span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-tech font-black tracking-wider uppercase shadow-md ${goatTier.badgeBg}`}>
              评级 {goatTier.grade}
            </span>
          </div>

          {/* Large GOAT Score Display */}
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <div className="text-3xl sm:text-4xl font-black font-code text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 tracking-tight flex items-baseline gap-1">
                <span>{goatIndex.toFixed(1)}</span>
                <span className="text-xs text-amber-400/80 font-tech">/ 100</span>
              </div>
              <div className="text-xs font-tech font-extrabold text-white mt-0.5">
                {goatTier.title}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-tech text-slate-400">历史地位加权</div>
              <div className="text-xs font-code font-bold text-emerald-400">
                全服前 0.01%
              </div>
            </div>
          </div>

          {/* Flavor Lore Quote */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[10px] text-slate-300 font-sans leading-relaxed italic border-l-2 border-l-amber-400">
            "{goatTier.quote}"
          </div>

          {/* Four Pillar Progress Bars */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-800/80">
            {pillarRatings.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-tech">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Icon className="w-3 h-3 text-slate-400" />
                      <span>{p.label}</span>
                    </span>
                    <span className={`font-code font-bold ${p.color}`}>{p.val}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${p.barColor}`}
                      style={{ width: `${p.val}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 3. CAREER ACHIEVEMENTS SUMMARY (TROPHIES & LIFETIME EARNINGS) */}
        {/* ======================================================================= */}
        <div className="space-y-2">
          {/* Lifetime Earnings & Match Win/Loss Ratio Card */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-emerald-500/40">
              <span className="text-[10px] font-tech text-slate-400 uppercase flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-400" /> 职业生涯累计总收入
              </span>
              <div className="text-base sm:text-lg font-black font-code text-emerald-300">
                ${totalLifetimeCash.toLocaleString()}
              </div>
              <div className="text-[9px] text-emerald-400/90 font-tech mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span>已达成 $1,000,000 收购门槛</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-cyan-500/40">
              <span className="text-[10px] font-tech text-slate-400 uppercase flex items-center gap-1">
                <Swords className="w-3 h-3 text-cyan-400" /> 赛场战绩与总胜率
              </span>
              <div className="text-base sm:text-lg font-black font-code text-cyan-300">
                {wins}胜 {losses}负
                <span className="text-xs text-slate-400 ml-1 font-normal font-sans">({winRate}%)</span>
              </div>
              <div className="text-[9px] text-cyan-400/90 font-tech mt-0.5">
                总场次 {totalGames} 场 · 微操 {peakMechanics} / 心态 {peakMental}
              </div>
            </div>
          </div>

          {/* Trophy Showcase Cabinet */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-tech font-bold text-white uppercase flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" /> 
                <span>生涯荣誉奖杯陈列柜</span>
              </span>
              <span className="text-[10px] font-code font-bold text-amber-300">
                已斩获 {unlockedTrophyCount} / 4 座殿堂奖杯
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {trophyList.map(t => (
                <div
                  key={t.id}
                  className={`p-2 rounded-lg border text-left transition flex items-start gap-2 ${
                    t.unlocked
                      ? 'bg-amber-950/20 border-amber-500/50 shadow-sm'
                      : 'bg-slate-950/40 border-slate-800/80 opacity-40'
                  }`}
                >
                  <span className="text-lg shrink-0 mt-0.5">{t.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className={`text-[10px] font-tech font-bold truncate ${t.unlocked ? 'text-white' : 'text-slate-500'}`}>
                        {t.name}
                      </div>
                    </div>
                    <div className="text-[8px] text-slate-400 truncate mt-0.5">
                      {t.desc}
                    </div>
                    <div className="text-[8px] font-tech mt-0.5">
                      {t.unlocked ? (
                        <span className="text-amber-400 font-bold">已入驻展柜 ✓</span>
                      ) : (
                        <span className="text-slate-600">未解锁</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Career Development Area Chart (生涯全周期能力飞跃曲线) */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-tech font-bold text-white uppercase flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>职业生涯成长轨迹 · 能力与身价跃升曲线</span>
              </span>
              <div className="flex items-center gap-2 text-[9px] font-tech">
                <span className="flex items-center gap-1 text-cyan-300">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" /> 微操
                </span>
                <span className="flex items-center gap-1 text-purple-300">
                  <span className="w-2 h-2 rounded-full bg-purple-400" /> 大局观
                </span>
                <span className="flex items-center gap-1 text-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> 知名度
                </span>
              </div>
            </div>

            <div className="h-40 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={careerProgressionTimeline} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMech" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorMacro" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c084fc" stopOpacity={0.7}/>
                      <stop offset="95%" stopColor="#c084fc" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorFame" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="stage" 
                    tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'monospace' }} 
                    axisLine={{ stroke: '#334155' }}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fill: '#64748b', fontSize: 8, fontFamily: 'monospace' }} 
                    axisLine={{ stroke: '#334155' }}
                    tickLine={false}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-2 rounded-lg bg-slate-950 border border-slate-700 text-[10px] shadow-xl font-tech">
                            <div className="font-bold text-amber-300 flex items-center justify-between gap-2 border-b border-slate-800 pb-1 mb-1">
                              <span>{data.stage}</span>
                              <span className="text-cyan-300 font-code">★ {data.milestone}</span>
                            </div>
                            <div className="text-cyan-300 flex items-center justify-between gap-3">
                              <span>微操能力:</span>
                              <span className="font-code font-bold">{data.mechanics}</span>
                            </div>
                            <div className="text-purple-300 flex items-center justify-between gap-3">
                              <span>大局观:</span>
                              <span className="font-code font-bold">{data.macro}</span>
                            </div>
                            <div className="text-amber-400 flex items-center justify-between gap-3">
                              <span>知名度:</span>
                              <span className="font-code font-bold">{data.fame}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type="monotone" dataKey="mechanics" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#colorMech)" />
                  <Area type="monotone" dataKey="macro" stroke="#c084fc" strokeWidth={2} fillOpacity={1} fill="url(#colorMacro)" />
                  <Area type="monotone" dataKey="fame" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorFame)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Key Milestone Nodes Highlight */}
            <div className="grid grid-cols-5 gap-1 text-center pt-1 border-t border-slate-800/80">
              {careerProgressionTimeline.map((item, idx) => (
                <div key={idx} className="p-1 rounded bg-slate-950/80 border border-slate-800">
                  <div className="text-[8px] text-slate-400 font-tech truncate">{item.stage}</div>
                  <div className="text-[8px] font-bold text-amber-300 font-code truncate">{item.milestone}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transition Summary Narrative */}
        <p className="text-slate-300 text-[11px] leading-relaxed bg-slate-950/80 p-3 rounded-xl border border-slate-800 font-sans">
          你已在召唤师峡谷立下赫赫威名，积累了 <span className="text-emerald-400 font-bold font-code">${totalLifetimeCash.toLocaleString()}</span> 巨额生涯总财富。
          支付 <span className="text-amber-400 font-bold font-code">$1,000,000</span> 完成俱乐部股权收购后，你将作为 <span className="text-white font-bold font-tech">俱乐部唯一掌舵人兼总经理 (GM)</span>，执掌五人首发阵容、商业赞助、粉丝经济与基地扩建，正式开启第 3 阶段「王朝模式」！
        </p>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => {
              soundEngine.playCoin();
              soundEngine.playVictory();
              confetti({
                particleCount: 80,
                spread: 80,
                origin: { y: 0.6 },
                colors: ['#f59e0b', '#38bdf8', '#10b981', '#d946ef']
              });
              onRetireAndBuyOrg();
            }}
            className="w-full py-3.5 px-4 rounded-xl font-bold font-tech text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer active:scale-98 chamfer-btn"
          >
            <Building2 className="w-5 h-5 fill-current shrink-0" />
            <span className="text-xs sm:text-sm tracking-wide">
              支付 $1,000,000 收购俱乐部 · 开启第 3 阶段王朝模式 →
            </span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onStayPlaying();
            }}
            className="w-full py-2.5 px-4 rounded-xl font-tech text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition cursor-pointer text-xs"
          >
            暂不退役，继续留在赛场征战积累荣誉
          </button>
        </div>
      </div>
    </div>
  );
};
