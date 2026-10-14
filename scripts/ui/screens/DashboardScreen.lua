-- DashboardScreen.lua — 首页 (rebuilt from wireframe, bound to real game data)
-- 遵循 Rule #1 与席克定律：主行动明确突出，消除跳转死循环
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local Kit = require("ui.WireframeKit")
local AppShell = require("ui.AppShell")
local CompanyState = require("CompanyState")
local CompetitionSystem = require("CompetitionSystem")
local LeagueCatalog = require("LeagueCatalog")
local RosterSystem = require("RosterSystem")
local FinanceSystem = require("FinanceSystem")
local TierSystem = require("TierSystem")

local function safe(v, d) return v == nil and (d or "") or v end
local function num(v, d) return tonumber(v) or d end

local DashboardScreen = {}

local function getRank(gameState)
    local ok, r = pcall(function() return CompetitionSystem.GetPlayerRank(gameState) end)
    return ok and r or "—"
end
local function getPower(gameState)
    local ok, r = pcall(function() return RosterSystem.GetTeamPower(gameState) end)
    return ok and r or 0
end
local function getValuation(gameState)
    local ok, r = pcall(function() return FinanceSystem.GetValuation(gameState) end)
    return ok and r or 0
end

local function buildBlocks(ctx)
    local gameState = CompanyState.GetState()
    local summary = CompanyState.GetSummary and CompanyState.GetSummary(gameState) or {}
    local nav = ctx.nav

    -- 下一场比赛 hero（明确的主行动中枢，避免用户迷茫）
    local match = gameState.match or {}
    local oppName = "待定对手"
    if match.opponentId then
        local ok, n = pcall(function() return LeagueCatalog.GetTeamName(match.opponentId, "待定对手") end)
        oppName = (ok and n) or "待定对手"
    end

    local weekNum = num(gameState.company and gameState.company.week, 1)
    local matchHero = {
        kind = "matchhero_v2",
        date = "常规赛 · 第 " .. tostring(weekNum) .. " 周",
        days = (match.phase == "ready") and "等待开赛" or "赛程准备就绪",
        rank_us = "#" .. tostring(getRank(gameState)), us = safe(gameState.name, "星环战队"),
        rank_opp = "VS", opp = oppName,
        league = safe(match.league, "LPL 夏季赛"),
        status = {
            { "状态", "战队士气", "高昂", DS.C.success },
            { "+", "伤病情况", "全员健康", DS.C.success },
            { "阵", "首发阵容", "5人齐整", DS.C.ember },
        },
        alerts = {
            { "夏季赛常规赛火热进行中", DS.C.gold },
        },
        primaryLabel = "推进赛程 · 对决 " .. oppName .. " ▶",
        onPrimary = function()
            AppShell.AdvanceWeek(nav)
        end,
        secondaryLabel = "赛前备战 · 战术与BP",
        onSecondary = function()
            if nav then nav("match") end
        end,
        target = "match",
    }

    -- 俱乐部状态四宫格（核心数值与资产，一目了然）
    local statusgrid = { kind = "statusgrid", items = {
        { "trophy", "联赛", "#" .. tostring(getRank(gameState)), "当前排名", DS.C.gold },
        { "star", "战力", tostring(getPower(gameState)), "战队总评", DS.C.warning },
        { "basket", "财务", DS.FormatCash(num(summary.cash, 0)), summary.cash and num(summary.cash, 0) < 0 and "现金为负" or "现金健康", summary.cash and num(summary.cash, 0) < 0 and DS.C.error or DS.C.success },
        { "users", "阵容", tostring(#(gameState.roster and gameState.roster.customPlayers or {})), "首发+替补", DS.C.ember },
    } }

    -- 赛季目标
    local goalTip = { kind = "goaltip", title = "赛季目标未设定", desc = "设定目标以获得董事会支持", action = "设定", actionTarget = "goalcenter" }
    local goals = (gameState.goals and gameState.goals.season) or {}
    if #goals > 0 then
        goalTip.title = "赛季目标进行中"
        goalTip.desc = tostring(#goals) .. " 项董事会目标"
    end

    -- 仪表盘：双圆环 + 估值 + 趋势 + 分层 + 状态条
    local health = math.min(100, num(summary.chemistry, 60))
    local satis = math.min(100, num(summary.reputation, 39))
    local rings = { kind = "twocol",
        left = { kind = "rings", items = { { health, "经营健康" }, { satis, "粉丝满意度" } } },
        right = { kind = "bigval", label = "俱乐部估值", value = DS.FormatCash(getValuation(gameState)), change = "+17%", sub = "近6期" } }
    local week = num(gameState.company and gameState.company.week, 3)
    local trend = { kind = "trendbar", current = week, segments = {
        { "", DS.C.surfaceAlt }, { "", DS.C.surfaceAlt }, { "", DS.C.surfaceAlt }, { "", DS.C.surfaceAlt }, { "", DS.C.gold } } }
    local stack = { kind = "stackbar", title = "粉丝分层 · 基数 " .. tostring(num(summary.fans, 0) / 10000) .. "万",
        segments = { { "路人粉", 22, DS.C.info }, { "核心粉", 35, DS.C.muted }, { "死忠粉", 28, DS.C.gold }, { "氪金粉", 15, DS.C.ember } } }
    local statusbars = { kind = "statusbars", items = {
        { "比赛观感", "进攻观赏", health },
        { "票价策略", "亲民票价", 85 },
        { "阵容球星", "球星数量", math.min(100, #(gameState.roster and gameState.roster.customPlayers or {}) * 12) } } }

    -- 高管简报
    local briefing = { kind = "briefing", items = {
        { "总经理", "首发已满，工资压力可控；教练组建议由委托策略自动维护" },
        { "体育总监", "候选覆盖充足，净投入健康" },
        { "财务总监", "本月盈亏为正，债务压力无" },
        { "公关总监", "商业收入稳定，粉丝满意度 " .. tostring(satis) },
    } }

    -- 动态
    local feed = { kind = "feed", items = {
        { "董事会 · 赛季目标确认", "d" },
        { "事件 · 转播合同重谈：达成一致", "d" },
        { "比赛 · " .. safe(gameState.name, "星环战队") .. " 获胜", "g" },
        { "新闻 · 大胜对手", "g" },
    } }

    local quicknav = { kind = "quicknav", target = "more", items = { "转会市场", "青训学院", "俱乐部详情", "查看阵容" } }
    local timebar = { kind = "timebar" }

    local blocks = {
        matchHero,
        { kind = "sectionhdr", title = "俱乐部状态" },
        statusgrid,
        goalTip,
        { kind = "sectionhdr", title = "快捷管理", right = "更多功能 >", rightTarget = "more" },
        quicknav,
        { kind = "sectionhdr", title = "俱乐部经营仪表盘", right = "粉丝详情 >", rightTarget = "reputation" },
        rings, trend, stack, statusbars,
        { kind = "sectionhdr", title = "本月高管简报", right = "管理 >", rightTarget = "goalcenter" },
        briefing,
        { kind = "sectionhdr", title = "俱乐部动态", right = "全部 >", rightTarget = "more" },
        feed,
        timebar,
    }

    -- 终局结局横幅（#137）
    local ENDING_STATES = { bankrupt = "bankrupt", fired = "fired", eliminated = "qualifier_failed" }
    local ss = gameState.company and gameState.company.seasonState
    local endingId = ENDING_STATES[ss]
    if endingId then
        local title = endingId
        pcall(function() title = require("ProfileSystem").GetEndingTitle(endingId) end)
        table.insert(blocks, 1, { kind = "cta", label = "查看结局", onClick = function() ctx.nav("ending") end })
        table.insert(blocks, 1, { kind = "alert", lines = {
            { "赛季终结 · 结局「" .. tostring(title) .. "」", DS.C.error },
            { "俱乐部已停止运营，本赛季无法继续推进。", DS.C.muted },
        } })
    end

    return blocks
end

function DashboardScreen.Build(navigate)
    local ctx = { nav = navigate }
    local blocks = buildBlocks(ctx)
    local nodes = Kit.renderBlocks(blocks, ctx)
    return AppShell.Build(navigate, "dashboard", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return DashboardScreen
