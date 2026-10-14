local LeagueCatalog = {}

LeagueCatalog.GAME_NAME = "Nexus Arena（星环竞技场）"
LeagueCatalog.LEAGUE_NAME = "东冠联赛（Eastern Crown League）"
LeagueCatalog.PLAYER_TEAM_ID = "legacy"

LeagueCatalog.POSITIONS = {
    top = "上单",
    jungle = "打野",
    mid = "中单",
    adc = "下路",
    support = "辅助",
}

LeagueCatalog.TEAM_STYLES = {
    aggressive = { id = "aggressive", label = "激进型", short = "激进", desc = "进攻凶猛，高风险高回报，前期压制力极强，后期韧性不足", weakTo = "defensive" },
    defensive = { id = "defensive", label = "稳健运营型", short = "稳健", desc = "防守严密，低失误率，擅长后期运营与资源控制", weakTo = "aggressive" },
    slowstart = { id = "slowstart", label = "慢热型", short = "慢热", desc = "前期节奏偏缓，中后期爆发，翻盘能力强", weakTo = "aggressive" },
    metapick = { id = "metapick", label = "版本答案型", short = "版本", desc = "跟随版本热门打法，战术多变，适应性极强", weakTo = "slowstart" },
}

LeagueCatalog.TEAMS = {
    { id = "legacy", name = "Legacy Gaming", power = 0, style = "aggressive" },
    { id = "nova", name = "Nova Stars", power = 74, style = "metapick" },
    { id = "phoenix", name = "Phoenix Rising", power = 70, style = "aggressive" },
    { id = "titan", name = "Titan Core", power = 67, style = "defensive" },
    { id = "frost", name = "Frost Monarchs", power = 64, style = "slowstart" },
    { id = "storm", name = "Stormbreakers", power = 61, style = "aggressive" },
    { id = "iron", name = "Iron Vanguard", power = 58, style = "defensive" },
    { id = "shadow", name = "Shadow Fang", power = 55, style = "slowstart" },
}

LeagueCatalog.ACADEMY_TEAMS = {
    { id = "legacy_youth", name = "Legacy 青年队", power = 0 },
    { id = "nova_youth", name = "Nova 青年队", power = 44 },
    { id = "phoenix_youth", name = "Phoenix 青年队", power = 42 },
    { id = "titan_youth", name = "Titan 青年队", power = 40 },
    { id = "frost_youth", name = "Frost 青年队", power = 38 },
    { id = "storm_youth", name = "Storm 青年队", power = 37 },
    { id = "iron_youth", name = "Iron 青年队", power = 35 },
    { id = "shadow_youth", name = "Shadow 青年队", power = 33 },
}

LeagueCatalog.QUALIFIER_TEAMS = {
    { id = "legacy_cafe", name = "Legacy Gaming", power = 0 },
    { id = "q_star", name = "星火网吧", power = 42 },
    { id = "q_blue", name = "蓝色港湾", power = 39 },
    { id = "q_typhoon", name = "台风电竞", power = 36 },
}

LeagueCatalog.REGIONS = {
    west = { id = "west", name = "西冠联赛", short = "西冠", teams = {
        { id = "w_star", name = "星辉竞技", power = 72 },
        { id = "w_dragon", name = "龙腾战队", power = 68 },
        { id = "w_moon", name = "月光骑士", power = 65 },
        { id = "w_hawk", name = "猎鹰电竞", power = 62 },
        { id = "w_tiger", name = "猛虎俱乐部", power = 59 },
        { id = "w_viper", name = "毒蛇联盟", power = 56 },
        { id = "w_panda", name = "熊猫传说", power = 53 },
        { id = "w_ape", name = "灵猿战队", power = 50 },
    } },
    south = { id = "south", name = "南冠联赛", short = "南冠", teams = {
        { id = "s_phoenix", name = "火凤凰电竞", power = 70 },
        { id = "s_blue", name = "蓝鲸电竞", power = 66 },
        { id = "s_neptune", name = "海王星战队", power = 63 },
        { id = "s_wave", name = "巨浪俱乐部", power = 60 },
        { id = "s_coral", name = "珊瑚电竞", power = 57 },
        { id = "s_coco", name = "椰风战队", power = 54 },
        { id = "s_shark", name = "鲸鲨联盟", power = 51 },
        { id = "s_lantern", name = "灯塔电竞", power = 48 },
    } },
}

---@class LeaguePlayer
---@field id string
---@field name string
---@field role string
---@field age number
---@field mechanics number
---@field laning number
---@field teamfight number
---@field form number
---@field potential number
---@field salary number
---@field buyout number
---@field recentForm? number
---@field contractYears? number

