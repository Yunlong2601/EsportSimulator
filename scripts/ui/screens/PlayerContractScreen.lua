-- PlayerContractScreen.lua — 选手合同 (real data: contract/renew/list via RosterSystem/MoraleSystem/MarketSystem)
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local Kit = require("ui.WireframeKit")
local AppShell = require("ui.AppShell")
local CompanyState = require("CompanyState")
local RosterSystem = require("RosterSystem")
local HeroCatalog = require("HeroCatalog")
local PlayerFocus = require("ui.PlayerFocus")

local ROLE_LABELS = HeroCatalog.ROLE_LABELS or {
    top = "上单", jungle = "打野", mid = "中单", adc = "射手", support = "辅助",
}

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
    local MoraleSystem = require("MoraleSystem")
    local MarketSystem = require("MarketSystem")

    local focus = PlayerFocus.Get()
    if not focus then
        return { { kind = "list", "阵容为空" } }
    end
    local p = focus.player
    local name = safe(RosterSystem.GetDisplayName(state, p), p.name)
    local morale = 50
    pcall(function() morale = MoraleSystem.Get(p) end)

    local blocks = {}

    if lastMsg and lastMsg ~= "" then
        table.insert(blocks, { kind = "alert", lines = { { lastMsg, DS.C.gold } } })
        lastMsg = nil
    end

    -- 1. 头部
    table.insert(blocks, { kind = "profilehdr", items = {
        { "位置", ROLE_LABELS[p.role] or safe(p.role, "?"), false },
        { "年龄", tostring(num(p.age, 0)), false },
        { "体能", tostring(num(p.form, 0)), num(p.form, 0) >= 60 },
        { "士气", tostring(morale), morale >= 60 },
        { "战队", safe(state.company.name, "星环战队"), false },
    } })

    -- 2. 合同概览
    local years = num(state.roster and state.roster.contracts and state.roster.contracts[p.id], 0)
    local value = 0
    pcall(function() value = RosterSystem.GetTransferValue(state, p.id) end)
    local renewCost = 0
    pcall(function() renewCost = MoraleSystem.GetRenewCost(state, p) end)
    local desire = 50
    pcall(function() desire = MarketSystem.GetDesire(state, p.id) end)

    table.insert(blocks, { kind = "kvrows", title = "合同概览", rows = {
        { "合同状态", years > 0 and ("剩余 " .. tostring(years) .. " 年") or "合同已到期", years > 1 and DS.C.success or DS.C.warning },
        { "周薪", "¥" .. tostring(num(p.salary, 0)) .. "万/周", DS.C.gold },
        { "市场价值", fmtWan(value), DS.C.muted },
        { "续约成本（估）", fmtWan(renewCost), DS.C.muted },
    } })

    -- 3. 周薪预算占比
    local payroll, cap = 0, 100
    pcall(function()
        payroll = MarketSystem.GetPayroll(state)
        cap = MarketSystem.GetSalaryCap(state)
    end)
    local pct = cap > 0 and math.floor(num(p.salary, 0) / cap * 100 + 0.5) or 0
    table.insert(blocks, { kind = "statusbars", items = {
        { "周薪占工资帽", tostring(pct) .. "%", math.min(100, pct) },
    } })

    -- 4. 转会状态
    local listed = state.market and state.market.listed and state.market.listed[p.id]
    local outLoan = nil
    for _, loan in pairs(state.market and state.market.loansIn or {}) do
        if loan.playerId == p.id then outLoan = loan end
    end
    table.insert(blocks, { kind = "kvrows", title = "转会状态", rows = {
        { "挂牌出售", listed and ("要价 " .. fmtWan(listed.asking)) or "否", DS.C.muted },
        { "留队意愿", tostring(desire) .. "/100", desire >= 60 and DS.C.success or (desire <= 35 and DS.C.warning or DS.C.muted) },
        { "租借状态", outLoan and "租入在队" or "自有合同", DS.C.muted },
    } })

    -- 5. 阵容角色
    table.insert(blocks, { kind = "rolegrid", title = "阵容角色", subtitle = focus.starter and "当前首发" or "当前替补", items = {
        { "核心选手", focus.starter and num(p.potential, 0) >= 85 },
        { "轮换选手", not focus.starter },
        { "阵容选手", focus.starter },
        { "青年选手", num(p.age, 0) <= 19 },
    } })

    -- 6. 合同操作
    table.insert(blocks, { kind = "contractactions", title = "合同操作", groups = {
        { "合同", { { "续约 · 参考成本 " .. fmtWan(renewCost), DS.C.success } } },
        { "挂牌", {
            { listed and "撤牌（当前挂牌中）" or "挂牌出售 · 参考 " .. fmtWan(value), DS.C.gold },
        } },
    } })
    table.insert(blocks, { kind = "cta", label = "续约 · " .. name .. "（成本约 " .. fmtWan(renewCost) .. "）", onClick = function()
        local ok, err = pcall(function()
            RosterSystem.RenewContract(state, p.id)
            require("SaveManager").Save(state)
        end)
        lastMsg = ok and ("已续约 " .. name) or ("续约失败：" .. tostring(err))
        ctx.nav("player_contract")
    end })
    table.insert(blocks, { kind = "cta", label = (listed and "撤牌 · " or "挂牌出售 · ") .. name, onClick = function()
        local ok, err = pcall(function()
            if listed then
                MarketSystem.UnlistPlayer(state, p.id)
            else
                MarketSystem.ListPlayer(state, p.id)
            end
            require("SaveManager").Save(state)
        end)
        lastMsg = ok and (listed and ("已撤牌 " .. name) or ("已挂牌出售 " .. name)) or ("操作失败：" .. tostring(err))
        ctx.nav("player_contract")
    end })

    table.insert(blocks, { kind = "cta", label = "返回选手详情", onClick = function() ctx.nav("player_profile") end })

    return blocks
end

local PlayerContractScreen = {}

function PlayerContractScreen.Build(navigate)
    local ctx = { nav = navigate }
    local blocks = buildBlocks(ctx)
    local nodes = Kit.renderBlocks(blocks, ctx)
    return AppShell.Build(navigate, "player_contract", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes }, { rail = "team" })
end

return PlayerContractScreen
