--[[
    ============================================================================
    UITheme.lua — Dark Sci-Fi Esports Cyber Neon Palette & Sizing
    ============================================================================
    Target Viewport: 1920x1080 Mobile Landscape (TapTap Maker UrhoX 2D Lua)
    Visual Language: 60-30-10 Dark Void Slate, Matte Gunmetal, Cyber Neon Telemetry
--]]

local Color = _G.Color or function(r, g, b, a) return { r = r, g = g, b = b, a = a or 1.0 } end

local UITheme = {}

-- 60-30-10 Color Tokens
UITheme.Color = {
    VoidBg       = Color(0.04, 0.06, 0.09, 1.0), -- #0A0F17 (60% Arena Surface)
    PanelBg      = Color(0.08, 0.11, 0.18, 0.95),-- #141C2E (30% Chamfer Panels)
    PanelBorder  = Color(0.12, 0.16, 0.25, 1.0), -- #1F2937 (Structural Border)
    PanelBorderAlt= Color(0.18, 0.25, 0.38, 1.0),
    CyanPulse    = Color(0.02, 0.71, 0.83, 1.0), -- #06B6D4 (10% Primary Action)
    CyanGlow     = Color(0.13, 0.83, 0.93, 0.35),-- #22D3EE (Hover/Active Glow)
    EmeraldWin   = Color(0.06, 0.73, 0.51, 1.0), -- #10B981 (Victory & Health)
    CrimsonAlert = Color(0.96, 0.25, 0.37, 1.0), -- #F43F5E (Fatigue & Defeat)
    CyberAmber   = Color(0.96, 0.62, 0.07, 1.0), -- #F59E0B (R&D Points & Trophies)
    TextWhite    = Color(0.95, 0.96, 0.98, 1.0), -- #F8FAFC (High Contrast)
    TextMuted    = Color(0.58, 0.64, 0.72, 1.0), -- #94A3B8 (Dimmed Telemetry)
    DisabledBg   = Color(0.10, 0.13, 0.20, 0.8),
    DisabledText = Color(0.38, 0.44, 0.52, 1.0),
}

UITheme.Font = {
    Main = "Fonts/SourceHanSansCN-Medium.otf",
    Bold = "Fonts/SourceHanSansCN-Bold.otf",
    SizeTitle = 28,
    SizeHeading = 22,
    SizeBody = 18,
    SizeSmall = 14,
    SizeMicro = 12,
}

UITheme.Layout = {
    ScreenWidth  = 1920,
    ScreenHeight = 1080,
    TopBarHeight = 90,
    SideMargin   = 40,
    BottomMargin = 40,
    MinTouchSize = 64, -- Baseline for 1920x1080 landscape ergonomics
    LeftFlankWidth = 460,
    RightFlankWidth = 400,
    CenterStageWidth = 920,
}

return UITheme
