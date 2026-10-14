local CompanyState = require("CompanyState")

local TutorialSystem = {}

TutorialSystem.STEPS = {
    {
        screen = "dashboard",
        title = "欢迎，经理！配置你的开局",
        text = "你将管理一家电竞俱乐部：签约选手 → 训练养成 → 战术博弈 → 比赛争冠 → 资本运作。开始前可以自定义公司名称、创建专属选手、调整联赛机制，并选择起点与难度——全部可选，直接开始也能玩。首赛季只开放基础系统，第 2 赛季起逐层解锁转会窗、替补席、青训、球探等进阶玩法。",
        button = "配置开局",
        next = "setup",
    },
    {
        screen = "dashboard",
        title = "开局就绪 · 签约建队",
        text = "开局已就绪。接下来按引导熟悉核心循环：签约选手 → 训练养成 → 战术博弈 → 比赛争冠 → 资本运作。核心循环简单但决策层层递进。",
        button = "管理阵容",
        next = "roster",
    },
    {
        screen = "roster",
        title = "签约建队 · 选手养成",
        text = "阵容页管理五名首发：每位选手有操作/团战/对线三项核心属性与潜力评级（S/A/B/C）。训练侧重每周做取舍（操作/团战/对线/心态），连续同类训练收益递减，教练等级与团队化学值提供加成。",
        button = "去联赛",
        next = "league",
    },
    {
        screen = "league",
        title = "赛前战术 · 比赛对决",
        text = "双赛制一年：春季赛、夏季赛各打一轮常规赛+季后赛，冠军直通世界赛；全年积分还能给外卡机会。每周赛前选择战术（均衡/激进/稳健/版本答案），看对手风格调战术是关键决策。",
        button = "去财务",
        next = "finance",
    },
    {
        screen = "finance",
        title = "现金流 · 资本运作",
        text = "财务页监控周收支与公司估值。可主动签约赞助商谈判提价、在融资轮（种子/A/B）引入资本，但会稀释持股——保持 51% 以上才能完全掌控公司。",
        button = "去股权",
        next = "shares",
    },
    {
        screen = "shares",
        title = "长期目标 · 开始经营",
        text = "我们的差异化资产：双赛制全年赛历（春季赛→夏季赛→世界赛）、股权融资博弈、俱乐部评级（草根→传奇）、名人堂生涯荣誉。每年董事会都会给你具体目标——完成得好，预算更高。祝你好运，经理！",
        button = "开始经营",
        next = nil,
    },
}

function TutorialSystem.IsDone(state)
    state = CompanyState.Ensure(state)
    return state.tutorial.done == true
end

function TutorialSystem.GetCurrent(state)
    state = CompanyState.Ensure(state)
    if state.tutorial.done then return nil end
    local step = TutorialSystem.STEPS[state.tutorial.step]
    if not step then return nil end
    -- 联赛步文案动态化：跟随开局联赛机制设置（周数 / 季后赛席位 / 世界赛开关）
    if state.tutorial.step == 4 then
        local settings = state.company.settings or {}
        local weeks = tonumber(settings.seasonWeeks) or 7
        local spots = tonumber(settings.playoffSpots) or 4
        local masters = settings.mastersEnabled ~= false
        local mastersText = masters and "冠军直通世界赛" or "联赛冠军即赛季终点"
        local copy = {}
        for k, v in pairs(step) do copy[k] = v end
        copy.text = "每周赛前选择战术（均衡/激进/稳健/版本答案），不同战术对胜负概率有不同修正。对手各有风格标签——看对手调战术是关键决策。春季/夏季赛各 " .. tostring(weeks) .. " 周常规赛，前 " .. tostring(spots) .. " 名进入该赛段季后赛，" .. mastersText .. "。"
        return copy
    end
    return step
end

function TutorialSystem.Advance(state)
    state = CompanyState.Ensure(state)
    if state.tutorial.done then return state end
    state.tutorial.step = tonumber(state.tutorial.step) + 1
    if state.tutorial.step > #TutorialSystem.STEPS then
        state.tutorial.done = true
        state.tutorial.step = 0
    end
    return state
end

function TutorialSystem.Skip(state)
    state = CompanyState.Ensure(state)
    state.tutorial.done = true
    state.tutorial.step = 0
    return state
end

function TutorialSystem.Restart(state)
    state = CompanyState.Ensure(state)
    state.tutorial.done = false
    state.tutorial.step = 1
    return state
end

return TutorialSystem
