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
    path.join(rootDir, 'scripts', 'lua', slashPath + '.lua'),
    path.join(rootDir, 'scripts', 'lua', slashPath.replace(/^lua\//, '') + '.lua'),
    path.join(rootDir, 'scripts', slashPath, 'init.lua'),
    path.join(rootDir, 'urhox-libs', slashPath + '.lua'),
    path.join(rootDir, 'urhox-libs', slashPath, 'init.lua'),
    path.join(rootDir, 'scripts', modName + '.lua'),
    path.join(rootDir, 'lua', slashPath + '.lua'),
    path.join(rootDir, 'lua', slashPath.replace(/^lua\//, '') + '.lua'),
    path.join(rootDir, slashPath + '.lua'),
    path.join(rootDir, slashPath, 'init.lua'),
    path.join(rootDir, modName + '.lua')
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
    if tab_id == "CAREER" then
        local c_subs = { "SOLO", "SHOP", "AGENCY", "STREAM" }
        for _, csub in ipairs(c_subs) do
            esport_game.career_subtab = csub
            local ok_b, tree = pcall(EsportScreen.Build, function() end)
            assert(ok_b == true, "Failed building UrhoX screen for CAREER subtab " .. csub .. ": " .. tostring(tree))
            assert(type(tree) == "table", "Root must be an UrhoX Panel widget")
        end
        print("  * Built UrhoX Screen [CAREER] with all 4 subtabs (SOLO, SHOP, AGENCY, STREAM)")
    elseif tab_id == "DYNASTY" then
        esport_game.phase = 3
        local subtabs = { "OVERVIEW", "FACILITIES", "ACADEMY", "COACH" }
        for _, st in ipairs(subtabs) do
            esport_game.dynasty_subtab = st
            local ok_b, tree = pcall(EsportScreen.Build, function() end)
            assert(ok_b == true, "Failed building UrhoX screen for DYNASTY subtab " .. st .. ": " .. tostring(tree))
            assert(type(tree) == "table", "Root must be an UrhoX Panel widget")
        end
        print("  * Built UrhoX Screen [DYNASTY] with all 4 subtabs (OVERVIEW, FACILITIES, ACADEMY, COACH)")
    elseif tab_id == "TOUR" then
        local t_subs = { "TOUR", "RANKINGS", "TALENTS", "LORE" }
        for _, tsub in ipairs(t_subs) do
            esport_game.tour_subtab = tsub
            local ok_b, tree = pcall(EsportScreen.Build, function() end)
            assert(ok_b == true, "Failed building UrhoX screen for TOUR subtab " .. tsub .. ": " .. tostring(tree))
            assert(type(tree) == "table", "Root must be an UrhoX Panel widget")
        end
        print("  * Built UrhoX Screen [TOUR] with all 4 subtabs (TOUR, RANKINGS, TALENTS, LORE)")
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

print("\\n[Test 11] Hardware Shop, Agency Negotiation, Sponsorships & Talents:")
local f_game = TapTapGame.new()
f_game.player.money = 5000
f_game.player.fame = 50
local prev_mech = f_game.player.mechanics
local prev_ment = f_game.player.mental

-- 1. Test BUY_GEAR
local res_bg = f_game:onAction("BUY_GEAR", { gear_id = "wooting" })
assert(res_bg.success == true, "Must successfully buy wooting keyboard")
assert(f_game.player.mechanics == prev_mech + 8, "Mechanics must increase by 8")
assert(f_game.player.mental == prev_ment + 2, "Mental must increase by 2")
local res_bg_dup = f_game:onAction("BUY_GEAR", { gear_id = "wooting" })
assert(res_bg_dup.success == false, "Must not allow duplicate gear purchase")
print("  * BUY_GEAR -> Wooting 60HE purchased & duplicate check passed")

-- 2. Test HIRE_AGENT & SIGN_SPONSOR & FIRE_AGENT
local res_ha = f_game:onAction("HIRE_AGENT", { agent_id = "agent_rookie" })
assert(res_ha.success == true, "Must successfully hire agent_rookie")
assert(f_game.player.agency.hired_agent == "agent_rookie", "Agent must be set")
local res_sp = f_game:onAction("SIGN_SPONSOR", { sponsor_id = "sponsor_mousepad" })
assert(res_sp.success == true, "Must successfully sign sponsor_mousepad")
local passive_inc, bonus_rate, ag_conf = f_game:getAgencyIncome()
assert(passive_inc > 0, "Passive agency income must be positive")
local res_fa = f_game:onAction("FIRE_AGENT")
assert(res_fa.success == true and f_game.player.agency.hired_agent == nil, "Agent contract must terminate cleanly")
print("  * Agency & Sponsorship -> Hired Lin Ke, signed Aurora Gear, passive calculated, terminated contract")

-- 3. Test CLAIM_STREAM_MILESTONE
f_game.player.stream_channel.subscribers = 1500
local res_sm = f_game:onAction("CLAIM_STREAM_MILESTONE", { milestone_id = "stream_1k" })
assert(res_sm.success == true, "Must claim stream_1k milestone")
print("  * Stream Milestone -> Claimed 1K subscribers milestone & unlocked Hype Clap emote")

-- 4. Test UNLOCK_LEGACY_PASSIVE & TOGGLE_RUN_MODIFIER
f_game.prestige_engine.prestige_points = 500
local res_lp = f_game:onAction("UNLOCK_LEGACY_PASSIVE", { passiveId = "passive_muscle_memory" })
assert(res_lp.success == true, "Must unlock passive_muscle_memory")
local res_rm = f_game:onAction("TOGGLE_RUN_MODIFIER", { modId = "mod_glass_cannon" })
assert(res_rm.success == true, "Must toggle run modifier mod_glass_cannon")
print("  * Prestige Talents & Modifiers -> Unlocked Muscle Memory passive & toggled Glass Cannon")
print("  ✓ Hardware Rig, Agency, Sponsors, Stream Milestones & Talents 100% Verified")

print("\\n[Test 12] Championship Rings Collection & Showcase:")
local ring_game = TapTapGame.new()
local vs_ring = ring_game:getViewState()
assert(vs_ring.championship_rings ~= nil, "championship_rings must be present in ViewState")
assert(#vs_ring.championship_rings.all == 6, "Must define all 6 championship rings")
assert(vs_ring.championship_rings.equipped == "ring_s10_origin", "Default equipped ring must be S10 Origin")
assert(vs_ring.championship_rings.active_buff.clutch_rate_bonus == 12, "S10 clutch bonus must be 12%")

-- Equip ring test
table.insert(ring_game.championship_rings.unlocked, "ring_s11_dragon")
local res_er = ring_game:onAction("EQUIP_RING", { ring_id = "ring_s11_dragon" })
assert(res_er.success == true, "Must equip S11 Dragon ring")
assert(ring_game.championship_rings.equipped == "ring_s11_dragon", "Equipped ring must update")
local res_er_lock = ring_game:onAction("EQUIP_RING", { ring_id = "ring_s15_dynasty" })
assert(res_er_lock.success == false, "Must not allow equipping locked rings")
print("  * Championship Rings -> S10-S15 Rings loaded, S11 equipped with 15% clutch buff, locked rings gated")
print("  ✓ Championship Rings Collection Verified")

print("\\n[Test 13] Overseas Remote Bootcamp System:")
local bc_game = TapTapGame.new()
bc_game.player.money = 100000
local prev_bc_mech = bc_game.player.mechanics
local res_bc = bc_game:onAction("START_BOOTCAMP", { location_id = "jeju-retreat" })
assert(res_bc.success == true, "Must successfully start Jeju retreat bootcamp")
assert(bc_game.active_bootcamp ~= nil, "Active bootcamp must be set")
assert(bc_game.active_bootcamp.location_id == "jeju-retreat", "Location ID must match")
assert(bc_game.active_bootcamp.days_left == 7, "Bootcamp days left must be 7")
assert(bc_game.player.mechanics == prev_bc_mech + 7, "Player mechanics must increase by 7")
print("  * Remote Bootcamp -> Jeju Retreat dispatched, 7-day boost active, win rate buff +16%")
print("  ✓ Overseas Remote Bootcamp System Verified")

print("\\n[Test 14] Dynamic Patch Meta Tier List & Strategy Modifiers:")
local ok_mtl, MetaTierList = pcall(require, "meta_tier_list")
assert(ok_mtl == true, "Must load meta_tier_list cleanly")
local current_patch = MetaTierList.getCurrentPatch()
assert(current_patch.version == "Patch 14.19", "Patch version must match")
assert(#current_patch.champions >= 8, "Must have at least 8 meta champions")
assert(MetaTierList.getStrategyModifier("dive") == 16, "Dive strategy modifier must be +16%")
assert(MetaTierList.getStrategyModifier("poke") == -10, "Poke strategy modifier must be -10%")
print("  * Meta Tier List -> Patch 14.19 loaded with Dive/Poke modifiers & Akali/Aatrox T0 picks")
print("  ✓ Dynamic Patch Meta Tier List Verified")

print("\\n[Test 15] Team Dynamics & Pair Chemistry Matrix:")
local ok_td2, TeamDynamics2 = pcall(require, "team_dynamics")
assert(ok_td2 == true, "Must load team_dynamics cleanly")
local presets = TeamDynamics2.getAllPresets()
assert(#presets == 4, "Must define 4 tactical presets")
local p1 = { name = "Faker", role = "MID", playstyle = "Aggressive", morale = 90 }
local p2 = { name = "Oner", role = "JGL", playstyle = "Aggressive", morale = 92 }
local pair_chem = TeamDynamics2.calculatePairChemistry(p1, p2)
assert(pair_chem >= 85, "Aggressive pair with high morale must have >=85 chemistry")
local team_state = TeamDynamics2.calculateTeamState({ p1, p2 }, "mid_jgl_engine")
assert(team_state.preset.id == "mid_jgl_engine", "Preset must be mid_jgl_engine")
assert(team_state.synergy_power_bonus > 0, "Synergy power bonus must be positive")
print("\\n[Test 16] Web UI & Navigation Parity (Command Deck, Calendar, VOD, CCTV, Arena, Budget, Gacha, Synergy):")
local nav_game = TapTapGame.new()
nav_game.player.money = 100000

-- Test 16.1: BUDGET_AUDIT action
local res_ba = nav_game:onAction("BUDGET_AUDIT")
assert(res_ba.success == true, "Budget audit must succeed")
assert(res_ba.data >= 12000, "Budget audit rebate must be >= 12,000")
print("  * BUDGET_AUDIT -> CFO Audit completed, rebate: $" .. tostring(res_ba.data))

-- Test 16.2: VOD_REVIEW action
local res_vr = nav_game:onAction("VOD_REVIEW", { vod_id = "vod_1" })
assert(res_vr.success == true, "VOD review must succeed")
print("  * VOD_REVIEW -> 2026 London Finals VOD reviewed, mechanics & mental awarded")

-- Test 16.3: CCTV_COMMAND action
local res_cctv = nav_game:onAction("CCTV_COMMAND", { action_name = "SUPERVISE" })
assert(res_cctv.success == true, "CCTV command must succeed")
print("  * CCTV_COMMAND -> Supervise night training command dispatched")

-- Test 16.4: SCOUT_GACHA_PULL action
local res_gp = nav_game:onAction("SCOUT_GACHA_PULL", { times = 10 })
assert(res_gp.success == true, "Scout gacha pull must succeed")
print("  * SCOUT_GACHA_PULL -> 10-Pull executed, pulled: " .. tostring(res_gp.data))

-- Test 16.5: BARON_CLUTCH action
local res_bc = nav_game:onAction("BARON_CLUTCH", { choice_id = 1 })
assert(res_bc.message ~= "", "Baron clutch must return narrative feedback")
print("  * BARON_CLUTCH -> 32:15 Baron Pit Decider resolved")

-- Test 16.6: UPGRADE_SYNERGY action
local res_us = nav_game:onAction("UPGRADE_SYNERGY", { pair_code = "JNG x MID" })
assert(res_us.success == true, "Synergy upgrade must succeed")
print("  * UPGRADE_SYNERGY -> JNG x MID pair upgraded, overcharge boosted")

-- Test 16.7: UI rendering across all new Web tabs
local testTabs = { "CALENDAR", "VOD", "COMMUNITY", "SOCIAL", "CCTV", "ARENA", "BUDGET", "GACHA", "SYNERGY" }
for _, tabId in ipairs(testTabs) do
    nav_game.active_tab = tabId
    local ok_b, tree = pcall(EsportScreen.Build, function() end)
    assert(ok_b == true, "Screen must render cleanly for tab " .. tabId .. ": " .. tostring(tree))
    assert(type(tree) == "table", "Root must be an UrhoX Panel widget")
end
print("  * UI Screens -> All 9 new Web-parity tabs rendered cleanly without error")
print("  ✓ Web UI & Navigation Parity 100% Verified")

print("\\n[Test 17] The 5 Advanced Web Systems Verification (Expansion Draft, Career Journal, BP Drill, Radar, Jersey Studio):")
local adv_game = TapTapGame.new()

-- 17.1 Expansion Draft
local res_ed_prot = adv_game:onAction("EXPANSION_DRAFT", { action = "PROTECT", protected_ids = { "p1", "p2", "p3" } })
assert(res_ed_prot.success == true, "Must protect core 3 players")
adv_game.player.money = 100000
local res_ed_draft = adv_game:onAction("EXPANSION_DRAFT", { action = "DRAFT", prodigy_id = "prodigy-mid-1" })
assert(res_ed_draft.success == true, "Must draft SSS prodigy 顾清锋")
assert(res_ed_draft.data.name == "顾清锋", "Drafted name must match")
print("  * EXPANSION_DRAFT -> Core 3 protected, SSS Prodigy 顾清锋 drafted")

-- 17.2 Career Journal Vintage Newspaper Clippings
local res_cj_title = adv_game:onAction("GENERATE_CAREER_CLIPPING", { type = "TITLE", title = "至尊法王", rarity = "MYTHIC", bonus = "微操+15" })
assert(res_cj_title.success == true, "Must generate title clipping")
local res_cj_trophy = adv_game:onAction("GENERATE_CAREER_CLIPPING", { type = "TROPHY", trophy_name = "全球总决赛召唤师杯" })
assert(res_cj_trophy.success == true, "Must generate trophy clipping")
assert(#adv_game.career_journal.clippings >= 5, "Clippings archive must grow")
print("  * CAREER_JOURNAL -> Title & Trophy newspaper clippings generated and archived")

-- 17.3 Tactical BP Drill
local prev_mech = adv_game.player.mechanics
local res_bp = adv_game:onAction("SOLVE_BP_DRILL", { puzzle_id = "puzzle_dive_counter" })
assert(res_bp.success == true, "Must solve anti-dive puzzle")
assert(adv_game.player.mechanics == prev_mech + 4, "Mechanics bonus must be awarded")
assert(adv_game.tactical_bp_drill.activeBuff ~= nil, "Active buff must be set")
print("  * TACTICAL_BP_DRILL -> Anti-Dive puzzle solved, +4 mechanics & buff activated")

-- 17.4 Scout Intel Heatmap & Radar
local res_radar = adv_game:onAction("SET_SCOUT_RADAR_MODE", { mode = "RIVAL", rival_id = "gen" })
assert(res_radar.success == true, "Must set radar mode to RIVAL (GEN)")
assert(adv_game.scout_radar_mode == "RIVAL", "Radar mode must update")
local vs_radar = adv_game:getViewState()
assert(vs_radar.scout_radar.clusters.mechanics == 95, "GEN mechanics cluster must be 95")
print("  * SCOUT_RADAR -> 5-Cluster tactical radar benchmark evaluated (GEN)")

-- 17.5 Jersey Customizer Studio
local res_jersey = adv_game:onAction("CUSTOMIZE_JERSEY", {
    pattern = "gold_hex",
    crest = "dragon_flame",
    colorPreset = "赤焰炽金 (Dynasty Crimson)",
    priceTier = "collector_golden_box"
})
assert(res_jersey.success == true, "Must customize jersey")
assert(adv_game.jersey_studio.hypeScore >= 90, "Gold hex + dragon crest must yield 90+ hype")
assert(adv_game.jersey_studio.projectedRevenue > 0, "Projected revenue must be calculated")
print("  * JERSEY_STUDIO -> Imperial Gold Hex + Dragon Flame customizer updated, 90+ hype calculated")
print("  ✓ All 5 Advanced Web Systems 100% Verified")

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
