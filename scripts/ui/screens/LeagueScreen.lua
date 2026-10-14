-- LeagueScreen.lua — 联赛 (real data: standings by league type + team power ranking)
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local Kit = require("ui.WireframeKit")
local AppShell = require("ui.AppShell")
local CompanyState = require("CompanyState")
local CompetitionSystem = require("CompetitionSystem")
local AcademySystem = require("AcademySystem")
local LeagueCatalog = require("LeagueCatalog")
local RosterSystem = require("RosterSystem")

local function safe(v, d) return v == nil and (d or "") or v end
local function num(v, d) return tonumber(v) or d end

local LEAGUE_LABELS = {
    qualifier = "网吧预选赛",
    academy = "次级联赛",
}

local function buildBlocks(ctx)
    local state = CompanyState.Ensure(CompanyState.GetState())

    -- 当前联赛类型
    local leagueType = safe(state.company and state.company.league, "")
    local leagueLabel = LEAGUE_LABELS[leagueType] or "主联赛"

    -- 积分榜（按联赛类型取）
    local standings = {}
    if leagueType == "academy" then
        local ok, s = pcall(function() return AcademySystem.GetStandings(state) end)
        if ok and s then standings = s end
    elseif leagueType == "qualifier" then
        local ok, s = pcall(function() return CompetitionSystem.GetQualifierStandings(state) end)
        if ok and s then standings = s end
    else
        local ok, s = pcall(function() return CompetitionSystem.GetStandings(state) end)
        if ok and s then standings = s end
    end

    -- 我的排名
    local myRank = 0
    local okR, rank = pcall(function() return CompetitionSystem.GetPlayerRank(state) end)
    if okR then myRank = num(rank, 0) end

    -- 赛季进度
    local weeks = num(state.company and state.company.week, 1)
    local season = num(state.company and state.company.seasons, 1)
    local totalWeeks = 8
    local okW, tw = pcall(function() return CompetitionSystem.GetSeasonWeeks(state) end)
    if okW and tw then totalWeeks = num(tw, 8) end

    -- standings rows: {rank, teamName, games, wins, losses, score}
    local standRows = {}
    for rank, e in ipairs(standings) do
        local w, l = num(e.wins, 0), num(e.losses, 0)
        table.insert(standRows, { tostring(rank), safe(e.teamName, "?"), tostring(w + l), tostring(w), tostring(l), tostring(num(e.score, 0)) })
    end

    -- 战力榜（真实数据：联赛队伍战力 + 我方战力）
    local teams = {}
    local okT, tl = pcall(function() return LeagueCatalog.GetAllTeams() end)
    if okT and tl then teams = tl end

    local myTeamName = safe(state.company and state.company.name, "我的战队")
    local myPower = 0
    local okP, mp = pcall(function() return RosterSystem.GetTeamPower(state) end)
    if okP then myPower = num(mp, 0) end

    local powerList = {}
    for _, t in ipairs(teams) do
        table.insert(powerList, { name = (t.id == "legacy") and myTeamName or safe(t.name, "?"), power = num(t.power, 0) })
    end
    if leagueType ~= "" then
        -- legacy 战力以我方真实战力覆盖
        for _, item in ipairs(powerList) do
            if item.name == myTeamName then item.power = myPower end
        end
    end
    table.sort(powerList, function(a, b) return a.power > b.power end)

    local powerRows = {}
    for rank, item in ipairs(powerList) do
        table.insert(powerRows, { tostring(rank), item.name, tostring(item.power) })
    end

    local blocks = {
        { kind = "countryleague", countries = { leagueLabel, "网吧预选赛", "次级联赛" }, selected_country = leagueLabel,
            leagues = { "第 " .. season .. " 赛季" }, selected_league = "第 " .. season .. " 赛季" },
        { kind = "kpi", text = "当前排名 第 " .. myRank .. " 名 · 第 " .. weeks .. "/" .. totalWeeks .. " 周" },
        { kind = "sectionhdr", title = "积分榜", right = "" },
    }

    if #standRows > 0 then
        table.insert(blocks, { kind = "standings", cols = { "#", "战队", "场", "胜", "负", "积分" }, rows = standRows })
    else
        table.insert(blocks, { "积分榜数据尚未生成 · 推进一周后生成", "section" })
    end

    table.insert(blocks, { kind = "sectionhdr", title = "战队战力榜", right = "" })
    if #powerRows > 0 then
        table.insert(blocks, { kind = "table", title = "", cols = { "#", "战队", "战力" }, rows = powerRows })
    else
        table.insert(blocks, { "暂无战队数据", "section" })
    end

    table.insert(blocks, { kind = "cta", label = "进入 BP · 开始比赛", onClick = function() ctx.nav("match") end })
    table.insert(blocks, { kind = "cta", label = "转会榜", onClick = function() ctx.nav("transferboard") end })
    table.insert(blocks, { "比赛日将在赛程到达时触发 · 战力榜为本联赛真实数据", "section" })
    return blocks
end

local LeagueScreen = {}

function LeagueScreen.Build(navigate)
    local ctx = { nav = navigate }
    local nodes = Kit.renderBlocks(buildBlocks(ctx), ctx)
    return AppShell.Build(navigate, "league", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return LeagueScreen
