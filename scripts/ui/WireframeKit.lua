-- WireframeKit.lua — renders wireframe block kinds into UrhoX nodes.
-- One renderer per block kind from gen_wireframes.py SCREENS spec.
-- All renderers are nil-guarded; no color emoji (Kenney icons / font-safe glyphs only).
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")

local Kit = {}

local function num(v, d) return tonumber(v) or d end
local function str(v, d) return v == nil and (d or "") or tostring(v) end

-- progress bar (outer track + inner fill)
local function bar(pct, color, height)
    pct = math.max(0, math.min(100, num(pct, 0)))
    height = height or 8
    return UI.Panel {
        width = "100%", height = height, backgroundColor = DS.C.surfaceAlt,
        borderRadius = height / 2, overflow = "hidden",
        children = {
            UI.Panel { width = tostring(pct) .. "%", height = height, backgroundColor = color or DS.C.ember, borderRadius = height / 2 },
        },
    }
end

local function barColor(pct)
    pct = num(pct, 0)
    if pct >= 60 then return DS.C.success end
    if pct >= 30 then return DS.C.gold end
    return DS.C.error
end

local function ring(pct, label)
    pct = num(pct, 0)
    local col = barColor(pct)
    return UI.Panel {
        width = 64, height = 64, borderRadius = 32, backgroundColor = DS.C.surfaceAlt,
        borderWidth = 4, borderColor = col, alignItems = "center", justifyContent = "center",
        children = {
            DS.Label(tostring(pct), { fontSize = 16, fontWeight = "bold", fontColor = col }),
            DS.Label(label, { fontSize = 8, fontColor = DS.C.muted, marginTop = 2 }),
        },
    }
end

-- ---- block renderers -------------------------------------------------------
local R = {}

R.sectionhdr = function(b, ctx)
    -- Only hand SectionHeader a callable onClick when there is a real rightTarget.
    -- The old `b.right and function()...end` made EVERY `right` label (e.g.
    -- "学员 2/30 名额") a tappable gold button whose onClick no-ops — a fake
    -- dead button app-wide. With no rightTarget we pass nil, so SectionHeader
    -- renders the label as a static muted caption instead.
    local onRight
    if b.right and b.rightTarget then
        onRight = function() if ctx.nav then ctx.nav(b.rightTarget) end end
    end
    return DS.SectionHeader(str(b.title or b[1]), b.right, onRight)
end

R.statusgrid = function(b, ctx)
    local items = b.items or {}
    local tiles = {}
    for _, it in ipairs(items) do
        -- it: {icon(name|nil), label, value, sub, color}
        local children = {}
        if it[1] and it[1] ~= "" then
            table.insert(children, DS.IconImage(it[1], { width = 16, height = 16, tintColor = it[5] or DS.C.gold }))
        end
        table.insert(children, DS.Label(it[2] or "", { fontSize = 10, fontColor = DS.C.muted }))
        table.insert(children, DS.Label(it[3] or "", { fontSize = 15, fontWeight = "bold", fontColor = it[5] or DS.C.text }))
        table.insert(children, DS.Label(it[4] or "", { fontSize = 9, fontColor = DS.C.faint, whiteSpace = "nowrap" }))
        table.insert(tiles, UI.Panel {
            flexGrow = 1, flexBasis = 0, flexDirection = "column", gap = 2,
            padding = DS.S.sm, backgroundColor = DS.C.surface,
            borderWidth = 1, borderColor = DS.C.border, borderRadius = DS.S.radius,
            children = children,
        })
    end
    return UI.Panel {
        width = "100%", flexDirection = "row", flexWrap = "wrap", gap = DS.S.sm,
        children = tiles,
    }
end

R.goaltip = function(b, ctx)
    return UI.Panel {
        width = "100%", flexDirection = "row", alignItems = "center", justifyContent = "space-between",
        padding = DS.S.md, backgroundColor = DS.C.inset, borderWidth = 1, borderColor = DS.C.border, borderRadius = DS.S.radius,
        children = {
            UI.Panel { flexDirection = "column", gap = 2, flexGrow = 1, children = {
                DS.Label(str(b.title), { fontSize = 12, fontWeight = "bold", fontColor = DS.C.text }),
                DS.Label(str(b.desc), { fontSize = 10, fontColor = DS.C.muted }),
            } },
            DS.Button(b.action or "前往", function() if ctx.nav then ctx.nav(b.actionTarget or "goalcenter") end end, { variant = "secondary", height = 30, fontSize = 11 }),
        },
    }
end

R.twocol = function(b, ctx)
    return UI.Panel {
        width = "100%", flexDirection = "row", gap = DS.S.sm, alignItems = "stretch",
        children = {
            (b.left and R[b.left.kind] and R[b.left.kind](b.left, ctx)) or UI.Panel {},
            (b.right and R[b.right.kind] and R[b.right.kind](b.right, ctx)) or UI.Panel {},
        },
    }
end

R.rings = function(b, ctx)
    local items = b.items or {}
    local nodes = {}
    for _, it in ipairs(items) do
        table.insert(nodes, ring(it[1], it[2]))
    end
    return UI.Panel { flexDirection = "row", gap = DS.S.md, justifyContent = "space-around", width = "100%", children = nodes }
end

