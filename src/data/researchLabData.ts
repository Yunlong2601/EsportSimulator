import { MERCH_RD_UPGRADES } from './merchData';

export type RDResearchCategory = 'HUMAN_PERFORMANCE' | 'TACTICAL_INNOVATION' | 'INFRASTRUCTURE_OPTIMIZATION';

export interface RDResearchCategoryMeta {
  id: RDResearchCategory;
  name: string;
  englishName: string;
  icon: string;
  tagline: string;
  themeColor: {
    accent: string;
    border: string;
    bg: string;
    glow: string;
    badge: string;
  };
}

export const RD_CATEGORIES_META: Record<RDResearchCategory, RDResearchCategoryMeta> = {
  HUMAN_PERFORMANCE: {
    id: 'HUMAN_PERFORMANCE',
    name: '人体机能与生理表现',
    englishName: 'Human Performance & Ergonomics',
    icon: '🩺',
    tagline: '人机工效、手腕肌腱防线、神经反射与昼夜节律调控，构筑不朽钢铁竞技之躯',
    themeColor: {
      accent: 'text-rose-400',
      border: 'border-rose-500/40',
      bg: 'bg-rose-950/20',
      glow: 'shadow-[0_0_25px_rgba(244,63,94,0.2)]',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
    }
  },
  TACTICAL_INNOVATION: {
    id: 'TACTICAL_INNOVATION',
    name: '战术创新与AI演算',
    englishName: 'Tactical Innovation & AI Models',
    icon: '🧠',
    tagline: '深层神经网络BP模拟、全图迷雾拓扑引擎与毫秒级协同通讯，占领版本战略制高点',
    themeColor: {
      accent: 'text-cyan-400',
      border: 'border-cyan-500/40',
      bg: 'bg-cyan-950/20',
      glow: 'shadow-[0_0_25px_rgba(6,182,212,0.2)]',
      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
    }
  },
  INFRASTRUCTURE_OPTIMIZATION: {
    id: 'INFRASTRUCTURE_OPTIMIZATION',
    name: '基础设施与超算工学',
    englishName: 'Infrastructure Optimization & Tech Facilities',
    icon: '🏗️',
    tagline: '万兆独享极速专线、全息复盘穹顶与航天级深冷氧舱，铸造世界级豪门训练基底',
    themeColor: {
      accent: 'text-amber-400',
      border: 'border-amber-500/40',
      bg: 'bg-amber-950/20',
      glow: 'shadow-[0_0_25px_rgba(245,158,11,0.2)]',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    }
  }
};

export interface RDResearchNodeLevel {
  level: number;
  title: string;
  detail: string;
  cost: number;
  techPointCost: number;
  perkBadge: string;
  bonusDisplay: string;
  strainReduction?: number;
  therapyDurationReduction?: number;
}

export interface RDResearchNode {
  id: string;
  category: RDResearchCategory;
  name: string;
  englishName: string;
  icon: string;
  description: string;
  maxLevel: number;
  levels: RDResearchNodeLevel[];
}

