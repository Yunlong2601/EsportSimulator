// ============================================================================
// CHALLENGER M2: EMPIRICAL STRESS-TEST HARNESS FOR STOCKSCREEN UI
// ============================================================================

const fs = require('fs');
const path = require('path');
const fengari = require('fengari-web');
const { lua, lauxlib, lualib, to_luastring, to_jsstring } = fengari;

console.log('====================================================================');
console.log('   CHALLENGER M2: STOCKSCREEN UI ADVERSARIAL STRESS-TEST HARNESS     ');
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
local failures = {}

local function assert_true(cond, msg)
    testCount = testCount + 1
    if not cond then
        table.insert(failures, msg)
        error("Assertion Failed: " .. tostring(msg))
    end
    passCount = passCount + 1
end

local function assert_eq(actual, expected, msg)
    testCount = testCount + 1
    if actual ~= expected then
        local detail = string.format("%s (Expected: %s, Got: %s)", tostring(msg), tostring(expected), tostring(actual))
        table.insert(failures, detail)
        error("Assertion Failed: " .. detail)
    end
    passCount = passCount + 1
end

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

-- ============================================================================
-- SUITE 1: UNLISTED STATE VERIFICATION
-- ============================================================================
print("[Suite 1] Unlisted State Comprehensive Verification:")
do
    -- 1.1a Unlisted + cannot IPO (valuation < 2000)
    local FinanceSystem = require("FinanceSystem")
    local origValuation = FinanceSystem.GetValuation
    FinanceSystem.GetValuation = function() return 1500 end

    local s1 = CompanyState.NewGame("UnlistedClub1", "normal", "legacy", { cash = 10 })
    s1.shares.public = false
    s1.shares.rounds = {}
    s1.company.seasonState = "normal"
    CompanyState.GetState = function() return s1 end

    local nav1 = nil
    local tree1 = StockScreen.Build(function(t) nav1 = t end)
    assert_true(type(tree1) == "table", "S1.1a: Screen must return valid UI tree")

    local ipoAlerts1 = findLabelsWithText(tree1, "上市之路 · 需完成至少一轮融资")
    assert_true(#ipoAlerts1 > 0, "S1.1a: Must render IPO qualification alert when valuation < 2000")

    local ipoBtns1 = findButtonsWithText(tree1, "公开上市")
    assert_eq(#ipoBtns1, 0, "S1.1a: Must NOT render IPO button when cannot IPO")

    local threat1 = findLabelsWithText(tree1, "机构做空突袭")
    assert_eq(#threat1, 0, "S1.1a: Must NOT render threat section")

    local buyback1 = findLabelsWithText(tree1, "股票回购")
    assert_eq(#buyback1, 0, "S1.1a: Must NOT render buyback section")

    local ir1 = findLabelsWithText(tree1, "投资者关系与市值管理")
    assert_eq(#ir1, 0, "S1.1a: Must NOT render IR/PR section")

    local quote1 = findLabelsWithText(tree1, "流通占比")
    assert_eq(#quote1, 0, "S1.1a: Must NOT render quote tiles")

    local retBtns1 = findButtonsWithText(tree1, "返回股权页")
    assert_true(#retBtns1 > 0, "S1.1a: Must render Return to Shares CTA")

    -- 1.1b Unlisted + cannot IPO (bankrupt)
    s1.company.seasonState = "bankrupt"
    local tree1b = StockScreen.Build(function(t) nav1 = t end)
    local ipoAlerts1b = findLabelsWithText(tree1b, "上市之路 · 公司已破产")
    assert_true(#ipoAlerts1b > 0, "S1.1b: Must render bankrupt alert")

    FinanceSystem.GetValuation = origValuation

    -- 1.2 Unlisted + can IPO
    local s2 = CompanyState.NewGame("UnlistedClub2", "normal", "legacy", { cash = 25000 })
    s2.shares.public = false
    s2.shares.rounds = { { name = "Pre-A", amount = 500 } }
    CompanyState.GetState = function() return s2 end

    local nav2 = nil
    local tree2 = StockScreen.Build(function(t) nav2 = t end)
    local ipoBtns2 = findButtonsWithText(tree2, "公开上市 IPO")
    assert_true(#ipoBtns2 > 0, "S1.2: Must render IPO CTA button when eligible")
    local ipoAlerts2 = findLabelsWithText(tree2, "上市之路")
    assert_eq(#ipoAlerts2, 0, "S1.2: Must NOT render IPO barrier alert when eligible")

    -- Test IPO Click
    local cbIpo = ipoBtns2[1].onClick or (ipoBtns2[1].props and ipoBtns2[1].props.onClick)
    assert_true(type(cbIpo) == "function", "S1.2: IPO CTA must have onClick")
    cbIpo()
    assert_eq(nav2, "stock", "S1.2: IPO click must refresh stock screen")
    assert_true(s2.shares.public == true, "S1.2: Company must transition to public")
    assert_eq(s2.shares.floatPct, 12, "S1.2: Initial float must be 12%")

    print("  * Suite 1 passed: Unlisted states (blocked vs eligible) cleanly isolated")
end

-- ============================================================================
-- SUITE 2: LISTED NORMAL STATE VERIFICATION
-- ============================================================================
print("\\n[Suite 2] Listed Normal State (No Threat) Verification:")
do
    local s = CompanyState.NewGame("ListedClub", "normal", "legacy", { cash = 8000 })
    s.shares.public = true
    s.shares.sharePrice = 28.5
    s.shares.prevPrice = 25.0
    s.shares.floatPct = 14
    s.shares.founder = 86
    s.shares.sentiment = 78
    s.shares.credibility = 85
    s.shares.irCooldowns = { briefing = 0, roadshow = 0, blitz = 0 }
    s.shares.rivalShort = nil
    CompanyState.GetState = function() return s end

    local tree = StockScreen.Build(function() end)

    -- Quote tiles
    local pLabels = findLabelsWithText(tree, "¥28.5")
    assert_true(#pLabels > 0, "S2: Must render exact share price ¥28.5")
    local chgLabels = findLabelsWithText(tree, "+14%%")
    assert_true(#chgLabels > 0, "S2: Must render price change (+14%)")
    local flLabels = findLabelsWithText(tree, "14%%")
    assert_true(#flLabels > 0, "S2: Must render float percentage (14%)")

    -- Threat must NOT render
    assert_eq(#findLabelsWithText(tree, "机构做空突袭"), 0, "S2: Rival short threat must not render when nil")

    -- Inactive threat must NOT render
    s.shares.rivalShort = { active = false, institution = "FakeCorp" }
    local treeInactive = StockScreen.Build(function() end)
    assert_eq(#findLabelsWithText(treeInactive, "机构做空突袭"), 0, "S2: Inactive rival short must not render")
    s.shares.rivalShort = nil

    -- Status indicators
    local sentLabel = findLabelsWithText(tree, "78/100 · 高涨")
    assert_true(#sentLabel > 0, "S2: Sentiment >= 75 must be labeled '高涨'")
    local credLabel = findLabelsWithText(tree, "85/100 · 优良")
    assert_true(#credLabel > 0, "S2: Credibility >= 70 must be labeled '优良'")

    -- Buyback 3 tiers
    local b3 = findButtonsWithText(tree, "小额回购 3%%")
    local b5 = findButtonsWithText(tree, "标准回购 5%%")
    local b10 = findButtonsWithText(tree, "战略回购 10%%")
    assert_true(#b3 > 0, "S2: 3% buyback tier must render")
    assert_true(#b5 > 0, "S2: 5% buyback tier must render")
    assert_true(#b10 > 0, "S2: 10% buyback tier must render")

    -- IR 3 campaigns
    local ir1 = findButtonsWithText(tree, "媒体通气会")
    local ir2 = findButtonsWithText(tree, "机构路演交流")
    local ir3 = findButtonsWithText(tree, "战略级公关战役")
    assert_true(#ir1 > 0, "S2: Media briefing must render")
    assert_true(#ir2 > 0, "S2: Roadshow must render")
    assert_true(#ir3 > 0, "S2: PR blitz must render")

    print("  * Suite 2 passed: Listed normal state renders quote, IR, and 3 buyback tiers cleanly")
end

-- ============================================================================
-- SUITE 3: ACTIVE RIVAL SHORT ATTACK (BELOW HURDLE) & DEFENSE TIERS
-- ============================================================================
print("\\n[Suite 3] Active Rival Short Attack Below Hurdle & Defense Levels:")
do
    local s = CompanyState.NewGame("DefClub", "normal", "legacy", { cash = 5000 })
    s.shares.public = true
    s.shares.sharePrice = 20.0
    s.shares.prevPrice = 22.0
    s.shares.floatPct = 12
    s.shares.founder = 88
    s.shares.sentiment = 40
    s.shares.credibility = 65
    s.shares.rivalShort = {
        active = true,
        institution = "黑石空头联合会",
        openPrice = 20.0,
        targetPrice = 13.0,
        shortInterest = 35,
        weeksLeft = 4,
        totalWeeks = 5,
        penaltyVal = 150,
        defenseLevel = 0,
    }
    CompanyState.GetState = function() return s end

    -- defLevel = 0 -> netPressure = max(2, 8 - 0) = 8
    local tree0 = StockScreen.Build(function() end)
    assert_true(#findLabelsWithText(tree0, "-8%%/周") > 0, "S3: DefLevel 0 must display net pressure -8%/周")
    assert_true(#findLabelsWithText(tree0, "黑石空头联合会") > 0, "S3: Must display institution name")
    assert_true(#findLabelsWithText(tree0, "35%%") > 0, "S3: Must display 35% short interest")
    assert_true(#findLabelsWithText(tree0, "4 周") > 0, "S3: Must display 4 weeks remaining")

    -- 3 Defense CTAs must be present
    local ctaCap = findButtonsWithText(tree0, "资金注入防御")
    local ctaStmt = findButtonsWithText(tree0, "澄清公告防御")
    local ctaBuy = findButtonsWithText(tree0, "回购增持防御")
    assert_true(#ctaCap > 0, "S3: Capital defense CTA must render")
    assert_true(#ctaStmt > 0, "S3: Statement defense CTA must render")
    assert_true(#ctaBuy > 0, "S3: Counter-buy defense CTA must render")

    -- Short Squeeze must NOT be present
    assert_eq(#findButtonsWithText(tree0, "触发轧空反击"), 0, "S3: Squeeze CTA must NOT render when below hurdle")

    -- Test DefLevel 1 -> netPressure = max(2, 8 - 3) = 5
    s.shares.rivalShort.defenseLevel = 1
    local tree1 = StockScreen.Build(function() end)
    assert_true(#findLabelsWithText(tree1, "-5%%/周") > 0, "S3: DefLevel 1 must display net pressure -5%/周")

    -- Test DefLevel 2 -> netPressure = max(2, 8 - 6) = 2
    s.shares.rivalShort.defenseLevel = 2
    local tree2 = StockScreen.Build(function() end)
    assert_true(#findLabelsWithText(tree2, "-2%%/周") > 0, "S3: DefLevel 2 must display net pressure -2%/周")

    -- Test DefLevel 3 -> netPressure = max(2, 8 - 6) = 2 (clamped by min(6, defLevel * 3))
    s.shares.rivalShort.defenseLevel = 3
    local tree3 = StockScreen.Build(function() end)
    assert_true(#findLabelsWithText(tree3, "-2%%/周") > 0, "S3: DefLevel 3 must clamp net pressure at minimum -2%/周")

    print("  * Suite 3 passed: Active short attack below hurdle correctly formats threat, telemetry, and defense CTAs")
end

-- ============================================================================
-- SUITE 4: ACTIVE RIVAL SHORT ATTACK (ABOVE HURDLE & BOUNDARY CHECKS)
-- ============================================================================
print("\\n[Suite 4] Squeeze Hurdle Exact Boundary Value Tests:")
do
    local s = CompanyState.NewGame("HurdleClub", "normal", "legacy", { cash = 5000 })
    s.shares.public = true
    s.shares.openPrice = 20.0
    s.shares.rivalShort = {
        active = true,
        institution = "赤熊量化资本",
        openPrice = 20.0,
        targetPrice = 14.0,
        shortInterest = 20,
        weeksLeft = 2,
        totalWeeks = 4,
        penaltyVal = 100,
        defenseLevel = 1,
    }
    CompanyState.GetState = function() return s end

    -- Hurdle is 20.0 * 1.20 = 24.0
    -- 4.1 Boundary: curPrice = 23.9 (just below hurdle)
    s.shares.sharePrice = 23.9
    local treeBelow = StockScreen.Build(function() end)
    assert_eq(#findButtonsWithText(treeBelow, "触发轧空反击"), 0, "S4.1: At 23.9 < 24.0, squeeze CTA must NOT render")
    assert_true(#findButtonsWithText(treeBelow, "资金注入防御") > 0, "S4.1: At 23.9 < 24.0, defense CTAs must render")

    -- 4.2 Boundary: curPrice = 24.0 (exact hurdle)
    s.shares.sharePrice = 24.0
    local treeExact = StockScreen.Build(function() end)
    assert_true(#findButtonsWithText(treeExact, "触发轧空反击") > 0, "S4.2: At exact hurdle 24.0, squeeze CTA MUST render")
    assert_eq(#findButtonsWithText(treeExact, "资金注入防御"), 0, "S4.2: At exact hurdle 24.0, defense CTAs must be replaced")

    -- 4.3 Boundary: curPrice = 24.1 (above hurdle)
    s.shares.sharePrice = 24.1
    local treeAbove = StockScreen.Build(function() end)
    assert_true(#findButtonsWithText(treeAbove, "触发轧空反击") > 0, "S4.3: At 24.1 > 24.0, squeeze CTA MUST render")
    assert_eq(#findButtonsWithText(treeAbove, "资金注入防御"), 0, "S4.3: At 24.1 > 24.0, defense CTAs must be replaced")

    print("  * Suite 4 passed: Exact hurdle boundary (23.9 vs 24.0 vs 24.1) correctly shifts CTAs")
end

-- ============================================================================
-- SUITE 5: COOLDOWN STATES & LABEL FORMATTING
-- ============================================================================
print("\\n[Suite 5] Cooldown Display Across Buyback & IR Campaigns:")
do
    local s = CompanyState.NewGame("CooldownClub", "normal", "legacy", { cash = 6000 })
    s.shares.public = true
    s.shares.sharePrice = 15.0
    s.company.week = 10
    CompanyState.GetState = function() return s end

    -- 5.1 Buyback Cooldown: lastBuybackWeek = 10 (cooldown 2 weeks)
    s.shares.lastBuybackWeek = 10
    local t1 = StockScreen.Build(function() end)
    local cdBuy1 = findButtonsWithText(t1, "冷却中: 还需 2 周")
    assert_true(#cdBuy1 >= 3, "S5.1: Week 10 buyback buttons must display '还需 2 周'")

    -- 5.2 Buyback Cooldown: week advanced to 11 (cooldown 1 week remaining)
    s.company.week = 11
    local t2 = StockScreen.Build(function() end)
    local cdBuy2 = findButtonsWithText(t2, "冷却中: 还需 1 周")
    assert_true(#cdBuy2 >= 3, "S5.2: Week 11 buyback buttons must display '还需 1 周'")

    -- 5.3 Buyback Cooldown: week advanced to 12 (cooldown expired: 12 - 10 = 2)
    s.company.week = 12
    local t3 = StockScreen.Build(function() end)
    local cdBuy3 = findButtonsWithText(t3, "冷却中")
    assert_eq(#cdBuy3, 0, "S5.3: Week 12 buyback cooldown expired, no buttons show '冷却中'")

    -- 5.4 IR Campaign Cooldowns: independent and combined values
    s.shares.irCooldowns = { briefing = 2, roadshow = 0, blitz = 4 }
    local tIr = StockScreen.Build(function() end)
    assert_true(#findButtonsWithText(tIr, "媒体通气会 %(冷却中 2周%)") > 0, "S5.4: Briefing must show 2 weeks cooldown")
    assert_true(#findButtonsWithText(tIr, "机构路演交流 · ¥80万") > 0, "S5.4: Roadshow ready must show active cost")
    assert_true(#findButtonsWithText(tIr, "战略级公关战役 %(冷却中 4周%)") > 0, "S5.4: Blitz must show 4 weeks cooldown")

    print("  * Suite 5 passed: Buyback (2w, 1w, expired) and IR cooldown labels match specs")
end

-- ============================================================================
-- SUITE 6: INTERACTIVE ACTION SIMULATION & MUTATIONS
-- ============================================================================
print("\\n[Suite 6] Interactive Action Click Simulations via Button Callbacks:")
do
    local s = CompanyState.NewGame("ActionClub", "normal", "legacy", { cash = 10000 })
    s.shares.public = true
    s.shares.sharePrice = 20.0
    s.shares.floatPct = 20
    s.shares.founder = 80
    s.company.week = 1
    s.shares.lastBuybackWeek = 0
    s.shares.irCooldowns = { briefing = 0, roadshow = 0, blitz = 0 }
    s.shares.sentiment = 50
    s.shares.credibility = 70
    CompanyState.GetState = function() return s end

    local navTarget = nil
    local function nav(target) navTarget = target end

    -- 6.1 Statement Defense click
    s.shares.rivalShort = {
        active = true,
        institution = "天际空头",
        openPrice = 20.0,
        targetPrice = 15.0,
        shortInterest = 20,
        weeksLeft = 3,
        totalWeeks = 3,
        penaltyVal = 100,
        defenseLevel = 0,
    }
    local tDef = StockScreen.Build(nav)
    local btnStmt = findButtonsWithText(tDef, "澄清公告防御")
    assert_true(#btnStmt > 0, "S6.1: Statement defense button found")
    local cbStmt = btnStmt[1].onClick or (btnStmt[1].props and btnStmt[1].props.onClick)
    navTarget = nil
    local prevCash = s.company.cash
    cbStmt()
    assert_eq(navTarget, "stock", "S6.1: Statement defense click must nav('stock')")
    assert_eq(s.company.cash, prevCash - 30, "S6.1: Cash must decrease by ¥30万")
    assert_eq(s.shares.rivalShort.defenseLevel, 1, "S6.1: Defense level must increment to 1")
    assert_eq(s.shares.credibility, 73, "S6.1: Credibility must increase by +3")

    -- 6.2 Counter-Buy Defense click
    local tDef2 = StockScreen.Build(nav)
    local btnCb = findButtonsWithText(tDef2, "回购增持防御")
    assert_true(#btnCb > 0, "S6.2: Counter-buy defense button found")
    local cbBuy = btnCb[1].onClick or (btnCb[1].props and btnCb[1].props.onClick)
    navTarget = nil
    prevCash = s.company.cash
    local prevFloat = s.shares.floatPct
    local prevFounder = s.shares.founder
    cbBuy()
    assert_eq(navTarget, "stock", "S6.2: Counter-buy defense click must nav('stock')")
    assert_eq(s.company.cash, prevCash - 100, "S6.2: Cash must decrease by ¥100万")
    assert_eq(s.shares.floatPct, prevFloat - 1, "S6.2: Float must drop by 1%")
    assert_eq(s.shares.founder, prevFounder + 1, "S6.2: Founder equity must rise by 1%")

    -- 6.3 PR Blitz Backfire Simulation (credibility < 40)
    s.shares.credibility = 30
    s.shares.irCooldowns.blitz = 0
    local tBlitz = StockScreen.Build(nav)
    local btnBlitz = findButtonsWithText(tBlitz, "战略级公关战役")
    assert_true(#btnBlitz > 0, "S6.3: PR blitz button found")
    local cbBlitz = btnBlitz[1].onClick or (btnBlitz[1].props and btnBlitz[1].props.onClick)
    navTarget = nil
    prevCash = s.company.cash
    local prevPrice = s.shares.sharePrice
    cbBlitz()
    assert_eq(navTarget, "stock", "S6.3: PR blitz backfire must nav('stock')")
    assert_eq(s.company.cash, prevCash - 200, "S6.3: Cash deducted despite backfire")
    assert_true(s.shares.sharePrice < prevPrice, "S6.3: Share price must drop by 5% on backfire")
    assert_eq(s.shares.irCooldowns.blitz, 6, "S6.3: Blitz cooldown must be set to 6 weeks")

    -- 6.4 Render after backfire: Top alert banner must reflect the backfire message
    local tAfter = StockScreen.Build(nav)
    local alertBackfire = findLabelsWithText(tAfter, "公关严重反噬")
    assert_true(#alertBackfire > 0, "S6.4: Top alert banner must display backfire message")

    -- 6.5 Next render: Top alert banner must be consumed and cleared
    local tNext = StockScreen.Build(nav)
    local alertCleared = findLabelsWithText(tNext, "公关严重反噬")
    assert_eq(#alertCleared, 0, "S6.5: Alert banner must be cleared on subsequent render")

    print("  * Suite 6 passed: Interactive button callbacks, state mutations, and alert lifecycle verified")
end

-- ============================================================================
-- SUITE 7: ADVERSARIAL EDGE CASES & ROBUSTNESS
-- ============================================================================
print("\\n[Suite 7] Adversarial Edge Cases & Robustness:")
do
    local s = CompanyState.NewGame("AdversarialClub", "normal", "legacy", { cash = 1000 })
    s.shares.public = true
    CompanyState.GetState = function() return s end

    -- 7.1 Corrupted / Partial rivalShort table
    s.shares.rivalShort = {
        active = true,
        -- all other fields nil!
    }
    local ok1, tree1 = pcall(function() return StockScreen.Build(function() end) end)
    assert_true(ok1, "S7.1: Partial rivalShort must not throw runtime error")
    assert_true(type(tree1) == "table", "S7.1: Partial rivalShort returns valid tree")
    assert_true(#findLabelsWithText(tree1, "敌对机构") > 0, "S7.1: Fallback institution name rendered")

    -- 7.2 Zero openPrice
    s.shares.rivalShort = {
        active = true,
        openPrice = 0,
        institution = "ZeroHedge",
    }
    local ok2, tree2 = pcall(function() return StockScreen.Build(function() end) end)
    assert_true(ok2, "S7.2: Zero openPrice must not divide by zero or crash")

    -- 7.3 Extreme Sentiment & Credibility (0 and 100)
    s.shares.rivalShort = nil
    s.shares.sentiment = 0
    s.shares.credibility = 0
    local treeMin = StockScreen.Build(function() end)
    assert_true(#findLabelsWithText(treeMin, "恐慌") > 0, "S7.3: Sentiment 0 must label '恐慌'")
    assert_true(#findLabelsWithText(treeMin, "破产边缘") > 0, "S7.3: Credibility 0 must label '破产边缘'")

    s.shares.sentiment = 100
    s.shares.credibility = 100
    local treeMax = StockScreen.Build(function() end)
    assert_true(#findLabelsWithText(treeMax, "高涨") > 0, "S7.3: Sentiment 100 must label '高涨'")
    assert_true(#findLabelsWithText(treeMax, "优良") > 0, "S7.3: Credibility 100 must label '优良'")

    -- 7.4 Zero Cash & Low Float Buyback Attempt
    s.company.cash = 0
    s.shares.floatPct = 2 -- minimum float limit
    local tZero = StockScreen.Build(function() end)
    local buy3 = findButtonsWithText(tZero, "小额回购 3%%")
    assert_true(#buy3 > 0, "S7.4: Buyback button rendered even when cash=0")
    local cbBuy3 = buy3[1].onClick or (buy3[1].props and buy3[1].props.onClick)
    local okClick = pcall(cbBuy3)
    assert_true(okClick, "S7.4: Clicking buyback with cash=0 must not throw Lua error")

    -- Next render must show restriction in alert banner
    local tRes = StockScreen.Build(function() end)
    assert_true(#findLabelsWithText(tRes, "回购受限") > 0, "S7.4: Alert banner must display '回购受限' message")

    print("  * Suite 7 passed: Handled partial tables, zero edge cases, extreme bounds, and cash constraints")
end

-- ============================================================================
-- SUITE 8: TOUCH TARGET INTEGRITY & WIREFRAME TREE COMPLIANCE
-- ============================================================================
print("\\n[Suite 8] Wireframe Tree & Touch Target Integrity:")
do
    local s = CompanyState.NewGame("TouchClub", "normal", "legacy", { cash = 5000 })
    s.shares.public = true
    s.shares.rivalShort = {
        active = true,
        institution = "TestRival",
        openPrice = 20.0,
        targetPrice = 14.0,
        shortInterest = 20,
        weeksLeft = 3,
        totalWeeks = 3,
        penaltyVal = 100,
        defenseLevel = 0,
    }
    CompanyState.GetState = function() return s end

    local tree = StockScreen.Build(function() end)
    local buttons = findWidgets(tree, function(n)
        return (n.text or (n.props and n.props.text)) ~= nil and (n.onClick ~= nil or (n.props and n.props.onClick ~= nil))
    end)

    assert_true(#buttons >= 8, "S8: Must have at least 8 interactive buttons across threat, IR, buyback, capital, and nav")
    for idx, btn in ipairs(buttons) do
        local txt = btn.text or (btn.props and btn.props.text)
        assert_true(txt and #txt > 0, "S8: Button " .. idx .. " must have non-empty text label")
    end

    print("  * Suite 8 passed: All " .. #buttons .. " interactive buttons have valid text and onClick callbacks")
end

print("\\n--------------------------------------------------------------------");
print(string.format("EMPIRICAL HARNESS RESULTS: %d / %d assertions passed cleanly (0 failures)", passCount, testCount));
print("====================================================================");
if #failures > 0 then
    print("❌ FAILURES DETECTED:")
    for _, f in ipairs(failures) do print("  - " .. f) end
    error("Stress test failed!")
else
    print("✅ ALL EMPIRICAL ADVERSARIAL STRESS TESTS PASSED WITH 100% SUCCESS!");
end
`;

const status = lauxlib.luaL_dostring(L, to_luastring(testRunnerLua));
if (status !== lua.LUA_OK) {
  const err = to_jsstring(lua.lua_tostring(L, -1));
  console.error('\n❌ Test Runner Failed with Error:\n', err);
  process.exit(1);
}