---@type table<string, LeaguePlayer>
LeagueCatalog.PLAYERS = {
    p_blaze =   { id = "p_blaze", name = "Blaze", role = "top", age = 23, mechanics = 72, laning = 70, teamfight = 68, form = 70, potential = 75, salary = 9, buyout = 0 },
    p_rock =    { id = "p_rock", name = "Rock", role = "top", age = 27, mechanics = 78, laning = 66, teamfight = 64, form = 65, potential = 72, salary = 12, buyout = 220 },
    p_valor =   { id = "p_valor", name = "Valor", role = "top", age = 21, mechanics = 68, laning = 74, teamfight = 66, form = 70, potential = 70, salary = 8, buyout = 90 },
    p_kirin =   { id = "p_kirin", name = "Kirin", role = "top", age = 19, mechanics = 82, laning = 72, teamfight = 74, form = 60, potential = 85, salary = 18, buyout = 500 },
    p_vex =     { id = "p_vex", name = "Vex", role = "jungle", age = 24, mechanics = 70, laning = 72, teamfight = 70, form = 70, potential = 73, salary = 9, buyout = 0 },
    p_wraith =  { id = "p_wraith", name = "Wraith", role = "jungle", age = 28, mechanics = 76, laning = 68, teamfight = 72, form = 65, potential = 74, salary = 12, buyout = 230 },
    p_storm =   { id = "p_storm", name = "Storm", role = "jungle", age = 20, mechanics = 66, laning = 70, teamfight = 74, form = 68, potential = 72, salary = 8, buyout = 95 },
    p_phantom = { id = "p_phantom", name = "Phantom", role = "jungle", age = 18, mechanics = 84, laning = 70, teamfight = 76, form = 60, potential = 88, salary = 18, buyout = 520 },
    p_lumen =   { id = "p_lumen", name = "Lumen", role = "mid", age = 22, mechanics = 74, laning = 72, teamfight = 75, form = 72, potential = 80, salary = 11, buyout = 0 },
    p_oracle =  { id = "p_oracle", name = "Oracle", role = "mid", age = 24, mechanics = 80, laning = 74, teamfight = 78, form = 68, potential = 82, salary = 15, buyout = 380 },
    p_shade =   { id = "p_shade", name = "Shade", role = "mid", age = 21, mechanics = 70, laning = 72, teamfight = 76, form = 70, potential = 75, salary = 9, buyout = 130 },
    p_comet =   { id = "p_comet", name = "Comet", role = "mid", age = 19, mechanics = 86, laning = 76, teamfight = 80, form = 62, potential = 90, salary = 20, buyout = 600 },
    p_nova =    { id = "p_nova", name = "Nova", role = "adc", age = 23, mechanics = 76, laning = 70, teamfight = 72, form = 74, potential = 78, salary = 12, buyout = 0 },
    p_bullet =  { id = "p_bullet", name = "Bullet", role = "adc", age = 26, mechanics = 78, laning = 72, teamfight = 76, form = 70, potential = 80, salary = 14, buyout = 300 },
    p_zephyr =  { id = "p_zephyr", name = "Zephyr", role = "adc", age = 20, mechanics = 70, laning = 68, teamfight = 70, form = 72, potential = 74, salary = 8, buyout = 110 },
    p_archer =  { id = "p_archer", name = "Archer", role = "adc", age = 19, mechanics = 84, laning = 74, teamfight = 78, form = 64, potential = 86, salary = 19, buyout = 560 },
    p_ember =   { id = "p_ember", name = "Ember", role = "support", age = 24, mechanics = 68, laning = 72, teamfight = 74, form = 73, potential = 76, salary = 8, buyout = 0 },
    p_warden =  { id = "p_warden", name = "Warden", role = "support", age = 27, mechanics = 74, laning = 70, teamfight = 78, form = 68, potential = 79, salary = 11, buyout = 220 },
    p_echo =    { id = "p_echo", name = "Echo", role = "support", age = 21, mechanics = 66, laning = 74, teamfight = 70, form = 72, potential = 73, salary = 7, buyout = 80 },
    p_guard =   { id = "p_guard", name = "Guard", role = "support", age = 18, mechanics = 82, laning = 72, teamfight = 80, form = 62, potential = 88, salary = 17, buyout = 480 },
}

-- 基准快照：训练/状态会直接改 LeagueCatalog 内选手对象，
-- 新游戏必须从基准重置，避免跨局继承上一局的训练加成
local BASE_PLAYERS = {}
for id, player in pairs(LeagueCatalog.PLAYERS) do
    BASE_PLAYERS[id] = {
        mechanics = player.mechanics,
        laning = player.laning,
        teamfight = player.teamfight,
        form = player.form,
        age = player.age,
        recentForm = 0,
        morale = 60,
    }
