-- MatchSimulator：多阶段对局模拟引擎
-- 把一场 BO3/BO5 从「单掷比大小」升级为 4 阶段事件模拟：
--   开局 → 对线期 → 资源团 → 收官
-- 每阶段独立掷骰，带 momentum（连胜加成）、翻盘熵（落后方收官 buff）、
-- 以及教练局内关键决策（暂停式决策点，状态可序列化、可跨存档恢复）。
-- 设计参考：《英雄联盟电竞经理》BP/战术博弈、《SC 电竞经理》回合级叙事、
-- 《Esports Manager 2026》暂停调整、Gameflow 论文「后期边际优势更大、落后方必须有翻盘可能」。

local LeagueCatalog = require("LeagueCatalog")
local CompanyState = require("CompanyState")

local MatchSimulator = {}

local SignatureSystem = require("SignatureSystem")

-- 6 回合事件卡（参考 LOL 电竞经理）
local ROUNDS = {
    { id = "round1", label = "一级团", desc = "开局 1 分钟，争夺河道视野" },
    { id = "round2", label = "对线期", desc = "前 10 分钟，线上发育与 Gank" },
    { id = "round3", label = "小龙争夺", desc = "中期第一条小龙，节奏分水岭" },
    { id = "round4", label = "先锋团战", desc = "峡谷先锋，推塔节奏" },
    { id = "round5", label = "大龙决策", desc = "后期大龙，胜负手" },
    { id = "round6", label = "决战推塔", desc = "最终团战，推平基地" },
}

-- 每回合事件卡选项（4 选 1）
-- style：aggro=进攻型 / def=防守型，用于 BP#146 与 BP 阵容/战术契合的联动加成
local ROUND_OPTIONS = {
    round1 = {
        { id = "invade", label = " 入侵野区", desc = "高风险：抢对面 BUFF，成功 +8% 失败 -5%", power = 0.08, variance = 0.10, style = "aggro" },
        { id = "defend", label = " 防守野区", desc = "稳健：保护己方野区，+3% 战力", power = 0.03, variance = 0.03, style = "def" },
        { id = "normal", label = " 正常上线", desc = "标准开局，无加成", power = 0.00, variance = 0.05, style = "neutral" },
        { id = "swap", label = " 换线布局", desc = "双人路换线，打乱对手节奏 +5%", power = 0.05, variance = 0.06, style = "aggro" },
    },
    round2 = {
        { id = "gank_top", label = "⬆ Gank 上路", desc = "打野抓上，成功 +6%", power = 0.06, variance = 0.07, style = "aggro" },
        { id = "gank_mid", label = "⬆ Gank 中路", desc = "中野联动，成功 +7%", power = 0.07, variance = 0.07, style = "aggro" },
        { id = "gank_bot", label = "⬇ Gank 下路", desc = "双人路抓人，成功 +6%", power = 0.06, variance = 0.07, style = "aggro" },
        { id = "counter", label = " 反蹲", desc = "预判对手 Gank，反打 +8%", power = 0.08, variance = 0.08, style = "def" },
    },
    round3 = {
        { id = "take_dragon", label = " 抢小龙", desc = "主动开龙，成功 +10%", power = 0.10, variance = 0.08, style = "aggro" },
        { id = "give_dragon", label = " 放小龙", desc = "换资源，偷对面塔 +5%", power = 0.05, variance = 0.04, style = "def" },
        { id = "contest", label = " 龙坑团", desc = "正面团战抢龙，高波动 ±12%", power = 0.00, variance = 0.12, style = "aggro" },
        { id = "split_push", label = " 分带换资源", desc = "边路施压，+6%", power = 0.06, variance = 0.05, style = "aggro" },
    },
    round4 = {
        { id = "take_herald", label = " 打先锋", desc = "峡谷先锋推塔，+8%", power = 0.08, variance = 0.06, style = "aggro" },
        { id = "give_herald", label = " 放先锋", desc = "换资源，偷大龙 +5%", power = 0.05, variance = 0.05, style = "def" },
        { id = "teamfight", label = " 先锋团", desc = "正面团战，±10%", power = 0.00, variance = 0.10, style = "aggro" },
        { id = "rotate", label = " 换线运营", desc = "四人转线，+4%", power = 0.04, variance = 0.04, style = "def" },
    },
    round5 = {
        { id = "take_baron", label = " 打大龙", desc = "大龙 Buff 推平，+12%", power = 0.12, variance = 0.10, style = "aggro" },
        { id = "defend_baron", label = " 防守大龙", desc = "阻止对手打龙，+6%", power = 0.06, variance = 0.06, style = "def" },
        { id = "split_push", label = " 分带偷塔", desc = "41 分推，+8%", power = 0.08, variance = 0.08, style = "aggro" },
        { id = "teamfight", label = " 大龙团", desc = "正面团战，±15%", power = 0.00, variance = 0.15, style = "aggro" },
    },
    round6 = {
        { id = "teamfight", label = " 决战团", desc = "正面团战，±10%", power = 0.00, variance = 0.10, style = "aggro" },
        { id = "split_push", label = " 分带偷家", desc = "边路偷基地，+10%", power = 0.10, variance = 0.12, style = "aggro" },
        { id = "defend", label = " 防守反击", desc = "守住一波，拖到加时 +5%", power = 0.05, variance = 0.08, style = "def" },
        { id = "allin", label = " 全力一波", desc = "高风险高回报，±15%", power = 0.00, variance = 0.15, style = "aggro" },
    },
}

