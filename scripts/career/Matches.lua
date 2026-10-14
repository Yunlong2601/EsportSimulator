-- Unified-career match rules. Pure Lua: callers supply a candidate world and
-- commit it only after the command and save succeed. No legacy singleton reads.
-- Retains the old simulator's BO / paused-phase flow, not its team-power rolls.
local Util = require("career.Util")
local Matches = {}

local ROLES = { "top", "jungle", "mid", "adc", "support" }
local PHASES = {
    { id = "lane", label = "对线与发育", weight = 0.8,
      attrs = { mechanics = 0.48, gameSense = 0.27, teamwork = 0.10, mental = 0.15 } },
    { id = "objective", label = "资源争夺", weight = 1.0,
      attrs = { mechanics = 0.17, gameSense = 0.43, teamwork = 0.27, mental = 0.13 } },
    { id = "teamfight", label = "决胜团战", weight = 1.2,
      attrs = { mechanics = 0.30, gameSense = 0.18, teamwork = 0.33, mental = 0.19 } },
}
local ROLE_ATTRS = {
    top = { mechanics = 0.40, gameSense = 0.30, teamwork = 0.10, mental = 0.20 },
    jungle = { mechanics = 0.20, gameSense = 0.45, teamwork = 0.25, mental = 0.10 },
    mid = { mechanics = 0.40, gameSense = 0.30, teamwork = 0.15, mental = 0.15 },
    adc = { mechanics = 0.50, gameSense = 0.20, teamwork = 0.10, mental = 0.20 },
    support = { mechanics = 0.15, gameSense = 0.30, teamwork = 0.45, mental = 0.10 },
}
local ROLE_PRESSURE = {
    top = "主动换血与边线施压", jungle = "入侵野区争夺节奏",
    mid = "压线寻找单杀", adc = "积极换血争取输出", support = "前压寻找开团机会",
}
local ROLE_COORDINATE = {
    top = "沟通传送与支援", jungle = "协同队友布置资源",
    mid = "推线后配合游走", adc = "跟随队友集火", support = "布置视野保护队友",
}
local ATTR_ORDER = { "mechanics", "gameSense", "teamwork", "mental" }

local function fixtureById(world, id)
    for _, fixture in ipairs(world.fixtures or {}) do
        if fixture.id == id then return fixture end
    end
end

local function actorControl(world, actorId, fixture)
    local actor = world.persons[actorId]
    if not actor then return nil, nil, "人物不存在" end
    for _, clubId in ipairs({ fixture.homeId, fixture.awayId }) do
        local club = world.clubs[clubId]
        if club and club.ownerId == actorId then return clubId, "owner" end
    end
    if actor.careerStatus == "active" and actor.clubId then
        local club = world.clubs[actor.clubId]
        if club and (fixture.homeId == club.id or fixture.awayId == club.id) then
            if club.roster[actor.role] == actorId then return club.id, "player" end
            return nil, nil, "你尚未进入本场首发阵容"
        end
    end
    return nil, nil, "你没有这场比赛的参赛或管理权限"
end

local function validateRosters(world, fixture)
    local used = {}
    for _, clubId in ipairs({ fixture.homeId, fixture.awayId }) do
        local club = world.clubs[clubId]
        if not club then return false, "赛程中的俱乐部不存在" end
        for _, role in ipairs(ROLES) do
            local id = (club.roster or {})[role]
            local person = id and world.persons[id]
            if not person or person.careerStatus ~= "active" or person.clubId ~= clubId
                or person.role ~= role or used[id] then
                return false, club.name .. "的" .. role .. "位置缺少有效首发选手"
            end
            used[id] = true
        end
    end
    return true
end

local function bestHero(person)
    local heroId, familiarity = "default", 50
    local found = false
    -- Equal proficiency is ordered by ID, independent of Lua table iteration.
    for id, value in pairs(person.heroPool or {}) do
        if type(value) == "number" and (not found or value > familiarity
            or (value == familiarity and tostring(id) < heroId)) then
            heroId, familiarity, found = tostring(id), value, true
        end
    end
    return heroId, Util.Clamp(familiarity, 0, 100)
