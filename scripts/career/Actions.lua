-- All mutations run on a copied candidate and are committed by Runtime together.
local Util = require("career.Util")
local World = require("career.World")
local Ledger = require("career.Ledger")
local Timeline = require("career.Timeline")
local Matches = require("career.Matches")
local Training = require("career.Training")
local Actions = {}

local function owned(world, actor, clubId)
    local club = world.clubs[clubId]
    if not club or club.ownerId ~= actor then return nil, "你没有这家俱乐部的管理权限" end
    return club
end

local handlers = {}
function handlers.set_plan(world, actor, payload)
    if type(payload.days) ~= "table" or #payload.days ~= 7 then return false, "周计划必须包含七天" end
    for _, focus in ipairs(payload.days) do
        if not Training.LABELS[focus] then return false, "周计划含无效安排" end
        if focus == "work" and world.persons[actor].careerStatus ~= "retired" then
            return false, "退役后才可安排解说工作"
        end
    end
    world.plan.days = Util.Copy(payload.days)
    world.plan.name = "自定义周计划"
    Util.Record(world, "plan", "已保存周计划；未执行的安排将在推进时生效", { personId = actor })
    return true, "周计划已保存"
end

function handlers.advance(world) return Timeline.Advance(world) end
function handlers.start_match(world, actor, payload) return Matches.Start(world, actor, payload.fixtureId) end
function handlers.match_choice(world, actor, payload) return Matches.Choose(world, actor, payload.choiceId) end

function handlers.retire(world, actor)
    local p = world.persons[actor]
    if p.careerStatus ~= "active" then return false, "你已经结束选手生涯" end
    if world.activeMatchId then return false, "请先完成正在进行的比赛" end
    local clubId = p.clubId
    for _, id in ipairs(Util.Keys(world.contracts)) do
        local c = world.contracts[id]
        if c.personId == actor and c.status == "active" then
            Timeline.PayContract(world, c, true)
            c.status, c.endedDay = "retired", world.clock.day
        end
    end
    Timeline.RemovePlayer(world, actor)
    p.careerStatus, p.retiredDay = "retired", world.clock.day
    -- Expiry choices belonging to the retired player no longer block the world.
    for i = #world.eventQueue, 1, -1 do
        local e = world.eventQueue[i]
        if e.contractId and world.contracts[e.contractId].personId == actor then table.remove(world.eventQueue, i) end
    end
    Util.Record(world, "retired", p.name .. "宣布退役，人物关系与职业记录继续保留", { personId = actor, clubId = clubId })
    return true, "已退役并结算应付工资；可查看战队出售机会或安排个人工作"
end

function handlers.buy_club(world, actor, payload)
    if world.persons[actor].careerStatus ~= "retired" then return false, "退役后才能购买战队" end
    if world.activeMatchId then return false, "请先完成比赛" end
    for _, club in pairs(world.clubs) do if club.ownerId == actor then return false, "首版生涯只支持拥有一家俱乐部" end end
    local club = world.clubs[payload.clubId]
    local offer = club and club.forSale
    if not offer or offer.sellerId ~= club.ownerId or not Util.Integer(offer.price, 1) then return false, "这家俱乐部当前没有有效出售报价" end
    local ok, err = Ledger.Transfer(world, "person:" .. actor, "person:" .. offer.sellerId, offer.price, "收购俱乐部所有权", club.id)
    if not ok then return false, "个人资金不足，不能使用俱乐部运营资金支付收购款" end
    local sellerId, price = offer.sellerId, offer.price
    club.ownerId, club.forSale = actor, nil
    Util.Record(world, "acquired", world.persons[actor].name .. "买下" .. club.name, { personId = actor,
        clubId = club.id, sellerId = sellerId, price = price })
    return true, "收购完成：原阵容、合同、运营资金、资产、赛程和历史全部保留"
end

