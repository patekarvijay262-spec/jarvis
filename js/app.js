import { state, save, getDay, touch, mergeDays, dateKey, shiftKey, exportJSON, importJSON, uid } from './store.js';
import { parseLocal } from './parser.js';
import { NUTRIENTS, FOODS, findFood, makeItem, scaleN, itemNutrients, zeroN, addN, fmtQty, r1 as round1, dailyTargets } from './foods.js';
import { score, grade, achievements, localSuggestions, streak, skillName } from './scoring.js';
import { GUIDELINES, SKILL_LABELS, DEFAULT_SETTINGS } from './knowledge.js';
import * as G from './gemini.js';
import * as C from './cloud.js';
import * as Cal from './calendar.js';
import { lines, barsWithTarget, stacked, radar, ring, heatmap, spark } from './charts.js';

const S = state.settings;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const today = () => dateKey();

const ui = {
  view: 'today', date: today(), range: 7, planDay: 'today', friend: null,
  cal: {}, friends: null, profile: null, busy: {}, recognizing: false
};

// ---------- Icons ----------
const I = {
  today: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="3"/><path d="M3 9h18M8 2v4M16 2v4"/><circle cx="12" cy="15" r="2"/></svg>',
  report: '<svg viewBox="0 0 24 24"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h4"/></svg>',
  trends: '<svg viewBox="0 0 24 24"><path d="M3 20h18"/><path d="M5 16l4-5 4 3 6-8"/></svg>',
  plan: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  friends: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5"/><circle cx="17" cy="9" r="2.8"/><path d="M16.5 14.6c2.6.3 4.4 2.2 5 5.4"/></svg>',
  settings: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  mic: '<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
  send: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  spark: '<svg viewBox="0 0 24 24"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/></svg>',
  cal: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="3"/><path d="M3 9h18M8 2v4M16 2v4M12 12v6M9 15h6"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  copy: '<svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>',
  sun: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon: '<svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z"/></svg>',
  auto: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 3v18" /><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/></svg>',
  log: '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>'
};

const NAV = [
  ['today', 'Today'], ['report', 'Report'], ['trends', 'Trends'], ['plan', 'Plan'], ['friends', 'Friends'], ['settings', 'Settings']
];
const PILLARS = [['body', 'Body'], ['brain', 'Brain'], ['mind', 'Mind']];
const color = p => getComputedStyle(document.documentElement).getPropertyValue('--' + p).trim();

// ---------- Small UI helpers ----------
let toastT;
function toast(msg, ms = 2600) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, ms);
}
function sheet(html) {
  $('#sheet').innerHTML = html; $('#sheet').hidden = false; $('#sheetBackdrop').hidden = false;
  $('#sheet').querySelector('input,button')?.focus();
}
function closeSheet() { $('#sheet').hidden = true; $('#sheetBackdrop').hidden = true; }
$('#sheetBackdrop').addEventListener('click', closeSheet);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

function fmtDay(key) {
  if (key === today()) return 'Today';
  if (key === shiftKey(today(), -1)) return 'Yesterday';
  return new Date(key + 'T12:00:00').toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });
}
const shortDay = key => new Date(key + 'T12:00:00').toLocaleDateString([], { day: 'numeric', month: 'short' });
const weekday = key => new Date(key + 'T12:00:00').toLocaleDateString([], { weekday: 'short' });
const lastKeys = (n, end = today()) => Array.from({ length: n }, (_, i) => shiftKey(end, i - n + 1));
const hasLog = key => { const d = state.days[key]; return !!d && ((d.entries || []).length > 0 || Object.values(d.quick || {}).some(v => v)); };
const scoreOf = key => score(getDay(key), S);
const avg = arr => { const v = arr.filter(x => x != null); return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null; };
const timeOf = ts => new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
const weekStart = key => { const d = new Date(key + 'T12:00:00'); const off = (d.getDay() + 6) % 7; d.setDate(d.getDate() - off); return dateKey(d); };

// ---------- Persist + sync ----------
const pushQueue = new Set(); let pushT;
function persist(key) {
  touch(key);
  if (C.currentUser()) {
    pushQueue.add(key);
    clearTimeout(pushT);
    pushT = setTimeout(flushPush, 1200);
  }
}
async function flushPush() {
  const keys = [...pushQueue]; pushQueue.clear();
  for (const k of keys) {
    try { await C.pushDay(k, state.days[k], S.shareScores ? publicScore(k) : null); }
    catch (e) { console.warn('sync', e); }
  }
  renderSync();
}
function publicScore(k) {
  const sc = scoreOf(k), t = sc.totals;
  return { body: sc.body, brain: sc.brain, mind: sc.mind, overall: sc.overall, activeMin: t.activeMin, deepMin: t.deepMin, readingMin: t.readingMin, sleep: t.sleep, protein: t.protein, logged: hasLog(k) };
}
let settingsT;
function saveSettings() {
  save();
  clearTimeout(settingsT);
  settingsT = setTimeout(() => { if (C.currentUser()) C.pushSettings({ ...S, reminderIds: S.reminderIds }).catch(() => {}); }, 800);
}

// ---------- Shell ----------
function renderNav() {
  const btn = ([id, label]) => `<button data-view="${id}" ${ui.view === id ? 'aria-current="page"' : ''}>${I[id]}<span>${label}</span></button>`;
  $('#nav').innerHTML = NAV.map(btn).join('');
  $('#tabbar').innerHTML = NAV.map(btn).join('');
  $$('[data-view]').forEach(b => b.onclick = () => go(b.dataset.view));
}
function renderSync() {
  const u = C.currentUser();
  const ai = G.provider(S) ? `<span><span class="dot on"></span>AI: ${G.providerName(S)}</span>` : `<span><span class="dot"></span>Gemini not set</span>`;
  const sync = u ? `<span><span class="dot on"></span>Synced as ${esc(u.displayName?.split(' ')[0] || 'you')}</span>` : `<span><span class="dot"></span>Local only</span>`;
  const cal = C.calendarToken() ? `<span><span class="dot on"></span>Calendar linked</span>` : '';
  $('#syncState').innerHTML = ai + sync + cal;
  const a = $('#accountBtn');
  if (u?.photoURL) { a.style.backgroundImage = `url("${u.photoURL}")`; a.textContent = ''; }
  else { a.style.backgroundImage = ''; a.textContent = (S.name || 'V')[0].toUpperCase(); }
}
function renderTop() {
  $('#viewTitle').textContent = NAV.find(n => n[0] === ui.view)[1];
  const dated = ['today', 'report'].includes(ui.view);
  $('#dateNav').hidden = !dated;
  $('#dateLabel').textContent = fmtDay(ui.date);
  $('#nextDay').disabled = ui.date >= today();
  $('#nextDay').style.opacity = ui.date >= today() ? .35 : 1;
  const th = S.theme || 'system';
  $('#themeBtn').innerHTML = th === 'dark' ? I.moon : th === 'light' ? I.sun : I.auto;
  $('#themeBtn').setAttribute('aria-label', `Theme: ${th}. Switch theme`);
}
function go(view) {
  ui.view = view;
  const hv = view === 'settings' ? 'prefs' : view;
  if (location.hash.slice(1) !== hv) history.replaceState(null, '', '#' + hv);
  render();
  window.scrollTo({ top: 0 });
}
function render() {
  renderNav(); renderTop(); renderSync();
  const v = $('#view');
  ({ today: viewToday, report: viewReport, trends: viewTrends, plan: viewPlan, friends: viewFriends, settings: viewSettings })[ui.view](v);
}

$('#prevDay').onclick = () => { ui.date = shiftKey(ui.date, -1); render(); };
$('#nextDay').onclick = () => { if (ui.date < today()) { ui.date = shiftKey(ui.date, 1); render(); } };
$('#dateLabel').onclick = () => { ui.date = today(); render(); };
$('#themeBtn').onclick = () => {
  const order = ['system', 'light', 'dark'];
  S.theme = order[(order.indexOf(S.theme || 'system') + 1) % 3];
  applyTheme(); saveSettings(); render();
};
$('#accountBtn').onclick = () => {
  const u = C.currentUser();
  if (!u) return go('settings');
  sheet(`<h3>${esc(u.displayName || 'Signed in')}</h3><p class="sub">${esc(u.email || '')}</p>
    <div class="row" style="margin-top:14px"><button class="btn" id="shSettings">Settings</button><span class="spacer"></span><button class="btn" id="shOut">Sign out</button></div>`);
  $('#shSettings').onclick = () => { closeSheet(); go('settings'); };
  $('#shOut').onclick = async () => { await C.signOutCloud(); closeSheet(); toast('Signed out. Your data stays on this device.'); render(); };
};
function applyTheme() {
  const t = S.theme || 'system';
  if (t === 'system') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', t);
}
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if ((S.theme || 'system') === 'system') render(); });

// ============================================================
// TODAY
// ============================================================
function deltaHTML(now, prev) {
  if (prev == null || !hasLogPrev) return '';
  const d = now - prev;
  const cls = d > 0 ? 'up' : d < 0 ? 'down' : 'flat';
  return `<span class="delta ${cls}">${d > 0 ? '▲' : d < 0 ? '▼' : '•'} ${Math.abs(d)}</span>`;
}
let hasLogPrev = false;

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

const COMP_LABEL = { exercise: 'Exercise', protein: 'Protein', nutrition: 'Diet quality', sleep: 'Sleep', water: 'Water', deepwork: 'Deep work', reading: 'Reading', skills: 'Skills practice', moodEnergy: 'Mood and energy', meditation: 'Meditation', sunlight: 'Sunlight', social: 'Time with people', screen: 'Screen limit' };
const GAUGE_HINT = { body: 'Exercise, food, sleep and water', brain: 'Deep work, reading and skills', mind: 'Mood, meditation, sunlight and screens' };
let firstPaint = true;
function verdict(n, count) {
  if (!count && !n) return 'Nothing logged yet';
  if (n >= 85) return 'Excellent day';
  if (n >= 70) return 'Strong day';
  if (n >= 55) return 'Solid day';
  if (n >= 40) return 'Getting there';
  return 'Light day so far';
}
function ribbon(day, key) {
  const H = 1440, pct = m => `${(Math.max(0, Math.min(H, m)) / H * 100).toFixed(2)}%`;
  const start = new Date(key + 'T00:00:00').getTime();
  const parts = [];
  if (day.quick.sleep) {
    const [h, m] = (S.morningTime || '07:30').split(':').map(Number);
    const wake = h * 60 + m, from = wake - day.quick.sleep * 60;
    parts.push(`<div class="blk sleep" style="left:${pct(from)};width:${pct(wake - Math.max(0, from))}" title="Sleep ${day.quick.sleep} h"></div>`);
  }
  for (const e of day.entries) {
    let cursor = (e.ts - start) / 60000;
    for (const a of [...(e.acts || [])].reverse()) {
      if (a.type === 'food') { parts.push(`<div class="meal" style="left:${pct(cursor)}" title="${esc(a.label)} · ${a.protein || 0} g protein"></div>`); continue; }
      const mins = Number(a.minutes) || 0; if (!mins || a.type === 'screen') continue;
      const p = TYPE_PILLAR[a.type] || 'mind';
      parts.push(`<div class="blk" style="--c:var(--${p === 'neutral' ? 'faint' : p});left:${pct(cursor - mins)};width:${pct(mins)}" title="${esc(a.label)}"></div>`);
      cursor -= mins;
    }
  }
  const nowM = key === today() ? (Date.now() - start) / 60000 : null;
  const hours = [0, 6, 12, 18, 24];
  return `<div class="ribbon-h"><b>Your day</b><span class="ribbon-legend"><span style="--c:var(--sleep)">Sleep</span><span style="--c:var(--body)">Body</span><span style="--c:var(--brain)">Brain</span><span style="--c:var(--mind)">Mind</span></span></div>
    <div class="ribbon">${hours.slice(1, -1).map(h => `<span class="hr" style="left:${pct(h * 60)}"></span>`).join('')}${parts.join('')}${nowM != null ? `<span class="now" style="left:${pct(nowM)}" title="Now"></span>` : ''}</div>
    <div class="ribbon-axis">${hours.map(h => `<span style="left:${pct(h * 60)};${h === 0 ? 'transform:none' : h === 24 ? 'transform:translateX(-100%)' : ''}">${h === 0 || h === 24 ? '12 am' : h === 12 ? '12 pm' : h < 12 ? h + ' am' : (h - 12) + ' pm'}</span>`).join('')}</div>`;
}

