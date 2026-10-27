// Indian food nutrition table, home-style portions.
// n = nutrients for ONE serving: [kcal, protein g, carbs g, fat g, fibre g, iron mg, calcium mg, vitamin C mg, vitamin B12 µg]
// g = grams in that serving, unit = what one serving is.
// Values: IFCT 2017 (ICMR-NIN) and USDA FoodData Central, adjusted for typical home recipes (oil, gravy, water).
// Order matters: specific dishes come before the ingredients they contain.

export const NUTRIENTS = [
  { k: 'kcal', label: 'Calories', unit: 'kcal', short: 'kcal' },
  { k: 'p', label: 'Protein', unit: 'g', short: 'Protein' },
  { k: 'c', label: 'Carbs', unit: 'g', short: 'Carbs' },
  { k: 'f', label: 'Fat', unit: 'g', short: 'Fat' },
  { k: 'fib', label: 'Fibre', unit: 'g', short: 'Fibre' },
  { k: 'fe', label: 'Iron', unit: 'mg', short: 'Iron' },
  { k: 'ca', label: 'Calcium', unit: 'mg', short: 'Calcium' },
  { k: 'vc', label: 'Vitamin C', unit: 'mg', short: 'Vit C' },
  { k: 'b12', label: 'Vitamin B12', unit: 'µg', short: 'B12' }
];
export const NKEYS = NUTRIENTS.map(n => n.k);

const F = (name, re, g, unit, n, extra = {}) => ({ name, re, g, unit, n, p: n[1], ...extra });

