--[[
    ============================================================================
    MATCH HIGHLIGHT & MULTI-ROUND TACTICAL BROADCAST ENGINE (多回合高光战报引擎)
    ============================================================================
    Target Platform: TapTap Maker (Pure Lua 5.4)
    Design Philosophy:
      1. 4 大战术回合逐层推演 (0-10m 对线抢二, 10-20m 控图先锋, 20-30m 大龙团灭, 30-35m 决死推平)
      2. 精彩镜头高光捕获 (First Blood, Baron Steal, 1v3 Clutch, Pentakill Ace)
      3. 赛后官方解说语录与电竞名局归档
    ============================================================================
--]]

local MatchHighlightEngine = {}

MatchHighlightEngine.COMMENTARY_QUOTES = {
    win = {
        "“天不生我 Faker，万古中道如长夜！这一波团战直接宣判了比赛死刑！”",
        "“绝境之中力挽狂澜！这就是顶级中单的世界赛大心脏！”",
        "“他们在这个龙坑完成了不可思议的奇迹团灭！全场都在呼喊他们的名字！”",
        "“教科书级的兵线运营与拉扯，精密得像瑞士钟表一样无懈可击！”"
    },
    loss = {
        "“可惜啊！大龙坑的一丝犹豫断送了前三十分钟积攒的全部优势！”",
        "“这就是残酷的竞技电竞，一着不慎，满盘皆输，但他们战斗到了最后一刻！”",
        "“双拳难敌四手，虽然打出了孤勇者的输出，但敌方体系阵型更胜一筹。”"
    }
}

