-- AISystem：AI 俱乐部实体化（让 AI 拥有与玩家同构的资产与决策）
-- 东冠联赛 7 支 AI 队持有 5 人首发阵容（专属 agent 选手：五维 + 英雄池 + 合同/工资）、
-- 预算、赛季目标、战术与士气；战力用与玩家同一把尺子（RosterSystem.GetPlayerPower）。
-- 范围边界：只实体化 pro 联赛 AI 队；次级联赛（_youth）与区域队保持原公式。
local LeagueCatalog = require("LeagueCatalog")
local RosterSystem = require("RosterSystem")
local TacticsSystem = require("TacticsSystem")
local CompanyState = require("CompanyState")

local AISystem = {}

AISystem.ROLES = { "top", "jungle", "mid", "adc", "support" }
AISystem.ROLE_WEIGHT = { top = 1.0, jungle = 1.0, mid = 1.15, adc = 1.15, support = 1.0 }
AISystem.AI_TEAM_SCALE = 6.0 -- 与 CompetitionSystem 旧常量一致（校准基准）
AISystem.AI_SEASON_GROWTH = 0.12 -- 每赛季 AI 队伍成长（保持旧曲线）
AISystem.REINFORCE_ORDER = { "mid", "adc", "jungle", "top", "support" } -- 补强位置优先级：预算优先补 mid/adc

-- 队伍风格 → 战术偏好（用于每周 AI 战术选择）
AISystem.STYLE_TACTIC = {
    aggressive = { "aggressive", "balanced", "metapick" },
    defensive = { "defensive", "balanced", "metapick" },
    slowstart = { "defensive", "balanced", "metapick" },
    metapick = { "metapick", "aggressive", "balanced" },
}

AISystem.GOAL_LABEL = { contend = "争冠", survive = "保级", rebuild = "摆烂" }

-- 35 个稳定专属名（按 队序×位置 确定性分配，避免重名）
AISystem.NAMES = {
    "Aiden", "Bane", "Cruz", "Dax", "Eliot", "Frost", "Gunn", "Haze", "Ivo", "Jax",
    "Kai", "Loki", "Miles", "Nash", "Onyx", "Pike", "Quill", "Rex", "Slade", "Troy",
    "Uno", "Vale", "Wolf", "Xan", "Yuri", "Zane", "Aero", "Blitz", "Cobra", "Duke",
    "Echo", "Fable", "Grit", "Halo", "Iris",
}

local function clamp(value, lo, hi)
    return math.max(lo, math.min(hi, tonumber(value) or lo))
end

-- 直接读难度配置（避免 GetDifficulty 内的 Ensure 递归）
local function difficultyOf(state)
    return CompanyState.DIFFICULTIES[state.company.difficulty] or CompanyState.DIFFICULTIES.standard
end

local function staffBonusOf(agent)
    local level = tonumber(agent and agent.staffLevel) or 2
    return 1 + (level - 1) * 0.01
end

-- 东冠 pro 联赛 AI 队（排除玩家 legacy）
function AISystem.IsProAiTeam(teamId)
    for _, t in ipairs(LeagueCatalog.TEAMS) do
        if t.id == teamId and t.id ~= "legacy" then return true end
    end
    return false
end

function AISystem.GetAgent(state, teamId)
    if not AISystem.IsProAiTeam(teamId) then return nil end
    return (state.aiTeams or {})[tostring(teamId)]
end

-- 旧公式战力（校准基准）：与升级前 GetTeamPower 输出一致
function AISystem.GetLegacyPower(state, team)
    local difficulty = difficultyOf(state)
    local seasons = tonumber(state.company and state.company.seasons) or 0
    local growth = 1 + seasons * AISystem.AI_SEASON_GROWTH
    local ai = state.aiTeams and state.aiTeams[tostring(team.id)]
    local bonus = tonumber(ai and ai.bonus) or 0
    return math.floor(team.power * AISystem.AI_TEAM_SCALE * growth * (0.95 + math.random() * 0.1) * difficulty.aiPower + 0.5) + bonus
end

