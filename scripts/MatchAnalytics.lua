-- MatchAnalytics：赛后数据分析台（P1-⑩）
-- 生成结构化比赛数据：战力拆解、关键 swing、对手风格标签
-- 积累对手情报库，供下场 BP/Scout 参考
local RosterSystem = require("RosterSystem")
local HeroSystem = require("HeroSystem")
local LeagueCatalog = require("LeagueCatalog")
local FacilitiesSystem = require("FacilitiesSystem")

local MatchAnalytics = {}

-- 确保 analytics 容器存在于 state
local function ensure(state)
    state.analytics = state.analytics or { matches = {}, opponentIntel = {} }
    return state.analytics
end

-- 计算单局战力拆解（操作/对线/团战/状态 四维度）
local function analyzeGame(state, game, myTeamId)
    local myPower = tonumber(game.myPower) or 0
    local oppPower = tonumber(game.oppPower) or 0
    local phase = game.phaseParams or {}
    -- 四维度拆解（基于 phaseParams 里的因子）
    local dims = {
        operation   = { label = "操作", value = 0, pct = 0 },
        laning     = { label = "对线", value = 0, pct = 0 },
        teamfight  = { label = "团战", value = 0, pct = 0 },
        condition  = { label = "状态", value = 0, pct = 0 },
    }
    -- 从 phase 参数反推各维度贡献
    local total = myPower
    if total > 0 then
        -- 对位克制贡献（counter 因子）
        local counterMul = 1
        if phase.counterMul and phase.counterMul ~= 1 then
            counterMul = phase.counterMul
            dims.laning.value = math.floor(myPower * (counterMul - 1) * 100) / 100
        end
        -- 羁绊贡献
        local synergyMul = 1
        if phase.synergyMul and phase.synergyMul ~= 1 then
            synergyMul = phase.synergyMul
            dims.teamfight.value = math.floor(myPower * (synergyMul - 1) * 100) / 100
        end
        -- 地图/条件贡献
        local condMul = 1
        if phase.condMul and phase.condMul ~= 1 then
            condMul = phase.condMul
            dims.condition.value = math.floor(myPower * (condMul - 1) * 100) / 100
        end
        -- 剩余归操作
        local accounted = (dims.laning.value or 0) + (dims.teamfight.value or 0) + (dims.condition.value or 0)
        dims.operation.value = math.floor((total - accounted) * 10) / 10
        -- 转百分比
        for _, d in pairs(dims) do
            d.pct = total > 0 and math.floor(math.abs(d.value) / total * 100) or 0
        end
    end
    return {
        gameIdx    = game.gameIdx or 1,
        myPower    = myPower,
        oppPower   = oppPower,
        winnerId   = game.winnerId,
        decision   = game.decision and game.decision.label or nil,
        dims       = dims,
        events     = game.events or {},
    }
end

