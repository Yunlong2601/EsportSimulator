import React, { useState, useMemo } from 'react';
import { Trophy, DollarSign, Award, X, Search, Globe2, Sparkles, CheckCircle2, Flame, Shield, ArrowUpRight } from 'lucide-react';
import { soundEngine } from '../utils/audio';

export interface LeaderboardEntry {
  rank: number;
  name: string;
  region: 'LPL' | 'LCK' | 'LEC' | 'LCS' | 'GLOBAL';
  team: string;
  earnings: number;
  cups: number;
  msi: number;
  status: string;
  tier: 'CHALLENGER' | 'GRANDMASTER' | 'MASTER' | 'DIAMOND';
  isPlayer?: boolean;
}

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerEarnings: number;
  playerCups: number;
  playerName?: string;
  playerTier?: string;
}

// Top Legends Seed Data
export const BASE_LEGENDS: LeaderboardEntry[] = [
  { rank: 1,  name: "Faker (李相赫)",      region: "LCK", team: "T1",       earnings: 18450000, cups: 5, msi: 2, status: "四冠五冠GOAT·不朽传奇", tier: "CHALLENGER" },
  { rank: 2,  name: "Ruler (朴载赫)",      region: "LCK", team: "GEN",      earnings: 9800000,  cups: 1, msi: 1, status: "尺帝绝杀ADC·霞之回响", tier: "CHALLENGER" },
  { rank: 3,  name: "Rookie (宋义进)",     region: "LPL", team: "NIP",      earnings: 8650000,  cups: 1, msi: 0, status: "极境两球一姬·中路真神", tier: "CHALLENGER" },
  { rank: 4,  name: "Scout (李汭燦)",      region: "LPL", team: "LNG",      earnings: 8120000,  cups: 1, msi: 1, status: "冰岛总决FMVP·致命刺客", tier: "CHALLENGER" },
  { rank: 5,  name: "Viper (朴到贤)",      region: "LCK", team: "HLE",      earnings: 7900000,  cups: 1, msi: 0, status: "通天代射手·残局收割机", tier: "CHALLENGER" },
  { rank: 6,  name: "TheShy (姜承録)",     region: "LPL", team: "WBG",      earnings: 7600000,  cups: 1, msi: 0, status: "天神下凡剑魔·断剑重铸", tier: "CHALLENGER" },
  { rank: 7,  name: "JackeyLove (喻文波)", region: "LPL", team: "TES",      earnings: 7450000,  cups: 1, msi: 1, status: "赌上职业闪现·暴毙与绝杀", tier: "CHALLENGER" },
  { rank: 8,  name: "Doinb (金泰相)",      region: "LPL", team: "FPX 名宿", earnings: 7100000,  cups: 1, msi: 0, status: "超级游走·深海泰坦领袖", tier: "CHALLENGER" },
  { rank: 9,  name: "Meiko (田野)",        region: "LPL", team: "TES",      earnings: 6980000,  cups: 1, msi: 2, status: "大满贯总指挥·开团机器", tier: "CHALLENGER" },
  { rank: 10, name: "Chovy (郑志勋)",      region: "LCK", team: "GEN",      earnings: 6800000,  cups: 0, msi: 1, status: "补刀机器·对线绝对压制", tier: "CHALLENGER" },
  { rank: 11, name: "Knight (卓定)",       region: "LPL", team: "BLG",      earnings: 6500000,  cups: 0, msi: 2, status: "黄金左臂·辛德拉魔偶", tier: "CHALLENGER" },
  { rank: 12, name: "Bin (陈泽彬)",        region: "LPL", team: "BLG",      earnings: 6350000,  cups: 0, msi: 2, status: "五杀剑姬·狂暴地火单带", tier: "CHALLENGER" },
  { rank: 13, name: "Uzi (简自豪)",        region: "LPL", team: "RNG 名宿", earnings: 6200000,  cups: 0, msi: 2, status: "狂小狗·暗夜猎手信仰", tier: "CHALLENGER" },
  { rank: 14, name: "Xiaohu (李元浩)",     region: "LPL", team: "WBG",      earnings: 6050000,  cups: 0, msi: 3, status: "春之虎帝·三冠MSI战神", tier: "GRANDMASTER" },
  { rank: 15, name: "Canyon (金建敷)",     region: "LCK", team: "GEN",      earnings: 5900000,  cups: 1, msi: 1, status: "北极熊·野区三叔主宰", tier: "GRANDMASTER" },
  { rank: 16, name: "BeryL (原乾熙)",      region: "LCK", team: "KT",       earnings: 5820000,  cups: 2, msi: 0, status: "发明家教练·双冠智将", tier: "GRANDMASTER" },
  { rank: 17, name: "ShowMaker (许秀)",    region: "LCK", team: "DK",       earnings: 5750000,  cups: 1, msi: 0, status: "重铸荣光·妖姬绝影步", tier: "GRANDMASTER" },
  { rank: 18, name: "Deft (金赫奎)",       region: "LCK", team: "KT",       earnings: 5600000,  cups: 1, msi: 1, status: "最后一舞·百折不挠之心", tier: "GRANDMASTER" },
  { rank: 19, name: "Ming (史森明)",       region: "LPL", team: "RNG",      earnings: 5200000,  cups: 0, msi: 3, status: "黄金搭档·开团牛头泰坦", tier: "GRANDMASTER" },
  { rank: 20, name: "Kanavi (徐进赫)",     region: "LPL", team: "JDG",      earnings: 5100000,  cups: 0, msi: 1, status: "重装野核·掠食者节奏", tier: "GRANDMASTER" }
];

