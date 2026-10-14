import { ProPlayer, PlayerPlaystyle, TacticalUnitConfig, PlayerPairChemistry, TeamDynamicsState } from '../types/game';

export interface TacticalPresetDef {
  id: string;
  name: string;
  tagline: string;
  description: string;
  badge: string;
  recommendedPlaystyle: string;
  units: Omit<TacticalUnitConfig, 'assignedPlayerIds'>[];
  defaultRoleMapping: Record<string, string[]>; // unitId -> roles
}

export const TACTICAL_PRESETS: TacticalPresetDef[] = [
  {
    id: 'mid_jgl_engine',
    name: '中野代练驱动 · 经典双核 (Mid-Jungle Engine)',
    tagline: '将中路与打野绑定为最高指挥核，下路双人组稳健控线，上路孤岛牵制',
    description: '最具统治力的职业传统阵型。中野前中期快速清线入侵游走，控下第一条先锋后盘活全局。',
    badge: '⚡ 节奏发动机',
    recommendedPlaystyle: 'Aggressive / Macro-Oriented',
    units: [
      {
        id: 'unit_mid_jgl',
        name: '中野节拍驱动组 (Rhythm Core)',
        label: '中野代练联动',
        description: '负责全队前中期入侵、河蟹争夺与第一条峡谷先锋先手开团。',
        recommendedRoles: ['MID', 'JGL'],
        tacticalFocus: 'ENGAGE',
        focusLabel: '中路突破与极速包下',
        colorScheme: {
          border: 'border-cyan-500/60',
          bg: 'bg-cyan-950/40',
          text: 'text-cyan-300',
          glow: 'rgba(6,182,212,0.3)'
        }
      },
      {
        id: 'unit_bot_duo',
        name: '下路决胜双生组 (Bot Lane Duo)',
        label: '下路发育与推进',
        description: '下路双人组专注对线压制与小龙区视野防守，中后期承担主力物理炮台。',
        recommendedRoles: ['ADC', 'SUP'],
        tacticalFocus: 'DAMAGE',
        focusLabel: '稳定对线与小龙控速',
        colorScheme: {
          border: 'border-amber-500/60',
          bg: 'bg-amber-950/40',
          text: 'text-amber-300',
          glow: 'rgba(245,158,11,0.3)'
        }
      },
      {
        id: 'unit_solo_top',
        name: '上路孤岛抗压单带组 (Island Vanguard)',
        label: '单兵作战与防抓',
        description: '独立对抗敌方上野压力，自给自足并在团战期提供关键传送侧翼切入。',
        recommendedRoles: ['TOP'],
        tacticalFocus: 'SPLIT_PUSH',
        focusLabel: '独狼抗压与TP绕后',
        colorScheme: {
          border: 'border-emerald-500/60',
          bg: 'bg-emerald-950/40',
          text: 'text-emerald-300',
          glow: 'rgba(16,185,129,0.3)'
        }
      }
    ],
    defaultRoleMapping: {
      unit_mid_jgl: ['JGL', 'MID'],
      unit_bot_duo: ['ADC', 'SUP'],
      unit_solo_top: ['TOP']
    }
  },
  {
    id: 'top_dive_roam',
    name: '上野铁血强攻 · 全图压迫 (Top Dive & Global Roam)',
    tagline: '上野二人组组成铁血拆塔矛头，辅助联动中路控图，射手独狼发育',
    description: '偏好前中期速战速决的极具破坏力阵型。上野二人高强度越塔破上一塔，释放峡谷先锋滚雪球。',
    badge: '🔥 暴力破局',
    recommendedPlaystyle: 'Aggressive / Clutch',
    units: [
      {
        id: 'unit_top_jgl',
        name: '上半区进攻矛头组 (Top-Jungle Dive)',
        label: '上野越塔联线',
        description: '极速清野后直扑上路，利用连环硬控撕裂敌方上单防线，强吃一塔赏金。',
        recommendedRoles: ['TOP', 'JGL'],
        tacticalFocus: 'ENGAGE',
        focusLabel: '先锋强夺与上路强杀',
        colorScheme: {
          border: 'border-rose-500/60',
          bg: 'bg-rose-950/40',
          text: 'text-rose-300',
          glow: 'rgba(244,63,94,0.3)'
        }
      },
      {
        id: 'unit_mid_sup',
        name: '游走策应中枢组 (Roaming Syndicate)',
        label: '游走与防守反击',
        description: '中辅双人联动布控河道高台视野，压制敌方游走企图，随时反蹲支援。',
        recommendedRoles: ['MID', 'SUP'],
        tacticalFocus: 'VISION_CONTROL',
        focusLabel: '河道封锁与防守包夹',
        colorScheme: {
          border: 'border-indigo-500/60',
          bg: 'bg-indigo-950/40',
          text: 'text-indigo-300',
          glow: 'rgba(99,102,241,0.3)'
        }
      },
      {
        id: 'unit_solo_adc',
        name: '独狼战术射手组 (Self-Sufficient ADC)',
        label: '放养抗压发育',
        description: '具备位移自保能力的射手独自抗压吃兵线，将资源让渡给上半区进攻节奏。',
        recommendedRoles: ['ADC'],
        tacticalFocus: 'PEEL_PROTECT',
        focusLabel: '塔下自保与塔皮止损',
        colorScheme: {
          border: 'border-purple-500/60',
          bg: 'bg-purple-950/40',
          text: 'text-purple-300',
          glow: 'rgba(168,85,247,0.3)'
        }
      }
    ],
    defaultRoleMapping: {
      unit_top_jgl: ['TOP', 'JGL'],
      unit_mid_sup: ['MID', 'SUP'],
      unit_solo_adc: ['ADC']
    }
  },
  {
    id: 'jgl_sup_vision',
    name: '野辅天网控图 · 三核齐驱 (Vision & Triple Carry)',
    tagline: '野辅双游点亮敌方野区黑雾，三路对线选手全员化身终极输出核',
    description: '现代电竞运营体系天花板。野辅二人组形影不离，在敌方野区插满真眼，为三路核心提供绝对安全输出空间。',
    badge: '👁️ 视野天网',
    recommendedPlaystyle: 'Macro-Oriented / Defensive',
    units: [
      {
        id: 'unit_vision_web',
        name: '野辅侦测天网组 (Vision Dominance Unit)',
        label: '野辅双游控图',
        description: '全图排眼排真眼、点亮关键龙坑与蓝红Buff入口，令对手动向无所遁形。',
        recommendedRoles: ['JGL', 'SUP'],
        tacticalFocus: 'VISION_CONTROL',
        focusLabel: '黑雾压制与提前占位',
        colorScheme: {
          border: 'border-blue-500/60',
          bg: 'bg-blue-950/40',
          text: 'text-blue-300',
          glow: 'rgba(59,130,246,0.3)'
        }
      },
      {
        id: 'unit_upper_cores',
        name: '上半区双法核组 (Top-Mid Carry Force)',
        label: '上中双核突进',
        description: '上单与中单双核并进，利用个人对线能力压榨兵线，团战形成左右双进场。',
        recommendedRoles: ['TOP', 'MID'],
        tacticalFocus: 'DAMAGE',
        focusLabel: '兵线推进与正面撕扯',
        colorScheme: {
          border: 'border-amber-500/60',
          bg: 'bg-amber-950/40',
          text: 'text-amber-300',
          glow: 'rgba(245,158,11,0.3)'
        }
      },
      {
        id: 'unit_solo_marksman',
        name: '终极后期炮台组 (Late Game Win Condition)',
        label: '大后期决胜射手',
        description: '吃满下路经济，装备成型后在团战后排提供毁天灭地的持续爆发。',
        recommendedRoles: ['ADC'],
        tacticalFocus: 'DAMAGE',
        focusLabel: '资源倾斜与绝对输出',
        colorScheme: {
          border: 'border-emerald-500/60',
          bg: 'bg-emerald-950/40',
          text: 'text-emerald-300',
          glow: 'rgba(16,185,129,0.3)'
        }
      }
    ],
    defaultRoleMapping: {
      unit_vision_web: ['JGL', 'SUP'],
      unit_upper_cores: ['TOP', 'MID'],
      unit_solo_marksman: ['ADC']
    }
  },
  {
    id: 'split_push_131',
    name: '1-3-1 终极边路牵制 (1-3-1 Split Push)',
    tagline: '上中双核单带拉扯，中路三人组化身铁壁，让对手顾此失彼',
    description: '极度考验团队纪律性的牵制阵型。双边路单带无解推塔，中路三人绝不强开，只打反手与拖延。',
    badge: '🗺️ 边线拉扯',
    recommendedPlaystyle: 'Macro-Oriented / Clutch',
    units: [
      {
        id: 'unit_dual_split',
        name: '双边线单带牵引组 (Dual Wing Pushers)',
        label: '双边路无解单带',
        description: '上单与中单各带一条边线，具备单杀能力，逼迫对手派遣多人回防守塔。',
        recommendedRoles: ['TOP', 'MID'],
        tacticalFocus: 'SPLIT_PUSH',
        focusLabel: '兵线施压与防守牵制',
        colorScheme: {
          border: 'border-orange-500/60',
          bg: 'bg-orange-950/40',
          text: 'text-orange-300',
          glow: 'rgba(249,115,22,0.3)'
        }
      },
      {
        id: 'unit_trio_defenders',
        name: '中路铁壁拉扯三人组 (Midline Bastion Trio)',
        label: '中线防守拉扯',
        description: '野辅护航射手安全清线，利用长手技能与视野化解敌方强开，为边线争取推塔时间。',
        recommendedRoles: ['JGL', 'ADC', 'SUP'],
        tacticalFocus: 'PEEL_PROTECT',
        focusLabel: '铁壁防守与反打拉扯',
        colorScheme: {
          border: 'border-cyan-500/60',
          bg: 'bg-cyan-950/40',
          text: 'text-cyan-300',
          glow: 'rgba(6,182,212,0.3)'
        }
      }
    ],
    defaultRoleMapping: {
      unit_dual_split: ['TOP', 'MID'],
      unit_trio_defenders: ['JGL', 'ADC', 'SUP']
    }
  },
  {
    id: 'deathball_5man',
    name: '五虎抱团决战冲阵 (5-Man Deathball & Engage)',
    tagline: '前排三人肉搏冲锋，双C暴力秒杀，简单粗暴的终极5v5团战美学',
    description: '在大龙与龙魂团战中具有摧枯拉朽威力的正统团战阵型。前排无脑冲脸吸收伤害，后排毁灭性输出。',
    badge: '⚔️ 终极团战',
    recommendedPlaystyle: 'Aggressive / Clutch',
    units: [
      {
        id: 'unit_frontline_brawl',
        name: '前排先锋冲锋组 (Frontline Juggernauts)',
        label: '先手开团与抗伤',
        description: '上野辅三人前排并排推进，连环强控控死敌方核心，分割敌方战场阵型。',
        recommendedRoles: ['TOP', 'JGL', 'SUP'],
        tacticalFocus: 'ENGAGE',
        focusLabel: '强行开团与火力吸收',
        colorScheme: {
          border: 'border-rose-500/60',
          bg: 'bg-rose-950/40',
          text: 'text-rose-300',
          glow: 'rgba(244,63,94,0.3)'
        }
      },
      {
        id: 'unit_twin_burst',
        name: '双C致命收割组 (Twin Burst Finishers)',
        label: '双核致命倾泻',
        description: '中单与射手在严密保护下打满AOE爆发与残局收割，瞬间融化敌方全队。',
        recommendedRoles: ['MID', 'ADC'],
        tacticalFocus: 'DAMAGE',
        focusLabel: '瞬间集火与完美收割',
        colorScheme: {
          border: 'border-yellow-500/60',
          bg: 'bg-yellow-950/40',
          text: 'text-yellow-300',
          glow: 'rgba(234,179,8,0.3)'
        }
      }
    ],
    defaultRoleMapping: {
      unit_frontline_brawl: ['TOP', 'JGL', 'SUP'],
      unit_twin_burst: ['MID', 'ADC']
    }
  }
];

