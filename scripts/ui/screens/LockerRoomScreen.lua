-- LockerRoomScreen.lua — 战队·更衣室 (real data: relationships + chemistry + team morale)
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local Kit = require("ui.WireframeKit")
local AppShell = require("ui.AppShell")
local CompanyState = require("CompanyState")
local RosterSystem = require("RosterSystem")
local MoraleSystem = require("MoraleSystem")
local PlayerEcoSystem = require("PlayerEcoSystem")
local LeagueCatalog = require("LeagueCatalog")
local HeroCatalog = require("HeroCatalog")

local ROLE_LABELS = HeroCatalog.ROLE_LABELS or {
    top = "上单", jungle = "打野", mid = "中单", adc = "射手", support = "辅助",
}

local function safe(v, d) return v == nil and (d or "") or v end
local function num(v, d) return tonumber(v) or d end

local function power(player, role)
    local ok, r = pcall(function() return RosterSystem.GetPlayerPower(player, role) end)
    return ok and num(r, 0) or 0
end

local function playerName(state, playerId)
    if not playerId or playerId == "" then return "—" end
    local ok, p = pcall(function() return LeagueCatalog.GetPlayer(playerId) end)
    if ok and p then return safe(p.name, "—") end
    return "—"
end

local function buildBlocks(ctx)
    local state = CompanyState.Ensure(CompanyState.GetState())

    -- 关系网
    local rel = { duo = { a = "", b = "" }, captain = "", conflicts = {} }
    local okR, r = pcall(function() return PlayerEcoSystem.GetRelationship(state) end)
    if okR and r then rel = r end

    local captainName = playerName(state, rel.captain)
    local captainStr = (rel.captain and rel.captain ~= "") and (captainName .. (rel.captainActive and " ✓" or "（未首发）")) or "未任命"
    local duoStr = (rel.duo and rel.duo.a ~= "" and rel.duo.b ~= "")
        and (playerName(state, rel.duo.a) .. " + " .. playerName(state, rel.duo.b) .. (rel.duoActive and " ✓" or "（未首发）"))
        or "未设置"
    local conflicts = rel.conflicts or {}
    local chemistry = num(state.roster and state.roster.chemistry, 0)

    -- 全队选手（首发 + 替补）按士气排序
    local all = {}
    local okS, sList = pcall(function() return RosterSystem.GetRosterPlayers(state) end)
    if okS and sList then
        for _, e in ipairs(sList) do table.insert(all, e) end
    end
    local okB, bList = pcall(function() return RosterSystem.GetBenchPlayers(state) end)
    if okB and bList then
        for _, e in ipairs(bList) do table.insert(all, e) end
    end

    local rows = {}
    for _, entry in ipairs(all) do
        local p = entry and entry.player
        if p then
            local okM, label = pcall(function() return MoraleSystem.GetMood(p) end)
            table.insert(rows, { p = p, morale = num(p.morale, 60), mood = (okM and label) or "" })
        end
    end
    table.sort(rows, function(a, b) return a.morale < b.morale end)

    local moraleItems = {}
    for i, row in ipairs(rows) do
        local p = row.p
        table.insert(moraleItems, { i, safe(ROLE_LABELS[p.role], "?"), safe(p.name, "?"), power(p, p.role), row.mood })
    end

    -- 矛盾对
    local conflictRows = {}
    for _, c in ipairs(conflicts) do
        table.insert(conflictRows, { playerName(state, c.a) .. " × " .. playerName(state, c.b), "待调解", DS.C.error })
    end

    local blocks = {
        { kind = "kpi", text = "队长 " .. captainStr .. " · 搭档 " .. duoStr .. " · 矛盾 " .. #conflicts .. " 对 · 团队默契 " .. chemistry },
        { kind = "chip", text = "操作模式：任命队长 / 设搭档 / 加矛盾 / 调解（通过更衣室事件触发）" },
    }

    if #moraleItems > 0 then
        table.insert(blocks, { kind = "sectionhdr", title = "全队士气（低 → 高）", right = "" })
        table.insert(blocks, { kind = "benchlist", title = "选手 (" .. #moraleItems .. ")", items = moraleItems })
    else
        table.insert(blocks, { "暂无选手数据", "section" })
    end

    if #conflictRows > 0 then
        table.insert(blocks, { kind = "sectionhdr", title = "矛盾提醒", right = "" })
        table.insert(blocks, { kind = "kvrows", title = "待调解矛盾", rows = conflictRows })
        table.insert(blocks, { "矛盾会拉低比赛修正与团队默契 · 尽快通过事件调解", "section" })
    else
        table.insert(blocks, { "当前没有矛盾 · 更衣室氛围良好", "section" })
    end

    table.insert(blocks, { "默契影响全队战力加成（当前 +" .. math.floor(chemistry / 2) .. "%）· 士气影响个人战力", "section" })
    return blocks
end

local LockerRoomScreen = {}

function LockerRoomScreen.Build(navigate)
    local ctx = { nav = navigate }
    local nodes = Kit.renderBlocks(buildBlocks(ctx), ctx)
    return AppShell.Build(navigate, "lockerroom", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes }, { rail = "team" })
end

return LockerRoomScreen
