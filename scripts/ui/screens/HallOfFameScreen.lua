-- HallOfFameScreen.lua — 荣誉殿堂 (real data: hall of fame entries via ProfileSystem)
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local Kit = require("ui.WireframeKit")
local AppShell = require("ui.AppShell")
local CompanyState = require("CompanyState")

local function num(v, d) return tonumber(v) or d end
local function safe(v, d) return v == nil and (d or "") or v end

local function buildBlocks(ctx)
    local state = CompanyState.Ensure(CompanyState.GetState())
    local ProfileSystem = require("ProfileSystem")

    local blocks = {}

    -- 1. 荣誉统计卡
    local stats = nil
    pcall(function() stats = ProfileSystem.GetStats(state) end)
    stats = stats or { honors = 0, seasons = 0, championships = 0, bestValuation = 0, peakFans = 0 }
    table.insert(blocks, { kind = "kpi", text = "荣誉条目 " .. tostring(stats.honors) .. " · 冠军 " .. tostring(stats.championships) .. " · 赛季 " .. tostring(stats.seasons) })

    -- 2. 荣誉墙
    table.insert(blocks, { kind = "sectionhdr", title = "荣誉墙", right = "" })
    local entries = (state.profile and state.profile.hallOfFame and state.profile.hallOfFame.entries) or {}
    if #entries == 0 then
        table.insert(blocks, { kind = "list", "尚无荣誉 — 夺冠 / 区域冠军 / 连续达成董事会目标 / 估值里程碑会自动入选" })
    else
        for _, e in ipairs(entries) do
            table.insert(blocks, { kind = "kvrows", title = safe(e.title, "荣誉"), rows = {
                { "类型", safe(e.type, ""), DS.C.gold },
                { "详情", safe(e.detail, ""), DS.C.muted },
                { "赛季", "第" .. tostring(num(e.at, 0)) .. " 赛季", DS.C.muted },
            } })
        end
    end

    -- 3. CTA
    table.insert(blocks, { kind = "cta", label = "返回图鉴中心", onClick = function() ctx.nav("galleryhub") end })

    return blocks
end

local HallOfFameScreen = {}

function HallOfFameScreen.Build(navigate)
    local ctx = { nav = navigate }
    local blocks = buildBlocks(ctx)
    local nodes = Kit.renderBlocks(blocks, ctx)
    return AppShell.Build(navigate, "halloffame", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return HallOfFameScreen
