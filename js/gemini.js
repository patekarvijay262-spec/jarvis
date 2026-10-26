// Gemini API (Google AI Studio key). Called directly from the browser.
import { knowledgePack } from './knowledge.js';

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
  const text = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
  return JSON.parse(text.replace(/^```json|```$/g, '').trim());
}

export async function testKey(settings) {
  const names = await listModels(settings.geminiKey);
  return { names, best: pickModel(names) };
}

const TYPES = 'walk, sunwalk, run, gym, yoga, cycle, swim, sport, food, water, sleep, reading, study, deepwork, english, chess, upsc, meditation, movie, social, screen, other';

export async function parseWithGemini(settings, text) {
  const system = `You convert a person's free-text daily log (Indian context, may mix Hindi/Marathi words) into structured JSON. Be accurate with Indian food protein estimates (egg 6 g, bowl dal 9 g, 100 g paneer 18 g, roti 3 g, glass milk 8 g, 100 g chicken 27 g, bowl curd 8 g). Never invent activities that are not in the text.`;
  const prompt = `Log: """${text}"""

Return {"acts":[...]} where each act is:
{"type": one of [${TYPES}], "label": short original phrase, "minutes": number|null, "protein": grams|null (food only, total for the item), "pages": number|null, "litres": number|null (water), "hours": number|null (sleep), "sun": true if outdoors in daylight, "count": number|null (games/puzzles)}
"sun walk"/walk outdoors in daylight → type "sunwalk". Coding, assignments, lab reports, focused work → "deepwork". Classes/lectures/revision → "study". Instagram/reels/YouTube → "screen".`;
  const out = await generate(settings, system, prompt, 'quick');
  return Array.isArray(out.acts) ? out.acts : [];
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
