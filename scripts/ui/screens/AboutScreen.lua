-- AboutScreen.lua — 版本声明 / 关于本作。
-- 原 MenuScreen「版本声明」误指向 settings（复制错误），且工程无 about 屏，导致该按钮静默落到 dashboard。
-- 此处建立真实 about 屏，并在 main.lua 的 SCREENS 表登记 about = AboutScreen。
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local AppShell = require("ui.AppShell")

-- 与构建版本保持一致（发布时由 CI 注入）
local VERSION = "RC · 2026-08"

local AboutScreen = {}

function AboutScreen.Build(navigate)
    local nodes = {}
    table.insert(nodes, DS.SectionHeader("版本声明", "关于《电竞王朝：竞技资本》", nil))

    table.insert(nodes, DS.Card {
        children = {
            DS.Label("电竞王朝：竞技资本", { fontSize = 16, fontWeight = "bold", fontColor = DS.C.text }),
            DS.Label("Nexus Arena · 星环竞技场", { fontSize = 12, fontColor = DS.C.gold }),
            DS.Label("版本 " .. VERSION, { fontSize = 12, fontColor = DS.C.muted }),
        },
    })

    table.insert(nodes, DS.Card {
        children = {
            DS.Label("制作", { fontSize = 13, fontWeight = "bold", fontColor = DS.C.text }),
            DS.Label("游承峰（主理）· 文策渊（策划）· 林绘澄（美术）· 程基岩（程序）· 严守真（测试）",
                { fontSize = 11, fontColor = DS.C.muted }),
            DS.Label(" ", { fontSize = 6, fontColor = DS.C.muted }),
            DS.Label("素材", { fontSize = 13, fontWeight = "bold", fontColor = DS.C.text }),
            DS.Label("UI 音效与图标采用 CC0 公有领域素材（Kenney / OpenGameArt），可商用、无需署名。",
                { fontSize = 11, fontColor = DS.C.muted }),
            DS.Label(" ", { fontSize = 6, fontColor = DS.C.muted }),
            DS.Label("声明", { fontSize = 13, fontWeight = "bold", fontColor = DS.C.text }),
            DS.Label("本作为虚构电竞经营模拟，所有战队、选手、赛事均为原创，与任何真实个人或组织无关。",
                { fontSize = 11, fontColor = DS.C.muted }),
        },
    })

    table.insert(nodes, DS.Button("返回主菜单", function()
        if navigate then navigate("menu") end
    end, { height = 44, fontSize = 14 }))

    return AppShell.Build(navigate, "about", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return AboutScreen
