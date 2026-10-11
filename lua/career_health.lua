--[[
    ============================================================================
    TAPTAP MAKE: CAREER HEALTH & PHYSIOTHERAPY MODULE (职业健康与电竞理疗中心)
    ============================================================================
    Platform: TapTap Make (Mobile Portrait Text-Simulator Engine)
    Language: Pure Lua 5.1 / 5.2 / 5.3 / LuaJIT

    Mechanic:
      - Continuous grinding (Ranked, Bootcamps, Reflex Drills) without sleep/rest
        accumulates wrist/tendon strain.
      - Dangerously high strain triggers RSI (Repetitive Strain Injury / 腱鞘炎).
      - RSI severely limits/debuffs the player's maximum Mechanics (操作上限)!
        (e.g., normal 100 cap reduced to 85, 70, or 55).
      - Players must visit an Esports Physiotherapist (运动康复理疗中心) to
        alleviate strain, cure RSI, and fully recover their maximum Mechanics stat!
--]]

local CareerHealth = {}
CareerHealth.__index = CareerHealth

CareerHealth.TREATMENTS = {
    {
        id = "ice_stretching",
        name = "自适应冰敷与抗阻拉伸",
        title = "基础运动康复",
        icon = "🧊",
        cost = 30,
        strain_relief = 25,
        cures = { mild = true },
        max_mechanics_restored = 100,
        desc = "医用冷疗凝胶加压包敷，配合腕屈伸肌群抗阻离心拉伸训练，迅速消退酸胀感。"
    },
    {
        id = "kinesiology_taping",
        name = "职业电竞肌内效贴扎",
        title = "赛级力学固定",
        icon = "🩹",
        cost = 85,
        strain_relief = 50,
        cures = { mild = true },
        max_mechanics_restored = 100,
        desc = "专业队医X型交叉十字力学贴扎，为指总伸肌腱提供额外仿生弹力支撑，缓解微操震颤。"
    },
    {
        id = "ultrasound_release",
        name = "超声波与深层筋膜刀松解",
        title = "专科医疗理疗",
        icon = "⚡",
        cost = 220,
        strain_relief = 85,
        cures = { mild = true, moderate = true },
        max_mechanics_restored = 100,
        desc = "1MHz聚焦超声波热疗深达骨膜层，搭配IASTM不锈钢筋膜刀精准剥离前臂瘢痕粘连。"
    },
    {
        id = "shockwave_therapy",
        name = "体外发散式冲击波深度神经再生",
        title = "三甲级电竞医学特需门诊",
        icon = "💉",
        cost = 560,
        strain_relief = 100,
        cures = { mild = true, moderate = true, severe = true },
        max_mechanics_restored = 100,
        desc = "顶级豪门专供高能气压弹道冲击波，激活内源性生长因子释放与毛细血管新生，全面根治顽固劳损。"
    },
    {
        id = "team_doctor_contract",
        name = "聘请专属运动医学理疗博士",
        title = "冠军豪门私教团队",
        icon = "🩺",
        cost = 1200,
        strain_relief = 100,
        cures = { mild = true, moderate = true, severe = true },
        max_mechanics_restored = 100,
        perk = "常驻特效：获得【骨骼装甲】护盾，后续训练劳损累积降低 50%",
        desc = "全职入驻选手日常生活，提供赛前人体工学定制外设微调与赛后手法放松，保驾护航直至夺冠。"
    }
}

function CareerHealth.newDefaultState()
    return {
        strain = 0,                -- 0 - 100 手部肌腱积劳负荷
        has_rsi = false,           -- 是否患上重复性劳损/腱鞘炎 (RSI)
        rsi_severity = "none",     -- none / mild / moderate / severe
        max_mechanics = 100,       -- 正常上限 100，患病时下调至 85 / 70 / 55
        consecutive_grinds = 0,    -- 连续未休整磨练场次
        treatments_count = 0,      -- 累计接受治疗次数
        physio_perk_active = false -- 专属理疗顾问减伤护盾
    }
end

