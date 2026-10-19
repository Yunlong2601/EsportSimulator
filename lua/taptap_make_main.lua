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

if package and package.path then
    if not string.find(package.path, "lua/%?.lua") then
        package.path = "./lua/?.lua;./lua/?/init.lua;./?.lua;" .. package.path
    end
end

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

local ok_merch, MerchRDLab = pcall(require, "merch_sales")
if not ok_merch or type(MerchRDLab) ~= "table" then
    local ok_m2, m2 = pcall(require, "lua.merch_sales")
    if ok_m2 then MerchRDLab = m2 end
end

local ok_msm, MerchSalesManager = pcall(require, "merch_sales_manager")
if not ok_msm or type(MerchSalesManager) ~= "table" then
    local ok_m3, m3 = pcall(require, "lua.merch_sales_manager")
    if ok_m3 then MerchSalesManager = m3 end
end

local ok_jc, JerseyCustomizer = pcall(require, "jersey_customizer")
if not ok_jc or type(JerseyCustomizer) ~= "table" then
    local ok_m4, m4 = pcall(require, "lua.jersey_customizer")
    if ok_m4 then JerseyCustomizer = m4 end
end

local ok_rings, ChampionshipRings = pcall(require, "championship_rings")
if not ok_rings or type(ChampionshipRings) ~= "table" then
    local ok_r2, r2 = pcall(require, "lua.championship_rings")
    if ok_r2 then ChampionshipRings = r2 end
end

local ok_tc, TrainingCamp = pcall(require, "training_camp")
if not ok_tc or type(TrainingCamp) ~= "table" then
    local ok_t2, t2 = pcall(require, "lua.training_camp")
    if ok_t2 then TrainingCamp = t2 end
end

local ok_meta, MetaTierList = pcall(require, "meta_tier_list")
if not ok_meta or type(MetaTierList) ~= "table" then
    local ok_m5, m5 = pcall(require, "lua.meta_tier_list")
    if ok_m5 then MetaTierList = m5 end
end

local ok_td, TeamDynamics = pcall(require, "team_dynamics")
if not ok_td or type(TeamDynamics) ~= "table" then
    local ok_t3, t3 = pcall(require, "lua.team_dynamics")
    if ok_t3 then TeamDynamics = t3 end
end

local ok_ed, ExpansionDraft = pcall(require, "expansion_draft")
if not ok_ed or type(ExpansionDraft) ~= "table" then
    local ok_e2, e2 = pcall(require, "lua.expansion_draft")
    if ok_e2 then ExpansionDraft = e2 end
end

local ok_cj, CareerJournal = pcall(require, "career_journal")
if not ok_cj or type(CareerJournal) ~= "table" then
    local ok_c2, c2 = pcall(require, "lua.career_journal")
    if ok_c2 then CareerJournal = c2 end
end

local ok_bp, TacticalBpDrill = pcall(require, "tactical_bp_drill")
if not ok_bp or type(TacticalBpDrill) ~= "table" then
    local ok_b2, b2 = pcall(require, "lua.tactical_bp_drill")
    if ok_b2 then TacticalBpDrill = b2 end
end

local ok_sh, ScoutIntelHeatmap = pcall(require, "scout_intel_heatmap")
if not ok_sh or type(ScoutIntelHeatmap) ~= "table" then
    local ok_s2, s2 = pcall(require, "lua.scout_intel_heatmap")
    if ok_s2 then ScoutIntelHeatmap = s2 end
end

local ok_js, JerseyStudio = pcall(require, "jersey_customizer_studio")
if not ok_js or type(JerseyStudio) ~= "table" then
    local ok_j2, j2 = pcall(require, "lua.jersey_customizer_studio")
    if ok_j2 then JerseyStudio = j2 end
end

local ok_ce, EsportsCrisisEngine = pcall(require, "esports_crisis_engine")
if not ok_ce or type(EsportsCrisisEngine) ~= "table" then
    local ok_c3, c3 = pcall(require, "lua.esports_crisis_engine")
    if ok_c3 then EsportsCrisisEngine = c3 end
end

local ok_hof, HallOfFame = pcall(require, "hall_of_fame")
if not ok_hof or type(HallOfFame) ~= "table" then
    local ok_h2, h2 = pcall(require, "lua.hall_of_fame")
    if ok_h2 then HallOfFame = h2 end
end

local ok_mhe, MatchHighlightEngine = pcall(require, "match_highlight_engine")
if not ok_mhe or type(MatchHighlightEngine) ~= "table" then
    local ok_m6, m6 = pcall(require, "lua.match_highlight_engine")
    if ok_m6 then MatchHighlightEngine = m6 end
end

local ok_mvt, MatchVisualTheater = pcall(require, "match_visual_theater")
if not ok_mvt or type(MatchVisualTheater) ~= "table" then
    local ok_m7, m7 = pcall(require, "lua.match_visual_theater")
    if ok_m7 then MatchVisualTheater = m7 end
end

local ok_snd, SoundManager = pcall(require, "sound_manager")
if not ok_snd or type(SoundManager) ~= "table" then
    local ok_s3, s3 = pcall(require, "lua.sound_manager")
    if ok_s3 then SoundManager = s3 end
end

local TapTapGame = {}
TapTapGame.__index = TapTapGame

