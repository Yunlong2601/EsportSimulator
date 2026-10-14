--[[
    ============================================================================
    TAPTAP MAKE: PRESTIGE & NEW GAME+ REPLAYABILITY SYSTEM (LUA ENGINE)
    ============================================================================
    Target Platform: TapTap Make (Mobile Portrait Text-Simulator Engine)
    Language: Pure Lua 5.1 / 5.2 / 5.3 / LuaJIT
    Encoding: UTF-8 (全部中文叙事与战术文本)

    系统概述：
      1. 轮回转生与名宿声望 (Prestige New Game+)：多周目难度阶梯与代数记录；
      2. 永久肉鸽传承天赋树 (Legacy Passives Tree)：四大流派12项永久神级被动；
      3. 局内肉鸽挑战词条 (Run Modifiers)：修罗难度词条与结算声望倍率增益；
      4. 多元职业结局图鉴 (Career Endings Collection)：六大传奇分支结局。
--]]

local PrestigeSystem = {}
PrestigeSystem.__index = PrestigeSystem

-- 4大流派永久传承天赋树
PrestigeSystem.LEGACY_PASSIVES = {
    -- 微操神经派 (Mechanics & Reflexes)
    {
        id = "passive_muscle_memory",
        name = "宗师肌肉记忆",
        branch = "mechanics",
        tier = 1,
        cost = 120,
        icon = "⚡",
        desc = "前世千锤百炼的手部肌肉神经记忆刻入灵魂。新周目初始微操+15，单排基础胜率额外+8%。",
        bonus = "初始微操+15，单排胜率+8%"
    },
    {
        id = "passive_bullet_time",
        name = "极限子弹时间",
        branch = "mechanics",
        tier = 2,
        cost = 250,
        icon = "🎯",
        desc = "1v1微操判定窗口放宽25%，完成极限单杀额外奖励+30 LP与$50。",
        bonus = "微操反应时间+25%，单杀额外+30 LP & $50"
    },
    {
        id = "passive_deep_champ_pool",
        name = "深不可测英雄海",
        branch = "mechanics",
        tier = 3,
        cost = 450,
        icon = "👑",
        desc = "BP阶段自身克制加成提升35%，对线微操上限突破至110点。",
        bonus = "BP克制威力+35%，微操上限突破至110"
    },

    -- 战术战役派 (Tactics & Macro)
    {
        id = "passive_tactical_precognition",
        name = "上帝预判之眼",
        branch = "tactics",
        tier = 1,
        cost = 100,
        icon = "🧠",
        desc = "脑内自带职业战术录像库。洞悉敌方战术，初始心态+12。",
        bonus = "初始心态+12，洞悉敌方BP弱点"
    },
    {
        id = "passive_shotcaller_core",
        name = "天人合一指挥官",
        branch = "tactics",
        tier = 2,
        cost = 240,
        icon = "🎙️",
        desc = "团战秒杀与奇迹反打概率+25%，关键局系列赛心态崩盘几率清零。",
        bonus = "奇迹团战率+25%，免疫心态溃散"
    },
    {
        id = "passive_dragon_baron_whisperer",
        name = "远古神兽猎手",
        branch = "tactics",
        tier = 3,
        cost = 420,
        icon = "🐉",
        desc = "决胜局抢龙胜率提高40%，大龙buff团战战力额外+30%。",
        bonus = "大龙远古龙抢龙率+40%，龙团战力+30%"
    },

    -- 商业帝国派 (Commercial & Media)
    {
        id = "passive_fame_inheritance",
        name = "跨代名宿光环",
        branch = "commercial",
        tier = 1,
        cost = 110,
        icon = "🌟",
        desc = "电竞圈名宿传说。新周目继承+20知名度，直播吸粉增速+50%。",
        bonus = "初始知名度+20，直播吸粉增速+50%"
    },
    {
        id = "passive_wall_street_mind",
        name = "资本博弈大鳄",
        branch = "commercial",
        tier = 2,
        cost = 260,
        icon = "💼",
        desc = "赞助与经纪约报酬溢价+45%，俱乐部赞助商签约金额外提高35%。",
        bonus = "赞助与签约报酬溢价+45%"
    },
    {
        id = "passive_seed_venture_fund",
        name = "天使启动信托",
        branch = "commercial",
        tier = 3,
        cost = 480,
        icon = "🏦",
        desc = "电竞信托基金。每次轮回开局直接附赠$200,000天使创业金！",
        bonus = "开局自带$200,000巨额信托金"
    },

    -- 职业长青派 (Longevity & Recovery)
    {
        id = "passive_titanium_wrist",
        name = "钛合金手腕",
        branch = "longevity",
        tier = 1,
        cost = 130,
        icon = "🛡️",
        desc = "排位手部积劳增长降低50%，彻底免疫中度与重度腱鞘炎(RSI)。",
        bonus = "手部劳损增长-50%，免疫重度腱鞘炎"
    },
    {
        id = "passive_infinite_battery",
        name = "无限体能引擎",
        branch = "longevity",
        tier = 2,
        cost = 250,
        icon = "⚡",
        desc = "睡眠休整恢复提升50%，专注度消耗减半，通宵训练不掉状态。",
        bonus = "休整效果+50%，专注度消耗减半"
    },
    {
        id = "passive_phoenix_rebirth",
        name = "凤凰涅槃道体",
        branch = "longevity",
        tier = 3,
        cost = 500,
        icon = "🔥",
        desc = "生死局落后时全员战力爆发+25%，逆境翻盘胜率提高50%。",
        bonus = "绝境战力爆发+25%，逆风翻盘几率翻倍"
    }
}

