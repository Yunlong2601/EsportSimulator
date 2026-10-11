import { FacilityUpgrade, ProPlayer, SponsorDeal } from '../types/game';

export const INITIAL_ROSTER: ProPlayer[] = [
  {
    id: 'p1',
    name: 'Vortex',
    role: 'TOP',
    country: '中国',
    age: 19,
    mechanics: 88,
    macro: 84,
    morale: 90,
    salary: 8500,
    marketValue: 120000,
    avatar: '🛡️',
    playstyle: 'Aggressive',
    agencyName: '星域先锋互娱 (Starfield Vanguard)',
    contractYears: 2,
    buyoutClause: 120000
  },
  {
    id: 'p2',
    name: 'Phantom',
    role: 'JUG',
    country: '中国',
    age: 21,
    mechanics: 86,
    macro: 90,
    morale: 88,
    salary: 9200,
    marketValue: 135000,
    avatar: '⚡',
    playstyle: 'Aggressive',
    agencyName: '极速巅峰体育经纪 (Apex Velocity)',
    contractYears: 1,
    buyoutClause: 135000
  },
  {
    id: 'p3',
    name: '宿命先锋 (你)',
    role: 'MID',
    country: '中国',
    age: 18,
    mechanics: 95,
    macro: 92,
    morale: 95,
    salary: 15000,
    marketValue: 280000,
    avatar: '👑',
    playstyle: 'Aggressive',
    agencyName: '传奇盛典经纪公司 (Apex Legacy Agency)',
    contractYears: 3,
    buyoutClause: 280000
  },
  {
    id: 'p4',
    name: 'SniperAce',
    role: 'ADC',
    country: '中国',
    age: 20,
    mechanics: 92,
    macro: 85,
    morale: 85,
    salary: 11000,
    marketValue: 190000,
    avatar: '🎯',
    playstyle: 'Macro-Oriented',
    agencyName: '神盾智胜体育 (Aegis Esports Mgmt)',
    contractYears: 2,
    buyoutClause: 190000
  },
  {
    id: 'p5',
    name: 'Oracle',
    role: 'SUP',
    country: '中国',
    age: 22,
    mechanics: 83,
    macro: 96,
    morale: 92,
    salary: 9500,
    marketValue: 140000,
    avatar: '👁️',
    playstyle: 'Macro-Oriented',
    agencyName: '全球星耀文娱 (Global Star Agency)',
    contractYears: 1,
    buyoutClause: 140000
  }
];

export const SCOUTING_POOL: ProPlayer[] = [
  {
    id: 'scout_1',
    name: 'Zephyr (清风)',
    role: 'TOP',
    country: '中国',
    age: 18,
    mechanics: 94,
    macro: 88,
    morale: 95,
    salary: 14000,
    marketValue: 250000,
    avatar: '🌪️',
    playstyle: 'Aggressive',
    agencyName: '极速巅峰体育经纪 (Apex Velocity)',
    contractYears: 2,
    buyoutClause: 250000
  },
  {
    id: 'scout_2',
    name: 'ShadowFang (暗影牙)',
    role: 'JUG',
    country: '中国',
    age: 19,
    mechanics: 96,
    macro: 87,
    morale: 90,
    salary: 16500,
    marketValue: 310000,
    avatar: '🐺',
    playstyle: 'Aggressive',
    agencyName: '幽影电竞合伙人 (Shadow Partnership)',
    contractYears: 3,
    buyoutClause: 310000
  },
  {
    id: 'scout_3',
    name: 'Eclipse (日蚀)',
    role: 'MID',
    country: '中国',
    age: 20,
    mechanics: 97,
    macro: 94,
    morale: 92,
    salary: 22000,
    marketValue: 450000,
    avatar: '☀️',
    playstyle: 'Clutch',
    agencyName: '全球星耀文娱 (Global Star Agency)',
    contractYears: 2,
    buyoutClause: 450000
  },
  {
    id: 'scout_4',
    name: 'HyperGuns (重炮手)',
    role: 'ADC',
    country: '中国',
    age: 19,
    mechanics: 95,
    macro: 89,
    morale: 94,
    salary: 17000,
    marketValue: 320000,
    avatar: '🔫',
    playstyle: 'Aggressive',
    agencyName: '烈焰竞技经纪公司 (Blaze Sports Group)',
    contractYears: 1,
    buyoutClause: 320000
  },
  {
    id: 'scout_5',
    name: 'Sanctuary (圣灵守护)',
    role: 'SUP',
    country: '中国',
    age: 23,
    mechanics: 88,
    macro: 98,
    morale: 97,
    salary: 15000,
    marketValue: 270000,
    avatar: '🕊️',
    playstyle: 'Macro-Oriented',
    agencyName: '神盾智胜体育 (Aegis Esports Mgmt)',
    contractYears: 2,
    buyoutClause: 270000
  }
];

