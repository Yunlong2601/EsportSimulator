local CompanyState = require("CompanyState")
local LeagueCatalog = require("LeagueCatalog")
local StaffSystem = require("StaffSystem")

local EventSystem = {}

EventSystem.EVENTS = {
    {
        id = "documentary",
        title = "纪录片企划",
        description = "平台方邀约拍摄战队纪录片，记录选手日常与训练故事。",
        options = {
            { label = "小成本拍摄（¥20万）", cost = 20, fans = 3000, reputation = 2, heat = 3, text = "纪录片上线，粉丝增长但热度有限。" },
            { label = "精良制作（¥80万）", cost = 80, fans = 9000, reputation = 5, heat = 8, text = "高质量纪录片出圈，俱乐部声誉大涨。" },
            { label = "婉拒（免费）", cost = 0, fans = 0, reputation = 0, heat = -1, text = "婉拒邀约，保持低调。" },
        },
    },
    {
        id = "livestream",
        title = "选手直播活动",
        description = "安排选手与粉丝互动直播，拉近粉丝距离。",
        options = {
            { label = "两小时常规直播（¥5万）", cost = 5, fans = 2000, reputation = 1, heat = 3, text = "直播顺利进行，粉丝互动活跃。" },
            { label = "全队整活直播（¥30万）", cost = 30, fans = 7000, reputation = 3, heat = 7, text = "整活名场面刷屏，粉丝量猛增。" },
            { label = "不直播", cost = 0, fans = 0, reputation = 0, heat = -1, text = "本周无直播安排。" },
        },
    },
    {
        id = "meetup",
        title = "粉丝见面会",
        description = "线下粉丝见面会带来门票收入与品牌曝光。",
        options = {
            { label = "小型见面会（¥15万）", cost = 15, fans = 2500, reputation = 2, heat = 3, text = "铁粉到场，现场氛围热烈。" },
            { label = "城市巡回（¥60万）", cost = 60, fans = 8000, reputation = 4, heat = 7, text = "巡回见面会引发社交讨论。" },
            { label = "暂不举办", cost = 0, fans = 0, reputation = 0, heat = -1, text = "本周无见面会安排。" },
        },
    },
    {
        id = "community",
        title = "社区水友赛",
        description = "举办玩家水友赛，让粉丝与选手同场竞技。",
        options = {
            { label = "线上水友赛（¥8万）", cost = 8, fans = 3000, reputation = 2, heat = 3, text = "水友赛趣味十足，社区活跃度提升。" },
            { label = "线上线下联动（¥40万）", cost = 40, fans = 6500, reputation = 4, heat = 7, text = "联动活动广受好评，破圈效果明显。" },
            { label = "不举办", cost = 0, fans = 0, reputation = 0, heat = -1, text = "本周无社区活动。" },
        },
    },
    {
        id = "scandal",
        title = "舆论风波",
        description = "社交平台出现关于战队的负面讨论，需要公关应对。",
        options = {
            { label = "官方声明（免费）", cost = 0, fans = -1000, reputation = -2, heat = -3, text = "声明发布，但舆论仍在发酵。" },
            { label = "危机公关（¥50万）", cost = 50, fans = 0, reputation = 2, heat = 2, text = "专业公关控制住舆论，声誉回升。" },
            { label = "冷处理", cost = 0, fans = -2000, reputation = -3, heat = -8, text = "冷处理导致讨论升级，粉丝流失。" },
        },
    },
}