export const FOODS = [
  F('whey protein', /whey|protein shake|protein powder/, 30, 'scoop', [120, 24, 3, 1.5, 0, 0.5, 120, 0, 0.6]),
  F('soya chunks', /soya|soy chunks?|nutrela/, 25, 'bowl (25 g dry)', [86, 13, 8, 0.1, 3, 2.3, 60, 0, 0]),
  F('egg white', /egg whites?/, 33, 'white', [17, 3.6, 0.2, 0.1, 0, 0, 2, 0, 0.03]),
  F('egg curry', /egg curry|anda curry|egg masala/, 200, 'bowl (2 eggs)', [230, 13, 8, 16, 1.5, 2, 70, 6, 0.9]),
  F('omelette', /omelet+e?s?|omlet|egg bhurji|anda bhurji/, 110, '2-egg omelette', [190, 12.5, 1.5, 15, 0.2, 1.8, 56, 0, 0.9], { eggs: true }),
  F('egg', /\beggs?\b|\banda\b|\bande\b/, 50, 'egg', [72, 6.3, 0.4, 4.8, 0, 0.9, 28, 0, 0.45]),
  F('paneer bhurji', /paneer bhurji/, 150, 'bowl', [290, 15, 8, 22, 1.5, 1, 250, 10, 0.5]),
  F('paneer paratha', /paneer paratha/, 100, 'paratha', [290, 10, 32, 14, 3, 1.6, 160, 1, 0.2]),
  F('paneer curry', /palak paneer|paneer (butter )?masala|shahi paneer|matar paneer|kadai paneer|paneer curry|paneer sabji|paneer tikka/, 150, 'bowl', [280, 11, 10, 22, 2, 1.5, 220, 10, 0.4]),
  F('paneer', /paneer/, 100, '100 g', [265, 18.3, 1.2, 20.8, 0, 0.2, 208, 0, 0.8]),
  F('tofu', /tofu/, 100, '100 g', [120, 12, 2, 7, 1, 2.5, 200, 0, 0]),
  F('veg biryani / pulao', /veg biryani|pulao|pulav/, 250, 'plate', [400, 7, 62, 13, 4, 1.5, 50, 5, 0]),
  F('chicken biryani', /chicken biryani|mutton biryani|biryani/, 300, 'plate', [550, 22, 65, 22, 2, 2, 60, 3, 0.4]),
  F('chicken curry', /chicken curry|butter chicken|chicken masala|chicken gravy|chicken tikka/, 200, 'bowl', [300, 22, 8, 20, 2, 1.5, 40, 6, 0.4]),
  F('chicken', /chicken/, 100, '100 g cooked', [180, 27, 0, 7.5, 0, 1, 15, 0, 0.3]),
  F('fish curry', /fish curry/, 200, 'bowl', [220, 18, 6, 14, 1, 1.2, 60, 4, 2]),
  F('fish', /fish|prawns?|surmai|pomfret|bangda|rawas/, 100, '100 g cooked', [140, 22, 0, 5.5, 0, 0.8, 40, 0, 2.5]),
  F('mutton', /mutton|keema|\bmeat\b/, 100, '100 g cooked', [250, 25, 0, 16, 0, 2.7, 15, 0, 2.6]),
  F('misal pav', /misal(?: ?pav)?/, 330, 'plate with 2 pav', [500, 17, 62, 20, 9, 4, 80, 8, 0]),
  F('pav bhaji', /pav bhaji/, 300, 'plate with 2 pav', [450, 10, 60, 19, 7, 2.5, 70, 25, 0.1]),
  F('vada pav', /vada ?pav/, 150, 'piece', [290, 6, 40, 11, 3, 1.5, 40, 6, 0]),
  F('rajma', /rajma|kidney beans?/, 150, 'bowl', [190, 9, 25, 5, 7, 2.4, 45, 3, 0]),
  F('roasted chana', /roasted chana|bhuna chana|chana jor|futana/, 30, 'handful', [110, 6, 17, 1.5, 5, 1.8, 17, 0, 0]),
  F('chole', /chole|chhole|chana masala|chickpeas?|kabuli|\bchana\b/, 150, 'bowl', [210, 9, 27, 7, 7, 2.4, 60, 3, 0]),
  F('sprouts', /sprouts?|usal|moong salad/, 100, 'bowl', [100, 7, 15, 0.6, 4, 1.5, 30, 10, 0]),
  F('sambar', /sambar|sambhar/, 150, 'bowl', [110, 4.5, 15, 3.5, 4, 1.2, 40, 6, 0]),
  F('khichdi', /khichdi|khichadi|pongal/, 200, 'bowl', [240, 7.5, 38, 6, 4, 1.5, 30, 1, 0]),
  F('dal', /\bdal\b|\bdaal\b|\bdhal\b|lentils?|varan|amti|\btoor\b|masoor/, 150, 'bowl', [150, 7, 19, 4.5, 4, 1.5, 30, 2, 0]),
  F('sol kadhi', /sol ?kadhi|kokum (?:curry|kadhi)/, 150, 'glass', [110, 1, 5, 10, 0.5, 0.5, 15, 1, 0]),
  F('kadhi', /kadhi/, 150, 'bowl', [130, 4, 10, 8, 1, 0.5, 110, 1, 0.3]),
  F('greek yogurt', /greek yog/, 100, '100 g', [80, 10, 4, 2.5, 0, 0.1, 110, 0, 0.7]),
  F('curd', /curd|dahi|yogh?urt|raita/, 150, 'bowl', [92, 5, 7, 5, 0, 0.1, 180, 1, 0.5]),
  F('lassi', /lassi/, 250, 'glass', [200, 6, 30, 6, 0, 0.1, 220, 1, 0.6]),
  F('buttermilk', /chaas|chhaas|buttermilk|mattha|taak/, 250, 'glass', [40, 2, 3, 2, 0, 0.1, 75, 1, 0.2]),
  F('chai', /\bchai\b|\btea\b/, 120, 'cup (milk, sugar)', [70, 1.5, 11, 2.2, 0, 0.1, 55, 0, 0.2], { drink: true }),
  F('coffee', /coffee/, 150, 'cup (milk, sugar)', [90, 3, 11, 3.5, 0, 0.1, 100, 0, 0.3], { drink: true }),
  F('fruit juice', /(?:orange |mosambi |apple |mango |pineapple |fresh |fruit )?juice/, 250, 'glass', [112, 1.7, 26, 0.5, 0.5, 0.5, 25, 60, 0], { drink: true }),
  F('nimbu pani', /nimbu pani|lemonade|shikanji|lime water|lemon water/, 250, 'glass', [90, 0.2, 22, 0, 0.1, 0.1, 8, 10, 0], { drink: true }),
  F('sharbat', /sharbat|sarbat|kokum (?:sharbat|juice|drink)|rooh ?afza|aam panna|squash/, 250, 'glass', [100, 0.1, 25, 0, 0, 0.2, 5, 1, 0], { drink: true }),
  F('lemon', /\blemon\b|\blime\b|\bnimbu\b/, 10, 'squeeze', [3, 0.1, 1, 0, 0, 0, 2, 5, 0]),
  F('coconut water', /coconut water|nariyal pani|tender coconut/, 250, 'glass', [48, 1.8, 9, 0.5, 2.8, 0.7, 60, 6, 0], { drink: true }),
  F('soft drink', /\bsoda\b|cola|\bcoke\b|pepsi|sprite|thums ?up|fanta|limca|soft drink|energy drink|red ?bull/, 300, 'can / glass', [126, 0, 32, 0, 0, 0.1, 8, 0, 0], { drink: true }),
  F('milkshake', /milk ?shake|smoothie|\bshake\b/, 300, 'glass', [250, 9, 38, 7, 1.5, 0.5, 280, 5, 0.9]),
  F('milk', /\bmilk\b|doodh|\bdudh\b/, 250, 'glass', [150, 8, 12, 8, 0, 0.1, 300, 0, 1.1]),
  F('cheese', /cheese/, 20, 'slice', [62, 4, 1, 5, 0, 0.1, 120, 0, 0.2]),
  F('peanut butter', /peanut butter/, 16, 'tbsp', [94, 4, 3, 8, 1, 0.3, 7, 0, 0]),
  F('ghee / butter', /\bghee\b|\bbutter\b|makhan/, 5, 'tsp', [45, 0, 0, 5, 0, 0, 1, 0, 0]),
  F('peanuts', /peanuts?|groundnuts?|shengdana|moongphali/, 30, 'handful', [170, 7.5, 5, 14, 2.5, 1.4, 28, 0, 0]),
  F('makhana', /makhana|fox ?nuts?|lotus seeds?/, 25, 'bowl (roasted)', [90, 2.4, 19, 0.4, 3.6, 0.4, 15, 0, 0]),
  F('nuts', /almonds?|badam|cashews?|kaju|walnuts?|pista|\bnuts\b|dry ?fruits?/, 25, 'handful', [145, 5, 5, 12.5, 3, 0.9, 65, 0, 0]),
  F('besan chilla', /chilla|cheela|pudla/, 80, 'chilla', [150, 7, 15, 6, 3, 1.5, 25, 4, 0]),
  F('paratha', /aloo paratha|paratha|parotta|thepla/, 100, 'paratha', [260, 5.5, 36, 11, 3, 1.5, 25, 5, 0]),
  F('roti', /\broti|chapati|chapatti|chapathi|phulka|bhakri|bhakari|\bpoli\b/, 40, 'roti', [105, 3.5, 21, 0.5, 3, 1.2, 13, 0, 0]),
  F('puri', /\bpuris?\b|poori/, 25, 'puri', [100, 2, 11, 5.5, 1, 0.6, 8, 0, 0]),
  F('naan', /naan|kulcha/, 90, 'naan', [260, 8, 45, 5, 2, 2.9, 60, 0, 0.1]),
  F('rice', /\brice\b|chawal|jeera rice|curd rice|lemon rice/, 150, 'bowl (cooked)', [195, 4, 42, 0.5, 0.6, 0.3, 15, 0, 0]),
  F('poha', /poha/, 200, 'plate', [300, 5, 50, 8.5, 3, 2.7, 20, 8, 0]),
  F('upma', /upma|sheera|rava/, 200, 'plate', [300, 6, 42, 11, 3, 1.5, 30, 3, 0]),
  F('masala dosa', /masala dosa/, 180, 'dosa', [350, 7, 50, 13, 4, 1.5, 40, 8, 0]),
  F('dosa', /dosa|uttapam|uthappam/, 120, 'dosa', [170, 4, 28, 5, 1.5, 0.8, 20, 0, 0]),
  F('idli', /idli|idly/, 40, 'idli', [58, 2, 12, 0.2, 0.6, 0.4, 8, 0, 0]),
  F('medu vada', /medu vada|\bvada\b|\bwada\b/, 45, 'vada', [135, 4, 12, 8, 2, 0.9, 30, 0, 0]),
  F('dhokla', /dhokla|khaman/, 40, 'piece', [65, 2.5, 9, 2, 1, 0.6, 15, 0, 0]),
  F('oats', /oats|oatmeal|porridge|daliya|dalia/, 40, 'bowl (40 g dry)', [150, 5, 27, 2.8, 4, 1.7, 20, 0, 0]),
  F('cereal', /cornflakes|muesli|cereal|granola/, 40, 'bowl (no milk)', [150, 3, 34, 0.4, 1, 3, 5, 0, 0]),
  F('sandwich', /sandwich/, 150, 'sandwich', [300, 8, 40, 11.5, 4, 2, 80, 10, 0.1]),
  F('burger', /burger/, 180, 'burger', [450, 14, 50, 21, 3, 2.5, 100, 4, 0.5]),
  F('pizza', /pizza/, 100, 'slice', [270, 11, 33, 10, 2, 2.5, 190, 1, 0.4]),
  F('noodles', /maggi|noodles|ramen|chowmein|hakka/, 70, 'pack', [310, 6.5, 44, 12, 2, 2.5, 20, 0, 0]),
  F('pasta', /pasta|macaroni|spaghetti/, 200, 'plate', [330, 9, 55, 8, 4, 1.8, 60, 10, 0.1]),
  F('momos', /momos?/, 180, 'plate (6)', [300, 9, 48, 7, 3, 1.5, 40, 5, 0]),
  F('samosa', /samosa|kachori/, 60, 'piece', [160, 3, 18, 8.5, 1.5, 0.8, 15, 3, 0]),
  F('papad', /papads?|papadums?|poppadoms?|papadam/, 10, 'papad', [37, 2.5, 6, 0.3, 1.8, 0.8, 8, 0, 0]),
  F('pav', /\bpav\b|\bbun\b/, 40, 'pav', [110, 3.5, 20, 1.5, 1, 1, 30, 0, 0]),
  F('bread', /bread|toast/, 30, 'slice', [80, 2.7, 15, 1, 0.8, 1, 30, 0, 0]),
  F('sabji', /sabji|sabzi|subji|\bbhaji\b|bhindi|\baloo\b|potato|gobi|cauliflower|cabbage|vegetables?|veg curry|\bpalak\b|spinach|baingan|brinjal|mix veg|methi|lauki|dudhi|tondli|karela|capsicum|beans/, 150, 'bowl', [120, 3, 14, 6.5, 4, 1.2, 50, 20, 0]),
  F('salad', /salad|cucumber|kakdi|carrot|tomato/, 150, 'bowl', [25, 1.5, 5, 0.2, 2, 0.5, 30, 12, 0]),
  F('banana', /banana|kela/, 120, 'banana', [105, 1.3, 27, 0.4, 3, 0.3, 6, 10, 0]),
  F('orange / guava', /orange|guava|\bamla\b|kiwi|mosambi|sweet lime|papaya|strawberr/, 150, 'piece', [70, 1.5, 16, 0.5, 4, 0.3, 40, 80, 0]),
  F('fruit', /apple|mango|fruits?|grapes|watermelon|chikoo|chiku|pomegranate|anar|pear|pineapple|melon/, 150, 'piece', [80, 0.8, 20, 0.3, 3, 0.3, 12, 10, 0]),
  F('sweet', /gulab jamun|jalebi|ladoo|laddu|halwa|kheer|sweets?|mithai|chocolate|ice ?cream|biscuits?|cookies?|cake|chikki/, 50, 'piece', [200, 2.5, 28, 9, 0.3, 0.4, 40, 0, 0.1]),
  F('snack', /chips|namkeen|farsan|bhujia|chivda|chakli|\bsev\b/, 30, 'handful', [160, 3, 15, 10, 1.5, 0.8, 15, 0, 0])
];

