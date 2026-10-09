-- ==============================================================================
-- ESPORTS LEGACY: ROAD TO WORLDS (TAPTAP MAKE STANDALONE LUA ENGINE)
-- Compatible with Pure Lua 5.1+, LuaJIT, TapTap Make, Love2D, and CLI
--
-- Progression Path:
--   1. Phase 1 (Amateur Solo Q):
--      - 7-Day Daily Login Streak (Bonus LP, Cash, & Pro-Gear Skins)
--      - Daily Challenges (Grind Master, VOD Analyst, Streamer)
--      - Grind to 1,000 LP Challenger to unlock Pro Stage Team Captaincy
--   2. Phase 2 (The Stage):
--      - Team Captain 5v5 Pick & Ban Draft
--      - Earn up to $1,000,000 in tournament purses
--   3. Phase 3 (Dynasty Tycoon):
--      - Retire from active playing & buy an Esports Organization for $1,000,000
--      - Manage roster, gaming house, and battle T1 in Worlds Grand Finals Bo5!
-- ==============================================================================

local Game = {
    phase = 1,
    running = true,
    unlocked = { [1] = true, [2] = false, [3] = false },
    trophies = {
        challenger = false,
        regional_champ = false,
        worlds_cup = false,
        mvp_ring = false
    }
}

-- Pro-Gear Skins Catalog with stat multipliers
local SKINS_CATALOG = {
    neon_keyboard = {
        id = "neon_keyboard",
        name = "Cyberpunk Neon Rapid-Trigger Keyboard",
        category = "Keyboard",
        rarity = "EPIC",
        icon = "⌨️",
        mechanics_bonus = 8,
        mental_bonus = 5,
        desc = "Luminescent magnetic switches with 0.1mm actuation. APM +8, Mental +5."
    },
    t1_jersey = {
        id = "t1_jersey",
        name = "T1 Worlds Championship Red-Gold Jersey",
        category = "Jersey",
        rarity = "EPIC",
        icon = "🎽",
        mechanics_bonus = 4,
        mental_bonus = 12,
        desc = "Woven with four championship stars. Unshakable mental composure (+12)."
    },
    golden_mouse = {
        id = "golden_mouse",
        name = "Golden Dragon 8000Hz Wireless Mouse",
        category = "Mouse",
        rarity = "LEGENDARY",
        icon = "🖱️",
        mechanics_bonus = 14,
        mental_bonus = 8,
        desc = "0.125ms polling rate with 24K gold magnesium shell. Mechanics +14, Mental +8."
    }
}

-- 7-Day Login Streak Schedule
local STREAK_SCHEDULE = {
    [1] = { day = 1, lp = 25, cash = 30, skin = nil },
    [2] = { day = 2, lp = 35, cash = 50, skin = nil },
    [3] = { day = 3, lp = 50, cash = 60, skin = "neon_keyboard" },
    [4] = { day = 4, lp = 65, cash = 80, skin = nil },
    [5] = { day = 5, lp = 80, cash = 100, skin = "t1_jersey" },
    [6] = { day = 6, lp = 100, cash = 120, skin = nil },
    [7] = { day = 7, lp = 150, cash = 250, skin = "golden_mouse" }
}

local Player = {
    lp = 340,
    rank = "Gold",
    mechanics = 55,
    mental = 70,
    energy = 85,
    money = 180,
    fame = 15,
    streak = 2,
    -- Login Streak State
    login_day = 1,
    claimed_today = false,
    unlocked_skins = {},
    equipped_skin = nil,
    -- Daily Challenges
    challenges = {
        { id = "win3",   title = "Grind Master",    target = 3, current = 0, lp = 45, cash = 60, claimed = false },
        { id = "vod2",   title = "VOD Analyst",     target = 2, current = 0, lp = 25, cash = 30, claimed = false },
        { id = "stream", title = "Bootcamp Stream", target = 1, current = 0, lp = 20, cash = 80, claimed = false }
    }
}

local function calculateRank(lp)
    if lp >= 1000 then return "Challenger"
    elseif lp >= 950 then return "Grandmaster"
    elseif lp >= 850 then return "Master"
    elseif lp >= 700 then return "Diamond"
    elseif lp >= 550 then return "Emerald"
    elseif lp >= 400 then return "Platinum"
    elseif lp >= 300 then return "Gold"
    elseif lp >= 200 then return "Silver"
    elseif lp >= 100 then return "Bronze"
    else return "Iron" end
end

