--[[
    ============================================================================
    UITheme.lua — Dark Sci-Fi Cyber Neon Chamfered Design Tokens
    ============================================================================
    Target Viewport: 1920x1080 Mobile Landscape (TapTap Maker UrhoX 2D Lua)
    Art Style: Dark Cyberpunk Esports Arena (机能电竞 · 赛博霓虹 · 45°倒角机甲HUD)
--]]

local UITheme = {}

-- ---- 60-30-10 COLOR PALETTE TOKENS ------------------------------------------
UITheme.C = {
    -- 60% Arena Surface (Deep Obsidian Slate & Carbon Backplates)
    bg              = "#080C14", -- Deepest viewport abyss
    bgSubtle        = "#0B0F19", -- Main canvas background
    carbonBase      = "#0E1422", -- Base backdrop for major stage areas
    surface         = "#131B2A", -- Matte Gunmetal card surface
    surfaceAlt      = "#1A2337", -- Raised chamfered control panel
    surfaceInset    = "#0D131F", -- Recessed telemetry display slot

    -- 30% Structural Borders & Chamfer Outlines
    borderInactive  = "#1E293B", -- Dark slate structural border
    borderMuted     = "#26354D", -- Secondary division border
    borderActive    = "#06B6D4", -- Active neon cyan boundary (1px sharp)
    borderAccent    = "#F59E0B", -- Highlight amber boundary

    -- 10% Telemetry Accents (High Contrast Neon Accents)
    neonCyan        = "#06B6D4", -- Cyan Pulse: Primary interactions, active tabs
    neonCyanGlow    = "#22D3EE", -- Overclocked hover/active glow
    neonEmerald     = "#10B981", -- Electric Emerald: Victory, health, surplus
    neonEmeraldGlow = "#34D399", -- Recovery highlight
    neonRose        = "#F43F5E", -- Crimson Hazard: Defeat, critical fatigue, injury
    neonRoseGlow    = "#FB7185", -- Critical alert pulse
    neonAmber       = "#F59E0B", -- Cyber Amber: R&D tech points, trophies, gold
    neonAmberGlow   = "#FBBF24", -- Tier milestone glow
    neonViolet      = "#8B5CF6", -- Synergy link, roster synergy
    neonVioletGlow  = "#A78BFA", -- Synergy activation

    -- Text Contrast Hierarchy
    textPrimary     = "#F8FAFC", -- High-contrast primary reading text
    textSecondary   = "#94A3B8", -- Dimmed telemetry / labels
    textMuted       = "#64748B", -- Inactive descriptions / captions
    textHighlight   = "#38BDF8", -- Interactive keyword tint
}

-- ---- TYPOGRAPHY SCALE (1920x1080 Landscape Baseline) -------------------------
UITheme.Fonts = {
    heroTitle       = { size = 30, weight = "bold",   lineHeight = 1.2 },
    panelHeader     = { size = 20, weight = "bold",   lineHeight = 1.3 },
    sectionTitle    = { size = 16, weight = "bold",   lineHeight = 1.4 },
    bodyRegular     = { size = 14, weight = "normal", lineHeight = 1.5 },
    bodySemibold    = { size = 14, weight = "bold",   lineHeight = 1.4 },
    telemetryValue  = { size = 18, weight = "bold",   lineHeight = 1.1 },
    captionMicro    = { size = 12, weight = "normal", lineHeight = 1.3 },
    badgeText       = { size = 11, weight = "bold",   lineHeight = 1.1 },
}

-- ---- GEOMETRY & ERGONOMICS (1920x1080 Landscape) -----------------------------
UITheme.Layout = {
    baseWidth       = 1920,
    baseHeight      = 1080,
    safeAreaPadding = 48,  -- Safe notch inset on left/right for mobile landscape

    -- Top Master Telemetry Bar
    topBarHeight    = 76,

    -- Bottom Command Thumb Zones (Fitts's Law Ergonomics)
    bottomBarHeight = 90,
    flankZoneWidth  = 340, -- Left & right flank width for thumb controls

    -- Touch Target Minimums
    minTouchWidth   = 56,
    minTouchHeight  = 48,

    -- 45-Degree Chamfer Corner Tokens (Pixels)
    chamferSm       = 8,
    chamferMd       = 14,
    chamferLg       = 20,

    -- Hairline stroke thickness
    strokeHairline  = 1,
    strokeActive    = 2,
}

-- ---- STANDARD SIMPLIFIED CHINESE MICROCOPY -----------------------------------
UITheme.Microcopy = {
    -- Actions (Short, direct imperative verbs)
    matchQueue      = "开始匹配",
    studyVod        = "复盘研究",
    streamBootcamp  = "开启直播",
    restRecover     = "深度休整",
    physioCare      = "理疗康复",
    executeTactic   = "执行战术",
    scoutIntel      = "刺探情报",
    startScrim      = "战队约战",
    draftLock       = "锁定阵容",
    startResearch   = "启动研发",
    expandStadium   = "扩建场馆",
    confirmContract = "确认签约",
    worldTourBattle = "征战巡回",

    -- Status Tags
    stamina         = "精力体能",
    focus           = "竞技专注",
    rsiStrain       = "腱鞘负荷",
    mechanics       = "微操手速",
    gameSense       = "大局意识",
    rdPoints        = "科研点数",
    clubBudget      = "战队资金",
    synergyRating   = "羁绊默契",
}

return UITheme
