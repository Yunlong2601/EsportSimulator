-- AdSystem：广告状态管理 + 激励视频统一入口
-- 管理每日观看次数、VIP 等级、奖励发放。
-- 所有激励视频广告统一通过 AdSystem.WatchAd 调用，确保状态一致。
local CompanyState = require("CompanyState")
local SaveManager = require("SaveManager")
local DesignSystem = require("ui.DesignSystem")

local AdSystem = {}

-- 广告位 ID（已开通，status=1）
AdSystem.AD_PLACEMENT_REWARD = "1054323"  -- 激励视频 type=1

-- 每日观看上限（免费玩家 / VIP 等级对应上限）
AdSystem.DAILY_LIMIT_FREE = 5
AdSystem.DAILY_LIMIT_VIP1 = 8
AdSystem.DAILY_LIMIT_VIP2 = 12
AdSystem.DAILY_LIMIT_VIP3 = 20

-- VIP 等级阈值（累计观看次数）
AdSystem.VIP_THRESHOLDS = { 0, 10, 30, 60 }

-- 单次广告奖励
AdSystem.REWARD_CASH = 15  -- 万
AdSystem.REWARD_REP = 3     -- 声誉

-- 当日 VIP（免广告）解锁门槛：累计观看满 3 个广告即解锁当日免广告
AdSystem.VIP_DAY_GOAL = 3

-- 确保广告状态已初始化
function AdSystem.Ensure(gameState)
    gameState = CompanyState.Ensure(gameState)
    if not gameState.ad then
        gameState.ad = {
            dailyWatched = 0,
            dailyLimit = AdSystem.DAILY_LIMIT_FREE,
            lastWatchDate = "",
            totalWatched = 0,
            vipLevel = 0,
            todayRewards = {},  -- { placementId = count }
            vipDayWatched = 0,   -- 今日为解锁 VIP 已观看广告数
            vipDayActive = false,-- 当日 VIP（免广告）是否已解锁
            vipDayDate = "",     -- 解锁日期 YYYY-MM-DD
        }
    end
    AdSystem._CheckDailyReset(gameState)
    return gameState.ad
end

-- 跨日自动重置每日计数（含当日 VIP 进度）
function AdSystem._CheckDailyReset(gameState)
    local ad = gameState.ad
    local today = os.date("%Y-%m-%d")
    if ad.lastWatchDate ~= today then
        ad.dailyWatched = 0
        ad.todayRewards = {}
        ad.lastWatchDate = today
        ad.vipDayWatched = 0
        ad.vipDayActive = false
    end
end

-- 获取当前 VIP 等级对应的每日上限
function AdSystem.GetDailyLimit(gameState)
    local ad = AdSystem.Ensure(gameState)
    local vip = ad.vipLevel or 0
    if vip >= 3 then return AdSystem.DAILY_LIMIT_VIP3 end
    if vip >= 2 then return AdSystem.DAILY_LIMIT_VIP2 end
    if vip >= 1 then return AdSystem.DAILY_LIMIT_VIP1 end
    return AdSystem.DAILY_LIMIT_FREE
end

-- 获取 VIP 等级（基于累计观看次数）
function AdSystem.GetVipLevel(totalWatched)
    totalWatched = totalWatched or 0
    if totalWatched >= 60 then return 3 end
    if totalWatched >= 30 then return 2 end
    if totalWatched >= 10 then return 1 end
    return 0
end

-- 获取 VIP 等级标签
function AdSystem.GetVipLabel(vipLevel)
    local labels = { "免费", "VIP 1", "VIP 2", "VIP 3" }
    return labels[(vipLevel or 0) + 1] or "免费"
end

-- ============================================================================
-- 当日 VIP（免广告）系统
-- 观看满 VIP_DAY_GOAL 个广告 → 当日解锁「免广告」（所有广告位一键跳过仍领奖励）
-- ============================================================================

-- 今日是否已处于 VIP（免广告）状态
function AdSystem.IsVipToday(gameState)
    local ad = AdSystem.Ensure(gameState)
    return (ad.vipDayActive == true) and (ad.vipDayDate == os.date("%Y-%m-%d"))
end

-- 记录一个「用于解锁 VIP 的观看」（普通广告完整观看后调用）
function AdSystem.RecordAdForVipDay(gameState)
    local ad = AdSystem.Ensure(gameState)
    ad.vipDayWatched = (ad.vipDayWatched or 0) + 1
    if ad.vipDayWatched >= AdSystem.VIP_DAY_GOAL then
        ad.vipDayActive = true
        ad.vipDayDate = os.date("%Y-%m-%d")
    end
end

-- 当日 VIP 进度
function AdSystem.GetVipDayProgress(gameState)
    local ad = AdSystem.Ensure(gameState)
    local active = AdSystem.IsVipToday(gameState)
    return {
        watched = ad.vipDayWatched or 0,
        goal = AdSystem.VIP_DAY_GOAL,
        active = active,
        remainingToUnlock = math.max(0, AdSystem.VIP_DAY_GOAL - (ad.vipDayWatched or 0)),
    }
end

-- 今日还可观看次数
function AdSystem.GetRemainingToday(gameState)
    local ad = AdSystem.Ensure(gameState)
    local limit = AdSystem.GetDailyLimit(gameState)
    return math.max(0, limit - ad.dailyWatched)
end

-- 今日已观看次数
function AdSystem.GetWatchedToday(gameState)
    local ad = AdSystem.Ensure(gameState)
    return ad.dailyWatched or 0
end

-- 检查今日是否还有观看次数
function AdSystem.CanWatchToday(gameState)
    return AdSystem.GetRemainingToday(gameState) > 0
end

