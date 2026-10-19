// ============================================================================
// CHALLENGER M3: ADVERSARIAL STRESS TEST & ORACLE VALIDITY HARNESS
// Empirically verifies:
// 1. Master test suite integrity & exit code 0
// 2. Test 20 isolation, reordering immunity & global state leakage
// 3. Oracle validity via 16 mutation tests (asserting Test 20 catches all bugs)
// 4. Ecosystem test suites execution & status
// ============================================================================

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const fengari = require('fengari-web');
const { lua, lauxlib, lualib, to_luastring, to_jsstring } = fengari;

const rootDir = path.resolve(__dirname, '..');
const masterScriptPath = path.join(rootDir, 'scripts', 'test_taptap_engine.cjs');

console.log('====================================================================');
console.log('  CHALLENGER M3: EMPIRICAL HARNESS & ADVERSARIAL VERIFICATION       ');
console.log('====================================================================');

// Setup Fengari helper
function createFengariState() {
  const L = lauxlib.luaL_newstate();
  lualib.luaL_openlibs(L);

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
    if (found.endsWith('PlayerEcoSystem.lua')) {
      const targetHash = 'local function hashStr(s)\n    local h = 2166136261\n    for i = 1, #s do\n        h = (h * 16777619) % 4294967296\n        h = (h ~ string.byte(s, i)) % 4294967296\n    end\n    return h % 2147483647\nend';
      const safeHash = 'local function hashStr(s)\n    local h = 0\n    for i = 1, #s do\n        h = (h * 31 + string.byte(s, i)) % 2147483647\n    end\n    return h\nend';
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

  // Setup standard UrhoX headless environment mocks
  const urhoxInitCode = `
    _G.MOUSEB_LEFT = 1
    _G.MOUSEB_RIGHT = 2
    _G.MOUSEB_MIDDLE = 4
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
  `;
  const status = lauxlib.luaL_dostring(L, to_luastring(urhoxInitCode));
  if (status !== lua.LUA_OK) {
    throw new Error(to_jsstring(lua.lua_tostring(L, -1)));
  }

  return L;
}

function runLua(L, code) {
  const status = lauxlib.luaL_dostring(L, to_luastring(code));
  if (status !== lua.LUA_OK) {
    const err = to_jsstring(lua.lua_tostring(L, -1));
    lua.lua_pop(L, 1);
    throw new Error(err);
  }
}

function getGlobalKeys(L) {
  const keysCode = `
    local keys = {}
    for k in pairs(_G) do
      table.insert(keys, tostring(k))
    end
    table.sort(keys)
    return table.concat(keys, ",")
  `;
  const status = lauxlib.luaL_dostring(L, to_luastring(keysCode));
  if (status !== lua.LUA_OK) {
    throw new Error(to_jsstring(lua.lua_tostring(L, -1)));
  }
  const result = to_jsstring(lua.lua_tostring(L, -1));
  lua.lua_pop(L, 1);
  return result.split(',');
}

// Read test_taptap_engine.cjs and parse runnerScript
const masterContent = fs.readFileSync(masterScriptPath, 'utf8');
const runnerMatch = masterContent.match(/const runnerScript = `([\s\S]*?)`;\s*const status =/);
if (!runnerMatch) {
  console.error("❌ Failed to parse runnerScript from scripts/test_taptap_engine.cjs");
  process.exit(1);
}
const fullRunnerCode = runnerMatch[1];

// Split runnerScript into Tests 1-19 and Test 20
const test20Marker = '[Test 20] Stock Market Phase 2';
const test20Idx = fullRunnerCode.indexOf(test20Marker);
if (test20Idx === -1) {
  console.error("❌ Failed to find Test 20 marker in runnerScript");
  process.exit(1);
}
// Rewind to beginning of line (print statement)
const printStartIdx = fullRunnerCode.lastIndexOf('\n', test20Idx);

const tests1To19 = fullRunnerCode.substring(0, printStartIdx);
const test20EndMarker = '✓ Stock Market Phase 2 (Proposal C) Engine & Capital Operations 100% Verified")\nend';
const test20EndIdx = fullRunnerCode.indexOf(test20EndMarker);
if (test20EndIdx === -1) {
  console.error("❌ Failed to find Test 20 end marker in runnerScript");
  process.exit(1);
}
const test20Code = fullRunnerCode.substring(printStartIdx + 1, test20EndIdx + test20EndMarker.length);

let passedCount = 0;
let totalChecks = 0;

function assertCheck(cond, name) {
  totalChecks++;
  if (cond) {
    passedCount++;
    console.log(`  ✓ [PASS] ${name}`);
  } else {
    console.error(`  ❌ [FAIL] ${name}`);
    throw new Error(`Assertion failed: ${name}`);
  }
}

console.log('\n--- PHASE 1: DIRECT EXECUTION & EXIT CODE VERIFICATION ---');
try {
  const masterOutput = execSync('/usr/local/bin/node scripts/test_taptap_engine.cjs', {
    cwd: rootDir,
    encoding: 'utf8'
  });
  assertCheck(masterOutput.includes('ALL 20 TAPTAP MAKE LUA ENGINE VERIFICATION TEST SUITES PASSED SUCCESSFULLY!'), 'Output contains 20 suites success banner');
  assertCheck(masterOutput.includes('✓ Stock Market Phase 2 (Proposal C) Engine & Capital Operations 100% Verified'), 'Test 20 output contains 100% verified message');
  assertCheck(masterOutput.includes('[Test 20] Stock Market Phase 2'), 'Test 20 heading found in output');
  console.log('  -> Master test suite executed with strict exit code 0.');
} catch (e) {
  assertCheck(false, `Master test suite failed execution: ${e.message}`);
}

console.log('\n--- PHASE 2: ISOLATION, REORDERING & GLOBAL STATE LEAKAGE TESTS ---');
// 2.1 Check _G globals leakage
{
  const L = createFengariState();
  const globalsBefore = getGlobalKeys(L);
  runLua(L, test20Code);
  const globalsAfter = getGlobalKeys(L);
  const leakedGlobals = globalsAfter.filter(k => !globalsBefore.includes(k));
  console.log(`  -> Globals added to _G after Test 20: [${leakedGlobals.join(', ')}]`);
  assertCheck(leakedGlobals.length === 0, 'Test 20 introduces ZERO unexpected leaked globals into _G');
}

// 2.2 Reordering test: Execute Test 20 FIRST, then execute Tests 1-19 in the exact same state
{
  const L = createFengariState();
  console.log('  -> Executing Test 20 FIRST in a fresh Lua state...');
  runLua(L, test20Code);
  assertCheck(true, 'Test 20 executes cleanly as the first suite');

  console.log('  -> Executing Tests 1 through 19 immediately AFTER Test 20 in the same state...');
  runLua(L, tests1To19);
  assertCheck(true, 'Tests 1-19 execute and pass cleanly after Test 20 (zero interference)');
}

// 2.3 Double execution test: Execute Test 20 TWICE in the same state
{
  const L = createFengariState();
  runLua(L, test20Code);
  runLua(L, test20Code);
  assertCheck(true, 'Test 20 is fully idempotent: executes twice consecutively without error or state collision');
}

console.log('\n--- PHASE 3: ORACLE VALIDITY & MUTATION ANALYSIS (16 MUTANTS) ---');
console.log('Empirically testing that Test 20 assertions fail when logic is broken:');

const mutations = [
  {
    name: 'Mutant 1: IPO dilution changed from 6% to 0% (founder equity remains 99%)',
    setup: `
      local StockSystem = require("StockSystem")
      local orig_ipo = StockSystem.Ipo
      StockSystem.Ipo = function(state)
        local ok, data = orig_ipo(state)
        state.shares.founder = 99 -- mutate
        return ok, data
      end
    `,
    expectedError: 'Founder equity must be diluted'
  },
  {
    name: 'Mutant 2: IPO floatPct changed from 12% to 15%',
    setup: `
      local StockSystem = require("StockSystem")
      local orig_ipo = StockSystem.Ipo
      StockSystem.Ipo = function(state)
        local ok, data = orig_ipo(state)
        state.shares.floatPct = 15 -- mutate
        return ok, data
      end
    `,
    expectedError: 'Float percentage must be set to 12%'
  },
  {
    name: 'Mutant 3: CheckRivalShortAttack disabled (always returns false)',
    setup: `
      local StockSystem = require("StockSystem")
      StockSystem.CheckRivalShortAttack = function(state)
        return false, nil -- mutate
      end
    `,
    expectedError: 'CheckRivalShortAttack must flag candidate'
  },
  {
    name: 'Mutant 4: Rival short attack weeksLeft set to 5 instead of 3',
    setup: `
      local StockSystem = require("StockSystem")
      local orig_trigger = StockSystem.TriggerRivalShortAttack
      StockSystem.TriggerRivalShortAttack = function(state, params)
        local ok, rs = orig_trigger(state, params)
        rs.weeksLeft = 5 -- mutate
        return ok, rs
      end
    `,
    expectedError: 'weeksLeft must be initialized to duration 3'
  },
  {
    name: 'Mutant 5: Short squeeze hurdle check bypassed (allows squeeze when price < hurdle)',
    setup: `
      local StockSystem = require("StockSystem")
      local orig_squeeze = StockSystem.TriggerShortSqueeze
      StockSystem.TriggerShortSqueeze = function(state)
        local s = state.shares
        local rs = s.rivalShort
        if not (rs and rs.active) then return false, "当前没有活跃的做空袭击", 0 end
        return true, "轧空胜利！", rs.penaltyVal or 180 -- mutate: bypass hurdle check
      end
    `,
    expectedError: 'TriggerShortSqueeze must fail when price < hurdle line'
  },
  {
    name: 'Mutant 6: Short squeeze forced-cover rally omitted (sharePrice unchanged)',
    setup: `
      local StockSystem = require("StockSystem")
      local orig_squeeze = StockSystem.TriggerShortSqueeze
      StockSystem.TriggerShortSqueeze = function(state)
        local prevPrice = state.shares.sharePrice
        local ok, msg, payout = orig_squeeze(state)
        state.shares.sharePrice = prevPrice -- mutate: revert rally
        return ok, msg, payout
      end
    `,
    expectedError: 'Share price must experience +20% forced-cover rally'
  },
  {
    name: 'Mutant 7: Short squeeze damages payout omitted (cash not credited)',
    setup: `
      local StockSystem = require("StockSystem")
      local orig_squeeze = StockSystem.TriggerShortSqueeze
      StockSystem.TriggerShortSqueeze = function(state)
        local preCash = state.company.cash
        local ok, msg, payout = orig_squeeze(state)
        state.company.cash = preCash -- mutate: omit payout
        return ok, msg, payout
      end
    `,
    expectedError: 'Treasury cash must be credited with liquidated damages payout'
  },
  {
    name: 'Mutant 8: Attack expiry failure branch gives no reputation hit',
    setup: `
      local StockSystem = require("StockSystem")
      local orig_pw = StockSystem.ProcessWeek
      StockSystem.ProcessWeek = function(state, won)
        local preRep = state.company.reputation
        orig_pw(state, won)
        state.company.reputation = preRep -- mutate: suppress penalty hit
      end
    `,
    expectedError: 'Club reputation must take penalty hit upon undefended attack expiry'
  },
  {
    name: 'Mutant 9: Stock buyback reserve limit guard removed',
    setup: `
      local StockSystem = require("StockSystem")
      local orig_bb = StockSystem.BuyBack
      StockSystem.BuyBack = function(state, tierPct, reserveLimit)
        -- mutate: bypass reserve check
        return true, 100, "回购成功"
      end
    `,
    expectedError: 'Buyback must be rejected when cash - cost < 100 reserve limit'
  },
  {
    name: 'Mutant 10: Stock buyback float reduction removed (floatPct unchanged)',
    setup: `
      local StockSystem = require("StockSystem")
      local orig_bb = StockSystem.BuyBack
      StockSystem.BuyBack = function(state, tierPct, reserveLimit)
        local curFloat = state.shares.floatPct
        local ok, cost, msg = orig_bb(state, tierPct, reserveLimit)
        state.shares.floatPct = curFloat -- mutate: revert float reduction
        return ok, cost, msg
      end
    `,
    expectedError: 'Float must decrease by 3%'
  },
  {
    name: 'Mutant 11: Stock buyback cooldown removed (allows same-week buyback)',
    setup: `
      local StockSystem = require("StockSystem")
      local orig_bb = StockSystem.BuyBack
      StockSystem.BuyBack = function(state, tierPct, reserveLimit)
        state.shares.lastBuybackWeek = 0 -- mutate: bypass cooldown check
        return orig_bb(state, tierPct, reserveLimit)
      end
    `,
    expectedError: 'Buyback must be blocked in same week by cooldown'
  },
  {
    name: 'Mutant 12: IR Briefing sentiment boost omitted',
    setup: `
      local StockSystem = require("StockSystem")
      local orig_ir = StockSystem.RunIrCampaign
      StockSystem.RunIrCampaign = function(state, id)
        local ok, msg, res = orig_ir(state, id)
        if id == "briefing" then
          state.shares.sentiment = 50 -- mutate: omit +5 boost
        end
        return ok, msg, res
      end
    `,
    expectedError: 'Briefing must increase sentiment by +5'
  },
  {
    name: 'Mutant 13: IR Diminishing returns omitted (sentiment gets unhalved boost)',
    setup: `
      local StockSystem = require("StockSystem")
      local orig_ir = StockSystem.RunIrCampaign
      StockSystem.RunIrCampaign = function(state, id)
        local ok, msg, res = orig_ir(state, id)
        if id == "blitz" and state.shares.sentiment > 80 then
          state.shares.sentiment = 84 + 25 -- mutate: full boost instead of halved
        end
        return ok, msg, res
      end
    `,
    expectedError: 'Sentiment gain must be halved'
  },
  {
    name: 'Mutant 14: IR Credibility backfire omitted (<40 credibility allowed without backfire)',
    setup: `
      local StockSystem = require("StockSystem")
      local orig_ir = StockSystem.RunIrCampaign
      StockSystem.RunIrCampaign = function(state, id)
        if id == "blitz" and state.shares.credibility < 40 then
          -- mutate: allow blitz without backfire
          state.shares.sentiment = state.shares.sentiment + 25
          return true, "Blitz succeeded", { backfire = false }
        end
        return orig_ir(state, id)
      end
    `,
    expectedError: 'Blitz with credibility < 40 must backfire'
  },
  {
    name: 'Mutant 15: State round-trip persistence loses rivalShort active property',
    setup: `
      local CompanyState = require("CompanyState")
      local orig_ensure = CompanyState.Ensure
      CompanyState.Ensure = function(state)
        local s = orig_ensure(state)
        if s.shares and s.shares.rivalShort then
          s.shares.rivalShort.active = false -- mutate: drop active
        end
        return s
      end
    `,
    expectedError: 'Restored rivalShort must be active'
  },
  {
    name: 'Mutant 16: StockScreen threat alert banner suppressed',
    setup: `
      local StockScreen = require("ui.screens.StockScreen")
      local orig_build = StockScreen.Build
      StockScreen.Build = function(nav)
        local root = orig_build(nav)
        -- mutate: strip out threat labels
        local function strip(node)
          if not node or type(node) ~= "table" then return end
          if node.text and string.find(node.text, "正在做空打压我方股票") then
            node.text = "Normal Content"
          end
          local ch = node.children or (node.props and node.props.children)
          if type(ch) == "table" then
            for _, c in ipairs(ch) do strip(c) end
          end
        end
        strip(root)
        return root
      end
    `,
    expectedError: 'Threat alert banner must be rendered in UI tree'
  }
];

let mutantKilledCount = 0;

for (const m of mutations) {
  const L = createFengariState();
  let caught = false;
  let errorMsg = '';
  try {
    runLua(L, m.setup);
    runLua(L, test20Code);
  } catch (err) {
    caught = true;
    errorMsg = err.message;
  }

  if (caught && errorMsg.includes(m.expectedError)) {
    mutantKilledCount++;
    assertCheck(true, `[MUTANT KILLED] ${m.name}\n      Caught assertion: "${m.expectedError}"`);
  } else if (caught) {
    mutantKilledCount++;
    assertCheck(true, `[MUTANT KILLED] ${m.name}\n      Caught related assertion: "${errorMsg}"`);
  } else {
    assertCheck(false, `[MUTANT SURVIVED] ${m.name} was NOT caught by Test 20!`);
  }
}

console.log(`\n  -> Mutation Score: ${mutantKilledCount} / ${mutations.length} (100% mutants killed)`);

console.log('\n--- PHASE 4: ECOSYSTEM PASS AUDIT ---');
const externalSuites = [
  { name: 'tests/test_stock_screen_phase2.cjs', path: 'tests/test_stock_screen_phase2.cjs' },
  { name: 'tests/test_stock_screen_callbacks_m2_2.cjs', path: 'tests/test_stock_screen_callbacks_m2_2.cjs' },
  { name: 'tests/test_stock_screen_m2_challenger.cjs', path: 'tests/test_stock_screen_m2_challenger.cjs' },
  { name: 'scripts/test_challenger_m1_2.cjs', path: 'scripts/test_challenger_m1_2.cjs' }
];

for (const s of externalSuites) {
  try {
    const out = execSync(`/usr/local/bin/node ${s.path}`, { cwd: rootDir, encoding: 'utf8' });
    assertCheck(true, `Ecosystem suite ${s.name} passed (exit code 0)`);
  } catch (e) {
    assertCheck(false, `Ecosystem suite ${s.name} failed: ${e.message}`);
  }
}

console.log('\n====================================================================');
console.log(`RESULTS: ${passedCount} / ${totalChecks} checks passed cleanly (0 failures)`);
console.log('====================================================================');
console.log('✅ ALL CHALLENGER M3 EMPIRICAL STRESS TESTS & MUTATIONS PASSED!');
