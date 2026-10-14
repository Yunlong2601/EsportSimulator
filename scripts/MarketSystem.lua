local CompanyState = require("CompanyState")
local LeagueCatalog = require("LeagueCatalog")
local MetaSystem = require("MetaSystem")

local MarketSystem = {}

MarketSystem.LOAN_WEEKS = 4

-- 违约金档位：倍率（相对市值）与每周被激活的基础概率
MarketSystem.BUYOUT_TIERS = {
    fast = { label = "快出手", mult = 1.2, chance = 0.08 },
    balanced = { label = "标准", mult = 1.8, chance = 0.04 },
    lock = { label = "锁人", mult = 2.8, chance = 0.015 },
}

local function clamp(value, minimum, maximum)
    return math.max(minimum, math.min(maximum, tonumber(value) or minimum))
end

-- 与 RosterSystem.GetPlayerPower 公式保持一致（内联避免循环依赖）
local function powerOf(player, metaRole)
    if not player then return 0 end
    local recentForm = tonumber(player.recentForm) or 0
    return math.floor(0.35 * player.mechanics + 0.3 * player.teamfight + 0.2 * player.laning + 0.15 * player.form + 0.15 * recentForm + MetaSystem.GetRoleBonus(player, metaRole) + 0.5)
end

local function leagueMultiplier(state)
    if state.company.league == "qualifier" then return 0.55 end
    if state.company.league == "academy" then return 0.75 end
    return 1.0
end

-- 年龄曲线：18-20 岁打折（尚未成型），21-25 巅峰，26 岁后逐年下滑
local function ageFactor(age)
    age = tonumber(age) or 21
    if age <= 20 then return 0.92 end
    if age <= 25 then return 1.0 end
    if age == 26 then return 0.94 end
    if age == 27 then return 0.87 end
    if age == 28 then return 0.78 end
    if age == 29 then return 0.7 end
    return 0.6
end

-- 剩余合同：到期前一年折价，长约溢价
local function contractFactor(years)
    years = tonumber(years) or 2
    if years <= 0 then return 0.5 end
    if years == 1 then return 0.85 end
    if years == 2 then return 1.0 end
    return 1.08
end

local function ownedPlayerId(state, playerId)
    for _, pid in pairs(state.roster.players) do
        if pid == playerId then return true end
    end
    return false
end

function MarketSystem.GetPlayerAge(player)
    return tonumber(player and player.age) or 21
end

-- 公平市场价值：战力、年龄、潜力、状态、剩余合同与联赛档位共同决定
function MarketSystem.GetMarketValue(state, playerId)
    state = CompanyState.Ensure(state)
    local player = LeagueCatalog.GetPlayer(playerId)
    if not player then return 0 end
    local metaRole = state.meta and state.meta.role
    local power = powerOf(player, metaRole)
    local age = MarketSystem.GetPlayerAge(player)
    local years = tonumber(state.roster.contracts and state.roster.contracts[playerId])
    if not years then years = LeagueCatalog.GetContractYears(playerId) end
    local base = power * 3.5 + (tonumber(player.salary) or 0) * 1.5
    local potential = tonumber(player.potential) or 0
    local potentialBonus = 0
    if age <= 24 and potential > 70 then
        potentialBonus = (potential - 70) * 3
    end
    local formFactor = 1 + ((tonumber(player.form) or 70) - 70) * 0.002
    local recentFactor = 1 + (tonumber(player.recentForm) or 0) * 0.004
    local MoraleSystem = require("MoraleSystem")
    -- D2 热度联动：俱乐部社交媒体热度影响全队身价（100 热 ≈ +10%，0 热 ≈ -10%）
    local SocialSystem = require("SocialSystem")
    local heatState = SocialSystem.Ensure(state).social or {}
    local heat = tonumber(heatState.heat) or 50
    local heatFactor = 1 + (heat - 50) * 0.002
    local value = (base + potentialBonus) * ageFactor(age) * formFactor * recentFactor * contractFactor(years) * leagueMultiplier(state) * MoraleSystem.GetValueFactor(player) * heatFactor
    return math.max(0, math.floor(value + 0.5))
end

-- 签约要价：公平价值 + 经纪抽成，明星/高潜力要价更高
function MarketSystem.GetAskingPrice(state, playerId)
    state = CompanyState.Ensure(state)
    local player = LeagueCatalog.GetPlayer(playerId)
    if not player then return 0 end
    local fair = MarketSystem.GetMarketValue(state, playerId)
    local premium = 0.10
    if (tonumber(player.potential) or 0) >= 85 then premium = premium + 0.10 end
    if (tonumber(player.potential) or 0) >= 78 and MarketSystem.GetPlayerAge(player) <= 23 then premium = premium + 0.05 end
    if powerOf(player, state.meta and state.meta.role) >= 80 then premium = premium + 0.05 end
    return math.max(1, math.floor(fair * (1 + premium) + 0.5))
end

-- 快速套现：立即出手打九折，并叠加选手品牌溢价（品牌越高转会费越贵）
function MarketSystem.GetQuickSaleValue(state, playerId)
    local base = MarketSystem.GetMarketValue(state, playerId) * 0.88
    local PlayerEcoSystem = require("PlayerEcoSystem")
    return math.floor(base * PlayerEcoSystem.GetBrandPremium(state, playerId))
end

-- 行情总览：我的挂牌市场快照（挂牌总数 / 总估值 / 最高身价）
function MarketSystem.GetMarketOverview(state)
    state = CompanyState.Ensure(state)
    local listed = state.market.listed or {}
    local count, totalValue, maxValue = 0, 0, 0
    for playerId, _ in pairs(listed) do
        if ownedPlayerId(state, playerId) then
            count = count + 1
            local mv = MarketSystem.GetMarketValue(state, playerId)
            totalValue = totalValue + mv
            if mv > maxValue then maxValue = mv end
        end
    end
    return { listedCount = count, totalValue = totalValue, maxValue = maxValue }
end

-- 传闻溢价系数：被经纪人盯上的选手身价上浮 15%~25%（稳定值，按 playerId 哈希）
function MarketSystem.GetRumorPremium(state, playerId)
    local TransferNewsSystem = require("TransferNewsSystem")
    if not TransferNewsSystem.HasRumorForPlayer(state, playerId) then return 1.0 end
    local pid = tostring(playerId)
    local h = 0
    for i = 1, #pid do h = (h * 31 + pid:byte(i)) % 1000003 end
    return 1.15 + (h % 11) / 100  -- 稳定 1.15~1.25
end

-- XTV（eXchange Transfer Value）= 公平市场估值，作谈判底价参考
function MarketSystem.GetXTV(state, playerId)
    return MarketSystem.GetMarketValue(state, playerId)
end

-- 转会意愿 0-100：影响求购热度、报价溢价与续约成本；缺省惰性初始化
function MarketSystem.GetDesire(state, playerId)
    state = CompanyState.Ensure(state)
    local desire = state.roster.desire and state.roster.desire[playerId]
    if not desire then
        desire = 35 + math.random(0, 25)
        state.roster.desire[playerId] = desire
    end
    return tonumber(desire)
end

function MarketSystem.SetDesire(state, playerId, value)
    state = CompanyState.Ensure(state)
    state.roster.desire[playerId] = clamp(math.floor(tonumber(value) + 0.5), 0, 100)
    return state.roster.desire[playerId]
end

-- 意愿标签：想走 / 观望 / 忠诚
function MarketSystem.GetDesireLabel(state, playerId)
    local d = MarketSystem.GetDesire(state, playerId)
    if d >= 70 then return " 想走", "high"
    elseif d >= 45 then return " 观望", "mid"
    else return " 忠诚", "low" end
end

-- 违约金档位金额（相对当前市值）
function MarketSystem.GetBuyoutOptions(state, playerId)
    state = CompanyState.Ensure(state)
    local fair = MarketSystem.GetMarketValue(state, playerId)
    local opts = {}
    for key, tier in pairs(MarketSystem.BUYOUT_TIERS) do
        opts[key] = math.max(1, math.floor(fair * tier.mult + 0.5))
    end
    return opts
end

function MarketSystem.GetBuyout(state, playerId)
    state = CompanyState.Ensure(state)
    return state.roster.buyouts and state.roster.buyouts[playerId]
end

