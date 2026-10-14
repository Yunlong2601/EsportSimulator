local RecoveryRoom = {}
RecoveryRoom.CONFIG = {
    ["soundproofing"] = {
        title = "声学降噪与隔音工程",
        levels = {
            [0] = { name = "普通卧室薄墙", cost = 0, energy = 0, focus = 0, mental = 0 },
            [1] = { name = "密封隔音条与吸音加厚窗帘", cost = 120, energy = 5, focus = 8, mental = 3 },
            [2] = { name = "双层录音室吸音板与静音窗", cost = 320, energy = 12, focus = 18, mental = 8 },
            [3] = { name = "航天级全密闭消音深睡静音舱", cost = 750, energy = 20, focus = 30, mental = 15 }
        }
    },
    ["bedding"] = {
        title = "高奢人体工学寝具",
        levels = {
            [0] = { name = "普通弹簧床与结块棉被", cost = 0, energy = 0, focus = 0, mental = 0 },
            [1] = { name = "慢回弹记忆枕与真丝眼罩", cost = 150, energy = 8, focus = 10, mental = 4 },
            [2] = { name = "天然乳胶七区释压深睡床垫", cost = 380, energy = 16, focus = 20, mental = 10 },
            [3] = { name = "智能恒温零重力悬浮深睡系统", cost = 850, energy = 25, focus = 35, mental = 18 }
        }
    },
    ["atmosphere"] = {
        title = "微气候环境与富氧理疗",
        levels = {
            [0] = { name = "密闭干燥室内空气", cost = 0, energy = 0, focus = 0, mental = 0 },
            [1] = { name = "负离子香薰加湿与助眠白噪音仪", cost = 100, energy = 6, focus = 8, mental = 5 },
            [2] = { name = "医疗级新风恒湿循环系统", cost = 280, energy = 12, focus = 16, mental = 10 },
            [3] = { name = "1.3ATA高压微氧睡眠康复舱", cost = 680, energy = 22, focus = 28, mental = 16 }
        }
    }
}

function RecoveryRoom.calculateBonuses(room_state)
    local state = room_state or { soundproofing = 0, bedding = 0, atmosphere = 0 }
    local energy, focus, mental = 0, 0, 0
    for cat_id, conf in pairs(RecoveryRoom.CONFIG) do
        local lvl = state[cat_id] or 0
        local ldata = conf.levels[lvl] or conf.levels[0]
        energy = energy + ldata.energy
        focus = focus + ldata.focus
        mental = mental + ldata.mental
    end
    return energy, focus, mental
end

function RecoveryRoom.rest(player)
    local b_energy, b_focus, b_mental = RecoveryRoom.calculateBonuses(player.recovery_room)
    player.energy = math.min(100, player.energy + 45 + b_energy)
    player.focus = math.min(100, (player.focus or 100) + 50 + b_focus)
    player.mental = math.min(100, player.mental + 18 + b_mental)
    return player.energy, player.focus, player.mental
end

return RecoveryRoom
