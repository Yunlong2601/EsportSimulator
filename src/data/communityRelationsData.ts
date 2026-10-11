import { CommunityCampaign, CommunityRelationsState, ConfidenceTierInfo, PostMatchMvpRecord, LegacyStatBoost, FanbaseMilestone } from '../types/game';

export const CONFIDENCE_TIERS_CONFIG: Record<number, ConfidenceTierInfo> = {
  0: {
    level: 0,
    name: '平稳从容 (Calm)',
    badge: '⚪',
    bonusMech: 0,
    bonusMental: 0,
    bonusWinRate: 0,
    bonusLp: 0,
    desc: '心态波澜不惊，保持常规水准发挥。'
  },
  1: {
    level: 1,
    name: '渐入佳境 (Warming Up)',
    badge: '🟢',
    bonusMech: 3,
    bonusMental: 5,
    bonusWinRate: 5,
    bonusLp: 4,
    desc: '操作手感温热，对线嗅觉显著增强 (+3微操, +5心态, +5%胜率, +4LP)。'
  },
  2: {
    level: 2,
    name: '气势如虹 (High Morale)',
    badge: '🟡',
    bonusMech: 6,
    bonusMental: 8,
    bonusWinRate: 9,
    bonusLp: 8,
    desc: '自信心爆棚！敢打敢拼，绝境团战敢于闪现反打 (+6微操, +8心态, +9%胜率, +8LP)。'
  },
  3: {
    level: 3,
    name: '天神霸体 · 巅峰自信 (Godlike Confidence)',
    badge: '👑',
    bonusMech: 10,
    bonusMental: 12,
    bonusWinRate: 14,
    bonusLp: 12,
    desc: '狂傲心流合一！全场焦点神级主宰，免疫一切心态受挫负面 (+10微操, +12心态, +14%胜率, +12LP)！'
  }
};

export const POST_MATCH_FLAVORS = {
  carry_god: {
    title: '天神下凡 · 狂暴收割',
    quote: '米勒解说狂呼：“这就是通天代！一人抬着四个人往前走！一夫当关，万夫莫开！”',
    danmaku: '【弹幕疯狂刷屏】：“卧槽！这走位直接给对面看傻了！”、“建议直接抬进国家队！”、“7777777”'
  },
  clutch_king: {
    title: '大心脏绝杀 · 孤勇逆境',
    quote: '娃娃惊呼：“丝血反杀！极限水银秒解大招！你永远可以相信绝境中的大心脏！”',
    danmaku: '【弹幕疯狂刷屏】：“大心脏拉满！”、“心脏骤停！这敢反打也是没谁了！”、“太燃了兄弟！”'
  },
  lane_dominator: {
    title: '线霸统治 · 窒息压制',
    quote: '管泽元感叹：“对线15分钟压了70刀单吃一血塔，对位经济领先3,500块，这根本没法玩了！”',
    danmaku: '【弹幕疯狂刷屏】：“对面已经红温了”、“折磨大师”、“代，就硬代！”'
  },
  macro_mastermind: {
    title: '战术大脑 · 掌控全局',
    quote: '长毛点评：“全图游走无处不在，参团率高达 100%！教科书级别的野区指挥艺术！”',
    danmaku: '【弹幕疯狂刷屏】：“雷达级意识”、“视野艺术大师”、“这大脑领先两个段位”'
  },
  svp_tragic_hero: {
    title: '孤勇战神 · 虽败犹荣 (SVP)',
    quote: '解说叹息：“一个人竭尽全力打出 45% 输出占比，可惜队友连续断节奏，真正的无力回天局！”',
    danmaku: '【弹幕疯狂刷屏】：“尽力了兄弟”、“心疼一秒通天代”、“队友在犯罪，非战之罪！”'
  }
};

