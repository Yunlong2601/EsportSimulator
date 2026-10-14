import { GlobalTeamPowerRanking } from '../types/game';

export const GLOBAL_POWER_RANKINGS_TEAMS: GlobalTeamPowerRanking[] = [
  {
    rank: 1,
    previousRank: 1,
    teamId: 't1',
    teamName: 'T1 (SK Telecom)',
    shortName: 'T1',
    region: 'LCK',
    logoEmoji: '👑',
    powerRating: 98.7,
    consistencyScore: 96,
    wins: 16,
    losses: 2,
    winRate: 88.9,
    streak: '8连胜',
    tier: 'S+',
    playstyle: '奇迹团战·神级兵线运营与无解韧性',
    strengths: ['历史级大心脏逆风翻盘', '中路大局观神级指挥', '全线英雄池近乎无盲区'],
    tacticalWeakness: '前期对线偶尔激进压线过深，给野区惩戒偷龙留有狭窄窗口',
    counterTip: '前10分钟高频针对上路越塔，严厉封锁沙皇、发条与盲僧，拒绝拖入后期5v5大龙决战。',
    roster: [
      { role: 'TOP', name: 'Zeus (崔祐齐)', rating: 96, signatureHero: '亚托克斯 (剑魔)' },
      { role: 'JUG', name: 'Oner (文炫竣)', rating: 95, signatureHero: '李青 (盲僧)' },
      { role: 'MID', name: 'Faker (李相赫)', rating: 99, signatureHero: '阿兹尔 (沙漠皇帝)' },
      { role: 'ADC', name: 'Gumayusi (李玟炯)', rating: 96, signatureHero: '韦鲁斯 (惩戒之箭)' },
      { role: 'SUP', name: 'Keria (柳岷析)', rating: 97, signatureHero: '诺提勒斯 (深海泰坦)' }
    ],
    tradeTargets: [
      {
        id: 'trade_t1_sub_ad',
        name: 'Smash (青训天才射手)',
        role: 'ADC',
        rating: 87,
        team: 'T1',
        buyoutCost: 180000,
        salaryPerSeason: 55000,
        willingnessToJoin: 85,
        status: 'UNHAPPY_BENCH',
        description: '在二队打出统治级对线表现，渴望在一线联赛首发出战证明实力。'
      },
      {
        id: 'trade_t1_sub_mid',
        name: 'Poby (潜力中单替补)',
        role: 'MID',
        rating: 84,
        team: 'T1',
        buyoutCost: 120000,
        salaryPerSeason: 40000,
        willingnessToJoin: 90,
        status: 'TRANSFER_LISTED',
        description: '基本功扎实，擅长传统控制法师，可租借或直接买断。'
      }
    ]
  },
  {
    rank: 2,
    previousRank: 3,
    teamId: 'blg',
    teamName: 'BLG (Bilibili Gaming)',
    shortName: 'BLG',
    region: 'LPL',
    logoEmoji: '⚡',
    powerRating: 98.1,
    consistencyScore: 94,
    wins: 15,
    losses: 2,
    winRate: 88.2,
    streak: '6连胜',
    tier: 'S+',
    playstyle: '窒息狂暴前中期进攻·全员对线血腥压制',
    strengths: ['顶级上野肉搏先锋控制', '黄金左手团战致命输出', '极速滚雪球破塔能力'],
    tacticalWeakness: '顺风局易沉迷野区打架，防守反击与远距离Poke阵容易逼其急躁失误',
    counterTip: '避开前15分钟小规模野区肉搏，选出强控反手阵容拖至下路三件套强势期。',
    roster: [
      { role: 'TOP', name: 'Bin (陈泽彬)', rating: 97, signatureHero: '贾克斯 (武器大师)' },
      { role: 'JUG', name: 'Xun (彭立勋)', rating: 94, signatureHero: '佛耶戈 (破败之王)' },
      { role: 'MID', name: 'Knight (卓定)', rating: 98, signatureHero: '辛德拉 (暗黑元首)' },
      { role: 'ADC', name: 'Elk (赵嘉豪)', rating: 96, signatureHero: '卡莎 (虚空之女)' },
      { role: 'SUP', name: 'ON (骆文俊)', rating: 95, signatureHero: '洛 (幻翎)' }
    ],
    tradeTargets: [
      {
        id: 'trade_blg_wei',
        name: 'Wei (顶级控图野核)',
        role: 'JUG',
        rating: 92,
        team: 'BLG',
        buyoutCost: 350000,
        salaryPerSeason: 110000,
        willingnessToJoin: 75,
        status: 'STAR_EXPIRING',
        description: '双野轮换中的王牌控图大师，合约即将进入最后半年，多家豪门正密切接触。'
      }
    ]
  },
  {
    rank: 3,
    previousRank: 2,
    teamId: 'gen',
    teamName: 'GEN (Gen.G Esports)',
    shortName: 'GEN',
    region: 'LCK',
    logoEmoji: '🐅',
    powerRating: 97.8,
    consistencyScore: 95,
    wins: 16,
    losses: 3,
    winRate: 84.2,
    streak: '4连胜',
    tier: 'S+',
    playstyle: '绝对对线补刀压制·精密齿轮级资源运营',
    strengths: ['中单超高补刀与经济转化率', '野区北极熊控龙视野无缝衔接', '劣势避战拖后期胜率极高'],
    tacticalWeakness: '中前期偏向稳健发育，快节奏不讲理的一级团入侵可打乱其战术布置',
    counterTip: '针对中路兵线进行强行定点控杀，打断其无解刷钱节奏，争夺前两条峡谷先锋。',
    roster: [
      { role: 'TOP', name: 'Kiin (金基仁)', rating: 95, signatureHero: '奎桑提 (叹息之墙)' },
      { role: 'JUG', name: 'Canyon (金建敷)', rating: 97, signatureHero: '奈德丽 (狂野女猎手)' },
      { role: 'MID', name: 'Chovy (郑志勋)', rating: 98, signatureHero: '阿兹尔 (沙漠皇帝)' },
      { role: 'ADC', name: 'Peyz (金修奂)', rating: 94, signatureHero: '金克丝 (暴走萝莉)' },
      { role: 'SUP', name: 'Lehends (孙施尤)', rating: 94, signatureHero: '炼金男爵 / 诺提勒斯' }
    ],
    tradeTargets: [
      {
        id: 'trade_gen_sub_jug',
        name: 'Winner (新生代控图打野)',
        role: 'JUG',
        rating: 86,
        team: 'GEN',
        buyoutCost: 160000,
        salaryPerSeason: 48000,
        willingnessToJoin: 88,
        status: 'UNHAPPY_BENCH',
        description: '因 Canyon 长期首发而缺乏上场机会，渴望转投具备首发席位的新星战队。'
      }
    ]
  },
  {
    rank: 4,
    previousRank: 4,
    teamId: 'hle',
    teamName: 'HLE (Hanwha Life Esports)',
    shortName: 'HLE',
    region: 'LCK',
    logoEmoji: '🛡️',
    powerRating: 96.5,
    consistencyScore: 91,
    wins: 14,
    losses: 4,
    winRate: 77.8,
    streak: '3连胜',
    tier: 'S',
    playstyle: '超级双C接管比赛·大牌阵容厚重扎实',
    strengths: ['通天代ADC残局逆天收割', '冠军中单塞拉斯刺杀极具威慑', '老牌冠军野辅节奏'],
    tacticalWeakness: '过度依赖双C发育周期，一旦前期边线遭连续突破容易出现战术脱节',
    counterTip: '集中火力针对下路压榨其经济空间，利用刺客定点秒杀 Viper 即可瓦解团战大盘。',
    roster: [
      { role: 'TOP', name: 'Doran (崔玄准)', rating: 92, signatureHero: '纳尔 (迷失之牙)' },
      { role: 'JUG', name: 'Peanut (韩旺乎)', rating: 93, signatureHero: '瑟庄妮 (凛冬之怒)' },
      { role: 'MID', name: 'Zeka (金建佑)', rating: 95, signatureHero: '塞拉斯 (解脱者)' },
      { role: 'ADC', name: 'Viper (朴到贤)', rating: 97, signatureHero: '卡莎 (虚空之女)' },
      { role: 'SUP', name: 'Delight (柳焕锡)', rating: 93, signatureHero: '诺提勒斯 (深海泰坦)' }
    ],
    tradeTargets: [
      {
        id: 'trade_hle_sub_top',
        name: 'Rooster (新生代重装上单)',
        role: 'TOP',
        rating: 85,
        team: 'HLE',
        buyoutCost: 140000,
        salaryPerSeason: 42000,
        willingnessToJoin: 92,
        status: 'TRANSFER_LISTED',
        description: '韩服千分路人王，重装战士与开团坦克造诣极高，性价比极高。'
      }
    ]
  },
  {
    rank: 5,
    previousRank: 6,
    teamId: 'tes',
    teamName: 'TES (Top Esports)',
    shortName: 'TES',
    region: 'LPL',
    logoEmoji: '🔥',
    powerRating: 96.0,
    consistencyScore: 89,
    wins: 14,
    losses: 5,
    winRate: 73.7,
    streak: '5连胜',
    tier: 'S',
    playstyle: '双核极速对线击杀·顶尖微操接团硬碰硬',
    strengths: ['世界顶级大满贯指挥视野', '下路水手超模走位狂暴输出', '上单369兼具开团与抗压'],
    tacticalWeakness: '中后期偶尔因过激走位出现走单脱节，大龙坑争夺决策偶有摇摆',
    counterTip: '利用视野盲区伏击落单C位，团战集中交出硬控封锁狂小狗式走位输出。',
    roster: [
      { role: 'TOP', name: '369 (白家浩)', rating: 94, signatureHero: '兰博 (机械公敌)' },
      { role: 'JUG', name: 'Tian (高天亮)', rating: 93, signatureHero: '李青 (盲僧)' },
      { role: 'MID', name: 'Creme (林坚)', rating: 93, signatureHero: '阿狸 (九尾妖狐)' },
      { role: 'ADC', name: 'JackeyLove (喻文波)', rating: 96, signatureHero: '德莱文 / 韦鲁斯' },
      { role: 'SUP', name: 'Meiko (田野)', rating: 95, signatureHero: '锤石 (魂锁典狱长)' }
    ],
    tradeTargets: [
      {
        id: 'trade_tes_sub_mid',
        name: 'XiaoLin (二队顶尖刺客新秀)',
        role: 'MID',
        rating: 87,
        team: 'TES',
        buyoutCost: 200000,
        salaryPerSeason: 60000,
        willingnessToJoin: 86,
        status: 'UNHAPPY_BENCH',
        description: '劫、妖姬绝活哥，天梯单杀无数顶级中单，寻求LPL首发舞台。'
      }
    ]
  },
  {
    rank: 6,
    previousRank: 5,
    teamId: 'wbg',
    teamName: 'WBG (Weibo Gaming)',
    shortName: 'WBG',
    region: 'LPL',
    logoEmoji: '🌪️',
    powerRating: 95.2,
    consistencyScore: 88,
    wins: 13,
    losses: 5,
    winRate: 72.2,
    streak: '2连胜',
    tier: 'S',
    playstyle: '老将兵线运营拉扯·战术大师季后赛血统',
    strengths: ['小虎英雄池深度极其渊博', '塔赞野区路线计算极其精准', '双人组防守反击韧性极强'],
    tacticalWeakness: '前期进攻节奏相对慢热，容易在快攻重装越塔阵容前陷入被动',
    counterTip: '利用前期高机动性中野频频切入下路，打破其沉稳运营节拍。',
    roster: [
      { role: 'TOP', name: 'Breathe (陈晨)', rating: 93, signatureHero: '奎桑提 (叹息之墙)' },
      { role: 'JUG', name: 'Tarzan (李承勇)', rating: 94, signatureHero: '嘉文四世 (德玛西亚皇子)' },
      { role: 'MID', name: 'Xiaohu (李元浩)', rating: 94, signatureHero: '奥莉安娜 (发条魔灵)' },
      { role: 'ADC', name: 'Light (王光宇)', rating: 93, signatureHero: '厄斐琉斯 (残月之肃)' },
      { role: 'SUP', name: 'Crisp (刘青松)', rating: 94, signatureHero: '诺提勒斯 (深海泰坦)' }
    ],
    tradeTargets: [
      {
        id: 'trade_wbg_sub_ad',
        name: 'Kite (高机动年轻ADC)',
        role: 'ADC',
        rating: 86,
        team: 'WBG',
        buyoutCost: 170000,
        salaryPerSeason: 50000,
        willingnessToJoin: 88,
        status: 'TRANSFER_LISTED',
        description: '走位犀利，擅长卡莎与金克丝，极适合组建青年近卫军。'
      }
    ]
  },
  {
    rank: 7,
    previousRank: 7,
    teamId: 'jdg',
    teamName: 'JDG (JD Gaming)',
    shortName: 'JDG',
    region: 'LPL',
    logoEmoji: '⚔️',
    powerRating: 94.8,
    consistencyScore: 87,
    wins: 13,
    losses: 6,
    winRate: 68.4,
    streak: '1连败',
    tier: 'A+',
    playstyle: '野区强压控制·尺帝大核终局收割',
    strengths: ['Kanavi野区极具压迫感', '尺帝无懈可击的补发育能力', '老牌豪门深厚底蕴'],
    tacticalWeakness: '上中对线统治力略显下滑，强开团一旦脱节易遭团灭',
    counterTip: '封锁Kanavi野核英雄，利用前期强力上中组合主打上半区裂痕。',
    roster: [
      { role: 'TOP', name: 'Flandre (李炫君)', rating: 91, signatureHero: '兰博 (机械公敌)' },
      { role: 'JUG', name: 'Kanavi (徐进赫)', rating: 95, signatureHero: '佛耶戈 (破败之王)' },
      { role: 'MID', name: 'Yagao (曾奇)', rating: 92, signatureHero: '阿兹尔 (沙漠皇帝)' },
      { role: 'ADC', name: 'Ruler (朴载赫)', rating: 97, signatureHero: '残月之肃 / 金克丝' },
      { role: 'SUP', name: 'Missing (娄运峰)', rating: 92, signatureHero: '洛 (幻翎)' }
    ],
    tradeTargets: [
      {
        id: 'trade_jdg_sub_sup',
        name: 'Feather (灵性游走辅助新秀)',
        role: 'SUP',
        rating: 87,
        team: 'JDG',
        buyoutCost: 190000,
        salaryPerSeason: 52000,
        willingnessToJoin: 90,
        status: 'TRANSFER_LISTED',
        description: '擅长派克、锤石与洛，游走参团率高达78%，潜力巨大。'
      }
    ]
  },
  {
    rank: 8,
    previousRank: 9,
    teamId: 'g2',
    teamName: 'G2 Esports',
    shortName: 'G2',
    region: 'LEC',
    logoEmoji: '🎭',
    powerRating: 94.3,
    consistencyScore: 90,
    wins: 15,
    losses: 4,
    winRate: 78.9,
    streak: '5连胜',
    tier: 'A+',
    playstyle: '欧罗巴黑魔法·BP怪异套路与快节奏突袭',
    strengths: ['Caps神经刀世界赛极限上限', '绝活克制黑科技层出不穷', '团队联动开团果决无比'],
    tacticalWeakness: '选出纯发育平稳阵容时易失去对局重心，偶尔前期自乱阵脚',
    counterTip: '做好一级防守眼位，严防其非常规套路抓下，以稳健主流阵容压制其怪阵。',
    roster: [
      { role: 'TOP', name: 'BrokenBlade (Sergen Çelik)', rating: 92, signatureHero: '亚托克斯 (剑魔)' },
      { role: 'JUG', name: 'Yike (Martin Sundelin)', rating: 92, signatureHero: '佛耶戈 (破败之王)' },
      { role: 'MID', name: 'Caps (Rasmus Winther)', rating: 96, signatureHero: '阿狸 / 塞拉斯' },
      { role: 'ADC', name: 'Hans Sama (Steven Liv)', rating: 93, signatureHero: '金克丝 (暴走萝莉)' },
      { role: 'SUP', name: 'Mikyx (Mihael Mehle)', rating: 94, signatureHero: '诺提勒斯 (深海泰坦)' }
    ],
    tradeTargets: [
      {
        id: 'trade_g2_sub_jug',
        name: 'Vanguard (欧洲青训野区杀手)',
        role: 'JUG',
        rating: 86,
        team: 'G2',
        buyoutCost: 150000,
        salaryPerSeason: 45000,
        willingnessToJoin: 85,
        status: 'UNHAPPY_BENCH',
        description: '控龙效率惊人，精通刺客突进流派打野。'
      }
    ]
  },
  {
    rank: 9,
    previousRank: 8,
    teamId: 'lng',
    teamName: 'LNG Esports',
    shortName: 'LNG',
    region: 'LPL',
    logoEmoji: '麒麟',
    powerRating: 93.9,
    consistencyScore: 86,
    wins: 12,
    losses: 6,
    winRate: 66.7,
    streak: '2连胜',
    tier: 'A+',
    playstyle: '扎实阵地防守·GALA无解飞脸团战绝杀',
    strengths: ['Scout大赛经验丰富', 'GALA团战极限走位输出', '上路Zika对线扎实'],
    tacticalWeakness: '中野主动出击频率偏低，容易在中期视野争夺中被偷龙',
    counterTip: '针对中路限制Scout游走，切断其支援边线的通道。',
    roster: [
      { role: 'TOP', name: 'Zika (唐华钰)', rating: 92, signatureHero: '奎桑提 (叹息之墙)' },
      { role: 'JUG', name: 'Weiwei (魏博涵)', rating: 91, signatureHero: '嘉文四世 (德玛西亚皇子)' },
      { role: 'MID', name: 'Scout (李汭燦)', rating: 95, signatureHero: '阿兹尔 (沙漠皇帝)' },
      { role: 'ADC', name: 'GALA (陈伟)', rating: 96, signatureHero: '卡莎 (虚空之女)' },
      { role: 'SUP', name: 'Hang (付明航)', rating: 91, signatureHero: '洛 (幻翎)' }
    ],
    tradeTargets: [
      {
        id: 'trade_lng_sub_top',
        name: 'Shield (稳重肉装上单新秀)',
        role: 'TOP',
        rating: 85,
        team: 'LNG',
        buyoutCost: 130000,
        salaryPerSeason: 38000,
        willingnessToJoin: 92,
        status: 'TRANSFER_LISTED',
        description: '坦克开团熟练度高，极擅长抗压放线保双C。'
      }
    ]
  },
  {
    rank: 10,
    previousRank: 10,
    teamId: 'dk',
    teamName: 'Dplus KIA',
    shortName: 'DK',
    region: 'LCK',
    logoEmoji: '❄️',
    powerRating: 93.5,
    consistencyScore: 85,
    wins: 12,
    losses: 7,
    winRate: 63.2,
    streak: '1连胜',
    tier: 'A+',
    playstyle: '许秀灵性刺杀·打野新生代冲击力',
    strengths: ['ShowMaker极限操作与带队能力', '打野Lucid抢龙奇迹', 'Aiming后期输出保障'],
    tacticalWeakness: '年轻打野偶有经验短板，大龙决策屡屡陷入胶着',
    counterTip: '利用其大龙逼团时的犹豫不决进行反手拉扯，先秒前排坦克。',
    roster: [
      { role: 'TOP', name: 'Kingen (黄星勋)', rating: 92, signatureHero: '亚托克斯 (剑魔)' },
      { role: 'JUG', name: 'Lucid (崔溶赫)', rating: 91, signatureHero: '李青 (盲僧)' },
      { role: 'MID', name: 'ShowMaker (许秀)', rating: 95, signatureHero: '辛德拉 / 妖姬' },
      { role: 'ADC', name: 'Aiming (金夏兰)', rating: 93, signatureHero: '金克丝 (暴走萝莉)' },
      { role: 'SUP', name: 'Moham (郑在宪)', rating: 89, signatureHero: '诺提勒斯 (深海泰坦)' }
    ],
    tradeTargets: [
      {
        id: 'trade_dk_sub_sup',
        name: 'Bible (经验丰富指挥辅助)',
        role: 'SUP',
        rating: 87,
        team: 'DK',
        buyoutCost: 160000,
        salaryPerSeason: 46000,
        willingnessToJoin: 87,
        status: 'UNHAPPY_BENCH',
        description: '开团果决，大局观指挥清晰，适合提升年轻阵容纪律性。'
      }
    ]
  },
  {
    rank: 11,
    previousRank: 11,
    teamId: 'kt',
    teamName: 'KT Rolster',
    shortName: 'KT',
    region: 'LCK',
    logoEmoji: '🎢',
    powerRating: 92.8,
    consistencyScore: 82,
    wins: 11,
    losses: 7,
    winRate: 61.1,
    streak: '2连胜',
    tier: 'A',
    playstyle: '过山车极致刺激·Bdd顶级沙皇与绝活开团',
    strengths: ['Bdd中路英雄池硬解', '原神哥BeryL鬼才视野与团战设计', '老将逆境爆发力'],
    tacticalWeakness: '状态起伏剧烈被称为过山车，失误率在劣势局急剧增加',
    counterTip: '前期逼出其关键闪现，利用稳扎稳打的阵地战扼杀其冒险换线。',
    roster: [
      { role: 'TOP', name: 'PerfecT (李承敏)', rating: 89, signatureHero: '纳尔 (迷失之牙)' },
      { role: 'JUG', name: 'Pyosik (洪昌贤)', rating: 91, signatureHero: '李青 (盲僧)' },
      { role: 'MID', name: 'Bdd (郭普成)', rating: 94, signatureHero: '阿兹尔 (沙漠皇帝)' },
      { role: 'ADC', name: 'Deft (金赫奎)', rating: 93, signatureHero: '韦鲁斯 / 探险家' },
      { role: 'SUP', name: 'BeryL (原乾熙)', rating: 93, signatureHero: '幻翎 / 泰坦' }
    ],
    tradeTargets: [
      {
        id: 'trade_kt_sub_top',
        name: 'Cast (韩服天梯新生代重装)',
        role: 'TOP',
        rating: 86,
        team: 'KT',
        buyoutCost: 150000,
        salaryPerSeason: 44000,
        willingnessToJoin: 89,
        status: 'TRANSFER_LISTED',
        description: '贾克斯、剑魔双绝活，单带能力拔群。'
      }
    ]
  },
  {
    rank: 12,
    previousRank: 13,
    teamId: 'fly',
    teamName: 'FlyQuest',
    shortName: 'FLY',
    region: 'LCS',
    logoEmoji: '🍃',
    powerRating: 92.2,
    consistencyScore: 88,
    wins: 14,
    losses: 4,
    winRate: 77.8,
    streak: '4连胜',
    tier: 'A',
    playstyle: '美洲赛区霸主·Bwipo狂暴黑科技上单',
    strengths: ['Inspired野区顶尖计算', 'Bwipo不讲理开团抗压', '下路年轻双人组火力充沛'],
    tacticalWeakness: '过于依赖Bwipo上路个人发挥，一旦上路受挫全队战术难展',
    counterTip: '频繁安排打野蹲伏上路，破坏其兵线牵制计划。',
    roster: [
      { role: 'TOP', name: 'Bwipo (Gabriël Rau)', rating: 92, signatureHero: '兰博 (机械公敌)' },
      { role: 'JUG', name: 'Inspired (Kacper Słoma)', rating: 93, signatureHero: '瑟庄妮 (凛冬之怒)' },
      { role: 'MID', name: 'Quad (Song Su-hyeong)', rating: 90, signatureHero: '阿兹尔 (沙漠皇帝)' },
      { role: 'ADC', name: 'Massu (Fahad Abdulmalek)', rating: 91, signatureHero: '金克丝 (暴走萝莉)' },
      { role: 'SUP', name: 'Busio (Alan Cwalina)', rating: 90, signatureHero: '诺提勒斯 (深海泰坦)' }
    ],
    tradeTargets: [
      {
        id: 'trade_fly_sub_mid',
        name: 'Spirited (北美天才新中单)',
        role: 'MID',
        rating: 85,
        team: 'FLY',
        buyoutCost: 120000,
        salaryPerSeason: 36000,
        willingnessToJoin: 93,
        status: 'UNHAPPY_BENCH',
        description: '传统控制法师精通，反应极快，具有巨大培养升值空间。'
      }
    ]
  },
  {
    rank: 13,
    previousRank: 12,
    teamId: 'tl',
    teamName: 'Team Liquid',
    shortName: 'TL',
    region: 'LCS',
    logoEmoji: '🐴',
    powerRating: 91.8,
    consistencyScore: 86,
    wins: 13,
    losses: 5,
    winRate: 72.2,
    streak: '2连胜',
    tier: 'A',
    playstyle: '韩系窒息控图换线·Impact不坏金身老将',
    strengths: ['换线战术理解领先全球', 'CoreJJ全球顶尖开团指挥', '打野高频前期控图越塔'],
    tacticalWeakness: '中路APA英雄池偶有被针对风险，逆风局缺乏单点击破能力',
    counterTip: '在禁选阶段封锁其换线阵容组件，迫使对方进行纯正对线硬碰硬。',
    roster: [
      { role: 'TOP', name: 'Impact (郑言泳)', rating: 91, signatureHero: '奎桑提 (叹息之墙)' },
      { role: 'JUG', name: 'UmTi (严圣显)', rating: 90, signatureHero: '嘉文四世 (德玛西亚皇子)' },
      { role: 'MID', name: 'APA (Eain Stearns)', rating: 89, signatureHero: '奥莉安娜 (发条魔灵)' },
      { role: 'ADC', name: 'Yeon (Sean Sung)', rating: 91, signatureHero: '卡莎 (虚空之女)' },
      { role: 'SUP', name: 'CoreJJ (曹容仁)', rating: 93, signatureHero: '诺提勒斯 (深海泰坦)' }
    ],
    tradeTargets: [
      {
        id: 'trade_tl_sub_ad',
        name: 'Swift (青训高潜射手)',
        role: 'ADC',
        rating: 86,
        team: 'TL',
        buyoutCost: 140000,
        salaryPerSeason: 40000,
        willingnessToJoin: 90,
        status: 'TRANSFER_LISTED',
        description: '补刀基本功优异，擅长泽丽与卡莎，签约意愿强烈。'
      }
    ]
  },
  {
    rank: 14,
    previousRank: 14,
    teamId: 'fnc',
    teamName: 'Fnatic',
    shortName: 'FNC',
    region: 'LEC',
    logoEmoji: '⚔️',
    powerRating: 91.2,
    consistencyScore: 84,
    wins: 13,
    losses: 6,
    winRate: 68.4,
    streak: '1连败',
    tier: 'A',
    playstyle: '全员敢打敢拼·Razork野区前期疯狗节奏',
    strengths: ['Razork野区极具爆发力', 'Humanoid大赛强心剂', '下路韩援射手高输出'],
    tacticalWeakness: '中期优势局经常冲动开团送龙，防守反击纪律性偏弱',
    counterTip: '布置野区防守视野静待其主动冲脸，利用虚弱与硬控反打翻盘。',
    roster: [
      { role: 'TOP', name: 'Oscarinin (Óscar Muñoz)', rating: 89, signatureHero: '纳尔 (迷失之牙)' },
      { role: 'JUG', name: 'Razork (Iván Martín)', rating: 92, signatureHero: '佛耶戈 (破败之王)' },
      { role: 'MID', name: 'Humanoid (Marek Brázda)', rating: 91, signatureHero: '辛德拉 (暗黑元首)' },
      { role: 'ADC', name: 'Noah (Oh Hyeon-taek)', rating: 91, signatureHero: '金克丝 (暴走萝莉)' },
      { role: 'SUP', name: 'Jun (Yoon Se-jun)', rating: 90, signatureHero: '诺提勒斯 (深海泰坦)' }
    ],
    tradeTargets: [
      {
        id: 'trade_fnc_sub_jug',
        name: 'Rebel (欧洲凶狠野核新星)',
        role: 'JUG',
        rating: 85,
        team: 'FNC',
        buyoutCost: 125000,
        salaryPerSeason: 38000,
        willingnessToJoin: 91,
        status: 'UNHAPPY_BENCH',
        description: '攻击性极强，反野路线刁钻，适合快攻体系。'
      }
    ]
  },
  {
    rank: 15,
    previousRank: 16,
    teamId: 'nip',
    teamName: 'NIP (Ninjas in Pyjamas)',
    shortName: 'NIP',
    region: 'LPL',
    logoEmoji: '🥷',
    powerRating: 90.8,
    consistencyScore: 83,
    wins: 11,
    losses: 7,
    winRate: 61.1,
    streak: '3连胜',
    tier: 'A',
    playstyle: '两球一姬真神坐镇·上路单挑王硬碰硬',
    strengths: ['Rookie中路对线绝对不朽', 'Shanji英雄池极其怪异难防', '下路稳步防守反击'],
    tacticalWeakness: '中后期团战过度依赖Rookie个人开团闪现，容易陷入单核泥潭',
    counterTip: 'Ban位限制Rookie前三大法师刺客，打团率先集火中单。',
    roster: [
      { role: 'TOP', name: 'Shanji (邓子健)', rating: 91, signatureHero: '兰博 (机械公敌)' },
      { role: 'JUG', name: 'Aki (毛安)', rating: 89, signatureHero: '瑟庄妮 (凛冬之怒)' },
      { role: 'MID', name: 'Rookie (宋义进)', rating: 95, signatureHero: '阿狸 / 辛德拉' },
      { role: 'ADC', name: 'Photic (应祺燊)', rating: 90, signatureHero: '金克丝 (暴走萝莉)' },
      { role: 'SUP', name: 'Zhuo (王旭卓)', rating: 88, signatureHero: '诺提勒斯 (深海泰坦)' }
    ],
    tradeTargets: [
      {
        id: 'trade_nip_sub_top',
        name: 'Blade (二队凶残单带上单)',
        role: 'TOP',
        rating: 86,
        team: 'NIP',
        buyoutCost: 135000,
        salaryPerSeason: 39000,
        willingnessToJoin: 92,
        status: 'TRANSFER_LISTED',
        description: '贾克斯、剑魔熟练度极高，单挑压制力出众。'
      }
    ]
  },
  {
    rank: 16,
    previousRank: 15,
    teamId: 'we',
    teamName: 'Team WE',
    shortName: 'WE',
    region: 'LPL',
    logoEmoji: '🔴',
    powerRating: 90.2,
    consistencyScore: 81,
    wins: 10,
    losses: 8,
    winRate: 55.6,
    streak: '1连败',
    tier: 'A',
    playstyle: '红色青春风暴·前期野区凶猛交锋',
    strengths: ['大黄Wayward敢于开团操作', '中单FoFo控制法师稳健', '野区控图有声有色'],
    tacticalWeakness: '后期终局决策偶现迷茫，劣势抗压容易被连环破塔',
    counterTip: '通过抓中抓下切断其双C发育，利用中期大龙逼团迫使其急躁犯错。',
    roster: [
      { role: 'TOP', name: 'Wayward (黄任行)', rating: 89, signatureHero: '纳尔 (迷失之牙)' },
      { role: 'JUG', name: 'Heng (杨翠衡)', rating: 89, signatureHero: '李青 (盲僧)' },
      { role: 'MID', name: 'FoFo (朱骏岚)', rating: 91, signatureHero: '阿兹尔 (沙漠皇帝)' },
      { role: 'ADC', name: 'Able (戴志春)', rating: 90, signatureHero: '金克丝 (暴走萝莉)' },
      { role: 'SUP', name: 'Iwandy (廖顶洋)', rating: 89, signatureHero: '洛 (幻翎)' }
    ],
    tradeTargets: [
      {
        id: 'trade_we_sub_ad',
        name: 'Spark (高机动年轻ADC)',
        role: 'ADC',
        rating: 86,
        team: 'WE',
        buyoutCost: 140000,
        salaryPerSeason: 41000,
        willingnessToJoin: 94,
        status: 'TRANSFER_LISTED',
        description: '补刀扎实，团战输出效率高，非常适合重建中队伍。'
      }
    ]
  },
  {
    rank: 17,
    previousRank: 17,
    teamId: 'c9',
    teamName: 'Cloud9',
    shortName: 'C9',
    region: 'LCS',
    logoEmoji: '☁️',
    powerRating: 89.9,
    consistencyScore: 82,
    wins: 11,
    losses: 7,
    winRate: 61.1,
    streak: '2连胜',
    tier: 'A',
    playstyle: '北美传统豪门·韩援顶尖微操与野区疯狗',
    strengths: ['Blaber野区开团果断', 'Berserker世界级走位输出', 'Thanatos上单对线扎实'],
    tacticalWeakness: '中后期团队协同偶尔出现沟通断档，先锋团战选点较单一',
    counterTip: '封锁狂暴打野，抱团推进拆除外塔逐步蚕食其野区资源。',
    roster: [
      { role: 'TOP', name: 'Thanatos (朴昇珪)', rating: 90, signatureHero: '亚托克斯 (剑魔)' },
      { role: 'JUG', name: 'Blaber (Robert Huang)', rating: 91, signatureHero: '佛耶戈 (破败之王)' },
      { role: 'MID', name: 'Jojopyun (Joseph Pyun)', rating: 90, signatureHero: '塞拉斯 (解脱者)' },
      { role: 'ADC', name: 'Berserker (金旼哲)', rating: 94, signatureHero: '卡莎 (虚空之女)' },
      { role: 'SUP', name: 'Vulcan (Philippe Laflamme)', rating: 89, signatureHero: '诺提勒斯 (深海泰坦)' }
    ],
    tradeTargets: [
      {
        id: 'trade_c9_berserker',
        name: 'Berserker (世界级超巨ADC)',
        role: 'ADC',
        rating: 94,
        team: 'C9',
        buyoutCost: 450000,
        salaryPerSeason: 140000,
        willingnessToJoin: 78,
        status: 'STAR_EXPIRING',
        description: '合约即将到期，世界顶级ADC，具有一人逆转战局的恐怖实力。'
      }
    ]
  },
  {
    rank: 18,
    previousRank: 19,
    teamId: 'mdk',
    teamName: 'MAD Lions KOI',
    shortName: 'MDK',
    region: 'LEC',
    logoEmoji: '🦁',
    powerRating: 89.2,
    consistencyScore: 80,
    wins: 11,
    losses: 8,
    winRate: 57.9,
    streak: '1连胜',
    tier: 'A',
    playstyle: '西班牙青年近卫军·全图极速联动抓人',
    strengths: ['Elyoya总指挥视野大局观', '全员年轻冲劲极强', '换线节奏适应极快'],
    tacticalWeakness: '大赛经验匮乏，被对手针对后容易产生急躁送头失误',
    counterTip: '前期稳固阵脚避免产生被越塔击杀，拖到25分钟利用团战纪律性瓦解他们。',
    roster: [
      { role: 'TOP', name: 'Myrwn (Alex Pastor)', rating: 88, signatureHero: '纳尔 (迷失之牙)' },
      { role: 'JUG', name: 'Elyoya (Javier Prades)', rating: 92, signatureHero: '李青 (盲僧)' },
      { role: 'MID', name: 'Fresskowy (Bartłomiej Przewoźnik)', rating: 88, signatureHero: '阿兹尔 (沙漠皇帝)' },
      { role: 'ADC', name: 'Supa (David Martínez)', rating: 89, signatureHero: '金克丝 (暴走萝莉)' },
      { role: 'SUP', name: 'Alvaro (Álvaro Fernández)', rating: 89, signatureHero: '诺提勒斯 (深海泰坦)' }
    ],
    tradeTargets: [
      {
        id: 'trade_mdk_sub_ad',
        name: 'Flash (高反应欧洲射手新星)',
        role: 'ADC',
        rating: 85,
        team: 'MDK',
        buyoutCost: 110000,
        salaryPerSeason: 34000,
        willingnessToJoin: 95,
        status: 'TRANSFER_LISTED',
        description: '擅长滑板鞋与女警，对线压迫感十足。'
      }
    ]
  },
  {
    rank: 19,
    previousRank: 18,
    teamId: 'fpx',
    teamName: 'FunPlus Phoenix',
    shortName: 'FPX',
    region: 'LPL',
    logoEmoji: '🪶',
    powerRating: 88.7,
    consistencyScore: 79,
    wins: 10,
    losses: 9,
    winRate: 52.6,
    streak: '1连败',
    tier: 'A',
    playstyle: '银河战舰野核·极速抓单突袭',
    strengths: ['银河milkyway最佳新秀打野侵略性', '中单Care扎实守线', '下路老将稳定保底'],
    tacticalWeakness: '一旦milkyway野区陷入被动，全队容易陷入进攻瘫痪',
    counterTip: '封锁千珏、潘森等进攻型野核，入侵其野区反制其前期节奏。',
    roster: [
      { role: 'TOP', name: 'Xiaolaohu (平小虎)', rating: 87, signatureHero: '奎桑提 (叹息之墙)' },
      { role: 'JUG', name: 'milkyway (蔡子俊)', rating: 93, signatureHero: '佛耶戈 (破败之王)' },
      { role: 'MID', name: 'Care (阳杰)', rating: 88, signatureHero: '阿兹尔 (沙漠皇帝)' },
      { role: 'ADC', name: 'deokdam (徐大吉)', rating: 89, signatureHero: '卡莎 (虚空之女)' },
      { role: 'SUP', name: 'Life (金政玟)', rating: 88, signatureHero: '诺提勒斯 (深海泰坦)' }
    ],
    tradeTargets: [
      {
        id: 'trade_fpx_milkyway',
        name: 'milkyway (超新星野核状元)',
        role: 'JUG',
        rating: 93,
        team: 'FPX',
        buyoutCost: 400000,
        salaryPerSeason: 120000,
        willingnessToJoin: 82,
        status: 'STAR_EXPIRING',
        description: '年度最佳新秀，野核统治力无与伦比，各大顶级豪门竞相争夺的建队基石。'
      }
    ]
  },
  {
    rank: 20,
    previousRank: 20,
    teamId: 'kdf',
    teamName: 'Kwangdong Freecs',
    shortName: 'KDF',
    region: 'LCK',
    logoEmoji: '⚔️',
    powerRating: 88.1,
    consistencyScore: 78,
    wins: 9,
    losses: 9,
    winRate: 50.0,
    streak: '2连败',
    tier: 'A',
    playstyle: '硬核韧性抗压·防守反击抓失误',
    strengths: ['DuDu上路坚韧抗压', 'Cuzz经验老道控图', '擅长大招流团战反杀'],
    tacticalWeakness: '终结比赛手段较为单一，顺风局推进节奏偶现拖沓',
    counterTip: '通过分推单带拉扯其抱团阵型，击破其防御外塔后直取大龙。',
    roster: [
      { role: 'TOP', name: 'DuDu (李东东)', rating: 89, signatureHero: '奎桑提 (叹息之墙)' },
      { role: 'JUG', name: 'Cuzz (文友赞)', rating: 90, signatureHero: '瑟庄妮 (凛冬之怒)' },
      { role: 'MID', name: 'BuLLDoG (李泰民)', rating: 87, signatureHero: '辛德拉 (暗黑元首)' },
      { role: 'ADC', name: 'Taeyoon (金泰允)', rating: 86, signatureHero: '金克丝 (暴走萝莉)' },
      { role: 'SUP', name: 'Andil (权度均)', rating: 86, signatureHero: '诺提勒斯 (深海泰坦)' }
    ],
    tradeTargets: [
      {
        id: 'trade_kdf_sub_top',
        name: 'Rock (耐打防守型上单)',
        role: 'TOP',
        rating: 84,
        team: 'KDF',
        buyoutCost: 110000,
        salaryPerSeason: 32000,
        willingnessToJoin: 95,
        status: 'TRANSFER_LISTED',
        description: '坦克抗压稳如泰山，极少被单杀，适合预算有限的俱乐部。'
      }
    ]
  }
];

