-- DesignSystem.lua — Carbon Ember design tokens + primitives (rebuilt from wireframe spec)
-- Wireframe color language: EMBER #ff6a3d (single warm CTA), GOLD #f5b942 (accent),
-- dark surfaces #161a22 / #1d2230 / #141821, borders #2a3040, text #e6e9ef/#cdd3dd/#9aa4b2.
local UI = require("urhox-libs/UI")

local DesignSystem = {}

-- Safe sound manager loader for UI click audio
local _soundManager = nil
local ok_sm, sm_mod = pcall(require, "lua.sound_manager")
if ok_sm and sm_mod then _soundManager = sm_mod else
    local ok_sm2, sm_mod2 = pcall(require, "scripts.lua.sound_manager")
    if ok_sm2 and sm_mod2 then _soundManager = sm_mod2 end
end

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
    tier_sss    = "#f5b942",
    tier_s      = "#c08bff",
    tier_a      = "#4da6ff",
    tier_b      = "#9aa4b2",
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
        ["TOP"]    = DesignSystem.C.role_top,     ["JUG"]    = DesignSystem.C.role_jug,
        ["MID"]    = DesignSystem.C.role_mid,     ["ADC"]    = DesignSystem.C.role_adc,
        ["SUP"]    = DesignSystem.C.role_sup,
    }
    return map[role] or DesignSystem.C.muted
end

-- tier badge -> color
DesignSystem.TIER_COLOR = function(tier)
    local map = {
        ["SSS"] = DesignSystem.C.tier_sss,
        ["SS"]  = DesignSystem.C.tier_sss,
        ["S"]   = DesignSystem.C.tier_s,
        ["A"]   = DesignSystem.C.tier_a,
        ["B"]   = DesignSystem.C.tier_b,
        ["C"]   = DesignSystem.C.muted,
    }
    return map[tier] or DesignSystem.C.muted
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
        marginTop = opts.marginTop,
        marginBottom = opts.marginBottom,
        marginLeft = opts.marginLeft,
        marginRight = opts.marginRight,
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
        justifyContent = opts.justifyContent,
        marginTop = opts.marginTop,
        marginBottom = opts.marginBottom,
        children = opts.children or {},
    }
end

-- Button: ember CTA or ghost secondary with tactile sound hook.
function DesignSystem.Button(label, onClick, opts)
    opts = opts or {}
    local primary = opts.variant ~= "secondary"
    local disabled = opts.disabled == true

    local wrappedOnClick = function()
        if disabled then return end
        if _soundManager and _soundManager.PlaySFX then
            pcall(function() _soundManager.PlaySFX("CLICK") end)
        end
        if onClick then onClick() end
    end

    local bgCol = primary and DesignSystem.C.ember or (opts.backgroundColor or "#00000000")
    local bdCol = primary and DesignSystem.C.ember or (opts.borderColor or DesignSystem.C.border)
    local txtCol = primary and "#1a0e08" or (opts.textColor or DesignSystem.C.gold)

    if disabled then
        bgCol = "#1d2230"
        bdCol = "#2a3040"
        txtCol = "#606877"
    end

    return UI.Button {
        text = label or "",
        onClick = wrappedOnClick,
        height = opts.height or 40,
        backgroundColor = bgCol,
        borderWidth = (primary and not disabled) and 0 or 1,
        borderColor = bdCol,
        borderRadius = opts.borderRadius or DesignSystem.S.radiusSm,
        textColor = txtCol,
        fontSize = opts.fontSize or 14,
        fontWeight = opts.fontWeight or "bold",
        flexGrow = opts.flexGrow,
        flexBasis = opts.flexBasis,
        width = opts.width,
        marginTop = opts.marginTop,
        marginBottom = opts.marginBottom,
    }
end

