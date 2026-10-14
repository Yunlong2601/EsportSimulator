--[[
    ============================================================================
    TAPTAP MAKE: INFINITE WORLD TOUR & ENDLESS MANAGER LEAGUE (LUA ENGINE)
    ============================================================================
    Target Platform: TapTap Make (Mobile Portrait Text-Simulator Engine)
    Language: Pure Lua 5.1 / 5.2 / 5.3 / LuaJIT
    Encoding: UTF-8 (纯中文赛况模拟与跨国劲旅)

    系统概述：
      1. 百层跨赛区世界巡回赛 (1-100+ 层天梯)；
      2. LCK / LPL / LEC / LCS 全球赛区强队与历史传奇王朝 BOSS；
      3. 动态战力对抗与胜率判定，掉落海量名宿声望点数；
      4. 赛季排名追踪与战利品奖杯积累。
--]]

local WorldTour = {}
WorldTour.__index = WorldTour

WorldTour.BOSS_FLOORS = {
    [5]   = { region = "LEC", name = "FNC 青年近卫军", captain = "Rekkles Jr.", title = "欧洲新星神射手", power = 82, reward = 30, gimmick = "前15分钟敌方下路获得+15%压制" },
    [10]  = { region = "LCS", name = "Team Liquid 银河舰队", captain = "Impact", title = "大木老师 · 不动磐石", power = 86, reward = 45, gimmick = "上路绝对壁垒，我方对线单杀难度翻倍" },
    [20]  = { region = "LEC", name = "G2 Esports 狂欢军团", captain = "Caps", title = "Baby Faker · 杂技魔术师", power = 90, reward = 60, gimmick = "团战逆风时有35%几率偷龙换塔" },
    [35]  = { region = "LPL", name = "WBG 微博电子竞技", captain = "TheShy", title = "天神下凡 · 剑魔剑仙", power = 94, reward = 90, gimmick = "绝境团战输出提升40%，微操硬核检定" },
    [50]  = { region = "LCK", name = "Gen.G 金色王朝", captain = "Chovy", title = "补刀机器 · 八卦中单", power = 98, reward = 130, gimmick = "每分钟自动领先500经济，拖入后期极难" },
    [70]  = { region = "LPL", name = "2018 IG 极境巅峰", captain = "Rookie", title = "翻山破晓 · 极意登峰", power = 104, reward = 180, gimmick = "全线血腥度拉满，开局即大乱斗搏杀" },
    [85]  = { region = "LCK", name = "2024 T1 五星王朝", captain = "Faker", title = "不死魔王 · 五冠终极化身", power = 110, reward = 240, gimmick = "开局封锁我方最强核心，全员团战韧性拉满" },
    [100] = { region = "BOSS", name = "召唤师峡谷 · 创世神殿队", captain = "The Ancient", title = "电竞万神殿总守护者", power = 120, reward = 500, gimmick = "微操与战术全维度神级压制，唯有满传承者方可弑神" }
}

function WorldTour.new()
    local self = setmetatable({}, WorldTour)
    self.current_floor = 1
    self.highest_floor = 0
    self.season_rank = 1250
    self.tour_trophies = 0
    return self
end

