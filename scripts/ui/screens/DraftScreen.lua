-- DraftScreen.lua — 战队·选秀 (real data: draft pool + picks left + close draft)
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local Kit = require("ui.WireframeKit")
local AppShell = require("ui.AppShell")
local CompanyState = require("CompanyState")
local DraftSystem = require("DraftSystem")
local RosterSystem = require("RosterSystem")
local LeagueCatalog = require("LeagueCatalog")
local SaveManager = require("SaveManager")
local HeroCatalog = require("HeroCatalog")

local ROLE_LABELS = HeroCatalog.ROLE_LABELS or {
    top = "上单", jungle = "打野", mid = "中单", adc = "射手", support = "辅助",
}

local function safe(v, d) return v == nil and (d or "") or v end
local function num(v, d) return tonumber(v) or d end

local lastMsg = nil

local function power(player, role)
    local ok, r = pcall(function() return RosterSystem.GetPlayerPower(player, role) end)
    return ok and num(r, 0) or 0
end

local function buildBlocks(ctx)
    local state = CompanyState.Ensure(CompanyState.GetState())

    local draft = {}
    local okD, d = pcall(function() return DraftSystem.GetDraft(state) end)
    if okD and d then draft = d end
    local isOpen = false
    local okO, o = pcall(function() return DraftSystem.IsOpen(state) end)
    if okO then isOpen = o == true end

    local season = num(state.company and state.company.seasons, 1)

    if not isOpen then
        return {
            { kind = "kpi", text = "当前没有进行中的选秀" },
            { "选秀在赛季节点自动开启 · 新秀池届时生成", "section" },
            { "已完成赛季：第 " .. season .. " 赛季", "list" },
        }
    end

    -- 新秀池
    local pool = {}
    local okP, plist = pcall(function() return DraftSystem.GetPoolPlayers(state) end)
    if okP and plist then pool = plist end

    -- squadlist items: {signed, role, name, age, meta, ovr, pot}
    local items = {}
    for _, p in ipairs(pool) do
        local signed = draft.signed and draft.signed[p.id] == true
        local okG, grade = pcall(function() return LeagueCatalog.GetPotentialGrade(p.potential) end)
        table.insert(items, {
            signed,
            safe(ROLE_LABELS[p.role], "?"),
            safe(p.name, "?"),
            num(p.age, 18),
            "潜力 " .. ((okG and grade) or "?"),
            power(p, p.role),
            num(p.potential, 0),
        })
    end

    local picksLeft = num(draft.picksLeft, 0)

    local blocks = {
        { kind = "kpi", text = "第 " .. season .. " 赛季选秀进行中 · 剩余签约次数 " .. picksLeft },
        { kind = "chipcard", chips = { "新秀 " .. #items .. " 名", "已签 " .. (draft.signed and "是" or "否") } },
    }

    if lastMsg and lastMsg ~= "" then
        table.insert(blocks, { kind = "alert", lines = { { lastMsg, DS.C.gold } } })
        lastMsg = nil
    end

    if #items > 0 then
        table.insert(blocks, { kind = "sectionhdr", title = "新秀池", right = "橙色 = 已签下" })
        table.insert(blocks, { kind = "squadlist", items = items })
        for _, p in ipairs(pool) do
            local signed = draft.signed and draft.signed[p.id] == true
            table.insert(blocks, { kind = "cta", label = (signed and "已签 · " or "签约 · ") .. safe(p.name, "?"), onClick = function()
                local okP, pres = pcall(function() return DraftSystem.PickRookie(state, p.id) end)
                pcall(function() SaveManager.Save(state) end)
                if okP and pres == true then
                    lastMsg = "已签下新秀 " .. safe(p.name, "?")
                else
                    lastMsg = (type(pres) == "string" and pres) or "签约失败，请重试"
                end
                ctx.nav("draft")
            end })
        end
    else
        table.insert(blocks, { "新秀池已空", "section" })
    end

    table.insert(blocks, { kind = "cta", label = "完成选秀 / 跳过", onClick = function()
        pcall(function() DraftSystem.CloseDraft(state) end)
        pcall(function() SaveManager.Save(state) end)
        ctx.nav("draft")
    end })

    table.insert(blocks, { "签下的新秀优先进入替补席 · 满则补首发空位", "section" })
    return blocks
end

local DraftScreen = {}

function DraftScreen.Build(navigate)
    local ctx = { nav = navigate }
    local nodes = Kit.renderBlocks(buildBlocks(ctx), ctx)
    return AppShell.Build(navigate, "draft", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes }, { rail = "team" })
end

return DraftScreen
