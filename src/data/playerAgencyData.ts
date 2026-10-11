import { PlayerAgent, AgencySponsorshipDeal, PlayerAgencyState } from '../types/game';

export const PLAYER_AGENTS_CONFIG: PlayerAgent[] = [
  {
    id: 'agent_rookie',
    name: '林柯 (Lin Ke)',
    title: '新人电竞星探',
    avatar: '🧢',
    tier: 1,
    cost: 150,
    fameReq: 10,
    passivePerFame: 1.2, // 每点知名度带来 $1.2 商业分红
    sponsorshipBonusRate: 0.15, // +15% 赞助与直播溢价
    contractNegotiationRate: 0.10,
    perkName: '敏锐嗅觉',
    perkDescription: '为新人量身定制草根赞助，比赛或直播均可稳定触发被动分成。',
    bio: '曾发掘多名次级联赛黑马新星，行事务实负责，擅长为新晋路人王争取第一笔商业合作。'
  },
  {
    id: 'agent_veteran',
    name: '沈千秋 (Shen Qianqiu)',
    title: '资深金牌经纪人',
    avatar: '💼',
    tier: 2,
    cost: 480,
    fameReq: 30,
    passivePerFame: 2.8, // 每点知名度带来 $2.8 商业分红
    sponsorshipBonusRate: 0.35, // +35% 赞助与直播溢价
    contractNegotiationRate: 0.25,
    perkName: '金牌议价',
    perkDescription: '强势公关能力，大幅提高商业赞助底价与职业合同签字费。',
    bio: '深耕头部电竞俱乐部商务运作8年，熟谙一线赛事赞助谈判规则，人脉网覆盖各大知名硬件与快消大厂。'
  },
  {
    id: 'agent_elite',
    name: '赵世勋 (Zhao Shixun)',
    title: '王牌合伙人 / 资本操盘手',
    avatar: '👔',
    tier: 3,
    cost: 1100,
    fameReq: 55,
    passivePerFame: 5.0, // 每点知名度带来 $5.0 商业分红
    sponsorshipBonusRate: 0.60, // +60% 赞助与直播溢价
    contractNegotiationRate: 0.45,
    perkName: '资本杠杆',
    perkDescription: '将选手声量转化为高额品牌联名分成，被动代言收益成倍飙升。',
    bio: '华尔街投行背景的职业经理人，曾运作多起顶级巨星跨界商业代言与千万级赛事转会大单。'
  },
  {
    id: 'agent_legend',
    name: '维多利亚·陈 (Victoria Chen)',
    title: '传奇全球商业操盘巨擘',
    avatar: '👑',
    tier: 4,
    cost: 2600,
    fameReq: 80,
    passivePerFame: 9.5, // 每点知名度带来 $9.5 商业分红
    sponsorshipBonusRate: 1.00, // +100% 翻倍赞助与直播溢价
    contractNegotiationRate: 0.80,
    perkName: '全球超巨法则',
    perkDescription: '全维度商业变现帝国，解锁跨国巨头全球总代言，名气收益极速爆炸。',
    bio: '全球电竞商业榜最具影响力经纪领袖，旗下选手均位列世界名人堂，缔造跨行业超级商业神话。'
  }
];

export const AGENCY_SPONSORSHIPS_CONFIG: AgencySponsorshipDeal[] = [
  {
    id: 'sponsor_mousepad',
    brand: '极光电竞 (Aurora Gear)',
    category: '外设周边',
    logo: '🖱️',
    fameReq: 15,
    basePayout: 35,
    signingBonus: 120,
    description: '定制联名超顺滑防滑电竞鼠标垫，打排位即带货。'
  },
  {
    id: 'sponsor_energy_drink',
    brand: '狂暴脉冲能量饮 (Pulse Rush)',
    category: '功能饮料',
    logo: '⚡',
    fameReq: 25,
    basePayout: 75,
    signingBonus: 260,
    description: '高能电解质提神饮品，电竞少年开黑必备官方能量赞助。'
  },
  {
    id: 'sponsor_monitor',
    brand: '钛度视界 360Hz (Titan Optics)',
    category: '旗舰硬件',
    logo: '🖥️',
    fameReq: 45,
    basePayout: 140,
    signingBonus: 500,
    description: '职业赛事指定360Hz超高刷OLED电竞显示器，品牌露出分成。'
  },
  {
    id: 'sponsor_apparel',
    brand: '曜影机能潮牌 (Vortex Techwear)',
    category: '联名服饰',
    logo: '👟',
    fameReq: 65,
    basePayout: 240,
    signingBonus: 950,
    description: '跨界潮流电竞连帽战袍，专属选手签名联名款分成。'
  },
  {
    id: 'sponsor_luxury_auto',
    brand: '极速先锋超跑 (Apex Hypercar)',
    category: '跨界超跑',
    logo: '🏎️',
    fameReq: 85,
    basePayout: 420,
    signingBonus: 2200,
    description: '殿堂级超跑品牌电竞代言人，象征全球统治级商业价值。'
  }
];

