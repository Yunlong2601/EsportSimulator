# Esports Career and Club Ownership — Design Draft

Planning date: 2026-10-08. Status: discussion draft; implementation has not started.

## Confirmed direction

- A deep management and realistic simulation game, presented primarily through text.
- Begin as an esports player, live a career, retire, and purchase a team with full control.
- Requested setting: real League of Legends teams, players, and champions.
- First fully playable region: China / LPL ecosystem.
- Primary screen: mobile portrait.
- Starting season: 2026.
- Target audience and distribution: players in China, with TapTap as the intended release platform.
- Development platform: the existing bound TapTap Maker project.
- Primary interface, narration, tutorials, and character creation language: Simplified Chinese.

The working opening point is the 2026 preseason, before the first competitive matches. The exact calendar date and corresponding roster snapshot still need verification. Monetization remains open; targeting TapTap does not select a business model. All mechanics and milestone scope below are recommendations.

## Central promise

One person, one evolving esports world, one continuous save. A former teammate can become your coach, a rival can become your first signing, and your reputation as a player can help or hurt your club.

Progression: ranked prospect → trial or development roster → professional player → veteran → retirement → club acquisition → owner.

This is a possible journey, not a guaranteed sequence of promotions. Being benched, changing roles, losing a contract, taking a smaller offer, and rebuilding a career should remain playable outcomes. Retirement changes your responsibilities; it does not reset the world.

## Player career

Create a fictional protagonist within the real starting roster database. Choose a handle, eligible starting age, home background, main role, initial champion preferences, and strengths and weaknesses. Entry requirements follow the selected competition and year.

All five roles must feel different. A jungler develops pathing and objective judgment; a support develops vision and engage judgment; lane roles develop matchup knowledge, wave control, positioning, and their role's team responsibilities.

Track four connected layers:

- Ability: mechanics, lane or jungle fundamentals, map awareness, teamfighting, communication, adaptability, and champion mastery.
- Condition: fatigue, form, motivation, pressure, and recovery needs. Age influences development without imposing one universal retirement birthday.
- Career: selection status, coach trust, teammate relationships, agent relationship, reputation, offers, and contract obligations.
- Personal life: savings, living costs, family or friend commitments, public appearances, streaming time, and long-term goals.

Hidden potential and imperfect scouting provide uncertainty. Visible development reports explain the effects of training, coaching, experience, and recovery. Simulation ratings for real people are game estimates, not claims about their private lives or exact abilities.

## 中国 TapTap 首发与角色创建

面向中国玩家设计简体中文的竖屏电竞人生模拟。默认从中国电竞环境进入 2026 年生涯，创建角色以个人身份、打法和职业起点为主。国家、语言等跨赛区信息可以放入扩展档案，无需挤占开局的主要流程。电竞 ID 保留玩家输入的中文或英文形式。

建议开局分成四步，每一步都可以清楚看到选择的影响：

1. **建立档案**：姓名、电竞 ID、头像、外观、家乡和符合所选赛事资格的起始年龄。外观只改变展示，不增加竞技属性；家乡不提供能力加成。
2. **选择打法**：主位置（上单／打野／中单／下路／辅助）、副位置、本命英雄和初始英雄池。位置与英雄熟练度决定训练方向和试训适配，而不是永久限制职业发展。
3. **决定出身**：路人高分玩家、青训试训生、业余赛选手、主播转职业。分别侧重个人操作、系统训练、比赛经验或已有关注度，同时设置团队经验、竞争压力、资源或时间安排方面的取舍。家庭经济与支持态度影响生活开支、可用时间和剧情，不决定天赋。
4. **分配能力与设定目标**：在固定预算内分配操作、意识、配合、心态等初始能力，选择两项长处和一项短板，再设置首发、冠军、收入或退役后买队等个人目标。目标可以在生涯中调整。

创建完成后展示一张中文选手档案卡，列出起点、能力、生活条件和第一项任务，让玩家知道每个选择意味着什么。推荐首次进入的任务为安排训练并准备试训；是否直接获得青训机会可以作为开局难度选项，尚未确定。

个人收入默认以人民币展示，金额按需要使用元／万／亿，并明确月薪、年薪、奖金和俱乐部资金的区别。剧情可围绕试训、替补竞争、训练赛复盘、家人沟通、直播安排、转会和退役展开。避免把单一家庭态度或人生经历设为所有中国角色的默认情况。

原型优先使用头像与少量外观选项；深度放在出身、打法、关系和生涯选择上。复杂捏脸与付费能力系统不属于当前已确认范围。

## Time and weekly decisions

Use a dated calendar with a weekly planning screen. Matches, contract deadlines, training, and events occur on their actual scheduled dates within that week. A week can contain several matches or none.

Loop: read messages → plan available time → resolve training and life events → prepare for scheduled matches → play or simulate → review performance, money, and relationships.

