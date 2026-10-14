-- TierSystem：俱乐部评级（声望境界）
-- 草根 → 新锐 → 职业 → 豪门 → 传奇。综合评估分（战绩/估值/粉丝/青训）跨过门槛升级，
-- 每档解锁：赞助席位、战术、训练设施、区域杯赛——成长的质变点。
-- 借鉴修仙放置「境界阶梯」与 FM「董事会评价」：评级只升不降，世界冠军/三冠王朝直升传奇。
local CompanyState = require("CompanyState")
local LeagueCatalog = require("LeagueCatalog")
local RosterSystem = require("RosterSystem")

local TierSystem = {}

TierSystem.TIERS = {
    grassroots = {
        id = "grassroots",
        name = "草根俱乐部",
        icon = "新秀",
        iconLarge = "新秀",
        color = "#8B5CF6", -- 紫色
        colorBg = "#F5F3FF",
        rankLabel = "业余级",
        index = 1,
        next = 20,
        sponsorSlots = 2, -- 经济平衡 §2.5：草根 1 → 2
        trainBonus = 0,
        cup = false,
        unlocks = "基础训练 · 赞助席 ×2 · 战术：均衡",
    },
    rising = {
        id = "rising",
        name = "新锐俱乐部",
        icon = "明星",
        iconLarge = "明星",
        color = "#3B82F6", -- 蓝色
        colorBg = "#EFF6FF",
        rankLabel = "入门级",
        index = 2,
        next = 40,
        sponsorSlots = 3, -- 经济平衡 §2.5：新锐 2 → 3
        trainBonus = 1,
        cup = false,
        unlocks = "赞助席 ×3 · 解锁「稳健防守」· 训练设施 +1",
    },
    professional = {
        id = "professional",
        name = "职业俱乐部",
        icon = "豪门",
        iconLarge = "豪门",
        color = "#10B981", -- 绿色
        colorBg = "#ECFDF5",
        rankLabel = "专业级",
        index = 3,
        next = 60,
        sponsorSlots = 3,
        trainBonus = 1,
        cup = true,
        unlocks = "赞助席 ×3 · 解锁「激进进攻」· 解锁区域杯赛",
    },
    elite = {
        id = "elite",
        name = "豪门俱乐部",
        icon = "世家",
        iconLarge = "世家",
        color = "#F59E0B", -- 金色
        colorBg = "#FFFBEB",
        rankLabel = "精英级",
        index = 4,
        next = 80,
        sponsorSlots = 4,
        trainBonus = 2,
        cup = true,
        unlocks = "赞助席 ×4 · 解锁「版本答案」· 训练设施 +2",
    },
    legend = {
        id = "legend",
        name = "传奇俱乐部",
        icon = "王者",
        iconLarge = "王者",
        color = "#EF4444", -- 红色
        colorBg = "#FEF2F2",
        rankLabel = "传奇级",
        index = 5,
        next = 101,
        sponsorSlots = 5,
        trainBonus = 3,
        cup = true,
        unlocks = "赞助席 ×5 · 解锁「王朝战术」· 训练设施 +3",
    },
}

local function clamp(value, minimum, maximum)
    return math.max(minimum, math.min(maximum, tonumber(value) or minimum))
end

-- 起始评级按联赛地位：网吧草根 / 次级新锐 / 顶级职业
function TierSystem.GetStartTier(state)
    state = CompanyState.Ensure(state)
    if state.company.league == "qualifier" then return "grassroots" end
    if state.company.league == "academy" then return "rising" end
    return "professional"
end

function TierSystem.GetTier(state)
    state = CompanyState.Ensure(state)
    local id = state.company.tier
    local tier = TierSystem.TIERS[id]
    if tier then return tier end
    return TierSystem.TIERS[TierSystem.GetStartTier(state)]
end

function TierSystem.GetTierIndex(state)
    return TierSystem.GetTier(state).index
end

-- 当前评级对应评估分上限（用于进度条）
function TierSystem.GetTierFloor(state)
    local tier = TierSystem.GetTier(state)
    if tier.index <= 1 then return 0 end
    local order = { "grassroots", "rising", "professional", "elite", "legend" }
    local prevId = order[tier.index - 1]
    local prevTier = TierSystem.TIERS[prevId]
    return prevTier and prevTier.next or 0
end

