-- UI primitives for the unified career. No game state or legacy clock is read here.
-- Layout follows the UI guide's full-screen + constrained ScrollView example.
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local Kit = {}
Kit.C = DS.C
Kit.scale = 1
Kit.roles = { "top", "jungle", "mid", "adc", "support" }
Kit.roleNames = { top = "上单", jungle = "打野", mid = "中单", adc = "射手", support = "辅助" }

function Kit.Text(text, muted, size)
    return DS.Label(tostring(text or ""), {
        fontSize = (size or 16) * Kit.scale,
        fontColor = muted and DS.C.muted or DS.C.text,
        width = "100%", whiteSpace = "normal", lineHeight = 1.5,
    })
end

function Kit.Title(text)
    return DS.Label(text, { fontSize = 21 * Kit.scale, fontWeight = "bold",
        width = "100%", whiteSpace = "normal", lineHeight = 1.35 })
end

function Kit.Button(text, fn, secondary, disabled, id)
    return UI.Button {
        id = id, text = text, width = "100%", height = 52 * Kit.scale,
        flexShrink = 0, fontSize = 16 * Kit.scale, fontWeight = "bold",
        backgroundColor = secondary and DS.C.surfaceAlt or DS.C.ember,
        textColor = secondary and DS.C.text or "#1a0e08",
        borderColor = DS.C.border, borderWidth = secondary and 1 or 0,
        borderRadius = 10, disabled = disabled == true,
        onClick = function(self)
            if not self:IsDisabled() and fn then fn() end
        end,
    }
end

function Kit.Card(children)
    return DS.Card { width = "100%", padding = 16, gap = 10, children = children }
end

function Kit.Row(children)
    return UI.Panel { width = "100%", flexDirection = "row", flexWrap = "wrap", gap = 8, children = children }
end

function Kit.Money(amount)
    return string.format("¥%.0f", tonumber(amount) or 0)
end

function Kit.Sorted(map)
    local values = {}
    for _, value in pairs(map or {}) do values[#values + 1] = value end
    table.sort(values, function(a, b) return tostring(a.id or a.name) < tostring(b.id or b.name) end)
    return values
end

local NAV = { { "today", "今日" }, { "profile", "档案" }, { "team", "战队" }, { "events", "赛事" }, { "messages", "消息" } }
function Kit.Shell(title, nodes, navigate, active, notice, busy)
    ---@type Widget[]
    local children = {
        UI.Panel { width = "100%", padding = 12, gap = 8, children = {
            Kit.Title(title),
        } },
    }
    ---@type Widget[]
    local body = {}
    if notice and notice ~= "" then
        body[#body + 1] = Kit.Card { Kit.Text(notice, false) }
    end
    if busy then body[#body + 1] = Kit.Text("正在确认存档，请稍候…", true) end
    for _, node in ipairs(nodes) do body[#body + 1] = node end
    children[#children + 1] = UI.ScrollView {
        id = "career-content", width = "100%", flexGrow = 1, flexBasis = 0,
        scrollX = false, scrollY = true, showScrollbar = true,
        children = { UI.Panel { width = "100%", padding = 12, gap = 12, children = body } },
    }
    if active then
        ---@type Widget[]
        local tabs = {}
        for _, entry in ipairs(NAV) do
            local target, label = entry[1], entry[2]
            tabs[#tabs + 1] = UI.Button {
                id = "career-nav-" .. target, text = label,
                flexGrow = 1, flexBasis = 0, flexShrink = 1,
                height = 58 * Kit.scale, fontSize = 14 * Kit.scale,
                fontWeight = active == target and "bold" or "normal",
                backgroundColor = active == target and DS.C.ember or DS.C.surface,
                textColor = active == target and "#1a0e08" or DS.C.text,
                borderRadius = 0, borderWidth = 0,
                onClick = function() navigate("unified_" .. target) end,
            }
        end
        children[#children + 1] = UI.Panel { width = "100%", flexDirection = "row", children = tabs }
    end
    return UI.Panel { width = "100%", height = "100%", backgroundColor = DS.C.bg,
        children = { UI.SafeAreaView {
            width = "100%", height = "100%", nativeMenuInset = true,
            flexDirection = "column", children = children,
        } },
    }
end

return Kit
