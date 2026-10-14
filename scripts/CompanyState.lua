local CompanyState = {}
local LeagueCatalog = require("LeagueCatalog")

local state_ = nil

local ROLES = { "top", "jungle", "mid", "adc", "support" }

CompanyState.DIFFICULTIES = {
    easy = { label = "简单", cash = 800, fans = 30000, aiPower = 0.92, desc = "起步资金与粉丝充裕，对手强度较低" },
    standard = { label = "标准", cash = 500, fans = 20000, aiPower = 1.0, desc = "平衡的经营挑战" },
    hard = { label = "挑战", cash = 300, fans = 12000, aiPower = 1.08, desc = "起步艰难，对手强度更高" },
}

CompanyState.YEAR_WEEKS = 48 -- 一年 48 周：双赛段 + 季后赛 + 世界赛 + 休赛期

CompanyState.ORIGINS = {
    pro = { label = "顶级联赛队", short = "顶级", cash = 1.0, fans = 1.0, reputation = 50, desc = "以东冠联赛正式席位开局，资金与粉丝充裕，目标争冠。" },
    academy = { label = "次级联赛队", short = "次级", cash = 0.71, fans = 0.4, reputation = 35, desc = "从次级联赛起步，赛季排名前二即可升入东冠联赛。" },
    internet_cafe = { label = "网吧队", short = "网吧", cash = 0.6, fans = 0.25, reputation = 20, desc = "从城市赛预选赛打起，出线后闯次级联赛，再冲击顶级。" },
}

CompanyState.ORIGIN_ROSTERS = {
    pro = { top = "p_blaze", jungle = "p_vex", mid = "p_lumen", adc = "p_nova", support = "p_ember" },
    academy = { top = "p_blaze", jungle = "p_vex", mid = "p_lumen", adc = "p_zephyr", support = "p_ember" },
    internet_cafe = { top = "p_valor", jungle = "p_storm", mid = "p_shade", adc = "p_zephyr", support = "p_echo" },
}

CompanyState.CUSTOM_PROFILES = {
    balanced = { label = "均衡", desc = "三线能力均衡发展" },
    mechanics = { label = "操作", desc = "操作属性突出" },
    teamfight = { label = "团战", desc = "团战属性突出" },
    laning = { label = "对线", desc = "对线属性突出" },
}

