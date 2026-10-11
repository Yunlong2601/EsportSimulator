import { LegacyPassive, RunModifier, CareerEnding, PrestigeState } from '../types/game';

export const DEFAULT_PRESTIGE_STATE: PrestigeState = {
  generation: 1,
  prestigePoints: 0,
  lifetimePrestigePoints: 0,
  difficultyMultiplier: 1.0,
  unlockedPassives: [],
  activeModifiers: [],
  unlockedEndingIds: [],
  totalRunsCompleted: 0
};

// 4大流派永久传承天赋树 (Legacy Passives Tree)
export const LEGACY_PASSIVES_CATALOG: LegacyPassive[] = [
  // --- 微操神经派 (Mechanics & Reflexes) ---
  {
    id: 'passive_muscle_memory',
    name: '宗师肌肉记忆',
    branch: 'mechanics',
    tier: 1,
    cost: 120,
    icon: '⚡',
    description: '前世千锤百炼的手部肌肉神经记忆刻入灵魂。新周目初始微操+15，单排基础胜率额外+8%。',
    bonusSummary: '初始微操+15，单排胜率+8%'
  },
  {
    id: 'passive_bullet_time',
    name: '极限子弹时间',
    branch: 'mechanics',
    tier: 2,
    cost: 250,
    icon: '🎯',
    description: '在千分之一秒间捕捉敌方破绽。1v1 微操对决判定反应窗口放宽 25%，完成极限单杀额外奖励 +30 LP 与 $50。',
    bonusSummary: '微操反应时间+25%，单杀额外+30 LP & $50'
  },
  {
    id: 'passive_ladder_smurf',
    name: '峡谷通天代',
    branch: 'mechanics',
    tier: 2,
    cost: 200,
    icon: '🚀',
    description: '单排天梯胜场 LP 结算额外 +25%，连胜奖励翻倍，晋级赛保送极速冲向王者！',
    bonusSummary: '单排胜场 LP+25%，冲分神速'
  },
  {
    id: 'passive_deep_champ_pool',
    name: '深不可测英雄海',
    branch: 'mechanics',
    tier: 3,
    cost: 450,
    icon: '👑',
    description: '精通所有版本绝活与逆版本黑科技。BP阶段自身英雄克制加成提升 35%，对线压制力上限突破至 110 点。',
    bonusSummary: 'BP克制威力+35%，微操上限突破至110'
  },

  // --- 战术战役派 (Tactics & Macro) ---
  {
    id: 'passive_tactical_precognition',
    name: '上帝预判之眼',
    branch: 'tactics',
    tier: 1,
    cost: 100,
    icon: '🧠',
    description: '脑内拥有千万场职业录像数据库。对局中洞悉敌方战术意图，BP阶段自动标出敌方核心弱点，心态抗压+12。',
    bonusSummary: '初始心态+12，洞悉敌方BP弱点'
  },
  {
    id: 'passive_shotcaller_core',
    name: '天人合一指挥官',
    branch: 'tactics',
    tier: 2,
    cost: 240,
    icon: '🎙️',
    description: '比赛关键团战决策无懈可击。团战秒杀与奇迹反打概率+25%，关键局系列赛心态崩盘几率清零。',
    bonusSummary: '奇迹团战率+25%，免疫心态溃散'
  },
  {
    id: 'passive_dragon_baron_whisperer',
    name: '远古神兽猎手',
    branch: 'tactics',
    tier: 3,
    cost: 420,
    icon: '🐉',
    description: '纳什男爵与远古巨龙的命定惩戒者。决胜局偷龙与抢龙胜率提高 40%，大龙buff持续团战战斗力额外+30%。',
    bonusSummary: '大龙远古龙抢龙率+40%，龙团战力+30%'
  },

  // --- 商业帝国派 (Commercial & Media) ---
  {
    id: 'passive_fame_inheritance',
    name: '跨代名宿光环',
    branch: 'commercial',
    tier: 1,
    cost: 110,
    icon: '🌟',
    description: '即便重开一世，电竞圈亦流传着你的传说。新周目继承 +20 基础知名度，直播订阅粉丝增速提高 50%。',
    bonusSummary: '初始知名度+20，直播吸粉增速+50%'
  },
  {
    id: 'passive_wall_street_mind',
    name: '资本博弈大鳄',
    branch: 'commercial',
    tier: 2,
    cost: 260,
    icon: '💼',
    description: '顶级商业运作头脑。商业赞助与经纪约报酬溢价 +45%，俱乐部赞助商签约金额外提高 35%。',
    bonusSummary: '赞助与签约报酬溢价+45%'
  },
  {
    id: 'passive_seed_venture_fund',
    name: '天使启动信托',
    branch: 'commercial',
    tier: 3,
    cost: 480,
    icon: '🏦',
    description: '家族电竞信托基金。每次轮回开局直接附赠 $200,000 天使轮创业启动金，跳过前期贫困期！',
    bonusSummary: '开局自带 $200,000 巨额信托金'
  },

  // --- 职业长青派 (Longevity & Recovery) ---
  {
    id: 'passive_titanium_wrist',
    name: '钛合金手腕',
    branch: 'longevity',
    tier: 1,
    cost: 130,
    icon: '🛡️',
    description: '强化腕骨韧带与神经传导。排位手部积劳(Strain)增长降低 50%，彻底免疫中度与重度腱鞘炎(RSI)！',
    bonusSummary: '手部劳损增长-50%，免疫重度腱鞘炎'
  },
  {
    id: 'passive_infinite_battery',
    name: '无限体能引擎',
    branch: 'longevity',
    tier: 2,
    cost: 250,
    icon: '⚡',
    description: '超强耐力与恢复机能。睡眠休整效果提升 50%，专注度(Focus)消耗速率减半，通宵训练不掉状态。',
    bonusSummary: '休整效果+50%，专注度消耗减半'
  },
  {
    id: 'passive_fatigue_metabolism',
    name: '超速代谢排毒',
    branch: 'longevity',
    tier: 2,
    cost: 220,
    icon: '🧪',
    description: '乳酸与神经疲劳光速代谢。单排对局专注度消耗降低 35%，饮用咖啡或能量饮品恢复效果额外 +50%！',
    bonusSummary: '疲劳消耗-35%，咖啡回神+50%'
  },
  {
    id: 'passive_phoenix_rebirth',
    name: '凤凰涅槃道体',
    branch: 'longevity',
    tier: 3,
    cost: 500,
    icon: '🔥',
    description: '越到绝境越强。当遭遇连败或生死局落后时，全员战力瞬间爆发 +25%，逆境胜率提升 50%！',
    bonusSummary: '绝境战力爆发+25%，逆风翻盘几率翻倍'
  }
];