-- 设置/解除违约金：激活后 AI 俱乐部可绕过谈判直接买断，玩家无法拒绝
function MarketSystem.SetBuyout(state, playerId, tier)
    state = CompanyState.Ensure(state)
    local player = LeagueCatalog.GetPlayer(playerId)
    if not player then return false, "选手不存在" end
    if not ownedPlayerId(state, playerId) then return false, "该选手不在阵中" end
    if MarketSystem.IsLoaned(state, playerId) then return false, "租借中的选手无法设置违约金" end
    if tier == "clear" or tier == nil then
        state.roster.buyouts[playerId] = nil
        CompanyState.RecordTimeline(state, "违约金条款", player.name .. " 的违约金条款已解除。")
        return true, "已解除违约金"
    end
    local tierCfg = MarketSystem.BUYOUT_TIERS[tier]
    if not tierCfg then return false, "违约金档位无效" end
    local amount = math.max(1, math.floor(MarketSystem.GetMarketValue(state, playerId) * tierCfg.mult + 0.5))
    state.roster.buyouts[playerId] = { amount = amount, tier = tier }
    CompanyState.RecordTimeline(state, "违约金条款",
        player.name .. " 设置违约金 ¥" .. tostring(amount) .. "万（" .. tierCfg.label .. "档），买家可跳过谈判直接激活。")
    return true, amount
end

-- 选手要求的俱乐部声誉门槛：声望不足只能溢价强签
function MarketSystem.GetRequiredReputation(player)
    local power = powerOf(player, nil)
    local potential = tonumber(player.potential) or 0
    return clamp(math.floor(15 + (power - 60) * 0.6 + (potential - 70) * 0.3 + 0.5), 8, 85)
end

-- 经纪人评估：能否签、要价、能否压价、是否在冷却
function MarketSystem.GetAgentAdvice(state, player)
    state = CompanyState.Ensure(state)
    local requiredRep = MarketSystem.GetRequiredReputation(player)
    local asking = MarketSystem.GetAskingPrice(state, player.id)
    local rep = tonumber(state.company.reputation) or 0
    local blocked = rep < requiredRep
    local refused = false
    local refusedEntry = state.market.refused and state.market.refused[player.id]
    if refusedEntry and tonumber(refusedEntry.untilWeek) >= tonumber(state.company.week) then
        refused = true
    end
    local bargainCost = math.floor(asking * 0.85 + 0.5)
    local premiumCost = math.floor(asking * 1.3 + 0.5)
    local text
    if refused then
        text = "经纪人表示上次谈判破裂，本周不再接洽。"
    elseif blocked then
        text = "经纪人要求声誉 ≥ " .. tostring(requiredRep) .. "（当前 " .. tostring(rep) .. "），只接受溢价签约。"
    else
        text = "经纪人报价 ¥" .. tostring(asking) .. "万，可压价至 ¥" .. tostring(bargainCost) .. "万（有谈崩风险）。"
    end
    return {
        requiredRep = requiredRep,
        blocked = blocked,
        refused = refused,
        asking = asking,
        bargainCost = bargainCost,
        premiumCost = premiumCost,
        text = text,
    }
end

-- 签约：asking 按价 / bargain 压价 / premium 溢价强签
-- terms（可选）：{ years, buyout, role, bypassGate } —— 谈判决赛签约时传入
function MarketSystem.SignPlayer(state, playerId, mode, terms)
    state = CompanyState.Ensure(state)
    mode = mode or "asking"
    terms = terms or {}
    local player = LeagueCatalog.GetPlayer(playerId)
    if not player then return false, "选手不存在" end
    if ownedPlayerId(state, playerId) then return false, "该选手已在阵中" end
    local occupied = state.roster.players[player.role]
    if occupied and occupied ~= "" then return false, "该位置已有选手，请先卖出或挂牌" end
    local advice = MarketSystem.GetAgentAdvice(state, player)
    if not (terms and terms.bypassGate) and advice.refused then return false, "经纪人暂不接受谈判" end
    local cost
    if mode == "bargain" then
        if advice.blocked then return false, "声誉不足，无法压价谈判" end
        cost = advice.bargainCost
    elseif mode == "premium" then
        cost = advice.premiumCost
    else
        if advice.blocked then return false, "经纪人要求溢价签约" end
        cost = advice.asking
    end
    if state.company.cash < cost then return false, "现金不足，无法支付签约费" end
    if mode == "bargain" and math.random() < 0.35 then
        state.market.refused[playerId] = { untilWeek = tonumber(state.company.week) + 1 }
        CompanyState.RecordTimeline(state, "谈判破裂", player.name .. " 的经纪人对压价不满，短期不再接洽。")
        return false, "谈判破裂，经纪人短期内不再接洽"
    end
    -- 工资帽：签约后总周薪不得超过上限（倒逼年轻化）
    do
        local capInfo = MarketSystem.GetCapInfo(state)
        local newSalary = tonumber(player.salary) or 0
        if capInfo.payroll + newSalary > capInfo.cap then
            return false, "工资帽超限：当前周薪 " .. tostring(capInfo.payroll) .. "/" .. tostring(capInfo.cap) .. "万，无法签周薪 " .. tostring(newSalary) .. "万的选手（卖出/解约腾空间）"
        end
    end
    state.company.cash = state.company.cash - cost
    state.roster.players[player.role] = playerId
    state.roster.contracts[playerId] = tonumber(terms.years) or LeagueCatalog.GetContractYears(playerId)
    state.roster.desire[playerId] = 15 + math.random(0, 15)
    if terms.buyout then
        MarketSystem.SetBuyout(state, playerId, terms.buyout)
    else
        state.roster.buyouts[playerId] = nil
    end
    player.morale = tonumber(player.morale) or 60
    state.roster.chemistry = math.max(0, state.roster.chemistry - 10)
    state.market.refused[playerId] = nil
    local NegotiationSystem = require("NegotiationSystem")
    NegotiationSystem.InitSatisfaction(state, playerId, terms)
    CompanyState.RecordTimeline(state, "签约新选手", player.name .. " 以 ¥" .. tostring(cost) .. "万 加盟，战队化学略有波动。")
    return true, { player = player, cost = cost }
end

-- 签入替补席：位置已满时把选手签为替补（最多 2 人），等待轮换机会
function MarketSystem.SignToBench(state, playerId, mode, terms)
    state = CompanyState.Ensure(state)
    mode = mode or "asking"
    terms = terms or {}
    local player = LeagueCatalog.GetPlayer(playerId)
    if not player then return false, "选手不存在" end
    local benchSlot = nil
    for slot, pid in pairs(state.roster.bench) do
        if pid == playerId then return false, "该选手已在替补席" end
        if not pid or pid == "" then benchSlot = benchSlot or slot end
    end
    if ownedPlayerId(state, playerId) then return false, "该选手已在阵中" end
    if not benchSlot then return false, "替补席已满（2 人），请先调整阵容" end
    local advice = MarketSystem.GetAgentAdvice(state, player)
    if not (terms and terms.bypassGate) and advice.refused then return false, "经纪人暂不接受谈判" end
    local cost
    if mode == "bargain" then
        if advice.blocked then return false, "声誉不足，无法压价谈判" end
        cost = advice.bargainCost
    elseif mode == "premium" then
        cost = advice.premiumCost
    else
        if advice.blocked then return false, "经纪人要求溢价签约" end
        cost = advice.asking
    end
    if state.company.cash < cost then return false, "现金不足，无法支付签约费" end
    if mode == "bargain" and math.random() < 0.35 then
        state.market.refused[playerId] = { untilWeek = tonumber(state.company.week) + 1 }
        CompanyState.RecordTimeline(state, "谈判破裂", player.name .. " 的经纪人对压价不满，短期不再接洽。")
        return false, "谈判破裂，经纪人短期内不再接洽"
    end
    -- 工资帽：签约后总周薪不得超过上限（倒逼年轻化）
    do
        local capInfo = MarketSystem.GetCapInfo(state)
        local newSalary = tonumber(player.salary) or 0
        if capInfo.payroll + newSalary > capInfo.cap then
            return false, "工资帽超限：当前周薪 " .. tostring(capInfo.payroll) .. "/" .. tostring(capInfo.cap) .. "万，无法签周薪 " .. tostring(newSalary) .. "万的选手（卖出/解约腾空间）"
        end
    end
    state.company.cash = state.company.cash - cost
    state.roster.bench[benchSlot] = playerId
    state.roster.contracts[playerId] = tonumber(terms.years) or LeagueCatalog.GetContractYears(playerId)
    state.roster.desire[playerId] = 15 + math.random(0, 15)
    if terms.buyout then
        MarketSystem.SetBuyout(state, playerId, terms.buyout)
    else
        state.roster.buyouts[playerId] = nil
    end
    player.morale = tonumber(player.morale) or 60
    state.roster.chemistry = math.max(0, state.roster.chemistry - 8)
    state.market.refused[playerId] = nil
    local NegotiationSystem = require("NegotiationSystem")
    NegotiationSystem.InitSatisfaction(state, playerId, terms)
    CompanyState.RecordTimeline(state, "签约替补", player.name .. " 以 ¥" .. tostring(cost) .. "万 加盟替补席，等待上场机会。")
    return true, { player = player, cost = cost }
