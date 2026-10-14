-- TacticsScreen.lua — 战队·战术 (real data: current tactic + bench slots + starters)
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local Kit = require("ui.WireframeKit")
local AppShell = require("ui.AppShell")
local CompanyState = require("CompanyState")
local RosterSystem = require("RosterSystem")
local TacticsSystem = require("TacticsSystem")
local MoraleSystem = require("MoraleSystem")
local HeroCatalog = require("HeroCatalog")
local TierSystem = require("TierSystem")

local ROLE_LABELS = HeroCatalog.ROLE_LABELS or {
    top = "上单", jungle = "打野", mid = "中单", adc = "射手", support = "辅助",
}

local function safe(v, d) return v == nil and (d or "") or v end
local function num(v, d) return tonumber(v) or d end

local lastMsg = nil

local function power(player, role)
    local ok, r = pcall(function() return RosterSystem.GetPlayerPower(player, role) end)
    return ok and num(r, 0) or 0
end

local function mood(player)
    local ok, label = pcall(function() return MoraleSystem.GetMood(player) end)
    return (ok and label) or ""
end

local function buildBlocks(ctx)
    local state = CompanyState.Ensure(CompanyState.GetState())

    -- 当前战术
    local tacticLabel, tacticDesc = "均衡", ""
    local okT, t = pcall(function() return TacticsSystem.GetCurrent(state) end)
    if okT and t then tacticLabel = safe(t.label, "均衡") end
    local okD, d = pcall(function() return TacticsSystem.GetDesc(state) end)
    if okD and d then tacticDesc = d end

    -- 首发与替补
    local starters, bench = {}, {}
    local okS, sList = pcall(function() return RosterSystem.GetRosterPlayers(state) end)
    if okS and sList then starters = sList end
    local okB, bList = pcall(function() return RosterSystem.GetBenchPlayers(state) end)
    if okB and bList then bench = bList end

    local benchSlots = 0
    if state.roster and state.roster.bench then
        for _ in pairs(state.roster.bench) do benchSlots = benchSlots + 1 end
    end

    local benchItems = {}
    for i, entry in ipairs(bench) do
        local p = entry and entry.player
        if p then
            table.insert(benchItems, { i, safe(ROLE_LABELS[p.role], "?"), safe(p.name, "?"), power(p, p.role), mood(p) })
        end
    end
    local startItems = {}
    for i, entry in ipairs(starters) do
        local p = entry and entry.player
        if p then
            table.insert(startItems, { i, safe(ROLE_LABELS[p.role], "?"), safe(p.name, "?"), power(p, p.role), mood(p) })
        end
    end

    local blocks = {
        { kind = "chiprow", items = { { "阵型与球场", false }, { "替补席", true } } },
        { "战术每周可调整 · 比赛当周生效", "section" },
        { kind = "kvrows", title = "当前战术", rows = {
            { "战术", tacticLabel, DS.C.gold },
            { "说明", tacticDesc, DS.C.muted },
            { "阵容配置", "自动（按能力值）", DS.C.muted },
        } },
        { kind = "benchlist", title = "替补席 (" .. tostring(#benchItems) .. "/" .. tostring(benchSlots) .. ")", items = benchItems },
        { kind = "benchlist", title = "首发 (" .. tostring(#startItems) .. ")", items = startItems },
    }

    if lastMsg and lastMsg ~= "" then
        table.insert(blocks, { kind = "alert", lines = { { lastMsg, DS.C.gold } } })
        lastMsg = nil
    end

    -- 战术选择（此前 TacticsScreen 纯只读，见体检报告 C3）
    local tacticList = {}
    for id, tactic in pairs(TacticsSystem.TACTICS) do
        table.insert(tacticList, { id = id, label = tactic.label, desc = tactic.desc })
    end
    table.sort(tacticList, function(a, b) return tostring(a.id) < tostring(b.id) end)
    for _, tt in ipairs(tacticList) do
        local unlocked = true
        pcall(function() unlocked = TierSystem.IsTacticUnlocked(state, tt.id) end)
        local current = (state.company.tactics == tt.id)
        table.insert(blocks, { kind = "cta", label = (current and "● 当前 · " or "") .. (unlocked and "采用" or "未解锁") .. " · " .. safe(tt.label, tt.id), onClick = function()
            local okP, pres = pcall(function() return TacticsSystem.SetTactics(state, tt.id) end)
            pcall(function() SaveManager.Save(state) end)
            if okP and pres == true then
                lastMsg = "已切换战术：" .. safe(tt.label, tt.id)
            else
                lastMsg = (type(pres) == "string" and pres) or "战术切换失败，请重试"
            end
            ctx.nav("tactics")
        end })
    end
    if #benchItems == 0 then
        table.insert(blocks, { "替补席暂无选手 · 可从市场或选秀补充", "section" })
    end
    return blocks
end

local TacticsScreen = {}

function TacticsScreen.Build(navigate)
    local ctx = { nav = navigate }
    local nodes = Kit.renderBlocks(buildBlocks(ctx), ctx)
    return AppShell.Build(navigate, "tactics", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes }, { rail = "team" })
end

return TacticsScreen
