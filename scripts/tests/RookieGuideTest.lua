local UI = require("urhox-libs/UI")
local RookieGuide = require("ui.RookieGuide")
local Screen = require("ui.screens.EsportSimulatorScreen")

local function check(condition, message)
    assert(condition, "[新秀引导测试] " .. message)
    print("[新秀引导测试] 通过：" .. message)
end

function Start()
    UI.Init({
        theme = "default-dark", scale = UI.Scale.DEFAULT,
        fonts = { { family = "sans", weights = {
            normal = "fonts/NotoSansSC-Regular.otf", bold = "fonts/NotoSansSC-Bold.otf",
        } } },
    })

    local game = Screen.ResetGame()
    local root = Screen.Build(function() end)
    UI.SetRoot(root, true)
    local modal = root:FindById("rookie_guide_modal") --[[@as Modal?]]
    check(modal ~= nil, "阶段 1 首次进入时显示引导弹窗")
    assert(modal)
    check(modal.parent == root, "弹窗位于根节点，不占用大厅滚动布局")
    check(modal.props.position == "absolute", "弹窗脱离普通布局流")
    check(modal:IsOpen() and UI.GetTopOverlay() == modal, "弹窗加入模态浮层栈")
    modal:Update(0.2)
    check(modal:HitTest(0, 0), "全屏遮罩捕获输入")
    check(not modal.props.closeOnOverlay, "点击背景不会误关闭引导")

    modal:Close()
    check(game.rookie_guide_dismissed, "关闭弹窗记录已读状态")
    check(UI.GetTopOverlay() == nil, "关闭后释放浮层输入拦截")
    local nextRoot = Screen.Build(function() end)
    check(nextRoot:FindById("rookie_guide_modal") == nil, "重建页面不再重复弹出")
    UI.SetRoot(nextRoot, true)

    local holder = UI.Panel { width = "100%", height = "100%" }
    check(RookieGuide.Attach(holder, {}, 2) == nil, "阶段 2 不显示新秀引导")
    check(RookieGuide.Attach(holder, {}, 3) == nil, "阶段 3 不显示新秀引导")
    holder:Destroy()

    -- 验证确认按钮与关闭按钮走相同的已读逻辑。
    local confirmRoot = UI.Panel { width = "100%", height = "100%" }
    local confirmState = {}
    local confirmModal = RookieGuide.Attach(confirmRoot, confirmState, 1)
    assert(confirmModal)
    local buttons = confirmModal:GetHitTestChildren()
    assert(buttons)
    local footer = buttons[#buttons]
    local button = footer:GetChildAt(1)
    assert(button and button.props.onClick)
    button.props.onClick(button)
    check(confirmState.rookie_guide_dismissed and not confirmModal:IsOpen(), "确认按钮关闭弹窗并标记已读")
    confirmRoot:Destroy()

    -- 未手动关闭时直接销毁页面，也必须清理浮层栈。
    local transientRoot = UI.Panel { width = "100%", height = "100%" }
    local transientModal = RookieGuide.Attach(transientRoot, {}, 1)
    check(UI.GetTopOverlay() == transientModal, "临时页面弹窗正常入栈")
    transientRoot:Destroy()
    check(UI.GetTopOverlay() == nil, "销毁页面不会遗留幽灵浮层")

    -- 最后展示真实大厅中的新生涯弹窗，供运行时截图验收。
    Screen.ResetGame()
    UI.SetRoot(Screen.Build(function() end), true)
    print("[新秀引导测试] 所有断言通过，展示真实大厅弹窗")
end

function Stop()
    UI.Shutdown()
end