-- 月度大型经营事件：每 4 周触发一次，影响跨系统后果与经营风格
EventSystem.MONTHLY_EVENTS = {
    {
        id = "sponsor_negotiation",
        title = " 赞助商年度谈判",
        description = "知名赞助商提出年度合作方案，条件各有侧重，需要你做出战略选择。",
        options = {
            {
                label = "长期稳健合同（¥120万/季，持续 4 季）",
                cost = 0, fans = 5000, reputation = 5, heat = 5,
                sponsorWeeks = 12, sponsorPayment = 120,
                mgmtStyle = "稳健经营",
                text = "签订长期合同，俱乐部财务稳定性大幅提升，声誉上涨。",
            },
            {
                label = "短期高额合同（¥200万/季，仅 2 季）",
                cost = 0, fans = 8000, reputation = 3, heat = 10,
                sponsorWeeks = 6, sponsorPayment = 200,
                mgmtStyle = "激进扩张",
                text = "高额赞助入账，短期现金流充裕，但合同到期后需重新谈判。",
            },
            {
                label = "婉拒，保持独立（免费）",
                cost = 0, fans = -2000, reputation = -2, heat = -3,
                mgmtStyle = "粉丝至上",
                text = "婉拒赞助，保持俱乐部独立性，但错过大量资金。",
            },
        },
    },
    {
        id = "investor_pressure",
        title = " 投资方施压",
        description = "主要投资方对当前成绩和运营提出要求，威胁若不达标将撤资。",
        options = {
            {
                label = "承诺季后赛目标（免费）",
                cost = 0, fans = 0, reputation = 2, heat = 3,
                mgmtStyle = "激进扩张",
                text = "向投资方承诺季后赛目标，全队压力增大，但资金暂时安全。",
            },
            {
                label = "要求更多预算（¥50万 注资）",
                cost = -50, fans = 3000, reputation = 3, heat = 5,
                mgmtStyle = "激进扩张",
                text = "成功说服投资方追加预算，俱乐部运营资金增加。",
            },
            {
                label = "拒绝妥协，自力更生（免费）",
                cost = 0, fans = -1000, reputation = -3, heat = -5,
                mgmtStyle = "稳健经营",
                text = "拒绝投资方要求，关系恶化，未来融资难度增加。",
            },
        },
    },
    {
        id = "fan_protest",
        title = " 粉丝抗议活动",
        description = "部分粉丝对近期成绩和运营不满，在社交媒体组织抗议，要求俱乐部做出改变。",
        options = {
            {
                label = "降价回馈粉丝（¥30万 补贴）",
                cost = 30, fans = 8000, reputation = 5, heat = 8,
                mgmtStyle = "粉丝至上",
                text = "降价补贴活动平息抗议，粉丝忠诚度回升，口碑大涨。",
            },
            {
                label = "公开道歉 + 承诺改进（免费）",
                cost = 0, fans = 2000, reputation = 2, heat = 3,
                mgmtStyle = "稳健经营",
                text = "公开道歉获得理解，抗议活动平息，但仍需实际改进。",
            },
            {
                label = "强硬回应，坚持现有路线（免费）",
                cost = 0, fans = -5000, reputation = -5, heat = -8,
                mgmtStyle = "激进扩张",
                text = "强硬回应激怒更多粉丝，抗议升级，社交媒体负面讨论激增。",
            },
        },
    },
    {
        id = "media_interview",
        title = " 媒体深度采访",
        description = "知名电竞媒体申请对俱乐部进行深度采访，曝光度与压力并存。",
        options = {
            {
                label = "全面开放采访（¥0，曝光 +）",
                cost = 0, fans = 6000, reputation = 4, heat = 10,
                mgmtStyle = "激进扩张",
                text = "深度采访出圈，俱乐部知名度大涨，但战术与内幕也被曝光。",
            },
            {
                label = "控制采访范围（¥0，适度曝光）",
                cost = 0, fans = 3000, reputation = 3, heat = 5,
                mgmtStyle = "稳健经营",
                text = "适度曝光维持热度，同时保护战术机密与选手隐私。",
            },
            {
                label = "婉拒采访（¥0，保持神秘）",
                cost = 0, fans = -1000, reputation = -1, heat = -3,
                mgmtStyle = "粉丝至上",
                text = "婉拒采访保持神秘感，但错过扩大影响力的机会。",
            },
        },
    },
    {
        id = "academy_invest",
        title = " 青训学院扩建",
        description = "青训教练提出扩建学院方案，需要大量前期投入，但长期收益可观。",
        options = {
            {
                label = "立即扩建（¥100万）",
                cost = 100, fans = 4000, reputation = 6, heat = 5,
                mgmtStyle = "稳健经营",
                text = "青训学院扩建完成，未来将培养出更多优质选手，长期收益可观。",
            },
            {
                label = "分期投入（¥50万/季，共 2 季）",
                cost = 50, fans = 2000, reputation = 4, heat = 3,
                mgmtStyle = "稳健经营",
                text = "分期投入减轻财务压力，青训质量稳步提升。",
            },
            {
                label = "暂不扩建（免费）",
                cost = 0, fans = 0, reputation = -2, heat = -2,
                mgmtStyle = "激进扩张",
                text = "放弃扩建计划，短期财务压力减小，但错过青训人才培养机会。",
            },
        },
    },
}

