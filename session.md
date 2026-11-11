# Tubby Springs development session

## Direction

Cute, funny animal hot spring management with natural growth and autonomous guests. Cut-paper collage art. Expanded map-first UI. Coins, visitors, facilities, weather, reputation, save/load and small milestones.

## Implemented

- Replaced the previous simulation with a resort model and service-based economy.
- Added construction, capacity, queues, maintenance, cleaning, upgrades and towel parties.
- Guests enter, choose services, pay, relax, leave reviews and depart.
- Gardens grow naturally; weather and reputation affect visits and animal unlocks.
- Rebuilt all UI around the large map with contextual paper cards.
- Four DreamLayer character references and animation bundles; original output retained.
- New facility/landscape/icon art and local fonts.
- Independent browser save namespace; five-second autosave.
- Tests for money, service capacity, simulation progression and saves.

## Developer secrets

Use `.env.local` for DREAMLAYER_API_KEY. Never commit it or expose it through VITE_ variables. Read capabilities/balance before further paid asset work. Preserve request and execution identities when recovering jobs.

## Animation corrections

- DreamLayer regenerated capybara idle with four grounded legs and no extra arms.
- DreamLayer regenerated Shiba eating: head lowers to a food bowl on the ground.
- Both replacements retain seven transparent 256px frames; display scale and feet alignment remeasured.
- Original v1 bundles archived; repair prompts and execution identities recorded.

## Contextual map interface

- Green landscape copy stays hidden until 60 seconds without pointer, touch, wheel or keyboard activity; it fades out on interaction and stays hidden during menus, details and building.
- Day/weather and To-do cards are hidden by default, opened through small map controls for 10 seconds, and briefly shown for new day/weather or a completed milestone.
- Camera bounds expand symmetrically when the viewport exceeds the world at a given zoom, keeping Fit and zoom-out centered on desktop and mobile.

## Expanded resort map

- World enlarged from 1400 × 950 to 4200 × 2850 (nine times the area).
- Expanded build boundaries and added eight meadow areas with paths and trees.
- Existing facilities, guests, entrance and saves retain their coordinates.
- Initial camera shows the existing resort; Fit reveals all expansion land. Increased maximum zoom preserves close-up detail.
- Verified construction near the far corner and its save/restore behavior.

## Central park and long-term progression

- Starter park and entrance moved to the center meadow; v1 saves translated once to schema v2, including guest travel targets. Existing wealth and milestones retained.
- Getting started is a separate five-step tutorial with a one-time welcome gift.
- To-do is a permanent three-slot commission board; claiming replaces a task and grants coins, retreat XP and research stamps. Tasks continue after the last chapter.
- Eight career chapters require both XP and commissions. Added eight research projects, caretaker hiring/dismissal, level-4/5 facilities and four rotating guest clubs.
- Nine meadows support three levels of themed investment with capacity, fee and garden-growth effects. Added 29 tiered achievements with one-time stamp rewards.
- 20-hour scripted balance run reached Chapter 7, 898 completed commissions and 8 researches; last chapter remains near the 20-hour mark. Normal playtime varies; this is simulated 1x business time, not a human engagement test. Report and repeatable script included.

- Browser verification passed for separate introduction, continuing commissions, reward claims, research, caretaker hiring, themed investment and mobile layout. Fixed static detail panels rebuilding unnecessarily during the live UI refresh; full data attributes preserve keyboard focus. Large coin balances use compact header notation.

## itch.io package

- Added a relative Vite base and corrected dynamic sprite/portrait paths for nested hosting.
- Added `npm run build:itch` and a runtime-only ZIP packager.
- Release: `releases/tubby-springs-0.3.0-itch-web.zip`, 24 files, approximately 4.77 MB. Includes local sprites, fonts and font licenses; no developer environment files or source-generation archives.
- Upload instructions and recommended fullscreen launch settings saved in `docs/itch-upload.md`.
- Extracted-ZIP verification passed under a nested URL in a 1280 × 720 iframe: menu, canvas, all sprite/portrait resources, local fonts, Credits and continuing commissions loaded without game HTTP or JavaScript errors. No itch.io account upload was performed.
