-- secondline/State.lua — 第二游戏线独立状态（选手生涯模式）
-- 隔离原则（见 SECONDLINE_DESIGN.md §5）：
--  * 不 require CompanyState / CompetitionSystem / StockSystem（绝不共享游戏逻辑状态）
--  * 独立存档槽 saves/secondline_slot.json，与主线 esports_tycoon.json 互不串档
--  * 唯一受控例外：经 secondline/Bridge.lua 单向只读引用主线（见 §5.6），本文件不负责桥接
local SecondLineState = {}

local SAVE_PATH = "saves/secondline_slot.json"
local GAME = "secondline_career"

-- 成长弧阶段（青训新秀 → 替补 → 首发 → 明星 → 传奇）
SecondLineState.ARC_STAGES = {
    { id = "rookie",  label = "青训新秀" },
    { id = "sub",     label = "替补席" },
    { id = "starter", label = "首发主力" },
    { id = "star",    label = "明星选手" },
    { id = "legend",  label = "传奇殿堂" },
}

local state_ = nil

function SecondLineState.NewGame(opts)
    opts = opts or {}
    local name = opts.name and opts.name ~= "" and opts.name or "无名新秀"
    local fresh = {
        schemaVersion = 1,
        game = GAME,
        player = {
            name = name,
            role = opts.role and opts.role ~= "" and opts.role or "mid",
            arc = "rookie",          -- 当前成长弧阶段（见 ARC_STAGES）
            mechanics = 58, teamfight = 58, laning = 58,
            form = 68, potential = 80,
            age = 17,
            reputation = 10,         -- 个人声望
            stamina = 100,           -- 体力（日常训练消耗）
            morale = 60,             -- 状态 / 心态
            adPoints = 0,            -- 属性点（广告领，训练时 +1 加速）
            weeks = 0,               -- 已度过周数
            season = 1,
        },
        career = {
            matches = 0,
            wins = 0,
            titles = 0,
            storyFlags = {},         -- 招牌玩法 D：生涯剧情触发标记
            lastMatch = nil,         -- 最近一场周赛结果（主页/周赛页展示）
            dynasty = {              -- 招牌玩法 B：传承 / 名人堂记录
                transferred = 0,     -- 转会次数
                reSigned = 0,        -- 续约次数
                hallOfFame = {},     -- 退役传奇落档（影响后续世代占位）
            },
            transferPending = false, -- 赛季末转会窗是否开启
        },
        meta = {
            createdAt = 0,
        },
    }
    state_ = fresh
    return fresh
end

function SecondLineState.GetState()
    return state_
end

function SecondLineState.SetState(state)
    state_ = state
    return state_
end

-- 注：本函数不钩接 CompetitionSystem.AdvanceWeek（见 §4 决策）。
-- 生涯模式独立周推进，仅经 Bridge 只读引用主线赛果用于叙事呈现。
function SecondLineState.AdvanceWeek()
    if not state_ then return nil end
    local p = state_.player
    p.weeks = (tonumber(p.weeks) or 0) + 1
    p.stamina = 100
    -- 每 48 周一个赛季：赛季推进时年龄 +1（成长弧推进在 M2 接入）
    if p.weeks >= (tonumber(p.season) or 1) * 48 then
        p.season = (tonumber(p.season) or 1) + 1
        p.age = math.min(40, (tonumber(p.age) or 17) + 1)
        state_.career.transferPending = true   -- 赛季末开启转会窗
    end
    return state_
end

function SecondLineState.Save()
    if not state_ then return false, "no state" end
    local fs = fileSystem
    if not fs then return false, "no filesystem" end
    fs:CreateDir("saves")
    local file = File(SAVE_PATH, FILE_WRITE)
    if not file:IsOpen() then return false, "cannot open save" end
    file:WriteString(cjson.encode(state_))
    file:Close()
    return true
end

function SecondLineState.Load()
    local fs = fileSystem
    if not fs or not fs:FileExists(SAVE_PATH) then return nil end
    local file = File(SAVE_PATH, FILE_READ)
    if not file:IsOpen() then return nil end
    local text = file:ReadString()
    file:Close()
    local ok, state = pcall(cjson.decode, text)
    if not ok or type(state) ~= "table" then return nil end
    if state.game ~= GAME or tonumber(state.schemaVersion) ~= 1 then return nil end
    state_ = state
    return state
end

function SecondLineState.Exists()
    return fileSystem and fileSystem:FileExists(SAVE_PATH)
end

function SecondLineState.Delete()
    if not fileSystem or not fileSystem:FileExists(SAVE_PATH) then return false end
    fileSystem:Delete(SAVE_PATH)
    state_ = nil
    return true
end

-- 成长弧阶段中文标签（公开助手，供各屏复用）
function SecondLineState.ArcLabel(arcId)
    for _, s in ipairs(SecondLineState.ARC_STAGES) do
        if s.id == arcId then return s.label end
    end
    return "青训新秀"
end

-- 预估个人评分：三属性均值 70% + 状态 30%
function SecondLineState.GetRating()
    local p = state_ and state_.player
    if not p then return 0 end
    local raw = ((tonumber(p.mechanics) or 0) + (tonumber(p.teamfight) or 0) + (tonumber(p.laning) or 0)) / 3
    return math.floor(raw * 0.7 + (tonumber(p.form) or 0) * 0.3)
end

