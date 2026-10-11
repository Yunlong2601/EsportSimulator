import { CareerJournalEntry } from '../types/game';

export const INITIAL_CAREER_JOURNAL_ENTRIES: CareerJournalEntry[] = [
  {
    id: 'journal_debut_001',
    headline: '【创刊号 · 头版头条】横空出世！天才少年网吧五连绝世震撼天梯路人局',
    subheadline: '昨夜艾欧尼亚高分段爆发经典决战，年仅18岁的神秘新秀逆风操刀招牌刺客，以毫秒级操作豪取团灭！',
    date: '2026年3月15日 · 季前赛号外',
    category: 'TOURNAMENT',
    categoryLabel: '【崭露头角】',
    newspaperName: '《全球电竞纪事周报》',
    issueNo: '第 101 期 · 创刊特辑',
    editionTag: '头版头条',
    articleBody: '据本报前线观察员电讯：在昨夜一场汇聚数位退役老将与高分绝活哥的巅峰排位中，编号“宿命先锋”的无名路人以不可思议的连续几何走位躲过致命强开，随后单枪匹马杀入龙坑，瞬秒敌方双C！赛后各大电竞社区论坛热度瞬间登顶，无数玩家发帖惊呼：“此子已有职业级大将之风！”多支战队的青训球探已被证实正紧急调取本场比赛第一视角录像。',
    keyQuote: '“他在最危险的绝境中没有交闪现逃跑，而是算准了对面的所有冷却时间——这就是天生杀手的本能。” —— 知名电竞解说长毛在直播间复盘点评',
    reporter: '本报特约电竞前沿调查员 · 陆子航',
    stampText: '★ 历史开端 ★',
    statImpact: '名声初显 · 吸引3家俱乐部青训营密切关注',
    importance: 'BREAKING',
    photoCaption: '现场抓拍：网吧泛黄的CRT显示器前，一双沉稳而布满老茧的年轻双手正在敲击机械键盘。',
    timestamp: Date.now() - 86400000 * 30
  },
  {
    id: 'journal_streak_002',
    headline: '【号外速递】深夜疯狂十二连胜！神秘宿命先锋直通宗师生死局',
    subheadline: '通宵鏖战十小时滴水未进，连续零封多位职业选手小号，抗压心态获职业教练盛赞。',
    date: '2026年5月22日 · 春季特刊',
    category: 'TITLE',
    categoryLabel: '【天梯风暴】',
    newspaperName: '《召唤师先锋时报》',
    issueNo: '第 238 期 · 深夜加印',
    editionTag: '绝密快讯',
    articleBody: '本报电竞版特别报道：在昨日深夜的天梯冲分狂潮中，“宿命先锋”顶着持续高强度的竞技负荷，连续上演教科书级的线权压制与游走支援。即便在队友前期接连崩盘的绝境局中，依然凭借冷静的战局切割与极限制衡强行将悬念拖入后期终结比赛。职业教练阿布在专访中透露：“这种在连续逆境中永不红温的神经稳定性，是极少数顶级选手才具备的稀缺天赋。”',
    keyQuote: '“比赛还没打到基地爆炸，就没有提前认输的道理。” —— 赛后游戏公屏聊天记录截屏流出',
    reporter: '首席观察员 · 沈清寒',
    stampText: '★ 连胜战报 ★',
    statImpact: '微操+2 / 心态属性突破至职业准入门槛',
    importance: 'MAJOR',
    photoCaption: '数据统计图表：12连胜期间平均参团率达到惊人的 81.4%，KDA 突破 6.5。',
    timestamp: Date.now() - 86400000 * 15
  },
  {
    id: 'journal_interview_003',
    headline: '【深度专访】“我的目标不是成为网红，而是站在首尔总决赛捧起那座金杯”',
    subheadline: '拒绝百万签约金做娱乐主播，毅然坚守每天16小时高强度严苛训练，只为真正的赛场荣光。',
    date: '2026年7月08日 · 盛夏专刊',
    category: 'LIFESTYLE' as any,
    categoryLabel: '【人物特写】',
    newspaperName: '《东方电竞论坛周刊》',
    issueNo: '第 340 期 · 名人特辑',
    editionTag: '独家专访',
    articleBody: '在这间不过十余平米的出租屋内，唯一的装饰是墙上张贴的全球总决赛历届冠军战队全家福海报。面对数家头部直播公会抛来的高额签字费橄榄枝，少年并未动摇。在长达两小时的深入交谈中，他向本报记者展示了记满数十页英雄对线细节与眼位时间轴的泛黄笔记本。这不仅是一个关于天赋的故事，更是一曲献给纯粹热爱的电竞修行者之歌。',
    keyQuote: '“聚光灯熄灭后，唯有你敲下的每一个按键、复盘过的每一个失误，才是你在世界赛决赛第五局的底气。”',
    reporter: '资深主笔 · 顾晓林',
    stampText: '★ 纯粹之心 ★',
    statImpact: '意志力坚定 · 专注度提升至95%上限',
    importance: 'FEATURE',
    photoCaption: '专访附图：密密麻麻写满战术BP草图的草稿纸，边缘已被汗水浸透摩挲。',
    timestamp: Date.now() - 86400000 * 5
  }
];