-- 经营风格标签系统：记录玩家连续选择形成的经营风格
EventSystem.MGMT_STYLES = {
    ["激进扩张"] = { label = "激进扩张", desc = "偏好高风险高回报，追求快速成长", color = "#FF7B3D" },
    ["稳健经营"] = { label = "稳健经营", desc = "重视长期稳定，平衡风险与收益", color = "#3DDC84" },
    ["粉丝至上"] = { label = "粉丝至上", desc = "优先考虑粉丝体验，注重口碑与忠诚度", color = "#FFCD42" },
}

-- 经纪人来电模板：动态定价并锁定目标选手（明星优先）
EventSystem.PHONE_TEMPLATES = {
    {
        id = "phone_renewal",
        title = " 续约施压",
        eligible = function(state, ctx) return true end,
        build = function(state, ctx)
            return {
                description = "经纪人打来电话：" .. ctx.player.name .. " 本赛季表现火热，希望现在就谈续约与待遇，否则可能被其他俱乐部乘虚而入。",
                options = {
                    {
                        label = "承诺赛季末优先谈（免费）", cost = 0, morale = 3, desire = -5,
                        text = "经纪人记下承诺，气氛缓和。",
                    },
                    {
                        label = "立即发赛季奖金（¥" .. tostring(ctx.salary * 2) .. "万）", cost = ctx.salary * 2, morale = 8, desire = -12,
                        text = "奖金到账，" .. ctx.player.name .. " 与经纪人非常满意。",
                    },
                    {
                        label = "直言本赛季不谈（免费）", cost = 0, morale = -8, desire = 15,
                        text = "经纪人失望，转会流言开始扩散。",
                    },
                },
            }
        end,
    },
    {
        id = "phone_offer",
        title = " 正式报价",
        eligible = function(state, ctx) return ctx.windowOpen and ctx.marketValue >= 40 end,
        build = function(state, ctx)
            local offerAmount = math.floor(ctx.marketValue * (0.9 + math.random() * 0.2) + 0.5)
            return {
                description = "经纪人来电：" .. ctx.club .. " 对 " .. ctx.player.name .. " 开出 ¥" .. tostring(offerAmount) .. "万 正式报价，询问你的意向。",
                options = {
                    {
                        label = "接受报价放人（¥" .. tostring(offerAmount) .. "万 入账）", cost = 0, income = offerAmount, sell = true,
                        text = "交易达成，" .. ctx.player.name .. " 转会至 " .. ctx.club .. "。",
                    },
                    {
                        label = "要求加价（免费）", cost = 0, heat = 1,
                        text = "你要求加价，谈判继续拉锯。",
                    },
                    {
                        label = "婉拒并安抚（免费）", cost = 0, morale = 2, desire = -5,
                        text = "婉拒报价，承诺未来优先考虑。",
                    },
                },
            }
        end,
    },
    {
        id = "phone_transfer",
        title = " 转会申请",
        eligible = function(state, ctx) return ctx.desire >= 55 or ctx.morale < 50 end,
        build = function(state, ctx)
            return {
                description = ctx.player.name .. " 主动提出转会申请：「我想去更有竞争力的舞台。」经纪人代为转达。",
                options = {
                    {
                        label = "承诺核心地位（免费）", cost = 0, morale = 6, desire = -12,
                        text = "承诺核心地位与上场时间，" .. ctx.player.name .. " 决定再留一年。",
                    },
                    {
                        label = "批准挂牌" .. (ctx.windowOpen and "" or "（休市期，开窗优先）") .. "（免费）", cost = 0, list = true, desire = -5,
                        text = ctx.windowOpen and "申请批准，" .. ctx.player.name .. " 进入挂牌流程。" or "申请批准，休市期结束优先挂牌。",
                    },
                    {
                        label = "驳回复议（免费）", cost = 0, morale = -10, desire = 10,
                        text = "驳回申请，" .. ctx.player.name .. " 情绪低落。",
                    },
                },
            }
        end,
    },
    {
        id = "phone_poach",
        title = " 挖角警告",
        eligible = function(state, ctx) return true end,
        build = function(state, ctx)
            return {
                description = "经纪人透露：" .. ctx.club .. " 正在私下接触 " .. ctx.player.name .. " 的团队，准备用违约金强挖。",
                options = {
                    {
                        label = "加薪留人（¥" .. tostring(ctx.salary * 3) .. "万）", cost = ctx.salary * 3, morale = 10, desire = -15,
                        text = "新合同待遇到位，" .. ctx.player.name .. " 更衣室忠诚度上升。",
                    },
                    {
                        label = "动之以情（免费）", cost = 0, morale = 4, desire = -5,
                        text = "一次深夜长谈，" .. ctx.player.name .. " 表态留下。",
                    },
                    {
                        label = "随他去吧（免费）", cost = 0, morale = -12, desire = 20, heat = 2,
                        text = "放任不管，挖角流言在全网发酵。",
                    },
                },
            }
        end,
    },
}

