import { WeeklyMetaTrend, MetaChampion, MetaDraftStrategyModifier } from '../types/game';

export interface MetaPatchConfig {
  weekCycle: number;
  patchVersion: string;
  patchTheme: string;
  patchDescription: string;
  metaHighlight: string;
  bpTacticalTip: string;
  champions: MetaChampion[];
  strategyModifiers: MetaDraftStrategyModifier[];
}

export const WEEKLY_META_PATCH_CONFIGS: MetaPatchConfig[] = [
  {
    weekCycle: 1,
    patchVersion: 'Patch 14.12',
    patchTheme: '刺客突脸狂潮 (Assassin & Dive Surge)',
    patchDescription: '穿甲刺客核心装备大降价，点控与锁头英雄伤害上限大幅激增。后排脆皮生存空间逼仄，先手强开锁头成为战局决胜杀招。',
    metaHighlight: '刺客/战士技能急速与穿甲爆发 +18%，防御塔前期保护护甲 -10%',
    bpTacticalTip: 'BP 阶段首抢「阿卡丽/劫/皇子」突进点杀，若无法抢到则务必针对性一抢「霞/烈娜塔」构筑反突进盾牌！',
    champions: [
      { name: '阿卡丽', role: 'MID', tier: 'OP', tierLabel: 'T0 版本的神', winRate: 56.8, pickBanRate: 88.5, keySynergy: '多段突进烟雾弹瞬融双C', draftBuff: '突脸体系胜率 +18%', icon: '🥷', trend: 'UP' },
      { name: '劫', role: 'MID', tier: 'OP', tierLabel: 'T0 版本的神', winRate: 55.4, pickBanRate: 82.1, keySynergy: '影子拉扯影子秒杀', draftBuff: '突脸体系胜率 +15%', icon: '⚔️', trend: 'UP' },
      { name: '皇子', role: 'JUG', tier: 'OP', tierLabel: 'T0 版本的神', winRate: 54.9, pickBanRate: 85.0, keySynergy: 'EQ闪接天崩地裂强行开团', draftBuff: '突脸体系胜率 +14%', icon: '🚩', trend: 'UP' },
      { name: '蜘蛛', role: 'JUG', tier: 'OP', tierLabel: 'T0 版本的神', winRate: 54.1, pickBanRate: 76.5, keySynergy: '前期3级窒息越塔滚雪球', draftBuff: '快攻体系胜率 +12%', icon: '🕷️', trend: 'UP' },
      { name: '泰坦', role: 'SUP', tier: 'STRONG', tierLabel: 'T1 强力核心', winRate: 52.8, pickBanRate: 74.0, keySynergy: '深海巨锚稳定指引集火', draftBuff: '开团胜率 +8%', icon: '⚓', trend: 'STABLE' },
      { name: '霞', role: 'ADC', tier: 'STRONG', tierLabel: 'T1 强力核心', winRate: 52.5, pickBanRate: 69.4, keySynergy: '暴风羽刃绝境无法选中保命', draftBuff: '自保反打 +10%', icon: '🪶', trend: 'UP' },
      { name: '石头人', role: 'TOP', tier: 'BALANCED', tierLabel: 'T2 常规之选', winRate: 49.8, pickBanRate: 42.0, keySynergy: '大招摸奖开团', draftBuff: '常规开团 +3%', icon: '🪨', trend: 'STABLE' },
      { name: '金克丝', role: 'ADC', tier: 'WEAK', tierLabel: 'T3 版本陷阱', winRate: 44.2, pickBanRate: 31.0, keySynergy: '无位移极度容易被突脸秒杀', draftBuff: '易遭针对 -12%', icon: '🚀', trend: 'DOWN' }
    ],
    strategyModifiers: [
      {
        strategyId: 'dive',
        strategyName: '强开突脸体系 (Dive Engage)',
        desc: '依靠打野与辅助无脑先手锁头，刺客与战士多段进场强秒敌方核心输出。',
        baseSuccessRate: 65,
        currentModifier: 16,
        status: 'BUFFED',
        keyChampions: ['阿卡丽', '劫', '皇子', '泰坦'],
        tacticalAdvice: '当前版本绝对 T0 答案！特训沙盘中针对此流派反制可获得额外 +16% 胜率权重加持。'
      },
      {
        strategyId: 'poke',
        strategyName: '长手炮击消耗体系 (Poke & Siege)',
        desc: '超远距离技能压低血线后占领河道视野推塔。',
        baseSuccessRate: 60,
        currentModifier: -10,
        status: 'NERFED',
        keyChampions: ['杰斯', '韦鲁斯', '泽拉斯'],
        tacticalAdvice: '面对满地刺客位移突进，长手脆皮阵容极其容易遭侧翼绕后暴毙，胜率大幅受限。'
      },
      {
        strategyId: 'hyper_carry',
        strategyName: '四保一后期核弹 (Hyper-Carry)',
        desc: '将经济倾斜给后期大核射手，软辅多重护盾贴身保护。',
        baseSuccessRate: 58,
        currentModifier: -8,
        status: 'NERFED',
        keyChampions: ['金克丝', '厄斐琉斯', '璐璐'],
        tacticalAdvice: '前期对线若被抓崩很难拖入大后期，需搭配风女或烈娜塔强化反开。'
      },
      {
        strategyId: 'fast_push',
        strategyName: '前期速推窒息快攻 (Fast-Push Lockdown)',
        desc: '前期下路高压线霸控龙推一塔，在20分钟前终结比赛。',
        baseSuccessRate: 62,
        currentModifier: 8,
        status: 'BUFFED',
        keyChampions: ['德莱文', '卡莉丝塔', '蜘蛛'],
        tacticalAdvice: '借由前期刺客野区入侵，压迫敌方防御塔经济，压制效果显著。'
      }
    ]
  },
  {
    weekCycle: 2,
    patchVersion: 'Patch 14.13',
    patchTheme: '重装铁壁与控场防守 (Vanguard & Counter-Dive)',
    patchDescription: '重装坦克护甲与魔抗神话装备性价比提升，韧性与反开控制技能全面加强。莽撞冲阵队伍在钢铁防线前频频撞壁。',
    metaHighlight: '坦克基础生命值与双抗 +15%，减速与打断技能生效范围提升',
    bpTacticalTip: 'BP 阶段重度倾斜「石头人/波比/烈娜塔/布隆」，利用坚定风采与反手击飞令敌方冲阵瞬间哑火！',
    champions: [
      { name: '石头人', role: 'TOP', tier: 'OP', tierLabel: 'T0 版本的神', winRate: 57.2, pickBanRate: 86.4, keySynergy: '势不可挡毁天灭地团控', draftBuff: '阵地防守 +16%', icon: '🪨', trend: 'UP' },
      { name: '波比', role: 'JUG', tier: 'OP', tierLabel: 'T0 版本的神', winRate: 56.1, pickBanRate: 84.2, keySynergy: '坚定风采拦截所有突进位移', draftBuff: '防冲阵胜率 +18%', icon: '🔨', trend: 'UP' },
      { name: '烈娜塔', role: 'SUP', tier: 'OP', tierLabel: 'T0 版本的神', winRate: 55.6, pickBanRate: 80.5, keySynergy: '恶意收购全图狂暴反打救难', draftBuff: '团战逆转 +15%', icon: '🧪', trend: 'UP' },
      { name: '凯南', role: 'TOP', tier: 'STRONG', tierLabel: 'T1 强力核心', winRate: 53.4, pickBanRate: 72.8, keySynergy: '天雷降临大范围群体眩晕', draftBuff: '团战摧毁 +10%', icon: '⚡', trend: 'UP' },
      { name: '风女', role: 'SUP', tier: 'STRONG', tierLabel: 'T1 强力核心', winRate: 53.1, pickBanRate: 68.0, keySynergy: '复苏季风大招强行推散冲阵', draftBuff: '保护拆火 +11%', icon: '🌪️', trend: 'UP' },
      { name: '霞', role: 'ADC', tier: 'STRONG', tierLabel: 'T1 强力核心', winRate: 52.4, pickBanRate: 71.0, keySynergy: '倒钩拉扯倒地反杀', draftBuff: '反打胜率 +9%', icon: '🪶', trend: 'STABLE' },
      { name: '阿卡丽', role: 'MID', tier: 'BALANCED', tierLabel: 'T2 常规之选', winRate: 48.9, pickBanRate: 55.0, keySynergy: '面对重装坦度难以瞬间秒杀', draftBuff: '爆发受阻 -2%', icon: '🥷', trend: 'DOWN' },
      { name: '劫', role: 'MID', tier: 'WEAK', tierLabel: 'T3 版本陷阱', winRate: 43.8, pickBanRate: 35.0, keySynergy: '极易被金身或重装硬控反手控死', draftBuff: '逆风乏力 -14%', icon: '⚔️', trend: 'DOWN' }
    ],
    strategyModifiers: [
      {
        strategyId: 'dive',
        strategyName: '强开突脸体系 (Dive Engage)',
        desc: '依靠打野与辅助先手锁头进场。',
        baseSuccessRate: 65,
        currentModifier: -12,
        status: 'NERFED',
        keyChampions: ['皇子', '阿卡丽', '劫'],
        tacticalAdvice: '重装坦克统治战场，盲目突脸进场极易遭到反手秒融化，风险极高。'
      },
      {
        strategyId: 'poke',
        strategyName: '长手炮击消耗体系 (Poke & Siege)',
        desc: '超远距离技能压低血线后占领视野推塔。',
        baseSuccessRate: 60,
        currentModifier: 8,
        status: 'BUFFED',
        keyChampions: ['杰斯', '韦鲁斯', '泽拉斯'],
        tacticalAdvice: '重装坦克移速偏慢，长手穿甲消耗能安全放风筝压制敌方阵型。'
      },
      {
        strategyId: 'hyper_carry',
        strategyName: '四保一后期核弹 (Hyper-Carry)',
        desc: '稳住发育将经济倾斜给后期大核。',
        baseSuccessRate: 58,
        currentModifier: 12,
        status: 'BUFFED',
        keyChampions: ['金克丝', '厄斐琉斯', '烈娜塔'],
        tacticalAdvice: '前排铁壁坦克提供海量输出空间，后期大核成型后团战统治力极强！'
      },
      {
        strategyId: 'fast_push',
        strategyName: '前期速推窒息快攻 (Fast-Push Lockdown)',
        desc: '前期下路高压线霸推塔。',
        baseSuccessRate: 62,
        currentModifier: -6,
        status: 'NERFED',
        keyChampions: ['德莱文', '卡莉丝塔'],
        tacticalAdvice: '坦克清线与塔下抗压能力极高，前期不易被越塔打崩。'
      }
    ]
  },
  {
    weekCycle: 3,
    patchVersion: 'Patch 14.14',
    patchTheme: '软辅神圣保排与大后期核弹 (Hyper-Carry Golden Era)',
    patchDescription: '狂野生长、香炉与米利欧神恩获得版本史诗级关照，大后期射手神话攻速装伤害倍增。只要稳稳发育至30分钟，团战输出毁天灭地。',
    metaHighlight: '软辅护盾/治疗强度 +20%，射手暴击伤害阈值提前点亮',
    bpTacticalTip: '锁定「璐璐/米利欧」配合「金克丝/厄斐琉斯」，BP 时严防敌方前期蜘蛛/德莱文窒息越塔抢节奏！',
    champions: [
      { name: '璐璐', role: 'SUP', tier: 'OP', tierLabel: 'T0 版本的神', winRate: 57.5, pickBanRate: 91.0, keySynergy: '变羊致命反制与狂野生长保核', draftBuff: '四保一胜率 +20%', icon: '🧚', trend: 'UP' },
      { name: '金克丝', role: 'ADC', tier: 'OP', tierLabel: 'T0 版本的神', winRate: 56.4, pickBanRate: 87.2, keySynergy: '被动罪恶快感火箭筒团灭收割', draftBuff: '后期团战 +18%', icon: '🚀', trend: 'UP' },
      { name: '风女', role: 'SUP', tier: 'OP', tierLabel: 'T0 版本的神', winRate: 55.3, pickBanRate: 78.0, keySynergy: '护盾加攻击力与大招全体回血', draftBuff: '保排容错 +15%', icon: '🌪️', trend: 'UP' },
      { name: '烈娜塔', role: 'SUP', tier: 'STRONG', tierLabel: 'T1 强力核心', winRate: 53.6, pickBanRate: 72.0, keySynergy: '及时救难防暴毙让ADC无所畏惧', draftBuff: '反打容错 +10%', icon: '🧪', trend: 'STABLE' },
      { name: '伊泽瑞尔', role: 'ADC', tier: 'STRONG', tierLabel: 'T1 强力核心', winRate: 52.8, pickBanRate: 65.4, keySynergy: '魔宗成型后灵活自保与高消耗', draftBuff: '自保稳定 +8%', icon: '🏹', trend: 'UP' },
      { name: '凯南', role: 'TOP', tier: 'BALANCED', tierLabel: 'T2 常规之选', winRate: 49.5, pickBanRate: 48.0, keySynergy: '天雷如果被风女大招吹开则较尴尬', draftBuff: '团战容错 +2%', icon: '⚡', trend: 'DOWN' },
      { name: '德莱文', role: 'ADC', tier: 'WEAK', tierLabel: 'T3 版本陷阱', winRate: 44.8, pickBanRate: 36.5, keySynergy: '一旦前期拿不到击杀赏金中后期被软辅折磨', draftBuff: '容错极低 -10%', icon: '🪓', trend: 'DOWN' },
      { name: '蜘蛛', role: 'JUG', tier: 'WEAK', tierLabel: 'T3 版本陷阱', winRate: 44.1, pickBanRate: 30.0, keySynergy: '后期团战化身超级兵难以建树', draftBuff: '后期疲软 -12%', icon: '🕷️', trend: 'DOWN' }
    ],
    strategyModifiers: [
      {
        strategyId: 'hyper_carry',
        strategyName: '四保一后期核弹 (Hyper-Carry)',
        desc: '将经济倾斜给后期大核射手，软辅多重护盾贴身保护。',
        baseSuccessRate: 58,
        currentModifier: 20,
        status: 'BUFFED',
        keyChampions: ['璐璐', '金克丝', '风女'],
        tacticalAdvice: '当前版本绝对王道体系！拖入大后期胜率高达 80% 以上！'
      },
      {
        strategyId: 'dive',
        strategyName: '强开突脸体系 (Dive Engage)',
        desc: '依靠打野与辅助无脑先手锁头。',
        baseSuccessRate: 65,
        currentModifier: -8,
        status: 'NERFED',
        keyChampions: ['皇子', '阿卡丽'],
        tacticalAdvice: '软辅变羊与大招保排极其克制单兵突脸，突进往往有去无回。'
      },
      {
        strategyId: 'poke',
        strategyName: '长手炮击消耗体系 (Poke & Siege)',
        desc: '超远距离技能压低血线。',
        baseSuccessRate: 60,
        currentModifier: 5,
        status: 'BUFFED',
        keyChampions: ['伊泽瑞尔', '杰斯'],
        tacticalAdvice: '利用远程手长优势可以在敌方软辅护盾冷却间隙打出有效血量压制。'
      },
      {
        strategyId: 'fast_push',
        strategyName: '前期速推窒息快攻 (Fast-Push Lockdown)',
        desc: '前期下路高压线霸推塔。',
        baseSuccessRate: 62,
        currentModifier: -10,
        status: 'NERFED',
        keyChampions: ['德莱文', '蜘蛛'],
        tacticalAdvice: '软辅抗压能力强，一旦越塔被反手控住反杀，局势瞬间崩盘。'
      }
    ]
  },
  {
    weekCycle: 4,
    patchVersion: 'Patch 14.15',
    patchTheme: '超视距穿甲长手炮击 (Artillery & Siege)',
    patchDescription: '幽梦、穿甲弓与远程魔抗削减大幅利好长手英雄。两队在龙坑河道展开超远距离炮台消耗战，正面甚至无需接团便能推平防御塔。',
    metaHighlight: '远程物理/魔法穿甲系数 +16%，防御塔镀层血量防御降低',
    bpTacticalTip: '首抢「杰斯/韦鲁斯/伊泽瑞尔」，利用超远射程封锁大龙坑隘口，逼迫敌方盲目探草！',
    champions: [
      { name: '伊泽瑞尔', role: 'ADC', tier: 'OP', tierLabel: 'T0 版本的神', winRate: 56.9, pickBanRate: 89.0, keySynergy: '秘术射击超远消耗与灵动奥术跃迁', draftBuff: '炮击拉扯 +18%', icon: '🏹', trend: 'UP' },
      { name: '凯南', role: 'TOP', tier: 'OP', tierLabel: 'T0 版本的神', winRate: 55.8, pickBanRate: 81.0, keySynergy: '手长对线压制重装战士，团战毁天灭地', draftBuff: '团战压制 +15%', icon: '⚡', trend: 'UP' },
      { name: '风女', role: 'SUP', tier: 'STRONG', tierLabel: 'T1 强力核心', winRate: 53.9, pickBanRate: 75.0, keySynergy: '减速敌人配合ADC超远距离追击消耗', draftBuff: '拉扯消耗 +10%', icon: '🌪️', trend: 'UP' },
      { name: '霞', role: 'ADC', tier: 'STRONG', tierLabel: 'T1 强力核心', winRate: 52.6, pickBanRate: 67.5, keySynergy: '羽毛阵地消耗与防强开', draftBuff: '防守反击 +9%', icon: '🪶', trend: 'STABLE' },
      { name: '波比', role: 'JUG', tier: 'STRONG', tierLabel: 'T1 强力核心', winRate: 52.3, pickBanRate: 64.0, keySynergy: '大招将靠近的敌人锤飞，护航后排炮台', draftBuff: '护航拆火 +8%', icon: '🔨', trend: 'STABLE' },
      { name: '泰坦', role: 'SUP', tier: 'BALANCED', tierLabel: 'T2 常规之选', winRate: 48.6, pickBanRate: 50.0, keySynergy: '手短摸不到长手容易被活活拉扯致死', draftBuff: '移速受阻 -3%', icon: '⚓', trend: 'DOWN' },
      { name: '石头人', role: 'TOP', tier: 'BALANCED', tierLabel: 'T2 常规之选', winRate: 48.0, pickBanRate: 45.0, keySynergy: '空大后被长手风筝至死', draftBuff: '空大风险 -4%', icon: '🪨', trend: 'DOWN' },
      { name: '金克丝', role: 'ADC', tier: 'WEAK', tierLabel: 'T3 版本陷阱', winRate: 45.0, pickBanRate: 38.0, keySynergy: '在炮击面前无法安全吃兵线', draftBuff: '对线受挫 -9%', icon: '🚀', trend: 'DOWN' }
    ],
    strategyModifiers: [
      {
        strategyId: 'poke',
        strategyName: '长手炮击消耗体系 (Poke & Siege)',
        desc: '超远距离技能压低血线后占领视野推塔。',
        baseSuccessRate: 60,
        currentModifier: 18,
        status: 'BUFFED',
        keyChampions: ['伊泽瑞尔', '凯南', '风女'],
        tacticalAdvice: '当前版本最强利刃！在龙坑外围将敌人血量压低至半血以下再收割。'
      },
      {
        strategyId: 'dive',
        strategyName: '强开突脸体系 (Dive Engage)',
        desc: '依靠打野与辅助无脑先手锁头。',
        baseSuccessRate: 65,
        currentModifier: 8,
        status: 'BUFFED',
        keyChampions: ['皇子', '阿卡丽', '石头人'],
        tacticalAdvice: '强开是克制长手炮击的最佳正解，选出强开阵容可以大幅削弱炮台优势。'
      },
      {
        strategyId: 'hyper_carry',
        strategyName: '四保一后期核弹 (Hyper-Carry)',
        desc: '稳住发育将经济倾斜给后期大核。',
        baseSuccessRate: 58,
        currentModifier: -10,
        status: 'NERFED',
        keyChampions: ['金克丝', '璐璐'],
        tacticalAdvice: '在长手炮击持续地毯轰炸下，四保一阵容根本无法靠近防御塔。'
      },
      {
        strategyId: 'fast_push',
        strategyName: '前期速推窒息快攻 (Fast-Push Lockdown)',
        desc: '前期下路高压线霸推塔。',
        baseSuccessRate: 62,
        currentModifier: 4,
        status: 'BUFFED',
        keyChampions: ['德莱文', '卡莉丝塔'],
        tacticalAdvice: '借由前期长手穿甲优势可以更迅速拆下一血塔。'
      }
    ]
  }
];

