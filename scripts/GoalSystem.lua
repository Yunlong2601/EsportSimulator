-- GoalSystem：赛季董事会目标
-- 每赛季开局由董事会生成 2-3 个目标（竞技 + 经营），周结算更新进度，
-- 赛季末判定奖惩：全达成 → 好评 + 下季预算加成；全败 → 警告 + 预算缩减。
-- 借鉴 FM 董事会目标系统：给每周结算一个明确的方向感。
local CompanyState = require("CompanyState")

local GoalSystem = {}

local function clamp(value, minimum, maximum)
    return math.max(minimum, math.min(maximum, tonumber(value) or minimum))
end

-- 按积分榜计算我方当前排名（standings 缺省时返回 8）
local function rankIn(standings, targetId)
    local sorted = {}
    for _, entry in ipairs(standings or {}) do table.insert(sorted, entry) end
    table.sort(sorted, function(a, b)
        if a.wins ~= b.wins then return a.wins > b.wins end
        return (a.score or 0) > (b.score or 0)
    end)
    for rank, entry in ipairs(sorted) do
        if entry.teamId == targetId then return rank end
    end
    return #sorted + 1
end

function GoalSystem.GetCurrentRank(state)
    state = CompanyState.Ensure(state)
    local league = state.company.league
    if league == "academy" then
        return rankIn(state.roster.academy.standings, "legacy_youth")
    end
    if league == "qualifier" then
        return rankIn(state.league.standings, "legacy_cafe")
    end
    return rankIn(state.league.standings, "legacy")
end

-- 目标池：type 决定判定方式（rank/profit/cash/fans/youth/sponsor）
GoalSystem.GOALS = {
    qualify = { type = "rank", title = "预选赛出线", desc = "城市赛预选赛排名前二，拿到次级联赛席位", target = 2 },
    promote = { type = "rank", title = "冲击升级", desc = "次级联赛排名前二，升入东冠联赛", target = 2 },
    playoffs = { type = "rank", title = "闯入季后赛", desc = "常规赛进入前四，获得季后赛资格", target = 4 },
    championship = { type = "rank", title = "登顶东冠", desc = "夺得东冠联赛冠军，捧起奖杯", target = 1 },
    stay = { type = "rank", title = "成功保级", desc = "常规赛排名高于降级区（前六）", target = 6 },
    profit = { type = "profit", title = "扭亏为盈", desc = "累计 3 周实现正净收入", target = 3 },
    cash = { type = "cash", title = "现金积累", desc = "赛季末现金达到董事会要求", target = 0 },
    fans = { type = "fans", title = "粉丝增长", desc = "赛季末粉丝达到董事会要求", target = 0 },
    youth = { type = "youth", title = "青训成果", desc = "青训学员累计训练满 4 周", target = 4 },
    sponsor = { type = "sponsor", title = "商业拓展", desc = "新签约 1 家赞助商", target = 1 },
}

-- 经营类目标池（按联赛可用范围）
local BUSINESS_POOL = {
    qualifier = { "profit", "cash", "fans" },
    academy = { "profit", "cash", "fans", "youth" },
    pro = { "profit", "cash", "fans", "youth", "sponsor" },
}
local REWARD_BY_DIFFICULTY = { easy = 500, standard = 400, hard = 300 }

