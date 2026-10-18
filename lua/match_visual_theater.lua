--[[
    ============================================================================
    MATCH VISUAL THEATER & 2D TACTICAL RADAR ENGINE
    ============================================================================
    Target Platform: TapTap Maker (Pure Lua 5.4)
    Design Philosophy:
      1. 2D 召唤师峡谷战术雷达：十名选手动线推进、三路兵线对抗、野区与大小龙坑争夺
      2. 智能播放控制：1x/2x/4x 多档倍速、随时一键跳过、5秒决胜战术微操介入
      3. 高能赛事实况反馈：一血/大龙/团灭全屏震动与高光横幅、实时击杀播报流、经济走势折线
      4. 赛后 MVP 颁奖盛典：KDA 评级、五维战术评分、全队伤害占比与电竞荣誉长图
    ============================================================================
--]]

local MatchVisualTheater = {}
MatchVisualTheater.__index = MatchVisualTheater

-- ----------------------------------------------------------------------------
-- 1. SUMMONER'S RIFT SCHEMATIC MAP COORDINATES (0-100 Normal Space)
-- ----------------------------------------------------------------------------
MatchVisualTheater.MAP_NODES = {
    BLUE_NEXUS = { x = 14, y = 86 },
    RED_NEXUS  = { x = 86, y = 14 },

    -- Lanes Key Waypoints
    TOP_LANE = {
        { x = 14, y = 86 },
        { x = 14, y = 50 },
        { x = 14, y = 14 }, -- Top Corner
        { x = 50, y = 14 },
        { x = 86, y = 14 },
    },
    MID_LANE = {
        { x = 14, y = 86 },
        { x = 32, y = 68 },
        { x = 50, y = 50 }, -- Center River
        { x = 68, y = 32 },
        { x = 86, y = 14 },
    },
    BOT_LANE = {
        { x = 14, y = 86 },
        { x = 50, y = 86 },
        { x = 86, y = 86 }, -- Bot Corner
        { x = 86, y = 50 },
        { x = 86, y = 14 },
    },

    -- Key Objectives
    BARON_PIT  = { x = 34, y = 32, name = "纳什男爵坑", icon = "🐉" },
    DRAGON_PIT = { x = 66, y = 68, name = "炼狱巨龙坑", icon = "🔥" },
    HERALD_PIT = { x = 36, y = 28, name = "峡谷先锋坑", icon = "👾" },

    -- Jungle Quadrants
    BLUE_BUFF_BLUE = { x = 24, y = 62 },
    RED_BUFF_BLUE  = { x = 38, y = 78 },
    BLUE_BUFF_RED  = { x = 76, y = 38 },
    RED_BUFF_RED   = { x = 62, y = 22 },
}

