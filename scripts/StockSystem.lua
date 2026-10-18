-- StockSystem：公开股票市场（招牌玩法）
-- 上市 → 股价随战绩/转会/舆论每周波动 → 增发/回购/做空/并购四种资本操作。
-- 锚点：股价(元) = 估值(万)×0.01；总股本 1000 万股；现金/估值单位 ¥万。

local CompanyState = require("CompanyState")
local FinanceSystem = require("FinanceSystem")
local LeagueCatalog = require("LeagueCatalog")

local StockSystem = {}

StockSystem.SHARES_OUT = 1000 -- 万股（总股本固定）

StockSystem.BUYERS = { "星辰资本", "环宇基金", "极光控股", "天际投资", "蓝图集团" }

StockSystem.RIVAL_INSTITUTIONS = { "暗潮对冲基金", "赤熊量化资本", "天鹰做空机构", "黑石空头联合会" }

StockSystem.IR_CAMPAIGNS = {
    briefing = {
        id = "briefing",
        name = "新闻发布会 (Press Briefing)",
        cost = 30,
        cooldown = 2,
        sentimentDelta = 5,
        priceBoost = 0,
        desc = "召开例行媒体通气会，向主流电竞媒体同步近期战队动态与合规情况，稳固市场情绪。",
    },
    roadshow = {
        id = "roadshow",
        name = "机构投资者路演 (Investor Roadshow)",
        cost = 80,
        cooldown = 4,
        sentimentDelta = 12,
        priceBoost = 0.03,
        desc = "组织线上机构投资者路演，披露战队商业化进展与赛季规划，稳固机构持股信心，提振股价。",
    },
    blitz = {
        id = "blitz",
        name = "战略公关风暴 (Strategic PR Blitz)",
        cost = 200,
        cooldown = 6,
        sentimentDelta = 25,
        priceBoost = 0.08,
        desc = "联合主流自媒体与直播平台全网宣发高光与专访，引爆社交声量与短期买盘，强力拉升市值。",
    },
}

local function clamp(value, minimum, maximum)
    return math.max(minimum, math.min(maximum, tonumber(value) or minimum))
end

--- 每股价格锚点：估值(万) × 0.01 元/股
local function anchorPrice(state)
    return math.max(1, math.floor(FinanceSystem.GetValuation(state) * 0.01))
end

--- 股票代码：缩写大写，无缩写用公司名单词首字母
function StockSystem.TickerOf(state)
    local abbr = tostring(state.company.settings and state.company.settings.tag or ""):upper()
    if #abbr > 0 then return abbr end
    local out = {}
    for word in tostring(state.company.name):gmatch("[%a%d]+") do
        table.insert(out, word:sub(1, 1):upper())
    end
    if #out > 0 then return table.concat(out, "") end
    return "LG"
end

--- 是否已上市
function StockSystem.IsPublic(state)
    state = CompanyState.Ensure(state)
    return state.shares.public == true
end

--- IPO 条件：未上市 +（完成过融资 或 估值≥¥2000万）+ 非破产
function StockSystem.CanIpo(state)
    state = CompanyState.Ensure(state)
    if state.shares.public then return false, "已上市" end
    if state.company.seasonState == "bankrupt" then return false, "公司已破产" end
    if #(state.shares.rounds or {}) == 0 and FinanceSystem.GetValuation(state) < 2000 then
        return false, "需完成至少一轮融资，或估值达到 ¥2000万"
    end
    return true
end

function StockSystem.Ipo(state)
    state = CompanyState.Ensure(state)
    local ok, reason = StockSystem.CanIpo(state)
    if not ok then return false, reason end
    local valuation = FinanceSystem.GetValuation(state)
    local price = anchorPrice(state)
    state.shares.public = true
    state.shares.ticker = StockSystem.TickerOf(state)
    state.shares.sharePrice = price
    state.shares.prevPrice = price
    state.shares.floatPct = 12
    state.shares.founder = math.max(0, tonumber(state.shares.founder) - 6)
    state.shares.investors = math.max(0, tonumber(state.shares.investors) - 6)
    state.shares.ipoWeek = tonumber(state.company.week) or 1
    local raise = math.floor(valuation * 0.12)
    state.company.cash = state.company.cash + raise
    state.shares.history = state.shares.history or {}
    table.insert(state.shares.history, {
        week = tonumber(state.company.week) or 1,
        price = price,
        change = 0,
        reason = "IPO 上市首日",
    })
    CompanyState.RecordTimeline(state, " 公开上市",
        state.company.name .. "（" .. tostring(state.shares.ticker) .. "）上市，发行价 ¥" .. tostring(price) .. "/股，募集 ¥" .. tostring(raise) .. "万。")
    return true, { ticker = state.shares.ticker, price = price, raise = raise }
end

