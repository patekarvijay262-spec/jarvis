// Deterministic scoring. Same inputs → same scores, so trends and friend comparisons are fair.
import { EFFECTS, SKILL_LABELS } from './knowledge.js';
import { actNutrients, addN, zeroN, dailyTargets } from './foods.js';

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const BODY_TYPES = ['walk', 'sunwalk', 'run', 'gym', 'yoga', 'cycle', 'swim', 'sport', 'exercise'];
const VIGOROUS = ['run', 'swim', 'sport'];

export function totals(day, s) {
  const acts = (day.entries || []).flatMap(e => e.acts || []);
  const q = day.quick || {};
  const t = {
    activeMin: 0, rawExerciseMin: 0, strength: false, sunMin: 0, protein: 0,
    water: q.water || 0, sleep: q.sleep ?? null, deepMin: 0, readingMin: 0, pages: 0,
    skills: { english: 0, chess: 0, upsc: 0, meditation: 0 },
    screen: q.screen ?? null, screenFromLogs: 0, mood: q.mood ?? null, energy: q.energy ?? null,
    social: false, leisureMin: 0, count: acts.length, n: zeroN(), meals: 0
  };
  for (const a of acts) {
    const m = Number(a.minutes) || 0;
    if (BODY_TYPES.includes(a.type)) {
      t.rawExerciseMin += m;
      t.activeMin += VIGOROUS.includes(a.type) ? m * 2 : m;
      if (a.type === 'gym' || a.type === 'yoga') t.strength = t.strength || a.type === 'gym';
      if (a.sun || a.type === 'sunwalk') t.sunMin += m || 10;
    }
    if (a.type === 'food') { t.n = addN(t.n, actNutrients(a)); t.meals++; }
    if (a.type === 'water') t.water += Number(a.litres) || 0;
    if (a.type === 'sleep' && a.hours && t.sleep == null) t.sleep = a.hours;
    if (a.type === 'deepwork' || a.type === 'study') t.deepMin += m;
    if (a.type === 'reading' || a.type === 'upsc') { t.readingMin += m; t.pages += Number(a.pages) || 0; }
    if (a.type in t.skills) t.skills[a.type] += m || 10;
    if (a.type === 'screen' || a.type === 'movie') t.screenFromLogs += m;
    if (a.type === 'movie' || a.type === 'social' || a.type === 'sport') t.leisureMin += m;
    if (a.type === 'social') t.social = true;
    if (a.type === 'sport' && /friend|team|with/.test(a.label || '')) t.social = true;
  }
  if (t.screen == null && t.screenFromLogs) t.screen = +(t.screenFromLogs / 60).toFixed(1);
  t.protein = Math.round(t.n.p * 10) / 10;
  t.targets = dailyTargets(s);
  t.proteinTarget = t.targets.p;
  t.water = +t.water.toFixed(2);
  return t;
}

// Diet quality: calories near target, plus fibre and four key micronutrients toward their daily need.
export function nutritionScore(t) {
  if (!t.meals) return 0;
  const T = t.targets, n = t.n;
  const ratio = n.kcal / T.kcal;
  const cal = ratio <= 0 ? 0 : ratio < 0.85 ? ratio / 0.85 : ratio <= 1.15 ? 1 : clamp(1 - (ratio - 1.15) * 2);
  const parts = ['fib', 'fe', 'ca', 'vc', 'b12'].map(k => clamp(n[k] / T[k]));
  return (cal + parts.reduce((a, b) => a + b, 0)) / 6;
}

function sleepScore(h, target) {
  if (h == null) return 0;
  if (h >= target - 1 && h <= target + 1.5) return 1;
  if (h < target - 1) return clamp((h - 4) / (target - 1 - 4));
  return 0.8; // oversleeping
}

