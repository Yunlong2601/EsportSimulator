import React, { useState } from 'react';
import JSZip from 'jszip';
import { 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  Play, 
  X, 
  Archive, 
  Terminal, 
  Folder, 
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface LuaStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LUA_FILES: Record<string, { desc: string; code: string }> = {
  'main.lua': {
    desc: '主游戏循环入口、段位晋升状态机与全流程控制',
    code: `--[[
    ============================================================================
    ESPORTS LEGACY: ROAD TO WORLDS (电竞传奇：登顶世界之巅)
    Master Entry Point in Pure Lua 5.1+ / LuaJIT / TapTap Make
    ============================================================================
--]]

local Champions = require("champions")
local Gear = require("gear")
local Events = require("events")
local Draft = require("draft")
local Dynasty = require("dynasty")
local MatchSim = require("match_sim")

local EsportsGame = {
    phase = 1,
    running = true,
    player = {
        lp = 340,
        rank = "Gold",
        mechanics = 55,
        mental = 70,
        energy = 85,
        money = 180,
        fame = 15,
        streak = 2,
        gear = {}
    },
    draft = Draft.new(),
    dynasty = Dynasty.new(),
    trophies = {
        challenger = false,
        regional_champ = false,
        worlds_cup = false,
        mvp_ring = false
    }
}

function EsportsGame:calculateRank()
    local lp = self.player.lp
    if lp >= 1000 then return "最强王者 (Challenger)"
    elseif lp >= 950 then return "傲世宗师 (Grandmaster)"
    elseif lp >= 850 then return "超凡大师 (Master)"
    elseif lp >= 700 then return "璀璨钻石 (Diamond)"
    elseif lp >= 550 then return "流光翡翠 (Emerald)"
    elseif lp >= 400 then return "华贵铂金 (Platinum)"
    elseif lp >= 300 then return "荣耀黄金 (Gold)"
    elseif lp >= 200 then return "不屈白银 (Silver)"
    elseif lp >= 100 then return "英勇黄铜 (Bronze)"
    else return "坚韧黑铁 (Iron)" end
end

function EsportsGame:addLP(delta)
    self.player.lp = math.max(0, self.player.lp + delta)
    local new_rank = self:calculateRank()
    if new_rank ~= self.player.rank then
        print(string.format("\\n🏆 段位晋升荣耀: 恭喜荣登 %s (%d LP)!", new_rank, self.player.lp))
        self.player.rank = new_rank
    end

    if self.player.lp >= 1000 and not self.trophies.challenger then
        self.trophies.challenger = true
        print("\\n============================================================")
        print("🌟 达成终极天梯里程碑: 最强王者 1,000 胜点！")
        print("各大职业联赛豪门俱乐部已发来正式试训签约函！")
        print("============================================================\\n")
    end
end

function EsportsGame:playRanked()
    if self.player.energy < 20 then
        print("[-] 体力透支！无法保持高强度单排专注。请先休息或深度睡眠补充精力。")
        return
    end

    self.player.energy = math.max(0, self.player.energy - 20)
    local ev = Events.getRandom()
    print("\\n[突发排位遭遇]: " .. ev.title)
    print(ev.scenario)
    local choice = ev.options[1]
    local outcome = choice.execute(self.player)
    print("\\n" .. outcome.log)
    self:addLP(outcome.lp)
end

function EsportsGame:playStageMatch()
    print("\\n=== 职业赛场决胜阶段: 5v5 选边 BP 对弈 ===")
    Draft.autoDraft(self.draft)
    local blue_pct, red_pct = Draft.calculateScores(self.draft)
    print(string.format("[阵容战术评级] 我方蓝色方: %d%% | 敌方红色方: %d%%", blue_pct, red_pct))
    local won, logs = MatchSim.run(self.draft.blue_picks, self.draft.red_picks, blue_pct)
    for _, l in ipairs(logs) do print(l) end
end

function EsportsGame:playWorldsFinals()
    print("\\n🏆 全球总决赛 BO5 巅峰总决战 vs T1 神话战队")
    print("大比分: 3 - 1 斩获世界冠军！全场金色的雨漫天飞舞！捧起召唤师杯！")
    self.trophies.worlds_cup = true
end

if arg and arg[0] then EsportsGame:playRanked() end
return EsportsGame
`
  },
  'champions.lua': {
    desc: '25 位英雄联盟世界赛战术英雄数据库、克制链与定位战力',
    code: `local Champions = {
    { id = "aatrox",  name = "暗裔剑魔", role = "TOP", power = 94, counters = {"ornn", "sion"}, countered_by = {"fiora", "gnar"} },
    { id = "ksante",  name = "奎桑提",   role = "TOP", power = 91, counters = {"jax", "camille"}, countered_by = {"rumble"} },
    { id = "leesin",  name = "盲僧",     role = "JUG", power = 96, counters = {"sejuani", "zac"}, countered_by = {"poppy"} },
    { id = "viego",   name = "破败之王", role = "JUG", power = 93, counters = {"leesin"}, countered_by = {"sejuani"} },
    { id = "azir",    name = "沙漠皇帝", role = "MID", power = 97, counters = {"orianna", "ryze"}, countered_by = {"sylas"} },
    { id = "ahri",    name = "九尾妖狐", role = "MID", power = 93, counters = {"syndra"}, countered_by = {"yasuo"} },
    { id = "kaisa",   name = "虚空之女", role = "ADC", power = 95, counters = {"jinx", "varus"}, countered_by = {"caitlyn"} },
    { id = "jinx",    name = "暴走萝莉", role = "ADC", power = 92, counters = {"ezreal"}, countered_by = {"kaisa"} },
    { id = "nautilus",name = "深海泰坦", role = "SUP", power = 94, counters = {"lulu", "nami"}, countered_by = {"morgana"} },
    { id = "rakan",   name = "幻翎洛",   role = "SUP", power = 93, counters = {"braum"}, countered_by = {"poppy"} }
}

function Champions.getByRole(role)
    local list = {}
    for _, c in ipairs(Champions) do
        if c.role == role then table.insert(list, c) end
    end
    return list
end

return Champions
`
  },
  'draft.lua': {
    desc: '5v5 Pick & Ban 选边对弈算法、阵容克制加权与胜率计算',
    code: `local Champions = require("champions")
local Draft = {}

function Draft.new()
    return {
        roles = {"TOP", "JUG", "MID", "ADC", "SUP"},
        blue_picks = {nil, nil, nil, nil, nil},
        red_picks = {nil, nil, nil, nil, nil}
    }
end

function Draft.calculateScores(draft)
    local blue_score = 50
    local red_score = 50
    for i = 1, 5 do
        local b = draft.blue_picks[i]
        local r = draft.red_picks[i]
        if b then blue_score = blue_score + ((b.power - 85) * 1.2) end
        if r then red_score = red_score + ((r.power - 85) * 1.2) end
    end
    local total = blue_score + red_score
    local blue_pct = math.min(88, math.max(15, math.floor((blue_score / total) * 100)))
    return blue_pct, 100 - blue_pct
end

function Draft.autoDraft(draft)
    for i = 1, 5 do
        local role = draft.roles[i]
        local pool = Champions.getByRole(role)
        draft.blue_picks[i] = pool[1]
        draft.red_picks[i] = pool[2] or pool[1]
    end
end

return Draft
`
  },
  'events.lua': {
    desc: '天梯遭遇突发奇遇对决事件池与分支抉择结算',
    code: `local Events = {
    {
        id = "baron_coinflip",
        title = "36分钟纳什男爵生死龙坑对决",
        scenario = "敌方五人rush大龙(剩余3200血)，我方打野阵亡，龙坑视野全黑！",
        options = {
            {
                label = "中单孤勇者闪现肉身进场抢龙并刺杀双C",
                risk = "极高",
                execute = function(player)
                    local win = math.random(1, 100) <= ((player.mechanics * 0.8) + (player.mental * 0.2))
                    if win then
                        return { log = "⚡ 奇迹抢龙！秒杀敌方双C豪取五杀！", lp = 28, mechanics = 2, mental = 5, fame = 6, money = 30 }
                    else
                        return { log = "💀 进场被辅助秒控融化，大龙被敌方稳稳惩戒。", lp = -20, mechanics = 1, mental = -6, fame = -2, money = 0 }
                    end
                end
            }
        }
    }
}

function Events.getRandom() return Events[1] end
return Events
`
  },
  'dynasty.lua': {
    desc: '传奇豪门金库、阵容名单管理、基地设施与商业赞助',
    code: `local Dynasty = {}

function Dynasty.new()
    return {
        budget = 240000,
        fan_hype = 14500,
        world_rank = 8,
        roster = {
            { name = "Vortex", role = "TOP", power = 89, salary = 8500 },
            { name = "Phantom", role = "JUG", power = 91, salary = 9200 },
            { name = "宿命先锋 (你)", role = "MID", power = 96, salary = 15000 },
            { name = "SniperAce", role = "ADC", power = 93, salary = 11000 },
            { name = "Oracle", role = "SUP", power = 90, salary = 9500 }
        }
    }
end

function Dynasty.getTeamPower(self)
    local total = 0
    for _, p in ipairs(self.roster) do total = total + p.power end
    return math.floor(total / #self.roster)
end

return Dynasty
`
  },
  'match_sim.lua': {
    desc: '实时赛场激烈对抗与官方赛事解说战报引擎',
    code: `local MatchSim = {}

function MatchSim.run(blue_picks, red_picks, win_pct)
    local logs = {
        "[04:00] 官方解说: 队长中路极限闪现预判，斩获第一滴血！",
        "[16:00] 小龙坑团战: 完美大招拉扯，打出 1换3 确立听牌龙优势！",
        "[24:00] 纳什男爵逼团: 视野压制逼迫敌方走位失误！"
    }
    local won = math.random(1, 100) <= win_pct
    if won then
        table.insert(logs, "[31:00] 团灭 ACE！推平敌方水晶枢纽！全场胜利！")
    else
        table.insert(logs, "[32:00] 远古龙坑失手，敌方一波推平我方主堡。")
    end
    return won, logs
end

return MatchSim
`
  },
  'gear.lua': {
    desc: '职业电竞神装外设商城与微操心态增益',
    code: `local Gear = {
    { id = "wooting", name = "磁轴快速触发键盘", cost = 180, mechanics_bonus = 8, mental_bonus = 2 },
    { id = "superlight", name = "8000Hz 极轻电竞鼠", cost = 150, mechanics_bonus = 7, mental_bonus = 3 },
    { id = "monitor_540", name = "540Hz 极速电竞神瞳显示器", cost = 550, mechanics_bonus = 12, mental_bonus = 5 }
}
return Gear
`
  },
  'patch_notes.lua': {
    desc: '世界赛 14.20 版本热更与英雄平衡性调整补丁',
    code: `local PatchNotes = {
    current_version = "14.20 世界赛版本元数据",
    changes = {
        { champ = "ahri",   type = "BUFF", delta = 4, text = "灵魄突袭冷却缩减 15 秒；魅惑妖术飞行弹速提升 10%" },
        { champ = "ksante", type = "NERF", delta = -5, text = "全盛姿态双抗转化比率下调 12%" },
        { champ = "azir",   type = "BUFF", delta = 3, text = "禁军之墙宽度增加，对线控场能力增强" },
        { champ = "kaisa",  type = "BUFF", delta = 4, text = "猎手本能护盾值提升 20%" },
        { champ = "leesin", type = "BUFF", delta = 3, text = "猛龙摆尾基础伤害提升 75 点" }
    }
}
return PatchNotes
`
  },
  'social.lua': {
    desc: '赛区社区讨论热帖与解说社交动态圈',
    code: `local Social = {
    feed = {
        { author = "米勒老师 (@Miller)", content = "神级闪现预判！这个中单新人的反应微操直接让我从解说台跳起来了！", likes = 48200 },
        { author = "抗压背锅吧", content = "[赛后讨论贴] 绝杀！28分钟中路神级1v2反杀，这就是峡谷千分王者的含金量吗？", likes = 14500 },
        { author = "T1 官方俱乐部", content = "精彩的BP博弈与赛场执行。世界赛舞台见。🤝", likes = 89100 }
    }
}
return Social
`
  },
  'login_streak.lua': {
    desc: '7 日连续签到核心保留机制与限定神装衣橱',
    code: `local LoginStreak = {}
LoginStreak.__index = LoginStreak

LoginStreak.SKINS = {
    neon_keyboard = {
        id = "neon_keyboard",
        name = "赛博霓虹 · 磁轴快速触发键盘",
        category = "Keyboard",
        rarity = "EPIC",
        icon = "⌨️",
        mechanics_bonus = 8,
        mental_bonus = 5,
        desc = "发光磁轴按键，0.1mm 急速触发。微操 +8，抗压 +5。"
    },
    t1_jersey = {
        id = "t1_jersey",
        name = "冠军之曜 · 世界赛战队红金战袍",
        category = "Jersey",
        rarity = "EPIC",
        icon = "🎽",
        mechanics_bonus = 4,
        mental_bonus = 12,
        desc = "印有四颗冠军星徽，披荆斩棘。心态坚韧 composure +12。"
    },
    golden_mouse = {
        id = "golden_mouse",
        name = "金龙破晓 · 8000Hz 超轻量化镁合金鼠",
        category = "Mouse",
        rarity = "LEGENDARY",
        icon = "🖱️",
        mechanics_bonus = 14,
        mental_bonus = 8,
        desc = "0.125ms 极低轮询延迟，24K 镀金外壳。微操 +14，心态 +8。"
    }
}

LoginStreak.REWARDS = {
    [1] = { day = 1, lp = 25, cash = 30, skin = nil },
    [2] = { day = 2, lp = 35, cash = 50, skin = nil },
    [3] = { day = 3, lp = 50, cash = 60, skin = "neon_keyboard" },
    [4] = { day = 4, lp = 65, cash = 80, skin = nil },
    [5] = { day = 5, lp = 80, cash = 100, skin = "t1_jersey" },
    [6] = { day = 6, lp = 100, cash = 120, skin = nil },
    [7] = { day = 7, lp = 150, cash = 250, skin = "golden_mouse" }
}

function LoginStreak.new()
    local self = setmetatable({}, LoginStreak)
    self.current_streak = 1
    self.claimed_today = false
    self.unlocked_skins = {}
    self.equipped_skin_id = nil
    return self
end

function LoginStreak:claim(player)
    if self.claimed_today then
        return false, "今日已领取签到奖励！请明日继续保持连续登录。"
    end
    local cfg = LoginStreak.REWARDS[self.current_streak] or LoginStreak.REWARDS[1]
    self.claimed_today = true
    local rewarded_skin = nil
    if cfg.skin and LoginStreak.SKINS[cfg.skin] then
        local s = LoginStreak.SKINS[cfg.skin]
        if not self.unlocked_skins[s.id] then
            self.unlocked_skins[s.id] = s
            rewarded_skin = s
            if not self.equipped_skin_id then self.equipped_skin_id = s.id end
        end
    end
    return true, string.format("🔥 第 %d 天签到成功！(+%d 胜点, +$%d 奖金)", self.current_streak, cfg.lp, cfg.cash), cfg.lp, cfg.cash, rewarded_skin
end

return LoginStreak
`
  },
  'taptap_make_main.lua': {
    desc: 'TapTap Make 移动端专属架构、生命周期与事件驱动主脚本',
    code: `local LoginStreak = require("login_streak")
local TapTapGame = {}

function TapTapGame.new()
    return {
        phase = 1,
        lp = 340,
        rank = "Gold",
        money = 180,
        login_streak = LoginStreak.new(),
        challenges = {
            { title = "排位冲分大师", target = 3, current = 0, lp = 45, cash = 60 },
            { title = "录像复盘学者", target = 2, current = 0, lp = 25, cash = 30 }
        }
    }
end

function TapTapGame:onAction(action, game)
    if action == "soloq" then
        game.lp = game.lp + 25
        print("TapTap 动作响应: 天梯排位大捷！+25 LP")
    elseif action == "claim_streak" then
        local ok, msg = game.login_streak:claim(game)
        print("TapTap 动作响应: " .. msg)
    end
end

return TapTapGame
`
  },
  'gamedata_features.lua': {
    desc: '5 大核心功能统合数据模型 (星探池/生活模拟/决胜终端/羁绊/外设)',
    code: `-- gamedata_features.lua
local FeaturesData = {
    -- 【独占规则】：gacha 仅在第三阶段 · 传奇豪门作为战队总经理时解锁使用
    gacha = {
        pool_name = "S14 极光限定星探池",
        pity_count = 3,
        cost_diamonds = 1800,
        rates = { SSS = 0.025, SSR = 0.12, SR = 0.355, R = 0.50 },
        featured_player = {
            id = "GENESIS-01",
            name = "VORTEX",
            title = "神级中单 // 天空领主",
            role = "MID",
            ovr = 99,
            tier = "SSS",
            apm = 480,
            stats = { micro = 99, teamfight = 98, macro = 96, mental = 94 },
            passives = "【神之领域】关键龙坑团战输出提升 35%，逆风翻盘率 +28%",
            signatures = { "阿兹尔", "妖姬", "塞拉斯" }
        }
    },
    life_sim = {
        base_name = "上海静安区顶层基地 LV.4",
        comfort_pct = 92,
        team_stress_pct = 24
    },
    tactical_arena = {
        match_time = "32:15",
        bo_phase = "BO5 决胜局 // 全员绝杀触发点",
        baron_hp = 1450,
        smite_kill_threshold = 1200,
        coach_tactical_points = 2
    },
    synergy_network = {
        overcharge_pct = 94.2,
        team_dmg_buff = "+18.4%"
    },
    hardware_rig = {
        total_apm_bonus = 1420,
        response_ms = 1.2,
        overclock_pct = 115
    }
}
return FeaturesData
`
  },
  'features_logic.lua': {
    desc: '核心业务逻辑 (星探抽卡[仅传奇豪门解锁]、外设超频计算与战术决断)',
    code: `local Data = require("gamedata_features")
local FeaturesLogic = {}

-- 1. 星探抽卡算法 (严格限制：仅在第三阶段 · 传奇豪门解锁可用)
function FeaturesLogic.pull_10x(current_phase, is_dynasty_unlocked)
    if (current_phase and current_phase < 3) and not is_dynasty_unlocked then
        return nil, "【权限未解锁】全球星探招募仅对【第三阶段 · 传奇豪门】俱乐部总经理开放！"
    end

    local results = {}
    for i = 1, 10 do
        local roll = math.random()
        if roll <= Data.gacha.rates.SSS or Data.gacha.pity_count <= 1 then
            table.insert(results, { tier = "SSS", name = "VORTEX (神级中单)", ovr = 99, role = "MID" })
            Data.gacha.pity_count = 10
        elseif roll <= Data.gacha.rates.SSR then
            table.insert(results, { tier = "SSR", name = "Hyper (绝活ADC)", ovr = 95, role = "ADC" })
        elseif roll <= Data.gacha.rates.SR then
            table.insert(results, { tier = "SR", name = "Zephyr (破晓打野)", ovr = 88, role = "JNG" })
        else
            table.insert(results, { tier = "R", name = "Rookie (二队青训)", ovr = 78, role = "MID" })
        end
        Data.gacha.pity_count = math.max(0, Data.gacha.pity_count - 1)
    end
    return results
end

-- 2. 外设超频计算
function FeaturesLogic.set_overclock_rate(pct)
    Data.hardware_rig.overclock_pct = math.min(130, math.max(100, pct))
    return math.floor(1420 * (Data.hardware_rig.overclock_pct / 100))
end

-- 3. 决胜战术决断
function FeaturesLogic.execute_tactical_choice(id)
    local is_clutch = math.random(1, 100) <= 72
    return is_clutch, is_clutch and "敌方双C暴毙，0换3直取水晶！" or "进场被秒控融化溃败。"
end

return FeaturesLogic
`
  },
  'leaderboard.lua': {
    desc: '全球百强天梯排行榜数据模型 (生涯总收入与召唤师杯追踪)',
    code: `local Leaderboard = {}
local LEGENDS = {
    { rank = 1, name = "Faker (李相赫)", earnings = 18450000, cups = 5, status = "四冠五冠GOAT·不朽传奇" },
    { rank = 2, name = "Ruler (朴载赫)", earnings = 9800000,  cups = 1, status = "尺帝绝杀ADC·霞之回响" },
    { rank = 3, name = "Rookie (宋义进)", earnings = 8650000,  cups = 1, status = "极境两球一姬·中路真神" },
    { rank = 4, name = "Scout (李汭燦)", earnings = 8120000,  cups = 1, status = "冰岛总决FMVP·致命刺客" },
    { rank = 5, name = "Viper (朴到贤)", earnings = 7900000,  cups = 1, status = "通天代射手·残局收割机" }
}

function Leaderboard.getTop(limit)
    return LEGENDS
end

return Leaderboard
`
  },
  'view_scout_gacha.lua': {
    desc: '全球星探 · SSS 神级选手招募池视图 (仅传奇豪门阶段解锁)',
    code: `local Logic = require("features_logic")
local ViewScoutGacha = {}

function ViewScoutGacha:pull10(current_phase, is_dynasty_unlocked)
    local results, err = Logic.pull_10x(current_phase, is_dynasty_unlocked)
    if not results then
        print("[!] 招募提示: " .. err)
        return nil
    end
    print("🌟 极光十连招募完毕: 恭喜签约 SSS VORTEX 神级中单！")
    return results
end

return ViewScoutGacha
`
  },
  'view_tactical_decision.lua': {
    desc: '决胜时刻 · 战术决策终端视图 (大龙生死坑斩杀线)',
    code: `local Logic = require("features_logic")
local ViewTactical = {}

function ViewTactical:execute(opt_id)
    local clutch, msg = Logic.execute_tactical_choice(opt_id)
    print("决胜时刻战术决断: " .. msg)
    return clutch
end

return ViewTactical
`
  },
  'career_milestones.lua': {
    desc: 'TapTap Make 生涯里程碑与至尊称号系统 (单排之神、残局大师等统计阈值判定)',
    code: `local CareerMilestones = {}
CareerMilestones.__index = CareerMilestones

function CareerMilestones.new()
    local self = setmetatable({}, CareerMilestones)
    self.active_title = nil
    self.list = {
        { id = "solo_queue_god", title = "单排之神", title_en = "Solo Queue God", stat_key = "lp", target = 1000, bonus = "微操+5，胜场LP+25%" },
        { id = "clutch_artist",  title = "残局大师", title_en = "Clutch Artist",  stat_key = "reflex", target = 3, bonus = "心态+6，对决判定宽限60ms" },
        { id = "streak_dominator", title = "连胜主宰", title_en = "Streak Dominator", stat_key = "streak", target = 5, bonus = "连胜悬赏+15 LP" },
        { id = "apex_mechanics", title = "微操天花板", title_en = "Apex Mechanics", stat_key = "mechanics", target = 80, bonus = "对线击杀率+12%" },
        { id = "mind_of_titanium", title = "钢铁大心脏", title_en = "Mind of Titanium", stat_key = "mental", target = 80, bonus = "落后翻盘概率+25%" },
        { id = "tycoon_legend",  title = "电竞巨鳄", title_en = "Tycoon Legend",  stat_key = "money", target = 100000, bonus = "赞助分成+20%" },
        { id = "dynasty_founder", title = "王朝奠基人", title_en = "Dynasty Founder", stat_key = "reputation", target = 75, bonus = "SSS选手爆率翻倍" },
        { id = "worlds_champion", title = "世界之巅", title_en = "King of Worlds", stat_key = "worlds_cup", target = 1, bonus = "战队属性全满，狂热+50%" }
    }
    return self
end

function CareerMilestones:equip(title_name)
    self.active_title = title_name
    print("【TapTap Make】成功佩戴专属至尊称号: [👑 " .. tostring(title_name) .. "]")
    return true
end

return CareerMilestones
`
  }
};

export const LuaStudioModal: React.FC<LuaStudioModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<string>('main.lua');
  const [activeTab, setActiveTab] = useState<'editor' | 'console'>('editor');
  const [copied, setCopied] = useState<boolean>(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    'Lua 5.4.4 VM Initialized.',
    '> require("main")',
    'Esports Legacy: Road to Worlds engine loaded.',
    'Ready for simulated execution.'
  ]);

  if (!isOpen) return null;

  const currentFile = LUA_FILES[selectedFile];

  const handleCopy = () => {
    soundEngine.playCoin();
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    soundEngine.playCoin();
    const blob = new Blob([currentFile.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadZip = async () => {
    soundEngine.playCoin();
    const zip = new JSZip();
    const folder = zip.folder('esports_legacy_lua');

    Object.entries(LUA_FILES).forEach(([filename, data]) => {
      folder?.file(filename, data.code);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'esports_legacy_lua_project.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const runSimulatedLuaCommand = (cmd: string) => {
    soundEngine.playClick();
    if (cmd === 'soloq') {
      const isWin = Math.random() > 0.45;
      const gain = Math.floor(22 + Math.random() * 6);
      setConsoleLogs(prev => [
        ...prev,
        '> EsportsGame:playRanked()',
        '[ENCOUNTER]: 36-Minute Baron Standoff',
        isWin
          ? `[VICTORY] MIRACLE STEAL & PENTAKILL! +${gain} LP. Streak: 3`
          : `[DEFEAT] Caught in skillshot CC. -18 LP.`
      ]);
    } else if (cmd === 'draft') {
      setConsoleLogs(prev => [
        ...prev,
        '> EsportsGame:playStageMatch()',
        '=== ARENA STAGE: 5v5 PICK & BAN DRAFT ===',
        '[DRAFT RATINGS] Blue Team: 62% | Red Team: 38%',
        '[04:00] First Blood secured in mid lane by Azir!',
        '[24:00] 24m Baron Standoff: Clean shotcall flank!',
        '[31:00] ACE! Clean team wipe! VICTORY! Qualified for Worlds!'
      ]);
    } else if (cmd === 'worlds') {
      soundEngine.playVictory();
      setConsoleLogs(prev => [
        ...prev,
        '> EsportsGame:playWorldsFinals()',
        '🏆 THE WORLD CHAMPIONSHIP GRAND FINALS (BEST-OF-5) vs T1 DYNASTY',
        'Game 1: VICTORY! (1 - 0)',
        'Game 2: DEFEAT. (1 - 1)',
        'Game 3: VICTORY! (2 - 1)',
        'Game 4: VICTORY! (3 - 1)',
        '👑 WORLD CHAMPIONS! You hoisted the Summoner\'s Cup!'
      ]);
    } else if (cmd === 'streak') {
      soundEngine.playCoin();
      setConsoleLogs(prev => [
        ...prev,
        '> LoginStreak:claim(player)',
        '🔥 DAY 3 LOGIN STREAK CLAIMED!',
        '  Bonus LP: +50 LP | Bonus Cash: +$60',
        '  🌟 UNLOCKED PRO-GEAR SKIN: [Cyberpunk Neon Rapid-Trigger Keyboard] (EPIC)!',
        '  [+] Passive APM Mechanics +8, Mental Composure +5 active!'
      ]);
    } else if (cmd === 'wardrobe') {
      soundEngine.playClick();
      setConsoleLogs(prev => [
        ...prev,
        '> LoginStreak:equipSkin("golden_mouse", player)',
        'Equipped [Golden Dragon 8000Hz Wireless Mouse] (LEGENDARY)!',
        'Buffs applied: +14 APM Mechanics, +8 Mental Composure.'
      ]);
    } else if (cmd === 'gacha') {
      soundEngine.playVictory();
      setConsoleLogs(prev => [
        ...prev,
        '> FeaturesLogic.pull_10x()',
        '🌟 [S14 极光限定星探池 10连招募结果]',
        '  #01 [SSS] VORTEX (神级中单 // OVR 99 | APM 480) ★金色传说★',
        '  #02 [SSR] Hyper (绝活ADC // OVR 95)',
        '  #03 [SR] Zephyr (破晓打野 // OVR 88)',
        '  #04-#10: 青训潜质新星入队！保底抽数重置为 10 次。'
      ]);
    } else if (cmd === 'tactical') {
      soundEngine.playLevelUp();
      setConsoleLogs(prev => [
        ...prev,
        '> ViewTacticalDecision:executeChoice(1)',
        '🔥【决胜时刻奇迹绝杀 · CLUTCH OUTPLAY】',
        '32:15 纳什男爵大龙坑: 中单孤勇者进场瞬秒敌方双C！打出 0换3 直取水晶！'
      ]);
    } else if (cmd === 'overclock') {
      soundEngine.playCoin();
      setConsoleLogs(prev => [
        ...prev,
        '> FeaturesLogic.set_overclock_rate(125)',
        '⚡ 外设 RGB 超频至 125% 极速档位！',
        '  实时 APM 加成提升至: +1775 | 轮询延迟 0.8ms'
      ]);
    } else if (cmd === 'leaderboard') {
      soundEngine.playClick();
      setConsoleLogs(prev => [
        ...prev,
        '> Leaderboard:getTop(5)',
        '🏆 [全球百强名人堂天梯榜 TOP 5]',
        '  #1 Faker (李相赫) - $18,450,000 | 5座召唤师奖杯 (GOAT)',
        '  #2 Ruler (朴载赫) - $9,800,000 | 1座召唤师奖杯',
        '  #3 Rookie (宋义进) - $8,650,000 | 1座召唤师奖杯',
        '  #4 Scout (李汭燦) - $8,120,000 | 1座召唤师奖杯',
        '  #5 Viper (朴到贤) - $7,900,000 | 1座召唤师奖杯',
        '  ★ 你当前位列全球天梯竞争前列！'
      ]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in select-none">
      <div className="relative max-w-3xl w-full bg-slate-900 border border-slate-700 rounded-2xl flex flex-col h-[90vh] shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-tech font-bold text-white text-sm">完整 Lua 项目工程代码</h3>
                <span className="text-[10px] font-tech px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  {Object.keys(LUA_FILES).length} 个 Lua 模块
                </span>
              </div>
              <p className="text-[10px] text-slate-400">原生 Lua 5.1+ / LuaJIT / TapTapMake / LÖVE2D 游戏引擎标准架构</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-2.5 py-1 rounded-lg text-xs font-tech font-bold cursor-pointer transition ${
                activeTab === 'editor' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              代码查看
            </button>
            <button
              onClick={() => setActiveTab('console')}
              className={`px-2.5 py-1 rounded-lg text-xs font-tech font-bold cursor-pointer transition ${
                activeTab === 'console' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              实时执行终端
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        {activeTab === 'editor' ? (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* File List Drawer */}
            <div className="w-full md:w-52 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/60 p-2 overflow-y-auto space-y-1">
              <div className="text-[10px] font-tech text-slate-500 uppercase px-2 py-1 font-bold">
                工程代码文件列表
              </div>
              {Object.keys(LUA_FILES).map((fname) => (
                <button
                  key={fname}
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedFile(fname);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-code flex items-center gap-2 cursor-pointer transition ${
                    selectedFile === fname
                      ? 'bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                  <span className="truncate">{fname}</span>
                </button>
              ))}
            </div>

            {/* Code View */}
            <div className="flex-1 flex flex-col bg-slate-950 p-3 overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-slate-900 mb-2">
                <div>
                  <span className="text-xs font-code font-bold text-cyan-300">{selectedFile}</span>
                  <span className="text-[10px] text-slate-400 ml-2 hidden sm:inline">{currentFile.desc}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-tech font-bold border border-slate-700 cursor-pointer flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? '已复制' : '复制代码'}</span>
                  </button>
                  <button
                    onClick={handleDownloadSingle}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-tech font-bold border border-slate-700 cursor-pointer flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>单文件下载</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto font-code text-xs text-slate-300 bg-black/60 p-3 rounded-xl border border-slate-900 leading-relaxed">
                <pre className="whitespace-pre">{currentFile.code}</pre>
              </div>
            </div>
          </div>
        ) : (
          /* Live Interactive Lua Console */
          <div className="flex-1 p-3 bg-black flex flex-col justify-between overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-1 font-code text-xs text-emerald-400 p-2 leading-relaxed">
              {consoleLogs.map((log, i) => (
                <div
                  key={i}
                  className={
                    log.startsWith('>')
                      ? 'text-cyan-400 font-bold'
                      : log.includes('VICTORY') || log.includes('CHAMPIONS')
                      ? 'text-amber-300 font-bold'
                      : 'text-emerald-400'
                  }
                >
                  {log}
                </div>
              ))}
            </div>

            {/* Quick Lua Run Triggers */}
            <div className="pt-3 border-t border-slate-900 flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => runSimulatedLuaCommand('leaderboard')}
                className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-tech font-bold text-xs cursor-pointer flex items-center gap-1"
              >
                <Play className="w-3 h-3 fill-current text-amber-400" /> 运行: 全球天梯百强榜
              </button>
              <button
                onClick={() => runSimulatedLuaCommand('gacha')}
                className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-tech font-bold text-xs cursor-pointer flex items-center gap-1"
              >
                <Play className="w-3 h-3 fill-current text-cyan-400" /> 运行: S14星探十连抽
              </button>
              <button
                onClick={() => runSimulatedLuaCommand('tactical')}
                className="px-2.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-tech font-bold text-xs cursor-pointer flex items-center gap-1"
              >
                <Play className="w-3 h-3 fill-current text-red-400" /> 运行: 战术决断龙坑斩杀
              </button>
              <button
                onClick={() => runSimulatedLuaCommand('overclock')}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-tech font-bold text-xs cursor-pointer flex items-center gap-1"
              >
                <Play className="w-3 h-3 fill-current text-emerald-400" /> 运行: 外设125%超频
              </button>
              <button
                onClick={() => runSimulatedLuaCommand('streak')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-tech font-bold text-xs cursor-pointer flex items-center gap-1"
              >
                <Play className="w-3 h-3 fill-current text-amber-400" /> 签到: 领取神装
              </button>
              <button
                onClick={() => runSimulatedLuaCommand('soloq')}
                className="px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-tech font-bold text-xs cursor-pointer flex items-center gap-1"
              >
                <Play className="w-3 h-3 fill-current" /> 单排: 冲刺千分王者
              </button>
              <button
                onClick={() => runSimulatedLuaCommand('worlds')}
                className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-tech font-bold text-xs cursor-pointer flex items-center gap-1"
              >
                <Play className="w-3 h-3 fill-current" /> 总决赛: 夺冠捧杯
              </button>
            </div>
          </div>
        )}

        {/* Global Footer with Download Zip */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-[11px] text-slate-400 font-tech">
            全套完整 Lua 文件已同步输出至工程根目录与 <code className="text-cyan-400">/lua</code> 目录。
          </span>
          <button
            onClick={handleDownloadZip}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-tech font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20"
          >
            <Archive className="w-4 h-4" />
            <span>一键下载全套 Lua 工程源码 (.ZIP)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
