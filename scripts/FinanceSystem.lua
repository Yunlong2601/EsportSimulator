local CompanyState = require("CompanyState")
local RosterSystem = require("RosterSystem")
local StaffSystem = require("StaffSystem")
local SponsorSystem = require("SponsorSystem")
local PlayerEcoSystem = require("PlayerEcoSystem")
local ProfileSystem = require("ProfileSystem")
local AcademySystem = require("AcademySystem")

local FinanceSystem = {}

function FinanceSystem.GetRank(state)
    state = CompanyState.Ensure(state)
    local function rankIn(table_, targetId)
        local sorted = {}
        for _, entry in ipairs(table_ or {}) do table.insert(sorted, entry) end
        table.sort(sorted, function(a, b)
            if a.wins ~= b.wins then return a.wins > b.wins end
            return a.score > b.score
        end)
        for rank, entry in ipairs(sorted) do
            if entry.teamId == targetId then return rank end
        end
        return 8
    end
    if state.company.league == "academy" then
        return rankIn(AcademySystem.GetStandings(state), "legacy_youth")
    end
    if state.company.league == "qualifier" then
        return rankIn(state.league.standings, "legacy_cafe")
    end
    return rankIn(state.league.standings, "legacy")
end

function FinanceSystem.ApplyWeek(state)
    state = CompanyState.Ensure(state)
    local rank = FinanceSystem.GetRank(state)
    -- 经济平衡 §2.2：抬高转播地板、压平差距（保留冠军天花板）。开局并列会被
    -- GetRank 判到榜尾档，旧公式（顶级 80-(rank-1)*8 = 24）连工资基本盘都盖不住。
    local broadcast
    if state.company.league == "qualifier" then
        broadcast = math.max(8, 12 - (rank - 1) * 2)      -- 12 → 8
    elseif state.company.league == "academy" then
        broadcast = 36 + (8 - rank) * 2                   -- 50 → 36
    else
        broadcast = 46 + (8 - rank) * 4                   -- 74 → 46（垫底也拿 46）
    end
    local sponsor = SponsorSystem.GetWeeklySponsorIncome(state)
    -- 经济平衡 §2.3：周边门槛 10 万粉 → 2 万粉（floor(fans/20000)*5）
    local merchandise = math.floor(state.company.fans / 20000) * 5
    -- P1-⑥ 商务发展司：周边收入加成
    local FacilitiesSystem = require("FacilitiesSystem")
    merchandise = math.floor(merchandise * FacilitiesSystem.GetMerchIncomeMul(state) + 0.5)
    local revenue = broadcast + sponsor + merchandise
    local wages = 0
    for _, entry in ipairs(RosterSystem.GetRosterPlayers(state)) do
        wages = wages + entry.player.salary
    end
    -- 低级联赛运营成本更低：网吧队无基地，次级联赛半基地
    local staffMult = state.company.league == "qualifier" and 0.5 or (state.company.league == "academy" and 0.75 or 1.0)
    -- 经济平衡 §2.4：基地运营 25/10/0 → 15/8/0（给设施升级腾出正收益空间）
    local facility = state.company.league == "qualifier" and 0 or (state.company.league == "academy" and 8 or 15)
    local staffCost = math.floor(StaffSystem.GetStaffWages(state) * staffMult + 0.5)
    -- 经济平衡 §4.1 杠杆 A：银行授信按周等额还本息（同时仅 1 笔未结清）
    local loanDue = 0
    if state.finance.loan and (tonumber(state.finance.loan.weeksLeft) or 0) > 0 then
        loanDue = tonumber(state.finance.loan.weeklyDue) or 0
        state.finance.loan.weeksLeft = state.finance.loan.weeksLeft - 1
        if state.finance.loan.weeksLeft <= 0 then
            state.finance.loan = nil
            CompanyState.RecordTimeline(state, "贷款结清", "银行贷款已全部还清，可再次申请授信。")
        end
    end
    local expense = wages + staffCost + facility + loanDue
    state.company.cash = state.company.cash + revenue - expense
    table.insert(state.finance.history, 1, {
        week = state.company.week,
        revenue = revenue,
        expense = expense,
        net = revenue - expense,
        cash = state.company.cash,
    })
    while #state.finance.history > 12 do table.remove(state.finance.history) end
    state.finance.valuation = FinanceSystem.GetValuation(state)
    ProfileSystem.UpdatePeaks(state)
    return { rank = rank, revenue = revenue, expense = expense, net = revenue - expense }
end

