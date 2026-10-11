import React, { useState, useEffect } from 'react';
import { X, Play, FastForward, Swords, Shield, Zap, Flame, Trophy, Award, Target, Sparkles, ChevronRight, Activity, ArrowUpRight } from 'lucide-react';
import { PlayerStats, MatchSimulationLog, Champion, RankTier, PostMatchMvpRecord } from '../../types/game';
import { PLAYER_TRAITS_DATABASE, TacticalBranchDecision } from '../../data/matchSimulationNarratives';
import { CHAMPIONS_DATABASE } from '../../data/champions';
import { soundEngine } from '../../utils/audio';
import { LiveMatchDanmaku } from '../common/LiveMatchDanmaku';
import { generatePostMatchMvp, CONFIDENCE_TIERS_CONFIG } from '../../data/communityRelationsData';

interface TextMatchSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  onMatchComplete: (result: {
    isWin: boolean;
    lpDelta: number;
    mechanicsDelta: number;
    mentalDelta: number;
    fameDelta: number;
    moneyDelta: number;
    logsSummary: string;
    kda: string;
    champName: string;
    isPromoGame?: boolean;
  }) => void;
  isPromoGame?: boolean;
  targetPromoTier?: RankTier;
}

export const TextMatchSimulationModal: React.FC<TextMatchSimulationModalProps> = ({
  isOpen,
  onClose,
  stats,
  onMatchComplete,
  isPromoGame = false,
  targetPromoTier
}) => {
  if (!isOpen) return null;

  // Selected champion for this ranked match
  const [selectedChamp, setSelectedChamp] = useState<Champion>(() => {
    return CHAMPIONS_DATABASE.find(c => c.name === '阿狸') || CHAMPIONS_DATABASE[0];
  });

  // Simulation steps (Minutes: 3, 8, 14, 22, 28)
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [isFastForward, setIsFastForward] = useState<boolean>(false);
  const [logs, setLogs] = useState<MatchSimulationLog[]>([]);
  const [tacticalPrompt, setTacticalPrompt] = useState<TacticalBranchDecision | null>(null);
  const [tacticalChoiceBonus, setTacticalChoiceBonus] = useState<number>(0);
  const [matchDone, setMatchDone] = useState<boolean>(false);
  const [finalResult, setFinalResult] = useState<{
    isWin: boolean;
    kda: string;
    headline: string;
    mvpRecord?: PostMatchMvpRecord;
  } | null>(null);

  // KDA tracking
  const [kills, setKills] = useState<number>(0);
  const [deaths, setDeaths] = useState<number>(0);
  const [assists, setAssists] = useState<number>(0);

  // Active traits list
  const activeTraits = (stats.traits || []).map(id => PLAYER_TRAITS_DATABASE.find(t => t.id === id)).filter((t): t is NonNullable<typeof t> => !!t);

  // Scripted match milestones
  const MATCH_SCRIPT: {
    minute: number;
    phase: string;
    type: MatchSimulationLog['type'];
    getNarrative: (champ: string, won: boolean) => string;
    killDelta: [number, number, number]; // [k, d, a]
  }[] = [
    {
      minute: 3,
      phase: '对线期 · 2级抢二血拼',
      type: 'kill',
      getNarrative: (champ, won) => won
        ? `【第一滴血 FIRST BLOOD】你操刀 [${champ}] 凭借细腻卡兵线抢先升2级！果断闪现挂点燃接精准技能命中，越塔单杀敌方中单！全场解说：“这手速和血量计算太逆天了！”`
        : `【对线波折】敌方打野二级出人意料红开直抓中路！你交出闪现后被红BUFF减速黏住，交出第一滴血。但你迅速通过TP稳住经验兵线。`,
      killDelta: [1, 0, 0]
    },
    {
      minute: 9,
      phase: '游走控图 · 峡谷先锋与小龙争夺',
      type: 'objective',
      getNarrative: (champ, won) => won
        ? `【战术联动】你推完中路兵线后敏锐捕捉敌方下路破绽，配合野辅打出四包二完美越塔！击杀敌方双人组并顺势收下首条炼金科技巨龙！`
        : `【河道遭遇】野区河道争夺迅捷蟹爆发 3v3 小规模摩擦，对方支援更快，我方打野遗憾阵亡，被迫退守塔下。`,
      killDelta: [1, 0, 1]
    },
    {
      minute: 16,
      phase: '中期转线 · 一塔防线攻防',
      type: 'teamfight',
      getNarrative: (champ, won) => won
        ? `【高光团战】中路二塔爆发激烈团战！你 [${champ}] 在侧翼卡视野进场，关键大招控住敌方走位失误的ADC，配合队友瞬秒核心后连斩两人！`
        : `【拉扯防守】敌方抱团强推中路一塔，你在塔下极限清兵防守，化解了对手的先锋撞击攻势。`,
      killDelta: [2, 0, 2]
    },
    {
      minute: 23,
      phase: '纳什男爵生死抉择 · 决胜时刻',
      type: 'clutch',
      getNarrative: (champ, won) => won
        ? `【男爵决断】大龙坑处双方十人集结！你沉着指挥果断反打，金身骗出对手核心大招，队友顺势团灭对手收下大龙BUFF！`
        : `【惨烈对峙】大龙坑视野被敌方压制，双方血量犬牙交错，胜负悬于一线！`,
      killDelta: [1, 1, 1]
    },
    {
      minute: 28,
      phase: '高地决胜 · 水晶枢纽终局',
      type: 'caster',
      getNarrative: (champ, won) => won
        ? `【全场胜利 VICTORY】携带着大龙先锋 Buff 势如破竹摧毁三路高地水晶！伴随着五连绝世的欢呼，敌方水晶枢纽爆裂！`
        : `【遗憾落败 DEFEAT】高地团战敌方开出完美团控，尽管你拼尽全力换掉敌方双C，但我方基地水晶依然告破。`,
      killDelta: [2, 0, 1]
    }
  ];

  // Simulation step timer
  useEffect(() => {
    if (!isSimulating || matchDone || tacticalPrompt) return;

    const delay = isFastForward ? 400 : 1600;

    const timer = setTimeout(() => {
      if (currentStepIndex === 3 && !tacticalPrompt && tacticalChoiceBonus === 0) {
        // Trigger tactical decision at Baron
        soundEngine.playBaronSteal();
        setTacticalPrompt({
          minute: 23,
          prompt: '纳什男爵血量仅剩 3,800 HP！敌方五人全技能压向龙坑！',
          context: '作为团队核心指挥，你的决定将直接锁定本局 80% 的团战走向！',
          options: [
            {
              label: '【反打集火】利用视野盲区秒杀敌方核心C位',
              sub: '依赖极高微操爆发，成功率受线霸/残局特质加成',
              risk: 'Medium',
              statBonusPct: 20,
              favorsTrait: 'clutch_cleaner'
            },
            {
              label: '【拼惩戒抢龙】全队停手掩护，打野搏命抢龙',
              sub: '50/50 搏命秒龙，极高风险但成功即获胜',
              risk: 'High',
              statBonusPct: 10
            },
            {
              label: '【拉扯回防】主动放龙卡住中路高地狭窄隘口',
              sub: '大心脏指挥战术，将比赛拖入大后期防守反击',
              risk: 'Low',
              statBonusPct: 15,
              favorsTrait: 'ice_veins'
            }
          ]
        });
        return;
      }

      if (currentStepIndex < MATCH_SCRIPT.length) {
        const step = MATCH_SCRIPT[currentStepIndex];
        // Calculate step outcome based on mechanics & mental
        const isStepWin = Math.random() * 100 < (stats.mechanics * 0.5 + stats.mental * 0.4 + 20 + tacticalChoiceBonus);

        const newLog: MatchSimulationLog = {
          id: `step-${currentStepIndex}-${Date.now()}`,
          minute: step.minute,
          text: step.getNarrative(selectedChamp.name, isStepWin),
          type: step.type
        };

        setLogs(prev => [...prev, newLog]);
        if (isStepWin) {
          setKills(k => k + step.killDelta[0]);
          setAssists(a => a + step.killDelta[2]);
        } else {
          setDeaths(d => d + 1);
        }

        soundEngine.playClick();
        setCurrentStepIndex(prev => prev + 1);
      } else {
        // Complete the match
        finishMatch();
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [currentStepIndex, isSimulating, isFastForward, matchDone, tacticalPrompt]);

  const handleResolveTacticalChoice = (choice: TacticalBranchDecision['options'][0]) => {
    soundEngine.playClick();
    const hasTrait = choice.favorsTrait && (stats.traits || []).includes(choice.favorsTrait);
    const bonus = choice.statBonusPct + (hasTrait ? 15 : 0);
    setTacticalChoiceBonus(bonus);

    const logText = `🎯 队长战术决断：“${choice.label}”！${hasTrait ? '【触发选手专属特质共鸣加成！】' : ''}`;
    setLogs(prev => [
      ...prev,
      {
        id: `tactical-${Date.now()}`,
        minute: 23,
        text: logText,
        type: 'clutch'
      }
    ]);

    setTacticalPrompt(null);
    setCurrentStepIndex(4); // proceed to final late game step
  };

  const finishMatch = () => {
    setIsSimulating(false);
    setMatchDone(true);

    const currentFocus = stats.focus ?? 100;
    const focusModifier = currentFocus >= 70 ? 8 : currentFocus < 35 ? -18 : 0;
    const baseWinChance = (stats.mechanics * 0.45 + stats.mental * 0.35 + stats.winStreak * 4 + tacticalChoiceBonus + focusModifier);
    const isWin = Math.random() * 100 < Math.min(92, Math.max(15, baseWinChance));

    const finalK = isWin ? kills + 3 : kills;
    const finalD = isWin ? deaths : deaths + 2;
    const finalA = assists + 4;
    const kdaStr = `${finalK}/${finalD}/${finalA}`;

    const mvpRecord = generatePostMatchMvp(
      'SOLO_QUEUE',
      selectedChamp.name,
      isWin,
      stats.mechanics,
      stats.mental
    );

    setFinalResult({
      isWin,
      kda: kdaStr,
      headline: mvpRecord.headline,
      mvpRecord
    });

    if (isWin) {
      soundEngine.playVictory();
    } else {
      soundEngine.playDefeat();
    }
  };

  const handleClaimAndExit = () => {
    if (!finalResult) return;
    const lpDelta = finalResult.isWin ? (22 + Math.min(10, stats.winStreak * 2)) : -16;
    const mechanicsDelta = finalResult.isWin ? 2 : 1;
    const mentalDelta = finalResult.isWin ? 3 : -4;
    const fameDelta = finalResult.isWin ? 4 : 1;
    const moneyDelta = finalResult.isWin ? 35 : 10;

    onMatchComplete({
      isWin: finalResult.isWin,
      lpDelta,
      mechanicsDelta,
      mentalDelta,
      fameDelta,
      moneyDelta,
      logsSummary: finalResult.headline,
      kda: finalResult.kda,
      champName: selectedChamp.name,
      isPromoGame
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-cyan-500/50 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.25)] flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header HUD */}
        <div className="p-3.5 bg-slate-950/90 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg border ${isPromoGame ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'}`}>
              <Swords className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-tech font-bold uppercase px-1.5 py-0.2 rounded ${isPromoGame ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'}`}>
                  {isPromoGame ? `👑 生死晋级赛 (${targetPromoTier || 'Master'})` : '天梯单双排 · 沉浸实况推演'}
                </span>
                <span className="text-[10px] text-slate-400 font-code">
                  峡谷之巅 · 房间 #8492
                </span>
              </div>
              <h3 className="text-sm font-tech font-extrabold text-white">
                操作英雄: <span className="text-cyan-300">{selectedChamp.name}</span> ({selectedChamp.signatureMove})
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!matchDone && (
              <button
                onClick={() => setIsFastForward(!isFastForward)}
                className={`px-2 py-1 rounded-lg text-[10px] font-tech font-bold border flex items-center gap-1 cursor-pointer transition ${
                  isFastForward
                    ? 'bg-amber-500/25 border-amber-400 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <FastForward className="w-3 h-3" />
                <span>{isFastForward ? '加速中 3x' : '快进战报'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              disabled={isSimulating && !matchDone}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition disabled:opacity-30 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Stat Banner */}
        <div className="px-4 py-2 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between text-xs font-code">
          <div className="flex items-center gap-3">
            <span className="text-slate-400">实时战绩:</span>
            <span className="text-emerald-400 font-bold">{kills} 击杀</span>
            <span className="text-rose-400 font-bold">{deaths} 阵亡</span>
            <span className="text-cyan-400 font-bold">{assists} 助攻</span>
          </div>
          <div className="flex items-center gap-1.5 font-code">
            <span className={`text-[10px] font-bold ${(stats.focus ?? 100) < 35 ? 'text-rose-400 animate-pulse' : 'text-cyan-300'}`}>
              专注 {stats.focus ?? 100}%
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-[10px] text-slate-400">微操 {stats.mechanics}</span>
            <span className="text-slate-600">|</span>
            <span className="text-[10px] text-slate-400">心态 {stats.mental}</span>
          </div>
        </div>

        {/* Active Player Traits Flair */}
        {activeTraits.length > 0 && (
          <div className="px-4 py-1.5 bg-slate-900/60 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[10px]">
            <span className="text-slate-400 font-tech uppercase text-[9px] shrink-0">激活特质:</span>
            {activeTraits.map(t => (
              <span
                key={t.id}
                className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-amber-500/30 font-tech shrink-0 flex items-center gap-1"
                title={t.bonusDesc}
              >
                <span>{t.icon}</span>
                <span>{t.name}</span>
              </span>
            ))}
          </div>
        )}

        {/* Live Match Danmaku Floating Stream (Live Streaming Chat Simulation) */}
        {!matchDone && (
          <LiveMatchDanmaku
            active={!matchDone}
            showInput={true}
            maxLanes={3}
            className="h-20 bg-slate-950/70 border-b border-cyan-500/30 shrink-0"
            extraStrings={[
              '666',
              'This play is insane!',
              'Report Top Diff',
              '卧槽！这走位也能扭开的？？？',
              '这就是通天代！一人抬着四个走！',
              '全体起立！！！',
              '777777777',
              '心疼对面中单，直接被戒网瘾'
            ]}
          />
        )}

        {/* Play-by-Play Live Match Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0a0e17]/80 font-sans">
          {logs.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center animate-pulse">
                <Activity className="w-6 h-6 text-cyan-400" />
              </div>
              <p className="text-xs text-slate-400 font-tech">正在加载 Summoner's Rift 对线数据，全军出击倒计时...</p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className={`p-3 rounded-xl border text-xs leading-relaxed animate-fadeIn ${
                  log.type === 'clutch'
                    ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
                    : log.type === 'kill'
                    ? 'bg-rose-950/30 border-rose-500/40 text-slate-100'
                    : log.type === 'objective'
                    ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-100'
                    : 'bg-slate-900/90 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1 text-[10px] font-code">
                  <span className="text-cyan-400 font-bold">⏱️ 第 {log.minute} 分钟实况</span>
                  <span className="text-slate-400 uppercase font-tech">{log.type}</span>
                </div>
                <p className="leading-snug">{log.text}</p>
              </div>
            ))
          )}

          {/* Tactical In-game Branch Decision Card */}
          {tacticalPrompt && (
            <div className="p-4 rounded-xl bg-slate-900 border-2 border-amber-500 shadow-2xl space-y-3 animate-pulse">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-tech font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  ⚠️ 关键局势决策分歧点
                </span>
                <span className="text-[10px] text-slate-400 font-tech">第 {tacticalPrompt.minute} 分钟</span>
              </div>
              <h4 className="font-tech font-bold text-white text-sm">
                {tacticalPrompt.prompt}
              </h4>
              <p className="text-xs text-slate-300 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                {tacticalPrompt.context}
              </p>
              <div className="space-y-2 pt-1">
                {tacticalPrompt.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleResolveTacticalChoice(opt)}
                    className="w-full text-left p-3 rounded-xl border border-slate-700 hover:border-amber-400 bg-slate-800 hover:bg-slate-750 transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-tech font-bold text-white text-xs">
                        {opt.label}
                      </span>
                      <span className="text-[9px] font-code text-amber-300 font-bold">
                        胜率加成 +{opt.statBonusPct}%
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{opt.sub}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Post-Match Headline & MVP Honors Box */}
          {matchDone && finalResult && (
            <div className={`p-4 rounded-xl border-2 space-y-3 animate-fadeIn ${
              finalResult.isWin
                ? 'bg-gradient-to-br from-emerald-950/60 to-slate-900 border-emerald-500/80 shadow-[0_0_25px_rgba(16,185,129,0.2)]'
                : 'bg-gradient-to-br from-rose-950/60 to-slate-900 border-rose-500/80 shadow-[0_0_25px_rgba(244,63,94,0.2)]'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-tech font-extrabold uppercase ${
                  finalResult.isWin ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                }`}>
                  {finalResult.isWin ? 'VICTORY 获胜' : 'DEFEAT 战败'}
                </span>
                <span className="text-xs font-code font-bold text-slate-300">
                  最终KDA: {finalResult.kda}
                </span>
              </div>

              {/* MVP Ribbon & Headline */}
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-amber-500/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-tech font-bold text-amber-300">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>{finalResult.mvpRecord?.isMvp ? '【赛后 MVP 斩获】' : (finalResult.mvpRecord?.isSvp ? '【赛后 SVP 战神】' : '【赛后战报评定】')}</span>
                  </div>
                  <span className="text-[11px] font-code font-bold text-amber-400 px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-500/40">
                    ★ {finalResult.mvpRecord?.score?.toFixed(1) || '9.8'} 分 ★
                  </span>
                </div>
                <div className="text-xs font-tech font-bold text-white">
                  {finalResult.headline}
                </div>
                {finalResult.mvpRecord?.casterQuote && (
                  <p className="text-[11px] text-cyan-200 font-sans italic bg-cyan-950/30 p-2 rounded border border-cyan-500/30">
                    🎙️ {finalResult.mvpRecord.casterQuote}
                  </p>
                )}
                {finalResult.mvpRecord?.danmaku && (
                  <p className="text-[10px] text-amber-200/90 font-code bg-amber-950/20 p-1.5 rounded">
                    💬 {finalResult.mvpRecord.danmaku}
                  </p>
                )}
              </div>

              {/* Confidence Trait Buff Notification */}
              {finalResult.isWin && (
                <div className="p-2.5 rounded-lg bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-transparent border border-amber-500/30 flex items-center justify-between text-xs font-tech">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                    <div>
                      <span className="font-bold text-white">选手特质「自信心 (Confidence)」升阶！</span>
                      <p className="text-[10px] text-amber-300 font-code">
                        微操 +{CONFIDENCE_TIERS_CONFIG[Math.min(3, (stats.confidence?.level || 0) + 1)].bonusMech} | 心态 +{CONFIDENCE_TIERS_CONFIG[Math.min(3, (stats.confidence?.level || 0) + 1)].bonusMental} | 胜率 +{CONFIDENCE_TIERS_CONFIG[Math.min(3, (stats.confidence?.level || 0) + 1)].bonusWinRate}% (生效3场)
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-400">
                    {CONFIDENCE_TIERS_CONFIG[Math.min(3, (stats.confidence?.level || 0) + 1)].badge} Lv.{Math.min(3, (stats.confidence?.level || 0) + 1)}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 pt-1 text-center text-[11px] font-code bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <div>
                  <div className="text-slate-400 text-[9px]">天梯积分变动</div>
                  <div className={`font-bold ${finalResult.isWin ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {finalResult.isWin ? `+${22 + Math.min(10, stats.winStreak * 2)} LP` : '-16 LP'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-[9px]">微操与心态</div>
                  <div className="text-cyan-300 font-bold">
                    {finalResult.isWin ? '+2 / +3' : '+1 / -4'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-[9px]">对局打赏/金币</div>
                  <div className="text-amber-300 font-bold">
                    +${finalResult.isWin ? 35 : 10}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom CTA Footer */}
        <div className="p-3 bg-slate-950 border-t border-cyan-500/20 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 font-tech">
            {isSimulating ? (
              <span className="flex items-center gap-1.5 text-cyan-400 animate-pulse">
                <Activity className="w-3.5 h-3.5" />
                正在推演对局对抗细节...
              </span>
            ) : (
              <span className="text-emerald-400 font-bold">对局复盘推演完毕</span>
            )}
          </div>

          <div>
            {matchDone ? (
              <button
                onClick={handleClaimAndExit}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-tech font-extrabold text-xs shadow-lg shadow-cyan-500/30 flex items-center gap-1.5 cursor-pointer"
              >
                <span>结算并确认战报</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={finishMatch}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-tech font-bold cursor-pointer"
              >
                直接跳过推演
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