-- 局内肉鸽挑战词条
PrestigeSystem.RUN_MODIFIERS = {
    {
        id = "mod_wrist_injury",
        name = "手疾旧患",
        category = "curse",
        stars = 2,
        multiplier = 0.25,
        desc = "手腕积劳累积速度增加80%，休整恢复费用上涨30%。",
        flavor = "“每一次狂风骤雨的操作，都在燃烧选手的职业寿命。”"
    },
    {
        id = "mod_toxic_ladder",
        name = "恶劣峡谷",
        category = "curse",
        stars = 3,
        multiplier = 0.35,
        desc = "单排天梯演员几率大增，心态受损翻倍。",
        flavor = "“弱肉强食与人心险恶的修罗场。”"
    },
    {
        id = "mod_market_winter",
        name = "资本严冬",
        category = "curse",
        stars = 3,
        multiplier = 0.40,
        desc = "赞助签约金降低40%，明星转会费暴涨35%。",
        flavor = "“泡沫退去，只有铁血豪门方能立足。”"
    },
    {
        id = "mod_patch_chaos",
        name = "版本暴击",
        category = "wildcard",
        stars = 4,
        multiplier = 0.45,
        desc = "每场比赛随机强化敌方特定阵容20%，BP克制容错极低。",
        flavor = "“冷门英雄瞬间封神，主流体系一夜作废。”"
    },
    {
        id = "mod_ironman_permadeath",
        name = "修罗铁人",
        category = "curse",
        stars = 5,
        multiplier = 0.60,
        desc = "重要系列赛若以0-3惨败，直接强制退役结算。",
        flavor = "“无退路，无侥幸，唯有胜利方可苟存。”"
    },
    {
        id = "mod_speed_rush",
        name = "疾风急躁",
        category = "wildcard",
        stars = 2,
        multiplier = 0.20,
        desc = "晋级赛胜负LP变动加倍(x2)，大起大落！",
        flavor = "“必须在最短时间内冲上云霄！”"
    }
}

-- 多元职业结局图鉴
PrestigeSystem.CAREER_ENDINGS = {
    {
        id = "ending_goat",
        title = "👑 召唤师峡谷唯一真神 (The GOAT)",
        category = "GOAT",
        badge = "GOAT · 不朽神话",
        lore = "率队夺冠且个人微操与粉丝影响力登顶世界第一，无数新星以你为榜样，雕像矗立在首尔与上海电竞广场之上！",
        req = "世界赛夺冠 + 微操达到80+ + 知名度达到80+"
    },
    {
        id = "ending_legendary_coach",
        title = "👔 功勋教父 · 三冠战术总监 (The Mastermind)",
        category = "COACH",
        badge = "战术宗师 · 冠军教父",
        lore = "退役后执教豪门与国家队，带领全新人阵容连夺世界冠军与亚运金牌，被尊称为电竞战术界最具威望的教父！",
        req = "赛区或世界冠军 + 研发满级战术分析室"
    },
    {
        id = "ending_tycoon_ceo",
        title = "💼 资本巨鳄 · 纳斯达克俱乐部总裁 (Esports Tycoon)",
        category = "CEO",
        badge = "商业帝国 · 独角兽CEO",
        lore = "退役后将俱乐部打造为全球估值超10亿美元商业独角兽，连锁电竞馆遍布全球，成功敲钟纳斯达克！",
        req = "俱乐部资产突破$1,500,000或完成夺冠"
    },
    {
        id = "ending_million_streamer",
        title = "🎙️ 现象级一哥 · 千万级电竞巨星 (Top Broadcaster)",
        category = "STREAMER",
        badge = "顶流主播 · 峡谷相声大师",
        lore = "二路解说世界赛在线突破千万，成为电竞跨界头号超级网红，商业带货与出场费碾压传统演艺明星！",
        req = "直播订阅达到20,000+ 或 知名度达到80+"
    },
    {
        id = "ending_foreign_legion",
        title = "✈️ 跨赛区征服者 · 大满贯外援传奇 (Grand Slam Legend)",
        category = "FOREIGN_EXP",
        badge = "大满贯征服者",
        lore = "远赴欧美赛区带领常年垫底弱旅完成奇迹夺冠，达成横跨四大赛区皆斩获第一的神话！",
        req = "进入第2周目以上(NG+2)并完成世界赛夺冠"
    },
    {
        id = "ending_hall_of_fame",
        title = "🏛️ 电竞名人堂 · 终身成就伟人 (Hall of Fame Immortal)",
        category = "LEGEND_IMMORTAL",
        badge = "名人堂 · 终身成就奖",
        lore = "全票入选国际电竞名人堂，官方为你定制专属名人堂签名皮肤与纪录片，名字永垂青史！",
        req = "累计获得名宿声望达到800点以上"
    }
}

