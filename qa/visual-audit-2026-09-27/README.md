# Visual QA — 2026-09-27

Audit target: the Warung game interface at desktop, tablet, and mobile breakpoints.

## First pass

1. **World Map — improved, follow-up needed**
   - Increased node, icon, title, and chapter subtitle sizes.
   - Added bounded wrapping for long curriculum subtitles.
   - Remaining follow-up: verify locked-node spacing at narrow landscape sizes.

2. **Achievements — improved**
   - Increased badge icon, title, and description sizes.
   - Raised locked-card contrast and removed the excessive dimming.
   - Expanded the usable grid width.

3. **Teacher Dashboard — reviewed, follow-up needed**
   - Overall structure is stable at laptop landscape size.
   - Dense alert copy and KPI labels need a second readability pass.

4. **Teacher Challenge — reviewed, generally healthy**
   - No visible collisions at laptop landscape size.
   - Secondary labels should be enlarged during the language pass.

5. **Boss Battle — captured, with math text fix**
   - Found raw LaTeX markers rendering as `$t$` / `$s$` in questions and options.
   - Added a Phaser-safe formatter for the curriculum math commands and verified the battle screen loads.

6. **Multiplayer Lobby / Room — improved and captured**
   - Found room creation blocked by unsupported browser `prompt()` when the generated chef name was still default.
   - Room creation now uses the generated chef name without blocking and the room screen renders in English when English is selected.

7. **Co-op Cooking — captured, generally healthy**
   - Local shared-screen flow reached the math station and showed a clear step-by-step solution with a visible continue action.
   - The top co-op HUD is partially hidden behind the math modal at this viewport; this should be tightened in the responsive pass.

8. **Result page — captured and corrected**
   - Added a query-gated `?qa=result` preview route for repeatable visual checks.
   - Found the reward strip overlapping the performance rows on compact FIT viewports.
   - Moved the reward strip and return button into a dedicated lower band, and kept level-up feedback out of the score table.

9. **Utensil art — shared system started**
   - Added a painted transparent utensil atlas for the knife, measuring cup, wok, tea cup, kettle, cashier, money, and satay grill; retained matching vector fallbacks.
   - Chop, Measure, Teh Tarik, Cashier, Stir Fry, and Satay now use the illustrated props. Atlas crop bleed was corrected on the cup/wok/register assets.
   - Removed the wok's oversized burner rings, replaced the Stir Fry heat disc with small flame tongues, and kept utensil scale/contrast aligned with the shared Warung palette.

10. **Mini-game interaction pass — improved**
   - Common help, pause/resume, and restart controls are available in the mini-game shell.
   - Sorting, Timing, Data, Route, Temperature, Mix, and Cashier now show readable success/failure feedback; Sorting returns accuracy based on correct answers.
   - Corrected Sorting's white-on-cream item label and Temperature's white-on-cream idle readout.
   - Updated English and Bahasa Melayu instructions so Sorting describes its choice buttons and Mix describes its actual flour/water controls; removed the mixed Malay/English Stir Fry copy from the English locale.
   - Timing's action/counter spacing was corrected. Probability now asks for a prediction first and spins to weighted sectors (Blue 1/2, Red 1/4, Gold 1/4) instead of always forcing a Gold result.
   - Added a shared centered hit-area helper to mini-game controls and the reusable button component, matching the centered illustrations and making the full button face the active target.

11. **Responsive spot check — landscape-first behavior confirmed**
   - At 360×800 and 390×844 phone portrait, and 768×1024 tablet portrait, the game intentionally shows a clear rotate-to-landscape card rather than compressing the cooking UI into an unreadable column; the card now follows the saved UI language instead of mixing English and Malay.
   - At 800×360 landscape, all controls remain on-screen and clickable, though the fixed 16:9 game canvas is letterboxed and comparatively small. This is a known follow-up for a true compact-landscape layout.
   - At 1366×768, the tested mini-game shell and utensil layouts fit without clipping; the main remaining QA limitation is device-specific compact-landscape sizing.

## Evidence

- `01-achievements-912x512.png`
- `02-world-map-912x512.png`
- `03-multiplayer-room-912x512.png`
- `04-boss-battle-912x512.png`
- `05-coop-math-912x512.png`
- Result page verified with `http://127.0.0.1:3000/?qa=result` at 912×512.

Screenshot-only review cannot confirm keyboard focus, screen-reader behavior, or full WCAG compliance. Those require interaction and semantic testing.

Mini-game preview routes for repeatable checks: `/?qa=minigame&game=chop|measure|mix|temperature|timing|sort|route|data|probability|cashier|satay|tehtarik|stirfry`.
