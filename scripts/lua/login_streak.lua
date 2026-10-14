--[[
    ============================================================================
    LOGIN STREAK & PRO-GEAR SKINS MODULE (for TapTap Make / Lua 5.1+)
    ============================================================================
    Implements a 7-day retention loop:
      - Daily consecutive login streak tracking
      - Progressive bonus LP & tournament purse cash
      - Unique Pro-Gear skins on Day 3 (Neon Keyboard), Day 5 (T1 Jersey),
        and Day 7 (Golden 8000Hz Mouse)
      - Dynamic stat buffs (APM mechanics & composure mental) when equipped
--]]

local LoginStreak = {}
LoginStreak.__index = LoginStreak

-- Unique Pro-Gear Skins with in-game attribute modifiers
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
        desc = "Woven with four championship stars. Unshakable composure: Mental +12."
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

-- 7-Day Reward Schedule
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
    self.highest_streak = 1
    self.last_login_day = os.date("%Y-%m-%d")
    self.claimed_today = false
    self.unlocked_skins = {}
    self.equipped_skin_id = nil
    return self
end

-- Check streak state on game launch (handles day roll-over)
function LoginStreak:checkNewDay(simulated_today)
    local today = simulated_today or os.date("%Y-%m-%d")
    if today ~= self.last_login_day then
        -- In a full engine, compare timestamps. If consecutive, increment; if skipped, reset to 1
        if not self.claimed_today then
            -- missed yesterday: streak resets to 1
            self.current_streak = 1
        else
            -- claimed yesterday: streak advances!
            self.current_streak = (self.current_streak % 7) + 1
        end
        self.last_login_day = today
        self.claimed_today = false
        if self.current_streak > self.highest_streak then
            self.highest_streak = self.current_streak
        end
    end
end

-- Claim today's daily streak reward
function LoginStreak:claim(player)
    if self.claimed_today then
        return false, "Already claimed today's login reward! Come back tomorrow for Day " .. (((self.current_streak) % 7) + 1) .. "."
    end

    local day_cfg = LoginStreak.REWARDS[self.current_streak] or LoginStreak.REWARDS[1]
    self.claimed_today = true

    -- Grant rewards to player
    local rewarded_skin = nil
    if day_cfg.skin and LoginStreak.SKINS[day_cfg.skin] then
        local skin_data = LoginStreak.SKINS[day_cfg.skin]
        if not self.unlocked_skins[skin_data.id] then
            self.unlocked_skins[skin_data.id] = skin_data
            rewarded_skin = skin_data
            -- Auto-equip if nothing currently equipped
            if not self.equipped_skin_id then
                self:equipSkin(skin_data.id, player)
            end
        end
    end

    local log_msg = string.format(
        "🔥 DAY %d LOGIN STREAK CLAIMED!\n  Bonus LP: +%d LP\n  Bonus Cash: +$%d",
        self.current_streak, day_cfg.lp, day_cfg.cash
    )
    if rewarded_skin then
        log_msg = log_msg .. string.format("\n  🌟 UNLOCKED PRO-GEAR SKIN: [%s] (%s)!", rewarded_skin.name, rewarded_skin.rarity)
    end

    return true, log_msg, day_cfg.lp, day_cfg.cash, rewarded_skin
end

-- Equip a Pro-Gear skin and update player stats
function LoginStreak:equipSkin(skin_id, player)
    local skin = self.unlocked_skins[skin_id]
    if not skin then
        return false, "You haven't unlocked this skin yet!"
    end

    -- Remove previous skin bonuses if any
    if self.equipped_skin_id and self.unlocked_skins[self.equipped_skin_id] and player then
        local prev = self.unlocked_skins[self.equipped_skin_id]
        player.mechanics = math.max(10, player.mechanics - prev.mechanics_bonus)
        player.mental = math.max(5, player.mental - prev.mental_bonus)
    end

    self.equipped_skin_id = skin_id
    if player then
        player.mechanics = math.min(100, player.mechanics + skin.mechanics_bonus)
        player.mental = math.min(100, player.mental + skin.mental_bonus)
    end

    return true, string.format("Equipped [%s]! Buffs applied: +%d Mechanics, +%d Mental.", skin.name, skin.mechanics_bonus, skin.mental_bonus)
end

-- Get currently active gear buffs
function LoginStreak:getActiveBuffs()
    if self.equipped_skin_id and self.unlocked_skins[self.equipped_skin_id] then
        local s = self.unlocked_skins[self.equipped_skin_id]
        return s.mechanics_bonus, s.mental_bonus, s.name
    end
    return 0, 0, "Default Gear"
end

return LoginStreak