R.bigval = function(b, ctx)
    return UI.Panel {
        flexGrow = 1, flexDirection = "column", gap = 2, padding = DS.S.sm,
        backgroundColor = DS.C.surface, borderWidth = 1, borderColor = DS.C.border, borderRadius = DS.S.radius,
        children = {
            DS.Label(str(b.label), { fontSize = 10, fontColor = DS.C.muted }),
            DS.Label(str(b.value), { fontSize = 18, fontWeight = "bold", fontColor = DS.C.text }),
            DS.Label((b.change or "") .. "  " .. (b.sub or ""), { fontSize = 9, fontColor = DS.C.success }),
        },
    }
end

R.trendbar = function(b, ctx)
    local segs = b.segments or {}
    local nodes = {}
    for i, s in ipairs(segs) do
        local on = (b.current and i == num(b.current, 0))
        table.insert(nodes, UI.Panel {
            flexGrow = 1, height = 18, backgroundColor = s[2] or DS.C.surfaceAlt,
            borderWidth = on and 2 or 1, borderColor = on and DS.C.gold or DS.C.border,
            borderRadius = 4, alignItems = "center", justifyContent = "center",
            children = { DS.Label(tostring(i), { fontSize = 9, fontColor = on and DS.C.gold or DS.C.faint }) },
        })
    end
    return UI.Panel { width = "100%", flexDirection = "row", gap = 4, children = nodes }
end

R.stackbar = function(b, ctx)
    local segs = b.segments or {}
    local total = 0
    for _, s in ipairs(segs) do total = total + num(s[2], 0) end
    total = total > 0 and total or 1
    local fills = {}
    for _, s in ipairs(segs) do
        table.insert(fills, UI.Panel { width = tostring(math.floor(num(s[2], 0) / total * 100)) .. "%", height = 12, backgroundColor = s[3] or DS.C.ember })
    end
    local legend = {}
    for _, s in ipairs(segs) do
        table.insert(legend, UI.Panel { flexDirection = "row", alignItems = "center", gap = 4, children = {
            UI.Panel { width = 8, height = 8, borderRadius = 2, backgroundColor = s[3] or DS.C.ember },
            DS.Label(s[1] .. " " .. tostring(s[2]) .. "%", { fontSize = 9, fontColor = DS.C.muted }),
        } })
    end
    return UI.Panel { width = "100%", flexDirection = "column", gap = 6, children = {
        b.title and DS.Label(str(b.title), { fontSize = 10, fontColor = DS.C.muted }) or nil,
        UI.Panel { width = "100%", height = 12, flexDirection = "row", borderRadius = 6, overflow = "hidden", children = fills },
        UI.Panel { flexDirection = "row", flexWrap = "wrap", gap = 10, children = legend },
    } }
end

R.statusbars = function(b, ctx)
    local nodes = {}
    for _, it in ipairs(b.items or {}) do
        table.insert(nodes, UI.Panel { width = "100%", flexDirection = "column", gap = 3, children = {
            DS.Label(it[1] or "", { fontSize = 10, fontColor = DS.C.textDim }),
            it[2] and DS.Label(it[2], { fontSize = 9, fontColor = DS.C.muted, marginBottom = 2 }) or nil,
            bar(it[3], barColor(it[3])),
        } })
    end
    return UI.Panel { width = "100%", flexDirection = "column", gap = DS.S.sm, children = nodes }
end

R.briefing = function(b, ctx)
    local nodes = {}
    for _, it in ipairs(b.items or {}) do
        table.insert(nodes, UI.Panel { width = "100%", flexDirection = "column", gap = 2, padding = DS.S.sm,
            backgroundColor = DS.C.surface, borderWidth = 1, borderColor = DS.C.border, borderRadius = DS.S.radiusSm, children = {
            DS.Label(it[1] or "", { fontSize = 10, fontWeight = "bold", fontColor = DS.C.gold }),
            DS.Label(it[2] or "", { fontSize = 9, fontColor = DS.C.muted }),
        } })
    end
    return UI.Panel { width = "100%", flexDirection = "column", gap = 6, children = nodes }
end

R.feed = function(b, ctx)
    local nodes = {}
    for _, it in ipairs(b.items or {}) do
        local col = it[2] == "g" and DS.C.success or (it[2] == "d" and DS.C.info or DS.C.muted)
        table.insert(nodes, UI.Panel { width = "100%", flexDirection = "row", alignItems = "center", gap = 8, children = {
            UI.Panel { width = 6, height = 6, borderRadius = 3, backgroundColor = col, flexShrink = 0 },
            DS.Label(it[1] or "", { fontSize = 10, fontColor = DS.C.textDim }),
        } })
    end
    return UI.Panel { width = "100%", flexDirection = "column", gap = 6, children = nodes }
end

R.quicknav = function(b, ctx)
    local items = b.items or {}
    local nodes = {}
    for _, label in ipairs(items) do
        table.insert(nodes, DS.Button(label, function() if ctx.nav then ctx.nav(b.target or "more") end end,
            { variant = "secondary", height = 36, fontSize = 12 }))
    end
    return UI.Panel { width = "100%", flexDirection = "row", flexWrap = "wrap", gap = DS.S.sm, children = nodes }
end

R.timebar = function(b, ctx)
    return UI.Panel { width = "100%", flexDirection = "row", alignItems = "center", justifyContent = "center",
        padding = DS.S.sm, backgroundColor = DS.C.inset, borderWidth = 1, borderColor = DS.C.border, borderRadius = DS.S.radius,
        children = { DS.Label("时间推进 · 用顶部「下一天 ▶」推进赛程", { fontSize = 10, fontColor = DS.C.muted }) } }
end

