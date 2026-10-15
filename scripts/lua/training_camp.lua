-- scripts/lua/training_camp.lua
-- Global Remote Bootcamp / Overseas High-Altitude Training Camp System
-- Ported from Web React prototype (src/data/remoteBootcampData.ts)

local TrainingCamp = {}
TrainingCamp.__index = TrainingCamp

TrainingCamp.COST_PER_SESSION = 50000 -- $50,000 for 7-day intense bootcamp
TrainingCamp.BOOST_DAYS = 7

TrainingCamp.LOCATIONS = {
    {
        id = "jeju-retreat",
        name = "济州岛汉拏山高海拔封闭基地",
        destination = "韩国 · 济州岛火山国家公园",
        country = "韩国",
        emoji = "🌋",
        tagline = "远离尘嚣 · 军事化极制限电作息 · 高海拔心肺意志力淬炼",
        altitude_and_climate = "海拔 1,450米 · 恒温 12℃ 负氧离子微风",
        description = "坐落于济州岛汉拏山麓的独栋隐世基地。完全切断选手社交网络与娱乐干扰，每日由退役冠军教练组与体能训练师展开16小时全封闭军管式特训。",
        mechanics_bonus = 7,
        macro_bonus = 7,
        morale_bonus = 10,
        win_rate_bonus = 0.16,
        tactical_buff_desc = "大赛全员微操 +7 · 大局观 +7 · 士气 +10 · 世界赛 BO5 淘汰赛决胜胜率 +16%",
        schedule = {
            { day = "第 1-2 天", phase = "抗荷体能与时差重构", itinerary = "汉拏山越野晨跑 · 神经反射眼动仪校准 · 个人对线盲操死斗" },
            { day = "第 3-4 天", phase = "首发五虎战术沙盘复盘", itinerary = "无视野地图盲推演练 · 大龙坑拉扯0.5秒技能链连击合练" },
            { day = "第 5-6 天", phase = "高压模拟淘汰赛对抗", itinerary = "全天候约战海外顶级豪门 · 模拟先失两局的让二追三极限逆风局" },
            { day = "第 7 天", phase = "出征誓师与心态巅峰入定", itinerary = "心理督导深度催眠复盘 · 状态锁定 · 启程直奔世界赛主场巨蛋" }
        }
    },
    {
        id = "reykjavik-ice",
        name = "雷克雅未克极地冰原避世营",
        destination = "冰岛 · 雷克雅未克地热冰原",
        country = "冰岛",
        emoji = "❄️",
        tagline = "极夜严寒 · 零下绝对冷静决策 · 冰火淬火抗逆境大心脏",
        altitude_and_climate = "北纬 64° 极光冰原 · 零下 4℃ 极夜静思",
        description = "在冰岛辽阔地热冰川深处打造的冷血竞技温室。用北欧极致纯净与肃杀环境压制选手赛前浮躁焦虑，将团战决策炼成如冰川般坚不可摧的本能。",
        mechanics_bonus = 6,
        macro_bonus = 9,
        morale_bonus = 12,
        win_rate_bonus = 0.18,
        tactical_buff_desc = "大赛大局观 +9 · 全队士气 +12 · 微操 +6 · 逆风局绝境神仙翻盘胜率 +18%",
        schedule = {
            { day = "第 1-2 天", phase = "极地静心耐力耐寒强化", itinerary = "地热温泉解压 · 深度睡眠舱恢复 · 神经抗压阀值拓宽" },
            { day = "第 3-4 天", phase = "冰冷运营：窒息控图兵线", itinerary = "纯视野掠夺打法研讨 · 15分钟摧毁敌方野区经济模型" },
            { day = "第 5-6 天", phase = "零失误冷血团战拆解", itinerary = "0.1秒技能衔接专项训练 · 哪怕仅剩100血也不准后撤" },
            { day = "第 7 天", phase = "极光誓师与杀神心境", itinerary = "极光夜空下全队歃血结盟 · 绝无退路 · 战队凝聚力拉满" }
        }
    },
    {
        id = "wudang-zen",
        name = "武当山云海仙阁静心修道场",
        destination = "中国 · 武当山七十二峰巅峰绝顶",
        country = "中国",
        emoji = "⛩️",
        tagline = "道法自然 · 破除心魔急躁 · 五虎同心默契合一",
        altitude_and_climate = "海拔 1,612米 · 晨雾云海 · 空山鸟鸣禅意",
        description = "隐匿于武当云海之巅的静心修研所。摒除一切商演代言与浮名杂念，通过古法导引与现代脑电波反馈，让首发五虎实现真正心灵相通的心流共鸣。",
        mechanics_bonus = 6,
        macro_bonus = 8,
        morale_bonus = 15,
        win_rate_bonus = 0.17,
        tactical_buff_desc = "大赛士气 +15 · 大局观 +8 · 微操 +6 · 战队羁绊凝聚度 +25 · 团战心流共鸣 +20%",
        schedule = {
            { day = "第 1-2 天", phase = "云海晨钟与破除心魔", itinerary = "崖边打坐入定 · 卸下卫冕压力与外界网络舆论包袱" },
            { day = "第 3-4 天", phase = "不言而喻：五人心流共振", itinerary = "盲麦开黑极限对抗（全队禁语音仅凭动作默契开团）" },
            { day = "第 5-6 天", phase = "以柔克刚：太极借力打力", itinerary = "专攻破除敌方前期激进越塔 · 拖后期无敌团战阵容" },
            { day = "第 7 天", phase = "人剑合一出关下山", itinerary = "金殿叩首出征 · 全员心如止水无所畏惧 · 大赛心态爆表" }
        }
    },
    {
        id = "la-redbull",
        name = "洛杉矶红牛高能竞技研究院",
        destination = "美国 · 加州洛杉矶硅滩前沿科技园",
        country = "美国",
        emoji = "⚡",
        tagline = "神经生物电监控 · 微操手速超频 · 侵略性对线窒息压制",
        altitude_and_climate = "科技恒温恒湿无尘舱 · 全息动态战术穹顶",
        description = "由顶尖运动科学机构打造的电子竞技生物实验室。配备毫秒级眼动仪、神经反射手速刺激手套与高营养配餐，将首发五虎的个人对线压制力拉至极限。",
        mechanics_bonus = 9,
        macro_bonus = 6,
        morale_bonus = 9,
        win_rate_bonus = 0.17,
        tactical_buff_desc = "大赛微操评分 +9 · 士气 +9 · 对线首杀率 +25% · 史诗大龙斩杀胜率 +20%",
        schedule = {
            { day = "第 1-2 天", phase = "毫秒神经生物电超频", itinerary = "闪烁反应测验手速提升 · 极限走A鼠标DPI微调" },
            { day = "第 3-4 天", phase = "对线期15秒窒息压迫", itinerary = "卡兵线换血绝对精确计算 · 压刀压经验模型全解" },
            { day = "第 5-6 天", phase = "野辅双游暴力越塔体系", itinerary = "3级越下塔0失误换抗 · 彻底将对手前期节奏碾碎" },
            { day = "第 7 天", phase = "锋芒毕露直指王冠", itinerary = "全息战术推演定型 · 注入全速战力出征召唤师杯" }
        }
    }
}