// Helper: Compute Pair Chemistry between two specific players
export function calculatePairChemistry(
  p1: ProPlayer,
  p2: ProPlayer,
  unitContext?: TacticalUnitConfig
): PlayerPairChemistry {
  let score = 65; // Base chemistry
  const ps1: PlayerPlaystyle = p1.playstyle || 'Aggressive';
  const ps2: PlayerPlaystyle = p2.playstyle || 'Aggressive';

  // 1. Playstyle compatibility
  let comboTitle = '战术协同连携';
  let synergyBuff = '+10% 协同输出';
  let analysis = '常规战术配合，具备基础默契。';
  let isComplementary = false;

  if (ps1 === 'Aggressive' && ps2 === 'Aggressive') {
    score += 15;
    comboTitle = '狂暴双先锋 · 瞬杀击溃';
    synergyBuff = '+18% 前中期第一波越塔爆发';
    analysis = '两位选手骨子里均流淌激进热血，前中期进场时机完全同步，瞬间集火能力极高！';
    isComplementary = true;
  } else if ((ps1 === 'Aggressive' && ps2 === 'Clutch') || (ps1 === 'Clutch' && ps2 === 'Aggressive')) {
    score += 18;
    comboTitle = '绝配组合 · 强开与终结';
    synergyBuff = '+22% 决胜团战收割与逆风翻盘率';
    analysis = '激进型选手负责肉身开团吸引敌方火力，大心脏选手伺机切入完成冷血残局收割，天生一对！';
    isComplementary = true;
  } else if (ps1 === 'Macro-Oriented' && ps2 === 'Macro-Oriented') {
    score += 16;
    comboTitle = '智商压制 · 步调一致';
    synergyBuff = '+16% 资源控图与视野压制效率';
    analysis = '共同拥有顶尖大局观与战术直觉，兵线运营与换塔决策无需多言即可心领神会。';
    isComplementary = true;
  } else if ((ps1 === 'Macro-Oriented' && ps2 === 'Defensive') || (ps1 === 'Defensive' && ps2 === 'Macro-Oriented')) {
    score += 14;
    comboTitle = '铁壁磐石 · 运营无死角';
    synergyBuff = '+14% 防守反击减伤与防抓率';
    analysis = '稳健防守搭配宏观运营，几乎从不给对手任何以少打多的破绽机会。';
    isComplementary = true;
  } else if ((ps1 === 'Aggressive' && ps2 === 'Defensive') || (ps1 === 'Defensive' && ps2 === 'Aggressive')) {
    score += 8;
    comboTitle = '攻守相济 · 互为掩护';
    synergyBuff = '+12% 阵线拉扯容错率';
    analysis = '一人主攻冲阵，一人稳健殿后，虽然节奏偶有微调，但攻守互补性极高。';
  } else if (ps1 === 'Clutch' && ps2 === 'Clutch') {
    score += 17;
    comboTitle = '绝境双子星 · 逆天改命';
    synergyBuff = '+20% BO5决胜局胜率与极限反打';
    analysis = '逆风时刻谁也不慌，双重大心脏加持，越是绝境越能打出不可思议的神仙配合！';
    isComplementary = true;
  }

  // 2. Natural role affinity bonuses
  const roles = [p1.role, p2.role].sort();
  if (roles[0] === 'JUG' && roles[1] === 'MID') {
    score += 8;
    comboTitle = '黄金中野 · 节奏发动机';
    synergyBuff += ' • +15% 游走击杀率';
  } else if (roles[0] === 'JUG' && roles[1] === 'TOP') {
    score += 7;
    comboTitle = '铁血上野 · 越塔先锋';
    synergyBuff += ' • +14% 峡谷先锋掌控力';
  } else if (roles[0] === 'ADC' && roles[1] === 'SUP') {
    score += 9;
    comboTitle = '下路双生 · 绝对信赖';
    synergyBuff += ' • +16% 2v2 对线压制力';
  } else if (roles[0] === 'JUG' && roles[1] === 'SUP') {
    score += 8;
    comboTitle = '野辅天网 · 视野主宰';
    synergyBuff += ' • +15% 敌方野区黑雾驱散';
  }

  // 3. Morale & Mechanics synergy
  if (p1.morale >= 85 && p2.morale >= 85) {
    score += 5;
  }
  const avgMechanics = (p1.mechanics + p2.mechanics) / 2;
  if (avgMechanics >= 90) {
    score += 4;
  }

  // Cap score 50 - 99
  const chemistryScore = Math.min(99, Math.max(52, score));

  let chemistryGrade: PlayerPairChemistry['chemistryGrade'] = 'B';
  if (chemistryScore >= 92) chemistryGrade = 'SSS';
  else if (chemistryScore >= 84) chemistryGrade = 'SS';
  else if (chemistryScore >= 76) chemistryGrade = 'S';
  else if (chemistryScore >= 68) chemistryGrade = 'A';

  return {
    player1Id: p1.id,
    player2Id: p2.id,
    chemistryScore,
    chemistryGrade,
    comboTitle,
    synergyBuff,
    analysis,
    isComplementary
  };
}