-- ----------------------------------------------------------------------------
-- 2. FACTORY INITIALIZATION
-- ----------------------------------------------------------------------------
function MatchVisualTheater.new(opts)
    opts = opts or {}
    local self = setmetatable({}, MatchVisualTheater)

    self.playerTeamName = opts.playerTeamName or "你方战队"
    self.enemyTeamName  = opts.enemyTeamName  or "豪门战队"
    self.playerPower     = opts.playerPower     or 75
    self.enemyPower      = opts.enemyPower      or 75
    self.tacticalBuff    = opts.tacticalBuff    or 0

    -- Overall pre-calculated match seed for coherent simulation
    local baseWinRate = 50 + (self.playerPower - self.enemyPower) * 1.5 + self.tacticalBuff
    self.winRate = math.min(95, math.max(10, baseWinRate))
    self.predictedWin = (math.random(1, 100) <= self.winRate)

    -- Playback state
    self.status = "PLAYING" -- "PLAYING" | "PAUSED_TACTICAL" | "FINISHED"
    self.speed = 1          -- 1, 2, 4, 0 (paused)
    self.matchTime = 0      -- 0 to 2100 (35:00 minutes)
    self.realTimeElapsed = 0

    -- Scoreboard
    self.score = {
        blue = 0,
        red = 0,
        gold_blue = 2500,
        gold_red = 2500,
        dragons_blue = 0,
        dragons_red = 0,
        baron_blue = 0,
        baron_red = 0,
        towers_blue = 11,
        towers_red = 11,
    }

    -- 10 Champion Entities
    self.champions = {
        -- Blue Team (Player)
        blue = {
            TOP = { role = "TOP", name = opts.blueTop or "BinFighter",  x = 18, y = 45, hp = 100, kills = 0, deaths = 0, assists = 0, damage = 0, isDead = false, respawnTimer = 0 },
            JNG = { role = "JNG", name = opts.blueJng or "Clearlove",   x = 28, y = 65, hp = 100, kills = 0, deaths = 0, assists = 0, damage = 0, isDead = false, respawnTimer = 0 },
            MID = { role = "MID", name = opts.playerName or "Prodigy",  x = 42, y = 58, hp = 100, kills = 0, deaths = 0, assists = 0, damage = 0, isDead = false, respawnTimer = 0, isPlayer = true },
            ADC = { role = "ADC", name = opts.blueAdc or "Uzi",         x = 55, y = 84, hp = 100, kills = 0, deaths = 0, assists = 0, damage = 0, isDead = false, respawnTimer = 0 },
            SUP = { role = "SUP", name = opts.blueSup or "Meiko",       x = 52, y = 82, hp = 100, kills = 0, deaths = 0, assists = 0, damage = 0, isDead = false, respawnTimer = 0 },
        },
        -- Red Team (Enemy)
        red = {
            TOP = { role = "TOP", name = opts.redTop or "Zeus",         x = 22, y = 35, hp = 100, kills = 0, deaths = 0, assists = 0, damage = 0, isDead = false, respawnTimer = 0 },
            JNG = { role = "JNG", name = opts.redJng or "Oner",         x = 72, y = 35, hp = 100, kills = 0, deaths = 0, assists = 0, damage = 0, isDead = false, respawnTimer = 0 },
            MID = { role = "MID", name = opts.redMid or "Faker",        x = 58, y = 42, hp = 100, kills = 0, deaths = 0, assists = 0, damage = 0, isDead = false, respawnTimer = 0 },
            ADC = { role = "ADC", name = opts.redAdc or "Gumayusi",     x = 65, y = 84, hp = 100, kills = 0, deaths = 0, assists = 0, damage = 0, isDead = false, respawnTimer = 0 },
            SUP = { role = "SUP", name = opts.redSup or "Keria",        x = 68, y = 82, hp = 100, kills = 0, deaths = 0, assists = 0, damage = 0, isDead = false, respawnTimer = 0 },
        }
    }

    -- Events & Ticker feed
    self.eventsLog = {}
    self.activeBanner = nil
    self.shakeIntensity = 0 -- For screen shake effect (0 to 1)

    -- Tactical Pause Event Flag
    self.tacticalPauseTriggered = false
    self.tacticalChoice = nil
    self.tacticalTimeout = 5.0

    -- MVP & Final Report Data
    self.mvpReport = nil

    return self
end

