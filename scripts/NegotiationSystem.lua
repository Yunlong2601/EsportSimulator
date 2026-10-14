-- NegotiationSystem （#47 转会谈判深化）
-- 双线谈判状态机 + 截胡 + 委托总监 + 合同满意度/违约金
-- 设计文档：TRANSFER_EXPANSION.md 2.2 / 2.3
-- 原则：谈判只负责"谈"，最终签约仍走 MarketSystem.SignPlayer（单一真相源）。

local NegotiationSystem = {}

local CompanyState = require("CompanyState")

local function clamp(v, a, b)
    if v < a then return a end
    if v > b then return b end
    return v
end

local function isOwned(state, playerId)
    for _, pid in pairs(state.roster.players or {}) do
        if pid == playerId then return true end
    end
    for _, pid in pairs(state.roster.bench or {}) do
        if pid and pid ~= "" and pid == playerId then return true end
    end
    return false
end

-- 取单个谈判
function NegotiationSystem.Get(state, negId)
    state = CompanyState.Ensure(state)
    state.negotiations = state.negotiations or {}
    for _, n in ipairs(state.negotiations) do
        if n.id == tonumber(negId) then return n end
    end
    return nil
end

function NegotiationSystem.GetActive(state)
    state = CompanyState.Ensure(state)
    state.negotiations = state.negotiations or {}
    local active = {}
    for _, n in ipairs(state.negotiations) do
        if n.stage == "negotiating" or n.stage == "verbal" then
            table.insert(active, n)
        end
    end
    return active
end

function NegotiationSystem.GetForPlayer(state, playerId)
    state = CompanyState.Ensure(state)
    state.negotiations = state.negotiations or {}
    for _, n in ipairs(state.negotiations) do
        if n.playerId == playerId and (n.stage == "negotiating" or n.stage == "verbal") then
            return n
        end
    end
    return nil
end

-- 需求档位：战力 + 人格野心推导选手对角色/待遇的期望
function NegotiationSystem.GetDemand(state, playerId)
    state = CompanyState.Ensure(state)
    local LeagueCatalog = require("LeagueCatalog")
    local RosterSystem = require("RosterSystem")
    local player = LeagueCatalog.GetPlayer(playerId)
    if not player then return { wantStarter = true, salaryTier = 1, ambition = 50, power = 0 } end
    local power = RosterSystem.GetPlayerPower(player, state.meta and state.meta.role)
    local PlayerEcoSystem = require("PlayerEcoSystem")
    local eco = PlayerEcoSystem.GetEco(state, playerId)
    local ambition = (eco and eco.personality and eco.personality.ambition) or 50
    local wantStarter = (tonumber(power) >= 76) or (tonumber(ambition) >= 70)
    local salaryTier = power >= 82 and 3 or (power >= 74 and 2 or 1)
    return { wantStarter = wantStarter, salaryTier = salaryTier, ambition = ambition, power = power }
end

-- 违约金金额（相对市值 / 已设买断条款减半）
function NegotiationSystem.GetBreachPenalty(state, playerId)
    state = CompanyState.Ensure(state)
    local MarketSystem = require("MarketSystem")
    local mv = MarketSystem.GetMarketValue(state, playerId)
    local buyout = MarketSystem.GetBuyout(state, playerId)
    if buyout and buyout.amount then return math.max(1, math.floor(buyout.amount * 0.5 + 0.5)) end
    return math.max(1, math.floor(mv * 0.3 + 0.5))
end

