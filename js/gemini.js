// Gemini API (Google AI Studio key). Called directly from the browser.
import { knowledgePack } from './knowledge.js';
import { foodReference, findFood, makeItem, zeroN, addN, r1, NKEYS } from './foods.js';

const BASE = 'https://generativelanguage.googleapis.com/v1beta';
const FALLBACK_MODEL = 'gemini-2.5-flash';

export async function listModels(key) {
  const res = await fetch(`${BASE}/models?pageSize=200`, { headers: { 'x-goog-api-key': key } });
  if (!res.ok) throw new Error(await errText(res));
  const data = await res.json();
  return (data.models || [])
    .filter(m => (m.supportedGenerationMethods || []).includes('generateContent'))
    .map(m => m.name.replace('models/', ''))
    .filter(n => /^gemini/.test(n) && !/image|tts|audio|live|embedding|vision|robotics|computer-use/.test(n));
}

// Newest stable "flash" model: fast and inexpensive, ideal for daily logs.
export function pickModel(names) {
  const ver = n => parseFloat((n.match(/gemini-(\d+(?:\.\d+)?)/) || [])[1] || 0);
  const ranked = names
    .filter(n => /flash/.test(n) && !/lite/.test(n))
    .sort((a, b) => (ver(b) - ver(a)) || (/preview|exp/.test(a) - /preview|exp/.test(b)) || a.length - b.length);
  return ranked[0] || names[0] || FALLBACK_MODEL;
}

async function errText(res) {
  try { const j = await res.json(); return j.error?.message || res.statusText; } catch { return res.statusText; }
}

// Inside a Claude-hosted page Google's servers are unreachable, so the coach runs on Claude there.
let claudeAI = null;
export async function initClaudeAI() {
  if (!window.claude?.use) return null;
  try { claudeAI = await window.claude.use('sample'); } catch { claudeAI = null; }
  return claudeAI;
}
export const provider = s => claudeAI ? 'claude' : s.geminiKey ? 'gemini' : null;
export const providerName = s => ({ claude: 'Claude', gemini: 'Gemini' })[provider(s)] || 'built-in';

