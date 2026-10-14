--[[
    ============================================================================
    FEATURES_LOGIC.LUA (TapTap Make Execution Logic)
    ============================================================================
    Executable Logic for Calculations & Probability Tests
--]]

local Data = require("gamedata_features")

local FeaturesLogic = {}

-- 1. Gacha 10-Pull Simulation (Only available in Phase 3 Dynasty / 传奇豪门)
function FeaturesLogic.pull_10x(current_phase, is_dynasty_unlocked)
    if (current_phase and current_phase < 3) and not is_dynasty_unlocked then
        return nil, "【未解锁】全球星探 · SSS 神级选手招募仅在【第三阶段 · 传奇豪门】俱乐部总经理身份下解锁！"
    end

    local results = {}
    for i = 1, 10 do
        local roll = math.random()
        if roll <= Data.gacha.rates.SSS or Data.gacha.pity_count <= 1 then
            table.insert(results, { tier = "SSS", name = "Vortex (神级中单)", ovr = 99, role = "MID" })
            Data.gacha.pity_count = 10 -- Reset pity
        elseif roll <= Data.gacha.rates.SSR then
            table.insert(results, { tier = "SSR", name = "Hyper (绝活ADC)", ovr = 95, role = "ADC" })
        elseif roll <= Data.gacha.rates.SR then
            table.insert(results, { tier = "SR", name = "Zephyr (破晓打野)", ovr = 88, role = "JNG" })
        else
            table.insert(results, { tier = "R", name = "Rookie (二队青训练习生)", ovr = 78, role = "MID" })
        end
        Data.gacha.pity_count = math.max(0, Data.gacha.pity_count - 1)
    end
    return results
end

-- Single pull (Only available in Phase 3 Dynasty / 传奇豪门)
function FeaturesLogic.pull_1x(current_phase, is_dynasty_unlocked)
    if (current_phase and current_phase < 3) and not is_dynasty_unlocked then
        return nil, "【未解锁】全球星探 · SSS 神级选手招募仅在【第三阶段 · 传奇豪门】俱乐部总经理身份下解锁！"
    end

    local roll = math.random()
    local item = nil
    if roll <= Data.gacha.rates.SSS or Data.gacha.pity_count <= 1 then
        item = { tier = "SSS", name = "Vortex (神级中单)", ovr = 99, role = "MID" }
        Data.gacha.pity_count = 10
    elseif roll <= Data.gacha.rates.SSR then
        item = { tier = "SSR", name = "Hyper (绝活ADC)", ovr = 95, role = "ADC" }
    elseif roll <= Data.gacha.rates.SR then
        item = { tier = "SR", name = "Zephyr (破晓打野)", ovr = 88, role = "JNG" }
    else
        item = { tier = "R", name = "Rookie (二队青训练习生)", ovr = 78, role = "MID" }
    end
    Data.gacha.pity_count = math.max(0, Data.gacha.pity_count - 1)
    return item
end

-- 2. Hardware Overclock APM Calculation & Risk
function FeaturesLogic.set_overclock_rate(new_rate_pct)
    Data.hardware_rig.overclock_pct = math.min(130, math.max(100, new_rate_pct))
    local multiplier = Data.hardware_rig.overclock_pct / 100
    local final_apm_boost = math.floor(1420 * multiplier)
    local fatigue_penalty = (multiplier > 1.15) and 15 or 0
    Data.hardware_rig.total_apm_bonus = final_apm_boost
    return final_apm_boost, fatigue_penalty
end

-- 3. Clutch Tactical Decision Check
function FeaturesLogic.execute_tactical_choice(option_id)
    local opt = nil
    for _, o in ipairs(Data.tactical_arena.options) do
        if o.id == option_id then
            opt = o
            break
        end
    end
    if not opt then return false, "无效选项" end
    if Data.tactical_arena.coach_tactical_points < opt.cost_tp then
        return false, "教练战术点不足！"
    end

    Data.tactical_arena.coach_tactical_points = Data.tactical_arena.coach_tactical_points - opt.cost_tp
    local roll = math.random(1, 100)
    local is_clutch = roll <= opt.success_rate

    return is_clutch, is_clutch and opt.reward or opt.risk
end

-- 4. Life Sim Daily Action
function FeaturesLogic.handle_life_event(option_id, player_stats)
    local opt = nil
    for _, o in ipairs(Data.life_sim.active_event.options) do
        if o.id == option_id then opt = o break end
    end
    if not opt then return false, "无效决策" end

    if opt.cost_money and player_stats and player_stats.money < opt.cost_money then
        return false, "俱乐部运营资金不足！"
    end

    if opt.cost_money and player_stats then
        player_stats.money = player_stats.money - opt.cost_money
    end

    Data.life_sim.team_stress_pct = math.max(0, math.min(100, Data.life_sim.team_stress_pct + opt.stress_delta))
    if opt.apm_delta and player_stats then
        player_stats.mechanics = math.min(100, player_stats.mechanics + opt.apm_delta)
    end

    return true, "决策已执行，战队心态值更新为: " .. Data.life_sim.team_stress_pct .. "%"
end

-- 5. Upgrade Synergy Link
function FeaturesLogic.upgrade_synergy(code)
    for _, pair in ipairs(Data.synergy_network.pairs) do
        if pair.code == code then
            if pair.lv >= (pair.max_lv or 5) then
                return false, "已达到最高默契等级！"
            end
            pair.lv = pair.lv + 1
            if pair.lv >= (pair.max_lv or 5) then pair.is_max = true end
            Data.synergy_network.overcharge_pct = math.min(100, Data.synergy_network.overcharge_pct + 1.5)
            return true, "默契升级成功！当前等级: LV." .. pair.lv
        end
    end
    return false, "未找到该羁绊"
end

return FeaturesLogic