R.chiprow = function(b, ctx)
    local items = b.items or {}
    local nodes = {}
    for _, it in ipairs(items) do
        local on = it[2]
        table.insert(nodes, UI.Panel {
            flexDirection = "row", alignItems = "center", paddingLeft = 12, paddingRight = 12, paddingTop = 6, paddingBottom = 6,
            backgroundColor = on and DS.C.gold or "#00000000", borderWidth = 1, borderColor = on and DS.C.gold or DS.C.border,
            borderRadius = 999,
            children = { DS.Label(it[1] or "", { fontSize = 11, fontWeight = on and "bold" or "normal", fontColor = on and "#1a0e08" or DS.C.muted }) },
        })
    end
    return UI.Panel { width = "100%", flexDirection = "row", gap = 8, children = nodes }
end

R.actiongrid = function(b, ctx)
    local items = b.items or {}
    local nodes = {}
    for _, it in ipairs(items) do
        local label = it[1] or it.label or ""
        local sub = it[2]
        local navTarget = it.target or it[3]
        local onClick = it.onClick
        -- 3rd tuple element (or it.target) is a nav target; wire it through ctx.nav
        if navTarget and ctx and ctx.nav and not onClick then
            onClick = function() pcall(function() ctx.nav(navTarget) end) end
        end
        local cell
        if onClick then
            -- clickable tile (UI.Button supports onClick; UI.Panel does not)
            cell = UI.Button {
                text = label,
                onClick = onClick,
                height = 54, fontSize = 12, fontWeight = "bold",
                backgroundColor = DS.C.surface, textColor = DS.C.text,
                borderWidth = 1, borderColor = DS.C.border, borderRadius = DS.S.radius,
                flexGrow = 1, flexBasis = 0,
            }
        else
            cell = UI.Panel {
                flexGrow = 1, flexBasis = 0, flexDirection = "column", gap = 4, alignItems = "center", justifyContent = "center",
                padding = DS.S.md, backgroundColor = DS.C.surface, borderWidth = 1, borderColor = DS.C.border, borderRadius = DS.S.radius,
                children = {
                    DS.Label(label, { fontSize = 12, fontWeight = "bold", fontColor = DS.C.text }),
                    sub and DS.Label(sub, { fontSize = 9, fontColor = DS.C.muted }) or nil,
                },
            }
        end
        table.insert(nodes, cell)
    end
    return UI.Panel { width = "100%", flexDirection = "row", flexWrap = "wrap", gap = DS.S.sm, children = nodes }
end

R.cta = function(b, ctx)
    return DS.Button(b.label or "确认", b.onClick or function() end, { height = 44, fontSize = 14 })
end

R.list = function(b, ctx)
    return DS.Card { children = { DS.Label(str(b[1] or b.text or ""), { fontSize = 11, fontColor = DS.C.muted }) } }
end

R.kpi = function(b, ctx)
    return UI.Panel { width = "100%", flexDirection = "column", gap = 3, padding = DS.S.sm,
        backgroundColor = DS.C.surfaceAlt, borderWidth = 1, borderColor = DS.C.border, borderRadius = DS.S.radiusSm,
        children = { DS.Label(str(b[1] or b.text or ""), { fontSize = 11, fontColor = DS.C.text }) } }
end

R.alert = function(b, ctx)
    return DS.AlertBox(b.lines or { { str(b[1] or b.text or ""), DS.C.success } })
end

R.chip = function(b, ctx)
    return UI.Panel { width = "100%", flexDirection = "row", flexWrap = "wrap", gap = 8, padding = DS.S.sm,
        backgroundColor = DS.C.inset, borderWidth = 1, borderColor = DS.C.border, borderRadius = DS.S.radiusSm,
        children = { DS.Label(str(b[1] or b.text or ""), { fontSize = 11, fontColor = DS.C.muted }) } }
end

R.section = function(b, ctx)
    return DS.Card { children = { DS.Label(str(b[1] or b.text or b.title or ""), { fontSize = 11, fontColor = DS.C.muted, fontStyle = "italic" }) } }
end

R.squadheader = function(b, ctx)
    local nodes = {}
    for _, s in ipairs(b.scheme or {}) do
        local on = s == b.active
        table.insert(nodes, UI.Panel {
            flexDirection = "row", alignItems = "center", paddingLeft = 10, paddingRight = 10, paddingTop = 5, paddingBottom = 5,
            backgroundColor = on and DS.C.ember or DS.C.surface, borderRadius = DS.S.radiusSm,
            children = { DS.Label(s, { fontSize = 10, fontWeight = on and "bold" or "normal", fontColor = on and "#1a0e08" or DS.C.muted }) },
        })
    end
    local filters = {}
    for _, f in ipairs(b.filters or {}) do
        local on = f[2]
        table.insert(filters, UI.Panel {
            paddingLeft = 8, paddingRight = 8, paddingTop = 3, paddingBottom = 3,
            backgroundColor = on and DS.C.gold or DS.C.inset, borderRadius = 999,
            children = { DS.Label(f[1], { fontSize = 9, fontColor = on and "#1a0e08" or DS.C.muted }) },
        })
    end
    local stats = {}
    for _, st in ipairs(b.stats or {}) do
        table.insert(stats, DS.Label(st[1] .. " " .. st[2], { fontSize = 9, fontColor = DS.C.muted }))
    end
    return UI.Panel { width = "100%", flexDirection = "column", gap = 6, children = {
        UI.Panel { flexDirection = "row", gap = 6, children = nodes },
        UI.Panel { flexDirection = "row", flexWrap = "wrap", gap = 6, children = filters },
        UI.Panel { flexDirection = "row", gap = 12, children = stats },
    } }
