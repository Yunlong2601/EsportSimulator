--[[
    ============================================================================
    TAPTAP MAKE: APPAREL & MERCHANDISE R&D LAB ENGINE (战袍前沿研发实验室)
    ============================================================================
    Target Platform: TapTap Make (Mobile Portrait 2D Text-Simulator Engine)
    Language: Pure Lua 5.1 / 5.2 / 5.3 / LuaJIT

    功能概要:
      1. 5 阶战袍面料材质工学 (Fabric Technology) 研发树与专有特权
      2. 5 阶立体微晶印花工艺 (Print Quality & Optics) 研发树与夜光防伪特权
      3. 4 阶人体工学剪裁与 4 阶 NFC 智能穿戴辅助支线
      4. 实时战袍周度被动流水倍率与限时空投 (Flash Drop) 爆单收益联动
      5. 资金边际递减效应评估 (ROI) 与全球发布会粉丝狂热度 (Hype Boost) 暴涨
--]]

local MerchRDLab = {}
MerchRDLab.__index = MerchRDLab

-- 5-Tier 技术树静态配置数据
MerchRDLab.TECH_DEFINITIONS = {
    fabric_tech = {
        id = "fabric_tech",
        name = "面料工学与微孔排汗研发 (Fabric Technology)",
        category = "面料材质工程",
        max_tier = 5,
        tiers = {
            [1] = { title = "基础速干涤纶 (CoolMax Basic)", bonus = 0.12, cost = 30000, hype = 4, perk = "基础排汗与防静电处理，降低生产不良率" },
            [2] = { title = "蜂窝透气立体编织 (Honeycomb Aero-Weave)", bonus = 0.25, cost = 75000, hype = 6, perk = "腋下立体导流网眼，粉丝好评度+10%，空投门槛下调" },
            [3] = { title = "纳米抑菌银离子微纤 (Silver-Ion Nano Fiber)", bonus = 0.40, cost = 180000, hype = 8, perk = "永久防异味与耐汗蚀，战袍收藏级溢价+15%" },
            [4] = { title = "航天级 PCM 相变恒温层 (Phase Change Thermo-Reg)", bonus = 0.60, cost = 380000, hype = 10, perk = "冬暖夏凉微气候，全季节无淡季销售，冬季被动流水不衰减" },
            [5] = { title = "石墨烯仿生超导纤维 (Graphene Apex Composite)", bonus = 0.85, cost = 850000, hype = 15, perk = "极致超轻量化与超导散热，解锁「至尊冠军巡礼版」战袍销售通道" }
        }
    },
    print_quality = {
        id = "print_quality",
        name = "印花工艺与微晶烫印升级 (Print Quality & Optics)",
        category = "立体印花工艺",
        max_tier = 5,
        tiers = {
            [1] = { title = "环保水性胶浆印花 (Standard Screen Print)", bonus = 0.10, cost = 25000, hype = 4, perk = "基础耐洗固色，色彩饱和度达标，初级防脱色" },
            [2] = { title = "高密度微浮雕硅胶烫印 (3D High-Density Silicone)", bonus = 0.22, cost = 65000, hype = 6, perk = "队徽与战队标语哑光立体浮雕质感，手感触摸溢价提升" },
            [3] = { title = "光学全息变色微晶层 (Holographic Prism Foil)", bonus = 0.36, cost = 160000, hype = 8, perk = "视角变换霓虹镭射反光，社媒曝光与传播度+25%" },
            [4] = { title = "磁吸数码热转印微孔压合 (Magnetic Heat-Transfer Poly)", bonus = 0.55, cost = 340000, hype = 10, perk = "0触感无感烫印，选手签名与号码永不开裂脱落" },
            [5] = { title = "量子荧光夜光防伪晶片 (Quantum Luminescent Armor)", bonus = 0.78, cost = 750000, hype = 15, perk = "暗光环境队徽呼吸夜光，专属防伪芯片，二级市场爆单抢购潮" }
        }
    },
    ergonomic_cut = {
        id = "ergonomic_cut",
        name = "人体工学版型剪裁 (Ergonomic Pro Cut)",
        category = "版型剪裁工学",
        max_tier = 4,
        tiers = {
            [1] = { title = "标准宽松直筒版型", bonus = 0.06, cost = 18000, hype = 3, perk = "百搭身材无束缚，日常出街高穿搭率" },
            [2] = { title = "3D立体战术插肩剪裁", bonus = 0.14, cost = 45000, hype = 5, perk = "伏案操作无紧绷感，选手反馈上佳" },
            [3] = { title = "量体裁衣修身超能动线", bonus = 0.24, cost = 110000, hype = 7, perk = "显肩宽腰窄，粉丝上身体验打分大幅提升" },
            [4] = { title = "空气动力极速竞赛剪裁", bonus = 0.36, cost = 250000, hype = 10, perk = "职业战队御用剪裁，穿搭体感与视觉质感并存" }
        }
    },
    smart_chip = {
        id = "smart_chip",
        name = "NFC智能防伪互动芯片 (Smart NFC Wearable)",
        category = "智能物联网联名",
        max_tier = 4,
        tiers = {
            [1] = { title = "基础NFC防伪鉴真标签", bonus = 0.12, cost = 35000, hype = 4, perk = "官方认证芯片，杜绝盗版分流" },
            [2] = { title = "粉丝Club专属数字特权", bonus = 0.26, cost = 90000, hype = 7, perk = "周边复购率与铁粉忠诚度提升" },
            [3] = { title = "夺冠时刻AR全息互动", bonus = 0.42, cost = 210000, hype = 10, perk = "年轻受众传播裂变，短视频爆点" },
            [4] = { title = "心率联动应援灯效芯片", bonus = 0.60, cost = 480000, hype = 15, perk = "现场万千同频呼吸灯海，科技极客战袍终章" }
        }
    }
}

