-- GoalCenterScreen.lua — 董事会目标中心 (real data: season goals + progress via GoalSystem)
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local Kit = require("ui.WireframeKit")
local AppShell = require("ui.AppShell")
local CompanyState = require("CompanyState")

local function num(v, d) return tonumber(v) or d end
local function safe(v, d) return v == nil and (d or "") or v end

local function buildBlocks(ctx)
    local state = CompanyState.Ensure(CompanyState.GetState())
    local GoalSystem = require("GoalSystem")

    local blocks = {}

    -- 1. 董事会支持度
    local verdict = state.goals and state.goals.lastVerdict
    local supportLabel = "本季未评估"
    local supportColor = DS.C.muted
    if verdict then
        if verdict.verdict == "all" then supportLabel = "董事会高度认可 " .. tostring(verdict.done) .. "/" .. tostring(verdict.total)
        elseif verdict.verdict == "none" then supportLabel = "董事会警告 " .. tostring(verdict.done) .. "/" .. tostring(verdict.total)
        else supportLabel = "基本满意 " .. tostring(verdict.done) .. "/" .. tostring(verdict.total) end
        supportColor = verdict.verdict == "all" and DS.C.success or (verdict.verdict == "none" and DS.C.error or DS.C.gold)
    end
    table.insert(blocks, { kind = "node", text = supportLabel, sub = "目标完成度（上季结算）" })

    -- 2. 本季目标清单
    table.insert(blocks, { kind = "sectionhdr", title = "本赛季目标", right = "" })
    local goals = state.goals and state.goals.season or {}
    if #goals == 0 then
        table.insert(blocks, { kind = "list", "本季暂无目标 — 新赛季开局由董事会生成" })
    else
        for _, g in ipairs(goals) do
            local tierLabel, _ = "", nil
            pcall(function() tierLabel = GoalSystem.GetTierLabel(g) end)
            local txt, ratio, done = "", 0, false
            pcall(function() txt, ratio, done = GoalSystem.GetProgressText(g) end)
            table.insert(blocks, { kind = "kvrows", title = (done and "【达成】" or "进行中") .. "[" .. tierLabel .. "] " .. safe(g.title, g.id), rows = {
                { "进度", safe(txt, ""), done and DS.C.success or DS.C.gold },
                { "说明", safe(g.desc, ""), DS.C.muted },
            } })
        end
    end

    -- 3. 经营提示
    table.insert(blocks, { kind = "section", text = "竞技目标每周按积分榜刷新；经营目标按现金/粉丝/青训/赞助进度结算；赛季末全达成 → 预算 +15%。" })

    -- 4. CTA
    table.insert(blocks, { kind = "cta", label = "前往媒体中心", onClick = function() ctx.nav("press") end })
    table.insert(blocks, { kind = "cta", label = "返回首页", onClick = function() ctx.nav("dashboard") end })

    return blocks
end

local GoalCenterScreen = {}

function GoalCenterScreen.Build(navigate)
    local ctx = { nav = navigate }
    local blocks = buildBlocks(ctx)
    local nodes = Kit.renderBlocks(blocks, ctx)
    return AppShell.Build(navigate, "goalcenter", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return GoalCenterScreen
