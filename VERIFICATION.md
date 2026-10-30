# Robot race v51 verification (2026-10-30)

- `npm test`: 8/8 passed. Includes all 4,950 count/winner combinations for 1–99 entrants, nested ceiling-halves, winner survival, exhaustive small-field sampling symmetry for both obstacles, and visual-seed independence.
- `node --check public/app.js` and `node --check public/robot-race.js`: passed.
- `git diff --check`: passed.
- `node tests/robot-browser.mjs`: Chromium and WebKit passed. Checks actual canvas number labels for 40 → 20 → 10 robots and ten trailing number plates, result, replay, reduced motion, offline replay, no JavaScript errors, and 320×568 / 390×844 / 844×390 / 1024×768 layouts. Screenshots inspected for trailing number placement.
- Historical v51 issue (resolved in v52 below): `node tests/browser.mjs`: the default numbers-mode 844×390 start-button viewport assertion fails (button bottom 403.5px). Reproduced with the unchanged pre-v51 stylesheet. This is outside robot mode; robot-mode layout checks pass.
- Real iPhone hardware and audible speaker volume were not tested. WebKit viewport simulation is not a physical device test.

Winner selection remains in app.js through draw.js rejection-sampled cryptographic randomness. Robot survival uses independent unbiased Fisher–Yates choices; rendering never modifies the winner or survival sets. New effects use continuous movement and fade-out, with no flashing. Running tones are lowered to one fifth of their previous gain and suppressed under reduced motion. Cache and entry/module versions are v51.

## v52 — numbers-mode responsive layout (2026-10-30)

The numbers-mode grid now fits the viewport, and its number scales to the remaining stage height rather than the entire screen. On narrow landscape screens, settings use two rows. The button stays at least 44px tall; number rendering cannot push it offscreen.

- Before the fix, `node tests/numbers-layout.mjs` reproduced the 844×390 button bottom at 403.5px.
- After the fix, that test passes in Chromium and WebKit at 844×390, 667×375, 568×320, 320×568, 390×844, and 1024×768, checking idle/running/result states, viewport bounds, and number/control separation. The smallest landscape screenshot was visually inspected.
- Existing `node tests/browser.mjs`: passes in Chromium and WebKit, including the formerly failing landscape assertion, sound persistence, reduced motion, replay and offline reload.
- `node tests/robot-browser.mjs`: passes in Chromium and WebKit.
- `npm test`: 8/8 pass; `node --check public/app.js` and `git diff --check` pass.
- PWA cache and entry version: v52. Physical iPhone hardware was not tested.
