// Indian food protein table, home-style portions.
// p = grams of protein per serving, g = grams in that serving, unit = what one serving is.
// Values: IFCT 2017 (ICMR-NIN) and USDA FoodData Central, rounded to home recipes.
// Order matters: specific dishes come before the ingredients they contain.
export const FOODS = [
  { name: 'whey protein', re: /whey|protein shake|protein powder/, p: 24, g: 30, unit: 'scoop' },
  { name: 'soya chunks', re: /soya|soy chunks?|nutrela/, p: 13, g: 25, unit: 'bowl (cooked)' },
  { name: 'egg white', re: /egg whites?/, p: 3.6, g: 33, unit: 'white' },
  { name: 'omelette', re: /omelet+e?s?|omlet|egg bhurji|anda bhurji/, p: 12, g: 110, unit: '2-egg omelette', eggs: true },
  { name: 'egg', re: /\beggs?\b|\banda\b|\bande\b/, p: 6, g: 50, unit: 'egg' },
  { name: 'paneer bhurji', re: /paneer bhurji/, p: 14, g: 150, unit: 'bowl' },
  { name: 'paneer paratha', re: /paneer paratha/, p: 9, g: 100, unit: 'paratha' },
  { name: 'paneer curry', re: /palak paneer|paneer (butter )?masala|shahi paneer|matar paneer|kadai paneer|paneer curry|paneer sabji|paneer tikka/, p: 12, g: 150, unit: 'bowl' },
  { name: 'paneer', re: /paneer/, p: 18, g: 100, unit: '100 g' },
  { name: 'tofu', re: /tofu/, p: 12, g: 100, unit: '100 g' },
  { name: 'veg biryani / pulao', re: /veg biryani|pulao|pulav/, p: 7, g: 250, unit: 'plate' },
  { name: 'chicken biryani', re: /chicken biryani|mutton biryani|biryani/, p: 20, g: 300, unit: 'plate' },
  { name: 'chicken curry', re: /chicken curry|butter chicken|chicken masala|chicken gravy|chicken tikka/, p: 20, g: 200, unit: 'bowl' },
  { name: 'chicken', re: /chicken/, p: 27, g: 100, unit: '100 g cooked' },
  { name: 'fish curry', re: /fish curry/, p: 18, g: 200, unit: 'bowl' },
  { name: 'fish', re: /fish|prawns?|surmai|pomfret|bangda|rawas/, p: 22, g: 100, unit: '100 g cooked' },
  { name: 'mutton', re: /mutton|keema|\bmeat\b/, p: 25, g: 100, unit: '100 g cooked' },
  { name: 'misal pav', re: /misal(?: ?pav)?/, p: 12, g: 300, unit: 'plate' },
  { name: 'pav bhaji', re: /pav bhaji/, p: 10, g: 300, unit: 'plate' },
  { name: 'vada pav', re: /vada ?pav/, p: 5, g: 150, unit: 'piece' },
  { name: 'rajma', re: /rajma|kidney beans?/, p: 9, g: 150, unit: 'bowl' },
  { name: 'roasted chana', re: /roasted chana|bhuna chana|chana jor|futana/, p: 6, g: 30, unit: 'handful' },
  { name: 'chole', re: /chole|chhole|chana masala|chickpeas?|kabuli|\bchana\b/, p: 9, g: 150, unit: 'bowl' },
  { name: 'sprouts', re: /sprouts?|usal|moong salad/, p: 7, g: 100, unit: 'bowl' },
  { name: 'sambar', re: /sambar|sambhar/, p: 4, g: 150, unit: 'bowl' },
  { name: 'khichdi', re: /khichdi|khichadi/, p: 7, g: 200, unit: 'bowl' },
  { name: 'dal', re: /\bdal\b|\bdaal\b|\bdhal\b|lentils?|varan|amti|\btoor\b|masoor/, p: 7, g: 150, unit: 'bowl' },
  { name: 'kadhi', re: /kadhi/, p: 4, g: 150, unit: 'bowl' },
  { name: 'greek yogurt', re: /greek yog/, p: 10, g: 100, unit: '100 g' },
  { name: 'curd', re: /curd|dahi|yogh?urt|raita/, p: 5, g: 150, unit: 'bowl' },
  { name: 'lassi', re: /lassi/, p: 6, g: 250, unit: 'glass' },
  { name: 'buttermilk', re: /chaas|chhaas|buttermilk|mattha|taak/, p: 2, g: 250, unit: 'glass' },
  { name: 'chai', re: /\bchai\b|\btea\b/, p: 1, g: 120, unit: 'cup', drink: true },
  { name: 'coffee', re: /coffee/, p: 2, g: 150, unit: 'cup', drink: true },
  { name: 'juice / sharbat', re: /juice|sharbat|sarbat|nimbu pani|lemonade|kokum|soda|cola|coke|pepsi|sprite|nariyal pani|coconut water/, p: 0.5, g: 250, unit: 'glass', drink: true },
  { name: 'milk', re: /\bmilk\b|doodh|\bdudh\b/, p: 8, g: 250, unit: 'glass' },
  { name: 'cheese', re: /cheese/, p: 4, g: 20, unit: 'slice' },
  { name: 'peanut butter', re: /peanut butter/, p: 4, g: 16, unit: 'tbsp' },
  { name: 'peanuts', re: /peanuts?|groundnuts?|shengdana|moongphali/, p: 7, g: 30, unit: 'handful' },
  { name: 'nuts', re: /almonds?|badam|cashews?|kaju|walnuts?|pista|\bnuts\b|dry ?fruits?/, p: 5, g: 25, unit: 'handful' },
  { name: 'paratha', re: /aloo paratha|paratha|parotta|thepla/, p: 5, g: 100, unit: 'paratha' },
  { name: 'roti', re: /\broti|chapati|chapatti|chapathi|phulka|bhakri|bhakari|\bpoli\b/, p: 3, g: 40, unit: 'roti' },
  { name: 'puri', re: /\bpuris?\b|poori/, p: 2, g: 25, unit: 'puri' },
  { name: 'naan', re: /naan|kulcha/, p: 7, g: 90, unit: 'naan' },
  { name: 'rice', re: /\brice\b|chawal|jeera rice|curd rice|lemon rice/, p: 4, g: 150, unit: 'bowl (cooked)' },
  { name: 'poha', re: /poha/, p: 5, g: 200, unit: 'plate' },
  { name: 'upma', re: /upma|sheera|rava/, p: 5, g: 200, unit: 'plate' },
  { name: 'masala dosa', re: /masala dosa/, p: 5, g: 180, unit: 'dosa' },
  { name: 'dosa', re: /dosa|uttapam|uthappam/, p: 4, g: 120, unit: 'dosa' },
  { name: 'idli', re: /idli|idly/, p: 2, g: 40, unit: 'idli' },
  { name: 'medu vada', re: /medu vada|\bvada\b|\bwada\b/, p: 3, g: 45, unit: 'vada' },
  { name: 'dhokla', re: /dhokla|khaman/, p: 2, g: 40, unit: 'piece' },
  { name: 'oats', re: /oats|oatmeal|porridge|daliya|dalia/, p: 5, g: 40, unit: 'bowl (40 g dry)' },
  { name: 'cereal', re: /cornflakes|muesli|cereal|granola/, p: 3, g: 40, unit: 'bowl' },
  { name: 'sandwich', re: /sandwich/, p: 7, g: 150, unit: 'sandwich' },
  { name: 'burger', re: /burger/, p: 12, g: 180, unit: 'burger' },
  { name: 'pizza', re: /pizza/, p: 6, g: 100, unit: 'slice' },
  { name: 'noodles', re: /maggi|noodles|ramen|chowmein|hakka/, p: 5, g: 70, unit: 'pack' },
  { name: 'pasta', re: /pasta|macaroni|spaghetti/, p: 7, g: 200, unit: 'plate' },
  { name: 'momos', re: /momos?/, p: 9, g: 180, unit: 'plate (6)' },
  { name: 'samosa', re: /samosa|kachori/, p: 3, g: 60, unit: 'piece' },
  { name: 'papad', re: /papads?|papadums?|poppadoms?|papadam/, p: 2.5, g: 10, unit: 'papad' },
  { name: 'pav', re: /\bpav\b|\bbun\b/, p: 3, g: 40, unit: 'pav' },
  { name: 'bread', re: /bread|toast/, p: 3, g: 30, unit: 'slice' },
  { name: 'sabji', re: /sabji|sabzi|subji|\bbhaji\b|bhindi|\baloo\b|potato|gobi|cauliflower|cabbage|vegetables?|veg curry|\bpalak\b|baingan|brinjal|mix veg|methi|lauki|dudhi|tondli|karela|capsicum|beans/, p: 3, g: 150, unit: 'bowl' },
  { name: 'salad', re: /salad|cucumber|kakdi/, p: 1.5, g: 150, unit: 'bowl' },
  { name: 'banana', re: /banana|kela/, p: 1.3, g: 120, unit: 'banana' },
  { name: 'fruit', re: /apple|orange|mango|papaya|fruits?|grapes|watermelon|guava|chikoo|chiku|pomegranate|pear/, p: 1, g: 150, unit: 'piece' },
  { name: 'sweet', re: /gulab jamun|jalebi|ladoo|laddu|halwa|kheer|sweets?|mithai|chocolate|ice ?cream|biscuits?|cookies?|cake/, p: 2, g: 50, unit: 'piece' },
  { name: 'snack', re: /chips|namkeen|farsan|bhujia|chivda|chakli|sev\b/, p: 2, g: 30, unit: 'handful' }
];

