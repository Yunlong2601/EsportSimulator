-- StarRecruitScreen.lua — 明星多步招募 (real data: StarRecruitSystem 5-step flow)
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local Kit = require("ui.WireframeKit")
local AppShell = require("ui.AppShell")
local CompanyState = require("CompanyState")

local function safe(v, d) return v == nil and (d or "") or v end

-- 模块级反馈缓冲：跨渲染周期保留上一次操作反馈
local lastMsg = nil

-- kpirow 用「✓/●/」标记通关态；但字体子集不含这些，改用「已/进/未」字
local function stepMark(n)
    if n == 0 then return "" end
    if n == 5 then return "已" end
    if n >= 1 then return "进" end
    return ""
end

local function buildBlocks(ctx)
    local state = CompanyState.Ensure(CompanyState.GetState())
    local StarRecruitSystem = require("StarRecruitSystem")
    local SaveManager = require("SaveManager")
    StarRecruitSystem.Get(state) -- ensure

    local blocks = {}

    -- 反馈
    if lastMsg and lastMsg ~= "" then
        table.insert(blocks, { kind = "alert", lines = { { lastMsg, DS.C.gold } } })
        lastMsg = nil
    end

    -- 1. 五步进度
    local active = false
    pcall(function() active = StarRecruitSystem.IsActive(state) end)
    local step = 0
    pcall(function() step = StarRecruitSystem.GetStep(state) end)
    local marks = {}
    for i = 1, 5 do
        local m = i < step and "已" or (i == step and "进" or (active and i == step and "进" or ""))
        if active and i <= step then m = (i == step and "进" or "已") end
        table.insert(marks, { "第" .. tostring(i) .. "步", m })
    end
    table.insert(blocks, { kind = "kpirow", items = marks })

    if not active then
        -- 无进行中招募：开始
        local last = state.starRecruit and state.starRecruit.step or 0
        if last > 0 then
            table.insert(blocks, { kind = "list", "上一轮招募已收尾（第 " .. tostring(last) .. " 步完成）" })
        end
        table.insert(blocks, { kind = "list", "明星多步招募：问答 → 凭证 → 击败宿敌 → 谈判 → 签约" })
        table.insert(blocks, { kind = "cta", label = "开始明星招募（生成招牌自由人）", onClick = function()
            local ok, res = false, ""
            pcall(function() ok, res = StarRecruitSystem.Start(state) end)
            pcall(function() SaveManager.Save(state) end)
            if ok then
                local name = res and res.name or "招牌选手"
                lastMsg = "招募启动，目标：" .. tostring(name)
            else
                lastMsg = "无法启动：" .. tostring(res)
            end
            ctx.nav("starrecruit")
        end })
    else
        -- 进行中：招牌选手 + 当前步骤
        local target = nil
        pcall(function() target = StarRecruitSystem.GetTargetPlayer(state) end)
        table.insert(blocks, { kind = "alert", lines = { { "招牌选手：" .. safe(target and target.name, "（未生成）"), DS.C.gold } } })

        if step == 1 then
            table.insert(blocks, { kind = "list", "第1步·愿景问答：明确俱乐部愿景，提升全队士气" })
            table.insert(blocks, { kind = "cta", label = "提交愿景问答（争冠王朝 / 冠军前景）", onClick = function()
                local ok = nil
                pcall(function() ok = StarRecruitSystem.CompleteQA(state, { vision = "glory", focus = "trophy" }) end)
                pcall(function() SaveManager.Save(state) end)
                lastMsg = ok and "愿景对齐，进入第2步" or "问答提交失败"
                ctx.nav("starrecruit")
            end })
        elseif step == 2 then
            local TierSystem = require("TierSystem")
            local idx = tonumber(TierSystem.GetTierIndex(state)) or 1
            local need = 30 + idx * 8
            local rep = tonumber(state.company.reputation) or 0
            local gap = math.max(0, need - rep)
            table.insert(blocks, { kind = "list", "第2步·签约凭证：声望 " .. tostring(rep) .. "/" .. tostring(need) .. (gap > 0 and ("（还差 " .. tostring(gap) .. "）") or "（已满足门槛）") })
            table.insert(blocks, { kind = "cta", label = "申请签约凭证", onClick = function()
                local ok, res = false, ""
                pcall(function() ok, res = StarRecruitSystem.GrantCredential(state) end)
                pcall(function() SaveManager.Save(state) end)
                lastMsg = ok and ("凭证获批，需击败 " .. tostring(res)) or ("未通过：" .. tostring(res))
                ctx.nav("starrecruit")
            end })
            if gap > 0 then
                table.insert(blocks, { kind = "cta", label = "公关造势（¥" .. tostring(150) .. "万 → 声望+8，冷却2周）", onClick = function()
                    local ok, res = false, ""
                    pcall(function() ok, res = StarRecruitSystem.Publicity(state) end)
                    pcall(function() SaveManager.Save(state) end)
                    lastMsg = ok and tostring(res) or ("未执行：" .. tostring(res))
                    ctx.nav("starrecruit")
                end })
            end
        elseif step == 3 then
            local sr = state.starRecruit
            local rivalName = "指定宿敌"
            if sr and sr.rivalTeamId then
                local LeagueCatalog = require("LeagueCatalog")
                local t = LeagueCatalog.GetTeam(sr.rivalTeamId) or LeagueCatalog.GetAcademyTeam(sr.rivalTeamId) or LeagueCatalog.GetRegionTeam(sr.rivalTeamId)
                rivalName = t and t.name or sr.rivalTeamId
            end
            table.insert(blocks, { kind = "list", "第3步·击败宿敌 " .. rivalName .. "：对局取胜即可满足条件" })
            table.insert(blocks, { kind = "cta", label = "向宿敌宣战（霸气宣战）", onClick = function()
                local res = nil
                pcall(function() res = StarRecruitSystem.TrashTalkRival(state, "dominant") end)
                pcall(function() SaveManager.Save(state) end)
                if res and res.ok then lastMsg = "已向 " .. rivalName .. " 宣战，制造恩怨局加成" end
                ctx.nav("starrecruit")
            end })
            table.insert(blocks, { kind = "cta", label = "检测击败进度", onClick = function()
                local done = false
                pcall(function() done = StarRecruitSystem.CheckRivalDefeated(state) end)
                pcall(function() SaveManager.Save(state) end)
                lastMsg = done and "已击败宿敌，进入第4步（正式谈判）" or "尚未击败，继续对位取胜"
                ctx.nav("starrecruit")
            end })
        elseif step == 4 then
            table.insert(blocks, { kind = "list", "第4步·正式谈判：开启谈判并达成口头协议" })
            table.insert(blocks, { kind = "cta", label = "开启正式谈判", onClick = function()
                local ok, res = false, ""
                pcall(function() ok, res = StarRecruitSystem.StartNegotiation(state) end)
                pcall(function() SaveManager.Save(state) end)
                lastMsg = ok and "谈判已开启，前往转会谈判页推进至口头协议" or ("无法开启谈判：" .. tostring(res))
                ctx.nav("starrecruit")
            end })
            table.insert(blocks, { kind = "cta", label = "正式签约（谈判达成口头协议后）", onClick = function()
                local ok, res = false, ""
                pcall(function() ok, res = StarRecruitSystem.Sign(state) end)
                pcall(function() SaveManager.Save(state) end)
                lastMsg = ok and "招牌选手正式加盟！" or ("签约失败：" .. tostring(res))
                ctx.nav("starrecruit")
            end })
        elseif step == 5 then
            table.insert(blocks, { kind = "list", "第5步·签约已完成" })
        end

        -- 中止
        table.insert(blocks, { kind = "cta", label = "中止招募", onClick = function()
            local ok = false
            pcall(function() ok = StarRecruitSystem.Abandon(state) end)
            pcall(function() SaveManager.Save(state) end)
            lastMsg = ok and "已中止当前招募" or "中止失败"
            ctx.nav("starrecruit")
        end })
    end

    return blocks
end

local StarRecruitScreen = {}

function StarRecruitScreen.Build(navigate)
    local ctx = { nav = navigate }
    local blocks = buildBlocks(ctx)
    local nodes = Kit.renderBlocks(blocks, ctx)
    return AppShell.Build(navigate, "starrecruit", UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes })
end

return StarRecruitScreen