function CompanyState.NewGame(name, difficultyLevel, origin, setup)
    name = name or "Legacy Gaming"
    LeagueCatalog.ResetRoster()
    origin = CompanyState.ORIGINS[origin] and origin or "pro"
    local level = CompanyState.DIFFICULTIES[difficultyLevel] and difficultyLevel or "standard"
    setup = setup or {}
    if setup.companyName and setup.companyName ~= "" then
        name = setup.companyName
    end
    local companyTag = setup.companyTag or ""
    local difficulty = CompanyState.DIFFICULTIES[level]
    local originCfg = CompanyState.ORIGINS[origin]
    local originRoster = CompanyState.ORIGIN_ROSTERS[origin]
    local league = origin == "internet_cafe" and "qualifier" or (origin == "academy" and "academy" or "pro")
    local previousProfile = state_ and state_.profile or {}
    local fresh = {
        schemaVersion = 1,
        game = "esports_tycoon",
        company = {
            name = name,
            options = {
                company = setup.companyName ~= nil or setup.companyTag ~= nil,
                customPlayers = setup.customPlayers ~= nil,
                league = setup.seasonWeeks ~= nil or setup.playoffSpots ~= nil or setup.mastersEnabled ~= nil,
            },
            settings = {
                seasonWeeks = tonumber(setup.seasonWeeks) or 7,
                playoffSpots = tonumber(setup.playoffSpots) or 4,
                mastersEnabled = setup.mastersEnabled ~= false,
                tag = companyTag,
            },
            difficulty = level,
            origin = origin,
            league = league,
            seasons = 0,
            week = 1,
            split = "spring", -- 双赛制：spring 春季赛 / summer 夏季赛 / worlds 世界赛
            points = 0, -- 全年积分（春季+夏季常规赛排名分 + 春/夏冠军加成）
            seasonState = league == "qualifier" and "qualifier" or "regular", -- qualifier / regular / playoff / champion / finished / eliminated / bankrupt
            cash = math.floor(difficulty.cash * originCfg.cash / 10) * 10, -- 单位：万元
            fans = math.floor(difficulty.fans * originCfg.fans / 100) * 100,
            reputation = originCfg.reputation,
            tier = league == "qualifier" and "grassroots" or (league == "academy" and "rising" or "professional"),
            sponsors = {
                active = {
                    slot1 = { offerId = "sp_local", payment = 20, weeksLeft = 6 },
                },
                negotiated = {},
                initialized = true,
            },
        },
        negotiations = {},
        nextNegotiationId = 1,
        roster = {
            players = {
                top = originRoster.top,
                jungle = originRoster.jungle,
                mid = originRoster.mid,
                adc = originRoster.adc,
                support = originRoster.support,
            },
            contracts = {},
            buyouts = {},
            desire = {},
            satisfaction = {},
            breach = {},
            outLoans = {},
            bench = {
                slot1 = "",
                slot2 = "",
            },
            staff = {
                coach = 1,
                analyst = 1,
                operations = 1,
            },
            chemistry = 30,
            trainedThisWeek = false,
            training = {
                focus = nil,
                lastFocus = nil,
                sameFocusWeeks = 0,
            },
            talkedPlayer = nil,
            academy = {
                players = {
                    top = "",
                    jungle = "",
                    mid = "",
                    adc = "",
                    support = "",
                },
                standings = {},
                nextId = 0,
                trainees = {},
            },
            customPlayers = {},
        },
        meta = {
            role = nil,
            roleLabel = "全位置",
            name = "运营均衡版本",
            desc = "各位置权重均衡，无额外加成",
        },
        market = {
            listed = {},
            offers = {},
            nextOfferId = 0,
            loansIn = {},
            refused = {},
            wars = {},
            transferPool = {},
            transferPoolSeq = 0,
            transferNews = {},
            rumors = {},
            hijacked = {},
        },
        social = {
            heat = 50,
            history = {},
            topics = {},
            trend = 0,
        },
        scouting = {
            reports = {},
            prospects = {},
            nextId = 0,
            nextProspectId = 0,
            usedThisSeason = 0,
            pendingWeek = nil,
        },
        events = {
            pending = nil,
        },
        league = {
            standings = league == "qualifier" and {
                { teamId = "legacy_cafe", teamName = name, wins = 0, losses = 0, score = 0 },
                { teamId = "q_star", teamName = "星火网吧", wins = 0, losses = 0, score = 0 },
                { teamId = "q_blue", teamName = "蓝色港湾", wins = 0, losses = 0, score = 0 },
                { teamId = "q_typhoon", teamName = "台风电竞", wins = 0, losses = 0, score = 0 },
            } or {},
            results = {},
            playoff = { enabled = false },
            masters = { enabled = false },
            history = {}, -- 双赛制记录：springChampion / springRank / summerChampion
        },
        shares = {
            founder = 99, -- 新档为教练档：老板持 99%，玩家 1% 干股（CoachSystem）
            investors = 0,
            rounds = {},
            public = false,
            ticker = "",
            sharePrice = 0,
            prevPrice = 0,
            floatPct = 0,
            history = {},
            mergersSeason = -1,
            mergersUsed = 0,
            lastSecondaryWeek = 0,
            lastBuybackWeek = 0,
            nextOfferWeek = 0,
            acquired = false,
            mergerNames = {},
            ipoWeek = 0,
        },
        finance = {
            history = {},
            valuation = 0,
        },
        tutorial = {
            done = false,
            step = 1,
        },
        profile = {
            endings = previousProfile.endings or {},
            seasons = tonumber(previousProfile.seasons) or 0,
            championships = tonumber(previousProfile.championships) or 0,
            bestValuation = tonumber(previousProfile.bestValuation) or 0,
            peakFans = tonumber(previousProfile.peakFans) or 0,
            hallOfFame = previousProfile.hallOfFame,
        },
        goals = {
            streak = 0,
            season = {},
            baseline = {},
        },
        timeline = {},
    }
    local customIndex = 0
    if setup.customPlayers then
        for _, spec in ipairs(setup.customPlayers) do
            if type(spec) == "table" and spec.name and spec.name ~= "" then
                customIndex = customIndex + 1
                local player = CompanyState.BuildCustomPlayer(spec, customIndex)
                fresh.roster.customPlayers[player.id] = player
                LeagueCatalog.RegisterPlayer(player)
            end
        end
        if customIndex > 0 then
            local names = {}
            for _, customPlayer in pairs(fresh.roster.customPlayers) do
                table.insert(names, customPlayer.name)
            end
            CompanyState.RecordTimeline(fresh, "自定义选手就位",
                "开局自定义选手「" .. table.concat(names, "」「") .. "」已进入自由市场，可在转会市场签约。")
        end
    end
    local GoalSystem = require("GoalSystem")
    GoalSystem.GenerateSeasonGoals(fresh)
    -- M3.3 教练身份与股权线：新档空降教练持 1% 干股 + 周薪合同
    local CoachSystem = require("CoachSystem")
    CoachSystem.NewCoach(fresh)
    -- 赛季推荐加强英雄（BP 页展示 + 特训加成 + 周版本榜倾向）
    local HeroSystem = require("HeroSystem")
    HeroSystem.RollSeasonMeta(fresh)
    return fresh
