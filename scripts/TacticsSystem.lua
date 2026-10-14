-- TacticsSystem：赛前战术决策
-- 每周比赛前选择战术，影响我方每局的火力与波动幅度。
-- 「版本答案」与每周版本 meta 联动，放大部分位置加成——版本变了战术也要跟着变。
local CompanyState = require("CompanyState")
local TierSystem = require("TierSystem")

local TacticsSystem = {}

TacticsSystem.TACTICS = {
    balanced = {
        id = "balanced",
        label = "均衡",
        desc = "攻守兼备，没有明显短板",
        power = 1.0,
        variance = 0.15,
        counters = {}, -- 不被克制
    },
    aggressive = {
        id = "aggressive",
        label = "激进进攻",
        desc = "火力 +5%，但波动更大，状态不好时容易翻车",
        power = 1.05,
        variance = 0.22,
        counters = { "defensive" }, -- 被稳健防守克制
    },
    defensive = {
        id = "defensive",
        label = "稳健防守",
        desc = "火力 -3%，但下限更稳，适合保存实力",
        power = 0.97,
        variance = 0.08,
        counters = { "metapick" }, -- 被版本答案克制
    },
    metapick = {
        id = "metapick",
        label = "版本答案",
        desc = "当前版本位置加成提升 50%，版本弱势时收益有限",
        power = 1.02,
        variance = 0.12,
        metaBoost = true,
        counters = { "aggressive" }, -- 被激进进攻克制
    },
    domination = {
        id = "domination",
        label = "王朝战术",
        desc = "传奇底蕴，火力 +8%，气势压制对手",
        power = 1.08,
        variance = 0.18,
        counters = {}, -- 不被克制（传奇专属）
    },
}

-- 克制环说明：激进进攻 > 稳健防守 > 版本答案 > 激进进攻
-- 王朝战术为传奇专属，不参与克制环
TacticsSystem.COUNTER_CHAIN = {
    aggressive = { beats = "defensive", label = "激进进攻 克制 稳健防守" },
    defensive = { beats = "metapick", label = "稳健防守 克制 版本答案" },
    metapick = { beats = "aggressive", label = "版本答案 克制 激进进攻" },
}

-- 获取战术克制信息：返回 { beats: 克制的战术id, beatenBy: 被克制的战术id列表 }
function TacticsSystem.GetCounterInfo(tacticId)
    local info = TacticsSystem.COUNTER_CHAIN[tacticId]
    if not info then return nil end
    local beatenBy = {}
    for id, chain in pairs(TacticsSystem.COUNTER_CHAIN) do
        if chain.beats == tacticId then table.insert(beatenBy, id) end
    end
    return { beats = info.beats, beatenBy = beatenBy, label = info.label }
end

-- 计算战术克制加成（用于 MatchSimulator）
function TacticsSystem.GetCounterBonus(state, myTacticId, opponentTacticId)
    local myInfo = TacticsSystem.GetCounterInfo(myTacticId)
    if myInfo and myInfo.beats == opponentTacticId then
        return 4 -- 克制：+4 战力
    end
    local oppInfo = TacticsSystem.GetCounterInfo(opponentTacticId)
    if oppInfo and oppInfo.beats == myTacticId then
        return -3 -- 被克制：-3 战力
    end
    return 0
end

function TacticsSystem.GetCurrent(state)
    state = CompanyState.Ensure(state)
    local id = state.company.tactics
    if not TierSystem.IsTacticUnlocked(state, id) then
        return TacticsSystem.TACTICS.balanced
    end
    return TacticsSystem.TACTICS[id] or TacticsSystem.TACTICS.balanced
end

function TacticsSystem.GetDesc(state)
    state = CompanyState.Ensure(state)
    local tactic = TacticsSystem.GetCurrent(state)
    if tactic.metaBoost and state.meta and state.meta.role then
        return "版本位置加成提升 50%（当前利好：" .. (state.meta.roleLabel or "对应位置") .. "），版本弱势时收益有限"
    end
    return tactic.desc
end

function TacticsSystem.SetTactics(state, id)
    state = CompanyState.Ensure(state)
    local tactic = TacticsSystem.TACTICS[id]
    if not tactic then return false, "未知战术" end
    if not TierSystem.IsTacticUnlocked(state, id) then
        return false, "俱乐部评级不足，尚未解锁「" .. tactic.label .. "」"
    end
    if state.company.tactics == id then return true, "已在使用该战术" end
    state.company.tactics = id
    CompanyState.RecordTimeline(state, "战术调整",
        "赛前决定采用「" .. tactic.label .. "」，当周比赛按此执行，下周可再调整。")
    return true
end

-- 返回 (修正后战力, 半波动幅度)：只有我方使用战术参数，AI 保持标准
function TacticsSystem.GetRollParams(state, isMine, basePower)
    if not isMine then return basePower, 0.15 end
    local tactic = TacticsSystem.GetCurrent(state)
    local power = basePower * tactic.power
    if tactic.metaBoost and state.meta and state.meta.role then
        -- 版本位置加成（+8）的 50% 追加
        power = power + 4
    end
    return power, tactic.variance
end

return TacticsSystem
