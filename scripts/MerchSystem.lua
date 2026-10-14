-- MerchSystem：周边商城 / 俱乐部商店（P2-⑨）
-- 上架品类（队服/应援/选手联名），定价影响销量与粉丝；巨星联名溢价。
-- 收入喂 FinanceSystem 与估值；与 SponsorSystem/股票形成第三条现金流。
local CompanyState = require("CompanyState")
local LeagueCatalog = require("LeagueCatalog")
local PlayerEcoSystem = require("PlayerEcoSystem")

local MerchSystem = {}

-- 商品品类定义
MerchSystem.CATEGORIES = {
    jersey  = { id = "jersey",  name = "队服",      icon = "队服", baseCost = 20, basePrice = 60, fanBase = 100, demand = 1.0, desc = "经典队服，粉丝必备" },
    support = { id = "support", name = "应援物",    icon = "应援", baseCost = 5,  basePrice = 20, fanBase = 50,  demand = 1.2, desc = "应援棒/横幅，赛事现场热卖" },
    collab  = { id = "collab",  name = "选手联名",  icon = "联名", baseCost = 35, basePrice = 120, fanBase = 150, demand = 0.8, desc = "联名款，巨星溢价" },
}

-- 商品 SKU 状态：{ stock, price, listed }
MerchSystem.GetState = function(state)
    state = CompanyState.Ensure(state)
    state.merch = state.merch or { stock = {}, revenue = 0, lastWeekRevenue = 0, unlocked = false }
    local m = state.merch
    for _, cat in pairs(MerchSystem.CATEGORIES) do
        m.stock[cat.id] = m.stock[cat.id] or { stock = 0, price = cat.basePrice, listed = false }
    end
    return m
end

-- 是否解锁（商务发展司 Lv1+）
function MerchSystem.IsUnlocked(state)
    local FacilitiesSystem = require("FacilitiesSystem")
    return FacilitiesSystem.GetLevel(state, "business") >= 1
end

-- 生产库存
function MerchSystem.Produce(state, categoryId, quantity)
    state = CompanyState.Ensure(state)
    local cat = MerchSystem.CATEGORIES[categoryId]
    if not cat then return false, "未知品类" end
    if not MerchSystem.IsUnlocked(state) then return false, "商务发展司 Lv.1 解锁周边商城" end
    quantity = quantity or 50
    local cost = cat.baseCost * quantity
    if state.company.cash < cost then
        return false, "现金不足，无法生产（需 ¥" .. tostring(cost) .. "万）"
    end
    local m = MerchSystem.GetState(state)
    m.stock[categoryId].stock = (m.stock[categoryId].stock or 0) + quantity
    state.company.cash = state.company.cash - cost
    CompanyState.RecordTimeline(state, " 周边生产",
        "生产 " .. quantity .. " 件「" .. cat.name .. "」（¥" .. tostring(cost) .. "万），库存 +" .. tostring(quantity) .. "。")
    return true, "已生产 " .. quantity .. " 件「" .. cat.name .. "」"
end

-- 调价（±10% / 次）
function MerchSystem.SetPrice(state, categoryId, deltaPct)
    state = CompanyState.Ensure(state)
    local cat = MerchSystem.CATEGORIES[categoryId]
    if not cat then return false, "未知品类" end
    local m = MerchSystem.GetState(state)
    local sku = m.stock[categoryId]
    if not sku.listed then return false, "该品类未上架" end
    local newPrice = math.floor(sku.price * (1 + (deltaPct or 0)) + 0.5)
    newPrice = math.max(math.floor(cat.basePrice * 0.6), math.min(math.floor(cat.basePrice * 2.0), newPrice))
    sku.price = newPrice
    return true, "已调价至 ¥" .. tostring(newPrice) .. "万/件"
end

-- 上架 / 下架
function MerchSystem.ToggleListing(state, categoryId)
    state = CompanyState.Ensure(state)
    local cat = MerchSystem.CATEGORIES[categoryId]
    if not cat then return false, "未知品类" end
    local m = MerchSystem.GetState(state)
    local sku = m.stock[categoryId]
    sku.listed = not sku.listed
    return true, sku.listed and "已上架「" .. cat.name .. "」" or "已下架「" .. cat.name .. "」"
end

-- 周结算：销量 = 粉丝基数 × 需求 × 价格系数 × 品牌系数
-- 巨星联名：队内最高品牌选手溢价（PlayerEcoSystem 联动）
function MerchSystem.ProcessWeek(state)
    state = CompanyState.Ensure(state)
    if not MerchSystem.IsUnlocked(state) then return state end
    local m = MerchSystem.GetState(state)
    local fans = tonumber(state.company.fans) or 0
    local revenue = 0
    local soldTotal = 0
    local week = tonumber(state.company.week) or 1

    -- 队内最高品牌值选手（联名溢价来源）
    local starBrand = 0
    local RosterSystem = require("RosterSystem")
    for _, entry in ipairs(RosterSystem.GetRosterPlayers(state)) do
        local eco = PlayerEcoSystem.GetEco(state, entry.player.id)
        starBrand = math.max(starBrand, (eco.brand and eco.brand.value) or 0)
    end
    local collabBoost = 1 + starBrand / 200  -- 品牌值 100 → +50%

    for _, cat in pairs(MerchSystem.CATEGORIES) do
        local sku = m.stock[cat.id]
        if sku.listed and (sku.stock or 0) > 0 then
            -- 销量 = 粉丝基数 × 需求 × 价格敏感系数 × 品牌系数
            local priceFactor = math.max(0.4, math.min(2.0, cat.basePrice / sku.price))
            local brandFactor = cat.id == "collab" and collabBoost or 1.0
            local sales = math.floor(fans / 100 * cat.demand * priceFactor * brandFactor)
            sales = math.max(0, math.min(sku.stock, sales))
            local rev = sales * sku.price
            revenue = revenue + rev
            soldTotal = soldTotal + sales
            sku.stock = sku.stock - sales
        end
    end

    m.lastWeekRevenue = revenue
    m.revenue = (m.revenue or 0) + revenue
    m.lastWeekSold = soldTotal

    -- 收入入账 + 估值联动
    if revenue > 0 then
        state.company.cash = (state.company.cash or 0) + revenue
        CompanyState.RecordTimeline(state, " 周边收入",
            "本周周边销售 " .. tostring(soldTotal) .. " 件，入账 ¥" .. tostring(revenue) .. "万。")
    end

    -- 每周粉丝小幅增长（周边带动）
    local fanGain = math.floor(soldTotal / 10)
    if fanGain > 0 then
        state.company.fans = (state.company.fans or 0) + fanGain
    end
    return state
end

-- 获取商城数据（供 UI）
function MerchSystem.GetShopData(state)
    state = CompanyState.Ensure(state)
    local m = MerchSystem.GetState(state)
    local out = {}
    for _, cat in pairs(MerchSystem.CATEGORIES) do
        local sku = m.stock[cat.id]
        out[#out + 1] = {
            id = cat.id,
            name = cat.name,
            icon = cat.icon,
            desc = cat.desc,
            basePrice = cat.basePrice,
            price = sku.price,
            stock = sku.stock,
            listed = sku.listed,
            demand = cat.demand,
        }
    end
    return out
end

function MerchSystem.GetTotalRevenue(state)
    state = CompanyState.Ensure(state)
    local m = MerchSystem.GetState(state)
    return m.revenue or 0
end

function MerchSystem.GetLastWeekRevenue(state)
    state = CompanyState.Ensure(state)
    local m = MerchSystem.GetState(state)
    return m.lastWeekRevenue or 0
end

return MerchSystem
