local CompanyState = require("CompanyState")
local LeagueCatalog = require("LeagueCatalog")
local RosterSystem = require("RosterSystem")
local FinanceSystem = require("FinanceSystem")
local MetaSystem = require("MetaSystem")
local EventSystem = require("EventSystem")
local StaffSystem = require("StaffSystem")
local AcademySystem = require("AcademySystem")
local SponsorSystem = require("SponsorSystem")
local ProfileSystem = require("ProfileSystem")
local MarketSystem = require("MarketSystem")
local MatchReporter = require("MatchReporter")
local PlayerEcoSystem = require("PlayerEcoSystem")
local TacticsSystem = require("TacticsSystem")
local MatchSimulator = require("MatchSimulator")

local CompetitionSystem = {}

local REGULAR_WEEKS = 7
local QUALIFIER_WEEKS = 3
local ACADEMY_SEASON_WEEKS = 5 -- 玩家身处次级联赛时赛季 5 周，保持爬升节奏
local BANKRUPT_LIMIT = -50
local AI_TEAM_SCALE = 6.0 -- AI 队伍战力为全队量级（5 名选手），与玩家合计战力对齐
local AI_SEASON_GROWTH = 0.12 -- 每完成一个赛季，AI 队伍战力成长 12%（玩家需持续投入才能保持领先）
local QUALIFIER_SCALE = 10.2 -- 预选赛 AI 接近弱职业队（玩家满编 5 人），主动经营晋级率约 90%
local MASTERS_PRIZES = { qf = 100, sf = 200, final = 1000 } -- 世界赛各阶段奖金（万元）
local SPLIT_POINTS = { [1] = 10, [2] = 8, [3] = 6, [4] = 4 } -- 双赛制全年积分：常规赛排名分（春季/夏季各一次）

local function clamp(value, minimum, maximum)
    return math.max(minimum, math.min(maximum, tonumber(value) or minimum))
end

local function anyTeamName(teamId)
    return LeagueCatalog.GetTeamName(teamId, teamId)
end

local function getMyTeamId(state)
    if state.company.league == "qualifier" then return "legacy_cafe" end
    if state.company.league == "academy" then return "legacy_youth" end
    return "legacy"
end

function CompetitionSystem.EnsureStandings(state)
    state = CompanyState.Ensure(state)
    local league = state.company.league
    -- 网吧队（预选赛）与次级联赛各自管理积分榜，绝不能用 pro 24 队覆盖
    if league == "qualifier" then
        return CompetitionSystem.EnsureQualifierStandings(state)
    end
    if league == "academy" then
        -- 次级联赛积分榜由 AcademySystem 管理（state.roster.academy.standings），此处不动 state.league.standings
        return state
    end
    if #state.league.standings == #LeagueCatalog.TEAMS then return state end
    state.league.standings = {}
    for _, team in ipairs(LeagueCatalog.TEAMS) do
        table.insert(state.league.standings, {
            teamId = team.id,
            teamName = team.id == "legacy" and state.company.name or team.name,
            wins = 0,
            losses = 0,
            score = 0,
        })
    end
    return state
end

function CompetitionSystem.GetSeasonWeeks(state)
    state = CompanyState.Ensure(state)
    if state.company.league == "qualifier" then return QUALIFIER_WEEKS end
    if state.company.league == "academy" then return ACADEMY_SEASON_WEEKS end
    local weeks = tonumber(state.company.settings and state.company.settings.seasonWeeks) or REGULAR_WEEKS
    return math.max(4, math.min(12, weeks))
end

function CompetitionSystem.GetStandings(state)
    state = CompetitionSystem.EnsureStandings(state)
    local sorted = {}
    for _, entry in ipairs(state.league.standings) do table.insert(sorted, entry) end
    table.sort(sorted, function(a, b)
        if a.wins ~= b.wins then return a.wins > b.wins end
        return a.score > b.score
    end)
    return sorted
end

function CompetitionSystem.GetPlayerRank(state)
    if state.company.league == "academy" then
        local academy = AcademySystem.GetStandings(state)
        for rank, entry in ipairs(academy) do
            if entry.teamId == "legacy_youth" then return rank end
        end
        return 8
    end
    local target = state.company.league == "qualifier" and "legacy_cafe" or "legacy"
    local sorted = {}
    for _, entry in ipairs(state.league.standings or {}) do table.insert(sorted, entry) end
    table.sort(sorted, function(a, b)
        if a.wins ~= b.wins then return a.wins > b.wins end
        return (a.score or 0) > (b.score or 0)
    end)
    for rank, entry in ipairs(sorted) do
        if entry.teamId == target then return rank end
    end
    return #sorted + 1
end

function CompetitionSystem.EnsureQualifierStandings(state)
    if #state.league.standings == #LeagueCatalog.QUALIFIER_TEAMS then return state end
    state.league.standings = {}
    for _, team in ipairs(LeagueCatalog.QUALIFIER_TEAMS) do
        table.insert(state.league.standings, {
            teamId = team.id,
            teamName = team.name,
            wins = 0,
            losses = 0,
            score = 0,
        })
    end
    return state
end

function CompetitionSystem.GetQualifierStandings(state)
    state = CompetitionSystem.EnsureQualifierStandings(state)
    local sorted = {}
    for _, entry in ipairs(state.league.standings) do table.insert(sorted, entry) end
    table.sort(sorted, function(a, b)
        if a.wins ~= b.wins then return a.wins > b.wins end
        return (a.score or 0) > (b.score or 0)
    end)
    return sorted
end

function CompetitionSystem.GetQualifierTeamPower(state, teamId)
    state = CompanyState.Ensure(state)
    if teamId == "legacy_cafe" then return RosterSystem.GetTeamPower(state) end
    local team = LeagueCatalog.GetQualifierTeam(teamId)
    if not team then return 0 end
    return math.floor(team.power * QUALIFIER_SCALE * (0.95 + math.random() * 0.1) + 0.5)
end

function CompetitionSystem.GetTeamPower(state, teamId)
    state = CompanyState.Ensure(state)
    if teamId == "legacy" then return RosterSystem.GetTeamPower(state) end
    local team = LeagueCatalog.GetTeam(teamId)
    if not team then return 0 end
    local AISystem = require("AISystem")
    if AISystem.IsProAiTeam(teamId) then
        -- D4 AI 同构化：东冠 AI 队用实体 5 人阵容同一把尺子结算
        AISystem.EnsureAgents(state)
        return AISystem.GetTeamPower(state, teamId)
    end
    local difficulty = CompanyState.GetDifficulty(state)
    local seasons = tonumber(state.company and state.company.seasons) or 0
    local growth = 1 + seasons * AI_SEASON_GROWTH
    local ai = state.aiTeams and state.aiTeams[tostring(teamId)]
    local bonus = tonumber(ai and ai.bonus) or 0
    return math.floor(team.power * AI_TEAM_SCALE * growth * (0.95 + math.random() * 0.1) * difficulty.aiPower + 0.5) + bonus
end

function CompetitionSystem.GetMastersTeamPower(state, teamId)
    state = CompanyState.Ensure(state)
    if teamId == "legacy" then
        -- 教练 BP 已确认阵容时，用 BP 战力（熟练度×版本强度）结算
        local ready = state.match
            and state.match.phase == "ready"
            and tonumber(state.match.week) == tonumber(state.company.week)
        if ready then
            local HeroSystem = require("HeroSystem")
            return HeroSystem.GetMatchPower(state)
        end
        return RosterSystem.GetTeamPower(state)
    end
    local team = LeagueCatalog.GetTeam(teamId)
    if team then return CompetitionSystem.GetTeamPower(state, teamId) end
    team = LeagueCatalog.GetQualifierTeam(teamId)
    if team then return CompetitionSystem.GetQualifierTeamPower(state, teamId) end
    team = LeagueCatalog.GetRegionTeam(teamId)
    if team then
        local difficulty = CompanyState.GetDifficulty(state)
        local seasons = tonumber(state.company and state.company.seasons) or 0
        local growth = 1 + seasons * AI_SEASON_GROWTH
        local aiR = state.aiTeams and state.aiTeams[tostring(teamId)]
        local bonusR = tonumber(aiR and aiR.bonus) or 0
        return math.floor(team.power * AI_TEAM_SCALE * growth * (0.95 + math.random() * 0.1) * difficulty.aiPower + 0.5) + bonusR
    end
    return 0