local function pickBusiness(pool, exclude)
    local candidates = {}
    for _, id in ipairs(pool) do
        if id ~= exclude then table.insert(candidates, id) end
    end
    if #candidates == 0 then return nil end
    return candidates[math.random(#candidates)]
end

function GoalSystem.GenerateSeasonGoals(state)
    state = CompanyState.Ensure(state)
    local league = state.company.league
    local goals = {}

    -- 主竞技目标（必选）：网吧队出线 / 次级队升级 / 东冠争冠或保季后赛
    local mainId
    if league == "qualifier" then
        mainId = "qualify"
    elseif league == "academy" then
        mainId = "promote"
    else
        local championships = tonumber(state.profile and state.profile.championships) or 0
        mainId = championships > 0 and "championship" or "playoffs"
    end
    table.insert(goals, GoalSystem.NewGoal(state, mainId))

    -- 经营目标（必选 1 个）
    local pool = BUSINESS_POOL[league] or BUSINESS_POOL.pro
    local biz1 = pickBusiness(pool)
    if biz1 then table.insert(goals, GoalSystem.NewGoal(state, biz1)) end

    -- 第 3 个目标（奖励档）：有经营池剩余时追加一个不同类的经营目标
    local biz2 = pickBusiness(pool, biz1)
    if biz2 then
        local bonus = GoalSystem.NewGoal(state, biz2)
        bonus.tier = "bonus"
        bonus.reward = REWARD_BY_DIFFICULTY[state.company.difficulty] or 400
        table.insert(goals, bonus)
    end

    state.goals.season = goals
    local FinanceSystem = require("FinanceSystem")
    state.goals.baseline = {
        cash = state.company.cash,
        fans = state.company.fans,
        sponsor = GoalSystem.GetSponsorCount(state),
        valuation = FinanceSystem.GetValuation(state),
    }
    local names = {}
    for _, g in ipairs(goals) do table.insert(names, "「" .. g.title .. "」") end
    CompanyState.RecordTimeline(state, "董事会目标",
        "新赛季董事会提出 " .. tostring(#goals) .. " 项目标：" .. table.concat(names, "、"))
    return state
end

function GoalSystem.NewGoal(state, id)
    state = CompanyState.Ensure(state)
    local def = GoalSystem.GOALS[id]
    if not def then return nil end
    local target = def.target
    if id == "cash" then
        target = math.max(300, math.floor((state.company.cash or 500) * 1.25))
    elseif id == "fans" then
        target = math.floor((state.company.fans or 20000) * 1.15)
    end
    local goal = {
        id = id,
        type = def.type,
        title = def.title,
        desc = def.desc,
        target = target,
        current = 0,
        done = false,
        tier = def.type == "rank" and "must" or "important",
        reward = 0,
    }
    return goal
end

function GoalSystem.GetYouthWeeks(state)
    state = CompanyState.Ensure(state)
    local total = 0
    for _, entry in pairs(state.roster.academy.trainees or {}) do
        total = total + tonumber(entry.weeks or 0)
    end
    return total
end

function GoalSystem.GetSponsorCount(state)
    state = CompanyState.Ensure(state)
    local count = 0
    for _, slot in pairs(state.company.sponsors.active or {}) do
        if slot and slot.offerId then count = count + 1 end
    end
    return count
end

-- 周结算后更新目标进度；weekNet 为本周净收入（用于盈利目标累计）
function GoalSystem.UpdateProgress(state, weekNet)
    state = CompanyState.Ensure(state)
    for _, goal in ipairs(state.goals.season or {}) do
        local cur
        if goal.type == "rank" then
            cur = GoalSystem.GetCurrentRank(state)
            goal.current = cur
            goal.done = cur <= goal.target
        elseif goal.type == "profit" then
            if weekNet and weekNet > 0 then goal.acc = (goal.acc or 0) + 1 end
            cur = goal.acc or 0
            goal.current = cur
            goal.done = cur >= goal.target
        elseif goal.type == "cash" then
            cur = tonumber(state.company.cash) or 0
            goal.current = cur
            goal.done = cur >= goal.target
        elseif goal.type == "fans" then
            cur = tonumber(state.company.fans) or 0
            goal.current = cur
            goal.done = cur >= goal.target
        elseif goal.type == "youth" then
            cur = GoalSystem.GetYouthWeeks(state)
            goal.current = cur
            goal.done = cur >= goal.target
        elseif goal.type == "sponsor" then
            local baseline = (state.goals.baseline and state.goals.baseline.sponsor) or 0
            cur = math.max(0, GoalSystem.GetSponsorCount(state) - baseline)
            goal.current = cur
            goal.done = cur >= goal.target
        end
    end
    return state
end

-- 赛季结束判定（在 StartNewSeason 开头调用，此时旧赛季排名表仍有效）
function GoalSystem.SettleSeason(state)
    state = CompanyState.Ensure(state)
    local goals = state.goals.season or {}
    if #goals == 0 then return state end
    GoalSystem.UpdateProgress(state, nil)
    local done = 0
    for _, g in ipairs(goals) do
        if g.done then done = done + 1 end
    end
    local verdict = "half"
    if done == #goals then
        verdict = "all"
        state.goals.streak = (state.goals.streak or 0) + 1
        state.company.reputation = clamp(state.company.reputation + 5, 0, 100)
        state.goals.nextBudgetBonus = 1.15
        CompanyState.RecordTimeline(state, "董事会好评",
            "赛季目标全部达成（" .. tostring(done) .. "/" .. tostring(#goals) .. "），董事会高度认可，下赛季预算 +15%。")
    elseif done <= math.floor(#goals / 2) then
        verdict = "none"
        state.goals.streak = 0
        state.company.reputation = clamp(state.company.reputation - 3, 0, 100)
        state.goals.nextBudgetBonus = 0.85
        CompanyState.RecordTimeline(state, "董事会警告",
            "仅达成 " .. tostring(done) .. "/" .. tostring(#goals) .. " 项目标，声誉 -3，下赛季预算缩减 15%。")
    else
        state.goals.streak = 0
        CompanyState.RecordTimeline(state, "董事会评价",
            "达成 " .. tostring(done) .. "/" .. tostring(#goals) .. " 项目标，董事会基本满意。")
    end
    -- 连续三季全达成 → 名人堂荣誉
    if (state.goals.streak or 0) >= 3 and not state.goals.hallMark then
        state.goals.hallMark = true
        local ProfileSystem = require("ProfileSystem")
        ProfileSystem.InsertHonor(state, {
            type = "board",
            title = "董事会之星",
            detail = "连续 " .. tostring(state.goals.streak) .. " 个赛季达成全部董事会目标",
            at = tonumber(state.company.seasons) or 0,
        })
    end
    -- P0-3 奖励目标：达成即发奖金（仅 [奖励] 档）
    for _, g in ipairs(goals) do
        if g.tier == "bonus" and g.done and (g.reward or 0) > 0 then
            state.company.cash = (state.company.cash or 0) + g.reward
            CompanyState.RecordTimeline(state, "奖励目标达成",
                "「" .. g.title .. "」达成，董事会发放奖金 ¥" .. tostring(g.reward) .. "万。")
        end
    end
    -- P0-2 赛季评估卡：评分 + 等级 + 逐项目标完成状态
    local evItems = {}
    for _, g in ipairs(goals) do
        table.insert(evItems, { title = g.title, done = g.done, tier = g.tier or "important" })
    end
    local score = #goals > 0 and math.floor((done / #goals) * 100) or 0
    local grade = score >= 85 and "A" or (score >= 65 and "B" or (score >= 40 and "C" or "D"))
    state.goals.lastEvaluation = {
        season = tonumber(state.company.seasons) or 0,
        score = score,
        grade = grade,
        done = done,
        total = #goals,
        items = evItems,
    }
    state.goals.lastVerdict = { done = done, total = #goals, verdict = verdict }
    return state
end

-- 董事会预算奖惩：StartNewSeason 时把上季结算的预算加成/缩减兑现为现金
function GoalSystem.ApplyBudgetBonus(state)
    state = CompanyState.Ensure(state)
    local bonus = state.goals.nextBudgetBonus
    if not bonus then return state end
    state.goals.nextBudgetBonus = nil
    local grant = math.floor((state.company.cash or 0) * (bonus - 1))
    if grant ~= 0 then
        state.company.cash = math.max(0, (state.company.cash or 0) + grant)
        local verb = grant > 0 and "追加运营预算 ¥" .. tostring(grant) .. "万" or "缩减预算 ¥" .. tostring(-grant) .. "万"
        CompanyState.RecordTimeline(state, "董事会调整", "基于上季表现，" .. verb .. "。")
    end
    return state
end

function GoalSystem.GetProgressText(goal)
    if not goal then return "", 0, false end
    if goal.type == "rank" then
        local rank = tonumber(goal.current) or 0
        return "第 " .. tostring(rank) .. " 名 / 前 " .. tostring(goal.target) .. " 名", rank, goal.done
    end
    local ratio = goal.target > 0 and (tonumber(goal.current) or 0) / goal.target or 0
    return tostring(math.floor(ratio * 100 + 0.5)) .. "%", ratio, goal.done
end


-- 目标分级文案（P0-3）：必须 / 重要 / 奖励
function GoalSystem.GetTierLabel(goal)
    if not goal then return "重要", "important" end
    local tier = goal.tier or "important"
    if tier == "must" then return "必须", tier end
    if tier == "bonus" then return "奖励", tier end
    return "重要", tier
end
return GoalSystem