function CareerHealth.evaluateGrindStrain(player, base_strain)
    player.career_health = player.career_health or CareerHealth.newDefaultState()
    local ch = player.career_health

    local effective_strain = ch.physio_perk_active and math.floor(base_strain * 0.5) or base_strain
    ch.strain = math.min(100, math.max(0, ch.strain + effective_strain))
    ch.consecutive_grinds = ch.consecutive_grinds + 1

    local fatigue_multiplier = (player.energy < 25 or (player.focus or 100) < 25) and 1.8 or 1.0
    local risk_rate = (ch.strain / 100) * 0.55 * fatigue_multiplier
    local roll = math.random()

    local triggered = false
    local msg = nil

    if not ch.has_rsi then
        if ch.strain >= 85 or (ch.strain >= 60 and roll < risk_rate) then
            ch.has_rsi = true
            if ch.strain >= 90 then
                ch.rsi_severity = "moderate"
                ch.max_mechanics = 70
                msg = "🚨 【腱鞘炎急性爆发】连续高强度微操且缺乏休整，确诊【中度职业腕管综合征(RSI)】！手腕麻木僵硬，最大操作上限被强制封顶在 70 点！请立即前往理疗中心！"
            else
                ch.rsi_severity = "mild"
                ch.max_mechanics = 85
                msg = "⚠️ 【手腕隐痛预警】长时间拼刀与高频拉枪致使肌腱水肿，诱发【轻度腱鞘炎(RSI)】！最大操作上限降低至 85 点，需理疗师介入治疗！"
            end
            triggered = true
        end
    else
        -- Escalate existing RSI
        if ch.rsi_severity == "mild" and ch.strain >= 85 and roll < 0.4 then
            ch.rsi_severity = "moderate"
            ch.max_mechanics = 70
            triggered = true
            msg = "🚨 【腱鞘劳损恶化】带伤硬撑导致韧带水肿加剧，病情恶化为【中度职业腕管综合征(RSI)】！操作上限进一步压低至 70 点！"
        elseif ch.rsi_severity == "moderate" and ch.strain >= 95 and roll < 0.35 then
            ch.rsi_severity = "severe"
            ch.max_mechanics = 55
            triggered = true
            msg = "💥 【严重撕裂危机】长期忽视劳损引爆【重度慢性腱鞘炎(RSI)】！操作上限雪崩跌至 55 点！必须立刻接受冲击波或名医理疗！"
        end
    end

    -- Clamp current player mechanics to max_mechanics cap
    if player.mechanics > ch.max_mechanics then
        player.mechanics = ch.max_mechanics
    end

    return triggered, msg
end

function CareerHealth.actionTreat(player, treatment_id)
    player.career_health = player.career_health or CareerHealth.newDefaultState()
    local ch = player.career_health

    local target_treatment = nil
    for _, t in ipairs(CareerHealth.TREATMENTS) do
        if t.id == treatment_id then target_treatment = t; break end
    end
    if not target_treatment then
        return false, "❌ 找不到对应的理疗项目！"
    end

    if player.money < target_treatment.cost then
        return false, string.format("❌ 资金不足：接受【%s】需要 $%d，当前仅有 $%d！",
            target_treatment.name, target_treatment.cost, player.money)
    end

    player.money = player.money - target_treatment.cost
    ch.strain = math.max(0, ch.strain - target_treatment.strain_relief)
    ch.treatments_count = ch.treatments_count + 1

    local can_cure = ch.has_rsi and target_treatment.cures[ch.rsi_severity]
    local old_severity = ch.rsi_severity

    if can_cure then
        ch.has_rsi = false
        ch.rsi_severity = "none"
        ch.max_mechanics = 100
        player.mechanics = math.min(100, math.max(player.mechanics, 75))
    end

    if target_treatment.id == "team_doctor_contract" then
        ch.physio_perk_active = true
    end

    player.mental = math.min(100, player.mental + 15)

    local log_msg
    if can_cure then
        log_msg = string.format("🩺 【理疗奇迹】接受【%s】(-$%d)！彻底根治【%s】腱鞘炎(RSI)，手腕肌腱完全愈合，最大微操上限恢复至 100 巅峰！",
            target_treatment.name, target_treatment.cost, old_severity)
    else
        log_msg = string.format("🩺 【康复理疗】接受【%s】(-$%d)！手腕累积劳损负荷消退 %d%% (剩余负荷: %d%%)，神经释压，心态+15！",
            target_treatment.name, target_treatment.cost, target_treatment.strain_relief, ch.strain)
    end

    return true, log_msg
end

function CareerHealth.renderCLI(player)
    player.career_health = player.career_health or CareerHealth.newDefaultState()
    local ch = player.career_health

    local status_str = "🟢 健康 (无劳损)"
    if ch.has_rsi then
        status_str = string.format("🚨 患有【%s】腱鞘炎(RSI) · 操作上限锁死: %d/100", ch.rsi_severity, ch.max_mechanics)
    elseif ch.strain >= 70 then
        status_str = "⚠️ 高度酸胀危险 (极易突发腱鞘炎)"
    elseif ch.strain >= 40 then
        status_str = "🟡 中度劳损积累"
    end

    print("\n================== 🩺 职业健康与运动康复理疗中心 (CAREER HEALTH) ==================")
    print(string.format("【诊断状态】%s | 【手部肌腱积劳负荷】%d%% | 【连续作战】%d 场无休",
        status_str, ch.strain, ch.consecutive_grinds))
    print(string.format("【当前微操】%d | 【允许操作上限】%d/100 | 【生涯资金】$%d | 【累计理疗】%d 次",
        player.mechanics, ch.max_mechanics, player.money, ch.treatments_count))
    if ch.physio_perk_active then
        print("🛡️ 【骨骼装甲】常驻特权生效中：对局产生的腱鞘劳损累积减半 -50%！")
    end
    print("----------------------------------------------------------------------------------")

    print("可用理疗康复方案：")
    for i, t in ipairs(CareerHealth.TREATMENTS) do
        local can_buy = player.money >= t.cost and "可施治" or "缺资金"
        local cure_note = (ch.has_rsi and t.cures[ch.rsi_severity]) and "🌟 可根治当前伤病!" or ""
        print(string.format("%d. [%s] $%d (%s) -> 负荷-%d%% | 恢复上限至%d %s",
            i, t.name, t.cost, can_buy, t.strain_relief, t.max_mechanics_restored, cure_note))
        print(string.format("   描述: %s", t.desc))
    end
    print("==================================================================================\n")
end

return CareerHealth
