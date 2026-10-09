--[[
    ============================================================================
    TAPTAP MAKE: ESPORTS LEGACY: ROAD TO WORLDS (OFFICIAL GAME SCRIPT)
    ============================================================================
    Target Platform: TapTap Make (Mobile Portrait Text-Simulator Engine)
    Language: Pure Lua 5.1 / 5.2 / 5.3 / LuaJIT

    Game Loop & Progression:
      Phase 1: Amateur Solo Queue (Grind to 1,000 LP Challenger to unlock Pro Stage)
        - Daily Login Streak System with Pro-Gear Skins (Neon Keyboard, T1 Jersey, Golden Mouse)
        - Daily Challenges System (Grind 3 wins, 2 VODs, 1 Stream for bonus LP)
        - Dynamic solo queue event encounters (Baron steals, mental checks, 1v2 outplays)
      Phase 2: The Stage: Team Captain (Pick & Ban 5v5 Draft)
        - Draft picks, bans, counter-picks, role synergies
        - Earn stadium purses up to $1,000,000 career cash
      Phase 3: Retirement & Esports Dynasty Tycoon (Org Owner)
        - Buy esports franchise for $1,000,000
        - Scout superstar roster, upgrade gaming house, sign enterprise sponsors
        - Worlds Championship Grand Finals (Best of 5 vs T1 Dynasty)
--]]

local LoginStreak = require("login_streak")
local Champions   = require("champions")
local Gear        = require("gear")
local Events      = require("events")
local Draft       = require("draft")
local Dynasty     = require("dynasty")
local MatchSim    = require("match_sim")
local CareerMilestones = require("career_milestones")

local TapTapGame = {}
TapTapGame.__index = TapTapGame

function TapTapGame.new()
    local self = setmetatable({}, TapTapGame)

    -- Game Lifecycle
    self.version = "2.4.0-taptap"
    self.phase = 1               -- 1: Amateur, 2: Stage, 3: Dynasty
    self.unlocked_phases = { [1] = true, [2] = false, [3] = false }

    -- Player Core Attributes
    self.player = {
        name = "Prodigy",
        lp = 340,
        rank = "Gold",
        mechanics = 55,          -- 0 - 100
        mental = 70,             -- 0 - 100
        energy = 85,             -- 0 - 100
        money = 180,             -- Career savings ($)
        fame = 15,               -- Streaming popularity
        win_streak = 2,
        games_played = 14,
        wins = 9,
        inventory_gear = {}
    }

    -- Retention System: 7-Day Login Streak & Pro-Gear Skins
    self.login_streak = LoginStreak.new()

    -- Retention System: Daily Challenges
    self.daily_challenges = {
        { id = "win3",   title = "Grind Master",     desc = "Win 3 ranked games today",       target = 3, current = 0, reward_lp = 45, reward_cash = 60,  claimed = false },
        { id = "vod2",   title = "VOD Analyst",      desc = "Study 2 pro match replays",      target = 2, current = 0, reward_lp = 25, reward_cash = 30,  claimed = false },
        { id = "stream", title = "Bootcamp Stream",  desc = "Stream 1 high-MMR ranked grind", target = 1, current = 0, reward_lp = 20, reward_cash = 80,  claimed = false }
    }

    -- Modules for Phase 2 & Phase 3
    self.draft_engine = Draft.new()
    self.dynasty_engine = Dynasty.new()
    self.milestones_engine = CareerMilestones.new()

    -- Trophies & Milestones
    self.trophies = {
        challenger = false,
        regional_champ = false,
        worlds_cup = false,
        mvp_ring = false
    }

    self.recent_logs = {}
    self:log("Welcome to Esports Legacy: Road to Worlds (TapTap Make Edition)!")
    return self
end

function TapTapGame:log(text)
    table.insert(self.recent_logs, 1, string.format("[%s] %s", os.date("%H:%M:%S"), text))
    if #self.recent_logs > 25 then
        table.remove(self.recent_logs)
    end