function viewToday(v) {
  const key = ui.date, day = getDay(key), sc = scoreOf(key), t = sc.totals;
  const prevKey = shiftKey(key, -1); hasLogPrev = hasLog(prevKey);
  const prev = hasLogPrev ? scoreOf(prevKey) : null;
  const week = lastKeys(7, key);
  const logStreak = streak(state.days, d => (d.entries || []).length > 0, today());
  const isToday = key === today();
  const brainSkills = ['english', 'chess', 'upsc'].filter(k => S.skills.includes(k));

  const targets = [
    ['Exercise', t.activeMin, S.exerciseTarget, 'min', 'body'],
    ['Sleep', t.sleep ?? 0, S.sleepTarget, 'h', 'body'],
    ['Water', t.water, S.waterTarget, 'L', 'body'],
    ['Deep work', t.deepMin, S.deepWorkTarget, 'min', 'brain'],
    ['Reading', t.readingMin, S.readingTarget, 'min', 'brain'],
    ['Skills', brainSkills.filter(k => t.skills[k] > 0).length, brainSkills.length, '', 'brain'],
    ['Meditation', t.skills.meditation, S.meditationTarget, 'min', 'mind'],
    ['Sunlight', t.sunMin, 15, 'min', 'mind']
  ];

  v.innerHTML = `
  <section class="day ${firstPaint ? 'intro' : ''}">
    <div class="day-score">
      <span class="day-label">${isToday ? `${greeting()}, ${esc(S.name)}` : fmtDay(key)}</span>
      <div class="score-line"><span class="score-big">${sc.overall}</span><span class="score-of">/100</span></div>
      <p class="verdict">${verdict(sc.overall, t.count)} ${prev ? deltaHTML(sc.overall, prev.overall) : ''}</p>
      <div class="row">
        <span class="chip">🔥 ${logStreak} day streak</span>
        <button class="btn sm primary" id="openReport">${I.report} Report card</button>
      </div>
    </div>
    <div class="gauges">
      ${PILLARS.map(([p, name]) => {
        const comps = Object.entries(sc.parts[p]).filter(([k]) => !(p === 'brain' && k === 'sleep'));
        const low = comps.sort((a, b) => a[1] - b[1])[0];
        return `<div class="gauge" style="--c:var(--${p})">
          <span class="g-name">${name}</span>
          <div class="g-track" role="img" aria-label="${name} ${sc[p]} out of 100"><i style="width:${sc[p]}%"></i></div>
          <span class="g-val">${prev ? deltaHTML(sc[p], prev[p]) : ''}${sc[p]}</span>
          <span class="g-sub">${t.count || hasLog(key) ? `Holding it back: ${COMP_LABEL[low[0]].toLowerCase()} (${Math.round(low[1] * 100)}%)` : GAUGE_HINT[p]}</span>
        </div>`;
      }).join('')}
    </div>
    <div class="week">
      <div class="week-h"><b>Last 7 days</b><span class="ribbon-legend">${PILLARS.map(([p, n]) => `<span style="--c:var(--${p})">${n}</span>`).join('')}</span></div>
      <div class="chart-box week-box"><canvas id="chWeek" aria-label="Body, Brain and Mind scores for the last 7 days" role="img"></canvas></div>
    </div>
    <div class="ribbon-wrap">${ribbon(day, key)}</div>
  </section>

  <div class="grid">
    <div class="c-7 col">
    <section class="card composer">
      <div class="card-h"><h2>What did you do?</h2><span class="sub">${G.provider(S) ? `${G.providerName(S)} reads your words` : 'Write it the way you’d say it'}</span></div>
      <textarea class="input" id="logText" placeholder="10 min sun walk, 2 eggs + dal, read 20 pages, 90 min deep work on lab report"></textarea>
      <div class="bar">
        <button class="btn mic" id="micBtn" aria-label="Speak your log">${I.mic}<span>Speak</span></button>
        <span class="sub" id="logHint"></span>
        <span class="spacer"></span>
        <button class="btn primary" id="logBtn">${I.send} Log it</button>
      </div>
      <div class="examples">
        ${['20 min sun walk', '3 eggs + 2 roti + dal', 'bowl of curd', 'read 25 pages', '15 min chess puzzles', '10 min meditation', '20 min English speaking practice', 'UPSC 30 min editorial', '2 glasses water'].map(x => `<button class="chip ex">${x}</button>`).join('')}
      </div>
    </section>

    <section class="card checkin">
      <div class="card-h"><h2>Check-in</h2><span class="sub">How you slept and how you feel</span></div>
      <div class="quick">
        ${stepper('sleep', 'Sleep', day.quick.sleep, 'h', 0.5)}
        ${stepper('water', 'Water', t.water, 'L', 0.25)}
        ${scale('mood', 'Mood', day.quick.mood)}
        ${scale('energy', 'Energy', day.quick.energy)}
        ${stepper('screen', 'Screen time', day.quick.screen, 'h', 0.5)}
      </div>
    </section>

    </div>

    <section class="card c-5" id="nutritionCard">${nutritionCard(t)}</section>

    <section class="card c-7">
      <div class="card-h"><h2>${isToday ? 'Today’s log' : 'Log'}</h2><span class="sub">${day.entries.length} entr${day.entries.length === 1 ? 'y' : 'ies'}</span></div>
      <div class="timeline">
        ${day.entries.length ? [...day.entries].reverse().map(e => `
          <div class="entry">
            <time>${timeOf(e.ts)}</time>
            <div><div class="raw">${esc(e.text)}</div><div class="acts">${(e.acts || []).map((a, i) => actChip(a, e.id, i)).join('')}</div>${(e.acts || []).map((a, i) => foodBreakdown(a, e.id, i)).join('')}</div>
            <button class="icon-btn del" data-id="${e.id}" aria-label="Delete entry">${I.x}</button>
          </div>`).join('') : `<div class="empty">${I.log}<b>No entries yet</b><span>Write one line about anything you did. Jarvis turns it into numbers.</span></div>`}
      </div>
    </section>

    <div class="c-5 col">
      <section class="card">
        <div class="card-h"><h2>Targets</h2><button class="btn sm ghost" id="editTargets">Edit</button></div>
        <div class="targets two">
          ${targets.map(([n, val, tar, u, p]) => `
            <div class="target">
              <div class="t-top"><b>${n}</b><span>${fmtN(val)}/${fmtN(tar)}${u ? ' ' + u : ''}</span></div>
              <div class="meter"><i style="width:${Math.min(100, tar ? val / tar * 100 : 0)}%;background:var(--${p})"></i></div>
            </div>`).join('')}
        </div>
      </section>
      <section class="card">
        <div class="card-h"><h2>Skills & habits</h2><span class="sub">Tap when you’ve done 15 min</span></div>
        <div class="skills">
          ${S.skills.map(k => {
            const done = t.skills[k] > 0;
            const st = streak(state.days, d => score(d, S).totals.skills[k] > 0, today());
            return `<button class="skill ${done ? 'done' : ''}" data-skill="${k}" aria-pressed="${done}"><span class="sk-name">${done ? '✓ ' : ''}${skillName(k)}</span><span class="sk-meta">${done ? `${t.skills[k]} min today` : 'Not yet'} · 🔥 ${st}</span></button>`;
          }).join('')}
        </div>
      </section>
    </div>
  </div>`;

  $('#openReport').onclick = () => go('report');
  $('#editTargets').onclick = () => { go('settings'); setTimeout(() => $('#sec-profile')?.scrollIntoView({ behavior: 'smooth' }), 50); };
  $('#logBtn').onclick = () => submitLog();
  $('#logText').addEventListener('keydown', e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submitLog(); });
  $$('.ex').forEach(b => b.onclick = () => { const ta = $('#logText'); ta.value = (ta.value ? ta.value.replace(/[,\s]*$/, ', ') : '') + b.textContent; ta.focus(); });
  $$('.editfood').forEach(b => b.onclick = () => editFood(key, b.dataset.e, +b.dataset.i));
  $$('.del').forEach(b => b.onclick = () => {
    const d = getDay(key); d.entries = d.entries.filter(e => e.id !== b.dataset.id); persist(key); render(); toast('Entry deleted');
  });
  $$('.skill').forEach(b => b.onclick = () => {
    const k = b.dataset.skill;
    if (t.skills[k] > 0) {
      const d = getDay(key);
      d.entries = d.entries.filter(e => !(e.quick && e.acts?.[0]?.type === k));
    } else {
      getDay(key).entries.push({ id: uid(), ts: Date.now(), text: `${skillName(k)}, 15 min`, quick: true, acts: [{ type: k, label: skillName(k), minutes: 15 }] });
    }
    persist(key); render();
  });
  $$('[data-step]').forEach(b => b.onclick = () => {
    const [f, dir] = b.dataset.step.split(':'); const step = +b.dataset.inc; const q = getDay(key).quick;
    q[f] = Math.max(0, +(((q[f] ?? (f === 'sleep' ? S.sleepTarget - 0.5 : 0)) + (dir === '+' ? step : -step))).toFixed(2));
    persist(key); render();
  });
  $$('[data-scale]').forEach(b => b.onclick = () => {
    const [f, n] = b.dataset.scale.split(':'); const q = getDay(key).quick;
    q[f] = q[f] === +n ? null : +n; persist(key); render();
  });
  const drawWeek = () => {
    if (!window.Chart) return setTimeout(drawWeek, 120);
    const el = $('#chWeek'); if (!el) return;
    lines(el, week.map(weekday), PILLARS.map(([p, nm]) => ({ name: nm, data: week.map(k => hasLog(k) ? scoreOf(k)[p] : null), color: color(p), width: 2 })), { max: 100 });
  };
  drawWeek();
  setupMic();
  firstPaint = false;
}

