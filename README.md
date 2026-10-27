# Jarvis

Vijay's personal growth tracker for **Body · Brain · Mind**. Log your day in plain words or by voice, get a coach-style report card grounded in research, see trends, plan around free calendar slots, and compare weekly scores with friends.

Runs in any browser on phone and laptop. No build step, no server: plain HTML, CSS and JavaScript.

## What's inside

| Screen | What it does |
|---|---|
| **Today** | Overall score + Body/Brain/Mind rings, free-text or voice logging, quick check-in (sleep, water, mood, energy, screen time), targets, skills & habits with streaks |
| **Report** | Grade per pillar with component bars, what each activity achieved scientifically, 3 moves for tomorrow (placed into free calendar slots) |
| **Trends** | 7/30/90-day pillar chart, balance radar vs previous period, protein and sleep vs target, minutes breakdown, mood & energy, 12-week habit heatmaps |
| **Plan** | Today/tomorrow agenda from Google Calendar with suggested activities in free slots, plus the evidence base Jarvis coaches from |
| **Friends** | Share a 6-letter code, weekly leaderboard, head-to-head chart. Only scores and totals are shared, never log text |
| **Settings** | Gemini key, targets, Firebase sync, Calendar, reminders, backup |

Jarvis works fully offline on its own built-in coach. Each piece below unlocks more.

## 1. Gemini (the AI brain)

1. Open <https://aistudio.google.com/apikey> and sign in.
2. Click **Create API key**, choose a project, copy the key (starts with `AIza`).
3. In Jarvis → **Settings → AI brain**, paste it and press **Test & save**. Jarvis picks the newest Gemini Flash model automatically; you can change it in the dropdown.

The key stays on your device (and in your private synced settings if you sign in).

## 2. Put it online (GitHub Pages, free)

1. Create a new **public** repository on GitHub, e.g. `jarvis`.
2. **Add file → Upload files** → drag everything inside this folder (keep the `css`, `js`, `icons` folders) → Commit.
3. Repository **Settings → Pages** → Source: *Deploy from a branch* → Branch `main`, folder `/ (root)` → Save.
4. After about a minute the site is live at `https://<your-username>.github.io/jarvis/`.
5. On your phone open that link in Chrome → ⋮ → **Add to Home screen**.

To try it on your laptop first: open this folder in Antigravity (or VS Code) and run `npx serve .` (or `python -m http.server 8000`), then open the address it prints. Opening `index.html` by double-click won't work because browsers block modules on `file://`.

## 3. Sync, friends and Google Calendar (Firebase, free)

1. <https://console.firebase.google.com> → **Create a project** (`jarvis`, Analytics off).
2. **Build → Authentication → Get started → Sign-in method → Google** → Enable → Save.
3. **Authentication → Settings → Authorized domains** → add `<your-username>.github.io` (`localhost` is already there).
4. **Build → Firestore Database → Create database** → production mode → location `asia-south1 (Mumbai)`. Open the **Rules** tab, paste the contents of [`firestore.rules`](firestore.rules), **Publish**.
5. **Project settings (gear) → General → Your apps → Web `</>`** → nickname `Jarvis` → Register → copy the `firebaseConfig` block.
6. In Jarvis → **Settings → Sync, friends & Google Calendar** paste it → **Save config** → **Sign in with Google**.

### Google Calendar

1. Open <https://console.cloud.google.com/apis/library/calendar-json.googleapis.com> with the same project selected (Firebase created it) → **Enable**.
2. **Google Auth Platform → Branding**: fill app name `Jarvis` and your email.
3. **Audience** → keep *Testing* → **Add users** → your Gmail (and any friend who wants calendar features).
4. In Jarvis press **Connect calendar**. Google will warn the app is unverified; that's expected for a personal app in testing. Choose *Continue*.

Calendar access lasts about an hour per sign-in (a Firebase limitation without a server). When it expires, Jarvis shows **Reconnect calendar**.

### Reminders

**Settings → Reminders → Add calendar reminders** creates two daily repeating events (morning plan, night log) with notifications. Your phone's Google Calendar app delivers them even when Jarvis is closed. In-app alerts also work while Jarvis is open.

### Friends

Each person signs in to their own copy of the site (the same link works for everyone). Open **Friends**, send your code, add theirs. You both need to add each other to see each other's scores.

## How scoring works

All scores are 0–100 and computed on your device the same way every day, so trends and friend comparisons are fair.

- **Body** = exercise 30% (WHO 150 min/week ≈ 30 min/day; vigorous minutes count double; strength bonus) + protein 20% (body weight × 1.4 g/kg, ISSN range 1.4–2.0) + diet quality 15% (calories near target, plus fibre, iron, calcium, vitamin C and B12 toward ICMR-NIN 2020 daily needs) + sleep 25% (7–9 h) + water 10%.
- **Brain** = deep work + study 40% + reading 25% + skills practiced 25% (spoken English, chess, UPSC) + sleep 10%.
- **Mind** = mood & energy 35% + meditation 25% + sunlight 15% + social time 10% + staying under your screen limit 15%.

Change targets in Settings. The evidence base lives in `js/knowledge.js`.

## Files

```
index.html            app shell
css/styles.css        design tokens + layout (light and dark)
js/app.js             screens and interactions
js/scoring.js         scores, grades, streaks, rule-based suggestions
js/parser.js          offline free-text parser
js/foods.js           Indian food table: calories, protein, carbs, fat, fibre, iron, calcium, vitamin C, B12
js/knowledge.js       guidelines, activity effects, protein table, defaults
js/gemini.js          Gemini API: parsing, report card, morning plan
js/cloud.js           Firebase auth, sync, friends
js/calendar.js        free slots, events, reminders
js/charts.js          Chart.js helpers, rings, heatmaps, sparklines
firestore.rules       database security rules
sw.js, manifest.webmanifest, icons/   installable app
```

## Privacy

- Full logs live in `users/{you}` and only you can read them.
- Friends can read only `scores/{you}`: daily Body/Brain/Mind/overall plus totals (active, deep work, reading minutes, sleep, protein), and only if you added them.
- Turn off **Share my daily scores** in Settings to stop sharing.
