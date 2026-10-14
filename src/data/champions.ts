import { Champion } from '../types/game';

export const CHAMPIONS_DATABASE: Champion[] = [
  // 上单 TOP LANE
  {
    id: 'aatrox',
    name: '亚托克斯 (剑魔)',
    role: 'TOP',
    icon: '🗡️',
    archetype: 'Dive/Assassin',
    tier: 'S+',
    power: 94,
    counters: ['sion', 'ornn', 'chogath'],
    counteredBy: ['fiora', 'gnar', 'camille'],
    signatureMove: '大灭降临 1v4 天神下凡斩杀'
  },
  {
    id: 'ksante',
    name: "奎桑提 (叹息之墙)",
    role: 'TOP',
    icon: '🛡️',
    archetype: 'Engage Tank',
    tier: 'S',
    power: 91,
    counters: ['jax', 'camille', 'jayce'],
    counteredBy: ['fiora', 'gwen', 'rumble'],
    signatureMove: '全开模式 隔墙绑架强行单杀'
  },
  {
    id: 'gnar',
    name: '纳尔 (迷失之牙)',
    role: 'TOP',
    icon: '🐾',
    archetype: 'Engage Tank',
    tier: 'S',
    power: 89,
    counters: ['aatrox', 'renekton', 'darius'],
    counteredBy: ['irelia', 'yasuo', 'jayce'],
    signatureMove: '变大如来神掌 河道拍晕五人'
  },
  {
    id: 'jax',
    name: '贾克斯 (武器大师)',
    role: 'TOP',
    icon: '🏮',
    archetype: 'Splitpusher',
    tier: 'A',
    power: 87,
    counters: ['fiora', 'camille', 'tryndamere'],
    counteredBy: ['ksante', 'malphite', 'gragas'],
    signatureMove: '反击风暴 跳斩单挑无敌带穿一路'
  },
  {
    id: 'rumble',
    name: '兰博 (机械公敌)',
    role: 'TOP',
    icon: '🔥',
    archetype: 'Dive/Assassin',
    tier: 'S',
    power: 92,
    counters: ['ksante', 'sion', 'chogath'],
    counteredBy: ['aatrox', 'gnar'],
    signatureMove: '恒温灼烧 隘口地火全屏覆盖'
  },

  // 打野 JUNGLE
  {
    id: 'leesin',
    name: '李青 (盲僧)',
    role: 'JUG',
    icon: '🥋',
    archetype: 'Dive/Assassin',
    tier: 'S+',
    power: 96,
    counters: ['sejuani', 'maokai', 'zac'],
    counteredBy: ['poppy', 'viego', 'jarvan'],
    signatureMove: '摸眼R闪 回旋踢斩杀敌方C位'
  },
  {
    id: 'jarvan',
    name: '嘉文四世 (德玛西亚皇子)',
    role: 'JUG',
    icon: '🚩',
    archetype: 'Engage Tank',
    tier: 'S',
    power: 90,
    counters: ['vi', 'xin', 'nocturne'],
    counteredBy: ['poppy', 'viego'],
    signatureMove: 'EQ闪现接天崩地裂 框住三人'
  },
  {
    id: 'viego',
    name: '佛耶戈 (破败之王)',
    role: 'JUG',
    icon: '👑',
    archetype: 'Hypercarry',
    tier: 'S',
    power: 93,
    counters: ['leesin', 'jarvan'],
    counteredBy: ['rammus', 'sejuani', 'maokai'],
    signatureMove: '君命已决 连续附身斩杀收割'
  },
  {
    id: 'sejuani',
    name: '瑟庄妮 (凛冬之怒)',
    role: 'JUG',
    icon: '🐗',
    archetype: 'Engage Tank',
    tier: 'A',
    power: 86,
    counters: ['viego', 'khazix'],
    counteredBy: ['leesin', 'graves'],
    signatureMove: '极冰寒狱 超远距离大招开团'
  },
  {
    id: 'nidalee',
    name: '奈德丽 (狂野女猎手)',
    role: 'JUG',
    icon: '🐆',
    archetype: 'Poke',
    tier: 'A',
    power: 88,
    counters: ['sejuani', 'maokai'],
    counteredBy: ['jarvan', 'poppy'],
    signatureMove: '战争迷雾 盲视野标枪血条消失术'
  },

  // 中单 MID LANE
  {
    id: 'ahri',
    name: '阿狸 (九尾妖狐)',
    role: 'MID',
    icon: '🦊',
    archetype: 'Dive/Assassin',
    tier: 'S',
    power: 93,
    counters: ['syndra', 'orianna', 'viktor'],
    counteredBy: ['yasuo', 'galio', 'leblanc'],
    signatureMove: '灵魄突袭 侧翼魅惑秒杀脆皮'
  },
  {
    id: 'azir',
    name: '阿兹尔 (沙漠皇帝)',
    role: 'MID',
    icon: '🦅',
    archetype: 'Control Mage',
    tier: 'S+',
    power: 97,
    counters: ['orianna', 'viktor', 'ryze'],
    counteredBy: ['sylas', 'leblanc', 'ahri'],
    signatureMove: '恕瑞玛漂移 大招推回全队逆转'
  },
  {
    id: 'orianna',
    name: '奥莉安娜 (发条魔灵)',
    role: 'MID',
    icon: '⚙️',
    archetype: 'Control Mage',
    tier: 'S',
    power: 92,
    counters: ['ryze', 'galio', 'vladimir'],
    counteredBy: ['ahri', 'azir', 'syndra'],
    signatureMove: '指令脉冲 五人魔灵拉大绝杀'
  },
  {
    id: 'sylas',
    name: '塞拉斯 (解脱者)',
    role: 'MID',
    icon: '⛓️',
    archetype: 'Dive/Assassin',
    tier: 'S',
    power: 94,
    counters: ['azir', 'malphite', 'galio'],
    counteredBy: ['cassiopeia', 'orianna'],
    signatureMove: '偷取敌方终极技 弑君突刺反杀'
  },
  {
    id: 'yone',
    name: '永恩 (封魔剑魂)',
    role: 'MID',
    icon: '⚔️',
    archetype: 'Hypercarry',
    tier: 'S',
    power: 91,
    counters: ['viktor', 'syndra', 'hwei'],
    counteredBy: ['renekton', 'pantheon'],
    signatureMove: '命封之界 破障之锋群体瞬斩'
  },

  // 射手 ADC / BOT
  {
    id: 'kaisa',
    name: "卡莎 (虚空之女)",
    role: 'ADC',
    icon: '🦋',
    archetype: 'Dive/Assassin',
    tier: 'S+',
    power: 95,
    counters: ['jinx', 'aphelios', 'varus'],
    counteredBy: ['caitlyn', 'draven', 'lucian'],
    signatureMove: '猎手本能 切入后排虚空电浆爆鸣'
  },
  {
    id: 'jinx',
    name: '金克丝 (暴走萝莉)',
    role: 'ADC',
    icon: '🚀',
    archetype: 'Hypercarry',
    tier: 'S',
    power: 93,
    counters: ['ezreal', 'zeri', 'sivir'],
    counteredBy: ['kaisa', 'samira', 'tristana'],
    signatureMove: '罪恶快感 触发被动狂暴五杀'
  },
  {
    id: 'varus',
    name: '韦鲁斯 (惩戒之箭)',
    role: 'ADC',
    icon: '🏹',
    archetype: 'Poke',
    tier: 'A',
    power: 89,
    counters: ['caitlyn', 'ashe', 'lucian'],
    counteredBy: ['kaisa', 'zeri'],
    signatureMove: '穿刺之箭 蓄力狙杀抢夺关键大龙'
  },
  {
    id: 'ezreal',
    name: '伊泽瑞尔 (探险家)',
    role: 'ADC',
    icon: '✨',
    archetype: 'Poke',
    tier: 'A',
    power: 88,
    counters: ['blitzcrank', 'nautilus'],
    counteredBy: ['jinx', 'caitlyn'],
    signatureMove: '奥术跃迁 精准弹幕全图刮痧绝杀'
  },
  {
    id: 'kalista',
    name: '卡莉丝塔 (复仇之矛)',
    role: 'ADC',
    icon: '⚡',
    archetype: 'Hypercarry',
    tier: 'S',
    power: 91,
    counters: ['ezreal', 'jhin', 'ashe'],
    counteredBy: ['nautilus', 'ashe'],
    signatureMove: '命运召唤 撕裂拔矛稳稳斩杀'
  },

  // 辅助 SUPPORT
  {
    id: 'nautilus',
    name: '诺提勒斯 (深海泰坦)',
    role: 'SUP',
    icon: '⚓',
    archetype: 'Engage Tank',
    tier: 'S+',
    power: 94,
    counters: ['lulu', 'nami', 'soraka', 'sona'],
    counteredBy: ['morgana', 'braum', 'thresh'],
    signatureMove: '深海冲击 指向性击飞必中开团'
  },
  {
    id: 'thresh',
    name: '锤石 (魂锁典狱长)',
    role: 'SUP',
    icon: '🏮',
    archetype: 'Engage Tank',
    tier: 'S',
    power: 92,
    counters: ['leona', 'alistar', 'nautilus'],
    counteredBy: ['morgana', 'zyra'],
    signatureMove: '死亡判决 盲视野预判神钩'
  },
  {
    id: 'rakan',
    name: '洛 (幻翎)',
    role: 'SUP',
    icon: '🦚',
    archetype: 'Engage Tank',
    tier: 'S',
    power: 93,
    counters: ['braum', 'alistar', 'tahm'],
    counteredBy: ['poppy', 'janna'],
    signatureMove: '惊鸿过隙 盛大登场光速双段抬'
  },
  {
    id: 'renata',
    name: '烈娜塔 (炼金男爵)',
    role: 'SUP',
    icon: '🧪',
    archetype: 'Enchanter',
    tier: 'A',
    power: 90,
    counters: ['kaisa', 'jinx', 'samira'],
    counteredBy: ['blitzcrank', 'pyke'],
    signatureMove: '恶意收购 令敌方全员自相残杀'
  },
  {
    id: 'lulu',
    name: '璐璐 (仙灵女巫)',
    role: 'SUP',
    icon: '🧚',
    archetype: 'Enchanter',
    tier: 'A',
    power: 87,
    counters: ['zed', 'talon', 'leblanc'],
    counteredBy: ['nautilus', 'blitzcrank', 'pyke'],
    signatureMove: '狂野生长 巨化核心C位抵御刺客'
  }
];
