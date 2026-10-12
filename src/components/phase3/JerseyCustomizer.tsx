import React, { useState, useMemo } from 'react';
import { 
  Palette, 
  Sparkles, 
  Shield, 
  Layers, 
  Hash, 
  Type, 
  CheckCircle2, 
  Flame, 
  Award, 
  DollarSign, 
  TrendingUp, 
  Shirt, 
  RefreshCw,
  Eye,
  Sliders,
  Crown,
  Zap,
  Users
} from 'lucide-react';
import { 
  DynastyState, 
  JerseyCustomizerConfig, 
  JerseyPatternType, 
  JerseyCrestType, 
  JerseyPriceTier,
  ProPlayer
} from '../../types/game';
import { 
  JERSEY_PATTERNS, 
  JERSEY_CRESTS, 
  JERSEY_COLOR_PRESETS, 
  PRICE_TIERS,
  INITIAL_JERSEY_CONFIG 
} from '../../data/merchData';
import { calculatePlayerPopularityScore } from '../../utils/merchSalesManager';
import { soundEngine } from '../../utils/audio';

interface JerseyCustomizerProps {
  dynasty: DynastyState;
  onUpdateDynasty: React.Dispatch<React.SetStateAction<DynastyState>>;
  onSavedNotice?: (msg: string) => void;
}

