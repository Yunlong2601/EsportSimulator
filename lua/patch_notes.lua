--[[
    PATCH NOTES & DYNAMIC META SHIFT SYSTEM FOR ESPORTS LEGACY
--]]

local PatchNotes = {
    current_version = "Patch 14.20: Worlds Championship Meta",
    changes = {
        { champ = "ahri",    type = "BUFF", delta = 4, text = "Spirit Rush cooldown -15s; Charm speed +10%" },
        { champ = "ksante",  type = "NERF", delta = -5, text = "All Out armor conversion -12%" },
        { champ = "azir",    type = "BUFF", delta = 3, text = "Emperor's Divide wall width widened" },
        { champ = "kaisa",   type = "BUFF", delta = 4, text = "Killer Instinct shield value +20%" },
        { champ = "leesin",  type = "BUFF", delta = 3, text = "Dragon Rage base damage +75" },
        { champ = "sejuani", type = "NERF", delta = -3, text = "Permafrost stun duration -0.25s" }
    }
}

function PatchNotes.applyToChampions(champions_table)
    for _, change in ipairs(PatchNotes.changes) do
        for _, c in ipairs(champions_table) do
            if c.id == change.champ then
                c.power = c.power + change.delta
            end
        end
    end
end

return PatchNotes
