// ============================================================================
// Headless Node / Fengari Verification Test for StockScreen Phase 2 UI
// ============================================================================

const fs = require('fs');
const path = require('path');
const fengari = require('fengari-web');
const { lua, lauxlib, lualib, to_luastring, to_jsstring } = fengari;

console.log('====================================================================');
console.log('   STOCKSCREEN PHASE 2 UI INTEGRATION VERIFICATION TEST             ');
console.log('====================================================================');

const L = lauxlib.luaL_newstate();
lualib.luaL_openlibs(L);

const customLoader = function(L_inner) {
  const modName = to_jsstring(lua.lua_tostring(L_inner, 1));
  const rootDir = path.resolve('.');
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
  let content = fs.readFileSync(found, 'utf8');

  // Shim 32-bit hash in PlayerEcoSystem for Fengari VM
  if (found.endsWith('PlayerEcoSystem.lua')) {
    const targetHash = 'local function hashStr(s)\n    s = tostring(s)\n    local h = 2166136261\n    for i = 1, #s do\n        h = (h * 16777619) % 4294967296\n        h = (h ~ string.byte(s, i)) % 4294967296\n    end\n    return h % 2147483647\nend';
    const safeHash = 'local function hashStr(s)\n    s = tostring(s)\n    local h = 0\n    for i = 1, #s do\n        h = (h * 31 + string.byte(s, i)) % 2147483647\n    end\n    return h\nend';
    content = content.replace(targetHash, safeHash);
  }

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

const testRunnerLua = `
-- Mock graphics and UI environment for headless testing
_G.MOUSEB_LEFT = 1
_G.MOUSEB_RIGHT = 2
_G.MOUSEB_MIDDLE = 4
_G.graphics = {
    GetWidth = function() return 390 end,
    GetHeight = function() return 844 end,
    GetDPR = function() return 2.0 end,
    width = 390,
    height = 844,
}
_G.GetSafeAreaInsets = function() return { min = { x = 0, y = 0 }, max = { x = 0, y = 0 } } end
setmetatable(_G, {
    __index = function(t, k)
        if type(k) == "string" and k:sub(1, 2) == "YG" then
            return function() return {} end
        end
        return nil
    end
})

local UI = require("urhox-libs/UI")
local CompanyState = require("CompanyState")
local StockSystem = require("StockSystem")
local StockScreen = require("ui.screens.StockScreen")

local testCount = 0
local passCount = 0

local function assert_true(cond, msg)
    testCount = testCount + 1
    if not cond then
        error("Assertion Failed: " .. tostring(msg))
    end
    passCount = passCount + 1
end

local function assert_eq(actual, expected, msg)
    testCount = testCount + 1
    if actual ~= expected then
        error("Assertion Failed: " .. tostring(msg) .. " (Expected: " .. tostring(expected) .. ", Got: " .. tostring(actual) .. ")")
    end
    passCount = passCount + 1
end

-- Helper to recursively traverse and find widgets in UI tree
local function findWidgets(node, predicate, acc)
    acc = acc or {}
    if not node or type(node) ~= "table" then return acc end
    if predicate(node) then
        table.insert(acc, node)
    end
    local ch = node.children or (node.props and node.props.children)
    if type(ch) == "table" then
        for _, child in ipairs(ch) do
            findWidgets(child, predicate, acc)
        end
    end
    return acc
end

local function findButtonsWithText(root, pattern)
    return findWidgets(root, function(n)
        local txt = n.text or (n.props and n.props.text)
        return txt and string.find(txt, pattern) ~= nil
    end)
end

local function findLabelsWithText(root, pattern)
    return findWidgets(root, function(n)
        local txt = n.text or (n.props and n.props.text)
        return txt and string.find(txt, pattern) ~= nil
    end)
end

print("[Test 1] Unlisted Company Screen Rendering:")
do
    local state = CompanyState.NewGame("TestClub", "normal", "legacy", { cash = 2000 })
    state.shares.public = false
    -- Mock GetState
    CompanyState.GetState = function() return state end

    local navTarget = nil
    local function nav(target) navTarget = target end

    local tree = StockScreen.Build(nav)
    assert_true(type(tree) == "table", "Unlisted screen must return valid UI tree")

    -- Find IPO button or condition alert
    local ipoBtns = findButtonsWithText(tree, "公开上市")
    local ipoAlerts = findLabelsWithText(tree, "上市之路")
    assert_true(#ipoBtns > 0 or #ipoAlerts > 0, "Must render IPO button or IPO condition alert")

    local retBtns = findButtonsWithText(tree, "返回股权页")
    assert_true(#retBtns > 0, "Must render Return to Shares button")
    print("  * Unlisted screen successfully verified (IPO gate & return button present)")
end

print("\\n[Test 2] Listed Company Normal State Rendering (No Short Attack):")
do
    local state = CompanyState.NewGame("TestClub", "normal", "legacy", { cash = 5000 })
    state.shares.public = true
    state.shares.sharePrice = 25.0
    state.shares.prevPrice = 24.0
    state.shares.floatPct = 15
    state.shares.founder = 85
    state.shares.sentiment = 65
    state.shares.credibility = 80
    state.shares.irCooldowns = { briefing = 0, roadshow = 0, blitz = 0 }
    state.shares.rivalShort = nil
    CompanyState.GetState = function() return state end

    local tree = StockScreen.Build(function() end)
    assert_true(type(tree) == "table", "Listed normal screen must return valid UI tree")

    -- 1. Check Quote Tiles
    local priceLabels = findLabelsWithText(tree, "25")
    assert_true(#priceLabels > 0, "Must display current share price (¥25)")

    -- 2. Check Rival Short Attack Threat Card is NOT rendered
    local threatHeaders = findLabelsWithText(tree, "机构做空突袭")
    assert_eq(#threatHeaders, 0, "Must NOT render short attack threat card when rivalShort is nil")

    -- 3. Check IR & PR Section
    local irHeaders = findLabelsWithText(tree, "投资者关系与市值管理")
    assert_true(#irHeaders > 0, "Must render IR & PR section header")

    local sentTiles = findLabelsWithText(tree, "65/100")
    assert_true(#sentTiles > 0, "Must render sentiment indicator tile (65/100)")

    local credTiles = findLabelsWithText(tree, "80/100")
    assert_true(#credTiles > 0, "Must render credibility indicator tile (80/100)")

    local briefingBtns = findButtonsWithText(tree, "媒体通气会")
    assert_true(#briefingBtns > 0, "Must render Press Briefing button")

    local roadshowBtns = findButtonsWithText(tree, "机构路演交流")
    assert_true(#roadshowBtns > 0, "Must render Roadshow button")

    local blitzBtns = findButtonsWithText(tree, "战略级公关战役")
    assert_true(#blitzBtns > 0, "Must render PR Blitz button")

    -- 4. Check Tiered Buyback Section
    local buybackHeaders = findLabelsWithText(tree, "股票回购")
    assert_true(#buybackHeaders > 0, "Must render Stock Buyback section header")

    local buy3Btns = findButtonsWithText(tree, "小额回购 3%%")
    assert_true(#buy3Btns > 0, "Must render 3% buyback tier button")

    local buy5Btns = findButtonsWithText(tree, "标准回购 5%%")
    assert_true(#buy5Btns > 0, "Must render 5% buyback tier button")

    local buy10Btns = findButtonsWithText(tree, "战略回购 10%%")
    assert_true(#buy10Btns > 0, "Must render 10% buyback tier button")

    print("  * Listed normal state verified (Quote tiles, IR section, Sentiment/Credibility, 3 Buyback tiers)")
end

print("\\n[Test 3] Active Rival Short Attack State Rendering (Below Squeeze Hurdle):")
do
    local state = CompanyState.NewGame("TestClub", "normal", "legacy", { cash = 5000 })
    state.shares.public = true
    state.shares.sharePrice = 20.0
    state.shares.prevPrice = 22.0
    state.shares.floatPct = 12
    state.shares.founder = 88
    state.shares.sentiment = 30
    state.shares.credibility = 60
    state.shares.rivalShort = {
        active = true,
        institution = "暗潮对冲基金",
        openPrice = 20.0,
        targetPrice = 14.0,
        shortInterest = 25,
        weeksLeft = 3,
        totalWeeks = 4,
        penaltyVal = 100,
        defenseLevel = 0,
    }
    CompanyState.GetState = function() return state end

    local tree = StockScreen.Build(function() end)
    assert_true(type(tree) == "table", "Short attack screen must return valid UI tree")

    -- 1. Threat header & institution name
    local threatHeaders = findLabelsWithText(tree, "机构做空突袭")
    assert_true(#threatHeaders > 0, "Must render Hostile Short Attack section header")

    local instLabels = findLabelsWithText(tree, "暗潮对冲基金")
    assert_true(#instLabels > 0, "Must display attacking institution name")

    -- 2. Short interest percentage & remaining weeks
    local siLabels = findLabelsWithText(tree, "25%%")
    assert_true(#siLabels > 0, "Must display short interest percentage (25%)")

    local weeksLabels = findLabelsWithText(tree, "3 周")
    assert_true(#weeksLabels > 0, "Must display defense remaining weeks (3 周)")

    -- 3. Squeeze Hurdle price (openPrice * 1.20 = 24.0)
    local hurdleLabels = findLabelsWithText(tree, "24")
    assert_true(#hurdleLabels > 0, "Must display squeeze hurdle trigger line (¥24)")

    -- 4. Below hurdle (20.0 < 24.0): Squeeze button must NOT be rendered, Defense buttons MUST be rendered
    local squeezeBtns = findButtonsWithText(tree, "触发轧空反击")
    assert_eq(#squeezeBtns, 0, "Must NOT render short squeeze trigger button when price is below hurdle")

    local capDefBtns = findButtonsWithText(tree, "资金注入防御")
    assert_true(#capDefBtns > 0, "Must render Capital Defense button (¥150万)")

    local prDefBtns = findButtonsWithText(tree, "澄清公告防御")
    assert_true(#prDefBtns > 0, "Must render Statement Defense button (¥30万)")

    local cbDefBtns = findButtonsWithText(tree, "回购增持防御")
    assert_true(#cbDefBtns > 0, "Must render Counter-Buy Defense button (¥100万)")

    print("  * Active short attack below hurdle verified (Threat banner, KV rows, 3 defense action CTAs)")
end

print("\\n[Test 4] Active Rival Short Attack State Rendering (Above Squeeze Hurdle):")
do
    local state = CompanyState.NewGame("TestClub", "normal", "legacy", { cash = 5000 })
    state.shares.public = true
    state.shares.sharePrice = 25.0 -- 25.0 >= 20.0 * 1.20 = 24.0
    state.shares.prevPrice = 20.0
    state.shares.floatPct = 12
    state.shares.founder = 88
    state.shares.rivalShort = {
        active = true,
        institution = "赤熊量化资本",
        openPrice = 20.0,
        targetPrice = 14.0,
        shortInterest = 30,
        weeksLeft = 2,
        totalWeeks = 4,
        penaltyVal = 120,
        defenseLevel = 1,
    }
    CompanyState.GetState = function() return state end

    local tree = StockScreen.Build(function() end)

    -- Squeeze button MUST be rendered
    local squeezeBtns = findButtonsWithText(tree, "触发轧空反击")
    assert_true(#squeezeBtns > 0, "Must render Short Squeeze CTA button when price >= openPrice * 1.20")

    -- Defense buttons must NOT be rendered
    local capDefBtns = findButtonsWithText(tree, "资金注入防御")
    assert_eq(#capDefBtns, 0, "Defense buttons should not render when squeeze is available")

    print("  * Active short attack above hurdle verified (Prominent Short Squeeze CTA present)")
end

print("\\n[Test 5] Cooldown Display in Buyback and IR Campaign Buttons:")
do
    local state = CompanyState.NewGame("TestClub", "normal", "legacy", { cash = 5000 })
    state.shares.public = true
    state.shares.sharePrice = 20.0
    state.company.week = 5
    state.shares.lastBuybackWeek = 5 -- on cooldown: 5 - 5 = 0 < 2 -> wait = 2 weeks
    state.shares.irCooldowns = { briefing = 1, roadshow = 3, blitz = 5 }
    CompanyState.GetState = function() return state end

    local tree = StockScreen.Build(function() end)

    -- Buyback buttons should display cooldown info
    local cdBuyBtns = findButtonsWithText(tree, "冷却中")
    assert_true(#cdBuyBtns >= 3, "All 3 buyback buttons must display cooldown status")

    -- IR Campaign buttons should display cooldown weeks
    local briefingCdBtns = findButtonsWithText(tree, "媒体通气会 %(冷却中 1周%)")
    assert_true(#briefingCdBtns > 0, "Press briefing button must display '冷却中 1周'")

    local roadshowCdBtns = findButtonsWithText(tree, "机构路演交流 %(冷却中 3周%)")
    assert_true(#roadshowCdBtns > 0, "Roadshow button must display '冷却中 3周'")

    local blitzCdBtns = findButtonsWithText(tree, "战略级公关战役 %(冷却中 5周%)")
    assert_true(#blitzCdBtns > 0, "PR Blitz button must display '冷却中 5周'")

    print("  * Cooldown label formatting verified across Buyback and IR campaigns")
end

print("\\n[Test 6] Interactive Action Click Simulations via Button Callbacks:")
do
    local state = CompanyState.NewGame("TestClub", "normal", "legacy")
    state.company.cash = 5000
    state.shares.public = true
    state.shares.sharePrice = 10.0
    state.shares.floatPct = 15
    state.shares.founder = 85
    state.company.week = 1
    state.shares.lastBuybackWeek = 0
    state.shares.irCooldowns = { briefing = 0, roadshow = 0, blitz = 0 }
    CompanyState.GetState = function() return state end

    local refreshed = false
    local function nav(target)
        if target == "stock" then refreshed = true end
    end

    -- 6.1 Test Buyback 5% button click
    local tree1 = StockScreen.Build(nav)
    local buy5Btns = findButtonsWithText(tree1, "标准回购 5%%")
    assert_true(#buy5Btns > 0, "Buyback 5% button found")
    refreshed = false
    local onClick5 = buy5Btns[1].onClick or (buy5Btns[1].props and buy5Btns[1].props.onClick)
    assert_true(type(onClick5) == "function", "Buyback 5% button has onClick callback")
    onClick5()
    assert_true(refreshed, "Buyback onClick must trigger ctx.nav('stock') refresh")
    assert_eq(state.shares.floatPct, 10, "Float percentage must drop from 15% to 10%")
    assert_eq(state.shares.founder, 90, "Founder equity must rise from 85% to 90%")
    print("  * Buyback 5% onClick callback executed and verified state mutation")

    -- 6.2 Test Press Briefing button click
    refreshed = false
    local tree2 = StockScreen.Build(nav)
    local briefingBtns = findButtonsWithText(tree2, "媒体通气会")
    assert_true(#briefingBtns > 0, "Press briefing button found")
    local prevSent = state.shares.sentiment
    local onClickBriefing = briefingBtns[1].onClick or (briefingBtns[1].props and briefingBtns[1].props.onClick)
    assert_true(type(onClickBriefing) == "function", "Press briefing button has onClick callback")
    onClickBriefing()
    assert_true(refreshed, "Press briefing onClick must trigger ctx.nav('stock') refresh")
    assert_eq(state.shares.sentiment, prevSent + 5, "Sentiment must increase by +5")
    assert_eq(state.shares.irCooldowns.briefing, 2, "Press briefing cooldown must be set to 2")
    print("  * Press briefing onClick callback executed and verified state mutation")

    -- 6.3 Test Short Attack Defense button click
    state.shares.rivalShort = {
        active = true,
        institution = "天鹰做空机构",
        openPrice = 10.0,
        targetPrice = 7.0,
        shortInterest = 20,
        weeksLeft = 3,
        totalWeeks = 3,
        penaltyVal = 80,
        defenseLevel = 0,
    }
    refreshed = false
    local tree3 = StockScreen.Build(nav)
    local capDefBtns = findButtonsWithText(tree3, "资金注入防御")
    assert_true(#capDefBtns > 0, "Capital defense button found")
    local onClickCapDef = capDefBtns[1].onClick or (capDefBtns[1].props and capDefBtns[1].props.onClick)
    assert_true(type(onClickCapDef) == "function", "Capital defense button has onClick callback")
    onClickCapDef()
    assert_true(refreshed, "Capital defense onClick must trigger ctx.nav('stock') refresh")
    assert_eq(state.shares.rivalShort.defenseLevel, 1, "Defense level must increment to 1")
    print("  * Capital defense onClick callback executed and verified state mutation")

    -- 6.4 Test Short Squeeze button click
    state.shares.sharePrice = 13.0 -- 13 >= 10 * 1.2 = 12
    refreshed = false
    local tree4 = StockScreen.Build(nav)
    local squeezeBtns = findButtonsWithText(tree4, "触发轧空反击")
    assert_true(#squeezeBtns > 0, "Short squeeze button found")
    local onClickSqueeze = squeezeBtns[1].onClick or (squeezeBtns[1].props and squeezeBtns[1].props.onClick)
    assert_true(type(onClickSqueeze) == "function", "Short squeeze button has onClick callback")
    onClickSqueeze()
    assert_true(refreshed, "Short squeeze onClick must trigger ctx.nav('stock') refresh")
    assert_true(state.shares.rivalShort == nil, "Short attack must be resolved and cleared")
    assert_true(#state.shares.rivalShortHistory > 0, "Short attack must be archived in rivalShortHistory")
    print("  * Short squeeze onClick callback executed and verified state mutation")
end

print("\\n--------------------------------------------------------------------");
print(string.format("RESULTS: %d / %d assertions passed cleanly (0 failures)", passCount, testCount));
print("====================================================================");
print("✅ ALL STOCKSCREEN PHASE 2 UI INTEGRATION TESTS PASSED!");
`;

const status = lauxlib.luaL_dostring(L, to_luastring(testRunnerLua));
if (status !== lua.LUA_OK) {
  const err = to_jsstring(lua.lua_tostring(L, -1));
  console.error('\n❌ Test Runner Assertion Failed:\n', err);
  process.exit(1);
}
