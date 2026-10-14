-- secondline/screens/SlStoryScreen.lua — 招牌玩法 D：选手生涯剧情（§4 核心）
-- 自包含屏：复用 UI / DesignSystem / AppShell。剧情只写 SecondLineState。
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local AppShell = require("ui.AppShell")
local SecondLineState = require("secondline.State")

local SlStoryScreen = {}

function SlStoryScreen.Build(navigate)
    local nodes = {}
    table.insert(nodes, DS.SectionHeader("生涯剧情", nil, nil))
    table.insert(nodes, DS.AlertBox({
        { "招牌玩法 D：以选手视角展开的生涯叙事主线，每周赛后推进剧情。", DS.C.gold },
    }))

    local st = SecondLineState.GetState()
    if not st then
        table.insert(nodes, DS.EmptyState("尚未开始生涯", "请先从生涯主页创建选手。"))
    else
        local flags = st.career.storyFlags or {}
        if #flags == 0 then
            table.insert(nodes, DS.EmptyState("暂无剧情", "出战几场周赛，剧情会自动展开。"))
        else
            -- 倒序展示最近 12 条
            local show = {}
            for i = #flags, 1, -1 do
                table.insert(show, flags[i])
                if #show >= 12 then break end
            end
            for _, beat in ipairs(show) do
                table.insert(nodes, DS.Card {
                    flexDirection = "column", gap = DS.S.xs, padding = DS.S.sm,
                    children = {
                        DS.Label("S" .. tostring(beat.season) .. "·W" .. tostring(beat.week) .. " " .. tostring(beat.title),
                            { fontSize = 12, fontWeight = "bold", fontColor = DS.C.ember }),
                        DS.Label(tostring(beat.text), { fontSize = 11, fontColor = DS.C.muted }),
                    },
                })
            end
        end
    end

    table.insert(nodes, DS.Button("返回生涯主页",
        function() if navigate then navigate("sl_home") end end,
        { height = 40, fontSize = 13, variant = "secondary" }))

    return AppShell.Build(navigate, "sl_story",
        UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return SlStoryScreen