end

R.squadlist = function(b, ctx)
    local nodes = {}
    for _, p in ipairs(b.items or {}) do
        -- p: {starter, role, name, age, wage, ovr, pot}
        local col = p[1] and DS.C.ember or DS.C.muted
        table.insert(nodes, UI.Panel {
            width = "100%", flexDirection = "row", alignItems = "center", gap = 8, padding = DS.S.sm,
            backgroundColor = DS.C.surface, borderWidth = 1, borderColor = DS.C.border, borderRadius = DS.S.radiusSm,
            children = {
                UI.Panel { width = 4, height = 32, backgroundColor = col, borderRadius = 2, flexShrink = 0 },
                DS.Label(p[2] or "", { fontSize = 9, fontColor = DS.ROLE_COLOR(p[2]), width = 28 }),
                UI.Panel { flexGrow = 1, flexDirection = "column", gap = 1, children = {
                    DS.Label(p[3] or "", { fontSize = 12, fontWeight = "bold", fontColor = DS.C.text }),
                    DS.Label("年龄 " .. tostring(p[4] or "?") .. " · " .. str(p[5]), { fontSize = 9, fontColor = DS.C.muted }),
                } },
                DS.Label("OVR " .. tostring(p[6] or "?"), { fontSize = 11, fontWeight = "bold", fontColor = DS.C.gold }),
                DS.Label("POT " .. tostring(p[7] or "?"), { fontSize = 9, fontColor = DS.C.muted }),
            },
        })
    end
    return UI.Panel { width = "100%", flexDirection = "column", gap = 6, children = nodes }
end

R.kvrows = function(b, ctx)
    local nodes = {}
    if b.title then table.insert(nodes, DS.Label(b.title, { fontSize = 11, fontWeight = "bold", fontColor = DS.C.text })) end
    for _, r in ipairs(b.rows or {}) do
        table.insert(nodes, UI.Panel { width = "100%", flexDirection = "row", justifyContent = "space-between", children = {
            DS.Label(r[1] or "", { fontSize = 10, fontColor = DS.C.muted }),
            DS.Label(r[2] or "", { fontSize = 10, fontColor = r[3] or DS.C.textDim }),
        } })
    end
    return UI.Panel { width = "100%", flexDirection = "column", gap = 5, children = nodes }
end

R.benchlist = function(b, ctx)
    local nodes = {}
    for _, p in ipairs(b.items or {}) do
        -- p: {idx, role, name, ovr, cond}
        table.insert(nodes, UI.Panel {
            width = "100%", flexDirection = "row", alignItems = "center", gap = 8, padding = DS.S.sm,
            backgroundColor = DS.C.surface, borderWidth = 1, borderColor = DS.C.border, borderRadius = DS.S.radiusSm,
            children = {
                DS.Label("#" .. tostring(p[1]), { fontSize = 10, fontColor = DS.C.faint, width = 18 }),
                DS.Label(p[2] or "", { fontSize = 9, fontColor = DS.ROLE_COLOR(p[2]), width = 26 }),
                DS.Label(p[3] or "", { fontSize = 11, fontWeight = "bold", fontColor = DS.C.text, flexGrow = 1 }),
                DS.Label("OVR " .. tostring(p[4]), { fontSize = 10, fontColor = DS.C.gold }),
                DS.Label("状态 " .. tostring(p[5]), { fontSize = 9, fontColor = DS.C.muted }),
                b.action and DS.Button(b.action, function() end, { variant = "secondary", height = 26, fontSize = 10 }) or nil,
            },
        })
    end
    return UI.Panel { width = "100%", flexDirection = "column", gap = 6, children = nodes }
end

R.chipcard = function(b, ctx)
    local chips = {}
    for _, c in ipairs(b.chips or {}) do
        table.insert(chips, DS.Chip(c))
    end
    return UI.Panel { width = "100%", flexDirection = "row", flexWrap = "wrap", gap = 6, padding = DS.S.sm,
        backgroundColor = DS.C.surface, borderWidth = 1, borderColor = DS.C.border, borderRadius = DS.S.radius, children = chips }
end

R.youthlist = function(b, ctx)
    local nodes = {}
    for _, p in ipairs(b.items or {}) do
        -- p: {role, name, age(number|string), meta, ovr, pot}
        local ageStr = type(p[3]) == "number" and (p[3] .. "岁") or str(p[3])
        table.insert(nodes, UI.Panel {
            width = "100%", flexDirection = "row", alignItems = "center", gap = 8, padding = DS.S.sm,
            backgroundColor = DS.C.surface, borderWidth = 1, borderColor = DS.C.border, borderRadius = DS.S.radiusSm,
            children = {
                DS.Label(p[1] or "", { fontSize = 9, fontColor = DS.ROLE_COLOR(p[1]), width = 26 }),
                UI.Panel { flexGrow = 1, flexDirection = "column", gap = 1, children = {
                    DS.Label(p[2] or "", { fontSize = 12, fontWeight = "bold", fontColor = DS.C.text }),
                    DS.Label(ageStr .. " · " .. str(p[4]), { fontSize = 9, fontColor = DS.C.muted }),
                } },
                DS.Label("能力 " .. tostring(p[5]), { fontSize = 10, fontColor = DS.C.gold }),
                DS.Label("潜力 " .. tostring(p[6]), { fontSize = 9, fontColor = DS.C.info }),
            },
        })
    end
    return UI.Panel { width = "100%", flexDirection = "column", gap = 6, children = nodes }
