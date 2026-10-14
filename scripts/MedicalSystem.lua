-- MedicalSystem：系统性伤病 + 疲劳/状态 + 医疗康复室（P1-③）
-- 疲劳随比赛/训练累积、替补休息恢复；高疲劳 → 战力衰减 + 伤病概率上升；
-- 伤病按周停赛、按医疗等级加速康复；医疗室升级降低伤病率（FM 疲劳轮换教训）。
local CompanyState = require("CompanyState")
local LeagueCatalog = require("LeagueCatalog")

local MedicalSystem = {}

-- 医疗康复室等级（P1-⑥ 迁移至 FacilitiesSystem；此处保留兼容包装）
MedicalSystem.MEDICAL_LEVELS = {
    { level = 0, label = "无",     rateMul = 1.00, recoveryBonus = 0,   cost = 80 },
    { level = 1, label = "基础",   rateMul = 0.85, recoveryBonus = 0,   cost = 160 },
    { level = 2, label = "标准",   rateMul = 0.70, recoveryBonus = 0.5, cost = 280 },
    { level = 3, label = "精英",   rateMul = 0.55, recoveryBonus = 1,   cost = nil },
}

local function clamp(value, minimum, maximum)
    return math.max(minimum, math.min(maximum, tonumber(value) or minimum))
end

function MedicalSystem.Ensure(state)
    state = CompanyState.Ensure(state)
    -- P1-⑥：等级统一由 FacilitiesSystem 管理（迁移自 state.medical.level）
    local FacilitiesSystem = require("FacilitiesSystem")
    FacilitiesSystem.Ensure(state)
    state.medical = state.medical or {}
    state.medical.level = FacilitiesSystem.GetLevel(state, "medical")
    return state.medical
end

function MedicalSystem.EnsurePlayer(player)
    if not player then return nil end
    player.fatigue = tonumber(player.fatigue) or 0
    if player.injury and tonumber(player.injury.weeks or 0) <= 0 then player.injury = nil end
    return player
end

function MedicalSystem.GetLevel(state)
    return MedicalSystem.Ensure(state).level
end

function MedicalSystem.GetConfig(state)
    local lv = MedicalSystem.GetLevel(state)
    return MedicalSystem.MEDICAL_LEVELS[lv + 1] or MedicalSystem.MEDICAL_LEVELS[1]
end

function MedicalSystem.GetUpgradeCost(state)
    local FacilitiesSystem = require("FacilitiesSystem")
    return FacilitiesSystem.GetUpgradeCost(state, "medical")
end

function MedicalSystem.Upgrade(state)
    local FacilitiesSystem = require("FacilitiesSystem")
    return FacilitiesSystem.Upgrade(state, "medical")
end

function MedicalSystem.IsInjured(player)
    return player ~= nil and player.injury ~= nil and tonumber(player.injury.weeks or 0) > 0
end

function MedicalSystem.GetInjuryWeeks(player)
    if MedicalSystem.IsInjured(player) then return tonumber(player.injury.weeks) end
    return 0
end

function MedicalSystem.AddFatigue(state, playerId, amount)
    local player = LeagueCatalog.GetPlayer(playerId)
    if not player then return nil end
    MedicalSystem.EnsurePlayer(player)
    -- P2 电竞基地：疲劳累积速度降低（Lv1: -10%, Lv2: -20%, Lv3: -30%）
    local FacilitiesSystem = require("FacilitiesSystem")
    local ghLv = FacilitiesSystem.GetLevel(state, "gamingHouse")
    local mul = 1 - ghLv * 0.10
    player.fatigue = clamp((tonumber(player.fatigue) or 0) + math.floor((tonumber(amount) or 0) * mul + 0.5), 0, 100)
    return player.fatigue
end

--- 出战状态系数：疲劳越高战力越低（100 疲劳 ×0.88，RC-1 调优降极端值）；带伤作战再 ×0.6
function MedicalSystem.GetConditionFactor(player)
    MedicalSystem.EnsurePlayer(player)
    local fatigue = tonumber(player.fatigue) or 0
    local factor = 1 - (fatigue / 100) * 0.12
    if MedicalSystem.IsInjured(player) then factor = factor * 0.6 end
    return factor
end

--- 伤病判定：疲劳越高概率越大（≥70 ×1.5、≥85 ×2.0），医疗室降低概率；25% 重伤
function MedicalSystem.RollInjuries(state)
    MedicalSystem.Ensure(state)
    local FacilitiesSystem = require("FacilitiesSystem")
    local rateMul = FacilitiesSystem.GetMedicalRateMul(state)
    local RosterSystem = require("RosterSystem")
    for _, entry in ipairs(RosterSystem.GetAllPlayers(state)) do
        local p = MedicalSystem.EnsurePlayer(entry.player)
        if not MedicalSystem.IsInjured(p) then
            local fatigue = tonumber(p.fatigue) or 0
            local base = entry.bench and 0.035 or 0.06
            if fatigue >= 85 then base = base * 2.0
            elseif fatigue >= 70 then base = base * 1.5 end
            base = base * rateMul
            if math.random() < base then
                local heavy = math.random() < 0.25
                p.injury = {
                    weeks = heavy and math.random(3, 5) or math.random(1, 2),
                    severity = heavy and "heavy" or "light",
                }
                CompanyState.RecordTimeline(state, " 伤病",
                    p.name .. (heavy and " 重伤停赛 " or " 轻伤停赛 ") .. tostring(p.injury.weeks)
                    .. " 周（疲劳 " .. tostring(fatigue) .. "）。")
            end
        end
    end