export const COMMUNITY_CAMPAIGNS: CommunityCampaign[] = [
  // 1. 社交媒体营销 (Social Media Campaigns)
  {
    id: 'social_memes',
    type: 'SOCIAL',
    categoryName: '社交媒体病毒营销',
    title: '官博整活与超燃高光剪辑 (Viral Memes & Clips)',
    cost: 1500,
    energyCost: 10,
    fanbaseGain: 8500,
    multiplierGain: 0.08,
    description: '剪辑选手赛场极限反杀与幕后花絮梗图，引爆微博超话与B站热门热搜。',
    cooldownDays: 3,
    icon: 'Flame'
  },
  {
    id: 'social_lottery',
    type: 'SOCIAL',
    categoryName: '社交媒体病毒营销',
    title: '全网应援互动大抽奖 (Fan Super-Topic Giveaway)',
    cost: 3800,
    energyCost: 12,
    fanbaseGain: 24000,
    multiplierGain: 0.15,
    description: '官宣送出选手亲笔签名队服与全套顶级外设，全网转发突破十万次！',
    cooldownDays: 5,
    icon: 'Sparkles'
  },
  {
    id: 'social_docuseries',
    type: 'SOCIAL',
    categoryName: '社交媒体病毒营销',
    title: '战队官方纪录片《首发之路》上线 (Pro Docuseries)',
    cost: 9500,
    energyCost: 18,
    fanbaseGain: 68000,
    multiplierGain: 0.28,
    description: '纪录片全网播放量破千万，真实呈现选手的拼搏热血与心路历程，吸粉无数路人！',
    cooldownDays: 8,
    icon: 'Film'
  },

  // 2. 粉丝线下见面会 (Fan Meetups)
  {
    id: 'meetup_house_day',
    type: 'MEETUP',
    categoryName: '线下粉丝见面会',
    title: '俱乐部基地开放日 & 选手签名会 (Gaming House Fan Day)',
    cost: 5200,
    energyCost: 20,
    fanbaseGain: 35000,
    multiplierGain: 0.20,
    description: '邀请核心铁粉入驻俱乐部基地合影、打卡荣誉奖杯陈列室并共进选手特调下午茶。',
    cooldownDays: 6,
    icon: 'Home'
  },
  {
    id: 'meetup_city_tour',
    type: 'MEETUP',
    categoryName: '线下粉丝见面会',
    title: '城市商圈痛车巡游与应援快闪店 (City Pop-Up Tour)',
    cost: 14000,
    energyCost: 25,
    fanbaseGain: 95000,
    multiplierGain: 0.35,
    description: '在各大核心一线商圈设立战队应援快闪旗舰店，万人围观排队打卡！',
    cooldownDays: 10,
    icon: 'Truck'
  },
  {
    id: 'meetup_lan_party',
    type: 'MEETUP',
    categoryName: '线下粉丝见面会',
    title: '全国千人粉丝水友对抗大狂欢 (National LAN Party)',
    cost: 28000,
    energyCost: 30,
    fanbaseGain: 180000,
    multiplierGain: 0.50,
    description: '租借大型电竞场馆，全队与水友同台竞技互动，全网同步破圈热议！',
    cooldownDays: 14,
    icon: 'Users'
  },

  // 3. 全网破圈直播狂欢 (Live Streaming Events)
  {
    id: 'stream_merch_drop',
    type: 'STREAM',
    categoryName: '全网破圈直播狂欢',
    title: '联名潮牌周边首发带货直播 (Merch Apparel Drop)',
    cost: 3500,
    energyCost: 15,
    fanbaseGain: 42000,
    multiplierGain: 0.22,
    description: '全员开播首发限量款电竞队服、徽章与公仔，直播间热度瞬间登顶全网第一！',
    cooldownDays: 4,
    icon: 'ShoppingBag'
  },
  {
    id: 'stream_collab_show',
    type: 'STREAM',
    categoryName: '全网破圈直播狂欢',
    title: '选手连麦顶流主播娱乐跨界赛 (Celebrity Duo Stream Fest)',
    cost: 8000,
    energyCost: 20,
    fanbaseGain: 88000,
    multiplierGain: 0.32,
    description: '与跨圈顶流主播开黑搞怪，节目效果爆炸，粉丝群一夜涌入数万新粉丝！',
    cooldownDays: 7,
    icon: 'Radio'
  },
  {
    id: 'stream_mega_festival',
    type: 'STREAM',
    categoryName: '全网破圈直播狂欢',
    title: '赛季庆典全天候不打烊跨年狂欢 (Season Gala Mega-Stream)',
    cost: 22000,
    energyCost: 35,
    fanbaseGain: 220000,
    multiplierGain: 0.65,
    description: '全俱乐部连续24小时全景直播，全员表演才艺、连麦粉丝，达成全网最高峰在线人数奇迹！',
    cooldownDays: 14,
    icon: 'Tv'
  }
];

export const DEFAULT_COMMUNITY_RELATIONS: CommunityRelationsState = {
  fanbaseCount: 14500,
  fanbaseMultiplier: 1.00,
  totalCampaignsRun: 0,
  activeCooldowns: {},
  recentActivities: []
};