end

function CompanyState.BuildCustomPlayer(spec, index)
    local role = LeagueCatalog.POSITIONS[spec.role] and spec.role or "mid"
    local base = 58 + math.random(0, 6)
    local player = {
        id = "custom_" .. tostring(index),
        name = spec.name,
        role = role,
        mechanics = base,
        teamfight = base,
        laning = base,
        form = math.random(62, 76),
        potential = math.random(72, 88),
        age = math.random(19, 22),
        salary = 8,
        buyout = 0,
        contractYears = 2,
        isCustom = true,
    }
    local profile = spec.profile
    if profile == "mechanics" then
        player.mechanics = math.min(95, base + math.random(12, 20))
    elseif profile == "teamfight" then
        player.teamfight = math.min(95, base + math.random(12, 20))
    elseif profile == "laning" then
        player.laning = math.min(95, base + math.random(12, 20))
    end
    return player
end

function CompanyState.GetState()
    return state_
end

function CompanyState.SetState(state)
    state_ = state
    return state_
end

function CompanyState.Ensure(state)
    if not state then return nil end
    state.schemaVersion = tonumber(state.schemaVersion) or 1
    state.game = state.game or "esports_tycoon"
    state.company = state.company or {}
    state.company.name = state.company.name or "Legacy Gaming"
    state.company.week = tonumber(state.company.week) or 1
    state.company.seasonState = state.company.seasonState or "regular"
    state.company.seasons = tonumber(state.company.seasons) or 0
    state.company.split = state.company.split or "spring"
    state.company.points = tonumber(state.company.points) or 0
    state.league = state.league or {}
    state.company.origin = CompanyState.ORIGINS[state.company.origin] and state.company.origin or "pro"
    state.company.league = state.company.league == "academy" and "academy" or (state.company.league == "qualifier" and "qualifier" or "pro")
    state.company.cash = tonumber(state.company.cash) or 500
    state.company.fans = tonumber(state.company.fans) or 20000
    state.company.reputation = tonumber(state.company.reputation) or 50
    local tierId = state.company.tier
    if tierId ~= "grassroots" and tierId ~= "rising" and tierId ~= "professional"
        and tierId ~= "elite" and tierId ~= "legend" then
        -- 起始评级按联赛地位迁移（不调 TierSystem，避免 Ensure 递归）
        state.company.tier = state.company.league == "qualifier" and "grassroots"
            or (state.company.league == "academy" and "rising" or "professional")
    end
    state.company.difficulty = state.company.difficulty or "standard"
    state.company.options = state.company.options or {}
    state.company.options.company = state.company.options.company == true
    state.company.options.customPlayers = state.company.options.customPlayers == true
    state.company.options.league = state.company.options.league == true
    state.company.settings = state.company.settings or {}
    state.company.settings.seasonWeeks = tonumber(state.company.settings.seasonWeeks) or 7
    state.company.settings.playoffSpots = tonumber(state.company.settings.playoffSpots) or 4
    state.company.settings.mastersEnabled = state.company.settings.mastersEnabled ~= false
    state.company.settings.tag = state.company.settings.tag or ""
    local tacticId = tostring(state.company.tactics)
    state.company.tactics = (tacticId == "aggressive" or tacticId == "defensive" or tacticId == "metapick" or tacticId == "domination") and tacticId or "balanced"
    state.company.sponsors = state.company.sponsors or {}
    state.company.sponsors.negotiated = state.company.sponsors.negotiated or {}
    if state.company.sponsors.initialized == nil then
        state.company.sponsors.initialized = false
    end
    state.company.sponsors.active = state.company.sponsors.active or {}
    if state.company.sponsors.initialized == false then
        if not state.company.sponsors.active.slot1 then
            state.company.sponsors.active.slot1 = { offerId = "sp_local", payment = 20, weeksLeft = 6 }
        end
        state.company.sponsors.initialized = true
    end
    state.market = state.market or {}
    state.market.listed = state.market.listed or {}
    state.market.offers = state.market.offers or {}
    state.market.nextOfferId = tonumber(state.market.nextOfferId) or 0
    state.market.loansIn = state.market.loansIn or {}
    state.market.refused = state.market.refused or {}
    state.market.rejectedOffers = state.market.rejectedOffers or {}
    state.market.wars = state.market.wars or {}
    state.market.transferPool = state.market.transferPool or {}
    state.market.transferPoolSeq = tonumber(state.market.transferPoolSeq) or 0
    state.market.transferNews = state.market.transferNews or {}
    state.market.rumors = state.market.rumors or {}
    state.market.hijacked = state.market.hijacked or {}
    -- #48A/#49 竞拍窗 / 转会收入累计（老档自动补齐）
    state.market.auctions = state.market.auctions or {}
    state.market.auctionSeq = tonumber(state.market.auctionSeq) or 0
    state.market.prevWindowOpen = state.market.prevWindowOpen == true
    state.social = state.social or {}
    state.social.heat = tonumber(state.social.heat) or 50
    state.social.history = state.social.history or {}
    state.social.topics = state.social.topics or {}
    state.aiTeams = state.aiTeams or {}
    state.rivalries = state.rivalries or {}
    state.leaderboard = state.leaderboard or {}
    state.social.trend = tonumber(state.social.trend) or 0
    state.scouting = state.scouting or {}
    state.scouting.reports = state.scouting.reports or {}
    state.scouting.prospects = state.scouting.prospects or {}
    state.scouting.nextId = tonumber(state.scouting.nextId) or 0
    state.scouting.nextProspectId = tonumber(state.scouting.nextProspectId) or 0
    state.scouting.usedThisSeason = tonumber(state.scouting.usedThisSeason) or 0
    state.scouting.pendingWeek = state.scouting.pendingWeek or nil
    -- #46 球探客制化：雇佣的星探部门 / 进行中的定制任务 / 多队抢签的抢手新秀
    state.scouting.scouts = state.scouting.scouts or {}
    state.scouting.mission = state.scouting.mission or nil
    state.scouting.hotProspects = state.scouting.hotProspects or {}
    state.roster = state.roster or {}
    state.roster.players = state.roster.players or {}
    state.roster.players.top = state.roster.players.top or "p_blaze"
    state.roster.players.jungle = state.roster.players.jungle or "p_vex"
    state.roster.players.mid = state.roster.players.mid or "p_lumen"
    state.roster.players.adc = state.roster.players.adc or "p_nova"
    state.roster.players.support = state.roster.players.support or "p_ember"
    state.roster.contracts = state.roster.contracts or {}
    state.roster.buyouts = state.roster.buyouts or {}
    state.roster.desire = state.roster.desire or {}
    state.roster.satisfaction = state.roster.satisfaction or {}
    state.roster.breach = state.roster.breach or {}
    state.roster.outLoans = state.roster.outLoans or {}
    state.roster.bench = state.roster.bench or {}
    state.roster.bench.slot1 = state.roster.bench.slot1 or ""
    state.roster.bench.slot2 = state.roster.bench.slot2 or ""
    for _, playerId in pairs(state.roster.players) do
        if playerId and playerId ~= "" and not state.roster.contracts[playerId] then
            local loaned = false
            for _, loan in pairs(state.market.loansIn) do
                if loan.playerId == playerId then loaned = true break end
            end
            if not loaned then
                state.roster.contracts[playerId] = LeagueCatalog.GetContractYears(playerId)
            end
        end
    end
    for _, playerId in pairs(state.roster.bench) do
        if playerId and playerId ~= "" and not state.roster.contracts[playerId] then
            state.roster.contracts[playerId] = LeagueCatalog.GetContractYears(playerId)
        end
    end
    for _, playerId in pairs(state.roster.players) do
        if playerId and playerId ~= "" and not state.roster.desire[playerId] then
            state.roster.desire[playerId] = 25 + math.random(0, 30)
        end
    end
    for _, playerId in pairs(state.roster.bench) do
        if playerId and playerId ~= "" and not state.roster.desire[playerId] then
            state.roster.desire[playerId] = 25 + math.random(0, 30)
        end
    end
    state.roster.staff = state.roster.staff or {}
    state.roster.staff.coach = tonumber(state.roster.staff.coach) or tonumber(state.roster.coachLevel) or 1
    state.roster.staff.analyst = tonumber(state.roster.staff.analyst) or 1
    state.roster.staff.operations = tonumber(state.roster.staff.operations) or 1
    state.roster.coachLevel = state.roster.staff.coach
    state.roster.chemistry = tonumber(state.roster.chemistry) or 30
    -- 训练设施等级（方向 A）：1 基础 / 2 标准 / 3 精英，老档默认 1
    state.roster.facility = tonumber(state.roster.facility) or 1
    -- 选手生态（Player Ecosystem）：人格 / 心态 / 关系网容器（旧档自动补齐）
    state.playerEco = state.playerEco or {}
    state.relationships = state.relationships or { duo = { a = "", b = "" }, captain = "", conflicts = {} }
    state.relationships.duo = state.relationships.duo or { a = "", b = "" }
    state.relationships.duo.a = state.relationships.duo.a or ""
    state.relationships.duo.b = state.relationships.duo.b or ""
    state.relationships.captain = state.relationships.captain or ""
    state.relationships.conflicts = state.relationships.conflicts or {}
    state.roster.trainedThisWeek = state.roster.trainedThisWeek == true
    state.roster.training = state.roster.training or {}
    state.roster.training.focus = state.roster.training.focus or nil
    state.roster.training.lastFocus = state.roster.training.lastFocus or nil
    state.roster.training.sameFocusWeeks = tonumber(state.roster.training.sameFocusWeeks) or 0
    state.roster.academy = state.roster.academy or {}
    state.roster.academy.players = state.roster.academy.players or {}
    for _, role in ipairs(ROLES) do
        state.roster.academy.players[role] = state.roster.academy.players[role] or ""
    end
    state.roster.academy.standings = state.roster.academy.standings or {}
    state.roster.academy.nextId = tonumber(state.roster.academy.nextId) or 0
    state.roster.academy.trainees = state.roster.academy.trainees or {}
    state.roster.customPlayers = state.roster.customPlayers or {}
    state.meta = state.meta or {}
    state.meta.roleLabel = state.meta.roleLabel or "全位置"
    state.meta.name = state.meta.name or "运营均衡版本"
    state.meta.desc = state.meta.desc or "各位置权重均衡，无额外加成"
    state.events = state.events or {}
    state.league = state.league or {}
    state.league.standings = state.league.standings or {}
    state.league.results = state.league.results or {}
    state.league.playoff = state.league.playoff or {}
    state.league.playoff.enabled = state.league.playoff.enabled == true
    state.league.masters = state.league.masters or {}
    state.league.masters.enabled = state.league.masters.enabled == true
    state.league.masters.results = state.league.masters.results or {}
    state.league.masters.regionResults = state.league.masters.regionResults or {}
    state.shares = state.shares or {}
    state.shares.founder = tonumber(state.shares.founder) or 100
    state.shares.investors = tonumber(state.shares.investors) or 0
    state.shares.rounds = state.shares.rounds or {}
    -- 公开股票市场（老档自动补齐，未上市）
    state.shares.public = state.shares.public == true
    state.shares.ticker = state.shares.ticker or ""
    state.shares.sharePrice = tonumber(state.shares.sharePrice) or 0
    state.shares.prevPrice = tonumber(state.shares.prevPrice) or 0
    state.shares.floatPct = tonumber(state.shares.floatPct) or 0
    state.shares.history = state.shares.history or {}
    state.shares.mergersSeason = tonumber(state.shares.mergersSeason) or -1
    state.shares.mergersUsed = tonumber(state.shares.mergersUsed) or 0
    state.shares.lastSecondaryWeek = tonumber(state.shares.lastSecondaryWeek) or 0
    state.shares.lastBuybackWeek = tonumber(state.shares.lastBuybackWeek) or 0
    state.shares.nextOfferWeek = tonumber(state.shares.nextOfferWeek) or 0
    state.shares.acquired = state.shares.acquired == true
    state.shares.mergerNames = state.shares.mergerNames or {}
    state.shares.ipoWeek = tonumber(state.shares.ipoWeek) or 0
    -- 多地区并行经营（老档自动补齐容器，分部壳由 MultiRegionSystem.Ensure 建）
    state.branches = state.branches or {}
    -- 教练 BP 对局容器（每周生成/清理，老档自动补齐）
    state.match = state.match or {}
    -- P1-③ 医疗康复室（老档自动补齐）
    state.medical = state.medical or {}
    state.medical.level = tonumber(state.medical.level) or 0
    state.finance = state.finance or {}
    state.finance.history = state.finance.history or {}
    state.finance.valuation = tonumber(state.finance.valuation) or 0
    state.finance.transferIncome = tonumber(state.finance.transferIncome) or 0
    state.tutorial = state.tutorial or {}
    state.tutorial.done = state.tutorial.done == true
    state.tutorial.step = state.tutorial.done and 0 or (tonumber(state.tutorial.step) or 1)
    -- D1-3：引导新增「开局配置」首步；已有经营进度的旧档自动跳过配置步
    if not state.tutorial.done and state.tutorial.step == 1
        and ((tonumber(state.company.seasons) or 0) > 0 or (tonumber(state.company.week) or 1) > 1) then
        state.tutorial.step = 2
    end
    state.profile = state.profile or {}
    -- #48B 明星多步招募容器（老档自动补齐）
    state.starRecruit = state.starRecruit or {}
    state.goals = state.goals or {}
    state.goals.streak = tonumber(state.goals.streak) or 0
    state.goals.season = state.goals.season or {}
    state.goals.baseline = state.goals.baseline or {}
    state.profile.endings = state.profile.endings or {}
    for _, key in ipairs({ "champion", "finished", "bankrupt", "valuation", "fans" }) do
        state.profile.endings[key] = state.profile.endings[key] == true
    end
    state.profile.seasons = tonumber(state.profile.seasons) or 0
    state.profile.championships = tonumber(state.profile.championships) or 0
    state.profile.bestValuation = tonumber(state.profile.bestValuation) or 0
    state.profile.peakFans = tonumber(state.profile.peakFans) or 0
    state.profile.hallOfFame = state.profile.hallOfFame or {}
    state.profile.hallOfFame.entries = state.profile.hallOfFame.entries or {}
    state.profile.hallOfFame.dynastyUnlocked = state.profile.hallOfFame.dynastyUnlocked or {}
    state.profile.hallOfFame.valuationUnlocked = state.profile.hallOfFame.valuationUnlocked or {}
    state.profile.hallOfFame.worldChampionships = tonumber(state.profile.hallOfFame.worldChampionships) or 0
    state.timeline = state.timeline or {}
    return state
