local Runtime = require("career.Runtime")
local SaveStore = require("career.SaveStore")
local World = require("career.World")
local Matches = require("career.Matches")
local Util = require("career.Util")
local passed = 0
local function check(value, label) assert(value, label); passed = passed + 1 end
local function same(a, b)
    if type(a) ~= type(b) then return false end
    if type(a) ~= "table" then return a == b end
    for k, v in pairs(a) do if not same(v, b[k]) then return false end end
    for k in pairs(b) do if a[k] == nil then return false end end
    return true
end
local function memory()
    local io = { files = {}, writes = 0 }
    io.read = function(path)
        if io.readFail then return nil, "io_error", "injected failure" end
        return io.files[path], io.files[path] and "ok" or "missing"
    end
    io.write = function(path, text)
        io.writes = io.writes + 1
        if io.fail then return false, "injected write failure" end
        io.files[path] = text
        if io.uncertain then io.readFail = true end
        return true
    end
    return io
end
local function new(profile)
    local io = memory()
    local session = Runtime.New(SaveStore.New(io))
    assert(session:Load())
    assert(session:Create({ name = "李梓轩", role = "mid", profile = profile or "short", worldId = "flow-test" }))
    return session, io
end
local function dispatch(session, kind, payload, id)
    local ok, message = session:Dispatch(kind, payload, session:Get().revision, id)
    assert(ok, kind .. ": " .. tostring(message))
    check(World.Validate(session:Get()), "world invariants after " .. kind)
end
local function play(session)
    local world = session:Get()
    local clubId = World.ControlledClub(world)
    local fixture
    for _, f in ipairs(world.fixtures) do
        if f.status == "scheduled" and f.day <= world.clock.day and (f.homeId == clubId or f.awayId == clubId) then fixture = f; break end
    end
    assert(fixture, "due fixture")
    dispatch(session, "start_match", { fixtureId = fixture.id })
    while session:Get().activeMatchId do
        dispatch(session, "match_choice", { choiceId = Matches.GetChoices(session:Get())[2].id })
    end
    return fixture.id
end

-- The complete career slice goes through public commands and actual JSON storage.
local session, io = new()
local initial = session:Get()
local oldClub = Util.Copy(initial.clubs.harbor)
local oldOwnerBalance = initial.accounts["person:" .. oldClub.ownerId].balance
dispatch(session, "advance")
check(session:Get().clock.day == 7, "weekly advance pauses at first match")
local firstFixture = play(session)
local beforeRetire = session:Get()
dispatch(session, "retire", {}, "retirement-once")
local retired = session:Get()
check(retired.persons.protagonist.careerStatus == "retired", "player retired")
check(retired.persons.protagonist.clubId == nil and retired.clubs.dawn.roster.mid ~= "protagonist", "retirement removes player from lineup and promotes reserve")
check(retired.matches[retired.fixtures[1].matchId].performances.protagonist ~= nil, "player performance persists after retirement")
local replay = session:Get()
check(session:Dispatch("retire", {}, 0, "retirement-once"), "same command replays old result")
check(same(replay, session:Get()), "replay cannot pay retirement twice")
local ownBefore = retired.accounts["person:protagonist"].balance
local targetBefore = retired.accounts[oldClub.accountId].balance
dispatch(session, "buy_club", { clubId = "harbor" }, "purchase-once")
local owner = session:Get()
check(owner.clubs.harbor.ownerId == "protagonist", "same saved club changes owner")
check(owner.accounts[oldClub.accountId].balance == targetBefore, "purchase never takes operating cash")
check(owner.accounts["person:protagonist"].balance == ownBefore - oldClub.forSale.price, "purchase comes from personal wealth")
check(owner.accounts["person:" .. oldClub.ownerId].balance == oldOwnerBalance + oldClub.forSale.price, "selling owner receives price")
check(same(owner.clubs.harbor.roster, oldClub.roster) and same(owner.clubs.harbor.assets, oldClub.assets), "target retains original roster and assets")
for id, c in pairs(retired.contracts) do check(same(c, owner.contracts[id]), "acquisition preserves contract " .. id) end
check(same(retired.relationships, owner.relationships), "relationships survive ownership transition")
check(owner.fixtures[1].id == firstFixture and owner.fixtures[1].status == "completed", "prior result preserved")
local cold = Runtime.New(SaveStore.New(io))
check(cold:Load(), "cold reload acquisition")
check(same(owner, cold:Get()), "full world roundtrip after acquisition")
check(cold:Dispatch("buy_club", { clubId = "harbor" }, 0, "purchase-once"), "receipt survives restart")
check(same(owner, cold:Get()), "restart retry cannot buy or debit twice")
dispatch(cold, "set_roster", { clubId = "harbor", role = "mid", personId = "harbor:reserve" })
dispatch(cold, "set_budget", { clubId = "harbor", training = 2000, staff = 1200 })
dispatch(cold, "advance")
check(cold:Get().clock.day == 14, "owner advances to next fixture without resetting date")
play(cold)
local finished = cold:Get()
check(finished.clubs.harbor.roster.mid == "harbor:reserve", "new owner lineup persists into next match")
local ownedMatch
for _, m in pairs(finished.matches) do if m.controlMode == "owner" then ownedMatch = m end end
check(ownedMatch and ownedMatch.rosterSnapshot.harbor.mid == "harbor:reserve", "next match uses actual adjusted roster")
check(not ownedMatch.performances.protagonist, "retired owner not fabricated as player")
check(finished.persons["harbor:mid"] ~= nil and finished.contracts["contract:8"] ~= nil, "original persons/contracts remain")

