-- PersonalTrainScreen.lua — 个人特训 (real data: focus player + training focus via TrainingSystem)
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local Kit = require("ui.WireframeKit")
local AppShell = require("ui.AppShell")
local CompanyState = require("CompanyState")
local RosterSystem = require("RosterSystem")
local HeroCatalog = require("HeroCatalog")
local PlayerFocus = require("ui.PlayerFocus")

local ROLE_LABELS = HeroCatalog.ROLE_LABELS or {
    top = "上单", jungle = "打野", mid = "中单", adc = "射手", support = "辅助",
}

local function num(v, d) return tonumber(v) or d end
local function safe(v, d) return v == nil and (d or "") or v end

local lastMsg = nil

local function buildBlocks(ctx)
    local state = CompanyState.Ensure(CompanyState.GetState())
    local TrainingSystem = require("TrainingSystem")

    local focus = PlayerFocus.Get()
    if not focus then
        return { { kind = "list", "阵容为空 · 无法个人特训" } }
    end
    local p = focus.player
    local name = safe(RosterSystem.GetDisplayName(state, p), p.name)

    local blocks = {}

    if lastMsg and lastMsg ~= "" then
        table.insert(blocks, { kind = "alert", lines = { { lastMsg, DS.C.gold } } })
        lastMsg = nil
    end

    -- 1. 说明卡
    local canTrain, reason = false, ""
    pcall(function() canTrain, reason = TrainingSystem.CanPersonalTrain(state, p.id) end)
    if canTrain then
        table.insert(blocks, { kind = "alert", lines = { { "可特训 · " .. name .. " · 费用 ¥" .. tostring(num(TrainingSystem.PERSONAL_TRAIN_COST, 20)) .. "万", DS.C.success } } })
    else
        table.insert(blocks, { kind = "alert", lines = { { safe(reason, "当前无法特训"), DS.C.warning } } })
    end

    -- 2. 目标选手卡
    local power = 0
    pcall(function() power = RosterSystem.GetPlayerPower(p, focus.role) end)
    table.insert(blocks, { kind = "kvrows", title = "特训对象", rows = {
        { "选手", name .. " · " .. (ROLE_LABELS[p.role] or safe(p.role, "?")), DS.C.text },
        { "战力/潜力", tostring(power) .. " / " .. tostring(num(p.potential, 0)), DS.C.muted },
        { "当前状态", tostring(num(p.form, 0)) .. "/100", num(p.form, 0) >= 60 and DS.C.success or DS.C.warning },
    } })

    -- 3. 训练侧重 + 预览（每个 focus 一条 + CTA）
    table.insert(blocks, { kind = "sectionhdr", title = "选择训练侧重", right = "" })
    local foci = {}
    pcall(function()
        for _, f in pairs(TrainingSystem.FOCI or {}) do
            table.insert(foci, f)
        end
        table.sort(foci, function(a, b) return tostring(a.id) < tostring(b.id) end)
    end)
    for _, f in ipairs(foci) do
        local preview = nil
        pcall(function() preview = TrainingSystem.GetPlayerTrainPreview(state, p.id, f.id) end)
        local gainText = ""
        if preview then
            local parts = {}
            for k, v in pairs(preview.gains or {}) do
                table.insert(parts, k .. " +" .. tostring(num(v, 0)))
            end
            if #parts > 0 then gainText = "（" .. table.concat(parts, " · ") .. "）" end
        end
        table.insert(blocks, { kind = "list", safe(f.label, f.id) .. " · " .. safe(f.desc, "") .. gainText })
        table.insert(blocks, { kind = "cta", label = "执行特训 · " .. safe(f.label, f.id), onClick = function()
            local ok, err = pcall(function()
                TrainingSystem.PersonalTrain(state, p.id, f.id)
                require("SaveManager").Save(state)
            end)
            lastMsg = ok and ("已完成 " .. safe(f.label, f.id) .. " 特训 · " .. name) or ("特训失败：" .. tostring(err))
            ctx.nav("personal_train")
        end })
    end

    -- 4. 本周团队训练状态
    local trained = state.roster and state.roster.trainedThisWeek == true
    table.insert(blocks, { kind = "kvrows", title = "团队训练", rows = {
        { "本周团队训练", trained and "已完成" or "未进行", trained and DS.C.muted or DS.C.gold },
        { "顺序提示", "个人特训需在团队训练之前", DS.C.faint },
    } })
    table.insert(blocks, { kind = "cta", label = "前往团队训练", onClick = function() ctx.nav("tactics") end })

    return blocks
end

local PersonalTrainScreen = {}

function PersonalTrainScreen.Build(navigate)
    local ctx = { nav = navigate }
    local blocks = buildBlocks(ctx)
    local nodes = Kit.renderBlocks(blocks, ctx)
    return AppShell.Build(navigate, "personal_train", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes }, { rail = "team" })
end

return PersonalTrainScreen