-- 经营风格标签系统：记录/更新玩家经营风格
function EventSystem.UpdateMgmtStyle(state, style)
    state = CompanyState.Ensure(state)
    state.company.mgmtStyle = state.company.mgmtStyle or {}
    local ms = state.company.mgmtStyle
    ms.current = style
    ms.history = ms.history or {}
    table.insert(ms.history, { week = state.company.week, style = style })
    -- 保留最近 10 次选择
    while #ms.history > 10 do table.remove(ms.history, 1) end
    -- 计算主导风格
    local counts = {}
    for _, entry in ipairs(ms.history) do
        counts[entry.style] = (counts[entry.style] or 0) + 1
    end
    local dominant = nil
    local maxCount = 0
    for styleName, count in pairs(counts) do
        if count > maxCount then
            maxCount = count
            dominant = styleName
        end
    end
    ms.dominant = dominant
    return state
end

-- 获取当前经营风格（用于 UI 展示）
function EventSystem.GetMgmtStyle(state)
    state = CompanyState.Ensure(state)
    local ms = state.company.mgmtStyle or {}
    return ms.dominant or "未定型", ms.current or "未定型"
end

-- 月度大型经营事件触发检查：每 4 周触发一次（第 4/8/12... 周）
function EventSystem.ShouldTriggerMonthly(state)
    state = CompanyState.Ensure(state)
    local week = tonumber(state.company.week) or 1
    -- 每 4 周触发，且不在季后赛/世界赛期间
    local seasonState = state.company.seasonState or "regular"
    if seasonState == "playoff" or seasonState == "champion" or seasonState == "masters" then
        return false
    end
    return week % 4 == 0 and week > 0
end

