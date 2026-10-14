-- ScoutSystem：球探网络（#46 球探客制化发掘）
-- 在旧版「派遣球探 → 2 周 → 1-2 名新秀进自由市场」基础上升级为客制化发掘：
--   1) 买星探（特长：位置专精 / 省钱 / 谈判 / 影响力）→ 持久化球探部门，上限随评级。
--   2) 派遣任务可客制化：选星探 + 锁定目标位置 + 标准/加急预算。
--   3) 任务进行中每周可「追加精度预算」提质量、降被抢。
--   4) 生成定制新秀：位置偏好 + 质量随预算/精度/谈判提升；自带随机人格 + 品牌起点。
--   5) 多队抢签：新秀进入「抢手名单」，AI 俱乐部每周可能抢先签走，玩家需速签。
-- 设计原则：叠加层，复用 PlayerEcoSystem（人格/品牌）、LeagueCatalog（注册）、StaffSystem（成本）。
local CompanyState = require("CompanyState")
local LeagueCatalog = require("LeagueCatalog")
local StaffSystem = require("StaffSystem")
local TierSystem = require("TierSystem")
local PlayerEcoSystem = require("PlayerEcoSystem")

local ScoutSystem = {}

-- 星探专长定义（雇佣一次性付费，持久保留）
ScoutSystem.SPECIALTIES = {
    position    = { name = "位置专精", icon = "专精", hireCost = 120, desc = "派遣时锁定目标位置，新秀更可能出自该位置" },
    thrift      = { name = "省钱型",   icon = "省钱", hireCost = 100, desc = "搜索差旅费用降低 40%" },
    negotiation = { name = "谈判型",   icon = "谈判", hireCost = 140, desc = "发掘的新秀更少被其他俱乐部抢签" },
    influence   = { name = "影响力",   icon = "影响", hireCost = 130, desc = "发掘的新秀初始品牌值更高" },
}
ScoutSystem.SPECIALTY_ORDER = { "position", "thrift", "negotiation", "influence" }

-- 抢签对手俱乐部（风味名）
ScoutSystem.RIVAL_CLUBS = { "苍穹战队", "烈焰军团", "霜狼俱乐部", "雷霆联盟", "暗影学院", "曙光战队" }

-- 每周「追加精度预算」费用
ScoutSystem.TOPUP_COST = 20

ScoutSystem.PROSPECT_NAMES = {
    "Ace", "Blink", "Cipher", "Drift", "Flux", "Gizmo", "Hex", "Iris", "Jolt",
    "Kumo", "Luma", "Mira", "Nyx", "Orion", "Pixel", "Quest", "Rift", "Sable",
    "Talon", "Umbra", "Vanta", "Wisp", "Xeno", "Yoru", "Zest",
}

local function clamp(value, minimum, maximum)
    return math.max(minimum, math.min(maximum, tonumber(value) or minimum))
end

-- 每赛季球探次数：草根/新锐 0（提示提升评级），职业 1，豪门 2，传奇 3
function ScoutSystem.GetMaxScouts(state)
    state = CompanyState.Ensure(state)
    local tier = TierSystem.GetTier(state)
    if tier.index >= 5 then return 3 end
    if tier.index >= 4 then return 2 end
    if tier.index >= 3 then return 1 end
    return 0
end

function ScoutSystem.GetUsed(state)
    state = CompanyState.Ensure(state)
    return tonumber(state.scouting.usedThisSeason) or 0
end

function ScoutSystem.GetRemaining(state)
    state = CompanyState.Ensure(state)
    return math.max(0, ScoutSystem.GetMaxScouts(state) - ScoutSystem.GetUsed(state))
end

-- ───────────────────────── 星探部门（客制化） ─────────────────────────

function ScoutSystem.GetScouts(state)
    state = CompanyState.Ensure(state)
    return state.scouting.scouts or {}
end

function ScoutSystem.GetScout(state, id)
    for _, s in ipairs(ScoutSystem.GetScouts(state)) do
        if s.id == id then return s end
    end
    return nil
end

function ScoutSystem.GetScoutCap(state)
    return ScoutSystem.GetMaxScouts(state)
end