function Player:addLP(delta)
    self.lp = math.max(0, self.lp + delta)
    local newRank = calculateRank(self.lp)
    if newRank ~= self.rank then
        print(string.format(">>> 🏆 RANK PROMOTION! You achieved %s (%d LP)! <<<", newRank, self.lp))
        self.rank = newRank
    end
    if self.lp >= 1000 and not Game.trophies.challenger then
        Game.trophies.challenger = true
        Game.unlocked[2] = true
        print("\n=======================================================")
        print("🌟 HIGHEST RANK REACHED: CHALLENGER (1,000 LP)!")
        print("Official Pro Scout Invitation received: Sign as Team Captain!")
        print("PHASE 2 (THE STAGE: PICK & BAN) IS NOW UNLOCKED!")
        print("=======================================================\n")
    end
end

function Player:checkChallenge(type_id)
    for _, ch in ipairs(self.challenges) do
        if ch.id == type_id and not ch.claimed then
            ch.current = math.min(ch.target, ch.current + 1)
            if ch.current >= ch.target then
                ch.claimed = true
                self:addLP(ch.lp)
                self.money = self.money + ch.cash
                print(string.format("\n🎁 DAILY CHALLENGE COMPLETED: [%s]! Claimed +%d LP & +$%d!", ch.title, ch.lp, ch.cash))
            end
        end
    end
end

-- ==============================================================================
-- RETENTION: DAILY LOGIN STREAK & PRO-GEAR SKINS
-- ==============================================================================
function Player:claimLoginStreak()
    if self.claimed_today then
        print("\n[-] Already claimed today's login reward! Streak: Day " .. self.login_day .. "/7.")
        return
    end

    local cfg = STREAK_SCHEDULE[self.login_day] or STREAK_SCHEDULE[1]
    self.claimed_today = true
    self:addLP(cfg.lp)
    self.money = self.money + cfg.cash

    print(string.format("\n======================================================="))
    print(string.format("🔥 DAY %d LOGIN STREAK CLAIMED!", self.login_day))
    print(string.format("   Bonus LP: +%d LP | Bonus Cash: +$%d", cfg.lp, cfg.cash))

    if cfg.skin and SKINS_CATALOG[cfg.skin] then
        local s = SKINS_CATALOG[cfg.skin]
        if not self.unlocked_skins[s.id] then
            self.unlocked_skins[s.id] = s
            print(string.format("   🌟 NEW PRO-GEAR SKIN UNLOCKED: %s [%s] (%s)!", s.icon, s.name, s.rarity))
            print(string.format("   Buffs: +%d Mechanics, +%d Mental Composure", s.mechanics_bonus, s.mental_bonus))
            if not self.equipped_skin then
                self:equipSkin(s.id)
            end
        end
    end
    print(string.format("=======================================================\n"))
end

function Player:equipSkin(skin_id)
    local s = self.unlocked_skins[skin_id]
    if not s then
        print("[-] Skin not found or not unlocked yet.")
        return
    end
    self.equipped_skin = s
    print(string.format("\n[+] Equipped Pro-Gear Skin: %s [%s]!", s.icon, s.name))
end

function Player:viewWardrobe()
    print("\n=== PRO-GEAR WARDROBE ===")
    if self.equipped_skin then
        print(string.format("Equipped: %s [%s] (+%d Mech, +%d Mental)",
            self.equipped_skin.icon, self.equipped_skin.name, self.equipped_skin.mechanics_bonus, self.equipped_skin.mental_bonus))
    else
        print("Equipped: Default Amateur Gear (No stat bonus)")
    end

    local list = {}
    for _, s in pairs(self.unlocked_skins) do
        table.insert(list, s)
    end

    if #list == 0 then
        print("No skins unlocked. Maintain your 7-day login streak to unlock Epic & Legendary skins!")
        return
    end

    for idx, s in ipairs(list) do
        print(string.format("%d. %s [%s] (%s) -> +%d Mech, +%d Mental",
            idx, s.icon, s.name, s.rarity, s.mechanics_bonus, s.mental_bonus))
    end
    io.write("Select skin number to equip (0 to exit): ")
    local sel = tonumber(io.read()) or 0
    if sel > 0 and list[sel] then
        self:equipSkin(list[sel].id)
    end
end

-- ==============================================================================
-- PHASE 1: AMATEUR ACTIONS
-- ==============================================================================
function Player:playRanked()
    if self.energy < 20 then
        print("[-] Too exhausted to queue! Rest or sleep first.")
        return
    end

    self.energy = math.max(0, self.energy - 20)
    print("\n[+] Finding High-MMR Solo Queue Match...")

    local mech_bonus = self.equipped_skin and self.equipped_skin.mechanics_bonus or 0
    local ment_bonus = self.equipped_skin and self.equipped_skin.mental_bonus or 0

    local roll = math.random(1, 100)
    local winChance = 45 + ((self.mechanics + mech_bonus) * 0.25) + ((self.mental + ment_bonus) * 0.15)

    if roll <= winChance then
        self.streak = self.streak + 1
        local gain = math.random(22, 28)
        self.mental = math.min(100, self.mental + 3)
        self.mechanics = math.min(100, self.mechanics + 1)
        self:addLP(gain)
        self:checkChallenge("win3")
        print(string.format("[VICTORY] Won on Mid Ahri! +%d LP. Streak: %d", gain, self.streak))
    else
        self.streak = 0
        local loss = math.random(16, 21)
        self.mental = math.max(5, self.mental - 6)
        self:addLP(-loss)
        print(string.format("[DEFEAT] Teammate tilted. -%d LP.", loss))
    end
