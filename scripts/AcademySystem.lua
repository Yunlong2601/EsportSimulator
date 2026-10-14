local CompanyState = require("CompanyState")
local LeagueCatalog = require("LeagueCatalog")
local StaffSystem = require("StaffSystem")
local RosterSystem = require("RosterSystem")
local MatchReporter = require("MatchReporter")
local TacticsSystem = require("TacticsSystem")

local AcademySystem = {}

AcademySystem.ROLE_ORDER = { "top", "jungle", "mid", "adc", "support" }

local AI_TEAM_SCALE = 5.5
local AI_SEASON_GROWTH = 0.12

AcademySystem.NAME_POOL = {
    "Aster", "Bolt", "Chirp", "Dusk", "Fable", "Gale", "Halo", "Ivy", "Jett", "Kite",
    "Luna", "Miro", "Nyx", "Onyx", "Pax", "Quill", "Rune", "Sage", "Talon", "Umbra",
    "Wisp", "Yuki", "Zinc", "Arrow", "Cinder", "Glim", "Haven", "Indra", "Juno", "Koda",
}

local function clamp(value, minimum, maximum)
    return math.max(minimum, math.min(maximum, tonumber(value) or minimum))
end

function AcademySystem.GetTrainees(state)
    state = CompanyState.Ensure(state)
    local trainees = {}
    for _, role in ipairs(AcademySystem.ROLE_ORDER) do
        local traineeId = state.roster.academy.players[role]
        if traineeId and traineeId ~= "" then
            local trainee = state.roster.academy.trainees[traineeId]
            if trainee then table.insert(trainees, { role = role, trainee = trainee }) end
        end
    end
    return trainees
end

function AcademySystem.GetPlayerPower(trainee)
    if not trainee then return 0 end
    local recentForm = tonumber(trainee.recentForm) or 0
    return math.floor(0.35 * trainee.mechanics + 0.3 * trainee.teamfight + 0.2 * trainee.laning + 0.15 * trainee.form + 0.15 * recentForm + 0.5)
end

function AcademySystem.GetAcademyPower(state)
    state = CompanyState.Ensure(state)
    local total = 0
    for _, entry in ipairs(AcademySystem.GetTrainees(state)) do
        total = total + AcademySystem.GetPlayerPower(entry.trainee)
    end
    return math.floor(total + 0.5)
end

function AcademySystem.GetPotentialGrade(potential)
    potential = tonumber(potential) or 0
    if potential >= 85 then return "S" end
    if potential >= 75 then return "A" end
    if potential >= 65 then return "B" end
    return "C"
end

function AcademySystem.GetScoutCost(state)
    return StaffSystem.GetScoutCost(state)
end

function AcademySystem.GetEmptyRole(state)
    for _, role in ipairs(AcademySystem.ROLE_ORDER) do
        local traineeId = state.roster.academy.players[role]
        if not traineeId or traineeId == "" then return role end
    end
    return nil
end

