--[[
    CHAMPIONS DATABASE FOR ESPORTS LEGACY
    Defines champions, roles, tiers, power levels, counters, and signature moves.
--]]

local Champions = {
    -- TOP LANE
    {
        id = "aatrox",
        name = "Aatrox, Darkin Blade",
        role = "TOP",
        archetype = "Dive/Assassin",
        tier = "S+",
        power = 94,
        counters = {"sion", "ornn", "chogath"},
        countered_by = {"fiora", "gnar", "camille"},
        signature = "World Ender 1v4 Pentakill Flank"
    },
    {
        id = "ksante",
        name = "K'Sante, Pride of Nazumah",
        role = "TOP",
        archetype = "Engage Tank",
        tier = "S",
        power = 91,
        counters = {"jax", "camille", "jayce"},
        countered_by = {"fiora", "gwen", "rumble"},
        signature = "All Out Wall Kidnap & Solo Kill"
    },
    {
        id = "gnar",
        name = "Gnar, Missing Link",
        role = "TOP",
        archetype = "Engage Tank",
        tier = "S",
        power = 89,
        counters = {"aatrox", "renekton", "darius"},
        countered_by = {"irelia", "yasuo", "jayce"},
        signature = "Mega-Gnar 5-Man River Wall Stun"
    },
    {
        id = "jax",
        name = "Jax, Grandmaster at Arms",
        role = "TOP",
        archetype = "Splitpusher",
        tier = "A",
        power = 87,
        counters = {"fiora", "camille", "tryndamere"},
        countered_by = {"ksante", "malphite", "gragas"},
        signature = "Counter Strike Flash Inhibit Dive"
    },
    {
        id = "rumble",
        name = "Rumble, Mechanized Menace",
        role = "TOP",
        archetype = "Teamfight Wombo",
        tier = "S",
        power = 92,
        counters = {"ksante", "sion", "chogath"},
        countered_by = {"aatrox", "gnar"},
        signature = "Equalizer Chokepoint Carpet Bomb"
    },

    -- JUNGLE
    {
        id = "leesin",
        name = "Lee Sin, Blind Monk",
        role = "JUG",
        archetype = "Dive/Assassin",
        tier = "S+",
        power = 96,
        counters = {"sejuani", "maokai", "zac"},
        countered_by = {"poppy", "viego", "jarvan"},
        signature = "InSec Flash Kick into Carry"
    },
    {
        id = "jarvan",
        name = "Jarvan IV, Exemplar of Demacia",
        role = "JUG",
        archetype = "Engage Tank",
        tier = "S",
        power = 90,
        counters = {"vi", "xin", "nocturne"},
        countered_by = {"poppy", "viego"},
        signature = "EQ Flash Cataclysm Pit Trap"
    },
    {
        id = "viego",
        name = "Viego, Ruined King",
        role = "JUG",
        archetype = "Hypercarry",
        tier = "S",
        power = 93,
        counters = {"leesin", "jarvan"},
        countered_by = {"rammus", "sejuani", "maokai"},
        signature = "Possession Reset Chain Clean Up"
    },
    {
        id = "sejuani",
        name = "Sejuani, Fury of the North",
        role = "JUG",
        archetype = "Engage Tank",
        tier = "A",
        power = 86,
        counters = {"viego", "khazix"},
        countered_by = {"leesin", "graves"},
        signature = "Glacial Prison Across Screen Snipe"
    },
    {
        id = "nidalee",
        name = "Nidalee, Bestial Huntress",
        role = "JUG",
        archetype = "Poke",
        tier = "A",
        power = 88,
        counters = {"sejuani", "maokai"},
        countered_by = {"jarvan", "poppy"},
        signature = "Fog of War Spear One-Shot"
    },

    -- MID LANE
    {
        id = "ahri",
        name = "Ahri, Nine-Tailed Fox",
        role = "MID",
        archetype = "Dive/Assassin",
        tier = "S",
        power = 93,
        counters = {"syndra", "orianna", "viktor"},
        countered_by = {"yasuo", "galio", "leblanc"},
        signature = "Spirit Rush Charm Blind Flank"
    },
    {
        id = "azir",
        name = "Azir, Emperor of the Sands",
        role = "MID",
        archetype = "Control Mage",
        tier = "S+",
        power = 97,
        counters = {"orianna", "viktor", "ryze"},
        countered_by = {"sylas", "leblanc", "ahri"},
        signature = "Shurima Shuffle Into Fountain"
    },
    {
        id = "orianna",
        name = "Orianna, Lady of Clockwork",
        role = "MID",
        archetype = "Control Mage",
        tier = "S",
        power = 92,
        counters = {"ryze", "galio", "vladimir"},
        countered_by = {"ahri", "azir", "syndra"},
        signature = "5-Man Shockwave Ball Delivery"
    },
    {
        id = "sylas",
        name = "Sylas, Unshackled",
        role = "MID",
        archetype = "Dive/Assassin",
        tier = "S",
        power = 94,
        counters = {"azir", "malphite", "galio"},
        countered_by = {"cassiopeia", "orianna"},
        signature = "Hijack Enemy Ultimates Outplay"
    },
    {
        id = "yone",
        name = "Yone, Unforgotten",
        role = "MID",
        archetype = "Hypercarry",
        tier = "S",
        power = 91,
        counters = {"viktor", "syndra", "hwei"},
        countered_by = {"renekton", "pantheon"},
        signature = "Fate Sealed Multiman Teleport Slash"
    },

    -- ADC / BOT
    {
        id = "kaisa",
        name = "Kai'Sa, Daughter of the Void",
        role = "ADC",
        archetype = "Dive/Assassin",
        tier = "S+",
        power = 95,
        counters = {"jinx", "aphelios", "varus"},
        countered_by = {"caitlyn", "draven", "lucian"},
        signature = "Killer Instinct Dive into Backline"
    },
    {
        id = "jinx",
        name = "Jinx, Loose Cannon",
        role = "ADC",
        archetype = "Hypercarry",
        tier = "S",
        power = 93,
        counters = {"ezreal", "zeri", "sivir"},
        countered_by = {"kaisa", "samira", "tristana"},
        signature = "Get Excited Rocket Pentakill"
    },
    {
        id = "varus",
        name = "Varus, Arrow of Retribution",
        role = "ADC",
        archetype = "Poke",
        tier = "A",
        power = 89,
        counters = {"caitlyn", "ashe", "lucian"},
        countered_by = {"kaisa", "zeri"},
        signature = "Piercing Arrow Objective Steal"
    },
    {
        id = "ezreal",
        name = "Ezreal, Prodigal Explorer",
        role = "ADC",
        archetype = "Poke",
        tier = "A",
        power = 88,
        counters = {"blitzcrank", "nautilus"},
        countered_by = {"jinx", "caitlyn"},
        signature = "Arcane Shift Trueshot Barrage Snipe"
    },

    -- SUPPORT
    {
        id = "nautilus",
        name = "Nautilus, Titan of the Depths",
        role = "SUP",
        archetype = "Engage Tank",
        tier = "S+",
        power = 94,
        counters = {"lulu", "nami", "soraka", "sona"},
        countered_by = {"morgana", "braum", "thresh"},
        signature = "Depth Charge Point-and-Click CC"
    },
    {
        id = "thresh",
        name = "Thresh, Chain Warden",
        role = "SUP",
        archetype = "Engage Tank",
        tier = "S",
        power = 92,
        counters = {"leona", "alistar", "nautilus"},
        countered_by = {"morgana", "zyra"},
        signature = "Death Sentence Blind Prediction Hook"
    },
    {
        id = "rakan",
        name = "Rakan, Charmer",
        role = "SUP",
        archetype = "Engage Tank",
        tier = "S",
        power = 93,
        counters = {"braum", "alistar", "tahm"},
        countered_by = {"poppy", "janna"},
        signature = "The Quickness Grand Entrance W Combo"
    },
    {
        id = "lulu",
        name = "Lulu, Fae Sorceress",
        role = "SUP",
        archetype = "Enchanter",
        tier = "A",
        power = 87,
        counters = {"zed", "talon", "leblanc"},
        countered_by = {"nautilus", "blitzcrank", "pyke"},
        signature = "Wild Growth Hypercarry Shield Deny"
    }
}

function Champions.getByRole(role)
    local list = {}
    for _, c in ipairs(Champions) do
        if c.role == role then
            table.insert(list, c)
        end
    end
    return list
end

function Champions.getById(id)
    for _, c in ipairs(Champions) do
        if c.id == id then
            return c
        end
    end
    return nil
end

return Champions
