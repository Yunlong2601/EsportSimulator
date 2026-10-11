import { WorldTourOpponent, WorldTourState, WorldTourMerchItem } from '../types/game';

export const DEFAULT_WORLD_TOUR_STATE: WorldTourState = {
  currentFloor: 1,
  highestFloorCleared: 0,
  seasonRank: 1250,
  totalTourTrophies: 0,
  activeBuffs: [],
  prestigeTokens: 35, // 初始赠送35枚名宿代币便于直接体验
  unlockedMerchCosmetics: ['stadium_neon_cyber'],
  equippedStadiumTheme: 'stadium_neon_cyber',
  equippedJerseyPattern: 'jersey_gold_dragon',
  equippedBanner: 'banner_cyber_valkyrie'
};

export const WORLD_TOUR_MERCH_CATALOG: WorldTourMerchItem[] = [
  // 1. STADIUM THEMES (主场场馆主题)
  {
    id: 'stadium_neon_cyber',
    name: '霓虹赛博夜域',
    nameEn: 'Neon Cyber Arena',
    category: 'STADIUM',
    costTokens: 15,
    icon: '🏟️',
    badge: '赛博全息',
    themeColor: '#06b6d4',
    bgGradient: 'from-cyan-950/80 via-slate-900 to-blue-950/80',
    description: '全息光幕、悬浮中央四面巨屏与激光网格主场，极具未来科幻电竞质感。',
    lore: 'LEC欧洲巡回赛特别定制赛博场馆方案，为每一位踏入舞台的选手构筑超感官沉浸视界。',
    perkEffect: '⚡ 主场全员战意激昂：比赛首发全员士气 +5，名宿声望收益 +5%',
    visualPreview: {
      ambientGlow: 'rgba(6, 182, 212, 0.35)',
      accentBorder: 'border-cyan-500/60',
      stadiumBanner: '🌌 赛博激光投影矩阵 · 全息中央四面屏'
    }
  },
  {
    id: 'stadium_oriental_dragon',
    name: '龙隐神州天境',
    nameEn: 'Imperial Dragon Sanctuary',
    category: 'STADIUM',
    costTokens: 25,
    icon: '🐉',
    badge: '东方国风',
    themeColor: '#f59e0b',
    bgGradient: 'from-amber-950/80 via-slate-900 to-red-950/80',
    description: '飞檐朱漆华表、盘龙金柱与祥云水墨巨型对战席，尽显东方电竞霸气底蕴。',
    lore: '复刻东方紫禁太和之势，盘龙昂首，金光万丈，象征王者登基的无上荣耀。',
    perkEffect: '🐉 东方金龙庇佑：决胜局大龙关键坑争夺战力 +6，粉丝忠诚度 +10%',
    visualPreview: {
      ambientGlow: 'rgba(245, 158, 11, 0.35)',
      accentBorder: 'border-amber-500/60',
      stadiumBanner: '🏮 金鳞盘龙图腾云柱 · 祥云水墨飞檐巨幕'
    }
  },
  {
    id: 'stadium_magma_forge',
    name: '赤焰熔炉地宫',
    nameEn: 'Magma Core Foundry',
    category: 'STADIUM',
    costTokens: 30,
    icon: '🌋',
    badge: '嗜血重工',
    themeColor: '#ef4444',
    bgGradient: 'from-red-950/80 via-slate-900 to-orange-950/80',
    description: '地热熔岩裂隙地台、赤焰喷气干冰与深渊工业看台，营造狂暴杀气。',
    lore: '地下深层熔炉重工业电竞要塞，火星迸溅，每一次击杀皆伴随狂暴热浪喷涌。',
    perkEffect: '🔥 狂暴熔炉战魂：开局前10分钟全线对决压迫力 +8%，击杀赏金 +8%',
    visualPreview: {
      ambientGlow: 'rgba(239, 68, 68, 0.35)',
      accentBorder: 'border-red-500/60',
      stadiumBanner: '⚡ 地心熔岩烈焰裂隙 · 蒸汽重工战意看台'
    }
  },
  {
    id: 'stadium_celestial_temple',
    name: '苍穹星瀚神殿',
    nameEn: 'Celestial Starlight Coliseum',
    category: 'STADIUM',
    costTokens: 40,
    icon: '✨',
    badge: '殿堂史诗',
    themeColor: '#a855f7',
    bgGradient: 'from-purple-950/80 via-slate-900 to-indigo-950/80',
    description: '天穹星轨星环、云端悬浮白石柱廊，神殿级电竞圣地，仅供世界巡回征服者。',
    lore: '耸立于云巅星海之上的不朽殿堂，众神瞻仰，唯有通关巡回赛巅峰之师方能驻足。',
    perkEffect: '👑 众神加冕之光：全员心理抗压 +6，巡回赛声望结算 +15%',
    visualPreview: {
      ambientGlow: 'rgba(168, 85, 247, 0.40)',
      accentBorder: 'border-purple-500/60',
      stadiumBanner: '🌌 苍穹星轨环绕圣柱 · 云端悬浮白玉神殿'
    }
  },

  // 2. FAN JERSEY PATTERNS (战队战袍纹样)
  {
    id: 'jersey_gold_dragon',
    name: '鎏金腾龙战袍',
    nameEn: 'Auric Dragon Embroidered',
    category: 'JERSEY',
    costTokens: 12,
    icon: '🥋',
    badge: '金丝苏绣',
    themeColor: '#eab308',
    bgGradient: 'from-amber-950/60 via-slate-900 to-amber-900/40',
    description: '哑光碳黑底色配高精度金丝龙纹披肩，全场应援粉丝同款，华贵非凡。',
    lore: '非遗级双面金丝盘龙绣法，战队远征世界赛场的御用官方旗舰周边战袍。',
    perkEffect: '👕 粉丝周边狂热：应援周边销量 +20%，粉丝俱乐部收入 +12%',
    visualPreview: {
      ambientGlow: 'rgba(234, 179, 8, 0.3)',
      accentBorder: 'border-amber-400/60',
      jerseyPatternStyle: '暗黑底色 · 鎏金盘龙金丝刺绣 · 祥云立领'
    }
  },
  {
    id: 'jersey_glitch_cyber',
    name: '赛博故障幻影',
    nameEn: 'Digital Glitch Mirage',
    category: 'JERSEY',
    costTokens: 18,
    icon: '🎽',
    badge: '光敏纤维',
    themeColor: '#06b6d4',
    bgGradient: 'from-cyan-950/60 via-slate-900 to-purple-900/40',
    description: '动态纳米光敏纤维，随击杀节奏闪烁数码故障撕裂霓虹色块，先锋潮流。',
    lore: '赛博朋克潮流青年狂热追捧的电光战衣，数码噪点与动态流光交相辉映。',
    perkEffect: '📺 潮流青年热潮：直播热度 +25%，新晋年轻粉丝转化率 +15%',
    visualPreview: {
      ambientGlow: 'rgba(6, 182, 212, 0.3)',
      accentBorder: 'border-cyan-400/60',
      jerseyPatternStyle: '数码撕裂 · 霓虹紫蓝故障几何光条 · 发光队标'
    }
  },
  {
    id: 'jersey_aurora_gradient',
    name: '极光流光战衣',
    nameEn: 'Arctic Aurora Luminescence',
    category: 'JERSEY',
    costTokens: 22,
    icon: '🧥',
    badge: '幽邃极光',
    themeColor: '#10b981',
    bgGradient: 'from-emerald-950/60 via-slate-900 to-teal-900/40',
    description: '仿北极光晕渐变温变丝绸战队制服，冷冽幽邃，象征极致冷静的大局指挥。',
    lore: '北欧冰雪赛区采风之作，随体温律动变换极光波段，宛如夜空中流动的极圈翡翠。',
    perkEffect: '❄️ 绝对理智指挥：队伍大局观配合 +4，赛后MVP评选加权 +10%',
    visualPreview: {
      ambientGlow: 'rgba(16, 185, 129, 0.3)',
      accentBorder: 'border-emerald-400/60',
      jerseyPatternStyle: '温变极光翡翠流晕 · 冰晶暗纹 · 冷光肩章'
    }
  },
  {
    id: 'jersey_samurai_armor',
    name: '赤霄战刃战铠',
    nameEn: 'Crimson Ronin Battleweave',
    category: 'JERSEY',
    costTokens: 28,
    icon: '🥋',
    badge: '狂草血誓',
    themeColor: '#f43f5e',
    bgGradient: 'from-rose-950/60 via-slate-900 to-red-900/40',
    description: '机能防撕裂羽织战甲，背部印有狂草血书战队誓言，充满破釜沉舟气魄。',
    lore: '武士之刃，出鞘必见血痕。背负俱乐部荣耀誓约，宁折不弯的死斗狂澜象征。',
    perkEffect: '🗡️ 破釜沉舟死斗：劣势局逆境翻盘概率 +5%，粉丝狂热士气锁死不降',
    visualPreview: {
      ambientGlow: 'rgba(244, 63, 94, 0.3)',
      accentBorder: 'border-rose-400/60',
      jerseyPatternStyle: '绯红装甲片 · 狂草血书背誓 · 机能束带'
    }
  },

  // 3. TROPHY HALL & BANNERS (全息殿堂战旗)
  {
    id: 'banner_world_conqueror',
    name: '世界征服者全息战旗',
    nameEn: 'World Conqueror Holo-Banner',
    category: 'BANNER',
    costTokens: 35,
    icon: '🚩',
    badge: '百层征服',
    themeColor: '#eab308',
    bgGradient: 'from-amber-950/80 via-slate-900 to-yellow-950/80',
    description: '悬浮于主场上空的百层巡回赛巨型全息战旗，铭刻已征服四大赛区豪门勋章。',
    lore: '征服四大赛区的最高凭证，凡踏入主场之对手，皆需仰望这面遮天蔽日的荣誉图腾。',
    perkEffect: '🏆 世界威名远播：跨国赞助商赞助金 +15%，全球知名度持续攀升',
    visualPreview: {
      ambientGlow: 'rgba(234, 179, 8, 0.4)',
      accentBorder: 'border-amber-400/60',
      stadiumBanner: '🚩 悬浮全息征服战旗 · 四大赛区金色勋章环绕'
    }
  },
  {
    id: 'banner_cyber_valkyrie',
    name: '瓦尔基里守护之光',
    nameEn: 'Valkyrie Aegis Crest',
    category: 'BANNER',
    costTokens: 20,
    icon: '🛡️',
    badge: '光翼守护',
    themeColor: '#38bdf8',
    bgGradient: 'from-sky-950/80 via-slate-900 to-indigo-950/80',
    description: '光翼舒展的女武神立体光雕旗帜，主场降临即可激活全场幽蓝能量风暴。',
    lore: '电竞守护女神的庇佑徽记，在危机四伏的决胜局中赋予全队坚如磐石的防守韧性。',
    perkEffect: '🛡️ 钢铁守护壁垒：基地主堡防守反击胜率 +8%，主场门票销售 +10%',
    visualPreview: {
      ambientGlow: 'rgba(56, 189, 248, 0.35)',
      accentBorder: 'border-sky-400/60',
      stadiumBanner: '🛡️ 瓦尔基里展翼立体光雕 · 幽蓝能量防护罩'
    }
  }
];

