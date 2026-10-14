-- DraftSystem：选秀大会（#45）
-- 选手生态（PLAYER_ECOSYSTEM）与转会扩展（TRANSFER_EXPANSION）的共用「获取入口」：
--   新秀展示 + 逆袭签，做成赛季节点事件；新秀自带随机人格 + 品牌起点。
-- 设计原则：叠加层，不重造轮子。
--   - 新秀注册进 LeagueCatalog.PLAYERS（与 customPlayers 同一引用，训练/老化会持久化）
--   - 持久化：新秀对象存于 state.draft.registry（序列化进存档），main.lua 重载时重新注册
--   - 人格 / 品牌起点由 PlayerEcoSystem.GetEco 懒生成（确定性种子，同一新秀稳定）

local CompanyState = require("CompanyState")
local LeagueCatalog = require("LeagueCatalog")
local PlayerEcoSystem = require("PlayerEcoSystem")

local DraftSystem = {}

local ROLES = { "top", "jungle", "mid", "adc", "support" }

-- 新秀命名池（电竞感代号）
local NAME_POOL = {
    "Kaze", "Vortex", "Quill", "Onyx", "Blitz", "Nyx", "Rio", "Ace",
    "Frost", "Talon", "Echo", "Sol", "Jin", "Mira", "Kor", "Vanta",
    "Dex", "Fen", "Yuki", "Rune", "Zane", "Lume", "Pike", "Sable",
    "Cobalt", "Vesper", "Kite", "Drift", "Ember", "Halcyon",
}

-- 全局自增 uid：保证跨赛季 id 永不重复（避免覆盖已签新秀）
local _uid = 0
local function nextId()
    _uid = _uid + 1
    return "p_draft_" .. tostring(_uid)
end

local function ovr(player)
    return math.floor(((player.mechanics or 0) + (player.laning or 0) + (player.teamfight or 0)) / 3 + 0.5)
end
DraftSystem.OVR = ovr

function DraftSystem.GetDraft(state)
    state = CompanyState.Ensure(state)
    state.draft = state.draft or { open = false, pool = {}, signed = {}, registry = {}, picksLeft = 0, season = 0 }
    state.draft.registry = state.draft.registry or {}
    state.draft.pool = state.draft.pool or {}
    state.draft.signed = state.draft.signed or {}
    return state.draft
end

function DraftSystem.IsOpen(state)
    local d = state.draft
    return d and d.open == true
end

