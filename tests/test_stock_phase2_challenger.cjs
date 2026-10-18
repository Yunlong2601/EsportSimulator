// ============================================================================
// CHALLENGER M1.1: EMPIRICAL STRESS-TEST HARNESS FOR STOCK BUYBACK & IR/PR
// ============================================================================

const fs = require('fs');
const path = require('path');
const fengari = require('fengari-web');
const { lua, lauxlib, lualib, to_luastring, to_jsstring } = fengari;

const L = lauxlib.luaL_newstate();
lualib.luaL_openlibs(L);

const rootDir = path.resolve(__dirname, '..');

// Custom module loader for scripts and urhox-libs
const customLoader = function(L_inner) {
  const modName = to_jsstring(lua.lua_tostring(L_inner, 1));
  const slashPath = modName.replace(/\./g, '/');
  let candidates = [
    path.join(rootDir, 'scripts', slashPath + '.lua'),
    path.join(rootDir, 'scripts', 'lua', slashPath + '.lua'),
    path.join(rootDir, 'urhox-libs', slashPath + '.lua'),
    path.join(rootDir, 'scripts', modName + '.lua'),
    path.join(rootDir, slashPath + '.lua')
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

const testLuaSource = `
local StockSystem = require("StockSystem")
local CompanyState = require("CompanyState")

local totalTests = 0
local passedTests = 0
local failedTests = 0
local failures = {}

local function assert_eq(actual, expected, message)
    totalTests = totalTests + 1
    if actual == expected then
        passedTests = passedTests + 1
    else
        failedTests = failedTests + 1
        local msg = string.format("[FAIL] %s: expected %s, got %s", message or "assertion failed", tostring(expected), tostring(actual))
        table.insert(failures, msg)
        print("  " .. msg)
    end
end

local function assert_true(cond, message)
    assert_eq(cond, true, message)
end

local function assert_false(cond, message)
    assert_eq(cond, false, message)
end

local function createTestState(opts)
    opts = opts or {}
    local s = {
        company = {
            name = "Challenger Corp",
            cash = opts.cash or 2000,
            week = opts.week or 1,
            seasonState = "regular",
            fans = 20000,
            reputation = 50,
            difficulty = "standard",
            league = "pro",
            settings = { tag = "CC" },
        },
        roster = {
            players = {},
            contracts = {},
            staff = { coach = 1, analyst = 1, operations = 1 },
        },
        shares = {
            public = opts.public ~= false,
            ticker = "CC",
            sharePrice = opts.price or 10.0,
            prevPrice = opts.price or 10.0,
            floatPct = opts.floatPct or 20,
            founder = opts.founder or 70,
            sentiment = opts.sentiment or 50,
            credibility = opts.credibility or 70,
            lastBuybackWeek = opts.lastBuybackWeek or 0,
            irCooldowns = opts.irCooldowns or {},
            buybackHistory = opts.buybackHistory or {},
        },
        timeline = {},
    }
    return CompanyState.Ensure(s)
end

print("====================================================================")
print("  CHALLENGER SUITE: STOCK BUYBACK & IR/PR MECHANICS STRESS-TEST     ")
print("====================================================================")

-- -----------------------------------------------------------------------------
-- SECTION 1: BUYBACK MATH & MECHANICS
-- -----------------------------------------------------------------------------
print("\\n[Test Group 1] Buyback Tier Calculations & Math:")

-- 1.1 Tier 3% Buyback
do
    local s = createTestState({ cash = 2000, price = 10, floatPct = 20, founder = 70, sentiment = 50 })
    -- marketCap = 10 * 1000 = 10000
    -- cost = floor(10000 * 0.03 * 1.02 + 0.5) = floor(306.0) = 306
    -- price boost = +2% -> floor(10 * 1.02 * 10 + 0.5) / 10 = 10.2
    local ok, cost, msg = StockSystem.BuyBack(s, 3, 100)
    assert_true(ok, "Buyback 3% tier should succeed")
    assert_eq(cost, 306, "Buyback 3% cost calculation")
    assert_eq(s.company.cash, 2000 - 306, "Buyback 3% cash deduction")
    assert_eq(s.shares.floatPct, 17, "Buyback 3% floatPct reduction")
    assert_eq(s.shares.founder, 73, "Buyback 3% founder equity increase")
    assert_eq(s.shares.sharePrice, 10.2, "Buyback 3% share price boost (+2%)")
    assert_eq(s.shares.sentiment, 55, "Buyback 3% sentiment boost (+5)")
    assert_eq(s.shares.lastBuybackWeek, 1, "Buyback lastBuybackWeek updated")
    assert_eq(#s.shares.buybackHistory, 1, "Buyback history entry added")
    assert_eq(s.shares.buybackHistory[1].sharesPct, 3, "Buyback history sharesPct")
    assert_eq(s.shares.buybackHistory[1].cost, 306, "Buyback history cost")
end

-- 1.2 Tier 5% Buyback
do
    local s = createTestState({ cash = 2000, price = 10, floatPct = 20, founder = 70, sentiment = 50 })
    -- marketCap = 10 * 1000 = 10000
    -- cost = floor(10000 * 0.05 * 1.02 + 0.5) = floor(510.0) = 510
    -- price boost = +3% -> floor(10 * 1.03 * 10 + 0.5) / 10 = 10.3
    local ok, cost, msg = StockSystem.BuyBack(s, 5, 100)
    assert_true(ok, "Buyback 5% tier should succeed")
    assert_eq(cost, 510, "Buyback 5% cost calculation")
    assert_eq(s.company.cash, 2000 - 510, "Buyback 5% cash deduction")
    assert_eq(s.shares.floatPct, 15, "Buyback 5% floatPct reduction")
    assert_eq(s.shares.founder, 75, "Buyback 5% founder equity increase")
    assert_eq(s.shares.sharePrice, 10.3, "Buyback 5% share price boost (+3%)")
    assert_eq(s.shares.sentiment, 55, "Buyback 5% sentiment boost (+5)")
end

-- 1.3 Tier 10% Buyback
do
    local s = createTestState({ cash = 2000, price = 10, floatPct = 20, founder = 70, sentiment = 50 })
    -- marketCap = 10 * 1000 = 10000
    -- cost = floor(10000 * 0.10 * 1.02 + 0.5) = floor(1020.0) = 1020
    -- price boost = +5% -> floor(10 * 1.05 * 10 + 0.5) / 10 = 10.5
    local ok, cost, msg = StockSystem.BuyBack(s, 10, 100)
    assert_true(ok, "Buyback 10% tier should succeed")
    assert_eq(cost, 1020, "Buyback 10% cost calculation")
    assert_eq(s.company.cash, 2000 - 1020, "Buyback 10% cash deduction")
    assert_eq(s.shares.floatPct, 10, "Buyback 10% floatPct reduction")
    assert_eq(s.shares.founder, 80, "Buyback 10% founder equity increase")
    assert_eq(s.shares.sharePrice, 10.5, "Buyback 10% share price boost (+5%)")
    assert_eq(s.shares.sentiment, 58, "Buyback 10% sentiment boost (+8)")
end

-- 1.4 Non-standard Tier Fallback
do
    local s = createTestState({ cash = 2000, price = 10, floatPct = 20, founder = 70 })
    -- tierPct = 7 -> invalid tier -> should fallback to 5%
    local ok, cost, msg = StockSystem.BuyBack(s, 7, 100)
    assert_true(ok, "Buyback with invalid tier 7 should fallback to 5% and succeed")
    assert_eq(cost, 510, "Fallback tier cost should match 5% tier")
    assert_eq(s.shares.floatPct, 15, "Fallback tier floatPct should reduce by 5%")
end

print("\\n[Test Group 2] Reserve Limit Enforcement Boundaries:")

-- 2.1 Cash == cost + reserveLimit (Exact boundary: should PASS)
do
    -- price = 10, tier = 5% -> cost = 510. reserveLimit = 100.
    -- required cash = 510 + 100 = 610.
    local s = createTestState({ cash = 610, price = 10, floatPct = 20 })
    local ok, cost, msg = StockSystem.BuyBack(s, 5, 100)
    assert_true(ok, "Cash == cost + reserveLimit (610) MUST SUCCEED")
    assert_eq(s.company.cash, 100, "Cash after buyback must exactly equal reserveLimit")
end

-- 2.2 Cash == cost + reserveLimit - 1 (Exact boundary: MUST FAIL)
do
    local s = createTestState({ cash = 609, price = 10, floatPct = 20 })
    local ok, cost, msg = StockSystem.BuyBack(s, 5, 100)
    assert_false(ok, "Cash == cost + reserveLimit - 1 (609) MUST FAIL")
    assert_eq(cost, 0, "Failed buyback returns 0 cost")
    assert_eq(s.company.cash, 609, "Cash must remain unchanged on failure")
end

-- 2.3 Custom Reserve Limit
do
    -- cost = 306, reserveLimit = 250 -> required = 556
    local s1 = createTestState({ cash = 556, price = 10, floatPct = 20 })
    local ok1 = StockSystem.BuyBack(s1, 3, 250)
    assert_true(ok1, "Custom reserve limit pass boundary (cash=556, limit=250)")
    assert_eq(s1.company.cash, 250, "Remaining cash equals custom limit 250")

    local s2 = createTestState({ cash = 555, price = 10, floatPct = 20 })
    local ok2 = StockSystem.BuyBack(s2, 3, 250)
    assert_false(ok2, "Custom reserve limit fail boundary (cash=555, limit=250)")
end

-- 2.4 Default Reserve Limit (when nil)
do
    -- default reserveLimit is 100
    local s1 = createTestState({ cash = 610, price = 10, floatPct = 20 })
    local ok1 = StockSystem.BuyBack(s1, 5, nil)
    assert_true(ok1, "Default reserveLimit (100) passes at cash 610")

    local s2 = createTestState({ cash = 609, price = 10, floatPct = 20 })
    local ok2 = StockSystem.BuyBack(s2, 5, nil)
    assert_false(ok2, "Default reserveLimit (100) fails at cash 609")
end

print("\\n[Test Group 3] Float Minimum Bound (2%) & Clamping:")

-- 3.1 Float is already at minimum bound 2%
do
    local s = createTestState({ cash = 2000, price = 10, floatPct = 2 })
    local ok3, _, _ = StockSystem.BuyBack(s, 3, 100)
    assert_false(ok3, "Buyback 3% with float at 2% must fail")

    local ok5, _, _ = StockSystem.BuyBack(s, 5, 100)
    assert_false(ok5, "Buyback 5% with float at 2% must fail")

    local ok10, _, _ = StockSystem.BuyBack(s, 10, 100)
    assert_false(ok10, "Buyback 10% with float at 2% must fail")
end

-- 3.2 Exact Float boundary: float == tierPct + 2 (Should PASS, ending at 2%)
do
    -- tier = 3%, floatPct = 5% (5 < 3+2 is false) -> PASSES
    local s3 = createTestState({ cash = 2000, price = 10, floatPct = 5 })
    local ok3 = StockSystem.BuyBack(s3, 3, 100)
    assert_true(ok3, "Float == 3 + 2 (5%) MUST PASS")
    assert_eq(s3.shares.floatPct, 2, "FloatPct ends exactly at 2%")

    -- tier = 5%, floatPct = 7% (7 < 5+2 is false) -> PASSES
    local s5 = createTestState({ cash = 2000, price = 10, floatPct = 7 })
    local ok5 = StockSystem.BuyBack(s5, 5, 100)
    assert_true(ok5, "Float == 5 + 2 (7%) MUST PASS")
    assert_eq(s5.shares.floatPct, 2, "FloatPct ends exactly at 2%")

    -- tier = 10%, floatPct = 12% (12 < 10+2 is false) -> PASSES
    local s10 = createTestState({ cash = 2000, price = 10, floatPct = 12 })
    local ok10 = StockSystem.BuyBack(s10, 10, 100)
    assert_true(ok10, "Float == 10 + 2 (12%) MUST PASS")
    assert_eq(s10.shares.floatPct, 2, "FloatPct ends exactly at 2%")
end

-- 3.3 Float just below requirement: float < tierPct + 2 (Must FAIL)
do
    local s3 = createTestState({ cash = 2000, price = 10, floatPct = 4.9 })
    local ok3 = StockSystem.BuyBack(s3, 3, 100)
    assert_false(ok3, "Float 4.9% with tier 3% must fail")

    local s5 = createTestState({ cash = 2000, price = 10, floatPct = 6.9 })
    local ok5 = StockSystem.BuyBack(s5, 5, 100)
    assert_false(ok5, "Float 6.9% with tier 5% must fail")

    local s10 = createTestState({ cash = 2000, price = 10, floatPct = 11.9 })
    local ok10 = StockSystem.BuyBack(s10, 10, 100)
    assert_false(ok10, "Float 11.9% with tier 10% must fail")
end

print("\\n[Test Group 4] Founder Equity Clamping at 100%:")

-- 4.1 Founder 95% + 10% tier -> 100%
do
    local s = createTestState({ cash = 2000, price = 10, floatPct = 20, founder = 95 })
    local ok = StockSystem.BuyBack(s, 10, 100)
    assert_true(ok, "Buyback succeeds")
    assert_eq(s.shares.founder, 100, "Founder equity clamped at 100% (was 95+10)")
end

-- 4.2 Founder 98% + 3% tier -> 100%
do
    local s = createTestState({ cash = 2000, price = 10, floatPct = 20, founder = 98 })
    local ok = StockSystem.BuyBack(s, 3, 100)
    assert_true(ok, "Buyback succeeds")
    assert_eq(s.shares.founder, 100, "Founder equity clamped at 100% (was 98+3)")
end

-- 4.3 Founder already 100% -> stays 100%
do
    local s = createTestState({ cash = 2000, price = 10, floatPct = 20, founder = 100 })
    local ok = StockSystem.BuyBack(s, 5, 100)
    assert_true(ok, "Buyback succeeds")
    assert_eq(s.shares.founder, 100, "Founder equity remains 100%")
end

print("\\n[Test Group 5] Buyback Cooldown Across Weeks:")

-- 5.1 Immediate buyback in same week fails
do
    local s = createTestState({ cash = 3000, price = 10, floatPct = 25, week = 1 })
    local ok1 = StockSystem.BuyBack(s, 3, 100)
    assert_true(ok1, "First buyback week 1 succeeds")

    -- Second attempt in same week
    local ok2, _, msg2 = StockSystem.BuyBack(s, 3, 100)
    assert_false(ok2, "Second buyback week 1 fails")
    assert_true(string.find(msg2, "冷却中") ~= nil, "Cooldown message returned")

    -- Week 2: week - lastBuy = 1 < 2 -> fails
    s.company.week = 2
    local ok3, _, msg3 = StockSystem.BuyBack(s, 3, 100)
    assert_false(ok3, "Buyback week 2 (1 week elapsed) fails")

    -- Week 3: week - lastBuy = 2 >= 2 -> succeeds
    s.company.week = 3
    local ok4, _, msg4 = StockSystem.BuyBack(s, 3, 100)
    assert_true(ok4, "Buyback week 3 (2 weeks elapsed) SUCCEEDS")
    assert_eq(s.shares.lastBuybackWeek, 3, "lastBuybackWeek updated to 3")
end

-- 5.2 Unlisted company buyback
do
    local s = createTestState({ public = false })
    local ok, _, msg = StockSystem.BuyBack(s, 5, 100)
    assert_false(ok, "Unlisted company buyback must fail")
    assert_eq(msg, "尚未上市", "Correct unlisted message")
end

-- -----------------------------------------------------------------------------
-- SECTION 2: IR / PR CAMPAIGN MECHANICS
-- -----------------------------------------------------------------------------
print("\\n[Test Group 6] IR/PR Campaigns Normal Boosts (Sentiment <= 80, Credibility >= 40):")

-- 6.1 Press Briefing (briefing)
do
    local s = createTestState({ cash = 1000, price = 10, sentiment = 50, credibility = 70 })
    -- cost = 30, cd = 2, sentimentDelta = +5, cred = +2, priceBoost = 0
    local ok, msg, res = StockSystem.RunIrCampaign(s, "briefing")
    assert_true(ok, "Briefing should succeed")
    assert_eq(s.company.cash, 1000 - 30, "Briefing cash deduction")
    assert_eq(s.shares.sentiment, 55, "Briefing sentiment +5")
    assert_eq(s.shares.credibility, 72, "Briefing credibility +2")
    assert_eq(s.shares.sharePrice, 10, "Briefing sharePrice unchanged")
    assert_eq(s.shares.irCooldowns["briefing"], 2, "Briefing cooldown set to 2")
    assert_eq(res.sentiment, 55, "Result table sentiment")
    assert_eq(res.credibility, 72, "Result table credibility")
end

-- 6.2 Investor Roadshow (roadshow)
do
    local s = createTestState({ cash = 1000, price = 10, sentiment = 50, credibility = 70 })
    -- cost = 80, cd = 4, sentimentDelta = +12, cred = +1, priceBoost = +3%
    -- sharePrice: floor(10 * 1.03 * 10 + 0.5) / 10 = 10.3
    local ok, msg, res = StockSystem.RunIrCampaign(s, "roadshow")
    assert_true(ok, "Roadshow should succeed")
    assert_eq(s.company.cash, 1000 - 80, "Roadshow cash deduction")
    assert_eq(s.shares.sentiment, 62, "Roadshow sentiment +12")
    assert_eq(s.shares.credibility, 71, "Roadshow credibility +1")
    assert_eq(s.shares.sharePrice, 10.3, "Roadshow sharePrice +3%")
    assert_eq(s.shares.irCooldowns["roadshow"], 4, "Roadshow cooldown set to 4")
end

-- 6.3 Strategic PR Blitz (blitz)
do
    local s = createTestState({ cash = 1000, price = 10, sentiment = 50, credibility = 70 })
    -- cost = 200, cd = 6, sentimentDelta = +25, cred = -2, priceBoost = +8%
    -- sharePrice: floor(10 * 1.08 * 10 + 0.5) / 10 = 10.8
    local ok, msg, res = StockSystem.RunIrCampaign(s, "blitz")
    assert_true(ok, "Blitz should succeed")
    assert_eq(s.company.cash, 1000 - 200, "Blitz cash deduction")
    assert_eq(s.shares.sentiment, 75, "Blitz sentiment +25")
    assert_eq(s.shares.credibility, 68, "Blitz credibility -2")
    assert_eq(s.shares.sharePrice, 10.8, "Blitz sharePrice +8%")
    assert_eq(s.shares.irCooldowns["blitz"], 6, "Blitz cooldown set to 6")
end

print("\\n[Test Group 7] IR/PR Cooldown Enforcement & Weekly Decrement:")

-- 7.1 Immediate re-run in same week fails
do
    local s = createTestState({ cash = 2000, sentiment = 50, credibility = 70 })
    local ok1 = StockSystem.RunIrCampaign(s, "briefing")
    assert_true(ok1, "First briefing succeeds")
    local ok2, msg2 = StockSystem.RunIrCampaign(s, "briefing")
    assert_false(ok2, "Second briefing in same week fails")
    assert_true(string.find(msg2, "冷却中") ~= nil, "Cooldown message received")
end

-- 7.2 Independent Cooldowns (Running briefing does NOT block roadshow)
do
    local s = createTestState({ cash = 2000, sentiment = 50, credibility = 70 })
    local okB = StockSystem.RunIrCampaign(s, "briefing")
    assert_true(okB, "Briefing succeeds")
    local okR = StockSystem.RunIrCampaign(s, "roadshow")
    assert_true(okR, "Roadshow can run in same week as briefing (independent cooldowns)")
    assert_eq(s.shares.irCooldowns["briefing"], 2, "Briefing cooldown is 2")
    assert_eq(s.shares.irCooldowns["roadshow"], 4, "Roadshow cooldown is 4")
end

-- 7.3 Cooldown Progression via StockSystem.ProcessWeek
do
    local s = createTestState({ cash = 2000, sentiment = 50, credibility = 70 })
    StockSystem.RunIrCampaign(s, "briefing") -- cd = 2
    assert_eq(s.shares.irCooldowns["briefing"], 2, "Initial cd = 2")

    -- Week 1 -> ProcessWeek
    StockSystem.ProcessWeek(s, true)
    assert_eq(s.shares.irCooldowns["briefing"], 1, "Week 1 cd decremented to 1")
    local ok1, msg1 = StockSystem.RunIrCampaign(s, "briefing")
    assert_false(ok1, "Cannot run when cd = 1")

    -- Week 2 -> ProcessWeek
    StockSystem.ProcessWeek(s, true)
    assert_eq(s.shares.irCooldowns["briefing"], 0, "Week 2 cd decremented to 0")
    local ok2 = StockSystem.RunIrCampaign(s, "briefing")
    assert_true(ok2, "Can run when cd = 0")
end

-- 7.4 Blitz Cooldown Progression (6 weeks)
do
    local s = createTestState({ cash = 3000, sentiment = 50, credibility = 70 })
    StockSystem.RunIrCampaign(s, "blitz") -- cd = 6
    assert_eq(s.shares.irCooldowns["blitz"], 6, "Initial blitz cd = 6")

    for w = 1, 5 do
        StockSystem.ProcessWeek(s, true)
        assert_eq(s.shares.irCooldowns["blitz"], 6 - w, "Blitz cd after week " .. w)
        local ok = StockSystem.RunIrCampaign(s, "blitz")
        assert_false(ok, "Blitz blocked on week " .. w)
    end

    -- Week 6: decrements to 0
    StockSystem.ProcessWeek(s, true)
    assert_eq(s.shares.irCooldowns["blitz"], 0, "Blitz cd reaches 0")
    local okFinal = StockSystem.RunIrCampaign(s, "blitz")
    assert_true(okFinal, "Blitz succeeds after 6 weeks")
end

print("\\n[Test Group 8] Diminishing Returns when Sentiment > 80:")

-- 8.1 Boundary: Sentiment == 80 (Normal) vs 81 (Diminishing)
do
    -- At sentiment 80: Normal execution
    local s80 = createTestState({ cash = 1000, price = 10, sentiment = 80, credibility = 70 })
    local ok80, msg80, res80 = StockSystem.RunIrCampaign(s80, "briefing")
    assert_true(ok80, "Briefing at 80 sentiment succeeds")
    assert_eq(s80.shares.sentiment, 85, "Normal delta +5 applies at 80 sentiment")
    assert_eq(s80.shares.credibility, 72, "Normal cred +2 applies at 80 sentiment")

    -- At sentiment 81: Diminishing returns triggered
    -- actualSent = floor(5 * 0.5) = 2 -> 81 + 2 = 83
    -- cred penalty: 70 - 3 = 67
    local s81 = createTestState({ cash = 1000, price = 10, sentiment = 81, credibility = 70 })
    local ok81, msg81, res81 = StockSystem.RunIrCampaign(s81, "briefing")
    assert_true(ok81, "Briefing at 81 sentiment succeeds with diminishing returns")
    assert_true(string.find(msg81, "边际递减") ~= nil, "Message indicates diminishing returns")
    assert_eq(s81.shares.sentiment, 83, "Halved delta +2 applies at 81 sentiment")
    assert_eq(s81.shares.credibility, 67, "Credibility penalty -3 applies (70 -> 67)")
end

-- 8.2 Diminishing returns for Roadshow (priceBoost halved)
do
    local s = createTestState({ cash = 1000, price = 10, sentiment = 85, credibility = 70 })
    local ok, msg, res = StockSystem.RunIrCampaign(s, "roadshow")
    assert_true(ok, "Roadshow succeeds")
    assert_eq(s.shares.sentiment, 91, "Roadshow halved sentiment (+6)")
    assert_eq(s.shares.credibility, 67, "Roadshow cred penalty (-3)")
    -- price boost halved: 0.03 * 0.5 = 0.015 -> In IEEE 754, 10 * 1.015 * 10 + 0.5 = 101.99999999999999 -> floor evaluates to 101 -> 10.1
    local expectedRoadshowPrice = math.floor(10 * (1 + 0.03 * 0.5) * 10 + 0.5) / 10
    assert_eq(s.shares.sharePrice, expectedRoadshowPrice, "Roadshow halved price boost matches formula (10.1 due to IEEE 754)")
end

-- 8.3 Diminishing returns for Blitz (priceBoost halved)
do
    local s = createTestState({ cash = 1000, price = 10, sentiment = 85, credibility = 70 })
    -- actualSent = floor(25 * 0.5) = 12 -> sentiment = 85 + 12 = 97
    -- cred penalty: 70 - 3 = 67
    -- price boost halved: 0.08 * 0.5 = 0.04 -> floor(10 * 1.04 * 10 + 0.5) / 10 = 10.4
    local ok, msg, res = StockSystem.RunIrCampaign(s, "blitz")
    assert_true(ok, "Blitz succeeds")
    assert_eq(s.shares.sentiment, 97, "Blitz halved sentiment (+12)")
    assert_eq(s.shares.credibility, 67, "Blitz cred penalty (-3)")
    assert_eq(s.shares.sharePrice, 10.4, "Blitz halved price boost (+4% -> 10.4)")
end

print("\\n[Test Group 9] Credibility Backfire Penalty when Credibility < 40:")

-- 9.1 Boundary: Credibility == 40 (Normal) vs 39 (Backfire for Blitz)
do
    -- Credibility = 40: Normal Blitz
    local s40 = createTestState({ cash = 1000, price = 10, sentiment = 50, credibility = 40 })
    local ok40, msg40, res40 = StockSystem.RunIrCampaign(s40, "blitz")
    assert_true(ok40, "Blitz at credibility 40 does NOT backfire")
    assert_eq(s40.shares.sentiment, 75, "Normal sentiment boost")
    assert_eq(s40.shares.credibility, 38, "Normal cred change (-2)")

    -- Credibility = 39: Backfire triggers!
    -- cash deducted: 1000 - 200 = 800
    -- cd set to 6
    -- price: floor(10 * 0.95 * 10 + 0.5) / 10 = 9.5 (-5%)
    -- cred: 39 - 5 = 34
    -- sentiment: 50 - 10 = 40
    local s39 = createTestState({ cash = 1000, price = 10, sentiment = 50, credibility = 39 })
    local ok39, msg39, res39 = StockSystem.RunIrCampaign(s39, "blitz")
    assert_false(ok39, "Blitz at credibility 39 MUST RETURN FALSE (backfire)")
    assert_true(string.find(msg39, "反噬") ~= nil, "Backfire message received")
    assert_eq(res39.backfire, true, "Result table backfire flag")
    assert_eq(s39.company.cash, 800, "Cash deducted even on backfire")
    assert_eq(s39.shares.irCooldowns["blitz"], 6, "Cooldown set even on backfire")
    assert_eq(s39.shares.sharePrice, 9.5, "Price dropped 5% on backfire")
    assert_eq(s39.shares.credibility, 34, "Credibility dropped by 5 on backfire")
    assert_eq(s39.shares.sentiment, 40, "Sentiment dropped by 10 on backfire")
end

-- 9.2 Briefing & Roadshow at Credibility < 40 (Do NOT backfire)
do
    local sB = createTestState({ cash = 1000, price = 10, sentiment = 50, credibility = 35 })
    local okB = StockSystem.RunIrCampaign(sB, "briefing")
    assert_true(okB, "Briefing at credibility 35 does NOT backfire (safe press communication)")
    assert_eq(sB.shares.credibility, 37, "Briefing raises credibility from 35 to 37")

    local sR = createTestState({ cash = 1000, price = 10, sentiment = 50, credibility = 35 })
    local okR = StockSystem.RunIrCampaign(sR, "roadshow")
    assert_true(okR, "Roadshow at credibility 35 does NOT backfire")
    assert_eq(sR.shares.credibility, 36, "Roadshow raises credibility from 35 to 36")
end

print("\\n[Test Group 10] Boundary Clamping & Attack Vectors:")

-- 10.1 Sentiment clamping at 100
do
    local s = createTestState({ cash = 2000, sentiment = 98, credibility = 70 })
    -- Diminishing returns (sent > 80): delta = floor(25 * 0.5) = 12 -> 98 + 12 = 110 -> clamp 100
    local ok = StockSystem.RunIrCampaign(s, "blitz")
    assert_true(ok, "Blitz succeeds")
    assert_eq(s.shares.sentiment, 100, "Sentiment clamped at 100 (not 110)")
end

-- 10.2 Sentiment clamping at 0 (Backfire on low sentiment)
do
    local s = createTestState({ cash = 2000, sentiment = 5, credibility = 30 })
    -- Backfire: sentiment -10 -> 5 - 10 = -5 -> clamp 0
    local ok = StockSystem.RunIrCampaign(s, "blitz")
    assert_false(ok, "Backfire triggered")
    assert_eq(s.shares.sentiment, 0, "Sentiment clamped at 0 (not negative)")
end

-- 10.3 Credibility clamping at 0
do
    local s = createTestState({ cash = 2000, sentiment = 50, credibility = 2 })
    -- Backfire: cred -5 -> 2 - 5 = -3 -> clamp 0
    local ok = StockSystem.RunIrCampaign(s, "blitz")
    assert_false(ok, "Backfire triggered")
    assert_eq(s.shares.credibility, 0, "Credibility clamped at 0 (not negative)")
end

-- 10.4 Credibility clamping at 100
do
    local s = createTestState({ cash = 2000, sentiment = 50, credibility = 99 })
    -- Briefing: cred +2 -> 99 + 2 = 101 -> clamp 100
    local ok = StockSystem.RunIrCampaign(s, "briefing")
    assert_true(ok, "Briefing succeeds")
    assert_eq(s.shares.credibility, 100, "Credibility clamped at 100 (not 101)")
end

-- 10.5 Cash insufficiency for all 3 campaigns
do
    local sB = createTestState({ cash = 29 })
    local okB, msgB = StockSystem.RunIrCampaign(sB, "briefing")
    assert_false(okB, "Briefing fails when cash < 30")
    assert_eq(sB.company.cash, 29, "Cash unchanged")

    local sR = createTestState({ cash = 79 })
    local okR, msgR = StockSystem.RunIrCampaign(sR, "roadshow")
    assert_false(okR, "Roadshow fails when cash < 80")
    assert_eq(sR.company.cash, 79, "Cash unchanged")

    local sZ = createTestState({ cash = 199 })
    local okZ, msgZ = StockSystem.RunIrCampaign(sZ, "blitz")
    assert_false(okZ, "Blitz fails when cash < 200")
    assert_eq(sZ.company.cash, 199, "Cash unchanged")
end

-- 10.6 Unknown campaign ID
do
    local s = createTestState({ cash = 2000 })
    local ok, msg = StockSystem.RunIrCampaign(s, "nonexistent_campaign")
    assert_false(ok, "Unknown campaign ID fails")
    assert_true(string.find(msg, "未知公关活动") ~= nil, "Unknown campaign message returned")
end

-- 10.7 Unlisted company IR campaign
do
    local s = createTestState({ public = false })
    local ok, msg = StockSystem.RunIrCampaign(s, "briefing")
    assert_false(ok, "Unlisted company IR campaign fails")
    assert_eq(msg, "尚未上市", "Correct unlisted message")
end

print("\\n[Test Group 11] Monte Carlo Property-Based Fuzzing (500 Buyback + 500 IR):")

-- 11.1 500 Randomized BuyBack property invariant checks
do
    local buybackSuccessCount = 0
    local buybackFailCount = 0
    for i = 1, 500 do
        local initCash = math.random(-200, 5000)
        local initPrice = math.random(5, 100) / 10
        local initFloat = math.random(0, 50)
        local initFounder = math.random(20, 100)
        local initSentiment = math.random(0, 100)
        local reserveLimit = math.random(50, 300)
        local tierChoices = { 3, 5, 10, 4, 7, 0, -1 }
        local tier = tierChoices[math.random(#tierChoices)]

        local s = createTestState({
            cash = initCash,
            price = initPrice,
            floatPct = initFloat,
            founder = initFounder,
            sentiment = initSentiment,
            week = math.random(1, 48),
            lastBuybackWeek = 0
        })

        local ok, cost, msg = StockSystem.BuyBack(s, tier, reserveLimit)
        if ok then
            buybackSuccessCount = buybackSuccessCount + 1
            -- Invariant checks for success
            assert_true(s.company.cash == initCash - cost, "Invariant: cash deducted by cost")
            assert_true(s.company.cash >= reserveLimit, "Invariant: cash preserves reserveLimit")
            assert_true(s.shares.floatPct >= 2, "Invariant: floatPct never below 2%")
            assert_true(s.shares.founder <= 100, "Invariant: founder never exceeds 100%")
            assert_true(s.shares.founder >= initFounder, "Invariant: founder equity increased")
            assert_true(s.shares.sharePrice >= initPrice, "Invariant: share price boosted")
            assert_true(s.shares.sentiment <= 100, "Invariant: sentiment clamped at 100")
        else
            buybackFailCount = buybackFailCount + 1
            -- Invariant checks for failure: state unmodified
            assert_true(s.company.cash == initCash, "Invariant on fail: cash unchanged")
            assert_true(s.shares.floatPct == initFloat, "Invariant on fail: floatPct unchanged")
            assert_true(s.shares.founder == initFounder, "Invariant on fail: founder unchanged")
            assert_true(s.shares.sharePrice == initPrice, "Invariant on fail: price unchanged")
            assert_true(s.shares.sentiment == initSentiment, "Invariant on fail: sentiment unchanged")
            assert_eq(cost, 0, "Invariant on fail: cost returned is 0")
        end
    end
    print(string.format("  * BuyBack Fuzzing complete: %d successes, %d rejected under boundary rules", buybackSuccessCount, buybackFailCount))
end

-- 11.2 500 Randomized IR Campaign property invariant checks
do
    local irSuccessCount = 0
    local irFailCount = 0
    local irBackfireCount = 0
    local campaigns = { "briefing", "roadshow", "blitz", "invalid_id" }

    for i = 1, 500 do
        local initCash = math.random(0, 3000)
        local initPrice = math.random(10, 200) / 10
        local initSentiment = math.random(0, 100)
        local initCredibility = math.random(0, 100)
        local campaignId = campaigns[math.random(#campaigns)]

        local s = createTestState({
            cash = initCash,
            price = initPrice,
            sentiment = initSentiment,
            credibility = initCredibility,
            week = math.random(1, 48),
        })

        local ok, msg, res = StockSystem.RunIrCampaign(s, campaignId)
        if ok then
            irSuccessCount = irSuccessCount + 1
            local cfg = StockSystem.IR_CAMPAIGNS[campaignId]
            assert_true(s.company.cash == initCash - cfg.cost, "IR Invariant: cash deducted")
            assert_true(s.shares.sentiment >= 0 and s.shares.sentiment <= 100, "IR Invariant: sentiment in [0, 100]")
            assert_true(s.shares.credibility >= 0 and s.shares.credibility <= 100, "IR Invariant: credibility in [0, 100]")
            assert_true(s.shares.irCooldowns[campaignId] == cfg.cooldown, "IR Invariant: cooldown set")
        elseif res and res.backfire then
            irBackfireCount = irBackfireCount + 1
            assert_true(initCredibility < 40 and campaignId == "blitz", "Backfire only on blitz with cred < 40")
            assert_true(s.company.cash == initCash - 200, "Backfire Invariant: cash deducted")
            assert_true(s.shares.sentiment >= 0 and s.shares.sentiment <= 100, "Backfire Invariant: sentiment in [0, 100]")
            assert_true(s.shares.credibility >= 0 and s.shares.credibility <= 100, "Backfire Invariant: credibility in [0, 100]")
        else
            irFailCount = irFailCount + 1
            -- On rejection (cooldown, insufficient cash, invalid ID), state must be untouched
            assert_true(s.company.cash == initCash, "IR fail Invariant: cash untouched")
            assert_true(s.shares.sentiment == initSentiment, "IR fail Invariant: sentiment untouched")
            assert_true(s.shares.credibility == initCredibility, "IR fail Invariant: credibility untouched")
            assert_true(s.shares.sharePrice == initPrice, "IR fail Invariant: price untouched")
        end
    end
    print(string.format("  * IR Campaign Fuzzing complete: %d successes, %d backfires, %d rejected under boundary rules", irSuccessCount, irBackfireCount, irFailCount))
end

print("\\n[Test Group 12] Season Boundary Transition Vulnerability Verification:")

-- 12.1 Cross-Season Buyback Cooldown Rollover Bug
do
    -- Scenario: Player executes BuyBack in Week 48 of Season 1
    local s = createTestState({ cash = 5000, price = 10, floatPct = 25, founder = 70, week = 48 })
    local ok1, cost1, msg1 = StockSystem.BuyBack(s, 5, 100)
    assert_true(ok1, "Season 1 Week 48 Buyback succeeds")
    assert_eq(s.shares.lastBuybackWeek, 48, "lastBuybackWeek is 48")

    -- New season begins: CompanyState.StartNewSeason resets week to 1
    s.company.week = 1

    -- In Season 2 Week 1: 1 week has passed in real time
    local ok2, cost2, msg2 = StockSystem.BuyBack(s, 5, 100)
    -- BUG DISCOVERY ASSERTION:
    -- Under current code: week - lastBuy = 1 - 48 = -47 < 2
    -- wait = 2 - (-47) = 49 weeks!
    -- This falsely locks out the player for 49 weeks instead of 1 week!
    assert_false(ok2, "EMPIRICAL BUG CONFIRMED: Cross-season week subtraction falsely blocks buyback")
    assert_true(string.find(msg2, "49 周") ~= nil, "EMPIRICAL BUG CONFIRMED: Falsely reports 49 weeks waiting time")
    print("  ⚠️ [CONFIRMED VULNERABILITY] Cross-season week rollover causes StockSystem.BuyBack to lock out for 49 weeks!")
end


print("--------------------------------------------------------------------")
print(string.format("RESULTS: %d / %d tests passed (%d failures)", passedTests, totalTests, failedTests))
print("====================================================================")

if failedTests > 0 then
    error(string.format("%d empirical assertions failed!", failedTests))
end
`;

console.log('Running Challenger M1.1 Automated Empirical Verification Suite...');
if (lauxlib.luaL_dostring(L, to_luastring(testLuaSource)) !== lua.LUA_OK) {
  const err = to_jsstring(lua.lua_tostring(L, -1));
  console.error('\n❌ TEST RUNNER ERROR / ASSERTION FAILURE:\n', err);
  process.exit(1);
} else {
  console.log('\n✅ ALL CHALLENGER EMPIRICAL VERIFICATION TESTS PASSED!');
  process.exit(0);
}
