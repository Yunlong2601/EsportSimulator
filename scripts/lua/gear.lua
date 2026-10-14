--[[
    GEAR & HARDWARE STORE CATALOG
--]]

local Gear = {
    {
        id = "wooting",
        name = "Hall-Effect Rapid Trigger Keyboard",
        cost = 180,
        mechanics_bonus = 8,
        mental_bonus = 2,
        desc = "0.1mm actuation point. Instant flash animation cancels."
    },
    {
        id = "superlight",
        name = "Ultralight 49g Wireless Mouse",
        cost = 150,
        mechanics_bonus = 7,
        mental_bonus = 3,
        desc = "Pixel-perfect sensor tracking for skillshot accuracy."
    },
    {
        id = "monitor_360",
        name = "360Hz OLED Esports Display",
        cost = 550,
        mechanics_bonus = 12,
        mental_bonus = 5,
        desc = "0.03ms response time. Dodge spells before animation finishes."
    },
    {
        id = "herman_miller",
        name = "Ergonomic Posture Gaming Chair",
        cost = 750,
        mechanics_bonus = 4,
        mental_bonus = 16,
        desc = "Zero lower back fatigue during 14-hour marathon queues."
    },
    {
        id = "coach_vod",
        name = "LCK Challenger Coach 1-on-1 VOD Session",
        cost = 300,
        mechanics_bonus = 6,
        mental_bonus = 12,
        desc = "Deep wave management and jungle tracking masterclass."
    },
    {
        id = "energy_crate",
        name = "Nootropic Focus Energy Drink Crate",
        cost = 80,
        mechanics_bonus = 5,
        mental_bonus = 5,
        desc = "Clean caffeine and L-Theanine focus without jitters."
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
