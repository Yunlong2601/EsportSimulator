import { PlayerTrait } from '../types/game';

export const PLAYER_TRAITS_DATABASE: PlayerTrait[] = [
  {
    id: 'lane_bully',
    name: '线霸压制',
    nameEn: 'Lane Bully',
    desc: '对线期压迫感拉满，前10分钟击杀率提升25%，压刀率大幅上升。',
    icon: '⚔️',
    color: 'from-amber-500 to-rose-500',
    bonusDesc: '前期对线对局评分+15%，第一滴血发生率加倍'
  },
  {
    id: 'ice_veins',
    name: '大心脏冷酷',
    nameEn: 'Cold Blooded',
    desc: '身处逆风或晋级赛绝境时心态永不崩溃，反打胜率逆势暴涨。',
    icon: '🧊',
    color: 'from-cyan-500 to-blue-600',
    bonusDesc: '逆风翻盘率+20%，心态属性消耗降低30%'
  },
  {
    id: 'clutch_cleaner',
    name: '残局收割机',
    nameEn: 'Clutch Cleaner',
    desc: '团战残局嗅觉敏锐，擅长利用位移与平A刷新击杀达成收割。',
    icon: '🌪️',
    color: 'from-purple-500 to-pink-500',
    bonusDesc: '决胜团战四杀/五杀概率+35%，微操结算额外+2'
  },
  {
    id: 'shotcaller',
    name: '战术指挥中枢',
    nameEn: 'Macro Shotcaller',
    desc: '具备老练的地图视野与转线大局观，峡谷先锋与小龙争夺胜率提升。',
    icon: '🧠',
    color: 'from-emerald-500 to-teal-600',
    bonusDesc: '大龙/远古龙决策成功率+25%，队伍经济领先积累加快'
  },
  {
    id: 'one_trick_god',
    name: '绝活哥本命',
    nameEn: 'Signature Specialist',
    desc: '专精本命英雄时爆发潜能，连胜跳段积分奖励增加。',
    icon: '⚡',
    color: 'from-yellow-400 to-amber-600',
    bonusDesc: '连胜状态下排位额外+5 LP，球探关注度增长加速'
  }
];

export interface SoloMatchPlayByPlay {
  minute: number;
  phase: 'LANING' | 'MID_GAME' | 'LATE_CLUTCH';
  headline: string;
  narrative: string;
  type: 'kill' | 'objective' | 'clutch' | 'teamfight' | 'caster';
  playerSide: boolean;
}

export interface TacticalBranchDecision {
  minute: number;
  prompt: string;
  context: string;
  options: {
    label: string;
    sub: string;
    risk: 'Low' | 'Medium' | 'High';
    statBonusPct: number;
    favorsTrait?: string;
  }[];
}