function FinanceSystem.GetValuation(state)
    state = CompanyState.Ensure(state)
    local cash = state.company.cash
    local rosterValue = 0
    for _, entry in ipairs(RosterSystem.GetRosterPlayers(state)) do
        rosterValue = rosterValue + RosterSystem.GetPlayerPower(entry.player) * 6
    end
    local fanValue = math.floor(state.company.fans / 10000) * 60
    local rank = FinanceSystem.GetRank(state)
    local rankBonus = (9 - rank) * 100
    -- 选手品牌溢价：头部选手商业价值抬升俱乐部估值（呼应"品牌 +估值"）
    local brandValue = PlayerEcoSystem.GetRosterBrandValue(state)
    -- #49 转会收入累计：养成→卖出 第二条现金流，喂估值与 STOCK_MARKET
    local transferIncome = tonumber(state.finance.transferIncome) or 0
    local valuation = math.floor(cash * 0.5) + rosterValue + fanValue + rankBonus + brandValue * 3 + math.floor(transferIncome * 0.5)
    -- P1-⑥ 商务发展司：估值加成
    local FacilitiesSystem = require("FacilitiesSystem")
    valuation = valuation * (1 + FacilitiesSystem.GetValuationBonus(state))
    return math.max(0, math.floor(valuation))
end

function FinanceSystem.AddPrize(state, amount, title)
    state = CompanyState.Ensure(state)
    state.company.cash = state.company.cash + amount
    CompanyState.RecordTimeline(state, title, "获得奖金 ¥" .. tostring(amount) .. "万。")
    state.finance.valuation = FinanceSystem.GetValuation(state)
    return state
end

-- ============================================================================
-- 经济平衡 §4.1 杠杆 A：银行授信 · 紧急注资（新增函数，不新增子系统）
-- 同时仅允许 1 笔未结清贷款；现金 < -20 时禁止再借（近似催收）。
-- 还款在 ApplyWeek 支出侧按 weeklyDue 扣减（见上），故与周结算完全打通。
-- ============================================================================
FinanceSystem.LOAN_TIERS = { 100, 200, 300 }        -- 借款档位（万元）
FinanceSystem.LOAN_WEEKS = 20                        -- 分 20 周等额还本息
FinanceSystem.LOAN_TOTAL_COEF = 1.30                 -- 总还款系数
FinanceSystem.LOAN_MIN_CASH = -20                    -- 现金 < -20 禁止再借

function FinanceSystem.GetLoanCapacity(state)
    state = CompanyState.Ensure(state)
    local valuation = tonumber(state.finance.valuation) or 0
    return math.min(300, math.floor(valuation * 0.25))
end

function FinanceSystem.GetLoan(state)
    state = CompanyState.Ensure(state)
    return state.finance.loan
end

function FinanceSystem.GetWeeklyLoanDue(amount)
    amount = tonumber(amount) or 0
    return math.floor(amount * FinanceSystem.LOAN_TOTAL_COEF / FinanceSystem.LOAN_WEEKS * 10 + 0.5) / 10
end

function FinanceSystem.CanBorrow(state, amount)
    state = CompanyState.Ensure(state)
    amount = tonumber(amount) or 0
    local loan = state.finance.loan
    if loan and (tonumber(loan.weeksLeft) or 0) > 0 then
        return false, "已有未结清贷款，结清后方可再次申请"
    end
    if (tonumber(state.company.cash) or 0) < FinanceSystem.LOAN_MIN_CASH then
        return false, "现金低于 -20 万，银行拒绝授信"
    end
    local cap = FinanceSystem.GetLoanCapacity(state)
    if cap < 100 then
        return false, "估值不足，暂无可借额度"
    end
    if amount < 100 then
        return false, "最低借款 100 万"
    end
    if amount > cap then
        return false, "超出授信额度（最多 " .. tostring(cap) .. " 万）"
    end
    return true
end

function FinanceSystem.Borrow(state, amount)
    state = CompanyState.Ensure(state)
    amount = tonumber(amount) or 0
    local ok, reason = FinanceSystem.CanBorrow(state, amount)
    if not ok then return false, reason end
    local weeklyDue = FinanceSystem.GetWeeklyLoanDue(amount)
    state.company.cash = (tonumber(state.company.cash) or 0) + amount
    state.finance.loan = {
        principal = amount,
        weeksLeft = FinanceSystem.LOAN_WEEKS,
        weeklyDue = weeklyDue,
    }
    state.finance.valuation = FinanceSystem.GetValuation(state)
    CompanyState.RecordTimeline(state, "银行授信到账",
        "获得银行授信 ¥" .. tostring(amount) .. "万，分 " .. tostring(FinanceSystem.LOAN_WEEKS) ..
        " 周偿还，每周 ¥" .. tostring(weeklyDue) .. " 万（总还款系数 " .. tostring(FinanceSystem.LOAN_TOTAL_COEF) .. "）。")
    return true, state.finance.loan
end

return FinanceSystem
