import { OpponentScoutingReport, Coach } from '../types/game';
import { OpponentTeam } from './dynastyData';

export interface OpponentDraftPreset {
  compStyle: 'HeavyEngage' | 'LateScaling' | 'EarlySnowball' | 'SplitPush' | 'FlexCheesy';
  compStyleLabel: string;
  styleTag: string;
  engageRating: number;
  scalingRating: number;
  earlyAggressionRating: number;
  description: string;
  firstPickPriorities: string[];
  permaBanTargets: string[];
  comfortPicks: { champion: string; role: string; pickRate: string; mastery: string }[];
  draftWeakness: string;
  counterStrategy: string;
  tacticalCounterBuff: string;
  counterWinRateBonus: number;
}

export const OPPONENT_DRAFT_PRESETS: Record<string, OpponentDraftPreset> = {
  opp_t1: {
    compStyle: 'LateScaling',
    compStyleLabel: '后期大核发育与奇迹团流 (Late-Game Hyper-Scaling)',
    styleTag: '后期大核',
    engageRating: 68,
    scalingRating: 96,
    earlyAggressionRating: 62,
    description: 'T1 极度依赖双C大后期六神装与史诗野怪处的大招连携。前期稳固兵线，25分钟后爆发惊人的绝境奇迹团战协同。',
    firstPickPriorities: ['沙漠皇帝 (阿兹尔)', '发条魔灵 (奥莉安娜)', '盲僧 (李青)'],
    permaBanTargets: ['影流之主 (劫)', '诡术妖姬 (乐芙兰)', '暗夜猎手 (薇恩)'],
    comfortPicks: [
      { champion: '沙漠皇帝 (阿兹尔)', role: 'MID', pickRate: '88%', mastery: '神级禁军之墙绝境反推' },
      { champion: '盲僧 (李青)', role: 'JUG', pickRate: '82%', mastery: '回旋踢瞬间秒杀后排C位' },
      { champion: '蒸汽机器人 (布里茨)', role: 'SUP', pickRate: '75%', mastery: '盲视野致命机械飞爪开团' }
    ],
    draftWeakness: '前期前15分钟节奏偏向慢热防守，对前期连续不讲理的野区入侵与4包2越下塔强攻缺乏第一时间的兵线反制。',
    counterStrategy: '在BP阶段直接Ban掉沙皇，选用前期强攻爆发对线阵容，抢占前两条小龙与先锋，在20分钟前逼团破塔，绝不给其拖入30分钟大后期的机会。',
    tacticalCounterBuff: '洞悉 T1 BP 倾向 · 选用前期强攻阵容系列赛胜率 +15% · 龙坑决战配合度 +18%',
    counterWinRateBonus: 0.15
  },
  opp_geng: {
    compStyle: 'EarlySnowball',
    compStyleLabel: '野区窒息兵线与资源控图流 (Flawless Macro & Chokehold)',
    styleTag: '窒息控图',
    engageRating: 75,
    scalingRating: 88,
    earlyAggressionRating: 94,
    description: 'Gen.G 拥有教科书级别的控图基本功，通过无休止的野区视野压迫与反蹲，将对手一步步逼入慢性死亡的死局。',
    firstPickPriorities: ['奎桑提', '北地之怒 (瑟庄妮)', '残月之肃 (厄斐琉斯)'],
    permaBanTargets: ['解脱者 (塞拉斯)', '荣耀行刑官 (德莱文)', '离群之刺 (阿卡丽)'],
    comfortPicks: [
      { champion: '奎桑提', role: 'TOP', pickRate: '92%', mastery: '叹息之墙单挑秒杀敌方大核' },
      { champion: '瑟庄妮', role: 'JUG', pickRate: '86%', mastery: '极冰套索定点开团零失误' },
      { champion: '残月之肃 (厄斐琉斯)', role: 'ADC', pickRate: '84%', mastery: '狂风萤焰清辉夜凝毁天灭地' }
    ],
    draftWeakness: '战术体系极度固化，极度信奉双前排掩护单核死保输出，一旦核心ADC走位遭到突脸强切，缺乏二号输出点接盘。',
    counterStrategy: 'BP封锁厄斐琉斯，选拔高机动刺客型中野，直接跳过其前排肉坦强行定点击杀其后排单核，摧毁其阵地战阵型。',
    tacticalCounterBuff: '勘破 GEN 运营死穴 · 切后排刺杀成功率 +22% · 系列赛胜率 +14%',
    counterWinRateBonus: 0.14
  },
  opp_blg: {
    compStyle: 'HeavyEngage',
    compStyleLabel: '暴力强开与前期越塔搏杀流 (Heavy Engage & Aggressive Dive)',
    styleTag: '暴力强开',
    engageRating: 97,
    scalingRating: 58,
    earlyAggressionRating: 98,
    description: 'BLG 风格极其血腥残暴，前10分钟几乎每隔2分钟就发起一次小规模打架，依赖强开团辅助与进场型打野强行杀出血路。',
    firstPickPriorities: ['深海泰坦 (诺提勒斯)', '皮城执法官 (蔚)', '武器大师 (贾克斯)'],
    permaBanTargets: ['冰晶凤凰 (艾维尼亚)', '虚空行者 (卡萨丁)', '机械先驱 (维克托)'],
    comfortPicks: [
      { champion: '深海泰坦 (诺提勒斯)', role: 'SUP', pickRate: '95%', mastery: '闪现大招定点锁头必杀' },
      { champion: '皮城执法官 (蔚)', role: 'JUG', pickRate: '88%', mastery: '天霸横空烈轰不可阻挡' },
      { champion: '武器大师 (贾克斯)', role: 'TOP', pickRate: '84%', mastery: '跳斩反击风暴极限进场切后' }
    ],
    draftWeakness: '打法容错率极低，越塔一旦遭遇反蹲或关键秒表金身规避第一波集火，极容易全线溃败并送出巨额终结赏金。',
    counterStrategy: '选用铁壁防守反打体系 (Disengage / Anti-Dive)，如风女、酒桶、波比，在BP阶段掐断蔚与泰坦的锁头组合，诱敌深入完成反包围。',
    tacticalCounterBuff: '洞悉 BLG 强开软肋 · 反越塔反杀成功率 +28% · 系列赛胜率 +15%',
    counterWinRateBonus: 0.15
  },
  opp_g2: {
    compStyle: 'FlexCheesy',
    compStyleLabel: '天马行空黑科技摇摆流 (Unorthodox Flex Picks & Cheese Invade)',
    styleTag: '黑科技变阵',
    engageRating: 84,
    scalingRating: 72,
    earlyAggressionRating: 88,
    description: 'G2 是最具创造力的欧洲豪强，1级抱团入侵设计与单双人路英雄摇摆层出不穷，经常选出破坏常规对线节奏的怪异阵容。',
    firstPickPriorities: ['疾风剑豪 (亚索)', '封魔剑魂 (永恩)', '血港鬼影 (派克)'],
    permaBanTargets: ['深海泰坦', '扭曲树精 (茂凯)', '荒漠屠夫 (雷克顿)'],
    comfortPicks: [
      { champion: '亚索 / 永恩', role: 'MID/TOP', pickRate: '86%', mastery: '双风暴击绝境刀光剑影' },
      { champion: '血港鬼影 (派克)', role: 'SUP', pickRate: '80%', mastery: '幽灵潜行涌泉之恨连续斩杀' },
      { champion: '翠神 (艾翁)', role: 'JUG', pickRate: '75%', mastery: '诡异草丛埋伏与小菊推塔' }
    ],
    draftWeakness: '追求变阵导致阵容往往缺乏正经扎实的前排肉盾，一旦进入传统5v5大龙坑阵地肉搏，阵容容易瞬间被融化。',
    counterStrategy: '以不变应万变，BP不被其摇摆诱导，选拔高坦度大控制扎实常规阵容，稳步推进压缩其地图空间。',
    tacticalCounterBuff: '勘破 G2 摇摆黑科技 · 正面团战摧毁胜率 +20% · 系列赛胜率 +14%',
    counterWinRateBonus: 0.14
  }
};

