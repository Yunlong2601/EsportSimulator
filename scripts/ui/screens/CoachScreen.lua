-- CoachScreen.lua — 战队·教练 (real data: staff levels/effects + identity & board)
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local Kit = require("ui.WireframeKit")
local AppShell = require("ui.AppShell")
local CompanyState = require("CompanyState")
local CoachSystem = require("CoachSystem")
local StaffSystem = require("StaffSystem")
local SaveManager = require("SaveManager")

local function safe(v, d) return v == nil and (d or "") or v end
local function num(v, d) return tonumber(v) or d end

local lastMsg = nil

local STAFF_DISPLAY = {
    { role = "coach",      label = "教练",     color = DS.C.role_coach },
    { role = "analyst",    label = "分析师",   color = DS.C.role_analyst },
    { role = "operations", label = "运营",     color = DS.C.info },
    { role = "psychologist", label = "心理师", color = DS.C.info },
    { role = "medic",      label = "队医",     color = DS.C.role_medic },
    { role = "headScout",  label = "首席球探", color = DS.C.role_scout },
}

local function buildBlocks(ctx)
    local state = CompanyState.Ensure(CompanyState.GetState())

    -- 教练身份与董事会
    local idn = {}
    local okI, i = pcall(function() return CoachSystem.GetIdentity(state) end)
    if okI and i then idn = i end

    local roleText = "主教练（打工中）"
    local okR, rt = pcall(function() return CoachSystem.GetRoleText(state) end)
    if okR and rt then roleText = rt end

    -- 员工等级与效果
    local levels, upgradeCosts = {}, {}
    for _, s in ipairs(STAFF_DISPLAY) do
        local okL, lv = pcall(function() return StaffSystem.GetLevel(state, s.role) end)
        levels[s.role] = okL and num(lv, 1) or 1
        local okU, uc = pcall(function() return StaffSystem.GetUpgradeCost(state, s.role) end)
        upgradeCosts[s.role] = okU and num(uc, 0) or 0
    end

    local coachBonus, trainForm, trainStat, acadGrowth, fanBonus, wages = 0, 0, 0, 0, 0, 0
    local moraleStab, healBonus = 0, 0
    local scoutBonus = { hitBonus = 0, costReduce = 0 }
    pcall(function() coachBonus = StaffSystem.GetCoachBonus(state) end)
    pcall(function() trainForm = StaffSystem.GetTrainFormGain(state) end)
    pcall(function() trainStat = StaffSystem.GetTrainStatGain(state) end)
    pcall(function() acadGrowth = StaffSystem.GetAcademyGrowthBonus(state) end)
    pcall(function() fanBonus = StaffSystem.GetWeeklyFanBonus(state) end)
    pcall(function() wages = StaffSystem.GetStaffWages(state) end)
    pcall(function() moraleStab = StaffSystem.GetMoraleStability(state) end)
    pcall(function() healBonus = StaffSystem.GetHealBonus(state) end)
    pcall(function()
        local sb = StaffSystem.GetScoutBonus(state)
        if sb then scoutBonus = sb end
    end)

    -- stafflist items: {label, level, upgrade cost, skills, color}
    local staffItems = {}
    for _, s in ipairs(STAFF_DISPLAY) do
        local lv = levels[s.role]
        local skills = {}
        if s.role == "coach" then
            skills = { { "战力加成", string.format("+%.0f%%", (num(coachBonus, 1) - 1) * 100) }, { "状态训练", "+" .. num(trainForm, 0) } }
        elseif s.role == "analyst" then
            skills = { { "属性训练", "+" .. num(trainStat, 0) }, { "青训成长", "+" .. num(acadGrowth, 0) } }
        elseif s.role == "operations" then
            skills = { { "每周粉丝", "+" .. num(fanBonus, 0) } }
        elseif s.role == "psychologist" then
            skills = { { "士气稳定", string.format("-%.0f%%", num(moraleStab, 0) * 100) } }
        elseif s.role == "medic" then
            skills = { { "康复加速", "+" .. string.format("%.1f", num(healBonus, 0)) .. "/周" } }
        elseif s.role == "headScout" then
            skills = { { "球探命中", string.format("+%.0f%%", num(scoutBonus.hitBonus, 0) * 100) }, { "球探费用", string.format("-%.0f%%", num(scoutBonus.costReduce, 0) * 100) } }
        end
        table.insert(staffItems, { s.label, "Lv." .. lv, "升级 ¥" .. upgradeCosts[s.role] .. "万", skills, s.color })
    end

    -- 教练当前等级（用于 CTA）
    local coachLv = levels["coach"]
    local coachCost = upgradeCosts["coach"]

    local blocks = {
        { kind = "sectionhdr", title = "教练与治理", right = safe(idn.boardLabel, "") },
        { kind = "kvrows", title = "身份", rows = {
            { "角色", roleText, DS.C.gold },
            { "老板", safe(idn.bossName, "—"), DS.C.muted },
            { "周薪", "¥" .. num(idn.salary, 0) .. "万 · 胜场奖金 ¥" .. num(idn.winBonus, 0) .. "万", DS.C.muted },
            { "持股", num(idn.owned, 0) .. "% / 控股需 " .. num(idn.threshold, 0) .. "%", DS.C.muted },
            { "股价", "¥" .. string.format("%.2f", num(idn.sharePrice, 0)), DS.C.muted },
            { "董事会支持", string.format("%.0f%%", num(idn.support, 0)), num(idn.support, 0) >= 60 and DS.C.success or DS.C.error },
        } },
        { kind = "sectionhdr", title = "团队效果", right = "员工周薪 ¥" .. num(wages, 0) .. "万" },
        { kind = "ztable", rows = {
            { "教练战力加成", string.format("+%.0f%%", (num(coachBonus, 1) - 1) * 100) },
            { "训练状态增益", "+" .. num(trainForm, 0) },
            { "训练属性增益", "+" .. num(trainStat, 0) },
            { "青训成长加成", "+" .. num(acadGrowth, 0) },
            { "每周粉丝增长", "+" .. num(fanBonus, 0) },
            { "士气波动抑制", string.format("-%.0f%%", num(moraleStab, 0) * 100) },
            { "队医康复加速", string.format("+%.1f/周", num(healBonus, 0)) },
        } },
        { kind = "sectionhdr", title = "员工团队 (Lv 上限 5)", right = "" },
        { kind = "stafflist", items = staffItems },
        coachLv >= 5 and { "教练团队已达 Lv.5 上限", "section" }
            or { kind = "cta", label = "升级教练 Lv." .. coachLv .. " → Lv." .. (coachLv + 1) .. " (¥" .. coachCost .. "万)", onClick = function()
                local ok, err = pcall(function()
                    StaffSystem.UpgradeStaff(state, "coach")
                    SaveManager.Save(state)
                end)
                lastMsg = ok and ("教练已升级至 Lv." .. tostring(coachLv + 1)) or ("升级失败：" .. tostring(err))
                ctx.nav("coach")
            end },
        { "教练等级提升全队战力与训练效果 · 每周结算员工周薪", "section" },
    }
    if lastMsg and lastMsg ~= "" then
        table.insert(blocks, 1, { kind = "alert", lines = { { lastMsg, DS.C.gold } } })
        lastMsg = nil
    end
    return blocks
end

local CoachScreen = {}

function CoachScreen.Build(navigate)
    local ctx = { nav = navigate }
    local nodes = Kit.renderBlocks(buildBlocks(ctx), ctx)
    return AppShell.Build(navigate, "coach", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes }, { rail = "team" })
end

return CoachScreen