// ---------- Nutrition ----------
const MACROS = [['p', 'Protein', 4], ['c', 'Carbs', 4], ['f', 'Fat', 9]];
const MICROS = ['fib', 'fe', 'ca', 'vc', 'b12'];
const nutr = k => NUTRIENTS.find(x => x.k === k);
const fmtNut = (k, v) => (k === 'kcal' || k === 'ca' || v >= 100 ? Math.round(v) : v >= 10 ? Math.round(v) : (Math.round(v * 10) / 10));
function nutritionCard(t, { title = 'Nutrition' } = {}) {
  const T = t.targets, n = t.n;
  const R = 54, SW = 14, C = 2 * Math.PI * R;
  const macroK = MACROS.map(([k, , kc]) => n[k] * kc);
  const denom = Math.max(T.kcal, macroK.reduce((a, b) => a + b, 0), 1);
  let off = 0;
  const segs = MACROS.map(([k], i) => {
    const len = macroK[i] / denom * C;
    const seg = len > 0.5 ? `<circle cx="64" cy="64" r="${R}" fill="none" stroke="var(--${k === 'p' ? 'protein' : k === 'c' ? 'carbs' : 'fat'})" stroke-width="${SW}" stroke-dasharray="${Math.max(0, len - 2).toFixed(1)} ${C.toFixed(1)}" stroke-dashoffset="${(-off).toFixed(1)}" transform="rotate(-90 64 64)"/>` : '';
    off += len; return seg;
  }).join('');
  const kcalPct = Math.round(n.kcal / T.kcal * 100);
  return `
    <div class="card-h"><h2>${title}</h2><span class="sub">${t.meals ? `${t.meals} meal${t.meals === 1 ? '' : 's'} logged` : 'No meals logged yet'}</span></div>
    <div class="nut-top">
      <svg class="donut" viewBox="0 0 128 128" role="img" aria-label="${n.kcal} of ${T.kcal} kilocalories">
        <circle cx="64" cy="64" r="${R}" fill="none" stroke="var(--track)" stroke-width="${SW}"/>${segs}
        <text x="64" y="62" text-anchor="middle" class="donut-v">${Math.round(n.kcal)}</text>
        <text x="64" y="80" text-anchor="middle" class="donut-l">of ${T.kcal} kcal</text>
      </svg>
      <div class="macros">
        ${MACROS.map(([k, label]) => `<div class="macro" style="--c:var(--${k === 'p' ? 'protein' : k === 'c' ? 'carbs' : 'fat'})">
          <div class="t-top"><b>${label}</b><span>${fmtNut(k, n[k])}/${T[k]} g</span></div>
          <div class="meter"><i style="width:${Math.min(100, n[k] / T[k] * 100)}%"></i></div></div>`).join('')}
        <span class="sub">${t.meals ? `${kcalPct}% of your calories so far` : 'Log a meal to fill this in'}</span>
      </div>
    </div>
    <div class="micros">
      ${MICROS.map(k => { const pct = Math.round(n[k] / T[k] * 100); const d = nutr(k); return `<div class="micro ${pct >= 100 ? 'met' : ''}">
        <div class="t-top"><b>${d.label}</b><span>${fmtNut(k, n[k])}/${T[k]} ${d.unit}</span></div>
        <div class="meter"><i style="width:${Math.min(100, pct)}%"></i></div></div>`; }).join('')}
    </div>
    <p class="nut-note">Estimates from IFCT 2017 and USDA for home-style portions. Targets: ICMR-NIN 2020. Tap a food entry to adjust portions.</p>`;
}

const fmtN = n => (n == null ? '—' : Number.isInteger(n) ? n : (+n).toFixed(1));
function stepper(f, label, val, unit, step) {
  return `<div class="q"><div class="q-l"><span class="k">${label}</span><span class="v">${val == null ? '—' : fmtN(val)}<small> ${unit}</small></span></div>
    <div class="stepper"><button data-step="${f}:-" data-inc="${step}" aria-label="Decrease ${label}">−</button><button data-step="${f}:+" data-inc="${step}" aria-label="Increase ${label}">+</button></div></div>`;
}
function scale(f, label, val) {
  const words = ['', 'Low', 'Meh', 'OK', 'Good', 'Great'];
  return `<div class="q"><div class="q-l"><span class="k">${label}</span><span class="v">${val ?? '—'}<small> /5${val ? ' ' + words[val] : ''}</small></span></div>
    <div class="scale">${[1, 2, 3, 4, 5].map(n => `<button data-scale="${f}:${n}" aria-pressed="${val === n}" aria-label="${label} ${n}">${n}</button>`).join('')}</div></div>`;
}
const TYPE_PILLAR = { walk: 'body', sunwalk: 'mind', run: 'body', gym: 'body', yoga: 'body', cycle: 'body', swim: 'body', sport: 'body', exercise: 'body', food: 'body', water: 'body', sleep: 'body', reading: 'brain', study: 'brain', deepwork: 'brain', english: 'brain', chess: 'brain', upsc: 'brain', meditation: 'mind', movie: 'mind', social: 'mind', screen: 'mind', other: 'neutral' };
const TYPE_NAME = { sunwalk: 'Sun walk', deepwork: 'Deep work', english: 'English', upsc: 'UPSC', food: 'Food' };
function actChip(a, entryId, idx) {
  const p = TYPE_PILLAR[a.type] || 'neutral';
  const name = TYPE_NAME[a.type] || (a.type[0].toUpperCase() + a.type.slice(1));
  const fn = a.type === 'food' ? actN(a) : null;
  const bits = [a.minutes ? `${a.minutes} min` : '', fn ? `${Math.round(fn.kcal)} kcal, ${fmtNut('p', fn.p)} g protein` : '', a.pages ? `${a.pages} pages` : '', a.litres ? `${a.litres} L` : '', a.hours ? `${a.hours} h` : ''].filter(Boolean).join(', ');
  if (a.type === 'food' && entryId) return `<button class="pill ${p} editfood" data-e="${entryId}" data-i="${idx}" title="Tap to check or correct">${name} <span style="font-weight:500">${bits}${a.edited ? ', edited' : ''}</span> ✎</button>`;
  return `<span class="pill ${p}">${name}${bits ? ` <span style="font-weight:500">${bits}</span>` : ''}</span>`;
}
function actN(a) { return a.items?.length ? a.items.reduce((sum, it) => addN(sum, itemNutrients(it)), zeroN()) : (a.n || { ...zeroN(), p: Number(a.protein) || 0 }); }
function foodBreakdown(a, entryId, idx) {
  if (a.type !== 'food' || !a.items?.length) return '';
  return `<div class="breakdown">${a.items.map(it => {
    if (it.known === false) return `<button class="bd warn editfood" data-e="${entryId}" data-i="${idx}">⚠ ${esc(it.name)}: not counted, tap to add</button>`;
    const n = itemNutrients(it);
    return `<button class="bd editfood" data-e="${entryId}" data-i="${idx}" title="Tap to adjust">${esc(it.name)} <span class="sub">${esc(it.desc || '')}</span> <span class="bd-n"><b class="num">${Math.round(n.kcal)}</b> <span class="sub">kcal</span> <b class="num">${fmtNut('p', n.p)} g</b> <span class="sub">protein</span></span>${it.estimated ? ' <span class="sub">(AI estimate)</span>' : ''}</button>`;
  }).join('')}</div>`;
}

// Edit a meal: change the matched food, the number of servings, or enter label values for anything not in the table.
function editFood(key, entryId, idx) {
  const entry = getDay(key).entries.find(e => e.id === entryId); if (!entry) return;
  const a = entry.acts[idx];
  let rows = (a.items?.length ? a.items : [{ name: a.label, known: false, n: { ...zeroN(), p: Number(a.protein) || 0 } }]).map(it => {
    const f = it.known !== false && !it.estimated ? findFood(it.name) : null;
    const n = itemNutrients(it);
    return { label: it.name, food: f ? f.name : '', qty: f ? (it.qty ?? (f.p ? n.p / f.p : 1)) : 1, manual: f ? null : { kcal: n.kcal || '', p: n.p || '', c: n.c || '', f: n.f || '' } };
  });
  const options = sel => `<option value="" ${!sel ? 'selected' : ''}>Not in list: enter numbers</option>` + FOODS.map(f => `<option value="${esc(f.name)}" ${f.name === sel ? 'selected' : ''}>${esc(f.name)} (${esc(f.unit)})</option>`).join('');
  const rowN = r => {
    if (r.food) return scaleN(findFood(r.food), Math.max(0, Number(r.qty) || 0));
    const m = r.manual || {}; return { ...zeroN(), kcal: +m.kcal || 0, p: +m.p || 0, c: +m.c || 0, f: +m.f || 0 };
  };
  const draw = () => {
    $('#fiRows').innerHTML = rows.map((r, j) => `
      <div class="fi" data-j="${j}">
        <div class="fi-top"><select class="select fi-food" data-j="${j}" aria-label="Food">${options(r.food)}</select><button class="icon-btn fi-del" data-j="${j}" aria-label="Remove food">${I.x}</button></div>
        ${r.food ? `<div class="fi-qty"><input class="input mono fi-q" data-j="${j}" type="number" min="0" step="0.25" value="${fmtQty(Number(r.qty) || 0)}" aria-label="Servings"><span class="sub">× ${esc(findFood(r.food).unit)}</span><span class="spacer"></span><span class="sub fi-out" data-j="${j}"></span></div>`
          : `${r.label ? `<span class="sub">${esc(r.label)}: not in the list. Enter values from the pack label, or pick a close food above.</span>` : ''}<div class="fi-man">${[['kcal', 'kcal'], ['p', 'Protein g'], ['c', 'Carbs g'], ['f', 'Fat g']].map(([k, l]) => `<label class="field">${l}<input class="input mono fi-m" data-j="${j}" data-k="${k}" type="number" min="0" step="0.5" value="${r.manual?.[k] ?? ''}"></label>`).join('')}</div>`}
      </div>`).join('');
    $$('.fi-food').forEach(el => el.onchange = () => { const r = rows[+el.dataset.j]; r.food = el.value; r.qty = 1; if (!r.food) r.manual = r.manual || {}; draw(); });
    $$('.fi-q').forEach(el => el.oninput = () => { rows[+el.dataset.j].qty = el.value; totals(); });
    $$('.fi-m').forEach(el => el.oninput = () => { const r = rows[+el.dataset.j]; r.manual = { ...(r.manual || {}), [el.dataset.k]: el.value }; totals(); });
    $$('.fi-del').forEach(el => el.onclick = () => { rows.splice(+el.dataset.j, 1); draw(); });
    totals();
  };
  const totals = () => {
    let sum = zeroN();
    rows.forEach((r, j) => { const n = rowN(r); sum = addN(sum, n); const o = $(`.fi-out[data-j="${j}"]`); if (o) o.textContent = `${Math.round(n.kcal)} kcal, ${fmtNut('p', n.p)} g protein`; });
    $('#fiTotal').innerHTML = NUTRIENTS.map(d => `<div><span class="sub">${d.label}</span><b class="num">${fmtNut(d.k, sum[d.k])} <small>${d.unit}</small></b></div>`).join('');
  };
  sheet(`<h3>Adjust this meal</h3><p class="sub" style="margin:0 0 14px">“${esc(entry.text)}”. Fix the food if it was matched wrong, change servings, or type values from a pack label.</p>
    <div class="stack" id="fiRows"></div>
    <button class="btn sm" id="fiAdd" style="margin-top:10px">+ Add a food</button>
    <div class="fi-total" id="fiTotal"></div>
    <div class="row" style="margin-top:14px"><span class="spacer"></span><button class="btn ghost" id="fiCancel">Cancel</button><button class="btn primary" id="fiSave">Save</button></div>`);
  draw();
  $('#fiAdd').onclick = () => { rows.push({ label: '', food: 'roti', qty: 1, manual: null }); draw(); };
  $('#fiCancel').onclick = closeSheet;
  $('#fiSave').onclick = () => {
    a.items = rows.filter(r => r.food ? Number(r.qty) > 0 : Object.values(r.manual || {}).some(v => +v > 0)).map(r => {
      if (r.food) return makeItem(findFood(r.food), Number(r.qty));
      const n = rowN(r); return { name: r.label || 'food', desc: 'entered by you', qty: 1, n, protein: round1(n.p), known: true, manualEntry: true };
    });
    a.n = a.items.reduce((sum, it) => addN(sum, it.n), zeroN());
    a.protein = round1(a.n.p);
    a.edited = true; persist(key); closeSheet(); render(); toast(`Saved: ${Math.round(a.n.kcal)} kcal, ${fmtNut('p', a.n.p)} g protein`);
  };
}

