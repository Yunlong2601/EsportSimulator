--[[
    ============================================================================
    UIFactory.lua — Chamfered HUD and Cyber Neon Widgets for TapTap Maker UrhoX
    ============================================================================
    Production-grade component factory implementing:
      - 45° Chamfered panels with 9-slice textures and safe fallbacks
      - Tactical Cyber Neon Buttons with 0.96 scale depression and audio cues
      - Telemetry Progress Bars with numerical labels
      - Proactive Action Gating with contextual requirement banners
--]]

local UITheme = nil
local okTheme, modTheme = pcall(require, "UITheme")
if okTheme and modTheme then
    UITheme = modTheme
else
    UITheme = require("landscape.UITheme")
end

-- Graceful fallbacks for headless unit test environments
local Color = _G.Color or function(r, g, b, a) return { r = r, g = g, b = b, a = a or 1.0 } end
local BorderImage = _G.BorderImage or {
    new = function()
        local obj = { width = 0, height = 0, x = 0, y = 0, children = {} }
        function obj:SetSize(w, h) self.width, self.height = w, h end
        function obj:SetPosition(x, y) self.x, self.y = x, y end
        function obj:SetTexture(_) end
        function obj:SetBorder(_) end
        function obj:SetImageBorder(_) end
        function obj:SetColor(_) end
        function obj:AddChild(c) table.insert(self.children, c) end
        function obj:Remove() self.children = {} end
        return obj
    end
}

local Button = _G.Button or {
    new = function()
        local obj = { width = 0, height = 0, x = 0, y = 0, children = {}, scale = { x = 1, y = 1 } }
        function obj:SetSize(w, h) self.width, self.height = w, h end
        function obj:SetPosition(x, y) self.x, self.y = x, y end
        function obj:SetTexture(_) end
        function obj:SetBorder(_) end
        function obj:SetColor(_) end
        function obj:SetScale(s) self.scale = s end
        function obj:AddChild(c) table.insert(self.children, c) end
        function obj:SubscribeToEvent(_, _) end
        return obj
    end
}

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

local IntRect = _G.IntRect or function(l, t, r, b) return { l = l, t = t, r = r, b = b } end
local Vector2 = _G.Vector2 or function(x, y) return { x = x, y = y } end
local HA_CENTER = _G.HA_CENTER or 1
local VA_CENTER = _G.VA_CENTER or 1

local cache = _G.cache or {
    GetResource = function(_, resType, resPath) return resPath end
}

local UIFactory = {}

--- Create a chamfered container panel with 9-slice styling
function UIFactory.CreateChamferPanel(parent, width, height, posX, posY, borderColor, bgColor)
    local panel = BorderImage:new()
    panel:SetSize(width, height)
    panel:SetPosition(posX, posY)
    panel:SetTexture(cache:GetResource("Texture2D", "Textures/UI/ChamferFrame_9Slice.png"))
    panel:SetBorder(IntRect(16, 16, 16, 16))
    panel:SetImageBorder(IntRect(16, 16, 16, 16))
    panel:SetColor(borderColor or UITheme.Color.PanelBorder)
    panel.priority = 10
    if parent and parent.AddChild then
        parent:AddChild(panel)
    end
    return panel
end