end

R.ztable = function(b, ctx)
    local nodes = {}
    for _, r in ipairs(b.rows or {}) do
        table.insert(nodes, UI.Panel { width = "100%", flexDirection = "row", justifyContent = "space-between", padding = DS.S.xs,
            children = {
                DS.Label(r[1] or "", { fontSize = 10, fontColor = DS.C.muted }),
                DS.Label(r[2] or "", { fontSize = 10, fontWeight = "bold", fontColor = DS.C.text }),
            } })
    end
    return UI.Panel { width = "100%", flexDirection = "column", gap = 3, padding = DS.S.sm,
        backgroundColor = DS.C.surface, borderWidth = 1, borderColor = DS.C.border, borderRadius = DS.S.radius, children = nodes }
end

R.stafflist = function(b, ctx)
    local nodes = {}
    for _, s in ipairs(b.items or {}) do
        -- s: {role, name, wage, {skill pairs}, color}
        local skills = {}
        for _, sk in ipairs(s[4] or {}) do
            table.insert(skills, DS.Label(sk[1] .. " " .. tostring(sk[2]), { fontSize = 9, fontColor = DS.C.muted }))
        end
        table.insert(nodes, UI.Panel {
            width = "100%", flexDirection = "column", gap = 4, padding = DS.S.sm,
            backgroundColor = DS.C.surface, borderWidth = 1, borderColor = DS.C.border, borderRadius = DS.S.radiusSm,
            children = {
                UI.Panel { flexDirection = "row", alignItems = "center", gap = 8, children = {
                    UI.Panel { width = 6, height = 6, borderRadius = 3, backgroundColor = s[5] or DS.C.muted, flexShrink = 0 },
                    DS.Label(s[1] or "", { fontSize = 10, fontColor = s[5] or DS.C.muted, width = 44 }),
                    DS.Label(s[2] or "", { fontSize = 12, fontWeight = "bold", fontColor = DS.C.text, flexGrow = 1 }),
                    DS.Label(s[3] or "", { fontSize = 10, fontColor = DS.C.gold }),
                } },
                UI.Panel { flexDirection = "row", flexWrap = "wrap", gap = 10, children = skills },
            },
        })
    end
    return UI.Panel { width = "100%", flexDirection = "column", gap = 6, children = nodes }
end

R.playercards = function(b, ctx)
    local n = num(b.n, 2)
    local nodes = {}
    for i = 1, n do
        table.insert(nodes, UI.Panel {
            flexGrow = 1, flexBasis = 0, flexDirection = "column", gap = 4, padding = DS.S.sm,
            backgroundColor = DS.C.surface, borderWidth = 1, borderColor = DS.C.border, borderRadius = DS.S.radius,
            children = {
                DS.Label("选手 #" .. tostring(i), { fontSize = 11, fontWeight = "bold", fontColor = DS.C.text }),
                b.morale and bar(70, DS.C.success, 6) or nil,
                b.morale and DS.Label("士气 70", { fontSize = 9, fontColor = DS.C.muted }) or nil,
            },
        })
    end
    return UI.Panel { width = "100%", flexDirection = "row", gap = DS.S.sm, children = nodes }
end

R.profilehdr = function(b, ctx)
    local nodes = {}
    for _, it in ipairs(b.items or {}) do
        table.insert(nodes, UI.Panel { flexDirection = "column", gap = 1, alignItems = "center", children = {
            DS.Label(it[1] or "", { fontSize = 9, fontColor = DS.C.muted }),
            DS.Label(it[2] or "", { fontSize = 12, fontWeight = "bold", fontColor = it[3] and DS.C.success or DS.C.text }),
        } })
    end
    return UI.Panel { width = "100%", flexDirection = "row", justifyContent = "space-around", padding = DS.S.sm,
        backgroundColor = DS.C.surface, borderWidth = 1, borderColor = DS.C.border, borderRadius = DS.S.radius, children = nodes }
end

R.basicinfo = function(b, ctx)
    local rows = {}
    if b.title then table.insert(rows, DS.Label(b.title, { fontSize = 11, fontWeight = "bold", fontColor = DS.C.text })) end
    for _, r in ipairs(b.items or {}) do
        table.insert(rows, UI.Panel { width = "100%", flexDirection = "row", justifyContent = "space-between", children = {
            DS.Label(r[1] or "", { fontSize = 10, fontColor = DS.C.muted }),
            DS.Label(r[2] or "", { fontSize = 10, fontColor = DS.C.textDim }),
        } })
    end
    return UI.Panel { width = "100%", flexDirection = "column", gap = 5, padding = DS.S.sm,
        backgroundColor = DS.C.surface, borderWidth = 1, borderColor = DS.C.border, borderRadius = DS.S.radius, children = rows }
end

R.attrrow2 = function(b, ctx)
    local rows = {}
    for _, pair in ipairs(b.items or {}) do
        local left = pair[1]; local right = pair[2]
        local cell = function(c)
            return UI.Panel { flexGrow = 1, flexDirection = "row", alignItems = "center", gap = 6, padding = DS.S.xs, children = {
                DS.Label(c[1] or "", { fontSize = 10, fontColor = DS.C.text }),
                bar(c[2], c[3] or DS.C.success, 6),
                DS.Label(tostring(c[2]), { fontSize = 9, fontColor = DS.C.muted, width = 18 }),
            } }
        end
        table.insert(rows, UI.Panel { width = "100%", flexDirection = "row", gap = DS.S.sm, children = { cell(left), cell(right) } })
    end
    return UI.Panel { width = "100%", flexDirection = "column", gap = 6, children = rows }