-- 启动谈判（免费，仅开启接触）
function NegotiationSystem.StartNegotiation(state, playerId, opts)
    state = CompanyState.Ensure(state)
    opts = opts or {}
    local LeagueCatalog = require("LeagueCatalog")
    local MarketSystem = require("MarketSystem")
    local player = LeagueCatalog.GetPlayer(playerId)
    if not player then return nil, "选手不存在" end
    if isOwned(state, playerId) then return nil, "该选手已在阵中" end
    if NegotiationSystem.GetForPlayer(state, playerId) then
        return NegotiationSystem.GetForPlayer(state, playerId), "已有进行中的谈判"
    end
    local advice = MarketSystem.GetAgentAdvice(state, player)
    if advice.refused then return nil, "经纪人暂不接受谈判（冷却中）" end
    local asking = math.max(1, math.floor(advice.asking))
    local floor = math.max(1, math.floor(asking * 0.8 + 0.5))
    local maxRounds = ((advice.blocked) or (asking >= 300)) and 4 or 3
    -- 截胡风险：战力/潜力/状态/传闻越高越抢手
    local TransferNewsSystem = require("TransferNewsSystem")
    local rumored = TransferNewsSystem.HasRumorForPlayer(state, playerId)
    local risk = 0.05
        + ((tonumber(player.potential) or 0) >= 85 and 0.10 or 0)
        + ((tonumber(player.form) or 0) >= 80 and 0.05 or 0)
        + (rumored and 0.10 or 0)
    risk = clamp(risk, 0.02, 0.45)
    local starterOccupied = state.roster.players[player.role] and state.roster.players[player.role] ~= ""
    local role = opts.role or (starterOccupied and "bench" or "starter")
    state.negotiations = state.negotiations or {}
    state.nextNegotiationId = tonumber(state.nextNegotiationId) or 1
    local neg = {
        id = state.nextNegotiationId,
        playerId = playerId,
        stage = "negotiating",
        round = 0,
        maxRounds = maxRounds,
        asking = asking,
        current = asking,
        floor = floor,
        terms = { years = LeagueCatalog.GetContractYears(playerId), buyout = "balanced", role = role },
        daysLeft = 1 + math.random(0, 1),
        delegated = false,
        hijackRisk = risk,
        hijackBy = nil,
        final = false,
        verbalWeeks = 0,
        createdWeek = tonumber(state.company.week) or 1,
        history = { { side = "system", text = "开启转会谈判，经纪人要价 ¥" .. tostring(asking) .. "万。" } },
    }
    state.nextNegotiationId = state.nextNegotiationId + 1
    table.insert(state.negotiations, neg)
    return neg
end

-- 玩家还价（降低当前报价）
function NegotiationSystem.Counter(state, negId, pct)
    state = CompanyState.Ensure(state)
    local neg = NegotiationSystem.Get(state, negId)
    if not neg then return false, "谈判不存在" end
    if neg.stage ~= "negotiating" then return false, "当前无法还价" end
    local newCurrent = math.max(neg.floor, math.floor(neg.current * (1 - pct) + 0.5))
    neg.current = newCurrent
    neg.round = neg.round + 1
    if newCurrent <= neg.floor then
        neg.stage = "verbal"
        neg.verbalWeeks = 0
        table.insert(neg.history, { side = "you", text = "你还价至 ¥" .. tostring(newCurrent) .. "万，经纪人接受，达成口头协议。" })
    else
        table.insert(neg.history, { side = "you", text = "你还价至 ¥" .. tostring(newCurrent) .. "万，等待经纪人回应（第 " .. tostring(neg.round) .. " 轮）。" })
    end
    return true, neg
end

-- 玩家接受当前报价 → 口头协议
function NegotiationSystem.Accept(state, negId)
    state = CompanyState.Ensure(state)
    local neg = NegotiationSystem.Get(state, negId)
    if not neg then return false, "谈判不存在" end
    if neg.stage == "verbal" then return true, neg end
    if neg.stage ~= "negotiating" then return false, "谈判已结束" end
    neg.stage = "verbal"
    neg.verbalWeeks = 0
    table.insert(neg.history, { side = "you", text = "你接受当前报价 ¥" .. tostring(neg.current) .. "万，达成口头协议。" })
    return true, neg
end

-- 委托体育总监全权谈判
function NegotiationSystem.Delegate(state, negId)
    state = CompanyState.Ensure(state)
    local neg = NegotiationSystem.Get(state, negId)
    if not neg or neg.stage ~= "negotiating" then return false, "无法委托" end
    neg.delegated = true
    table.insert(neg.history, { side = "dir", text = "你委托体育总监全权谈判。" })
    return true, neg
end

-- 撤回委托（保留玩家手动谈判）
function NegotiationSystem.SetDelegated(state, negId, value)
    state = CompanyState.Ensure(state)
    local neg = NegotiationSystem.Get(state, negId)
    if not neg or neg.stage ~= "negotiating" then return false, "无法操作" end
    neg.delegated = value == true
    if not neg.delegated then
        table.insert(neg.history, { side = "you", text = "你撤回了委托，转为亲自谈判。" })
    end
    return true, neg
end

-- 放弃谈判
function NegotiationSystem.Cancel(state, negId)
    state = CompanyState.Ensure(state)
    local neg = NegotiationSystem.Get(state, negId)
    if not neg then return false, "谈判不存在" end
    if neg.stage == "signed" then return false, "已签约" end
    neg.stage = "failed"
    table.insert(neg.history, { side = "you", text = "你放弃了谈判。" })
    return true
end

-- 调整条款（签约前）
function NegotiationSystem.SetTerms(state, negId, key, value)
    state = CompanyState.Ensure(state)
    local neg = NegotiationSystem.Get(state, negId)
    if not neg then return false, "谈判不存在" end
    if neg.stage == "signed" or neg.stage == "failed" then return false, "谈判已结束" end
    neg.terms[key] = value
    return true
end

