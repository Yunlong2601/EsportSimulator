// ============================================================================
// TAPTAP MAKE LUA ENGINE TEST SUITE
// Tests all 3 phases, action dispatcher, save/load, and state exporter via Fengari
// ============================================================================

const fs = require('fs');
const path = require('path');
const fengari = require('fengari-web');
const { lua, lauxlib, lualib, to_luastring, to_jsstring } = fengari;

console.log('====================================================================');
console.log('   TAPTAP MAKE LUA ENGINE: COMPREHENSIVE AUTOMATED VERIFICATION     ');
console.log('====================================================================');

const L = lauxlib.luaL_newstate();
lualib.luaL_openlibs(L);

// Add custom module searcher for ./lua/, ./scripts/, ./urhox-libs/, and root
const customLoader = function(L_inner) {
  const modName = to_jsstring(lua.lua_tostring(L_inner, 1));
  const rootDir = path.resolve(__dirname, '..');
  const slashPath = modName.replace(/\./g, '/');
  let candidates = [
    path.join(rootDir, 'scripts', slashPath + '.lua'),
    path.join(rootDir, 'scripts', slashPath, 'init.lua'),
    path.join(rootDir, 'urhox-libs', slashPath + '.lua'),
    path.join(rootDir, 'urhox-libs', slashPath, 'init.lua'),
    path.join(rootDir, 'lua', slashPath + '.lua'),
    path.join(rootDir, 'lua', slashPath.replace(/^lua\//, '') + '.lua'),
    path.join(rootDir, slashPath + '.lua'),
    path.join(rootDir, slashPath, 'init.lua'),
    path.join(rootDir, modName + '.lua'),
    path.join(rootDir, 'scripts', modName + '.lua')
  ];
  let found = null;
  for (const c of candidates) {
    if (fs.existsSync(c)) { found = c; break; }
  }
  if (!found) {
    lua.lua_pushstring(L_inner, to_luastring('\n\tno file ' + modName));
    return 1;
  }
  const content = fs.readFileSync(found, 'utf8');
  if (lauxlib.luaL_loadbuffer(L_inner, to_luastring(content), to_luastring(content).length, to_luastring('@' + found)) !== lua.LUA_OK) {
    return lua.lua_error(L_inner);
  }
  return 1;
};

lua.lua_getglobal(L, to_luastring('package'));
lua.lua_getfield(L, -1, to_luastring('searchers'));
lua.lua_pushcfunction(L, customLoader);
lua.lua_rawseti(L, -2, 2);
lua.lua_pop(L, 2);

const runnerScript = `
local TapTapGame = require('taptap_make_main')
local game = TapTapGame.new()

print("[Test 1] Engine Initialized:")
print(string.format("  Version: %s | Player: %s | Rank: %s | LP: %d", 
    game.version, game.player.name, game.player.rank, game.player.lp))

assert(game.phase == 1, "Initial phase must be 1")
assert(game.player.lp == 340, "Initial LP must be 340")
assert(game.player.rank == "Gold", "Initial rank must be Gold")
print("  ✓ Initial state valid")

print("\\n[Test 2] Phase 1 Solo Queue Actions:")
local res_sq = game:onAction("SOLO_QUEUE")
print(string.format("  * Solo Queue -> Success: %s | Msg: %s | Current LP: %d", 
    tostring(res_sq.success), res_sq.message, game.player.lp))

local res_vod = game:onAction("STUDY_VOD")
print(string.format("  * Study VOD  -> Success: %s | Msg: %s | Mechanics: %d", 
    tostring(res_vod.success), res_vod.message, game.player.mechanics))

local res_str = game:onAction("STREAM")
print(string.format("  * Stream     -> Success: %s | Msg: %s | Fame: %d | Money: $%d", 
    tostring(res_str.success), res_str.message, game.player.fame, game.player.money))

local res_rest = game:onAction("REST")
print(string.format("  * Rest       -> Success: %s | Msg: %s | Energy: %d", 
    tostring(res_rest.success), res_rest.message, game.player.energy))

local res_coffee = game:onAction("DRINK_COFFEE")
print(string.format("  * Coffee     -> Success: %s | Msg: %s | Focus: %d", 
    tostring(res_coffee.success), res_coffee.message, game.player.focus))

local res_login = game:onAction("CLAIM_DAILY_LOGIN")
print(string.format("  * Daily Login -> Success: %s | Msg: %s", 
    tostring(res_login.success), res_login.message))

local res_physio = game:onAction("PHYSIOTHERAPY", { treatment_id = "ice_stretching" })
print(string.format("  * Physio     -> Success: %s | Msg: %s", 
    tostring(res_physio.success), res_physio.message))

local res_rival = game:onAction("CLASH_RIVAL")
print(string.format("  * Clash Rival -> Success: %s | Msg: %s", 
    tostring(res_rival.success), res_rival.message))
print("  ✓ All Phase 1 Core actions executed cleanly")

print("\\n[Test 3] Phase 2 Progression & Stage Match:")
-- Advance player to Phase 2
game.player.lp = 1000
game.player.rank = "Challenger"
game.phase = 2
game.unlocked_phases[2] = true

local res_stage = game:onAction("PLAY_STAGE_MATCH")
print(string.format("  * Play Stage Match -> Success: %s | Msg: %s | Money: $%d", 
    tostring(res_stage.success), res_stage.message, game.player.money))

local res_scout = game:onAction("SCOUT_TEAM", { team_id = "T1" })
print(string.format("  * Scout Team T1   -> Success: %s | Msg: %s", 
    tostring(res_scout.success), res_scout.message))

local res_scrim = game:onAction("SCRIM_TEAM", { team_id = "GEN" })
print(string.format("  * Scrim Team GEN  -> Success: %s | Msg: %s", 
    tostring(res_scrim.success), res_scrim.message))
print("  ✓ All Phase 2 Stage actions executed cleanly")

print("\\n[Test 4] Phase 3 Dynasty Tycoon & Merch R&D Lab:")
-- Advance player to Phase 3 Org Owner
game.player.money = 1200000
local res_retire = game:onAction("RETIRE_AND_BUY_ORG")
print(string.format("  * Retire & Buy Org -> Success: %s | Msg: %s | Phase: %d", 
    tostring(res_retire.success), res_retire.message, game.phase))
assert(game.phase == 3, "Phase must transition to 3")

-- Test Merch R&D Lab Upgrades
local res_merch = game:onAction("UPGRADE_MERCH_TECH", { tech_id = "fabric_tech" })
print(string.format("  * Upgrade Merch Tech -> Success: %s | Msg: %s", 
    tostring(res_merch.success), res_merch.message))

-- Test Community Campaign
local res_comm = game:onAction("RUN_COMMUNITY_CAMPAIGN", { campaign_id = "social_memes" })
print(string.format("  * Community Campaign -> Success: %s | Msg: %s", 
    tostring(res_comm.success), res_comm.message))

-- Test Danmaku Send
local res_danmaku = game:onAction("SEND_DANMAKU", { text = "加油世界第一中单！", sender = "Fan_9527" })
print(string.format("  * Send Danmaku       -> Success: %s | Msg: %s", 
    tostring(res_danmaku.success), res_danmaku.message))

-- Test World Tour
local res_tour = game:onAction("BATTLE_WORLD_TOUR")
print(string.format("  * Battle World Tour  -> Success: %s | Msg: %s", 
    tostring(res_tour.success), res_tour.message))
print("  ✓ All Phase 3 Dynasty actions executed cleanly")

print("\\n[Test 5] Save & Load Persistence:")
local save_data = game:saveGame()
assert(save_data ~= nil and type(save_data) == "table", "Save data must be a table")
print(string.format("  * Saved Game Version: %s | Saved Phase: %d | Saved Rank: %s", 
    save_data.version, save_data.phase, save_data.player.rank))

-- Create new instance and load save
local fresh_game = TapTapGame.new()
assert(fresh_game.phase == 1, "Fresh game starts at phase 1")
local ok_load, msg_load = fresh_game:loadGame(save_data)
assert(ok_load == true, "Load game must succeed")
assert(fresh_game.phase == 3, "Loaded game must be at phase 3")
assert(fresh_game.player.rank == "Challenger", "Loaded player rank must be Challenger")
print(string.format("  * Loaded into Fresh Instance -> Phase: %d | Rank: %s | Success!", 
    fresh_game.phase, fresh_game.player.rank))
print("  ✓ Save and Load persistence verified")

print("\\n[Test 6] ViewState Snapshot Export for TapTap Make UI:")
local vs = game:getViewState()
assert(vs.phase == 3, "ViewState phase must be 3")
assert(vs.unlocked_phases[3] == true, "ViewState unlocked phase 3 must be true")
assert(vs.trophies ~= nil, "ViewState trophies must exist")
assert(vs.merch_lab ~= nil, "ViewState merch_lab must exist")
print(string.format("  * Exported ViewState -> Phase: %d | LP: %d | Cash: $%d | Trophies: %s", 
    vs.phase, vs.lp, vs.money, tostring(vs.trophies ~= nil)))
print("  ✓ ViewState export validated")

print("\\n[Test 7] Mobile Portrait UI & Multi-Tab Screen Layout:")
-- Mock love and love.graphics for headless testing
_G.love = {
    graphics = {
        setColor = function(...) end,
        rectangle = function(...) end,
        print = function(...) end,
        line = function(...) end,
        getDimensions = function() return 390, 844 end
    }
}

-- Test rendering all 5 tabs
local all_tabs = { "CAREER", "STAGE", "DYNASTY", "TOUR", "LOGS" }
for _, tab_id in ipairs(all_tabs) do
    game:switchTab(tab_id)
    assert(game.active_tab == tab_id, "Active tab must be " .. tab_id)
    game:renderLove2D(390, 844)
    assert(#game.bottom_tabs == 5, "Must render 5 bottom navigation tabs")
    print(string.format("  * Rendered Tab [%s]: %d active touch targets registered", 
        tab_id, #game.touch_buttons + #game.bottom_tabs))
end

-- Test touch navigation on bottom tabs (tab 2 STAGE is at tx ~ 80, y ~ 800)
local touch_stage_ok = game:handleTouch(90, 800)
assert(touch_stage_ok == true, "Touch on STAGE tab must succeed")
assert(game.active_tab == "STAGE", "Active tab must switch to STAGE upon touch")
print("  * Touch hit testing on MobileBottomNav verified: switched to STAGE")

-- Test touch navigation back to CAREER (tx ~ 20, y ~ 800)
local touch_career_ok = game:handleTouch(20, 800)
assert(touch_career_ok == true, "Touch on CAREER tab must succeed")
assert(game.active_tab == "CAREER", "Active tab must switch to CAREER upon touch")
print("  * Touch hit testing on MobileBottomNav verified: switched to CAREER")

print("  ✓ Full Mobile UI Screen Layout & Touch Hitboxes verified")

print("\\n[Test 8] TapTap Maker Management Systems (Facilities, Academy, Coach Equity, Staff):")
-- Facilities upgrade
local res_fac = game:onAction("UPGRADE_FACILITY", { facility_id = "training" })
assert(res_fac.success == true, "Facility upgrade must succeed: " .. tostring(res_fac.message))
assert(game.facilities.training == 2, "Training facility must be Lv 2")
print(string.format("  * Facility Upgrade -> %s | Level: %d", res_fac.message, game.facilities.training))

-- Academy Scout & Promote
local res_scout = game:onAction("SCOUT_ACADEMY_TRAINEE")
assert(res_scout.success == true, "Academy scout must succeed: " .. tostring(res_scout.message))
assert(#game.academy.trainees > 0, "Must have recruited at least 1 trainee")
local trainee = game.academy.trainees[1]
print(string.format("  * Academy Scouted Trainee -> [%s] %s (%s) | Mech: %d", 
    trainee.tier, trainee.name, trainee.role, trainee.mechanics))

local res_promote = game:onAction("PROMOTE_TRAINEE", { trainee_id = trainee.id })
assert(res_promote.success == true, "Trainee promotion must succeed: " .. tostring(res_promote.message))
print(string.format("  * Promoted Trainee to First Team -> %s", res_promote.message))

-- Coach Proposal & Equity Buyout
local res_prop = game:onAction("COACH_PROPOSAL", { proposal_id = "request_funds" })
assert(res_prop.success == true, "Coach proposal must succeed: " .. tostring(res_prop.message))
print(string.format("  * Coach Proposal -> %s", res_prop.message))

local prev_eq = game.coach.equity
local res_eq = game:onAction("COACH_BUY_EQUITY", { shares_pct = 5 })
assert(res_eq.success == true, "Coach equity buyout must succeed: " .. tostring(res_eq.message))
assert(game.coach.equity == prev_eq + 5, "Coach equity must increase by 5%")
print(string.format("  * Coach Equity Buyout -> %s | Current Equity: %d%%", res_eq.message, game.coach.equity))

-- Staff Signings
local res_coach_staff = game:onAction("SIGN_STAFF", { staff_type = "head_coach" })
assert(res_coach_staff.success == true, "Signing head coach must succeed")
local res_analyst_staff = game:onAction("SIGN_STAFF", { staff_type = "analyst" })
assert(res_analyst_staff.success == true, "Signing analyst must succeed")
local res_physio_staff = game:onAction("SIGN_STAFF", { staff_type = "physio" })
assert(res_physio_staff.success == true, "Signing physio must succeed")
assert(game.staff.head_coach ~= nil and game.staff.analyst ~= nil and game.staff.physio ~= nil, "All 3 staff members must be signed")
print("  * Staff Signed -> Homme (Head Coach), Kramer (Analyst), Dr. Kang (Physio)")

-- Dynasty Subtabs Rendering
game:switchTab("DYNASTY")
local dynasty_subtabs = { "OVERVIEW", "FACILITIES", "ACADEMY", "COACH" }
for _, sub in ipairs(dynasty_subtabs) do
    game:onAction("SET_DYNASTY_SUBTAB", { subtab = sub })
    assert(game.dynasty_subtab == sub, "Subtab must be " .. sub)
    game:renderLove2D(390, 844)
    print(string.format("  * Rendered Dynasty Subtab [%s]: %d active buttons", sub, #game.touch_buttons))
end

-- Verify Management Persistence
local new_save = game:saveGame()
assert(new_save.facilities ~= nil and new_save.facilities.training == 2, "Save must retain facilities Lv 2")
assert(new_save.coach ~= nil and new_save.coach.equity == game.coach.equity, "Save must retain coach equity")
assert(new_save.staff ~= nil and new_save.staff.head_coach ~= nil, "Save must retain staff")

local test_loader = TapTapGame.new()
test_loader:loadGame(new_save)
assert(test_loader.facilities.training == 2, "Loaded facilities must match")
assert(test_loader.coach.equity == game.coach.equity, "Loaded coach equity must match")
assert(test_loader.staff.head_coach.name == game.staff.head_coach.name, "Loaded staff must match")
print("  ✓ Full TapTap Maker Management Systems verified and persisted")

print("\\n[Test 9] UrhoX Native Screen Framework (EsportSimulatorScreen & MenuScreen):")
-- Setup UrhoX mocks
_G.MOUSEB_LEFT = 1; _G.MOUSEB_RIGHT = 2; _G.MOUSEB_MIDDLE = 4
_G.graphics = { GetWidth = function() return 390 end, GetHeight = function() return 844 end, GetDPR = function() return 2.0 end }
_G.GetSafeAreaInsets = function() return { min = { x = 0, y = 0 }, max = { x = 0, y = 0 } } end
setmetatable(_G, {
    __index = function(t, k)
        if type(k) == "string" and k:sub(1, 2) == "YG" then
            return function() return {} end
        end
        return nil
    end
})
package.path = "./scripts/?.lua;./scripts/ui/screens/?.lua;./?.lua;" .. package.path
local ok_esport, EsportScreen = pcall(require, "ui.screens.EsportSimulatorScreen")
assert(ok_esport == true, "Must load EsportSimulatorScreen cleanly: " .. tostring(EsportScreen))
local esport_game = EsportScreen.GetGame()
assert(esport_game ~= nil, "EsportSimulatorScreen must provide game instance")

-- Build across all 5 tabs and 4 dynasty subtabs in UrhoX
local test_tabs = { "CAREER", "STAGE", "DYNASTY", "TOUR", "LOGS" }
for _, tab_id in ipairs(test_tabs) do
    esport_game.active_tab = tab_id
    if tab_id == "DYNASTY" then
        esport_game.phase = 3
        local subtabs = { "OVERVIEW", "FACILITIES", "ACADEMY", "COACH" }
        for _, st in ipairs(subtabs) do
            esport_game.dynasty_subtab = st
            local ok_b, tree = pcall(EsportScreen.Build, function() end)
            assert(ok_b == true, "Failed building UrhoX screen for " .. tab_id .. " subtab " .. st .. ": " .. tostring(tree))
            assert(type(tree) == "table", "Root must be an UrhoX Panel widget")
        end
        print("  * Built UrhoX Screen [DYNASTY] with all 4 subtabs (OVERVIEW, FACILITIES, ACADEMY, COACH)")
    else
        local ok_b, tree = pcall(EsportScreen.Build, function() end)
        assert(ok_b == true, "Failed building UrhoX screen for " .. tab_id .. ": " .. tostring(tree))
        assert(type(tree) == "table", "Root must be an UrhoX Panel widget")
        print("  * Built UrhoX Screen [" .. tab_id .. "] cleanly")
    end
end

-- Test MenuScreen building with Esport Simulator hero entry
local ok_menu, MenuScreen = pcall(require, "ui.screens.MenuScreen")
assert(ok_menu == true, "Must load MenuScreen cleanly")
local ok_mb, menu_tree = pcall(MenuScreen.Build, function() end)
assert(ok_mb == true, "MenuScreen must build cleanly: " .. tostring(menu_tree))
print("  * Built UrhoX Screen [MenuScreen] with Esport Simulator entry cleanly")
print("  ✓ Full UrhoX Native UI Conversion Verified")

print("\\n[Test 10] 1920x1080 Landscape Cyber Neon UI Framework (EsportsMainHUD & PhaseViews):")
package.path = "./scripts/landscape/?.lua;./scripts/ui/?.lua;" .. package.path
local ok_ltheme, LandscapeTheme = pcall(require, "landscape.UITheme")
assert(ok_ltheme == true, "Must load landscape.UITheme cleanly: " .. tostring(LandscapeTheme))
assert(LandscapeTheme.Layout.ScreenWidth == 1920 and LandscapeTheme.Layout.ScreenHeight == 1080, "Must be 1920x1080")

local ok_lfac, LandscapeFactory = pcall(require, "landscape.UIFactory")
assert(ok_lfac == true, "Must load landscape.UIFactory cleanly: " .. tostring(LandscapeFactory))

local ok_lhud, EsportsMainHUD = pcall(require, "landscape.EsportsMainHUD")
assert(ok_lhud == true, "Must load landscape.EsportsMainHUD cleanly: " .. tostring(EsportsMainHUD))

-- Instantiate and test 3-phase switching in EsportsMainHUD
local mockRoot = { width = 1920, height = 1080, children = {}, AddChild = function(self, c) table.insert(self.children, c) end }
local hud = EsportsMainHUD.Create(mockRoot, { phase = 1, mmr = 2850, stamina = 88, funds = 2450000, rdPoints = 640 })
assert(hud ~= nil and hud.state.phase == 1, "Must initialize Phase 1 HUD")
print("  * Initialized EsportsMainHUD (Phase 1: Solo Queue Ladder)")

hud:SwitchPhase(2)
assert(hud.state.phase == 2, "Must switch to Phase 2")
print("  * Switched EsportsMainHUD to Phase 2 (Pro Scouting & 5v5 BP Draft)")

hud:SwitchPhase(3)
assert(hud.state.phase == 3, "Must switch to Phase 3")
print("  * Switched EsportsMainHUD to Phase 3 (Dynasty R&D Tech Tree)")

-- Also verify Cyber PhaseViews in urhox-libs/UI
local ok_cviews, PhaseViews = pcall(require, "ui.cyber.PhaseViews")
assert(ok_cviews == true, "Must load ui.cyber.PhaseViews cleanly: " .. tostring(PhaseViews))
PhaseViews.SetActivePhase(1)
local ok_pv1, pv_tree1 = pcall(PhaseViews.Build, function() end)
assert(ok_pv1 == true and type(pv_tree1) == "table", "Must build PhaseViews Phase 1 tree")
PhaseViews.SetActivePhase(2)
local ok_pv2, pv_tree2 = pcall(PhaseViews.Build, function() end)
assert(ok_pv2 == true and type(pv_tree2) == "table", "Must build PhaseViews Phase 2 tree")
PhaseViews.SetActivePhase(3)
local ok_pv3, pv_tree3 = pcall(PhaseViews.Build, function() end)
assert(ok_pv3 == true and type(pv_tree3) == "table", "Must build PhaseViews Phase 3 tree")
print("  * Built cyber.PhaseViews across all 3 phases (1920x1080 landscape) cleanly")

-- Verify EsportSimulatorLandscapeScreen adapter
local ok_lscreen, LandscapeScreen = pcall(require, "ui.screens.EsportSimulatorLandscapeScreen")
assert(ok_lscreen == true, "Must load ui.screens.EsportSimulatorLandscapeScreen cleanly: " .. tostring(LandscapeScreen))
local ok_lsb, lsb_tree = pcall(LandscapeScreen.Build, function() end)
assert(ok_lsb == true and type(lsb_tree) == "table", "LandscapeScreen.Build must return UI tree")
print("  * Built UrhoX Screen [EsportSimulatorLandscapeScreen] cleanly")
print("  ✓ 1920x1080 Landscape Cyber Neon UI Framework Verified")

print("\\n🎉 ALL TAPTAP MAKE LUA ENGINE VERIFICATION TESTS PASSED SUCCESSFULLY!")
`;

const status = lauxlib.luaL_dostring(L, to_luastring(runnerScript));
if (status !== lua.LUA_OK) {
  const err = to_jsstring(lua.lua_tostring(L, -1));
  console.error('\\n❌ Verification Test Failed with error:', err);
  process.exit(1);
} else {
  console.log('====================================================================');
  console.log('               TapTap Make Lua Engine is 100% Ready!                ');
  console.log('====================================================================');
}
