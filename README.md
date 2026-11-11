# Tubby Springs

A very unbusy business. Build a cut-paper animal hot spring retreat, earn coins from visitors, and let the loafing begin.

## Run

Requires Node.js 22.12 or later.

```sh
npm install
npm run dev
npm test
npm run build
npm run verify:career # accelerated validation of 20 simulation hours
```

## Play

Guests arrive automatically and pay 8 coins at entry. Each guest chooses activities based on hunger, tiredness, comfort, personal preference, cleanliness and crowding. They queue when a facility is full, spend coins on services, then leave a review and occasionally a tip. No direct movement commands are needed.

Choose a facility in the bottom dock, then click clear ground to build it. Drag to pan; scroll or use +/− to zoom. Fit returns to the whole retreat. Escape cancels construction and closes details. The guest and facility lists provide keyboard-accessible selection.

- Hot spring: 120 coins to build, 16 per service, 3 guests, 3 coins of supplies per minute.
- Snack shack: 90 to build, 12 per service, 2 guests, 2 coins of supplies per minute.
- Cozy cabin: 160 to build, 24 per service, 2 guests, 4 coins of supplies per minute. Increases resort capacity.
- Wild garden: 55 to build, free to enjoy, 4 guests, no maintenance. Grows over time and faster in rain.

The Cashbook lets you choose Friendly, Fair or Premium pricing. Friendly prices lower entry and service fees but attract visitors faster and improve initial happiness. Premium prices do the reverse. Gardens remain free.

Click a facility to freshen it for 8 coins or upgrade it. Upgrades increase capacity and paid service prices. Poor cleanliness lowers visitor happiness. Happy departures build reputation; gardens and reputation attract new animal types. A 35-coin towel party boosts guest happiness and reputation.

The 4200 × 2850 map starts with the original retreat in its **central** meadow, with a spring, a cafe, a garden and 300 coins plus the first guests' entry fees. Supply bills occur every 60 simulation seconds. A displayed day lasts 180 simulation seconds. Pause and 1×/2×/4× apply to simulation and character animation together. Tab hiding pauses the game.

Five introductory milestones live under **Getting started**. The **To-do** board contains three ongoing commissions, immediately replaced when claimed. Eight career chapters unlock through service XP and completed commissions. Research stamps earned from tasks and 29 achievements buy permanent improvements, caretaker automation and facility levels 4–5. Seasonal guest clubs rotate every 15 simulation minutes, affecting demand and service fees. Nine meadow districts can be themed and upgraded to improve matching facilities. See [the progression design](docs/progression-design.md) and [the long-run balance report](docs/career-balance-report.json). The guestbook records little stories and reviews. Cashbook entries show money sources and expenses.

## Saving

Save schema v2 migrates the original layout into the central meadow without changing currency or completed milestones. The browser storage key stays the same. The complete resort saves automatically every five seconds and on tab exit to `tubby-springs-resort-v1` in browser storage. Corrupt or unavailable storage falls back safely; the Guestbook indicates whether saving works. Starting fresh requires confirmation and affects only this game's save.

## Art and animation

The four characters are generated with DreamLayer: capybara, Shiba Inu, raccoon and penguin. Original generation bundles, previews and atlas metadata are retained in `assets-source/dreamlayer/`. Runtime sheets and portraits live in `public/art/`. The scene, buildings, icons and paper interface are original vector/code art. Source atlases retain exported frame durations; simulation time drives playback. Alpha bounds are measured to normalize display scale and ground anchors without modifying the artwork.

Developer API credentials belong in `.env.local` as `DREAMLAYER_API_KEY`, without a `VITE_` prefix. This file is ignored and never imported into the frontend. Read-only checks:

```sh
node scripts/dreamlayer.mjs capabilities
node scripts/dreamlayer.mjs balance
```

Paid generation must specify the intended reference/action and `--max-credits` for sprites. The runner journals request IDs in ignored `.dreamlayer-jobs/`. After a connection interruption inspect the existing execution and download it; do not create a replacement request. New ZIPs placed in `public/art/` can be imported without changing artwork:

```sh
python3 scripts/import-sprites.py
python3 -m pip install -r scripts/requirements.txt
python3 scripts/measure-sprites.py
```

## Architecture

- `src/simulation/progression.ts`: career chapters, ongoing commission templates, research, themed meadows and achievement definitions.
- `src/simulation/resort.ts`: visitors, service admission, money, maintenance, weather, growth, reviews and save validation.
- `src/game/ResortScene.ts`: Phaser landscape, DreamLayer sprite playback, camera, selection and construction preview.
- `src/game/art.ts`: original facility, tree, sign and UI illustrations.
- `src/main.ts`: layout, business panels, controls, guide and persistence.
- `src/style.css`: responsive paper collage interface.

Tests cover placement and spending, autonomous service capacity, economic flow, natural growth, pause, deterministic save continuation, invalid saves and duplicate service charges.

## itch.io release

Run `npm run build:itch` to create `releases/tubby-springs-0.3.0-itch-web.zip`. Upload it as an HTML Game for browser play. The ZIP has `index.html` at its root and all runtime assets use relative paths. See [upload settings](docs/itch-upload.md).