end

-- 挂牌出售
function MarketSystem.ListPlayer(state, playerId)
    state = CompanyState.Ensure(state)
    if not MarketSystem.IsTransferWindow(state) then return false, "转会窗已关闭：休市期无法挂牌，可租借或外租" end
    if not ownedPlayerId(state, playerId) then return false, "该选手不在阵中" end
    if MarketSystem.IsLoaned(state, playerId) then return false, "租借中的选手无法挂牌" end
    if state.market.listed[playerId] then return false, "该选手已在挂牌中" end
    local player = LeagueCatalog.GetPlayer(playerId)
    state.market.listed[playerId] = {
        asking = MarketSystem.GetAskingPrice(state, playerId),
        sinceWeek = tonumber(state.company.week) or 1,
    }
    local warStarted = MarketSystem.TryStartWar(state, playerId)
    if warStarted then
        -- 竞价战专属记录在 TryStartWar 内
    else
        CompanyState.RecordTimeline(state, "挂牌出售", (player and player.name or "选手") .. " 挂牌上市，等待俱乐部报价。")
    end
    return true, state.market.listed[playerId]
end

function MarketSystem.UnlistPlayer(state, playerId)
    state = CompanyState.Ensure(state)
    if not state.market.listed[playerId] then return false, "该选手未挂牌" end
    state.market.listed[playerId] = nil
    state.market.wars[playerId] = nil
    return true
end

-- 挂牌热门度：战力/潜力/状态综合打分，≥2 触发竞价战
function MarketSystem.GetWarInterest(state, player)
    state = CompanyState.Ensure(state)
    local power = powerOf(player, state.meta and state.meta.role)
    local potential = tonumber(player and player.potential) or 0
    local score = 0
    if power >= 78 then score = score + 2 elseif power >= 72 then score = score + 1 end
    if potential >= 85 then score = score + 2 elseif potential >= 80 then score = score + 1 end
    if tonumber(player and player.recentForm) >= 6 then score = score + 1 end
    if tonumber(player and player.form) >= 80 then score = score + 1 end
    -- D2 热度联动：处于转会传闻中的选手更可能引发竞价战
    local TransferNewsSystem = require("TransferNewsSystem")
    if TransferNewsSystem.HasRumorForPlayer(state, player.id) then score = score + 1 end
    return score
end

-- 挂牌热门选手：2-4 家 AI 俱乐部进场竞价，多轮抬价
function MarketSystem.TryStartWar(state, playerId)
    state = CompanyState.Ensure(state)
    if state.market.wars[playerId] then return true, state.market.wars[playerId] end
    local player = LeagueCatalog.GetPlayer(playerId)
    if not player then return false, "选手不存在" end
    local interest = MarketSystem.GetWarInterest(state, player)
    if interest < 2 then return false, "关注度不足，进入常规挂牌流程" end
    local fair = MarketSystem.GetMarketValue(state, playerId)
    if fair <= 0 then return false, "身价评估异常" end
    local clubCount = 2 + math.min(2, interest - 2)
    local TierSystem = require("TierSystem")
    local tierIndex = TierSystem.GetTierIndex(state)
    local used = {}
    local clubs = {}
    for _ = 1, clubCount do
        local club, clubId = MarketSystem.PickClub(state)
        local guard = 0
        while used[club] and guard < 10 do
            club, clubId = MarketSystem.PickClub(state)
            guard = guard + 1
        end
        used[club] = true
        local budget = math.floor(fair * (1.05 + tierIndex * 0.06 + math.random() * 0.25) + 0.5)
        local bid = math.floor(fair * (0.85 + math.random() * 0.15) + 0.5)
        table.insert(clubs, { club = club, clubId = clubId, budget = math.max(bid, budget), bid = bid })
    end
    table.sort(clubs, function(a, b) return a.bid > b.bid end)
    state.market.wars[playerId] = {
        clubs = clubs,
        round = 1,
        maxRounds = 3,
        weeksLeft = 1,
        startedWeek = tonumber(state.company.week) or 1,
    }
    CompanyState.RecordTimeline(state, " 竞价战开启",
        player.name .. " 挂牌引发 " .. tostring(clubCount) .. " 家俱乐部竞价，最高出价 ¥" .. tostring(clubs[1].bid) .. "万。")
    return true, state.market.wars[playerId]
end

-- 竞价战推进：各俱乐部加价或退出，最后转为正式报价
function MarketSystem.AdvanceWar(state, playerId, war)
    state = CompanyState.Ensure(state)
    local player = LeagueCatalog.GetPlayer(playerId)
    war.round = tonumber(war.round) + 1
    local top = war.clubs[1]
    for _, club in ipairs(war.clubs) do
        if club ~= top then
            local nextBid = math.min(club.budget, math.floor(club.bid * (1.08 + math.random() * 0.10) + 0.5))
            if nextBid <= club.bid then
                club.quit = true -- 预算见底
            else
                club.bid = nextBid
            end
            if not club.quit and math.random() < 0.25 then
                club.quit = true -- 知难而退
            end
        end
    end
    local active = {}
    for _, club in ipairs(war.clubs) do
        if not club.quit then table.insert(active, club) end
    end
    if #active > 1 then
        table.sort(active, function(a, b) return a.bid > b.bid end)
    end
    war.clubs = active
    if #active <= 1 or war.round > war.maxRounds then
        MarketSystem.ConvertWarToOffer(state, playerId, war)
        state.market.wars[playerId] = nil
        return
    end
    war.weeksLeft = 1
    CompanyState.RecordTimeline(state, "竞价战第 " .. tostring(war.round) .. " 轮",
        (player and player.name or "选手") .. " 竞价抬升：最高 ¥" .. tostring(active[1].bid) .. "万（" .. active[1].club .. "）。")
end

-- 落锤：最高竞价者转为正式报价，玩家决定是否接受
function MarketSystem.ConvertWarToOffer(state, playerId, war)
    state = CompanyState.Ensure(state)
    local player = LeagueCatalog.GetPlayer(playerId)
    local winner = war.clubs[1]
    if not winner then return end
    local market = state.market
    market.nextOfferId = tonumber(market.nextOfferId) + 1
    table.insert(market.offers, {
        id = market.nextOfferId,
        playerId = playerId,
        club = winner.club,
        clubId = winner.clubId,
        amount = winner.bid,
        budget = math.max(winner.bid, math.floor(tonumber(winner.budget) or winner.bid * 1.3)),
        week = tonumber(state.company.week) or 1,
        weeksLeft = 2,
        status = "pending",
        source = "war",
    })
    CompanyState.RecordTimeline(state, "竞价战落锤",
        (player and player.name or "选手") .. " 竞价战结束，" .. winner.club .. " 以 ¥" .. tostring(winner.bid) .. "万 领先，等待最终确认。")
end

-- 玩家随时锁定当前最高价成交
function MarketSystem.AcceptWarOffer(state, playerId)
    state = CompanyState.Ensure(state)
    local war = state.market.wars[playerId]
    if not war then return false, "当前没有进行中的竞价战" end
    local player = LeagueCatalog.GetPlayer(playerId)
    if not player then return false, "选手不存在" end
    local role = nil
    for r, pid in pairs(state.roster.players) do
        if pid == playerId then role = r end
    end
    if not role then return false, "该选手已不在阵中" end
    local winner = war.clubs[1]
    if not winner then return false, "竞价战无有效出价" end
    state.company.cash = state.company.cash + winner.bid
    MarketSystem.AddTransferIncome(state, winner.bid)
    state.roster.players[role] = ""
    state.roster.contracts[playerId] = nil
    state.roster.chemistry = math.max(0, state.roster.chemistry - 5)
    state.market.listed[playerId] = nil
    state.market.wars[playerId] = nil
    state.roster.buyouts[playerId] = nil
    state.roster.desire[playerId] = nil
    CompanyState.RecordTimeline(state, "竞价战成交",
        player.name .. " 以 ¥" .. tostring(winner.bid) .. "万 在竞价战中成交，加盟 " .. winner.club .. "。")
    local clubId = winner.clubId or MarketSystem.ResolveClubId(state, winner.club)
    if clubId then
        local TransferNewsSystem = require("TransferNewsSystem")
        TransferNewsSystem.ApplyAiStrengthening(state, { id = clubId, name = winner.club }, player, winner.bid)
    end
    return true, winner.bid