function TierSystem.GetRank(state)
    state = CompanyState.Ensure(state)
    local function rankIn(standings, targetId)
        local sorted = {}
        for _, entry in ipairs(standings or {}) do table.insert(sorted, entry) end
        table.sort(sorted, function(a, b)
            if a.wins ~= b.wins then return a.wins > b.wins end
            return (a.score or 0) > (b.score or 0)
        end)
        for rank, entry in ipairs(sorted) do
            if entry.teamId == targetId then return rank end
        end
        return #sorted + 1
    end
    local league = state.company.league
    if league == "academy" then return rankIn(state.roster.academy.standings, "legacy_youth") end
    if league == "qualifier" then return rankIn(state.league.standings, "legacy_cafe") end
    return rankIn(state.league.standings, "legacy")
end

-- 战绩维度 0-100：联赛等级 + 当前排名决定
function TierSystem.GetCompetitionScore(state)
    state = CompanyState.Ensure(state)
    local seasonState = state.company.seasonState
    if seasonState == "champion" or seasonState == "world_champion" then return 100 end
    local league = state.company.league
    local rank = TierSystem.GetRank(state)
    if league == "qualifier" then
        return rank <= 2 and 55 or 20
    elseif league == "academy" then
        if rank <= 2 then return 60 end
        if rank <= 6 then return 45 end
        return 35
    end
    if rank == 1 then return 100 end
    if rank <= 4 then return 85 end
    if rank <= 6 then return 70 end
    return 50
end

-- 青训维度 0-100：学员数量 + 训练周数
function TierSystem.GetAcademyScore(state)
    state = CompanyState.Ensure(state)
    local count = 0
    for _, playerId in pairs(state.roster.academy.players or {}) do
        if playerId and playerId ~= "" then count = count + 1 end
    end
    local weeks = 0
    for _, trainee in pairs(state.roster.academy.trainees or {}) do
        weeks = weeks + tonumber(trainee.weeks or 0)
    end
    return math.min(100, count * 10 + math.min(30, weeks * 3))
end

-- 综合评估分：战绩 40% + 估值 30% + 粉丝 20% + 青训 10%
function TierSystem.GetAssessment(state)
    state = CompanyState.Ensure(state)
    local comp = TierSystem.GetCompetitionScore(state)
    local val = math.min(100, (tonumber(state.finance.valuation) or 0) / 6000 * 100)
    local fans = math.min(100, (tonumber(state.company.fans) or 0) / 300000 * 100)
    local academy = TierSystem.GetAcademyScore(state)
    return math.floor(0.4 * comp + 0.3 * val + 0.2 * fans + 0.1 * academy + 0.5)
end

function TierSystem.GetTierForScore(score)
    score = tonumber(score) or 0
    if score >= 80 then return TierSystem.TIERS.legend end
    if score >= 60 then return TierSystem.TIERS.elite end
    if score >= 40 then return TierSystem.TIERS.professional end
    if score >= 20 then return TierSystem.TIERS.rising end
    return TierSystem.TIERS.grassroots
end

-- 周结算/赛季事件后调用：评估分跨门槛即升级（只升不降）
function TierSystem.UpdateTier(state)
    state = CompanyState.Ensure(state)
    local current = TierSystem.GetTier(state)
    local score = TierSystem.GetAssessment(state)
    local target = TierSystem.GetTierForScore(score)
    local championships = tonumber(state.profile and state.profile.championships) or 0
    local worldChampion = state.company.seasonState == "world_champion"
    if (worldChampion or championships >= 3) and current.index < 5 then
        target = TierSystem.TIERS.legend
    end
    if target.index <= current.index then return state end
    state.company.tier = target.id
    local jump = target.index - current.index
    state.company.reputation = clamp((tonumber(state.company.reputation) or 50) + 8 * jump, 0, 100)
    state.company.fans = (tonumber(state.company.fans) or 0) + 8000 * jump
    local ProfileSystem = require("ProfileSystem")
    ProfileSystem.InsertHonor(state, {
        type = "tier",
        title = target.icon .. " " .. target.name,
        detail = "综合评估 " .. tostring(score) .. " 分，俱乐部晋升「" .. target.name .. "」",
        at = tonumber(state.company.seasons) or 0,
    })
    CompanyState.RecordTimeline(state, "俱乐部升级",
        "综合评估 " .. tostring(score) .. " 分，俱乐部晋升「" .. target.name .. "」！解锁：" .. target.unlocks)
    return state
end

-- ============ 每档解锁能力 ============

function TierSystem.GetSponsorSlots(state)
    return TierSystem.GetTier(state).sponsorSlots
end

function TierSystem.GetTrainBonus(state)
    return TierSystem.GetTier(state).trainBonus
end

function TierSystem.IsCupUnlocked(state)
    return TierSystem.GetTier(state).cup
end