-- 局内决策（作用于我方剩余阶段）
local DECISIONS = {
    teamfight = {
        id = "teamfight",
        label = " 逼团夺资源",
        desc = "高风险高回报：剩余阶段战力 +6%，但波动变大，被反打容易崩",
        power = 0.06,
        variance = 0.07,
    },
    split = {
        id = "split",
        label = " 分带运营",
        desc = "稳定推进：战力 +3%，波动降低，把优势滚成胜势",
        power = 0.03,
        variance = -0.05,
    },
    composure = {
        id = "composure",
        label = " 稳住心态",
        desc = "打断对手气势：清空对方连胜加成，己方波动降低",
        power = 0.00,
        variance = -0.04,
        clearOpponent = true,
    },
    -- 新增：战术调整（BO3/BO5 局间）
    switch_tactic = {
        id = "switch_tactic",
        label = " 换战术",
        desc = "临时切换战术：激进→防守 或 防守→激进，适应对手打法",
        power = 0.04,
        variance = 0.02,
        switchTactic = true,
    },
    -- 新增：暂停调整（赛点局）
    timeout = {
        id = "timeout",
        label = " 叫暂停",
        desc = "消耗 1 次暂停机会（每场 1 次），全队士气 +10，下局战力 +3%",
        power = 0.03,
        variance = -0.03,
        timeout = true,
    },
    -- 新增：换人奇兵（需有替补，每场 1 次）
    substitute = {
        id = "substitute",
        label = " 换人奇兵",
        desc = "派上替补奇兵：下局战力 +6%，但磨合风险波动 +2%（每场 1 次）",
        power = 0.06,
        variance = 0.02,
        substitute = true,
    },
    -- 新增：针对指令（集火对手 MVP，每场 1 次）
    focus_opp = {
        id = "focus_opp",
        label = " 针对指令",
        desc = "集火对手 MVP：下局对手战力 -5%，但对手波动 +4%（他们调整应对）",
        power = 0,
        variance = 0,
        focusOpp = true,
    },
    -- 玩法扩展 #57：临场指挥新类型（每场各 1 次）
    bounty = {
        id = "bounty",
        label = " 控龙拿资源",
        desc = "放弃正面团，优先拿小龙/先锋资源：经济 +4%，波动 -2%",
        power = 0.04,
        variance = -0.02,
    },
    tempo = {
        id = "tempo",
        label = " 提速节奏",
        desc = "加快转线运营滚雪球：战力 +3%，波动 -3%",
        power = 0.03,
        variance = -0.03,
    },
    star_play = {
        id = "star_play",
        label = " 明星临场",
        desc = "主打明星下局站出来打关键团：下局战力 +5%，并解锁招牌绝技",
        power = 0.05,
        variance = 0.02,
        starCall = true,
    },
}

