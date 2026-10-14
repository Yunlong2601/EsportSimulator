-- ScreenFactory.lua — data-driven screen builder.
-- Each screen's block spec mirrors gen_wireframes.py SCREENS (wireframe source of truth).
-- Thin screen files (ui/screens/*.lua) delegate here. Deep screens use wireframe mock data
-- in this first pass; per-screen real-data binding happens in the audit phase.
local UI = require("urhox-libs/UI")
local DS = require("ui.DesignSystem")
local Kit = require("ui.WireframeKit")
local AppShell = require("ui.AppShell")

local Factory = {}

local RAIL_IDS = {
    roster = true, personal_train = true, tactics = true, academy = true, draft = true,
    coach = true, lockerroom = true, player_profile = true, player_attrs = true,
    player_contract = true, player_stats = true,
}

-- ---- screen specs (block lists from wireframe) -----------------------------
local SPEC = {}

SPEC.menu = {
    blocks = {
        { kind = "cta", label = "继续游戏" },
        { "开始新游戏", "list" }, { "存档管理", "list" }, { "游戏设置", "list" },
        { "VIP 中心", "list" }, { "版本声明", "list" },
    },
}

SPEC.more = {
    blocks = {
        { kind = "chiprow", items = { { "经营", true }, { "深度", false }, { "系统", false } } },
        { kind = "actiongrid", items = { { "财务", "" }, { "股权", "" }, { "设施", "" }, { "周边", "" },
            { "媒体", "" }, { "图鉴", "" }, { "名人堂", "" }, { "目标", "" },
            { "地区", "" }, { "分析", "" }, { "排行", "" }, { "设置", "" } } },
        { "深度叙事：传承 · 宿敌 · 生涯剧情", "list" },
    },
}

SPEC.roster = {
    rail = true,
    blocks = {
        { kind = "squadheader", scheme = { "方案A", "方案B", "方案C" }, active = "方案A", saved = "保存方案",
            stats = { { "首发", "5/5" }, { "伤病", "0" }, { "低体能", "0" } },
            filters = { { "全部", true }, { "上单", false }, { "打野", false }, { "中单", false }, { "射手", false }, { "辅助", false } } },
        { kind = "squadlist", items = {
            { true, "上单", "KAI", 21, "¥2.9万", 88, 88 }, { false, "打野", "NOVA", 20, "¥2.1万", 86, 84 },
            { false, "中单", "ZEN", 22, "¥2.5万", 85, 83 }, { false, "射手", "ACE", 19, "¥1.8万", 82, 80 },
            { false, "辅助", "ORA", 20, "¥1.5万", 80, 78 }, { false, "中单", "SOL", 23, "¥1.2万", 76, 76 },
            { false, "打野", "Rex", 21, "¥1.1万", 74, 74 }, { false, "辅助", "Lyn", 18, "¥0.8万", 72, 72 },
            { false, "上单", "Bram", 24, "¥0.9万", 70, 70 }, { false, "射手", "Vex", 22, "¥1.0万", 69, 69 } } },
        { "长按选手 → 挂牌出售/外租/设首发 | 点击 → 查看详情", "section" },
    },
}

SPEC.personal_train = {
    rail = true,
    blocks = { { "说明卡 · 单名选手定向特训", "section" }, { "选择选手", "list" }, { "选择训练侧重", "list" }, { kind = "cta", label = "训练预览 + 执行" } },
}

SPEC.tactics = {
    rail = true,
    blocks = {
        { kind = "chiprow", items = { { "阵型与球场", false }, { "替补席", true } } },
        { "点击 × 或 + 将切换为手动模式", "section" },
        { kind = "kvrows", title = "当前模式", rows = { { "阵容配置", "自动（按能力值）", DS.C.muted }, { "一键配置", "推荐", DS.C.gold } } },
        { kind = "benchlist", title = "替补席 (3/3)", items = { { 1, "中单", "SOL", 76, 68 }, { 2, "打野", "Rex", 74, 66 }, { 3, "辅助", "Lyn", 72, 64 } } },
        { kind = "benchlist", title = "可选选手 (8)", action = "+", items = { { 1, "射手", "Vex", 75, 71 }, { 2, "上单", "Bram", 75, 70 }, { 3, "中单", "Ciel", 75, 69 }, { 4, "打野", "Dusk", 75, 68 }, { 5, "辅助", "Faye", 75, 66 }, { 6, "上单", "Grit", 75, 65 }, { 7, "射手", "Haze", 75, 64 }, { 8, "辅助", "Iris", 75, 62 } } },
    },
}

SPEC.academy = {
    rail = true,
    blocks = {
        { kind = "chiprow", items = { { "招募10", true }, { "球星", false }, { "自建", false }, { "青训10", false } } },
        { kind = "sectionhdr", title = "青训学院", right = "10 / 30 名额" },
        { kind = "chipcard", chips = { "人数 10", "平均能力 59", "平均潜力 ★3.5" } },
        { kind = "youthlist", title = "候选选手", items = {
            { "上单", "影一", 16, "华东", 57, 3 }, { "中单", "夜二", 16, "华南", 54, 3 }, { "打野", "风三", 17, "华北", 55, 4 },
            { "辅助", "云四", 16, "西南", 59, 3 }, { "射手", "雷五", 17, "华中", 53, 2 }, { "中单", "星六", 16, "东北", 55, 3 },
            { "上单", "沉七", 17, "西北", 53, 4 }, { "打野", "川八", 16, "华东", 53, 3 }, { "射手", "漠九", 17, "华南", 60, 3 }, { "辅助", "林十", 17, "华北", 57, 3 } } },
        { kind = "sectionhdr", title = "自建选手 (0/23)", right = "" },
        { kind = "dualcta", left = "随机创建", right = "自定义创建", sub = "随机：系统生成能力。自定义：掷潜力后自选风格并分配初始能力。最多 23 人；首名免费。" },
        { "剩余自建点：200（账号云通用）", "section" },
        { "还没有自建选手。点下方「随机创建」或「自定义创建」。", "section" },
    },
}

SPEC.draft = {
    rail = true,
    blocks = { { "说明 · 剩余签约次数 2", "section" }, { "新秀卡片（签下）", "list" }, { kind = "cta", label = "完成选秀 / 跳过" } },
}

SPEC.coach = {
    rail = true,
    blocks = {
        { kind = "sectionhdr", title = "团队效果", right = "" },
        { kind = "ztable", rows = { { "成长", "+11%（普通）" }, { "准确度", "83%" }, { "每日额外恢复", "+2天" }, { "青训训练标准", "+0%" }, { "战术熟练", "+2%" } } },
        { kind = "stafflist", items = {
            { "主教练", "Lin Hai", "6090/周", { { "训练", 15.0 }, { "战术", 13.0 }, { "青训", 13.0 } }, DS.C.role_coach },
            { "分析师", "Zhao Yu", "4673/周", { { "战术", 13.0 }, { "青训", 12.0 }, { "训练", 12.0 } }, DS.C.role_analyst },
            { "星探", "Wu Feng", "4658/周", { { "星探", 11.0 }, { "战术", 13.0 }, { "青训", 12.0 } }, DS.C.role_scout },
            { "理疗师", "Chen Min", "4273/周", { { "理疗", 15.0 }, { "青训", 9.0 }, { "训练", 10.0 } }, DS.C.role_medic } } },
        { kind = "cta", label = "+ 招聘教练组 (4/8)" },
    },
}

SPEC.lockerroom = {
    rail = true,
    blocks = {
        { "关系总览：队长 ✓ / 搭档 2 / 矛盾 1", "kpi" },
        { "操作模式：任命 / 设搭档 / 加矛盾 / 调解", "chip" },
        { kind = "playercards", n = 2, morale = true },
        { "快捷清除矛盾", "list" },
    },
}

SPEC.player_profile = {
    rail = true,
    blocks = {
        { kind = "profilehdr", items = { { "位置", "上单", false }, { "年龄", "21", false }, { "体能", "88", true }, { "士气", "82", true }, { "战队", "星环战队", false } } },
        { kind = "basicinfo", title = "基本信息", items = { { "国籍", "中国" }, { "惯用手", "右手" }, { "多面性", "★★☆☆☆" } } },
        { kind = "chipcard", chips = { "潜力 ★★★★☆", "多面性 ★★☆☆☆", "身价 ¥560万" } },
        { kind = "attrrow2", items = { { { "防守", 14, DS.C.success }, { "抢断", 14, DS.C.success } }, { { "制空", 10, DS.C.muted }, { "力量", 15, DS.C.success } }, { { "站位", 10, DS.C.muted }, { "镇定", 12, DS.C.success } } } },
        { kind = "sectionhdr", title = "本赛季", right = "" },
        { "本赛季暂无数据", "section" },
        { kind = "adunlock", title = "名单编辑器", desc = "观看 5 次广告后，可修改各队普通选手的属性与潜力。", cta = "解锁名单编辑器" },
        { kind = "follow", title = "关注追踪", desc = "关注后，可在新闻中心单独查看这名选手相关的重要动态。", primary = "关注动态" },
    },
}

SPEC.player_attrs = {
    rail = true,
    blocks = {
        { kind = "profilehdr", items = { { "位置", "上单", false }, { "年龄", "21", false }, { "体能", "88", true }, { "士气", "82", true }, { "战队", "星环战队", false } } },
        { kind = "attrgroups", groups = {
            { "身体", { { "速度", 13, DS.C.success }, { "力量", 15, DS.C.success }, { "体能", 13, DS.C.success }, { "敏捷", 11, DS.C.muted }, { "制空", 10, DS.C.muted } } },
            { "技术", { { "补刀", 11, DS.C.muted }, { "走位", 7, DS.C.gold }, { "视野", 8, DS.C.gold }, { "输出", 6, DS.C.error }, { "抢龙", 14, DS.C.success } } },
            { "心理", { { "防守", 14, DS.C.success }, { "决策", 12, DS.C.success }, { "侵略", 15, DS.C.success }, { "领导", 16, DS.C.success }, { "站位", 10, DS.C.muted }, { "镇定", 12, DS.C.success }, { "合作", 13, DS.C.success } } } } },
    },
}

SPEC.player_contract = {
    rail = true,
    blocks = {
        { kind = "profilehdr", items = { { "位置", "上单", false }, { "年龄", "21", false }, { "体能", "88", true }, { "士气", "82", true }, { "战队", "星环战队", false } } },
        { kind = "kvrows", title = "合同概览", rows = { { "合同状态", "2027年6月到期（剩余23个月）", DS.C.muted }, { "周薪", "2.9万/周", DS.C.gold }, { "年薪（估）", "152万", DS.C.muted }, { "市场价值", "560万", DS.C.muted } } },
        { kind = "statusbars", items = { { "周薪预算占比", "1.4%", 2 } } },
        { kind = "kvrows", title = "转会状态", rows = { { "挂牌出售", "否", DS.C.muted }, { "挂牌外租", "否", DS.C.muted }, { "租借状态", "在队", DS.C.muted } } },
        { kind = "kvrows", title = "报价偏好", rows = { { "接收报价", "允许接收报价", DS.C.success } } },
        { kind = "rolegrid", title = "阵容角色", subtitle = "候补力量，偶尔出场", items = { { "核心选手", false }, { "轮换选手", false }, { "阵容选手", true }, { "青年选手", false } } },
        { kind = "contractactions", title = "合同操作", groups = { { "合同", { { "续约（建议：3.1万/周 × 3年）", DS.C.success } } }, { "挂牌", { { "挂牌出售", DS.C.gold }, { "挂牌外租", DS.C.success } } } } },
    },
}

SPEC.player_stats = {
    rail = true,
    blocks = {
        { kind = "profilehdr", items = { { "位置", "上单", false }, { "年龄", "21", false }, { "体能", "88", true }, { "士气", "82", true }, { "战队", "星环战队", false } } },
        { kind = "chipcard", title = "本赛季数据（2025）", chips = { "出场 0", "击杀 0", "助攻 0", "死亡 0", "首杀 0", "残局 0" } },
        { kind = "chipcard", title = "场均数据", chips = { "场均击杀 0", "场均助攻 0", "场均评分 -" } },
        { kind = "kvrows", title = "身体状态", rows = { { "当前体能", "75%", DS.C.success }, { "当前士气", "75", DS.C.success }, { "受伤状态", "健康", DS.C.success }, { "训练重点", "跟随全队", DS.C.muted } } },
    },
}

SPEC.league = {
    blocks = {
        { kind = "countryleague", countries = { "LPL", "LCK", "LEC", "北美", "亚太" }, selected_country = "LPL", leagues = { "夏季赛", "春季赛", "大师杯" }, selected_league = "夏季赛" },
        { kind = "sectionhdr", title = "积分榜", right = "" },
        { kind = "standings", cols = { "#", "战队", "场", "胜", "负", "小局", "积分" }, rows = {
            { "1", "星环战队", "19", "10", "5", "42-21", "35" }, { "2", "雷霆战队", "19", "10", "3", "21-15", "33" },
            { "3", "苍穹战队", "19", "9", "5", "26-22", "32" }, { "4", "赤焰战队", "19", "10", "1", "37-31", "31" },
            { "5", "寒星战队", "19", "9", "3", "19-20", "30" }, { "6", "暗影战队", "19", "8", "5", "22-26", "29" }, { "7", "极光战队", "19", "7", "7", "31-24", "28" } } },
        { kind = "sectionhdr", title = "击杀榜", right = "" },
        { kind = "scorerstable", cols = { "#", "选手", "战队", "击杀" }, rows = { { "1", "影刃", "星环战队", "18" } } },
        { kind = "cta", label = "进入 BP · 开始比赛" },
    },
}

SPEC.match = {
    blocks = { { "赛前准备（对手/战术/明星）", "list" }, { "英雄 BP（禁用/选人）", "list" }, { "BP 阶段（选英雄/进度）", "list" }, { "关键决策 / 回合决策", "list" }, { kind = "cta", label = "阵容确认（开始比赛）" }, { "调整阵容 / 返回联赛", "list" } },
}

SPEC.matchresult = {
    blocks = {
        { kind = "split", left = "2 : 1　胜", right = { "MVP · 上单 KAI", "连胜 4 场", "经济领先 4.2k" } },
        { "数据 Tab：输出 / 承伤 / 经济 / 参团 / 评级", "chip" },
        { kind = "bars", title = "回合经济对比", spec = { { "我方", 72 }, { "对手", 48 } } },
        { kind = "table", title = "选手数据", cols = { "选手", "输出", "承伤", "参团" }, rows = { { "上单", "312", "201", "78%" }, { "打野", "268", "244", "64%" }, { "中单", "240", "190", "71%" } } },
        { kind = "cta", label = "数据分析 / 继续" },
    },
}

SPEC.bp = {
    blocks = { { "英雄 BP 卡（禁用/选人）", "list" }, { "英雄池卡（进度/位置筛选）", "list" }, { kind = "cta", label = "阵容确认（开始比赛）" }, { "返回赛前", "list" } },
}

SPEC.analytics = {
    blocks = { { "解锁说明（Lv.3）", "section" }, { "近期积累记录", "list" }, { "赛后数据分析（战力拆解/关键回合）", "list" }, { "对手风格情报", "list" }, { "下场 BP 参考", "list" } },
}

SPEC.leaderboard = {
    blocks = { { "我的俱乐部卡（排名/战力/估值/粉丝）", "kpi" }, { "主联赛实力榜（可展开情报）", "list" } },
}

SPEC.regions = {
    blocks = { { kind = "header", text = "页头：分部数 / 区域冠军" }, { "区域分部卡（战绩/投入/结果）", "list" }, { kind = "cta", label = "开设分部" }, { "经营提示", "section" } },
}

SPEC.market = {
    blocks = {
        { "夏季转会窗开启中（8月底关闭）", "alert" },
        { kind = "chiprow", items = { { "搜索", true }, { "自由", false }, { "租借", false }, { "青训", false }, { "报价", false }, { "出售", false } } },
        { kind = "chiprow", items = { { "全部", true }, { "上单", false }, { "打野", false }, { "中单", false }, { "射手", false }, { "辅助", false }, { "候选", false } } },
        { kind = "searchbar", placeholder = "搜索选手/战队/地区…" },
        { kind = "sectionhdr", title = "选手", right = "" },
        { kind = "playertable", cols = { "选手", "潜力/多面性", "能力", "操作" }, rows = {
            { "上单", "影刃", "星环战队", "19岁", "¥4.2亿", "拒绝转会", "★★★★★", "91" },
            { "中单", "夜枭", "雷霆战队", "21岁", "¥3.1亿", "拒绝转会", "★★★★☆", "90" },
            { "射手", "疾风", "苍穹战队", "20岁", "¥2.8亿", "不情愿", "★★★★☆", "89" },
            { "打野", "苍狼", "赤焰战队", "22岁", "¥2.4亿", "不情愿", "★★★★☆", "89" } } },
    },
}

SPEC.transferboard = {
    blocks = { { "统计卡（本周/赛季/标王）", "kpi" }, { "转会成交榜", "list" }, { "转会传闻", "list" }, { "返回转会市场", "list" } },
}

SPEC.negotiation = {
    blocks = { { "谈判说明", "section" }, { "进行中谈判（报价/还价/接受/委托）", "list" }, { "最近结束的谈判", "list" } },
}

SPEC.starrecruit = {
    blocks = {
        { kind = "kpirow", items = { { "1·愿景", "✓" }, { "2·凭证", "✓" }, { "3·宿敌", "●" }, { "4·谈判", "" }, { "5·签约", "" } } },
        { "招牌选手卡", "list" }, { "第1步·愿景问答", "list" }, { "第2步·签约凭证", "list" }, { "第3步·击败宿敌", "list" }, { "第4步·正式谈判", "list" }, { kind = "cta", label = "第5步·交换签约" }, { "中止招募", "list" },
    },
}

SPEC.finance = {
    blocks = {
        { kind = "tiles", cols = 2, items = { { "现金", "¥840万" }, { "估值", "¥1.2亿" }, { "周薪", "¥210万" }, { "周盈余", "+¥46万" } } },
        { kind = "ztable", rows = { { "粉丝", "12万" }, { "声誉", "B+" } } },
        { "赞助商席位 / 赞助商市场", "list" }, { "收支历史", "list" },
    },
}

-- SPEC.shares / SPEC.stock 已由真实 ShareScreen / StockScreen（buildBlocks 真数据）取代，此处 SPEC 废弃不再渲染。
SPEC.facilities = {
    blocks = { { "设施列表（每栋升级）", "list" } },
}

SPEC.merch = {
    blocks = { { "收入概览", "kpi" }, { "商品列表（上架/定价/生产）", "list" } },
}

SPEC.press = {
    blocks = { { "发布会卡片（待回应）", "list" }, { "选择回应基调 + 选项", "chip" }, { "（空态）暂无邀请 + 最近发布会", "section" } },
}

SPEC.reputation = {
    blocks = {
        { kind = "rings", items = { { 64, "声望", "Lv.7" }, { 48, "粉丝", "12万" } } },
        { "声望进度卡", "list" }, { "粉丝规模卡", "list" }, { kind = "cta", label = "前往媒体中心" },
    },
}

SPEC.goalcenter = {
    blocks = {
        { kind = "node", text = "董事会支持度 72% → 目标 80%", sub = "本周完成 3/5 项目标" },
        { kind = "actiongrid", items = { { "经营清单", "" }, { "成就", "" }, { "目标", "" }, { "荣誉", "" } } },
        { kind = "feed", items = { { "完成：续约主力射手", "g" }, { "进行：升级训练馆", "d" }, { "待办：媒体发布会", "p" } } },
    },
}

SPEC.dynasty = {
    blocks = { { kind = "header", text = "页头（传奇点）" }, { kind = "ring", pct = 58, label = "王朝", sub = "S-级" }, { "跨赛季目标卡", "list" }, { "王朝解锁卡", "list" }, { "王朝编年史", "list" }, { "返回阵容", "list" } },
}

SPEC.rivalry = {
    blocks = { { "操作反馈卡", "alert" }, { "宿敌列表（恩怨值/对位胜）", "list" }, { "嘴炮选择卡", "list" }, { "挖角目标卡（自由市场前6）", "list" } },
}

SPEC.career = {
    blocks = { { "进行中的剧情卡（选项）", "list" }, { "生涯档案（已结算记录）", "list" } },
}

SPEC.highlight = {
    blocks = { { "高光纪念卡（图标+标题）", "kpi" }, { "荣耀描述行", "list" }, { "关键数据块", "list" }, { kind = "cta", label = "收下荣耀 / 返回" } },
}

SPEC.galleryhub = {
    blocks = { { kind = "ring", pct = 37, label = "收集", sub = "128/345" }, { "分类切换：结局/选手/英雄", "chip" }, { "结局图鉴", "list" }, { "选手图鉴（网格）", "list" }, { "英雄图鉴（三级）", "list" } },
}

SPEC.halloffame = {
    blocks = { { "荣誉总数统计卡", "kpi" }, { "荣誉墙条目", "list" }, { "返回图鉴", "list" } },
}

SPEC.setup = {
    blocks = { { "玩家信息卡", "list" }, { "战队选择卡（自定义/联赛队）", "list" }, { kind = "cta", label = "开始新游戏" } },
}

SPEC.settings = {
    blocks = { { "通用卡（音效/通知）", "list" }, { "比赛默认速度", "list" }, { "自动存档", "list" }, { "游戏版本 + 更新记录", "list" } },
}

SPEC.savemanager = {
    blocks = { { "存档槽说明", "section" }, { "存档槽1（俱乐部/赛季/阵容/现金）", "kpi" }, { "加载 / 删除", "list" } },
}

-- NOTE: adcenter 已实现为真实 VIP 中心（scripts/ui/screens/AdCenterScreen.lua），
-- 由 main.lua 直接路由，不再走 ScreenFactory 代理。此处不再保留 SPEC.adcenter。

-- ---- build ----------------------------------------------------------------
function Factory.Build(screenId, navigate)
    local spec = SPEC[screenId]
    if not spec then
        return AppShell.Build(navigate, "dashboard", DS.EmptyState("未知页面：" .. tostring(screenId)))
    end
    local ctx = { nav = navigate }
    local nodes = Kit.renderBlocks(spec.blocks, ctx)
    return AppShell.Build(navigate, screenId, UI.Panel { flexDirection = "column", gap = DS.S.sm, children = nodes },
        { rail = spec.rail and "team" or nil })
end

return Factory