async function submitLog() {
  const ta = $('#logText'); const text = ta.value.trim();
  if (!text) { ta.focus(); return; }
  const btn = $('#logBtn'); btn.disabled = true; btn.innerHTML = `<span class="spin"></span> Reading`;
  let acts, via = 'local';
  if (G.provider(S)) {
    try { acts = await G.parseWithGemini(S, text); via = G.provider(S); }
    catch (e) { console.warn(e); toast(`${G.providerName(S)} didn’t answer (${e.message.slice(0, 60)}). Used offline parser.`, 4000); }
  }
  if (!acts || !acts.length) acts = parseLocal(text);
  acts = acts.map(a => Object.fromEntries(Object.entries(a).filter(([, v]) => v != null && v !== '')));
  const key = ui.date;
  const ts = key === today() ? Date.now() : new Date(key + 'T20:00:00').getTime();
  getDay(key).entries.push({ id: uid(), ts, text, acts, via });
  persist(key);
  ta.value = '';
  render();
  toast(`Logged ${acts.length} activit${acts.length === 1 ? 'y' : 'ies'}`);
}

function setupMic() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const b = $('#micBtn');
  if (!SR) { b.onclick = () => toast('Voice isn’t supported in this browser. Use your keyboard’s mic key instead.', 4000); return; }
  let rec;
  b.onclick = () => {
    if (ui.recognizing) { rec?.stop(); return; }
    rec = new SR(); rec.lang = 'en-IN'; rec.interimResults = true; rec.continuous = true;
    const ta = $('#logText'); const base = ta.value ? ta.value.replace(/\s*$/, ' ') : '';
    rec.onresult = e => { ta.value = base + [...e.results].map(r => r[0].transcript).join(' '); };
    rec.onend = () => { ui.recognizing = false; b.classList.remove('rec'); b.querySelector('span').textContent = 'Speak'; };
    rec.onerror = e => { if (e.error === 'not-allowed') toast('Allow microphone access in your browser settings to speak logs.', 4000); };
    rec.start(); ui.recognizing = true; b.classList.add('rec'); b.querySelector('span').textContent = 'Stop';
  };
}

// ============================================================
// REPORT
// ============================================================
function localCoach(sc) {
  const comps = [
    ['exercise', sc.parts.body.exercise, 'movement'], ['protein', sc.parts.body.protein, 'protein'], ['sleep', sc.parts.body.sleep, 'sleep'],
    ['deep work', sc.parts.brain.deepwork, 'deep work'], ['reading', sc.parts.brain.reading, 'reading'], ['meditation', sc.parts.mind.meditation, 'meditation']
  ].sort((a, b) => b[1] - a[1]);
  const best = PILLARS.map(([p, n]) => [n, sc[p]]).sort((a, b) => b[1] - a[1]);
  const headline = sc.overall >= 80 ? 'Strong day across the board' : sc.overall >= 60 ? `Solid day, led by ${best[0][0]}` : sc.overall >= 40 ? `Some wins; ${best[2][0]} needs attention` : 'A light day. Tomorrow is a reset.';
  const note = `${best[0][0]} led today at ${best[0][1]}. Your strongest habit was ${comps[0][2]}; the biggest gap was ${comps.at(-1)[2]}. ` +
    (sc.totals.sleep == null ? 'Log your sleep tomorrow morning so the Body score reflects it. ' : sc.totals.sleep < 7 ? `Sleep at ${sc.totals.sleep} h is the cheapest thing to fix: it lifts Body, Brain and Mind together. ` : '') +
    (G.provider(S) ? '' : 'Add a Gemini key in Settings for a personalised coach note.');
  return { headline, coach_note: note };
}

async function nextDaySlots(key) {
  const tok = C.calendarToken(); if (!tok) return [];
  const nk = shiftKey(key, 1);
  try { const r = await Cal.freeSlots(tok, nk, S.dayStart, S.dayEnd, 20); return r.slots; } catch { return []; }
}

async function generateReport(key, { silent = false } = {}) {
  const day = getDay(key), sc = scoreOf(key);
  ui.busy.report = true; if (!silent) render();
  const slots = await nextDaySlots(key);
  const local = localSuggestions(sc, S, slots);
  let rep = { ...localCoach(sc), achievements: null, suggestions: local, at: Date.now(), via: 'local', slots };
  if (G.provider(S)) {
    try {
      const week = lastKeys(7, key).filter(hasLog).map(k => ({ date: k, ...pick(scoreOf(k), ['body', 'brain', 'mind', 'overall']) }));
      const payload = {
        date: key, scores: pick(sc, ['body', 'brain', 'mind', 'overall']), totals: sc.totals, component_scores: sc.parts,
        targets: pick(S, ['sleepTarget', 'waterTarget', 'exerciseTarget', 'deepWorkTarget', 'readingTarget', 'meditationTarget', 'screenLimit']),
        protein_target_g: sc.totals.proteinTarget, weight_kg: S.weightKg, skills_tracked: S.skills.map(skillName),
        log: day.entries.map(e => `${timeOf(e.ts)} ${e.text}`), last_7_days: week,
        free_slots_tomorrow: slots.map((s, i) => ({ i, label: s.label, minutes: s.minutes })),
        rule_based_ideas: local.map(x => x.title)
      };
      const g = await G.coachReport(S, payload);
      rep = {
        headline: g.headline || rep.headline, coach_note: g.coach_note || rep.coach_note,
        achievements: Array.isArray(g.achievements) ? g.achievements : null,
        suggestions: (g.suggestions || []).slice(0, 3).map(s => ({ title: s.title, why: s.why, mins: s.minutes || 0, slotIndex: Number.isInteger(s.slot_index) && slots[s.slot_index] ? s.slot_index : null, when: Number.isInteger(s.slot_index) && slots[s.slot_index] ? slots[s.slot_index].label : null })),
        at: Date.now(), via: G.provider(S), slots
      };
      if (!rep.suggestions.length) rep.suggestions = local;
    } catch (e) { console.warn(e); toast(`${G.providerName(S)} error: ${e.message.slice(0, 80)}. Showing the built-in report.`, 4500); }
  }
  day.report = rep; ui.busy.report = false;
  persist(key); render();
}
const pick = (o, ks) => Object.fromEntries(ks.map(k => [k, o[k]]));

function viewReport(v) {
  const key = ui.date, day = getDay(key), sc = scoreOf(key);
  const prevKey = shiftKey(key, -1); hasLogPrev = hasLog(prevKey);
  const prev = hasLogPrev ? scoreOf(prevKey) : null;
  if (!day.entries.length && !hasLog(key)) {
    v.innerHTML = `<section class="card"><div class="empty">${I.report}<b>No report for ${fmtDay(key)} yet</b><span>Log at least one activity and your report card appears here.</span><button class="btn primary" id="toToday" style="margin-top:8px">Go to Today</button></div></section>`;
    $('#toToday').onclick = () => go('today'); return;
  }
  let rep = day.report;
  const stale = !rep || rep.at < (day.updatedAt || 0) - 500;
  if (stale) {
    // Show the instant local version now; fetch the Gemini one in the background.
    const local = { ...localCoach(sc), suggestions: localSuggestions(sc, S, rep?.slots || []), achievements: null, via: 'local', at: 0 };
    rep = rep && rep.via !== 'local' ? { ...rep, stale: true } : local;
    if (G.provider(S) && !ui.busy.report && !ui.busy.failed?.[key]) setTimeout(() => generateReport(key, { silent: true }), 0);
  }
  const ach = rep.achievements?.length ? rep.achievements.map(a => ({ label: a.activity, pillar: a.pillar, effect: a.effect })) : achievements(day);
  const calOK = !!C.calendarToken();
  const compLabels = { exercise: 'Exercise', protein: 'Protein', nutrition: 'Diet quality', sleep: 'Sleep', water: 'Water', deepwork: 'Deep work', reading: 'Reading', skills: 'Skills', moodEnergy: 'Mood/energy', meditation: 'Meditation', sunlight: 'Sunlight', social: 'Social', screen: 'Screen limit' };

  v.innerHTML = `
  <section class="card">
    <div class="report-head">
      <div class="report-grade">${grade(sc.overall)}</div>
      <div class="stack" style="gap:6px">
        <span class="eyebrow">${fmtDay(key)}, ${sc.overall} out of 100</span>
        <h2>${esc(rep.headline)}</h2>
        <p class="coach">${ui.busy.report && !rep.coach_note ? '<span class="skeleton" style="display:block;width:80%"></span>' : esc(rep.coach_note)}</p>
        <div class="row" style="margin-top:6px">
          <span class="pill neutral">${rep.via === 'gemini' ? 'Coach: Gemini' : rep.via === 'claude' ? 'Coach: Claude' : 'Coach: built-in'}${rep.stale ? ' · updating' : ''}</span>
          ${ui.busy.report ? '<span class="sub"><span class="spin"></span> Writing your report…</span>' : ''}
          <span class="spacer"></span>
          <button class="btn sm" id="regen" ${ui.busy.report ? 'disabled' : ''}>${I.spark} ${G.provider(S) ? 'Regenerate' : 'Refresh'}</button>
        </div>
      </div>
    </div>
  </section>

  <div class="grid">
    ${PILLARS.map(([p, name]) => `
      <section class="card pcard c-4" style="--pc:var(--${p})">
        <div class="top-line"><span class="eyebrow">${name}</span><span class="letter">${grade(sc[p])}</span></div>
        <div class="row" style="align-items:baseline"><span class="score">${sc[p]}</span><span class="sub">/100</span>${prev ? deltaHTML(sc[p], prev[p]) : ''}</div>
        <div class="stack" style="gap:8px">
          ${Object.entries(sc.parts[p]).map(([k, val]) => `<div class="comp"><span>${compLabels[k]}</span><div class="meter"><i style="width:${Math.round(val * 100)}%;background:var(--${p})"></i></div><span>${Math.round(val * 100)}</span></div>`).join('')}
        </div>
      </section>`).join('')}

    <section class="card c-7">
      <div class="card-h"><h2>What today did for you</h2><span class="sub">Evidence-based effects</span></div>
      <div class="effects">
        ${ach.length ? ach.map(a => `<div class="effect" style="--pc:var(--${a.pillar || 'mind'})"><div><b>${esc(a.label)}</b><p>${esc(a.effect)}</p></div></div>`).join('') : '<p class="sub">Your logged items will be explained here.</p>'}
      </div>
    </section>

    <div class="c-5 col">
    <section class="card">${nutritionCard(sc.totals)}</section>
    <section class="card">
      <div class="card-h"><h2>Today in numbers</h2></div>
      <div class="targets">
        ${numberRow('Active minutes', sc.totals.activeMin, 'min', `WHO weekly: ${weekActive(key)}/150`)}
        ${numberRow('Calories', sc.totals.meals ? Math.round(sc.totals.n.kcal) : null, 'kcal', `target ${sc.totals.targets.kcal} kcal`)}
        ${numberRow('Sleep', sc.totals.sleep, 'h', `target ${S.sleepTarget} h`)}
        ${numberRow('Deep work + study', sc.totals.deepMin, 'min', `target ${S.deepWorkTarget}`)}
        ${numberRow('Reading', sc.totals.readingMin, 'min', sc.totals.pages ? `${sc.totals.pages} pages` : `target ${S.readingTarget}`)}
        ${numberRow('Screen time', sc.totals.screen, 'h', `limit ${S.screenLimit} h`)}
      </div>
    </section>
    </div>

    <section class="card c-12">
      <div class="card-h"><h2>3 moves for ${key === today() ? 'tomorrow' : fmtDay(shiftKey(key, 1))}</h2><span class="sub">${calOK ? 'Placed in your free calendar slots' : 'Connect Google Calendar to place these in free slots'}</span></div>
      <div class="sugs">
        ${(rep.suggestions || []).map((s, i) => `
          <div class="sug">
            
            <b>${esc(s.title)}</b>
            <p>${esc(s.why)}</p>
            ${s.when ? `<span class="when">${I.cal.replace('<svg', '<svg width="14" height="14" style="vertical-align:-2px;fill:none;stroke:currentColor;stroke-width:2"')} ${esc(s.when)}</span>` : ''}
            ${calOK && s.slotIndex != null && rep.slots?.[s.slotIndex] ? `<button class="btn sm addcal" data-i="${i}">Add to calendar</button>` : ''}
          </div>`).join('')}
      </div>
    </section>
  </div>`;

  $('#regen').onclick = () => generateReport(key);
  $$('.addcal').forEach(b => b.onclick = async () => {
    const s = rep.suggestions[+b.dataset.i]; const slot = rep.slots[s.slotIndex];
    b.disabled = true;
    try { await Cal.addEvent(C.calendarToken(), { title: s.title, description: s.why, start: slot.start, minutes: s.mins || 30 }); b.textContent = 'Added ✓'; toast('Added to Google Calendar'); }
    catch (e) { b.disabled = false; toast(e.message, 4000); }
  });
}
function numberRow(label, val, unit, note) {
  return `<div class="row" style="justify-content:space-between;border-bottom:1px solid var(--line);padding-bottom:10px"><span>${label}<br><span class="sub">${note}</span></span><span class="num" style="font-size:20px;font-weight:600">${val == null ? '—' : fmtN(val)} <span class="sub">${unit}</span></span></div>`;
}
function weekActive(key) {
  const ws = weekStart(key); let total = 0;
  for (let k = ws; k <= key; k = shiftKey(k, 1)) if (state.days[k]) total += scoreOf(k).totals.activeMin;
  return total;
}

