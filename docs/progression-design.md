# Tubby Springs — long-term progression

## Play loop

Build and upgrade a retreat → balance service capacity, travel, pricing and cleanliness → earn guest income and retreat XP → fulfil three ongoing commissions → earn research stamps → invest in research, caretakers and nine themed meadows → develop a larger, more specialised retreat.

The five Getting started milestones are a separate introduction. Their welcome gift can be claimed once. They never replace the continuing To-do board.

## Campaign structure

Chapters require **both** cumulative service/task XP and completed commissions. There are no real-time waiting gates. Faster simulation and more efficient layouts can accelerate progression.

| Chapter | XP | Commissions | New decisions |
| --- | ---: | ---: | --- |
| 1 · A tiny retreat | 0 | 0 | Entry economy, needs, pricing, queues; independent introductory checklist |
| 2 · Word gets around | 350 | 3 | Towel training, caretakers, rotating guest clubs |
| 3 · A proper little holiday | 2,200 | 12 | Level-4 rooms, demand-oriented services |
| 4 · Room to roam | 9,000 | 35 | Faster meadow travel, promotion, district themes |
| 5 · The towel society | 25,000 | 85 | Reduced upkeep, larger crowds and themed capacity |
| 6 · A very unbusy empire | 70,000 | 150 | Level-5 facilities, premium comfort, efficient caretakers |
| 7 · Legend of the loafers | 140,000 | 300 | Guest relations, level-3 meadow themes, gold collections |
| 8 · The grand little getaway | 230,000 | 650 | Mastery badge, continuing commissions and remaining gold objectives |

The roughly 20-hour target refers to 1× simulated resort time with active management. It is a balance target, not a claim that twenty hours of human engagement has been established. The game continues after Chapter 8; tasks do not end.

## Commission board

Three slots cover services, guest relations and resort care. Objectives rotate among hot springs, snacks, naps, garden visits, total services, happy departures, earned income, cleaning, parties, construction and upgrades. Targets grow by chapter. Tasks count work **after issuance**, avoiding instant completion from old lifetime totals. Claiming grants coins, XP and research stamps and immediately replaces the task. It cannot be claimed twice. Reward coins are not counted as service income.

Finite construction/upgrade objectives eventually switch to repeatable care tasks. Manual and caretaker cleaning both contribute to cleaning commissions. No paid task reroll or deadline is needed.

## Research and employees

Eight permanent research projects unlock higher building levels, automatic care, faster travel, visitor promotion, reduced supplies, higher fees, staff efficiency and improved guest welcome. Research needs both coins and stamps and cannot be bought twice.

Hire up to twelve caretakers after Towel training. Each costs two coins per simulation minute and cleans one low-cleanliness facility per maintenance round; Towel academy doubles output. Each cleaned facility consumes four coins of supplies. Caretakers can be dismissed to reduce costs. Manual cleaning remains available.

## Nine meadow districts

The first illustrated park and entrance occupy the central meadow. Eight surrounding areas remain available for expansion. Legacy coordinates and guest destinations migrate once; wealth and prior milestones are retained. Facilities beyond the former upper-left park wrap to the corresponding valid meadow rather than being discarded.

Each meadow can specialise in springs, snacks, cabins or gardens and reach three levels. Matching facilities receive one additional service slot and an eight-percent fee bonus per theme level. Garden themes also improve natural growth. Investments cost 5,000 / 15,000 / 45,000 coins and 3 / 6 / 9 stamps; the third tier requires Chapter 7. Changing a theme costs coins, keeps its level and does not refund prior spending. Every district can be located through the Meadows panel.

## Guest clubs and collections

Four clubs rotate every fifteen simulation minutes: Quiet soaking club, Bun inspection, Pajama symposium and Pebble appreciation day. They weight guest types and preferred activities; paid specialities gain a 25% fee bonus and garden clubs improve relaxation. They do not require new character assets.

29 achievements include bronze/silver/gold tiers for guest services, happy departures, income, freshen-ups, parties, commissions, populated meadows, research and themed districts, plus the four-species collection and campaign mastery. Each stamp reward is automatic and granted once. Species are recorded across visits rather than requiring all four on screen at once.

## Verification and limits

`npm run verify:career` runs twenty hours of simulation without waiting twenty wall-clock hours. Its scripted policy manages the resort every ten simulation seconds, cleans, researches, hires, builds, upgrades and claims commissions. It preserves existing economic rules rather than injecting extra money or XP. Every simulated hour it saves and restores the entire world and compares snapshots.

The [recorded run](career-balance-report.json) completed 898 commissions and 114,462 services, bought all eight research projects, and retained functioning tasks and economy at hour 20. It reached Chapter 7 at approximately 13.25 hours and ended with 222,692 / 230,000 XP toward the final chapter. Nine-district investment was tested separately; this policy does not optimise themed districts or exhaust all gold collections.

Unit tests cover migration, one-time claims and achievements, task replacement, independent chapter requirements, research, caretakers, advanced upgrades, district theme effects, corrupted progression recovery and existing simulation rules. Browser checks cover the centered map, fresh/late task boards, separate introduction, chapter and trophy catalogs, research, hiring, investment, reward claims and phone layout.

A human playtest is still needed to assess repetition, enjoyment, optimal layouts and the actual time taken at 1×/2×/4×. The current art roster remains four animal species and four base facility types; advanced research, themes and rotating clubs change the systems rather than adding new sprite sets.
