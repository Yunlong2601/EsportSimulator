-- SignatureSystem：选手招牌绝技（机制 A）
-- 每位选手根据其最强属性获得一个专属招牌；比赛关键回合（大龙/决战）可由你决定
-- 让哪位主打明星「站出来」触发招牌，造成一波大 swings。让每场比赛因你的阵容而不同。
local LeagueCatalog = require("LeagueCatalog")
local CompanyState = require("CompanyState")

local SignatureSystem = {}

-- 按属性原型分池：操作 / 团战 / 对线
local POOLS = {
    mechanics = {
        { id = "mech_miracle", label = "极限微操", icon = "微操", desc = "极限反应打出奇迹级操作，瞬间改写战局", power = 0.15, variance = 0.11 },
        { id = "mech_shadow",  label = "暗影刺客", icon = "刺客", desc = "无声切入后排，秒杀对方核心", power = 0.14, variance = 0.10 },
    },
    teamfight = {
        { id = "tf_engage", label = "完美开团", icon = "开团", desc = "精准开团一波带走，奠定胜势", power = 0.14, variance = 0.10 },
        { id = "tf_peel",   label = "极限保排", icon = "保排", desc = "死保核心输出，抓住反打翻盘", power = 0.13, variance = 0.09 },
    },
    laning = {
        { id = "lane_snowball", label = "对线压制", icon = "压制", desc = "对线期滚起雪球，经济遥遥领先", power = 0.13, variance = 0.08 },
        { id = "lane_freeze",   label = "窒息控线", icon = "控线", desc = "控线压制，对手发育完全停滞", power = 0.12, variance = 0.08 },
    },
}

local function archetypeOf(player)
    local m = tonumber(player.mechanics) or 0
    local t = tonumber(player.teamfight) or 0
    local l = tonumber(player.laning) or 0
    if m >= t and m >= l then return "mechanics" end
    if t >= l then return "teamfight" end
    return "laning"
end

--- 返回选手招牌（确定性，同一选手招牌稳定）
function SignatureSystem.GetSignature(state, playerId)
    local player = LeagueCatalog.GetPlayer(playerId)
    if not player then return nil end
    local arch = archetypeOf(player)
    local pool = POOLS[arch] or POOLS.mechanics
    local sum = 0
    local pid = tostring(playerId)
    for i = 1, #pid do sum = sum + string.byte(pid, i) end
    local pick = pool[(sum % #pool) + 1]
    return {
        id = pick.id,
        label = pick.label,
        icon = pick.icon,
        desc = pick.desc,
        power = pick.power,
        variance = pick.variance,
        archetype = arch,
    }
end

--- 选手综合评分（属性均值 × 0.85 + 状态 × 0.15），用于挑选主打明星
function SignatureSystem.Rating(state, playerId)
    local player = LeagueCatalog.GetPlayer(playerId)
    if not player then return 0 end
    local avg = ((tonumber(player.mechanics) or 0) + (tonumber(player.teamfight) or 0) + (tonumber(player.laning) or 0)) / 3
    return avg * 0.85 + (tonumber(player.form) or 0) * 0.15
end

--- 候选主打明星（按评分降序，最多返回 5 名首发）
function SignatureSystem.GetFeaturedOptions(state)
    state = CompanyState.Ensure(state)
    local RosterSystem = require("RosterSystem")
    local list = {}
    for _, entry in ipairs(RosterSystem.GetRosterPlayers(state)) do
        local pid = entry.player and entry.player.id
        if pid and pid ~= "" then
            table.insert(list, {
                playerId = pid,
                name = entry.player.name,
                role = entry.role,
                rating = SignatureSystem.Rating(state, pid),
                signature = SignatureSystem.GetSignature(state, pid),
            })
        end
    end
    table.sort(list, function(a, b) return a.rating > b.rating end)
    return list
end

--- 当前主打明星（无则取评分最高者）
function SignatureSystem.GetFeatured(state)
    state = CompanyState.Ensure(state)
    local featured = state.match and state.match.featuredStar
    if featured and featured ~= "" and LeagueCatalog.GetPlayer(featured) then
        return featured, SignatureSystem.GetSignature(state, featured)
    end
    local opts = SignatureSystem.GetFeaturedOptions(state)
    if #opts > 0 then return opts[1].playerId, opts[1].signature end
    return nil, nil
end

return SignatureSystem