-- 生成月度大型经营事件
function EventSystem.RollMonthlyEvent(state)
    state = CompanyState.Ensure(state)
    if state.events.pending then return nil end
    if not EventSystem.ShouldTriggerMonthly(state) then return nil end
    local event = EventSystem.MONTHLY_EVENTS[math.random(#EventSystem.MONTHLY_EVENTS)]
    state.events.pending = {
        id = event.id,
        kind = "monthly",
        title = event.title,
        description = event.description,
        options = event.options,
    }
    return state.events.pending
end

-- 挑选电话事件主角：阵中战力/潜力最高的明星
function EventSystem.PickPhoneTarget(state)
    local RosterSystem = require("RosterSystem")
    local metaRole = state.meta and state.meta.role
    local candidates = {}
    for _, entry in ipairs(RosterSystem.GetRosterPlayers(state)) do
        local player = entry.player
        local power = RosterSystem.GetPlayerPower(player, metaRole)
        if (tonumber(player.potential) or 0) >= 75 or power >= 70 then
            table.insert(candidates, player)
        end
    end
    if #candidates == 0 then return nil end
    table.sort(candidates, function(a, b)
        return RosterSystem.GetPlayerPower(a, metaRole) > RosterSystem.GetPlayerPower(b, metaRole)
    end)
    return candidates[1]
end

-- 构建经纪人来电待决事件
function EventSystem.BuildPhoneEvent(state)
    state = CompanyState.Ensure(state)
    local player = EventSystem.PickPhoneTarget(state)
    if not player then return nil end
    local MarketSystem = require("MarketSystem")
    local MoraleSystem = require("MoraleSystem")
    local ctx = {
        player = player,
        salary = math.max(1, tonumber(player.salary) or 8),
        marketValue = MarketSystem.GetMarketValue(state, player.id),
        desire = MarketSystem.GetDesire(state, player.id),
        morale = MoraleSystem.Get(player),
        windowOpen = MarketSystem.IsTransferWindow(state),
        club = MarketSystem.PickClubName(state),
    }
    local templates = {}
    for _, t in ipairs(EventSystem.PHONE_TEMPLATES) do
        if t.eligible(state, ctx) then table.insert(templates, t) end
    end
    if #templates == 0 then return nil end
    local template = templates[math.random(#templates)]
    local built = template.build(state, ctx)
    state.events.pending = {
        id = template.id,
        kind = "phone",
        title = template.title,
        description = built.description,
        playerId = player.id,
        playerName = player.name,
        options = built.options,
    }
    return state.events.pending
end

function EventSystem.RollEvent(state)
    state = CompanyState.Ensure(state)
    if state.events.pending then return nil end
    -- 运营活动事件：约六成周出现
    if math.random() <= 0.6 then
        local event = EventSystem.EVENTS[math.random(#EventSystem.EVENTS)]
        state.events.pending = {
            id = event.id,
            title = event.title,
            description = event.description,
            options = event.options,
        }
        return state.events.pending
    end
    -- 经纪人来电：约三成周出现（需要阵中有明星）
    if math.random() <= 0.3 then
        return EventSystem.BuildPhoneEvent(state)
    end
    return nil
end

function EventSystem.GetOptionCost(state, option)
    if not option then return 0 end
    return StaffSystem.GetEventCost(state, option.cost)
end

function EventSystem.ResolveEvent(state, optionIndex)
    state = CompanyState.Ensure(state)
    local pending = state.events.pending
    if not pending then return false, "当前没有待处理的运营事件" end
    local option = pending.options[optionIndex]
    if not option then return false, "无效选项" end
    local cost = EventSystem.GetOptionCost(state, option)
    if cost > 0 and state.company.cash < cost then return false, "现金不足" end
    -- 处理负成本（注资/收入）
    state.company.cash = state.company.cash - cost
    state.company.fans = state.company.fans + (option.fans or 0)
    -- 商业事件（粉丝增长）联动队内最高流量选手品牌曲线（#43）
    if (option.fans or 0) > 0 then
        local PlayerEcoSystem = require("PlayerEcoSystem")
        PlayerEcoSystem.ApplyEventBrand(state, option.fans)
    end
    state.company.reputation = math.max(0, math.min(100, state.company.reputation + (option.reputation or 0)))
    if option.heat and option.heat ~= 0 then
        local SocialSystem = require("SocialSystem")
        state = SocialSystem.Ensure(state)
        state.social.heat = math.max(0, math.min(100, state.social.heat + option.heat))
    end
    -- 月度事件特殊后果：赞助商合同
    if pending.kind == "monthly" then
        if option.sponsorWeeks and option.sponsorPayment then
            local SponsorSystem = require("SponsorSystem")
            -- 添加临时赞助商合同
            state.company.sponsors = state.company.sponsors or {}
            state.company.sponsors.active = state.company.sponsors.active or {}
            local slotName = "monthly_" .. tostring(state.company.week)
            state.company.sponsors.active[slotName] = {
                offerId = "sp_monthly_" .. pending.id,
                payment = option.sponsorPayment,
                weeksLeft = option.sponsorWeeks,
            }
        end
    end
    -- 经营风格标签更新
    if option.mgmtStyle then
        state = EventSystem.UpdateMgmtStyle(state, option.mgmtStyle)
    end
    if pending.kind == "phone" and pending.playerId then
        local player = LeagueCatalog.GetPlayer(pending.playerId)
        if player then
            local MoraleSystem = require("MoraleSystem")
            if option.morale and option.morale ~= 0 then
                MoraleSystem.Change(player, option.morale)
            end
            local MarketSystem = require("MarketSystem")
            if option.desire and option.desire ~= 0 then
                MarketSystem.SetDesire(state, pending.playerId, MarketSystem.GetDesire(state, pending.playerId) + option.desire)
            end
            if option.income then
                state.company.cash = state.company.cash + math.max(0, math.floor(option.income + 0.5))
            end
            if option.sell then
                EventSystem.SellToOffer(state, pending.playerId)
            end
            if option.list then
                local ok = MarketSystem.ListPlayer(state, pending.playerId)
                if not ok then
                    MarketSystem.SetDesire(state, pending.playerId, math.min(100, MarketSystem.GetDesire(state, pending.playerId) + 8))
                end
            end
        end
    end
    state.events.pending = nil
    CompanyState.RecordTimeline(state, pending.title, option.text)
    return true, option
end

-- 接受经纪人报价：按报价金额直接成交（无需等转会窗结算）
function EventSystem.SellToOffer(state, playerId)
    for role, pid in pairs(state.roster.players) do
        if pid == playerId then state.roster.players[role] = "" end
    end
    state.roster.contracts[playerId] = nil
    state.roster.buyouts[playerId] = nil
    state.roster.desire[playerId] = nil
    state.market.listed[playerId] = nil
    state.market.wars[playerId] = nil
    state.roster.chemistry = math.max(0, (state.roster.chemistry or 0) - 8)
end

return EventSystem
