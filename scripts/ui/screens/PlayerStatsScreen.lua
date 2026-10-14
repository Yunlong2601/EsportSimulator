-- PlayerStatsScreen.lua — 选手数据 (real data: body status + power + timeline honors)
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

local function buildBlocks(ctx)
    local state = CompanyState.Ensure(CompanyState.GetState())
    local MoraleSystem = require("MoraleSystem")
    local TrainingSystem = require("TrainingSystem")

    local focus = PlayerFocus.Get()
    if not focus then
        return { { kind = "list", "阵容为空" } }
    end
    local p = focus.player
    local name = safe(RosterSystem.GetDisplayName(state, p), p.name)

    local morale = 50
    pcall(function() morale = MoraleSystem.Get(p) end)
    local mood = ""
    pcall(function() mood = MoraleSystem.GetMood(p) end)
    local power = 0
    pcall(function() power = RosterSystem.GetPlayerPower(p, focus.role) end)

    local blocks = {}

    -- 1. 头部
    table.insert(blocks, { kind = "profilehdr", items = {
        { "位置", ROLE_LABELS[p.role] or safe(p.role, "?"), false },
        { "年龄", tostring(num(p.age, 0)), false },
        { "体能", tostring(num(p.form, 0)), num(p.form, 0) >= 60 },
        { "士气", tostring(morale), morale >= 60 },
        { "战队", safe(state.company.name, "星环战队"), false },
    } })

    -- 2. 综合卡
    table.insert(blocks, { kind = "chipcard", title = "综合评价", chips = {
        "战力 " .. tostring(power),
        "潜力 " .. tostring(num(p.potential, 0)),
        "当前状态 " .. tostring(num(p.form, 0)),
    } })

    -- 3. 属性细分
    table.insert(blocks, { kind = "chipcard", title = "属性细分（0-100）", chips = {
        "操作 " .. tostring(num(p.mechanics, 0)),
        "对线 " .. tostring(num(p.laning, 0)),
        "团战 " .. tostring(num(p.teamfight, 0)),
    } })

    -- 4. 身体状态
    local trainFocus = "跟随全队"
    pcall(function()
        local cur = TrainingSystem.GetCurrentFocus(state)
        if cur and cur.label then trainFocus = cur.label end
    end)
    table.insert(blocks, { kind = "kvrows", title = "身体状态", rows = {
        { "当前状态", tostring(num(p.form, 0)) .. "/100", num(p.form, 0) >= 60 and DS.C.success or DS.C.warning },
        { "当前士气", safe(mood, "—") .. "（" .. tostring(morale) .. "）", morale >= 60 and DS.C.success or DS.C.warning },
        { "受伤状态", "健康", DS.C.success },
        { "训练重点", trainFocus, DS.C.muted },
    } })

    -- 5. 生涯高光（时间线中与该选手相关的记录）
    local related = {}
    for _, tl in ipairs(state.timeline or {}) do
        local desc = safe(tl.description, safe(tl.text, ""))
        if desc ~= "" and name ~= "?" and desc:find(name, 1, true) then
            table.insert(related, { title = tl.title, desc = desc })
        end
    end
    table.insert(blocks, { kind = "sectionhdr", title = "相关动态", right = "" })
    if #related > 0 then
        for i = 1, math.min(5, #related) do
            local tl = related[i]
            table.insert(blocks, { kind = "list", safe(tl.title, "动态") .. " · " .. safe(tl.desc, "") })
        end
    else
        table.insert(blocks, { kind = "list", "暂无该选手的相关动态记录" })
    end

    table.insert(blocks, { kind = "cta", label = "返回选手详情", onClick = function() ctx.nav("player_profile") end })

    return blocks
end

local PlayerStatsScreen = {}

function PlayerStatsScreen.Build(navigate)
    local ctx = { nav = navigate }
    local blocks = buildBlocks(ctx)
    local nodes = Kit.renderBlocks(blocks, ctx)
    return AppShell.Build(navigate, "player_stats", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes }, { rail = "team" })
end

return PlayerStatsScreen
