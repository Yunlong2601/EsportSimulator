-- CareerArcScreen.lua — 选手生涯剧情 (real data: active arcs + choices via CareerArcSystem)
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local Kit = require("ui.WireframeKit")
local AppShell = require("ui.AppShell")
local CompanyState = require("CompanyState")

local function num(v, d) return tonumber(v) or d end
local function safe(v, d) return v == nil and (d or "") or v end

-- 模块级反馈缓冲：跨渲染周期保留上一次操作反馈（ctx.nav 会触发重新 Build，旧 ctx.flash 丢失）
local lastMsg = nil

local function buildBlocks(ctx)
    local state = CompanyState.Ensure(CompanyState.GetState())
    local CareerArcSystem = require("CareerArcSystem")
    local SaveManager = require("SaveManager")
    CareerArcSystem.Ensure(state)

    local blocks = {}

    -- 上一次操作反馈
    if lastMsg and lastMsg ~= "" then
        table.insert(blocks, { kind = "alert", lines = { { lastMsg, DS.C.success } } })
        lastMsg = nil
    end

    -- 1. 进行中的剧情卡（选项）
    table.insert(blocks, { kind = "sectionhdr", title = "进行中的生涯剧情", right = "" })
    local arcs = {}
    pcall(function() arcs = CareerArcSystem.GetActiveArcs(state) end)
    if #arcs == 0 then
        table.insert(blocks, { kind = "list", "当前没有进行中的剧情 — 每周有概率触发选手爆发 / 低谷 / 伤愈 / 续约风波" })
    else
        for _, arc in ipairs(arcs) do
            local desc = safe(arc.label, arc.type) .. " · " .. safe(arc.playerName, arc.playerId)
            table.insert(blocks, { kind = "alert", lines = { { desc, DS.C.gold } } })
            table.insert(blocks, { kind = "list", safe(arc.desc, "") })
            for _, c in ipairs(arc.choices or {}) do
                table.insert(blocks, { kind = "cta", label = safe(c.label, c.id) .. " · " .. safe(c.desc, ""), onClick = function()
                    local res = nil
                    pcall(function() res = CareerArcSystem.Resolve(state, arc.id, c.id, false) end)
                    pcall(function() SaveManager.Save(state) end)
                    if res then lastMsg = res.text .. (res.effects and ("（" .. table.concat(res.effects, "，") .. "）") or "") end
                    ctx.nav("career")
                end })
            end
        end
    end

    -- 2. 生涯档案（已结算记录）
    table.insert(blocks, { kind = "sectionhdr", title = "生涯档案", right = "已结算" })
    local log = state.careerArcs and state.careerArcs.log or {}
    if #log == 0 then
        table.insert(blocks, { kind = "list", "暂无已结算的生涯剧情" })
    else
        for i = 1, math.min(#log, 15) do
            local e = log[i]
            table.insert(blocks, { kind = "list", "第" .. tostring(num(e.week, 0)) .. "周 · " .. safe(e.player, "") .. " · " .. safe(e.text, "") })
        end
    end

    -- 3. CTA
    table.insert(blocks, { kind = "cta", label = "返回阵容", onClick = function() ctx.nav("roster") end })

    return blocks
end

local CareerArcScreen = {}

function CareerArcScreen.Build(navigate)
    local ctx = { nav = navigate }
    local blocks = buildBlocks(ctx)
    local nodes = Kit.renderBlocks(blocks, ctx)
    return AppShell.Build(navigate, "career", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return CareerArcScreen
