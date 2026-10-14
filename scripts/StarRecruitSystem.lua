-- StarRecruitSystem （#48B 明星多步招募）
-- 招牌签约事件：问答 → 凭证 → 击败宿敌 → 谈判 → 签约/交换选手
-- 复用 RivalrySystem（嘴炮 + 击败判定）与 NegotiationSystem（谈判 → 签约单一真相源）
-- 设计文档：TRANSFER_EXPANSION.md 2.4 / 明星多步招募

local CompanyState = require("CompanyState")
local LeagueCatalog = require("LeagueCatalog")

local StarRecruitSystem = {}

local function clamp(value, minimum, maximum)
    value = tonumber(value) or 0
    if value < minimum then return minimum end
    if value > maximum then return maximum end
    return value
end

-- 公关造势（Proposal A）：花现金主动涨声望，用于跨过第2步声望门槛
local PUBLICITY_COST = 150          -- 万
local PUBLICITY_REP = 8             -- 声望基础增益
local PUBLICITY_COOLDOWN = 2        -- 周（冷却）
local PUBLICITY_COUNTER_CHANCE = 0.2-- 遭对手反公关概率
local PUBLICITY_COUNTER_PENALTY = 2 -- 反公关时声望扣减

-- 五步流程定义（UI 进度条用）
local STEPS = {
    { id = 1, key = "qa",         label = "问答 愿景问答" },
    { id = 2, key = "credential", label = "凭证 签约凭证" },
    { id = 3, key = "rival",      label = "宿敌 击败宿敌" },
    { id = 4, key = "negotiate",  label = "谈判 正式谈判" },
    { id = 5, key = "sign",       label = "签约 签约/交换" },
}

function StarRecruitSystem.GetSteps()
    return STEPS
end

-- 问答题目（俱乐部愿景），答案写入 sr.qa 影响后续叙事文案
local QA_QUESTIONS = {
    { id = "vision", q = "你想打造怎样的俱乐部？", opts = {
        { value = "glory",  label = "争冠王朝", desc = "追求冠军与统治力" },
        { value = "family", label = "兄弟战队", desc = "重视更衣室氛围" },
        { value = "business", label = "商业帝国", desc = "品牌与商业化优先" },
    }},
    { id = "focus", q = "招牌选手最看重什么？", opts = {
        { value = "trophy", label = "冠军前景", desc = "能否随队夺冠" },
        { value = "role",   label = "核心地位", desc = "是否为战术核心" },
        { value = "city",   label = "城市情怀", desc = "主场氛围与粉丝" },
    }},
}

function StarRecruitSystem.GetQAQuestions()
    return QA_QUESTIONS
end

function StarRecruitSystem.IsActive(state)
    state = CompanyState.Ensure(state)
    return state.starRecruit and state.starRecruit.active == true
end

function StarRecruitSystem.Get(state)
    state = CompanyState.Ensure(state)
    return state.starRecruit or {}
end

function StarRecruitSystem.GetTargetPlayer(state)
    state = CompanyState.Ensure(state)
    local sr = state.starRecruit
    if not sr or not sr.targetId then return nil end
    return LeagueCatalog.GetPlayer(sr.targetId)
end

-- 当前处于第几步（无招募返回 0）
function StarRecruitSystem.GetStep(state)
    state = CompanyState.Ensure(state)
    return (state.starRecruit and state.starRecruit.active) and (state.starRecruit.step or 0) or 0
end

local function ownedPlayerId(state, playerId)
    for _, pid in pairs(state.roster.players) do
        if pid == playerId then return true end
    end
    for _, pid in pairs(state.roster.bench or {}) do
        if pid and pid ~= "" and pid == playerId then return true end
    end
    return false
end

-- 启动明星多步招募：生成 SSR 自由人作为招牌目标，并指定需击败的宿敌
function StarRecruitSystem.Start(state)
    state = CompanyState.Ensure(state)
    if state.starRecruit and state.starRecruit.active then
        return false, "已有进行中的明星招募"
    end
    local MarketSystem = require("MarketSystem")
    local player = MarketSystem.SpawnMarqueeFreeAgent(state, { potential = 90 + math.random(0, 5) })
    if not player then return false, "无法生成招牌选手" end
    -- 优先指定现有宿敌，否则临时指定一支强队
    local RivalrySystem = require("RivalrySystem")
    local rivalTeamId = nil
    local rivalries = RivalrySystem.GetRivalries(state)
    if #rivalries > 0 then
        rivalTeamId = rivalries[1].teamId
    else
        local others = {}
        for _, t in ipairs(LeagueCatalog.TEAMS) do
            if t.id ~= "legacy" then table.insert(others, t) end
        end
        if #others > 0 then rivalTeamId = others[math.random(#others)].id end
    end
    state.starRecruit = {
        active = true,
        step = 1,
        targetId = player.id,
        rivalTeamId = rivalTeamId,
        rivalWinsAtStart = 0,
        qa = {},
        credGranted = false,
        rivalDefeated = false,
        negId = nil,
        startedWeek = tonumber(state.company.week) or 1,
    }
    CompanyState.RecordTimeline(state, " 明星招募启动",
        "你瞄准招牌选手 " .. player.name .. "，开启多步签约流程：问答 → 凭证 → 击败宿敌 → 谈判 → 签约。")
    return true, player
