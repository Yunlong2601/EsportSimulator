import { RecoveryRoomEnvironment } from '../types/game';

export interface RoomUpgradeLevel {
  level: number;
  name: string;
  nameEn: string;
  cost: number;
  description: string;
  energyBonus: number;
  focusBonus: number;
  mentalBonus: number;
  perkBadge: string;
}

export interface RoomUpgradeCategory {
  id: keyof RecoveryRoomEnvironment;
  title: string;
  titleEn: string;
  icon: string;
  color: string;
  tagline: string;
  levels: RoomUpgradeLevel[];
}

export const BASE_REST_STATS = {
  energy: 45,
  focus: 50,
  mental: 18
};

export const RECOVERY_ROOM_CATEGORIES: RoomUpgradeCategory[] = [
  {
    id: 'soundproofing',
    title: '声学降噪与隔音工程',
    titleEn: 'Acoustic Soundproofing',
    icon: 'VolumeX',
    color: 'from-blue-500 to-indigo-600',
    tagline: '隔绝街头喧嚣与窗外噪音，确保深层睡眠毫无打扰',
    levels: [
      {
        level: 0,
        name: '普通卧室薄墙',
        nameEn: 'Standard Thin Walls',
        cost: 0,
        description: '街头车水马龙与邻居杂音清晰可闻，夜间易惊醒。',
        energyBonus: 0,
        focusBonus: 0,
        mentalBonus: 0,
        perkBadge: '基础环境'
      },
      {
        level: 1,
        name: '密封隔音条与吸音加厚窗帘',
        nameEn: 'Acoustic Blackout Curtains',
        cost: 120,
        description: '加装高密度阻尼隔音帘与窗框密封胶条，阻挡40%外界高频杂音。',
        energyBonus: 5,
        focusBonus: 8,
        mentalBonus: 3,
        perkBadge: '初级降噪'
      },
      {
        level: 2,
        name: '双层中空静音窗与声学聚酯吸音板',
        nameEn: 'Studio Acoustic Panels',
        cost: 320,
        description: '专业录音棚级墙体吸音包覆与中空隔音玻璃，削减外界90%低频噪音，入睡效率大幅提升。',
        energyBonus: 12,
        focusBonus: 18,
        mentalBonus: 8,
        perkBadge: '录音棚级'
      },
      {
        level: 3,
        name: '航天级全密闭消音电竞静音深睡舱',
        nameEn: 'Anechoic Pro Sound Pod',
        cost: 750,
        description: '全金属外壳阻尼减震与航天级消音矩阵，达成万籁俱寂的绝对静音领域，享受婴儿般深睡眠！',
        energyBonus: 20,
        focusBonus: 30,
        mentalBonus: 15,
        perkBadge: '深海静谧'
      }
    ]
  },
  {
    id: 'bedding',
    title: '高奢人体工学寝具',
    titleEn: 'High-End Ergonomic Bedding',
    icon: 'BedDouble',
    color: 'from-purple-500 to-pink-600',
    tagline: '消除肩颈酸痛与手腕劳损，零体压全身肌肉彻底放松',
    levels: [
      {
        level: 0,
        name: '普通弹簧床与结块棉被',
        nameEn: 'Basic Spring Bed',
        cost: 0,
        description: '久睡腰背僵硬、手腕酸胀，翻身频繁难以进入深睡。',
        energyBonus: 0,
        focusBonus: 0,
        mentalBonus: 0,
        perkBadge: '基础寝具'
      },
      {
        level: 1,
        name: '慢回弹记忆枕与真丝遮光眼罩',
        nameEn: 'Memory Pillow & Silk Mask',
        cost: 150,
        description: '三曲线人体工学慢回弹护颈枕，释放高强度操作导致的颈部压力，真丝眼罩带来清凉放松。',
        energyBonus: 8,
        focusBonus: 10,
        mentalBonus: 4,
        perkBadge: '颈椎护养'
      },
      {
        level: 2,
        name: '天然乳胶七区释压深睡床垫',
        nameEn: '7-Zone Latex Mattress',
        cost: 380,
        description: '泰国进口高纯度天然乳胶，点对点动态承托脊椎与骨盆，夜间翻身次数减少65%。',
        energyBonus: 16,
        focusBonus: 20,
        mentalBonus: 10,
        perkBadge: '七区释压'
      },
      {
        level: 3,
        name: '智能恒温零重力悬浮深睡系统',
        nameEn: 'Zero-Gravity Smart Climate Bed',
        cost: 850,
        description: '电竞选手专用零重力倾角承托与水冷恒温微循环，彻底释放手部与脊柱疲劳，神级体能回血！',
        energyBonus: 25,
        focusBonus: 35,
        mentalBonus: 18,
        perkBadge: '零重力悬浮'
      }
    ]
  },
  {
    id: 'atmosphere',
    title: '微气候环境与富氧理疗',
    titleEn: 'Microclimate & Oxygen Therapy',
    icon: 'Wind',
    color: 'from-emerald-500 to-teal-600',
    tagline: '控制室内湿度、温度与富氧含量，加速细胞排毒与神经元修复',
    levels: [
      {
        level: 0,
        name: '密闭干燥室内空气',
        nameEn: 'Dry Stuffy Air',
        cost: 0,
        description: '空气流通欠佳，晨起口干舌燥，大脑缺氧昏沉。',
        energyBonus: 0,
        focusBonus: 0,
        mentalBonus: 0,
        perkBadge: '原始微环境'
      },
      {
        level: 1,
        name: '负离子香薰加湿与助眠白噪音仪',
        nameEn: 'Aromatherapy & White Noise',
        cost: 100,
        description: '薰衣草助眠精油微雾滋润呼吸道，柔和粉红噪音快速诱导大脑进入德尔塔深睡脑电波。',
        energyBonus: 6,
        focusBonus: 8,
        mentalBonus: 5,
        perkBadge: '芳香助眠'
      },
      {
        level: 2,
        name: '医疗级微纳米新风恒湿循环系统',
        nameEn: 'Medical Clean Air System',
        cost: 280,
        description: 'H13级HEPA滤网与全天候恒温恒湿调控，提供森林氧吧般的清新空气，消除大脑乳酸疲劳堆积。',
        energyBonus: 12,
        focusBonus: 16,
        mentalBonus: 10,
        perkBadge: '森林氧吧'
      },
      {
        level: 3,
        name: '1.3ATA高压微氧睡眠康复舱',
        nameEn: 'Hyperbaric Oxygen Chamber',
        cost: 680,
        description: '顶级职业俱乐部同款高压氧疗设备，毛细血管极速供氧，细胞受损组织光速愈合，脑力秒重置！',
        energyBonus: 22,
        focusBonus: 28,
        mentalBonus: 16,
        perkBadge: '高压氧疗'
      }
    ]
  }
];

