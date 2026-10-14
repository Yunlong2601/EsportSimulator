-- Adapted from TrainingSystem's focus/recovery/diminishing-return concepts.
-- The preview and the actual daily activity share this pure calculation.
local Util = require("career.Util")
local Training = {}
Training.LABELS = { mechanics = "操作训练", gameSense = "比赛复盘", teamwork = "团队合练",
    mental = "心态训练", rest = "休息", social = "陪伴队友", work = "解说工作" }

function Training.Preview(person, focus, facility)
    if not Training.LABELS[focus] then return nil, "无效训练安排" end
    local effect = { focus = focus, gain = 0, fatigue = 0, morale = 0 }
    if focus == "rest" then effect.fatigue, effect.morale = -24, 3
    elseif focus == "social" then effect.fatigue, effect.morale, effect.relationship = -8, 5, 3
    elseif focus == "work" then effect.fatigue, effect.income = 6, 3000
    elseif person.careerStatus == "active" then
        local ageFactor = person.age <= 20 and 1.5 or person.age >= 29 and 0.35 or 1
        local repeatFactor = person.lastFocus == focus and 1 / (1 + (person.focusStreak or 0) * 0.3) or 1
        local fatigueFactor = 1 - (person.fatigue or 0) / 130
        effect.stat = focus
        effect.gain = 0.4 * ageFactor * repeatFactor * fatigueFactor * (1 + ((facility or 1) - 1) * 0.1)
        effect.fatigue = focus == "mental" and -6 or 10
        effect.morale = focus == "mental" and 4 or -1
    end
    return effect
end

function Training.Apply(person, focus, facility)
    local effect = Training.Preview(person, focus, facility)
    if effect.stat then person.attrs[effect.stat] = math.min(person.potential or 90, person.attrs[effect.stat] + effect.gain) end
    person.fatigue = Util.Clamp(person.fatigue + effect.fatigue, 0, 100)
    person.morale = Util.Clamp(person.morale + effect.morale, 0, 100)
    person.focusStreak = person.lastFocus == focus and (person.focusStreak or 0) + 1 or 1
    person.lastFocus = focus
    return effect
end

return Training
