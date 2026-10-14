-- AppShell.lua — global navigation spine (rebuilt to wireframe IA)
-- Top HUD (队名·段位 + 现金 + 推进赛程▶) + bottom 4 tabs (首页/战队/联赛/市场) + 战队 left rail.
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")

local AppShell = {}

local TABS = {
    { id = "dashboard", label = "首页" },
    { id = "roster",    label = "战队" },
    { id = "league",    label = "联赛" },
    { id = "market",    label = "市场" },
    { id = "more",      label = "更多" },
}

local RAIL = {
    { id = "roster",    label = "阵容" },
    { id = "personal_train", label = "训练" },
    { id = "academy",   label = "青训" },
    { id = "draft",     label = "选秀" },
    { id = "lockerroom",label = "更衣室" },
    { id = "coach",     label = "教练" },
}

local function safe(v, d) return v == nil and (d or "") or v end

-- 终局赛季状态 → 结局屏（#137）。破产 / 被解雇 / 预选赛出局是 GAME OVER，
-- 点「下一天」时直接落到 ending 屏，而不是让玩家对着一屏照常的首页发呆。
local ENDING_STATES = { bankrupt = true, fired = true, eliminated = true }

-- 下一天被「合法拒绝」时的玩家反馈（模块级，跨导航保留一次）。用既有 alert 样式
-- 在 HUD 下方呈现，与 FinanceScreen 的 lastMsg 同一套路，不新造通知系统。
local lastAdvanceMsg = nil

local function advanceWeek(nav)
    local CompanyState = require("CompanyState")
    local CompetitionSystem = require("CompetitionSystem")
    local SaveManager = require("SaveManager")
    local gameState = CompanyState.GetState()
    if not gameState then return end
    -- 捕获 AdvanceWeek 的 (advanced, reason)：pcall 的 ok 只说明「有没有抛错」，
    -- 不能说明「这一周到底推没推进」。旧写法丢弃了返回值，于是任何
    -- return false, "<reason>" 都被静默吞掉，玩家零反馈。
    local callOk, advanced, reason = pcall(function()
        local a, r = CompetitionSystem.AdvanceWeek(gameState)
        SaveManager.Save(gameState)
        return a, r
    end)
    if not callOk then
        -- a blocking event may need the board; route to more instead of skipping weeks
        if nav then nav("more") end
        return
    end
    local pending = gameState.match
        and (gameState.match.pendingDecision or gameState.match.pendingRound)
    -- 未推进且玩家没有被送去比赛屏时才提示：被送进比赛屏本身已是反馈，且
    -- "decision"/"round" 是内部标记，不适合直接显示。
    if advanced == false and type(reason) == "string" and reason ~= "" and not pending then
        lastAdvanceMsg = reason
    end
    local ss = gameState.company and gameState.company.seasonState
    if nav then
        if ENDING_STATES[ss] then
            -- 赛季已终结：结局屏是本局唯一的出路（含「重新开始」）
            nav("ending")
        else
            -- 局内决策/回合卡暂停 → 去比赛页处理；否则回首页
            nav(pending and "match" or "dashboard")
        end
    end
end

-- 导出供首页与比赛页直接调用的赛程推进函数，杜绝跳屏死循环
AppShell.AdvanceWeek = advanceWeek

