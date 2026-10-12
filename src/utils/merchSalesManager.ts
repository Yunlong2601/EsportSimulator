import { 
  DynastyState, 
  MerchShopState, 
  MerchSalesWeekReport, 
  ProPlayer 
} from '../types/game';
import { 
  INITIAL_MERCH_SHOP_STATE, 
  PRICE_TIERS,
  MERCH_RD_UPGRADES,
  RDUpgradeDef
} from '../data/merchData';

/**
 * Calculates player popularity metrics based on current active roster
 */
export function calculatePlayerPopularityScore(roster: ProPlayer[] = []): {
  totalScore: number;
  avgPopularity: number;
  starPlayer: ProPlayer | null;
  signatureMultiplier: number;
} {
  if (!roster || roster.length === 0) {
    return {
      totalScore: 100,
      avgPopularity: 80,
      starPlayer: null,
      signatureMultiplier: 1.0
    };
  }

  // Find star player (highest market value or highest mechanics)
  let starPlayer: ProPlayer = roster[0];
  let totalScore = 0;

  roster.forEach(p => {
    const playerPower = (p.mechanics || 80) * 0.5 + (p.macro || 80) * 0.3 + (p.morale || 80) * 0.2;
    totalScore += playerPower;
    if ((p.marketValue || 0) > (starPlayer.marketValue || 0) || playerPower > ((starPlayer.mechanics || 80) * 0.5 + (starPlayer.macro || 80) * 0.5)) {
      starPlayer = p;
    }
  });

  const avgPopularity = Math.round(totalScore / roster.length);
  // Multiplier ranges from 1.0 to 1.45 based on star player & team avg
  const signatureMultiplier = 1.0 + Math.max(0, (avgPopularity - 75) * 0.015);

  return {
    totalScore: Math.round(totalScore),
    avgPopularity,
    starPlayer,
    signatureMultiplier: parseFloat(signatureMultiplier.toFixed(2))
  };
}

/**
 * Calculates tournament success factor based on titles, worlds won, and win rates
 */
export function calculateTournamentSuccessFactor(dynasty: DynastyState): {
  multiplier: number;
  reason: string;
  titlesCount: number;
} {
  const worldsCount = dynasty.worldChampionshipsWon || 0;
  const rings = dynasty.unlockedRings || [];
  const totalTitles = worldsCount + rings.length;

  let multiplier = 1.0;
  const reasons: string[] = [];

  if (worldsCount > 0) {
    multiplier += worldsCount * 0.35; // +35% per worlds crown
    reasons.push(`全球总决赛总冠军 x${worldsCount} (+${Math.round(worldsCount * 35)}%)`);
  }

  if (rings.length > 0) {
    multiplier += Math.min(0.3, rings.length * 0.1);
    reasons.push(`至尊冠军戒指 x${rings.length} (+${Math.min(30, rings.length * 10)}%)`);
  }

  // Infrastructure commercial boost
  const baseStars = dynasty.infrastructureStats?.gamingHouseStars || 1;
  if (baseStars > 1) {
    multiplier += (baseStars - 1) * 0.05;
    reasons.push(`${baseStars}星级豪门基地 (+${(baseStars - 1) * 5}%)`);
  }

  if (reasons.length === 0) {
    reasons.push('常规联赛赛季活跃 (+0%)');
  }

  return {
    multiplier: parseFloat(multiplier.toFixed(2)),
    reason: reasons.join(' · '),
    titlesCount: totalTitles
  };
}

/**
 * Gets R&D definition by upgrade id
 */
export function getRDUpgradeDef(id: string): RDUpgradeDef | undefined {
  return MERCH_RD_UPGRADES.find(u => u.id === id);
}

/**
 * Calculates R&D Lab technological upgrades multiplier for jersey sales
 */
