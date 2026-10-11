import { EsportsCalendarState, EsportsEventModifier, PatchMetaInfo, SplitType } from '../types/game';

export const DEFAULT_ESPORTS_CALENDAR_STATE: EsportsCalendarState = {
  seasonYear: 2026,
  currentSplit: 'SPRING_SPLIT',
  currentWeek: 1,
  currentDay: 1,
  splitMatchesPlayed: 0,
  splitWins: 0,
  splitLosses: 0,
  msiQualified: false,
  msiCleared: false,
  worldsQualified: false,
  worldsCleared: false,
  activeEventIds: ['event_spring_frenzy'],
  currentPatchVersion: '14.19',
  calendarHistoryLog: ['2026 赛季职业赛历正式开幕，春季常规赛火热打响！']
};

export interface SplitInfo {
  id: SplitType;
  name: string;
  nameEn: string;
  startWeek: number;
  endWeek: number;
  icon: string;
  banner: string;
  description: string;
  qualificationTarget: string;
}

export const SPLIT_DEFINITIONS: Record<SplitType, SplitInfo> = {
  SPRING_SPLIT: {
    id: 'SPRING_SPLIT',
    name: '春季常规赛',
    nameEn: 'Spring Split',
    startWeek: 1,
    endWeek: 8,
    icon: '🌱',
    banner: '职业联赛春季赛 · 天梯群雄逐鹿',
    description: '各大俱乐部青训与主力争锋，争夺春季季后赛席位与 MSI 季中冠军赛门票。',
    qualificationTarget: '春季赛胜率 ≥ 55% (至少6场) 或天梯达到 450 LP 获得 MSI 邀请函'
  },
  MSI: {
    id: 'MSI',
    name: '季中冠军赛',
    nameEn: 'Mid-Season Invitational',
    startWeek: 9,
    endWeek: 11,
    icon: '🏆',
    banner: 'MSI 国际对抗 · 跨赛区荣誉死斗',
    description: '四大赛区春季冠军会师国际舞台！节奏极其紧凑，失误容错率极低。',
    qualificationTarget: '世界级外战较量，胜场大幅提升声望与世界赛保底积分'
  },
  SUMMER_SPLIT: {
    id: 'SUMMER_SPLIT',
    name: '夏季常规赛',
    nameEn: 'Summer Split',
    startWeek: 12,
    endWeek: 19,
    icon: '🔥',
    banner: '夏季抢分大战 · 争夺全球总决赛种子席位',
    description: '通往全球总决赛的最关键战役！胜负直接决定世界赛一号种子资格。',
    qualificationTarget: '夏季赛胜率 ≥ 58% (至少12场) 或天梯达到 750 LP 晋级 Worlds'
  },
  WORLDS: {
    id: 'WORLDS',
    name: '全球总决赛',
    nameEn: 'Worlds Championship',
    startWeek: 20,
    endWeek: 24,
    icon: '👑',
    banner: '全球总决赛 · 登神长阶终极巅峰',
    description: '电竞赛事最高殿堂！瑞士轮与淘汰赛死战，胜者捧起召唤师之杯。',
    qualificationTarget: '世界赛BO5决战，夺冠解锁【传奇世界冠军】专属不朽成就与海量声望'
  },
  OFF_SEASON: {
    id: 'OFF_SEASON',
    name: '冬季转会期 & 全明星',
    nameEn: 'Off-Season & All-Star',
    startWeek: 25,
    endWeek: 26,
    icon: '❄️',
    banner: '冬季休赛整顿 · 转会洗牌与理疗康复',
    description: '高强度征战暂告段落。选手度假、理疗休整、战队重组与全明星表演赛。',
    qualificationTarget: '休整康复效率翻倍，积累战备资源备战下一年度全新职业赛季'
  }
};

