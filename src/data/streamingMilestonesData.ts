import { StreamChannelState, StreamingMilestone, FanEmote, ChannelPerk } from '../types/game';

export const DEFAULT_STREAM_CHANNEL: StreamChannelState = {
  subscribers: 850,
  peakViewers: 1200,
  totalStreams: 0,
  unlockedMilestones: [],
  unlockedEmoteIds: [],
  activePerkIds: [],
  equippedEmoteId: null
};

export const STREAMING_MILESTONES: StreamingMilestone[] = [
  {
    id: 'milestone_1k',
    title: '千人认证主播 · 破晓启航',
    badge: '🌱 认证新星',
    subscriberReq: 1000,
    rewardMoney: 150,
    rewardFame: 2,
    perk: {
      id: 'perk_donation_boost',
      name: '【弹幕助威仪】',
      title: '商业打赏增幅',
      icon: '📣',
      subscriberReq: 1000,
      bonusSummary: '直播打赏收益 +20%，知名度收益 +1',
      effectDescription: '开启公屏粉丝专属守护灯牌与加油助威系统，点燃观众热情，单次直播打赏收益提升 20%。'
    },
    emote: {
      id: 'emote_hype_clap',
      name: '掌声雷动',
      emoji: '👏',
      code: ':hype_clap:',
      tier: 1,
      rarity: 'rare',
      description: '全员起立，满屏滚动掌声为选手的绝地操作喝彩！'
    },
    lore: '从出租屋默默无闻的单排打手，到拥有千人灯牌认证的潜力新星，聚光灯初次为你亮起！'
  },
  {
    id: 'milestone_3k',
    title: '技术流大V · 天梯名场面',
    badge: '⚡ 技术尖兵',
    subscriberReq: 3000,
    rewardMoney: 350,
    rewardFame: 3,
    perk: {
      id: 'perk_fatigue_shield',
      name: '【神级预判护盾】',
      title: '直播消耗减免',
      icon: '🛡️',
      subscriberReq: 3000,
      bonusSummary: '直播专注消耗由 -25 降为 -18，精力消耗由 -20 降为 -15',
      effectDescription: '炉火纯青的直播边打边解说节奏，大幅减缓神情倦怠，开播专注力与精力消耗减免约 28%。'
    },
    emote: {
      id: 'emote_god_hand',
      name: '神之右手',
      emoji: '⚡',
      code: ':god_hand:',
      tier: 2,
      rarity: 'rare',
      description: '毫秒级闪现反向开团，弹幕刷屏膜拜非人类微操反应！'
    },
    lore: '剪辑号疯传你的五杀集锦，无数峡谷路人因你的第一视角入坑关注！'
  },
  {
    id: 'milestone_10k',
    title: '万人白金牌面 · 银河公会新贵',
    badge: '🌟 万人牌面',
    subscriberReq: 10000,
    rewardMoney: 850,
    rewardFame: 5,
    perk: {
      id: 'perk_super_chat',
      name: '【超级弹幕 (SuperChat) 矩阵】',
      title: '高能空投打赏',
      icon: '🚀',
      subscriberReq: 10000,
      bonusSummary: '直播打赏底薪 +$160，35% 几率触发榜一火箭空投 (+$320)',
      effectDescription: '开通金色高亮置顶弹幕与舰长专属坐席，大额打赏连环轰炸，公屏常驻火箭升空特效。'
    },
    emote: {
      id: 'emote_rocket_drop',
      name: '榜一大哥火箭',
      emoji: '🚀',
      code: ':rocket_drop:',
      tier: 3,
      rarity: 'epic',
      description: '全服通报超能火箭升空，公屏特效席卷整个直播间！'
    },
    lore: '万人同时在线观战，成为各大游戏公会争相拉拢的当家头牌台柱！'
  },
  {
    id: 'milestone_30k',
    title: '金牌顶流红人 · 赛区造梗之王',
    badge: '🔥 顶流梗王',
    subscriberReq: 30000,
    rewardMoney: 1800,
    rewardFame: 8,
    perk: {
      id: 'perk_mental_resonance',
      name: '【情绪共鸣抗压磁场】',
      title: '抗压自愈光环',
      icon: '🧊',
      subscriberReq: 30000,
      bonusSummary: '直播不再扣除心态并保底 +6 心态；单排胜场额外反哺 +180 订阅',
      effectDescription: '直播间充满粉丝真爱护体，无视节奏黑粉狂喷，直播不仅不耗损心态反而能迅速回血自愈。'
    },
    emote: {
      id: 'emote_cold_master',
      name: '绝对零度',
      emoji: '🧊',
      code: ':cold_master:',
      tier: 4,
      rarity: 'epic',
      description: '逆风心如止水，冰封一切红温杂音，以绝对理智逆转乾坤！'
    },
    lore: '你的经典口头禅和对局金句席卷各大电竞论坛，成为全网争相效仿的热梗代名词！'
  },
  {
    id: 'milestone_75k',
    title: '现象级电竞巨星 · 商业虹吸',
    badge: '👑 现象巨擘',
    subscriberReq: 75000,
    rewardMoney: 4500,
    rewardFame: 12,
    perk: {
      id: 'perk_commercial_syphon',
      name: '【破圈商业虹吸法则】',
      title: '商业代言巨幅增益',
      icon: '💎',
      subscriberReq: 75000,
      bonusSummary: '经纪人所有代言分成与被动分红永久提升 +45%',
      effectDescription: '超巨级私域带货号召力，引得国际顶级超跑、潮牌与旗舰外设竞相抛出超规格商业代言肥约。'
    },
    emote: {
      id: 'emote_dynasty_crown',
      name: '封神王冠',
      emoji: '👑',
      code: ':dynasty_crown:',
      tier: 5,
      rarity: 'legendary',
      description: '金色神光加身，全网观众见证电竞新帝王诞生！'
    },
    lore: '不仅是峡谷顶尖路人王，更成为跨越电竞与潮流圈层的现象级时代超级偶像！'
  },
  {
    id: 'milestone_150k',
    title: '传奇名人堂殿堂 · 星穹主宰',
    badge: '🌌 殿堂传奇',
    subscriberReq: 150000,
    rewardMoney: 10000,
    rewardFame: 20,
    perk: {
      id: 'perk_galaxy_gravity',
      name: '【永恒星光引力】',
      title: '全维度终极神域',
      icon: '🌌',
      subscriberReq: 150000,
      bonusSummary: '单排胜场自动转化 +450 订阅与 +$100 商务提成，且微操上限突破至 105 点',
      effectDescription: '你的每一次排位拉枪都在亿万观众目光中载入电竞史册，超越人体微操极限，化身神话！'
    },
    emote: {
      id: 'emote_galaxy_ace',
      name: '星穹主宰',
      emoji: '🌌',
      code: ':galaxy_ace:',
      tier: 6,
      rarity: 'legendary',
      description: '星河璀璨至尊神光，铭刻在世界电竞名人堂巅峰的至高徽章！'
    },
    lore: '十五万铁杆拥趸汇聚为无坚不摧的星辰军团，你已是电竞史上无可替代的活传奇！'
  }
];

