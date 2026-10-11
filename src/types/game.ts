export type GamePhase = 1 | 2 | 3;

export type RankTier = 
  | 'Iron' 
  | 'Bronze' 
  | 'Silver' 
  | 'Gold' 
  | 'Platinum' 
  | 'Emerald' 
  | 'Diamond' 
  | 'Master' 
  | 'Grandmaster' 
  | 'Challenger';

export interface ProGearSkin {
  id: string;
  name: string;
  category: 'Mouse' | 'Keyboard' | 'Monitor' | 'Headset' | 'Jersey';
  rarity: 'RARE' | 'EPIC' | 'LEGENDARY';
  icon: string;
  glowColor: string;
  mechanicsBonus: number;
  mentalBonus: number;
  desc: string;
}

export interface LoginStreakDay {
  day: number;
  rewardLp: number;
  rewardCash?: number;
  proGearSkin?: ProGearSkin;
  claimed: boolean;
}

export interface LoginStreakState {
  currentStreak: number;
  lastClaimDate: string;
  canClaimToday: boolean;
  unlockedSkins: ProGearSkin[];
  equippedSkinId?: string;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'WIN_GAMES' | 'VOD_REVIEWS' | 'STREAMS' | 'REFLEX_DUELS' | 'WIN_STREAK';
  target: number;
  current: number;
  rewardLp: number;
  rewardMoney?: number;
  rewardFame?: number;
  claimed: boolean;
  icon: string;
}

export interface ConsumableItem {
  id: string;
  name: string;
  nameEn: string;
  cost: number;
  icon: string;
  desc: string;
  focusRestore: number;
  energyRestore: number;
  mentalRestore: number;
  category: 'shot' | 'coffee' | 'boost' | 'package';
  tag?: string;
}

export interface RecoveryRoomEnvironment {
  soundproofing: number; // 0 - 3 (隔音设施)
  bedding: number;       // 0 - 3 (高奢寝具)
  atmosphere: number;    // 0 - 3 (睡眠环境微气候/理疗)
}

export interface PlayerStats {
  lp: number;
  rankTier: RankTier;
  mechanics: number; // 0 - 100
  mental: number; // 0 - 100
  energy: number; // 0 - 100
  focus: number; // 0 - 100 专注度 / 疲劳度监控 (高强度排位与直播剧烈消耗，休整或咖啡恢复)
  money: number;
  lifetimeEarnings?: number; // 职业生涯累计总收入
  fame: number; // 0 - 100
  winStreak: number;
  totalGames: number;
  wins: number;
  losses: number;
  ownedGear: string[];
  activeTitle?: string | null;
  reflexWins?: number;
  traits?: string[];
  energyDrinks?: number;
  scoutAttention?: number; // 0 - 100%
  promoSeries?: PromoSeriesState | null;
  recoveryRoom?: RecoveryRoomEnvironment;
  agency?: PlayerAgencyState;
  careerHealth?: CareerHealthState;
  streamChannel?: StreamChannelState;
  rivalry?: PlayerRivalryState;
  confidence?: ConfidenceState;
  legacyBoosts?: LegacyStatBoostsTracker;
  tacticalInsight?: number; // 0 - 100 战术洞察值 (通过复盘经典对局与团战决策获取，提升对线预判与关键团战胜率)
  draftAdvantage?: DraftAdvantageBonus | null; // BP博弈特训战术优势buff
  lpMultiplierBonus?: LpMultiplierBonus | null; // 宿敌对决大胜激发的LP倍率buff
}

export interface LpMultiplierBonus {
  multiplier: number; // e.g. 2.0x, 2.5x, 3.0x
  matchesRemaining: number; // 剩余 3 场
  sourceNemesis: string; // "顾寒舟 (ColdBlade)"
  title: string; // e.g. "宿命狂屠 · 3倍极速上分"
}

export interface RivalryDuelQuestion {
  id: string;
  scenario: string;
  enemyMove: string;
  options: {
    label: string;
    description: string;
    isCorrect: boolean;
    clutchScore: number;
  }[];
}

export interface DraftAdvantageBonus {
  level: number; // 1 ~ 3 级 BP优势
  title: string; // e.g. "天王山针对BanPick奇策"
  bonusWinRate: number; // +8% ~ +18% 胜率
  bonusMechanics: number; // +3 ~ +6 微操
  bonusMacro: number; // +4 ~ +8 大局观
  matchesRemaining: number; // 剩余生效场次 (通常为下一场正式赛事)
  appliedAt: string;
}

export interface TacticalBpSlot {
  phase: 'BAN_1' | 'PICK_1' | 'BAN_2' | 'PICK_2' | 'COUNTER_PICK';
  phaseName: string;
  targetRole: 'TOP' | 'JUG' | 'MID' | 'ADC' | 'SUP';
  enemyThreat: string; // 敌方绝活威胁英雄
  idealAnswers: string[]; // 针对性最优解英雄
  hint: string;
}

export interface TacticalBpPuzzle {
  id: string;
  title: string;
  scenario: string;
  enemyComposition: string; // "冲阵强开突脸流 (Dive Comp)"
  slots: TacticalBpSlot[];
  rewardAdvantage: DraftAdvantageBonus;
}

export interface VodTeamfightMoment {
  id: string;
  minute: number;
  title: string;
  location: string; // e.g. "大龙坑口", "中路二塔草丛", "小龙河道狭口"
  description: string;
  outcome: 'WIN' | 'LOSS' | 'CLUTCH_FLIP';
  keyHero: string;
  keyAction: string;
  insightBonus: number; // +3 ~ +5 战术洞察点
  xpBonusMech?: number;
  xpBonusMacro?: number;
}