end

-- 当前进行中的竞价战（按最高出价排序）
function MarketSystem.GetActiveWars(state)
    state = CompanyState.Ensure(state)
    local wars = {}
    for playerId, war in pairs(state.market.wars or {}) do
        if state.market.listed[playerId] then
            local player = LeagueCatalog.GetPlayer(playerId)
            table.insert(wars, { playerId = playerId, player = player, war = war })
        end
    end
    table.sort(wars, function(a, b)
        local topA = a.war.clubs[1] and a.war.clubs[1].bid or 0
        local topB = b.war.clubs[1] and b.war.clubs[1].bid or 0
        return topA > topB
    end)
    return wars
end

function MarketSystem.GetOffer(state, offerId)
    state = CompanyState.Ensure(state)
    for _, offer in ipairs(state.market.offers) do
        if offer.id == offerId then return offer end
    end
    return nil
end

function MarketSystem.AcceptOffer(state, offerId)
    state = CompanyState.Ensure(state)
    local offer = MarketSystem.GetOffer(state, offerId)
    if not offer then return false, "报价不存在" end
    if offer.status ~= "pending" then return false, "该报价已失效" end
    local player = LeagueCatalog.GetPlayer(offer.playerId)
    if not player then return false, "选手不存在" end
    local role = nil
    for r, pid in pairs(state.roster.players) do
        if pid == offer.playerId then role = r end
    end
    if not role then return false, "该选手已不在阵中" end
    state.company.cash = state.company.cash + offer.amount
    MarketSystem.AddTransferIncome(state, offer.amount)
    state.roster.players[role] = ""
    state.roster.contracts[offer.playerId] = nil
    state.roster.chemistry = math.max(0, state.roster.chemistry - 5)
    state.market.listed[offer.playerId] = nil
    state.roster.buyouts[offer.playerId] = nil
    state.roster.desire[offer.playerId] = nil
    offer.status = "accepted"
    CompanyState.RecordTimeline(state, "选手转会", player.name .. " 以 ¥" .. tostring(offer.amount) .. "万 转会至 " .. offer.club .. "。")
    local clubId = offer.clubId or MarketSystem.ResolveClubId(state, offer.club)
    if clubId then
        local TransferNewsSystem = require("TransferNewsSystem")
        TransferNewsSystem.ApplyAiStrengthening(state, { id = clubId, name = offer.club }, player, offer.amount)
    end
    return true, offer
end

function MarketSystem.RejectOffer(state, offerId)
    state = CompanyState.Ensure(state)
    local offer = MarketSystem.GetOffer(state, offerId)
    if not offer then return false, "报价不存在" end
    if offer.status ~= "pending" then return false, "该报价已失效" end
    offer.status = "rejected"
    local player = LeagueCatalog.GetPlayer(offer.playerId)
    if player then
        MarketSystem.SetDesire(state, offer.playerId, MarketSystem.GetDesire(state, offer.playerId) + math.random(5, 10))
        if offer.clubId then
            local RivalrySystem = require("RivalrySystem")
            RivalrySystem.AddScore(state, offer.clubId, 1, "求购 " .. player.name .. " 被拒绝")
            -- 报价记忆：该俱乐部 3-4 周内不再询价同一选手，冷却后可能加价回归
            state.market.rejectedOffers = state.market.rejectedOffers or {}
            state.market.rejectedOffers[offer.playerId] = state.market.rejectedOffers[offer.playerId] or {}
            state.market.rejectedOffers[offer.playerId][offer.clubId] = {
                untilWeek = (tonumber(state.company.week) or 1) + 3 + math.random(0, 1),
                amount = offer.amount,
            }
        end
        CompanyState.RecordTimeline(state, "拒绝报价",
            "你拒绝了 " .. tostring(offer.club or "对方") .. " 对 " .. player.name .. " 的报价，球员心态出现波动。")
    end
    return true
end

-- 还价：最多两轮。AI 预算内接受加价即成交；预算见顶或两轮被拒则破裂
function MarketSystem.CounterOffer(state, offerId)
    state = CompanyState.Ensure(state)
    local offer = MarketSystem.GetOffer(state, offerId)
    if not offer then return false, "报价不存在" end
    if offer.status ~= "pending" then return false, "该报价已失效" end
    local player = LeagueCatalog.GetPlayer(offer.playerId)
    local round = tonumber(offer.counterRounds) or 0
    offer.counterRounds = round + 1
    local chance = round == 0 and 0.65 or 0.55
    local raise = round == 0 and 1.15 or 1.08
    local budget = tonumber(offer.budget)
    local newAmount = math.floor(offer.amount * raise + 0.5)
    if budget and newAmount > budget then
        if round >= 1 then
            offer.status = "rejected"
            if player then
                CompanyState.RecordTimeline(state, "谈判破裂", player.name .. " 的转会谈判因对方预算见顶告吹。")
            end
            return false, "还价失败：" .. tostring(offer.club or "对方") .. " 预算见顶，谈判破裂"
        end
        newAmount = math.floor(budget + 0.5)
    end
    if math.random() < chance then
        offer.amount = newAmount
        MarketSystem.AcceptOffer(state, offerId)
        return true, "还价成功，" .. tostring(offer.club or "对方") .. " 接受 ¥" .. tostring(newAmount) .. "万，" .. (player and player.name or "选手") .. " 转会达成"
    end
    if round >= 1 then
        offer.status = "rejected"
        if player then
            CompanyState.RecordTimeline(state, "谈判破裂", player.name .. " 的转会谈判两轮还价后仍告吹。")
        end
        return false, "还价失败：" .. tostring(offer.club or "对方") .. " 拒绝了第 2 轮还价，谈判破裂"
    end
    offer.amount = newAmount
    if player then
        CompanyState.RecordTimeline(state, "加价谈判", player.name .. " 的转会谈判进入第 " .. tostring(round + 1) .. " 轮，对方出价升至 ¥" .. tostring(newAmount) .. "万。")
    end
    local pct = math.floor((raise - 1) * 100 + 0.5)
    return true, "已向 " .. tostring(offer.club or "对方") .. " 还价 +" .. tostring(pct) .. "%，对方加价至 ¥" .. tostring(newAmount) .. "万（第 " .. tostring(offer.counterRounds) .. "/2 轮，预计 2 周回复）"
end

-- 租借
function MarketSystem.IsLoaned(state, playerId)
    state = CompanyState.Ensure(state)
    for _, loan in pairs(state.market.loansIn) do
        if loan.playerId == playerId then return true end
    end
    return false
end

function MarketSystem.GetLoanRole(state, playerId)
    for role, loan in pairs(state.market.loansIn) do
        if loan.playerId == playerId then return role end
    end
    return nil
end

-- 可租借的该位置选手：按战力取最强
function MarketSystem.GetLoanablePlayers(state, role)
    state = CompanyState.Ensure(state)
    local candidates = {}
    for _, player in pairs(LeagueCatalog.PLAYERS) do
        if player.role == role and not player.retired and not ownedPlayerId(state, player.id) then
            table.insert(candidates, player)
        end
    end
    table.sort(candidates, function(a, b) return powerOf(a, nil) > powerOf(b, nil) end)
    return candidates
end

function MarketSystem.GetLoanInInfo(state, role)
    state = CompanyState.Ensure(state)
    local loan = state.market.loansIn[role]
    if loan then return loan end
    local candidates = MarketSystem.GetLoanablePlayers(state, role)
    if #candidates == 0 then return nil end
    local player = candidates[1]
    return {
        playerId = player.id,
        player = player,
        weeklyFee = math.max(1, math.floor(player.salary * 1.5 + 0.5)),
        weeksLeft = MarketSystem.LOAN_WEEKS,
    }
end