end

local function simulateSeries(state, teamAId, teamBId, bestOf)
    -- 多阶段对局模拟：开局→对线→资源团→收官，带 momentum 与翻盘熵（自动模式无局内决策）
    local out = MatchSimulator.RunSeries(state, {
        teamAId = teamAId,
        teamBId = teamBId,
        bestOf = bestOf,
        myId = getMyTeamId(state),
        decisions = false,
    })
    return out.winsA, out.winsB, out.games
end

-- 若该场涉及我方，生成文字复盘、更新选手近期状态，并写入最近战报
function CompetitionSystem.HandleMyMatch(state, result, games)
    local myId = getMyTeamId(state)
    if result.teamA ~= myId and result.teamB ~= myId then return nil end
    local myWon = (result.teamA == myId and result.scoreA > result.scoreB)
        or (result.teamB == myId and result.scoreB > result.scoreA)
    local report = MatchReporter.Build(state, result, games, myId, myWon)
    result.report = report
    -- P1-⑩ 赛后数据分析台：记录结构化分析数据
    local MatchAnalytics = require("MatchAnalytics")
    MatchAnalytics.Record(state, result, games, myId, myWon)
    state.league.lastReport = {
        week = result.week or state.company.week,
        opponentId = result.teamA == myId and result.teamB or result.teamA,
        won = myWon,
        scoreA = result.scoreA,
        scoreB = result.scoreB,
        report = report,
    }
    local RivalrySystem = require("RivalrySystem")
    local opponentId = result.teamA == myId and result.teamB or result.teamA
    RivalrySystem.OnMatchEnd(state, opponentId, myWon)
    -- 选手品牌联动：胜 → 高光涨，负 → 丑闻跌；大赛（季后赛 / 杯赛 / 世界赛）加成更高
    local isBig = result.phase and (result.phase == "qf" or result.phase == "sf"
        or result.phase == "final" or result.phase == "worldfinal"
        or result.phase == "world_semifinal" or result.phase == "winners_final"
        or result.phase == "losers_final" or result.phase == "regional_final")
    PlayerEcoSystem.ApplyMatchResult(state, myWon, isBig)
    if myWon then
        local rvLevel = RivalrySystem.GetLevel(state, opponentId)
        if rvLevel >= 2 then
            local team = LeagueCatalog.GetTeam(opponentId) or LeagueCatalog.GetAcademyTeam(opponentId) or LeagueCatalog.GetRegionTeam(opponentId)
            CompanyState.SetHighlight(state, {
                kind = "rivalry_win",
                icon = "target",
                title = "宿敌战胜利",
                tagline = "恩怨局中力克 " .. (team and team.name or "对手") .. "，粉丝们沸腾了。",
                lines = {
                    "你亲手终结了这场恩怨对决，社交媒体瞬间引爆。",
                    "宿敌等级：" .. RivalrySystem.GetLevelLabel(rvLevel) .. "，战火延续。",
                },
                stats = {
                    { label = "比分", value = tostring(result.scoreA) .. ":" .. tostring(result.scoreB) },
                    { label = "粉丝", value = "+1500" },
                },
            })
        end
    end
    RosterSystem.UpdatePlayerForms(state, myWon, report.mvpId)
    -- 恩怨局奖励（机制 C）
    if state.match and state.match.grudge then
        local oppLabel = LeagueCatalog.GetTeamName(opponentId, opponentId)
        if myWon then
            state.company.fans = state.company.fans + 3000
            state.company.reputation = clamp(state.company.reputation + 4, 0, 100)
            CompanyState.RecordTimeline(state, "恩怨局告捷",
                "在恩怨局中力克宿敌 " .. oppLabel .. "，粉丝与声望大涨。")
        else
            state.company.reputation = clamp(state.company.reputation - 2, 0, 100)
        end
    end
    return myWon
end

function CompetitionSystem.SimulateMatch(state, teamAId, teamBId)
    state = CompanyState.Ensure(state)
    local winsA, winsB, games = simulateSeries(state, teamAId, teamBId, 3)
    local wonA = winsA > winsB
    CompetitionSystem.RecordStanding(state, teamAId, wonA, winsA)
    CompetitionSystem.RecordStanding(state, teamBId, not wonA, winsB)
    local result = {
        week = state.company.week,
        teamA = teamAId,
        teamB = teamBId,
        scoreA = winsA,
        scoreB = winsB,
    }
    -- P2-⑦ 主客场标记：我方在 teamA 位置 = 主场
    result.myTeamId = teamAId == "legacy" and "A" or "B"
    result.isHome = (teamAId == "legacy")
    state.match = state.match or {}
    state.match.teamA = teamAId
    state.match.teamB = teamBId
    state.match.myTeamId = result.myTeamId
    state.match.isHome = result.isHome
    table.insert(state.league.results, result)
    CompetitionSystem.HandleMyMatch(state, result, games)
    return wonA, winsA, winsB
end

function CompetitionSystem.RecordStanding(state, teamId, won, gamesWon)
    state = CompanyState.Ensure(state)
    for _, entry in ipairs(state.league.standings) do
        if entry.teamId == teamId then
            if won then entry.wins = entry.wins + 1 else entry.losses = entry.losses + 1 end
            entry.score = entry.score + gamesWon
            return
        end
    end
end

-- ============ 教练局内决策（多阶段对局） ============

--- 我方比赛的系列赛结算（遇关键决策/回合事件卡则暂停等教练选择）
function CompetitionSystem.FinishPlayerSeries(state, out, teamAId, teamBId)
    if out.status == "decision" then
        state.match.sim = out.sim
        state.match.phase = "decision"
        state.match.pendingDecision = out.decision
        return false, "decision"
    end
    if out.status == "round_decision" then
        state.match.sim = out.sim
        state.match.phase = "round"
        state.match.pendingRound = {
            round = out.round,
            options = out.options,
            gameIndex = out.gameIndex,
            phaseIndex = out.phaseIndex,
        }
        return false, "round"
    end
    local winsA, winsB, games = out.winsA, out.winsB, out.games
    local wonA = winsA > winsB
    CompetitionSystem.RecordStanding(state, teamAId, wonA, winsA)
    CompetitionSystem.RecordStanding(state, teamBId, not wonA, winsB)
    local result = {
        week = state.company.week,
        teamA = teamAId,
        teamB = teamBId,
        scoreA = winsA,
        scoreB = winsB,
    }
    table.insert(state.league.results, result)
    CompetitionSystem.HandleMyMatch(state, result, games)
    -- 存储比赛结果供「比赛结束」页展示（自动观赛闭环）：保留完整 play-by-play
    local myId = getMyTeamId(state)
    local oppId = teamAId == myId and teamBId or teamAId
    state.lastMatchResult = {
        won = wonA,
        scoreA = winsA,
        scoreB = winsB,
        teamA = teamAId,
        teamB = teamBId,
        opponentId = oppId,
        week = state.company.week,
        games = games,
    }
    return wonA
end