end

-- 第 1 步：完成愿景问答 → 进入第 2 步
function StarRecruitSystem.CompleteQA(state, answers)
    state = CompanyState.Ensure(state)
    local sr = state.starRecruit
    if not sr or not sr.active then return false, "无进行中的招募" end
    if sr.step ~= 1 then return false, "问答阶段已结束" end
    answers = answers or {}
    if not answers.vision or not answers.focus then
        return false, "请先完成两道愿景问答"
    end
    sr.qa = { vision = answers.vision, focus = answers.focus }
    sr.step = 2
    -- 愿景清晰带来更衣室小幅士气提升
    local RosterSystem = require("RosterSystem")
    for _, entry in ipairs(RosterSystem.GetRosterPlayers(state)) do
        local p = LeagueCatalog.GetPlayer(entry.player.id)
        if p then p.morale = math.min(100, (tonumber(p.morale) or 60) + 3) end
    end
    CompanyState.RecordTimeline(state, "愿景对齐",
        "你明确了招牌签约的俱乐部愿景，全队士气小幅提升，接触招牌选手的底气更足。")
    return true
end

-- 第 2 步：申请签约凭证（声望门槛，随评级上升）→ 进入第 3 步
function StarRecruitSystem.GrantCredential(state)
    state = CompanyState.Ensure(state)
    local sr = state.starRecruit
    if not sr or not sr.active then return false, "无进行中的招募" end
    if sr.step ~= 2 then return false, "已进入后续阶段" end
    local TierSystem = require("TierSystem")
    local idx = tonumber(TierSystem.GetTierIndex(state)) or 1
    local need = 30 + idx * 8
    if (tonumber(state.company.reputation) or 0) < need then
        return false, "声望不足（需 ≥" .. tostring(need) .. "），先提升俱乐部声望"
    end
    sr.credGranted = true
    sr.step = 3
    -- 记录击败判定基线
    local RivalrySystem = require("RivalrySystem")
    local r = state.rivalries[sr.rivalTeamId]
    sr.rivalWinsAtStart = r and (tonumber(r.winsVs) or 0) or 0
    local rivalName = "指定宿敌"
    if sr.rivalTeamId then
        local t = LeagueCatalog.GetTeam(sr.rivalTeamId) or LeagueCatalog.GetAcademyTeam(sr.rivalTeamId) or LeagueCatalog.GetRegionTeam(sr.rivalTeamId)
        rivalName = t and t.name or sr.rivalTeamId
    end
    CompanyState.RecordTimeline(state, "签约凭证获批",
        "凭借声望 " .. tostring(state.company.reputation) .. " 获得招牌签约凭证，需在正式接触前击败 " .. rivalName .. "。")
    return true, rivalName
end

-- 第 2 步辅助：公关造势（Proposal A）
-- 花现金主动涨声望，跨越第2步声望门槛；2 周冷却，小概率遭对手反公关使效果打折
function StarRecruitSystem.Publicity(state)
    state = CompanyState.Ensure(state)
    local sr = state.starRecruit
    if not sr or not sr.active then return false, "当前没有进行中的明星招募" end
    if state.company.cash == nil or state.company.cash < PUBLICITY_COST then
        return false, "现金不足（需 ¥" .. tostring(PUBLICITY_COST) .. "万）"
    end
    local nowWeek = tonumber(state.company.week) or 1
    if sr.publicityWeek and (nowWeek - sr.publicityWeek) < PUBLICITY_COOLDOWN then
        local wait = PUBLICITY_COOLDOWN - (nowWeek - sr.publicityWeek)
        return false, "公关造势冷却中，还需 " .. tostring(wait) .. " 周"
    end
    state.company.cash = state.company.cash - PUBLICITY_COST
    sr.publicityWeek = nowWeek
    local before = tonumber(state.company.reputation) or 0
    local gain = PUBLICITY_REP
    local counter = math.random() < PUBLICITY_COUNTER_CHANCE
    if counter then gain = gain - PUBLICITY_COUNTER_PENALTY end
    state.company.reputation = clamp(before + gain, 0, 100)
    local realGain = state.company.reputation - before
    CompanyState.RecordTimeline(state, "公关造势",
        "斥资 ¥" .. tostring(PUBLICITY_COST) .. "万 发起公关造势，声望 " .. tostring(before) .. " → " .. tostring(state.company.reputation) ..
        (counter and "（遭对手反公关，效果打折）" or ""))
    local msg = "公关造势成功，声望 " .. (realGain >= 0 and "+" or "") .. tostring(realGain) ..
        (counter and "（对手反公关，效果打折）" or "")
    return true, msg