export interface MatchVodEntry {
  id: string;
  matchTitle: string;
  stageType: 'SOLO_RANKED' | 'LPL_REGULAR' | 'WORLDS_FINAL' | 'SCRIM_DUEL';
  stageEra: string;
  result: 'VICTORY' | 'DEFEAT';
  myTeam: string;
  enemyTeam: string;
  playerChamp: string;
  playerRole: 'TOP' | 'JUG' | 'MID' | 'ADC' | 'SUP';
  kda: string;
  duration: string;
  mvpPlayer: string;
  thumbnailGradient: string;
  teamfightMoments: VodTeamfightMoment[];
  insightAwarded: number;
  reviewed: boolean;
  reviewedAt?: string;
}

export interface LegacyStatBoost {
  stat: 'mechanics' | 'mental' | 'fame';
  amount: number;
  statNameCn: string;
  reason: string;
}

export interface LegacyStatBoostsTracker {
  permanentMechanics: number;
  permanentMental: number;
  permanentFame: number;
  totalMvpsAwarded: number;
}

export interface ConfidenceTierInfo {
  level: number;
  name: string;
  badge: string;
  bonusMech: number;
  bonusMental: number;
  bonusWinRate: number;
  bonusLp: number;
  desc: string;
}

export interface PostMatchMvpRecord {
  matchType: 'SOLO_QUEUE' | 'STAGE_MATCH';
  champName: string;
  isWin: boolean;
  isMvp: boolean;
  isSvp: boolean;
  score: number;
  kda: string;
  damageShare: string;
  killParticipation: string;
  headline: string;
  casterQuote: string;
  danmaku: string;
  buffAwarded?: boolean;
  buffDesc?: string;
  legacyBoostAwarded?: LegacyStatBoost;
}

export interface ConfidenceState {
  level: number;         // 0 - 3 (0: 平稳从容, 1: 渐入佳境, 2: 气势如虹, 3: 天神霸体)
  score: number;         // 0 - 100
  matchesLeft: number;   // 剩余有效场次
  currentStreak: number; // 连续 MVP 次数
  totalMvpCount?: number;
  lastMvpCard?: PostMatchMvpRecord | null;
}

export interface RivalryClashLog {
  id: string;
  timestamp: string;
  outcome: 'player_win' | 'rival_win';
  scoreSnapshot: string; // e.g. "3 - 2"
  tensionAfter: number; // 0 - 100
  flavorText: string; // Dynamic tension & status rivalry narrative
  rivalQuote: string; // What the rival declared or texted
  rivalAction: string; // Rival's after-match behavior
}

export interface TrackedOpponent {
  id: string;
  name: string;
  handle: string;
  title: string;
  avatar: string;
  role: 'TOP' | 'JUG' | 'MID' | 'ADC' | 'SUP';
  signatureChamp: string;
  encountersCount: number;
  playerWins: number;
  rivalWins: number;
  isNemesis: boolean;
  bountyLp: number;
}

export interface HiddenPotentialData {
  playerName: string;
  potentialCeiling: number; // 90 - 99
  potentialTier: 'S' | 'SS' | 'SSS';
  clutchFactor: string;
  heroPoolDepth: string;
  synergyFit: string;
  specialtyTrait: string;
  scoutConfidence: number; // 0 - 100%
}

export interface PlayerRivalryState {
  rivalId: string;
  rivalName: string; // "顾寒舟"
  rivalHandle: string; // "ColdBlade"
  rivalTitle: string; // "峡谷第一刺客 · 绝活路人王"
  rivalAvatar: string; // "🥷"
  signatureChamp: string; // "影流之主 (劫)"
  playerWins: number;
  rivalWins: number;
  tension: number; // 0 - 100% 宿怨火药味
  tensionStage: 'rival_budding' | 'rival_intense' | 'rival_nemesis' | 'rival_legendary';
  lastClashOutcome?: 'win' | 'loss' | null;
  rivalStatusQuote: string;
  clashHistory: RivalryClashLog[];
  snipeQueueActive: boolean;
  trackedOpponents?: TrackedOpponent[];
  nemesisBonusLp?: number;
}

export interface StreamChannelState {
  subscribers: number; // 粉丝订阅总数 (Subscribers)
  peakViewers: number; // 历史最高在线人气
  totalStreams: number; // 累计开播轮次
  unlockedMilestones: string[]; // 已领取的里程碑ID
  unlockedEmoteIds: string[]; // 已解锁的专属粉丝表情包ID
  activePerkIds: string[]; // 已激活的频道特权ID
  equippedEmoteId?: string | null; // 当前佩戴并在弹幕展示的专属表情ID
}

export interface FanEmote {
  id: string;
  name: string;
  emoji: string;
  code: string; // e.g. ":god_hand:", ":super_chat:"
  tier: number;
  rarity: 'rare' | 'epic' | 'legendary';
  description: string;
}

export interface ChannelPerk {
  id: string;
  name: string;
  title: string;
  icon: string;
  subscriberReq: number;
  bonusSummary: string;
  effectDescription: string;
}

export interface StreamingMilestone {
  id: string;
  title: string;
  badge: string;
  subscriberReq: number;
  rewardMoney: number;
  rewardFame: number;
  perk: ChannelPerk;
  emote: FanEmote;
  lore: string;
}

export interface CareerHealthState {
  strain: number; // 0 - 100 手部与手腕肌肉积劳负荷 (Strain)
  hasRSI: boolean; // 是否患上腱鞘炎/重复性劳损 (Repetitive Strain Injury)
  rsiSeverity: 'none' | 'mild' | 'moderate' | 'severe'; // 劳损严重程度
  maxMechanics: number; // 正常上限100，患有RSI时上限受限 (85 / 70 / 55)
  consecutiveGrinds: number; // 连续未充分休整的高强度对局/训练场次
  treatmentsCount: number; // 累计康复理疗次数
  physioPerkActive?: boolean; // 是否拥有专属理疗顾问的常驻减负护盾
}

export interface PhysioTreatment {
  id: string;
  name: string;
  title: string;
  icon: string;
  cost: number;
  strainRelief: number; // 减轻多少负荷
  curesSeverity: CareerHealthState['rsiSeverity'][]; // 能治愈的RSI等级
  restoresMaxMechanics: number; // 恢复到的微操上限 (默认100)
  perkDescription?: string;
  description: string;
}