export function createTitleNewspaperClipping(params: {
  title: string;
  titleEn: string;
  rarity: string;
  titleBonus: string;
  statRequirement: string;
}): CareerJournalEntry {
  const isMythic = params.rarity === 'MYTHIC';
  const headline = isMythic
    ? `【头版特大号外】神话加冕！宿命先锋正式斩获至尊称号「${params.title}」`
    : `【全城快报】荣耀破茧！新星选手解锁传奇称号「${params.title}」震撼电竞圈`;

  return {
    id: `journal_title_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    headline,
    subheadline: `历经无数次生死试炼与汗水浇灌，正式达成「${params.statRequirement}」，实装特权震撼生效！`,
    date: `${new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })} · 荣誉特刊`,
    category: 'TITLE',
    categoryLabel: '【巅峰加冕】',
    newspaperName: '《全球电竞纪事周报》',
    issueNo: `第 ${Math.floor(Math.random() * 200 + 400)} 期 · 荣誉专刊`,
    editionTag: isMythic ? '头版头条' : '号外头条',
    articleBody: `今日电竞纪元迎来重大里程碑时刻！权威电竞荣誉殿堂正式确认，选手「宿命先锋」成功攻克极为苛刻的竞技指标（${params.statRequirement}），以极高的竞技统治力荣获「${params.title} (${params.titleEn})」至高称号。该称号将赋予选手强大的赛场实机属性特权（${params.titleBonus}）。国内外数十家权威电竞赛事媒体争相报道这一振奋人心的突破！`,
    keyQuote: `“这不仅是一个虚名，而是在无数个凌晨四点无人问津的练习里，用千锤百炼铸就的王冠勋章。” —— 国际电竞评委团授勋评语`,
    reporter: '荣誉殿堂特派记录官 · 陆子航',
    stampText: '★ 称号证实 ★',
    statImpact: params.titleBonus,
    importance: isMythic ? 'BREAKING' : 'MAJOR',
    photoCaption: `荣誉现场：金色光华流转的称号徽记「${params.title}」正式镶嵌于选手生涯履历头版！`,
    timestamp: Date.now()
  };
}

export function createAgentNewspaperClipping(params: {
  agentName: string;
  agentTitle: string;
  tier: number;
  perkDescription: string;
  agencyCost: number;
}): CareerJournalEntry {
  const tierName = params.tier >= 3 ? '顶级豪门合伙人' : params.tier === 2 ? '资深王牌掌门人' : '职业新锐领航者';

  return {
    id: `journal_agent_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    headline: `【商业版头版】重磅签约！${params.agentName}出任个人专属商务经纪人`,
    subheadline: `电竞商业版图全面开拓！${tierName}正式加盟智囊团，商业估值迎来几何级爆发。`,
    date: `${new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })} · 商业周刊`,
    category: 'AGENT',
    categoryLabel: '【经纪风云】',
    newspaperName: '《电竞财富与商业观察》',
    issueNo: `第 ${Math.floor(Math.random() * 150 + 300)} 期 · 商务特刊`,
    editionTag: '独家披露',
    articleBody: `本报商业前线突发快讯：在历经多轮私密洽谈后，业界享负盛誉的知名电竞经纪人【${params.agentName}】（头衔：${params.agentTitle}）已正式完成签约，全面接管选手的商业代言、品牌赞助及肖像权开发业务。业内人士分析，此次强强联手将全面释放选手的场外变现潜能（专属特权：${params.perkDescription}），标志着选手从纯粹的赛场竞技者蜕变为具备极高商业影响力的超级电竞IP。`,
    keyQuote: `“我们看重的不仅是他在赛场上的连胜战绩，更是其无与伦比的冠军气场与商业号召力。” —— 经纪人${params.agentName}在签约发布会上表示`,
    reporter: '商业版首席记者 · 钱万山',
    stampText: '★ 签约落定 ★',
    statImpact: params.perkDescription,
    importance: 'MAJOR',
    photoCaption: `签约仪式特写：双方在厚重的烫金商业授权协议书上郑重落笔，握手致意。`,
    timestamp: Date.now()
  };
}