end

function CompanyState.GetDifficulty(state)
    state = CompanyState.Ensure(state)
    return CompanyState.DIFFICULTIES[state.company.difficulty] or CompanyState.DIFFICULTIES.standard
end

function CompanyState.IsMastersEnabled(state)
    state = CompanyState.Ensure(state)
    return (state.company.settings and state.company.settings.mastersEnabled) ~= false
end

function CompanyState.GetCompanyTag(state)
    state = CompanyState.Ensure(state)
    return (state.company.settings and state.company.settings.tag) or ""
end

function CompanyState.GetLeagueLabel(state)
    state = CompanyState.Ensure(state)
    if state.company.league == "academy" then return "次级联赛" end
    if state.company.league == "qualifier" then return "城市赛预选赛" end
    return LeagueCatalog.LEAGUE_NAME
end

function CompanyState.GetLeagueGoal(state)
    state = CompanyState.Ensure(state)
    if state.company.league == "academy" then return "赛季结束排名前二，升入东冠联赛" end
    if state.company.league == "qualifier" then return "预选赛排名前二，晋级次级联赛" end
    if state.company.seasonState == "masters" then return "世界赛淘汰赛进行中，冲击世界冠军" end
    return "冲击前四进季后赛，后两名降级"
end


--- 赛段名：春季赛 / 夏季赛 / 世界赛
function CompanyState.GetSplitLabel(state)
    state = CompanyState.Ensure(state)
    local split = state.company.split or "spring"
    if split == "summer" then return "夏季赛" end
    if split == "worlds" then return "世界赛" end
    return "春季赛"
