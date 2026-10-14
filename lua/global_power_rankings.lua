--[[
    ============================================================================
    TAPTAP MAKE: GLOBAL PRO POWER RANKINGS ENGINE (全球战队战力榜系统)
    ============================================================================
    Target Platform: TapTap Make (Mobile Portrait Text-Simulator Engine)
    Language: Pure Lua 5.1 / 5.2 / 5.3 / LuaJIT

    功能概要:
      1. 全球 TOP 20 战队实力排位与稳定性指数 (PWR Index & Consistency Score)
      2. 战术刺探系统 (Scouting Dossier): 洞悉对手绝活破绽、克制建议、胜率加成
      3. 引援转会雷达 (Potential Trade Targets): 锁定心仪选手并发起引援问询
      4. 战术训练赛切磋 (Simulate Scrim): 与全球豪门一较高下获取实战战术经验
--]]

local GlobalPowerRankings = {}
GlobalPowerRankings.__index = GlobalPowerRankings

GlobalPowerRankings.TEAMS = {
    { rank = 1,  id = "t1",  name = "T1 (SK Telecom)", short = "T1",  region = "LCK", logo = "👑", pwr = 98.7, consistency = 96, wins = 16, losses = 2,  streak = "8连胜", tier = "S+",
      playstyle = "奇迹团战·神级兵线运营与无解韧性",
      weakness = "前期偶尔过度压线，防守反击与高频越塔可破坏其早期布置",
      roster = { "Zeus (上单 96)", "Oner (打野 95)", "Faker (中单 99)", "Gumayusi (射手 96)", "Keria (辅助 97)" },
      trade_target = { name = "Smash (青训天才射手)", role = "ADC", rating = 87, buyout = 180000, desc = "二队统治级表现，渴望首发舞台。" }
    },
    { rank = 2,  id = "blg", name = "BLG (Bilibili Gaming)", short = "BLG", region = "LPL", logo = "⚡", pwr = 98.1, consistency = 94, wins = 15, losses = 2,  streak = "6连胜", tier = "S+",
      playstyle = "窒息狂暴前中期进攻·全员对线血腥压制",
      weakness = "顺风局易沉迷野区打架，防守反击与远距离Poke容易逼其急躁失误",
      roster = { "Bin (上单 97)", "Xun (打野 94)", "Knight (中单 98)", "Elk (射手 96)", "ON (辅助 95)" },
      trade_target = { name = "Wei (顶级控图野核)", role = "JUG", rating = 92, buyout = 350000, desc = "王牌野核，合约即将到期。" }
    },
    { rank = 3,  id = "gen", name = "GEN (Gen.G Esports)", short = "GEN", region = "LCK", logo = "🐅", pwr = 97.8, consistency = 95, wins = 16, losses = 3,  streak = "4连胜", tier = "S+",
      playstyle = "绝对对线补刀压制·精密齿轮级资源运营",
      weakness = "中前期偏向稳健发育，快节奏不讲理的一级团入侵可打乱其战术布置",
      roster = { "Kiin (上单 95)", "Canyon (打野 97)", "Chovy (中单 98)", "Peyz (射手 94)", "Lehends (辅助 94)" },
      trade_target = { name = "Winner (新生代控图打野)", role = "JUG", rating = 86, buyout = 160000, desc = "天梯路人王，寻求一线首发机会。" }
    },
    { rank = 4,  id = "hle", name = "HLE (Hanwha Life)", short = "HLE", region = "LCK", logo = "🛡️", pwr = 96.5, consistency = 91, wins = 14, losses = 4,  streak = "3连胜", tier = "S",
      playstyle = "超级双C接管比赛·大牌阵容厚重扎实",
      weakness = "过度依赖双C发育周期，一旦前期边线遭连续突破容易出现战术脱节",
      roster = { "Doran (上单 92)", "Peanut (打野 93)", "Zeka (中单 95)", "Viper (射手 97)", "Delight (辅助 93)" },
      trade_target = { name = "Rooster (新生代重装上单)", role = "TOP", rating = 85, buyout = 140000, desc = "擅长战士抗压与开团。" }
    },
    { rank = 5,  id = "tes", name = "TES (Top Esports)", short = "TES", region = "LPL", logo = "🔥", pwr = 96.0, consistency = 89, wins = 14, losses = 5,  streak = "5连胜", tier = "S",
      playstyle = "双核极速对线击杀·顶尖微操接团硬碰硬",
      weakness = "中后期偶尔因过激走位出现走单脱节，大龙坑争夺决策偶有摇摆",
      roster = { "369 (上单 94)", "Tian (打野 93)", "Creme (中单 93)", "JackeyLove (射手 96)", "Meiko (辅助 95)" },
      trade_target = { name = "XiaoLin (二队顶尖刺客新秀)", role = "MID", rating = 87, buyout = 200000, desc = "刺客英雄池极深，操作华丽。" }
    },
    { rank = 6,  id = "wbg", name = "WBG (Weibo Gaming)", short = "WBG", region = "LPL", logo = "🌪️", pwr = 95.2, consistency = 88, wins = 13, losses = 5,  streak = "2连胜", tier = "S",
      playstyle = "老将兵线运营拉扯·战术大师季后赛血统",
      weakness = "前期进攻节奏相对慢热，容易在快攻重装越塔阵容前陷入被动",
      roster = { "Breathe (上单 93)", "Tarzan (打野 94)", "Xiaohu (中单 94)", "Light (射手 93)", "Crisp (辅助 94)" },
      trade_target = { name = "Kite (高机动年轻ADC)", role = "ADC", rating = 86, buyout = 170000, desc = "年轻火力充沛，极具培养价值。" }
    },
    { rank = 7,  id = "jdg", name = "JDG (JD Gaming)", short = "JDG", region = "LPL", logo = "⚔️", pwr = 94.8, consistency = 87, wins = 13, losses = 6,  streak = "1连败", tier = "A+",
      playstyle = "野区强压控制·尺帝大核终局收割",
      weakness = "上中对线统治力略显下滑，强开团一旦脱节易遭团灭",
      roster = { "Flandre (上单 91)", "Kanavi (打野 95)", "Yagao (中单 92)", "Ruler (射手 97)", "Missing (辅助 92)" },
      trade_target = { name = "Feather (灵性游走辅助新秀)", role = "SUP", rating = 87, buyout = 190000, desc = "游走参团率高，开团精准。" }
    },
    { rank = 8,  id = "g2",  name = "G2 Esports", short = "G2", region = "LEC", logo = "🎭", pwr = 94.3, consistency = 90, wins = 15, losses = 4,  streak = "5连胜", tier = "A+",
      playstyle = "欧罗巴黑魔法·BP怪异套路与快节奏突袭",
      weakness = "选出纯发育平稳阵容时易失去对局重心，偶尔前期自乱阵脚",
      roster = { "BrokenBlade (上单 92)", "Yike (打野 92)", "Caps (中单 96)", "Hans Sama (射手 93)", "Mikyx (辅助 94)" },
      trade_target = { name = "Vanguard (欧洲青训野区杀手)", role = "JUG", rating = 86, buyout = 150000, desc = "反野路线怪异，擅长突进刺杀。" }
    },
    { rank = 9,  id = "lng", name = "LNG Esports", short = "LNG", region = "LPL", logo = "🦄", pwr = 93.9, consistency = 86, wins = 12, losses = 6,  streak = "2连胜", tier = "A+",
      playstyle = "扎实阵地防守·GALA无解飞脸团战绝杀",
      weakness = "中野主动出击频率偏低，容易在中期视野争夺中被偷龙",
      roster = { "Zika (上单 92)", "Weiwei (打野 91)", "Scout (中单 95)", "GALA (射手 96)", "Hang (辅助 91)" },
      trade_target = { name = "Shield (稳重肉装上单新秀)", role = "TOP", rating = 85, buyout = 130000, desc = "坦克开团熟练度高，抗压极强。" }
    },
    { rank = 10, id = "dk",  name = "Dplus KIA", short = "DK", region = "LCK", logo = "❄️", pwr = 93.5, consistency = 85, wins = 12, losses = 7,  streak = "1连胜", tier = "A+",
      playstyle = "许秀灵性刺杀·打野新生代冲击力",
      weakness = "年轻打野偶有经验短板，大龙决策屡屡陷入胶着",
      roster = { "Kingen (上单 92)", "Lucid (打野 91)", "ShowMaker (中单 95)", "Aiming (射手 93)", "Moham (辅助 89)" },
      trade_target = { name = "Bible (经验丰富指挥辅助)", role = "SUP", rating = 87, buyout = 160000, desc = "大局观优异，善于指挥年轻选手。" }
    },
    { rank = 11, id = "kt",  name = "KT Rolster", short = "KT", region = "LCK", logo = "🎢", pwr = 92.8, consistency = 82, wins = 11, losses = 7,  streak = "2连胜", tier = "A",
      playstyle = "过山车极致刺激·Bdd顶级沙皇与绝活开团",
      weakness = "状态起伏剧烈被称为过山车，失误率在劣势局急剧增加",
      roster = { "PerfecT (上单 89)", "Pyosik (打野 91)", "Bdd (中单 94)", "Deft (射手 93)", "BeryL (辅助 93)" },
      trade_target = { name = "Cast (韩服天梯新生代重装)", role = "TOP", rating = 86, buyout = 150000, desc = "剑魔、贾克斯单带压制力拔群。" }
    },
    { rank = 12, id = "fly", name = "FlyQuest", short = "FLY", region = "LCS", logo = "🍃", pwr = 92.2, consistency = 88, wins = 14, losses = 4,  streak = "4连胜", tier = "A",
      playstyle = "美洲赛区霸主·Bwipo狂暴黑科技上单",
      weakness = "过于依赖Bwipo上路个人发挥，一旦上路受挫全队战术难展",
      roster = { "Bwipo (上单 92)", "Inspired (打野 93)", "Quad (中单 90)", "Massu (射手 91)", "Busio (辅助 90)" },
      trade_target = { name = "Spirited (北美天才新中单)", role = "MID", rating = 85, buyout = 120000, desc = "控制法师精通，反应极快。" }
    },
    { rank = 13, id = "tl",  name = "Team Liquid", short = "TL", region = "LCS", logo = "🐴", pwr = 91.8, consistency = 86, wins = 13, losses = 5,  streak = "2连胜", tier = "A",
      playstyle = "韩系窒息控图换线·Impact不坏金身老将",
      weakness = "中路APA英雄池偶有被针对风险，逆风局缺乏单点击破能力",
      roster = { "Impact (上单 91)", "UmTi (打野 90)", "APA (中单 89)", "Yeon (射手 91)", "CoreJJ (辅助 93)" },
      trade_target = { name = "Swift (青训高潜射手)", role = "ADC", rating = 86, buyout = 140000, desc = "卡莎、泽丽绝活，基本功扎实。" }
    },
    { rank = 14, id = "fnc", name = "Fnatic", short = "FNC", region = "LEC", logo = "⚔️", pwr = 91.2, consistency = 84, wins = 13, losses = 6,  streak = "1连败", tier = "A",
      playstyle = "全员敢打敢拼·Razork野区前期疯狗节奏",
      weakness = "中期优势局经常冲动开团送龙，防守反击纪律性偏弱",
      roster = { "Oscarinin (上单 89)", "Razork (打野 92)", "Humanoid (中单 91)", "Noah (射手 91)", "Jun (辅助 90)" },
      trade_target = { name = "Rebel (欧洲凶狠野核新星)", role = "JUG", rating = 85, buyout = 125000, desc = "攻击性强，野区入侵凶悍。" }
    },
    { rank = 15, id = "nip", name = "NIP (Ninjas in Pyjamas)", short = "NIP", region = "LPL", logo = "🥷", pwr = 90.8, consistency = 83, wins = 11, losses = 7,  streak = "3连胜", tier = "A",
      playstyle = "两球一姬真神坐镇·上路单挑王硬碰硬",
      weakness = "中后期团战过度依赖Rookie个人开团闪现，容易陷入单核泥潭",
      roster = { "Shanji (上单 91)", "Aki (打野 89)", "Rookie (中单 95)", "Photic (射手 90)", "Zhuo (辅助 88)" },
      trade_target = { name = "Blade (二队凶残单带上单)", role = "TOP", rating = 86, buyout = 135000, desc = "擅长武器大师与单带破线。" }
    },
    { rank = 16, id = "we",  name = "Team WE", short = "WE", region = "LPL", logo = "🔴", pwr = 90.2, consistency = 81, wins = 10, losses = 8,  streak = "1连败", tier = "A",
      playstyle = "红色青春风暴·前期野区凶猛交锋",
      weakness = "后期终局决策偶现迷茫，劣势抗压容易被连环破塔",
      roster = { "Wayward (上单 89)", "Heng (打野 89)", "FoFo (中单 91)", "Able (射手 90)", "Iwandy (辅助 89)" },
      trade_target = { name = "Spark (高机动年轻ADC)", role = "ADC", rating = 86, buyout = 140000, desc = "团战输出高，补刀极其扎实。" }
    },
    { rank = 17, id = "c9",  name = "Cloud9", short = "C9", region = "LCS", logo = "☁️", pwr = 89.9, consistency = 82, wins = 11, losses = 7,  streak = "2连胜", tier = "A",
      playstyle = "北美传统豪门·韩援顶尖微操与野区疯狗",
      weakness = "中后期团队协同偶尔出现沟通断档，先锋团战选点较单一",
      roster = { "Thanatos (上单 90)", "Blaber (打野 91)", "Jojopyun (中单 90)", "Berserker (射手 94)", "Vulcan (辅助 89)" },
      trade_target = { name = "Berserker (世界级超巨ADC)", role = "ADC", rating = 94, buyout = 450000, desc = "超巨合约即将到期，能一人翻盘。" }
    },
    { rank = 18, id = "mdk", name = "MAD Lions KOI", short = "MDK", region = "LEC", logo = "🦁", pwr = 89.2, consistency = 80, wins = 11, losses = 8,  streak = "1连胜", tier = "A",
      playstyle = "西班牙青年近卫军·全图极速联动抓人",
      weakness = "大赛经验匮乏，被对手针对后容易产生急躁失误",
      roster = { "Myrwn (上单 88)", "Elyoya (打野 92)", "Fresskowy (中单 88)", "Supa (射手 89)", "Alvaro (辅助 89)" },
      trade_target = { name = "Flash (高反应欧洲射手新星)", role = "ADC", rating = 85, buyout = 110000, desc = "滑板鞋与女警压迫感极强。" }
    },
    { rank = 19, id = "fpx", name = "FunPlus Phoenix", short = "FPX", region = "LPL", logo = "🪶", pwr = 88.7, consistency = 79, wins = 10, losses = 9,  streak = "1连败", tier = "A",
      playstyle = "银河战舰野核·极速抓单突袭",
      weakness = "一旦milkyway野区陷入被动，全队容易陷入进攻瘫痪",
      roster = { "Xiaolaohu (上单 87)", "milkyway (打野 93)", "Care (中单 88)", "deokdam (射手 89)", "Life (辅助 88)" },
      trade_target = { name = "milkyway (超新星野核状元)", role = "JUG", rating = 93, buyout = 400000, desc = "最佳新秀，野核统治力无解。" }
    },
    { rank = 20, id = "kdf", name = "Kwangdong Freecs", short = "KDF", region = "LCK", logo = "⚔️", pwr = 88.1, consistency = 78, wins = 9, losses = 9,   streak = "2连败", tier = "A",
      playstyle = "硬核韧性抗压·防守反击抓失误",
      weakness = "终结比赛手段较为单一，顺风局推进节奏偶现拖沓",
      roster = { "DuDu (上单 89)", "Cuzz (打野 90)", "BuLLDoG (中单 87)", "Taeyoon (射手 86)", "Andil (辅助 86)" },
      trade_target = { name = "Rock (耐打防守型上单)", role = "TOP", rating = 84, buyout = 110000, desc = "坦克抗压极稳，性价比高。" }
    }
}