-- 日常训练：attr ∈ mechanics/teamfight/laning；intensity ∈ light/normal/hard
-- 消耗体力、按潜力封顶成长；属性点（广告）可 +1 加速。绝不写 CompanyState。
function SecondLineState.Train(attr, intensity)
    local st = state_
    if not st then return nil, "no state" end
    local p = st.player
    if p.stamina < 10 then return nil, "体力不足" end
    local valid = { mechanics = true, teamfight = true, laning = true }
    if not valid[attr] then return nil, "invalid attr" end
    local cost = intensity == "hard" and 30 or (intensity == "normal" and 20 or 10)
    local gainBase = intensity == "hard" and 3 or (intensity == "normal" and 2 or 1)
    local cur = tonumber(p[attr]) or 0
    local cap = math.max(cur, tonumber(p.potential) or 80)
    local room = cap - cur
    local gain = math.max(0, math.min(gainBase, room))
    local boost = (tonumber(p.adPoints) or 0) > 0 and 1 or 0
    if boost > 0 then p.adPoints = (tonumber(p.adPoints) or 0) - 1 end
    p[attr] = cur + gain + boost
    p.stamina = math.max(0, p.stamina - cost)
    p.morale = math.min(100, (tonumber(p.morale) or 0) + 1)
    return { attr = attr, gain = gain, boost = boost, newVal = p[attr], stamina = p.stamina }
end

-- 招牌玩法 D（选手生涯剧情）：每周赛后追加剧情标记（占位叙事池）
function SecondLineState._MaybeStory(st, rating, win)
    local p = st.player
    local pool = {
        win and { "高光时刻", "你在关键团战完成三杀，全场欢呼。" }
            or { "低谷反思", "本场表现挣扎，你在更衣室独自加练到深夜。" },
        (rating >= 85) and { "封神之夜", "解说高喊你的名字，社媒瞬间刷屏。" } or nil,
        ((tonumber(p.reputation) or 0) >= 60) and { "商业价值", "多家品牌递来代言合约，经纪人笑开了花。" } or nil,
    }
    for _, beat in ipairs(pool) do
        if beat then
            table.insert(st.career.storyFlags, {
                week = tonumber(p.weeks) or 0,
                season = tonumber(p.season) or 1,
                title = beat[1],
                text = beat[2],
            })
        end
    end
    while #st.career.storyFlags > 60 do table.remove(st.career.storyFlags, 1) end
end

-- 成长弧推进：依据声望阈值晋升阶段
function SecondLineState._MaybeArc(st)
    local p = st.player
    local order = { "rookie", "sub", "starter", "star", "legend" }
    local idx = 1
    for i, id in ipairs(order) do if id == p.arc then idx = i break end end
    local need = { rookie = 0, sub = 30, starter = 55, star = 80, legend = 100 }
    while idx < #order and (tonumber(p.reputation) or 0) >= (need[order[idx + 1]] or 999) do
        idx = idx + 1
    end
    p.arc = order[idx]
end

function SecondLineState._PromoteArc(st)
    local order = { "rookie", "sub", "starter", "star", "legend" }
    local idx = 1
    for i, id in ipairs(order) do if id == st.player.arc then idx = i break end end
    if idx < #order then st.player.arc = order[idx + 1] end
end

-- 周赛表现：选手属性 → 个人评分 → 影响声望；推进一周（独立，不钩 CompetitionSystem）
function SecondLineState.PlayMatch()
    local st = state_
    if not st then return nil, "no state" end
    local p = st.player
    local c = st.career
    if p.stamina < 40 then return nil, "体力不足，无法出战" end
    local rating = SecondLineState.GetRating()
    local win = rating >= 70
    c.matches = (tonumber(c.matches) or 0) + 1
    if win then c.wins = (tonumber(c.wins) or 0) + 1 end
    p.reputation = math.min(100, (tonumber(p.reputation) or 0) + (win and 4 or 1))
    p.form = math.max(40, (tonumber(p.form) or 0) - 6)
    p.stamina = math.max(0, p.stamina - 40)
    SecondLineState.AdvanceWeek()
    SecondLineState._MaybeStory(st, rating, win)
    SecondLineState._MaybeArc(st)
    c.lastMatch = { rating = rating, win = win, week = tonumber(p.weeks) or 0, season = tonumber(p.season) or 1 }
    return { rating = rating, win = win, reputation = p.reputation, matches = c.matches, wins = c.wins }
end

-- 赛季转会窗（赛季末开启）：choice = "stay" 续约 / "transfer" 转会（需声望≥60）
function SecondLineState.SeasonTransfer(choice)
    local st = state_
    if not st or not st.career.transferPending then return nil, "转会窗未开启" end
    local p = st.player
    if choice == "transfer" and (tonumber(p.reputation) or 0) >= 60 then
        SecondLineState._PromoteArc(st)
        st.career.dynasty.transferred = (st.career.dynasty.transferred or 0) + 1
    else
        st.career.dynasty.reSigned = (st.career.dynasty.reSigned or 0) + 1
    end
    st.career.transferPending = false
    return { choice = choice, arc = p.arc }
end

-- 招牌玩法 B（王朝传承）：退役/封神时落档名人堂（占位：影响后续世代）
function SecondLineState.RecordLegacy()
    local st = state_
    if not st then return nil, "no state" end
    local p = st.player
    if (tonumber(p.age) or 17) < 40 and p.arc ~= "legend" then
        return nil, "尚未达到传承条件"
    end
    table.insert(st.career.dynasty.hallOfFame, {
        name = p.name,
        arc = p.arc,
        titles = tonumber(p.titles) or 0,
        peakRep = tonumber(p.reputation) or 0,
    })
    return { entry = #st.career.dynasty.hallOfFame }
end

return SecondLineState
