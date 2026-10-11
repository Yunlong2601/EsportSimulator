# Implementation Plan: Match MVP, Nemesis Rivalry, Deep Scout, Dynasty Training Camp & Legacy Lore

Building on the clarified user preferences, this plan introduces a comprehensive suite of competitive and managerial features for our 2D Esports Simulation game and its companion TapTap Maker Lua runtime.

---

## 1. User Decisions & Clarifications Integrated
- **Dynasty Training Camp**: 50,000 Dynasty Budget cost per coaching session, granting a +6 Mechanics or Macro boost active for 7 competitive in-game days.
- **Legacy Lore**: Unlocked progressively via Prestige milestones and past career playthroughs, chronicling iconic esports showdowns, legendary clutches, and classic rivalries.
- **Deep Scouting**: Fixed fee of ¥20,000 ($20,000) per player inquiry from the Global Power Rankings, opening an in-depth scout report modal with radar ratings and hidden clutch/potential attributes.

---

## 2. Architecture & Component Updates

### A. RetirementModal Career Summary & GOAT Rating Index
- **File**: `src/components/RetirementModal.tsx` & `src/types/game.ts`
- **Enhancements**:
  - Compute a definitive **GOAT (Greatest of All Time) Rating Index (0 - 100)** factoring in total championship trophies, peak rank tier, win rate, lifetime earnings, and MVP awards.
  - Display career achievement counters: Total Trophies, Lifetime Prize & Salary Earnings, All-Time Win/Loss, and Legacy Accolades.
  - Present the transition to Phase 3 Dynasty Club Owner with clear continuation affordances.

### B. Match MVP Celebration & Framer Motion Highlight
- **Files**: `src/components/common/MvpCelebrationModal.tsx` (new), `src/components/phase1/PhaseOneSoloQueue.tsx`, `src/hooks/useGameState.ts`
- **Features**:
  - Post-match trigger when the player or standout carry achieves dominant KDA and damage output.
  - Framer Motion animation with a golden-shimmering holographic border, dynamic particle/star-burst rays, and carry performance stat breakdown (KDA, Kill Participation, Damage Share).
  - Award a permanent **Legacy Carry Bonus** (+1 Mechanics or +1 Mental per exceptional MVP).

### C. Rivalry & Nemesis Tracking in Solo Queue
- **Files**: `src/components/MatchStatsModal.tsx`, `src/types/game.ts`, `src/hooks/useGameState.ts`
- **Features**:
  - Dynamically track frequent opponents in solo queue matchmaking (`TrackedOpponent` records).
  - When matching against a player with 3+ encounters and rival tension, flag them with a flaming **'Nemesis' (宿敌)** badge in `MatchStatsModal`.
  - Award **Bonus Bounty LP (+10 to +25 LP)** and distinct sound/haptic cues upon taking down a designated Nemesis.

### D. Global Power Rankings: Deep Scout & Hidden Potential Modal
- **Files**: `src/components/features/GlobalPowerRankingsModal.tsx`, `src/components/features/ScoutReportModal.tsx` (new), `src/types/game.ts`, `src/data/globalPowerRankingsData.ts`
- **Features**:
  - Add a **"深度球探" (Deep Scout)** button on rival team roster cards.
  - Inspecting a player deducts ¥20,000 and reveals their hidden attributes:
    - `clutchFactor` (决胜团胜负手)
    - `growthCap` (成长天花板 90-99)
    - `tiltResistance` (抗压心态指数)
    - `championMasteryBonus` (英雄绝活池深度)
  - Dedicated **Scout Report Modal** with radar visualization, scout analyst commentary, and contract buyout recommendation.

### E. Dynasty Training Camp in Phase 3
- **Files**: `src/components/phase3/DynastyTrainingCampModal.tsx` (new), `src/components/phase3/PhaseThreeDynasty.tsx`, `src/types/game.ts`
- **Features**:
  - Add "王朝特训营" (Dynasty Training Camp) to the Phase 3 Quick Navigation hub.
  - Allocate a 50,000 Dynasty Budget per training session to assign intensive coaching programs (Mechanics Drill vs. Macro Tactical Review) to designated roster members.
  - Applies a 7-day timed buff tag on the player card (e.g., `+6 微操 (剩余 7 天)`), boosting team OVR and Worlds / Tour simulation odds.

### F. Legacy Lore: Historical Esports Chronicles
- **Files**: `src/components/features/LegacyLoreModal.tsx` (new), `src/data/legacyLoreData.ts` (new), `src/components/Header.tsx`
- **Features**:
  - Chronicled archive of legendary esports rivalries (e.g., "双雄争霸 2021", "神仙打架 纳什男爵大逆转", "巅峰对决 0.1秒极限偷家").
  - Unlocked by achieving Prestige generations, total World Tour floors, and career milestones.
  - Interactive lore log with retrospective analysis, match stats reconstructions, and commemorative badges.

### G. TapTap Maker Lua Integration (Lua Studio)
- **File**: `src/components/LuaStudioModal.tsx`
- **Modules**:
  - `mvp_system.lua`: Implements MVP calculation formula, legacy stat increments, and visual FX callbacks.
  - `rivalry_nemesis.lua`: Tracks solo queue encounters, Nemesis triggers, and bounty LP payouts.
  - `training_camp.lua`: Manages Phase 3 coaching budget deductions and 7-day boost timers.
  - `scouting_reports.lua`: Implements deep scouting fee deduction and hidden potential generation.
  - `legacy_lore.lua`: Manages milestone unlocking and retrospective chronicles data.

---

## 3. Verification & Usability Testing Plan
- **Retirement Flow**: Verify that transitioning from Phase 2 to Phase 3 displays the GOAT rating and lifetime trophy/salary summary.
- **Match MVP Flow**: Run a ranked solo match, verify Framer Motion pop-up animation, gold-shimmer styling, and Legacy stat increment.
- **Nemesis System**: Simulate multiple encounters with rival players, verify the 'Nemesis' status badge in `MatchStatsModal` and bonus LP delivery.
- **Deep Scouting**: In Global Power Rankings, scout rival players for ¥20,000, verify budget deduction and scout report dialog rendering.
- **Dynasty Training Camp**: In Phase 3, allocate coaching budget to a player, verify budget deduction and active 7-day boost tag.
- **Legacy Lore**: Open the lore modal, verify prestige milestone locks and readable chronicled logs.
- **Code Integrity**: Run `compile_applet` and `lint_applet` to ensure zero compilation or type errors.