function TrainingCamp.getAllLocations()
    return TrainingCamp.LOCATIONS
end

function TrainingCamp.getLocationById(loc_id)
    if not loc_id then return nil end
    for _, loc in ipairs(TrainingCamp.LOCATIONS) do
        if loc.id == loc_id then
            return loc
        end
    end
    return nil
end

function TrainingCamp.startBootcamp(dynasty_state, loc_id)
    local loc = TrainingCamp.getLocationById(loc_id) or TrainingCamp.LOCATIONS[1]
    local cost = TrainingCamp.COST_PER_SESSION
    if (dynasty_state.budget or 0) < cost then
        return false, string.format("俱乐部预算不足，开启【%s】需要 $%d 运营资金！", loc.name, cost)
    end

    dynasty_state.budget = dynasty_state.budget - cost

    -- Apply 7-day bootcamp boost to all roster starters
    local roster = dynasty_state.roster or {}
    local starter_count = math.min(5, #roster)
    for i = 1, starter_count do
        local p = roster[i]
        p.mechanics = math.min(100, (p.mechanics or 75) + loc.mechanics_bonus)
        p.mental = math.min(100, (p.mental or 75) + loc.macro_bonus)
        p.morale = math.min(100, (p.morale or 75) + loc.morale_bonus)
    end

    dynasty_state.active_bootcamp = {
        location_id = loc.id,
        location_name = loc.name,
        days_left = TrainingCamp.BOOST_DAYS,
        win_rate_bonus = loc.win_rate_bonus,
        tactical_buff_desc = loc.tactical_buff_desc
    }

    local msg = string.format("✈️【出征海外特训】首发五虎进驻【%s】！\n%s\n注入 7 天极限巅峰增益，世界赛淘汰赛胜率 +%d%%！",
        loc.name, loc.tactical_buff_desc, math.floor(loc.win_rate_bonus * 100))
    return true, msg
end

function TrainingCamp.advanceDay(dynasty_state)
    if not dynasty_state or not dynasty_state.active_bootcamp then return end
    local camp = dynasty_state.active_bootcamp
    if camp.days_left and camp.days_left > 0 then
        camp.days_left = camp.days_left - 1
        if camp.days_left <= 0 then
            dynasty_state.active_bootcamp = nil
        end
    end
end

return TrainingCamp
