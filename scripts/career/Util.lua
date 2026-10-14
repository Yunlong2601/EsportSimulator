-- Pure helpers; no engine or legacy mode state.
local Util = {}

function Util.Copy(value)
    if type(value) ~= "table" then return value end
    local result = {}
    for k, v in pairs(value) do result[k] = Util.Copy(v) end
    return result
end

function Util.Clamp(value, low, high)
    return math.max(low, math.min(high, value))
end

function Util.Integer(value, low, high)
    return type(value) == "number" and value == value and value % 1 == 0
        and value >= (low or 0) and value <= (high or 1000000000000)
end

function Util.Random(world)
    world.rngState = (world.rngState * 48271) % 2147483647
    return world.rngState / 2147483647
end

function Util.Keys(map)
    local keys = {}
    for key in pairs(map) do keys[#keys + 1] = key end
    table.sort(keys)
    return keys
end

function Util.Record(world, kind, title, fields)
    local entry = Util.Copy(fields or {})
    entry.id = "history:" .. tostring(#world.history + 1)
    entry.kind, entry.title, entry.day = kind, title, world.clock.day
    world.history[#world.history + 1] = entry
    return entry
end

return Util