end

local function makeMatch(world, fixture, actorId, clubId, mode)
    local match = {
        id = "match_" .. fixture.id, fixtureId = fixture.id, day = fixture.day,
        homeId = fixture.homeId, awayId = fixture.awayId,
        actorId = actorId, controlledClubId = clubId, controlMode = mode,
        status = "in_progress", bestOf = 3, gameIndex = 1, phaseIndex = 1,
        phaseLabel = PHASES[1].label, score = { home = 0, away = 0 },
        advantage = 0, games = {}, events = {}, gameEvents = {},
        rosterSnapshot = {}, playerSnapshot = {}, performances = {},
    }
    for _, id in ipairs({ fixture.homeId, fixture.awayId }) do
        match.rosterSnapshot[id] = Util.Copy(world.clubs[id].roster)
        for _, role in ipairs(ROLES) do
            local personId = world.clubs[id].roster[role]
            local person = Util.Copy(world.persons[personId])
            person.matchHeroId, person.matchFamiliarity = bestHero(person)
            match.playerSnapshot[personId] = person
            match.performances[personId] = {
                personId = personId, name = person.name, clubId = id, role = role,
                heroId = person.matchHeroId, contribution = 0, impact = 0,
                phaseCount = 0, rating = 5,
            }
        end
    end
    world.matches[match.id] = match
    fixture.status, fixture.matchId = "in_progress", match.id
    return match
end

function Matches.Active(world)
    local match = world.activeMatchId and world.matches[world.activeMatchId]
    if match and match.status == "in_progress" then return match end
end

function Matches.Start(world, actorId, fixtureId)
    if Matches.Active(world) then return false, "请先完成正在进行的比赛" end
    local fixture = fixtureById(world, fixtureId)
    if not fixture then return false, "没有找到这场赛程" end
    if fixture.status ~= "scheduled" then return false, "这场比赛已开始或已结束" end
    if fixture.day > world.clock.day then return false, "尚未到比赛日" end
    if fixture.homeId == fixture.awayId then return false, "赛程对手无效" end
    local clubId, mode, reason = actorControl(world, actorId, fixture)
    if not clubId then return false, reason end
    local valid, errorMessage = validateRosters(world, fixture)
    if not valid then return false, errorMessage end
    if world.matches["match_" .. fixture.id] then return false, "该赛程已有比赛记录" end
    local match = makeMatch(world, fixture, actorId, clubId, mode)
    world.activeMatchId = match.id
    return true, "BO3 开始：请决定第一局的个人行动或战术"
end

function Matches.GetChoices(world)
    local match = Matches.Active(world)
    if not match then return {} end
    if match.controlMode == "owner" then
        return {
            { id = "tempo", label = "主动提速", description = "依靠操作与地图判断争取优势；全队疲劳 +3，发挥波动较大。" },
            { id = "teamplay", label = "协同争夺", description = "依靠配合与地图判断争取资源；全队疲劳 +2，资源和团战阶段更有效。" },
            { id = "patient", label = "稳健运营", description = "依靠心态与判断稳住局势；全队疲劳 +1，爆发较低但失误波动小。" },
        }
    end
    local actor = match.playerSnapshot[match.actorId]
    return {
        { id = "pressure", label = ROLE_PRESSURE[actor.role], description = "依靠操作把握主动权；自身疲劳 +3，回报与失误波动都较大。" },
        { id = "coordinate", label = ROLE_COORDINATE[actor.role], description = "依靠判断与配合形成团队贡献；自身疲劳 +2，资源和团战阶段更有效。" },
        { id = "conserve", label = "稳住位置减少失误", description = "依靠心态与判断降低波动；自身疲劳 +1，主动贡献较低，适合疲劳时。" },
    }
end

local function stat(person, key)
    return Util.Clamp(tonumber((person.attrs or {})[key]) or 50, 0, 100)
end

