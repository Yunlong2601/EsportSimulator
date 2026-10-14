-- secondline/screens/SlTrainScreen.lua — 日常训练（§4 日常粒度）
-- 自包含屏：复用 UI / DesignSystem / AppShell。训练只写 SecondLineState。
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local AppShell = require("ui.AppShell")
local SecondLineState = require("secondline.State")

local SlTrainScreen = {}

local ATTRS = {
    { key = "mechanics", label = "操作" },
    { key = "teamfight", label = "团战" },
    { key = "laning",    label = "对线" },
}

local function doTrain(navigate, attrKey)
    local res, err = SecondLineState.Train(attrKey, "normal")
    if not res then return end          -- 体力不足等，保持当前页
    SecondLineState.Save()
    if navigate then navigate("sl_train") end
end

function SlTrainScreen.Build(navigate)
    local nodes = {}
    table.insert(nodes, DS.SectionHeader("日常训练", nil, nil))

    local st = SecondLineState.GetState()
    if not st then
        table.insert(nodes, DS.EmptyState("尚未开始生涯", "请先从生涯主页创建选手。"))
        table.insert(nodes, DS.Button("返回生涯主页",
            function() if navigate then navigate("sl_home") end end,
            { height = 40, fontSize = 13, variant = "secondary" }))
        return AppShell.Build(navigate, "sl_train",
            UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
    end

    local p = st.player
    table.insert(nodes, DS.AlertBox({
        { "体力 " .. tostring(p.stamina) .. " · 属性点(广告加速) " .. tostring(p.adPoints or 0), DS.C.text },
        { "训练消耗体力，每周比赛后恢复；属性点可在训练时 +1 成长。", DS.C.muted },
    }))
    if p.stamina < 10 then
        table.insert(nodes, DS.AlertBox({
            { "体力不足，无法训练。回主页「跳过本周」恢复体力。", DS.C.warning },
        }))
    end

    for _, a in ipairs(ATTRS) do
        local val = p[a.key] or 0
        local cap = math.max(val, p.potential or 80)
        table.insert(nodes, DS.Card {
            flexDirection = "row", justifyContent = "space-between", alignItems = "center",
            padding = DS.S.sm,
            children = {
                UI.Panel { flexDirection = "column", gap = DS.S.xs, children = {
                    DS.Label(a.label, { fontSize = 12, fontWeight = "bold", fontColor = DS.C.text }),
                    DS.Label("当前 " .. tostring(val) .. " / 潜力 " .. tostring(cap),
                        { fontSize = 11, fontColor = DS.C.muted }),
                } },
                DS.Button("训练 +2" .. ((p.adPoints or 0) > 0 and " (加速)" or ""),
                    function() doTrain(navigate, a.key) end,
                    { height = 38, fontSize = 12, variant = p.stamina >= 20 and "primary" or "secondary" }),
            },
        })
    end

    table.insert(nodes, DS.Button("返回生涯主页",
        function() if navigate then navigate("sl_home") end end,
        { height = 40, fontSize = 13, variant = "secondary" }))

    return AppShell.Build(navigate, "sl_train",
        UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return SlTrainScreen