-- Section header with optional right-action text.
function DesignSystem.SectionHeader(title, right, onRight)
    local children = {
        DesignSystem.Label(title, { fontSize = 13, fontWeight = "bold", fontColor = DesignSystem.C.text }),
    }
    if type(onRight) == "function" then
        table.insert(children, UI.Button {
            text = right, variant = "secondary", height = 28,
            backgroundColor = "#00000000", borderWidth = 0,
            textColor = DesignSystem.C.gold, fontSize = 11,
            onClick = function()
                if _soundManager and _soundManager.PlaySFX then
                    pcall(function() _soundManager.PlaySFX("CLICK") end)
                end
                onRight()
            end,
        })
    elseif right and right ~= "" then
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
            DesignSystem.Label(text, { fontSize = opts.fontSize or 10, fontColor = opts.fontColor or DesignSystem.C.muted, fontWeight = opts.fontWeight }),
        },
    }
end

-- Procedural Cyber Badge (sharp geometric badge with high-contrast aura)
function DesignSystem.CyberBadge(label, opts)
    opts = opts or {}
    local bg = opts.backgroundColor or DesignSystem.C.inset
    local bd = opts.borderColor or DesignSystem.C.border
    local col = opts.fontColor or DesignSystem.C.text
    local fs = opts.fontSize or 10

    if opts.tier then
        bd = DesignSystem.TIER_COLOR(opts.tier)
        col = bd
        bg = "#18141e"
    elseif opts.role then
        bd = DesignSystem.ROLE_COLOR(opts.role)
        col = bd
        bg = "#121a22"
    elseif opts.variant == "gold" then
        bd = DesignSystem.C.gold
        col = DesignSystem.C.gold
        bg = "#221c10"
    elseif opts.variant == "ember" then
        bd = DesignSystem.C.ember
        col = DesignSystem.C.ember
        bg = "#261410"
    end

    return UI.Panel {
        flexDirection = "row", alignItems = "center", justifyContent = "center",
        paddingLeft = opts.paddingX or 6, paddingRight = opts.paddingX or 6,
        paddingTop = opts.paddingY or 2, paddingBottom = opts.paddingY or 2,
        backgroundColor = bg, borderWidth = 1, borderColor = bd,
        borderRadius = opts.borderRadius or 4,
        width = opts.width, height = opts.height,
        children = {
            DesignSystem.Label(label or "", { fontSize = fs, fontColor = col, fontWeight = "bold" }),
        }
    }
end

-- Energy Battery Bar (3-stage segmented/gradient battery meter)
function DesignSystem.EnergyBattery(current, maxVal, opts)
    current = tonumber(current) or 0
    maxVal = tonumber(maxVal) or 100
    local pct = math.max(0, math.min(1, current / math.max(1, maxVal)))
    local col = DesignSystem.C.success
    if pct < 0.3 then col = DesignSystem.C.error
    elseif pct < 0.6 then col = DesignSystem.C.warning end

    local barWidth = (opts and opts.width) or 100
    local barHeight = (opts and opts.height) or 12

    return UI.Panel {
        flexDirection = "row", alignItems = "center", gap = 6,
        children = {
            -- Battery shell
            UI.Panel {
                width = barWidth, height = barHeight,
                backgroundColor = "#0e1218",
                borderWidth = 1, borderColor = col, borderRadius = 3,
                padding = 1, flexDirection = "row", alignItems = "center",
                children = {
                    UI.Panel {
                        width = string.format("%d%%", math.floor(pct * 100)),
                        height = "100%", backgroundColor = col, borderRadius = 2,
                    }
                }
            },
            -- Cap
            UI.Panel {
                width = 3, height = math.floor(barHeight * 0.6),
                backgroundColor = col, borderRadius = 1,
            },
            -- Percentage label
            DesignSystem.Label(string.format("%d/%d", current, maxVal), {
                fontSize = 10, fontColor = col, fontWeight = "bold"
            })
        }
    }
end

