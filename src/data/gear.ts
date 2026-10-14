import { GearItem } from '../types/game';

export const GEAR_CATALOG: GearItem[] = [
  {
    id: 'wooting',
    name: 'Hall-Effect Rapid Trigger Keyboard',
    cost: 180,
    category: 'Peripheral',
    mechanicsBonus: 8,
    mentalBonus: 2,
    description: '0.1mm actuation point. Your animation cancels and flash reacts are lightning fast.',
    icon: '⌨️'
  },
  {
    id: 'superlight',
    name: 'Ultralight 49g Wireless Gaming Mouse',
    cost: 150,
    category: 'Peripheral',
    mechanicsBonus: 7,
    mentalBonus: 3,
    description: 'Flawless optical sensor. Pixel-perfect skillshot accuracy.',
    icon: '🖱️'
  },
  {
    id: 'monitor_360',
    name: '360Hz OLED Esports Display',
    cost: 550,
    category: 'Hardware',
    mechanicsBonus: 12,
    mentalBonus: 5,
    description: 'Zero motion blur. Dodge incoming skillshots before opponents finish cast animations.',
    icon: '🖥️'
  },
  {
    id: 'herman_miller',
    name: 'Ergonomic Posture Gaming Throne',
    cost: 750,
    category: 'Wellness',
    mechanicsBonus: 4,
    mentalBonus: 16,
    description: 'Zero back pain after 14-hour marathon solo queue sessions.',
    icon: '🪑'
  },
  {
    id: 'coach_vod',
    name: '1-on-1 LCK Challenger Coach VOD Review',
    cost: 300,
    category: 'Coaching',
    mechanicsBonus: 6,
    mentalBonus: 12,
    description: 'Learn wave management, jungle tracking, and lane tempo from a master.',
    icon: '📋'
  },
  {
    id: 'energy_pack',
    name: 'Esports Nootropic Focus Drink Crate',
    cost: 80,
    category: 'Wellness',
    mechanicsBonus: 5,
    mentalBonus: 5,
    description: 'Clean caffeine and L-Theanine focus without caffeine jitters.',
    icon: '⚡'
  }
];