end

-- ============================================================================
-- RANK & LP PROGRESSION LOGIC
-- ============================================================================
function TapTapGame:calculateRank()
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

function TapTapGame:addLP(delta)
    self.player.lp = math.max(0, self.player.lp + delta)
    local new_rank = self:calculateRank()

    if new_rank ~= self.player.rank then
        self:log(string.format("🏆 PROMOTION! Promoted from %s to %s (%d LP)!", self.player.rank, new_rank, self.player.lp))
        self.player.rank = new_rank
    end

    -- Highest rank condition: 1,000 LP Challenger
    if self.player.lp >= 1000 and not self.trophies.challenger then
        self.trophies.challenger = true
        self.unlocked_phases[2] = true
        self:log("🌟 MILESTONE ACHIEVED: 1,000 LP CHALLENGER!")
        self:log("Tier 1 Pro Scouts offered you a Starting Team Captain contract!")
        self:log("PHASE 2 (PRO ARENA STAGE: PICK & BAN DRAFT) UNLOCKED!")
    end
end

-- ============================================================================
-- DAILY LOGIN STREAK SYSTEM (RETENTION HOOK)
-- ============================================================================
function TapTapGame:claimDailyLogin()
    local ok, msg, bonus_lp, bonus_cash, skin = self.login_streak:claim(self.player)
    self:log(msg)
    if ok then
        self:addLP(bonus_lp)
        self.player.money = self.player.money + bonus_cash
    end
    return ok, msg
end

function TapTapGame:equipSkin(skin_id)
    local ok, msg = self.login_streak:equipSkin(skin_id, self.player)
    self:log(msg)
    return ok, msg
end

-- ============================================================================
-- DAILY CHALLENGES PROGRESS
-- ============================================================================
function TapTapGame:advanceChallenge(challenge_id)
    for _, ch in ipairs(self.daily_challenges) do
        if ch.id == challenge_id and not ch.claimed then
            ch.current = math.min(ch.target, ch.current + 1)
            if ch.current >= ch.target then
                ch.claimed = true
                self:addLP(ch.reward_lp)
                self.player.money = self.player.money + ch.reward_cash
                self:log(string.format("🎁 CHALLENGE COMPLETED: [%s] (+%d LP, +$%d)!", ch.title, ch.reward_lp, ch.reward_cash))
            end
        end
    end
end

-- ============================================================================
-- PHASE 1: AMATEUR ACTIONS
-- ============================================================================
function TapTapGame:actionSoloQueue()
    if self.player.energy < 20 then
        self:log("[-] Not enough energy to queue. Rest or sleep first.")
        return false
    end

    self.player.energy = math.max(0, self.player.energy - 20)
    self.player.games_played = self.player.games_played + 1

    -- Passive skin buffs
    local mech_buff, ment_buff, skin_name = self.login_streak:getActiveBuffs()

    -- 40% chance of dynamic tactical encounter
    if math.random(1, 100) <= 40 then
        local ev = Events.getRandom()
        local choice = ev.options[1] -- TapTap default action or player selection
        local outcome = choice.execute(self.player)
        self:addLP(outcome.lp)
        self.player.mechanics = math.min(100, math.max(10, self.player.mechanics + outcome.mechanics))
        self.player.mental = math.min(100, math.max(5, self.player.mental + outcome.mental))
        self.player.money = self.player.money + outcome.money

        if outcome.success then
            self.player.wins = self.player.wins + 1
            self.player.win_streak = self.player.win_streak + 1
            self:advanceChallenge("win3")
        else
            self.player.win_streak = 0
        end

        self:log(string.format("[SOLO Q EVENT: %s] %s", ev.title, outcome.log))
        return true
    end

    -- Standard MMR Matchmaking calculation
    local eff_mech = self.player.mechanics + mech_buff
    local eff_ment = self.player.mental + ment_buff
    local win_rate = 45 + (eff_mech * 0.25) + (eff_ment * 0.15)
    local roll = math.random(1, 100)

    if roll <= win_rate then
        local lp_gain = math.random(22, 28)
        self.player.wins = self.player.wins + 1
        self.player.win_streak = self.player.win_streak + 1
        self.player.mental = math.min(100, self.player.mental + 2)
        self:addLP(lp_gain)
        self:advanceChallenge("win3")
        self:log(string.format("🟢 VICTORY in Solo Q! +%d LP (Streak: %d) with [%s].", lp_gain, self.player.win_streak, skin_name))
        return true
    else
        local lp_loss = math.random(16, 21)
        self.player.win_streak = 0
        self.player.mental = math.max(5, self.player.mental - 5)
        self:addLP(-lp_loss)
        self:log(string.format("🔴 DEFEAT in Solo Q. -%d LP. Teammate caught out out-of-position.", lp_loss))
        return false
    end
