-- TransferBoardScreen.lua — 转会榜 (real data: transfer news/rumors via TransferNewsSystem)
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local Kit = require("ui.WireframeKit")
local AppShell = require("ui.AppShell")
local CompanyState = require("CompanyState")

local function num(v, d) return tonumber(v) or d end
local function safe(v, d) return v == nil and (d or "") or v end

local function fmtWan(n)
    n = num(n, 0)
    if n >= 10000 then
        return "¥" .. tostring(math.floor(n / 1000) / 10) .. "亿"
    end
    return "¥" .. tostring(math.floor(n * 10) / 10) .. "万"
end

local function buildBlocks(ctx)
    local state = CompanyState.Ensure(CompanyState.GetState())
    local TransferNewsSystem = require("TransferNewsSystem")

    local blocks = {}

    -- 1. 统计卡
    local stats = { weekCount = 0, weekTotal = 0, seasonCount = 0, seasonTotal = 0, topAmount = 0, topDeal = nil }
    pcall(function() stats = TransferNewsSystem.GetBoardStats(state) end)
    local statLines = { "本周成交 " .. tostring(num(stats.weekCount, 0)) .. " 笔 · " .. fmtWan(stats.weekTotal) }
    table.insert(statLines, "赛季成交 " .. tostring(num(stats.seasonCount, 0)) .. " 笔 · " .. fmtWan(stats.seasonTotal))
    if stats.topDeal then
        table.insert(statLines, "标王 · " .. safe(stats.topDeal.playerName, "?") .. " " .. fmtWan(stats.topDeal.amount))
    end
    table.insert(blocks, { kind = "kpi", table.concat(statLines, "\n") })

    -- 2. 转会成交榜（按金额降序，前 10）
    local board = {}
    pcall(function() board = TransferNewsSystem.GetBoard(state) end)
    table.insert(blocks, { kind = "sectionhdr", title = "转会成交榜", right = "按金额" })
    if #board > 0 then
        local rows = {}
        for i = 1, math.min(10, #board) do
            local n = board[i]
            table.insert(rows, {
                tostring(i),
                safe(n.playerName, "?"),
                safe(n.sellerName, "?") .. " → " .. safe(n.buyerName, "?"),
                tostring(num(n.amount, 0)),
            })
        end
        table.insert(blocks, { kind = "table", title = "# / 选手 / 转会 / 金额（万）", cols = { "#", "选手", "转会", "金额" }, rows = rows })
    else
        table.insert(blocks, { kind = "list", "本赛季暂无转会成交记录" })
    end

    -- 3. 转会传闻
    local rumors = {}
    pcall(function() rumors = TransferNewsSystem.GetRumors(state) end)
    table.insert(blocks, { kind = "sectionhdr", title = "转会传闻", right = tostring(#rumors) .. " 条" })
    if #rumors > 0 then
        for i, r in ipairs(rumors) do
            if i > 6 then break end
            table.insert(blocks, { kind = "list", safe(r.text, "传闻") })
        end
    else
        table.insert(blocks, { kind = "list", "暂无转会传闻" })
    end

    table.insert(blocks, { kind = "cta", label = "返回转会市场", onClick = function() ctx.nav("market") end })

    return blocks
end

local TransferBoardScreen = {}

function TransferBoardScreen.Build(navigate)
    local ctx = { nav = navigate }
    local blocks = buildBlocks(ctx)
    local nodes = Kit.renderBlocks(blocks, ctx)
    return AppShell.Build(navigate, "transferboard", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return TransferBoardScreen
