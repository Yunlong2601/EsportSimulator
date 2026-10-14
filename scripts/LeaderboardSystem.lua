-- LeaderboardSystem：本地联盟实力榜（替代云端排行榜）
-- 每周把玩家 + 主联赛 AI 战队按综合战力排序，附带战绩 / 粉丝 / 估值 / 引援明细。
local CompanyState = require("CompanyState")
local LeagueCatalog = require("LeagueCatalog")

local LeaderboardSystem = {}

-- AI 展示估值 = 综合战力 × 每点估值（万元），仅用于榜单展示
local VALUATION_PER_POWER = 10

function LeaderboardSystem.Ensure(state)
    state = CompanyState.Ensure(state)
    state.leaderboard = state.leaderboard or {}
    return state
end

function LeaderboardSystem.GetTeamPower(state, teamId)
    if teamId == "legacy" then
        local RosterSystem = require("RosterSystem")
        return RosterSystem.GetTeamPower(state)
    end
    local CompetitionSystem = require("CompetitionSystem")
    return CompetitionSystem.GetMastersTeamPower(state, teamId)
end

local function aiFans(state, teamId, wins, played)
    -- AI 粉丝由战绩合成：胜率越高粉丝越多，随赛季缓慢增长
    local seasons = tonumber(state.company and state.company.seasons) or 0
    local pct = played > 0 and wins / played or 0
    local base = 15000 + seasons * 2000
    return math.floor(base * (0.8 + pct * 1.6))
end

--- 实时聚合当前实力榜行（主联赛 8 队：玩家 legacy + 7 支 AI）
function LeaderboardSystem.GetRows(state)
    state = LeaderboardSystem.Ensure(state)
    local AISystem = require("AISystem")
    AISystem.EnsureAgents(state)
    local standingsMap = {}
    for _, s in ipairs(state.league and state.league.standings or {}) do
        standingsMap[s.teamId] = s
    end
    local rows = {}
    for _, team in ipairs(LeagueCatalog.TEAMS) do
        local teamId = team.id
        local power = LeaderboardSystem.GetTeamPower(state, teamId)
        local rec = standingsMap[teamId]
        local wins = tonumber(rec and rec.wins) or 0
        local losses = tonumber(rec and rec.losses) or 0
        local score = tonumber(rec and rec.score) or 0
        local ai = state.aiTeams and state.aiTeams[tostring(teamId)] or {}
        -- D4：pro AI 队 bonus 已折进实体 5 人阵容，展示层置 0 避免误导
        local isProAi = teamId ~= "legacy" and AISystem.IsProAiTeam(teamId)
        table.insert(rows, {
            teamId = teamId,
            name = team.name,
            power = power,
            bonus = isProAi and 0 or (tonumber(ai.bonus) or 0),
            wins = wins,
            losses = losses,
            score = score,
            fans = teamId == "legacy"
                and (tonumber(state.company and state.company.fans) or 0)
                or aiFans(state, teamId, wins, wins + losses),
            valuation = teamId == "legacy"
                and (tonumber(state.finance and state.finance.valuation) or 0)
                or math.floor(power * VALUATION_PER_POWER),
            style = team.style,
            signings = ai.signings or {},
        })
    end
    table.sort(rows, function(a, b)
        if a.power ~= b.power then return a.power > b.power end
        if a.score ~= b.score then return a.score > b.score end
        return a.name < b.name
    end)
    return rows
end

--- 每周更新：写入快照并计算战力周涨跌
function LeaderboardSystem.Update(state)
    state = LeaderboardSystem.Ensure(state)
    local rows = LeaderboardSystem.GetRows(state)
    local prevMap = {}
    for _, r in ipairs(state.leaderboard.rows or {}) do
        prevMap[r.teamId] = r
    end
    for _, r in ipairs(rows) do
        local prev = prevMap[r.teamId]
        r.delta = prev and (r.power - (tonumber(prev.power) or 0)) or 0
    end
    state.leaderboard = {
        week = tonumber(state.company and state.company.week) or 1,
        rows = rows,
    }
    return state
end

return LeaderboardSystem