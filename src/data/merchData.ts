import { 
  JerseyCustomizerConfig, 
  MerchItem, 
  MerchShopState,
  JerseyPatternType,
  JerseyCrestType,
  JerseyPriceTier
} from '../types/game';

export interface PatternInfo {
  id: JerseyPatternType;
  name: string;
  desc: string;
  hypeBoost: number;
  previewClass: string;
}

export const JERSEY_PATTERNS: PatternInfo[] = [
  {
    id: 'solid',
    name: '纯粹极简 (Clean Solid)',
    desc: '经典磨砂哑光质感，凸显战队本色',
    hypeBoost: 0,
    previewClass: 'bg-slate-900'
  },
  {
    id: 'carbon_fiber',
    name: '碳纤维几何 (Carbon Fiber)',
    desc: '高科技斜纹碳纤编织，硬派电竞质感',
    hypeBoost: 8,
    previewClass: 'bg-neutral-950'
  },
  {
    id: 'neon_grid',
    name: '霓虹矩阵 (Neon Grid)',
    desc: '赛博朋克发光网格透视，年轻潮流风向标',
    hypeBoost: 12,
    previewClass: 'bg-cyan-950'
  },
  {
    id: 'cyber_stripes',
    name: '竞速光芒 (Cyber Stripes)',
    desc: '动态双斜切竞技战刃条纹，视觉张力拉满',
    hypeBoost: 10,
    previewClass: 'bg-indigo-950'
  },
  {
    id: 'geometric_camo',
    name: '几何数码迷彩 (Digital Camo)',
    desc: '前沿数码切面迷彩，象征无形杀气与战术执行',
    hypeBoost: 11,
    previewClass: 'bg-slate-950'
  },
  {
    id: 'lightning_split',
    name: '雷霆裂变 (Lightning Split)',
    desc: '高压闪电胸前贯穿，团战爆发之魂',
    hypeBoost: 14,
    previewClass: 'bg-amber-950'
  },
  {
    id: 'gold_hex',
    name: '至尊金蜂巢 (Imperial Gold Hex)',
    desc: '王朝冠军六边形镀金蜂窝微晶结构，奢华尊贵',
    hypeBoost: 18,
    previewClass: 'bg-yellow-950'
  }
];

export interface CrestInfo {
  id: JerseyCrestType;
  name: string;
  emoji: string;
  desc: string;
  prestigeRequirement: string;
  bonusHype: number;
}

export const JERSEY_CRESTS: CrestInfo[] = [
  {
    id: 'dragon_flame',
    name: '炽焰炎龙 (Dragon Flame)',
    emoji: '🐉',
    desc: '东方神龙吐息，战意澎湃无坚不摧',
    prestigeRequirement: '无门槛',
    bonusHype: 5
  },
  {
    id: 'cyber_phoenix',
    name: '赛博不死鸟 (Cyber Phoenix)',
    emoji: '🦅',
    desc: '逆风翻盘涅槃重生，绝境之王徽记',
    prestigeRequirement: '队伍士气 > 80',
    bonusHype: 8
  },
  {
    id: 'apex_tiger',
    name: '绝巅白虎 (Apex Tiger)',
    emoji: '🐯',
    desc: '雷霆万钧虎踞龙盘，下路核心杀手本色',
    prestigeRequirement: '胜率 > 60%',
    bonusHype: 10
  },
  {
    id: 'neon_shield',
    name: '极光宙斯盾 (Aegis Shield)',
    emoji: '🛡️',
    desc: '铜墙铁壁绝对防御，大局控图稳健如山',
    prestigeRequirement: '无门槛',
    bonusHype: 6
  },
  {
    id: 'quantum_star',
    name: '量子星芒 (Quantum Star)',
    emoji: '⭐',
    desc: '璀璨新星超弦脉冲，新生代银河战舰',
    prestigeRequirement: '粉丝量 > 200,000',
    bonusHype: 12
  },
  {
    id: 'lightning_bolt',
    name: '破晓雷霆 (Thunderbolt)',
    emoji: '⚡',
    desc: '迅雷不及掩耳，快节奏终结风暴',
    prestigeRequirement: '连续两连胜',
    bonusHype: 9
  }
];