-- 达成口头协议后正式签约（走 MarketSystem.SignPlayer）
function NegotiationSystem.Conclude(state, negId, fromProposal)
    state = CompanyState.Ensure(state)
    local neg = NegotiationSystem.Get(state, negId)
    if not neg then return false, "谈判不存在" end
    if neg.stage ~= "verbal" then return false, "尚未达成口头协议" end
    if isOwned(state, neg.playerId) then return false, "该选手已被签下" end
    local MarketSystem = require("MarketSystem")
    local LeagueCatalog = require("LeagueCatalog")
    local mode = "asking"
    if neg.current < neg.asking * 0.95 then mode = "bargain"
    elseif neg.current > neg.asking * 1.05 then mode = "premium" end
    local terms = {
        years = neg.terms.years,
        buyout = neg.terms.buyout,
        role = neg.terms.role,
        bypassGate = true,
    }
    local ok, message
    if neg.terms.role == "bench" then
        ok, message = MarketSystem.SignToBench(state, neg.playerId, mode, terms)
    else
        ok, message = MarketSystem.SignPlayer(state, neg.playerId, mode, terms)
    end
    if not ok then return false, message end
    neg.stage = "signed"
    -- 初始满意度：条款契合需求则更高
    NegotiationSystem.InitSatisfaction(state, neg.playerId, neg.terms)
    table.insert(neg.history, { side = "system", text = "签约完成，合同 " .. tostring(neg.terms.years) .. " 年（" .. (LeagueCatalog.POSITIONS[neg.terms.role] or "球员") .. "）。" })
    return true, message
end

-- 初始满意度
function NegotiationSystem.InitSatisfaction(state, playerId, terms)
    state = CompanyState.Ensure(state)
    state.roster.satisfaction = state.roster.satisfaction or {}
    local demand = NegotiationSystem.GetDemand(state, playerId)
    local sat = 60
    if terms and terms.role == "starter" and demand.wantStarter then sat = sat + 10 end
    if terms and terms.role == "bench" and not demand.wantStarter then sat = sat + 5 end
    state.roster.satisfaction[playerId] = clamp(sat, 0, 100)
end

-- 违约离队（支付违约金，选手离开阵容）
function NegotiationSystem.BreachPlayer(state, playerId)
    state = CompanyState.Ensure(state)
    local breach = state.roster.breach and state.roster.breach[playerId]
    if not breach then return false, "该选手无违约意向" end
    local penalty = breach.penalty or NegotiationSystem.GetBreachPenalty(state, playerId)
    if state.company.cash < penalty then return false, "现金不足，无法支付违约金" end
    state.company.cash = state.company.cash - penalty
    -- 清理阵容（复用 SellPlayer 的释放逻辑）
    local role = nil
    for r, pid in pairs(state.roster.players) do
        if pid == playerId then role = r end
    end
    if role then
        state.roster.players[role] = ""
        state.roster.chemistry = math.max(0, (state.roster.chemistry or 0) - 5)
    end
    for s, pid in pairs(state.roster.bench or {}) do
        if pid == playerId then state.roster.bench[s] = "" end
    end
    state.roster.contracts[playerId] = nil
    state.roster.desire[playerId] = nil
    state.roster.buyouts[playerId] = nil
    state.roster.satisfaction[playerId] = nil
    state.roster.breach[playerId] = nil
    local LeagueCatalog = require("LeagueCatalog")
    local player = LeagueCatalog.GetPlayer(playerId)
    CompanyState.RecordTimeline(state, "买断解约", (player and player.name or "选手") .. " 支付违约金 ¥" .. tostring(penalty) .. "万离队。")
    return true, penalty
end