export const DEFAULT_PLAYER_AGENCY: PlayerAgencyState = {
  hiredAgentId: null,
  signedSponsors: [],
  accumulatedPassiveIncome: 0,
  totalEarnedFromAgency: 0
};

export function getAgentById(agentId: string | null | undefined): PlayerAgent | null {
  if (!agentId) return null;
  return PLAYER_AGENTS_CONFIG.find(a => a.id === agentId) || null;
}

export function calculateAgencyActionIncome(
  agencyState: PlayerAgencyState | undefined,
  fame: number
): {
  passiveCash: number;
  bonusRate: number;
  agent: PlayerAgent | null;
  sponsorshipCash: number;
} {
  const agent = getAgentById(agencyState?.hiredAgentId);
  if (!agent) {
    return { passiveCash: 0, bonusRate: 0, agent: null, sponsorshipCash: 0 };
  }

  // Base passive income based on current Fame
  const baseFameIncome = Math.max(1, fame) * agent.passivePerFame;

  // Active sponsorships payout
  let sponsorshipCash = 0;
  if (agencyState?.signedSponsors && agencyState.signedSponsors.length > 0) {
    for (const spId of agencyState.signedSponsors) {
      const sp = AGENCY_SPONSORSHIPS_CONFIG.find(s => s.id === spId);
      if (sp) {
        sponsorshipCash += sp.basePayout * (1 + agent.sponsorshipBonusRate);
      }
    }
  }

  const totalPassive = Math.floor(baseFameIncome + sponsorshipCash);

  return {
    passiveCash: totalPassive,
    bonusRate: agent.sponsorshipBonusRate,
    agent,
    sponsorshipCash: Math.floor(sponsorshipCash)
  };
}

export const AGENCY_RECRUITS_CONFIG: import('../types/game').AgencyRecruit[] = [
  {
    id: 'recruit_lin',
    name: '林青川 (Aura)',
    role: 'MID',
    avatar: '⚡',
    age: 17,
    mechanics: 93,
    macro: 88,
    potential: 96,
    personality: '桀骜不驯',
    baseSigningBonus: 1800,
    baseCommissionRate: 0.10, // 10%
    fameReq: 15,
    preferredTactic: 'diplomatic',
    bio: '青训单排登顶的路人王中单，招牌英雄操作华丽，自信爆棚，对经纪条款极其敏锐。'
  },
  {
    id: 'recruit_bai',
    name: '白夜 (Nightfall)',
    role: 'JUG',
    avatar: '🐺',
    age: 18,
    mechanics: 89,
    macro: 92,
    potential: 94,
    personality: '谦逊务实',
    baseSigningBonus: 1400,
    baseCommissionRate: 0.10,
    fameReq: 20,
    preferredTactic: 'diplomatic',
    bio: '次级联赛场均控野率第一的控图打野，行事低调，看重经纪团队的长远职业规划与资源支持。'
  },
  {
    id: 'recruit_chiyu',
    name: '赤羽 (Vermilion)',
    role: 'ADC',
    avatar: '🏹',
    age: 18,
    mechanics: 95,
    macro: 85,
    potential: 98,
    personality: '精明逐利',
    baseSigningBonus: 2400,
    baseCommissionRate: 0.10,
    fameReq: 35,
    preferredTactic: 'cut-throat',
    bio: '现象级天才射手，下路压制力拉满，对签字费与商务条款格外看重，善于在谈判桌上极限拉扯。'
  },
  {
    id: 'recruit_tian',
    name: '铁壁 (Bastion)',
    role: 'TOP',
    avatar: '🛡️',
    age: 19,
    mechanics: 87,
    macro: 91,
    potential: 90,
    personality: '热血赤诚',
    baseSigningBonus: 1200,
    baseCommissionRate: 0.10,
    fameReq: 10,
    preferredTactic: 'aggressive',
    bio: '开团型重装上单，脾气豪爽直接，渴望踏上职业大赛舞台证明自己，崇尚强势有魄力的经纪人。'
  },
  {
    id: 'recruit_yue',
    name: '星瞳 (Starry)',
    role: 'SUP',
    avatar: '✨',
    age: 17,
    mechanics: 91,
    macro: 94,
    potential: 95,
    personality: '野心勃勃',
    baseSigningBonus: 1600,
    baseCommissionRate: 0.10,
    fameReq: 25,
    preferredTactic: 'cut-throat',
    bio: '极具大局观的指挥型辅助新星，目标直指世界赛FMVP，要求经纪团队必须具备最高规格的公关资源。'
  }
];