-- ----------------------------------------------------------------------------
-- 3. TIMELINE & SIMULATION STEP
-- ----------------------------------------------------------------------------
function MatchVisualTheater:update(dt)
    if self.status == "FINISHED" then return end

    if self.status == "PAUSED_TACTICAL" then
        self.tacticalTimeout = self.tacticalTimeout - dt
        if self.tacticalTimeout <= 0 then
            -- Auto-resolve with default choice
            self:resolveTacticalIntervention(2)
        end
        return
    end

    -- Decay screen shake
    if self.shakeIntensity > 0 then
        self.shakeIntensity = math.max(0, self.shakeIntensity - dt * 2)
    end

    -- Banner timer decay
    if self.activeBanner then
        self.activeBanner.timer = self.activeBanner.timer - dt
        if self.activeBanner.timer <= 0 then
            self.activeBanner = nil
        end
    end

    -- Multiply by playback speed
    local simDt = dt * self.speed
    self.realTimeElapsed = self.realTimeElapsed + dt
    self.matchTime = self.matchTime + simDt * 40 -- ~50 seconds per real second at 1x

    -- Update champion respawns
    for _, team in pairs(self.champions) do
        for _, champ in pairs(team) do
            if champ.isDead then
                champ.respawnTimer = champ.respawnTimer - simDt
                if champ.respawnTimer <= 0 then
                    champ.isDead = false
                    champ.hp = 100
                    -- Return to near base
                    champ.x = (champ == team.MID or champ == team.TOP) and 18 or 16
                    champ.y = 84
                end
            end
        end
    end

    -- Milestone Timers
    -- 1. First Blood around 6-8 minutes (matchTime 360 - 480)
    if self.matchTime >= 400 and not self.firstBloodTriggered then
        self.firstBloodTriggered = true
        self:triggerFirstBlood()
    end

    -- 2. First Dragon around 14 minutes (matchTime 840)
    if self.matchTime >= 840 and not self.dragonContestTriggered then
        self.dragonContestTriggered = true
        self:triggerDragonContest()
    end

    -- 3. Baron Pit Inflection Point (25 minutes = 1500)
    if self.matchTime >= 1500 and not self.tacticalPauseTriggered then
        self.tacticalPauseTriggered = true
        self:triggerBaronPitTacticalPause()
        return
    end

    -- 4. Match Finish (35 minutes = 2100)
    if self.matchTime >= 2100 then
        self:finishMatch()
    end

    -- Continuous champion position animation along lanes
    self:updateChampionPositions(simDt)
end

-- ----------------------------------------------------------------------------
-- 4. CHAMPION POSITION MOVEMENT & LANE PRESSURE
-- ----------------------------------------------------------------------------
function MatchVisualTheater:updateChampionPositions(simDt)
    local t = self.matchTime / 2100 -- normalized progress (0 to 1)

    -- Dynamic swaying along lane lines
    local phase = math.sin(self.matchTime * 0.05) * 4

    -- Mid Lane confrontation
    local midPush = (self.predictedWin and 6 or -6) * t
    self.champions.blue.MID.x = 42 + midPush + phase
    self.champions.blue.MID.y = 58 - midPush - phase
    self.champions.red.MID.x  = 58 + midPush + phase
    self.champions.red.MID.y  = 42 - midPush - phase

    -- Top Lane
    self.champions.blue.TOP.x = 14 + (t > 0.5 and 10 or 0)
    self.champions.blue.TOP.y = 45 - (t * 20) + phase
    self.champions.red.TOP.x  = 18 + (t > 0.5 and 10 or 0)
    self.champions.red.TOP.y  = 30 - (t * 15) + phase

    -- Bot Lane
    self.champions.blue.ADC.x = 55 + (t * 20) + phase
    self.champions.blue.ADC.y = 86
    self.champions.red.ADC.x  = 70 + (t * 10) + phase
    self.champions.red.ADC.y  = 86

    -- Supports escort ADC
    self.champions.blue.SUP.x = self.champions.blue.ADC.x - 3
    self.champions.blue.SUP.y = self.champions.blue.ADC.y - 3
    self.champions.red.SUP.x  = self.champions.red.ADC.x + 3
    self.champions.red.SUP.y  = self.champions.red.ADC.y - 3

    -- Junglers roaming between camps and river
    local jngAngle = self.matchTime * 0.08
    self.champions.blue.JNG.x = 30 + math.cos(jngAngle) * 12
    self.champions.blue.JNG.y = 60 + math.sin(jngAngle) * 12

    self.champions.red.JNG.x  = 70 - math.cos(jngAngle) * 12
    self.champions.red.JNG.y  = 40 - math.sin(jngAngle) * 12

    -- Passive gold trickle
    self.score.gold_blue = math.floor(2500 + self.matchTime * 14 + self.score.blue * 300)
    self.score.gold_red  = math.floor(2500 + self.matchTime * 14 + self.score.red * 300)
end