function PrestigeSystem.new()
    local self = setmetatable({}, PrestigeSystem)
    self.generation = 1
    self.prestige_points = 0
    self.lifetime_prestige = 0
    self.difficulty_multiplier = 1.0
    self.unlocked_passives = {}
    self.active_modifiers = {}
    self.unlocked_endings = {}
    self.total_runs_completed = 0
    return self
end

function PrestigeSystem:getDifficultyMultiplier(gen)
    gen = gen or self.generation
    if gen <= 1 then return 1.0 end
    if gen == 2 then return 1.25 end
    if gen == 3 then return 1.55 end
    if gen == 4 then return 1.90 end
    return 1.90 + (gen - 4) * 0.35
end

function PrestigeSystem:calculatePrestigeYield(wonWorlds, wonRegional, reachedChallenger, money, fame)
    local base = 0
    local logs = {}

    if wonWorlds then
        base = base + 350
        table.insert(logs, "🏆 捧起召唤师总冠军奖杯: +350 声望")
    elseif wonRegional then
        base = base + 180
        table.insert(logs, "⭐ 斩获职业联赛赛区冠军: +180 声望")
    elseif reachedChallenger then
        base = base + 80
        table.insert(logs, "🌟 登顶峡谷之巅最强王者: +80 声望")
    else
        base = base + 30
        table.insert(logs, "🎮 基础退役经验结算: +30 声望")
    end

    local moneyBonus = math.min(150, math.floor(money / 20000))
    if moneyBonus > 0 then
        base = base + moneyBonus
        table.insert(logs, string.format("💰 生涯资本积累 ($%d): +%d 声望", money, moneyBonus))
    end

    local fameBonus = math.floor(fame * 0.8)
    if fameBonus > 0 then
        base = base + fameBonus
        table.insert(logs, string.format("🌟 粉丝影响力 (%d): +%d 声望", fame, fameBonus))
    end

    -- 词条倍率计算
    local modMultiplier = 0
    for _, modId in ipairs(self.active_modifiers) do
        for _, mod in ipairs(PrestigeSystem.RUN_MODIFIERS) do
            if mod.id == modId then
                modMultiplier = modMultiplier + mod.multiplier
            end
        end
    end

    local bonus = math.floor(base * modMultiplier)
    if bonus > 0 then
        table.insert(logs, string.format("⚡ 肉鸽挑战词条增益 (+%d%%): +%d 声望", math.floor(modMultiplier * 100), bonus))
    end

    local genBonus = self.generation > 1 and math.floor(base * (self.generation - 1) * 0.15) or 0
    if genBonus > 0 then
        table.insert(logs, string.format("🔁 第 %d 周目难度加权: +%d 声望", self.generation, genBonus))
    end

    local total = base + bonus + genBonus
    return total, logs
end

function PrestigeSystem:unlockPassive(passiveId)
    for _, p in ipairs(self.unlocked_passives) do
        if p == passiveId then
            return false, "该传承天赋已解锁"
        end
    end

    local target = nil
    for _, p in ipairs(PrestigeSystem.LEGACY_PASSIVES) do
        if p.id == passiveId then
            target = p
            break
        end
    end

    if not target then
        return false, "未找到指定传承天赋"
    end

    if self.prestige_points < target.cost then
        return false, string.format("声望点数不足，需 %d 点 (当前: %d)", target.cost, self.prestige_points)
    end

    self.prestige_points = self.prestige_points - target.cost
    table.insert(self.unlocked_passives, passiveId)
    return true, string.format("成功点亮永久传承天赋【%s】！(%s)", target.name, target.bonus)
end

function PrestigeSystem:hasPassive(passiveId)
    for _, p in ipairs(self.unlocked_passives) do
        if p == passiveId then return true end
    end
    return false
end

function PrestigeSystem:toggleModifier(modId)
    for i, m in ipairs(self.active_modifiers) do
        if m == modId then
            table.remove(self.active_modifiers, i)
            return false, "已禁用词条"
        end
    end
    table.insert(self.active_modifiers, modId)
    return true, "已启用词条"
end

function PrestigeSystem:hasModifier(modId)
    for _, m in ipairs(self.active_modifiers) do
        if m == modId then return true end
    end
    return false
end

return PrestigeSystem