export function getMerchItemById(id: string): WorldTourMerchItem | undefined {
  return WORLD_TOUR_MERCH_CATALOG.find(item => item.id === id);
}

// 预定义的世界巡回赛里程碑Boss战队
const CURATED_BOSS_FLOORS: Record<number, Partial<WorldTourOpponent>> = {
  5: {
    floor: 5,
    region: 'LEC',
    teamName: 'FNC 青年近卫军',
    captain: 'Rekkles Jr.',
    captainAvatar: '🏹',
    bossTitle: '欧洲新星神射手',
    combatPower: 82,
    specialGimmick: '【速攻下路】前15分钟敌方下路获得+15%额外压制力',
    rewardPrestige: 30,
    isBoss: true
  },
  10: {
    floor: 10,
    region: 'LCS',
    teamName: 'Team Liquid 银河舰队',
    captain: 'Impact',
    captainAvatar: '🛡️',
    bossTitle: '大木老师 · 不动磐石',
    combatPower: 86,
    specialGimmick: '【上路绝对壁垒】我方单杀难度翻倍，BP克制抗性提升',
    rewardPrestige: 45,
    isBoss: true
  },
  20: {
    floor: 20,
    region: 'LEC',
    teamName: 'G2 Esports 狂欢军团',
    captain: 'Caps',
    captainAvatar: '🎪',
    bossTitle: 'Baby Faker · 杂技团魔术师',
    combatPower: 90,
    specialGimmick: '【战术偷家狂魔】团战逆风时有 35% 几率触发绝境偷龙换塔',
    rewardPrestige: 60,
    isBoss: true
  },
  35: {
    floor: 35,
    region: 'LPL',
    teamName: 'WBG 微博电子竞技',
    captain: 'TheShy (Prime)',
    captainAvatar: '🗡️',
    bossTitle: '天神下凡 · 剑魔剑仙',
    combatPower: 94,
    specialGimmick: '【一打五嗜血】绝境团战输出提升 40%，微操硬核检定',
    rewardPrestige: 90,
    isBoss: true
  },
  50: {
    floor: 50,
    region: 'LCK',
    teamName: 'Gen.G 金色王朝',
    captain: 'Chovy',
    captainAvatar: '👑',
    bossTitle: '补刀机器 · 八八六十四卦中单',
    combatPower: 98,
    specialGimmick: '【兵线压制领域】每分钟自动领先 500 经济，拖入30分钟胜率极低',
    rewardPrestige: 130,
    isBoss: true
  },
  70: {
    floor: 70,
    region: 'LPL',
    teamName: '2018 IG 极境巅峰',
    captain: 'Rookie & JackeyLove',
    captainAvatar: '⚡',
    bossTitle: '翻山破晓 · 极意登峰',
    combatPower: 104,
    specialGimmick: '【不斩无名之辈】全线血腥度拉满，开局即进入大乱斗搏杀',
    rewardPrestige: 180,
    isBoss: true
  },
  85: {
    floor: 85,
    region: 'LCK',
    teamName: '2023-2024 T1 五星王朝',
    captain: 'Faker (大魔王)',
    captainAvatar: '🏆',
    bossTitle: '不死魔王 · 四冠五冠终极化身',
    combatPower: 110,
    specialGimmick: '【魔王光环】开局封锁我方最强核心，全员团战韧性拉满',
    rewardPrestige: 240,
    isBoss: true
  },
  100: {
    floor: 100,
    region: 'LEGEND_BOSS',
    teamName: '召唤师峡谷 · 虚空创世神殿队',
    captain: 'The Ancient Summoner',
    captainAvatar: '🌌',
    bossTitle: '电竞万神殿总守护者',
    combatPower: 120,
    specialGimmick: '【终极审判】微操与战术全维度神级压制，唯有满天赋者方可逆天弑神！',
    rewardPrestige: 500,
    isBoss: true
  }
};

