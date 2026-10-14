-- SettingsScreen.lua — 游戏设置（真实可用）。
-- 读取/写入 saves/settings.json（SettingsManager），音效开关即时作用于 AudioManager。
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local AppShell = require("ui.AppShell")
local SettingsManager = require("SettingsManager")
local AudioManager = require("AudioManager")

local SettingsScreen = {}

local SPEED_ORDER = { "slow", "normal", "fast" }
local SPEED_LABEL = { slow = "慢速", normal = "普通", fast = "快速" }

function SettingsScreen.Build(navigate)
    local settings = SettingsManager.Load()
    local nodes = {}
    table.insert(nodes, DS.SectionHeader("游戏设置", nil, nil))

    -- 开关行：标题 + 开/关 按钮
    local function toggleRow(label, on, onToggle)
        local btn = DS.Button(on and "开" or "关", function()
            if onToggle then onToggle() end
        end, { height = 34, fontSize = 12, variant = on and "primary" or "secondary" })
        return DS.Card {
            flexDirection = "row", justifyContent = "space-between", alignItems = "center",
            padding = DS.S.sm, children = {
                DS.Label(label, { fontSize = 12, fontColor = DS.C.text }),
                btn,
            },
        }
    end

    -- 音效
    table.insert(nodes, toggleRow("音效", settings.sound == true, function()
        settings.sound = not (settings.sound == true)
        SettingsManager.Save(settings)
        if settings.sound then
            AudioManager.PlayBGM(AudioManager.GetBGMKey() or "menu")
        else
            AudioManager.StopBGM()
        end
        if navigate then navigate("settings") end
    end))

    -- 推送通知
    table.insert(nodes, toggleRow("推送通知", settings.notify == true, function()
        settings.notify = not (settings.notify == true)
        SettingsManager.Save(settings)
        if navigate then navigate("settings") end
    end))

    -- 比赛默认速度（循环切换）
    local speedBtn = DS.Button(SPEED_LABEL[settings.matchSpeed] or "普通", function()
        local cur = settings.matchSpeed or "normal"
        local idx = 1
        for i, v in ipairs(SPEED_ORDER) do if v == cur then idx = i end end
        settings.matchSpeed = SPEED_ORDER[(idx % #SPEED_ORDER) + 1]
        SettingsManager.Save(settings)
        if navigate then navigate("settings") end
    end, { height = 34, fontSize = 12, variant = "secondary" })
    table.insert(nodes, DS.Card {
        flexDirection = "row", justifyContent = "space-between", alignItems = "center",
        padding = DS.S.sm, children = {
            DS.Label("比赛默认速度", { fontSize = 12, fontColor = DS.C.text }),
            speedBtn,
        },
    })

    -- 自动存档（引擎退出时自动保存，这里只读展示）
    table.insert(nodes, DS.Card {
        flexDirection = "row", justifyContent = "space-between", alignItems = "center",
        padding = DS.S.sm, children = {
            DS.Label("自动存档", { fontSize = 12, fontColor = DS.C.text }),
            DS.Label("开", { fontSize = 12, fontWeight = "bold", fontColor = DS.C.success }),
        },
    })

    table.insert(nodes, DS.Label("设置自动保存在本地（saves/settings.json）。", { fontSize = 10, fontColor = DS.C.faint }))
    table.insert(nodes, DS.Button("返回", function() if navigate then navigate("more") end end, { height = 40, fontSize = 13, variant = "secondary" }))

    return AppShell.Build(navigate, "settings", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return SettingsScreen
