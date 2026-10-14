-- RosterScreen.lua — 战队·阵容 (real data: starters + bench via RosterSystem)
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

local function safe(v, d) return v == nil and (d or "") or v end
local function num(v, d) return tonumber(v) or d end

local function power(player, role)
    local ok, r = pcall(function() return RosterSystem.GetPlayerPower(player, role) end)
    return ok and num(r, 0) or 0
end

local function transferValue(state, playerId)
    local ok, r = pcall(function() return RosterSystem.GetTransferValue(state, playerId) end)
    return ok and num(r, 0) or 0
end

local function displayName(state, player)
    local ok, r = pcall(function() return RosterSystem.GetDisplayName(state, player) end)
    return (ok and r) or safe(player and player.name, "?")
end

local function wageStr(player)
    -- salary unit: 万元/周 (per MarketSystem.GetPayroll doc)
    local s = num(player and player.salary, 0)
    return "周薪 ¥" .. tostring(math.floor(s * 10) / 10) .. "万"
end

local function buildBlocks(ctx)
    local state = CompanyState.Ensure(CompanyState.GetState())

    local starters, bench = {}, {}
    local okS, sList = pcall(function() return RosterSystem.GetRosterPlayers(state) end)
    if okS and sList then starters = sList end
    local okB, bList = pcall(function() return RosterSystem.GetBenchPlayers(state) end)
    if okB and bList then bench = bList end

    -- squadlist items: { starter, roleLabel, name, age, wageStr, ovr, pot }
    local items = {}
    for _, entry in ipairs(starters) do
        local p = entry.player
        if p then
            table.insert(items, {
                true,
                ROLE_LABELS[entry.role] or safe(p.role, "?"),
                displayName(state, p),
                num(p.age, 0),
                wageStr(p) .. " · 身价 ¥" .. tostring(transferValue(state, p.id)) .. "万",
                power(p, entry.role),
                num(p.potential, 0),
            })
        end
    end
    -- bench sorted by power desc
    local benchItems = {}
    for _, entry in ipairs(bench) do
        local p = entry.player
        if p then
            table.insert(benchItems, {
                false,
                ROLE_LABELS[p.role] or safe(p.role, "?"),
                displayName(state, p),
                num(p.age, 0),
                wageStr(p) .. " · 身价 ¥" .. tostring(transferValue(state, p.id)) .. "万",
                power(p, p.role),
                num(p.potential, 0),
            })
        end
    end
    table.sort(benchItems, function(a, b) return (a[6] or 0) > (b[6] or 0) end)
    for _, it in ipairs(benchItems) do table.insert(items, it) end

    -- header stats
    local lowForm = 0
    for _, entry in ipairs(starters) do
        local p = entry and entry.player
        if p and num(p.form, 100) < 60 then lowForm = lowForm + 1 end
    end
    -- 工资帽占用（周薪合计/上限）
    local payroll, cap = 0, "—"
    local okP, pr, pc = pcall(function()
        local MS = require("MarketSystem")
        return MS.GetPayroll(state), MS.GetSalaryCap(state)
    end)
    if okP then
        payroll = num(pr, 0)
        cap = num(pc, "—")
    end

    local header = {
        kind = "squadheader",
        scheme = { "当前阵容" }, active = "当前阵容",
        stats = {
            { "首发", tostring(#starters) .. "/5" },
            { "替补", tostring(#bench) },
            { "低状态", tostring(lowForm) },
            { "周薪", "¥" .. tostring(payroll) .. "/" .. tostring(cap) .. "万" },
        },
        filters = { { "全部", true }, { "上单", false }, { "打野", false }, { "中单", false }, { "射手", false }, { "辅助", false } },
    }

    return {
        header,
        { kind = "squadlist", items = items },
        { "点击选手 → 查看详情 · 长按 → 挂牌/续约", "section" },
        { kind = "cta", label = "王朝传承", onClick = function() ctx.nav("dynasty") end },
    }
end

local RosterScreen = {}

function RosterScreen.Build(navigate)
    local ctx = { nav = navigate }
    local blocks = buildBlocks(ctx)
    local nodes = Kit.renderBlocks(blocks, ctx)
    return AppShell.Build(navigate, "roster", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes }, { rail = "team" })
end

return RosterScreen
