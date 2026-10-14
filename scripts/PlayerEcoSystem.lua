-- PlayerEcoSystem：选手生态（Player Ecosystem）
-- 选手生态第一层支柱（叠加层，不重造轮子）：
--   ① 选手人格 Personality（FM 隐藏特质，驱动自主行为）
--   ② 更衣室关系网 Locker Room Web（队长 / 双排搭档 / 队内矛盾）
--   ④ 心态 / 状态 Form & Mentality（影响 MatchSimulator 方差，深化观赛 #40）
-- 数据全部挂在 state.playerEco / state.relationships（可序列化），旧档自动补齐。
-- 复用：RosterSystem（阵容/战力）、LeagueCatalog（选手位置）、MatchSimulator（比赛方差）。

local CompanyState = require("CompanyState")
local LeagueCatalog = require("LeagueCatalog")
local RosterSystem = require("RosterSystem")

local PlayerEcoSystem = {}

-- 5 维人格（0–100，面板只露冰山一角）
local DIMS = { "ambition", "loyalty", "neuroticism", "leadership", "charisma" }
PlayerEcoSystem.DIMS = DIMS

local DIM_META = {
    ambition = { label = "野心", icon = "野心" },
    loyalty = { label = "忠诚", icon = "忠诚" },
    neuroticism = { label = "神经质", icon = "神经" },
    leadership = { label = "领袖", icon = "领袖" },
    charisma = { label = "流量", icon = "流量" },
}
PlayerEcoSystem.DIM_META = DIM_META

local MENTALITY = {
    clutch = { label = "大赛型", icon = "大赛", desc = "决赛 / 季后赛 +战力，常规赛持平" },
    steady = { label = "稳健型", icon = "稳健", desc = "全场景稳定，方差小" },
    choker = { label = "易崩盘", icon = "易崩", desc = "高压(落后 / 关键局) -战力，方差大" },
}
PlayerEcoSystem.MENTALITY = MENTALITY

-- 确定性 PRNG：避免污染全局 math.random，保证同一选手人格稳定
local function hashStr(s)
    s = tostring(s)
    local h = 2166136261
    for i = 1, #s do
        h = (h * 16777619) % 4294967296
        h = (h ~ string.byte(s, i)) % 4294967296
    end
    return h % 2147483647
end

local function makeRng(seed)
    local x = (seed % 2147483647)
    if x <= 0 then x = x + 2147483646 end
    return function()
        x = (x * 16807) % 2147483647
        return (x - 1) / 2147483646
    end
end

local function rint(r, lo, hi)
    return math.floor(lo + r() * (hi - lo + 1) + 0.5)
end

-- ============ 初始化 ============

function PlayerEcoSystem.Ensure(state)
    state = CompanyState.Ensure(state)
    state.playerEco = state.playerEco or {}
    state.relationships = state.relationships or { duo = { a = "", b = "" }, captain = "", conflicts = {} }
    local rel = state.relationships
    rel.duo = rel.duo or { a = "", b = "" }
    rel.duo.a = rel.duo.a or ""
    rel.duo.b = rel.duo.b or ""
    rel.captain = rel.captain or ""
    rel.conflicts = rel.conflicts or {}
    return state
end

-- 懒生成：同一 playerId 人格/心态保持稳定（确定性种子）
function PlayerEcoSystem.GetEco(state, playerId)
    PlayerEcoSystem.Ensure(state)
    local eco = state.playerEco[playerId]
    if not eco then
        local r = makeRng(hashStr(playerId))
        local personality = {}
        for _, dim in ipairs(DIMS) do
            personality[dim] = rint(r, 25, 95)
        end
        -- 心态：受神经质 / 领袖气质影响
        local neu = personality.neuroticism
        local lead = personality.leadership
        local menR = r()
        local mentality
        if menR < (0.20 + neu / 400) then
            mentality = "choker"
        elseif menR < (0.55 + lead / 300) then
            mentality = "clutch"
        else
            mentality = "steady"
        end
        local char = personality.charisma
        eco = {
            personality = personality,
            mentality = mentality,
            matchForm = 0,       -- 周度状态 -15..+15
            revealed = 0,        -- 已揭示维度数（冰山：每周 +1）
            weeks = 0,
            brand = { value = 20 + math.floor(char / 3), trend = 0, endorsements = {} },
        }
        state.playerEco[playerId] = eco
    end
    if not eco.brand then
        eco.brand = { value = 20 + math.floor((eco.personality.charisma or 40) / 3), trend = 0, endorsements = {} }
    end
    return eco