function ScoutSystem.CanHireScout(state)
    state = CompanyState.Ensure(state)
    if ScoutSystem.GetScoutCap(state) <= 0 then
        return false, "球探部门未开放：俱乐部评级提升至「职业」后解锁"
    end
    if #ScoutSystem.GetScouts(state) >= ScoutSystem.GetScoutCap(state) then
        return false, "球探部门已满（上限 " .. tostring(ScoutSystem.GetScoutCap(state)) .. " 人），提升评级可扩充"
    end
    return true
end

function ScoutSystem.HireScout(state, specialty)
    state = CompanyState.Ensure(state)
    local spec = ScoutSystem.SPECIALTIES[specialty]
    if not spec then return false, "未知星探专长" end
    local ok, reason = ScoutSystem.CanHireScout(state)
    if not ok then return false, reason end
    if state.company.cash < spec.hireCost then
        return false, "现金不足，无法雇佣星探（需 ¥" .. tostring(spec.hireCost) .. "万）"
    end
    state.company.cash = state.company.cash - spec.hireCost
    state.scouting.scouts = state.scouting.scouts or {}
    local count = #state.scouting.scouts + 1
    local scout = {
        id = "scout_" .. tostring(count),
        name = spec.icon .. spec.name .. " #" .. tostring(count),
        specialty = specialty,
        level = 1,
    }
    table.insert(state.scouting.scouts, scout)
    CompanyState.RecordTimeline(state, "雇佣星探",
        "雇佣了一名「" .. spec.name .. "」星探（¥" .. tostring(spec.hireCost) .. "万），球探部门更具针对性。")
    return true, "已雇佣「" .. spec.name .. "」星探"
end

-- ───────────────────────── 定制任务 ─────────────────────────

function ScoutSystem.GetMission(state)
    state = CompanyState.Ensure(state)
    return state.scouting.mission
end

function ScoutSystem.GetMissionCost(state, opts)
    opts = opts or {}
    local base = StaffSystem.GetScoutCost(state)
    local scout = opts.scoutId and ScoutSystem.GetScout(state, opts.scoutId) or nil
    if scout and scout.specialty == "thrift" then base = math.floor(base * 0.6 + 0.5) end
    if opts.budgetTier == "premium" then base = math.floor(base * 1.6 + 0.5) end
    -- P2-⑧ 首席球探：费用减免
    local StaffSystem = require("StaffSystem")
    local bonus = StaffSystem.GetScoutBonus(state)
    base = math.floor(base * (1 - (bonus.costReduce or 0)) + 0.5)
    return math.max(5, base)
end

function ScoutSystem.CanStartMission(state, opts)
    state = CompanyState.Ensure(state)
    if ScoutSystem.GetMaxScouts(state) <= 0 then
        return false, "球探网络未建立：提升俱乐部评级至职业级解锁（豪门 ×2 · 传奇 ×3）"
    end
    if ScoutSystem.GetMission(state) then
        return false, "已有球探任务进行中，预计第 " .. tostring((ScoutSystem.GetMission(state).returnWeek or 0)) .. " 周回报"
    end
    if ScoutSystem.GetRemaining(state) <= 0 then
        return false, "本赛季球探名额已用完，新赛季恢复"
    end
    local cost = ScoutSystem.GetMissionCost(state, opts or {})
    if state.company.cash < cost then
        return false, "现金不足，无法支付搜索费用（需 ¥" .. tostring(cost) .. "万）"
    end
    return true, cost
end

function ScoutSystem.StartMission(state, opts)
    state = CompanyState.Ensure(state)
    opts = opts or {}
    local ok, reason = ScoutSystem.CanStartMission(state, opts)
    if not ok then return false, reason end
    local cost = ScoutSystem.GetMissionCost(state, opts)
    state.company.cash = state.company.cash - cost
    state.scouting.usedThisSeason = ScoutSystem.GetUsed(state) + 1
    local week = tonumber(state.company.week) or 1
    state.scouting.mission = {
        scoutId = opts.scoutId or nil,
        targetRole = opts.targetRole or "any",
        budgetTier = opts.budgetTier or "standard",
        launchWeek = week,
        returnWeek = week + 2,
        precision = 0,
        topUpWeek = 0,
        baseCost = cost,
    }
    state.scouting.pendingWeek = week + 2  -- 兼容旧读取
    local roleTxt = opts.targetRole and opts.targetRole ~= "any" and ("（锁定 " .. LeagueCatalog.POSITIONS[opts.targetRole] .. "）") or ""
    local tierTxt = opts.budgetTier == "premium" and " · 加急搜索" or ""
    CompanyState.RecordTimeline(state, "球探派遣",
        "派出球探搜索潜力新秀" .. roleTxt .. tierTxt .. "（¥" .. tostring(cost) .. "万），预计第 " .. tostring(week + 2) .. " 周回报。")
    return true, cost