local function npcChoice(person, phaseIndex)
    if (person.fatigue or 0) > 65 then return "conserve" end
    if phaseIndex > 1 and (stat(person, "teamwork") + stat(person, "gameSense")) / 2
        >= stat(person, "mechanics") - 5 then return "coordinate" end
    return "pressure"
end

-- Choice changes the input to the contest, never a cosmetic post-result bonus.
local function choiceFactors(person, id, phaseIndex)
    local tired = (person.fatigue or 0) / 100
    if id == "pressure" or id == "tempo" then
        return (stat(person, "mechanics") - 50) * 0.24
            + (stat(person, "gameSense") - 50) * 0.08 + 3 - tired * 7, 15, 3
    elseif id == "coordinate" or id == "teamplay" then
        local phaseBonus = phaseIndex == 1 and -1 or 4
        return (stat(person, "teamwork") - 50) * 0.20
            + (stat(person, "gameSense") - 50) * 0.16 + phaseBonus, 8, 2
    end
    return (stat(person, "mental") - 50) * 0.10
        + (stat(person, "gameSense") - 50) * 0.08 - 4 + tired * 5, 4, 1
end

local function phaseContribution(world, person, phase, choiceId, phaseIndex)
    local base = 0
    for _, key in ipairs(ATTR_ORDER) do
        local weight = phase.attrs[key] * 0.6 + ROLE_ATTRS[person.role][key] * 0.4
        base = base + stat(person, key) * weight
    end
    -- Proficiency, fatigue and morale are separate causal factors, retained from
    -- the old HeroSystem concept without its singleton / team-power dependency.
    local familiarity = 0.78 + person.matchFamiliarity * 0.0032
    local condition = 1 - Util.Clamp(person.fatigue or 0, 0, 100) * 0.0035
    local morale = (Util.Clamp(person.morale or 50, 0, 100) - 50) * 0.08
    local actionBonus, spread, fatigueCost = choiceFactors(person, choiceId, phaseIndex)
    local noise = (Util.Random(world) * 2 - 1) * spread
    local value = math.max(1, base * familiarity * condition + morale + actionBonus + noise)
    person.fatigue = Util.Clamp((person.fatigue or 0) + fatigueCost, 0, 100)
    world.persons[person.id].fatigue = person.fatigue
    return {
        personId = person.id, role = person.role, choiceId = choiceId,
        base = base, familiarity = familiarity, condition = condition,
        actionBonus = actionBonus, noise = noise, contribution = value,
        fatigueCost = fatigueCost, heroId = person.matchHeroId,
    }
end

local function finishSeries(world, match)
    local homeWon = match.score.home > match.score.away
    match.status, match.winnerId = "completed", homeWon and match.homeId or match.awayId
    match.loserId = homeWon and match.awayId or match.homeId
    local bestImpact = -math.huge
    -- Winner's MVP is the highest measured matchup impact, not another RNG draw.
    for _, role in ipairs(ROLES) do
        local id = match.rosterSnapshot[match.winnerId][role]
        local performance = match.performances[id]
        if performance.impact > bestImpact then
            bestImpact, match.mvpId = performance.impact, id
        end
    end
    for _, clubId in ipairs({ match.homeId, match.awayId }) do
        for _, role in ipairs(ROLES) do
            local id = match.rosterSnapshot[clubId][role]
            local person = world.persons[id]
            person.morale = Util.Clamp((person.morale or 50) + (clubId == match.winnerId and 3 or -2), 0, 100)
        end
    end
    local fixture = fixtureById(world, match.fixtureId)
    fixture.status, fixture.matchId = "completed", match.id
    if world.activeMatchId == match.id then world.activeMatchId = nil end
    local title = world.clubs[match.homeId].name .. " " .. match.score.home .. ":"
        .. match.score.away .. " " .. world.clubs[match.awayId].name
    match.summary = title
    Util.Record(world, "match", title, {
        matchId = match.id,
        clubId = match.controlledClubId or match.winnerId,
        personId = match.actorId, winnerId = match.winnerId, mvpId = match.mvpId,
    })
