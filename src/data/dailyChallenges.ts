import { DailyChallenge } from '../types/game';

export const INITIAL_DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: 'dc_win3',
    title: 'Grind Master',
    description: 'Win 3 Solo Queue games today to prove your consistency.',
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
    title: 'VOD Analyst',
    description: 'Study 2 Pro VOD replays to sharpen macro map awareness.',
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
    title: 'Reflex King',
    description: 'Successfully complete a 1v1 Reflex Duel outplay.',
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
    title: 'Content Creator',
    description: 'Host a Twitch Bootcamp stream session for your fans.',
    type: 'STREAMS',
    target: 1,
    current: 0,
    rewardLp: 20,
    rewardMoney: 80,
    claimed: false,
    icon: '🎙️'
  }
];