end

-- 看广告 / 旧接口兼容：无专长普通搜索
function ScoutSystem.StartScout(state)
    return ScoutSystem.StartMission(state, { scoutId = nil, targetRole = "any", budgetTier = "standard" })
end

-- 旧判定函数（保留兼容，UI 已改用 CanStartMission）
function ScoutSystem.CanScout(state)
    local ok, _ = ScoutSystem.CanStartMission(state, {})
    return ok, ""
end

function ScoutSystem.GetReports(state)
    state = CompanyState.Ensure(state)
    return state.scouting.reports or {}
end

-- ───────────────────────── 每周提精度 ─────────────────────────

function ScoutSystem.CanTopUp(state)
    state = CompanyState.Ensure(state)
    local m = ScoutSystem.GetMission(state)
    if not m then return false, "当前无进行中的球探任务" end
    local week = tonumber(state.company.week) or 1
    if m.topUpWeek == week then return false, "本周已追加过精度预算" end
    if state.company.cash < ScoutSystem.TOPUP_COST then
        return false, "现金不足，无法追加精度预算（需 ¥" .. tostring(ScoutSystem.TOPUP_COST) .. "万）"
    end
    return true
end

function ScoutSystem.TopUpPrecision(state)
    state = CompanyState.Ensure(state)
    local ok, reason = ScoutSystem.CanTopUp(state)
    if not ok then return false, reason end
    state.company.cash = state.company.cash - ScoutSystem.TOPUP_COST
    local m = ScoutSystem.GetMission(state)
    m.precision = (m.precision or 0) + 1
    m.topUpWeek = tonumber(state.company.week) or 1
    CompanyState.RecordTimeline(state, "追加精度预算",
        "追加 ¥" .. tostring(ScoutSystem.TOPUP_COST) .. "万 精度预算，新秀质量与抢签防御提升。")
    return true, "精度 +1，新秀更可能有高潜力、更少被抢"
end

-- ───────────────────────── 周结算 ─────────────────────────

function ScoutSystem.ProcessWeek(state)
    state = CompanyState.Ensure(state)
    local week = tonumber(state.company.week) or 1

    -- 旧档迁移：有 pendingWeek 但无 mission（升级前在途任务），还原为普通任务
    if not state.scouting.mission and state.scouting.pendingWeek then
        state.scouting.mission = {
            scoutId = nil, targetRole = "any", budgetTier = "standard",
            launchWeek = tonumber(state.scouting.pendingWeek) - 2,
            returnWeek = tonumber(state.scouting.pendingWeek),
            precision = 0, topUpWeek = 0, baseCost = 0,
        }
    end

    -- 1) 进行中的任务到期 → 生成新秀 + 进入抢手名单
    local m = ScoutSystem.GetMission(state)
    if m and week >= m.returnWeek then
        local count = 1
        if m.budgetTier == "premium" then count = 2 end
        if (m.precision or 0) >= 2 then count = 2 end
        local prospects = {}
        for _ = 1, count do
            local p = ScoutSystem.GenerateProspect(state, m)
            table.insert(prospects, p)
        end
        local names = {}
        for _, p in ipairs(prospects) do
            table.insert(names, p.name .. "（" .. LeagueCatalog.POSITIONS[p.role] .. " · " .. p.scoutGrade .. "级）")
        end
        state.scouting.nextId = (tonumber(state.scouting.nextId) or 0) + 1
        local report = {
            id = state.scouting.nextId,
            week = week,
            text = "球探发现潜力新秀：" .. table.concat(names, "、") .. "。",
        }
        table.insert(state.scouting.reports, 1, report)
        while #state.scouting.reports > 5 do table.remove(state.scouting.reports) end
        CompanyState.RecordTimeline(state, "球探报告", report.text)

        for _, p in ipairs(prospects) do
            local contest = ScoutSystem.ComputeContest(state, p, m)
            table.insert(state.scouting.hotProspects, {
                id = p.id,
                contest = contest,
                deadlineWeek = m.returnWeek + 2,
            })
        end
        state.scouting.mission = nil
        state.scouting.pendingWeek = nil
    end

    -- 2) 抢手名单：AI 抢签 / 过期清理
    local hp = state.scouting.hotProspects or {}
    local keep = {}
    for _, h in ipairs(hp) do
        local p = LeagueCatalog.GetPlayer(h.id) or state.scouting.prospects[h.id]
        if not p then
            -- 已不存在，丢弃
        elseif ScoutSystem.IsOwned(state, h.id) then
            -- 已被玩家签下，丢弃（不重复展示）
        elseif week > h.deadlineWeek then
            CompanyState.RecordTimeline(state, "新星流失",
                p.name .. " 错过了签约窗口，已加入其他俱乐部。")
        else
            local grab = ScoutSystem.GrabChance(state, h)
            if math.random() < grab then
                local club = ScoutSystem.PickRivalClub(state)
                CompanyState.RecordTimeline(state, "新星被抢",
                    " " .. p.name .. " 被 " .. club .. " 抢先签下，你错失了一名潜力新秀。")
            else
                table.insert(keep, h)
            end
        end
    end
    state.scouting.hotProspects = keep
    return state