/**
 * Get current weekly meta trend dynamically based on competitive day.
 * Rotates every 7 competitive days!
 */
export function getWeeklyMetaTrend(gameDay: number = 1, cycleOffset: number = 0): WeeklyMetaTrend {
  const safeDay = Math.max(1, gameDay);
  // 7 competitive days per cycle
  const naturalCycleIndex = Math.floor((safeDay - 1) / 7);
  const totalCycle = (naturalCycleIndex + cycleOffset) % WEEKLY_META_PATCH_CONFIGS.length;
  const cycleDay = ((safeDay - 1) % 7) + 1;
  const daysRemaining = 7 - cycleDay;

  const currentConfig = WEEKLY_META_PATCH_CONFIGS[totalCycle >= 0 ? totalCycle : 0];

  return {
    weekCycle: currentConfig.weekCycle,
    patchVersion: currentConfig.patchVersion,
    patchTheme: currentConfig.patchTheme,
    patchDescription: currentConfig.patchDescription,
    cycleDay,
    daysRemaining,
    champions: currentConfig.champions,
    strategyModifiers: currentConfig.strategyModifiers,
    metaHighlight: currentConfig.metaHighlight,
    bpTacticalTip: currentConfig.bpTacticalTip
  };
}

/**
 * Helper to check a champion's meta status in the active weekly trend
 */