function MatchHighlightEngine.simulateDetailedMatch(playerTeamName, enemyTeamName, playerEffPower, enemyEffPower, tacticalBuff)
    playerTeamName = playerTeamName or "你方战队"
    enemyTeamName = enemyTeamName or "敌方战队"
    playerEffPower = playerEffPower or 80
    enemyEffPower = enemyEffPower or 80
    tacticalBuff = tacticalBuff or 0

    local baseWinRate = 50 + (playerEffPower - enemyEffPower) * 1.5 + tacticalBuff
    baseWinRate = math.min(95, math.max(10, baseWinRate))

    local rounds = {}
    local highlights = {}
    local myKills = 0
    local enemyKills = 0
    local myDragons = 0
    local enemyDragons = 0
    local baronTakenBy = nil

    -- ------------------------------------------------------------------------
    -- ROUND 1: 00-10m 前期对线博弈与第一滴血 (Lane Phase & First Blood)
    -- ------------------------------------------------------------------------
    local r1_roll = math.random(1, 100)
    local r1_win = r1_roll <= (baseWinRate * 0.9 + 5)
    if r1_win then
        myKills = myKills + 2
        table.insert(rounds, {
            phase = "对线期 (0-10m)",
            title = "⚡ 抢二级极限单杀 · 第一滴血 (First Blood)",
            desc = string.format("【%s】对线展现细腻卡兵绝活！升2瞬间闪现挂点燃完成越塔单杀，斩获一血！打野迅速反蹲化解敌方越塔，经济领先 +$1,200！", playerTeamName),
            type = "lead",
            winner = "SELF"
        })
        table.insert(highlights, {
            time = "03:24",
            tag = "🩸 FIRST BLOOD",
            text = "中路二级极限走位躲过敌方致命控制，闪现接普攻斩杀敌方中单！"
        })
    else
        enemyKills = enemyKills + 2
        table.insert(rounds, {
            phase = "对线期 (0-10m)",
            title = "⚠️ 敌方二级包抄 · 边路受挫",
            desc = string.format("【%s】打野出其不意二级红开抓下，我方双人组交闪后仍被击杀一人。但中路稳住补刀压制，经济微落后 -$800。", enemyTeamName),
            type = "trail",
            winner = "ENEMY"
        })
        table.insert(highlights, {
            time = "04:12",
            tag = "🛡️ 绝境极限逃生",
            text = string.format("【%s】二级抓下越塔，我方防守拉扯反杀一人，打出极限防守反击！", enemyTeamName)
        })
    end

    -- ------------------------------------------------------------------------
    -- ROUND 2: 10-20m 峡谷先锋与小龙控图 (Objectives & Skirmishes)
    -- ------------------------------------------------------------------------
    local r2_roll = math.random(1, 100)
    local r2_win = r2_roll <= baseWinRate
    if r2_win then
        myKills = myKills + 3
        myDragons = myDragons + 2
        table.insert(rounds, {
            phase = "转线期 (10-20m)",
            title = "🐉 先锋撞毁一塔 · 控下双龙听牌",
            desc = string.format("【%s】野区视野全面点亮！先锋团战完美0换2，先锋直撞中路一塔剥夺防御塔镀层，顺势收下第二条海克斯小龙！", playerTeamName),
            type = "lead",
            winner = "SELF"
        })
        table.insert(highlights, {
            time = "14:50",
            tag = "💥 峡谷伏击战",
            text = "河道草丛精准卡视野埋伏，大招瞬间融化敌方射手，斩获先锋之眼！"
        })
    else
        enemyKills = enemyKills + 3
        enemyDragons = enemyDragons + 2
        table.insert(rounds, {
            phase = "转线期 (10-20m)",
            title = "⚔️ 小龙坑惨烈肉搏 · 资源互换",
            desc = string.format("双方在下半区爆发 5v5 大混战！【%s】利用强开体系冲散阵型，拿下第二条听牌龙，我方顽强换掉两人保全兵线。", enemyTeamName),
            type = "trail",
            winner = "ENEMY"
        })
        table.insert(highlights, {
            time = "16:20",
            tag = "⚔️ 龙坑决死拼惩",
            text = "双方在小龙坑爆发激烈混战，双方打野拼惩戒血拼，战况焦灼！"
        })
    end

    -- ------------------------------------------------------------------------
    -- ROUND 3: 20-30m 纳什男爵决死团 (Baron Pit Turning Point)
    -- ------------------------------------------------------------------------
    local r3_roll = math.random(1, 100)
    local r3_win = r3_roll <= (baseWinRate * 1.1 - 5)
    if r3_win then
        myKills = myKills + 4
        baronTakenBy = "SELF"
        table.insert(rounds, {
            phase = "大龙团 (20-30m)",
            title = "👑 纳什男爵神级开团 · 团灭对手 (ACE)",
            desc = string.format("24分30秒大龙生死决战！我方辅助盲视野闪现大招击飞三人！核心双C跟进伤害爆炸，团灭【%s】并斩获纳什男爵之赐！", enemyTeamName),
            type = "clutch",
            winner = "SELF"
        })
        table.insert(highlights, {
            time = "24:35",
            tag = "🌟 ACE 团灭大龙",
            text = "绝命一波！闪现切入万军丛中秒杀敌方核心，斩获大龙并团灭对手！"
        })
    else
        enemyKills = enemyKills + 3
        baronTakenBy = "ENEMY"
        table.insert(rounds, {
            phase = "大龙团 (20-30m)",
            title = "🚨 龙坑拉扯失手 · 敌方偷下男爵",
            desc = string.format("【%s】利用大龙逼团诱敌深入，侧翼包抄秒杀我方打野后强行Rush击杀纳什男爵，全员进入高地防守反击阶段！", enemyTeamName),
            type = "danger",
            winner = "ENEMY"
        })
        table.insert(highlights, {
            time = "25:10",
            tag = "🚨 高地生死防守",
            text = string.format("【%s】强行Rush男爵逼近高地，我方全员死守门牙塔殊死抵抗！", enemyTeamName)
        })
    end

    -- ------------------------------------------------------------------------
    -- ROUND 4: 30-35m 终局决死与水晶推平 (Nexus Finale)
    -- ------------------------------------------------------------------------
    local finalScore = (r1_win and 1 or 0) + (r2_win and 1.2 or 0) + (r3_win and 1.8 or 0)
    local matchWon = finalScore >= 1.8

    local casterQuote = ""
    if matchWon then
        myKills = myKills + 5
        local qList = MatchHighlightEngine.COMMENTARY_QUOTES.win
        casterQuote = qList[math.random(1, #qList)]
        table.insert(rounds, {
            phase = "终局决战 (30-35m)",
            title = "🏆 摧毁敌方水晶枢纽 · 登峰凯旋 (VICTORY)",
            desc = string.format("携带大龙超级兵直破三路高地！双C并肩作战打出神仙拉扯收割战场，在敌方泉水前击碎水晶枢纽！全场万名观众起立欢呼！"),
            type = "victory",
            winner = "SELF"
        })
        table.insert(highlights, {
            time = "32:18",
            tag = "🔥 PENTAKILL 终结",
            text = "门牙塔下极限走位反杀打出五杀神迹！现场解说疯狂呐喊，一波推平水晶！"
        })
    else
        enemyKills = enemyKills + 5
        local qList = MatchHighlightEngine.COMMENTARY_QUOTES.loss
        casterQuote = qList[math.random(1, #qList)]
        table.insert(rounds, {
            phase = "终局决战 (30-35m)",
            title = "💔 高地绝境守护 · 遗憾惜败 (DEFEAT)",
            desc = string.format("三路高地被破陷入苦战，面对敌方四龙魂与远古龙压境，全队在门牙塔下拼光所有技能换掉四人，终因超级兵数量差距告负。"),
            type = "defeat",
            winner = "ENEMY"
        })
        table.insert(highlights, {
            time = "33:45",
            tag = "💔 鏖战终局惜败",
            text = "远古龙坑殊死一搏，双方打出四换四惨烈终局！"
        })
    end

    local matchReport = {
        won = matchWon,
        playerScore = myKills,
        enemyScore = enemyKills,
        dragons = myDragons,
        baronTakenBy = baronTakenBy,
        rounds = rounds,
        highlights = highlights,
        casterQuote = casterQuote,
        matchDuration = "33分18秒",
        mvpPlayer = matchWon and (playerTeamName .. " 核心中单") or (enemyTeamName .. " 明星战力")
    }

    return matchWon, matchReport
end

return MatchHighlightEngine
