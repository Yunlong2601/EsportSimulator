-- UnlockSystem：首赛季渐进解锁（RC D1）
-- 第 1 赛季只开放基础系统（签约 / 训练 / 战术 / 比赛 / 财务 / 股权），
-- 第 2 赛季起开放转会窗深度（挂牌 / 报价 / 买断 / 竞价 / 租借 / 外租）、
-- 替补席、青训与球探。
-- 老档若已使用过对应功能（有数据残留）自动放行，不打断老玩家。

local UnlockSystem = {}

local function hasAny(t)
    return t ~= nil and next(t) ~= nil
end

--- 已完成赛季数（新档 0 = 第 1 赛季）
function UnlockSystem.Season(state)
    return tonumber(state and state.company and state.company.seasons) or 0
end

--- 是否已进入第 2 赛季
function UnlockSystem.IsSeason2(state)
    return UnlockSystem.Season(state) >= 1
end

--- 功能是否解锁
--- feature: "market_deep" / "bench" / "academy"
function UnlockSystem.IsUnlocked(state, feature)
    if not state then return false end
    if UnlockSystem.IsSeason2(state) then return true end
    if feature == "market_deep" then
        -- 转会窗深度：老档用过挂牌/报价/竞价/租借/外租/球探任意一项即放行
        return hasAny(state.market and state.market.listed)
            or hasAny(state.market and state.market.offers)
            or hasAny(state.market and state.market.wars)
            or hasAny(state.market and state.market.loansIn)
            or hasAny(state.roster and state.roster.outLoans)
            or hasAny(state.scouting and state.scouting.reports)
    elseif feature == "bench" then
        local bench = state.roster and state.roster.bench
        return bench ~= nil and ((bench.slot1 and bench.slot1 ~= "") or (bench.slot2 and bench.slot2 ~= ""))
    elseif feature == "academy" then
        local academy = state.roster and state.roster.academy
        if hasAny(academy and academy.trainees) then return true end
        if academy and academy.players then
            for _, pid in pairs(academy.players) do
                if pid and pid ~= "" then return true end
            end
        end
        return false
    end
    return true -- 未知功能默认放行
end

return UnlockSystem