export function getChampionMetaTier(champName: string, meta: WeeklyMetaTrend): MetaChampion | undefined {
  return meta.champions.find(c => champName.includes(c.name) || c.name.includes(champName));
}

/**
 * Calculates extra tactical drill advantage modifier based on active weekly meta
 */
export function calculateMetaDraftAdvantage(
  puzzleId: string,
  meta: WeeklyMetaTrend
): { bonusWinRate: number; advice: string; matchedStrategy: MetaDraftStrategyModifier | undefined } {
  let strategyKey = 'dive';
  if (puzzleId.includes('dive')) {
    strategyKey = 'dive';
  } else if (puzzleId.includes('poke')) {
    strategyKey = 'poke';
  } else if (puzzleId.includes('hyper') || puzzleId.includes('carry')) {
    strategyKey = 'hyper_carry';
  } else if (puzzleId.includes('push') || puzzleId.includes('lockdown')) {
    strategyKey = 'fast_push';
  }

  const strat = meta.strategyModifiers.find(s => s.strategyId === strategyKey);
  const bonus = strat ? strat.currentModifier : 0;

  return {
    bonusWinRate: bonus,
    advice: strat ? strat.tacticalAdvice : '顺应版本潮流，方能百战不殆。',
    matchedStrategy: strat
  };
}
