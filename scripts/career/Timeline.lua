local Util = require("career.Util")
local World = require("career.World")
local Ledger = require("career.Ledger")
local Training = require("career.Training")
local Matches = require("career.Matches")
local Timeline = {}

function Timeline.DueFixture(world)
    local clubId = World.ControlledClub(world)
    if not clubId then return nil end
    for _, f in ipairs(world.fixtures) do
        if f.day <= world.clock.day and f.status ~= "completed" and (f.homeId == clubId or f.awayId == clubId) then return f end
    end
end

function Timeline.PayContract(world, c, final)
    if final or c.accruedDays >= 7 then
        local amount = math.floor(c.weeklyWage * c.accruedDays / 7 + 0.5)
        c.owed, c.accruedDays = c.owed + amount, 0
    end
    if c.owed > 0 then
        local club = world.clubs[c.clubId]
        local amount = math.min(c.owed, world.accounts[club.accountId].balance)
        if amount > 0 then
            Ledger.Transfer(world, club.accountId, "person:" .. c.personId, amount, "合同工资", c.id)
            c.owed, c.paidTotal = c.owed - amount, c.paidTotal + amount
        end
    end
end

function Timeline.RemovePlayer(world, personId)
    local p = world.persons[personId]
    local club = p.clubId and world.clubs[p.clubId]
    if club then
        for role, id in pairs(club.roster) do
            if id == personId then
                club.roster[role] = nil
                for index, reserveId in ipairs(club.bench) do
                    if world.persons[reserveId].role == role and world.persons[reserveId].careerStatus == "active" then
                        club.roster[role] = reserveId
                        table.remove(club.bench, index)
                        break
                    end
                end
            end
        end
        for index = #club.bench, 1, -1 do
            if club.bench[index] == personId then table.remove(club.bench, index) end
        end
    end
    p.clubId = nil
end

local function weeklyAccounts(world)
    for _, clubId in ipairs(Util.Keys(world.clubs)) do
        local club = world.clubs[clubId]
        Ledger.Transfer(world, "external", club.accountId, club.weeklySponsor, "每周赞助", clubId)
    end
    for _, id in ipairs(Util.Keys(world.contracts)) do Timeline.PayContract(world, world.contracts[id], false) end
    for _, clubId in ipairs(Util.Keys(world.clubs)) do
        local club = world.clubs[clubId]
        local cost = club.budget.training + club.budget.staff
        local paid = math.min(cost, world.accounts[club.accountId].balance)
        if paid > 0 then Ledger.Transfer(world, club.accountId, "external", paid, "训练与员工预算", clubId) end
        club.liabilities = club.liabilities + cost - paid
    end
    local me = world.persons[world.protagonistId]
    local personal = "person:" .. me.id
    local paid = math.min(1000, world.accounts[personal].balance)
    if paid > 0 then Ledger.Transfer(world, personal, "external", paid, "每周生活支出", me.id) end
    me.livingDebt = (me.livingDebt or 0) + 1000 - paid
    Util.Record(world, "weekly", "一周结算：工资、赞助、俱乐部预算与个人生活支出已入账")
end

local function processDay(world)
    local me = world.persons[world.protagonistId]
    local focus = world.plan.days[(world.clock.day - 1) % 7 + 1]
    local clubId = World.ControlledClub(world)
    local club = clubId and world.clubs[clubId]
    local effect = Training.Apply(me, focus, club and club.assets.facilityLevel or 1)
    if effect.income then Ledger.Transfer(world, "external", "person:" .. me.id, effect.income, "个人解说工作", me.id) end
    if effect.relationship then
        for _, rel in pairs(world.relationships) do
            if rel.fromId == me.id or rel.toId == me.id then rel.value = Util.Clamp(rel.value + effect.relationship, 0, 100) end
        end
    end
    if club and club.ownerId == me.id then
        local teamFocus = club.budget.training > 0 and (focus == "work" and "gameSense" or focus) or "rest"
        for _, pid in pairs(club.roster) do Training.Apply(world.persons[pid], teamFocus, club.assets.facilityLevel) end
        for _, pid in ipairs(club.bench) do Training.Apply(world.persons[pid], teamFocus, club.assets.facilityLevel) end
    end
    for _, id in ipairs(Util.Keys(world.contracts)) do
        local c = world.contracts[id]
        if c.status == "active" and c.startDay <= world.clock.day and c.endDay >= world.clock.day and c.lastAccruedDay < world.clock.day then
            c.accruedDays = c.accruedDays + 1
            c.lastAccruedDay = world.clock.day
        end
    end
    if world.clock.day % 7 == 0 then weeklyAccounts(world) end
    for _, id in ipairs(Util.Keys(world.contracts)) do
        local c = world.contracts[id]
        if c.status == "active" and c.endDay == world.clock.day then
            Timeline.PayContract(world, c, true)
            c.status = "expired"
            Timeline.RemovePlayer(world, c.personId)
            Util.Record(world, "contract_expired", world.persons[c.personId].name .. "的合同到期", { personId = c.personId, contractId = id, clubId = c.clubId })
        end
    end
    world.clock.day = world.clock.day + 1
    local lastDay = world.fixtures[#world.fixtures].day
    if world.clock.day > lastDay then
        world.season = world.season + 1
        World.AddSchedule(world, lastDay + 7)
        Util.Record(world, "season", "新的开发联赛赛段开始，过去赛果已保留")
    end
    if (world.clock.day - 1) % 365 == 0 then
        for _, p in pairs(world.persons) do if p.age then p.age = p.age + 1 end end
    end
end

function Timeline.Advance(world)
    if world.activeMatchId then return false, "请先完成正在进行的比赛" end
    if #world.eventQueue > 0 then return false, "请先处理重要事项" end
    local advanced = 0
    while advanced < 7 do
        if Timeline.DueFixture(world) then
            return advanced > 0, "时间已暂停：请处理今天的比赛"
        end
        -- Expiring protagonist contract blocks before its last working day.
        for _, id in ipairs(Util.Keys(world.contracts)) do
            local c = world.contracts[id]
            if c.personId == world.protagonistId and c.status == "active" and c.endDay == world.clock.day and not c.expiryAcknowledged then
                world.eventQueue[#world.eventQueue + 1] = { id = "expiry:" .. id, kind = "contract_expiry", contractId = id,
                    title = "合同今天到期：续约或离队", day = world.clock.day }
                return true, "时间已暂停：合同到期需要你的决定"
            end
        end
        Matches.SimulateOthers(world, world.clock.day, World.ControlledClub(world))
        processDay(world)
        advanced = advanced + 1
    end
    return true, "已按原计划推进，日程和账目已更新"
end

return Timeline
