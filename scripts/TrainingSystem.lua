-- TrainingSystem：训练侧重构筑 + 个人特训 + 潜力兑现
-- 每周选择一个训练侧重（操作/团战/对线/心态），不同侧重有不同属性收益。
-- 负荷衰减：连续选择同一侧重收益递减，必须轮换。
-- 个人特训：针对单个选手的专项训练，消耗更多资源但收益更高。
-- 潜力兑现：潜力值高的选手训练收益更高（参考 FM 潜力成长曲线）。
-- 借鉴 Esports Manager 周训练计划取舍 + FM 训练模块。
local CompanyState = require("CompanyState")
local RosterSystem = require("RosterSystem")
local StaffSystem = require("StaffSystem")
local TierSystem = require("TierSystem")
local LeagueCatalog = require("LeagueCatalog")

local TrainingSystem = {}

TrainingSystem.TRAIN_COST = 15
TrainingSystem.PERSONAL_TRAIN_COST = 25 -- 个人特训费用更高
TrainingSystem.FACILITY_LEVELS = { 1, 2, 3 } -- 训练设施等级

TrainingSystem.FOCI = {
    mechanics = {
        id = "mechanics",
        label = "操作特训",
        short = "操作",
        desc = "强化个人操作与极限反应",
        gains = { mechanics = 2, teamfight = 1 },
        form = 0,
        chemistry = 0,
    },
    teamfight = {
        id = "teamfight",
        label = "团战合练",
        short = "团战",
        desc = "强化团战配合与阵型拉扯",
        gains = { teamfight = 2, mechanics = 1 },
        form = 0,
        chemistry = 2,
    },
    laning = {
        id = "laning",
        label = "对线特训",
        short = "对线",
        desc = "强化线上压制与资源控制",
        gains = { laning = 2, teamfight = 1 },
        form = 0,
        chemistry = 0,
    },
    mindset = {
        id = "mindset",
        label = "心态建设",
        short = "心态",
        desc = "稳定状态与心理韧性，属性成长放缓",
        gains = {},
        form = 3,
        chemistry = 3,
    },
    champion = {
        id = "champion",
        label = "英雄特训",
        short = "英雄",
        desc = "全队练习英雄池：提升英雄熟练度，有机会掌握新英雄",
        gains = {},
        form = 1,
        chemistry = 2,
        heroGain = 16,
    },
    rest = {
        id = "rest",
        label = "休整周",
        short = "休整",
        desc = "全队减压恢复：降低疲劳并小幅恢复状态（无属性成长）",
        gains = {},
        form = 2,
        chemistry = 1,
    },
}

local function clamp(value, minimum, maximum)
    return math.max(minimum, math.min(maximum, tonumber(value) or minimum))
end

-- 训练设施等级：state.facilities.training = 1/2/3（P1-⑥ 统一由 FacilitiesSystem 管理）
function TrainingSystem.GetFacilityLevel(state)
    state = CompanyState.Ensure(state)
    local FacilitiesSystem = require("FacilitiesSystem")
    FacilitiesSystem.Ensure(state)
    return FacilitiesSystem.GetLevel(state, "training")
end

-- 设施加成：每级 +1 训练收益
function TrainingSystem.GetFacilityBonus(state)
    local FacilitiesSystem = require("FacilitiesSystem")
    return FacilitiesSystem.GetTrainingBonus(state)
end

-- 设施升级费用：按等级递增
function TrainingSystem.GetFacilityUpgradeCost(state)
    local FacilitiesSystem = require("FacilitiesSystem")
    return FacilitiesSystem.GetUpgradeCost(state, "training")
end

-- 升级训练设施
function TrainingSystem.UpgradeFacility(state)
    local FacilitiesSystem = require("FacilitiesSystem")
    return FacilitiesSystem.Upgrade(state, "training")
end

-- 潜力兑现：潜力值高的选手训练收益更高（75 潜力 +1，85 +2，90 +3）
function TrainingSystem.GetPotentialBonus(player)
    local potential = tonumber(player and player.potential) or 60
    if potential >= 90 then return 3 end
    if potential >= 85 then return 2 end
    if potential >= 75 then return 1 end
    return 0
