-- MultiRegionSystem：多地区并行经营（招牌扩张）
-- 达到「职业俱乐部」评级后，可在西冠/南冠开设分部，多个联赛每周并行出赛，
-- 共享财务与声望；区域冠军计入公司荣誉。档位=每周成本/战力/奖金的三向博弈。
local CompanyState = require("CompanyState")
local LeagueCatalog = require("LeagueCatalog")
local TierSystem = require("TierSystem")

local MultiRegionSystem = {}

-- 投入档位：周成本 / 战力加成 / 胜负奖金（万元）
MultiRegionSystem.TIERS = {
    basic = { id = "basic", label = "基础投入", weeklyCost = 35, powerBonus = 0, winPrize = 60, losePrize = 18 },
    standard = { id = "standard", label = "标准投入", weeklyCost = 70, powerBonus = 6, winPrize = 80, losePrize = 22 },
    focus = { id = "focus", label = "重点投入", weeklyCost = 110, powerBonus = 13, winPrize = 100, losePrize = 28 },
}

-- 区域配置：开设费（万）/ 基础战力（与区域 AI 同量级）/ 粉丝声望反馈
MultiRegionSystem.REGIONS = {
    west = { id = "west", name = "西冠联赛", openCost = 1200, basePower = 58, fansWin = 800, fansLose = 200, repWin = 2, repLose = 0 },
    south = { id = "south", name = "南冠联赛", openCost = 1000, basePower = 56, fansWin = 700, fansLose = 180, repWin = 2, repLose = 0 },
}

local AI_TEAM_SCALE = 6.0
local AI_SEASON_GROWTH = 0.12
local REQUIRED_TIER_INDEX = 3 -- 职业俱乐部

local function clamp(value, minimum, maximum)
    return math.max(minimum, math.min(maximum, tonumber(value) or minimum))
end

function MultiRegionSystem.BranchTeamId(regionId)
    return "legacy_" .. regionId
end

--- 初始化/迁移：state.branches 容器 + 各区域分部壳
function MultiRegionSystem.Ensure(state)
    state = CompanyState.Ensure(state)
    state.branches = state.branches or {}
    state.branches.champions = state.branches.champions or {}
    for regionId, cfg in pairs(MultiRegionSystem.REGIONS) do
        local b = state.branches[regionId]
        if type(b) ~= "table" then
            b = { regionId = regionId, opened = false, reserved = false, tier = "basic", invested = 0, wins = 0, losses = 0, score = 0 }
            state.branches[regionId] = b
        end
        b.reserved = b.reserved == true
        b.standings = b.standings or {}
        b.results = b.results or {}
        b.finalRank = tonumber(b.finalRank) or nil
        if b.opened and #b.standings == 0 then
            MultiRegionSystem.BuildStandings(state, regionId)
        end
    end
    return state
end

--- 建立 8 队积分榜（本部分部 + 区域 7 支 AI 队）
function MultiRegionSystem.BuildStandings(state, regionId)
    -- 调用方必须已 Ensure；此处不再递归 Ensure，避免 opened 无榜时的自引用循环
    local b = state.branches[regionId]
    local region = LeagueCatalog.REGIONS[regionId]
    local branchId = MultiRegionSystem.BranchTeamId(regionId)
    b.standings = { { teamId = branchId, teamName = MultiRegionSystem.BranchName(state, regionId), wins = 0, losses = 0, score = 0 } }
    for _, team in ipairs(region.teams) do
        table.insert(b.standings, { teamId = team.id, teamName = team.name, wins = 0, losses = 0, score = 0 })
    end
    return b.standings
end

function MultiRegionSystem.BranchName(state, regionId)
    state = CompanyState.Ensure(state)
    local short = regionId == "west" and "西" or "南"
    return state.company.name .. "（" .. short .. "冠分部）"
end

--- 开设条件：总部东冠 + 评级≥职业 + 常规赛 + 现金
function MultiRegionSystem.CanOpen(state, regionId)
    state = MultiRegionSystem.Ensure(state)
    local cfg = MultiRegionSystem.REGIONS[regionId]
    local b = state.branches[regionId]
    if not cfg or not b then return false, "区域不存在" end
    if b.opened then return false, "已开设" end
    if b.reserved then return false, "已预开设，等待评级达标自动激活" end
    if state.company.league ~= "pro" then return false, "总部需处于东冠联赛" end
    if TierSystem.GetTierIndex(state) < REQUIRED_TIER_INDEX then return false, "需达到「职业俱乐部」评级" end
    if state.company.seasonState ~= "regular" then return false, "需在常规赛期间开设" end
    if tonumber(state.company.cash) < cfg.openCost then
        return false, "现金不足（需 ¥" .. tostring(cfg.openCost) .. "万）"
    end
    return true