--- 检查是否触发做空机构突袭（Phase 2）
function StockSystem.CheckRivalShortAttack(state)
    state = CompanyState.Ensure(state)
    local s = state.shares
    if not s.public then return false, nil end
    if s.rivalShort and s.rivalShort.active then return false, nil end
    local week = tonumber(state.company.week) or 1
    if week <= (tonumber(s.ipoWeek) or 0) then return false, nil end
    local floatPct = tonumber(s.floatPct) or 0
    if floatPct < 8 then return false, nil end
    local lastResolved = tonumber(s.lastRivalAttackResolvedWeek) or 0
    if week - lastResolved < 4 then return false, nil end

    local currentPrice = tonumber(s.sharePrice) or anchorPrice(state)
    local anchor = anchorPrice(state)
    local sentiment = tonumber(s.sentiment) or 50
    local credibility = tonumber(s.credibility) or 70

    local chance = 0.06
    if sentiment < 40 then chance = chance + 0.08 end
    if floatPct >= 18 then chance = chance + 0.06 end
    if currentPrice > anchor * 1.3 then chance = chance + 0.08 end
    if credibility >= 85 then chance = chance - 0.06 end
    chance = clamp(chance, 0.02, 0.35)

    local shouldTrigger = (sentiment <= 35) or (math.random() < chance)
    if shouldTrigger then
        local institution = StockSystem.RIVAL_INSTITUTIONS[math.random(#StockSystem.RIVAL_INSTITUTIONS)]
        local targetPrice = math.max(1, math.floor(currentPrice * 0.70 * 10 + 0.5) / 10)
        local shortInterest = math.floor(floatPct * 0.40 * 10 + 0.5) / 10
        local penaltyVal = math.max(60, math.floor(currentPrice * 5 + 0.5))
        return true, {
            institution = institution,
            targetPrice = targetPrice,
            shortInterest = shortInterest,
            duration = 3,
            penaltyVal = penaltyVal,
        }
    end
    return false, nil
end

--- 触发做空机构突袭（Phase 2）
function StockSystem.TriggerRivalShortAttack(state, customParams)
    state = CompanyState.Ensure(state)
    local s = state.shares
    if not s.public then return false, nil end
    if s.rivalShort and s.rivalShort.active then return false, s.rivalShort end

    local currentPrice = tonumber(s.sharePrice) or anchorPrice(state)
    local institution = "暗潮对冲基金"
    if type(customParams) == "string" then
        institution = customParams
    elseif type(customParams) == "table" and customParams.institution then
        institution = customParams.institution
    else
        institution = StockSystem.RIVAL_INSTITUTIONS[math.random(#StockSystem.RIVAL_INSTITUTIONS)]
    end

    local duration = (type(customParams) == "table" and (customParams.weeksLeft or customParams.duration or customParams.totalWeeks)) or 3
    local targetPrice = (type(customParams) == "table" and customParams.targetPrice) or math.max(1, math.floor(currentPrice * 0.70 * 10 + 0.5) / 10)
    local floatPct = tonumber(s.floatPct) or 12
    local shortInterest = (type(customParams) == "table" and customParams.shortInterest) or math.floor(floatPct * 0.40 * 10 + 0.5) / 10
    local penaltyVal = (type(customParams) == "table" and customParams.penaltyVal) or math.max(60, math.floor(currentPrice * 5 + 0.5))

    s.rivalShort = {
        active = true,
        institution = institution,
        openPrice = currentPrice,
        targetPrice = targetPrice,
        shortInterest = shortInterest,
        weeksLeft = duration,
        totalWeeks = duration,
        penaltyVal = penaltyVal,
        defenseLevel = 0,
    }
    s.sentiment = math.max(10, (tonumber(s.sentiment) or 50) - 5)
    CompanyState.RecordTimeline(state, " 空头突袭",
        institution .. " 借券对 " .. tostring(s.ticker) .. " 发起做空突袭！做空规模 " .. shortInterest .. "% 流通盘，目标打压至 ¥" .. targetPrice .. "/股，防御窗口 " .. duration .. " 周。")
    return true, s.rivalShort
end

--- 做空反击/资本护盘（Phase 2）
function StockSystem.DefendShortAttack(state, strategyId)
    state = CompanyState.Ensure(state)
    local s = state.shares
    local rs = s.rivalShort
    if not (rs and rs.active) then
        return false, "当前没有活跃的做空袭击", 0
    end

    strategyId = strategyId or "capital"
    local curCash = tonumber(state.company.cash) or 0

    if strategyId == "capital" then
        local cost = 150
        local reserveLimit = 100
        if curCash - cost < reserveLimit then
            return false, "资金不足：护盘需 ¥" .. cost .. "万，并需保留 ¥" .. reserveLimit .. "万 运营储备金（当前现金 ¥" .. curCash .. "万）", 0
        end
        state.company.cash = curCash - cost
        rs.defenseLevel = (tonumber(rs.defenseLevel) or 0) + 1
        s.sharePrice = math.floor((tonumber(s.sharePrice) or 0) * 1.10 * 10 + 0.5) / 10
        s.sentiment = math.min(100, (tonumber(s.sentiment) or 50) + 10)
        CompanyState.RecordTimeline(state, " 资金护盘",
            "注入 ¥" .. cost .. "万 主力护盘资金挂大单托底，股价回升 10% 至 ¥" .. s.sharePrice .. "/股！")
        return true, "资金护盘成功，注入 ¥" .. cost .. "万 护盘资金，股价回升 10%！", cost

    elseif strategyId == "statement" or strategyId == "pr" then
        local cost = 30
        local reserveLimit = 100
        if curCash - cost < reserveLimit then
            return false, "资金不足：发布澄清声明需 ¥" .. cost .. "万，并需保留 ¥" .. reserveLimit .. "万 运营储备金", 0
        end
        state.company.cash = curCash - cost
        rs.defenseLevel = (tonumber(rs.defenseLevel) or 0) + 1
        s.sharePrice = math.floor((tonumber(s.sharePrice) or 0) * 1.03 * 10 + 0.5) / 10
        s.sentiment = math.min(100, (tonumber(s.sentiment) or 50) + 8)
        s.credibility = math.min(100, (tonumber(s.credibility) or 70) + 3)
        CompanyState.RecordTimeline(state, " 官方澄清声明",
            "发布严正澄清声明反击 " .. rs.institution .. " 的做空造谣，市场情绪与信誉双重回升。")
        return true, "发布官方澄清声明反击成功，市场信誉提升！", cost

    elseif strategyId == "counter_buy" then
        local cost = 100
        local reserveLimit = 100
        if curCash - cost < reserveLimit then
            return false, "资金不足：反向回购护盘需 ¥" .. cost .. "万，并需保留 ¥" .. reserveLimit .. "万 运营储备金", 0
        end
        state.company.cash = curCash - cost
        rs.defenseLevel = (tonumber(rs.defenseLevel) or 0) + 1
        s.sharePrice = math.floor((tonumber(s.sharePrice) or 0) * 1.06 * 10 + 0.5) / 10
        s.floatPct = math.max(2, (tonumber(s.floatPct) or 12) - 1)
        s.founder = math.min(100, (tonumber(s.founder) or 93) + 1)
        s.sentiment = math.min(100, (tonumber(s.sentiment) or 50) + 6)
        CompanyState.RecordTimeline(state, " 反向回购护盘",
            "反向回购 1% 流通筹码注销，压低空单可借盘，股价回升 6% 至 ¥" .. s.sharePrice .. "/股。")
        return true, "反向回购护盘成功，收回 1% 流通筹码！", cost
    else
        return false, "未知防守策略: " .. tostring(strategyId), 0
    end
end

--- 诱发逼空踩踏（Short Squeeze - Phase 2）
function StockSystem.TriggerShortSqueeze(state)
    state = CompanyState.Ensure(state)
    local s = state.shares
    local rs = s.rivalShort
    if not (rs and rs.active) then
        return false, "当前没有活跃的做空袭击", 0
    end
    local curPrice = tonumber(s.sharePrice) or 0
    local threshold = math.floor(rs.openPrice * 1.20 * 10 + 0.5) / 10
    if curPrice < threshold then
        return false, "逼空条件不足：当前股价 (¥" .. curPrice .. ") 需超过做空开仓价 (¥" .. rs.openPrice .. ") 至少 20% (需达到 ¥" .. threshold .. "/股)", 0
    end

    -- 空头踩踏强平：股价再暴涨 20%
    local squeezedPrice = math.floor(curPrice * 1.20 * 10 + 0.5) / 10
    s.sharePrice = squeezedPrice
    local payout = tonumber(rs.penaltyVal) or math.max(60, math.floor(rs.openPrice * 5 + 0.5))
    state.company.cash = (tonumber(state.company.cash) or 0) + payout
    state.company.reputation = clamp((tonumber(state.company.reputation) or 50) + 8, 0, 100)
    s.sentiment = math.min(100, (tonumber(s.sentiment) or 50) + 25)

    s.rivalShortHistory = s.rivalShortHistory or {}
    table.insert(s.rivalShortHistory, {
        institution = rs.institution,
        outcome = "squeezed",
        payout = payout,
        week = tonumber(state.company.week) or 1,
        openPrice = rs.openPrice,
        squeezePrice = squeezedPrice,
    })
    s.rivalShort = nil
    s.lastRivalAttackResolvedWeek = tonumber(state.company.week) or 1

    CompanyState.RecordTimeline(state, "【做空爆仓·轧空胜利】",
        "我方主力反击诱发空头踩踏（Short Squeeze）！" .. rs.institution .. " 爆仓离场，股价暴涨 20% 至 ¥" .. squeezedPrice .. "/股，斩获赔偿金 ¥" .. payout .. "万！")
    return true, "轧空胜利！" .. rs.institution .. " 爆仓离场，股价暴涨 +20%，获得赔偿金 ¥" .. payout .. "万！", payout
end

--- 每周股价结算：胜负 / 当周转会 / 社交热度 / 做空承压 / 噪声，并向估值锚点回归
function StockSystem.ProcessWeek(state, legacyWon)
    state = CompanyState.Ensure(state)
    local s = state.shares
    if not s.public then
        StockSystem.MaybeOfferAcquisition(state)
        return state
    end
    local price = tonumber(s.sharePrice) or anchorPrice(state)
    local momentum = 0
    local reasons = {}

    -- 1. 空头袭击状态结算与每周施压
    local rs = s.rivalShort
    if rs and rs.active then
        if price >= rs.openPrice * 1.20 then
            StockSystem.TriggerShortSqueeze(state)
            price = tonumber(s.sharePrice) or price
            rs = nil
            table.insert(reasons, "空头踩踏暴涨")
        else
            local defLevel = tonumber(rs.defenseLevel) or 0
            local reduction = math.min(0.06, defLevel * 0.03)
            local netPressure = math.max(0.02, 0.08 - reduction)
            momentum = momentum - netPressure
            table.insert(reasons, "做空打压(-" .. math.floor(netPressure * 100) .. "%)")
            s.sentiment = math.max(10, (tonumber(s.sentiment) or 50) - 3)
            rs.weeksLeft = (tonumber(rs.weeksLeft) or 1) - 1
            if rs.weeksLeft <= 0 then
                if price <= rs.targetPrice then
                    momentum = momentum - 0.15
                    state.company.reputation = clamp((tonumber(state.company.reputation) or 50) - 8, 0, 100)
                    s.sentiment = math.max(5, (tonumber(s.sentiment) or 50) - 20)
                    s.rivalShortHistory = s.rivalShortHistory or {}
                    table.insert(s.rivalShortHistory, {
                        institution = rs.institution,
                        outcome = "failed",
                        payout = 0,
                        week = tonumber(state.company.week) or 1,
                        openPrice = rs.openPrice,
                        targetPrice = rs.targetPrice,
                    })
                    s.rivalShort = nil
                    s.lastRivalAttackResolvedWeek = tonumber(state.company.week) or 1
                    CompanyState.RecordTimeline(state, " 做空得逞", "做空机构成功打压股价兑现离场，市值大幅缩水，俱乐部声誉受损。")
                    table.insert(reasons, "做空得逞重挫")
                else
                    momentum = momentum + 0.03
                    s.sentiment = math.min(100, (tonumber(s.sentiment) or 50) + 5)
                    s.rivalShortHistory = s.rivalShortHistory or {}
                    table.insert(s.rivalShortHistory, {
                        institution = rs.institution,
                        outcome = "defended",
                        payout = 0,
                        week = tonumber(state.company.week) or 1,
                        openPrice = rs.openPrice,
                        targetPrice = rs.targetPrice,
                    })
                    s.rivalShort = nil
                    s.lastRivalAttackResolvedWeek = tonumber(state.company.week) or 1
                    CompanyState.RecordTimeline(state, " 空头退散", "做空防御期限已过，机构未能击穿目标防线，空单撤离，市场重归平稳。")
                    table.insert(reasons, "空头退散企稳")
                end
            end
        end
    elseif not s.rivalShort then
        local shouldAttack, attackParams = StockSystem.CheckRivalShortAttack(state)
        if shouldAttack then
            StockSystem.TriggerRivalShortAttack(state, attackParams)
            table.insert(reasons, "空头突袭建仓")
        end
    end

    -- 2. 战绩胜负影响
    if legacyWon == true then
        momentum = momentum + 0.05
        table.insert(reasons, "胜场提振")
    elseif legacyWon == false then
        momentum = momentum - 0.04
        table.insert(reasons, "失利承压")
    end

    -- 3. 转会活跃度
    local news = state.market.transferNews or {}
    if #news > 0 and tonumber(news[1].week) == tonumber(state.company.week) then
        local amount = tonumber(news[1].amount) or 0
        momentum = momentum + (amount >= 200 and 0.04 or 0.02)
        table.insert(reasons, "转会活跃")
    end

    -- 4. 社交热度
    local heat = tonumber(state.social and state.social.heat) or 50
    momentum = momentum + (heat - 50) * 0.004
    if heat >= 60 then table.insert(reasons, "舆论火热") elseif heat <= 35 then table.insert(reasons, "舆论冷淡") end

    -- 5. 市场情绪与信誉影响及自然回归 (Phase 2)
    local curSent = tonumber(s.sentiment) or 50
    if curSent > 50 then
        s.sentiment = curSent - 1
    elseif curSent < 50 then
        s.sentiment = curSent + 1
    end
    if curSent >= 70 then
        momentum = momentum + 0.02
        table.insert(reasons, "情绪高涨")
    elseif curSent <= 30 then
        momentum = momentum - 0.02
        table.insert(reasons, "情绪低迷")
    end
    local curCred = tonumber(s.credibility) or 70
    if curCred < 70 then
        s.credibility = curCred + 1
    end

    -- 6. 推进 IR 冷却周数
    if s.irCooldowns then
        for cid, cd in pairs(s.irCooldowns) do
            if tonumber(cd) and cd > 0 then
                s.irCooldowns[cid] = cd - 1
            end
        end
    end

    -- 7. 市场随机波动与估值锚点均值回归
    momentum = momentum + math.random(-4, 5) / 100
    local target = anchorPrice(state)
    if price > 0 then
        momentum = momentum + (target - price) / price * 0.15
    end
    local newPrice = clamp(price * (1 + momentum), 0.5, math.max(2, target * 3))
    newPrice = math.floor(newPrice * 10 + 0.5) / 10
    local change = price > 0 and (newPrice - price) / price or 0
    s.prevPrice = price
    s.sharePrice = newPrice
    StockSystem.SettleShort(state, newPrice)
    s.history = s.history or {}
    table.insert(s.history, {
        week = tonumber(state.company.week) or 1,
        price = newPrice,
        change = math.floor(change * 100 + 0.5),
        reason = #reasons > 0 and table.concat(reasons, " · ") or "市场平稳",
    })
    while #s.history > 20 do table.remove(s.history, 1) end
    StockSystem.MaybeOfferAcquisition(state)
    return state
end

--- 做空结算：现价 ≥ 开仓价×1.5 触发爆仓（保证金全损）
function StockSystem.SettleShort(state, newPrice)
    local short = state.shares.short
    if not short then return end
    if tonumber(newPrice) >= tonumber(short.openPrice) * 1.5 then
        state.company.cash = math.max(0, tonumber(state.company.cash) - tonumber(short.margin))
        state.shares.short = nil
        CompanyState.RecordTimeline(state, " 做空爆仓",
            "股价涨至 ¥" .. tostring(newPrice) .. "/股，空单被强平，损失保证金 ¥" .. tostring(math.floor(tonumber(short.margin))) .. "万。")
    end
end

--- 做空开仓：保证金 = 开仓市值×30%；股数上限 = 流通盘
function StockSystem.OpenShort(state, shares)
    state = CompanyState.Ensure(state)
    if not state.shares.public then return false, "尚未上市" end
    if state.shares.short then return false, "已有未平仓空单" end
    shares = math.floor(tonumber(shares) or 0)
    if shares < 20 then return false, "做空至少 20 万股" end
    local maxShort = math.floor((tonumber(state.shares.floatPct) or 0) / 100 * StockSystem.SHARES_OUT)
    if shares > maxShort then return false, "做空股数超过可借流通盘（" .. tostring(maxShort) .. " 万股）" end
    local price = tonumber(state.shares.sharePrice) or 1
    local margin = math.max(1, math.floor(price * shares * 0.30 + 0.5))
    if tonumber(state.company.cash) < margin then return false, "保证金不足（需 ¥" .. tostring(margin) .. "万）" end
    state.company.cash = tonumber(state.company.cash) - margin
    state.shares.short = {
        shares = shares,
        openPrice = price,
        margin = margin,
        openedWeek = tonumber(state.company.week) or 1,
    }
    CompanyState.RecordTimeline(state, " 做空开仓",
        "以 ¥" .. tostring(price) .. "/股 做空 " .. tostring(shares) .. " 万股，保证金 ¥" .. tostring(margin) .. "万。")
    return true, margin
end

--- 做空平仓：盈亏(万) = (开仓价-现价)×股数；返还保证金
function StockSystem.CloseShort(state)
    state = CompanyState.Ensure(state)
    local short = state.shares.short
    if not short then return false, "没有持仓空单" end
    local price = tonumber(state.shares.sharePrice) or tonumber(short.openPrice)
    local profit = math.floor((tonumber(short.openPrice) - price) * tonumber(short.shares) + 0.5)
    state.company.cash = math.max(0, tonumber(state.company.cash) + tonumber(short.margin) + profit)
    state.shares.short = nil
    CompanyState.RecordTimeline(state, profit >= 0 and " 做空平仓获利" or " 做空平仓亏损",
        "以 ¥" .. tostring(price) .. "/股 平仓 " .. tostring(short.shares) .. " 万股，盈亏 ¥" .. tostring(math.abs(profit)) .. "万（" .. (profit >= 0 and "盈利" or "亏损") .. "）。")
    return true, profit
end

--- 增发融资：发行 10% 新股（95% 承销价），稀释全体股东，冷却 4 周
function StockSystem.SecondaryOffer(state)
    state = CompanyState.Ensure(state)
    if not state.shares.public then return false, "尚未上市" end
    local s = state.shares
    local week = tonumber(state.company.week) or 1
    if week - tonumber(s.lastSecondaryWeek or 0) < 4 then return false, "增发冷却中（每 4 周一次）" end
    local raise = math.floor(tonumber(s.sharePrice) * StockSystem.SHARES_OUT * 0.10 * 0.95)
    if raise <= 0 then return false, "当前股价无法募资" end
    state.company.cash = tonumber(state.company.cash) + raise
    s.founder = math.floor(tonumber(s.founder) * 0.9 + 0.5)
    s.investors = math.floor(tonumber(s.investors) * 0.9 + 0.5)
    s.floatPct = math.max(0, 100 - s.founder - s.investors)
    s.lastSecondaryWeek = week
    s.sharePrice = math.floor(tonumber(s.sharePrice) * 0.98 * 10 + 0.5) / 10
    CompanyState.RecordTimeline(state, " 增发融资",
        "增发 10% 新股，募集 ¥" .. tostring(raise) .. "万，原有股东持股稀释。")
    return true, raise
end

--- 梯度公开回购（Phase 2）：支持 3%、5%、10% 梯度回购流通股，严格遵守最低运营储备金约束
function StockSystem.BuyBack(state, tierPct, reserveLimit)
    state = CompanyState.Ensure(state)
    if not state.shares.public then return false, 0, "尚未上市" end
    local s = state.shares
    tierPct = tonumber(tierPct) or 5
    reserveLimit = tonumber(reserveLimit) or 100
    if tierPct ~= 3 and tierPct ~= 5 and tierPct ~= 10 then
        tierPct = 5
    end
    local week = tonumber(state.company.week) or 1
    local lastBuy = tonumber(s.lastBuybackWeek or 0)
    if lastBuy > 0 and week >= lastBuy and (week - lastBuy < 2) then
        local wait = 2 - (week - lastBuy)
        return false, 0, "回购冷却中，还需等待 " .. tostring(wait) .. " 周"
    end
    local curFloat = tonumber(s.floatPct) or 0
    if curFloat < tierPct + 2 then
        return false, 0, "流通盘不足：回购 " .. tierPct .. "% 需至少保留 2% 市场流通股（当前仅 " .. curFloat .. "%）"
    end
    local marketCap = (tonumber(s.sharePrice) or 0) * StockSystem.SHARES_OUT
    local cost = math.floor(marketCap * (tierPct / 100) * 1.02 + 0.5)
    local curCash = tonumber(state.company.cash) or 0
    if curCash - cost < reserveLimit then
        return false, 0, "现金不足：回购需 ¥" .. tostring(cost) .. "万，并需保留 ¥" .. tostring(reserveLimit) .. "万 运营储备金（当前现金 ¥" .. tostring(curCash) .. "万）"
    end
    state.company.cash = curCash - cost
    s.floatPct = math.max(2, curFloat - tierPct)
    s.founder = math.min(100, (tonumber(s.founder) or 0) + tierPct)
    local boostRate = tierPct == 3 and 0.02 or (tierPct >= 10 and 0.05 or 0.03)
    s.sharePrice = math.floor((tonumber(s.sharePrice) or 0) * (1 + boostRate) * 10 + 0.5) / 10
    s.sentiment = math.min(100, (tonumber(s.sentiment) or 50) + (tierPct >= 10 and 8 or 5))
    s.lastBuybackWeek = week
    s.buybackHistory = s.buybackHistory or {}
    table.insert(s.buybackHistory, {
        week = week,
        sharesPct = tierPct,
        cost = cost,
        price = s.sharePrice,
    })
    CompanyState.RecordTimeline(state, " 股份回购",
        "以 ¥" .. tostring(cost) .. "万 回购并注销 " .. tostring(tierPct) .. "% 流通股，创始人持股升至 " .. tostring(s.founder) .. "%，股价升至 ¥" .. tostring(s.sharePrice) .. "/股。")
    return true, cost, "回购成功"
end

--- 并购目标：战力第 2-4 名的 AI 队，成本 = 战力×12（万）
function StockSystem.GetMergerTargets(state)
    state = CompanyState.Ensure(state)
    local candidates = {}
    for _, t in ipairs(LeagueCatalog.TEAMS) do
        if t.id ~= "legacy" then table.insert(candidates, t) end
    end
    table.sort(candidates, function(a, b) return a.power > b.power end)
    local targets = {}
    for i = 2, 4 do
        local t = candidates[i]
        if t then
            table.insert(targets, {
                id = t.id,
                name = t.name,
                power = t.power,
                cost = t.power * 12,
            })
        end
    end
    return targets
end

--- 并购：现金收购 AI 队品牌，粉丝/声誉/市值 +20%，每赛季 1 次
function StockSystem.Merge(state, targetId)
    state = CompanyState.Ensure(state)
    if not state.shares.public then return false, "上市后才能发起并购" end
    local season = tonumber(state.company.seasons) or 0
    if tonumber(state.shares.mergersSeason or -1) ~= season then
        state.shares.mergersSeason = season
        state.shares.mergersUsed = 0
    end
    if tonumber(state.shares.mergersUsed or 0) >= 1 then return false, "每赛季只能发起一次并购" end
    local target = nil
    for _, t in ipairs(StockSystem.GetMergerTargets(state)) do
        if t.id == targetId then target = t break end
    end
    if not target then return false, "目标不存在" end
    if tonumber(state.company.cash) < target.cost then return false, "现金不足（需 ¥" .. tostring(target.cost) .. "万）" end
    state.company.cash = tonumber(state.company.cash) - target.cost
    state.company.fans = tonumber(state.company.fans) + 80000
    state.company.reputation = clamp(tonumber(state.company.reputation) + 8, 0, 100)
    state.shares.mergersUsed = 1
    state.shares.sharePrice = math.floor(tonumber(state.shares.sharePrice) * 1.20 * 10 + 0.5) / 10
    state.shares.mergerNames = state.shares.mergerNames or {}
    table.insert(state.shares.mergerNames, target.name)
    CompanyState.RecordTimeline(state, " 并购完成",
        "以 ¥" .. tostring(target.cost) .. "万 收购 " .. target.name .. "，品牌并入集团，股价 +20%。")
    return true, target
end

--- 被并购要约：上市 + 估值≥¥4000万 + 第 3 周后，每周 8% 概率
function StockSystem.MaybeOfferAcquisition(state)
    state = CompanyState.Ensure(state)
    local s = state.shares
    if not s.public or s.acquired then return end
    local week = tonumber(state.company.week) or 1
    if week < 3 then return end
    if week < tonumber(s.nextOfferWeek or 0) then return end
    if FinanceSystem.GetValuation(state) < 4000 then return end
    if math.random() >= 0.08 then return end
    local buyer = StockSystem.BUYERS[math.random(#StockSystem.BUYERS)]
    s.nextOfferWeek = week + 6
    s.acquisition = {
        week = week,
        clubName = buyer,
        price = math.floor(FinanceSystem.GetValuation(state) * 1.2),
        expiresWeek = week + 1,
    }
    CompanyState.RecordTimeline(state, " 并购要约",
        buyer .. " 等机构对 " .. state.company.name .. " 提出收购要约（¥" .. tostring(s.acquisition.price) .. "万），可在下周前决定。")
    return state
end

function StockSystem.AcceptAcquisition(state)
    state = CompanyState.Ensure(state)
    local offer = state.shares.acquisition
    if not offer then return false, "当前没有收购要约" end
    if tonumber(state.company.week) > tonumber(offer.expiresWeek) then
        state.shares.acquisition = nil
        return false, "要约已过期"
    end
    state.company.cash = tonumber(state.company.cash) + tonumber(offer.price)
    state.shares.acquired = true
    state.shares.acquisition = nil
    CompanyState.RecordTimeline(state, " 资本退场",
        "接受机构收购，套现 ¥" .. tostring(offer.price) .. "万。")
    return true, offer
end

function StockSystem.DeclineAcquisition(state)
    state = CompanyState.Ensure(state)
    if not state.shares.acquisition then return false, "当前没有收购要约" end
    state.shares.acquisition = nil
    CompanyState.RecordTimeline(state, " 拒绝收购", "拒绝机构收购要约，保持独立经营。")
    return true
end

--- 分红（Proposal C 第1期）：现金派息回馈股东，换取粉丝与声望（市值管理手段之一）
--- 金额 = 现金的 10%（¥200万~¥2000万 区间）；冷却 4 周；股价小幅提振（信心信号）
local DIVIDEND_MIN = 200
local DIVIDEND_COOLDOWN = 4

function StockSystem.CanDividend(state)
    state = CompanyState.Ensure(state)
    if not state.shares.public then return false, "尚未上市" end
    if tonumber(state.company.cash) < DIVIDEND_MIN then
        return false, "现金不足（分红至少需 ¥" .. tostring(DIVIDEND_MIN) .. "万）"
    end
    local week = tonumber(state.company.week) or 1
    if week - tonumber(state.shares.lastDividendWeek or 0) < DIVIDEND_COOLDOWN then
        local wait = DIVIDEND_COOLDOWN - (week - tonumber(state.shares.lastDividendWeek or 0))
        return false, "分红冷却中，还需 " .. tostring(wait) .. " 周"
    end
    return true
end

function StockSystem.PayDividend(state)
    state = CompanyState.Ensure(state)
    local ok, reason = StockSystem.CanDividend(state)
    if not ok then return false, reason end
    local amount = clamp(math.floor(tonumber(state.company.cash) * 0.10), DIVIDEND_MIN, 2000)
    state.company.cash = tonumber(state.company.cash) - amount
    state.company.fans = tonumber(state.company.fans) + amount * 80
    state.company.reputation = clamp(tonumber(state.company.reputation) + 3, 0, 100)
    state.shares.sharePrice = math.floor(tonumber(state.shares.sharePrice) * 1.01 * 10 + 0.5) / 10
    state.shares.lastDividendWeek = tonumber(state.company.week) or 1
    CompanyState.RecordTimeline(state, " 股东分红",
        state.company.name .. " 派发现金股息 ¥" .. tostring(amount) .. "万，回馈股东，粉丝与声望提升，股价小幅提振。")
    return true, amount
end

--- IR & PR 市值管理活动（Phase 2）
function StockSystem.RunIrCampaign(state, campaignId)
    state = CompanyState.Ensure(state)
    if not state.shares.public then return false, "尚未上市", nil end
    local cfg = StockSystem.IR_CAMPAIGNS[campaignId]
    if not cfg then return false, "未知公关活动: " .. tostring(campaignId), nil end
    state.shares.irCooldowns = state.shares.irCooldowns or {}
    local cd = tonumber(state.shares.irCooldowns[campaignId]) or 0
    if cd > 0 then
        return false, cfg.name .. " 冷却中，还需等待 " .. cd .. " 周", nil
    end
    local curCash = tonumber(state.company.cash) or 0
    if curCash < cfg.cost then
        return false, "现金不足：开展 " .. cfg.name .. " 需 ¥" .. cfg.cost .. "万（当前现金 ¥" .. curCash .. "万）", nil
    end

    local curCred = tonumber(state.shares.credibility) or 70
    local curSent = tonumber(state.shares.sentiment) or 50

    -- 信誉破产风险：credibility < 40 时，blitz 极易遭做空机构与媒体质疑造假，产生负面反噬
    if curCred < 40 and campaignId == "blitz" then
        state.company.cash = curCash - cfg.cost
        state.shares.irCooldowns[campaignId] = cfg.cooldown
        state.shares.sharePrice = math.floor((tonumber(state.shares.sharePrice) or 0) * 0.95 * 10 + 0.5) / 10
        state.shares.credibility = math.max(0, curCred - 5)
        state.shares.sentiment = math.max(0, curSent - 10)
        CompanyState.RecordTimeline(state, " PR风暴反噬", "在市场信誉低迷（" .. curCred .. "）期强推高调宣发，遭遇做空机构造假质疑与监管调查，股价重挫 5%！")
        return false, "信誉过低宣发反噬：遭遇做空机构造假质疑与监管调查，股价受挫！", {
            backfire = true,
            price = state.shares.sharePrice,
            credibility = state.shares.credibility,
            sentiment = state.shares.sentiment,
        }
    end

    -- 情绪高位边际效用递减 (sentiment > 80)
    if curSent > 80 then
        state.company.cash = curCash - cfg.cost
        state.shares.irCooldowns[campaignId] = cfg.cooldown
        local actualSent = math.floor(cfg.sentimentDelta * 0.5)
        state.shares.sentiment = math.min(100, curSent + actualSent)
        state.shares.credibility = math.max(0, curCred - 3) -- 过度炒作损耗信誉
        if cfg.priceBoost > 0 then
            state.shares.sharePrice = math.floor((tonumber(state.shares.sharePrice) or 0) * (1 + cfg.priceBoost * 0.5) * 10 + 0.5) / 10
        end
        CompanyState.RecordTimeline(state, " " .. cfg.name, "开展 " .. cfg.name .. "，因市场情绪已处高位（" .. curSent .. "），效果减半（情绪 +" .. actualSent .. "），过度营销损耗 3 点信誉。")
        return true, cfg.name .. " 执行完成（情绪高位边际递减，信誉 -3）", {
            sentiment = state.shares.sentiment,
            credibility = state.shares.credibility,
            price = state.shares.sharePrice,
        }
    end

    -- 正常执行
    state.company.cash = curCash - cfg.cost
    state.shares.irCooldowns[campaignId] = cfg.cooldown
    state.shares.sentiment = math.min(100, curSent + cfg.sentimentDelta)
    if campaignId == "briefing" then
        state.shares.credibility = math.min(100, curCred + 2)
    elseif campaignId == "roadshow" then
        state.shares.credibility = math.min(100, curCred + 1)
    elseif campaignId == "blitz" then
        state.shares.credibility = math.max(0, curCred - 2)
    end
    if cfg.priceBoost > 0 then
        state.shares.sharePrice = math.floor((tonumber(state.shares.sharePrice) or 0) * (1 + cfg.priceBoost) * 10 + 0.5) / 10
    end
    CompanyState.RecordTimeline(state, " " .. cfg.name, "成功开展 " .. cfg.name .. "，情绪 +" .. cfg.sentimentDelta .. "，稳定资本市场信心。")
    return true, cfg.name .. " 开展成功！市场情绪 +" .. cfg.sentimentDelta .. "！", {
        sentiment = state.shares.sentiment,
        credibility = state.shares.credibility,
        price = state.shares.sharePrice,
    }
end

--- 行情快照（UI 用）
function StockSystem.GetQuote(state)
    state = CompanyState.Ensure(state)
    local s = state.shares
    if not s.public then return { public = false } end
    local price = tonumber(s.sharePrice) or 0
    local prev = tonumber(s.prevPrice) or price
    local change = prev > 0 and math.floor((price - prev) / prev * 100 + 0.5) or 0
    return {
        public = true,
        ticker = s.ticker or "",
        price = price,
        change = change,
        marketCap = math.floor(price * StockSystem.SHARES_OUT),
        floatPct = tonumber(s.floatPct) or 0,
        history = s.history or {},
        short = s.short,
        acquisition = s.acquisition,
        acquired = s.acquired == true,
        founder = tonumber(s.founder) or 100,
        investors = tonumber(s.investors) or 0,
        -- Phase 2 properties
        rivalShort = s.rivalShort,
        sentiment = tonumber(s.sentiment) or 50,
        credibility = tonumber(s.credibility) or 70,
        irCooldowns = s.irCooldowns or {},
    }
end

return StockSystem