// Helper to filter teams by region or search
export function getRankedTeamsByRegion(region: 'ALL' | 'LPL' | 'LCK' | 'LEC' | 'LCS' = 'ALL') {
  if (region === 'ALL') return GLOBAL_POWER_RANKINGS_TEAMS;
  return GLOBAL_POWER_RANKINGS_TEAMS.filter(t => t.region === region);
}

// Helper to get all trade target candidates across the top 20 teams
export function getAllTradeTargets() {
  const targets = [];
  for (const team of GLOBAL_POWER_RANKINGS_TEAMS) {
    for (const target of team.tradeTargets) {
      targets.push({
        ...target,
        teamLogo: team.logoEmoji,
        teamRegion: team.region,
        teamRank: team.rank
      });
    }
  }
  return targets;
}

// Generate or retrieve deterministic hidden potential stats for a player
export function generateHiddenPotential(
  playerName: string,
  role: string,
  baseRating: number,
  teamName: string
): import('../types/game').HiddenPotentialStats {
  // Deterministic seed based on name string
  let seed = 0;
  for (let i = 0; i < playerName.length; i++) {
    seed = (seed * 31 + playerName.charCodeAt(i)) % 10007;
  }

  const clutchFactor = Math.min(99, Math.max(75, Math.round(baseRating + (seed % 15) - 5)));
  const growthCap = Math.min(100, Math.max(baseRating + 1, Math.round(baseRating + 3 + (seed % 6))));
  const tiltResistance = Math.min(99, Math.max(70, Math.round(80 + ((seed * 7) % 19))));
  const championMasteryCap = Math.min(99, Math.max(75, Math.round(baseRating + ((seed * 3) % 12) - 3)));
  const teamfightIQ = Math.min(99, Math.max(78, Math.round(baseRating + ((seed * 5) % 10) - 2)));

  const SPECIAL_TRAITS = [
    '【绝境神之胜负手】关键生死局全属性 +15%',
    '【极限心流领域】逆风翻盘概率额外提升 +25%',
    '【深渊英雄海】无视任何版本削弱与英雄克制',
    '【战术定海神针】全队抗崩心理韧性 +20',
    '【狂暴对线单杀王】前10分钟击杀收益与压刀翻倍',
    '【团战残局收割机】生命值低于30%时输出暴击率 +40%',
    '【上帝视界雷达】全图视野洞察度与反蹲成功率 +30%'
  ];
  const traitIdx = (seed + playerName.length) % SPECIAL_TRAITS.length;
  const specialTrait = SPECIAL_TRAITS[traitIdx];

  const scoutInsight = `${playerName} 在 ${teamName} 担任 ${role}。球探雷达显示其实际潜力上限高达 ${growthCap} (当前战力 ${baseRating})，关键局胜负手评级 ${clutchFactor}，特质解锁【${specialTrait.slice(1, 10)}】。在世界赛高压BO5对抗中具备改变战局的终极战略价值！`;

  return {
    clutchFactor,
    growthCap,
    tiltResistance,
    championMasteryCap,
    teamfightIQ,
    specialTrait,
    scoutInsight
  };
}