local EVENTS = {
    early_win = {
        "{w}开局 3 分钟拿下首杀，节奏直接起飞。",
        "{w}入侵野区得手，前期设计完美。",
        "{w}换线布局奏效，双人路开局滚起雪球。",
    },
    early_lose = {
        "{w}开局被反蹲送出一血，气势受挫。",
        "{w}换线被对手识破，前期小亏。",
    },
    lane_win = {
        "{w}对线期完成对位单杀，{r}打穿一路。",
        "{w}中野联动节奏拉满，塔皮吃满。",
        "{w}下路对线压制，补刀全面领先。",
    },
    lane_lose = {
        "{w}对线期被抓崩一路，发育严重受阻。",
        "{w}线上换血失误，双人路被打出缺口。",
    },
    mid_win = {
        "{w}团战打出 0 换 4，顺手收下大龙！",
        "{w}资源团双龙会战，一波拉开 5k 经济。",
        "{w}龙坑团战完美开团，奠定中期优势。",
    },
    mid_lose = {
        "{w}大龙团决策失误，被反打丢龙丢塔。",
        "{w}资源团被抢大龙，中期节奏崩盘。",
    },
    late_win = {
        "{w}绝境翻盘！落后 8k 经济一波团战逆转。",
        "{w}收官团战接管比赛，兵不血刃推平基地。",
        "{w}最后一波绕后开团，打出奇迹团。",
    },
    late_lose = {
        "{w}收官团战被绕后开团，遗憾葬送好局。",
        "{w}高地团战溃败，基地被一波推平。",
    },
}

local RANDOM_ROLES = { "上路", "打野", "中路", "下路", "辅助" }

local function teamName(state, teamId)
    if teamId == "legacy" then
        return (state.company and state.company.name) or "Legacy Gaming"
    end
    local t = LeagueCatalog.GetTeam(teamId)
        or LeagueCatalog.GetQualifierTeam(teamId)
        or LeagueCatalog.GetAcademyTeam(teamId)
        or LeagueCatalog.GetRegionTeam(teamId)
    return t and t.name or teamId
end

--- 队伍战力：我方首局锁定 BP 战力（myPower），AI 每局按当前量级取
local function teamPower(state, sim, teamId)
    if teamId == sim.myId and sim.myPower then return sim.myPower end
    if sim.powerMode == "academy" then
        local AcademySystem = require("AcademySystem")
        return AcademySystem.GetYouthTeamPower(state, teamId)
    end
    local AISystem = require("AISystem")
    if AISystem.IsProAiTeam(teamId) then
        AISystem.EnsureAgents(state)
        -- D4：玩家对局 AI 侧用 BP 战力（选手英雄池 × 版本 × 对位）；AI 互赛用阵容战力
        local inMyMatch = sim.myId and (sim.myId == sim.teamAId or sim.myId == sim.teamBId)
        if inMyMatch then
            local m = state.match
            if m and m.opponentId == teamId then
                local bp = AISystem.GetMatchPower(state, teamId)
                if bp then return bp end
            end
        end
        return AISystem.GetTeamPower(state, teamId)
    end
    local CompetitionSystem = require("CompetitionSystem")
    return CompetitionSystem.GetMastersTeamPower(state, teamId)
end

local function behindInGame(sim, teamId)
    if teamId == sim.teamAId then return sim.phaseWinsA < sim.phaseWinsB end
    return sim.phaseWinsB < sim.phaseWinsA
end

local function behindInSeries(sim, teamId)
    local mine = teamId == sim.teamAId
    local w = mine and sim.winsA or sim.winsB
    local l = mine and sim.winsB or sim.winsA
    return w < l
end

