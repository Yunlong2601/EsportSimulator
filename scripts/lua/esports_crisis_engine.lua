--[[
    ============================================================================
    ESPORTS CRISIS & MORAL DILEMMA ENGINE (电竞突发戏剧危机与道德两难引擎)
    ============================================================================
    Target Platform: TapTap Maker (Pure Lua 5.4)
    Design Philosophy:
      1. 人生摩擦力与戏剧冲突：更衣室矛盾、豪门挖角、封闭针医疗抉择、菠菜诱惑、公关热搜
      2. 关键两难分支抉择：多选项博弈，权衡资金、士气、微操、信任度、声望与伤病风险
      3. 状态闭环：影响 Player 状态、Dynasty 资金、Coach 信任度以及比赛临场胜率
    ============================================================================
--]]

local EsportsCrisisEngine = {}

EsportsCrisisEngine.CRISIS_DEFINITIONS = {
    {
        id = "crisis_locker_room",
        title = "更衣室争吵与理念决裂 (Locker Room Rift)",
        category = "TEAM_MORALE",
        triggerPhase = 2,
        banner = "🚨【更衣室紧急事态】两名首发核心赛后互掷水杯，战队内部沟通濒临崩溃！",
        scenario = "昨日常规赛被翻盘后，主力中单与打野在更衣室爆发激烈言语冲突。中单怒斥打野“永远不保中路”，打野反击中单“对线送头带崩全局”。教练组调解未果，全队士气低迷！",
        options = {
            {
                label = "🛡️ 公开力挺中单核心，确立中路绝对战术地位",
                desc = "中单信心爆棚 (微操+8)，但打野心生不满 (士气-20，协同度-10)",
                resolve = function(game)
                    game.player.mechanics = math.min(100, game.player.mechanics + 8)
                    game.player.mental = math.max(10, game.player.mental - 5)
                    return {
                        success = true,
                        story = "你公开宣布本赛季围绕中路构建战术。中单重获信心并在训练赛杀疯，但打野在休息区沉默不语，化学反应需要时间修复！",
                        buff = "中路刺杀率提升，野区联动略微迟滞"
                    }
                end
            },
            {
                label = "⚖️ 各打五十大板！通报批评并处以 $10,000 纪律罚款",
                desc = "全员遵守铁纪规章，俱乐部信任度 +8，队员心理略微压抑 (心态-5)",
                resolve = function(game)
                    if game.coach then game.coach.trust = math.min(100, (game.coach.trust or 75) + 8) end
                    game.player.mental = math.max(10, game.player.mental - 5)
                    return {
                        success = true,
                        story = "铁面无私的罚单震慑了全队！更衣室争吵迅速平息，董事会高度赞赏你的铁血管理魄力，信任度提升！",
                        buff = "团队纪律性拉满，战术失误率下降"
                    }
                end
            },
            {
                label = "🩺 斥资 $15,000 聘请知名运动心理学专家深入破冰疏导",
                desc = "消耗 $15,000 资金，化解矛盾，全员心态 +15，协同默契 +10",
                resolve = function(game)
                    local cost = 15000
                    if (game.dynasty_engine and game.dynasty_engine.budget and game.dynasty_engine.budget >= cost) then
                        game.dynasty_engine.budget = game.dynasty_engine.budget - cost
                    else
                        game.player.money = math.max(0, game.player.money - cost)
                    end
                    game.player.mental = math.min(100, game.player.mental + 15)
                    return {
                        success = true,
                        story = "长达 4 小时的敞开心扉心理团建彻底融化了隔阂！两位核心选手在复盘中主动拥抱道歉，全队凝聚力达到空前高度！",
                        buff = "团队化学反应拉满，逆境翻盘率 +15%"
                    }
                end
            }
        }
    },
    {
        id = "crisis_poaching",
        title = "豪门暗中违规挖角 (Rival Poaching War)",
        category = "TRANSFER",
        triggerPhase = 2,
        banner = "🕵️【联盟暗流涌动】海外豪门开出两倍天价暗中接触队内主力！",
        scenario = "据可靠电竞爆料人透露，LCK 豪门 T1 与北美 TL 俱乐部已在转会期前夕私下接触你的主力下路王牌，并承诺提供两倍年薪与豪车。选手经纪人带着报价单直接敲响了你的办公室大门！",
        options = {
            {
                label = "🏛️ 向全球赛事仲裁委员会提交证据，指控其恶意违规接触",
                desc = "敌方豪门面临调查，俱乐部声誉 +15，但选手本人略有遗憾",
                resolve = function(game)
                    game.player.fame = (game.player.fame or 50) + 15
                    return {
                        success = true,
                        story = "强硬的官方仲裁让海外豪门狼狈撤回了接触！联盟官方通报批评违规俱乐部，你守护了俱乐部的尊严，粉丝全网点赞！",
                        buff = "战队品牌公信度提升，赞助商信任度 +10%"
                    }
                end
            },
            {
                label = "💰 斥资 $60,000 启动顶薪匹配条款，直接锁定 3 年长约",
                desc = "消耗金库 $60,000，核心选手死心塌地留队，狂热度 +20",
                resolve = function(game)
                    local cost = 60000
                    if (game.dynasty_engine and game.dynasty_engine.budget and game.dynasty_engine.budget >= cost) then
                        game.dynasty_engine.budget = game.dynasty_engine.budget - cost
                    else
                        game.player.money = math.max(0, game.player.money - cost)
                    end
                    game.player.fame = (game.player.fame or 50) + 20
                    return {
                        success = true,
                        story = "豪掷千金的顶薪长约展现了王朝雄心！选手当场含泪签字，并在社交媒体宣称‘此生不离战队，誓夺总冠军’！",
                        buff = "选手忠诚度爆表，关键局大心脏爆发率 +20%"
                    }
                end
            },
            {
                label = "🔄 顺水推舟：以 $200,000 转会天价出售套现，提拔青训新人",
                desc = "金库暴涨 +$200,000，战力短暂受损，需重新磨合阵容",
                resolve = function(game)
                    local income = 200000
                    if game.dynasty_engine and game.dynasty_engine.budget then
                        game.dynasty_engine.budget = game.dynasty_engine.budget + income
                    else
                        game.player.money = game.player.money + income
                    end
                    game.player.mechanics = math.max(60, game.player.mechanics - 5)
                    return {
                        success = true,
                        story = "一笔震惊全网的天价转会交易达成！俱乐部进账巨额转会费，成功实现财政自负盈亏并为未来引援储备弹药！",
                        buff = "金库充盈 +$200,000，青训体系获得充裕投资"
                    }
                end
            }
        }
    },
    {
        id = "crisis_wrist_pain",
        title = "决胜局封闭针两难抉择 (Painkiller Dilemma)",
        category = "MEDICAL",
        triggerPhase = 1,
        banner = "🩺【医疗紧急通报】重度手腕肌腱炎突发，决胜战役前夕面临医疗抉择！",
        scenario = "距离今晚关键决胜比赛仅剩 2 小时，主力选手手腕肌腱严重肿胀，连鼠标右键点击都剧痛难忍。队医康复团队提出了两种截然不同的医疗应对方案！",
        options = {
            {
                label = "💉 冒险注射强效封闭抗炎针，强行打满全场",
                desc = "本场比赛微操 +15%，但赛后手腕劳损负荷大幅激增",
                resolve = function(game)
                    game.player.mechanics = math.min(100, game.player.mechanics + 15)
                    if game.player.career_health then
                        game.player.career_health.wrist_strain = math.min(100, (game.player.career_health.wrist_strain or 30) + 35)
                    end
                    return {
                        success = true,
                        story = "冰冷的针剂注入手腕，痛觉被强行麻醉屏蔽！你在赛场上重现神级微操，但赛后手腕冰敷时隐隐作痛，需要尽快休整！",
                        buff = "当场比赛操作战力暴涨，赛后需立即理疗"
                    }
                end
            },
            {
                label = "🛡️ 遵从医嘱稳妥换人：安排替补登场，主力安心休息",
                desc = "保全选手职业寿命，全队战意激励，但本场战力 -10%",
                resolve = function(game)
                    game.player.mental = math.min(100, game.player.mental + 10)
                    if game.player.career_health then
                        game.player.career_health.wrist_strain = math.max(0, (game.player.career_health.wrist_strain or 30) - 20)
                    end
                    return {
                        success = true,
                        story = "以人为本的管理理念感动了全员！替补选手临危受命打出奇迹抗压，主力手腕肌腱得到宝贵修养，赢得全网掌声！",
                        buff = "手腕负荷显著消退，全队凝聚力提升"
                    }
                end
            },
            {
                label = "❄️ 启用高精经络电刺激与德国冷冻理疗设备 ($8,000)",
                desc = "消耗个人资金 $8,000，微操恢复 +8，手腕劳损下降 15%",
                resolve = function(game)
                    game.player.money = math.max(0, game.player.money - 8000)
                    game.player.mechanics = math.min(100, game.player.mechanics + 8)
                    if game.player.career_health then
                        game.player.career_health.wrist_strain = math.max(0, (game.player.career_health.wrist_strain or 30) - 15)
                    end
                    return {
                        success = true,
                        story = "高科技冷冻舱与微电流刺激立竿见影！炎症被快速控制在安全范围内，选手在无后顾之忧的情况下登台作战！",
                        buff = "手腕伤情安全控制，状态平稳发挥"
                    }
                end
            }
        }
    },
    {
        id = "crisis_matchfixing",
        title = "暗网菠菜涉假诱惑公案 (Integrity & Anti-Matchfixing)",
        category = "ETHICS",
        triggerPhase = 1,
        banner = "⚠️【廉洁安全警报】神秘中介开出天价巨款诱惑打大龙坑‘假赛’！",
        scenario = "深夜，一位自称海外财团代理人的神秘男子通过加密渠道发来私信，许诺只要在接下来的世界赛关键局大龙坑“失误漏掉惩戒”，赛后便可入账 $200,000 USDT 数字货币！",
        options = {
            {
                label = "⚖️ 立即截图存证，向联盟廉洁公署 (Integrity Commission) 实名举报",
                desc = "彰显职业电竞人纯粹操守！名望 +25，获颁‘电竞道德风尚奖’",
                resolve = function(game)
                    game.player.fame = (game.player.fame or 50) + 25
                    game.player.mental = math.min(100, game.player.mental + 10)
                    return {
                        success = true,
                        story = "正义绝不迟到！联盟廉政公署联合警方一举捣毁跨国涉赌窝点，官博发布表彰通告，你的名字成为电竞圈清风正气的象征！",
                        buff = "获颁电竞道德风尚奖，粉丝关注度 +20,000"
                    }
                end
            },
            {
                label = "🗡️ 冷面拉黑删除！在赛场上用绝境抢龙狠狠打脸操盘手",
                desc = "战意沸腾！大心脏评级 +15，本局大龙坑抢龙概率翻倍",
                resolve = function(game)
                    game.player.mental = math.min(100, game.player.mental + 15)
                    game.player.mechanics = math.min(100, game.player.mechanics + 5)
                    return {
                        success = true,
                        story = "“我的梦想，不是你们这帮蛆虫能明码标价的！”赛场上你顶住巨大压力在万众瞩目下完成绝境抢龙，终结比赛！",
                        buff = "决胜时刻胜率 +18%，心态固若金汤"
                    }
                end
            }
        }
    },
    {
        id = "crisis_pr_storm",
        title = "赛后采访整活引发舆论风暴 (Post-Match PR Storm)",
        category = "COMMUNITY",
        triggerPhase = 2,
        banner = "📢【社交媒体沸腾】赛后采访口嗨引爆热搜，赞助商要求公关解释！",
        scenario = "在击败老牌劲旅后，队内年轻小将在胜者采访中语出惊人：‘我觉得对面打得像人机，完全没压力’。该言论迅速冲上微博热搜与推特趋势第一，两队粉丝掀起全网口水战！",
        options = {
            {
                label = "🎭 顺水推舟，官博带头玩梗做成专属表情包宣发",
                desc = "年轻粉丝狂热狂欢，全网热度暴涨，新增粉丝 +12,000 人",
                resolve = function(game)
                    game.player.fame = (game.player.fame or 50) + 30
                    if game.community_engine then
                        game.community_engine.fanbase_count = (game.community_engine.fanbase_count or 10000) + 12000
                    end
                    return {
                        success = true,
                        story = "高超的整活公关把危机变成了狂欢！官博火速上线选手‘狂妄神图’表情包，战队热度直接登顶各大平台！",
                        buff = "全网商业曝光度 +25%，周边战袍销量 +15%"
                    }
                end
            },
            {
                label = "🕊️ 带领选手发布真诚道歉信，并向青训发展基金捐赠 $10,000",
                desc = "展现豪门成熟气度与谦逊风范，挽回主流媒体赞助好评",
                resolve = function(game)
                    local cost = 10000
                    game.player.money = math.max(0, game.player.money - cost)
                    if game.coach then game.coach.trust = math.min(100, (game.coach.trust or 75) + 10) end
                    return {
                        success = true,
                        story = "诚恳的致歉与公益捐赠赢得了电竞主流圈的普遍尊重！传统商业品牌赞助商高度赞赏俱乐部的风控水准，追加了季度赞助！",
                        buff = "赞助商回报倍率提升至 1.15x"
                    }
                end
            }
        }
    }
}