export function calculateRDMultipliers(rdUpgrades: Record<string, number> = {}): {
  jerseyRevenueMultiplier: number;
  fabricLevel: number;
  printLevel: number;
  cutLevel: number;
  smartLevel: number;
  fabricBonus: number;
  printBonus: number;
  cutBonus: number;
  smartBonus: number;
  activePerks: {
    id: string;
    level: number;
    title: string;
    perkName: string;
    perkDetail: string;
    badge: string;
  }[];
  breakdown: string[];
} {
  const fabricLevel = rdUpgrades.fabric_tech || 0;
  const printLevel = rdUpgrades.print_quality || 0;
  const cutLevel = rdUpgrades.ergonomic_cut || 0;
  const smartLevel = rdUpgrades.smart_chip || 0;

  const fabricDef = getRDUpgradeDef('fabric_tech');
  const printDef = getRDUpgradeDef('print_quality');
  const cutDef = getRDUpgradeDef('ergonomic_cut');
  const smartDef = getRDUpgradeDef('smart_chip');

  const fabricBonus = fabricLevel > 0 && fabricDef && fabricDef.levels[fabricLevel - 1]
    ? fabricDef.levels[fabricLevel - 1].bonusMultiplier
    : fabricLevel * 0.12;

  const printBonus = printLevel > 0 && printDef && printDef.levels[printLevel - 1]
    ? printDef.levels[printLevel - 1].bonusMultiplier
    : printLevel * 0.10;

  const cutBonus = cutLevel > 0 && cutDef && cutDef.levels[cutLevel - 1]
    ? cutDef.levels[cutLevel - 1].bonusMultiplier
    : cutLevel * 0.06;

  const smartBonus = smartLevel > 0 && smartDef && smartDef.levels[smartLevel - 1]
    ? smartDef.levels[smartLevel - 1].bonusMultiplier
    : smartLevel * 0.12;

  const totalBonus = fabricBonus + printBonus + cutBonus + smartBonus;
  const jerseyRevenueMultiplier = parseFloat((1.0 + totalBonus).toFixed(2));

  const activePerks: {
    id: string;
    level: number;
    title: string;
    perkName: string;
    perkDetail: string;
    badge: string;
  }[] = [];
  const breakdown: string[] = [];

  if (fabricLevel > 0 && fabricDef) {
    const lvlInfo = fabricDef.levels[fabricLevel - 1];
    if (lvlInfo) {
      activePerks.push({
        id: 'fabric_tech',
        level: fabricLevel,
        title: lvlInfo.title,
        perkName: lvlInfo.perkName,
        perkDetail: lvlInfo.perkDetail,
        badge: lvlInfo.perkBadge
      });
      breakdown.push(`面料工学 Lv.${fabricLevel} (${lvlInfo.title}): +${Math.round(fabricBonus * 100)}%`);
    }
  }

  if (printLevel > 0 && printDef) {
    const lvlInfo = printDef.levels[printLevel - 1];
    if (lvlInfo) {
      activePerks.push({
        id: 'print_quality',
        level: printLevel,
        title: lvlInfo.title,
        perkName: lvlInfo.perkName,
        perkDetail: lvlInfo.perkDetail,
        badge: lvlInfo.perkBadge
      });
      breakdown.push(`立体印花 Lv.${printLevel} (${lvlInfo.title}): +${Math.round(printBonus * 100)}%`);
    }
  }

  if (cutLevel > 0 && cutDef) {
    const lvlInfo = cutDef.levels[cutLevel - 1];
    if (lvlInfo) {
      activePerks.push({
        id: 'ergonomic_cut',
        level: cutLevel,
        title: lvlInfo.title,
        perkName: lvlInfo.perkName,
        perkDetail: lvlInfo.perkDetail,
        badge: lvlInfo.perkBadge
      });
      breakdown.push(`版型工学 Lv.${cutLevel}: +${Math.round(cutBonus * 100)}%`);
    }
  }

  if (smartLevel > 0 && smartDef) {
    const lvlInfo = smartDef.levels[smartLevel - 1];
    if (lvlInfo) {
      activePerks.push({
        id: 'smart_chip',
        level: smartLevel,
        title: lvlInfo.title,
        perkName: lvlInfo.perkName,
        perkDetail: lvlInfo.perkDetail,
        badge: lvlInfo.perkBadge
      });
      breakdown.push(`NFC芯片 Lv.${smartLevel}: +${Math.round(smartBonus * 100)}%`);
    }
  }

  return {
    jerseyRevenueMultiplier,
    fabricLevel,
    printLevel,
    cutLevel,
    smartLevel,
    fabricBonus,
    printBonus,
    cutBonus,
    smartBonus,
    activePerks,
    breakdown
  };
}

/**
 * Upgrades an R&D technology in the Apparel & Merch lab
 */
