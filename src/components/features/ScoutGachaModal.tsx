import React, { useState } from 'react';
import { Sparkles, X, Zap, Shield, Flame, Award, ChevronRight, RefreshCw, Trophy, Lock, Building2, UserPlus, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../../utils/audio';
import { ProPlayer } from '../../types/game';

interface PulledCard {
  id?: string;
  tier: 'SSS' | 'SSR' | 'SR' | 'R';
  name: string;
  role: string;
  ovr: number;
  apm: number;
  highlight?: boolean;
}

interface ScoutGachaModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerMoney: number;
  isDynastyUnlocked: boolean;
  onAddLog?: (msg: string, type: 'win' | 'loss' | 'gear' | 'event') => void;
  onSignPlayerToRoster?: (player: ProPlayer) => void;
}

export const ScoutGachaModal: React.FC<ScoutGachaModalProps> = ({
  isOpen,
  onClose,
  playerMoney,
  isDynastyUnlocked,
  onAddLog,
  onSignPlayerToRoster
}) => {
  const [pityCount, setPityCount] = useState<number>(3);
  const [pullResults, setPullResults] = useState<PulledCard[]>([]);
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [showResultsOverlay, setShowResultsOverlay] = useState<boolean>(false);
  const [signedPlayerNames, setSignedPlayerNames] = useState<Record<string, boolean>>({});

  // Featured SSS player
  const featured = {
    id: "GENESIS-01",
    name: "VORTEX",
    title: "神级中单 // 天空领主",
    role: "MID",
    ovr: 99,
    tier: "SSS",
    apm: 480,
    stats: { micro: 99, teamfight: 98, macro: 96, mental: 94 },
    passives: "【神之领域】关键龙坑团战输出提升 35%，逆风翻盘率 +28%",
    signatures: ["阿兹尔 (Azir)", "妖姬 (LeBlanc)", "塞拉斯 (Sylas)"]
  };

  const handlePull = (times: 1 | 10) => {
    if (!isDynastyUnlocked) return;
    soundEngine.playClick();
    setIsPulling(true);

    setTimeout(() => {
      const results: PulledCard[] = [];
      let nextPity = pityCount;

      for (let i = 0; i < times; i++) {
        const roll = Math.random();
        if (roll <= 0.025 || nextPity <= 1) {
          results.push({
            id: `vortex_${Date.now()}_${i}`,
            tier: 'SSS',
            name: 'VORTEX (神级中单)',
            role: 'MID',
            ovr: 99,
            apm: 480,
            highlight: true
          });
          nextPity = 10;
        } else if (roll <= 0.12) {
          results.push({
            id: `hyper_${Date.now()}_${i}`,
            tier: 'SSR',
            name: 'Hyper (绝活ADC)',
            role: 'ADC',
            ovr: 95,
            apm: 440,
            highlight: true
          });
          nextPity = Math.max(0, nextPity - 1);
        } else if (roll <= 0.355) {
          results.push({
            id: `zephyr_${Date.now()}_${i}`,
            tier: 'SR',
            name: 'Zephyr (破晓打野)',
            role: 'JNG',
            ovr: 88,
            apm: 390
          });
          nextPity = Math.max(0, nextPity - 1);
        } else {
          results.push({
            id: `rookie_${Date.now()}_${i}`,
            tier: 'R',
            name: 'Rookie (二队青训练习生)',
            role: 'MID',
            ovr: 78,
            apm: 320
          });
          nextPity = Math.max(0, nextPity - 1);
        }
      }

      setPityCount(nextPity);
      setPullResults(results);
      setIsPulling(false);
      setShowResultsOverlay(true);
      soundEngine.playVictory();

      if (onAddLog) {
        onAddLog(`🌟 极光星探招募: 获得了 ${results.map(r => r.name).slice(0, 2).join(', ')} 等 ${times} 名选手！`, 'gear');
      }
    }, 500);
  };

  const handleSignCard = (card: PulledCard) => {
    soundEngine.playLevelUp();
    setSignedPlayerNames(prev => ({ ...prev, [card.name]: true }));

    if (onSignPlayerToRoster) {
      const roleMap: Record<string, 'TOP' | 'JUG' | 'MID' | 'ADC' | 'SUP'> = {
        TOP: 'TOP',
        JNG: 'JUG',
        JUG: 'JUG',
        MID: 'MID',
        ADC: 'ADC',
        BOT: 'ADC',
        SUP: 'SUP'
      };
      const assignedRole = roleMap[card.role] || 'MID';

      onSignPlayerToRoster({
        id: card.id || `scout_${Date.now()}`,
        name: card.name.split(' ')[0],
        role: assignedRole,
        country: '中国',
        age: 18 + Math.floor(Math.random() * 3),
        mechanics: card.ovr,
        macro: Math.floor(card.ovr * 0.95),
        morale: 100,
        salary: card.tier === 'SSS' ? 18000 : card.tier === 'SSR' ? 12000 : 7000,
        marketValue: card.tier === 'SSS' ? 150000 : card.tier === 'SSR' ? 90000 : 40000,
        avatar: card.tier === 'SSS' ? '👑' : card.tier === 'SSR' ? '⚡' : '🎮'
      });
    }

    if (onAddLog) {
      onAddLog(`✍️ 签约生效！[${card.tier}] ${card.name} 已正式入驻俱乐部大名单！`, 'win');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-[#0a0e17] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.2)] overflow-hidden text-slate-100">
        
        {/* Top Header */}
        <div className="p-3.5 border-b border-cyan-500/20 bg-[#0f131c] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDynastyUnlocked ? 'bg-cyan-500/20 border border-cyan-400/50 text-[#00f0ff]' : 'bg-slate-800 border border-slate-700 text-amber-400'}`}>
              {isDynastyUnlocked ? <Sparkles className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black font-tech text-[#00f0ff]">全球星探 · SSS 神级选手招募</h3>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${isDynastyUnlocked ? 'bg-amber-500/20 text-[#ffd700] border-amber-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'}`}>
                  {isDynastyUnlocked ? 'S14 极光限定池' : '传奇豪门独占解锁 🔒'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                {isDynastyUnlocked ? (
                  <>距离保底必得 SSS 选手仅剩: <span className="text-amber-400 font-bold font-code">{pityCount} 次</span></>
                ) : (
                  <span className="text-amber-300">需晋升至第三阶段【传奇豪门】方可解锁招募权限</span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* LOCKED STATE VIEW (When accessed before reaching Phase 3 Dynasty) */}
        {!isDynastyUnlocked ? (
          <div className="p-6 space-y-4 text-center my-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <Building2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-lg font-black font-tech text-white">
                【权限锁定】俱乐部董事长专属职权
              </h4>
              <p className="text-xs text-slate-300 max-w-sm mx-auto mt-1 leading-relaxed">
                全球星探 SSS 招募池直通各大赛区青训与顶级自由人市场，仅向 <span className="text-amber-400 font-bold">第三阶段 · 传奇豪门</span> 俱乐部总经理开放签约！
              </p>
            </div>

            {/* Unlock Roadmap */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-left space-y-2.5 text-xs font-sans">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-code text-[11px] shrink-0 font-bold">1</span>
                <div>
                  <div className="font-tech font-bold text-white">第一阶段 · 网吧少年 (进行中)</div>
                  <div className="text-[10px] text-slate-400">在国服峡谷单双排中登顶 最强王者 1,000 LP，签署职业战队合约。</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-code text-[11px] shrink-0 font-bold">2</span>
                <div>
                  <div className="font-tech font-bold text-white">第二阶段 · 职业赛场</div>
                  <div className="text-[10px] text-slate-400">作为队长指挥BP夺取赛区总冠军，累积 $1,000,000 战队收购金。</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-code text-[11px] shrink-0 font-bold">3</span>
                <div>
                  <div className="font-tech font-bold text-amber-300">第三阶段 · 传奇豪门 (解锁星探招募)</div>
                  <div className="text-[10px] text-slate-400">收购豪门俱乐部开创电竞王朝，解锁极光限定池直接签约 SSS 神将！</div>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-tech font-bold text-xs uppercase cursor-pointer border border-slate-700 transition"
            >
              收到 · 返回天梯生涯冲榜
            </button>
          </div>
        ) : (
          /* UNLOCKED VIEW: Full Featured Gacha Terminal */
          <>
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
              {/* Featured Player Hero Banner */}
              <div className="relative p-4 rounded-xl bg-gradient-to-b from-[#0f131c] to-[#0a0e17] border border-cyan-500/40 shadow-[0_0_25px_rgba(0,240,255,0.15)] overflow-hidden">
                <div className="absolute -right-8 -top-8 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -left-8 -bottom-8 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-gradient-to-r from-amber-500 to-amber-700 text-slate-950 text-xs font-black font-tech tracking-wider shadow">
                        {featured.tier} 传说
                      </span>
                      <span className="text-[11px] font-bold text-cyan-400 font-mono">
                        {featured.role} 核心位
                      </span>
                    </div>
                    <h2 className="text-xl font-black font-tech text-white tracking-wide mt-1">
                      {featured.name}
                    </h2>
                    <p className="text-xs text-slate-400 font-sans">{featured.title}</p>
                  </div>

                  {/* OVR Badge */}
                  <div className="text-center p-2 rounded-xl bg-cyan-500/10 border border-cyan-400/40 shadow-inner">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase">总评 OVR</span>
                    <span className="text-2xl font-black text-[#00f0ff] font-tech leading-none">
                      {featured.ovr}
                    </span>
                    <span className="text-[9px] text-amber-400 font-mono block mt-0.5">APM {featured.apm}</span>
                  </div>
                </div>

                {/* 4-Stat Grid */}
                <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-800/80">
                  <div className="p-2 rounded-lg bg-[#0a0e17] border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">微操极限</span>
                    <span className="text-sm font-bold text-cyan-300 font-code">{featured.stats.micro}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0a0e17] border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">团战输出</span>
                    <span className="text-sm font-bold text-amber-300 font-code">{featured.stats.teamfight}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0a0e17] border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">大局视野</span>
                    <span className="text-sm font-bold text-indigo-300 font-code">{featured.stats.macro}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0a0e17] border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">抗压抗崩</span>
                    <span className="text-sm font-bold text-emerald-300 font-code">{featured.stats.mental}</span>
                  </div>
                </div>

                {/* Signature Champions */}
                <div className="mt-3">
                  <span className="text-[11px] text-slate-400 font-bold block mb-1">招牌绝活英雄池:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {featured.signatures.map(hero => (
                      <span
                        key={hero}
                        className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[#00f0ff] text-[10px] font-sans font-medium"
                      >
                        ✦ {hero}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Passive Power */}
                <div className="mt-2.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200">
                  <span className="font-bold text-[#ffd700]">被动觉醒:</span> {featured.passives}
                </div>
              </div>

              {/* Probabilities Info */}
              <div className="p-2.5 rounded-xl bg-[#0f131c] border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>招募概率: SSS 2.5% | SSR 12% | SR 35.5% | R 50%</span>
                <span className="text-cyan-400 font-bold">10连保底必出 SR+</span>
              </div>
            </div>

            {/* Bottom Recruitment Action Bar with Chamfered Buttons */}
            <div className="p-3 border-t border-cyan-500/20 bg-[#0f131c] grid grid-cols-2 gap-2">
              <button
                onClick={() => handlePull(1)}
                disabled={isPulling}
                className="py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold font-tech flex flex-col items-center justify-center transition-all cursor-pointer active:scale-98"
              >
                <span>单次星探招募</span>
                <span className="text-[10px] text-cyan-400 font-code font-normal">180 钻石 / 试炼点</span>
              </button>

              <button
                onClick={() => handlePull(10)}
                disabled={isPulling}
                className="py-2.5 px-3 rounded-lg bg-gradient-to-r from-cyan-500/30 via-cyan-400/20 to-amber-500/30 hover:from-cyan-500/40 hover:to-amber-500/40 text-white border border-cyan-400/60 text-xs font-black font-tech flex flex-col items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all cursor-pointer active:scale-98"
              >
                <span className="text-[#00f0ff] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> 绝杀十连招募
                </span>
                <span className="text-[10px] text-[#ffd700] font-code font-normal">1,800 钻石 (必出神将)</span>
              </button>
            </div>

            {/* Gacha Result Modal Overlay */}
            {showResultsOverlay && (
              <div className="absolute inset-0 z-20 bg-black/95 p-4 flex flex-col justify-between animate-fade-in">
                <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
                  <h4 className="text-sm font-black font-tech text-[#00f0ff] flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-[#ffd700]" /> 星探招募签约结果报告
                  </h4>
                  <button
                    onClick={() => setShowResultsOverlay(false)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 my-auto py-2 max-h-[70vh] overflow-y-auto">
                  {pullResults.map((card, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-between ${
                        card.tier === 'SSS'
                          ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_20px_rgba(255,215,0,0.4)]'
                          : card.tier === 'SSR'
                          ? 'bg-indigo-950/40 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                          : card.tier === 'SR'
                          ? 'bg-cyan-950/40 border-cyan-500/50'
                          : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-black font-tech mb-1 ${
                          card.tier === 'SSS' ? 'bg-amber-500 text-slate-950' :
                          card.tier === 'SSR' ? 'bg-indigo-500 text-white' :
                          card.tier === 'SR' ? 'bg-cyan-500 text-slate-950' :
                          'bg-slate-700 text-slate-300'
                        }`}>
                          {card.tier}
                        </span>
                        <span className="text-xs font-bold text-white truncate max-w-full">{card.name}</span>
                        <span className="text-[10px] text-cyan-400 font-mono mt-0.5">OVR {card.ovr}</span>
                        <span className="text-[9px] text-slate-400 font-mono">APM {card.apm}</span>
                      </div>

                      {/* Sign button on high-tier cards */}
                      {(card.tier === 'SSS' || card.tier === 'SSR' || card.tier === 'SR') && (
                        <button
                          disabled={signedPlayerNames[card.name]}
                          onClick={() => handleSignCard(card)}
                          className={`mt-2 w-full py-1 rounded text-[9px] font-tech font-bold uppercase transition cursor-pointer flex items-center justify-center gap-1 ${
                            signedPlayerNames[card.name]
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 cursor-default'
                              : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:brightness-110'
                          }`}
                        >
                          {signedPlayerNames[card.name] ? (
                            <>
                              <CheckCircle2 className="w-2.5 h-2.5" /> 已签约
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-2.5 h-2.5" /> 入队签约
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowResultsOverlay(false)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs font-tech shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer"
                >
                  确认签约报告并返回
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};