end

--- 全年 48 周赛历：返回当前阶段与全年周数（仪表盘/联赛页展示用）
function CompanyState.GetYearPhase(state)
    state = CompanyState.Ensure(state)
    local week = tonumber(state.company.week) or 1
    local split = state.company.split or "spring"
    local seasonState = state.company.seasonState or "regular"
    local weeks = tonumber(state.company.settings and state.company.settings.seasonWeeks) or 7
    local springPlayoffWeek = weeks + 1
    local summerStart = weeks + 2
    local summerPlayoffWeek = weeks * 2 + 3
    local worldsWeek = weeks * 2 + 4
    local offseasonWeek = weeks * 2 + 5
    if seasonState == "qualifier" then
        return { phase = "qualifier", label = "城市赛预选赛", weekOfYear = week }
    end
    if seasonState == "eliminated" then
        return { phase = "eliminated", label = "已淘汰", weekOfYear = week }
    end
    if split == "spring" then
        if seasonState == "regular" then
            return { phase = "spring", label = "春季赛常规赛", weekOfYear = week }
        end
        if seasonState == "playoff" then
            return { phase = "spring_playoff", label = "春季季后赛", weekOfYear = springPlayoffWeek }
        end
        return { phase = "spring_break", label = "春歇期", weekOfYear = math.min(CompanyState.YEAR_WEEKS, springPlayoffWeek + 1) }
    end
    if split == "summer" then
        if seasonState == "regular" then
            return { phase = "summer", label = "夏季赛常规赛", weekOfYear = summerStart + week - 1 }
        end
        if seasonState == "playoff" then
            return { phase = "summer_playoff", label = "夏季季后赛", weekOfYear = summerPlayoffWeek }
        end
        if seasonState == "champion" then
            return { phase = "worlds_wait", label = "世界赛备战期", weekOfYear = worldsWeek }
        end
        return { phase = "offseason", label = "休赛期", weekOfYear = math.min(CompanyState.YEAR_WEEKS, offseasonWeek) }
    end
    if seasonState == "masters" or split == "worlds" then
        return { phase = "worlds", label = "世界赛", weekOfYear = worldsWeek }
    end
    return { phase = "offseason", label = "休赛期", weekOfYear = math.min(CompanyState.YEAR_WEEKS, offseasonWeek) }