--- 常规赛我方比赛：开启多阶段模拟，遇关键决策暂停
function CompetitionSystem.StartPlayerMatch(state, teamAId, teamBId)
    state = CompanyState.Ensure(state)
    local myId = getMyTeamId(state)
    local opponentId = teamAId == myId and teamBId or teamAId
    -- 缺陷修复（#139 驱动暴露）：state.match 必须带上所属周次。HeroSystem.EnsureMatch
    -- 以 `m.week ~= company.week` 判定「是否本周 BP」，若 match.week 为空，则在比赛
    -- 阶段结算里被 HeroSystem.GetRecommendedTactic 调到时会把整个 state.match 换成
    -- 新的 BP 表 —— **活着的 sim / pendingRound 被清空**，该场对局被判为脏卡作废、
    -- 不记战绩，而 AdvanceWeek 又会把本周 AI 赛程重算一遍（AI 每周多打一场）。
    -- 结果我方战绩结构性偏低：7 战全胜也只能排第 6，董事会「前四」目标永远不可达。
    state.match = state.match or {}
    state.match.week = tonumber(state.company.week) or 1
    state.match.opponentId = opponentId
    -- 默认主打明星（机制 A）：未指定则取评分最高者
    local SignatureSystem = require("SignatureSystem")
    if not state.match.featuredStar or state.match.featuredStar == "" then
        local opts = SignatureSystem.GetFeaturedOptions(state)
        if #opts > 0 then state.match.featuredStar = opts[1].playerId end
    end
    -- 恩怨局（机制 C）：对手为 2 级以上宿敌时标记，胜利有额外奖励
    local RivalrySystem = require("RivalrySystem")
    state.match.grudge = RivalrySystem.GetLevel(state, opponentId) >= 2
    local out = MatchSimulator.RunSeries(state, {
        teamAId = teamAId,
        teamBId = teamBId,
        bestOf = 3,
        myId = myId,
        decisions = true,
    })
    return CompetitionSystem.FinishPlayerSeries(state, out, teamAId, teamBId)
end