const BY_NAME = new Map(FOODS.map(f => [f.name, f]));
export const findFood = name => BY_NAME.get(String(name || '').toLowerCase().trim()) || null;

const NUM_WORDS = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, half: 0.5, quarter: 0.25 };
const SIZE = [[/\b(small|chhota|chota|little|thoda)\b/, 0.7, 'small'], [/\b(large|big|bada|heavy|full plate)\b/, 1.4, 'large'], [/\bhalf\b/, 0.5, 'half'], [/\bdouble\b/, 2, 'double']];
const MEAL_WORDS = /\b(ate|eat|eaten|had|lunch|dinner|breakfast|snacks?|meal|nashta|mess|canteen|tiffin)\b/;
const FILLER = /\b(\d+(\.\d+)?|a|an|one|two|three|four|five|six|seven|eight|nine|ten|half|small|large|big|medium|bowls?|katoris?|plates?|glass(es)?|cups?|pieces?|pcs|slices?|g|gm|grams?|kg|ml|of|with|some|little|and|for|in|at|my|the|ate|had|eat|lunch|dinner|breakfast|snacks?|roasted|roated|fried|boiled|cooked|homemade|home|made|plain|hot|cold|today|morning|evening|night|mess|canteen|then)\b/g;

const numOf = s => { if (s == null) return null; const t = s.toLowerCase(); if (NUM_WORDS[t] != null) return NUM_WORDS[t]; const n = parseFloat(t); return Number.isFinite(n) ? n : null; };
export const r1 = x => Math.round(x * 10) / 10;
const r2 = x => Math.round(x * 100) / 100;