function handlers.set_roster(world, actor, payload)
    if world.activeMatchId then return false, "比赛期间不能改变报名阵容" end
    local club, err = owned(world, actor, payload.clubId)
    if not club then return false, err end
    local p = world.persons[payload.personId]
    if not p or p.clubId ~= club.id or p.careerStatus ~= "active" or p.role ~= payload.role then return false, "选手不属于本队或位置不符" end
    local index
    for i, id in ipairs(club.bench) do if id == p.id then index = i end end
    if not index then return false, "请选择该位置的替补选手" end
    local previous = club.roster[payload.role]
    table.remove(club.bench, index)
    if previous then club.bench[#club.bench + 1] = previous end
    club.roster[payload.role] = p.id
    Util.Record(world, "lineup", p.name .. "进入首发", { personId = p.id, clubId = club.id, previousId = previous })
    return true, "首发阵容已调整，选手合同保持不变"
end

function handlers.set_budget(world, actor, payload)
    local club, err = owned(world, actor, payload.clubId)
    if not club then return false, err end
    if not Util.Integer(payload.training, 0, 100000) or not Util.Integer(payload.staff, 0, 100000) then return false, "预算需为 0—100000 元的整数" end
    if payload.training + payload.staff > world.accounts[club.accountId].balance then return false, "本周预算超过俱乐部可用现金" end
    club.budget = { training = payload.training, staff = payload.staff }
    Util.Record(world, "budget", "已设置" .. club.name .. "的每周预算", { clubId = club.id,
        training = payload.training, staff = payload.staff })
    return true, "每周预算已保存，将在周结算时从俱乐部账户支付"
end

function handlers.work(world, actor)
    if world.persons[actor].careerStatus ~= "retired" then return false, "退役后开放解说工作计划" end
    world.plan = { name = "解说工作周", days = { "work", "work", "rest", "work", "work", "work", "rest" } }
    Util.Record(world, "plan", "已安排解说工作周：五天工作，两天休息", { personId = actor })
    return true, "工作周计划已保存，推进日期后按实际工作天数获得个人收入"
end

function handlers.resolve_event(world, actor, payload)
    local event = world.eventQueue[1]
    if not event or event.id ~= payload.eventId then return false, "事项已处理或不再有效" end
    local c = world.contracts[event.contractId]
    if event.kind ~= "contract_expiry" or not c or c.personId ~= actor or c.status ~= "active" then return false, "事项状态不符" end
    if payload.choice == "renew" then
        c.endDay, c.expiryAcknowledged = c.endDay + 84, nil
        Util.Record(world, "renewed", "按原周薪续约十二周", { personId = actor, contractId = c.id, clubId = c.clubId })
    elseif payload.choice == "leave" then
        c.expiryAcknowledged = true
        Util.Record(world, "contract_decision", "决定合同到期后离队", { personId = actor, contractId = c.id })
    else return false, "请选择续约或到期离队" end
    table.remove(world.eventQueue, 1)
    return true, "合同决定已保存"
end

function Actions.Apply(world, actor, kind, payload)
    if actor ~= world.protagonistId or not world.persons[actor] then return false, "无效操作身份" end
    local handler = handlers[kind]
    if not handler then return false, "未知生涯操作" end
    return handler(world, actor, payload or {})
end

function Actions.Preview(world, kind, payload)
    local candidate = Util.Copy(world)
    local ok, result, message = pcall(Actions.Apply, candidate, world.protagonistId, kind, payload or {})
    if not ok then return { ok = false, message = "操作参数无效" } end
    local changes = {}
    for id, account in pairs(world.accounts) do
        local delta = candidate.accounts[id].balance - account.balance
        if delta ~= 0 then changes[#changes + 1] = { accountId = id, amount = delta } end
    end
    return { ok = result == true, message = message, days = candidate.clock.day - world.clock.day,
        money = changes, events = #candidate.history - #world.history }
end

return Actions
