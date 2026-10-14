-- StockScreen.lua — 股票市场 (real data: quote/history/short/acquisition/merger via StockSystem)
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

    if lastMsg and lastMsg ~= "" then
        table.insert(blocks, { kind = "alert", lines = { { lastMsg, DS.C.gold } } })
        lastMsg = nil
    end

    -- 1. IPO 入口
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
    local chg = num(quote.change, 0)
    local chgCol = chg > 0 and DS.C.error or (chg < 0 and DS.C.success or DS.C.muted)
    local chgStr = (chg > 0 and "+" or "") .. tostring(chg) .. "%"
    table.insert(blocks, { kind = "tiles", cols = 2, items = {
        { "股价", "¥" .. tostring(num(quote.price, 0)) },
        { "涨跌", chgStr },
        { "市值", fmtWan(quote.marketCap) },
        { "流通占比", tostring(num(quote.floatPct, 0)) .. "%" },
    } })

    -- 3. 股价走势（最近 8 周）
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

    -- 4. 资本操作
    table.insert(blocks, { kind = "sectionhdr", title = "资本操作", right = "" })
    table.insert(blocks, { kind = "cta", label = "增发 10% 新股 · 募资回流现金", onClick = function()
        local ok, err = pcall(function() StockSystem.SecondaryOffer(state) require("SaveManager").Save(state) end)
        lastMsg = ok and "已增发 10% 新股，现金回流" or ("增发失败：" .. tostring(err))
        ctx.nav("stock")
    end })
    table.insert(blocks, { kind = "cta", label = "回购 5% 流通股 · 拉升股价 +3%", onClick = function()
        local ok, err = pcall(function() StockSystem.BuyBack(state) require("SaveManager").Save(state) end)
        lastMsg = ok and "已回购 5% 流通股，股价 +3%" or ("回购失败：" .. tostring(err))
        ctx.nav("stock")
    end })
    table.insert(blocks, { kind = "cta", label = "股东分红 · 派息（现金10%，涨粉丝声望）", onClick = function()
        local ok, err = pcall(function() StockSystem.PayDividend(state) require("SaveManager").Save(state) end)
        lastMsg = ok and "已派发现金股息，粉丝与声望提升" or ("分红失败：" .. tostring(err))
        ctx.nav("stock")
    end })

    -- 5. 做空仓位
    local short = quote.short
    if short then
        local cur = num(quote.price, 0)
        local openP = num(short.openPrice, 0)
        local pnl = (openP - cur) * num(short.shares, 0)
        table.insert(blocks, { kind = "sectionhdr", title = "做空仓位", right = "" })
        table.insert(blocks, { kind = "kvrows", title = "", rows = {
            { "做空股数", tostring(num(short.shares, 0)) .. " 万股", DS.C.muted },
            { "开仓价", "¥" .. tostring(openP), DS.C.muted },
            { "现价", "¥" .. tostring(cur), DS.C.muted },
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

    -- 6. 机构收购要约
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

    -- 7. 并购目标
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
