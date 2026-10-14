-- HeroSystem：英雄池 / 版本强度 / BP 对局 / BP 战力结算
-- 选手按 id 确定性生成英雄池（跨局一致、ResetRoster 可复现）；
-- 每周版本强度榜轮换；BP 决策质量直接换算进比赛战力。
local CompanyState = require("CompanyState")
local HeroCatalog = require("HeroCatalog")

local HeroSystem = {}

local STRONG_COUNT = 4
local WEAK_COUNT = 3
local SEASON_STRONG_COUNT = 3
local SEASON_WEAK_COUNT = 2
local SEASON_BOOST = 12

-- ============ BP 顺序（LOL MSI/Worlds 10-ban 交替模式）============
-- 蓝方（我方）vs 红方（AI）：B1-B6 为 ban 阶段，P1-P5 为 pick 阶段
-- 真实 LOL 顺序：B1蓝 → B2红 → B3蓝 → B4红 → B5蓝 → B6红 → P1蓝 → P2红 → P3蓝 → P4红 → P5蓝 → P6红 → P7蓝 → P8红 → P9蓝 → P10红
-- 简化版（适合手游）：B1蓝 → B2红 → B3蓝 → B4红 → B5蓝 → B6红 → P1蓝 → P2红 → P3蓝 → P4红 → P5蓝 → P6红（6 人完成）
HeroSystem.BP_ORDER = {
    -- Ban 阶段（10 bans，每方 5，BP#143 由 3 扩到 5）
    { type = "ban", side = "blue", label = "蓝方 Ban 1" },
    { type = "ban", side = "red",  label = "红方 Ban 1" },
    { type = "ban", side = "blue", label = "蓝方 Ban 2" },
    { type = "ban", side = "red",  label = "红方 Ban 2" },
    { type = "ban", side = "blue", label = "蓝方 Ban 3" },
    { type = "ban", side = "red",  label = "红方 Ban 3" },
    { type = "ban", side = "blue", label = "蓝方 Ban 4" },
    { type = "ban", side = "red",  label = "红方 Ban 4" },
    { type = "ban", side = "blue", label = "蓝方 Ban 5" },
    { type = "ban", side = "red",  label = "红方 Ban 5" },
    -- Pick 阶段（10 picks，交替）
    { type = "pick", side = "blue", role = "top",    label = "蓝方 Pick 1（上单）" },
    { type = "pick", side = "red",  role = "top",    label = "红方 Pick 1（上单）" },
    { type = "pick", side = "blue", role = "jungle", label = "蓝方 Pick 2（打野）" },
    { type = "pick", side = "red",  role = "jungle", label = "红方 Pick 2（打野）" },
    { type = "pick", side = "blue", role = "mid",    label = "蓝方 Pick 3（中单）" },
    { type = "pick", side = "red",  role = "mid",    label = "红方 Pick 3（中单）" },
    { type = "pick", side = "blue", role = "adc",    label = "蓝方 Pick 4（射手）" },
    { type = "pick", side = "red",  role = "adc",    label = "红方 Pick 4（射手）" },
    { type = "pick", side = "blue", role = "support",label = "蓝方 Pick 5（辅助）" },
    { type = "pick", side = "red",  role = "support",label = "红方 Pick 5（辅助）" },
}
HeroSystem.MAX_BANS = 5  -- 每方 ban 数（BP#143 由 3 扩到 5，贴近真实赛事）

-- 摇摆位配置：选手可打多个位置（参考 LOL 职业选手多位置能力）
HeroSystem.FLEX_ROLES = {
    top = { "top", "mid" },           -- 上单可摇摆中单
    mid = { "mid", "top" },           -- 中单可摇摆上单
    jungle = { "jungle", "mid" },     -- 打野可摇摆中单
    adc = { "adc" },                 -- 射手固定
    support = { "support", "adc" },  -- 辅助可摇摆射手（下路双修）
}

-- ============ 克制矩阵（tag -> 被克 tag）============
-- 参考 LOL 电竞经理的对位克制与云顶之弈的羁绊设计：
-- 克制提供递减加成（首个 +2.5%、之后每个 +2%，被克 -1.5%，上限 +-8%），
-- 基础战力差距仍是胜负主导，克制只决定同档对决的胜负手。
local COUNTER_MATRIX = {
    ["坦克"] = { target = "刺客", label = "护盾反突进" },
    ["战士"] = { target = "坦克", label = "磨穿护盾" },
    ["刺客"] = { target = "射手", label = "切后排" },
    ["法师"] = { target = "战士", label = "风筝半肉" },
    ["射手"] = { target = "法师", label = "射程压制" },
    ["开团"] = { target = "射手", label = "强开阵型" },
    ["爆发"] = { target = "保护", label = "爆发点杀" },
    ["收割"] = { target = "战士", label = "收割残局" },
    ["控场"] = { target = "刺客", label = "控制反打" },
    ["保护"] = { target = "刺客", label = "保排反切" },
    ["增益"] = { target = "爆发", label = "增益抗爆" },
    ["控制"] = { target = "爆发", label = "先手控打断" },
    ["视野"] = { target = "刺客", label = "视野反蹲" },
    ["节奏"] = { target = "射手", label = "前期压制" },
}

-- ============ 英雄宿敌（per-hero 硬克制，BP#142）：同位置特定英雄间的招牌克制 ============
-- 在 COUNTER_MATRIX（tag 级）之上叠加更细的英雄级克制，丰富 BP 博弈：
-- 同向强化（如「战士>坦克」具体到某战士克某坦克）让针对性 ban/pick 更有价值；
-- 反向逆克（upset，如某坦克反克某战士）制造意外，避免 tag 克制完全可预测。
-- a 硬克制 b；逆向在 GetHeroRival 中自动判为「被克」。仅同位置对位生效（对位按 role 配对）。
local HERO_RIVALS = {
    -- 上单
    { a = "h_top_3", b = "h_top_1", label = "狂斧斩山岳" },  -- 战士>坦克（强化）
    { a = "h_top_6", b = "h_top_2", label = "星陨碎岩盾" },  -- 战士>坦克（强化）
    { a = "h_top_5", b = "h_top_4", label = "潮汐吞荆棘" },  -- 前排对撞
    { a = "h_top_1", b = "h_top_6", label = "山岳镇星陨" },  -- 坦克逆克战士（意外）
    -- 打野
    { a = "h_jgl_3", b = "h_jgl_1", label = "深渊吞影狼" },  -- 坦克>刺客（强化）
    { a = "h_jgl_1", b = "h_jgl_2", label = "影袭乱节奏" },
    { a = "h_jgl_4", b = "h_jgl_6", label = "月影斩幻猎" },
    { a = "h_jgl_5", b = "h_jgl_3", label = "岩蟒绞深渊" },  -- 节奏逆克坦克（意外）
    -- 中单（tag 矩阵在中单位无同位置克制，靠宿敌补足深度）
    { a = "h_mid_1", b = "h_mid_3", label = "奥术禁魔火" },
    { a = "h_mid_6", b = "h_mid_5", label = "雷霆压暗星" },
    { a = "h_mid_3", b = "h_mid_1", label = "火法焚奥术" },  -- 爆发逆克法师（意外）
    -- 射手（tag 矩阵在 adc 位无同位置克制，靠宿敌补足）
    { a = "h_adc_3", b = "h_adc_1", label = "赏金收割双枪" },
    { a = "h_adc_6", b = "h_adc_2", label = "千里狙破炮手" },
    { a = "h_adc_4", b = "h_adc_3", label = "冰控锁收割" },  -- 控场逆克收割（意外）
    -- 辅助
    { a = "h_sup_6", b = "h_sup_1", label = "战鼓碾圣光" },
    { a = "h_sup_2", b = "h_sup_4", label = "歌声乱时空" },
    { a = "h_sup_5", b = "h_sup_3", label = "幽冥钩铁卫" },  -- 视野逆克坦克（意外）
}
HeroSystem.HERO_RIVALS = HERO_RIVALS  -- 导出供 UI/调试

