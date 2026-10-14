-- secondline/screens/SlMatchScreen.lua — 周赛表现（§4 周粒度）
-- 自包含屏：复用 UI / DesignSystem / AppShell。出战只写 SecondLineState。
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local AppShell = require("ui.AppShell")
local SecondLineState = require("secondline.State")

local SlMatchScreen = {}

function SlMatchScreen.Build(navigate)
    local nodes = {}
    table.insert(nodes, DS.SectionHeader("周赛表现", nil, nil))

    local st = SecondLineState.GetState()
    if not st then
        table.insert(nodes, DS.EmptyState("尚未开始生涯", "请先从生涯主页创建选手。"))
        table.insert(nodes, DS.Button("返回生涯主页",
            function() if navigate then navigate("sl_home") end end,
            { height = 40, fontSize = 13, variant = "secondary" }))
        return AppShell.Build(navigate, "sl_match",
            UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
    end

    local p = st.player
    local c = st.career
    local rating = SecondLineState.GetRating()

    table.insert(nodes, DS.Card {
        flexDirection = "column", gap = DS.S.xs, padding = DS.S.sm,
        children = {
            DS.Label("预估评分 " .. tostring(rating) .. (rating >= 70 and "（有望取胜）" or "（状态吃紧）"),
                { fontSize = 13, fontWeight = "bold", fontColor = rating >= 70 and DS.C.success or DS.C.warning }),
            DS.Label("操作 " .. tostring(p.mechanics) .. " · 团战 " .. tostring(p.teamfight)
                .. " · 对线 " .. tostring(p.laning) .. " · 状态 " .. tostring(p.form),
                { fontSize = 11, fontColor = DS.C.muted }),
            DS.Label("战绩 " .. tostring(c.wins) .. " 胜 / " .. tostring(c.matches) .. " 场 · 声望 " .. tostring(p.reputation),
                { fontSize = 11, fontColor = DS.C.faint }),
            DS.Label("体力 " .. tostring(p.stamina) .. "（出战消耗 40）", { fontSize = 11, fontColor = DS.C.faint }),
        },
    })

    -- 最近一场赛果
    if c.lastMatch then
        local lm = c.lastMatch
        table.insert(nodes, DS.AlertBox({
            { "上场（S" .. tostring(lm.season) .. "·W" .. tostring(lm.week) .. "）：评分 " .. tostring(lm.rating)
                .. (lm.win and " · 取胜" or " · 失利"), lm.win and DS.C.success or DS.C.warning },
        }))
    end

    if p.stamina < 40 then
        table.insert(nodes, DS.AlertBox({
            { "体力不足，无法出战。回主页「跳过本周」恢复体力。", DS.C.warning },
        }))
    else
        table.insert(nodes, DS.Button("出战本周比赛", function()
            local res, err = SecondLineState.PlayMatch()
            if res then SecondLineState.Save() end
            if navigate then navigate("sl_match") end   -- 刷新显示赛果
        end, { height = 46, fontSize = 14 }))
    end

    table.insert(nodes, DS.AlertBox({
        { "出战将推进一周并触发生涯剧情（招牌玩法 D）。", DS.C.muted },
    }))

    table.insert(nodes, DS.Button("返回生涯主页",
        function() if navigate then navigate("sl_home") end end,
        { height = 40, fontSize = 13, variant = "secondary" }))

    return AppShell.Build(navigate, "sl_match",
        UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return SlMatchScreen
