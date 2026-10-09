--[[
    ESPORTS LEGACY: ROAD TO WORLDS
    Complete Master Entry Point in Pure Lua 5.1+ / LuaJIT
    A 3-Phase Esports Career Simulator:
      Phase 1: Amateur Solo Queue Life Sim (Reach 1,000 LP Challenger to unlock Pro Stage)
      Phase 2: Pro Stage Team Captain (Lead Pick/Ban & accumulate $1,000,000 in tournament prizes)
      Phase 3: Retire from Playing & Buy an Esports Organization (Lead Org to Worlds Summoner's Cup)
--]]

local Champions = require("champions")
local Gear = require("gear")
local Events = require("events")
local Draft = require("draft")
local Dynasty = require("dynasty")
local MatchSim = require("match_sim")
local LoginStreak = require("login_streak")

local EsportsGame = {
    phase = 1,
    running = true,
    unlocked_phases = { [1] = true, [2] = false, [3] = false },
    player = {
        lp = 340,
        rank = "Gold",
        mechanics = 55,
        mental = 70,
        energy = 85,
        money = 180,
        fame = 15,
        streak = 2,
        gear = {}
    },
    login_streak = LoginStreak.new(),
    daily_challenges = {
        { id = "win3", title = "Grind Master", target = 3, current = 0, reward_lp = 45, reward_cash = 60, claimed = false },
        { id = "vod2", title = "VOD Analyst",  target = 2, current = 0, reward_lp = 25, reward_cash = 30, claimed = false },
        { id = "stream", title = "Bootcamp Stream", target = 1, current = 0, reward_lp = 20, reward_cash = 80, claimed = false }
    },
    draft = Draft.new(),
    dynasty = Dynasty.new(),
    trophies = {
        challenger = false,
        regional_champ = false,
        worlds_cup = false,
        mvp_ring = false
    }
}

function EsportsGame:calculateRank()
    local lp = self.player.lp
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

function EsportsGame:addLP(delta)
    self.player.lp = math.max(0, self.player.lp + delta)
    local new_rank = self:calculateRank()
    if new_rank ~= self.player.rank then
        print(string.format("\n🏆 RANK PROMOTION: You are now %s (%d LP)!", new_rank, self.player.lp))
        self.player.rank = new_rank
    end

    if self.player.lp >= 1000 and not self.trophies.challenger then
        self.trophies.challenger = true
        self.unlocked_phases[2] = true
        print("\n============================================================")
        print("🌟 MILESTONE REACHED: 1,000 LP CHALLENGER (HIGHEST RANK)!")
        print("Scouts from Pro Academy have signed you as Starting Team Captain!")
        print("PHASE 2 (THE STAGE: PICK & BAN DRAFT) IS NOW UNLOCKED!")
        print("============================================================\n")
    end
end

function EsportsGame:checkDaily(type_id)
    for _, ch in ipairs(self.daily_challenges) do
        if ch.id == type_id and not ch.claimed then
            ch.current = math.min(ch.target, ch.current + 1)
            if ch.current >= ch.target then
                ch.claimed = true
                self:addLP(ch.reward_lp)
                self.player.money = self.player.money + ch.reward_cash
                print(string.format("\n🎁 DAILY CHALLENGE COMPLETED: [%s]! Claimed +%d LP & +$%d!", ch.title, ch.reward_lp, ch.reward_cash))
            end
        end
    end
end

function EsportsGame:claimLoginStreak()
    local ok, msg, bonus_lp, bonus_cash, skin = self.login_streak:claim(self.player)
    print("\n" .. msg)
    if ok then
        self:addLP(bonus_lp)
        self.player.money = self.player.money + bonus_cash
    end
end

function EsportsGame:viewSkinsWardrobe()
    print("\n=== PRO-GEAR SKINS WARDROBE ===")
    local active_m, active_mt, active_name = self.login_streak:getActiveBuffs()
    print(string.format("Currently Equipped: [%s] (+%d Mechanics, +%d Mental)", active_name, active_m, active_mt))
    
    local list = {}
    for id, skin in pairs(self.login_streak.unlocked_skins) do
        table.insert(list, skin)
    end

    if #list == 0 then
        print("No Pro-Gear skins unlocked yet. Keep your daily login streak active! (Day 3: Neon Keyboard, Day 5: T1 Jersey, Day 7: Golden Mouse)")
        return
    end

    for i, s in ipairs(list) do
        print(string.format("%d. %s [%s] (%s) -> +%d Mech, +%d Mental", i, s.icon, s.name, s.rarity, s.mechanics_bonus, s.mental_bonus))
    end
    io.write("Select skin to equip (0 to cancel): ")
    local sel = tonumber(io.read()) or 0
    if sel > 0 and list[sel] then
        local ok, equip_msg = self.login_streak:equipSkin(list[sel].id, self.player)
        print("\n" .. equip_msg)
    end
end

-- PHASE 1 ACTIONS
function EsportsGame:playRanked()
    if self.player.energy < 20 then
        print("[-] Too exhausted to play Solo Queue. Rest or sleep first.")
        return
    end

    self.player.energy = math.max(0, self.player.energy - 20)
    local mech_buff, ment_buff = self.login_streak:getActiveBuffs()

    if math.random(1, 100) > 40 then
        local ev = Events.getRandom()
        print("\n[ENCOUNTER]: " .. ev.title)
        print(ev.scenario)
        print("1. " .. ev.options[1].label .. " (" .. ev.options[1].risk .. " Risk)")
        if ev.options[2] then print("2. " .. ev.options[2].label .. " (" .. ev.options[2].risk .. " Risk)") end

        io.write("Choose option: ")
        local opt = tonumber(io.read()) or 1
        local choice = ev.options[opt] or ev.options[1]
        local outcome = choice.execute(self.player)

        print("\n" .. outcome.log)
        self:addLP(outcome.lp)
        if outcome.success then self:checkDaily("win3") end
        self.player.mechanics = math.min(100, math.max(10, self.player.mechanics + outcome.mechanics))
        self.player.mental = math.min(100, math.max(5, self.player.mental + outcome.mental))
        self.player.money = self.player.money + outcome.money
    else
        local win_prob = 45 + ((self.player.mechanics + mech_buff) * 0.25) + ((self.player.mental + ment_buff) * 0.15)
        local roll = math.random(1, 100)
        if roll <= win_prob then
            self.player.streak = self.player.streak + 1
            local gain = math.random(22, 28)
            self:addLP(gain)
            self:checkDaily("win3")
            print(string.format("\n[VICTORY] Won on Mid Ahri! +%d LP. Streak: %d", gain, self.player.streak))
        else
            self.player.streak = 0
            local loss = math.random(16, 21)
            self:addLP(-loss)
            print(string.format("\n[DEFEAT] Lost late objective teamfight. -%d LP.", loss))
        end
    end
end

function EsportsGame:watchReplays()
    if self.player.energy < 15 then
        print("[-] Insufficient energy to analyze VODs.")
        return
    end
    self.player.energy = self.player.energy - 15
    self.player.mechanics = math.min(100, self.player.mechanics + 2)
    self.player.mental = math.min(100, self.player.mental + 3)
    self:checkDaily("vod2")
    print("\n[+] Studied Worlds Finals VODs. (+2 Mechanics, +3 Mental)")
end

function EsportsGame:streamTwitch()
    if self.player.energy < 20 then
        print("[-] Too tired to stream.")
        return
    end
    self.player.energy = self.player.energy - 20
    local cash = math.random(75, 160) + math.floor(self.player.fame * 2)
    self.player.money = self.player.money + cash
    self.player.fame = math.min(100, self.player.fame + 3)
    self:checkDaily("stream")
    print(string.format("\n[+] Twitch Bootcamp finished! Earned $%d. (Fame: %d)", cash, self.player.fame))
end

function EsportsGame:rest()
    self.player.energy = math.min(100, self.player.energy + 45)
    self.player.mental = math.min(100, self.player.mental + 18)
    print("\n[+] Slept and ate well. Energy (+45) and Mental (+18) restored!")
end

-- PHASE 2: TEAM CAPTAIN ARENA STAGE (EARNING TOWARDS $1,000,000)
function EsportsGame:playStageMatch()
    if not self.unlocked_phases[2] then
        print("\n🔒 LOCKED: Reach 1,000 LP (Challenger) in Solo Queue first to get scouted as Team Captain!")
        return
    end

    print("\n=== ARENA STAGE: 5v5 PICK & BAN DRAFT (CAPTAIN LEADER) ===")
    Draft.autoDraft(self.draft)
    local blue_pct, red_pct = Draft.calculateScores(self.draft)

    print(string.format("[DRAFT RATINGS] Blue Team: %d%% | Red Team: %d%%", blue_pct, red_pct))
    local won, logs = MatchSim.run(self.draft.blue_picks, self.draft.red_picks, blue_pct)
    for _, l in ipairs(logs) do print(l) end

    if won then
        local prize = 40000
        local series_bonus = 120000
        local total_earned = prize + series_bonus
        self.player.money = self.player.money + total_earned
        print(string.format("\n💰 STADIUM PURSE EARNED: +$%d! Current Career Savings: $%s / $1,000,000",
            total_earned, string.format("%d", self.player.money)))
        self.trophies.regional_champ = true

        if self.player.money >= 1000000 and not self.unlocked_phases[3] then
            print("\n============================================================")
            print("👑 $1,000,000 CAREER EARNINGS ACHIEVED!")
            print("You can now RETIRE as active player and BUY your own Esports Org!")
            print("============================================================\n")
        end
    end
end

-- RETIREMENT & BUYOUT
function EsportsGame:retireAndBuyOrg()
    if self.player.money < 1000000 then
        print(string.format("\n🔒 LOCKED: You have $%d. Need $1,000,000 to buy an Esports Franchise!", self.player.money))
        return
    end

    self.player.money = self.player.money - 1000000
    self.unlocked_phases[3] = true
    self.phase = 3
    print("\n============================================================")
    print("🎉 RETIREMENT CEREMONY: JERSEY HUNG IN THE RAFTERS!")
    print("You paid $1,000,000 and acquired an official Esports Franchise!")
    print("You are now Team Owner and General Manager. Build your Dynasty!")
    print("============================================================\n")
end

-- PHASE 3: WORLDS GRAND FINALS BEST OF 5
function EsportsGame:playWorldsFinals()
    if not self.unlocked_phases[3] then
        print("\n🔒 LOCKED: Accumulate $1,000,000 in Phase 2 to retire and buy your esports org first!")
        return
    end

    print("\n============================================================")
    print("🏆 THE WORLD CHAMPIONSHIP GRAND FINALS (BEST-OF-5)")
    print("            YOUR DYNASTY  vs  T1 DYNASTY                    ")
    print("============================================================")

    local power = self.dynasty:getTeamPower()
    local win_prob = 50 + ((power - 97) * 4)
    local your_wins = 0
    local opp_wins = 0

    for game = 1, 5 do
        if math.random(1, 100) <= win_prob then
            your_wins = your_wins + 1
            print(string.format("Game %d: VICTORY! (Series: %d - %d)", game, your_wins, opp_wins))
        else
            opp_wins = opp_wins + 1
            print(string.format("Game %d: DEFEAT. (Series: %d - %d)", game, your_wins, opp_wins))
        end

        if your_wins == 3 then
            print("\n👑 WORLD CHAMPIONS! The Summoner's Cup has been hoisted!")
            self.trophies.worlds_cup = true
            self.trophies.mvp_ring = true
            break
        elseif opp_wins == 3 then
            print("\n💔 Defeated in Game 5. Train hard for next Worlds!")
            break
        end
    end
end

-- MAIN CLI MENU
function EsportsGame:run()
    math.randomseed(os.time())
    print("============================================================")
    print("         ESPORTS LEGACY: ROAD TO WORLDS (LUA)               ")
    print("  Solo Q -> 1k LP Challenger (Team Captain) -> $1M Buyout   ")
    print("============================================================")

    while self.running do
        local p2_status = self.unlocked_phases[2] and "UNLOCKED" or "LOCKED (Need 1k LP)"
        local p3_status = self.unlocked_phases[3] and "UNLOCKED" or "LOCKED (Need $1M)"
        local _, _, skin_name = self.login_streak:getActiveBuffs()
        local streak_status = self.login_streak.claimed_today and "CLAIMED" or "READY!"

        print(string.format("\n[STATUS] Phase %d | %s (%d LP) | Savings: $%s | Stage: %s | Org: %s",
            self.phase, self.player.rank, self.player.lp, string.format("%d", self.player.money), p2_status, p3_status))
        print(string.format("[STREAK] Day %d/7 (%s) | Equipped Gear: [%s]",
            self.login_streak.current_streak, streak_status, skin_name))
        print("1. Play Ranked Match (Solo Q)")
        print("2. Study Pro VODs (+Mech)")
        print("3. Twitch Stream (+Money)")
        print("4. Sleep & Rest (+Energy)")
        print("5. Stage: Pick & Ban Match (Team Captain)")
        print("6. Retire & Buy Esports Org ($1,000,000)")
        print("7. Dynasty: Worlds Finals Bo5 (Org Owner)")
        print("8. Claim Daily Login Streak (Bonus LP + Pro-Gear Skins)")
        print("9. Pro-Gear Skins Wardrobe")
        print("0. Exit")
        io.write("Select (0-9): ")

        local c = io.read()
        if c == "1" then self:playRanked()
        elseif c == "2" then self:watchReplays()
        elseif c == "3" then self:streamTwitch()
        elseif c == "4" then self:rest()
        elseif c == "5" then self:playStageMatch()
        elseif c == "6" then self:retireAndBuyOrg()
        elseif c == "7" then self:playWorldsFinals()
        elseif c == "8" then self:claimLoginStreak()
        elseif c == "9" then self:viewSkinsWardrobe()
        elseif c == "0" then self.running = false
        else print("Invalid choice.") end
    end
end

if arg and arg[0] then EsportsGame:run() end
return EsportsGame