function WorldTour:getOpponent(floor)
    floor = floor or self.current_floor
    if WorldTour.BOSS_FLOORS[floor] then
        local b = WorldTour.BOSS_FLOORS[floor]
        return {
            floor = floor,
            region = b.region,
            team_name = b.name,
            captain = b.captain,
            title = b.title,
            power = b.power,
            reward = b.reward,
            gimmick = b.gimmick,
            is_boss = true
        }
    end

    local regions = { "LPL", "LCK", "LEC", "LCS" }
    local rIdx = ((floor - 1) % #regions) + 1
    local region = regions[rIdx]

    local prefixes = { "星辉", "极光", "狂风", "巨浪", "泰坦", "黑曜", "幻影", "雷霆", "赤焰", "龙魂" }
    local suffixes = { "Gaming", "Esports", "Dynasty", "Squad", "Club" }
    local pIdx = ((floor * 3) % #prefixes) + 1
    local sIdx = ((floor * 7) % #suffixes) + 1
    local team_name = string.format("%s %s (%s)", prefixes[pIdx], suffixes[sIdx], region)

    local captains = {
        { name = "ViperClone", title = "精准斩杀射手" },
        { name = "ShowMakerX", title = "重铸荣光法王" },
        { name = "KanaviSpeed", title = "野区狂暴掠食者" },
        { name = "BinFighter", title = "绝境单带斗士" },
        { name = "KeriaVision", title = "灵性游走辅助" }
    }
    local cap = captains[((floor + 2) % #captains) + 1]

    local basePower = 75 + math.floor(floor * 0.42)
    local isMiniBoss = (floor % 5 == 0)
    local power = isMiniBoss and (basePower + 4) or basePower
    local reward = isMiniBoss and (20 + math.floor(floor * 0.8)) or (10 + math.floor(floor * 0.4))

    return {
        floor = floor,
        region = region,
        team_name = team_name,
        captain = cap.name,
        title = cap.title,
        power = power,
        reward = reward,
        gimmick = isMiniBoss and "【赛点高压】对手全属性提升8%，龙坑集结极快" or "常规巡回赛对抗，考验基本功储备",
        is_boss = isMiniBoss
    }
end

function WorldTour:battle(teamPower, prestigeSys)
    local opp = self:getOpponent(self.current_floor)
    local effectivePower = teamPower or 80

    if prestigeSys then
        if prestigeSys:hasPassive("passive_deep_champ_pool") then effectivePower = effectivePower + 5 end
        if prestigeSys:hasPassive("passive_shotcaller_core") then effectivePower = effectivePower + 6 end
        if prestigeSys:hasPassive("passive_dragon_baron_whisperer") then effectivePower = effectivePower + 4 end
        if prestigeSys:hasPassive("passive_phoenix_rebirth") then effectivePower = effectivePower + 6 end
    end

    local diff = effectivePower - opp.power
    local winProb = 0.50 + (diff * 0.025)
    winProb = math.max(0.12, math.min(0.92, winProb))

    local isWin = (math.random() < winProb)
    local logs = {}
    table.insert(logs, string.format("🌍【世界巡回赛第 %d 层】对阵 [%s] %s (敌方战力: %d，我方战力: %d)", opp.floor, opp.region, opp.team_name, opp.power, effectivePower))
    table.insert(logs, string.format("对阵王牌: %s (%s) | 特殊机制: %s", opp.captain, opp.title, opp.gimmick))

    if isWin then
        local score = opp.is_boss and "3 - 1" or "2 - 0"
        self.current_floor = self.current_floor + 1
        if self.current_floor > self.highest_floor then
            self.highest_floor = self.current_floor
        end
        self.tour_trophies = self.tour_trophies + 1
        self.season_rank = math.max(1, self.season_rank - 15)

        table.insert(logs, string.format("🔥 完美的龙坑团灭！大比分 %s 斩获胜局！通关第 %d 层！", score, opp.floor))
        table.insert(logs, string.format("✨ 破纪录斩获 +%d 名宿声望点数，解锁通往第 %d 层的通行证！", opp.reward, self.current_floor))
        return true, opp.reward, logs
    else
        local score = opp.is_boss and "2 - 3" or "1 - 2"
        local partialReward = math.floor(opp.reward * 0.25)
        table.insert(logs, string.format("💀 决胜局遗憾惜败！大比分 %s 不敌对手。获得热身声望 +%d 点。", score, partialReward))
        table.insert(logs, "💡 建议提升俱乐部首发阵容战力或在名宿殿堂点亮永久传承天赋后再行发起挑战！")
        return false, partialReward, logs
    end
end

return WorldTour
