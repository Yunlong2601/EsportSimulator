-- ============================================================================
-- RETRO ESPORTS NEWSPAPER CLIPPINGS JOURNAL (复古电竞报纸头版纪事日记)
-- Ported from Web: src/data/careerJournalData.ts & CareerJournalView.tsx
-- ============================================================================

local CareerJournal = {}

CareerJournal.INITIAL_ENTRIES = {
    {
        id = "journal_debut_001",
        headline = "【创刊号 · 头版头条】横空出世！天才少年网吧五连绝世震撼天梯路人局",
        subheadline = "艾欧尼亚高分段爆发经典决战，年仅18岁的神秘新秀逆风操刀招牌刺客，以毫秒级操作豪取团灭！",
        date = "2026年3月15日 · 季前赛号外",
        category = "TOURNAMENT",
        categoryLabel = "【崭露头角】",
        newspaperName = "《全球电竞纪事周报》",
        issueNo = "第 101 期 · 创刊特辑",
        editionTag = "头版头条",
        articleBody = "据本报前线观察员电讯：在昨夜一场汇聚数位退役老将与高分绝活哥的巅峰排位中，编号“宿命先锋”的无名路人以不可思议的连续几何走位躲过致命强开，随后单枪匹马杀入龙坑，瞬秒敌方双C！赛后各大电竞社区论坛热度瞬间登顶，无数玩家发帖惊呼：“此子已有职业级大将之风！”",
        keyQuote = "“他在最危险的绝境中没有交闪现逃跑，而是算准了对面的所有冷却时间——这就是天生杀手的本能。” —— 知名电竞解说在直播间复盘点评",
        reporter = "本报特约电竞前沿调查员 · 陆子航",
        stampText = "★ 历史开端 ★",
        statImpact = "名声初显 · 吸引3家俱乐部青训营密切关注",
        importance = "BREAKING"
    },
    {
        id = "journal_streak_002",
        headline = "【号外速递】深夜疯狂十二连胜！神秘宿命先锋直通宗师生死局",
        subheadline = "通宵鏖战十小时滴水未进，连续零封多位职业选手小号，抗压心态获职业教练盛赞。",
        date = "2026年5月22日 · 春季特刊",
        category = "TITLE",
        categoryLabel = "【天梯风暴】",
        newspaperName = "《召唤师先锋时报》",
        issueNo = "第 238 期 · 深夜加印",
        editionTag = "绝密快讯",
        articleBody = "本报电竞版特别报道：在昨日深夜的天梯冲分狂潮中，“宿命先锋”顶着持续高强度的竞技负荷，连续上演教科书级的线权压制与游走支援。即便在队友前期接连崩盘的绝境局中，依然凭借冷静的战局切割与极限制衡强行将悬念拖入后期终结比赛。",
        keyQuote = "“比赛还没打到基地爆炸，就没有提前认输的道理。” —— 赛后游戏公屏聊天记录截屏流出",
        reporter = "首席观察员 · 沈清寒",
        stampText = "★ 连胜战报 ★",
        statImpact = "微操+2 / 心态属性突破至职业准入门槛",
        importance = "MAJOR"
    },
    {
        id = "journal_interview_003",
        headline = "【深度专访】“我的目标不是成为网红，而是站在首尔总决赛捧起那座金杯”",
        subheadline = "拒绝百万签约金做娱乐主播，毅然坚守每天16小时高强度严苛训练，只为真正的赛场荣光。",
        date = "2026年7月08日 · 盛夏专刊",
        category = "LIFESTYLE",
        categoryLabel = "【人物特写】",
        newspaperName = "《东方电竞论坛周刊》",
        issueNo = "第 340 期 · 名人特辑",
        editionTag = "独家专访",
        articleBody = "在这间不过十余平米的出租屋内，唯一的装饰是墙上张贴的全球总决赛历届冠军战队全家福海报。面对数家头部直播公会抛来的高额签字费橄榄枝，少年并未动摇。在长达两小时的深入交谈中，他向本报记者展示了记满数十页英雄对线细节与眼位时间轴的泛黄笔记本。",
        keyQuote = "“聚光灯熄灭后，唯有你敲下的每一个按键、复盘过的每一个失误，才是你在世界赛决赛第五局的底气。”",
        reporter = "资深主笔 · 顾晓林",
        stampText = "★ 纯粹之心 ★",
        statImpact = "意志力坚定 · 专注度提升至95%上限",
        importance = "FEATURE"
    }
}