-- Write failure: neither memory nor durable ownership/funds change.
local fault, disk = new()
dispatch(fault, "retire")
local before = fault:Get()
disk.fail = true
local ok = fault:Dispatch("buy_club", { clubId = "harbor" }, before.revision, "failed-purchase")
check(not ok and same(fault:Get(), before), "failed save rolls back complete purchase")
disk.fail = false
local reload = Runtime.New(SaveStore.New(disk))
assert(reload:Load())
check(same(reload:Get(), before), "failed purchase leaves prior full snapshot")
dispatch(fault, "buy_club", { clubId = "harbor" }, "failed-purchase")

-- Uncertain save: lock until saved state is read back, no duplicate payment.
local uncertain, disk2 = new()
dispatch(uncertain, "retire")
disk2.uncertain = true
local beforeUncertain = uncertain:Get()
local accepted, _, status = uncertain:Dispatch("buy_club", { clubId = "harbor" }, beforeUncertain.revision, "uncertain-purchase")
check(not accepted and status == "uncertain", "ambiguous save surfaced")
check(not uncertain:Dispatch("work", {}), "uncertain outcome locks actions")
check(same(beforeUncertain, uncertain:Get()), "unconfirmed candidate never displayed as success")
disk2.uncertain, disk2.readFail = false, false
assert(uncertain:Load())
check(uncertain:Get().clubs.harbor.ownerId == "protagonist", "reload reconciles actually committed purchase")
local confirmed = uncertain:Get()
check(uncertain:Dispatch("buy_club", { clubId = "harbor" }, 0, "uncertain-purchase"), "uncertain command receipt recovered")
check(same(confirmed, uncertain:Get()), "uncertain retry no double debit")

-- Insufficient personal funds cannot touch target cash; retirement remains playable.
local poor = new("rookie")
dispatch(poor, "retire")
local poorBefore = poor:Get()
check(not poor:Dispatch("buy_club", { clubId = "harbor" }), "poor retiree cannot buy immediately")
check(same(poorBefore, poor:Get()), "failed purchase changes nothing")
dispatch(poor, "work")
for _ = 1, 16 do dispatch(poor, "advance") end
check(poor:Get().accounts["person:protagonist"].balance >= 240000, "work yields an actual affordable acquisition path")
dispatch(poor, "buy_club", { clubId = "harbor" })
check(poor:Get().clock.day > 1 and #poor:Get().history > 5, "income path advances same world and history")

-- Preview has no effects; stale UI and identity restrictions hold.
local previewWorld = cold:Get()
local preview = cold:Preview("set_budget", { clubId = "harbor", training = 3000, staff = 2000 })
check(preview.ok and same(previewWorld, cold:Get()), "preview is read only")
check(not cold:Dispatch("set_budget", { clubId = "dawn", training = 0, staff = 0 }), "owner cannot manage unrelated club")
check(not cold:Dispatch("advance", {}, 0), "old page revision rejected")
check(not cold:Create({}), "existing world never overwritten by create")
for path in pairs(io.files) do check(path:find("unified_career", 1, true), "save namespace remains isolated") end

print("career_flow: " .. passed .. " assertions passed")
return passed