end

function PlayerEcoSystem.GetPersonality(state, playerId)
    return PlayerEcoSystem.GetEco(state, playerId).personality
end

function PlayerEcoSystem.GetMentality(state, playerId)
    return PlayerEcoSystem.GetEco(state, playerId).mentality
end

function PlayerEcoSystem.GetMatchForm(state, playerId)
    return tonumber(PlayerEcoSystem.GetEco(state, playerId).matchForm) or 0
end

-- ============ 展示辅助 ============

-- 维度文案：低/中/高 三档 + 行为描述
function PlayerEcoSystem.GetDimLabel(dim, value)
    local meta = DIM_META[dim]
    local tier = value >= 75 and 3 or (value >= 45 and 2 or 1)
    local flavor = {
        ambition = { "安于现状", "有上进心", "极度渴望登顶 / 加薪" },
        loyalty = { "易被高薪挖走", "正常归属感", "誓死效忠" },
        neuroticism = { "大心脏", "偶有波动", "关键局易崩" },
        leadership = { "独狼", "团队一员", "更衣室领袖" },
        charisma = { "低调", "有观众缘", "天生顶流" },
    }
    return meta.icon .. meta.label .. " " .. (tier == 3 and "高" or (tier == 2 and "中" or "低")) .. "（" .. flavor[dim][tier] .. "）"
end

