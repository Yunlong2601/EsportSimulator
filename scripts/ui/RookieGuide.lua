local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")

local RookieGuide = {}

---@class RookieGuideModal : Modal
---@overload fun(props?: ModalProps): RookieGuideModal
local RookieGuideModal = UI.Modal:Extend("RookieGuideModal")

function RookieGuideModal:Destroy()
    -- 页面切换时先移出浮层栈，避免旧弹窗继续拦截输入。
    self:Close()
    self.contentContainer_:Destroy()
    if self.footerWidget_ then self.footerWidget_:Destroy() end
    UI.Modal.Destroy(self)
end

local STEPS = {
    {
        title = "冲击天梯，证明实力",
        description = "当前为【阶段 1：天梯路人王】。通过单排冲分冲击王者，同时注意维持体能。",
    },
    {
        title = "跟随今日核心指令",
        description = "大厅中的【今日核心指令】会根据你的状态，推荐当前适合的备战操作。",
    },
    {
        title = "突破千分，迈入职业赛场",
        description = "突破千分天梯后，你将收到顶级豪门的试训邀请，正式开启 5v5 职业征程。",
    },
}

---@param root Widget
---@param game table
---@param phase number
---@return Modal?
function RookieGuide.Attach(root, game, phase)
    if game.rookie_guide_dismissed or phase ~= 1 then return nil end

    local insets = UI.GetSafeAreaInsets()
    local availableHeight = UI.GetHeight() - insets.top - insets.bottom
    ---@type number
    local bodyHeight = math.max(64, math.min(350, availableHeight - 180))
    local modal = RookieGuideModal {
        id = "rookie_guide_modal",
        title = "新秀战术导师",
        size = UI.GetWidth() >= 520 and "md" or "sm",
        closeOnOverlay = false,
        closeOnEscape = true,
        showCloseButton = true,
        headerHeight = 52,
        headerContentGap = 0,
        contentPadding = { 12, 16, 12, 16 },
        contentGap = 0,
        backgroundColor = { 20, 28, 38, 255 },
        borderColor = { 77, 166, 255, 255 },
        titleTextColor = { 230, 233, 239, 255 },
        closeIconColor = { 205, 211, 221, 255 },
        borderRadius = 14,
        onClose = function()
            game.rookie_guide_dismissed = true
            print("[新秀引导] 已关闭，本次生涯不再自动弹出")
        end,
    }

    local content = UI.Panel {
        width = "100%", paddingVertical = 8, gap = 14,
        children = {
            DS.Label("欢迎出征职业电竞！", {
                fontSize = 16, fontWeight = "bold", fontColor = DS.C.gold,
                whiteSpace = "normal", lineHeight = 1.4,
            }),
        },
    }
    for index, step in ipairs(STEPS) do
        content:AddChild(UI.Panel {
            width = "100%", flexDirection = "row", alignItems = "flex-start", gap = 10,
            children = {
                UI.Panel {
                    width = 26, height = 26, flexShrink = 0,
                    backgroundColor = DS.C.surfaceAlt, borderColor = DS.C.info,
                    borderWidth = 1, borderRadius = 13,
                    justifyContent = "center", alignItems = "center",
                    children = { DS.Label(tostring(index), {
                        fontSize = 12, fontWeight = "bold", fontColor = DS.C.info,
                    }) },
                },
                UI.Panel {
                    flexGrow = 1, flexShrink = 1, flexBasis = 0, gap = 4,
                    children = {
                        DS.Label(step.title, {
                            fontSize = 12, fontWeight = "bold", whiteSpace = "normal", lineHeight = 1.4,
                        }),
                        DS.Label(step.description, {
                            fontSize = 11, fontColor = DS.C.textDim,
                            whiteSpace = "normal", lineHeight = 1.5,
                        }),
                    },
                },
            },
        })
    end

    -- 正文单独滚动，确认按钮始终可见；行高使用倍数而非像素。
    modal:AddContent(UI.ScrollView {
        id = "rookie_guide_body",
        width = "100%", height = bodyHeight, flexShrink = 1,
        scrollY = true, scrollX = false, showScrollbar = true,
        children = { content },
    })
    modal:SetFooter(UI.Panel {
        width = "100%",
        children = {
            DS.Button("了解了，开始征途", function() modal:Close() end, {
                width = "100%", height = 42, fontSize = 13,
            }),
        },
    })

    -- 先挂到新页面，再打开，避免自动挂载到仍在显示的旧页面。
    root:AddChild(modal)
    modal:Open()
    print("[新秀引导] 打开弹窗，当前阶段：" .. tostring(phase))
    return modal
end

return RookieGuide