-- ----------------------------------------------------------------------------
-- 5. DRAMATIC COMBAT EVENTS & HIGH-IMPACT BANNERS
-- ----------------------------------------------------------------------------
function MatchVisualTheater:triggerFirstBlood()
    local killerIsPlayer = self.predictedWin or (math.random(1, 100) <= 65)
    local killer, victim

    if killerIsPlayer then
        killer = self.champions.blue.MID
        victim = self.champions.red.MID
        self.score.blue = self.score.blue + 1
        self.score.gold_blue = self.score.gold_blue + 400
    else
        killer = self.champions.red.MID
        victim = self.champions.blue.MID
        self.score.red = self.score.red + 1
        self.score.gold_red = self.score.gold_red + 400
    end

    killer.kills = killer.kills + 1
    killer.damage = killer.damage + 1200
    victim.deaths = victim.deaths + 1
    victim.isDead = true
    victim.respawnTimer = 15

    local bannerText = string.format("⚡ FIRST BLOOD · 第一滴血！\n【%s】对线抢二级越塔斩杀【%s】！", killer.name, victim.name)
    self:pushBanner("FIRST_BLOOD", "⚡ FIRST BLOOD (第一滴血)", string.format("【%s】斩获一血！", killer.name), 3.0)
    self:addLogEvent("FIRST_BLOOD", string.format("[06:45] ⚡ 【%s】抢二闪现挂点燃，单杀【%s】拿下第一滴血！(+$400)", killer.name, victim.name))
    self.shakeIntensity = 0.8
end

function MatchVisualTheater:triggerDragonContest()
    local blueWinsDragon = self.predictedWin or (math.random(1, 100) <= 60)
    if blueWinsDragon then
        self.score.dragons_blue = self.score.dragons_blue + 1
        self.score.blue = self.score.blue + 2
        self.score.red = self.score.red + 1
        self.champions.blue.ADC.kills = self.champions.blue.ADC.kills + 2
        self.champions.blue.ADC.damage = self.champions.blue.ADC.damage + 2400
        self:pushBanner("DRAGON", "🔥 炼狱巨龙已被我方击杀！", "下半区控图大捷 · 全队获得龙魂属性增益", 3.0)
        self:addLogEvent("DRAGON", "[14:20] 🔥 【你方战队】小龙坑逼团击杀两人并稳稳控下炼狱亚龙！")
    else
        self.score.dragons_red = self.score.dragons_red + 1
        self.score.red = self.score.red + 2
        self.score.blue = self.score.blue + 1
        self.champions.red.ADC.kills = self.champions.red.ADC.kills + 2
        self.champions.red.ADC.damage = self.champions.red.ADC.damage + 2400
        self:pushBanner("DRAGON", "⚠️ 炼狱巨龙被敌方控下！", "敌方抢占下半区视野", 3.0)
        self:addLogEvent("DRAGON", "[14:20] ⚠️ 敌方利用视野优势控下炼狱亚龙，小龙争夺失利。")
    end
    self.shakeIntensity = 0.6
end

function MatchVisualTheater:triggerBaronPitTacticalPause()
    self.status = "PAUSED_TACTICAL"
    self.speed = 0
    self.tacticalTimeout = 5.0
    self.shakeIntensity = 0.9

    -- Converge all living champions to Baron Pit for drama
    for _, champ in pairs(self.champions.blue) do
        champ.x = MatchVisualTheater.MAP_NODES.BARON_PIT.x - math.random(2, 6)
        champ.y = MatchVisualTheater.MAP_NODES.BARON_PIT.y + math.random(1, 5)
    end
    for _, champ in pairs(self.champions.red) do
        champ.x = MatchVisualTheater.MAP_NODES.BARON_PIT.x + math.random(2, 6)
        champ.y = MatchVisualTheater.MAP_NODES.BARON_PIT.y - math.random(1, 5)
    end

    self:pushBanner("BARON_ALERT", "🐉 纳什男爵生死决断 (Baron Pit Decider)", "大龙剩余血量 1,450！十人龙坑狭窄隘口生死博弈！", 5.0)
    self:addLogEvent("BARON_ALERT", "[25:10] 🚨 双方十人在大龙坑爆发毁天灭地的决战，胜负在此一举！")
