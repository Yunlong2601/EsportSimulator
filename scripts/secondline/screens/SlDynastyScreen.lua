-- secondline/screens/SlDynastyScreen.lua — 招牌玩法 B：王朝传承（§4 核心）
-- 自包含屏：复用 UI / DesignSystem / AppShell。传承只写 SecondLineState。
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local AppShell = require("ui.AppShell")
local SecondLineState = require("secondline.State")

local SlDynastyScreen = {}

function SlDynastyScreen.Build(navigate)
    local nodes = {}
    table.insert(nodes, DS.SectionHeader("王朝传承", nil, nil))
    table.insert(nodes, DS.AlertBox({
        { "招牌玩法 B：退役传奇落档名人堂，影响后续世代（青训传承占位）。", DS.C.gold },
    }))

    local st = SecondLineState.GetState()
    if not st then
        table.insert(nodes, DS.EmptyState("尚未开始生涯", "请先从生涯主页创建选手。"))
    else
        local c = st.career
        local d = c.dynasty or {}
        table.insert(nodes, DS.Card {
            flexDirection = "column", gap = DS.S.xs, padding = DS.S.sm,
            children = {
                DS.Label("续约次数 " .. tostring(d.reSigned or 0) .. " · 转会次数 " .. tostring(d.transferred or 0),
                    { fontSize = 11, fontColor = DS.C.muted }),
                DS.Label("冠军数 " .. tostring(c.titles or 0), { fontSize = 11, fontColor = DS.C.faint }),
            },
        })

        local hof = d.hallOfFame or {}
        if #hof == 0 then
            table.insert(nodes, DS.EmptyState("名人堂空缺", "达到传奇阶段或年满 40 岁退役，即可落档传承。"))
        else
            for _, e in ipairs(hof) do
                table.insert(nodes, DS.Card {
                    flexDirection = "column", gap = DS.S.xs, padding = DS.S.sm,
                    children = {
                        DS.Label(tostring(e.name) .. " · " .. SecondLineState.ArcLabel(e.arc),
                            { fontSize = 12, fontWeight = "bold", fontColor = DS.C.gold }),
                        DS.Label("冠军 " .. tostring(e.titles) .. " · 巅峰声望 " .. tostring(e.peakRep),
                            { fontSize = 11, fontColor = DS.C.muted }),
                    },
                })
            end
        end

        -- 传承占位按钮：达到条件时落档
        local p = st.player
        local canRetire = (tonumber(p.age) or 17) >= 40 or p.arc == "legend"
        table.insert(nodes, DS.Button("退役并落档名人堂" .. (canRetire and "" or "（未达条件）"),
            function()
                if not canRetire then return end
                local r = SecondLineState.RecordLegacy()
                if r then SecondLineState.Save() end
                if navigate then navigate("sl_dynasty") end
            end, { height = 44, fontSize = 13, variant = "secondary" }))
    end

    table.insert(nodes, DS.Button("返回生涯主页",
        function() if navigate then navigate("sl_home") end end,
        { height = 40, fontSize = 13, variant = "secondary" }))

    return AppShell.Build(navigate, "sl_dynasty",
        UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return SlDynastyScreen