-- 赛季节点触发：生成新秀池
function DraftSystem.OpenDraft(state)
    state = CompanyState.Ensure(state)
    local d = DraftSystem.GetDraft(state)
    local season = tonumber(state.company.seasons) or 1
    -- 清空上一届未签的池（已签的新秀保留在 registry + 阵容中）
    for _, pid in ipairs(d.pool or {}) do
        if not d.signed[pid] then
            d.registry[pid] = nil
            LeagueCatalog.PLAYERS[pid] = nil
        end
    end
    d.pool = {}
    d.signed = {}
    d.season = season

    -- 本届新秀数量：6~8
    local count = 6 + math.random(0, 2)
    -- 角色池：尽量覆盖多个位置
    local roleBag = {}
    for i = 1, count do
        table.insert(roleBag, ROLES[((i - 1) % #ROLES) + 1])
    end
    -- 打乱角色分配（轻度）
    for i = #roleBag, 2, -1 do
        local j = math.random(1, i)
        roleBag[i], roleBag[j] = roleBag[j], roleBag[i]
    end

    local usedNames = {}
    local gemIdx = math.random(1, count) -- 本届「潜力黑马」逆袭签
    for i = 1, count do
        local role = roleBag[i]
        -- 取一个未用过的名字
        local name
        repeat
            name = NAME_POOL[math.random(1, #NAME_POOL)]
        until not usedNames[name]
        usedNames[name] = true

        local id = nextId()
        local age = 17 + math.random(0, 2) -- 17~19
        local potential = 78 + math.random(0, 14) -- 78~92 高上限
        local base = 44 + math.random(0, 12) -- 当前偏弱，是养成项目
        local isGem = (i == gemIdx)
        local player = {
            id = id,
            name = name,
            role = role,
            age = age,
            mechanics = base + math.random(-3, 3),
            laning = base + math.random(-3, 3),
            teamfight = base + math.random(-3, 3),
            form = 60,
            potential = potential + (isGem and 2 or 0),
            salary = 3 + math.random(0, 3), -- 年轻便宜
            buyout = 0,
            recentForm = 0,
            morale = 60,
            draftGem = isGem, -- 逆袭签标记：签下时给一次性养成加成
        }
        -- 持久化：registry 与 LeagueCatalog 同一引用（训练/老化会写回 registry，随存档保留）
        d.registry[id] = player
        LeagueCatalog.RegisterPlayer(player)
        table.insert(d.pool, id)
    end

    d.picksLeft = 2 -- 每届最多签 2 名新秀
    d.open = true
    CompanyState.RecordTimeline(state, "选秀大会",
        "新赛季选秀大会开放，(" .. tostring(count) .. " 名新秀参选，本届最多签下 2 人。")
    return d
end

-- 返回本届新秀 player 对象列表
function DraftSystem.GetPoolPlayers(state)
    local d = DraftSystem.GetDraft(state)
    local out = {}
    for _, pid in ipairs(d.pool or {}) do
        local p = LeagueCatalog.GetPlayer(pid) or d.registry[pid]
        if p then table.insert(out, p) end
    end
    return out
end

-- 签下新秀：直接入队（绕过经纪人门槛，保证选秀事件必定可签），优先替补席，满则落空位首发
function DraftSystem.PickRookie(state, playerId)
    state = CompanyState.Ensure(state)
    local d = DraftSystem.GetDraft(state)
    if not d.open then return false, "选秀大会已结束" end
    if d.signed[playerId] then return false, "该新秀已被你签下" end
    if (d.picksLeft or 0) <= 0 then return false, "本届签约次数已用完（最多 2 人）" end
    local player = LeagueCatalog.GetPlayer(playerId) or d.registry[playerId]
    if not player then return false, "选手不存在" end

    -- 逆袭签：潜力黑马给一次性养成加成
    if player.draftGem then
        player.mechanics = math.min(99, (player.mechanics or 0) + 2)
        player.laning = math.min(99, (player.laning or 0) + 2)
        player.teamfight = math.min(99, (player.teamfight or 0) + 2)
        player.potential = math.min(99, (player.potential or 0) + 1)
    end

    -- 小额签约费（新秀身价低，费用很便宜）
    local MarketSystem = require("MarketSystem")
    local fee = math.max(1, math.floor(MarketSystem.GetMarketValue(state, playerId) * 0.5))
    if state.company.cash < fee then
        return false, "现金不足，无法支付签约费（¥" .. tostring(fee) .. "万）"
    end

    -- 找替补空位
    local slot = nil
    for s, pid in pairs(state.roster.bench) do
        if not pid or pid == "" then slot = slot or s end
    end
    local placed
    if slot then
        state.roster.bench[slot] = playerId
        placed = "替补席"
    elseif state.roster.players[player.role] == "" then
        state.roster.players[player.role] = playerId
        placed = "首发"
    else
        return false, "替补席与对应首发位均已满，无法签下"
    end

    state.company.cash = state.company.cash - fee
    state.roster.contracts[playerId] = LeagueCatalog.GetContractYears(playerId)
    state.roster.desire[playerId] = 15 + math.random(0, 15)
    state.roster.buyouts[playerId] = nil
    player.morale = 60

    d.signed[playerId] = true
    d.picksLeft = (d.picksLeft or 0) - 1
    CompanyState.RecordTimeline(state, "选秀签约",
        "选秀大会签下新秀 " .. player.name .. (player.draftGem and "（潜力黑马 · 逆袭签）" or "") .. "，进入" .. placed .. "。")
    return true, "已签下 " .. player.name .. "（进入" .. placed .. "）"
end

function DraftSystem.CloseDraft(state)
    state = CompanyState.Ensure(state)
    local d = DraftSystem.GetDraft(state)
    -- 关闭后，移除本届未签的新秀（已签的保留在 registry + 阵容中）
    for _, pid in ipairs(d.pool or {}) do
        if not d.signed[pid] then
            d.registry[pid] = nil
            LeagueCatalog.PLAYERS[pid] = nil
        end
    end
    d.open = false
    d.pool = {}
    return state
end

-- 重载存档时重新注册已签（或历史）新秀到 LeagueCatalog
function DraftSystem.Rehydrate(state)
    state = CompanyState.Ensure(state)
    local d = state.draft
    if not d or not d.registry then return end
    for pid, player in pairs(d.registry) do
        -- 同一引用重新挂回 LeagueCatalog，确保阵容引用有效
        LeagueCatalog.PLAYERS[pid] = player
        if LeagueCatalog.CONTRACT_YEARS[pid] == nil then
            LeagueCatalog.CONTRACT_YEARS[pid] = LeagueCatalog.CONTRACT_YEARS[pid] or (player.contractYears or 2)
        end
    end
end

return DraftSystem
