import { PlayerRivalryState, RivalryClashLog, TrackedOpponent } from '../types/game';

export const DEFAULT_TRACKED_OPPONENTS: TrackedOpponent[] = [
  {
    id: 'cold_blade',
    name: '顾寒舟',
    handle: 'ColdBlade',
    title: '峡谷第一刺客 · 绝活路人王',
    avatar: '🥷',
    role: 'MID',
    signatureChamp: '影流之主 (劫)',
    encountersCount: 3,
    playerWins: 2,
    rivalWins: 1,
    isNemesis: true,
    bountyLp: 15
  },
  {
    id: 'nightfall',
    name: '夜神月',
    handle: 'Nightfall',
    title: '韩服千分狙击手 · 凶狠上单',
    avatar: '⚔️',
    role: 'TOP',
    signatureChamp: '无双剑姬 (菲奥娜)',
    encountersCount: 2,
    playerWins: 1,
    rivalWins: 1,
    isNemesis: true,
    bountyLp: 12
  },
  {
    id: 'berserk_wei',
    name: '狂暴阿伟',
    handle: 'BerserkWei',
    title: '绝食流反野狂人 · 暴躁打野',
    avatar: '🐺',
    role: 'JUG',
    signatureChamp: '盲僧 (李青)',
    encountersCount: 2,
    playerWins: 1,
    rivalWins: 1,
    isNemesis: true,
    bountyLp: 12
  },
  {
    id: 'frost_gemini',
    name: '冰霜双子',
    handle: 'FrostGemini',
    title: '高分车队绝活下路 · 稳健双人组',
    avatar: '🏹',
    role: 'ADC',
    signatureChamp: '探险家 (伊泽瑞尔)',
    encountersCount: 1,
    playerWins: 1,
    rivalWins: 0,
    isNemesis: false,
    bountyLp: 8
  }
];

export const DEFAULT_PLAYER_RIVALRY: PlayerRivalryState = {
  rivalId: 'cold_blade',
  rivalName: '顾寒舟',
  rivalHandle: 'ColdBlade',
  rivalTitle: '峡谷第一刺客 · 绝活路人王',
  rivalAvatar: '🥷',
  signatureChamp: '影流之主 (劫)',
  playerWins: 1,
  rivalWins: 1,
  tension: 25,
  tensionStage: 'rival_budding',
  lastClashOutcome: null,
  rivalStatusQuote: '“天梯高分局就这么大，别让我逮到你落单。”',
  clashHistory: [
    {
      id: 'clash_init_1',
      timestamp: '19:42',
      outcome: 'rival_win',
      scoreSnapshot: '0 - 1',
      tensionAfter: 15,
      flavorText: '天梯首度狭路相逢！顾寒舟操刀影流之主卡视野三影齐飞秒杀你，公屏打出【就这？】',
      rivalQuote: '“操作变形了兄弟，这分我笑纳了。”',
      rivalAction: '在全屏公屏亮出提莫点赞表情。'
    },
    {
      id: 'clash_init_2',
      timestamp: '21:15',
      outcome: 'player_win',
      scoreSnapshot: '1 - 1',
      tensionAfter: 25,
      flavorText: '次局再度撞车！你极限反向闪现躲其瞬狱影杀阵并完成塔下反杀，扳平比分！',
      rivalQuote: '“走位挺贼，下把最好别让我再排到你。”',
      rivalAction: '赛后秒退房间，个性签名改为【专注猎杀】。'
    }
  ],
  snipeQueueActive: false,
  trackedOpponents: DEFAULT_TRACKED_OPPONENTS,
  nemesisBonusLp: 15
};

export function getTensionStageTitle(stage: PlayerRivalryState['tensionStage']): {
  title: string;
  badgeClass: string;
  flameIconCount: number;
} {
  switch (stage) {
    case 'rival_legendary':
      return {
        title: '👑 绝代双骄 · 终极宿命对决',
        badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse',
        flameIconCount: 4
      };
    case 'rival_nemesis':
      return {
        title: '💥 一生之敌 · 宿命仇怨爆发',
        badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse',
        flameIconCount: 3
      };
    case 'rival_intense':
      return {
        title: '🔥 针锋相对 · 火药味急剧升温',
        badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        flameIconCount: 2
      };
    default:
      return {
        title: '⚔️ 初试锋芒 · 宿怨渐起',
        badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        flameIconCount: 1
      };
  }
}

export function evaluateTensionStage(tension: number): PlayerRivalryState['tensionStage'] {
  if (tension >= 85) return 'rival_legendary';
  if (tension >= 60) return 'rival_nemesis';
  if (tension >= 35) return 'rival_intense';
  return 'rival_budding';
}

/**
 * Generates dynamic flavor text, quotes, and behavioral reactions
 * based on ongoing match outcome and head-to-head tension history.
 */
