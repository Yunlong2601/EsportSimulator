import { ExpansionDraftState, SoloQueueProdigy, ProPlayer } from '../types/game';

export const EXPANSION_FRANCHISE_NAMES = [
  '极光新纪元 (Aurora Gaming)',
  '深空泰坦重工 (Titan Heavy Gaming)',
  '幽蓝星际战队 (Nebula Esports)',
  '赤焰破晓 (Blaze Vanguard)',
  '幻影银河 (Phantom Galaxy)',
  '神话黎明 (Mythic Dawn)'
];

export const INITIAL_PRODIGIES_POOL: SoloQueueProdigy[] = [
  {
    id: 'prodigy-mid-1',
    name: '顾清锋',
    alias: '峡谷第一刺客 · 绝影',
    role: 'MID',
    age: 17,
    country: '中国',
    avatar: '🗡️',
    mechanics: 96,
    macro: 86,
    morale: 95,
    potential: 'SSS',
    potentialRating: 99,
    playstyle: 'Aggressive',
    signatureChampion: '影流之主 (劫)',
    signatureChampionRole: '无情刺客 · 单杀破局',
    specialTrait: {
      name: '初生牛犊不畏虎',
      description: '天梯成名战曾一人单杀三位职业中单，打法凶狠孤傲，压迫感窒息。',
      buffLabel: '生死战极限操作 +18% · 首发登场狂热度 +20%'
    },
    contractSalary: 11000,
    signingBonus: 35000,
    scoutingIntel: '“如果给他拿到刺客英雄，比赛在15分钟就会彻底失去悬念。微操神经反射处于人类生理巅峰。”',
    soloQueueRank: '国服峡谷之巅第 1 名 (1,820 LP)',
    draftUrgency: 'EXCLUSIVE'
  },
  {
    id: 'prodigy-jug-1',
    name: '朴俊熙 (Lucid)',
    alias: '韩服1700分路人王',
    role: 'JUG',
    age: 18,
    country: '韩国',
    avatar: '⚡',
    mechanics: 93,
    macro: 94,
    morale: 92,
    potential: 'SSS',
    potentialRating: 98,
    playstyle: 'Macro-Oriented',
    signatureChampion: '盲僧 / 破败之王',
    signatureChampionRole: '野区军师 · 控图反蹲',
    specialTrait: {
      name: '神算野区掌控',
      description: '对敌方打野每一步刷野路线如数家珍，控龙率高达 88%。',
      buffLabel: '全图大局观连携 +15% · 史诗野怪争夺胜率 +25%'
    },
    contractSalary: 12500,
    signingBonus: 40000,
    scoutingIntel: '“他在韩服天梯单排如同开了全图透视，永远在对手最意想不到的草丛反蹲现身。”',
    soloQueueRank: '韩服王者第 2 名 (1,745 LP)',
    draftUrgency: 'EXCLUSIVE'
  },
  {
    id: 'prodigy-adc-1',
    name: '林星辞 (ViperX)',
    alias: '16岁峡谷暴走狂花',
    role: 'ADC',
    age: 16,
    country: '中国',
    avatar: '🎯',
    mechanics: 97,
    macro: 84,
    morale: 98,
    potential: 'SSS',
    potentialRating: 99,
    playstyle: 'Clutch',
    signatureChampion: '暗夜猎手 (薇恩) / 德莱文',
    signatureChampionRole: '绝境收割 · 狂暴输出',
    specialTrait: {
      name: '绝境大心脏收割',
      description: '团战仅剩一丝血时从不后退，以不可思议的走位反向操作完成五杀。',
      buffLabel: '逆风决战残局翻盘胜率 +22% · 团战暴击伤害 +15%'
    },
    contractSalary: 10500,
    signingBonus: 32000,
    scoutingIntel: '“他的操作毫无多余动作，把ADC玩成了突进刺客，观众看他的第一视角甚至会眩晕。”',
    soloQueueRank: '国服峡谷之巅第 3 名 (1,690 LP)',
    draftUrgency: 'HIGH'
  },
  {
    id: 'prodigy-top-1',
    name: '钟天岳 (Aegis)',
    alias: '铁壁战神 · 剑魔绝活',
    role: 'TOP',
    age: 18,
    country: '中国',
    avatar: '🛡️',
    mechanics: 92,
    macro: 89,
    morale: 94,
    potential: 'SS',
    potentialRating: 96,
    playstyle: 'Defensive',
    signatureChampion: '暗裔剑魔 / 武器大师',
    signatureChampionRole: '单带天神 · 铁壁抗压',
    specialTrait: {
      name: '不动如山抗压王',
      description: '即便遭到敌方三人包夹越塔也能冷静换掉一人并稳固防御塔血量。',
      buffLabel: '边路防抓生还率 +28% · 团战前排坦度 +20%'
    },
    contractSalary: 9500,
    signingBonus: 28000,
    scoutingIntel: '“真正的上路孤勇者。给他一把长剑，他能在两条兵线之间单刷敌方整个上半区。”',
    soloQueueRank: '韩服王者第 8 名 (1,420 LP)',
    draftUrgency: 'HIGH'
  },
  {
    id: 'prodigy-sup-1',
    name: '白羽舟 (MingKey)',
    alias: '全息预判指挥大师',
    role: 'SUP',
    age: 17,
    country: '中国',
    avatar: '👁️',
    mechanics: 90,
    macro: 95,
    morale: 96,
    potential: 'SSS',
    potentialRating: 98,
    playstyle: 'Macro-Oriented',
    signatureChampion: '魂锁典狱长 (锤石) / 派克',
    signatureChampionRole: '神级开团 · 全局战术大脑',
    specialTrait: {
      name: '鬼魅神钩战术指挥',
      description: '游走时机精准到秒，团战第一时间的闪现钩必中敌方C位关键角色。',
      buffLabel: '团队开团配合度 +25% · 全员默契凝聚度 +12%'
    },
    contractSalary: 9800,
    signingBonus: 30000,
    scoutingIntel: '“极度罕见的 17 岁天才指挥位！不仅拥有顶级辅助手速，更具备老将般的全局冷静。”',
    soloQueueRank: '韩服王者第 6 名 (1,510 LP)',
    draftUrgency: 'EXCLUSIVE'
  },
  {
    id: 'prodigy-mid-2',
    name: '洛子安 (Aether)',
    alias: '千场90%胜率发条魔灵',
    role: 'MID',
    age: 18,
    country: '中国',
    avatar: '🔮',
    mechanics: 94,
    macro: 91,
    morale: 91,
    potential: 'SS',
    potentialRating: 97,
    playstyle: 'Clutch',
    signatureChampion: '发条魔灵 / 机械先驱',
    signatureChampionRole: '毁灭法核 · 阵地战中枢',
    specialTrait: {
      name: '毁天灭地冲击波',
      description: '大后期阵地战团战魔灵魔球从不落空，总能拉中敌方多核一锤定音。',
      buffLabel: '大后期团战胜率 +20% · 龙坑防守拉扯 +15%'
    },
    contractSalary: 10200,
    signingBonus: 33000,
    scoutingIntel: '“基本功扎实到变态的法核机器，补刀永远压制时间线，后期的稳定性堪称战队保险丝。”',
    soloQueueRank: '国服峡谷之巅第 5 名 (1,580 LP)',
    draftUrgency: 'HIGH'
  }
];