Time is limited. Mandatory team commitments consume part of the schedule; the player allocates remaining time among focused practice, champion learning, replay review, recovery, social commitments, and optional income activities.

Example: a patch weakens your best champion. Learning another pick improves flexibility but costs preparation time. More scrims may improve selection chances while increasing fatigue. Streaming earns personal income but uses the same available time. Effects should have understandable causes and delayed consequences.

Support saved weekly routines and advance-to-next-important-event. Stop simulation for decisions that materially change contracts, career, or ownership. Long careers should not require manually repeating identical training clicks.

## Matches and competitive realism

Model draft, lane matchups, champion familiarity, composition, vision, objectives, resource distribution, team coordination, and execution. Decisions change the match state; the match engine resolves outcomes with bounded uncertainty.

Present a compact text broadcast with score, time, resources, objectives, and decisive events. Offer quick simulation, highlights, and a detailed log. Commentary and statistics must be derived from the same recorded events so the story agrees with the score.

Player mode gives decisions appropriate to your role and authority: champion preferences, risk level, rotations, team communication, and a few meaningful in-game decisions. Coaches and teammates retain agency. Captaincy or earned trust can increase your influence.

Owner mode controls hiring, preparation, tactical philosophy, and permitted between-game adjustments, with optional delegation to staff. Owning a club does not automatically provide unrestricted live coaching during official games.

Champion picks should involve tradeoffs rather than a single overall rating. Match reports should explain factors such as a losing matchup, failed vision setup, strong scaling composition, or fatigue without exposing perfect information about opponents.

League formats, roster restrictions, draft rules, competition eligibility, transfer windows, and international qualification must be data for a specific region and season. Do not assume every region uses identical splits or that winning a lower league automatically grants a top-league seat. Riot's [2026 League Handbook](https://lolesports.com/en-US/season/115547545029543948/handbook/115547545030002701/league/98767991299243165) describes differing regional formats and international events; the LPL-specific 2026 rules and development-path eligibility still require verification.

## Retirement and acquisition

Retirement can follow a fulfilled ambition, declining offers, accumulated fatigue, a changing personal priority, or the player's own decision. A trophy is not mandatory. The player can review career history and financial position before choosing.

Keep personal wealth separate from every club's cash. Personal income includes the protagonist's salary, negotiated bonuses, prize share, and personal commercial activity. Employment payments must also appear as expenses for the paying club. Club sponsorship and roster budgets belong to the club.

Retired players browse clubs whose owners are willing to sell. Each offer shows purchase price, ownership received, inherited obligations, roster contracts, cash, facilities, competition access, and expected operating costs. Acquisition transfers the existing club and history, not just a name or stat bonus.

The recommended first ownership path is a 100% purchase of an affordable smaller club. Buying an established LPL organization is a later ambition requiring sufficient resources and the applicable league approval. Do not guarantee that a normal playing career can fund a major organization.

If savings are insufficient, the retired player can continue earning through coaching or streaming while waiting for a suitable opportunity. Remaining retired must be a valid playable state. Acquisition requires both a purchase budget and a credible operating budget; no automatic free club is needed.

Persist the retirement and purchase transaction safely. Reloading must not duplicate salary, remove a purchased club's history, or spend the acquisition price twice.

## Full owner control

After full acquisition, the player has final authority over club decisions within contracts, budgets, and competition rules:

| Area | Decisions |
| --- | --- |
| Roster | Scout, negotiate, sign, renew, sell, release, and set permitted lineups and substitutes |
| Staff | Hire or dismiss coaches, analysts, scouts, medical staff, and commercial staff |
| Sporting direction | Choose tactical philosophy, training priorities, champion preparation, and recruitment profiles |
| Development | Recruit prospects, fund a development roster, and decide promotion opportunities |
| Business | Set payroll and departmental budgets, negotiate sponsorships, manage facilities, and review operating cash |
| Club identity | Set ambitions, culture, fan communication, and eligible branding choices |

Every department supports optional delegation. Staff execute the player's policy and report exceptions; the player can take direct control again. Full control means decision authority, while contracts, employee preferences, and financial consequences continue to matter.

## The world continues

AI clubs recruit, renew, release, and develop players using needs, budgets, scouting knowledge, and ambitions. Players age, move teams, retire, and can become staff. New fictional prospects replenish the world over long careers.

Results, transfers, relationships, achievements, and club ownership form a permanent history. Other regions initially simulate in the background, with the depth needed for relevant transfers and international competition. Broader playable regions come later.

Start from a dated 2026 preseason real-world snapshot, then allow an alternate future. Include only teams, rosters, champions, and patch information available at the chosen starting date. Do not use later 2026 results or transfers to predetermine the simulation. New real-world roster updates should not overwrite a career already in progress. Record dataset version, sources, rules version, and simulation randomness in each save. Beyond verified historical rules, future seasons use explicitly modeled rules rather than claims about real future competitions.