const NUM_WORDS = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, half: 0.5, quarter: 0.25 };
const SIZE = [[/\b(small|chhota|chota|little|thoda)\b/, 0.7, 'small'], [/\b(large|big|bada|heavy|full plate)\b/, 1.4, 'large'], [/\bhalf\b/, 0.5, 'half'], [/\bdouble\b/, 2, 'double']];
const MEAL_WORDS = /\b(ate|eat|eaten|had|lunch|dinner|breakfast|snacks?|meal|nashta|mess|canteen|tiffin)\b/;
const FILLER = /\b(\d+(\.\d+)?|a|an|one|two|three|four|five|six|seven|eight|nine|ten|half|small|large|big|medium|bowls?|katoris?|plates?|glass(es)?|cups?|pieces?|pcs|slices?|g|gm|grams?|kg|ml|of|with|some|little|and|for|in|at|my|the|ate|had|eat|lunch|dinner|breakfast|snacks?|roasted|roated|fried|boiled|cooked|homemade|home|made|plain|hot|cold|today|morning|evening|night|mess|canteen|then)\b/g;

const numOf = s => { if (s == null) return null; const t = s.toLowerCase(); if (NUM_WORDS[t] != null) return NUM_WORDS[t]; const n = parseFloat(t); return Number.isFinite(n) ? n : null; };
const r1 = x => Math.round(x * 10) / 10;

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
      if (taken.slice(s, e).some(Boolean)) continue;
      for (let i = s; i < e; i++) taken[i] = true;
      hits.push({ f, s, e, text: m[0] });
      if (!m[0].length) re.lastIndex++;
    }
  }
  hits.sort((a, b) => a.s - b.s);
  // Tea/coffee "with milk" is part of the drink; an omelette already counts its eggs.
  const hasDrink = hits.some(h => h.f.drink), hasOmelette = hits.some(h => h.f.eggs);
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
    let protein, desc;
    if (h.f.eggs) {
      const eggs = (before + h.text + after).match(/(\d+)\s*(?:eggs?|anda|ande)/);
      protein = eggs ? +eggs[1] * 6 : qty * h.f.p;
      desc = eggs ? `${eggs[1]}-egg ${h.f.name}` : `${qty} × ${h.f.unit}`;
    } else if (grams) {
      const gr = parseFloat(grams[1]);
      protein = h.f.p * gr / h.f.g; desc = `${gr} g`;
    } else {
      protein = h.f.p * qty * size;
      desc = `${sizeLabel ? sizeLabel + ' ' : ''}${qty !== 1 ? qty + ' × ' : ''}${h.f.unit}`;
    }
    return { name: h.f.name, desc, protein: r1(protein), per: h.f.p, unit: h.f.unit, known: true };
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
    if (leftover.length >= 3) items.push({ name: part, desc: 'not in food table', protein: 0, known: false });
  }
  const isFood = knownCount > 0 || MEAL_WORDS.test(chunk.toLowerCase());
  if (!isFood) return null;
  const protein = r1(items.reduce((s, i) => s + (i.protein || 0), 0));
  return { items, protein, unknown: items.filter(i => !i.known).length };
}

// Compact reference for the AI so its estimates match the same scale.
export function foodReference() {
  return FOODS.map(f => `${f.name}: ${f.p} g per ${f.unit}`).join('; ');
}
