-- MatchReporter：比赛复盘文本生成器
-- 把一场 BO3/BO5 的模拟结果转成 2-3 行有张力的文字复盘，
-- 并按战力加权随机选出本场 MVP，供仪表盘战报与联赛赛果展示。
local LeagueCatalog = require("LeagueCatalog")
local RosterSystem = require("RosterSystem")

local MatchReporter = {}

local ROLE_PRAISE = {
    top = "上路对线压制，团战一夫当关",
    jungle = "野区节奏拉满，控图视野全开",
    mid = "中路单杀破局，团战输出接管",
    adc = "团战输出拉满，收割位完美发挥",
    support = "神级开团，团战大脑当之无愧",
}

local OPENER_HOT = {
    "全队手感火热，开局就打出气势。",
    "近期状态在线，比赛一上来就是碾压节奏。",
}

local OPENER_COLD = {
    "队内近期状态低迷，比赛开局一度陷入被动。",
    "状态不佳的阴影还在，选手们开场略显紧张。",
}

local OPENER_FLAT = {
    "双方互探深浅，比赛从第一分钟就充满火药味。",
    "队伍按部就班展开战术，常规赛的味道十足。",
}

local CLOSERS = {
    "赛后解说复盘：这一战，值得放进赛季集锦。",
    "弹幕刷屏：这剧本谁写的？",
    "更衣室里的呐喊穿透直播画面，粉丝直呼青春回来了。",
    "对手赛后采访只留下一句：输得不冤。",
    "这就是电竞的戏剧性——没人能提前写好结局。",
}

local TRASH_WIN_RIVAL = {
    "「常规赛而已，季后赛见真章。」",
    "「你们赢了一场，赢不了整年。」",
    "「下次碰面，我们会打回来。」",
}
local TRASH_WIN_DEAD = {
    "「这账我们记下了，季后赛一定还回来。」",
    "「赢我们一次就值得开香槟了？」",
    "「你们的核心选手，我们会想办法挖过来。」",
}
local TRASH_LOSE_RIVAL = {
    "「他们的状态根本配不上胜利。」",
    "「运气好而已，实力还差得远。」",
    "「我们只是没认真准备而已。」",
}
local TRASH_LOSE_DEAD = {
    "「就这？连赢我们都做不到，凭什么谈冠军。」",
    "「你们的王朝梦，今天开始到头了。」",
    "「输了别不服，回去看看录像再说话。」",
}

local function clamp(value, minimum, maximum)
    return math.max(minimum, math.min(maximum, tonumber(value) or minimum))
end