export function investInMerchRD(
  dynasty: DynastyState,
  upgradeId: 'fabric_tech' | 'print_quality' | 'ergonomic_cut' | 'smart_chip',
  costOverride?: number
): {
  success: boolean;
  message: string;
  updatedDynasty: DynastyState;
  unlockedPerk?: string;
  hypeReward: number;
} {
  const currentMerch: MerchShopState = dynasty.merchShop || { ...INITIAL_MERCH_SHOP_STATE };
  const currentUpgrades = { ...(currentMerch.rdUpgrades || { fabric_tech: 1, print_quality: 1, ergonomic_cut: 0, smart_chip: 0 }) };
  const currentLevel = currentUpgrades[upgradeId] || 0;

  const def = getRDUpgradeDef(upgradeId);
  if (!def) {
    return {
      success: false,
      message: `未找到对应科研升级模块: ${upgradeId}`,
      updatedDynasty: dynasty,
      hypeReward: 0
    };
  }

  if (currentLevel >= def.maxLevel) {
    return {
      success: false,
      message: `【${def.name}】已达到最高工艺巅峰 Lv.${def.maxLevel}，无需继续注资！`,
      updatedDynasty: dynasty,
      hypeReward: 0
    };
  }

  const nextLevel = currentLevel + 1;
  const nextLevelInfo = def.levels[nextLevel - 1];
  const cost = costOverride !== undefined ? costOverride : (nextLevelInfo?.cost || Math.round(def.baseCost * Math.pow(def.costMultiplier, currentLevel)));
  const hypeReward = nextLevelInfo?.hypeReward || 5;

  if (dynasty.budget < cost) {
    const shortage = cost - dynasty.budget;
    return {
      success: false,
      message: `俱乐部预算储备不足！需要 $${cost.toLocaleString()}，当前仅有 $${Math.round(dynasty.budget).toLocaleString()}（还差 $${Math.round(shortage).toLocaleString()}）`,
      updatedDynasty: dynasty,
      hypeReward: 0
    };
  }

  currentUpgrades[upgradeId] = nextLevel;

  const updatedMerchShop: MerchShopState = {
    ...currentMerch,
    rdUpgrades: currentUpgrades,
    currentHypeLevel: Math.min(100, (currentMerch.currentHypeLevel || 80) + hypeReward)
  };

  const updatedDynasty: DynastyState = {
    ...dynasty,
    budget: dynasty.budget - cost,
    merchShop: updatedMerchShop
  };

  const perkDisplay = nextLevelInfo ? `${nextLevelInfo.perkName} - ${nextLevelInfo.perkDetail}` : '';

  return {
    success: true,
    message: `🧪 研发突破成功！【${def.categoryName}】晋升至 Lv.${nextLevel}「${nextLevelInfo?.title || ''}」！激活特权: ${perkDisplay}，战袍流水倍率提升，粉丝狂热度 +${hypeReward}！`,
    updatedDynasty,
    unlockedPerk: perkDisplay,
    hypeReward
  };
}

/**
 * Estimates the impact of upgrading a specific R&D tech (Delta weekly passive, Delta flash drop, ROI)
 */