// 5-Week Competitive Ranking Trends Map for Top 20 Global Teams
export const TEAM_RANK_TRENDS_MAP: Record<string, import('../types/game').WeeklyRankPoint[]> = {
  t1: [
    { week: '第1周', weekShort: 'W1', rank: 3, powerRating: 96.5, record: '2-0', scoutingNote: '揭幕战中野联动顺畅，下路双人线稳健控线' },
    { week: '第2周', weekShort: 'W2', rank: 2, powerRating: 97.2, record: '2-0', scoutingNote: '零封强敌豪取4连胜，运营韧性领跑全联盟' },
    { week: '第3周', weekShort: 'W3', rank: 2, powerRating: 97.6, record: '1-1', scoutingNote: '激战三局虽惜败宿敌，决胜局大心脏逆风翻盘' },
    { week: '第4周', weekShort: 'W4', rank: 1, powerRating: 98.4, record: '2-0', scoutingNote: '重回全球榜首！Faker沙漠皇帝封神团战奠定胜局' },
    { week: '第5周 (本周)', weekShort: 'W5', rank: 1, powerRating: 98.7, record: '2-0', scoutingNote: '连续2周稳坐王座，全员状态火热近乎无破绽' }
  ],
  blg: [
    { week: '第1周', weekShort: 'W1', rank: 1, powerRating: 98.5, record: '2-0', scoutingNote: '血腥狂暴进攻揭幕，前15分钟对线压制率100%' },
    { week: '第2周', weekShort: 'W2', rank: 1, powerRating: 98.3, record: '2-0', scoutingNote: '统治LPL赛区榜首，Bin单带武器大师无解' },
    { week: '第3周', weekShort: 'W3', rank: 3, powerRating: 97.0, record: '0-2', scoutingNote: '遭Poke防守阵容针对，急躁越塔接连断节奏' },
    { week: '第4周', weekShort: 'W4', rank: 3, powerRating: 97.4, record: '2-0', scoutingNote: '紧急战术调整纠错，重拾野区主动控图节奏' },
    { week: '第5周 (本周)', weekShort: 'W5', rank: 2, powerRating: 98.1, record: '2-0', scoutingNote: '6连胜强势反弹！重夺第二，锋芒直逼榜首T1' }
  ],
  gen: [
    { week: '第1周', weekShort: 'W1', rank: 2, powerRating: 97.2, record: '2-0', scoutingNote: '精密齿轮控龙运营，Chovy惊人补刀转化率' },
    { week: '第2周', weekShort: 'W2', rank: 3, powerRating: 96.9, record: '1-1', scoutingNote: '面对前期高频越塔节奏略显脱节，遭针对丢分' },
    { week: '第3周', weekShort: 'W3', rank: 1, powerRating: 98.2, record: '2-0', scoutingNote: '击败T1登顶榜首，Canyon狂野女猎手野区极致刷野' },
    { week: '第4周', weekShort: 'W4', rank: 2, powerRating: 97.9, record: '1-1', scoutingNote: '遭冷门战术破阵，后期团战站位出现罕见瑕疵' },
    { week: '第5周 (本周)', weekShort: 'W5', rank: 3, powerRating: 97.8, record: '2-0', scoutingNote: '状态平稳回升，仍是世界赛第一档争冠热门' }
  ],
  tes: [
    { week: '第1周', weekShort: 'W1', rank: 6, powerRating: 94.2, record: '1-1', scoutingNote: '前期对线凶悍但中后期大龙坑决策脱节' },
    { week: '第2周', weekShort: 'W2', rank: 5, powerRating: 95.1, record: '2-0', scoutingNote: '野区提速控龙，下路双杀定乾坤' },
    { week: '第3周', weekShort: 'W3', rank: 4, powerRating: 95.8, record: '2-0', scoutingNote: '豪取4连胜，打法愈发老练沉稳' },
    { week: '第4周', weekShort: 'W4', rank: 4, powerRating: 96.0, record: '1-1', scoutingNote: '与BLG鏖战三局仅以毫厘之差惜败' },
    { week: '第5周 (本周)', weekShort: 'W5', rank: 4, powerRating: 96.3, record: '2-0', scoutingNote: '稳居第四，团战爆发力令所有对手忌惮' }
  ],
  hle: [
    { week: '第1周', weekShort: 'W1', rank: 7, powerRating: 93.8, record: '1-1', scoutingNote: '银河战舰磨合初期，双C默契仍在建立' },
    { week: '第2周', weekShort: 'W2', rank: 7, powerRating: 94.4, record: '2-0', scoutingNote: 'Zeka近战刺客版本红利，单杀数领跑联赛' },
    { week: '第3周', weekShort: 'W3', rank: 6, powerRating: 95.0, record: '2-0', scoutingNote: 'Viper伤害占比突破42%，后期团战机器成型' },
    { week: '第4周', weekShort: 'W4', rank: 5, powerRating: 95.7, record: '2-0', scoutingNote: '打破GEN不败金身，排名暴涨进前五' },
    { week: '第5周 (本周)', weekShort: 'W5', rank: 5, powerRating: 96.1, record: '2-0', scoutingNote: '近5周持续爬升，势头最猛烈的黑马强权' }
  ],
  jdg: [
    { week: '第1周', weekShort: 'W1', rank: 4, powerRating: 95.5, record: '2-0', scoutingNote: '老牌豪门底蕴犹在，下路稳健兜底' },
    { week: '第2周', weekShort: 'W2', rank: 4, powerRating: 95.2, record: '1-1', scoutingNote: '中野联动偶有失误，前期节奏偏向迟缓' },
    { week: '第3周', weekShort: 'W3', rank: 5, powerRating: 94.6, record: '1-1', scoutingNote: '面对快节奏冲击难以招架，失误率上升' },
    { week: '第4周', weekShort: 'W4', rank: 6, powerRating: 94.1, record: '1-1', scoutingNote: '战术转型期阵痛，排名出现滑落' },
    { week: '第5周 (本周)', weekShort: 'W5', rank: 6, powerRating: 94.8, record: '2-0', scoutingNote: '战术复盘见效，止跌回升重振军心' }
  ],
  g2: [
    { week: '第1周', weekShort: 'W1', rank: 9, powerRating: 92.5, record: '2-0', scoutingNote: '欧洲霸主花式BP，黑科技英雄频出' },
    { week: '第2周', weekShort: 'W2', rank: 8, powerRating: 93.3, record: '2-0', scoutingNote: 'Caps招牌中单游走盘活三路' },
    { week: '第3周', weekShort: 'W3', rank: 8, powerRating: 93.6, record: '2-0', scoutingNote: 'LEC连胜领跑，展现世界级强队韧性' },
    { week: '第4周', weekShort: 'W4', rank: 7, powerRating: 94.2, record: '2-0', scoutingNote: '跨赛区训练赛战绩惊艳，跻身全球前七' },
    { week: '第5周 (本周)', weekShort: 'W5', rank: 7, powerRating: 94.5, record: '2-0', scoutingNote: '西方赛区最强门面，不可轻视的战术大师' }
  ],
  dk: [
    { week: '第1周', weekShort: 'W1', rank: 5, powerRating: 94.8, record: '2-0', scoutingNote: 'ShowMaker状态神勇，极速连胜开局' },
    { week: '第2周', weekShort: 'W2', rank: 6, powerRating: 94.0, record: '1-1', scoutingNote: '下路对线出现被动，中期指挥脱节' },
    { week: '第3周', weekShort: 'W3', rank: 7, powerRating: 93.5, record: '0-2', scoutingNote: '惨遭强敌压制，连续两周排名下滑' },
    { week: '第4周', weekShort: 'W4', rank: 8, powerRating: 93.2, record: '1-1', scoutingNote: '苦战险胜弱旅，队伍急需找回自信' },
    { week: '第5周 (本周)', weekShort: 'W5', rank: 8, powerRating: 93.6, record: '2-0', scoutingNote: '重整旗鼓零封对手，稳住前八席位' }
  ],
  wbg: [
    { week: '第1周', weekShort: 'W1', rank: 11, powerRating: 90.8, record: '1-1', scoutingNote: '阵容磨合起伏不定，战术执行力有待提升' },
    { week: '第2周', weekShort: 'W2', rank: 10, powerRating: 91.5, record: '2-0', scoutingNote: 'Xiaohu春之虎帝觉醒，连续两场斩获MVP' },
    { week: '第3周', weekShort: 'W3', rank: 9, powerRating: 92.4, record: '2-0', scoutingNote: '逆风翻盘狂飙突进，排名杀入前十' },
    { week: '第4周', weekShort: 'W4', rank: 9, powerRating: 92.6, record: '1-1', scoutingNote: '与强敌厮杀至决胜局，虽败犹荣' },
    { week: '第5周 (本周)', weekShort: 'W5', rank: 9, powerRating: 93.0, record: '2-0', scoutingNote: '韧性十足的老牌军团，世界赛席位有力竞争者' }
  ],
  kt: [
    { week: '第1周', weekShort: 'W1', rank: 8, powerRating: 93.2, record: '2-0', scoutingNote: '开局生猛，过山车属性再次展露' },
    { week: '第2周', weekShort: 'W2', rank: 9, powerRating: 92.7, record: '0-2', scoutingNote: '战术僵化被对手完全摸透，连丢两分' },
    { week: '第3周', weekShort: 'W3', rank: 10, powerRating: 92.0, record: '1-1', scoutingNote: '艰难止血，但队伍心态受到一定冲击' },
    { week: '第4周', weekShort: 'W4', rank: 11, powerRating: 91.4, record: '0-2', scoutingNote: '排名跌至近五周低谷，全队陷入低迷' },
    { week: '第5周 (本周)', weekShort: 'W5', rank: 10, powerRating: 92.2, record: '2-0', scoutingNote: '通讯社大战逆势绝地反击，排名止跌回升' }
  ],
  fnc: [
    { week: '第1周', weekShort: 'W1', rank: 12, powerRating: 90.1, record: '1-1', scoutingNote: '前期打架血腥但控龙视野不足' },
    { week: '第2周', weekShort: 'W2', rank: 12, powerRating: 90.4, record: '1-1', scoutingNote: '稳扎稳打保持平稳战绩' },
    { week: '第3周', weekShort: 'W3', rank: 11, powerRating: 91.0, record: '2-0', scoutingNote: '下路暴走双杀，排名小幅上升' },
    { week: '第4周', weekShort: 'W4', rank: 10, powerRating: 91.8, record: '2-0', scoutingNote: '连胜冲入前十，打法渐入佳境' },
    { week: '第5周 (本周)', weekShort: 'W5', rank: 11, powerRating: 91.5, record: '1-1', scoutingNote: '惜败G2，仍保持在欧洲顶尖集团' }
  ],
  lng: [
    { week: '第1周', weekShort: 'W1', rank: 10, powerRating: 91.8, record: '1-1', scoutingNote: '中路个人能力出众，但野区控制欠佳' },
    { week: '第2周', weekShort: 'W2', rank: 11, powerRating: 91.2, record: '1-1', scoutingNote: '对线期压制力不足，节奏迟滞' },
    { week: '第3周', weekShort: 'W3', rank: 12, powerRating: 90.6, record: '0-2', scoutingNote: '惨遭连败，排名下滑至第12' },
    { week: '第4周', weekShort: 'W4', rank: 12, powerRating: 90.8, record: '1-1', scoutingNote: '止血成功但战术单一问题待解' },
    { week: '第5周 (本周)', weekShort: 'W5', rank: 12, powerRating: 91.1, record: '2-0', scoutingNote: '触底反弹斩获关键积分，状态回升' }
  ],
  tl: [
    { week: '第1周', weekShort: 'W1', rank: 14, powerRating: 88.7, record: '1-1', scoutingNote: '韩援双核磨合中，团战配合略显生疏' },
    { week: '第2周', weekShort: 'W2', rank: 15, powerRating: 88.2, record: '0-2', scoutingNote: '被快节奏打法完全压制' },
    { week: '第3周', weekShort: 'W3', rank: 14, powerRating: 89.0, record: '2-0', scoutingNote: '加强前期防守视野，胜率回升' },
    { week: '第4周', weekShort: 'W4', rank: 13, powerRating: 89.6, record: '2-0', scoutingNote: '稳居LCS榜首，排名小幅攀升' },
    { week: '第5周 (本周)', weekShort: 'W5', rank: 13, powerRating: 90.2, record: '2-0', scoutingNote: '连胜巩固北美第一，战术执行力增强' }
  ],
  fly: [
    { week: '第1周', weekShort: 'W1', rank: 15, powerRating: 88.0, record: '1-1', scoutingNote: '重组阵容开局谨慎，慢节奏发育' },
    { week: '第2周', weekShort: 'W2', rank: 14, powerRating: 88.6, record: '2-0', scoutingNote: '中单爆发带动全场节奏，排名微升' },
    { week: '第3周', weekShort: 'W3', rank: 15, powerRating: 88.4, record: '1-1', scoutingNote: '激战不敌TL，但韧性获得好评' },
    { week: '第4周', weekShort: 'W4', rank: 14, powerRating: 89.1, record: '2-0', scoutingNote: '战胜同赛区强敌，重回第14' },
    { week: '第5周 (本周)', weekShort: 'W5', rank: 14, powerRating: 89.5, record: '2-0', scoutingNote: '稳扎稳打，形成双雄争霸格局' }
  ],
  al: [
    { week: '第1周', weekShort: 'W1', rank: 18, powerRating: 86.2, record: '0-2', scoutingNote: '赛季初磨合不佳，失误频发' },
    { week: '第2周', weekShort: 'W2', rank: 17, powerRating: 87.0, record: '1-1', scoutingNote: '新人打野上场带来全新进攻活力' },
    { week: '第3周', weekShort: 'W3', rank: 16, powerRating: 87.8, record: '2-0', scoutingNote: '连续爆冷掀翻强敌，成联赛最大黑马' },
    { week: '第4周', weekShort: 'W4', rank: 15, powerRating: 88.5, record: '2-0', scoutingNote: '豪取4连胜，排名连续4周持续飙升' },
    { week: '第5周 (本周)', weekShort: 'W5', rank: 15, powerRating: 89.0, record: '2-0', scoutingNote: '上升势头极其强劲，未来不可限量' }
  ],
  nip: [
    { week: '第1周', weekShort: 'W1', rank: 13, powerRating: 89.5, record: '2-0', scoutingNote: 'Rookie中路神勇Carry，强势开局' },
    { week: '第2周', weekShort: 'W2', rank: 13, powerRating: 89.2, record: '1-1', scoutingNote: '边路抗压不足，胜负全看中路' },
    { week: '第3周', weekShort: 'W3', rank: 13, powerRating: 88.9, record: '1-1', scoutingNote: '对手严密针对中路Ban位，陷入苦战' },
    { week: '第4周', weekShort: 'W4', rank: 16, powerRating: 87.8, record: '0-2', scoutingNote: '连败阵痛，排名跌落3个名次' },
    { week: '第5周 (本周)', weekShort: 'W5', rank: 16, powerRating: 88.2, record: '1-1', scoutingNote: '虽跌入第16，但仍具备极高爆发上限' }
  ],
  kdf: [
    { week: '第1周', weekShort: 'W1', rank: 17, powerRating: 86.8, record: '1-1', scoutingNote: '青年军敢打敢拼但决策稚嫩' },
    { week: '第2周', weekShort: 'W2', rank: 18, powerRating: 86.3, record: '0-2', scoutingNote: '被LCK前列队伍运营彻底碾压' },
    { week: '第3周', weekShort: 'W3', rank: 17, powerRating: 87.0, record: '2-0', scoutingNote: '新人对线打出单杀，振奋士气' },
    { week: '第4周', weekShort: 'W4', rank: 17, powerRating: 87.2, record: '1-1', scoutingNote: '战绩趋于稳定，维持第17名' },
    { week: '第5周 (本周)', weekShort: 'W5', rank: 17, powerRating: 87.5, record: '1-1', scoutingNote: '平稳发挥，青年军继续汲取成长经验' }
  ],
  bds: [
    { week: '第1周', weekShort: 'W1', rank: 16, powerRating: 87.5, record: '1-1', scoutingNote: '盖伦、诺手黑科技打法偶有奇效' },
    { week: '第2周', weekShort: 'W2', rank: 16, powerRating: 87.3, record: '1-1', scoutingNote: '战术被对手摸清后受到限制' },
    { week: '第3周', weekShort: 'W3', rank: 18, powerRating: 86.4, record: '0-2', scoutingNote: '遭遇连败，英雄池短板暴露' },
    { week: '第4周', weekShort: 'W4', rank: 18, powerRating: 86.6, record: '1-1', scoutingNote: '止住连败颓势，但打法依旧单一' },
    { week: '第5周 (本周)', weekShort: 'W5', rank: 18, powerRating: 87.0, record: '1-1', scoutingNote: '维持第18名，仍具冷门爆冷威胁' }
  ],
  c9: [
    { week: '第1周', weekShort: 'W1', rank: 19, powerRating: 85.5, record: '0-2', scoutingNote: '阵容重建初期，配合出现多处断层' },
    { week: '第2周', weekShort: 'W2', rank: 19, powerRating: 85.8, record: '1-1', scoutingNote: '击败弱旅拿下首胜，稍解燃眉之急' },
    { week: '第3周', weekShort: 'W3', rank: 19, powerRating: 86.0, record: '1-1', scoutingNote: '老将带新人渐入正轨，逐步稳固' },
    { week: '第4周', weekShort: 'W4', rank: 19, powerRating: 86.2, record: '1-1', scoutingNote: '连续多周在第19名徘徊巩固' },
    { week: '第5周 (本周)', weekShort: 'W5', rank: 19, powerRating: 86.5, record: '1-1', scoutingNote: '稳步重建，战术纪律性有明显改善' }
  ],
  mdk: [
    { week: '第1周', weekShort: 'W1', rank: 20, powerRating: 84.8, record: '0-2', scoutingNote: '全西班牙新人初登LEC，经验不足' },
    { week: '第2周', weekShort: 'W2', rank: 20, powerRating: 85.0, record: '1-1', scoutingNote: '团战激情拉满斩获赛季首胜' },
    { week: '第3周', weekShort: 'W3', rank: 20, powerRating: 85.3, record: '1-1', scoutingNote: '敢拼敢秀，但运营基本功仍需补课' },
    { week: '第4周', weekShort: 'W4', rank: 20, powerRating: 85.6, record: '1-1', scoutingNote: '连追强敌一局，展现极佳拼劲' },
    { week: '第5周 (本周)', weekShort: 'W5', rank: 20, powerRating: 85.9, record: '1-1', scoutingNote: '稳居TOP20守门员，成长潜力备受期待' }
  ]
};

