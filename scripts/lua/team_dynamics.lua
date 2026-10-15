-- scripts/lua/team_dynamics.lua
-- Team Dynamics, Tactical Presets & Pair Chemistry Matrix
-- Ported from Web React prototype (src/data/teamDynamicsData.ts & TeamDynamicsSection.tsx)

local TeamDynamics = {}
TeamDynamics.__index = TeamDynamics

TeamDynamics.PRESETS = {
    {
        id = "mid_jgl_engine",
        name = "中野代练驱动 · 经典双核 (Mid-Jungle Engine)",
        tagline = "将中路与打野绑定为最高指挥核，下路稳健控线，上路孤岛牵制",
        badge = "⚡ 节奏发动机",
        desc = "最具统治力的职业传统阵型。中野前中期快速清线入侵游走，控下第一条先锋后盘活全局。",
        buff_label = "中野入侵节奏 +18% · 先手控先锋率 +22%",
        power_bonus = 8
    },
    {
        id = "bot_centric_hypercarry",
        name = "四保一 · 下路死神风暴 (Bot-Centric Hypercarry)",
        tagline = "资源无上限倾斜大核射手，野辅贴身死保，单带上路提供前排肉盾",
        badge = "🏹 绝对死神核",
        desc = "经典稳健运营流派。前中期牺牲野区主动权换取射手装备成型，后期团战摧枯拉朽灭队。",
        buff_label = "射手后期团战输出 +25% · 大龙坑拉扯胜率 +18%",
        power_bonus = 10
    },
    {
        id = "top_side_heavy_bruiser",
        name = "重装上阵 · 上中野血腥肉搏 (Top-Side Heavy Bruiser)",
        tagline = "上中野全部选取重装狂暴战士与刺客，打法刚烈，野区逢战必接",
        badge = "🪓 绞肉血战流",
        desc = "将战火在20分钟前彻底点燃。通过高频越塔与无解技能换血建立压制性击杀雪球。",
        buff_label = "前15分钟越塔对线压制率 +24% · 敌方野区压制 +20%",
        power_bonus = 9
    },
    {
        id = "global_macro_split",
        name = "全局兵线运营 · 窒息 1-3-1 分推 (Global Macro Split)",
        tagline = "双边路单带牵制，中路三人抱团消耗清线，利用视野差蚕食防御塔",
        badge = "🌐 兵线运筹大师",
        desc = "纯粹的大局观运营流派。不与敌人盲目打5v5大招对撞，利用无解兵线逼死对手。",
        buff_label = "防御塔拆解效率 +30% · 视野盲区抓单胜率 +20%",
        power_bonus = 7
    }
}

function TeamDynamics.getAllPresets()
    return TeamDynamics.PRESETS
end

function TeamDynamics.getPresetById(preset_id)
    if not preset_id then return nil end
    for _, p in ipairs(TeamDynamics.PRESETS) do
        if p.id == preset_id then
            return p
        end
    end
    return nil
end

function TeamDynamics.calculatePairChemistry(p1, p2)
    if not p1 or not p2 then return 50 end
    local base = 70

    -- Playstyle alignment
    local ps1 = p1.playstyle or "Aggressive"
    local ps2 = p2.playstyle or "Macro-Oriented"
    if ps1 == ps2 then
        base = base + 15
    elseif (ps1 == "Aggressive" and ps2 == "Clutch") or (ps1 == "Macro-Oriented" and ps2 == "Aggressive") then
        base = base + 10
    end

    -- Morale & Mechanics factor
    local avg_morale = ((p1.morale or 80) + (p2.morale or 80)) / 2
    if avg_morale >= 85 then
        base = base + 8
    elseif avg_morale < 60 then
        base = base - 10
    end

    return math.min(100, math.max(30, base))
end

function TeamDynamics.calculateTeamState(roster, current_preset_id)
    local preset = TeamDynamics.getPresetById(current_preset_id) or TeamDynamics.PRESETS[1]
    local starters = {}
    local total_chem = 0
    local pair_count = 0

    local n = math.min(5, #(roster or {}))
    for i = 1, n do
        table.insert(starters, roster[i])
    end

    -- Calculate all pairs among starters
    for i = 1, #starters do
        for j = i + 1, #starters do
            local chem = TeamDynamics.calculatePairChemistry(starters[i], starters[j])
            total_chem = total_chem + chem
            pair_count = pair_count + 1
        end
    end

    local avg_chem = pair_count > 0 and math.floor(total_chem / pair_count) or 75
    local synergy_level = "S"
    if avg_chem >= 90 then
        synergy_level = "SSS (心流共鸣)"
    elseif avg_chem >= 80 then
        synergy_level = "S (心有灵犀)"
    elseif avg_chem >= 65 then
        synergy_level = "A (良好协作)"
    else
        synergy_level = "B (磨合生疏)"
    end

    return {
        preset = preset,
        average_chemistry = avg_chem,
        synergy_level = synergy_level,
        synergy_power_bonus = preset.power_bonus + math.floor((avg_chem - 70) * 0.2)
    }
end

return TeamDynamics