export const JERSEY_COLOR_PRESETS = [
  { name: '暗影霓虹 (Cyber Shadow)', primary: '#090d16', secondary: '#06b6d4', accent: '#a855f7' },
  { name: '赤焰炽金 (Dynasty Crimson)', primary: '#450a0a', secondary: '#f59e0b', accent: '#ef4444' },
  { name: '极光碧翠 (Aurora Emerald)', primary: '#022c22', secondary: '#10b981', accent: '#34d399' },
  { name: '皇家紫曜 (Royal Violet)', primary: '#1e1b4b', secondary: '#818cf8', accent: '#ec4899' },
  { name: '玄武曜黑 (Stealth Matte)', primary: '#0a0a0a', secondary: '#64748b', accent: '#f8fafc' },
  { name: '琥珀荣光 (Golden Triumph)', primary: '#1c1917', secondary: '#fbbf24', accent: '#f59e0b' },
  { name: '冰川蔚蓝 (Glacial Azure)', primary: '#082f49', secondary: '#38bdf8', accent: '#e0f2fe' }
];

export const PRICE_TIERS: Record<JerseyPriceTier, {
  name: string;
  retailPrice: number;
  unitCost: number;
  salesVolumeRate: number; // 销量系数
  desc: string;
}> = {
  fan_edition: {
    name: '大众助威版 (Fan Edition)',
    retailPrice: 69,
    unitCost: 22,
    salesVolumeRate: 1.6,
    desc: '透气科技速干面料，亲民定价，薄利多销'
  },
  pro_player_edition: {
    name: '职业选手同款 (Pro Player Edition)',
    retailPrice: 149,
    unitCost: 45,
    salesVolumeRate: 1.0,
    desc: '立体剪裁防静电，刺绣战队队徽与赞助商联名徽章'
  },
  collector_golden_box: {
    name: '夺冠至尊典藏礼盒 (Collector Gold Box)',
    retailPrice: 299,
    unitCost: 88,
    salesVolumeRate: 0.45,
    desc: '纯金线绣线、专属编号烫印、附带亲笔签名证书与全套纪念徽章'
  }
};

export const INITIAL_MERCH_CATALOG: MerchItem[] = [
  {
    id: 'merch_custom_jersey',
    name: '2026 赛季定制官方战袍 (Team Jersey)',
    category: 'JERSEY',
    description: '俱乐部主场比赛专用战衣，搭载动态定制工艺与明星签名',
    icon: '👕',
    retailPrice: 149,
    unitCost: 45,
    baseWeeklySales: 320,
    unlocked: true,
    unlockRequirement: '已默认解锁',
    salesVolume: 1250,
    totalRevenue: 186250,
    tierLevel: 2
  },
  {
    id: 'merch_team_hoodie',
    name: '电竞刺绣防风连帽卫衣 (Championship Hoodie)',
    category: 'HOODIE',
    description: '重磅加绒保暖，后背大幅赛博图腾反光暗纹，出街吸睛利器',
    icon: '🧥',
    retailPrice: 89,
    unitCost: 28,
    baseWeeklySales: 190,
    unlocked: true,
    unlockRequirement: '粉丝数达到 100,000',
    salesVolume: 640,
    totalRevenue: 56960,
    tierLevel: 1
  },
  {
    id: 'merch_artisan_keycap',
    name: '战队定制钛合金金属透光键帽 (Artisan Keycap)',
    category: 'KEYBOARD_CAP',
    description: '五轴CNC精雕，原厂高度RGB透光，外设极客与铁粉必备收藏',
    icon: '⌨️',
    retailPrice: 49,
    unitCost: 14,
    baseWeeklySales: 280,
    unlocked: true,
    unlockRequirement: '商业赞助评级达 B 级',
    salesVolume: 820,
    totalRevenue: 40180,
    tierLevel: 1
  },
  {
    id: 'merch_mascot_plush',
    name: '吉祥物发光毛绒公仔 (Mascot Plush)',
    category: 'PLUSH',
    description: '俱乐部超萌团宠吉祥物，附带赛事应援荧光灯功能，女性粉丝热推',
    icon: '🧸',
    retailPrice: 39,
    unitCost: 11,
    baseWeeklySales: 220,
    unlocked: true,
    unlockRequirement: '社区声誉达 75%',
    salesVolume: 510,
    totalRevenue: 19890,
    tierLevel: 1
  },
  {
    id: 'merch_snapback_cap',
    name: '赛博竞技立体刺绣棒球帽 (Snapback Cap)',
    category: 'CAP',
    description: '斜纹纯棉硬顶，帽檐激光镭射防伪标识，百搭夏日应援单品',
    icon: '🧢',
    retailPrice: 29,
    unitCost: 8,
    baseWeeklySales: 350,
    unlocked: true,
    unlockRequirement: '无门槛',
    salesVolume: 920,
    totalRevenue: 26680,
    tierLevel: 1
  },
  {
    id: 'merch_champion_figure',
    name: '1/7 典藏限定全员捧杯手办 (Championship Figure)',
    category: 'FIGURE',
    description: '高精树脂分件涂装，全球限量编号，复刻捧起全球总决赛冠军瞬间',
    icon: '🗿',
    retailPrice: 388,
    unitCost: 120,
    baseWeeklySales: 45,
    unlocked: false,
    unlockRequirement: '赢得 1 次全球总决赛冠军 (Worlds)',
    salesVolume: 0,
    totalRevenue: 0,
    tierLevel: 1
  }
];

