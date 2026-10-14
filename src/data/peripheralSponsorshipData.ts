import { PeripheralSponsorBrand, PeripheralSponsorshipState } from '../types/game';

export interface FanbaseMilestoneTier {
  id: string;
  threshold: number;
  label: string;
  badge: string;
  revenueMultiplier: number;
  bonusPercentLabel: string;
  description: string;
}

export const FANBASE_REVENUE_MILESTONES: FanbaseMilestoneTier[] = [
  {
    id: 'tier_10k',
    threshold: 10000,
    label: '萌芽新星',
    badge: '🥉 萌芽',
    revenueMultiplier: 1.0,
    bonusPercentLabel: '+0% 基准分成',
    description: '刚踏入职业赛场，获得入门级电竞外设品牌的初步试水赞助。'
  },
  {
    id: 'tier_50k',
    threshold: 50000,
    label: '地方豪强',
    badge: '🥈 豪强',
    revenueMultiplier: 1.25,
    bonusPercentLabel: '+25% 赞助增幅',
    description: '具有可观赛区曝光度，吸引知名机械键盘与电竞座舱品牌入驻。'
  },
  {
    id: 'tier_100k',
    threshold: 100000,
    label: '赛区顶流',
    badge: '🥇 顶流',
    revenueMultiplier: 1.5,
    bonusPercentLabel: '+50% 商业溢价',
    description: '全国级联赛粉丝号召力，国际红牛与魔爪能量饮料主动递交商业合同。'
  },
  {
    id: 'tier_250k',
    threshold: 250000,
    label: '跨界巨星',
    badge: '💎 巨星',
    revenueMultiplier: 2.0,
    bonusPercentLabel: '+100% 收益翻倍',
    description: '世界总决赛常客俱乐部，解锁国际顶级旗舰定制款专属分成。'
  },
  {
    id: 'tier_500k',
    threshold: 500000,
    label: '传世王朝',
    badge: '👑 王朝',
    revenueMultiplier: 3.0,
    bonusPercentLabel: '+200% 收益翻三倍',
    description: '全球电竞商业殿堂级豪门，享受最高档全产品线终身冠名与巨额分红！'
  }
];

