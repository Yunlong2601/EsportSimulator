--[[
    ============================================================================
    UIFactory.lua — Cyberpunk 45° Chamfered UI Component Factory
    ============================================================================
    Modular component generator for 1920x1080 landscape esports simulation.
    Includes ChamferPanel, NeonButton, TelemetryMeter, TacticalCard, and ActionGate.
--]]

local UI = require("urhox-libs/UI")
local T = require("ui.cyber.UITheme")

local UIFactory = {}

-- ============================================================================
-- 1. CHAMFER PANEL (45-Degree Chamfered Mech Panel)
-- ============================================================================
--- Creates a panel with 45-degree cut corners and cybernetic borders
---@param opts table: width, height, chamfer, backgroundColor, borderColor, children, etc.
function UIFactory.ChamferPanel(opts)
    opts = opts or {}
    local chamfer = opts.chamfer or T.Layout.chamferMd
    local bgColor = opts.backgroundColor or T.C.surface
    local borderColor = opts.borderColor or T.C.borderInactive
    local borderWidth = opts.borderWidth or T.Layout.strokeHairline

    -- Create native container using standard Panel
    local panel = UI.Panel {
        id = opts.id,
        width = opts.width,
        height = opts.height,
        flexGrow = opts.flexGrow,
        flexShrink = opts.flexShrink,
        flexBasis = opts.flexBasis,
        flexDirection = opts.flexDirection or "column",
        justifyContent = opts.justifyContent,
        alignItems = opts.alignItems,
        padding = opts.padding or 12,
        margin = opts.margin,
        gap = opts.gap or 8,
        backgroundColor = bgColor,
        borderColor = borderColor,
        borderWidth = borderWidth,
        borderRadius = chamfer, -- Graceful fallback for layout
        overflow = opts.overflow,
        children = opts.children or {},
    }

    -- NanoVG Custom 45° Chamfer Polygon Override
    local originalRender = panel.Render
    panel.Render = function(self, nvg)
        if nvg and type(nvgBeginPath) == "function" then
            local l = self:GetAbsoluteLayout()
            local c = chamfer
            local x, y, w, h = l.x, l.y, l.w, l.h

            -- Clamp chamfer to half of dimensions
            if c * 2 > w or c * 2 > h then
                c = math.min(w, h) * 0.25
            end

            -- Begin 45° Octagonal Chamfer Contour
            nvgBeginPath(nvg)
            nvgMoveTo(nvg, x + c, y)
            nvgLineTo(nvg, x + w - c, y)
            nvgLineTo(nvg, x + w, y + c)
            nvgLineTo(nvg, x + w, y + h - c)
            nvgLineTo(nvg, x + w - c, y + h)
            nvgLineTo(nvg, x + c, y + h)
            nvgLineTo(nvg, x, y + h - c)
            nvgLineTo(nvg, x, y + c)
            nvgClosePath(nvg)

            -- Fill Background
            if bgColor and type(nvgFillColor) == "function" then
                -- Support hex/rgba in NanoVG if available
                pcall(function()
                    nvgFillColor(nvg, nvgRGBA(19, 27, 42, 235))
                    nvgFill(nvg)
                end)
            end

            -- Stroke Border
            if borderWidth > 0 and type(nvgStrokeColor) == "function" then
                pcall(function()
                    nvgStrokeWidth(nvg, borderWidth)
                    nvgStrokeColor(nvg, nvgRGBA(6, 182, 212, 180))
                    nvgStroke(nvg)
                end)
            end
        else
            -- Headless or standard fallback
            if originalRender then
                originalRender(self, nvg)
            end
        end
    end

    return panel
end

-- ============================================================================
-- 2. NEON BUTTON (Cybernetic Glow Touch Target)
-- ============================================================================
--- Creates high-contrast button with >= 48px touch hitbox and tactile feedback
---@param text string
---@param onClick function
---@param opts table: variant ('cyan'|'emerald'|'rose'|'amber'|'ghost'), height, disabled, reason
function UIFactory.NeonButton(text, onClick, opts)
    opts = opts or {}
    local variant = opts.variant or "cyan"
    local disabled = opts.disabled == true
    local height = math.max(opts.height or 48, T.Layout.minTouchHeight)
    local width = opts.width

    local bgMap = {
        cyan    = disabled and "#1E293B" or "#06B6D4",
        emerald = disabled and "#1E293B" or "#10B981",
        rose    = disabled and "#1E293B" or "#F43F5E",
        amber   = disabled and "#1E293B" or "#F59E0B",
        ghost   = "#131B2A",
    }

    local textMap = {
        cyan    = disabled and "#64748B" or "#080C14",
        emerald = disabled and "#64748B" or "#080C14",
        rose    = disabled and "#64748B" or "#FFFFFF",
        amber   = disabled and "#64748B" or "#080C14",
        ghost   = disabled and "#475569" or "#38BDF8",
    }

    local borderMap = {
        cyan    = disabled and "#334155" or "#22D3EE",
        emerald = disabled and "#334155" or "#34D399",
        rose    = disabled and "#334155" or "#FB7185",
        amber   = disabled and "#334155" or "#FBBF24",
        ghost   = disabled and "#1E293B" or "#06B6D4",
    }

    local btn = UI.Button {
        id = opts.id,
        text = text,
        width = width,
        height = height,
        flexGrow = opts.flexGrow,
        flexShrink = opts.flexShrink,
        flexBasis = opts.flexBasis,
        fontSize = opts.fontSize or 15,
        fontWeight = "bold",
        backgroundColor = bgMap[variant] or bgMap.cyan,
        textColor = textMap[variant] or textMap.cyan,
        borderColor = borderMap[variant] or borderMap.cyan,
        borderWidth = (variant == "ghost" or disabled) and 1 or 2,
        borderRadius = opts.borderRadius or 6,
        disabled = disabled,
        onClick = function(self)
            if not disabled and onClick then
                onClick()
            end
        end,
    }

    return btn