-- 冰山：已揭示的维度列表（初始 1 个，每周 +1，封顶 5）
function PlayerEcoSystem.GetRevealedDims(state, playerId)
    local eco = PlayerEcoSystem.GetEco(state, playerId)
    local count = math.min(#DIMS, 1 + math.floor(tonumber(eco.revealed) or 0))
    local out = {}
    for i = 1, count do table.insert(out, DIMS[i]) end
    return out
end

-- 观赛心态标注（深化 #40）：返回 (心态文案, 状态情绪文案)
function PlayerEcoSystem.GetMindTag(state, playerId)
    local eco = PlayerEcoSystem.GetEco(state, playerId)
    local m = MENTALITY[eco.mentality]
    local f = tonumber(eco.matchForm) or 0
    local mood = f >= 8 and "封神" or (f <= -8 and "稳健紧张" or "平稳")
    return m.icon .. m.label, mood
end

-- ============ 每周结算 ============

function PlayerEcoSystem.ProcessWeek(state)
    PlayerEcoSystem.Ensure(state)
    local week = tonumber(state.company and state.company.week) or 1
    local endorsementIncome = 0
    for playerId, eco in pairs(state.playerEco) do
        local neu = (eco.personality and eco.personality.neuroticism) or 40
        -- 周度状态向均值回归 + 神经质放大波动
        local f = (tonumber(eco.matchForm) or 0) * 0.55
        f = f + math.random(-3, 3) * (1 + neu / 150)
        eco.matchForm = math.max(-15, math.min(15, math.floor(f + 0.5)))
        eco.revealed = (tonumber(eco.revealed) or 0) + 1
        eco.weeks = (tonumber(eco.weeks) or 0) + 1
        -- 品牌：缓慢回归中位，避免无限膨胀 / 归零
        if eco.brand then
            eco.brand.value = math.max(0, math.min(100, math.floor(eco.brand.value + (35 - eco.brand.value) * 0.02 + 0.5)))
            eco.brand.trend = 0
            -- 代言倒计时 + 计本周俱乐部分成（第二条现金流）
            if eco.brand.endorsements then
                for i = #eco.brand.endorsements, 1, -1 do
                    local e = eco.brand.endorsements[i]
                    e.weeksLeft = (e.weeksLeft or 0) - 1
                    endorsementIncome = endorsementIncome + (e.weeklyClub or 0)
                    if e.weeksLeft <= 0 then table.remove(eco.brand.endorsements, i) end
                end
            end
        end
    end
    if endorsementIncome > 0 then
        state.company.cash = (tonumber(state.company.cash) or 0) + endorsementIncome
        CompanyState.RecordTimeline(state, "商务代言分成", "选手商业代言本周为俱乐部带来分成 ¥" .. tostring(endorsementIncome) .. "万。")
    end
    return state
end

-- ============ 关系网 ============

local function isStarter(state, pid)
    if not pid or pid == "" then return false end
    local p = LeagueCatalog.GetPlayer(pid)
    if not p then return false end
    return state.roster.players[p.role] == pid
end
PlayerEcoSystem.IsStarter = isStarter

function PlayerEcoSystem.SetCaptain(state, playerId)
    PlayerEcoSystem.Ensure(state)
    state.relationships.captain = playerId or ""
    return true
end

function PlayerEcoSystem.SetDuo(state, a, b)
    PlayerEcoSystem.Ensure(state)
    if not a or a == "" or not b or b == "" then
        state.relationships.duo = { a = "", b = "" }
        return true
    end
    state.relationships.duo = { a = a, b = b }
    return true
end

function PlayerEcoSystem.ClearDuo(state)
    PlayerEcoSystem.Ensure(state)
    state.relationships.duo = { a = "", b = "" }
    return true
end

function PlayerEcoSystem.AddConflict(state, a, b)
    PlayerEcoSystem.Ensure(state)
    if not a or not b or a == b then return false, "不能与自己产生矛盾" end
    state.relationships.conflicts[a] = b
    state.relationships.conflicts[b] = a
    return true
end

function PlayerEcoSystem.ResolveConflict(state, a)
    PlayerEcoSystem.Ensure(state)
    local other = state.relationships.conflicts[a]
    state.relationships.conflicts[a] = nil
    if other then state.relationships.conflicts[other] = nil end
    return true
end

-- 关系总览（供 UI / 比赛）
function PlayerEcoSystem.GetRelationship(state)
    PlayerEcoSystem.Ensure(state)
    local rel = state.relationships
    local conflictList = {}
    for k, v in pairs(rel.conflicts) do
        if k < v then
            table.insert(conflictList, { a = k, b = v })
        end
    end
    return {
        duo = rel.duo,
        duoActive = isStarter(state, rel.duo.a) and isStarter(state, rel.duo.b),
        captain = rel.captain,
        captainActive = isStarter(state, rel.captain),
        conflicts = conflictList,
    }
end

-- ============ 比赛影响 ============

-- 返回 { powerMul, varianceAdd }：基于首发 5 人心态 / 周度状态 / 队长稳定器 / 搭档 / 矛盾
function PlayerEcoSystem.GetMatchModifier(state, isBigMatch)
    PlayerEcoSystem.Ensure(state)
    isBigMatch = isBigMatch == true
    local powerMul = 1
    local varianceAdd = 0
    local rel = state.relationships

    -- 队长领袖气质 → 全队波动收窄（稳定器）
    local captainLead = 0
    if isStarter(state, rel.captain) then
        captainLead = PlayerEcoSystem.GetEco(state, rel.captain).personality.leadership
    end

    for _, pid in pairs(state.roster.players) do
        if pid and pid ~= "" then
            local eco = PlayerEcoSystem.GetEco(state, pid)
            local per = eco.personality
            if eco.mentality == "clutch" then
                if isBigMatch then powerMul = powerMul * 1.03 end
            elseif eco.mentality == "choker" then
                powerMul = powerMul * 0.99
                varianceAdd = varianceAdd + 0.02 + per.neuroticism / 2000
            else -- steady
                varianceAdd = varianceAdd - 0.005
            end
            -- 周度状态
            powerMul = powerMul * (1 + eco.matchForm / 1000)
            -- 神经质：基础波动
            varianceAdd = varianceAdd + per.neuroticism / 3000
        end
    end

    -- 队长稳定器
    varianceAdd = varianceAdd - (captainLead / 100) * 0.03

    -- 双排搭档：同场 +战力，拆散略降
    if rel.duo.a ~= "" and rel.duo.b ~= "" then
        local aIn = isStarter(state, rel.duo.a)
        local bIn = isStarter(state, rel.duo.b)
        if aIn and bIn then
            powerMul = powerMul * 1.02
        elseif aIn or bIn then
            powerMul = powerMul * 0.995
        end
    end

    -- 队内矛盾：同场 -战力 +波动
    for k, v in pairs(rel.conflicts) do
        if k < v and isStarter(state, k) and isStarter(state, v) then
            powerMul = powerMul * 0.98
            varianceAdd = varianceAdd + 0.01
        end
    end

    return { powerMul = powerMul, varianceAdd = varianceAdd }
end

-- 阵容战力展示用的轻量版本（不含大场面加成）
function PlayerEcoSystem.GetTeamEcoBonus(state)
    return PlayerEcoSystem.GetMatchModifier(state, false).powerMul
end

-- ============ 续约 / 报价联动（驱动自主行为）============

-- 续约成本系数：野心高 → 更贵；忠诚高 → 更便宜
function PlayerEcoSystem.GetRenewalFactor(state, playerId)
    local eco = PlayerEcoSystem.GetEco(state, playerId)
    local amb = eco.personality.ambition
    local loy = eco.personality.loyalty
    local f = 1 + (amb - 50) / 400 - (loy - 50) / 400
    return math.max(0.85, math.min(1.2, f))
end

-- 要价系数（联动 TRANSFER_EXPANSION 的谈判底价）：野心高要价更硬
function PlayerEcoSystem.GetTransferAskFactor(state, playerId)
    local eco = PlayerEcoSystem.GetEco(state, playerId)
    local amb = eco.personality.ambition
    local loy = eco.personality.loyalty
    local f = 1 + (amb - 50) / 500 - (loy - 50) / 500
    return math.max(0.9, math.min(1.15, f))
end

-- ============ ③ 选手品牌 Player Brand ============
-- 商业价值曲线 + 代言分成（第二条现金流）+ 卖出溢价（联动转会费商业循环）

-- 品牌等级：0-30 新秀 / 30-55 潜力 / 55-75 明星 / 75-90 顶流 / 90+ 传奇
function PlayerEcoSystem.GetBrandTier(value)
    if value >= 90 then return { label = "传奇", icon = "领袖" }
    elseif value >= 75 then return { label = "顶流", icon = "顶级" }
    elseif value >= 55 then return { label = "明星", icon = "明星" }
    elseif value >= 30 then return { label = "潜力", icon = "潜力" }
    else return { label = "新秀", icon = "新秀" }
    end
end

function PlayerEcoSystem.GetBrandValue(state, playerId)
    local eco = PlayerEcoSystem.GetEco(state, playerId)
    return (eco.brand and tonumber(eco.brand.value)) or 0
end

-- 卖出溢价系数：品牌越高，转会费越贵（最高 +25%）
function PlayerEcoSystem.GetBrandPremium(state, playerId)
    local v = PlayerEcoSystem.GetBrandValue(state, playerId)
    return math.max(1, math.min(1.25, 1 + v / 100 * 0.25))
end

-- 品牌微调（高光 + / 丑闻 -），写入 trend 供面板展示
function PlayerEcoSystem.ApplyBrandDelta(state, playerId, delta)
    PlayerEcoSystem.Ensure(state)
    local eco = PlayerEcoSystem.GetEco(state, playerId)
    eco.brand = eco.brand or { value = 20, trend = 0, endorsements = {} }
    eco.brand.value = math.max(0, math.min(100, math.floor((eco.brand.value or 20) + delta + 0.5)))
    eco.brand.trend = delta
end

-- 比赛结果联动品牌：胜 → 高光涨；负 → 丑闻跌；流量(charisma)放大幅度
function PlayerEcoSystem.ApplyMatchResult(state, won, isBig)
    PlayerEcoSystem.Ensure(state)
    isBig = isBig == true
    for _, pid in pairs(state.roster.players) do
        if pid and pid ~= "" then
            local eco = PlayerEcoSystem.GetEco(state, pid)
            local cha = (eco.personality and eco.personality.charisma) or 40
            local delta
            if won then
                delta = 1 + math.floor(cha / 40) + (isBig and 1 or 0)
            else
                delta = -(1 + math.floor(cha / 60))
            end
            PlayerEcoSystem.ApplyBrandDelta(state, pid, delta)
        end
    end
end

-- 商业事件（粉丝增长）联动队内最高流量选手品牌
function PlayerEcoSystem.ApplyEventBrand(state, fans)
    PlayerEcoSystem.Ensure(state)
    local best, bestCha = nil, -1
    for _, pid in pairs(state.roster.players) do
        if pid and pid ~= "" then
            local eco = PlayerEcoSystem.GetEco(state, pid)
            local cha = (eco.personality and eco.personality.charisma) or 0
            if cha > bestCha then bestCha = cha; best = pid end
        end
    end
    if best then
        local delta = math.max(1, math.min(3, math.floor(fans / 3000 + 0.5)))
        PlayerEcoSystem.ApplyBrandDelta(state, best, delta)
    end
end

-- 代言：为选手签约商业代言，俱乐部每周抽取分成；品牌越高收益越高
function PlayerEcoSystem.SignEndorsement(state, playerId)
    PlayerEcoSystem.Ensure(state)
    local eco = PlayerEcoSystem.GetEco(state, playerId)
    eco.brand = eco.brand or { value = 20, trend = 0, endorsements = {} }
    if eco.brand.endorsements and #eco.brand.endorsements > 0 then
        return false, "该选手已有一份生效中的代言"
    end
    local v = eco.brand.value
    local weeklyClub = math.max(1, math.floor(2 + v / 10))
    local weeklyPlayer = weeklyClub * 2
    table.insert(eco.brand.endorsements, {
        id = "end_" .. tostring(playerId),
        name = "商业代言",
        weeklyClub = weeklyClub,
        weeklyPlayer = weeklyPlayer,
        weeksLeft = 12,
    })
    return true, "已签约商业代言，俱乐部每周分成 ¥" .. tostring(weeklyClub) .. "万（签约期 12 周）"
end

function PlayerEcoSystem.CancelEndorsement(state, playerId)
    PlayerEcoSystem.Ensure(state)
    local eco = PlayerEcoSystem.GetEco(state, playerId)
    if eco.brand then eco.brand.endorsements = {} end
    return true, "已解除商业代言"
end

function PlayerEcoSystem.GetEndorsements(state, playerId)
    local eco = PlayerEcoSystem.GetEco(state, playerId)
    return (eco.brand and eco.brand.endorsements) or {}
end

-- 全队本周代言俱乐部分成总额
function PlayerEcoSystem.GetEndorsementIncome(state)
    PlayerEcoSystem.Ensure(state)
    local total = 0
    for pid, eco in pairs(state.playerEco) do
        if eco.brand and eco.brand.endorsements then
            for _, e in ipairs(eco.brand.endorsements) do
                total = total + (e.weeklyClub or 0)
            end
        end
    end
    return total
end

-- 全队品牌价值合计（喂 STOCK_MARKET 估值）
function PlayerEcoSystem.GetRosterBrandValue(state)
    PlayerEcoSystem.Ensure(state)
    local total = 0
    for _, pid in pairs(state.roster.players) do
        if pid and pid ~= "" then
            total = total + PlayerEcoSystem.GetBrandValue(state, pid)
        end
    end
    return total
end

return PlayerEcoSystem
