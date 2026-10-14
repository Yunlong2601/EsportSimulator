local CompanyState = require("CompanyState")
local FinanceSystem = require("FinanceSystem")

local ShareSystem = {}

ShareSystem.ROUNDS = {
    { id = "seed", title = "种子轮", raised = 1000, founderAfter = 75 },
    { id = "series_a", title = "A 轮", raised = 3000, founderAfter = 60 },
    { id = "series_b", title = "B 轮", raised = 8000, founderAfter = 51 },
}

function ShareSystem.GetDoneRoundIds(state)
    state = CompanyState.Ensure(state)
    local done = {}
    for _, round in ipairs(state.shares.rounds) do done[round.id] = true end
    return done
end

function ShareSystem.GetNextRound(state)
    state = CompanyState.Ensure(state)
    local done = ShareSystem.GetDoneRoundIds(state)
    for _, round in ipairs(ShareSystem.ROUNDS) do
        if not done[round.id] then return round end
    end
    return nil
end

function ShareSystem.RaiseRound(state)
    state = CompanyState.Ensure(state)
    if state.company.seasonState == "bankrupt" then return false, "公司已破产" end
    local round = ShareSystem.GetNextRound(state)
    if not round then return false, "融资轮次已全部完成" end
    local investorsAfter = 100 - round.founderAfter
    state.company.cash = state.company.cash + round.raised
    state.shares.investors = investorsAfter
    state.shares.founder = round.founderAfter
    table.insert(state.shares.rounds, {
        id = round.id,
        title = round.title,
        raised = round.raised,
        week = state.company.week,
        founderAfter = round.founderAfter,
    })
    CompanyState.RecordTimeline(state, round.title .. "融资完成", "获得 ¥" .. tostring(round.raised) .. "万投资，创始人持股降至 " .. tostring(round.founderAfter) .. "%。")
    state.finance.valuation = FinanceSystem.GetValuation(state)
    return true, round
end

function ShareSystem.BuyBack(state)
    state = CompanyState.Ensure(state)
    if state.shares.investors < 5 then return false, "可回购份额不足" end
    local cost = math.floor(FinanceSystem.GetValuation(state) * 0.05)
    if state.company.cash < cost then return false, "现金不足，无法回购" end
    state.company.cash = state.company.cash - cost
    state.shares.founder = state.shares.founder + 5
    state.shares.investors = state.shares.investors - 5
    CompanyState.RecordTimeline(state, "股份回购", "以 ¥" .. tostring(cost) .. "万 回购 5% 股份，创始人持股升至 " .. tostring(state.shares.founder) .. "%。")
    state.finance.valuation = FinanceSystem.GetValuation(state)
    return true, cost
end

return ShareSystem