-- 空位临时租入：周租费，4 周自动到期
function MarketSystem.LoanInPlayer(state, role)
    state = CompanyState.Ensure(state)
    if state.roster.players[role] and state.roster.players[role] ~= "" then return false, "该位置已有选手" end
    local info = MarketSystem.GetLoanInInfo(state, role)
    if not info then return false, "市场上没有可租借的该位置选手" end
    local player = info.player
    state.roster.players[role] = player.id
    state.roster.contracts[player.id] = nil
    state.market.loansIn[role] = {
        playerId = player.id,
        weeklyFee = info.weeklyFee,
        weeksLeft = MarketSystem.LOAN_WEEKS,
    }
    state.roster.chemistry = math.max(0, state.roster.chemistry - 3)
    CompanyState.RecordTimeline(state, "租借补位", player.name .. " 以每周 ¥" .. tostring(info.weeklyFee) .. "万 租借入队 " .. tostring(MarketSystem.LOAN_WEEKS) .. " 周。")
    return true, info
end

function MarketSystem.ReleaseLoan(state, role, reason)
    state = CompanyState.Ensure(state)
    local loan = state.market.loansIn[role]
    if not loan then return false end
    local player = LeagueCatalog.GetPlayer(loan.playerId)
    state.roster.players[role] = ""
    state.roster.contracts[loan.playerId] = nil
    state.market.loansIn[role] = nil
    if player then
        CompanyState.RecordTimeline(state, "租借结束", player.name .. " " .. (reason or "租借到期") .. "，返回原俱乐部。")
    end
    return true
end

-- M2.14 转会窗口：赛季第 1-2 周与赛季末 2 周开窗，休市期仅租借/外租
function MarketSystem.IsTransferWindow(state)
    state = CompanyState.Ensure(state)
    local week = tonumber(state.company.week) or 1
    local CompetitionSystem = require("CompetitionSystem")
    local seasonWeeks = CompetitionSystem.GetSeasonWeeks(state)
    return week <= 2 or week >= seasonWeeks - 1
end

-- 外租查询
function MarketSystem.IsOutLoaned(state, playerId)
    state = CompanyState.Ensure(state)
    return state.roster.outLoans and state.roster.outLoans[playerId] ~= nil
end

function MarketSystem.GetOutLoans(state)
    state = CompanyState.Ensure(state)
    return state.roster.outLoans or {}
end

-- 外租：选手去 AI 俱乐部锻炼，一次性收取租金，归队带回成长（年轻选手成长更明显）
function MarketSystem.OutLoanPlayer(state, playerId, weeks)
    state = CompanyState.Ensure(state)
    weeks = tonumber(weeks) or 4
    local player = LeagueCatalog.GetPlayer(playerId)
    if not player then return false, "选手不存在" end
    if not ownedPlayerId(state, playerId) then return false, "该选手不在阵中" end
    if MarketSystem.IsLoaned(state, playerId) then return false, "租借中的选手无法外租" end
    if MarketSystem.IsOutLoaned(state, playerId) then return false, "该选手已在外租中" end
    if state.market.listed[playerId] then return false, "挂牌中的选手无法外租，请先撤销挂牌" end
    if state.market.wars and state.market.wars[playerId] then return false, "竞价战中的选手无法外租" end
    local role = nil
    for r, pid in pairs(state.roster.players) do
        if pid == playerId then role = r end
    end
    if not role then return false, "找不到选手位置" end
    local fee = math.max(1, math.floor(MarketSystem.GetMarketValue(state, playerId) * 0.02 * weeks))
    state.company.cash = state.company.cash + fee
    state.roster.players[role] = ""
    state.roster.outLoans[playerId] = { role = role, weeks = weeks, weeklyFee = fee, startWeek = tonumber(state.company.week) or 1 }
    local MoraleSystem = require("MoraleSystem")
    MoraleSystem.Change(player, -5)
    CompanyState.RecordTimeline(state, "选手外租",
        player.name .. " 外租锻炼 " .. tostring(weeks) .. " 周，收取租金 ¥" .. tostring(fee) .. "万，归队后可能成长。")
    return true, fee
end

-- 提前召回外租选手（需原位置空缺；租金不退）
function MarketSystem.CancelOutLoan(state, playerId)
    state = CompanyState.Ensure(state)
    local outLoan = state.roster.outLoans and state.roster.outLoans[playerId]
    if not outLoan then return false, "该选手不在外租中" end
    if state.roster.players[outLoan.role] and state.roster.players[outLoan.role] ~= "" then
        return false, "原位置已被占用，无法召回——先腾出该位置"
    end
    local player = LeagueCatalog.GetPlayer(playerId)
    state.roster.players[outLoan.role] = playerId
    state.roster.outLoans[playerId] = nil
    if player then
        CompanyState.RecordTimeline(state, "召回外租", player.name .. " 提前结束外租归队。")
    end
    return true
end

-- 外租到期归队：带回成长；原位置被占用时顺延一周
function MarketSystem.ReturnFromOutLoan(state, playerId, outLoan)
    state = CompanyState.Ensure(state)
    local player = LeagueCatalog.GetPlayer(playerId)
    if not player then
        state.roster.outLoans[playerId] = nil
        return false
    end
    local role = outLoan.role
    if state.roster.players[role] and state.roster.players[role] ~= "" then
        outLoan.weeks = 1
        CompanyState.RecordTimeline(state, "外租顺延", player.name .. " 外租到期但原位置被占用，归队顺延一周。")
        return false
    end
    state.roster.players[role] = playerId
    state.roster.outLoans[playerId] = nil
    local age = MarketSystem.GetPlayerAge(player)
    local growth = 0
    if age <= 20 then growth = 1 + math.random(0, 2)
    elseif age <= 23 then growth = math.random(0, 2)
    else growth = math.random(0, 1) end
    if growth > 0 then
        player.mechanics = (tonumber(player.mechanics) or 60) + growth
        player.teamfight = (tonumber(player.teamfight) or 60) + growth
        player.laning = (tonumber(player.laning) or 60) + growth
        player.form = math.max(0, math.min(100, (tonumber(player.form) or 70) + math.random(-3, 3)))
        CompanyState.RecordTimeline(state, "外租归来", player.name .. " 结束外租归队，外租期间战力提升 " .. tostring(growth) .. " 点。")
    else
        CompanyState.RecordTimeline(state, "外租归来", player.name .. " 结束外租归队。")
    end
    return true, growth
end

