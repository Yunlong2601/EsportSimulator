local Util = require("career.Util")
local Ledger = {}

function Ledger.Transfer(world, fromId, toId, amount, reason, reference)
    if not Util.Integer(amount, 1) or fromId == toId then return false, "无效交易金额或账户" end
    local source, target = world.accounts[fromId], world.accounts[toId]
    if not source or not target then return false, "交易账户不存在" end
    if source.balance < amount then return false, "账户余额不足" end
    source.balance, target.balance = source.balance - amount, target.balance + amount
    world.ledger[#world.ledger + 1] = { id = "entry:" .. (#world.ledger + 1),
        day = world.clock.day, fromId = fromId, toId = toId, amount = amount,
        reason = reason, reference = reference }
    return true
end

return Ledger