export type NegotiationTactic = 'aggressive' | 'diplomatic' | 'cut-throat';

export interface RecruitNegotiationRecord {
  id: string;
  recruitId: string;
  recruitName: string;
  tactic: NegotiationTactic;
  baseCommission: number; // e.g. 0.10 (10%)
  finalCommission: number; // e.g. 0.14 (14%)
  baseSigningBonus: number; // e.g. 1500
  finalSigningBonus: number; // e.g. 1800
  outcome: 'legendary' | 'success' | 'compromise';
  timestamp: string;
  summary: string;
}

export interface AgencyRecruit {
  id: string;
  name: string;
  role: 'TOP' | 'JUG' | 'MID' | 'ADC' | 'SUP';
  avatar: string;
  age: number;
  mechanics: number;
  macro: number;
  potential: number;
  personality: '桀骜不驯' | '谦逊务实' | '野心勃勃' | '精明逐利' | '热血赤诚';
  baseSigningBonus: number; // e.g. 1500
  baseCommissionRate: number; // e.g. 0.10 (10%)
  fameReq: number;
  bio: string;
  preferredTactic?: NegotiationTactic;
}

export interface PlayerAgencyState {
  hiredAgentId: string | null;
  signedSponsors: string[];
  accumulatedPassiveIncome: number;
  totalEarnedFromAgency: number;
  signedRecruits?: string[];
  negotiationHistory?: RecruitNegotiationRecord[];
}

export interface PlayerAgent {
  id: string;
  name: string;
  title: string;
  avatar: string;
  tier: number;
  cost: number;
  fameReq: number;
  passivePerFame: number; // Passive $ generated per point of Fame on each match/action
  sponsorshipBonusRate: number; // e.g. 0.35 = +35% streaming & sponsor payout
  contractNegotiationRate: number; // +X% bonus contract terms
  perkName: string;
  perkDescription: string;
  bio: string;
}

export interface AgencySponsorshipDeal {
  id: string;
  brand: string;
  category: string;
  logo: string;
  fameReq: number;
  basePayout: number;
  signingBonus: number;
  description: string;
}

export interface PlayerTrait {
  id: string;
  name: string;
  nameEn: string;
  desc: string;
  icon: string;
  color: string;
  bonusDesc: string;
}

export interface PromoSeriesState {
  targetTier: RankTier;
  currentTier?: RankTier;
  wins: number;
  losses: number;
  consecutiveWins?: number;
  requiredConsecutiveWins?: number;
  requiredWins: number; // e.g. 2 for BO3, 3 for BO5
  maxGames: number;    // e.g. 3 or 5
  history: ('WIN' | 'LOSS')[];
  active: boolean;
  format?: 'BO3' | 'BO5';
}

export interface SoloQueueEvent {
  id: string;
  title: string;
  scenario: string;
  contextTag: string;
  options: {
    label: string;
    description: string;
    risk: 'Low' | 'Medium' | 'High';
    mechanicsReq?: number;
    mentalReq?: number;
    execute: (stats: PlayerStats) => {
      success: boolean;
      log: string;
      lpDelta: number;
      mechanicsDelta: number;
      mentalDelta: number;
      fameDelta: number;
      moneyDelta?: number;
    };
  }[];
}

export interface Champion {
  id: string;
  name: string;
  role: 'TOP' | 'JUG' | 'MID' | 'ADC' | 'SUP';
  icon: string;
  archetype: 'Dive/Assassin' | 'Control Mage' | 'Hypercarry' | 'Engage Tank' | 'Enchanter' | 'Splitpusher' | 'Poke';
  tier: 'S+' | 'S' | 'A' | 'B';
  power: number; // 70-98
  counters: string[]; // Champion IDs this counters
  counteredBy: string[]; // Champion IDs this gets countered by
  signatureMove: string;
}

export interface DraftState {
  stage: 'BAN_1' | 'PICK_1' | 'BAN_2' | 'PICK_2' | 'FINISHED';
  currentTurn: 'PLAYER' | 'ENEMY';
  playerPicks: (Champion | null)[]; // 5 roles: TOP, JUG, MID, ADC, SUP
  enemyPicks: (Champion | null)[];
  playerBans: Champion[];
  enemyBans: Champion[];
  selectedRoleIndex: number; // 0-4
}

export interface MatchSimulationLog {
  id: string;
  minute: number;
  text: string;
  type: 'kill' | 'objective' | 'teamfight' | 'clutch' | 'baron' | 'caster';
  playerTeamScoreDelta?: number;
  enemyTeamScoreDelta?: number;
}

export type PlayerPlaystyle = 'Aggressive' | 'Macro-Oriented' | 'Clutch' | 'Defensive';

export interface PlayerTrainingBoost {
  stat: 'mechanics' | 'macro' | 'morale';
  boostAmount: number;
  daysRemaining: number;
}

export interface ProPlayer {
  id: string;
  name: string;
  role: 'TOP' | 'JUG' | 'MID' | 'ADC' | 'SUP';
  country: string;
  age: number;
  mechanics: number;
  macro: number;
  morale: number;
  salary: number;
  marketValue: number;
  avatar: string;
  playstyle?: PlayerPlaystyle;
  trainingBoost?: PlayerTrainingBoost;
  agencyName?: string;
  contractYears?: number;
  buyoutClause?: number;
}

export interface SponsorDeal {
  id: string;
  name: string;
  brand: string;
  logo: string;
  weeklyPayout: number;
  signingBonus: number;
  requirement: string;
  active: boolean;
}