// 局内肉鸽挑战词条 (Roguelike Run Modifiers)
export const RUN_MODIFIERS_CATALOG: RunModifier[] = [
  {
    id: 'mod_wrist_injury',
    name: '手疾旧患 (Wrist Trauma)',
    category: 'curse',
    difficultyRating: 2,
    scoreMultiplier: 0.25, // +25% 声望收益
    icon: '🩹',
    description: '天生旧疾，手腕积劳累积速度增加 80%，休整恢复所需费用上涨 30%。',
    flavor: '“每一次狂风骤雨的操作，都在燃烧选手的职业寿命。”'
  },
  {
    id: 'mod_toxic_ladder',
    name: '恶劣峡谷 (Toxic Solo Queue)',
    category: 'curse',
    difficultyRating: 3,
    scoreMultiplier: 0.35, // +35% 声望收益
    icon: '☠️',
    description: '单排天梯遭遇演员与摆烂队友几率大幅提高，单排对局心态受损翻倍。',
    flavor: '“这里是真正的弱肉强食与人心险恶的修罗场。”'
  },
  {
    id: 'mod_market_winter',
    name: '资本严冬 (Economic Blizzard)',
    category: 'curse',
    difficultyRating: 3,
    scoreMultiplier: 0.40, // +40% 声望收益
    icon: '📉',
    description: '俱乐部赞助签约金降低 40%，外援与明星转会费暴涨 35%。',
    flavor: '“泡沫退去，只有真正的铁血豪门才能在冰天雪地中立足。”'
  },
  {
    id: 'mod_patch_chaos',
    name: '版本暴击 (Turbulent Meta)',
    category: 'wildcard',
    difficultyRating: 4,
    scoreMultiplier: 0.45, // +45% 声望收益
    icon: '🌀',
    description: '每场比赛随机强化敌方特定阵容 20%，BP克制容错率极低。',
    flavor: '“设计师的狂怒：冷门英雄瞬间封神，主流体系一夜作废。”'
  },
  {
    id: 'mod_ironman_permadeath',
    name: '修罗铁人 (Ironman Challenge)',
    category: 'curse',
    difficultyRating: 5,
    scoreMultiplier: 0.60, // +60% 声望收益
    icon: '⚔️',
    description: '高压死斗：若在世界赛或重要系列赛以 0-3 惨败，立刻强制退役结算。',
    flavor: '“无退路，无侥幸，唯有胜利方可苟存。”'
  },
  {
    id: 'mod_speed_rush',
    name: '疾风急躁 (Fast-Track Era)',
    category: 'wildcard',
    difficultyRating: 2,
    scoreMultiplier: 0.20, // +20% 声望收益
    icon: '⏱️',
    description: '晋级赛胜负LP变动加倍(x2)，大起大落，一步登天或一落千丈！',
    flavor: '“年轻的心跳容不下平庸，必须在最短时间内冲上云霄！”'
  }
];