local function topHud(nav, gameState)
    local CompanyState = require("CompanyState")
    local summary = CompanyState.GetSummary and CompanyState.GetSummary(gameState) or {}
    local tier = safe(gameState.tier, "LPL")
    local cash = tonumber(summary.cash) or 0
    local hud = UI.Panel {
        width = "100%", flexDirection = "row", alignItems = "center", justifyContent = "space-between",
        paddingLeft = DS.S.md, paddingRight = DS.S.md, paddingTop = DS.S.sm, paddingBottom = DS.S.sm,
        backgroundColor = DS.C.surface, borderWidth = 1, borderColor = DS.C.border,
        children = {
            UI.Panel { flexDirection = "column", gap = 1, children = {
                DS.Label(safe(gameState.name, "星环战队"), { fontSize = 13, fontWeight = "bold", fontColor = DS.C.text }),
                DS.Label("段位 · " .. tostring(tier), { fontSize = 10, fontColor = DS.C.gold }),
            } },
            UI.Panel { flexDirection = "row", alignItems = "center", gap = DS.S.sm, children = {
                DS.Label(DS.FormatCash(cash), { fontSize = 12, fontWeight = "bold", fontColor = cash < 0 and DS.C.error or DS.C.success }),
                DS.Button("推进赛程 ▶", function() advanceWeek(nav) end, { height = 34, fontSize = 12 }),
            } },
        },
    }
    -- 下一天被拒绝的原因：在 HUD 下方用既有 alert 框显示一次，然后清空。
    if lastAdvanceMsg and lastAdvanceMsg ~= "" then
        local msg = lastAdvanceMsg
        lastAdvanceMsg = nil
        return UI.Panel {
            width = "100%", flexDirection = "column", children = {
                hud,
                UI.Panel { width = "100%", paddingLeft = DS.S.md, paddingRight = DS.S.md, paddingBottom = DS.S.sm,
                    backgroundColor = DS.C.surface,
                    children = { DS.AlertBox({ { msg, DS.C.gold } }) } },
            },
        }
    end
    return hud
end

local function bottomTabs(nav, activeId)
    local nodes = {}
    for _, t in ipairs(TABS) do
        local on = t.id == activeId
        table.insert(nodes, UI.Button {
            text = t.label, height = 46, flexGrow = 1,
            backgroundColor = on and DS.C.ember or "#00000000",
            textColor = on and "#1a0e08" or DS.C.muted,
            fontSize = 12, fontWeight = on and "bold" or "normal",
            borderWidth = 0, borderRadius = 0,
            onClick = function() if nav then nav(t.id) end end,
        })
    end
    return UI.Panel {
        width = "100%", flexDirection = "row", borderWidth = 1, borderColor = DS.C.border,
        backgroundColor = DS.C.surface, children = nodes,
    }
end

local function rail(nav, activeId)
    local nodes = {}
    for _, r in ipairs(RAIL) do
        local on = r.id == activeId
        table.insert(nodes, UI.Button {
            text = r.label, height = 40, width = "100%",
            backgroundColor = on and DS.C.ember or DS.C.surface,
            textColor = on and "#1a0e08" or DS.C.muted,
            fontSize = 12, fontWeight = on and "bold" or "normal",
            borderWidth = 0, borderRadius = 0, textAlign = "center",
            onClick = function() if nav then nav(r.id) end end,
        })
    end
    return UI.Panel {
        width = 84, flexDirection = "column", gap = 4, padding = DS.S.sm,
        backgroundColor = DS.C.bg, borderWidth = 1, borderColor = DS.C.border,
        children = nodes,
    }
end

-- Build the full screen: Top HUD + (optional rail) + scrollable content + bottom tabs.
function AppShell.Build(nav, activeId, content, opts)
    opts = opts or {}
    if type(activeId) == "string" and activeId:sub(1, 3) == "sl_" then
        -- Old independent career must not read or advance the management world.
        local K = require("career.ui.Kit")
        return K.Shell("旧独立选手生涯", {
            content,
            K.Button("生涯首页", function() if nav then nav("sl_home") end end, true),
            K.Button("返回模式选择", function() if nav then nav("menu") end end, true),
        }, nav)
    end
    local gameState = require("CompanyState").GetState()
    local scrollContent = UI.Panel {
        flexGrow = 1, flexDirection = "column", padding = DS.S.md, gap = DS.S.sm,
        overflow = "scroll", children = { content },
    }
    local middle
    if opts.rail == "team" then
        middle = UI.Panel {
            width = "100%", flexGrow = 1, flexDirection = "row", children = {
                rail(nav, activeId), scrollContent,
            },
        }
    else
        middle = scrollContent
    end
    return UI.Panel {
        width = "100%", height = "100%", flexDirection = "column",
        backgroundColor = DS.C.bg, children = {
            topHud(nav, gameState),
            middle,
            bottomTabs(nav, activeId),
        },
    }
end

return AppShell
