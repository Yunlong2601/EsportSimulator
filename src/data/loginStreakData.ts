import { LoginStreakDay, ProGearSkin } from '../types/game';

export const PRO_GEAR_SKINS: Record<string, ProGearSkin> = {
  neon_keyboard: {
    id: 'neon_keyboard',
    name: '赛博霓虹 · 磁轴快速触发键盘',
    category: 'Keyboard',
    rarity: 'EPIC',
    icon: '⌨️',
    glowColor: 'from-cyan-500 to-blue-600',
    mechanicsBonus: 8,
    mentalBonus: 5,
    desc: '发光磁轴与自研RGB竞技灯效，0.1mm极速触发，操作APM提升 +8。'
  },
  t1_jersey: {
    id: 't1_jersey',
    name: '世界赛总冠军 · 荣耀红金战袍',
    category: 'Jersey',
    rarity: 'EPIC',
    icon: '🎽',
    glowColor: 'from-rose-500 to-amber-500',
    mechanicsBonus: 4,
    mentalBonus: 12,
    desc: '承载世界冠军底蕴与四星荣光，临危不乱的大赛心态提升 (+12)。'
  },
  golden_mouse: {
    id: 'golden_mouse',
    name: '赤金神龙 · 8000Hz 竞技级无线鼠',
    category: 'Mouse',
    rarity: 'LEGENDARY',
    icon: '🖱️',
    glowColor: 'from-amber-400 via-yellow-300 to-amber-600',
    mechanicsBonus: 14,
    mentalBonus: 8,
    desc: '0.125ms轮询率纯金镁合金骨架，像素级微操命中率，走砍爆发 (+14)。'
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
