-- DesignSystem.lua — Carbon Ember design tokens + primitives (rebuilt from wireframe spec)
-- Wireframe color language: EMBER #ff6a3d (single warm CTA), GOLD #f5b942 (accent),
-- dark surfaces #161a22 / #1d2230 / #141821, borders #2a3040, text #e6e9ef/#cdd3dd/#9aa4b2.
local UI = require("urhox-libs/UI")

local DesignSystem = {}

-- ---- color tokens ----------------------------------------------------------
DesignSystem.C = {
    ember       = "#ff6a3d",   -- primary CTA (warm, single accent)
    emberDim    = "#c44a26",
    gold        = "#f5b942",   -- secondary / accent
    bg          = "#10131a",   -- app background
    surface     = "#161a22",   -- card / panel
    surfaceAlt  = "#1d2230",   -- raised surface
    inset       = "#141821",   -- sunken / caption
    border      = "#2a3040",   -- hairline borders
    text        = "#e6e9ef",   -- primary text
    textDim     = "#cdd3dd",   -- secondary text
    muted       = "#c8ced8",   -- tertiary / captions (brightened for dark surfaces)
    faint       = "#b4bcc8",   -- placeholder / italic (brightened for dark surfaces)
    success     = "#36d399",
    warning     = "#f5b942",
    error       = "#ff5c5c",
    info        = "#4da6ff",
    role_coach  = "#4da6ff",
    role_analyst= "#36d399",
    role_scout  = "#f5b942",
    role_medic  = "#ff6a8b",
    role_top    = "#ff6a3d",
    role_jug    = "#36d399",
    role_mid    = "#4da6ff",
    role_adc    = "#f5b942",
    role_sup    = "#c08bff",
}

-- ---- spacing scale (4px base, matches wireframe density) --------------------
DesignSystem.S = {
    xs = 4, sm = 8, md = 12, lg = 16, xl = 20, xxl = 24,
    radius = 10, radiusSm = 8, radiusLg = 14,
}

-- role badge -> color
DesignSystem.ROLE_COLOR = function(role)
    local map = {
        ["主教练"] = DesignSystem.C.role_coach, ["分析师"] = DesignSystem.C.role_analyst,
        ["星探"]   = DesignSystem.C.role_scout,   ["理疗师"] = DesignSystem.C.role_medic,
        ["上单"]   = DesignSystem.C.role_top,     ["打野"]   = DesignSystem.C.role_jug,
        ["中单"]   = DesignSystem.C.role_mid,     ["射手"]   = DesignSystem.C.role_adc,
        ["辅助"]   = DesignSystem.C.role_sup,
    }
    return map[role] or DesignSystem.C.muted
end

-- ---- primitives ------------------------------------------------------------
-- Label: returns a configured text node.
function DesignSystem.Label(text, opts)
    opts = opts or {}
    local node = UI.Label {
        text = text or "",
        fontSize = opts.fontSize or 13,
        fontColor = opts.fontColor or DesignSystem.C.text,
        fontWeight = opts.fontWeight or "normal",
        flexGrow = opts.flexGrow,
        flexShrink = opts.flexShrink,
        flexBasis = opts.flexBasis,
        flex = opts.flex,
        width = opts.width,
        height = opts.height,
        textAlign = opts.textAlign,
        whiteSpace = opts.whiteSpace,
        numberOfLines = opts.numberOfLines,
        letterSpacing = opts.letterSpacing,
        lineHeight = opts.lineHeight,
    }
    return node
end

-- Card: a surface panel with border + radius.
function DesignSystem.Card(opts)
    opts = opts or {}
    return UI.Panel {
        backgroundColor = opts.backgroundColor or DesignSystem.C.surface,
        borderWidth = opts.borderWidth ~= nil and opts.borderWidth or 1,
        borderColor = opts.borderColor or DesignSystem.C.border,
        borderRadius = opts.borderRadius or DesignSystem.S.radius,
        padding = opts.padding or DesignSystem.S.md,
        flexDirection = opts.flexDirection or "column",
        gap = opts.gap or DesignSystem.S.sm,
        flexGrow = opts.flexGrow,
        flexBasis = opts.flexBasis,
        width = opts.width,
        height = opts.height,
        alignItems = opts.alignItems,
        children = opts.children or {},
    }
end

-- Button: ember CTA or ghost secondary.
function DesignSystem.Button(label, onClick, opts)
    opts = opts or {}
    local primary = opts.variant ~= "secondary"
    return UI.Button {
        text = label or "",
        onClick = onClick,
        height = opts.height or 40,
        -- NOTE: never use named color "transparent" — Style.ParseColor only
        -- understands #hex / rgb() / rgba(), so it stays a string and
        -- Button:Init's Style.Lighten crashes on nil color[1].
        -- #00000000 parses to {0,0,0,0}: fully transparent, crash-safe.
        backgroundColor = primary and DesignSystem.C.ember or (opts.backgroundColor or "#00000000"),
        borderWidth = primary and 0 or 1,
        borderColor = primary and DesignSystem.C.ember or (opts.borderColor or DesignSystem.C.border),
        borderRadius = opts.borderRadius or DesignSystem.S.radiusSm,
        textColor = primary and "#1a0e08" or (opts.textColor or DesignSystem.C.gold),
        fontSize = opts.fontSize or 14,
        fontWeight = opts.fontWeight or "bold",
        flexGrow = opts.flexGrow,
        width = opts.width,
    }
end