export const JerseyCustomizer: React.FC<JerseyCustomizerProps> = ({
  dynasty,
  onUpdateDynasty,
  onSavedNotice
}) => {
  const currentConfig: JerseyCustomizerConfig = dynasty.merchShop?.jerseyConfig || INITIAL_JERSEY_CONFIG;
  const [config, setConfig] = useState<JerseyCustomizerConfig>(currentConfig);
  const [activeSection, setActiveSection] = useState<'colors' | 'patterns' | 'crest' | 'details' | 'pricing'>('colors');
  const [viewAngle, setViewAngle] = useState<'front' | 'back'>('front');
  const [isSaved, setIsSaved] = useState(false);

  const startingRoster = (dynasty.roster || []).slice(0, 5);
  const popularityData = useMemo(() => calculatePlayerPopularityScore(startingRoster), [startingRoster]);

  // Compute live hype score and projected sales
  const liveHypeScore = useMemo(() => {
    let base = 60;
    const pat = JERSEY_PATTERNS.find(p => p.id === config.pattern);
    if (pat) base += pat.hypeBoost;

    const crest = JERSEY_CRESTS.find(c => c.id === config.crestDesign);
    if (crest) base += crest.bonusHype;

    if (config.starSignaturePlayerName) base += 12;
    if (config.sleevePatch !== 'none') base += 6;
    if (config.priceTier === 'collector_golden_box') base += 10;
    return Math.min(100, Math.round(base));
  }, [config]);

  const priceInfo = PRICE_TIERS[config.priceTier] || PRICE_TIERS.pro_player_edition;
  const projectedWeeklyUnits = Math.round(280 * (priceInfo.salesVolumeRate || 1.0) * (liveHypeScore / 80) * popularityData.signatureMultiplier);
  const projectedWeeklyRevenue = projectedWeeklyUnits * priceInfo.retailPrice;

  // Handle Save
  const handleSaveJersey = () => {
    soundEngine.playLevelUp();
    const finalConfig: JerseyCustomizerConfig = {
      ...config,
      hypeScore: liveHypeScore,
      unitRetailPrice: priceInfo.retailPrice,
      productionUnitCost: priceInfo.unitCost
    };

    onUpdateDynasty(prev => {
      const prevShop = prev.merchShop || {
        jerseyConfig: finalConfig,
        catalog: [],
        salesHistory: [],
        totalLifetimeMerchRevenue: 0,
        totalJerseysSold: 0,
        currentHypeLevel: 80,
        lastSettlementWeek: 1
      };

      // update the JERSEY item in catalog
      const updatedCatalog = (prevShop.catalog || []).map(item => {
        if (item.category === 'JERSEY') {
          return {
            ...item,
            retailPrice: priceInfo.retailPrice,
            unitCost: priceInfo.unitCost,
            name: `${finalConfig.editionName} (${finalConfig.customGamertag || '官方战袍'})`
          };
        }
        return item;
      });

      return {
        ...prev,
        merchShop: {
          ...prevShop,
          jerseyConfig: finalConfig,
          catalog: updatedCatalog,
          currentHypeLevel: Math.max(prevShop.currentHypeLevel || 75, liveHypeScore)
        }
      };
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
    if (onSavedNotice) {
      onSavedNotice(`✅ 定制战袍设计已成功入库！全平台官方周边商城已同步上架销售。`);
    }
  };

  // Select Preset Palette
  const handleSelectPalette = (preset: typeof JERSEY_COLOR_PRESETS[0]) => {
    soundEngine.playClick();
    setConfig(prev => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent
    }));
  };

  return (
    <div className="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-3 sm:p-5 shadow-xl space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-pink-500 flex items-center justify-center text-slate-950 shadow-md">
            <Shirt className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-tech font-extrabold text-base text-white">
                战队定制战袍工坊 (Team Jersey Studio)
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-code font-bold flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400" />
                吸金指数 {liveHypeScore} / 100
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans">
              自由定制主客场配色、高科技纹理、战队图腾徽章与明星选手亲笔联名签名
            </p>
          </div>
        </div>

        {/* View Angle Toggle & Save Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="p-0.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center">
            <button
              onClick={() => {
                soundEngine.playClick();
                setViewAngle('front');
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-tech font-bold transition cursor-pointer ${
                viewAngle === 'front'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              正面 (Front)
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                setViewAngle('back');
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-tech font-bold transition cursor-pointer ${
                viewAngle === 'back'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              后背 (Back)
            </button>
          </div>

          <button
            onClick={handleSaveJersey}
            className={`px-4 py-2 rounded-xl font-tech font-extrabold text-xs uppercase cursor-pointer transition shadow-lg flex items-center gap-1.5 active:scale-95 ${
              isSaved
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/25'
            }`}
          >
            {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            <span>{isSaved ? '已定型量产！' : '定型量产上架'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Area: Left Vector Preview, Right Control Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT: Graphical Jersey Canvas Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full relative rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900/90 to-slate-950 border-2 border-indigo-500/30 p-4 shadow-2xl flex flex-col items-center justify-center overflow-hidden min-h-[360px]">
            {/* Background Studio Grid & Ambient Glow */}
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 50% 40%, ${config.accentColor} 0%, transparent 70%)`
              }}
            />

            {/* Top Badge: Edition & Price */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
              <span className="text-[9px] px-2 py-0.5 rounded-lg bg-slate-950/80 backdrop-blur border border-slate-700 font-tech font-bold text-amber-300">
                {priceInfo.name.split(' ')[0]}
              </span>
              <span className="text-[10px] font-code font-black text-cyan-300 bg-slate-950/80 px-2 py-0.5 rounded-lg border border-cyan-500/30">
                ${priceInfo.retailPrice}
              </span>
            </div>

            {/* SVG Interactive Jersey Vector Rendering */}
            <div className="relative w-64 h-72 sm:w-72 sm:h-80 flex items-center justify-center transition-all duration-300 drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]">
              <svg
                viewBox="0 0 300 320"
                className="w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Pattern 1: Carbon Fiber */}
                  <pattern id="pat-carbon" width="8" height="8" patternUnits="userSpaceOnUse">
                    <rect width="8" height="8" fill={config.primaryColor} />
                    <path d="M0,0 L8,8 M0,4 L4,8 M4,0 L8,4" stroke="#ffffff" strokeWidth="0.8" opacity="0.16" />
                    <path d="M0,8 L8,0 M0,4 L4,0 M4,8 L8,4" stroke="#000000" strokeWidth="0.8" opacity="0.3" />
                  </pattern>

                  {/* Pattern 2: Neon Grid */}
                  <pattern id="pat-neongrid" width="16" height="16" patternUnits="userSpaceOnUse">
                    <rect width="16" height="16" fill={config.primaryColor} />
                    <line x1="0" y1="0" x2="16" y2="0" stroke={config.secondaryColor} strokeWidth="0.75" opacity="0.4" />
                    <line x1="0" y1="0" x2="0" y2="16" stroke={config.secondaryColor} strokeWidth="0.75" opacity="0.4" />
                    <circle cx="8" cy="8" r="1" fill={config.accentColor} opacity="0.7" />
                  </pattern>

                  {/* Pattern 3: Cyber Stripes */}
                  <pattern id="pat-stripes" width="24" height="24" patternUnits="userSpaceOnUse">
                    <rect width="24" height="24" fill={config.primaryColor} />
                    <polygon points="0,0 12,0 24,24 12,24" fill={config.secondaryColor} opacity="0.22" />
                    <line x1="2" y1="0" x2="14" y2="24" stroke={config.accentColor} strokeWidth="1.2" opacity="0.6" />
                  </pattern>

                  {/* Pattern 4: Geometric Digital Camo */}
                  <pattern id="pat-camo" width="32" height="32" patternUnits="userSpaceOnUse">
                    <rect width="32" height="32" fill={config.primaryColor} />
                    <polygon points="0,0 16,0 8,16" fill={config.secondaryColor} opacity="0.25" />
                    <polygon points="16,16 32,8 24,28" fill="#000000" opacity="0.35" />
                    <polygon points="8,20 18,32 4,32" fill={config.accentColor} opacity="0.3" />
                  </pattern>

                  {/* Pattern 5: Lightning Split */}
                  <pattern id="pat-lightning" width="40" height="40" patternUnits="userSpaceOnUse">
                    <rect width="40" height="40" fill={config.primaryColor} />
                    <path d="M12,0 L8,18 L24,18 L16,40" fill="none" stroke={config.accentColor} strokeWidth="1.8" opacity="0.45" />
                  </pattern>

                  {/* Pattern 6: Gold Hex Lattice */}
                  <pattern id="pat-goldhex" width="16" height="27.7" patternUnits="userSpaceOnUse">
                    <rect width="16" height="27.7" fill={config.primaryColor} />
                    <path d="M8,0 L16,4.6 L16,13.8 L8,18.4 L0,13.8 L0,4.6 Z" fill="none" stroke="#fbbf24" strokeWidth="0.75" opacity="0.35" />
                    <path d="M8,18.4 L16,23 L16,32.2 L8,36.8 L0,32.2 L0,23 Z" fill="none" stroke="#fbbf24" strokeWidth="0.75" opacity="0.35" />
                  </pattern>

                  {/* 3D Fabric Shading Gradient */}
                  <linearGradient id="jersey-shadow" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#000000" stopOpacity="0.4" />
                    <stop offset="25%" stopColor="#ffffff" stopOpacity="0.08" />
                    <stop offset="50%" stopColor="#000000" stopOpacity="0.0" />
                    <stop offset="75%" stopColor="#ffffff" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
                  </linearGradient>

                  {/* Sleeve Shading */}
                  <linearGradient id="sleeve-left-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={config.secondaryColor} />
                    <stop offset="100%" stopColor={config.primaryColor} />
                  </linearGradient>

                  <linearGradient id="sleeve-right-grad" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={config.secondaryColor} />
                    <stop offset="100%" stopColor={config.primaryColor} />
                  </linearGradient>
                </defs>

                {/* --- 1. SLEEVES & SHOULDER WINGS --- */}
                {/* Left Sleeve */}
                <path
                  d="M100,52 L35,105 L52,148 L92,118 Z"
                  fill="url(#sleeve-left-grad)"
                  stroke={config.accentColor}
                  strokeWidth="1.5"
                />
                {/* Left Sleeve Trim */}
                <path
                  d="M35,105 L52,148 L56,145 L41,102 Z"
                  fill={config.accentColor}
                  opacity="0.9"
                />

                {/* Right Sleeve */}
                <path
                  d="M200,52 L265,105 L248,148 L208,118 Z"
                  fill="url(#sleeve-right-grad)"
                  stroke={config.accentColor}
                  strokeWidth="1.5"
                />
                {/* Right Sleeve Trim */}
                <path
                  d="M265,105 L248,148 L244,145 L259,102 Z"
                  fill={config.accentColor}
                  opacity="0.9"
                />

                {/* Left Sleeve Patch Badge */}
                {config.sleevePatch !== 'none' && (
                  <g transform="translate(62, 115) rotate(-22)">
                    <circle cx="0" cy="0" r="9" fill="#0f172a" stroke="#fbbf24" strokeWidth="1.2" />
                    <text x="0" y="3" textAnchor="middle" fontSize="8" fill="#fbbf24" fontWeight="bold">🏆</text>
                  </g>
                )}

                {/* --- 2. MAIN TORSO BODY --- */}
                {/* Body Silhouette */}
                <path
                  d="M100,50 L120,44 C135,46 165,46 180,44 L200,50 L212,118 L208,275 C180,282 120,282 92,275 L88,118 Z"
                  fill={
                    config.pattern === 'carbon_fiber' ? 'url(#pat-carbon)' :
                    config.pattern === 'neon_grid' ? 'url(#pat-neongrid)' :
                    config.pattern === 'cyber_stripes' ? 'url(#pat-stripes)' :
                    config.pattern === 'geometric_camo' ? 'url(#pat-camo)' :
                    config.pattern === 'lightning_split' ? 'url(#pat-lightning)' :
                    config.pattern === 'gold_hex' ? 'url(#pat-goldhex)' :
                    config.primaryColor
                  }
                  stroke={config.secondaryColor}
                  strokeWidth="2"
                />

                {/* Side Ventilation Mesh Panels */}
                <path
                  d="M88,118 L102,126 L98,272 L92,275 Z"
                  fill={config.secondaryColor}
                  opacity="0.4"
                />
                <path
                  d="M212,118 L198,126 L202,272 L208,275 Z"
                  fill={config.secondaryColor}
                  opacity="0.4"
                />

                {/* Dynamic Angular Racing Accent Accents */}
                <polygon
                  points="96,160 115,168 112,230 94,220"
                  fill={config.accentColor}
                  opacity="0.35"
                />
                <polygon
                  points="204,160 185,168 188,230 206,220"
                  fill={config.accentColor}
                  opacity="0.35"
                />

                {/* Bottom Hem Trim Stripe */}
                <path
                  d="M92,268 C120,275 180,275 208,268 L208,275 C180,282 120,282 92,275 Z"
                  fill={config.accentColor}
                  opacity="0.9"
                />

                {/* Fabric 3D Shadow Overlay */}
                <path
                  d="M100,50 L120,44 C135,46 165,46 180,44 L200,50 L212,118 L208,275 C180,282 120,282 92,275 L88,118 Z"
                  fill="url(#jersey-shadow)"
                  pointerEvents="none"
                />

                {/* --- 3. COLLAR DESIGN --- */}
                {config.collarStyle === 'v_neck' ? (
                  <polygon
                    points="120,44 150,78 180,44 165,42 150,60 135,42"
                    fill={config.secondaryColor}
                    stroke={config.accentColor}
                    strokeWidth="1"
                  />
                ) : (
                  <path
                    d="M120,44 C130,68 170,68 180,44 C168,52 132,52 120,44 Z"
                    fill={config.secondaryColor}
                    stroke={config.accentColor}
                    strokeWidth="1"
                  />
                )}

                {/* Inner collar tag */}
                <ellipse cx="150" cy="46" rx="16" ry="5" fill="#0f172a" opacity="0.6" />

                {/* --- 4. VIEW ANGLE GRAPHICS --- */}
                {viewAngle === 'front' ? (
                  <g>
                    {/* Front Center: Team Crest Graphic */}
                    <g transform="translate(150, 110)">
                      <circle cx="0" cy="0" r="24" fill="#090d16" stroke={config.accentColor} strokeWidth="2" opacity="0.9" />
                      {/* Crest Emoji / Icon */}
                      <text x="0" y="8" textAnchor="middle" fontSize="22">
                        {JERSEY_CRESTS.find(c => c.id === config.crestDesign)?.emoji || '🐉'}
                      </text>
                    </g>

                    {/* Team Gamertag Brand on Chest */}
                    <text
                      x="150"
                      y="155"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="14"
                      fontWeight="900"
                      fontFamily="'Orbitron', sans-serif"
                      letterSpacing="3"
                      filter="drop-shadow(0 2px 4px rgba(0,0,0,0.8))"
                    >
                      {config.customGamertag || 'DYNASTY'}
                    </text>

                    {/* Front Squad Number */}
                    <text
                      x="150"
                      y="215"
                      textAnchor="middle"
                      fill={config.accentColor}
                      fontSize="42"
                      fontWeight="900"
                      fontFamily="'Rajdhani', sans-serif"
                      stroke="#ffffff"
                      strokeWidth="1"
                      filter="drop-shadow(0 4px 6px rgba(0,0,0,0.9))"
                    >
                      {config.jerseyNumber < 10 ? `0${config.jerseyNumber}` : config.jerseyNumber}
                    </text>

                    {/* Star Player Signature (Cursive Script Overlay) */}
                    {config.starSignaturePlayerName && (
                      <g transform="translate(150, 240) rotate(-6)">
                        <rect x="-65" y="-12" width="130" height="20" rx="4" fill="#090d16" opacity="0.7" />
                        <text
                          x="0"
                          y="2"
                          textAnchor="middle"
                          fill="#fbbf24"
                          fontSize="10"
                          fontWeight="bold"
                          fontStyle="italic"
                          letterSpacing="1"
                        >
                          ✍️ {config.starSignaturePlayerName}
                        </text>
                      </g>
                    )}

                    {/* Official Sponsor Logo Mockup Badges */}
                    <rect x="110" y="75" width="22" height="9" rx="2" fill="#ffffff" opacity="0.25" />
                    <rect x="168" y="75" width="22" height="9" rx="2" fill="#ffffff" opacity="0.25" />
                  </g>
                ) : (
                  <g>
                    {/* Back View: Large Player Name & Massive Number */}
                    <text
                      x="150"
                      y="110"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="16"
                      fontWeight="900"
                      fontFamily="'Orbitron', sans-serif"
                      letterSpacing="4"
                      filter="drop-shadow(0 2px 4px rgba(0,0,0,0.8))"
                    >
                      {config.starSignaturePlayerName 
                        ? config.starSignaturePlayerName.split(' ')[0].toUpperCase() 
                        : (config.customGamertag || 'PRO_PLAYER')}
                    </text>

                    {/* Huge Jersey Number on Back */}
                    <text
                      x="150"
                      y="195"
                      textAnchor="middle"
                      fill={config.accentColor}
                      fontSize="74"
                      fontWeight="900"
                      fontFamily="'Rajdhani', sans-serif"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      filter="drop-shadow(0 6px 12px rgba(0,0,0,0.95))"
                    >
                      {config.jerseyNumber < 10 ? `0${config.jerseyNumber}` : config.jerseyNumber}
                    </text>

                    {/* Lower Back Sponsor Bar */}
                    <rect x="115" y="240" width="70" height="12" rx="3" fill="#0f172a" stroke={config.secondaryColor} strokeWidth="1" opacity="0.8" />
                    <text x="150" y="249" textAnchor="middle" fontSize="7" fill="#94a3b8" fontWeight="bold">
                      OFFICIAL DYNASTY MERCH
                    </text>
                  </g>
                )}
              </svg>
            </div>

            {/* Bottom Projected Metrics Card */}
            <div className="w-full mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-[10px]">
              <div>
                <span className="text-slate-400 block font-tech">预期周销售量</span>
                <span className="font-code font-bold text-white text-xs">
                  {projectedWeeklyUnits.toLocaleString()} 件 / 周
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block font-tech">预估周零售流水</span>
                <span className="font-code font-bold text-emerald-400 text-xs">
                  ${projectedWeeklyRevenue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Detailed Customization Panels (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Sub Navigation Tabs */}
          <div className="grid grid-cols-5 gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
            {[
              { id: 'colors', label: '战队配色', icon: Palette },
              { id: 'patterns', label: '面料质感', icon: Layers },
              { id: 'crest', label: '图腾队徽', icon: Shield },
              { id: 'details', label: '号码与选手', icon: Users },
              { id: 'pricing', label: '规格发售', icon: DollarSign }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveSection(tab.id as typeof activeSection);
                  }}
                  className={`py-2 px-1 rounded-lg text-[10px] font-tech font-bold transition cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* 1. COLORS TAB */}
          {activeSection === 'colors' && (
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
              <span className="text-xs font-tech font-bold text-white flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-cyan-400" />
                预设电竞冠军色系 (Preset Palettes)
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {JERSEY_COLOR_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectPalette(p)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-left transition cursor-pointer flex items-center gap-2 group"
                  >
                    <div className="flex items-center -space-x-1 shrink-0">
                      <div className="w-4 h-4 rounded-full border border-slate-800 shadow" style={{ backgroundColor: p.primary }} />
                      <div className="w-4 h-4 rounded-full border border-slate-800 shadow" style={{ backgroundColor: p.secondary }} />
                      <div className="w-4 h-4 rounded-full border border-slate-800 shadow" style={{ backgroundColor: p.accent }} />
                    </div>
                    <span className="text-[10px] font-tech text-slate-300 group-hover:text-white truncate">
                      {p.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 font-tech">主基色 (Primary)</label>
                  <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900 border border-slate-800">
                    <input
                      type="color"
                      value={config.primaryColor}
                      onChange={e => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
                    />
                    <span className="text-[10px] font-code text-slate-300 uppercase">{config.primaryColor}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 font-tech">副拼色 (Secondary)</label>
                  <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900 border border-slate-800">
                    <input
                      type="color"
                      value={config.secondaryColor}
                      onChange={e => setConfig(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
                    />
                    <span className="text-[10px] font-code text-slate-300 uppercase">{config.secondaryColor}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 font-tech">霓虹勾边 (Accent)</label>
                  <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900 border border-slate-800">
                    <input
                      type="color"
                      value={config.accentColor}
                      onChange={e => setConfig(prev => ({ ...prev, accentColor: e.target.value }))}
                      className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
                    />
                    <span className="text-[10px] font-code text-slate-300 uppercase">{config.accentColor}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. PATTERNS TAB */}
          {activeSection === 'patterns' && (
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2.5">
              <span className="text-xs font-tech font-bold text-white flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                科技面料与立体印花纹理 (Fabric & Patterns)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {JERSEY_PATTERNS.map(pat => {
                  const isSelected = config.pattern === pat.id;
                  return (
                    <button
                      key={pat.id}
                      onClick={() => {
                        soundEngine.playClick();
                        setConfig(prev => ({ ...prev, pattern: pat.id }));
                      }}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-start justify-between gap-2 ${
                        isSelected
                          ? 'bg-gradient-to-r from-indigo-950/70 to-slate-900 border-indigo-500 shadow-md ring-1 ring-indigo-500'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-tech font-bold text-white text-xs">{pat.name}</span>
                          {pat.hypeBoost > 0 && (
                            <span className="text-[8px] px-1 rounded bg-amber-500/20 text-amber-300 font-code font-bold">
                              +{pat.hypeBoost} 潮值
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-slate-400 font-sans mt-0.5 leading-tight">{pat.desc}</p>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. CREST TAB */}
          {activeSection === 'crest' && (
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2.5">
              <span className="text-xs font-tech font-bold text-white flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                战队图腾队徽 (Emblem & Crest)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {JERSEY_CRESTS.map(crest => {
                  const isSelected = config.crestDesign === crest.id;
                  return (
                    <button
                      key={crest.id}
                      onClick={() => {
                        soundEngine.playClick();
                        setConfig(prev => ({ ...prev, crestDesign: crest.id }));
                      }}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-gradient-to-r from-amber-950/60 to-slate-900 border-amber-500 shadow-md ring-1 ring-amber-500'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{crest.emoji}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-tech font-bold text-white text-xs">{crest.name}</span>
                            <span className="text-[8px] px-1 rounded bg-amber-500/20 text-amber-300 font-code font-bold">
                              +{crest.bonusHype} 潮值
                            </span>
                          </div>
                          <p className="text-[9px] text-slate-400 font-sans mt-0.5">{crest.desc}</p>
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. DETAILS & STAR SIGNATURE TAB */}
          {activeSection === 'details' && (
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
              <span className="text-xs font-tech font-bold text-white flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-pink-400" />
                战袍个性印号与明星联名签名 (Personalization & Star Signatures)
              </span>

              {/* Number and Gamertag inputs */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 font-tech block mb-1">胸前战队缩写 / 标志名</label>
                  <input
                    type="text"
                    maxLength={10}
                    value={config.customGamertag}
                    onChange={e => setConfig(prev => ({ ...prev, customGamertag: e.target.value.toUpperCase() }))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 font-tech font-bold text-white text-xs focus:border-cyan-400 outline-none"
                    placeholder="DYNASTY"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-tech block mb-1">后背战斗背号 (1 - 99)</label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={config.jerseyNumber}
                    onChange={e => setConfig(prev => ({ ...prev, jerseyNumber: Math.max(1, Math.min(99, parseInt(e.target.value) || 7)) }))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 font-code font-bold text-amber-300 text-xs focus:border-amber-400 outline-none"
                  />
                </div>
              </div>

              {/* Collar and Sleeve Patches */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 font-tech block mb-1">领口剪裁工艺</label>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      onClick={() => setConfig(prev => ({ ...prev, collarStyle: 'v_neck' }))}
                      className={`py-1.5 rounded-lg text-[10px] font-tech font-bold border transition ${
                        config.collarStyle === 'v_neck'
                          ? 'bg-indigo-600 text-white border-indigo-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      深V竞速领
                    </button>
                    <button
                      onClick={() => setConfig(prev => ({ ...prev, collarStyle: 'round' }))}
                      className={`py-1.5 rounded-lg text-[10px] font-tech font-bold border transition ${
                        config.collarStyle === 'round'
                          ? 'bg-indigo-600 text-white border-indigo-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      圆领防风
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-tech block mb-1">右袖金标勋章</label>
                  <select
                    value={config.sleevePatch}
                    onChange={e => setConfig(prev => ({ ...prev, sleevePatch: e.target.value as any }))}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-tech text-white focus:border-amber-400 outline-none cursor-pointer"
                  >
                    <option value="none">无金标臂章</option>
                    <option value="worlds_champion">🏆 全球总决赛世界冠军金桂冠</option>
                    <option value="lpl_gold">⭐ 顶级职业赛区黄金之翼</option>
                    <option value="pro_division">⚡ 职业联赛官方防伪认证</option>
                  </select>
                </div>
              </div>

              {/* Star Player Signature Selector */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-tech font-bold text-white flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    绑定首发明星选手联名亲笔签名 (Star Signature Drop)
                  </span>
                  <span className="text-[9px] text-amber-300 font-sans">
                    可提升粉丝抢购溢价 +15%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      setConfig(prev => ({
                        ...prev,
                        starSignaturePlayerId: undefined,
                        starSignaturePlayerName: undefined
                      }));
                    }}
                    className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                      !config.starSignaturePlayerName
                        ? 'bg-indigo-950/70 border-indigo-500 shadow ring-1 ring-indigo-500'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="font-tech font-bold text-xs text-white block">全队团队版</span>
                    <span className="text-[9px] text-slate-400">无单独选手特签名</span>
                  </button>

                  {startingRoster.map(player => {
                    const isSelected = config.starSignaturePlayerName === `${player.name} (${player.role})`;
                    return (
                      <button
                        key={player.id}
                        onClick={() => {
                          soundEngine.playClick();
                          setConfig(prev => ({
                            ...prev,
                            starSignaturePlayerId: player.id,
                            starSignaturePlayerName: `${player.name} (${player.role})`
                          }));
                        }}
                        className={`p-2 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-950/60 border-amber-500 shadow ring-1 ring-amber-500'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-tech font-bold text-xs text-white">{player.name}</span>
                            <span className="text-[8px] px-1 rounded bg-slate-800 text-cyan-300 font-mono font-bold">
                              {player.role}
                            </span>
                          </div>
                          <span className="text-[9px] text-amber-300 font-code block mt-0.5">
                            人气溢价 +15%
                          </span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 5. PRICING & EDITION TAB */}
          {activeSection === 'pricing' && (
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2.5">
              <span className="text-xs font-tech font-bold text-white flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                战袍商品发售规格定位 (Price Tiers & Packaging)
              </span>

              <div className="space-y-2">
                {(['fan_edition', 'pro_player_edition', 'collector_golden_box'] as JerseyPriceTier[]).map(tierKey => {
                  const item = PRICE_TIERS[tierKey];
                  const isSelected = config.priceTier === tierKey;
                  return (
                    <button
                      key={tierKey}
                      onClick={() => {
                        soundEngine.playClick();
                        setConfig(prev => ({ ...prev, priceTier: tierKey }));
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-tech font-bold text-white text-xs">{item.name}</span>
                          <span className="text-[10px] font-code font-black text-cyan-300">
                            零售价 ${item.retailPrice} / 件
                          </span>
                          <span className="text-[8px] text-slate-400">
                            (成本 ${item.unitCost} · 毛利 ${(item.retailPrice - item.unitCost)})
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-400 font-sans">{item.desc}</p>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-tech block mb-1">官方宣发款系命名</label>
                <input
                  type="text"
                  value={config.editionName}
                  onChange={e => setConfig(prev => ({ ...prev, editionName: e.target.value }))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 font-tech text-white text-xs focus:border-emerald-400 outline-none"
                  placeholder="2026 破晓破阵款战袍"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