export interface FacilityUpgrade {
  id: string;
  name: string;
  tier: number;
  maxTier: number;
  cost: number;
  description: string;
  effectLabel: string;
  icon: string;
  englishName?: string;
  category?: 'INTERNET' | 'ERGONOMICS' | 'KITCHEN' | 'PHYSIO' | 'SLEEP' | 'LOUNGE' | 'LEGACY';
  permanentMoraleBonus?: number; // 永久士气底限与加成
  recoverySpeedMultiplier?: number; // 赛后/训练疲劳恢复速率加成 (%)
  tierPerkName?: string;
  tierPerkDescription?: string;
}

export interface InfrastructureStats {
  totalPermanentMoraleBonus: number; // e.g. +24% 全员永久士气加成
  totalRecoverySpeedMultiplier: number; // e.g. +85% 赛后与训练恢复倍率
  gamingHouseStars: number; // e.g. 1-5 星级豪门基地
  facilityGradeLabel: string; // e.g. "SSS 级世界殿堂级豪门基地"
  lastFacilityInspection?: string;
}

export interface DynastyState {
  budget: number;
  weeklyExpenses: number;
  fanHype: number;
  worldRanking: number;
  reputation: number; // 0-100
  roster: ProPlayer[];
  activeSponsors: SponsorDeal[];
  facilities: FacilityUpgrade[];
  infrastructureStats?: InfrastructureStats;
  worldsProgress: {
    round: 'Quarterfinals' | 'Semifinals' | 'Grand Finals' | 'Champion';
    matchesWon: number;
    matchesLost: number;
  };
  communityRelations?: CommunityRelationsState;
  peripheralSponsorships?: PeripheralSponsorshipState;
  dailyTacticalDrill?: {
    lastCompletedDate: string;
    isBuffActive: boolean;
    macroBuffPercent: number; // e.g. 5 for +5% Macro
    bestReactionTimeMs: number;
    completedCount: number;
  };
  scrimReports?: {
    id: string;
    targetTeamId: string;
    targetTeamName: string;
    targetTeamLogo: string;
    scheduledAt: string;
    durationHours: number; // 3 hours
    score: string; // e.g. "2 - 1"
    teamfightCoordinationScore: number; // 0 - 100
    primaryWeakness: string; // e.g. "大龙坑进场拉扯脱节"
    weaknessCategory: 'mechanics' | 'macro' | 'morale';
    detailedWeaknessAnalysis: string;
    trainingCampActionItem: string;
    recommendedStatToTrain: 'mechanics' | 'macro' | 'morale';
    addressedInTrainingCamp?: boolean;
  }[];
  trainingCampHistory?: {
    playerId: string;
    playerName: string;
    stat: 'mechanics' | 'macro' | 'morale';
    boostAmount: number;
    daysRemaining: number;
    timestamp: string;
  }[];
  // Salary Cap & Contract Buyout / Agency System
  salaryCapRules?: {
    softCap: number; // 软工资帽 (e.g. $75,000/周)
    hardCap: number; // 硬工资帽 (e.g. $100,000/周)
    luxuryTaxRate: number; // 奢侈税乘数 (超过软帽部分征收 150% 额外税费)
    agencyFeeRate: number; // 经纪人佣金比例 (10%)
    luxuryTaxPaidTotal?: number; // 累计已缴纳奢侈税
  };
  contractBuyoutHistory?: {
    id: string;
    playerName: string;
    role: string;
    baseBuyout: number;
    agencyCommission: number; // 10%
    totalPaid: number;
    annualSalary: number;
    type: 'SIGNING' | 'RENEWAL' | 'RELEASE';
    timestamp: string;
    agencyName: string;
  }[];
  worldChampionshipsWon?: number; // 赢得全球总决赛冠军次数
  unlockedRings?: string[]; // 已解锁的全球总决赛至尊冠军戒指 ID 列表
  equippedRingId?: string; // 当前佩戴展示的主力冠军戒指 ID
  expansionDraftState?: ExpansionDraftState; // Phase 3 年度联赛扩军选秀与保护大会
  remoteBootcamp?: RemoteBootcampState; // Phase 3 异地7天封闭集训营与大赛增益
  coachingStaff?: CoachingStaffState; // Phase 3 教练智囊团 (Strategic, Mental, Mechanical)
  opponentScoutingReports?: Record<string, OpponentScoutingReport>; // Phase 3 派遣教练对手深度战术侦察研判报告
  teamDynamics?: TeamDynamicsState; // Phase 3 战队战术动态协同编制与队员化学反应
}

export interface RemoteBootcampState {
  isActive: boolean;
  locationId: string;
  locationName: string;
  locationEmoji: string;
  destination: string;
  startedAt: string;
  daysRemaining: number; // 7 days
  cost: number; // 50000
  boostTitle: string;
  mechanicsBonus: number;
  macroBonus: number;
  moraleBonus: number;
  tournamentWinRateBonus: number; // 0.15 (+15% 淘汰赛胜率)
  participatingPlayerNames: string[];
  history?: {
    id: string;
    locationName: string;
    destination: string;
    completedAt: string;
    boostSummary: string;
  }[];
}

// ----------------------------------------------------
// 3D TROPHY HALL CHAMPIONSHIP RINGS
// ----------------------------------------------------
export interface ChampionshipRing {
  id: string;
  season: string; // e.g. "S10", "S11", "S12", "S13", "S14", "S15"
  name: string; // e.g. "S10 幽蓝起源之戒"
  title: string; // e.g. "首冠破晓 · 逆转宿命"
  year: number;
  rarity: 'MYTHIC' | 'IMMORTAL' | 'ETERNAL';
  primaryColor: string; // Hex color
  secondaryColor: string;
  glowEffect: string;
  material: string; // "纯白钛金基底 · 5.2克拉极光海蓝宝 · 18K精金镶边"
  engraving: string; // "镌刻: 首发五虎 · FMVP 绝境开团"
  lore: string; // 夺冠战役背景与传奇故事
  statsBuff: {
    clutchRateBonus: number; // 逆风决胜团战胜率加成 (%)
    fanAppealBonus: number; // 粉丝商业号召力倍率 (%)
    moraleRetention: number; // 选手士气护甲加成
    title: string;
  };
  ring3dStyle: {
    gemEmoji: string;
    bandStyle: string;
    gemGradient: string;
    shadowGlow: string;
    accentGlow: string;
  };
}