// ============================================================
// TRENDS
// ============================================================
function viewTrends(v) {
  const n = ui.range, keys = lastKeys(n), prevKeys = lastKeys(n, shiftKey(today(), -n));
  const scs = keys.map(k => hasLog(k) ? scoreOf(k) : null);
  const prevS = prevKeys.map(k => hasLog(k) ? scoreOf(k) : null);
  const labels = keys.map(k => n <= 7 ? weekday(k) : shortDay(k));
  const logged = scs.filter(Boolean).length;
  const series = p => scs.map(s => s ? s[p] : null);
  const tot = f => scs.map(s => s ? f(s.totals) : null);
  const mean = (arr, p) => avg(arr.map(s => s?.[p] ?? null));
  const activeWeek = weekActive(today());

  v.innerHTML = `
  <div class="row"><div class="seg" role="group" aria-label="Range">${[7, 30, 90].map(r => `<button data-range="${r}" aria-pressed="${n === r}">${r} days</button>`).join('')}</div>
    <span class="spacer"></span><span class="sub">${logged} of ${n} days logged</span></div>

  <section class="card">
    <div class="kpis">
      ${kpi('Avg overall', mean(scs, 'overall'), mean(prevS, 'overall'), '')}
      ${kpi('Avg sleep', avg(tot(t => t.sleep)), avg(prevS.map(s => s?.totals.sleep ?? null)), ' h', true)}
      ${kpi('Avg protein', avg(tot(t => t.meals ? t.protein : null)), avg(prevS.map(s => s?.totals.meals ? s.totals.protein : null)), ' g')}
      ${kpi('Avg calories', avg(tot(t => t.meals ? t.n.kcal : null)), avg(prevS.map(s => s?.totals.meals ? s.totals.n.kcal : null)), ' kcal')}
      <div class="kpi"><span class="eyebrow">Active this week</span><span class="v">${activeWeek}<span class="sub"> / 150 min</span></span>
        <div class="meter"><i style="width:${Math.min(100, activeWeek / 1.5)}%;background:var(--body)"></i></div></div>
    </div>
  </section>

  <div class="grid">
    <section class="card c-8">
      <div class="card-h"><h2>Body, Brain, Mind</h2><div class="row" style="gap:14px">${PILLARS.map(([p, nm]) => `<span class="sub"><span class="legend-dot" style="background:var(--${p})"></span> ${nm}</span>`).join('')}</div></div>
      <div class="chart-box lg"><canvas id="chPillars"></canvas></div>
    </section>
    <section class="card c-4">
      <div class="card-h"><h2>Balance</h2><span class="sub">vs previous ${n} days</span></div>
      <div class="chart-box lg"><canvas id="chRadar"></canvas></div>
    </section>
    <section class="card c-6">
      <div class="card-h"><h2>Protein</h2><span class="sub">target ${Math.round(S.weightKg * S.proteinPerKg)} g/day</span></div>
      <div class="chart-box"><canvas id="chProtein"></canvas></div>
    </section>
    <section class="card c-6">
      <div class="card-h"><h2>Calories</h2><span class="sub">target ${dailyTargets(S).kcal} kcal/day</span></div>
      <div class="chart-box"><canvas id="chKcal"></canvas></div>
    </section>
    <section class="card c-6">
      <div class="card-h"><h2>Protein, carbs and fat</h2><span class="sub">grams per day</span></div>
      <div class="chart-box"><canvas id="chMacros"></canvas></div>
    </section>
    <section class="card c-6">
      <div class="card-h"><h2>Vitamins, minerals and fibre</h2><span class="sub">average % of daily need on logged days</span></div>
      <div class="micros big">${(() => {
        const days = scs.filter(x => x && x.totals.meals);
        return MICROS.map(k => { const d = nutr(k); const T = dailyTargets(S); const pct = days.length ? Math.round(days.reduce((a, x) => a + x.totals.n[k], 0) / days.length / T[k] * 100) : 0;
          return `<div class="micro ${pct >= 100 ? 'met' : ''}"><div class="t-top"><b>${d.label}</b><span>${days.length ? pct + '%' : '—'}</span></div><div class="meter"><i style="width:${Math.min(100, pct)}%"></i></div></div>`; }).join('') + (days.length ? '' : '<p class="sub">Log meals to see how your diet covers each nutrient.</p>');
      })()}</div>
    </section>
    <section class="card c-6">
      <div class="card-h"><h2>Sleep</h2><span class="sub">target ${S.sleepTarget} h</span></div>
      <div class="chart-box"><canvas id="chSleep"></canvas></div>
    </section>
    <section class="card c-6">
      <div class="card-h"><h2>Where your minutes went</h2></div>
      <div class="chart-box"><canvas id="chMinutes"></canvas></div>
    </section>
    <section class="card c-6">
      <div class="card-h"><h2>Mood & energy</h2><span class="sub">1–5 scale</span></div>
      <div class="chart-box"><canvas id="chMood"></canvas></div>
    </section>
    <section class="card c-12">
      <div class="card-h"><h2>Habit consistency</h2><span class="sub">last 12 weeks</span></div>
      <div id="heats"></div>
    </section>
  </div>`;

  $$('[data-range]').forEach(b => b.onclick = () => { ui.range = +b.dataset.range; render(); });
  const P = { body: color('body'), brain: color('brain'), mind: color('mind'), accent: color('accent'), muted: color('muted') };
  const draw = () => {
    if (!window.Chart) return setTimeout(draw, 120);
    lines($('#chPillars'), labels, PILLARS.map(([p, nm]) => ({ name: nm, data: series(p), color: P[p], fill: p === 'body' && n <= 30 })), { max: 100 });
    radar($('#chRadar'), ['Exercise', 'Protein', 'Diet', 'Sleep', 'Deep work', 'Reading', 'Skills', 'Mood', 'Meditation'], [
      { name: `Last ${n} days`, data: radarData(scs), color: P.accent },
      { name: 'Before', data: radarData(prevS), color: P.muted, dash: [4, 4] }
    ]);
    barsWithTarget($('#chProtein'), labels, tot(t => t.meals ? t.protein : null), Math.round(S.weightKg * S.proteinPerKg), P.body, 'g');
    barsWithTarget($('#chKcal'), labels, tot(t => t.meals ? Math.round(t.n.kcal) : null), dailyTargets(S).kcal, color('carbs'), '');
    stacked($('#chMacros'), labels, [
      { name: 'Protein', data: tot(t => t.meals ? Math.round(t.n.p) : null), color: color('protein') },
      { name: 'Carbs', data: tot(t => t.meals ? Math.round(t.n.c) : null), color: color('carbs') },
      { name: 'Fat', data: tot(t => t.meals ? Math.round(t.n.f) : null), color: color('fat') }
    ], 'g');
    barsWithTarget($('#chSleep'), labels, tot(t => t.sleep), S.sleepTarget, P.brain, 'h');
    stacked($('#chMinutes'), labels, [
      { name: 'Exercise', data: tot(t => t.rawExerciseMin), color: P.body },
      { name: 'Deep work', data: tot(t => t.deepMin), color: P.brain },
      { name: 'Reading', data: tot(t => t.readingMin), color: color('warn') },
      { name: 'Meditation', data: tot(t => t.skills.meditation), color: P.mind }
    ]);
    lines($('#chMood'), labels, [{ name: 'Mood', data: tot(t => t.mood), color: P.mind, fill: true }, { name: 'Energy', data: tot(t => t.energy), color: P.body }], { max: 5 });
  };
  draw();

  // Heatmaps: 12 weeks, starting on a Monday.
  const end = today(); let start = weekStart(shiftKey(end, -83));
  const hk = []; for (let k = start; k <= end; k = shiftKey(k, 1)) hk.push(k);
  const habits = [
    ['Exercise', t => t.activeMin >= S.exerciseTarget ? 1 : t.activeMin / S.exerciseTarget, 'body'],
    ['Sunlight', t => t.sunMin > 0 ? 1 : 0, 'mind'],
    ['Protein target', t => t.protein / t.proteinTarget, 'body'],
    ['7+ h sleep', t => (t.sleep || 0) >= 7 ? 1 : 0, 'brain'],
    ['Deep work', t => t.deepMin / S.deepWorkTarget, 'brain'],
    ['Reading', t => t.readingMin / S.readingTarget, 'brain'],
    ...S.skills.map(k => [skillName(k), t => t.skills[k] > 0 ? 1 : 0, k === 'meditation' ? 'mind' : 'brain'])
  ];
  const cache = {}; const T = k => (cache[k] ??= state.days[k] ? scoreOf(k).totals : null);
  $('#heats').innerHTML = habits.map(([name, f, p]) => {
    const st = streak(state.days, d => { const t = score(d, S).totals; return f(t) >= 1; }, today());
    return `<div class="heat-row"><span class="name">${name}</span><div class="heat-wrap">${heatmap(hk, k => { const t = T(k); return t ? Math.min(1, f(t) || 0) : 0; }, color(p))}</div><span class="streak">🔥 ${st} day${st === 1 ? '' : 's'}</span></div>`;
  }).join('');
}
function radarData(arr) {
  const s = arr.filter(Boolean);
  if (!s.length) return [0, 0, 0, 0, 0, 0, 0, 0, 0];
  const m = f => Math.round(s.reduce((a, x) => a + f(x), 0) / s.length * 100);
  return [m(x => x.parts.body.exercise), m(x => x.parts.body.protein), m(x => x.parts.body.nutrition || 0), m(x => x.parts.body.sleep), m(x => x.parts.brain.deepwork), m(x => x.parts.brain.reading), m(x => x.parts.brain.skills), m(x => x.parts.mind.moodEnergy), m(x => x.parts.mind.meditation)];
}
function kpi(label, val, prev, unit, decimals) {
  const d = val != null && prev != null ? val - prev : null;
  return `<div class="kpi"><span class="eyebrow">${label}</span><span class="v">${val ?? '—'}<span class="sub">${val != null ? unit : ''}</span></span>
    <span class="sub">${d == null ? 'no earlier data' : `<span class="delta ${d > 0 ? 'up' : d < 0 ? 'down' : 'flat'}">${d > 0 ? '▲' : d < 0 ? '▼' : '•'} ${Math.abs(d)}${unit}</span> vs before`}</span></div>`;
}