async function generate(settings, system, prompt, tier = 'default') {
  if (claudeAI) {
    try {
      return await claudeAI.json(`${system}\n\n${prompt}\n\nReply with only the JSON value, no other text.`, { modelTier: tier, cache: false });
    } catch (e) { throw new Error(e?.code === 'not_granted' ? 'Allow Claude for this page to use the AI coach.' : (e?.message || 'Claude AI error')); }
  }
  const key = settings.geminiKey;
  if (!key) throw new Error('No Gemini key');
  const model = settings.geminiModel || FALLBACK_MODEL;
  const res = await fetch(`${BASE}/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.35, responseMimeType: 'application/json' }
    })
  });
  if (!res.ok) throw new Error(await errText(res));
  const data = await res.json();
  if (data.promptFeedback?.blockReason) throw new Error(`Gemini blocked that (${data.promptFeedback.blockReason}). Try rephrasing.`);
  const cand = data.candidates?.[0];
  const text = (cand?.content?.parts?.map(p => p.text || '').join('') || '').replace(/^```json|```$/g, '').trim();
  if (!text) throw new Error(cand?.finishReason === 'MAX_TOKENS' ? 'Gemini ran out of room for that reply. Try a shorter question.' : `Gemini sent back nothing (${cand?.finishReason || 'empty response'}).`);
  try { return JSON.parse(text); }
  catch {
    // Tolerate stray text around the JSON object (rare, but happens).
    const m = text.match(/\{[\s\S]*\}/);
    if (m) { try { return JSON.parse(m[0]); } catch {} }
    throw new Error('Got an unreadable reply from Gemini. Try again.');
  }
}

export async function testKey(settings) {
  const names = await listModels(settings.geminiKey);
  return { names, best: pickModel(names) };
}

const TYPES = 'walk, sunwalk, run, gym, yoga, cycle, swim, sport, food, water, sleep, reading, study, deepwork, english, chess, upsc, meditation, movie, social, screen, other';

export async function parseWithGemini(settings, text) {
  const system = `You convert a person's free-text daily log (Indian context, may mix Hindi/Marathi words) into structured JSON. Never invent foods or activities that are not in the text.
Foods: map every food to this reference table by exact name, and give "qty" = number of table servings eaten (scale by count and size words: small ×0.7, large ×1.4, half ×0.5; grams or ml → divide by the serving weight):
${foodReference()}
Only if a food truly has no close match, set "match": null and estimate per the whole amount eaten from IFCT 2017 / USDA data: "est": {"kcal","p","c","f","fib","fe","ca","vc","b12"} (g, g, g, g, mg, mg, mg, µg).`;
  const prompt = `Log: """${text}"""

Return {"acts":[...]} where each act is:
{"type": one of [${TYPES}], "label": short original phrase, "minutes": number|null, "items": [{"name": food as written, "match": table name or null, "qty": servings, "desc": "e.g. 2 roti or small bowl", "est": {...} only when match is null}] (food acts only), "pages": number|null, "litres": number|null (water), "hours": number|null (sleep), "sun": true if outdoors in daylight, "count": number|null (games/puzzles)}
Put foods eaten together in one food act. "sun walk"/walk outdoors in daylight → "sunwalk". Coding, assignments, lab reports, focused work → "deepwork". Classes/lectures/revision → "study". Instagram/reels/YouTube → "screen".`;
  const out = await generate(settings, system, prompt, 'quick');
  const acts = Array.isArray(out.acts) ? out.acts : [];
  for (const a of acts) {
    if (a.type !== 'food' || !Array.isArray(a.items)) continue;
    a.items = a.items.map(it => {
      const f = findFood(it.match);
      const qty = Math.max(0, Number(it.qty) || 1);
      if (f) return makeItem(f, qty, it.desc || undefined);
      const n = zeroN(); for (const k of NKEYS) n[k] = Math.max(0, Number(it.est?.[k]) || 0);
      return { name: it.name || 'food', desc: (it.desc || '') + ' (AI estimate)', qty: 1, n, protein: r1(n.p), known: n.kcal > 0, estimated: true };
    });
    a.n = a.items.reduce((s, it) => addN(s, it.n), zeroN());
    a.protein = r1(a.n.p);
  }
  return acts;
}

export async function coachReport(settings, payload) {
  const system = `You are Jarvis, ${settings.name}'s personal performance coach: an IIT Bombay student aiming for overall fitness and a sharp brain. Tone: direct, warm, specific, like a good coach. Ground every claim in this evidence base and do not overstate effects:\n${knowledgePack()}`;
  const prompt = `Today's data (scores already computed by the app — do not change them):
${JSON.stringify(payload, null, 1)}

Return JSON:
{
 "headline": "max 10 words summing up the day",
 "coach_note": "3-4 sentences: what went well, what held him back, one insight from the 7-day trend",
 "achievements": [{"activity": "phrase from the log", "pillar": "body|brain|mind", "effect": "1 sentence: what it achieved physiologically or cognitively, evidence-based"}],
 "suggestions": [{"title": "specific action for tomorrow", "why": "1 sentence, evidence-based", "minutes": number, "slot_index": index into free_slots_tomorrow or null}]
}
Exactly 3 suggestions, targeting the weakest areas. Use free slots when an activity needs time. Prefer realistic, cheap actions for a hostel student in Mumbai.`;
  return generate(settings, system, prompt);
}

export async function morningPlan(settings, payload) {
  const system = `You are Jarvis, ${settings.name}'s coach. Keep it short and concrete.\n${knowledgePack()}`;
  const prompt = `Plan today. Data: ${JSON.stringify(payload)}
Return {"focus":"one line","blocks":[{"slot_index":number,"activity":"what to do","minutes":number}]} with up to 4 blocks placed only in free_slots_today.`;
  return generate(settings, system, prompt);
}

// ---------- Mess menu ----------
// Which dishes from the mess menu, for meals still ahead today, help close specific nutrient gaps.
export async function messMenuSuggestions(settings, payload) {
  const system = `You help a hostel student pick what to eat from today's mess menu to close specific nutrient gaps for the day. Only suggest dishes that literally appear in the menu text given — never invent a dish. Prefer dishes genuinely rich in the gap nutrient (dal/paneer/eggs/chicken for protein and iron; citrus/amla/tomato/guava for vitamin C; milk/curd/paneer for calcium; fruit, salad, whole grains and legumes for fibre). Only suggest meals that haven't happened yet today, given the current time.`;
  const prompt = `Weekly mess menu (as transcribed, may be messy):\n"""${payload.menuText}"""\n\nToday is ${payload.weekday}, current time ${payload.timeLabel}.\nNutrient gaps still to close today: ${payload.gaps.map(g => `${g.label} (${g.gap} ${g.unit} short)`).join(', ') || 'none significant'}.\n\nReturn {"picks":[{"meal":"name of the upcoming meal, e.g. Lunch","items":["1-3 dish names, exactly as in the menu"],"why":"1 short sentence: which gap(s) this helps and why"}]} covering only meals still ahead today. If nothing in today's remaining menu clearly helps, return {"picks":[]}.`;
  return generate(settings, system, prompt, 'quick');
}

// ---------- Ask Jarvis: a short, casual side chat, not a report ----------
// Handles ANY concern — food, exercise, sleep, study, mood, screens — not just nutrition,
// by grounding every answer in the same evidence base as the report coach, plus today's full log.
export async function askCoach(settings, payload) {
  const system = `You are Jarvis, ${settings.name}'s witty best friend texting on WhatsApp — think the playful, sharp-tongued energy of Grok, not a polite wellness assistant. You happen to remember everything they logged today, but you are not a report.

Rule #1, read this first: figure out what KIND of message this is before replying.
- Small talk / greeting ("hii", "kaise ho", "how are u", "what's up", "lol", random banter): reply short and human — 1-2 sentences, playful, maybe tease them a little, like a friend would. Do NOT mention stats, scores, nutrients, gaps, or targets. Don't pivot to "by the way you're short on protein" — that's exactly what makes a bot annoying. Just vibe with them.
- An actual question about their day/food/exercise/sleep/study/mood/habits: NOW use the data below, answer directly and usefully in 2-5 sentences, grounded in real numbers and this evidence base (weave it in naturally, never as a cited footnote):
${knowledgePack()}
- A question about something totally unrelated to their day: just answer it like a sharp friend would, no forced data.

Voice: short sentences, contractions (I'd, you're, don't, that's), dry humor and light banter are welcome, Hinglish is fine if they use it, never sound like an app ("Based on your data...", "It's important to note...", bullet points, headers, "as an AI"). Don't restate their question back to them. Don't over-explain.
Food suggestions: only recommend dishes from the mess menu text if one is given; otherwise suggest realistic home/mess-style Indian food.`;
  const prompt = `Reference only — today's numbers, use ONLY if the question actually calls for it (scores 0-100, minutes/hours/litres as named): ${JSON.stringify(payload.summary)}
${payload.menuText ? `This week's mess menu:\n"""${payload.menuText}"""\n` : ''}${payload.history?.length ? `Conversation so far:\n${payload.history.map(h => `${h.role === 'user' ? settings.name : 'Jarvis'}: ${h.text}`).join('\n')}\n` : ''}${settings.name}: ${payload.question}

Return {"reply": "Jarvis's next WhatsApp-style message, matching the rule above for what kind of message this is"}`;
  const out = await generate(settings, system, prompt, 'quick');
  return out?.reply || '';
}