// Helper: Calculate entire Team Dynamics state
export function calculateTeamDynamicsState(
  presetId: string,
  units: TacticalUnitConfig[],
  roster: ProPlayer[]
): TeamDynamicsState {
  const pairChemistries: PlayerPairChemistry[] = [];
  const playerMap = new Map(roster.map(p => [p.id, p]));

  let totalPairScores = 0;
  let pairCount = 0;

  // 1. Calculate intra-unit chemistries
  units.forEach(unit => {
    const playersInUnit = unit.assignedPlayerIds
      .map(id => playerMap.get(id))
      .filter((p): p is ProPlayer => Boolean(p));

    if (playersInUnit.length >= 2) {
      for (let i = 0; i < playersInUnit.length; i++) {
        for (let j = i + 1; j < playersInUnit.length; j++) {
          const chem = calculatePairChemistry(playersInUnit[i], playersInUnit[j], unit);
          pairChemistries.push(chem);
          totalPairScores += chem.chemistryScore;
          pairCount++;
        }
      }
    }
  });

  // 2. Base synergy score calculation
  let baseScore = 60;
  if (pairCount > 0) {
    baseScore = Math.round(totalPairScores / pairCount);
  }

  // Bonus for fully assigning all 5 starters
  const assignedCount = units.reduce((acc, u) => acc + u.assignedPlayerIds.length, 0);
  if (assignedCount === 5) {
    baseScore += 6;
  }

  // Bonus for matching recommended roles inside units
  let roleMatchBonuses = 0;
  units.forEach(u => {
    u.assignedPlayerIds.forEach(pId => {
      const p = playerMap.get(pId);
      if (p && u.recommendedRoles.includes(p.role)) {
        roleMatchBonuses += 2;
      }
    });
  });
  baseScore += Math.min(8, roleMatchBonuses);

  const totalSynergyScore = Math.min(100, Math.max(50, baseScore));

  let synergyGrade: TeamDynamicsState['synergyGrade'] = 'A';
  let synergyTitle = '战术协同 · 配合默契';
  let synergyBuffSummary = '+10% 团战协同伤害 · +6% 战术拉扯容错';

  if (totalSynergyScore >= 92) {
    synergyGrade = 'SSS';
    synergyTitle = '天衣无缝 · 神级化学反应';
    synergyBuffSummary = '+25% 团战全员秒杀联动 · +20% 绝境大翻盘胜率 · 阵型无懈可击';
  } else if (totalSynergyScore >= 84) {
    synergyGrade = 'SS';
    synergyTitle = '心领神会 · 默契拉满';
    synergyBuffSummary = '+18% 团战决胜协同 · +14% 龙团占位抢先机';
  } else if (totalSynergyScore >= 76) {
    synergyGrade = 'S';
    synergyTitle = '战术共振 · 攻守齐备';
    synergyBuffSummary = '+14% 阵型配合度 · +10% 游走支援速度';
  } else if (totalSynergyScore < 68) {
    synergyGrade = 'B';
    synergyTitle = '战术磨合中 · 仍有潜力';
    synergyBuffSummary = '+6% 基础协同增益';
  }

  return {
    currentPresetId: presetId,
    units,
    totalSynergyScore,
    synergyGrade,
    synergyTitle,
    synergyBuffSummary,
    pairChemistries,
    lastOptimizedAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  };
}

