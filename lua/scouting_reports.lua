local ScoutingReports = {}
ScoutingReports.__index = ScoutingReports

ScoutingReports.FIXED_SCOUT_FEE = 20000

function ScoutingReports.generateHiddenPotential(player)
    local base_rating = player.rating or 88
    return {
        clutch_factor = math.min(99, math.floor(base_rating * 0.95 + 4)),
        growth_cap = math.min(99, math.max(90, base_rating + 5)),
        tilt_resistance = math.min(99, math.floor(base_rating * 0.92 + 6)),
        champion_mastery = math.min(99, math.floor(base_rating * 0.9 + 8)),
        verdict = string.format("该选手具备 %d 分顶尖成长天花板，大心脏决胜能力极其优异！", math.min(99, base_rating + 5))
    }
end

function ScoutingReports.requestDeepScout(player, current_budget)
    if current_budget < ScoutingReports.FIXED_SCOUT_FEE then
        return nil, "资金不足，需支付 ¥20,000 情报研判费"
    end
    local report = ScoutingReports.generateHiddenPotential(player)
    return report, nil
end

return ScoutingReports
