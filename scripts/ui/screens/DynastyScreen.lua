-- DynastyScreen.lua — 王朝传承 (real data: legacy points / tier / cross-season goals / unlocks / chronicle)
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local Kit = require("ui.WireframeKit")
local AppShell = require("ui.AppShell")
local CompanyState = require("CompanyState")

local function num(v, d) return tonumber(v) or d end
local function safe(v, d) return v == nil and (d or "") or v end

local function buildBlocks(ctx)
    local state = CompanyState.Ensure(CompanyState.GetState())
    local DynastySystem = require("DynastySystem")
    DynastySystem.Ensure(state)

    local blocks = {}

    -- 1. 王朝页头：传奇点 + 评级环
    local points = num(state.legacy.points, 0)
    local info = nil
    pcall(function() info = DynastySystem.GetTierInfo(points) end)
    info = info or { tier = 0, label = "新秀王朝", progress = 0, toNext = 0, next = nil }
    table.insert(blocks, { kind = "ring", pct = math.floor(info.progress * 100), label = info.label,
        sub = "传奇点 " .. tostring(points) .. " · " .. (info.next and ("距「" .. info.next.label .. "」还差 " .. tostring(info.toNext)) or "已是最高王朝") })

    -- 2. 跨赛季目标
    table.insert(blocks, { kind = "sectionhdr", title = "跨赛季目标", right = "持久" })
    local goals = {}
    pcall(function() goals = DynastySystem.GetGoals(state) end)
    if #goals == 0 then
        table.insert(blocks, { kind = "list", "暂无目标数据" })
    else
        for _, g in ipairs(goals) do
            table.insert(blocks, { kind = "kvrows", title = (g.done and "【达成】" or "进行中") .. g.label, rows = {
                { "进度", tostring(g.current) .. " / " .. tostring(g.target), g.done and DS.C.success or DS.C.gold },
                { "说明", safe(g.desc, ""), DS.C.muted },
            } })
        end
    end

    -- 3. 王朝解锁
    table.insert(blocks, { kind = "sectionhdr", title = "王朝特权解锁", right = "" })
    local unlocks = {}
    pcall(function() unlocks = DynastySystem.GetUnlocks(state) end)
    if #unlocks == 0 then
        table.insert(blocks, { kind = "list", "暂无解锁项" })
    else
        for _, u in ipairs(unlocks) do
            table.insert(blocks, { kind = "list", (u.unlocked and "【已解锁】" or "【未解锁】") .. u.label .. " · " .. safe(u.desc, "") })
        end
    end

    -- 4. 王朝编年史
    table.insert(blocks, { kind = "sectionhdr", title = "王朝编年史", right = "" })
    local miles = state.legacy.milestones or {}
    if #miles == 0 then
        table.insert(blocks, { kind = "list", "尚无里程碑 — 跨赛季目标 / 重大战果将记入编年史" })
    else
        for i = 1, math.min(#miles, 12) do
            local m = miles[i]
            table.insert(blocks, { kind = "list", "第" .. tostring(num(m.season, 0)) .. "赛季 · " .. safe(m.text, "") })
        end
    end

    -- 5. CTA
    table.insert(blocks, { kind = "cta", label = "返回阵容", onClick = function() ctx.nav("roster") end })

    return blocks
end

local DynastyScreen = {}

function DynastyScreen.Build(navigate)
    local ctx = { nav = navigate }
    local blocks = buildBlocks(ctx)
    local nodes = Kit.renderBlocks(blocks, ctx)
    return AppShell.Build(navigate, "dynasty", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return DynastyScreen
