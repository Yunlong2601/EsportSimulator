import { FacilityUpgrade, ProPlayer, SponsorDeal } from '../types/game';

export const INITIAL_ROSTER: ProPlayer[] = [
  {
    id: 'p1',
    name: 'Vortex',
    role: 'TOP',
    country: 'KR',
    age: 19,
    mechanics: 88,
    macro: 84,
    morale: 90,
    salary: 8500,
    marketValue: 120000,
    avatar: '🛡️'
  },
  {
    id: 'p2',
    name: 'Phantom',
    role: 'JUG',
    country: 'EU',
    age: 21,
    mechanics: 86,
    macro: 90,
    morale: 88,
    salary: 9200,
    marketValue: 135000,
    avatar: '⚡'
  },
  {
    id: 'p3',
    name: 'Prodigy (You)',
    role: 'MID',
    country: 'NA',
    age: 18,
    mechanics: 95,
    macro: 92,
    morale: 95,
    salary: 15000,
    marketValue: 280000,
    avatar: '👑'
  },
  {
    id: 'p4',
    name: 'SniperAce',
    role: 'ADC',
    country: 'CN',
    age: 20,
    mechanics: 92,
    macro: 85,
    morale: 85,
    salary: 11000,
    marketValue: 190000,
    avatar: '🎯'
  },
  {
    id: 'p5',
    name: 'Oracle',
    role: 'SUP',
    country: 'KR',
    age: 22,
    mechanics: 83,
    macro: 96,
    morale: 92,
    salary: 9500,
    marketValue: 140000,
    avatar: '👁️'
  }
];

export const SCOUTING_POOL: ProPlayer[] = [
  {
    id: 'scout_1',
    name: 'Zephyr',
    role: 'TOP',
    country: 'KR',
    age: 18,
    mechanics: 94,
    macro: 88,
    morale: 95,
    salary: 14000,
    marketValue: 250000,
    avatar: '🌪️'
  },
  {
    id: 'scout_2',
    name: 'ShadowFang',
    role: 'JUG',
    country: 'CN',
    age: 19,
    mechanics: 96,
    macro: 87,
    morale: 90,
    salary: 16500,
    marketValue: 310000,
    avatar: '🐺'
  },
  {
    id: 'scout_3',
    name: 'Eclipse',
    role: 'MID',
    country: 'KR',
    age: 20,
    mechanics: 97,
    macro: 94,
    morale: 92,
    salary: 22000,
    marketValue: 450000,
    avatar: '☀️'
  },
  {
    id: 'scout_4',
    name: 'HyperGuns',
    role: 'ADC',
    country: 'EU',
    age: 19,
    mechanics: 95,
    macro: 89,
    morale: 94,
    salary: 17000,
    marketValue: 320000,
    avatar: '🔫'
  },
  {
    id: 'scout_5',
    name: 'Sanctuary',
    role: 'SUP',
    country: 'KR',
    age: 23,
    mechanics: 88,
    macro: 98,
    morale: 97,
    salary: 15000,
    marketValue: 270000,
    avatar: '🕊️'
  }
];

export const SPONSORS_CATALOG: SponsorDeal[] = [
  {
    id: 'sp_hyperx',
    name: 'HyperGear Peripherals',
    brand: 'Hardware & Headsets',
    logo: '🎧',
    weeklyPayout: 4500,
    signingBonus: 25000,
    requirement: 'Fan Hype > 5,000',
    active: false
  },
  {
    id: 'sp_redbull',
    name: 'Apex Energy Drinks',
    brand: 'Global Beverage',
    logo: '⚡',
    weeklyPayout: 9000,
    signingBonus: 60000,
    requirement: 'Fan Hype > 15,000',
    active: false
  },
  {
    id: 'sp_secretlab',
    name: 'Omega Chairs & Desks',
    brand: 'Gaming Furniture',
    logo: '🪑',
    weeklyPayout: 7000,
    signingBonus: 40000,
    requirement: 'Fan Hype > 10,000',
    active: false
  },
  {
    id: 'sp_mercedes',
    name: 'Aether Automotive Luxury',
    brand: 'Luxury Vehicle',
    logo: '🏎️',
    weeklyPayout: 22000,
    signingBonus: 180000,
    requirement: 'Fan Hype > 40,000 & Top 5 World Rank',
    active: false
  }
];

export const INITIAL_FACILITIES: FacilityUpgrade[] = [
  {
    id: 'fac_hq',
    name: 'Team Gaming House & Scrim Lab',
    tier: 1,
    maxTier: 4,
    cost: 45000,
    description: 'High-speed gigabit fiber line and ergonomic individual scrim stations.',
    effectLabel: '+10% Team Scrim Macro Growth',
    icon: '🏢'
  },
  {
    id: 'fac_data',
    name: 'AI Analytics & Meta Prediction Suite',
    tier: 1,
    maxTier: 4,
    cost: 65000,
    description: 'Deep neural network tracking opponent warding habits and draft tendencies.',
    effectLabel: '+15% Draft Advantage In Matchups',
    icon: '📊'
  },
  {
    id: 'fac_physio',
    name: 'Personal Chef & Wellness Gym',
    tier: 0,
    maxTier: 3,
    cost: 35000,
    description: 'Organic chef nutrition, massage therapy, and mental sports psychology coach.',
    effectLabel: '+20 Morale & Eliminates Fatigue',
    icon: '🥗'
  },
  {
    id: 'fac_arena',
    name: 'Broadcast Media Studio & Arena HQ',
    tier: 0,
    maxTier: 3,
    cost: 120000,
    description: 'Custom content production studio, podcast set, and fan merchandise shop.',
    effectLabel: '+40% Fan Hype & Sponsor Value',
    icon: '🎥'
  }
];

export interface OpponentTeam {
  id: string;
  name: string;
  tag: string;
  region: string;
  overallPower: number;
  playstyle: string;
  signaturePick: string;
  logo: string;
}

export const WORLDS_OPPONENTS: OpponentTeam[] = [
  {
    id: 'opp_t1',
    name: 'T1 Dynasty',
    tag: 'T1',
    region: 'LCK (Korea)',
    overallPower: 97,
    playstyle: 'Clutch Teamfighting & Macro Brilliance',
    signaturePick: 'Azir (The Unkillable Demon King)',
    logo: '🔴'
  },
  {
    id: 'opp_geng',
    name: 'Gen.G Titans',
    tag: 'GEN',
    region: 'LCK (Korea)',
    overallPower: 96,
    playstyle: 'Flawless Laning & Objective Suffocation',
    signaturePick: "K'Sante (Impenetrable Wall)",
    logo: '🟡'
  },
  {
    id: 'opp_blg',
    name: 'Bilibili Dragons',
    tag: 'BLG',
    region: 'LPL (China)',
    overallPower: 95,
    playstyle: 'Hyper-Aggressive Early Game Dive & Skirmish',
    signaturePick: 'Lee Sin (Relentless Jungle Pressure)',
    logo: '🔵'
  },
  {
    id: 'opp_g2',
    name: 'G2 Kings of Europe',
    tag: 'G2',
    region: 'LEC (Europe)',
    overallPower: 92,
    playstyle: 'Creative Pocket Picks & Level 1 Cheese',
    signaturePick: 'Yone / Yasuo Flex Drafts',
    logo: '⚔️'
  }
];
