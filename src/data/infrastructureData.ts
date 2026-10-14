import { FacilityUpgrade, InfrastructureStats } from '../types/game';

export interface GamingHouseFacilityDef {
  id: string;
  name: string;
  englishName: string;
  category: 'INTERNET' | 'ERGONOMICS' | 'KITCHEN' | 'PHYSIO' | 'SLEEP' | 'LOUNGE';
  icon: string;
  badgeEmoji: string;
  tagline: string;
  defaultTier: number;
  maxTier: number;
  costs: number[]; // cost to upgrade to tier 1, 2, 3, 4, 5
  moraleBonusPerTier: number[]; // permanent morale bonus at each tier
  recoveryBonusPerTier: number[]; // recovery speed bonus % at each tier
  tierTitles: string[];
  tierDescriptions: string[];
  tierKeyFeatures: string[];
}

export const GAMING_HOUSE_FACILITY_DEFS: GamingHouseFacilityDef[] = [
  {
    id: 'fac_fiber',
    name: '专线万兆极速光纤网络',
    englishName: 'Ultra-low Latency Fiber Internet',
    category: 'INTERNET',
    icon: '⚡',
    badgeEmoji: '🌐',
    tagline: '消除全队排位与训练赛跳Ping隐患，极致顺畅提升选手专注与状态恢复',
    defaultTier: 1,
    maxTier: 5,
    costs: [0, 32000, 58000, 95000, 150000],
    moraleBonusPerTier: [2, 5, 9, 14, 20],
    recoveryBonusPerTier: [10, 20, 35, 55, 80],
    tierTitles: [
      '标准商用宽带 (1Gbps / 18ms)',
      '万兆独享光纤直连 (10Gbps / 6ms)',
      '跨国韩服电竞专线 (BGP直通 / 2ms)',
      '双路自愈冷备冗余机房 (零丢包架构)',
      '量子同步光子交换总枢纽 (0.5ms极速网络)'
    ],
    tierDescriptions: [
      '基础商用千兆网络，日常天梯排位偶有波动，选手状态受偶发网络延迟轻微影响。',
      '铺设俱乐部万兆专线光纤，接入三大运营商BGP汇聚节点，训练赛Ping值稳如泰山。',
      '开通韩服高分段直连隧道，低延迟犹如首尔本地打排位，大幅缓解选手排位受挫心态。',
      '两路独立变电与双骨干光缆冷热双备，即使暴雨雷暴天气依然坚如磐石，赛前热身毫无卡顿。',
      '全球顶尖科技赋能的零抖动光子枢纽，提供无与伦比的极速传输，选手身心沉浸在纯粹竞技心流中。'
    ],
    tierKeyFeatures: [
      '基础防丢包保障 • 士气底限+2%',
      '韩服低延迟隧道 • 恢复速率+20% • 士气+5%',
      '全队排位连胜心流 • 恢复速率+35% • 士气+9%',
      '双路毫秒自愈切换 • 恢复速率+55% • 士气+14%',
      '终极零抖动神级节点 • 恢复速率+80% • 永久士气+20%'
    ]
  },
  {
    id: 'fac_ergo',
    name: '定制人体工学电竞座舱',
    englishName: 'Ergonomic Battle Stations & Seating',
    category: 'ERGONOMICS',
    icon: '🪑',
    badgeEmoji: '🦾',
    tagline: '定制减压太空电竞椅与电动升降战术台，杜绝腰颈劳损，永久锁固选手微操巅峰',
    defaultTier: 1,
    maxTier: 5,
    costs: [0, 35000, 62000, 105000, 168000],
    moraleBonusPerTier: [3, 6, 10, 15, 22],
    recoveryBonusPerTier: [12, 25, 42, 65, 90],
    tierTitles: [
      '标准职业电竞桌椅套装',
      'Herman Miller 定制护脊人体工学椅',
      '智能记忆电动升降战术台与超宽悬浮屏',
      '生物力学肌肉减压座舱与磁浮托腕系统',
      '零重力全包裹太空竞技座舱 (巅峰神装)'
    ],
    tierDescriptions: [
      '配备统一的赛级电竞桌椅，具备基本高低调节，满足每日高强度对抗需求。',
      '全员换装国际顶奢 Herman Miller 定制护脊网椅，完美支撑腰椎与尾椎，久坐不累。',
      '配置智能记忆升降桌与低蓝光护眼高刷悬浮显示臂，坐站交替激活选手末梢神经血液循环。',
      '配备航天级记忆吸能材质、磁浮减震手托与微循环透气控温座垫，大幅消除手部腱鞘紧张。',
      '完全根据每位选手骨骼扫描定制的零重力太空战术座舱，彻底消解脊柱压力，肌肉疲劳光速消退。'
    ],
    tierKeyFeatures: [
      '基础久坐支撑 • 恢复速率+12% • 士气+3%',
      '人体工学护腰减压 • 恢复速率+25% • 士气+6%',
      '站坐节律调控 • 恢复速率+42% • 士气+10%',
      '腱鞘防劳损磁浮保护 • 恢复速率+65% • 士气+15%',
      '零重力终极解压座舱 • 恢复速率+90% • 永久士气+22%'
    ]
  },
  {
    id: 'fac_kitchen',
    name: '战队星级营养私厨与膳食工坊',
    englishName: 'Michelin Team Kitchen & Sports Nutrition',
    category: 'KITCHEN',
    icon: '🍳',
    badgeEmoji: '🥗',
    tagline: '米其林主厨与专业运动营养师驻队，定制精力充沛餐单，让全员幸福感与士气常年爆棚',
    defaultTier: 0,
    maxTier: 5,
    costs: [26000, 42000, 72000, 118000, 180000],
    moraleBonusPerTier: [4, 8, 13, 19, 26],
    recoveryBonusPerTier: [15, 28, 46, 70, 95],
    tierTitles: [
      '外聘清洁轻食配餐间',
      '驻队职业营养师与全天候热餐厨房',
      '米其林二星行政主厨定制私房佳肴',
      '神经兴奋度精算定制机能料理体系',
      '皇家生物节律抗疲劳高能盛宴工坊'
    ],
    tierDescriptions: [
      '告别油腻外卖，引入第三方合规电竞轻食配送与现磨咖啡机，确保基础食品安全与肠胃舒适。',
      '聘请资深运动营养师进驻基地，采购有机果蔬与谷饲牛排，全天候供应暖心夜宵与高蛋白炖汤。',
      '高薪礼聘米其林二星行政主厨掌勺，兼顾南北方及外籍选手口味偏好，赛前赛后幸福感洋溢。',
      '基于选手血液体检报告定制微量元素机能餐与电解质特饮，赛场大脑反应敏捷，抗压能力卓越。',
      '融合世界前沿脑科学营养配比的顶级食疗体系，选手抗疲劳能力拉满，心态随时保持昂扬高亢。'
    ],
    tierKeyFeatures: [
      '健康温热三餐保障 • 恢复速率+15% • 士气+4%',
      '全天候私厨能量补给 • 恢复速率+28% • 士气+8%',
      '米其林级美食治愈 • 恢复速率+46% • 士气+13%',
      '机能特饮神经抗疲劳 • 恢复速率+70% • 士气+19%',
      '极致脑力能量盛宴 • 恢复速率+95% • 永久士气+26%'
    ]
  },
  {
    id: 'fac_physio',
    name: '运动医学康复与冷冻水疗舱',
    englishName: 'Sports Medicine & Cryotherapy Spa',
    category: 'PHYSIO',
    icon: '💆',
    badgeEmoji: '🧊',
    tagline: '零下110度超低温冷冻舱与手部理疗大师，深层排出乳酸，赛后重度疲劳光速清零',
    defaultTier: 0,
    maxTier: 5,
    costs: [30000, 49000, 80000, 126000, 195000],
    moraleBonusPerTier: [3, 7, 12, 18, 25],
    recoveryBonusPerTier: [18, 35, 58, 85, 120],
    tierTitles: [
      '基础筋膜枪与理疗按摩室',
      '专业驻队运动推拿师与中频理疗仪',
      '德国进口超低温全身冷冻舱 (-110°C)',
      '高压高氧水疗按摩浴缸与红光修复室',
      '奥运级深层运动医学全息运动康复中心'
    ],
    tierDescriptions: [
      '配备高端筋膜枪、热敷护腕和颈椎牵引器，帮助选手在训练间隙缓解肌肉紧绷。',
      '聘请曾服务国家队的运动康复推拿师，每日定时为五虎进行手腕腱鞘排毒与肩颈深层松解。',
      '引进德国高端全身冷冻恢复舱，3分钟急冻刺激全身血液回流，炎症因子骤降，疲劳一扫而空。',
      '配备1.5个大气压高压氧舱与微循环红光胶囊，加速细胞ATP生成，深夜集训依然目光如炬。',
      '涵盖全身体态纠正、神经肌肉重塑与全息生物反馈的殿堂级康复堡垒，职业寿命与状态极速焕新。'
    ],
    tierKeyFeatures: [
      '基础手颈放松 • 恢复速率+18% • 士气+3%',
      '国家队理疗师推拿 • 恢复速率+35% • 士气+7%',
      '全身冷冻舱乳酸骤降 • 恢复速率+58% • 士气+12%',
      '高压氧舱精力灌顶 • 恢复速率+85% • 士气+18%',
      '奥运级巅峰康复中心 • 恢复速率+120% • 永久士气+25%'
    ]
  },
  {
    id: 'fac_sleep',
    name: '智能降噪睡眠太空舱套房',
    englishName: 'Acoustic Sleep Sanctuary & Suites',
    category: 'SLEEP',
    icon: '🛌',
    badgeEmoji: '🌙',
    tagline: '主动降噪、昼夜节律调光与定制深睡床垫，赛程再紧凑也能保障高质量黄金深睡眠',
    defaultTier: 0,
    maxTier: 5,
    costs: [24000, 39000, 68000, 110000, 175000],
    moraleBonusPerTier: [3, 6, 11, 16, 23],
    recoveryBonusPerTier: [14, 28, 48, 72, 100],
    tierTitles: [
      '双人标准整洁宿舍',
      '单人静音隔音套房与遮光天鹅绒窗帘',
      '智能微气候温湿恒定休养室与海丝腾床垫',
      '脑电波诱导深睡眠智能太空舱',
      '全息昼夜节律抗时差顶级安眠庇护所'
    ],
    tierDescriptions: [
      '温馨双人宿舍，配置独立卫浴与静音空调，为年轻选手提供遮风避雨的温暖小窝。',
      '全面升级为单人独栋套房，采用双层阻尼隔音玻璃，确保即使熬夜训练后也能安静补觉不受打扰。',
      '配备瑞典奢华手工床垫与负氧离子新风系统，空气洁净度达到医疗级别，晨起神清气爽。',
      '引入脑电α波智能睡眠舱，通过特定双耳节拍诱导迅速进入深睡眠，4小时睡眠媲美8小时效果。',
      '全息昼夜节律调光与微重力睡眠吊舱，无论备战跨时区世界赛还是连续征战，全员秒入甜梦。'
    ],
    tierKeyFeatures: [
      '独立卫浴静音套间 • 恢复速率+14% • 士气+3%',
      '双层静音隔音保障 • 恢复速率+28% • 士气+6%',
      '恒温恒湿新风深睡 • 恢复速率+48% • 士气+11%',
      '脑电α波智能舱 • 恢复速率+72% • 士气+16%',
      '零时差全息安眠殿堂 • 恢复速率+100% • 永久士气+23%'
    ]
  },
  {
    id: 'fac_lounge',
    name: '休娱社交公馆与精品咖啡吧',
    englishName: 'Recreation Lounge & Coffee Bar',
    category: 'LOUNGE',
    icon: '☕',
    badgeEmoji: '🎱',
    tagline: '台球推杆、次时代主机、精品手冲与心理社交沙龙，彻底化解队内心魔，熔铸更强羁绊',
    defaultTier: 0,
    maxTier: 5,
    costs: [22000, 36000, 64000, 102000, 165000],
    moraleBonusPerTier: [4, 7, 12, 18, 25],
    recoveryBonusPerTier: [10, 22, 38, 58, 85],
    tierTitles: [
      '简易零食休息角与饮水机',
      '桌游卡牌角与定制专业台球桌',
      '次世代主机影音娱乐室 (4K环绕立体声)',
      '精品手冲咖啡吧台与心灵树洞茶室',
      '云端全景观景豪门社交会所'
    ],
    tierDescriptions: [
      '训练室一隅设立休息角，常备可乐零食和懒人沙发，训练赛复盘间隙轻松交流。',
      '开辟专属休闲大厅，配备专业斯诺克球桌与热门桌游，促进队友之间亲密无间的线下友谊。',
      '打造专业隔音家庭影院，配备巨幅投影与最新款主机游戏，大赛前夕全员组队通关解压放松。',
      '引入特调精品手冲咖啡豆与花草茶吧，配备心理导师驻点畅聊，赛场压力与逆风负面情绪及时疏导。',
      '坐拥天际线视野的豪华豪门会馆，顶配娱乐、露天花园与星光露台，队员自豪感与归属感直接拉满。'
    ],
    tierKeyFeatures: [
      '茶水零食沟通角 • 恢复速率+10% • 士气+4%',
      '台球互动融洽队内氛围 • 恢复速率+22% • 士气+7%',
      '影音主机全员减压 • 恢复速率+38% • 士气+12%',
      '精品咖啡与心理疏导 • 恢复速率+58% • 士气+18%',
      '云端豪门会所 • 恢复速率+85% • 永久士气+25%'
    ]
  }
];