-- Section header with optional right-action text.
function DesignSystem.SectionHeader(title, right, onRight)
    local children = {
        DesignSystem.Label(title, { fontSize = 13, fontWeight = "bold", fontColor = DesignSystem.C.text }),
    }
    if type(onRight) == "function" then
        -- real, tappable action (e.g. a sectionhdr that carries a rightTarget)
        table.insert(children, UI.Button {
            text = right, variant = "secondary", height = 28,
            backgroundColor = "#00000000", borderWidth = 0,
            textColor = DesignSystem.C.gold, fontSize = 11,
            onClick = onRight,
        })
    elseif right and right ~= "" then
        -- no callable callback: render as a static muted label, never a fake dead button
        table.insert(children, DesignSystem.Label(right, { fontSize = 11, fontColor = DesignSystem.C.muted }))
    end
    return UI.Panel {
        width = "100%", flexDirection = "row", alignItems = "center",
        justifyContent = "space-between", marginTop = DesignSystem.S.sm,
        children = children,
    }
end

-- Status chip / pill.
function DesignSystem.Chip(text, opts)
    opts = opts or {}
    return UI.Panel {
        flexDirection = "row", alignItems = "center", gap = 4,
        paddingLeft = 8, paddingRight = 8, paddingTop = 4, paddingBottom = 4,
        backgroundColor = opts.backgroundColor or DesignSystem.C.inset,
        borderWidth = 1, borderColor = opts.borderColor or DesignSystem.C.border,
        borderRadius = 999,
        children = {
            DesignSystem.Label(text, { fontSize = opts.fontSize or 10, fontColor = opts.fontColor or DesignSystem.C.muted }),
        },
    }
end

-- Empty state placeholder.
function DesignSystem.EmptyState(title, desc)
    return DesignSystem.Card {
        alignItems = "center", padding = DesignSystem.S.xl,
        children = {
            DesignSystem.Label(title or "暂无内容", { fontSize = 13, fontColor = DesignSystem.C.muted, textAlign = "center" }),
            desc and DesignSystem.Label(desc, { fontSize = 10, fontColor = DesignSystem.C.faint, textAlign = "center", marginTop = 4 }) or nil,
        },
    }
end

-- Alert / highlight box.
function DesignSystem.AlertBox(lines, opts)
    opts = opts or {}
    local bg = opts.backgroundColor or "#1c251c"
    local bd = opts.borderColor or "#2a4a2a"
    local children = {}
    for _, ln in ipairs(lines or {}) do
        table.insert(children, DesignSystem.Label(ln[1], { fontSize = 10, fontColor = ln[2] or DesignSystem.C.success }))
    end
    return UI.Panel {
        width = "100%", flexDirection = "column", gap = 3,
        padding = DesignSystem.S.sm, backgroundColor = bg,
        borderWidth = 1, borderColor = bd, borderRadius = DesignSystem.S.radiusSm,
        children = children,
    }
end

-- Crash-safe, asset-free icon stand-in.
-- ROOT CAUSE: urhox-libs/UI v1.1.0 exports NO `UI.Image` widget (the project
-- doc references a newer API that has it), and the Kenney PNG icons are NOT
-- bundled in this repo (image/icons/PNG/512/ is absent, zero PNGs under image/).
-- The original `UI.Image{ src = "image/icons/...", ... }` call therefore hit a
-- nil field and crashed the whole UI on the first icon-bearing block
-- (DesignSystem.IconImage -> WireframeKit -> DashboardScreen.Build).
-- FIX: render a tinted monogram inside a transparent, fixed-size box using only
-- proven UI.Panel/UI.Label APIs. No external assets, no nil calls.
-- Swap to a sprite-sheet-backed renderer once real icon assets are added.
DesignSystem.ICON_MONO = {
    cash = "$", rank = "#", power = "P", roster = "R", trophy = "T",
    calendar = "D", star = "*", search = "S", fire = "F", shield = "S",
    heart = "H", bolt = "B", coin = "C", users = "U", target = "+",
    flag = "F", clock = "T", bell = "!", info = "i", check = "v",
    down = "v", up = "^", left = "<", right = ">", home = "H",
    league = "L", market = "M", coach = "K", academy = "A", draft = ">",
    train = "T", locker = "O", legacy = "X", dynasty = "Y", rival = "R",
    career = "J", finance = "$", stock = "$", sponsor = "S", fan = "F",
}
function DesignSystem.IconImage(name, opts)
    opts = opts or {}
    local w = opts.width or 20
    local h = opts.height or 20
    local tint = opts.tintColor or "#ffffff"
    local mono = DesignSystem.ICON_MONO[name]
    if not mono then
        -- Font-safe fallback: first ASCII letter uppercased (ASCII 0x20-0x7E is
        -- guaranteed in the subset font; avoids any tofu glyphs).
        mono = (name and name:match("^%a")) and name:match("^%a"):upper() or "*"
    end
    return UI.Panel {
        width = w, height = h, flexShrink = 0,
        flexDirection = "row", alignItems = "center", justifyContent = "center",
        children = {
            UI.Label {
                text = mono,
                fontSize = math.max(10, math.floor(math.min(w, h) * 0.62)),
                fontColor = tint,
                fontWeight = "bold",
            },
        },
    }
end

-- Currency formatter: 1.7亿 / 400万 / -4854万
function DesignSystem.FormatCash(n)
    n = tonumber(n) or 0
    local neg = n < 0
    local a = math.abs(n)
    local s
    if a >= 1e8 then s = string.format("%.1f亿", a / 1e8)
    elseif a >= 1e4 then s = string.format("%d万", a / 1e4)
    else s = string.format("%d", a) end
    return (neg and "-" or "") .. "¥" .. s
end

return DesignSystem
