--[[
    GEAR & HARDWARE STORE CATALOG
--]]

local Gear = {
    {
        id = "wooting",
        name = "Wooting 60HE 磁轴键盘",
        cost = 180,
        mechanics_bonus = 8,
        mental_bonus = 2,
        category = "外设硬件",
        desc = "0.1mm 急停急启磁轴键程，极限瞬移闪现无后摇连招。"
    },
    {
        id = "superlight",
        name = "GPW 超轻量 49g 无线鼠标",
        cost = 150,
        mechanics_bonus = 7,
        mental_bonus = 3,
        category = "外设硬件",
        desc = "像素级电竞传感器追踪，走A与非指向技能命中率飙升。"
    },
    {
        id = "monitor_360",
        name = "360Hz OLED 极速电竞屏",
        cost = 550,
        mechanics_bonus = 12,
        mental_bonus = 5,
        category = "旗舰硬件",
        desc = "0.03ms 极致响应，在对手技能弹道出手前完成扭头规避。"
    },
    {
        id = "herman_miller",
        name = "人体工学电竞座舱椅",
        cost = 750,
        mechanics_bonus = 4,
        mental_bonus = 16,
        category = "基地装备",
        desc = "全贴合脊柱动态释压，连续14小时高强度冲分腰部零酸痛。"
    },
    {
        id = "coach_vod",
        name = "LCK 千分教练 1v1 复盘课",
        cost = 300,
        mechanics_bonus = 6,
        mental_bonus = 12,
        category = "私教研学",
        desc = "深度拆解兵线回推与野区动向，大局观与对线压制力飞跃。"
    },
    {
        id = "energy_crate",
        name = "神经元专注促智补给箱",
        cost = 80,
        mechanics_bonus = 5,
        mental_bonus = 5,
        category = "应急耗材",
        desc = "纯净高浓茶氨酸与咖啡因，瞬间驱散倦怠，思维清澈灵敏。"
    }
}

function Gear.getById(id)
    for _, item in ipairs(Gear) do
        if item.id == id then
            return item
        end
    end
    return nil
end

return Gear