// ----------------------------------------------------
// WEEKLY META TREND IN TACTICAL ARENA
// ----------------------------------------------------
export type MetaTier = 'OP' | 'STRONG' | 'BALANCED' | 'WEAK';

export interface MetaChampion {
  name: string;
  role: 'TOP' | 'JUG' | 'MID' | 'ADC' | 'SUP';
  tier: MetaTier; // OP = T0, STRONG = T1, BALANCED = T2, WEAK = T3
  tierLabel: string; // "T0 版本的神" | "T1 强力核心" | "T2 常规之选" | "T3 版本陷阱"
  winRate: number; // e.g. 56.4%
  pickBanRate: number; // e.g. 82.5%
  keySynergy: string; // e.g. "先手连环强控、锁头秒杀"
  draftBuff: string; // e.g. "突脸体系胜率 +15%"
  icon: string;
  trend: 'UP' | 'DOWN' | 'STABLE';
}

export interface MetaDraftStrategyModifier {
  strategyId: string;
  strategyName: string; // e.g. "强开突脸体系 (Dive Engage)"
  desc: string;
  baseSuccessRate: number; // e.g. 65%
  currentModifier: number; // e.g. +15% or -12% based on current weekly meta
  status: 'BUFFED' | 'NERFED' | 'NEUTRAL';
  keyChampions: string[];
  tacticalAdvice: string;
}

export interface WeeklyMetaTrend {
  weekCycle: number; // 1 to 4+
  patchVersion: string; // e.g. "Patch 14.12"
  patchTheme: string; // e.g. "刺客突脸狂潮 (Assassin & Dive Surge)"
  patchDescription: string;
  cycleDay: number; // 1 to 7
  daysRemaining: number; // 7 - cycleDay
  champions: MetaChampion[];
  strategyModifiers: MetaDraftStrategyModifier[];
  metaHighlight: string;
  bpTacticalTip: string;
}

export type PeripheralCategory = 'KEYBOARD' | 'CHAIR' | 'ENERGY_DRINK' | 'HEADSET';

export interface PeripheralSponsorBrand {
  id: string;
  brandName: string;
  companyName: string;
  category: PeripheralCategory;
  categoryNameCn: string;
  tier: 'B' | 'A' | 'S' | 'SS';
  logo: string;
  productModel: string;
  tagline: string;
  fanbaseReq: number;
  baseMonthlyPayout: number;
  baseSigningBonus: number;
  perkName: string;
  perkDesc: string;
  perkBuff: string;
  status: 'LOCKED' | 'AVAILABLE' | 'SIGNED';
  signedStrategy?: 'CONSERVATIVE' | 'GAMBLE' | 'AGGRESSIVE';
  activeMonthlyPayout?: number;
  activeSigningBonus?: number;
  signedAt?: string;
}

export interface PeripheralSponsorshipState {
  signedBrands: Record<PeripheralCategory, PeripheralSponsorBrand | null>;
  totalMonthlyRevenue: number;
  lastClaimTimestamp?: number;
  claimedMonthsCount: number;
  negotiationHistory: {
    id: string;
    brandId: string;
    brandName: string;
    strategy: string;
    outcome: 'SUCCESS' | 'COMPROMISE' | 'FAILED';
    finalMonthly: number;
    finalSigning: number;
    timestamp: string;
  }[];
}

export interface CommunityCampaign {
  id: string;
  type: 'SOCIAL' | 'MEETUP' | 'STREAM';
  categoryName: string;
  title: string;
  cost: number;
  energyCost: number;
  fanbaseGain: number;
  multiplierGain: number;
  description: string;
  cooldownDays: number;
  icon?: string;
}

export interface TeamBannerSkin {
  id: string;
  name: string;
  tier: string;
  gradientBg: string;
  borderColor: string;
  accentColor: string;
  textColor: string;
  icon: string;
  description: string;
}

export interface FanbaseChatEmote {
  id: string;
  code: string;
  label: string;
  emoji: string;
  rarity: 'rare' | 'epic' | 'legendary';
}

export interface FanbaseMilestone {
  id: string;
  threshold: number;
  title: string;
  badge: string;
  bannerSkin: TeamBannerSkin;
  specialEmote: FanbaseChatEmote;
  perkDescription: string;
}

export interface CommunityRelationsState {
  fanbaseCount: number;
  fanbaseMultiplier: number; // e.g. 1.00x - 5.00x
  totalCampaignsRun: number;
  activeCooldowns: Record<string, number>;
  recentActivities: {
    campaignId: string;
    title: string;
    fanbaseGain: number;
    multiplierNow: number;
    timestamp: string;
  }[];
  unlockedMilestoneIds?: string[];
  claimedMilestoneIds?: string[];
  equippedBannerSkinId?: string;
  equippedEmoteId?: string;
}

export interface GearItem {
  id: string;
  name: string;
  cost: number;
  category: 'Peripheral' | 'Hardware' | 'Coaching' | 'Wellness';
  mechanicsBonus: number;
  mentalBonus: number;
  description: string;
  icon: string;
}

export interface PatchNote {
  version: string;
  headline: string;
  description: string;
  changes: {
    champId: string;
    champName: string;
    type: 'BUFF' | 'NERF' | 'REWORK';
    changeText: string;
    powerDelta: number;
  }[];
}

export interface PlayerPerformance {
  role: 'TOP' | 'JUG' | 'MID' | 'ADC' | 'SUP';
  champName: string;
  champIcon: string;
  playerName: string;
  kills: number;
  deaths: number;
  assists: number;
  damageDealt: number;
  cs: number;
  rating: number; // 0 - 10.0
}

export interface SocialPost {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  badge?: string;
  platform: string;
  content: string;
  likes: string;
  retweets?: string;
  timeAgo: string;
}