end

local function finishGame(world, match)
    local wonHome = match.advantage >= 0
    local winner = wonHome and match.homeId or match.awayId
    match.score[wonHome and "home" or "away"] = match.score[wonHome and "home" or "away"] + 1
    match.games[#match.games + 1] = {
        index = match.gameIndex, winnerId = winner, advantage = match.advantage,
        events = match.gameEvents,
    }
    if match.score.home == 2 or match.score.away == 2 then
        finishSeries(world, match)
    else
        match.gameIndex = match.gameIndex + 1
        match.phaseIndex, match.advantage = 1, 0
        match.gameEvents, match.phaseLabel = {}, PHASES[1].label
    end
end

local function resolvePhase(world, match, choiceId, choiceLabel)
    local phase = PHASES[match.phaseIndex]
    local event = {
        gameIndex = match.gameIndex, phaseIndex = match.phaseIndex,
        phase = phase.id, phaseLabel = phase.label, choiceId = choiceId,
        choiceLabel = choiceLabel, actorId = match.actorId, contributions = {},
        totals = { home = 0, away = 0 }, advantageBefore = match.advantage,
    }
    -- Write the selected action into the saved event before drawing randomness.
    match.events[#match.events + 1] = event
    match.gameEvents[#match.gameEvents + 1] = event
    for sideIndex, clubId in ipairs({ match.homeId, match.awayId }) do
        local side = sideIndex == 1 and "home" or "away"
        for _, role in ipairs(ROLES) do
            local id = match.rosterSnapshot[clubId][role]
            local person = match.playerSnapshot[id]
            local action = npcChoice(person, match.phaseIndex)
            if clubId == match.controlledClubId and
                (match.controlMode == "owner" or id == match.actorId) then action = choiceId end
            local contribution = phaseContribution(world, person, phase, action, match.phaseIndex)
            event.contributions[id] = contribution
            event.totals[side] = event.totals[side] + contribution.contribution
        end
    end
    local delta = (event.totals.home - event.totals.away) / #ROLES * phase.weight
    -- Prior lane/resource advantages carry into later phases; games are not
    -- decided by the majority of independent phase wins.
    match.advantage = match.advantage * 0.85 + delta
    event.advantageAfter, event.delta = match.advantage, delta
    event.winnerId = delta >= 0 and match.homeId or match.awayId
    for _, role in ipairs(ROLES) do
        local homeId, awayId = match.rosterSnapshot[match.homeId][role], match.rosterSnapshot[match.awayId][role]
        local homeValue = event.contributions[homeId].contribution
        local awayValue = event.contributions[awayId].contribution
        for index, id in ipairs({ homeId, awayId }) do
            local performance = match.performances[id]
            performance.contribution = performance.contribution + event.contributions[id].contribution
            performance.impact = performance.impact + (index == 1 and homeValue - awayValue or awayValue - homeValue) * phase.weight
            performance.phaseCount = performance.phaseCount + 1
            performance.rating = math.floor(Util.Clamp(5 + performance.impact / performance.phaseCount / 12, 1, 10) * 10 + 0.5) / 10
        end
    end
    local leader = match.advantage >= 0 and match.homeId or match.awayId
    event.text = "第 " .. match.gameIndex .. " 局 · " .. phase.label .. "："
        .. world.clubs[event.winnerId].name .. "在本阶段创造更多有效贡献；"
        .. world.clubs[leader].name .. "保持局势优势。"
    if match.phaseIndex == #PHASES then finishGame(world, match)
    else
        match.phaseIndex = match.phaseIndex + 1
        match.phaseLabel = PHASES[match.phaseIndex].label
    end
end

function Matches.Choose(world, actorId, choiceId)
    local match = Matches.Active(world)
    if not match then return false, "当前没有待处理的比赛" end
    if match.actorId ~= actorId then return false, "你不是本场比赛的决策者" end
    local fixture = fixtureById(world, match.fixtureId)
    if not fixture or fixture.status ~= "in_progress" then return false, "比赛状态与赛程不一致" end
    local clubId, mode, reason = actorControl(world, actorId, fixture)
    if clubId ~= match.controlledClubId or mode ~= match.controlMode then
        return false, reason or "比赛期间身份或管理权限发生变化"
    end
    ---@type table|nil
    local selected = nil
    for _, choice in ipairs(Matches.GetChoices(world)) do
        if choice.id == choiceId then selected = choice; break end
    end
    if not selected then return false, "请选择当前阶段提供的行动" end
    resolvePhase(world, match, selected.id, selected.label)
    return true, match.status == "completed" and match.summary or match.events[#match.events].text
end

-- AI uses exactly the same participants, phase rules, fatigue and results.
-- A due player/owner fixture is never silently consumed by background progress.
function Matches.SimulateOthers(world, day, excludedClubId)
    local completed, issues = 0, {}
    local active = Matches.Active(world)
    for _, fixture in ipairs(world.fixtures or {}) do
        local home, away = world.clubs[fixture.homeId], world.clubs[fixture.awayId]
        local protagonist = world.persons[world.protagonistId]
        local playerInvolved = protagonist and protagonist.careerStatus == "active"
            and (protagonist.clubId == fixture.homeId or protagonist.clubId == fixture.awayId)
        local owned = (home and home.ownerId == world.protagonistId) or (away and away.ownerId == world.protagonistId)
        local activeClub = active and (fixture.homeId == active.homeId or fixture.homeId == active.awayId
            or fixture.awayId == active.homeId or fixture.awayId == active.awayId)
        if fixture.status == "scheduled" and fixture.day <= day
            and fixture.homeId ~= excludedClubId and fixture.awayId ~= excludedClubId
            and not playerInvolved and not owned and not activeClub then
            local valid, reason = validateRosters(world, fixture)
            if valid and fixture.homeId ~= fixture.awayId and not world.matches["match_" .. fixture.id] then
                local match = makeMatch(world, fixture, nil, nil, "npc")
                while match.status == "in_progress" do resolvePhase(world, match, "auto", "双方自行决策") end
                completed = completed + 1
            else
                issues[#issues + 1] = { fixtureId = fixture.id, reason = reason or "赛程记录冲突" }
            end
        end
    end
    return completed, issues
end

local function finite(value)
    return type(value) == "number" and value == value and value ~= math.huge and value ~= -math.huge
end

-- Used by loading/commit validation; it never repairs records or draws RNG.
function Matches.Validate(world)
    if type(world.matches) ~= "table" then return false, "缺少比赛记录" end
    local activeCount = 0
    for id, match in pairs(world.matches) do
        if type(match) ~= "table" or match.id ~= id or match.bestOf ~= 3
            or (match.status ~= "in_progress" and match.status ~= "completed") then
            return false, "比赛记录格式无效"
        end
        local fixture = fixtureById(world, match.fixtureId)
        if not fixture or fixture.matchId ~= id or fixture.status ~= match.status
            or fixture.homeId ~= match.homeId or fixture.awayId ~= match.awayId
            or not world.clubs[match.homeId] or not world.clubs[match.awayId]
            or match.homeId == match.awayId then return false, "比赛与赛程引用不一致" end
        for _, key in ipairs({ "score", "rosterSnapshot", "playerSnapshot", "performances", "events", "gameEvents", "games" }) do
            if type(match[key]) ~= "table" then return false, "比赛恢复缺少 " .. key end
        end
        if not Util.Integer(match.gameIndex, 1, 3) or not Util.Integer(match.phaseIndex, 1, 3)
            or not Util.Integer(match.score.home, 0, 2) or not Util.Integer(match.score.away, 0, 2)
            or not finite(match.advantage) then return false, "比赛阶段或比分无效" end
        local seen = {}
        for _, clubId in ipairs({ match.homeId, match.awayId }) do
            local roster = match.rosterSnapshot[clubId]
            if type(roster) ~= "table" then return false, "缺少报名阵容快照" end
            for _, role in ipairs(ROLES) do
                local personId = roster[role]
                local person = personId and match.playerSnapshot[personId]
                local performance = personId and match.performances[personId]
                if type(person) ~= "table" or person.id ~= personId or person.role ~= role or person.clubId ~= clubId
                    or seen[personId] or not world.persons[personId] or type(person.attrs) ~= "table"
                    or not finite(person.matchFamiliarity) or not finite(person.fatigue)
                    or person.fatigue < 0 or person.fatigue > 100 then return false, "报名选手快照无效" end
                seen[personId] = true
                for _, attr in ipairs(ATTR_ORDER) do
                    if not finite(person.attrs[attr]) then return false, "比赛能力快照无效" end
                end
                if type(performance) ~= "table" or performance.personId ~= personId or performance.clubId ~= clubId
                    or performance.phaseCount ~= #match.events or not finite(performance.impact)
                    or not finite(performance.contribution) or not finite(performance.rating) then
                    return false, "个人比赛表现记录无效"
                end
            end
        end
        local wins = { home = 0, away = 0 }
        for gameIndex, game in ipairs(match.games) do
            if type(game) ~= "table" or game.index ~= gameIndex or (game.winnerId ~= match.homeId and game.winnerId ~= match.awayId)
                or type(game.events) ~= "table" or #game.events ~= 3 or not finite(game.advantage) then
                return false, "已完成小局记录无效"
            end
            local side = game.winnerId == match.homeId and "home" or "away"
            wins[side] = wins[side] + 1
        end
        if wins.home ~= match.score.home or wins.away ~= match.score.away then return false, "小局结果与系列赛比分不符" end
        for eventIndex, event in ipairs(match.events) do
            if type(event) ~= "table" or event.phaseIndex ~= (eventIndex - 1) % 3 + 1
                or event.gameIndex ~= math.floor((eventIndex - 1) / 3) + 1
                or type(event.contributions) ~= "table" or type(event.totals) ~= "table"
                or not finite(event.advantageAfter) or not finite(event.delta) then return false, "比赛阶段记录无效" end
            for personId in pairs(seen) do
                local contribution = event.contributions[personId]
                if type(contribution) ~= "table" or contribution.personId ~= personId or not finite(contribution.contribution) then
                    return false, "比赛阶段缺少个人贡献"
                end
            end
        end
        if match.status == "in_progress" then
            activeCount = activeCount + 1
            if world.activeMatchId ~= id or #match.games ~= match.gameIndex - 1
                or #match.gameEvents ~= match.phaseIndex - 1
                or #match.events ~= #match.games * 3 + match.phaseIndex - 1
                or match.score.home >= 2 or match.score.away >= 2 then return false, "待续比赛状态无效" end
            if match.controlMode ~= "player" and match.controlMode ~= "owner" then return false, "待续比赛控制身份无效" end
            local clubId, mode = actorControl(world, match.actorId, fixture)
            if clubId ~= match.controlledClubId or mode ~= match.controlMode then return false, "待续比赛的操作权限无效" end
            if mode == "player" and not match.playerSnapshot[match.actorId] then return false, "待续比赛缺少主角快照" end
        else
            local winningScore = math.max(match.score.home, match.score.away)
            local losingScore = math.min(match.score.home, match.score.away)
            local expectedWinner = match.score.home > match.score.away and match.homeId or match.awayId
            if winningScore ~= 2 or losingScore >= 2 or match.winnerId ~= expectedWinner
                or #match.games ~= match.gameIndex or #match.events ~= #match.games * 3
                or not match.performances[match.mvpId]
                or match.performances[match.mvpId].clubId ~= match.winnerId then return false, "已完成比赛结果无效" end
        end
    end
    if activeCount > 1 or (world.activeMatchId and activeCount ~= 1) then return false, "进行中比赛引用无效" end
    for _, fixture in ipairs(world.fixtures or {}) do
        if fixture.status ~= "scheduled" and not world.matches[fixture.matchId] then return false, "赛程缺少比赛记录" end
    end
    return true
end

return Matches