export const PATCH_META_CATALOG: PatchMetaInfo[] = [
  {
    version: '14.19',
    headline: '破败重装崛起 · 上中野肉搏时代',
    description: '战士与重装突进英雄获得大量攻击力与韧性加成，刺客与强开坦克横行野区，法师生存空间受到挤压。',
    tierSPlusChamps: ['李青 (盲僧)', '亚托克斯 (剑魔)', '诺提勒斯 (深海泰坦)'],
    tierSChamps: ['贾克斯 (武器大师)', '塞拉斯 (解脱者)', '奎桑提 (叹息之墙)', '佛耶戈 (破败之王)'],
    nerfedChamps: ['奥莉安娜 (发条魔灵)', '璐璐 (仙灵女巫)', '伊泽瑞尔 (探险家)'],
    mechanicsBonus: 6
  },
  {
    version: '14.21',
    headline: '下路双核终局 · 射手与硬控开团时代',
    description: '暴击装价格下调，硬控坦克开团价值暴涨，下路对线定乾坤，后期团战大核主宰比赛。',
    tierSPlusChamps: ['金克丝 (暴走萝莉)', '卡莎 (虚空之女)', '诺提勒斯 (深海泰坦)'],
    tierSChamps: ['锤石 (魂锁典狱长)', '洛 (幻翎)', '嘉文四世 (德玛西亚皇子)', '卡莉丝塔 (复仇之矛)'],
    nerfedChamps: ['璐璐 (仙灵女巫)', '烈娜塔 (炼金男爵)', '韦鲁斯 (惩戒之箭)'],
    mechanicsBonus: 5
  },
  {
    version: '14.23',
    headline: '全球总决赛决战版本 · 奇迹团战与控制链',
    description: '世界赛专属平衡，高容错团战控制法师与极限进场刺客主宰胜负大盘，中野节奏决定世界赛命运。',
    tierSPlusChamps: ['阿兹尔 (沙漠皇帝)', '李青 (盲僧)', '卡莎 (虚空之女)'],
    tierSChamps: ['塞拉斯 (解脱者)', '亚托克斯 (剑魔)', '阿狸 (九尾妖狐)', '洛 (幻翎)'],
    nerfedChamps: ['伊泽瑞尔 (探险家)', '韦鲁斯 (惩戒之箭)', '瑟庄妮 (凛冬之怒)'],
    mechanicsBonus: 7
  },
  {
    version: '14.25',
    headline: '休赛全明星狂欢 · 混沌娱乐百花齐放',
    description: '冬季休赛娱乐版本，所有冷门英雄均获得自适应攻击力，天梯套路百花齐放，连杀奖励爆发。',
    tierSPlusChamps: ['永恩 (封魔剑魂)', '李青 (盲僧)', '卡莉丝塔 (复仇之矛)'],
    tierSChamps: ['兰博 (机械公敌)', '佛耶戈 (破败之王)', '锤石 (魂锁典狱长)', '纳尔 (迷失之牙)'],
    nerfedChamps: [],
    mechanicsBonus: 4
  }
];