export interface NegotiationResult {
  outcome: 'legendary' | 'success' | 'compromise';
  finalCommissionRate: number;
  finalSigningBonus: number;
  commissionDelta: number;
  bonusDelta: number;
  dialogueHistory: { speaker: string; text: string; role: 'agent' | 'recruit' | 'system' }[];
  summary: string;
  agencyEarnedCommission: number;
}

export function simulateRecruitNegotiation(
  recruit: import('../types/game').AgencyRecruit,
  tactic: import('../types/game').NegotiationTactic,
  agent: import('../types/game').PlayerAgent | null,
  fame: number
): NegotiationResult {
  const agentBonus = agent ? agent.contractNegotiationRate : 0;
  const fameAdvantage = Math.min(0.25, fame / 200); // Up to +25% leverage from Fame

  let outcome: 'legendary' | 'success' | 'compromise' = 'success';
  let commRate = recruit.baseCommissionRate;
  let bonus = recruit.baseSigningBonus;
  const dialogueHistory: { speaker: string; text: string; role: 'agent' | 'recruit' | 'system' }[] = [];

  if (tactic === 'aggressive') {
    dialogueHistory.push({
      speaker: '经纪团队 (Agent)',
      text: `“我们手握顶级豪门公关渠道与顶级直播资源。如果你想登上顶级联赛首发，就必须接受经纪公司主导的权利架构。”`,
      role: 'agent'
    });

    if (recruit.personality === '桀骜不驯') {
      // High resistance initially
      dialogueHistory.push({
        speaker: recruit.name,
        text: `“哼，拿资源压我？整个青训营都在抢我，我可不缺下家！”`,
        role: 'recruit'
      });
      if (agentBonus + fameAdvantage >= 0.35) {
        // Breakthrough
        outcome = 'legendary';
        commRate = recruit.baseCommissionRate + 0.045; // 14.5%
        bonus = Math.floor(recruit.baseSigningBonus * 0.9);
        dialogueHistory.push({
          speaker: recruit.name,
          text: `“……算你们有魄力！合同我签了，佣金按你们说的办，但必须保证我的首发推荐通道！”`,
          role: 'recruit'
        });
      } else {
        outcome = 'compromise';
        commRate = recruit.baseCommissionRate + 0.015; // 11.5%
        bonus = Math.floor(recruit.baseSigningBonus * 1.05);
        dialogueHistory.push({
          speaker: '谈判仲裁 (Board)',
          text: `新秀态度强硬反击，双方各退一步：佣金微涨至 11.5%，签约金保持原基准。`,
          role: 'system'
        });
      }
    } else if (recruit.personality === '热血赤诚' || recruit.personality === '谦逊务实') {
      outcome = 'legendary';
      commRate = recruit.baseCommissionRate + 0.04; // 14.0%
      bonus = Math.floor(recruit.baseSigningBonus * 0.85); // Reduced bonus paid
      dialogueHistory.push({
        speaker: recruit.name,
        text: `“我明白了！能加入这样的专业团队是我的荣幸，佣金条件完全没问题，我随时准备进入基地！”`,
        role: 'recruit'
      });
    } else {
      outcome = 'success';
      commRate = recruit.baseCommissionRate + 0.035; // 13.5%
      bonus = Math.floor(recruit.baseSigningBonus * 0.9);
      dialogueHistory.push({
        speaker: recruit.name,
        text: `“在强势经纪团队庇护下，哪怕佣金提升到 ${Math.round(commRate * 100)}%，我也能接受。”`,
        role: 'recruit'
      });
    }
  } else if (tactic === 'diplomatic') {
    dialogueHistory.push({
      speaker: '经纪团队 (Agent)',
      text: `“我们追求的是休戚与共的长久伙伴关系。我们将全权为你提供法务审核、商业形象包装与心理理疗支持。”`,
      role: 'agent'
    });

    if (recruit.personality === '谦逊务实' || recruit.personality === '桀骜不驯') {
      outcome = 'legendary';
      commRate = recruit.baseCommissionRate; // 10% standard fair
      bonus = Math.floor(recruit.baseSigningBonus * (1.2 + agentBonus * 0.5)); // +20%+ bonus boost
      dialogueHistory.push({
        speaker: recruit.name,
        text: `“这才是真正的尊重！你们的规划打动了我，签约金甚至比我预想的还多，合作愉快！”`,
        role: 'recruit'
      });
    } else if (recruit.personality === '精明逐利') {
      outcome = 'success';
      commRate = recruit.baseCommissionRate - 0.01; // 9%
      bonus = Math.floor(recruit.baseSigningBonus * 1.15);
      dialogueHistory.push({
        speaker: recruit.name,
        text: `“诚意很足。佣金给我让利 1%，签约金很公道，这笔代理协议我认可了。”`,
        role: 'recruit'
      });
    } else {
      outcome = 'success';
      commRate = recruit.baseCommissionRate; // 10%
      bonus = Math.floor(recruit.baseSigningBonus * (1.1 + agentBonus * 0.3));
      dialogueHistory.push({
        speaker: recruit.name,
        text: `“温和专业的规划让我倍感踏实，正式签约生效！”`,
        role: 'recruit'
      });
    }
  } else {
    // cut-throat (绝情博弈)
    dialogueHistory.push({
      speaker: '经纪团队 (Agent)',
      text: `“要么签署这份高阶经纪代理独家排他合约，要么眼睁睁看着其他新秀拿走各大战队的试训推荐名额。选吧。”`,
      role: 'agent'
    });

    if (recruit.personality === '精明逐利' || recruit.personality === '野心勃勃') {
      if (agentBonus + fameAdvantage >= 0.4) {
        outcome = 'legendary';
        commRate = recruit.baseCommissionRate + 0.07; // 17% massive commission
        bonus = Math.floor(recruit.baseSigningBonus * 0.7); // -30% bonus
        dialogueHistory.push({
          speaker: recruit.name,
          text: `“……好狠的手段！但我看重你们能把事情做绝的实力，17% 佣金我认了，我要的是冠军和曝光！”`,
          role: 'recruit'
        });
      } else {
        outcome = 'compromise';
        commRate = recruit.baseCommissionRate + 0.03; // 13%
        bonus = Math.floor(recruit.baseSigningBonus * 0.85);
        dialogueHistory.push({
          speaker: recruit.name,
          text: `“别把人逼得太紧！我各让一步，佣金抽成上限设在 13%，否则免谈。”`,
          role: 'recruit'
        });
      }
    } else {
      outcome = 'success';
      commRate = recruit.baseCommissionRate + 0.06; // 16%
      bonus = Math.floor(recruit.baseSigningBonus * 0.75); // -25%
      dialogueHistory.push({
        speaker: recruit.name,
        text: `“……在残酷的电竞资本面前，我别无选择。协议达成，佣金设定为 ${Math.round(commRate * 100)}%。”`,
        role: 'recruit'
      });
    }
  }

  // Calculate agency immediate take: commission calculated on signing bonus + recruit contract base
  const agencyCommissionEarned = Math.floor(bonus * commRate);

  const summary =
    outcome === 'legendary'
      ? `🏆【绝佳博弈契约】成功运用【${tactic === 'aggressive' ? '强势施压' : tactic === 'diplomatic' ? '外交温和' : '绝情博弈'}】策略压制谈判全场！经纪佣金锁定为 ${(commRate * 100).toFixed(1)}%，最终签约金 $${bonus.toLocaleString()}！`
      : outcome === 'success'
      ? `✅【谈判圆满达成】运用【${tactic === 'aggressive' ? '强势施压' : tactic === 'diplomatic' ? '外交温和' : '绝情博弈'}】策略达成共识，最终佣金 ${(commRate * 100).toFixed(1)}%，签约金 $${bonus.toLocaleString()}。`
      : `⚖️【势均力敌妥协】双方激烈交锋后互有让步，最终以佣金 ${(commRate * 100).toFixed(1)}%、签约金 $${bonus.toLocaleString()} 敲定协议。`;

  return {
    outcome,
    finalCommissionRate: commRate,
    finalSigningBonus: bonus,
    commissionDelta: commRate - recruit.baseCommissionRate,
    bonusDelta: bonus - recruit.baseSigningBonus,
    dialogueHistory,
    summary,
    agencyEarnedCommission: agencyCommissionEarned
  };
}
