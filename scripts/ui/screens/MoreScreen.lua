-- MoreScreen.lua — 深度 / 系统 聚合 hub（真实可达的入口）。
-- 原 ScreenFactory SPEC 的 actiongrid 项是空 onClick（点了无反应）。
-- 这里直接构建带真实导航的区块，让 12 个深度/系统入口真正可达。
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local Kit = require("ui.WireframeKit")
local AppShell = require("ui.AppShell")

local MoreScreen = {}

function MoreScreen.Build(navigate)
    -- 12 个深度/系统入口：{ 标题, 副标题(留空), 目标屏 id }
    -- 目标屏 id 必须存在于 main.lua 的 SCREENS 表
    local items = {
        { "财务",   nil, "finance" },
        { "股权",   nil, "shares" },
        { "股市",   nil, "stock" },
        { "设施",   nil, "facilities" },
        { "周边",   nil, "merch" },
        { "媒体",   nil, "press" },
        { "图鉴",   nil, "galleryhub" },
        { "名人堂", nil, "halloffame" },
        { "目标",   nil, "goalcenter" },
        { "地区",   nil, "regions" },
        { "分析",   nil, "analytics" },
        { "排行",   nil, "leaderboard" },
        { "设置",   nil, "settings" },
    }

    local blocks = {
        { kind = "chiprow", items = { { "经营", true }, { "深度", false }, { "系统", false } } },
        { kind = "actiongrid", items = items },
        { kind = "section", text = "深度叙事：传承 · 宿敌 · 生涯剧情" },
        { kind = "cta", label = "选手生涯模式（第二游戏线）", onClick = function() if navigate then navigate("sl_home") end end },
        { kind = "cta", label = "宿敌恩怨", onClick = function() if navigate then navigate("rivalry") end end },
        { kind = "cta", label = "生涯剧情", onClick = function() if navigate then navigate("career") end end },
        { kind = "cta", label = "返回主菜单", onClick = function() if navigate then navigate("menu") end end },
    }

    local ctx = { nav = navigate }
    local nodes = Kit.renderBlocks(blocks, ctx)
    return AppShell.Build(navigate, "more", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return MoreScreen