export function score(day, s) {
  const t = totals(day, s);
  const ex = clamp(t.activeMin / s.exerciseTarget) * 0.9 + (t.strength ? 0.1 : 0);
  const prot = clamp(t.protein / t.proteinTarget);
  const nut = nutritionScore(t);
  const sl = sleepScore(t.sleep, s.sleepTarget);
  const wa = clamp(t.water / s.waterTarget);
  const body = 0.30 * ex + 0.20 * prot + 0.15 * nut + 0.25 * sl + 0.10 * wa;

  const deep = clamp(t.deepMin / s.deepWorkTarget);
  const read = clamp(t.readingMin / s.readingTarget);
  const brainSkills = ['english', 'chess', 'upsc'].filter(k => s.skills.includes(k));
  const skillsDone = brainSkills.filter(k => t.skills[k] > 0).length;
  const sk = brainSkills.length ? skillsDone / brainSkills.length : 0;
  const brain = 0.40 * deep + 0.25 * read + 0.25 * sk + 0.10 * sl;

  const me = t.mood != null || t.energy != null ? ((t.mood ?? t.energy) + (t.energy ?? t.mood)) / 10 : 0;
  const med = clamp(t.skills.meditation / s.meditationTarget);
  const sun = clamp(t.sunMin / 15);
  const scr = t.screen == null ? 0 : t.screen <= s.screenLimit ? 1 : clamp(1 - (t.screen - s.screenLimit) / 4);
  const mind = 0.35 * me + 0.25 * med + 0.15 * sun + 0.10 * (t.social ? 1 : 0) + 0.15 * scr;

  const parts = {
    body: { exercise: ex, protein: prot, nutrition: nut, sleep: sl, water: wa },
    brain: { deepwork: deep, reading: read, skills: sk, sleep: sl },
    mind: { moodEnergy: me, meditation: med, sunlight: sun, social: t.social ? 1 : 0, screen: scr }
  };
  const r = x => Math.round(x * 100);
  const out = { body: r(body), brain: r(brain), mind: r(mind) };
  out.overall = Math.round((out.body + out.brain + out.mind) / 3);
  return { ...out, totals: t, parts };
}

export function grade(n) {
  if (n >= 90) return 'A+';
  if (n >= 80) return 'A';
  if (n >= 70) return 'B';
  if (n >= 55) return 'C';
  if (n >= 40) return 'D';
  return 'E';
}

// "What each activity achieved", from the local evidence base.
export function achievements(day) {
  const acts = (day.entries || []).flatMap(e => e.acts || []);
  return acts.filter(a => a.type !== 'other').map(a => {
    const key = a.type === 'food' ? foodKey(a.label) : a.type;
    const e = EFFECTS[key] || EFFECTS.other;
    return { label: a.label, pillar: a.type === 'food' ? 'body' : e.pillar, effect: e.effect, ref: e.ref, type: a.type };
  });
}

function foodKey(label = '') {
  const l = label.toLowerCase();
  if (/egg/.test(l)) return 'eggs';
  if (/dal|lentil/.test(l)) return 'dal';
  if (/paneer/.test(l)) return 'paneer';
  if (/chicken/.test(l)) return 'chicken';
  if (/milk/.test(l)) return 'milk';
  return 'food';
}

