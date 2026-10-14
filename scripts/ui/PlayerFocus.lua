-- PlayerFocus.lua — shared helper: pick the "focus player" for player_* detail screens.
-- Default = highest-power roster (starter > bench) player. A future roster tap can set
-- state.ui.focusPlayerId to pin a specific player.
local CompanyState = require("CompanyState")
local RosterSystem = require("RosterSystem")
local LeagueCatalog = require("LeagueCatalog")

local PlayerFocus = {}

local function num(v, d) return tonumber(v) or d end

function PlayerFocus.Get()
    local state = CompanyState.Ensure(CompanyState.GetState())

    -- pinned player still in squad?
    local pinned = state.ui and state.ui.focusPlayerId
    if pinned and pinned ~= "" then
        local p = LeagueCatalog.GetPlayer(pinned)
        if p then
            return { player = p, role = p.role, starter = RosterSystem.IsOwned(state, pinned) }
        end
    end

    local best, bestP, bestRole, bestStarter = nil, -1, nil, false
    local function scan(list, isStarter)
        for _, entry in ipairs(list) do
            local p = entry and entry.player
            if p then
                local ok, pw = pcall(function() return RosterSystem.GetPlayerPower(p, entry.role) end)
                local power = ok and num(pw, 0) or 0
                if power > bestP then
                    best, bestP, bestRole, bestStarter = p, power, entry.role, isStarter
                end
            end
        end
    end
    pcall(function() scan(RosterSystem.GetRosterPlayers(state) or {}, true) end)
    pcall(function() scan(RosterSystem.GetBenchPlayers(state) or {}, false) end)
    if best then
        return { player = best, role = bestRole or best.role, starter = bestStarter }
    end
    return nil
end

function PlayerFocus.Set(playerId)
    local state = CompanyState.Ensure(CompanyState.GetState())
    state.ui = state.ui or {}
    state.ui.focusPlayerId = playerId
    return state
end

return PlayerFocus
