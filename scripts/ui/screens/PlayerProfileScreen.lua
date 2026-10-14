-- PlayerProfileScreen.lua — 选手详情 (real data: focus player profile via RosterSystem/MoraleSystem)
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

local function fmtWan(n)
    n = num(n, 0)
    if n >= 10000 then
        return "¥" .. tostring(math.floor(n / 1000) / 10) .. "亿"
    end
    return "¥" .. tostring(math.floor(n * 10) / 10) .. "万"
end

local function attr20(v)
    -- 0-100 内部值 → 0-20 展示档
    return math.max(1, math.min(20, math.floor(num(v, 50) / 5)))
end

local function buildBlocks(ctx)
    local state = CompanyState.Ensure(CompanyState.GetState())
    local MoraleSystem = require("MoraleSystem")

    local focus = PlayerFocus.Get()
    if not focus then
        return { { kind = "list", "阵容为空 · 先在青训/市场补充选手" } }
    end
    local p = focus.player
    local name = safe(RosterSystem.GetDisplayName(state, p), p.name)
    local morale = 50
    pcall(function() morale = MoraleSystem.Get(p) end)
    local power = 0
    pcall(function() power = RosterSystem.GetPlayerPower(p, focus.role) end)
    local value = 0
    pcall(function() value = RosterSystem.GetTransferValue(state, p.id) end)
    local roleLabel = ROLE_LABELS[p.role] or safe(p.role, "?")

    local blocks = {}

    -- 1. 头部
    table.insert(blocks, { kind = "profilehdr", items = {
        { "位置", roleLabel, false },
        { "年龄", tostring(num(p.age, 0)), false },
        { "体能", tostring(num(p.form, 0)), num(p.form, 0) >= 60 },
        { "士气", tostring(morale), morale >= 60 },
        { "战队", safe(state.company.name, "星环战队"), false },
    } })

    -- 2. 关键卡
    local potStars = math.max(1, math.min(5, math.floor(num(p.potential, 0) / 20)))
    table.insert(blocks, { kind = "chipcard", chips = {
        "潜力 " .. string.rep("★", potStars),
        "战力 " .. tostring(power),
        "身价 " .. fmtWan(value),
    } })

    -- 3. 核心属性（0-20 档）
    table.insert(blocks, { kind = "attrrow2", items = {
        { { "操作", attr20(p.mechanics), num(p.mechanics, 0) >= 75 and DS.C.success or DS.C.muted }, { "对线", attr20(p.laning), num(p.laning, 0) >= 75 and DS.C.success or DS.C.muted } },
        { { "团战", attr20(p.teamfight), num(p.teamfight, 0) >= 75 and DS.C.success or DS.C.muted }, { "状态", attr20(p.form), num(p.form, 0) >= 60 and DS.C.success or DS.C.muted } },
    } })

    -- 4. 心态
    local mood = ""
    pcall(function() mood = MoraleSystem.GetMood(p) end)
    local wantsTransfer = false
    pcall(function() wantsTransfer = MoraleSystem.WantsTransfer(p) == true end)
    local blocksSection = { kind = "kvrows", title = "心态", rows = {
        { "士气", safe(mood, "—") .. "（" .. tostring(morale) .. "）", morale >= 60 and DS.C.success or DS.C.warning },
        { "转会意愿", wantsTransfer and "有离队想法" or "愿意留队", wantsTransfer and DS.C.warning or DS.C.success },
    } }
    table.insert(blocks, blocksSection)

    -- 5. 导航
    table.insert(blocks, { kind = "sectionhdr", title = "详情页", right = "" })
    table.insert(blocks, { kind = "actiongrid", items = {
        { "属性", "" }, { "合同", "" }, { "数据", "" },
    } })
    table.insert(blocks, { kind = "cta", label = "查看完整属性", onClick = function() ctx.nav("player_attrs") end })
    table.insert(blocks, { kind = "cta", label = "查看合同", onClick = function() ctx.nav("player_contract") end })
    table.insert(blocks, { kind = "cta", label = "查看赛季数据", onClick = function() ctx.nav("player_stats") end })

    return blocks
end

local PlayerProfileScreen = {}

function PlayerProfileScreen.Build(navigate)
    local ctx = { nav = navigate }
    local blocks = buildBlocks(ctx)
    local nodes = Kit.renderBlocks(blocks, ctx)
    return AppShell.Build(navigate, "player_profile", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes }, { rail = "team" })
end

return PlayerProfileScreen