-- 每周推进：谈判轮次 + 截胡 + 口头协议反悔 + 满意度
function NegotiationSystem.ProcessWeek(state)
    state = CompanyState.Ensure(state)
    state.negotiations = state.negotiations or {}
    for _, neg in ipairs(state.negotiations) do
        if neg.stage == "negotiating" then
            -- 截胡
            if math.random() < (neg.hijackRisk or 0) then
                neg.stage = "hijacked"
                neg.hijackBy = NegotiationSystem.PickRivalClub(state)
                local LeagueCatalog = require("LeagueCatalog")
                local player = LeagueCatalog.GetPlayer(neg.playerId)
                CompanyState.RecordTimeline(state, "截胡！", (neg.hijackBy or "某俱乐部") .. " 抢先签下 " .. (player and player.name or "目标选手") .. "，你的谈判告吹。")
                table.insert(neg.history, { side = "system", text = " " .. (neg.hijackBy or "某俱乐部") .. " 截胡签下该选手，谈判失败。" })
            else
                neg.round = neg.round + 1
                neg.daysLeft = 1 + math.random(0, 1)
                if neg.delegated then
                    local target = math.floor((neg.current + neg.floor) / 2 + 0.5)
                    if target < neg.floor then target = neg.floor end
                    neg.current = target
                    if neg.current <= math.floor(neg.asking * 0.92 + 0.5) or neg.round >= neg.maxRounds then
                        neg.stage = "verbal"
                        neg.verbalWeeks = 0
                        table.insert(neg.history, { side = "dir", text = "总监谈妥口头协议 ¥" .. tostring(neg.current) .. "万。" })
                    else
                        table.insert(neg.history, { side = "dir", text = "总监推进中，当前报价 ¥" .. tostring(neg.current) .. "万（第 " .. tostring(neg.round) .. " 轮）。" })
                    end
                else
                    neg.current = math.min(neg.asking, math.floor(neg.current * (1 + 0.03 + math.random() * 0.04) + 0.5))
                    if neg.round >= neg.maxRounds then
                        neg.final = true
                        table.insert(neg.history, { side = "agent", text = "经纪人最后通牒：¥" .. tostring(neg.current) .. "万，接受或放弃。" })
                    else
                        table.insert(neg.history, { side = "agent", text = "经纪人坚持 ¥" .. tostring(neg.current) .. "万（第 " .. tostring(neg.round) .. " 轮）。" })
                    end
                end
            end
        elseif neg.stage == "verbal" then
            neg.verbalWeeks = (neg.verbalWeeks or 0) + 1
            if neg.verbalWeeks > 2 and math.random() < 0.3 then
                neg.stage = "failed"
                table.insert(neg.history, { side = "agent", text = "经纪人等不及，反悔退出谈判。" })
            end
        end
    end
    NegotiationSystem.Cleanup(state)
    NegotiationSystem.ProcessSatisfaction(state)
end

-- 清理极旧 / 已结束谈判（保留最近 12 条）
function NegotiationSystem.Cleanup(state)
    state = CompanyState.Ensure(state)
    state.negotiations = state.negotiations or {}
    if #state.negotiations <= 12 then return end
    local keep = {}
    for _, n in ipairs(state.negotiations) do
        if n.stage == "negotiating" or n.stage == "verbal" then
            table.insert(keep, n)
        end
    end
    -- 已结束的按时间保留较新者
    local ended = {}
    for _, n in ipairs(state.negotiations) do
        if n.stage ~= "negotiating" and n.stage ~= "verbal" then
            table.insert(ended, n)
        end
    end
    table.sort(ended, function(a, b) return (a.createdWeek or 0) > (b.createdWeek or 0) end)
    local room = math.max(0, 12 - #keep)
    for i = 1, math.min(room, #ended) do
        table.insert(keep, ended[i])
    end
    state.negotiations = keep
end

-- 合同满意度周推进：条款是否契合需求 → 升降；过低触发违约意向
function NegotiationSystem.ProcessSatisfaction(state)
    state = CompanyState.Ensure(state)
    state.roster.satisfaction = state.roster.satisfaction or {}
    state.roster.breach = state.roster.breach or {}
    for role, pid in pairs(state.roster.players or {}) do
        if pid and pid ~= "" then
            local demand = NegotiationSystem.GetDemand(state, pid)
            local sat = state.roster.satisfaction[pid]
            if sat == nil then
                sat = 65
                state.roster.satisfaction[pid] = sat
            end
            local onBench = false
            for _, bpid in pairs(state.roster.bench or {}) do
                if bpid == pid then onBench = true end
            end
            if demand.wantStarter and onBench then
                sat = sat - 3
            else
                sat = sat + 1
            end
            sat = clamp(sat, 0, 100)
            state.roster.satisfaction[pid] = sat
            if sat < 20 and not state.roster.breach[pid] then
                state.roster.breach[pid] = {
                    pending = true,
                    penalty = NegotiationSystem.GetBreachPenalty(state, pid),
                    sinceWeek = tonumber(state.company.week) or 1,
                }
                local LeagueCatalog = require("LeagueCatalog")
                local player = LeagueCatalog.GetPlayer(pid)
                CompanyState.RecordTimeline(state, "合约纠纷", (player and player.name or "选手") .. " 对出场/待遇不满，可能支付违约金离队。")
                local MarketSystem = require("MarketSystem")
                MarketSystem.SetDesire(state, pid, 80)
            end
        end
    end
end

-- 风味对手名
function NegotiationSystem.PickRivalClub(state)
    state = CompanyState.Ensure(state)
    local names = { "雷霆电竞", "苍穹战队", "深海之牙", "烈焰军团", "银翼俱乐部", "破晓联盟", "星陨学院", "北境王朝" }
    return names[math.random(1, #names)]
end

return NegotiationSystem