function MerchRDLab.new()
    local self = setmetatable({}, MerchRDLab)

    self.upgrades = {
        fabric_tech = 1,
        print_quality = 1,
        ergonomic_cut = 0,
        smart_chip = 0
    }

    self.total_rd_spent = 55000
    self.total_hype_gained = 8

    return self
end

-- 计算当前科研总流水倍率与各项拆解
function MerchRDLab:calculateMultipliers()
    local fabric_bonus = 0
    local print_bonus = 0
    local cut_bonus = 0
    local smart_bonus = 0

    local f_tier = self.upgrades.fabric_tech or 0
    if f_tier > 0 and MerchRDLab.TECH_DEFINITIONS.fabric_tech.tiers[f_tier] then
        fabric_bonus = MerchRDLab.TECH_DEFINITIONS.fabric_tech.tiers[f_tier].bonus
    end

    local p_tier = self.upgrades.print_quality or 0
    if p_tier > 0 and MerchRDLab.TECH_DEFINITIONS.print_quality.tiers[p_tier] then
        print_bonus = MerchRDLab.TECH_DEFINITIONS.print_quality.tiers[p_tier].bonus
    end

    local c_tier = self.upgrades.ergonomic_cut or 0
    if c_tier > 0 and MerchRDLab.TECH_DEFINITIONS.ergonomic_cut.tiers[c_tier] then
        cut_bonus = MerchRDLab.TECH_DEFINITIONS.ergonomic_cut.tiers[c_tier].bonus
    end

    local s_tier = self.upgrades.smart_chip or 0
    if s_tier > 0 and MerchRDLab.TECH_DEFINITIONS.smart_chip.tiers[s_tier] then
        smart_bonus = MerchRDLab.TECH_DEFINITIONS.smart_chip.tiers[s_tier].bonus
    end

    local total_bonus = fabric_bonus + print_bonus + cut_bonus + smart_bonus
    local total_multiplier = 1.00 + total_bonus

    return {
        multiplier = total_multiplier,
        fabric_bonus = fabric_bonus,
        print_bonus = print_bonus,
        cut_bonus = cut_bonus,
        smart_bonus = smart_bonus,
        f_tier = f_tier,
        p_tier = p_tier,
        c_tier = c_tier,
        s_tier = s_tier
    }
