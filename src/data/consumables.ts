import { ConsumableItem } from '../types/game';

export const CONSUMABLES_CATALOG: ConsumableItem[] = [
  {
    id: 'energy_shot',
    name: '高能电竞能量弹',
    nameEn: 'Energy Shot',
    cost: 15,
    icon: '⚡',
    desc: '速效浓缩牛磺酸与提神微量元素，一口闷饮，瞬间抹平疲劳，冲刺排位急救首选！',
    focusRestore: 40,
    energyRestore: 20,
    mentalRestore: 5,
    category: 'shot',
    tag: '⚡ 应急秒回'
  },
  {
    id: 'premium_coffee',
    name: '特调精品现磨冰美式',
    nameEn: 'Premium Coffee',
    cost: 30,
    icon: '☕',
    desc: '精选耶加雪菲深烘双份浓缩，高浓度冷萃注入，大脑神经全开，彻底驱散长时间直播与集训的倦意！',
    focusRestore: 70,
    energyRestore: 35,
    mentalRestore: 10,
    category: 'coffee',
    tag: '🔥 爆款必选'
  },
  {
    id: 'cyber_gum',
    name: '超频提神咀嚼薄荷糖',
    nameEn: 'Cyber Focus Gum',
    cost: 8,
    icon: '🪙',
    desc: '强劲冰爽薄荷爆珠，口腔神经瞬间受到刺激，经济实惠，资金紧缺时的抗疲劳救急之选！',
    focusRestore: 25,
    energyRestore: 12,
    mentalRestore: 4,
    category: 'boost',
    tag: '🪙 性价比首选'
  },
  {
    id: 'pro_care_package',
    name: '职业战备全能补给箱',
    nameEn: 'Pro Care Package',
    cost: 65,
    icon: '👑',
    desc: '顶级电竞豪门御用营养师定制包：高阶咖啡因+深海鱼油+抗疲劳电解质，疲劳条全满并重置巅峰竞技状态！',
    focusRestore: 100,
    energyRestore: 60,
    mentalRestore: 20,
    category: 'package',
    tag: '👑 状态全满'
  }
];
