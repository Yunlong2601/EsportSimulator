--[[
    ============================================================================
    EsportsMainHUD.lua — Master Full-Lifecycle UI Controller (Solo -> Pro -> Dynasty)
    ============================================================================
    Target Viewport: 1920x1080 Mobile Landscape
    TapTap Maker UrhoX 2D Engine
    Implements:
      - Master Top Telemetry Bar with persistent status
      - Left Thumb Phase Switcher
      - Right Thumb Primary Action Zone
      - Three-Phase Layout Structure:
          Phase 1: 个人天梯巅峰 (Solo Queue Ladder)
          Phase 2: 职业巡回赛事 (Pro Scouting & 5v5 BP Draft)
          Phase 3: 王朝科研总控 (Franchise Dynasty & R&D Tech Tree)
--]]

local UITheme = nil
local okTheme, modTheme = pcall(require, "UITheme")
if okTheme and modTheme then
    UITheme = modTheme
else
    UITheme = require("landscape.UITheme")
end

local UIFactory = nil
local okFactory, modFactory = pcall(require, "UIFactory")
if okFactory and modFactory then
    UIFactory = modFactory
else
    UIFactory = require("landscape.UIFactory")
end

-- Fallback UI primitives for test execution
local Text = _G.Text or {
    new = function()
        local obj = { text = "", color = nil }
        function obj:SetFont(_, _) end
        function obj:SetText(t) self.text = t end
        function obj:SetAlignment(_, _) end
        function obj:SetPosition(x, y) self.x, self.y = x, y end
        function obj:SetColor(c) self.color = c end
        return obj
    end
}

local UIElement = _G.UIElement or {
    new = function()
        local obj = { width = 0, height = 0, children = {} }
        function obj:SetSize(w, h) self.width, self.height = w, h end
        function obj:SetPosition(x, y) self.x, self.y = x, y end
        function obj:AddChild(c) table.insert(self.children, c) end
        function obj:Remove() self.children = {} end
        return obj
    end
}

local cache = _G.cache or {
    GetResource = function(_, resType, resPath) return resPath end
}

local EsportsMainHUD = {}
EsportsMainHUD.__index = EsportsMainHUD

--- Create and initialize the master HUD
function EsportsMainHUD.Create(uiRoot, gameState)
    local self = setmetatable({}, EsportsMainHUD)
    self.uiRoot = uiRoot
    -- Default realistic game state matching the spec
    self.state = gameState or {
        phase = 1,
        mmr = 2850,
        stamina = 88,
        focus = 92,
        rsiStrain = 18,
        funds = 2450000,
        rdPoints = 640,
        playerName = "Prodigy",
        playerRole = "MID",
    }

    self.activeViews = {}
    self:BuildTopTelemetryBar()
    self:BuildPhaseSwitcher()
    self:SwitchPhase(self.state.phase or 1)

    return self
end

--- Top Static Telemetry Bar (1920x90)
function EsportsMainHUD:BuildTopTelemetryBar()
    self.topBar = UIFactory.CreateChamferPanel(self.uiRoot, 1920, UITheme.Layout.TopBarHeight, 0, 0, UITheme.Color.PanelBorder)

    -- Status label
    self.statusText = Text:new()
    self.statusText:SetFont(cache:GetResource("Font", UITheme.Font.Main), UITheme.Font.SizeBody)
    self.statusText:SetPosition(40, 32)
    self.statusText:SetColor(UITheme.Color.TextWhite)
    self.topBar:AddChild(self.statusText)

    self:RefreshTelemetry()
end

--- Update top telemetry numbers reactively
function EsportsMainHUD:RefreshTelemetry()
    local fundsStr = string.format("%.1f万", (self.state.funds or 0) / 10000)
    local str = string.format("段位 MMR: %d (巅峰大师)  |  体能: %d%%  |  战队资金: ¥%s  |  科研点数: %d ⚡",
        self.state.mmr or 2850, self.state.stamina or 88, fundsStr, self.state.rdPoints or 640)
    if self.statusText and self.statusText.SetText then
        self.statusText:SetText(str)
    end
end

--- Phase Switcher Drawer (Tabs across top right)
function EsportsMainHUD:BuildPhaseSwitcher()
    local tabs = {
        { id = 1, name = "个人天梯 (Phase 1)" },
        { id = 2, name = "职业巡回 (Phase 2)" },
        { id = 3, name = "王朝科研 (Phase 3)" }
    }
    local startX = 1100
    for i, tab in ipairs(tabs) do
        local isCurrent = (self.state.phase == tab.id)
        local btn, _ = UIFactory.CreateCyberButton(self.topBar, tab.name, 230, 48, startX + (i - 1) * 250, 20, 
            isCurrent and UITheme.Color.CyanPulse or UITheme.Color.PanelBorder,
            function() self:SwitchPhase(tab.id) end
        )
    end
end