export const INITIAL_JERSEY_CONFIG: JerseyCustomizerConfig = {
  primaryColor: '#090d16',
  secondaryColor: '#06b6d4',
  accentColor: '#a855f7',
  pattern: 'neon_grid',
  crestDesign: 'dragon_flame',
  collarStyle: 'v_neck',
  jerseyNumber: 7,
  customGamertag: 'DYNASTY',
  starSignaturePlayerName: 'Viper (ADC)',
  sleevePatch: 'lpl_gold',
  priceTier: 'pro_player_edition',
  editionName: '2026 破晓破阵款战袍',
  unitRetailPrice: 149,
  productionUnitCost: 45,
  hypeScore: 88
};

export const INITIAL_MERCH_SHOP_STATE: MerchShopState = {
  jerseyConfig: INITIAL_JERSEY_CONFIG,
  catalog: INITIAL_MERCH_CATALOG,
  salesHistory: [
    {
      week: 1,
      timestamp: '第1周结算',
      passiveSalesUnits: 1420,
      passiveRevenue: 85200,
      flashSaleUnits: 0,
      flashSaleRevenue: 0,
      totalWeeklyRevenue: 85200,
      netProfit: 54100,
      fanbaseMultiplier: 1.0,
      tournamentBonusMultiplier: 1.0,
      playerPopularityBonus: 1.05,
      topSellingItem: '2026 赛季定制官方战袍 (Team Jersey)'
    },
    {
      week: 2,
      timestamp: '第2周结算',
      passiveSalesUnits: 1580,
      passiveRevenue: 94800,
      flashSaleUnits: 850,
      flashSaleRevenue: 126650,
      totalWeeklyRevenue: 221450,
      netProfit: 142300,
      fanbaseMultiplier: 1.15,
      tournamentBonusMultiplier: 1.10,
      playerPopularityBonus: 1.08,
      topSellingItem: '2026 赛季定制官方战袍 (Team Jersey)'
    },
    {
      week: 3,
      timestamp: '第3周结算',
      passiveSalesUnits: 1720,
      passiveRevenue: 104200,
      flashSaleUnits: 0,
      flashSaleRevenue: 0,
      totalWeeklyRevenue: 104200,
      netProfit: 66800,
      fanbaseMultiplier: 1.22,
      tournamentBonusMultiplier: 1.15,
      playerPopularityBonus: 1.12,
      topSellingItem: '电竞刺绣防风连帽卫衣 (Championship Hoodie)'
    },
    {
      week: 4,
      timestamp: '第4周结算',
      passiveSalesUnits: 1910,
      passiveRevenue: 118400,
      flashSaleUnits: 1200,
      flashSaleRevenue: 178800,
      totalWeeklyRevenue: 297200,
      netProfit: 192500,
      fanbaseMultiplier: 1.35,
      tournamentBonusMultiplier: 1.25,
      playerPopularityBonus: 1.15,
      topSellingItem: '2026 赛季定制官方战袍 (Team Jersey)'
    }
  ],
  totalLifetimeMerchRevenue: 708050,
  totalJerseysSold: 4140,
  currentHypeLevel: 86,
  activeFlashSale: null,
  lastSettlementWeek: 4,
  rdUpgrades: {
    fabric_tech: 1,
    print_quality: 1,
    ergonomic_cut: 0,
    smart_chip: 0,
    injury_prevention: 0
  },
  rdInvestedPoints: {}
};