export const SCOUTING_ANALYSIS_COST = 5000; // $5,000 analytics fee

// Generate deep-dive scouting report by assigning a coach
export function generateOpponentScoutingReport(
  opponent: OpponentTeam,
  coach: Coach
): OpponentScoutingReport {
  const preset = OPPONENT_DRAFT_PRESETS[opponent.id] || {
    compStyle: 'HeavyEngage',
    compStyleLabel: '全攻全守对线团战流 (Standard Tactical Engagement)',
    styleTag: '常规强攻',
    engageRating: 80,
    scalingRating: 75,
    earlyAggressionRating: 80,
    description: `${opponent.name} 风格偏向综合平衡，重视龙坑视野与主力五虎的技能命中率。`,
    firstPickPriorities: ['盲僧 (李青)', '深海泰坦', '解脱者 (塞拉斯)'],
    permaBanTargets: ['暗裔剑魔', '诡术妖姬', '影流之主'],
    comfortPicks: [
      { champion: opponent.signaturePick || '主力招牌英雄', role: 'MID', pickRate: '85%', mastery: '招牌绝活压迫' }
    ],
    draftWeakness: '中后期决策偶有脱节，当主力核心遭到围剿时团战群龙无首。',
    counterStrategy: '针对其主力英雄进行BP封锁，利用抱团推进逼迫其在不舒适的窄道接战。',
    tacticalCounterBuff: `洞悉 ${opponent.name} BP倾向 · 系列赛胜率 +12%`,
    counterWinRateBonus: 0.12
  };

  // If assigned coach specializes in Strategic, bonus tactical advantage!
  const isStrategic = coach.specialization === 'Strategic';
  const bonusRate = isStrategic ? 0.03 : 0.01;

  return {
    teamId: opponent.id,
    teamName: opponent.name,
    assignedCoachId: coach.id,
    assignedCoachName: coach.name,
    assignedCoachAvatar: coach.avatar,
    assignedCoachSpecialization: coach.specialization,
    scoutedAt: new Date().toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    draftTendency: {
      compStyle: preset.compStyle,
      compStyleLabel: preset.compStyleLabel,
      styleTag: preset.styleTag,
      description: preset.description,
      engageRating: preset.engageRating,
      scalingRating: preset.scalingRating,
      earlyAggressionRating: preset.earlyAggressionRating,
      firstPickPriorities: preset.firstPickPriorities,
      permaBanTargets: preset.permaBanTargets,
      comfortPicks: preset.comfortPicks,
      draftWeakness: preset.draftWeakness,
      counterStrategy: preset.counterStrategy,
      tacticalCounterBuff: `${preset.tacticalCounterBuff} (由【${coach.name}】战术沙盘解构赋能)`,
      counterWinRateBonus: preset.counterWinRateBonus + bonusRate
    }
  };
}
