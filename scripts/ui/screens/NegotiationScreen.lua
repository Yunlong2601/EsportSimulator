-- NegotiationScreen.lua — 谈判 (real data: active/concluded negotiations via NegotiationSystem)
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local Kit = require("ui.WireframeKit")
local AppShell = require("ui.AppShell")
local CompanyState = require("CompanyState")

local function num(v, d) return tonumber(v) or d end
local function safe(v, d) return v == nil and (d or "") or v end

local lastMsg = nil

local function fmtWan(n)
    n = num(n, 0)
    if n >= 10000 then
        return "¥" .. tostring(math.floor(n / 1000) / 10) .. "亿"
    end
    return "¥" .. tostring(math.floor(n * 10) / 10) .. "万"
end

local function negDesc(neg, name)
    local stage = neg.stage == "verbal" and "口头协议" or "谈判中"
    local lines = {}
    table.insert(lines, name .. " · " .. stage .. " · 第" .. tostring(num(neg.round, 0)) .. "/" .. tostring(num(neg.maxRounds, 0)) .. "轮")
    table.insert(lines, "当前报价 " .. fmtWan(neg.current) .. "（底价 " .. fmtWan(neg.floor) .. "）· 剩 " .. tostring(num(neg.daysLeft, 0)) .. " 天")
    if num(neg.hijackRisk, 0) > 0 then
        table.insert(lines, "截胡风险 " .. tostring(math.floor(num(neg.hijackRisk, 0) * 100)) .. "%" .. (neg.delegated and " · 已委托" or ""))
    end
    return table.concat(lines, "\n")
end

local function buildBlocks(ctx)
    local state = CompanyState.Ensure(CompanyState.GetState())
    local NegotiationSystem = require("NegotiationSystem")
    local LeagueCatalog = require("LeagueCatalog")

    local blocks = {}

    if lastMsg and lastMsg ~= "" then
        table.insert(blocks, { kind = "alert", lines = { { lastMsg, DS.C.gold } } })
        lastMsg = nil
    end

    -- 1. 进行中谈判
    local active = {}
    pcall(function() active = NegotiationSystem.GetActive(state) end)
    table.insert(blocks, { kind = "sectionhdr", title = "进行中的谈判", right = tostring(#active) .. " 起" })
    if #active > 0 then
        for _, neg in ipairs(active) do
            local p = nil
            pcall(function() p = LeagueCatalog.GetPlayer(neg.playerId) end)
            local name = safe(p and p.name, "选手")
            table.insert(blocks, { kind = "list", negDesc(neg, name) })
            -- 还价 10% / 20%
            table.insert(blocks, { kind = "dualcta",
                left = "还价 -10%", right = "还价 -20%",
                sub = name .. " · 当前 " .. fmtWan(neg.current) .. " · 底价 " .. fmtWan(neg.floor),
                leftAction = function()
                    local ok, err = pcall(function()
                        NegotiationSystem.Counter(state, neg.id, 0.10)
                        require("SaveManager").Save(state)
                    end)
                    lastMsg = ok and ("已向 " .. name .. " 还价 -10%") or ("还价失败：" .. tostring(err))
                    ctx.nav("negotiation")
                end,
                rightAction = function()
                    local ok, err = pcall(function()
                        NegotiationSystem.Counter(state, neg.id, 0.20)
                        require("SaveManager").Save(state)
                    end)
                    lastMsg = ok and ("已向 " .. name .. " 还价 -20%") or ("还价失败：" .. tostring(err))
                    ctx.nav("negotiation")
                end })
            table.insert(blocks, { kind = "cta", label = "接受报价 · " .. name .. " " .. fmtWan(neg.current), onClick = function()
                local ok, err = pcall(function()
                    NegotiationSystem.Accept(state, neg.id)
                    require("SaveManager").Save(state)
                end)
                lastMsg = ok and ("已接受 " .. name .. " 的报价，等待签约") or ("接受失败：" .. tostring(err))
                ctx.nav("negotiation")
            end })
            table.insert(blocks, { kind = "cta", label = "委托经纪人 · " .. name, onClick = function()
                local ok, err = pcall(function()
                    NegotiationSystem.Delegate(state, neg.id)
                    require("SaveManager").Save(state)
                end)
                lastMsg = ok and ("已委托经纪人处理 " .. name) or ("委托失败：" .. tostring(err))
                ctx.nav("negotiation")
            end })
            table.insert(blocks, { kind = "cta", label = "中止谈判 · " .. name, onClick = function()
                local ok, err = pcall(function()
                    NegotiationSystem.Cancel(state, neg.id)
                    require("SaveManager").Save(state)
                end)
                lastMsg = ok and ("已中止与 " .. name .. " 的谈判") or ("中止失败：" .. tostring(err))
                ctx.nav("negotiation")
            end })
        end
    else
        table.insert(blocks, { kind = "list", "暂无进行中的谈判 · 在转会市场对选手发起报价" })
        table.insert(blocks, { kind = "cta", label = "前往转会市场", onClick = function() ctx.nav("market") end })
    end

    -- 2. 最近结束的谈判
    table.insert(blocks, { kind = "sectionhdr", title = "最近结束的谈判", right = "" })
    local all = state.negotiations or {}
    local concluded = {}
    for _, n in ipairs(all) do
        if n.stage ~= "negotiating" and n.stage ~= "verbal" then
            table.insert(concluded, n)
        end
    end
    if #concluded > 0 then
        for i = #concluded, math.max(1, #concluded - 4), -1 do
            local neg = concluded[i]
            local p = nil
            pcall(function() p = LeagueCatalog.GetPlayer(neg.playerId) end)
            local name = safe(p and p.name, "选手")
            local stageLabel = neg.stage == "signed" and "已签约" or (neg.stage == "failed" and "谈崩" or tostring(neg.stage))
            table.insert(blocks, { kind = "list", name .. " · " .. stageLabel .. " · 终价 " .. fmtWan(neg.current) })
        end
    else
        table.insert(blocks, { kind = "list", "暂无历史谈判记录" })
    end

    return blocks
end

local NegotiationScreen = {}

function NegotiationScreen.Build(navigate)
    local ctx = { nav = navigate }
    local blocks = buildBlocks(ctx)
    local nodes = Kit.renderBlocks(blocks, ctx)
    return AppShell.Build(navigate, "negotiation", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return NegotiationScreen
