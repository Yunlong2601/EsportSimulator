--[[
    ============================================================================
    VIEW_PRO_LIFE_SIM.LUA (TapTap Make / Mobile Portrait 390x844)
    ============================================================================
    Screen 2: 基地日常 · 电竞生活模拟 (Pro Life Sim)
    Neo-Esports Cyberpunk Theme:
      - 3-tile CCTV Camera Monitoring Hub (CAM_01 Scrim Lab, CAM_02 Mental Lounge, CAM_03 Kitchen)
      - Daily Comfort / Stress telemetry bar
      - Pop-up random encounter dialog ('Mid laner tilted in solo queue')
--]]

local Data = require("gamedata_features")
local Logic = require("features_logic")

local ViewProLifeSim = {}
ViewProLifeSim.__index = ViewProLifeSim

function ViewProLifeSim.new()
    local self = setmetatable({}, ViewProLifeSim)
    self.selected_cam = "CAM_01"
    self.event_resolved = false
    return self
end

function ViewProLifeSim:renderCLI()
    local sim = Data.life_sim
    print("================================================================================")
    print(" [基地日常 · 电竞生活俱乐部模拟] // " .. sim.base_name)
    print("================================================================================")
    print(string.format("环境舒适度: %d%% [====================] | 战队心态压力: %d%%",
        sim.comfort_pct, sim.team_stress_pct))
    print(string.format("今日剩余主教练督导指令: %d 次", sim.daily_commands_left))
    print("--------------------------------------------------------------------------------")
    print("【基地全天候 CCTV 监控终端】")
    for _, cam in ipairs(sim.cctv_rooms) do
        print(string.format("  [%s] %-28s 状态: %-12s 增益: %s",
            cam.id, cam.name, cam.status, cam.buff))
    end
    print("--------------------------------------------------------------------------------")
    if not self.event_resolved then
        local ev = sim.active_event
        print("🚨 " .. ev.title)
        print("  " .. ev.desc)
        print("  [选项 A] " .. ev.options[1].text .. " (花费: ¥" .. ev.options[1].cost_money .. " | 压力: " .. ev.options[1].stress_delta .. "%)")
        print("  [选项 B] " .. ev.options[2].text .. " (APM: +" .. ev.options[2].apm_delta .. " | 压力: +" .. ev.options[2].stress_delta .. "%)")
    else
        print("✔ 今日突发事件已由教练组妥善处置。战队全员心率稳定。")
    end
    print("================================================================================")
end

function ViewProLifeSim:resolveEvent(option_id, player_stats)
    local ok, msg = Logic.handle_life_event(option_id, player_stats)
    if ok then
        self.event_resolved = true
    end
    print("\n>>> " .. msg)
    return ok, msg
end

return ViewProLifeSim