export const GLOBAL_EVENT_MODIFIERS: EsportsEventModifier[] = [
  {
    id: 'event_spring_frenzy',
    name: '开年冲分狂热 (Spring Kickoff)',
    category: 'COMMUNITY_HYPE',
    icon: '⚡',
    description: '赛季初全员排位冲分热潮，胜场 LP 结算收益显著增加！',
    startWeek: 1,
    endWeek: 4,
    lpGainMultiplier: 1.30,
    strainMultiplier: 1.0,
    focusDrainMultiplier: 1.05,
    buffedArchetypes: ['Dive/Assassin', 'Splitpusher'],
    nerfedArchetypes: ['Control Mage'],
    flavorNarrative: '直播间弹幕刷屏，各路青训选手与路人绝活哥疯狂撞车争夺开年第一批天梯前十席位。'
  },
  {
    id: 'event_meta_adaptation',
    name: '14.19 版本剧震 (Patch Meta Shift)',
    category: 'META_PATCH',
    icon: '⚔️',
    description: '新补丁实装导致传统法系弱化，刺客突进与重装战士统治野区。',
    startWeek: 3,
    endWeek: 7,
    lpGainMultiplier: 1.15,
    strainMultiplier: 1.10,
    focusDrainMultiplier: 1.10,
    buffedArchetypes: ['Dive/Assassin', 'Engage Tank'],
    nerfedArchetypes: ['Control Mage', 'Enchanter'],
    flavorNarrative: '各大教练组紧急开会，排位天梯沦为战士刺客肉搏绞肉机，选错英雄胜率骤降。'
  },
  {
    id: 'event_msi_pressure',
    name: 'MSI 国际高压封锁 (MSI Lockdown)',
    category: 'TOURNAMENT',
    icon: '🏆',
    description: '跨赛区世界对抗引发高强度舆论关注，手腕负荷与专注消耗剧烈攀升。',
    startWeek: 9,
    endWeek: 11,
    lpGainMultiplier: 1.25,
    strainMultiplier: 1.35,
    focusDrainMultiplier: 1.25,
    buffedArchetypes: ['Hypercarry', 'Engage Tank'],
    nerfedArchetypes: ['Poke'],
    flavorNarrative: '聚光灯齐聚季中冠军赛，稍有失误就会被铺天盖地剪辑热搜，抗压神经高度紧绷。'
  },
  {
    id: 'event_summer_sprint',
    name: '夏季赛生死抢分周 (Summer Super Week)',
    category: 'COMMUNITY_HYPE',
    icon: '🔥',
    description: '世界赛名额最终冲刺，胜场积分与排位热度达到全年次高峰。',
    startWeek: 15,
    endWeek: 18,
    lpGainMultiplier: 1.40,
    strainMultiplier: 1.15,
    focusDrainMultiplier: 1.10,
    buffedArchetypes: ['Control Mage', 'Hypercarry'],
    nerfedArchetypes: ['Enchanter'],
    flavorNarrative: '管理层在基地设立倒计时警示板，所有选手日夜兼程加练，每一分都决定命运。'
  },
  {
    id: 'event_worlds_climax',
    name: '全球总决赛终极极境 (Worlds Pinnacle)',
    category: 'TOURNAMENT',
    icon: '👑',
    description: '召唤师之杯近在咫尺！天梯与赛场胜场 LP +50%，体能与手腕负荷逼近临界点。',
    startWeek: 20,
    endWeek: 24,
    lpGainMultiplier: 1.50,
    strainMultiplier: 1.40,
    focusDrainMultiplier: 1.30,
    buffedArchetypes: ['Control Mage', 'Dive/Assassin'],
    nerfedArchetypes: ['Poke'],
    flavorNarrative: '万里挑一的世界赛主舞台，现场十万观众欢呼雷动，胜者成神，败者退场！'
  },
  {
    id: 'event_winter_respite',
    name: '冬季温情休整季 (Winter Respite)',
    category: 'FATIGUE_CRISIS',
    icon: '❄️',
    description: '赛季收官转会期，竞争降温，体能疲劳与 RSI 手腕劳损恢复效率大幅度增加。',
    startWeek: 25,
    endWeek: 26,
    lpGainMultiplier: 0.85,
    strainMultiplier: 0.60,
    focusDrainMultiplier: 0.70,
    buffedArchetypes: [],
    nerfedArchetypes: [],
    flavorNarrative: '俱乐部基地开启暖气与度假模式，选手与主播进入狂欢娱乐排位，身心得到全面修复。'
  }
];

// 计算当前周所处阶段
export function getSplitForWeek(week: number): SplitInfo {
  if (week >= 1 && week <= 8) return SPLIT_DEFINITIONS.SPRING_SPLIT;
  if (week >= 9 && week <= 11) return SPLIT_DEFINITIONS.MSI;
  if (week >= 12 && week <= 19) return SPLIT_DEFINITIONS.SUMMER_SPLIT;
  if (week >= 20 && week <= 24) return SPLIT_DEFINITIONS.WORLDS;
  return SPLIT_DEFINITIONS.OFF_SEASON;
}

// 计算当前周版本补丁
export function getPatchForWeek(week: number): PatchMetaInfo {
  if (week <= 6) return PATCH_META_CATALOG[0];
  if (week <= 13) return PATCH_META_CATALOG[1];
  if (week <= 24) return PATCH_META_CATALOG[2];
  return PATCH_META_CATALOG[3];
}

// 获取当前周激活的环境事件
export function getActiveModifiersForWeek(week: number): EsportsEventModifier[] {
  return GLOBAL_EVENT_MODIFIERS.filter(m => week >= m.startWeek && week <= m.endWeek);
}

// 计算复合增益乘数
export function calculateCompoundModifiers(week: number): {
  lpMult: number;
  strainMult: number;
  focusDrainMult: number;
  activeModifiers: EsportsEventModifier[];
} {
  const active = getActiveModifiersForWeek(week);
  let lpMult = 1.0;
  let strainMult = 1.0;
  let focusDrainMult = 1.0;

  for (const mod of active) {
    lpMult *= mod.lpGainMultiplier;
    strainMult *= mod.strainMultiplier;
    focusDrainMult *= mod.focusDrainMultiplier;
  }

  return {
    lpMult,
    strainMult,
    focusDrainMult,
    activeModifiers: active
  };
}

