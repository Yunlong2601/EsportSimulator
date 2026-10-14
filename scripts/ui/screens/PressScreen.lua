-- PressScreen.lua — 媒体中心 (real data: pending press conference + options via PressSystem)
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local Kit = require("ui.WireframeKit")
local AppShell = require("ui.AppShell")
local CompanyState = require("CompanyState")

local function num(v, d) return tonumber(v) or d end
local function safe(v, d) return v == nil and (d or "") or v end

-- 模块级反馈缓冲：跨渲染周期保留上一次操作反馈
local lastMsg = nil

local function buildBlocks(ctx)
    local state = CompanyState.Ensure(CompanyState.GetState())
    local PressSystem = require("PressSystem")

    local blocks = {}

    if lastMsg and lastMsg ~= "" then
        table.insert(blocks, { kind = "alert", lines = { { lastMsg, DS.C.gold } } })
        lastMsg = nil
    end

    -- 1. 待回应发布会
    local pending = nil
    pcall(function() pending = state.press and state.press.pending or PressSystem.CheckTrigger(state) end)
    if pending then
        table.insert(blocks, { kind = "alert", lines = { { "待回应 · " .. safe(pending.label, "媒体发布会"), DS.C.gold } } })
        table.insert(blocks, { kind = "chiprow", items = { { "高调宣战", false }, { "谦逊稳住", false }, { "甩锅推责", false } } })
        for _, optId in ipairs(pending.options or {}) do
            local opt = nil
            pcall(function() opt = PressSystem.OPTIONS[optId] end)
            if opt then
                table.insert(blocks, { kind = "list", safe(opt.label, optId) .. " · " .. safe(opt.desc, "") })
                table.insert(blocks, { kind = "cta", label = "选择 · " .. safe(opt.label, optId), onClick = function()
                    local ok, err = pcall(function()
                        PressSystem.Respond(state, optId)
                        require("SaveManager").Save(state)
                    end)
                    lastMsg = ok and ("已回应发布会：" .. safe(opt.label, optId)) or ("回应失败：" .. tostring(err))
                    ctx.nav("press")
                end })
            end
        end
    else
        table.insert(blocks, { kind = "alert", lines = { { "暂无待回应的发布会 · 连胜/连败 3 场时触发", DS.C.muted } } })
    end

    -- 2. 最近发布会记录
    table.insert(blocks, { kind = "sectionhdr", title = "最近发布会", right = "" })
    local lastRecord = state.press and state.press.lastRecord
    if lastRecord then
        table.insert(blocks, { kind = "list", safe(lastRecord, "") })
    else
        table.insert(blocks, { kind = "list", "尚无发布会记录" })
    end

    -- 3. 舆论热度
    local heat = num(state.social and state.social.heat, 50)
    local heatLabel = ""
    pcall(function() heatLabel = require("SocialSystem").GetHeatLabel(heat) end)
    table.insert(blocks, { kind = "statusbars", items = {
        { "舆论热度", safe(heatLabel, "") .. " " .. tostring(heat), math.min(100, heat) },
    } })

    -- 4. 近期舆论走势
    local hist = state.social and state.social.history or {}
    if #hist > 0 then
        table.insert(blocks, { kind = "sectionhdr", title = "舆论走势", right = "近5周" })
        local rows = {}
        for i = math.max(1, #hist - 4), #hist do
            local h = hist[i]
            local d = num(h and h.delta, 0)
            table.insert(rows, { "第" .. tostring(num(h and h.week, 0)) .. "周", (d >= 0 and "+" or "") .. tostring(d) })
        end
        table.insert(blocks, { kind = "ztable", rows = rows })
    end

    return blocks
end

local PressScreen = {}

function PressScreen.Build(navigate)
    local ctx = { nav = navigate }
    local blocks = buildBlocks(ctx)
    local nodes = Kit.renderBlocks(blocks, ctx)
    return AppShell.Build(navigate, "press", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return PressScreen
