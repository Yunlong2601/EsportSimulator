-- MatchAnalyticsScreen.lua — 数据分析 (real data: recent matches + opponent intel via MatchAnalytics)
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local Kit = require("ui.WireframeKit")
local AppShell = require("ui.AppShell")
local CompanyState = require("CompanyState")

local function num(v, d) return tonumber(v) or d end
local function safe(v, d) return v == nil and (d or "") or v end

local function buildBlocks(ctx)
    local state = CompanyState.Ensure(CompanyState.GetState())
    local MatchAnalytics = require("MatchAnalytics")

    local blocks = {}

    -- 1. 解锁状态（分析室 Lv3）
    local unlocked = false
    pcall(function() unlocked = MatchAnalytics.IsUnlocked(state) end)
    if not unlocked then
        table.insert(blocks, { kind = "alert", lines = { { "分析室未解锁 · 需在设施中升级分析室至 Lv.3", DS.C.warning } } })
        table.insert(blocks, { kind = "cta", label = "前往设施升级", onClick = function() ctx.nav("facilities") end })
    end

    -- 2. 最近比赛分析
    local recent = {}
    pcall(function() recent = MatchAnalytics.GetRecent(state, 5) end)
    table.insert(blocks, { kind = "sectionhdr", title = "近期积累记录", right = "最近5场" })
    if #recent > 0 then
        local rows = {}
        for i = #recent, 1, -1 do
            local e = recent[i]
            table.insert(rows, {
                "第" .. tostring(num(e.week, 0)) .. "周",
                safe(e.opponentName, "?"),
                e.result == "win" and "胜" or "负",
                table.concat(e.tags or {}, "·"),
            })
        end
        table.insert(blocks, { kind = "table", title = "周 / 对手 / 结果 / 战术标签", cols = { "周", "对手", "结果", "标签" }, rows = rows })
    else
        table.insert(blocks, { kind = "list", "暂无赛后分析记录 · 打完比赛后积累" })
    end

    -- 3. 对手风格情报（按遭遇次数）
    local analytics = state.analytics or {}
    local intelList = {}
    for oppId, intel in pairs(analytics.opponentIntel or {}) do
        table.insert(intelList, { oppId = oppId, name = "?", tags = intel.tags or {}, games = num(intel.games, 0) })
    end
    pcall(function()
        -- 补充对手名（从最近记录里找）
        for _, e in ipairs(analytics.matches or {}) do
            for _, it in ipairs(intelList) do
                if it.oppId == e.opponentId then it.name = safe(e.opponentName, it.name) end
            end
        end
    end)
    table.sort(intelList, function(a, b) return a.games > b.games end)
    if #intelList > 0 then
        table.insert(blocks, { kind = "sectionhdr", title = "对手风格情报", right = "" })
        for i, it in ipairs(intelList) do
            if i > 6 then break end
            table.insert(blocks, { kind = "list", it.name .. " · 交手 " .. tostring(it.games) .. " 次 · " .. (#it.tags > 0 and table.concat(it.tags, " · ") or "暂无标签") })
        end
    end

    -- 4. 本场快捷分析（若有 lastAnalytics）
    local la = state.match and state.match.lastAnalytics
    if la then
        table.insert(blocks, { kind = "sectionhdr", title = "本场分析", right = "" })
        for _, tag in ipairs(la.tags or {}) do
            table.insert(blocks, { kind = "chip", label = tag })
        end
        for _, g in ipairs(la.gameAnalysis or {}) do
            if g and g.summary then
                table.insert(blocks, { kind = "list", safe(g.summary, "") })
            end
        end
    end

    table.insert(blocks, { kind = "cta", label = "前往 BP（下场参考）", onClick = function() ctx.nav("bp") end })
    table.insert(blocks, { kind = "cta", label = "返回战报", onClick = function() ctx.nav("matchresult") end })

    return blocks
end

local MatchAnalyticsScreen = {}

function MatchAnalyticsScreen.Build(navigate)
    local ctx = { nav = navigate }
    local blocks = buildBlocks(ctx)
    local nodes = Kit.renderBlocks(blocks, ctx)
    return AppShell.Build(navigate, "analytics", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return MatchAnalyticsScreen