// Rule-based suggestions; used when Gemini is off, and as context for Gemini.
export function localSuggestions(sc, s, slots = []) {
  const t = sc.totals; const ideas = [];
  const slot = i => slots[i] ? `${slots[i].label}` : null;
  if (t.sleep == null || t.sleep < s.sleepTarget - 1) ideas.push({ w: 1 - sc.parts.body.sleep, title: `Lights out by ${bedtime(s)} for ${s.sleepTarget} h of sleep`, why: 'Under 7 h blunts attention and memory consolidation the next day.', mins: 0 });
  if (sc.parts.body.protein < 0.8) ideas.push({ w: 1 - sc.parts.body.protein, title: `Hit ${t.proteinTarget} g protein: add eggs, paneer or a bowl of dal/chana to two meals`, why: `You logged ${t.protein} g. Muscle repair works best with 20–40 g per meal.`, mins: 0 });
  if (sc.parts.body.exercise < 0.8) ideas.push({ w: 1 - sc.parts.body.exercise, title: `${Math.max(20, s.exerciseTarget - t.activeMin)} min brisk walk or run`, why: 'Keeps you on track for the WHO 150 min/week target.', mins: 30 });
  if (t.sunMin < 10) ideas.push({ w: 0.6, title: '10–15 min outdoor walk within an hour of waking', why: 'Morning daylight sets your body clock, sharpens mornings and makes sleep easier.', mins: 15 });
  if (sc.parts.brain.deepwork < 0.7) ideas.push({ w: 1 - sc.parts.brain.deepwork, title: 'One 90-min deep-work block, phone in another room', why: 'Single-tasking avoids attention residue and doubles useful output.', mins: 90 });
  if (sc.parts.brain.reading < 0.8) ideas.push({ w: 1 - sc.parts.brain.reading, title: `Read ${s.readingTarget} min before bed instead of scrolling`, why: 'Builds focus and knowledge, and keeps screens out of your pre-sleep hour.', mins: s.readingTarget });
  for (const k of ['english', 'chess', 'upsc']) if (s.skills.includes(k) && !t.skills[k]) ideas.push({ w: 0.45, title: skillIdea(k), why: 'Short daily practice beats long occasional sessions.', mins: k === 'upsc' ? 30 : 15 });
  if (s.skills.includes('meditation') && sc.parts.mind.meditation < 1) ideas.push({ w: 0.5, title: `${s.meditationTarget} min meditation right after waking`, why: 'Daily mindfulness modestly lowers stress and trains attention.', mins: s.meditationTarget });
  if (t.screen != null && t.screen > s.screenLimit) ideas.push({ w: 0.7, title: `Cap leisure screens at ${s.screenLimit} h; app timer on reels/YouTube`, why: `You logged ${t.screen} h. Passive scrolling is linked with lower mood.`, mins: 0 });
  if (t.meals) {
    const T = t.targets, n = t.n, pct = k => n[k] / T[k];
    if (pct('fib') < 0.6) ideas.push({ w: 0.55, title: 'Add a bowl of sprouts, salad or a fruit with lunch and dinner', why: `Fibre was ${Math.round(n.fib)} g of ${T.fib} g. Fibre steadies blood sugar and keeps digestion regular.`, mins: 0 });
    if (pct('fe') < 0.6) ideas.push({ w: 0.5, title: 'Squeeze lemon on dal, poha or sabji; add chana, rajma or greens', why: `Iron was ${n.fe.toFixed(1)} mg of ${T.fe} mg. Vitamin C in the same meal greatly raises iron absorption.`, mins: 0 });
    if (pct('ca') < 0.6) ideas.push({ w: 0.5, title: 'Have curd, a glass of milk or paneer once more', why: `Calcium was ${Math.round(n.ca)} mg of ${T.ca} mg. Dairy is the easiest Indian source.`, mins: 0 });
    if (pct('b12') < 0.6) ideas.push({ w: 0.5, title: 'Include milk, curd, paneer or eggs every day', why: `B12 was ${n.b12.toFixed(1)} µg of ${T.b12} µg. B12 comes only from animal foods and low levels cause fatigue.`, mins: 0 });
    if (pct('vc') < 0.6) ideas.push({ w: 0.4, title: 'Eat one guava, orange or amla', why: `Vitamin C was ${Math.round(n.vc)} mg of ${T.vc} mg. One guava covers the whole day.`, mins: 0 });
    if (pct('kcal') > 1.2) ideas.push({ w: 0.5, title: 'Swap one fried snack or sweet for fruit or roasted chana', why: `You ate about ${n.kcal} kcal against ${T.kcal}. Small swaps fix a surplus without hunger.`, mins: 0 });
  }
  if (t.water < s.waterTarget * 0.8) ideas.push({ w: 0.4, title: `Carry a 1 L bottle; finish it twice before 6 pm`, why: 'Mild dehydration lowers focus and mood, especially in Mumbai heat.', mins: 0 });
  ideas.sort((a, b) => b.w - a.w);
  let si = 0;
  return ideas.slice(0, 3).map(i => ({ ...i, when: i.mins ? slot(si++) : null, slotIndex: i.mins ? si - 1 : null }));
}

function skillIdea(k) {
  return {
    english: '15 min spoken English: shadow a podcast, then record a 2-min answer to an interview question',
    chess: '15 min of chess puzzles, then review one mistake',
    upsc: '30 min UPSC: today’s editorial + 10 lines of notes'
  }[k];
}

function bedtime(s) {
  const [h, m] = (s.morningTime || '07:30').split(':').map(Number);
  let mins = h * 60 + m - s.sleepTarget * 60 - 15;
  if (mins < 0) mins += 1440;
  const hh = Math.floor(mins / 60), mm = mins % 60;
  const ap = hh >= 12 ? 'pm' : 'am';
  return `${((hh + 11) % 12) + 1}:${String(mm).padStart(2, '0')} ${ap}`;
}

export function skillName(k) { return SKILL_LABELS[k] || k; }

// Streak of consecutive days (ending today or yesterday) where predicate holds.
export function streak(days, pred, todayKey) {
  let n = 0; let d = new Date(todayKey + 'T12:00:00');
  const key = x => x.toISOString().slice(0, 10);
  if (!days[todayKey] || !pred(days[todayKey])) d.setDate(d.getDate() - 1);
  while (days[key(d)] && pred(days[key(d)])) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
