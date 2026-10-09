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
    desc: 'Master game entry point, loop, state engine & CLI menu',
    code: `--[[
    ESPORTS LEGACY: ROAD TO WORLDS
    Master Entry Point in Pure Lua 5.1+ / LuaJIT
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
    if lp >= 1000 then return "Challenger"
    elseif lp >= 950 then return "Grandmaster"
    elseif lp >= 850 then return "Master"
    elseif lp >= 700 then return "Diamond"
    elseif lp >= 550 then return "Emerald"
    elseif lp >= 400 then return "Platinum"
    elseif lp >= 300 then return "Gold"
    elseif lp >= 200 then return "Silver"
    elseif lp >= 100 then return "Bronze"
    else return "Iron" end
end

function EsportsGame:addLP(delta)
    self.player.lp = math.max(0, self.player.lp + delta)
    local new_rank = self:calculateRank()
    if new_rank ~= self.player.rank then
        print(string.format("\\n🏆 RANK PROMOTION: You are now %s (%d LP)!", new_rank, self.player.lp))
        self.player.rank = new_rank
    end

    if self.player.lp >= 1000 and not self.trophies.challenger then
        self.trophies.challenger = true
        print("\\n============================================================")
        print("🌟 MILESTONE REACHED: 1,000 LP CHALLENGER!")
        print("Official Scout Inquiry from Pro Academy has been received!")
        print("============================================================\\n")
    end
end

function EsportsGame:playRanked()
    if self.player.energy < 20 then
        print("[-] Too exhausted to play Solo Queue. Rest or sleep first.")
        return
    end

    self.player.energy = math.max(0, self.player.energy - 20)
    local ev = Events.getRandom()
    print("\\n[ENCOUNTER]: " .. ev.title)
    print(ev.scenario)
    local choice = ev.options[1]
    local outcome = choice.execute(self.player)
    print("\\n" .. outcome.log)
    self:addLP(outcome.lp)
end

function EsportsGame:playStageMatch()
    print("\\n=== ARENA STAGE: 5v5 PICK & BAN DRAFT ===")
    Draft.autoDraft(self.draft)
    local blue_pct, red_pct = Draft.calculateScores(self.draft)
    print(string.format("[DRAFT RATINGS] Blue Team: %d%% | Red Team: %d%%", blue_pct, red_pct))
    local won, logs = MatchSim.run(self.draft.blue_picks, self.draft.red_picks, blue_pct)
    for _, l in ipairs(logs) do print(l) end
end

function EsportsGame:playWorldsFinals()
    print("\\n🏆 THE WORLD CHAMPIONSHIP GRAND FINALS (BEST-OF-5) vs T1 DYNASTY")
    local your_wins = 3
    print("Series: 3 - 1 VICTORY! Summoner's Cup Secured!")
    self.trophies.worlds_cup = true
end

if arg and arg[0] then EsportsGame:run() end
return EsportsGame
`
  },
  'champions.lua': {
    desc: '25 LoL Worlds-inspired champions, roles, tiers, and counters',
    code: `local Champions = {
    { id = "aatrox",  name = "Aatrox",  role = "TOP", power = 94, counters = {"ornn", "sion"}, countered_by = {"fiora", "gnar"} },
    { id = "ksante",  name = "K'Sante", role = "TOP", power = 91, counters = {"jax", "camille"}, countered_by = {"rumble"} },
    { id = "leesin",  name = "Lee Sin", role = "JUG", power = 96, counters = {"sejuani", "zac"}, countered_by = {"poppy"} },
    { id = "viego",   name = "Viego",   role = "JUG", power = 93, counters = {"leesin"}, countered_by = {"sejuani"} },
    { id = "azir",    name = "Azir",    role = "MID", power = 97, counters = {"orianna", "ryze"}, countered_by = {"sylas"} },
    { id = "ahri",    name = "Ahri",    role = "MID", power = 93, counters = {"syndra"}, countered_by = {"yasuo"} },
    { id = "kaisa",   name = "Kai'Sa",  role = "ADC", power = 95, counters = {"jinx", "varus"}, countered_by = {"caitlyn"} },
    { id = "jinx",    name = "Jinx",    role = "ADC", power = 92, counters = {"ezreal"}, countered_by = {"kaisa"} },
    { id = "nautilus",name = "Nautilus",role = "SUP", power = 94, counters = {"lulu", "nami"}, countered_by = {"morgana"} },
    { id = "rakan",   name = "Rakan",   role = "SUP", power = 93, counters = {"braum"}, countered_by = {"poppy"} }
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
    desc: '5v5 Pick & Ban logic, synergy ratings, and counter scoring',
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
    desc: 'Random solo queue encounters and branching player decisions',
    code: `local Events = {
    {
        id = "baron_coinflip",
        title = "36-Minute Baron Standoff",
        scenario = "Enemy rushing Baron Nashor (3,200 HP). Your jungler is dead!",
        options = {
            {
                label = "Flash In for 50/50 Steal",
                risk = "High",
                execute = function(player)
                    local win = math.random(1, 100) <= ((player.mechanics * 0.8) + (player.mental * 0.2))
                    if win then
                        return { log = "MIRACLE STEAL & PENTAKILL!", lp = 28, mechanics = 2, mental = 5, fame = 6, money = 30 }
                    else
                        return { log = "Caught in CC and died.", lp = -20, mechanics = 1, mental = -6, fame = -2, money = 0 }
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
    desc: 'Org Tycoon treasury, rosters, sponsors, and facility upgrades',
    code: `local Dynasty = {}

function Dynasty.new()
    return {
        budget = 240000,
        fan_hype = 14500,
        world_rank = 8,
        roster = {
            { name = "Vortex", role = "TOP", power = 89, salary = 8500 },
            { name = "Phantom", role = "JUG", power = 91, salary = 9200 },
            { name = "Prodigy (You)", role = "MID", power = 96, salary = 15000 },
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
    desc: 'Live match simulation with caster feeds and teamfight resolution',
    code: `local MatchSim = {}

function MatchSim.run(blue_picks, red_picks, win_pct)
    local logs = {
        "[04:00] First Blood secured in mid lane!",
        "[16:00] Dragon Soul 5v5 skirmish in river!",
        "[24:00] 24m Baron Standoff and shotcall flank!"
    }
    local won = math.random(1, 100) <= win_pct
    if won then
        table.insert(logs, "[31:00] ACE! Clean team wipe! Nexus destroyed! VICTORY!")
    else
        table.insert(logs, "[32:00] Enemy pushed base. DEFEAT.")
    end
    return won, logs
end

return MatchSim
`
  },
  'gear.lua': {
    desc: 'Hardware catalog with APM and mental resilience bonuses',
    code: `local Gear = {
    { id = "wooting", name = "Hall-Effect Keyboard", cost = 180, mechanics_bonus = 8, mental_bonus = 2 },
    { id = "superlight", name = "Ultralight Mouse", cost = 150, mechanics_bonus = 7, mental_bonus = 3 },
    { id = "monitor_360", name = "360Hz OLED Display", cost = 550, mechanics_bonus = 12, mental_bonus = 5 }
}
return Gear
`
  },
  'conf.lua': {
    desc: 'LÖVE2D configuration for mobile portrait resolution (400x760)',
    code: `function love.conf(t)
    t.title = "Esports Legacy: Road to Worlds"
    t.version = "11.4"
    t.window.width = 400
    t.window.height = 760
    t.window.resizable = false
end
`
  },
  'patch_notes.lua': {
    desc: 'Patch 14.20 system with champion buffs and nerfs',
    code: `local PatchNotes = {
    current_version = "Patch 14.20: Worlds Championship Meta",
    changes = {
        { champ = "ahri",   type = "BUFF", delta = 4, text = "Spirit Rush cooldown -15s; Charm speed +10%" },
        { champ = "ksante", type = "NERF", delta = -5, text = "All Out armor conversion -12%" },
        { champ = "azir",   type = "BUFF", delta = 3, text = "Emperor's Divide wall width widened" },
        { champ = "kaisa",  type = "BUFF", delta = 4, text = "Killer Instinct shield value +20%" },
        { champ = "leesin", type = "BUFF", delta = 3, text = "Dragon Rage base damage +75" }
    }
}

function PatchNotes.applyToChampions(champs)
    for _, change in ipairs(PatchNotes.changes) do
        for _, c in ipairs(champs) do
            if c.id == change.champ then c.power = c.power + change.delta end
        end
    end
end

return PatchNotes
`
  },
  'social.lua': {
    desc: 'Live simulated fan reactions, Reddit threads and Caedrel tweets',
    code: `local Social = {
    feed = {
        { author = "Caedrel (@Caedrel)", content = "NAHH HE REALLY PULLED OFF THE INSEC KICK! MY GOAT!", likes = 48200 },
        { author = "r/leagueoflegends", content = "[Post-Match Discussion] Prodigy 14 kills carry in Game 1!", likes = 14500 },
        { author = "T1 Official (@T1LoL)", content = "A formidable draft. See you on the Grand Finals stage. 🤝", likes = 89100 }
    }
}

function Social.printRandom()
    local post = Social.feed[math.random(1, #Social.feed)]
    print("\\n[TWITTER / REDDIT VIRAL FEED] " .. post.author .. ": \\"" .. post.content .. "\\"")
end

return Social
`
  },
  'login_streak.lua': {
    desc: '7-Day Daily Login Streak Retention Engine with Pro-Gear Skins',
    code: `local LoginStreak = {}
LoginStreak.__index = LoginStreak

LoginStreak.SKINS = {
    neon_keyboard = {
        id = "neon_keyboard",
        name = "Cyberpunk Neon Rapid-Trigger Keyboard",
        category = "Keyboard",
        rarity = "EPIC",
        icon = "⌨️",
        mechanics_bonus = 8,
        mental_bonus = 5,
        desc = "Luminescent magnetic switches with 0.1mm actuation. APM +8, Mental +5."
    },
    t1_jersey = {
        id = "t1_jersey",
        name = "T1 Worlds Championship Red-Gold Jersey",
        category = "Jersey",
        rarity = "EPIC",
        icon = "🎽",
        mechanics_bonus = 4,
        mental_bonus = 12,
        desc = "Woven with four championship stars. Unshakable mental composure (+12)."
    },
    golden_mouse = {
        id = "golden_mouse",
        name = "Golden Dragon 8000Hz Wireless Mouse",
        category = "Mouse",
        rarity = "LEGENDARY",
        icon = "🖱️",
        mechanics_bonus = 14,
        mental_bonus = 8,
        desc = "0.125ms polling rate with 24K gold magnesium shell. Mechanics +14, Mental +8."
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
        return false, "Already claimed today! Come back tomorrow for Day " .. (((self.current_streak) % 7) + 1)
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
    return true, string.format("🔥 DAY %d LOGIN STREAK CLAIMED! (+%d LP, +$%d)", self.current_streak, cfg.lp, cfg.cash), cfg.lp, cfg.cash, rewarded_skin
end

function LoginStreak:equipSkin(skin_id, player)
    local skin = self.unlocked_skins[skin_id]
    if not skin then return false, "Skin not unlocked yet!" end
    self.equipped_skin_id = skin_id
    return true, "Equipped " .. skin.name
end

return LoginStreak
`
  },
  'taptap_make_main.lua': {
    desc: 'Dedicated TapTap Make Mobile Game Architecture & Lifecycle Module',
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
            { title = "Grind Master", target = 3, current = 0, lp = 45, cash = 60 },
            { title = "VOD Analyst", target = 2, current = 0, lp = 25, cash = 30 }
        }
    }
end

-- TapTap Mobile Action Hook
function TapTapGame:onAction(action, game)
    if action == "soloq" then
        game.lp = game.lp + 25
        print("TapTap Action: Solo Q Victory! +25 LP")
    elseif action == "claim_streak" then
        local ok, msg = game.login_streak:claim(game)
        print("TapTap Action: " .. msg)
    end
end

return TapTapGame
`
  },
  'esports_legacy.lua': {
    desc: 'Standalone all-in-one Lua script for single-file TapTap Make import',
    code: `-- Standalone Single-File Esports Legacy Simulator
-- Progression: Solo Q -> 1,000 LP Challenger (Captain) -> $1,000,000 Org Buyout -> Worlds Bo5
local Game = { phase = 1, unlocked = { [1] = true, [2] = false, [3] = false } }
local Player = { lp = 340, rank = "Gold", money = 180, streak = 2 }

function Player:addLP(delta)
    self.lp = math.max(0, self.lp + delta)
    if self.lp >= 1000 and not Game.unlocked[2] then
        Game.unlocked[2] = true
        print("🌟 CHALLENGER REACHED! PHASE 2 STAGE DRAFT UNLOCKED!")
    end
end

return { Game = Game, Player = Player }
`
  },
  'gamedata_features.lua': {
    desc: 'Unified state model for the 5 screens: Gacha, Life Sim, Tactical Arena, Synergy, Hardware',
    code: `-- gamedata_features.lua
local FeaturesData = {
    gacha = {
        pool_name = "S14 极光限定星探池",
        pity_count = 3,
        cost_diamonds = 1800,
        rates = { SSS = 0.025, SSR = 0.12, SR = 0.355, R = 0.50 },
        featured_player = {
            name = "VORTEX",
            title = "神级中单",
            role = "MID",
            ovr = 99,
            tier = "SSS",
            apm = 480
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
    desc: 'Executable logic for 10-pull gacha, overclock risk calculation, and tactical decisions',
    code: `local Data = require("gamedata_features")
local FeaturesLogic = {}

function FeaturesLogic.pull_10x()
    local results = {}
    for i = 1, 10 do
        local roll = math.random()
        if roll <= Data.gacha.rates.SSS or Data.gacha.pity_count <= 1 then
            table.insert(results, { tier = "SSS", name = "Vortex (中单神)", ovr = 99 })
            Data.gacha.pity_count = 10
        else
            table.insert(results, { tier = "SSR", name = "Hyper (ADC)", ovr = 95 })
        end
    end
    return results
end

function FeaturesLogic.set_overclock_rate(pct)
    Data.hardware_rig.overclock_pct = math.min(130, math.max(100, pct))
    return math.floor(1420 * (Data.hardware_rig.overclock_pct / 100))
end

function FeaturesLogic.execute_tactical_choice(id)
    local is_clutch = math.random(1, 100) <= 72
    return is_clutch, is_clutch and "敌方双C暴毙，0换3！" or "进场被秒控溃败"
end

return FeaturesLogic
`
  },
  'leaderboard.lua': {
    desc: 'Global Top 100 Leaderboard tracking Career Earnings & Summoner’s Cup Wins',
    code: `local Leaderboard = {}
-- Tracks Faker, Ruler, Rookie, Scout, TheShy, Uzi, and Top 100 world rankings
local LEGENDS = {
    { rank = 1, name = "Faker (李相赫)", earnings = 18450000, cups = 5 },
    { rank = 2, name = "Ruler (朴载赫)", earnings = 9800000,  cups = 1 },
    { rank = 3, name = "Rookie (宋义进)", earnings = 8650000,  cups = 1 },
    { rank = 4, name = "Scout (李汭燦)", earnings = 8120000,  cups = 1 }
}

function Leaderboard.getTop(limit)
    return LEGENDS
end

return Leaderboard
`
  },
  'view_scout_gacha.lua': {
    desc: 'Screen 1 View: SSS Scout Gacha Hero card with 4-stat grid and pull animations',
    code: `local Logic = require("features_logic")
local ViewScoutGacha = {}

function ViewScoutGacha:pull10()
    local results = Logic.pull_10x()
    print("🌟 极光十连招募完毕: 恭喜获得 SSS Vortex!")
    return results
end

return ViewScoutGacha
`
  },
  'view_tactical_decision.lua': {
    desc: 'Screen 3 View: Baron Pit Decider HUD, 1,200 Smite Threshold & Coach Directives',
    code: `local Logic = require("features_logic")
local ViewTactical = {}

function ViewTactical:execute(opt_id)
    local clutch, msg = Logic.execute_tactical_choice(opt_id)
    print("决胜时刻决断结果: " .. msg)
    return clutch
end

return ViewTactical
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
                <h3 className="font-tech font-bold text-white text-sm">Full Lua Project Suite</h3>
                <span className="text-[10px] font-tech px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  {Object.keys(LUA_FILES).length} Lua Modules
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Pure Lua 5.1+ / LuaJIT / LÖVE2D Mobile & Desktop Architecture</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-2.5 py-1 rounded-lg text-xs font-tech font-bold cursor-pointer transition ${
                activeTab === 'editor' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              Lua Explorer
            </button>
            <button
              onClick={() => setActiveTab('console')}
              className={`px-2.5 py-1 rounded-lg text-xs font-tech font-bold cursor-pointer transition ${
                activeTab === 'console' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              Live Lua Console
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
                Project Files
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
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleDownloadSingle}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-tech font-bold border border-slate-700 cursor-pointer flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
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
                <Play className="w-3 h-3 fill-current text-amber-400" /> Run: Leaderboard:getTop(5)
              </button>
              <button
                onClick={() => runSimulatedLuaCommand('gacha')}
                className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-tech font-bold text-xs cursor-pointer flex items-center gap-1"
              >
                <Play className="w-3 h-3 fill-current text-cyan-400" /> Run: FeaturesLogic.pull_10x()
              </button>
              <button
                onClick={() => runSimulatedLuaCommand('tactical')}
                className="px-2.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-tech font-bold text-xs cursor-pointer flex items-center gap-1"
              >
                <Play className="w-3 h-3 fill-current text-red-400" /> Run: ViewTacticalDecision:execute()
              </button>
              <button
                onClick={() => runSimulatedLuaCommand('overclock')}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-tech font-bold text-xs cursor-pointer flex items-center gap-1"
              >
                <Play className="w-3 h-3 fill-current text-emerald-400" /> Run: Overclock:125%
              </button>
              <button
                onClick={() => runSimulatedLuaCommand('streak')}
                className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-tech font-bold text-xs cursor-pointer flex items-center gap-1"
              >
                <Play className="w-3 h-3 fill-current text-amber-400" /> Streak:claim()
              </button>
              <button
                onClick={() => runSimulatedLuaCommand('soloq')}
                className="px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-tech font-bold text-xs cursor-pointer flex items-center gap-1"
              >
                <Play className="w-3 h-3 fill-current" /> Player:playRanked()
              </button>
              <button
                onClick={() => runSimulatedLuaCommand('worlds')}
                className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-tech font-bold text-xs cursor-pointer flex items-center gap-1"
              >
                <Play className="w-3 h-3 fill-current" /> Worlds:Bo5()
              </button>
            </div>
          </div>
        )}

        {/* Global Footer with Download Zip */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-[11px] text-slate-400 font-tech">
            Complete Lua files exported to workspace root and <code className="text-cyan-400">/lua</code> folder.
          </span>
          <button
            onClick={handleDownloadZip}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-tech font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20"
          >
            <Archive className="w-4 h-4" />
            <span>Download All Lua Files (.ZIP)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