end

function MatchVisualTheater:resolveTacticalIntervention(choiceIdx)
    self.tacticalChoice = choiceIdx
    self.status = "PLAYING"
    self.speed = 1

    local blueWinsBaron = false
    local eventStory = ""

    if choiceIdx == 1 then
        -- 孤勇者中单进场抢龙
        local roll = math.random(1, 100)
        blueWinsBaron = (roll <= (self.winRate + 15))
        if blueWinsBaron then
            self.champions.blue.MID.kills = self.champions.blue.MID.kills + 3
            self.champions.blue.MID.damage = self.champions.blue.MID.damage + 4500
            self.score.blue = self.score.blue + 4
            self.score.red = self.score.red + 1
            self.score.baron_blue = self.score.baron_blue + 1
            eventStory = string.format("⚡【%s】天神下凡！孤身闪现刺入龙坑秒杀敌方打野，极限抢下大龙并斩获三杀！", self.champions.blue.MID.name)
            self:pushBanner("ACE", "👑 孤勇者奇迹团灭 (ACE)！", "天神下凡抢下大龙！全场都在呼喊你的名字！", 4.0)
        else
            self.score.red = self.score.red + 3
            self.score.baron_red = self.score.baron_red + 1
            eventStory = "进场过早被敌方瞬间虚弱控死，大龙遗憾被敌方拿下！"
            self:pushBanner("BARON_STOLEN", "💔 纳什男爵被敌方控下", "进场被集火，敌方抢下大龙增益", 3.0)
        end
    elseif choiceIdx == 2 then
        -- 拼惩戒集火
        blueWinsBaron = (math.random(1, 100) <= self.winRate)
        if blueWinsBaron then
            self.score.baron_blue = self.score.baron_blue + 1
            self.score.blue = self.score.blue + 2
            eventStory = "打野惩戒稳稳斩下大龙！阵型稳扎稳打逼退敌方！"
            self:pushBanner("BARON_SECURED", "🐉 我方稳稳收下纳什男爵！", "全员沐浴大龙 Buff，全面推进兵线！", 3.5)
        else
            self.score.baron_red = self.score.baron_red + 1
            self.score.red = self.score.red + 2
            eventStory = "敌方打野极限拼下惩戒，大龙落入敌方囊中！"
            self:pushBanner("BARON_LOST", "💔 惩戒失误，大龙被敌方抢夺", "全队组织收缩高地防守", 3.0)
        end
    else
        -- 放弃大龙换一路高地
        self.score.baron_red = self.score.baron_red + 1
        self.score.towers_red = math.max(0, self.score.towers_red - 3)
        self.score.gold_blue = self.score.gold_blue + 1500
        blueWinsBaron = false
        eventStory = "战术避战！全队偷家换掉敌方中路高地水晶与门牙塔！"
        self:pushBanner("INHIB_TAKEN", "🏰 破除敌方高地水晶！", "兵线牵制敌方大龙推进节奏！", 3.5)
    end

    self:addLogEvent("BARON_RESOLVE", "[25:40] " .. eventStory)
    self.shakeIntensity = 1.0
end

-- ----------------------------------------------------------------------------
-- 6. MATCH CONCLUSION & MVP CEREMONY
-- ----------------------------------------------------------------------------
function MatchVisualTheater:finishMatch()
    self.status = "FINISHED"
    self.speed = 0

    local isWin = (self.score.baron_blue > 0) or (self.score.blue >= self.score.red)
    if self.predictedWin then isWin = true end

    -- Destroy Nexus of losing team
    if isWin then
        self.score.towers_red = 0
        self:pushBanner("VICTORY", "🏆 VICTORY · 比赛大捷！", string.format("【%s】推平敌方水晶枢纽！", self.playerTeamName), 6.0)
        self:addLogEvent("NEXUS", "[33:45] 🏆 敌方水晶枢纽轰然倒塌！比赛胜利！")
    else
        self.score.towers_blue = 0
        self:pushBanner("DEFEAT", "💔 DEFEAT · 遗憾告负", string.format("【%s】赢下了比赛", self.enemyTeamName), 6.0)
        self:addLogEvent("NEXUS", "[34:10] 💔 水晶枢纽失守，遗憾告负。")
    end

    -- Generate MVP & Damage Share Stats
    self:generateMvpCeremony(isWin)
