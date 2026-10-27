# Jarvis

Vijay's personal growth tracker for Body · Brain · Mind. He logs his day in plain words ("10 min sun walk, 2 eggs + dal, read 20 pages") and gets scores, a coach-style report card, nutrition, trends and a plan.

- Live site: https://patekarvijay262-spec.github.io/jarvis/
- Repo: https://github.com/patekarvijay262-spec/jarvis (GitHub Pages serves `main` from the repo root)
- Used on phone (installed to home screen) and laptop.

## Stack

Plain HTML, CSS and JavaScript ES modules. **No build step, no framework, no npm dependencies.**
External: Chart.js 4.4.1 from jsDelivr (global `Chart`), Google Fonts (Bricolage Grotesque + Figtree), optional Firebase 10.12.2 loaded from gstatic only when configured, SheetJS (xlsx) 0.18.5 from jsDelivr loaded on demand only when uploading a mess menu Excel file.

## Run locally

```bash
npx serve .            # or: python -m http.server 8000
```
Open the printed address. Opening `index.html` by double-click does not work (modules are blocked on `file://`).

## Deploy

Commit and push to `main`. GitHub Pages rebuilds in about a minute.
**Every release:** bump `VERSION` in `sw.js` and the `?v=N` on `css/styles.css` and `js/app.js` in `index.html`, or phones keep the old cached version.

## Files

| File | What it does |
|---|---|
| `index.html` | App shell: sidebar, top bar, tab bar, sheet, toast |
| `css/styles.css` | Design tokens (light + dark) and all layout. Later `/* v4 */` blocks override earlier rules |
| `js/app.js` | All screens: Today, Report, Trends, Plan, Friends, Settings; logging, meal editor, sync wiring |
| `js/foods.js` | Indian food table with 9 nutrients per serving, food-phrase parser, daily targets |
| `js/parser.js` | Offline free-text parser → activity objects; merges foods in one line into one meal |
| `js/scoring.js` | Deterministic Body/Brain/Mind scores, grades, streaks, rule-based suggestions |
| `js/knowledge.js` | Evidence base (WHO, ICMR-NIN, ISSN, sleep science), activity effects, default settings |
| `js/gemini.js` | Gemini API (key from Google AI Studio, stored in browser): log parsing, report card, morning plan |
| `js/charts.js` | Chart.js helpers, SVG ring, heatmap, sparkline |
| `js/cloud.js` | Optional Firebase: Google sign-in, phone↔laptop sync, friends |
| `js/calendar.js` | Google Calendar free slots, events, daily reminders |
| `js/store.js` | localStorage state (`jarvis.v1`), day records, merge, backup |
| `firestore.rules` | Security rules for the optional Firebase project |

## Data model

- `state.days[YYYY-MM-DD] = { entries: [{ id, ts, text, acts, via }], quick: { sleep, water, mood, energy, screen }, report, updatedAt }`
- An act: `{ type, label, minutes?, pages?, litres?, hours?, sun? }`. Types: walk, sunwalk, run, gym, yoga, cycle, swim, sport, food, water, sleep, reading, study, deepwork, english, chess, upsc, meditation, movie, social, screen, other.
- A food act: `{ type: 'food', label, items: [{ name, desc, qty, unit, n, protein, known }], n, protein }`.
  `n` = `{ kcal, p, c, f, fib, fe, ca, vc, b12 }` (g for p/c/f/fib, mg for fe/ca/vc, µg for b12).
- Old logs may lack `n`; `itemNutrients()` / `actNutrients()` in `foods.js` rebuild it. Never assume `n` exists.

## Food table rules (js/foods.js)

- `F(name, regex, gramsPerServing, unitLabel, [kcal, p, c, f, fib, fe, ca, vc, b12])`, values for ONE serving.
- Order matters: specific dishes before ingredients (e.g. `paneer bhurji` before `paneer`, `sol kadhi` before `kadhi`).
- Sources: IFCT 2017 (ICMR-NIN) and USDA FoodData Central, adjusted for home recipes. Keep kcal ≈ 4p + 4c + 9f (fruit/veg carbs include fibre).
- Unknown foods must show as "not counted", never silently guessed. Vijay cares about accuracy.
- Gemini maps foods to table names (`match` + `qty`) so AI and offline numbers stay consistent.

## Scoring (js/scoring.js)

- Body = exercise 30% + protein 20% + diet quality 15% + sleep 25% + water 10%
- Brain = deep work/study 40% + reading 25% + skills 25% + sleep 10%
- Mind = mood/energy 35% + meditation 25% + sunlight 15% + social 10% + screen limit 15%
- Daily targets (`dailyTargets()`): kcal from settings (default 2400), protein = weight × g/kg, carbs 55% kcal, fat 25% kcal, fibre 15 g/1000 kcal, iron 19 mg, calcium 1000 mg, vitamin C 80 mg, B12 2.5 µg (ICMR-NIN 2020 adult male).

## Design

- Pillar colours own meaning: Body = turmeric, Brain = indigo, Mind = tulsi green. Macros: protein = beet, carbs = wheat gold, fat = blue.
- Every colour is a CSS token defined in light `:root` and both dark blocks. No literal colours in components.
- Must work at 390 px width with no horizontal scroll; check phone and desktop after UI changes.
- Copy: plain, sentence case, user's words ("Log it", "Adjust this meal"), no jargon.

## Testing

No test suite. Quick checks:
```bash
node --check js/*.js
node -e "import('./js/parser.js').then(m => console.log(JSON.stringify(m.parseLocal('2 roti + 1 bowl rajma, 15 min sun walk'), null, 1)))"
```
Then load the site locally on a phone-sized window and in dark mode.
