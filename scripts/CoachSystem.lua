-- CoachSystem：教练身份与股权线（M3.3）
-- 新档：空降教练持 1% 干股，老板 NPC 持 99%；周薪 + 胜场奖金；转会/续约/融资/赞助需提案获老板批准；
-- 按估值每周限购老板股份，51% 解锁老板权（可自主拍板），可一路买到 100% 完全控股。
-- 老档（已有经营进度）迁移为「老板兼教练」，全权自主，玩法不退化。
local CoachSystem = {}
local CompanyState = require("CompanyState")

local OWNER_THRESHOLD = 51
local TRUST_INITIAL = 50
local TRUST_WIN = 2
local TRUST_LOSS = -1
local TRUST_APPROVED = 2
local TRUST_REJECTED = -2
local TRUST_BUY_SHARES = -3
local WIN_BONUS = 5
local SALARY_BY_DIFFICULTY = { easy = 18, standard = 12, hard = 8 }
local WEEKLY_LIMIT_BASE = 2
local WEEKLY_LIMIT_HIGH_TRUST = 3
local HIGH_TRUST = 70
local BOSS_NAMES = { "林国栋", "陈振宇", "赵启铭", "苏维恩", "韩立", "陆志远" }
local BOARD_STRIKE_WARN = 1
local BOARD_STRIKE_DEMOTE = 2
local BOARD_STRIKE_FIRE = 3
local BOARD_TRUST_HIT = 15
local BOARD_STRICT_PENALTY = 0.20
local REDLINE_RANK = 7
local APPROVE_QUOTES = {
    "行，按你的方案来。",
    "我看好这个决定。",
    "放手去做，别让我失望。",
    "预算给你，赢回来。",
}
local REJECT_REASONS = {
    "预算不够，省着点花。",
    "等你拿出成绩再来谈。",
    "俱乐部有更优先的投入方向。",
    "这事再缓缓，别急于一时。",
    "董事会不看好这笔投入。",
}

local function clamp(value, minimum, maximum)
    return math.max(minimum, math.min(maximum, tonumber(value) or minimum))
end