// Helper: Initialize default units for a given preset from roster
export function initializeUnitsForPreset(presetId: string, roster: ProPlayer[]): TacticalUnitConfig[] {
  const preset = TACTICAL_PRESETS.find(p => p.id === presetId) || TACTICAL_PRESETS[0];
  const starters = roster.slice(0, 5);

  return preset.units.map(uDef => {
    const targetRoles = preset.defaultRoleMapping[uDef.id] || [];
    const matchedPlayers = starters.filter(p => targetRoles.includes(p.role));

    return {
      ...uDef,
      assignedPlayerIds: matchedPlayers.map(p => p.id)
    };
  });
}

// Helper: Find mathematically optimal player configuration across units to maximize synergy score
export function findOptimalUnitConfiguration(
  presetId: string,
  units: TacticalUnitConfig[],
  roster: ProPlayer[]
): {
  optimalUnits: TacticalUnitConfig[];
  maxScore: number;
} {
  const starters = roster.slice(0, 5);
  if (starters.length < 5) {
    return { optimalUnits: units, maxScore: 70 };
  }

  const preset = TACTICAL_PRESETS.find(p => p.id === presetId) || TACTICAL_PRESETS[0];

  // Permute the 5 starters among the slots defined by the preset
  // Most presets define slot capacities that sum up to 5:
  const slotCapacities = preset.units.map(u => (preset.defaultRoleMapping[u.id] || []).length);

  // Generate permutations of the 5 players
  const playerIds = starters.map(p => p.id);
  
  function permute(arr: string[]): string[][] {
    if (arr.length <= 1) return [arr];
    const res: string[][] = [];
    for (let i = 0; i < arr.length; i++) {
      const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
      for (const p of permute(rest)) {
        res.push([arr[i], ...p]);
      }
    }
    return res;
  }

  const allPermutations = permute(playerIds);
  let bestScore = -1;
  let bestUnits = units;

  for (const perm of allPermutations) {
    let index = 0;
    const testUnits: TacticalUnitConfig[] = preset.units.map((uDef, uIdx) => {
      const cap = slotCapacities[uIdx] || 1;
      const assigned = perm.slice(index, index + cap);
      index += cap;
      return {
        ...uDef,
        assignedPlayerIds: assigned
      };
    });

    const res = calculateTeamDynamicsState(presetId, testUnits, roster);
    if (res.totalSynergyScore > bestScore) {
      bestScore = res.totalSynergyScore;
      bestUnits = testUnits;
    }
  }

  return {
    optimalUnits: bestUnits,
    maxScore: bestScore
  };
}