-- LP / Rank Progress Bar
function DesignSystem.LPGauge(lp, maxLp, opts)
    lp = tonumber(lp) or 0
    maxLp = tonumber(maxLp) or 100
    local pct = math.max(0, math.min(1, lp / math.max(1, maxLp)))
    local barHeight = (opts and opts.height) or 8

    return UI.Panel {
        width = "100%", flexDirection = "column", gap = 4,
        children = {
            UI.Panel {
                width = "100%", height = barHeight,
                backgroundColor = "#121620",
                borderWidth = 1, borderColor = DesignSystem.C.border, borderRadius = 4,
                padding = 1,
                children = {
                    UI.Panel {
                        width = string.format("%d%%", math.floor(pct * 100)),
                        height = "100%",
                        backgroundColor = DesignSystem.C.gold,
                        borderRadius = 3,
                    }
                }
            }
        }
    }
end

-- Commercial Action Tile (Split-Row pattern: left icon & details, right compact CTA button)
function DesignSystem.ActionTile(opts)
    opts = opts or {}
    local disabled = opts.disabled == true
    local costStr = opts.cost and string.format("¥%s", opts.cost) or opts.costText

    local leftNodes = {
        UI.Panel {
            flexDirection = "row", alignItems = "center", gap = 6,
            children = {
                opts.badge and DesignSystem.CyberBadge(opts.badge, { variant = opts.badgeVariant or "gold", tier = opts.tier, role = opts.role }) or nil,
                DesignSystem.Label(opts.title or "", { fontSize = 12, fontWeight = "bold", fontColor = disabled and DesignSystem.C.muted or DesignSystem.C.text }),
                opts.tag and DesignSystem.Chip(opts.tag, { fontSize = 9, fontColor = DesignSystem.C.success, borderColor = DesignSystem.C.success }) or nil,
            }
        }
    }

    if opts.desc and opts.desc ~= "" then
        table.insert(leftNodes, DesignSystem.Label(opts.desc, {
            fontSize = 10, fontColor = DesignSystem.C.textDim, marginTop = 2, numberOfLines = 2
        }))
    end

    local ctaText = opts.actionLabel or "执行"
    if costStr then
        ctaText = string.format("%s · %s", costStr, ctaText)
    end

    return DesignSystem.Card {
        backgroundColor = opts.backgroundColor or (disabled and "#12151c" or DesignSystem.C.surface),
        borderColor = disabled and DesignSystem.C.border or (opts.borderColor or DesignSystem.C.border),
        padding = DesignSystem.S.sm,
        flexDirection = "row", alignItems = "center", justifyContent = "space-between", gap = 8,
        children = {
            -- Left info column
            UI.Panel {
                flexDirection = "column", flexGrow = 1, flexBasis = 0,
                children = leftNodes,
            },
            -- Right action button
            DesignSystem.Button(ctaText, opts.onAction, {
                variant = opts.variant or (disabled and "secondary" or "primary"),
                disabled = disabled,
                height = 34, fontSize = 11,
                width = opts.btnWidth or 100,
            })
        }
    }
end

-- Collectible Esports Player Card (Rarity frame, role badge, stats, battery)
function DesignSystem.PlayerCard(p, opts)
    opts = opts or {}
    local tier = p.tier or "A"
    local bdCol = DesignSystem.TIER_COLOR(tier)
    local bgCol = (tier == "SSS" or tier == "SS") and "#201810" or ((tier == "S") and "#1c1424" or DesignSystem.C.surface)

    return UI.Panel {
        width = "100%", backgroundColor = bgCol,
        borderWidth = 1, borderColor = bdCol, borderRadius = DesignSystem.S.radiusSm,
        padding = DesignSystem.S.sm, flexDirection = "column", gap = 6,
        children = {
            -- Top row: Role, Name, OVR
            UI.Panel {
                width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                children = {
                    UI.Panel {
                        flexDirection = "row", alignItems = "center", gap = 6,
                        children = {
                            DesignSystem.CyberBadge(p.role or "MID", { role = p.role }),
                            DesignSystem.Label(p.name or "青训新星", { fontSize = 13, fontWeight = "bold", fontColor = DesignSystem.C.text }),
                            DesignSystem.CyberBadge(tier, { tier = tier }),
                        }
                    },
                    DesignSystem.Label(string.format("★ %d ★", p.ovr or p.mechanics or 80), {
                        fontSize = 13, fontWeight = "bold", fontColor = bdCol
                    })
                }
            },
            -- Bottom row: Stats pills & Energy
            UI.Panel {
                width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                children = {
                    UI.Panel {
                        flexDirection = "row", gap = 4,
                        children = {
                            DesignSystem.Chip(string.format("微操 %d", p.mechanics or 80), { fontSize = 9, fontColor = DesignSystem.C.ember, borderColor = DesignSystem.C.ember }),
                            DesignSystem.Chip(string.format("意识 %d", p.awareness or 80), { fontSize = 9, fontColor = DesignSystem.C.info, borderColor = DesignSystem.C.info }),
                            DesignSystem.Chip(string.format("心态 %d", p.mentality or 80), { fontSize = 9, fontColor = DesignSystem.C.success, borderColor = DesignSystem.C.success }),
                        }
                    },
                    p.energy and DesignSystem.EnergyBattery(p.energy, 100, { width = 45, height = 8 }) or nil
                }
            }
        }
    }