--- Switch between the 3 career phases seamlessly without scene reloading
function EsportsMainHUD:SwitchPhase(phaseId)
    self.state.phase = phaseId
    if self.contentContainer and self.contentContainer.Remove then
        self.contentContainer:Remove()
    end

    self.contentContainer = UIElement:new()
    self.contentContainer:SetSize(1920, 990)
    self.contentContainer:SetPosition(0, UITheme.Layout.TopBarHeight)
    if self.uiRoot and self.uiRoot.AddChild then
        self.uiRoot:AddChild(self.contentContainer)
    end

    if phaseId == 1 then
        self:RenderSoloQueueView()
    elseif phaseId == 2 then
        self:RenderProTournamentView()
    else
        self:RenderDynastyLabView()
    end
end

-- ============================================================================
-- Phase 1: 个人天梯巅峰 (Solo Queue Ladder)
-- ============================================================================
function EsportsMainHUD:RenderSoloQueueView()
    -- 1. Left Overview Mech Panel (460 x 880)
    local leftPanel = UIFactory.CreateTacticalCard(self.contentContainer, 460, 880, 40, 20, "📊 选手生理与手速监控", "SOLO_RADAR")
    local meterStamina = UIFactory.CreateProgressBar(leftPanel, 400, 20, 30, 80, UITheme.Color.EmeraldWin)
    meterStamina:SetProgress((self.state.stamina or 88) / 100, string.format("竞技体能: %d%%", self.state.stamina or 88))

    local meterFocus = UIFactory.CreateProgressBar(leftPanel, 400, 20, 30, 140, UITheme.Color.CyanPulse)
    meterFocus:SetProgress((self.state.focus or 92) / 100, string.format("对局专注度: %d%%", self.state.focus or 92))

    local meterRsi = UIFactory.CreateProgressBar(leftPanel, 400, 20, 30, 200, UITheme.Color.CrimsonAlert)
    meterRsi:SetProgress((self.state.rsiStrain or 18) / 100, string.format("手腕腱鞘负荷: %d%%", self.state.rsiStrain or 18))

    -- 2. Center Stage (960 x 880)
    local centerPanel = UIFactory.CreateTacticalCard(self.contentContainer, 960, 880, 520, 20, "⚔️ 峡谷巅峰天梯排位沙盘", "MATCHMAKING")
    local matchQueueBar = UIFactory.CreateProgressBar(centerPanel, 880, 26, 40, 720, UITheme.Color.CyanPulse)
    matchQueueBar:SetProgress(0.72, "天梯匹配中 · 正在检索同水平巅峰大师...")

    -- 3. Right Readiness / Thumb Zone Action Panel (380 x 880)
    local rightPanel = UIFactory.CreateTacticalCard(self.contentContainer, 380, 880, 1500, 20, "🎮 战备操作指令台", "DECK")

    UIFactory.CreateCyberButton(rightPanel, "📖 深度复盘 (VOD)", 340, 54, 20, 80, UITheme.Color.PanelBorder, function()
        self.state.focus = math.max(0, (self.state.focus or 90) - 10)
        self:RefreshTelemetry()
    end)

    UIFactory.CreateCyberButton(rightPanel, "🎙️ 开启直播 (STREAM)", 340, 54, 20, 150, UITheme.Color.CyberAmber, function()
        self.state.funds = (self.state.funds or 0) + 15000
        self:RefreshTelemetry()
    end)

    UIFactory.CreateCyberButton(rightPanel, "🩺 理疗康复 (PHYSIO)", 340, 54, 20, 220, UITheme.Color.EmeraldWin, function()
        self.state.rsiStrain = math.max(0, (self.state.rsiStrain or 20) - 20)
        self.state.stamina = math.min(100, (self.state.stamina or 80) + 15)
        self:RefreshTelemetry()
    end)

    -- Primary High-Frequency Action Button (Right Thumb Zone)
    UIFactory.CreateCyberButton(rightPanel, "开始天梯匹配 (MATCH)", 340, 80, 20, 780, UITheme.Color.CyanPulse, function()
        if _G.audio then _G.audio:PlaySound2D("Audio/UI/Queue_Start.wav") end
        self.state.stamina = math.max(0, (self.state.stamina or 88) - 15)
        self.state.mmr = (self.state.mmr or 2850) + 24
        self:RefreshTelemetry()
    end)
end

