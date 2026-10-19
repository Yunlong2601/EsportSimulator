// ============================================================================
// CHALLENGER M2-2: EMPIRICAL STRESS-TEST HARNESS FOR STOCKSCREEN
// INTERACTIVE BUTTON CALLBACKS, FEEDBACK FLOW & CROSS-SEASON COOLDOWN
// ============================================================================

const fs = require('fs');
const path = require('path');
const fengari = require('fengari-web');
const { lua, lauxlib, lualib, to_luastring, to_jsstring } = fengari;

console.log('====================================================================');
console.log('   CHALLENGER M2-2: STOCKSCREEN CALLBACKS & FEEDBACK FLOW TEST      ');
console.log('====================================================================');

const L = lauxlib.luaL_newstate();
lualib.luaL_openlibs(L);

const rootDir = path.resolve('.');

const customLoader = function(L_inner) {
  const modName = to_jsstring(lua.lua_tostring(L_inner, 1));
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

-- Widget tree traversal helpers
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
        local hasCb = (n.onClick ~= nil) or (n.props and n.props.onClick ~= nil)
        return hasCb and txt and string.find(txt, pattern) ~= nil
    end)
end

local function findAlerts(root)
    return findWidgets(root, function(n)
        local kind = n.kind or (n.props and n.props.kind)
        return kind == "alert" or (n.text and string.find(n.text, "轧空") or (n.text and string.find(n.text, "护盘")) or (n.text and string.find(n.text, "回购")) or (n.text and string.find(n.text, "公关")) or (n.text and string.find(n.text, "通气会")) or (n.text and string.find(n.text, "路演")))
    end)
end

local function getButtonCallback(btn)
    return btn.onClick or (btn.props and btn.props.onClick)
end