## Real-world content

Keep identities, roster snapshots, champion data, competition rules, and presentation assets separate from the simulation code. Unknown salaries, contract terms, and valuations must be explicitly modeled estimates rather than invented verified facts.

Riot's [Data Dragon documentation](https://developer.riotgames.com/docs/lol#data-dragon) describes versioned champion and item data. It does not provide the complete esports roster, contract, or scouting database required here; those need their own sourced snapshot and simulation values.

There is a concrete permission dependency for releasing the requested real-LoL game: Riot's [published developer policy](https://developer.riotgames.com/docs/lol) prohibits developing games using its IP. Data availability must not be treated as permission for this game. Preserve the requested real-world setting in the design, while resolving the applicable permissions before committing to that release. This draft does not establish rights to Riot content, team branding, or player likenesses.

## Mobile portrait presentation

Use readable text, vertical cards, expandable reports, and short decision screens. Keep the next event and Continue action easy to reach. Dense tables become sortable lists with tap-through details.

Player navigation: Today / Player / Team / League / Inbox.

Owner navigation: Today / Club / Recruitment / League / Inbox.

Chinese launch labels: player mode uses 今日 / 我的 / 战队 / 赛事 / 消息; owner mode uses 今日 / 俱乐部 / 引援 / 赛事 / 消息. The English labels above are planning references, not the launch interface language.

Today contains the current date, upcoming fixture or deadline, essential condition or finance summary, and pending decisions. Advanced statistics remain accessible without dominating every screen. User-facing terminology should explain consequences rather than expose internal formulas.

## Existing project and recommended changes

The following are static code findings, not runtime verification:

- `scripts/main.lua` loads both the primary management state and a separate career save.
- `scripts/secondline/State.lua` implements independent player progression and saving. `scripts/secondline/Bridge.lua` reads a management snapshot but does not implement career-to-ownership continuity.
- `scripts/CompanyState.lua` starts the primary game with a coach identity through `CoachSystem.NewCoach`.
- `scripts/CoachSystem.lua` contains ownership authority checks, but both salary and personal share purchases use company cash.
- `scripts/CareerSystem.lua` retires roster players; it does not implement the human protagonist's retirement transition.
- `scripts/StockSystem.lua` has a brand acquisition mechanic, not a transfer of an entire persistent club.
- Match, league, training, finance, staff, and UI modules provide foundations to evaluate for reuse.

Recommended foundation: a shared world clock, persistent person and club IDs, distinct personal and club accounts, a career phase, and ownership records in one versioned save. Keep simulation rules separate from screen construction. Preserve old saves and design an explicit compatibility path rather than silently combining incompatible state.

## Delivery sequence

1. Define the world and economy. Verify the 2026 preseason snapshot, LPL rules, and development-path eligibility; design shared state, personal accounts, contracts, ownership, and saved history. Establish the content permission path.
2. Prove the continuous journey. Implement a bounded competition with a playable veteran scenario: prepare and play a split, retire, purchase a suitable club, change its roster and budget, and compete in the following split against continuing rivals. Use development scenarios to reach retirement quickly without distorting normal aging.
3. Add the full player career. Rookie entry, trials, selection competition, training, role-specific match decisions, transfers, life events, reputation, long-term development, and generated prospects.
4. Deepen ownership and the world. Scouting uncertainty, staff delegation, development rosters, tactical identity, sponsorships, facilities, financial recovery, and international competition.
5. Expand content and polish. More playable regions, richer champion and patch modeling, additional career events, accessibility, localization, and mobile performance work.

The first playable release should already include player-to-owner continuity. Stock trading, extensive property management, unrelated business ventures, and a large branching story catalog can wait until the core simulation is convincing.

## Acceptance criteria for the first playable slice

- One save retains identity, age, earnings, teammates, rivals, results, and league history through retirement and ownership.
- Personal earnings and club expenses reconcile; buying a club changes ownership once and preserves its obligations.
- Player mode cannot spend club funds or make unauthorized management decisions.
- An acquired club provides full management access and optional delegation.
- Training, fatigue, champion familiarity, and tactical choices have explainable effects on matches.
- Contract expiration, roster eligibility, qualification, and calendar progression follow the chosen rule set.
- A loss, benching, retirement without enough money, or rejected purchase leaves a meaningful next action.
- Save and reload during key transitions preserve outcomes and pending decisions.
- A player can complete the core flow on a portrait phone without clipped actions or unreadable mandatory tables.

## Next planning decisions

- Starting snapshot: verify the exact 2026 preseason date and the rosters, champion patch, and rules available then.
- Confirm the initial Chinese character-creation choices and opening difficulty options; additional interface languages can be considered later.
- Define the first protagonist setup and map one detailed in-game week.
- Confirm the scope of the first playable career-to-owner scenario before implementation.
