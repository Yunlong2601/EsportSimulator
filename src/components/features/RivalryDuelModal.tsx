import React, { useState } from 'react';
import { 
  Swords, 
  Flame, 
  Zap, 
  Skull, 
  Trophy, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Sparkles, 
  TrendingUp,
  Crosshair,
  Shield,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrackedOpponent, LpMultiplierBonus } from '../../types/game';
import { soundEngine } from '../../utils/audio';

interface RivalryDuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  nemesis: TrackedOpponent | {
    id: string;
    name: string;
    handle: string;
    title: string;
    avatar: string;
    signatureChamp: string;
    bountyLp: number;
  };
  onWinDuel: (bonus: LpMultiplierBonus) => void;
  onLoseDuel: () => void;
}

// 3 High-Stakes Micro-Mechanic Duel Rounds
const DUEL_ROUNDS = [
  {
    roundNum: 1,
    title: '第一回合：河道 1v1 极限换血试探',
    scenario: '宿敌在迅捷蟹刷新前强行卡线逼战！双方同时交出位移技能，对方藏了点燃正准备先手！',
    enemyMove: '宿敌交出闪现突进，致命盲技能呼啸而来！',
    options: [
      {
        label: '【极速走位预判躲避】',
        desc: '不交技能，利用直角走位拉扯躲掉关键技能，反手打满三环被动！',
        isCorrect: true,
        flavor: '神级小走位！几乎以像素级别的缝隙扭开对手盲Q，反手一套打残对手！'
      },
      {
        label: '【无脑正面硬拼对轰】',
        desc: '交完全部技能强行换血，赌自身伤害更高。',
        isCorrect: false,
        flavor: '正中敌方下怀！对方技能带有斩杀伤害，我方血量骤降陷入劣势！'
      }
    ]
  },
  {
    roundNum: 2,
    title: '第二回合：大招破局 · 极限心理博弈',
    scenario: '敌方血量见底，但我方技能在冷却中！宿敌后撤进防御塔草丛，故意露出破绽引诱越塔！',
    enemyMove: '草丛视野全黑，敌方假装回城读条！',
    options: [
      {
        label: '【盲视野卡墙插眼 + 隔墙控杀】',
        desc: '不急于进草，隔墙精准插假眼侦破埋伏，接瞬发控制击杀！',
        isCorrect: true,
        flavor: '教科书级老练意识！敌方正捏着大招准备反打，直接被你的隔墙控打断暴毙！'
      },
      {
        label: '【直接肉身脸探草丛】',
        desc: '急于收割残血人头，直接闪现进草。',
        isCorrect: false,
        flavor: '踩中敌方埋伏圈套！被敌方守株待兔反杀，痛失好局！'
      }
    ]
  },
  {
    roundNum: 3,
    title: '第三回合：天王山决胜 · 胜负手终局斩杀',
    scenario: '双方重整旗鼓，在水晶枢纽前爆发决战！宿敌开启全技能杀气腾腾直扑而来！',
    enemyMove: '敌方开启终极技能，全场万名观众全体起立！',
    options: [
      {
        label: '【秒按金身规避核心爆发 + 闪现绝杀】',
        desc: '中娅沙漏完美规避最致命大招伤害，起身极限秒挂引燃斩杀！',
        isCorrect: true,
        flavor: '天神下凡！金身叮的一声直接让敌方大招全部打空，起身行云流水一套连招带走宿敌！'
      },
      {
        label: '【后撤拉扯避战】',
        desc: '畏惧对手爆发，向己方泉水逃跑。',
        isCorrect: false,
        flavor: '丧失决胜心流气势！被对手狂暴追击斩杀，饮恨当场！'
      }
    ]
  }
];