function TierSystem.IsTacticUnlocked(state, tacticId)
    local tier = TierSystem.GetTier(state)
    if tier.index >= 5 then return true end
    if tacticId == "balanced" then return true end
    if tacticId == "defensive" then return tier.index >= 2 end
    if tacticId == "aggressive" then return tier.index >= 3 end
    if tacticId == "metapick" then return tier.index >= 4 end
    return false
end

function TierSystem.GetUnlockableTactics(state)
    state = CompanyState.Ensure(state)
    local TacticsSystem = require("TacticsSystem")
    local list = {}
    for id, tactic in pairs(TacticsSystem.TACTICS) do
        if TierSystem.IsTacticUnlocked(state, id) then
            table.insert(list, tactic)
        end
    end
    table.sort(list, function(a, b)
        local order = { balanced = 1, defensive = 2, aggressive = 3, metapick = 4, domination = 5 }
        return (order[a.id] or 9) < (order[b.id] or 9)
    end)
    return list
end

-- ============ 区域杯赛（职业评级解锁） ============

-- 每赛季中期的单场淘汰赛：对手为当前联赛积分榜头名 AI 队伍
function TierSystem.CheckCup(state)
    state = CompanyState.Ensure(state)
    if not TierSystem.IsCupUnlocked(state) then return state end
    if state.company.league == "qualifier" then return state end
    local week = tonumber(state.company.week) or 1
    local seasonWeeks = tonumber(state.company.settings and state.company.settings.seasonWeeks) or 7
    local cupWeek = math.max(2, math.min(seasonWeeks - 1, math.floor(seasonWeeks / 2)))
    if week ~= cupWeek then return state end
    local cup = state.league.cup
    if not cup then cup = {}; state.league.cup = cup end
    if cup.done or cup.week == week then return state end
    local opponentId = TierSystem.GetCupOpponent(state)
    if not opponentId then return state end

    local TacticsSystem = require("TacticsSystem")
    local myPower = RosterSystem.GetTeamPower(state)
    local aiPower
    if state.company.league == "academy" then
        local AcademySystem = require("AcademySystem")
        aiPower = AcademySystem.GetYouthTeamPower(state, opponentId)
    else
        local CompetitionSystem = require("CompetitionSystem")
        aiPower = CompetitionSystem.GetTeamPower(state, opponentId)
    end
    local rollA, rollB
    if myPower > 0 then
        local pA, vA = TacticsSystem.GetRollParams(state, true, myPower)
        rollA = pA * ((1 - vA) + math.random() * 2 * vA)
    else
        rollA = myPower * (0.85 + math.random() * 0.3)
    end
    rollB = aiPower * (0.85 + math.random() * 0.3)
    local won = rollA >= rollB
    local opponentName = TierSystem.GetTeamName(opponentId)
    cup.done = true
    cup.won = won
    cup.week = week
    if won then
        local prize = state.company.league == "academy" and 30 or 60
        state.company.cash = (tonumber(state.company.cash) or 0) + prize
        state.company.fans = (tonumber(state.company.fans) or 0) + 4000
        state.company.reputation = clamp((tonumber(state.company.reputation) or 50) + 3, 0, 100)
        CompanyState.RecordTimeline(state, " 区域杯赛冠军",
            "杯赛决赛 " .. tostring(opponentName) .. "，勇夺区域杯赛冠军！奖金 ¥" .. tostring(prize) .. "万，粉丝 +4000。")
    else
        state.company.fans = math.max(0, (tonumber(state.company.fans) or 0) - 500)
        CompanyState.RecordTimeline(state, "区域杯赛止步",
            "杯赛不敌 " .. tostring(opponentName) .. "，止步区域杯赛。")
    end
    return state
end

-- 当前联赛积分榜头名 AI 队伍（排除我方）
function TierSystem.GetCupOpponent(state)
    state = CompanyState.Ensure(state)
    local standings = state.company.league == "academy"
        and state.roster.academy.standings or state.league.standings
    local myId = state.company.league == "academy" and "legacy_youth" or "legacy"
    local best = nil
    for _, entry in ipairs(standings or {}) do
        if entry.teamId ~= myId then
            if not best or entry.wins > best.wins or (entry.wins == best.wins and (entry.score or 0) > (best.score or 0)) then
                best = entry
            end
        end
    end
    return best and best.teamId or nil
end

function TierSystem.GetTeamName(teamId)
    local team = LeagueCatalog.GetTeam(teamId)
        or LeagueCatalog.GetAcademyTeam(teamId)
        or LeagueCatalog.GetQualifierTeam(teamId)
    return team and team.name or teamId
end

return TierSystem