-- 统一观看广告入口
-- placementId: 广告位 ID（当前只用 "1054323" 激励视频）
-- rewardFn: 奖励回调函数，接收 gameState 参数，返回描述字符串
-- callback: 最终回调（可选，用于 UI 刷新）
function AdSystem.WatchAd(gameState, nav, rewardFn, callback)
    local ad = AdSystem.Ensure(gameState)

    -- 关键修复：在同步 UI 上下文捕获 Toast 引用。
    -- 激励视频回调由原生 SDK 异步调用（SDKLuaAPI::CallRewardVideoAdCallback），
    -- 该上下文中全局 UI 可能解析为不含 Toast 字段的表，导致
    -- 「attempt to index a nil value (field 'Toast')」。捕获真实引用可避免崩溃。
    local Toast = (type(UI) == "table" and UI.Toast) or nil
    local function toast(kind, msg)
        if Toast and Toast[kind] then
            local ok, err = pcall(Toast[kind], msg)
            if not ok then
                print("[AdSystem] toast(" .. tostring(kind) .. ") failed:", tostring(err))
            end
        end
    end

    -- 当日 VIP 生效：直接发放奖励，跳过广告（无限次，当日有效）
    if AdSystem.IsVipToday(gameState) then
        local rewardDesc = rewardFn and rewardFn(gameState) or "奖励已发放"
        SaveManager.Save(gameState)
        toast("SuccessGlobal", "VIP 免广告：" .. rewardDesc)
        if nav then nav(nav()) end  -- 刷新当前页面
        if callback then callback(true) end
        return true
    end

    -- 检查每日上限
    if not AdSystem.CanWatchToday(gameState) then
        toast("ErrorGlobal", "今日广告次数已用完，明天再来吧！")
        if callback then callback(false, "daily_limit") end
        return false
    end

    -- 调用 SDK 播放激励视频
    local completed = false

    local function finish(result)
        if completed then return end
        completed = true

        if result and result.success then
            -- 广告完整观看，发放奖励
            ad.dailyWatched = (ad.dailyWatched or 0) + 1
            ad.totalWatched = (ad.totalWatched or 0) + 1

            -- 更新 VIP 等级
            ad.vipLevel = AdSystem.GetVipLevel(ad.totalWatched)

            -- 累计当日 VIP 进度（满 3 个广告解锁免广告）
            AdSystem.RecordAdForVipDay(gameState)

            -- 发放自定义奖励
            local rewardDesc = ""
            if rewardFn then
                rewardDesc = rewardFn(gameState) or "奖励已发放"
            else
                -- 默认奖励：现金 + 声誉
                gameState.company.cash = (gameState.company.cash or 0) + AdSystem.REWARD_CASH
                gameState.company.reputation = math.min(100, (gameState.company.reputation or 0) + AdSystem.REWARD_REP)
                rewardDesc = "现金 +¥" .. tostring(AdSystem.REWARD_CASH) .. "万 · 声誉 +" .. tostring(AdSystem.REWARD_REP)
            end

            SaveManager.Save(gameState)
            toast("SuccessGlobal", "广告观看完成！" .. rewardDesc)

            if nav then nav(nav()) end  -- 刷新当前页面
        else
            -- 广告未完整观看
            local msg = result and result.msg or "广告暂不可用"
            toast("ErrorGlobal", "广告观看失败：" .. tostring(msg))
        end

        if callback then callback(result and result.success or false, result) end
    end

    ---@diagnostic disable-next-line: undefined-global
    local accepted = sdk:ShowRewardVideoAd(function(result)
        finish(result)
    end)

    if accepted == false then
        finish({ success = false, msg = "广告暂不可用，请稍后重试" })
        return false
    end

    return true
end

-- 快捷：看广告领现金（Dashboard 用）
function AdSystem.WatchForCash(gameState, nav, amount, callback)
    amount = amount or AdSystem.REWARD_CASH
    return AdSystem.WatchAd(gameState, nav, function(gs)
        gs.company.cash = (gs.company.cash or 0) + amount
        return "现金 +¥" .. tostring(amount) .. "万"
    end, callback)
end

-- 快捷：看广告免费用招募（Academy 用）
function AdSystem.WatchForFreeScout(gameState, nav, callback)
    return AdSystem.WatchAd(gameState, nav, function(gs)
        -- 奖励在 AcademyScreen 侧直接处理（免除本次招募费用）
        return "下次招募免费"
    end, callback)
end

-- 快捷：看广告额外球探名额（Market 用）
function AdSystem.WatchForExtraScout(gameState, nav, callback)
    return AdSystem.WatchAd(gameState, nav, function(gs)
        -- 奖励在 MarketScreen 侧直接处理（增加一次球探名额）
        return "球探名额 +1"
    end, callback)
end

-- 获取广告中心数据（供 AdCenterScreen 使用）
function AdSystem.GetAdCenterData(gameState)
    local ad = AdSystem.Ensure(gameState)
    local limit = AdSystem.GetDailyLimit(gameState)
    local remaining = AdSystem.GetRemainingToday(gameState)
    local vip = ad.vipLevel or 0

    local vipDay = AdSystem.GetVipDayProgress(gameState)
    return {
        dailyWatched = ad.dailyWatched or 0,
        dailyLimit = limit,
        remaining = remaining,
        totalWatched = ad.totalWatched or 0,
        vipLevel = vip,
        vipLabel = AdSystem.GetVipLabel(vip),
        nextVipThreshold = AdSystem.VIP_THRESHOLDS[(vip or 0) + 2] or nil,  -- 下一级阈值
        vipToday = vipDay.active,                       -- 当日 VIP（免广告）是否生效
        vipDayWatched = vipDay.watched,
        vipDayGoal = vipDay.goal,
        vipDayRemainingToUnlock = vipDay.remainingToUnlock,
    }
end

return AdSystem