// 多元职业结局图鉴 (Career Endings Collection)
export const CAREER_ENDINGS_CATALOG: CareerEnding[] = [
  {
    id: 'ending_goat',
    title: '👑 召唤师峡谷唯一真神 (The GOAT)',
    category: 'GOAT',
    badge: 'GOAT · 不朽神话',
    lore: '你不仅率队夺得世界总冠军，更在个人微操、战术与粉丝影响力上均登顶世界第一，成为了电竞历史上无可争议的历史最佳 (Greatest Of All Time)。无数新星以你为榜样，你的雕像矗立在首尔与上海电竞广场之上！',
    conditionsSummary: '夺得世界赛总冠军 + 微操达到 90+ + 知名度达到 90+',
    isUnlocked: false
  },
  {
    id: 'ending_legendary_coach',
    title: '👔 功勋教父 · 三冠战术总监 (The Mastermind)',
    category: 'COACH',
    badge: '战术宗师 · 冠军教父',
    lore: '退役后你受邀执教国家队与豪门青训，凭借超凡的BP哲学与心理疏导，带领全新人阵容连续打破韩国与欧洲强敌神话，夺得亚运金牌与世界冠军。你被全球尊称为电竞战术界最具威望的教父！',
    conditionsSummary: '通关Phase 2赛区冠军或世界冠军 + 研发满级战术分析室',
    isUnlocked: false
  },
  {
    id: 'ending_tycoon_ceo',
    title: '💼 资本巨鳄 · 纳斯达克俱乐部总裁 (Esports Tycoon)',
    category: 'CEO',
    badge: '商业帝国 · 独角兽CEO',
    lore: '你将退役俱乐部打造为全球估值突破10亿美元的商业独角兽，旗下连锁电竞主题酒店、周边外设与潮流服饰风靡五大洲，成功敲钟纳斯达克，书写了从职业少年到商业巨擘的旷世传奇！',
    conditionsSummary: 'Phase 3俱乐部预算储备超过 $2,000,000 + 激活全部高级赞助商',
    isUnlocked: false
  },
  {
    id: 'ending_million_streamer',
    title: '🎙️ 现象级一哥 · 千万级电竞巨星 (Top Broadcaster)',
    category: 'STREAMER',
    badge: '顶流主播 · 峡谷相声大师',
    lore: '你将竞技实力与无敌的直播造梗天赋融为一体，二路解说世界赛直播在线观看人数破千万，成为电竞泛娱乐跨界头号超级网红，商业带货与出场费破圈碾压传统演艺明星！',
    conditionsSummary: '直播粉丝订阅突破 50,000 + 知名度达到 85+',
    isUnlocked: false
  },
  {
    id: 'ending_foreign_legion',
    title: '✈️ 跨赛区征服者 · 大满贯外援传奇 (Grand Slam Legend)',
    category: 'FOREIGN_EXP',
    badge: '大满贯征服者',
    lore: '作为传奇外援远赴LEC欧洲赛区与LCS北美赛区，带领常年垫底弱旅完成不可思议的奇迹黑马夺冠，达成了横跨多个赛区皆能斩获第一的跨文化神话，载入全球电竞史册！',
    conditionsSummary: '完成周目通关 2 次以上 (NG+2)',
    isUnlocked: false
  },
  {
    id: 'ending_hall_of_fame',
    title: '🏛️ 电竞名人堂 · 终身成就伟人 (Hall of Fame Immortal)',
    category: 'LEGEND_IMMORTAL',
    badge: '名人堂 · 终身成就奖',
    lore: '你的名字被全票选入国际奥委会国际电竞名人堂，官方为你量身定制专属传奇名人堂签名皮肤与纪录片，你的电竞传奇将永久流芳百世，激励一代又一代热血少年！',
    conditionsSummary: '累计获得名宿声望点数达到 1,000 点以上',
    isUnlocked: false
  }
];

