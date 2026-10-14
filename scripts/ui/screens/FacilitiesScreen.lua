-- FacilitiesScreen.lua — 设施 (real data: levels/effects/upgrade via FacilitiesSystem)
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
    local FacilitiesSystem = require("FacilitiesSystem")

    local blocks = {}

    if lastMsg and lastMsg ~= "" then
        table.insert(blocks, { kind = "alert", lines = { { lastMsg, DS.C.gold } } })
        lastMsg = nil
    end

    local facilities = {}
    pcall(function() facilities = FacilitiesSystem.GetAll(state) end)
    table.sort(facilities, function(a, b) return tostring(a.id) < tostring(b.id) end)

    if #facilities == 0 then
        table.insert(blocks, { kind = "list", "暂无设施数据" })
        return blocks
    end

    for _, fac in ipairs(facilities) do
        local lv = num(fac.level, 0)
        local maxLv = num(fac.maxLv, 1)
        local isMaxed = fac.isMaxed == true
        local title = safe(fac.label, fac.id) .. " Lv." .. tostring(lv) .. "/" .. tostring(maxLv)
        table.insert(blocks, { kind = "sectionhdr", title = title, right = isMaxed and "满级" or "" })
        table.insert(blocks, { kind = "ztable", rows = {
            { "当前效果", safe(fac.effect, "—") },
            { "下一级", isMaxed and "已满级" or safe(fac.nextEffect, "—") },
            { "升级费用", isMaxed and "—" or fmtWan(fac.cost) },
        } })
        if not isMaxed then
            local canUp = false
            pcall(function() canUp = FacilitiesSystem.CanUpgrade(state, fac.id) end)
            table.insert(blocks, { kind = "cta", label = "升级 " .. safe(fac.label, "") .. " → Lv." .. tostring(lv + 1) .. (canUp and "" or "（现金不足）"), onClick = function()
                local ok, err = pcall(function()
                    FacilitiesSystem.Upgrade(state, fac.id)
                    require("SaveManager").Save(state)
                end)
                lastMsg = ok and (safe(fac.label, "设施") .. " 已升级至 Lv." .. tostring(lv + 1)) or ("升级失败：" .. tostring(err))
                ctx.nav("facilities")
            end })
        end
    end

    return blocks
end

local FacilitiesScreen = {}

function FacilitiesScreen.Build(navigate)
    local ctx = { nav = navigate }
    local blocks = buildBlocks(ctx)
    local nodes = Kit.renderBlocks(blocks, ctx)
    return AppShell.Build(navigate, "facilities", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return FacilitiesScreen
