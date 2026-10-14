-- CareerArcSystem：选手生涯剧情（机制 D）
-- 每周有概率触发某阵容选手的生涯剧情：爆发 / 低谷 / 伤病复出 / 续约风波
-- 玩家做选择，影响士气、状态、现金、合同年限；剧情未处理会持续产生后果。
local CompanyState = require("CompanyState")
local LeagueCatalog = require("LeagueCatalog")
local RosterSystem = require("RosterSystem")

local CareerArcSystem = {}

local function clamp(value, minimum, maximum)
    value = tonumber(value) or 0
    if value < minimum then return minimum end
    if value > maximum then return maximum end
    return value
end

local ARC_TYPES = {
    breakout = { label = "爆发赛季", emoji = "爆发", desc = "状态火热，数据爆炸，身价飙升" },
    slump    = { label = "低谷期",   emoji = "低谷", desc = "手感全无，状态下滑，亟需调整" },
    injury   = { label = "伤病复出", emoji = "伤愈", desc = "伤愈归队，需要找回比赛节奏" },
    contract = { label = "续约风波", emoji = "续约", desc = "合同年，经纪人对待遇颇有微词" },
}

-- 平衡可调参数（机制 D 频率调节点）
local ARC_WEEKLY_CHANCE  = 0.10   -- 每名合格选手每周触发新剧情的概率（太稀→调 0.12~0.15）
local ARC_MAX_ACTIVE     = 3      -- 同时进行的剧情上限
local ARC_BASE_DURATION = 3       -- 单个剧情默认持续周数（超时自动结算）

-- 每类剧情的选项（effects 在 Choose 中应用）
local ARC_CHOICES = {
    breakout = {
        { id = "train", label = "加练特训", desc = "状态 +8，士气 +5", form = 8, morale = 5 },
        { id = "rest",  label = "适度保护", desc = "状态 +3，避免伤病风险", form = 3 },
    },
    slump = {
        { id = "counsel", label = "心理辅导", desc = "花 ¥40万，士气 +12，状态 +4", cost = 40, morale = 12, form = 4 },
        { id = "bench",   label = "下放替补", desc = "状态 +6，但士气 -6", form = 6, morale = -6 },
        { id = "push",    label = "强行首发", desc = "赌一把：状态 +10 或 -5", gamble = { up = 10, down = 5 } },
    },
    injury = {
        { id = "cautious", label = "谨慎复出", desc = "状态 +6，无风险", form = 6 },
        { id = "force",    label = "强行上场", desc = "状态 +10，但 25% 几率再次受伤（状态 -15）", form = 10, riskReinjury = 0.25 },
    },
    contract = {
        { id = "raise",    label = "满足加薪", desc = "花 ¥120万，士气 +15", cost = 120, morale = 15 },
        { id = "cold",     label = "冷处理",   desc = "省 ¥120万，但士气 -10，有离队风险", morale = -10, riskLeave = 0.3 },
        { id = "longterm", label = "谈长约",   desc = "合同 +1 年，士气 +5", contractYears = 1, morale = 5 },
    },
}

function CareerArcSystem.Ensure(state)
    state = CompanyState.Ensure(state)
    state.careerArcs = state.careerArcs or {}
    state.careerArcs.active = state.careerArcs.active or {}
    state.careerArcs.log = state.careerArcs.log or {}
    return state
end

local function arcIdFor(playerId, type)
    return playerId .. "_" .. type
end

local function eligiblePlayers(state)
    local out = {}
    for _, e in ipairs(RosterSystem.GetRosterPlayers(state)) do
        table.insert(out, e.player)
    end
    return out
end

