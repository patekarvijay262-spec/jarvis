// Exercise calorie estimates (MET-based, Compendium of Physical Activities), home/gym workouts.
// Rep-based moves estimate minutes from an assumed seconds-per-rep, then kcal = MET × 3.5 × bodyKg / 200 × minutes.
// Weighted moves (dumbbell/barbell) bump the MET when a load in kg is mentioned, scaled against body weight —
// heavier relative load raises effort, capped at +60% so a wild number can't blow up the estimate.
// Treadmill/cardio machines prefer a kcal figure read directly off the machine when the user gives one.

const E = (name, re, met, opts = {}) => ({ name, re, met, ...opts });

export const EXERCISES = [
  E('burpee', /burpees?/, 8, { perRepSec: 4 }),
  E('jumping jack', /jumping jacks?/, 8, { perRepSec: 1.5 }),
  E('mountain climber', /mountain climbers?/, 8, { perRepSec: 1 }),
  E('push-up', /push[- ]?ups?|pushups?/, 8, { perRepSec: 2.5 }),
  E('pull-up', /pull[- ]?ups?|pullups?|chin[- ]?ups?/, 8, { perRepSec: 3.5 }),
  E('dip', /\bdips?\b/, 8, { perRepSec: 3 }),
  E('sit-up', /sit[- ]?ups?|crunch(es)?/, 6, { perRepSec: 2 }),
  E('plank', /planks?/, 3, { timeBased: true }),
  E('lunge', /lunges?/, 4, { perRepSec: 3, weighted: true }),
  E('squat', /squats?/, 5, { perRepSec: 3.5, weighted: true }),
  E('calf raise', /calf raises?/, 3, { perRepSec: 2, weighted: true }),
  E('deadlift', /deadlifts?/, 6, { perRepSec: 4, weighted: true }),
  E('bench press', /bench press/, 5, { perRepSec: 3, weighted: true }),
  E('shoulder press', /shoulder press|overhead press|military press/, 4, { perRepSec: 3, weighted: true }),
  E('tricep extension', /tricep extensions?|skull ?crushers?/, 3.5, { perRepSec: 3, weighted: true }),
  E('bicep curl', /(?:bicep|dumbbell|barbell|hammer)? ?curls?/, 3.5, { perRepSec: 3, weighted: true }),
  E('lat pulldown', /lat pulldowns?/, 4, { perRepSec: 3, weighted: true }),
  E('row', /(?:dumbbell|barbell|cable|seated|bent[- ]?over)? ?rows?/, 4, { perRepSec: 3, weighted: true }),
  E('leg press', /leg press/, 5, { perRepSec: 4, weighted: true }),
  E('leg extension', /leg extensions?/, 3.5, { perRepSec: 3, weighted: true }),
  E('leg curl', /leg curls?/, 3.5, { perRepSec: 3, weighted: true }),
  E('shrug', /shrugs?/, 3.5, { perRepSec: 2, weighted: true }),
  E('chest fly', /chest flys?|flyes?|pec deck/, 3.5, { perRepSec: 3, weighted: true }),
  E('treadmill', /treadmill/, 7, { timeBased: true, directKcal: true }),
  E('stationary cycle', /stationary (?:bike|cycle)|exercise bike|spin(?:ning)? (?:bike|class)/, 7, { timeBased: true, directKcal: true }),
  E('elliptical', /elliptical/, 6, { timeBased: true, directKcal: true }),
  E('rowing machine', /rowing machine|\berg\b|ergometer/, 7, { timeBased: true, directKcal: true }),
  E('stair climber', /stair ?master|stair climber|stairmill/, 8, { timeBased: true, directKcal: true }),
  E('gym / weights', /\bgym\b|workout|\bweights\b|resistance training|strength training|calisthenics/, 5, { timeBased: true }),
];

const metFor = (ex, repWeightKg, bodyWeightKg) =>
  ex.weighted && repWeightKg && bodyWeightKg ? ex.met * (1 + Math.min(1, repWeightKg / bodyWeightKg) * 0.6) : ex.met;
const kcalFor = (met, bodyWeightKg, minutes) => Math.round(met * 3.5 * bodyWeightKg / 200 * minutes);

