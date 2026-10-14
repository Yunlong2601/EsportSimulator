-- PlayerAttrsScreen.lua — 选手属性 (real data: attrs via focus player + training gains preview)
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

local function attr20(v)
    return math.max(1, math.min(20, math.floor(num(v, 50) / 5)))
end

local function attrColor(v)
    return num(v, 0) >= 80 and DS.C.success or (num(v, 0) >= 65 and DS.C.gold or DS.C.muted)
end

local function buildBlocks(ctx)
    local state = CompanyState.Ensure(CompanyState.GetState())
    local TrainingSystem = require("TrainingSystem")

    local focus = PlayerFocus.Get()
    if not focus then
        return { { kind = "list", "阵容为空" } }
    end
    local p = focus.player
    local name = safe(RosterSystem.GetDisplayName(state, p), p.name)
    local morale = num(p.morale, 50)

    local blocks = {}

    -- 1. 头部
    table.insert(blocks, { kind = "profilehdr", items = {
        { "位置", ROLE_LABELS[p.role] or safe(p.role, "?"), false },
        { "年龄", tostring(num(p.age, 0)), false },
        { "体能", tostring(num(p.form, 0)), num(p.form, 0) >= 60 },
        { "士气", tostring(morale), morale >= 60 },
        { "战队", safe(state.company.name, "星环战队"), false },
    } })

    -- 2. 属性分组（内部 0-100 → 展示 0-20 档）
    table.insert(blocks, { kind = "attrgroups", groups = {
        { "基础", {
            { "操作", attr20(p.mechanics), attrColor(p.mechanics) },
            { "对线", attr20(p.laning), attrColor(p.laning) },
            { "团战", attr20(p.teamfight), attrColor(p.teamfight) },
        } },
        { "状态", {
            { "竞技状态", attr20(p.form), attrColor(p.form) },
            { "潜力上限", attr20(p.potential), attrColor(p.potential) },
            { "士气", attr20(morale * 0.8), morale >= 60 and DS.C.success or DS.C.warning },
        } },
    } })

    -- 3. 个人特训预览（操作特训）
    local preview = nil
    pcall(function() preview = TrainingSystem.GetPlayerTrainPreview(state, p.id, "mechanics") end)
    if preview then
        local gains = preview.gains or {}
        local parts = {}
        for k, v in pairs(gains) do
            table.insert(parts, k .. " +" .. tostring(num(v, 0)))
        end
        if #parts > 0 then
            table.insert(blocks, { kind = "kvrows", title = "个人特训预览（操作特训）", rows = {
                { "预计收益", table.concat(parts, " · "), DS.C.success },
                { "费用", "¥" .. tostring(num(TrainingSystem.PERSONAL_TRAIN_COST, 20)) .. "万", DS.C.muted },
            } })
            table.insert(blocks, { kind = "cta", label = "前往个人特训 · " .. name, onClick = function() ctx.nav("personal_train") end })
        end
    end

    table.insert(blocks, { kind = "cta", label = "返回选手详情", onClick = function() ctx.nav("player_profile") end })

    return blocks
end

local PlayerAttrsScreen = {}

function PlayerAttrsScreen.Build(navigate)
    local ctx = { nav = navigate }
    local blocks = buildBlocks(ctx)
    local nodes = Kit.renderBlocks(blocks, ctx)
    return AppShell.Build(navigate, "player_attrs", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes }, { rail = "team" })
end

return PlayerAttrsScreen