-- 周结算：报价过期 / AI 出价 / 主动求购 / 租借扣费
function MarketSystem.ProcessWeek(state)
    state = CompanyState.Ensure(state)
    local week = tonumber(state.company.week) or 1
    local market = state.market
    local transferWindow = MarketSystem.IsTransferWindow(state)
    -- #49 全服竞拍窗：窗口开启时生成 SSR 竞拍，每周推进并结算
    if transferWindow and not state.market.prevWindowOpen then
        MarketSystem.OpenAuctionWindow(state)
    end
    state.market.prevWindowOpen = transferWindow
    MarketSystem.ProcessAuctions(state)
    for _, offer in ipairs(market.offers) do
        if offer.status == "pending" then
            offer.weeksLeft = tonumber(offer.weeksLeft) - 1
            if offer.weeksLeft <= 0 then offer.status = "expired" end
        end
    end
    if transferWindow then
    for playerId, _ in pairs(market.listed) do
        local player = LeagueCatalog.GetPlayer(playerId)
        if player and ownedPlayerId(state, playerId) then
            if not market.wars[playerId] then
                local pendingCount = 0
                for _, offer in ipairs(market.offers) do
                    if offer.playerId == playerId and offer.status == "pending" then pendingCount = pendingCount + 1 end
                end
                if pendingCount < 2 then
                    local form = tonumber(player.form) or 70
                    local TransferNewsSystem = require("TransferNewsSystem")
                    local rumored = TransferNewsSystem.HasRumorForPlayer(state, playerId)
                    local chance = 0.55 + (form >= 80 and 0.2 or (form <= 50 and -0.15 or 0)) - pendingCount * 0.15
                    if rumored then chance = chance + 0.12 end
                    local clubName, clubId, comeback = MarketSystem.PickClubForOffer(state, playerId)
                    if clubName and clubId then
                        local RivalrySystem = require("RivalrySystem")
                        chance = chance + RivalrySystem.GetLevel(state, clubId) * 0.08
                        if math.random() < chance then
                            local fair = MarketSystem.GetMarketValue(state, playerId)
                            local desire = MarketSystem.GetDesire(state, playerId)
                            local desireFactor = desire >= 70 and 1.08 or (desire <= 25 and 0.92 or 1.0)
                            local amount = math.floor(fair * (0.8 + math.random() * 0.25) * desireFactor * MarketSystem.GetRumorPremium(state, playerId) * (comeback and 1.15 or 1.0) + 0.5)
                            market.nextOfferId = tonumber(market.nextOfferId) + 1
                            table.insert(market.offers, {
                                id = market.nextOfferId,
                                playerId = playerId,
                                club = clubName,
                                clubId = clubId,
                                amount = amount,
                                budget = math.floor(amount * (1.25 + math.random() * 0.3) + 0.5),
                                week = week,
                                weeksLeft = 2,
                                status = "pending",
                                source = "listed",
                            })
                            if comeback then
                                local memo = state.market.rejectedOffers and state.market.rejectedOffers[playerId]
                                if memo then memo[clubId] = nil end
                                CompanyState.RecordTimeline(state, "报价回归",
                                    clubName .. " 对 " .. player.name .. " 念念不忘，卷土重来报价升至 ¥" .. tostring(amount) .. "万（+15%）。")
                            end
                        end
                    end
                end
            end
        else
            market.listed[playerId] = nil
        end
    end
    end
    -- 竞价战推进：每周倒计时，落锤后转为正式报价
    for playerId, war in pairs(market.wars) do
        if not market.listed[playerId] or not ownedPlayerId(state, playerId) then
            market.wars[playerId] = nil
        else
            war.weeksLeft = tonumber(war.weeksLeft) - 1
            if war.weeksLeft <= 0 then
                MarketSystem.AdvanceWar(state, playerId, war)
            end
        end
    end
    if transferWindow then
    for _, playerId in pairs(state.roster.players) do
        if playerId and playerId ~= "" and not market.listed[playerId] and not MarketSystem.IsLoaned(state, playerId) then
            local player = LeagueCatalog.GetPlayer(playerId)
            if player and ((tonumber(player.form) or 0) >= 78 or powerOf(player, state.meta and state.meta.role) >= 80) then
                local desire = MarketSystem.GetDesire(state, playerId)
                local TransferNewsSystem = require("TransferNewsSystem")
                local rumored = TransferNewsSystem.HasRumorForPlayer(state, playerId)
                local clubName, clubId, comeback = MarketSystem.PickClubForOffer(state, playerId)
                if clubName and clubId then
                    local RivalrySystem = require("RivalrySystem")
                    local desireChance = 0.12 * (0.55 + desire / 100 * 0.9) + (rumored and 0.10 or 0) + RivalrySystem.GetLevel(state, clubId) * 0.06
                    if math.random() < desireChance then
                        local fair = MarketSystem.GetMarketValue(state, playerId)
                        local desireFactor = desire >= 70 and 1.08 or (desire <= 25 and 0.92 or 1.0)
                        local amount = math.floor(fair * (0.75 + math.random() * 0.2) * desireFactor * MarketSystem.GetRumorPremium(state, playerId) * (comeback and 1.15 or 1.0) + 0.5)
                        market.nextOfferId = tonumber(market.nextOfferId) + 1
                        table.insert(market.offers, {
                            id = market.nextOfferId,
                            playerId = playerId,
                            club = clubName,
                            clubId = clubId,
                            amount = amount,
                            budget = math.floor(amount * (1.25 + math.random() * 0.3) + 0.5),
                            week = week,
                            weeksLeft = 2,
                            status = "pending",
                            source = "solicited",
                        })
                        if comeback then
                            local memo = state.market.rejectedOffers and state.market.rejectedOffers[playerId]
                            if memo then memo[clubId] = nil end
                            CompanyState.RecordTimeline(state, "报价回归",
                                clubName .. " 对 " .. player.name .. " 念念不忘，卷土重来报价升至 ¥" .. tostring(amount) .. "万（+15%）。")
                        end
                    end
                end
            end
        end
    end
    end
    for role, loan in pairs(market.loansIn) do
        local fee = tonumber(loan.weeklyFee) or 0
        if state.company.cash < fee then
            MarketSystem.ReleaseLoan(state, role, "因无力支付租借费，租借提前终止")
        else
            state.company.cash = state.company.cash - fee
            loan.weeksLeft = tonumber(loan.weeksLeft) - 1
            if loan.weeksLeft <= 0 then
                MarketSystem.ReleaseLoan(state, role, "租借到期")
            end
        end
    end
    -- M2.14 外租选手：每周倒计时，到期归队并带回成长
    for playerId, outLoan in pairs(state.roster.outLoans or {}) do
        outLoan.weeks = tonumber(outLoan.weeks) - 1
        if outLoan.weeks <= 0 then
            MarketSystem.ReturnFromOutLoan(state, playerId, outLoan)
        end
    end
    -- M2.13 转会意愿周波动：挂牌者更想走，明星与状态低迷者承受挖角压力
    for _, playerId in pairs(state.roster.players) do
        if playerId and playerId ~= "" then
            local delta = 0
            if market.listed[playerId] then delta = delta + 12 end
            local p = LeagueCatalog.GetPlayer(playerId)
            if p then
                if powerOf(p, state.meta and state.meta.role) >= 78 then delta = delta + 2 end
                if (tonumber(p.form) or 70) <= 45 then delta = delta + 3 end
            end
            if delta ~= 0 then
                MarketSystem.SetDesire(state, playerId, MarketSystem.GetDesire(state, playerId) + delta)
            end
        end
    end
    -- M2.13 违约金买断：窗口内 AI 俱乐部直接激活违约金强挖，无法拒绝
    if transferWindow then
    for playerId, buyout in pairs(state.roster.buyouts or {}) do
        local player = LeagueCatalog.GetPlayer(playerId)
        if not player or not ownedPlayerId(state, playerId) or MarketSystem.IsLoaned(state, playerId) then
            state.roster.buyouts[playerId] = nil
        else
            local tierCfg = MarketSystem.BUYOUT_TIERS[buyout.tier] or MarketSystem.BUYOUT_TIERS.balanced
            local hot = 1.0
            local power = powerOf(player, state.meta and state.meta.role)
            if power >= 80 then hot = hot + 0.8 end
            if (tonumber(player.potential) or 0) >= 85 then hot = hot + 0.6 end
            if (tonumber(player.form) or 70) >= 80 then hot = hot + 0.4 end
            if math.random() < tierCfg.chance * hot then
                local TransferNewsSystem = require("TransferNewsSystem")
                local buyer = TransferNewsSystem.PickBuyer(state, player)
                if buyer then
                    local amount = math.max(1, math.floor(tonumber(buyout.amount) or 0))
                    state.company.cash = state.company.cash + amount
                    MarketSystem.AddTransferIncome(state, amount)
                    for role, pid in pairs(state.roster.players) do
                        if pid == playerId then state.roster.players[role] = "" end
                    end
                    state.roster.contracts[playerId] = nil
                    state.roster.buyouts[playerId] = nil
                    state.roster.desire[playerId] = nil
                    state.market.listed[playerId] = nil
                    state.market.wars[playerId] = nil
                    state.roster.chemistry = math.max(0, state.roster.chemistry - 8)
                    TransferNewsSystem.RecordDeal(state, "违约金激活", buyer.name, player, amount)
                    TransferNewsSystem.ApplyAiStrengthening(state, buyer, player, amount)
                    CompanyState.RecordTimeline(state, "违约金买断",
                        buyer.name .. " 激活违约金以 ¥" .. tostring(amount) .. "万 强挖 " .. player.name .. "，违约金条款无法拒绝。")
                    local RivalrySystem = require("RivalrySystem")
                    RivalrySystem.Trigger(state, buyer.id, "违约金强挖走你的核心选手 " .. player.name)
                end
            end
        end
    end
    end
    -- M2.12 转会生态：AI 俱乐部互交易成交 + 经纪人来电传闻
    local TransferNewsSystem = require("TransferNewsSystem")
    if transferWindow then
        TransferNewsSystem.SimulateTransfers(state)
    end
    TransferNewsSystem.RollRumors(state)
    return state
end