function TapTapGame.new(opts)
    opts = opts or {}
    local self = setmetatable({}, TapTapGame)

    -- Game Lifecycle
    self.version = "2.4.0-taptap"
    self.phase = 1               -- 1: Amateur, 2: Stage, 3: Dynasty
    self.unlocked_phases = { [1] = true, [2] = false, [3] = false }

    -- Trait Buff Calculations
    local starting_mech = 55
    local starting_mental = 70
    local starting_focus = 90
    local starting_money = 180
    local starting_fame = 15
    local chosen_trait = opts.trait or "mechanics"

    if chosen_trait == "mechanics" then
        starting_mech = 68
    elseif chosen_trait == "macro" then
        starting_focus = 100
        starting_mental = 80
    elseif chosen_trait == "iron_will" then
        starting_mental = 92
    elseif chosen_trait == "streamer" then
        starting_fame = 45
        starting_money = 350
    end

    -- Player Core Attributes
    self.player = {
        name = opts.name or "Prodigy",
        role = opts.role or "MID",
        trait = chosen_trait,
        lp = 340,
        rank = "Gold",
        mechanics = starting_mech, -- 0 - 100
        mental = starting_mental,   -- 0 - 100
        energy = 85,               -- 0 - 100
        focus = starting_focus,    -- 0 - 100 专注度 (高强度活动消耗，休整/咖啡恢复)
        energy_drinks = 2,         -- 备用战备特调咖啡/冰美式
        money = starting_money,    -- Career savings ($)
        fame = starting_fame,      -- Streaming popularity
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
    self.merch_lab = MerchRDLab and MerchRDLab.new() or nil
    self.merch_sales_manager = MerchSalesManager
    self.jersey_customizer = JerseyCustomizer

    -- Trophies & Milestones
    self.trophies = {
        challenger = false,
        regional_champ = false,
        worlds_cup = false,
        mvp_ring = false
    }

    -- Merged TapTap Maker Systems (Facilities, Academy, Coach Equity, Staff)
    self.facilities = {
        training = 1,
        medical = 1,
        analysis = 1,
        business = 1,
        gamingHouse = 1
    }

    self.academy = {
        trainees = {
            { id = "trainee_1", name = "Zephyr_01", role = "MID", grade = "S", power = 82, mechanics = 85, form = 100 },
            { id = "trainee_2", name = "Lumen_02",  role = "ADC", grade = "A", power = 76, mechanics = 78, form = 100 },
            { id = "trainee_3", name = "Blaze_03",  role = "TOP", grade = "B", power = 69, mechanics = 70, form = 100 }
        }
    }

    self.coach = {
        name = "传奇名帅",
        equity = 15,       -- 15% 俱乐部初始股权
        trust = 75,        -- 75/100 董事会信任度
        boss_name = "董事会领投人",
        salary = 12000
    }

    self.staff = {
        head_coach = { name = "金牌教头 (Homme)", buff = "BP克制加成+8%" },
        analyst = { name = "首席分析师 (Kramer)", buff = "战术情报洞悉+10%" },
        physio = { name = "运动医学博士 (Dr. Kang)", buff = "劳损消退+25%" }
    }

    self.dynasty_subtab = "OVERVIEW"

    -- Championship Rings Collection & Showcase
    self.championship_rings = {
        unlocked = ChampionshipRings and ChampionshipRings.getDefaultUnlockedRings(0) or { "ring_s10_origin" },
        equipped = "ring_s10_origin"
    }

    -- Training Camp Active Bootcamp
    self.active_bootcamp = nil

    -- Tactical Team Dynamics Preset
    self.tactical_preset = "mid_jgl_engine"

    -- 1. Expansion Draft State
    self.expansion_draft = ExpansionDraft and ExpansionDraft.initDraftState(2026) or {
        currentYear = 2026,
        expansionFranchiseName = "极光新纪元 (Aurora Gaming)",
        isDraftAvailable = true,
        protectedPlayerIds = {},
        draftedProdigies = {},
        history = {}
    }

    -- 2. Career Journal State
    self.career_journal = {
        clippings = CareerJournal and CareerJournal.INITIAL_ENTRIES or {}
    }

    -- 3. Tactical BP Drill State
    self.tactical_bp_drill = {
        solvedPuzzles = {},
        activeBuff = nil
    }

    -- 4. Scout Intel Heatmap & Radar State
    self.scout_radar_mode = "SELF"
    self.scout_rival_id = "t1"

    -- 5. Jersey Customizer Studio State
    self.jersey_studio = JerseyStudio and JerseyStudio.initJerseyConfig() or {
        pattern = "cyber_stripes",
        crest = "cyber_phoenix",
        colorPreset = "暗影霓虹 (Cyber Shadow)",
        starPlayer = "Prodigy",
        priceTier = "pro_player_edition",
        hypeScore = 80,
        weeklyUnits = 320,
        projectedRevenue = 47680
    }

    -- 6. Crisis & Moral Dilemmas Engine State
    self.pending_crisis = nil
    self.crisis_history = {}

    -- 7. Hall of Fame & Retired Jersey Gallery
    self.hall_of_fame = HallOfFame and HallOfFame.initState() or {
        inductedLegends = {},
        equippedAuraId = "aura_demon_king",
        totalInducted = 0
    }

    -- 8. Match Highlight Engine State
    self.last_match_report = nil

    -- 9. 2D Visual Match Theater & Audio State
    self.current_visual_match = nil

    -- 10. League Calendar & Season Schedule Engine (12-26 Weeks)
    self.league_standings = {
        { id = "DYNASTY", name = "DYNASTY (你方)", wins = 5, losses = 1, points = 10, streak = 2, tier = "S" },
        { id = "T1",      name = "T1 (魔王宿敌)",   wins = 5, losses = 1, points = 10, streak = 3, tier = "SSS" },
        { id = "GEN",     name = "GEN (Gen.G)",     wins = 4, losses = 2, points = 8,  streak = 1, tier = "S+" },
        { id = "BLG",     name = "BLG (血腥霸主)",   wins = 4, losses = 2, points = 8,  streak = -1, tier = "S+" },
        { id = "JDG",     name = "JDG (团战机器)",   wins = 3, losses = 3, points = 6,  streak = 1, tier = "S" },
        { id = "TES",     name = "TES (滔搏双C)",   wins = 2, losses = 4, points = 4,  streak = -2, tier = "A+" },
        { id = "HLE",     name = "HLE (银河战舰)",   wins = 1, losses = 5, points = 2,  streak = -3, tier = "A" },
        { id = "WBG",     name = "WBG (乱战奇兵)",   wins = 0, losses = 6, points = 0,  streak = -4, tier = "A" },
    }

    self.league_schedule = {
        { week = 1, opponent_id = "WBG", opponent_name = "WBG (微博电竞)", threat = "A", star_player = "Xiaohu (虎大将军)", key_tactic = "乱战极限拉扯", played = true, player_won = true, score = "2 - 0" },
        { week = 2, opponent_id = "TES", opponent_name = "TES (滔搏竞技)", threat = "A+", star_player = "JackeyLove (阿水)", key_tactic = "暴躁对线狂暴双C", played = true, player_won = true, score = "2 - 1" },
        { week = 3, opponent_id = "HLE", opponent_name = "HLE (韩华新贵)", threat = "A+", star_player = "Viper (通天代)", key_tactic = "后期大核四保一", played = true, player_won = true, score = "2 - 0" },
        { week = 4, opponent_id = "JDG", opponent_name = "JDG (京东电竞)", threat = "S", star_player = "Ruler (顶级尺帝)", key_tactic = "团战完美拉扯配合", played = true, player_won = false, score = "1 - 2" },
        { week = 5, opponent_id = "BLG", opponent_name = "BLG (Bilibili Gaming)", threat = "S+", star_player = "Knight (黄金左手)", key_tactic = "开局野区血腥入侵与极限越塔", played = true, player_won = true, score = "2 - 1" },
        { week = 6, opponent_id = "GEN", opponent_name = "GEN (Gen.G Esports)", threat = "S+", star_player = "Chovy (补刀机器)", key_tactic = "窒息控龙防守反击", played = true, player_won = true, score = "2 - 0" },
        { week = 7, opponent_id = "T1",  opponent_name = "T1 (T1 电竞俱乐部)", threat = "SSS", star_player = "Faker (大魔王)", key_tactic = "神级大局观、大龙逼团陷阱与灵性开团", played = false, player_won = nil, score = nil },
        { week = 8, opponent_id = "DK",  opponent_name = "DK (Dplus KIA)", threat = "S", star_player = "ShowMaker (许秀)", key_tactic = "野区致命反蹲抓单", played = false, player_won = nil, score = nil },
        { week = 9, opponent_id = "WBG", opponent_name = "WBG (第二轮复仇战)", threat = "A+", star_player = "Crisp (战术大脑)", key_tactic = "辅助极限开团游走", played = false, player_won = nil, score = nil },
        { week = 10, opponent_id = "TES", opponent_name = "TES (常规赛抢分战)", threat = "S", star_player = "369 (摇骰天王)", key_tactic = "上路单带绝境反击", played = false, player_won = nil, score = nil },
        { week = 11, opponent_id = "BLG", opponent_name = "BLG (胜者组门票生死战)", threat = "S+", star_player = "Bin (绝境斗士)", key_tactic = "五人包夹越塔强推", played = false, player_won = nil, score = nil },
        { week = 12, opponent_id = "T1",  opponent_name = "T1 (春季赛收官天王山之战)", threat = "SSS", star_player = "Zeus/Oner/Faker", key_tactic = "三路齐推无解大龙决断", played = false, player_won = nil, score = nil },
    }

    -- 11. 5-Man Roster & Active Lineup System
    self.roster = {
        starters = {
            TOP = { id = "top_breathe", name = "Breathe_Jr", role = "TOP", ovr = 82, mechanics = 84, mental = 80, morale = 92, form = 95, grade = "A+" },
            JUG = { id = "jug_wei",     name = "Wei_Spark",  role = "JUG", ovr = 84, mechanics = 85, mental = 83, morale = 94, form = 96, grade = "S" },
            MID = { id = "mid_player",  name = self.player.name or "Prodigy", role = "MID", ovr = self.player.mechanics or 86, mechanics = self.player.mechanics or 86, mental = self.player.mental or 80, morale = 100, form = 100, is_player = true, grade = "S+" },
            ADC = { id = "adc_gala",    name = "Gala_Focus", role = "ADC", ovr = 85, mechanics = 88, mental = 82, morale = 90, form = 94, grade = "S" },
            SUP = { id = "sup_crisp",   name = "Crisp_Guard",role = "SUP", ovr = 83, mechanics = 82, mental = 85, morale = 95, form = 98, grade = "A+" },
        },
        bench = {
            { id = "sub_zephyr", name = "Zephyr_01", role = "MID", ovr = 78, mechanics = 80, mental = 75, morale = 85, form = 90, grade = "A" },
            { id = "sub_lumen",  name = "Lumen_02",  role = "ADC", ovr = 76, mechanics = 78, mental = 74, morale = 84, form = 88, grade = "A" },
            { id = "sub_blaze",  name = "Blaze_03",  role = "TOP", ovr = 74, mechanics = 75, mental = 72, morale = 82, form = 86, grade = "B+" },
            { id = "sub_kestrel",name = "Kestrel_99",role = "JUG", ovr = 75, mechanics = 76, mental = 73, morale = 80, form = 85, grade = "B+" },
            { id = "sub_mirth",  name = "Mirth_05",  role = "SUP", ovr = 75, mechanics = 74, mental = 76, morale = 83, form = 87, grade = "B+" },
        }
    }

    self.active_tab = "CAREER"
    self.touch_buttons = {}
    self.bottom_tabs = {}

    self.recent_logs = {}
    self:log("Welcome to Esports Legacy: Road to Worlds (TapTap Make Edition)!")
    return self
end

function TapTapGame:switchTab(tab_id)
    local valid_tabs = { CAREER = true, STAGE = true, DYNASTY = true, TOUR = true, LOGS = true }
    if valid_tabs[tab_id] then
        self.active_tab = tab_id
        self:log("📱 切换视图面板: " .. tostring(tab_id))
    end
end

function TapTapGame:handleTouch(x, y)
    if not x or not y then return false end

    -- 1. Check bottom navigation tabs
    if self.bottom_tabs then
        for _, tab in ipairs(self.bottom_tabs) do
            if x >= tab.x1 and x <= tab.x2 and y >= tab.y1 and y <= tab.y2 then
                self:switchTab(tab.id)
                return true
            end
        end
    end

    -- 2. Check active view action buttons
    if self.touch_buttons then
        for _, btn in ipairs(self.touch_buttons) do
            if x >= btn.x1 and x <= btn.x2 and y >= btn.y1 and y <= btn.y2 then
                if btn.id == "SWITCH_TAB" then
                    self:switchTab(btn.payload)
                elseif btn.id == "SET_DYNASTY_SUBTAB" then
                    self.dynasty_subtab = btn.payload
                elseif btn.id == "DEV_UNLOCK_PHASE2" then
                    self.phase = 2
                    self.unlocked_phases[2] = true
                    self:switchTab("STAGE")
                    self:log("🌟 【开发者模式】已解锁 Phase 2 职业战队舞台！")
                elseif btn.id == "DEV_UNLOCK_PHASE3" then
                    self.phase = 3
                    self.unlocked_phases[3] = true
                    self:switchTab("DYNASTY")
                    self:log("👑 【开发者模式】已解锁 Phase 3 俱乐部商业王朝！")
                else
                    self:onAction(btn.id, btn.payload)
                end
                return true
            end
        end
    end
    return false
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

function TapTapGame:actionBuyGear(gear_id)
    local item = Gear.getById(gear_id)
    if not item then
        self:log("❌ 找不到指定的外设硬件！")
        return false, "外设不存在"
    end

    self.player.inventory_gear = self.player.inventory_gear or {}
    for _, gid in ipairs(self.player.inventory_gear) do
        if gid == gear_id then
            local alreadyMsg = string.format("⚠️ 你已经拥有【%s】，无需重复购买！", item.name)
            self:log(alreadyMsg)
            return false, alreadyMsg
        end
    end

    if self.player.money < item.cost then
        local poorMsg = string.format("❌ 资金不足：购买【%s】需要 $%d，当前仅有 $%d！", item.name, item.cost, self.player.money)
        self:log(poorMsg)
        return false, poorMsg
    end

    self.player.money = self.player.money - item.cost
    table.insert(self.player.inventory_gear, gear_id)
    self.player.mechanics = (self.player.mechanics or 50) + (item.mechanics_bonus or 0)
    self.player.mental = math.min(100, (self.player.mental or 70) + (item.mental_bonus or 0))

    local msg = string.format("🎧【外设升级成功】耗资 $%d 入手【%s】！微操+%d (当前:%d)，心态+%d (当前:%d)！%s",
        item.cost, item.name, item.mechanics_bonus or 0, self.player.mechanics,
        item.mental_bonus or 0, self.player.mental, item.desc or "")
    self:log(msg)
    return true, msg
end

function TapTapGame:actionEquipRing(ring_id)
    if not ChampionshipRings then return false, "Championship Rings module missing" end
    local ring = ChampionshipRings.getRingById(ring_id)
    if not ring then return false, "未找到该戒指档案！" end
    local is_unlocked = false
    for _, uid in ipairs(self.championship_rings.unlocked or {}) do
        if uid == ring_id then is_unlocked = true; break end
    end
    if not is_unlocked then
        return false, string.format("尚未解锁【%s】！需斩获相应全球总决赛冠军即可加冕！", ring.name)
    end
    self.championship_rings.equipped = ring_id
    local msg = string.format("💍【冠军神戒加冕】成功佩戴【%s】！激活特权：%s", ring.name, ring.stats_buff.desc)
    self:log(msg)
    return true, msg
end

function TapTapGame:actionStartBootcamp(location_id)
    if not TrainingCamp then return false, "Training Camp module missing" end
    local loc = TrainingCamp.getLocationById(location_id) or TrainingCamp.LOCATIONS[1]
    local current_budget = (self.phase == 3 and self.dynasty_engine and self.dynasty_engine.budget) or self.player.money
    local state_proxy = {
        budget = current_budget,
        roster = (self.dynasty_engine and self.dynasty_engine.roster) or {
            { name = self.player.name, role = self.player.role, mechanics = self.player.mechanics, mental = self.player.mental, morale = 90 }
        }
    }

    local success, msg = TrainingCamp.startBootcamp(state_proxy, location_id)
    if success then
        if self.phase == 3 and self.dynasty_engine then
            self.dynasty_engine.budget = state_proxy.budget
        else
            self.player.money = state_proxy.budget
        end
        self.player.mechanics = math.min(100, (self.player.mechanics or 75) + loc.mechanics_bonus)
        self.player.mental = math.min(100, (self.player.mental or 75) + loc.macro_bonus)
        self.active_bootcamp = state_proxy.active_bootcamp
        self:log(msg)
    end
    return success, msg
end

function TapTapGame:actionSetTacticalPreset(preset_id)
    if not TeamDynamics then return false, "Team Dynamics module missing" end
    local preset = TeamDynamics.getPresetById(preset_id)
    if not preset then return false, "未找到该战术预设！" end
    self.tactical_preset = preset_id
    local msg = string.format("⚔️【战术阵型重组】切换战队预设为【%s】！激活特权：%s", preset.name, preset.buff_label)
    self:log(msg)
    return true, msg
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

    -- 4-Round Match Highlight Engine
    if MatchHighlightEngine then
        local my_pwr = self.player.mechanics + (self.staff and self.staff.head_coach and 8 or 0)
        local enemy_pwr = 80
        local tactical_buff = (self.tactical_bp_drill and self.tactical_bp_drill.activeBuff and self.tactical_bp_drill.activeBuff.winRateBonus) or 0
        local hl_won, match_report = MatchHighlightEngine.simulateDetailedMatch(
            self.player.name or "你方战队", "GEN (Gen.G Esports)", my_pwr, enemy_pwr, tactical_buff
        )
        self.last_match_report = match_report
        for _, r in ipairs(match_report.rounds) do
            self:log(string.format("【%s】%s: %s", r.phase, r.title, r.desc))
        end
        if match_report.casterQuote then
            self:log("🎙️ 现场解说热评: " .. match_report.casterQuote)
        end
    else
        for _, l in ipairs(logs) do self:log(l) end
    end

    -- 启动 2D 比赛演播剧场与峡谷战术沙盘
    if MatchVisualTheater then
        self:actionStartVisualMatch("GEN (Gen.G Esports)")
    end

    -- 25% chance of triggering random Esports Crisis & Dilemma
    if math.random(1, 100) <= 25 and not self.pending_crisis and EsportsCrisisEngine then
        self:actionTriggerCrisis()
    end

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

    -- Permanently Induct into Hall of Fame
    if HallOfFame then
        HallOfFame.inductPlayer(self.hall_of_fame, self.player, self.trophies, "#1")
    end

    self:log("============================================================")
    self:log("👑 RETIREMENT HALL OF FAME: 传奇挂靴退役 · 荣誉入驻电竞名人堂")
    self:log(string.format("🏆 荣誉奖杯总计: %d / 4 座殿堂奖杯", trophy_count))
    self:log(string.format("💰 生涯累计总收入: $%s (达成 $1,000,000 门槛)", string.format("%d", lifetime_earnings)))
    self:log(string.format("🌟 'Greatest Player of All Time' (GOAT) 历史评级指数: %.1f / 100 [SSS 级神之领域]", goat_index))
    self:log("你支付 $1,000,000 全资收购全球豪门俱乐部，转型战队老板兼总经理 (GM)！专属战袍 #1 悬挂穹顶！")
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
-- LEAGUE CALENDAR & MATCHDAY PROGRESSION ENGINE (18-26 WEEKS)
-- ============================================================================
function TapTapGame:getLeagueStandings()
    local list = {}
    for _, t in ipairs(self.league_standings or {}) do
        table.insert(list, t)
    end
    table.sort(list, function(a, b)
        if a.points ~= b.points then
            return a.points > b.points
        end
        return a.wins > b.wins
    end)
    for idx, t in ipairs(list) do
        t.rank = idx
    end
    return list
end

function TapTapGame:getCurrentScheduledFixture()
    for _, fix in ipairs(self.league_schedule or {}) do
        if not fix.played then
            return fix
        end
    end
    return self.league_schedule[#self.league_schedule]
end

function TapTapGame:actionPreMatchStrategy()
    local fix = self:getCurrentScheduledFixture()
    if not fix or fix.played then
        return false, "当前赛季所有已排定赛程已完赛！"
    end
    if self.player.energy < 10 then
        return false, "体力不足 (需 10 点精力) 召开全队战术研讨沙盘会议！"
    end
    self.player.energy = math.max(0, self.player.energy - 10)
    self.pre_match_tactical_buff = {
        fixture_week = fix.week,
        opponent_id = fix.opponent_id,
        win_rate_bonus = 12
    }
    local msg = string.format("📋【赛前战术会议完成】教练组深度剖析了【%s】的野区插眼路线与BP偏好！本场常规赛胜率加成 +12%%！", fix.opponent_name)
    self:log(msg)
    if SoundManager then SoundManager.PlaySFX("CLICK") end
    return true, msg
end

function TapTapGame:actionPlayScheduledMatch()
    local fix = self:getCurrentScheduledFixture()
    if not fix or fix.played then
        return false, "当前赛段常规赛程已全部打完！请等待季后赛巅峰决战！"
    end

    if self.player.energy < 15 then
        return false, "体力过低 (需 15 点体力) 无法登场进行高强度 BO3 职业联赛！请先休整！"
    end

    self.player.energy = math.max(0, self.player.energy - 15)
    self.player.focus = math.max(10, (self.player.focus or 100) - 12)

    -- Advance calendar 2 days
    local time_adv = self.esports_engine:advanceDays(2, self.player)
    if self.community_engine then self.community_engine:tickDays(2) end

    -- Draft & Highlights simulation
    Draft.autoDraft(self.draft_engine)
    local blue_pct, red_pct = Draft.calculateScores(self.draft_engine, self.esports_engine)
    
    local tact_buff = (self.pre_match_tactical_buff and self.pre_match_tactical_buff.fixture_week == fix.week and self.pre_match_tactical_buff.win_rate_bonus) or 0
    self.pre_match_tactical_buff = nil

    local my_pwr = (self.player.mechanics or 80) + (self.staff and self.staff.head_coach and 8 or 0)
    local enemy_pwr = (fix.threat == "SSS" and 90) or (fix.threat == "S+" and 86) or (fix.threat == "S" and 82) or 77

    local hl_won, match_report = MatchHighlightEngine.simulateDetailedMatch(
        "DYNASTY (你方战队)", fix.opponent_name, my_pwr, enemy_pwr, tact_buff
    )
    self.last_match_report = match_report

    -- Update fixture status
    fix.played = true
    fix.player_won = hl_won
    fix.score = hl_won and "2 - 1" or "1 - 2"

    -- Update League Standings
    local my_team = nil
    local rival_team = nil
    for _, t in ipairs(self.league_standings) do
        if t.id == "DYNASTY" then my_team = t end
        if t.id == fix.opponent_id then rival_team = t end
    end

    if my_team then
        if hl_won then
            my_team.wins = my_team.wins + 1
            my_team.points = my_team.points + 2
            my_team.streak = (my_team.streak >= 0) and (my_team.streak + 1) or 1
        else
            my_team.losses = my_team.losses + 1
            my_team.streak = (my_team.streak <= 0) and (my_team.streak - 1) or -1
        end
    end

    if rival_team then
        if hl_won then
            rival_team.losses = rival_team.losses + 1
            rival_team.streak = (rival_team.streak <= 0) and (rival_team.streak - 1) or -1
        else
            rival_team.wins = rival_team.wins + 1
            rival_team.points = rival_team.points + 2
            rival_team.streak = (rival_team.streak >= 0) and (rival_team.streak + 1) or 1
        end
    end

    -- Off-screen simulation for remaining teams in this week
    for _, t in ipairs(self.league_standings) do
        if t.id ~= "DYNASTY" and t.id ~= fix.opponent_id and math.random() > 0.35 then
            local is_w = (math.random() > 0.45)
            if is_w then
                t.wins = t.wins + 1
                t.points = t.points + 2
                t.streak = (t.streak >= 0) and (t.streak + 1) or 1
            else
                t.losses = t.losses + 1
                t.streak = (t.streak <= 0) and (t.streak - 1) or -1
            end
        end
    end

    self.esports_engine:recordMatchResult(hl_won)

    -- Log highlights
    for _, r in ipairs(match_report.rounds) do
        self:log(string.format("【%s】%s: %s", r.phase, r.title, r.desc))
    end
    if match_report.casterQuote then
        self:log("🎙️ 官方解说: " .. match_report.casterQuote)
    end

    local gain_lp = hl_won and 45 or -15
    local gain_money = hl_won and 12000 or 3000
    local gain_fame = hl_won and 25 or 5
    self.player.lp = math.max(0, self.player.lp + gain_lp)
    self.player.money = self.player.money + gain_money
    self.player.fame = self.player.fame + gain_fame

    local headline = hl_won and "🎉【常规赛大捷】" or "❌【常规赛惜败】"
    local res_msg = string.format("%s常规赛第 %d 轮决战 %s！比分 [%s]，斩获奖金 $%d，LP %+d，积分榜排名已刷新！",
        headline, fix.week, hl_won and "斩获大胜" or "遗憾告负", fix.score, gain_money, gain_lp)
    self:log(res_msg)

    if hl_won and SoundManager then
        SoundManager.PlaySFX("EVENT_WIN")
    elseif SoundManager then
        SoundManager.PlaySFX("EVENT_LOSE")
    end

    return hl_won, res_msg, match_report
end

-- ============================================================================
-- 5-MAN ROSTER & STARTING LINEUP MANAGEMENT
-- ============================================================================
function TapTapGame:actionSwapRoster(role, candidate_id)
    if not self.roster or not self.roster.starters or not self.roster.bench then
        return false, "战队阵容系统未就绪"
    end
    local current_starter = self.roster.starters[role]
    local bench_idx = nil
    local candidate = nil
    for idx, b in ipairs(self.roster.bench) do
        if b.id == candidate_id then
            bench_idx = idx
            candidate = b
            break
        end
    end

    if not candidate then
        return false, "未在替补席或候选名单中找到指定选手"
    end

    -- Swap
    self.roster.starters[role] = candidate
    table.remove(self.roster.bench, bench_idx)
    if current_starter then
        table.insert(self.roster.bench, current_starter)
    end

    local msg = string.format("🔄【阵容轮换完成】将【%s】(评级: %s) 调整为 %s 首发！全队战术体系已重新配准！", candidate.name, candidate.grade or "A", role)
    self:log(msg)
    if SoundManager then SoundManager.PlaySFX("CLICK") end
    return true, msg
end

function TapTapGame:actionTrainRosterPlayer(role)
    local starter = self.roster and self.roster.starters and self.roster.starters[role]
    if not starter then return false, "未指定有效的位置选手" end
    local cost = 1200
    if self.player.money < cost then
        return false, string.format("战队资金不足 (需 $%d) 为 %s 首发安排大师级专项特训！", cost, role)
    end
    self.player.money = self.player.money - cost
    starter.ovr = math.min(99, (starter.ovr or 80) + 2)
    starter.morale = math.min(100, (starter.morale or 85) + 8)
    starter.form = math.min(100, (starter.form or 90) + 5)
    local msg = string.format("🎯【位置专属大师特训】%s 首发【%s】完成深度战术特训！综合战力 +2 (现: %d)，士气拉满！", role, starter.name, starter.ovr)
    self:log(msg)
    if SoundManager then SoundManager.PlaySFX("EVENT_REWARD") end
    return true, msg
end

-- ============================================================================
-- INTERACTIVE GEAR, AGENCY, SPONSOR & TALENT ACTIONS (DEAD BUTTON ELIMINATION)
-- ============================================================================
function TapTapGame:actionTuneGear(gear_id)
    local found = false
    for _, gid in ipairs(self.player.inventory_gear or {}) do
        if gid == gear_id then found = true; break end
    end
    if not found then
        return false, "尚未配备该外设，无法进行调校"
    end
    local cost = 800
    if self.player.money < cost then
        return false, "资金不足 (需 $800) 进行外设超频与微动精密调校！"
    end
    self.player.money = self.player.money - cost
    self.player.mechanics = math.min(100, self.player.mechanics + 2)
    local msg = "🔧【外设超频调校完成】精密校准了传感器回报率与按键触发行程！个人微操永久提升 +2！"
    self:log(msg)
    if SoundManager then SoundManager.PlaySFX("CLICK") end
    return true, msg
end

function TapTapGame:actionUnequipGear(gear_id)
    local found_idx = nil
    for idx, gid in ipairs(self.player.inventory_gear or {}) do
        if gid == gear_id then
            found_idx = idx
            break
        end
    end
    if not found_idx then
        return false, "该外设未处于配备装载状态"
    end
    table.remove(self.player.inventory_gear, found_idx)
    local msg = "📦【外设已卸下入库】外设已从当前比赛战备柜卸下并归还仓库。"
    self:log(msg)
    if SoundManager then SoundManager.PlaySFX("CLICK") end
    return true, msg
end

function TapTapGame:actionAgentPitchDeal()
    if not self.player.agency or not self.player.agency.hired_agent then
        return false, "尚未签约经纪人，请先物色并签约专属王牌经纪人！"
    end
    if self.player.energy < 5 then
        return false, "体力不足 (需 5 点体力) 前往商务中心出席赞助商商谈会面！"
    end
    self.player.energy = math.max(0, self.player.energy - 5)
    local earned = 3500
    self.player.money = self.player.money + earned
    self.player.fame = math.min(100, self.player.fame + 8)
    local msg = string.format("💼【经纪人商务洽谈大捷】经纪人为你成功推销并敲定一期高端品牌联名！即刻到账代言预付款 +$%d，声望 +8！", earned)
    self:log(msg)
    if SoundManager then SoundManager.PlaySFX("EVENT_REWARD") end
    return true, msg
end

function TapTapGame:actionSponsorAdvance(sponsor_id)
    local is_signed = false
    for _, sid in ipairs(self.player.agency and self.player.agency.signed_sponsors or {}) do
        if sid == sponsor_id then is_signed = true break end
    end
    if not is_signed then
        return false, "尚未与该赞助商正式签约"
    end
    local advance = 4000
    self.player.money = self.player.money + advance
    local msg = string.format("💰【赞助商分红款提前划拨】根据常规赛优异曝光，赞助商财务部门提前结清 3 场比赛追加奖金 +$%d！", advance)
    self:log(msg)
    if SoundManager then SoundManager.PlaySFX("EVENT_REWARD") end
    return true, msg
end

function TapTapGame:actionEquipEmoteBadge(emote_id)
    self.player.equipped_emote = emote_id or "荣耀先锋"
    local msg = string.format("✨【特权战队标装配成功】比赛与直播间将默认亮出至尊绝版专属图标【%s】！", self.player.equipped_emote)
    self:log(msg)
    if SoundManager then SoundManager.PlaySFX("CLICK") end
    return true, msg
end

function TapTapGame:actionPolishRing(ring_id)
    if not self.championship_rings or not self.championship_rings.equipped then
        return false, "当前未佩戴加冕冠军神戒"
    end
    self.player.mental = math.min(100, self.player.mental + 4)
    if self.player.confidence then
        self.player.confidence.score = math.min(100, (self.player.confidence.score or 50) + 10)
    end
    local msg = "💍【擦拭与缅怀神戒铭刻】抚摸戒指上镌刻的世界冠军名宿徽记，全员战意激昂！心态 +4，狂傲自信心 +10 点！"
    self:log(msg)
    if SoundManager then SoundManager.PlaySFX("EVENT_REWARD") end
    return true, msg
end

function TapTapGame:actionUnequipRing(ring_id)
    if self.championship_rings then
        self.championship_rings.equipped = nil
    end
    local msg = "💍【冠军神戒已放入殿堂展柜】戒指已归还至名人堂玻璃展柜，可在随时重新佩戴。"
    self:log(msg)
    if SoundManager then SoundManager.PlaySFX("CLICK") end
    return true, msg
end

function TapTapGame:actionRefundTalent(talent_id)
    local pe = self.prestige_engine
    if not pe or #pe.unlocked_passives == 0 then
        return false, "当前尚未激活任何传承树天赋，无需重置"
    end
    local refunded_pts = #pe.unlocked_passives * 20
    pe.prestige_points = pe.prestige_points + refunded_pts
    pe.unlocked_passives = {}
    local msg = string.format("🧬【传承树天赋洗点成功】已洗去全部天赋树节点，全额返还 +%d 点名宿声望！可重新构筑流派！", refunded_pts)
    self:log(msg)
    if SoundManager then SoundManager.PlaySFX("CLICK") end
    return true, msg
end

function TapTapGame:actionTriggerSoloDilemma()
    local ev = Events.getRandom()
    self.pending_dilemma = {
        id = ev.id,
        title = ev.title,
        tag = ev.tag,
        scenario = ev.scenario,
        options = {}
    }
    for i, opt in ipairs(ev.options) do
        table.insert(self.pending_dilemma.options, {
            index = i,
            label = opt.label,
            risk = opt.risk
        })
    end
    self._raw_dilemma_event = ev
    local msg = string.format("⚡【突发战局抉择】%s: %s", ev.title, ev.scenario)
    self:log(msg)
    return true, msg, self.pending_dilemma
end

function TapTapGame:actionResolveDilemma(choice_index)
    if not self.pending_dilemma or not self._raw_dilemma_event then
        self:actionTriggerSoloDilemma()
    end
    local ev = self._raw_dilemma_event
    choice_index = tonumber(choice_index) or 1
    local opt = ev and ev.options and (ev.options[choice_index] or ev.options[1])
    if not opt then return false, "无效的战术裁决选项" end

    local outcome = opt.execute(self.player)
    self:addLP(outcome.lp or 0)
    self.player.mechanics = math.min(100, math.max(10, self.player.mechanics + (outcome.mechanics or 0)))
    self.player.mental = math.min(100, math.max(5, self.player.mental + (outcome.mental or 0)))
    self.player.money = self.player.money + (outcome.money or 0)
    if outcome.fame then self.player.fame = math.min(100, (self.player.fame or 0) + outcome.fame) end

    if outcome.success then
        self.player.wins = self.player.wins + 1
        self.player.win_streak = self.player.win_streak + 1
        if SoundManager then SoundManager.PlaySFX("VICTORY_FANFARE") end
    else
        self.player.win_streak = 0
        if SoundManager then SoundManager.PlaySFX("DEFEAT_TAPS") end
    end

    self.pending_dilemma = nil
    self._raw_dilemma_event = nil
    local msg = string.format("⚔️【战术抉择结果】%s (%s | LP %+d, 微操 %+d, 心态 %+d)",
        outcome.log, outcome.success and "获胜" or "惜败", outcome.lp or 0, outcome.mechanics or 0, outcome.mental or 0)
    self:log(msg)
    return true, msg, outcome
end

function TapTapGame:actionSellTrainee(trainee_id)
    self.academy = self.academy or { trainees = {} }
    local target = nil
    local target_idx = nil
    if trainee_id then
        for idx, t in ipairs(self.academy.trainees) do
            if t.id == trainee_id then
                target = t
                target_idx = idx
                break
            end
        end
    end
    if not target and #self.academy.trainees > 0 then
        target = self.academy.trainees[1]
        target_idx = 1
    end
    if not target and self.last_scouted_trainee then
        target = self.last_scouted_trainee
    end
    if not target then
        return false, "暂无可供挂牌交易的青训新秀"
    end
    if target_idx then
        table.remove(self.academy.trainees, target_idx)
    end
    local fee = (target.grade == "S" and 38000) or ((target.grade == "A" and 18000) or 8000)
    self.player.money = self.player.money + fee
    if self.phase == 3 and self.dynasty_engine then
        self.dynasty_engine.budget = (self.dynasty_engine.budget or 0) + fee
    end
    self.last_scouted_trainee = nil
    local msg = string.format("💼【青训挂牌转让】成功将新秀【%s】(%s级 %s) 转让至次级联赛，到账转会费注资 +$%d！",
        target.name, target.grade or target.tier or "B", target.role or "MID", fee)
    self:log(msg)
    if SoundManager then SoundManager.PlaySFX("EVENT_REWARD") end
    return true, msg, { fee = fee }
end

function TapTapGame:actionChooseBpTactic(tactic_id, rival_name)
    self.chosen_bp_tactic = tactic_id or "DIVE"
    local fix = self:getCurrentScheduledFixture()
    local enemy = rival_name or (fix and (fix.opponent_name or fix.opponent_id or fix.rival)) or "GEN"
    self.scheduled_fixture_in_progress = fix

    local tacticBuffs = {
        ["DIVE"] = 15,
        ["POKE"] = 15,
        ["TEAMFIGHT"] = 15
    }
    local bonus = tacticBuffs[self.chosen_bp_tactic] or 12
    self.pre_match_tactical_buff = {
        tactic = self.chosen_bp_tactic,
        bonus = bonus
    }
    local ok, msg, match = self:actionStartVisualMatch(enemy)
    local label = (self.chosen_bp_tactic == "DIVE" and "冲阵强突突脸")
        or ((self.chosen_bp_tactic == "POKE" and "远距拉扯消耗") or "龙坑铁桶团战")
    local fullMsg = string.format("🎯【BP战术锁定】确立【%s】体系克制 %s (战力加成 +%d%%)！无缝转入召唤师峡谷沙盘演播！",
        label, enemy, bonus)
    self:log(fullMsg)
    return true, fullMsg, match
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
        teamPower = self.dynasty_engine:getTeamPower()
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
        active_tab = self.active_tab,
        player_name = self.player.name or "Prodigy",
        player_role = self.player.role or "MID",
        player_trait = self.player.trait or "mechanics",
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
        facilities = self.facilities,
        academy = self.academy,
        coach = self.coach,
        staff = self.staff,
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
        inventory_gear = self.player.inventory_gear or {},
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
        unlocked_phases = self.unlocked_phases,
        championship_rings = ChampionshipRings and {
            all = ChampionshipRings.getAllRings(),
            unlocked = self.championship_rings.unlocked,
            equipped = self.championship_rings.equipped,
            active_buff = ChampionshipRings.calculateEquippedRingBuff(self.championship_rings.equipped)
        },
        bootcamp = {
            all_locations = TrainingCamp and TrainingCamp.getAllLocations() or {},
            active_bootcamp = self.active_bootcamp
        },
        meta_tier_list = MetaTierList and MetaTierList.getCurrentPatch() or nil,
        team_dynamics = TeamDynamics and TeamDynamics.calculateTeamState(
            self.dynasty_engine and self.dynasty_engine.roster or {},
            self.tactical_preset
        ) or nil,
        merch_lab = self.merch_lab and {
            upgrades = self.merch_lab.upgrades,
            total_rd_spent = self.merch_lab.total_rd_spent,
            multipliers = self.merch_lab:calculateMultipliers()
        },
        expansion_draft = self.expansion_draft,
        career_journal = self.career_journal,
        tactical_bp_drill = {
            all_puzzles = TacticalBpDrill and TacticalBpDrill.getAllPuzzles() or {},
            solved = self.tactical_bp_drill.solvedPuzzles,
            active_buff = self.tactical_bp_drill.activeBuff
        },
        scout_radar = {
            mode = self.scout_radar_mode,
            rival_id = self.scout_rival_id,
            clusters = ScoutIntelHeatmap and ScoutIntelHeatmap.getTeamClusters(self.scout_rival_id) or nil,
            league_avg = ScoutIntelHeatmap and ScoutIntelHeatmap.GLOBAL_LEAGUE_AVERAGE or nil,
            user_clusters = ScoutIntelHeatmap and ScoutIntelHeatmap.getUserTeamClusters(self.player) or nil
        },
        jersey_studio = self.jersey_studio,
        pending_crisis = self.pending_crisis,
        crisis_history = self.crisis_history,
        hall_of_fame = HallOfFame and {
            all_legends = HallOfFame.getAllLegends(self.hall_of_fame),
            equipped_aura = HallOfFame.getEquippedAura(self.hall_of_fame),
            total_inducted = self.hall_of_fame.totalInducted
        } or nil,
        last_match_report = self.last_match_report,
        current_visual_match = self.current_visual_match,
        league_schedule = self.league_schedule,
        league_standings = self:getLeagueStandings(),
        current_fixture = self:getCurrentScheduledFixture(),
        roster = self.roster,
        equipped_emote = self.player.equipped_emote,
        pending_dilemma = self.pending_dilemma,
        last_scouted_trainee = self.last_scouted_trainee,
        chosen_bp_tactic = self.chosen_bp_tactic,
        scheduled_fixture_in_progress = self.scheduled_fixture_in_progress,
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
    team_id = string.lower(team_id or "")
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
    team_id = string.lower(team_id or "")
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

    local summary = logs and table.concat(logs, "\n") or (is_win and "训练赛获胜" or "训练赛失利")
    return is_win, summary, logs
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

-- ============================================================================
-- MERCHANDISE R&D LAB API (战队周边商城与战袍工艺研发)
-- ============================================================================
function TapTapGame:actionUpgradeMerchTech(tech_id)
    if not self.merch_lab then
        return false, "战袍研发工坊未初始化"
    end
    local dynasty_ctx = (self.phase == 3 and self.dynasty_engine) or {
        budget = self.player.money,
        fan_hype = (self.player.fame or 10) * 100
    }
    local ok, msg = self.merch_lab:investUpgrade(tech_id, dynasty_ctx)
    if self.phase ~= 3 and ok then
        self.player.money = dynasty_ctx.budget
    end
    self:log(msg)
    return ok, msg
end

function TapTapGame:renderMerchLab()
    if self.merch_lab then
        self.merch_lab:renderCLI()
    else
        print("Merch R&D Lab is not initialized.")
    end
end

-- ============================================================================
-- MERGED TAPTAP MAKER SYSTEMS (Facilities, Academy, Coach Equity, Staff)
-- ============================================================================
TapTapGame.FACILITY_CONFIG = {
    training = {
        name = "训练基地",
        icon = "🏋️",
        desc = "提升全队训练收益与选手微操成长",
        costs = { [2] = 25000, [3] = 60000 },
        buff_label = "微操成长+15%"
    },
    medical = {
        name = "康复医疗室",
        icon = "🩺",
        desc = "降低疲劳累积，大幅加速手腕与理疗恢复",
        costs = { [2] = 20000, [3] = 50000 },
        buff_label = "手腕劳损恢复+25%"
    },
    analysis = {
        name = "战术分析中心",
        icon = "📊",
        desc = "提升 5v5 BP 战术克制与对手数据破译",
        costs = { [2] = 30000, [3] = 75000 },
        buff_label = "BP克制加成+10%"
    },
    business = {
        name = "商务发展司",
        icon = "💼",
        desc = "扩大赞助商席位与战袍周边销售分成",
        costs = { [2] = 35000, [3] = 85000 },
        buff_label = "赞助收益乘数+15%"
    },
    gamingHouse = {
        name = "电竞基地大厦",
        icon = "🏢",
        desc = "降低抗压挫败，提升战队士气与化学反应",
        costs = { [2] = 50000, [3] = 120000 },
        buff_label = "团队士气+20%"
    }
}

function TapTapGame:actionUpgradeFacility(facility_id)
    local conf = TapTapGame.FACILITY_CONFIG[facility_id]
    if not conf then return false, "未知的俱乐部基地设施: " .. tostring(facility_id) end
    self.facilities = self.facilities or { training = 1, medical = 1, analysis = 1, business = 1, gamingHouse = 1 }
    local cur_lv = self.facilities[facility_id] or 1
    if cur_lv >= 3 then return false, string.format("【%s】已升级至最高等级 (Lv.3)", conf.name) end
    local next_lv = cur_lv + 1
    local cost = conf.costs[next_lv] or 50000

    local budget = (self.phase == 3 and self.dynasty_engine and self.dynasty_engine.budget) or self.player.money
    if budget < cost then
        return false, string.format("资金不足！升级【%s Lv.%d】需要 $%d (当前可用: $%d)", conf.name, next_lv, cost, budget)
    end

    if self.phase == 3 and self.dynasty_engine then
        self.dynasty_engine.budget = self.dynasty_engine.budget - cost
    else
        self.player.money = self.player.money - cost
    end

    self.facilities[facility_id] = next_lv
    local msg = string.format("🏗️ 俱乐部基地竣工！【%s】晋升至 Lv.%d！激活效果: 【%s】！", conf.name, next_lv, conf.buff_label)
    self:log(msg)
    return true, msg
end

function TapTapGame:actionScoutAcademyTrainee()
    local cost = 3000
    local budget = (self.phase == 3 and self.dynasty_engine and self.dynasty_engine.budget) or self.player.money
    if budget < cost then return false, "资金不足以支付青训星探差旅费 ($3,000)" end

    if self.phase == 3 and self.dynasty_engine then
        self.dynasty_engine.budget = self.dynasty_engine.budget - cost
    else
        self.player.money = self.player.money - cost
    end

    self.academy = self.academy or { trainees = {} }
    self.academy.trainees = self.academy.trainees or {}

    local roles = { "TOP", "JUG", "MID", "ADC", "SUP" }
    local names = { "Zephyr", "Lumen", "Blaze", "Nova", "Vex", "Chirp", "Dusk", "Arrow", "Haven", "Kite", "Fable", "Rune" }
    local r_role = roles[math.random(#roles)]
    local r_name = names[math.random(#names)] .. "_" .. tostring(math.random(10, 99))
    local roll = math.random(1, 100)
    local grade = "B"
    local power = math.random(62, 68)
    if roll > 80 then
        grade = "S"
        power = math.random(80, 88)
    elseif roll > 45 then
        grade = "A"
        power = math.random(72, 79)
    end

    local trainee = {
        id = "trainee_" .. tostring(os.time()) .. "_" .. tostring(math.random(100, 999)),
        name = r_name,
        role = r_role,
        grade = grade,
        tier = grade,
        power = power,
        potential = power + math.random(5, 12),
        mechanics = power + math.random(-2, 4),
        form = 100
    }
    self.last_scouted_trainee = trainee
    table.insert(self.academy.trainees, 1, trainee)
    if #self.academy.trainees > 6 then table.remove(self.academy.trainees) end

    local msg = string.format("🎓【青训发掘】星探从高校联赛截获超新星【%s】(位置: %s, 评级: %s级, 综合战力: %d)！已签入青训营！",
        trainee.name, trainee.role, trainee.grade, trainee.power)
    self:log(msg)
    return true, msg, trainee
end

function TapTapGame:actionPromoteTrainee(trainee_id)
    self.academy = self.academy or { trainees = {} }
    local trainees = self.academy.trainees or {}
    local idx, found = nil, nil
    if trainee_id then
        for i, t in ipairs(trainees) do
            if t.id == trainee_id then
                idx = i
                found = t
                break
            end
        end
    end
    if not found and #trainees > 0 then
        found = trainees[1]
        idx = 1
    end
    if not found then
        return false, "青训梯队中暂无可用待提拔的年轻选手"
    end

    table.remove(trainees, idx)
    local msg = string.format("⭐【青训晋升】将【%s】(%s级 %s) 破格提拔至俱乐部一队首发阵容！全队战意高昂！",
        found.name, found.grade, found.role)
    self:log(msg)
    return true, msg, found
end

function TapTapGame:actionCoachProposal(proposal_id)
    self.coach = self.coach or { name = "传奇教练", equity = 15, trust = 75, boss_name = "董事会", salary = 12000 }
    proposal_id = proposal_id or "tactical_budget"
    local proposals = {
        tactical_budget = { title = "申请追加赛训专项预算", trust_req = 50, gain_cash = 30000, trust_cost = 5 },
        korean_bootcamp  = { title = "组织赴首尔高强度特训拉练", trust_req = 65, gain_cash = 0, buff = "战术洞察+15", trust_cost = 4 },
        star_signing     = { title = "董事会定增引进超级巨星", trust_req = 80, gain_cash = 100000, trust_cost = 12 }
    }
    local prop = proposals[proposal_id] or proposals.tactical_budget
    if self.coach.trust < prop.trust_req then
        return false, string.format("提案被否决！董事会信任度不足 (需 %d 点，当前: %d 点)。需在职业赛场赢取战绩！",
            prop.trust_req, self.coach.trust)
    end

    self.coach.trust = self.coach.trust - prop.trust_cost
    if prop.gain_cash and prop.gain_cash > 0 then
        if self.phase == 3 and self.dynasty_engine then
            self.dynasty_engine.budget = self.dynasty_engine.budget + prop.gain_cash
        else
            self.player.money = self.player.money + prop.gain_cash
        end
    end
    local msg = string.format("📜【董事会批准】「%s」通过！投资方注资到位！当前董事会信任: %d 点",
        prop.title, self.coach.trust)
    self:log(msg)
    return true, msg
end

function TapTapGame:actionCoachBuyEquity(shares_pct)
    self.coach = self.coach or { name = "传奇教练", equity = 15, trust = 75, boss_name = "董事会", salary = 12000 }
    shares_pct = shares_pct or 5
    local cost_per_pct = 12000
    local total_cost = shares_pct * cost_per_pct
    local budget = (self.phase == 3 and self.dynasty_engine and self.dynasty_engine.budget) or self.player.money
    if budget < total_cost then
        return false, string.format("资金不足！回购 %d%% 俱乐部股权需 $%d (当前可用: $%d)",
            shares_pct, total_cost, budget)
    end
    if self.coach.equity + shares_pct > 100 then
        shares_pct = 100 - self.coach.equity
        total_cost = shares_pct * cost_per_pct
    end
    if shares_pct <= 0 then
        return false, "你已持有俱乐部 100% 绝对股份，已成为独立终极电竞财阀！"
    end

    if self.phase == 3 and self.dynasty_engine then
        self.dynasty_engine.budget = self.dynasty_engine.budget - total_cost
    else
        self.player.money = self.player.money - total_cost
    end
    self.coach.equity = self.coach.equity + shares_pct

    local status = "少数合伙人"
    if self.coach.equity >= 100 then
        status = "👑 独资财阀掌控者 (100% 绝对独资)"
    elseif self.coach.equity >= 51 then
        status = "👑 绝对控股大股东 (51%+ 一票否决)"
    end
    local msg = string.format("💼【股权回购】注资 $%d 回购 %d%% 俱乐部股权！个人持股比例提升至: %d%% (%s)！",
        total_cost, shares_pct, self.coach.equity, status)
    self:log(msg)
    return true, msg
end

function TapTapGame:actionSignStaff(staff_type, candidate_id)
    self.staff = self.staff or {}
    staff_type = staff_type or "head_coach"
    local candidates = {
        head_coach = { name = "金牌冠军教头 (Homme)", cost = 15000, buff = "BP克制加成 +10%" },
        analyst    = { name = "首席战术分析师 (Kramer)", cost = 10000, buff = "豪门战术情报 +12%" },
        physio     = { name = "运动医学博士 (Dr. Kang)", cost = 8000, buff = "伤病发生率降低 50%" }
    }
    local cand = candidates[staff_type] or candidates.head_coach
    local budget = (self.phase == 3 and self.dynasty_engine and self.dynasty_engine.budget) or self.player.money
    if budget < cand.cost then
        return false, string.format("资金不足！签约【%s】需 $%d (当前: $%d)", cand.name, cand.cost, budget)
    end

    if self.phase == 3 and self.dynasty_engine then
        self.dynasty_engine.budget = self.dynasty_engine.budget - cand.cost
    else
        self.player.money = self.player.money - cand.cost
    end
    self.staff[staff_type] = {
        name = cand.name,
        buff = cand.buff
    }
    local msg = string.format("🤝【赛训团队扩建】成功签约【%s】！激活全队特权: 【%s】！", cand.name, cand.buff)
    self:log(msg)
    return true, msg
end

-- ============================================================================
-- SAVE / LOAD PERSISTENCE SYSTEM (TapTap Make 本地持久化存档)
-- ============================================================================
function TapTapGame:saveGame()
    local save = {
        version = self.version,
        phase = self.phase,
        unlocked_phases = self.unlocked_phases,
        player = {
            name = self.player.name,
            lp = self.player.lp,
            rank = self.player.rank,
            mechanics = self.player.mechanics,
            mental = self.player.mental,
            energy = self.player.energy,
            focus = self.player.focus,
            energy_drinks = self.player.energy_drinks,
            money = self.player.money,
            fame = self.player.fame,
            win_streak = self.player.win_streak,
            games_played = self.player.games_played,
            wins = self.player.wins
        },
        trophies = self.trophies,
        facilities = self.facilities,
        academy = self.academy,
        coach = self.coach,
        staff = self.staff,
        dynasty_subtab = self.dynasty_subtab or "OVERVIEW",
        league_schedule = self.league_schedule,
        league_standings = self.league_standings,
        roster = self.roster,
        prestige = {
            generation = self.prestige_engine.generation,
            prestige_points = self.prestige_engine.prestige_points
        },
        world_tour = {
            current_floor = self.world_tour_engine.current_floor,
            highest_floor = self.world_tour_engine.highest_floor
        }
    }
    return save
end

function TapTapGame:loadGame(save_data)
    if not save_data or type(save_data) ~= "table" then
        return false, "存档数据格式无效"
    end
    if save_data.phase then self.phase = save_data.phase end
    if save_data.unlocked_phases then self.unlocked_phases = save_data.unlocked_phases end
    if save_data.player then
        for k, v in pairs(save_data.player) do
            self.player[k] = v
        end
    end
    if save_data.trophies then self.trophies = save_data.trophies end
    if save_data.facilities then self.facilities = save_data.facilities end
    if save_data.academy then self.academy = save_data.academy end
    if save_data.coach then self.coach = save_data.coach end
    if save_data.staff then self.staff = save_data.staff end
    if save_data.dynasty_subtab then self.dynasty_subtab = save_data.dynasty_subtab end
    if save_data.league_schedule then self.league_schedule = save_data.league_schedule end
    if save_data.league_standings then self.league_standings = save_data.league_standings end
    if save_data.roster then self.roster = save_data.roster end
    if save_data.prestige and self.prestige_engine then
        self.prestige_engine.generation = save_data.prestige.generation or 1
        self.prestige_engine.prestige_points = save_data.prestige.prestige_points or 0
    end
    if save_data.world_tour and self.world_tour_engine then
        self.world_tour_engine.current_floor = save_data.world_tour.current_floor or 1
        self.world_tour_engine.highest_floor = save_data.world_tour.highest_floor or 1
    end
    self:log("📂 成功载入 TapTap Make 本地游戏存档！当前段位: " .. self.player.rank)
    return true, "存档加载成功"
end

function TapTapGame:actionBudgetAudit()
    local rebate = math.random(12000, 20000)
    if self.phase == 3 and self.dynasty_engine then
        self.dynasty_engine.budget = self.dynasty_engine.budget + rebate
    else
        self.player.money = self.player.money + rebate
    end
    local msg = string.format("📊【CFO预算审计】深度审计俱乐部账目，剔除无用冗余开销并追回赞助商阶梯返款 +$%d！", rebate)
    self:log(msg)
    return true, msg, rebate
end

function TapTapGame:actionVodReview(vod_id)
    if (self.player.energy or 100) < 15 or (self.player.focus or 100) < 15 then
        return false, "精力或专注不足 (需 15%)，请深度休整恢复！"
    end
    self.player.energy = math.max(0, (self.player.energy or 100) - 15)
    self.player.focus = math.max(0, (self.player.focus or 100) - 15)
    self.player.mechanics = self.player.mechanics + 2
    self.player.mental = math.min(100, (self.player.mental or 70) + 3)
    local msg = "🎬【名局录像复盘】切片研读天王山龙坑世纪决战！洞察力+5，微操+2，心态+3！"
    self:log(msg)
    return true, msg
end

function TapTapGame:actionCctvCommand(action_name)
    action_name = action_name or "SUPERVISE"
    self.player.mental = math.min(100, (self.player.mental or 70) + 5)
    local msg = string.format("📹【基地监控督导】执行指令【%s】！战队心态回稳，选手训练专注度上升！", action_name)
    self:log(msg)
    return true, msg
end

function TapTapGame:actionScoutGachaPull(times)
    times = times or 1
    local cost = (times == 10) and 18000 or 2000
    local budget = (self.phase == 3 and self.dynasty_engine and self.dynasty_engine.budget) or self.player.money
    if budget < cost then
        return false, string.format("资金不足！球探招募需要 $%d (当前可用: $%d)", cost, budget)
    end
    if self.phase == 3 and self.dynasty_engine then
        self.dynasty_engine.budget = self.dynasty_engine.budget - cost
    else
        self.player.money = self.player.money - cost
    end
    local pulled_name = (times == 10) and "VORTEX (神级中单 SSS)" or "Hyper (顶级ADC SSR)"
    local msg = string.format("🎁【星探招募】成功招募【%s】！选手已加入战队储备池！", pulled_name)
    self:log(msg)
    return true, msg, pulled_name
end

function TapTapGame:actionBaronClutch(choice_id)
    choice_id = tonumber(choice_id or 1)
    local roll = math.random(1, 100)
    local is_win = (choice_id == 1 and roll <= 75) or (choice_id == 2 and roll <= 60) or true
    local msg = ""
    if is_win then
        self.player.lp = self.player.lp + 35
        self.player.fame = self.player.fame + 15
        msg = "🐉【大龙坑绝胜】刺客进场秒杀双C！打出 0换3 直取中路水晶拿下赛点！(+35 LP, +15 声望)"
    else
        self.player.lp = math.max(0, self.player.lp - 20)
        msg = "💀【大龙坑失手】被敌方辅助反手控住秒杀，男爵被夺被一波推平！(-20 LP)"
    end
    self:log(msg)
    return is_win, msg
end

function TapTapGame:actionUpgradeSynergy(pair_code)
    pair_code = pair_code or "JNG x MID"
    local cost = 1500
    local budget = (self.phase == 3 and self.dynasty_engine and self.dynasty_engine.budget) or self.player.money
    if budget < cost then
        return false, string.format("资金不足！升级羁绊需要 $%d (当前可用: $%d)", cost, budget)
    end
    if self.phase == 3 and self.dynasty_engine then
        self.dynasty_engine.budget = self.dynasty_engine.budget - cost
    else
        self.player.money = self.player.money - cost
    end
    self.tactical_preset = self.tactical_preset or "mid_jungle"
    local msg = string.format("🔗【战队羁绊拓扑】提升【%s】默契等级！全队神经同调率超频突破！", pair_code)
    self:log(msg)
    return true, msg
end

function TapTapGame:actionExpansionDraft(payload)
    payload = payload or {}
    if not self.expansion_draft then
        return false, "选秀引擎尚未加载"
    end
    if payload.action == "PROTECT" then
        local ok, msg = ExpansionDraft.protectCorePlayers(self.expansion_draft, payload.protected_ids)
        self:log(msg)
        return ok, msg
    else
        local treasury = (self.phase == 3 and self.dynasty_engine and self.dynasty_engine.budget) or self.player.money
        local ok, target, msg = ExpansionDraft.draftProdigy(self.expansion_draft, payload.prodigy_id, treasury)
        if ok and target then
            if self.phase == 3 and self.dynasty_engine then
                self.dynasty_engine.budget = self.dynasty_engine.budget - target.signingBonus
                table.insert(self.dynasty_engine.roster, {
                    id = target.id,
                    name = target.name,
                    role = target.role,
                    mechanics = target.mechanics,
                    macro = target.macro,
                    morale = target.morale
                })
            else
                self.player.money = self.player.money - target.signingBonus
            end
            self:log(msg)
            return true, msg, target
        else
            self:log("[-] " .. tostring(msg))
            return false, msg
        end
    end
end

function TapTapGame:actionGenerateCareerClipping(payload)
    payload = payload or {}
    local clip = nil
    if payload.type == "TROPHY" then
        clip = CareerJournal.createTrophyClipping(payload.trophy_name or "全球总决赛召唤师杯", "2026")
    elseif payload.type == "AGENT" then
        clip = CareerJournal.createAgentClipping(payload.agent_name or "林克 (Lin Ke)", payload.agent_title, payload.perk_desc)
    else
        clip = CareerJournal.createTitleClipping(payload.title or "峡谷神话传奇", payload.rarity or "MYTHIC", payload.bonus or "全属性+5%")
    end
    table.insert(self.career_journal.clippings, 1, clip)
    local msg = string.format("📰【电竞号外发行】《%s》加急印发头条: %s！", clip.newspaperName, clip.headline)
    self:log(msg)
    return true, msg, clip
end

function TapTapGame:actionSolveBpDrill(payload)
    payload = payload or {}
    local ok, reward, msg = TacticalBpDrill.solvePuzzle(payload.puzzle_id, payload.choices)
    if ok and reward then
        self.tactical_bp_drill.solvedPuzzles[payload.puzzle_id or "puzzle_dive_counter"] = true
        self.tactical_bp_drill.activeBuff = reward
        self.player.mechanics = self.player.mechanics + reward.bonusMechanics
        self:log(msg)
        return true, msg, reward
    end
    return false, "BP残局破解失败"
end

function TapTapGame:actionSetScoutRadarMode(payload)
    payload = payload or {}
    self.scout_radar_mode = payload.mode or "SELF"
    if payload.rival_id then
        self.scout_rival_id = string.lower(payload.rival_id)
    end
    local msg = string.format("🎯【战术热力雷达】已切换对标基准模式: [%s] (对标目标: %s)", self.scout_radar_mode, self.scout_rival_id)
    self:log(msg)
    return true, msg
end

function TapTapGame:actionCustomizeJersey(payload)
    payload = payload or {}
    self.jersey_studio.pattern = payload.pattern or self.jersey_studio.pattern
    self.jersey_studio.crest = payload.crest or self.jersey_studio.crest
    self.jersey_studio.colorPreset = payload.colorPreset or self.jersey_studio.colorPreset
    self.jersey_studio.priceTier = payload.priceTier or self.jersey_studio.priceTier
    local hype, units, rev, profit = JerseyStudio.calculateHypeAndSales(self.jersey_studio)
    local msg = string.format("👕【定制战袍工坊】战袍工艺更新！狂热指数: %d/100, 预估周销量: %d件, 预计周收入: +$%d！", hype, units, rev)
    self:log(msg)
    return true, msg, self.jersey_studio
end

function TapTapGame:actionTriggerCrisis(crisis_id)
    if not EsportsCrisisEngine then return false, "危机引擎未加载" end
    if crisis_id then
        for _, c in ipairs(EsportsCrisisEngine.CRISIS_DEFINITIONS) do
            if c.id == crisis_id then self.pending_crisis = c break end
        end
    end
    if not self.pending_crisis then
        self.pending_crisis = EsportsCrisisEngine.getRandomCrisis(self.phase)
    end
    local msg = "🚨【突发危机事件】" .. self.pending_crisis.title .. "！请在指令台迅速做出决断！"
    self:log(msg)
    return true, msg, self.pending_crisis
end

function TapTapGame:actionResolveCrisis(payload)
    if not EsportsCrisisEngine then return false, "危机引擎未加载" end
    payload = payload or {}
    local crisis_id = payload.crisis_id or (self.pending_crisis and self.pending_crisis.id)
    local choice_idx = payload.choice_index or 1
    if not crisis_id then return false, "当前没有待处理的突发危机事件" end
    return EsportsCrisisEngine.resolveChoice(self, crisis_id, choice_idx)
end

function TapTapGame:actionInductHallOfFame(payload)
    if not HallOfFame then return false, "名人堂引擎未加载" end
    payload = payload or {}
    local jerseyNumber = payload.jersey_number or "#10"
    local ok, legend, msg = HallOfFame.inductPlayer(self.hall_of_fame, self.player, self.trophies, jerseyNumber)
    if ok then
        self:log(msg)
        return true, msg, legend
    end
    return false, "入驻名人堂失败"
end

function TapTapGame:actionEquipHofAura(payload)
    if not HallOfFame then return false, "名人堂引擎未加载" end
    payload = payload or {}
    local aura_id = payload.aura_id or "aura_demon_king"
    local ok, msg = HallOfFame.equipAura(self.hall_of_fame, aura_id)
    if ok then
        self:log(msg)
        return true, msg
    end
    return false, "切换名宿光环失败"
end

function TapTapGame:actionStartVisualMatch(enemyTeamId)
    if not MatchVisualTheater then return false, "视觉演播引擎未就绪" end
    local enemyName = enemyTeamId or "GEN (Gen.G Esports)"
    local my_pwr = (self.player and self.player.mechanics) or 75
    if self.staff and self.staff.head_coach then my_pwr = my_pwr + 8 end
    local tactical_buff = (self.tactical_bp_drill and self.tactical_bp_drill.activeBuff and self.tactical_bp_drill.activeBuff.winRateBonus) or 0

    self.current_visual_match = MatchVisualTheater.new({
        playerTeamName = self.team_name or "宿命战队",
        enemyTeamName  = enemyName,
        playerName     = (self.player and self.player.name) or "Prodigy",
        playerPower    = my_pwr,
        enemyPower     = 82,
        tacticalBuff   = tactical_buff
    })

    if SoundManager then
        SoundManager.PlayBGM("MATCH_LANE")
    end
    self:log("📺 2D 比赛演播剧场已启动！对阵: " .. enemyName)
    return true, "进入 2D 比赛演播剧场", self.current_visual_match
end

function TapTapGame:_settleVisualMatchFinish()
    if not self.current_visual_match or self.current_visual_match.settled then return end
    self.current_visual_match.settled = true

    local rep = self.current_visual_match.mvpReport
    local isWin = rep and rep.isWin or false
    if isWin then
        self.player.money = self.player.money + 12000
        self.player.fame = self.player.fame + 15
        if SoundManager then
            SoundManager.PlayBGM("VICTORY")
            SoundManager.PlaySFX("VICTORY_FANFARE")
        end
    else
        self.player.money = self.player.money + 3000
        if SoundManager then
            SoundManager.PlaySFX("DEFEAT_TAPS")
        end
    end

    local fix = self.scheduled_fixture_in_progress or self:getCurrentScheduledFixture()
    if fix and not fix.played then
        fix.played = true
        fix.player_won = isWin
        fix.score = isWin and "2 - 1" or "1 - 2"
        self.league_standings = self.league_standings or self:getLeagueStandings()
        local my_team = nil
        local rival_team = nil
        local rival_id = fix.opponent_id or fix.rival
        for _, t in ipairs(self.league_standings) do
            if t.id == "DYNASTY" or (t.name and string.find(t.name, "你方")) then
                my_team = t
            end
            if rival_id and (t.id == rival_id or (t.name and string.find(t.name, rival_id))) then
                rival_team = t
            end
        end

        if my_team then
            if isWin then
                my_team.wins = (my_team.wins or my_team.w or 0) + 1
                my_team.points = (my_team.points or my_team.pts or 0) + 2
                my_team.streak = (type(my_team.streak) == "number" and my_team.streak >= 0) and (my_team.streak + 1) or 1
            else
                my_team.losses = (my_team.losses or my_team.l or 0) + 1
                my_team.streak = (type(my_team.streak) == "number" and my_team.streak <= 0) and (my_team.streak - 1) or -1
            end
            my_team.w = my_team.wins
            my_team.l = my_team.losses
            my_team.pts = my_team.points
        end

        if rival_team then
            if isWin then
                rival_team.losses = (rival_team.losses or rival_team.l or 0) + 1
                rival_team.streak = (type(rival_team.streak) == "number" and rival_team.streak <= 0) and (rival_team.streak - 1) or -1
            else
                rival_team.wins = (rival_team.wins or rival_team.w or 0) + 1
                rival_team.points = (rival_team.points or rival_team.pts or 0) + 2
                rival_team.streak = (type(rival_team.streak) == "number" and rival_team.streak >= 0) and (rival_team.streak + 1) or 1
            end
            rival_team.w = rival_team.wins
            rival_team.l = rival_team.losses
            rival_team.pts = rival_team.points
        end
        self.scheduled_fixture_in_progress = nil
    end

    self.last_match_report = {
        win = isWin,
        score = self.current_visual_match.score,
        baron = (self.current_visual_match.score.baron_blue > 0) and "SELF" or "ENEMY",
        dragons = { self = self.current_visual_match.score.dragons_blue, enemy = self.current_visual_match.score.dragons_red },
        rounds = {},
        highlights = {},
        commentary = rep and rep.casterQuote or "比赛圆满落幕！"
    }
end

function TapTapGame:actionTickVisualMatch(dt)
    if not self.current_visual_match then return false, "当前无进行中的视觉比赛" end
    self.current_visual_match:update(dt or 0.1)
    if self.current_visual_match.status == "FINISHED" then
        self:_settleVisualMatchFinish()
    end
    return true, "Visual match tick updated", self.current_visual_match
end

function TapTapGame:actionSetMatchSpeed(speed)
    if not self.current_visual_match then return false, "当前无进行中的视觉比赛" end
    self.current_visual_match:setSpeed(tonumber(speed) or 1)
    if SoundManager then SoundManager.PlaySFX("CLICK") end
    return true, "倍速已切换至: " .. tostring(speed) .. "x"
end

function TapTapGame:actionMakeTacticalDecision(choiceIdx)
    if not self.current_visual_match then return false, "当前无进行中的视觉比赛" end
    self.current_visual_match:resolveTacticalIntervention(tonumber(choiceIdx) or 1)
    if SoundManager then SoundManager.PlaySFX("BARON_ROAR") end
    return true, "战术决断已执行！"
end

function TapTapGame:actionSkipVisualMatch()
    if not self.current_visual_match then return false, "当前无进行中的视觉比赛" end
    self.current_visual_match:skipToEnd()
    self:_settleVisualMatchFinish()
    return true, "已直接跳至比赛结算！"
end

function TapTapGame:actionCloseVisualMatch()
    self.current_visual_match = nil
    if SoundManager then SoundManager.PlayBGM("LOBBY") end
    return true, "已退出比赛演播剧场，返回备战大厅"
end

-- ============================================================================
-- UNIFIED ACTION DISPATCHER (TapTap Make 统一动作调度总线)
-- ============================================================================
function TapTapGame:onAction(action, payload)
    payload = payload or {}
    local success = true
    local message = ""
    local data = nil

    if action == "START_VISUAL_MATCH" then
        success, message, data = self:actionStartVisualMatch(payload.enemy_team_id or payload.team_id)
    elseif action == "TICK_VISUAL_MATCH" then
        success, message, data = self:actionTickVisualMatch(payload.dt)
    elseif action == "SET_MATCH_SPEED" then
        success, message = self:actionSetMatchSpeed(payload.speed)
    elseif action == "MAKE_TACTICAL_DECISION" then
        success, message = self:actionMakeTacticalDecision(payload.choice_idx or payload.choice_id)
    elseif action == "SKIP_VISUAL_MATCH" then
        success, message = self:actionSkipVisualMatch()
    elseif action == "CLOSE_VISUAL_MATCH" then
        success, message = self:actionCloseVisualMatch()
    elseif action == "TRIGGER_CRISIS" then
        success, message, data = self:actionTriggerCrisis(payload.crisis_id or payload)
    elseif action == "RESOLVE_CRISIS" then
        success, message, data = self:actionResolveCrisis(payload)
    elseif action == "INDUCT_HOF" then
        success, message, data = self:actionInductHallOfFame(payload)
    elseif action == "EQUIP_HOF_AURA" then
        success, message, data = self:actionEquipHofAura(payload)
    elseif action == "EXPANSION_DRAFT" then
        success, message, data = self:actionExpansionDraft(payload)
    elseif action == "GENERATE_CAREER_CLIPPING" then
        success, message, data = self:actionGenerateCareerClipping(payload)
    elseif action == "SOLVE_BP_DRILL" then
        success, message, data = self:actionSolveBpDrill(payload)
    elseif action == "SET_SCOUT_RADAR_MODE" then
        success, message, data = self:actionSetScoutRadarMode(payload)
    elseif action == "CUSTOMIZE_JERSEY" then
        success, message, data = self:actionCustomizeJersey(payload)
    elseif action == "SOLO_QUEUE" then
        success, message = self:actionSoloQueue()
    elseif action == "STUDY_VOD" then
        success, message = self:actionStudyVOD()
    elseif action == "STREAM" then
        success, message = self:actionStream()
    elseif action == "REST" then
        success, message = self:actionRest()
    elseif action == "DRINK_COFFEE" then
        success, message = self:actionDrinkCoffee()
    elseif action == "QUICK_SHOP" then
        success, message = self:actionQuickShop(payload.item_id, payload.immediate_use)
    elseif action == "BUY_GEAR" then
        success, message = self:actionBuyGear(payload.gear_id)
    elseif action == "CLAIM_DAILY_LOGIN" then
        success, message = self:claimDailyLogin()
    elseif action == "EQUIP_SKIN" then
        success, message = self:equipSkin(payload.skin_id)
    elseif action == "UPGRADE_RECOVERY_ROOM" then
        success, message = self:upgradeRecoveryRoom(payload.category)
    elseif action == "HIRE_AGENT" then
        success, message = self:hireAgent(payload.agent_id)
    elseif action == "FIRE_AGENT" then
        success, message = self:fireAgent()
    elseif action == "SIGN_SPONSOR" then
        success, message = self:signSponsorship(payload.sponsor_id)
    elseif action == "PHYSIOTHERAPY" then
        success, message = self:actionPhysiotherapy(payload.treatment_id)
    elseif action == "CLAIM_STREAM_MILESTONE" then
        success, message = self:actionClaimStreamMilestone(payload.milestone_id)
    elseif action == "EQUIP_FAN_EMOTE" then
        success, message = self:actionEquipFanEmote(payload.emote_id)
    elseif action == "TOGGLE_RIVAL_SNIPE" then
        success, message = self:toggleRivalSnipeQueue()
    elseif action == "CLASH_RIVAL" then
        success, message = self:actionClashRival()
    elseif action == "ADVANCE_PROMO" then
        success, message = self:advancePromoSeries(payload.is_win)
    elseif action == "FORFEIT_PROMO" then
        success, message = self:forfeitPromoSeries()
    elseif action == "PLAY_STAGE_MATCH" or action == "STAGE_MATCH" then
        success, message, data = self:actionPlayStageMatch()
    elseif action == "RETIRE_AND_BUY_ORG" then
        success, message = self:actionRetireAndBuyOrg()
    elseif action == "WORLDS_FINALS" then
        success, message, data = self:actionWorldsFinals()
    elseif action == "UPGRADE_MERCH_TECH" then
        success, message = self:actionUpgradeMerchTech(payload.tech_id)
    elseif action == "OPEN_TRANSFER_WINDOW" then
        success, message = self:actionOpenTransferWindow(payload.split_name)
    elseif action == "BID_FREE_AGENT" then
        success, message = self:actionBidFreeAgent(payload.fa_id, payload.bid_amount)
    elseif action == "INSTANT_SIGN_FA" then
        success, message = self:actionInstantSignFreeAgent(payload.fa_id)
    elseif action == "TRADE_ROSTER_PLAYER" then
        success, message = self:actionTradeRosterPlayer(payload.my_role, payload.target_team, payload.target_player, payload.target_power, payload.cash)
    elseif action == "ADVANCE_TRANSFER_DAYS" then
        success, message = self:actionAdvanceTransferDays(payload.days)
    elseif action == "SCOUT_TEAM" or action == "SCOUT_T1" then
        local tid = (payload and payload.team_id) or "T1"
        success, message, data = self:actionScoutTeam(tid)
    elseif action == "SCRIM_TEAM" or action == "SCRIM_GEN" then
        local tid = (payload and payload.team_id) or "GEN"
        success, message, data = self:actionScrimTeam(tid)
    elseif action == "RUN_COMMUNITY_CAMPAIGN" then
        success, message, data = self:actionRunCommunityCampaign(payload.campaign_id)
    elseif action == "SEND_DANMAKU" then
        success, message, data = self:actionSendDanmaku(payload.text, payload.sender)
    elseif action == "PRESTIGE_REBIRTH" then
        success, message = self:prestigeRebirth(payload.chosenEndingId)
    elseif action == "UNLOCK_LEGACY_PASSIVE" then
        success, message = self:unlockLegacyPassive(payload.passiveId)
    elseif action == "TOGGLE_RUN_MODIFIER" then
        success, message = self:toggleRunModifier(payload.modId)
    elseif action == "BATTLE_WORLD_TOUR" then
        success, message, data = self:battleWorldTour()
    elseif action == "UPGRADE_FACILITY" then
        success, message = self:actionUpgradeFacility(payload.facility_id)
    elseif action == "SCOUT_ACADEMY_TRAINEE" then
        success, message, data = self:actionScoutAcademyTrainee()
    elseif action == "PROMOTE_TRAINEE" then
        success, message = self:actionPromoteTrainee(payload.trainee_id)
    elseif action == "COACH_PROPOSAL" then
        success, message, data = self:actionCoachProposal(payload.proposal_id)
    elseif action == "COACH_BUY_EQUITY" then
        success, message = self:actionCoachBuyEquity(payload.shares_pct)
    elseif action == "SIGN_STAFF" then
        success, message = self:actionSignStaff(payload.staff_type, payload.candidate_id)
    elseif action == "EQUIP_RING" then
        success, message = self:actionEquipRing(payload.ring_id or payload)
    elseif action == "START_BOOTCAMP" then
        success, message = self:actionStartBootcamp(payload.location_id or payload)
    elseif action == "SET_TACTICAL_PRESET" then
        success, message = self:actionSetTacticalPreset(payload.preset_id or payload)
    elseif action == "BUDGET_AUDIT" then
        success, message, data = self:actionBudgetAudit()
    elseif action == "VOD_REVIEW" then
        success, message, data = self:actionVodReview(payload.vod_id or payload)
    elseif action == "CCTV_COMMAND" then
        success, message, data = self:actionCctvCommand(payload.action_name or payload)
    elseif action == "SCOUT_GACHA_PULL" then
        success, message, data = self:actionScoutGachaPull(payload.times or payload)
    elseif action == "BARON_CLUTCH" then
        success, message, data = self:actionBaronClutch(payload.choice_id or payload)
    elseif action == "UPGRADE_SYNERGY" then
        success, message, data = self:actionUpgradeSynergy(payload.pair_code or payload)
    elseif action == "PLAY_SCHEDULED_MATCH" then
        success, message, data = self:actionPlayScheduledMatch()
    elseif action == "PRE_MATCH_STRATEGY" then
        success, message = self:actionPreMatchStrategy()
    elseif action == "SWAP_ROSTER" then
        success, message = self:actionSwapRoster(payload.role, payload.candidate_id)
    elseif action == "TRAIN_ROSTER_PLAYER" then
        success, message = self:actionTrainRosterPlayer(payload.role)
    elseif action == "TUNE_GEAR" then
        success, message = self:actionTuneGear(payload.gear_id)
    elseif action == "UNEQUIP_GEAR" then
        success, message = self:actionUnequipGear(payload.gear_id)
    elseif action == "AGENT_PITCH_DEAL" then
        success, message = self:actionAgentPitchDeal()
    elseif action == "SPONSOR_ADVANCE" then
        success, message = self:actionSponsorAdvance(payload.sponsor_id)
    elseif action == "EQUIP_EMOTE_BADGE" then
        success, message = self:actionEquipEmoteBadge(payload.emote_id)
    elseif action == "POLISH_RING" then
        success, message = self:actionPolishRing(payload.ring_id)
    elseif action == "UNEQUIP_RING" then
        success, message = self:actionUnequipRing(payload.ring_id)
    elseif action == "REFUND_TALENT" then
        success, message = self:actionRefundTalent(payload.talent_id)
    elseif action == "TRIGGER_SOLO_DILEMMA" then
        success, message, data = self:actionTriggerSoloDilemma()
    elseif action == "RESOLVE_DILEMMA" then
        success, message, data = self:actionResolveDilemma(payload.choice_index or payload.choice_id or payload)
    elseif action == "SELL_TRAINEE" then
        success, message, data = self:actionSellTrainee(payload.trainee_id or payload.id)
    elseif action == "CHOOSE_BP_TACTIC" then
        success, message, data = self:actionChooseBpTactic(payload.tactic_id or payload.tactic, payload.rival_name or payload.rival)
    elseif action == "SET_DYNASTY_SUBTAB" then
        self.dynasty_subtab = payload.subtab or payload
        success = true
        message = "Dynasty subtab switched to " .. tostring(self.dynasty_subtab)
    elseif action == "SWITCH_TAB" then
        self:switchTab(payload.tab_id or payload)
        success = true
        message = "Switched tab to " .. tostring(self.active_tab)
    elseif action == "GET_VIEW_STATE" then
        return self:getViewState()
    elseif action == "SAVE_GAME" then
        data = self:saveGame()
        success = true
        message = "Game saved successfully"
    elseif action == "LOAD_GAME" then
        success, message = self:loadGame(payload.save_data)
    else
        success = false
        message = "Unknown action: " .. tostring(action)
    end

    return {
        success = success,
        message = tostring(message or ""),
        data = data,
        state = self:getViewState()
    }
end

-- ============================================================================
-- LOVE2D / TAPTAP MAKE 2D PORTRAIT VIEWPORT RENDERER (390 x 844)
-- ============================================================================
local RANK_COLORS = {
    ["Iron"]        = {0.55, 0.55, 0.60},
    ["Bronze"]      = {0.80, 0.50, 0.30},
    ["Silver"]      = {0.75, 0.80, 0.85},
    ["Gold"]        = {0.96, 0.75, 0.15},
    ["Emerald"]     = {0.15, 0.85, 0.55},
    ["Platinum"]    = {0.15, 0.75, 0.95},
    ["Diamond"]     = {0.35, 0.60, 1.00},
    ["Master"]      = {0.75, 0.35, 0.95},
    ["Grandmaster"] = {0.95, 0.25, 0.40},
    ["Challenger"]  = {1.00, 0.85, 0.20}
}

local function drawBox(x, y, w, h, bg, border, rx)
    rx = rx or 8
    love.graphics.setColor(bg[1], bg[2], bg[3], bg[4] or 0.95)
    love.graphics.rectangle("fill", x, y, w, h, rx, rx)
    if border then
        love.graphics.setColor(border[1], border[2], border[3], border[4] or 0.5)
        love.graphics.rectangle("line", x, y, w, h, rx, rx)
    end
end

local function drawBar(x, y, w, h, pct, fill_color, bg_color)
    bg_color = bg_color or {0.12, 0.16, 0.24, 0.9}
    love.graphics.setColor(bg_color[1], bg_color[2], bg_color[3], bg_color[4] or 1.0)
    love.graphics.rectangle("fill", x, y, w, h, 4, 4)
    pct = math.max(0, math.min(1, pct or 0))
    if pct > 0 then
        love.graphics.setColor(fill_color[1], fill_color[2], fill_color[3], fill_color[4] or 1.0)
        love.graphics.rectangle("fill", x, y, w * pct, h, 4, 4)
    end
end

local function registerButton(self, id, payload, x, y, w, h, title, color, text_color)
    table.insert(self.touch_buttons, {
        id = id,
        payload = payload,
        x1 = x,
        y1 = y,
        x2 = x + w,
        y2 = y + h
    })
    color = color or {0.15, 0.45, 0.85}
    text_color = text_color or {1.0, 1.0, 1.0}
    drawBox(x, y, w, h, {color[1], color[2], color[3], 0.9}, {color[1]*1.2, color[2]*1.2, color[3]*1.2, 0.6}, 8)
    love.graphics.setColor(text_color[1], text_color[2], text_color[3], 1.0)
    love.graphics.print(title, x + 10, y + (h - 14) / 2)
end

function TapTapGame:renderLove2D(w, h)
    if not love or not love.graphics then return end
    w = w or 390
    h = h or 844

    -- Clear hitboxes for the new frame
    self.touch_buttons = {}
    self.bottom_tabs = {}

    -- Background Canvas (Dark Cyber Navy)
    love.graphics.setColor(0.03, 0.04, 0.08, 1.0)
    love.graphics.rectangle("fill", 0, 0, w, h)

    -- ========================================================================
    -- 1. TOP MOBILE STATUS BAR (L-Shape Top Hub)
    -- ========================================================================
    local bar_h = 82
    drawBox(10, 10, w - 20, bar_h, {0.07, 0.10, 0.16, 0.95}, {0.12, 0.25, 0.45, 0.5}, 10)

    -- Rank Pill
    local r_col = RANK_COLORS[self.player.rank] or {0.9, 0.8, 0.2}
    drawBox(18, 16, 130, 24, {r_col[1]*0.15, r_col[2]*0.15, r_col[3]*0.15, 0.9}, r_col, 6)
    love.graphics.setColor(1.0, 1.0, 1.0, 1.0)
    love.graphics.print(string.format("🏆 %s %dLP", self.player.rank, self.player.lp), 24, 21)

    -- Money Pill
    drawBox(156, 16, 108, 24, {0.05, 0.25, 0.15, 0.9}, {0.2, 0.8, 0.4, 0.6}, 6)
    love.graphics.setColor(0.3, 0.95, 0.5, 1.0)
    love.graphics.print(string.format("💰 $%d", self.player.money), 164, 21)

    -- Fame Pill
    local fame_w = w - 20 - 276
    drawBox(272, 16, fame_w, 24, {0.25, 0.18, 0.05, 0.9}, {0.9, 0.7, 0.2, 0.6}, 6)
    love.graphics.setColor(1.0, 0.85, 0.3, 1.0)
    love.graphics.print(string.format("🌟 %d", self.player.fame), 278, 21)

    -- Dual Progress Bars (Energy & Mental)
    local pb_w = (w - 48) / 2
    love.graphics.setColor(0.3, 0.8, 1.0, 1.0)
    love.graphics.print(string.format("⚡ 体能 %d%%", self.player.energy), 20, 46)
    drawBar(20, 62, pb_w, 6, self.player.energy / 100, {0.15, 0.8, 0.95})

    local m_x = 28 + pb_w
    love.graphics.setColor(0.75, 0.5, 1.0, 1.0)
    love.graphics.print(string.format("🧠 心态 %d%%", self.player.mental), m_x, 46)
    drawBar(m_x, 62, pb_w, 6, self.player.mental / 100, {0.7, 0.4, 0.95})

    -- Sub-label
    local phaseNames = {
        [1] = "阶段 1 · 业余排位冲刺",
        [2] = "阶段 2 · 职业联赛与BP",
        [3] = "阶段 3 · 传奇电竞俱乐部王朝"
    }
    love.graphics.setColor(0.85, 0.75, 0.3, 0.9)
    love.graphics.print(string.format("%s  |  ☕ 专注: %d%%", phaseNames[self.phase] or "", self.player.focus or 90), 20, 72)

    -- ========================================================================
    -- 2. BOTTOM NAVIGATION BAR (Mobile Bottom Nav)
    -- ========================================================================
    local nav_y = h - 64
    local tab_w = w / 5
    local tabs = {
        { id = "CAREER",  icon = "⚔️", label = "天梯" },
        { id = "STAGE",   icon = "🏟️", label = "赛场" },
        { id = "DYNASTY", icon = "👑", label = "王朝" },
        { id = "TOUR",    icon = "🌍", label = "巡礼" },
        { id = "LOGS",    icon = "📜", label = "战报" },
    }
    drawBox(0, nav_y, w, 64, {0.04, 0.06, 0.10, 0.98}, {0.15, 0.25, 0.35, 0.4}, 0)
    for i, t in ipairs(tabs) do
        local tx = (i - 1) * tab_w
        table.insert(self.bottom_tabs, { id = t.id, x1 = tx, y1 = nav_y, x2 = tx + tab_w, y2 = h })
        local is_active = (self.active_tab == t.id)
        if is_active then
            drawBox(tx + 4, nav_y + 6, tab_w - 8, 52, {0.08, 0.35, 0.55, 0.85}, {0.2, 0.8, 1.0, 0.9}, 8)
            love.graphics.setColor(1.0, 1.0, 1.0, 1.0)
        else
            love.graphics.setColor(0.6, 0.65, 0.75, 0.8)
        end
        love.graphics.print(t.icon, tx + (tab_w - 18) / 2, nav_y + 10)
        love.graphics.print(t.label, tx + (tab_w - 26) / 2, nav_y + 32)
    end

    -- ========================================================================
    -- 3. ACTIVE SCREEN CONTENT (Tabs 1 - 5)
    -- ========================================================================
    local cur_tab = self.active_tab or "CAREER"

    if cur_tab == "CAREER" then
        -- --------------------------------------------------------------------
        -- TAB 1: CAREER & SOLO QUEUE
        -- --------------------------------------------------------------------
        love.graphics.setColor(0.3, 0.8, 1.0, 1.0)
        love.graphics.print("⚡ 召唤师高分排位中枢 (Solo Queue Hub)", 14, 98)

        local promo = self.player.promo_series
        if promo and promo.active then
            -- Promo Series Card
            drawBox(10, 118, w - 20, 96, {0.25, 0.15, 0.05, 0.95}, {0.95, 0.65, 0.15, 0.9}, 10)
            love.graphics.setColor(1.0, 0.85, 0.2, 1.0)
            love.graphics.print(string.format("⚔️ 【%s 生死晋级赛】打响！赛制: %s", promo.target_tier, promo.format), 20, 126)
            love.graphics.setColor(0.9, 0.9, 0.9, 1.0)
            love.graphics.print(string.format("当前比分: %d 胜 / %d 负 (需胜 %d 局斩获晋级)", promo.wins, promo.losses, promo.required_wins), 20, 146)
            registerButton(self, "ADVANCE_PROMO", { is_win = true }, 20, 168, 160, 36, "⚔️ 决战下局 (Advance)", {0.15, 0.6, 0.3})
            registerButton(self, "FORFEIT_PROMO", nil, 190, 168, w - 210, 36, "🏳️ 弃权 (Forfeit)", {0.6, 0.2, 0.2})
        else
            -- Standard Rank Card
            drawBox(10, 118, w - 20, 96, {0.06, 0.09, 0.16, 0.95}, {0.15, 0.3, 0.5, 0.4}, 10)
            local wr = (self.player.games_played > 0) and ((self.player.wins / self.player.games_played) * 100) or 50
            love.graphics.setColor(1.0, 1.0, 1.0, 1.0)
            love.graphics.print(string.format("段位: %s (%d LP) | 胜率: %.1f%% (%d胜/%d场)", self.player.rank, self.player.lp, wr, self.player.wins, self.player.games_played), 20, 126)
            local conf = TapTapGame.PROMO_CONFIG[self.player.rank]
            local next_lp = conf and conf.lp or 1000
            love.graphics.setColor(0.7, 0.8, 0.9, 0.9)
            love.graphics.print(string.format("距离晋级目标还需 %d LP", math.max(0, next_lp - self.player.lp)), 20, 146)
            drawBar(20, 164, w - 40, 6, self.player.lp / next_lp, {0.15, 0.85, 0.45})
            love.graphics.setColor(0.85, 0.9, 1.0, 0.9)
            local wrist = (self.player.career_health and self.player.career_health.wrist_strain) or 0
            love.graphics.print(string.format("🎯 微操: %d  |  🧠 心态: %d  |  🩺 手腕负荷: %d%%", self.player.mechanics, self.player.mental, wrist), 20, 180)
        end

        -- 2x4 Action Grid Buttons
        local btn_w = (w - 28) / 2
        local btn_h = 36
        local g_y = 222
        registerButton(self, "SOLO_QUEUE", nil, 10, g_y, btn_w, btn_h, "⚔️ 单排排位", {0.15, 0.45, 0.85})
        registerButton(self, "STUDY_VOD",  nil, 18 + btn_w, g_y, btn_w, btn_h, "📹 复盘录像", {0.15, 0.55, 0.45})
        registerButton(self, "STREAM",     nil, 10, g_y + 42, btn_w, btn_h, "🔴 高分直播", {0.75, 0.25, 0.2})
        registerButton(self, "REST",       nil, 18 + btn_w, g_y + 42, btn_w, btn_h, "🛌 战队休整", {0.45, 0.25, 0.65})
        registerButton(self, "DRINK_COFFEE", nil, 10, g_y + 84, btn_w, btn_h, "☕ 战备咖啡", {0.7, 0.45, 0.15})
        registerButton(self, "PHYSIOTHERAPY", {treatment_id="ice_stretch"}, 18 + btn_w, g_y + 84, btn_w, btn_h, "🩺 康复理疗", {0.2, 0.6, 0.5})
        registerButton(self, "CLAIM_DAILY_LOGIN", nil, 10, g_y + 126, btn_w, btn_h, "🎁 每日签到", {0.85, 0.6, 0.1})
        registerButton(self, "CLASH_RIVAL", nil, 18 + btn_w, g_y + 126, btn_w, btn_h, "⚔️ 宿命死斗", {0.8, 0.2, 0.35})

        -- Pro Transition Gate Card
        local p_y = 394
        if self.player.lp >= 1000 or self.phase >= 2 then
            registerButton(self, "SWITCH_TAB", "STAGE", 10, p_y, w - 20, 38, "🌟 斩获千分王者！点击进入【职业赛场】(Phase 2)", {0.85, 0.65, 0.1})
        else
            drawBox(10, p_y, w - 20, 38, {0.05, 0.08, 0.12, 0.9}, {0.15, 0.25, 0.35, 0.4}, 8)
            love.graphics.setColor(0.65, 0.7, 0.8, 0.9)
            love.graphics.print(string.format("🔒 职业试训通道: 达成 1,000 LP (当前: %d/1000 LP)", self.player.lp), 20, p_y + 12)
        end

        -- Mini Log Area
        local log_y = 440
        local log_h = nav_y - log_y - 8
        drawBox(10, log_y, w - 20, log_h, {0.02, 0.03, 0.05, 0.95}, {0.1, 0.15, 0.25, 0.4}, 8)
        love.graphics.setColor(0.3, 0.8, 0.6, 1.0)
        love.graphics.print("💻 [天梯战报动态]", 18, log_y + 8)
        love.graphics.setColor(0.75, 0.8, 0.85, 0.9)
        local max_d = math.min(8, #self.recent_logs)
        for idx = 1, max_d do
            local line = self.recent_logs[idx]
            if line then
                love.graphics.print(line, 18, log_y + 12 + idx * 22)
            end
        end

    elseif cur_tab == "STAGE" then
        -- --------------------------------------------------------------------
        -- TAB 2: STAGE & PRO LEAGUE
        -- --------------------------------------------------------------------
        love.graphics.setColor(0.3, 0.8, 1.0, 1.0)
        love.graphics.print("🏟️ 职业联赛与 5v5 BP 赛场 (Pro League Stage)", 14, 98)

        if self.phase < 2 then
            drawBox(10, 120, w - 20, 190, {0.06, 0.08, 0.14, 0.95}, {0.25, 0.35, 0.5, 0.4}, 12)
            love.graphics.setColor(1.0, 0.85, 0.2, 1.0)
            love.graphics.print("🔒 职业赛场大厅尚未解锁", 24, 140)
            love.graphics.setColor(0.8, 0.85, 0.9, 0.9)
            love.graphics.print("入场资格: 在单排路人王阶段达成 1,000 LP (王者段位)！", 24, 170)
            love.graphics.print(string.format("当前进度: %d / 1000 LP", self.player.lp), 24, 200)
            drawBar(24, 222, w - 48, 8, self.player.lp / 1000, {0.2, 0.8, 0.5})
            registerButton(self, "DEV_UNLOCK_PHASE2", nil, 24, 248, w - 48, 40, "🌟 快捷签约加入职业战队 (进入 Phase 2)", {0.85, 0.55, 0.15})
        else
            -- Team Roster Card
            drawBox(10, 120, w - 20, 96, {0.06, 0.09, 0.16, 0.95}, {0.2, 0.4, 0.6, 0.5}, 10)
            love.graphics.setColor(1.0, 1.0, 1.0, 1.0)
            love.graphics.print("⭐ 战队首发阵容与战力评估", 20, 130)
            love.graphics.setColor(0.8, 0.85, 0.95, 0.9)
            love.graphics.print("上单: 70  打野: 74  中单(你): 80  射手: 72  辅助: 68", 20, 154)
            love.graphics.print("战队综合战力: 72.8 | 联赛积分榜排名: 第 1 名 (12-2)", 20, 176)
            local cup_txt = (self.trophies.regional_champ and "🏆 银龙杯已捧起" or "银龙杯争夺中") .. " | " .. (self.trophies.worlds_cup and "🌍 召唤师杯已斩获" or "世界赛备战中")
            love.graphics.setColor(0.95, 0.8, 0.2, 1.0)
            love.graphics.print(cup_txt, 20, 196)

            -- Stage Action Buttons
            registerButton(self, "PLAY_STAGE_MATCH", nil, 10, 228, w - 20, 44, "🏟️ 出征职业联赛常规赛 (Play Stage Match)", {0.85, 0.45, 0.15})
            registerButton(self, "SCOUT_TEAM", {team_id="T1"}, 10, 280, w - 20, 44, "🔍 战术刺探豪门弱点体系 (Scout T1)", {0.2, 0.55, 0.75})
            registerButton(self, "SCRIM_TEAM", {team_id="GEN"}, 10, 332, w - 20, 44, "🥊 约战 GEN 顶级战术训练赛 (Scrim GEN)", {0.5, 0.3, 0.7})
            registerButton(self, "WORLDS_FINALS", nil, 10, 384, w - 20, 44, "🏆 决战召唤师世界总决赛 (Worlds Finals)", {0.9, 0.75, 0.15})
            registerButton(self, "RETIRE_AND_BUY_ORG", nil, 10, 436, w - 20, 44, "👑 退役挂靴斥资收购战队 (Retire & Buy Org -> Phase 3)", {0.7, 0.2, 0.5})
        end

    elseif cur_tab == "DYNASTY" then
        -- --------------------------------------------------------------------
        -- TAB 3: DYNASTY TYCOON
        -- --------------------------------------------------------------------
        love.graphics.setColor(0.3, 0.8, 1.0, 1.0)
        love.graphics.print("👑 传奇俱乐部王朝与商业运营 (Dynasty Hub)", 14, 98)

        if self.phase < 3 then
            drawBox(10, 120, w - 20, 190, {0.06, 0.08, 0.14, 0.95}, {0.35, 0.25, 0.5, 0.4}, 12)
            love.graphics.setColor(1.0, 0.85, 0.2, 1.0)
            love.graphics.print("🔒 俱乐部王朝模式尚未解锁", 24, 140)
            love.graphics.setColor(0.8, 0.85, 0.9, 0.9)
            love.graphics.print("开启要求: 退役并注资 $1,000,000 收购电竞俱乐部！", 24, 170)
            love.graphics.print(string.format("当前个人储蓄: $%d / $1,000,000", self.player.money), 24, 200)
            drawBar(24, 222, w - 48, 8, self.player.money / 1000000, {0.85, 0.65, 0.15})
            registerButton(self, "DEV_UNLOCK_PHASE3", nil, 24, 248, w - 48, 40, "👑 快捷注资收购俱乐部 (进入 Phase 3)", {0.6, 0.25, 0.75})
        else
            -- Dynasty Subtab Navigation Bar (4 Subtabs)
            local subtabs = {
                { id = "OVERVIEW",   label = "📊 总盘" },
                { id = "FACILITIES", label = "🏢 基地" },
                { id = "ACADEMY",    label = "🎓 青训" },
                { id = "COACH",      label = "💼 股权" },
            }
            local cur_sub = self.dynasty_subtab or "OVERVIEW"
            local sub_w = (w - 20) / 4
            for i, st in ipairs(subtabs) do
                local sx = 10 + (i - 1) * sub_w
                local is_active = (cur_sub == st.id)
                local col = is_active and {0.9, 0.7, 0.15} or {0.12, 0.18, 0.28}
                local txt_col = is_active and {0.1, 0.1, 0.1} or {0.75, 0.8, 0.9}
                registerButton(self, "SET_DYNASTY_SUBTAB", st.id, sx + 2, 118, sub_w - 4, 30, st.label, col, txt_col)
            end

            if cur_sub == "OVERVIEW" then
                -- Dynasty Financial Overview
                drawBox(10, 156, w - 20, 84, {0.06, 0.09, 0.16, 0.95}, {0.3, 0.5, 0.3, 0.5}, 10)
                local budget = (self.dynasty_engine and self.dynasty_engine.budget) or 250000
                love.graphics.setColor(0.3, 0.95, 0.5, 1.0)
                love.graphics.print(string.format("💰 俱乐部运营金库: $%d", budget), 20, 168)
                love.graphics.setColor(1.0, 0.85, 0.3, 1.0)
                love.graphics.print("🌟 全球粉丝规模: 12.5 万人 | 赞助商收益乘数: 1.08x", 20, 190)
                love.graphics.setColor(0.8, 0.85, 0.9, 0.9)
                love.graphics.print("战队商业估值: $12,500,000 | 赛季联赛胜场: 18", 20, 210)

                -- Dynasty Action Grid
                registerButton(self, "UPGRADE_MERCH_TECH", {tech_id="fabric_tech"}, 10, 248, w - 20, 38, "🧪 战袍工坊: 升级面料材质科技 (Merch Lab)", {0.7, 0.35, 0.6})
                registerButton(self, "OPEN_TRANSFER_WINDOW", {split_name="Spring"}, 10, 292, w - 20, 38, "🔄 开启休赛期转会窗口 (Transfer Window)", {0.2, 0.55, 0.85})
                registerButton(self, "BID_FREE_AGENT", {fa_id="fa_mid_faker", bid_amount=80000}, 10, 336, w - 20, 38, "💰 竞标顶级自由人明星选手 (Bid Free Agent)", {0.85, 0.5, 0.15})
                registerButton(self, "RUN_COMMUNITY_CAMPAIGN", {campaign_id="viral_clips"}, 10, 380, w - 20, 38, "📢 粉丝社区: 官博高光整活宣发 (Run PR)", {0.25, 0.65, 0.45})
                registerButton(self, "SIGN_STAFF", {staff_type="analyst"}, 10, 424, w - 20, 38, "🤝 聘任首席战术分析师 Kramer ($10,000)", {0.3, 0.5, 0.7})
                registerButton(self, "WORLDS_FINALS", nil, 10, 468, w - 20, 38, "🏆 率队出征召唤师全球总决赛 (Worlds Finals)", {0.9, 0.75, 0.15})

            elseif cur_sub == "FACILITIES" then
                -- Facilities Matrix Overview
                drawBox(10, 156, w - 20, 44, {0.06, 0.09, 0.16, 0.95}, {0.35, 0.45, 0.65, 0.5}, 10)
                love.graphics.setColor(0.3, 0.8, 1.0, 1.0)
                love.graphics.print("🏢 基地设施矩阵与硬件升级 (Facilities Matrix)", 20, 168)
                love.graphics.setColor(0.75, 0.85, 0.95, 0.85)
                love.graphics.print("升级基地硬件全面提升队员训练增益、医疗康复与赞助估值", 20, 184)

                local facs = {
                    { id = "training",     name = "训练基地", desc = "训练经验 +15%/级", cost = 25000 },
                    { id = "medical",      name = "康复医疗室", desc = "伤病恢复 +20%/级", cost = 20000 },
                    { id = "analysis",     name = "战术分析中心", desc = "情报准确度 +12%/级", cost = 30000 },
                    { id = "business",     name = "商务发展司", desc = "赞助商回报 +10%/级", cost = 35000 },
                    { id = "gaming_house", name = "电竞总部大厦", desc = "俱乐部估值 +$200W", cost = 50000 },
                }
                local fy = 208
                for _, f in ipairs(facs) do
                    local cur_lvl = (self.facilities and self.facilities[f.id]) or 1
                    local btn_title = string.format("升级%s (Lv %d -> %d) · $%d", f.name, cur_lvl, math.min(3, cur_lvl + 1), f.cost * cur_lvl)
                    local btn_col = {0.18, 0.45, 0.75}
                    if cur_lvl >= 3 then
                        btn_title = string.format("✨ %s (Lv 3 满级巅峰)", f.name)
                        btn_col = {0.2, 0.5, 0.3}
                    end
                    registerButton(self, "UPGRADE_FACILITY", {facility_id = f.id}, 10, fy, w - 20, 44, btn_title, btn_col)
                    love.graphics.setColor(0.85, 0.85, 0.9, 0.8)
                    love.graphics.print(f.desc, 22, fy + 26)
                    fy = fy + 50
                end

            elseif cur_sub == "ACADEMY" then
                -- Academy Overview Card
                drawBox(10, 156, w - 20, 60, {0.06, 0.09, 0.16, 0.95}, {0.85, 0.55, 0.2, 0.5}, 10)
                love.graphics.setColor(1.0, 0.85, 0.2, 1.0)
                love.graphics.print("🎓 青训梯队与新星孵化 (Youth Academy)", 20, 168)
                love.graphics.setColor(0.85, 0.9, 0.95, 0.9)
                local trainee_cnt = (self.academy and self.academy.trainees and #self.academy.trainees) or 0
                love.graphics.print(string.format("在训青训选手: %d / 5 位  |  青训星探搜寻资金: $15,000", trainee_cnt), 20, 190)

                -- Scout Button
                registerButton(self, "SCOUT_ACADEMY_TRAINEE", nil, 10, 224, w - 20, 38, "🔍 派遣星探下基层发掘高校新星 ($15,000)", {0.85, 0.5, 0.15})

                -- Trainee Cards
                local ty = 270
                if trainee_cnt == 0 then
                    drawBox(10, ty, w - 20, 60, {0.04, 0.06, 0.10, 0.9}, {0.2, 0.3, 0.4, 0.4}, 8)
                    love.graphics.setColor(0.65, 0.7, 0.8, 0.9)
                    love.graphics.print("青训梯队暂无在训新人，点击上方按钮派遣星探发掘！", 20, ty + 24)
                else
                    for i = 1, math.min(4, trainee_cnt) do
                        local t = self.academy.trainees[i]
                        drawBox(10, ty, w - 20, 56, {0.05, 0.08, 0.14, 0.95}, {0.25, 0.45, 0.65, 0.5}, 8)
                        local t_tier = t.tier or t.grade or "B"
                        local tier_col = (t_tier == "S") and {1.0, 0.8, 0.2} or ((t_tier == "A") and {0.8, 0.4, 1.0} or {0.3, 0.8, 1.0})
                        love.graphics.setColor(tier_col[1], tier_col[2], tier_col[3], 1.0)
                        love.graphics.print(string.format("⭐ [%s级] %s (%s)", t_tier, t.name, t.role), 20, ty + 10)
                        love.graphics.setColor(0.8, 0.85, 0.9, 0.9)
                        local t_mech = t.mechanics or t.power or 70
                        local t_pot = t.potential or (t.power and t.power + 5) or 80
                        love.graphics.print(string.format("微操基础: %d | 潜力上限: %d", t_mech, t_pot), 20, ty + 32)
                        registerButton(self, "PROMOTE_TRAINEE", {trainee_id = t.id}, w - 110, ty + 10, 96, 36, "⭐ 提拔首发", {0.2, 0.65, 0.4})
                        ty = ty + 62
                    end
                end

            elseif cur_sub == "COACH" then
                -- Board and Equity Overview Card
                drawBox(10, 156, w - 20, 96, {0.06, 0.09, 0.16, 0.95}, {0.3, 0.5, 0.7, 0.5}, 10)
                love.graphics.setColor(0.3, 0.85, 1.0, 1.0)
                love.graphics.print("💼 教练执委会与董事会股权 (Board & Equity)", 20, 168)
                local trust = (self.coach and self.coach.trust) or 75
                local eq = (self.coach and self.coach.equity) or 15
                love.graphics.setColor(0.85, 0.9, 0.95, 0.9)
                love.graphics.print(string.format("董事会信任度: %d%%", trust), 20, 190)
                drawBar(140, 192, w - 170, 8, trust / 100, {0.2, 0.8, 0.5})

                local eq_role = (eq >= 100 and "👑 独资财阀") or ((eq >= 51 and "👑 绝对控股大股东") or "少数合伙人")
                love.graphics.setColor(1.0, 0.85, 0.2, 1.0)
                love.graphics.print(string.format("个人持股比例: %d%% (%s)", eq, eq_role), 20, 214)
                drawBar(140, 216, w - 170, 8, eq / 100, {0.9, 0.7, 0.2})

                -- Action buttons
                registerButton(self, "COACH_PROPOSAL", {proposal_id="request_funds"}, 10, 260, w - 20, 40, "📋 向董事会申请 $100,000 战术引援预算 (Proposal)", {0.2, 0.5, 0.8})
                registerButton(self, "COACH_BUY_EQUITY", {shares_pct=5}, 10, 308, w - 20, 40, "💼 个人出资回购 5% 股权 (目标: 51% 绝对控股)", {0.85, 0.6, 0.15})
                registerButton(self, "SIGN_STAFF", {staff_type="head_coach"}, 10, 356, w - 20, 40, "🤝 聘任金牌冠军教头 Homme ($15,000 · BP克制+10%)", {0.3, 0.65, 0.45})
                registerButton(self, "SIGN_STAFF", {staff_type="physio"}, 10, 404, w - 20, 40, "🩺 聘任运动医学博士 Dr. Kang ($8,000 · 伤病率减半)", {0.6, 0.3, 0.7})
            end
        end

    elseif cur_tab == "TOUR" then
        -- --------------------------------------------------------------------
        -- TAB 4: WORLD TOUR & POWER RANKINGS
        -- --------------------------------------------------------------------
        love.graphics.setColor(0.3, 0.8, 1.0, 1.0)
        love.graphics.print("🌍 无尽世界巡回赛与全球战力榜 (World Tour)", 14, 98)

        -- World Tour Arena Card
        drawBox(10, 120, w - 20, 92, {0.08, 0.10, 0.16, 0.95}, {0.7, 0.45, 0.15, 0.6}, 10)
        local floor = (self.world_tour_engine and self.world_tour_engine.currentFloor) or 1
        love.graphics.setColor(1.0, 0.8, 0.2, 1.0)
        love.graphics.print(string.format("🌍【世界巡回赛】当前挑战关卡: 第 %d 层", floor), 20, 132)
        love.graphics.setColor(0.9, 0.9, 0.9, 1.0)
        love.graphics.print("守关战队: [LPL] 巨浪 Dynasty | 敌方战力: 75", 20, 154)
        love.graphics.print("通关战利品: 名宿声望点数 +10, 专属战袍碎片", 20, 176)

        registerButton(self, "BATTLE_WORLD_TOUR", nil, 10, 222, w - 20, 42, "⚔️ 挑战巡回赛当前层 (Battle World Tour)", {0.9, 0.55, 0.15})

        -- Global Power Rankings Card
        drawBox(10, 274, w - 20, 160, {0.05, 0.08, 0.14, 0.95}, {0.2, 0.35, 0.55, 0.4}, 10)
        love.graphics.setColor(0.3, 0.8, 1.0, 1.0)
        love.graphics.print("📊 2026 全球顶级俱乐部战力榜 (Global Power Rankings)", 20, 286)
        love.graphics.setColor(0.85, 0.9, 0.95, 0.9)
        love.graphics.print("1. 🥇 GEN (Gen.G Esports)     - 战力 97.8 (LCK)", 20, 312)
        love.graphics.print("2. 🥈 BLG (Bilibili Gaming)    - 战力 96.5 (LPL)", 20, 336)
        love.graphics.print("3. 🥉 T1 (SK Telecom)         - 战力 95.2 (LCK)", 20, 360)
        love.graphics.print("4.    TES (Top Esports)        - 战力 94.0 (LPL)", 20, 384)
        love.graphics.print("5.    HLE (Hanwha Life)        - 战力 93.1 (LCK)", 20, 408)

        registerButton(self, "PRESTIGE_REBIRTH", {chosenEndingId="dynasty_king"}, 10, 444, w - 20, 38, "✨ 开启名宿轮回重生成就 (Prestige Rebirth)", {0.6, 0.25, 0.75})

    elseif cur_tab == "LOGS" then
        -- --------------------------------------------------------------------
        -- TAB 5: LOGS & DANMAKU TERMINAL
        -- --------------------------------------------------------------------
        love.graphics.setColor(0.3, 0.8, 1.0, 1.0)
        love.graphics.print("📜 实时战报解说与粉丝弹幕终端 (Live Console)", 14, 98)

        registerButton(self, "SEND_DANMAKU", {text="加油世界第一中单！", sender="Fan_9527"}, 10, 120, w - 20, 36, "💬 发送专属助威弹幕 (Send Danmaku)", {0.2, 0.6, 0.4})

        local term_y = 164
        local term_h = nav_y - term_y - 8
        drawBox(10, term_y, w - 20, term_h, {0.02, 0.03, 0.05, 0.98}, {0.12, 0.2, 0.35, 0.5}, 8)
        love.graphics.setColor(0.3, 0.8, 0.6, 1.0)
        love.graphics.print("💻 [TapTap Make 实时战报与赛事解说流]", 18, term_y + 8)

        love.graphics.setColor(0.75, 0.8, 0.85, 0.9)
        local max_display = math.min(16, #self.recent_logs)
        for idx = 1, max_display do
            local line = self.recent_logs[idx]
            if line then
                love.graphics.print(line, 18, term_y + 12 + idx * 22)
            end
        end
    end
end

-- TapTap Make Engine Hook
return TapTapGame