export function createRivalDuelNewspaperClipping(params: {
  rivalName: string;
  rivalTeam?: string;
  outcome: 'WIN' | 'LOSS';
  score?: string;
  tensionAfter: number;
  highlightAction: string;
}): CareerJournalEntry {
  const isWin = params.outcome === 'WIN';
  const headline = isWin
    ? `【宿怨清算】鏖战到底！宿命先锋力斩死敌【${params.rivalName}】赢下尊严生死战`
    : `【巅峰惜败】河道修罗！死敌【${params.rivalName}】险胜一着，宿怨怒火再度升级`;

  return {
    id: `journal_rival_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    headline,
    subheadline: isWin
      ? `全场屏息！决胜团战一击制敌破局，${params.highlightAction}，彻底终结宿敌嚣张气焰！`
      : `虽败犹荣！终极碰撞双方血量均降至冰点，宿怨张力狂飙至 ${params.tensionAfter}%，约定再战！`,
    date: `${new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })} · 焦点战报`,
    category: 'RIVAL_DUEL',
    categoryLabel: '【宿敌对决】',
    newspaperName: '《召唤师竞技报 · 战术内参》',
    issueNo: `第 ${Math.floor(Math.random() * 300 + 500)} 期 · 恩怨加急`,
    editionTag: isWin ? '轰动快报' : '战况特急',
    articleBody: `火星撞地球！在万众瞩目的电竞宿敌恩怨清算对决中，宿命先锋与命中注定的苦主宿敌【${params.rivalName}】展开了长达数十分钟的极限微操拉扯。从对线期的每一次补刀试探，到中后期河道盲视野的心理博弈，火药味浓烈到令人窒息！${params.highlightAction}。赛后各大平台直播间弹幕爆炸，粉丝与解说集体惊呼这是“本赛季最令人血脉偾张的宿命之争”。`,
    keyQuote: isWin
      ? `“赢了就是赢了，下一次交手，我依然会毫不留情地击穿他的防线。” —— 宿命先锋赛后接受全场MVP采访发言`
      : `“胜负常有，但恩怨未了。下一次，我必会在万众瞩目下夺回属于我的一切！” —— 赛后离场时选手眼神坚毅`,
    reporter: '赛事特派记者 · 魏烈',
    stampText: isWin ? '★ 宿怨清算 ★' : '★ 战意未熄 ★',
    statImpact: isWin ? 'LP巨幅加成 / 宿怨压制力大幅飙升' : '宿怨张力激增，复仇烈焰燃起',
    importance: 'BREAKING',
    photoCaption: `赛后画面：水晶枢纽爆裂的刺目强光下，两位宿敌对视的目光中燃烧着永不熄灭的战意。`,
    timestamp: Date.now()
  };
}

export function createTrophyNewspaperClipping(params: {
  trophyName: string;
  seasonName: string;
  flavorDetail: string;
}): CareerJournalEntry {
  return {
    id: `journal_trophy_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    headline: `【世纪头条】金色雨落漫天！宿命先锋率队登顶加冕「${params.trophyName}」`,
    subheadline: `首尔高尺巨蛋万众欢呼震天动地！BO5决胜局逆天翻盘，新一代王朝传奇正式宣告诞生！`,
    date: `${new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })} · 冠军特号`,
    category: 'TOURNAMENT',
    categoryLabel: '【世界之巅】',
    newspaperName: '《全球电竞纪事周报》',
    issueNo: '第 999 期 · 夺冠全球典藏特刊',
    editionTag: '号外头条',
    articleBody: `金色的彩带如梦幻之雨倾盆洒下！在今夜落幕的最高殿堂总决赛中，宿命先锋在决胜局陷入绝境的不利局面下，力挽狂澜！${params.flavorDetail}。当敌方基地水晶爆裂的一刹那，全场数万名狂热观众起立高呼新王的名字！召唤师奖杯在聚光灯下熠熠生辉，这一夜注定将被永远镌刻在世界电竞史册的扉页！`,
    keyQuote: `“我们曾经摔倒在谷底，但从未怀疑过自己能站在世界之巅。这是属于每一个不屈灵魂的奇迹！” —— 捧杯获奖感言`,
    reporter: '本报总编辑 · 林晨',
    stampText: '★ 登顶世界 ★',
    statImpact: '名宿声望+500 / 解锁全球至尊冠军特权',
    importance: 'BREAKING',
    photoCaption: `定格历史：五位队员高高举起沉重的召唤师之杯，金色的光柱照亮泪流满面的少年笑颜。`,
    timestamp: Date.now()
  };
}
