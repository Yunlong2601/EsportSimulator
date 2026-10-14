-- TransferNewsSystem：转会传闻 + AI 俱乐部互交易（转会风云榜）
-- 经纪人来电制造决策张力：有人挖你选手时提前预警、自由市场新星被争抢时提示；
-- AI 队之间每周成交 1-2 笔，形成跨赛季的转会新闻榜，让市场显得「活着」。
local CompanyState = require("CompanyState")
local LeagueCatalog = require("LeagueCatalog")

local TransferNewsSystem = {}

TransferNewsSystem.NAMES = {
    "Aiden", "Bane", "Cruz", "Dax", "Eliot", "Frost", "Gunn", "Haze", "Ivo", "Jax",
    "Kai", "Loki", "Miles", "Nash", "Onyx", "Pike", "Quill", "Rex", "Slade", "Troy",
    "Uno", "Vale", "Wolf", "Xan", "Yuri", "Zane", "Aero", "Blitz", "Cobra", "Duke",
}

TransferNewsSystem.ROLES = { "top", "jungle", "mid", "adc", "support" }

local function clamp(value, minimum, maximum)
    return math.max(minimum, math.min(maximum, tonumber(value) or minimum))
end

-- AI 队清单（排除玩家队伍）
local function getAiTeams()
    local teams = {}
    for _, t in ipairs(LeagueCatalog.TEAMS) do
        if t.id ~= "legacy" then table.insert(teams, { id = t.id, name = t.name, power = t.power }) end
    end
    for _, t in ipairs(LeagueCatalog.ACADEMY_TEAMS) do
        if t.id ~= "legacy_youth" then table.insert(teams, { id = t.id, name = t.name, power = t.power }) end
    end
    for _, region in pairs(LeagueCatalog.REGIONS) do
        for _, t in ipairs(region.teams) do
            table.insert(teams, { id = t.id, name = t.name, power = t.power })
        end
    end
    return teams
end

