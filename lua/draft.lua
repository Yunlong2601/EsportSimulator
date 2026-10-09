--[[
    DRAFTING ENGINE: 5v5 PICK & BAN FOR ARENA STAGE
--]]

local Champions = require("champions")

local Draft = {}

function Draft.new()
    return {
        roles = {"TOP", "JUG", "MID", "ADC", "SUP"},
        blue_picks = {nil, nil, nil, nil, nil},
        red_picks = {nil, nil, nil, nil, nil},
        current_index = 1
    }
end

function Draft.calculateScores(draft)
    local blue_score = 50
    local red_score = 50

    for i = 1, 5 do
        local b = draft.blue_picks[i]
        local r = draft.red_picks[i]

        if b then
            blue_score = blue_score + ((b.power - 85) * 1.2)
            if r then
                for _, target in ipairs(b.counters) do
                    if target == r.id then blue_score = blue_score + 7 end
                end
                for _, target in ipairs(b.countered_by) do
                    if target == r.id then blue_score = blue_score - 7 end
                end
            end
        end

        if r then
            red_score = red_score + ((r.power - 85) * 1.2)
            if b then
                for _, target in ipairs(r.counters) do
                    if target == b.id then red_score = red_score + 7 end
                end
                for _, target in ipairs(r.countered_by) do
                    if target == b.id then red_score = red_score - 7 end
                end
            end
        end
    end

    local total = blue_score + red_score
    local blue_pct = math.min(88, math.max(15, math.floor((blue_score / total) * 100)))
    return blue_pct, 100 - blue_pct
end

function Draft.pickChampion(draft, role_index, champ)
    draft.blue_picks[role_index] = champ

    -- Enemy AI counter-picks for the same role
    local role = draft.roles[role_index]
    local pool = Champions.getByRole(role)
    local enemy_choice = nil

    for _, c in ipairs(pool) do
        if c.id ~= champ.id then
            -- Prefer counter pick
            for _, counter_id in ipairs(c.counters) do
                if counter_id == champ.id then
                    enemy_choice = c
                    break
                end
            end
            if enemy_choice then break end
        end
    end

    if not enemy_choice then
        for _, c in ipairs(pool) do
            if c.id ~= champ.id then
                enemy_choice = c
                break
            end
        end
    end

    draft.red_picks[role_index] = enemy_choice
end

function Draft.autoDraft(draft)
    for i = 1, 5 do
        if not draft.blue_picks[i] then
            local role = draft.roles[i]
            local pool = Champions.getByRole(role)
            draft.blue_picks[i] = pool[1]
            draft.red_picks[i] = pool[2] or pool[1]
        end
    end
end

return Draft