export const RivalryDuelModal: React.FC<RivalryDuelModalProps> = ({
  isOpen,
  onClose,
  nemesis,
  onWinDuel,
  onLoseDuel
}) => {
  const [currentRoundIdx, setCurrentRoundIdx] = useState<number>(0);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [enemyScore, setEnemyScore] = useState<number>(0);
  const [roundFeedback, setRoundFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [duelEnded, setDuelEnded] = useState<boolean>(false);
  const [isVictor, setIsVictor] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentRound = DUEL_ROUNDS[currentRoundIdx];

  const handleSelectOption = (isCorrect: boolean, flavor: string) => {
    soundEngine.playClick();
    setRoundFeedback({ isCorrect, text: flavor });

    const newPlayerScore = playerScore + (isCorrect ? 1 : 0);
    const newEnemyScore = enemyScore + (isCorrect ? 0 : 1);
    setPlayerScore(newPlayerScore);
    setEnemyScore(newEnemyScore);

    if (isCorrect) {
      soundEngine.playLevelUp();
    } else {
      soundEngine.playDefeat();
    }

    setTimeout(() => {
      setRoundFeedback(null);
      if (currentRoundIdx < DUEL_ROUNDS.length - 1) {
        setCurrentRoundIdx(prev => prev + 1);
      } else {
        // Duel complete
        setDuelEnded(true);
        const won = newPlayerScore >= 2;
        setIsVictor(won);

        if (won) {
          soundEngine.playVictory();
          const bonus: LpMultiplierBonus = {
            multiplier: 2.5,
            matchesRemaining: 3,
            sourceNemesis: nemesis.name,
            title: `宿敌对决大胜 · 2.5倍急速上分 (${nemesis.name})`
          };
          onWinDuel(bonus);
        } else {
          soundEngine.playDefeat();
          onLoseDuel();
        }
      }
    }, 1400);
  };

  const handleReset = () => {
    soundEngine.playClick();
    setCurrentRoundIdx(0);
    setPlayerScore(0);
    setEnemyScore(0);
    setRoundFeedback(null);
    setDuelEnded(false);
    setIsVictor(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn select-none overflow-y-auto">
      <div className="relative max-w-lg w-full bg-[#0a0e17] border-2 border-red-500/80 rounded-2xl shadow-[0_0_80px_rgba(239,68,68,0.35)] my-auto overflow-hidden text-slate-100 flex flex-col">
        
        {/* Top High-Tension Alert Header */}
        <div className="p-3.5 bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-b border-red-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400 animate-pulse">
              <Swords className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-tech font-black text-red-400 text-sm sm:text-base tracking-wide flex items-center gap-1.5">
                  <span>⚔️ 宿命死敌对决 · RIVALRY DUEL!</span>
                </h3>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-500/30 text-red-200 border border-red-500/50 font-bold uppercase font-code animate-ping">
                  NEMESIS ALERT
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans">
                遭遇命中注定的宿敌！胜者将狂揽未来 3 场赛事的巨额 LP 翻倍倍率！
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Rivalry Face-Off HUD Banner */}
        <div className="p-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          {/* Player Side */}
          <div className="flex items-center gap-2">
            <span className="text-2xl p-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40">
              👑
            </span>
            <div>
              <div className="text-xs font-tech font-black text-cyan-300">你 (YOU)</div>
              <div className="text-[10px] text-slate-400 font-code">得分: {playerScore} 胜</div>
            </div>
          </div>

          {/* VS Center Badge */}
          <div className="text-center px-3">
            <span className="text-sm font-black font-tech text-red-500 animate-pulse tracking-widest block">
              VS
            </span>
            <span className="text-[9px] font-code text-amber-400 font-bold">
              第 {currentRoundIdx + 1} / 3 局
            </span>
          </div>

          {/* Nemesis Side */}
          <div className="flex items-center gap-2 text-right">
            <div>
              <div className="text-xs font-tech font-black text-red-400">
                {nemesis.name} ({nemesis.handle})
              </div>
              <div className="text-[10px] text-slate-400 font-code">
                绝活: {nemesis.signatureChamp} · 得分: {enemyScore} 胜
              </div>
            </div>
            <span className="text-2xl p-1.5 rounded-xl bg-red-950/80 border border-red-500/40">
              {nemesis.avatar || '🥷'}
            </span>
          </div>
        </div>

        {/* Main Duel Content */}
        <div className="p-4 space-y-3.5 flex-1 overflow-y-auto">
          
          {!duelEnded ? (
            /* Active Duel Round */
            <div className="space-y-3">
              {/* Round Title & Scenario Card */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-red-500/40 space-y-2 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-tech font-bold text-red-300 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-red-400" />
                    <span>{currentRound.title}</span>
                  </span>
                  <span className="text-[10px] font-code px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-800">
                    死斗倒计时
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {currentRound.scenario}
                </p>

                <div className="p-2 rounded-lg bg-black/60 border border-slate-800 text-[11px] font-tech text-amber-300">
                  ⚠️ <strong>宿敌破招攻势：</strong>{currentRound.enemyMove}
                </div>
              </div>

              {/* Feedback Alert Toast */}
              {roundFeedback && (
                <div className={`p-3 rounded-xl border text-xs font-tech animate-fadeIn ${
                  roundFeedback.isCorrect 
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' 
                    : 'bg-red-950/80 border-red-500/50 text-red-300'
                }`}>
                  <div className="font-bold flex items-center gap-1.5 mb-0.5">
                    {roundFeedback.isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Skull className="w-4 h-4 text-red-400" />}
                    <span>{roundFeedback.isCorrect ? '【见招拆招 · 绝杀破防！】' : '【破防失手 · 遭宿敌反杀！】'}</span>
                  </div>
                  <p className="font-sans leading-snug">{roundFeedback.text}</p>
                </div>
              )}

              {/* Decision Options */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-tech font-bold text-slate-400">
                  下达本回合应对微操决断：
                </span>

                {currentRound.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(opt.isCorrect, opt.flavor)}
                    disabled={roundFeedback !== null}
                    className={`w-full p-3 rounded-xl border text-left cursor-pointer transition flex flex-col gap-1 ${
                      roundFeedback !== null
                        ? 'opacity-50 cursor-not-allowed bg-slate-900 border-slate-800'
                        : 'bg-slate-900/90 border-slate-700 hover:border-red-400 hover:bg-slate-850 active:scale-98 shadow-md'
                    }`}
                  >
                    <div className="text-xs font-tech font-extrabold text-white flex items-center justify-between">
                      <span>{opt.label}</span>
                      <span className="text-[10px] text-cyan-400 font-code">微操反打 ➔</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                      {opt.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Duel Concluded Result Screen */
            <div className={`p-4 rounded-xl border text-center space-y-3 animate-fadeIn ${
              isVictor
                ? 'bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border-amber-500/80 shadow-[0_0_40px_rgba(245,158,11,0.25)]'
                : 'bg-gradient-to-b from-red-950/40 via-slate-900 to-slate-950 border-red-500/80 shadow-[0_0_40px_rgba(239,68,68,0.25)]'
            }`}>
              <div className="inline-flex p-3 rounded-2xl bg-black/60 border border-slate-700 text-3xl">
                {isVictor ? '🏆' : '💀'}
              </div>

              <h4 className="text-lg font-black font-tech text-white">
                {isVictor ? '宿命死斗大获全胜 · 狂屠宿敌！' : '宿命对决饮恨惜败 · 仇怨加深！'}
              </h4>

              <p className="text-xs text-slate-300 font-sans leading-relaxed max-w-sm mx-auto">
                {isVictor
                  ? `你以 ${playerScore} 比 ${enemyScore} 的悬殊战绩彻底粉碎了 ${nemesis.name} 的狂傲气焰！狂暴自信心爆棚，未来 3 场比赛的 LP 获取倍率将直接飙升 2.5 倍！`
                  : `很遗憾在第三回合失手，${nemesis.name} 在公屏疯狂扣问号嘲讽。不要气馁，秣马厉兵下一次将他彻底击碎！`}
              </p>

              {/* Bonus Multiplier Pill */}
              {isVictor && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-tech space-y-1">
                  <div className="flex items-center justify-center gap-1.5 font-bold">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>已激活特权：2.5x LP 收益倍率加成 (生效中)</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    在接下来 3 场排位/赛区正式对局中，获胜结算将自动获得 2.5 倍天梯战力暴涨！
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-400 hover:to-amber-400 text-slate-950 font-tech font-black text-xs cursor-pointer shadow-lg transition"
                >
                  确认并关闭
                </button>
                <button
                  onClick={handleReset}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-tech font-bold text-xs cursor-pointer transition flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>重新演练</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
