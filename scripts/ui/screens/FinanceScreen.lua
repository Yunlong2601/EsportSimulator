-- FinanceScreen.lua — 财务 (real data: cash/valuation/payroll/history via FinanceSystem + SponsorSystem)
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local Kit = require("ui.WireframeKit")
local AppShell = require("ui.AppShell")
local CompanyState = require("CompanyState")

local function num(v, d) return tonumber(v) or d end
local function safe(v, d) return v == nil and (d or "") or v end

-- 模块级反馈缓冲：跨渲染周期保留上一次操作反馈
local lastMsg = nil

local function fmtWan(n)
    n = num(n, 0)
    if n >= 10000 then
        return "¥" .. tostring(math.floor(n / 1000) / 10) .. "亿"
    end
    return "¥" .. tostring(math.floor(n * 10) / 10) .. "万"
end

local function buildBlocks(ctx)
    local state = CompanyState.Ensure(CompanyState.GetState())
    local FinanceSystem = require("FinanceSystem")
    local SponsorSystem = require("SponsorSystem")
    local RosterSystem = require("RosterSystem")

    -- 本周收支预估（复刻 FinanceSystem.ApplyWeek 的收益侧，不落账）
    local rank = 8
    pcall(function() rank = FinanceSystem.GetRank(state) end)
    local broadcast = num(state.company.league == "qualifier" and math.max(4, 10 - (rank - 1) * 2)
        or (state.company.league == "academy" and math.max(10, 45 - (rank - 1) * 4)
        or (80 - (rank - 1) * 8)), 80)
    local sponsorIncome = 0
    pcall(function() sponsorIncome = SponsorSystem.GetWeeklySponsorIncome(state) end)
    local merchIncome = 0
    pcall(function()
        local m = require("MerchSystem")
        merchIncome = m.GetLastWeekRevenue and m.GetLastWeekRevenue(state) or 0
    end)
    local wages = 0
    pcall(function()
        for _, entry in ipairs(RosterSystem.GetRosterPlayers(state)) do
            wages = wages + num(entry.player and entry.player.salary, 0)
        end
        for _, entry in ipairs(RosterSystem.GetBenchPlayers(state)) do
            wages = wages + num(entry.player and entry.player.salary, 0)
        end
    end)
    local valuation = 0
    pcall(function() valuation = FinanceSystem.GetValuation(state) end)

    local revenue = broadcast + sponsorIncome + merchIncome
    local net = revenue - wages

    local blocks = {}

    if lastMsg and lastMsg ~= "" then
        table.insert(blocks, { kind = "alert", lines = { { lastMsg, DS.C.gold } } })
        lastMsg = nil
    end

    -- 1. 核心四宫格
    table.insert(blocks, { kind = "tiles", cols = 2, items = {
        { "现金", fmtWan(state.company.cash) },
        { "估值", fmtWan(valuation) },
        { "周薪支出", fmtWan(wages) },
        { "预计周盈余", (net >= 0 and "+" or "") .. fmtWan(net) },
    } })

    -- 2. 俱乐部基本面
    table.insert(blocks, { kind = "ztable", rows = {
        { "粉丝", tostring(math.floor(num(state.company.fans, 0) / 100) / 100) .. "万" },
        { "声誉", tostring(num(state.company.reputation, 0)) },
        { "联赛排名", "第 " .. tostring(rank) .. " 名" },
        { "转会收入累计", fmtWan(state.finance and state.finance.transferIncome) },
    } })

    -- 3. 赞助商席位
    local activeSponsors = {}
    pcall(function() activeSponsors = SponsorSystem.GetActiveSponsors(state) end)
    local freeSlots, maxSlots = 0, 0
    pcall(function()
        maxSlots = SponsorSystem.GetMaxSlots(state)
        freeSlots = SponsorSystem.GetFreeSlots(state)
    end)
    -- GetFreeSlots returns the LIST of free slot names, not a count. Comparing
    -- a table with a number threw at build time and made main.lua's pcall fall
    -- back to Dashboard — i.e. the "财务 button does nothing" bug.
    local freeCount = 0
    if type(freeSlots) == "table" then
        freeCount = #freeSlots
    else
        freeCount = tonumber(freeSlots) or 0
    end
    table.insert(blocks, { kind = "sectionhdr", title = "赞助商席位", right = freeCount > 0 and "有空位" or "满席" })
    if #activeSponsors > 0 then
        for _, sp in ipairs(activeSponsors) do
            table.insert(blocks, { kind = "list", safe(sp.name, "赞助商") .. " · ¥" .. tostring(num(sp.payment, 0)) .. "万/周 · 剩 " .. tostring(num(sp.weeksLeft, 0)) .. " 周" })
        end
    else
        table.insert(blocks, { kind = "list", "暂无签约赞助商" })
    end
    local availOffers = {}
    pcall(function() availOffers = SponsorSystem.GetAvailableOffers(state) end)
    local openOffers = {}
    for _, o in ipairs(availOffers) do
        if not o.locked then table.insert(openOffers, o) end
    end
    if freeCount > 0 and #openOffers > 0 then
        local o = openOffers[1]
        table.insert(blocks, { kind = "cta", label = "签约赞助 · " .. safe(o.name, "?") .. "（¥" .. tostring(num(o.payment, 0)) .. "万 × " .. tostring(num(o.weeks, 0)) .. "周）", onClick = function()
            local ok, err = pcall(function()
                SponsorSystem.SignSponsor(state, o.id)
                require("SaveManager").Save(state)
            end)
            lastMsg = ok and ("已签约赞助商 " .. safe(o.name, "?")) or ("签约失败：" .. tostring(err))
            ctx.nav("finance")
        end })
    end

    -- 4. 收支历史（最近 6 周）
    table.insert(blocks, { kind = "sectionhdr", title = "收支历史", right = "近6周" })
    local hist = state.finance and state.finance.history or {}
    if #hist > 0 then
        local rows = {}
        for i = 1, math.min(6, #hist) do
            local h = hist[i]
            table.insert(rows, {
                "第" .. tostring(num(h.week, 0)) .. "周",
                "+" .. tostring(num(h.revenue, 0)),
                "-" .. tostring(num(h.expense, 0)),
                (num(h.net, 0) >= 0 and "+" or "") .. tostring(num(h.net, 0)),
            })
        end
        table.insert(blocks, { kind = "table", title = "周 / 收入 / 支出 / 净额（万）", cols = { "周", "收入", "支出", "净额" }, rows = rows })
    else
        table.insert(blocks, { kind = "list", "暂无收支记录 · 打完一周比赛后生成" })
    end

    -- 5. 收益构成
    table.insert(blocks, { kind = "sectionhdr", title = "本周收益构成（预估）" })
    table.insert(blocks, { kind = "ztable", rows = {
        { "转播分成", "¥" .. tostring(broadcast) .. "万" },
        { "赞助收入", "¥" .. tostring(sponsorIncome) .. "万" },
        { "周边销售", "¥" .. tostring(merchIncome) .. "万" },
    } })

    -- 6. 银行授信（经济平衡 §4.1 杠杆 A）：紧急注资，同时仅 1 笔未结清。
    -- 额度 = min(300, floor(估值×0.25))；借 100/200/300 万，分 20 周还本息（总系数 1.30）。
    local capacity = 0
    pcall(function() capacity = FinanceSystem.GetLoanCapacity(state) end)
    local loan = state.finance and state.finance.loan or nil
    table.insert(blocks, { kind = "sectionhdr", title = "银行授信", right = (capacity >= 100) and ("额度 " .. tostring(capacity) .. "万") or "暂无额度" })
    if loan and num(loan.weeksLeft, 0) > 0 then
        table.insert(blocks, { kind = "ztable", rows = {
            { "贷款本金", "¥" .. tostring(num(loan.principal, 0)) .. "万" },
            { "剩余周数", tostring(num(loan.weeksLeft, 0)) .. " 周" },
            { "每周还款", "¥" .. tostring(num(loan.weeklyDue, 0)) .. "万" },
        } })
        table.insert(blocks, { kind = "list", "贷款结清后可再次申请授信（同时仅 1 笔未结清）。" })
    else
        local shown = 0
        for _, amt in ipairs({ 100, 200, 300 }) do
            if amt <= capacity then
                shown = shown + 1
                local due = math.floor(amt * 1.3 / 20 * 10 + 0.5) / 10
                table.insert(blocks, { kind = "cta", label = "银行授信 · 借 ¥" .. tostring(amt) .. "万（" .. tostring(due) .. "万/周 × 20周）", onClick = function()
                    local ok, success, reason = pcall(function() return FinanceSystem.Borrow(state, amt) end)
                    if ok and success then
                        pcall(function() require("SaveManager").Save(state) end)
                        lastMsg = "已获得银行授信 ¥" .. tostring(amt) .. "万"
                    elseif ok then
                        lastMsg = "授信失败：" .. tostring(reason)
                    else
                        lastMsg = "授信异常：" .. tostring(success)
                    end
                    ctx.nav("finance")
                end })
            end
        end
        if shown == 0 then
            table.insert(blocks, { kind = "list", "当前无可借额度（估值不足或现金告急时无法借款）。" })
        end
    end

    return blocks
end

local FinanceScreen = {}

function FinanceScreen.Build(navigate)
    local ctx = { nav = navigate }
    local blocks = buildBlocks(ctx)
    local nodes = Kit.renderBlocks(blocks, ctx)
    return AppShell.Build(navigate, "finance", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return FinanceScreen