export const PERIPHERAL_BRANDS_CATALOG: PeripheralSponsorBrand[] = [
  // --- 1. KEYBOARD & MOUSE (机械键鼠) ---
  {
    id: 'kb_vortex',
    brandName: 'Vortex 雷霆裂空',
    companyName: '雷霆客制化电竞工坊',
    category: 'KEYBOARD',
    categoryNameCn: '机械键盘',
    tier: 'B',
    logo: '⌨️',
    productModel: 'Vortex-80 磁轴 8000Hz 竞技键盘',
    tagline: '毫秒级急停，极速断触先手',
    fanbaseReq: 10000,
    baseMonthlyPayout: 8000,
    baseSigningBonus: 35000,
    perkName: '【磁轴微操特训】',
    perkDesc: '全员配备高精度磁轴，队员对线压制率提升',
    perkBuff: '首发全员微操训练成长速度 +12% · 前期单杀率 +8%',
    status: 'AVAILABLE'
  },
  {
    id: 'kb_razer_viper',
    brandName: 'Razer 雷蛇毒蝰',
    companyName: '雷蛇电竞生态集团',
    category: 'KEYBOARD',
    categoryNameCn: '机械键盘',
    tier: 'A',
    logo: '🐍',
    productModel: 'Viper V3 Pro 旗舰超轻量化无线套装',
    tagline: '始于玩家，赋予极限操控',
    fanbaseReq: 50000,
    baseMonthlyPayout: 18000,
    baseSigningBonus: 95000,
    perkName: '【毒液神经握持】',
    perkDesc: '超低延迟光学微动，大幅降低关键团战甩技能脱靶率',
    perkBuff: '关键团战技能命中率 +15% · 绝境反杀概率 +10%',
    status: 'AVAILABLE'
  },
  {
    id: 'kb_logitech_pro',
    brandName: 'Logitech G-PRO 极光',
    companyName: '罗技国际电竞事业部',
    category: 'KEYBOARD',
    categoryNameCn: '机械键盘',
    tier: 'S',
    logo: '💎',
    productModel: 'G PRO X TKL LIGHTSPEED 职业冠军款',
    tagline: '生而为赢，职业选手的终极信仰',
    fanbaseReq: 150000,
    baseMonthlyPayout: 38000,
    baseSigningBonus: 220000,
    perkName: '【极光瞬影连招】',
    perkDesc: 'LightSpeed 零延迟传输，全队团战输出帧精度提升',
    perkBuff: '全队微操属性 +4 · 赛区决赛决胜局胜率 +16%',
    status: 'AVAILABLE'
  },
  {
    id: 'kb_cyber_matrix',
    brandName: '赛博矩阵 · 不朽神谕',
    companyName: '未来科技定制实验室',
    category: 'KEYBOARD',
    categoryNameCn: '机械键盘',
    tier: 'SS',
    logo: '⚡',
    productModel: 'Cyber-999 纯钛合金全球全球限量孤品',
    tagline: '重构外设维度，为统治王朝而生',
    fanbaseReq: 350000,
    baseMonthlyPayout: 75000,
    baseSigningBonus: 500000,
    perkName: '【神域矩阵超频】',
    perkDesc: '量子触控回弹，彻底解除手速生理极限束缚',
    perkBuff: '全队微操上限突破 · 世界赛BO5决胜局全员战力 +15%',
    status: 'AVAILABLE'
  },

  // --- 2. GAMING CHAIRS (电竞工学座驾) ---
  {
    id: 'chair_autofull',
    brandName: 'AutoFull 傲风机械臂',
    companyName: '傲风电竞工学科技',
    category: 'CHAIR',
    categoryNameCn: '电竞座驾',
    tier: 'B',
    logo: '🪑',
    productModel: 'AF-Neo 仿生腰托电竞椅',
    tagline: '腰背有支撑，久坐不疲劳',
    fanbaseReq: 15000,
    baseMonthlyPayout: 7500,
    baseSigningBonus: 30000,
    perkName: '【护脊持久作战】',
    perkDesc: '强化脊椎支撑，大幅减缓选手日常高强度训练劳损',
    perkBuff: '队员疲劳度累积速度 -25% · 训练赛受伤概率 -30%',
    status: 'AVAILABLE'
  },
  {
    id: 'chair_secretlab',
    brandName: 'Secretlab 泰坦 TITAN',
    companyName: '密境实验室国际座舱',
    category: 'CHAIR',
    categoryNameCn: '电竞座驾',
    tier: 'A',
    logo: '🛡️',
    productModel: 'TITAN Evo 磁吸凝胶恒温电竞座驾',
    tagline: '全球官方赛事指定座椅，重塑专注体验',
    fanbaseReq: 60000,
    baseMonthlyPayout: 20000,
    baseSigningBonus: 110000,
    perkName: '【泰坦体能恒温】',
    perkDesc: '清爽透气恒温，保持高压赛场下心率与呼吸极度平稳',
    perkBuff: 'BO5 长盘耐力维持度 +35% · 决胜局队员失误率 -20%',
    status: 'AVAILABLE'
  },
  {
    id: 'chair_herman_miller',
    brandName: 'Herman Miller x 罗技联名',
    companyName: '赫曼米勒人体工学集团',
    category: 'CHAIR',
    categoryNameCn: '电竞座驾',
    tier: 'S',
    logo: '🏛️',
    productModel: 'Embody Gaming 人体工学释压座舱',
    tagline: '医学级重力分散，终生巅峰竞技状态',
    fanbaseReq: 200000,
    baseMonthlyPayout: 42000,
    baseSigningBonus: 260000,
    perkName: '【全脊椎重力零感】',
    perkDesc: '顶级医学抗劳损系统，全队队员职业生涯年限大幅延长',
    perkBuff: '全队大局观属性 +3 · 伤病理疗恢复效率 +40%',
    status: 'AVAILABLE'
  },
  {
    id: 'chair_dynasty_throne',
    brandName: '不朽王座 · 纯金龙鳞座舱',
    companyName: '全球电竞皇家工坊',
    category: 'CHAIR',
    categoryNameCn: '电竞座驾',
    tier: 'SS',
    logo: '👑',
    productModel: 'Dynasty Gold-01 碳纤维龙鳞冠军宝座',
    tagline: '只有登上世界之巅的队伍，才配落座于此',
    fanbaseReq: 450000,
    baseMonthlyPayout: 80000,
    baseSigningBonus: 550000,
    perkName: '【帝王君临威慑】',
    perkDesc: '自带豪门王者气场，赛前极大振奋队伍士气并在气势上碾压对手',
    perkBuff: '全队士气永不跌破 85 · 赛前额外获得 +10% 士气护盾',
    status: 'AVAILABLE'
  },

  // --- 3. ENERGY DRINKS (能量饮料 & 竞技补给) ---
  {
    id: 'drink_warhorse',
    brandName: '战马燃力 · 离子极速',
    companyName: '战马能量饮品事业部',
    category: 'ENERGY_DRINK',
    categoryNameCn: '功能饮品',
    tier: 'B',
    logo: '🐎',
    productModel: '战马牛磺酸强化电解质罐装',
    tagline: '有能量，当燃战马！',
    fanbaseReq: 10000,
    baseMonthlyPayout: 6500,
    baseSigningBonus: 28000,
    perkName: '【瞬时电解质补给】',
    perkDesc: '赛前快速补充精力，保持选手神经敏捷度',
    perkBuff: '比赛前中期反应敏捷度 +8% · 单局经济获取 +5%',
    status: 'AVAILABLE'
  },
  {
    id: 'drink_redbull',
    brandName: 'Red Bull 奥地利红牛',
    companyName: '红牛全球体育集团',
    category: 'ENERGY_DRINK',
    categoryNameCn: '功能饮品',
    tier: 'A',
    logo: '🐂',
    productModel: 'Red Bull 银蓝巅峰能量罐',
    tagline: '红牛给你插上翅膀！',
    fanbaseReq: 70000,
    baseMonthlyPayout: 22000,
    baseSigningBonus: 125000,
    perkName: '【银翼飞驰专注】',
    perkDesc: '国际顶级能量配方，赋予选手超常神经反射与心流状态',
    perkBuff: '进入“心流气势”几率提升 +25% · 大赛绝境逆转概率 +14%',
    status: 'AVAILABLE'
  },
  {
    id: 'drink_monster',
    brandName: 'Monster 魔爪爪印',
    companyName: '魔爪能量国际饮料',
    category: 'ENERGY_DRINK',
    categoryNameCn: '功能饮品',
    tier: 'S',
    logo: '🐺',
    productModel: 'Monster Ultra 零糖白魔爪',
    tagline: '释放野性，主宰战场',
    fanbaseReq: 180000,
    baseMonthlyPayout: 40000,
    baseSigningBonus: 240000,
    perkName: '【狂暴野性嗅觉】',
    perkDesc: '刺激肾上腺素飙升，激发出极致团战开团果决度',
    perkBuff: '先手开团成功率 +20% · 龙坑争夺抢龙概率 +18%',
    status: 'AVAILABLE'
  },
  {
    id: 'drink_elixir_neuro',
    brandName: '神经元圣水 · 脑力巅峰',
    companyName: '深海脑力生物医药',
    category: 'ENERGY_DRINK',
    categoryNameCn: '功能饮品',
    tier: 'SS',
    logo: '🧪',
    productModel: 'Neuro-Synapse 智能专注认知液',
    tagline: '破译脑神经潜能，思维速度跃迁',
    fanbaseReq: 400000,
    baseMonthlyPayout: 85000,
    baseSigningBonus: 600000,
    perkName: '【脑神经全景视野】',
    perkDesc: '深度强化大局观计算与兵线博弈预判，全知全能',
    perkBuff: '全队大局观属性 +5 · 视野防Gank察觉率 +30%',
    status: 'AVAILABLE'
  },

  // --- 4. HEADSETS (声学耳机 & 监听装备) ---
  {
    id: 'headset_hyperx',
    brandName: 'HyperX 飓风 Cloud',
    companyName: '极客声学竞技实验室',
    category: 'HEADSET',
    categoryNameCn: '竞技耳机',
    tier: 'B',
    logo: '🎧',
    productModel: 'Cloud III 职业物理降噪耳麦',
    tagline: '听声辨位，清晰沟通无杂音',
    fanbaseReq: 20000,
    baseMonthlyPayout: 9000,
    baseSigningBonus: 40000,
    perkName: '【隔音战术指挥】',
    perkDesc: '强力被动降噪麦克风，确保嘈杂线下赛场语音口令清晰传达',
    perkBuff: '战队战术羁绊协同评分 +6 · 战术暂停收益 +20%',
    status: 'AVAILABLE'
  },
  {
    id: 'headset_sennheiser',
    brandName: 'Sennheiser 森海塞尔',
    companyName: '森海塞尔音频集团',
    category: 'HEADSET',
    categoryNameCn: '竞技耳机',
    tier: 'S',
    logo: '🎼',
    productModel: 'GSP 600 封闭式发烧级声学耳麦',
    tagline: '严谨德国声学，捕捉瞬息万变的闪现脚步',
    fanbaseReq: 220000,
    baseMonthlyPayout: 45000,
    baseSigningBonus: 280000,
    perkName: '【微秒级脚步辨位】',
    perkDesc: '高保真声场还原，隔墙草丛隐身回城与闪现落点无所遁形',
    perkBuff: '草丛盲视野被伏击率 -40% · 反蹲成功率 +22%',
    status: 'AVAILABLE'
  }
];

export const INITIAL_PERIPHERAL_SPONSORSHIP_STATE: PeripheralSponsorshipState = {
  signedBrands: {
    KEYBOARD: null,
    CHAIR: null,
    ENERGY_DRINK: null,
    HEADSET: null
  },
  totalMonthlyRevenue: 0,
  claimedMonthsCount: 0,
  negotiationHistory: []
};