export interface ReflexDuel {
  opponentChamp: string;
  opponentRole: string;
  spellName: string;
  reactionTimeLimitMs: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'CHALLENGER';
}

export type MilestoneCategory = 'ALL' | 'SOLO_QUEUE' | 'CLUTCH_COMBAT' | 'STAGE_PRO' | 'DYNASTY_TYCOON';

export interface CareerMilestone {
  id: string;
  title: string;              // 中文专属称号 (例如: '单排之神', '残局大师')
  titleEn: string;            // 英文副标题 (e.g., 'Solo Queue God', 'Clutch Artist')
  category: MilestoneCategory;
  rarity: 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';
  description: string;        // 成就背景故事与达成说明
  statRequirementText: string;// 达成条件文本 (例如: "单排天梯积分达到 1,000 LP (王者)")
  statKey: 'lp' | 'wins' | 'winStreak' | 'mechanics' | 'mental' | 'money' | 'reflexWins' | 'worldsWon' | 'gearCount' | 'reputation';
  targetValue: number;
  currentValue?: number;
  unlocked: boolean;
  claimed: boolean;
  rewardLp?: number;
  rewardMoney?: number;
  rewardFame?: number;
  titleBonusDesc: string;     // 佩戴称号获得的实机属性增益 (例如: "全模式微操+3，单排胜场额外+15% LP")
}

export type CareerJournalCategory = 'ALL' | 'TITLE' | 'AGENT' | 'RIVAL_DUEL' | 'TOURNAMENT' | 'TRANSFER';

export interface CareerJournalEntry {
  id: string;
  headline: string;
  subheadline: string;
  date: string;
  category: 'TITLE' | 'AGENT' | 'RIVAL_DUEL' | 'TOURNAMENT' | 'TRANSFER';
  categoryLabel: string;
  newspaperName: string;
  issueNo: string;
  editionTag: string;
  articleBody: string;
  keyQuote: string;
  reporter: string;
  stampText: string;
  statImpact?: string;
  importance: 'BREAKING' | 'MAJOR' | 'FEATURE';
  photoCaption: string;
  timestamp: number;
}

// ==========================================
// PRESTIGE & NEW GAME+ REPLAYABILITY SYSTEMS
// ==========================================

export type PassiveBranch = 'mechanics' | 'tactics' | 'commercial' | 'longevity';

export interface LegacyPassive {
  id: string;
  name: string;
  branch: PassiveBranch;
  tier: number;
  cost: number; // 声望点数 (Prestige Points)
  icon: string;
  description: string;
  bonusSummary: string;
}

export interface RunModifier {
  id: string;
  name: string;
  category: 'curse' | 'wildcard' | 'boon';
  difficultyRating: number; // 1 - 5 星
  scoreMultiplier: number;  // 例如 +0.25 即 +25% 声望收益
  icon: string;
  description: string;
  flavor: string;
}

export type CareerEndingCategory = 'GOAT' | 'COACH' | 'CEO' | 'STREAMER' | 'FOREIGN_EXP' | 'LEGEND_IMMORTAL';

export interface CareerEnding {
  id: string;
  title: string;
  category: CareerEndingCategory;
  badge: string;
  lore: string;
  conditionsSummary: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  unlockedInGen?: number;
}

export interface PrestigeState {
  generation: number;            // 周目代数 (1: 初露锋芒, 2: 名宿再临, 3: 宗师归位, 4+: 殿堂神话)
  prestigePoints: number;        // 当前可用名宿声望点数
  lifetimePrestigePoints: number;// 历史累计声望
  difficultyMultiplier: number;  // 当前周目难度系数 (1.0, 1.25, 1.55, 1.90...)
  unlockedPassives: string[];    // 已解锁的天赋ID
  activeModifiers: string[];     // 当前周目启用的肉鸽挑战词条ID
  unlockedEndingIds: string[];   // 已达成的结局ID集合
  totalRunsCompleted: number;    // 完成周目总数
}

export interface WorldTourOpponent {
  floor: number;
  region: 'LCK' | 'LPL' | 'LEC' | 'LCS' | 'LEGEND_BOSS';
  teamName: string;
  captain: string;
  captainAvatar: string;
  bossTitle: string;
  combatPower: number;
  specialGimmick: string;
  rewardPrestige: number;
  isBoss: boolean;
}

export type MerchCosmeticCategory = 'STADIUM' | 'JERSEY' | 'BANNER';

export interface WorldTourMerchItem {
  id: string;
  name: string;
  nameEn: string;
  category: MerchCosmeticCategory;
  costTokens: number; // Prestige Tokens cost
  icon: string;
  badge: string;
  themeColor: string;
  bgGradient: string;
  description: string;
  lore: string;
  perkEffect: string;
  visualPreview: {
    ambientGlow: string;
    accentBorder: string;
    stadiumBanner?: string;
    jerseyPatternStyle?: string;
  };
}

export interface WorldTourState {
  currentFloor: number;
  highestFloorCleared: number;
  seasonRank: number;
  totalTourTrophies: number;
  activeBuffs: string[];
  prestigeTokens?: number; // 稀有名宿巡回代币 (Prestige Tokens)
  unlockedMerchCosmetics?: string[]; // 已解锁周边升级ID
  equippedStadiumTheme?: string; // 当前装配的主场场馆主题
  equippedJerseyPattern?: string; // 当前装配的战队应援战袍纹样
  equippedBanner?: string; // 当前装配的殿堂战旗
}

// ==========================================
// ESPORTS EVENT ENGINE & UNIFIED CALENDAR
// ==========================================

export type SplitType = 'SPRING_SPLIT' | 'MSI' | 'SUMMER_SPLIT' | 'WORLDS' | 'OFF_SEASON';

