-- ============================================================================
-- JERSEY CUSTOMIZER STUDIO (战队定制战袍工坊与周边商业化系统)
-- Ported from Web: src/components/phase3/JerseyCustomizer.tsx & merchData.ts
-- ============================================================================

local JerseyStudio = {}

JerseyStudio.PATTERNS = {
    { id = "solid", name = "纯粹极简", desc = "经典磨砂哑光质感，凸显战队本色", hypeBoost = 0 },
    { id = "carbon_fiber", name = "碳纤维几何", desc = "高科技斜纹碳纤编织，硬派电竞质感", hypeBoost = 8 },
    { id = "neon_grid", name = "霓虹矩阵", desc = "赛博朋克发光网格透视，年轻潮流风向标", hypeBoost = 12 },
    { id = "cyber_stripes", name = "竞速光芒", desc = "动态双斜切竞技战刃条纹，视觉张力拉满", hypeBoost = 10 },
    { id = "geometric_camo", name = "数码迷彩", desc = "前沿数码切面迷彩，象征无形杀气与战术执行", hypeBoost = 11 },
    { id = "lightning_split", name = "雷霆裂变", desc = "高压闪电胸前贯穿，团战爆发之魂", hypeBoost = 14 },
    { id = "gold_hex", name = "至尊金蜂巢", desc = "王朝冠军六边形镀金蜂窝微晶结构，奢华尊贵", hypeBoost = 18 }
}

JerseyStudio.CRESTS = {
    { id = "dragon_flame", name = "炽焰炎龙", emoji = "🐉", desc = "东方神龙吐息，战意澎湃无坚不摧", bonusHype = 5 },
    { id = "cyber_phoenix", name = "赛博不死鸟", emoji = "🦅", desc = "逆风翻盘涅槃重生，绝境之王徽记", bonusHype = 8 },
    { id = "apex_tiger", name = "绝巅白虎", emoji = "🐯", desc = "雷霆万钧虎踞龙盘，下路核心杀手本色", bonusHype = 7 },
    { id = "iron_shield", name = "守望重盾", emoji = "🛡️", desc = "叹息壁垒坚不可摧，铁壁阵线", bonusHype = 6 }
}

JerseyStudio.COLOR_PRESETS = {
    { name = "暗影霓虹 (Cyber Shadow)", primary = "#090d16", secondary = "#06b6d4", accent = "#a855f7" },
    { name = "赤焰炽金 (Dynasty Crimson)", primary = "#450a0a", secondary = "#f59e0b", accent = "#ef4444" },
    { name = "极光碧翠 (Aurora Emerald)", primary = "#022c22", secondary = "#10b981", accent = "#34d399" },
    { name = "皇家紫曜 (Royal Violet)", primary = "#1e1b4b", secondary = "#818cf8", accent = "#ec4899" },
    { name = "琥珀荣光 (Golden Triumph)", primary = "#1c1917", secondary = "#fbbf24", accent = "#f59e0b" }
}

JerseyStudio.PRICE_TIERS = {
    fan_edition = { name = "大众助威版", retailPrice = 69, unitCost = 22, volumeRate = 1.6, desc = "透气科技速干面料，亲民定价，薄利多销" },
    pro_player_edition = { name = "职业选手同款", retailPrice = 149, unitCost = 45, volumeRate = 1.0, desc = "立体剪裁防静电，刺绣战队队徽与赞助商联名徽章" },
    collector_golden_box = { name = "夺冠至尊典藏礼盒", retailPrice = 299, unitCost = 88, volumeRate = 0.45, desc = "纯金线绣线、专属编号烫印、附带亲笔签名证书" }
}

function JerseyStudio.initJerseyConfig()
    return {
        pattern = "cyber_stripes",
        crest = "cyber_phoenix",
        colorPreset = "暗影霓虹 (Cyber Shadow)",
        starPlayer = "Prodigy",
        priceTier = "pro_player_edition",
        hypeScore = 80,
        weeklyUnits = 320,
        projectedRevenue = 47680
    }
end

function JerseyStudio.calculateHypeAndSales(config, rosterPopularityMultiplier)
    rosterPopularityMultiplier = rosterPopularityMultiplier or 1.2
    local base = 60

    -- Pattern bonus
    for _, p in ipairs(JerseyStudio.PATTERNS) do
        if p.id == config.pattern then
            base = base + p.hypeBoost
            break
        end
    end

    -- Crest bonus
    for _, c in ipairs(JerseyStudio.CRESTS) do
        if c.id == config.crest then
            base = base + c.bonusHype
            break
        end
    end

    if config.starPlayer and config.starPlayer ~= "" then
        base = base + 12
    end

    local tier = JerseyStudio.PRICE_TIERS[config.priceTier] or JerseyStudio.PRICE_TIERS.pro_player_edition
    if config.priceTier == "collector_golden_box" then
        base = base + 10
    end

    local finalHype = math.min(100, math.max(50, base))
    local weeklyUnits = math.floor(280 * tier.volumeRate * (finalHype / 80) * rosterPopularityMultiplier)
    local weeklyRevenue = weeklyUnits * tier.retailPrice
    local weeklyProfit = weeklyUnits * (tier.retailPrice - tier.unitCost)

    config.hypeScore = finalHype
    config.weeklyUnits = weeklyUnits
    config.projectedRevenue = weeklyRevenue
    config.weeklyProfit = weeklyProfit

    return finalHype, weeklyUnits, weeklyRevenue, weeklyProfit
end

return JerseyStudio