-- ============================================================================
-- Phase 2: 职业选秀与战队签约 (Pro Scouting & Tournaments)
-- ============================================================================
function EsportsMainHUD:RenderProTournamentView()
    -- 1. Left Overview Mech Panel (460 x 880)
    local leftPanel = UIFactory.CreateTacticalCard(self.contentContainer, 460, 880, 40, 20, "🎯 俱乐部球探与商业价值", "PRO_SCOUTING")
    local meterScout = UIFactory.CreateProgressBar(leftPanel, 400, 20, 30, 80, UITheme.Color.CyanPulse)
    meterScout:SetProgress(0.85, "豪门球探关注指数: 85%")

    local meterSynergy = UIFactory.CreateProgressBar(leftPanel, 400, 20, 30, 140, UITheme.Color.EmeraldWin)
    meterSynergy:SetProgress(0.78, "首发阵容联动默契: 78%")

    -- 2. Center Stage (960 x 880)
    local centerPanel = UIFactory.CreateTacticalCard(self.contentContainer, 960, 880, 520, 20, "⚔️ 5v5 职业赛场 BP 与战术决策沙盘", "TACTICAL_BP")

    -- 3. Right Action Panel (380 x 880)
    local rightPanel = UIFactory.CreateTacticalCard(self.contentContainer, 380, 880, 1500, 20, "⚔️ 赛场战术指令台", "COMMAND")

    UIFactory.CreateCyberButton(rightPanel, "🕵️ 刺探情报 (T1体系)", 340, 54, 20, 80, UITheme.Color.PanelBorder, function()
        self.state.focus = math.max(0, (self.state.focus or 90) - 15)
        self:RefreshTelemetry()
    end)

    UIFactory.CreateCyberButton(rightPanel, "🤝 豪门约战 (GEN训练赛)", 340, 54, 20, 150, UITheme.Color.PanelBorder, function()
        self.state.stamina = math.max(0, (self.state.stamina or 80) - 20)
        self:RefreshTelemetry()
    end)

    -- Primary High-Frequency Action Button (Right Thumb Zone)
    UIFactory.CreateCyberButton(rightPanel, "执行战术指令 (出征正赛)", 340, 80, 20, 780, UITheme.Color.EmeraldWin, function()
        if _G.audio then _G.audio:PlaySound2D("Audio/UI/Match_Win.wav") end
        self.state.funds = (self.state.funds or 0) + 150000
        self.state.rdPoints = (self.state.rdPoints or 640) + 80
        self:RefreshTelemetry()
    end)
end

-- ============================================================================
-- Phase 3: 王朝科研总控 (Franchise Dynasty & R&D Lab)
-- ============================================================================
function EsportsMainHUD:RenderDynastyLabView()
    -- 1. Left Overview Mech Panel (460 x 880)
    local leftPanel = UIFactory.CreateTacticalCard(self.contentContainer, 460, 880, 40, 20, "🏛️ 俱乐部基地设施总盘", "FACILITY_MATRIX")
    local meterTraining = UIFactory.CreateProgressBar(leftPanel, 400, 20, 30, 80, UITheme.Color.CyanPulse)
    meterTraining:SetProgress(0.60, "训练基地等级: Lv.3 (微操成长+20%)")

    local meterRehab = UIFactory.CreateProgressBar(leftPanel, 400, 20, 30, 140, UITheme.Color.EmeraldWin)
    meterRehab:SetProgress(0.40, "康复理疗中心: Lv.2 (疲劳消退+15%)")

    local meterEquity = UIFactory.CreateProgressBar(leftPanel, 400, 20, 30, 200, UITheme.Color.CyberAmber)
    meterEquity:SetProgress(0.55, "个人俱乐部控股比例: 55% (绝对大股东)")

    -- 2. Center Stage: Multi-Branch R&D Tech Tree (960 x 880)
    local centerPanel = UIFactory.CreateTacticalCard(self.contentContainer, 960, 880, 520, 20, "🧪 全域电竞科研沙盘 (Multi-Branch R&D)", "TECH_TREE")
    local progressBar = UIFactory.CreateProgressBar(centerPanel, 880, 26, 40, 680, UITheme.Color.CyberAmber)
    progressBar:SetProgress(0.65, "人体工程伤病预防 · 研发进度 65% · 3/4 周")

    -- 3. Right Action Panel (380 x 880)
    local rightPanel = UIFactory.CreateTacticalCard(self.contentContainer, 380, 880, 1500, 20, "💼 王朝商业运营台", "DYNASTY_DECK")

    UIFactory.CreateCyberButton(rightPanel, "🏗️ 扩建战队基地", 340, 54, 20, 80, UITheme.Color.PanelBorder, function()
        if self.state.funds >= 200000 then
            self.state.funds = self.state.funds - 200000
            self:RefreshTelemetry()
        end
    end)

    UIFactory.CreateCyberButton(rightPanel, "🌟 青训球探选拔", 340, 54, 20, 150, UITheme.Color.PanelBorder, function()
        if self.state.funds >= 100000 then
            self.state.funds = self.state.funds - 100000
            self:RefreshTelemetry()
        end
    end)

    UIFactory.CreateCyberButton(rightPanel, "🌍 征战世界巡回赛", 340, 54, 20, 220, UITheme.Color.CyberAmber, function()
        self.state.rdPoints = (self.state.rdPoints or 0) + 120
        self:RefreshTelemetry()
    end)

    -- Primary High-Frequency Action Button (Right Thumb Zone)
    local canResearch = (self.state.rdPoints or 0) >= 200
    UIFactory.CreateCyberButton(rightPanel, "启动下一阶段研发", 340, 80, 20, 780, UITheme.Color.CyberAmber, function()
        if self.state.rdPoints >= 200 then
            self.state.rdPoints = self.state.rdPoints - 200
            self:RefreshTelemetry()
        end
    end, not canResearch, canResearch and "" or "还需 200 点科研点数")
end

return EsportsMainHUD