end

function Player:studyVODs()
    if self.energy < 15 then
        print("[-] Insufficient energy to analyze VODs.")
        return
    end
    self.energy = self.energy - 15
    self.mechanics = math.min(100, self.mechanics + 2)
    self.mental = math.min(100, self.mental + 3)
    self:checkChallenge("vod2")
    print("\n[+] Analyzed Worlds Finals VODs. (+2 Mechanics, +3 Mental)")
end

function Player:streamTwitch()
    if self.energy < 20 then
        print("[-] Too tired to stream.")
        return
    end
    self.energy = self.energy - 20
    local cash = math.random(80, 160) + math.floor(self.fame * 2)
    self.money = self.money + cash
    self.fame = math.min(100, self.fame + 3)
    self:checkChallenge("stream")
    print(string.format("\n[+] Stream ended! Earned +$%d. (Fame: %d)", cash, self.fame))
end

-- ==============================================================================
-- PHASE 2: ARENA STAGE (PICK & BAN DRAFT)
-- ==============================================================================
local Draft = {
    blue = { "Aatrox (TOP)", "Lee Sin (JUG)", "Azir (MID)", "Kai'Sa (ADC)", "Nautilus (SUP)" },
    red  = { "K'Sante (TOP)", "Viego (JUG)", "Ahri (MID)", "Jinx (ADC)", "Rakan (SUP)" }
}

function Draft:simulate()
    if not Game.unlocked[2] then
        print("\n🔒 LOCKED: Reach 1,000 LP (Challenger) in Solo Queue to get scouted as Team Captain!")
        return
    end

    print("\n=== ARENA STAGE: PICK & BAN DRAFT (TEAM CAPTAIN) ===")
    print("[BLUE TEAM]: " .. table.concat(self.blue, ", "))
    print("[RED TEAM] : " .. table.concat(self.red, ", "))

    local win = math.random() > 0.35
    if win then
        local prize = 160000 -- $40k match + $120k series
        Player.money = Player.money + prize
        print(string.format("\n[VICTORY] Match Won! +$%d Prize Money! Career Savings: $%s / $1,000,000",
            prize, string.format("%d", Player.money)))
        Game.trophies.regional_champ = true
        if Player.money >= 1000000 and not Game.unlocked[3] then
            print("\n👑 $1,000,000 CAREER MILESTONE: Ready to retire & buy esports org!\n")
        end
    else
        print("\n[DEFEAT] Enemy counter-flank took down your Nexus.")
    end
end

-- ==============================================================================
-- RETIREMENT & BUYOUT ($1,000,000)
-- ==============================================================================
function Game:retireAndBuyOrg()
    if Player.money < 1000000 then
        print(string.format("\n🔒 LOCKED: You have $%d. Need $1,000,000 to buy an Esports Franchise!", Player.money))
        return
    end
    Player.money = Player.money - 1000000
    Game.unlocked[3] = true
    Game.phase = 3
    print("\n=======================================================")
    print("🎉 RETIREMENT: You paid $1,000,000 and bought the Esports Org!")
    print("You are now Team Owner and General Manager. Build your Dynasty!")
    print("PHASE 3 (DYNASTY TYCOON) UNLOCKED!")
    print("=======================================================\n")
end

-- ==============================================================================
-- PHASE 3: WORLDS GRAND FINALS BEST OF 5
-- ==============================================================================
local Dynasty = {
    budget = 250000,
    fanHype = 14500
}

function Dynasty:playWorldsFinals()
    if not Game.unlocked[3] then
        print("\n🔒 LOCKED: Accumulate $1,000,000 in Phase 2 to retire and buy your team first!")
        return
    end

    print("\n🏆 THE WORLD CHAMPIONSHIP GRAND FINALS (BEST-OF-5) vs T1 DYNASTY")
    local wins = 0
    for g = 1, 4 do
        wins = wins + 1
        print(string.format("Game %d: VICTORY! (Series: %d - 0)", g, wins))
        if wins == 3 then break end
    end
    print("\n👑 WORLD CHAMPIONS! You hoisted the Summoner's Cup!")
    Game.trophies.worlds_cup = true
    Game.trophies.mvp_ring = true
end

