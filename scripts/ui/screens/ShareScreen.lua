-- ShareScreen.lua — 股权 (real data: founder/investors/rounds via ShareSystem + StockSystem)
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local Kit = require("ui.WireframeKit")
local AppShell = require("ui.AppShell")
local CompanyState = require("CompanyState")

local function num(v, d) return tonumber(v) or d end
local function safe(v, d) return v == nil and (d or "") or v end

-- 模块级反馈缓冲：跨渲染周期保留上一次操作反馈
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
    local ShareSystem = require("ShareSystem")
    local StockSystem = require("StockSystem")

    local shares = state.shares or {}
    local founder = num(shares.founder, 100)
    local investors = num(shares.investors, 0)
    local public = shares.public == true

    local blocks = {}

    if lastMsg and lastMsg ~= "" then
        table.insert(blocks, { kind = "alert", lines = { { lastMsg, DS.C.gold } } })
        lastMsg = nil
    end

    -- 1. 上市入口 / 状态
    local canIpo, ipoReason = false, ""
    if not public then
        pcall(function() canIpo, ipoReason = StockSystem.CanIpo(state) end)
    end
    if public then
        table.insert(blocks, { kind = "alert", lines = { { "已上市 · " .. safe(shares.ticker, "") .. " · 股价 ¥" .. tostring(num(shares.sharePrice, 0)) .. "/股", DS.C.success } } })
    elseif canIpo then
        table.insert(blocks, { kind = "cta", label = "公开上市 IPO · 进入股票市场", onClick = function() ctx.nav("stock") end })
    else
        table.insert(blocks, { kind = "alert", lines = { { "未上市 · " .. safe(ipoReason, "完成融资后可 IPO"), DS.C.warning } } })
    end

    -- 2. 持股结构
    table.insert(blocks, { kind = "tiles", cols = 3, items = {
        { "创始人", tostring(founder) .. "%" },
        { "投资人", tostring(investors) .. "%" },
        { "流通股", public and (tostring(num(shares.floatPct, 0)) .. "%") or "—" },
    } })

    -- 3. 融资轮次
    table.insert(blocks, { kind = "sectionhdr", title = "融资轮次", right = "" })
    local rounds = shares.rounds or {}
    if #rounds > 0 then
        for _, r in ipairs(rounds) do
            table.insert(blocks, { kind = "list", safe(r.title, "融资") .. " · 募资 " .. fmtWan(r.raised) .. " · 第" .. tostring(num(r.week, 0)) .. "周 · 创始人降至 " .. tostring(num(r.founderAfter, 0)) .. "%" })
        end
    else
        table.insert(blocks, { kind = "list", "尚未完成融资" })
    end

    -- 下一轮融资 CTA
    local nextRound = nil
    pcall(function() nextRound = ShareSystem.GetNextRound(state) end)
    if nextRound and not public then
        table.insert(blocks, { kind = "cta", label = safe(nextRound.title, "下一轮") .. "融资 · 募资 " .. fmtWan(nextRound.raised) .. "（创始人→" .. tostring(num(nextRound.founderAfter, 0)) .. "%）", onClick = function()
            local ok, err = pcall(function()
                ShareSystem.RaiseRound(state)
                require("SaveManager").Save(state)
            end)
            lastMsg = ok and "已完成新一轮融资" or ("融资失败：" .. tostring(err))
            ctx.nav("shares")
        end })
    end

    -- 4. 股份回购（私有）
    if not public then
        table.insert(blocks, { kind = "cta", label = "股份回购 · 回购 5%（投资人→创始人）", onClick = function()
            local ok, err = pcall(function()
                ShareSystem.BuyBack(state)
                require("SaveManager").Save(state)
            end)
            lastMsg = ok and "已回购 5% 股份（投资人→创始人）" or ("回购失败：" .. tostring(err))
            ctx.nav("shares")
        end })
    else
        table.insert(blocks, { kind = "cta", label = "进入公开股票市场（增发/回购/做空/并购）", onClick = function() ctx.nav("stock") end })
    end

    -- 5. 已上市时的资本操作快捷入口
    if public then
        table.insert(blocks, { kind = "sectionhdr", title = "资本操作", right = "" })
        table.insert(blocks, { kind = "cta", label = "增发 10% 新股（4周冷却）", onClick = function()
            local ok, err = pcall(function()
                StockSystem.SecondaryOffer(state)
                require("SaveManager").Save(state)
            end)
            lastMsg = ok and "已增发 10% 新股，现金回流" or ("增发失败：" .. tostring(err))
            ctx.nav("shares")
        end })
        table.insert(blocks, { kind = "cta", label = "回购 5% 流通股（2周冷却）", onClick = function()
            local ok, err = pcall(function()
                StockSystem.BuyBack(state)
                require("SaveManager").Save(state)
            end)
            lastMsg = ok and "已回购 5% 流通股，股价 +3%" or ("回购失败：" .. tostring(err))
            ctx.nav("shares")
        end })
    end

    return blocks
end

local ShareScreen = {}

function ShareScreen.Build(navigate)
    local ctx = { nav = navigate }
    local blocks = buildBlocks(ctx)
    local nodes = Kit.renderBlocks(blocks, ctx)
    return AppShell.Build(navigate, "shares", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return ShareScreen
