-- Independent, versioned world. Catalogs seed a save once; no legacy singletons.
local Util = require("career.Util")
local World = {}
World.ROLES = { "top", "jungle", "mid", "adc", "support" }
World.ROLE_NAMES = { top = "上单", jungle = "打野", mid = "中单", adc = "下路", support = "辅助" }

local function account(world, id, ownerType, ownerId, balance)
    world.accounts[id] = { id = id, ownerType = ownerType, ownerId = ownerId,
        balance = balance, openingBalance = balance }
end

local function player(world, id, name, role, clubId, ability, age)
    world.persons[id] = { id = id, name = name, role = role, clubId = clubId,
        age = age, careerStatus = "active", fatigue = 10, morale = 70,
        attrs = { mechanics = ability, gameSense = ability, teamwork = ability, mental = ability },
        heroPool = { signature = 70 }, style = "balanced", potential = 88 }
    account(world, "person:" .. id, "person", id, 0)
end

function World.AddContract(world, personId, clubId, wage, endDay)
    local id = "contract:" .. tostring(#Util.Keys(world.contracts) + 1)
    world.contracts[id] = { id = id, personId = personId, clubId = clubId,
        startDay = world.clock.day, endDay = endDay, weeklyWage = wage,
        accruedDays = 0, lastAccruedDay = world.clock.day - 1,
        status = "active", paidTotal = 0, owed = 0 }
    return id
end

function World.AddSchedule(world, firstDay)
    -- Fictional four-club development league, explicitly not the 2026 LPL rules.
    local rounds = {
        { {"dawn", "harbor"}, {"summit", "orchid"} },
        { {"dawn", "summit"}, {"harbor", "orchid"} },
        { {"dawn", "orchid"}, {"harbor", "summit"} },
        { {"harbor", "dawn"}, {"orchid", "summit"} },
        { {"summit", "dawn"}, {"orchid", "harbor"} },
        { {"orchid", "dawn"}, {"summit", "harbor"} },
    }
    for round, pairs_ in ipairs(rounds) do
        for _, pair in ipairs(pairs_) do
            local id = "fixture:" .. tostring(#world.fixtures + 1)
            world.fixtures[#world.fixtures + 1] = { id = id, day = firstDay + (round - 1) * 7,
                homeId = pair[1], awayId = pair[2], status = "scheduled", season = world.season }
        end
    end
end

function World.New(options)
    options = options or {}
    local role = options.role or "mid"
    if not World.ROLE_NAMES[role] then return nil, "请选择有效位置" end
    local name = options.name or "新星"
    if type(name) ~= "string" then return nil, "请输入角色姓名" end
    name = name:match("^%s*(.-)%s*$") or ""
    local length = utf8.len(name)
    if not length or length < 1 or length > 16 or name:find("%c") then
        return nil, "姓名需为 1—16 个字符，不能包含控制字符"
    end
    local profile = options.profile or "short"
    if profile ~= "short" and profile ~= "rookie" then return nil, "无效生涯类型" end
    local seed = options.seed or 20260101
    if not Util.Integer(seed, 1, 2147483646) then return nil, "无效世界种子" end
    local world = { schemaVersion = 1, contentVersion = "fictional-slice-1", rulesVersion = 1,
        worldId = options.worldId or ("career:" .. tostring(os.time()) .. ":" .. tostring(seed)),
        revision = 0, clock = { day = 1, startYear = 2026 }, rngState = seed,
        protagonistId = "protagonist", profile = profile, persons = {}, clubs = {}, contracts = {},
        accounts = {}, ledger = {}, history = {}, relationships = {}, processedCommands = {},
        fixtures = {}, matches = {}, season = 1, eventQueue = {},
        plan = { name = "均衡周", days = { "mechanics", "teamwork", "rest", "gameSense", "mental", "rest", "rest" } },
        contentNotice = "开发验证世界：虚构俱乐部、选手与经济参数，尚未接入真实 2026 LPL 内容。" }
    account(world, "external", "economy", "external", 100000000000)
    local clubs = { {"dawn", "晨曦电竞"}, {"harbor", "港湾电竞"}, {"summit", "山巅电竞"}, {"orchid", "兰亭电竞"} }
    for index, entry in ipairs(clubs) do
        local id, clubName = entry[1], entry[2]
        local ownerId = "owner:" .. id
        world.persons[ownerId] = { id = ownerId, name = clubName .. "原投资人", careerStatus = "non_player" }
        account(world, "person:" .. ownerId, "person", ownerId, 500000)
        account(world, "club:" .. id, "club", id, id == "dawn" and 1500000 or 300000)
        local club = { id = id, name = clubName, ownerId = ownerId, accountId = "club:" .. id,
            roster = {}, bench = {}, budget = { training = 1000, staff = 1000 },
            assets = { facilityLevel = 1 }, liabilities = 0, leagueId = "development-league",
            weeklySponsor = 15000,
            forSale = { sellerId = ownerId, price = id == "harbor" and 240000 or 600000 + index * 80000 } }
        world.clubs[id] = club
        for pos, r in ipairs(World.ROLES) do
            local pid = id .. ":" .. r
            player(world, pid, clubName .. "·" .. World.ROLE_NAMES[r], r, id, 57 + index * 2 + pos, 22)
            club.roster[r] = pid
            World.AddContract(world, pid, id, 1800, 3650)
        end
        local reserveId = id .. ":reserve"
        player(world, reserveId, clubName .. "·候补", role, id, 58 + index, 19)
        club.bench[1] = reserveId
        World.AddContract(world, reserveId, id, 1200, 3650)
    end
    local me = world.protagonistId
    player(world, me, name, role, "dawn", profile == "short" and 72 or 63, profile == "short" and 29 or 18)
    local p = world.persons[me]
    p.style, p.background, p.goal = options.style or "balanced", options.background or "ordinary", options.goal or "champion"
    local styleBonus = { aggressive = "mechanics", strategic = "gameSense", supportive = "teamwork", balanced = "mental" }
    p.attrs[styleBonus[p.style] or "mental"] = p.attrs[styleBonus[p.style] or "mental"] + 3
    local cash = profile == "short" and 300000 or 20000
    world.accounts["person:" .. me].balance = cash
    world.accounts["person:" .. me].openingBalance = cash
    local oldStarter = world.clubs.dawn.roster[role]
    world.clubs.dawn.bench[#world.clubs.dawn.bench + 1] = oldStarter
    world.clubs.dawn.roster[role] = me
    World.AddContract(world, me, "dawn", profile == "short" and 25000 or 8000, profile == "short" and 21 or 84)
    world.relationships[me .. ":" .. oldStarter] = { fromId = me, toId = oldStarter, value = 50 }
    World.AddSchedule(world, 7)
    Util.Record(world, "created", profile == "short" and "短生涯验证：老将的最后赛季" or "新人签约晨曦电竞", { personId = me, clubId = "dawn" })
    return world
end

function World.ControlledClub(world, actorId)
    actorId = actorId or world.protagonistId
    for _, id in ipairs(Util.Keys(world.clubs)) do
        if world.clubs[id].ownerId == actorId then return id end
    end
    local p = world.persons[actorId]
    return p and p.careerStatus == "active" and p.clubId or nil
end

function World.Validate(world)
    if type(world) ~= "table" or world.schemaVersion ~= 1 or type(world.worldId) ~= "string"
        or not Util.Integer(world.revision) then return false, "世界版本或修订号无效" end
    for _, key in ipairs({ "persons", "clubs", "contracts", "accounts", "ledger", "history", "relationships", "processedCommands", "fixtures", "matches", "eventQueue" }) do
        if type(world[key]) ~= "table" then return false, "存档缺少 " .. key end
    end
    if type(world.clock) ~= "table" or not Util.Integer(world.clock.day, 1)
        or world.clock.startYear ~= 2026 or not Util.Integer(world.rngState, 1, 2147483646)
        or not world.persons[world.protagonistId] then return false, "时间或主角数据无效" end
    local balances = {}
    for id, a in pairs(world.accounts) do
        if type(a) ~= "table" or a.id ~= id or not Util.Integer(a.balance) or not Util.Integer(a.openingBalance) then
            return false, "账户金额无效：" .. tostring(id)
        end
        balances[id] = a.openingBalance
    end
    local external = world.accounts.external
    if not external or external.ownerType ~= "economy" or external.ownerId ~= "external" then return false, "经济结算账户缺失" end
    for _, row in ipairs(world.ledger) do
        if not balances[row.fromId] or not balances[row.toId] or not Util.Integer(row.amount, 1) then return false, "账本记录无效" end
        balances[row.fromId], balances[row.toId] = balances[row.fromId] - row.amount, balances[row.toId] + row.amount
    end
    for id, amount in pairs(balances) do
        if amount ~= world.accounts[id].balance then return false, "账本与余额不一致：" .. id end
    end
    for id, c in pairs(world.contracts) do
        if type(c) ~= "table" or c.id ~= id or not world.persons[c.personId] or not world.clubs[c.clubId]
            or not Util.Integer(c.weeklyWage) or not Util.Integer(c.startDay, 1)
            or not Util.Integer(c.endDay, c.startDay) or not Util.Integer(c.owed)
            or not Util.Integer(c.accruedDays, 0, 7) or not Util.Integer(c.paidTotal)
            or not Util.Integer(c.lastAccruedDay, c.startDay - 1, world.clock.day)
            or (c.status ~= "active" and c.status ~= "retired" and c.status ~= "expired") then return false, "合同无效：" .. tostring(id) end
        if c.status == "active" and world.persons[c.personId].clubId ~= c.clubId then return false, "合同归属不一致" end
    end
    local occupied = {}
    for id, c in pairs(world.clubs) do
        if type(c) ~= "table" or c.id ~= id or not world.persons[c.ownerId] or not world.accounts[c.accountId]
            or type(c.roster) ~= "table" or type(c.bench) ~= "table" or type(c.budget) ~= "table"
            or not Util.Integer(c.budget.training, 0, 100000) or not Util.Integer(c.budget.staff, 0, 100000)
            or not Util.Integer(c.weeklySponsor, 1) or not Util.Integer(c.liabilities)
            or type(c.assets) ~= "table" or not Util.Integer(c.assets.facilityLevel, 1, 10) then return false, "俱乐部无效" end
        local clubAccount = world.accounts[c.accountId]
        if clubAccount.ownerType ~= "club" or clubAccount.ownerId ~= id then return false, "俱乐部资金归属错误" end
        if c.forSale and (type(c.forSale) ~= "table" or c.forSale.sellerId ~= c.ownerId or not Util.Integer(c.forSale.price, 1)) then return false, "收购报价无效" end
        local function checkPlayer(pid, role)
            local p = world.persons[pid]
            if not p or p.clubId ~= id or p.careerStatus ~= "active" or occupied[pid] or (role and p.role ~= role) then return false end
            occupied[pid] = true
            return true
        end
        for role, pid in pairs(c.roster) do
            if not World.ROLE_NAMES[role] or not checkPlayer(pid, role) then return false, "首发归属或位置无效" end
        end
        for _, pid in ipairs(c.bench) do if not checkPlayer(pid) then return false, "替补归属无效" end end
    end
    for id, p in pairs(world.persons) do
        if type(p) ~= "table" or p.id ~= id or type(p.name) ~= "string" then return false, "人物编号不一致" end
        local personal = world.accounts["person:" .. id]
        if not personal or personal.ownerType ~= "person" or personal.ownerId ~= id then return false, "个人账户缺失或归属错误" end
        if p.careerStatus == "active" or p.careerStatus == "retired" then
            if not World.ROLE_NAMES[p.role] or type(p.attrs) ~= "table"
                or not Util.Integer(p.age, 1, 150) then return false, "选手能力缺失" end
            for _, key in ipairs({ "fatigue", "morale" }) do
                local value = p[key]
                if type(value) ~= "number" or value ~= value or value < 0 or value > 100 then return false, "选手状态无效" end
            end
            for _, stat in ipairs({ "mechanics", "gameSense", "teamwork", "mental" }) do
                local value = p.attrs[stat]
                if type(value) ~= "number" or value ~= value or value < 0 or value > 100 then return false, "能力数值无效" end
            end
            if p.clubId and not occupied[id] then return false, "所属俱乐部与名单不一致" end
        end
    end
    if type(world.plan) ~= "table" or type(world.plan.days) ~= "table" or #world.plan.days ~= 7 then return false, "周计划无效" end
    local labels = require("career.Training").LABELS
    for _, focus in ipairs(world.plan.days) do
        if not labels[focus] or (focus == "work" and world.persons[world.protagonistId].careerStatus ~= "retired") then return false, "日程安排无效" end
    end
    for _, event in ipairs(world.eventQueue) do
        if type(event) ~= "table" or event.kind ~= "contract_expiry"
            or not world.contracts[event.contractId] or world.contracts[event.contractId].status ~= "active"
            or world.contracts[event.contractId].personId ~= world.protagonistId then return false, "待办事项无效" end
    end
    for _, rel in pairs(world.relationships) do
        if type(rel) ~= "table" or not world.persons[rel.fromId] or not world.persons[rel.toId]
            or not Util.Integer(rel.value, 0, 100) then return false, "人物关系无效" end
    end
    for _, f in ipairs(world.fixtures) do
        if not world.clubs[f.homeId] or not world.clubs[f.awayId] or not Util.Integer(f.day, 1)
            or (f.status ~= "scheduled" and f.status ~= "in_progress" and f.status ~= "completed") then return false, "赛程无效" end
    end
    return require("career.Matches").Validate(world)
end

return World
