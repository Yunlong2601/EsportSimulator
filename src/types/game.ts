export type GamePhase = 1 | 2 | 3;

export type RankTier = 
  | 'Iron' 
  | 'Bronze' 
  | 'Silver' 
  | 'Gold' 
  | 'Platinum' 
  | 'Emerald' 
  | 'Diamond' 
  | 'Master' 
  | 'Grandmaster' 
  | 'Challenger';

export interface ProGearSkin {
  id: string;
  name: string;
  category: 'Mouse' | 'Keyboard' | 'Monitor' | 'Headset' | 'Jersey';
  rarity: 'RARE' | 'EPIC' | 'LEGENDARY';
  icon: string;
  glowColor: string;
  mechanicsBonus: number;
  mentalBonus: number;
  desc: string;
}

export interface LoginStreakDay {
  day: number;
  rewardLp: number;
  rewardCash?: number;
  proGearSkin?: ProGearSkin;
  claimed: boolean;
}

export interface LoginStreakState {
  currentStreak: number;
  lastClaimDate: string;
  canClaimToday: boolean;
  unlockedSkins: ProGearSkin[];
  equippedSkinId?: string;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'WIN_GAMES' | 'VOD_REVIEWS' | 'STREAMS' | 'REFLEX_DUELS' | 'WIN_STREAK';
  target: number;
  current: number;
  rewardLp: number;
  rewardMoney?: number;
  rewardFame?: number;
  claimed: boolean;
  icon: string;
}

export interface PlayerStats {
  lp: number;
  rankTier: RankTier;
  mechanics: number; // 0 - 100
  mental: number; // 0 - 100
  energy: number; // 0 - 100
  money: number;
  fame: number; // 0 - 100
  winStreak: number;
  totalGames: number;
  wins: number;
  losses: number;
  ownedGear: string[];
  activeTitle?: string | null;
  reflexWins?: number;
}

export interface SoloQueueEvent {
  id: string;
  title: string;
  scenario: string;
  contextTag: string;
  options: {
    label: string;
    description: string;
    risk: 'Low' | 'Medium' | 'High';
    mechanicsReq?: number;
    mentalReq?: number;
    execute: (stats: PlayerStats) => {
      success: boolean;
      log: string;
      lpDelta: number;
      mechanicsDelta: number;
      mentalDelta: number;
      fameDelta: number;
      moneyDelta?: number;
    };
  }[];
}

export interface Champion {
  id: string;
  name: string;
  role: 'TOP' | 'JUG' | 'MID' | 'ADC' | 'SUP';
  icon: string;
  archetype: 'Dive/Assassin' | 'Control Mage' | 'Hypercarry' | 'Engage Tank' | 'Enchanter' | 'Splitpusher' | 'Poke';
  tier: 'S+' | 'S' | 'A' | 'B';
  power: number; // 70-98
  counters: string[]; // Champion IDs this counters
  counteredBy: string[]; // Champion IDs this gets countered by
  signatureMove: string;
}

export interface DraftState {
  stage: 'BAN_1' | 'PICK_1' | 'BAN_2' | 'PICK_2' | 'FINISHED';
  currentTurn: 'PLAYER' | 'ENEMY';
  playerPicks: (Champion | null)[]; // 5 roles: TOP, JUG, MID, ADC, SUP
  enemyPicks: (Champion | null)[];
  playerBans: Champion[];
  enemyBans: Champion[];
  selectedRoleIndex: number; // 0-4
}

export interface MatchSimulationLog {
  id: string;
  minute: number;
  text: string;
  type: 'kill' | 'objective' | 'teamfight' | 'clutch' | 'baron' | 'caster';
  playerTeamScoreDelta?: number;
  enemyTeamScoreDelta?: number;
}

export interface ProPlayer {
  id: string;
  name: string;
  role: 'TOP' | 'JUG' | 'MID' | 'ADC' | 'SUP';
  country: string;
  age: number;
  mechanics: number;
  macro: number;
  morale: number;
  salary: number;
  marketValue: number;
  avatar: string;
}

export interface SponsorDeal {
  id: string;
  name: string;
  brand: string;
  logo: string;
  weeklyPayout: number;
  signingBonus: number;
  requirement: string;
  active: boolean;
}

export interface FacilityUpgrade {
  id: string;
  name: string;
  tier: number;
  maxTier: number;
  cost: number;
  description: string;
  effectLabel: string;
  icon: string;
}

export interface DynastyState {
  budget: number;
  weeklyExpenses: number;
  fanHype: number;
  worldRanking: number;
  reputation: number; // 0-100
  roster: ProPlayer[];
  activeSponsors: SponsorDeal[];
  facilities: FacilityUpgrade[];
  worldsProgress: {
    round: 'Quarterfinals' | 'Semifinals' | 'Grand Finals' | 'Champion';
    matchesWon: number;
    matchesLost: number;
  };
}

export interface GearItem {
  id: string;
  name: string;
  cost: number;
  category: 'Peripheral' | 'Hardware' | 'Coaching' | 'Wellness';
  mechanicsBonus: number;
  mentalBonus: number;
  description: string;
  icon: string;
}

export interface PatchNote {
  version: string;
  headline: string;
  description: string;
  changes: {
    champId: string;
    champName: string;
    type: 'BUFF' | 'NERF' | 'REWORK';
    changeText: string;
    powerDelta: number;
  }[];
}

export interface PlayerPerformance {
  role: 'TOP' | 'JUG' | 'MID' | 'ADC' | 'SUP';
  champName: string;
  champIcon: string;
  playerName: string;
  kills: number;
  deaths: number;
  assists: number;
  damageDealt: number;
  cs: number;
  rating: number; // 0 - 10.0
}

export interface SocialPost {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  badge?: string;
  platform: string;
  content: string;
  likes: string;
  retweets?: string;
  timeAgo: string;
}

export interface ReflexDuel {
  opponentChamp: string;
  opponentRole: string;
  spellName: string;
  reactionTimeLimitMs: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'CHALLENGER';
}

export type MilestoneCategory = 'ALL' | 'SOLO_QUEUE' | 'CLUTCH_COMBAT' | 'STAGE_PRO' | 'DYNASTY_TYCOON';

export interface CareerMilestone {
  id: string;
  title: string;              // 中文专属称号 (例如: '单排之神', '残局大师')
  titleEn: string;            // 英文副标题 (e.g., 'Solo Queue God', 'Clutch Artist')
  category: MilestoneCategory;
  rarity: 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';
  description: string;        // 成就背景故事与达成说明
  statRequirementText: string;// 达成条件文本 (例如: "单排天梯积分达到 1,000 LP (王者)")
  statKey: 'lp' | 'wins' | 'winStreak' | 'mechanics' | 'mental' | 'money' | 'reflexWins' | 'worldsWon' | 'gearCount' | 'reputation';
  targetValue: number;
  currentValue?: number;
  unlocked: boolean;
  claimed: boolean;
  rewardLp?: number;
  rewardMoney?: number;
  rewardFame?: number;
  titleBonusDesc: string;     // 佩戴称号获得的实机属性增益 (例如: "全模式微操+3，单排胜场额外+15% LP")
}


