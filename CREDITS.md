# Tubby Springs — Credits & Asset Sources

This register covers the character artwork, animation sheets, portraits, scenery, facilities, interface, icons, fonts and visual references included in the current game. Updated 2026-10-11.

## Character artwork — DreamLayer

All four character references and all twelve character animation sheets were generated for Tubby Springs through the [DreamLayer Agent API](https://docs.dreamlayer.io/agent-api). Generation date: 2026-10-11. Developer client: DreamLayer CLI `0.4.0-beta.4`. The requested visual direction was a cute, warm pastel cut-paper collage with ivory scissor-cut edges.

Each animation contains 7 transparent 256 × 256 frames. Original reference images, ZIP bundles, GIF previews and atlas metadata are retained in [assets-source/dreamlayer](assets-source/dreamlayer/). The [generation manifest](assets-source/dreamlayer/generation-manifest.json) records individual request identities, operations, frame settings and original filenames. The API does not identify the underlying image or animation model in these records; no specific model attribution is claimed.

### Reference images

| Character | Original reference | Request identity |
| --- | --- | --- |
| Capybara | [capybara.png](assets-source/dreamlayer/references/capybara.png) | `tubby-reference-v1-capybara` |
| Shiba Inu | [shiba.png](assets-source/dreamlayer/references/shiba.png) | `tubby-reference-v1-shiba` |
| Raccoon | [raccoon.png](assets-source/dreamlayer/references/raccoon.png) | `tubby-reference-v1-raccoon` |
| Penguin | [penguin.png](assets-source/dreamlayer/references/penguin.png) | `tubby-reference-v1-penguin` |

### Runtime animation sheets

| Character | Action | Runtime PNG | Original bundle |
| --- | --- | --- | --- |
| Capybara | Walk | [capybara-walk.png](public/art/capybara-walk.png) | [ZIP](assets-source/dreamlayer/capybara-walk.zip) |
| Capybara | Idle | [capybara-idle.png](public/art/capybara-idle.png) | [ZIP](assets-source/dreamlayer/capybara-idle.zip) |
| Capybara | Bathing / relaxation | [capybara-bathing.png](public/art/capybara-bathing.png) | [ZIP](assets-source/dreamlayer/capybara-bathing.zip) |
| Shiba Inu | Walk | [shiba-walk.png](public/art/shiba-walk.png) | [ZIP](assets-source/dreamlayer/shiba-walk.zip) |
| Shiba Inu | Idle | [shiba-idle.png](public/art/shiba-idle.png) | [ZIP](assets-source/dreamlayer/shiba-idle.zip) |
| Shiba Inu | Eating | [shiba-eating.png](public/art/shiba-eating.png) | [ZIP](assets-source/dreamlayer/shiba-eating.zip) |
| Raccoon | Walk | [raccoon-walk.png](public/art/raccoon-walk.png) | [ZIP](assets-source/dreamlayer/raccoon-walk.zip) |
| Raccoon | Idle | [raccoon-idle.png](public/art/raccoon-idle.png) | [ZIP](assets-source/dreamlayer/raccoon-idle.zip) |
| Raccoon | Sleeping | [raccoon-sleeping.png](public/art/raccoon-sleeping.png) | [ZIP](assets-source/dreamlayer/raccoon-sleeping.zip) |
| Penguin | Walk | [penguin-walk.png](public/art/penguin-walk.png) | [ZIP](assets-source/dreamlayer/penguin-walk.zip) |
| Penguin | Idle | [penguin-idle.png](public/art/penguin-idle.png) | [ZIP](assets-source/dreamlayer/penguin-idle.zip) |
| Penguin | Bathing / relaxation | [penguin-bathing.png](public/art/penguin-bathing.png) | [ZIP](assets-source/dreamlayer/penguin-bathing.zip) |

For every bundle, the adjacent `<character>-<action>-atlas.json` and `<character>-<action>-preview.gif` are original DreamLayer outputs. Runtime sheet PNGs are copied directly from each ZIP's `sheet.png` without changing image pixels. The game preserves exported frame timing and adjusts display scale and ground anchors through metadata.

### Portraits and derived files

[capybara-portrait.png](public/art/capybara-portrait.png), [shiba-portrait.png](public/art/shiba-portrait.png), [raccoon-portrait.png](public/art/raccoon-portrait.png) and [penguin-portrait.png](public/art/penguin-portrait.png) are each the first transparent PNG frame of that character's DreamLayer walk bundle. They are not separate generations or externally sourced illustrations.

The [runtime sprite manifest](src/game/spriteManifest.json) is derived from the DreamLayer atlases and measured alpha bounds. Import and measurement tools: [import-sprites.py](scripts/import-sprites.py), [measure-sprites.py](scripts/measure-sprites.py).

**Rights attribution:** these are AI-generated assets produced using the project's DreamLayer account, subject to that service's applicable terms. They are not credited as CC0, public-domain artwork, or an externally licensed sprite pack. No external character reference was uploaded for this batch; each reference was generated through text-to-image.

The capybara idle and Shiba Inu eating animations were regenerated with DreamLayer on 2026-10-11: capybara idle keeps four grounded legs without extra torso limbs; Shiba Inu lowers its head to eat from a bowl on the ground. The current ZIPs, previews and atlases include these revisions. Previous outputs are retained in `assets-source/dreamlayer/revisions/v1/`; repair prompts and execution records are in the generation manifest.

## Original scenery, facilities and interface artwork

The following art was authored in code for Tubby Springs with Codex assistance. It is project-specific SVG, Phaser graphics or CSS rather than downloaded stock art. No external icon library or scenery pack is used.

| Artwork | Contents | Source file |
| --- | --- | --- |
| Facility illustrations | Hot spring, snack shack, cozy cabin and wild garden; corresponding construction-menu illustrations | [src/game/art.ts](src/game/art.ts) — `facilityArt` |
| Trees and entrance sign | Evergreen tree, blossom tree, wooden Tubby Springs sign | [src/game/art.ts](src/game/art.ts) — `treeArt`, `blossomArt`, `signArt` |
| Paper texture in illustrations | Procedural SVG noise, cream cutout outlines and layered shapes | [src/game/art.ts](src/game/art.ts) — SVG wrapper and filter |
| Landscape | Ground, layered hills, grass speckles, river, paths, stepping stones, entrance planks and decorative lettering | [src/game/ResortScene.ts](src/game/ResortScene.ts) — `drawGround` |
| Activity and weather effects | Steam, bath ripples, rain, growing flowers, snack props and selection / placement indicators | [src/game/ResortScene.ts](src/game/ResortScene.ts) — `drawEffects` |
| UI icons | Coin, star, guests, book, sun, leaf, pause, play, sound, build, close, check and arrow | [src/game/art.ts](src/game/art.ts) — `icon` |
| Brand treatment | Tubby Springs wordmark, hot-spring sticker and welcome illustration | [src/main.ts](src/main.ts), [src/style.css](src/style.css) |
| Paper interface | Torn borders, tape strips, task note, construction cards, guest cards, cashbook, receipt rows, guide and dialogs | [src/main.ts](src/main.ts), [src/style.css](src/style.css) |
| Favicon | Cream hot-spring symbol on a rounded peach background | [public/favicon.svg](public/favicon.svg) |

The hot-spring mark `♨` and party decoration `✳` are Unicode text characters rendered by available fonts, not imported image assets. Small punctuation, help, zoom and speed controls are also text. Platform-specific glyph appearance can vary.

## Visual reference

[Vincent Wei's 15 Motion Design Styles](https://vincentwei1021.github.io/mg-styles-15/), **ninth displayed entry: Collage / Cutout Animation**, was the visual reference selected for this project. Its source/demo slug is `06-collage`, which differs from its position in the page's list.

The reference informed the paper layering, scissor-cut outlines, taped cards and stepped animation direction. No photographs, collage cutouts, video, audio or executable demo code from that collection are included in the game. The game illustrations and UI were created separately for Tubby Springs.

## Fonts

| Font | Attribution and upstream source | Included file | License |
| --- | --- | --- | --- |
| Fraunces | Copyright 2018 The Fraunces Project Authors; [official project repository](https://github.com/undercasetype/Fraunces) | [Fraunces-Variable.ttf](public/fonts/Fraunces-Variable.ttf) | SIL Open Font License 1.1; [included license](public/licenses/Fraunces-OFL.txt) |
| Patrick Hand | Copyright 2010–2012 Patrick Wagesreiter; [Google Fonts source directory](https://github.com/google/fonts/tree/main/ofl/patrickhand) | [PatrickHand-Regular.ttf](public/fonts/PatrickHand-Regular.ttf) | SIL Open Font License 1.1; [included license](public/licenses/PatrickHand-OFL.txt) |

These existing local font files were retained in the redesign. Arial, Georgia, generic serif, sans-serif, cursive and system-ui are platform font requests/fallbacks; their binaries are not bundled with the project. The included OFL license files retain their full copyright and license notices.

## Promotional cover artwork

[Itch.io cover image](releases/tubby-springs-cover-v1.png) was generated on 2026-10-11 with OpenAI ImageGen through Codex’s built-in image generation tool. The four existing DreamLayer character portraits supplied the character design references; a local game screenshot supplied the palette and paper-collage style reference. The cover scene and lettering are new ImageGen artwork. This promotional image is separate from the DreamLayer runtime sprite sheets and is not bundled in the browser game. [Generation prompt](releases/tubby-springs-cover-v1-prompt.txt).

## Screenshots

[Desktop preview](docs/preview-desktop.png) and [mobile preview](docs/preview-mobile.png) were captured from the running Tubby Springs game during local Chrome verification. They are derived game screenshots, not external stock images or UI reference mockups.

## Sound

The interface chime is synthesized with the browser Web Audio API in [src/main.ts](src/main.ts), `tone`. No recorded sound files or music tracks are bundled.

## Software and asset tools

Phaser, Vite, TypeScript and tsx retain their respective upstream licenses. DreamLayer CLI beta is a developer generation tool. Pillow is used by the developer pipeline to read alpha bounds; it does not edit the generated artwork or ship in the browser game. Software libraries are not credited as sources of the game's illustrations.
