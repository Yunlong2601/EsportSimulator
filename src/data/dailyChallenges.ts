import { DailyChallenge } from '../types/game';

export const INITIAL_DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: 'dc_win3',
    title: '排位冲分大师',
    description: '在单双排中赢下 3 场胜利，证明你的上分统治力。',
    type: 'WIN_GAMES',
    target: 3,
    current: 1,
    rewardLp: 45,
    rewardMoney: 60,
    claimed: false,
    icon: '🏆'
  },
  {
    id: 'dc_vod2',
    title: '赛事战术复盘',
    description: '深入钻研 2 场顶级职业选手比赛录像，提高大局观与意识。',
    type: 'VOD_REVIEWS',
    target: 2,
    current: 0,
    rewardLp: 25,
    rewardMoney: 30,
    claimed: false,
    icon: '📋'
  },
  {
    id: 'dc_duel1',
    title: '极限反应之王',
    description: '成功完成一次 1v1 闪现极限微操对决。',
    type: 'REFLEX_DUELS',
    target: 1,
    current: 0,
    rewardLp: 35,
    rewardFame: 5,
    claimed: false,
    icon: '⚡'
  },
  {
    id: 'dc_stream1',
    title: '人气主播集训',
    description: '开启一场高能排位冲分直播，收获粉丝打赏与人气知名度。',
    type: 'STREAMS',
    target: 1,
    current: 0,
    rewardLp: 20,
    rewardMoney: 80,
    claimed: false,
    icon: '🎙️'
  }
];
