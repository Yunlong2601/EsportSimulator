-- EndingScreen.lua — 赛季结局屏（#137 破产结局闭环）
-- 终局赛季状态（bankrupt / fired / eliminated）与赛季结算的唯一落地页。
-- 与「图鉴中心」GalleryHubScreen（结局收藏）、「荣誉殿堂」HallOfFameScreen 不同：
-- 本屏展示**当前这一局**的结局 + 本赛季经营摘要，并给出三条出路
-- （重新开始 / 查看结局图鉴 / 返回主菜单）。
-- 结局文案单一来源：ProfileSystem.ENDINGS（不在此处硬编码）。
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local Kit = require("ui.WireframeKit")
local AppShell = require("ui.AppShell")
local CompanyState = require("CompanyState")

local function num(v, d) return tonumber(v) or d end
local function safe(v, d) return v == nil and (d or "") or v end

-- 终局 seasonState → ProfileSystem 结局 id
-- （与 CompetitionSystem.AdvanceWeek 的 GAME_OVER 表同源；预选赛出局记
--  的是 "qualifier_failed"，见 ProfileSystem.MarkEliminated）
local GAME_OVER = {
    bankrupt = { id = "bankrupt" },
    fired = { id = "fired" },
    eliminated = { id = "qualifier_failed" },
}

local EndingScreen = {}
-- 重开会覆盖当前存档，属破坏性操作：首次点击只进入确认态，二次确认才执行
local pendingRestart = false

local function findEnding(endingId)
    local ProfileSystem = require("ProfileSystem")
    for _, e in ipairs(ProfileSystem.ENDINGS or {}) do
        if e.id == endingId then return e end
    end
    return { id = endingId, title = tostring(endingId), desc = "", hint = "" }
end

local function buildBlocks(ctx)
    local state = CompanyState.Ensure(CompanyState.GetState())
    local ProfileSystem = require("ProfileSystem")
    local summary = CompanyState.GetSummary and CompanyState.GetSummary(state) or {}
    local blocks = {}

    local ss = state.company and state.company.seasonState
    local over = GAME_OVER[ss]
    local ending = over and findEnding(over.id) or nil

    -- 1. 结局主体
    table.insert(blocks, { kind = "sectionhdr", title = "赛季结局" })
    if ending then
        table.insert(blocks, { kind = "alert", lines = {
            { "结局 · " .. safe(ending.title, ""), DS.C.error },
            { safe(ending.desc, ""), DS.C.textDim },
            { "达成条件：" .. safe(ending.hint, "—"), DS.C.muted },
        } })
    else
        table.insert(blocks, { kind = "alert", lines = {
            { "本赛季仍在进行中（" .. tostring(ss or "—") .. "）", DS.C.gold },
            { "破产 / 被解雇 / 预选赛出局后，这里会展示本局的最终结局。", DS.C.muted },
        } })
    end

    -- 2. 结局收集进度（复用 ProfileSystem 真实统计）
    local stats = nil
    pcall(function() stats = ProfileSystem.GetStats(state) end)
    stats = stats or { unlockedCount = 0, totalCount = 0 }
    local total = num(stats.totalCount, 0)
    local unlocked = num(stats.unlockedCount, 0)
    local pct = total > 0 and math.floor(unlocked / total * 100) or 0
    table.insert(blocks, { kind = "ring", pct = pct, label = "结局收集",
        sub = tostring(unlocked) .. " / " .. tostring(total) .. " 已解锁" })

    -- 3. 本赛季经营摘要
    local profile = state.profile or {}
    table.insert(blocks, { kind = "kvrows", title = "本赛季结算", rows = {
        { "俱乐部", safe(state.company and state.company.name, "—") },
        { "赛季数", tostring(num(state.company and state.company.seasons, 0)) },
        { "坚持周数", tostring(num(state.company and state.company.week, 0)) },
        { "最终现金", DS.FormatCash(num(summary.cash, 0)), num(summary.cash, 0) < 0 and DS.C.error or DS.C.success },
        { "粉丝", tostring(num(summary.fans, 0)) },
        { "声望", tostring(num(summary.reputation, 0)) },
        { "俱乐部估值", DS.FormatCash(num(summary.valuation, 0)), DS.C.gold },
        { "图鉴累计赛季", tostring(num(profile.seasons, 0)) },
        { "累计冠军", tostring(num(profile.championships, 0)) },
    } })

    -- 4. 出路
    table.insert(blocks, { kind = "sectionhdr", title = "接下来" })
    if pendingRestart then
        table.insert(blocks, { kind = "alert", lines = {
            { "确认重新开始？当前存档会被全新俱乐部覆盖，进度不可撤销。", DS.C.error } } })
        table.insert(blocks, { kind = "cta", label = "确认重新开始", onClick = function()
            -- 复用 SetupScreen 的新游戏入口（CompanyState.NewGame + SetState +
            -- EnsureAgents + Rehydrate + SaveManager.Save），不在这里手搓存档
            local SetupScreen = require("ui.screens.SetupScreen")
            local ok = false
            pcall(function() ok = SetupScreen.StartFresh() end)
            pendingRestart = false
            ctx.nav(ok and "dashboard" or "ending")
        end })
        table.insert(blocks, { kind = "cta", label = "取消", onClick = function()
            pendingRestart = false
            ctx.nav("ending")
        end })
    else
        table.insert(blocks, { kind = "cta", label = "重新开始", onClick = function()
            pendingRestart = true
            ctx.nav("ending")
        end })
    end
    table.insert(blocks, { kind = "cta", label = "查看结局图鉴", onClick = function() ctx.nav("galleryhub") end })
    table.insert(blocks, { kind = "cta", label = "返回主菜单", onClick = function() ctx.nav("menu") end })
    table.insert(blocks, { kind = "section",
        text = "结局达成即永久记入图鉴：重开会清空当前经营进度，但图鉴收集与名人堂记录保留。" })

    return blocks
end

function EndingScreen.Build(navigate)
    local ctx = { nav = navigate }
    local blocks = buildBlocks(ctx)
    local nodes = Kit.renderBlocks(blocks, ctx)
    return AppShell.Build(navigate, "ending", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return EndingScreen