end

-- Next Objective (今日核心指令) Hero Card on HQ
function DesignSystem.ObjectiveCard(title, desc, actionLabel, onAction, opts)
    opts = opts or {}
    return UI.Panel {
        width = "100%",
        backgroundColor = "#1f1510",
        borderWidth = 1.5, borderColor = DesignSystem.C.ember,
        borderRadius = DesignSystem.S.radius, padding = DesignSystem.S.md,
        flexDirection = "column", gap = 8,
        children = {
            UI.Panel {
                width = "100%", flexDirection = "row", justifyContent = "space-between", alignItems = "center",
                children = {
                    UI.Panel {
                        flexDirection = "row", alignItems = "center", gap = 6,
                        children = {
                            DesignSystem.CyberBadge("今日核心指令", { variant = "ember" }),
                            opts.tag and DesignSystem.Chip(opts.tag, { fontColor = DesignSystem.C.gold, borderColor = DesignSystem.C.gold }) or nil,
                        }
                    },
                    DesignSystem.Label("⚡ 优先推进", { fontSize = 10, fontColor = DesignSystem.C.ember, fontWeight = "bold" }),
                }
            },
            DesignSystem.Label(title or "", { fontSize = 14, fontWeight = "bold", fontColor = DesignSystem.C.text }),
            desc and DesignSystem.Label(desc, { fontSize = 11, fontColor = DesignSystem.C.textDim }) or nil,
            DesignSystem.Button(actionLabel or "即刻出征", onAction, {
                height = 38, fontSize = 13, backgroundColor = DesignSystem.C.ember, textColor = "#1a0e08",
            })
        }
    }
end

-- Floating Gain / Delta badge
function DesignSystem.FloatingGain(text, isPositive, opts)
    local col = isPositive and DesignSystem.C.success or DesignSystem.C.error
    local symbol = isPositive and "▲" or "▼"
    return UI.Panel {
        flexDirection = "row", alignItems = "center", gap = 4,
        paddingLeft = 6, paddingRight = 6, paddingTop = 2, paddingBottom = 2,
        backgroundColor = isPositive and "#122018" or "#201214",
        borderWidth = 1, borderColor = col, borderRadius = 4,
        children = {
            DesignSystem.Label(string.format("%s %s", symbol, text), {
                fontSize = 10, fontColor = col, fontWeight = "bold"
            })
        }
    }
end

-- Smart Notification Badge (Red Dot)
function DesignSystem.SmartBadge(count, opts)
    opts = opts or {}
    local sz = opts.size or 16
    local txt = tostring(count or "")
    if count == nil or count == 0 or count == false then return nil end
    return UI.Panel {
        width = sz, height = sz, borderRadius = sz / 2,
        backgroundColor = DesignSystem.C.error,
        alignItems = "center", justifyContent = "center",
        children = {
            DesignSystem.Label(txt, { fontSize = 9, fontColor = "#ffffff", fontWeight = "bold" })
        }
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

-- Monogram icon helper
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
