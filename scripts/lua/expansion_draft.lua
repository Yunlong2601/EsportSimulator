-- ============================================================================
-- LEAGUE EXPANSION DRAFT SYSTEM (联盟扩军特权选秀与超新星池)
-- Ported from Web: src/data/expansionDraftData.ts & LeagueExpansionDraftModal.tsx
-- ============================================================================

local ExpansionDraft = {}

ExpansionDraft.FRANCHISE_NAMES = {
    "极光新纪元 (Aurora Gaming)",
    "深空泰坦重工 (Titan Heavy Gaming)",
    "幽蓝星际战队 (Nebula Esports)",
    "赤焰破晓 (Blaze Vanguard)",
    "幻影银河 (Phantom Galaxy)",
    "神话黎明 (Mythic Dawn)"
}

ExpansionDraft.INITIAL_PRODIGIES_POOL = {
    {
        id = "prodigy-mid-1",
        name = "顾清锋",
        alias = "峡谷第一刺客 · 绝影",
        role = "MID",
        age = 17,
        country = "中国",
        avatar = "🗡️",
        mechanics = 96,
        macro = 86,
        morale = 95,
        potential = "SSS",
        potentialRating = 99,
        playstyle = "Aggressive",
        signatureChampion = "影流之主 (劫)",
        specialTrait = {
            name = "初生牛犊不畏虎",
            description = "天梯成名战曾一人单杀三位职业中单，打法凶狠孤傲，压迫感窒息。",
            buffLabel = "生死战极限操作 +18% · 首发登场狂热度 +20%"
        },
        contractSalary = 11000,
        signingBonus = 35000,
        soloQueueRank = "国服峡谷之巅第 1 名 (1,820 LP)",
        draftUrgency = "EXCLUSIVE"
    },
    {
        id = "prodigy-jug-1",
        name = "朴俊熙 (Lucid)",
        alias = "韩服1700分路人王",
        role = "JUG",
        age = 18,
        country = "韩国",
        avatar = "⚡",
        mechanics = 93,
        macro = 94,
        morale = 92,
        potential = "SSS",
        potentialRating = 98,
        playstyle = "Macro-Oriented",
        signatureChampion = "盲僧 / 破败之王",
        specialTrait = {
            name = "神算野区掌控",
            description = "对敌方打野每一步刷野路线如数家珍，控龙率高达 88%。",
            buffLabel = "全图大局观连携 +15% · 史诗野怪争夺胜率 +25%"
        },
        contractSalary = 12500,
        signingBonus = 40000,
        soloQueueRank = "韩服王者第 2 名 (1,745 LP)",
        draftUrgency = "EXCLUSIVE"
    },
    {
        id = "prodigy-adc-1",
        name = "林星辞 (ViperX)",
        alias = "16岁峡谷暴走狂花",
        role = "ADC",
        age = 16,
        country = "中国",
        avatar = "🎯",
        mechanics = 97,
        macro = 84,
        morale = 98,
        potential = "SSS",
        potentialRating = 99,
        playstyle = "Clutch",
        signatureChampion = "暗夜猎手 (薇恩) / 德莱文",
        specialTrait = {
            name = "绝境大心脏收割",
            description = "团战仅剩一丝血时从不后退，以不可思议的走位反向操作完成五杀。",
            buffLabel = "逆风决战残局翻盘胜率 +22% · 团战暴击伤害 +15%"
        },
        contractSalary = 10500,
        signingBonus = 32000,
        soloQueueRank = "国服峡谷之巅第 3 名 (1,690 LP)",
        draftUrgency = "HIGH"
    },
    {
        id = "prodigy-top-1",
        name = "钟天岳 (Aegis)",
        alias = "铁壁战神 · 剑魔绝活",
        role = "TOP",
        age = 18,
        country = "中国",
        avatar = "🛡️",
        mechanics = 92,
        macro = 89,
        morale = 94,
        potential = "SS",
        potentialRating = 96,
        playstyle = "Defensive",
        signatureChampion = "暗裔剑魔 / 武器大师",
        specialTrait = {
            name = "不动如山抗压王",
            description = "即便遭到敌方三人包夹越塔也能冷静换掉一人并稳固防御塔血量。",
            buffLabel = "边路防抓生还率 +28% · 团战前排坦度 +20%"
        },
        contractSalary = 9500,
        signingBonus = 28000,
        soloQueueRank = "韩服王者第 8 名 (1,420 LP)",
        draftUrgency = "HIGH"
    },
    {
        id = "prodigy-sup-1",
        name = "白羽舟 (MingKey)",
        alias = "全息预判指挥大师",
        role = "SUP",
        age = 17,
        country = "中国",
        avatar = "👁️",
        mechanics = 90,
        macro = 95,
        morale = 96,
        potential = "SSS",
        potentialRating = 98,
        playstyle = "Macro-Oriented",
        signatureChampion = "魂锁典狱长 (锤石) / 派克",
        specialTrait = {
            name = "鬼魅神钩战术指挥",
            description = "游走时机精准到秒，团战第一时间的闪现钩必中敌方C位关键角色。",
            buffLabel = "团队开团配合度 +25% · 全员默契凝聚度 +12%"
        },
        contractSalary = 9800,
        signingBonus = 30000,
        soloQueueRank = "韩服王者第 6 名 (1,510 LP)",
        draftUrgency = "EXCLUSIVE"
    },
    {
        id = "prodigy-mid-2",
        name = "洛子安 (Aether)",
        alias = "千场90%胜率发条魔灵",
        role = "MID",
        age = 18,
        country = "中国",
        avatar = "🔮",
        mechanics = 94,
        macro = 91,
        morale = 91,
        potential = "SS",
        potentialRating = 97,
        playstyle = "Clutch",
        signatureChampion = "发条魔灵 / 机械先驱",
        specialTrait = {
            name = "毁天灭地冲击波",
            description = "大后期阵地战团战魔灵魔球从不落空，总能拉中敌方多核一锤定音。",
            buffLabel = "大后期团战胜率 +20% · 龙坑防守拉扯 +15%"
        },
        contractSalary = 10200,
        signingBonus = 33000,
        soloQueueRank = "国服峡谷之巅第 5 名 (1,580 LP)",
        draftUrgency = "HIGH"
    }
}