// 动态生成指定层数的世界巡回赛对手
export function generateFloorOpponent(floor: number): WorldTourOpponent {
  if (CURATED_BOSS_FLOORS[floor]) {
    const curated = CURATED_BOSS_FLOORS[floor];
    return {
      floor,
      region: curated.region || 'LCK',
      teamName: curated.teamName || `世界挑战者战队 #${floor}`,
      captain: curated.captain || '领队王牌',
      captainAvatar: curated.captainAvatar || '⭐',
      bossTitle: curated.bossTitle || '巡回赛首领',
      combatPower: curated.combatPower || 80,
      specialGimmick: curated.specialGimmick || '标准巡回赛高强度对抗',
      rewardPrestige: curated.rewardPrestige || 25,
      isBoss: true
    };
  }

  // 算法根据层数梯度生成
  const regions: WorldTourOpponent['region'][] = ['LPL', 'LCK', 'LEC', 'LCS'];
  const region = regions[(floor - 1) % regions.length];

  const teamPrefixes = ['星辉', '极光', '狂风', '巨浪', '泰坦', '黑曜', '幻影', '雷霆', '赤焰', '龙魂'];
  const teamSuffixes = ['Gaming', 'Esports', 'Dynasty', 'Warriors', 'Squad', 'Legends', 'Club'];
  const pIdx = (floor * 3) % teamPrefixes.length;
  const sIdx = (floor * 7) % teamSuffixes.length;
  const teamName = `${teamPrefixes[pIdx]} ${teamSuffixes[sIdx]} (${region})`;

  const captains = [
    { name: 'ViperClone', avatar: '🎯', title: '精准斩杀射手' },
    { name: 'ShowMakerX', avatar: '🎭', title: '重铸荣光法王' },
    { name: 'KanaviSpeed', avatar: '🐾', title: '野区狂暴掠食者' },
    { name: 'BinFighter', avatar: '⚔️', title: '绝境单带斗士' },
    { name: 'KeriaVision', avatar: '👁️', title: '灵性游走辅助' }
  ];
  const cap = captains[(floor + 2) % captains.length];

  // 战力随层数线性平滑增长
  const basePower = 75 + Math.floor(floor * 0.42);
  const isMiniBoss = floor % 5 === 0;
  const combatPower = isMiniBoss ? basePower + 4 : basePower;
  const rewardPrestige = isMiniBoss ? 20 + Math.floor(floor * 0.8) : 10 + Math.floor(floor * 0.4);

  return {
    floor,
    region,
    teamName,
    captain: cap.name,
    captainAvatar: cap.avatar,
    bossTitle: cap.title,
    combatPower,
    specialGimmick: isMiniBoss ? '【赛点高压】对手全属性提升 8%，关键龙坑集结极快' : '常规巡回晋级赛，考验基本功储备',
    rewardPrestige,
    isBoss: isMiniBoss
  };
}

