# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An Evangelion-style "Active Time Display" HUD, replicated flat (no 3D/perspective skew) at exact 1920×1080 scale from a specific reference screenshot, and rendered to a looping MP4 for use as a video wallpaper on a car's infotainment display (BYD Dolphin / DiLink). The HTML page is the source of truth; the MP4 in `dist/` is a build artifact, not something to hand-edit.

## Development

```bash
python3 -m http.server 8934 --directory /Users/eunitembam3/eva
open http://localhost:8934/index.html
```

No build step for editing the page itself — it's plain `index.html` + `style.css` + `app.js`, no framework, no external fonts or network requests. Layout is authored in fixed pixels against a 1920×1080 canvas (`#stage`), not responsive units — this is a fixed-resolution kiosk/video output, not a page that needs to reflow.

## Re-rendering the video

The page runs a continuous, seamless-loop animation driven by wall-clock time modulo a fixed cycle length (`CYCLE_MS` in `app.js`, currently 60000ms = 60s). **The clock digits are decorative, not real time** — `FIXED_HH`/`FIXED_MM` are constant dressing values, and only `SS.cc` (seconds + centiseconds) actually ticks. This is deliberate: a static video loop can't display genuine wall-clock time (it would just replay whatever moment was captured, forever), so only the fast-changing digits animate, on a cycle length equal to their natural wrap period (60s), which is what makes the loop boundary invisible.

Because of that, **any 60-second recording window loops perfectly** — no need to align capture to a specific start frame.

1. Start the server above.
2. Record one cycle with Playwright (produces a `.webm` in `dist/`):
   ```js
   const { chromium } = require('playwright');
   const browser = await chromium.launch();
   const context = await browser.newContext({
     viewport: { width: 1920, height: 1080 },
     recordVideo: { dir: '/Users/eunitembam3/eva/dist', size: { width: 1920, height: 1080 } },
   });
   const page = await context.newPage();
   await page.goto('http://localhost:8934/index.html');
   await page.waitForTimeout(61000); // one full cycle + buffer
   await context.close();
   await browser.close();
   ```
   (`playwright` is installed at the home-directory root's `node_modules`, not inside this project.)
3. Trim to an exact 60.000s window and encode to H.264 (any 1s+ offset works, since the signal is periodic):
   ```bash
   ffmpeg -y -i dist/page@*.webm -ss 1.0 -t 60.0 \
     -vf "fps=30,format=yuv420p" \
     -c:v libx264 -profile:v high -level 4.0 -preset slow -crf 18 \
     -movflags +faststart \
     dist/eva-hud-wallpaper.mp4
   ```

If `ffmpeg` fails with a missing `libx265` dylib error, a Homebrew `x265` upgrade has outpaced the linked `ffmpeg` build — `brew reinstall ffmpeg` fixes it.

If you change `CYCLE_MS`, keep it a value the ticking digits (seconds) wrap evenly into (60000, 120000, ...) or the loop will visibly jump.

## Architecture

**Layout is flat, not 3D.** An earlier version applied a `perspective()`/`rotateX/Y` transform to fake a dutch-angle camera view; that's gone. `#stage` is a fixed 1920×1080 box and every element inside (`.screen`, `#readout`, `.tag-panel`, `.mode-bar`, `.tab`) is positioned with plain absolute `left`/`top` pixel values matched against the reference screenshot's proportions — no rotation, skew, or perspective anywhere.

**Timing model (`app.js`):** All animation state derives from `elapsed = (now - STATE.startTime) % CYCLE_MS` inside a single `requestAnimationFrame` loop — there's no incrementing/decrementing state to keep in sync. Only `ss`/`cs` are computed from `elapsed`; `hh`/`mm` are hardcoded strings. If you want the hour/minute digits to visibly animate too, you'd need to pick a `CYCLE_MS` that's a common multiple of all the wrap periods you want seamless (e.g. a full 24h cycle), which trades off against how fast/blurry the fastest digit looks — see the note in CONFIG.

**Seven-segment digits:** No bitmap or webfont for the digit glyphs. Each digit is a `.digit` div containing seven `.seg-[a-g]` divs shaped via CSS `clip-path` polygons (angled hex ends, matching the source anime UI's chunky look). `SEGMENTS_BY_DIGIT` in `app.js` maps each character to which segments light up; `setDigit()` toggles the `.on` class per segment rather than rebuilding DOM each frame. Digit groups are HH(2) / MM(2) / SS(2) at full size plus a smaller CS(2) centisecond group, separated by `.dot-sep` elements — colon-style double dots between the big groups, a single small dot before the centiseconds, matching the reference.

**Right-side tag panel:** `.tag-panel` is a solid black column to the right of the readout box (its left edge flush with the readout's right edge), running from the readout's top down to the bottom band. The two tag boxes (`.tag-plain`, `.tag-hazard`) sit inside it, vertically aligned with the digit row rather than the top label. `.tag-hazard` is the only one with the diagonal red/black stripe (`repeating-linear-gradient`), confined to its right ~36% via a separate `.tag-hazard-stripe` child, not applied to the whole box. The readout, tag panel, and tag boxes all carry small teal `.corner-mark` dashes at their corners.

**Mode bar:** The cells hug their text (content width with padding, not equal flex widths) and sit on the gradient just below the readout box. All four cells share the same amber text/border styling — only the active cell (`.mode-cell-active`) differs, via a solid `.mode-fill` bar positioned *below* the text with clearance, not overlapping it.

**Background:** `.screen` is a single diagonal `linear-gradient` (red → orange → yellow → green) clipped to a polygon whose bottom edge steps down via a diagonal cut to the bottom-left corner, with an SVG `feTurbulence` data-URI grain overlay at low opacity/`mix-blend-mode: overlay` plus a `.vignette` bottom darkening. `.bottom-band` is the black strip below the mode row (clipped by the screen polygon); the thin gradient sliver between it and the screen edge, plus the `.baseline` line, reproduce the reference's thin bright line near the bottom. Top/left tick marks are individual DOM elements built by `buildTicks()` in `app.js` (teal bar-pairs with dark dashes on top, teal dots with dark dashes on the left). `.fold` is the dark diagonal crease running from the screen's bottom-left corner up to the readout box's bottom-left corner (a rotated div with a bright lower edge), and `.tab` is a small dark rounded-rect nub floating on the red gradient left of the label box — both decorative details lifted directly from the reference image, not functional.