export const zeroN = () => Object.fromEntries(NKEYS.map(k => [k, 0]));
export function scaleN(food, servings) {
  const out = {};
  NKEYS.forEach((k, i) => { out[k] = k === 'kcal' ? Math.round(food.n[i] * servings) : r2(food.n[i] * servings); });
  return out;
}
export function addN(a, b) { const o = { ...a }; for (const k of NKEYS) o[k] = r2((o[k] || 0) + (Number(b?.[k]) || 0)); return o; }

// One counted food. qty = servings of the table unit.
export function makeItem(food, qty, desc) {
  return { name: food.name, desc: desc ?? `${fmtQty(qty)} × ${food.unit}`, qty: r2(qty), unit: food.unit, n: scaleN(food, qty), protein: r1(food.n[1] * qty), known: true };
}
export const fmtQty = q => (Math.abs(q - Math.round(q)) < 0.01 ? String(Math.round(q)) : String(r2(q)));

// Make sure an item carries a full nutrient set (older logs only stored protein).
export function itemNutrients(it) {
  if (it?.n && typeof it.n.kcal === 'number') return it.n;
  const f = findFood(it?.name);
  if (f && it.known !== false) {
    const qty = it.qty ?? (f.p ? (Number(it.protein) || 0) / f.p : 1);
    return scaleN(f, qty);
  }
  return { ...zeroN(), p: Number(it?.protein) || 0 };
}
export function actNutrients(a) {
  if (a?.type !== 'food') return null;
  if (a.items?.length) return a.items.reduce((s, it) => addN(s, itemNutrients(it)), zeroN());
  if (a.n) return a.n;
  return { ...zeroN(), p: Number(a.protein) || 0 };
}