--- Create an Esports Cyber Neon CTA Button with tactile feedback & requirement gating
function UIFactory.CreateCyberButton(parent, textStr, width, height, posX, posY, accentColor, onClickCallback, disabled, noteText)
    local btn = Button:new()
    btn:SetSize(width, height)
    btn:SetPosition(posX, posY)
    btn:SetTexture(cache:GetResource("Texture2D", "Textures/UI/CyberBtn_9Slice.png"))
    btn:SetBorder(IntRect(12, 12, 12, 12))
    
    local isDimmed = (disabled == true)
    btn:SetColor(isDimmed and UITheme.Color.DisabledBg or (accentColor or UITheme.Color.CyanPulse))
    btn.priority = 20

    local btnText = Text:new()
    btnText:SetFont(cache:GetResource("Font", UITheme.Font.Bold), UITheme.Font.SizeHeading)
    btnText:SetText(textStr)
    btnText:SetAlignment(HA_CENTER, VA_CENTER)
    btnText:SetColor(isDimmed and UITheme.Color.DisabledText or UITheme.Color.TextWhite)
    btn:AddChild(btnText)

    -- Contextual disabled requirement note
    if isDimmed and noteText and noteText ~= "" then
        local reqLabel = Text:new()
        reqLabel:SetFont(cache:GetResource("Font", UITheme.Font.Main), UITheme.Font.SizeMicro)
        reqLabel:SetText("⚠️ " .. noteText)
        reqLabel:SetAlignment(HA_CENTER, VA_CENTER)
        reqLabel:SetPosition(0, 24)
        reqLabel:SetColor(UITheme.Color.CrimsonAlert)
        btn:AddChild(reqLabel)
    end

    -- Tactile touch feedback: 0.96 scale depression & audio click cue
    btn:SubscribeToEvent("Pressed", function()
        if not isDimmed then
            btn:SetScale(Vector2(0.96, 0.96))
            if _G.audio then _G.audio:PlaySound2D("Audio/UI/Click_Cyber.wav") end
        end
    end)
    btn:SubscribeToEvent("Released", function()
        if not isDimmed then
            btn:SetScale(Vector2(1.0, 1.0))
            if onClickCallback then onClickCallback() end
        end
    end)

    if parent and parent.AddChild then
        parent:AddChild(btn)
    end
    return btn, btnText
end

--- Create a Neon Telemetry Progress Bar
function UIFactory.CreateProgressBar(parent, width, height, posX, posY, fillColor)
    local bg = BorderImage:new()
    bg:SetSize(width, height)
    bg:SetPosition(posX, posY)
    bg:SetColor(Color(0.05, 0.08, 0.12, 0.9))

    local bar = BorderImage:new()
    bar:SetSize(0, height)
    bar:SetColor(fillColor or UITheme.Color.CyanPulse)
    bg:AddChild(bar)

    local valText = Text:new()
    valText:SetFont(cache:GetResource("Font", UITheme.Font.Main), UITheme.Font.SizeSmall)
    valText:SetAlignment(HA_CENTER, VA_CENTER)
    valText:SetColor(UITheme.Color.TextWhite)
    bg:AddChild(valText)

    if parent and parent.AddChild then
        parent:AddChild(bg)
    end

    return {
        root = bg,
        SetProgress = function(self, ratio, labelText)
            local clamped = math.max(0.0, math.min(1.0, ratio))
            bar:SetSize(math.floor(width * clamped), height)
            if labelText then valText:SetText(labelText) end
        end
    }
end

--- Create a Tactical Section Header Card
function UIFactory.CreateTacticalCard(parent, width, height, posX, posY, titleStr, subtitleStr)
    local card = UIFactory.CreateChamferPanel(parent, width, height, posX, posY, UITheme.Color.PanelBorder)

    local titleText = Text:new()
    titleText:SetFont(cache:GetResource("Font", UITheme.Font.Bold), UITheme.Font.SizeBody)
    titleText:SetPosition(20, 16)
    titleText:SetText(titleStr or "")
    titleText:SetColor(UITheme.Color.TextWhite)
    card:AddChild(titleText)

    if subtitleStr and subtitleStr ~= "" then
        local subText = Text:new()
        subText:SetFont(cache:GetResource("Font", UITheme.Font.Main), UITheme.Font.SizeMicro)
        subText:SetPosition(width - 160, 18)
        subText:SetText(subtitleStr)
        subText:SetColor(UITheme.Color.CyanPulse)
        card:AddChild(subText)
    end

    return card
end

return UIFactory