local function pickMVP(state, myTeamId, games)
    local entries = RosterSystem.GetRosterPlayers(state)
    -- 对位克制与比赛事件提升对应位置的 MVP 权重
    local roleBoost = {}
    if state.match and state.match.myPicks then
        local HeroSystem = require("HeroSystem")
        local counter = HeroSystem.GetCounterSummary(state)
        if counter and counter.pairs then
            for _, p in ipairs(counter.pairs) do
                if p.kind == "win" then
                    roleBoost[p.role] = (roleBoost[p.role] or 0) + 0.8
                elseif p.kind == "lose" then
                    roleBoost[p.role] = (roleBoost[p.role] or 0) - 0.3
                end
            end
        end
    end
    local mentions = {}
    for _, g in ipairs(games or {}) do
        for _, ev in ipairs(g.events or {}) do
            if ev.teamId == myTeamId and ev.role then
                mentions[ev.role] = math.min(2, (mentions[ev.role] or 0) + 1)
            end
        end
    end
    local pool = {}
    local total = 0
    for _, entry in ipairs(entries) do
        local weight = math.max(1, RosterSystem.GetPlayerPower(entry.player, state.meta and state.meta.role))
        local role = entry.role
        if roleBoost[role] then weight = weight * (1 + roleBoost[role]) end
        if mentions[role] then weight = weight * (1 + 0.3 * mentions[role]) end
        table.insert(pool, { entry = entry, weight = weight })
        total = total + weight
    end
    if #pool == 0 then return nil end
    local roll = math.random() * total
    for _, item in ipairs(pool) do
        roll = roll - item.weight
        if roll <= 0 then return item.entry end
    end
    return pool[#pool].entry
end

local function seriesShape(games, myTeamId)
    if not games or #games < 2 then return "系列赛悬念保持到最后。", false, false end
    local first = games[1]
    local firstWon = first.winnerId == myTeamId
    local sweep = true
    local comeback = false
    for _, game in ipairs(games) do
        if game.winnerId ~= myTeamId then sweep = false end
        if game.winnerId == myTeamId and not firstWon then comeback = true end
    end
    if sweep then
        return (#games == 2 and "两局速战速决，对手毫无还手之力。" or "三局直落，比赛早早失去悬念。"), true, false
    end
    if comeback then
        return "先失一局后连扳回来，翻盘剧本拉满！", false, true
    end
    return "决胜局鏖战到最后一刻，一波团战定生死。", false, false
end


local function pickDecisionLine(games, myTeamId)
    if not games then return nil end
    for i = #games, 1, -1 do
        local g = games[i]
        if g.decision and g.decision.label then
            if g.winnerId == myTeamId then
                return " 关键时刻：你选择「" .. g.decision.label .. "」，这次抉择成为转折点，直接奠定胜局。"
            end
            return " 关键时刻：你选择「" .. g.decision.label .. "」，可惜对手顶住了压力，本局功亏一篑。"
        end
    end
    return nil
end

local function pickEventLines(games, myTeamId)
    local result = {}
    if not games then return result end
    local candidates = {}
    for gi, g in ipairs(games) do
        for _, ev in ipairs(g.events or {}) do
            local score = 0
            if ev.teamId == myTeamId then score = score + 2 end
            if ev.phase == "late" then score = score + 1 end
            if gi == #games then score = score + 1 end
            table.insert(candidates, { score = score, text = ev.text })
        end
    end
    table.sort(candidates, function(a, b) return a.score > b.score end)
    for _, c in ipairs(candidates) do
        if #result >= 1 then break end
        table.insert(result, "· " .. c.text)
    end
    return result
end

function MatchReporter.Build(state, result, games, myTeamId, myWon)
    local myScore, oppScore
    if myTeamId == result.teamA then
        myScore, oppScore = result.scoreA, result.scoreB
    else
        myScore, oppScore = result.scoreB, result.scoreA
    end
    local opponentId = myTeamId == result.teamA and result.teamB or result.teamA
    local opponent = LeagueCatalog.GetTeam(opponentId)
        or LeagueCatalog.GetQualifierTeam(opponentId)
        or LeagueCatalog.GetAcademyTeam(opponentId)
        or LeagueCatalog.GetRegionTeam(opponentId)
    local opponentName = opponent and opponent.name or opponentId

    local total = (tonumber(myScore) or 0) + (tonumber(oppScore) or 0)
    local resultLine
    if myWon then
        if total <= 2 then
            resultLine = myScore == 2 and "2:0 横扫" or "2:1 险胜"
        else
            resultLine = oppScore == 0 and "3:0 完胜" or (oppScore == 1 and "3:1 力克" or "3:2 惊险取胜")
        end
    else
        if total <= 2 then
            resultLine = myScore == 0 and "0:2 不敌" or "1:2 惜败"
        else
            resultLine = myScore == 0 and "0:3 惨负" or (myScore == 1 and "1:3 落败" or "2:3 憾负")
        end
    end
    resultLine = resultLine .. " " .. opponentName

    local shape, sweep, comeback = seriesShape(games, myTeamId)
    local mvpEntry = pickMVP(state, myTeamId, games)
    local entries = RosterSystem.GetRosterPlayers(state)
    local avgForm = 0
    for _, entry in ipairs(entries) do
        avgForm = avgForm + (tonumber(entry.player.recentForm) or 0)
    end
    if #entries > 0 then avgForm = avgForm / #entries end
    local opener
    if avgForm >= 5 then
        opener = OPENER_HOT[math.random(#OPENER_HOT)]
    elseif avgForm <= -5 then
        opener = OPENER_COLD[math.random(#OPENER_COLD)]
    else
        opener = OPENER_FLAT[math.random(#OPENER_FLAT)]
    end

    local lines = { resultLine, opener, shape }
    local decisionLine = pickDecisionLine(games, myTeamId)
    if decisionLine then table.insert(lines, decisionLine) end
    for _, evLine in ipairs(pickEventLines(games, myTeamId)) do
        table.insert(lines, evLine)
    end
    if mvpEntry then
        local praise = ROLE_PRAISE[mvpEntry.role] or "关键先生，表现无可挑剔"
        table.insert(lines, "MVP：" .. mvpEntry.player.name .. "（" .. (LeagueCatalog.POSITIONS[mvpEntry.role] or "选手") .. "）" .. praise)
    local RivalrySystem = require("RivalrySystem")
    local rvLevel = RivalrySystem.GetLevel(state, opponentId)
    if rvLevel > 0 then
        local quote
        if myWon then
            local pool = rvLevel >= 3 and TRASH_WIN_DEAD or TRASH_WIN_RIVAL
            quote = pool[math.random(#pool)]
        else
            local pool = rvLevel >= 3 and TRASH_LOSE_DEAD or TRASH_LOSE_RIVAL
            quote = pool[math.random(#pool)]
        end
        table.insert(lines, " " .. opponentName .. " 赛后" .. (myWon and "（输球方）" or "（赢球方）") .. "：" .. quote)
    end
    end
    table.insert(lines, CLOSERS[math.random(#CLOSERS)])
    return {
        title = "对阵 " .. opponentName,
        resultLine = resultLine,
        lines = lines,
        mvpId = mvpEntry and mvpEntry.player.id,
        mvpName = mvpEntry and mvpEntry.player.name,
        won = myWon,
        sweep = sweep,
        comeback = comeback,
    }
end

function MatchReporter.FormState(player)
    local rf = tonumber(player and player.recentForm) or 0
    if rf >= 6 then return " 火热", rf, "hot" end
    if rf <= -6 then return " 低迷", rf, "cold" end
    return "平稳", rf, "flat"
end

return MatchReporter