end

R.adunlock = function(b, ctx)
    return UI.Panel { width = "100%", flexDirection = "column", gap = 4, padding = DS.S.md,
        backgroundColor = DS.C.inset, borderWidth = 1, borderColor = DS.C.border, borderRadius = DS.S.radius, children = {
        DS.Label(str(b.title), { fontSize = 11, fontWeight = "bold", fontColor = DS.C.text }),
        DS.Label(str(b.desc), { fontSize = 9, fontColor = DS.C.muted }),
        b.cta and DS.Button(b.cta, function() end, { variant = "secondary", height = 32, fontSize = 11 }) or nil,
    } }
end

R.follow = function(b, ctx)
    return UI.Panel { width = "100%", flexDirection = "column", gap = 3, padding = DS.S.md,
        backgroundColor = DS.C.surface, borderWidth = 1, borderColor = DS.C.border, borderRadius = DS.S.radius, children = {
        DS.Label(str(b.title), { fontSize = 11, fontWeight = "bold", fontColor = DS.C.text }),
        DS.Label(str(b.desc), { fontSize = 9, fontColor = DS.C.muted }),
        b.primary and DS.Button(b.primary, function() end, { variant = "secondary", height = 30, fontSize = 11 }) or nil,
    } }
end

R.dualcta = function(b, ctx)
    return UI.Panel { width = "100%", flexDirection = "column", gap = 6, children = {
        UI.Panel { flexDirection = "row", gap = DS.S.sm, children = {
            DS.Button(b.left or "左", function() if b.leftAction then b.leftAction() end end, { variant = "secondary", height = 40 }),
            DS.Button(b.right or "右", function() if b.rightAction then b.rightAction() end end, { height = 40 }),
        } },
        b.sub and DS.Label(b.sub, { fontSize = 9, fontColor = DS.C.faint }) or nil,
    } }
end

R.matchhero_v2 = function(b, ctx)
    local alerts = {}
    for _, a in ipairs(b.alerts or {}) do
        table.insert(alerts, DS.Label("· " .. a[1], { fontSize = 10, fontColor = a[2] or DS.C.muted, whiteSpace = "nowrap" }))
    end
    local statusNodes = {}
    for _, s in ipairs(b.status or {}) do
        table.insert(statusNodes, UI.Panel { flexDirection = "row", alignItems = "center", gap = 4, children = {
            s[1] and DS.Label(s[1], { fontSize = 12, fontColor = s[3] or DS.C.muted }) or nil,
            DS.Label(s[2], { fontSize = 9, fontColor = DS.C.muted }),
            DS.Label(s[3] and s[3] ~= DS.C.muted and (s[4] or "") or (s[4] or ""), { fontSize = 9, fontColor = s[3] or DS.C.muted }),
        } })
    end
    return UI.Panel { width = "100%", flexDirection = "column", gap = 8, padding = DS.S.md,
        backgroundColor = DS.C.surface, borderWidth = 1, borderColor = DS.C.ember, borderRadius = DS.S.radiusLg, children = {
        UI.Panel { flexDirection = "row", justifyContent = "space-between", children = {
            DS.Label(b.date or "", { fontSize = 9, fontColor = DS.C.muted }),
            DS.Label(b.days or "", { fontSize = 9, fontColor = DS.C.gold }),
        } },
        UI.Panel { flexDirection = "row", alignItems = "center", gap = 8, children = {
            UI.Panel { flexGrow = 1, flexDirection = "column", gap = 2, children = {
                DS.Label(b.rank_us or "", { fontSize = 10, fontColor = DS.C.muted }),
                DS.Label(b.us or "", { fontSize = 14, fontWeight = "bold", fontColor = DS.C.text }),
            } },
            DS.Label("VS", { fontSize = 12, fontColor = DS.C.faint }),
            UI.Panel { flexGrow = 1, flexDirection = "column", gap = 2, alignItems = "flex-end", children = {
                DS.Label(b.rank_opp or "", { fontSize = 10, fontColor = DS.C.muted }),
                DS.Label(b.opp or "", { fontSize = 14, fontWeight = "bold", fontColor = DS.C.text }),
            } },
        } },
        DS.Label(b.league or "", { fontSize = 9, fontColor = DS.C.info }),
        UI.Panel { flexDirection = "row", flexWrap = "wrap", gap = 10, children = statusNodes },
        #alerts > 0 and UI.Panel { flexDirection = "column", gap = 2, children = alerts } or nil,
        b.primaryLabel and DS.Button(b.primaryLabel, b.onPrimary or function() if ctx.nav then ctx.nav(b.target or "match") end end, { height = 44, fontSize = 14 })
            or DS.Button("查看比赛", function() if ctx.nav then ctx.nav(b.target or "match") end end, { height = 38 }),
        b.secondaryLabel and DS.Button(b.secondaryLabel, b.onSecondary or function() if ctx.nav then ctx.nav(b.secondaryTarget or "match") end end, { height = 36, fontSize = 12, variant = "secondary" }) or nil,
    } }
end

