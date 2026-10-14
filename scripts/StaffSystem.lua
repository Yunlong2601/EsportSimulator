local CompanyState = require("CompanyState")

local StaffSystem = {}

StaffSystem.ROLES = {
    coach = "教练",
    analyst = "分析师",
    operations = "运营",
    psychologist = "心理师",
    medic = "队医",
    headScout = "首席球探",
}

StaffSystem.MAX_LEVEL = 5

StaffSystem.UPGRADE_BASE_COST = {
    coach = 200,
    analyst = 160,
    operations = 150,
    psychologist = 180,
    medic = 200,
    headScout = 220,
}

local function clamp(value, minimum, maximum)
    return math.max(minimum, math.min(maximum, tonumber(value) or minimum))
end

function StaffSystem.GetStaff(state)
    state = CompanyState.Ensure(state)
    return state.roster.staff
end

function StaffSystem.GetLevel(state, role)
    state = CompanyState.Ensure(state)
    if not StaffSystem.ROLES[role] then return 1 end
    return tonumber(state.roster.staff[role]) or 1
end

function StaffSystem.GetUpgradeCost(state, role)
    state = CompanyState.Ensure(state)
    local base = StaffSystem.UPGRADE_BASE_COST[role] or 150
    local level = StaffSystem.GetLevel(state, role)
    return base * level
end

function StaffSystem.UpgradeStaff(state, role)
    state = CompanyState.Ensure(state)
    if not StaffSystem.ROLES[role] then return false, "未知岗位" end
    local level = StaffSystem.GetLevel(state, role)
    if level >= StaffSystem.MAX_LEVEL then
        return false, StaffSystem.ROLES[role] .. "团队已达上限"
    end
    local cost = StaffSystem.GetUpgradeCost(state, role)
    if state.company.cash < cost then return false, "现金不足" end
    state.company.cash = state.company.cash - cost
    state.roster.staff[role] = level + 1
    local effects = {
        coach = "训练效果提升，全队战力获得更高加成。",
        analyst = "青训成长加速，学员招募费用降低。",
        operations = "每周粉丝增长提升，运营事件成本降低。",
    }
    CompanyState.RecordTimeline(state, StaffSystem.ROLES[role] .. "升级",
        StaffSystem.ROLES[role] .. "团队升至 Lv." .. tostring(level + 1) .. "，" .. (effects[role] or ""))
    return true
end

function StaffSystem.GetCoachBonus(state)
    return 1 + StaffSystem.GetLevel(state, "coach") * 0.02
end

function StaffSystem.GetTrainFormGain(state)
    return 1 + StaffSystem.GetLevel(state, "coach")
end

function StaffSystem.GetTrainStatGain(state)
    local gain = 1
    if StaffSystem.GetLevel(state, "coach") >= 3 then gain = gain + 1 end
    if StaffSystem.GetLevel(state, "analyst") >= 2 then gain = gain + 1 end
    return gain
end

function StaffSystem.GetScoutCost(state)
    local analyst = StaffSystem.GetLevel(state, "analyst")
    return math.max(10, 30 - (analyst - 1) * 5)
end

function StaffSystem.GetWeeklyFanBonus(state)
    return 400 * StaffSystem.GetLevel(state, "operations")
end

function StaffSystem.GetEventCost(state, cost)
    local operations = StaffSystem.GetLevel(state, "operations")
    local multiplier = math.max(0.7, 1 - (operations - 1) * 0.04)
    return math.floor((tonumber(cost) or 0) * multiplier)
end

function StaffSystem.GetAcademyGrowthBonus(state)
    return math.max(0, StaffSystem.GetLevel(state, "analyst") - 1)
end

-- 6 岗（含心理师/队医/首席球探）**始终全员在编**，GetLevel 仍用 `or 1`；
-- 这里**只下调单岗费率**（经济平衡 §2.1 方案 A）：Lv1 六岗合计 60 → 24 万/周。
-- 严禁收窄求和范围（收窄 = 心理师/队医/球探变免费收益，属回归）。
function StaffSystem.GetStaffWages(state)
    return 4 * StaffSystem.GetLevel(state, "coach")
        + 3 * StaffSystem.GetLevel(state, "analyst")
        + 2 * StaffSystem.GetLevel(state, "operations")
        + 5 * StaffSystem.GetLevel(state, "psychologist")
        + 4 * StaffSystem.GetLevel(state, "medic")
        + 6 * StaffSystem.GetLevel(state, "headScout")
end

-- 心理师：降低低谷概率、稳心态（接入 MoraleSystem）
function StaffSystem.GetMoraleStability(state)
    local lv = StaffSystem.GetLevel(state, "psychologist")
    return lv * 0.03  -- Lv1: 士气波动 -3%, Lv3: -9%
end

-- 队医：康复加速（接入 MedicalSystem）
function StaffSystem.GetHealBonus(state)
    local lv = StaffSystem.GetLevel(state, "medic")
    return lv * 0.5  -- Lv1: 康复 +0.5周/周, Lv2: +1.0, Lv3: +1.5
end

-- 首席球探：ScoutSystem 命中率 + 压价（接入 ScoutSystem）
function StaffSystem.GetScoutBonus(state)
    local lv = StaffSystem.GetLevel(state, "headScout")
    return { hitBonus = lv * 0.05, costReduce = lv * 0.08 }  -- Lv1: 命中+5%, 费用-8%
end

return StaffSystem