end

--- 高光时刻：夺冠 / 宿敌战胜利等全屏纪念卡（seen 后不再自动弹出）
function CompanyState.SetHighlight(state, highlight)
    state = CompanyState.Ensure(state)
    state.highlight = highlight
    state.highlight.seen = false
    return state
end

function CompanyState.RecordTimeline(state, title, description)
    state = CompanyState.Ensure(state)
    table.insert(state.timeline, 1, {
        week = state.company.week,
        title = title,
        description = description,
    })
    while #state.timeline > 30 do table.remove(state.timeline) end
    return state
end

function CompanyState.StartNewSeason(state)
    local GoalSystem = require("GoalSystem")
    state = CompanyState.Ensure(state)
    -- 先结算上一赛季董事会目标（旧 standings 仍有效），并兑现预算奖惩
    GoalSystem.SettleSeason(state)
    GoalSystem.ApplyBudgetBonus(state)
    -- M3.4 严格董事会：上季目标/红线评估 → 警告 → 降薪 → 解雇
    local CoachSystem = require("CoachSystem")
    local boardVerdict = state.goals.lastVerdict and state.goals.lastVerdict.verdict or "half"
    CoachSystem.EvaluateBoard(state, boardVerdict)
    if state.company.seasonState == "fired" then return state end
    -- 王朝传承：赛季成绩落档后结算传奇点 / 评级 / 跨赛季目标（机制 B）
    local DynastySystem = require("DynastySystem")
    DynastySystem.OnSeasonEnd(state)
    -- 选手生涯：全市场年龄 +1、成长/衰退漂移、退役与 AI 代际更替
    local CareerSystem = require("CareerSystem")
    CareerSystem.AgeSeason(state)
    -- 租借到期、报价失效、谈判冷却清空（懒加载避免循环依赖）
    local MarketSystem = require("MarketSystem")
    MarketSystem.CleanSeason(state)
    -- D4 收尾：standings 清空前捕获 AI 上季名次，供新赛季预算随成绩
    local AISystem = require("AISystem")
    AISystem.CaptureLastRanks(state)
    -- 升降级：以东冠联赛名次为准，后两名降入次级联赛；次级联赛前二升入东冠联赛
    local league = state.company.league
    if league == "pro" then
        local rank = CompanyState.GetPlayerRankFromTable(state.league.standings, "legacy")
        if rank >= 7 then
            state.company.league = "academy"
            CompanyState.RecordTimeline(state, "降级",
                "东冠联赛排名第 " .. tostring(rank) .. "，新赛季降至次级联赛，争取早日回归。")
        end
    elseif league == "academy" then
        local rank = CompanyState.GetPlayerRankFromTable(state.roster.academy.standings, "legacy_youth")
        if rank <= 2 then
            state.company.league = "pro"
            CompanyState.RecordTimeline(state, "升级",
                "次级联赛排名第 " .. tostring(rank) .. "，新赛季升入东冠联赛！")
        end
    end
    state.company.seasons = tonumber(state.company.seasons) + 1
    state.company.split = "spring"
    state.company.points = 0
    state.company.worldsEntry = nil
    state.league.history = {}
    state.highlight = nil
    state.company.week = 1
    state.company.seasonState = "regular"
    -- M3.3 教练买股额度跨赛季重置
    local CoachSystem = require("CoachSystem")
    CoachSystem.ResetSeason(state)
    -- 赛季推荐加强英雄：新赛季重生成
    local HeroSystem = require("HeroSystem")
    HeroSystem.RollSeasonMeta(state)
    state.league.standings = {}
    state.league.results = {}
    state.league.playoff = { enabled = false }
    state.league.masters = { enabled = false }
    state.league.cup = nil
    -- 多地区并行经营：新赛季重置分部积分榜/赛果，保留档位与累计投入
    local MultiRegionSystem = require("MultiRegionSystem")
    MultiRegionSystem.ResetSeason(state)
    -- D4 AI 同构化：AI 队赛季成长 + 重定目标/预算
    local AISystem = require("AISystem")
    AISystem.EnsureAgents(state)
    AISystem.ResetSeason(state)
    state.match = {} -- 教练 BP 对局新赛季清空
    state.scouting.usedThisSeason = 0
    state.scouting.pendingWeek = nil
    state.roster.trainedThisWeek = false
    state.roster.talkedPlayer = nil
    state.events.pending = nil
    state.roster.academy.standings = {}
    for role, playerId in pairs(state.roster.players) do
        if playerId and playerId ~= "" then
            local player = LeagueCatalog.GetPlayer(playerId)
            if player then
                player.form = math.max(0, math.min(100, (tonumber(player.form) or 70) + math.random(-5, 5)))
            end
            local years = tonumber(state.roster.contracts[playerId]) or LeagueCatalog.GetContractYears(playerId)
            years = years - 1
            if years <= 0 then
                state.roster.players[role] = ""
                state.roster.contracts[playerId] = nil
                state.roster.buyouts[playerId] = nil
                state.roster.desire[playerId] = nil
                if player then
                    CompanyState.RecordTimeline(state, "合同到期",
                        player.name .. " 合同到期未续约，成为自由选手，阵容出现空缺。")
                end
            else
                state.roster.contracts[playerId] = years
                local desire = state.roster.desire and state.roster.desire[playerId]
                if desire then
                    state.roster.desire[playerId] = math.max(0, math.min(100, math.floor(tonumber(desire) - 15 + 0.5)))
                end
            end
        end
    end
    for slot, playerId in pairs(state.roster.bench) do
        if playerId and playerId ~= "" then
            local player = LeagueCatalog.GetPlayer(playerId)
            local years = tonumber(state.roster.contracts[playerId]) or LeagueCatalog.GetContractYears(playerId)
            years = years - 1
            if years <= 0 then
                state.roster.bench[slot] = ""
                state.roster.contracts[playerId] = nil
                state.roster.buyouts[playerId] = nil
                state.roster.desire[playerId] = nil
                if player then
                    CompanyState.RecordTimeline(state, "合同到期",
                        player.name .. " 替补合同到期未续约，成为自由选手。")
                end
            else
                state.roster.contracts[playerId] = years
            end
        end
    end
    GoalSystem.GenerateSeasonGoals(state)
    CompanyState.RecordTimeline(state, "新赛季启程", "新赛季常规赛开始，阵容、合同与董事会目标已更新。")
    -- #45 选秀大会：新赛季节点开放（懒加载避免循环依赖）
    local DraftSystem = require("DraftSystem")
    DraftSystem.OpenDraft(state)
    return state