// Helper: Ensure full 6 gaming house facilities in dynasty state
export function syncInfrastructureFacilities(existingFacilities: FacilityUpgrade[] = []): FacilityUpgrade[] {
  return GAMING_HOUSE_FACILITY_DEFS.map(def => {
    const existing = existingFacilities.find(f => f.id === def.id);
    const tier = existing ? existing.tier : def.defaultTier;
    const currentCost = tier >= def.maxTier ? 0 : def.costs[tier];
    const currentMorale = tier > 0 ? def.moraleBonusPerTier[tier - 1] : 0;
    const currentRecovery = tier > 0 ? def.recoveryBonusPerTier[tier - 1] : 0;
    const currentTitle = tier > 0 ? def.tierTitles[tier - 1] : '待建设';

    return {
      id: def.id,
      name: def.name,
      englishName: def.englishName,
      tier,
      maxTier: def.maxTier,
      cost: currentCost,
      description: tier > 0 ? def.tierDescriptions[tier - 1] : def.tagline,
      effectLabel: `+${currentMorale}% 永久士气 • +${currentRecovery}% 恢复速率`,
      icon: def.icon,
      category: def.category,
      permanentMoraleBonus: currentMorale,
      recoverySpeedMultiplier: currentRecovery,
      tierPerkName: currentTitle,
      tierPerkDescription: tier > 0 ? def.tierKeyFeatures[tier - 1] : '尚未激活'
    };
  });
}