// Pre-configured nodes for the R&D Dashboard
export const ALL_RD_RESEARCH_NODES: RDResearchNode[] = [
  // 1. HUMAN PERFORMANCE
  {
    id: 'injury_prevention',
    category: 'HUMAN_PERFORMANCE',
    name: '伤病预防与康复医学',
    englishName: 'Injury Prevention & Recovery',
    icon: '🩺',
    description: '电竞人机工效与运动康复科研。研发微动支撑套件、深层神经松解、生化细胞修复及外骨骼护具，大幅削减高强度20小时经营实训产生的腕管肌腱负荷（Strain），根治恶性腱鞘炎并缩短理疗康复耗程。',
    maxLevel: 5,
    levels: [
      {
        level: 1,
        title: '微动工效手腕护托套件',
        detail: '高分子弹性凝胶托垫，有效分散鼠标手腕支撑轴心剪切力',
        perkBadge: '🛡️ 护托工效',
        bonusDisplay: '手腕累积负荷 -10% • 理疗开支 -10%',
        cost: 25000,
        techPointCost: 20,
        strainReduction: 0.10,
        therapyDurationReduction: 0.10
      },
      {
        level: 2,
        title: '深层神经肌腱微频松解仪',
        detail: '40Hz医用微电流神经肌电松解，赛后15分钟快速排解正中神经水肿与指间张力',
        perkBadge: '⚡ 神经松解',
        bonusDisplay: '手腕累积负荷 -20% • 理疗开支 -20%',
        cost: 55000,
        techPointCost: 40,
        strainReduction: 0.20,
        therapyDurationReduction: 0.20
      },
      {
        level: 3,
        title: '高压负离子经筋修复舱',
        detail: '常备基地理疗室，高浓度负离子与脉冲磁场渗透腕掌深层结缔组织，加速代谢微损伤',
        perkBadge: '🧬 经筋修复',
        bonusDisplay: '手腕累积负荷 -30% • 理疗开支 -30%',
        cost: 121000,
        techPointCost: 60,
        strainReduction: 0.30,
        therapyDurationReduction: 0.30
      },
      {
        level: 4,
        title: '生化细胞软骨再生理疗素',
        detail: '国际前沿运动医学靶向软骨修复凝胶，彻底阻断职业腱鞘囊肿与慢性滑膜炎症诱发链',
        perkBadge: '💉 靶向再生',
        bonusDisplay: '手腕累积负荷 -40% • 理疗开支 -40%',
        cost: 266200,
        techPointCost: 80,
        strainReduction: 0.40,
        therapyDurationReduction: 0.40
      },
      {
        level: 5,
        title: '纳米神经拟态外骨骼装甲',
        detail: '世界级顶尖仿生外骨骼，0阻力随动辅助掌指微操，终生免除重度恶性腱鞘炎，手腕负荷永久减半！',
        perkBadge: '🦾 纳米外骨骼',
        bonusDisplay: '手腕累积负荷 -50% (上限) • 理疗开支 -50%',
        cost: 585640,
        techPointCost: 100,
        strainReduction: 0.50,
        therapyDurationReduction: 0.50
      }
    ]
  },
  {
    id: 'neural_reflex',
    category: 'HUMAN_PERFORMANCE',
    name: '神经突触反射与微操敏捷仪',
    englishName: 'Neural Synaptic Reflex Trainer',
    icon: '⚡',
    description: '通过动态视觉色阶感应与微秒级按键反馈训练，刺激选手运动皮层神经元髓鞘化，显著提升极限反应与手速。',
    maxLevel: 4,
    levels: [
      {
        level: 1,
        title: '毫秒动态视力反应沙盘',
        detail: '144Hz动态色块随机捕捉，磨炼选手瞬时视觉反应与眼动追踪',
        perkBadge: '👁️ 动态视力',
        bonusDisplay: '对线极限换血与防Gank反应 +4%',
        cost: 30000,
        techPointCost: 25
      },
      {
        level: 2,
        title: '经颅微电流前额叶刺激仪',
        detail: '低强度微电流平抑交感神经应激，大幅增强关键赛点逆境抗压与团战冷静决策',
        perkBadge: '🧠 前额叶刺激',
        bonusDisplay: '逆境战局冷静度 +8% • 关键技能命中率 +5%',
        cost: 70000,
        techPointCost: 50
      },
      {
        level: 3,
        title: '量子拟态微操触觉套件',
        detail: '仿生力反馈指套，连续高强度团战微操失误率骤降，极限技能走位拉扯更自如',
        perkBadge: '🖐️ 力反馈微操',
        bonusDisplay: '连续团战操作失误率 -15% • 输出拉扯 +10%',
        cost: 150000,
        techPointCost: 80
      },
      {
        level: 4,
        title: '超感官多线程战局心流矩阵',
        detail: '脑波同频全感官沉浸系统，选手在决赛赛点局进入绝对无我心流境界',
        perkBadge: '🌌 绝对心流',
        bonusDisplay: '世界大赛决胜局选手全能力值爆发 +15%',
        cost: 320000,
        techPointCost: 120
      }
    ]
  },
  {
    id: 'circadian_ergonomics',
    category: 'HUMAN_PERFORMANCE',
    name: '昼夜节律与电竞微气候优化',
    englishName: 'Circadian Microclimate Architecture',
    icon: '🌙',
    description: '针对电竞夜间训练特点，通过定制全光谱光幕、气流温湿度精准恒定与褪黑素诱导，快速重塑充沛精力。',
    maxLevel: 3,
    levels: [
      {
        level: 1,
        title: '智能全光谱节律光幕',
        detail: '过滤有害蓝光波段，模拟晨昏自然色温，平缓日夜颠倒带来的生物钟紊乱',
        perkBadge: '☀️ 节律光幕',
        bonusDisplay: '选手夜间休整恢复效率 +15%',
        cost: 20000,
        techPointCost: 15
      },
      {
        level: 2,
        title: '微压富氧深睡胶囊',
        detail: '高纯度微压富氧环境，2小时深度休眠相当于传统6小时睡眠排毒效率',
        perkBadge: '🛌 富氧胶囊',
        bonusDisplay: '日常训练疲劳衰减速度 -20% • 精力恢复 +25%',
        cost: 55000,
        techPointCost: 40
      },
      {
        level: 3,
        title: '脑电波共振深度睡眠矩阵',
        detail: 'Delta慢波音频引导快速进入深度睡眠，赛前赛后神经疲劳彻底清零',
        perkBadge: '💤 脑波共振',
        bonusDisplay: '全员精力充盈率 +40% • 状态波动惩罚免除',
        cost: 120000,
        techPointCost: 70
      }
    ]
  },

  // 2. TACTICAL INNOVATION
  {
    id: 'ai_bp_neural',
    category: 'TACTICAL_INNOVATION',
    name: '深层神经网络 BP 智能推演模型',
    englishName: 'Deep Learning BP Simulator',
    icon: '🤖',
    description: '运用海量全球赛区BP选边大数据，训练对抗生成网络（GAN），自动生成最优选边克制解与陷阱阵容诱导策略。',
    maxLevel: 4,
    levels: [
      {
        level: 1,
        title: '历史对局大数据胜率评估矩阵',
        detail: '实时计算当前选边阵容胜率曲线与强势强势期分布',
        perkBadge: '📊 胜率测算',
        bonusDisplay: 'BP选边对局胜率基础修正 +5%',
        cost: 35000,
        techPointCost: 30
      },
      {
        level: 2,
        title: '绝活英雄诱导与针对性拆解算法',
        detail: '分析敌方王牌选手的英雄池盲区，制造致命BP陷阱',
        perkBadge: '🎯 针对拆解',
        bonusDisplay: '敌方招牌英雄发挥限制 +12% • BP容错率 +8%',
        cost: 85000,
        techPointCost: 55
      },
      {
        level: 3,
        title: '动态多维战术羁绊自适应模型',
        detail: '根据教练战术指令实时重构5人羁绊联动乘数，克制敌方进攻体系',
        perkBadge: '🔗 羁绊自适应',
        bonusDisplay: '战术阵容相克加成 +16% • 前期滚雪球胜率 +10%',
        cost: 180000,
        techPointCost: 90
      },
      {
        level: 4,
        title: '量子对局上帝视角全沙盘',
        detail: '推演未来20分钟全部团战分支与龙团博弈，BP阶段即锁定终极胜势',
        perkBadge: '🔮 上帝沙盘',
        bonusDisplay: '世界级大赛对局胜率全面上浮 +25%',
        cost: 380000,
        techPointCost: 140
      }
    ]
  },
  {
    id: 'macro_fog_vision',
    category: 'TACTICAL_INNOVATION',
    name: '战争迷雾宏观视野拓扑算法',
    englishName: 'Fog-of-War Topological Matrix',
    icon: '🗺️',
    description: '构建召唤师峡谷河道与野区视野热力动态模型，预测敌方打野巡航路线与野区偷龙企图，掌握全图视野主动权。',
    maxLevel: 3,
    levels: [
      {
        level: 1,
        title: '龙坑与河道关键眼位覆盖率热力图',
        detail: '测算敌方视野盲区，大幅优化排眼路线与资源团防守眼位',
        perkBadge: '👁️ 热力眼位',
        bonusDisplay: '史诗级野怪（大龙/小龙）争夺胜率 +8%',
        cost: 30000,
        techPointCost: 25
      },
      {
        level: 2,
        title: '野区打野路线毫秒级概率预判引擎',
        detail: '敌方打野露头即刻演算下三组野怪刷新与Gank概率，提前防蹲',
        perkBadge: '🧭 路径演算',
        bonusDisplay: '全队防Gank暴毙率降低 25% • 反野收益 +15%',
        cost: 75000,
        techPointCost: 50
      },
      {
        level: 3,
        title: '侧翼绕后死角全景光影侦测矩阵',
        detail: '团战前夕锁定敌方刺客与上单TP绕后眼位，杜绝被偷家与致命突袭',
        perkBadge: '🛡️ 盲区透视',
        bonusDisplay: '决胜团战先手权掌握率 +20% • 偷家防守率 100%',
        cost: 160000,
        techPointCost: 85
      }
    ]
  },
  {
    id: 'team_sync_comms',
    category: 'TACTICAL_INNOVATION',
    name: '全队毫秒级音频协同降噪通信流',
    englishName: 'Tactical Voice Sync Comms',
    icon: '🎧',
    description: '比赛现场万众呼啸环境下，借助骨传导与AI降噪算法实现全队集火指令零延迟同步，大幅增强团战集火效率。',
    maxLevel: 3,
    levels: [
      {
        level: 1,
        title: '比赛现场主动降噪与人声分离算法',
        detail: '过滤现场观众声浪与解说杂音，确保指挥呼叫清晰可闻',
        perkBadge: '🎙️ 人声增强',
        bonusDisplay: '团队沟通效率 +8% • 团战集火响应提升',
        cost: 25000,
        techPointCost: 20
      },
      {
        level: 2,
        title: '主指挥目标优先级即时音频高亮',
        detail: '团队第一集火目标声音信号自动提升分贝，杜绝伤害分散与集火犹豫',
        perkBadge: '🎯 目标高亮',
        bonusDisplay: '团战首杀爆发速度 +15% • 减员翻盘率 +12%',
        cost: 60000,
        techPointCost: 45
      },
      {
        level: 3,
        title: '战场同频默契心流神经网',
        detail: '即使无言交流亦能实现毫秒级技能Combo衔接，缔造殿堂级完美团战',
        perkBadge: '✨ 完美Combo',
        bonusDisplay: '完美团战触发概率 +30% • 协同默契度达峰',
        cost: 135000,
        techPointCost: 75
      }
    ]
  },

  // 3. INFRASTRUCTURE OPTIMIZATION
  {
    id: 'quantum_fiber_node',
    category: 'INFRASTRUCTURE_OPTIMIZATION',
    name: '万兆独享光纤专线网络节点',
    englishName: 'Sub-ms Quantum Fiber Network',
    icon: '🌐',
    description: '铺设直达跨国电竞服务器机房专线光纤，消除全队排位跳Ping与丢包风险，保持极致顺畅对局心流。',
    maxLevel: 4,
    levels: [
      {
        level: 1,
        title: '跨国服BGP电竞专线隧道',
        detail: '韩服美服日常天梯排位Ping值稳定在个位数，告别卡顿掉线烦扰',
        perkBadge: '🚀 极速BGP',
        bonusDisplay: '全队日常排位士气 +5% • 训练心流稳定',
        cost: 32000,
        techPointCost: 25
      },
      {
        level: 2,
        title: '双路自愈冷备冗余网络机房',
        detail: '遇雷暴极端天气毫秒自愈切换主备光缆，保障高强度训练赛从不中断',
        perkBadge: '🔄 自愈冷备',
        bonusDisplay: '网络丢包率 0% • 赛前热身效率 +20%',
        cost: 80000,
        techPointCost: 55
      },
      {
        level: 3,
        title: '量子同步光子交换核心机柜',
        detail: '全球顶尖光子交换网络，0.5ms内极速响应，全队状态恢复大幅攀升',
        perkBadge: '⚡ 光子交换',
        bonusDisplay: '疲劳恢复速度 +40% • 永久全员士气 +12%',
        cost: 175000,
        techPointCost: 90
      },
      {
        level: 4,
        title: '星链电竞天基直连超算终端',
        detail: '天地一体化低轨卫星直连，无论何时何地均处于世界最高网络优先级',
        perkBadge: '🛰️ 天基直连',
        bonusDisplay: '终生免除任何网络波动 • 永久士气底限 +20%',
        cost: 360000,
        techPointCost: 130
      }
    ]
  },
  {
    id: 'holo_tactical_dome',
    category: 'INFRASTRUCTURE_OPTIMIZATION',
    name: '全息全景战术复盘沙盘穹顶',
    englishName: 'Holographic Tactical Holo-Dome',
    icon: '🔮',
    description: '在基地中庭构建360度立体裸眼3D全息对局复现系统，教练与全员如同置身召唤师峡谷上空审视每一帧站位。',
    maxLevel: 3,
    levels: [
      {
        level: 1,
        title: '4K超清全景上帝视角复盘矩阵',
        detail: '全队围坐巨幕前，精准定格每波团战技能落点与闪现CD',
        perkBadge: '📽️ 全景上帝',
        bonusDisplay: '每日战术复盘经验收益 +15%',
        cost: 40000,
        techPointCost: 30
      },
      {
        level: 2,
        title: '3D裸眼光场实境对战推演沙盘',
        detail: '可自由缩放战局地图，沉浸式研判敌方核心站位缺陷与防守盲区',
        perkBadge: '🏟️ 裸眼光场',
        bonusDisplay: '训练赛经验转化效率 +25% • 战术理解度 +18%',
        cost: 95000,
        techPointCost: 60
      },
      {
        level: 3,
        title: '数字孪生虚实交融电竞研训实验室',
        detail: '与真实选手神经信号联动的数字孪生替身，可在虚拟沙盘模拟成百上千场未知阵容对决',
        perkBadge: '🧬 数字孪生',
        bonusDisplay: '战队战术熟练度成长速度 +45% • 新流派开发耗时减半',
        cost: 220000,
        techPointCost: 95
      }
    ]
  },
  {
    id: 'cryo_recovery_pod',
    category: 'INFRASTRUCTURE_OPTIMIZATION',
    name: '超低温深冷与高压氧康复中心',
    englishName: 'Cryotherapy & Hyperbaric Recovery Dome',
    icon: '❄️',
    description: '引进职业体育豪门专属深冷全身康复与高压氧舱，快速排出乳酸与炎性因子，让选手身心迅速重返巅峰。',
    maxLevel: 3,
    levels: [
      {
        level: 1,
        title: '-110℃ 医用深冷肌筋膜激活舱',
        detail: '3分钟极速超低温诱导血管收缩舒张，迅速排解长时间伏案导致的腰肌劳损',
        perkBadge: '🧊 医用深冷',
        bonusDisplay: '高强度训练赛后疲劳恢复 +25%',
        cost: 45000,
        techPointCost: 35
      },
      {
        level: 2,
        title: '2.0绝对大气压医用高压氧神经修护舱',
        detail: '血氧饱和度迅速提升，大脑供氧充沛，思维反应速度倍增',
        perkBadge: '🫧 医用高压氧',
        bonusDisplay: '理疗康复耗时缩短 40% • 选手精力充盈度 +30%',
        cost: 110000,
        techPointCost: 70
      },
      {
        level: 3,
        title: '航天级全生命体征多模态细胞激活中心',
        detail: '全套生物传感器监控心率变异性与脑电波，终生杜绝重度职业病爆发风险',
        perkBadge: '🚀 航天级修护',
        bonusDisplay: '全员重度恶性伤病免疫率 +60% • 疲劳恢复 +50%',
        cost: 240000,
        techPointCost: 105
      }
    ]
  }
];