// ============================================================
// PLAN
// ============================================================
async function loadCal(dayKey) {
  const tok = C.calendarToken(); if (!tok) return null;
  if (ui.cal[dayKey]?.loaded) return ui.cal[dayKey];
  ui.cal[dayKey] = { loading: true };
  try {
    const [fs, evs] = await Promise.all([Cal.freeSlots(tok, dayKey, S.dayStart, S.dayEnd, 20), Cal.listEvents(tok, dayKey)]);
    ui.cal[dayKey] = { loaded: true, slots: fs.slots, events: evs };
  } catch (e) { ui.cal[dayKey] = { loaded: true, error: e.message, slots: [], events: [] }; }
  return ui.cal[dayKey];
}

function viewPlan(v) {
  const dayKey = ui.planDay === 'today' ? today() : shiftKey(today(), 1);
  const tok = C.calendarToken();
  const yRep = getDay(shiftKey(dayKey, -1)).report;
  const planned = yRep?.suggestions || localSuggestions(scoreOf(shiftKey(dayKey, -1)), S, []);
  const cal = ui.cal[dayKey];
  if (tok && !cal) loadCal(dayKey).then(() => ui.view === 'plan' && render());

  const agenda = () => {
    if (!tok) return `<div class="callout">Connect Google Calendar to see free slots. ${C.cloudReady() ? '' : 'First set up sign-in in Settings → Sync & friends.'}</div>
      <div class="row" style="margin-top:12px"><button class="btn primary" id="calConnect">${I.cal} Connect Google Calendar</button></div>`;
    if (!cal || cal.loading) return '<div class="stack"><div class="skeleton"></div><div class="skeleton" style="width:70%"></div><div class="skeleton" style="width:85%"></div></div>';
    if (cal.error) return `<div class="callout">${esc(cal.error)}</div><div class="row" style="margin-top:12px"><button class="btn" id="calConnect">Reconnect calendar</button></div>`;
    const items = [
      ...cal.events.map(e => ({ s: e.start, e: e.end, busy: true, title: e.title })),
      ...cal.slots.map((s, i) => ({ s: s.start, e: s.end, busy: false, i, minutes: s.minutes }))
    ].sort((a, b) => new Date(a.s) - new Date(b.s));
    if (!items.length) return '<p class="sub">No time left in your day window.</p>';
    const ideaFor = mins => planned.find(p => p.mins && p.mins <= mins && !p._used);
    return `<div class="agenda">${items.map(it => {
      const t = `${timeOf(it.s)}–${timeOf(it.e)}`;
      if (it.busy) return `<div class="slot busy"><span class="t">${t}</span><span class="what">${esc(it.title)}</span><span></span></div>`;
      const idea = ideaFor(it.minutes); if (idea) idea._used = true;
      return `<div class="slot free"><span class="t">${t} · ${it.minutes} min free</span><span class="what">${idea ? `<b>${esc(idea.title)}</b>` : '<span class="sub">Free</span>'}</span>
        ${idea ? `<button class="btn sm planadd" data-start="${it.s}" data-mins="${idea.mins}" data-title="${esc(idea.title)}">Add</button>` : '<span></span>'}</div>`;
    }).join('')}</div>`;
  };

  v.innerHTML = `
  <div class="row"><div class="seg" role="group" aria-label="Day">${['today', 'tomorrow'].map(d => `<button data-plan="${d}" aria-pressed="${ui.planDay === d}">${d[0].toUpperCase() + d.slice(1)}</button>`).join('')}</div>
    <span class="spacer"></span>${tok ? '<button class="btn sm" id="calRefresh">Refresh calendar</button>' : ''}</div>
  <div class="grid">
    <section class="card c-5">
      <div class="card-h"><h2>Focus for ${ui.planDay}</h2><span class="sub">From ${fmtDay(shiftKey(dayKey, -1)).toLowerCase()}’s report</span></div>
      <div class="stack">
        ${planned.map((s, i) => `<div class="sug"><b>${esc(s.title)}</b><p>${esc(s.why)}</p></div>`).join('')}
      </div>
    </section>
    <section class="card c-7">
      <div class="card-h"><h2>${ui.planDay === 'today' ? 'Rest of today' : 'Tomorrow'}</h2><span class="sub">${esc(S.dayStart)}–${esc(S.dayEnd)} window</span></div>
      ${agenda()}
    </section>
    <section class="card c-12">
      <div class="card-h"><h2>Why these targets</h2><span class="sub">The evidence Jarvis coaches from</span></div>
      <div class="effects">${Object.values(GUIDELINES).map(g => `<div class="effect" style="--pc:var(--accent)"><div><b>${esc(g.source)}</b><p>${esc(g.text)}</p></div></div>`).join('')}</div>
    </section>
  </div>`;

  $$('[data-plan]').forEach(b => b.onclick = () => { ui.planDay = b.dataset.plan; render(); });
  $('#calRefresh')?.addEventListener('click', () => { delete ui.cal[dayKey]; render(); });
  $('#calConnect')?.addEventListener('click', connectCalendar);
  $$('.planadd').forEach(b => b.onclick = async () => {
    b.disabled = true;
    try { await Cal.addEvent(C.calendarToken(), { title: b.dataset.title, start: b.dataset.start, minutes: +b.dataset.mins || 30 }); b.textContent = 'Added ✓'; delete ui.cal[dayKey]; toast('Added to Google Calendar'); }
    catch (e) { b.disabled = false; toast(e.message, 4000); }
  });
}

async function connectCalendar() {
  if (!C.cloudReady()) { go('settings'); setTimeout(() => $('#sec-cloud')?.scrollIntoView({ behavior: 'smooth' }), 50); toast('Set up Google sign-in first'); return; }
  try { await C.signIn(true); ui.cal = {}; toast('Calendar connected'); render(); }
  catch (e) { toast(authError(e), 5000); }
}
function authError(e) {
  if (e.code === 'auth/unauthorized-domain') return `Add ${location.hostname} under Firebase → Authentication → Settings → Authorized domains.`;
  if (e.code === 'auth/popup-closed-by-user') return 'Sign-in window closed.';
  return e.message || 'Sign-in failed';
}

// ============================================================
// FRIENDS
// ============================================================
async function loadFriends() {
  const me = C.currentUser(); if (!me) return;
  ui.friends = { loading: true };
  try {
    const profile = await C.ensureProfile(S.name);
    ui.profile = profile;
    const from = shiftKey(today(), -27);
    const [shared, ...mine] = await Promise.all([C.sharedWithMe(), ...profile.friends.map(f => C.getProfile(f))]);
    const people = new Map();
    for (const p of shared) people.set(p.uid, { ...p, sharesWithMe: true, iShare: profile.friends.includes(p.uid) });
    for (const p of mine.filter(Boolean)) if (!people.has(p.uid)) people.set(p.uid, { ...p, sharesWithMe: false, iShare: true });
    for (const p of people.values()) if (p.sharesWithMe) { try { p.scores = await C.friendScores(p.uid, from); } catch { p.scores = {}; p.sharesWithMe = false; } }
    ui.friends = { list: [...people.values()] };
    if (!ui.friend && ui.friends.list.some(p => p.sharesWithMe)) ui.friend = ui.friends.list.find(p => p.sharesWithMe).uid;
  } catch (e) { ui.friends = { error: e.message }; }
}

function viewFriends(v) {
  if (!C.cloudReady()) {
    v.innerHTML = `<section class="card"><div class="empty">${I.friends}<b>Grow together with friends</b><span>Share a 6-letter code and compare Body, Brain and Mind scores every week. Only scores and totals are shared, never your log text.</span>
      <button class="btn primary" id="toSetup" style="margin-top:8px">Set up sync & friends</button></div></section>`;
    $('#toSetup').onclick = () => { go('settings'); setTimeout(() => $('#sec-cloud')?.scrollIntoView({ behavior: 'smooth' }), 50); };
    return;
  }
  if (!C.currentUser()) {
    v.innerHTML = `<section class="card"><div class="empty">${I.friends}<b>Sign in to see friends</b><span>Use the same Google account on your phone and laptop.</span><button class="btn primary" id="signin" style="margin-top:8px">Sign in with Google</button></div></section>`;
    $('#signin').onclick = async () => { try { await C.signIn(true); } catch (e) { toast(authError(e), 5000); } };
    return;
  }
  if (!ui.friends) { loadFriends().then(() => ui.view === 'friends' && render()); }
  const F = ui.friends || { loading: true };
  if (F.loading) { v.innerHTML = `<section class="card"><div class="stack"><div class="skeleton"></div><div class="skeleton" style="width:60%"></div></div></section>`; return; }
  if (F.error) { v.innerHTML = `<section class="card"><div class="callout">Couldn’t load friends: ${esc(F.error)}. Check the Firestore rules in the README.</div></section>`; return; }

  const wk = weekStart(today()); const wkKeys = []; for (let k = wk; k <= today(); k = shiftKey(k, 1)) wkKeys.push(k);
  const myWeek = wkKeys.map(k => hasLog(k) ? publicScore(k) : null);
  const summary = (arr) => ({ body: avg(arr.map(x => x?.body ?? null)), brain: avg(arr.map(x => x?.brain ?? null)), mind: avg(arr.map(x => x?.mind ?? null)), overall: avg(arr.map(x => x?.overall ?? null)), days: arr.filter(Boolean).length });
  const meRow = { uid: 'me', name: `${S.name} (you)`, photo: C.currentUser().photoURL, ...summary(myWeek), me: true };
  const rows = [meRow, ...F.list.filter(p => p.sharesWithMe).map(p => ({ ...p, ...summary(wkKeys.map(k => p.scores?.[k]?.logged ? p.scores[k] : null)) }))]
    .sort((a, b) => (b.overall ?? -1) - (a.overall ?? -1));
  const pending = F.list.filter(p => !p.sharesWithMe && p.iShare);
  const addBack = F.list.filter(p => p.sharesWithMe && !p.iShare);
  const fr = F.list.find(p => p.uid === ui.friend && p.sharesWithMe);

  v.innerHTML = `
  <div class="grid">
    <section class="card c-5">
      <div class="card-h"><h2>Your friend code</h2></div>
      <div class="code-box"><span class="code">${esc(ui.profile?.code || '······')}</span><span class="spacer"></span><button class="btn sm" id="copyCode">${I.copy} Copy</button></div>
      <p class="sub" style="margin:12px 0">Send this to a friend. When you both add each other’s code, you see each other’s daily scores. Log text stays private.</p>
      <div class="row"><input class="input" id="friendCode" placeholder="Friend’s code, e.g. K7Q2MX" maxlength="6" style="flex:1;min-width:140px;text-transform:uppercase;font-family:var(--font-mono);letter-spacing:.15em"><button class="btn primary" id="addFriend">Add</button></div>
      ${addBack.length ? `<hr class="sep" style="margin:16px 0"><span class="eyebrow">Shared with you</span>${addBack.map(p => `<div class="row" style="margin-top:8px"><b>${esc(p.name)}</b><span class="sub">added your code</span><span class="spacer"></span><button class="btn sm primary addback" data-uid="${p.uid}">Share back</button></div>`).join('')}` : ''}
      ${pending.length ? `<hr class="sep" style="margin:16px 0"><span class="eyebrow">Waiting for them</span>${pending.map(p => `<div class="row" style="margin-top:8px"><b>${esc(p.name)}</b><span class="sub">needs to add your code</span><span class="spacer"></span><button class="btn sm ghost rm" data-uid="${p.uid}">Remove</button></div>`).join('')}` : ''}
    </section>

    <section class="card c-7">
      <div class="card-h"><h2>This week’s board</h2><span class="sub">Average daily scores since Monday</span></div>
      <div class="board-head"><span>#</span><span></span><span>Name</span><span>Body</span><span>Brain</span><span>Mind</span><span>Total</span></div>
      <div class="board" style="margin-top:6px">
        ${rows.map((r, i) => `<div class="person ${r.me ? 'me' : ''}" ${r.me ? '' : `data-pick="${r.uid}" role="button" tabindex="0"`}>
          <span class="rank">${i + 1}</span><span class="pic" style="${r.photo ? `background-image:url('${esc(r.photo)}')` : ''}">${r.photo ? '' : esc((r.name || '?')[0])}</span>
          <span class="nm">${esc(r.name)}<br><span class="sub">${r.days} day${r.days === 1 ? '' : 's'} logged</span></span>
          <span class="s" style="color:var(--body)">${r.body ?? '—'}</span><span class="s" style="color:var(--brain)">${r.brain ?? '—'}</span><span class="s" style="color:var(--mind)">${r.mind ?? '—'}</span><span class="tot">${r.overall ?? '—'}</span></div>`).join('')}
      </div>
      ${rows.length === 1 ? '<p class="sub" style="margin-top:12px">Add a friend to start comparing.</p>' : ''}
    </section>

    ${fr ? compareCard(fr) : ''}
  </div>`;

  $('#copyCode').onclick = () => navigator.clipboard?.writeText(ui.profile.code).then(() => toast('Code copied'), () => toast(ui.profile.code));
  $('#addFriend').onclick = async () => {
    const code = $('#friendCode').value;
    if (code.trim().length !== 6) return toast('Codes are 6 letters');
    try { await C.addFriendByCode(code); toast('Added. You now share your scores with them.'); ui.friends = null; render(); }
    catch (e) { toast(e.message, 4000); }
  };
  $$('.addback').forEach(b => b.onclick = async () => { await C.addFriendByCode((F.list.find(p => p.uid === b.dataset.uid)).code); ui.friends = null; render(); });
  $$('.rm').forEach(b => b.onclick = async () => { await C.removeFriend(b.dataset.uid); ui.friends = null; render(); });
  $$('[data-pick]').forEach(el => { const f = () => { ui.friend = el.dataset.pick; render(); }; el.onclick = f; el.onkeydown = e => e.key === 'Enter' && f(); });
  if (fr) drawCompare(fr);
}