--- 每周滚动：触发新剧情 / 推进已有剧情
function CareerArcSystem.RollWeekly(state)
    state = CareerArcSystem.Ensure(state)
    local active = state.careerArcs.active
    -- 推进已存在剧情：忽略型剧情会缓慢产生士气惩罚
    for pid, arc in pairs(active) do
        arc.week = (tonumber(arc.week) or 0) + 1
        if arc.week >= (arc.duration or ARC_BASE_DURATION) then
            -- 超时未处理：自动以最保守选项结算（轻微负面，促使玩家及时关注）
            local p = LeagueCatalog.GetPlayer(arc.playerId)
            if p then p.morale = math.max(0, (tonumber(p.morale) or 60) - 5) end
            CareerArcSystem.Resolve(state, pid, (ARC_CHOICES[arc.type] and ARC_CHOICES[arc.type][1].id) or "default", true)
        end
    end
    -- 触发新剧情（每周最多新增 1 个，最多并存 3 个）
    local count = 0
    for _, _ in pairs(active) do count = count + 1 end
    if count >= ARC_MAX_ACTIVE then return state end
    local players = eligiblePlayers(state)
    for _, p in ipairs(players) do
        if count >= ARC_MAX_ACTIVE then break end
        local pid = p.id
        local has = false
        for t, _ in pairs(ARC_TYPES) do
            if active[arcIdFor(pid, t)] then has = true break end
        end
        if not has and math.random() < ARC_WEEKLY_CHANCE then
            local types = {}
            for k, _ in pairs(ARC_TYPES) do table.insert(types, k) end
            local type = types[math.random(#types)]
            active[arcIdFor(pid, type)] = {
                playerId = pid,
                type = type,
                week = 0,
                duration = ARC_BASE_DURATION,
            }
            count = count + 1
        end
    end
    return state
end

--- 当前活动剧情（供 UI）
function CareerArcSystem.GetActiveArcs(state)
    state = CareerArcSystem.Ensure(state)
    local out = {}
    for pid, arc in pairs(state.careerArcs.active) do
        local p = LeagueCatalog.GetPlayer(arc.playerId)
        local def = ARC_TYPES[arc.type] or { label = arc.type, emoji = "其他", desc = "" }
        local choices = {}
        for _, c in ipairs(ARC_CHOICES[arc.type] or {}) do
            table.insert(choices, { id = c.id, label = c.label, desc = c.desc })
        end
        table.insert(out, {
            id = pid,
            playerId = arc.playerId,
            playerName = p and p.name or arc.playerId,
            type = arc.type,
            label = def.label,
            emoji = def.emoji,
            desc = def.desc,
            choices = choices,
        })
    end
    return out
end

--- 取某选手当前活动剧情（供花名册徽标）
function CareerArcSystem.GetArcForPlayer(state, playerId)
    state = CareerArcSystem.Ensure(state)
    for t, _ in pairs(ARC_TYPES) do
        local a = state.careerArcs.active[playerId .. "_" .. t]
        if a then
            return { type = t, emoji = (ARC_TYPES[t] or {}).emoji or "其他", label = (ARC_TYPES[t] or {}).label or t }
        end
    end
    return nil
end

--- 玩家选择某个剧情的选项；auto=true 时为超时自动结算
function CareerArcSystem.Resolve(state, arcId, optionId, auto)
    state = CareerArcSystem.Ensure(state)
    local arc = state.careerArcs.active[arcId]
    if not arc then return { ok = false, text = "该剧情已结算" } end
    local type = arc.type
    local choices = ARC_CHOICES[type] or {}
    local opt = nil
    for _, c in ipairs(choices) do if c.id == optionId then opt = c break end end
    if not opt then opt = choices[1] end
    local p = LeagueCatalog.GetPlayer(arc.playerId)
    local effects = {}
    local ok = true
    local text = ""

    -- 现金
    if opt.cost and opt.cost > 0 then
        if state.company.cash >= opt.cost then
            state.company.cash = state.company.cash - opt.cost
            table.insert(effects, "现金 -" .. tostring(opt.cost) .. "万")
        else
            -- 现金不足，降级为保守处理
            opt = choices[1]
            table.insert(effects, "现金不足，按保守方案处理")
        end
    end
    -- 状态
    if opt.form and p then
        local f = opt.form
        if opt.gamble then
            f = math.random() < 0.5 and opt.gamble.up or -opt.gamble.down
        end
        p.form = clamp(p.form + f, 0, 100)
        table.insert(effects, "状态 " .. (f >= 0 and "+" or "") .. tostring(f))
    end
    -- 士气
    if opt.morale and p then
        p.morale = clamp(p.morale + opt.morale, 0, 100)
        table.insert(effects, "士气 " .. (opt.morale >= 0 and "+" or "") .. tostring(opt.morale))
    end
    -- 合同年限
    if opt.contractYears and opt.contractYears > 0 then
        state.roster.contracts[arc.playerId] = (state.roster.contracts[arc.playerId] or 1) + opt.contractYears
        table.insert(effects, "合同 +" .. tostring(opt.contractYears) .. " 年")
    end
    -- 风险：再次受伤
    if opt.riskReinjury and math.random() < opt.riskReinjury and p then
        p.form = clamp(p.form - 15, 0, 100)
        table.insert(effects, " 再次受伤，状态 -15")
    end
    -- 风险：离队
    if opt.riskLeave and math.random() < opt.riskLeave then
        -- 经纪人不满，下赛季续约意愿下降（用 desire 表示）
        state.roster.desire[arc.playerId] = math.max(0, (state.roster.desire[arc.playerId] or 15) - 20)
        table.insert(effects, " 离队风险上升")
    end

    text = (auto and "【超时自动处理】" or "") .. (p and p.name or "选手") .. " 的" .. (ARC_TYPES[type] and ARC_TYPES[type].label or type) .. "已了结"
    table.insert(state.careerArcs.log, {
        week = state.company.week,
        player = p and p.name or arc.playerId,
        type = type,
        text = text,
        auto = auto or false,
    })
    state.careerArcs.active[arcId] = nil
    return { ok = ok, text = text, effects = effects, playerName = p and p.name or arc.playerId }
end

return CareerArcSystem