function CareerJournal.createTitleClipping(title, rarity, bonus)
    return {
        id = "journal_title_" .. tostring(os.time and os.time() or 1),
        headline = string.format("【头版特大号外】神话加冕！宿命先锋正式斩获至尊称号「%s」", title),
        subheadline = string.format("历经无数次生死试炼与汗水浇灌，正式达成巅峰成就，称号特权「%s」震撼生效！", bonus or ""),
        date = "2026赛季 · 荣誉特刊",
        category = "TITLE",
        categoryLabel = "【巅峰加冕】",
        newspaperName = "《全球电竞纪事周报》",
        issueNo = "第 488 期 · 荣誉专刊",
        editionTag = (rarity == "MYTHIC") and "头版头条" or "号外头条",
        articleBody = string.format("今日电竞纪元迎来重大里程碑时刻！权威电竞荣誉殿堂正式确认，选手「宿命先锋」成功攻克极为苛刻的竞技指标，以极高的统治力荣获「%s」至高称号。国内外数十家权威电竞赛事媒体争相报道这一振奋人心的突破！", title),
        keyQuote = "“这不仅是一个虚名，而是在无数个凌晨四点无人问津的练习里，用千锤百炼铸就的王冠勋章。” —— 国际电竞评委团授勋评语",
        reporter = "荣誉殿堂特派记录官 · 陆子航",
        stampText = "★ 称号证实 ★",
        statImpact = bonus or "全属性加成",
        importance = "BREAKING"
    }
end

function CareerJournal.createTrophyClipping(trophyName, seasonName)
    return {
        id = "journal_trophy_" .. tostring(os.time and os.time() or 2),
        headline = string.format("【世纪头条】金色雨落漫天！宿命先锋率队登顶加冕「%s」", trophyName),
        subheadline = "首尔高尺巨蛋万众欢呼震天动地！BO5决胜局逆天翻盘，新一代王朝传奇正式宣告诞生！",
        date = "2026赛季 · 夺冠特号",
        category = "TOURNAMENT",
        categoryLabel = "【世界之巅】",
        newspaperName = "《全球电竞纪事周报》",
        issueNo = "第 999 期 · 夺冠全球典藏特刊",
        editionTag = "号外头条",
        articleBody = string.format("金色的彩带如梦幻之雨倾盆洒下！在今夜落幕的最高殿堂总决赛中，宿命先锋在决胜局陷入绝境的不利局面下，力挽狂澜率队捧起「%s」！当敌方基地水晶爆裂的一刹那，全场数万名狂热观众起立高呼新王的名字！", trophyName),
        keyQuote = "“我们曾经摔倒在谷底，但从未怀疑过自己能站在世界之巅。这是属于每一个不屈灵魂的奇迹！” —— 捧杯获奖感言",
        reporter = "本报总编辑 · 林晨",
        stampText = "★ 登顶世界 ★",
        statImpact = "名宿声望+500 / 解锁全球至尊冠军神戒",
        importance = "BREAKING"
    }
end

function CareerJournal.createAgentClipping(agentName, agentTitle, perkDesc)
    return {
        id = "journal_agent_" .. tostring(os.time and os.time() or 3),
        headline = string.format("【商业头版】重磅签约！知名经纪人「%s」出任专属商业总监", agentName),
        subheadline = string.format("电竞商业版图全面开拓！正式加盟智囊团，专属特权【%s】全面激活！", perkDesc or ""),
        date = "2026赛季 · 商业周刊",
        category = "AGENT",
        categoryLabel = "【商业签约】",
        newspaperName = "《电竞财富与商业观察》",
        issueNo = "第 312 期 · 商业特刊",
        editionTag = "独家披露",
        articleBody = string.format("本报商业前线快讯：享负盛誉的知名电竞经纪人【%s】（头衔：%s）已正式签约，全面接管选手的商业代言与品牌赞助业务。业内人士分析，此次强强联手将全面释放选手的场外商业价值！", agentName, agentTitle or "金牌合伙人"),
        keyQuote = "“我们看重的不仅是他在赛场上的连胜战绩，更是其无与伦比的冠军气场与商业号召力。” —— 经纪人专访发言",
        reporter = "商业版首席记者 · 钱万山",
        stampText = "★ 商业落地 ★",
        statImpact = perkDesc or "商业赞助收益大幅提升",
        importance = "MAJOR"
    }
end

return CareerJournal
