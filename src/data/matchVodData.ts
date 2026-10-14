import { MatchVodEntry } from '../types/game';

export const INITIAL_MATCH_VOD_ARCHIVE: MatchVodEntry[] = [
  {
    id: 'vod_worlds_final_2026',
    matchTitle: '全球总决赛决胜局：天王山龙坑世纪豪赌',
    stageType: 'WORLDS_FINAL',
    stageEra: '2026 伦敦总决赛 BO5 决胜局',
    result: 'VICTORY',
    myTeam: 'DYNASTY (中国赛区第一种子)',
    enemyTeam: 'T1 ESPORTS (LCK赛区宿敌)',
    playerChamp: '阿狸 (九尾妖狐)',
    playerRole: 'MID',
    kda: '9 / 1 / 11 (KDA 20.0)',
    duration: '34:28',
    mvpPlayer: 'Player (FMVP)',
    thumbnailGradient: 'from-amber-600/40 via-yellow-600/20 to-slate-950',
    insightAwarded: 15,
    reviewed: false,
    teamfightMoments: [
      {
        id: 'tf_1',
        minute: 12,
        title: '先锋坑口致命魅惑 · 破局先手',
        location: '峡谷先锋坑上方狭窄隘口',
        description: '敌方中野试图偷打先锋。你卡住红BUFF墙体视野盲区，在无视野状态下盲Q探草接极限魅惑命中敌方核心，瞬间打出爆发击杀！',
        outcome: 'WIN',
        keyHero: '九尾妖狐 (阿狸)',
        keyAction: '【盲视野魅惑】精准预判敌方走位轨迹，撕开前期节奏缺口',
        insightBonus: 4,
        xpBonusMech: 2,
        xpBonusMacro: 1
      },
      {
        id: 'tf_2',
        minute: 22,
        title: '小龙龙魂拉扯战 · 绝境金身换血',
        location: '炼金龙坑正面拉扯长廊',
        description: '敌方五人压阵争夺听牌龙。我方辅助遭敌方强开秒杀，你孤身三段大招进场吸收第一轮致命集火，秒按中娅沙漏规避成吨技能！',
        outcome: 'CLUTCH_FLIP',
        keyHero: '九尾妖狐 (阿狸)',
        keyAction: '【大心脏金身骗大】吸收敌方3个大招，为双C创造反打收割窗口',
        insightBonus: 5,
        xpBonusMech: 1,
        xpBonusMacro: 2
      },
      {
        id: 'tf_3',
        minute: 33,
        title: '纳什男爵决胜决断 · 闪现收割登顶',
        location: '大龙坑外围生死防线',
        description: '大龙血量跌破 2,000 点！敌方打野拼死下坑拼惩戒，你果断闪现越过前排肉盾，直接切死敌方狂暴输出的ADC，一波平推水晶夺冠！',
        outcome: 'WIN',
        keyHero: '九尾妖狐 (阿狸)',
        keyAction: '【一锤定音闪现绝杀】锁定胜局关键胜负手，斩获 FMVP 荣誉',
        insightBonus: 6,
        xpBonusMech: 2,
        xpBonusMacro: 2
      }
    ]
  },
  {
    id: 'vod_lpl_summer_derby',
    matchTitle: 'LPL 夏季赛巅峰对决：电竞春晚国家德比',
    stageType: 'LPL_REGULAR',
    stageEra: '2026 LPL 夏季常规赛第9周',
    result: 'VICTORY',
    myTeam: 'ROYAL DYNASTY',
    enemyTeam: 'TOP ESPORTS',
    playerChamp: '辛德拉 (暗黑元首)',
    playerRole: 'MID',
    kda: '7 / 2 / 8 (MVP)',
    duration: '29:45',
    mvpPlayer: 'Player (MVP)',
    thumbnailGradient: 'from-cyan-600/40 via-blue-600/20 to-slate-950',
    insightAwarded: 12,
    reviewed: false,
    teamfightMoments: [
      {
        id: 'tf_derby_1',
        minute: 8,
        title: '中路线权压制与河道伏击',
        location: '中路河道右侧草丛',
        description: '利用技能射程死死压制敌方补刀。当敌方打野尝试抓中时，暗黑法球精准弱者退散打断敌方突进位移并反手击杀！',
        outcome: 'WIN',
        keyHero: '暗黑元首 (辛德拉)',
        keyAction: '【打断位移反杀】极致微操瓦解野区伏击',
        insightBonus: 4,
        xpBonusMech: 2,
        xpBonusMacro: 1
      },
      {
        id: 'tf_derby_2',
        minute: 27,
        title: '中路高地防守反击 · 能量倾泻五杀边缘',
        location: '我方中路高地防御塔下',
        description: '敌方携大龙BUFF推塔。你抓住敌方阵型脱节的0.5秒空档，闪现推球天女散花眩晕四人，接能量倾泻瞬秒后排！',
        outcome: 'CLUTCH_FLIP',
        keyHero: '暗黑元首 (辛德拉)',
        keyAction: '【天女散花四人眩晕】上演经典高地奇迹翻盘团战',
        insightBonus: 8,
        xpBonusMech: 3,
        xpBonusMacro: 2
      }
    ]
  },
  {
    id: 'vod_solo_prodigy_clash',
    matchTitle: '峡谷之巅登顶决胜：通天代撞车生死局',
    stageType: 'SOLO_RANKED',
    stageEra: '国服第一 1,200 LP 冲刺生死战',
    result: 'VICTORY',
    myTeam: '峡谷之巅绝活车队',
    enemyTeam: '职业选手五排狙击车队',
    playerChamp: '亚索 (疾风剑豪)',
    playerRole: 'MID',
    kda: '12 / 3 / 6 (通天代 Carry)',
    duration: '26:15',
    mvpPlayer: 'Player (Carry God)',
    thumbnailGradient: 'from-purple-600/40 via-indigo-600/20 to-slate-950',
    insightAwarded: 10,
    reviewed: false,
    teamfightMoments: [
      {
        id: 'tf_solo_1',
        minute: 6,
        title: '风墙化解致命飞镖 · 越塔单杀',
        location: '敌方中路一塔深处',
        description: '对线期极致踏前斩拉扯小兵躲避技能，极限卡死风墙角度没收所有爆发暗器，踏前斩EQ闪现强行越塔强杀！',
        outcome: 'WIN',
        keyHero: '疾风剑豪 (亚索)',
        keyAction: '【双风连招踏前斩】行云流水的身法惊艳全场',
        insightBonus: 4,
        xpBonusMech: 3,
        xpBonusMacro: 0
      },
      {
        id: 'tf_solo_2',
        minute: 21,
        title: '四一分推强行牵制 · 狂风绝息斩秒C',
        location: '敌方下路高地门牙塔前',
        description: '单人带穿下路牵制敌方三人回防。你利用击飞小兵狂风绝息斩接金身拖足时间，正面队友顺势直接推平上中基地！',
        outcome: 'WIN',
        keyHero: '疾风剑豪 (亚索)',
        keyAction: '【分推兵法艺术】用单兵牵制盘活整局战略大局',
        insightBonus: 6,
        xpBonusMech: 1,
        xpBonusMacro: 3
      }
    ]
  },
  {
    id: 'vod_scrim_tactical_lesson',
    matchTitle: '世界顶级战队封闭训练赛：逆风韧性战役',
    stageType: 'SCRIM_DUEL',
    stageEra: '出征前夕内部高强度对抗',
    result: 'DEFEAT',
    myTeam: 'DYNASTY 第一阵容',
    enemyTeam: 'GEN.G ESPORTS',
    playerChamp: '发条魔灵 (奥利安娜)',
    playerRole: 'MID',
    kda: '4 / 2 / 9 (尽力局局长)',
    duration: '41:10',
    mvpPlayer: 'Chovy (GEN)',
    thumbnailGradient: 'from-rose-600/40 via-red-600/20 to-slate-950',
    insightAwarded: 8,
    reviewed: false,
    teamfightMoments: [
      {
        id: 'tf_scrim_1',
        minute: 18,
        title: '视野压制下的盲区危机',
        location: '我方上半野区红Buff草丛',
        description: '由于野区视野被对手严密封锁，我方打野做眼被抓。复盘关键在于：当线权落后时切忌单人盲进无视野河道！',
        outcome: 'LOSS',
        keyHero: '发条魔灵 (奥利安娜)',
        keyAction: '【失误复盘镜鉴】吸取盲进野区教训，领悟视野布控与防守阵型',
        insightBonus: 4,
        xpBonusMech: 0,
        xpBonusMacro: 3
      },
      {
        id: 'tf_scrim_2',
        minute: 38,
        title: '远古巨龙生死拉扯 · 指令冲击波极限挽尊',
        location: '远古巨龙深坑边缘',
        description: '在落后八千经济的绝境下，你藏球于龙坑阴影中，指令拉扯卷中敌方三人，虽遗憾落败但打出了整场最精彩的博弈！',
        outcome: 'CLUTCH_FLIP',
        keyHero: '发条魔灵 (奥利安娜)',
        keyAction: '【逆风藏球指令】逆境求生战术磨砺，大局观深度质变',
        insightBonus: 4,
        xpBonusMech: 1,
        xpBonusMacro: 2
      }
    ]
  }
];