export function generateRivalryClashNarrative(
  isWin: boolean,
  current: PlayerRivalryState
): {
  flavorText: string;
  rivalQuote: string;
  rivalAction: string;
  tensionDelta: number;
  bonusFameDelta: number;
  bonusMoneyDelta: number;
} {
  const nextPlayerWins = current.playerWins + (isWin ? 1 : 0);
  const nextRivalWins = current.rivalWins + (isWin ? 0 : 1);
  const currentTension = current.tension;

  if (isWin) {
    if (currentTension >= 80) {
      return {
        flavorText: `👑 【绝代双骄 · 终极加冕】天梯天王山生死战彻底击溃宿敌【顾寒舟 (ColdBlade)】！双方打满35分钟贡献教科书级极限对拼与心理博弈，全网观战主播齐声惊呼封神！各大职业战队球探已将两人的名字并列记录于首发引援名册！(比分: 玩家 ${nextPlayerWins} - ${nextRivalWins} 顾寒舟)`,
        rivalQuote: `“能在天梯遇到你这样的一生之敌，是我的荣幸。职业赛场见，届时我不会再输一分。”`,
        rivalAction: `顾寒舟在直播间公开发布致敬动态，并向你投递了双雄点赞认证。`,
        tensionDelta: 10,
        bonusFameDelta: 6,
        bonusMoneyDelta: 300
      };
    } else if (currentTension >= 55) {
      return {
        flavorText: `💥 【宿命对决 · 绝地碾压】万众瞩目的天梯焦点之局！你顶住顾寒舟四次刺杀gank，残血反秀将其斩落马下并推平敌方水晶！顾寒舟红温破防，公屏连发三串问号【???】！(比分: 玩家 ${nextPlayerWins} - ${nextRivalWins} 顾寒舟)`,
        rivalQuote: `“算你有种，这局野区被你预判到了。加个好友，改天敢不敢来单挑？”`,
        rivalAction: `怒退赛后结算界面，游戏个人签名改为【闭关特训，誓报一箭之仇】。`,
        tensionDelta: 15,
        bonusFameDelta: 4,
        bonusMoneyDelta: 180
      };
    } else if (currentTension >= 30) {
      return {
        flavorText: `🔥 【宿怨交锋 · 强势复仇】与宿敌【顾寒舟 (ColdBlade)】爆发激烈摩擦！你操刀英雄中路抢先升6闪现点燃完成对线单杀，终结其全图节奏！赛后天梯频道热议你的高光集锦！(比分: 玩家 ${nextPlayerWins} - ${nextRivalWins} 顾寒舟)`,
        rivalQuote: `“连续被你算计两波...行，这把你的微操确实压了我一头。”`,
        rivalAction: `在峡谷对局复盘中反复回放你的单杀第一视角寻找破绽。`,
        tensionDelta: 12,
        bonusFameDelta: 3,
        bonusMoneyDelta: 100
      };
    } else {
      return {
        flavorText: `⚔️ 【天梯撞车 · 斩获小胜】排位巧遇宿敌【顾寒舟 (ColdBlade)】！团战中你精准锁定其走位完成击杀，阻断其滚雪球之势，夺得对局胜利。(比分: 玩家 ${nextPlayerWins} - ${nextRivalWins} 顾寒舟)`,
        rivalQuote: `“阵容克制而已。别高兴太早，下把最好祈祷别再撞到我。”`,
        rivalAction: `公屏敲出【gg】，立刻秒排进入下一场天梯队列。`,
        tensionDelta: 10,
        bonusFameDelta: 2,
        bonusMoneyDelta: 60
      };
    }
  } else {
    // Loss to rival
    if (currentTension >= 80) {
      return {
        flavorText: `👑 【绝代双骄 · 棋差半招】与【顾寒舟 (ColdBlade)】鏖战38分钟神仙拉扯！终局龙坑决战被其鬼魅刺客极限换命抢下远古龙，遗憾告负！顾寒舟赛后在公屏打字真诚致意。(比分: 玩家 ${nextPlayerWins} - ${nextRivalWins} 顾寒舟)`,
        rivalQuote: `“GG WP！这局是我今年在峡谷打得最过瘾的一把对决，你值得所有掌声。下次我等你赢回来。”`,
        rivalAction: `在天梯战报页面为你点亮【强劲对手】金标勋章。`,
        tensionDelta: 8,
        bonusFameDelta: 2,
        bonusMoneyDelta: 0
      };
    } else if (currentTension >= 55) {
      return {
        flavorText: `💥 【宿命压制 · 惨痛挫败】顾寒舟在关键战局中展现恐怖刺客压制力！全场游走收割打崩三路，并在击杀你后亮出专属嘲讽大拇指！赛后弹幕黑粉疯狂带节奏！(比分: 玩家 ${nextPlayerWins} - ${nextRivalWins} 顾寒舟)`,
        rivalQuote: `“在天梯榜首待太久，你的警惕心退步了。想赢我，回去练好基本功再来吧。”`,
        rivalAction: `在电竞贴吧截图发帖【今天给某位新晋红人上了一课】，引发数百跟帖。`,
        tensionDelta: 18,
        bonusFameDelta: 0,
        bonusMoneyDelta: 0
      };
    } else if (currentTension >= 30) {
      return {
        flavorText: `🔥 【宿怨加剧 · 遗憾吞败】中野联动遭宿敌【顾寒舟 (ColdBlade)】彻底粉碎！被其卡视野影分身秒杀后丢掉大龙，公屏被敌方无情嘲讽，战火硝烟愈演愈烈！(比分: 玩家 ${nextPlayerWins} - ${nextRivalWins} 顾寒舟)`,
        rivalQuote: `“操作变形了兄弟，关键局就手抖？这分我就不客气地收下了。”`,
        rivalAction: `在对局公屏持续刷出【问号 ?】，并向你发送了排位加好友约战申请。`,
        tensionDelta: 14,
        bonusFameDelta: 0,
        bonusMoneyDelta: 0
      };
    } else {
      return {
        flavorText: `⚔️ 【天梯受挫 · 宿怨初结】在排位中被宿敌【顾寒舟 (ColdBlade)】针对埋伏！下路小规模团战被其收割，输掉对局，天梯胜点缩水。(比分: 玩家 ${nextPlayerWins} - ${nextRivalWins} 顾寒舟)`,
        rivalQuote: `“路人王？就这水平？连我的影子都摸不到。”`,
        rivalAction: `在公屏打出【EZ WIN】，神态嚣张。`,
        tensionDelta: 12,
        bonusFameDelta: 0,
        bonusMoneyDelta: 0
      };
    }
  }
}