local function phaseParams(state, sim, teamId)
    local isMine = teamId == sim.myId
    local isBigMatch = state.company and (state.company.seasonState == "playoff" or state.company.seasonState == "champion" or state.company.seasonState == "masters")
    local TacticsSystem = require("TacticsSystem")
    local power = teamPower(state, sim, teamId)
    local p, v = TacticsSystem.GetRollParams(state, isMine, power)
    if not isMine then
        -- D4：AI 有自己的战术（风格 × 版本 × 难度），不再固定标准波动
        local AISystem = require("AISystem")
        p, v = AISystem.GetTacticRollParams(state, teamId, power)
    end
    -- 战术克制加成（P1-7）
    if isMine then
        local myTacticId = state.company.tactics or "balanced"
        local AISystem = require("AISystem")
        local opponentId = teamId == sim.teamAId and sim.teamBId or sim.teamAId
        local oppAgent = AISystem.GetAgent(state, opponentId)
        local oppTacticId = oppAgent and oppAgent.tactic or "balanced"
        local counterBonus = TacticsSystem.GetCounterBonus(state, myTacticId, oppTacticId)
        if counterBonus ~= 0 then
            p = p + counterBonus
        end
    end
    -- BP#144 战术联动：我方战术与 BP 阵容契合时，获得小幅联动加成（奖励按阵容选战术）
    if isMine and sim.myPower then
        local HeroSystem = require("HeroSystem")
        local rec = HeroSystem.GetRecommendedTactic(state)
        if rec and rec == (state.company.tactics or "balanced") then
            p = p * 1.02
            v = v - 0.01
        end
    end
    if isMine then
        if sim.gameDecision and sim.gameDecision.id then
            local eff = DECISIONS[sim.gameDecision.id]
            if eff then
                p = p * (1 + (eff.power or 0))
                v = v + (eff.variance or 0)
            end
        end
        -- 回合事件卡加成（玩家选择）
        if sim.roundPowerBonus then
            p = p * (1 + sim.roundPowerBonus)
        end
        if sim.roundVarianceBonus then
            v = v + sim.roundVarianceBonus
        end
        if sim.opponentShaken then
            p = p * 1.02 -- 打断对手气势后的小幅加成
        end
        -- 选手生态（Player Ecosystem）：人格 / 心态 / 关系网 影响本队战力与波动
        local PlayerEcoSystem = require("PlayerEcoSystem")
        local ecoMod = PlayerEcoSystem.GetMatchModifier(state, isBigMatch)
        p = p * ecoMod.powerMul
        v = v + ecoMod.varianceAdd
        -- 玩法扩展 #57：赛前作战计划（进攻强度 / 针对目标 / 风险模式）
        local gp = state.match and state.match.gameplan
        if gp then
            if gp.aggression == "aggressive" then p = p * 1.03; v = v + 0.03 end
            if gp.aggression == "defensive" then p = p * 0.98; v = v - 0.02 end
            if gp.focus == "jungle" or gp.focus == "adc" then p = p * 1.02 end
            if gp.risk == "bold" then p = p * 1.02; v = v + 0.03 end
            if gp.risk == "safe" then p = p * 0.99; v = v - 0.03 end
        end
    end
    -- BP#142 硬克制回合波动：存在硬克制/被硬克制的对位时，单局结果更刺激（仅放大波动，不叠加总战力，避免与战力加成重复计算）
    local _m = state.match
    if _m and _m.myPicks and _m.oppPicks then
        local HeroSystem = require("HeroSystem")
        local cs = HeroSystem.GetCounterSummary(state)
        if cs and cs.hardPct then
            if cs.hardPct ~= 0 then
                local sideHardPct = isMine and cs.hardPct or -cs.hardPct
                v = v + math.abs(sideHardPct) * 0.25
            end
            -- BP#143：我方存在硬克制（针对性 counter-pick）时，单局额外小幅战力加成，奖励 Ban/Pick 博弈
            if isMine and cs.hardPct > 0 then
                p = p * (1 + math.min(cs.hardPct, 10) / 100 * 0.3)
            end
        end
    end
    -- 针对指令：集火对手 MVP，下局对手战力 -5%、波动 +4%
    if not isMine and sim.focusActive then
        p = p * (1 - 0.05)
        v = v + 0.04
    end
    -- momentum：连胜阶段 +2%/段（上限 3 段）
    local streak = teamId == sim.teamAId and sim.streakA or sim.streakB
    p = p * (1 + 0.02 * math.min(streak, 3))
    -- 系列赛 momentum：胜队下一局 +2%，败队下一局波动 +3%（翻盘熵）
    if teamId == sim.teamAId then
        p = p * (1 + (sim.seriesBoostA or 0))
        v = v + (sim.seriesVarianceA or 0)
    else
        p = p * (1 + (sim.seriesBoostB or 0))
        v = v + (sim.seriesVarianceB or 0)
    end
    -- 收官熵：落后方获得翻盘加成（Gameflow：后期边际优势更大）
    if sim.phaseIndex == #ROUNDS and (behindInGame(sim, teamId) or behindInSeries(sim, teamId)) then
        p = p * 1.03
        v = v + 0.06
    end
    return p, v
end

