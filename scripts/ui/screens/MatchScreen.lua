-- MatchScreen.lua — 本周比赛 (real data: pending decision/round engine via CompetitionSystem)
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local Kit = require("ui.WireframeKit")
local AppShell = require("ui.AppShell")
local CompanyState = require("CompanyState")
local LeagueCatalog = require("LeagueCatalog")

local function num(v, d) return tonumber(v) or d end
local function safe(v, d) return v == nil and (d or "") or v end

-- 模块级反馈缓冲：跨渲染周期保留上一次操作反馈
local lastMsg = nil

local function oppName(state)
    local oppId = state.match and state.match.opponentId
    if not oppId then return "待定对手" end
    local ok, n = pcall(function() return LeagueCatalog.GetTeamName(oppId, oppId) end)
    return (ok and n) or "待定对手"
end

local function submit(ctx, state, choiceId, isRound)
    local CompetitionSystem = require("CompetitionSystem")
    local done = false
    pcall(function()
        if isRound then
            done = CompetitionSystem.SubmitRoundChoice(state, choiceId) == true
        else
            done = CompetitionSystem.SubmitMatchDecision(state, choiceId) == true
        end
        require("SaveManager").Save(state)
    end)
    if done then
        ctx.nav("matchresult")
    else
        lastMsg = "指令未生效，请重试"
        ctx.nav("match")
    end
end

local function buildBlocks(ctx)
    local state = CompanyState.Ensure(CompanyState.GetState())
    local blocks = {}

    if lastMsg and lastMsg ~= "" then
        table.insert(blocks, { kind = "alert", lines = { { lastMsg, DS.C.gold } } })
        lastMsg = nil
    end
    local match = state.match or {}

    -- 1. 局内决策卡（最高优先级）
    local dec = match.pendingDecision
    if dec then
        table.insert(blocks, { kind = "alert", lines = { { safe(dec.title, "教练临场决策"), DS.C.gold } } })
        table.insert(blocks, { kind = "list", safe(dec.context, "") })
        table.insert(blocks, { kind = "sectionhdr", title = "选择指令", right = "第" .. tostring(num(state.company.week, 0)) .. "周" })
        for _, opt in ipairs(dec.options or {}) do
            table.insert(blocks, { kind = "list", safe(opt.label, opt.id) .. " · " .. safe(opt.desc, "") })
            table.insert(blocks, { kind = "cta", label = "执行 · " .. safe(opt.label, opt.id), onClick = function()
                submit(ctx, state, opt.id, false)
            end })
        end
        return blocks
    end

    -- 2. 回合事件卡
    local pr = match.pendingRound
    if pr then
        -- MatchSimulator returns `round` as the round DEFINITION table
        -- ({ id, label, desc }), not a scalar. Concatenating it directly threw
        -- "attempt to concatenate a table value" and made main.lua's pcall fall
        -- back to Dashboard — i.e. the match screen dies the moment a round
        -- decision comes up.
        local roundLabel = ""
        if type(pr.round) == "table" then
            roundLabel = safe(pr.round.label, safe(pr.round.id, ""))
        else
            roundLabel = safe(pr.round, "")
        end
        table.insert(blocks, { kind = "alert", lines = { {
            "回合决策 · 第 " .. tostring(num(pr.gameIndex, 1)) .. " 局 · " .. roundLabel, DS.C.gold } } })
        table.insert(blocks, { kind = "sectionhdr", title = "选择行动", right = "" })
        for _, opt in ipairs(pr.options or {}) do
            table.insert(blocks, { kind = "list", safe(opt.label, opt.id) .. " · " .. safe(opt.desc, "") })
            table.insert(blocks, { kind = "cta", label = "执行 · " .. safe(opt.label, opt.id), onClick = function()
                submit(ctx, state, opt.id, true)
            end })
        end
        return blocks
    end

    -- 3. 无进行中对局：赛前准备卡
    local week = num(state.company.week, 1)
    local seasonState = safe(state.company.seasonState, "regular")
    local lastReport = state.league and state.league.lastReport

    table.insert(blocks, { kind = "sectionhdr", title = "赛前准备", right = "第" .. tostring(week) .. "周 · " .. seasonState })
    if seasonState == "regular" then
        table.insert(blocks, { kind = "list", "本周对手按赛程轮转 · 点击下方「立即开赛」开启比赛（含 BP 与临场战术决策）" })
    else
        table.insert(blocks, { kind = "list", "当前阶段：" .. seasonState .. " · 季后赛/休赛期流程由下方「推进赛程」继续" })
    end

    -- 阵容与对手情报
    local RosterSystem = require("RosterSystem")
    local power = 0
    pcall(function() power = RosterSystem.GetTeamPower(state) end)
    table.insert(blocks, { kind = "kvrows", title = "我方状态", rows = {
        { "战队战力", tostring(power), DS.C.gold },
        { "化学默契", tostring(num(state.roster and state.roster.chemistry, 0)), DS.C.muted },
    } })

    -- 上周战报快捷入口
    if lastReport then
        local rep = lastReport.report or {}
        table.insert(blocks, { kind = "sectionhdr", title = "上周战报", right = "" })
        table.insert(blocks, { kind = "list", safe(rep.resultLine, "已结算") })
        table.insert(blocks, { kind = "cta", label = "查看完整战报", onClick = function() ctx.nav("matchresult") end })
    end

    -- 主行动点：直接开打推进，彻底消除跳回首页的割裂感
    table.insert(blocks, { kind = "cta", label = "立即开赛 · 推进赛程 ▶", onClick = function()
        AppShell.AdvanceWeek(ctx.nav)
    end })
    table.insert(blocks, { kind = "cta", label = "英雄 BP 演练", onClick = function() ctx.nav("bp") end })
    table.insert(blocks, { kind = "cta", label = "返回俱乐部首页", onClick = function() ctx.nav("dashboard") end })

    return blocks
end

local MatchScreen = {}

function MatchScreen.Build(navigate)
    local ctx = { nav = navigate }
    local blocks = buildBlocks(ctx)
    local nodes = Kit.renderBlocks(blocks, ctx)
    return AppShell.Build(navigate, "match", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return MatchScreen