end

-- 计算「如果本周选择 focusId」的收益（主属性 + 次属性），供 UI 预览与训练执行
function TrainingSystem.GetEffectiveGains(state, focusId)
    state = CompanyState.Ensure(state)
    local focus = TrainingSystem.FOCI[focusId]
    if not focus then return nil end
    local lastFocus = state.roster.training.lastFocus
    local sameWeeks = tonumber(state.roster.training.sameFocusWeeks) or 0
    local penalty = 0
    if focusId == lastFocus then
        penalty = math.max(0, sameWeeks) -- 连续同侧重：第 2 周起 -1，第 3 周起 -2
    end
    local bonus = 0
    local coachLevel = StaffSystem.GetLevel(state, "coach")
    if coachLevel >= 3 then bonus = bonus + 1 end
    if coachLevel >= 5 then bonus = bonus + 1 end
    local chemistry = tonumber(state.roster.chemistry) or 30
    if chemistry >= 70 then bonus = bonus + 1 end
    if chemistry < 20 then bonus = bonus - 1 end
    bonus = bonus + TierSystem.GetTrainBonus(state)
    -- 训练设施等级加成（方向 A）
    bonus = bonus + TrainingSystem.GetFacilityBonus(state)
    local primary, secondary, primaryStat = 0, 0, nil
    for stat, amount in pairs(focus.gains) do
        if not primaryStat or amount > primary then
            primaryStat = stat
            secondary = primary
            primary = amount
        elseif amount > secondary then
            secondary = amount
        end
    end
    primary = math.max(0, primary + bonus - penalty)
    secondary = math.max(0, secondary + bonus - penalty)
    return {
        focus = focus,
        primaryStat = primaryStat,
        primary = primary,
        secondary = secondary,
        formGain = focus.form,
        chemGain = 2 + (focus.chemistry or 0) + (bonus - penalty),
        sameWeeks = sameWeeks,
        penalty = penalty,
        bonus = bonus,
        heroGain = focus.heroGain,
    }
end

function TrainingSystem.CanTrain(state)
    state = CompanyState.Ensure(state)
    if state.roster.trainedThisWeek == true then
        return false, "本周已完成训练，下周再选择新的侧重"
    end
    if state.company.cash < TrainingSystem.TRAIN_COST then
        return false, "现金不足，无法支付训练开支"
    end
    return true
end