// Find every known food in one piece of text, with its own quantity and size.
function matchFoods(part) {
  const lc = part.toLowerCase();
  const taken = new Array(lc.length).fill(false);
  const hits = [];
  for (const f of FOODS) {
    const re = new RegExp(f.re.source, 'g');
    let m;
    while ((m = re.exec(lc))) {
      const s = m.index, e = s + m[0].length;
      if (!m[0].length) { re.lastIndex++; continue; }
      if (taken.slice(s, e).some(Boolean)) continue;
      for (let i = s; i < e; i++) taken[i] = true;
      hits.push({ f, s, e, text: m[0] });
    }
  }
  hits.sort((a, b) => a.s - b.s);
  // Tea/coffee "with milk" is part of the drink; an omelette or egg curry already counts its eggs.
  const hasDrink = hits.some(h => h.f.drink), hasOmelette = hits.some(h => h.f.eggs || h.f.name === 'egg curry');
  const kept = [];
  for (const h of hits) {
    if (hasDrink && h.f.name === 'milk') continue;
    if (hasOmelette && h.f.name === 'egg') continue;
    // "potato sabji", "aloo bhaji": two words for the same dish → count once.
    const prev = kept[kept.length - 1];
    if (prev && prev.f === h.f && !/[\d,]/.test(lc.slice(prev.e, h.s)) && lc.slice(prev.e, h.s).trim().split(/\s+/).filter(Boolean).length <= 1) { prev.e = h.e; continue; }
    kept.push({ ...h });
  }
  return kept.map((h, i, arr) => {
    const before = lc.slice(i ? arr[i - 1].e : 0, h.s);
    const after = lc.slice(h.e, i < arr.length - 1 ? arr[i + 1].s : lc.length);
    const q = before.match(/(\d+(?:\.\d+)?|\b(?:a|an|one|two|three|four|five|six|seven|eight|nine|ten|half|quarter)\b)[^\d]*$/);
    let qty = q ? numOf(q[1]) : 1;
    let size = 1, sizeLabel = '';
    for (const [re, k, label] of SIZE) if (re.test(before)) { size = k; sizeLabel = label; if (label === 'half' && q && q[1] === 'half') qty = 1; }
    const grams = (before.match(/(\d+(?:\.\d+)?)\s*(g|gm|grams?)\b/) || after.match(/^\s*(\d+(?:\.\d+)?)\s*(g|gm|grams?)\b/));
    const ml = (before.match(/(\d+(?:\.\d+)?)\s*ml\b/) || after.match(/^\s*(\d+(?:\.\d+)?)\s*ml\b/));
    if (h.f.eggs) {
      const eggs = (before + h.text + after).match(/(\d+)\s*(?:eggs?|anda|ande)/);
      if (eggs) return makeItem(h.f, +eggs[1] / 2, `${eggs[1]}-egg ${h.f.name}`);
      return makeItem(h.f, qty);
    }
    if (grams) { const gr = parseFloat(grams[1]); return makeItem(h.f, gr / h.f.g, `${gr} g`); }
    if (ml) { const v = parseFloat(ml[1]); return makeItem(h.f, v / h.f.g, `${v} ml`); }
    const servings = qty * size;
    return makeItem(h.f, servings, `${sizeLabel ? sizeLabel + ' ' : ''}${qty !== 1 ? fmtQty(qty) + ' × ' : ''}${h.f.unit}`);
  });
}