end

function TapTapGame:actionStudyVOD()
    if self.player.energy < 15 then
        self:log("[-] Insufficient energy to analyze pro VODs.")
        return false
    end
    self.player.energy = self.player.energy - 15
    self.player.mechanics = math.min(100, self.player.mechanics + 2)
    self.player.mental = math.min(100, self.player.mental + 3)
    self:advanceChallenge("vod2")
    self:log("📘 Studied Worlds Final macro replays. (+2 Mechanics, +3 Mental)")
    return true
end

function TapTapGame:actionStream()
    if self.player.energy < 20 then
        self:log("[-] Too exhausted to broadcast.")
        return false
    end
    self.player.energy = self.player.energy - 20
    local payout = math.random(80, 160) + math.floor(self.player.fame * 2.2)
    self.player.money = self.player.money + payout
    self.player.fame = math.min(100, self.player.fame + 3)
    self:advanceChallenge("stream")
    self:log(string.format("🎥 Live Twitch stream concluded! Earned +$%d! Fame now: %d", payout, self.player.fame))
    return true
end

function TapTapGame:actionRest()
    self.player.energy = math.min(100, self.player.energy + 45)
    self.player.mental = math.min(100, self.player.mental + 18)
    self:log("💤 Rested & ate healthy. Energy (+45) and Mental Composure (+18) restored.")
    return true
end

-- ============================================================================
-- PHASE 2: TEAM CAPTAIN ARENA STAGE (PICK & BAN DRAFT)
-- ============================================================================
function TapTapGame:actionPlayStageMatch()
    if not self.unlocked_phases[2] then
        self:log("🔒 LOCKED: Reach 1,000 LP (Challenger) in Solo Queue first to unlock Team Captaincy!")
        return false
    end

    Draft.autoDraft(self.draft_engine)
    local blue_pct, red_pct = Draft.calculateScores(self.draft_engine)
    local won, logs = MatchSim.run(self.draft_engine.blue_picks, self.draft_engine.red_picks, blue_pct)

    for _, l in ipairs(logs) do self:log(l) end

    if won then
        local purse = 150000
        self.player.money = self.player.money + purse
        self.trophies.regional_champ = true
        self:log(string.format("🏆 ARENA STAGE VICTORY! Purse: +$%d! Total Savings: $%s / $1,000,000",
            purse, string.format("%d", self.player.money)))

        if self.player.money >= 1000000 and not self.unlocked_phases[3] then
            self:log("============================================================")
            self:log("👑 $1,000,000 CAREER WEALTH ACCUMULATED!")
            self:log("You qualify to RETIRE as a player and BUY an Esports Organization!")
            self:log("============================================================")
        end
        return true
    else
        self:log("❌ ARENA STAGE DEFEAT. Team draft synergy was out-rotated.")
        return false
    end
end