-- ---- table helper ---------------------------------------------------------
local function tableRender(cols, rows, scroll)
    local headCells = {}
    for _, c in ipairs(cols or {}) do
        table.insert(headCells, DS.Label(c, { fontSize = 9, fontWeight = "bold", fontColor = DS.C.muted, flexGrow = 1 }))
    end
    local nodes = {
        UI.Panel { width = "100%", flexDirection = "row", gap = 4, padding = DS.S.xs, children = headCells },
    }
    for _, r in ipairs(rows or {}) do
        local cells = {}
        for i, c in ipairs(r) do
            table.insert(cells, DS.Label(tostring(c), { fontSize = 9, fontColor = i == 2 and DS.C.text or DS.C.textDim, flexGrow = 1, whiteSpace = "nowrap" }))
        end
        table.insert(nodes, UI.Panel { width = "100%", flexDirection = "row", gap = 4, padding = DS.S.xs,
            borderWidth = 1, borderColor = DS.C.border, children = cells })
    end
    return UI.Panel { width = "100%", flexDirection = "column", backgroundColor = DS.C.surface,
        borderWidth = 1, borderColor = DS.C.border, borderRadius = DS.S.radiusSm,
        overflow = scroll and "scroll" or "visible", children = nodes }
end

R.countryleague = function(b, ctx)
    local mk = function(items, sel)
        local nodes = {}
        for _, it in ipairs(items or {}) do
            local on = it == sel
            table.insert(nodes, UI.Panel { paddingLeft = 10, paddingRight = 10, paddingTop = 5, paddingBottom = 5,
                backgroundColor = on and DS.C.gold or DS.C.inset, borderRadius = 999,
                children = { DS.Label(it, { fontSize = 10, fontColor = on and "#1a0e08" or DS.C.muted }) } })
        end
        return UI.Panel { width = "100%", flexDirection = "row", flexWrap = "wrap", gap = 6, children = nodes }
    end
    return UI.Panel { width = "100%", flexDirection = "column", gap = 6, children = {
        mk(b.countries, b.selected_country), mk(b.leagues, b.selected_league) } }
end

R.standings = function(b, ctx) return tableRender(b.cols, b.rows, false) end
R.scorerstable = function(b, ctx) return tableRender(b.cols, b.rows, false) end
R.playertable = function(b, ctx) return tableRender(b.cols, b.rows, true) end
R.table = function(b, ctx)
    local t = tableRender(b.cols, b.rows, false)
    if b.title then return UI.Panel { width = "100%", flexDirection = "column", gap = 4, children = {
        DS.Label(b.title, { fontSize = 11, fontWeight = "bold", fontColor = DS.C.text }), t } } end
    return t
end

R.searchbar = function(b, ctx)
    return UI.Panel { width = "100%", flexDirection = "row", alignItems = "center", gap = 6, padding = DS.S.sm,
        backgroundColor = DS.C.inset, borderWidth = 1, borderColor = DS.C.border, borderRadius = DS.S.radiusSm,
        children = {
            DS.IconImage("search", { width = 16, height = 16, tintColor = DS.C.muted }),
            DS.Label(b.placeholder or "搜索…", { fontSize = 11, fontColor = DS.C.faint }),
        } }
end

R.tiles = function(b, ctx)
    local items = b.items or {}
    local nodes = {}
    for _, it in ipairs(items) do
        table.insert(nodes, UI.Panel { flexGrow = 1, flexBasis = 0, flexDirection = "column", gap = 2, padding = DS.S.sm,
            backgroundColor = DS.C.surface, borderWidth = 1, borderColor = DS.C.border, borderRadius = DS.S.radius,
            children = { DS.Label(it[1] or "", { fontSize = 10, fontColor = DS.C.muted }),
                         DS.Label(it[2] or "", { fontSize = 14, fontWeight = "bold", fontColor = DS.C.text }) } })
    end
    return UI.Panel { width = "100%", flexDirection = "row", flexWrap = "wrap", gap = DS.S.sm, children = nodes }
end

R.header = function(b, ctx)
    return UI.Panel { width = "100%", padding = DS.S.md, backgroundColor = DS.C.surface,
        borderWidth = 1, borderColor = DS.C.border, borderRadius = DS.S.radius,
        children = { DS.Label(str(b[1] or b.text or ""), { fontSize = 13, fontWeight = "bold", fontColor = DS.C.text }) } }
end

R.split = function(b, ctx)
    local right = {}
    for _, r in ipairs(b.right or {}) do table.insert(right, DS.Label(r, { fontSize = 10, fontColor = DS.C.muted })) end
    return UI.Panel { width = "100%", flexDirection = "row", alignItems = "center", justifyContent = "space-between",
        padding = DS.S.md, backgroundColor = DS.C.surface, borderWidth = 1, borderColor = DS.C.ember, borderRadius = DS.S.radiusLg,
        children = { DS.Label(str(b.left), { fontSize = 20, fontWeight = "bold", fontColor = DS.C.ember }),
                     UI.Panel { flexDirection = "column", gap = 2, alignItems = "flex-end", children = right } } }
end

R.bars = function(b, ctx)
    local nodes = {}
    if b.title then table.insert(nodes, DS.Label(b.title, { fontSize = 11, fontWeight = "bold", fontColor = DS.C.text })) end
    for _, s in ipairs(b.spec or {}) do
        table.insert(nodes, UI.Panel { width = "100%", flexDirection = "column", gap = 3, children = {
            DS.Label(s[1], { fontSize = 10, fontColor = DS.C.textDim }), bar(s[2], barColor(s[2])) } })
    end
    return UI.Panel { width = "100%", flexDirection = "column", gap = 6, children = nodes }
end

