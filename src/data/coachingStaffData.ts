import { Coach, CoachingStaffState, CoachSpecialization } from '../types/game';

export const SPECIALIZATION_CONFIG: Record<CoachSpecialization, {
  label: string;
  enLabel: string;
  icon: string;
  accentColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  primaryStat: string;
  description: string;
}> = {
  Strategic: {
    label: '战术大局教练',
    enLabel: 'Strategic Coach',
    icon: '🧠',
    accentColor: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/20',
    badgeBorder: 'border-cyan-500/40',
    badgeText: 'text-cyan-300',
    primaryStat: '大局观 (Macro)',
    description: '负责BP博弈、大龙坑拉扯、兵线运营沙盘推演与史诗野怪节奏指挥。'
  },
  Mental: {
    label: '竞技心理督导',
    enLabel: 'Mental Coach',
    icon: '🛡️',
    accentColor: 'text-rose-400',
    badgeBg: 'bg-rose-500/20',
    badgeBorder: 'border-rose-500/40',
    badgeText: 'text-rose-300',
    primaryStat: '士气心态 (Morale)',
    description: '负责决胜局心态防崩盘、逆风绝境抗压心流、队员赛前释压与士气护甲。'
  },
  Mechanical: {
    label: '个人微操教练',
    enLabel: 'Mechanical Coach',
    icon: '⚡',
    accentColor: 'text-amber-400',
    badgeBg: 'bg-amber-500/20',
    badgeBorder: 'border-amber-500/40',
    badgeText: 'text-amber-300',
    primaryStat: '微操技术 (Mechanics)',
    description: '负责极限手速走A、对线卡兵线换血压制、毫秒技能闪现闪避与1v1死斗切磋。'
  }
};

export const AVAILABLE_COACHES: Coach[] = [
  // --- 1. STRATEGIC COACHES ---
  {
    id: 'coach-strat-kkoma',
    name: '金正均 (kkOma)',
    title: '功勋三冠传奇教父',
    specialization: 'Strategic',
    tier: 'LEGENDARY',
    avatar: '👔',
    country: '韩国',
    age: 39,
    philosophy: '铁腕纪律与严谨运营沙盘推演，BP阶段提前算死对手三步棋。',
    hiringCost: 45000,
    weeklySalary: 5500,
    passiveBonuses: {
      mechanics: 2,
      macro: 8,
      morale: 5,
      tacticalNote: 'BP博弈胜率 +18% · 全图大局视野无死角'
    }
  },
  {
    id: 'coach-strat-kenzhu',
    name: '朱开 (KenZhu)',
    title: '世界冠军激情战术总监',
    specialization: 'Strategic',
    tier: 'ELITE',
    avatar: '🎙️',
    country: '中国',
    age: 36,
    philosophy: '激情鸡汤战术融合，极致凝聚团战协同与逆风绝境翻盘信仰。',
    hiringCost: 28000,
    weeklySalary: 3800,
    passiveBonuses: {
      mechanics: 0,
      macro: 5,
      morale: 6,
      tacticalNote: '决胜局绝境开团翻盘成功率 +15%'
    }
  },
  {
    id: 'coach-strat-tabe',
    name: '王柏勤 (Tabe)',
    title: '鬼才黑科技战术导师',
    specialization: 'Strategic',
    tier: 'ELITE',
    avatar: '♟️',
    country: '中国香港',
    age: 33,
    philosophy: '打破常规版本羁绊，擅长研发黑科技阵容攻其不备。',
    hiringCost: 32000,
    weeklySalary: 4200,
    passiveBonuses: {
      mechanics: 2,
      macro: 6,
      morale: 3,
      tacticalNote: '偏门克制英雄战术增益 +14%'
    }
  },
  {
    id: 'coach-strat-calyx',
    name: '顾玄 (Calyx)',
    title: '海量数据模型分析师',
    specialization: 'Strategic',
    tier: 'VETERAN',
    avatar: '📊',
    country: '中国',
    age: 28,
    philosophy: '依托全球大数据监控对手插眼习惯，精准预判敌方打野前10分钟路线。',
    hiringCost: 16000,
    weeklySalary: 2200,
    passiveBonuses: {
      mechanics: 0,
      macro: 4,
      morale: 0,
      tacticalNote: '大龙与先锋争夺侦测率 +10%'
    }
  },

  // --- 2. MENTAL COACHES ---
  {
    id: 'coach-ment-mentis',
    name: '李敏镐 (Dr. Mentis)',
    title: '运动神经心理学首席博士',
    specialization: 'Mental',
    tier: 'LEGENDARY',
    avatar: '🩺',
    country: '韩国',
    age: 44,
    philosophy: '应用生物脑电反馈与心理锚定，彻底根除赛前手抖、怯场与急躁心魔。',
    hiringCost: 42000,
    weeklySalary: 5200,
    passiveBonuses: {
      mechanics: 0,
      macro: 3,
      morale: 12,
      tacticalNote: '决胜局全队免疫心态崩盘 · 逆风决策零变形'
    }
  },
  {
    id: 'coach-ment-zen',
    name: '陈默 (ZenMaster)',
    title: '高压竞技心流冥想导师',
    specialization: 'Mental',
    tier: 'ELITE',
    avatar: '🧘',
    country: '中国',
    age: 37,
    philosophy: '以静制动，让选手在决胜局纷杂噪音中进入绝对专注的心流境界。',
    hiringCost: 26000,
    weeklySalary: 3600,
    passiveBonuses: {
      mechanics: 2,
      macro: 0,
      morale: 8,
      tacticalNote: '失误自责情绪清空 · 连续作战专注度不减'
    }
  },
  {
    id: 'coach-ment-vita',
    name: '林小薇 (Vita)',
    title: '金牌心理关怀督导',
    specialization: 'Mental',
    tier: 'VETERAN',
    avatar: '🍵',
    country: '中国',
    age: 29,
    philosophy: '温暖细致的生活心理支持，化解队内微小隔阂，营造温馨家庭式备战氛围。',
    hiringCost: 15000,
    weeklySalary: 2000,
    passiveBonuses: {
      mechanics: 0,
      macro: 0,
      morale: 5,
      tacticalNote: '首发五虎常态士气稳定在 85% 荣光线以上'
    }
  },

  // --- 3. MECHANICAL COACHES ---
  {
    id: 'coach-mech-uzi',
    name: '简自豪 (Uzi)',
    title: '终身对线压制战术顾问',
    specialization: 'Mechanical',
    tier: 'LEGENDARY',
    avatar: '🏹',
    country: '中国',
    age: 27,
    philosophy: '把对线基本功压制做到极致，距离感精确到每一码，团战暴风走A输出最大化。',
    hiringCost: 48000,
    weeklySalary: 6000,
    passiveBonuses: {
      mechanics: 8,
      macro: 0,
      morale: 4,
      tacticalNote: '对线期压刀率 +25% · 团战微操走A残血反杀'
    }
  },
  {
    id: 'coach-mech-theshy',
    name: '姜承録 (TheShy)',
    title: '刀尖起舞极限搏杀特训导师',
    specialization: 'Mechanical',
    tier: 'LEGENDARY',
    avatar: '⚔️',
    country: '韩国',
    age: 26,
    philosophy: '无惧被抓，用极致的操作在1对多绝境中撕开防线，把敌方拉入单挑死斗。',
    hiringCost: 46000,
    weeklySalary: 5800,
    passiveBonuses: {
      mechanics: 8,
      macro: 2,
      morale: 0,
      tacticalNote: '1v1绝境反杀单挑胜率 +22%'
    }
  },
  {
    id: 'coach-mech-cqc',
    name: '朴宰范 (CQC)',
    title: '天梯极限神经反射特训师',
    specialization: 'Mechanical',
    tier: 'ELITE',
    avatar: '⚡',
    country: '韩国',
    age: 29,
    philosophy: '特训刺客秒人连招肌肉记忆，将选手神经反射从250ms极限压低至180ms。',
    hiringCost: 27000,
    weeklySalary: 3700,
    passiveBonuses: {
      mechanics: 5,
      macro: 0,
      morale: 0,
      tacticalNote: '极限反手闪现开团反应时间 -30ms'
    }
  },
  {
    id: 'coach-mech-ironfist',
    name: '赵雷 (IronFist)',
    title: '青训基本功打磨老将',
    specialization: 'Mechanical',
    tier: 'VETERAN',
    avatar: '🥊',
    country: '中国',
    age: 32,
    philosophy: '千锤百炼不失误，每天500局补刀练习，夯实最坚韧稳固的对线基本功。',
    hiringCost: 15000,
    weeklySalary: 2100,
    passiveBonuses: {
      mechanics: 3,
      macro: 0,
      morale: 0,
      tacticalNote: '全员技能命中稳定率 +10%'
    }
  }
];

