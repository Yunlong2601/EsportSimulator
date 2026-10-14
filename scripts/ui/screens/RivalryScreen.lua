-- RivalryScreen.lua — 宿敌恩怨 (real data: rivalries + trash-talk + poach via RivalrySystem)
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local Kit = require("ui.WireframeKit")
local AppShell = require("ui.AppShell")
local CompanyState = require("CompanyState")

local function num(v, d) return tonumber(v) or d end
local function safe(v, d) return v == nil and (d or "") or v end

-- 模块级反馈缓冲：点击回调在旧 ctx 上写入，但 ctx.nav 会触发重新 Build 生成新 ctx，
-- 旧 ctx.flash 会丢失。故用模块级变量跨渲染周期保留上一次操作反馈。
local lastMsg = nil

local function buildBlocks(ctx)
    local state = CompanyState.Ensure(CompanyState.GetState())
    local RivalrySystem = require("RivalrySystem")
    local SaveManager = require("SaveManager")
    RivalrySystem.Ensure(state)

    local blocks = {}

    -- 上一次操作反馈
    if lastMsg and lastMsg ~= "" then
        table.insert(blocks, { kind = "alert", lines = { { lastMsg, DS.C.gold } } })
        lastMsg = nil
    end

    -- 当前重点宿敌（等级最高者）
    local rivals = {}
    pcall(function() rivals = RivalrySystem.GetRivalries(state) end)
    local target = rivals[1]

    -- 1. 宿敌列表
    table.insert(blocks, { kind = "sectionhdr", title = "宿敌列表", right = "恩怨值 / 对位胜" })
    if #rivals == 0 then
        table.insert(blocks, { kind = "list", "当前没有宿敌 — 关键战淘汰 / 连败 / 强挖核心会积累恩怨值" })
    else
        for _, r in ipairs(rivals) do
            local lvl = pcall(function() return RivalrySystem.GetLevelLabel(r.level) end) and RivalrySystem.GetLevelLabel(r.level) or ""
            table.insert(blocks, { kind = "kvrows", title = r.name .. " · " .. lvl, rows = {
                { "恩怨值", tostring(r.score) .. "/12", DS.C.gold },
                { "对位胜", tostring(r.winsVs), DS.C.muted },
                { "最近事件", safe(r.lastEvent, "—"), DS.C.muted },
            } })
        end
    end

    -- 2. 嘴炮选择（作用于重点宿敌）
    table.insert(blocks, { kind = "sectionhdr", title = "发起嘴炮", right = target and ("对象：" .. target.name) or "无宿敌" })
    if target then
        local opts = {}
        pcall(function() opts = RivalrySystem.GetTrashTalkOptions() end)
        for _, o in ipairs(opts) do
            table.insert(blocks, { kind = "list", o.label .. " · " .. safe(o.desc, "") })
            table.insert(blocks, { kind = "cta", label = "发动 · " .. o.label, onClick = function()
                local res = nil
                pcall(function() res = RivalrySystem.TrashTalk(state, target.teamId, o.id) end)
                pcall(function() SaveManager.Save(state) end)
                if res and res.ok then
                    lastMsg = "已发动「" .. o.label .. "」：" .. table.concat(res.effects or {}, "，")
                    if res.reply then lastMsg = lastMsg .. " | " .. res.reply end
                elseif res then
                    lastMsg = res.text
                else
                    lastMsg = "（操作未完成，请重试）"
                end
                ctx.nav("rivalry")
            end })
        end
    else
        table.insert(blocks, { kind = "list", "暂无可发动嘴炮的目标" })
    end

    -- 3. 挖角目标（自由市场，前 6）
    table.insert(blocks, { kind = "sectionhdr", title = "挖角战", right = target and ("挖向：" .. target.name) or "无宿敌" })
    if target then
        local agents = {}
        pcall(function()
            local MarketSystem = require("MarketSystem")
            agents = MarketSystem.GetFreeAgentsWithMeta(state)
        end)
        local shown = 0
        for _, a in ipairs(agents) do
            if shown >= 6 then break end
            shown = shown + 1
            local p = a.player
            table.insert(blocks, { kind = "list", safe(p.name, p.id) .. " · 身价约 ¥" .. tostring(num(a.asking, 0)) .. "万" })
            table.insert(blocks, { kind = "cta", label = "从 " .. target.name .. " 挖来 · " .. safe(p.name, p.id), onClick = function()
                local res = nil
                pcall(function() res = RivalrySystem.TryPoach(state, target.teamId, p.id) end)
                pcall(function() SaveManager.Save(state) end)
                if res then lastMsg = res.text else lastMsg = "（挖角操作未完成，请重试）" end
                ctx.nav("rivalry")
            end })
        end
        if shown == 0 then
            table.insert(blocks, { kind = "list", "自由市场暂无可用球星" })
        end
    else
        table.insert(blocks, { kind = "list", "需要先有宿敌才能发动挖角战" })
    end

    -- 4. CTA
    table.insert(blocks, { kind = "cta", label = "返回阵容", onClick = function() ctx.nav("roster") end })

    return blocks
end

local RivalryScreen = {}

function RivalryScreen.Build(navigate)
    local ctx = { nav = navigate }
    local blocks = buildBlocks(ctx)
    local nodes = Kit.renderBlocks(blocks, ctx)
    return AppShell.Build(navigate, "rivalry", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return RivalryScreen
