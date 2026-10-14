--[[
    ============================================================================
    VIEW_SCOUT_GACHA.LUA (TapTap Make / Mobile Portrait 390x844)
    ============================================================================
    Screen 1: 全球星探 · SSS 神级选手招募 (Scout Gacha)
    Neo-Esports Cyberpunk Theme:
      - Void Dark: #0a0e17
      - Surface Card: #0f131c
      - Electric Cyan: #00f0ff
      - Worlds Gold: #ffd700
--]]

local Data = require("gamedata_features")
local Logic = require("features_logic")

local ViewScoutGacha = {}
ViewScoutGacha.__index = ViewScoutGacha

function ViewScoutGacha.new()
    local self = setmetatable({}, ViewScoutGacha)
    self.last_pull_results = {}
    self.banner_animation_frame = 0
    return self
end

function ViewScoutGacha:renderCLI(current_phase, is_dynasty_unlocked)
    if (current_phase and current_phase < 3) and not is_dynasty_unlocked then
        print("================================================================================")
        print(" [全球星探招募 · 权限未解锁 🔒]")
        print("================================================================================")
        print(" 提示: 全球星探 · SSS 神级选手招募池仅对【第三阶段 · 传奇豪门】俱乐部总经理开放！")
        print(" 当前阶段限制: 请先在峡谷单双排中登顶最强王者并签署职业合约，在第二阶段打进世界赛，")
        print(" 并积累 $1,000,000 战队收购金挂靴退役开创电竞俱乐部后即可开启招募！")
        print("================================================================================")
        return false
    end

    local g = Data.gacha
    local p = g.featured_player
    print("================================================================================")
    print(" [全球星探 · SSS 神级选手招募] // " .. g.pool_name .. " (仅传奇豪门已解锁)")
    print("================================================================================")
    print(string.format("保底剩余抽数: %d 次 | 消耗钻石: %d 钻/十连", g.pity_count, g.cost_diamonds))
    print(string.format("概率分布: SSS %.1f%% | SSR %.1f%% | SR %.1f%% | R %.1f%%",
        g.rates.SSS * 100, g.rates.SSR * 100, g.rates.SR * 100, g.rates.R * 100))
    print("--------------------------------------------------------------------------------")
    print(string.format("★ 当期UP限定: [%s] %s - %s (OVR %d | APM %d)", p.tier, p.name, p.title, p.ovr, p.apm))
    print(string.format("  - 定位: %s | 微操: %d | 团战: %d | 大局观: %d | 心态: %d",
        p.role, p.stats.micro, p.stats.teamfight, p.stats.macro, p.stats.mental))
    print(string.format("  - 绝活英雄: %s", table.concat(p.signatures, ", ")))
    print(string.format("  - 专属被动: %s", p.passives))
    print("--------------------------------------------------------------------------------")
    print("[指令] 1. 单抽招募 (180钻)  |  2. 十连绝杀招募 (1800钻)  |  3. 招募历史")
    print("================================================================================")
    return true
end

function ViewScoutGacha:pull10(current_phase, is_dynasty_unlocked)
    if (current_phase and current_phase < 3) and not is_dynasty_unlocked then
        print("\n[!] 招募失败: 全球星探仅在【第三阶段 · 传奇豪门】作为战队老板/总经理时解锁可用！")
        return nil
    end

    self.last_pull_results = Logic.pull_10x(current_phase, is_dynasty_unlocked)
    print("\n>>> 🌟 [极光十连星探招募结果] 🌟 <<<")
    for i, item in ipairs(self.last_pull_results) do
        local tag = (item.tier == "SSS" or item.tier == "SSR") and "★金色传说★" or "普通"
        print(string.format("  #%02d [%s] %-18s (OVR %d) %s", i, item.tier, item.name, item.ovr, tag))
    end
    print(string.format(">>> 当前距离保底 SSS 必出剩余: %d 次 <<<", Data.gacha.pity_count))
    return self.last_pull_results
end

function ViewScoutGacha:pull1(current_phase, is_dynasty_unlocked)
    if (current_phase and current_phase < 3) and not is_dynasty_unlocked then
        print("\n[!] 招募失败: 全球星探仅在【第三阶段 · 传奇豪门】作为战队老板/总经理时解锁可用！")
        return nil
    end

    local item = Logic.pull_1x(current_phase, is_dynasty_unlocked)
    table.insert(self.last_pull_results, 1, item)
    print(string.format("\n>>> 单抽获得: [%s] %s (OVR %d) | 保底剩余: %d 次", item.tier, item.name, item.ovr, Data.gacha.pity_count))
    return item
end

return ViewScoutGacha