// 计算根据周目代数的难度倍率
export function getDifficultyMultiplier(generation: number): number {
  if (generation <= 1) return 1.0;
  if (generation === 2) return 1.25;
  if (generation === 3) return 1.55;
  if (generation === 4) return 1.90;
  return 1.90 + (generation - 4) * 0.35;
}

// 计算本次周目轮回结算时获得的名宿声望点数
export function calculatePrestigeYield(
  wonWorlds: boolean,
  wonRegional: boolean,
  reachedChallenger: boolean,
  money: number,
  fame: number,
  activeModifiers: string[],
  generation: number
): { basePoints: number; bonusPoints: number; total: number; breakdown: string[] } {
  let base = 0;
  const breakdown: string[] = [];

  if (wonWorlds) {
    base += 350;
    breakdown.push('🏆 捧起召唤师总冠军奖杯: +350 声望');
  } else if (wonRegional) {
    base += 180;
    breakdown.push('⭐ 斩获职业联赛赛区冠军: +180 声望');
  } else if (reachedChallenger) {
    base += 80;
    breakdown.push('🌟 登顶峡谷之巅最强王者: +80 声望');
  } else {
    base += 30;
    breakdown.push('🎮 基础退役经验结算: +30 声望');
  }

  // 财富结算折算
  const moneyBonus = Math.min(150, Math.floor(money / 20000));
  if (moneyBonus > 0) {
    base += moneyBonus;
    breakdown.push(`💰 生涯资本积累 ($${money.toLocaleString()}): +${moneyBonus} 声望`);
  }

  // 知名度折算
  const fameBonus = Math.floor(fame * 0.8);
  if (fameBonus > 0) {
    base += fameBonus;
    breakdown.push(`🌟 粉丝知名度影响力 (${fame}): +${fameBonus} 声望`);
  }

  // 肉鸽难度词条加成
  let modMultiplier = 0;
  activeModifiers.forEach(mId => {
    const mod = RUN_MODIFIERS_CATALOG.find(m => m.id === mId);
    if (mod) {
      modMultiplier += mod.scoreMultiplier;
    }
  });

  const bonusPoints = Math.round(base * modMultiplier);
  if (bonusPoints > 0) {
    breakdown.push(`⚡ 肉鸽难度词条额外增益 (+${Math.round(modMultiplier * 100)}%): +${bonusPoints} 声望`);
  }

  // 高周目难度加成
  const genBonus = generation > 1 ? Math.round(base * (generation - 1) * 0.15) : 0;
  if (genBonus > 0) {
    breakdown.push(`🔁 第 ${generation} 周目难度加权: +${genBonus} 声望`);
  }

  const total = base + bonusPoints + genBonus;
  return { basePoints: base, bonusPoints: bonusPoints + genBonus, total, breakdown };
}

// 评估本次 Run 能解锁哪个结局
export function evaluateRunEndings(params: {
  wonWorlds: boolean;
  wonRegional: boolean;
  mechanics: number;
  fame: number;
  money: number;
  subscribers: number;
  generation: number;
  lifetimePrestige: number;
}): string[] {
  const eligibleIds: string[] = [];

  // GOAT
  if (params.wonWorlds && params.mechanics >= 80 && params.fame >= 80) {
    eligibleIds.push('ending_goat');
  }

  // COACH
  if ((params.wonRegional || params.wonWorlds) && params.mechanics >= 65) {
    eligibleIds.push('ending_legendary_coach');
  }

  // CEO
  if (params.money >= 1500000 || params.wonWorlds) {
    eligibleIds.push('ending_tycoon_ceo');
  }

  // STREAMER
  if (params.subscribers >= 20000 || params.fame >= 80) {
    eligibleIds.push('ending_million_streamer');
  }

  // FOREIGN EXP
  if (params.generation >= 2 && params.wonWorlds) {
    eligibleIds.push('ending_foreign_legion');
  }

  // HALL OF FAME
  if (params.lifetimePrestige >= 800) {
    eligibleIds.push('ending_hall_of_fame');
  }

  // Fallback to at least coach if won regional
  if (eligibleIds.length === 0 && params.wonRegional) {
    eligibleIds.push('ending_legendary_coach');
  }

  return eligibleIds;
}