end

-- 获取已激活的核心特权列表
function MerchRDLab:getActivePerks()
    local perks = {}
    for tech_id, tier in pairs(self.upgrades) do
        local def = MerchRDLab.TECH_DEFINITIONS[tech_id]
        if def and tier > 0 then
            local tier_data = def.tiers[tier]
            if tier_data then
                table.insert(perks, {
                    tech_name = def.name,
                    tier = tier,
                    title = tier_data.title,
                    perk = tier_data.perk,
                    bonus = tier_data.bonus
                })
            end
        end
    end
    return perks
end

-- 注资研发升级
function MerchRDLab:investUpgrade(tech_id, dynasty_ref)
    local def = MerchRDLab.TECH_DEFINITIONS[tech_id]
    if not def then
        return false, "未找到该科研技术树模块: " .. tostring(tech_id)
    end

    local current_tier = self.upgrades[tech_id] or 0
    if current_tier >= def.max_tier then
        return false, string.format("【%s】已达到最高工艺巅峰 Lv.%d，无需继续注资！", def.name, def.max_tier)
    end

    local next_tier = current_tier + 1
    local next_data = def.tiers[next_tier]
    if not next_data then
        return false, "未找到目标阶梯配置"
    end

    local cost = next_data.cost
    if dynasty_ref and dynasty_ref.budget and dynasty_ref.budget < cost then
        local shortage = cost - dynasty_ref.budget
        return false, string.format("俱乐部预算储备不足！需要 $%d，当前仅有 $%d（还差 $%d）", cost, dynasty_ref.budget, shortage)
    end

    -- 扣款与生效
    if dynasty_ref and dynasty_ref.budget then
        dynasty_ref.budget = dynasty_ref.budget - cost
        if dynasty_ref.fan_hype then
            dynasty_ref.fan_hype = dynasty_ref.fan_hype + (next_data.hype * 300)
        end
    end

    self.upgrades[tech_id] = next_tier
    self.total_rd_spent = self.total_rd_spent + cost
    self.total_hype_gained = self.total_hype_gained + next_data.hype

    local mult = self:calculateMultipliers().multiplier
    return true, string.format(
        "🧪 突破成功！【%s】晋升至 Lv.%d「%s」！激活特权: %s，战袍综合倍率提升至 x%.2f，粉丝狂热度 +%d！",
        def.category, next_tier, next_data.title, next_data.perk, mult, next_data.hype
    )
end

-- 终端命令行状态打印 (TapTap Maker CLI 调试用)
function MerchRDLab:renderCLI()
    local res = self:calculateMultipliers()
    print("====================================================================")
    print("          🧪 战队周边商城 · 战袍前沿研发实验室 (R&D Lab)           ")
    print("====================================================================")
    print(string.format("综合营收倍率: x%.2f  (面料 +%d%%, 印花 +%d%%, 剪裁 +%d%%, NFC +%d%%)",
        res.multiplier,
        math.floor(res.fabric_bonus * 100),
        math.floor(res.print_bonus * 100),
        math.floor(res.cut_bonus * 100),
        math.floor(res.smart_bonus * 100)
    ))
    print(string.format("累计科研注资: $%d  |  累计狂热加成: +%d Hype", self.total_rd_spent, self.total_hype_gained))
    print("--------------------------------------------------------------------")
    print("【已激活尖端工艺特权】:")
    local perks = self:getActivePerks()
    for _, p in ipairs(perks) do
        print(string.format("  * [%s Lv.%d] %s -> %s", p.title, p.tier, p.perk, string.format("+%d%%", math.floor(p.bonus * 100))))
    end
    print("====================================================================")
end

return MerchRDLab