--- 对线期事件角色：优先用我方 BP 对位克制角色，否则随机位置
local function roleFlavor(state, sim, winnerId)
    if winnerId == sim.myId and state.match and state.match.myPicks then
        local HeroSystem = require("HeroSystem")
        local counter = HeroSystem.GetCounterSummary(state)
        if counter and counter.pairs then
            for _, p in ipairs(counter.pairs) do
                if p.kind == "win" and p.role then
                    return LeagueCatalog.POSITIONS[p.role] or p.role
                end
            end
        end
    end
    return RANDOM_ROLES[math.random(#RANDOM_ROLES)]
end

local function buildPhaseEvent(state, sim, winnerId, phaseDef)
    local perspective = sim.myId or sim.teamAId
    local winnerIsMine = winnerId == perspective
    local poolKey = phaseDef.id .. "_" .. (winnerIsMine and "win" or "lose")
    local pool = EVENTS[poolKey] or EVENTS.early_win
    local template = tostring(pool[math.random(#pool)] or "")
    local role = nil
    if phaseDef.id == "lane" then
        role = roleFlavor(state, sim, winnerId)
    end
    local text = string.gsub(template, "{w}", tostring(teamName(state, winnerId)))
    text = string.gsub(text, "{r}", tostring(role or "关键选手"))
    return {
        phase = phaseDef.id,
        phaseLabel = phaseDef.label,
        teamId = winnerId,
        role = role,
        text = text,
    }
end

local function simulatePhase(state, sim, phaseDef)
    local pA, vA = phaseParams(state, sim, sim.teamAId)
    local pB, vB = phaseParams(state, sim, sim.teamBId)
    local rollA = pA * ((1 - vA) + math.random() * 2 * vA)
    local rollB = pB * ((1 - vB) + math.random() * 2 * vB)
    local winnerId = rollA >= rollB and sim.teamAId or sim.teamBId
    if winnerId == sim.teamAId then
        sim.streakA = sim.streakA + 1
        sim.streakB = 0
        sim.phaseWinsA = sim.phaseWinsA + 1
    else
        sim.streakB = sim.streakB + 1
        sim.streakA = 0
        sim.phaseWinsB = sim.phaseWinsB + 1
    end
    table.insert(sim.phaseEvents, buildPhaseEvent(state, sim, winnerId, phaseDef))
    return winnerId
end

local function finishGame(sim)
    local a, b = sim.phaseWinsA, sim.phaseWinsB
    local winnerId
    if a == b then
        winnerId = math.random() >= 0.5 and sim.teamAId or sim.teamBId
    else
        winnerId = a > b and sim.teamAId or sim.teamBId
    end
    local loserId = winnerId == sim.teamAId and sim.teamBId or sim.teamAId
    if winnerId == sim.teamAId then
        sim.winsA = sim.winsA + 1
    else
        sim.winsB = sim.winsB + 1
    end
    table.insert(sim.games, {
        winnerId = winnerId,
        loserId = loserId,
        phaseWins = { a, b },
        events = sim.phaseEvents,
        decision = sim.gameDecision and sim.gameDecision.id
            and { id = sim.gameDecision.id, label = sim.gameDecision.label } or nil,
    })
    -- 系列赛 momentum：胜队下局 +2%，败队下局波动 +3%
    sim.seriesBoostA = winnerId == sim.teamAId and 0.02 or 0
    sim.seriesVarianceA = winnerId == sim.teamAId and 0 or 0.03
    sim.seriesBoostB = winnerId == sim.teamBId and 0.02 or 0
    sim.seriesVarianceB = winnerId == sim.teamBId and 0 or 0.03
    -- 重置单局状态
    sim.gameIndex = sim.gameIndex + 1
    sim.phaseIndex = 1
    sim.phaseWinsA, sim.phaseWinsB = 0, 0
    sim.phaseEvents = {}
    sim.gameDecision = nil
    sim.timeoutActive = nil   -- 暂停士气加成只持续一局
    sim.opponentShaken = nil
    sim.focusActive = nil    -- 针对指令只持续一局
    sim.roundDone = nil
    sim.roundPowerBonus = nil
    sim.roundVarianceBonus = nil
    sim.roundChoice = nil
    sim.signatureUsed = nil
    sim.featuredSignature = nil
    sim.signatureTriggered = nil
    sim.starCallActive = nil
end

--- 决策触发规则（增强）：每局结束后触发 1 个临场决策（BO3 第 1 局后、BO5 第 1/2/3 局后）
--- 每场系列赛最多 3 次决策（避免过多打断）
local function isDecisionGame(state, sim)
    if not (sim.myId == sim.teamAId or sim.myId == sim.teamBId) then return false end
    if (sim.decisionsUsed or 0) >= 3 then return false end  -- 每场最多 3 次
    -- 第 1 局后必触发（BO3/BO5 都触发）
    if sim.gameIndex == 2 then return true end
    -- BO5 第 2、3 局后也触发
    if sim.bestOf >= 5 and (sim.gameIndex == 3 or sim.gameIndex == 4) then return true end
    return false
end

local function buildDecision(state, sim)
    local myWins = sim.myId == sim.teamAId and sim.winsA or sim.winsB
    local oppWins = sim.myId == sim.teamAId and sim.winsB or sim.winsA
    local oppId = sim.myId == sim.teamAId and sim.teamBId or sim.teamAId
    local situation
    local options = {}
    -- 基础选项（始终可用）
    table.insert(options, { id = "teamfight", label = DECISIONS.teamfight.label, desc = DECISIONS.teamfight.desc })
    table.insert(options, { id = "split", label = DECISIONS.split.label, desc = DECISIONS.split.desc })
    table.insert(options, { id = "composure", label = DECISIONS.composure.label, desc = DECISIONS.composure.desc })
    -- 换人奇兵：有替补且本场未用过
    if not sim.subUsed then
        local RosterSystem = require("RosterSystem")
        if #RosterSystem.GetBenchPlayers(state) > 0 then
            table.insert(options, { id = "substitute", label = DECISIONS.substitute.label, desc = DECISIONS.substitute.desc })
        end
    end
    -- 针对指令：集火对手 MVP（本场未用过）
    if not sim.focusUsed then
        table.insert(options, { id = "focus_opp", label = DECISIONS.focus_opp.label, desc = DECISIONS.focus_opp.desc })
    end
    -- 玩法扩展 #57：临场指挥新类型（每场各 1 次）
    if not sim.bountyUsed then
        table.insert(options, { id = "bounty", label = DECISIONS.bounty.label, desc = DECISIONS.bounty.desc })
    end
    if not sim.tempoUsed then
        table.insert(options, { id = "tempo", label = DECISIONS.tempo.label, desc = DECISIONS.tempo.desc })
    end
    if not sim.starUsed then
        table.insert(options, { id = "star_play", label = DECISIONS.star_play.label, desc = DECISIONS.star_play.desc })
    end
    -- 动态选项：首局失利后触发「换战术」
    if sim.gameIndex == 2 and myWins == 0 then
        table.insert(options, { id = "switch_tactic", label = DECISIONS.switch_tactic.label, desc = DECISIONS.switch_tactic.desc })
        situation = "首局失利，需要调整战术应对 " .. teamName(state, oppId) .. " 的打法"
    -- 动态选项：赛点局触发「叫暂停」
    elseif myWins >= sim.needed - 1 or oppWins >= sim.needed - 1 then
        if not sim.timeoutUsed then
            table.insert(options, { id = "timeout", label = DECISIONS.timeout.label, desc = DECISIONS.timeout.desc })
        end
        if myWins >= sim.needed - 1 then
            situation = "手握赛点 " .. tostring(myWins) .. ":" .. tostring(oppWins) .. "，拿下本局直接晋级！"
        else
            situation = "已到悬崖边 " .. tostring(myWins) .. ":" .. tostring(oppWins) .. "，本局不容有失"
        end
    else
        situation = "系列赛 " .. tostring(myWins) .. ":" .. tostring(oppWins) .. "，第 " .. tostring(sim.gameIndex) .. " 局开始"
    end
    return {
        id = "decision_" .. tostring(sim.gameIndex),
        title = " 教练临场决策 · 第 " .. tostring(sim.gameIndex) .. " 局",
        context = situation .. "。对手：" .. teamName(state, oppId) .. "。",
        options = options,
    }
end

local function applyDecision(sim, choiceId)
    local d = DECISIONS[choiceId]
    if not d then d = DECISIONS.split end
    sim.gameDecision = { id = d.id, label = d.label }
    sim.decisionsUsed = (sim.decisionsUsed or 0) + 1
    if d.clearOpponent then
        local oppStreak = sim.myId == sim.teamAId and sim.streakB or sim.streakA
        if sim.myId == sim.teamAId then
            sim.streakB = 0
        else
            sim.streakA = 0
        end
        if oppStreak >= 2 then sim.opponentShaken = true end
    end
    if d.switchTactic then
        -- 切换战术：下局战术临时反转
        sim.tacticSwitch = true
    end
    if d.timeout then
        sim.timeoutUsed = true
        sim.timeoutActive = true
        -- RC-3: 全队士气 +10（写入选手 morale）
        local MoraleSystem = require("MoraleSystem")
        local RosterSystem = require("RosterSystem")
        local state = _G and _G.CompanyState and CompanyState.GetState and CompanyState.GetState()
        if state then
            for _, entry in ipairs(RosterSystem.GetRosterPlayers(state)) do
                MoraleSystem.Change(entry.player, 10)
            end
        end
    end
    if d.substitute then
        -- 换人奇兵：效果经 gameDecision 路径在 phaseParams 结算（power 0.06），subUsed 仅做每场一次门控
        sim.subUsed = true
    end
    if d.focusOpp then
        sim.focusUsed = true
        sim.focusActive = true  -- 下局对手战力 -5%（finishGame 时清除）
    end
    if d.bounty then sim.bountyUsed = true end
    if d.tempo then sim.tempoUsed = true end
    if d.starCall then
        sim.starUsed = true
        sim.starCallActive = true  -- 下局解锁招牌绝技（step 中 sig 选项判断扩展）
    end
end

-- 应用玩家回合事件卡选择（power/variance 加成到本回合）
local function applyRoundChoice(state, sim, choiceId)
    if not choiceId then return end
    local roundDef = ROUNDS[sim.phaseIndex]
    if not roundDef then return end
    -- 招牌绝技（机制 A）：主打明星站出来，本回合大 swings
    if choiceId == "sig" and sim.featuredSignature then
        sim.roundChoice = { id = "sig", label = sim.featuredSignature.label, round = roundDef.id }
        sim.roundPowerBonus = sim.featuredSignature.power
        sim.roundVarianceBonus = sim.featuredSignature.variance
        sim.signatureUsed = true
        sim.signatureTriggered = { playerId = sim.featuredSignature.playerId, label = sim.featuredSignature.label }
        sim.roundDone = true
        return
    end
    local opts = ROUND_OPTIONS[roundDef.id] or {}
    local chosen = nil
    for _, o in ipairs(opts) do
        if o.id == choiceId then chosen = o break end
    end
    if not chosen then return end
    sim.roundChoice = { id = chosen.id, label = chosen.label, round = roundDef.id }
    sim.roundPowerBonus = (chosen.power or 0)
    sim.roundVarianceBonus = (chosen.variance or 0)
    -- BP#146 回合事件随 BP 变化：回合选项风格与 BP 阵容/战术契合时小幅加成，相悖时略减
    if chosen.style and chosen.style ~= "neutral" and state and state.match then
        local HeroSystem = require("HeroSystem")
        local rec = HeroSystem.GetRecommendedTactic(state)
        local bpStyle = rec == "aggressive" and "aggro" or (rec == "defensive" and "def" or "balanced")
        if bpStyle ~= "balanced" then
            if chosen.style == bpStyle then
                sim.roundPowerBonus = sim.roundPowerBonus + 0.02
                sim.roundVarianceBonus = sim.roundVarianceBonus - 0.01
            elseif (chosen.style == "aggro" and bpStyle == "def") or (chosen.style == "def" and bpStyle == "aggro") then
                sim.roundPowerBonus = sim.roundPowerBonus - 0.01
            end
        end
    end
    -- 标记本回合已选卡：避免 step 里再次暂停
    sim.roundDone = true
end

local function step(state, sim, choiceId)
    -- choiceId 可能是局间决策，也可能是回合事件卡
    if choiceId then
        if sim.pendingRound then
            applyRoundChoice(state, sim, choiceId)
            sim.pendingRound = nil
        else
            applyDecision(sim, choiceId)
        end
    end
    while true do
        if sim.winsA >= sim.needed or sim.winsB >= sim.needed then
            return { status = "done", winsA = sim.winsA, winsB = sim.winsB, games = sim.games }
        end
        if sim.phaseIndex <= #ROUNDS then
            local roundDef = ROUNDS[sim.phaseIndex]
            -- 玩家参与回合：第 1、3、5 回合（奇数回合）等玩家选卡
            -- 仅当这是玩家对局（sim.decisions）且本回合还没选过卡
            if sim.decisions and not sim.roundDone then
                sim.pendingRound = true
                local options = {}
                for _, o in ipairs(ROUND_OPTIONS[roundDef.id] or {}) do
                    table.insert(options, o)
                end
                -- 招牌绝技（机制 A）：大龙/决战回合，主打明星可站出来触发大 swings
                if not sim.signatureUsed and (roundDef.id == "round5" or roundDef.id == "round6" or sim.starCallActive) then
                    local m = state.match
                    local featured = m and m.featuredStar
                    if featured and featured ~= "" then
                        local sig = SignatureSystem.GetSignature(state, featured)
                        local pname = LeagueCatalog.GetPlayer(featured)
                        if sig and pname then
                            table.insert(options, {
                                id = "sig",
                                label = sig.icon .. " " .. pname.name .. "：" .. sig.label,
                                desc = "招牌绝技！" .. sig.desc,
                                power = sig.power,
                                variance = sig.variance,
                            })
                            sim.featuredSignature = {
                                power = sig.power,
                                variance = sig.variance,
                                label = pname.name .. " " .. sig.label,
                                playerId = featured,
                            }
                        end
                    end
                end
                return {
                    status = "round_decision",
                    sim = sim,
                    round = roundDef,
                    options = options,
                    gameIndex = sim.gameIndex,
                    phaseIndex = sim.phaseIndex,
                }
            end
            -- 模拟本回合（带事件卡加成）
            simulatePhase(state, sim, roundDef)
            sim.phaseIndex = sim.phaseIndex + 1
            sim.roundDone = nil
            sim.roundPowerBonus = nil
            sim.roundVarianceBonus = nil
            -- 本局 6 回合结束后（即将 finishGame 前）检查局间决策
            if sim.phaseIndex > #ROUNDS and sim.decisions and not sim.gameDecision
                and isDecisionGame(state, sim) then
                sim.gameDecision = { pending = true }
                return { status = "decision", sim = sim, decision = buildDecision(state, sim) }
            end
        else
            finishGame(sim)
        end
    end
end

--- 开始一场系列赛
--- opts: teamAId, teamBId, bestOf, myId, decisions(bool), powerMode("masters"/"academy")
--- 返回 { status="done", winsA, winsB, games } 或 { status="decision", sim, decision }
function MatchSimulator.RunSeries(state, opts)
    state = CompanyState.Ensure(state)
    local sim = {
        teamAId = opts.teamAId,
        teamBId = opts.teamBId,
        bestOf = opts.bestOf or 3,
        needed = math.floor((opts.bestOf or 3) / 2) + 1,
        myId = opts.myId,
        decisions = opts.decisions == true,
        powerMode = opts.powerMode or "masters",
        myPower = nil,
        games = {},
        winsA = 0,
        winsB = 0,
        gameIndex = 1,
        phaseIndex = 1,
        streakA = 0,
        streakB = 0,
        phaseWinsA = 0,
        phaseWinsB = 0,
        phaseEvents = {},
        gameDecision = nil,
        matchPointUsed = false,
        decisionsUsed = 0,
        timeoutUsed = false,
        subUsed = false,
        focusUsed = false,
        focusActive = false,
        bountyUsed = false,
        tempoUsed = false,
        starUsed = false,
        starCallActive = nil,
        seriesBoostA = 0,
        seriesBoostB = 0,
        seriesVarianceA = 0,
        seriesVarianceB = 0,
        opponentShaken = nil,
        signatureUsed = false,
        featuredSignature = nil,
        signatureTriggered = nil,
    }
    if sim.myId and (sim.myId == sim.teamAId or sim.myId == sim.teamBId) then
        sim.myPower = teamPower(state, sim, sim.myId)
    end
    local ok, result = pcall(step, state, sim, nil)
    if not ok then
        -- 模拟崩溃：返回安全默认值，让比赛能继续
        return { status = "done", winsA = 1, winsB = 0, games = { { winnerId = sim.teamAId } } }
    end
    return result
end

--- 恢复一场暂停的系列赛（玩家提交决策后继续）
function MatchSimulator.Continue(state, sim, choiceId)
    state = CompanyState.Ensure(state)
    if not sim then
        return { status = "done", winsA = 0, winsB = 0, games = {} }
    end
    local ok, result = pcall(step, state, sim, choiceId)
    if not ok then
        -- 模拟崩溃：返回安全默认值，让比赛能继续
        return { status = "done", winsA = sim.winsA + 1, winsB = sim.winsB, games = sim.games }
    end
    return result
end

return MatchSimulator