export interface TierCumulativeBenefitInfo {
  level: number;
  title: string;
  cumulativeStrainReduction: number;
  cumulativeTherapyReduction: number;
  cumulativeCost: number;
  cumulativeTechPoints: number;
  cumulativeHype: number;
  stageBadge: string;
  worldsStageName: string;
  worldsImpactHeadline: string;
  roadToWorldsDetailedImpact: string;
  bo5EnduranceRating: 'A' | 'A+' | 'S' | 'S+' | 'SSS';
  clutchAdvantageText: string;
}

export const INJURY_PREVENTION_CUMULATIVE_BENEFITS: Record<number, TierCumulativeBenefitInfo> = {
  1: {
    level: 1,
    title: '生物力学护腕与掌压释负 (Ergo Wrist Stabilizer)',
    cumulativeStrainReduction: 10,
    cumulativeTherapyReduction: 15,
    cumulativeCost: 25000,
    cumulativeTechPoints: 20,
    cumulativeHype: 4,
    stageBadge: '🌱【春/夏季常规赛】长征初阶防线',
    worldsStageName: '常规赛出征与名额保底阶段',
    worldsImpactHeadline: '分散掌骨高频剪切力，阻断早期腱鞘微损伤',
    roadToWorldsDetailedImpact: '在漫长的常规赛跨周马拉松赛程中，为首发五虎构筑第一道人体工效防线。有效分散每日数十万次鼠标甩动点选压力，阻断肌腱无菌性水肿诱发链，确保主力全勤出战积攒世界赛保底积分。',
    bo5EnduranceRating: 'A',
    clutchAdvantageText: '常规赛长局对决手感保持 +8% · 零初期腕部伤退停赛风险'
  },
  2: {
    level: 2,
    title: '微循环热敷与肌筋膜声波松解 (Percussive Myofascial Therapy)',
    cumulativeStrainReduction: 20,
    cumulativeTherapyReduction: 25,
    cumulativeCost: 90000,
    cumulativeTechPoints: 65,
    cumulativeHype: 10,
    stageBadge: '🌊【季后赛冒泡赛】高压排酸护盾',
    worldsStageName: '季后赛与抢分出线关键战役',
    worldsImpactHeadline: '深层微频筋膜松解，高压长盘拉扯杜绝手部僵硬',
    roadToWorldsDetailedImpact: '季后赛高压冒泡赛BO5连轴转，赛后15分钟快速排解正中神经水肿与前臂深层乳酸。即便打满五局依然维持十指灵动如初，大幅降低第4、5局因手指酸痛导致的操作变形与失误率，稳稳锁定全球总决赛门票。',
    bo5EnduranceRating: 'A+',
    clutchAdvantageText: '季后赛BO5后半段手速保持 +15% · 关键技能反应精度不衰减'
  },
  3: {
    level: 3,
    title: '冷压靶向神经调理与细胞活化 (Cryo Nerve Conditioning)',
    cumulativeStrainReduction: 30,
    cumulativeTherapyReduction: 35,
    cumulativeCost: 240000,
    cumulativeTechPoints: 155,
    cumulativeHype: 19,
    stageBadge: '❄️【MSI / 世界赛小组赛】跨国征战定海神针',
    worldsStageName: '全球总决赛跨国长征与入围/小组赛',
    worldsImpactHeadline: '阻断神经轴突痛觉连锁，跨时区客场征战手感不掉线',
    roadToWorldsDetailedImpact: '面对跨国长途飞行与跨时区日夜倒颠倒的恶劣征战环境，极速冷压激活细胞热休克蛋白阻断神经痛觉传导，维持核心C位巅峰微操反应。面对海外豪门多轮试探与高强度战术交锋，首发阵容体能续航傲视全场。',
    bo5EnduranceRating: 'S',
    clutchAdvantageText: '跨时区客场作战体能适应 +22% · 连续对抗抗疲劳指数翻倍'
  },
  4: {
    level: 4,
    title: '智能肌电生物传感与疲劳熔断 (Smart EMG Fatigue Sensor)',
    cumulativeStrainReduction: 40,
    cumulativeTherapyReduction: 42,
    cumulativeCost: 560000,
    cumulativeTechPoints: 305,
    cumulativeHype: 31,
    stageBadge: '⚡【世界赛八强与半决赛】毫秒智能熔断',
    worldsStageName: '全球总决赛八强与半决赛生死淘汰赛',
    worldsImpactHeadline: '毫秒级感知抽搐电位，决胜局极限拉扯零手抖失误',
    roadToWorldsDetailedImpact: '在全球总决赛四强淘汰赛4~5小时窒息鏖战中，智能肌电感知系统实时预警肌肉颤搐电位并在失控前智能减负。确保选手在第五局天王山龙坑世纪决战中，依然能以百毫秒极限反应极限闪现规避致命控制，斩获通往总决赛决战门票！',
    bo5EnduranceRating: 'S+',
    clutchAdvantageText: 'BO5决胜局操作零手抖失误 · 关键团战胜负手技能释放精度 +30%'
  },
  5: {
    level: 5,
    title: '纳米神经拟态外骨骼装甲 (Nanotech Neural Exosuit)',
    cumulativeStrainReduction: 50,
    cumulativeTherapyReduction: 50,
    cumulativeCost: 1240000,
    cumulativeTechPoints: 555,
    cumulativeHype: 47,
    stageBadge: '👑【全球总决赛决战夜】登神长阶不朽金身',
    worldsStageName: '全球总决赛终极极境巅峰决战 (Worlds Pinnacle)',
    worldsImpactHeadline: '终生免除恶性腱鞘炎，十万人巨蛋现场铸就永动机王朝',
    roadToWorldsDetailedImpact: '航天级仿生外骨骼0阻力主动分流90%操作负荷，终生彻底根除职业选手毁灭性腱鞘炎！在十万名观众欢呼雷动的世界赛主舞台决胜局，全队以超人类般充盈精力与极限手速摧枯拉朽，捧起召唤师杯，缔造不朽冠军王朝！',
    bo5EnduranceRating: 'SSS',
    clutchAdvantageText: '全球总决赛封神胜率加成 +20% · 终生免除重度恶性腱鞘炎 · 登顶世界之巅'
  }
};

