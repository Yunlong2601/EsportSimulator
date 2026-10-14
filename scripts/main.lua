if package and package.path then
    if not string.find(package.path, "lua/%?.lua") then
        package.path = "./lua/?.lua;./lua/?/init.lua;../lua/?.lua;./scripts/?.lua;./?.lua;" .. package.path
    end
end

local UI = require("urhox-libs/UI")
local AudioManager = require("AudioManager")
local LegacySession = require("LegacySession")

-- Lazy loading is part of mode isolation: the menu/new career never initializes
-- the management singleton, its catalog or the old independent career save.
local SCREENS = {
    dashboard = "DashboardScreen", menu = "MenuScreen", about = "AboutScreen",
    settings = "SettingsScreen", savemanager = "SaveManagerScreen",
    roster = "RosterScreen", league = "LeagueScreen", finance = "FinanceScreen",
    shares = "ShareScreen", academy = "AcademyScreen", market = "MarketScreen",
    setup = "SetupScreen", galleryhub = "GalleryHubScreen", halloffame = "HallOfFameScreen",
    leaderboard = "LeaderboardScreen", goalcenter = "GoalCenterScreen",
    transferboard = "TransferBoardScreen", stock = "StockScreen", regions = "RegionScreen",
    match = "MatchScreen", bp = "BpScreen", matchresult = "MatchResultScreen",
    more = "MoreScreen", highlight = "HighlightScreen", adcenter = "AdCenterScreen",
    personal_train = "PersonalTrainScreen", dynasty = "DynastyScreen", rivalry = "RivalryScreen",
    career = "CareerArcScreen", lockerroom = "LockerRoomScreen", draft = "DraftScreen",
    negotiation = "NegotiationScreen", starrecruit = "StarRecruitScreen", analytics = "MatchAnalyticsScreen",
    press = "PressScreen", merch = "MerchScreen", facilities = "FacilitiesScreen",
    reputation = "ReputationScreen", coach = "CoachScreen", player_profile = "PlayerProfileScreen",
    player_attrs = "PlayerAttrsScreen", player_contract = "PlayerContractScreen",
    player_stats = "PlayerStatsScreen", tactics = "TacticsScreen", ending = "EndingScreen",
    sl_home = "secondline.screens.SlHomeScreen", sl_train = "secondline.screens.SlTrainScreen",
    sl_match = "secondline.screens.SlMatchScreen", sl_transfer = "secondline.screens.SlTransferScreen",
    sl_story = "secondline.screens.SlStoryScreen", sl_dynasty = "secondline.screens.SlDynastyScreen",
    sl_vip = "secondline.screens.SlVipScreen",
    esport_sim = "EsportSimulatorScreen",
    esport_sim_landscape = "EsportSimulatorLandscapeScreen",
}

local currentPage_ = "menu"
local alive_ = false
local generation_ = 0
local careerSubscribed_ = false
---@type fun(target:string)
local navigate

local function modeFor(target)
    if target == "menu" then return "none" end
    if target:sub(1, 8) == "unified_" then return "career" end
    if target:sub(1, 3) == "sl_" then return "secondline" end
    return "management"
end

local function errorPage(message, retry)
    local K = require("career.ui.Kit")
    return K.Shell("页面未能打开", {
        K.Text(tostring(message)),
        K.Text("可以重试，或返回模式选择。不会将页面错误转到其他模式的新游戏。", true),
        K.Button("重试", function() navigate(retry) end),
        K.Button("返回模式选择", function() navigate("menu") end, true),
    }, navigate)
end

local function subscribeCareer()
    if careerSubscribed_ then return end
    local runtime = require("career.Runtime")
    runtime.SetOnChange(function(ok, message, status)
        if alive_ and currentPage_:sub(1, 8) == "unified_" then
            require("career.Screen").OnRuntimeChange(ok, message, status, navigate, currentPage_)
        end
    end)
    careerSubscribed_ = true
end

navigate = function(target)
    target = type(target) == "string" and target or "menu"
    local mode = modeFor(target)
    ---@type boolean, boolean|string, string|nil
    local entered, ok, reason = pcall(LegacySession.Enter, mode)
    if not entered or not ok then
        UI.SetRoot(errorPage(entered and reason or ok, target), true)
        return
    end
    if currentPage_:sub(1, 8) == "unified_" and mode ~= "career" then
        require("career.Screen").OnLeave()
    end
    currentPage_ = target
    generation_ = generation_ + 1
    local generation = generation_
    -- Navigation callbacks from a destroyed tree cannot switch later sessions.
    local function scopedNavigate(nextPage)
        if alive_ and generation == generation_ then navigate(nextPage) end
    end
    local built, root = pcall(function()
        if mode == "career" then
            subscribeCareer()
            return require("career.Screen").Build(scopedNavigate, target)
        end
        local name = SCREENS[target]
        if not name then error("未登记的页面：" .. target) end
        local path = mode == "secondline" and name or ("ui.screens." .. name)
        return require(path).Build(scopedNavigate)
    end)
    if not built or not root then root = errorPage(built and "页面没有返回界面" or root, target) end
    UI.SetRoot(root, true)
end

function Start()
    alive_ = true
    graphics.windowTitle = "电竞传奇 · 逐梦世界赛 (Esports Legacy)"
    UI.Init({
        theme = "acid-archive", scale = UI.Scale.DEFAULT,
        fonts = { { family = "sans", weights = {
            normal = "fonts/NotoSansSC-Regular.otf", bold = "fonts/NotoSansSC-Bold.otf",
        } } }, replaceFonts = true,
    })
    AudioManager.Init()
    AudioManager.PlayBGM("menu")
    navigate("menu")
end

function Stop()
    alive_ = false
    generation_ = generation_ + 1
    local ok, saved, reason = pcall(LegacySession.Leave)
    if not ok or not saved then print("[LegacySession] " .. tostring(ok and reason or saved)) end
    -- Unified commands persist before publication; never blind-save on exit.
    if careerSubscribed_ then
        require("career.Screen").OnLeave()
        require("career.Runtime").SetOnChange(nil)
    end
    careerSubscribed_ = false
    UI.Shutdown()
end

return {}
