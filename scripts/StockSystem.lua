-- StockSystem：公开股票市场（招牌玩法）
-- 上市 → 股价随战绩/转会/舆论每周波动 → 增发/回购/做空/并购四种资本操作。
-- 锚点：股价(元) = 估值(万)×0.01；总股本 1000 万股；现金/估值单位 ¥万。

local CompanyState = require("CompanyState")
local FinanceSystem = require("FinanceSystem")
local LeagueCatalog = require("LeagueCatalog")

local StockSystem = {}

StockSystem.SHARES_OUT = 1000 -- 万股（总股本固定）

StockSystem.BUYERS = { "星辰资本", "环宇基金", "极光控股", "天际投资", "蓝图集团" }

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

--- 每周股价结算：胜负 / 当周转会 / 社交热度 / 噪声，并向估值锚点回归
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
    if legacyWon == true then
        momentum = momentum + 0.05
        table.insert(reasons, "胜场提振")
    elseif legacyWon == false then
        momentum = momentum - 0.04
        table.insert(reasons, "失利承压")
    end
    local news = state.market.transferNews or {}
    if #news > 0 and tonumber(news[1].week) == tonumber(state.company.week) then
        local amount = tonumber(news[1].amount) or 0
        momentum = momentum + (amount >= 200 and 0.04 or 0.02)
        table.insert(reasons, "转会活跃")
    end
    local heat = tonumber(state.social and state.social.heat) or 50
    momentum = momentum + (heat - 50) * 0.004
    if heat >= 60 then table.insert(reasons, "舆论火热") elseif heat <= 35 then table.insert(reasons, "舆论冷淡") end
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

--- 公开回购：买回并注销 5% 流通股（2% 溢价），股价 +3%，控制权 +5%，冷却 2 周
function StockSystem.BuyBack(state)
    state = CompanyState.Ensure(state)
    if not state.shares.public then return false, "尚未上市" end
    local s = state.shares
    if tonumber(s.floatPct) < 10 then return false, "流通股不足 10%" end
    local week = tonumber(state.company.week) or 1
    if week - tonumber(s.lastBuybackWeek or 0) < 2 then return false, "回购冷却中（每 2 周一次）" end
    local marketCap = tonumber(s.sharePrice) * StockSystem.SHARES_OUT
    local cost = math.floor(marketCap * 0.05 * 1.02 + 0.5)
    if tonumber(state.company.cash) < cost then return false, "现金不足（需 ¥" .. tostring(cost) .. "万）" end
    state.company.cash = tonumber(state.company.cash) - cost
    s.floatPct = tonumber(s.floatPct) - 5
    s.founder = tonumber(s.founder) + 5
    s.sharePrice = math.floor(tonumber(s.sharePrice) * 1.03 * 10 + 0.5) / 10
    s.lastBuybackWeek = week
    CompanyState.RecordTimeline(state, " 公开回购",
        "以 ¥" .. tostring(cost) .. "万 回购并注销 5% 流通股，股价升至 ¥" .. tostring(s.sharePrice) .. "/股。")
    return true, cost
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
    }
end

return StockSystem
