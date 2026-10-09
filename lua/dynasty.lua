--[[
    DYNASTY & ORG TYCOON SYSTEM FOR ESPORTS LEGACY
--]]

local Dynasty = {}

function Dynasty.new()
    return {
        budget = 240000,
        fan_hype = 14500,
        world_rank = 8,
        roster = {
            { name = "Vortex", role = "TOP", power = 89, salary = 8500, value = 120000 },
            { name = "Phantom", role = "JUG", power = 91, salary = 9200, value = 135000 },
            { name = "Prodigy (You)", role = "MID", power = 96, salary = 15000, value = 280000 },
            { name = "SniperAce", role = "ADC", power = 93, salary = 11000, value = 190000 },
            { name = "Oracle", role = "SUP", power = 90, salary = 9500, value = 140000 }
        },
        facilities = {
            { name = "Gaming House Scrim Lab", tier = 2, max = 4, cost = 45000, effect = "+10% Macro Growth" },
            { name = "AI Analytics Suite",      tier = 2, max = 4, cost = 65000, effect = "+15% Draft Advantage" },
            { name = "Chef & Wellness Gym",     tier = 1, max = 3, cost = 35000, effect = "+20 Morale / Anti-Fatigue" },
            { name = "Broadcast Media Studio",  tier = 0, max = 3, cost = 120000, effect = "+40% Fan Hype" }
        },
        sponsors = {
            { name = "HyperGear Audio", payout = 4500, bonus = 25000, active = true },
            { name = "Apex Energy Drinks", payout = 9000, bonus = 60000, active = false },
            { name = "Omega Gaming Chairs", payout = 7000, bonus = 40000, active = false },
            { name = "Aether Automotive", payout = 22000, bonus = 180000, active = false }
        },
        scouts = {
            { name = "Zephyr (KR)", role = "TOP", power = 94, salary = 14000, cost = 250000 },
            { name = "ShadowFang (CN)", role = "JUG", power = 96, salary = 16500, cost = 310000 },
            { name = "Eclipse (KR)", role = "MID", power = 97, salary = 22000, cost = 450000 },
            { name = "HyperGuns (EU)", role = "ADC", power = 95, salary = 17000, cost = 320000 }
        }
    }
end

function Dynasty.getTeamPower(self)
    local total = 0
    for _, p in ipairs(self.roster) do
        total = total + p.power
    end
    return math.floor(total / #self.roster)
end

function Dynasty.upgradeFacility(self, index)
    local fac = self.facilities[index]
    if not fac then return false, "Invalid facility" end
    if fac.tier >= fac.max then return false, "Already max tier" end
    if self.budget < fac.cost then return false, "Insufficient funds" end

    self.budget = self.budget - fac.cost
    fac.tier = fac.tier + 1
    fac.cost = math.floor(fac.cost * 1.5)
    self.fan_hype = self.fan_hype + 2500
    return true, "Upgraded " .. fac.name
end

function Dynasty.signSponsor(self, index)
    local sp = self.sponsors[index]
    if not sp then return false, "Invalid sponsor" end
    if sp.active then return false, "Already signed" end

    sp.active = true
    self.budget = self.budget + sp.bonus
    self.fan_hype = self.fan_hype + 1500
    return true, "Signed " .. sp.name
end

function Dynasty.signScout(self, scout_index)
    local scout = self.scouts[scout_index]
    if not scout then return false, "Invalid scout" end
    if self.budget < scout.cost then return false, "Insufficient funds" end

    self.budget = self.budget - scout.cost
    -- Replace player in roster with same role
    for i, p in ipairs(self.roster) do
        if p.role == scout.role then
            self.roster[i] = {
                name = scout.name,
                role = scout.role,
                power = scout.power,
                salary = scout.salary,
                value = scout.cost
            }
            break
        end
    end
    self.fan_hype = self.fan_hype + 4000
    return true, "Transferred " .. scout.name .. " into starting roster!"
end

return Dynasty