function compareCard(fr) {
  const keys = lastKeys(14);
  const mine = keys.map(k => hasLog(k) ? scoreOf(k) : null), theirs = keys.map(k => fr.scores?.[k]?.logged ? fr.scores[k] : null);
  const wins = { me: 0, them: 0 };
  keys.forEach((k, i) => { if (mine[i] && theirs[i]) { if (mine[i].overall > theirs[i].overall) wins.me++; else if (theirs[i].overall > mine[i].overall) wins.them++; } });
  const m = p => avg(mine.map(x => x?.[p] ?? null)), t = p => avg(theirs.map(x => x?.[p] ?? null));
  const tot = (arr, f) => arr.reduce((a, x) => a + (x ? f(x) : 0), 0);
  return `<section class="card c-12">
    <div class="card-h"><h2>You vs ${esc(fr.name)} · last 14 days</h2><span class="sub">Head-to-head days: <b class="num">${wins.me}</b> – <b class="num">${wins.them}</b></span></div>
    <div class="chart-box"><canvas id="chVs"></canvas></div>
    <div class="vs" style="margin-top:16px">
      ${PILLARS.map(([p, nm]) => `<div class="vs-cell"><span class="eyebrow">${nm}</span><div class="bars">
        <div><div class="lab"><span>You</span><span class="num">${m(p) ?? '—'}</span></div><div class="meter"><i style="width:${m(p) || 0}%;background:var(--${p})"></i></div></div>
        <div><div class="lab"><span>${esc(fr.name)}</span><span class="num">${t(p) ?? '—'}</span></div><div class="meter"><i style="width:${t(p) || 0}%;background:var(--${p});opacity:.5"></i></div></div>
      </div></div>`).join('')}
    </div>
    <div class="kpis" style="margin-top:16px">
      ${[['Active min', x => x.totals ? x.totals.activeMin : x.activeMin], ['Deep work min', x => x.totals ? x.totals.deepMin : x.deepMin], ['Reading min', x => x.totals ? x.totals.readingMin : x.readingMin], ['Days logged', () => 1]].map(([l, f]) => `
        <div class="kpi"><span class="eyebrow">${l}</span><span class="v">${Math.round(tot(mine, f))}<span class="sub"> vs ${Math.round(tot(theirs, f))}</span></span></div>`).join('')}
    </div>
  </section>`;
}
function drawCompare(fr) {
  const keys = lastKeys(14);
  const go2 = () => {
    if (!window.Chart) return setTimeout(go2, 120);
    lines($('#chVs'), keys.map(weekday), [
      { name: 'You', data: keys.map(k => hasLog(k) ? scoreOf(k).overall : null), color: color('accent'), fill: true },
      { name: fr.name, data: keys.map(k => fr.scores?.[k]?.logged ? fr.scores[k].overall : null), color: color('body'), dash: [5, 4] }
    ], { max: 100 });
  };
  go2();
}

