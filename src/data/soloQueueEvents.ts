import { SoloQueueEvent } from '../types/game';

export const SOLO_QUEUE_EVENTS: SoloQueueEvent[] = [
  {
    id: 'baron_coinflip',
    title: '36分钟 纳什男爵生死龙坑对决',
    scenario: '敌方五人在战争迷雾中偷打大龙，大龙血量仅剩 3,200 HP！自家打野已被击杀，但你的闪现和大招均在冷却完毕就绪状态！',
    contextTag: '大龙生死团',
    options: [
      {
        label: '肉身盲闪入坑 50/50 搏命秒龙',
        description: '坚信自身微操极限手速，闪现接爆发连招斩杀大龙并秒杀敌方核心C位。',
        risk: 'High',
        mechanicsReq: 45,
        execute: (stats) => {
          const success = Math.random() * 100 < (stats.mechanics * 0.8 + stats.mental * 0.2);
          if (success) {
            return {
              success: true,
              log: '【天神下凡】你闪现越过龙坑厚墙，大招瞬间爆发在400点血量抢下大龙，顺势斩落敌方双C！五杀逆风翻盘！',
              lpDelta: 28,
              mechanicsDelta: 2,
              mentalDelta: 5,
              fameDelta: 6,
              moneyDelta: 30
            };
          } else {
            return {
              success: false,
              log: '【惨遭集火】闪现落地瞬间吃下4道控制技能，0.2秒内融化蒸发。敌方收下大龙一波推平基地。',
              lpDelta: -20,
              mechanicsDelta: 1,
              mentalDelta: -6,
              fameDelta: -2
            };
          }
        }
      },
      {
        label: '河道卡位拉扯 远距离安全Poke',
        description: '在河道狭窄路口持续消耗敌方血线，拖延时间等待队友复活赶来。',
        risk: 'Medium',
        mentalReq: 35,
        execute: (stats) => {
          const success = Math.random() * 100 < (stats.mental * 0.7 + stats.mechanics * 0.3);
          if (success) {
            return {
              success: true,
              log: '【老练拉扯】沉着冷静的Poke逼退敌方脆皮，强行阻止大龙节奏，复活队友及时赶到团灭对手！',
              lpDelta: 22,
              mechanicsDelta: 1,
              mentalDelta: 4,
              fameDelta: 3
            };
          } else {
            return {
              success: false,
              log: '【前排强开】敌方坦克果断闪现开团控住你，交掉闪现后依然被稳稳控死，大龙丢失。',
              lpDelta: -16,
              mechanicsDelta: 0,
              mentalDelta: -3,
              fameDelta: 0
            };
          }
        }
      },
      {
        label: '换线单带偷家 极限互拆水晶',
        description: '果断放弃大龙争夺，单人疾驰下路带线直拆敌方高地与水晶枢纽。',
        risk: 'Low',
        execute: () => {
          return {
            success: true,
            log: '【极致兵线大局观】破掉敌方下路水晶，逼迫敌方回防两人，大龙攻势不攻自破！',
            lpDelta: 18,
            mechanicsDelta: 0,
            mentalDelta: 2,
            fameDelta: 1
          };
        }
      }
    ]
  },
  {
    id: 'toxic_teammate',
    title: '队友心态爆炸 疯狂狂打问号互动',
    scenario: '上单选手前4分钟被线杀两次，疯狂狂点打野信号并在公屏敲字：“15分直接投，点投降下一把，别浪费时间”。',
    contextTag: '战局团队心态',
    options: [
      {
        label: '/mute all 全体静音 开启1v9通天代模式',
        description: '彻底屏蔽消极文字，收割野区资源与三路兵线，用绝对统治力扛起全队。',
        risk: 'Medium',
        mentalReq: 40,
        execute: (stats) => {
          const success = Math.random() * 100 < (stats.mental * 0.8 + 20);
          if (success) {
            return {
              success: true,
              log: '【巨神之姿】极致专注，打出 11/1/6 逆天战绩！带领摆烂队友 27分钟强行拆平基地！',
              lpDelta: 24,
              mechanicsDelta: 2,
              mentalDelta: 6,
              fameDelta: 4
            };
          } else {
            return {
              success: false,
              log: '【独木难支】虽然操作拉满，但送出超神赏金的送头队友将优势拱手让人，无奈吞下苦果。',
              lpDelta: -15,
              mechanicsDelta: 1,
              mentalDelta: -4,
              fameDelta: 0
            };
          }
        }
      },
      {
        label: '公屏正能量喊话 鼓舞全队信心',
        description: '发言安抚：“兄弟们稳住，我们后期阵容无敌，保护我就能翻盘！”',
        risk: 'Low',
        execute: () => {
          const worked = Math.random() > 0.45;
          if (worked) {
            return {
              success: true,
              log: '【领袖气质】崩盘队友心态逐渐回暖，认真对待团战并打出关键群控，成功上演逆风翻盘！',
              lpDelta: 25,
              mechanicsDelta: 0,
              mentalDelta: 8,
              fameDelta: 5
            };
          } else {
            return {
              success: false,
              log: '【言辞无效】队友直接挂在泉水洗澡挂机，游戏进入4打5僵局。',
              lpDelta: -18,
              mechanicsDelta: 0,
              mentalDelta: -8,
              fameDelta: 0
            };
          }
        }
      },
      {
        label: '键盘对喷火力全开 嘴遁反击',
        description: '双手离开鼠标，化身祖安文曲星在聊天框互相对喷。',
        risk: 'High',
        execute: () => {
          return {
            success: false,
            log: '【打字误事】浪费了整整5分钟补刀发育时间，最终基地爆炸，并收到一局禁言警告！',
            lpDelta: -22,
            mechanicsDelta: 0,
            mentalDelta: -14,
            fameDelta: -3
          };
        }
      }
    ]
  },
  {
    id: 'tower_dive_defense',
    title: '3级被越塔 敌方中野包夹防守战',
    scenario: '敌方中单囤积了12只兵线推进塔下，敌方打野突然从F6草丛闪现钻出，准备强行抗塔强杀！',
    contextTag: '对线期博弈',
    options: [
      {
        label: '防御塔下极限走位 诱敌深入反打',
        description: '极限假动作骗出第一道控制，反手控制打野诱导其连续抗塔。',
        risk: 'Medium',
        mechanicsReq: 40,
        execute: (stats) => {
          const success = Math.random() * 100 < (stats.mechanics * 0.9);
          if (success) {
            return {
              success: true,
              log: '【神级反杀】Faker附体！走位躲过致命眩晕，塔下金身定格控死打野，双杀一血到手！',
              lpDelta: 26,
              mechanicsDelta: 3,
              mentalDelta: 5,
              fameDelta: 7,
              moneyDelta: 50
            };
          } else {
            return {
              success: false,
              log: '【算错伤害】技能冷却差半秒，未能在防御塔攻击下完成互换，白白送出人头。',
              lpDelta: -17,
              mechanicsDelta: 1,
              mentalDelta: -4,
              fameDelta: -1
            };
          }
        }
      },
      {
        label: '弃塔后撤断臂求生 保全性命',
        description: '果断放弃兵线后撤到二塔处，损失经验与金币但保全自身存活。',
        risk: 'Low',
        execute: () => {
          return {
            success: true,
            log: '【稳健防守】牺牲了300块的补刀经济，但没有让对手拿到击杀人头，15分钟稳住了对局。',
            lpDelta: 19,
            mechanicsDelta: 0,
            mentalDelta: 3,
            fameDelta: 1
          };
        }
      }
    ]
  },
  {
    id: 'scout_watching',
    title: '职业战队星探 正在直播间暗中观战',
    scenario: '直播弹幕突然爆炸：“卧槽兄弟！EDG、BLG 和 T1 战队星探全在查房看你单排！！”',
    contextTag: '星探密探',
    options: [
      {
        label: '秒锁绝活刺客 狂飙400 APM秀翻全场',
        description: '展示极限微操与对线压制力，用视觉震撼征服所有豪门星探。',
        risk: 'High',
        mechanicsReq: 50,
        execute: (stats) => {
          const success = Math.random() * 100 < (stats.mechanics * 0.85);
          if (success) {
            return {
              success: true,
              log: '【名场面刷屏】17/2/8 教学级中单！高光操作被各大电竞博主疯狂转发，星探当场发私信邀请试训！',
              lpDelta: 32,
              mechanicsDelta: 4,
              mentalDelta: 8,
              fameDelta: 15,
              moneyDelta: 100
            };
          } else {
            return {
              success: false,
              log: '【操作变形】在大赛压力下越塔失误频频，被连续抓死4次，弹幕狂刷“打脸现场”。',
              lpDelta: -19,
              mechanicsDelta: 1,
              mentalDelta: -10,
              fameDelta: 2
            };
          }
        }
      },
      {
        label: '稳健选出团队型大核 展现战术大局观',
        description: '展现无懈可击的兵线管理、野区防守与团队视野掌控。',
        risk: 'Low',
        execute: () => {
          return {
            success: true,
            log: '【战术素养满分】星探在评估笔记记录：“对局执行力极高，大赛型冷静指挥”，好评如潮！',
            lpDelta: 24,
            mechanicsDelta: 1,
            mentalDelta: 6,
            fameDelta: 8,
            moneyDelta: 40
          };
        }
      }
    ]
  },
  {
    id: 'nexus_last_stand',
    title: '基地1滴血 终极水晶守护战',
    scenario: '三路高地全破，超级兵如潮水涌入，敌方五人带着大龙Buff在42分钟全力拆水晶！队友还有30秒复活！',
    contextTag: '终局生死局',
    options: [
      {
        label: '1v5 传送绕后 孤勇者刺杀敌方C位',
        description: 'TP绕后闪现切入后排，在敌方点掉基地前强行秒杀六神装ADC！',
        risk: 'High',
        mechanicsReq: 55,
        execute: (stats) => {
          const success = Math.random() * 100 < (stats.mechanics * 0.75 + stats.mental * 0.25);
          if (success) {
            return {
              success: true,
              log: '【世纪奇迹】基地仅剩10点血量！你秒杀敌方双C，拖延到队友复活，反手一波直推敌方基地获胜！',
              lpDelta: 35,
              mechanicsDelta: 5,
              mentalDelta: 10,
              fameDelta: 18,
              moneyDelta: 120
            };
          } else {
            return {
              success: false,
              log: '【功亏一篑】虽然秒杀了敌方ADC，但敌方前排平A点掉了基地最后一点血量，遗憾落败。',
              lpDelta: -21,
              mechanicsDelta: 2,
              mentalDelta: -8,
              fameDelta: 2
            };
          }
        }
      },
      {
        label: '超远距离狂清超级兵 苟延残喘等复活',
        description: '完全不接敌方英雄团战，将所有AOE技能砸向超级兵线。',
        risk: 'Medium',
        execute: (stats) => {
          const success = Math.random() * 100 < (stats.mental * 0.7 + stats.mechanics * 0.3);
          if (success) {
            return {
              success: true,
              log: '【钢铁防线】兵线在踏入攻击范围前被清空！队友及时复活打出团灭反击战！',
              lpDelta: 26,
              mechanicsDelta: 1,
              mentalDelta: 7,
              fameDelta: 6
            };
          } else {
            return {
              success: false,
              log: '【强行肉搏】敌方辅助闪现开团控住你，超级兵最后一击点碎了水晶。',
              lpDelta: -18,
              mechanicsDelta: 1,
              mentalDelta: -5,
              fameDelta: 0
            };
          }
        }
      }
    ]
  }
];
