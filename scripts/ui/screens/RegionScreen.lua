-- RegionScreen.lua — 多地区经营 (real data: branch summaries via MultiRegionSystem)
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
    local MultiRegionSystem = require("MultiRegionSystem")
    local SaveManager = require("SaveManager")
    MultiRegionSystem.Ensure(state)

    local blocks = {}

    -- 反馈
    if lastMsg and lastMsg ~= "" then
        table.insert(blocks, { kind = "alert", lines = { { lastMsg, DS.C.gold } } })
        lastMsg = nil
    end

    -- 1. 页头
    local summary = nil
    pcall(function() summary = MultiRegionSystem.GetSummary(state) end)
    summary = summary or { opened = 0, champions = 0, regions = {} }
    table.insert(blocks, { kind = "node", text = "已开设分部 " .. tostring(summary.opened) .. " · 区域冠军 " .. tostring(summary.champions),
        sub = "多地区并行经营（需总部东冠 + 职业俱乐部评级）" })

    -- 2. 区域分部卡
    for _, r in ipairs(summary.regions or {}) do
        if r.opened then
            local last = r.lastResult
            local lastTxt = last and (last.opponentName .. " " .. tostring(last.scoreA) .. ":" .. tostring(last.scoreB) .. (last.won and " 胜" or " 负")) or "暂无赛果"
            table.insert(blocks, { kind = "kvrows", title = r.name .. " · 第" .. tostring(num(r.rank, 0)) .. "名", rows = {
                { "战绩", tostring(r.wins) .. "胜 " .. tostring(r.losses) .. "负 · 累计 " .. tostring(r.score), DS.C.text },
                { "战力", tostring(num(r.power, 0)), DS.C.gold },
                { "上周", lastTxt, DS.C.muted },
                { "下场", safe(r.nextOpponent, "轮空"), DS.C.muted },
                { "投入档位", tostring(r.tier), DS.C.muted },
            } })
            -- 切换档位
            local nextTier = r.tier == "basic" and "standard" or (r.tier == "standard" and "focus" or "basic")
            table.insert(blocks, { kind = "cta", label = "切换投入档位 → " .. nextTier, onClick = function()
                local ok = nil
                pcall(function() ok = MultiRegionSystem.SetTier(state, r.id, nextTier) end)
                pcall(function() SaveManager.Save(state) end)
                lastMsg = ok and (r.name .. " 投入档位已切换为「" .. nextTier .. "」") or "无法切换档位"
                ctx.nav("regions")
            end })
        else
            local canOpen, reason = false, ""
            pcall(function() canOpen, reason = MultiRegionSystem.CanOpen(state, r.id) end)
            local canReserve = false
            pcall(function() canReserve = MultiRegionSystem.CanReserve(state, r.id) end)
            table.insert(blocks, { kind = "list", r.name .. " · 未开设（开设费 ¥" .. tostring(r.openCost) .. "万）" })
            -- 资格清单（保持评级稀缺，玩家可清楚看到还差什么）
            local prereqs = {}
            pcall(function() prereqs = MultiRegionSystem.GetPrereqs(state, r.id) end)
            for _, p in ipairs(prereqs) do
                table.insert(blocks, { kind = "list", (p.ok and "达标 " or "待办 ") .. p.label })
            end
            if r.reserved then
                table.insert(blocks, { kind = "list", "已预开设，评级达标后自动激活分部" })
            elseif canOpen then
                table.insert(blocks, { kind = "cta", label = "开设 " .. r.name .. " 分部", onClick = function()
                    local ok, res = false, ""
                    pcall(function() ok, res = MultiRegionSystem.Open(state, r.id) end)
                    pcall(function() SaveManager.Save(state) end)
                    lastMsg = ok and (r.name .. " 分部已开设，双线作战！") or ("无法开设：" .. tostring(res))
                    ctx.nav("regions")
                end })
            elseif canReserve then
                table.insert(blocks, { kind = "cta", label = "预开设 " .. r.name .. " 分部（先付开设费，评级达标自动激活）", onClick = function()
                    local ok, res = false, ""
                    pcall(function() ok, res = MultiRegionSystem.ReserveOpen(state, r.id) end)
                    pcall(function() SaveManager.Save(state) end)
                    lastMsg = ok and (r.name .. " 已预开设，等待评级达标自动激活") or ("无法预开设：" .. tostring(res))
                    ctx.nav("regions")
                end })
            else
                table.insert(blocks, { kind = "list", " 暂不可开设：" .. safe(reason, "条件不足") })
            end
        end
    end

    -- 3. 经营提示
    table.insert(blocks, { kind = "section", text = "分部每周并行出赛，奖金扣周成本计入总部财务；区域冠军（第1名）自动记入公司荣誉。需在常规赛期间、总部东冠、达到职业俱乐部评级且现金充足时开设。" })

    -- 4. CTA
    table.insert(blocks, { kind = "cta", label = "返回首页", onClick = function() ctx.nav("dashboard") end })

    return blocks
end

local RegionScreen = {}

function RegionScreen.Build(navigate)
    local ctx = { nav = navigate }
    local blocks = buildBlocks(ctx)
    local nodes = Kit.renderBlocks(blocks, ctx)
    return AppShell.Build(navigate, "regions", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return RegionScreen