export function getRecoveryRoomBonuses(room?: RecoveryRoomEnvironment) {
  const currentRoom: RecoveryRoomEnvironment = room || {
    soundproofing: 0,
    bedding: 0,
    atmosphere: 0
  };

  let energyBonus = 0;
  let focusBonus = 0;
  let mentalBonus = 0;

  for (const cat of RECOVERY_ROOM_CATEGORIES) {
    const lvl = currentRoom[cat.id] || 0;
    const levelData = cat.levels[lvl] || cat.levels[0];
    energyBonus += levelData.energyBonus;
    focusBonus += levelData.focusBonus;
    mentalBonus += levelData.mentalBonus;
  }

  return {
    energyBonus,
    focusBonus,
    mentalBonus,
    totalBonusRate: Math.round(((focusBonus + energyBonus) / (BASE_REST_STATS.focus + BASE_REST_STATS.energy)) * 100)
  };
}

export function getTotalRestStats(room?: RecoveryRoomEnvironment) {
  const bonuses = getRecoveryRoomBonuses(room);
  return {
    energy: BASE_REST_STATS.energy + bonuses.energyBonus,
    focus: BASE_REST_STATS.focus + bonuses.focusBonus,
    mental: BASE_REST_STATS.mental + bonuses.mentalBonus,
    bonuses
  };
}
