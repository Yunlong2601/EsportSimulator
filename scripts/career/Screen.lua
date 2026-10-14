-- Unified career pages: UI presents saved state and sends commands to Runtime.
-- Domain rules, money movement, simulations and persistence live outside this file.
local UI = require("urhox-libs/UI")
local K = require("career.ui.Kit")
local Runtime = require("career.Runtime")
local World = require("career.World")
local Matches = require("career.Matches")
local Training = require("career.Training")
local Screen = {}
local notice_ = ""
local pendingEntry_ = false
---@type string|nil
local pendingCommandPage_ = nil
local confirmNew_ = false
local confirmRetire_ = false
---@type string|nil
local confirmBuy_ = nil
---@type table|nil
local draftPlan_ = nil
local draft_ = { name = "新星", role = "mid", profile = "short", style = "balanced", background = "ordinary", goal = "champion" }
local historyLimit_ = 20

local function busy() return Runtime.IsBusy() end
local function cannotMutate() return busy() or Runtime.Status().locked == true end
local function text(text, muted) return K.Text(text, muted) end
local function go(nav, page) return function() nav("unified_" .. page) end end
local function info(world)
    local p = world.persons[world.protagonistId]
    local clubId = World.ControlledClub(world)
    return p, clubId and world.clubs[clubId]
end
local function date(world)
    return tostring(world.clock.startYear) .. " 起 · 第 " .. world.clock.day .. " 天 · 赛季 " .. world.season
end
local function clubName(world, id) return world.clubs[id] and world.clubs[id].name or "自由身份" end
local function preview(kind, payload)
    local ok, result = pcall(Runtime.Preview, kind, payload)
    if not ok or type(result) ~= "table" then return { ok = false, message = "暂时无法检查此操作" } end
    return result
end
local function command(nav, page, kind, payload, revision)
    return function()
        if busy() then return end
        -- Runtime can notify synchronously and replace this widget tree before
        -- Dispatch returns. Completion routing therefore uses its trusted nav.
        pendingCommandPage_ = "unified_" .. page
        local callOk, ok, message, status = pcall(Runtime.Dispatch, kind, payload or {}, revision)
        notice_ = callOk and (message or (ok and "已保存" or "操作未完成")) or ("操作失败：" .. tostring(ok))
        if not callOk or not ok or status ~= "pending" then pendingCommandPage_ = nil end
        nav("unified_" .. page)
    end
end
local function action(nav, page, world, label, kind, payload, secondary)
    return K.Button(label, command(nav, page, kind, payload, world.revision), secondary, cannotMutate())
end
local function beginEntry(nav, kind, options)
    if busy() then return end
    pendingEntry_ = true
    local callOk, ok, message, status
    if kind == "load" then callOk, ok, message, status = pcall(Runtime.Load)
    else callOk, ok, message, status = pcall(Runtime.Create, options) end
    notice_ = callOk and (message or "") or ("存档操作失败：" .. tostring(ok))
    if not callOk or (not ok and status ~= "pending") then pendingEntry_ = false end
    if callOk and ok and status ~= "pending" and Runtime.Get() then
        pendingEntry_, confirmNew_ = false, false
        nav("unified_today")
    else nav("unified_" .. (kind == "load" and "start" or "setup")) end
end

function Screen.OnRuntimeChange(ok, message, status, nav, page)
    notice_ = message or ""
    if pendingCommandPage_ and status ~= "pending" and not busy() then
        local target = pendingCommandPage_
        pendingCommandPage_ = nil
        if ok then nav(target); return end
    end
    if pendingEntry_ and status ~= "pending" and not busy() then
        pendingEntry_ = false
        if ok and Runtime.Get() then confirmNew_ = false; nav("unified_today"); return end
    end
    nav(page)
end

function Screen.OnLeave()
    pendingCommandPage_, pendingEntry_ = nil, false
end