-- 新赛季清理：租借到期、报价失效、谈判冷却清空
function MarketSystem.CleanSeason(state)
    state = CompanyState.Ensure(state)
    -- M2.14 外租赛季末结算：原位置空缺则归队（带成长），被占用则进入自由市场
    for playerId, outLoan in pairs(state.roster.outLoans or {}) do
        local player = LeagueCatalog.GetPlayer(playerId)
        local role = outLoan.role
        if not state.roster.players[role] or state.roster.players[role] == "" then
            MarketSystem.ReturnFromOutLoan(state, playerId, outLoan)
        else
            if player then
                CompanyState.RecordTimeline(state, "外租结算", player.name .. " 赛季结束归队但位置已被占用，经协商进入自由市场。")
            end
            state.roster.outLoans[playerId] = nil
            state.roster.contracts[playerId] = nil
        end
    end
    for role, loan in pairs(state.market.loansIn) do
        local player = LeagueCatalog.GetPlayer(loan.playerId)
        state.roster.players[role] = ""
        state.roster.contracts[loan.playerId] = nil
        state.market.loansIn[role] = nil
        if player then
            CompanyState.RecordTimeline(state, "租借结束", player.name .. " 随赛季结束返回原俱乐部。")
        end
    end
    for _, offer in ipairs(state.market.offers) do
        if offer.status == "pending" then offer.status = "expired" end
    end
    state.market.refused = {}
    state.market.rejectedOffers = {}
    state.market.wars = {}
    return state
end

