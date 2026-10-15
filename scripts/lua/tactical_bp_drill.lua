-- ============================================================================
-- DAILY TACTICAL BP DRILL PUZZLES & BUFFS (每日教练战术 BP 残局沙盘特训)
-- Ported from Web: src/data/tacticalBpDrillData.ts & DailyTacticalDrillModal.tsx
-- ============================================================================

local TacticalBpDrill = {}

TacticalBpDrill.PUZZLES = {
    {
        id = "puzzle_dive_counter",
        title = "针对强开突脸流 (Anti-Dive Strategy)",
        scenario = "敌方一抢锁定「蔚」与「亚托克斯 (剑魔)」，意图通过无脑锁头强开秒杀我方后排双C。作为主教练，你需要精准布置三步BP封锁与反制链！",
        enemyComposition = "硬核突脸锁头阵 (Vi + Aatrox + Ahri)",
        slots = {
            {
                phase = "BAN_1",
                phaseName = "一阶段封锁 (BAN 1)",
                targetRole = "SUP",
                enemyThreat = "深海泰坦 / 蕾欧娜 (连环强控锁死后排)",
                idealAnswers = { "泰坦", "蕾欧娜", "诺提勒斯" },
                hint = "封锁敌方突进击飞控制链核心辅助，避免后排动弹不得"
            },
            {
                phase = "PICK_1",
                phaseName = "先手反制选人 (PICK 1)",
                targetRole = "ADC",
                enemyThreat = "无位移后排靶子危机",
                idealAnswers = { "伊泽瑞尔", "霞", "卡莎" },
                hint = "选取自带无法选中大招或奥术跃迁保命的自保型ADC"
            },
            {
                phase = "COUNTER_PICK",
                phaseName = "后手绝杀康特 (COUNTER PICK)",
                targetRole = "SUP",
                enemyThreat = "进场打断与阵型保护",
                idealAnswers = { "烈娜塔", "风女", "迦娜", "牛头", "布隆" },
                hint = "选取具有及时救难防暴毙、大招狂暴反控或反手击飞的保护型辅助"
            }
        },
        rewardAdvantage = {
            level = 1,
            title = "防突进反打奇策 (Anti-Dive Mastery)",
            bonusWinRate = 12,
            bonusMechanics = 4,
            bonusMacro = 6
        }
    },
    {
        id = "puzzle_poke_siege",
        title = "拆解长手消耗推进流 (Anti-Poke & Siege)",
        scenario = "敌方选出「杰斯」+「韦鲁斯」，构筑起超远距离幽梦穿甲长手炮击阵，我方正面难以靠拢防守防御塔。请进行三手决胜针对！",
        enemyComposition = "远程地毯轰炸流 (Jayce + Varus + Xerath)",
        slots = {
            {
                phase = "BAN_1",
                phaseName = "一阶段封锁 (BAN 1)",
                targetRole = "JUG",
                enemyThreat = "盲僧 / 波比 (防开团反冲核心)",
                idealAnswers = { "波比", "古拉加斯", "盲僧" },
                hint = "封锁能够用坚定风采或大招破坏我方进场强开的敌方保镖"
            },
            {
                phase = "PICK_1",
                phaseName = "强开先手选人 (PICK 1)",
                targetRole = "TOP",
                enemyThreat = "正面无法靠近炮击手",
                idealAnswers = { "石头人", "墨菲特", "凯南", "塞恩" },
                hint = "选择具备极远距离势不可挡开团或群体天雷进场的重装开团手"
            },
            {
                phase = "COUNTER_PICK",
                phaseName = "侧翼刺杀康特 (COUNTER PICK)",
                targetRole = "MID",
                enemyThreat = "超视距脆皮炮台",
                idealAnswers = { "阿卡丽", "劫", "乐芙兰", "塞拉斯" },
                hint = "选出高机动多段位移刺客，侧翼绕后瞬间融化敌方无位移消耗双C"
            }
        },
        rewardAdvantage = {
            level = 2,
            title = "闪电战强开奇谋 (Blitzkrieg Engage)",
            bonusWinRate = 15,
            bonusMechanics = 5,
            bonusMacro = 7
        }
    },
    {
        id = "puzzle_hyper_carry",
        title = "猎杀四保一后期核弹 (Hyper-Carry Lockdown)",
        scenario = "敌方祭出「厄斐琉斯」或「金克丝」搭配「璐璐」的究极四保一后期团战阵容，拖到30分钟将无可匹敌。请布置绝杀封锁与节奏提速压制链！",
        enemyComposition = "四保一后期核弹流 (Lulu + Jinx + Orianna)",
        slots = {
            {
                phase = "BAN_1",
                phaseName = "一阶段封锁 (BAN 1)",
                targetRole = "SUP",
                enemyThreat = "仙灵女巫 (变羊与巨额护盾防斩杀)",
                idealAnswers = { "璐璐", "米利欧", "悠米" },
                hint = "封锁具有强力变羊防突与增伤护盾的软辅保护伞"
            },
            {
                phase = "PICK_1",
                phaseName = "对线期窒息压制 (PICK 1)",
                targetRole = "ADC",
                enemyThreat = "平稳发育到后期的射手",
                idealAnswers = { "德莱文", "卡莉丝塔", "卢锡安" },
                hint = "选出对线期压制力拉满的前期线霸射手，在15分钟内打穿下路一塔"
            },
            {
                phase = "COUNTER_PICK",
                phaseName = "越塔提速发动机 (COUNTER PICK)",
                targetRole = "JUG",
                enemyThreat = "下路塔下安稳补刀吃线",
                idealAnswers = { "蜘蛛", "伊莉丝", "皇子", "嘉文四世" },
                hint = "选出具备飞天换抗越塔或强硬EQ挑飞的越塔型打野，打乱敌方避战发育节奏"
            }
        },
        rewardAdvantage = {
            level = 3,
            title = "速推压制铁血战术 (Fast-Push Lockdown)",
            bonusWinRate = 18,
            bonusMechanics = 6,
            bonusMacro = 8
        }
    }
}

function TacticalBpDrill.getAllPuzzles()
    return TacticalBpDrill.PUZZLES
end

function TacticalBpDrill.solvePuzzle(puzzleId, choices)
    local target = nil
    for _, p in ipairs(TacticalBpDrill.PUZZLES) do
        if p.id == puzzleId then
            target = p
            break
        end
    end
    if not target then
        target = TacticalBpDrill.PUZZLES[1]
    end

    local reward = target.rewardAdvantage
    return true, reward, string.format("🧩【BP 残局破解成功】成功布置反制链！激活战术特权【%s】: 团战胜率 +%d%%, 微操 +%d, 大局观 +%d！",
        reward.title, reward.bonusWinRate, reward.bonusMechanics, reward.bonusMacro)
end

return TacticalBpDrill
