-- BpScreen.lua — 英雄 BP（real data: HeroSystem ban/pick，仅英雄 BP，无地图 BP）
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local Kit = require("ui.WireframeKit")
local AppShell = require("ui.AppShell")
local CompanyState = require("CompanyState")
local LeagueCatalog = require("LeagueCatalog")
local HeroCatalog = require("HeroCatalog")

local function num(v, d) return tonumber(v) or d end
local function safe(v, d) return v == nil and (d or "") or v end

-- 模块级反馈缓冲：跨渲染周期保留上一次操作反馈
local lastMsg = nil

local function heroNameOf(heroId)
    local h = nil
    pcall(function() h = HeroCatalog.GetHero(heroId) end)
    return h and h.name or heroId
end

local function heroTagOf(heroId)
    local h = nil
    pcall(function() h = HeroCatalog.GetHero(heroId) end)
    return h and h.tag or nil
end

-- 推进 AI 的所有红方步骤（ban/pick），直到回到我方回合或 BP 完成
local function advanceAi(state)
    local HeroSystem = require("HeroSystem")
    local guard = 0
    while guard < 30 do
        guard = guard + 1
        local info = nil
        pcall(function() info = HeroSystem.GetBpStepInfo(state) end)
        if not info or info.side ~= "red" or info.phase == "ready" then break end
        pcall(function() HeroSystem.AutoBpStep(state) end)
    end
end

local function persist(state)
    pcall(function() require("SaveManager").Save(state) end)
end

local function pctColor(p)
    return p >= 0 and DS.C.success or DS.C.error
end

local function picksText(picks)
    local t = {}
    for _, role in ipairs(HeroCatalog.ROLES) do
        if picks and picks[role] then
            table.insert(t, (HeroCatalog.ROLE_LABELS[role] or role) .. ":" .. heroNameOf(picks[role]))
        end
    end
    return #t > 0 and table.concat(t, "  ") or "—"
end

-- 预计胜率可视化条（作为原生节点追加到 blocks 之后）
local function winBarNode(winProb)
    local p = math.max(2, math.min(100, math.floor(winProb)))
    local col = winProb >= 50 and DS.C.ember or DS.C.error
    return UI.Panel {
        width = "100%", height = 16, flexDirection = "row",
        backgroundColor = DS.C.surface, borderWidth = 1, borderColor = DS.C.border,
        borderRadius = 8, overflow = "hidden",
        children = {
            UI.Panel { width = tostring(p) .. "%", height = "100%", backgroundColor = col },
            UI.Panel { flexGrow = 1, height = "100%", backgroundColor = DS.C.surfaceAlt },
        },
    }
end