-- 同时返回俱乐部名与 id（保证同源，避免名/id 错位）
function MarketSystem.PickClub(state)
    local teams = {}
    for _, team in ipairs(LeagueCatalog.TEAMS) do
        if team.id ~= "legacy" then table.insert(teams, team) end
    end
    for _, team in ipairs(LeagueCatalog.ACADEMY_TEAMS) do
        if team.id ~= "legacy_youth" then table.insert(teams, team) end
    end
    for _, region in pairs(LeagueCatalog.REGIONS) do
        for _, team in ipairs(region.teams) do table.insert(teams, team) end
    end
    if #teams == 0 then return "神秘资本", nil end
    local t = teams[math.random(#teams)]
    return t.name, t.id
end

-- 求购俱乐部选择（含报价记忆）：避开冷却中俱乐部；命中过期记忆则允许加价回归（记忆由调用方成交时清除）
function MarketSystem.PickClubForOffer(state, playerId)
    state = CompanyState.Ensure(state)
    local week = tonumber(state.company.week) or 1
    local memo = state.market.rejectedOffers and state.market.rejectedOffers[playerId]
    for _ = 1, 6 do
        local name, clubId = MarketSystem.PickClub(state)
        if not clubId then return name, nil, false end
        local entry = memo and memo[clubId]
        if not entry then return name, clubId, false end
        if (tonumber(entry.untilWeek) or 0) < week then return name, clubId, true end
    end
    return nil, nil, false
end

-- 按俱乐部名反查 id（旧档报价只有名字时兜底）
function MarketSystem.ResolveClubId(state, clubName)
    for _, team in ipairs(LeagueCatalog.TEAMS) do
        if team.name == clubName then return team.id end
    end
    for _, team in ipairs(LeagueCatalog.ACADEMY_TEAMS) do
        if team.name == clubName then return team.id end
    end
    for _, region in pairs(LeagueCatalog.REGIONS) do
        for _, team in ipairs(region.teams) do
            if team.name == clubName then return team.id end
        end
    end
    return nil
end

-- AI 求购俱乐部名：从其他俱乐部随机抽取
function MarketSystem.PickClubName(state)
    local names = {}
    for _, team in ipairs(LeagueCatalog.TEAMS) do
        if team.id ~= "legacy" then table.insert(names, team.name) end
    end
    for _, team in ipairs(LeagueCatalog.ACADEMY_TEAMS) do
        if team.id ~= "legacy_youth" then table.insert(names, team.name) end
    end
    for _, region in pairs(LeagueCatalog.REGIONS) do
        for _, team in ipairs(region.teams) do table.insert(names, team.name) end
    end
    if #names == 0 then return "神秘资本" end
    return names[math.random(#names)]
end

-- AI 求购俱乐部 id：与 PickClubName 同一批队伍，供宿敌/挖角加成定位
function MarketSystem.PickClubId(state)
    local ids = {}
    for _, team in ipairs(LeagueCatalog.TEAMS) do
        if team.id ~= "legacy" then table.insert(ids, team.id) end
    end
    for _, team in ipairs(LeagueCatalog.ACADEMY_TEAMS) do
        if team.id ~= "legacy_youth" then table.insert(ids, team.id) end
    end
    for _, region in pairs(LeagueCatalog.REGIONS) do
        for _, team in ipairs(region.teams) do table.insert(ids, team.id) end
    end
    if #ids == 0 then return "nova" end
    return ids[math.random(#ids)]
end

function MarketSystem.GetPendingOffers(state)
    state = CompanyState.Ensure(state)
    local pending = {}
    for _, offer in ipairs(state.market.offers) do
        if offer.status == "pending" then table.insert(pending, offer) end
    end
    table.sort(pending, function(a, b) return (a.week or 0) > (b.week or 0) end)
    return pending
end

function MarketSystem.GetFreeAgentsWithMeta(state)
    state = CompanyState.Ensure(state)
    local owned = {}
    for _, pid in pairs(state.roster.players) do owned[pid] = true end
    for _, pid in pairs(state.roster.bench) do
        if pid and pid ~= "" then owned[pid] = true end
    end
    local agents = {}
    for _, player in pairs(LeagueCatalog.PLAYERS) do
        if not player.retired and not owned[player.id] then
            table.insert(agents, {
                player = player,
                asking = MarketSystem.GetAskingPrice(state, player.id),
                advice = MarketSystem.GetAgentAdvice(state, player),
                power = powerOf(player, state.meta and state.meta.role),
            })
        end
    end
    table.sort(agents, function(a, b) return a.asking > b.asking end)
    return agents
end

-- ============ #48A 工资帽（阵容总周薪上限，倒逼年轻化）============

-- 工资帽分层：按俱乐部评级（声望境界）设定周薪上限（万元/周）
MarketSystem.SALARY_CAP_BY_TIER = {
    grassroots = 45,
    rising = 70,
    professional = 110,
    elite = 150,
    legend = 200,
}

-- 阵容总周薪：首发 + 替补选手薪资合计（万元）
function MarketSystem.GetPayroll(state)
    state = CompanyState.Ensure(state)
    local wages = 0
    for _, pid in pairs(state.roster.players) do
        if pid and pid ~= "" then
            local p = LeagueCatalog.GetPlayer(pid)
            if p then wages = wages + (tonumber(p.salary) or 0) end
        end
    end
    for _, pid in pairs(state.roster.bench or {}) do
        if pid and pid ~= "" then
            local p = LeagueCatalog.GetPlayer(pid)
            if p then wages = wages + (tonumber(p.salary) or 0) end
        end
    end
    return wages
end

-- 当前工资帽上限（按评级）
function MarketSystem.GetSalaryCap(state)
    state = CompanyState.Ensure(state)
    local TierSystem = require("TierSystem")
    local tier = TierSystem.GetTier(state)
    return MarketSystem.SALARY_CAP_BY_TIER[tier] or 90
end

-- 工资帽占用信息
function MarketSystem.GetCapInfo(state)
    local payroll = MarketSystem.GetPayroll(state)
    local cap = MarketSystem.GetSalaryCap(state)
    return {
        payroll = payroll,
        cap = cap,
        over = math.max(0, payroll - cap),
        free = math.max(0, cap - payroll),
        pct = cap > 0 and math.floor(payroll / cap * 100 + 0.5) or 0,
    }
end

-- ============ #49A 转会费商业循环：转会收入累计（第二条现金流）============

-- 累计卖出/违约金买断带来的转会收入（喂 FinanceSystem 展示与估值）
function MarketSystem.AddTransferIncome(state, amount)
    state = CompanyState.Ensure(state)
    state.finance = state.finance or {}
    state.finance.transferIncome = (tonumber(state.finance.transferIncome) or 0) + math.floor(tonumber(amount) or 0)
    return state.finance.transferIncome
end

-- ============ #49B 租借转正（loaned-in → 永久签约）============

-- 把租借入队的选手以转会费买断为永久合同（板凳新星低风险管理）
function MarketSystem.ConvertLoanToPermanent(state, role)
    state = CompanyState.Ensure(state)
    local loan = state.market.loansIn[role]
    if not loan then return false, "该位置没有租借选手" end
    local player = LeagueCatalog.GetPlayer(loan.playerId)
    if not player then return false, "选手不存在" end
    local fee = math.max(1, math.floor(MarketSystem.GetMarketValue(state, loan.playerId) * 0.7 + 0.5))
    if state.company.cash < fee then return false, "现金不足，无法转正买断（需 ¥" .. tostring(fee) .. "万）" end
    local capInfo = MarketSystem.GetCapInfo(state)
    if capInfo.payroll + (tonumber(player.salary) or 0) > capInfo.cap then
        return false, "工资帽超限，无法转正（卖出/解约腾出空间）"
    end
    state.company.cash = state.company.cash - fee
    state.roster.players[role] = loan.playerId
    state.roster.contracts[loan.playerId] = 2
    state.roster.desire[loan.playerId] = 20 + math.random(0, 15)
    state.market.loansIn[role] = nil
    CompanyState.RecordTimeline(state, "租借转正",
        player.name .. " 租借转正，支付 ¥" .. tostring(fee) .. "万 签下 2 年合同，成为正式一员。")
    return true, fee
end

-- ============ #49C 全服竞拍窗（窗口期抢拍 SSR 自由人）============

-- 生成一名 SSR 级自由人（供竞拍窗 / 明星招募共用）
function MarketSystem.SpawnMarqueeFreeAgent(state, opts)
    state = CompanyState.Ensure(state)
    opts = opts or {}
    state.market.auctionSeq = (tonumber(state.market.auctionSeq) or 0) + 1
    local id = "auc_" .. tostring(state.market.auctionSeq)
    local roles = { "top", "jungle", "mid", "adc", "support" }
    local role = opts.role or roles[math.random(#roles)]
    local age = opts.age or (21 + math.random(0, 3))
    local potential = opts.potential or (86 + math.random(0, 6))
    local base = 76 + math.random(0, 10)
    local player = {
        id = id,
        name = opts.name or ("SSR·" .. ({ "凌", "焰", "霄", "澈", "曜" })[math.random(1, 5)] .. ({ "夜", "羽", "辰", "锋", "澜" })[math.random(1, 5)]),
        role = role,
        age = age,
        mechanics = base + math.random(0, 6),
        teamfight = base + math.random(0, 6),
        laning = base + math.random(0, 6),
        form = 74 + math.random(0, 6),
        potential = potential,
        salary = 16 + math.random(0, 8),
        buyout = 0,
        contractYears = 2,
        retired = false,
    }
    LeagueCatalog.RegisterPlayer(player)
    return player
end

-- 转会窗开启时生成竞拍标的
function MarketSystem.OpenAuctionWindow(state)
    state = CompanyState.Ensure(state)
    state.market.auctions = state.market.auctions or {}
    if #state.market.auctions > 0 then return end
    local TierSystem = require("TierSystem")
    local count = (TierSystem.GetTierIndex(state) or 1) >= 3 and 2 or 1
    for _ = 1, count do
        local player = MarketSystem.SpawnMarqueeFreeAgent(state)
        if player then
            local start = math.max(20, math.floor(MarketSystem.GetMarketValue(state, player.id) * 0.6 + 0.5))
            table.insert(state.market.auctions, {
                playerId = player.id,
                currentBid = start,
                base = start,
                leader = nil,
                weeksLeft = 2,
            })
        end
    end
    if #state.market.auctions > 0 then
        CompanyState.RecordTimeline(state, " 全服竞拍窗开启",
            "转会窗开启，全服竞拍高潜自由人，到点抢拍成交！")
    end
end

function MarketSystem.GetAuctions(state)
    state = CompanyState.Ensure(state)
    state.market.auctions = state.market.auctions or {}
    local list = {}
    for idx, auc in ipairs(state.market.auctions) do
        local player = LeagueCatalog.GetPlayer(auc.playerId)
        if player then
            table.insert(list, { idx = idx, player = player, auc = auc })
        end
    end
    return list
end

-- 玩家出价（仅记录承诺，结算时扣款；需现金足以支撑）
function MarketSystem.BidAuction(state, idx, amount)
    state = CompanyState.Ensure(state)
    local auc = state.market.auctions[idx]
    if not auc then return false, "竞拍不存在" end
    local minNext = auc.currentBid + math.max(5, math.floor(auc.currentBid * 0.1 + 0.5))
    if amount < minNext then return false, "出价需高于当前价至少 +10%（≥¥" .. tostring(minNext) .. "万）" end
    if state.company.cash < amount then return false, "现金不足以支撑该出价" end
    auc.currentBid = amount
    auc.leader = "player"
    return true, amount
end

-- 每周推进竞拍：AI 抢拍 + 到点结算
function MarketSystem.ProcessAuctions(state)
    state = CompanyState.Ensure(state)
    state.market.auctions = state.market.auctions or {}
    for i = #state.market.auctions, 1, -1 do
        local auc = state.market.auctions[i]
        auc.weeksLeft = (tonumber(auc.weeksLeft) or 2) - 1
        if auc.weeksLeft > 0 and auc.leader ~= "player" then
            if math.random() < 0.5 then
                auc.currentBid = auc.currentBid + math.max(5, math.floor(auc.currentBid * 0.12 + 0.5))
                auc.leader = MarketSystem.PickClub(state)
            end
        end
        if auc.weeksLeft <= 0 then
            local player = LeagueCatalog.GetPlayer(auc.playerId)
            if auc.leader == "player" and player then
                local capInfo = MarketSystem.GetCapInfo(state)
                local owned = false
                for _, pid in pairs(state.roster.players) do if pid == player.id then owned = true end end
                for _, pid in pairs(state.roster.bench or {}) do if pid and pid ~= "" and pid == player.id then owned = true end end
                if owned then
                    CompanyState.RecordTimeline(state, "全服竞拍", player.name .. " 已属本队，竞拍标的流拍。")
                elseif capInfo.payroll + (tonumber(player.salary) or 0) > capInfo.cap then
                    CompanyState.RecordTimeline(state, "全服竞拍流拍", player.name .. " 因工资帽超限未能签约，被其他俱乐部摘走。")
                    local buyer = MarketSystem.PickClub(state)
                    local TransferNewsSystem = require("TransferNewsSystem")
                    TransferNewsSystem.RecordDeal(state, "全服竞拍", buyer, player, auc.currentBid)
                elseif state.company.cash < auc.currentBid then
                    CompanyState.RecordTimeline(state, "全服竞拍流拍", player.name .. " 因现金不足未能中标，被其他俱乐部摘走。")
                    local buyer = MarketSystem.PickClub(state)
                    local TransferNewsSystem = require("TransferNewsSystem")
                    TransferNewsSystem.RecordDeal(state, "全服竞拍", buyer, player, auc.currentBid)
                else
                    state.company.cash = state.company.cash - auc.currentBid
                    state.roster.players[player.role] = player.id
                    state.roster.contracts[player.id] = 2
                    state.roster.desire[player.id] = 15 + math.random(0, 15)
                    CompanyState.RecordTimeline(state, " 全服竞拍中标",
                        player.name .. " 在全服竞拍窗以 ¥" .. tostring(auc.currentBid) .. "万 中标加盟！")
                end
            else
                CompanyState.RecordTimeline(state, "全服竞拍结束",
                    (auc.leader or "某俱乐部") .. " 赢得竞拍标的。")
            end
            table.remove(state.market.auctions, i)
        end
    end
end

-- ============ #49D 反挖角风险：私下接触（休市期绕过窗口联系挂牌选手）============

-- 休市期私下接触挂牌选手：有被发现罚款风险；成功则开启秘密谈判
function MarketSystem.AttemptTamper(state, playerId)
    state = CompanyState.Ensure(state)
    if MarketSystem.IsTransferWindow(state) then return false, "转会窗已开，直接谈判即可" end
    local player = LeagueCatalog.GetPlayer(playerId)
    if not player then return false, "选手不存在" end
    if not state.market.listed[playerId] then return false, "该选手未挂牌，无法私下接触" end
    local fine = 20 + math.random(0, 30)
    if math.random() < 0.35 then
        if state.company.cash < fine then return false, "现金不足，无法支付违规罚款" end
        state.company.cash = state.company.cash - fine
        CompanyState.RecordTimeline(state, "私下接触被抓",
            "你私下接触 " .. player.name .. " 被联盟察觉，罚款 ¥" .. tostring(fine) .. "万。")
        return false, "私下接触被联盟发现，罚款 ¥" .. tostring(fine) .. "万"
    end
    local NegotiationSystem = require("NegotiationSystem")
    local neg, err = NegotiationSystem.StartNegotiation(state, playerId)
    if not neg then return false, err or "无法开启私下谈判" end
    CompanyState.RecordTimeline(state, "私下接触",
        "你绕过转会窗私下接触 " .. player.name .. "，开启秘密谈判（仍有被发现风险）。")
    return neg
end

return MarketSystem
