// Evidence base used by the local coach and sent to Gemini as grounding.
// Keep claims conservative: what the research supports, not hype.

export const GUIDELINES = {
  activity: {
    source: 'WHO Guidelines on Physical Activity (2020)',
    text: 'Adults 18–64: 150–300 min/week moderate or 75–150 min/week vigorous aerobic activity (1 vigorous min ≈ 2 moderate min), plus muscle-strengthening on 2+ days/week. Reduce long sitting; any movement beats none.'
  },
  protein: {
    source: 'ISSN Position Stand: Protein & Exercise (2017); ICMR-NIN Dietary Guidelines (2024)',
    text: 'Active people building muscle: ~1.4–2.0 g/kg/day. Spread over 3–4 meals of ~0.3 g/kg (20–40 g) each for best muscle protein synthesis. Indian vegetarian diets often fall short; combine cereals with pulses for a complete amino-acid profile.'
  },
  sleep: {
    source: 'AASM/SRS consensus (2015); National Sleep Foundation',
    text: 'Adults need 7–9 h; under 7 h regularly impairs attention, memory consolidation, mood and appetite control. A consistent wake time matters as much as duration.'
  },
  sunlight: {
    source: 'Circadian research (e.g. Blume et al. 2019); vitamin D photobiology',
    text: 'Bright morning daylight within ~1 h of waking anchors the body clock, raises daytime alertness and helps you fall asleep earlier. Vitamin D is made mainly when UV index ≥ 3 (in Mumbai roughly 10 am–3 pm); 10–20 min with arms exposed is typically enough for brown skin. Early-morning light helps the clock more than vitamin D.'
  },
  hydration: {
    source: 'EFSA water intake reference (2010); dehydration–cognition studies',
    text: 'Men need ~2.5 L/day of water from drinks; more in heat or exercise. Even 1–2% body-water loss measurably worsens attention, mood and perceived effort.'
  },
  reading: {
    source: 'Cognitive reserve research (e.g. Wilson et al., Neurology 2013); reading-comprehension studies',
    text: 'Regular sustained reading builds vocabulary, background knowledge and focused attention, and lifelong cognitive activity is linked with slower cognitive decline. Print or distraction-free reading improves comprehension over skim-reading on feeds.'
  },
  deepwork: {
    source: 'Attention research (Leroy 2009 "attention residue"); deliberate practice (Ericsson)',
    text: 'Single-task blocks of 50–90 min without switching produce more and better work; each switch leaves "attention residue". 3–4 h of true deep work is a strong daily ceiling for most people.'
  },
  meditation: {
    source: 'Meta-analyses of mindfulness programs (Goyal et al., JAMA IM 2014)',
    text: 'Regular mindfulness practice gives moderate reductions in anxiety, stress and low mood, and improves attention control. Consistency (10+ min most days) matters more than session length.'
  },
  screen: {
    source: 'Sleep and digital-media studies; social-media and wellbeing meta-analyses',
    text: 'Screens in the hour before bed delay sleep onset (light + arousal). Heavy passive scrolling is associated with lower mood; active, intentional use is far less harmful. A useful target is ≤ 2 h/day of leisure screen time.'
  },
  nutrition: {
    source: 'ICMR-NIN Nutrient Requirements for Indians (2020); WHO Healthy Diet fact sheet',
    text: 'Adult men need about 19 mg iron, 1000 mg calcium, 80 mg vitamin C and 2.5 µg vitamin B12 a day, plus about 15 g fibre per 1000 kcal. Carbohydrates should give roughly 50–55% of calories and fat 20–30%. Vitamin C in the same meal (lemon, amla, guava, tomato) multiplies iron absorption from dal, poha and greens. B12 comes only from animal foods (milk, curd, paneer, eggs, meat), so vegetarians should eat dairy every day.'
  },
  skills: {
    source: 'Deliberate-practice and second-language acquisition research',
    text: 'Skills grow from short, frequent, focused practice with feedback. Spoken fluency improves mainly through speaking output and shadowing, not passive listening. Chess training improves chess-specific pattern recognition; transfer to general intelligence is weak, so value it for focus and calculation, not IQ.'
  }
};

