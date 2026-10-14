-- AdCenterScreen.lua — VIP 中心（真实数据，取自 AdSystem）。
-- 取代原先的 ScreenFactory 代理占位（Factory.Build("adcenter")）。
-- 数据来源：AdSystem.GetAdCenterData / WatchAd / WatchForCash。
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local AppShell = require("ui.AppShell")
local CompanyState = require("CompanyState")
local AdSystem = require("AdSystem")

local AdCenterScreen = {}

function AdCenterScreen.Build(navigate)
    local nodes = {}
    table.insert(nodes, DS.SectionHeader("VIP 中心", nil, nil))

    -- AdSystem.WatchAd 看完后会调用 nav(nav()) 刷新当前页；但 navigate(target)
    -- 没有「返回当前页」语义（无参调用会跳回 dashboard）。这里用 wrapper：
    -- 无参时返回 "adcenter"（供 AdSystem 作刷新目标），带参时正常导航，
    -- 使观看广告后停留在 VIP 中心而非跳回 dashboard。
    local function refreshNav(t)
        if t == nil then return "adcenter" end
        return navigate(t)
    end

    local state = CompanyState.GetState()
    if not state then
        table.insert(nodes, DS.EmptyState("暂无游戏进度",
            "请先从主菜单「开始新游戏」创建战队，再回来领取 VIP 奖励。"))
        table.insert(nodes, DS.Button("返回主菜单",
            function() if navigate then navigate("menu") end end,
            { height = 40, fontSize = 13, variant = "secondary" }))
        return AppShell.Build(navigate, "adcenter",
            UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
    end

    local data = AdSystem.GetAdCenterData(state)

    -- 当日 VIP（免广告）状态
    if data.vipToday then
        table.insert(nodes, DS.AlertBox({
            { "今日 VIP 已解锁：免广告，点击任意奖励仍照常领取。", DS.C.success },
        }))
    else
        table.insert(nodes, DS.AlertBox({
            { "今日免广告进度：" .. tostring(data.vipDayWatched) .. " / " .. tostring(data.vipDayGoal), DS.C.text },
            { "再观看 " .. tostring(data.vipDayRemainingToUnlock) .. " 个广告即可解锁「当日免广告」。", DS.C.muted },
        }))
    end

    -- VIP 等级卡
    local lvlColor = DS.C.ember
    local lvlSub = "累计观看：" .. tostring(data.totalWatched) .. " 次"
    local lvlNext = data.nextVipThreshold
        and ("距下一级还需 " .. tostring(data.nextVipThreshold - data.totalWatched) .. " 次")
        or "已达最高 VIP 等级"
    table.insert(nodes, DS.Card {
        flexDirection = "column", gap = DS.S.xs, padding = DS.S.sm,
        children = {
            DS.Label("VIP 等级：" .. tostring(data.vipLabel), { fontSize = 13, fontWeight = "bold", fontColor = lvlColor }),
            DS.Label(lvlSub, { fontSize = 11, fontColor = DS.C.muted }),
            DS.Label(lvlNext, { fontSize = 11, fontColor = DS.C.faint }),
        },
    })

    -- 今日观看进度
    table.insert(nodes, DS.Card {
        flexDirection = "row", justifyContent = "space-between", alignItems = "center",
        padding = DS.S.sm, children = {
            DS.Label("今日观看", { fontSize = 12, fontColor = DS.C.text }),
            DS.Label(tostring(data.dailyWatched) .. " / " .. tostring(data.dailyLimit)
                .. "（剩余 " .. tostring(data.remaining) .. "）",
                { fontSize = 12, fontWeight = "bold", fontColor = DS.C.text }),
        },
    })

    -- 主操作
    if data.remaining > 0 then
        table.insert(nodes, DS.Button("观看广告领奖励", function()
            -- rewardFn = nil → AdSystem 默认发放 现金 + 声誉，并累计当日 VIP 进度
            AdSystem.WatchAd(state, refreshNav, nil)
        end, { height = 46, fontSize = 14 }))

        table.insert(nodes, DS.Button("看广告领现金 +¥" .. tostring(AdSystem.REWARD_CASH) .. "万", function()
            AdSystem.WatchForCash(state, refreshNav, AdSystem.REWARD_CASH)
        end, { height = 40, fontSize = 13, variant = "secondary" }))
    else
        table.insert(nodes, DS.AlertBox({
            { "今日广告次数已用完（上限 " .. tostring(data.dailyLimit) .. "），明天 0 点重置。", DS.C.muted },
        }))
    end

    -- VIP 说明
    table.insert(nodes, DS.SectionHeader("VIP 说明", nil, nil))
    table.insert(nodes, DS.AlertBox({
        { "• 每日观看广告可领现金 + 声誉奖励。", DS.C.muted },
        { "• 累计观看提升 VIP 等级，提高每日观看上限（VIP1:8 / VIP2:12 / VIP3:20）。", DS.C.muted },
        { "• 当日观看满 " .. tostring(AdSystem.VIP_DAY_GOAL) .. " 个广告，解锁「当日免广告」，当天所有奖励一键领取。", DS.C.muted },
    }))

    table.insert(nodes, DS.Button("返回主菜单",
        function() if navigate then navigate("menu") end end,
        { height = 40, fontSize = 13, variant = "secondary" }))

    return AppShell.Build(navigate, "adcenter",
        UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return AdCenterScreen