/**
 * Returns cumulative stats and Road to Worlds benefits for any given node & tier
 */
export function getNodeCumulativeBenefits(nodeId: string, level: number): TierCumulativeBenefitInfo {
  if (nodeId === 'injury_prevention' && INJURY_PREVENTION_CUMULATIVE_BENEFITS[level]) {
    return INJURY_PREVENTION_CUMULATIVE_BENEFITS[level];
  }

  const node = ALL_RD_RESEARCH_NODES.find(n => n.id === nodeId);
  const targetLevel = Math.max(1, Math.min(level, node?.maxLevel || 5));
  let cumCost = 0;
  let cumTechPoints = 0;
  
  if (node) {
    for (let i = 0; i < targetLevel; i++) {
      if (node.levels[i]) {
        cumCost += node.levels[i].cost;
        cumTechPoints += node.levels[i].techPointCost;
      }
    }
  }

  const stageBadges = [
    '🌱【常规赛长征】初阶筑基',
    '🌊【季后赛抢分】强援护航',
    '❄️【MSI出征】战力升维',
    '⚡【世界赛淘汰赛】决胜质变',
    '👑【全球总决赛巅峰】王朝封神'
  ];

  const ratings: ('A' | 'A+' | 'S' | 'S+' | 'SSS')[] = ['A', 'A+', 'S', 'S+', 'SSS'];

  return {
    level: targetLevel,
    title: node?.levels[targetLevel - 1]?.title || `Tier ${targetLevel}`,
    cumulativeStrainReduction: Math.min(50, targetLevel * 10),
    cumulativeTherapyReduction: Math.min(50, targetLevel * 10),
    cumulativeCost: cumCost,
    cumulativeTechPoints: cumTechPoints,
    cumulativeHype: targetLevel * 8,
    stageBadge: stageBadges[targetLevel - 1] || '🏆【世界赛战略】阶位质变',
    worldsStageName: `通往世界之巅 · 第 ${targetLevel} 阶战略突破`,
    worldsImpactHeadline: `${node?.name || '科技研训'}核心突破，全方位强化世界大赛胜率与战队底蕴`,
    roadToWorldsDetailedImpact: `该科研项目在第 ${targetLevel} 阶全面发挥效能，为队伍在出征全球总决赛征程上提供坚实的战术/机能支撑，在决胜局关键博弈中建立不可撼动的优势基石。`,
    bo5EnduranceRating: ratings[targetLevel - 1] || 'S',
    clutchAdvantageText: `关键BO5对决增益已激活 · 累计战力护盾 ${targetLevel * 6}%`
  };
}
