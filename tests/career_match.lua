-- Run with Lua 5.4 from the project root (or the Python/Lupa runner).
package.path = "scripts/?.lua;" .. package.path
local Util = require("career.Util")
local World = require("career.World")
local Matches = require("career.Matches")
local count = 0
local function check(value, label)
    assert(value, label)
    count = count + 1
end
local function equal(a, b)
    if type(a) ~= type(b) then return false end
    if type(a) ~= "table" then return a == b end
    for k, v in pairs(a) do if not equal(v, b[k]) then return false end end
    for k in pairs(b) do if a[k] == nil then return false end end
    return true
end
local function newWorld(role, seed)
    local world = assert(World.New({ role = role or "mid", seed = seed or 112233, worldId = "match-test" }))
    world.clock.day = 7
    return world
end
local function complete(world, choice)
    local steps = 0
    while Matches.Active(world) do
        local ok, message = Matches.Choose(world, world.protagonistId, choice)
        assert(ok, message)
        steps = steps + 1
        assert(steps <= 9, "BO3 must finish within nine phase decisions")
    end
    return world.matches[world.fixtures[1].matchId]
end

-- Match entry is authorized by identity / roster, not whichever page is open.
local early = newWorld()
early.clock.day = 6
local initial = Util.Copy(early)
check(not Matches.Start(early, "protagonist", early.fixtures[1].id), "future fixture rejected")
check(equal(initial, early), "rejected match start has no side effects")
check(not Matches.Start(early, "owner:summit", early.fixtures[1].id), "unrelated owner rejected")
local bench = newWorld()
local reserve = bench.clubs.dawn.bench[1]
check(not Matches.Start(bench, reserve, bench.fixtures[1].id), "benched player cannot take player decisions")
local retired = newWorld()
retired.persons.protagonist.careerStatus = "retired"
check(not Matches.Start(retired, "protagonist", retired.fixtures[1].id), "retired non-owner cannot play")

