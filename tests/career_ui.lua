-- Offline interaction test: real main/Screen/Runtime/rules, stub native widgets
-- and cloud callbacks. It proves reachable command wiring, not rendered layout.
local count = 0
local function check(value, message)
    count = count + 1
    assert(value, message)
end

local function scenario(delayed)
    for name in pairs(package.loaded) do
        if name == "main" or name == "LegacySession" or name:match("^career%.") or name:match("^ui%.")
            or name:match("^secondline%.") or name == "CompanyState" or name == "SaveManager" then package.loaded[name] = nil end
    end
    local root, queue, cloudValues = nil, {}, {}
    local failNextWrite = false
    local uncertainWrite
    local function schedule(fn) if delayed then queue[#queue + 1] = fn else fn() end end
    local function drain()
        local limit = 100
        while #queue > 0 do local fn = table.remove(queue, 1); fn(); limit = limit - 1; assert(limit > 0, "async loop") end
    end
    local function widget(kind, props)
        local value = { kind = kind, props = props or {}, children = props and props.children or {} }
        function value:IsDisabled() return self.props.disabled == true end
        function value:SetDisabled(v) self.props.disabled = v end
        function value:SetText(v) self.props.text = v end
        function value:GetValue() return self.props.value end
        function value:SetValue(v) self.props.value = v end
        function value:AddChild(child) self.children[#self.children + 1] = child end
        return value
    end
    local UI = { Scale = { DEFAULT = 1 }, Init = function() end, Shutdown = function() end }
    for _, kind in ipairs({ "Panel", "Label", "Button", "TextField", "ScrollView", "SafeAreaView" }) do
        UI[kind] = function(props) return widget(kind, props) end
    end
    UI.SetRoot = function(value) root = value end
    package.loaded["urhox-libs/UI"] = UI
    package.loaded.AudioManager = { Init = function() end, PlayBGM = function() end }
    graphics = {}
    clientCloud = {
        Get = function(_, key, callbacks) schedule(function() callbacks.ok({ [key] = cloudValues[key] }) end) end,
        Set = function(_, key, value, callbacks) schedule(function()
            if failNextWrite then
                failNextWrite = false
                uncertainWrite = { key = key, value = value }
                callbacks.timeout()
            else cloudValues[key] = value; callbacks.ok() end
        end) end,
    }
    local managementLoads, managementSaves, secondLoads, secondSaves = 0, 0, 0, 0
    local company
    package.preload.CompanyState = function()
        managementLoads = managementLoads + 1
        return {
            GetState = function() return company end, SetState = function(v) company = v end,
            Ensure = function(v) return v end,
            NewGame = function() return { roster = { customPlayers = {} }, goals = { season = {1} } } end,
        }
    end
    package.preload.SaveManager = function()
        return {
            Exists = function() return true end,
            Load = function() return { roster = { customPlayers = {} }, goals = { season = {1} } } end,
            Save = function() managementSaves = managementSaves + 1; return true end,
        }
    end
    package.loaded.LeagueCatalog = { RegisterPlayer = function() end }
    package.loaded.DraftSystem = { Rehydrate = function() end }
    package.loaded.AISystem = { EnsureAgents = function() end }
    local second
    package.preload["secondline.State"] = function()
        return {
            Load = function() secondLoads = secondLoads + 1; return nil end,
            Exists = function() return false end, GetState = function() return second end,
            SetState = function(v) second = v end,
            NewGame = function() second = {}; return second end,
            Save = function() secondSaves = secondSaves + 1; return true end,
        }
    end
    package.preload["ui.screens.DashboardScreen"] = function()
        return { Build = function(nav) return UI.Panel { children = {
            UI.Button { text = "返回模式选择", onClick = function() nav("menu") end },
        } } end }
    end

    local function find(predicate, node, result)
        result = result or {}; node = node or root
        if predicate(node) then result[#result + 1] = node end
        for _, child in ipairs(node.children or {}) do find(predicate, child, result) end
        return result
    end
    local function buttons(label)
        return find(function(n) return n.kind == "Button" and n.props.text == label end)
    end
    local function hasText(fragment)
        return #find(function(n) return type(n.props.text) == "string" and n.props.text:find(fragment, 1, true) end) > 0
    end
    local function click(label, nth)
        local button = buttons(label)[nth or 1]
        check(button ~= nil, "missing button: " .. label)
        check(not button:IsDisabled(), "disabled button: " .. label)
        button.props.onClick(button)
    end
    local function clickAndDrain(label, nth) click(label, nth); drain() end
    require("main")
    Start()
    check(managementLoads == 0 and secondLoads == 0, "menu eagerly loads legacy state")
    clickAndDrain("电竞人生 · 统一生涯")
    check(managementLoads == 0, "new career loads management state")
    check(#buttons("创建角色") == 0, "creation permitted before slot check")
    click("读取生涯存档")
    if delayed then check(hasText("正在"), "no pending feedback") end
    drain()
    clickAndDrain("创建角色")
    local field = find(function(n) return n.props.id == "career-name" end)[1]
    check(field ~= nil, "name field missing")
    field.props.onChange(field, "测试选手")
    clickAndDrain("上单")
    clickAndDrain("开始这段生涯")
    click("确认创建并保存")
    local Runtime = require("career.Runtime")
    if delayed then check(Runtime.Get() == nil and Runtime.IsBusy(), "world published before save confirmation") end
    drain()
    check(Runtime.Get() ~= nil and hasText("测试选手"), "creation not reachable")
    check(Runtime.Get().persons.protagonist.role == "top", "role was lost on form rebuild")
    check(managementLoads == 0 and managementSaves == 0, "creation touches old management")
    failNextWrite = true
    clickAndDrain("推进至重要事项")
    check(Runtime.Status().locked and Runtime.Get().clock.day == 1, "uncertain write publishes candidate")
    check(#buttons("重新读取存档") == 1, "locked world has no visible recovery")
    check(buttons("推进至重要事项")[1]:IsDisabled(), "locked action remains enabled")
    clickAndDrain("重新读取存档")
    check(Runtime.Status().locked and Runtime.Get().clock.day == 1, "old snapshot unsafely clears uncertain write")
    cloudValues[uncertainWrite.key] = uncertainWrite.value
    clickAndDrain("重新读取存档")
    check(not Runtime.Status().locked and Runtime.Get().clock.day == 7, "delayed committed world cannot recover")
    check(Runtime.Get().clock.day == 7, "weekly plan failed to pause at match")
    clickAndDrain("进入比赛 · 选手视角")
    check(hasText("比赛进行中") and #buttons("继续比赛") == 0, "start match does not route directly to decisions")
    local Matches = require("career.Matches")
    local phases = 0
    while Matches.Active(Runtime.Get()) do
        local choice = Matches.GetChoices(Runtime.Get())[1]
        clickAndDrain(choice.label)
        phases = phases + 1; check(phases <= 18, "match cannot finish")
    end
    check(#Runtime.Get().history > 1, "result has no history")
    clickAndDrain("档案")
    check(hasText("测试选手"), "profile lost character")
    clickAndDrain("考虑退役")
    clickAndDrain("确认退役")
    check(Runtime.Get().persons.protagonist.careerStatus == "retired", "retirement unreachable")
    check(#buttons("查看可收购战队") == 1, "retirement does not route directly to today")
    clickAndDrain("战队")
    clickAndDrain("查看收购条件", 2)
    local before = Runtime.Get()
    local targetId = "harbor"
    local cashBefore = before.accounts[before.clubs[targetId].accountId].balance
    local starterBefore = before.clubs[targetId].roster.top
    clickAndDrain("确认收购 港湾电竞")
    local owned = Runtime.Get()
    check(owned.clubs[targetId].ownerId == owned.protagonistId, "purchase unreachable")
    check(owned.accounts[owned.clubs[targetId].accountId].balance == cashBefore, "UI purchase consumed target cash")
    clickAndDrain("调整为该位置首发")
    check(Runtime.Get().clubs[targetId].roster.top ~= starterBefore, "lineup management unreachable")
    local fields = find(function(n) return n.kind == "TextField" end)
    check(#fields == 2, "budget fields missing")
    fields[1].props.onChange(fields[1], "2000")
    fields[2].props.onChange(fields[2], "3000")
    clickAndDrain("保存每周预算")
    check(Runtime.Get().clubs[targetId].budget.training == 2000 and Runtime.Get().clubs[targetId].budget.staff == 3000, "budget not saved")
    clickAndDrain("今日")
    clickAndDrain("推进至重要事项")
    clickAndDrain("进入比赛 · 管理视角")
    check(hasText("比赛进行中") and #buttons("继续比赛") == 0, "owner match does not route directly to decisions")
    check(Matches.Active(Runtime.Get()).controlMode == "owner", "not owner next-match decisions")
    phases = 0
    while Matches.Active(Runtime.Get()) do
        clickAndDrain(Matches.GetChoices(Runtime.Get())[1].label)
        phases = phases + 1; check(phases <= 18, "owner match cannot finish")
    end
    clickAndDrain("消息")
    check(hasText("买下港湾电竞") and hasText("宣布退役"), "history loses Chinese stored titles")
    clickAndDrain("档案")
    clickAndDrain("字号：100% · 点击切换")
    check(require("career.ui.Kit").scale == 1.25, "font option not wired")
    local worldId, revision = Runtime.Get().worldId, Runtime.Get().revision
    clickAndDrain("返回模式选择")
    check(managementSaves == 0 and secondSaves == 0, "leaving new mode saves legacy")
    clickAndDrain("旧管理模式 · 继续")
    check(managementLoads == 1 and company ~= nil, "old mode does not load on demand")
    clickAndDrain("返回模式选择")
    check(managementSaves == 1 and company == nil, "old management not saved and cleared on leave")
    clickAndDrain("旧独立选手生涯")
    check(secondLoads == 1 and company == nil, "secondline uses management world")
    check(not hasText("下一天"), "secondline contains management time button")
    clickAndDrain("返回模式选择")
    clickAndDrain("电竞人生 · 统一生涯")
    clickAndDrain("读取生涯存档")
    check(Runtime.Get().worldId == worldId and Runtime.Get().revision == revision, "same world not recovered after mode roundtrip")
    check(Runtime.Get().clubs.harbor.ownerId == "protagonist", "reload loses acquisition")
    if delayed then
        clickAndDrain("推进至重要事项")
        click("进入比赛 · 管理视角")
        check(Runtime.IsBusy(), "routing test needs pending save")
        click("档案")
        click("返回模式选择")
        drain()
        check(hasText("选择生涯"), "completion routes after leaving career mode")
        clickAndDrain("电竞人生 · 统一生涯")
        clickAndDrain("读取生涯存档")
        check(#buttons("继续比赛") == 1 and not hasText("比赛进行中"), "stale command destination survived leave/reload")
    end
    Stop()
    check(managementSaves == 1, "new mode exit saves management")
end

scenario(false)
scenario(true)
return count