-- ==============================================================================
-- CLI CONTROLLER
-- ==============================================================================
function Game:runMenu()
    math.randomseed(os.time())
    print("\n=======================================================")
    print("       ESPORTS LEGACY: ROAD TO WORLDS (TAPTAP MAKE)    ")
    print("  Solo Q -> 1k LP Challenger (Captain) -> $1M Buyout   ")
    print("=======================================================")

    while self.running do
        local p2 = self.unlocked[2] and "UNLOCKED" or "LOCKED (Need 1k LP)"
        local p3 = self.unlocked[3] and "UNLOCKED" or "LOCKED (Need $1M)"
        local skin_str = Player.equipped_skin and Player.equipped_skin.name or "None"
        local streak_str = Player.claimed_today and "CLAIMED" or "READY!"

        print(string.format("\n[STATUS] Phase %d | %s (%d LP) | Savings: $%s | Stage: %s | Org: %s",
            self.phase, Player.rank, Player.lp, string.format("%d", Player.money), p2, p3))
        print(string.format("[STREAK] Day %d/7 (%s) | Equipped Skin: [%s]",
            Player.login_day, streak_str, skin_str))
        print("\n=== [电竞传奇：登顶世界赛 - TAPTAP MAKE 移动端控制台] ===")
        print("1. 征战单双排排位 (Solo Q)")
        print("2. 深度钻研职业战队第一视角录像 (+微操)")
        print("3. 开启峡谷冲分直播 (+粉丝与签约金)")
        print("4. 基地体能恢复与深度睡眠 (+精力)")
        print("5. 领取每日登录连胜奖励 (+胜点与神装外设皮肤)")
        print("6. 职业外设专属装备库 (Wardrobe)")
        print("7. 职业赛场: 队长 BP 选人与战术博弈 (Phase 2)")
        print("8. 荣耀退役 & 斥资百万收购电竞豪门 ($1,000,000)")
        print("9. 豪门王朝: S赛全球总决赛 BO5 决战 T1 (Phase 3)")
        print("10. 全球百强传奇名人堂天梯榜 (Top 100 奖金与奖杯)")
        print("11. 全球星探 · SSS 神级选手十连招募 (Scout Gacha)")
        print("12. 基地日常 · CCTV 监控与突发事件应对 (Life Sim)")
        print("13. 决胜时刻 · 纳什男爵大龙坑战术决断 (Tactical Arena)")
        print("14. 战队羁绊 · 选手默契神经拓扑网络 (Synergy)")
        print("15. 神装外设 · 顶级电竞工坊与 RGB 激进超频 (Hardware)")
        print("0. 退出模拟器")
        io.write("\n请输入指令序号 (0-15): ")
        local choice = io.read()
        if choice == "1" then Player:playRanked()
        elseif choice == "2" then Player:studyVODs()
        elseif choice == "3" then Player:streamTwitch()
        elseif choice == "4" then Player.energy = math.min(100, Player.energy + 45)
        elseif choice == "5" then Player:claimLoginStreak()
        elseif choice == "6" then Player:viewWardrobe()
        elseif choice == "7" then self.phase = 2; Draft:simulate()
        elseif choice == "8" then self:retireAndBuyOrg()
        elseif choice == "9" then Dynasty:playWorldsFinals()
        elseif choice == "10" then
            print("\n🏆 【全球百强传奇名人堂天梯榜 TOP 5】")
            print("  #1 Faker (李相赫) - 5座召唤师杯 | $18,450,000 (GOAT)")
            print("  #2 Ruler (朴载赫) - 1座召唤师杯 | $9,800,000")
            print("  #3 Rookie (宋义进) - 1座召唤师杯 | $8,650,000")
            print("  #4 Scout (李汭燦) - 1座召唤师杯 | $8,120,000")
            print(string.format("  ★ 玩家排名: 当前生涯总奖金 $%d | 召唤师杯 %d 座", Player.money, Game.trophies.worlds_cup and 1 or 0))
        elseif choice == "11" then
            print("\n🌟 【S14 极光限定星探池 10连招募】")
            print("  [SSS] VORTEX (神级中单 // OVR 99 | APM 480) 签约成功！")
        elseif choice == "12" then
            print("\n🛋 【基地全天候 CCTV 监控终端】")
            print("  [CAM_01] 训练室: 高频实战对抗中 (复盘效率 +20%)")
            print("  [CAM_02] 心理疗愈室: 心率平稳 68bpm")
        elseif choice == "13" then
            print("\n🔥 【32:15 纳什男爵决胜决断】: 孤勇者中单进场秒C！0换3锁定胜局！")
        elseif choice == "14" then
            print("\n⚡ 【战队羁绊拓扑】: 黄金中野代练组合 LV.5 MAX 激活！先锋控速 +35%！")
        elseif choice == "15" then
            print("\n⚙ 【神装外设超频】: 档位锁定 125%！APM极限加成提升至 +1775！")
        elseif choice == "0" then self.running = false
        end
    end
end

if arg and arg[0] then Game:runMenu() end
return Game