local function pickUniqueName(state)
    local used = {}
    for _, player in pairs(LeagueCatalog.PLAYERS) do used[player.name] = true end
    for _, player in pairs(state.roster.customPlayers) do used[player.name] = true end
    for _, trainee in pairs(state.roster.academy.trainees) do used[trainee.name] = true end
    local candidates = {}
    for _, name in ipairs(AcademySystem.NAME_POOL) do
        if not used[name] then table.insert(candidates, name) end
    end
    if #candidates == 0 then return "Rookie" .. tostring(state.roster.academy.nextId + 1) end
    return candidates[math.random(#candidates)]
end

function AcademySystem.ScoutTrainee(state)
    state = CompanyState.Ensure(state)
    local role = AcademySystem.GetEmptyRole(state)
    if not role then return false, "青训名额已满（每位置一名学员）" end
    local cost = AcademySystem.GetScoutCost(state)
    if state.company.cash < cost then return false, "现金不足，无法招募学员" end
    state.company.cash = state.company.cash - cost
    state.roster.academy.nextId = tonumber(state.roster.academy.nextId) + 1
    local potential = math.random(62, 92)
    local core = math.floor(potential * 0.55)
    local trainee = {
        id = "youth_" .. tostring(state.roster.academy.nextId),
        name = pickUniqueName(state),
        role = role,
        potential = potential,
        mechanics = clamp(core + math.random(-5, 5), 20, 80),
        teamfight = clamp(core + math.random(-5, 5), 20, 80),
        laning = clamp(core + math.random(-5, 5), 20, 80),
        form = math.random(55, 75),
        recentForm = math.random(-4, 4),
        weeks = 0,
    }
    state.roster.academy.players[role] = trainee.id
    state.roster.academy.trainees[trainee.id] = trainee
    CompanyState.RecordTimeline(state, "青训招募",
        "签下新人 " .. trainee.name .. "（" .. LeagueCatalog.POSITIONS[role] .. "），潜力评级 " .. AcademySystem.GetPotentialGrade(trainee.potential) .. "。")
    return true, trainee
end

function AcademySystem.PromoteTrainee(state, role)
    state = CompanyState.Ensure(state)
    local traineeId = state.roster.academy.players[role]
    if not traineeId or traineeId == "" then return false, "该位置没有学员" end
    local trainee = state.roster.academy.trainees[traineeId]
    if not trainee then return false, "学员数据异常" end
    local player = {
        id = trainee.id,
        name = trainee.name,
        role = trainee.role,
        mechanics = trainee.mechanics,
        teamfight = trainee.teamfight,
        laning = trainee.laning,
        form = trainee.form,
        recentForm = tonumber(trainee.recentForm) or 0,
        potential = trainee.potential,
        salary = 6,
        buyout = 0,
        isYouth = true,
    }
    local displacedId = state.roster.players[role]
    state.roster.players[role] = player.id
    state.roster.contracts[player.id] = 2
    state.roster.customPlayers[player.id] = player
    state.roster.academy.players[role] = ""
    state.roster.academy.trainees[traineeId] = nil
    state.roster.chemistry = math.max(0, state.roster.chemistry - 5)
    LeagueCatalog.RegisterPlayer(player)
    if displacedId and displacedId ~= "" then
        state.roster.contracts[displacedId] = nil
        local displaced = LeagueCatalog.GetPlayer(displacedId)
        CompanyState.RecordTimeline(state, "青训提拔",
            trainee.name .. " 提拔至一队首发" .. LeagueCatalog.POSITIONS[role] .. "，" .. (displaced and displaced.name or "原选手") .. " 合同解除并进入自由市场。")
    else
        CompanyState.RecordTimeline(state, "青训提拔",
            trainee.name .. " 提拔至一队首发" .. LeagueCatalog.POSITIONS[role] .. "，填补阵容空缺。")
    end
    return true, player
end

function AcademySystem.EnsureStandings(state)
    state = CompanyState.Ensure(state)
    if #state.roster.academy.standings == #LeagueCatalog.ACADEMY_TEAMS then return state end
    state.roster.academy.standings = {}
    for _, team in ipairs(LeagueCatalog.ACADEMY_TEAMS) do
        table.insert(state.roster.academy.standings, {
            teamId = team.id,
            teamName = team.name,
            wins = 0,
            losses = 0,
            score = 0,
        })
    end
    return state
end

function AcademySystem.GetStandings(state)
    state = AcademySystem.EnsureStandings(state)
    local sorted = {}
    for _, entry in ipairs(state.roster.academy.standings) do table.insert(sorted, entry) end
    table.sort(sorted, function(a, b)
        if a.wins ~= b.wins then return a.wins > b.wins end
        return a.score > b.score
    end)
    return sorted
end

function AcademySystem.GetYouthTeamPower(state, teamId)
    state = CompanyState.Ensure(state)
    if teamId == "legacy_youth" then
        -- 玩家身处次级联赛时，青年队席位由主力阵容出战
        if state.company.league == "academy" then
            return RosterSystem.GetTeamPower(state)
        end
        return AcademySystem.GetAcademyPower(state)
    end
    local team = LeagueCatalog.GetAcademyTeam(teamId)
    if not team then return 0 end
    local seasons = tonumber(state.company and state.company.seasons) or 0
    local growth = 1 + seasons * AI_SEASON_GROWTH
    return math.floor(team.power * AI_TEAM_SCALE * growth * (0.95 + math.random() * 0.1) + 0.5)
end

local function simulateSeries(state, teamAId, teamBId, bestOf)
    -- 多阶段对局模拟：开局→对线→资源团→收官（次级联赛自动模式，无局内决策）
    local MatchSimulator = require("MatchSimulator")
    local out = MatchSimulator.RunSeries(state, {
        teamAId = teamAId,
        teamBId = teamBId,
        bestOf = bestOf,
        myId = "legacy_youth",
        decisions = false,
        powerMode = "academy",
    })
    return out.winsA, out.winsB, out.games
end

function AcademySystem.RecordStanding(state, teamId, won, gamesWon)
    for _, entry in ipairs(state.roster.academy.standings) do
        if entry.teamId == teamId then
            if won then entry.wins = entry.wins + 1 else entry.losses = entry.losses + 1 end
            entry.score = entry.score + gamesWon
            return
        end
    end
end

function AcademySystem.GrowTrainee(state, trainee, won)
    ---@type number
    local growth = trainee.potential >= 85 and 3 or (trainee.potential >= 72 and 2 or 1)
    growth = growth + StaffSystem.GetAcademyGrowthBonus(state)
    for _ = 1, growth do
        local choice = math.random(3)
        if choice == 1 then
            trainee.mechanics = clamp(trainee.mechanics + 1, 0, 100)
        elseif choice == 2 then
            trainee.teamfight = clamp(trainee.teamfight + 1, 0, 100)
        else
            trainee.laning = clamp(trainee.laning + 1, 0, 100)
        end
    end
    trainee.form = clamp(trainee.form + math.random(-3, 3) + (won and 1 or 0), 0, 100)
    local rf = tonumber(trainee.recentForm) or 0
    if rf > 0 then
        rf = rf - 1
    elseif rf < 0 then
        rf = rf + 1
    end
    trainee.recentForm = clamp(rf + (won and math.random(1, 2) or math.random(-2, -1)), -20, 20)
    trainee.weeks = (trainee.weeks or 0) + 1
end

function AcademySystem.SimulateWeek(state)
    state = AcademySystem.EnsureStandings(state)
    local week = state.company.week
    local legacyWon = false
    local teamCount = #LeagueCatalog.ACADEMY_TEAMS
    for index = 0, teamCount - 1 do
        local opponentIndex = (index + week) % teamCount
        if opponentIndex ~= index then
            local teamA = LeagueCatalog.ACADEMY_TEAMS[index + 1].id
            local teamB = LeagueCatalog.ACADEMY_TEAMS[opponentIndex + 1].id
            local winsA, winsB, games = simulateSeries(state, teamA, teamB, 3)
            local wonA = winsA > winsB
            AcademySystem.RecordStanding(state, teamA, wonA, winsA)
            AcademySystem.RecordStanding(state, teamB, not wonA, winsB)
            if teamA == "legacy_youth" or teamB == "legacy_youth" then
                local myId = "legacy_youth"
                legacyWon = (teamA == myId and wonA) or (teamB == myId and not wonA)
                RosterSystem.UpdatePlayerForms(state, legacyWon, nil)
                local report = MatchReporter.Build(state,
                    { teamA = teamA, teamB = teamB, scoreA = winsA, scoreB = winsB },
                    games, myId, legacyWon)
                state.league.lastAcademyReport = {
                    week = week,
                    opponentId = teamA == myId and teamB or teamA,
                    won = legacyWon,
                    report = report,
                }
            end
        end
    end
    for _, entry in ipairs(AcademySystem.GetTrainees(state)) do
        AcademySystem.GrowTrainee(state, entry.trainee, legacyWon)
    end
    if legacyWon and #AcademySystem.GetTrainees(state) > 0 then
        state.company.fans = state.company.fans + 200
        CompanyState.RecordTimeline(state, "次级联赛获胜", "青年队在次级联赛中取胜，粉丝 +200。")
    end
    return legacyWon
end

return AcademySystem
