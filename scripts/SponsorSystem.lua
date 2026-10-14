local CompanyState = require("CompanyState")
local StaffSystem = require("StaffSystem")

local SponsorSystem = {}

SponsorSystem.OFFERS = {
    -- 经济平衡 §2.5：底部地板抬高 + 门槛前移，让最穷的网吧/次级队第一周就有正杠杆
    { id = "sp_local", name = "速达电竞网吧", tier = "本地", payment = 25, weeks = 8, minFans = 0, minReputation = 0, desc = "本地网吧冠名，几乎零门槛。" },
    { id = "sp_gear", name = "雷弧外设", tier = "外设", payment = 40, weeks = 6, minFans = 12000, minReputation = 25, desc = "外设品牌试水电竞营销。" },
    { id = "sp_energy", name = "脉冲能量饮料", tier = "快消", payment = 55, weeks = 5, minFans = 30000, minReputation = 40, desc = "能量饮料押注年轻玩家。" },
    { id = "sp_bank", name = "星环金融", tier = "金融", payment = 80, weeks = 3, minFans = 80000, minReputation = 55, desc = "金融机构冠名合作。" },
    { id = "sp_auto", name = "疾风汽车", tier = "汽车", payment = 120, weeks = 3, minFans = 150000, minReputation = 65, desc = "汽车品牌的大手笔。" },
    { id = "sp_global", name = "苍穹科技", tier = "顶级", payment = 200, weeks = 4, minFans = 300000, minReputation = 75, desc = "顶级科技品牌的全球级合作。" },
}

function SponsorSystem.GetOffer(offerId)
    for _, offer in ipairs(SponsorSystem.OFFERS) do
        if offer.id == offerId then return offer end
    end
    return nil
end

function SponsorSystem.GetActiveSponsors(state)
    state = CompanyState.Ensure(state)
    local active = {}
    for _, slot in pairs(state.company.sponsors.active) do
        if slot and slot.offerId then
            local offer = SponsorSystem.GetOffer(slot.offerId)
            table.insert(active, {
                offerId = slot.offerId,
                name = offer and offer.name or slot.offerId,
                tier = offer and offer.tier or "",
                payment = tonumber(slot.payment) or 0,
                weeksLeft = tonumber(slot.weeksLeft) or 0,
            })
        end
    end
    table.sort(active, function(a, b) return a.payment > b.payment end)
    return active
end

function SponsorSystem.GetAvailableOffers(state)
    state = CompanyState.Ensure(state)
    local signed = {}
    for _, slot in pairs(state.company.sponsors.active) do
        if slot and slot.offerId then signed[slot.offerId] = true end
    end
    local offers = {}
    for _, offer in ipairs(SponsorSystem.OFFERS) do
        if not signed[offer.id] then
            local negotiated = state.company.sponsors.negotiated[offer.id]
            local meetsFans = state.company.fans >= offer.minFans
            local meetsRep = state.company.reputation >= offer.minReputation
            table.insert(offers, {
                id = offer.id,
                name = offer.name,
                tier = offer.tier,
                desc = offer.desc,
                payment = negotiated and negotiated.payment or offer.payment,
                weeks = negotiated and negotiated.weeks or offer.weeks,
                minFans = offer.minFans,
                minReputation = offer.minReputation,
                locked = not (meetsFans and meetsRep),
                negotiated = negotiated ~= nil,
            })
        end
    end
    return offers
end

-- 赞助席位数由俱乐部评级决定：草根 1 → 传奇 5；商务发展司额外加成（P1-⑥）
function SponsorSystem.GetMaxSlots(state)
    state = CompanyState.Ensure(state)
    local TierSystem = require("TierSystem")
    local base = TierSystem.GetSponsorSlots(state)
    local FacilitiesSystem = require("FacilitiesSystem")
    local bonus = FacilitiesSystem.GetSponsorSlotBonus(state)
    return base + bonus
end

function SponsorSystem.GetFreeSlots(state)
    state = CompanyState.Ensure(state)
    local max = SponsorSystem.GetMaxSlots(state)
    local slotState = {}
    for i = 1, max do slotState["slot" .. i] = true end
    for slotName, slot in pairs(state.company.sponsors.active) do
        if slot and slot.offerId then slotState[slotName] = false end
    end
    local free = {}
    for slotName, available in pairs(slotState) do
        if available then table.insert(free, slotName) end
    end
    return free
end

function SponsorSystem.CanSign(state, offerId)
    state = CompanyState.Ensure(state)
    local offer = SponsorSystem.GetOffer(offerId)
    if not offer then return false, "赞助商不存在" end
    for _, slot in pairs(state.company.sponsors.active) do
        if slot and slot.offerId == offerId then return false, "该赞助商已在合作中" end
    end
    if #SponsorSystem.GetFreeSlots(state) == 0 then
        return false, "赞助席位已满（当前评级最多 " .. tostring(SponsorSystem.GetMaxSlots(state)) .. " 个）"
    end
    if state.company.fans < offer.minFans or state.company.reputation < offer.minReputation then
        return false, "不满足赞助商门槛要求"
    end
    return true