end

-- 被抢签概率：随竞争俱乐部数线性上升（已含谈判/精度减免）
function ScoutSystem.GrabChance(state, h)
    return math.min(0.85, 0.12 * (h.contest or 1))
end

function ScoutSystem.ComputeContest(state, p, m)
    local base = { S = 4, A = 3, B = 2, C = 1 }
    local c = base[p.scoutGrade] or 1
    local scout = m.scoutId and ScoutSystem.GetScout(state, m.scoutId) or nil
    if scout and scout.specialty == "negotiation" then c = math.max(1, c - 2) end
    c = math.max(1, c - math.floor((m.precision or 0) / 2))
    return c
end

function ScoutSystem.PickRivalClub(state)
    return ScoutSystem.RIVAL_CLUBS[math.random(#ScoutSystem.RIVAL_CLUBS)]
end

function ScoutSystem.IsOwned(state, playerId)
    for _, pid in pairs(state.roster.players) do
        if pid == playerId then return true end
    end
    for _, pid in pairs(state.roster.bench) do
        if pid and pid ~= "" and pid == playerId then return true end
    end
    return false
end

-- 当前可签的抢手新秀（已滤除已被签/不存在者）
function ScoutSystem.GetHotProspects(state)
    state = CompanyState.Ensure(state)
    local out = {}
    local week = tonumber(state.company.week) or 1
    for _, h in ipairs(state.scouting.hotProspects or {}) do
        local p = LeagueCatalog.GetPlayer(h.id) or state.scouting.prospects[h.id]
        if p and not ScoutSystem.IsOwned(state, h.id) then
            table.insert(out, { player = p, contest = h.contest, weeksLeft = math.max(0, h.deadlineWeek - week) })
        end
    end
    return out
end

-- ───────────────────────── 生成定制新秀 ─────────────────────────

-- 生成潜力新秀：位置偏好 + 质量随预算/精度/谈判提升；自带随机人格 + 品牌起点
function ScoutSystem.GenerateProspect(state, mission)
    state = CompanyState.Ensure(state)
    state.scouting.nextProspectId = (tonumber(state.scouting.nextProspectId) or 0) + 1
    local idx = state.scouting.nextProspectId
    local roles = { "top", "jungle", "mid", "adc", "support" }

    -- 角色：位置专精 + 锁定 → 高概率命中；未锁定 → 随机
    local role
    local scout = mission and mission.scoutId and ScoutSystem.GetScout(state, mission.scoutId) or nil
    if mission and mission.targetRole and mission.targetRole ~= "any" then
        if scout and scout.specialty == "position" then
            role = math.random() < 0.75 and mission.targetRole or roles[math.random(#roles)]
        else
            role = math.random() < 0.40 and mission.targetRole or roles[math.random(#roles)]
        end
    else
        role = roles[math.random(#roles)]
    end

    -- 潜力：基础分布 + 加急/精度/谈判 提升高潜概率
    local premium = mission and mission.budgetTier == "premium"
    local precision = mission and (mission.precision or 0) or 0
    local roll = math.random()
    local sBoost = 0
    if premium then sBoost = sBoost + 0.06 end
    if precision >= 1 then sBoost = sBoost + 0.04 * precision end
    if scout and scout.specialty == "negotiation" then sBoost = sBoost + 0.03 end
    local potential
    if roll < (0.08 + sBoost) then
        potential = 88 + math.random(0, 4)       -- S：十年一遇
    elseif roll < (0.28 + sBoost) then
        potential = 78 + math.random(0, 6)       -- A：明日之星
    elseif roll < (0.65 + sBoost) then
        potential = 66 + math.random(0, 7)       -- B：值得培养
    else
        potential = 55 + math.random(0, 8)       -- C：轮换水平
    end

    local skillBase = math.floor(potential * (0.52 + math.random() * 0.18))
    local player = {
        id = "scout_" .. tostring(idx),
        name = ScoutSystem.PROSPECT_NAMES[math.random(#ScoutSystem.PROSPECT_NAMES)] .. "-" .. tostring(idx),
        role = role,
        mechanics = clamp(skillBase + math.random(-4, 6), 30, 92),
        teamfight = clamp(skillBase + math.random(-4, 6), 30, 92),
        laning = clamp(skillBase + math.random(-4, 6), 30, 92),
        form = math.random(48, 70),
        potential = potential,
        age = 16 + math.random(0, 3),
        salary = 4 + math.random(0, 4),
        buyout = 0,
        contractYears = 2,
        morale = 65,
        isProspect = true,
        scoutGrade = LeagueCatalog.GetPotentialGrade(potential),
    }
    LeagueCatalog.RegisterPlayer(player)
    state.scouting.prospects[player.id] = player

    -- 选手生态：人格 + 品牌起点（接 PLAYER_ECOSYSTEM）
    local eco = PlayerEcoSystem.GetEco(state, player.id)
    if scout and scout.specialty == "influence" then
        eco.brand = eco.brand or { value = 20, trend = 0, endorsements = {} }
        eco.brand.value = math.min(100, (eco.brand.value or 20) + 15 + 5 * (scout.level or 1))
    end
    return player
end

-- ───────────────────────── 签下抢手新秀（直接签，绕过经纪人门槛） ─────────────────────────

function ScoutSystem.SignProspect(state, playerId)
    state = CompanyState.Ensure(state)
    local player = LeagueCatalog.GetPlayer(playerId) or state.scouting.prospects[playerId]
    if not player then return false, "选手不存在" end
    if ScoutSystem.IsOwned(state, playerId) then return false, "该选手已在阵中" end

    local slot = nil
    for s, pid in pairs(state.roster.bench) do
        if not pid or pid == "" then slot = slot or s end
    end
    local placed
    if slot then
        state.roster.bench[slot] = playerId
        placed = "替补席"
    elseif state.roster.players[player.role] == "" then
        state.roster.players[player.role] = playerId
        placed = "首发"
    else
        return false, "替补席与对应首发位均已满，无法签下"
    end

    local MarketSystem = require("MarketSystem")
    local fee = math.max(1, math.floor(MarketSystem.GetMarketValue(state, playerId) * 0.5))
    if state.company.cash < fee then
        if slot then state.roster.bench[slot] = "" else state.roster.players[player.role] = "" end
        return false, "现金不足，无法支付签约费（¥" .. tostring(fee) .. "万）"
    end

    state.company.cash = state.company.cash - fee
    state.roster.contracts[playerId] = LeagueCatalog.GetContractYears(playerId)
    state.roster.desire[playerId] = 15 + math.random(0, 15)
    state.roster.buyouts[playerId] = nil
    player.morale = 60

    -- 移出抢手名单
    local keep = {}
    for _, h in ipairs(state.scouting.hotProspects or {}) do
        if h.id ~= playerId then table.insert(keep, h) end
    end
    state.scouting.hotProspects = keep

    CompanyState.RecordTimeline(state, "签下球探新秀",
        "从球探报告中签下 " .. player.name .. "（" .. LeagueCatalog.POSITIONS[player.role] .. "），进入" .. placed .. "。")
    return true, "已签下 " .. player.name .. "（进入" .. placed .. "）"
end

function ScoutSystem.GetGradeDesc(grade)
    local desc = {
        S = "十年一遇的天才",
        A = "明日之星",
        B = "值得培养的胚子",
        C = "轮换替补水平",
    }
    return desc[grade] or "潜力未知"
end

return ScoutSystem