function matchExercises(text) {
  const lc = text.toLowerCase();
  const taken = new Array(lc.length).fill(false);
  const hits = [];
  for (const ex of EXERCISES) {
    const re = new RegExp(ex.re.source, 'g');
    let m;
    while ((m = re.exec(lc))) {
      const s = m.index, e = s + m[0].length;
      if (!m[0].length) { re.lastIndex++; continue; }
      if (taken.slice(s, e).some(Boolean)) continue;
      for (let i = s; i < e; i++) taken[i] = true;
      hits.push({ ex, s, e, text: m[0] });
    }
  }
  hits.sort((a, b) => a.s - b.s);
  // "gym workout": both words match the generic entry — keep one mention, not two.
  const kept = [];
  for (const h of hits) {
    const prev = kept[kept.length - 1];
    if (prev && prev.ex === h.ex && !/[\d,]/.test(lc.slice(prev.e, h.s)) && lc.slice(prev.e, h.s).trim().split(/\s+/).filter(Boolean).length <= 2) { prev.e = h.e; continue; }
    kept.push({ ...h });
  }
  return kept;
}

// Parse exercises out of free text ("50 pushups, 3x12 curls with 10kg dumbbell, treadmill 20 min 180 kcal").
export function parseExercise(text, bodyWeightKg = 70) {
  const hits = matchExercises(text);
  if (!hits.length) return null;
  const lc = text.toLowerCase();
  const items = hits.map((h, i) => {
    const before = lc.slice(i ? hits[i - 1].e : 0, h.s);
    const after = lc.slice(h.e, i < hits.length - 1 ? hits[i + 1].s : lc.length);
    const ctx = before + h.text + after;

    // Treadmill/cardio machines: prefer the kcal the machine itself reported.
    const kcalM = ctx.match(/(\d+(?:\.\d+)?)\s*k?cal/);
    if (h.ex.directKcal && kcalM) {
      const kcal = Math.round(parseFloat(kcalM[1]));
      const minM = before.match(/(\d+(?:\.\d+)?)\s*min/) || after.match(/(\d+(?:\.\d+)?)\s*min/);
      const minutes = minM ? parseFloat(minM[1]) : null;
      const item = { name: h.ex.name, kcal, desc: minutes ? `${minutes} min · ${kcal} kcal (device)` : `${kcal} kcal (device)`, known: true };
      if (minutes != null) item.minutes = minutes;
      return item;
    }

    const weightM = ctx.match(/(\d+(?:\.\d+)?)\s*kg/);
    const repWeight = weightM ? parseFloat(weightM[1]) : null;
    const met = metFor(h.ex, repWeight, bodyWeightKg);

    if (h.ex.timeBased) {
      const minM = before.match(/(\d+(?:\.\d+)?)\s*min/) || after.match(/(\d+(?:\.\d+)?)\s*min/);
      const minutes = minM ? parseFloat(minM[1]) : 10;
      const kcal = kcalFor(met, bodyWeightKg, minutes);
      return { name: h.ex.name, kcal, minutes, desc: `${minutes} min`, known: true };
    }

    // Prefer an explicit rep/set count; only fall back to a stated duration or a rough guess when reps aren't given.
    const setsReps = ctx.match(/(\d+)\s*[x×]\s*(\d+)/);
    const numBefore = before.match(/(\d+)\s*$/);
    const minM = before.match(/(\d+(?:\.\d+)?)\s*min/) || after.match(/(\d+(?:\.\d+)?)\s*min/);
    let reps = null, minutes, desc;
    if (setsReps || numBefore) {
      reps = setsReps ? parseInt(setsReps[1], 10) * parseInt(setsReps[2], 10) : parseInt(numBefore[1], 10);
      minutes = Math.round(((reps * h.ex.perRepSec) / 60) * 10) / 10;
      desc = repWeight ? `${reps} reps @ ${repWeight} kg` : `${reps} reps`;
    } else if (minM) {
      minutes = parseFloat(minM[1]);
      desc = repWeight ? `${minutes} min @ ${repWeight} kg` : `${minutes} min`;
    } else {
      reps = 10; minutes = Math.round(((reps * h.ex.perRepSec) / 60) * 10) / 10; desc = `${reps} reps (estimated)`;
    }
    const kcal = kcalFor(met, bodyWeightKg, minutes);
    const item = { name: h.ex.name, kcal, minutes, desc, known: true };
    if (reps != null) item.reps = reps;
    return item;
  });
  const kcal = items.reduce((s, it) => s + it.kcal, 0);
  const minutes = Math.round(items.reduce((s, it) => s + (it.minutes || 0), 0));
  return { items, kcal, minutes };
}
