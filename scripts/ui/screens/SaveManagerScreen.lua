-- SaveManagerScreen.lua — 存档管理（真实可用）。
-- 读取/写入单一本地存档（saves/esports_tycoon.json）。
-- 支持：加载存档、保存当前进度、删除存档（带二次确认）。
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local AppShell = require("ui.AppShell")
local SaveManager = require("SaveManager")
local CompanyState = require("CompanyState")

local SaveManagerScreen = {}

-- 模块级确认态（跨重渲染保留，直到用户确认/取消）
local pendingDelete = false

function SaveManagerScreen.Build(navigate)
    local nodes = {}
    table.insert(nodes, DS.SectionHeader("存档管理", nil, nil))

    local exists = SaveManager.Exists()
    if exists then
        -- 存档概览
        local info = {}
        pcall(function()
            local st = SaveManager.Load()
            if st and st.company then
                table.insert(info, { "俱乐部：" .. tostring(st.company.name or "?"), DS.C.text })
                table.insert(info, { "赛季进度：" .. tostring(st.company.seasons or 0) .. " 季 · 第 " .. tostring(st.company.week or 1) .. " 周", DS.C.muted })
                table.insert(info, { "现金：" .. DS.FormatCash(tonumber(st.company.cash) or 0), DS.C.muted })
            end
        end)
        if #info == 0 then info = { { "已存在存档", DS.C.text } } end
        table.insert(nodes, DS.AlertBox(info))

        -- 加载存档
        table.insert(nodes, DS.Button("加载存档", function()
            local ok, st = pcall(function() return SaveManager.Load() end)
            if ok and st then
                CompanyState.SetState(st)
                if navigate then navigate("dashboard") end
            end
        end, { height = 44, fontSize = 14 }))

        -- 删除存档（二次确认）
        if pendingDelete then
            table.insert(nodes, DS.AlertBox({ { "确认删除当前存档？此操作不可恢复。", DS.C.error } }))
            table.insert(nodes, DS.Button("确认删除", function()
                pcall(function() SaveManager.Delete() end)
                pendingDelete = false
                if navigate then navigate("savemanager") end
            end, { height = 40, fontSize = 13, variant = "secondary" }))
            table.insert(nodes, DS.Button("取消", function()
                pendingDelete = false
                if navigate then navigate("savemanager") end
            end, { height = 40, fontSize = 13, variant = "secondary" }))
        else
            table.insert(nodes, DS.Button("删除存档", function()
                pendingDelete = true
                if navigate then navigate("savemanager") end
            end, { height = 40, fontSize = 13, variant = "secondary" }))
        end
    else
        table.insert(nodes, DS.EmptyState("暂无存档", "从主菜单「开始新游戏」创建，或游戏退出时会自动保存进度。"))
    end

    -- 保存当前进度
    table.insert(nodes, DS.Button("保存当前进度", function()
        pcall(function()
            local st = CompanyState.GetState()
            if st then SaveManager.Save(st) end
        end)
        if navigate then navigate("savemanager") end
    end, { height = 44, fontSize = 14 }))

    table.insert(nodes, DS.Button("返回主菜单", function() if navigate then navigate("menu") end end, { height = 40, fontSize = 13, variant = "secondary" }))

    return AppShell.Build(navigate, "savemanager", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return SaveManagerScreen