function EsportsCrisisEngine.getRandomCrisis(phase)
    phase = phase or 1
    local available = {}
    for _, c in ipairs(EsportsCrisisEngine.CRISIS_DEFINITIONS) do
        if not c.triggerPhase or c.triggerPhase <= phase then
            table.insert(available, c)
        end
    end
    if #available == 0 then return EsportsCrisisEngine.CRISIS_DEFINITIONS[1] end
    return available[math.random(1, #available)]
end

function EsportsCrisisEngine.resolveChoice(game, crisisId, choiceIndex)
    choiceIndex = choiceIndex or 1
    local crisis = nil
    for _, c in ipairs(EsportsCrisisEngine.CRISIS_DEFINITIONS) do
        if c.id == crisisId then
            crisis = c
            break
        end
    end
    if not crisis then
        return false, "未找到对应的危机事件"
    end

    local opt = crisis.options[choiceIndex] or crisis.options[1]
    local result = opt.resolve(game)

    table.insert(game.crisis_history, {
        crisisId = crisis.id,
        title = crisis.title,
        choiceLabel = opt.label,
        story = result.story,
        buff = result.buff,
        timestamp = os.time and os.time() or 0
    })

    -- Clear pending crisis
    game.pending_crisis = nil

    local logMsg = string.format("⚖️【危机决断完成】[%s] -> 选择: %s\n   📜 结果: %s", crisis.title, opt.label, result.story)
    game:log(logMsg)

    return true, logMsg, result
end

return EsportsCrisisEngine