// Helper: Calculate totals from current facilities list
export function calculateInfrastructureStats(facilities: FacilityUpgrade[]): InfrastructureStats {
  let totalMorale = 0;
  let totalRecovery = 0;
  let totalTiers = 0;

  facilities.forEach(fac => {
    const def = GAMING_HOUSE_FACILITY_DEFS.find(d => d.id === fac.id);
    if (def && fac.tier > 0) {
      const idx = Math.min(fac.tier - 1, def.maxTier - 1);
      totalMorale += def.moraleBonusPerTier[idx] || 0;
      totalRecovery += def.recoveryBonusPerTier[idx] || 0;
      totalTiers += fac.tier;
    } else if (fac.permanentMoraleBonus || fac.recoverySpeedMultiplier) {
      totalMorale += fac.permanentMoraleBonus || 0;
      totalRecovery += fac.recoverySpeedMultiplier || 0;
      totalTiers += fac.tier;
    }
  });

  // Calculate stars: total max tiers = 30 (6 facilities * 5 tiers)
  let stars = 1;
  let gradeLabel = 'D 级 · 初建俱乐部网吧式基地';
  if (totalTiers >= 25) {
    stars = 5;
    gradeLabel = 'SSS 级 · 全球巅峰殿堂豪门电竞天宫';
  } else if (totalTiers >= 18) {
    stars = 4;
    gradeLabel = 'S 级 · 国际超一流标杆电竞基地';
  } else if (totalTiers >= 12) {
    stars = 3;
    gradeLabel = 'A 级 · 顶级联赛成熟豪门基地';
  } else if (totalTiers >= 6) {
    stars = 2;
    gradeLabel = 'B 级 · 职业化电竞专属独栋基地';
  }

  return {
    totalPermanentMoraleBonus: totalMorale,
    totalRecoverySpeedMultiplier: totalRecovery,
    gamingHouseStars: stars,
    facilityGradeLabel: gradeLabel
  };
}
