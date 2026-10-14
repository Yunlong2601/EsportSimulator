import React, { useState, useMemo } from 'react';
import { 
  Newspaper, 
  Search, 
  Calendar, 
  Sparkles, 
  Award, 
  UserCheck, 
  Swords, 
  Trophy, 
  Share2, 
  Bookmark, 
  X, 
  ChevronRight, 
  Flame, 
  ExternalLink,
  PenTool,
  Clock,
  Printer
} from 'lucide-react';
import { CareerJournalEntry, CareerJournalCategory } from '../types/game';
import { soundEngine } from '../utils/audio';

interface CareerJournalViewProps {
  entries: CareerJournalEntry[];
  onAddEntry?: (entry: CareerJournalEntry) => void;
  playerStats?: any;
}

export const CareerJournalView: React.FC<CareerJournalViewProps> = ({
  entries,
  onAddEntry,
  playerStats
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CareerJournalCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [readingEntry, setReadingEntry] = useState<CareerJournalEntry | null>(null);
  const [showInterviewModal, setShowInterviewModal] = useState<boolean>(false);
  const [interviewTopic, setInterviewTopic] = useState<'grind' | 'rival' | 'dream'>('grind');
  const [interviewQuote, setInterviewQuote] = useState<string>('');
  const [savedClippingIds, setSavedClippingIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('esports_bookmarked_clippings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundEngine.playClick();
    setSavedClippingIds(prev => {
      const updated = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try {
        localStorage.setItem('esports_bookmarked_clippings', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const filteredEntries = useMemo(() => {
    return entries.filter(item => {
      const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchQuery = 
        !searchQuery.trim() ||
        item.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.articleBody.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.keyQuote.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.newspaperName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [entries, selectedCategory, searchQuery]);

  const breakingCount = entries.filter(e => e.importance === 'BREAKING').length;

  const handlePublishInterview = () => {
    if (!onAddEntry) return;
    soundEngine.playClick();
    soundEngine.playVictory();

    const topicMap = {
      grind: {
        headline: '【驻地特写】电竞修行者的独白：在无声的深夜里与自我博弈',
        subheadline: '面对无数次重复的补刀与技能弹道，宿命先锋展现出令人动容的职业赤诚。',
        quote: interviewQuote.trim() || '“枯燥是天才的第一道门槛，耐得住寂寞才能守得住王冠。”',
        category: 'LIFESTYLE' as any,
        impact: '专注度+10% / 粉丝口碑全面提升'
      },
      rival: {
        headline: '【犀利对话】直面宿怨漩涡：“我们不需要言语和解，赛场即是终极判决”',
        subheadline: '针对近期发酵的宿敌对决争议，选手首度公开发声，引爆各大平台舆论热潮。',
        quote: interviewQuote.trim() || '“所有的恩怨情仇，都将在水晶枢纽前清算干净。”',
        category: 'RIVAL_DUEL' as any,
        impact: '宿怨战意拉满 / 下场对决专注度提升'
      },
      dream: {
        headline: '【前沿专刊】向世界赛宣战！“我要把赛区的名字再次刻在至高奖杯上”',
        subheadline: '在出征倒计时的重磅专访中，宿命先锋目光如炬，立下军令状誓夺召唤师之杯。',
        quote: interviewQuote.trim() || '“金色雨不为犹豫者落下，只为敢于粉碎一切的决胜者盛开。”',
        category: 'TOURNAMENT' as any,
        impact: '全队士气+15 / 赛区关注度飙升'
      }
    };

    const chosen = topicMap[interviewTopic];

    const newEntry: CareerJournalEntry = {
      id: `interview_${Date.now()}`,
      headline: chosen.headline,
      subheadline: chosen.subheadline,
      date: `${new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })} · 独家特刊`,
      category: chosen.category,
      categoryLabel: '【深度专访】',
      newspaperName: '《全球电竞纪事周报》',
      issueNo: `第 ${Math.floor(Math.random() * 200 + 450)} 期 · 头条专刊`,
      editionTag: '独家专访',
      articleBody: `在经过数周的高密度封闭备战后，本报特约专栏作家独家专访了目前竞技状态火热的选手宿命先锋。在长达两小时的敞开心扉畅谈中，选手详细回顾了从初出茅庐的网吧高分路人到如今举足轻重的赛场战术核心的心路历程。无论外界赞誉还是质疑，少年的目光始终专注如初。正如他所言，真正强大的选手，早已学会用赛场上的每一次击杀与胜利，为自己写下最具说服力的答卷。`,
      keyQuote: chosen.quote,
      reporter: '深度特稿部主任 · 林晨',
      stampText: '★ 独家首发 ★',
      statImpact: chosen.impact,
      importance: 'BREAKING',
      photoCaption: '本报独家抓拍：训练室柔和的夜灯下，选手双手托腮静思战术大局。',
      timestamp: Date.now()
    };

    onAddEntry(newEntry);
    setShowInterviewModal(false);
    setInterviewQuote('');
  };

  return (
    <div className="space-y-4 font-sans text-stone-900 select-none">
      
      {/* Retro Broadsheet Masthead Banner */}
      <div className="bg-[#f7f2e5] border-2 border-stone-800 rounded-xl p-3 sm:p-5 shadow-md relative overflow-hidden">
        {/* Subtle Paper Grain Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

        {/* Vintage Top Rule Line */}
        <div className="flex items-center justify-between text-[10px] sm:text-xs text-stone-600 border-b border-stone-400 pb-1 font-mono tracking-widest uppercase">
          <span>国内统一刊号: CN-ESP-2026</span>
          <span className="font-bold text-stone-800">以热爱致敬巅峰 · 以键盘铭刻不朽</span>
          <span>今日出版: 8版 · 创刊典藏</span>
        </div>

        {/* Main Newspaper Name Header */}
        <div className="text-center py-2 sm:py-3 border-b-2 border-stone-800">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm font-serif font-black text-stone-700 tracking-widest hidden sm:inline">
              ★ ESPORTS CHRONICLE ★
            </span>
            <h1 className="text-2xl sm:text-4xl font-serif font-extrabold text-stone-950 tracking-wider drop-shadow-sm font-['Songti_SC','Noto_Serif_SC','SimSun',serif]">
              全球电竞纪事周报
            </h1>
            <span className="text-xs sm:text-sm font-serif font-black text-stone-700 tracking-widest hidden sm:inline">
              ★ 创刊号外头条 ★
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-stone-600 italic font-serif mt-0.5">
            The Official Chronicle of Legendary Summoners & Competitive History
          </p>
        </div>

        {/* Dateline & Issue Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] sm:text-xs text-stone-700 font-mono border-b border-stone-300 pb-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-bold">
              <Calendar className="w-3.5 h-3.5 text-stone-700" />
              纪元第 3 赛季 · 创刊特号
            </span>
            <span className="text-stone-400">|</span>
            <span>总计收录号外: <strong className="text-stone-900 font-bold">{entries.length}</strong> 篇</span>
            <span className="text-stone-400">|</span>
            <span className="text-red-700 font-bold">头版特大快讯: {breakingCount} 篇</span>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              setShowInterviewModal(true);
            }}
            className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 active:scale-95 text-[#fdfbf7] text-[11px] font-sans font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm ml-auto"
          >
            <PenTool className="w-3.5 h-3.5 text-amber-300" />
            <span>连线专访 · 刊发独家特稿</span>
          </button>
        </div>

        {/* Editorial Sub-banner */}
        <div className="mt-2 text-[11px] text-stone-600 italic font-serif flex items-center justify-between">
          <span>“本报全程真实记录选手从网吧单排、签约经纪人、斩落宿敌到世界赛登顶的重大人生转折点。”</span>
          <span className="text-[10px] not-italic font-mono bg-stone-300/60 px-1.5 py-0.5 rounded text-stone-700">
            自动实时编入史册
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-[#f5efe0] p-2.5 rounded-xl border border-stone-400 text-xs shadow-inner">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'ALL' as CareerJournalCategory, label: '全部剪报', icon: Newspaper },
            { id: 'TITLE' as CareerJournalCategory, label: '巅峰加冕', icon: Award },
            { id: 'AGENT' as CareerJournalCategory, label: '经纪风云', icon: UserCheck },
            { id: 'RIVAL_DUEL' as CareerJournalCategory, label: '宿敌对决', icon: Swords },
            { id: 'TOURNAMENT' as CareerJournalCategory, label: '赛场史诗', icon: Trophy },
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedCategory(tab.id);
                }}
                className={`px-2.5 py-1.5 rounded-lg font-serif font-bold flex items-center gap-1 transition cursor-pointer whitespace-nowrap text-xs ${
                  isSelected
                    ? 'bg-stone-800 text-[#f7f2e5] shadow-sm'
                    : 'text-stone-700 hover:bg-stone-300/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[180px] sm:w-56">
          <Search className="w-3.5 h-3.5 text-stone-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="检索历史快报关键词..."
            className="w-full bg-[#fdfbf7] border border-stone-400 rounded-lg pl-8 pr-3 py-1 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-600 font-serif"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Retro Newspaper Clippings Grid / List */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="bg-[#fbf8ee] border-2 border-dashed border-stone-400 rounded-xl p-8 text-center text-stone-600 font-serif space-y-2">
            <Newspaper className="w-10 h-10 text-stone-400 mx-auto" />
            <p className="font-bold text-sm">暂无符合该分类的报纸剪报</p>
            <p className="text-xs text-stone-500">
              继续在赛场中达成里程碑称号、签约经纪人或击败宿敌，报社将为您自动印发更多号外！
            </p>
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const isBookmarked = savedClippingIds.includes(entry.id);
            const isBreaking = entry.importance === 'BREAKING';

            return (
              <div
                key={entry.id}
                onClick={() => {
                  soundEngine.playClick();
                  setReadingEntry(entry);
                }}
                className="bg-[#fdfbf7] hover:bg-[#faf5e8] border-2 border-stone-800 rounded-xl p-3.5 sm:p-5 shadow-[3px_3px_0px_rgba(40,40,40,0.85)] hover:shadow-[5px_5px_0px_rgba(40,40,40,0.95)] transition-all duration-150 cursor-pointer relative overflow-hidden group"
              >
                {/* Vintage Washi Tape / Pin Decorator at top */}
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-amber-200/80 border border-amber-300 shadow-xs rotate-[-1deg] pointer-events-none" />

                {/* Rubber Ink Stamp (Top Right) */}
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 pointer-events-none select-none z-10">
                  <div className={`px-2 py-0.5 rounded border-2 font-serif font-black text-[11px] sm:text-xs tracking-wider uppercase rotate-[-6deg] opacity-85 shadow-xs ${
                    entry.category === 'TITLE'
                      ? 'border-red-700 text-red-700 bg-red-100/40'
                      : entry.category === 'RIVAL_DUEL'
                      ? 'border-purple-800 text-purple-800 bg-purple-100/40'
                      : entry.category === 'AGENT'
                      ? 'border-amber-800 text-amber-800 bg-amber-100/40'
                      : 'border-blue-800 text-blue-800 bg-blue-100/40'
                  }`}>
                    {entry.stampText}
                  </div>
                </div>

                {/* Newspaper Source & Dateline Header */}
                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-stone-500 font-mono border-b border-stone-300 pb-1.5 mb-2.5">
                  <span className="font-bold text-stone-800 font-serif">{entry.newspaperName}</span>
                  <span>•</span>
                  <span>{entry.issueNo}</span>
                  <span>•</span>
                  <span>{entry.date}</span>
                  {isBreaking && (
                    <span className="ml-2 px-1.5 py-0.2 rounded bg-red-700 text-white font-bold font-sans text-[10px] animate-pulse">
                      号外特急
                    </span>
                  )}
                </div>

                {/* Headline Section */}
                <div className="pr-16 sm:pr-24">
                  <h3 className="text-base sm:text-lg font-serif font-black text-stone-950 leading-snug tracking-tight group-hover:text-amber-900 transition font-['Songti_SC','Noto_Serif_SC','SimSun',serif]">
                    {entry.headline}
                  </h3>
                  <p className="text-xs sm:text-sm font-serif text-stone-700 italic mt-1 leading-relaxed">
                    {entry.subheadline}
                  </p>
                </div>

                {/* Journal Article Preview Snippet with Column border */}
                <div className="mt-3 pt-2.5 border-t border-stone-300 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2 text-xs text-stone-800 font-serif leading-relaxed line-clamp-3">
                    {entry.articleBody}
                  </div>

                  {/* Pull Quote Box */}
                  <div className="p-2 rounded bg-[#f4ebd0] border-l-2 border-stone-700 text-[11px] text-stone-800 font-serif italic flex flex-col justify-between">
                    <p className="line-clamp-3">
                      “{entry.keyQuote.replace(/^[“”]|["”]$/g, '')}”
                    </p>
                    <span className="text-[10px] text-stone-500 font-mono text-right mt-1 not-italic">
                      — {entry.reporter}
                    </span>
                  </div>
                </div>

                {/* Bottom Footer: Stats Impact & Actions */}
                <div className="mt-3 pt-2 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  {entry.statImpact && (
                    <div className="flex items-center gap-1.5 text-stone-700 font-mono bg-stone-200/70 px-2 py-0.5 rounded border border-stone-300">
                      <Sparkles className="w-3 h-3 text-amber-700" />
                      <span>实装影响: <strong>{entry.statImpact}</strong></span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={(e) => toggleBookmark(entry.id, e)}
                      className={`p-1 rounded text-stone-500 hover:text-stone-900 transition ${
                        isBookmarked ? 'text-amber-700' : ''
                      }`}
                      title={isBookmarked ? '已收藏剪报' : '收藏此剪报'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>

                    <span className="text-stone-800 font-serif font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition">
                      <span>阅读特刊全文</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Full Retro Newspaper Clipping Reader Modal */}
      {readingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#fcf9ee] border-4 border-stone-800 rounded-xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative text-stone-900 font-serif">
            
            {/* Vintage Top Navigation Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#f0e8d0] border-b-2 border-stone-800">
              <div className="flex items-center gap-2 text-xs font-mono text-stone-700">
                <Newspaper className="w-4 h-4 text-stone-800" />
                <span className="font-bold">{readingEntry.newspaperName}</span>
                <span>•</span>
                <span>{readingEntry.issueNo}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => toggleBookmark(readingEntry.id, e)}
                  className={`px-2 py-1 rounded text-xs font-sans font-bold flex items-center gap-1 border border-stone-400 bg-[#fdfbf7] ${
                    savedClippingIds.includes(readingEntry.id) ? 'text-amber-800 border-amber-600' : 'text-stone-700'
                  }`}
                >
                  <Bookmark className={`w-3 h-3 ${savedClippingIds.includes(readingEntry.id) ? 'fill-current' : ''}`} />
                  <span>{savedClippingIds.includes(readingEntry.id) ? '已收藏剪报' : '收藏剪报'}</span>
                </button>
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setReadingEntry(null);
                  }}
                  className="p-1 rounded text-stone-600 hover:text-stone-950 hover:bg-stone-300 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Newspaper Broadsheet Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-4 overscroll-contain">
              
              {/* Masthead Banner inside reader */}
              <div className="border-b-2 border-stone-800 pb-3 text-center space-y-1">
                <div className="text-[10px] font-mono tracking-widest text-stone-600 uppercase">
                  {readingEntry.date} • {readingEntry.categoryLabel}
                </div>
                <h2 className="text-xl sm:text-2xl font-serif font-black text-stone-950 leading-snug tracking-tight font-['Songti_SC','Noto_Serif_SC','SimSun',serif]">
                  {readingEntry.headline}
                </h2>
                <p className="text-xs sm:text-sm font-serif italic text-stone-700 max-w-xl mx-auto">
                  {readingEntry.subheadline}
                </p>
              </div>

              {/* Stamped Certification Banner */}
              <div className="flex items-center justify-between p-2.5 rounded bg-[#f4ebd0] border border-stone-400 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded border border-red-700 text-red-800 font-bold font-serif text-[11px] bg-red-100/50">
                    {readingEntry.stampText}
                  </span>
                  <span className="font-mono text-[11px] text-stone-600">
                    采写记者: {readingEntry.reporter}
                  </span>
                </div>
                {readingEntry.statImpact && (
                  <span className="text-[11px] font-mono text-emerald-800 font-bold">
                    ✓ {readingEntry.statImpact}
                  </span>
                )}
              </div>

              {/* Article Main Text (Multi-Column Format) */}
              <div className="space-y-3.5 text-xs sm:text-sm font-serif text-stone-900 leading-relaxed sm:columns-2 sm:gap-6 text-justify">
                <p className="first-letter:text-3xl first-letter:font-black first-letter:float-left first-letter:mr-1.5 first-letter:text-stone-950">
                  {readingEntry.articleBody}
                </p>
              </div>

              {/* Pull-Quote Blockquote */}
              <div className="my-4 p-3.5 rounded-lg bg-[#f0e7cb] border-l-4 border-stone-800 shadow-xs">
                <p className="text-xs sm:text-sm italic font-serif text-stone-950 leading-relaxed">
                  “{readingEntry.keyQuote.replace(/^[“”]|["”]$/g, '')}”
                </p>
                <div className="text-right text-[11px] font-mono text-stone-600 mt-1.5">
                  —— 专栏采写档案记录
                </div>
              </div>

              {/* Photo Caption Box */}
              {readingEntry.photoCaption && (
                <div className="p-3 bg-[#f5efe0] border border-stone-400 rounded-lg text-[11px] font-mono text-stone-600 flex items-start gap-2">
                  <div className="w-4 h-4 rounded bg-stone-300 flex items-center justify-center shrink-0 text-stone-700 font-bold text-[10px]">
                    图
                  </div>
                  <div>{readingEntry.photoCaption}</div>
                </div>
              )}
            </div>

            {/* Bottom Modal Bar */}
            <div className="px-4 py-3 bg-[#f0e8d0] border-t-2 border-stone-800 flex items-center justify-between text-xs font-mono text-stone-600">
              <span>剪报已永久归档于选手生涯档案库</span>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setReadingEntry(null);
                }}
                className="px-4 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-[#f7f2e5] font-sans font-bold transition"
              >
                合上报纸
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Press Interview Modal */}
      {showInterviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#fcf9ee] border-2 border-stone-800 rounded-xl w-full max-w-lg p-5 shadow-2xl relative font-serif text-stone-900 space-y-3.5">
            <div className="flex items-center justify-between border-b border-stone-400 pb-2">
              <div className="flex items-center gap-2">
                <PenTool className="w-5 h-5 text-stone-800" />
                <h3 className="text-base font-bold font-serif text-stone-950">
                  刊发独家专栏专访 · 《全球电竞纪事周报》
                </h3>
              </div>
              <button
                onClick={() => setShowInterviewModal(false)}
                className="p-1 rounded text-stone-500 hover:text-stone-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              作为赛场焦点的明星选手，您可以接受特约主笔专访，在头版发表个人宣言，激发全队士气与赛场属性！
            </p>

            {/* Topic selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold font-sans text-stone-800">选择专访主题方向:</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'grind', label: '苦练心路', desc: '专注度+10%' },
                  { id: 'rival', label: '回应宿怨', desc: '战意激发+15%' },
                  { id: 'dream', label: '夺冠宣言', desc: '全队士气+15' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setInterviewTopic(opt.id as any)}
                    className={`p-2 rounded-lg border text-left transition cursor-pointer ${
                      interviewTopic === opt.id
                        ? 'border-stone-800 bg-stone-800 text-[#f7f2e5]'
                        : 'border-stone-300 bg-[#fdfbf7] text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    <div className="font-bold">{opt.label}</div>
                    <div className="text-[10px] opacity-80">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Quote Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold font-sans text-stone-800">选手原声发言 (可选，留空将由主笔润色):</label>
              <textarea
                value={interviewQuote}
                onChange={(e) => setInterviewQuote(e.target.value)}
                placeholder="例如：所有的冷眼与汗水，都是为了金色雨落下的那一刻..."
                rows={3}
                className="w-full bg-[#fdfbf7] border border-stone-400 rounded-lg p-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-700 font-serif"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-300">
              <button
                onClick={() => setShowInterviewModal(false)}
                className="px-3 py-1.5 rounded text-xs font-sans text-stone-600 hover:text-stone-900"
              >
                取消
              </button>
              <button
                onClick={handlePublishInterview}
                className="px-4 py-1.5 rounded bg-stone-800 hover:bg-stone-700 active:scale-95 text-[#f7f2e5] font-sans font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>付印刊发特刊</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
