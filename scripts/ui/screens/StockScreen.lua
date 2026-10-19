-- StockScreen.lua — 股票市场 (real data: quote/history/short/acquisition/merger/rivalShort/buyback/IR via StockSystem)
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local Kit = require("ui.WireframeKit")
local AppShell = require("ui.AppShell")
local CompanyState = require("CompanyState")

local function num(v, d) return tonumber(v) or d end
local function safe(v, d) return v == nil and (d or "") or v end

local lastMsg = nil

local function fmtWan(n)
    n = num(n, 0)
    if n >= 10000 then
        return "¥" .. tostring(math.floor(n / 1000) / 10) .. "亿"
    end
    return "¥" .. tostring(math.floor(n * 10) / 10) .. "万"
end

local function buildBlocks(ctx)
    local state = CompanyState.Ensure(CompanyState.GetState())
    local StockSystem = require("StockSystem")

    local blocks = {}

    -- 0. 顶部即时操作反馈横幅
    if lastMsg and lastMsg ~= "" then
        table.insert(blocks, { kind = "alert", lines = { { lastMsg, DS.C.gold } } })
        lastMsg = nil
    end

    -- 1. IPO 入口与状态检查
    local quote = nil
    pcall(function() quote = StockSystem.GetQuote(state) end)
    local isPublic = quote and quote.public == true

    if not isPublic then
        local canIpo, reason = false, ""
        pcall(function() canIpo, reason = StockSystem.CanIpo(state) end)
        if canIpo then
            table.insert(blocks, { kind = "cta", label = "公开上市 IPO · 以估值锚定价发行 12% 流通股", onClick = function()
                local ok, err = pcall(function()
                    StockSystem.Ipo(state)
                    require("SaveManager").Save(state)
                end)
                lastMsg = ok and "已成功上市，股权进入流通" or ("上市失败：" .. tostring(err))
                ctx.nav("stock")
            end })
        else
            table.insert(blocks, { kind = "alert", lines = { { "上市之路 · " .. safe(reason, "条件不足"), DS.C.warning } } })
        end
        table.insert(blocks, { kind = "cta", label = "返回股权页", onClick = function() ctx.nav("shares") end })
        return blocks
    end

    -- 2. 行情卡
    local curPrice = num(quote.price, 0)
    local chg = num(quote.change, 0)
    local chgCol = chg > 0 and DS.C.error or (chg < 0 and DS.C.success or DS.C.muted)
    local chgStr = (chg > 0 and "+" or "") .. tostring(chg) .. "%"
    local curFloat = num(quote.floatPct, 0)
    table.insert(blocks, { kind = "tiles", cols = 2, items = {
        { "股价", "¥" .. tostring(curPrice) },
        { "涨跌", chgStr },
        { "市值", fmtWan(quote.marketCap) },
        { "流通占比", tostring(curFloat) .. "%" },
    } })

    -- 3. 敌对机构做空突袭威胁卡 (Rival Short Attack Threat Card) [CONDITIONAL]
    local rs = quote.rivalShort
    if rs and rs.active then
        local openP = num(rs.openPrice, 0)
        local targetP = num(rs.targetPrice, 0)
        local squeezeHurdle = math.floor(openP * 1.20 * 10 + 0.5) / 10
        local defLevel = num(rs.defenseLevel, 0)
        local pressureReduction = math.min(6, defLevel * 3)
        local netPressure = math.max(2, 8 - pressureReduction)
        local weeksRemaining = num(rs.weeksLeft, 0)

        table.insert(blocks, { kind = "sectionhdr", title = "⚠️ 机构做空突袭 (Hostile Short Attack)", right = safe(rs.institution, "敌对机构") })
        table.insert(blocks, {
            kind = "alert",
            lines = {
                { "⚠️ " .. safe(rs.institution, "做空机构") .. " 正在做空打压我方股票！", DS.C.error },
                { "做空机构筹码: " .. tostring(num(rs.shortInterest, 0)) .. "% 流通盘 | 打压施压: -" .. tostring(netPressure) .. "%/周", DS.C.textDim },
            }
        })
        table.insert(blocks, {
            kind = "kvrows",
            title = "做空攻防态势情报",
            rows = {
                { "做空机构", safe(rs.institution, "机构"), DS.C.gold },
                { "做空仓位比例", tostring(num(rs.shortInterest, 0)) .. "%", DS.C.error },
                { "做空建仓价", "¥" .. tostring(openP) .. "/股", DS.C.muted },
                { "空头目标价", "¥" .. tostring(targetP) .. "/股", DS.C.muted },
                { "防御剩余时限", tostring(weeksRemaining) .. " 周 (已护盘 " .. tostring(defLevel) .. " 次)", DS.C.warning },
                { "轧空触发线 (+20%)", "¥" .. tostring(squeezeHurdle) .. " (现价 ¥" .. tostring(curPrice) .. ")", curPrice >= squeezeHurdle and DS.C.success or DS.C.gold },
            }
        })

        -- 轧空反击 CTA 或防守动作 CTAs
        if curPrice >= squeezeHurdle then
            table.insert(blocks, {
                kind = "cta",
                label = "⚔️ 触发轧空反击 (Execute Short Squeeze) · 打爆空头",
                onClick = function()
                    local ok, success, msg, payout = pcall(function() return StockSystem.TriggerShortSqueeze(state) end)
                    if ok and success then
                        pcall(function() require("SaveManager").Save(state) end)
                        lastMsg = "💥 轧空反击大捷！" .. safe(rs.institution, "做空机构") .. " 惨遭强平爆仓，股价暴涨 +20%，斩获赔偿金 ¥" .. tostring(payout) .. "万！"
                    else
                        lastMsg = "轧空反击受限：" .. tostring(msg or success)
                    end
                    ctx.nav("stock")
                end
            })
        else
            table.insert(blocks, {
                kind = "cta",
                label = "🛡️ 资金注入防御 · ¥150万 (股价+10%, 情绪+10)",
                onClick = function()
                    local ok, success, msg, cost = pcall(function() return StockSystem.DefendShortAttack(state, "capital") end)
                    if ok and success then
                        pcall(function() require("SaveManager").Save(state) end)
                        lastMsg = "资金护盘成功：注入 ¥150万 主力托底资金，股价回升 10%！"
                    else
                        lastMsg = "护盘受限：" .. tostring(msg or success)
                    end
                    ctx.nav("stock")
                end
            })
            table.insert(blocks, {
                kind = "cta",
                label = "📢 澄清公告防御 · ¥30万 (股价+3%, 情绪+8, 信誉+3)",
                onClick = function()
                    local ok, success, msg, cost = pcall(function() return StockSystem.DefendShortAttack(state, "statement") end)
                    if ok and success then
                        pcall(function() require("SaveManager").Save(state) end)
                        lastMsg = "官方澄清发布成功：市场情绪与信誉双重回升！"
                    else
                        lastMsg = "澄清公告受限：" .. tostring(msg or success)
                    end
                    ctx.nav("stock")
                end
            })
            table.insert(blocks, {
                kind = "cta",
                label = "💼 回购增持防御 · ¥100万 (股价+6%, 流通盘-1%, 创始人持股+1%)",
                onClick = function()
                    local ok, success, msg, cost = pcall(function() return StockSystem.DefendShortAttack(state, "counter_buy") end)
                    if ok and success then
                        pcall(function() require("SaveManager").Save(state) end)
                        lastMsg = "反向回购护盘成功：收回 1% 流通筹码注销，股价拉升 6%！"
                    else
                        lastMsg = "回购增持受限：" .. tostring(msg or success)
                    end
                    ctx.nav("stock")
                end
            })
        end
    end

    -- 4. 投资者关系与市值管理 (IR & PR Market Campaigns)
    local curSent = num(quote.sentiment, 50)
    local curCred = num(quote.credibility, 70)
    local sentLabel = curSent >= 75 and "高涨" or (curSent >= 45 and "平稳" or (curSent >= 30 and "低迷" or "恐慌"))
    local credLabel = curCred >= 70 and "优良" or (curCred >= 40 and "警戒" or "破产边缘")

    table.insert(blocks, { kind = "sectionhdr", title = "📢 投资者关系与市值管理 (IR & PR Campaigns)", right = "市值公关维护" })
    table.insert(blocks, { kind = "tiles", cols = 2, items = {
        { "市场情绪 (Sentiment)", tostring(curSent) .. "/100 · " .. sentLabel },
        { "机构信誉 (Credibility)", tostring(curCred) .. "/100 · " .. credLabel },
    } })

    local cds = quote.irCooldowns or {}
    local cdBriefing = num(cds.briefing, 0)
    local cdRoadshow = num(cds.roadshow, 0)
    local cdBlitz = num(cds.blitz, 0)

    -- 4.1 媒体通气会
    local labelBriefing = cdBriefing > 0
        and ("媒体通气会 (冷却中 " .. cdBriefing .. "周)")
        or "媒体通气会 · ¥30万 (情绪+5, 信誉+2, 冷却2周)"
    table.insert(blocks, {
        kind = "cta",
        label = labelBriefing,
        onClick = function()
            local ok, success, msg, data = pcall(function() return StockSystem.RunIrCampaign(state, "briefing") end)
            if ok and success then
                pcall(function() require("SaveManager").Save(state) end)
                lastMsg = "媒体通气会开展成功：市场情绪 +5，信誉提升！"
            else
                lastMsg = "媒体通气会受限：" .. tostring(msg or success)
            end
            ctx.nav("stock")
        end
    })

    -- 4.2 机构路演交流
    local labelRoadshow = cdRoadshow > 0
        and ("机构路演交流 (冷却中 " .. cdRoadshow .. "周)")
        or "机构路演交流 · ¥80万 (情绪+12, 股价+3%, 冷却4周)"
    table.insert(blocks, {
        kind = "cta",
        label = labelRoadshow,
        onClick = function()
            local ok, success, msg, data = pcall(function() return StockSystem.RunIrCampaign(state, "roadshow") end)
            if ok and success then
                pcall(function() require("SaveManager").Save(state) end)
                lastMsg = "机构路演成功：市场情绪 +12，股价提振 +3%！"
            else
                lastMsg = "机构路演受限：" .. tostring(msg or success)
            end
            ctx.nav("stock")
        end
    })

    -- 4.3 战略级公关战役
    local labelBlitz = cdBlitz > 0
        and ("战略级公关战役 (冷却中 " .. cdBlitz .. "周)")
        or ("战略级公关战役 · ¥200万 (情绪+25, 股价+8%" .. (curCred < 40 and ", ⚠️信誉过低易反噬" or "") .. ")")
    table.insert(blocks, {
        kind = "cta",
        label = labelBlitz,
        onClick = function()
            local ok, success, msg, data = pcall(function() return StockSystem.RunIrCampaign(state, "blitz") end)
            if ok and success then
                pcall(function() require("SaveManager").Save(state) end)
                lastMsg = "战略公关战役大捷：情绪大幅拉升 +25，股价大涨 +8%！"
            elseif type(data) == "table" and data.backfire then
                pcall(function() require("SaveManager").Save(state) end)
                lastMsg = "⚠️ 公关严重反噬！因信誉过低遭遇造假质疑与监管调查，股价重挫 5%！"
            else
                lastMsg = "战略公关战役受限：" .. tostring(msg or success)
            end
            ctx.nav("stock")
        end
    })

    -- 5. 股票分级回购 (Tiered Stock Buybacks)
    local curWeek = num(state.company.week, 1)
    local lastBuy = num(state.shares.lastBuybackWeek, 0)
    local onCooldown = lastBuy > 0 and curWeek >= lastBuy and (curWeek - lastBuy < 2)
    local cooldownWeeks = onCooldown and (2 - (curWeek - lastBuy)) or 0
    local mCap = curPrice * StockSystem.SHARES_OUT
    local cost3 = math.floor(mCap * 0.03 * 1.02 + 0.5)
    local cost5 = math.floor(mCap * 0.05 * 1.02 + 0.5)
    local cost10 = math.floor(mCap * 0.10 * 1.02 + 0.5)

    table.insert(blocks, { kind = "sectionhdr", title = "💼 股票回购 (Share Repurchase)", right = "注销流通盘 · 提升控制权" })
    table.insert(blocks, {
        kind = "kvrows",
        title = "回购运作指标 (底线保留 ¥100万 储备金)",
        rows = {
            { "当前流通盘", tostring(curFloat) .. "% (上市红线: 最低保留 2%)", curFloat <= 5 and DS.C.warning or DS.C.muted },
            { "创始人持股比例", tostring(num(quote.founder, 100)) .. "%", DS.C.gold },
            { "回购冷却状态", onCooldown and ("冷却中 (还需 " .. cooldownWeeks .. " 周)") or "就绪 (每2周一次)", onCooldown and DS.C.warning or DS.C.success },
        }
    })

    local labelBuy3 = onCooldown and ("小额回购 3% · (冷却中: 还需 " .. cooldownWeeks .. " 周)")
        or ("小额回购 3% 流通股 · ¥" .. cost3 .. "万 (股价+2%, 控制权+3%)")
    local labelBuy5 = onCooldown and ("标准回购 5% · (冷却中: 还需 " .. cooldownWeeks .. " 周)")
        or ("标准回购 5% 流通股 · ¥" .. cost5 .. "万 (股价+3%, 控制权+5%)")
    local labelBuy10 = onCooldown and ("战略回购 10% · (冷却中: 还需 " .. cooldownWeeks .. " 周)")
        or ("战略回购 10% 流通股 · ¥" .. cost10 .. "万 (股价+5%, 控制权+10%)")

    local function doBuyback(tier)
        local ok, success, cost, msg = pcall(function() return StockSystem.BuyBack(state, tier, 100) end)
        if ok and success then
            pcall(function() require("SaveManager").Save(state) end)
            lastMsg = "已成功回购 " .. tier .. "% 流通股，耗资 ¥" .. tostring(cost) .. "万，控制权提升！"
        else
            lastMsg = "回购受限：" .. tostring(msg or cost)
        end
        ctx.nav("stock")
    end

    table.insert(blocks, { kind = "cta", label = labelBuy3, onClick = function() doBuyback(3) end })
    table.insert(blocks, { kind = "cta", label = labelBuy5, onClick = function() doBuyback(5) end })
    table.insert(blocks, { kind = "cta", label = labelBuy10, onClick = function() doBuyback(10) end })

    -- 6. 常规资本运作 (增发与分红)
    table.insert(blocks, { kind = "sectionhdr", title = "常规资本运作", right = "" })
    table.insert(blocks, { kind = "cta", label = "增发 10% 新股 · 募资回流现金", onClick = function()
        local ok, err = pcall(function() StockSystem.SecondaryOffer(state) require("SaveManager").Save(state) end)
        lastMsg = ok and "已增发 10% 新股，现金回流" or ("增发失败：" .. tostring(err))
        ctx.nav("stock")
    end })
    table.insert(blocks, { kind = "cta", label = "股东分红 · 派息（现金10%，涨粉丝声望）", onClick = function()
        local ok, err = pcall(function() StockSystem.PayDividend(state) require("SaveManager").Save(state) end)
        lastMsg = ok and "已派发现金股息，粉丝与声望提升" or ("分红失败：" .. tostring(err))
        ctx.nav("stock")
    end })

    -- 7. 股价走势（最近 8 周）
    table.insert(blocks, { kind = "sectionhdr", title = "股价走势", right = safe(quote.ticker, "") })
    local hist = quote.history or {}
    if #hist > 0 then
        local rows = {}
        for i = math.max(1, #hist - 7), #hist do
            local h = hist[i]
            local c = num(h.change, 0)
            table.insert(rows, {
                "第" .. tostring(num(h.week, 0)) .. "周",
                "¥" .. tostring(num(h.price, 0)),
                (c > 0 and "+" or "") .. tostring(c) .. "%",
                safe(h.reason, ""),
            })
        end
        table.insert(blocks, { kind = "table", title = "周 / 价格 / 涨跌 / 驱动", cols = { "周", "价格", "涨跌", "驱动" }, rows = rows })
    else
        table.insert(blocks, { kind = "list", "暂无交易记录" })
    end

    -- 8. 做空仓位 (个人持仓)
    local short = quote.short
    if short then
        local openP = num(short.openPrice, 0)
        local pnl = (openP - curPrice) * num(short.shares, 0)
        table.insert(blocks, { kind = "sectionhdr", title = "做空仓位", right = "" })
        table.insert(blocks, { kind = "kvrows", title = "", rows = {
            { "做空股数", tostring(num(short.shares, 0)) .. " 万股", DS.C.muted },
            { "开仓价", "¥" .. tostring(openP), DS.C.muted },
            { "现价", "¥" .. tostring(curPrice), DS.C.muted },
            { "浮动盈亏", (pnl >= 0 and "+" or "") .. fmtWan(pnl), pnl >= 0 and DS.C.success or DS.C.error },
            { "保证金", fmtWan(short.margin), DS.C.muted },
        } })
        table.insert(blocks, { kind = "cta", label = "平仓做空（现价结算）", onClick = function()
            local ok, err = pcall(function() StockSystem.CloseShort(state) require("SaveManager").Save(state) end)
            lastMsg = ok and "已平仓做空，结算盈亏" or ("平仓失败：" .. tostring(err))
            ctx.nav("stock")
        end })
    else
        table.insert(blocks, { kind = "cta", label = "做空开仓 · 20 万股（30% 保证金）", onClick = function()
            local ok, err = pcall(function() StockSystem.OpenShort(state, 20) require("SaveManager").Save(state) end)
            lastMsg = ok and "已开仓做空 20 万股" or ("开仓失败：" .. tostring(err))
            ctx.nav("stock")
        end })
    end

    -- 9. 机构收购要约
    local acq = quote.acquisition
    if acq then
        table.insert(blocks, { kind = "alert", lines = { {
            safe(acq.clubName, "机构") .. " 收购要约 · " .. fmtWan(acq.price) .. "（第" .. tostring(num(acq.expiresWeek, 0)) .. "周前决定）", DS.C.gold } } })
        table.insert(blocks, { kind = "cta", label = "接受要约（套现退场）", onClick = function()
            local ok, err = pcall(function() StockSystem.AcceptAcquisition(state) require("SaveManager").Save(state) end)
            lastMsg = ok and ("已接受 " .. safe(acq.clubName, "机构") .. " 收购要约，套现退场") or ("接受失败：" .. tostring(err))
            ctx.nav("stock")
        end })
        table.insert(blocks, { kind = "cta", label = "拒绝要约（保持独立）", onClick = function()
            local ok, err = pcall(function() StockSystem.DeclineAcquisition(state) require("SaveManager").Save(state) end)
            lastMsg = ok and "已拒绝收购要约，保持独立" or ("拒绝失败：" .. tostring(err))
            ctx.nav("stock")
        end })
    end

    -- 10. 并购目标
    if not (quote.acquired) then
        local targets = {}
        pcall(function() targets = StockSystem.GetMergerTargets(state) end)
        if #targets > 0 then
            table.insert(blocks, { kind = "sectionhdr", title = "机构并购（每赛季1次）", right = "" })
            for _, t in ipairs(targets) do
                table.insert(blocks, { kind = "cta", label = "并购 " .. safe(t.name, "?") .. " · 战力" .. tostring(num(t.power, 0)) .. " · " .. fmtWan(t.cost), onClick = function()
                    local ok, err = pcall(function() StockSystem.Merge(state, t.id) require("SaveManager").Save(state) end)
                    lastMsg = ok and ("已发起并购 " .. safe(t.name, "目标")) or ("并购失败：" .. tostring(err))
                    ctx.nav("stock")
                end })
            end
        end
    end

    table.insert(blocks, { kind = "cta", label = "返回股权页", onClick = function() ctx.nav("shares") end })

    return blocks
end

local StockScreen = {}

function StockScreen.Build(navigate)
    local ctx = { nav = navigate }
    local blocks = buildBlocks(ctx)
    local nodes = Kit.renderBlocks(blocks, ctx)
    return AppShell.Build(navigate, "stock", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return StockScreen