-- ============ 阵容组合（羁绊）：凑齐 need 个指定 tag 激活 ============
-- 云顶之弈式非线性加成：同质阵容更专精、混合阵容更灵活，激活叠加但总上限 +15%
local SYNERGIES = {
    { id = "iron_wall",     name = "钢铁防线", tags = { "坦克" },         need = 2, pct = 5, desc = "2 名坦克：前排抗压" },
    { id = "assassin_raid", name = "刺客突袭", tags = { "刺客" },         need = 2, pct = 6, desc = "2 名刺客：双切入爆发" },
    { id = "arcane_flow",   name = "法术洪流", tags = { "法师" },         need = 2, pct = 5, desc = "2 名法师：AOE 压制" },
    { id = "twin_fire",     name = "双核火力", tags = { "射手" },         need = 2, pct = 5, desc = "2 名射手：双核输出" },
    { id = "bulwark_3",     name = "三柱前排", tags = { "坦克", "战士" }, need = 3, pct = 6, desc = "3 名前排：阵型稳固" },
    { id = "all_in",        name = "全攻阵型", tags = { "战士", "刺客" }, need = 3, pct = 6, desc = "3 名近战输出：全力进攻" },
    { id = "cc_chain",      name = "控制链",   tags = { "开团", "控场", "控制" }, need = 2, pct = 4, desc = "2 名开团/控场：连环控制" },
    { id = "bodyguard",     name = "护卫核心", tags = { "保护", "增益" }, need = 2, pct = 4, desc = "2 名保核辅助：核心护航" },
    { id = "cleanup",       name = "收割闭环", tags = { "收割", "刺客" }, need = 2, pct = 4, desc = "收割+刺客：残局接管" },
    { id = "finisher",      name = "爆发终结", tags = { "爆发", "法师" }, need = 2, pct = 4, desc = "爆发+法师：秒杀窗口" },
    { id = "tempo",         name = "前期节奏", tags = { "节奏", "开团" }, need = 2, pct = 3, desc = "节奏+开团：前期提速" },
    { id = "vision",        name = "视野压制", tags = { "视野", "节奏" }, need = 2, pct = 3, desc = "视野+节奏：信息压制" },
}

local SYNERGY_CAP = 15

local function clamp(value, minimum, maximum)
    return math.max(minimum, math.min(maximum, tonumber(value) or minimum))
end

local function hashSeed(str)
    local h = 0
    for i = 1, #str do
        h = (h * 31 + string.byte(str, i)) % 1000003
    end
    return h
end

