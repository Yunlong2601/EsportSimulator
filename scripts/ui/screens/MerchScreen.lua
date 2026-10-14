-- MerchScreen.lua — 周边 (real data: shop data / revenue via MerchSystem)
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
    local MerchSystem = require("MerchSystem")

    local blocks = {}

    if lastMsg and lastMsg ~= "" then
        table.insert(blocks, { kind = "alert", lines = { { lastMsg, DS.C.gold } } })
        lastMsg = nil
    end

    -- 1. 解锁状态
    local unlocked = true
    pcall(function() unlocked = MerchSystem.IsUnlocked(state) end)
    if not unlocked then
        table.insert(blocks, { kind = "alert", lines = { { "周边商店未解锁 · 需俱乐部评级提升", DS.C.warning } } })
        return blocks
    end

    -- 2. 收入概览
    local totalRev, lastRev = 0, 0
    pcall(function()
        totalRev = MerchSystem.GetTotalRevenue(state)
        lastRev = MerchSystem.GetLastWeekRevenue(state)
    end)
    table.insert(blocks, { kind = "kpi", "周边总收入 " .. fmtWan(totalRev) .. " · 上周 " .. fmtWan(lastRev) .. " · 粉丝 " .. tostring(math.floor(num(state.company.fans, 0) / 100) / 100) .. "万" })

    -- 3. 商品列表
    local shop = {}
    pcall(function() shop = MerchSystem.GetShopData(state) end)
    table.insert(blocks, { kind = "sectionhdr", title = "商品列表", right = "点击生产/调价" })
    if #shop > 0 then
        for _, sku in ipairs(shop) do
            local status = sku.listed and "上架中" or "已下架"
            table.insert(blocks, { kind = "list", safe(sku.name, "商品") .. " · 库存 " .. tostring(num(sku.stock, 0)) .. " · 定价 ¥" .. tostring(num(sku.price, 0)) .. " · " .. status })
            table.insert(blocks, { kind = "cta", label = "生产 " .. safe(sku.name, "") .. " ×100（需求 " .. tostring(num(sku.demand, 0)) .. "）", onClick = function()
                local ok, err = pcall(function()
                    MerchSystem.Produce(state, sku.id, 100)
                    require("SaveManager").Save(state)
                end)
                lastMsg = ok and ("已生产 " .. safe(sku.name, "商品") .. " ×100") or ("生产失败：" .. tostring(err))
                ctx.nav("merch")
            end })
            table.insert(blocks, { kind = "cta", label = (sku.listed and "下架 " or "上架 ") .. safe(sku.name, ""), onClick = function()
                local ok, err = pcall(function()
                    MerchSystem.ToggleListing(state, sku.id)
                    require("SaveManager").Save(state)
                end)
                lastMsg = ok and ((sku.listed and "已下架 " or "已上架 ") .. safe(sku.name, "商品")) or ("操作失败：" .. tostring(err))
                ctx.nav("merch")
            end })
        end
        -- 调价快捷：第一个 SKU ±10%
        local first = shop[1]
        if first then
            table.insert(blocks, { kind = "dualcta",
                left = first.name .. " 降价10%", right = first.name .. " 提价10%",
                sub = "价格影响需求转化；基础价 ¥" .. tostring(num(first.basePrice, 0)),
                leftAction = function()
                    local ok, err = pcall(function()
                        MerchSystem.SetPrice(state, first.id, -0.10)
                        require("SaveManager").Save(state)
                    end)
                    lastMsg = ok and (first.name .. " 已降价10%") or ("调价失败：" .. tostring(err))
                    ctx.nav("merch")
                end,
                rightAction = function()
                    local ok, err = pcall(function()
                        MerchSystem.SetPrice(state, first.id, 0.10)
                        require("SaveManager").Save(state)
                    end)
                    lastMsg = ok and (first.name .. " 已提价10%") or ("调价失败：" .. tostring(err))
                    ctx.nav("merch")
                end })
        end
    else
        table.insert(blocks, { kind = "list", "暂无商品数据" })
    end

    return blocks
end

local MerchScreen = {}

function MerchScreen.Build(navigate)
    local ctx = { nav = navigate }
    local blocks = buildBlocks(ctx)
    local nodes = Kit.renderBlocks(blocks, ctx)
    return AppShell.Build(navigate, "merch", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return MerchScreen