--- 玩家提交局内决策，继续模拟；系列赛打完则结算本周
function CompetitionSystem.SubmitMatchDecision(state, choiceId)
    state = CompanyState.Ensure(state)
    local sim = state.match and state.match.sim
    if not sim then
        -- SOFTLOCK GUARD: a pending decision card with no live sim means the
        -- match table was replaced (e.g. by the next week's BP draft) and this
        -- card is stale. Clear it instead of silently doing nothing, otherwise
        -- the player taps the card forever with no feedback.
        if state.match and (state.match.pendingDecision or state.match.pendingRound) then
            CompanyState.RecordTimeline(state, " 提交决策失败·清理脏卡", "match 无 sim，清除残留 pendingDecision/pendingRound")
            state.match.pendingDecision = nil
            state.match.pendingRound = nil
            state.match.phase = state.match.bpStep and "bp" or "ready"
            return false, "对局已结束，请进入下一场"
        end
        return false, "当前没有待处理的对局决策"
    end
    local teamAId, teamBId = sim.teamAId, sim.teamBId
    local out = MatchSimulator.Continue(state, sim, choiceId)
    if out.status == "decision" then
        state.match.pendingDecision = out.decision
        state.match.phase = "decision"
        return false, "decision"
    end
    if out.status == "round_decision" then
        state.match.pendingDecision = nil
        state.match.phase = "round"
        state.match.pendingRound = {
            round = out.round,
            options = out.options,
            gameIndex = out.gameIndex,
            phaseIndex = out.phaseIndex,
        }
        return false, "round"
    end
    state.match.sim = nil
    state.match.pendingDecision = nil
    state.match.pendingRound = nil
    state.match.phase = "ready"
    local legacyWon = CompetitionSystem.FinishPlayerSeries(state, out, teamAId, teamBId)
    CompetitionSystem.FinishRegularWeek(state, legacyWon)
    return true
end

--- 玩家提交回合事件卡选择，继续模拟
function CompetitionSystem.SubmitRoundChoice(state, choiceId)
    state = CompanyState.Ensure(state)
    local sim = state.match and state.match.sim
    if not sim then
        -- Same softlock guard as SubmitMatchDecision: state.match doubles as the
        -- BP-draft table (no `.sim`). A leftover pendingRound there used to make
        -- SubmitRoundChoice a silent no-op, permanently freezing the match
        -- screen. Clear the stale card so the player can move on.
        if state.match and (state.match.pendingRound or state.match.pendingDecision) then
            CompanyState.RecordTimeline(state, " 提交回合失败·清理脏卡", "match 无 sim，清除残留 pendingRound/pendingDecision")
            state.match.pendingRound = nil
            state.match.pendingDecision = nil
            state.match.phase = state.match.bpStep and "bp" or "ready"
            return false, "对局已结束，请进入下一场"
        end
        return false, "当前没有待处理的回合决策"
    end
    local teamAId, teamBId = sim.teamAId, sim.teamBId
    local out = MatchSimulator.Continue(state, sim, choiceId)
    if out.status == "decision" then
        state.match.pendingDecision = out.decision
        state.match.pendingRound = nil
        state.match.phase = "decision"
        return false, "decision"
    end
    if out.status == "round_decision" then
        state.match.pendingDecision = nil
        state.match.phase = "round"
        state.match.pendingRound = {
            round = out.round,
            options = out.options,
            gameIndex = out.gameIndex,
            phaseIndex = out.phaseIndex,
        }
        return false, "round"
    end
    state.match.sim = nil
    state.match.pendingDecision = nil
    state.match.pendingRound = nil
    state.match.phase = "ready"
    local legacyWon = CompetitionSystem.FinishPlayerSeries(state, out, teamAId, teamBId)
    CompetitionSystem.FinishRegularWeek(state, legacyWon)
    return true
end

--- 常规赛周结算尾部：财务/粉丝/赛程推进/季末判定，并清空本周 BP
function CompetitionSystem.FinishRegularWeek(state, legacyWon, hadMatch)
    state = CompanyState.Ensure(state)
    CompetitionSystem.SettleWeek(state, legacyWon, hadMatch)
    state.company.week = state.company.week + 1
    if state.company.week > CompetitionSystem.GetSeasonWeeks(state) then
        state.company.seasonState = "playoff"
        state.league.playoff.enabled = true
        local split = state.company.split or "spring"
        local splitLabel = split == "summer" and "夏季赛" or "春季赛"
        -- 双赛制：常规赛收官发放全年积分（前四名得分），春季排名留档用于夏季末的世界赛资格判定
        if state.company.league == "pro" then
            local rank = CompetitionSystem.GetPlayerRank(state)
            local pts = SPLIT_POINTS[rank] or 0
            if pts > 0 then
                state.company.points = tonumber(state.company.points or 0) + pts
                CompanyState.RecordTimeline(state, splitLabel .. "常规赛收官",
                    splitLabel .. "常规赛排名第 " .. tostring(rank) .. "，获得全年积分 +" .. tostring(pts) .. "。")
            end
            if split == "spring" then
                state.league.history = state.league.history or {}
                state.league.history.springRank = rank
            end
        end
        local MultiRegionSystem = require("MultiRegionSystem")
        if split ~= "spring" then
            MultiRegionSystem.FinishSeason(state)
        end
        local spots = tonumber(state.company.settings and state.company.settings.playoffSpots) or 4
        local spotText = "前 4 名争夺" .. splitLabel .. "冠军。"
        CompanyState.RecordTimeline(state, splitLabel .. "常规赛结束", splitLabel .. "季后赛即将开始，" .. spotText)
    end
    if state.company.cash < BANKRUPT_LIMIT then
        state.company.seasonState = "bankrupt"
        CompanyState.RecordTimeline(state, "公司破产", "现金流断裂，公司无力继续运营。")
        ProfileSystem.MarkBankrupt(state)
    end
    state.match = {} -- 本周 BP 已结算，下周重新做 BP
    return state
end

function CompetitionSystem.AdvanceWeek(state)
    -- 调试：记录入口
    CompanyState.RecordTimeline(state, " AdvanceWeek 入口", "week=" .. tostring(state.company.week) .. " match.phase=" .. tostring(state.match and state.match.phase or "nil"))
    -- pcall 保护：防止内部报错导致按钮无反应
    -- 注意：pcall 会完整保留多返回值，用 unpack 转发
    local function advanceWeekInner()
        state = CompanyState.Ensure(state)
        -- ---- 赛季终局 / 转场状态机（#137 破产结局闭环）------------------------
        -- 旧实现只认 "regular"：任何别的 seasonState 都会掉进最下面的守卫里
        -- 永远 return false，存档静默冻结（破产 / 下课 / 赛季打完 / 夺冠都算）。
        -- 更糟的是联赛分派（qualifier / academy）排在守卫之前，所以次级联赛和
        -- 预选赛的赛季结束后连 StartNewSeason 都走不到。
        -- 现在在分派之前给每个状态一条明确出路：
        --  终局结局  bankrupt / fired / eliminated → 必须展示结局屏（GAME OVER）
        --  赛季转场  finished / world_champion → 新赛季
        --            champion(春冠) → 夏季赛；champion(夏冠/世界赛资格) → 世界赛
        --            masters → 推进世界赛赛程
        local function startNewSeason()
            CompanyState.RecordTimeline(state, " AdvanceWeek 开启新赛季",
                "seasonState=" .. tostring(state.company.seasonState) .. "，调用 StartNewSeason")
            local okS = pcall(function() return CompanyState.StartNewSeason(state) end)
            if not okS then
                CompanyState.RecordTimeline(state, " 新赛季异常", "StartNewSeason 抛错")
                return false, "新赛季推进失败"
            end
            return true, "new_season"
        end

        local ss = state.company.seasonState
        local GAME_OVER = { bankrupt = "bankrupt", fired = "fired", eliminated = "qualifier_failed" }
        if GAME_OVER[ss] then
            -- 破产 / 被解雇 / 预选赛出局是**定死的终局**，绝不能被 StartNewSeason
            -- 悄悄抹掉（那等于把结局吞掉，玩家什么也看不到）。这里只补图鉴记录，
            -- 并返回一条指向结局屏的提示；真正的重开入口是 `ending` 屏的「重新开始」。
            local ProfileSystem = require("ProfileSystem")
            local endingId = GAME_OVER[ss]
            local title = endingId
            pcall(function() title = ProfileSystem.GetEndingTitle(endingId) end)
            pcall(function() ProfileSystem.RecordEnding(state, endingId) end)
            CompanyState.RecordTimeline(state, "赛季终结",
                tostring(ss) .. "，达成结局「" .. tostring(title) .. "」，请前往结局屏查看并重新开始。")
            return false, "结局【" .. tostring(title) .. "】已达成，请前往结局屏重新开始"
        end
        if ss == "finished" or ss == "world_champion" then
            return startNewSeason()
        end
        if ss == "champion" then
            -- 夺冠并不代表赛季结束：春冠要打夏季赛，夏冠/世界赛资格要打世界赛。
            -- StartSummerSplit / StartGlobalMasters 都是「实现完整但零调用点」，
            -- 不接上等于冠军队同样卡死。
            local isPro = state.company.league == "pro"
            local split = state.company.split or "spring"
            if isPro and split == "spring" then
                CompanyState.RecordTimeline(state, " AdvanceWeek 开启夏季赛",
                    "seasonState=champion（春冠），调用 StartSummerSplit")
                local okC, rC = pcall(function() return CompetitionSystem.StartSummerSplit(state) end)
                if okC and rC then return true, "summer_split" end
            elseif isPro and CompanyState.IsMastersEnabled(state) then
                CompanyState.RecordTimeline(state, " AdvanceWeek 开启世界赛",
                    "seasonState=champion，调用 StartGlobalMasters")
                local okM, rM = pcall(function() return CompetitionSystem.StartGlobalMasters(state) end)
                if okM and rM then return true, "masters" end
            end
            -- 非东冠联赛冠军，或夏季赛 / 世界赛开不起来 → 直接开启新赛季（兜底）
            return startNewSeason()
        end
        if ss == "masters" then
            -- 世界赛赛程（qf / sf / final）只能由这里推进；AdvanceGlobalMasters
            -- 此前同样是零调用点。
            CompanyState.RecordTimeline(state, " AdvanceWeek 推进世界赛", "seasonState=masters")
            local okW, rW = pcall(function() return CompetitionSystem.AdvanceGlobalMasters(state) end)
            if okW and rW then return true, "masters" end
            -- 世界赛已走完 / 未开启 → 兜底开启新赛季，绝不卡死
            return startNewSeason()
        end
        if state.company.league == "qualifier" then
            return CompetitionSystem.AdvanceQualifierWeek(state)
        end
        if state.company.league == "academy" then
            return CompetitionSystem.AdvanceAcademyWeek(state)
        end
        -- 局内决策恢复：本周已推进到决策点，等教练选择后由 SubmitMatchDecision 继续
        if state.match and state.match.sim then
            if state.match.pendingDecision then
                CompanyState.RecordTimeline(state, " AdvanceWeek 恢复决策", "pendingDecision 存在，返回 decision")
                return false, "decision"
            elseif state.match.pendingRound then
                CompanyState.RecordTimeline(state, " AdvanceWeek 恢复回合", "pendingRound 存在，返回 round")
                return false, "round"
            else
                -- 异常保护：sim 存在但无 pending 状态，清除 match 重新开始
                state.match = nil
            end
        elseif state.match and (state.match.pendingDecision or state.match.pendingRound) then
            -- SOFTLOCK GUARD: state.match is reused for two different things —
            -- the BP draft (bpStep/myPicks/..., no `.sim`) and the live match
            -- (`.sim` + pending cards). When a match finishes, the next week's
            -- BP table replaces state.match, but a stale pendingRound could
            -- survive on it. With no `.sim`, SubmitRoundChoice bails out with
            -- "当前没有待处理的回合决策" and the player is stuck on the match
            -- screen forever. A pending card without a sim is invalid -> clear.
            CompanyState.RecordTimeline(state, " AdvanceWeek 清理脏待处理卡",
                "match 无 sim 但存在 pendingDecision/pendingRound（BP 阶段残留），已清除")
            state.match.pendingDecision = nil
            state.match.pendingRound = nil
            state.match.phase = state.match.bpStep and "bp" or "ready"
        end
        state = CompetitionSystem.EnsureStandings(state)
        if state.company.seasonState == "playoff" then
            -- SEASON-LEVEL SOFTLOCK FIX: when the regular season ends the state
            -- flips to "playoff", but nothing ever advanced it. AdvanceWeek
            -- bailed out below (it only handles "regular"), the home page has
            -- no playoff entry, and CompetitionSystem.PlayPlayoff had ZERO call
            -- sites — so the season could never finish and no new season ever
            -- started. MatchScreen even told the player "季后赛由首页推进".
            -- Drive the playoff here so 下一天 keeps working end to end.
            CompanyState.RecordTimeline(state, " AdvanceWeek 进入季后赛", "seasonState=playoff，调用 PlayPlayoff")
            local pcallOK, pok = pcall(function() return CompetitionSystem.PlayPlayoff(state) end)
            if not pcallOK then
                CompanyState.RecordTimeline(state, " 季后赛异常", tostring(pok))
                return false, "季后赛推进失败"
            end
            return pok == true, "playoff"
        end
        if state.company.seasonState ~= "regular" then
            CompanyState.RecordTimeline(state, " AdvanceWeek 退出", "seasonState=" .. tostring(state.company.seasonState))
            -- 不认识的赛季状态也不能静默冻结：给出唯一的出路（结局屏有「重新开始」）
            return false, "当前赛季状态（" .. tostring(state.company.seasonState) .. "）无法继续推进，请到结局屏重新开始"
        end
        local week = state.company.week
        local seasonWeeks = CompetitionSystem.GetSeasonWeeks(state)
        if week > seasonWeeks then
            CompanyState.RecordTimeline(state, " AdvanceWeek 退出", "week=" .. tostring(week) .. " > seasonWeeks=" .. tostring(seasonWeeks))
            return false, "常规赛已结束"
        end
        MetaSystem.RollNext(state)
        local HeroSystem = require("HeroSystem")
        HeroSystem.RollMeta(state)
        -- 每周单循环赛程（圆桌法 / circle method）：每队每周恰好 1 场。
        -- 缺陷修复（#139 驱动暴露）：旧实现 `for index=0,teamCount-1 with
        -- opponentIndex=(index+week)%teamCount` 会把 8 队连成一个环 —— 每队
        -- 每周排 2 场；而我方第 2 场被 `myPair` 覆盖丢弃，于是 **AI 每周 2 场、
        -- 我方每周只有 1 场**。结果我方哪怕 7 战全胜也只能排到第 6（AI 领先者
        -- 20+ 胜），董事会主目标「常规赛前四」在数学上永远无法达成 ——
        -- #138 观察到的「解雇不可移动」根因即在此，而非董事会宽容度。
        -- 改为圆桌法后每队每周 1 场，排名才真实反映战绩。
        local teamCount = #LeagueCatalog.TEAMS
        local myPair = nil
        if teamCount >= 2 then
            local fixed = teamCount - 1               -- 固定最后一队
            local rot = (week - 1) % (teamCount - 1)   -- 其余 n-1 队轮转
            local a = {}
            for i = 1, teamCount - 1 do a[i] = (i - 1 + rot) % (teamCount - 1) end
            local matches = { { a[1], fixed } }
            for k = 2, math.floor(teamCount / 2) do
                matches[#matches + 1] = { a[k], a[teamCount - k + 1] }
            end
            for _, mt in ipairs(matches) do
                local teamA = LeagueCatalog.TEAMS[mt[1] + 1].id
                local teamB = LeagueCatalog.TEAMS[mt[2] + 1].id
                if teamA == "legacy" or teamB == "legacy" then
                    -- 确保我方在 teamA 位置 = 主场（P2-⑦ 主客场优势）
                    myPair = teamA == "legacy" and { teamA, teamB } or { "legacy", teamA }
                else
                    CompetitionSystem.SimulateMatch(state, teamA, teamB)
                end
            end
        end
        CompanyState.RecordTimeline(state, " AdvanceWeek 对局前", "myPair=" .. tostring(myPair and (myPair[1].." vs "..myPair[2]) or "nil"))
        local legacyWon = false
        local hadMatch = myPair ~= nil
        if myPair then
            local ok, msg = CompetitionSystem.StartPlayerMatch(state, myPair[1], myPair[2])
            CompanyState.RecordTimeline(state, " StartPlayerMatch 返回", "ok=" .. tostring(ok) .. " msg=" .. tostring(msg) .. " match.phase=" .. tostring(state.match and state.match.phase or "nil"))
            if not ok then
                return false, msg -- "decision"：对局暂停，等教练关键决策
            end
            legacyWon = ok
        end
        CompetitionSystem.FinishRegularWeek(state, legacyWon, hadMatch)
        -- 选手生涯剧情滚动（机制 D）
        local CareerArcSystem = require("CareerArcSystem")
        CareerArcSystem.RollWeekly(state)
        CompanyState.RecordTimeline(state, " AdvanceWeek 完成", "week 推进到 " .. tostring(state.company.week))
        return true
    end
    local ok, r1, r2 = pcall(advanceWeekInner)
    if not ok then
        -- 记录错误到时间线，让玩家能看到而不是按钮无反应
        CompanyState.RecordTimeline(state, " 比赛结算异常",
            "本周比赛结算遇到问题：" .. tostring(r1) .. "（已尝试跳过本周）")
        state.company.week = state.company.week + 1
        return true, "recovered"
    end
    -- 转发多返回值（r1=第一返回值, r2=第二返回值）
    return r1, r2
end

function CompetitionSystem.SettleWeek(state, legacyWon, hadMatch)
    state = CompanyState.Ensure(state)
    if legacyWon then
        state.company.fans = state.company.fans + 1500
        state.company.reputation = clamp(state.company.reputation + 3, 0, 100)
    else
        state.company.fans = state.company.fans + 400
        state.company.reputation = clamp(state.company.reputation - 1, 0, 100)
    end
    state.company.fans = state.company.fans + StaffSystem.GetWeeklyFanBonus(state)
    for _, entry in ipairs(RosterSystem.GetRosterPlayers(state)) do
        entry.player.form = clamp(entry.player.form + math.random(-2, 2), 0, 100)
    end
    local summary = FinanceSystem.ApplyWeek(state)
    -- M3.3 教练周薪 + 胜场奖金（重置买股额度）
    local CoachSystem = require("CoachSystem")
    CoachSystem.ApplySalary(state, legacyWon)
    CompanyState.RecordTimeline(state, "第 " .. tostring(state.company.week) .. " 周结算",
        "排名第 " .. tostring(summary.rank) .. "，本周净收入 ¥" .. tostring(summary.net) .. "万。")
    local GoalSystem = require("GoalSystem")
    GoalSystem.UpdateProgress(state, summary.net)
    state.roster.trainedThisWeek = false
    SponsorSystem.TickSponsors(state)
    MarketSystem.ProcessWeek(state)
    local SocialSystem = require("SocialSystem")
    SocialSystem.ProcessWeek(state, legacyWon)
    local LeaderboardSystem = require("LeaderboardSystem")
    LeaderboardSystem.Update(state)
    local RivalrySystem = require("RivalrySystem")
    RivalrySystem.ProcessWeek(state)
    local PlayerEcoSystem = require("PlayerEcoSystem")
    PlayerEcoSystem.ProcessWeek(state)
    local StockSystem = require("StockSystem")
    StockSystem.ProcessWeek(state, legacyWon)
    local MultiRegionSystem = require("MultiRegionSystem")
    MultiRegionSystem.ProcessWeek(state)
    local MoraleSystem = require("MoraleSystem")
    MoraleSystem.UpdateAll(state, legacyWon)
    MoraleSystem.ResetWeekly(state)
    local ScoutSystem = require("ScoutSystem")
    ScoutSystem.ProcessWeek(state)
    local NegotiationSystem = require("NegotiationSystem")
    NegotiationSystem.ProcessWeek(state)
    -- #48B 明星多步招募：周结算推进「击败宿敌」判定与完成同步
    local StarRecruitSystem = require("StarRecruitSystem")
    StarRecruitSystem.ProcessWeek(state)
    if state.company.league ~= "academy" then
        AcademySystem.SimulateWeek(state)
    end
    local TierSystem = require("TierSystem")
    TierSystem.CheckCup(state)
    TierSystem.UpdateTier(state)
    -- P1-③ 伤病/疲劳/医疗：周结算推进疲劳、伤病判定与康复（先于自动轮换，伤停首发当周即被替补顶替）
    local MedicalSystem = require("MedicalSystem")
    MedicalSystem.ProcessWeek(state, legacyWon, hadMatch)
    -- P2-⑨ 周边商城周结算
    local MerchSystem = require("MerchSystem")
    MerchSystem.ProcessWeek(state)
    RosterSystem.AutoRotate(state)
    -- 月度大型经营事件优先于每周小事件：每 4 周触发一次
    local monthlyEvent = EventSystem.RollMonthlyEvent(state)
    if not monthlyEvent then
        EventSystem.RollEvent(state)
    end
    -- P2-⑤ 媒体发布会：连胜/连败触发
    local PressSystem = require("PressSystem")
    PressSystem.CheckTrigger(state)
    local AISystem = require("AISystem")
    AISystem.WeeklyTick(state)
    -- 经济平衡 §2.7：破产预警带（阈值不变，仍为 -50）。用既有 RecordTimeline 写一条，
    -- 只在跨越预警档时记录，避免每周刷屏冲掉其它时间线。现金 < 100 偏低 / 现金 < 0 告急。
    local cashNow = tonumber(state.company.cash) or 0
    local warnBand = cashNow < 0 and "critical" or (cashNow < 100 and "low" or "ok")
    if state.finance.cashWarnBand == nil then state.finance.cashWarnBand = "ok" end
    if warnBand ~= state.finance.cashWarnBand then
        if warnBand == "critical" then
            CompanyState.RecordTimeline(state, "现金流告急", "现金流告急，尽快融资或套现。")
        elseif warnBand == "low" then
            CompanyState.RecordTimeline(state, "现金流偏低", "现金流偏低，请注意控制开支。")
        end
        state.finance.cashWarnBand = warnBand
    end
    return state
end

function CompetitionSystem.AdvanceQualifierWeek(state)
    state = CompanyState.Ensure(state)
    if state.company.league ~= "qualifier" or state.company.seasonState ~= "qualifier" then
        return false, "当前不在城市赛预选赛阶段"
    end
    local week = state.company.week
    if week > QUALIFIER_WEEKS then return false, "预选赛已结束" end
    state = CompetitionSystem.EnsureQualifierStandings(state)
    local teams = LeagueCatalog.QUALIFIER_TEAMS
    local legacyWon = false
    for index = 0, #teams - 1 do
        local opponentIndex = (index + week) % #teams
        if opponentIndex ~= index then
            local teamA = teams[index + 1].id
            local teamB = teams[opponentIndex + 1].id
            local winsA, winsB, games = simulateSeries(state, teamA, teamB, 3)
            local wonA = winsA > winsB
            CompetitionSystem.RecordStanding(state, teamA, wonA, winsA)
            CompetitionSystem.RecordStanding(state, teamB, not wonA, winsB)
            local result = {
                week = week,
                teamA = teamA,
                teamB = teamB,
                scoreA = winsA,
                scoreB = winsB,
            }
            table.insert(state.league.results, result)
            CompetitionSystem.HandleMyMatch(state, result, games)
            if teamA == "legacy_cafe" then legacyWon = wonA
            elseif teamB == "legacy_cafe" then legacyWon = not wonA end
        end
    end
    CompetitionSystem.SettleWeek(state, legacyWon)
    state.company.week = week + 1
    if state.company.week > QUALIFIER_WEEKS then
        local rank = CompetitionSystem.GetPlayerRank(state)
        if rank <= 2 then
            state.company.league = "academy"
            state.company.seasonState = "finished"
            CompanyState.RecordTimeline(state, "晋级次级联赛",
                "城市赛预选赛排名第 " .. tostring(rank) .. "，成功出线，拿到次级联赛席位！")
        else
            state.company.seasonState = "eliminated"
            ProfileSystem.MarkEliminated(state)
        end
    end
    if state.company.cash < BANKRUPT_LIMIT then
        state.company.seasonState = "bankrupt"
        CompanyState.RecordTimeline(state, "公司破产", "现金流断裂，公司无力继续运营。")
        ProfileSystem.MarkBankrupt(state)
    end
    return true
end

function CompetitionSystem.AdvanceAcademyWeek(state)
    state = CompanyState.Ensure(state)
    if state.company.league ~= "academy" then return false, "当前不在次级联赛" end
    local week = state.company.week
    if week > ACADEMY_SEASON_WEEKS then return false, "赛季已结束" end
    local legacyWon = AcademySystem.SimulateWeek(state)
    CompetitionSystem.SettleWeek(state, legacyWon)
    state.company.week = week + 1
    if state.company.week > ACADEMY_SEASON_WEEKS then
        state.company.seasonState = "finished"
        local rank = CompetitionSystem.GetPlayerRank(state)
        if rank <= 2 then
            CompanyState.RecordTimeline(state, "赛季收官",
                "次级联赛排名第 " .. tostring(rank) .. "，新赛季将升入东冠联赛。")
        elseif rank >= 7 then
            CompanyState.RecordTimeline(state, "赛季收官",
                "次级联赛排名第 " .. tostring(rank) .. "，新赛季继续留在次级联赛打磨。")
        end
    end
    if state.company.cash < BANKRUPT_LIMIT then
        state.company.seasonState = "bankrupt"
        CompanyState.RecordTimeline(state, "公司破产", "现金流断裂，公司无力继续运营。")
        ProfileSystem.MarkBankrupt(state)
    end
    return true
end

-- ============ Global Masters（世界赛） ============

function CompetitionSystem.SimulateRegionSeason(state, regionId)
    state = CompanyState.Ensure(state)
    local region = LeagueCatalog.REGIONS[regionId]
    if not region then return nil end
    state.league.masters = state.league.masters or {}
    state.league.masters.regionResults = state.league.masters.regionResults or {}
    local entries = {}
    local byId = {}
    for _, team in ipairs(region.teams) do
        local entry = { teamId = team.id, teamName = team.name, wins = 0, losses = 0, score = 0 }
        table.insert(entries, entry)
        byId[team.id] = entry
    end
    for i = 1, #entries do
        for j = i + 1, #entries do
            local winsA, winsB = simulateSeries(state, entries[i].teamId, entries[j].teamId, 3)
            local entryA, entryB = byId[entries[i].teamId], byId[entries[j].teamId]
            if winsA > winsB then
                entryA.wins = entryA.wins + 1
                entryB.losses = entryB.losses + 1
            else
                entryB.wins = entryB.wins + 1
                entryA.losses = entryA.losses + 1
            end
            entryA.score = entryA.score + winsA
            entryB.score = entryB.score + winsB
        end
    end
    local sorted = {}
    for _, entry in ipairs(entries) do table.insert(sorted, entry) end
    table.sort(sorted, function(a, b)
        if a.wins ~= b.wins then return a.wins > b.wins end
        if a.score ~= b.score then return a.score > b.score end
        return a.teamName < b.teamName
    end)
    local semi1A, semi1B = simulateSeries(state, sorted[1].teamId, sorted[4].teamId, 5)
    local semi1Winner = semi1A > semi1B and sorted[1].teamId or sorted[4].teamId
    local semi2A, semi2B = simulateSeries(state, sorted[2].teamId, sorted[3].teamId, 5)
    local semi2Winner = semi2A > semi2B and sorted[2].teamId or sorted[3].teamId
    local finalA, finalB = simulateSeries(state, semi1Winner, semi2Winner, 5)
    local championId = finalA > finalB and semi1Winner or semi2Winner
    local result = {
        regionId = region.id,
        regionName = region.name,
        standings = sorted,
        championId = championId,
        runnerUpId = finalA > finalB and semi2Winner or semi1Winner,
        thirdId = sorted[3] and sorted[3].teamId or nil,
    }
    state.league.masters.regionResults[regionId] = result
    return result
end

function CompetitionSystem.StartGlobalMasters(state)
    state = CompanyState.Ensure(state)
    if not CompanyState.IsMastersEnabled(state) then return false, "本局未开放世界赛" end
    if state.company.league ~= "pro" then return false, "只有东冠联赛球队可参加世界赛" end
    if state.company.seasonState ~= "champion" then return false, "需要先夺得联赛冠军" end
    if state.league.masters.enabled then return false, "世界赛已在进行" end
    -- 固定种子保证世界赛对阵可复现（按赛季数派生）
    math.randomseed(tonumber(state.company.seasons or 0) * 1000 + 7)
    local west = CompetitionSystem.SimulateRegionSeason(state, "west")
    local south = CompetitionSystem.SimulateRegionSeason(state, "south")
    local standings = CompetitionSystem.GetStandings(state)
    local eastSecond, eastThird = nil, nil
    for _, entry in ipairs(standings) do
        if entry.teamId ~= "legacy" then
            if not eastSecond then
                eastSecond = entry.teamId
            elseif not eastThird then
                eastThird = entry.teamId
            end
        end
    end
    eastSecond = eastSecond or "nova"
    eastThird = eastThird or "phoenix"
    local wildcard = west and west.thirdId or "w_tiger"
    if south and south.thirdId then
        local westPower = CompetitionSystem.GetMastersTeamPower(state, wildcard)
        local southPower = CompetitionSystem.GetMastersTeamPower(state, south.thirdId)
        if southPower > westPower then wildcard = south.thirdId end
    end
    local bracket = {
        { { "legacy", 1 }, { wildcard, 8 } },
        { { eastSecond, 4 }, { west and west.runnerUpId or "w_dragon", 5 } },
        { { west and west.championId or "w_star", 2 }, { eastThird, 7 } },
        { { south and south.championId or "s_phoenix", 3 }, { south and south.runnerUpId or "s_blue", 6 } },
    }
    state.league.masters.enabled = true
    state.league.masters.phase = "qf"
    state.league.masters.bracket = bracket
    state.league.masters.results = {}
    state.league.masters.qualifyNote = state.league.masters.qualifyNote
        or (state.company.worldsEntry == "summer_champion" and "夏季赛冠军")
        or (state.company.worldsEntry == "spring_champion" and "春季赛冠军保送")
        or (state.company.worldsEntry == "points_wildcard" and "全年积分外卡")
        or "东冠联赛冠军"
    state.company.seasonState = "masters"
    CompanyState.RecordTimeline(state, "世界赛开赛",
        state.company.name .. " 以" .. state.league.masters.qualifyNote .. "身份出战世界赛，8 强对阵揭晓！")
    return true
end

function CompetitionSystem.AdvanceGlobalMasters(state)
    state = CompanyState.Ensure(state)
    if state.company.seasonState ~= "masters" then return false, "当前不在世界赛" end
    local masters = state.league.masters
    if not masters.enabled then return false, "世界赛尚未开启" end
    local phase = masters.phase
    if phase == "qf" or phase == "sf" then
        local winners = {}
        local legacyIn = false
        for _, pair in ipairs(masters.bracket) do
            local winsA, winsB, games = simulateSeries(state, pair[1][1], pair[2][1], 5)
            local result = {
                phase = phase, teamA = pair[1][1], teamB = pair[2][1], scoreA = winsA, scoreB = winsB,
            }
            table.insert(masters.results, result)
            CompetitionSystem.HandleMyMatch(state, result, games)
            local winner = winsA > winsB and pair[1] or pair[2]
            table.insert(winners, winner)
            if winner[1] == "legacy" then legacyIn = true end
        end
        if not legacyIn then
            masters.phase = "done"
            masters.eliminatedPhase = phase
            state.company.seasonState = "champion"
            state.finance.valuation = FinanceSystem.GetValuation(state)
            CompanyState.RecordTimeline(state, phase == "qf" and "世界赛八强出局" or "世界赛半决赛出局",
                state.company.name .. " 未能晋级下一轮，世界赛征程结束。")
            return true, "eliminated"
        end
        if phase == "qf" then
            masters.bracket = {
                { winners[1], winners[2] },
                { winners[3], winners[4] },
            }
        else
            masters.bracket = { { winners[1], winners[2] } }
        end
        masters.phase = phase == "qf" and "sf" or "final"
        local prize = phase == "qf" and MASTERS_PRIZES.qf or MASTERS_PRIZES.sf
        local fansGain = phase == "qf" and 6000 or 12000
        local repGain = phase == "qf" and 6 or 10
        FinanceSystem.AddPrize(state, prize, phase == "qf" and "世界赛八强奖金" or "世界赛四强奖金")
        state.company.fans = state.company.fans + fansGain
        state.company.reputation = clamp(state.company.reputation + repGain, 0, 100)
        state.finance.valuation = FinanceSystem.GetValuation(state)
        CompanyState.RecordTimeline(state, phase == "qf" and "世界赛八强战结束" or "世界赛半决赛结束",
            state.company.name .. " 晋级" .. (phase == "qf" and "半决赛" or "总决赛") .. "！")
        return true, masters.phase
    elseif phase == "final" then
        local pair = masters.bracket[1]
        if not pair then return false, "决赛对阵缺失" end
        local winsA, winsB, games = simulateSeries(state, pair[1][1], pair[2][1], 5)
        local result = {
            phase = "worldfinal", teamA = pair[1][1], teamB = pair[2][1], scoreA = winsA, scoreB = winsB,
        }
        table.insert(masters.results, result)
        CompetitionSystem.HandleMyMatch(state, result, games)
        local championId = winsA > winsB and pair[1][1] or pair[2][1]
        masters.phase = "done"
        masters.championId = championId
        FinanceSystem.AddPrize(state, MASTERS_PRIZES.final, "世界总决赛奖金")
        state.company.fans = state.company.fans + 30000
        state.company.reputation = clamp(state.company.reputation + 20, 0, 100)
        state.finance.valuation = FinanceSystem.GetValuation(state)
        if championId == "legacy" then
            state.company.seasonState = "world_champion"
            ProfileSystem.MarkGlobalChampion(state)
            CompanyState.RecordTimeline(state, "世界之巅",
                state.company.name .. " 夺得世界赛冠军，登顶全球赛场！")
            local MoraleSystem = require("MoraleSystem")
            MoraleSystem.Celebrate(state)
            CompanyState.SetHighlight(state, {
                kind = "world_champion",
                icon = "leaderboard",
                title = "世界冠军",
                tagline = state.company.name .. " 捧起世界冠军奖杯，登顶全球之巅！",
                lines = {
                    "从常规赛到世界之巅，你在每一个赛段都留下了自己的名字。",
                    "图鉴已记录「世界之巅」，名人堂等待你的加冕。",
                },
                stats = {
                    { label = "奖金", value = "¥1000万" },
                    { label = "粉丝", value = "+30000" },
                    { label = "荣誉", value = "世界冠军" },
                },
            })
        else
            state.company.seasonState = "finished"
            CompanyState.RecordTimeline(state, "世界赛落幕",
                state.company.name .. " 止步决赛，" .. anyTeamName(championId) .. " 捧起世界冠军奖杯。")
        end
        return true, "done"
    end
    return false, "世界赛已结束"
end


--- 双赛制：春季赛落幕/夺冠后开启夏季赛（仅东冠联赛）
function CompetitionSystem.StartSummerSplit(state)
    state = CompanyState.Ensure(state)
    if state.company.league ~= "pro" then return false, "只有东冠联赛球队有夏季赛" end
    if state.company.seasonState ~= "champion" and state.company.seasonState ~= "finished" then
        return false, "春季赛尚未结束"
    end
    state.company.split = "summer"
    state.company.week = 1
    state.company.seasonState = "regular"
    state.league.standings = {}
    state.league.results = {}
    state.league.playoff = { enabled = false }
    state.match = {}
    state.roster.trainedThisWeek = false
    state.roster.talkedPlayer = nil
    state.events.pending = nil
    local HeroSystem = require("HeroSystem")
    HeroSystem.RollSeasonMeta(state)
    local MultiRegionSystem = require("MultiRegionSystem")
    MultiRegionSystem.ResetSeason(state)
    -- D4：夏季赛 AI 重定目标/预算（不加成长）
    local AISystem = require("AISystem")
    AISystem.EnsureAgents(state)
    AISystem.CalibrateAll(state)
    CompanyState.RecordTimeline(state, "夏季赛开幕",
        state.company.name .. " 开启夏季赛征程，向世界赛资格发起冲击。")
    return true
end
-- 双败淘汰制辅助：打一场系列赛并记录结果
-- 返回 winnerId；涉及我方的场次会生成战报
local function playSeries(state, phase, teamAId, teamBId, bestOf)
    local winsA, winsB, games = simulateSeries(state, teamAId, teamBId, bestOf)
    local winnerId = winsA > winsB and teamAId or teamBId
    local result = { phase = phase, teamA = teamAId, teamB = teamBId, scoreA = winsA, scoreB = winsB }
    table.insert(state.league.results, result)
    CompetitionSystem.HandleMyMatch(state, result, games)
    return winnerId, winsA, winsB
end

--- 季后赛：4 强双败淘汰（胜者组 + 败者组 + 总决赛）
--- 参考真实赛制（LEC/LPL 双败）：胜者组决赛输家掉入败者组决赛，
--- 败者组冠军与胜者组冠军会师总决赛；总决赛胜者组冠军有 1 个胜场优势（BO5 记 1-0 开局）。
function CompetitionSystem.PlayPlayoff(state)
    state = CompetitionSystem.EnsureStandings(state)
    if state.company.seasonState ~= "playoff" then return false, "季后赛尚未开启" end
    local standings = CompetitionSystem.GetStandings(state)
    local first, second = standings[1], standings[2]
    if not second then return false, "参赛队伍不足" end
    local championId
    local third, fourth = standings[3], standings[4]
    if not fourth then return false, "参赛队伍不足" end

    -- 胜者组第 1 轮：1 vs 4、2 vs 3（BO5）
    local w1 = playSeries(state, "winners_r1", first.teamId, fourth.teamId, 5)
    local w2 = playSeries(state, "winners_r1", second.teamId, third.teamId, 5)
    local l1 = w1 == first.teamId and fourth.teamId or first.teamId
    local l2 = w2 == second.teamId and third.teamId or second.teamId

    -- 败者组第 1 轮：两个首轮败者对决（BO3），输家出局
    local loserBracketWinner = playSeries(state, "losers_r1", l1, l2, 3)
    local eliminatedId = loserBracketWinner == l1 and l2 or l1

    -- 胜者组决赛：w1 vs w2（BO5），胜者进总决赛（有优势），败者掉入败者组决赛
    local winnersFinalWinner = playSeries(state, "winners_final", w1, w2, 5)
    local winnersFinalLoser = winnersFinalWinner == w1 and w2 or w1

    -- 败者组决赛：败者组冠军 vs 胜者组决赛败者（BO5），胜者进总决赛
    local losersFinalWinner = playSeries(state, "losers_final", loserBracketWinner, winnersFinalLoser, 5)

    -- 总决赛：胜者组冠军 vs 败者组冠军（BO5，胜者组冠军 1 个胜场优势）
    local finalWinsA, finalWinsB, finalGames = simulateSeries(state, winnersFinalWinner, losersFinalWinner, 5)
    -- 胜者组冠军开局 1-0
    finalWinsA = finalWinsA + 1
    championId = finalWinsA > finalWinsB and winnersFinalWinner or losersFinalWinner
    local finalResult = { phase = "final", teamA = winnersFinalWinner, teamB = losersFinalWinner, scoreA = finalWinsA, scoreB = finalWinsB, bracketReset = true }
    table.insert(state.league.results, finalResult)
    CompetitionSystem.HandleMyMatch(state, finalResult, finalGames)
    state.league.playoff.championId = championId
    local champion = LeagueCatalog.GetTeam(championId)
    local championName = state.company.name
    local mastersEnabled = CompanyState.IsMastersEnabled(state)
    local split = state.company.split or "spring"
    local isPro = state.company.league == "pro"

    if not isPro then
        CompanyState.RecordTimeline(state, "季后赛结束",
            (champion and champion.name or "未知战队") .. " 夺得联赛冠军" .. (mastersEnabled and "，获得世界赛资格。" or "。"))
        if championId == "legacy" then
            state.company.seasonState = "champion"
            state.company.fans = state.company.fans + 8000
            state.company.reputation = clamp(state.company.reputation + 15, 0, 100)
            FinanceSystem.AddPrize(state, 500, "联赛冠军奖金")
            CompanyState.RecordTimeline(state, "冠军之夜",
                championName .. " 夺得东冠联赛冠军" .. (mastersEnabled and "，晋级世界赛！" or "！"))
            local MoraleSystem = require("MoraleSystem")
            MoraleSystem.Celebrate(state)
        else
            state.company.seasonState = "finished"
            CompanyState.RecordTimeline(state, "赛季结束", championName .. " 未能夺冠，新的赛季等待启程。")
        end
        state.finance.valuation = FinanceSystem.GetValuation(state)
        ProfileSystem.MarkSeasonComplete(state, championId == "legacy")
        return true, championId
    end

    -- 双赛制：春季赛夺冠 → 夏季赛再战；夏季赛冠军或全年积分 → 世界赛
    if split == "spring" then
        if championId == "legacy" then
            state.company.points = tonumber(state.company.points or 0) + 6
            state.league.history = state.league.history or {}
            state.league.history.springChampion = "legacy"
            state.company.seasonState = "champion"
            state.company.fans = state.company.fans + 6000
            state.company.reputation = clamp(state.company.reputation + 12, 0, 100)
            FinanceSystem.AddPrize(state, 300, "春季赛冠军奖金")
            CompanyState.RecordTimeline(state, "春季赛冠军",
                championName .. " 夺得春季赛冠军，夏季赛继续冲击世界赛资格！")
            local MoraleSystem = require("MoraleSystem")
            MoraleSystem.Celebrate(state)
            CompanyState.SetHighlight(state, {
                kind = "spring_champion",
                icon = "trophy",
                title = "春季赛冠军",
                tagline = championName .. " 捧起春季赛奖杯，全年征程迈向新高。",
                lines = {
                    "春季季后赛一路过关斩将，冠军奖杯实至名归。",
                    "全年积分 +6，夏季赛再战，世界赛资格在前方。",
                },
                stats = {
                    { label = "奖金", value = "¥300万" },
                    { label = "粉丝", value = "+6000" },
                    { label = "积分", value = "+6" },
                },
            })
        else
            state.company.seasonState = "finished"
            CompanyState.RecordTimeline(state, "春季赛落幕",
                (champion and champion.name or "未知战队") .. " 夺得春季赛冠军，" .. championName .. " 重整旗鼓冲击夏季赛。")
        end
    else
        -- 夏季赛：冠军直通；春冠保送；全年积分前二外卡
        local springChamp = (state.league.history or {}).springChampion == "legacy"
        if championId == "legacy" then
            state.company.points = tonumber(state.company.points or 0) + 6
            state.league.history = state.league.history or {}
            state.league.history.summerChampion = "legacy"
            state.company.seasonState = "champion"
            state.company.worldsEntry = "summer_champion"
            state.company.fans = state.company.fans + 8000
            state.company.reputation = clamp(state.company.reputation + 15, 0, 100)
            FinanceSystem.AddPrize(state, 500, "夏季赛冠军奖金")
            CompanyState.RecordTimeline(state, "夏季赛冠军",
                championName .. " 夺得夏季赛冠军，直通世界赛！")
            local MoraleSystem = require("MoraleSystem")
            MoraleSystem.Celebrate(state)
            CompanyState.SetHighlight(state, {
                kind = "summer_champion",
                icon = "trophy",
                title = "夏季赛冠军",
                tagline = championName .. " 登顶夏季赛，世界赛门票到手！",
                lines = {
                    "夏季季后赛高歌猛进，冠军奖杯为世界赛铺路。",
                    "全年积分 +6，你将以夺冠热门的姿态出战世界赛。",
                },
                stats = {
                    { label = "奖金", value = "¥500万" },
                    { label = "粉丝", value = "+8000" },
                    { label = "积分", value = "+6" },
                },
            })
        else
            local springRank = tonumber((state.league.history or {}).springRank) or 9
            local summerRank = CompetitionSystem.GetPlayerRank(state)
            local avgRank = (springRank + summerRank) / 2
            if springChamp or avgRank <= 2 then
                state.company.seasonState = "champion"
                state.company.worldsEntry = springChamp and "spring_champion" or "points_wildcard"
                state.league.masters.qualifyNote = springChamp and "春季赛冠军保送" or "全年积分外卡"
                CompanyState.RecordTimeline(state, "世界赛资格",
                    (champion and champion.name or "未知战队") .. " 夺得夏季赛冠军，" .. championName .. " 凭" .. (springChamp and "春季赛冠军" or "全年积分") .. "晋级世界赛。")
            else
                state.company.seasonState = "finished"
                CompanyState.RecordTimeline(state, "赛季落幕",
                    (champion and champion.name or "未知战队") .. " 夺得夏季赛冠军，" .. championName .. " 无缘世界赛，新一年再战。")
            end
        end
    end
    state.finance.valuation = FinanceSystem.GetValuation(state)
    ProfileSystem.MarkSeasonComplete(state, championId == "legacy" or (state.league.history or {}).springChampion == "legacy")
    return true, championId
end

return CompetitionSystem
