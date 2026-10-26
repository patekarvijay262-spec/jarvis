// Google Calendar: free slots + creating events (suggestions and daily reminders).
const API = 'https://www.googleapis.com/calendar/v3';
const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';

async function call(token, path, opts = {}) {
  const res = await fetch(API + path, {
    ...opts,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(opts.headers || {}) }
  });
  if (res.status === 401) throw Object.assign(new Error('Calendar access expired. Tap “Reconnect calendar”.'), { code: 401 });
  if (!res.ok) {
    let msg = res.statusText;
    try { msg = (await res.json()).error?.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.status === 204 ? null : res.json();
}

const at = (dateKey, hhmm) => new Date(`${dateKey}T${hhmm}:00`);
const fmt = d => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

export async function freeSlots(token, dateKey, dayStart = '07:00', dayEnd = '23:00', minMinutes = 30) {
  const start = at(dateKey, dayStart), end = at(dateKey, dayEnd);
  const now = new Date();
  const from = now > start && now < end ? new Date(Math.ceil(now.getTime() / (15 * 60e3)) * 15 * 60e3) : start;
  if (from >= end) return { slots: [], events: [] };
  const fb = await call(token, '/freeBusy', {
    method: 'POST',
    body: JSON.stringify({ timeMin: from.toISOString(), timeMax: end.toISOString(), timeZone: TZ, items: [{ id: 'primary' }] })
  });
  const busy = (fb.calendars?.primary?.busy || []).map(b => ({ s: new Date(b.start), e: new Date(b.end) })).sort((a, b) => a.s - b.s);
  const slots = []; let cur = from;
  for (const b of busy) {
    if (b.s > cur && (b.s - cur) / 60e3 >= minMinutes) slots.push({ s: cur, e: b.s });
    if (b.e > cur) cur = b.e;
  }
  if ((end - cur) / 60e3 >= minMinutes) slots.push({ s: cur, e: end });
  return {
    slots: slots.map(x => ({ start: x.s.toISOString(), end: x.e.toISOString(), minutes: Math.round((x.e - x.s) / 60e3), label: `${fmt(x.s)}–${fmt(x.e)}` })),
    busy: busy.map(b => ({ start: b.s.toISOString(), end: b.e.toISOString() }))
  };
}

export async function listEvents(token, dateKey) {
  const s = at(dateKey, '00:00'), e = new Date(s.getTime() + 864e5);
  const r = await call(token, `/calendars/primary/events?singleEvents=true&orderBy=startTime&timeMin=${encodeURIComponent(s.toISOString())}&timeMax=${encodeURIComponent(e.toISOString())}&maxResults=50`);
  return (r.items || []).filter(i => i.start?.dateTime).map(i => ({ title: i.summary || 'Busy', start: i.start.dateTime, end: i.end.dateTime }));
}

export async function addEvent(token, { title, description, start, minutes }) {
  const s = new Date(start), e = new Date(s.getTime() + (minutes || 30) * 60e3);
  return call(token, '/calendars/primary/events', {
    method: 'POST',
    body: JSON.stringify({
      summary: `Jarvis · ${title}`,
      description: description || 'Suggested by Jarvis',
      start: { dateTime: s.toISOString(), timeZone: TZ },
      end: { dateTime: e.toISOString(), timeZone: TZ },
      reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 10 }] },
      colorId: '9'
    })
  });
}

// Two recurring daily events with a phone notification at start time.
export async function setReminders(token, { morningTime, nightTime, appUrl }, existing = {}) {
  const today = new Date().toLocaleDateString('en-CA');
  const make = (title, time, desc) => ({
    summary: title,
    description: `${desc}\n\nOpen Jarvis: ${appUrl}`,
    start: { dateTime: `${today}T${time}:00`, timeZone: TZ },
    end: { dateTime: `${today}T${addMin(time, 10)}:00`, timeZone: TZ },
    recurrence: ['RRULE:FREQ=DAILY'],
    reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 0 }] },
    transparency: 'transparent',
    colorId: '9'
  });
  const out = {};
  const items = {
    morning: make('☀️ Jarvis · Morning plan', morningTime, 'Check today’s plan and free slots.'),
    night: make('🌙 Jarvis · Log your day', nightTime, 'Log what you did and read your report card.')
  };
  for (const [k, body] of Object.entries(items)) {
    if (existing[k]) {
      try { await call(token, `/calendars/primary/events/${existing[k]}`, { method: 'PUT', body: JSON.stringify(body) }); out[k] = existing[k]; continue; } catch (e) { if (e.code === 401) throw e; }
    }
    const ev = await call(token, '/calendars/primary/events', { method: 'POST', body: JSON.stringify(body) });
    out[k] = ev.id;
  }
  return out;
}

function addMin(hhmm, m) {
  const [h, mm] = hhmm.split(':').map(Number);
  const t = (h * 60 + mm + m) % 1440;
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}