-- 执行本周训练：扣费、按侧重成长属性、更新负荷与化学
function TrainingSystem.Train(state, focusId)
    state = CompanyState.Ensure(state)
    local focus = TrainingSystem.FOCI[focusId]
    if not focus then return false, "未知训练侧重" end
    local ok, reason = TrainingSystem.CanTrain(state)
    if not ok then return false, reason end
    state.company.cash = state.company.cash - TrainingSystem.TRAIN_COST
    state.roster.trainedThisWeek = true

    -- 负荷：切换侧重清零连击；连续同侧重连击 +1（收益递减）
    if state.roster.training.lastFocus == focusId then
        state.roster.training.sameFocusWeeks = (tonumber(state.roster.training.sameFocusWeeks) or 0) + 1
    else
        state.roster.training.sameFocusWeeks = 0
    end
    state.roster.training.lastFocus = focusId
    state.roster.training.focus = focusId

    local eff = TrainingSystem.GetEffectiveGains(state, focusId)
    local heroDetails = ""
    if focusId == "champion" then
        local HeroSystem = require("HeroSystem")
        local gained = HeroSystem.TrainHeroes(state, eff.bonus)
        heroDetails = "，英雄熟练度 +" .. tostring(eff.heroGain or 16) .. (eff.bonus > 0 and ("，教练/化学加成 +" .. tostring(eff.bonus)) or "")
        if #gained > 0 then
            heroDetails = heroDetails .. "（" .. table.concat(gained, "、") .. "）"
        end
    else
        for _, entry in ipairs(RosterSystem.GetRosterPlayers(state)) do
            local player = entry.player
            for stat, _ in pairs(focus.gains) do
                local amount = stat == eff.primaryStat and eff.primary or eff.secondary
                player[stat] = clamp(player[stat] + amount, 0, 100)
            end
            player.form = clamp(player.form + eff.formGain, 0, 100)
            if focusId == "mindset" then
                player.recentForm = clamp((tonumber(player.recentForm) or 0) + 1, -20, 20)
            end
        end
    end
    state.roster.chemistry = clamp(state.roster.chemistry + eff.chemGain, 0, 100)

    -- P1-③ 训练负荷：常规训练增加疲劳；休整周则降低疲劳（首发 -8，替补 -12），让玩家以成长换恢复
    local MedicalSystem = require("MedicalSystem")
    if focusId == "rest" then
        for _, entry in ipairs(RosterSystem.GetRosterPlayers(state)) do
            local p = MedicalSystem.EnsurePlayer(entry.player)
            p.fatigue = clamp(p.fatigue - 8, 0, 100)
        end
        for _, entry in ipairs(RosterSystem.GetBenchPlayers(state)) do
            local p = MedicalSystem.EnsurePlayer(entry.player)
            p.fatigue = clamp(p.fatigue - 12, 0, 100)
        end
    else
        for _, entry in ipairs(RosterSystem.GetRosterPlayers(state)) do
            MedicalSystem.AddFatigue(state, entry.player.id, 6)
        end
        for _, entry in ipairs(RosterSystem.GetBenchPlayers(state)) do
            MedicalSystem.AddFatigue(state, entry.player.id, 3)
        end
    end

    local gainText
    if focusId == "rest" then
        gainText = "全队疲劳下降，状态小幅回升"
    else
        gainText = eff.primary > 0 and ("主属性 +" .. tostring(eff.primary)) or (focusId == "champion" and "英雄池成长" or "心态成长")
    end
    if eff.penalty > 0 then gainText = gainText .. "（连续同类训练，收益 -" .. tostring(eff.penalty) .. "）" end
    if eff.bonus > 0 and focusId ~= "champion" then gainText = gainText .. "（教练/化学加成 +" .. tostring(eff.bonus) .. "）" end
    CompanyState.RecordTimeline(state, "战队训练",
        "本周进行「" .. focus.label .. "」，" .. gainText .. heroDetails .. "，化学 +" .. tostring(eff.chemGain) .. "。")
    return true, eff
end

function TrainingSystem.GetCurrentFocus(state)
    state = CompanyState.Ensure(state)
    return state.roster.training.focus
end

function TrainingSystem.GetFocusSummary(state)
    state = CompanyState.Ensure(state)
    local focusId = state.roster.training.focus
    if not focusId then return nil end
    local focus = TrainingSystem.FOCI[focusId]
    if not focus then return nil end
    return {
        id = focusId,
        label = focus.label,
        sameWeeks = tonumber(state.roster.training.sameWeeks) or 0,
    }
end

-- 个人特训：针对单个选手的专项训练（方向 A）
-- 消耗更多资源（¥25万），但收益更高（1.5x）且额外获得潜力兑现加成
function TrainingSystem.CanPersonalTrain(state, playerId)
    state = CompanyState.Ensure(state)
    if state.roster.trainedThisWeek == true then
        return false, "本周已完成团队训练，个人特训需要在团队训练之前进行"
    end
    if state.company.cash < TrainingSystem.PERSONAL_TRAIN_COST then
        return false, "现金不足，个人特训需要 ¥" .. tostring(TrainingSystem.PERSONAL_TRAIN_COST) .. "万"
    end
    local player = LeagueCatalog.GetPlayer(playerId)
    if not player then return false, "选手不存在" end
    -- 检查选手是否在阵容中（首发或替补）
    local inRoster = false
    for _, entry in ipairs(RosterSystem.GetAllPlayers(state)) do
        if entry.player.id == playerId then inRoster = true break end
    end
    if not inRoster then return false, "该选手不在你的阵容中" end
    return true, player
end

