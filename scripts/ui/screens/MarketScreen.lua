-- MarketScreen.lua — 市场 (real data: transfer window + offers + free agents + my listings)
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local Kit = require("ui.WireframeKit")
local AppShell = require("ui.AppShell")
local CompanyState = require("CompanyState")
local RosterSystem = require("RosterSystem")
local HeroCatalog = require("HeroCatalog")

local ROLE_LABELS = HeroCatalog.ROLE_LABELS or {
    top = "上单", jungle = "打野", mid = "中单", adc = "射手", support = "辅助",
}

local function num(v, d) return tonumber(v) or d end
local function safe(v, d) return v == nil and (d or "") or v end

local lastMsg = nil

local function fmtWan(n)
    n = num(n, 0)
    if n >= 10000 then
        return "¥" .. tostring(math.floor(n / 1000) / 10) .. "亿"
    end
    return "¥" .. tostring(math.floor(n * 10) / 10) .. "万"
end

local function starStr(pot)
    local n = math.max(1, math.min(5, math.floor(num(pot, 0) / 20)))
    return string.rep("★", n)
end

local function adviceShort(advice)
    if not advice then return "—" end
    if advice.refused then return "拒谈" end
    if advice.blocked then return "需声望" .. tostring(advice.requiredRep or "?") end
    return "可谈 ¥" .. tostring(advice.bargainCost or "?") .. "万"
end

