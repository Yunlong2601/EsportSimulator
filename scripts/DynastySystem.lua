-- DynastySystem：王朝传承 / 跨赛季目标（机制 B）
-- 给长线目标：传奇点、王朝评级、跨赛季累计目标、解锁与里程碑时间线。
-- 让玩家打完一季仍有盼头，解决「30 分钟后无事可做」。
local CompanyState = require("CompanyState")

local DynastySystem = {}

local TIERS = {
    { tier = 0, label = "新秀王朝", min = 0 },
    { tier = 1, label = "崛起王朝", min = 60 },
    { tier = 2, label = "豪门王朝", min = 160 },
    { tier = 3, label = "传奇王朝", min = 320 },
}

-- 跨赛季累计目标（持久，达成后写入 milestones）
local GOALS = {
    {
        id = "three_crowns",
        label = "三冠王朝",
        desc = "累计夺得 3 次联赛冠军",
        target = 3,
        get = function(state) return tonumber(state.profile.championships) or 0 end,
    },
    {
        id = "world",
        label = "世界之巅",
        desc = "捧起至少一座世界冠军奖杯",
        target = 1,
        get = function(state) return tonumber(state.profile.hallOfFame and state.profile.hallOfFame.worldChampionships or 0) or 0 end,
    },
    {
        id = "archrival",
        label = "宿敌克星",
        desc = "将任意对手的恩怨提升到死敌级别",
        target = 1,
        get = function(state) return (state.legacy and state.legacy.reachedRival3) and 1 or 0 end,
    },
    {
        id = "valuation",
        label = "商业巨头",
        desc = "俱乐部估值峰值突破 ¥5000 万",
        target = 5000,
        get = function(state) return math.floor(tonumber(state.profile.bestValuation) or 0) end,
    },
    {
        id = "decade",
        label = "十季基业",
        desc = "征战满 5 个赛季",
        target = 5,
        get = function(state) return tonumber(state.legacy and state.legacy.seasonsPlayed or 0) or 0 end,
    },
}

local UNLOCKS = {
    [1] = { label = "王朝球探", desc = "传奇球探报告质量 +10%（永久）" },
    [2] = { label = "豪门训练营", desc = "训练设施加成 +1 级效果（永久）" },
    [3] = { label = "传奇光环", desc = "赞助基础报价 +15%（永久）" },
}

function DynastySystem.Ensure(state)
    state = CompanyState.Ensure(state)
    state.legacy = state.legacy or {}
    state.legacy.points = tonumber(state.legacy.points) or 0
    state.legacy.tier = tonumber(state.legacy.tier) or 0
    state.legacy.seasonsPlayed = tonumber(state.legacy.seasonsPlayed) or 0
    state.legacy.reachedRival3 = state.legacy.reachedRival3 == true
    state.legacy.goals = state.legacy.goals or {}
    state.legacy.unlocked = state.legacy.unlocked or {}
    state.legacy.milestones = state.legacy.milestones or {}
    return state
end

function DynastySystem.GetTierInfo(points)
    local cur = TIERS[1]
    local nextT = nil
    for i = 1, #TIERS do
        if points >= TIERS[i].min then
            cur = TIERS[i]
            nextT = TIERS[i + 1]
        end
    end
    return {
        tier = cur.tier,
        label = cur.label,
        min = cur.min,
        next = nextT,
        progress = nextT and math.min(1, (points - cur.min) / (nextT.min - cur.min)) or 1,
        toNext = nextT and (nextT.min - points) or 0,
    }
end

function DynastySystem.GetGoals(state)
    state = DynastySystem.Ensure(state)
    local list = {}
    for _, g in ipairs(GOALS) do
        local cur = math.floor(tonumber(g.get(state)) or 0)
        local done = (state.legacy.goals[g.id] == true) or (cur >= g.target)
        if done and state.legacy.goals[g.id] ~= true then
            state.legacy.goals[g.id] = true
        end
        table.insert(list, {
            id = g.id,
            label = g.label,
            desc = g.desc,
            current = math.min(cur, g.target),
            target = g.target,
            done = done,
            progress = math.min(1, cur / g.target),
        })
    end
    return list
end

