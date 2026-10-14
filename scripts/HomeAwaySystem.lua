-- HomeAwaySystem：主客场优势 + 赛事环境（P2-⑦）
-- CompetitionSystem 排程标记 home/away；MatchSimulator 注入环境修正
local CompanyState = require("CompanyState")
local LeagueCatalog = require("LeagueCatalog")
local FacilitiesSystem = require("FacilitiesSystem")

local HomeAwaySystem = {}

-- 环境类型
HomeAwaySystem.ENV = {
    home   = { label = "主场", icon = "主", powerMul = 1.04, desc = "粉丝助威，战力 +4%" },
    away   = { label = "客场", icon = "客", powerMul = 0.97, desc = "舟车劳顿，战力 -3%" },
    lan    = { label = "LAN 现场", icon = "LAN", powerMul = 1.03, desc = "稳定发挥，战力 +3%" },
    online = { label = "线上赛", icon = "网", powerMul = 1.00, desc = "网络波动，随机 ±2%" },
}

-- 获取一场比赛的 home/away 归属
-- 使用 state.match.myTeamId（"A" 或 "B"） + isHome 字段判断
function HomeAwaySystem.GetMatchEnv(state, teamA, teamB)
    local myTeamId = state.match and state.match.myTeamId
    if not myTeamId then return nil end  -- 非我方比赛或未设置
    local isHome = state.match.isHome  -- SimulateMatch 设置：我方在 teamA 位置 = 主场
    local envType = isHome and "home" or "away"
    -- 世界赛阶段：LAN 环境
    local phase = state.match and state.match.phase or ""
    if phase == "worldfinal" or phase == "world_semifinal" or phase == "winners_final" or phase == "losers_final" then
        envType = "lan"
    end
    local env = HomeAwaySystem.ENV[envType]
    -- 电竞基地减客场惩罚（FacilitiesSystem gamingHouse Lv1+）
    local gamingHouseLv = FacilitiesSystem.GetLevel(state, "gamingHouse")
    local powerMul = env.powerMul
    if envType == "away" and gamingHouseLv >= 1 then
        powerMul = math.min(1.0, powerMul + 0.02 * gamingHouseLv)  -- Lv1: -3%→-1%, Lv2: 0%, Lv3: +1%
    end
    -- 线上赛随机波动 ±2%
    local variance = 0
    if envType == "online" then
        variance = (math.random(0, 40) - 20) / 1000  -- ±0.02
    end
    return {
        type      = envType,
        label     = env.label,
        icon      = env.icon,
        powerMul  = powerMul + variance,
        desc      = env.desc,
        isHome    = isHome,
        isAway    = not isHome,
    }
end

-- 获取主客场战力修正乘子（供 HeroSystem.GetMatchPower 调用）
function HomeAwaySystem.GetPowerMul(state, teamId)
    if not state.match then return 1 end
    local env = HomeAwaySystem.GetMatchEnv(state, state.match.teamA, state.match.teamB)
    if not env then return 1 end
    local isMine = (teamId == "legacy")
    if isMine then
        return env.powerMul
    else
        -- 对手方：主场对我方有利 → 对手得反向修正
        if env.type == "home" then
            return 0.97  -- 我方主场 → 对手 -3%
        elseif env.type == "away" then
            return 1.04  -- 我方客场 → 对手 +4%
        elseif env.type == "lan" then
            return 1.03
        else
            return 1.0
        end
    end
end

-- 获取当前比赛环境描述（供 MatchPrepScreen / MatchScreen 展示）
function HomeAwaySystem.GetEnvLabel(state)
    local env = HomeAwaySystem.GetMatchEnv(state, (state.match and state.match.teamA) or "", (state.match and state.match.teamB) or "")
    if not env then return nil end
    return env.icon .. " " .. env.label .. "：" .. env.desc
end

-- 排程时设置 home/away（供 CompetitionSystem 调用）
-- 常规赛：奇偶周交替主客场
function HomeAwaySystem.SetMatchEnv(state, teamA, teamB)
    state = CompanyState.Ensure(state)
    state.match = state.match or {}
    state.match.teamA = teamA
    state.match.teamB = teamB
    state.match.envType = (teamA == "legacy") and "home" or "away"
    return state
end

return HomeAwaySystem