-- ============================================================================
-- SUITE 1: Short Squeeze CTA Callback & Feedback Flow
-- ============================================================================
print("[Suite 1] Short Squeeze CTA Callback, lastMsg Alert & Timeline Recording:")
do
    local state = CompanyState.NewGame("TestClub", "normal", "legacy")
    state.company.cash = 5000
    state.shares.public = true
    state.shares.openPrice = 20.0
    state.shares.sharePrice = 25.0 -- 25.0 >= 20.0 * 1.20 = 24.0
    state.shares.prevPrice = 20.0
    state.shares.floatPct = 12
    state.shares.founder = 88
    state.shares.rivalShort = {
        active = true,
        institution = "暗潮对冲基金",
        openPrice = 20.0,
        targetPrice = 14.0,
        shortInterest = 25,
        weeksLeft = 3,
        totalWeeks = 4,
        penaltyVal = 100,
        defenseLevel = 1,
    }
    state.timeline = {}
    CompanyState.GetState = function() return state end

    local navCalledWith = nil
    local function nav(target)
        navCalledWith = target
    end

    -- Initial render
    local tree1 = StockScreen.Build(nav)
    local squeezeBtns = findButtonsWithText(tree1, "触发轧空反击")
    assert_true(#squeezeBtns > 0, "Suite 1: Short squeeze CTA button rendered")

    local cb = getButtonCallback(squeezeBtns[1])
    assert_true(type(cb) == "function", "Suite 1: Squeeze button has valid onClick callback")

    -- Click Short Squeeze CTA
    navCalledWith = nil
    local prevTimelineLen = #state.timeline
    cb()

    -- 1. Assert ctx.nav("stock") was invoked
    assert_eq(navCalledWith, "stock", "Suite 1: Squeeze callback invoked ctx.nav('stock')")

    -- 2. Assert timeline entry was created
    assert_true(#state.timeline > prevTimelineLen, "Suite 1: Timeline entry recorded")
    local topTimeline = state.timeline[1]
    assert_eq(topTimeline.title, "【做空爆仓·轧空胜利】", "Suite 1: Timeline entry title matches squeeze victory")
    assert_true(string.find(topTimeline.description, "暗潮对冲基金") ~= nil, "Suite 1: Timeline contains institution name")
    assert_true(string.find(topTimeline.description, "爆仓离场") ~= nil, "Suite 1: Timeline contains爆仓离场")

    -- 3. Assert refreshed StockScreen displays the feedback alert banner
    local tree2 = StockScreen.Build(nav)
    local alerts = findWidgets(tree2, function(n)
        local txt = n.text or (n.props and n.props.text)
        return txt and string.find(txt, "轧空反击大捷") ~= nil
    end)
    assert_true(#alerts > 0, "Suite 1: Refreshed screen displays immediate lastMsg alert banner")

    -- 4. Assert second refresh clears the one-shot lastMsg banner
    local tree3 = StockScreen.Build(nav)
    local alerts3 = findWidgets(tree3, function(n)
        local txt = n.text or (n.props and n.props.text)
        return txt and string.find(txt, "轧空反击大捷") ~= nil
    end)
    assert_eq(#alerts3, 0, "Suite 1: Subsequent screen refresh clears one-shot alert banner")

    -- 5. Squeeze button is replaced/gone since rivalShort is now resolved
    local squeezeBtnsAfter = findButtonsWithText(tree2, "触发轧空反击")
    assert_eq(#squeezeBtnsAfter, 0, "Suite 1: Squeeze CTA disappears after successful resolution")
    print("  * Short Squeeze CTA: nav('stock'), lastMsg flash, and state.timeline verified!")
end

-- ============================================================================
-- SUITE 2: Capital Defense CTAs (capital, statement, counter_buy)
-- ============================================================================
print("\\n[Suite 2] Capital Defense CTAs (capital, statement, counter_buy) Callbacks:")
do
    -- 2.1 Capital Injection Defense (资金注入防御 · ¥150万)
    local state = CompanyState.NewGame("TestClub", "normal", "legacy", { cash = 5000 })
    state.shares.public = true
    state.shares.sharePrice = 20.0
    state.shares.prevPrice = 20.0
    state.shares.floatPct = 12
    state.shares.founder = 88
    state.shares.sentiment = 40
    state.shares.rivalShort = {
        active = true,
        institution = "赤熊量化资本",
        openPrice = 20.0,
        targetPrice = 14.0,
        shortInterest = 30,
        weeksLeft = 3,
        totalWeeks = 3,
        penaltyVal = 100,
        defenseLevel = 0,
    }
    state.timeline = {}
    CompanyState.GetState = function() return state end

    local navCalledWith = nil
    local function nav(target) navCalledWith = target end

    local tree = StockScreen.Build(nav)
    local capBtns = findButtonsWithText(tree, "资金注入防御")
    assert_true(#capBtns > 0, "Suite 2.1: Capital defense button found")

    local cbCap = getButtonCallback(capBtns[1])
    navCalledWith = nil
    local prevCash = state.company.cash
    local prevDef = state.shares.rivalShort.defenseLevel
    cbCap()

    assert_eq(navCalledWith, "stock", "Suite 2.1: Capital defense invoked ctx.nav('stock')")
    assert_eq(state.company.cash, prevCash - 150, "Suite 2.1: Deducted ¥150万 cash")
    assert_eq(state.shares.rivalShort.defenseLevel, prevDef + 1, "Suite 2.1: Defense level incremented")
    assert_true(#state.timeline > 0, "Suite 2.1: Timeline recorded")
    assert_eq(state.timeline[1].title, " 资金护盘", "Suite 2.1: Timeline title matches ' 资金护盘'")

    local treeRefreshed = StockScreen.Build(nav)
    local alertCap = findWidgets(treeRefreshed, function(n)
        local txt = n.text or (n.props and n.props.text)
        return txt and string.find(txt, "资金护盘成功") ~= nil
    end)
    assert_true(#alertCap > 0, "Suite 2.1: Refreshed screen displays '资金护盘成功' alert")

    -- 2.2 Statement Defense (官方澄清声明 · ¥30万)
    local prBtns = findButtonsWithText(treeRefreshed, "澄清公告防御")
    assert_true(#prBtns > 0, "Suite 2.2: Statement defense button found")

    local cbPr = getButtonCallback(prBtns[1])
    navCalledWith = nil
    prevCash = state.company.cash
    prevDef = state.shares.rivalShort.defenseLevel
    cbPr()

    assert_eq(navCalledWith, "stock", "Suite 2.2: Statement defense invoked ctx.nav('stock')")
    assert_eq(state.company.cash, prevCash - 30, "Suite 2.2: Deducted ¥30万 cash")
    assert_eq(state.shares.rivalShort.defenseLevel, prevDef + 1, "Suite 2.2: Defense level incremented")
    assert_eq(state.timeline[1].title, " 官方澄清声明", "Suite 2.2: Timeline title matches ' 官方澄清声明'")

    local treeRefreshed2 = StockScreen.Build(nav)
    local alertPr = findWidgets(treeRefreshed2, function(n)
        local txt = n.text or (n.props and n.props.text)
        return txt and string.find(txt, "官方澄清发布成功") ~= nil
    end)
    assert_true(#alertPr > 0, "Suite 2.2: Refreshed screen displays '官方澄清发布成功' alert")

    -- 2.3 Counter-Buy Defense (回购增持防御 · ¥100万)
    local cbDefBtns = findButtonsWithText(treeRefreshed2, "回购增持防御")
    assert_true(#cbDefBtns > 0, "Suite 2.3: Counter-buy defense button found")

    local cbCb = getButtonCallback(cbDefBtns[1])
    navCalledWith = nil
    prevCash = state.company.cash
    prevDef = state.shares.rivalShort.defenseLevel
    local prevFloat = state.shares.floatPct
    local prevFounder = state.shares.founder
    cbCb()

    assert_eq(navCalledWith, "stock", "Suite 2.3: Counter-buy defense invoked ctx.nav('stock')")
    assert_eq(state.company.cash, prevCash - 100, "Suite 2.3: Deducted ¥100万 cash")
    assert_eq(state.shares.rivalShort.defenseLevel, prevDef + 1, "Suite 2.3: Defense level incremented")
    assert_eq(state.shares.floatPct, prevFloat - 1, "Suite 2.3: Float reduced by 1%")
    assert_eq(state.shares.founder, prevFounder + 1, "Suite 2.3: Founder equity increased by 1%")
    assert_eq(state.timeline[1].title, " 反向回购护盘", "Suite 2.3: Timeline title matches ' 反向回购护盘'")

    local treeRefreshed3 = StockScreen.Build(nav)
    local alertCb = findWidgets(treeRefreshed3, function(n)
        local txt = n.text or (n.props and n.props.text)
        return txt and string.find(txt, "反向回购护盘成功") ~= nil
    end)
    assert_true(#alertCb > 0, "Suite 2.3: Refreshed screen displays '反向回购护盘成功' alert")

    -- 2.4 Defense failure due to reserve limit restriction
    state.shares.sharePrice = 20.0 -- Keep below squeeze hurdle (24.0) so defense CTAs render
    state.company.cash = 120 -- Not enough for capital defense (needs 150 + 100 reserve = 250)
    local treeFail = StockScreen.Build(nav)
    local capFailBtns = findButtonsWithText(treeFail, "资金注入防御")
    local cbFail = getButtonCallback(capFailBtns[1])
    navCalledWith = nil
    cbFail()

    assert_eq(navCalledWith, "stock", "Suite 2.4: Failed defense still triggers ctx.nav('stock')")
    local treeFailRefreshed = StockScreen.Build(nav)
    local alertFail = findWidgets(treeFailRefreshed, function(n)
        local txt = n.text or (n.props and n.props.text)
        return txt and string.find(txt, "护盘受限") ~= nil
    end)
    assert_true(#alertFail > 0, "Suite 2.4: Refreshed screen displays failure feedback alert")

    print("  * Capital Defense CTAs (capital, statement, counter_buy, failure): all callbacks verified!")
end

-- ============================================================================
-- SUITE 3: Tiered Buyback CTAs (3%, 5%, 10%)
-- ============================================================================
print("\\n[Suite 3] Tiered Buyback CTAs (3%, 5%, 10%) Callbacks & Feedback Flow:")
do
    -- 3.1 Tier 3% Buyback
    local state = CompanyState.NewGame("TestClub", "normal", "legacy")
    state.company.cash = 10000 -- Ensure ample cash for all buyback tiers
    state.shares.public = true
    state.shares.sharePrice = 10.0
    state.shares.floatPct = 25
    state.shares.founder = 75
    state.company.week = 1
    state.shares.lastBuybackWeek = 0
    state.timeline = {}
    CompanyState.GetState = function() return state end

    local navCalledWith = nil
    local function nav(target) navCalledWith = target end

    local tree = StockScreen.Build(nav)
    local buy3Btns = findButtonsWithText(tree, "小额回购 3%%")
    assert_true(#buy3Btns > 0, "Suite 3.1: 3% buyback button found")

    local cb3 = getButtonCallback(buy3Btns[1])
    navCalledWith = nil
    cb3()

    assert_eq(navCalledWith, "stock", "Suite 3.1: 3% buyback invoked ctx.nav('stock')")
    assert_eq(state.shares.floatPct, 22, "Suite 3.1: Float reduced from 25% to 22%")
    assert_eq(state.shares.founder, 78, "Suite 3.1: Founder equity rose from 75% to 78%")
    assert_eq(state.shares.lastBuybackWeek, 1, "Suite 3.1: lastBuybackWeek recorded as 1")
    assert_eq(state.timeline[1].title, " 股份回购", "Suite 3.1: Timeline recorded ' 股份回购'")
    assert_true(string.find(state.timeline[1].description, "3%% 流通股") ~= nil, "Suite 3.1: Timeline mentions 3%")

    local treeRefreshed = StockScreen.Build(nav)
    local alert3 = findWidgets(treeRefreshed, function(n)
        local txt = n.text or (n.props and n.props.text)
        return txt and string.find(txt, "已成功回购 3%% 流通股") ~= nil
    end)
    assert_true(#alert3 > 0, "Suite 3.1: Refreshed screen displays '已成功回购 3% 流通股' feedback")

    -- 3.2 Cooldown rejection when attempting immediate re-buyback
    local buyAgainBtns = findButtonsWithText(treeRefreshed, "回购")
    assert_true(#buyAgainBtns > 0, "Suite 3.2: Cooldown buyback buttons found")
    local cbAgain = getButtonCallback(buyAgainBtns[1])
    navCalledWith = nil
    cbAgain()
    assert_eq(navCalledWith, "stock", "Suite 3.2: Rejection triggers ctx.nav('stock')")
    local treeCdRefreshed = StockScreen.Build(nav)
    local alertCd = findWidgets(treeCdRefreshed, function(n)
        local txt = n.text or (n.props and n.props.text)
        return txt and string.find(txt, "回购受限：回购冷却中") ~= nil
    end)
    assert_true(#alertCd > 0, "Suite 3.2: Refreshed screen displays cooldown rejection alert")

    -- 3.3 Advance week to 3 and execute Tier 5% Buyback
    state.company.week = 3
    local treeW3 = StockScreen.Build(nav)
    local buy5Btns = findButtonsWithText(treeW3, "标准回购 5%%")
    assert_true(#buy5Btns > 0, "Suite 3.3: 5% buyback button found ready at week 3")
    local cb5 = getButtonCallback(buy5Btns[1])
    navCalledWith = nil
    cb5()

    assert_eq(navCalledWith, "stock", "Suite 3.3: 5% buyback invoked ctx.nav('stock')")
    assert_eq(state.shares.floatPct, 17, "Suite 3.3: Float reduced from 22% to 17%")
    assert_eq(state.shares.founder, 83, "Suite 3.3: Founder equity rose from 78% to 83%")
    assert_eq(state.shares.lastBuybackWeek, 3, "Suite 3.3: lastBuybackWeek updated to 3")
    assert_eq(state.timeline[1].title, " 股份回购", "Suite 3.3: Timeline recorded ' 股份回购'")
    assert_true(string.find(state.timeline[1].description, "5%% 流通股") ~= nil, "Suite 3.3: Timeline mentions 5%")

    local treeRefreshed5 = StockScreen.Build(nav)
    local alert5 = findWidgets(treeRefreshed5, function(n)
        local txt = n.text or (n.props and n.props.text)
        return txt and string.find(txt, "已成功回购 5%% 流通股") ~= nil
    end)
    assert_true(#alert5 > 0, "Suite 3.3: Refreshed screen displays '已成功回购 5% 流通股' feedback")

    -- 3.4 Advance week to 5 and execute Tier 10% Buyback
    state.company.week = 5
    local treeW5 = StockScreen.Build(nav)
    local buy10Btns = findButtonsWithText(treeW5, "战略回购 10%%")
    assert_true(#buy10Btns > 0, "Suite 3.4: 10% buyback button found ready at week 5")
    local cb10 = getButtonCallback(buy10Btns[1])
    navCalledWith = nil
    cb10()

    assert_eq(navCalledWith, "stock", "Suite 3.4: 10% buyback invoked ctx.nav('stock')")
    assert_eq(state.shares.floatPct, 7, "Suite 3.4: Float reduced from 17% to 7%")
    assert_eq(state.shares.founder, 93, "Suite 3.4: Founder equity rose from 83% to 93%")
    assert_eq(state.shares.lastBuybackWeek, 5, "Suite 3.4: lastBuybackWeek updated to 5")
    assert_eq(state.timeline[1].title, " 股份回购", "Suite 3.4: Timeline recorded ' 股份回购'")
    assert_true(string.find(state.timeline[1].description, "10%% 流通股") ~= nil, "Suite 3.4: Timeline mentions 10%")

    local treeRefreshed10 = StockScreen.Build(nav)
    local alert10 = findWidgets(treeRefreshed10, function(n)
        local txt = n.text or (n.props and n.props.text)
        return txt and string.find(txt, "已成功回购 10%% 流通股") ~= nil
    end)
    assert_true(#alert10 > 0, "Suite 3.4: Refreshed screen displays '已成功回购 10% 流通股' feedback")

    -- 3.5 Insufficient Float Restriction (< tier + 2%)
    -- Float is now 7%. To buy 10%, float must be >= 10 + 2 = 12%. So 10% buyback must fail!
    state.company.week = 8
    local treeW8 = StockScreen.Build(nav)
    local buy10FailBtns = findButtonsWithText(treeW8, "战略回购 10%%")
    local cb10Fail = getButtonCallback(buy10FailBtns[1])
    navCalledWith = nil
    cb10Fail()
    assert_eq(navCalledWith, "stock", "Suite 3.5: Float-restricted buyback still triggers ctx.nav('stock')")
    local treeFloatFail = StockScreen.Build(nav)
    local alertFloatFail = findWidgets(treeFloatFail, function(n)
        local txt = n.text or (n.props and n.props.text)
        return txt and string.find(txt, "回购受限：流通盘不足") ~= nil
    end)
    assert_true(#alertFloatFail > 0, "Suite 3.5: Refreshed screen displays '回购受限：流通盘不足' feedback")

    print("  * Tiered Buybacks (3%, 5%, 10%, cooldown, reserve & float checks): verified!")
end

-- ============================================================================
-- SUITE 4: IR & PR Campaign CTAs (briefing, roadshow, blitz)
-- ============================================================================
print("\\n[Suite 4] IR/PR Campaign CTAs (briefing, roadshow, blitz) Callbacks & Backfire:")
do
    -- 4.1 Press Briefing (媒体通气会)
    local state = CompanyState.NewGame("TestClub", "normal", "legacy")
    state.company.cash = 5000 -- Ensure cash for all IR campaigns
    state.shares.public = true
    state.shares.sentiment = 50
    state.shares.credibility = 70
    state.shares.irCooldowns = { briefing = 0, roadshow = 0, blitz = 0 }
    state.timeline = {}
    CompanyState.GetState = function() return state end

    local navCalledWith = nil
    local function nav(target) navCalledWith = target end

    local tree = StockScreen.Build(nav)
    local briefingBtns = findButtonsWithText(tree, "媒体通气会")
    assert_true(#briefingBtns > 0, "Suite 4.1: Press Briefing button found")

    local cbBriefing = getButtonCallback(briefingBtns[1])
    navCalledWith = nil
    cbBriefing()

    assert_eq(navCalledWith, "stock", "Suite 4.1: Briefing invoked ctx.nav('stock')")
    assert_eq(state.shares.sentiment, 55, "Suite 4.1: Sentiment increased from 50 to 55")
    assert_eq(state.shares.credibility, 72, "Suite 4.1: Credibility increased from 70 to 72")
    assert_eq(state.shares.irCooldowns.briefing, 2, "Suite 4.1: Briefing cooldown set to 2")
    assert_true(#state.timeline > 0, "Suite 4.1: Timeline entry recorded")
    assert_true(string.find(state.timeline[1].title, "新闻发布会") ~= nil, "Suite 4.1: Timeline title mentions 新闻发布会")

    local treeRefreshed1 = StockScreen.Build(nav)
    local alertBriefing = findWidgets(treeRefreshed1, function(n)
        local txt = n.text or (n.props and n.props.text)
        return txt and string.find(txt, "媒体通气会开展成功") ~= nil
    end)
    assert_true(#alertBriefing > 0, "Suite 4.1: Refreshed screen displays '媒体通气会开展成功' feedback")

    -- 4.2 Investor Roadshow (机构路演交流)
    local roadshowBtns = findButtonsWithText(treeRefreshed1, "机构路演交流")
    assert_true(#roadshowBtns > 0, "Suite 4.2: Roadshow button found")

    local cbRoadshow = getButtonCallback(roadshowBtns[1])
    navCalledWith = nil
    cbRoadshow()

    assert_eq(navCalledWith, "stock", "Suite 4.2: Roadshow invoked ctx.nav('stock')")
    assert_eq(state.shares.sentiment, 67, "Suite 4.2: Sentiment increased from 55 to 67 (+12)")
    assert_eq(state.shares.credibility, 73, "Suite 4.2: Credibility increased to 73 (+1)")
    assert_eq(state.shares.irCooldowns.roadshow, 4, "Suite 4.2: Roadshow cooldown set to 4")
    assert_true(string.find(state.timeline[1].title, "机构投资者路演") ~= nil, "Suite 4.2: Timeline title mentions 路演")

    local treeRefreshed2 = StockScreen.Build(nav)
    local alertRoadshow = findWidgets(treeRefreshed2, function(n)
        local txt = n.text or (n.props and n.props.text)
        return txt and string.find(txt, "机构路演成功") ~= nil
    end)
    assert_true(#alertRoadshow > 0, "Suite 4.2: Refreshed screen displays '机构路演成功' feedback")

    -- 4.3 Strategic PR Blitz (战略级公关战役) - Normal Success
    local blitzBtns = findButtonsWithText(treeRefreshed2, "战略级公关战役")
    assert_true(#blitzBtns > 0, "Suite 4.3: PR Blitz button found")

    local cbBlitz = getButtonCallback(blitzBtns[1])
    navCalledWith = nil
    cbBlitz()

    assert_eq(navCalledWith, "stock", "Suite 4.3: Blitz invoked ctx.nav('stock')")
    assert_eq(state.shares.sentiment, 92, "Suite 4.3: Sentiment rose to 92 (+25)")
    assert_eq(state.shares.credibility, 71, "Suite 4.3: Credibility adjusted to 71 (-2)")
    assert_eq(state.shares.irCooldowns.blitz, 6, "Suite 4.3: Blitz cooldown set to 6")
    assert_true(string.find(state.timeline[1].title, "战略公关风暴") ~= nil, "Suite 4.3: Timeline title mentions 战略公关")

    local treeRefreshed3 = StockScreen.Build(nav)
    local alertBlitz = findWidgets(treeRefreshed3, function(n)
        local txt = n.text or (n.props and n.props.text)
        return txt and string.find(txt, "战略公关战役大捷") ~= nil
    end)
    assert_true(#alertBlitz > 0, "Suite 4.3: Refreshed screen displays '战略公关战役大捷' feedback")

    -- 4.4 Strategic PR Blitz Backfire (信誉低迷反噬: credibility < 40)
    state.shares.credibility = 35 -- Risk threshold triggered (< 40)
    state.shares.irCooldowns.blitz = 0 -- Reset cooldown for testing backfire
    state.company.cash = 1000 -- Ensure cash for backfire test
    local treeBackfire = StockScreen.Build(nav)
    local blitzBackfireBtns = findButtonsWithText(treeBackfire, "战略级公关战役")
    local cbBlitzBackfire = getButtonCallback(blitzBackfireBtns[1])
    navCalledWith = nil
    cbBlitzBackfire()
    local treeBackfireRefreshed = StockScreen.Build(nav)
    assert_eq(navCalledWith, "stock", "Suite 4.4: Backfire invoked ctx.nav('stock')")
    assert_eq(state.shares.credibility, 30, "Suite 4.4: Credibility penalized by -5 on backfire")
    assert_true(string.find(state.timeline[1].title, "PR风暴反噬") ~= nil, "Suite 4.4: Timeline recorded ' PR风暴反噬'")

    local alertBackfire = findWidgets(treeBackfireRefreshed, function(n)
        local txt = n.text or (n.props and n.props.text)
        return txt and string.find(txt, "公关严重反噬") ~= nil
    end)
    assert_true(#alertBackfire > 0, "Suite 4.4: Refreshed screen displays '⚠️ 公关严重反噬' feedback")

    -- Second refresh clears the one-shot alert
    local treeBackfireCleared = StockScreen.Build(nav)
    local alertCleared = findWidgets(treeBackfireCleared, function(n)
        local txt = n.text or (n.props and n.props.text)
        return txt and string.find(txt, "公关严重反噬") ~= nil
    end)
    assert_eq(#alertCleared, 0, "Suite 4.4: Subsequent render clears one-shot backfire alert")

    print("  * IR/PR Campaigns (briefing, roadshow, blitz, backfire): all callbacks verified!")
end

-- ============================================================================
-- SUITE 5: Cross-Season Cooldown Fix Empirical Verification
-- ============================================================================
print("\\n[Suite 5] Cross-Season Cooldown Lockout Fix Verification:")
do
    -- 5.1 Scenario 1: Buyback executed at end of Season 1 (week 48)
    local state = CompanyState.NewGame("TestClub", "normal", "legacy")
    state.company.cash = 8000 -- Ample cash for buyback at week 48
    state.shares.public = true
    state.shares.sharePrice = 15.0
    state.shares.floatPct = 20
    state.shares.founder = 80
    state.company.week = 48
    state.company.seasons = 1
    state.timeline = {}
    CompanyState.GetState = function() return state end

    local navCalledWith = nil
    local function nav(target) navCalledWith = target end

    -- Execute buyback at week 48
    local treeS1 = StockScreen.Build(nav)
    local buyBtnsS1 = findButtonsWithText(treeS1, "标准回购 5%%")
    assert_true(#buyBtnsS1 > 0, "Suite 5.1: Buyback button found at week 48")
    local cbS1 = getButtonCallback(buyBtnsS1[1])
    cbS1()
    assert_eq(state.shares.lastBuybackWeek, 48, "Suite 5.1: lastBuybackWeek is 48 in Season 1")

    -- Now trigger Season Rollover via CompanyState.StartNewSeason
    CompanyState.StartNewSeason(state)
    assert_eq(state.company.week, 1, "Suite 5.1: Season rolled over, current week reset to 1")
    assert_eq(state.company.seasons, 2, "Suite 5.1: Season number incremented to 2")
    assert_eq(state.shares.lastBuybackWeek, 0, "Suite 5.1: lastBuybackWeek cleanly reset to 0 in StartNewSeason")

    -- Render StockScreen in Season 2 Week 1
    local treeS2 = StockScreen.Build(nav)
    local cdBtnsS2 = findButtonsWithText(treeS2, "冷却中")
    assert_eq(#cdBtnsS2, 0, "Suite 5.1: Buyback buttons must NOT show cooldown in Season 2 Week 1")

    local buyBtnsS2 = findButtonsWithText(treeS2, "标准回购 5%%")
    assert_true(#buyBtnsS2 > 0, "Suite 5.1: Buyback button is immediately available in Season 2 Week 1")
    local cbS2 = getButtonCallback(buyBtnsS2[1])
    navCalledWith = nil
    cbS2()

    assert_eq(navCalledWith, "stock", "Suite 5.1: Buyback in Season 2 Week 1 succeeded and refreshed screen")
    assert_eq(state.shares.lastBuybackWeek, 1, "Suite 5.1: lastBuybackWeek correctly updated to Week 1")
    local treeS2Refreshed = StockScreen.Build(nav)
    local alertSuccessS2 = findWidgets(treeS2Refreshed, function(n)
        local txt = n.text or (n.props and n.props.text)
        return txt and string.find(txt, "已成功回购 5%% 流通股") ~= nil
    end)
    assert_true(#alertSuccessS2 > 0, "Suite 5.1: Success feedback alert rendered in Season 2 Week 1")

    -- 5.2 Scenario 2: Adversarial Boundary Stress Test
    -- Simulate legacy or un-reset state where lastBuybackWeek is 48 or 50, but current week is 1.
    -- Verify that the dual-guard (week >= lastBuy) in StockSystem and StockScreen prevents 49-week lockout!
    state.shares.lastBuybackWeek = 50 -- Simulating legacy/stale week 50
    state.company.week = 1

    -- In StockScreen:
    local treeAdversarial = StockScreen.Build(nav)
    local cdBtnsAdv = findButtonsWithText(treeAdversarial, "冷却中")
    assert_eq(#cdBtnsAdv, 0, "Suite 5.2: Dual-guard prevents onCooldown when curWeek (1) < lastBuy (50)")

    -- In StockSystem:
    local okBuy, costBuy, msgBuy = StockSystem.BuyBack(state, 3, 100)
    assert_true(okBuy, "Suite 5.2: StockSystem.BuyBack succeeds without 49-week cooldown rejection")
    assert_eq(msgBuy, "回购成功", "Suite 5.2: BuyBack returns '回购成功'")

    -- 5.3 Scenario 3: Within-Season Cooldown is preserved accurately
    state.company.week = 1
    state.shares.lastBuybackWeek = 1
    local treeInSeason = StockScreen.Build(nav)
    local cdBtnsInSeason = findButtonsWithText(treeInSeason, "还需 2 周")
    assert_true(#cdBtnsInSeason > 0, "Suite 5.3: Normal within-season cooldown displays '还需 2 周' at week 1")

    state.company.week = 2
    local treeInSeason2 = StockScreen.Build(nav)
    local cdBtnsInSeason2 = findButtonsWithText(treeInSeason2, "还需 1 周")
    assert_true(#cdBtnsInSeason2 > 0, "Suite 5.3: Normal within-season cooldown displays '还需 1 周' at week 2")

    state.company.week = 3
    local treeInSeason3 = StockScreen.Build(nav)
    local cdBtnsInSeason3 = findButtonsWithText(treeInSeason3, "冷却中")
    assert_eq(#cdBtnsInSeason3, 0, "Suite 5.3: Cooldown expires at week 3 (ready again)")

    print("  * Cross-season cooldown lockout bug completely prevented (0-week delay on rollover, dual guards intact)!")
end

print("\\n--------------------------------------------------------------------");
print(string.format("RESULTS: %d / %d assertions passed cleanly (0 failures)", passCount, testCount));
print("====================================================================");
print("✅ ALL CHALLENGER M2-2 VERIFICATION TESTS PASSED!");
`;

const status = lauxlib.luaL_dostring(L, to_luastring(testRunnerLua));
if (status !== lua.LUA_OK) {
  const err = to_jsstring(lua.lua_tostring(L, -1));
  console.error('\n❌ Test Runner Assertion Failed:\n', err);
  process.exit(1);
}
