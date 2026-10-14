-- HighlightScreen.lua — 高光纪念卡 (real data: state.highlight set on big wins)
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local Kit = require("ui.WireframeKit")
local AppShell = require("ui.AppShell")
local CompanyState = require("CompanyState")

local function safe(v, d) return v == nil and (d or "") or v end

local function buildBlocks(ctx)
    local state = CompanyState.Ensure(CompanyState.GetState())

    local blocks = {}

    local hl = state.highlight
    if hl and hl.seen ~= true then
        -- 1. 高光纪念卡（图标 + 标题）
        table.insert(blocks, { kind = "kpi", text = safe(hl.icon, "★") .. " " .. safe(hl.title, "荣耀时刻") })
        -- 2. 荣耀描述行
        if hl.tagline then
            table.insert(blocks, { kind = "list", safe(hl.tagline, "") })
        end
        for _, line in ipairs(hl.lines or {}) do
            table.insert(blocks, { kind = "list", safe(line, "") })
        end
        -- 3. 关键数据块
        for _, st in ipairs(hl.stats or {}) do
            table.insert(blocks, { kind = "kvrows", title = safe(st.label, ""), rows = {
                { "数据", safe(st.value, ""), DS.C.gold },
            } })
        end
        -- 4. 收下荣耀
        table.insert(blocks, { kind = "cta", label = "收下荣耀 / 返回", onClick = function()
            pcall(function()
                state.highlight.seen = true
                require("SaveManager").Save(state)
            end)
            ctx.nav("dashboard")
        end })
    else
        table.insert(blocks, { kind = "alert", lines = { { "暂无高光时刻 — 关键战胜利 / 宿敌局告捷会触发全屏纪念", DS.C.muted } } })
        table.insert(blocks, { kind = "cta", label = "返回首页", onClick = function() ctx.nav("dashboard") end })
    end

    return blocks
end

local HighlightScreen = {}

function HighlightScreen.Build(navigate)
    local ctx = { nav = navigate }
    local blocks = buildBlocks(ctx)
    local nodes = Kit.renderBlocks(blocks, ctx)
    return AppShell.Build(navigate, "highlight", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return HighlightScreen