export const SPONSORS_CATALOG: SponsorDeal[] = [
  {
    id: 'sp_hyperx',
    name: '极客先锋 · 竞技外设赞助',
    brand: '电竞外设与声学耳机',
    logo: '🎧',
    weeklyPayout: 4500,
    signingBonus: 25000,
    requirement: '粉丝狂热度 > 5,000',
    active: false
  },
  {
    id: 'sp_redbull',
    name: '红牛能量 · 巅峰红牛饮品',
    brand: '国际能量功能饮料',
    logo: '⚡',
    weeklyPayout: 9000,
    signingBonus: 60000,
    requirement: '粉丝狂热度 > 15,000',
    active: false
  },
  {
    id: 'sp_secretlab',
    name: '欧米茄 · 人体工学电竞座驾',
    brand: '奢华电竞座舱工坊',
    logo: '🪑',
    weeklyPayout: 7000,
    signingBonus: 40000,
    requirement: '粉丝狂热度 > 10,000',
    active: false
  },
  {
    id: 'sp_mercedes',
    name: '星徽豪车 · 极速奢华尊享',
    brand: '世界级奢华超跑座驾',
    logo: '🏎️',
    weeklyPayout: 22000,
    signingBonus: 180000,
    requirement: '粉丝狂热度 > 40,000 且 全球战队前5',
    active: false
  }
];

import { syncInfrastructureFacilities } from './infrastructureData';

export const INITIAL_FACILITIES: FacilityUpgrade[] = syncInfrastructureFacilities();

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
    name: 'T1 永恒王朝',
    tag: 'T1',
    region: 'LCK (韩国赛区)',
    overallPower: 97,
    playstyle: '绝境团战配合与无懈可击的大局观运营',
    signaturePick: '阿兹尔 (不死大魔王沙皇)',
    logo: '🔴'
  },
  {
    id: 'opp_geng',
    name: 'Gen.G 泰坦巨神',
    tag: 'GEN',
    region: 'LCK (韩国赛区)',
    overallPower: 96,
    playstyle: '极致对线压制力与滴水不漏的野区窒息节奏',
    signaturePick: '奎桑提 (叹息之墙)',
    logo: '🟡'
  },
  {
    id: 'opp_blg',
    name: 'BLG 狂潮蛟龙',
    tag: 'BLG',
    region: 'LPL (中国赛区)',
    overallPower: 95,
    playstyle: '极具进攻性的前期越塔强杀与连续小规模团战',
    signaturePick: '李青 (野区雷霆掌控者)',
    logo: '🔵'
  },
  {
    id: 'opp_g2',
    name: 'G2 欧洲霸主',
    tag: 'G2',
    region: 'LEC (欧洲赛区)',
    overallPower: 92,
    playstyle: '天马行空的黑科技摇摆选角与1级入侵设计',
    signaturePick: '永恩 / 亚索 快乐风男双刃流',
    logo: '⚔️'
  }
];