end

--- 开设分部：扣款、建榜、记录
function MultiRegionSystem.Open(state, regionId)
    state = MultiRegionSystem.Ensure(state)
    local ok, reason = MultiRegionSystem.CanOpen(state, regionId)
    if not ok then return false, reason end
    local cfg = MultiRegionSystem.REGIONS[regionId]
    local b = state.branches[regionId]
    state.company.cash = tonumber(state.company.cash) - cfg.openCost
    b.opened = true
    b.openedWeek = tonumber(state.company.week) or 1
    b.tier = "basic"
    b.invested = 0
    b.wins = 0
    b.losses = 0
    b.score = 0
    b.finalRank = nil
    MultiRegionSystem.BuildStandings(state, regionId)
    CompanyState.RecordTimeline(state, " 开设分部",
        state.company.name .. " 斥资 ¥" .. tostring(cfg.openCost) .. "万 开设" .. cfg.name .. "分部，双线作战！")
    return true
end

--- 开设资格清单（UI 勾选展示）：保持评级稀缺，玩家可清楚看到还差什么
function MultiRegionSystem.GetPrereqs(state, regionId)
    state = MultiRegionSystem.Ensure(state)
    local cfg = MultiRegionSystem.REGIONS[regionId]
    local b = state.branches[regionId]
    if not cfg or not b then return {} end
    local tierIdx = tonumber(TierSystem.GetTierIndex(state)) or 1
    local items = {
        { label = "总部处于东冠联赛", ok = state.company.league == "pro" },
        { label = "评级达「职业俱乐部」（当前第 " .. tostring(tierIdx) .. " 级，需 ≥" .. tostring(REQUIRED_TIER_INDEX) .. "）", ok = tierIdx >= REQUIRED_TIER_INDEX },
        { label = "处于常规赛阶段", ok = state.company.seasonState == "regular" },
        { label = "现金 ≥ ¥" .. tostring(cfg.openCost) .. "万（当前 ¥" .. tostring(tonumber(state.company.cash) or 0) .. "万）", ok = tonumber(state.company.cash) >= cfg.openCost },
    }
    return items
end

--- 预开设资格：仅当尚未开设/未预开设、总部东冠、现金充足（不要求评级，评级达标自动激活）
function MultiRegionSystem.CanReserve(state, regionId)
    state = MultiRegionSystem.Ensure(state)
    local cfg = MultiRegionSystem.REGIONS[regionId]
    local b = state.branches[regionId]
    if not cfg or not b then return false, "区域不存在" end
    if b.opened then return false, "已开设" end
    if b.reserved then return false, "已预开设，等待激活" end
    if state.company.league ~= "pro" then return false, "总部需处于东冠联赛" end
    if tonumber(state.company.cash) < cfg.openCost then
        return false, "现金不足（需 ¥" .. tostring(cfg.openCost) .. "万）"
    end
    return true
end

--- 预开设：先扣开设费锁定名额，评级达标后由 ProcessWeek 自动激活
function MultiRegionSystem.ReserveOpen(state, regionId)
    state = MultiRegionSystem.Ensure(state)
    local ok, reason = MultiRegionSystem.CanReserve(state, regionId)
    if not ok then return false, reason end
    local cfg = MultiRegionSystem.REGIONS[regionId]
    local b = state.branches[regionId]
    state.company.cash = tonumber(state.company.cash) - cfg.openCost
    b.reserved = true
    b.reservedWeek = tonumber(state.company.week) or 1
    CompanyState.RecordTimeline(state, "预开设分部",
        state.company.name .. " 斥资 ¥" .. tostring(cfg.openCost) .. "万 预开设" .. cfg.name .. "分部，待评级达标自动激活。")
    return true
end

--- 评级达标后自动激活预开设分部（ProcessWeek 调用）
function MultiRegionSystem.ActivateReserved(state)
    state = MultiRegionSystem.Ensure(state)
    local activated = {}
    local tierIdx = tonumber(TierSystem.GetTierIndex(state)) or 1
    for regionId, cfg in pairs(MultiRegionSystem.REGIONS) do
        local b = state.branches[regionId]
        if b and b.reserved and tierIdx >= REQUIRED_TIER_INDEX then
            b.opened = true
            b.openedWeek = tonumber(state.company.week) or 1
            b.reserved = false
            b.tier = "basic"
            b.invested = 0
            b.wins = 0
            b.losses = 0
            b.score = 0
            b.finalRank = nil
            MultiRegionSystem.BuildStandings(state, regionId)
            table.insert(activated, regionId)
            CompanyState.RecordTimeline(state, " 分部激活",
                state.company.name .. " 评级达标，" .. cfg.name .. "分部落成，双线作战开启！")
        end
    end
    return activated
