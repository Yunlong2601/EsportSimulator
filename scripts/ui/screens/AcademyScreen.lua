-- AcademyScreen.lua — 战队·青训 (real data: trainees + scout + academy standings)
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local Kit = require("ui.WireframeKit")
local AppShell = require("ui.AppShell")
local CompanyState = require("CompanyState")
local AcademySystem = require("AcademySystem")
local RosterSystem = require("RosterSystem")
local SaveManager = require("SaveManager")
local HeroCatalog = require("HeroCatalog")

local ROLE_LABELS = HeroCatalog.ROLE_LABELS or {
    top = "上单", jungle = "打野", mid = "中单", adc = "射手", support = "辅助",
}

local function safe(v, d) return v == nil and (d or "") or v end
local function num(v, d) return tonumber(v) or d end

local lastMsg = nil

local function traineePower(trainee)
    local ok, r = pcall(function() return AcademySystem.GetPlayerPower(trainee) end)
    return ok and num(r, 0) or 0
end

local function buildBlocks(ctx)
    local state = CompanyState.Ensure(CompanyState.GetState())

    -- 学员名单
    local trainees = {}
    local okT, list = pcall(function() return AcademySystem.GetTrainees(state) end)
    if okT and list then trainees = list end

    local cap = 5
    local okC, order = pcall(function() return AcademySystem.ROLE_ORDER end)
    if okC and type(order) == "table" then cap = #order end

    -- 青训总战力 / 平均能力
    local totalPower, avgBase = 0, 0
    for _, entry in ipairs(trainees) do
        local t = entry.trainee
        if t then
            totalPower = totalPower + traineePower(t)
            avgBase = avgBase + (num(t.mechanics, 0) + num(t.teamfight, 0) + num(t.laning, 0)) / 3
        end
    end
    local n = #trainees
    local avg = n > 0 and math.floor(avgBase / n + 0.5) or 0

    -- 招募费用
    local scoutCost = 30
    local okS, cost = pcall(function() return AcademySystem.GetScoutCost(state) end)
    if okS and cost then scoutCost = num(cost, 30) end

    -- youthlist items: {role, name, ageStr, meta, power, potential grade}
    local items = {}
    for _, entry in ipairs(trainees) do
        local t = entry.trainee
        if t then
            local weeks = num(t.weeks, 0)
            local recent = num(t.recentForm, 0)
            local recentStr = recent >= 0 and ("近期 +" .. recent) or ("近期 " .. recent)
            local okG, grade = pcall(function() return AcademySystem.GetPotentialGrade(t.potential) end)
            table.insert(items, {
                safe(ROLE_LABELS[t.role], "?"),
                safe(t.name, "?"),
                "入训 " .. weeks .. " 周",
                recentStr,
                traineePower(t),
                (okG and grade) or "?",
            })
        end
    end

    -- 青训积分榜
    local standRows = {}
    local okA, standings = pcall(function() return AcademySystem.GetStandings(state) end)
    if okA and standings then
        for rank, e in ipairs(standings) do
            if rank <= 8 then
                table.insert(standRows, { safe(e.teamName, e.teamId or "?"), num(e.wins, 0) .. "胜" .. num(e.losses, 0) .. "负 · " .. num(e.score, 0) .. "分" })
            end
        end
    end

    local blocks = {
        { kind = "sectionhdr", title = "青训学院", right = "学员 " .. n .. " / " .. cap .. " · 招募 ¥" .. scoutCost .. "万" },
        { kind = "chipcard", chips = { "人数 " .. n, "平均能力 " .. avg, "青训总战力 " .. totalPower } },
    }

    if lastMsg and lastMsg ~= "" then
        table.insert(blocks, { kind = "alert", lines = { { lastMsg, DS.C.gold } } })
        lastMsg = nil
    end

    if n > 0 then
        table.insert(blocks, { kind = "sectionhdr", title = "在训学员", right = "" })
        table.insert(blocks, { kind = "youthlist", title = "在训学员", items = items })
        for _, entry in ipairs(trainees) do
            local t = entry.trainee
            if t then
                table.insert(blocks, { kind = "cta", label = "晋升 " .. safe(t.name, "?") .. " 至一队", onClick = function()
                    local okP, pres = pcall(function() return AcademySystem.PromoteTrainee(state, t.role) end)
                    pcall(function() SaveManager.Save(state) end)
                    if okP and pres == true then
                        lastMsg = "已提拔 " .. safe(t.name, "?") .. " 至一队首发"
                    else
                        lastMsg = (type(pres) == "string" and pres) or "晋升失败，请重试"
                    end
                    ctx.nav("academy")
                end })
            end
        end
    else
        table.insert(blocks, { "还没有学员 · 点下方「招募学员」开始", "section" })
    end

    table.insert(blocks, { kind = "cta", label = "招募学员 (¥" .. scoutCost .. "万)", onClick = function()
        pcall(function() AcademySystem.ScoutTrainee(state) end)
        pcall(function() SaveManager.Save(state) end)
        ctx.nav("academy")
    end })

    if #standRows > 0 then
        table.insert(blocks, { kind = "sectionhdr", title = "青训联赛积分榜", right = "" })
        table.insert(blocks, { kind = "ztable", rows = standRows })
    end

    table.insert(blocks, { "学员每周随青训联赛成长 · 满条件后可晋升一队（每位置一名学员）", "section" })
    return blocks
end

local AcademyScreen = {}

function AcademyScreen.Build(navigate)
    local ctx = { nav = navigate }
    local nodes = Kit.renderBlocks(buildBlocks(ctx), ctx)
    return AppShell.Build(navigate, "academy", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes }, { rail = "team" })
end

return AcademyScreen
