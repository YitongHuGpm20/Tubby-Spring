# itch.io browser release

Upload `releases/tubby-springs-0.3.0-itch-web.zip`. This is a Phaser HTML5 game with WebGL rendering and Canvas fallback.

1. Create or edit your itch.io project. Choose **HTML Game** under Kind of game.
2. Upload the ZIP as one file and select **This file will be played in the browser** if shown.
3. Choose **Click to launch in fullscreen**. The game adapts to the launch viewport. For in-page play, use a 1280 × 720 viewport and enable the fullscreen button.
4. Keep Click to Play enabled. Preview the project, start the game, open Credits and check a guest/facility before publishing.

Official instructions: https://itch.io/docs/creators/html5

## Rebuild

```sh
npm run build:itch
```

The package contains only `dist` contents, with `index.html` at the ZIP root, local sprites/fonts and font licenses. Vite uses a relative base; dynamic sprite and portrait paths are relative too. It does not need a backend or runtime DreamLayer access. The original-generation ZIPs, source code and developer environment files are not part of this upload.

The 0.3.0 package has 24 files and is approximately 4.77 MB compressed. The release was checked as an extracted ZIP under a nested URL inside a 1280 × 720 iframe, matching itch.io's hosting model. This local check is not an itch.io upload or account publication.