// 赛事观看实时弹幕流预设池
export const LIVE_MATCH_DANMAKU_POOL = [
  { text: '7777777777777', color: '#38BDF8', type: 'fan' },
  { text: '卧槽！这走位也能扭开的？？？神仙反应！', color: '#F87171', type: 'hype' },
  { text: '这就是通天代！一人抬着四个人往前走！', color: '#FBBF24', type: 'mvp' },
  { text: '太帅了太帅了！帅我一脸！', color: '#34D399', type: 'fan' },
  { text: '给队长磕一个！嘭嘭嘭！', color: '#F472B6', type: 'fan' },
  { text: '满屏的66666666666', color: '#E2E8F0', type: 'fan' },
  { text: '建议严查！这意识绝对装了全图雷达！', color: '#FBBF24', type: 'hype' },
  { text: '大龙坑决战打响！谁抢到谁赢！', color: '#A78BFA', type: 'caster' },
  { text: '抢到了！！！！我的天啊惩戒抢到了！', color: '#EF4444', type: 'hype' },
  { text: '团灭！！！！！ACE！！！！！', color: '#F59E0B', type: 'mvp' },
  { text: '金色的雨准备就绪！全体起立！！！', color: '#FCD34D', type: 'mvp' },
  { text: '下饭？这叫米其林三星操作！', color: '#6EE7B7', type: 'fan' },
  { text: '梦回S赛巅峰！爷青回！', color: '#93C5FD', type: 'fan' },
  { text: '兄弟们把公屏打在保护上！', color: '#E2E8F0', type: 'fan' },
  { text: '这就是世界第一俱乐部的压迫感吗？', color: '#FBBF24', type: 'fan' },
  { text: '单杀！！！对位单杀！太帅了！', color: '#F43F5E', type: 'hype' },
  { text: '丝血反杀！心脏骤停！', color: '#FB923C', type: 'hype' },
  { text: '杀疯了杀疯了！根本拦不住！', color: '#F472B6', type: 'hype' },
  { text: '稳住我们能赢！冲冲冲！', color: '#38BDF8', type: 'fan' },
  { text: '推塔推基地！我们要捧杯了！', color: '#34D399', type: 'fan' }
];

export function generatePostMatchMvp(
  matchType: 'SOLO_QUEUE' | 'STAGE_MATCH',
  champName: string,
  isWin: boolean,
  playerMech: number,
  playerMental: number
): PostMatchMvpRecord {
  const kills = isWin ? Math.floor(Math.random() * 8) + 7 : Math.floor(Math.random() * 5) + 3;
  const deaths = isWin ? Math.floor(Math.random() * 3) : Math.floor(Math.random() * 4) + 2;
  const assists = isWin ? Math.floor(Math.random() * 8) + 6 : Math.floor(Math.random() * 5) + 3;
  const kdaRatio = deaths === 0 ? kills + assists : (kills + assists) / deaths;

  let rawScore = 6.2 + kdaRatio * 0.35 + playerMech * 0.015 + playerMental * 0.01;
  if (isWin) rawScore += 1.4;
  rawScore = Math.min(10.0, Math.max(6.0, rawScore));
  const roundedScore = Math.round(rawScore * 10) / 10;

  const isMvp = isWin && (roundedScore >= 8.5 || Math.random() < 0.8);
  const isSvp = !isWin && roundedScore >= 7.6 && Math.random() < 0.5;

  let flavorKey: keyof typeof POST_MATCH_FLAVORS = 'carry_god';
  if (isSvp) {
    flavorKey = 'svp_tragic_hero';
  } else if (roundedScore >= 9.6) {
    flavorKey = Math.random() > 0.5 ? 'carry_god' : 'clutch_king';
  } else if (playerMech >= playerMental) {
    flavorKey = 'lane_dominator';
  } else {
    flavorKey = 'macro_mastermind';
  }

  const flavor = POST_MATCH_FLAVORS[flavorKey];
  const kdaStr = `${kills}/${deaths}/${assists}`;
  const damageShare = `${Math.floor(Math.random() * 15) + 32}%`;
  const killPart = `${Math.floor(Math.random() * 22) + 75}%`;

  const headline = isMvp
    ? `👑【赛后 MVP 斩获 · ${roundedScore.toFixed(1)} 分】${flavor.title}`
    : isSvp
    ? `💔【赛后 SVP 孤勇战神 · ${roundedScore.toFixed(1)} 分】${flavor.title}`
    : `⚔️【赛后表现评定 · ${roundedScore.toFixed(1)} 分】${champName} 打出稳健数据`;

  let legacyBoostAwarded: LegacyStatBoost | undefined = undefined;
  if (isMvp && (roundedScore >= 8.8 || flavorKey === 'carry_god' || flavorKey === 'clutch_king')) {
    const boostOptions: LegacyStatBoost[] = [
      { stat: 'mechanics', amount: 1, statNameCn: '永久微操上限', reason: '天神下凡极限微操，打破手速反应生理极限' },
      { stat: 'mental', amount: 1, statNameCn: '永久大心脏心态', reason: '生死绝境极限反杀，铸就钢铁般不灭斗志' },
      { stat: 'fame', amount: 3, statNameCn: '永久职业声望', reason: '全网亿万观众刷屏热议，登顶微博热搜榜首' }
    ];
    legacyBoostAwarded = boostOptions[Math.floor(Math.random() * boostOptions.length)];
  }

  return {
    matchType,
    champName,
    isWin,
    isMvp,
    isSvp,
    score: roundedScore,
    kda: kdaStr,
    damageShare,
    killParticipation: killPart,
    headline,
    casterQuote: flavor.quote,
    danmaku: flavor.danmaku,
    buffAwarded: isMvp,
    legacyBoostAwarded
  };
}