end

function MatchVisualTheater:generateMvpCeremony(isWin)
    local bestChamp = self.champions.blue.MID
    local highestDmg = bestChamp.damage or 12000

    -- Aggregate team stats
    local totalDmg = 0
    for _, champ in pairs(self.champions.blue) do
        champ.damage = math.max(6000, champ.damage + math.random(5000, 15000))
        totalDmg = totalDmg + champ.damage
        if champ.damage > highestDmg then
            highestDmg = champ.damage
            bestChamp = champ
        end
    end

    local mvpRating = math.min(9.9, 8.5 + (bestChamp.kills * 0.3) - (bestChamp.deaths * 0.2) + (isWin and 0.6 or -0.4))
    mvpRating = math.max(7.0, mvpRating)

    self.mvpReport = {
        isWin = isWin,
        mvpPlayer = bestChamp.name,
        mvpRole = bestChamp.role,
        mvpRating = string.format("%.1f", mvpRating),
        mvpTitle = isWin and "🔥 绝境救世主 · 统治级中单" or "孤勇者 · 独木难支",
        kda = string.format("%d / %d / %d", bestChamp.kills, bestChamp.deaths, bestChamp.assists),
        damageShare = math.floor((bestChamp.damage / totalDmg) * 100),
        totalGoldDiff = self.score.gold_blue - self.score.gold_red,
        teamScore = string.format("%d : %d", self.score.blue, self.score.red),
        casterQuote = isWin
            and "“天不生我 Faker，万古中道如长夜！这一波团战直接宣判了比赛死刑！”"
            or "“这就是残酷的竞技电竞，一着不慎满盘皆输，但他们战斗到了最后一刻！”",
        teamDmgShares = {
            TOP = math.floor((self.champions.blue.TOP.damage / totalDmg) * 100),
            JNG = math.floor((self.champions.blue.JNG.damage / totalDmg) * 100),
            MID = math.floor((self.champions.blue.MID.damage / totalDmg) * 100),
            ADC = math.floor((self.champions.blue.ADC.damage / totalDmg) * 100),
            SUP = math.floor((self.champions.blue.SUP.damage / totalDmg) * 100),
        }
    }
end

-- ----------------------------------------------------------------------------
-- 7. PLAYER ACTION INTERFACE
-- ----------------------------------------------------------------------------
function MatchVisualTheater:setSpeed(newSpeed)
    self.speed = math.max(0, math.min(4, newSpeed))
end

function MatchVisualTheater:skipToEnd()
    if self.status == "FINISHED" then return end
    self.matchTime = 2100
    if not self.firstBloodTriggered then self:triggerFirstBlood() end
    if not self.dragonContestTriggered then self:triggerDragonContest() end
    if not self.tacticalPauseTriggered then self:resolveTacticalIntervention(1) end
    self:finishMatch()
end

function MatchVisualTheater:pushBanner(type, title, subtitle, duration)
    self.activeBanner = {
        type = type,
        title = title,
        subtitle = subtitle,
        timer = duration or 3.0,
        maxTimer = duration or 3.0
    }
end

function MatchVisualTheater:addLogEvent(type, text)
    table.insert(self.eventsLog, {
        type = type,
        text = text,
        timestamp = self:formatGameTime()
    })
end

function MatchVisualTheater:formatGameTime()
    local totalSeconds = math.floor(self.matchTime)
    local mins = math.floor(totalSeconds / 60)
    local secs = totalSeconds % 60
    return string.format("%02d:%02d", mins, secs)
end

return MatchVisualTheater
