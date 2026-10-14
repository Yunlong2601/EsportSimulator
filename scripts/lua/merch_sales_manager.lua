--[[
    ============================================================================
    MERCH SALES MANAGER (战队周边与官方战袍销售结算引擎)
    Engine: TapTap Maker / Pure Lua 5.1+ / LuaJIT
    Calculates weekly passive sales, flash drops, popularity & tournament boosts
    ============================================================================
--]]

local MerchSalesManager = {}

-- 1. Calculate player popularity score
function MerchSalesManager.calculatePlayerPopularity(roster)
    if not roster or #roster == 0 then
        return { avg_popularity = 80, star_player = nil, signature_multiplier = 1.0 }
    end

    local total = 0
    local star = roster[1]
    for _, p in ipairs(roster) do
        local power = (p.mechanics or 80) * 0.5 + (p.macro or 80) * 0.3 + (p.morale or 80) * 0.2
        total = total + power
        if (p.marketValue or 0) > (star.marketValue or 0) then
            star = p
        end
    end

    local avg = math.floor(total / #roster)
    local sig_mult = 1.0 + math.max(0, (avg - 75) * 0.015)
    return {
        avg_popularity = avg,
        star_player = star,
        signature_multiplier = tonumber(string.format("%.2f", sig_mult))
    }
end

-- 2. Calculate tournament success factor
function MerchSalesManager.calculateTournamentSuccess(dynasty)
    local worlds_won = dynasty.worldChampionshipsWon or 0
    local trophies = dynasty.trophies or {}
    local mult = 1.0

    if worlds_won > 0 then
        mult = mult + (worlds_won * 0.35)
    end
    if #trophies > 0 then
        mult = mult + math.min(0.3, #trophies * 0.1)
    end

    return {
        multiplier = tonumber(string.format("%.2f", mult)),
        titles_count = worlds_won + #trophies
    }
end

-- 3. Calculate weekly passive revenue
function MerchSalesManager.calculateWeeklyPassiveRevenue(dynasty, target_week)
    local fanbase = (dynasty.communityRelations and dynasty.communityRelations.totalFanbaseCount) or 150000
    local fanbase_mult = (dynasty.communityRelations and dynasty.communityRelations.fanbaseMultiplier) or 1.25
    local pop = MerchSalesManager.calculatePlayerPopularity(dynasty.roster or {})
    local tour = MerchSalesManager.calculateTournamentSuccess(dynasty)

    local jersey_hype = (dynasty.merchShop and dynasty.merchShop.jerseyConfig and dynasty.merchShop.jerseyConfig.hypeScore) or 80
    local hype_factor = 1.0 + (jersey_hype * 0.005)
    local base_scale = math.max(0.8, math.log10(fanbase / 10000)) * fanbase_mult

    -- Standard catalog passive units
    local base_jersey_units = math.floor(320 * hype_factor * pop.signature_multiplier * base_scale * tour.multiplier)
    local jersey_price = 149
    local jersey_cost = 45
    local passive_revenue = base_jersey_units * jersey_price
    local net_profit = base_jersey_units * (jersey_price - jersey_cost)

    return {
        week = target_week or 1,
        passive_units = base_jersey_units,
        passive_revenue = passive_revenue,
        net_profit = net_profit,
        fanbase_mult = fanbase_mult,
        tournament_mult = tour.multiplier,
        signature_mult = pop.signature_multiplier
    }
end

-- 4. Trigger instantaneous flash sale drop
function MerchSalesManager.triggerFlashSaleDrop(dynasty, custom_theme)
    local fanbase = (dynasty.communityRelations and dynasty.communityRelations.totalFanbaseCount) or 150000
    local fanbase_mult = (dynasty.communityRelations and dynasty.communityRelations.fanbaseMultiplier) or 1.25
    local pop = MerchSalesManager.calculatePlayerPopularity(dynasty.roster or {})
    local tour = MerchSalesManager.calculateTournamentSuccess(dynasty)

    local spike_mult = 2.4 * fanbase_mult * tour.multiplier * pop.signature_multiplier
    local base_units = math.floor(900 + math.sqrt(fanbase) * 2.5)
    local units_sold = math.floor(base_units * spike_mult)

    local unit_price = 149
    local unit_cost = 45
    local spike_revenue = units_sold * unit_price
    local net_profit = spike_revenue - (units_sold * unit_cost)

    return {
        units_sold = units_sold,
        spike_revenue = spike_revenue,
        net_profit = net_profit,
        theme = custom_theme or "🏆【夺冠限定】明星签名战袍首发空投",
        message = "限量战袍抢购瞬间告罄！入账流水 $" .. spike_revenue
    }
end

return MerchSalesManager
