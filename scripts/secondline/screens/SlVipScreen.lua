-- secondline/screens/SlVipScreen.lua — 生涯 VIP 中心（复用 AdSystem，不引入新 SDK）
-- 隔离铁律（§3 / §5.6）：广告计数落在主存档（AdSystem 自有账本），奖励只写
-- SecondLineState（属性点），绝不回写 CompanyState 任何游戏逻辑字段。
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local AppShell = require("ui.AppShell")
local CompanyState = require("CompanyState")
local AdSystem = require("AdSystem")
local SecondLineState = require("secondline.State")

local SlVipScreen = {}

function SlVipScreen.Build(navigate)
    local nodes = {}
    table.insert(nodes, DS.SectionHeader("生涯 VIP 中心", nil, nil))

    -- 复用 AdSystem（与主 VIP 中心同一套广告账号）。无参时返回 "sl_vip" 供刷新。
    local function refreshNav(t)
        if t == nil then return "sl_vip" end
        return navigate(t)
    end

    local main = CompanyState.GetState()
    if not main then
        table.insert(nodes, DS.EmptyState("VIP 中心不可用", "广告账号与主存档共享，请先创建战队存档。"))
        table.insert(nodes, DS.Button("返回生涯主页",
            function() if navigate then navigate("sl_home") end end,
            { height = 40, fontSize = 13, variant = "secondary" }))
        return AppShell.Build(navigate, "sl_vip",
            UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
    end

    local data = AdSystem.GetAdCenterData(main)
    table.insert(nodes, DS.Card {
        flexDirection = "column", gap = DS.S.xs, padding = DS.S.sm,
        children = {
            DS.Label("VIP 等级：" .. tostring(data.vipLabel) .. "（累计观看 " .. tostring(data.totalWatched) .. " 次）",
                { fontSize = 13, fontWeight = "bold", fontColor = DS.C.ember }),
            DS.Label("今日观看 " .. tostring(data.dailyWatched) .. " / " .. tostring(data.dailyLimit)
                .. "（剩余 " .. tostring(data.remaining) .. "）", { fontSize = 11, fontColor = DS.C.muted }),
        },
    })

    local st = SecondLineState.GetState()
    if not st then
        table.insert(nodes, DS.AlertBox({
            { "请先在生涯主页创建选手，再看广告领取属性点。", DS.C.warning },
        }))
    else
        table.insert(nodes, DS.AlertBox({
            { "当前属性点（训练加速）：" .. tostring(st.player.adPoints or 0), DS.C.gold },
            { "看广告可领属性点，训练时自动 +1 成长（封顶潜力）。", DS.C.muted },
        }))
        if data.remaining > 0 then
            table.insert(nodes, DS.Button("看广告领属性点 +1", function()
                -- rewardFn 只写 SecondLineState，不碰 CompanyState
                AdSystem.WatchAd(main, refreshNav, function(gs)
                    local s = SecondLineState.GetState()
                    if not s then return "请先开始生涯" end
                    s.player.adPoints = (tonumber(s.player.adPoints) or 0) + 1
                    SecondLineState.Save()
                    return "属性点 +1（当前 " .. tostring(s.player.adPoints) .. "）"
                end)
            end, { height = 46, fontSize = 14 }))
        else
            table.insert(nodes, DS.AlertBox({
                { "今日广告次数已用完（上限 " .. tostring(data.dailyLimit) .. "），明天 0 点重置。", DS.C.muted },
            }))
        end
    end

    table.insert(nodes, DS.Button("返回生涯主页",
        function() if navigate then navigate("sl_home") end end,
        { height = 40, fontSize = 13, variant = "secondary" }))

    return AppShell.Build(navigate, "sl_vip",
        UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return SlVipScreen