local function entry(nav)
    ---@type Widget[]
    local nodes = {
        K.Card { K.Title("同一个世界，一段完整生涯"), text("先以选手身份比赛，退役后用自己的积蓄购买现有俱乐部，继续管理它的阵容和预算。") },
        text("当前为开发验证版本：虚构俱乐部与选手。尚未接入真实 2026 LPL 数据。", true),
    }
    if Runtime.Get() then nodes[#nodes + 1] = K.Button("返回当前生涯", go(nav, "today"), false, busy()) end
    nodes[#nodes + 1] = K.Button("读取生涯存档", function() beginEntry(nav, "load") end, true, busy(), "career-load")
    if not Runtime.Get() and Runtime.Status().status == "missing" then
        nodes[#nodes + 1] = K.Button("创建角色", go(nav, "setup"), false, busy(), "career-create-entry")
    elseif not Runtime.Get() then
        nodes[#nodes + 1] = text("首次开始也请先读取存档，确认云端没有已有生涯后即可创建角色。", true)
    end
    nodes[#nodes + 1] = K.Button("返回模式选择", function() nav("menu") end, true)
    return "电竞人生", nodes
end

local function setup(nav)
    ---@type Widget[]
    local nodes = { text("短生涯从已签约的老将开始，便于体验比赛、退役与收购。新人开局也已签约；试训和完整新人发展将在后续加入。", true) }
    nodes[#nodes + 1] = K.Title("角色姓名")
    nodes[#nodes + 1] = UI.TextField { id = "career-name", value = draft_.name, maxLength = 16,
        width = "100%", height = 52 * K.scale, fontSize = 16 * K.scale,
        disabled = busy(), onChange = function(_, value) draft_.name = value end }
    local function choices(title, field, entries)
        ---@type Widget[]
        local items = { K.Title(title) }
        for _, option in ipairs(entries) do
            local id, label = option[1], option[2]
            items[#items + 1] = K.Button((draft_[field] == id and "已选 · " or "") .. label, function()
                draft_[field], confirmNew_ = id, false; nav("unified_setup")
            end, draft_[field] ~= id, busy())
        end
        nodes[#nodes + 1] = K.Card(items)
    end
    choices("生涯起点", "profile", { {"short", "老将短生涯 · 测试闭环"}, {"rookie", "新人已签约 · 长期起点"} })
    local roles = {}; for _, role in ipairs(K.roles) do roles[#roles + 1] = { role, K.roleNames[role] } end
    choices("比赛位置", "role", roles)
    choices("初始打法", "style", { {"balanced", "均衡 · 心态 +3"}, {"aggressive", "进攻 · 操作 +3"}, {"strategic", "运营 · 意识 +3"}, {"supportive", "协作 · 配合 +3"} })
    nodes[#nodes + 1] = text("背景与职业目标目前记入档案，暂不影响数值；不将未接入的剧情效果写成承诺。", true)
    choices("成长背景", "background", { {"ordinary", "普通家庭"}, {"academy", "青训经历"} })
    choices("职业目标", "goal", { {"champion", "争夺冠军"}, {"ownership", "建立自己的俱乐部"} })
    if confirmNew_ then
        nodes[#nodes + 1] = K.Card { text("确认创建并保存这段生涯？当前版本保护已有存档：如果已有新生涯，请返回读取，不能覆盖。两个旧模式的存档保持独立。") }
        nodes[#nodes + 1] = K.Button("确认创建并保存", function()
            local options = {}; for key, value in pairs(draft_) do options[key] = value end
            beginEntry(nav, "create", options)
        end, false, busy(), "career-create-confirm")
    else
        nodes[#nodes + 1] = K.Button("开始这段生涯", function() confirmNew_ = true; nav("unified_setup") end, false, busy())
    end
    nodes[#nodes + 1] = K.Button("返回", go(nav, "start"), true, busy())
    return "创建原创选手", nodes
end

local function nextFixture(world, clubId)
    local nextOne
    for _, fixture in ipairs(world.fixtures) do
        if fixture.status ~= "completed" and (fixture.homeId == clubId or fixture.awayId == clubId)
            and (not nextOne or fixture.day < nextOne.day) then nextOne = fixture end
    end
    return nextOne
end

local function today(world, nav)
    local p, club = info(world)
    local owned = club and club.ownerId == p.id
    local stage = owned and "俱乐部办公室" or (p.careerStatus == "retired" and "自己的房间" or "训练室")
    ---@type Widget[]
    local nodes = {
        K.Card { K.Title(p.name .. " · " .. (owned and "俱乐部老板" or (p.careerStatus == "retired" and "已退役选手" or K.roleNames[p.role]))),
            text(date(world), true), text(stage .. " · " .. (club and club.name or "职业生涯仍在继续")),
            text("个人积蓄 " .. K.Money(world.accounts["person:" .. p.id].balance)),
        },
    }
    local match = Matches.Active(world)
    local event = world.eventQueue[1]
    local fixture = club and nextFixture(world, club.id)
    if match then
        nodes[#nodes + 1] = K.Card { K.Title("比赛正在等待你的决定"), text(match.phaseLabel), K.Button("继续比赛", go(nav, "match"), false, busy()) }
    elseif event then
        nodes[#nodes + 1] = K.Card { K.Title("一件重要事项"), text(event.title or "合同即将到期，需要决定下一步。"), K.Button("处理事项", go(nav, "messages"), false, busy()) }
    elseif fixture and fixture.day <= world.clock.day then
        nodes[#nodes + 1] = K.Card { K.Title("比赛日"), text(clubName(world, fixture.homeId) .. " 对阵 " .. clubName(world, fixture.awayId)),
            action(nav, "match", world, owned and "进入比赛 · 管理视角" or "进入比赛 · 选手视角", "start_match", { fixtureId = fixture.id }) }
    elseif p.careerStatus == "retired" and not owned then
        nodes[#nodes + 1] = K.Card { K.Title("你的下一段生涯"), text("查看出售中的俱乐部，或安排解说工作积累个人收入。"), K.Button("查看可收购战队", go(nav, "team")) }
        nodes[#nodes + 1] = action(nav, "today", world, "安排解说工作周", "work", {}, true)
        nodes[#nodes + 1] = action(nav, "today", world, "推进至重要事项", "advance", {}, true)
    else
        nodes[#nodes + 1] = K.Card { K.Title("按自己的节奏准备下一场"),
            text(fixture and ("下一场：第 " .. fixture.day .. " 天 · " .. clubName(world, fixture.homeId) .. " 对阵 " .. clubName(world, fixture.awayId)) or "查看赛事与本周安排。"),
            action(nav, "today", world, "推进至重要事项", "advance", {}) }
    end
    nodes[#nodes + 1] = K.Card { text("当前周计划 · " .. world.plan.name), K.Button("查看与修改七天安排", go(nav, "plan"), true, busy()) }
    if p.careerStatus == "active" then nodes[#nodes + 1] = text("疲劳 " .. math.floor(p.fatigue or 0) .. " / 100 · 心态 " .. math.floor(p.morale or 0) .. " / 100", true) end
    local last = world.history[#world.history]
    if last then nodes[#nodes + 1] = K.Card { text("最近经历", true), text(last.title) } end
    nodes[#nodes + 1] = text(world.contentNotice, true)
    return "今日", nodes
end

local function profile(world, nav)
    local p = world.persons[world.protagonistId]
    ---@type Widget[]
    local nodes = { K.Card { K.Title(p.name), text(K.roleNames[p.role] .. " · " .. p.age .. " 岁 · " .. (p.careerStatus == "retired" and "已退役" or "现役选手")),
        text("个人账户 " .. K.Money(world.accounts["person:" .. p.id].balance)), text("人物编号 " .. p.id, true) } }
    local labels = { mechanics = "操作", gameSense = "意识", teamwork = "配合", mental = "心理素质" }
    for _, key in ipairs({ "mechanics", "gameSense", "teamwork", "mental" }) do nodes[#nodes + 1] = text(labels[key] .. " " .. string.format("%.1f", p.attrs[key])) end
    local backgrounds = { ordinary = "普通家庭", academy = "青训经历" }
    local goals = { champion = "争夺冠军", ownership = "建立自己的俱乐部" }
    nodes[#nodes + 1] = text("背景：" .. (backgrounds[p.background] or p.background or "未记录") .. "；目标：" .. (goals[p.goal] or p.goal or "未记录"), true)
    nodes[#nodes + 1] = K.Title("合同记录")
    for _, c in ipairs(K.Sorted(world.contracts)) do
        if c.personId == p.id then nodes[#nodes + 1] = K.Card { text(clubName(world, c.clubId)),
            text("周薪 " .. K.Money(c.weeklyWage) .. " · 第 " .. c.startDay .. "—" .. c.endDay .. " 天"),
            text("状态：" .. (({ active = "履行中", retired = "退役终止", expired = "已到期" })[c.status] or tostring(c.status)) .. " · 累计已付 " .. K.Money(c.paidTotal), true) } end
    end
    nodes[#nodes + 1] = K.Title("人物关系")
    for _, r in ipairs(K.Sorted(world.relationships)) do
        if r.fromId == p.id or r.toId == p.id then
            local other = world.persons[r.fromId == p.id and r.toId or r.fromId]
            nodes[#nodes + 1] = text((other and other.name or "未知人物") .. " · 关系 " .. tostring(r.value))
        end
    end
    if p.careerStatus == "active" then
        if confirmRetire_ then
            local check = preview("retire", {})
            nodes[#nodes + 1] = K.Card { text("退役会结束选手合同并结算应付工资，保留人物与比赛记录；之后可以购买俱乐部。此版本不能重新成为现役选手。"), text(check.ok and "可以办理退役。" or check.message) }
            nodes[#nodes + 1] = action(nav, "today", world, "确认退役", "retire", {}, false)
            nodes[#nodes + 1] = K.Button("继续选手生涯", function() confirmRetire_ = false; nav("unified_profile") end, true)
        else nodes[#nodes + 1] = K.Button("考虑退役", function() confirmRetire_ = true; nav("unified_profile") end, true, busy()) end
    end
    nodes[#nodes + 1] = K.Button("字号：" .. math.floor(K.scale * 100) .. "% · 点击切换", function()
        K.scale = K.scale == 1 and 1.25 or (K.scale == 1.25 and 1.5 or 1); nav("unified_profile")
    end, true)
    nodes[#nodes + 1] = K.Button("返回模式选择", function() nav("menu") end, true)
    return "档案", nodes
end

local function plan(world, nav)
    if not draftPlan_ then draftPlan_ = {}; for i, value in ipairs(world.plan.days) do draftPlan_[i] = value end end
    ---@type Widget[]
    local nodes = { text("安排每七天循环；比赛和必须处理的事件会暂停推进。修改不会自动执行，也不会替换成系统建议。", true) }
    local options = { "mechanics", "gameSense", "teamwork", "mental", "rest", "social" }
    if world.persons[world.protagonistId].careerStatus == "retired" then options[#options + 1] = "work" end
    nodes[#nodes + 1] = text("操作、复盘和合练会增加疲劳；休息恢复体力，陪伴队友改善关系。安排会随日期执行，不能在同一天无限训练。", true)
    for day = 1, 7 do
        local index = day
        nodes[#nodes + 1] = K.Button(day .. " · " .. (Training.LABELS[draftPlan_[day]] or draftPlan_[day]) .. " · 更换", function()
            local current = 0; for i, value in ipairs(options) do if value == draftPlan_[index] then current = i end end
            draftPlan_[index] = options[current % #options + 1]; nav("unified_plan")
        end, true, busy())
    end
    nodes[#nodes + 1] = K.Button("保存周计划", function()
        local days = {}; for i, value in ipairs(draftPlan_) do days[i] = value end
        command(nav, "today", "set_plan", { days = days }, world.revision)()
        draftPlan_ = nil
    end, false, cannotMutate())
    nodes[#nodes + 1] = K.Button("放弃修改", function() draftPlan_ = nil; nav("unified_today") end, true)
    return "周计划", nodes
end

local function team(world, nav)
    local p, club = info(world)
    ---@type Widget[]
    local nodes = {}
    if club then
        local owner = club.ownerId == p.id
        nodes[#nodes + 1] = K.Card { K.Title(club.name), text(owner and "你拥有完整管理权限" or "当前效力战队 · 管理决定由俱乐部负责"),
            text("俱乐部运营现金 " .. K.Money(world.accounts[club.accountId].balance)),
            text("个人积蓄 " .. K.Money(world.accounts["person:" .. p.id].balance) .. "（独立账户）", true) }
        nodes[#nodes + 1] = K.Title("首发阵容")
        for _, role in ipairs(K.roles) do
            local person = world.persons[club.roster[role]]
            nodes[#nodes + 1] = text(K.roleNames[role] .. " · " .. (person and person.name or "空缺"))
        end
        nodes[#nodes + 1] = K.Title("替补名单")
        for _, id in ipairs(club.bench) do
            local person = world.persons[id]
            ---@type Widget[]
            local row = { text(K.roleNames[person.role] .. " · " .. person.name) }
            if owner then row[#row + 1] = action(nav, "team", world, "调整为该位置首发", "set_roster", { clubId = club.id, role = person.role, personId = person.id }, true) end
            nodes[#nodes + 1] = K.Card(row)
        end
        nodes[#nodes + 1] = K.Card { K.Title("每周预算"), text("训练 " .. K.Money(club.budget.training) .. " · 人员 " .. K.Money(club.budget.staff)),
            text("按周从俱乐部账户支付；选手合同工资另行结算。", true) }
        if owner then
            local budgetTraining, budgetStaff = club.budget.training, club.budget.staff
            nodes[#nodes + 1] = text("输入新预算（元／周）")
            nodes[#nodes + 1] = text("训练预算")
            nodes[#nodes + 1] = UI.TextField { id = "career-training-budget", value = tostring(budgetTraining), placeholder = "训练预算", width = "100%", height = 52 * K.scale, fontSize = 16 * K.scale,
                onChange = function(_, value) budgetTraining = tonumber(value) end, disabled = busy() }
            nodes[#nodes + 1] = text("人员预算")
            nodes[#nodes + 1] = UI.TextField { id = "career-staff-budget", value = tostring(budgetStaff), placeholder = "人员预算", width = "100%", height = 52 * K.scale, fontSize = 16 * K.scale,
                onChange = function(_, value) budgetStaff = tonumber(value) end, disabled = busy() }
            nodes[#nodes + 1] = K.Button("保存每周预算", function()
                command(nav, "team", "set_budget", { clubId = club.id, training = budgetTraining, staff = budgetStaff }, world.revision)()
            end, false, cannotMutate())
        end
    end
    if not club or club.ownerId ~= p.id then
        nodes[#nodes + 1] = K.Title("出售中的俱乐部")
        if p.careerStatus ~= "retired" then nodes[#nodes + 1] = text("可以提前了解目标；退役后才能收购。", true) end
        for _, target in ipairs(K.Sorted(world.clubs)) do
            if target.forSale then
                local targetId = target.id
                local check = preview("buy_club", { clubId = targetId })
                ---@type Widget[]
                local items = { K.Title(target.name), text("收购价 " .. K.Money(target.forSale.price)),
                    text("运营现金 " .. K.Money(world.accounts[target.accountId].balance) .. " · 待付经营支出 " .. K.Money(target.liabilities), true),
                    text("替补 " .. #target.bench .. " 人 · 训练设施 " .. target.assets.facilityLevel .. " 级；保留原有阵容、合同和赛程。", true) }
                if confirmBuy_ == targetId then
                    items[#items + 1] = text("收购款从你的个人账户支付给卖方，俱乐部运营现金不会用于购买自身。")
                    items[#items + 1] = text(check.ok and "余额与交易条件已通过检查。" or check.message)
                    items[#items + 1] = K.Button("确认收购 " .. target.name, command(nav, "team", "buy_club", { clubId = targetId }, world.revision), false, cannotMutate() or not check.ok)
                    items[#items + 1] = K.Button("取消", function() confirmBuy_ = nil; nav("unified_team") end, true)
                else
                    items[#items + 1] = K.Button("查看收购条件", function() confirmBuy_ = targetId; nav("unified_team") end, true, busy())
                end
                nodes[#nodes + 1] = K.Card(items)
            end
        end
    end
    return "战队", nodes
end

local function matchPage(world, nav)
    local match = Matches.Active(world)
    if not match then
        return "比赛", { text("当前没有进行中的比赛。比赛结果已写入赛事记录。"), K.Button("查看赛事与赛果", go(nav, "events")) }
    end
    ---@type Widget[]
    local nodes = { K.Card { K.Title(clubName(world, match.homeId) .. " 对阵 " .. clubName(world, match.awayId)),
        text("系列赛 " .. match.score.home .. " : " .. match.score.away .. " · 第 " .. match.gameIndex .. " 局"),
        K.Title(match.phaseLabel), text(match.controlMode == "player" and "你只决定自己的行动，队友与对手按各自能力行动。" or "你以管理者身份设定本阶段战术倾向。", true) } }
    local choices = Matches.GetChoices(world)
    for _, choice in ipairs(choices) do
        nodes[#nodes + 1] = K.Card { text(choice.description), action(nav, "match", world, choice.label, "match_choice", { choiceId = choice.id }) }
    end
    nodes[#nodes + 1] = K.Title("最近赛况")
    for i = #match.events, math.max(1, #match.events - 5), -1 do nodes[#nodes + 1] = text(match.events[i].text, true) end
    return "比赛进行中", nodes
end

local function events(world, nav)
    local _, club = info(world)
    ---@type Widget[]
    local nodes = { text(date(world), true) }
    if Matches.Active(world) then nodes[#nodes + 1] = K.Button("继续当前比赛", go(nav, "match")) end
    for _, fixture in ipairs(world.fixtures) do
        ---@type Widget[]
        local items = { text("第 " .. fixture.day .. " 天 · " .. clubName(world, fixture.homeId) .. " 对阵 " .. clubName(world, fixture.awayId)) }
        local result = fixture.matchId and world.matches[fixture.matchId]
        if result and result.status == "completed" then
            items[#items + 1] = text(result.summary)
            local performance = result.performances[world.protagonistId]
            if performance then items[#items + 1] = text("你的个人评分 " .. string.format("%.1f", performance.rating or 0), true) end
        elseif fixture.status == "scheduled" then
            items[#items + 1] = text(fixture.day <= world.clock.day and "等待开赛" or "尚未到比赛日", true)
            if club and (fixture.homeId == club.id or fixture.awayId == club.id) and fixture.day <= world.clock.day then
                items[#items + 1] = action(nav, "match", world, "进入这场比赛", "start_match", { fixtureId = fixture.id })
            end
        else items[#items + 1] = text("进行中", true) end
        nodes[#nodes + 1] = K.Card(items)
    end
    return "赛事", nodes
end

local function messages(world, nav)
    ---@type Widget[]
    local nodes = {}
    local event = world.eventQueue[1]
    if event then
        local contract = event.contractId and world.contracts[event.contractId]
        ---@type Widget[]
        local items = { K.Title("待处理事项"), text(event.title or "合同即将到期") }
        if event.kind == "contract_expiry" and contract then
            items[#items + 1] = text(clubName(world, contract.clubId) .. " · 周薪 " .. K.Money(contract.weeklyWage) .. " · 到期日 " .. contract.endDay)
            items[#items + 1] = action(nav, "today", world, "按原周薪续约十二周", "resolve_event", { eventId = event.id, choice = "renew" })
            items[#items + 1] = action(nav, "today", world, "决定到期离队", "resolve_event", { eventId = event.id, choice = "leave" }, true)
        end
        nodes[#nodes + 1] = K.Card(items)
    else nodes[#nodes + 1] = text("没有必须处理的事项。", true) end
    nodes[#nodes + 1] = K.Title("人生与世界记录")
    for i = #world.history, math.max(1, #world.history - historyLimit_ + 1), -1 do
        local item = world.history[i]
        nodes[#nodes + 1] = K.Card { text("第 " .. tostring(item.day or "?") .. " 天", true), text(item.title) }
    end
    if #world.history > historyLimit_ then nodes[#nodes + 1] = K.Button("查看更多记录", function() historyLimit_ = historyLimit_ + 20; nav("unified_messages") end, true) end
    return "消息", nodes
end

local PAGES = { today = today, profile = profile, team = team, events = events, messages = messages, match = matchPage, plan = plan }
function Screen.Build(nav, page)
    local id = (page or "unified_start"):gsub("^unified_", "")
    local title, nodes, active
    if id == "setup" then title, nodes = setup(nav)
    elseif id == "start" or not Runtime.Get() then title, nodes = entry(nav)
    else
        title, nodes = (PAGES[id] or today)(Runtime.Get(), nav)
        active = id == "match" and "events" or (id == "plan" and "today" or id)
    end
    if Runtime.Status().locked then
        table.insert(nodes, 1, K.Card {
            text("存档状态需要确认，已暂停改变世界的操作。重新读取后再继续。"),
            K.Button("重新读取存档", function() beginEntry(nav, "load") end, false, busy()),
        })
    end
    return K.Shell(title, nodes, nav, active, notice_, busy())
end

return Screen