local function buildBlocks(ctx)
    local state = CompanyState.Ensure(CompanyState.GetState())
    local HeroSystem = require("HeroSystem")

    local blocks = {}
    local extra = {}

    if lastMsg and lastMsg ~= "" then
        table.insert(blocks, { kind = "alert", lines = { { lastMsg, DS.C.gold } } })
        lastMsg = nil
    end

    local m = nil
    pcall(function() m = HeroSystem.EnsureMatch(state) end)
    m = m or {}

    local oppLabel = "待定对手"
    if m.opponentId then
        local ok, n = pcall(function() return LeagueCatalog.GetTeamName(m.opponentId, m.opponentId) end)
        if ok and n then oppLabel = n end
    end

    local week = num(state.company.week, 0)
    table.insert(blocks, { kind = "sectionhdr", title = "英雄 BP · VS " .. oppLabel, right = "第" .. tostring(week) .. "周" })

    -- 无对手保护：BP 需要已安排的对手
    if not m.opponentId then
        table.insert(blocks, { kind = "alert", lines = { { "暂无对手：请先在赛程中安排本场比赛", DS.C.warning } } })
        table.insert(blocks, { kind = "cta", label = "返回赛前", onClick = function() ctx.nav("match") end })
        return blocks, extra
    end

    local phase = m.phase or "prep"
    local info = nil
    pcall(function() info = HeroSystem.GetBpStepInfo(state) end)
    info = info or { phase = "prep", side = "blue", myTurn = true }

    -- ============ 赛前准备 ============
    if phase == "prep" or info.phase == "prep" then
        local sig = nil
        pcall(function() sig = HeroSystem.GetOpponentSignature(state) end)
        if sig then
            table.insert(blocks, { kind = "kvrows", title = "对手情报", rows = {
                { "招牌英雄", safe(sig.heroName, "?") .. "（" .. safe(sig.playerName, "?") .. " · 熟练度 " .. tostring(num(sig.proficiency, 0)) .. "）", DS.C.warning },
            } })
        end
        local strat = nil
        pcall(function() strat = HeroSystem.GetAiStrategy(state) end)
        if strat then
            table.insert(blocks, { kind = "list", "对手倾向：" .. safe(strat.label, "") .. " —— " .. safe(strat.desc, "") })
        end
        local meta = nil
        pcall(function() meta = HeroSystem.GetSeasonMetaSummary(state) end)
        if meta and meta.strong and #meta.strong > 0 then
            local names = {}
            for _, h in ipairs(meta.strong) do table.insert(names, heroNameOf(h.id or h)) end
            table.insert(blocks, { kind = "list", "版本强势 · " .. table.concat(names, " · ") })
        end
        table.insert(blocks, { kind = "cta", label = "开始英雄 BP", onClick = function()
            local ok, err = pcall(function()
                HeroSystem.StartBp(state)
                advanceAi(state)
                persist(state)
            end)
            lastMsg = ok and "英雄 BP 开始（蓝方先手）" or ("开始失败：" .. tostring(err))
            ctx.nav("bp")
        end })
        table.insert(blocks, { kind = "cta", label = "AI 自动 BP（一键完成）", onClick = function()
            local ok, err = pcall(function()
                HeroSystem.StartBp(state)
                HeroSystem.AutoBp(state)
                persist(state)
            end)
            lastMsg = ok and "已自动完成 BP" or ("自动 BP 失败：" .. tostring(err))
            ctx.nav("bp")
        end })
        table.insert(blocks, { kind = "cta", label = "返回赛前", onClick = function() ctx.nav("match") end })
        return blocks, extra
    end

    -- ============ 就绪：阵容确认 + 胜率预览 ============
    if info.phase == "ready" or phase == "ready" then
        table.insert(blocks, { kind = "sectionhdr", title = "阵容确认", right = "BP 完成" })

        local roleRows = {}
        for _, role in ipairs(HeroCatalog.ROLES) do
            local myId = m.myPicks and m.myPicks[role]
            local oppId = m.oppPicks and m.oppPicks[role]
            table.insert(roleRows, {
                HeroCatalog.ROLE_LABELS[role] or role,
                (myId and heroNameOf(myId) or "—") .. "  VS  " .. (oppId and heroNameOf(oppId) or "—"),
                DS.C.text,
            })
        end
        table.insert(blocks, { kind = "kvrows", title = "对位阵容", rows = roleRows })

        -- 对位克制
        local cs = nil
        pcall(function() cs = HeroSystem.GetCounterSummary(state) end)
        if cs then
            table.insert(blocks, { kind = "list", "对位克制 " .. (cs.pct >= 0 and "+" or "") .. tostring(cs.pct) .. "%（我方 " .. tostring(cs.win) .. " 优 / 对手 " .. tostring(cs.lose) .. " 优）" })
            if cs.pairs then
                for _, pr in ipairs(cs.pairs) do
                    local verdict = pr.kind == "win" and " 克制 " or pr.kind == "lose" and " 被克 " or " 均势 "
                    table.insert(blocks, { kind = "list",
                        (HeroCatalog.ROLE_LABELS[pr.role] or pr.role) .. "：" .. (pr.my and pr.my.name or "?") .. verdict .. (pr.opp and pr.opp.name or "?") })
                end
            end
        end

        -- 激活羁绊
        local syn = nil
        pcall(function() syn = HeroSystem.GetActiveSynergies(state) end)
        if syn and syn.active and #syn.active > 0 then
            local names = {}
            for _, s in ipairs(syn.active) do table.insert(names, s.name .. "(+" .. tostring(s.pct) .. "%)") end
            table.insert(blocks, { kind = "list", "激活羁绊 · " .. table.concat(names, " · ") })
        end

        -- BP 战力评估 + 胜率
        local ds = nil
        pcall(function() ds = HeroSystem.GetDraftScore(state) end)
        if ds then
            table.insert(blocks, { kind = "kvrows", title = "BP 评估", rows = {
                { "克制加成", (ds.counterPct >= 0 and "+" or "") .. tostring(ds.counterPct) .. "%", pctColor(ds.counterPct) },
                { "阵容羁绊", "+" .. tostring(ds.synergy) .. "%", DS.C.success },
                { "版本强度", (ds.versionAdv >= 0 and "+" or "") .. tostring(math.floor(ds.versionAdv * 100)) .. "%", pctColor(ds.versionAdv) },
            } })
            table.insert(extra, winBarNode(ds.winProb))
            table.insert(blocks, { kind = "kvrows", title = "胜率预览", rows = {
                { "预计胜率", tostring(math.floor(ds.winProb)) .. "%", ds.winProb >= 50 and DS.C.ember or DS.C.error },
                { "综合优势", (ds.score >= 0 and "+" or "") .. tostring(math.floor(ds.score * 10) / 10), pctColor(ds.score) },
            } })
        end

        table.insert(blocks, { kind = "cta", label = "开始比赛", onClick = function() ctx.nav("match") end })
        table.insert(blocks, { kind = "cta", label = "重新 BP", onClick = function()
            local ok, err = pcall(function()
                HeroSystem.StartMatch(state, m.opponentId)
                HeroSystem.StartBp(state)
                persist(state)
            end)
            lastMsg = ok and "已重置 BP" or ("重置失败：" .. tostring(err))
            ctx.nav("bp")
        end })
        table.insert(blocks, { kind = "cta", label = "返回赛前", onClick = function() ctx.nav("match") end })
        return blocks, extra
    end

    -- ============ 对手行动中（兜底：红方步骤未自动结算）============
    if info.side ~= "blue" then
        table.insert(blocks, { kind = "alert", lines = { { "对手 " .. (info.phase == "ban" and "禁用" or "选人") .. " 中…", DS.C.gold } } })
        table.insert(blocks, { kind = "cta", label = "继续（对手行动）", onClick = function()
            local ok, err = pcall(function()
                advanceAi(state)
                persist(state)
            end)
            lastMsg = ok and "已结算对手行动" or ("操作失败：" .. tostring(err))
            ctx.nav("bp")
        end })
        return blocks, extra
    end

    -- ============ 禁用阶段（我方回合）============
    if info.phase == "ban" then
        table.insert(blocks, { kind = "alert", lines = { { safe(info.label, "禁用阶段") .. "（蓝方 · 我方回合）", DS.C.gold } } })

        local myBans = {}
        for _, h in ipairs(m.myBans or {}) do table.insert(myBans, heroNameOf(h)) end
        local oppBans = {}
        for _, h in ipairs(m.oppBans or {}) do table.insert(oppBans, heroNameOf(h)) end
        table.insert(blocks, { kind = "kvrows", title = "禁用", rows = {
            { "我方禁用", #myBans > 0 and table.concat(myBans, " · ") or "—", DS.C.muted },
            { "对手禁用", #oppBans > 0 and table.concat(oppBans, " · ") or "—", DS.C.muted },
        } })

        -- 抢 Ban 推荐（一键 ban 对手招牌 / 克制 / 版本强势）
        local rec = nil
        pcall(function() rec = HeroSystem.GetMyBanRecommendation(state) end)
        if rec and not m.used[rec.heroId] then
            table.insert(blocks, { kind = "cta", label = "抢 Ban · " .. safe(rec.name, rec.heroId), onClick = function()
                local ok, err = pcall(function()
                    HeroSystem.BanHero(state, rec.heroId)
                    advanceAi(state)
                    persist(state)
                end)
                lastMsg = ok and ("已禁用 " .. safe(rec.name, rec.heroId)) or ("禁用失败：" .. tostring(err))
                ctx.nav("bp")
            end })
        end

        -- 英雄池：点击禁用
        table.insert(blocks, { kind = "sectionhdr", title = "英雄池（点击禁用）", right = "" })
        for _, hero in ipairs(HeroCatalog.HEROES) do
            if not m.used[hero.id] then
                table.insert(blocks, { kind = "cta", label = safe(hero.name, hero.id) .. " · " .. safe(hero.tag, ""), onClick = function()
                    local ok, err = pcall(function()
                        HeroSystem.BanHero(state, hero.id)
                        advanceAi(state)
                        persist(state)
                    end)
                    lastMsg = ok and ("已禁用 " .. safe(hero.name, hero.id)) or ("禁用失败：" .. tostring(err))
                    ctx.nav("bp")
                end })
            end
        end

        table.insert(blocks, { kind = "cta", label = "AI 自动 BP（剩余）", onClick = function()
            local ok, err = pcall(function()
                HeroSystem.AutoBp(state)
                persist(state)
            end)
            lastMsg = ok and "BP 已完成" or ("操作失败：" .. tostring(err))
            ctx.nav("bp")
        end })
        table.insert(blocks, { kind = "cta", label = "返回赛前", onClick = function() ctx.nav("match") end })
        return blocks, extra
    end

    -- ============ 选人阶段（我方回合）============
    if info.phase == "pick" then
        local role = info.role
        table.insert(blocks, { kind = "alert", lines = { { safe(info.label, "选人阶段") .. "（蓝方 · 我方回合）", DS.C.gold } } })
        table.insert(blocks, { kind = "kvrows", title = "选人", rows = {
            { "当前位置", HeroCatalog.ROLE_LABELS[role] or role, DS.ROLE_COLOR(role) },
            { "我方已选", picksText(m.myPicks), DS.C.muted },
            { "对手已选", picksText(m.oppPicks), DS.C.muted },
        } })

        table.insert(blocks, { kind = "sectionhdr", title = "可选英雄（" .. (HeroCatalog.ROLE_LABELS[role] or role) .. "）", right = "" })
        local pool = HeroCatalog.HEROES_BY_ROLE[role] or {}
        for _, hero in ipairs(pool) do
            if not m.used[hero.id] then
                local strong = false
                pcall(function() strong = HeroSystem.IsSeasonStrong(state, hero.id) end)
                local label = safe(hero.name, hero.id) .. " · " .. safe(hero.tag, "")
                if strong then label = label .. " ★" end
                table.insert(blocks, { kind = "cta", label = label, onClick = function()
                    local ok, err = pcall(function()
                        HeroSystem.PickHero(state, role, hero.id)
                        advanceAi(state)
                        persist(state)
                    end)
                    lastMsg = ok and ("已选 " .. safe(hero.name, hero.id)) or ("选人失败：" .. tostring(err))
                    ctx.nav("bp")
                end })
            end
        end

        table.insert(blocks, { kind = "cta", label = "AI 自动 BP（剩余）", onClick = function()
            local ok, err = pcall(function()
                HeroSystem.AutoBp(state)
                persist(state)
            end)
            lastMsg = ok and "BP 已完成" or ("操作失败：" .. tostring(err))
            ctx.nav("bp")
        end })
        table.insert(blocks, { kind = "cta", label = "返回赛前", onClick = function() ctx.nav("match") end })
        return blocks, extra
    end

    -- fallback
    table.insert(blocks, { kind = "cta", label = "返回赛前", onClick = function() ctx.nav("match") end })
    return blocks, extra
end

local BpScreen = {}

function BpScreen.Build(navigate)
    local ctx = { nav = navigate }
    local blocks, extra = buildBlocks(ctx)
    local nodes = Kit.renderBlocks(blocks, ctx)
    if extra then
        for _, n in ipairs(extra) do table.insert(nodes, n) end
    end
    return AppShell.Build(navigate, "bp", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return BpScreen
