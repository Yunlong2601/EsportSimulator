import { ChampionshipRing } from '../types/game';

export const CHAMPIONSHIP_RINGS_CONFIG: ChampionshipRing[] = [
  {
    id: 'ring_s10_origin',
    season: 'S10',
    name: 'S10 幽蓝起源之戒 (Origin of Azure)',
    title: '首冠破晓 · 逆转宿命',
    year: 2020,
    rarity: 'MYTHIC',
    primaryColor: '#00F0FF',
    secondaryColor: '#3B82F6',
    glowEffect: 'shadow-[0_0_35px_rgba(0,240,255,0.6)]',
    material: '冷冽纯白钛金基底 · 5.2克拉极光海蓝宝 · 18K精金镶边',
    engraving: '镌刻: 战队首发五虎 · FMVP 决境五杀',
    lore: '初登世界之巅的破晓一战。面对全胜外卡与韩国豪强，落后两局绝地翻盘。这枚戒指凝结了俱乐部历史上首座召唤师之杯的滚烫泪水。',
    statsBuff: {
      clutchRateBonus: 12,
      fanAppealBonus: 20,
      moraleRetention: 10,
      title: '破晓之心 (Awakening Will)'
    },
    ring3dStyle: {
      gemEmoji: '💎',
      bandStyle: 'from-cyan-300 via-blue-400 to-indigo-600',
      gemGradient: 'radial-gradient(circle at 35% 35%, #a5f3fc 0%, #06b6d4 50%, #0e7490 100%)',
      shadowGlow: '0 0 45px rgba(6, 182, 212, 0.75)',
      accentGlow: 'border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.5)]'
    }
  },
  {
    id: 'ring_s11_dragon',
    season: 'S11',
    name: 'S11 破晓龙魂之戒 (Dawn Dragonfire)',
    title: '不破不立 · 银龙狂啸',
    year: 2021,
    rarity: 'IMMORTAL',
    primaryColor: '#EF4444',
    secondaryColor: '#F59E0B',
    glowEffect: 'shadow-[0_0_35px_rgba(239,68,68,0.6)]',
    material: '火山黑曜星陨金 · 6.0克拉赤炼龙晶 · 熔岩微雕龙鳞戒圈',
    engraving: '镌刻: 不破不立 · 鏖战BO5三局大龙坑逆风神抢',
    lore: '在冰岛冰火交融的黑夜，银龙骑士顶着刺骨严寒力克王朝强敌。戒面微雕双龙盘旋，象征永不熄灭的团战意志。',
    statsBuff: {
      clutchRateBonus: 15,
      fanAppealBonus: 25,
      moraleRetention: 15,
      title: '龙魂狂怒 (Dragonfire Heart)'
    },
    ring3dStyle: {
      gemEmoji: '🔥',
      bandStyle: 'from-amber-400 via-rose-500 to-red-700',
      gemGradient: 'radial-gradient(circle at 35% 35%, #fecdd3 0%, #f43f5e 50%, #9f1239 100%)',
      shadowGlow: '0 0 50px rgba(244, 63, 94, 0.75)',
      accentGlow: 'border-rose-400/80 shadow-[0_0_20px_rgba(244,63,94,0.5)]'
    }
  },
  {
    id: 'ring_s12_astral',
    season: 'S12',
    name: 'S12 弑神星穹之戒 (Deicide Astral)',
    title: '最后一舞 · 登峰造极',
    year: 2022,
    rarity: 'IMMORTAL',
    primaryColor: '#A855F7',
    secondaryColor: '#6366F1',
    glowEffect: 'shadow-[0_0_35px_rgba(168,85,247,0.6)]',
    material: '天青秘银星轨基座 · 6.5克拉星穹深空紫钻 · 碎钻星云浮雕',
    engraving: '镌刻: 重铸荣光 · 孤勇者登峰造极之路',
    lore: '从入围赛一路披荆斩棘杀入决胜夜，书写全球电竞赛事最震撼的黑马童话。戒面星轨寓意每一颗不屈的星辰皆能点亮夜空。',
    statsBuff: {
      clutchRateBonus: 18,
      fanAppealBonus: 30,
      moraleRetention: 18,
      title: '星穹引力 (Astral Resonance)'
    },
    ring3dStyle: {
      gemEmoji: '🔮',
      bandStyle: 'from-fuchsia-300 via-purple-500 to-indigo-800',
      gemGradient: 'radial-gradient(circle at 35% 35%, #f5d0fe 0%, #c026d3 50%, #701a75 100%)',
      shadowGlow: '0 0 50px rgba(192, 38, 211, 0.75)',
      accentGlow: 'border-purple-400/80 shadow-[0_0_20px_rgba(192,38,211,0.5)]'
    }
  },
  {
    id: 'ring_s13_sovereign',
    season: 'S13',
    name: 'S13 诛神不朽至尊戒 (Immortal Sovereign)',
    title: '四冠传奇 · 万神之巅',
    year: 2023,
    rarity: 'ETERNAL',
    primaryColor: '#EAB308',
    secondaryColor: '#F59E0B',
    glowEffect: 'shadow-[0_0_40px_rgba(234,179,8,0.7)]',
    material: '至臻辉金 · 7.2克拉永恒帝王白钻 · 冠军圣杯微缩浮雕',
    engraving: '镌刻: 神话不灭 · 传奇永不落幕',
    lore: '一夫当关万夫莫开，在主场亿万观众瞩目下以摧枯拉朽之势完成四冠神话加冕。这枚戒指代表着电竞赛事无可撼动的绝对统治力。',
    statsBuff: {
      clutchRateBonus: 22,
      fanAppealBonus: 35,
      moraleRetention: 22,
      title: '帝王加冕 (Sovereign Authority)'
    },
    ring3dStyle: {
      gemEmoji: '👑',
      bandStyle: 'from-yellow-200 via-amber-400 to-yellow-600',
      gemGradient: 'radial-gradient(circle at 35% 35%, #fef08a 0%, #eab308 50%, #854d0e 100%)',
      shadowGlow: '0 0 60px rgba(234, 179, 8, 0.85)',
      accentGlow: 'border-amber-400/90 shadow-[0_0_25px_rgba(234,179,8,0.6)]'
    }
  },
  {
    id: 'ring_s14_inferno',
    season: 'S14',
    name: 'S14 碧霄天火之戒 (Azure Inferno)',
    title: '宿命加冕 · 烈焰涅槃',
    year: 2024,
    rarity: 'ETERNAL',
    primaryColor: '#10B981',
    secondaryColor: '#06B6D4',
    glowEffect: 'shadow-[0_0_40px_rgba(16,185,129,0.7)]',
    material: '流火赤金合金 · 7.8克拉碧霄天火双色碧玺 · 凤凰翎羽雕饰',
    engraving: '镌刻: 浴火重生 · 战队五人名字纳米雕刻',
    lore: '经历人员迭代与赛季磨难后再次浴火重生的至尊加冕之作。戒身内部嵌入比赛决胜时刻的声音音波纳米波纹。',
    statsBuff: {
      clutchRateBonus: 25,
      fanAppealBonus: 40,
      moraleRetention: 25,
      title: '天火涅槃 (Azure Rebirth)'
    },
    ring3dStyle: {
      gemEmoji: '✨',
      bandStyle: 'from-emerald-300 via-teal-400 to-cyan-600',
      gemGradient: 'radial-gradient(circle at 35% 35%, #a7f3d0 0%, #10b981 50%, #064e3b 100%)',
      shadowGlow: '0 0 60px rgba(16, 185, 129, 0.85)',
      accentGlow: 'border-emerald-400/90 shadow-[0_0_25px_rgba(16,185,129,0.6)]'
    }
  },
  {
    id: 'ring_s15_dynasty',
    season: 'S15',
    name: 'S15 终焉全满贯神迹之戒 (Crown of Oblivion)',
    title: '王朝大满贯 · 千古一队',
    year: 2025,
    rarity: 'ETERNAL',
    primaryColor: '#EC4899',
    secondaryColor: '#8B5CF6',
    glowEffect: 'shadow-[0_0_45px_rgba(236,72,153,0.8)]',
    material: '星界超导黑金 · 8.8克拉幻彩日冕钻 · 镶嵌四赛区冠军碎片',
    engraving: '镌刻: 千古一队 · 春夏MSI全球总决赛全满贯金身',
    lore: '实现一年内包揽春季赛、MSI、夏季赛、全球总决赛全部桂冠的神迹之戒。凡佩戴者，皆为电子竞技历史丰碑的核心缔造者。',
    statsBuff: {
      clutchRateBonus: 30,
      fanAppealBonus: 50,
      moraleRetention: 30,
      title: '终焉神迹 (Crown of Eternity)'
    },
    ring3dStyle: {
      gemEmoji: '💍',
      bandStyle: 'from-pink-300 via-purple-500 to-indigo-900',
      gemGradient: 'radial-gradient(circle at 35% 35%, #fbcfe8 0%, #ec4899 50%, #831843 100%)',
      shadowGlow: '0 0 70px rgba(236, 72, 153, 0.9)',
      accentGlow: 'border-pink-400/90 shadow-[0_0_30px_rgba(236,72,153,0.7)]'
    }
  }
];

export function getChampionshipRingById(ringId: string): ChampionshipRing | undefined {
  return CHAMPIONSHIP_RINGS_CONFIG.find(r => r.id === ringId);
}

export function getDefaultUnlockedRings(championshipsWon: number = 0): string[] {
  // If player won championships, unlock that many rings (at least S10 if won 1, etc.)
  if (championshipsWon <= 0) return ['ring_s10_origin']; // Default give first historic ring for immediate enjoyable experience
  const unlocked: string[] = [];
  for (let i = 0; i < Math.min(championshipsWon, CHAMPIONSHIP_RINGS_CONFIG.length); i++) {
    unlocked.push(CHAMPIONSHIP_RINGS_CONFIG[i].id);
  }
  return unlocked.length > 0 ? unlocked : ['ring_s10_origin'];
}
