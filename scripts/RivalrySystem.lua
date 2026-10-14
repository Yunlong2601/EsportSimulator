-- RivalrySystem：AI 战队宿敌关系 + 赛后嘴炮
-- 触发：关键战淘汰 / 违约金强挖核心 / 连续败北 / 报价被拒升级，
-- 等级 1-3 影响赛后嘴炮文案、AI 挖角热情与回应收益。
local CompanyState = require("CompanyState")
local LeagueCatalog = require("LeagueCatalog")

local RivalrySystem = {}

local MAX_SCORE = 12

function RivalrySystem.Ensure(state)
    state = CompanyState.Ensure(state)
    state.rivalries = state.rivalries or {}
    return state
end

local function levelFor(score)
    if score >= 6 then return 3 end
    if score >= 3 then return 2 end
    if score >= 1 then return 1 end
    return 0
end

local function getRivalry(state, teamId)
    RivalrySystem.Ensure(state)
    local key = tostring(teamId)
    local r = state.rivalries[key]
    if not r then
        r = { level = 0, score = 0, winsVs = 0, lastEvent = nil, lastWeek = 0 }
        state.rivalries[key] = r
    end
    return r
end

local function teamNameOf(state, teamId)
    local t = LeagueCatalog.GetTeam(teamId)
        or LeagueCatalog.GetQualifierTeam(teamId)
        or LeagueCatalog.GetAcademyTeam(teamId)
        or LeagueCatalog.GetRegionTeam(teamId)
    return t and t.name or tostring(teamId)
end

function RivalrySystem.GetLevel(state, teamId)
    return getRivalry(state, teamId).level
end

function RivalrySystem.GetScore(state, teamId)
    return getRivalry(state, teamId).score
end

--- 增加恩怨值；返回更新后的记录
function RivalrySystem.AddScore(state, teamId, amount, eventLabel)
    local r = getRivalry(state, teamId)
    r.score = math.max(0, math.min(MAX_SCORE, r.score + (tonumber(amount) or 0)))
    r.level = levelFor(r.score)
    if eventLabel then r.lastEvent = eventLabel end
    r.lastWeek = tonumber(state.company and state.company.week) or 1
    return r
end

--- 大事件触发：关键战淘汰 / 强挖核心等一次性 +2
function RivalrySystem.Trigger(state, teamId, reason)
    return RivalrySystem.AddScore(state, teamId, 2, reason)
end

--- 对局结束：赢则记 winsVs，输则恩怨 +1；连败两场自动升级
function RivalrySystem.OnMatchEnd(state, opponentId, won)
    local r = getRivalry(state, opponentId)
    if won then
        r.winsVs = (tonumber(r.winsVs) or 0) + 1
    else
        RivalrySystem.AddScore(state, opponentId, 1, "连续败给 " .. teamNameOf(state, opponentId))
    end
    return r
end

--- 周结算：恩怨值随时间冷却（4 周无新事件 -1），避免宿敌永久锁死
function RivalrySystem.ProcessWeek(state)
    state = RivalrySystem.Ensure(state)
    local week = tonumber(state.company and state.company.week) or 1
    for teamId, r in pairs(state.rivalries) do
        if (tonumber(r.score) or 0) > 0 and week - (tonumber(r.lastWeek) or week) >= 4 then
            r.score = math.max(0, (tonumber(r.score) or 0) - 1)
            r.level = levelFor(r.score)
        end
    end
    return state
end

--- 恩怨列表（按等级降序），供 UI 展示
function RivalrySystem.GetRivalries(state)
    state = RivalrySystem.Ensure(state)
    local list = {}
    for teamId, r in pairs(state.rivalries) do
        if (tonumber(r.level) or 0) > 0 then
            table.insert(list, {
                teamId = teamId,
                name = teamNameOf(state, teamId),
                level = tonumber(r.level) or 0,
                score = tonumber(r.score) or 0,
                winsVs = tonumber(r.winsVs) or 0,
                lastEvent = r.lastEvent,
            })
        end
    end
    table.sort(list, function(a, b)
        if a.level ~= b.level then return a.level > b.level end
        return a.score > b.score
    end)
    return list
end

--- 等级文案：用于排行榜明细 / 社交话题
function RivalrySystem.GetLevelLabel(level)
    if level >= 3 then return " 死敌" end
    if level >= 2 then return " 宿敌" end
    if level >= 1 then return " 新仇" end
    return "普通对手"
end

-- ============ 机制 C 扩展：恩怨剧情 / 嘴炮 / 挖角战 ============

-- 嘴炮选项（玩家主动发起，制造叙事钩子与后果）
local TRASH_TALK = {
    { id = "dominant", label = " 霸气宣战", desc = "放话必胜，全队士气 +6，但宿敌值 +1（对手可能回怼）",
      morale = 6, score = 1, fans = 0, aiReply = 0.55 },
    { id = "mindgame", label = " 心理压制", desc = "暗讽对手核心状态下滑，下场对位战意 +6%",
      form = 0.06, score = 0, fans = 0, aiReply = 0.30 },
    { id = "respect",  label = " 赛前致意", desc = "展现风度，宿敌值 -1，但粉丝热度 -800",
      morale = 0, score = -1, fans = -800, aiReply = 0 },
}

function RivalrySystem.GetTrashTalkOptions()
    return TRASH_TALK
end

function RivalrySystem.AddArc(state, teamId, arcId)
    local r = getRivalry(state, teamId)
    r.arcs = r.arcs or {}
    r.arcs[arcId] = true
end

function RivalrySystem.GetArcs(state, teamId)
    local r = getRivalry(state, teamId)
    local out = {}
    if r.arcs then
        for k, _ in pairs(r.arcs) do table.insert(out, k) end
    end
    return out
end