export function estimateUpgradeImpact(
  dynasty: DynastyState,
  upgradeId: 'fabric_tech' | 'print_quality' | 'ergonomic_cut' | 'smart_chip'
): {
  canUpgrade: boolean;
  isMaxed: boolean;
  currentLevel: number;
  nextLevel: number;
  cost: number;
  hypeReward: number;
  currentMultiplier: number;
  projectedMultiplier: number;
  deltaWeeklyPassive: number;
  deltaFlashDrop: number;
  paybackWeeks: number;
  diminishingRoiRatio: number;
} {
  const currentMerch: MerchShopState = dynasty.merchShop || { ...INITIAL_MERCH_SHOP_STATE };
  const currentUpgrades = { ...(currentMerch.rdUpgrades || { fabric_tech: 1, print_quality: 1, ergonomic_cut: 0, smart_chip: 0 }) };
  const currentLevel = currentUpgrades[upgradeId] || 0;
  const def = getRDUpgradeDef(upgradeId);

  if (!def || currentLevel >= def.maxLevel) {
    const currentMult = calculateRDMultipliers(currentUpgrades).jerseyRevenueMultiplier;
    return {
      canUpgrade: false,
      isMaxed: true,
      currentLevel,
      nextLevel: currentLevel,
      cost: 0,
      hypeReward: 0,
      currentMultiplier: currentMult,
      projectedMultiplier: currentMult,
      deltaWeeklyPassive: 0,
      deltaFlashDrop: 0,
      paybackWeeks: 0,
      diminishingRoiRatio: 0
    };
  }

  const nextLevel = currentLevel + 1;
  const nextLevelInfo = def.levels[nextLevel - 1];
  const cost = nextLevelInfo?.cost || Math.round(def.baseCost * Math.pow(def.costMultiplier, currentLevel));
  const hypeReward = nextLevelInfo?.hypeReward || 5;

  const currentMult = calculateRDMultipliers(currentUpgrades).jerseyRevenueMultiplier;
  const simulatedUpgrades = { ...currentUpgrades, [upgradeId]: nextLevel };
  const projectedMult = calculateRDMultipliers(simulatedUpgrades).jerseyRevenueMultiplier;

  // Calculate current baseline
  const baselinePassive = calculateWeeklyPassiveMerchRevenue(dynasty, 5);
  // Calculate simulated baseline
  const simulatedDynasty: DynastyState = {
    ...dynasty,
    merchShop: {
      ...currentMerch,
      rdUpgrades: simulatedUpgrades
    }
  };
  const projectedPassive = calculateWeeklyPassiveMerchRevenue(simulatedDynasty, 5);
  const deltaWeeklyPassive = Math.max(0, projectedPassive.passiveRevenue - baselinePassive.passiveRevenue);

  // Approximate flash drop delta
  const deltaMultiplier = Math.max(0.01, projectedMult - currentMult);
  const deltaFlashDrop = Math.round(deltaMultiplier * 140000);

  // Payback weeks
  const paybackWeeks = deltaWeeklyPassive > 0 ? parseFloat((cost / deltaWeeklyPassive).toFixed(1)) : 99;

  // Diminishing ROI ratio: percentage point gained per $10k spent
  const percentageGained = (projectedMult - currentMult) * 100;
  const diminishingRoiRatio = parseFloat(((percentageGained / cost) * 10000).toFixed(2));

  return {
    canUpgrade: dynasty.budget >= cost,
    isMaxed: false,
    currentLevel,
    nextLevel,
    cost,
    hypeReward,
    currentMultiplier: currentMult,
    projectedMultiplier: projectedMult,
    deltaWeeklyPassive,
    deltaFlashDrop,
    paybackWeeks,
    diminishingRoiRatio
  };
}

/**
 * Calculates current weekly passive merch sales breakdown
 */
export function calculateWeeklyPassiveMerchRevenue(
  dynasty: DynastyState,
  targetWeek: number = 5
): MerchSalesWeekReport {
  const merchShop: MerchShopState = dynasty.merchShop || INITIAL_MERCH_SHOP_STATE;
  const roster = dynasty.roster || [];
  const popularity = calculatePlayerPopularityScore(roster);
  const tournament = calculateTournamentSuccessFactor(dynasty);
  const rdMultiplier = calculateRDMultipliers(merchShop.rdUpgrades);

  // Fanbase factor
  const fanbaseCount = dynasty.communityRelations?.fanbaseCount || 150000;
  const fanbaseMultiplier = dynasty.communityRelations?.fanbaseMultiplier || 1.25;

  // Jersey design hype boost
  const jerseyConfig = merchShop.jerseyConfig;
  const jerseyPriceInfo = PRICE_TIERS[jerseyConfig.priceTier] || PRICE_TIERS.pro_player_edition;
  const jerseyHypeMult = 1.0 + (jerseyConfig.hypeScore || 80) * 0.005;

  // Base passive volume scale from fanbase
  const baseScale = Math.max(0.8, Math.log10(fanbaseCount / 10000)) * fanbaseMultiplier;

  let totalPassiveUnits = 0;
  let totalPassiveRevenue = 0;
  let totalCost = 0;
  let topSellingItem = '2026 赛季定制官方战袍 (Team Jersey)';
  let maxItemRev = 0;

  merchShop.catalog.forEach(item => {
    if (!item.unlocked) return;

    // Item-specific calculation
    let itemBaseSales = item.baseWeeklySales * (1 + (item.tierLevel - 1) * 0.35);
    
    // If it's custom jersey, apply customizer parameters AND R&D tech multiplier!
    if (item.category === 'JERSEY') {
      itemBaseSales = Math.round(
        itemBaseSales * 
        jerseyPriceInfo.salesVolumeRate * 
        jerseyHypeMult * 
        popularity.signatureMultiplier * 
        rdMultiplier.jerseyRevenueMultiplier
      );
    }

    const itemUnits = Math.round(itemBaseSales * baseScale * tournament.multiplier);
    const itemRevenue = itemUnits * item.retailPrice;
    const itemProductionCost = itemUnits * item.unitCost;

    totalPassiveUnits += itemUnits;
    totalPassiveRevenue += itemRevenue;
    totalCost += itemProductionCost;

    if (itemRevenue > maxItemRev) {
      maxItemRev = itemRevenue;
      topSellingItem = item.name;
    }
  });

  const netProfit = totalPassiveRevenue - totalCost;

  return {
    week: targetWeek,
    timestamp: `第${targetWeek}周结算`,
    passiveSalesUnits: totalPassiveUnits,
    passiveRevenue: totalPassiveRevenue,
    flashSaleUnits: 0,
    flashSaleRevenue: 0,
    totalWeeklyRevenue: totalPassiveRevenue,
    netProfit,
    fanbaseMultiplier: parseFloat(fanbaseMultiplier.toFixed(2)),
    tournamentBonusMultiplier: tournament.multiplier,
    playerPopularityBonus: popularity.signatureMultiplier,
    topSellingItem
  };
}

