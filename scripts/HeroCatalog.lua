-- HeroCatalog：英雄池数据（30 个英雄，每位置 6 个；灵感致敬王者荣耀 × 英雄联盟的经典定位，均为原创命名）
-- 选手英雄池由 HeroSystem 按选手 id 确定性生成；版本强度由 HeroSystem.RollMeta 每周轮换。
-- 注意：id 是存档持久键，禁止改名/改序；新增字段（title/skills/origin/difficulty）只用于图鉴展示。

local HeroCatalog = {}

HeroCatalog.ROLES = { "top", "jungle", "mid", "adc", "support" }

HeroCatalog.ROLE_LABELS = {
    top = "上单",
    jungle = "打野",
    mid = "中单",
    adc = "射手",
    support = "辅助",
}

HeroCatalog.HEROES = {
    -- ===== 上单 =====
    { id = "h_top_1", name = "断岳", title = "不灭的山岳", role = "top", tag = "坦克", difficulty = 1,
      origin = "灵感：圣剑重装骑士",
      skills = {
          { n = "Q 裁决之剑", d = "挥剑斩出剑气，命中后自身获得护盾。" },
          { n = "W 圣盾壁垒", d = "举盾格挡正面伤害并减速敌人。" },
          { n = "E 正义审判", d = "旋转大剑持续造成范围伤害。" },
          { n = "R 断岳斩", d = "跃起劈下巨剑，对敌人造成斩杀伤害。" },
      } },
    { id = "h_top_2", name = "磐岩", title = "大地之盾", role = "top", tag = "坦克", difficulty = 1,
      origin = "灵感：岩石巨像",
      skills = {
          { n = "Q 地震践踏", d = "重踏地面，对周围敌人造成伤害与减速。" },
          { n = "W 花岗岩肤", d = "皮肤石化，短暂提升双抗。" },
          { n = "E 地裂冲击", d = "砸出地裂波，击飞沿途敌人。" },
          { n = "R 磐石冲击", d = "跃向目标区域，落地击飞并眩晕。" },
      } },
    { id = "h_top_3", name = "狂斧", title = "无双斗神", role = "top", tag = "战士", difficulty = 2,
      origin = "灵感：狂战士双斧",
      skills = {
          { n = "Q 掷斧回旋", d = "掷出双斧，回旋造成两段伤害。" },
          { n = "W 狂怒撕咬", d = "扑向目标撕咬，回复生命。" },
          { n = "E 血祭", d = "损失生命换取攻击力提升。" },
          { n = "R 诸神黄昏", d = "进入狂怒状态，免控且持续加速。" },
      } },
    { id = "h_top_4", name = "荆棘", title = "带刺玫瑰", role = "top", tag = "战士", difficulty = 2,
      origin = "灵感：荆棘女王",
      skills = {
          { n = "Q 藤蔓缠绕", d = "伸出藤蔓捆缚首个敌人。" },
          { n = "W 荆棘丛生", d = "地面长出荆棘，持续伤害减速。" },
          { n = "E 致命花刺", d = "刺出花枪，距离越远伤害越高。" },
          { n = "R 玫瑰风暴", d = "召唤荆棘风暴，范围持续输出。" },
      } },
    { id = "h_top_5", name = "潮汐", title = "深渊守望者", role = "top", tag = "开团", difficulty = 2,
      origin = "灵感：深海泰坦",
      skills = {
          { n = "Q 深渊之锚", d = "抛出巨锚，将敌人拖向自己。" },
          { n = "W 泰坦之怒", d = "获得护盾并强化普攻。" },
          { n = "E 暗流涌动", d = "脚下涌出暗流，减速敌人。" },
          { n = "R 海啸审判", d = "召唤海啸追击敌人，沿途击飞。" },
      } },
    { id = "h_top_6", name = "星陨", title = "碎星战士", role = "top", tag = "战士", difficulty = 3,
      origin = "灵感：流星之刃",
      skills = {
          { n = "Q 星陨突刺", d = "向前突刺，命中后刷新冷却。" },
          { n = "W 天穹护体", d = "短时间免疫控制。" },
          { n = "E 星河连斩", d = "连续挥斩，伤害逐段提升。" },
          { n = "R 流星坠落", d = "跃上高空后坠向目标，范围爆发。" },
      } },

    -- ===== 打野 =====
    { id = "h_jgl_1", name = "影狼", title = "暗影猎手", role = "jungle", tag = "刺客", difficulty = 2,
      origin = "灵感：影子刺客",
      skills = {
          { n = "Q 影袭", d = "瞬步突进，留下影痕伤害敌人。" },
          { n = "W 影分身", d = "留下分身迷惑敌人并交换位置。" },
          { n = "E 割喉", d = "背刺造成额外伤害。" },
          { n = "R 死亡印记", d = "标记目标，延迟引爆真实伤害。" },
      } },
    { id = "h_jgl_2", name = "猎手", title = "丛林之王", role = "jungle", tag = "节奏", difficulty = 3,
      origin = "灵感：盲僧武僧",
      skills = {
          { n = "Q 回音踢", d = "踢出音波，命中后二次突进。" },
          { n = "W 金钟罩", d = "位移至友军并套盾。" },
          { n = "E 天雷破", d = "拍地造成范围伤害与减速。" },
          { n = "R 猛龙摆尾", d = "一脚将目标踹飞，击退路径敌人。" },
      } },
    { id = "h_jgl_3", name = "深渊", title = "无底深渊", role = "jungle", tag = "坦克", difficulty = 1,
      origin = "灵感：虚空巨兽",
      skills = {
          { n = "Q 地裂", d = "砸裂地面，减速敌人。" },
          { n = "W 恐惧尖啸", d = "发出尖啸，沉默周围敌人。" },
          { n = "E 吞噬", d = "啃咬敌人并永久叠加生命。" },
          { n = "R 深渊盛宴", d = "吞下目标造成巨额伤害，体型变大。" },
      } },
    { id = "h_jgl_4", name = "月影", title = "月下美人", role = "jungle", tag = "刺客", difficulty = 3,
      origin = "灵感：月光女侠",
      skills = {
          { n = "Q 月刃", d = "掷出月刃，路径伤害并标记。" },
          { n = "W 月华护体", d = "获得护盾，攻击附带月光溅射。" },
          { n = "E 月之引力", d = "将标记敌人拉向自己。" },
          { n = "R 月下连斩", d = "大招刷新位移，残影追击敌人。" },
      } },
    { id = "h_jgl_5", name = "岩蟒", title = "地底潜行", role = "jungle", tag = "节奏", difficulty = 2,
      origin = "灵感：地底钻行猎手",
      skills = {
          { n = "Q 钻地突袭", d = "钻地潜行，破土击飞敌人。" },
          { n = "W 地听", d = "感知附近隐身单位。" },
          { n = "E 撕咬", d = "连续撕咬，目标生命越低伤害越高。" },
          { n = "R 蟒缚", d = "扑向目标缠绕禁锢并拖行。" },
      } },
    { id = "h_jgl_6", name = "幻猎", title = "千面幻影", role = "jungle", tag = "刺客", difficulty = 3,
      origin = "灵感：忍者刺客",
      skills = {
          { n = "Q 手里剑", d = "掷出多枚手里剑。" },
          { n = "W 烟幕", d = "丢出烟幕，进入隐身并加速。" },
          { n = "E 突袭", d = "翻越障碍突进，暴露时伤害提升。" },
          { n = "R 幻影连斩", d = "对目标连续斩击，击杀刷新。" },
      } },

    -- ===== 中单 =====
    { id = "h_mid_1", name = "奥术", title = "大魔导师", role = "mid", tag = "法师", difficulty = 2,
      origin = "灵感：光系魔导师",
      skills = {
          { n = "Q 光之束缚", d = "射出光束，禁锢首个敌人。" },
          { n = "W 奥术洪流", d = "引爆区域造成范围伤害。" },
          { n = "E 光棱法阵", d = "布下法阵，减速阵内敌人。" },
          { n = "R 终极闪光", d = "蓄力发射贯穿光束，超远距离爆发。" },
      } },
    { id = "h_mid_2", name = "冰皇", title = "北境之主", role = "mid", tag = "法师", difficulty = 2,
      origin = "灵感：冰霜女巫",
      skills = {
          { n = "Q 冰晶穿刺", d = "掷出冰晶，贯穿并减速敌人。" },
          { n = "W 冰封之环", d = "脚下冻出冰环，冻结周围敌人。" },
          { n = "E 寒冰之径", d = "制造冰道，位移并留减速带。" },
          { n = "R 冰霜陵墓", d = "将目标冰封，延迟碎裂造成爆发。" },
      } },
    { id = "h_mid_3", name = "火法", title = "烈焰掌控者", role = "mid", tag = "爆发", difficulty = 1,
      origin = "灵感：火焰小魔女",
      skills = {
          { n = "Q 火球术", d = "投掷火球，伤害随距离提升。" },
          { n = "W 烈焰风暴", d = "喷出锥形火焰。" },
          { n = "E 火盾", d = "护盾灼烧近身敌人。" },
          { n = "R 熔岩巨熊", d = "召唤熔岩巨熊，砸地眩晕。" },
      } },
    { id = "h_mid_4", name = "时空", title = "时间旅人", role = "mid", tag = "节奏", difficulty = 3,
      origin = "灵感：时间操控者",
      skills = {
          { n = "Q 时间回卷", d = "掷出时间装置，区域减速。" },
          { n = "W 平行时空", d = "在影子位置造成延迟伤害。" },
          { n = "E 相位突进", d = "短暂穿越时空冲刺。" },
          { n = "R 时光倒流", d = "回到数秒前的位置与状态。" },
      } },
    { id = "h_mid_5", name = "暗星", title = "暗黑星辰", role = "mid", tag = "爆发", difficulty = 3,
      origin = "灵感：机械法师",
      skills = {
          { n = "Q 暗能射线", d = "发射激光，命中叠层增伤。" },
          { n = "W 引力场", d = "制造重力场，持续吸附敌人。" },
          { n = "E 死亡射线", d = "交叉射线扫射锥形区域。" },
          { n = "R 星辰湮灭", d = "释放巨大能量球，范围湮灭。" },
      } },
    { id = "h_mid_6", name = "雷法", title = "雷霆主宰", role = "mid", tag = "法师", difficulty = 2,
      origin = "灵感：雷电法王",
      skills = {
          { n = "Q 雷击", d = "召唤闪电劈向目标。" },
          { n = "W 电磁领域", d = "布下雷场，敌人移动受罚。" },
          { n = "E 连锁闪电", d = "闪电在敌人间弹跳。" },
          { n = "R 雷神降临", d = "化身雷神，普攻变为范围落雷。" },
      } },

    -- ===== 射手 =====
    { id = "h_adc_1", name = "猎空", title = "双枪游侠", role = "adc", tag = "射手", difficulty = 2,
      origin = "灵感：双枪圣骑士",
      skills = {
          { n = "Q 双枪连射", d = "快速连射，最后一发爆裂。" },
          { n = "W 热诚烈弹", d = "射出贯穿弹，命中越多伤害越高。" },
          { n = "E 滑步", d = "侧向滑步，清除减速。" },
          { n = "R 圣枪洗礼", d = "倾泻弹幕，扫射锥形区域。" },
      } },
    { id = "h_adc_2", name = "爆枪", title = "重装火铳", role = "adc", tag = "射手", difficulty = 1,
      origin = "灵感：疯癫炮手",
      skills = {
          { n = "Q 炮火轰鸣", d = "切换重炮，普攻变为范围溅射。" },
          { n = "W 电磁地雷", d = "埋下地雷，触发后爆炸减速。" },
          { n = "E 火箭跳跃", d = "后坐力跃起，落地范围伤害。" },
          { n = "R 火力全开", d = "提升攻速与射程，火力压制。" },
      } },
    { id = "h_adc_3", name = "银弹", title = "赏金猎手", role = "adc", tag = "收割", difficulty = 2,
      origin = "灵感：海盗赏金",
      skills = {
          { n = "Q 一箭双雕", d = "弹射子弹，首目标死亡必暴击。" },
          { n = "W 大步流星", d = "加速移动，攻击附加火焰。" },
          { n = "E 枪林弹雨", d = "区域弹幕，减速并持续伤害。" },
          { n = "R 弹幕时间", d = "对锥形区域倾泻火力。" },
      } },
    { id = "h_adc_4", name = "寒霜", title = "冰霜女猎", role = "adc", tag = "控场", difficulty = 1,
      origin = "灵感：寒冰女皇",
      skills = {
          { n = "Q 冰霜射击", d = "普攻减速敌人，命中叠层。" },
          { n = "W 万箭齐发", d = "扇形齐射冰箭。" },
          { n = "E 鹰击长空", d = "放出猎鹰侦察视野。" },
          { n = "R 魔法水晶箭", d = "射出全图冰箭，命中眩晕。" },
      } },
    { id = "h_adc_5", name = "磁轨", title = "电磁枪神", role = "adc", tag = "射手", difficulty = 3,
      origin = "灵感：虚空之女",
      skills = {
          { n = "Q 虚空弹幕", d = "发射密集弹幕，伤害翻倍标记。" },
          { n = "W 电磁标记", d = "标记目标，攻击触发引爆。" },
          { n = "E 超频", d = "短暂加速并强化普攻。" },
          { n = "R 猎手本能", d = "超远距离突进到目标身旁。" },
      } },
    { id = "h_adc_6", name = "幻狙", title = "千里狙神", role = "adc", tag = "收割", difficulty = 3,
      origin = "灵感：狙击精英",
      skills = {
          { n = "Q 精准狙击", d = "架枪蓄力，距离越远伤害越高。" },
          { n = "W 陷阱网", d = "布下夹子，禁锢踩中敌人。" },
          { n = "E 后撤步", d = "向后跃出并快速装弹。" },
          { n = "R 一击必杀", d = "全图锁定目标，致命一击。" },
      } },

    -- ===== 辅助 =====
    { id = "h_sup_1", name = "圣光", title = "黎明使者", role = "support", tag = "保护", difficulty = 1,
      origin = "灵感：星空奶妈",
      skills = {
          { n = "Q 星光坠落", d = "召唤星尘，命中敌人受伤、友军回血。" },
          { n = "W 星之祝福", d = "治疗目标，生命越低效果越强。" },
          { n = "E 圣光领域", d = "展开领域，持续回复友军。" },
          { n = "R 黎明赞歌", d = "全队大幅回血，清除重伤。" },
      } },
    { id = "h_sup_2", name = "歌姬", title = "海之歌手", role = "support", tag = "增益", difficulty = 1,
      origin = "灵感：琴瑟仙女",
      skills = {
          { n = "Q 音波冲击", d = "音符冲击敌人，为附近友军加攻。" },
          { n = "W 治愈旋律", d = "治愈最低生命友军，附带护盾。" },
          { n = "E 加速和弦", d = "为友军加速，敌人减速。" },
          { n = "R 终极狂想曲", d = "弹奏终章，眩晕直线敌人。" },
      } },
    { id = "h_sup_3", name = "铁卫", title = "钢铁壁垒", role = "support", tag = "坦克", difficulty = 1,
      origin = "灵感：冰霜巨盾",
      skills = {
          { n = "Q 寒冬之咬", d = "掷出冰盾，减速命中敌人。" },
          { n = "W 挺身而出", d = "跃向友军，为双方提供抗性。" },
          { n = "E 坚不可摧", d = "举盾格挡正面伤害。" },
          { n = "R 冰川裂隙", d = "砸地裂出冰痕，击飞沿途敌人。" },
      } },
    { id = "h_sup_4", name = "贤者", title = "时间先知", role = "support", tag = "控制", difficulty = 2,
      origin = "灵感：时空贤者",
      skills = {
          { n = "Q 时光炸弹", d = "给目标装炸弹，延迟爆炸眩晕。" },
          { n = "W 加速时光", d = "提升友军移速与冷却。" },
          { n = "E 迟滞时光", d = "让敌人行动迟缓。" },
          { n = "R 逆转时空", d = "复活阵亡友军，返回原位。" },
      } },
    { id = "h_sup_5", name = "迷雾", title = "幽冥灯塔", role = "support", tag = "视野", difficulty = 3,
      origin = "灵感：勾魂狱卒",
      skills = {
          { n = "Q 死亡判决", d = "甩出钩锁，拖回命中的敌人。" },
          { n = "W 幽冥牢笼", d = "布下灯笼，提供视野与护盾。" },
          { n = "E 厄运钟摆", d = "挥动镰刀，推开或拉近敌人。" },
          { n = "R 幽冥监牢", d = "圈出牢狱，敌人越界受罚。" },
      } },
    { id = "h_sup_6", name = "战鼓", title = "战争颂者", role = "support", tag = "开团", difficulty = 2,
      origin = "灵感：日轮战士",
      skills = {
          { n = "Q 破晓之盾", d = "盾击目标，眩晕并标记。" },
          { n = "W 日蚀", d = "获得护盾，引爆灼烧周围。" },
          { n = "E 天顶之刃", d = "向目标突进，禁锢沿途敌人。" },
          { n = "R 日轮圣盾", d = "跃向目标开团，大范围眩晕。" },
      } },
}

HeroCatalog.BY_ID = {}
HeroCatalog.HEROES_BY_ROLE = {}
for _, hero in ipairs(HeroCatalog.HEROES) do
    HeroCatalog.BY_ID[hero.id] = hero
    HeroCatalog.HEROES_BY_ROLE[hero.role] = HeroCatalog.HEROES_BY_ROLE[hero.role] or {}
    table.insert(HeroCatalog.HEROES_BY_ROLE[hero.role], hero)
end

function HeroCatalog.GetHero(heroId)
    return HeroCatalog.BY_ID[heroId]
end

function HeroCatalog.GetHeroesByRole(role)
    return role and HeroCatalog.HEROES_BY_ROLE[role] or HeroCatalog.HEROES
end

function HeroCatalog.GetRoleLabel(role)
    return HeroCatalog.ROLE_LABELS[role] or role
end

return HeroCatalog