export const FANBASE_MILESTONES: FanbaseMilestone[] = [
  {
    id: 'milestone_50k',
    threshold: 50000,
    title: '5万热血铁粉 · 破晓启航',
    badge: '🌟 50K',
    bannerSkin: {
      id: 'banner_golden_dawn',
      name: '璀璨破晓 · 黄金龙纹战旗',
      tier: 'RARE',
      gradientBg: 'from-amber-700 via-yellow-600 to-amber-900',
      borderColor: 'border-amber-400',
      accentColor: 'text-amber-300',
      textColor: 'text-amber-100',
      icon: '🐉',
      description: '金纹流转的初生战旗，见证俱乐部在赛区初露峥嵘。'
    },
    specialEmote: {
      id: 'emote_takeoff',
      code: ':team_takeoff:',
      label: '战队起飞',
      emoji: '🚀',
      rarity: 'rare'
    },
    perkDescription: '赞助商周薪收益提升 +5%，直播弹幕解锁专属VIP起飞特效'
  },
  {
    id: 'milestone_100k',
    threshold: 100000,
    title: '10万顶流拥趸 · 赛博狂潮',
    badge: '⚡ 100K',
    bannerSkin: {
      id: 'banner_cyber_neon',
      name: '赛博霓虹 · 深渊青电战旗',
      tier: 'EPIC',
      gradientBg: 'from-cyan-900 via-blue-800 to-indigo-950',
      borderColor: 'border-cyan-400',
      accentColor: 'text-cyan-300',
      textColor: 'text-cyan-100',
      icon: '⚡',
      description: '全息光效交织的科技战旗，席卷全球社交网络头条。'
    },
    specialEmote: {
      id: 'emote_standup',
      code: ':stand_up:',
      label: '全体起立',
      emoji: '👑',
      rarity: 'epic'
    },
    perkDescription: '赞助商周薪收益提升 +10%，主场门票与应援周边收入翻倍'
  },
  {
    id: 'milestone_250k',
    threshold: 250000,
    title: '25万狂热拥护 · 银河战舰',
    badge: '🌌 250K',
    bannerSkin: {
      id: 'banner_galaxy_fleet',
      name: '星河璀璨 · 紫晶深空旗舰战旗',
      tier: 'EPIC',
      gradientBg: 'from-purple-900 via-fuchsia-800 to-slate-950',
      borderColor: 'border-purple-400',
      accentColor: 'text-purple-300',
      textColor: 'text-purple-100',
      icon: '🌌',
      description: '浩瀚宇宙星辰战旗，昭示不可阻挡的银河战舰横扫势头。'
    },
    specialEmote: {
      id: 'emote_god_descends',
      code: ':god_descends:',
      label: '通天代降临',
      emoji: '⚡',
      rarity: 'epic'
    },
    perkDescription: '赞助商周薪收益提升 +15%，全球转会市场巨星吸引力大增'
  },
  {
    id: 'milestone_500k',
    threshold: 500000,
    title: '50万国民王朝 · 金色的雨',
    badge: '🏆 500K',
    bannerSkin: {
      id: 'banner_immortal_gold',
      name: '不朽殿堂 · 纯金召唤师巨幕战旗',
      tier: 'LEGENDARY',
      gradientBg: 'from-amber-500 via-yellow-400 to-amber-600',
      borderColor: 'border-yellow-300',
      accentColor: 'text-yellow-950',
      textColor: 'text-slate-950',
      icon: '🏆',
      description: '登顶世界最高王座的殿堂巨幕战旗，漫天飘洒金色的雨。'
    },
    specialEmote: {
      id: 'emote_golden_rain',
      code: ':golden_rain:',
      label: '金色的雨',
      emoji: '🏆',
      rarity: 'legendary'
    },
    perkDescription: '赞助商周薪收益提升 +25%，官方转播全场焦点特写印记'
  }
];
