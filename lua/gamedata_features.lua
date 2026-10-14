--[[
    ============================================================================
    GAMEDATA_FEATURES.LUA (TapTap Make / Neo-Esports Cyberpunk)
    ============================================================================
    Unified Data Models for the 5 Feature Screens:
      1. 全球星探 · SSS 神级选手招募 (Scout Gacha)
      2. 基地日常 · 电竞生活模拟 (Pro Life Sim)
      3. 决胜时刻 · 战术决策终端 (Tactical Decision Arena)
      4. 战队羁绊 · 选手默契网络 (Synergy Link Matrix)
      5. 神装外设 · 顶级电竞工坊 (Pro Hardware Rig)
--]]

local FeaturesData = {
    -- Screen 1: 全球星探 · SSS 神级选手招募 (Scout Gacha)
    gacha = {
        pool_name = "S14 极光限定星探池",
        pity_count = 3,         -- Remaining pulls to guaranteed SSS
        cost_diamonds = 1800,
        rates = { SSS = 0.025, SSR = 0.12, SR = 0.355, R = 0.50 },
        featured_player = {
            id = "GENESIS-01",
            name = "VORTEX",
            title = "神级中单",
            role = "MID",
            ovr = 99,
            tier = "SSS",
            apm = 480,
            stats = { micro = 99, teamfight = 98, macro = 96, mental = 94 },
            passives = "【神之领域】关键龙坑团战输出提升 35%，逆风翻盘率 +28%",
            signatures = { "阿兹尔 (Azir)", "妖姬 (LeBlanc)", "塞拉斯 (Sylas)" }
        },
        roster_pool = {
            { id = "SSS-01", name = "VORTEX (神级中单)", tier = "SSS", ovr = 99, role = "MID", apm = 480 },
            { id = "SSS-02", name = "CHRONO (绝杀ADC)", tier = "SSS", ovr = 98, role = "ADC", apm = 495 },
            { id = "SSR-01", name = "Hyper (顶级ADC)", tier = "SSR", ovr = 95, role = "ADC", apm = 440 },
            { id = "SSR-02", name = "Kaiser (统治级上单)", tier = "SSR", ovr = 94, role = "TOP", apm = 425 },
            { id = "SR-01",  name = "Zephyr (破晓打野)", tier = "SR",  ovr = 88, role = "JNG", apm = 390 },
            { id = "SR-02",  name = "Aegis (钢铁辅助)", tier = "SR",  ovr = 87, role = "SUP", apm = 370 },
            { id = "R-01",   name = "Rookie (二队青训练习生)", tier = "R", ovr = 78, role = "MID", apm = 320 }
        }
    },

    -- Screen 2: 基地日常 · 电竞生活模拟 (Pro Life Sim)
    life_sim = {
        base_name = "上海静安区顶层俱乐部基地 LV.4",
        comfort_pct = 92,
        team_stress_pct = 24, -- Optimal low stress
        daily_commands_left = 3,
        cctv_rooms = {
            { id = "CAM_01", name = "主训练室 (Scrim Lab)", status = "高频对战中", buff = "对战复盘效率 +20%", temperature = "21.5°C" },
            { id = "CAM_02", name = "心理疗愈室 (Mental Lounge)", status = "芳疗静息中", buff = "全员心率回稳 68bpm", temperature = "23.0°C" },
            { id = "CAM_03", name = "星级夜宵厨房 (Late Night Kitchen)", status = "营养补给充足", buff = "卡路里超量恢复 +30%", temperature = "24.2°C" }
        },
        active_event = {
            title = "突发事件 · TapTap 奇遇",
            desc = "中单选手在国服峡谷之巅遭遇嘴臭演员恶语相向，操作键盘啪啪作响，心态产生波动！",
            options = {
                { id = "A", text = "开启静音模式，主教练一对一心理疏导", cost_money = 1000, stress_delta = -15, apm_delta = 0 },
                { id = "B", text = "逆风硬刚激发斗志：无视挑衅虐泉反杀！", cost_money = 0, stress_delta = 5, apm_delta = 2 }
            }
        }
    },

    -- Screen 3: 决胜时刻 · 战术决策终端 (Tactical Decision Arena)
    tactical_arena = {
        match_time = "32:15",
        bo_phase = "BO5 决胜局 // 全员绝杀触发点",
        blue_win_prob = 82,
        red_win_prob = 76,
        baron_hp = 1450,
        baron_max_hp = 12000,
        smite_kill_threshold = 1200,
        coach_tactical_points = 2,
        options = {
            {
                id = 1,
                title = "【中单孤勇者进场】",
                tag = "极危 // 刺客决断",
                success_rate = 72,
                cost_tp = 2,
                reward = "敌方双C瞬间蒸发，0换3直通高地！",
                risk = "被敌方控秒杀，全线溃败遭一波推平"
            },
            {
                id = 2,
                title = "【拼惩戒稳拿大龙】",
                tag = "稳健 // 野区博弈",
                success_rate = 55,
                cost_tp = 1,
                reward = "斩杀纳什男爵，带三路超级兵稳健推进",
                risk = "拼惩戒失手，男爵被抢沦为逆风守家"
            },
            {
                id = 3,
                title = "【主教练紧急战术暂停】",
                tag = "暂停令 // 仅剩1次",
                success_rate = 100,
                cost_tp = 0,
                reward = "全员操作精度提升 15%，重刷新战术卡池",
                risk = "消耗本场唯一战术暂停权限"
            }
        }
    },

    -- Screen 4: 战队羁绊 · 选手默契网络 (Synergy Link Matrix)
    synergy_network = {
        overcharge_pct = 94.2,
        team_dmg_buff = "+18.4%",
        roam_speed_buff = "+25.0%",
        pairs = {
            { code = "TOP x JNG", title = "上野互信", lv = 4, effect = "越塔配合 +20% 击杀斩获", max_lv = 5 },
            { code = "JNG x MID", title = "黄金中野代练组合", lv = 5, is_max = true, effect = "控峡谷先锋与转线速度 +35%", max_lv = 5 },
            { code = "MID x BOT", title = "双核驱动", lv = 3, effect = "后期团战容错率 +15%", max_lv = 5 },
            { code = "BOT x SUP", title = "默契下路组合", lv = 4, effect = "对线击杀率 +22% / 视野压制 +30%", max_lv = 5 }
        },
        resonances = {
            { name = "凤凰涅槃", equipped = true, desc = "落后5000经济时，防守反击伤害 +25%" },
            { name = "快节奏血腥对线", equipped = true, desc = "前10分钟首条小龙控龙率 +40%" },
            { name = "世界冠军底蕴", equipped = false, locked = true, desc = "捧起召唤师奖杯后永久解锁：全员团战免控 1.5 秒" }
        }
    },

    -- Screen 5: 神装外设 · 顶级电竞工坊 (Pro Hardware Rig)
    hardware_rig = {
        total_apm_bonus = 1420,
        response_ms = 1.2,
        overclock_pct = 115, -- 100% to 130%
        active_slots = {
            mouse = { rarity = "LEGENDARY", name = "CyberViper 8000Hz 无线电竞鼠", bonus = "操作反应 +28, 走砍失误率 -40%" },
            keyboard = { rarity = "EPIC", name = "磁轴客制化 68 键铝坨坨键盘", bonus = "连招爆发速度 +35, APM峰值 +45" },
            monitor = { rarity = "LEGENDARY", name = "540Hz 极速电竞神瞳显示器", bonus = "视野盲区察觉 +25%, 动态残影消退 99.8%" },
            audio = { rarity = "RARE", name = "7.1 战术声学监听耳机", bonus = "敌方Gank预警 +18%, 空间脚步定位 360°" }
        },
        crafting_inventory = { titanium_switches = 84, carbon_shells = 12, low_latency_chips = 6 }
    }
}

return FeaturesData