-- ============================================================================
-- RETIREMENT & BUYOUT ($1,000,000)
-- ============================================================================
function TapTapGame:actionRetireAndBuyOrg()
    if self.player.money < 1000000 then
        self:log(string.format("🔒 LOCKED: Need $1,000,000. You have $%d.", self.player.money))
        return false
    end

    self.player.money = self.player.money - 1000000
    self.unlocked_phases[3] = true
    self.phase = 3
    self:log("============================================================")
    self:log("🎉 RETIREMENT OFFICIAL: Jersey retired in the Esports Hall of Fame!")
    self:log("You paid $1,000,000 and purchased a Worlds Franchise Organization!")
    self:log("PHASE 3 (DYNASTY TYCOON) UNLOCKED! Welcome, Team Owner.")
    self:log("============================================================")
    return true
end

-- ============================================================================
-- PHASE 3: WORLDS FINALS BEST OF 5
-- ============================================================================
function TapTapGame:actionWorldsFinals()
    if not self.unlocked_phases[3] then
        self:log("🔒 LOCKED: Accumulate $1,000,000, retire, and buy an org first!")
        return false
    end

    local team_power = self.dynasty_engine:getTeamPower()
    local win_prob = 50 + ((team_power - 97) * 4)
    local player_wins = 0
    local opp_wins = 0

    self:log("🏆 THE WORLDS GRAND FINALS (BO5) COMMENCED!")
    for g = 1, 5 do
        if math.random(1, 100) <= win_prob then
            player_wins = player_wins + 1
            self:log(string.format("  Game %d: VICTORY! (%d - %d)", g, player_wins, opp_wins))
        else
            opp_wins = opp_wins + 1
            self:log(string.format("  Game %d: DEFEAT. (%d - %d)", g, player_wins, opp_wins))
        end

        if player_wins == 3 then
            self.trophies.worlds_cup = true
            self.trophies.mvp_ring = true
            self:log("👑 WORLD CHAMPIONS! Your dynasty lifted the Summoner's Cup!")
            return true
        elseif opp_wins == 3 then
            self:log("💔 Defeated 2-3 in Silver Scrapes. Upgrade facilities for next season!")
            return false
        end
    end
    return false
end

-- ============================================================================
-- CAREER MILESTONES & UNIQUE TITLES API
-- ============================================================================
function TapTapGame:checkMilestones()
    local newly = self.milestones_engine:evaluate(self.player, self.dynasty_engine, {
        worlds_won = self.trophies.worlds_cup and 1 or 0,
        gear_count = #(self.player.inventory_gear or {})
    })
    for _, m in ipairs(newly) do
        self:log(string.format("🎖️【生涯里程碑达成】解锁至尊专属称号: %s (%s)！", m.title, m.bonus_desc))
    end
    return newly
end

function TapTapGame:equipTitle(title_name)
    local ok, msg = self.milestones_engine:equip(title_name)
    self:log(msg)
    return ok, msg
end

function TapTapGame:renderMilestones()
    self:checkMilestones()
    self.milestones_engine:renderCLI()
end

-- ============================================================================
-- TAPTAP MAKE UI STATE EXPORTER
-- ============================================================================
function TapTapGame:getViewState()
    self:checkMilestones()
    local mech_buff, ment_buff, skin_name = self.login_streak:getActiveBuffs()
    return {
        phase = self.phase,
        rank = self.player.rank,
        lp = self.player.lp,
        money = self.player.money,
        energy = self.player.energy,
        mechanics = self.player.mechanics + mech_buff,
        mental = self.player.mental + ment_buff,
        equipped_skin = skin_name,
        active_title = self.milestones_engine.active_title,
        streak_day = self.login_streak.current_streak,
        streak_claimed = self.login_streak.claimed_today,
        can_unlock_phase2 = self.player.lp >= 1000,
        can_retire_phase3 = self.player.money >= 1000000,
        trophies = self.trophies,
        logs = self.recent_logs
    }
end

-- TapTap Make Engine Hook
return TapTapGame
