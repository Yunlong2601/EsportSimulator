-- SocialSystem：社交媒体热度（RC D2 联盟生态）
-- 每周结算：胜负 / 转会成交 / 选手状态 / 运营事件驱动热度，
-- 热度向中值回归并带动粉丝增长，同时生成每周社交话题（世界感来源）。

local CompanyState = require("CompanyState")
local LeagueCatalog = require("LeagueCatalog")
local RosterSystem = require("RosterSystem")

local SocialSystem = {}

-- 热度中值：0-100 区间，50 为中性
SocialSystem.MID = 50

local function clamp(value, minimum, maximum)
    return math.max(minimum, math.min(maximum, tonumber(value) or minimum))
end

--- 补齐/迁移 state.social（老档自动生成）
function SocialSystem.Ensure(state)
    state = CompanyState.Ensure(state)
    local s = state.social
    if not s then
        s = {}
        state.social = s
    end
    s.heat = tonumber(s.heat) or SocialSystem.MID
    s.history = s.history or {}
    s.topics = s.topics or {}
    s.trend = tonumber(s.trend) or 0
    s.respondedWeek = tonumber(s.respondedWeek) or 0
    return state
end

local function topicWin(state, delta)
    return { tag = "#" .. state.company.name .. " 势不可挡", text = delta >= 10 and "大胜刷屏，评论区沸腾" or "稳扎稳打，热度稳步上升" }
end

local function topicLose(state)
    return { tag = "#" .. state.company.name .. " 状态起伏", text = "失利引发讨论，粉丝期待尽快调整" }
end

local function topicTransfer(news)
    return { tag = "#转会风云", text = news.buyer .. " 以 ¥" .. tostring(news.amount) .. "万 签下 " .. news.playerName .. "，转会市场震动" }
end

local function topicHotPlayer(player)
    return { tag = "#" .. player.name .. " 手感火热", text = "连续高光表现，粉丝疯狂刷屏" }
end

local function topicSlumpPlayer(player)
    return { tag = "#" .. player.name .. " 状态低迷", text = "近期表现引担忧，评论区吵翻了" }
end

local function topicDefault(state)
    return { tag = "#电竞周报", text = "本周" .. (LeagueCatalog and LeagueCatalog.GAME_NAME or "电竞圈") .. "动态更新" }
end

--- 每周结算：返回周热度变化，并同步粉丝与话题
function SocialSystem.ProcessWeek(state, legacyWon)
    state = SocialSystem.Ensure(state)
    local heat = state.social.heat
    local delta = 0
    local news = state.market and state.market.transferNews or {}

    -- 1. 比赛胜负
    if legacyWon == true then
        delta = delta + 6
    elseif legacyWon == false then
        delta = delta - 4
    end
    -- 2. 本周转会成交：大额交易更吸睛
    if #news > 0 and tonumber(news[1].week) == tonumber(state.company.week) then
        local amount = tonumber(news[1].amount) or 0
        delta = delta + (amount >= 200 and 5 or 3)
    end
    -- 3. 选手近期状态：火热/低迷上榜
    local hotPlayer, slumpPlayer = nil, nil
    for _, entry in ipairs(RosterSystem.GetRosterPlayers(state)) do
        local form = tonumber(entry.player and entry.player.recentForm) or 0
        if form >= 15 then
            delta = delta + 2
            if not hotPlayer then hotPlayer = entry.player end
        elseif form <= -10 then
            delta = delta - 2
            if not slumpPlayer then slumpPlayer = entry.player end
        end
    end
    -- 4. 热度向中值回归，防止两极锁死
    heat = heat + delta
    heat = heat + math.floor((SocialSystem.MID - heat) * 0.15 + 0.5)
    heat = clamp(heat, 0, 100)
    local old = state.social.heat
    state.social.heat = heat
    state.social.trend = heat - old

    -- 5. 话题生成：按显著性优先级取 1-2 条
    local topics = {}
    if #news > 0 and tonumber(news[1].week) == tonumber(state.company.week) and tonumber(news[1].amount or 0) >= 150 then
        topics[#topics + 1] = topicTransfer(news[1])
    end
    if legacyWon == true then
        topics[#topics + 1] = topicWin(state, delta)
    elseif legacyWon == false then
        topics[#topics + 1] = topicLose(state)
    end
    if hotPlayer and #topics < 2 then
        topics[#topics + 1] = topicHotPlayer(hotPlayer)
    end
    if slumpPlayer and #topics < 2 then
        topics[#topics + 1] = topicSlumpPlayer(slumpPlayer)
    end
    local RivalrySystem = require("RivalrySystem")
    local rivalries = RivalrySystem.GetRivalries(state)
    if #rivalries > 0 and #topics < 2 then
        local r = rivalries[1]
        topics[#topics + 1] = {
            kind = "rivalry",
            teamId = r.teamId,
            tag = "#" .. r.name .. " 恩怨局",
            text = RivalrySystem.GetLevelLabel(r.level) .. "：" .. (r.lastEvent or "两家俱乐部火药味渐浓") .. "，粉丝隔空开战。",
        }
    end
    if #topics == 0 then
        topics[#topics + 1] = topicDefault(state)
    end
    state.social.topics = topics

    -- 6. 热度带动粉丝：每偏离中值 1 点 = 每周 ±10 粉丝
    local fanDelta = math.floor((heat - SocialSystem.MID) * 10)
    if fanDelta ~= 0 then
        state.company.fans = math.max(0, (tonumber(state.company.fans) or 0) + fanDelta)
    end

    -- 7. 历史记录（保留最近 12 周）
    table.insert(state.social.history, {
        week = tonumber(state.company.week) or 1,
        heat = heat,
        delta = delta,
    })
    while #state.social.history > 12 do table.remove(state.social.history, 1) end
    return state
end

--- 热度标签：用于 UI
function SocialSystem.GetHeatLabel(heat)
    heat = tonumber(heat) or SocialSystem.MID
    if heat >= 75 then return " 全网热议" end
    if heat >= 60 then return " 热度高涨" end
    if heat >= 40 then return "平稳运营" end
    if heat >= 25 then return " 关注度下滑" end
    return " 无人问津"
end


--- 回应宿敌嘴炮：每周限 1 次，粉丝 +200、恩怨 +1
function SocialSystem.RespondToRivalry(state, teamId)
    state = SocialSystem.Ensure(state)
    local week = tonumber(state.company.week) or 1
    if tonumber(state.social.respondedWeek) == week then
        return false, "本周已回应过"
    end
    local RivalrySystem = require("RivalrySystem")
    RivalrySystem.AddScore(state, teamId, 1, "赛后隔空回应")
    state.company.fans = (tonumber(state.company.fans) or 0) + 200
    state.social.respondedWeek = week
    local t = LeagueCatalog.GetTeam(teamId)
        or LeagueCatalog.GetAcademyTeam(teamId)
        or LeagueCatalog.GetRegionTeam(teamId)
    local name = t and t.name or tostring(teamId)
    CompanyState.RecordTimeline(state, "回应嘴炮",
        "你在社交媒体回击了 " .. name .. " 的挑衅，粉丝 +200，恩怨升级。")
    return true
end
return SocialSystem