function ExpansionDraft.initDraftState(seasonYear)
    seasonYear = seasonYear or 2026
    return {
        currentYear = seasonYear,
        expansionFranchiseName = ExpansionDraft.FRANCHISE_NAMES[1],
        isDraftAvailable = true,
        protectedPlayerIds = {},
        draftedProdigies = {},
        history = {}
    }
end

function ExpansionDraft.getAnnualPool(seasonYear)
    seasonYear = seasonYear or 2026
    local offset = seasonYear - 2026
    local pool = {}
    for i, p in ipairs(ExpansionDraft.INITIAL_PRODIGIES_POOL) do
        local copy = {}
        for k, v in pairs(p) do copy[k] = v end
        copy.id = p.id .. "-y" .. seasonYear
        copy.mechanics = math.min(99, math.max(88, p.mechanics + (i % 3 - 1)))
        copy.macro = math.min(99, math.max(82, p.macro + ((i * 2) % 3 - 1)))
        copy.signingBonus = p.signingBonus + (offset * 2000)
        table.insert(pool, copy)
    end
    return pool
end

function ExpansionDraft.protectCorePlayers(draftState, protectedIds)
    if not draftState then return false, "No draft state" end
    draftState.protectedPlayerIds = protectedIds or {}
    return true, string.format("已成功为 %d 名核心基石选手开启联盟保护协议！", #draftState.protectedPlayerIds)
end

function ExpansionDraft.draftProdigy(draftState, prodigyId, treasuryMoney)
    if not draftState or not draftState.isDraftAvailable then
        return false, "当前赛季选秀已关闭或尚未开启"
    end
    local pool = ExpansionDraft.getAnnualPool(draftState.currentYear)
    local target = nil
    for _, p in ipairs(pool) do
        if p.id == prodigyId or p.name == prodigyId then
            target = p
            break
        end
    end
    if not target then
        target = pool[1]
    end

    if treasuryMoney and treasuryMoney < target.signingBonus then
        return false, string.format("俱乐部预算不足，需签约签字费 $%d！", target.signingBonus)
    end

    draftState.isDraftAvailable = false
    table.insert(draftState.draftedProdigies, target)
    table.insert(draftState.history, {
        year = draftState.currentYear,
        prodigyName = target.name,
        role = target.role,
        franchise = draftState.expansionFranchiseName,
        bonus = target.signingBonus,
        timestamp = os.time and os.time() or 0
    })

    return true, target, string.format("🎉【选秀签约成功】以特权选秀顺位签下【%s】(%s / %s)！签字费: -$%d，激活特权: %s！",
        target.name, target.role, target.potential, target.signingBonus, target.specialTrait.buffLabel)
end

return ExpansionDraft
