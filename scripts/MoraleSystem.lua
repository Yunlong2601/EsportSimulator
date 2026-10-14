-- MoraleSystem：选手士气
-- 选手不是数值：胜负、挂牌、租借都会影响士气，士气反过来影响战力、身价、
-- AI 求购意愿与续约谈判——「一对一谈话」是玩家调节士气的操作。
-- 借鉴 FM 球员士气/更衣室关系与 TM2 选手心理状态。
local CompanyState = require("CompanyState")
local LeagueCatalog = require("LeagueCatalog")
local StaffSystem = require("StaffSystem")

local MoraleSystem = {}

MoraleSystem.DEFAULT = 60
MoraleSystem.TALK_COST = 5

local function clamp(value, minimum, maximum)
    return math.max(minimum, math.min(maximum, tonumber(value) or minimum))
end

function MoraleSystem.Get(player)
    return tonumber(player and player.morale) or MoraleSystem.DEFAULT
end

function MoraleSystem.Change(player, delta)
    if not player then return end
    player.morale = clamp((tonumber(player.morale) or MoraleSystem.DEFAULT) + delta, 0, 100)
end

-- 士气档位与显示文案
function MoraleSystem.GetMood(player)
    local m = MoraleSystem.Get(player)
    if m >= 80 then return " 士气高涨", m, "high" end
    if m >= 60 then return " 状态平稳", m, "ok" end
    if m >= 40 then return " 有所不满", m, "low" end
    return " 情绪低落", m, "critical"
end

-- 战力修正：士气每偏离 60 一分，影响 0.03 战力
function MoraleSystem.GetPowerMod(player)
    return (MoraleSystem.Get(player) - MoraleSystem.DEFAULT) * 0.03
end

-- 身价修正：士气 60 → 1.0，每 ±1 分 ±0.4%
function MoraleSystem.GetValueFactor(player)
    return 1 + (MoraleSystem.Get(player) - MoraleSystem.DEFAULT) * 0.004
end

-- 转会意愿：低士气想走、高士气忠诚
function MoraleSystem.WantsTransfer(player)
    local m = MoraleSystem.Get(player)
    if m < 45 then return true end
    if m > 80 then return false end
    return math.random() < 0.3
end

-- 周结算：全员士气随胜负与处境浮动
function MoraleSystem.UpdateAll(state, won)
    state = CompanyState.Ensure(state)
    local RosterSystem = require("RosterSystem")
    local StaffSystem = require("StaffSystem")
    local stability = StaffSystem.GetMoraleStability(state)  -- P2-⑧ 心理师：降低波动
    for _, entry in ipairs(RosterSystem.GetRosterPlayers(state)) do
        local player = entry.player
        local delta = won and 3 or -2
        delta = math.floor(delta * (1 - stability) + 0.5)  -- 心理师降低波动幅度
        if state.market.listed and state.market.listed[player.id] then
            delta = delta - 4 -- 挂牌：被摆上货架打击心态
        end
        local MarketSystem = require("MarketSystem")
        if MarketSystem.IsLoaned(state, player.id) then
            delta = delta - 3 -- 租借：寄人篱下
        end
        MoraleSystem.Change(player, delta)
    end
    return state
end

-- 冠军时刻士气激励
function MoraleSystem.Celebrate(state)
    state = CompanyState.Ensure(state)
    local RosterSystem = require("RosterSystem")
    for _, entry in ipairs(RosterSystem.GetRosterPlayers(state)) do
        MoraleSystem.Change(entry.player, 8)
    end
    return state
end

-- 续约成本：士气高打折、士气低加价
function MoraleSystem.GetRenewCost(state, player)
    state = CompanyState.Ensure(state)
    local base = (tonumber(player and player.salary) or 0) * 4
    local m = MoraleSystem.Get(player)
    local factor = 1.0
    if m >= 75 then factor = 0.8 end
    if m < 45 then factor = 1.3 end
    if player and player.id then
        local MarketSystem = require("MarketSystem")
        local desire = MarketSystem.GetDesire(state, player.id)
        if desire >= 70 then factor = factor * 1.25
        elseif desire <= 30 then factor = factor * 0.85 end
    end
    return math.max(1, math.floor(base * factor + 0.5))
end

-- 续约意愿：低士气选手可能拒绝续约
function MoraleSystem.WantsRenew(player)
    local m = MoraleSystem.Get(player)
    if m >= 45 then return true end
    return math.random() < 0.65
end

-- 一对一谈话：每周一人，成本 5 万（运营折扣），士气 +8（低落选手额外 +4）
function MoraleSystem.TalkToPlayer(state, playerId)
    state = CompanyState.Ensure(state)
    local player = LeagueCatalog.GetPlayer(playerId)
    if not player then return false, "选手不存在" end
    if state.roster.talkedPlayer == playerId then
        return false, "本周已与 " .. player.name .. " 深谈过"
    end
    if state.roster.talkedPlayer then
        return false, "本周已与其他选手沟通过，下周再谈"
    end
    local cost = StaffSystem.GetEventCost(state, MoraleSystem.TALK_COST)
    if state.company.cash < cost then return false, "现金不足" end
    state.company.cash = state.company.cash - cost
    state.roster.talkedPlayer = playerId
    local gain = 8
    local low = MoraleSystem.Get(player) < 40
    if low then gain = gain + 4 end
    MoraleSystem.Change(player, gain)
    CompanyState.RecordTimeline(state, "一对一谈话",
        "与 " .. player.name .. " 深入沟通" .. (low and "，安抚低落情绪" or "") .. "，士气 +" .. tostring(gain) .. "。")
    return true, gain
end

-- 周结算重置谈话名额
function MoraleSystem.ResetWeekly(state)
    state = CompanyState.Ensure(state)
    state.roster.talkedPlayer = nil
    return state
end

return MoraleSystem
