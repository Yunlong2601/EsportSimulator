import { CareerHealthState, PhysioTreatment } from '../types/game';

export const DEFAULT_CAREER_HEALTH: CareerHealthState = {
  strain: 0,
  hasRSI: false,
  rsiSeverity: 'none',
  maxMechanics: 100,
  consecutiveGrinds: 0,
  treatmentsCount: 0,
  physioPerkActive: false
};

export const PHYSIO_TREATMENTS: PhysioTreatment[] = [
  {
    id: 'physio_ice_stretching',
    name: '自适应冰敷与抗阻拉伸',
    title: '基础运动康复',
    icon: '🧊',
    cost: 30,
    strainRelief: 25,
    curesSeverity: ['mild'],
    restoresMaxMechanics: 100,
    perkDescription: '快速抑制手腕局部无菌性炎症水肿',
    description: '采用医用冷疗凝胶加压包敷，配合腕屈伸肌群抗阻离心拉伸训练，迅速消退酸胀感。'
  },
  {
    id: 'physio_kinesiology_taping',
    name: '职业电竞肌内效贴扎',
    title: '赛级功能固定',
    icon: '🩹',
    cost: 85,
    strainRelief: 50,
    curesSeverity: ['mild'],
    restoresMaxMechanics: 100,
    perkDescription: '提升皮下微循环，并限制过度腕屈畸变',
    description: '专业队医X型交叉十字力学贴扎，为指总伸肌腱提供额外仿生弹力支撑，缓解敲击键盘震颤。'
  },
  {
    id: 'physio_ultrasound_release',
    name: '超声波与深层筋膜刀松解',
    title: '专科医疗理疗',
    icon: '⚡',
    cost: 220,
    strainRelief: 85,
    curesSeverity: ['mild', 'moderate'],
    restoresMaxMechanics: 100,
    perkDescription: '强力剥离肌筋膜粘连与劳损结节',
    description: '1MHz聚焦超声波热疗深达骨膜层，搭配不锈钢IASTM筋膜刀精准剥离前臂瘢痕，攻克中度腱鞘劳损。'
  },
  {
    id: 'physio_shockwave_therapy',
    name: '体外发散式冲击波深度神经再生',
    title: '三甲三甲级电竞医学特需门诊',
    icon: '💉',
    cost: 560,
    strainRelief: 100,
    curesSeverity: ['mild', 'moderate', 'severe'],
    restoresMaxMechanics: 100,
    perkDescription: '彻底根治重度腱鞘炎，重铸100点微操上限巅峰',
    description: '顶级豪门专供高能气压弹道冲击波，激活内源性生长因子释放与毛细血管新生，全面逆转手腕劳损恶化。'
  },
  {
    id: 'physio_team_doctor_contract',
    name: '聘请专属运动医学理疗博士',
    title: '冠军豪门私教团队',
    icon: '🩺',
    cost: 1200,
    strainRelief: 100,
    curesSeverity: ['mild', 'moderate', 'severe'],
    restoresMaxMechanics: 100,
    perkDescription: '常驻特效：获得【骨骼装甲】护盾，后续训练劳损累积降低 50%',
    description: '全职入驻选手日常生活，提供赛前人体工学定制外设微调、赛中微循环监控与赛后手法放松，保驾护航直至夺冠。'
  }
];

export function getRsiSeverityTitle(severity: CareerHealthState['rsiSeverity']): string {
  switch (severity) {
    case 'severe':
      return '🚨 重度腱鞘炎 (微操上限锁死 55)';
    case 'moderate':
      return '⚠️ 中度职业腕管综合征 (微操上限受限 70)';
    case 'mild':
      return '🟡 轻度肌腱劳损 (微操上限受限 85)';
    default:
      return '🟢 手腕肌腱健康 (微操上限 100)';
  }
}

export function getMaxMechanicsForSeverity(severity: CareerHealthState['rsiSeverity']): number {
  switch (severity) {
    case 'severe':
      return 55;
    case 'moderate':
      return 70;
    case 'mild':
      return 85;
    default:
      return 100;
  }
}

/**
 * Checks if high strain and consecutive grind triggers an RSI injury
 */
export function evaluateRsiRisk(
  current: CareerHealthState,
  addedStrain: number,
  energy: number,
  focus: number,
  strainReductionRate: number = 0 // 0 to 0.50 from R&D Injury Prevention node
): {
  nextHealth: CareerHealthState;
  rsiTriggered: boolean;
  message?: string;
} {
  // Apply both physioPerkActive (50%) and R&D Injury Prevention node (up to 50%) compounding reduction
  let strainMultiplier = current.physioPerkActive ? 0.5 : 1.0;
  if (strainReductionRate > 0) {
    strainMultiplier = strainMultiplier * (1.0 - Math.min(0.5, strainReductionRate));
  }
  const effectiveAddedStrain = Math.max(1, Math.floor(addedStrain * strainMultiplier));
  const newStrain = Math.min(100, Math.max(0, current.strain + effectiveAddedStrain));
  const newConsecutive = current.consecutiveGrinds + 1;

  let hasRSI = current.hasRSI;
  let severity = current.rsiSeverity;
  let maxMechanics = current.maxMechanics;
  let rsiTriggered = false;
  let message: string | undefined;

  // Danger threshold checks
  // Fatigue / low energy amplifies risk significantly
  // R&D injury prevention also dampens the baseline risk chance
  const safetyFactor = Math.max(0.5, 1.0 - strainReductionRate);
  const fatigueMultiplier = (energy < 25 || focus < 25) ? 1.8 : 1.0;
  const riskChance = (newStrain / 100) * 0.6 * fatigueMultiplier * safetyFactor;

  if (!hasRSI) {
    if (newStrain >= 85 || (newStrain >= 60 && Math.random() < riskChance)) {
      hasRSI = true;
      if (newStrain >= 90) {
        severity = 'moderate';
        maxMechanics = 70;
        message = '🚨 剧烈刺痛！由于长时间不休整高强度操作，患上【中度职业腕管综合征(RSI)】！手腕僵硬酸麻，最大操作上限被强制压制至 70 点！请火速前往电竞理疗中心！';
      } else {
        severity = 'mild';
        maxMechanics = 85;
        message = '⚠️ 手腕隐痛！连续高强度训练累积过多腱鞘负荷，诱发【轻度腱鞘炎(RSI)】！最大操作上限降低至 85 点，需理疗师介入治疗！';
      }
      rsiTriggered = true;
    }
  } else {
    // Already has RSI, strain getting worse might escalate severity
    if (severity === 'mild' && newStrain >= 85 && Math.random() < 0.4) {
      severity = 'moderate';
      maxMechanics = 70;
      rsiTriggered = true;
      message = '🚨 腱鞘炎病情恶化！持续带伤作战致使韧带水肿升级为【中度职业腕管综合征(RSI)】！操作上限进一步跌至 70 点！';
    } else if (severity === 'moderate' && newStrain >= 95 && Math.random() < 0.35) {
      severity = 'severe';
      maxMechanics = 55;
      rsiTriggered = true;
      message = '💥 腱鞘剧烈撕裂感！长期忽视伤病酿成【重度腱鞘炎(RSI)】！操作上限雪崩跌至 55 点，随时面临断送职业生涯风险，必须进行深层冲击波或名医理疗！';
    }
  }

  return {
    nextHealth: {
      ...current,
      strain: newStrain,
      hasRSI,
      rsiSeverity: severity,
      maxMechanics,
      consecutiveGrinds: newConsecutive
    },
    rsiTriggered,
    message
  };
}
