// Local-first storage. Cloud sync (cloud.js) mirrors this when signed in.
import { DEFAULT_SETTINGS } from './knowledge.js';

const KEY = 'jarvis.v1';

export const dateKey = (d = new Date()) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};
export const shiftKey = (key, n) => { const d = new Date(key + 'T12:00:00'); d.setDate(d.getDate() + n); return dateKey(d); };
export const emptyDay = key => ({ date: key, entries: [], quick: { sleep: null, water: 0, mood: null, energy: null, screen: null }, report: null, updatedAt: 0 });

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (raw) return { settings: { ...DEFAULT_SETTINGS, ...raw.settings }, days: raw.days || {}, meta: raw.meta || {} };
  } catch {}
  return { settings: { ...DEFAULT_SETTINGS }, days: {}, meta: {} };
}

export const state = load();

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}

export function getDay(key) {
  if (!state.days[key]) state.days[key] = emptyDay(key);
  const d = state.days[key];
  d.quick = { ...emptyDay(key).quick, ...(d.quick || {}) };
  d.entries = d.entries || [];
  return d;
}

export function touch(key) {
  getDay(key).updatedAt = Date.now();
  save();
}

// Merge remote days in, keeping whichever copy is newer.
export function mergeDays(remote) {
  let changed = false;
  for (const [k, d] of Object.entries(remote || {})) {
    const local = state.days[k];
    if (!local || (d.updatedAt || 0) > (local.updatedAt || 0)) { state.days[k] = d; changed = true; }
  }
  if (changed) save();
  return changed;
}

export function exportJSON() { return JSON.stringify({ ...state, settings: { ...state.settings, geminiKey: '' } }, null, 2); }

export function importJSON(text) {
  const data = JSON.parse(text);
  if (!data.days) throw new Error('That file is not a Jarvis backup.');
  mergeDays(data.days);
  if (data.settings) Object.assign(state.settings, { ...data.settings, geminiKey: state.settings.geminiKey || data.settings.geminiKey || '' });
  save();
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