function DynastySystem.GetUnlocks(state)
    state = DynastySystem.Ensure(state)
    local list = {}
    for tier, info in pairs(UNLOCKS) do
        table.insert(list, {
            tier = tier,
            label = info.label,
            desc = info.desc,
            unlocked = state.legacy.unlocked[tostring(tier)] == true,
        })
    end
    table.sort(list, function(a, b) return a.tier < b.tier end)
    return list
end

function DynastySystem.AddLegacy(state, amount, reason)
    state = DynastySystem.Ensure(state)
    state.legacy.points = math.max(0, state.legacy.points + amount)
    if reason and reason ~= "" then
        DynastySystem.RecordMilestone(state, reason)
    end
    return state
end

function DynastySystem.RecordMilestone(state, text)
    state = DynastySystem.Ensure(state)
    table.insert(state.legacy.milestones, 1, {
        season = tonumber(state.company.seasons) or 0,
        text = text,
    })
    while #state.legacy.milestones > 40 do table.remove(state.legacy.milestones) end
    return state
end

--- 赛季末结算：发放传奇点、升级王朝、完成跨赛季目标、解锁
--- 在 CompanyState.StartNewSeason 中调用（赛季成绩已落档）
function DynastySystem.OnSeasonEnd(state)
    state = DynastySystem.Ensure(state)
    local gained = 0
    local notes = {}

    state.legacy.seasonsPlayed = (state.legacy.seasonsPlayed or 0) + 1

    -- 本季成绩奖励（读取已落档的 profile / 状态）
    local champ = (tonumber(state.profile.championships) or 0) > (state.legacy._lastChamp or 0)
    if champ then
        gained = gained + 50
        table.insert(notes, "联赛夺冠 +50 传奇点")
        state.legacy._lastChamp = tonumber(state.profile.championships) or 0
    end
    local wc = tonumber(state.profile.hallOfFame and state.profile.hallOfFame.worldChampionships or 0) or 0
    if wc > (state.legacy._lastWC or 0) then
        gained = gained + 100
        table.insert(notes, "世界冠军 +100 传奇点")
        state.legacy._lastWC = wc
    end
    -- 董事会目标全达成（goalSystem 已落档 lastVerdict）
    local verdict = state.goals and state.goals.lastVerdict and state.goals.lastVerdict.verdict
    if verdict == "all" then
        gained = gained + 20
        table.insert(notes, "董事会目标全达成 +20 传奇点")
    end

    if gained > 0 then
        DynastySystem.AddLegacy(state, gained, "第 " .. tostring(state.legacy.seasonsPlayed) .. " 赛季结算：+" .. tostring(gained) .. " 传奇点")
    end

    -- 王朝评级
    local info = DynastySystem.GetTierInfo(state.legacy.points)
    if info.tier > state.legacy.tier then
        for t = state.legacy.tier + 1, info.tier do
            local u = UNLOCKS[t]
            if u then
                state.legacy.unlocked[tostring(t)] = true
                -- 解锁一次性奖励
                state.company.reputation = math.min(100, (state.company.reputation or 0) + 5)
                state.company.cash = (state.company.cash or 0) + 80
                table.insert(notes, "解锁「" .. u.label .. "」：+" .. tostring(80) .. "万现金 / +5 声望")
                CompanyState.RecordTimeline(state, "王朝解锁",
                    "王朝晋升至「" .. info.label .. "」，解锁永久特权「" .. u.label .. "」。")
            end
        end
        state.legacy.tier = info.tier
    end

    -- 跨赛季目标检查：新完成的目标记入里程碑（避免重复，用 _goalMilestone 记录）
    for _, g in ipairs(DynastySystem.GetGoals(state)) do
        if g.done and not (state.legacy._goalMilestone and state.legacy._goalMilestone[g.id]) then
            state.legacy._goalMilestone = state.legacy._goalMilestone or {}
            state.legacy._goalMilestone[g.id] = true
            DynastySystem.RecordMilestone(state, "跨赛季目标达成：「" .. g.label .. "」")
            CompanyState.RecordTimeline(state, "王朝目标",
                "跨赛季目标「" .. g.label .. "」达成！")
        end
    end

    return { gained = gained, notes = notes, tier = info.tier, tierLabel = info.label }
end

return DynastySystem
