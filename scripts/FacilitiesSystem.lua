-- FacilitiesSystem：俱乐部设施树扩展（P1-⑥）
-- 四栋设施：训练场(training) / 医疗康复室(medical) / 战术分析室(analysis) / 商务发展司(business)
-- 每栋 Lv0-3，升级费指数增长；从现有 TrainingSystem/MedicalSystem 迁移等级数据。
-- 电竞基地(gamingHouse) 预留 Lv0 占位，暂不开放（P2）。
local CompanyState = require("CompanyState")
local LeagueCatalog = require("LeagueCatalog")

local FacilitiesSystem = {}

-- 设施定义：label / desc / maxLv / costPerLv / effects 每级效果描述
FacilitiesSystem.FACILITIES = {
    training = {
        id = "training",
        label = "训练场",
        icon = "场馆",
        desc = "提升全队训练收益，加速选手成长。",
        maxLv = 3,
        costs = { 100, 200, nil }, -- Lv1→2 / Lv2→3 / Lv3满
        effects = {
            [0] = "训练收益 +0",
            [1] = "训练收益 +1（全队训练主属性 +1）",
            [2] = "训练收益 +2（全队训练主属性 +2）",
            [3] = "训练收益 +3（全队训练主属性 +3）",
        },
    },
    medical = {
        id = "medical",
        label = "医疗康复室",
        icon = "医疗",
        desc = "降低伤病概率，加速伤停康复。",
        maxLv = 3,
        costs = { 80, 160, nil },
        effects = {
            [0] = "伤病概率 ×100%，康复 +0 周",
            [1] = "伤病概率 ×85%，康复 +0 周",
            [2] = "伤病概率 ×70%，康复额外 +0.5 周",
            [3] = "伤病概率 ×55%，康复额外 +1 周",
        },
    },
    analysis = {
        id = "analysis",
        label = "战术分析室",
        icon = "分析",
        desc = "提升 BP 优势结算，解锁对手情报与赛后数据分析。",
        maxLv = 3,
        costs = { 120, 240, nil },
        effects = {
            [0] = "地图优势上限 ±8%，无额外情报",
            [1] = "地图优势上限 ±8%，BP 阶段显示对手常用战术",
            [2] = "地图优势上限 ±10%，BP 阶段显示对手常用战术",
            [3] = "地图优势上限 ±10%，解锁赛后数据分析台",
        },
    },
    business = {
        id = "business",
        label = "商务发展司",
        icon = "经营",
        desc = "增加赞助席位，提升周边与估值。",
        maxLv = 3,
        costs = { 150, 300, nil },
        effects = {
            [0] = "赞助位上限不变，周边收入 +0%",
            [1] = "赞助位 +1，周边收入 +10%",
            [2] = "赞助位 +1，周边收入 +20%",
            [3] = "赞助位 +2，周边收入 +30%，估值 +5%",
        },
    },
    gamingHouse = {
        id = "gamingHouse",
        label = "电竞基地",
        icon = "总部",
        desc = "降低疲劳累积速度，提升队内化学反应，并提供每周主动恢复。",
        maxLv = 3,
        costs = { 200, 400, nil },
        effects = {
            [0] = "疲劳累积 +0%，化学反应 +0",
            [1] = "疲劳累积 -10%，化学反应 +5，每周额外恢复 +3",
            [2] = "疲劳累积 -20%，化学反应 +10，客场惩罚减半，每周恢复 +5",
            [3] = "疲劳累积 -30%，化学反应 +15，客场变优势，每周恢复 +8",
        },
    },
}

-- 确保设施表存在，并从旧位置迁移数据
function FacilitiesSystem.Ensure(state)
    state = CompanyState.Ensure(state)
    state.facilities = state.facilities or {}
    local changed = false
    -- 从 TrainingSystem 迁移 training 等级
    if state.roster and state.roster.facility and not state.facilities.training then
        state.facilities.training = tonumber(state.roster.facility) or 1
        changed = true
    end
    -- 从 MedicalSystem 迁移 medical 等级
    if state.medical and state.medical.level and not state.facilities.medical then
        state.facilities.medical = tonumber(state.medical.level) or 0
        changed = true
    end
    -- 默认值
    for id, def in pairs(FacilitiesSystem.FACILITIES) do
        if state.facilities[id] == nil then
            state.facilities[id] = (id == "training") and 1 or 0
            changed = true
        end
    end
    return state.facilities
end

function FacilitiesSystem.GetLevel(state, facilityId)
    FacilitiesSystem.Ensure(state)
    return tonumber(state.facilities[facilityId]) or 0
end

function FacilitiesSystem.GetConfig(facilityId, level)
    local def = FacilitiesSystem.FACILITIES[facilityId]
    if not def then return nil end
    local lv = math.min(level or 0, def.maxLv)
    return {
        id = facilityId,
        label = def.label,
        icon = def.icon,
        level = lv,
        effect = def.effects[lv] or def.effects[0],
        maxLv = def.maxLv,
        cost = def.costs[lv + 1] or nil,
    }
end