export const DEFAULT_EXPANSION_DRAFT_STATE: ExpansionDraftState = {
  currentYear: 2026,
  lastDraftedYear: undefined,
  expansionFranchiseName: '极光新纪元 (Aurora Gaming)',
  isDraftAvailable: true,
  history: []
};

// Generate an annual dynamic pool of solo queue prodigies with variations
export function generateAnnualProdigyPool(seasonYear: number): SoloQueueProdigy[] {
  const yearOffset = (seasonYear - 2026);
  return INITIAL_PRODIGIES_POOL.map((base, idx) => {
    const mechMod = ((idx * 3 + yearOffset) % 4) - 1; // -1 to +2
    const macMod = ((idx * 2 + yearOffset) % 3) - 1;
    const bonusMod = ((idx * 1500) % 5000);
    return {
      ...base,
      id: `${base.id}-y${seasonYear}`,
      mechanics: Math.min(99, Math.max(88, base.mechanics + mechMod)),
      macro: Math.min(99, Math.max(82, base.macro + macMod)),
      signingBonus: base.signingBonus + bonusMod,
      contractSalary: base.contractSalary + (yearOffset * 500)
    };
  });
}

// Convert drafted SoloQueueProdigy to ProPlayer to join Dynasty roster
export function convertProdigyToProPlayer(prodigy: SoloQueueProdigy): ProPlayer {
  return {
    id: `player-drafted-${prodigy.id}-${Date.now()}`,
    name: `${prodigy.name} [${prodigy.alias.split('·')[1]?.trim() || '新秀'}]`,
    role: prodigy.role,
    country: prodigy.country,
    age: prodigy.age,
    mechanics: prodigy.mechanics,
    macro: prodigy.macro,
    morale: prodigy.morale,
    salary: prodigy.contractSalary,
    marketValue: prodigy.signingBonus * 3.5,
    avatar: prodigy.avatar,
    playstyle: prodigy.playstyle,
    agencyName: '青训选秀直签 (Draft Pick Rookie)',
    contractYears: 3, // 3-year rookie contract
    buyoutClause: prodigy.signingBonus * 4
  };
}