local function buildBlocks(ctx)
    local state = CompanyState.Ensure(CompanyState.GetState())
    local MarketSystem = require("MarketSystem")
    local LeagueCatalog = require("LeagueCatalog")

    local blocks = {}

    if lastMsg and lastMsg ~= "" then
        table.insert(blocks, { kind = "alert", lines = { { lastMsg, DS.C.gold } } })
        lastMsg = nil
    end

    -- 1. 转会窗状态
    local week = num(state.company and state.company.week, 1)
    local windowOpen = false
    local okW, w = pcall(function() return MarketSystem.IsTransferWindow(state) end)
    if okW then windowOpen = w and true or false end
    if windowOpen then
        table.insert(blocks, { kind = "alert", lines = { { "转会窗开启中 · 第" .. week .. "周（本周可挂牌/签约）", DS.C.success } } })
    else
        table.insert(blocks, { kind = "alert", lines = { { "转会窗已关闭 · 第" .. week .. "周（赛季初/末两周开启，休市期可租借/外租）", DS.C.warning } } })
    end

    -- 2. 市场总览 + 我的挂牌
    local overview = { listedCount = 0, totalValue = 0, maxValue = 0 }
    pcall(function()
        local ov = MarketSystem.GetMarketOverview(state)
        if ov then overview = ov end
    end)
    table.insert(blocks, { kind = "kpi", "我的挂牌 · " .. tostring(overview.listedCount or 0) .. " 人 · 总市值 " .. fmtWan(overview.totalValue or 0) .. " · 最高 " .. fmtWan(overview.maxValue or 0) })

    -- 挂牌明细（≤5 条）+ 撤牌 CTA
    local listedIds = {}
    pcall(function()
        for pid, info in pairs(state.market.listed or {}) do
            table.insert(listedIds, { pid = pid, info = info })
        end
        table.sort(listedIds, function(a, b)
            return num(a.info and a.info.asking, 0) > num(b.info and b.info.asking, 0)
        end)
    end)
    if #listedIds > 0 then
        table.insert(blocks, { kind = "sectionhdr", title = "我的挂牌", right = "" })
        for i, e in ipairs(listedIds) do
            if i > 5 then break end
            local p = nil
            pcall(function() p = LeagueCatalog.GetPlayer(e.pid) end)
            local nm = safe(p and p.name, "选手")
            table.insert(blocks, { kind = "list", nm .. " · 要价 " .. fmtWan(e.info and e.info.asking) .. "（第" .. tostring(num(e.info and e.info.sinceWeek, 1)) .. "周挂牌）" })
            table.insert(blocks, { kind = "cta", label = "撤牌 · " .. nm, onClick = function()
                local ok, err = pcall(function()
                    MarketSystem.UnlistPlayer(state, e.pid)
                    require("SaveManager").Save(state)
                end)
                lastMsg = ok and ("已撤牌 " .. nm) or ("撤牌失败：" .. tostring(err))
                ctx.nav("market")
            end })
        end
    else
        table.insert(blocks, { kind = "list", "暂无挂牌选手 · 转会窗开启时可挂出替补换取资金" })
    end

    -- 3. 待处理报价（真实 offers，带接受/拒绝）
    local pending = {}
    pcall(function()
        local po = MarketSystem.GetPendingOffers(state)
        if po then pending = po end
    end)
    if #pending > 0 then
        table.insert(blocks, { kind = "sectionhdr", title = "收到的报价", right = "" })
        for i, offer in ipairs(pending) do
            if i > 4 then break end
            local p = nil
            pcall(function() p = LeagueCatalog.GetPlayer(offer.playerId) end)
            local nm = safe(p and p.name, "选手")
            local amount = fmtWan(offer.amount)
            table.insert(blocks, { kind = "list", safe(offer.club, "俱乐部") .. " 求购 " .. nm .. " · 出价 " .. amount .. " · 剩 " .. tostring(num(offer.weeksLeft, 0)) .. " 周考虑期" })
            table.insert(blocks, { kind = "cta", label = "接受报价 · " .. nm .. " " .. amount, onClick = function()
                local ok, err = pcall(function()
                    MarketSystem.AcceptOffer(state, offer.id)
                    require("SaveManager").Save(state)
                end)
                lastMsg = ok and ("已接受 " .. nm .. " 的报价") or ("接受失败：" .. tostring(err))
                ctx.nav("market")
            end })
            table.insert(blocks, { kind = "cta", label = "拒绝报价 · " .. nm, onClick = function()
                local ok, err = pcall(function()
                    MarketSystem.RejectOffer(state, offer.id)
                    require("SaveManager").Save(state)
                end)
                lastMsg = ok and ("已拒绝 " .. nm .. " 的报价") or ("拒绝失败：" .. tostring(err))
                ctx.nav("market")
            end })
        end
    end

    -- 4. 自由市场（按要价降序，取前 8）
    table.insert(blocks, { kind = "sectionhdr", title = "自由市场", right = "按要价" })
    local agents = {}
    pcall(function()
        local a = MarketSystem.GetFreeAgentsWithMeta(state)
        if a then agents = a end
    end)
    local rows = {}
    for i, ag in ipairs(agents) do
        if i > 8 then break end
        local p = ag.player
        if p then
            table.insert(rows, {
                ROLE_LABELS[p.role] or safe(p.role, "?"),
                safe(p.name, "?"),
                tostring(num(p.age, 0)) .. "岁",
                fmtWan(ag.asking),
                adviceShort(ag.advice),
                starStr(p.potential),
                tostring(num(ag.power, 0)),
            })
        end
    end
    if #rows > 0 then
        table.insert(blocks, { kind = "playertable", cols = { "位置", "选手", "年龄", "要价", "经纪人", "潜力", "战力" }, rows = rows })
    else
        table.insert(blocks, { kind = "list", "自由市场暂无可签约选手" })
    end

    -- 5. 快捷动作：挂牌替补（最高身价）
    table.insert(blocks, { kind = "sectionhdr", title = "快捷操作", right = "" })
    table.insert(blocks, { kind = "cta", label = "挂牌替补 · 最高身价（" .. (windowOpen and "转会窗内" or "需转会窗开启") .. "）", onClick = function()
        local listed = false
        pcall(function()
            local bench = RosterSystem.GetBenchPlayers(state) or {}
            local best, bestV = nil, -1
            for _, entry in ipairs(bench) do
                local p = entry and entry.player
                if p then
                    local v = num(RosterSystem.GetTransferValue(state, p.id), 0)
                    if v > bestV then best, bestV = p, v end
                end
            end
            if best then
                local okR, _ = MarketSystem.ListPlayer(state, best.id)
                if okR then
                    listed = true
                    require("SaveManager").Save(state)
                end
            end
        end)
        lastMsg = listed and "已挂牌最高身价替补" or "无合适替补可挂牌（需转会窗开启）"
        ctx.nav("market")
    end })

    -- 快捷操作：转会市场子模块入口（转入/招募）
    table.insert(blocks, { kind = "cta", label = "转会谈判", onClick = function() ctx.nav("negotiation") end })
    table.insert(blocks, { kind = "cta", label = "明星招募", onClick = function() ctx.nav("starrecruit") end })

    table.insert(blocks, { "点击选手 → 查看详情 / 谈判（后续版本接入）", "section" })

    return blocks
end

local MarketScreen = {}

function MarketScreen.Build(navigate)
    local ctx = { nav = navigate }
    local blocks = buildBlocks(ctx)
    local nodes = Kit.renderBlocks(blocks, ctx)
    return AppShell.Build(navigate, "market", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return MarketScreen
