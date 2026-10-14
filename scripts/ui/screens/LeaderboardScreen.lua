-- LeaderboardScreen.lua — 排行榜 (real data: power ranking via LeaderboardSystem)
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local Kit = require("ui.WireframeKit")
local AppShell = require("ui.AppShell")
local CompanyState = require("CompanyState")

local function num(v, d) return tonumber(v) or d end
local function safe(v, d) return v == nil and (d or "") or v end

local function fmtWan(n)
    n = num(n, 0)
    if n >= 10000 then
        return "¥" .. tostring(math.floor(n / 1000) / 10) .. "亿"
    end
    return "¥" .. tostring(math.floor(n * 10) / 10) .. "万"
end

local function buildBlocks(ctx)
    local state = CompanyState.Ensure(CompanyState.GetState())
    local LeaderboardSystem = require("LeaderboardSystem")

    local blocks = {}

    -- 1. 我的俱乐部卡
    local rows = {}
    pcall(function() rows = LeaderboardSystem.GetRows(state) end)
    local my = nil
    local myRank = 1
    for i, r in ipairs(rows) do
        if r.teamId == "legacy" then my, myRank = r, i break end
    end
    if my then
        table.insert(blocks, { kind = "kpi", "我的俱乐部 · 实力榜第 " .. tostring(myRank) .. " 名 · 战力 " .. tostring(num(my.power, 0)) .. " · 估值 " .. fmtWan(my.valuation) .. " · 粉丝 " .. tostring(math.floor(num(my.fans, 0) / 100) / 100) .. "万" })
    end

    -- 2. 主联赛实力榜
    table.insert(blocks, { kind = "sectionhdr", title = "主联赛实力榜", right = "战力排序" })
    if #rows > 0 then
        local trows = {}
        for i, r in ipairs(rows) do
            table.insert(trows, {
                tostring(i),
                safe(r.name, "?") .. (r.teamId == "legacy" and "（我）" or ""),
                tostring(num(r.power, 0)),
                num(r.wins, 0) .. "-" .. num(r.losses, 0),
                fmtWan(r.valuation),
            })
        end
        table.insert(blocks, { kind = "table", title = "# / 战队 / 战力 / 战绩 / 估值", cols = { "#", "战队", "战力", "战绩", "估值" }, rows = trows } )
    else
        table.insert(blocks, { kind = "list", "暂无排行榜数据" })
    end

    -- 3. 可展开情报：前 3 名 AI 签约
    table.insert(blocks, { kind = "sectionhdr", title = "对手情报（Top3 近期签约）", right = "" })
    for i = 1, math.min(3, #rows) do
        local r = rows[i]
        if r and r.teamId ~= "legacy" then
            local signings = r.signings or {}
            if #signings > 0 then
                table.insert(blocks, { kind = "list", safe(r.name, "?") .. "：" .. table.concat(signings, " · ") })
            else
                table.insert(blocks, { kind = "list", safe(r.name, "?") .. "：近期无签约" })
            end
        end
    end

    return blocks
end

local LeaderboardScreen = {}

function LeaderboardScreen.Build(navigate)
    local ctx = { nav = navigate }
    local blocks = buildBlocks(ctx)
    local nodes = Kit.renderBlocks(blocks, ctx)
    return AppShell.Build(navigate, "leaderboard", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return LeaderboardScreen