export function getEmoteById(emoteId?: string | null): FanEmote | undefined {
  if (!emoteId) return undefined;
  for (const m of STREAMING_MILESTONES) {
    if (m.emote.id === emoteId) return m.emote;
  }
  return undefined;
}

export function getNextMilestone(currentSubs: number): StreamingMilestone | undefined {
  return STREAMING_MILESTONES.find(m => m.subscriberReq > currentSubs);
}

export function getClaimableMilestones(channel?: StreamChannelState): StreamingMilestone[] {
  if (!channel) return [];
  const unlocked = new Set(channel.unlockedMilestones || []);
  return STREAMING_MILESTONES.filter(m => channel.subscribers >= m.subscriberReq && !unlocked.has(m.id));
}

/**
 * Calculates new subscribers, peak viewers, and perk-modified payouts from a stream
 */
export function calculateStreamOutcome(
  statsSubscribers: number,
  fame: number,
  activePerkIds: string[]
): {
  subsGain: number;
  peakViewers: number;
  donationMultiplier: number;
  bonusDonation: number;
  fatigueCostModifier: { focus: number; energy: number };
  mentalOutcomeBonus: number;
  rocketBonus: number;
} {
  const hasDonationBoost = activePerkIds.includes('perk_donation_boost');
  const hasFatigueShield = activePerkIds.includes('perk_fatigue_shield');
  const hasSuperChat = activePerkIds.includes('perk_super_chat');
  const hasMentalResonance = activePerkIds.includes('perk_mental_resonance');
  const hasCommercialSyphon = activePerkIds.includes('perk_commercial_syphon');

  // Base subscriber gain scaled by current fame and subs
  const baseSubs = Math.floor(140 + Math.random() * 180 + fame * 3.5);
  const subsGain = Math.floor(baseSubs * (hasCommercialSyphon ? 1.4 : 1.0));

  // Current peak viewers
  const peakViewers = Math.floor((statsSubscribers + subsGain) * 1.8 + Math.random() * 800 + fame * 20);

  // Donation modifiers
  let donationMultiplier = 1.0;
  if (hasDonationBoost) donationMultiplier += 0.20;
  if (hasCommercialSyphon) donationMultiplier += 0.45;

  let bonusDonation = 0;
  let rocketBonus = 0;
  if (hasSuperChat) {
    bonusDonation += 160;
    if (Math.random() < 0.35) {
      rocketBonus = 320;
    }
  }

  // Fatigue cost modifiers
  const fatigueCostModifier = {
    focus: hasFatigueShield ? -18 : -25,
    energy: hasFatigueShield ? -15 : -20
  };

  const mentalOutcomeBonus = hasMentalResonance ? 6 : (Math.random() > 0.3 ? 2 : -4);

  return {
    subsGain,
    peakViewers,
    donationMultiplier,
    bonusDonation,
    fatigueCostModifier,
    mentalOutcomeBonus,
    rocketBonus
  };
}
