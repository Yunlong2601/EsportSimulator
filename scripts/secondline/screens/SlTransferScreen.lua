-- secondline/screens/SlTransferScreen.lua — 赛季转会窗（§4 赛季粒度）
-- 自包含屏：复用 UI / DesignSystem / AppShell。转会只写 SecondLineState。
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local AppShell = require("ui.AppShell")
local SecondLineState = require("secondline.State")

local SlTransferScreen = {}

function SlTransferScreen.Build(navigate)
    local nodes = {}
    table.insert(nodes, DS.SectionHeader("赛季转会窗", nil, nil))

    local st = SecondLineState.GetState()
    if not st then
        table.insert(nodes, DS.EmptyState("尚未开始生涯", "请先从生涯主页创建选手。"))
        table.insert(nodes, DS.Button("返回生涯主页",
            function() if navigate then navigate("sl_home") end end,
            { height = 40, fontSize = 13, variant = "secondary" }))
        return AppShell.Build(navigate, "sl_transfer",
            UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
    end

    if not st.career.transferPending then
        table.insert(nodes, DS.EmptyState("转会窗未开启", "赛季结束时（每 48 周）自动开启转会 / 续约窗口。"))
        table.insert(nodes, DS.Button("返回生涯主页",
            function() if navigate then navigate("sl_home") end end,
            { height = 40, fontSize = 13, variant = "secondary" }))
        return AppShell.Build(navigate, "sl_transfer",
            UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
    end

    local p = st.player
    table.insert(nodes, DS.AlertBox({
        { "第 " .. tostring(p.season - 1) .. " 赛季结束，迎来转会窗。", DS.C.gold },
        { "声望 " .. tostring(p.reputation) .. " · 当前阶段 " .. SecondLineState.ArcLabel(p.arc), DS.C.muted },
    }))

    table.insert(nodes, DS.Button("续约当前战队", function()
        SecondLineState.SeasonTransfer("stay")
        SecondLineState.Save()
        if navigate then navigate("sl_home") end
    end, { height = 44, fontSize = 13 }))

    local canTransfer = (tonumber(p.reputation) or 0) >= 60
    table.insert(nodes, DS.Button("寻求转会（需声望≥60）" .. (canTransfer and "" or " · 未达条件"),
        function()
            if not canTransfer then return end
            SecondLineState.SeasonTransfer("transfer")
            SecondLineState.Save()
            if navigate then navigate("sl_home") end
        end, { height = 44, fontSize = 13, variant = "secondary" }))

    table.insert(nodes, DS.Button("返回生涯主页",
        function() if navigate then navigate("sl_home") end end,
        { height = 40, fontSize = 13, variant = "secondary" }))

    return AppShell.Build(navigate, "sl_transfer",
        UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return SlTransferScreen