/**
 * Trigger an instantaneous Flash Sale Drop (限时限量周边空投/抢购会)
 * Generates immediate spike revenue, boosts fan hype, and credits team budget.
 */
export function triggerFlashSaleDrop(
  dynasty: DynastyState,
  customTheme?: string
): {
  updatedDynasty: DynastyState;
  spikeResult: {
    unitsSold: number;
    spikeRevenue: number;
    netSpikeProfit: number;
    fanHype: number;
    theme: string;
    message: string;
  };
} {
  const currentMerch: MerchShopState = dynasty.merchShop || { ...INITIAL_MERCH_SHOP_STATE };
  const roster = dynasty.roster || [];
  const popularity = calculatePlayerPopularityScore(roster);
  const tournament = calculateTournamentSuccessFactor(dynasty);
  const fanbaseCount = dynasty.communityRelations?.fanbaseCount || 150000;
  const fanbaseMultiplier = dynasty.communityRelations?.fanbaseMultiplier || 1.25;

  const jersey = currentMerch.jerseyConfig;
  const starName = jersey.starSignaturePlayerName || popularity.starPlayer?.name || '全队明星';

  const defaultTheme = tournament.titlesCount > 0 
    ? `🏆【夺冠限定纪念】${starName} 联名电竞战袍空投夜`
    : `🔥【超级宠粉日】${starName} 签名版黑金战袍首发狂欢`;
  const theme = customTheme || defaultTheme;

  const rdMultiplier = calculateRDMultipliers(currentMerch.rdUpgrades);

  // Flash sale spike formula: 1.5x - 3.2x of passive scale + R&D lab technology boost
  const spikeMultiplier = 2.4 * fanbaseMultiplier * tournament.multiplier * popularity.signatureMultiplier * rdMultiplier.jerseyRevenueMultiplier;
  const baseUnits = Math.round(900 + Math.sqrt(fanbaseCount) * 2.5);
  const unitsSold = Math.round(baseUnits * spikeMultiplier);
  
  const unitPrice = jersey.unitRetailPrice || 149;
  const unitCost = jersey.productionUnitCost || 45;
  const spikeRevenue = unitsSold * unitPrice;
  const netSpikeProfit = spikeRevenue - (unitsSold * unitCost);

  // Update existing sales history or latest entry
  const history = [...(currentMerch.salesHistory || [])];
  const latestReport = history.length > 0 ? { ...history[history.length - 1] } : null;

  if (latestReport) {
    latestReport.flashSaleUnits += unitsSold;
    latestReport.flashSaleRevenue += spikeRevenue;
    latestReport.totalWeeklyRevenue += spikeRevenue;
    latestReport.netProfit += netSpikeProfit;
    history[history.length - 1] = latestReport;
  } else {
    history.push({
      week: 1,
      timestamp: '限时空投结算',
      passiveSalesUnits: 0,
      passiveRevenue: 0,
      flashSaleUnits: unitsSold,
      flashSaleRevenue: spikeRevenue,
      totalWeeklyRevenue: spikeRevenue,
      netProfit: netSpikeProfit,
      fanbaseMultiplier,
      tournamentBonusMultiplier: tournament.multiplier,
      playerPopularityBonus: popularity.signatureMultiplier,
      topSellingItem: jersey.editionName || '定制战袍'
    });
  }

  const updatedCatalog = (currentMerch.catalog || []).map(item => {
    if (item.category === 'JERSEY') {
      return {
        ...item,
        salesVolume: item.salesVolume + unitsSold,
        totalRevenue: item.totalRevenue + spikeRevenue
      };
    }
    return item;
  });

  const updatedMerchShop: MerchShopState = {
    ...currentMerch,
    catalog: updatedCatalog,
    salesHistory: history,
    totalLifetimeMerchRevenue: currentMerch.totalLifetimeMerchRevenue + spikeRevenue,
    totalJerseysSold: currentMerch.totalJerseysSold + unitsSold,
    currentHypeLevel: Math.min(100, (currentMerch.currentHypeLevel || 80) + 12),
    activeFlashSale: {
      title: theme,
      startedAt: Date.now(),
      durationSec: 300,
      salesSpikeMultiplier: parseFloat(spikeMultiplier.toFixed(2)),
      bonusRevenueGenerated: spikeRevenue,
      theme,
      unitsSold
    }
  };

  const updatedDynasty: DynastyState = {
    ...dynasty,
    budget: dynasty.budget + netSpikeProfit, // net profits injected into team budget
    merchShop: updatedMerchShop
  };

  return {
    updatedDynasty,
    spikeResult: {
      unitsSold,
      spikeRevenue,
      netSpikeProfit,
      fanHype: 98,
      theme,
      message: `🎉 狂暴爆单！限量空投抢购瞬间售罄 ${unitsSold.toLocaleString()} 件战袍，入账营业额 $${spikeRevenue.toLocaleString()}（净入金库 $${netSpikeProfit.toLocaleString()}）！`
    }
  };
}