--- 确定性生成选手英雄池：4 个基础英雄 + 1 招牌（高熟练）+ 概率第 5 个
function HeroSystem.RollPool(player)
    local role = player and player.role
    local pool = HeroCatalog.HEROES_BY_ROLE[role]
    if not pool or #pool == 0 then return {} end
    local seed = hashSeed(player.id or "unknown")
    local heroes = {}
    local function add(heroId, proficiency)
        if heroes[heroId] then
            heroes[heroId] = math.max(heroes[heroId], proficiency)
        else
            heroes[heroId] = proficiency
        end
    end
    for i = 0, 3 do
        local hero = pool[(seed + i * 7) % #pool + 1]
        add(hero.id, 45 + (seed + i * 13) % 36)
    end
    local sig = pool[(seed + 23) % #pool + 1]
    add(sig.id, 72 + (seed + 17) % 24)
    local extra = pool[(seed + 41) % #pool + 1]
    add(extra.id, 40 + (seed + 29) % 20)
    return heroes
end

--- 给选手补英雄池（缺失时生成；已存在保留）
function HeroSystem.SeedPlayer(player)
    if not player then return end
    if not player.heroes or next(player.heroes) == nil then
        player.heroes = HeroSystem.RollPool(player)
    end
    return player
end

--- 选手按熟练度排序的英雄（含英雄对象），取前 n
function HeroSystem.GetPlayerBestHeroes(player, n)
    n = n or 3
    local out = {}
    for heroId, prof in pairs(player.heroes or {}) do
        local hero = HeroCatalog.GetHero(heroId)
        if hero then table.insert(out, { hero = hero, proficiency = prof }) end
    end
    table.sort(out, function(a, b) return a.proficiency > b.proficiency end)
    local result = {}
    for i = 1, math.min(n, #out) do table.insert(result, out[i]) end
    return result
end

--- 赛季推荐加强英雄：每赛季生成 3 强 2 弱（赛季强在每周版本榜高概率强势，特训额外成长）
function HeroSystem.RollSeasonMeta(state)
    state = CompanyState.Ensure(state)
    local heroes = HeroCatalog.HEROES
    local strong, weak = {}, {}
    for _, hero in ipairs(heroes) do table.insert(strong, hero.id) end
    while #strong > SEASON_STRONG_COUNT do
        table.remove(strong, math.random(1, #strong))
    end
    local weakPool = {}
    for _, hero in ipairs(heroes) do
        local isStrong = false
        for _, hid in ipairs(strong) do if hid == hero.id then isStrong = true break end end
        if not isStrong then table.insert(weakPool, hero.id) end
    end
    while #weak < SEASON_WEAK_COUNT and #weakPool > 0 do
        local index = math.random(1, #weakPool)
        table.insert(weak, weakPool[index])
        table.remove(weakPool, index)
    end
    state.league = state.league or {}
    state.league.seasonHeroMeta = {
        season = tonumber(state.company.seasons) or 0,
        strong = strong,
        weak = weak,
        boost = SEASON_BOOST,
    }
    return state.league.seasonHeroMeta
end

--- 老档迁移：Ensure 语义，赛季号不匹配时重新生成
function HeroSystem.EnsureSeasonMeta(state)
    state = CompanyState.Ensure(state)
    state.league = state.league or {}
    local meta = state.league.seasonHeroMeta
    if not meta or tonumber(meta.season) ~= tonumber(state.company.seasons) then
        return HeroSystem.RollSeasonMeta(state)
    end
    meta.boost = tonumber(meta.boost) or SEASON_BOOST
    return meta
end

--- 该英雄是否为赛季强英雄
function HeroSystem.IsSeasonStrong(state, heroId)
    local meta = state and state.league and state.league.seasonHeroMeta
    for _, hid in ipairs(meta and meta.strong or {}) do if hid == heroId then return true end end
    return false
end

--- 赛季推荐展示结构：{ strong = {id,name,role,tag} x3, weak = {...} x2, boost }
function HeroSystem.GetSeasonMetaSummary(state)
    state = CompanyState.Ensure(state)
    local meta = HeroSystem.EnsureSeasonMeta(state)
    local function expand(ids)
        local out = {}
        for _, hid in ipairs(ids or {}) do
            local hero = HeroCatalog.GetHero(hid)
            if hero then table.insert(out, { id = hero.id, name = hero.name, role = hero.role, tag = hero.tag }) end
        end
        return out
    end
    return {
        strong = expand(meta.strong),
        weak = expand(meta.weak),
        boost = tonumber(meta.boost) or SEASON_BOOST,
    }
end

--- 周版本强度榜（挂每周结算前）：4 强 3 弱；本周强势必含 2 个赛季强，弱榜避开赛季强
function HeroSystem.RollMeta(state)
    state = CompanyState.Ensure(state)
    local seasonMeta = HeroSystem.EnsureSeasonMeta(state)
    local seasonStrong = seasonMeta and seasonMeta.strong or {}
    local strong, weak = {}, {}
    local pickPool = {}
    for _, hid in ipairs(seasonStrong) do table.insert(pickPool, hid) end
    while #strong < 2 and #pickPool > 0 do
        local index = math.random(1, #pickPool)
        table.insert(strong, pickPool[index])
        table.remove(pickPool, index)
    end
    local fillPool = {}
    for _, hero in ipairs(HeroCatalog.HEROES) do
        local taken = false
        for _, hid in ipairs(strong) do if hid == hero.id then taken = true break end end
        if not taken then table.insert(fillPool, hero.id) end
    end
    while #strong < STRONG_COUNT and #fillPool > 0 do
        local index = math.random(1, #fillPool)
        table.insert(strong, fillPool[index])
        table.remove(fillPool, index)
    end
    local weakPool = {}
    for _, hero in ipairs(HeroCatalog.HEROES) do
        local skip = false
        for _, hid in ipairs(strong) do if hid == hero.id then skip = true break end end
        if not skip and not HeroSystem.IsSeasonStrong(state, hero.id) then
            table.insert(weakPool, hero.id)
        end
    end
    while #weak < WEAK_COUNT and #weakPool > 0 do
        local index = math.random(1, #weakPool)
        table.insert(weak, weakPool[index])
        table.remove(weakPool, index)
    end
    state.league.heroMeta = {
        week = tonumber(state.company.week) or 1,
        strong = strong,
        weak = weak,
    }
    return state.league.heroMeta
end

--- 英雄版本系数：强势 1.15 / 弱势 0.90 / 常规 1.00
function HeroSystem.GetVersionPower(state, heroId)
    local meta = state and state.league and state.league.heroMeta
    if not meta then return 1.0 end
    for _, hid in ipairs(meta.strong or {}) do if hid == heroId then return 1.15 end end
    for _, hid in ipairs(meta.weak or {}) do if hid == heroId then return 0.90 end end
    return 1.0
end

function HeroSystem.GetMetaSummary(state)
    state = CompanyState.Ensure(state)
    local meta = state.league and state.league.heroMeta
    local out = { strong = {}, weak = {} }
    for _, hid in ipairs(meta and meta.strong or {}) do
        local hero = HeroCatalog.GetHero(hid)
        if hero then table.insert(out.strong, { id = hero.id, name = hero.name, role = hero.role }) end
    end
    for _, hid in ipairs(meta and meta.weak or {}) do
        local hero = HeroCatalog.GetHero(hid)
        if hero then table.insert(out.weak, { id = hero.id, name = hero.name, role = hero.role }) end
    end
    return out
end

-- ============ BP 对局 ============

function HeroSystem.EnsureMatch(state)
    state = CompanyState.Ensure(state)
    state.match = state.match or {}
    local m = state.match
    if m.week ~= tonumber(state.company.week) or not m.opponentId then
        state.match = {
            week = tonumber(state.company.week) or 1,
            phase = "prep",
            opponentId = m.opponentId or nil,
            bpStep = 0,  -- BP 顺序索引（0 = 未开始，1-6 ban，7-16 pick）
            myBans = {},
            oppBans = {},
            myPicks = { top = nil, jungle = nil, mid = nil, adc = nil, support = nil },
            oppPicks = {},
            used = {},
            round = 1,
            flexRoles = {},  -- 摇摆位：{ top = "top" } 表示上单选了 top 位置
        }
        m = state.match
    end
    m.used = m.used or {}
    m.myBans = m.myBans or {}
    m.oppBans = m.oppBans or {}
    m.myPicks = m.myPicks or {}
    m.oppPicks = m.oppPicks or {}
    m.flexRoles = m.flexRoles or {}
    m.bpStep = tonumber(m.bpStep) or 0
    -- 全局BP（Fearless Draft）：系列赛已用英雄不可再用
    m.seriesUsed = m.seriesUsed or { my = {}, opp = {} }
    -- 老档兼容：旧版 AI 抢人是数组（按选人轮次顺序），迁移为按位置映射以便对位克制计算
    if type(m.oppPicks[1]) == "string" then
        local legacy = m.oppPicks
        local mapped = {}
        for i, hid in ipairs(legacy) do
            local role = HeroCatalog.ROLES[i]
            if role and not mapped[role] then mapped[role] = hid end
        end
        m.oppPicks = mapped
    end
    m.round = tonumber(m.round) or 1
    return m
end

--- 进入 BP 阶段：从赛前准备切换到禁用阶段
function HeroSystem.StartBp(state)
    local m = HeroSystem.EnsureMatch(state)
    m.phase = "ban"
    m.bpStep = 1
    -- 我方先 ban：AI 不需要先手（我方 blue side 先手）
    return m
end

--- 开始新 BP：清掉上周残留
function HeroSystem.StartMatch(state, opponentId)
    state = CompanyState.Ensure(state)
    state.match = {
        week = tonumber(state.company.week) or 1,
        phase = "prep",
        opponentId = opponentId,
        bpStep = 0,
        myBans = {},
        oppBans = {},
        myPicks = { top = nil, jungle = nil, mid = nil, adc = nil, support = nil },
        oppPicks = {},
        used = {},
        round = 1,
        flexRoles = {},
    }
    return state.match
end

--- 我方 ban 一个英雄（按 BP 顺序）
function HeroSystem.BanHero(state, heroId)
    local m = HeroSystem.EnsureMatch(state)
    local info = HeroSystem.GetBpStepInfo(state)
    if info.phase ~= "ban" then return false, "当前不在禁用阶段" end
    if info.side ~= "blue" then return false, "当前不是我方禁用回合" end
    if m.used[heroId] then return false, "该英雄已被禁用/选取" end
    if #m.myBans >= HeroSystem.MAX_BANS then return false, "最多禁用 " .. tostring(HeroSystem.MAX_BANS) .. " 个英雄" end
    table.insert(m.myBans, heroId)
    m.used[heroId] = true
    m.bpStep = (tonumber(m.bpStep) or 0) + 1
    return true
end

function HeroSystem.UnbanHero(state, heroId)
    local m = HeroSystem.EnsureMatch(state)
    for i, hid in ipairs(m.myBans or {}) do
        if hid == heroId then
            table.remove(m.myBans, i)
            m.used[heroId] = nil
            return true
        end
    end
    return false
end

--- AI 禁用：版本强势 + 保护自家王牌（禁克制 AI 明星英雄的英雄）+ 针对我方王牌
function HeroSystem.AiBan(state)
    local m = HeroSystem.EnsureMatch(state)
    m.oppBans = m.oppBans or {}
    local strong = (state.league and state.league.heroMeta and state.league.heroMeta.strong) or {}
    for _, hid in ipairs(strong) do
        if not m.used[hid] and #m.oppBans < 2 then
            table.insert(m.oppBans, hid)
            m.used[hid] = true
        end
    end
    if #m.oppBans < 2 then
        -- D4：保护自家王牌——禁掉克制 AI 明星英雄的英雄
        local protect = HeroSystem.GetAiStarCounter(state)
        if protect and not m.used[protect] then
            table.insert(m.oppBans, protect)
            m.used[protect] = true
        end
    end
    if #m.oppBans < 2 then
        local counter = HeroSystem.GetAiCounterHero(state)
        if counter and not m.used[counter] then
            table.insert(m.oppBans, counter)
            m.used[counter] = true
        end
    end
    if #m.oppBans < 2 then
        for _, hero in ipairs(HeroCatalog.HEROES) do
            if not m.used[hero.id] and #m.oppBans < 2 then
                table.insert(m.oppBans, hero.id)
                m.used[hero.id] = true
            end
        end
    end
    return m.oppBans
end

--- 抢 Ban 策略：识别对手招牌英雄（AI 明星选手最高熟练英雄）
--- 返回该英雄 id + 名称 + 理由，供 BP 页展示「对手招牌英雄」提示
function HeroSystem.GetOpponentSignature(state)
    local m = HeroSystem.EnsureMatch(state)
    local AISystem = require("AISystem")
    local agent = AISystem.GetAgent(state, m.opponentId)
    if not agent or not agent.roster then return nil end
    local best, bestProf = nil, -1
    local bestName = nil
    for _, p in pairs(agent.roster) do
        for heroId, prof in pairs(p.heroes or {}) do
            if prof > bestProf then
                bestProf = prof
                best = heroId
                bestName = p.name
            end
        end
    end
    if not best then return nil end
    local hero = HeroCatalog.GetHero(best)
    return {
        heroId = best,
        heroName = hero and hero.name or best,
        heroTag = hero and hero.tag or nil,
        playerName = bestName,
        proficiency = bestProf,
    }
end

--- 抢 Ban 提示：该 ban 对手招牌英雄（不 ban 版本强势）
function HeroSystem.GetPriorityBan(state)
    local m = HeroSystem.EnsureMatch(state)
    local sig = HeroSystem.GetOpponentSignature(state)
    if not sig then return nil end
    local counter = HeroSystem.GetAiStarCounter(state)
    -- 优先 ban 对手招牌（除非已被 ban）
    if not m.used[sig.heroId] then
        return {
            heroId = sig.heroId,
            name = sig.heroName,
            reason = "对手招牌英雄（" .. sig.playerName .. " 的 " .. sig.heroName .. "，熟练度 " .. tostring(sig.proficiency) .. "）",
            type = "signature",
        }
    end
    -- 次选 ban 克制对手招牌的英雄
    if counter and not m.used[counter] then
        local hero = HeroCatalog.GetHero(counter)
        return {
            heroId = counter,
            name = hero and hero.name or counter,
            reason = "克制对手招牌英雄",
            type = "counter",
        }
    end
    return nil
end

--- 我方 ban 时展示「抢 Ban 推荐」
function HeroSystem.GetMyBanRecommendation(state)
    local m = HeroSystem.EnsureMatch(state)
    local priority = HeroSystem.GetPriorityBan(state)
    if priority then return priority end
    -- 默认 ban 版本强势
    local strong = (state.league and state.league.heroMeta and state.league.heroMeta.strong) or {}
    for _, hid in ipairs(strong) do
        if not m.used[hid] then
            local hero = HeroCatalog.GetHero(hid)
            return {
                heroId = hid,
                name = hero and hero.name or hid,
                reason = "版本强势英雄",
                type = "version",
            }
        end
    end
    return nil
end

--- AI 的 BP 策略标签（展示 AI 意图）
function HeroSystem.GetAiStrategy(state)
    local m = HeroSystem.EnsureMatch(state)
    -- 分析 AI 阵容构成推断策略
    local oppPicks = m.oppPicks or {}
    local tags = {}
    for role, hid in pairs(oppPicks) do
        local hero = HeroCatalog.GetHero(hid)
        if hero then tags[hero.tag] = (tags[hero.tag] or 0) + 1 end
    end
    -- 统计已选
    local selected = 0
    for _ in pairs(oppPicks) do selected = selected + 1 end
    if selected >= 3 then
        local aggression = (tags["刺客"] or 0) + (tags["战士"] or 0) + (tags["开团"] or 0)
        local defense = (tags["坦克"] or 0) + (tags["保护"] or 0)
        if aggression >= defense + 2 then
            return { label = " 进攻压制", desc = "对手倾向高爆发阵容，选人偏刺客/战士，注意保护后排" }
        elseif defense >= aggression + 1 then
            return { label = " 防守反击", desc = "对手倾向稳固防守，前排厚实，需要破阵英雄" }
        end
    end
    local sig = HeroSystem.GetOpponentSignature(state)
    if sig then
        return { label = " 围绕王牌", desc = "对手围绕 " .. sig.playerName .. " 的 " .. sig.heroName .. " 构建阵容，Ban 掉可大幅削弱" }
    end
    return { label = " 均衡发育", desc = "对手无明显倾向，按版本强势推进" }
end

--- D4：AI 明星选手的最佳英雄被哪些英雄克制 → 禁掉其中一个（保护自家王牌）
function HeroSystem.GetAiStarCounter(state)
    local m = HeroSystem.EnsureMatch(state)
    local AISystem = require("AISystem")
    local agent = AISystem.GetAgent(state, m.opponentId)
    if not agent or not agent.roster then return nil end
    local RosterSystem = require("RosterSystem")
    local best, bestPower = nil, -1
    for _, p in pairs(agent.roster) do
        local pw = RosterSystem.GetPlayerPower(p, state.meta and state.meta.role)
        if pw > bestPower then best, bestPower = p, pw end
    end
    if not best then return nil end
    local top = HeroSystem.GetPlayerBestHeroes(best, 1)[1]
    local tag = top and top.hero and top.hero.tag
    if not tag then return nil end
    for _, hero in ipairs(HeroCatalog.HEROES) do
        local c = COUNTER_MATRIX[hero.tag]
        if c and c.target == tag and not m.used[hero.id] then return hero.id end
    end
    return nil
end

--- AI 克制目标：我方选手最高熟练英雄
function HeroSystem.GetAiCounterHero(state)
    local RosterSystem = require("RosterSystem")
    local best = nil
    local bestProf = -1
    for _, entry in ipairs(RosterSystem.GetRosterPlayers(state)) do
        for heroId, prof in pairs(entry.player.heroes or {}) do
            if prof > bestProf then
                bestProf = prof
                best = heroId
            end
        end
    end
    return best
end

--- 我方 pick：按 BP 顺序选英雄（支持摇摆位）
function HeroSystem.PickHero(state, role, heroId)
    local m = HeroSystem.EnsureMatch(state)
    local info = HeroSystem.GetBpStepInfo(state)
    if info.phase ~= "pick" then return false, "当前不在选人阶段" end
    if info.side ~= "blue" then return false, "当前不是我方选人回合" end
    if info.role and info.role ~= role then return false, "BP 顺序：当前应选 " .. tostring(HeroCatalog.ROLE_LABELS[info.role] or info.role) end
    if m.used[heroId] then return false, "该英雄已被禁用/选取" end
    -- 全局BP：系列赛已用英雄不可用
    if m.seriesUsed and m.seriesUsed.my and m.seriesUsed.my[heroId] then
        return false, "全局BP：该英雄本系列赛已使用过"
    end
    local hero = HeroCatalog.GetHero(heroId)
    if not hero then return false, "英雄不存在" end
    -- 摇摆位：英雄的主位置必须匹配当前位置，或选手可摇摆到该位置
    if hero.role ~= role then
        -- 检查该位置的选手是否能摇摆（用英雄主位置匹配）
        return false, "英雄位置不匹配（英雄是" .. tostring(HeroCatalog.ROLE_LABELS[hero.role] or hero.role) .. "，当前选" .. tostring(HeroCatalog.ROLE_LABELS[role] or role) .. "）"
    end
    m.myPicks[role] = heroId
    m.used[heroId] = true
    m.flexRoles[role] = role
    -- 全局BP：记录我方已用英雄
    m.seriesUsed = m.seriesUsed or { my = {}, opp = {} }
    m.seriesUsed.my[heroId] = true
    m.round = math.min(5, tonumber(m.round or 1) + 1)
    m.bpStep = (tonumber(m.bpStep) or 0) + 1
    if HeroSystem.AllPicked(m.myPicks) then
        m.phase = "ready"
    else
        -- AI 抢英雄：按 BP 顺序（非自动全选）
        local nextInfo = HeroSystem.GetBpStepInfo(state)
        if nextInfo and nextInfo.side == "red" and nextInfo.phase == "pick" and nextInfo.role then
            HeroSystem.AiPickRole(state, nextInfo.role)
            m.bpStep = (tonumber(m.bpStep) or 0) + 1
            if HeroSystem.AllPicked(m.myPicks) then m.phase = "ready" end
        end
    end
    return true
end

--- 跳过该位置（英雄池被抢空）：战力按未选英雄惩罚，进入下一位置
function HeroSystem.SkipRole(state, role)
    local m = HeroSystem.EnsureMatch(state)
    if m.phase ~= "pick" then return false, "当前不在选人阶段" end
    if m.myPicks[role] then return false, "该位置已选" end
    m.round = math.min(5, tonumber(m.round or 1) + 1)
    if HeroSystem.AllPicked(m.myPicks) then
        m.phase = "ready"
    else
        HeroSystem.AiPick(state)
        if HeroSystem.AllPicked(m.myPicks) then m.phase = "ready" end
    end
    return true
end

--- AI 抢英雄：按位置抢（与玩家对位），评分 = 版本强度 x 克制/避克修正
--- 反制逻辑：我方同位置已选则优先选克制它的英雄；被它克制的英雄降权。
function HeroSystem.AiPick(state)
    local m = HeroSystem.EnsureMatch(state)
    if m.phase ~= "pick" then return nil end
    local role = nil
    for _, r in ipairs(HeroCatalog.ROLES) do
        if not m.oppPicks[r] then role = r break end
    end
    if not role then return nil end
    local pool = HeroCatalog.HEROES_BY_ROLE[role] or {}
    local best, bestScore = nil, -1
    local myHeroId = m.myPicks[role]
    -- D4：对位 AI 选手的英雄池熟练度（无 agent 时回退纯版本评分）
    local AISystem = require("AISystem")
    local agent = AISystem.GetAgent(state, m.opponentId)
    local aiHeroes = agent and agent.roster and agent.roster[role] and agent.roster[role].heroes
    for _, hero in ipairs(pool) do
        if not m.used[hero.id] then
            local score = HeroSystem.GetVersionPower(state, hero.id)
            if aiHeroes then
                local prof = tonumber(aiHeroes[hero.id]) or 30
                score = score * (0.62 + prof / 100 * 0.78)
            end
            if myHeroId then
                local myTag = HeroSystem.GetHeroTag(myHeroId)
                local theirTag = hero.tag
                if COUNTER_MATRIX[theirTag] and COUNTER_MATRIX[theirTag].target == myTag then
                    score = score * 1.15 -- 克制我方已选：优先抢
                elseif COUNTER_MATRIX[myTag] and COUNTER_MATRIX[myTag].target == theirTag then
                    score = score * 0.85 -- 被我方克制：避开
                end
            end
            score = score + math.random() * 0.06 -- 小随机打破同分
            if score > bestScore then best, bestScore = hero, score end
        end
    end
    if not best then return nil end
    m.oppPicks[role] = best.id
    m.used[best.id] = true
    -- 全局BP：记录 AI 方已用英雄
    m.seriesUsed = m.seriesUsed or { my = {}, opp = {} }
    m.seriesUsed.opp[best.id] = true
    m.round = math.min(5, tonumber(m.round or 1) + 1)
    return best.id
end

function HeroSystem.AllPicked(picks)
    for _, role in ipairs(HeroCatalog.ROLES) do
        if not picks[role] then return false end
    end
    return true
end

--- 一键自动 BP：按 BP 顺序自动完成（禁版本强势 + 抢 Ban + 选最优英雄）
function HeroSystem.AutoBp(state)
    local m = HeroSystem.EnsureMatch(state)
    m.phase = "ban"
    m.bpStep = 1  -- 从 BP 顺序第 1 步开始
    -- 循环执行 BP 顺序，直到所有步骤完成
    local guard = 0
    while guard < 40 do
        guard = guard + 1
        local info = HeroSystem.GetBpStepInfo(state)
        if info.phase == "ready" then
            break
        end
        if info.phase == "ban" or info.phase == "pick" then
            HeroSystem.AutoBpStep(state)
        end
        -- 检查是否所有位置已选完
        if HeroSystem.AllPicked(m.myPicks) then
            break
        end
    end
    m.phase = HeroSystem.AllPicked(m.myPicks) and "ready" or "pick"
    return m
end

--- 当前轮该选的位置（top→jungle→mid→adc→support）
function HeroSystem.CurrentRole(state)
    local m = HeroSystem.EnsureMatch(state)
    for _, role in ipairs(HeroCatalog.ROLES) do
        if not m.myPicks[role] then return role end
    end
    return nil
end

--- 获取 BP 当前阶段信息（UI 展示用）
--- 返回 { step, phase = "ban"/"pick", side = "blue"/"red", label, myTurn }
function HeroSystem.GetBpStepInfo(state)
    local m = HeroSystem.EnsureMatch(state)
    local step = tonumber(m.bpStep) or 0
    if step <= 0 then
        return { step = 0, phase = "prep", side = "blue", label = "赛前准备", myTurn = true }
    end
    local totalSteps = #HeroSystem.BP_ORDER
    if step > totalSteps then
        return { step = step, phase = "ready", side = nil, label = "BP 完成", myTurn = false }
    end
    local info = HeroSystem.BP_ORDER[step]
    return {
        step = step,
        total = totalSteps,
        phase = info.type,
        side = info.side,
        label = info.label,
        role = info.role,
        myTurn = info.side == "blue",
    }
end

--- 我方执行 BP：根据当前阶段自动处理（ban 时自动，pick 时可选英雄或自动）
--- 返回 { done = bool, message = string }
function HeroSystem.AutoBpStep(state)
    local m = HeroSystem.EnsureMatch(state)
    local info = HeroSystem.GetBpStepInfo(state)
    if info.myTurn then
        if info.phase == "ban" then
            -- 自动 ban：优先抢 Ban 推荐，其次版本强势
            local rec = HeroSystem.GetMyBanRecommendation(state)
            local banId = rec and rec.heroId or nil
            if not banId then
                for _, hero in ipairs(HeroCatalog.HEROES) do
                    if not m.used[hero.id] then banId = hero.id break end
                end
            end
            if banId then
                table.insert(m.myBans, banId)
                m.used[banId] = true
                m.bpStep = (tonumber(m.bpStep) or 0) + 1
                return { done = true, message = "我方禁用了 " .. tostring((HeroCatalog.GetHero(banId) or {}).name or banId) }
            end
        elseif info.phase == "pick" and info.role then
            -- 自动 pick：选该位置最优英雄
            local RosterSystem = require("RosterSystem")
            local bestHero, bestScore = nil, -1
            for _, entry in ipairs(RosterSystem.GetRosterPlayers(state)) do
                if entry.role == info.role then
                    for heroId, prof in pairs(entry.player.heroes or {}) do
                        if not m.used[heroId] then
                            local score = prof * HeroSystem.GetVersionPower(state, heroId)
                            if score > bestScore then
                                bestScore = score
                                bestHero = heroId
                            end
                        end
                    end
                end
            end
            if bestHero then
                m.myPicks[info.role] = bestHero
                m.used[bestHero] = true
                m.seriesUsed = m.seriesUsed or { my = {}, opp = {} }
                m.seriesUsed.my[bestHero] = true
                m.bpStep = (tonumber(m.bpStep) or 0) + 1
                return { done = true, message = "我方选了 " .. tostring((HeroCatalog.GetHero(bestHero) or {}).name or bestHero) }
            end
        end
    else
        -- AI 回合：自动处理
        if info.phase == "ban" then
            -- AI ban：版本强势 + 克制我方；BP#143 扩到 5 ban，额外槽位兜底禁掉我方最高熟练英雄以最大化压迫
            local aiBan = nil
            local strong = (state.league and state.league.heroMeta and state.league.heroMeta.strong) or {}
            for _, hid in ipairs(strong) do
                if not m.used[hid] then aiBan = hid break end
            end
            if not aiBan then
                local counter = HeroSystem.GetAiCounterHero(state)
                if counter and not m.used[counter] then aiBan = counter end
            end
            if not aiBan then
                local RosterSystem = require("RosterSystem")
                local best, bestProf = nil, -1
                for _, entry in ipairs(RosterSystem.GetRosterPlayers(state)) do
                    for hid, prof in pairs(entry.player.heroes or {}) do
                        if not m.used[hid] and prof > bestProf then bestProf = prof; best = hid end
                    end
                end
                aiBan = best
            end
            if aiBan then
                table.insert(m.oppBans, aiBan)
                m.used[aiBan] = true
                m.bpStep = (tonumber(m.bpStep) or 0) + 1
                return { done = true, message = "对手禁用了 " .. tostring((HeroCatalog.GetHero(aiBan) or {}).name or aiBan) }
            end
        elseif info.phase == "pick" and info.role then
            local picked = HeroSystem.AiPickRole(state, info.role)
            if picked then
                m.bpStep = (tonumber(m.bpStep) or 0) + 1
                return { done = true, message = "对手选了 " .. tostring((HeroCatalog.GetHero(picked) or {}).name or picked) }
            end
        end
    end
    -- 找不到可执行动作：跳过该步
    m.bpStep = (tonumber(m.bpStep) or 0) + 1
    return { done = true, message = "跳过 BP 步骤" }
end

--- AI 指定位置选英雄（按 BP 顺序）
function HeroSystem.AiPickRole(state, role)
    local m = HeroSystem.EnsureMatch(state)
    local pool = HeroCatalog.HEROES_BY_ROLE[role] or {}
    local best, bestScore = nil, -1
    local AISystem = require("AISystem")
    local agent = AISystem.GetAgent(state, m.opponentId)
    local aiHeroes = agent and agent.roster and agent.roster[role] and agent.roster[role].heroes
    for _, hero in ipairs(pool) do
        if not m.used[hero.id] then
            local score = HeroSystem.GetVersionPower(state, hero.id)
            if aiHeroes then
                local prof = tonumber(aiHeroes[hero.id]) or 30
                score = score * (0.62 + prof / 100 * 0.78)
            end
            score = score + math.random() * 0.06
            if score > bestScore then best, bestScore = hero, score end
        end
    end
    if not best then return nil end
    m.oppPicks[role] = best.id
    m.used[best.id] = true
    m.seriesUsed = m.seriesUsed or { my = {}, opp = {} }
    m.seriesUsed.opp[best.id] = true
    return best.id
end

--- 该位置可选英雄（含版本标记与选手熟练度）
function HeroSystem.GetRoleOptions(state, role)
    local m = HeroSystem.EnsureMatch(state)
    local out = {}
    for _, hero in ipairs(HeroCatalog.HEROES_BY_ROLE[role] or {}) do
        local isUsed = m.used[hero.id]
        local isSeriesUsed = m.seriesUsed and m.seriesUsed.my and m.seriesUsed.my[hero.id]
        if not isUsed then
            local prof = HeroSystem.GetRoleProficiency(state, role, hero.id)
            table.insert(out, {
                id = hero.id,
                name = hero.name,
                tag = hero.tag,
                proficiency = prof,
                version = HeroSystem.GetVersionPower(state, hero.id),
                seriesUsed = isSeriesUsed,  -- 全局BP 标记
            })
        end
    end
    table.sort(out, function(a, b)
        if a.version ~= b.version then return a.version > b.version end
        if a.proficiency ~= b.proficiency then return a.proficiency > b.proficiency end
        return a.name < b.name
    end)
    return out
end

--- 该位置在任选手对某英雄的最高熟练度
function HeroSystem.GetRoleProficiency(state, role, heroId)
    local RosterSystem = require("RosterSystem")
    local best = 0
    for _, entry in ipairs(RosterSystem.GetRosterPlayers(state)) do
        if entry.role == role then
            best = math.max(best, tonumber((entry.player.heroes or {})[heroId]) or 0)
        end
    end
    return best
end

--- 英雄 tag（用于克制/羁绊判定）
function HeroSystem.GetHeroTag(heroId)
    local hero = HeroCatalog.GetHero(heroId)
    return hero and hero.tag or nil
end

--- 克制矩阵（只读导出，供 UI 展示克制关系）
function HeroSystem.GetCounterMatrix()
    return COUNTER_MATRIX
end

--- 阵容组合定义（只读导出，供 BP 页展示）
function HeroSystem.GetSynergyCatalog()
    return SYNERGIES
end

--- 英雄宿敌判定（BP#142）：myHeroId 是否硬克制 oppHeroId（per-hero 级，凌驾 tag 矩阵）
--- 返回 "hard" / "hard_lose" / nil + 宿敌理由
function HeroSystem.GetHeroRival(myHeroId, oppHeroId)
    for _, r in ipairs(HERO_RIVALS) do
        if r.a == myHeroId and r.b == oppHeroId then return "hard", r.label end
        if r.b == myHeroId and r.a == oppHeroId then return "hard_lose", r.label end
    end
    return nil
end

--- 单对位克制判定：myHeroId 是否克制 oppHeroId
--- 优先英雄宿敌（硬克制），回退 tag 矩阵。返回 kind "win"/"lose"/"none" + 理由 + 是否硬克制
function HeroSystem.GetCounterHint(myHeroId, oppHeroId)
    local rival, rlabel = HeroSystem.GetHeroRival(myHeroId, oppHeroId)
    if rival == "hard" then return "win", "【克制】" .. rlabel, true end
    if rival == "hard_lose" then return "lose", "【被克】" .. rlabel, true end
    local myTag = HeroSystem.GetHeroTag(myHeroId)
    local oppTag = HeroSystem.GetHeroTag(oppHeroId)
    if myTag and oppTag then
        if COUNTER_MATRIX[myTag] and COUNTER_MATRIX[myTag].target == oppTag then
            return "win", COUNTER_MATRIX[myTag].label, false
        end
        if COUNTER_MATRIX[oppTag] and COUNTER_MATRIX[oppTag].target == myTag then
            return "lose", COUNTER_MATRIX[oppTag].label, false
        end
    end
    return "none", nil, false
end

--- 全队对位克制汇总：win/lose 计数、净加成 pct（上限 +-10%）、逐对位明细
function HeroSystem.GetCounterSummary(state)
    local m = HeroSystem.EnsureMatch(state)
    local win, lose = 0, 0
    local hardWin, hardLose = 0, 0
    local pairs = {}
    for _, role in ipairs(HeroCatalog.ROLES) do
        local myId = m.myPicks and m.myPicks[role]
        local oppId = m.oppPicks and m.oppPicks[role]
        if myId and oppId then
            local kind, label, hard = HeroSystem.GetCounterHint(myId, oppId)
            local myHero, oppHero = HeroCatalog.GetHero(myId), HeroCatalog.GetHero(oppId)
            table.insert(pairs, {
                role = role,
                my = myHero, opp = oppHero,
                kind = kind, label = label, hard = hard,
            })
            if kind == "win" then win = win + 1; if hard then hardWin = hardWin + 1 end end
            if kind == "lose" then lose = lose + 1; if hard then hardLose = hardLose + 1 end end
        end
    end
    -- BP#142：普通克制 首个 +2.5%、之后每个 +2%；被克 -1.5%/个；
    -- 硬克制（英雄宿敌）每个 +3.5%、被硬克 -2.2%；普通与硬克制分别计权；总上限 +-10%
    local normalWin = win - hardWin
    local normalLose = lose - hardLose
    local winRaw = (normalWin > 0) and (2.5 + (normalWin - 1) * 2) or 0
    winRaw = winRaw + hardWin * 3.5
    winRaw = math.min(winRaw, 10)
    local loseRaw = normalLose * 1.5 + hardLose * 2.2
    local pct = clamp(winRaw - loseRaw, -10, 10)
    local hardPct = clamp(hardWin * 3.5 - hardLose * 2.2, -10, 10)
    return { win = win, lose = lose, pct = pct, hardPct = hardPct, pairs = pairs }
end

--- BP#144 战术联动：根据我方 BP 阵容（英雄 tag / 版本强度 / 羁绊）推荐最契合的战术
--- 进攻型 tag 多 / 进攻羁绊 → 激进进攻；防守型 tag 多 / 防守羁绊 → 稳健防守；
--- 版本强势英雄多 → 版本答案；否则均衡。供 BP 后选战术参考与联动加成判定。
function HeroSystem.GetRecommendedTactic(state)
    local m = HeroSystem.EnsureMatch(state)
    local picks = m.myPicks or {}
    if not next(picks) then return "balanced" end
    -- Tag names are Chinese; Lua identifiers cannot be CJK, so they must be
    -- bracketed strings. Bare CJK keys are a syntax error in standard Lua
    -- (they only work on runtimes patched for UTF-8 identifiers).
    local OFF = { ["刺客"] = true, ["节奏"] = true, ["开团"] = true, ["爆发"] = true, ["收割"] = true }
    local DEF = { ["坦克"] = true, ["保护"] = true, ["控制"] = true, ["增益"] = true, ["视野"] = true }
    local off, def, strong = 0, 0, 0
    for _, role in ipairs(HeroCatalog.ROLES) do
        local hid = picks[role]
        if hid then
            local tag = HeroSystem.GetHeroTag(hid)
            if tag then
                if OFF[tag] then off = off + 1 end
                if DEF[tag] then def = def + 1 end
            end
            if HeroSystem.IsSeasonStrong(state, hid) then strong = strong + 1 end
        end
    end
    local syn = HeroSystem.GetActiveSynergies(state)
    local hasAggroSyn, hasDefSyn = false, false
    if syn and syn.active then
        for _, s in ipairs(syn.active) do
            if s.id == "assassin_raid" or s.id == "all_in" or s.id == "tempo" then hasAggroSyn = true end
            if s.id == "iron_wall" or s.id == "bulwark_3" or s.id == "bodyguard" then hasDefSyn = true end
        end
    end
    if off >= 3 or hasAggroSyn then return "aggressive" end
    if def >= 3 or hasDefSyn then return "defensive" end
    if strong >= 2 then return "metapick" end
    return "balanced"
end

--- 当前阵容激活的组合（羁绊）：返回 { active = {name,desc,pct,n,need}, total = 上限 15% }
function HeroSystem.GetActiveSynergies(state)
    local m = HeroSystem.EnsureMatch(state)
    local counts = {}
    for _, role in ipairs(HeroCatalog.ROLES) do
        local hid = m.myPicks and m.myPicks[role]
        if hid then
            local tag = HeroSystem.GetHeroTag(hid)
            if tag then counts[tag] = (counts[tag] or 0) + 1 end
        end
    end
    local active, total = {}, 0
    for _, s in ipairs(SYNERGIES) do
        local n = 0
        for _, tag in ipairs(s.tags) do n = n + (counts[tag] or 0) end
        if n >= s.need then
            table.insert(active, { id = s.id, name = s.name, desc = s.desc, pct = s.pct, n = n, need = s.need })
            total = total + s.pct
        end
    end
    return { active = active, total = math.min(total, SYNERGY_CAP) }
end

--- BP 优势评估：综合对位克制、阵容羁绊、版本强度，给出优势分与胜率估算（UI 优势条用）
--- 返回 { score, winProb, counterPct, synergy, versionAdv }
function HeroSystem.GetDraftScore(state)
    local m = HeroSystem.EnsureMatch(state)
    local cs = HeroSystem.GetCounterSummary(state)
    local syn = HeroSystem.GetActiveSynergies(state)
    local counterPct = (cs and cs.pct) or 0
    local synergy = (syn and syn.total) or 0
    -- 版本强度差：我方已选平均版本 - 对手已选平均版本
    local myVer, oppVer, n = 0, 0, 0
    for _, role in ipairs(HeroCatalog.ROLES) do
        local mid = m.myPicks and m.myPicks[role]
        local oid = m.oppPicks and m.oppPicks[role]
        if mid then myVer = myVer + HeroSystem.GetVersionPower(state, mid); n = n + 1 end
        if oid then oppVer = oppVer + HeroSystem.GetVersionPower(state, oid) end
    end
    local verAdv = n > 0 and (myVer - oppVer) / n or 0  -- 约 -0.5 .. +0.5
    local draft = counterPct + synergy + verAdv * 8
    draft = clamp(draft, -22, 22)
    local winProb = clamp(50 + draft * 1.4, 8, 92)
    return { score = draft, winProb = winProb, counterPct = counterPct, synergy = synergy, versionAdv = verAdv }
end

--- 调整阶段改选：绕过 BP 顺序 step 校验，直接覆盖某个已选位置（不触发 AI 自动选）
function HeroSystem.RepickHero(state, role, heroId)
    local m = HeroSystem.EnsureMatch(state)
    if not m.myPicks then return false, "尚未开始 BP" end
    local old = m.myPicks[role]
    if old == heroId then return false, "已是该英雄" end
    if m.used[heroId] then return false, "该英雄已被禁用/选取" end
    if m.seriesUsed and m.seriesUsed.my and m.seriesUsed.my[heroId] then
        return false, "全局BP：该英雄本系列赛已使用过"
    end
    local hero = HeroCatalog.GetHero(heroId)
    if not hero then return false, "英雄不存在" end
    if hero.role ~= role then
        return false, "英雄位置不匹配（" .. tostring(HeroCatalog.ROLE_LABELS[hero.role] or hero.role) .. "）"
    end
    if old then
        m.used[old] = nil
        if m.seriesUsed and m.seriesUsed.my then m.seriesUsed.my[old] = nil end
    end
    m.myPicks[role] = heroId
    m.used[heroId] = true
    m.seriesUsed = m.seriesUsed or { my = {}, opp = {} }
    m.seriesUsed.my[heroId] = true
    return true
end

--- 调整阶段清空某个已选位置（留出空位，可在 BP 收尾阶段补选）
function HeroSystem.ClearPick(state, role)
    local m = HeroSystem.EnsureMatch(state)
    local old = m.myPicks and m.myPicks[role]
    if not old then return false, "该位置未选" end
    m.myPicks[role] = nil
    m.used[old] = nil
    if m.seriesUsed and m.seriesUsed.my then m.seriesUsed.my[old] = nil end
    return true
end


--- BP 完成后的比赛战力：选手战力 x 英雄熟练度系数 x 版本系数 x 克制加成 x 组合加成 x 伤病/疲劳条件系数（P1-③）
function HeroSystem.GetMatchPower(state)
    state = CompanyState.Ensure(state)
    local RosterSystem = require("RosterSystem")
    local StaffSystem = require("StaffSystem")
    local MedicalSystem = require("MedicalSystem")
    local picks = state.match and state.match.myPicks or {}
    local metaRole = state.meta and state.meta.role
    local total = 0
    for _, entry in ipairs(RosterSystem.GetRosterPlayers(state)) do
        local heroId = picks[entry.role]
        local base = RosterSystem.GetPlayerPower(entry.player, metaRole)
        local factor = 1.0
        if heroId then
            local prof = tonumber((entry.player.heroes or {})[heroId]) or 30
            factor = (0.62 + prof / 100 * 0.78) * HeroSystem.GetVersionPower(state, heroId)
        else
            factor = 0.8 -- 未选英雄惩罚
        end
        local cond = MedicalSystem.GetConditionFactor(entry.player) -- 疲劳衰减 + 带伤作战
        total = total + base * factor * cond
    end
    local counter = HeroSystem.GetCounterSummary(state)
    local synergy = HeroSystem.GetActiveSynergies(state)
    local tacticsBonus = 1 + counter.pct / 100 + synergy.total / 100
    local chemistryBonus = 1 + state.roster.chemistry / 200
    local coachBonus = StaffSystem.GetCoachBonus(state)
    local power = total * tacticsBonus * chemistryBonus * coachBonus
    -- P2-⑦ 主客场修正
    local HomeAwaySystem = require("HomeAwaySystem")
    local homeAwayMul = HomeAwaySystem.GetPowerMul(state, "legacy")
    power = power * homeAwayMul
    return math.floor(power + 0.5)
end

-- ============ 训练练英雄 ============

--- 英雄特训：提升全队英雄熟练度，bonus 时概率掌握新英雄
function HeroSystem.TrainHeroes(state, bonus)
    state = CompanyState.Ensure(state)
    local RosterSystem = require("RosterSystem")
    local gained = {}
    for _, entry in ipairs(RosterSystem.GetRosterPlayers(state)) do
        local player = entry.player
        player.heroes = player.heroes or HeroSystem.RollPool(player)
        local heroId, prof = nil, 101
        for hid, p in pairs(player.heroes) do
            if p < prof then heroId, prof = hid, p end
        end
        if heroId then
            local seasonBonus = HeroSystem.IsSeasonStrong(state, heroId) and SEASON_BOOST or 0
            player.heroes[heroId] = clamp(prof + 14 + seasonBonus + (bonus or 0), 0, 100)
            local hero = HeroCatalog.GetHero(heroId)
            gained[#gained + 1] = player.name .. "·" .. tostring(hero and hero.name or heroId) .. (seasonBonus > 0 and "（赛季加强）" or "")
        end
        -- 已有 5+ 英雄且随机触发：练新英雄
        local count = 0
        for _ in pairs(player.heroes) do count = count + 1 end
        if count < 6 and math.random() < 0.25 + (bonus or 0) / 10 then
            local pool = HeroCatalog.HEROES_BY_ROLE[player.role] or {}
            for _, hero in ipairs(pool) do
                if not player.heroes[hero.id] then
                    player.heroes[hero.id] = 35
                    gained[#gained + 1] = player.name .. "·新英雄 " .. hero.name
                    break
                end
            end
        end
    end
    return gained
end

return HeroSystem
