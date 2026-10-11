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
local CareerHealth = require("career_health")
local StreamingMilestones = require("streaming_milestones")
local RivalrySystem = require("rivalry_system")
local PrestigeSystem = require("prestige_system")
local WorldTour = require("world_tour")
local EsportsEventEngine = require("esports_event_engine")
local GlobalPowerRankings = require("global_power_rankings")
local PostMatchMVP = require("post_match_mvp")
local ok_comm, CommunityRelations = pcall(require, "community_relations")
if not ok_comm or type(CommunityRelations) ~= "table" then
    CommunityRelations = require("lua.community_relations")
end

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
        focus = 90,              -- 0 - 100 专注度 (高强度活动消耗，休整/咖啡恢复)
        energy_drinks = 2,       -- 备用战备特调咖啡/冰美式
        money = 180,             -- Career savings ($)
        fame = 15,               -- Streaming popularity
        win_streak = 2,
        games_played = 14,
        wins = 9,
        inventory_gear = {},
        promo_series = nil,
        recovery_room = {
            soundproofing = 0,
            bedding = 0,
            atmosphere = 0
        },
        agency = {
            hired_agent = nil,
            signed_sponsors = {},
            total_earned = 0
        },
        career_health = CareerHealth.newDefaultState(),
        stream_channel = StreamingMilestones.newDefaultState(),
        rivalry = RivalrySystem.newDefaultState(),
        confidence = PostMatchMVP.newDefaultPlayerConfidence(),
        mvp_stats = { total_mvp = 0, solo_mvp = 0, stage_mvp = 0 }
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
    self.prestige_engine = PrestigeSystem.new()
    self.world_tour_engine = WorldTour.new()
    self.esports_engine = EsportsEventEngine.new()
    self.power_rankings_engine = GlobalPowerRankings.new()
    self.mvp_engine = PostMatchMVP.new()
    self.community_engine = CommunityRelations.new()
    if self.dynasty_engine and self.dynasty_engine.community then
        self.community_engine = self.dynasty_engine.community
    end

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
-- RANK & LP PROGRESSION & BO3/BO5 PROMO SERIES MANAGER (TAPTAP MAKE)
-- ============================================================================
TapTapGame.PROMO_CONFIG = {
    ["Iron"]        = { next = "Bronze",      lp = 100,  format = "BO3", req_wins = 2, req_consecutive = 2 },
    ["Bronze"]      = { next = "Silver",      lp = 200,  format = "BO3", req_wins = 2, req_consecutive = 2 },
    ["Silver"]      = { next = "Gold",        lp = 300,  format = "BO3", req_wins = 2, req_consecutive = 2 },
    ["Gold"]        = { next = "Platinum",    lp = 400,  format = "BO3", req_wins = 2, req_consecutive = 2 },
    ["Platinum"]    = { next = "Emerald",     lp = 550,  format = "BO3", req_wins = 2, req_consecutive = 2 },
    ["Emerald"]     = { next = "Diamond",     lp = 700,  format = "BO3", req_wins = 2, req_consecutive = 2 },
    ["Diamond"]     = { next = "Master",      lp = 850,  format = "BO5", req_wins = 3, req_consecutive = 3 },
    ["Master"]      = { next = "Grandmaster", lp = 950,  format = "BO5", req_wins = 3, req_consecutive = 3 },
    ["Grandmaster"] = { next = "Challenger",  lp = 1000, format = "BO5", req_wins = 3, req_consecutive = 3 }
}

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

function TapTapGame:triggerPromoSeries(target_tier, override_format)
    local cur_tier = self.player.rank
    local conf = TapTapGame.PROMO_CONFIG[cur_tier]
    local target = target_tier or (conf and conf.next) or "Platinum"
    local is_apex = (target == "Master" or target == "Grandmaster" or target == "Challenger")
    local format = override_format or (conf and conf.format) or (is_apex and "BO5" or "BO3")
    local max_games = (format == "BO5") and 5 or 3
    local req_wins = (format == "BO5") and 3 or 2

    self.player.promo_series = {
        target_tier = target,
        current_tier = cur_tier,
        wins = 0,
        losses = 0,
        consecutive_wins = 0,
        required_wins = req_wins,
        required_consecutive_wins = req_wins,
        max_games = max_games,
        history = {},
        active = true,
        format = format
    }
    self:log(string.format("⚔️ 【%s 生死晋级赛】正式打响！赛制: %s (需赢下 %d 局或斩获连续击破)，全网焦点瞩目！",
        target, format, req_wins))
    return true
end