end

-- ============================================================================
-- 3. TELEMETRY METER (Segmented Dual Progress Bar)
-- ============================================================================
--- Visual progress meter for Stamina, Focus, RSI Strain, R&D Tech Points
---@param label string
---@param current number
---@param max number
---@param opts table: variant ('cyan'|'emerald'|'rose'|'amber'), unit
function UIFactory.TelemetryMeter(label, current, max, opts)
    opts = opts or {}
    max = max or 100
    current = math.max(0, math.min(current or 0, max))
    local pct = math.floor((current / max) * 100)
    local variant = opts.variant or (pct > 50 and "emerald" or (pct > 20 and "amber" or "rose"))

    local barColorMap = {
        cyan    = T.C.neonCyan,
        emerald = T.C.neonEmerald,
        amber   = T.C.neonAmber,
        rose    = T.C.neonRose,
    }

    local fillWidth = string.format("%d%%", pct)

    return UI.Panel {
        width = opts.width or "100%",
        flexDirection = "column",
        gap = 4,
        margin = opts.margin,
        children = {
            UI.Panel {
                width = "100%",
                flexDirection = "row",
                justifyContent = "space-between",
                alignItems = "center",
                children = {
                    UI.Label {
                        text = label,
                        fontSize = 12,
                        fontColor = T.C.textSecondary,
                        fontWeight = "bold",
                    },
                    UI.Label {
                        text = string.format("%d/%d %s", current, max, opts.unit or ""),
                        fontSize = 12,
                        fontColor = barColorMap[variant] or T.C.neonCyan,
                        fontWeight = "bold",
                    },
                }
            },
            -- Track Bar Slot
            UI.Panel {
                width = "100%",
                height = opts.height or 8,
                backgroundColor = T.C.surfaceInset,
                borderColor = T.C.borderInactive,
                borderWidth = 1,
                borderRadius = 4,
                overflow = "hidden",
                children = {
                    -- Active Fill
                    UI.Panel {
                        width = fillWidth,
                        height = "100%",
                        backgroundColor = barColorMap[variant] or T.C.neonCyan,
                        borderRadius = 3,
                    }
                }
            }
        }
    }
end

-- ============================================================================
-- 4. TACTICAL CARD (Chamfered Telemetry Container)
-- ============================================================================
--- Card with cyber brackets, subtitle chip, and high-density stats
---@param title string
---@param subtitle string|nil
---@param children table
---@param opts table
function UIFactory.TacticalCard(title, subtitle, children, opts)
    opts = opts or {}
    local headerChildren = {
        UI.Label {
            text = title,
            fontSize = 16,
            fontWeight = "bold",
            fontColor = opts.titleColor or T.C.textPrimary,
        }
    }

    if subtitle then
        table.insert(headerChildren, UI.Panel {
            backgroundColor = T.C.surfaceInset,
            padding = { top = 2, bottom = 2, left = 8, right = 8 },
            borderColor = T.C.borderMuted,
            borderWidth = 1,
            borderRadius = 4,
            children = {
                UI.Label {
                    text = subtitle,
                    fontSize = 11,
                    fontColor = T.C.neonCyan,
                    fontWeight = "bold",
                }
            }
        })
    end

    local cardNodes = {
        UI.Panel {
            width = "100%",
            flexDirection = "row",
            justifyContent = "space-between",
            alignItems = "center",
            paddingBottom = 6,
            borderColor = T.C.borderInactive,
            borderBottomWidth = 1,
            children = headerChildren,
        }
    }

    if children then
        for _, child in ipairs(children) do
            table.insert(cardNodes, child)
        end
    end

    return UIFactory.ChamferPanel {
        width = opts.width or "100%",
        flexGrow = opts.flexGrow,
        flexShrink = opts.flexShrink,
        backgroundColor = opts.backgroundColor or T.C.surface,
        borderColor = opts.borderColor or T.C.borderInactive,
        chamfer = opts.chamfer or T.Layout.chamferSm,
        padding = opts.padding or 14,
        gap = opts.gap or 10,
        children = cardNodes,
    }
end

-- ============================================================================
-- 5. ACTION GATE (Zero-Confusion Error Recovery Validation)
-- ============================================================================
--- Contextual validator that disables buttons with explicit explanation banners
---@param condition boolean
---@param missingText string
---@param buttonLabel string
---@param onExecute function
---@param opts table
function UIFactory.ActionGate(condition, missingText, buttonLabel, onExecute, opts)
    opts = opts or {}
    local nodes = {}

    if not condition and missingText and missingText ~= "" then
        table.insert(nodes, UI.Panel {
            width = "100%",
            backgroundColor = "#241216",
            borderColor = T.C.neonRose,
            borderWidth = 1,
            borderRadius = 4,
            padding = { top = 4, bottom = 4, left = 8, right = 8 },
            marginBottom = 4,
            children = {
                UI.Label {
                    text = "⚠️ " .. missingText,
                    fontSize = 12,
                    fontColor = T.C.neonRoseGlow,
                }
            }
        })
    end

    table.insert(nodes, UIFactory.NeonButton(buttonLabel, onExecute, {
        disabled = not condition,
        variant = opts.variant or (condition and "cyan" or "ghost"),
        width = opts.width or "100%",
        height = opts.height or 48,
        fontSize = opts.fontSize or 14,
    }))

    return UI.Panel {
        width = opts.containerWidth or "100%",
        flexDirection = "column",
        children = nodes,
    }
end

return UIFactory
