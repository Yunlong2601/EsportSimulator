-- MatchResultScreen.lua — 赛后战报 (real data: last report + highlight via state.league.lastReport)
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local Kit = require("ui.WireframeKit")
local AppShell = require("ui.AppShell")
local CompanyState = require("CompanyState")
local LeagueCatalog = require("LeagueCatalog")

local function num(v, d) return tonumber(v) or d end
local function safe(v, d) return v == nil and (d or "") or v end

local function buildBlocks(ctx)
    local state = CompanyState.Ensure(CompanyState.GetState())

    local blocks = {}

    -- 1. 高光纪念卡（若有未看过的高光）
    local hl = state.highlight
    if hl and hl.seen ~= true then
        table.insert(blocks, { kind = "alert", lines = { { "高光时刻 · " .. safe(hl.title, "荣耀"), DS.C.gold } } })
        if hl.tagline then table.insert(blocks, { kind = "list", safe(hl.tagline, "") }) end
        for _, line in ipairs(hl.lines or {}) do
            table.insert(blocks, { kind = "list", safe(line, "") })
        end
        for _, st in ipairs(hl.stats or {}) do
            table.insert(blocks, { kind = "list", safe(st.label, "") .. "：" .. safe(st.value, "") })
        end
        table.insert(blocks, { kind = "cta", label = "收下荣耀", onClick = function()
            pcall(function()
                state.highlight.seen = true
                require("SaveManager").Save(state)
            end)
            ctx.nav("matchresult")
        end })
    end

    -- 2. 上周战报
    local lastReport = state.league and state.league.lastReport
    table.insert(blocks, { kind = "sectionhdr", title = "最近战报", right = "" })
    if lastReport then
        local rep = lastReport.report or {}
        local won = lastReport.won == true
        local opp = "对手"
        if lastReport.opponentId then
            local ok, n = pcall(function() return LeagueCatalog.GetTeamName(lastReport.opponentId, lastReport.opponentId) end)
            if ok and n then opp = n end
        end
        -- 比分 hero
        table.insert(blocks, { kind = "split",
            left = tostring(num(lastReport.scoreA, 0)) .. " : " .. tostring(num(lastReport.scoreB, 0)) .. "　" .. (won and "胜" or "负"),
            right = { "第" .. tostring(num(lastReport.week, 0)) .. "周 · vs " .. opp, safe(rep.mvpName, "") ~= "" and ("MVP · " .. safe(rep.mvpName, "")) or nil } })

        -- 战报正文
        for _, line in ipairs(rep.lines or {}) do
            table.insert(blocks, { kind = "list", safe(line, "") })
        end

        -- 选手状态变化
        table.insert(blocks, { kind = "kvrows", title = "赛果影响", rows = {
            { "比赛结果", won and "胜利" or "失利", won and DS.C.success or DS.C.error },
            { "MVP", safe(rep.mvpName, "—"), DS.C.gold },
        } })
    else
        table.insert(blocks, { kind = "list", "本赛季暂无战报 · 推进一周后生成" })
    end

    -- 3. 数据分析入口
    table.insert(blocks, { kind = "cta", label = "数据分析 / 继续推进", onClick = function() ctx.nav("analytics") end })
    table.insert(blocks, { kind = "cta", label = "查看高光时刻", onClick = function() ctx.nav("highlight") end })
    table.insert(blocks, { kind = "cta", label = "返回首页", onClick = function() ctx.nav("dashboard") end })

    return blocks
end

local MatchResultScreen = {}

function MatchResultScreen.Build(navigate)
    local ctx = { nav = navigate }
    local blocks = buildBlocks(ctx)
    local nodes = Kit.renderBlocks(blocks, ctx)
    return AppShell.Build(navigate, "matchresult", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return MatchResultScreen
