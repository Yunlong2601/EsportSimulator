--[[
    ============================================================================
    VIEW_SYNERGY_NETWORK.LUA (TapTap Make / Mobile Portrait 390x844)
    ============================================================================
    Screen 4: 战队羁绊 · 选手默契网络 (Synergy Link Matrix)
    - 5-player Constellation Topology: TOP, JNG, MID, BOT, SUP
    - 4 Active Duo Synergies (e.g., 'Golden Mid-Jungle Lv.5 MAX')
    - 3 Tactical Resonance Slots
--]]

local Data = require("gamedata_features")
local Logic = require("features_logic")

local ViewSynergyNetwork = {}
ViewSynergyNetwork.__index = ViewSynergyNetwork

function ViewSynergyNetwork.new()
    local self = setmetatable({}, ViewSynergyNetwork)
    return self
end

function ViewSynergyNetwork:renderCLI()
    local syn = Data.synergy_network
    print("================================================================================")
    print(" [战队羁绊 · 选手默契神经拓扑网络] // 超频同调率: " .. syn.overcharge_pct .. "%")
    print(" 全队终结伤害提升: " .. syn.team_dmg_buff .. " | 支援游走移速: " .. syn.roam_speed_buff)
    print("================================================================================")
    print("【星芒阵列拓扑】 [上单 TOP] <===> [打野 JNG] <===> [中单 MID]")
    print("                            \\            //")
    print("                     [ADC 下路] <===> [辅助 SUP]")
    print("--------------------------------------------------------------------------------")
    print("【核心双人组默契羁绊】")
    for _, pair in ipairs(syn.pairs) do
        local tag = pair.is_max and "[MAX极境]" or ("LV." .. pair.lv)
        print(string.format("  [%-10s] %-18s %s : %s", pair.code, pair.title, tag, pair.effect))
    end
    print("--------------------------------------------------------------------------------")
    print("【战队共鸣圣物插槽】")
    for i, res in ipairs(syn.resonances) do
        local status = res.locked and "[未解锁 🔒]" or (res.equipped and "[已共鸣 ⚡]" or "[可装备]")
        print(string.format("  #%d %-16s %s : %s", i, res.name, status, res.desc))
    end
    print("================================================================================")
end

function ViewSynergyNetwork:upgrade(code)
    local ok, msg = Logic.upgrade_synergy(code)
    print("\n>>> " .. msg)
    return ok, msg
end

return ViewSynergyNetwork