// ============================================================
// SETTINGS
// ============================================================
function viewSettings(v) {
  const u = C.currentUser();
  const origin = location.origin;
  v.innerHTML = `
  <div class="grid">
    <section class="card c-12" id="sec-ai">
      ${G.provider(S) === 'claude' ? '<div class="callout" style="margin-bottom:14px">This test link runs on Claude’s hosting, which can’t reach Google’s servers, so your coach runs on Claude here. Gemini takes over when Jarvis is hosted on Netlify or GitHub Pages (see README).</div>' : ''}
      <div class="card-h"><h2>AI brain · Gemini</h2><span class="status ${S.geminiKey ? 'ok' : ''}">${S.geminiKey ? `● Connected${S.geminiModel ? ` · ${esc(S.geminiModel)}` : ''}` : '○ Not connected — Jarvis uses its built-in coach'}</span></div>
      <div class="grid" style="gap:20px">
        <div class="c-6">
          <span class="eyebrow">Get your free API key (2 minutes)</span>
          <ol class="steps" style="margin-top:8px">
            <li>Open <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener"><b>aistudio.google.com/apikey</b></a> and sign in with your Google account.</li>
            <li>Accept the terms if asked, then click <b>Create API key</b>. Pick any project (or “Create key in new project”).</li>
            <li>Copy the key. It starts with <code>AIza</code>.</li>
            <li>Paste it on the right and press <b>Test & save</b>. Jarvis picks the newest Flash model automatically.</li>
          </ol>
          <p class="sub" style="margin-top:10px">The free tier is plenty for daily logs. Your key is stored on your device and in your private synced settings only. Treat it like a password.</p>
        </div>
        <div class="c-6 stack">
          <label class="field">API key<input class="input mono" id="gKey" type="password" autocomplete="off" placeholder="AIza…" value="${esc(S.geminiKey)}"></label>
          <div class="row"><button class="btn primary" id="gTest">Test & save</button>${S.geminiKey ? '<button class="btn ghost" id="gClear">Remove key</button>' : ''}<span class="status" id="gStatus"></span></div>
          <label class="field">Model<select class="select" id="gModel"><option value="${esc(S.geminiModel)}">${esc(S.geminiModel || 'Auto (test key to load list)')}</option></select></label>
        </div>
      </div>
    </section>

    <section class="card c-12" id="sec-profile">
      <div class="card-h"><h2>Profile & targets</h2><span class="sub">Defaults follow WHO, ISSN and sleep-science guidance</span></div>
      <div class="fields">
        ${field('name', 'Name', 'text')}
        ${field('weightKg', 'Body weight (kg)', 'number', 1)}
        ${field('proteinPerKg', 'Protein (g per kg)', 'number', 0.1)}
        ${field('calorieTarget', 'Calories (kcal/day)', 'number', 50)}
        ${field('sleepTarget', 'Sleep target (h)', 'number', 0.5)}
        ${field('waterTarget', 'Water target (L)', 'number', 0.25)}
        ${field('exerciseTarget', 'Exercise (min/day)', 'number', 5)}
        ${field('deepWorkTarget', 'Deep work (min/day)', 'number', 15)}
        ${field('readingTarget', 'Reading (min/day)', 'number', 5)}
        ${field('meditationTarget', 'Meditation (min/day)', 'number', 1)}
        ${field('screenLimit', 'Leisure screen limit (h)', 'number', 0.5)}
      </div>
      <p class="sub" style="margin-top:12px">Daily food targets: ${(() => { const T = dailyTargets(S); return `<b>${T.kcal} kcal</b>, protein <b>${T.p} g</b>, carbs <b>${T.c} g</b>, fat <b>${T.f} g</b>, fibre <b>${T.fib} g</b>, iron <b>${T.fe} mg</b>, calcium <b>${T.ca} mg</b>, vitamin C <b>${T.vc} mg</b>, B12 <b>${T.b12} µg</b>`; })()}.<br>Protein: ISSN suggests 1.4–2.0 g/kg for active people. Calories: ICMR-NIN 2020 gives about 2100 (desk-bound) to 2700 (moderately active) for a 65 kg man. Carbs 55% and fat 25% of calories; micronutrients are ICMR-NIN 2020 RDAs for adult men.</p>
      <hr class="sep" style="margin:14px 0">
      <span class="eyebrow">Skills & habits tracked</span>
      <div class="row" style="margin-top:10px">${Object.entries(SKILL_LABELS).map(([k, l]) => `<button class="btn sm ${S.skills.includes(k) ? 'primary' : ''} sk" data-k="${k}">${S.skills.includes(k) ? '✓ ' : ''}${l}</button>`).join('')}</div>
    </section>

    <section class="card c-12" id="sec-cloud">
      <div class="card-h"><h2>Sync, friends & Google Calendar</h2><span class="status ${u ? 'ok' : ''}">${u ? `● Signed in as ${esc(u.email)}` : C.cloudReady() ? '○ Ready — sign in below' : '○ Not set up'}</span></div>
      <div class="grid" style="gap:20px">
        <div class="c-6">
          <span class="eyebrow">One-time setup (about 10 minutes, free)</span>
          <ol class="steps" style="margin-top:8px">
            <li>Go to <a href="https://console.firebase.google.com" target="_blank" rel="noopener"><b>console.firebase.google.com</b></a> → <b>Create a project</b> named <code>jarvis</code> (Analytics off).</li>
            <li><b>Build → Authentication → Get started → Google</b> → Enable → Save.</li>
            <li>Authentication → <b>Settings → Authorized domains</b> → add <code>${esc(location.hostname)}</code>.</li>
            <li><b>Build → Firestore Database → Create database</b> (production mode, region <code>asia-south1</code> Mumbai). In the <b>Rules</b> tab paste the rules from <code>firestore.rules</code> in the project and Publish.</li>
            <li>Project settings (gear) → <b>Your apps → Web (&lt;/&gt;)</b> → register “Jarvis” → copy the <code>firebaseConfig</code> block and paste it on the right.</li>
            <li>For Calendar: open <a href="https://console.cloud.google.com/apis/library/calendar-json.googleapis.com" target="_blank" rel="noopener"><b>Google Calendar API</b></a> for the same project → <b>Enable</b>. Then <b>Google Auth Platform → Audience</b> → add your Gmail (and your friend’s, if they’ll use Calendar) as test users.</li>
          </ol>
          <p class="sub" style="margin-top:10px">This site: <code class="inline">${esc(origin)}</code></p>
        </div>
        <div class="c-6 stack">
          <label class="field">Firebase config<textarea class="input mono" id="fbCfg" rows="7" placeholder="const firebaseConfig = {&#10;  apiKey: &quot;…&quot;,&#10;  authDomain: &quot;jarvis-xxxx.firebaseapp.com&quot;,&#10;  projectId: &quot;jarvis-xxxx&quot;,&#10;  …&#10;};">${esc(S.firebaseConfig)}</textarea></label>
          <div class="row">
            <button class="btn ${C.cloudReady() ? '' : 'primary'}" id="fbSave">Save config</button>
            ${C.cloudReady() && !u ? `<button class="btn primary" id="fbSign">Sign in with Google</button>` : ''}
            ${u ? `<button class="btn" id="calBtn">${C.calendarToken() ? 'Reconnect calendar' : 'Connect calendar'}</button><button class="btn ghost" id="fbOut">Sign out</button>` : ''}
          </div>
          <label class="row" style="gap:8px;font-size:14px"><input type="checkbox" id="shareScores" ${S.shareScores ? 'checked' : ''}> Share my daily scores with friends I add</label>
        </div>
      </div>
    </section>

    <section class="card c-6" id="sec-rem">
      <div class="card-h"><h2>Reminders</h2></div>
      <div class="fields">
        ${field('morningTime', 'Morning plan', 'time')}
        ${field('nightTime', 'Night log', 'time')}
        ${field('dayStart', 'Day starts', 'time')}
        ${field('dayEnd', 'Day ends', 'time')}
      </div>
      <p class="sub" style="margin:12px 0">Best on phone: Jarvis adds two daily repeating events to Google Calendar, so your phone notifies you even when the app is closed.</p>
      <div class="row">
        <button class="btn primary" id="remCal" ${u ? '' : 'disabled'}>${I.cal} ${S.reminderIds?.morning ? 'Update' : 'Add'} calendar reminders</button>
        <button class="btn" id="remLocal">${S.notifications ? 'In-app alerts on ✓' : 'Turn on in-app alerts'}</button>
      </div>
      ${u ? '' : '<p class="sub" style="margin-top:8px">Sign in above to use calendar reminders.</p>'}
    </section>

    <section class="card c-6">
      <div class="card-h"><h2>Data</h2></div>
      <p class="sub" style="margin:0 0 12px">${Object.keys(state.days).filter(hasLog).length} days logged on this device. Back up any time.</p>
      <div class="row">
        <button class="btn" id="exp">Export backup</button>
        <label class="btn" for="imp">Import backup</label><input type="file" id="imp" accept="application/json" hidden>
      </div>
      <hr class="sep" style="margin:16px 0">
      <span class="eyebrow">Install on your phone</span>
      <p class="sub" style="margin:6px 0 0">Open this site in Chrome on your phone → ⋮ menu → <b>Add to Home screen</b>. Jarvis opens full-screen like an app.</p>
    </section>
  </div>`;

  // Fields
  $$('[data-set]').forEach(inp => inp.onchange = () => {
    const k = inp.dataset.set; S[k] = inp.type === 'number' ? +inp.value : inp.value; saveSettings();
    if (k !== 'name') toast('Saved');
    if (['weightKg', 'proteinPerKg', 'calorieTarget'].includes(k)) render();
  });
  $$('.sk').forEach(b => b.onclick = () => { const k = b.dataset.k; S.skills = S.skills.includes(k) ? S.skills.filter(x => x !== k) : [...S.skills, k]; saveSettings(); render(); });

  // Gemini
  $('#gTest').onclick = async () => {
    const key = $('#gKey').value.trim(); const st = $('#gStatus');
    if (!key) { st.className = 'status err'; st.textContent = 'Paste a key first'; return; }
    st.className = 'status'; st.innerHTML = '<span class="spin"></span> Testing…';
    try {
      const { names, best } = await G.testKey({ geminiKey: key });
      S.geminiKey = key; S.geminiModel = names.includes(S.geminiModel) ? S.geminiModel : best; saveSettings();
      $('#gModel').innerHTML = names.map(n => `<option ${n === S.geminiModel ? 'selected' : ''}>${esc(n)}</option>`).join('');
      st.className = 'status ok'; st.textContent = `● Works · using ${S.geminiModel}`;
      renderSync();
    } catch (e) { st.className = 'status err'; st.textContent = `Key didn’t work: ${e.message.slice(0, 90)}`; }
  };
  $('#gClear')?.addEventListener('click', () => { S.geminiKey = ''; S.geminiModel = ''; saveSettings(); render(); });
  $('#gModel').onchange = e => { S.geminiModel = e.target.value; saveSettings(); toast(`Using ${S.geminiModel}`); };
  if (S.geminiKey) G.listModels(S.geminiKey).then(names => {
    const sel = $('#gModel'); if (!sel) return;
    sel.innerHTML = names.map(n => `<option ${n === S.geminiModel ? 'selected' : ''}>${esc(n)}</option>`).join('');
  }).catch(() => {});

  // Cloud
  $('#fbSave').onclick = async () => {
    const txt = $('#fbCfg').value.trim();
    if (!C.parseFirebaseConfig(txt)) { toast('That doesn’t look like a Firebase config. Copy the whole firebaseConfig block.', 4500); return; }
    S.firebaseConfig = txt; save();
    try { await startCloud(); toast('Config saved. Now sign in.'); render(); } catch (e) { toast(e.message, 4000); }
  };
  $('#fbSign')?.addEventListener('click', async () => { try { await C.signIn(true); } catch (e) { toast(authError(e), 5000); } });
  $('#calBtn')?.addEventListener('click', connectCalendar);
  $('#fbOut')?.addEventListener('click', async () => { await C.signOutCloud(); render(); });
  $('#shareScores').onchange = e => { S.shareScores = e.target.checked; saveSettings(); };

  // Reminders
  $('#remCal').onclick = async () => {
    let tok = C.calendarToken();
    if (!tok) { try { await C.signIn(true); tok = C.calendarToken(); } catch (e) { return toast(authError(e), 5000); } }
    try {
      S.reminderIds = await Cal.setReminders(tok, { morningTime: S.morningTime, nightTime: S.nightTime, appUrl: location.origin + location.pathname }, S.reminderIds || {});
      saveSettings(); toast(`Reminders set for ${S.morningTime} and ${S.nightTime} daily`); render();
    } catch (e) { toast(e.message, 5000); }
  };
  $('#remLocal').onclick = async () => {
    if (!('Notification' in window)) return toast('This browser can’t show notifications');
    if (S.notifications) { S.notifications = false; saveSettings(); return render(); }
    const p = await Notification.requestPermission();
    S.notifications = p === 'granted'; saveSettings(); render();
    toast(p === 'granted' ? 'In-app alerts on. They fire while Jarvis is open.' : 'Notifications blocked in browser settings', 4000);
  };

  // Data
  $('#exp').onclick = async () => {
    const filename = `jarvis-backup-${today()}.json`;
    const dl = window.claude?.use ? await window.claude.use('downloads').catch(() => null) : null;
    if (dl) { try { await dl.save({ filename, data: exportJSON() }); } catch {} return; }
    const blob = new Blob([exportJSON()], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `jarvis-backup-${today()}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  $('#imp').onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    try { importJSON(await f.text()); toast('Backup imported'); Object.keys(state.days).forEach(k => C.currentUser() && pushQueue.add(k)); flushPush(); render(); }
    catch (err) { toast(err.message, 4000); }
  };
}
function field(k, label, type, step) {
  return `<label class="field">${label}<input class="input ${type !== 'text' ? 'mono' : ''}" id="set-${k}" data-set="${k}" type="${type}" ${step ? `step="${step}"` : ''} value="${esc(S[k] ?? DEFAULT_SETTINGS[k])}"></label>`;
}

// ============================================================
// Cloud lifecycle
// ============================================================
async function startCloud() {
  if (!S.firebaseConfig) return false;
  return C.initCloud(S.firebaseConfig, onUser);
}
async function onUser(u) {
  ui.friends = null; ui.cal = {};
  if (!u) { render(); return; }
  try {
    const remote = await C.pullAll();
    // Push local days the cloud doesn't have (or has older copies of).
    for (const [k, d] of Object.entries(state.days)) {
      const r = remote.days[k];
      if (hasLog(k) && (!r || (d.updatedAt || 0) > (r.updatedAt || 0))) pushQueue.add(k);
    }
    mergeDays(remote.days);
    if (remote.settings) {
      const keep = { geminiKey: S.geminiKey || remote.settings.geminiKey || '', firebaseConfig: S.firebaseConfig, theme: S.theme };
      Object.assign(S, { ...remote.settings, ...keep, reminderIds: remote.settings.reminderIds || S.reminderIds });
      save(); applyTheme();
    } else C.pushSettings(S).catch(() => {});
    flushPush();
    C.watchDays(changed => { if (mergeDays(changed)) render(); });
    C.ensureProfile(S.name).then(p => { ui.profile = p; }).catch(() => {});
    toast(`Synced as ${u.displayName?.split(' ')[0] || u.email}`);
  } catch (e) { console.warn(e); toast(`Sync problem: ${e.message.slice(0, 80)}`, 4500); }
  render();
}

// ============================================================
// In-app reminders (while open)
// ============================================================
function checkReminders() {
  if (!S.notifications || !('Notification' in window) || Notification.permission !== 'granted') return;
  const now = new Date(); const hm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  state.meta.notified = state.meta.notified || {};
  const fire = async (kind, title, body) => {
    if (state.meta.notified[kind] === today()) return;
    state.meta.notified[kind] = today(); save();
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) reg.showNotification(title, { body, icon: 'icons/icon-192.png', tag: 'jarvis-' + kind });
    else new Notification(title, { body });
  };
  if (hm >= S.morningTime && hm < addMin(S.morningTime, 30)) fire('morning', 'Jarvis · Morning plan', 'Check today’s 3 moves and your free slots.');
  if (hm >= S.nightTime && hm < addMin(S.nightTime, 60)) fire('night', 'Jarvis · Log your day', 'Two minutes now → your report card.');
}
const addMin = (t, m) => { const [h, mm] = t.split(':').map(Number); const x = Math.min(1439, h * 60 + mm + m); return `${String(Math.floor(x / 60)).padStart(2, '0')}:${String(x % 60).padStart(2, '0')}`; };

// ============================================================
// Boot
// ============================================================
// One-time fix: re-count food logged before the item-level food table existed.
(() => {
  let changed = false;
  for (const d of Object.values(state.days)) for (const e of d.entries || []) {
    if (e.via === 'gemini' || e.via === 'claude' || e.quick) continue;
    if (!(e.acts || []).some(a => a.type === 'food' && !a.items && !a.edited)) continue;
    e.acts = parseLocal(e.text); d.updatedAt = Date.now(); changed = true;
  }
  for (const d of Object.values(state.days)) for (const e of d.entries || []) for (const a of e.acts || []) {
    if (a.type !== 'food' || !a.items?.length || a.items.every(it => it.n && typeof it.n.kcal === 'number')) continue;
    a.items = a.items.map(it => {
      if (it.n && typeof it.n.kcal === 'number') return it;
      const f = it.known !== false ? findFood(it.name) : null;
      if (f) { const qty = it.qty ?? (f.p ? (Number(it.protein) || 0) / f.p : 1); return { ...it, qty, unit: f.unit, n: scaleN(f, qty) }; }
      return { ...it, n: { ...zeroN(), p: Number(it.protein) || 0 } };
    });
    a.n = a.items.reduce((sum, it) => addN(sum, it.n), zeroN());
    d.updatedAt = Date.now(); changed = true;
  }
  if (changed) save();
})();
applyTheme();
const initial = location.hash.slice(1) === 'prefs' ? 'settings' : location.hash.slice(1);
if (NAV.some(n => n[0] === initial)) ui.view = initial;
window.addEventListener('hashchange', () => { const h = location.hash.slice(1) === 'prefs' ? 'settings' : location.hash.slice(1); if (h !== ui.view && NAV.some(n => n[0] === h)) go(h); });
render();
G.initClaudeAI().then(ai => { if (ai) render(); });
startCloud().catch(e => console.warn('cloud', e));
setInterval(checkReminders, 30000); checkReminders();
// Roll over at midnight if you were looking at "today".
let lastToday = today();
const rollover = () => { const t = today(); if (t !== lastToday) { if (ui.date === lastToday) ui.date = t; lastToday = t; render(); } };
setInterval(rollover, 60000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) rollover(); });