// What each kind of activity does, scientifically. Used for the "what it achieved" section.
export const EFFECTS = {
  walk:        { pillar: 'body', effect: 'Moderate aerobic minutes toward the WHO 150 min/week target; a 10–15 min walk after meals blunts the blood-sugar spike.', ref: 'activity' },
  sunwalk:     { pillar: 'mind', effect: 'Daylight resets your body clock (sharper mornings, easier sleep tonight) and lifts mood; between 10 am–3 pm it also drives vitamin D synthesis.', ref: 'sunlight' },
  run:         { pillar: 'body', effect: 'Vigorous cardio: each minute counts about double toward WHO targets; improves VO₂max, the strongest fitness marker of long-term health.', ref: 'activity' },
  gym:         { pillar: 'body', effect: 'Muscle-strengthening work (WHO: 2+ days/week) builds strength and insulin sensitivity; pair with enough protein to build muscle.', ref: 'activity' },
  yoga:        { pillar: 'body', effect: 'Mobility, balance and some strength, with a calming effect on stress via slow breathing.', ref: 'activity' },
  cycle:       { pillar: 'body', effect: 'Low-impact cardio that counts toward WHO aerobic minutes and is easy on knees.', ref: 'activity' },
  swim:        { pillar: 'body', effect: 'Full-body cardio and muscular endurance with almost no joint load.', ref: 'activity' },
  sport:       { pillar: 'body', effect: 'Cardio plus coordination and quick decision-making; playing with others adds a social mood boost.', ref: 'activity' },
  exercise:    { pillar: 'body', effect: 'Physical activity minutes toward the WHO weekly target.', ref: 'activity' },
  protein:     { pillar: 'body', effect: 'Supplies amino acids for muscle repair and keeps you full longer.', ref: 'protein' },
  eggs:        { pillar: 'body', effect: 'Complete protein (~6 g each) with choline for brain cell membranes and memory chemistry.', ref: 'protein' },
  dal:         { pillar: 'body', effect: 'Plant protein and fibre; with rice or roti it completes the amino-acid profile.', ref: 'protein' },
  paneer:      { pillar: 'body', effect: 'Dense casein protein; slow digestion makes it good for a later meal.', ref: 'protein' },
  chicken:     { pillar: 'body', effect: 'Lean complete protein, about 25–30 g per 100 g cooked.', ref: 'protein' },
  milk:        { pillar: 'body', effect: 'Protein plus calcium; whey + casein mix supports muscle recovery.', ref: 'protein' },
  food:        { pillar: 'body', effect: 'Fuel for the day; protein and fibre content decide how long it keeps you going.', ref: 'protein' },
  water:       { pillar: 'body', effect: 'Hydration protects attention and mood; even mild dehydration lowers focus.', ref: 'hydration' },
  sleep:       { pillar: 'body', effect: 'Sleep consolidates today’s learning into long-term memory and resets attention and appetite hormones.', ref: 'sleep' },
  reading:     { pillar: 'brain', effect: 'Sustained reading trains focus and builds vocabulary and knowledge; part of long-term cognitive reserve.', ref: 'reading' },
  study:       { pillar: 'brain', effect: 'Focused study blocks build understanding; spaced revision tomorrow will lock it in.', ref: 'deepwork' },
  deepwork:    { pillar: 'brain', effect: 'Uninterrupted focus produces high-quality output and strengthens your ability to concentrate.', ref: 'deepwork' },
  english:     { pillar: 'brain', effect: 'Speaking practice builds fluency and confidence; output practice is what moves spoken English forward.', ref: 'skills' },
  chess:       { pillar: 'brain', effect: 'Trains calculation, pattern recognition and patience; best gains come from puzzles and reviewing your games.', ref: 'skills' },
  upsc:        { pillar: 'brain', effect: 'Builds the current-affairs and GS base; quick revision within 24 h greatly improves retention.', ref: 'reading' },
  meditation:  { pillar: 'mind', effect: 'Lowers stress reactivity and trains attention control; benefits build with daily consistency.', ref: 'meditation' },
  movie:       { pillar: 'mind', effect: 'Leisure and recovery; watched with friends it adds social connection. Late-night screens can delay sleep.', ref: 'screen' },
  social:      { pillar: 'mind', effect: 'Time with people is one of the strongest predictors of mood and long-term wellbeing.', ref: 'meditation' },
  screen:      { pillar: 'mind', effect: 'Leisure screen time; passive scrolling tends to lower mood and late use delays sleep.', ref: 'screen' },
  other:       { pillar: 'mind', effect: 'Logged activity.', ref: null }
};

