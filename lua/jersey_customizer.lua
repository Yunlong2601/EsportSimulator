--[[
    ============================================================================
    JERSEY CUSTOMIZER (战队定制战袍工坊模块)
    Engine: TapTap Maker / Pure Lua 5.1+ / LuaJIT
    Manages patterns, crest emblems, collar styles, and star signatures
    ============================================================================
--]]

local JerseyCustomizer = {}

JerseyCustomizer.PATTERNS = {
    solid = { name = "纯粹极简", hype = 0 },
    carbon_fiber = { name = "碳纤维几何", hype = 8 },
    neon_grid = { name = "霓虹矩阵", hype = 12 },
    cyber_stripes = { name = "竞速光芒", hype = 10 },
    geometric_camo = { name = "数码迷彩", hype = 11 },
    lightning_split = { name = "雷霆裂变", hype = 14 },
    gold_hex = { name = "至尊金蜂巢", hype = 18 }
}

JerseyCustomizer.CRESTS = {
    dragon_flame = { name = "炽焰炎龙", emoji = "🐉", hype = 5 },
    cyber_phoenix = { name = "赛博不死鸟", emoji = "🦅", hype = 8 },
    apex_tiger = { name = "绝巅白虎", emoji = "🐯", hype = 10 },
    neon_shield = { name = "极光宙斯盾", emoji = "🛡️", hype = 6 },
    quantum_star = { name = "量子星芒", emoji = "⭐", hype = 12 },
    lightning_bolt = { name = "破晓雷霆", emoji = "⚡", hype = 9 }
}

JerseyCustomizer.PRICE_TIERS = {
    fan_edition = { name = "大众助威版", retail = 69, cost = 22, vol_rate = 1.6 },
    pro_player_edition = { name = "职业选手同款", retail = 149, cost = 45, vol_rate = 1.0 },
    collector_golden_box = { name = "夺冠典藏礼盒", retail = 299, cost = 88, vol_rate = 0.45 }
}

function JerseyCustomizer.calculateHypeScore(config)
    local base = 60
    if config.pattern and JerseyCustomizer.PATTERNS[config.pattern] then
        base = base + JerseyCustomizer.PATTERNS[config.pattern].hype
    end
    if config.crest and JerseyCustomizer.CRESTS[config.crest] then
        base = base + JerseyCustomizer.CRESTS[config.crest].hype
    end
    if config.star_signature then
        base = base + 12
    end
    if config.price_tier == "collector_golden_box" then
        base = base + 10
    end
    return math.min(100, math.floor(base))
end

return JerseyCustomizer