function CoachSystem.Ensure(state)
    local CompanyState = require("CompanyState")
    state = CompanyState.Ensure(state)
    if state.coach == nil then
        local isOld = (tonumber(state.company.seasons) or 0) > 0 or (tonumber(state.company.week) or 1) > 1
        if isOld then
            state.coach = {
                mode = "owner",
                owned = tonumber(state.shares.founder) or 100,
                founderPct = 0,
                bossName = "董事会",
                trust = 100,
                salary = 0,
                winBonus = 0,
                proposals = {},
                boughtThisWeek = 0,
                approvedCount = 0,
                rejectedCount = 0,
                salaryEarned = 0,
                totalEarned = 0,
            }
        else
            local difficulty = state.company.difficulty or "standard"
            state.coach = {
                mode = "coach",
                owned = 1,
                founderPct = 99,
                bossName = BOSS_NAMES[math.random(#BOSS_NAMES)],
                trust = TRUST_INITIAL,
                salary = SALARY_BY_DIFFICULTY[difficulty] or 12,
                winBonus = WIN_BONUS,
                proposals = {},
                boughtThisWeek = 0,
                approvedCount = 0,
                rejectedCount = 0,
                salaryEarned = 0,
                totalEarned = 0,
            }
        end
    end
    local coach = state.coach
    coach.mode = coach.mode == "owner" and "owner" or "coach"
    coach.owned = tonumber(coach.owned) or (coach.mode == "owner" and (tonumber(state.shares.founder) or 100) or 1)
    coach.founderPct = tonumber(coach.founderPct) or 0
    coach.bossName = coach.bossName or (coach.mode == "owner" and "董事会" or BOSS_NAMES[math.random(#BOSS_NAMES)])
    coach.trust = clamp(tonumber(coach.trust) or (coach.mode == "owner" and 100 or TRUST_INITIAL), 0, 100)
    local difficulty = state.company.difficulty or "standard"
    coach.salary = tonumber(coach.salary) or (coach.mode == "owner" and 0 or (SALARY_BY_DIFFICULTY[difficulty] or 12))
    coach.winBonus = tonumber(coach.winBonus) or (coach.mode == "owner" and 0 or WIN_BONUS)
    coach.proposals = coach.proposals or {}
    coach.boughtThisWeek = tonumber(coach.boughtThisWeek) or 0
    coach.boardStrikes = tonumber(coach.boardStrikes) or 0
    coach.boardStatus = coach.boardStatus or (coach.mode == "owner" and "owner" or "clean")
    coach.approvedCount = tonumber(coach.approvedCount) or 0
    coach.rejectedCount = tonumber(coach.rejectedCount) or 0
    coach.salaryEarned = tonumber(coach.salaryEarned) or 0
    coach.totalEarned = tonumber(coach.totalEarned) or 0
    return state
end

-- 新档初始化（CompanyState.NewGame 调用）
function CoachSystem.NewCoach(state)
    local difficulty = state.company and state.company.difficulty or "standard"
    state.coach = {
        mode = "coach",
        owned = 1,
        founderPct = 99,
        bossName = BOSS_NAMES[math.random(#BOSS_NAMES)],
        trust = TRUST_INITIAL,
        salary = SALARY_BY_DIFFICULTY[difficulty] or 12,
        winBonus = WIN_BONUS,
        proposals = {},
        boughtThisWeek = 0,
        approvedCount = 0,
        rejectedCount = 0,
        salaryEarned = 0,
        totalEarned = 0,
    }
    return CoachSystem.Ensure(state)
end

-- 教练期（未达 51%）需要提案才能做大动作
function CoachSystem.NeedsApproval(state)
    state = CoachSystem.Ensure(state)
    return state.coach.mode == "coach" and state.coach.owned < OWNER_THRESHOLD and state.coach.boardStatus ~= "fired"
end

-- 是否拥有拍板权（老板兼教练 或 持股 ≥51%）
function CoachSystem.CanActAsOwner(state)
    state = CoachSystem.Ensure(state)
    return state.coach.mode == "owner" or state.coach.owned >= OWNER_THRESHOLD
end

function CoachSystem.GetWeeklyLimit(state)
    state = CoachSystem.Ensure(state)
    if state.coach.trust >= HIGH_TRUST then return WEEKLY_LIMIT_HIGH_TRUST end
    return WEEKLY_LIMIT_BASE
end

-- 1% 股份的当前价格（按公司估值）
function CoachSystem.GetSharePrice(state)
    state = CoachSystem.Ensure(state)
    local FinanceSystem = require("FinanceSystem")
    return math.max(0, math.floor(FinanceSystem.GetValuation(state) * 0.01))
end

-- 买股：按估值从老板手里购入 1% 股份，每周限购
function CoachSystem.BuyShares(state)
    state = CoachSystem.Ensure(state)
    local coach = state.coach
    if coach.mode ~= "coach" then return false, "你已是老板，无需购买股份" end
    local limit = CoachSystem.GetWeeklyLimit(state)
    if (coach.boughtThisWeek or 0) >= limit then
        return false, "本周已购 " .. tostring(coach.boughtThisWeek) .. "%（限 " .. tostring(limit) .. "%），下周再来"
    end
    if (coach.founderPct or 0) <= 0 then return false, "老板已无可出售股份" end
    local price = CoachSystem.GetSharePrice(state)
    if price <= 0 then return false, "公司估值过低，暂无法定价" end
    if state.company.cash < price then
        return false, "现金不足（¥" .. tostring(price) .. "万），买不起 1% 股份"
    end
    state.company.cash = state.company.cash - price
    coach.owned = (coach.owned or 1) + 1
    coach.founderPct = math.max(0, (coach.founderPct or 99) - 1)
    coach.boughtThisWeek = (coach.boughtThisWeek or 0) + 1
    coach.trust = clamp(coach.trust - TRUST_BUY_SHARES, 0, 100)
    local FinanceSystem = require("FinanceSystem")
    state.finance.valuation = FinanceSystem.GetValuation(state)
    CompanyState.RecordTimeline(state, "购入股份",
        "以 ¥" .. tostring(price) .. "万 从老板手中购入 1% 股份，个人持股升至 " .. tostring(coach.owned) .. "%（老板 " .. tostring(coach.founderPct) .. "%）。")
    local unlocked = coach.owned >= OWNER_THRESHOLD
    if unlocked then
        CompanyState.RecordTimeline(state, "股权解锁",
            "个人持股达到 51%，成为控股股东！老板退居二线，转会 / 融资 / 赞助决策权全部归你。")
    end
    return true, { price = price, owned = coach.owned, unlocked = unlocked }
end

-- 提案批准概率：信任度 + 预算合理性 + 战绩背书；大额提案常被否
function CoachSystem.GetApprovalChance(state, amount)
    state = CoachSystem.Ensure(state)
    local chance = 0.35 + (state.coach.trust or 50) * 0.004
    local cash = tonumber(state.company.cash) or 0
    amount = tonumber(amount) or 0
    if amount <= 0 then
        chance = chance + 0.10
    elseif amount <= cash * 0.5 then
        chance = chance + 0.12
    elseif amount <= cash then
        chance = chance + 0.06
    elseif amount > cash * 2.5 then
        chance = chance - 0.30
    elseif amount > cash * 1.5 then
        chance = chance - 0.20
    else
        chance = chance - 0.10
    end
    local FinanceSystem = require("FinanceSystem")
    local rank = FinanceSystem.GetRank(state)
    if rank and rank <= 3 then chance = chance + 0.08 end
    -- M3.4 严格董事会：有警告/降薪记录时，大额提案更常被否
    local strikes = tonumber(state.coach.boardStrikes) or 0
    if strikes >= 1 and amount > cash * 0.8 then chance = chance - BOARD_STRICT_PENALTY end
    return math.max(0.08, math.min(0.92, chance))
end

local EXECUTORS = {
    sign = function(state, payload)
        local MarketSystem = require("MarketSystem")
        if payload.exec == "bench" then
            return MarketSystem.SignToBench(state, payload.playerId, payload.mode or "asking")
        end
        return MarketSystem.SignPlayer(state, payload.playerId, payload.mode or "asking")
    end,
    negotiation = function(state, payload)
        local NegotiationSystem = require("NegotiationSystem")
        return NegotiationSystem.Conclude(state, payload.negId, true)
    end,
    war = function(state, payload)
        local MarketSystem = require("MarketSystem")
        return MarketSystem.AcceptWarOffer(state, payload.playerId)
    end,
    loan = function(state, payload)
        local MarketSystem = require("MarketSystem")
        return MarketSystem.LoanInPlayer(state, payload.role)
    end,
    renew = function(state, payload)
        local RosterSystem = require("RosterSystem")
        return RosterSystem.RenewContract(state, payload.playerId)
    end,
    sponsor = function(state, payload)
        local SponsorSystem = require("SponsorSystem")
        return SponsorSystem.SignSponsor(state, payload.offerId)
    end,
    financing = function(state, payload)
        local ShareSystem = require("ShareSystem")
        return ShareSystem.RaiseRound(state)
    end,
}

-- 提交提案：老板立即批复（信任度 + 预算 + 合理性），批准后自动执行对应动作
-- payload: { kind, playerId?, role?, offerId?, mode?, exec?, amount?, title?, detail? }
function CoachSystem.SubmitProposal(state, payload)
    state = CoachSystem.Ensure(state)
    payload = payload or {}
    local coach = state.coach
    if coach.mode ~= "coach" then return false, "老板兼教练，无需提案" end
    if CoachSystem.CanActAsOwner(state) then
        return false, "已持有 " .. tostring(OWNER_THRESHOLD) .. "% 以上股份，可直接拍板"
    end
    local kind = payload.kind
    local executor = EXECUTORS[kind]
    if not executor then return false, "未知提案类型" end
    local amount = tonumber(payload.amount) or 0
    local chance = CoachSystem.GetApprovalChance(state, amount)
    local trustBefore = coach.trust
    local approved = math.random() < chance
    local record = {
        kind = kind,
        title = payload.title or "运营提案",
        detail = payload.detail or "",
        amount = amount,
        week = tonumber(state.company.week) or 1,
        result = approved and "approved" or "rejected",
        message = "",
    }
    if approved then
        local ok, result = executor(state, payload)
        if ok then
            coach.approvedCount = (coach.approvedCount or 0) + 1
            coach.trust = clamp(coach.trust + TRUST_APPROVED, 0, 100)
            local quote = APPROVE_QUOTES[math.random(#APPROVE_QUOTES)]
            record.message = quote
            record.amount = tonumber(payload.amount) or 0
            CompanyState.RecordTimeline(state, "老板批准",
                "老板「" .. tostring(coach.bossName) .. "」批准提案：「" .. record.title .. "」" .. quote)
        else
            record.result = "failed"
            record.message = tostring(result or "执行失败")
            coach.trust = clamp(coach.trust + TRUST_REJECTED, 0, 100)
            CompanyState.RecordTimeline(state, "提案执行失败",
                "老板虽批准「" .. record.title .. "」，但执行受阻：" .. record.message)
        end
    else
        coach.rejectedCount = (coach.rejectedCount or 0) + 1
        coach.trust = clamp(coach.trust + TRUST_REJECTED, 0, 100)
        local reason
        local cash = tonumber(state.company.cash) or 0
        if trustBefore < 40 then
            reason = REJECT_REASONS[2]
        elseif amount > cash * 1.5 then
            reason = REJECT_REASONS[1]
        else
            reason = REJECT_REASONS[math.random(3, #REJECT_REASONS)]
        end
        record.message = reason
        CompanyState.RecordTimeline(state, "老板否决",
            "老板「" .. tostring(coach.bossName) .. "」否决提案：「" .. record.title .. "」" .. reason)
    end
    table.insert(coach.proposals, 1, record)
    while #coach.proposals > 8 do table.remove(coach.proposals) end
    return true, { approved = record.result == "approved", record = record }
end

-- 周结算：重置买股额度；教练期发周薪 + 胜场奖金，并更新信任度
function CoachSystem.ApplySalary(state, legacyWon)
    state = CoachSystem.Ensure(state)
    local coach = state.coach
    coach.boughtThisWeek = 0
    if coach.mode ~= "coach" then return state end
    local win = legacyWon == true
    local pay = (coach.salary or 0) + (win and (coach.winBonus or 0) or 0)
    if pay > 0 then
        state.company.cash = (state.company.cash or 0) + pay
        coach.salaryEarned = (coach.salaryEarned or 0) + (coach.salary or 0)
        coach.totalEarned = (coach.totalEarned or 0) + pay
        if win then
            coach.trust = clamp(coach.trust + TRUST_WIN, 0, 100)
        else
            coach.trust = clamp(coach.trust + TRUST_LOSS, 0, 100)
        end
        local suffix = win and (" + 胜场奖金 ¥" .. tostring(coach.winBonus) .. "万") or ""
        CompanyState.RecordTimeline(state, "教练薪资",
            "周薪 ¥" .. tostring(coach.salary) .. "万" .. suffix .. " 到账，个人累计收入 ¥" .. tostring(coach.totalEarned) .. "万。")
    end
    return state
end

-- 赛季切换：重置买股额度
function CoachSystem.ResetSeason(state)
    state = CoachSystem.Ensure(state)
    state.coach.boughtThisWeek = 0
    return state
end

-- 身份卡数据（供 UI 展示）
function CoachSystem.GetIdentity(state)
    state = CoachSystem.Ensure(state)
    local coach = state.coach
    local support, supportRisk, supportParts = CoachSystem.GetBoardSupport(state)
    return {
        mode = coach.mode,
        bossName = coach.bossName,
        owned = coach.owned,
        founderPct = coach.founderPct,
        trust = coach.trust,
        salary = coach.salary,
        winBonus = coach.winBonus,
        weeklyLimit = CoachSystem.GetWeeklyLimit(state),
        boughtThisWeek = coach.boughtThisWeek,
        sharePrice = CoachSystem.GetSharePrice(state),
        needsApproval = CoachSystem.NeedsApproval(state),
        canActAsOwner = CoachSystem.CanActAsOwner(state),
        unlocked = coach.owned >= OWNER_THRESHOLD,
        threshold = OWNER_THRESHOLD,
        approvedCount = coach.approvedCount,
        rejectedCount = coach.rejectedCount,
        totalEarned = coach.totalEarned,
        proposals = coach.proposals,
        boardStrikes = coach.boardStrikes,
        boardStatus = coach.boardStatus,
        boardActive = CoachSystem.IsBoardActive(state),
        boardLabel = CoachSystem.GetBoardLabel(state),
        support = support,
        supportRisk = supportRisk,
        supportParts = supportParts,
    }
end

function CoachSystem.GetRoleText(state)
    state = CoachSystem.Ensure(state)
    if state.coach.mode == "owner" then return "老板兼教练" end
    if state.coach.owned >= OWNER_THRESHOLD then return "控股教练" end
    return "主教练（打工中）"
end

-- ============ M3.4 严格董事会 + 解雇结局 ============

-- 董事会是否对玩家有约束力（教练期且未控股）
function CoachSystem.IsBoardActive(state)
    state = CoachSystem.Ensure(state)
    return state.coach.mode == "coach" and state.coach.owned < OWNER_THRESHOLD and state.coach.boardStatus ~= "fired"
end

-- 董事会状态文案
function CoachSystem.GetBoardLabel(state)
    state = CoachSystem.Ensure(state)
    local coach = state.coach
    if coach.boardStatus == "fired" then return "已解雇" end
    if coach.boardStatus == "demoted" then return "降薪观察期" end
    if coach.boardStatus == "warned" then return "警告中" end
    if coach.mode == "owner" then return "你即是董事会" end
    return "正常"
end

-- 战绩红线：常规/次级联赛排名跌出前六（8 队制降级区）
function CoachSystem.CheckRankRedline(state)
    state = CoachSystem.Ensure(state)
    local GoalSystem = require("GoalSystem")
    local league = state.company.league
    if league == "qualifier" then return false end -- 预选赛走淘汰结局，不进赛季结算
    local rank = GoalSystem.GetCurrentRank(state)
    return rank >= REDLINE_RANK
end

-- 估值红线：赛季末估值较季初缩水超过 10%
function CoachSystem.CheckValuationRedline(state)
    state = CoachSystem.Ensure(state)
    local FinanceSystem = require("FinanceSystem")
    local baseline = state.goals and state.goals.baseline and state.goals.baseline.valuation
    if not baseline or baseline <= 0 then return false end
    local now = FinanceSystem.GetValuation(state)
    return now < baseline * 0.9
end

-- 赛季末董事会评估：目标 verdict（all/half/none）+ 战绩/估值红线
-- 不达标链：警告 → 降薪 → 解雇（硬结局）
function CoachSystem.EvaluateBoard(state, verdict)
    state = CoachSystem.Ensure(state)
    local coach = state.coach
    if not CoachSystem.IsBoardActive(state) then return state end
    if state.company.seasonState == "fired" then return state end
    local breached = verdict == "none"
        or CoachSystem.CheckRankRedline(state)
        or CoachSystem.CheckValuationRedline(state)
    if breached then
        coach.boardStrikes = (coach.boardStrikes or 0) + 1
        if coach.boardStrikes >= BOARD_STRIKE_FIRE then
            return CoachSystem.FireCoach(state)
        end
        coach.trust = clamp(coach.trust - BOARD_TRUST_HIT, 0, 100)
        if coach.boardStrikes >= BOARD_STRIKE_DEMOTE then
            coach.boardStatus = "demoted"
            coach.salary = math.max(1, math.floor((coach.salary or 0) / 2))
            CompanyState.RecordTimeline(state, "董事会降薪",
                "连续赛季未达 KPI，董事会将你的周薪降至 ¥" .. tostring(coach.salary) .. "万，若下赛季再无起色将被解雇。")
        else
            coach.boardStatus = "warned"
            CompanyState.RecordTimeline(state, "董事会警告",
                "赛季目标未达标或跌破红线，董事会正式警告。连续不达标将降薪直至解雇。")
        end
    elseif verdict == "all" then
        coach.boardStrikes = 0
        coach.boardStatus = "clean"
        coach.trust = clamp(coach.trust + 10, 0, 100)
        CompanyState.RecordTimeline(state, "董事会认可",
            "赛季目标全部达成，董事会解除此前的全部警告。")
    else
        coach.boardStrikes = math.max(0, (coach.boardStrikes or 0) - 1)
        if coach.boardStrikes <= 0 then coach.boardStatus = "clean" end
        CompanyState.RecordTimeline(state, "董事会缓评",
            "赛季目标部分达成，董事会暂缓追责。")
    end
    return state
end

-- 解雇：硬结局，进结局图鉴
-- P0-1 董事会支持度仪表：信任/战绩/球迷/声望/耐心 加权 → 0-100 + 解雇风险
function CoachSystem.GetBoardSupport(state)
    state = CoachSystem.Ensure(state)
    local coach = state.coach
    local parts = { trust = 100, rank = 100, fans = 100, rep = 100, patience = 100 }
    if coach.mode == "owner" then return 100, "你即是董事会", parts end
    if coach.boardStatus == "fired" then
        parts.trust, parts.rank, parts.fans, parts.rep, parts.patience = 0, 0, 0, 0, 0
        return 0, "已解雇", parts
    end
    local trust = tonumber(coach.trust) or 50
    local rep = tonumber(state.company.reputation) or 50
    local fans = tonumber(state.company.fans) or 0
    local baseline = state.goals and state.goals.baseline and state.goals.baseline.fans
    local fansScore
    if baseline and baseline > 0 then
        local ratio = fans / baseline
        fansScore = ratio >= 1.1 and 100 or (ratio >= 1.0 and 75 or (ratio >= 0.9 and 55 or 30))
    else
        fansScore = 60
    end
    local GoalSystem = require("GoalSystem")
    local standings = state.company.league == "academy" and (state.roster.academy.standings or {}) or (state.league.standings or {})
    local rankScore = 60
    if #standings > 0 then
        local rank = GoalSystem.GetCurrentRank(state)
        if rank <= 2 then rankScore = 100
        elseif rank <= 4 then rankScore = 80
        elseif rank <= 6 then rankScore = 60
        else rankScore = 35 end
    end
    local strikes = tonumber(coach.boardStrikes) or 0
    local patienceScore = strikes <= 0 and 100 or (strikes == 1 and 75 or (strikes == 2 and 40 or 0))
    local support = math.floor(trust * 0.35 + rankScore * 0.25 + fansScore * 0.15 + rep * 0.15 + patienceScore * 0.10 + 0.5)
    support = clamp(support, 0, 100)
    local risk
    if support >= 75 then risk = "低"
    elseif support >= 55 then risk = "中"
    else risk = "高" end
    if coach.boardStatus == "demoted" then risk = "高" end
    parts.trust = math.floor(trust + 0.5)
    parts.rank = rankScore
    parts.fans = fansScore
    parts.rep = rep
    parts.patience = patienceScore
    return support, risk, parts
end

function CoachSystem.FireCoach(state)
    state = CoachSystem.Ensure(state)
    local coach = state.coach
    coach.boardStrikes = BOARD_STRIKE_FIRE
    coach.boardStatus = "fired"
    state.company.seasonState = "fired"
    local ProfileSystem = require("ProfileSystem")
    ProfileSystem.MarkFired(state)
    CompanyState.RecordTimeline(state, "被董事会解雇",
        "连续未达 KPI，董事会解除你的主教练职务，你的电竞王朝之旅在此终结。")
    return state
end

return CoachSystem
