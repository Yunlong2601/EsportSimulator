--[[
    ============================================================================
    VIEW_HARDWARE_RIG.LUA (TapTap Make / Mobile Portrait 390x844)
    ============================================================================
    Screen 5: 神装外设 · 顶级电竞工坊 (Pro Hardware Rig)
    - 4 Peripherals Slots: Mouse, Keyboard, Monitor, Headset
    - Interactive RGB Overclock Slider (100% - 130%)
    - Lootbox & Crafting Inventory Bar
--]]

local Data = require("gamedata_features")
local Logic = require("features_logic")

local ViewHardwareRig = {}
ViewHardwareRig.__index = ViewHardwareRig

function ViewHardwareRig.new()
    local self = setmetatable({}, ViewHardwareRig)
    return self
end

function ViewHardwareRig:renderCLI()
    local rig = Data.hardware_rig
    print("================================================================================")
    print(" [神装外设 · 顶级赛级电竞工坊] // APM 极限加成: +" .. rig.total_apm_bonus)
    print(string.format(" 超极速响应延迟: %.1fms | 超频负荷档位: %d%%", rig.response_ms, rig.overclock_pct))
    print("================================================================================")
    print("【当前神级外设插槽槽位】")
    for slot_name, item in pairs(rig.active_slots) do
        print(string.format("  [%-8s] [%-9s] %-32s 效果: %s",
            slot_name:upper(), item.rarity, item.name, item.bonus))
    end
    print("--------------------------------------------------------------------------------")
    print("【工坊锻造特种原材】")
    local inv = rig.crafting_inventory
    print(string.format("  钛合金轴体: %d 颗 | 航天碳纤维外壳: %d 组 | 零延迟控制芯片: %d 枚",
        inv.titanium_switches, inv.carbon_shells, inv.low_latency_chips))
    print("================================================================================")
end

function ViewHardwareRig:setOverclock(pct)
    local boost, fatigue = Logic.set_overclock_rate(pct)
    print(string.format("\n>>> ⚡ 超频模式调节至 %d%%! APM加成调整为: +%d | 体能疲劳损耗: %d%%",
        Data.hardware_rig.overclock_pct, boost, fatigue))
    return boost, fatigue
end

return ViewHardwareRig
