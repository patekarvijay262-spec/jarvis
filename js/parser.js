// Local free-text parser. Works offline; Gemini replaces it when a key is set.
import { parseFood, addN, zeroN } from './foods.js';

const NUM_WORDS = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, half: 0.5 };

function num(s) {
  if (s == null) return null;
  const t = String(s).toLowerCase();
  if (NUM_WORDS[t] != null) return NUM_WORDS[t];
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : null;
}

// minutes from "20 min", "1.5 hr", "1h 20m", "45m"
export function minutesIn(text) {
  const t = text.toLowerCase();
  let total = 0, found = false;
  const h = t.match(/(\d+(?:\.\d+)?|an?|one|two|three|half)\s*(?:h|hr|hrs|hour|hours)\b/);
  if (h) { total += num(h[1]) * 60; found = true; }
  const m = t.match(/(\d+(?:\.\d+)?)\s*(?:m|min|mins|minute|minutes)\b/);
  if (m) { total += num(m[1]); found = true; }
  return found ? Math.round(total) : null;
}

const RULES = [
  { type: 'sunwalk',    re: /sun\s*walk|walk.*sun|sun.*walk|morning walk outside|sunlight|sunbath/ },
  { type: 'run',        re: /\brun\b|\bran\b|running|jog/ },
  { type: 'gym',        re: /\bgym\b|weights|lift|strength|push.?ups|pull.?ups|squats|workout|calisthenics/ },
  { type: 'yoga',       re: /yoga|stretch|surya namaskar/ },
  { type: 'cycle',      re: /cycl|bike/ },
  { type: 'swim',       re: /swim/ },
  { type: 'sport',      re: /football|cricket|badminton|basketball|volleyball|tennis|table tennis|tt\b|squash|kabaddi|played/ },
  { type: 'walk',       re: /\bwalk|steps\b/ },
  { type: 'meditation', re: /meditat|breathwork|pranayam|mindful/ },
  { type: 'english',    re: /english|speaking practice|spoke|shadowing|toastmaster/ },
  { type: 'chess',      re: /chess|puzzles?\b|lichess|rapid game|blitz/ },
  { type: 'upsc',       re: /upsc|the hindu|indian express|laxmikanth|polity|current affairs|gs paper|ncert/ },
  { type: 'reading',    re: /\bread|pages|book|novel/ },
  { type: 'deepwork',   re: /deep work|focus(ed)? (work|block)|coding|coded|assignment|project work|lab report/ },
  { type: 'study',      re: /stud(y|ied)|lecture|revision|revised|class|practice problems|tutorial/ },
  { type: 'movie',      re: /movie|film|series|netflix|episode|anime|tv\b/ },
  { type: 'screen',     re: /screen time|instagram|insta\b|reels|youtube|scroll|social media/ },
  { type: 'social',     re: /friends|family|called|hangout|hung out|dinner with|met \w+/ },
  { type: 'sleep',      re: /\bslept|sleep|nap/ },
  { type: 'water',      re: /water|glasses?\b|litre|liter|\bl\b|bottle/ }
].map(r => ({ ...r, re: r.re instanceof RegExp ? r.re : new RegExp(r.re) }));

export function splitChunks(text) {
  return text
    .split(/\n|,|;|\.(?!\d)|\bthen\b|\balso\b/i)
    .map(s => s.trim())
    .filter(Boolean);
}

// Returns an array of activity objects.
export function parseLocal(text) {
  const out = [];
  const chunks = splitChunks(text);
  for (const chunk of chunks) {
    const lc = chunk.toLowerCase();
    const food = parseFood(chunk);
    // Food chunks often contain "+": "2 eggs + dal"
    if (food && !/\b(walk|walked|run|ran|gym|read|study|studied|played)\b/.test(lc)) {
      out.push({ type: 'food', label: chunk, protein: food.protein, n: food.n, items: food.items });
      continue;
    }
    const rule = RULES.find(r => r.re.test(lc));
    const minutes = minutesIn(chunk);
    if (!rule) {
      if (food) out.push({ type: 'food', label: chunk, protein: food.protein, n: food.n, items: food.items });
      else out.push({ type: 'other', label: chunk, minutes });
      continue;
    }
    const a = { type: rule.type, label: chunk };
    if (minutes != null) a.minutes = minutes;
    if (rule.type === 'reading' || rule.type === 'upsc') {
      const p = lc.match(/(\d+)\s*pages?/);
      if (p) a.pages = parseInt(p[1], 10);
      if (a.minutes == null && a.pages) a.minutes = Math.round(a.pages * 1.5);
    }
    if (rule.type === 'chess') {
      const g = lc.match(/(\d+)\s*(games?|puzzles?)/);
      if (g) a.count = parseInt(g[1], 10);
      if (a.minutes == null && g) a.minutes = /puzzle/.test(g[2]) ? Math.round(a.count * 2) : a.count * 10;
    }
    if (rule.type === 'walk' || rule.type === 'sunwalk') {
      const s = lc.match(/(\d[\d,]*)\s*steps/);
      if (s) { a.steps = parseInt(s[1].replace(/,/g, ''), 10); if (a.minutes == null) a.minutes = Math.round(a.steps / 100); }
      if (rule.type === 'sunwalk') a.sun = true;
    }
    if (rule.type === 'sleep') {
      const h = lc.match(/(\d+(?:\.\d+)?)\s*(h|hr|hrs|hours)/);
      if (h) a.hours = parseFloat(h[1]);
    }
    if (rule.type === 'water') {
      const l = lc.match(/(\d+(?:\.\d+)?)\s*(l|litre|liter|litres|liters)\b/);
      const g = lc.match(/(\d+)\s*(glass|glasses)/);
      const b = lc.match(/(\d+)\s*(bottle|bottles)/);
      a.litres = l ? parseFloat(l[1]) : g ? parseInt(g[1], 10) * 0.25 : b ? parseInt(b[1], 10) * 1 : 0.25;
    }
    if (rule.type === 'screen') {
      const h = lc.match(/(\d+(?:\.\d+)?)\s*(h|hr|hrs|hours)/);
      if (h) a.minutes = parseFloat(h[1]) * 60;
    }
    if (/outside|outdoor|sun|park|ground|beach/.test(lc) && ['walk', 'run', 'cycle', 'sport'].includes(rule.type)) a.sun = true;
    out.push(a);
  }
  // Foods written in one line are one meal: merge them into a single food act.
  const merged = [];
  for (const a of out) {
    const last = merged[merged.length - 1];
    if (a.type === 'food' && last?.type === 'food') {
      last.label += ', ' + a.label;
      last.items = [...(last.items || []), ...(a.items || [])];
      last.n = last.items.reduce((sum, it) => addN(sum, it.n), zeroN());
      last.protein = Math.round(last.n.p * 10) / 10;
    } else merged.push(a);
  }
  return merged;
}