/**
 * End-of-week settlement for passive merchandise revenues
 */
export function settleWeeklyMerchSales(
  dynasty: DynastyState,
  currentWeek: number
): {
  updatedDynasty: DynastyState;
  report: MerchSalesWeekReport;
} {
  const merchShop: MerchShopState = dynasty.merchShop || { ...INITIAL_MERCH_SHOP_STATE };
  
  // Calculate this week's passive sales
  const report = calculateWeeklyPassiveMerchRevenue(dynasty, currentWeek);

  const updatedHistory = [...(merchShop.salesHistory || [])];
  // Keep last 8 weeks for trend visualization
  updatedHistory.push(report);
  if (updatedHistory.length > 8) {
    updatedHistory.shift();
  }

  // Update item volumes in catalog
  const updatedCatalog = (merchShop.catalog || []).map(item => {
    if (!item.unlocked) return item;
    const portionOfTotal = item.category === 'JERSEY' ? 0.45 : 0.12;
    const estUnits = Math.round(report.passiveSalesUnits * portionOfTotal);
    return {
      ...item,
      salesVolume: item.salesVolume + estUnits,
      totalRevenue: item.totalRevenue + estUnits * item.retailPrice
    };
  });

  const jerseysAdded = Math.round(report.passiveSalesUnits * 0.45);

  const updatedMerchShop: MerchShopState = {
    ...merchShop,
    catalog: updatedCatalog,
    salesHistory: updatedHistory,
    totalLifetimeMerchRevenue: merchShop.totalLifetimeMerchRevenue + report.passiveRevenue,
    totalJerseysSold: merchShop.totalJerseysSold + jerseysAdded,
    lastSettlementWeek: currentWeek,
    currentHypeLevel: Math.max(65, (merchShop.currentHypeLevel || 80) - 2) // natural slight decay
  };

  const updatedDynasty: DynastyState = {
    ...dynasty,
    budget: dynasty.budget + report.netProfit,
    merchShop: updatedMerchShop
  };

  return {
    updatedDynasty,
    report
  };
}