function TapTapGame:advancePromoSeries(is_win)
    local promo = self.player.promo_series
    if not promo or not promo.active then return false end

    table.insert(promo.history, is_win and "WIN" or "LOSS")
    if is_win then
        promo.wins = promo.wins + 1
        promo.consecutive_wins = promo.consecutive_wins + 1
    else
        promo.losses = promo.losses + 1
        promo.consecutive_wins = 0
    end

    local score_str = string.format("%d-%d", promo.wins, promo.losses)
    local won_series = (promo.consecutive_wins >= promo.required_consecutive_wins) or (promo.wins >= promo.required_wins)
    local lost_series = (not won_series) and (promo.losses > promo.max_games - promo.required_wins or #promo.history >= promo.max_games)

    if won_series then
        self:log(string.format("🏆 晋级成功！比分【%s】斩获 %s 晋级赛！荣登【%s】！知名度+15，胜点+25 LP！",
            score_str, promo.format, promo.target_tier))
        self.player.rank = promo.target_tier
        self.player.promo_series = nil
        self.player.lp = self.player.lp + 25
        self.player.fame = math.min(100, self.player.fame + 15)

        if self.player.rank == "Challenger" and not self.trophies.challenger then
            self.trophies.challenger = true
            self.unlocked_phases[2] = true
            self:log("🌟 MILESTONE ACHIEVED: 1,000 LP CHALLENGER!")
        end
        return true, "PROMOTED", score_str
    elseif lost_series then
        self:log(string.format("💀 晋级赛遗憾惜败 (终局比分【%s】)。积分回退 20 LP，吸取经验调整心态！", score_str))
        self.player.promo_series = nil
        self.player.lp = math.max(0, self.player.lp - 20)
        return false, "FAILED", score_str
    else
        self:log(string.format("⚔️ 晋级赛第 %d 局战罢 (%s)！当前比分【%s】(连胜: %d/%d)！",
            #promo.history, is_win and "胜" or "负", score_str, promo.consecutive_wins, promo.required_consecutive_wins))
        return true, "IN_PROGRESS", score_str
    end
end

function TapTapGame:forfeitPromoSeries()
    if self.player.promo_series and self.player.promo_series.active then
        self:log("⚠️ 主动放弃晋级赛：重置系列赛进度，扣除 20 LP。")
        self.player.promo_series = nil
        self.player.lp = math.max(0, self.player.lp - 20)
        return true
    end
    return false
end

function TapTapGame:renderPromoSeries()
    local promo = self.player.promo_series
    if not promo or not promo.active then
        local conf = TapTapGame.PROMO_CONFIG[self.player.rank]
        local next_tier = conf and conf.next or "Max"
        local req_lp = conf and conf.lp or 1000
        print("\n---------------- 🏆 天梯晋级备战中心 (PROMO SERIES) ----------------")
        print(string.format("【当前段位】%s (%d LP) ➔ 【目标段位】%s (%d LP 门槛)",
            self.player.rank, self.player.lp, next_tier, req_lp))
        print(string.format("还差 %d LP 触发 %s 生死晋级赛 (需赢下 %d 局或连胜达标)！",
            math.max(0, req_lp - self.player.lp), conf and conf.format or "BO3", conf and conf.req_wins or 2))
        print("--------------------------------------------------------------------\n")
        return
    end

    print("\n================ ⚔️ 生死晋级赛管理器 (PROMO SERIES MANAGER) ================")
    print(string.format("【冲刺目标】%s ➔ %s | 【系列赛赛制】%s",
        self.player.rank, promo.target_tier, promo.format))
    print(string.format("【系列赛比分】[ %d - %d ] (需 %d 胜 / 当前连续连胜: %d)",
        promo.wins, promo.losses, promo.required_wins, promo.consecutive_wins))

    local slots_str = ""
    for i = 1, promo.max_games do
        local outcome = promo.history[i]
        if outcome == "WIN" then
            slots_str = slots_str .. string.format("[第%d局: 胜 (W)] ", i)
        elseif outcome == "LOSS" then
            slots_str = slots_str .. string.format("[第%d局: 负 (L)] ", i)
        elseif i == #promo.history + 1 then
            slots_str = slots_str .. string.format("[第%d局: 🔥生死开打] ", i)
        else
            slots_str = slots_str .. string.format("[第%d局: 待定] ", i)
        end
    end
    print("【对局进度】" .. slots_str)
    if promo.wins == promo.required_wins - 1 then
        print("🔥【赛点状态】当前处于赛点局！再胜 1 局即可完成晋级绝杀！")
    elseif promo.losses == promo.max_games - promo.required_wins then
        print("⚠️【绝境状态】生死边缘！退无可退，必须拿下后续所有胜场！")
    end
    print("========================================================================\n")
end

function TapTapGame:addLP(delta)
    local promo = self.player.promo_series
    if promo and promo.active then
        -- During active promo series, rank tier and LP are held until series completes
        return
    end

    local cur_tier = self.player.rank
    local conf = TapTapGame.PROMO_CONFIG[cur_tier]
    local new_lp = math.max(0, self.player.lp + delta)

    if conf and cur_tier ~= "Challenger" and new_lp >= conf.lp then
        self.player.lp = conf.lp
        self:triggerPromoSeries(conf.next, conf.format)
    else
        self.player.lp = new_lp
        local new_rank = self:calculateRank()
        if new_rank ~= self.player.rank then
            self:log(string.format("🏆 PROMOTION! Promoted from %s to %s (%d LP)!", self.player.rank, new_rank, self.player.lp))
            self.player.rank = new_rank
        end
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
    if (self.player.focus or 100) < 15 or self.player.energy < 20 then
        self:log("[-] ⚠️ 专注力涣散与严重疲劳（专注度 < 15%）！操作迟钝极易频繁掉分，请先进行【深度休整 (Rest)】或饮用【特调咖啡 (Coffee)】！")
        return false
    end

    self.player.energy = math.max(0, self.player.energy - 20)
    self.player.focus = math.max(0, (self.player.focus or 100) - 20)
    self.player.games_played = self.player.games_played + 1

    -- Career Health & RSI evaluation
    local rsi_triggered, rsi_msg = CareerHealth.evaluateGrindStrain(self.player, 14)
    if rsi_triggered and rsi_msg then
        self:log(rsi_msg)
    end

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
            local mvp_card = self.mvp_engine:evaluateSoloQueue(self.player, "本命英雄", true)
            if mvp_card.is_mvp then
                self:log(string.format("👑【天梯突发战局 MVP 斩获】官方评分 ★ %.1f 分 ★！%s", mvp_card.score, mvp_card.headline))
                if mvp_card.buff_desc then self:log(mvp_card.buff_desc) end
            end
        else
            self.player.win_streak = 0
            self.mvp_engine:evaluateSoloQueue(self.player, "本命英雄", false)
        end

        self:log(string.format("[天梯突发: %s] %s (专注-20%%, 剩余专注: %d%%)", ev.title, outcome.log, self.player.focus))
        return true
    end

    -- Confidence trait bonus calculation
    local conf_bonus = self.mvp_engine:getConfidenceBonus(self.player)
    local eff_mech = self.player.mechanics + mech_buff + conf_bonus.bonus_mech
    local eff_ment = self.player.mental + ment_buff + conf_bonus.bonus_mental
    local focus_bonus = self.player.focus >= 70 and 8 or (self.player.focus < 35 and -15 or 0)
    local win_rate = 45 + (eff_mech * 0.25) + (eff_ment * 0.15) + focus_bonus + conf_bonus.bonus_win
    local roll = math.random(1, 100)

    -- If currently in BO3/BO5 Promo Series, resolve as a Promo Game
    if self.player.promo_series and self.player.promo_series.active then
        local is_promo_win = (roll <= win_rate)
        if is_promo_win then
            self.player.wins = self.player.wins + 1
            self.player.win_streak = self.player.win_streak + 1
            self.player.mental = math.min(100, self.player.mental + 3)
            self:advanceChallenge("win3")
        else
            self.player.win_streak = 0
            self.player.mental = math.max(5, self.player.mental - 4)
        end
        local ok, status, score = self:advancePromoSeries(is_promo_win)
        return is_promo_win, status, score
    end

    -- 赛历时钟推进 2 天并获取赛历环境词条加成
    local time_adv = self.esports_engine:advanceDays(2, self.player)
    local env_mult = self.esports_engine:getCompoundMultipliers()
    if self.community_engine then self.community_engine:tickDays(2) end

    if self.dynasty_engine then
        local tr_ok, tr_msg = self.dynasty_engine:checkSeasonTransferTrigger(time_adv.current_week, time_adv.split.id)
        if tr_ok then self:log("🚨 " .. tr_msg) end
    end

    if roll <= win_rate then
        self.esports_engine:recordMatchResult(true)
        local base_lp = math.random(22, 28)
        local lp_gain = math.floor(base_lp * env_mult.lp_mult)
        self.player.wins = self.player.wins + 1
        self.player.win_streak = self.player.win_streak + 1
        self.player.mental = math.min(100, self.player.mental + 2)
        self:addLP(lp_gain)
        self:advanceChallenge("win3")
        self:log(string.format("🟢 单排胜场！+%d LP (赛历%s 第%d周 · 环境倍率: x%.2f). 专注剩余: %d%%", lp_gain, time_adv.split.name, time_adv.current_week, env_mult.lp_mult, self.player.focus))

        -- 赛后 MVP 荣誉评定系统
        local mvp_card = self.mvp_engine:evaluateSoloQueue(self.player, "主力核心", true)
        if mvp_card.is_mvp then
            local extra_conf_lp = conf_bonus.bonus_lp or 0
            if extra_conf_lp > 0 then self:addLP(extra_conf_lp) end
            self:log(string.format("👑【赛后 MVP 斩获】官方评分 ★ %.1f 分 ★！%s", mvp_card.score, mvp_card.headline))
            self:log(string.format("   🎙️ 解说金句: %s", mvp_card.caster_quote))
            if mvp_card.buff_desc then self:log(mvp_card.buff_desc) end
        end
        
        -- Player Agency Match Passive Earnings
        local agency_cash = self:getAgencyIncome()
        if agency_cash > 0 then
            self.player.money = self.player.money + agency_cash
            self.player.agency = self.player.agency or { total_earned = 0 }
            self.player.agency.total_earned = (self.player.agency.total_earned or 0) + agency_cash
            self:log(string.format("💼【经纪商务分红】基于知名度(%d🌟)，经纪人结算胜场商务分成 +$%d！", self.player.fame or 0, agency_cash))
        end

        -- Channel Perk Match Feedback
        if self.player.stream_channel then
            if StreamingMilestones.hasPerk(self.player.stream_channel, "perk_mental_resonance") then
                self.player.stream_channel.subscribers = self.player.stream_channel.subscribers + 180
                self:log("🧊【抗压自愈光环】天梯高能胜场引发全网造梗膜拜！直播间新增粉丝订阅 +180 人！")
            end
            if StreamingMilestones.hasPerk(self.player.stream_channel, "perk_galaxy_gravity") then
                self.player.stream_channel.subscribers = self.player.stream_channel.subscribers + 450
                self.player.money = self.player.money + 100
                self:log("🌌【永恒星光引力】天王级排位胜场自动转化 +450 订阅与商务提成 +$100！")
            end
        end

        -- Check Persistent NPC Rival Clash (Gu Hanzhou / ColdBlade)
        if self.player.rivalry then
            local is_rival_clash = self.player.rivalry.snipe_queue_active or (math.random(1, 100) <= 28)
            if is_rival_clash then
                local narrative = RivalrySystem.resolveClash(self.player.rivalry, true, self.player)
                self:log(narrative.flavor_text)
            end
        end

        return true
    else
        self.esports_engine:recordMatchResult(false)
        local lp_loss = math.random(16, 21)
        self.player.win_streak = 0
        self.player.mental = math.max(5, self.player.mental - 5)
        self:addLP(-lp_loss)
        self:log(string.format("🔴 排位苦战惜败. -%d LP. 消耗精力-20, 专注-20%% (剩余专注: %d%%)", lp_loss, self.player.focus))

        -- 赛后表现与 SVP 判定
        local mvp_card = self.mvp_engine:evaluateSoloQueue(self.player, "主力核心", false)
        if mvp_card.is_svp then
            self:log(string.format("💔【赛后 SVP 孤勇战神】官方评分 ★ %.1f 分 ★！虽败犹荣，尽力局！", mvp_card.score))
            self:log(string.format("   🎙️ 解说点评: %s", mvp_card.caster_quote))
        end

        -- Passive baseline appearance fee even on hard loss
        local agency_cash = self:getAgencyIncome()
        if agency_cash > 0 then
            local loss_fee = math.max(10, math.floor(agency_cash * 0.5))
            self.player.money = self.player.money + loss_fee
            self.player.agency = self.player.agency or { total_earned = 0 }
            self.player.agency.total_earned = (self.player.agency.total_earned or 0) + loss_fee
            self:log(string.format("💼【经纪保底合约】经纪人公关保底赞助津贴 +$%d！", loss_fee))
        end

        -- Check Persistent NPC Rival Clash on Loss
        if self.player.rivalry then
            local is_rival_clash = self.player.rivalry.snipe_queue_active or (math.random(1, 100) <= 28)
            if is_rival_clash then
                local narrative = RivalrySystem.resolveClash(self.player.rivalry, false, self.player)
                self:log(narrative.flavor_text)
            end
        end

        return false
    end
end

function TapTapGame:actionStudyVOD()
    if self.player.energy < 15 or (self.player.focus or 100) < 15 then
        self:log("[-] ⚠️ 精力或专注力不足，无法逐帧分析选手细节。请先【休整】或饮用【咖啡】！")
        return false
    end
    self.player.energy = self.player.energy - 15
    self.player.focus = math.max(0, (self.player.focus or 100) - 10)
    self.player.mechanics = math.min(100, self.player.mechanics + 2)
    self.player.mental = math.min(100, self.player.mental + 3)
    self:advanceChallenge("vod2")
    local t = self.esports_engine:advanceDays(1, self.player)
    self:log(string.format("📘 逐帧研读世界赛决赛复盘。(微操+2, 心态+3, 赛历推进1天至第%d周). 剩余专注: %d%%", t.current_week, self.player.focus))
    return true
end

function TapTapGame:actionStream()
    if self.player.energy < 20 or (self.player.focus or 100) < 20 then
        self:log("[-] ⚠️ 双眼布满血丝，极度疲劳！高强度直播容易红温破防，请先选择【深度休整 (Rest)】或【特调咖啡 (Coffee)】！")
        return false
    end

    local s = StreamingMilestones.evaluateStreamOutcome(self.player)
    self.player.energy = math.max(0, self.player.energy - s.energy_drain)
    self.player.focus = math.max(0, (self.player.focus or 100) - s.focus_drain)
    self.player.mental = math.min(100, math.max(5, self.player.mental + s.mental_gain))
    
    local agency_passive, bonus_rate, agent_conf = self:getAgencyIncome()
    local base_payout = math.floor((math.random(80, 160) + math.floor(self.player.fame * 2.2) + s.bonus_cash) * s.mult)
    local payout = math.floor(base_payout * (1 + bonus_rate)) + agency_passive
    self.player.money = self.player.money + payout
    self.player.fame = math.min(100, self.player.fame + 3)
    self:advanceChallenge("stream")
    self.esports_engine:advanceDays(1, self.player)

    local rocket_str = s.rocket_bonus > 0 and " 🚀 [触发榜一大哥超能火箭空投 +$320]!" or ""
    local emote_tag = ""
    if self.player.stream_channel.equipped_emote then
        for _, m in ipairs(StreamingMilestones.CATALOG) do
            if m.emote_id == self.player.stream_channel.equipped_emote then
                emote_tag = string.format(" [弹幕勋章: %s %s]", m.emote_char, m.emote_name)
                break
            end
        end
    end

    if agent_conf then
        self.player.agency = self.player.agency or { total_earned = 0 }
        self.player.agency.total_earned = (self.player.agency.total_earned or 0) + payout
        self:log(string.format("🎥 经纪人【%s】商务助阵开播！新增粉丝 +%d人 (总订阅: %d)，打赏及分成 +$%d%s！知名度: %d (专注消耗-%d%%)%s",
            agent_conf.name, s.subs_gain, self.player.stream_channel.subscribers, payout, rocket_str, self.player.fame, s.focus_drain, emote_tag))
    else
        self:log(string.format("🎥 高能直播4小时圆满收工！新增粉丝 +%d人 (总订阅: %d)，人气峰值 %d，打赏收入 +$%d%s！知名度: %d (专注消耗-%d%%)%s",
            s.subs_gain, self.player.stream_channel.subscribers, s.peak_viewers, payout, rocket_str, self.player.fame, s.focus_drain, emote_tag))
    end

    if #s.newly_crossed > 0 then
        for _, m in ipairs(s.newly_crossed) do
            self:log(string.format("🎉【突破订阅里程碑】恭喜达成 %d 订阅！解锁频道特权【%s】与专属表情【%s %s (%s)】！请调用 :renderStreamingMilestones() 领取！",
                m.req, m.perk_name, m.emote_char, m.emote_name, m.emote_code))
        end
    end

    return true
end

-- ============================================================================
-- RECOVERY ROOM (SLEEP ENVIRONMENT & FATIGUE RECOVERY UPGRADE)
-- ============================================================================
TapTapGame.RECOVERY_ROOM_CONFIG = {
    ["soundproofing"] = {
        title = "声学降噪与隔音工程",
        levels = {
            [0] = { name = "普通卧室薄墙", cost = 0, energy = 0, focus = 0, mental = 0, desc = "街头噪音与外界杂音频现" },
            [1] = { name = "密封隔音条与吸音加厚窗帘", cost = 120, energy = 5, focus = 8, mental = 3, desc = "初级隔音，阻挡40%高频杂音" },
            [2] = { name = "双层录音室吸音板与静音窗", cost = 320, energy = 12, focus = 18, mental = 8, desc = "录音棚级静音，隔绝90%外界噪音" },
            [3] = { name = "航天级全密闭消音深睡静音舱", cost = 750, energy = 20, focus = 30, mental = 15, desc = "万籁俱寂，婴儿般绝对深睡眠" }
        }
    },
    ["bedding"] = {
        title = "高奢人体工学寝具",
        levels = {
            [0] = { name = "普通弹簧床与结块棉被", cost = 0, energy = 0, focus = 0, mental = 0, desc = "久睡腰酸背痛，手腕劳损" },
            [1] = { name = "慢回弹记忆枕与真丝眼罩", cost = 150, energy = 8, focus = 10, mental = 4, desc = "人体工学承托颈椎，眼部清凉放松" },
            [2] = { name = "天然乳胶七区释压深睡床垫", cost = 380, energy = 16, focus = 20, mental = 10, desc = "动态点对点分散背部与腰椎体压" },
            [3] = { name = "智能恒温零重力悬浮深睡系统", cost = 850, energy = 25, focus = 35, mental = 18, desc = "职业选手专用零重力悬浮，秒速充能" }
        }
    },
    ["atmosphere"] = {
        title = "微气候环境与富氧理疗",
        levels = {
            [0] = { name = "密闭干燥室内空气", cost = 0, energy = 0, focus = 0, mental = 0, desc = "空气干燥流通欠佳，晨起昏沉" },
            [1] = { name = "负离子香薰加湿与助眠白噪音仪", cost = 100, energy = 6, focus = 8, mental = 5, desc = "薰衣草精油微雾滋润，加速入睡" },
            [2] = { name = "医疗级新风恒湿循环系统", cost = 280, energy = 12, focus = 16, mental = 10, desc = "全天候富氧新风，清除大脑乳酸疲劳" },
            [3] = { name = "1.3ATA高压微氧睡眠康复舱", cost = 680, energy = 22, focus = 28, mental = 16, desc = "高压氧疗加速神经元修复与体能暴击" }
        }
    }
}

function TapTapGame:getRecoveryRoomBonuses()
    local room = self.player.recovery_room or { soundproofing = 0, bedding = 0, atmosphere = 0 }
    local b_energy = 0
    local b_focus = 0
    local b_mental = 0

    for cat_id, conf in pairs(TapTapGame.RECOVERY_ROOM_CONFIG) do
        local lvl = room[cat_id] or 0
        local lvl_data = conf.levels[lvl] or conf.levels[0]
        b_energy = b_energy + (lvl_data.energy or 0)
        b_focus = b_focus + (lvl_data.focus or 0)
        b_mental = b_mental + (lvl_data.mental or 0)
    end

    local rate = math.floor(((b_focus + b_energy) / (50 + 45)) * 100)
    return b_energy, b_focus, b_mental, rate
end

function TapTapGame:upgradeRecoveryRoom(category)
    local conf = TapTapGame.RECOVERY_ROOM_CONFIG[category]
    if not conf then
        self:log("❌ 找不到对应的康复室睡眠环境分类！")
        return false, "分类不存在"
    end

    self.player.recovery_room = self.player.recovery_room or { soundproofing = 0, bedding = 0, atmosphere = 0 }
    local cur_lvl = self.player.recovery_room[category] or 0
    local next_lvl = cur_lvl + 1
    local next_data = conf.levels[next_lvl]

    if not next_data then
        self:log(string.format("✅ 【%s】已达到顶级顶配，无法继续升级！", conf.title))
        return false, "已达到最高等级"
    end

    if self.player.money < next_data.cost then
        self:log(string.format("❌ 资金不足：升级【%s - %s】需要 $%d，当前仅有 $%d！",
            conf.title, next_data.name, next_data.cost, self.player.money))
        return false, "资金不足"
    end

    self.player.money = self.player.money - next_data.cost
    self.player.recovery_room[category] = next_lvl

    local b_energy, b_focus, b_mental, rate = self:getRecoveryRoomBonuses()
    self:log(string.format("🛏️【康复室升级成功】投资 $%d 安装【%s】！当前睡眠休整恢复提速 +%d%% (单次休整恢复: +%d精力 / +%d%%专注 / +%d心态)！",
        next_data.cost, next_data.name, rate, 45 + b_energy, 50 + b_focus, 18 + b_mental))
    return true, "升级成功"
end

function TapTapGame:renderRecoveryRoom()
    local room = self.player.recovery_room or { soundproofing = 0, bedding = 0, atmosphere = 0 }
    local b_energy, b_focus, b_mental, rate = self:getRecoveryRoomBonuses()

    print("\n================ 🛏️ 睡眠休整与康复空间 (RECOVERY ROOM) ================")
    print(string.format("【可用资金】$%d | 【当前休整恢复增速】+%d%%", self.player.money, rate))
    print(string.format("【单次睡眠恢复】+%d 精力 (基准45+加成%d) | +%d%% 专注 (基准50%%+加成%d%%) | +%d 心态 (基准18+加成%d)",
        45 + b_energy, b_energy, 50 + b_focus, b_focus, 18 + b_mental, b_mental))
    print("----------------------------------------------------------------------")

    for cat_id, conf in pairs(TapTapGame.RECOVERY_ROOM_CONFIG) do
        local lvl = room[cat_id] or 0
        local cur = conf.levels[lvl] or conf.levels[0]
        local nxt = conf.levels[lvl + 1]
        if nxt then
            print(string.format("• [%s] 当前: Lv.%d %s | 下级升级: Lv.%d %s (费用: $%d, 提升: +%d%%专注, +%d精力)",
                conf.title, lvl, cur.name, lvl + 1, nxt.name, nxt.cost, nxt.focus, nxt.energy))
        else
            print(string.format("• [%s] 当前: Lv.%d %s (已满级 MAX)", conf.title, lvl, cur.name))
        end
    end
    print("======================================================================\n")
end

function TapTapGame:actionRest()
    local b_energy, b_focus, b_mental, rate = self:getRecoveryRoomBonuses()
    local total_energy = 45 + b_energy
    local total_focus = 50 + b_focus
    local total_mental = 18 + b_mental

    self.player.energy = math.min(100, self.player.energy + total_energy)
    self.player.focus = math.min(100, (self.player.focus or 100) + total_focus)
    self.player.mental = math.min(100, self.player.mental + total_mental)
    self.esports_engine:advanceDays(1, self.player)

    if self.player.career_health then
        self.player.career_health.strain = math.max(0, self.player.career_health.strain - (35 + math.floor(b_energy * 0.8)))
        self.player.career_health.consecutive_grinds = 0
        if self.player.career_health.has_rsi then
            self:log(string.format("⚠️ 【腱鞘炎警示】休整排解了部分肌酸劳损，但受创腱鞘(RSI)病灶未除，操作上限仍被限制在 %d/100！请前往【理疗中心】施治！", self.player.career_health.max_mechanics))
        end
    end

    if rate > 0 then
        self:log(string.format("💤 【深度休整 (Recovery Room)】在升级后的康复空间睡眠8小时！精力+%d (加成+%d)，专注度+%d%% (加成+%d%%)，心态+%d！身心疲劳极速排空！(当前专注: %d%%)",
            total_energy, b_energy, total_focus, b_focus, total_mental, self.player.focus))
    else
        self:log(string.format("💤 【深度休整 (Rest)】充足睡眠与健康饮食！精力+45，专注度+50%%，心态+18！(提示：投资康复室升级隔音与寝具可大幅提升恢复倍率，当前专注: %d%%)",
            self.player.focus))
    end
    return true
end

function TapTapGame:actionDrinkCoffee()
    if (self.player.energy_drinks or 0) > 0 then
        self.player.energy_drinks = self.player.energy_drinks - 1
        self.player.focus = math.min(100, (self.player.focus or 100) + 50)
        self.player.energy = math.min(100, self.player.energy + 25)
        self.player.mental = math.min(100, self.player.mental + 8)
        self:log(string.format("☕ 【特调咖啡 (Coffee)】饮用背包备用冰美式（剩余 %d 罐）！高能咖啡因注入，专注度+50%%，精力+25%%！(当前专注: %d%%)", self.player.energy_drinks, self.player.focus))
        return true
    elseif self.player.money >= 20 then
        self.player.money = self.player.money - 20
        self.player.focus = math.min(100, (self.player.focus or 100) + 50)
        self.player.energy = math.min(100, self.player.energy + 25)
        self.player.mental = math.min(100, self.player.mental + 6)
        self:log(string.format("☕ 【特调咖啡 (Coffee)】花费 $20 购买特浓双份冰美式！瞬间爆发，专注度+50%%，精力+25%%！(当前专注: %d%%)", self.player.focus))
        return true
    else
        self:log("❌ 资金不足以购买特调咖啡（需 $20）。请选择免费的【深度休整 (Rest)】就寝入睡！")
        return false
    end
end

-- ============================================================================
-- QUICK SHOP (CONSUMABLES STORE FOR TAPTAP MAKE)
-- ============================================================================
TapTapGame.QUICK_SHOP_CATALOG = {
    { id = "energy_shot",      name = "高能电竞能量弹", cost = 15, focus = 40, energy = 20, mental = 5,  desc = "速效浓缩牛磺酸，秒回疲劳" },
    { id = "premium_coffee",   name = "特调精品现磨冰美式", cost = 30, focus = 70, energy = 35, mental = 10, desc = "冷萃双倍浓缩，驱散漫长直播倦意" },
    { id = "cyber_gum",        name = "超频提神咀嚼薄荷糖", cost = 8,  focus = 25, energy = 12, mental = 4,  desc = "薄荷强劲爆破，经济实惠随取随用" },
    { id = "pro_care_package", name = "职业战备全能补给箱", cost = 65, focus = 100, energy = 60, mental = 20, desc = "顶级豪门理疗营养包，疲劳条全满并重置巅峰！" }
}

function TapTapGame:actionQuickShop(item_id, immediate_use)
    local item = nil
    for _, it in ipairs(TapTapGame.QUICK_SHOP_CATALOG) do
        if it.id == item_id then item = it; break end
    end
    if not item then
        self:log("❌ 找不到指定的战备补给品！")
        return false, "商品不存在"
    end

    if self.player.money < item.cost then
        self:log(string.format("❌ 资金不足：购买【%s】需要 $%d，当前仅有 $%d！", item.name, item.cost, self.player.money))
        return false, "资金不足"
    end

    self.player.money = self.player.money - item.cost
    if immediate_use ~= false then
        self.player.focus = math.min(100, (self.player.focus or 100) + item.focus)
        self.player.energy = math.min(100, self.player.energy + item.energy)
        self.player.mental = math.min(100, self.player.mental + item.mental)
        self:log(string.format("🛒【战备应急速购】花费 $%d 饮用【%s】！专注度+%d%%，精力+%d%%，疲劳瞬间解除！(当前专注: %d%%)",
            item.cost, item.name, item.focus, item.energy, self.player.focus))
        return true, "已立即使用"
    else
        self.player.energy_drinks = (self.player.energy_drinks or 0) + 1
        self:log(string.format("🛒【战备速购】花费 $%d 购入【%s】存入战备背包（备用存量: %d 罐）！",
            item.cost, item.name, self.player.energy_drinks))
        return true, "已存入背包"
    end
end

function TapTapGame:renderQuickShop()
    print("\n================ 🛒 战备应急便利店 (Quick Shop) ================")
    print(string.format("【生涯资金】$%d | 【当前专注度】%d%% | 【背包备用库存】%d 罐",
        self.player.money, self.player.focus or 100, self.player.energy_drinks or 0))
    print("----------------------------------------------------------------")
    for i, item in ipairs(TapTapGame.QUICK_SHOP_CATALOG) do
        local can_buy = self.player.money >= item.cost and "可用" or "缺钱"
        print(string.format("%d. [%s] $%d (%s) -> 专注+%d%%, 精力+%d%%, 心态+%d%% | %s",
            i, item.name, item.cost, can_buy, item.focus, item.energy, item.mental, item.desc))
    end
    print("================================================================\n")
end

-- ============================================================================
-- PLAYER AGENCY (选手经纪公司与商业事务所)
-- ============================================================================
TapTapGame.AGENTS_CONFIG = {
    ["agent_rookie"] = {
        name = "林柯 (Lin Ke)",
        title = "新人电竞星探",
        tier = 1,
        cost = 150,
        fame_req = 10,
        passive_per_fame = 1.2,
        bonus_rate = 0.15,
        perk = "敏锐嗅觉",
        bio = "曾发掘多名次级联赛黑马新星，擅长为新晋路人王争取第一笔商业合作。"
    },
    ["agent_veteran"] = {
        name = "沈千秋 (Shen Qianqiu)",
        title = "资深金牌经纪人",
        tier = 2,
        cost = 480,
        fame_req = 30,
        passive_per_fame = 2.8,
        bonus_rate = 0.35,
        perk = "金牌议价",
        bio = "深耕头部电竞俱乐部商务运作8年，熟谙一线赛事赞助谈判规则。"
    },
    ["agent_elite"] = {
        name = "赵世勋 (Zhao Shixun)",
        title = "王牌合伙人",
        tier = 3,
        cost = 1100,
        fame_req = 55,
        passive_per_fame = 5.0,
        bonus_rate = 0.60,
        perk = "资本杠杆",
        bio = "华尔街投行背景，曾运作多起顶级巨星跨界商业代言与转会大单。"
    },
    ["agent_legend"] = {
        name = "维多利亚·陈 (Victoria Chen)",
        title = "传奇全球商业操盘巨擘",
        tier = 4,
        cost = 2600,
        fame_req = 80,
        passive_per_fame = 9.5,
        bonus_rate = 1.00,
        perk = "全球超巨法则",
        bio = "全球电竞商业榜最具影响力经纪领袖，旗下选手均位列世界名人堂。"
    }
}

TapTapGame.SPONSORSHIPS_CONFIG = {
    { id = "sponsor_mousepad",     brand = "极光电竞 (Aurora Gear)", category = "外设周边", fame_req = 15, base_payout = 35,  signing_bonus = 120,  desc = "定制联名超顺滑防滑电竞鼠标垫" },
    { id = "sponsor_energy_drink", brand = "狂暴脉冲能量饮 (Pulse Rush)", category = "功能饮料", fame_req = 25, base_payout = 75,  signing_bonus = 260,  desc = "高能电解质提神饮品官方赞助" },
    { id = "sponsor_monitor",      brand = "钛度视界 360Hz (Titan Optics)", category = "旗舰硬件", fame_req = 45, base_payout = 140, signing_bonus = 500,  desc = "职业赛事指定360Hz高刷显示器" },
    { id = "sponsor_apparel",      brand = "曜影机能潮牌 (Vortex Techwear)", category = "联名服饰", fame_req = 65, base_payout = 240, signing_bonus = 950,  desc = "跨界潮流电竞连帽战袍联名款" },
    { id = "sponsor_luxury_auto",  brand = "极速先锋超跑 (Apex Hypercar)", category = "跨界超跑", fame_req = 85, base_payout = 420, signing_bonus = 2200, desc = "殿堂级超跑品牌电竞代言人" }
}

function TapTapGame:getAgencyIncome()
    local ag = self.player.agency
    if not ag or not ag.hired_agent then return 0, 0, nil end
    local conf = TapTapGame.AGENTS_CONFIG[ag.hired_agent]
    if not conf then return 0, 0, nil end

    local base_fame = math.max(1, self.player.fame or 0) * conf.passive_per_fame
    local sponsor_cash = 0
    for _, sp_id in ipairs(ag.signed_sponsors or {}) do
        for _, sp in ipairs(TapTapGame.SPONSORSHIPS_CONFIG) do
            if sp.id == sp_id then
                sponsor_cash = sponsor_cash + (sp.base_payout * (1 + conf.bonus_rate))
            end
        end
    end
    local total_passive = math.floor(base_fame + sponsor_cash)
    return total_passive, conf.bonus_rate, conf
end

function TapTapGame:hireAgent(agent_id)
    local conf = TapTapGame.AGENTS_CONFIG[agent_id]
    if not conf then
        self:log("❌ 找不到对应的经纪人！")
        return false, "经纪人不存在"
    end
    if (self.player.fame or 0) < conf.fame_req then
        self:log(string.format("❌ 知名度不足：签约【%s】需要知名度 %d，当前仅为 %d！",
            conf.name, conf.fame_req, self.player.fame or 0))
        return false, "知名度不足"
    end
    if self.player.money < conf.cost then
        self:log(string.format("❌ 资金不足：签约【%s】需预付 $%d，当前仅有 $%d！",
            conf.name, conf.cost, self.player.money))
        return false, "资金不足"
    end
    self.player.money = self.player.money - conf.cost
    self.player.agency = self.player.agency or { signed_sponsors = {}, total_earned = 0 }
    self.player.agency.hired_agent = agent_id
    self:log(string.format("🤝【签约成功】正式聘用专属经纪人【%s】(%s)！特权【%s】激活：知名度被动分红倍率提升，赞助溢价 +%d%%！",
        conf.name, conf.title, conf.perk, math.floor(conf.bonus_rate * 100)))
    return true, "签约成功"
end

function TapTapGame:fireAgent()
    if self.player.agency then
        self.player.agency.hired_agent = nil
    end
    self:log("📋 已解除当前专属经纪约，恢复独立选手身份。")
    return true
end

function TapTapGame:signSponsorship(sponsor_id)
    local ag = self.player.agency
    if not ag or not ag.hired_agent then
        self:log("❌ 必须先签约职业经纪人才能展开商业赞助谈判！")
        return false, "需先签约经纪人"
    end
    local agent_conf = TapTapGame.AGENTS_CONFIG[ag.hired_agent]
    local sp_target = nil
    for _, sp in ipairs(TapTapGame.SPONSORSHIPS_CONFIG) do
        if sp.id == sponsor_id then sp_target = sp; break end
    end
    if not sp_target then
        self:log("❌ 找不到指定的赞助合约！")
        return false, "合约不存在"
    end
    for _, signed in ipairs(ag.signed_sponsors) do
        if signed == sponsor_id then
            self:log("❌ 该赞助合约已经在执行履约中！")
            return false, "已签约"
        end
    end
    if (self.player.fame or 0) < sp_target.fame_req then
        self:log(string.format("❌ 知名度不足：【%s】要求知名度 %d，当前为 %d！",
            sp_target.brand, sp_target.fame_req, self.player.fame or 0))
        return false, "知名度不足"
    end
    local bonus_rate = agent_conf and agent_conf.bonus_rate or 0
    local final_signing = math.floor(sp_target.signing_bonus * (1 + bonus_rate))
    self.player.money = self.player.money + final_signing
    self.player.fame = math.min(100, (self.player.fame or 0) + 3)
    table.insert(ag.signed_sponsors, sponsor_id)
    ag.total_earned = (ag.total_earned or 0) + final_signing
    self:log(string.format("🎉【商业代言达成】经纪人成功促成【%s】代言！签字费 +$%d (含经纪人溢价 +%d%%)！知名度+3！",
        sp_target.brand, final_signing, math.floor(bonus_rate * 100)))
    return true, "代言签约成功"
end

function TapTapGame:renderPlayerAgency()
    local ag = self.player.agency or {}
    local passive, bonus_rate, agent_conf = self:getAgencyIncome()
    print("\n================ 💼 选手经纪公司与商业事务所 (PLAYER AGENCY) ================")
    print(string.format("【当前知名度】%d 🌟 | 【单场/直播被动商业分红】+$%d/次 | 【商务议价加成】+%d%%",
        self.player.fame or 0, passive, math.floor(bonus_rate * 100)))
    if agent_conf then
        print(string.format("【专属经纪人】%s (%s) | 特权: %s | 累计创收: $%d",
            agent_conf.name, agent_conf.title, agent_conf.perk, ag.total_earned or 0))
    else
        print("【专属经纪人】暂无 (独立选手状态) | 提示: 签约经纪人可将知名度转化为稳定被动分红")
    end
    print("----------------------------------------------------------------------------")
    print("可签约经纪人矩阵:")
    for id, conf in pairs(TapTapGame.AGENTS_CONFIG) do
        local is_hired = ag.hired_agent == id and "[已签约]" or ""
        print(string.format("• [%s] %s | 签约费: $%d | 要求知名度: %d | 被动: +$%s/Fame | 溢价: +%d%% %s",
            conf.title, conf.name, conf.cost, conf.fame_req, tostring(conf.passive_per_fame), math.floor(conf.bonus_rate * 100), is_hired))
    end
    print("----------------------------------------------------------------------------")
    print("可谈判商业代言合约:")
    for _, sp in ipairs(TapTapGame.SPONSORSHIPS_CONFIG) do
        local is_signed = false
        for _, signed_id in ipairs(ag.signed_sponsors or {}) do
            if signed_id == sp.id then is_signed = true; break end
        end
        local status_tag = is_signed and "[履约中]" or (self.player.fame >= sp.fame_req and "[可签署]" or "[名气不足]")
        print(string.format("• [%s] %s (签字费: $%d, 单场分成: +$%d) %s",
            sp.category, sp.brand, sp.signing_bonus, sp.base_payout, status_tag))
    end
    print("============================================================================\n")
end

-- ============================================================================
-- CAREER HEALTH & PHYSIOTHERAPY (职业健康与运动康复理疗中心)
-- ============================================================================
function TapTapGame:actionPhysiotherapy(treatment_id)
    local ok, msg = CareerHealth.actionTreat(self.player, treatment_id)
    self:log(msg)
    return ok, msg
end

function TapTapGame:renderCareerHealth()
    CareerHealth.renderCLI(self.player)
end

-- ============================================================================
-- STREAMING MILESTONES & CHANNEL PERKS (直播间里程碑与粉丝特权)
-- ============================================================================
function TapTapGame:actionClaimStreamMilestone(milestone_id)
    local ok, msg = StreamingMilestones.actionClaim(self.player, milestone_id)
    self:log(msg)
    return ok, msg
end

function TapTapGame:actionEquipFanEmote(emote_id)
    local ok, msg = StreamingMilestones.actionEquipEmote(self.player, emote_id)
    self:log(msg)
    return ok, msg
end

function TapTapGame:renderStreamingMilestones()
    StreamingMilestones.renderCLI(self.player)
end

-- ============================================================================
-- SOLO QUEUE RIVALRY SYSTEM (天梯宿敌对垒与狙击雷达)
-- ============================================================================
function TapTapGame:toggleRivalSnipeQueue()
    if not self.player.rivalry then
        self.player.rivalry = RivalrySystem.newDefaultState()
    end
    local active, msg = RivalrySystem.toggleSnipeQueue(self.player.rivalry)
    self:log(msg)
    return active, msg
end

function TapTapGame:renderRivalryStatus()
    if not self.player.rivalry then
        self.player.rivalry = RivalrySystem.newDefaultState()
    end
    print("\n" .. RivalrySystem.formatStatusBanner(self.player.rivalry))
end

function TapTapGame:renderRivalryHistory()
    if not self.player.rivalry then
        self.player.rivalry = RivalrySystem.newDefaultState()
    end
    print("\n================ 📜 天梯宿敌 · 历史交锋风云录 ================")
    for i, clash in ipairs(self.player.rivalry.clash_history or {}) do
        print(string.format("[%s] 比分: %s | %s", clash.timestamp, clash.score_snapshot, clash.flavor_text))
        print(string.format("   顾寒舟: %s", clash.rival_quote))
        print(string.format("   动态: %s", clash.rival_action))
    end
    print("================================================================\n")
end

function TapTapGame:actionClashRival()
    if not self.player.rivalry then
        self.player.rivalry = RivalrySystem.newDefaultState()
    end
    self.player.rivalry.snipe_queue_active = true
    self:log(string.format("⚔️【发起宿命对决】开启宿敌狙击雷达，精准锁定宿敌【%s (%s)】！",
        self.player.rivalry.rival_name, self.player.rivalry.rival_handle))
    return self:actionSoloQueue()
end

-- ============================================================================
-- PHASE 2: TEAM CAPTAIN ARENA STAGE (PICK & BAN DRAFT)
-- ============================================================================
function TapTapGame:renderActiveMetaInsight()
    if not self.esports_engine then return end
    local insight = Draft.getActiveMetaInsight(self.draft_engine, self.esports_engine)
    if not insight then return end

    print(string.format("\n================ ⚡ 版本 META 战术洞察 · Patch %s ================", insight.patch_version))
    print(string.format("【版本主题】%s", insight.headline))
    print(string.format("【环境情报】%s", insight.description))
    print("【当前 S-Tier 必选强势英雄榜】")
    for _, champ in ipairs(insight.s_tier_champs) do
        print(string.format("  ✦ %s (+15%%~20%% LP 胜场加成)", champ))
    end
    print("----------------------------------------------------------------")
    if insight.is_boost_active then
        print(string.format("🎉【版本红利已激活】已锁定 %d 位 S 级英雄 (%s)！胜场结算将额外获得 +%d%% LP (+%d LP)！",
            insight.s_tier_count, table.concat(insight.s_tier_names, "、"), insight.bonus_lp_pct, insight.total_bonus_lp))
    else
        print("💡【战术建议】在当前对决中起用上方 S 级英雄，当局胜利可激活最高 +60% 临时天梯 LP 提振！")
    end
    print("================================================================\n")
end

function TapTapGame:actionPlayStageMatch()
    if not self.unlocked_phases[2] then
        self:log("🔒 LOCKED: Reach 1,000 LP (Challenger) in Solo Queue first to unlock Team Captaincy!")
        return false
    end

    -- 赛历推进 2 天
    local time_adv = self.esports_engine:advanceDays(2, self.player)
    if self.community_engine then self.community_engine:tickDays(2) end
    if self.dynasty_engine then
        local tr_ok, tr_msg = self.dynasty_engine:checkSeasonTransferTrigger(time_adv.current_week, time_adv.split.id)
        if tr_ok then self:log("🚨 " .. tr_msg) end
    end

    Draft.autoDraft(self.draft_engine)
    local blue_pct, red_pct = Draft.calculateScores(self.draft_engine, self.esports_engine)
    local won, logs = MatchSim.run(self.draft_engine.blue_picks, self.draft_engine.red_picks, blue_pct)

    for _, l in ipairs(logs) do self:log(l) end

    if won then
        local purse = 150000
        self.player.money = self.player.money + purse
        self.trophies.regional_champ = true
        self:log(string.format("🏆 ARENA STAGE VICTORY! Purse: +$%d! Total Savings: $%s / $1,000,000",
            purse, string.format("%d", self.player.money)))

        -- 结算版本 S 级 Meta 临时排位 LP 收益提振
        local meta_bonus_lp, s_tier_names = Draft.evaluateMetaLpBonus(self.draft_engine, self.esports_engine)
        if meta_bonus_lp > 0 then
            self:addLP(meta_bonus_lp)
            self:log(string.format("🔥【版本 Meta 红利结算】阵容选用 %s 等 %d 位 S 级核心！额外斩获 +%d LP 职业天梯战力排位分！",
                table.concat(s_tier_names, "、"), #s_tier_names, meta_bonus_lp))
        end

        -- 职业舞台赛后 MVP 荣誉与自信心评定
        local stage_mvp = self.mvp_engine:evaluateStageMatch(self.player, self.draft_engine.blue_picks, self.draft_engine.red_picks, won)
        if stage_mvp.is_mvp then
            self:log(string.format("👑【ARENA STAGE 全场 MVP】官方评分 ★ %.1f 分 ★！%s", stage_mvp.score, stage_mvp.headline))
            self:log(string.format("   🎙️ 官方解说: %s", stage_mvp.caster_quote))
            if stage_mvp.buff_desc then
                self:log(stage_mvp.buff_desc)
            end
        end

        if self.player.money >= 1000000 and not self.unlocked_phases[3] then
            self:log("============================================================")
            self:log("👑 $1,000,000 CAREER WEALTH ACCUMULATED!")
            self:log("You qualify to RETIRE as a player and BUY an Esports Organization!")
            self:log("============================================================")
        end
        return true
    else
        self.mvp_engine:evaluateStageMatch(self.player, self.draft_engine.blue_picks, self.draft_engine.red_picks, won)
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

    local lifetime_earnings = math.max(1000000, self.player.money)
    local trophy_count = 0
    if self.trophies.challenger then trophy_count = trophy_count + 1 end
    if self.trophies.regional_cup then trophy_count = trophy_count + 1 end
    if self.trophies.worlds_cup then trophy_count = trophy_count + 1 end
    if self.trophies.mvp_ring then trophy_count = trophy_count + 1 end

    local goat_index = math.min(99.9, math.max(72.0, 60.0 + (trophy_count * 6.2) + ((self.player.mechanics - 70) * 0.28) + 12.0))

    self.player.money = self.player.money - 1000000
    self.unlocked_phases[3] = true
    self.phase = 3
    self:log("============================================================")
    self:log("👑 RETIREMENT HALL OF FAME: 传奇挂靴退役 · 荣誉入驻电竞名人堂")
    self:log(string.format("🏆 荣誉奖杯总计: %d / 4 座殿堂奖杯", trophy_count))
    self:log(string.format("💰 生涯累计总收入: $%s (达成 $1,000,000 门槛)", string.format("%d", lifetime_earnings)))
    self:log(string.format("🌟 'Greatest Player of All Time' (GOAT) 历史评级指数: %.1f / 100 [SSS 级神之领域]", goat_index))
    self:log("你支付 $1,000,000 全资收购全球豪门俱乐部，转型战队老板兼总经理 (GM)！")
    self:log("PHASE 3 (DYNASTY TYCOON) UNLOCKED! Welcome, Franchise Owner.")
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
-- PHASE 3: OFF-SEASON TRANSFER WINDOW (休赛期转会窗与自由人竞价)
-- ============================================================================
function TapTapGame:renderTransferWindow()
    if not self.dynasty_engine then return end
    self.dynasty_engine:renderTransferWindow()
end

function TapTapGame:actionOpenTransferWindow(split_name)
    if not self.dynasty_engine then return false, "王朝引擎未就绪" end
    local ok = self.dynasty_engine:openTransferWindow(split_name or "夏季赛收官转会期", self.esports_engine.state.season_year)
    self:log("🔔【转会窗重磅开启】夏季赛落幕，为期 14 天的冬季转会窗口正式启动！")
    return ok
end

function TapTapGame:actionBidFreeAgent(fa_id, bid_amount)
    if not self.dynasty_engine then return false, "王朝引擎未就绪" end
    local ok, msg = self.dynasty_engine:bidFreeAgent(fa_id, bid_amount)
    self:log(msg)
    return ok, msg
end

function TapTapGame:actionInstantSignFreeAgent(fa_id)
    if not self.dynasty_engine then return false, "王朝引擎未就绪" end
    local ok, msg = self.dynasty_engine:instantSignFreeAgent(fa_id)
    self:log(msg)
    return ok, msg
end

function TapTapGame:actionTradeRosterPlayer(my_role, target_team, target_player, target_power, cash)
    if not self.dynasty_engine then return false, "王朝引擎未就绪" end
    local ok, msg = self.dynasty_engine:tradePlayer(my_role, target_team, target_player, target_power, cash)
    self:log(msg)
    return ok, msg
end

function TapTapGame:actionAdvanceTransferDays(days)
    if not self.dynasty_engine then return false, "王朝引擎未就绪" end
    local ok, msg = self.dynasty_engine:advanceTransferDays(days)
    self:log(msg)
    return ok, msg
end

-- ============================================================================
-- POST-MATCH MVP & CONFIDENCE TRAIT API (赛后 MVP 与狂傲自信心特质)
-- ============================================================================
function TapTapGame:renderPostMatchMVP()
    if self.player.confidence and self.player.confidence.last_mvp_card then
        self.mvp_engine:renderMVPBanner(self.player.confidence.last_mvp_card, self.player)
    else
        print("\n================ 🏆 POST-MATCH MVP 赛后荣誉殿堂 ================")
        print("暂无近期比赛的 MVP 战报记录。请先完成一场单排天梯或职业舞台对决！")
        print("================================================================\n")
    end
end

function TapTapGame:renderConfidenceTrait()
    local conf = self.mvp_engine:getConfidenceBonus(self.player)
    print("\n================ 🔥 选手特质: 自信心 (CONFIDENCE TRAIT) ================")
    print(string.format("【当前心境层级】%s %s | 【基础自信度】%d / 100",
        conf.badge, conf.name, self.player.confidence and self.player.confidence.score or 50))
    print(string.format("【特质有效期】剩余有效比赛: %d 场 | 【累计斩获 MVP】%d 次 (单排 %d / 职业 %d)",
        conf.matches_left,
        self.player.mvp_stats and self.player.mvp_stats.total_mvp or 0,
        self.player.mvp_stats and self.player.mvp_stats.solo_mvp or 0,
        self.player.mvp_stats and self.player.mvp_stats.stage_mvp or 0))
    print("------------------------------------------------------------------------")
    print(string.format("【实战属性增益】微操加成: +%d | 心态加成: +%d | 胜率倍率: +%d%% | 胜场额外: +%d LP",
        conf.bonus_mech, conf.bonus_mental, conf.bonus_win, conf.bonus_lp))
    print("【特质效果详述】" .. conf.desc)
    print("------------------------------------------------------------------------")
    print("💡 提示: 每次在天梯单排或职业赛场斩获 MVP，自信心将升级至下一层并重置 3 场有效期！")
    print("========================================================================\n")
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
-- TAPTAP MAKE UI STATE EXPORTER & HUD RENDERING
-- ============================================================================
-- ============================================================================
-- PRESTIGE & NEW GAME+ & INFINITE WORLD TOUR METHODS (TAPTAP MAKE)
-- ============================================================================

function TapTapGame:renderPrestigeHall()
    local pe = self.prestige_engine
    local yield, breakdown = pe:calculatePrestigeYield(
        self.trophies.worlds_cup,
        self.trophies.regional_champ,
        self.trophies.challenger or (self.player.lp >= 1000),
        self.player.money,
        self.player.fame
    )
    print("\n================== 🌀 名宿声望殿堂 · 轮回与传承 ==================")
    print(string.format("【当前生涯】第 %d 周目 (难度倍率: x%.2f)", pe.generation, pe.difficulty_multiplier))
    print(string.format("【可用名宿声望】%d 点 | 【历史累计】%d 点", pe.prestige_points, pe.lifetime_prestige))
    print(string.format("【永久传承天赋已点亮】%d / %d 项", #pe.unlocked_passives, #PrestigeSystem.LEGACY_PASSIVES))
    print(string.format("【当前启用肉鸽词条】%d 项 | 【已达成结局】%d / %d 个", #pe.active_modifiers, #pe.unlocked_endings, #PrestigeSystem.CAREER_ENDINGS))
    print("------------------------------------------------------------------------")
    print("【本次轮回预计结算收获】")
    for _, item in ipairs(breakdown) do
        print("  ✦ " .. item)
    end
    print(string.format("  >>> 预计总计入账: +%d 名宿声望点数", yield))
    print("========================================================================\n")
end

function TapTapGame:unlockLegacyPassive(passiveId)
    local ok, msg = self.prestige_engine:unlockPassive(passiveId)
    self:log(msg)
    return ok, msg
end

function TapTapGame:toggleRunModifier(modId)
    local ok, msg = self.prestige_engine:toggleModifier(modId)
    self:log(string.format("【肉鸽挑战词条】%s: %s", modId, msg))
    return ok, msg
end

function TapTapGame:prestigeRebirth(chosenEndingId)
    local pe = self.prestige_engine
    local yield, breakdown = pe:calculatePrestigeYield(
        self.trophies.worlds_cup,
        self.trophies.regional_champ,
        self.trophies.challenger or (self.player.lp >= 1000),
        self.player.money,
        self.player.fame
    )

    pe.prestige_points = pe.prestige_points + yield
    pe.lifetime_prestige = pe.lifetime_prestige + yield
    pe.generation = pe.generation + 1
    pe.difficulty_multiplier = pe:getDifficultyMultiplier(pe.generation)
    pe.total_runs_completed = pe.total_runs_completed + 1

    if chosenEndingId then
        table.insert(pe.unlocked_endings, chosenEndingId)
    end

    -- 继承天赋计算
    local start_money = 180 + (pe:hasPassive("passive_seed_venture_fund") and 200000 or 0)
    local start_fame = 15 + (pe:hasPassive("passive_fame_inheritance") and 20 or 0)
    local start_mech = 55 + (pe:hasPassive("passive_muscle_memory") and 15 or 0)
    local start_ment = 70 + (pe:hasPassive("passive_tactical_precognition") and 12 or 0)

    -- 重置个人属性与阶段，保留传承
    self.phase = 1
    self.unlocked_phases = { [1] = true, [2] = false, [3] = false }
    self.player.lp = 340
    self.player.rank = "Gold"
    self.player.mechanics = start_mech
    self.player.mental = start_ment
    self.player.energy = 85
    self.player.focus = 90
    self.player.money = start_money
    self.player.fame = start_fame
    self.player.win_streak = 0
    self.player.games_played = 0
    self.player.wins = 0
    self.player.promo_series = nil
    self.player.career_health = CareerHealth.newDefaultState()
    self.player.stream_channel = StreamingMilestones.newDefaultState()
    self.player.rivalry = RivalrySystem.newDefaultState()
    self.trophies = { challenger = false, regional_champ = false, worlds_cup = false, mvp_ring = false }

    local msg = string.format("🌀【轮回转生启程】荣登名宿殿堂，结算斩获 +%d 声望！开启第 %d 周目 (难度 x%.2f)！", yield, pe.generation, pe.difficulty_multiplier)
    self:log(msg)
    print("\n" .. msg .. "\n")
    return true, yield, pe.generation
end

function TapTapGame:battleWorldTour()
    local wt = self.world_tour_engine
    local teamPower = self.player.mechanics
    if self.phase == 3 and self.dynasty_engine then
        local sum = 0
        for _, p in ipairs(self.dynasty_engine.roster or {}) do
            sum = sum + ((p.mechanics + p.macro) / 2)
        end
        if #self.dynasty_engine.roster > 0 then
            teamPower = math.floor(sum / #self.dynasty_engine.roster)
        end
    end

    local isWin, reward, logs = wt:battle(teamPower, self.prestige_engine)
    if isWin then
        self.prestige_engine.prestige_points = self.prestige_engine.prestige_points + reward
        self.prestige_engine.lifetime_prestige = self.prestige_engine.lifetime_prestige + reward
        self:log(string.format("🌍【世界巡回赛大捷】斩获 +%d 声望！晋级第 %d 层！", reward, wt.current_floor))
    else
        if reward > 0 then
            self.prestige_engine.prestige_points = self.prestige_engine.prestige_points + reward
            self.prestige_engine.lifetime_prestige = self.prestige_engine.lifetime_prestige + reward
        end
        self:log(string.format("💀【世界巡回赛告负】第 %d 层挑战失利，获得热身声望 +%d 点。", wt.current_floor, reward))
    end

    for _, l in ipairs(logs) do
        print(l)
    end
    return isWin, reward, logs
end

function TapTapGame:renderMobileStatusBar()
    local focus = self.player.focus or 100
    local focus_bar_len = 10
    local filled = math.floor((focus / 100) * focus_bar_len)
    local empty = focus_bar_len - filled
    local bar_str = string.rep("█", filled) .. string.rep("░", empty)
    local focus_status = focus >= 70 and "🟢 巅峰专注" or (focus >= 30 and "🟡 平稳消耗" or "🔴 严重疲劳")

    print("\n================== 📱 移动端状态栏 HUD (MobileStatusBar) ==================")
    local rank_line = string.format("【段位】%s (%d LP)", self.player.rank, self.player.lp)
    if self.player.promo_series and self.player.promo_series.active then
        local p = self.player.promo_series
        rank_line = rank_line .. string.format(" | ⚔️ 【%s 生死晋级赛 比分: %d-%d】", p.target_tier, p.wins, p.losses)
    end
    print(rank_line .. string.format(" | 【体力】%d%% | 【专注度】[%s] %d%% (%s)",
        self.player.energy, bar_str, focus, focus_status))
    local ch = self.player.career_health
    local ch_str = ch and (ch.has_rsi and string.format("🚨 腱鞘炎(上限%d)", ch.max_mechanics) or string.format("肌腱负荷: %d%%", ch.strain)) or "健康"
    local sc = self.player.stream_channel
    local subs_str = sc and string.format("📺 订阅: %d", sc.subscribers) or ""
    local pe = self.prestige_engine
    local wt = self.world_tour_engine
    print(string.format("【周目】第 %d 世 (x%.2f) | 【声望】%d P | 【巡回赛】第 %d 层 | 【微操】%d/%d | 【心态】%d",
        pe.generation, pe.difficulty_multiplier, pe.prestige_points, wt.current_floor, self.player.mechanics, ch and ch.max_mechanics or 100, self.player.mental))
    print(string.format("【职业健康】%s | 【资金】$%d | %s | 【备用咖啡】%d 罐",
        ch_str, self.player.money, subs_str, self.player.energy_drinks or 0))
    local conf = self.mvp_engine:getConfidenceBonus(self.player)
    if conf.is_active then
        print(string.format("【狂傲自信】%s %s (微操+%d, 心态+%d, 胜率+%d%% | 剩余 %d 场有效)",
            conf.badge, conf.name, conf.bonus_mech, conf.bonus_mental, conf.bonus_win, conf.matches_left))
    end
    if ch and ch.has_rsi then
        print(string.format("🚨 【职业腱鞘炎(RSI)警报】连续微操致手腕韧带受损！最大操作上限被压制到 %d/100！请调用 :renderCareerHealth() 前往理疗恢复！", ch.max_mechanics))
    end
    if focus < 30 then
        print("⚠️ 警告：当前严重疲劳！操作迟钝极易频繁掉分，请及时【深度休整 (Rest)】或饮用【特调咖啡 (Coffee)】！")
    end
    print("========================================================================\n")
end

function TapTapGame:getViewState()
    self:checkMilestones()
    local mech_buff, ment_buff, skin_name = self.login_streak:getActiveBuffs()
    return {
        phase = self.phase,
        rank = self.player.rank,
        lp = self.player.lp,
        promo_series = self.player.promo_series,
        money = self.player.money,
        energy = self.player.energy,
        focus = self.player.focus or 100,
        energy_drinks = self.player.energy_drinks or 0,
        recovery_room = self.player.recovery_room,
        agency = self.player.agency,
        career_health = self.player.career_health,
        stream_channel = self.player.stream_channel,
        rivalry = self.player.rivalry,
        confidence = self.mvp_engine:getConfidenceBonus(self.player),
        mvp_stats = self.player.mvp_stats,
        last_mvp_card = self.player.confidence and self.player.confidence.last_mvp_card,
        prestige = {
            generation = self.prestige_engine.generation,
            prestige_points = self.prestige_engine.prestige_points,
            lifetime_prestige = self.prestige_engine.lifetime_prestige,
            difficulty_multiplier = self.prestige_engine.difficulty_multiplier,
            unlocked_passives = self.prestige_engine.unlocked_passives,
            active_modifiers = self.prestige_engine.active_modifiers,
            unlocked_endings = self.prestige_engine.unlocked_endings
        },
        world_tour = {
            current_floor = self.world_tour_engine.current_floor,
            highest_floor = self.world_tour_engine.highest_floor,
            season_rank = self.world_tour_engine.season_rank,
            tour_trophies = self.world_tour_engine.tour_trophies
        },
        mechanics = self.player.mechanics + mech_buff,
        mental = self.player.mental + ment_buff,
        equipped_skin = skin_name,
        active_title = self.milestones_engine.active_title,
        streak_day = self.login_streak.current_streak,
        streak_claimed = self.login_streak.claimed_today,
        can_unlock_phase2 = self.player.lp >= 1000,
        can_retire_phase3 = self.player.money >= 1000000,
        transfer_window = self.dynasty_engine and self.dynasty_engine.transfer_window and {
            is_open = self.dynasty_engine.transfer_window.is_open,
            days_left = self.dynasty_engine.transfer_window.days_left,
            hours_left = self.dynasty_engine.transfer_window.hours_left,
            free_agents = self.dynasty_engine.transfer_window.free_agents,
            rival_rumors = self.dynasty_engine.transfer_window.rival_rumors,
            trade_logs = self.dynasty_engine.transfer_window.trade_logs
        },
        community_relations = {
            fanbase_count = self.community_engine.fanbase_count,
            fanbase_multiplier = self.community_engine.fanbase_multiplier,
            campaigns_run = self.community_engine.total_campaigns_run,
            recent_activities = self.community_engine.recent_activities
        },
        trophies = self.trophies,
        logs = self.recent_logs
    }
end

-- ============================================================================
-- GLOBAL PRO POWER RANKINGS API (全球战队战力榜与战术刺探)
-- ============================================================================
function TapTapGame:renderGlobalPowerRankings(region)
    self.power_rankings_engine:renderCLI()
end

function TapTapGame:actionScoutTeam(team_id)
    if self.player.energy < 15 then
        self:log("❌ 精力不足：战术刺探需要消耗 15 点精力，请休整恢复！")
        return false, "精力不足"
    end

    self.player.energy = self.player.energy - 15
    local ok, intel, t = self.power_rankings_engine:scoutTeam(team_id, self.player)
    if ok then
        self:log(string.format("🔍【战术刺探成功】已破解【%s】的核心体系！获得面对该战队 +8%% 胜率加成！", t.name))
        self:log(string.format("   战术弱点: %s", t.weakness))
        return true, intel
    else
        self:log("❌ 刺探失败：" .. tostring(intel))
        return false, intel
    end
end

function TapTapGame:actionScrimTeam(team_id)
    if self.player.energy < 20 then
        self:log("❌ 精力不足：组织高强度跨国训练赛需要消耗 20 点精力！")
        return false, "精力不足"
    end

    self.player.energy = self.player.energy - 20
    local my_power = self.player.mechanics
    if self.phase == 3 and self.dynasty_engine then
        my_power = self.dynasty_engine:getTeamPower()
    end

    local is_win, logs, win_rate = self.power_rankings_engine:simulateScrim(team_id, my_power)
    for _, l in ipairs(logs) do
        self:log(l)
    end

    if is_win then
        self.player.fame = math.min(100, (self.player.fame or 0) + 3)
        self:log("🎖️【训练赛大捷】全队士气大振！声望 +3！")
    else
        self.player.mental = math.max(10, self.player.mental - 2)
        self:log("📚【训练赛复盘】收获宝贵的实战数据与克制经验。")
    end

    return is_win, logs, win_rate
end

-- ============================================================================
-- COMMUNITY RELATIONS & DANMAKU API (社区公关运营与直播弹幕系统)
-- ============================================================================
function TapTapGame:renderCommunityRelations()
    self.community_engine:renderCLI()
end

function TapTapGame:actionRunCommunityCampaign(campaign_id)
    local target = (self.phase == 3 and self.dynasty_engine) or self.player
    local budget_source = (self.phase == 3) and "DYNASTY" or "PLAYER"
    local ok, msg, record = self.community_engine:executeCampaign(campaign_id, target, budget_source)
    self:log(msg)
    return ok, msg, record
end

function TapTapGame:actionSendDanmaku(text, sender)
    sender = sender or self.player.name
    local ok, msg, item = self.community_engine:sendCustomDanmaku(text, sender)
    if ok then
        self:log("💬 " .. msg)
    end
    return ok, msg, item
end

-- TapTap Make Engine Hook
return TapTapGame