end

-- 第 3 步辅助：向宿敌宣战（嘴炮，制造恩怨局加成）
function StarRecruitSystem.TrashTalkRival(state, optionId)
    state = CompanyState.Ensure(state)
    local sr = state.starRecruit
    if not sr or not sr.active then return { ok = false, text = "无进行中的招募" } end
    if sr.step ~= 3 then return { ok = false, text = "当前不在击败宿敌阶段" } end
    if not sr.rivalTeamId then return { ok = false, text = "未指定宿敌" } end
    local RivalrySystem = require("RivalrySystem")
    return RivalrySystem.TrashTalk(state, sr.rivalTeamId, optionId or "dominant")
end

-- 第 3 步推进：检测是否已击败指定宿敌（winsVs 增长）
function StarRecruitSystem.CheckRivalDefeated(state)
    state = CompanyState.Ensure(state)
    local sr = state.starRecruit
    if not sr or not sr.active or sr.step ~= 3 then return false end
    if sr.rivalDefeated then return true end
    local RivalrySystem = require("RivalrySystem")
    local r = state.rivalries[sr.rivalTeamId]
    if r and (tonumber(r.winsVs) or 0) > (tonumber(sr.rivalWinsAtStart) or 0) then
        sr.rivalDefeated = true
        sr.step = 4
        local name = "宿敌"
        if sr.rivalTeamId then
            local t = LeagueCatalog.GetTeam(sr.rivalTeamId) or LeagueCatalog.GetAcademyTeam(sr.rivalTeamId) or LeagueCatalog.GetRegionTeam(sr.rivalTeamId)
            name = t and t.name or sr.rivalTeamId
        end
        CompanyState.RecordTimeline(state, "击败宿敌",
            "你在与 " .. name .. " 的对局中取胜，满足招牌签约的「击败宿敌」条件，可开启正式谈判。")
        return true
    end
    return false
end

-- 第 4 步：开启正式谈判（NegotiationSystem 单一真相源）
function StarRecruitSystem.StartNegotiation(state)
    state = CompanyState.Ensure(state)
    local sr = state.starRecruit
    if not sr or not sr.active then return false, "无进行中的招募" end
    if sr.step ~= 4 then return false, "需先获得签约凭证并击败宿敌" end
    local NegotiationSystem = require("NegotiationSystem")
    if sr.negId and NegotiationSystem.Get(state, sr.negId) then
        return NegotiationSystem.Get(state, sr.negId), "谈判进行中"
    end
    local neg, err = NegotiationSystem.StartNegotiation(state, sr.targetId)
    if not neg then return false, err or "无法开启谈判" end
    sr.negId = neg.id
    return neg
end

-- 第 5 步（A）：口头协议达成后正式签约
function StarRecruitSystem.Sign(state)
    state = CompanyState.Ensure(state)
    local sr = state.starRecruit
    if not sr or not sr.active then return false, "无进行中的招募" end
    if sr.step ~= 4 then return false, "需先完成正式谈判" end
    if not sr.negId then return false, "尚未开启谈判" end
    local NegotiationSystem = require("NegotiationSystem")
    local neg = NegotiationSystem.Get(state, sr.negId)
    if not neg then return false, "谈判记录丢失" end
    if neg.stage ~= "verbal" then return false, "谈判尚未达成口头协议" end
    local ok, message = NegotiationSystem.Conclude(state, sr.negId)
    if not ok then return false, message end
    sr.step = 5
    sr.active = false
    local player = LeagueCatalog.GetPlayer(sr.targetId)
    CompanyState.RecordTimeline(state, " 招牌签约达成",
        (player and player.name or "招牌选手") .. " 正式加盟，明星多步招募圆满完成！")
    -- P2-⑤ 签约巨星触发媒体发布会
    local PressSystem = require("PressSystem")
    PressSystem.Trigger(state, "signStar", " 重磅签约：" .. (player and player.name or "招牌选手") .. " 加盟！")
    return true, message
end

