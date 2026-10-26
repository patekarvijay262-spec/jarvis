// Firebase: Google sign-in, phone↔laptop sync, friends, and the Google Calendar token.
// Everything here is optional; the app runs fully offline without it.
const V = '10.12.2';
const CAL_SCOPE = 'https://www.googleapis.com/auth/calendar.events';
const FB = `https://www.gstatic.com/firebasejs/${V}`;

let fb = null;          // loaded SDK modules
let app, auth, db;
let user = null;
let listeners = [];
let unsubDays = null;

export function parseFirebaseConfig(text) {
  if (!text) return null;
  const cfg = {};
  for (const k of ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId']) {
    const m = text.match(new RegExp(`["']?${k}["']?\\s*:\\s*["']([^"']+)["']`));
    if (m) cfg[k] = m[1];
  }
  return cfg.apiKey && cfg.projectId && cfg.appId ? cfg : null;
}

export async function initCloud(configText, onUser) {
  const cfg = parseFirebaseConfig(configText);
  if (!cfg) return false;
  if (!fb) {
    const [a, b, c] = await Promise.all([
      import(`${FB}/firebase-app.js`),
      import(`${FB}/firebase-auth.js`),
      import(`${FB}/firebase-firestore.js`)
    ]);
    fb = { ...a, ...b, ...c };
  }
  if (!app) {
    app = fb.initializeApp(cfg);
    auth = fb.getAuth(app);
    db = fb.initializeFirestore(app, { localCache: fb.persistentLocalCache({ tabManager: fb.persistentMultipleTabManager() }) });
    fb.getRedirectResult(auth).then(r => r && saveCalendarToken(r)).catch(() => {});
    fb.onAuthStateChanged(auth, u => { user = u; onUser?.(u); listeners.forEach(f => f(u)); });
  }
  return true;
}

export const cloudReady = () => !!app;
export const currentUser = () => user;
export const onAuth = f => listeners.push(f);

function provider(withCalendar) {
  const p = new fb.GoogleAuthProvider();
  if (withCalendar) p.addScope(CAL_SCOPE);
  p.setCustomParameters({ prompt: 'select_account' });
  return p;
}

function saveCalendarToken(result) {
  const cred = fb.GoogleAuthProvider.credentialFromResult(result);
  if (cred?.accessToken) {
    try { localStorage.setItem('jarvis.calToken', JSON.stringify({ t: cred.accessToken, exp: Date.now() + 55 * 60 * 1000 })); } catch {}
  }
}

export async function signIn(withCalendar = true) {
  try {
    const r = await fb.signInWithPopup(auth, provider(withCalendar));
    saveCalendarToken(r);
    return r.user;
  } catch (e) {
    if (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment') {
      await fb.signInWithRedirect(auth, provider(withCalendar));
      return null;
    }
    throw e;
  }
}

export async function signOutCloud() {
  unsubDays?.(); unsubDays = null;
  try { localStorage.removeItem('jarvis.calToken'); } catch {}
  await fb.signOut(auth);
}

export function calendarToken() {
  try {
    const v = JSON.parse(localStorage.getItem('jarvis.calToken') || 'null');
    return v && v.exp > Date.now() ? v.t : null;
  } catch { return null; }
}

// ---------- Sync ----------
export async function pullAll() {
  const snap = await fb.getDocs(fb.collection(db, 'users', user.uid, 'days'));
  const out = {};
  snap.forEach(d => { out[d.id] = d.data(); });
  const settingsDoc = await fb.getDoc(fb.doc(db, 'users', user.uid));
  return { days: out, settings: settingsDoc.exists() ? settingsDoc.data().settings : null };
}

export function watchDays(onChange) {
  unsubDays?.();
  unsubDays = fb.onSnapshot(fb.collection(db, 'users', user.uid, 'days'), snap => {
    const changed = {};
    snap.docChanges().forEach(c => { if (!c.doc.metadata.hasPendingWrites) changed[c.doc.id] = c.doc.data(); });
    if (Object.keys(changed).length) onChange(changed);
  });
}

export async function pushDay(key, day, publicScore) {
  if (!user) return;
  const clean = JSON.parse(JSON.stringify(day));
  await fb.setDoc(fb.doc(db, 'users', user.uid, 'days', key), clean);
  if (publicScore) await fb.setDoc(fb.doc(db, 'scores', user.uid, 'days', key), { ...publicScore, date: key, updatedAt: Date.now() });
}

export async function pushSettings(settings) {
  if (!user) return;
  await fb.setDoc(fb.doc(db, 'users', user.uid), { settings, updatedAt: Date.now() }, { merge: true });
}

// ---------- Friends ----------
function makeCode() {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(crypto.getRandomValues(new Uint8Array(6)), b => a[b % a.length]).join('');
}

export async function ensureProfile(name) {
  const ref = fb.doc(db, 'profiles', user.uid);
  const snap = await fb.getDoc(ref);
  if (snap.exists()) {
    const p = snap.data();
    if (name && p.name !== name) await fb.updateDoc(ref, { name });
    return { ...p, name: name || p.name };
  }
  let code;
  for (let i = 0; i < 5; i++) {
    code = makeCode();
    const c = await fb.getDoc(fb.doc(db, 'codes', code));
    if (!c.exists()) break;
  }
  await fb.setDoc(fb.doc(db, 'codes', code), { uid: user.uid });
  const p = { name: name || user.displayName || 'Friend', code, friends: [], photo: user.photoURL || '', createdAt: Date.now() };
  await fb.setDoc(ref, p);
  return p;
}

export async function addFriendByCode(code) {
  code = code.trim().toUpperCase();
  const c = await fb.getDoc(fb.doc(db, 'codes', code));
  if (!c.exists()) throw new Error('No one has that code. Check the 6 letters and try again.');
  const uid = c.data().uid;
  if (uid === user.uid) throw new Error('That is your own code.');
  await fb.updateDoc(fb.doc(db, 'profiles', user.uid), { friends: fb.arrayUnion(uid) });
  return uid;
}

export async function removeFriend(uid) {
  await fb.updateDoc(fb.doc(db, 'profiles', user.uid), { friends: fb.arrayRemove(uid) });
}

export async function getProfile(uid) {
  const s = await fb.getDoc(fb.doc(db, 'profiles', uid));
  return s.exists() ? { uid, ...s.data() } : null;
}

// People who shared their scores with me (they added my code).
export async function sharedWithMe() {
  const q = fb.query(fb.collection(db, 'profiles'), fb.where('friends', 'array-contains', user.uid));
  const snap = await fb.getDocs(q);
  return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
}

export async function friendScores(uid, fromKey) {
  const q = fb.query(fb.collection(db, 'scores', uid, 'days'), fb.where('date', '>=', fromKey));
  const snap = await fb.getDocs(q);
  const out = {};
  snap.forEach(d => { out[d.id] = d.data(); });
  return out;
}