-- 生成一名 agent 选手：五维都取 rolePower 使加权和≈目标战力（系数和=1.0）
function AISystem.NewAgentPlayer(team, role, rolePower, agent)
    local player = {
        id = "ai_" .. team.id .. "_" .. role,
        name = AISystem.NAMES[((AISystem.teamIndex(team.id) - 1) * 5 + AISystem.roleIndex(role)) % #AISystem.NAMES + 1],
        role = role,
        age = clamp(19 + math.floor(rolePower / 55) + math.random(-2, 2), 17, 29),
        mechanics = rolePower,
        teamfight = rolePower,
        laning = rolePower,
        form = rolePower,
        recentForm = 0,
        morale = 55 + math.random(0, 15),
        potential = clamp(rolePower + 12 + math.random(-10, 10), 55, 95),
        salary = math.max(4, math.floor(rolePower / 24)),
        contractYears = 1 + math.random(0, 2),
        buyout = math.floor(rolePower * 3.2),
        _growthBase = rolePower,
    }
    local HeroSystem = require("HeroSystem")
    HeroSystem.SeedPlayer(player)
    return player
end

function AISystem.teamIndex(teamId)
    for i, t in ipairs(LeagueCatalog.TEAMS) do
        if t.id == teamId then return i end
    end
    return 1
end

function AISystem.roleIndex(role)
    for i, r in ipairs(AISystem.ROLES) do
        if r == role then return i end
    end
    return 1
end

-- 生成 5 人首发：锚定旧公式总战力，生成后对中单 mechanics 一次性校准（误差 ≤1）
function AISystem.GenerateRoster(state, team, agent)
    local target = AISystem.GetLegacyPower(state, team)
    local totalWeight = 0
    for _, role in ipairs(AISystem.ROLES) do totalWeight = totalWeight + AISystem.ROLE_WEIGHT[role] end
    local roster = {}
    for _, role in ipairs(AISystem.ROLES) do
        local rolePower = math.max(30, math.floor(target * AISystem.ROLE_WEIGHT[role] / totalWeight + 0.5))
        roster[role] = AISystem.NewAgentPlayer(team, role, rolePower, agent)
    end
    local metaRole = state.meta and state.meta.role
    local actual = 0
    for _, p in pairs(roster) do actual = actual + RosterSystem.GetPlayerPower(p, metaRole) end
    local diff = target - actual
    roster.mid.mechanics = clamp(roster.mid.mechanics + math.floor(diff / 0.35 + 0.5), 5, 99)
    return roster
end

-- 与玩家同一把尺子的 AI 战力：五维 × 版本/士气修正 × 教练加成
function AISystem.GetTeamPower(state, teamId)
    state = CompanyState.Ensure(state)
    local agent = AISystem.GetAgent(state, teamId)
    if not agent or not agent.roster then return 0 end
    local metaRole = state.meta and state.meta.role
    local total = 0
    for _, p in pairs(agent.roster) do total = total + RosterSystem.GetPlayerPower(p, metaRole) end
    return math.floor(total * staffBonusOf(agent) + 0.5)
end

-- 按含玩家在内的 8 队战力排名定赛季目标：前 3 争冠 / 4-6 保级 / 7-8 摆烂
function AISystem.RankGoal(state, teamId)
    local powers = {}
    for _, t in ipairs(LeagueCatalog.TEAMS) do
        local p = t.id == "legacy" and RosterSystem.GetTeamPower(state) or AISystem.GetTeamPower(state, t.id)
        table.insert(powers, { id = t.id, p = p })
    end
    table.sort(powers, function(a, b) return a.p > b.p end)
    for i, e in ipairs(powers) do
        if e.id == teamId then
            if i <= 3 then return "contend" end
            if i <= 6 then return "survive" end
            return "rebuild"
        end
    end
    return "survive"
end

-- 赛季初始化：目标 / 预算 / 薪资帽（预算随上季成绩：冠军 +40% / 中游 ±0 / 垫底 -30%）
function AISystem.CalibrateSeason(state, agent, team)
    local difficulty = difficultyOf(state)
    local goal = AISystem.RankGoal(state, team.id)
    agent.goal = goal
    local goalBonus = goal == "contend" and 600 or (goal == "survive" and 200 or -200)
    local power = AISystem.GetTeamPower(state, team.id)
    local rank = tonumber(agent.lastRank) or 0
    local rankFactor = rank == 1 and 1.4 or (rank >= 7 and 0.7 or 1.0)
    agent.budget = math.max(300, math.floor((600 + power * 2.5 + goalBonus) * difficulty.aiPower * rankFactor))
    agent.salaryUsed = 0
    for _, p in pairs(agent.roster) do agent.salaryUsed = agent.salaryUsed + (tonumber(p.salary) or 0) end
    return agent
end

-- 惰性实体化：为东冠 7 支 AI 队补 roster（旧档只带 bonus/signings 也可迁移）
function AISystem.EnsureAgents(state)
    state.aiTeams = state.aiTeams or {}
    -- 第一阶段：补全 7 队 5 人首发 roster（旧档只有 bonus/signings 也可迁移）
    for _, team in ipairs(LeagueCatalog.TEAMS) do
        if team.id ~= "legacy" then
            local key = tostring(team.id)
            local agent = state.aiTeams[key]
            if not agent then
                agent = { bonus = 0, signings = {} }
                state.aiTeams[key] = agent
            end
            if not agent.roster then
                agent.staffLevel = tonumber(agent.staffLevel) or (2 + math.random(0, 1))
                agent.tactic = "balanced"
                agent.morale = 55 + math.random(0, 15)
                agent.roster = AISystem.GenerateRoster(state, team, agent)
            end
        end
    end
    -- 第二阶段：全部 roster 就绪后再统一校准目标/预算（RankGoal 需要全量战力）
    for _, team in ipairs(LeagueCatalog.TEAMS) do
        if team.id ~= "legacy" then
            local agent = state.aiTeams[tostring(team.id)]
            if agent and agent.roster and not agent.calibrated then
                -- 先置位再校准：RankGoal → GetTeamPower 会重入 EnsureAgents，避免无限递归
                agent.calibrated = true
                AISystem.CalibrateSeason(state, agent, team)
            end
        end
    end
    return state
end

-- 每赛季成长：按旧线性曲线（每季 +12% × 生成时基准），精确折进 mech/tf
function AISystem.ApplySeasonGrowth(agent)
    for _, p in pairs(agent.roster) do
        local base = tonumber(p._growthBase) or 50
        local pool = AISystem.AI_SEASON_GROWTH * base
        p.mechanics = clamp(p.mechanics + math.floor(pool * 0.5 / 0.35 + 0.5), 5, 99)
        p.teamfight = clamp(p.teamfight + math.floor(pool * 0.5 / 0.3 + 0.5), 5, 99)
        p.form = clamp(p.form + 2, 5, 100)
    end
end

-- 新赛季重置：成长 + 重定目标/预算 + 恢复士气（预算随上季排名调整，变化汇总进时间线）
function AISystem.ResetSeason(state)
    state = CompanyState.Ensure(state)
    local changes = {}
    for _, team in ipairs(LeagueCatalog.TEAMS) do
        if team.id ~= "legacy" then
            local agent = (state.aiTeams or {})[tostring(team.id)]
            if agent and agent.roster then
                local rank = tonumber(agent.lastRank) or 0
                local factor = rank == 1 and 1.4 or (rank >= 7 and 0.7 or 1.0)
                AISystem.ApplySeasonGrowth(agent)
                AISystem.CalibrateSeason(state, agent, team)
                agent.tactic = "balanced"
                agent.morale = 55 + math.random(0, 15)
                if factor == 1.4 then
                    table.insert(changes, team.name .. " 因上季夺冠，预算 +40%")
                elseif factor == 0.7 then
                    table.insert(changes, team.name .. " 因上季垫底，预算 -30%")
                end
            end
        end
    end
    if #changes > 0 then
        CompanyState.RecordTimeline(state, "AI 预算调整", table.concat(changes, "；") .. "。")
    end
    return state
end

-- 夏季赛开幕：重定目标/预算（不加成长）
function AISystem.CalibrateAll(state)
    state = CompanyState.Ensure(state)
    for _, team in ipairs(LeagueCatalog.TEAMS) do
        if team.id ~= "legacy" then
            local agent = (state.aiTeams or {})[tostring(team.id)]
            if agent and agent.roster then AISystem.CalibrateSeason(state, agent, team) end
        end
    end
    return state
end
-- 赛季结算捕获 AI 上季名次（standings 清空前调用，仅 pro 联赛；与 GetStandings 同排序）
function AISystem.CaptureLastRanks(state)
    state = CompanyState.Ensure(state)
    if state.company.league ~= "pro" then return state end
    local standings = state.league and state.league.standings
    if not standings or #standings == 0 then return state end
    local sorted = {}
    for _, entry in ipairs(standings) do table.insert(sorted, entry) end
    table.sort(sorted, function(a, b)
        if a.wins ~= b.wins then return a.wins > b.wins end
        return (a.score or 0) > (b.score or 0)
    end)
    for rank, entry in ipairs(sorted) do
        local agent = AISystem.GetAgent(state, entry.teamId)
        if agent then agent.lastRank = rank end
    end
    return state
end

-- AI 战术进入 MatchSimulator：与玩家战术同一张表
function AISystem.GetTacticRollParams(state, teamId, basePower)
    local agent = AISystem.GetAgent(state, teamId)
    local tactic = agent and agent.tactic and TacticsSystem.TACTICS[agent.tactic]
    if not tactic then return basePower, 0.15 end
    local power = basePower * tactic.power
    if tactic.metaBoost and state.meta and state.meta.role then power = power + 4 end
    -- AI 战术克制加成（P1-7）：AI 对玩家时，AI 的克制加成
    local TacticsSystem = require("TacticsSystem")
    local myTacticId = agent.tactic or "balanced"
    local playerTacticId = state.company.tactics or "balanced"
    local counterBonus = TacticsSystem.GetCounterBonus(state, myTacticId, playerTacticId)
    if counterBonus ~= 0 then
        power = power + counterBonus
    end
    return power, tactic.variance
end

-- 每周战术选择：风格偏好 60% + 版本答案 25% + 情境 15%；难度越高越跟版本
function AISystem.RollTactic(state, team, agent)
    local difficulty = difficultyOf(state)
    local pref = AISystem.STYLE_TACTIC[team.style] or { "balanced", "metapick" }
    local r = math.random()
    local id
    if r < 0.6 then
        id = pref[1]
    elseif r < 0.85 then
        id = "metapick"
    else
        id = pref[2] or "balanced"
    end
    if agent.goal == "contend" and math.random() < 0.25 then id = "aggressive" end
    if agent.goal == "rebuild" and math.random() < 0.3 then id = "defensive" end
    if difficulty.aiPower >= 1.15 and math.random() < 0.45 then id = "metapick" end
    agent.tactic = TacticsSystem.TACTICS[id] and id or "balanced"
end

-- 每周训练：最弱状态位置 +1 攻/+1 团（按教练等级），状态小幅回归
function AISystem.TrainAgents(agent)
    local weakest = nil
    for _, p in pairs(agent.roster) do
        if not weakest or (tonumber(p.form) or 0) < (tonumber(weakest.form) or 0) then weakest = p end
    end
    if weakest then
        local level = tonumber(agent.staffLevel) or 2
        weakest.mechanics = clamp(weakest.mechanics + 1, 5, 99)
        weakest.teamfight = clamp(weakest.teamfight + math.floor(level / 2), 5, 99)
        weakest.form = clamp(weakest.form + 1, 5, 100)
    end
end

-- 状态漂移：form ±1，士气向 60 回归
function AISystem.DriftForms(agent)
    for _, p in pairs(agent.roster) do
        p.form = clamp((tonumber(p.form) or 60) + math.random(-1, 1), 5, 100)
        p.morale = clamp((tonumber(p.morale) or 60) + (p.morale < 60 and 1 or (p.morale > 60 and -1 or 0)), 20, 100)
    end
end

-- 目标驱动转会：摆烂超薪 → 卖出最贵选手；争冠 → 按风格/位置优先级补强
function AISystem.TransferDriven(state, team, agent)
    if agent.goal == "rebuild" and (tonumber(agent.salaryUsed) or 0) > (tonumber(agent.budget) or 0) * 0.65 then
        AISystem.ReleaseExpensivePlayer(state, team, agent)
    end
    if agent.goal == "contend" and math.random() < 0.35 then
        local TransferNewsSystem = require("TransferNewsSystem")
        local pool = TransferNewsSystem.EnsurePool(state)
        local metaRole = state.meta and state.meta.role
        local style = team.style or "balanced"
        -- 按位置优先级（mid/adc 优先）逐槽位找补强，风格决定候选评分
        for _, role in ipairs(AISystem.REINFORCE_ORDER) do
            local slotPlayer = agent.roster[role]
            if slotPlayer then
                local slotPower = RosterSystem.GetPlayerPower(slotPlayer, metaRole)
                local best, bestScore = nil, nil
                for _, p in pairs(pool) do
                    if p.role == role and (tonumber(p.power) or 0) > slotPower + 6 then
                        local score = tonumber(p.power) or 0
                        if style == "aggressive" then
                            score = score + (tonumber(p.potential) or 0) * 0.5
                        elseif style == "defensive" or style == "slowstart" then
                            score = score + (tonumber(p.form) or 0) * 0.5
                        elseif style == "metapick" and role == metaRole then
                            score = score + 6
                        end
                        if not bestScore or score > bestScore then best, bestScore = p, score end
                    end
                end
                if best then
                    local amount = TransferNewsSystem.EstimateValue(best)
                    if (tonumber(agent.budget) or 0) >= amount then
                        best.team = team.id
                        best.teamName = team.name
                        TransferNewsSystem.ApplyAiStrengthening(state, team, best, amount)
                        TransferNewsSystem.RecordDeal(state, "自由市场", team.name, best, amount)
                        return
                    end
                end
            end
        end
    end
end

-- 卖出最贵选手到自由市场（摆烂清薪），换入年轻低价新秀
function AISystem.ReleaseExpensivePlayer(state, team, agent)
    local worst = nil
    for _, p in pairs(agent.roster) do
        if not worst or (tonumber(p.salary) or 0) > (tonumber(worst.salary) or 0) then worst = p end
    end
    if not worst then return end
    state.market.transferPool = state.market.transferPool or {}
    state.market.transferPoolSeq = tonumber(state.market.transferPoolSeq) or 0
    state.market.transferPoolSeq = state.market.transferPoolSeq + 1
    local pid = "ai_rel_" .. tostring(state.market.transferPoolSeq)
    local released = {
        id = pid, name = worst.name, role = worst.role,
        team = nil, teamName = "自由市场",
        power = RosterSystem.GetPlayerPower(worst, state.meta and state.meta.role),
        potential = tonumber(worst.potential) or 60,
        age = tonumber(worst.age) or 21,
        salary = tonumber(worst.salary) or 8,
        form = tonumber(worst.form) or 60,
    }
    state.market.transferPool[pid] = released
    agent.salaryUsed = math.max(0, (tonumber(agent.salaryUsed) or 0) - (tonumber(worst.salary) or 0))
    local rolePower = math.max(30, math.floor((tonumber(worst._growthBase) or 55) * 0.7))
    agent.roster[worst.role] = AISystem.NewAgentPlayer(team, worst.role, rolePower, agent)
    agent.signings = agent.signings or {}
    table.insert(agent.signings, { name = released.name, week = tonumber(state.company.week) or 1, amount = 0, note = "挂牌出售" })
    local TransferNewsSystem = require("TransferNewsSystem")
    TransferNewsSystem.RecordDeal(state, team.name, "自由市场", released, 0)
end

-- 每周 tick：战术 / 训练 / 状态 / 目标转会（仅东冠 pro 联赛）
function AISystem.WeeklyTick(state)
    state = CompanyState.Ensure(state)
    if state.company.league ~= "pro" then return state end
    for _, team in ipairs(LeagueCatalog.TEAMS) do
        if team.id ~= "legacy" then
            local agent = (state.aiTeams or {})[tostring(team.id)]
            if agent and agent.roster then
                AISystem.RollTactic(state, team, agent)
                AISystem.TrainAgents(agent)
                AISystem.DriftForms(agent)
                AISystem.TransferDriven(state, team, agent)
            end
        end
    end
    return state
end

-- AI 买入选手：真实替换对应位置槽位（转会落进阵容，不再只加 bonus）
function AISystem.AcquirePlayer(state, teamId, player, amount)
    state = CompanyState.Ensure(state)
    local agent = AISystem.GetAgent(state, teamId)
    if not agent or not agent.roster then return false end
    local role = player and player.role
    if not role or not agent.roster[role] then return false end
    local old = agent.roster[role]
    local metaRole = state.meta and state.meta.role
    local power = tonumber(player.power)
    if not power then power = RosterSystem.GetPlayerPower(player, metaRole) end
    local fresh = {
        id = "ai_" .. teamId .. "_" .. role,
        name = player.name,
        role = role,
        age = tonumber(player.age) or 21,
        mechanics = tonumber(player.mechanics) or power,
        teamfight = tonumber(player.teamfight) or power,
        laning = tonumber(player.laning) or power,
        form = tonumber(player.form) or power,
        recentForm = 0,
        morale = 60,
        potential = tonumber(player.potential) or clamp(power + 10, 55, 95),
        salary = tonumber(player.salary) or math.max(4, math.floor(power / 24)),
        contractYears = 1 + math.random(0, 2),
        buyout = math.floor(power * 3.2),
        _growthBase = power,
    }
    local HeroSystem = require("HeroSystem")
    HeroSystem.SeedPlayer(fresh)
    agent.roster[role] = fresh
    agent.salaryUsed = math.max(0, (tonumber(agent.salaryUsed) or 0) - (tonumber(old and old.salary) or 0) + (tonumber(fresh.salary) or 0))
    agent.budget = math.max(0, (tonumber(agent.budget) or 0) - (tonumber(amount) or 0))
    agent.signings = agent.signings or {}
    table.insert(agent.signings, {
        name = player.name,
        week = tonumber(state.company.week) or 1,
        amount = tonumber(amount) or 0,
    })
    return true
end

-- 排行榜 / 赛前情报摘要
function AISystem.GetRosterSummary(state, teamId)
    local agent = AISystem.GetAgent(state, teamId)
    if not agent or not agent.roster then return nil end
    local metaRole = state.meta and state.meta.role
    local names, best = {}, nil
    for role, p in pairs(agent.roster) do
        local pw = RosterSystem.GetPlayerPower(p, metaRole)
        names[role] = { name = p.name, power = pw, form = tonumber(p.form) or 0 }
        if not best or pw > best.power then best = { name = p.name, role = role, power = pw } end
    end
    return {
        names = names,
        star = best,
        budget = tonumber(agent.budget) or 0,
        salaryUsed = tonumber(agent.salaryUsed) or 0,
        goal = agent.goal or "survive",
        tactic = agent.tactic or "balanced",
        morale = tonumber(agent.morale) or 60,
        staffLevel = tonumber(agent.staffLevel) or 2,
        signings = agent.signings or {},
    }
end

-- 对局 BP 战力（AI 侧）：按 AI 选手英雄池 × 版本强度 × 对位克制/羁绊，与玩家 GetMatchPower 对称
function AISystem.GetMatchPower(state, teamId)
    state = CompanyState.Ensure(state)
    local agent = AISystem.GetAgent(state, teamId)
    if not agent or not agent.roster then return nil end
    local HeroSystem = require("HeroSystem")
    local m = state.match
    local picks = (m and m.oppPicks) or {}
    local metaRole = state.meta and state.meta.role
    local total = 0
    for role, p in pairs(agent.roster) do
        local heroId = picks[role]
        local base = RosterSystem.GetPlayerPower(p, metaRole)
        local factor = 1.0
        if heroId then
            local prof = tonumber((p.heroes or {})[heroId]) or 30
            factor = (0.62 + prof / 100 * 0.78) * HeroSystem.GetVersionPower(state, heroId)
        else
            factor = 0.8
        end
        total = total + base * factor
    end
    local counter = (m and HeroSystem.GetCounterSummary(state)) or nil
    local synergy = (m and HeroSystem.GetActiveSynergies(state)) or nil
    -- #142 克制/羁绊对称：GetCounterSummary / GetActiveSynergies 均为「玩家视角」带符号值，
    -- 对手取其相反值，使英雄克制、阵容羁绊对双方同时生效，修正此前仅玩家单边受益、克制与羁绊相互抵消归零的失衡。
    -- 注：对手选手不携带 fatigue 字段（疲劳系统为玩家专属），故此处不引入 cond，避免无意义的恒等 1.0 假对称。
    local tacticsBonus = 1
        - (counter and counter.pct or 0) / 100
        - (synergy and synergy.total or 0) / 100
    return math.floor(total * tacticsBonus * staffBonusOf(agent) + 0.5)
end

return AISystem