// Parse one food phrase ("2 roti + 1 bowl rajma and 5 papads") into items.
export function parseFood(chunk) {
  const parts = chunk.split(/\+|&|\band\b|\bwith\b(?![^+]*\b(?:milk|sugar)\b)/i).filter(p => p && p.trim());
  const items = [];
  let knownCount = 0;
  for (const raw of parts) {
    const part = raw.trim();
    const found = matchFoods(part);
    if (found.length) { items.push(...found); knownCount += found.length; continue; }
    const leftover = part.toLowerCase().replace(FILLER, ' ').replace(/[^a-z\s]/g, ' ').trim();
    if (leftover.length >= 3) items.push({ name: part, desc: 'not in food table', qty: 1, n: zeroN(), protein: 0, known: false });
  }
  const isFood = knownCount > 0 || MEAL_WORDS.test(chunk.toLowerCase());
  if (!isFood) return null;
  const n = items.reduce((s, it) => addN(s, it.n), zeroN());
  return { items, n, protein: r1(n.p), unknown: items.filter(i => !i.known).length };
}

// Compact reference for the AI so it can map foods to the same table.
export function foodReference() {
  return FOODS.map(f => `${f.name} (1 serving = ${f.unit}, ${f.g} g)`).join('; ');
}

// ---------- Daily targets (ICMR-NIN 2020 RDA) ----------
// Iron and calcium are personalized by sex/age: menstruating women need far more iron
// (higher blood loss), and calcium needs rise after 50 (bone density). Everything else
// follows the ICMR-NIN 2020 adult baseline until a fuller RDA table is wired in.
export function dailyTargets(s) {
  const kcal = Number(s.calorieTarget) || 2400;
  const female = s.sex === 'female';
  const age = Number(s.age) || 30;
  return {
    kcal,
    p: Math.round(s.weightKg * s.proteinPerKg),
    c: Math.round(kcal * 0.55 / 4),
    f: Math.round(kcal * 0.25 / 9),
    fib: Math.round(kcal / 1000 * 15),
    fe: female && age < 50 ? 29 : 19,
    ca: age >= 50 ? 1200 : 1000,
    vc: 80, b12: 2.5
  };
}