end

function LeagueCatalog.ResetRoster()
    local HeroSystem = require("HeroSystem")
    for id, base in pairs(BASE_PLAYERS) do
        local player = LeagueCatalog.PLAYERS[id]
        if player then
            player.mechanics = base.mechanics
            player.laning = base.laning
            player.teamfight = base.teamfight
            player.form = base.form
            player.age = base.age
            player.recentForm = base.recentForm
            player.morale = base.morale
            player.heroes = nil -- 英雄池随基准重置（跨局不可继承）
            player.retired = nil -- 退役标记跨局重置
        end
    end
    for _, player in pairs(LeagueCatalog.PLAYERS) do
        HeroSystem.SeedPlayer(player)
    end
end

function LeagueCatalog.GetPotentialGrade(potential)
    potential = tonumber(potential) or 0
    if potential >= 85 then return "S" end
    if potential >= 75 then return "A" end
    if potential >= 65 then return "B" end
    return "C"
end

function LeagueCatalog.AgeAll()
    for _, player in pairs(LeagueCatalog.PLAYERS) do
        player.age = tonumber(player.age) or 21
        player.age = player.age + 1
    end
end

function LeagueCatalog.GetTeam(teamId)
    for _, team in ipairs(LeagueCatalog.TEAMS) do
        if team.id == teamId then return team end
    end
    return nil
end

function LeagueCatalog.GetAcademyTeam(teamId)
    for _, team in ipairs(LeagueCatalog.ACADEMY_TEAMS) do
        if team.id == teamId then return team end
    end
    return nil
end

function LeagueCatalog.GetQualifierTeam(teamId)
    for _, team in ipairs(LeagueCatalog.QUALIFIER_TEAMS) do
        if team.id == teamId then return team end
    end
    return nil
end

function LeagueCatalog.GetRegionTeam(teamId)
    for _, region in pairs(LeagueCatalog.REGIONS) do
        for _, team in ipairs(region.teams) do
            if team.id == teamId then return team end
        end
    end
    return nil
end

--- 战队显示名单一来源：统一解析任意 teamId 的展示名（含回退默认值）
--- 覆盖 TEAMS / ACADEMY_TEAMS / QUALIFIER_TEAMS / REGIONS（扁平化），
--- 找不到时返回 defaultName（不返回 nil，避免字符串拼接 nil 崩溃）。
--- 注意：AISystem 的 agent 记录（state.aiTeams[id]）不含 name/teamName 字段，
--- 取对手/战队显示名必须走本函数，绝不可从 AISystem.GetAgent(...) 取 .name。
function LeagueCatalog.GetTeamName(teamId, defaultName)
    if not teamId then return defaultName end
    local candidates = {
        LeagueCatalog.GetTeam(teamId),
        LeagueCatalog.GetAcademyTeam(teamId),
        LeagueCatalog.GetQualifierTeam(teamId),
        LeagueCatalog.GetRegionTeam(teamId),
    }
    for _, t in ipairs(candidates) do
        if t and t.name then return t.name end
    end
    return defaultName or teamId
end

LeagueCatalog.CONTRACT_YEARS = {
    p_blaze = 2, p_vex = 2, p_lumen = 3, p_nova = 2, p_ember = 2,
    p_rock = 2, p_valor = 1, p_kirin = 2,
    p_wraith = 2, p_storm = 1, p_phantom = 2,
    p_oracle = 2, p_shade = 1, p_comet = 2,
    p_bullet = 2, p_zephyr = 1, p_archer = 2,
    p_warden = 2, p_echo = 1, p_guard = 2,
}

function LeagueCatalog.GetContractYears(playerId)
    return LeagueCatalog.CONTRACT_YEARS[playerId] or 2
end

function LeagueCatalog.GetPlayer(playerId)
    return LeagueCatalog.PLAYERS[playerId]
end

function LeagueCatalog.GetPlayersByRole(role)
    local players = {}
    for _, player in pairs(LeagueCatalog.PLAYERS) do
        if player.role == role then table.insert(players, player) end
    end
    table.sort(players, function(a, b) return a.buyout < b.buyout end)
    return players
end

function LeagueCatalog.GetAllTeams()
    return LeagueCatalog.TEAMS
end

function LeagueCatalog.RegisterPlayer(player)
    if not player or not player.id then return end
    local HeroSystem = require("HeroSystem")
    HeroSystem.SeedPlayer(player)
    LeagueCatalog.PLAYERS[player.id] = player
    LeagueCatalog.CONTRACT_YEARS[player.id] = LeagueCatalog.CONTRACT_YEARS[player.id] or (player.contractYears or 2)
end

return LeagueCatalog