export interface EsportsEventModifier {
  id: string;
  name: string;
  category: 'META_PATCH' | 'TOURNAMENT' | 'COMMUNITY_HYPE' | 'FATIGUE_CRISIS';
  icon: string;
  description: string;
  startWeek: number;
  endWeek: number;
  lpGainMultiplier: number;     // e.g. 1.25 (+25% LP)
  strainMultiplier: number;     // e.g. 1.20 (RSI strain +20%)
  focusDrainMultiplier: number; // e.g. 1.15
  buffedArchetypes: string[];   // Archetypes that gain bonus combat power
  nerfedArchetypes: string[];   // Archetypes that lose combat power
  flavorNarrative: string;
}

export interface PatchMetaInfo {
  version: string;
  headline: string;
  description: string;
  tierSPlusChamps: string[];  // e.g. ["阿卡丽", "盲僧"]
  tierSChamps: string[];
  nerfedChamps: string[];
  mechanicsBonus: number;     // bonus for playing meta pick
}

export interface EsportsCalendarState {
  seasonYear: number;          // e.g. 2026
  currentSplit: SplitType;     // 当前所处赛季阶段
  currentWeek: number;         // 1 - 26 周
  currentDay: number;          // 1 - 182 天 (每赛季26周*7天)
  splitMatchesPlayed: number;
  splitWins: number;
  splitLosses: number;
  msiQualified: boolean;
  msiCleared: boolean;
  worldsQualified: boolean;
  worldsCleared: boolean;
  activeEventIds: string[];
  currentPatchVersion: string;
  calendarHistoryLog: string[];
}

// ==========================================
// OFF-SEASON TRANSFER WINDOW SYSTEM
// ==========================================

export interface FreeAgentCandidate extends ProPlayer {
  originalTeam: string;
  tier: 'S+' | 'S' | 'A';
  currentHighestBid: number;
  highestBidder: string; // Team name, e.g. "T1", "Gen.G", "JDG", "My Team"
  askingPrice: number;
  isSigned: boolean;
  biddingWarsLog: string[];
}

export interface RivalTeamRoster {
  teamId: string;
  teamName: string;
  region: 'LCK' | 'LPL' | 'LEC' | 'LCS';
  budget: number;
  roster: ProPlayer[];
}

export interface TransferRumor {
  id: string;
  timeAgo: string;
  headline: string;
  hotness: number; // 1 - 5 stars
  verified: boolean;
}

export interface TransferWindowState {
  isOpen: boolean;
  year: number;
  remainingSeconds: number; // Ticking countdown
  freeAgents: FreeAgentCandidate[];
  rivalTeams: RivalTeamRoster[];
  tradeHistory: string[];
  rumors: TransferRumor[];
}

// ==========================================
// GLOBAL PRO POWER RANKINGS SYSTEM
// ==========================================

export interface LegacyLoreEntry {
  id: string;
  title: string;
  seasonEra: string;
  category: 'RIVALRY' | 'DYNASTY_CLASH' | 'MIRACLE_COMEBACK' | 'HISTORIC_MATCH';
  teams: string;
  prestigeMilestoneReq: number;
  unlocked: boolean;
  scoreline: string;
  mvpPlayer: string;
  chronicleLog: string;
  historicalSignificance: string;
  badgeIcon: string;
}

export interface HiddenPotentialStats {
  clutchFactor: number;       // 关键局胜负手 (0-100)
  growthCap: number;          // 极限成长潜力上限 (e.g. 98-100)
  tiltResistance: number;     // 抗压抗崩心态指数 (0-100)
  championMasteryCap?: number; // 英雄池扩张上限 (0-100)
  championMasteryBonus?: number;
  teamfightIQ?: number;        // 团战决策走位嗅觉 (0-100)
  specialTrait?: string;       // 隐藏特质称号
  scoutInsight?: string;       // 深度球探独家评估情报
  scoutVerdict?: string;
}

export interface TeamRosterMember {
  role: 'TOP' | 'JUG' | 'MID' | 'ADC' | 'SUP';
  name: string;
  rating: number;
  signatureHero: string;
  isTradeTarget?: boolean;
  buyoutCost?: number;
  contractYearsRemaining?: number;
  hiddenPotential?: HiddenPotentialStats;
}

export interface TradeTargetPlayer {
  id: string;
  name: string;
  role: 'TOP' | 'JUG' | 'MID' | 'ADC' | 'SUP';
  rating: number;
  team: string;
  buyoutCost: number;
  salaryPerSeason: number;
  willingnessToJoin: number; // 0 - 100%
  status: 'STAR_EXPIRING' | 'TRANSFER_LISTED' | 'UNHAPPY_BENCH' | 'FRANCHISE_CORNERSTONE';
  description: string;
  hiddenPotential?: HiddenPotentialStats;
}

export interface WeeklyRankPoint {
  week: string;        // '第1周', '第2周', '第3周', '第4周', '第5周'
  weekShort: string;   // 'W1', 'W2', 'W3', 'W4', 'W5'
  rank: number;        // 1 - 20
  powerRating: number; // e.g. 98.7
  record?: string;     // e.g. "2-0"
  scoutingNote?: string; // 阶段战术与状态评语
}

export interface GlobalTeamPowerRanking {
  rank: number;
  previousRank: number;
  teamId: string;
  teamName: string;
  shortName: string;
  region: 'LPL' | 'LCK' | 'LEC' | 'LCS';
  logoEmoji: string;
  powerRating: number;
  consistencyScore: number; // 0 - 100
  wins: number;
  losses: number;
  winRate: number;          // %
  streak: string;
  tier: 'S+' | 'S' | 'A+' | 'A';
  playstyle: string;
  strengths: string[];
  tacticalWeakness: string;
  counterTip: string;
  roster: TeamRosterMember[];
  tradeTargets: TradeTargetPlayer[];
  scouted?: boolean;
  rankTrends?: WeeklyRankPoint[];
  rankHistory?: number[];
}