end

--- 切换投入档位（下周结算生效）
function MultiRegionSystem.SetTier(state, regionId, tier)
    state = MultiRegionSystem.Ensure(state)
    local b = state.branches[regionId]
    if not b or not b.opened then return false, "分部未开设" end
    if not MultiRegionSystem.TIERS[tier] then return false, "无效档位" end
    b.tier = tier
    return true
end

--- 分部战力：基础 + 档位加成，与区域 AI 同量级/同成长/同难度
function MultiRegionSystem.GetBranchPower(state, regionId)
    state = MultiRegionSystem.Ensure(state)
    local cfg = MultiRegionSystem.REGIONS[regionId]
    local b = state.branches[regionId]
    if not cfg or not b then return 0 end
    local tier = MultiRegionSystem.TIERS[b.tier or "basic"]
    local difficulty = CompanyState.GetDifficulty(state)
    local seasons = tonumber(state.company and state.company.seasons) or 0
    local growth = 1 + seasons * AI_SEASON_GROWTH
    local noise = 0.95 + math.random() * 0.1
    return math.floor((cfg.basePower + tier.powerBonus) * AI_TEAM_SCALE * growth * noise * difficulty.aiPower + 0.5)
end

--- 积分榜（按胜场/小分/队名排序）
function MultiRegionSystem.GetStandings(state, regionId)
    state = MultiRegionSystem.Ensure(state)
    local b = state.branches[regionId]
    if not b then return {} end
    local sorted = {}
    for _, entry in ipairs(b.standings) do table.insert(sorted, entry) end
    table.sort(sorted, function(a, c)
        if a.wins ~= c.wins then return a.wins > c.wins end
        if a.score ~= c.score then return a.score > c.score end
        return a.teamName < c.teamName
    end)
    return sorted
end

function MultiRegionSystem.GetRank(state, regionId)
    state = MultiRegionSystem.Ensure(state)
    local branchId = MultiRegionSystem.BranchTeamId(regionId)
    local sorted = MultiRegionSystem.GetStandings(state, regionId)
    for index, entry in ipairs(sorted) do
        if entry.teamId == branchId then return index end
    end
    return nil
end