-- 识别关键 swing 时刻（单局内 power 波动最大的事件）
local function extractSwings(game, myTeamId)
    local swings = {}
    local prevPower = nil
    for _, ev in ipairs(game.events or {}) do
        local power = ev.powerDelta or 0
        if math.abs(power) >= 3 and (ev.teamId == myTeamId or ev.teamId == (myTeamId == "A" and "B" or "A")) then
            table.insert(swings, {
                phase   = ev.phase or "mid",
                text    = ev.text or "关键回合",
                teamId  = ev.teamId,
                isMine  = ev.teamId == myTeamId,
                delta   = power,
            })
        end
    end
    -- 按绝对值排序，取前 3
    table.sort(swings, function(a, b) return math.abs(a.delta) > math.abs(b.delta) end)
    local top = {}
    for i = 1, math.min(3, #swings) do table.insert(top, swings[i]) end
    return top
end

-- 从比赛结果推断对手风格标签
local function inferOpponentStyle(state, games, opponentId)
    local tags = {}
    local aggroCount, controlCount = 0, 0
    local totalGames = #games
    for _, g in ipairs(games) do
        if g.decision and g.decision.label then
            local label = g.decision.label
            if label:find("进攻") or label:find("针对") or label:find("换人") then
                aggroCount = aggroCount + 1
            elseif label:find("稳") or label:find("防守") or label:find("控") then
                controlCount = controlCount + 1
            end
        end
    end
    -- 根据胜负推断
    local myWins = 0
    for _, g in ipairs(games) do
        if g.winnerId == (state.match and state.match.myTeamId or "A") then
            myWins = myWins + 1
        end
    end
    if myWins / math.max(1, totalGames) >= 0.7 then
        table.insert(tags, "偏保守")
    elseif myWins / math.max(1, totalGames) <= 0.3 then
        table.insert(tags, "进攻激进")
    end
    if aggroCount > controlCount then
        table.insert(tags, "偏好主动换人")
    end
    if #tags == 0 then table.insert(tags, "风格均衡") end
    return tags
end

-- 主入口：记录一场比赛的分析数据
function MatchAnalytics.Record(state, result, games, myTeamId, myWon)
    local analytics = ensure(state)
    local opponentId = myTeamId == result.teamA and result.teamB or result.teamA
    local opponent = LeagueCatalog.GetTeam(opponentId)
        or LeagueCatalog.GetQualifierTeam(opponentId)
        or LeagueCatalog.GetAcademyTeam(opponentId)
        or LeagueCatalog.GetRegionTeam(opponentId)
    local opponentName = opponent and opponent.name or opponentId

    -- 分析每局
    local gameAnalysis = {}
    for _, g in ipairs(games or {}) do
        local ga = analyzeGame(state, g, myTeamId)
        ga.swings = extractSwings(g, myTeamId)
        table.insert(gameAnalysis, ga)
    end

    -- 对手风格标签
    local tags = inferOpponentStyle(state, games, opponentId)

    -- 组装本场 analytics
    local entry = {
        week        = state.company and state.company.week or 0,
        opponentId  = opponentId,
        opponentName= opponentName,
        result      = myWon and "win" or "lose",
        scoreA      = result.scoreA,
        scoreB      = result.scoreB,
        gameAnalysis= gameAnalysis,
        tags        = tags,
        mvpId       = nil,  -- 由 MatchReporter 填充
        timestamp   = os.time and os.time() or 0,
    }

    -- 写入单场记录
    table.insert(analytics.matches, entry)

    -- 更新对手情报库（累计）
    analytics.opponentIntel = analytics.opponentIntel or {}
    local intel = analytics.opponentIntel[opponentId] or { tags = {}, games = 0, lastSeen = 0 }
    -- 合并标签（去重）
    local tagSet = {}
    for _, t in ipairs(intel.tags or {}) do tagSet[t] = true end
    for _, t in ipairs(tags) do tagSet[t] = true end
    local merged = {}
    for t in pairs(tagSet) do table.insert(merged, t) end
    intel.tags = merged
    intel.games = (intel.games or 0) + 1
    intel.lastSeen = entry.week
    analytics.opponentIntel[opponentId] = intel

    -- 写入 state.match.lastAnalytics 供本场赛后页读取
    state.match = state.match or {}
    state.match.lastAnalytics = entry

    return entry
end

-- 获取对手情报（供 BP / Scout 参考）
function MatchAnalytics.GetOpponentIntel(state, opponentId)
    local analytics = ensure(state)
    return (analytics.opponentIntel or {})[opponentId]
end

-- 获取最近 N 场分析记录
function MatchAnalytics.GetRecent(state, n)
    n = n or 5
    local analytics = ensure(state)
    local matches = analytics.matches or {}
    local start = math.max(1, #matches - n + 1)
    local out = {}
    for i = start, #matches do table.insert(out, matches[i]) end
    return out
end

-- 检查分析室是否解锁（Lv3 解锁数据分析台）
function MatchAnalytics.IsUnlocked(state)
    local FacilitiesSystem = require("FacilitiesSystem")
    return FacilitiesSystem.GetLevel(state, "analysis") >= 3
end

return MatchAnalytics
