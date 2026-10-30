# Robot race v51 verification (2026-10-30)

- `npm test`: 8/8 passed. Includes all 4,950 count/winner combinations for 1–99 entrants, nested ceiling-halves, winner survival, exhaustive small-field sampling symmetry for both obstacles, and visual-seed independence.
- `node --check public/app.js` and `node --check public/robot-race.js`: passed.
- `git diff --check`: passed.
- `node tests/robot-browser.mjs`: Chromium and WebKit passed. Checks actual canvas number labels for 40 → 20 → 10 robots and ten trailing number plates, result, replay, reduced motion, offline replay, no JavaScript errors, and 320×568 / 390×844 / 844×390 / 1024×768 layouts. Screenshots inspected for trailing number placement.
- Existing `node tests/browser.mjs`: the default numbers-mode 844×390 start-button viewport assertion fails (button bottom 403.5px). Reproduced with the unchanged pre-v51 stylesheet. This is outside robot mode; robot-mode layout checks pass.
- Real iPhone hardware and audible speaker volume were not tested. WebKit viewport simulation is not a physical device test.

Winner selection remains in app.js through draw.js rejection-sampled cryptographic randomness. Robot survival uses independent unbiased Fisher–Yates choices; rendering never modifies the winner or survival sets. New effects use continuous movement and fade-out, with no flashing. Running tones are lowered to one fifth of their previous gain and suppressed under reduced motion. Cache and entry/module versions are v51.
