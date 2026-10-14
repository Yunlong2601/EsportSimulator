-- secondline/screens/SlHomeScreen.lua — 第二游戏线首页 / 核心循环入口（选手生涯模式）
-- 自包含屏：复用 UI / DesignSystem / AppShell，不依赖 FPS 屏的 buildBlocks。
-- 经 Bridge 只读引用主线用于「你在某队」叙事联动（§3 / §5.6）。
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local AppShell = require("ui.AppShell")
local SecondLineState = require("secondline.State")
local Bridge = require("secondline.Bridge")

local SlHomeScreen = {}

function SlHomeScreen.Build(navigate)
    local nodes = {}
    table.insert(nodes, DS.SectionHeader("选手生涯模式", nil, nil))

    local state = SecondLineState.GetState()

    if not state then
        -- 无存档：引导开新档
        table.insert(nodes, DS.EmptyState("尚未开始你的生涯",
            "创建一名职业选手，从青训新秀成长为传奇。"))
        table.insert(nodes, DS.Button("开始新生涯", function()
            SecondLineState.NewGame({ name = "新星" })
            SecondLineState.Save()
            if navigate then navigate("sl_home") end
        end, { height = 46, fontSize = 14 }))
        table.insert(nodes, DS.Button("返回主菜单",
            function() if navigate then navigate("menu") end end,
            { height = 40, fontSize = 13, variant = "secondary" }))
        return AppShell.Build(navigate, "sl_home",
            UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
    end

    local p = state.player

    -- 选手概况卡
    table.insert(nodes, DS.Card {
        flexDirection = "column", gap = DS.S.xs, padding = DS.S.sm,
        children = {
            DS.Label(p.name .. " · " .. SecondLineState.ArcLabel(p.arc),
                { fontSize = 14, fontWeight = "bold", fontColor = DS.C.ember }),
            DS.Label("位置：" .. tostring(p.role) .. "   年龄：" .. tostring(p.age)
                .. "   声望：" .. tostring(p.reputation),
                { fontSize = 11, fontColor = DS.C.muted }),
            DS.Label("操作 " .. tostring(p.mechanics) .. " · 团战 " .. tostring(p.teamfight)
                .. " · 对线 " .. tostring(p.laning),
                { fontSize = 11, fontColor = DS.C.faint }),
            DS.Label("第 " .. tostring(p.season) .. " 赛季 · 第 " .. tostring(p.weeks)
                .. " 周 · 体力 " .. tostring(p.stamina) .. " · 属性点 " .. tostring(p.adPoints or 0),
                { fontSize = 11, fontColor = DS.C.faint }),
        },
    })

    -- 交叉共生：只读主线，呈现「你在某队」
    local snap = Bridge.GetMainLineSnapshot()
    if snap.hasMain then
        table.insert(nodes, DS.Card {
            flexDirection = "column", gap = DS.S.xs, padding = DS.S.sm,
            children = {
                DS.Label("战队联动（只读主线）", { fontSize = 11, fontWeight = "bold", fontColor = DS.C.gold }),
                DS.Label("你所在的战队世界：" .. tostring(snap.teamName)
                    .. "（" .. tostring(snap.league) .. "）", { fontSize = 11, fontColor = DS.C.text }),
                DS.Label("主线进度：第 " .. tostring(snap.week) .. " 周 · "
                    .. tostring(snap.seasonState), { fontSize = 11, fontColor = DS.C.muted }),
            },
        })
    else
        table.insert(nodes, DS.AlertBox({
            { "纯生涯模式开局：主线无存档，已绑定虚拟战队「" .. tostring(snap.teamName) .. "」。", DS.C.muted },
        }))
    end

    -- 核心循环入口
    table.insert(nodes, DS.SectionHeader("核心循环", nil, nil))
    table.insert(nodes, DS.Button("日常训练", function() if navigate then navigate("sl_train") end end,
        { height = 44, fontSize = 13 }))
    table.insert(nodes, DS.Button("周赛表现", function() if navigate then navigate("sl_match") end end,
        { height = 44, fontSize = 13 }))
    if state.career.transferPending then
        table.insert(nodes, DS.Button("转会窗（赛季末·待处理）",
            function() if navigate then navigate("sl_transfer") end end,
            { height = 44, fontSize = 13, variant = "secondary" }))
    end

    -- 招牌玩法入口
    table.insert(nodes, DS.SectionHeader("招牌玩法", nil, nil))
    table.insert(nodes, DS.Button("生涯剧情 (D)", function() if navigate then navigate("sl_story") end end,
        { height = 42, fontSize = 13, variant = "secondary" }))
    table.insert(nodes, DS.Button("王朝传承 (B)", function() if navigate then navigate("sl_dynasty") end end,
        { height = 42, fontSize = 13, variant = "secondary" }))
    table.insert(nodes, DS.Button("VIP 中心（看广告领属性点）",
        function() if navigate then navigate("sl_vip") end end,
        { height = 42, fontSize = 13, variant = "secondary" }))

    -- 跳过本周：恢复体力，不比赛
    table.insert(nodes, DS.Button("跳过本周（休息恢复体力）", function()
        SecondLineState.AdvanceWeek()
        SecondLineState.Save()
        if navigate then navigate("sl_home") end
    end, { height = 40, fontSize = 12, variant = "secondary" }))

    table.insert(nodes, DS.Button("返回主菜单",
        function() if navigate then navigate("menu") end end,
        { height = 40, fontSize = 13, variant = "secondary" }))

    return AppShell.Build(navigate, "sl_home",
        UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return SlHomeScreen