export const DEFAULT_COACHING_STAFF_STATE: CoachingStaffState = {
  hiredCoaches: {
    Strategic: null,
    Mental: null,
    Mechanical: null
  },
  totalHiringSpent: 0,
  history: []
};

// Calculate total passive bonuses granted by currently hired coaching staff
export function getCoachingStaffPassiveBonuses(coachingStaff?: CoachingStaffState): {
  mechanics: number;
  macro: number;
  morale: number;
  tacticalNotes: string[];
} {
  if (!coachingStaff?.hiredCoaches) {
    return { mechanics: 0, macro: 0, morale: 0, tacticalNotes: [] };
  }

  let mechanics = 0;
  let macro = 0;
  let morale = 0;
  const tacticalNotes: string[] = [];

  const { Strategic, Mental, Mechanical } = coachingStaff.hiredCoaches;

  if (Strategic) {
    mechanics += Strategic.passiveBonuses.mechanics || 0;
    macro += Strategic.passiveBonuses.macro || 0;
    morale += Strategic.passiveBonuses.morale || 0;
    if (Strategic.passiveBonuses.tacticalNote) {
      tacticalNotes.push(`【${Strategic.name}】${Strategic.passiveBonuses.tacticalNote}`);
    }
  }

  if (Mental) {
    mechanics += Mental.passiveBonuses.mechanics || 0;
    macro += Mental.passiveBonuses.macro || 0;
    morale += Mental.passiveBonuses.morale || 0;
    if (Mental.passiveBonuses.tacticalNote) {
      tacticalNotes.push(`【${Mental.name}】${Mental.passiveBonuses.tacticalNote}`);
    }
  }

  if (Mechanical) {
    mechanics += Mechanical.passiveBonuses.mechanics || 0;
    macro += Mechanical.passiveBonuses.macro || 0;
    morale += Mechanical.passiveBonuses.morale || 0;
    if (Mechanical.passiveBonuses.tacticalNote) {
      tacticalNotes.push(`【${Mechanical.name}】${Mechanical.passiveBonuses.tacticalNote}`);
    }
  }

  return { mechanics, macro, morale, tacticalNotes };
}

// Calculate total weekly salaries of hired coaches
export function calculateWeeklyStaffSalaries(coachingStaff?: CoachingStaffState): number {
  if (!coachingStaff?.hiredCoaches) return 0;
  let sum = 0;
  const { Strategic, Mental, Mechanical } = coachingStaff.hiredCoaches;
  if (Strategic) sum += Strategic.weeklySalary;
  if (Mental) sum += Mental.weeklySalary;
  if (Mechanical) sum += Mechanical.weeklySalary;
  return sum;
}