export interface RDUpgradeDef {
  id: 'fabric_tech' | 'print_quality' | 'ergonomic_cut' | 'smart_chip' | 'injury_prevention';
  name: string;
  categoryName: string;
  icon: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  multiplierPerLevel: number;
  maxLevel: number;
  diminishingRateDesc?: string;
  levels: {
    level: number;
    title: string;
    detail: string;
    perkName: string;
    perkDetail: string;
    perkBadge: string;
    bonusMultiplier: number; // e.g. 0.12 for +12%
    bonusDisplay: string;
    cost: number;
    techPointCost?: number; // 消耗的科技研发点数
    strainReduction?: number; // 手腕肌腱负荷削减比例 (0.10 ~ 0.50)
    therapyDurationReduction?: number; // 理疗康复周期/耗费缩减比例 (0.15 ~ 0.50)
    hypeReward: number;
  }[];
}

export const MERCH_RD_UPGRADES: RDUpgradeDef[] = [
  {
    id: 'fabric_tech',
    name: '面料工学与微孔排汗研发 (Fabric Technology)',
    categoryName: '面料材质工程',
    icon: '🧵',
    description: '采用航天级CoolMax混纺、银离子抑菌微纤及石墨烯仿生超导纤维，全方位重构战袍肤感、耐久度与全天候散热，构筑顶级商业溢价壁垒。',
    baseCost: 30000,
    costMultiplier: 2.2,
    multiplierPerLevel: 0.15,
    maxLevel: 5,
    diminishingRateDesc: '边际技术研发难度递增，但高阶解锁恒温与冠军巡礼专属通道特权',
    levels: [
      {
        level: 1,
        title: '基础速干涤纶 (CoolMax Basic)',
        detail: '符合职业赛事出场基准，吸湿排汗合格，降低生产不良率',
        perkName: '【微孔排汗】',
        perkDetail: '基础排汗与防静电微处理，面料洗水不缩水',
        perkBadge: '💨 基础排汗',
        bonusMultiplier: 0.12,
        bonusDisplay: '+12% 战袍基准流水',
        cost: 30000,
        hypeReward: 4
      },
      {
        level: 2,
        title: '蜂窝透气立体编织 (Honeycomb Aero-Weave)',
        detail: '腋下立体导流网眼，体感降温2.5℃，大幅提升粉丝穿着舒适口碑',
        perkName: '【立体导流】',
        perkDetail: '粉丝好评度 +10%，空投销量基准门槛下调',
        perkBadge: '🕸️ 蜂窝导流',
        bonusMultiplier: 0.25,
        bonusDisplay: '+25% 战袍基准流水',
        cost: 75000,
        hypeReward: 6
      },
      {
        level: 3,
        title: '纳米抑菌银离子微纤 (Silver-Ion Nano Fiber)',
        detail: '军工级银离子持久防臭抑菌，汗蚀防护提升300%，达到收藏级工艺',
        perkName: '【纳米抑菌】',
        perkDetail: '永久防异味与耐汗蚀，战袍二手收藏级溢价 +15%',
        perkBadge: '🛡️ 银离子抑菌',
        bonusMultiplier: 0.40,
        bonusDisplay: '+40% 战袍基准流水',
        cost: 18000,
        hypeReward: 8
      },
      {
        level: 4,
        title: '航天级 PCM 相变恒温层 (Phase Change Thermo-Reg)',
        detail: '随体表温度自主调控微环境，冬暖夏凉，全天候全季节适应',
        perkName: '【四季恒温】',
        perkDetail: '冬暖夏凉微气候，全季节无淡季销售，冬季被动流水不衰减',
        perkBadge: '❄️ 相变恒温',
        bonusMultiplier: 0.60,
        bonusDisplay: '+60% 战袍基准流水',
        cost: 380000,
        hypeReward: 10
      },
      {
        level: 5,
        title: '石墨烯仿生超导纤维 (Graphene Apex Composite)',
        detail: '极致超轻量化与高抗拉强度，世界冠军战队旗舰御用黑科技巅峰',
        perkName: '【冠军巡礼通道】',
        perkDetail: '极致轻量化与超导散热，解锁「至尊冠军巡礼版」战袍销售通道',
        perkBadge: '👑 至尊石墨烯',
        bonusMultiplier: 0.85,
        bonusDisplay: '+85% 战袍基准流水 (巅峰)',
        cost: 850000,
        hypeReward: 15
      }
    ]
  },
  {
    id: 'print_quality',
    name: '印花工艺与微晶烫印升级 (Print Quality & Optics)',
    categoryName: '立体印花工艺',
    icon: '🖨️',
    description: '从基础平网胶印跨越至立体硅胶微雕、全息变色微晶与量子荧光夜光晶片，队徽与选手签名永不开裂，引爆社交传播狂潮。',
    baseCost: 25000,
    costMultiplier: 2.1,
    multiplierPerLevel: 0.14,
    maxLevel: 5,
    diminishingRateDesc: '从平面印花进阶至微纳光学器件，赋予战袍顶级潮流属性与夜光防伪',
    levels: [
      {
        level: 1,
        title: '环保水性胶浆印花 (Standard Screen Print)',
        detail: '基础水洗固色达标，色彩还原饱和度高，无异味环保工艺',
        perkName: '【耐洗固色】',
        perkDetail: '基础耐洗固色，色彩饱和度达标，初级防脱色',
        perkBadge: '🎨 环保色牢',
        bonusMultiplier: 0.10,
        bonusDisplay: '+10% 战袍基准流水',
        cost: 25000,
        hypeReward: 4
      },
      {
        level: 2,
        title: '高密度微浮雕硅胶烫印 (3D High-Density Silicone)',
        detail: '队徽立体哑光凸起，触感厚实细腻，水洗百次不龟裂不卷边',
        perkName: '【哑光浮雕】',
        perkDetail: '队徽与战队标语呈现哑光立体浮雕质感，手感触摸溢价提升',
        perkBadge: '✨ 3D微浮雕',
        bonusMultiplier: 0.22,
        bonusDisplay: '+22% 战袍基准流水',
        cost: 65000,
        hypeReward: 6
      },
      {
        level: 3,
        title: '光学全息变色微晶层 (Holographic Prism Foil)',
        detail: '随视角动态折射霓虹彩虹镭射微光，舞台聚光灯与手机拍摄极为吸睛',
        perkName: '【全息霓虹】',
        perkDetail: '随视角变换霓虹镭射反光，社交平台传播度大幅提高，社媒曝光率 +25%',
        perkBadge: '🌈 全息镭射',
        bonusMultiplier: 0.36,
        bonusDisplay: '+36% 战袍基准流水',
        cost: 160000,
        hypeReward: 8
      },
      {
        level: 4,
        title: '磁吸数码热转印微孔压合 (Magnetic Heat-Transfer Poly)',
        detail: '0触感一体式无感压合，选手签名与比赛号码贴合无瑕、永不脱胶',
        perkName: '【无感附着】',
        perkDetail: '0触感无感烫印，选手签名与号码永不开裂、不脱落',
        perkBadge: '🧲 磁吸热转印',
        bonusMultiplier: 0.55,
        bonusDisplay: '+55% 战袍基准流水',
        cost: 340000,
        hypeReward: 10
      },
      {
        level: 5,
        title: '量子荧光夜光防伪晶片 (Quantum Luminescent Armor)',
        detail: '暗光环境下胸标呈现战队图腾微光呼吸律动，每件附带物理量子防伪码',
        perkName: '【夜光防伪抢购潮】',
        perkDetail: '暗光环境下战队图腾呼吸微光发光，防伪芯片可溯源，二级市场爆单抢购潮',
        perkBadge: '⚡ 量子夜光',
        bonusMultiplier: 0.78,
        bonusDisplay: '+78% 战袍基准流水 (巅峰)',
        cost: 750000,
        hypeReward: 15
      }
    ]
  },
  {
    id: 'ergonomic_cut',
    name: '人体工学版型剪裁 (Ergonomic Pro Cut)',
    categoryName: '版型剪裁工学',
    icon: '✂️',
    description: '针对职业电竞选手伏案对战优化肩背开角，杜绝手肘束缚感，大幅美化大众上身体态。',
    baseCost: 18000,
    costMultiplier: 1.9,
    multiplierPerLevel: 0.08,
    maxLevel: 4,
    diminishingRateDesc: '改良选手手臂挥动自由度与显瘦穿搭视觉比例',
    levels: [
      {
        level: 1,
        title: '标准宽松直筒版型',
        detail: '大众休闲身材适配，包容性良好',
        perkName: '【休闲兼容】',
        perkDetail: '百搭身材无束缚，日常出街高穿搭率',
        perkBadge: '👕 标准版型',
        bonusMultiplier: 0.06,
        bonusDisplay: '+6% 战袍基准流水',
        cost: 18000,
        hypeReward: 3
      },
      {
        level: 2,
        title: '3D立体战术插肩剪裁',
        detail: '强化肩部延展性，手臂大幅度滑动无牵拉阻力',
        perkName: '【插肩开角】',
        perkDetail: '伏案操作无紧绷感，选手反馈上佳',
        perkBadge: '📐 3D插肩',
        bonusMultiplier: 0.14,
        bonusDisplay: '+14% 战袍基准流水',
        cost: 45000,
        hypeReward: 5
      },
      {
        level: 3,
        title: '量体裁衣修身超能动线',
        detail: '上身挺拔显肩宽，电竞圈公认最具高级感的明星视觉版型',
        perkName: '【高级动线】',
        perkDetail: '显肩宽腰窄，粉丝上身体验打分大幅提升',
        perkBadge: '🌟 修身动线',
        bonusMultiplier: 0.24,
        bonusDisplay: '+24% 战袍基准流水',
        cost: 110000,
        hypeReward: 7
      },
      {
        level: 4,
        title: '空气动力极速竞赛剪裁',
        detail: '背部风道立体剪裁，国际职业赛场旗舰版型',
        perkName: '【极速竞速】',
        perkDetail: '职业战队御用剪裁，穿搭体感与视觉质感并存',
        perkBadge: '⚡ 竞速空气道',
        bonusMultiplier: 0.36,
        bonusDisplay: '+36% 战袍基准流水',
        cost: 250000,
        hypeReward: 10
      }
    ]
  },
  {
    id: 'smart_chip',
    name: 'NFC智能防伪互动芯片 (Smart NFC Wearable)',
    categoryName: '智能物联网联名',
    icon: '📲',
    description: '战袍下摆内置微型NFC芯片，手机碰一碰验真并解锁限定线上粉丝特权与AR投影。',
    baseCost: 35000,
    costMultiplier: 2.2,
    multiplierPerLevel: 0.14,
    maxLevel: 4,
    diminishingRateDesc: '结合物联网与数字资产，赋予实体战袍数字收藏价值',
    levels: [
      {
        level: 1,
        title: '基础NFC防伪鉴真标签',
        detail: '手机一触即验正品，杜绝市面假冒盗版周边',
        perkName: '【防伪鉴真】',
        perkDetail: '官方认证芯片，杜绝盗版分流',
        perkBadge: '🛡️ NFC鉴真',
        bonusMultiplier: 0.12,
        bonusDisplay: '+12% 战袍基准流水',
        cost: 35000,
        hypeReward: 4
      },
      {
        level: 2,
        title: '粉丝Club专属数字特权',
        detail: '解锁专属线上粉丝通行证，现场观赛专属通道',
        perkName: '【会员特权】',
        perkDetail: '周边复购率与铁粉忠诚度提升',
        perkBadge: '🎟️ 粉丝特权',
        bonusMultiplier: 0.26,
        bonusDisplay: '+26% 战袍基准流水',
        cost: 90000,
        hypeReward: 7
      },
      {
        level: 3,
        title: '夺冠时刻AR全息互动',
        detail: '手机扫描战袍胸标即可投射战队捧杯3D微缩AR光效',
        perkName: '【AR互动】',
        perkDetail: '年轻受众传播裂变，短视频爆点',
        perkBadge: '📱 AR全息',
        bonusMultiplier: 0.42,
        bonusDisplay: '+42% 战袍基准流水',
        cost: 210000,
        hypeReward: 10
      },
      {
        level: 4,
        title: '心率联动应援灯效芯片',
        detail: '触碰发光，战队比赛决胜时刻与观赛手机同频呼吸闪烁',
        perkName: '【同频应援】',
        perkDetail: '现场万千同频呼吸灯海，科技极客战袍终章',
        perkBadge: '🔮 智联呼吸',
        bonusMultiplier: 0.60,
        bonusDisplay: '+60% 战袍基准流水',
        cost: 480000,
        hypeReward: 15
      }
    ]
  },
  {
    id: 'injury_prevention',
    name: '伤病预防与康复医学 (Injury Prevention & Recovery)',
    categoryName: '运动医学与防护',
    icon: '🩺',
    description: '前沿电竞人机工效与运动康复科研。研发微动支撑套件、深层神经松解、生化细胞修复及外骨骼护具，大幅削减高强度20小时经营实训产生的腕管肌腱负荷（Strain），根治恶性腱鞘炎并缩短理疗康复耗程。',
    baseCost: 25000,
    costMultiplier: 2.2,
    multiplierPerLevel: 0.10,
    maxLevel: 5,
    diminishingRateDesc: '手腕积劳抑制最高可达 50%，理疗耗时减免最高达 50%，铸就钢铁之躯',
    levels: [
      {
        level: 1,
        title: '生物力学护腕与掌压释负 (Ergo Wrist Stabilizer)',
        detail: '采用高弹医用硅胶动态贴合掌骨，分散高频甩鼠点选剪切力',
        perkName: '【动态支撑】',
        perkDetail: '手腕肌腱负荷累积 -10%，常规理疗康复周期缩短 15%',
        perkBadge: '🩹 动态支撑',
        bonusMultiplier: 0.10,
        bonusDisplay: '手腕负荷 -10% · 理疗周期 -15%',
        cost: 25000,
        techPointCost: 20,
        strainReduction: 0.10,
        therapyDurationReduction: 0.15,
        hypeReward: 4
      },
      {
        level: 2,
        title: '微循环热敷与肌筋膜声波松解 (Percussive Myofascial Therapy)',
        detail: '微型超声波震颤刺激肌腱鞘膜，加速深层乳酸水肿代谢消除',
        perkName: '【筋膜松解】',
        perkDetail: '手腕肌腱负荷累积 -20%，常规理疗康复周期缩短 25%',
        perkBadge: '🌊 筋膜松解',
        bonusMultiplier: 0.20,
        bonusDisplay: '手腕负荷 -20% · 理疗周期 -25%',
        cost: 65000,
        techPointCost: 45,
        strainReduction: 0.20,
        therapyDurationReduction: 0.25,
        hypeReward: 6
      },
      {
        level: 3,
        title: '冷压靶向神经调理与细胞活化 (Cryo Nerve Conditioning)',
        detail: '极速冷疗激活细胞热休克蛋白，阻断神经轴突痛觉信号连锁恶化',
        perkName: '【冷压活化】',
        perkDetail: '手腕肌腱负荷累积 -30%，常规理疗康复周期缩短 35%',
        perkBadge: '❄️ 冷压活化',
        bonusMultiplier: 0.30,
        bonusDisplay: '手腕负荷 -30% · 理疗周期 -35%',
        cost: 150000,
        techPointCost: 90,
        strainReduction: 0.30,
        therapyDurationReduction: 0.35,
        hypeReward: 9
      },
      {
        level: 4,
        title: '智能肌电生物传感与疲劳熔断 (Smart EMG Fatigue Sensor)',
        detail: '毫秒级感知手部前臂肌肉群抽搐电位，在劳损恶化前智能降频防护',
        perkName: '【肌电预警】',
        perkDetail: '手腕肌腱负荷累积 -40%，常规理疗康复周期缩短 42%',
        perkBadge: '⚡ 肌电熔断',
        bonusMultiplier: 0.40,
        bonusDisplay: '手腕负荷 -40% · 理疗周期 -42%',
        cost: 320000,
        techPointCost: 150,
        strainReduction: 0.40,
        therapyDurationReduction: 0.42,
        hypeReward: 12
      },
      {
        level: 5,
        title: '纳米神经拟态外骨骼装甲 (Nanotech Neural Exosuit)',
        detail: '航天级记忆合金微型骨骼，全向主动分流90%操作压力，造就职业赛场永动机',
        perkName: '【纳米机械骨骼】',
        perkDetail: '手腕负荷累积削减 50% 极限！理疗周期与开支缩短 50%，终生免除重度恶性腱鞘炎！',
        perkBadge: '👑 纳米骨骼',
        bonusMultiplier: 0.50,
        bonusDisplay: '手腕负荷 -50% 极限 · 理疗周期 -50%',
        cost: 680000,
        techPointCost: 250,
        strainReduction: 0.50,
        therapyDurationReduction: 0.50,
        hypeReward: 16
      }
    ]
  }
];

