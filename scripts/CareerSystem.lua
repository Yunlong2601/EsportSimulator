-- 选手生涯系统：一年 48 周赛历、年龄阶段（新秀/巅峰/下滑/暮年）、
-- 赛季末成长漂移、退役与 AI 代际更替。供 CompanyState/RosterSystem/UI 复用。
local CompanyState = require("CompanyState")
local LeagueCatalog = require("LeagueCatalog")

local CareerSystem = {}

local function clamp(value, minimum, maximum)
    return math.max(minimum, math.min(maximum, tonumber(value) or minimum))
end

-- 生涯阶段：≤20 新秀（潜力加速成长） / 21-25 巅峰 / 26-28 下滑 / ≥29 暮年
function CareerSystem.GetStage(player)
    local age = tonumber(player and player.age) or 21
    if age <= 20 then return "rookie" end
    if age <= 25 then return "prime" end
    if age <= 28 then return "decline" end
    return "late"
end

CareerSystem.STAGE_LABELS = {
    rookie = { label = "新秀期", short = "新秀" },
    prime = { label = "巅峰期", short = "巅峰" },
    decline = { label = "下滑期", short = "下滑" },
    late = { label = "暮年期", short = "暮年" },
}

function CareerSystem.GetStageLabel(player)
    local cfg = CareerSystem.STAGE_LABELS[CareerSystem.GetStage(player)]
    return cfg and cfg.label or "巅峰期"
end

-- 属性上限随年龄收紧：新秀可小超潜力，暮年上限显著下降
function CareerSystem.GetAttributeCap(player)
    local potential = tonumber(player and player.potential) or 70
    local stage = CareerSystem.GetStage(player)
    if stage == "rookie" then return math.min(100, potential + 3) end
    if stage == "prime" then return math.min(100, potential + 1) end
    if stage == "decline" then return math.max(40, potential - 4) end
    return math.max(35, potential - 9)
end

-- 训练收益修正：新秀 1.5 倍、巅峰 1.0、下滑 0.65、暮年 0.35
function CareerSystem.GetTrainingModifier(player)
    local stage = CareerSystem.GetStage(player)
    if stage == "rookie" then return 1.5 end
    if stage == "prime" then return 1.0 end
    if stage == "decline" then return 0.65 end
    return 0.35
end

function CareerSystem.GetAnnualSalary(player)
    return (tonumber(player and player.salary) or 0) * CompanyState.YEAR_WEEKS
end

-- 赛季末生涯漂移：新秀向潜力成长；下滑/暮年按年龄递减
function CareerSystem.Drift(player)
    local stage = CareerSystem.GetStage(player)
    local cap = CareerSystem.GetAttributeCap(player)
    local stats = { "mechanics", "teamfight", "laning" }
    if stage == "rookie" then
        for _, key in ipairs(stats) do
            local v = tonumber(player[key]) or 60
            if v < cap and math.random() < 0.55 then
                player[key] = math.min(cap, v + math.random(1, 2))
            end
        end
        player.form = clamp((tonumber(player.form) or 70) + math.random(0, 2), 0, 100)
    elseif stage == "decline" then
        for _, key in ipairs(stats) do
            local v = tonumber(player[key]) or 60
            player[key] = math.max(30, v - math.random(1, 2))
        end
        player.form = clamp((tonumber(player.form) or 70) - math.random(1, 2), 0, 100)
    elseif stage == "late" then
        for _, key in ipairs(stats) do
            local v = tonumber(player[key]) or 60
            player[key] = math.max(25, v - math.random(2, 4))
        end
        player.form = clamp((tonumber(player.form) or 70) - math.random(2, 4), 0, 100)
    end
end

-- 退役判定：满 30 岁强制退役（到龄即退，逼玩家持续买入新血）
function CareerSystem.WillRetire(player)
    local age = tonumber(player and player.age) or 21
    if age >= 30 then return true end
    return false
end

-- 赛季末结算：全市场选手年龄 +1 并漂移；AI 老将退役即新秀顶替；退役选手清阵容并写入名人堂
function CareerSystem.AgeSeason(state)
    state = CompanyState.Ensure(state)
    local retiredList = {}
    for id, player in pairs(LeagueCatalog.PLAYERS) do
        player.age = tonumber(player.age) or 21
        player.age = player.age + 1
        CareerSystem.Drift(player)
        if not player.retired and CareerSystem.WillRetire(player) then
            player.retired = true
            table.insert(retiredList, player)
        end
    end
    -- AI agent 选手：年龄/漂移 + 退役即新秀顶替（代际更替，战力按退役时水平生成）
    local AISystem = require("AISystem")
    local replaced = 0
    for key, agent in pairs(state.aiTeams or {}) do
        if agent and agent.roster then
            local team = LeagueCatalog.GetTeam(key)
            for role, p in pairs(agent.roster) do
                if type(p) == "table" and tonumber(p.age) then
                    p.age = p.age + 1
                    CareerSystem.Drift(p)
                    if CareerSystem.WillRetire(p) then
                        local rolePower = math.max(45, math.floor((tonumber(p.mechanics) or 60)))
                        local replacement = team and AISystem.NewAgentPlayer(team, role, rolePower, agent)
                        if replacement then
                            replacement.age = 17 + math.random(0, 2)
                            agent.roster[role] = replacement
                            replaced = replaced + 1
                        end
                    end
                end
            end
        end
    end
    -- 处理退役：清玩家阵容/替补/合同/挂牌，写入名人堂
    local ProfileSystem = require("ProfileSystem")
    local season = tonumber(state.company.seasons) or 0
    for _, player in ipairs(retiredList) do
        for role, pid in pairs(state.roster.players) do
            if pid == player.id then state.roster.players[role] = "" end
        end
        for slot, pid in pairs(state.roster.bench) do
            if pid == player.id then state.roster.bench[slot] = "" end
        end
        state.roster.contracts[player.id] = nil
        state.roster.buyouts[player.id] = nil
        state.roster.desire[player.id] = nil
        state.market.listed[player.id] = nil
        local roleLabel = LeagueCatalog.POSITIONS[player.role] or "选手"
        local peak = math.floor(0.35 * (tonumber(player.mechanics) or 0) + 0.3 * (tonumber(player.teamfight) or 0) + 0.2 * (tonumber(player.laning) or 0) + 0.15 * (tonumber(player.form) or 0) + 0.5)
        ProfileSystem.InsertHonor(state, {
            type = "retired_player",
            title = player.name .. " 退役",
            detail = roleLabel .. " · 退役年龄 " .. tostring(player.age) .. " · 巅峰战力约 " .. tostring(peak),
            at = season,
        })
        CompanyState.RecordTimeline(state, "选手退役",
            player.name .. "（" .. roleLabel .. "）正式退役，告别职业赛场，入选名人堂。")
    end
    if replaced > 0 then
        CompanyState.RecordTimeline(state, "联赛换血",
            "休赛期 " .. tostring(replaced) .. " 名 AI 老将退役，各队启用新秀完成代际更替。")
    end
    return state
end

return CareerSystem