-- Each role has personal choices; an owner can direct their own team's tactics.
for _, role in ipairs(World.ROLES) do
    local world = newWorld(role)
    check(Matches.Start(world, "protagonist", world.fixtures[1].id), role .. " can start")
    local choices = Matches.GetChoices(world)
    check(#choices == 3 and choices[1].id == "pressure" and choices[2].label ~= "", role .. " personal choices")
    local before = Util.Copy(world)
    check(not Matches.Choose(world, "protagonist", "tempo"), "player cannot issue owner tactic")
    check(equal(before, world), "invalid choice preserves RNG and state")
end

-- Same seed, different personal decisions: the chosen actor's actual contest
-- input changes before the fixed number of RNG draws, while teammates do not.
local pressure, conserve = newWorld(), newWorld()
assert(Matches.Start(pressure, "protagonist", pressure.fixtures[1].id))
assert(Matches.Start(conserve, "protagonist", conserve.fixtures[1].id))
assert(Matches.Choose(pressure, "protagonist", "pressure"))
assert(Matches.Choose(conserve, "protagonist", "conserve"))
local pressureEvent, conserveEvent = Matches.Active(pressure).events[1], Matches.Active(conserve).events[1]
check(pressure.rngState == conserve.rngState, "each choice consumes same number of deterministic draws")
check(pressureEvent.contributions.protagonist.actionBonus ~= conserveEvent.contributions.protagonist.actionBonus,
    "personal choice changes causal action input")
check(pressureEvent.advantageAfter ~= conserveEvent.advantageAfter, "personal choice changes game situation")
check(equal(pressureEvent.contributions["dawn:top"], conserveEvent.contributions["dawn:top"]),
    "personal action does not secretly rewrite teammates' attributes or decisions")
check(pressure.persons.protagonist.fatigue == conserve.persons.protagonist.fatigue + 2, "personal action fatigue tradeoff applied")

-- Simulate a saved snapshot reload and Lua module reload: every later event,
-- winner, rating and RNG state must match uninterrupted continuation exactly.
local reloaded = Util.Copy(pressure)
package.loaded["career.Matches"] = nil
Matches = require("career.Matches")
local resultA, resultB = complete(pressure, "coordinate"), complete(reloaded, "coordinate")
check(equal(pressure, reloaded), "mid-series snapshot/module reload reproduces the whole world")
check(#resultA.games >= 2 and #resultA.games <= 3, "BO3 has two or three maps")
check(resultA.score.home == 2 or resultA.score.away == 2, "series winner has two map wins")
check(pressure.fixtures[1].status == "completed" and not pressure.activeMatchId, "fixture completed and active handle cleared")
check(equal(resultA, resultB), "all recorded match outputs survive continuation")
check(resultA.performances[resultA.mvpId].clubId == resultA.winnerId, "MVP belongs to winning club")
for _, role in ipairs(World.ROLES) do
    local id = resultA.rosterSnapshot[resultA.winnerId][role]
    check(resultA.performances[resultA.mvpId].impact >= resultA.performances[id].impact,
        "MVP is earned from measured impact")
end
local finished = Util.Copy(pressure)
check(not Matches.Start(pressure, "protagonist", pressure.fixtures[1].id), "completed fixture cannot restart")
check(not Matches.Choose(pressure, "protagonist", "pressure"), "completed series cannot be settled again")
check(equal(finished, pressure), "repeat settlement does not alter history or fatigue")

-- Match records hold their roster/ability snapshots while world IDs, money and
-- contracts survive. Retirement/acquisition themselves belong to domain commands.
local owner = newWorld()
local me = owner.persons.protagonist
owner.clubs.dawn.roster[me.role] = owner.clubs.dawn.bench[1]
table.remove(owner.clubs.dawn.bench, 1)
me.careerStatus, me.clubId = "retired", nil
owner.clubs.harbor.ownerId = me.id
local accountsBefore, contractsBefore = Util.Copy(owner.accounts), Util.Copy(owner.contracts)
local rosterBefore = Util.Copy(owner.clubs.harbor.roster)
assert(Matches.Start(owner, me.id, owner.fixtures[1].id))
check(Matches.Active(owner).controlMode == "owner", "retired club owner has tactical control")
check(Matches.GetChoices(owner)[1].id == "tempo", "owner receives tactical choices")
assert(Matches.Choose(owner, me.id, "teamplay"))
local ownerMatch = Matches.Active(owner)
for _, role in ipairs(World.ROLES) do
    local id = ownerMatch.rosterSnapshot.harbor[role]
    check(ownerMatch.events[1].contributions[id].choiceId == "teamplay", "owner tactic reaches owned roster")
end
local ownerResult = complete(owner, "patient")
check(not ownerResult.performances.protagonist, "owner is not fabricated as a match participant")
check(equal(owner.accounts, accountsBefore) and equal(owner.contracts, contractsBefore), "match leaves accounts and contracts intact")
check(equal(owner.clubs.harbor.roster, rosterBefore), "owner match retains acquired roster IDs")

-- Background fixtures share the rules and are settled once, never consuming
-- the player's important match in a weekly advance.
local background = newWorld()
local settled, issues = Matches.SimulateOthers(background, 7, "dawn")
check(settled == 1 and #issues == 0, "one due NPC fixture simulated")
check(background.fixtures[1].status == "scheduled", "player fixture remains a decision")
check(background.fixtures[2].status == "completed", "NPC fixture gets actual persistent result")
local npcResult = background.matches[background.fixtures[2].matchId]
check(#npcResult.games >= 2 and npcResult.performances[npcResult.mvpId], "NPC result uses full match model")
local npcSnapshot = Util.Copy(background)
check(Matches.SimulateOthers(background, 7, "dawn") == 0, "NPC fixture is not simulated twice")
check(equal(npcSnapshot, background), "background replay cannot duplicate fatigue or history")

-- Damaged pending/completed records must be rejected at load, not patched into a
-- fresh match that can re-roll results or leave the career locked indefinitely.
check(Matches.Validate(background), "NPC results pass structural validation")
check(Matches.Validate(pressure), "completed player result passes validation")
check(Matches.Validate(owner), "completed owner result passes validation")
local pending = newWorld()
local seedBeforeStart = pending.rngState
assert(Matches.Start(pending, "protagonist", pending.fixtures[1].id))
check(pending.rngState == seedBeforeStart, "starting match never draws unseen match result")
assert(Matches.Choose(pending, "protagonist", "coordinate"))
check(Matches.Validate(pending), "pending match passes load validation")
local damaged = Util.Copy(pending)
Matches.Active(damaged).phaseIndex = 3
check(not Matches.Validate(damaged), "corrupt phase/history boundary rejected")
damaged = Util.Copy(pending)
Matches.Active(damaged).playerSnapshot.protagonist = nil
check(not Matches.Validate(damaged), "missing protagonist snapshot rejected")
damaged = Util.Copy(pressure)
damaged.matches[damaged.fixtures[1].matchId].score.home = 0
damaged.matches[damaged.fixtures[1].matchId].score.away = 0
check(not Matches.Validate(damaged), "corrupt completed score rejected")
damaged = Util.Copy(pending)
damaged.persons.protagonist.careerStatus = "retired"
check(not Matches.Validate(damaged), "pending match with lost player permission rejected")
local beforePermissionCheck = Util.Copy(damaged)
check(not Matches.Choose(damaged, "protagonist", "coordinate"), "permission rechecked at decision submission")
check(equal(damaged, beforePermissionCheck), "permission denial preserves all match state")

print("career_match: " .. count .. " assertions passed")
return count