// 英雄名称多模式模糊匹配
function isMatchChampionName(catalogName: string, queryName: string): boolean {
  if (!catalogName || !queryName) return false;
  if (catalogName === queryName) return true;
  if (catalogName.includes(queryName) || queryName.includes(catalogName)) return true;

  const tokens1 = catalogName.replace(/[()（）]/g, ' ').split(/\s+/).filter(Boolean);
  const tokens2 = queryName.replace(/[()（）]/g, ' ').split(/\s+/).filter(Boolean);
  for (const t1 of tokens1) {
    if (t1.length >= 2 && tokens2.some(t2 => t2.includes(t1) || t1.includes(t2))) {
      return true;
    }
  }
  return false;
}

// 计算选手专精英雄在当前版本所获的 Meta 加成及 LP 临时提振
export function evaluateChampionMeta(champName: string, archetype?: string, week = 1): {
  tier: 'S+' | 'S' | 'A' | 'B';
  mechanicsBonus: number;
  isBuffed: boolean;
  isNerfed: boolean;
  badgeLabel: string;
  lpBoostPct: number;
} {
  const patch = getPatchForWeek(week);

  if (patch.tierSPlusChamps.some(c => isMatchChampionName(c, champName))) {
    return {
      tier: 'S+',
      mechanicsBonus: patch.mechanicsBonus + 2,
      isBuffed: true,
      isNerfed: false,
      badgeLabel: '🔥 版本T0破荒强核 (+20% LP)',
      lpBoostPct: 20
    };
  }

  if (patch.tierSChamps.some(c => isMatchChampionName(c, champName))) {
    return {
      tier: 'S',
      mechanicsBonus: patch.mechanicsBonus,
      isBuffed: true,
      isNerfed: false,
      badgeLabel: '✨ 版本强势T1核心 (+15% LP)',
      lpBoostPct: 15
    };
  }

  if (patch.nerfedChamps.some(c => isMatchChampionName(c, champName))) {
    return {
      tier: 'B',
      mechanicsBonus: -4,
      isBuffed: false,
      isNerfed: true,
      badgeLabel: '⚠️ 遭到削弱T3边缘 (-4微操)',
      lpBoostPct: -5
    };
  }

  return {
    tier: 'A',
    mechanicsBonus: 0,
    isBuffed: false,
    isNerfed: false,
    badgeLabel: '⚖️ 版本平稳T2适选',
    lpBoostPct: 0
  };
}

// 检查英雄是否属于当前版本的 S/S+ 梯队
export function isChampionSTier(champName: string, week = 1): boolean {
  const meta = evaluateChampionMeta(champName, undefined, week);
  return meta.tier === 'S+' || meta.tier === 'S';
}