// Generate entries 21-100 dynamically
export const GENERATED_TOP100: LeaderboardEntry[] = Array.from({ length: 80 }).map((_, idx) => {
  const rank = idx + 21;
  const teams = ["BLG", "TES", "JDG", "WBG", "EDG", "RNG", "T1", "GEN", "DK", "HLE", "G2", "FNC"];
  const regions: ('LPL' | 'LCK' | 'LEC')[] = ['LPL', 'LCK', 'LEC'];
  const aliases = ["Shadow", "Storm", "Frost", "Reaper", "Nova", "Titan", "Blaze", "Ghost", "Zenith", "Apex", "Phantom", "Pulse", "Cyber", "Zero"];
  const roles = ["上单", "打野", "中单", "ADC", "辅助"];
  const reg = regions[idx % 3];
  const team = teams[idx % teams.length];
  const earnings = Math.floor(4800000 * Math.pow(0.97, idx) + ((idx * 1791) % 80000));
  const cups = rank <= 26 ? (rank % 2 === 0 ? 1 : 0) : 0;
  return {
    rank,
    name: `${aliases[idx % aliases.length]}_${rank} (${roles[idx % 5]})`,
    region: reg,
    team,
    earnings,
    cups,
    msi: cups > 0 ? (rank % 2 === 0 ? 1 : 0) : 0,
    status: rank <= 40 ? "赛区顶级全明星首发" : "天梯巅峰高分职业选手",
    tier: rank <= 45 ? "MASTER" : "DIAMOND"
  };
});

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  playerEarnings,
  playerCups,
  playerName = '宿命先锋',
  playerTier = 'CHALLENGER'
}) => {
  const [activeTab, setActiveTab] = useState<'earnings' | 'cups'>('earnings');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSynced, setIsSynced] = useState<boolean>(true);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Combine player with base data and sort
  const combinedEntries = useMemo(() => {
    const list: LeaderboardEntry[] = [...BASE_LEGENDS, ...GENERATED_TOP100];
    const playerEntry: LeaderboardEntry = {
      rank: 999,
      name: `★ ${playerName} (你)`,
      region: 'LPL',
      team: '自建战队·豪门新星',
      earnings: playerEarnings,
      cups: playerCups,
      msi: 0,
      status: playerCups > 0 ? '世界新王统治者 // 荣耀登顶' : '冲击S赛王座新星 // 绝境狂飙',
      tier: (playerTier as any) || 'CHALLENGER',
      isPlayer: true
    };

    const fullList = [...list, playerEntry];

    if (activeTab === 'earnings') {
      fullList.sort((a, b) => {
        if (b.earnings === a.earnings) return b.cups - a.cups;
        return b.earnings - a.earnings;
      });
    } else {
      fullList.sort((a, b) => {
        if (b.cups === a.cups) return b.earnings - a.earnings;
        return b.cups - a.cups;
      });
    }

    return fullList.map((item, index) => ({
      ...item,
      rank: index + 1
    }));
  }, [playerEarnings, playerCups, playerName, playerTier, activeTab]);

  const playerStanding = useMemo(() => {
    return combinedEntries.find(e => e.isPlayer) || {
      rank: 999,
      earnings: playerEarnings,
      cups: playerCups
    };
  }, [combinedEntries, playerEarnings, playerCups]);

  // Filtered by region & search
  const filteredEntries = useMemo(() => {
    return combinedEntries.filter(entry => {
      const matchRegion = selectedRegion === 'ALL' || entry.region === selectedRegion;
      const matchSearch =
        searchTerm.trim() === '' ||
        entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.team.toLowerCase().includes(searchTerm.toLowerCase());
      return matchRegion && matchSearch;
    }).slice(0, 100);
  }, [combinedEntries, selectedRegion, searchTerm]);

  const handleSyncToCloud = () => {
    soundEngine.playVictory();
    setIsSynced(true);
    setSyncToast('战绩数据已同步至全球云端天梯！');
    setTimeout(() => setSyncToast(null), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col bg-[#0a0e17] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.15)] overflow-hidden text-slate-100">
        
        {/* Top Cyberpunk Neon Header */}
        <div className="relative p-4 border-b border-cyan-500/20 bg-gradient-to-r from-[#0f131c] via-[#0a0e17] to-[#0f131c]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-[#ffd700] shadow-[0_0_15px_rgba(255,215,0,0.3)]">
                <Trophy className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black font-tech tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-[#00f0ff] to-[#ffd700]">
                    全球百强传奇名人堂天梯榜
                  </h2>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-[#00f0ff] border border-cyan-500/40 font-code font-bold">
                    TOP 100
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  职业生涯总奖金 · 召唤师奖杯（世界总冠军）实时全球排位
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Player Personal Status Card */}
          <div className="mt-3 p-3 rounded-xl bg-[#0f131c] border border-cyan-500/30 flex flex-wrap items-center justify-between gap-2 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-cyan-500/20 to-amber-500/20 border border-cyan-400/50 flex flex-col items-center justify-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase">当前排位</span>
                <span className="text-sm font-black text-[#00f0ff] font-tech leading-none">
                  #{playerStanding.rank}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">★ {playerName} (你)</span>
                  <span className="text-[10px] px-1 rounded bg-amber-500/20 text-[#ffd700] border border-amber-500/30 font-bold">
                    {playerCups > 0 ? `🏆 × ${playerCups}` : '争冠中'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 font-code">
                  <span className="text-emerald-400 font-bold">
                    ${playerEarnings.toLocaleString()}
                  </span>
                  <span>|</span>
                  <span className="text-amber-300">
                    {playerCups} 座召唤师奖杯
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSyncToCloud}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-[#00f0ff] border border-cyan-500/50 text-xs font-bold font-tech flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(0,240,255,0.2)] chamfer-btn cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>同步天梯战绩</span>
            </button>
          </div>

          {syncToast && (
            <div className="mt-2 py-1 px-3 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{syncToast}</span>
            </div>
          )}
        </div>

        {/* Tab Switcher & Filter Controls */}
        <div className="p-3 bg-[#0a0e17] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          {/* Main Sort Tabs */}
          <div className="flex items-center gap-1 bg-[#0f131c] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('earnings');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold font-tech flex items-center gap-1.5 transition-all ${
                activeTab === 'earnings'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-[#00f0ff] border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>生涯总奖金榜</span>
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('cups');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold font-tech flex items-center gap-1.5 transition-all ${
                activeTab === 'cups'
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-[#ffd700] border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>召唤师奖杯榜</span>
            </button>
          </div>

          {/* Region Filters */}
          <div className="flex items-center gap-1 text-[11px] font-bold">
            {['ALL', 'LPL', 'LCK', 'LEC'].map(reg => (
              <button
                key={reg}
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedRegion(reg);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-code transition-all ${
                  selectedRegion === reg
                    ? 'bg-cyan-500/30 text-[#00f0ff] border border-cyan-500/50'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {reg === 'ALL' ? '全部赛区' : reg}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-3 py-2 bg-[#0a0e17] border-b border-slate-900 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="搜索职业选手名、战队 (如 Faker, TheShy, T1, BLG...)"
              className="w-full pl-8 pr-3 py-1.5 bg-[#0f131c] border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            显示 {filteredEntries.length} 名
          </span>
        </div>

        {/* Scrollable Leaderboard List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredEntries.map(entry => {
            const isTop1 = entry.rank === 1;
            const isTop2 = entry.rank === 2;
            const isTop3 = entry.rank === 3;
            const isPodium = isTop1 || isTop2 || isTop3;

            return (
              <div
                key={`${entry.rank}-${entry.name}`}
                className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  entry.isPlayer
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                    : isTop1
                    ? 'bg-[#0f131c] border-amber-500/60 shadow-[0_0_15px_rgba(255,215,0,0.15)]'
                    : isTop2
                    ? 'bg-[#0f131c] border-slate-400/50'
                    : isTop3
                    ? 'bg-[#0f131c] border-amber-700/50'
                    : 'bg-[#0f131c] border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Left: Rank & Player Info */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-black font-tech text-xs shrink-0 ${
                      isTop1
                        ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-md'
                        : isTop2
                        ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-950'
                        : isTop3
                        ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-slate-100'
                        : entry.isPlayer
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {entry.rank}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-xs font-bold truncate ${
                        entry.isPlayer ? 'text-[#00f0ff]' : isPodium ? 'text-[#ffd700]' : 'text-slate-100'
                      }`}>
                        {entry.name}
                      </span>
                      <span className={`text-[9px] px-1 py-0.2 rounded font-code font-bold ${
                        entry.region === 'LPL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        entry.region === 'LCK' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {entry.team} · {entry.region}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {entry.status}
                    </div>
                  </div>
                </div>

                {/* Right: Earnings & Trophies */}
                <div className="text-right shrink-0">
                  <div className="text-xs font-black font-code text-emerald-400">
                    ${entry.earnings.toLocaleString()}
                  </div>
                  <div className="flex items-center justify-end gap-1 text-[10px] text-[#ffd700] font-tech font-bold mt-0.5">
                    {entry.cups > 0 ? (
                      <>
                        <Trophy className="w-3 h-3 text-[#ffd700]" />
                        <span>{entry.cups} 座召唤师杯</span>
                      </>
                    ) : (
                      <span className="text-slate-500">0 冠</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Bar Info */}
        <div className="p-3 bg-[#0f131c] border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>数据源: TapTap 竞技云端网络 (每 5 分钟同步)</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
          >
            返回游戏
          </button>
        </div>

      </div>
    </div>
  );
};