function GlobalPowerRankings.new()
    local self = setmetatable({}, GlobalPowerRankings)
    self.scouted_teams = {}
    return self
end

function GlobalPowerRankings:getTeams(region)
    if not region or region == "ALL" then
        return GlobalPowerRankings.TEAMS
    end
    local res = {}
    for _, t in ipairs(GlobalPowerRankings.TEAMS) do
        if t.region == region then
            table.insert(res, t)
        end
    end
    return res
end

function GlobalPowerRankings:getTeamById(team_id)
    for _, t in ipairs(GlobalPowerRankings.TEAMS) do
        if t.id == team_id then return t end
    end
    return nil
end

-- 战术刺探: 花费少量体能或资金深度剖析对手
function GlobalPowerRankings:scoutTeam(team_id, player)
    local t = self:getTeamById(team_id)
    if not t then return false, "战队不存在" end

    self.scouted_teams[team_id] = true
    local intel = string.format("【战术刺探成功】已破解【%s】的核心体系！\n战术破绽: %s\n推荐破阵策略: 主打快节奏反手控制，已激活面对该队 +8%% 战力洞察加成！",
        t.name, t.weakness)
    return true, intel, t
end

-- 模拟训练赛
function GlobalPowerRankings:simulateScrim(team_id, my_team_power)
    local t = self:getTeamById(team_id)
    if not t then return false, "战队不存在", {} end

    my_team_power = my_team_power or 88
    local diff = my_team_power - t.pwr
    local win_rate = math.min(85, math.max(15, math.floor(50 + diff * 3.5)))
    local roll = math.random(1, 100)
    local is_win = roll <= win_rate

    local logs = {
        string.format("【训练赛启动】你方战队 (战力 %d) 对阵 全球第%d名【%s】(战力 %.1f)", my_team_power, t.rank, t.name, t.pwr),
        string.format("前15分钟对线期：双方在小龙坑爆发激烈 5v5 团战！胜率评估: %d%%", win_rate)
    }

    if is_win then
        table.insert(logs, string.format("【战术大捷】凭借对【%s】打法弱点的精准抓取，完成绝杀破高地！", t.name))
    else
        table.insert(logs, string.format("【惜败复盘】【%s】展现出全球顶尖的 %s，大龙决战被动告负。", t.name, t.playstyle))
    end

    return is_win, logs, win_rate
end

-- 输出 TapTapMake 竖屏排位列表
function GlobalPowerRankings:renderCLI()
    print("\n================ 🌐 全球战队战力榜 (GLOBAL PRO POWER RANKINGS) ================")
    print("名次 | 战队代号        | 赛区 | 战力值 | 胜率    | 稳定性 | 状态状态")
    print("--------------------------------------------------------------------------------")
    for _, t in ipairs(GlobalPowerRankings.TEAMS) do
        local is_scouted = self.scouted_teams[t.id] and " [已刺探]" or ""
        print(string.format("#%-3d | %s %-12s | %-4s | %-6.1f | %-7.1f%% | %-6d%% | %s%s",
            t.rank, t.logo, t.short, t.region, t.pwr, (t.wins / (t.wins + t.losses)) * 100, t.consistency, t.streak, is_scouted))
    end
    print("================================================================================\n")
end

return GlobalPowerRankings