end

function CompanyState.GetPlayerRankFromTable(standings, targetId)
    local sorted = {}
    for _, entry in ipairs(standings or {}) do table.insert(sorted, entry) end
    table.sort(sorted, function(a, b)
        if a.wins ~= b.wins then return a.wins > b.wins end
        return (a.score or 0) > (b.score or 0)
    end)
    for rank, entry in ipairs(sorted) do
        if entry.teamId == targetId then return rank end
    end
    return #sorted + 1
end

function CompanyState.GetSummary(state)
    state = CompanyState.Ensure(state)
    local TierSystem = require("TierSystem")
    local academyCount = 0
    for _, traineeId in pairs(state.roster.academy.players) do
        if traineeId and traineeId ~= "" then academyCount = academyCount + 1 end
    end
    local sponsorCount = 0
    for _, slot in pairs(state.company.sponsors.active) do
        if slot and slot.offerId then sponsorCount = sponsorCount + 1 end
    end
    return {
        name = state.company.name,
        week = state.company.week,
        seasonState = state.company.seasonState,
        cash = state.company.cash,
        fans = state.company.fans,
        reputation = state.company.reputation,
        valuation = state.finance.valuation,
        founder = state.shares.founder,
        investors = state.shares.investors,
        coachLevel = state.roster.staff.coach,
        analyst = state.roster.staff.analyst,
        operations = state.roster.staff.operations,
        chemistry = state.roster.chemistry,
        academyCount = academyCount,
        sponsorCount = sponsorCount,
        maxSponsorSlots = TierSystem.GetSponsorSlots(state),
        tier = TierSystem.GetTier(state),
        tierScore = TierSystem.GetAssessment(state),
    }
end

return CompanyState

