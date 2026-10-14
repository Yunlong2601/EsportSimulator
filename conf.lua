--[[
    ============================================================================
    TAPTAP MAKE / LOVE2D CONFIGURATION (conf.lua)
    ============================================================================
    Target: TapTap Make Mobile Portrait Game Engine
    Resolution: 390 x 844 (Standard Mobile Portrait Viewport)
--]]

function love.conf(t)
    t.identity = "esports_legacy_taptap_make"
    t.version = "11.4"
    t.console = true
    t.accelerometerjoystick = false
    t.externalstorage = true
    t.gammacorrect = false

    -- Window / Mobile Viewport
    t.window.title = "电竞传奇：登顶世界赛 (TapTap Make)"
    t.window.icon = nil
    t.window.width = 390
    t.window.height = 844
    t.window.borderless = false
    t.window.resizable = false
    t.window.minwidth = 360
    t.window.minheight = 640
    t.window.fullscreen = false
    t.window.fullscreentype = "desktop"
    t.window.vsync = 1
    t.window.msaa = 0
    t.window.display = 1
    t.window.highdpi = true

    -- Modules
    t.modules.audio = true
    t.modules.event = true
    t.modules.graphics = true
    t.modules.image = true
    t.modules.joystick = false
    t.modules.keyboard = true
    t.modules.math = true
    t.modules.mouse = true
    t.modules.physics = false
    t.modules.sound = true
    t.modules.system = true
    t.modules.timer = true
    t.modules.touch = true
    t.modules.video = false
    t.modules.window = true
    t.modules.thread = true
end
