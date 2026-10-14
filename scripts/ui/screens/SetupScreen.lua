-- SetupScreen.lua — 开始新游戏（真实可用）。
-- 调用 CompanyState.NewGame 创建全新俱乐部并覆盖当前存档（有存档时才二次确认）。
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local AppShell = require("ui.AppShell")
local CompanyState = require("CompanyState")
local SaveManager = require("SaveManager")

local SetupScreen = {}

-- 模块级确认态
local pendingStart = false

--- 开始新游戏（单一入口，SetupScreen 与 EndingScreen「重新开始」共用）。
function SetupScreen.StartFresh()
    local fresh = nil
    local ok = pcall(function()
        fresh = CompanyState.NewGame()
        CompanyState.SetState(fresh)
        -- 重新初始化依赖
        pcall(function() require("AISystem").EnsureAgents(fresh) end)
        pcall(function() require("DraftSystem").Rehydrate(fresh) end)
        SaveManager.Save(fresh)
    end)
    return ok and fresh ~= nil
end

function SetupScreen.Build(navigate)
    local nodes = {}
    table.insert(nodes, DS.SectionHeader("创建全新俱乐部", nil, nil))

    local hasSave = false
    pcall(function() hasSave = SaveManager.Exists() end)

    table.insert(nodes, DS.Card {
        children = {
            DS.Label(hasSave and "你即将建立一支崭新的电竞战队。注意：这将覆盖现有的俱乐部存档进度。" or "踏上职业经理人之路，组建你的电竞战队，向联赛总冠军发起冲击！", { fontSize = 12, fontColor = DS.C.textDim }),
        },
    })

    if hasSave and pendingStart then
        table.insert(nodes, DS.AlertBox({ { "注意：当前战队存档将被永久覆盖，确定要重开吗？", DS.C.error } }))
        table.insert(nodes, DS.Button("确认覆盖并开始", function()
            SetupScreen.StartFresh()
            pendingStart = false
            if navigate then navigate("dashboard") end
        end, { height = 46, fontSize = 14 }))
        table.insert(nodes, DS.Button("取消返回", function()
            pendingStart = false
            if navigate then navigate("setup") end
        end, { height = 40, fontSize = 13, variant = "secondary" }))
    else
        table.insert(nodes, DS.Button("创建战队 · 入驻基地", function()
            if hasSave then
                pendingStart = true
                if navigate then navigate("setup") end
            else
                SetupScreen.StartFresh()
                if navigate then navigate("dashboard") end
            end
        end, { height = 48, fontSize = 15 }))
    end

    table.insert(nodes, DS.Button("返回主菜单", function()
        pendingStart = false
        if navigate then navigate("menu") end
    end, { height = 40, fontSize = 13, variant = "secondary" }))

    return AppShell.Build(navigate, "setup", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return SetupScreen
