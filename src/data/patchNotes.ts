import { PatchNote } from '../types/game';

export const PATCH_NOTES_HISTORY: PatchNote[] = [
  {
    version: '14.20 版本更新：世界赛全球总决赛官方比赛服补丁',
    headline: '世界赛总决赛官方版本改动',
    description: '针对高上限刺客与开团型英雄进行针对性调整，鼓励赛场极限微操与大规模5v5龙坑团战博弈。',
    changes: [
      {
        champId: 'ahri',
        champName: '阿狸 (Ahri)',
        type: 'BUFF',
        changeText: '大招【灵魄突袭】全等级冷却缩减15秒；E技能【魅惑妖术】弹道飞行速度提升10%。',
        powerDelta: 4
      },
      {
        champId: 'ksante',
        champName: "奎桑提 (K'Sante)",
        type: 'NERF',
        changeText: '【全开模式】双抗转化攻击力下调12%；W技能强行击退蓄力延迟微调增加。',
        powerDelta: -5
      },
      {
        champId: 'azir',
        champName: '阿兹尔 (Azir)',
        type: 'BUFF',
        changeText: '大招【禁军之墙】宽度增加1个禁军士兵；沙兵刺击AP加成上调。',
        powerDelta: 3
      },
      {
        champId: 'kaisa',
        champName: "卡莎 (Kai'Sa)",
        type: 'BUFF',
        changeText: '大招【猎手本能】突进切入敌方后排时护盾值提升20%。',
        powerDelta: 4
      },
      {
        champId: 'leesin',
        champName: '李青 (Lee Sin)',
        type: 'BUFF',
        changeText: '大招【猛龙摆尾】基础物理斩杀伤害全等级提升75点。',
        powerDelta: 3
      },
      {
        champId: 'sejuani',
        champName: '瑟庄妮 (Sejuani)',
        type: 'NERF',
        changeText: 'E技能【永冻领域】极寒眩晕控制时长缩短0.25秒。',
        powerDelta: -3
      }
    ]
  },
  {
    version: '14.19 版本更新：入围赛紧急战术热补丁',
    headline: '瑞士轮阶段版本演进',
    description: '削弱下路过激的长手消耗流派，恢复硬控开团型辅助的赛场游走先手权。',
    changes: [
      {
        champId: 'nautilus',
        champName: '诺提勒斯 (Nautilus)',
        type: 'BUFF',
        changeText: 'Q技能【疏通航道】钩锁命中后技能冷却返还2秒。',
        powerDelta: 3
      }
    ]
  }
];