R.node = function(b, ctx)
    return UI.Panel { width = "100%", flexDirection = "column", gap = 2, padding = DS.S.md,
        backgroundColor = DS.C.surface, borderWidth = 1, borderColor = DS.C.border, borderRadius = DS.S.radius,
        children = { DS.Label(str(b.text), { fontSize = 12, fontWeight = "bold", fontColor = DS.C.text }),
                     b.sub and DS.Label(b.sub, { fontSize = 10, fontColor = DS.C.muted }) or nil } }
end

R.ring = function(b, ctx)
    return UI.Panel { width = "100%", flexDirection = "row", alignItems = "center", gap = DS.S.md, padding = DS.S.md,
        backgroundColor = DS.C.surface, borderWidth = 1, borderColor = DS.C.border, borderRadius = DS.S.radius,
        children = { ring(b.pct, b.label), DS.Label(str(b.sub or ""), { fontSize = 11, fontColor = DS.C.muted }) } }
end

R.kpirow = function(b, ctx)
    local nodes = {}
    for _, it in ipairs(b.items or {}) do
        table.insert(nodes, UI.Panel { flexDirection = "column", alignItems = "center", gap = 2, children = {
            DS.Label(it[1], { fontSize = 9, fontColor = DS.C.muted }),
            DS.Label(it[2] == "" and "○" or (it[2] == "✓" and "✓" or "●"), { fontSize = 14, fontColor = it[2] == "✓" and DS.C.success or (it[2] == "" and DS.C.faint or DS.C.gold) }),
        } })
    end
    return UI.Panel { width = "100%", flexDirection = "row", justifyContent = "space-around", children = nodes }
end

R.attrgroups = function(b, ctx)
    local groups = {}
    for _, g in ipairs(b.groups or {}) do
        local rows = {}
        table.insert(rows, DS.Label(g[1], { fontSize = 11, fontWeight = "bold", fontColor = DS.C.text }))
        for _, a in ipairs(g[2] or {}) do
            table.insert(rows, UI.Panel { width = "100%", flexDirection = "row", alignItems = "center", gap = 6, children = {
                DS.Label(a[1], { fontSize = 10, fontColor = DS.C.muted, width = 36 }),
                bar(a[2], a[3] or DS.C.success, 6),
                DS.Label(tostring(a[2]) .. "/" .. tostring(a[3] and 20 or 20), { fontSize = 8, fontColor = DS.C.faint, width = 30 }),
            } })
        end
        table.insert(groups, UI.Panel { width = "100%", flexDirection = "column", gap = 4, padding = DS.S.sm,
            backgroundColor = DS.C.surface, borderWidth = 1, borderColor = DS.C.border, borderRadius = DS.S.radius, children = rows })
    end
    return UI.Panel { width = "100%", flexDirection = "column", gap = DS.S.sm, children = groups }
end

R.rolegrid = function(b, ctx)
    local nodes = {}
    for _, it in ipairs(b.items or {}) do
        local on = it[2]
        table.insert(nodes, UI.Panel { flexDirection = "row", alignItems = "center", gap = 6, padding = DS.S.sm,
            backgroundColor = on and DS.C.ember or DS.C.surface, borderRadius = DS.S.radiusSm, flexGrow = 1,
            children = { DS.Label(it[1], { fontSize = 10, fontColor = on and "#1a0e08" or DS.C.muted }) } })
    end
    return UI.Panel { width = "100%", flexDirection = "column", gap = 6, children = {
        b.title and DS.Label(b.title, { fontSize = 11, fontWeight = "bold", fontColor = DS.C.text }) or nil,
        b.subtitle and DS.Label(b.subtitle, { fontSize = 9, fontColor = DS.C.muted }) or nil,
        UI.Panel { width = "100%", flexDirection = "row", flexWrap = "wrap", gap = 6, children = nodes } } }
end

R.contractactions = function(b, ctx)
    local nodes = {}
    for _, g in ipairs(b.groups or {}) do
        local acts = {}
        for _, a in ipairs(g[2] or {}) do
            table.insert(acts, DS.Label("· " .. a[1], { fontSize = 10, fontColor = a[2] or DS.C.textDim }))
        end
        table.insert(nodes, UI.Panel { width = "100%", flexDirection = "column", gap = 3, padding = DS.S.sm,
            backgroundColor = DS.C.surface, borderWidth = 1, borderColor = DS.C.border, borderRadius = DS.S.radius,
            children = { DS.Label(g[1], { fontSize = 11, fontWeight = "bold", fontColor = DS.C.gold }),
                         (#acts > 0 and UI.Panel { flexDirection = "column", gap = 2, children = acts } or nil) } })
    end
    return UI.Panel { width = "100%", flexDirection = "column", gap = DS.S.sm, children = nodes }
end

-- ---- dispatch --------------------------------------------------------------
function Kit.renderBlock(block, ctx)
    if not block then return nil end
    -- tuple form: ("text", "kind")
    if type(block) == "table" and #block == 2 and type(block[1]) == "string" and not block.kind then
        block = { kind = block[2], text = block[1], [1] = block[1] }
    end
    local kind = block.kind or (block[2] and block[2] ~= "kind" and block[2]) or block[1]
    local fn = R[block.kind]
    if fn then return fn(block, ctx) end
    -- fallback: render as text card
    return DS.Card { children = { DS.Label(str(block.text or block[1] or block.title or ""), { fontSize = 11, fontColor = DS.C.muted }) } }
end

function Kit.renderBlocks(blocks, ctx)
    ctx = ctx or {}
    local nodes = {}
    for _, b in ipairs(blocks or {}) do
        local n = Kit.renderBlock(b, ctx)
        if n then table.insert(nodes, n) end
    end
    return nodes
end

return Kit
