--[[
    ============================================================================
    ESPORTS LEGACY: ROAD TO WORLDS (TAPTAP MAKE LUA ENGINE)
    ============================================================================
    Master Entry Point: main.lua
    Compatible with: TapTap Make, Pure Lua 5.1+, LuaJIT, Love2D 11.4+, and CLI.
--]]

-- Configure package.path so modules in ./lua can be required seamlessly
if package and package.path then
    if not string.find(package.path, "lua/%?.lua") then
        package.path = "./lua/?.lua;./lua/?/init.lua;./?.lua;" .. package.path
    end
end

local ok_tap, TapTapGame = pcall(require, "taptap_make_main")
if not ok_tap or type(TapTapGame) ~= "table" then
    TapTapGame = require("lua.taptap_make_main")
end

-- Global game instance for TapTap Make runtime
local active_game = nil

-- ============================================================================
-- LOVE2D & TAPTAP MAKE LIFECYCLE HOOKS
-- ============================================================================
if love then
    function love.load()
        active_game = TapTapGame.new()
        print("🎮 [TapTap Make] Esports Legacy Engine Initialized successfully!")
        print(string.format("  Player: %s | Rank: %s (%d LP) | Phase: %d", 
            active_game.player.name, active_game.player.rank, active_game.player.lp, active_game.phase))
    end

    function love.update(dt)
        -- Update game ticks, timer countdowns, and notifications if needed
    end

    function love.draw()
        if active_game and active_game.renderLove2D then
            local w, h = love.graphics.getDimensions()
            active_game:renderLove2D(w, h)
        end
    end

    function love.keypressed(key)
        if not active_game then return end
        if key == "1" then
            active_game:switchTab("CAREER")
        elseif key == "2" then
            active_game:switchTab("STAGE")
        elseif key == "3" then
            active_game:switchTab("DYNASTY")
        elseif key == "4" then
            active_game:switchTab("TOUR")
        elseif key == "5" then
            active_game:switchTab("LOGS")
        elseif key == "space" then
            -- Primary action for current view
            if active_game.active_tab == "CAREER" then
                active_game:onAction("SOLO_QUEUE")
            elseif active_game.active_tab == "STAGE" then
                active_game:onAction("PLAY_STAGE_MATCH")
            elseif active_game.active_tab == "DYNASTY" then
                active_game:onAction("UPGRADE_MERCH_TECH", { tech_id = "fabric_tech" })
            elseif active_game.active_tab == "TOUR" then
                active_game:onAction("BATTLE_WORLD_TOUR")
            elseif active_game.active_tab == "LOGS" then
                active_game:onAction("SEND_DANMAKU", { text = "全华班加油！", sender = "Fan_VIP" })
            end
        elseif key == "s" then
            local save = active_game:saveGame()
            print("💾 Game saved successfully!")
        elseif key == "escape" then
            love.event.quit()
        end
    end

    function love.mousepressed(x, y, button)
        if not active_game then return end
        if active_game.handleTouch then
            active_game:handleTouch(x, y)
        end
    end

    function love.touchpressed(id, x, y)
        love.mousepressed(x, y, 1)
    end
end

-- ============================================================================
-- CLI STANDALONE EXECUTION
-- ============================================================================
if arg and arg[0] and not love then
    active_game = TapTapGame.new()
    print("====================================================================")
    print("       ESPORTS LEGACY: ROAD TO WORLDS (TAPTAP MAKE LUA ENGINE)      ")
    print("====================================================================")
    print(string.format("Version: %s | Target: TapTap Make Mobile Portrait", active_game.version))
    print(string.format("Player: %s | Rank: %s (%d LP) | Savings: $%d", 
        active_game.player.name, active_game.player.rank, active_game.player.lp, active_game.player.money))
    print("Executing quick boot test...")
    active_game:onAction("SOLO_QUEUE")
    active_game:onAction("STUDY_VOD")
    active_game:onAction("STREAM")
    print("Boot check completed. Engine is ready for TapTap Make!")
end

return TapTapGame