// Approximate protein per typical Indian serving (grams). Used when Gemini isn't available.
export const PROTEIN = [
  { k: /\begg(s)?\b|anda/, per: 6, unit: 'egg' },
  { k: /egg white/, per: 3.6, unit: 'white' },
  { k: /\bdal\b|lentil|sambar/, per: 9, unit: 'bowl' },
  { k: /rajma|chole|chana|chickpea/, per: 12, unit: 'bowl' },
  { k: /paneer/, per: 18, unit: '100 g' },
  { k: /tofu/, per: 12, unit: '100 g' },
  { k: /soya|soy chunk/, per: 26, unit: '50 g' },
  { k: /chicken/, per: 27, unit: '100 g' },
  { k: /fish|prawn/, per: 22, unit: '100 g' },
  { k: /mutton|meat/, per: 25, unit: '100 g' },
  { k: /whey|protein shake|scoop/, per: 24, unit: 'scoop' },
  { k: /\bmilk\b/, per: 8, unit: 'glass' },
  { k: /curd|dahi|yogurt|yoghurt/, per: 8, unit: 'bowl' },
  { k: /greek yogurt/, per: 15, unit: 'cup' },
  { k: /peanut butter/, per: 8, unit: '2 tbsp' },
  { k: /peanut|groundnut/, per: 7, unit: '30 g' },
  { k: /almond|nuts|cashew/, per: 6, unit: 'handful' },
  { k: /sprout/, per: 10, unit: 'bowl' },
  { k: /\broti\b|chapati|phulka/, per: 3, unit: 'roti' },
  { k: /\brice\b/, per: 4, unit: 'cup' },
  { k: /oats/, per: 5, unit: 'bowl' },
  { k: /poha|upma/, per: 4, unit: 'plate' },
  { k: /idli/, per: 2, unit: 'idli' },
  { k: /dosa/, per: 3, unit: 'dosa' },
  { k: /sandwich/, per: 8, unit: 'sandwich' },
  { k: /bread|toast/, per: 3, unit: 'slice' },
  { k: /banana|apple|fruit/, per: 1, unit: 'piece' }
];

export const DEFAULT_SETTINGS = {
  name: 'Vijay',
  weightKg: 65,
  proteinPerKg: 1.4,
  calorieTarget: 2400,
  sex: 'male',
  age: 25,
  heightCm: 170,
  activityLevel: 'moderate',
  goal: 'general_health',
  sleepTarget: 8,
  waterTarget: 3,
  exerciseTarget: 30,
  deepWorkTarget: 180,
  readingTarget: 20,
  meditationTarget: 10,
  screenLimit: 2,
  skills: ['english', 'chess', 'upsc', 'meditation'],
  morningTime: '07:30',
  nightTime: '22:00',
  dayStart: '07:00',
  dayEnd: '23:00',
  geminiKey: '',
  geminiModel: '',
  firebaseConfig: '',
  reminderIds: {},
  messMenu: '',
  shareScores: true,
  notifications: false,
  theme: 'system'
};

export const SKILL_LABELS = {
  english: 'Spoken English',
  chess: 'Chess',
  upsc: 'UPSC reading',
  meditation: 'Meditation'
};

export function knowledgePack() {
  return Object.values(GUIDELINES).map(g => `• ${g.text} [${g.source}]`).join('\n');
}
