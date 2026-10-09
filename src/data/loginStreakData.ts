import { LoginStreakDay, ProGearSkin } from '../types/game';

export const PRO_GEAR_SKINS: Record<string, ProGearSkin> = {
  neon_keyboard: {
    id: 'neon_keyboard',
    name: 'Cyberpunk Neon Rapid-Trigger Keyboard',
    category: 'Keyboard',
    rarity: 'EPIC',
    icon: '⌨️',
    glowColor: 'from-cyan-500 to-blue-600',
    mechanicsBonus: 8,
    mentalBonus: 5,
    desc: 'Luminescent magnetic switches with custom RGB lightning profiles. Boosts APM by +8.'
  },
  t1_jersey: {
    id: 't1_jersey',
    name: 'T1 Worlds Championship Red-Gold Jersey',
    category: 'Jersey',
    rarity: 'EPIC',
    icon: '🎽',
    glowColor: 'from-rose-500 to-amber-500',
    mechanicsBonus: 4,
    mentalBonus: 12,
    desc: 'Woven with four stars of championship pedigree. Unshakable mental composure (+12).'
  },
  golden_mouse: {
    id: 'golden_mouse',
    name: 'Golden Dragon 8000Hz Wireless Mouse',
    category: 'Mouse',
    rarity: 'LEGENDARY',
    icon: '🖱️',
    glowColor: 'from-amber-400 via-yellow-300 to-amber-600',
    mechanicsBonus: 14,
    mentalBonus: 8,
    desc: '0.125ms polling rate with pure 24K gold magnesium skeleton. Pixel-perfect click reaction.'
  }
};

export const STREAK_DAYS_CONFIG: Omit<LoginStreakDay, 'claimed'>[] = [
  {
    day: 1,
    rewardLp: 25,
    rewardCash: 30
  },
  {
    day: 2,
    rewardLp: 35,
    rewardCash: 50
  },
  {
    day: 3,
    rewardLp: 50,
    rewardCash: 60,
    proGearSkin: PRO_GEAR_SKINS.neon_keyboard
  },
  {
    day: 4,
    rewardLp: 65,
    rewardCash: 80
  },
  {
    day: 5,
    rewardLp: 80,
    rewardCash: 100,
    proGearSkin: PRO_GEAR_SKINS.t1_jersey
  },
  {
    day: 6,
    rewardLp: 100,
    rewardCash: 120
  },
  {
    day: 7,
    rewardLp: 150,
    rewardCash: 250,
    proGearSkin: PRO_GEAR_SKINS.golden_mouse
  }
];