function RivalrySystem.GetArcLabel(arcId)
    if arcId == "feud" then return " 口水战" end
    if arcId == "poaching_war" then return " 挖角战" end
    if arcId == "title_race" then return " 冠军争夺" end
    return arcId
end

--- 玩家主动发起嘴炮；返回结果文案与生效效果
function RivalrySystem.TrashTalk(state, teamId, optionId)
    state = RivalrySystem.Ensure(state)
    local opt = nil
    for _, o in ipairs(TRASH_TALK) do if o.id == optionId then opt = o break end end
    if not opt then return { ok = false, text = "无效的嘴炮选项" } end
    local name = teamNameOf(state, teamId)
    local effects = {}
    -- 士气：作用于我方阵容（直接改 LeagueCatalog 选手对象）
    if opt.morale and opt.morale ~= 0 then
        local RosterSystem = require("RosterSystem")
        local list = RosterSystem.GetRosterPlayers(state)
        for _, e in ipairs(list) do
            local p = LeagueCatalog.GetPlayer(e.player.id)
            if p then p.morale = math.min(100, (tonumber(p.morale) or 60) + opt.morale) end
        end
        table.insert(effects, "全队士气 +" .. tostring(opt.morale))
    end
    -- 粉丝热度
    if opt.fans and opt.fans ~= 0 then
        state.company.fans = math.max(0, (state.company.fans or 0) + opt.fans)
        table.insert(effects, "粉丝 " .. (opt.fans > 0 and "+" or "") .. tostring(opt.fans))
    end
    -- 宿敌值变化
    if opt.score and opt.score ~= 0 then
        RivalrySystem.AddScore(state, teamId, opt.score, "你向 " .. name .. " 发起：" .. opt.label)
        table.insert(effects, "宿敌值 " .. (opt.score > 0 and "+" or "") .. tostring(opt.score))
    end
    -- 战意：作用于我方阵容（form 以百分比存储，×100 转绝对点；此前恒未生效，见体检报告 A1）
    if opt.form and opt.form ~= 0 then
        local RosterSystem = require("RosterSystem")
        local delta = math.floor(opt.form * 100)
        local list = RosterSystem.GetRosterPlayers(state)
        for _, e in ipairs(list) do
            local p = LeagueCatalog.GetPlayer(e.player.id)
            if p then p.form = math.max(0, math.min(100, (tonumber(p.form) or 60) + delta)) end
        end
        table.insert(effects, "全队战意 +" .. tostring(delta))
    end
    RivalrySystem.AddArc(state, teamId, "feud")
    -- 对手回怼
    local reply = nil
    if opt.aiReply and math.random() < opt.aiReply then
        RivalrySystem.AddScore(state, teamId, 1, name .. " 回怼，战火升级")
        reply = name .. " 回怼：「场下嘴硬，场上见真章。」宿敌值 +1。"
        CompanyState.RecordTimeline(state, "口水战升级", "你与 " .. name .. " 的恩怨在社媒上愈演愈烈。")
    end
    return {
        ok = true,
        text = "你向 " .. name .. " 发动了「" .. opt.label .. "」",
        effects = effects,
        reply = reply,
    }
end

--- 挖角战：尝试从自由市场签下球星，并归因为对宿敌势力的挖角
function RivalrySystem.TryPoach(state, teamId, playerId)
    state = RivalrySystem.Ensure(state)
    local MarketSystem = require("MarketSystem")
    local LeagueCatalog = require("LeagueCatalog")
    local name = teamNameOf(state, teamId)
    local player = LeagueCatalog.GetPlayer(playerId)
    -- 先尝试强签首发；首发满员时回退签入替补席，避免挖角永远失败（见体检报告 A2）
    local ok, res = MarketSystem.SignPlayer(state, playerId, "premium")
    if not ok then
        local ok2, res2 = pcall(function() return MarketSystem.SignToBench(state, playerId, "premium") end)
        if ok2 and res2 then ok, res = true, res2 end
    end
    if ok and res and res.player then
        -- 仅当该自由球员确实源自宿敌阵营时才归因为"挖角"，否则中性表述（避免叙事失真）
        local fromRival = player and (player.teamId == teamId or player.prevTeam == teamId)
        local srcText = fromRival and ("从 " .. name .. " 阵营挖来 ") or ("从自由市场签下 ")
        RivalrySystem.AddScore(state, teamId, 3, srcText .. (res.player and res.player.name or "球星"))
        RivalrySystem.AddArc(state, teamId, "poaching_war")
        CompanyState.RecordTimeline(state, "挖角成功",
            srcText .. (res.player and res.player.name or "一名球星") .. "，与 " .. name .. " 的恩怨升级。")
        return { ok = true, text = "挖角成功！" .. (res.player and res.player.name or "球星") .. " 加盟，与 " .. name .. " 的梁子结大了。", cost = res.cost }
    else
        RivalrySystem.AddScore(state, teamId, 2, "挖角 " .. name .. " 失败反被嘲")
        RivalrySystem.AddArc(state, teamId, "poaching_war")
        CompanyState.RecordTimeline(state, "挖角失败", "你试图挖角 " .. name .. " 阵营失利，反被对方嘲讽。")
        return { ok = false, text = "挖角失败：" .. tostring(res) .. "（" .. name .. " 阵营看笑话）" }
    end
end

--- 恩怨局战意加成文案（供 UI 展示；实际胜负奖励在 CompetitionSystem 结算）
function RivalrySystem.GetGrudgeBonusText(state, teamId)
    local lvl = RivalrySystem.GetLevel(state, teamId)
    if lvl <= 0 then return "常规战，无额外加成" end
    return "全队战意 +" .. tostring(4 + 3 * lvl) .. "%（恩怨局）"
end

return RivalrySystem