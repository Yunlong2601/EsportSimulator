-- Focused regressions from the independent persistence/domain review.
-- Pure Lua world fixtures; no engine calls and no player save writes.
local World = require("career.World")
local Actions = require("career.Actions")
local Timeline = require("career.Timeline")
local Ledger = require("career.Ledger")
local Matches = require("career.Matches")
local passed = 0
local function check(value, message) assert(value, message); passed = passed + 1 end
local function fresh() return assert(World.New({ worldId = "world-review", seed = 1234 })) end
local function contract(world)
    for _, c in pairs(world.contracts) do if c.personId == world.protagonistId then return c end end
    error("Protagonist contract missing")
end

do
    local w = fresh()
    w.accounts["person:" .. w.protagonistId] = nil
    check(not World.Validate(w), "Missing personal account must be rejected before UI/load")
    w = fresh(); w.accounts.external = nil
    check(not World.Validate(w), "Missing economy account must be rejected before payroll")
    w = fresh(); w.plan.days[1] = "invalid"
    check(not World.Validate(w), "Invalid saved activity must be rejected before time advances")
    w = fresh(); contract(w).lastAccruedDay = nil
    check(not World.Validate(w), "Missing contract accrual marker must be rejected")
    w = fresh(); contract(w).paidTotal = nil
    check(not World.Validate(w), "Missing contract paid-total must be rejected")
end

do
    local w = fresh()
    local options = { days = { "work", "work", "work", "work", "work", "work", "work" } }
    check(not Actions.Apply(w, w.protagonistId, "work", {}), "Active player cannot select retired work template")
    check(not Actions.Apply(w, w.protagonistId, "set_plan", options), "Editable plan cannot bypass retirement-only work")
    check(Actions.Apply(w, w.protagonistId, "retire", {}), "Player retires")
    check(Actions.Apply(w, w.protagonistId, "set_plan", options), "Retired player can plan work")
end

do
    local w = fresh()
    check(Timeline.Advance(w), "Accrue first six days before fixture")
    local c = contract(w)
    check(c.accruedDays == 6 and w.clock.day == 7, "Accrual stops at match day")
    local accountId = w.clubs.dawn.accountId
    check(Ledger.Transfer(w, accountId, "external", w.accounts[accountId].balance, "test exhaustion", "review"), "Exhaust club funds through valid ledger")
    check(Actions.Apply(w, w.protagonistId, "retire", {}), "Retirement keeps unpaid wage obligation")
    local expected = math.floor(c.weeklyWage * 6 / 7 + 0.5)
    check(c.owed == expected and c.paidTotal == 0 and c.accruedDays == 0, "Final wage is accrued once despite insufficient cash")
    check(Ledger.Transfer(w, "external", accountId, 10000, "test recovery", "review"), "Club gets some funds")
    Timeline.PayContract(w, c, false)
    Timeline.PayContract(w, c, true)
    check(c.paidTotal == 10000 and c.owed == expected - 10000, "Repeated settlement cannot repay same wage")
    check(Ledger.Transfer(w, "external", accountId, c.owed, "test recovery", "review"), "Remaining wage funds arrive")
    Timeline.PayContract(w, c, false)
    Timeline.PayContract(w, c, true)
    check(c.paidTotal == expected and c.owed == 0, "Terminated contract debt repaid exactly once")
    check(World.Validate(w), "Retirement with wage debt preserves valid accounts and contracts")
end

do
    local w = fresh()
    for _ = 1, 100 do
        if w.clock.day >= 22 then break end
        local fixture = Timeline.DueFixture(w)
        if fixture then
            check(Matches.Start(w, w.protagonistId, fixture.id), "Start due match")
            while w.activeMatchId do check(Matches.Choose(w, w.protagonistId, "coordinate"), "Resolve selected match phase") end
        elseif #w.eventQueue > 0 then
            check(Actions.Apply(w, w.protagonistId, "resolve_event", { eventId = w.eventQueue[1].id, choice = "leave" }), "Leave at expiry by explicit decision")
        else check(Timeline.Advance(w), "Advance to match or contract decision") end
    end
    local c = contract(w)
    check(c.status == "expired" and c.paidTotal == 75000 and c.owed == 0 and c.accruedDays == 0,
        "Three-week contract leaves with exactly three wages")
    check(w.persons[w.protagonistId].clubId == nil and World.Validate(w), "Expiry preserves valid free-agent identity")
    check(Actions.Apply(w, w.protagonistId, "retire", {}), "Free agent can retire without being stuck")
end

print("career_review: " .. passed .. " assertions passed")
return passed