end

function SponsorSystem.SignSponsor(state, offerId)
    state = CompanyState.Ensure(state)
    local ok, reason = SponsorSystem.CanSign(state, offerId)
    if not ok then return false, reason end
    local offer = SponsorSystem.GetOffer(offerId)
    local freeSlots = SponsorSystem.GetFreeSlots(state)
    local negotiated = state.company.sponsors.negotiated[offerId]
    local payment = negotiated and negotiated.payment or offer.payment
    local weeks = negotiated and negotiated.weeks or offer.weeks
    state.company.sponsors.active[freeSlots[1]] = {
        offerId = offerId,
        payment = payment,
        weeksLeft = weeks,
    }
    if negotiated then state.company.sponsors.negotiated[offerId] = nil end
    CompanyState.RecordTimeline(state, "赞助签约",
        offer.name .. " 达成 " .. tostring(weeks) .. " 周合作，每周 ¥" .. tostring(payment) .. "万。")
    return true, state.company.sponsors.active[freeSlots[1]]
end

function SponsorSystem.NegotiateOffer(state, offerId)
    state = CompanyState.Ensure(state)
    local offer = SponsorSystem.GetOffer(offerId)
    if not offer then return false, "赞助商不存在" end
    if state.company.sponsors.negotiated[offerId] then return false, "该赞助商已完成谈判" end
    local cost = 5 -- 经济平衡 §2.5：谈判手续费 10 → 5 万
    if state.company.cash < cost then return false, "现金不足，无法支付谈判费用" end
    state.company.cash = state.company.cash - cost
    local reputation = state.company.reputation
    local operations = StaffSystem.GetLevel(state, "operations")
    local chance = math.min(0.85, 0.30 + reputation * 0.004 + operations * 0.03)
    local payment = offer.payment
    local weeks = offer.weeks
    if math.random() <= chance then
        payment = math.floor(payment * 1.25)
        weeks = weeks + 1
        state.company.reputation = math.max(0, math.min(100, reputation - 1))
        CompanyState.RecordTimeline(state, "谈判成功",
            offer.name .. " 同意提高赞助：每周 ¥" .. tostring(payment) .. "万，合作 " .. tostring(weeks) .. " 周。")
    else
        payment = math.floor(payment * 0.9)
        state.company.reputation = math.max(0, math.min(100, reputation - 1)) -- 经济平衡 §2.5：谈判失败声誉 -2 → -1
        CompanyState.RecordTimeline(state, "谈判失败",
            offer.name .. " 拒绝让步，仅愿提供基础条款。")
    end
    state.company.sponsors.negotiated[offerId] = { payment = payment, weeks = weeks }
    return true, state.company.sponsors.negotiated[offerId]
end

function SponsorSystem.TickSponsors(state)
    state = CompanyState.Ensure(state)
    local toExpire = {}
    local toBreach = {}
    for slotName, slot in pairs(state.company.sponsors.active) do
        if slot and slot.offerId then
            local offer = SponsorSystem.GetOffer(slot.offerId)
            slot.weeksLeft = tonumber(slot.weeksLeft) - 1
            if slot.weeksLeft <= 0 then
                table.insert(toExpire, { slotName = slotName, name = offer and offer.name or slot.offerId })
            elseif offer and state.company.reputation < (offer.minReputation - 10) then
                table.insert(toBreach, { slotName = slotName, name = offer.name })
            end
        end
    end
    for _, entry in ipairs(toExpire) do
        state.company.sponsors.active[entry.slotName] = nil
        CompanyState.RecordTimeline(state, "赞助到期", entry.name .. " 的赞助合同到期，席位已空出。")
    end
    for _, entry in ipairs(toBreach) do
        state.company.sponsors.active[entry.slotName] = nil
        state.company.reputation = math.max(0, state.company.reputation - 2)
        CompanyState.RecordTimeline(state, "赞助解约", entry.name .. " 因声誉不达标提前解约，声誉 -2。")
    end
    return state
end

function SponsorSystem.GetWeeklySponsorIncome(state)
    state = CompanyState.Ensure(state)
    local total = 0
    for _, slot in pairs(state.company.sponsors.active) do
        if slot and slot.payment then total = total + tonumber(slot.payment) end
    end
    return total
end

-- P2-⑤ 媒体发布会联动：调整赞助商好感（0~100，影响续约与签约成功率）
function SponsorSystem.AddReputation(state, delta)
    state = CompanyState.Ensure(state)
    state.company.sponsors.reputation = math.max(0, math.min(100,
        (tonumber(state.company.sponsors.reputation) or 50) + delta))
    return state.company.sponsors.reputation
end

return SponsorSystem