-- 第 5 步（B）：交换签约——送走一名同位置首发 + 支付现金，换招牌选手加盟
function StarRecruitSystem.TradeSign(state, givePlayerId, fee)
    state = CompanyState.Ensure(state)
    local sr = state.starRecruit
    if not sr or not sr.active then return false, "无进行中的招募" end
    if sr.step ~= 4 then return false, "需先完成正式谈判" end
    local LeagueCatalog = require("LeagueCatalog")
    local MarketSystem = require("MarketSystem")
    local give = LeagueCatalog.GetPlayer(givePlayerId)
    local target = LeagueCatalog.GetPlayer(sr.targetId)
    if not give or not target then return false, "交换选手或招牌选手不存在" end
    if give.role ~= target.role then return false, "交换需送走同位置选手以腾出名额" end
    if not ownedPlayerId(state, givePlayerId) then return false, "该交换选手不在阵中" end
    fee = tonumber(fee) or 0
    if state.company.cash < fee then return false, "现金不足，无法支付交易费" end
    -- 工资帽预检：去掉 give、加上 target 后不得超限
    local capInfo = MarketSystem.GetCapInfo(state)
    local projected = capInfo.payroll - (tonumber(give.salary) or 0) + (tonumber(target.salary) or 0)
    if projected > capInfo.cap then
        return false, "工资帽超限，无法交换签约（卖出/解约腾出空间）"
    end
    -- 备份 give 的阵容归属，失败可回滚
    local giveRole = nil
    for role, pid in pairs(state.roster.players) do
        if pid == givePlayerId then giveRole = role break end
    end
    if not giveRole then return false, "找不到交换选手的位置" end
    local savedContract = state.roster.contracts[givePlayerId]
    local savedBuyout = state.roster.buyouts and state.roster.buyouts[givePlayerId]
    local savedDesire = state.roster.desire and state.roster.desire[givePlayerId]
    local savedSat = state.roster.satisfaction and state.roster.satisfaction[givePlayerId]
    -- 暂时移出 give，腾出同位置名额
    state.roster.players[giveRole] = ""
    state.roster.contracts[givePlayerId] = nil
    if state.roster.buyouts then state.roster.buyouts[givePlayerId] = nil end
    if state.roster.desire then state.roster.desire[givePlayerId] = nil end
    if state.roster.satisfaction then state.roster.satisfaction[givePlayerId] = nil end
    if state.roster.breach then state.roster.breach[givePlayerId] = nil end
    state.company.cash = state.company.cash - fee
    local ok, message = MarketSystem.SignPlayer(state, sr.targetId, "asking", { bypassGate = true, years = 2 })
    if not ok then
        -- 回滚 give
        state.roster.players[giveRole] = givePlayerId
        state.roster.contracts[givePlayerId] = savedContract
        if savedBuyout ~= nil then state.roster.buyouts[givePlayerId] = savedBuyout end
        if savedDesire ~= nil then state.roster.desire[givePlayerId] = savedDesire end
        if savedSat ~= nil then state.roster.satisfaction[givePlayerId] = savedSat end
        return false, message
    end
    sr.step = 5
    sr.active = false
    CompanyState.RecordTimeline(state, " 招牌交易签约",
        give.name .. " 被送往他队，换来招牌选手 " .. target.name .. "（交易费 ¥" .. tostring(fee) .. "万）。")
    return true, message
end

-- 放弃招募（保留已生成的招牌自由人，仅清空进行中状态）
function StarRecruitSystem.Abandon(state)
    state = CompanyState.Ensure(state)
    if not state.starRecruit or not state.starRecruit.active then return false, "当前没有进行中的招募" end
    state.starRecruit.active = false
    CompanyState.RecordTimeline(state, "明星招募中止", "你中止了进行中的明星多步招募。")
    return true
end

-- 同步完成态：若第 4 步时招牌选手已归属本队（经谈判页或本页签约），自动收尾
function StarRecruitSystem.SyncComplete(state)
    state = CompanyState.Ensure(state)
    local sr = state.starRecruit
    if not sr or not sr.active or sr.step ~= 4 then return false end
    local target = LeagueCatalog.GetPlayer(sr.targetId)
    if target and ownedPlayerId(state, sr.targetId) then
        sr.step = 5
        sr.active = false
        CompanyState.RecordTimeline(state, " 招牌签约达成",
            (target.name or "招牌选手") .. " 正式加盟，明星多步招募圆满完成！")
        return true
    end
    return false
end

-- 周结算钩子：推进「击败宿敌」判定（第 3 步）+ 同步完成态（第 4 步）
function StarRecruitSystem.ProcessWeek(state)
    state = CompanyState.Ensure(state)
    local sr = state.starRecruit
    if not sr or not sr.active then return end
    if sr.step == 3 then
        StarRecruitSystem.CheckRivalDefeated(state)
    elseif sr.step == 4 then
        StarRecruitSystem.SyncComplete(state)
    end
end

return StarRecruitSystem