// ----------------------------------------------------
// PHASE 3: LEAGUE EXPANSION DRAFT (年度联赛扩军选秀与保护大会)
// ----------------------------------------------------
export interface SoloQueueProdigy {
  id: string;
  name: string;
  alias: string; // e.g. "国服峡谷巅峰黑马", "韩服1680分路人王"
  role: 'TOP' | 'JUG' | 'MID' | 'ADC' | 'SUP';
  age: number;
  country: string;
  avatar: string;
  mechanics: number; // 86 - 98
  macro: number;     // 80 - 95
  morale: number;    // 85 - 100
  potential: 'S' | 'SS' | 'SSS';
  potentialRating: number; // 94 - 99
  playstyle: PlayerPlaystyle;
  signatureChampion: string; // e.g. "影流之主 劫"
  signatureChampionRole: string; // e.g. "刺客切后排"
  specialTrait: {
    name: string;
    description: string;
    buffLabel: string;
  };
  contractSalary: number; // $8,000 - $15,000
  signingBonus: number;   // $20,000 - $45,000
  scoutingIntel: string;  // Detailed scouting commentary
  soloQueueRank: string;  // e.g. "韩服王者第3名 (1,642 LP)"
  draftUrgency: 'HIGH' | 'EXTREME' | 'EXCLUSIVE';
}

export interface ExpansionDraftHistoryEntry {
  id: string;
  year: number;
  seasonLabel: string; // e.g. "S14 扩军选秀"
  expansionFranchiseName: string; // e.g. "极光新纪元 (Aurora Gaming)"
  protectedPlayerIds: string[];
  protectedPlayerNames: string[];
  draftedProdigy: SoloQueueProdigy;
  poachedPlayerNotice?: string;
  expansionSubsidyGained: number; // 联盟扩军扶持金
  hypeBonusGained: number;
  date: string;
}

export interface ExpansionDraftState {
  currentYear: number;
  lastDraftedYear?: number;
  expansionFranchiseName: string;
  isDraftAvailable: boolean;
  history: ExpansionDraftHistoryEntry[];
}

// ----------------------------------------------------
// PHASE 3: COACHING STAFF (战队教练智囊团与首发被动增益)
// ----------------------------------------------------
export type CoachSpecialization = 'Strategic' | 'Mental' | 'Mechanical';

export interface Coach {
  id: string;
  name: string;
  title: string;
  specialization: CoachSpecialization;
  tier: 'VETERAN' | 'ELITE' | 'LEGENDARY';
  avatar: string;
  country: string;
  age: number;
  philosophy: string;
  hiringCost: number;     // 一次性聘用签约金
  weeklySalary: number;   // 每周薪资支出
  passiveBonuses: {
    mechanics: number;    // 首发微操被动加成
    macro: number;        // 首发大局观被动加成
    morale: number;       // 首发士气被动加成
    tacticalNote: string; // 专属战术特权标签
  };
  hiredAt?: string;
}

export interface CoachingStaffState {
  hiredCoaches: {
    Strategic?: Coach | null;
    Mental?: Coach | null;
    Mechanical?: Coach | null;
  };
  totalHiringSpent: number;
  history?: {
    id: string;
    coachName: string;
    action: 'HIRED' | 'RELEASED';
    specialization: CoachSpecialization;
    timestamp: string;
  }[];
}

// ----------------------------------------------------
// PHASE 3: OPPONENT SCOUTING REPORT & DRAFT TENDENCIES
// ----------------------------------------------------
export interface OpponentScoutingReport {
  teamId: string;
  teamName: string;
  assignedCoachId: string;
  assignedCoachName: string;
  assignedCoachAvatar: string;
  assignedCoachSpecialization: CoachSpecialization;
  scoutedAt: string;
  draftTendency: {
    compStyle: 'HeavyEngage' | 'LateScaling' | 'EarlySnowball' | 'SplitPush' | 'FlexCheesy';
    compStyleLabel: string; // e.g. "强开团体系 (Heavy Engage Comps)"
    styleTag: string;       // e.g. "强开决战"
    description: string;
    engageRating: number;      // 0 - 100
    scalingRating: number;     // 0 - 100
    earlyAggressionRating: number; // 0 - 100
    firstPickPriorities: string[];
    permaBanTargets: string[];
    comfortPicks: { champion: string; role: string; pickRate: string; mastery: string }[];
    draftWeakness: string;
    counterStrategy: string;
    tacticalCounterBuff: string;
    counterWinRateBonus: number; // e.g. 0.14 (+14% win rate against this opponent)
  };
}

// ----------------------------------------------------
// PHASE 3: TEAM DYNAMICS & TACTICAL UNIT CONFIGURATIONS
// ----------------------------------------------------
export interface TacticalUnitConfig {
  id: string;
  name: string;
  label: string;
  description: string;
  recommendedRoles: ('TOP' | 'JGL' | 'MID' | 'ADC' | 'SUP')[];
  assignedPlayerIds: string[];
  tacticalFocus: 'ENGAGE' | 'DAMAGE' | 'VISION_CONTROL' | 'SPLIT_PUSH' | 'PEEL_PROTECT';
  focusLabel: string;
  colorScheme: {
    border: string;
    bg: string;
    text: string;
    glow: string;
  };
}

export interface PlayerPairChemistry {
  player1Id: string;
  player2Id: string;
  chemistryScore: number; // 0 - 100
  chemistryGrade: 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';
  comboTitle: string; // e.g. "天衣无缝 · 中野代练" / "极速收割 · 下路双生"
  synergyBuff: string; // e.g. "+15% 游走击杀率"
  analysis: string; // why they work together
  isComplementary: boolean;
}

export interface TeamDynamicsState {
  currentPresetId: string;
  units: TacticalUnitConfig[];
  totalSynergyScore: number; // 0 - 100
  synergyGrade: 'B' | 'A' | 'S' | 'SS' | 'SSS';
  synergyTitle: string;
  synergyBuffSummary: string;
  pairChemistries: PlayerPairChemistry[];
  lastOptimizedAt?: string;
}
