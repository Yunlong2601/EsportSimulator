-- GalleryHubScreen.lua — 图鉴中心 (real data: ending collection via ProfileSystem)
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

    -- 1. 收集进度环
    local stats = nil
    pcall(function() stats = ProfileSystem.GetStats(state) end)
    stats = stats or { unlockedCount = 0, totalCount = 0, seasons = 0, championships = 0, bestValuation = 0, peakFans = 0, honors = 0 }
    local total = num(stats.totalCount, 0)
    local pct = total > 0 and math.floor(stats.unlockedCount / total * 100) or 0
    table.insert(blocks, { kind = "ring", pct = pct, label = "结局收集", sub = tostring(stats.unlockedCount) .. " / " .. tostring(total) .. " 已解锁" })

    -- 2. 分类切换提示
    table.insert(blocks, { kind = "chiprow", items = { { "结局", true }, { "选手", false }, { "英雄", false } } })

    -- 3. 结局图鉴
    table.insert(blocks, { kind = "sectionhdr", title = "结局图鉴", right = "" })
    local endings = ProfileSystem.ENDINGS or {}
    for _, e in ipairs(endings) do
        local unlocked = state.profile and state.profile.endings and state.profile.endings[e.id] == true
        table.insert(blocks, { kind = "list", (unlocked and "【已解锁】" or "【未解锁】") .. e.title .. " — " .. safe(e.desc, "") })
    end

    -- 4. 选手 / 英雄图鉴占位（数据随玩法累计，统一入口）
    table.insert(blocks, { kind = "section", text = "选手图鉴 / 英雄图鉴按你执教生涯累计解锁；当前以结局收集为主入口。" })

    -- 5. CTA
    table.insert(blocks, { kind = "cta", label = "荣誉殿堂", onClick = function() ctx.nav("halloffame") end })
    table.insert(blocks, { kind = "cta", label = "返回首页", onClick = function() ctx.nav("dashboard") end })

    return blocks
end

local GalleryHubScreen = {}

function GalleryHubScreen.Build(navigate)
    local ctx = { nav = navigate }
    local blocks = buildBlocks(ctx)
    local nodes = Kit.renderBlocks(blocks, ctx)
    return AppShell.Build(navigate, "galleryhub", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return GalleryHubScreen