-- 执行个人特训
function TrainingSystem.PersonalTrain(state, playerId, focusId)
    state = CompanyState.Ensure(state)
    local ok, result = TrainingSystem.CanPersonalTrain(state, playerId)
    if not ok then return false, result end
    local player = result
    local focus = TrainingSystem.FOCI[focusId]
    if not focus then return false, "未知训练侧重" end

    state.company.cash = state.company.cash - TrainingSystem.PERSONAL_TRAIN_COST

    -- 个人特训收益：1.5x 团队训练收益 + 潜力兑现 + 设施加成
    local coachLevel = StaffSystem.GetLevel(state, "coach")
    local facilityBonus = TrainingSystem.GetFacilityBonus(state)
    local potentialBonus = TrainingSystem.GetPotentialBonus(player)
    local baseBonus = 0
    if coachLevel >= 3 then baseBonus = baseBonus + 1 end
    local totalBonus = baseBonus + facilityBonus + potentialBonus

    local primaryStat, primary, secondary = nil, 0, 0
    for stat, amount in pairs(focus.gains) do
        if not primaryStat or amount > primary then
            primaryStat = stat
            secondary = primary
            primary = amount
        elseif amount > secondary then
            secondary = amount
        end
    end
    -- 个人特训 1.5x 收益
    primary = math.max(0, math.floor(primary * 1.5 + totalBonus))
    secondary = math.max(0, math.floor(secondary * 1.5 + totalBonus))

    if focusId ~= "champion" then
        for stat, _ in pairs(focus.gains) do
            local amount = stat == primaryStat and primary or secondary
            player[stat] = clamp(player[stat] + amount, 0, 100)
        end
        player.form = clamp(player.form + math.floor(focus.form * 1.5), 0, 100)
    end

    local gainText = primary > 0 and (player.name .. " 主属性 +" .. tostring(primary)) or "心态成长"
    if potentialBonus > 0 then gainText = gainText .. "（潜力兑现 +" .. tostring(potentialBonus) .. "）" end
    if facilityBonus > 0 then gainText = gainText .. "（设施加成 +" .. tostring(facilityBonus) .. "）" end
    -- P1-③ 个人特训负荷：该选手疲劳 +4（RC-1 调优降特训疲劳）
    local MedicalSystem = require("MedicalSystem")
    MedicalSystem.AddFatigue(state, playerId, 4)
    CompanyState.RecordTimeline(state, "个人特训",
        player.name .. " 进行「" .. focus.label .. "」个人特训，" .. gainText .. "。")

    return true, {
        playerName = player.name,
        primary = primary,
        secondary = secondary,
        potentialBonus = potentialBonus,
        facilityBonus = facilityBonus,
    }
end

-- 获取选手训练收益预览（用于 UI 展示潜力兑现效果）
function TrainingSystem.GetPlayerTrainPreview(state, playerId, focusId)
    state = CompanyState.Ensure(state)
    local player = LeagueCatalog.GetPlayer(playerId)
    if not player then return nil end
    local focus = TrainingSystem.FOCI[focusId]
    if not focus then return nil end

    local potentialBonus = TrainingSystem.GetPotentialBonus(player)
    local facilityBonus = TrainingSystem.GetFacilityBonus(state)
    local coachLevel = StaffSystem.GetLevel(state, "coach")
    local baseBonus = 0
    if coachLevel >= 3 then baseBonus = baseBonus + 1 end
    local totalBonus = baseBonus + facilityBonus + potentialBonus

    local primaryStat, primary, secondary = nil, 0, 0
    for stat, amount in pairs(focus.gains) do
        if not primaryStat or amount > primary then
            primaryStat = stat
            secondary = primary
            primary = amount
        elseif amount > secondary then
            secondary = amount
        end
    end
    primary = math.max(0, math.floor(primary * 1.5 + totalBonus))
    secondary = math.max(0, math.floor(secondary * 1.5 + totalBonus))

    return {
        playerName = player.name,
        focus = focus,
        primaryStat = primaryStat,
        primary = primary,
        secondary = secondary,
        potentialBonus = potentialBonus,
        facilityBonus = facilityBonus,
        coachBonus = baseBonus,
        potential = tonumber(player.potential) or 60,
    }
end

return TrainingSystem