// 巡回赛战役模拟计算
export function simulateWorldTourMatch(
  playerTeamPower: number,
  opponent: WorldTourOpponent,
  passives: string[]
): {
  isWin: boolean;
  score: string;
  battleLogs: string[];
  prestigeReward: number;
} {
  // 传承天赋增益加成
  let effectivePower = playerTeamPower;
  if (passives.includes('passive_deep_champ_pool')) effectivePower += 5;
  if (passives.includes('passive_shotcaller_core')) effectivePower += 6;
  if (passives.includes('passive_dragon_baron_whisperer')) effectivePower += 4;
  if (passives.includes('passive_phoenix_rebirth')) effectivePower += 6;

  const powerDiff = effectivePower - opponent.combatPower;
  // 胜率计算，中线 50%，每差 1 点战力浮动 2.5%
  let winProb = 0.50 + (powerDiff * 0.025);
  winProb = Math.max(0.12, Math.min(0.92, winProb));

  const isWin = Math.random() < winProb;
  const logs: string[] = [];
  logs.push(`🌍【世界巡回赛第 ${opponent.floor} 层】迎战 [${opponent.region}] ${opponent.teamName} (战力: ${opponent.combatPower})！`);
  logs.push(`对阵队长：${opponent.captainAvatar} ${opponent.captain} (${opponent.bossTitle})`);
  logs.push(`特殊战场环境：${opponent.specialGimmick}`);

  if (isWin) {
    const score = opponent.isBoss ? '3 - 1' : '2 - 0';
    logs.push(`🔥 完美团战突袭！我方在关键远古巨龙团一波团灭对手，推平水晶主堡！大比分 ${score} 获胜！`);
    logs.push(`✨ 破纪录斩获 +${opponent.rewardPrestige} 名宿声望点数，解锁通往第 ${opponent.floor + 1} 层的通关凭证！`);
    return {
      isWin: true,
      score,
      battleLogs: logs,
      prestigeReward: opponent.rewardPrestige
    };
  } else {
    const score = opponent.isBoss ? '2 - 3' : '1 - 2';
    logs.push(`💀 决胜局遗憾告负！${opponent.captain} 抓到走位失误完成致命开团，惜败大比分 ${score}。`);
    logs.push(`💡 提示：可通过在名宿殿堂点亮永久传承天赋树或在俱乐部提升设施与阵容战力后再次挑战！`);
    return {
      isWin: false,
      score,
      battleLogs: logs,
      prestigeReward: Math.floor(opponent.rewardPrestige * 0.25)
    };
  }
}
