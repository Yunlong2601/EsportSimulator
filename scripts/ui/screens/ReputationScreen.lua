-- ReputationScreen.lua — 声望 (real data: reputation/fans/rank via state + FinanceSystem)
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local Kit = require("ui.WireframeKit")
local AppShell = require("ui.AppShell")
local CompanyState = require("CompanyState")

local function num(v, d) return tonumber(v) or d end
local function safe(v, d) return v == nil and (d or "") or v end

local function repGrade(rep)
    if rep >= 80 then return "S"
    elseif rep >= 65 then return "A"
    elseif rep >= 50 then return "B+"
    elseif rep >= 35 then return "B"
    elseif rep >= 20 then return "C"
    end
    return "D"
end

local function buildBlocks(ctx)
    local state = CompanyState.Ensure(CompanyState.GetState())
    local FinanceSystem = require("FinanceSystem")

    local blocks = {}

    -- 1. 双圆环
    local rep = num(state.company.reputation, 50)
    local fansWan = num(state.company.fans, 0) / 10000
    table.insert(blocks, { kind = "rings", items = {
        { rep, "声望", repGrade(rep) },
        { math.min(100, fansWan), "粉丝", string.format("%.1f", fansWan) .. "万" },
    } })

    -- 2. 声望进度卡
    local nextTier = rep >= 80 and 100 or (rep >= 65 and 80 or (rep >= 50 and 65 or (rep >= 35 and 50 or (rep >= 20 and 35 or 20))))
    table.insert(blocks, { kind = "kvrows", title = "声望进度", rows = {
        { "当前声望", tostring(rep) .. "/100（" .. repGrade(rep) .. " 级）", DS.C.gold },
        { "下一档位", tostring(nextTier) .. "（还差 " .. tostring(math.max(0, nextTier - rep)) .. " 点）", DS.C.muted },
        { "联赛排名加成", "第 " .. tostring((function() local r = 8; pcall(function() r = FinanceSystem.GetRank(state) end) return r end)()) .. " 名", DS.C.muted },
    } })

    -- 3. 粉丝规模卡
    table.insert(blocks, { kind = "kvrows", title = "粉丝规模", rows = {
        { "当前粉丝", string.format("%.2f", fansWan) .. "万", DS.C.text },
        { "周边收入基准", "¥" .. tostring(math.floor(num(state.company.fans, 0) / 100000) * 10) .. "万/周", DS.C.muted },
        { "历史峰值", tostring(math.floor(num(state.profile and state.profile.peakFans, 0) / 100) / 100) .. "万", DS.C.muted },
    } })

    -- 4. 里程碑
    table.insert(blocks, { kind = "sectionhdr", title = "生涯里程碑", right = "" })
    local peakV = num(state.profile and state.profile.bestValuation, 0)
    table.insert(blocks, { kind = "ztable", rows = {
        { "赛季数", tostring(num(state.profile and state.profile.seasons, 0)) },
        { "冠军数", tostring(num(state.profile and state.profile.championships, 0)) },
        { "估值峰值", "¥" .. tostring(math.floor(peakV / 100) / 100) .. "万" },
    } })

    -- 5. CTA
    table.insert(blocks, { kind = "cta", label = "前往媒体中心（发布会/舆论）", onClick = function() ctx.nav("press") end })

    return blocks
end

local ReputationScreen = {}

function ReputationScreen.Build(navigate)
    local ctx = { nav = navigate }
    local blocks = buildBlocks(ctx)
    local nodes = Kit.renderBlocks(blocks, ctx)
    return AppShell.Build(navigate, "reputation", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return ReputationScreen