-- 惰性生成 AI 选手池（存 state，跨赛季稳定；每队 2 名）
function TransferNewsSystem.EnsurePool(state)
    state = CompanyState.Ensure(state)
    state.market.transferPool = state.market.transferPool or {}
    state.market.transferPoolSeq = tonumber(state.market.transferPoolSeq) or 0
    local pool = state.market.transferPool
    if next(pool) then return pool end
    local teams = getAiTeams()
    for _, team in ipairs(teams) do
        for _ = 1, 2 do
            state.market.transferPoolSeq = state.market.transferPoolSeq + 1
            local idx = state.market.transferPoolSeq
            local powerBase = team.power - 6 + math.random(0, 14)
            local player = {
                id = "ai_" .. tostring(idx),
                name = TransferNewsSystem.NAMES[math.random(#TransferNewsSystem.NAMES)],
                role = TransferNewsSystem.ROLES[math.random(#TransferNewsSystem.ROLES)],
                team = team.id,
                teamName = team.name,
                power = clamp(powerBase, 42, 92),
                potential = clamp(48 + math.random(0, 42), 48, 92),
                age = 17 + math.random(0, 13),
                salary = 4 + math.random(0, 16),
                form = 55 + math.random(0, 25),
            }
            pool[player.id] = player
        end
    end
    return pool
end

-- 选手估值（简化版，用于 AI 交易与传闻报价）
function TransferNewsSystem.EstimateValue(player)
    local power = tonumber(player.power) or 60
    local potential = tonumber(player.potential) or 60
    local age = tonumber(player.age) or 21
    local base = power * 3.2 + (potential - 50) * 2.4
    local ageFactor = 1.0
    if age <= 20 then ageFactor = 0.92
    elseif age >= 28 then ageFactor = 0.72
    elseif age >= 26 then ageFactor = 0.85 end
    return math.max(20, math.floor(base * ageFactor * (0.9 + math.random() * 0.5) + 0.5))
end

-- 从池中挑一名可交易选手（偏向与队伍实力不匹配的）
function TransferNewsSystem.PickTransferablePlayer(state)
    local pool = TransferNewsSystem.EnsurePool(state)
    local candidates = {}
    for _, player in pairs(pool) do
        local gap = tonumber(player.power) - 50
        -- 弱队里的强人、强队里的弱人都更可能流动
        local weight = math.abs(gap) > 12 and 2 or 1
        for _ = 1, weight do table.insert(candidates, player) end
    end
    if #candidates == 0 then return nil end
    return candidates[math.random(#candidates)]
end

-- 匹配买家：整体实力能容纳该选手的球队（排除现队）
function TransferNewsSystem.PickBuyer(state, player)
    local pool = TransferNewsSystem.EnsurePool(state)
    local teams = getAiTeams()
    local buyers = {}
    for _, team in ipairs(teams) do
        if team.id ~= player.team and team.power >= (tonumber(player.power) or 0) - 6 then
            table.insert(buyers, team)
        end
    end
    if #buyers == 0 then return nil end
    return buyers[math.random(#buyers)]
end

-- 共享成交记录：AI 转会 / 违约金买断统一写入转会风云榜
function TransferNewsSystem.RecordDeal(state, sellerName, buyerName, player, amount)
    state = CompanyState.Ensure(state)
    local market = state.market
    market.transferNews = market.transferNews or {}
    local grade = (tonumber(player.potential) or 0) >= 85 and "S" or ((tonumber(player.potential) or 0) >= 75 and "A" or ((tonumber(player.potential) or 0) >= 65 and "B" or "C"))
    table.insert(market.transferNews, 1, {
        week = tonumber(state.company.week) or 1,
        season = tonumber(state.company.seasons) or 0,
        playerName = player.name,
        role = player.role,
        power = player.power,
        grade = grade,
        seller = sellerName,
        buyer = buyerName,
        amount = amount,
    })
    while #market.transferNews > 24 do table.remove(market.transferNews) end
    CompanyState.RecordTimeline(state, "转会市场",
        player.name .. "（" .. grade .. "级）以 ¥" .. tostring(amount) .. "万 从 " .. sellerName .. " 转会至 " .. buyerName .. "。")
    return state
end

-- 每周模拟 AI 转会：1-2 笔成交，计入转会风云榜
function TransferNewsSystem.SimulateTransfers(state)
    state = CompanyState.Ensure(state)
    local market = state.market
    market.transferNews = market.transferNews or {}
    local deals = math.random() < 0.55 and 1 or 2
    for _ = 1, deals do
        local player = TransferNewsSystem.PickTransferablePlayer(state)
        if player then
            local buyer = TransferNewsSystem.PickBuyer(state, player)
            if buyer then
                local amount = TransferNewsSystem.EstimateValue(player)
                local sellerName = player.teamName
                player.team = buyer.id
                player.teamName = buyer.name
                player.form = clamp((tonumber(player.form) or 70) + math.random(-3, 3), 0, 100)
                TransferNewsSystem.RecordDeal(state, sellerName, buyer.name, player, amount)
                TransferNewsSystem.ApplyAiStrengthening(state, buyer, player, amount)
            end
        end
    end
    TransferNewsSystem.SimulateFreeAgentWar(state)
    return state
end

-- 生成一名自由市场新秀（无主，供 AI 竞价 / 后续可被交易）
function TransferNewsSystem.GenerateFreeProspect(state)
    state = CompanyState.Ensure(state)
    state.market.transferPool = state.market.transferPool or {}
    state.market.transferPoolSeq = tonumber(state.market.transferPoolSeq) or 0
    state.market.transferPoolSeq = state.market.transferPoolSeq + 1
    local idx = state.market.transferPoolSeq
    local player = {
        id = "ai_fa_" .. tostring(idx),
        name = TransferNewsSystem.NAMES[math.random(#TransferNewsSystem.NAMES)],
        role = TransferNewsSystem.ROLES[math.random(#TransferNewsSystem.ROLES)],
        team = nil,
        teamName = "自由市场",
        power = clamp(66 + math.random(0, 18), 60, 90),
        potential = clamp(76 + math.random(0, 18), 76, 94),
        age = 17 + math.random(0, 4),
        salary = 4 + math.random(0, 10),
        form = 55 + math.random(0, 25),
    }
    state.market.transferPool[player.id] = player
    return player
end

-- 挑选自由市场优质球员：优先无主高潜新秀，不足则新生成
function TransferNewsSystem.PickFreeAgent(state)
    local pool = state.market.transferPool or {}
    local candidates = {}
    for _, p in pairs(pool) do
        if p.team == nil and ((tonumber(p.potential) or 0) >= 78 or (tonumber(p.power) or 0) >= 72) then
            table.insert(candidates, p)
        end
    end
    if #candidates > 0 then return candidates[math.random(#candidates)] end
    return TransferNewsSystem.GenerateFreeProspect(state)
end

-- AI 互抢自由人：2-3 家俱乐部竞价，最高价成交并登上转会榜
function TransferNewsSystem.SimulateFreeAgentWar(state)
    state = CompanyState.Ensure(state)
    if math.random() > 0.4 then return state end
    local free = TransferNewsSystem.PickFreeAgent(state)
    if not free then return state end
    local fair = TransferNewsSystem.EstimateValue(free)
    if fair < 30 then return state end
    local teams = getAiTeams()
    local bidders = {}
    for _, team in ipairs(teams) do
        if team.power >= (tonumber(free.power) or 0) - 8 then
            table.insert(bidders, team)
        end
    end
    if #bidders < 2 then return state end
    local count = math.min(3, #bidders)
    -- 洗牌抽取 count 家俱乐部
    for i = #bidders, 2, -1 do
        local j = math.random(i)
        bidders[i], bidders[j] = bidders[j], bidders[i]
    end
    local winner, winnerBid = nil, 0
    for i = 1, count do
        -- 出价随轮次抬升，强队略多出一点
        local bid = math.floor(fair * (0.95 + (i - 1) * 0.12 + math.random() * 0.10) + 0.5)
        if bid > winnerBid then winner, winnerBid = bidders[i], bid end
    end
    free.team = winner.id
    free.teamName = winner.name
    free.form = clamp((tonumber(free.form) or 70) + math.random(-3, 3), 0, 100)
    TransferNewsSystem.RecordDeal(state, "自由市场", winner.name, free, winnerBid)
    TransferNewsSystem.ApplyAiStrengthening(state, winner, free, winnerBid)
    -- 竞价热度让社交媒体升温
    local SocialSystem = require("SocialSystem")
    state = SocialSystem.Ensure(state)
    state.social.heat = clamp((tonumber(state.social.heat) or 50) + 1 + math.random(0, 2), 0, 100)
    return state
end


--- AI 引援落地：东冠 pro 买家真实落进 5 人阵容；次级/区域买家保留战力加成
function TransferNewsSystem.ApplyAiStrengthening(state, buyer, player, amount)
    state = CompanyState.Ensure(state)
    if not buyer or not buyer.id or buyer.id == "legacy" then return state end
    local AISystem = require("AISystem")
    if AISystem.IsProAiTeam(buyer.id) then
        AISystem.EnsureAgents(state)
        AISystem.AcquirePlayer(state, buyer.id, player, amount)
        return state
    end
    local ai = state.aiTeams or {}
    state.aiTeams = ai
    local key = tostring(buyer.id)
    local entry = ai[key] or { bonus = 0, signings = {} }
    ai[key] = entry
    local raw = 1
    if (tonumber(player.potential) or 0) >= 80 then raw = raw + 1 end
    if (tonumber(player.form) or 70) >= 80 then raw = raw + 1 end
    local difficulty = CompanyState.GetDifficulty(state)
    local factor = (difficulty and difficulty.aiPower) or 1.0
    local gain = math.max(1, math.floor(raw * factor + 0.5))
    entry.bonus = math.min(20, (tonumber(entry.bonus) or 0) + gain)
    table.insert(entry.signings, {
        name = player.name,
        week = tonumber(state.company.week) or 1,
        amount = amount,
    })
    return state
end
-- 经纪人来电：每周 1-2 条市场传闻
function TransferNewsSystem.RollRumors(state)
    state = CompanyState.Ensure(state)
    local market = state.market
    market.rumors = market.rumors or {}
    for i = #market.rumors, 1, -1 do
        if tonumber(market.rumors[i].expireWeek) < tonumber(state.company.week) then
            table.remove(market.rumors, i)
        end
    end
    local count = math.random() < 0.55 and 1 or 2
    for _ = 1, count do
        local rumor = TransferNewsSystem.GenerateRumor(state)
        if rumor then
            table.insert(market.rumors, 1, rumor)
            while #market.rumors > 4 do table.remove(market.rumors) end
        end
    end
    return state
end

function TransferNewsSystem.GenerateRumor(state)
    state = CompanyState.Ensure(state)
    local roll = math.random()
    if roll < 0.4 then
        -- 自家选手被盯上：提前预警，给玩家续约/挂牌的决策窗口
        local RosterSystem = require("RosterSystem")
        local MarketSystem = require("MarketSystem")
        local candidates = {}
        for _, entry in ipairs(RosterSystem.GetRosterPlayers(state)) do
            local player = entry.player
            if not state.market.listed[player.id] and not MarketSystem.IsLoaned(state, player.id) then
                local power = RosterSystem.GetPlayerPower(player, state.meta and state.meta.role)
                if (tonumber(player.potential) or 0) >= 75 or power >= 72 then
                    table.insert(candidates, player)
                end
            end
        end
        if #candidates > 0 then
            local player = candidates[math.random(#candidates)]
            local club = MarketSystem.PickClubName(state)
            local fair = MarketSystem.GetMarketValue(state, player.id)
            local hint = math.floor(fair * (0.9 + math.random() * 0.3) + 0.5)
            local windowOpen = MarketSystem.IsTransferWindow(state)
            return {
                kind = "mine",
                week = tonumber(state.company.week) or 1,
                expireWeek = tonumber(state.company.week) + 2,
                text = " 经纪人来电：" .. club .. " 正在考察 " .. player.name .. "，传闻报价约 ¥" .. tostring(hint) .. "万——" .. (windowOpen and "续约锁人，或趁热度挂牌。" or "休市期无法挂牌，先续约锁人，开窗后趁热度出手。"),
                playerId = player.id,
            }
        end
    elseif roll < 0.7 then
        -- 自由市场/青训新星被多家争抢
        local pool = TransferNewsSystem.EnsurePool(state)
        local candidates = {}
        for _, p in pairs(pool) do
            if (tonumber(p.potential) or 0) >= 78 and tonumber(p.age) <= 22 then
                table.insert(candidates, p)
            end
        end
        if #candidates > 0 then
            local p = candidates[math.random(#candidates)]
            return {
                kind = "prospect",
                week = tonumber(state.company.week) or 1,
                expireWeek = tonumber(state.company.week) + 2,
                text = " 转会传闻：多支豪门争抢潜力新星 " .. p.name .. "（" .. (LeagueCatalog.POSITIONS[p.role] or p.role) .. " · 潜力" .. tostring(p.potential) .. "），身价正在被推高。",
            }
        end
    end
    -- 兜底：最新一笔 AI 转会
    local news = state.market.transferNews or {}
    if #news > 0 then
        local n = news[1]
        return {
            kind = "news",
            week = tonumber(state.company.week) or 1,
            expireWeek = tonumber(state.company.week) + 2,
            text = " 经纪人闲聊：" .. n.buyer .. " 重金签下 " .. n.playerName .. "（¥" .. tostring(n.amount) .. "万），转会市场正在升温。",
        }
    end
    return nil
end

function TransferNewsSystem.GetRumors(state)
    state = CompanyState.Ensure(state)
    return state.market.rumors or {}
end

function TransferNewsSystem.GetTransferNews(state)
    state = CompanyState.Ensure(state)
    return state.market.transferNews or {}
end

-- 选手是否处于转会传闻中（经纪人来电预警过的选手，市场命中率提升）
function TransferNewsSystem.HasRumorForPlayer(state, playerId)
    state = CompanyState.Ensure(state)
    for _, rumor in ipairs(state.market.rumors or {}) do
        if rumor.kind == "mine" and rumor.playerId == playerId then
            return true
        end
    end
    return false
end

-- 转会成交榜：按金额降序返回（世界转会市场）
function TransferNewsSystem.GetBoard(state)
    state = CompanyState.Ensure(state)
    local news = {}
    for _, n in ipairs(state.market.transferNews or {}) do
        table.insert(news, n)
    end
    table.sort(news, function(a, b)
        return (tonumber(a.amount) or 0) > (tonumber(b.amount) or 0)
    end)
    return news
end

-- 转会榜统计：本周/赛季成交笔数、总额、标王
function TransferNewsSystem.GetBoardStats(state)
    state = CompanyState.Ensure(state)
    local week = tonumber(state.company.week) or 1
    local season = tonumber(state.company.seasons) or 0
    local stats = { weekCount = 0, weekTotal = 0, seasonCount = 0, seasonTotal = 0, topAmount = 0, topDeal = nil }
    for _, n in ipairs(state.market.transferNews or {}) do
        local amount = tonumber(n.amount) or 0
        if amount > stats.topAmount then
            stats.topAmount = amount
            stats.topDeal = n
        end
        if tonumber(n.week) == week and tonumber(n.season) == season then
            stats.weekCount = stats.weekCount + 1
            stats.weekTotal = stats.weekTotal + amount
        end
        if tonumber(n.season) == season then
            stats.seasonCount = stats.seasonCount + 1
            stats.seasonTotal = stats.seasonTotal + amount
        end
    end
    return stats
end

return TransferNewsSystem