// Returns authentic 5-week ranking trends with fallback interpolation
export function getTeamRankTrends(team: import('../types/game').GlobalTeamPowerRanking): import('../types/game').WeeklyRankPoint[] {
  if (team.rankTrends && team.rankTrends.length >= 5) {
    return team.rankTrends;
  }
  if (TEAM_RANK_TRENDS_MAP[team.teamId]) {
    return TEAM_RANK_TRENDS_MAP[team.teamId];
  }

  // Deterministic fallback generator
  const currentRank = team.rank;
  const prevRank = team.previousRank || currentRank;
  const delta = prevRank - currentRank; // positive = climbing

  const w1Rank = Math.min(20, Math.max(1, prevRank + delta));
  const w2Rank = Math.min(20, Math.max(1, prevRank));
  const w3Rank = Math.min(20, Math.max(1, Math.round((prevRank + currentRank) / 2)));
  const w4Rank = Math.min(20, Math.max(1, prevRank));
  const w5Rank = currentRank;

  return [
    { week: '第1周', weekShort: 'W1', rank: w1Rank, powerRating: Math.round((team.powerRating - 1.8) * 10) / 10, record: '1-1', scoutingNote: '赛季开局常规试探' },
    { week: '第2周', weekShort: 'W2', rank: w2Rank, powerRating: Math.round((team.powerRating - 1.2) * 10) / 10, record: '1-1', scoutingNote: '战术体系磨合期' },
    { week: '第3周', weekShort: 'W3', rank: w3Rank, powerRating: Math.round((team.powerRating - 0.7) * 10) / 10, record: '2-0', scoutingNote: '关键对局胜负博弈' },
    { week: '第4周', weekShort: 'W4', rank: w4Rank, powerRating: Math.round((team.powerRating - 0.3) * 10) / 10, record: '1-1', scoutingNote: '常规赛后半段稳固战力' },
    { week: '第5周 (本周)', weekShort: 'W5', rank: w5Rank, powerRating: team.powerRating, record: '2-0', scoutingNote: '当前战力定型，状态趋于稳定' }
  ];
}