function FacilitiesSystem.GetUpgradeCost(state, facilityId)
    local def = FacilitiesSystem.FACILITIES[facilityId]
    if not def then return nil end
    local lv = FacilitiesSystem.GetLevel(state, facilityId)
    if lv >= def.maxLv then return nil end
    return def.costs[lv + 1] or nil
end

function FacilitiesSystem.CanUpgrade(state, facilityId)
    local cost = FacilitiesSystem.GetUpgradeCost(state, facilityId)
    if not cost then return false, "已满级" end
    if state.company.cash < cost then return false, "现金不足，需要 ¥" .. tostring(cost) .. "万" end
    return true, cost
end

function FacilitiesSystem.Upgrade(state, facilityId)
    local def = FacilitiesSystem.FACILITIES[facilityId]
    if not def then return false, "未知设施" end
    FacilitiesSystem.Ensure(state)
    local lv = FacilitiesSystem.GetLevel(state, facilityId)
    if lv >= def.maxLv then return false, "设施已满级" end
    local cost = def.costs[lv + 1]
    if state.company.cash < cost then return false, "现金不足，升级需要 ¥" .. tostring(cost) .. "万" end
    state.company.cash = state.company.cash - cost
    state.facilities[facilityId] = lv + 1
    local newLv = state.facilities[facilityId]
    -- 同步回旧位置（向后兼容）
    if facilityId == "training" and state.roster then
        state.roster.facility = newLv
    elseif facilityId == "medical" then
        state.medical = state.medical or {}
        state.medical.level = newLv
    end
    CompanyState.RecordTimeline(state, "设施升级",
        def.icon .. " " .. def.label .. " 升级至 Lv." .. tostring(newLv) .. "：" .. tostring(def.effects[newLv]))
    return true, newLv
end

-- 查询效果：训练场加成（与 TrainingSystem.GetFacilityBonus 对齐）
function FacilitiesSystem.GetTrainingBonus(state)
    local lv = FacilitiesSystem.GetLevel(state, "training")
    return lv - 1 -- Lv1→0, Lv2→1, Lv3→2
end

-- 查询效果：电竞基地每周额外疲劳恢复（Lv1/2/3: +3/+5/+8）
function FacilitiesSystem.GetGamingHouseRecoverBonus(state)
    local lv = FacilitiesSystem.GetLevel(state, "gamingHouse")
    local t = { 0, 3, 5, 8 }
    return t[lv + 1] or 0
end

-- 查询效果：医疗室伤病率系数
function FacilitiesSystem.GetMedicalRateMul(state)
    local lv = FacilitiesSystem.GetLevel(state, "medical")
    local t = { 1.00, 0.85, 0.70, 0.55 }
    return t[lv + 1] or 1.00
end

-- 查询效果：医疗室康复额外周数
function FacilitiesSystem.GetMedicalRecoveryBonus(state)
    local lv = FacilitiesSystem.GetLevel(state, "medical")
    local t = { 0, 0, 0.5, 1 }
    return t[lv + 1] or 0
end

-- 查询效果：是否解锁对手战术情报（analysis Lv1+）
function FacilitiesSystem.HasOppTacticIntel(state)
    return FacilitiesSystem.GetLevel(state, "analysis") >= 1
end

-- 查询效果：是否解锁赛后数据分析台（analysis Lv3）
function FacilitiesSystem.HasMatchAnalytics(state)
    return FacilitiesSystem.GetLevel(state, "analysis") >= 3
end

-- 查询效果：商务发展司赞助位加成
function FacilitiesSystem.GetSponsorSlotBonus(state)
    local lv = FacilitiesSystem.GetLevel(state, "business")
    local t = { 0, 1, 1, 2 }
    return t[lv + 1] or 0
end

-- 查询效果：商务发展司周边收入加成（百分比）
function FacilitiesSystem.GetMerchIncomeMul(state)
    local lv = FacilitiesSystem.GetLevel(state, "business")
    local t = { 1.0, 1.1, 1.2, 1.3 }
    return t[lv + 1] or 1.0
end

-- 查询效果：商务发展司估值加成（百分比）
function FacilitiesSystem.GetValuationBonus(state)
    local lv = FacilitiesSystem.GetLevel(state, "business")
    local t = { 0, 0, 0, 0.05 }
    return t[lv + 1] or 0
end

-- 获取所有设施状态（供 UI 使用）
function FacilitiesSystem.GetAll(state)
    FacilitiesSystem.Ensure(state)
    local result = {}
    for id, def in pairs(FacilitiesSystem.FACILITIES) do
        local lv = FacilitiesSystem.GetLevel(state, id)
        table.insert(result, {
            id = id,
            label = def.label,
            icon = def.icon,
            desc = def.desc,
            level = lv,
            maxLv = def.maxLv,
            effect = def.effects[lv] or def.effects[0],
            nextEffect = def.effects[lv + 1] or nil,
            cost = def.costs[lv + 1] or nil,
            isMaxed = lv >= def.maxLv,
        })
    end
    return result
end

return FacilitiesSystem
