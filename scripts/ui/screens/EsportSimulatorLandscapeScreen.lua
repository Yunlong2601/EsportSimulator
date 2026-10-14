--[[
    ============================================================================
    EsportSimulatorLandscapeScreen.lua — 1920x1080 Landscape Cyber HUD Screen
    ============================================================================
    TapTap Maker UrhoX 2D Lua Runtime
    Renders the full 1920x1080 Landscape Cyber Neon Chamfered HUD System:
      - Master Top Telemetry Bar with persistent status
      - Left Thumb Phase Switcher (Phase 1 Solo -> Phase 2 Pro -> Phase 3 Dynasty)
      - Right Thumb High-Frequency Tactical Action Deck
      - Interactive Center Stage with Draft BP / Solo Queue / Dynasty R&D Matrix
--]]

local PhaseViews = require("ui.cyber.PhaseViews")
local EsportSimulatorScreen = require("ui.screens.EsportSimulatorScreen")

local EsportSimulatorLandscapeScreen = {}

function EsportSimulatorLandscapeScreen.GetGame()
    return EsportSimulatorScreen.GetGame()
end

function EsportSimulatorLandscapeScreen.ResetGame(opts)
    return EsportSimulatorScreen.ResetGame(opts)
end

function EsportSimulatorLandscapeScreen.Build(navigate)
    return PhaseViews.Build(navigate)
end

return EsportSimulatorLandscapeScreen
