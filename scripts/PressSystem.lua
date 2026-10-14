-- PressSystem：媒体发布会 / 采访互动（P2-⑤）
-- 关键节点触发 3 选 1 发布会，影响粉丝/士气/董事会信任/对手恩怨
local CompanyState = require("CompanyState")
local SocialSystem = require("SocialSystem")
local MoraleSystem = require("MoraleSystem")
local RivalrySystem = require("RivalrySystem")
local SponsorSystem = require("SponsorSystem")

local PressSystem = {}

PressSystem.TRIGGERS = {
    winStreak  = { label = "连胜",     icon = "连胜",  desc = "连续胜利引发媒体关注" },
    loseStreak = { label = "连败",     icon = "连败",  desc = "连续失利引发质疑" },
    signStar   = { label = "签约巨星", icon = "签约",  desc = "重磅签约引发轰动" },
    scandal    = { label = "丑闻",     icon = "丑闻",  desc = "负面事件需要公关" },
}

-- 发布会选项
PressSystem.OPTIONS = {
    high = { label = "高调 高调宣战", desc = "粉丝 +500，士气 +5，对手恩怨 +1，赞助商好感 +10%", fans = 500, morale = 5, rivalry = 1, sponsor = 0.10 },
    humble = { label = "谦逊 谦逊稳住", desc = "粉丝 +100，士气 +3，无风险", fans = 100, morale = 3, rivalry = 0, sponsor = 0 },
    blame = { label = "甩锅 甩锅推责", desc = "粉丝 -300，士气 -8，对手恩怨 +2，赞助商好感 -15%", fans = -300, morale = -8, rivalry = 2, sponsor = -0.15 },
}

-- 检查是否触发发布会（每周调用）
function PressSystem.CheckTrigger(state)
    state = CompanyState.Ensure(state)
    state.press = state.press or { lastWeek = 0, pending = nil }
    local week = tonumber(state.company.week) or 1
    if state.press.pending then return state.press.pending end  -- 已有待处理发布会
    if week <= (state.press.lastWeek or 0) then return nil end  -- 本周已处理

    -- 连胜 ≥3 场
    local recent = state.social and state.social.history or {}
    local winStreak = 0
    for i = #recent, math.max(1, #recent - 4), -1 do
        if (recent[i].delta or 0) > 0 then winStreak = winStreak + 1 else break end
    end
    if winStreak >= 3 then
        return { trigger = "winStreak", label = "连胜 连胜 " .. tostring(winStreak) .. " 场！", options = { "high", "humble", "blame" } }
    end

    -- 连败 ≥3 场
    local loseStreak = 0
    for i = #recent, math.max(1, #recent - 4), -1 do
        if (recent[i].delta or 0) < 0 then loseStreak = loseStreak + 1 else break end
    end
    if loseStreak >= 3 then
        return { trigger = "loseStreak", label = "连败 连败 " .. tostring(loseStreak) .. " 场！", options = { "high", "humble", "blame" } }
    end

    return nil
end

-- 处理发布会选择
function PressSystem.Respond(state, optionId)
    state = CompanyState.Ensure(state)
    state.press = state.press or { lastWeek = 0, pending = nil }
    local opt = PressSystem.OPTIONS[optionId]
    if not opt then return false, "未知选项" end
    local week = tonumber(state.company.week) or 1
    state.press.lastWeek = week
    state.press.pending = nil

    -- 粉丝
    state.company.fans = math.max(0, (tonumber(state.company.fans) or 0) + opt.fans)
    -- 士气（全员）
    local RosterSystem = require("RosterSystem")
    for _, entry in ipairs(RosterSystem.GetRosterPlayers(state)) do
        MoraleSystem.Change(entry.player, opt.morale)
    end
    -- 对手恩怨（随机选一个宿敌）
    if opt.rivalry > 0 then
        local rivalries = RivalrySystem.GetRivalries(state)
        if #rivalries > 0 then
            RivalrySystem.AddScore(state, rivalries[1].teamId, opt.rivalry, "媒体采访")
        end
    end
    -- 赞助商好感
    if opt.sponsor ~= 0 then
        local SponsorSystem = require("SponsorSystem")
        SponsorSystem.AddReputation(state, opt.sponsor)
    end

    CompanyState.RecordTimeline(state, " 媒体发布会",
        "选择「" .. opt.label .. "」：" .. (opt.fans >= 0 and "+" or "") .. tostring(opt.fans) .. " 粉丝，" .. (opt.morale >= 0 and "+" or "") .. tostring(opt.morale) .. " 士气。")
    state.press.lastRecord = "第 " .. tostring(week) .. " 周：选择「" .. opt.label .. "」"
    return true, opt.label
end

-- 设置待处理发布会（供外部触发，如签约巨星）
function PressSystem.Trigger(state, triggerId, customLabel)
    state = CompanyState.Ensure(state)
    state.press = state.press or { lastWeek = 0, pending = nil }
    local tpl = PressSystem.TRIGGERS[triggerId]
    if not tpl then return false end
    state.press.pending = {
        trigger = triggerId,
        label = customLabel or (tpl.icon .. " " .. tpl.label),
        options = { "high", "humble", "blame" },
    }
    return true
end

return PressSystem