end

--- 康复推进：每周伤停 -1 周，医疗室 Lv2/3 额外加速；痊愈后状态略降（久疏战阵）
function MedicalSystem.ProcessRecovery(state)
    MedicalSystem.Ensure(state)
    local FacilitiesSystem = require("FacilitiesSystem")
    local recoveryBonus = FacilitiesSystem.GetMedicalRecoveryBonus(state)
    -- P2-⑧ 队医：额外康复加速（StaffSystem.GetHealBonus）
    local StaffSystem = require("StaffSystem")
    recoveryBonus = recoveryBonus + StaffSystem.GetHealBonus(state)
    local RosterSystem = require("RosterSystem")
    for _, entry in ipairs(RosterSystem.GetAllPlayers(state)) do
        local p = entry.player
        if MedicalSystem.IsInjured(p) then
            local reduce = 1 + recoveryBonus
            p.injury.weeks = math.max(0, tonumber(p.injury.weeks) - reduce)
            if tonumber(p.injury.weeks) <= 0 then
                p.injury = nil
                p.form = clamp((tonumber(p.form) or 70) - 3, 0, 100)
                CompanyState.RecordTimeline(state, "✓ 伤愈复出",
                    p.name .. " 伤愈归队，状态略有下滑，需要时间找回节奏。")
            end
        end
    end
end

-- 理疗（恢复疲劳）：玩家主动操作，每员每周限 1 次，消耗现金
-- P2 完善：让医疗室从"只管伤"变成"管状态"
MedicalSystem.PHYSIO_COST = 10     -- 每次理疗费用（万）
MedicalSystem.PHYSIO_AMOUNT = 15   -- 每次理疗降低的疲劳值

function MedicalSystem.EnsurePhysio(state)
    state = CompanyState.Ensure(state)
    state.medical = state.medical or {}
    state.medical.physio = state.medical.physio or {}
    return state.medical.physio
end

function MedicalSystem.CanPhysio(state, playerId)
    MedicalSystem.EnsurePhysio(state)
    if state.medical.physio[playerId] then
        return false, "该选手本周已理疗"
    end
    if state.company.cash < MedicalSystem.PHYSIO_COST then
        return false, "现金不足，理疗需要 ¥" .. tostring(MedicalSystem.PHYSIO_COST) .. "万"
    end
    return true
end

function MedicalSystem.Physio(state, playerId)
    local ok, msg = MedicalSystem.CanPhysio(state, playerId)
    if not ok then return false, msg end
    local player = LeagueCatalog.GetPlayer(playerId)
    if not player then return false, "选手不存在" end
    MedicalSystem.EnsurePlayer(player)
    state.company.cash = state.company.cash - MedicalSystem.PHYSIO_COST
    player.fatigue = clamp(player.fatigue - MedicalSystem.PHYSIO_AMOUNT, 0, 100)
    state.medical.physio[playerId] = true
    CompanyState.RecordTimeline(state, " 理疗恢复",
        player.name .. " 接受理疗，疲劳下降 " .. tostring(MedicalSystem.PHYSIO_AMOUNT) .. "。")
    return true
end

-- 周结算时重置理疗限次
function MedicalSystem.ResetPhysioWeekly(state)
    MedicalSystem.EnsurePhysio(state)
    state.medical.physio = {}
end

--- 周结算：比赛负荷 → 疲劳结算 → 伤病判定 → 康复推进
--- 首发 +12（胜）/+15（负）疲劳（RC-1 调优降积累速度）；替补休息 -10；伤停者恢复 -6 且不再叠加
function MedicalSystem.ProcessWeek(state, legacyWon, hadMatch)
    state = CompanyState.Ensure(state)
    MedicalSystem.Ensure(state)
    local FacilitiesSystem = require("FacilitiesSystem")
    local ghRecover = FacilitiesSystem.GetGamingHouseRecoverBonus(state)  -- #141 电竞基地主动恢复
    local RosterSystem = require("RosterSystem")
    if hadMatch == false then
        -- #140 休赛周：无比赛负荷，全队疲劳快速回落
        for _, entry in ipairs(RosterSystem.GetAllPlayers(state)) do
            local p = MedicalSystem.EnsurePlayer(entry.player)
            p.fatigue = clamp(p.fatigue - 15, 0, 100)
        end
    else
        for _, entry in ipairs(RosterSystem.GetRosterPlayers(state)) do
            local p = MedicalSystem.EnsurePlayer(entry.player)
            if MedicalSystem.IsInjured(p) then
                p.fatigue = clamp(p.fatigue - 6, 0, 100)
            else
                local gain = legacyWon and 12 or 15
                p.fatigue = clamp(p.fatigue + gain, 0, 100)
                if ghRecover > 0 then
                    p.fatigue = clamp(p.fatigue - ghRecover, 0, 100)
                end
            end
        end
        for _, entry in ipairs(RosterSystem.GetBenchPlayers(state)) do
            local p = MedicalSystem.EnsurePlayer(entry.player)
            p.fatigue = clamp(p.fatigue - 10, 0, 100)
            if ghRecover > 0 then
                p.fatigue = clamp(p.fatigue - ghRecover, 0, 100)
            end
        end
    end
    MedicalSystem.RollInjuries(state)
    MedicalSystem.ProcessRecovery(state)
    MedicalSystem.ResetPhysioWeekly(state)
    return state.medical
end

return MedicalSystem
