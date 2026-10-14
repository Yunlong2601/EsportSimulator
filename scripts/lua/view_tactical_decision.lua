--[[
    ============================================================================
    VIEW_TACTICAL_DECISION.LUA (TapTap Make / Mobile Portrait 390x844)
    ============================================================================
    Screen 3: 决胜时刻 · 战术决策终端 (Tactical Decision Arena)
    Baron Pit Decider HUD:
      - Match clock: 32:15
      - Baron HP bar with 1,200 Smite Threshold
      - Live casters commentary ticker
      - 3 tactical directive cards
--]]

local Data = require("gamedata_features")
local Logic = require("features_logic")

local ViewTacticalDecision = {}
ViewTacticalDecision.__index = ViewTacticalDecision

function ViewTacticalDecision.new()
    local self = setmetatable({}, ViewTacticalDecision)
    self.last_decision_result = nil
    return self
end

function ViewTacticalDecision:renderCLI()
    local arena = Data.tactical_arena
    print("================================================================================")
    print(" [决胜时刻 · 纳什男爵生死战决战终端] // 比赛时间: " .. arena.match_time)
    print(" 阶段: " .. arena.bo_phase)
    print("================================================================================")
    print(string.format("实时胜率预测: 蓝色方(我方) %d%% VS 红色方(敌方) %d%%", arena.blue_win_prob, arena.red_win_prob))
    print(string.format("纳什男爵生命值: %d / %d HP [斩杀线: %d HP 拼惩戒]",
        arena.baron_hp, arena.baron_max_hp, arena.smite_kill_threshold))
    print(string.format("教练战术点 (TP): %d 剩余", arena.coach_tactical_points))
    print("--------------------------------------------------------------------------------")
    print("🎙 官方赛事解说席 [米勒 & 娃娃]:")
    print("  『这条大龙如果被拿到，直接就是一波锁定世界赛门票！两边打野都在屏息以待！看惩戒还是看开团？！』")
    print("--------------------------------------------------------------------------------")
    print("【战术决断指令卡】")
    for _, opt in ipairs(arena.options) do
        print(string.format("  [%d] %-20s (成功率: %d%% | 消耗TP: %d)",
            opt.id, opt.title, opt.success_rate, opt.cost_tp))
        print(string.format("      成功: %s", opt.reward))
        print(string.format("      失败: %s", opt.risk))
    end
    print("================================================================================")
end

function ViewTacticalDecision:executeChoice(option_id)
    local is_clutch, result_msg = Logic.execute_tactical_choice(option_id)
    self.last_decision_result = { is_clutch = is_clutch, message = result_msg }
    if is_clutch then
        print("\n>>> 🔥【决胜时刻奇迹触发 - CLUTCH OUTPLAY】🔥")
        print(">>> " .. result_msg)
    else
        print("\n>>> 💀【战术决断受挫 - CRITICAL COLLAPSE】💀")
        print(">>> " .. result_msg)
    end
    return is_clutch, result_msg
end

return ViewTacticalDecision