// 计算整套阵容中 S 级英雄数量及激活的临时 LP 增益加成
export function calculateDraftMetaLpBoost(picks: (string | null | undefined)[], week = 1): {
  sTierCount: number;
  totalLpBoostPct: number;
  bonusLpBase: number;
  sTierNames: string[];
} {
  let sTierCount = 0;
  let totalLpBoostPct = 0;
  const sTierNames: string[] = [];

  for (const name of picks) {
    if (!name) continue;
    const meta = evaluateChampionMeta(name, undefined, week);
    if (meta.tier === 'S+' || meta.tier === 'S') {
      sTierCount += 1;
      totalLpBoostPct += meta.lpBoostPct;
      sTierNames.push(name.split(/[,(（]/)[0].trim());
    }
  }

  // 每位 S 级英雄提供 +25 LP 额外基础奖励，最高加成 60%
  const bonusLpBase = sTierCount * 25;
  const cappedLpBoostPct = Math.min(60, totalLpBoostPct);

  return {
    sTierCount,
    totalLpBoostPct: cappedLpBoostPct,
    bonusLpBase,
    sTierNames
  };
}

// 检查并更新国际赛事资格状态
export function checkTournamentQualifications(
  calendar: EsportsCalendarState,
  playerLp: number
): {
  msiNewlyUnlocked: boolean;
  worldsNewlyUnlocked: boolean;
  logs: string[];
} {
  const logs: string[] = [];
  let msiNewlyUnlocked = false;
  let worldsNewlyUnlocked = false;

  const winRate = calendar.splitMatchesPlayed > 0
    ? (calendar.splitWins / calendar.splitMatchesPlayed)
    : 0;

  // MSI 资格审查 (第8周及以后触发)
  if (calendar.currentWeek >= 8 && !calendar.msiQualified) {
    if ((calendar.splitMatchesPlayed >= 6 && winRate >= 0.55) || playerLp >= 450) {
      msiNewlyUnlocked = true;
      calendar.msiQualified = true;
      logs.push('【国际资格通报】春季常规赛积分与胜率达标！荣获 2026 MSI 季中冠军赛正赛席位！');
    }
  }

  // Worlds 资格审查 (第19周及以后触发)
  if (calendar.currentWeek >= 19 && !calendar.worldsQualified) {
    if ((calendar.splitMatchesPlayed >= 10 && winRate >= 0.58) || playerLp >= 750) {
      worldsNewlyUnlocked = true;
      calendar.worldsQualified = true;
      logs.push('【世界赛资格通报】夏季赛积分领跑全赛区！锁定代表出征全球总决赛 (Worlds) 头号种子门票！');
    }
  }

  return {
    msiNewlyUnlocked,
    worldsNewlyUnlocked,
    logs
  };
}

// 统一推进赛历时间
export function advanceEsportsCalendar(
  current: EsportsCalendarState,
  daysPassed: number,
  playerLp: number
): {
  nextState: EsportsCalendarState;
  splitChanged: boolean;
  newSplitName: string;
  patchChanged: boolean;
  newPatchVersion: string;
  logs: string[];
} {
  const logs: string[] = [];
  const nextDay = current.currentDay + daysPassed;
  let nextWeek = Math.floor((nextDay - 1) / 7) + 1;
  let nextYear = current.seasonYear;

  let splitMatches = current.splitMatchesPlayed;
  let splitWins = current.splitWins;
  let splitLosses = current.splitLosses;

  // 26周赛季周期循环
  if (nextWeek > 26) {
    nextYear += 1;
    nextWeek = 1;
    splitMatches = 0;
    splitWins = 0;
    splitLosses = 0;
    logs.push(`【新赛季开启】欢迎步入 ${nextYear} 年度职业电竞赛年！各大赛区战火重燃！`);
  }

  const oldSplit = current.currentSplit;
  const newSplitInfo = getSplitForWeek(nextWeek);
  const splitChanged = oldSplit !== newSplitInfo.id;

  if (splitChanged) {
    logs.push(`【赛历更替】正式跨入全新赛段：${newSplitInfo.name} (${newSplitInfo.nameEn})！`);
    splitMatches = 0;
    splitWins = 0;
    splitLosses = 0;
  }

  const oldPatch = current.currentPatchVersion;
  const newPatchInfo = getPatchForWeek(nextWeek);
  const patchChanged = oldPatch !== newPatchInfo.version;

  if (patchChanged) {
    logs.push(`【官方补丁发布】Patch ${newPatchInfo.version} 实装上线：《${newPatchInfo.headline}》！`);
  }

  const activeMods = getActiveModifiersForWeek(nextWeek).map(m => m.id);

  const nextState: EsportsCalendarState = {
    ...current,
    seasonYear: nextYear,
    currentWeek: nextWeek,
    currentDay: (nextDay > 182 ? nextDay % 182 : nextDay),
    currentSplit: newSplitInfo.id,
    currentPatchVersion: newPatchInfo.version,
    splitMatchesPlayed: splitMatches,
    splitWins: splitWins,
    splitLosses: splitLosses,
    activeEventIds: activeMods,
    calendarHistoryLog: [
      ...logs,
      ...current.calendarHistoryLog
    ].slice(0, 30)
  };

  // 检查资格
  const qualResult = checkTournamentQualifications(nextState, playerLp);
  if (qualResult.logs.length > 0) {
    nextState.calendarHistoryLog = [
      ...qualResult.logs,
      ...nextState.calendarHistoryLog
    ].slice(0, 30);
  }

  return {
    nextState,
    splitChanged,
    newSplitName: newSplitInfo.name,
    patchChanged,
    newPatchVersion: newPatchInfo.version,
    logs: [...logs, ...qualResult.logs]
  };
}