--- 本周对手：按周轮转区域 7 支 AI 队（7 周循环一遍）
function MultiRegionSystem.GetNextOpponent(state, regionId)
    state = MultiRegionSystem.Ensure(state)
    local region = LeagueCatalog.REGIONS[regionId]
    local teams = region and region.teams or {}
    if #teams == 0 then return nil end
    local week = tonumber(state.company.week) or 1
    return teams[((week - 1) % #teams) + 1]
end

--- 每周并行结算（挂在 SettleWeek）：每个已开分部打一场 BO3
function MultiRegionSystem.ProcessWeek(state)
    state = MultiRegionSystem.Ensure(state)
    MultiRegionSystem.ActivateReserved(state) -- 评级达标自动激活预开设分部
    local week = tonumber(state.company.week) or 1
    local summary = {}
    local played = 0
    local parts = {}
    for regionId, cfg in pairs(MultiRegionSystem.REGIONS) do
        local b = state.branches[regionId]
        if b and b.opened then
            local opponent = MultiRegionSystem.GetNextOpponent(state, regionId)
            local powerA = MultiRegionSystem.GetBranchPower(state, regionId)
            local powerB = 0
            if opponent then
                local CompetitionSystem = require("CompetitionSystem")
                powerB = CompetitionSystem.GetMastersTeamPower(state, opponent.id)
            end
            local winsA, winsB = 0, 0
            local needed = 2
            while winsA < needed and winsB < needed do
                local rollA = powerA * (0.85 + math.random() * 0.3)
                local rollB = powerB * (0.85 + math.random() * 0.3)
                if rollA >= rollB then winsA = winsA + 1 else winsB = winsB + 1 end
            end
            local won = winsA > winsB
            local branchId = MultiRegionSystem.BranchTeamId(regionId)
            local entryA, entryB = nil, nil
            for _, entry in ipairs(b.standings) do
                if entry.teamId == branchId then entryA = entry end
                if opponent and entry.teamId == opponent.id then entryB = entry end
            end
            if entryA and entryB then
                if won then
                    entryA.wins = entryA.wins + 1
                    entryB.losses = entryB.losses + 1
                else
                    entryB.wins = entryB.wins + 1
                    entryA.losses = entryA.losses + 1
                end
                entryA.score = entryA.score + winsA
                entryB.score = entryB.score + winsB
            end
            if won then
                b.wins = tonumber(b.wins or 0) + 1
            else
                b.losses = tonumber(b.losses or 0) + 1
            end
            b.score = tonumber(b.score or 0) + winsA
            table.insert(b.results, {
                week = week,
                opponentId = opponent and opponent.id or nil,
                opponentName = opponent and opponent.name or "轮空",
                won = won,
                scoreA = winsA,
                scoreB = winsB,
            })
            -- 财务：奖金 - 周成本
            local tier = MultiRegionSystem.TIERS[b.tier or "basic"]
            local prize = won and tier.winPrize or tier.losePrize
            local net = prize - tier.weeklyCost
            state.company.cash = tonumber(state.company.cash) + net
            b.invested = tonumber(b.invested or 0) + tier.weeklyCost
            -- 粉丝/声望联动
            if won then
                state.company.fans = tonumber(state.company.fans) + cfg.fansWin
                state.company.reputation = clamp(tonumber(state.company.reputation) + cfg.repWin, 0, 100)
            else
                state.company.fans = tonumber(state.company.fans) + cfg.fansLose
                state.company.reputation = clamp(tonumber(state.company.reputation) + cfg.repLose, 0, 100)
            end
            summary[regionId] = {
                won = won,
                opponent = opponent and opponent.name or "轮空",
                scoreA = winsA,
                scoreB = winsB,
                net = net,
            }
            table.insert(parts, cfg.name .. " " .. tostring(winsA) .. ":" .. tostring(winsB) .. (won and " 胜" or " 负"))
            played = played + 1
        end
    end
    if played > 0 then
        CompanyState.RecordTimeline(state, "多地区经营", table.concat(parts, " · "))
    end
    return summary
end

--- 赛季末结算（常规赛结束触发）：冻结排名，区域冠军入荣誉
function MultiRegionSystem.FinishSeason(state)
    state = MultiRegionSystem.Ensure(state)
    local season = tonumber(state.company.seasons or 0) + 1
    for regionId, cfg in pairs(MultiRegionSystem.REGIONS) do
        local b = state.branches[regionId]
        if b and b.opened then
            local rank = MultiRegionSystem.GetRank(state, regionId)
            b.finalRank = rank
            if rank == 1 then
                state.branches.champions = state.branches.champions or {}
                state.branches.champions[regionId] = season
                state.company.reputation = clamp(tonumber(state.company.reputation) + 8, 0, 100)
                state.company.fans = tonumber(state.company.fans) + 20000
                CompanyState.RecordTimeline(state, " 区域冠军",
                    state.company.name .. " 夺得 " .. cfg.name .. " 冠军，多地区经营开花结果！")
            end
        end
    end
    return state
end

--- 新赛季重置：战绩/积分榜/赛果清零，保留档位与累计投入
function MultiRegionSystem.ResetSeason(state)
    state = MultiRegionSystem.Ensure(state)
    for regionId, b in pairs(state.branches) do
        if type(b) == "table" and b.opened then
            b.wins = 0
            b.losses = 0
            b.score = 0
            b.finalRank = nil
            b.results = {}
            for _, entry in ipairs(b.standings) do
                entry.wins = 0
                entry.losses = 0
                entry.score = 0
            end
        end
    end
    return state
end

--- UI 汇总快照
function MultiRegionSystem.GetSummary(state)
    state = MultiRegionSystem.Ensure(state)
    local out = { opened = 0, champions = 0, regions = {} }
    for regionId, cfg in pairs(MultiRegionSystem.REGIONS) do
        local b = state.branches[regionId]
        local region = {
            id = regionId,
            name = cfg.name,
            opened = b.opened == true,
            reserved = b.reserved == true,
            openCost = cfg.openCost,
            tier = b.tier or "basic",
            invested = tonumber(b.invested) or 0,
            wins = tonumber(b.wins) or 0,
            losses = tonumber(b.losses) or 0,
            score = tonumber(b.score) or 0,
            finalRank = b.finalRank,
            rank = nil,
            power = nil,
            lastResult = nil,
            nextOpponent = nil,
        }
        if b.opened then
            out.opened = out.opened + 1
            region.rank = MultiRegionSystem.GetRank(state, regionId)
            region.power = MultiRegionSystem.GetBranchPower(state, regionId)
            region.lastResult = b.results[#b.results]
            local opponent = MultiRegionSystem.GetNextOpponent(state, regionId)
            region.nextOpponent = opponent and opponent.name or nil
        end
        table.insert(out.regions, region)
    end
    for _, _ in pairs(state.branches.champions or {}) do
        out.champions = out.champions + 1
    end
    return out
end

return MultiRegionSystem
